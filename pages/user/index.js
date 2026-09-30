// pages/user/index.js —— 个人中心
import { request } from '../../api/http.js'
import common from '../../behaviors/common.js'
import regeneratorRuntime from '../../lib/runtime/runtime.js'

Page({
  behaviors: [common],
  data: {
    userinfo: {},
    collectNums: 0,
    orderCounts: { all: 0, unpaid: 0, shipped: 0, receiving: 0, completed: 0 },
    cartCount: 0,
    signedToday: false,
    unusedCoupons: 0,
    unreadMessages: 0
  },

  onShow() {
    this.loadUser()
    this.loadCounts()
    this.refreshCartBadge()
    if (getApp() && getApp().refreshMessageBadge) getApp().refreshMessageBadge()
  },

  async loadUser() {
    const user = await request({ url: '/user/info' })
    this.setData({ userinfo: user })
  },

  async loadCounts() {
    const [collect, orders, coupons, messages, checkin, pointsInfo] = await Promise.all([
      request({ url: '/collect/list' }),
      request({ url: '/orders/list', data: { status: 'all', size: 100 } }),
      request({ url: '/coupon/list' }),
      request({ url: '/message/list' }),
      request({ url: '/checkin/info' }),
      request({ url: '/points/info' })
    ])
    const list = orders.records || []
    const now = new Date()
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const signedToday = checkin.month === monthStr && checkin.signedDays.includes(now.getDate())
    this.setData({
      collectNums: (collect || []).length,
      orderCounts: {
        all: list.length,
        unpaid: list.filter(o => o.status === 1).length,
        shipped: list.filter(o => o.status === 2).length,
        receiving: list.filter(o => o.status === 3 || o.status === 4).length,
        completed: list.filter(o => o.status === 5).length
      },
      unusedCoupons: (coupons || []).filter(c => c.status === 'unused').length,
      unreadMessages: (messages || []).filter(m => !m.isRead).length,
      signedToday,
      'userinfo.points': pointsInfo.points
    })
    const cart = wx.getStorageSync('mock_cart') || []
    this.setData({ cartCount: cart.filter(c => c.valid).reduce((s, c) => s + c.count, 0) })
  },

  goOrders(e) {
    const { type } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/order/index?type=${type}` })
  },

  goCollect() {
    wx.navigateTo({ url: '/pages/collect/index' })
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/index' })
  },

  goPoints() {
    wx.navigateTo({ url: '/pages/points/index' })
  },

  goCheckin() {
    wx.navigateTo({ url: '/pages/checkin/index' })
  },

  goCoupon() {
    wx.navigateTo({ url: '/pages/coupon/index' })
  },

  goMessage() {
    wx.navigateTo({ url: '/pages/message/index' })
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/feedback/index' })
  },

  goCart() {
    wx.switchTab({ url: '/pages/cart/index' })
  },

  goAddress() {
    wx.navigateTo({ url: '/pages/address/list/index?mode=manage' })
  },

  goShop() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
