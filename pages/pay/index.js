// pages/pay/index.js
import { request, updateCartBadge } from '../../api/http.js'
import { toast } from '../../utils/toast.js'
import { formatPrice } from '../../utils/format.js'

Page({
  data: {
    mode: 'cart',
    orderId: null,
    address: null,
    items: [],
    totalAmount: 0,
    discountAmount: 0,       // 满减优惠
    freight: 0,
    payAmount: 0,
    paying: false,
    totalAmountText: '¥0.00',
    discountText: '¥0.00',
    freightText: '免运费',
    payAmountText: '¥0.00',
    // 优惠券
    coupons: [],
    selectedCoupon: null,
    couponDiscount: 0,
    showCouponPanel: false
  },

  updateFormatted() {
    const couponDiscount = this.data.couponDiscount || 0
    const pay = Math.max(0, this.data.totalAmount - this.data.discountAmount - couponDiscount)
    this.setData({
      totalAmountText: formatPrice(this.data.totalAmount),
      discountText: formatPrice(this.data.discountAmount),
      freightText: this.data.freight === 0 ? '免运费' : formatPrice(this.data.freight),
      couponDiscountText: formatPrice(couponDiscount),
      payAmount: pay,
      payAmountText: formatPrice(pay)
    })
  },

  onLoad(options) {
    this.setData({
      mode: options.mode || 'cart',
      orderId: options.orderId || null
    })
    this.loadData()
  },

  async loadData() {
    // 地址
    const addrRes = await request({ url: '/address/list' })
    const addrList = addrRes.data || []
    const address = addrList.find(a => a.isDefault) || addrList[0] || null
    this.setData({ address })

    if (this.data.mode === 'order' && this.data.orderId) {
      const res = await request({ url: '/orders/detail', data: { id: this.data.orderId } })
      if (res.code === 200) {
        const o = res.data
        this.setData({
          items: (o.items || []).map(i => ({ ...i, priceText: formatPrice(i.price) })),
          totalAmount: o.totalAmount,
          discountAmount: o.discountAmount,
          freight: o.freight,
          couponDiscount: 0
        })
        this.updateFormatted()
      }
    } else if (this.data.mode === 'buyNow') {
      const buyNow = wx.getStorageSync('mk_buyNow')
      if (buyNow) {
        this.setData({
          items: (buyNow.items || []).map(i => ({ ...i, priceText: formatPrice(i.price) })),
          totalAmount: buyNow.payAmount,
          discountAmount: 0,
          freight: 0,
          couponDiscount: 0
        })
        this.updateFormatted()
      }
    } else {
      // 购物车结算
      const res = await request({ url: '/cart/list' })
      const cart = (res.data || []).filter(c => c.checked).map(c => ({ ...c, priceText: formatPrice(c.price) }))
      const total = cart.reduce((s, c) => s + c.price * c.count, 0)
      const discount = total >= 39 ? 5 : 0
      this.setData({
        items: cart,
        totalAmount: total,
        discountAmount: discount,
        freight: 0,
        couponDiscount: 0
      })
      this.updateFormatted()
    }

    // 加载可用优惠券
    await this.loadCoupons()
  },

  async loadCoupons() {
    const res = await request({ url: '/coupon/my', data: { status: 1 } })
    const list = (res.data || []).map(c => {
      // 计算是否可用 + 优惠金额
      let usable = true
      let reason = ''
      let discountAmount = 0
      if (this.data.totalAmount < c.threshold) {
        usable = false
        reason = `未满 ${c.threshold} 元`
      } else if (c.type === 2) {
        discountAmount = +(this.data.totalAmount * (1 - c.discount)).toFixed(2)
      } else {
        discountAmount = c.amount
      }
      return {
        ...c,
        amountText: c.amount ? formatPrice(c.amount) : '',
        discountText: c.discount ? (c.discount * 10).toFixed(1) + '折' : '',
        usable,
        reason,
        discountAmount
      }
    })
    // 按优惠金额降序
    list.sort((a, b) => b.discountAmount - a.discountAmount)
    this.setData({ coupons: list })
    // 自动匹配最优可用券
    const best = list.find(c => c.usable)
    if (best) {
      this.setData({ selectedCoupon: best, couponDiscount: best.discountAmount })
      this.updateFormatted()
    }
  },

  // 打开券弹层
  openCouponPanel() {
    this.setData({ showCouponPanel: true })
  },
  closeCouponPanel() {
    this.setData({ showCouponPanel: false })
  },

  // 选择券
  selectCoupon(e) {
    const { id } = e.currentTarget.dataset
    const coupon = this.data.coupons.find(c => c.id === id)
    if (!coupon || !coupon.usable) {
      toast.info(coupon ? coupon.reason : '该券不可用')
      return
    }
    // 再次点击取消选择
    if (this.data.selectedCoupon && this.data.selectedCoupon.id === id) {
      this.setData({ selectedCoupon: null, couponDiscount: 0 })
    } else {
      this.setData({ selectedCoupon: coupon, couponDiscount: coupon.discountAmount })
    }
    this.updateFormatted()
    this.setData({ showCouponPanel: false })
  },

  // 选择地址
  chooseAddress() {
    wx.navigateTo({ url: '/pages/address/list?mode=select' })
  },
  onAddressSelected(addr) {
    this.setData({ address: addr })
  },

  // 支付
  async handlePay() {
    if (this.data.paying) return
    if (!this.data.address) {
      toast.info('请先选择收货地址')
      return
    }
    this.setData({ paying: true })
    toast.loading('支付中')
    await new Promise(r => setTimeout(r, 2000))
    toast.hideLoading()

    const addressSnapshot = {
      name: this.data.address.name,
      phone: this.data.address.phone,
      address: `${this.data.address.province}${this.data.address.city}${this.data.address.district}${this.data.address.detail}`
    }

    if (this.data.mode === 'order' && this.data.orderId) {
      await request({ url: '/orders/pay', method: 'POST', data: { id: this.data.orderId } })
      // 使用券
      if (this.data.selectedCoupon) {
        await request({ url: '/coupon/use', method: 'POST', data: { couponId: this.data.selectedCoupon.id, orderId: this.data.orderId } })
      }
      toast.success('支付成功')
      setTimeout(() => {
        wx.redirectTo({ url: `/pages/order/detail?id=${this.data.orderId}` })
      }, 800)
    } else {
      const res = await request({
        url: '/orders/create',
        method: 'POST',
        data: {
          items: this.data.items,
          address: addressSnapshot,
          totalAmount: this.data.totalAmount,
          discountAmount: this.data.discountAmount + this.data.couponDiscount,
          freight: this.data.freight,
          payAmount: this.data.payAmount
        }
      })
      if (res.code === 200) {
        // 使用券
        if (this.data.selectedCoupon) {
          await request({ url: '/coupon/use', method: 'POST', data: { couponId: this.data.selectedCoupon.id, orderId: res.data.id } })
        }
        toast.success('支付成功')
        updateCartBadge()
        wx.removeStorageSync('mk_buyNow')
        setTimeout(() => {
          wx.redirectTo({ url: `/pages/order/detail?id=${res.data.id}` })
        }, 800)
      } else {
        toast.error('支付失败')
      }
    }
    this.setData({ paying: false })
  },

  onImgError(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ [`items[${index}].mainPic`]: '/static/images/default.png' })
  }
})
