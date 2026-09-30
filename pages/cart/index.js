// pages/cart/index.js —— 购物车页（模块 3）
import { get, post } from '../../api/http.js'
import { success, fail, confirm } from '../../utils/toast.js'
import { formatPrice } from '../../utils/format.js'

Page({
  data: {
    cart: [],
    invalidItems: [],
    address: null,
    allChecked: false,
    totalPrice: 0,
    totalCount: 0,
    discount: 0,
    // 猜你喜欢
    recommends: [],
    // 左滑删除
    swipedId: null,
    loading: true
  },

  onShow() {
    // 检查是否有选中的地址（从地址列表返回）
    const selected = wx.getStorageSync('selectedAddress')
    if (selected) {
      this.setData({ address: selected })
      wx.removeStorageSync('selectedAddress')
    }
    this.loadCart()
    this.loadAddress()
    this.loadRecommends()
    const app = getApp()
    app.refreshCartCount && app.refreshCartCount()
  },

  async loadCart() {
    const cart = await get('/cart/list')
    this.splitCart(cart)
    this.setData({ loading: false })
  },

  splitCart(cart) {
    const valid = cart.filter(x => x.stock > 0)
    const invalid = cart.filter(x => x.stock <= 0)
    this.computeTotal(valid)
    this.setData({ cart: valid, invalidItems: invalid })
  },

  computeTotal(valid) {
    let totalPrice = 0
    let totalCount = 0
    let allChecked = true
    valid.forEach(v => {
      if (v.checked) {
        totalPrice += v.price * v.count
        totalCount++
      } else {
        allChecked = false
      }
    })
    allChecked = valid.length ? allChecked : false
    // 满减：满39减5
    let discount = 0
    if (totalPrice >= 99) discount = 15
    else if (totalPrice >= 39) discount = 5
    this.setData({
      totalPrice,
      totalCount,
      allChecked,
      discount,
      payPriceText: formatPrice(totalPrice - discount),
      discountText: formatPrice(discount)
    })
  },

  async loadAddress() {
    const list = await get('/user/address')
    const def = list.find(a => a.isDefault) || list[0]
    this.setData({ address: def || null })
  },

  async loadRecommends() {
    const goods = await get('/goods/recommend', {})
    this.setData({ recommends: goods.slice(0, 6) })
  },

  // 选择地址：跳转地址列表（选择模式）
  handleChooseAddress() {
    wx.navigateTo({ url: '/pages/address/list?mode=select' })
  },

  // 新增地址
  handleAddAddress() {
    wx.navigateTo({ url: '/pages/address/edit' })
  },

  onShow() {
    // 检查是否有选中的地址（从地址列表返回）
    const selected = wx.getStorageSync('selectedAddress')
    if (selected) {
      this.setData({ address: selected })
      wx.removeStorageSync('selectedAddress')
    }
    this.loadCart()
    this.loadAddress()
    this.loadRecommends()
    const app = getApp()
    app.refreshCartCount && app.refreshCartCount()
  },

  // 单选
  async handleItemChange(e) {
    const { id } = e.currentTarget.dataset
    const cart = [...this.data.cart]
    const item = cart.find(x => x.id === id)
    item.checked = !item.checked
    await post('/cart/update', { id, checked: item.checked })
    this.splitCart(cart)
  },

  // 全选
  async handleAllChecked() {
    const allChecked = !this.data.allChecked
    const cart = this.data.cart.map(x => ({ ...x, checked: allChecked }))
    // 批量更新
    for (const item of cart) {
      await post('/cart/update', { id: item.id, checked: allChecked })
    }
    this.splitCart(cart)
  },

  // 数量调整
  async handleItemNumEdit(e) {
    const { id, operation } = e.currentTarget.dataset
    const cart = [...this.data.cart]
    const item = cart.find(x => x.id === id)
    if (item.count === 1 && operation === -1) {
      const ok = await confirm('您是否要删除该商品?')
      if (ok) {
        await post('/cart/remove', { ids: [id] })
        this.loadCart()
        success('已删除')
      }
      return
    }
    item.count += operation
    await post('/cart/update', { id, count: item.count })
    this.splitCart(cart)
  },

  // 左滑删除
  async handleSwipeDelete(e) {
    const { id } = e.currentTarget.dataset
    const ok = await confirm('确定删除该商品?')
    if (ok) {
      await post('/cart/remove', { ids: [id] })
      this.loadCart()
      success('已删除')
    }
    this.setData({ swipedId: null })
  },

  // 清空失效商品
  async clearInvalid() {
    await post('/cart/clearInvalid')
    this.loadCart()
    success('已清空')
  },

  // 去结算
  async handlePay() {
    const { address, totalCount, cart } = this.data
    if (!address) {
      fail('请先选择收货地址')
      return
    }
    if (totalCount === 0) {
      fail('请选择要购买的商品')
      return
    }
    // 传递选中商品到支付页
    const selected = cart.filter(x => x.checked)
    wx.setStorageSync('checkoutItems', selected)
    wx.navigateTo({ url: '/pages/pay/index' })
  },

  // 去逛逛
  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  // 跳转推荐商品
  goRecommend(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  // 图片错误
  handleImgError(e) {
    const { field, index } = e.currentTarget.dataset
    if (field) {
      this.setData({ [field]: '/static/images/default.png' })
    } else if (index !== undefined) {
      this.setData({ [`cart[${index}].mainPic`]: '/static/images/default.png' })
    }
  },

  // 触摸开始/结束（左滑删除）
  touchStartX: 0,
  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX
  },
  handleTouchEnd(e) {
    const delta = e.changedTouches[0].clientX - this.touchStartX
    const { id } = e.currentTarget.dataset
    if (delta < -50) {
      this.setData({ swipedId: id })
    } else if (delta > 50) {
      this.setData({ swipedId: null })
    }
  },

  // 点击空白关闭左滑
  closeSwipe() {
    this.setData({ swipedId: null })
  }
})
