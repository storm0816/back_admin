import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'
import { PcCookie, Key } from '@/utils/cookie'
import router from '../router'

// create an axios instance  /test
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    // 获取cookie中的token
    const accessToken = PcCookie.get(Key.accessTokenKey)
    if (accessToken) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      config.headers['Authorization'] = 'Bearer ' + accessToken
    }
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 20000) {
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  // error => {
  //   console.log('err' + error) // for debug
  //   Message({
  //     message: error.message,
  //     type: 'error',
  //     duration: 5 * 1000
  //   })
  //   return Promise.reject(error)
  // }
  error => {
    // 非401状态码，则直接提示信息
    if (error.response && error.response.status !== 401 && error.response.status !== 403) {
      Message({
        message: error.message,
        type: 'error',
        duration: 5 * 1000
      })
      return Promise.reject(error)
    }

    if (error.response && error.response.status === 403) {
      // window.location.href =
      // `/error/403`
      router.replace({ path: '/error/403' })
    }

    // 401 未认证或者访问令牌过期，未认证则要通过刷新令牌获取新的认证信息。
    // 失败，一直在请求 用户权限目录

    if (error.response && error.response.status === 401) {
      MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
        confirmButtonText: 'Re-Login',
        cancelButtonText: 'Cancel',
        type: 'warning'
      }).then(() => {
        store.dispatch('user/resetToken').then(() => {
          location.reload()
        })
      })
      // let isLock = true // 防止重复发送刷新请求
      // if (isLock && PcCookie.get(Key.refreshTokenKey)) {
      //   isLock = false // 在发送后，将此值 设置为false
      //   // 跳转到认证中心客户端，实现刷新令牌效果
      //   router.replace({ path: '/refresh' })
      // } else {
      // // 没有刷新令牌，则跳转到认证客户端进行重新认证
      //   router.replace({ path: '/login?redirect=${window.location.href}' })
      // }
    }

    return Promise.reject('令牌过期，重新认证')
  }
)

export default service
