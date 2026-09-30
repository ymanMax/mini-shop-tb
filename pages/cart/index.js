// pages/cart/index.js —— 购物车完善
import { request } from '../../api/http.js'
import common from '../../behaviors/common.js'
import { formatPrice } from '../../utils/format.js'
import { toastSuccess, toastInfo, confirm } from '../../utils/toast.js'
import regeneratorRuntime from '../../lib/runtime/runtime.js'

Page({
  behaviors: [common],
  data: {
    validItems: [],
    invalidItems: [],
    address: {},
    allChecked: false,
    totalPrice: '0.00',
    totalCount: 0,
    recommend: [],
    loading: true,
    // 左滑删除
    swipedId: null
  },

  onShow() {
    this.loadCart()
    this.loadAddress()
    this.loadRecommend()
    this.refreshCartBadge()
  },

  async loadCart() {
    this.setData({ loading: true })
    const res = await request({ url: '/cart/list' })
    const valid = (res.valid || []).map(it => ({ ...it, subtotal: (it.price * it.count).toFixed(2) }))
    const invalid = res.invalid || []
    const allChecked = valid.length > 0 && valid.every(v => v.checked)
    const total = valid.filter(v => v.checked).reduce((s, v) => s + v.price * v.count, 0)
    this.setData({
      validItems: valid,
      invalidItems: invalid,
      allChecked,
      totalPrice: total.toFixed(2),
      totalCount: valid.filter(v => v.checked).reduce((s, v) => s + v.count, 0),
      loading: false
    })
  },

  async loadAddress() {
    const list = await request({ url: '/address/list' })
    const def = list.find(a => a.isDefault) || list[0] || {}
    this.setData({ addresses: list, address: def })
  },

  async loadRecommend() {
    const res = await request({ url: '/goods/list', data: { size: 6, sort: 'sales' } })
    this.setData({ recommend: res.records || [] })
  },

  // ===== 勾选（通过 api 层更新）=====
  async toggleItem(e) {
    const { id } = e.currentTarget.dataset
    const item = this.data.validItems.find(v => v.id === id)
    await request({ url: '/cart/update', method: 'POST', data: { id, checked: !item.checked } })
    this.loadCart()
  },

  async toggleAll() {
    const allChecked = !this.data.allChecked
    // 逐条更新（mock 模式批量联动）
    for (const v of this.data.validItems) {
      await request({ url: '/cart/update', method: 'POST', data: { id: v.id, checked: allChecked } })
    }
    this.loadCart()
  },

  // ===== 数量加减 =====
  async changeCount(e) {
    const { id, op } = e.currentTarget.dataset
    const item = this.data.validItems.find(v => v.id === id)
    if (!item) return
    let count = item.count + op
    if (count <= 0) {
      const ok = await confirm('确定删除该商品吗？')
      if (!ok) return
      this.removeItem(id)
      return
    }
    if (count > item.stock) {
      toastInfo('已达到库存上限')
      count = item.stock
    }
    await request({ url: '/cart/update', method: 'POST', data: { id, count } })
    this.loadCart()
  },

  async removeItem(id) {
    await request({ url: '/cart/remove', method: 'POST', data: { ids: [id] } })
    toastSuccess('已删除')
    this.loadCart()
  },

  clearInvalid() {
    request({ url: '/cart/clearInvalid', method: 'POST' }).then(() => {
      toastSuccess('已清空失效商品')
      this.loadCart()
    })
  },

  // ===== 左滑删除 =====
  touchStart(e) {
    this._touchX = e.touches[0].clientX
    this._touchId = e.currentTarget.dataset.id
  },
  touchMove(e) {
    const dx = e.touches[0].clientX - this._touchX
    if (dx < -40 && this._touchId) {
      this.setData({ swipedId: this._touchId })
    } else if (dx > 40) {
      this.setData({ swipedId: null })
    }
  },
  touchEnd() {
    // 保持打开状态，点击删除按钮执行
  },
  closeSwipe() {
    this.setData({ swipedId: null })
  },

  // ===== 地址：跳转列表页（选择模式）=====
  openAddress() {
    wx.navigateTo({ url: '/pages/address/list/index?mode=select' })
  },

  // ===== 结算 =====
  async handlePay() {
    if (!this.data.address.name) {
      toastInfo('请先选择收货地址')
      return
    }
    if (this.data.totalCount === 0) {
      toastInfo('请选择要结算的商品')
      return
    }
    const items = this.data.validItems.filter(v => v.checked).map(v => ({
      goodsId: v.goodsId,
      name: v.name,
      mainPic: v.mainPic,
      specText: v.specText,
      price: v.price,
      count: v.count
    }))
    wx.setStorageSync('pending_buy', { items, from: 'cart', addressId: this.data.address.id })
    wx.navigateTo({ url: '/pages/pay/index' })
  },

  // ===== 推荐 =====
  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },
  goShop() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  previewImg(e) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({ urls: [url], current: url })
  }
})
