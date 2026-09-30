// pages/login/index.js —— 登录页（mock 自动登录）
Page({
  handleGetUserInfo() {
    // mock：直接注入用户信息
    const userInfo = wx.getStorageSync('userInfo') || {
      id: 10001,
      nickName: '烧饼爱好者',
      avatar: '/static/images/default-avatar.png',
      phone: '138****8888'
    }
    wx.setStorageSync('userInfo', userInfo)
    wx.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => wx.navigateBack({ delta: 1 }), 1000)
  }
})
