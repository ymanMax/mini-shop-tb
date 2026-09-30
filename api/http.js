// 统一请求入口：USE_MOCK = true 时走本地 Mock，false 时走真实后端
// 联调真实后端只需将 USE_MOCK 改为 false 并切换 baseUrl

import { mockRequest } from '../mock/index.js'
import { initMockState } from '../mock/state.js'

export const USE_MOCK = true

const BASE_URL = 'https://api-hmugo-web.itheima.net/api/public/v1'

// 初始化 Mock 状态（幂等）
if (USE_MOCK) {
  try {
    initMockState()
  } catch (e) {
    console.warn('mock init failed', e)
  }
}

/**
 * 统一请求方法
 * @param {object} options { url, method, data, header }
 * @returns Promise，resolve 为后端 data 部分
 */
export const request = (options) => {
  if (USE_MOCK) {
    return mockRequest(options).then((res) => {
      if (res.code === 200) return res.data
      wx.showToast({ title: res.msg || '请求失败', icon: 'none' })
      throw new Error(res.msg)
    })
  }
  // 真实后端请求（保留原逻辑）
  const header = { ...options.header }
  if (options.url.includes('/my/')) {
    header['Authorization'] = wx.getStorageSync('token')
  }
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      header,
      url: BASE_URL + options.url,
      success: (result) => resolve(result.data.message),
      fail: reject
    })
  })
}

/**
 * 图片上传（mock 模式直接返回本地路径）
 */
export const upload = (options) => {
  if (USE_MOCK) {
    return mockRequest({ url: '/upload', method: 'POST', data: options }).then((res) => {
      if (res.code === 200) return res.data
      throw new Error(res.msg)
    })
  }
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      ...options,
      url: BASE_URL + options.url,
      success: (result) => resolve(JSON.parse(result.data)),
      fail: reject
    })
  })
}

export default { request, upload, USE_MOCK }
