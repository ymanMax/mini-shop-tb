// pages/order/detail/index.js —— 订单详情
import { request } from '../../../api/http.js'
import common from '../../../behaviors/common.js'
import { formatTime, formatPrice } from '../../../utils/format.js'
import { toastSuccess, toastInfo, confirm } from '../../../utils/toast.js'
import regeneratorRuntime from '../../../lib/runtime/runtime.js'

Page({
  behaviors: [common],
  data: {
    order: null,
    loading: true,
    activeTab: '' // logistics 锚点
  },

  onLoad(options) {
    this.orderId = options.id
    if (options.tab) this.setData({ activeTab: options.tab })
    this.loadDetail()
  },

  onShow() {
    if (this.orderId) this.loadDetail()
  },

  async loadDetail() {
    const res = await request({ url: '/orders/detail', data: { id: this.orderId } })
    const order = {
      ...res,
      createTimeText: formatTime(res.createTime),
      itemCount: res.items.reduce((s, it) => s + it.count, 0)
    }
    this.setData({ order, loading: false })
  },

  // ===== 操作 =====
  async payOrder() {
    wx.showLoading({ title: '支付中', mask: true })
    await request({ url: '/orders/pay', method: 'POST', data: { orderNo: this.data.order.orderNo, createTime: this.data.order.createTime } })
    wx.hideLoading()
    toastSuccess('支付成功')
    this.loadDetail()
  },

  async cancelOrder() {
    const ok = await confirm('确定取消该订单吗？')
    if (!ok) return
    await request({ url: '/orders/cancel', method: 'POST', data: { orderNo: this.data.order.orderNo } })
    toastSuccess('订单已取消')
    this.loadDetail()
  },

  async urgeOrder() {
    const res = await request({ url: '/orders/urge', method: 'POST', data: { orderNo: this.data.order.orderNo } })
    toastSuccess(res.message || '已提醒商家发货')
  },

  async confirmReceive() {
    const ok = await confirm('确认已收到货物吗？')
    if (!ok) return
    await request({ url: '/orders/confirmReceive', method: 'POST', data: { orderNo: this.data.order.orderNo } })
    toastSuccess('已确认收货')
    this.loadDetail()
  },

  goReview() {
    wx.navigateTo({ url: `/pages/order/review/index?orderNo=${this.data.order.orderNo}` })
  },

  async againOrder() {
    await request({ url: '/orders/again', method: 'POST', data: { orderNo: this.data.order.orderNo } })
    toastSuccess('已加入购物车')
    this.refreshCartBadge()
  },

  // ===== 模拟配送进度 =====
  async mockShip() {
    await request({ url: '/orders/ship', method: 'POST', data: { orderNo: this.data.order.orderNo } })
    toastSuccess('模拟发货成功')
    this.loadDetail()
  },
  async mockDeliver() {
    await request({ url: '/orders/deliver', method: 'POST', data: { orderNo: this.data.order.orderNo } })
    toastSuccess('模拟配送中')
    this.loadDetail()
  },

  copyOrderNo() {
    wx.setClipboardData({
      data: this.data.order.orderNo,
      success: () => toastSuccess('订单号已复制')
    })
  },

  previewImg(e) {
    const { url, urls } = e.currentTarget.dataset
    wx.previewImage({ urls, current: url })
  }
})
