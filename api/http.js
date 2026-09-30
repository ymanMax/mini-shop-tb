// 统一请求入口
// USE_MOCK = true 时走本地 Mock 路由；后续联调真实后端改为 false 并切换 baseUrl
const USE_MOCK = true
const BASE_URL = 'https://api-hmugo-web.itheima.net/api/public/v1'

const { mockRequest } = require('../mock/index.js')

// 简易 loading 计数
let ajaxTimes = 0

export function request(options) {
  if (USE_MOCK) {
    ajaxTimes++
    wx.showLoading({ title: '加载中', mask: true })
    return mockRequest(options).then(res => {
      ajaxTimes--
      if (ajaxTimes === 0) wx.hideLoading()
      // 统一返回 data 部分
      if (res && res.code === 200) return res.data
      wx.showToast({ title: (res && res.msg) || '请求失败', icon: 'none' })
      return Promise.reject(res)
    }).catch(err => {
      ajaxTimes--
      if (ajaxTimes === 0) wx.hideLoading()
      throw err
    })
  }
  // 真实后端（联调时启用）
  let header = { ...options.header }
  if (options.url && options.url.includes('/my/')) {
    header['Authorization'] = wx.getStorageSync('token')
  }
  ajaxTimes++
  wx.showLoading({ title: '加载中', mask: true })
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      header,
      url: BASE_URL + options.url,
      success: (result) => resolve(result.data.message),
      fail: reject,
      complete: () => {
        ajaxTimes--
        if (ajaxTimes === 0) wx.hideLoading()
      }
    })
  })
}

// 图片上传（mock 直接返回本地路径）
export function upload(options) {
  if (USE_MOCK) {
    ajaxTimes++
    wx.showLoading({ title: '上传中', mask: true })
    return mockRequest({ url: '/upload/image', method: 'POST', data: options }).then(res => {
      ajaxTimes--
      if (ajaxTimes === 0) wx.hideLoading()
      if (res && res.code === 200) return res.data
      return Promise.reject(res)
    }).catch(err => {
      ajaxTimes--
      if (ajaxTimes === 0) wx.hideLoading()
      throw err
    })
  }
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      ...options,
      url: BASE_URL + options.url,
      success: (r) => resolve(r.data),
      fail: reject
    })
  })
}

// 便捷方法
export const get = (url, data) => request({ url, method: 'GET', data })
export const post = (url, data) => request({ url, method: 'POST', data })
