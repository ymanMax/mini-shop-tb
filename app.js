// app.js —— 注入 Mock 登录态 + globalData
const { mockUser } = require('./mock/data/user.js')
const { ensureInit } = require('./mock/index.js')

App({
  globalData: {
    userInfo: null,
    cartCount: 0
  },

  onLaunch() {
    // 首次启动：把 Mock 种子数据持久化到 storage
    ensureInit()

    // 注入 Mock 用户登录态
    let userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      userInfo = { ...mockUser }
      wx.setStorageSync('userInfo', userInfo)
    }
    this.globalData.userInfo = userInfo

    // 初始化购物车角标
    this.refreshCartCount()
  },

  // 刷新购物车角标（全局同步）
  refreshCartCount() {
    try {
      const cart = wx.getStorageSync('mock_cart') || []
      const count = cart.reduce((s, x) => s + (x.count || 0), 0)
      this.globalData.cartCount = count
      // 同步 tabBar 角标
      if (count > 0) {
        wx.setTabBarBadge({ index: 2, text: String(count) })
      } else {
        wx.removeTabBarBadge({ index: 2 })
      }
    } catch (e) {}
  }
})
