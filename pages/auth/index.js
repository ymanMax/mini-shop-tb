// pages/auth/index.js —— 授权页（mock 自动授权）
Page({
  handleGetUserInfo() {
    // mock：直接写入 loginParams 代替 token
    wx.setStorageSync('loginParams', { mock: true, time: Date.now() })
    wx.showToast({ title: '授权成功', icon: 'success' })
    setTimeout(() => wx.navigateBack({ delta: 1 }), 1000)
  }
})
