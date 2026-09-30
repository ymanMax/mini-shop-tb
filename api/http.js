// 统一请求入口：USE_MOCK = true 时走 Mock，联调时改为 false 并切换 baseUrl
import { mockRequest } from '../mock/index.js'

export const USE_MOCK = true
export const baseUrl = 'https://api-hmugo-web.itheima.net/api/public/v1'

// 通用请求
export const request = (options) => {
  if (USE_MOCK) {
    return mockRequest(options)
  }
  // 真实后端联调
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      url: baseUrl + options.url,
      success: (res) => resolve(res.data),
      fail: reject
    })
  })
}

// 图片上传（mock：直接返回本地临时路径）
export const upload = (options) => {
  if (USE_MOCK) {
    return mockRequest({ url: '/upload', method: 'POST', data: options })
  }
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      ...options,
      url: baseUrl + options.url,
      success: (res) => resolve(JSON.parse(res.data)),
      fail: reject
    })
  })
}

// ============ 购物车角标全局同步 ============
export const getCartCount = () => {
  const cart = wx.getStorageSync('mk_cart') || []
  return cart.reduce((s, c) => s + (c.count || 0), 0)
}

// 更新 tabBar 购物车角标
export const updateCartBadge = () => {
  const count = getCartCount()
  if (count > 0) {
    wx.setTabBarBadge({ index: 2, text: String(count), fail: () => {} })
  } else {
    wx.removeTabBarBadge({ index: 2, fail: () => {} })
  }
}
