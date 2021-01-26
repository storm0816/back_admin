import { login, logout, refreshToken } from '@/api/user'
import { removeToken } from '@/utils/auth'
import { PcCookie, Key } from '@/utils/cookie'

// 定义状态
const state = {
  userInfo: PcCookie.get(Key.userInfoKey) ? JSON.parse(PcCookie.get(Key.userInfoKey)) : null, // 用户信息对象
  accessToken: PcCookie.get(Key.accessTokenKey), // 访问令牌字符串
  refreshToken: PcCookie.get(Key.refreshTokenKey) // 刷新令牌字符串

}

// 改变状态值
const mutations = {

  // 赋值用户状态
  SET_USER_STATE(state, data) {
    // 状态赋值
    console.log(data)
    state.userInfo = data.userInfo
    state.accessToken = data.access
    state.refreshToken = data.refresh
    state.avatar = data.userInfo.avatar

    // 保存到cookie中
    PcCookie.set(Key.userInfoKey, data.userInfo)
    PcCookie.set(Key.accessTokenKey, data.access)
    PcCookie.set(Key.refreshTokenKey, data.refresh)
  },

  // 重置用户状态,退出和登录失败时用
  RESET_USER_STATE(state) {
    // 状态置空
    state.userInfo = null
    state.accessToken = null
    state.refreshToken = null
    state.avatar = null

    // 移除cookie中的数据
    PcCookie.remove(Key.userInfoKey)
    PcCookie.remove(Key.accessTokenKey)
    PcCookie.remove(Key.refreshTokenKey)
  },

  // 刷新令牌状态
  SET_REFRESH_USER_STATE(state, data) {
    state.accessToken = data.access

    // 保存到cookie中
    PcCookie.set(Key.accessTokenKey, data.access)
  }

}

const actions = {
  // user login
  login({ commit }, userData) {
    // console.log('UserLogin', userData)
    const { username, password } = userData
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { code, data } = response
        if (code === 20000) {
          // 状态赋值
          commit('SET_USER_STATE', data)
        }
        resolve(response) // 正常响应钩子
      }).catch(error => {
        // 重置状态
        commit('RESET_USER_STATE')
        reject(error) // 异常
      })
    })
  },

  // user logout
  logout({ commit, state }, redirectURL) {
    return new Promise((resolve, reject) => {
      logout(state.accessToken).then(() => {
        // 重置状态
        commit('RESET_USER_STATE')
        // 重写向回来源地址，如果没有传重定向地址则回到到登录页
        window.location.href = redirectURL || '/'
      }).catch(error => {
        console.log(error)
        // 重置状态
        commit('RESET_USER_STATE')
        window.location.href = redirectURL || '/'
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      removeToken() // must remove  token  first
      commit('RESET_USER_STATE')
      resolve()
    })
  },

  // 发送刷新令牌
  SendRefreshToken({ state, commit }) {
    return new Promise((resolve, reject) => {
      // 判断是否有刷新令牌
      if (!state.refreshToken) {
        commit('RESET_USER_STATE')
        reject('没有刷新令牌')
        console.log('没有刷新令牌')
        return
      }

      // 发送请求
      refreshToken({ refresh: state.refreshToken }).then(response => {
        console.log('获取到的新认证令牌', response.data.access)
        // 更新用户状态新数据
        const { data } = response
        commit('SET_REFRESH_USER_STATE', data)
        resolve() // 正常钩子
      }).catch(error => {
        // 重置状态
        commit('RESET_USER_STATE')
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

