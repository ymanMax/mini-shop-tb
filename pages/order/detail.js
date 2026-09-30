// pages/order/detail.js
import { request } from '../../api/http.js'
import { toast, confirm } from '../../utils/toast.js'
import { formatPrice, formatDateTime } from '../../utils/format.js'

const STATUS_MAP = {
  1: { text: '待付款', desc: '请尽快完成支付', icon: '💰' },
  2: { text: '待发货', desc: '商家正在为您打包商品', icon: '📦' },
  3: { text: '配送中', desc: '您的订单正在配送途中', icon: '🚚' },
  4: { text: '待收货', desc: '包裹已到达驿站，请及时取件', icon: '📍' },
  5: { text: '已完成', desc: '订单已完成，感谢购买', icon: '✅' },
  6: { text: '已取消', desc: '订单已取消', icon: '❌' }
}

Page({
  data: {
    orderId: null,
    order: null,
    payAmountText: '¥0.00',
    totalAmountText: '¥0.00',
    discountText: '¥0.00',
    freightText: '¥0.00',
    createTimeText: '',
    statusInfo: {},
    timeline: [],
    showTimeline: false
  },

  onLoad(options) {
    this.setData({ orderId: options.id })
    this.loadDetail()
  },

  onShow() {
    if (this.data.orderId) this.loadDetail()
  },

  async loadDetail() {
    const res = await request({ url: '/orders/detail', data: { id: this.data.orderId } })
    if (res.code !== 200) {
      toast.error('订单不存在')
      return
    }
    const order = res.data
    const statusInfo = STATUS_MAP[order.status] || STATUS_MAP[6]
    // 商品行加价格格式化
    order.items = (order.items || []).map(i => ({
      ...i,
      priceText: formatPrice(i.price),
      subtotalText: formatPrice(i.price * i.count)
    }))
    // 时间线：已完成的节点实心，未到达灰色
    const timeline = (order.logistics.timeline || []).map(n => ({
      ...n,
      timeText: n.time ? formatDateTime(n.time) : ''
    }))
    this.setData({
      order,
      statusInfo,
      timeline,
      showTimeline: order.status >= 2,
      payAmountText: formatPrice(order.payAmount),
      totalAmountText: formatPrice(order.totalAmount),
      discountText: formatPrice(order.discountAmount),
      freightText: formatPrice(order.freight),
      createTimeText: formatDateTime(order.createTime)
    })
  },

  // 复制订单号
  copyOrderNo() {
    wx.setClipboardData({
      data: this.data.order.orderNo,
      success: () => toast.success('订单号已复制')
    })
  },

  // 去支付
  goPay() {
    wx.navigateTo({ url: `/pages/pay/index?mode=order&orderId=${this.data.orderId}` })
  },

  // 取消订单
  async cancelOrder() {
    const ok = await confirm('确定取消该订单吗？')
    if (!ok) return
    const res = await request({ url: '/orders/cancel', method: 'POST', data: { id: this.data.orderId } })
    if (res.code === 200) {
      toast.success('订单已取消')
      this.loadDetail()
    }
  },

  // 催发货
  async urgeOrder() {
    await request({ url: '/orders/urge', method: 'POST', data: { id: this.data.orderId } })
    toast.success('已提醒商家发货')
  },

  // 确认收货
  async confirmReceive() {
    const ok = await confirm('确认已收到该订单的商品吗？')
    if (!ok) return
    const res = await request({ url: '/orders/confirm', method: 'POST', data: { id: this.data.orderId } })
    if (res.code === 200) {
      toast.success('已确认收货')
      this.loadDetail()
    }
  },

  // 去评价
  goReview() {
    wx.navigateTo({ url: `/pages/order/review?orderId=${this.data.orderId}` })
  },

  // 查看物流（滚动到物流区）
  viewLogistics() {
    wx.createSelectorQuery()
      .select('#logistics_section')
      .boundingClientRect(rect => {
        if (rect) {
          wx.pageScrollTo({ scrollTop: rect.top - 20, duration: 300 })
        } else {
          wx.pageScrollTo({ scrollTop: 0, duration: 300 })
        }
      })
      .exec()
  },

  // 再来一单
  async reorder() {
    const order = this.data.order
    for (const item of order.items) {
      await request({
        url: '/cart/add',
        method: 'POST',
        data: {
          goodsId: item.goodsId,
          specText: item.specText,
          price: item.price,
          count: item.count,
          mainPic: item.mainPic,
          name: item.name,
          stock: 999
        }
      })
    }
    toast.success('已加入购物车')
    wx.switchTab({ url: '/pages/cart/index' })
  },

  // ============ Mock 状态推进 ============
  async simulateShip() {
    const res = await request({ url: '/orders/simulate', method: 'POST', data: { id: this.data.orderId, action: 'ship' } })
    if (res.code === 200) {
      toast.success('模拟发货成功')
      this.loadDetail()
    }
  },
  async simulateDeliver() {
    const res = await request({ url: '/orders/simulate', method: 'POST', data: { id: this.data.orderId, action: 'deliver' } })
    if (res.code === 200) {
      toast.success('包裹已到达驿站')
      this.loadDetail()
    }
  },
  async simulateReach() {
    const res = await request({ url: '/orders/simulate', method: 'POST', data: { id: this.data.orderId, action: 'reach' } })
    if (res.code === 200) {
      toast.success('已确认送达')
      this.loadDetail()
    }
  },

  onImgError(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ [`order.items[${index}].mainPic`]: '/static/images/default.png' })
  }
})
