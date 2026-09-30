// pages/pay/index.js —— 支付确认页（含优惠券选择）
import { get, post } from '../../api/http.js'
import { success, fail, loading, hideLoading } from '../../utils/toast.js'
import { formatPrice } from '../../utils/format.js'

Page({
  data: {
    address: null,
    items: [],
    totalAmount: 0,
    discountAmount: 0,
    freight: 0,
    payAmount: 0,
    orderId: null,
    fromOrder: false,
    paying: false,
    // 优惠券
    showCoupon: false,
    availableCoupons: [],
    selectedCoupon: null,
    couponDiscount: 0
  },

  onLoad(options) {
    this.setData({
      orderId: options.orderId || null,
      fromOrder: options.fromOrder === '1' || !!options.orderId
    })
  },

  onShow() {
    const selected = wx.getStorageSync('selectedAddress')
    if (selected) {
      this.setData({ address: selected })
      wx.removeStorageSync('selectedAddress')
    }
    if (this.data.fromOrder && this.data.orderId) {
      this.loadOrderForPay()
    } else {
      this.loadCheckout()
    }
  },

  async loadOrderForPay() {
    const order = await get('/orders/detail', { id: this.data.orderId })
    const addr = order.addressSnapshot || {}
    const address = {
      name: addr.name,
      phone: addr.phone,
      region: addr.region || '',
      detail: addr.detail || addr.address || ''
    }
    this.setData({
      address,
      items: order.items,
      totalAmount: order.totalAmount,
      discountAmount: order.discountAmount,
      freight: order.freight,
      payAmount: order.payAmount,
      totalAmountText: order.totalAmountText,
      discountText: order.discountText,
      freightText: order.freightText,
      payAmountText: order.payAmountText
    })
  },

  async loadCheckout() {
    let items = []
    const buyNow = wx.getStorageSync('buyNowPayload')
    if (buyNow) {
      items = [buyNow]
      wx.removeStorageSync('buyNowPayload')
    } else {
      items = wx.getStorageSync('checkoutItems') || []
    }
    if (!items.length) {
      fail('没有待结算商品')
      setTimeout(() => wx.navigateBack(), 1500)
      return
    }
    const totalAmount = items.reduce((s, it) => s + it.price * it.count, 0)
    let discount = 0
    if (totalAmount >= 99) discount = 15
    else if (totalAmount >= 39) discount = 5
    const payAmount = Math.round((totalAmount - discount) * 100) / 100
    items = items.map(it => ({ ...it, priceText: formatPrice(it.price) }))
    const address = await this.getDefaultAddress()
    this.setData({
      items,
      totalAmount,
      discountAmount: discount,
      freight: 0,
      payAmount,
      totalAmountText: formatPrice(totalAmount),
      discountText: formatPrice(discount),
      freightText: '免运费',
      payAmountText: formatPrice(payAmount),
      address
    })
    this.loadAvailableCoupons()
  },

  async getDefaultAddress() {
    const list = await get('/user/address')
    return list.find(a => a.isDefault) || list[0] || null
  },

  // 加载可用优惠券
  async loadAvailableCoupons() {
    const myCoupons = await get('/coupon/my', { status: 'unused' })
    const total = this.data.totalAmount
    const available = myCoupons.map(c => {
      let usable = true
      let reason = ''
      if (c.type === 'full' && total < c.threshold) {
        usable = false
        reason = `未满${c.threshold}元`
      }
      return { ...c, usable, reason }
    })
    // 默认选最优（可用且优惠最大）
    const best = available.filter(c => c.usable).sort((a, b) => {
      const aVal = a.type === 'discount' ? a.discount : a.amount
      const bVal = b.type === 'discount' ? b.discount : b.amount
      return bVal - aVal
    })[0]
    this.setData({
      availableCoupons: available,
      selectedCoupon: best || null,
      couponDiscount: best ? this.calcCouponValue(best) : 0
    })
    this.recalculate()
  },

  calcCouponValue(coupon) {
    if (!coupon) return 0
    if (coupon.type === 'discount') {
      return Math.round(this.data.totalAmount * (1 - coupon.discount) * 100) / 100
    }
    return coupon.amount
  },

  recalculate() {
    const { totalAmount, discountAmount, couponDiscount } = this.data
    const payAmount = Math.round((totalAmount - discountAmount - couponDiscount) * 100) / 100
    this.setData({
      payAmount,
      payAmountText: formatPrice(payAmount),
      couponDiscountText: formatPrice(couponDiscount)
    })
  },

  // 打开/关闭券弹层
  toggleCoupon() {
    this.setData({ showCoupon: !this.data.showCoupon })
  },

  // 选择券
  handleSelectCoupon(e) {
    const { id } = e.currentTarget.dataset
    const coupon = this.data.availableCoupons.find(c => c.id === id)
    if (!coupon || !coupon.usable) return
    this.setData({
      selectedCoupon: coupon,
      couponDiscount: this.calcCouponValue(coupon),
      showCoupon: false
    })
    this.recalculate()
  },

  handleChooseAddress() {
    wx.navigateTo({ url: '/pages/address/list?mode=select' })
  },

  async handlePay() {
    if (this.data.paying) return
    if (!this.data.address) {
      fail('请选择收货地址')
      return
    }
    this.setData({ paying: true })
    loading('支付中...')
    await new Promise(r => setTimeout(r, 2000))

    if (this.data.fromOrder && this.data.orderId) {
      await post('/orders/pay', { id: this.data.orderId })
    } else {
      const order = await post('/orders/create', {
        items: this.data.items,
        address: this.data.address,
        discountAmount: this.data.discountAmount + this.data.couponDiscount,
        couponId: this.data.selectedCoupon ? this.data.selectedCoupon.id : null,
        remark: ''
      })
      // 标记券已使用
      if (this.data.selectedCoupon) {
        await post('/coupon/use', { id: this.data.selectedCoupon.id })
      }
      await this.clearCheckedCart()
      this.newOrderId = order.id
    }

    hideLoading()
    success('支付成功')
    setTimeout(() => {
      if (this.data.fromOrder && this.data.orderId) {
        wx.redirectTo({ url: `/pages/order/detail?id=${this.data.orderId}` })
      } else {
        wx.redirectTo({ url: `/pages/order/detail?id=${this.newOrderId}` })
      }
    }, 1500)
  },

  async clearCheckedCart() {
    const cart = await get('/cart/list')
    const checkedIds = cart.filter(x => x.checked).map(x => x.id)
    if (checkedIds.length) {
      await post('/cart/remove', { ids: checkedIds })
    }
    const app = getApp()
    app.refreshCartCount && app.refreshCartCount()
  },

  handleImgError(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ [`items[${index}].mainPic`]: '/static/images/default.png' })
  }
})
