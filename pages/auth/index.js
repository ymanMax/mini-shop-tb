// pages/auth/index.js
// 游客无需登录即可体验全部功能，本页仅作授权演示
Page({
  handleGetUserInfo(e) {
    const userInfo = (e.detail && e.detail.userInfo) || {
      nickName: '烧饼爱好者',
      avatarUrl: '/static/images/default-avatar.png'
    }
    wx.setStorageSync('userinfo', userInfo)
    wx.setStorageSync('userInfo', {
      id: 10001,
      nickName: userInfo.nickName,
      avatar: userInfo.avatarUrl,
      phone: '138****8888'
    })
    wx.navigateBack({ delta: 1 })
  }
})
