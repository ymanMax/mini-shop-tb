// pages/cart/index.js
import { request, updateCartBadge } from '../../api/http.js'
import { toast, confirm } from '../../utils/toast.js'
import { formatPrice } from '../../utils/format.js'

Page({
  data: {
    address: null,
    cart: [],
    invalidCart: [],
    allChecked: false,
    totalPrice: '¥0.00',
    totalCount: 0,
    discountText: '',
    recommendList: [],
    // 左滑
    swipeId: null,
    touchStartX: 0
  },

  onShow() {
    updateCartBadge()
    this.loadAddress()
    this.loadCart()
    this.loadRecommend()
  },

  async loadAddress() {
    const res = await request({ url: '/address/list' })
    const list = res.data || []
    const def = list.find(a => a.isDefault) || list[0] || null
    this.setData({ addressList: list, address: def })
  },

  async loadCart() {
    const res = await request({ url: '/cart/list' })
    const cart = (res.data || []).map(c => ({ ...c, priceText: formatPrice(c.price) }))
    const valid = cart.filter(c => c.stock > 0)
    const invalid = cart.filter(c => c.stock <= 0)
    this.setData({ cart: valid, invalidCart: invalid })
    this.calcTotal(valid)
  },

  async loadRecommend() {
    const res = await request({ url: '/goods/list', data: { page: 1, size: 6, sort: 'sales' } })
    if (res.code === 200) {
      this.setData({ recommendList: (res.data.records || []).map(g => ({ ...g, priceText: formatPrice(g.price) })) })
    }
  },

  calcTotal(cart) {
    let total = 0
    let count = 0
    let allChecked = cart.length > 0
    cart.forEach(v => {
      if (v.checked) {
        total += v.price * v.count
        count += v.count
      } else {
        allChecked = false
      }
    })
    // 满减优惠：满39减5
    let discount = 0
    if (total >= 39) discount = 5
    this.setData({
      allChecked,
      totalPrice: formatPrice(total - discount),
      totalCount: count,
      discountText: discount > 0 ? '已优惠 ¥5.00（满39减5）' : '满39元减5元'
    })
  },

  // ============ 勾选 ============
  async toggleCheck(e) {
    const { id } = e.currentTarget.dataset
    const cart = this.data.cart.map(c => c.id === id ? { ...c, checked: !c.checked } : c)
    await request({ url: '/cart/update', method: 'POST', data: { id, checked: !this.data.cart.find(c => c.id === id).checked } })
    this.setData({ cart })
    this.calcTotal(cart)
  },

  async toggleAll() {
    const next = !this.data.allChecked
    const cart = this.data.cart.map(c => ({ ...c, checked: next }))
    await Promise.all(cart.map(c => request({ url: '/cart/update', method: 'POST', data: { id: c.id, checked: next } })))
    this.setData({ cart })
    this.calcTotal(cart)
  },

  // ============ 数量 ============
  async changeCount(e) {
    const { id, delta } = e.currentTarget.dataset
    const item = this.data.cart.find(c => c.id === id)
    if (!item) return
    let count = item.count + Number(delta)
    if (count < 1) {
      const ok = await confirm('您是否要删除该商品？')
      if (ok) {
        await request({ url: '/cart/remove', method: 'POST', data: { id } })
        toast.success('已删除')
        this.loadCart()
        updateCartBadge()
      }
      return
    }
    if (count > item.stock) {
      toast.info('已达库存上限')
      return
    }
    await request({ url: '/cart/update', method: 'POST', data: { id, count } })
    const cart = this.data.cart.map(c => c.id === id ? { ...c, count } : c)
    this.setData({ cart })
    this.calcTotal(cart)
  },

  // ============ 左滑删除 ============
  onTouchStart(e) {
    this.setData({ touchStartX: e.touches[0].clientX })
  },
  onTouchEnd(e) {
    const { id } = e.currentTarget.dataset
    const delta = e.changedTouches[0].clientX - this.data.touchStartX
    if (delta < -60) {
      this.setData({ swipeId: id })
    } else {
      // 轻点或右滑：收起
      this.setData({ swipeId: null })
    }
  },
  closeSwipe() {
    this.setData({ swipeId: null })
  },

  async removeItem(e) {
    const { id } = e.currentTarget.dataset
    await request({ url: '/cart/remove', method: 'POST', data: { id } })
    toast.success('已删除')
    this.setData({ swipeId: null })
    this.loadCart()
    updateCartBadge()
  },

  async clearInvalid() {
    const ok = await confirm('确定清空所有失效商品？')
    if (!ok) return
    await request({ url: '/cart/clearInvalid', method: 'POST' })
    toast.success('已清空')
    this.loadCart()
  },

  // ============ 地址 ============
  // 跳转地址列表（选择模式）
  openAddressPanel() {
    wx.navigateTo({ url: '/pages/address/list?mode=select' })
  },

  // 地址列表选中后回调（由地址页 navigateBack 前调用）
  onAddressSelected(addr) {
    this.setData({ address: addr })
    this.loadAddress()
  },

  // ============ 结算 ============
  async handlePay() {
    if (!this.data.address) {
      toast.info('请先选择收货地址')
      return
    }
    if (this.data.totalCount === 0) {
      toast.info('请选择要结算的商品')
      return
    }
    wx.navigateTo({ url: '/pages/pay/index?mode=cart' })
  },

  // 去逛逛
  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  onImgError(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ [`cart[${index}].mainPic`]: '/static/images/default.png' })
  }
})
