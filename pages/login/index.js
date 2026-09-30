// pages/login/index.js —— 登录（mock：自动注入用户）
import { request } from '../../api/http.js'
import regeneratorRuntime from '../../lib/runtime/runtime.js'

Page({
  async handleGetUserInfo(e) {
    // mock 模式：直接使用预置用户
    const user = await request({ url: '/user/info' })
    wx.setStorageSync('userInfo', user)
    wx.setStorageSync('userinfo', user)
    wx.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => wx.navigateBack(), 800)
  },

  // 游客体验
  guestEnter() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/index/index' }) })
  }
})
