// pages/user/index.js
import { request, updateCartBadge } from '../../api/http.js'

Page({
  data: {
    userinfo: {},
    collectNums: 0,
    orderCounts: {
      1: 0, 2: 0, 3: 0, 5: 0
    },
    cartCount: 0,
    couponNums: 0,
    points: 0,
    signedToday: false,
    unreadCount: 0
  },

  onShow() {
    updateCartBadge()
    this.loadUser()
    this.loadCounts()
    this.setData({ cartCount: this.getCartCount() })
  },

  getCartCount() {
    const cart = wx.getStorageSync('mk_cart') || []
    return cart.reduce((s, c) => s + c.count, 0)
  },

  async loadUser() {
    const res = await request({ url: '/user/info' })
    if (res.code === 200) {
      this.setData({ userinfo: res.data })
    }
  },

  async loadCounts() {
    // 收藏数
    const collectRes = await request({ url: '/collect/list' })
    const collectNums = (collectRes.data || []).length
    // 订单数
    const orderRes = await request({ url: '/orders/list', data: { status: 0, page: 1, size: 100 } })
    const orders = orderRes.data.records || []
    const orderCounts = { 1: 0, 2: 0, 3: 0, 5: 0 }
    orders.forEach(o => {
      if (o.status === 1) orderCounts[1]++
      else if (o.status === 2) orderCounts[2]++
      else if (o.status === 3 || o.status === 4) orderCounts[3]++
      else if (o.status === 5) orderCounts[5]++
    })
    // 优惠券数（未使用）
    const couponRes = await request({ url: '/coupon/my', data: { status: 1 } })
    const couponNums = (couponRes.data || []).length
    // 积分
    const pointsRes = await request({ url: '/points/info' })
    const points = pointsRes.data ? pointsRes.data.balance : 0
    // 签到状态
    const checkinRes = await request({ url: '/checkin/state' })
    const now = new Date()
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const signedToday = checkinRes.data && checkinRes.data.lastSignDate === todayStr
    // 未读消息
    const unreadRes = await request({ url: '/message/unread' })
    const unreadCount = unreadRes.data ? unreadRes.data.count : 0
    this.setData({ collectNums, orderCounts, couponNums, points, signedToday, unreadCount })
    // TabBar 我的角标
    if (unreadCount > 0) {
      wx.setTabBarBadge({ index: 3, text: String(unreadCount), fail: () => {} })
    } else {
      wx.removeTabBarBadge({ index: 3, fail: () => {} })
    }
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

  goAddress() {
    wx.navigateTo({ url: '/pages/address/list?mode=manage' })
  },

  goCart() {
    wx.switchTab({ url: '/pages/cart/index' })
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/feedback/index' })
  },

  goCoupon() {
    wx.navigateTo({ url: '/pages/coupon/index?tab=mine' })
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

  onAvatarError() {
    this.setData({ 'userinfo.avatar': '/static/images/default-avatar.png' })
  }
})
