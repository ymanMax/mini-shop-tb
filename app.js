// 小程序入口：注入 Mock 登录态 + globalData
import regeneratorRuntime from './lib/runtime/runtime.js'
import { initMockState } from './mock/state.js'
import { mockUser } from './mock/data/user.js'

App({
  globalData: {
    userInfo: null,
    cartCount: 0
  },

  onLaunch() {
    // 初始化 Mock 数据（幂等：已 seeded 则直接读取）
    initMockState()

    // 注入 Mock 用户，保证依赖登录态的页面零报错
    let userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      userInfo = { ...mockUser }
      wx.setStorageSync('userInfo', userInfo)
    }
    // 旧版本页面使用小写 'userinfo'，同步写入
    wx.setStorageSync('userinfo', userInfo)
    this.globalData.userInfo = userInfo

    // 初始化购物车角标数量
    this.refreshCartCount()
  },

  onShow() {
    this.refreshCartCount()
    this.refreshMessageBadge()
  },

  // 刷新「我的」tabBar 未读消息角标
  refreshMessageBadge() {
    const messages = wx.getStorageSync('messages') || []
    const unread = messages.filter(m => !m.isRead).length
    if (unread > 0) {
      wx.setTabBarBadge({ index: 3, text: String(unread), fail: () => {} })
    } else {
      wx.removeTabBarBadge({ index: 3, fail: () => {} })
    }
  },

  // 刷新全局购物车角标数量
  refreshCartCount() {
    const cart = wx.getStorageSync('mock_cart') || []
    const count = cart.filter((c) => c.valid).reduce((s, c) => s + c.count, 0)
    this.globalData.cartCount = count
    // 同步到 tabBar 角标
    if (count > 0) {
      wx.setTabBarBadge({ index: 2, text: String(count), fail: () => {} })
    } else {
      wx.removeTabBarBadge({ index: 2, fail: () => {} })
    }
  }
})
