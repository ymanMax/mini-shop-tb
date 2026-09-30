// pages/order/index.js —— 订单列表
import { request } from '../../api/http.js'
import common from '../../behaviors/common.js'
import { formatTime, formatPrice } from '../../utils/format.js'
import { toastSuccess, toastInfo, confirm } from '../../utils/toast.js'
import regeneratorRuntime from '../../lib/runtime/runtime.js'

Page({
  behaviors: [common],
  data: {
    tabs: [
      { key: 'all', label: '全部' },
      { key: 1, label: '待付款' },
      { key: 2, label: '待发货' },
      { key: 4, label: '待收货' },
      { key: 5, label: '已完成' }
    ],
    activeTab: 'all',
    orders: [],
    page: 1,
    size: 10,
    total: 0,
    noMore: false,
    loading: true,
    skeleton: true
  },

  onLoad(options) {
    // 从我的页跳转：type=1全部 2待付款 3待发货 4待收货 5已完成
    if (options.type) {
      const tmap = { '1': 'all', '2': 1, '3': 2, '4': 4, '5': 5 }
      this.setData({ activeTab: tmap[options.type] || 'all' })
    }
  },

  onShow() {
    this.loadOrders(true)
  },

  onPullDownRefresh() {
    this.loadOrders(true).then(() => wx.stopPullDownRefresh())
  },

  onReachBottom() {
    if (!this.data.noMore && !this.data.loading) this.loadOrders(false)
  },

  switchTab(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ activeTab: key, orders: [], page: 1, noMore: false, skeleton: true })
    this.loadOrders(true)
  },

  async loadOrders(reset) {
    this.setData({ loading: true })
    const params = {
      status: this.data.activeTab,
      page: reset ? 1 : this.data.page,
      size: this.data.size
    }
    const res = await request({ url: '/orders/list', data: params })
    const records = (res.records || []).map(o => ({
      ...o,
      createTimeText: formatTime(o.createTime),
      itemCount: o.items.reduce((s, it) => s + it.count, 0)
    }))
    const list = reset ? records : [...this.data.orders, ...records]
    this.setData({
      orders: list,
      total: res.total,
      page: reset ? 2 : this.data.page + 1,
      noMore: list.length >= res.total,
      loading: false,
      skeleton: false
    })
  },

  // ===== 操作 =====
  async payOrder(e) {
    const { orderno } = e.currentTarget.dataset
    wx.showLoading({ title: '支付中', mask: true })
    await request({ url: '/orders/pay', method: 'POST', data: { orderNo: orderno } })
    wx.hideLoading()
    toastSuccess('支付成功')
    this.loadOrders(true)
  },

  async cancelOrder(e) {
    const { orderno } = e.currentTarget.dataset
    const ok = await confirm('确定取消该订单吗？')
    if (!ok) return
    await request({ url: '/orders/cancel', method: 'POST', data: { orderNo: orderno } })
    toastSuccess('订单已取消')
    this.loadOrders(true)
  },

  async urgeOrder(e) {
    const { orderno } = e.currentTarget.dataset
    const res = await request({ url: '/orders/urge', method: 'POST', data: { orderNo: orderno } })
    toastSuccess(res.message || '已提醒商家发货')
  },

  async confirmReceive(e) {
    const { orderno } = e.currentTarget.dataset
    const ok = await confirm('确认已收到货物吗？')
    if (!ok) return
    await request({ url: '/orders/confirmReceive', method: 'POST', data: { orderNo: orderno } })
    toastSuccess('已确认收货')
    this.loadOrders(true)
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/order/detail/index?id=${id}` })
  },

  goReview(e) {
    const { orderno } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/order/review/index?orderNo=${orderno}` })
  },

  async againOrder(e) {
    const { orderno } = e.currentTarget.dataset
    await request({ url: '/orders/again', method: 'POST', data: { orderNo: orderno } })
    toastSuccess('已加入购物车')
    this.refreshCartBadge()
  },

  viewLogistics(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/order/detail/index?id=${id}&tab=logistics` })
  },

  stopPropagation() {},

  goShop() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
