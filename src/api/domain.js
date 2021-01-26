import request from '@/utils/request'

export default {

  // 分页条件查询分类列表
  getList(query, current = 1, size = 20) {
    return request({ // Promise
      url: `/assets/domain/search/`,
      method: 'post',
      data: { // {name: '前端', status: 1, current: current, size: size}
        ...query,
        current,
        size
      }
    })
  },

  add(data) {
    return request({
      url: `/assets/domain/`,
      method: 'post',
      data: data
    })
  },

  // 查询类别详情
  getById(id) {
    return request({
      url: `/assets/domain/${id}`,
      method: 'get'
    })
  },

  // 更新
  update(data) {
    return request({
      url: `/assets/domain/`,
      method: 'put',
      data
    })
  },

  // 删除
  deleteById(id) {
    return request({
      url: `/assets/domain/${id}`,
      method: 'delete'
    })
  },

  // 获取对应项目的设备列
  getDomainAndAssetList(id) {
    return request({
      url: `/assets/domain/asset/list/${id}`,
      method: 'get'
    })
  }
}
