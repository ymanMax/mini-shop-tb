// pages/order/detail.js —— 订单详情页（模块 4.2）
import { get, post } from '../../api/http.js'
import { success, fail, confirm } from '../../utils/toast.js'
import { fullTime } from '../../utils/format.js'

Page({
  data: {
    order: null,
    loading: true,
    activeTab: '' // logistics 滚动定位
  },

  onLoad(options) {
    this.orderId = options.id
    this.setData({ activeTab: options.tab || '' })
    this.loadOrder()
  },

  onShow() {
    if (this.orderId) this.loadOrder()
  },

  async loadOrder() {
    const order = await get('/orders/detail', { id: this.orderId })
    order.fullTimeText = fullTime(order.createTime)
    this.setData({ order, loading: false })
  },

  // 取消订单
  async handleCancel() {
    const ok = await confirm('确定取消该订单吗?')
    if (!ok) return
    await post('/orders/cancel', { id: this.orderId })
    success('订单已取消')
    this.loadOrder()
  },

  // 去支付
  handlePay() {
    wx.setStorageSync('payOrderId', this.orderId)
    wx.navigateTo({ url: `/pages/pay/index?orderId=${this.orderId}&fromOrder=1` })
  },

  // 催发货
  async handleRemind() {
    const res = await post('/orders/remind', { id: this.orderId })
    success(res.message || '已提醒商家')
  },

  // 确认收货
  async handleConfirm() {
    const ok = await confirm('确认已收到货物吗?')
    if (!ok) return
    await post('/orders/confirm', { id: this.orderId })
    success('已确认收货')
    this.loadOrder()
  },

  // 去评价
  goReview() {
    wx.navigateTo({ url: `/pages/order/review?id=${this.orderId}` })
  },

  // 再来一单
  async handleRepurchase() {
    const order = this.data.order
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

  // 模拟配送进度
  async handleSimulate() {
    await post('/orders/simulate', { id: this.orderId })
    success('配送进度已更新')
    this.loadOrder()
  },

  // 复制订单号
  copyOrderNo() {
    wx.setClipboardData({
      data: this.data.order.orderNo,
      success: () => success('订单号已复制')
    })
  },

  handleImgError(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ [`order.items[${index}].mainPic`]: '/static/images/default.png' })
  }
})
