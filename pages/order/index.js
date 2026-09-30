// pages/order/index.js
import { request, updateCartBadge } from '../../api/http.js'
import { toast, confirm } from '../../utils/toast.js'
import { formatPrice, formatDateTime } from '../../utils/format.js'

const TABS = [
  { id: 0, value: '全部', status: 0 },
  { id: 1, value: '待付款', status: 1 },
  { id: 2, value: '待发货', status: 2 },
  { id: 3, value: '待收货', status: 3 },
  { id: 4, value: '已完成', status: 5 }
]

const STATUS_MAP = {
  1: { text: '待付款', color: '#eb4450' },
  2: { text: '待发货', color: '#ff9500' },
  3: { text: '配送中', color: '#4a90d9' },
  4: { text: '待收货', color: '#4a90d9' },
  5: { text: '已完成', color: '#52c41a' },
  6: { text: '已取消', color: '#999' }
}

Page({
  data: {
    tabs: TABS,
    activeTab: 0,
    orders: [],
    page: 1,
    size: 10,
    total: 0,
    loading: false,
    skeleton: true,
    noMore: false
  },

  onLoad(options) {
    // 从我的页进入时可带 type 参数定位 tab
    if (options.type) {
      const t = TABS.find(t => t.status === Number(options.type))
      if (t) this.setData({ activeTab: t.id })
    }
  },

  onShow() {
    updateCartBadge()
    this.loadOrders(true)
  },

  async loadOrders(reset = false) {
    if (this.data.loading) return
    this.setData({ loading: true })
    if (reset) {
      this.setData({ page: 1, orders: [], noMore: false, skeleton: this.data.orders.length === 0 })
    }
    const tab = TABS[this.data.activeTab]
    const res = await request({
      url: '/orders/list',
      data: { status: tab.status, page: this.data.page, size: this.data.size }
    })
    const { records, total } = res.data || { records: [], total: 0 }
    const list = records.map(o => ({
      ...o,
      payAmountText: formatPrice(o.payAmount),
      createTimeText: formatDateTime(o.createTime),
      statusText: STATUS_MAP[o.status].text,
      statusColor: STATUS_MAP[o.status].color,
      firstItem: { ...o.items[0], priceText: formatPrice(o.items[0].price) },
      itemCount: o.items.reduce((s, i) => s + i.count, 0)
    }))
    this.setData({
      orders: reset ? list : [...this.data.orders, ...list],
      total,
      loading: false,
      skeleton: false,
      noMore: this.data.page * this.data.size >= total
    })
    wx.stopPullDownRefresh()
  },

  onTabTap(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ activeTab: index })
    this.loadOrders(true)
  },

  // 去支付
  goPay(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/pay/index?mode=order&orderId=${id}` })
  },

  // 取消订单
  async cancelOrder(e) {
    const { id } = e.currentTarget.dataset
    const ok = await confirm('确定取消该订单吗？')
    if (!ok) return
    const res = await request({ url: '/orders/cancel', method: 'POST', data: { id } })
    if (res.code === 200) {
      toast.success('订单已取消')
      this.loadOrders(true)
    }
  },

  // 催发货
  async urgeOrder(e) {
    const { id } = e.currentTarget.dataset
    await request({ url: '/orders/urge', method: 'POST', data: { id } })
    toast.success('已提醒商家发货')
  },

  // 确认收货
  async confirmReceive(e) {
    const { id } = e.currentTarget.dataset
    const ok = await confirm('确认已收到该订单的商品吗？')
    if (!ok) return
    const res = await request({ url: '/orders/confirm', method: 'POST', data: { id } })
    if (res.code === 200) {
      toast.success('已确认收货')
      this.loadOrders(true)
    }
  },

  // 查看物流 / 详情
  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/order/detail?id=${id}` })
  },

  // 去评价
  goReview(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/order/review?orderId=${id}` })
  },

  // 再来一单
  async reorder(e) {
    const { id } = e.currentTarget.dataset
    const res = await request({ url: '/orders/detail', data: { id } })
    if (res.code !== 200) return
    const order = res.data
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
    updateCartBadge()
    toast.success('已加入购物车')
    wx.switchTab({ url: '/pages/cart/index' })
  },

  onReachBottom() {
    if (this.data.noMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadOrders()
  },

  onPullDownRefresh() {
    this.loadOrders(true)
  },

  onImgError(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ [`orders[${index}].firstItem.mainPic`]: '/static/images/default.png' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
