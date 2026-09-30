// pages/order/index.js —— 订单列表页（模块 4.1）
import { get, post } from '../../api/http.js'
import { success, fail, confirm } from '../../utils/toast.js'
import { relativeTime, fullTime } from '../../utils/format.js'

Page({
  data: {
    tabs: [
      { id: 0, value: '全部', status: 0, isActive: true },
      { id: 1, value: '待付款', status: 1, isActive: false },
      { id: 2, value: '待发货', status: 2, isActive: false },
      { id: 3, value: '待收货', status: 4, isActive: false },
      { id: 4, value: '已完成', status: 5, isActive: false }
    ],
    currentTab: 0,
    orders: [],
    page: 1,
    size: 10,
    total: 0,
    noMore: false,
    loading: true
  },

  onLoad(options) {
    if (options.type) {
      const type = Number(options.type)
      const tab = this.data.tabs.find(t => t.status === type)
      if (tab) {
        const tabs = this.data.tabs.map(t => ({ ...t, isActive: t.id === tab.id }))
        this.setData({ currentTab: tab.id, tabs })
      }
    }
    this.loadOrders()
  },

  onShow() {
    this.loadOrders()
  },

  async loadOrders(reset = true) {
    if (reset) {
      this.setData({ loading: true, page: 1, orders: [], noMore: false })
    }
    const tab = this.data.tabs[this.data.currentTab]
    const res = await get('/orders/list', {
      status: tab.status,
      page: this.data.page,
      size: this.data.size
    })
    const records = (res.records || []).map(o => ({
      ...o,
      timeText: relativeTime(o.createTime)
    }))
    const orders = reset ? records : [...this.data.orders, ...records]
    this.setData({
      orders,
      total: res.total,
      loading: false,
      noMore: orders.length >= res.total
    })
  },

  handleTabChange(e) {
    const { index } = e.detail
    const tabs = this.data.tabs.map((t, i) => ({ ...t, isActive: i === index }))
    this.setData({ currentTab: index, tabs })
    this.loadOrders()
  },

  // 去支付
  async handlePay(e) {
    const { id } = e.currentTarget.dataset
    // 跳转支付页（待付款订单直接支付）
    const order = this.data.orders.find(o => o.id === id)
    wx.setStorageSync('payOrderId', id)
    wx.navigateTo({ url: `/pages/pay/index?orderId=${id}&fromOrder=1` })
  },

  // 取消订单
  async handleCancel(e) {
    const { id } = e.currentTarget.dataset
    const ok = await confirm('确定取消该订单吗?')
    if (!ok) return
    await post('/orders/cancel', { id })
    success('订单已取消')
    this.loadOrders()
  },

  // 催发货
  async handleRemind(e) {
    const { id } = e.currentTarget.dataset
    const res = await post('/orders/remind', { id })
    success(res.message || '已提醒商家')
  },

  // 确认收货
  async handleConfirm(e) {
    const { id } = e.currentTarget.dataset
    const ok = await confirm('确认已收到货物吗?')
    if (!ok) return
    await post('/orders/confirm', { id })
    success('已确认收货')
    this.loadOrders()
  },

  // 查看物流
  goLogistics(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/order/detail?id=${id}&tab=logistics` })
  },

  // 去评价
  goReview(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/order/review?id=${id}` })
  },

  // 再来一单
  async handleRepurchase(e) {
    const { id } = e.currentTarget.dataset
    const order = this.data.orders.find(o => o.id === id)
    if (!order) return
    // 把商品重新加入购物车
    for (const item of order.items) {
      await post('/cart/add', {
        goodsId: item.goodsId,
        specText: item.specText,
        price: item.price,
        count: item.count
      })
    }
    success('已加入购物车')
    const app = getApp()
    app.refreshCartCount && app.refreshCartCount()
  },

  // 查看详情
  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/order/detail?id=${id}` })
  },

  onReachBottom() {
    if (this.data.noMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadOrders(false)
  },

  onPullDownRefresh() {
    this.loadOrders().then(() => wx.stopPullDownRefresh())
  },

  handleImgError(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ [`orders[${index}].items[0].mainPic`]: '/static/images/default.png' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
