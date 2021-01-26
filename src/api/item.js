import request from '@/utils/request'

export default {

  // 分页条件查询项目列表
  getList(query, current = 1, size = 20) {
    return request({ // Promise
      url: `/assets/item/search/`,
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
      url: `/assets/item/`,
      method: 'post',
      data: data
    })
  },

  // 查询类别详情
  getById(id) {
    return request({
      url: `/assets/item/${id}`,
      method: 'get'
    })
  },

  // 更新
  update(data) {
    return request({
      url: `/assets/item/`,
      method: 'put',
      data
    })
  },

  // 删除
  deleteById(id) {
    return request({
      url: `/assets/item/${id}`,
      method: 'delete'
    })
  },

  // 查询正常状态的分类
  getNormalList() {
    return request({
      url: `/assets/item/list/`,
      method: 'get'
    })
  },

  // 获取所有正常状态下的分类和标签
  getItemAndFunction() {
    return request({
      url: `/assets/item/function/list/`,
      method: 'get'
    })
  },

  // 获取对应项目的设备列
  getSelAssetList(itemId) {
    return request({
      url: `/assets/item/asset/list/${itemId}`,
      method: 'get'
    })
  }
}
