import request from '@/utils/request'

export default {
  test() {
    return request({ // Promise
      url: '/user/token/', //  /dev-api/test
      method: 'get'
    })
  }
}
