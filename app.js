// app.js
import { updateCartBadge } from './api/http.js'

App({
  globalData: {
    userInfo: null,
    cartCount: 0
  },

  onLaunch() {
    // 注入 Mock 登录态，保证依赖登录态的页面零报错
    let userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      userInfo = {
        id: 10001,
        nickName: '烧饼爱好者',
        avatar: '/static/images/default-avatar.png',
        phone: '138****8888',
        points: 268,
        level: '黄金会员',
        coupons: 3
      }
      wx.setStorageSync('userInfo', userInfo)
      // 兼容旧页面读取的小写 key
      wx.setStorageSync('userinfo', { nickName: userInfo.nickName, avatarUrl: userInfo.avatar })
    }
    this.globalData.userInfo = userInfo
    // 初始化购物车角标
    updateCartBadge()
  },

  onShow() {
    updateCartBadge()
  }
})
