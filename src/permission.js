import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import getPageTitle from '@/utils/get-page-title'
// 导入cookie
import { PcCookie, Key } from '@/utils/cookie'

NProgress.configure({ showSpinner: false }) // NProgress Configuration

const whiteList = ['/login', '/refresh'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)

  // determine whether the user has logged in
  const hasToken = PcCookie.get(Key.accessTokenKey)

  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      const hasGetUserInfo = PcCookie.get(Key.userInfoKey)
      // console.log(hasGetUserInfo)
      if (hasGetUserInfo) {
        if (to.path === '/login') {
          // if is logged in, redirect to the home page
          next({ path: '/' })
          NProgress.done()
        } else {
          // 从cookie中获取用户信息
          const hasGetUserInfo = PcCookie.get(Key.userInfoKey)
          if (hasGetUserInfo) {
            // 如果有用户信息，则通过用户id来获取当前用户所拥有的菜单和按钮权限
            if (store.getters.init === false) {
              // 还未查询用户权限信息，下面则触发 action 来进行查询
              store.dispatch('menu/GetUserMenu').then(() => {
                // 继续访问目标路由且不会留下history记录
                next({ ...to, replace: true })
              }).catch(error => {
                console.log(error)
                Message({ message: '获取用户权限信息失败', type: 'error' })
              })
            } else {
              // 跳转到目标路由
              next()
            }
          } else {
            // 如果没有用户信息，则没有登录，没有登录则跳转认证客户端
            // window.location.href = `${process.env.VUE_APP_AUTH_CENTER_URL}?redirectURL=${window.location.href}`
            next(`/login?redirect=${to.path}`)
          }
        }
      } else {
        try {
          // get user info
          // await store.dispatch('user/getInfo')

          next()
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
