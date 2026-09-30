// pages/pay/index.js —— 支付确认页（含优惠券选择）
import { request } from '../../api/http.js'
import common from '../../behaviors/common.js'
import { toastSuccess, toastInfo, confirm } from '../../utils/toast.js'
import regeneratorRuntime from '../../lib/runtime/runtime.js'

Page({
  behaviors: [common],
  data: {
    items: [],
    address: {},
    totalAmount: 0,
    promoDiscount: 0,      // 满减
    couponDiscount: 0,     // 优惠券
    freight: 0,
    payAmount: '0.00',
    remark: '',
    paying: false,
    // 优惠券
    showCoupon: false,
    availableCoupons: [],  // 可用券
    unavailableCoupons: [], // 不可用券 + 原因
    selectedCoupon: null,
    selectedCouponId: null,
    couponHint: '暂无可用券'
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    const pending = wx.getStorageSync('pending_buy')
    if (!pending || !pending.items || pending.items.length === 0) {
      toastInfo('没有待结算的商品')
      setTimeout(() => wx.navigateBack(), 1000)
      return
    }
    const items = pending.items
    const total = items.reduce((s, it) => s + it.price * it.count, 0)
    const promoDiscount = total >= 99 ? 10 : total >= 49 ? 5 : 0
    const freight = 0

    // 地址
    let address = null
    const list = await request({ url: '/address/list' })
    if (pending.addressId) {
      address = list.find(a => a.id === Number(pending.addressId)) || list.find(a => a.isDefault) || list[0]
    } else {
      address = list.find(a => a.isDefault) || list[0]
    }

    // 加载用户券并计算可用性
    const myCoupons = await request({ url: '/coupon/list' })
    const { available, unavailable } = this.computeCoupons(myCoupons, total)

    // 自动匹配最优可用券（优惠金额最大）
    let best = null
    if (available.length > 0) {
      best = available.reduce((a, b) => (this.couponValue(b) > this.couponValue(a) ? b : a))
    }

    this.setData({
      items,
      address: address || {},
      totalAmount: total,
      promoDiscount,
      freight,
      availableCoupons: available,
      unavailableCoupons: unavailable,
      selectedCoupon: best,
      selectedCouponId: best ? best.id : null,
      couponHint: available.length > 0 ? `可用 ${available.length} 张券` : '暂无可用券'
    })
    this.recalc()
  },

  // 计算券优惠金额
  couponValue(coupon) {
    const tpl = coupon.template || {}
    if (tpl.type === 'cash') return tpl.value
    if (tpl.type === 'discount') {
      // 折扣券：按总价 * (1 - value) 估算（封顶）
      return Math.round(this.data.totalAmount * (1 - tpl.value) * 100) / 100
    }
    return tpl.value // 无门槛
  },

  // 计算可用/不可用券
  computeCoupons(myCoupons, total) {
    const available = []
    const unavailable = []
    myCoupons.filter(c => c.status === 'unused').forEach(c => {
      const tpl = c.template || {}
      let reason = ''
      if (tpl.threshold > total) {
        reason = `未满 ${tpl.threshold} 元（差 ${(tpl.threshold - total).toFixed(2)} 元）`
      } else if (c.expireTime && c.expireTime < Date.now()) {
        reason = '已过期'
      }
      if (reason) unavailable.push({ ...c, reason })
      else available.push(c)
    })
    return { available, unavailable }
  },

  // 重算实付
  recalc() {
    let couponDiscount = 0
    if (this.data.selectedCoupon) {
      const tpl = this.data.selectedCoupon.template || {}
      if (tpl.type === 'cash' || tpl.type === 'none') {
        couponDiscount = tpl.value
      } else if (tpl.type === 'discount') {
        couponDiscount = Math.round(this.data.totalAmount * (1 - tpl.value) * 100) / 100
      }
    }
    // 券优惠 + 满减不能超过总价
    const total = this.data.totalAmount
    const promo = this.data.promoDiscount
    let payAmount = total - promo - couponDiscount
    if (payAmount < 0) payAmount = 0
    this.setData({
      couponDiscount,
      payAmount: payAmount.toFixed(2)
    })
  },

  // ===== 券弹层 =====
  openCoupon() {
    this.setData({ showCoupon: true })
  },
  closeCoupon() {
    this.setData({ showCoupon: false })
  },
  selectCoupon(e) {
    const { id } = e.currentTarget.dataset
    const coupon = this.data.availableCoupons.find(c => c.id === id)
    this.setData({
      selectedCoupon: coupon,
      selectedCouponId: id,
      showCoupon: false
    })
    this.recalc()
  },
  clearCoupon() {
    this.setData({ selectedCoupon: null, selectedCouponId: null })
    this.recalc()
  },

  onRemark(e) {
    this.setData({ remark: e.detail.value })
  },

  async handlePay() {
    if (this.data.paying) return
    if (!this.data.address.name) {
      toastInfo('请先选择收货地址')
      return
    }
    this.setData({ paying: true })
    wx.showLoading({ title: '支付中', mask: true })
    try {
      // 1. 创建订单
      const order = await request({
        url: '/orders/create',
        method: 'POST',
        data: {
          items: this.data.items,
          addressId: this.data.address.id,
          remark: this.data.remark
        }
      })
      // 2. 使用优惠券（若选择）
      if (this.data.selectedCouponId) {
        await request({ url: '/coupon/use', method: 'POST', data: { couponId: this.data.selectedCouponId } })
      }
      // 3. 模拟支付
      await new Promise(r => setTimeout(r, 1500))
      await request({
        url: '/orders/pay',
        method: 'POST',
        data: { orderNo: order.orderNo, createTime: order.createTime }
      })
      // 4. 购物积分（每1元=1积分）
      await request({ url: '/points/add', method: 'POST', data: { amount: Math.round(this.data.totalAmount), source: '购物', desc: `订单消费 ${this.data.totalAmount} 元` } }).catch(() => {})
      // 5. 推送订单消息
      await request({
        url: '/message/push',
        method: 'POST',
        data: {
          type: 2,
          title: '支付成功',
          content: `订单「${this.data.items[0].name}${this.data.items.length > 1 ? ' 等' : ''}」支付成功，商家正在备货。`,
          relatedId: order.id
        }
      }).catch(() => {})
      wx.hideLoading()
      wx.removeStorageSync('pending_buy')
      this.refreshCartBadge()
      wx.showToast({ title: '支付成功', icon: 'success', mask: true })
      setTimeout(() => {
        wx.redirectTo({ url: `/pages/order/detail/index?id=${order.id}` })
      }, 1200)
    } catch (e) {
      wx.hideLoading()
      this.setData({ paying: false })
      toastInfo('支付失败，请重试')
    }
  },

  chooseAddress() {
    wx.navigateTo({ url: '/pages/address/list/index?mode=select' })
  },

  previewImg(e) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({ urls: [url], current: url })
  }
})
