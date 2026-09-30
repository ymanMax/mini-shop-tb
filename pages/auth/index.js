// pages/auth/index.js —— 授权（mock 模式自动通过）
Page({
  handleAuth() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/index/index' }) })
  }
})
