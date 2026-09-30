// pages/user/index.js —— 个人中心
import { get } from '../../api/http.js'

Page({
  data: {
    userinfo: {},
    collectNums: 0,
    orderCounts: { 1: 0, 2: 0, 4: 0, 5: 0 },
    cartCount: 0,
    historyCount: 0,
    points: 0,
    unreadMessages: 0,
    checkedToday: false
  },

  onShow() {
    const app = getApp()
    app.refreshCartCount && app.refreshCartCount()
    this.setData({
      userinfo: wx.getStorageSync('userInfo') || {},
      cartCount: app.globalData.cartCount || 0
    })
    this.loadCollectCount()
    this.loadOrderCounts()
    this.loadHistoryCount()
    this.loadPoints()
    this.loadUnreadMessages()
  },

  async loadCollectCount() {
    const collect = await get('/collect/list')
    this.setData({ collectNums: collect.length })
  },

  async loadHistoryCount() {
    const history = await get('/history/list')
    this.setData({ historyCount: history.length })
  },

  async loadPoints() {
    const res = await get('/points/info')
    this.setData({ points: res.points })
  },

  async loadUnreadMessages() {
    const messages = await get('/messages/list')
    const unread = messages.filter(m => !m.isRead).length
    this.setData({ unreadMessages: unread })
    // TabBar 我的角标
    if (unread > 0) {
      wx.setTabBarBadge({ index: 3, text: String(unread), fail: () => {} })
    } else {
      wx.removeTabBarBadge({ index: 3, fail: () => {} })
    }
  },

  async loadOrderCounts() {
    const res = await get('/orders/list', { page: 1, size: 100 })
    const orders = res.records || []
    const counts = { 1: 0, 2: 0, 4: 0, 5: 0 }
    orders.forEach(o => {
      if (counts[o.status] !== undefined) counts[o.status]++
    })
    this.setData({ orderCounts: counts })
  },

  goOrder(e) {
    const { type } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/order/index?type=${type}` })
  },

  goCollect() {
    wx.navigateTo({ url: '/pages/collect/index' })
  },

  goHistory() {
    wx.navigateTo({ url: '/pages/history/index' })
  },

  goCoupon() {
    wx.navigateTo({ url: '/pages/coupon/index' })
  },

  goPoints() {
    wx.navigateTo({ url: '/pages/points/index' })
  },

  goCheckin() {
    wx.navigateTo({ url: '/pages/checkin/index' })
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
    wx.navigateTo({ url: '/pages/address/list' })
  },

  handleImgError() {}
})
