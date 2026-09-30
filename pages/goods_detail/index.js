// pages/goods_detail/index.js —— 商品详情（含评价模块）
import { request } from '../../api/http.js'
import common from '../../behaviors/common.js'
import { priceText, formatRelative } from '../../utils/format.js'
import { toastSuccess, toastInfo } from '../../utils/toast.js'
import regeneratorRuntime from '../../lib/runtime/runtime.js'

Page({
  behaviors: [common],
  data: {
    goodsId: null,
    goods: {},
    pics: [],
    swiperIndex: 0,
    // SKU 弹层
    showSku: false,
    skuMode: 'cart', // cart | buy
    specs: [],
    selected: {}, // {规格: '10个装 1kg', 口味: '原味'}
    skuPrice: 0,
    skuStock: 0,
    count: 1,
    selectedText: '',
    // 收藏
    isCollect: false,
    cartCount: 0,
    // 参数折叠
    showParams: false,
    // 评价
    reviews: [],
    allReviews: [],
    reviewSummary: { total: 0, avg: '5.0', distribution: [] },
    reviewFilter: 'all', // all | good | mid | bad | withImage
    showAllReviews: false,
    // 推荐
    recommend: [],
    loading: true
  },

  onLoad(options) {
    this.setData({ goodsId: options.goods_id })
    this.loadDetail()
    // 记录浏览足迹（去重 + 移到最前 + 上限50）
    request({ url: '/history/add', method: 'POST', data: { goodsId: options.goods_id } }).catch(() => {})
  },

  onShow() {
    this.refreshCartBadge()
    this.loadCartCount()
    // 从评价页/收藏返回时，刷新评价区与收藏态（不重建整页，避免丢失 SKU 选择）
    if (this.data.goodsId && !this.data.loading) {
      this.refreshReviews()
    }
  },

  async refreshReviews() {
    try {
      const [goods, reviews] = await Promise.all([
        request({ url: '/goods/detail', data: { goodsId: this.data.goodsId } }),
        request({ url: '/goods/reviews', data: { goodsId: this.data.goodsId, page: 1, size: 100 } })
      ])
      const allReviews = (reviews.records || []).map(r => ({ ...r, timeText: formatRelative(r.createTime) }))
      this.setData({
        isCollect: goods.isCollect,
        reviewSummary: goods.reviewSummary,
        allReviews,
        reviews: this.filterReviews(this.data.reviewFilter, allReviews).slice(0, this.data.showAllReviews ? 100 : 3)
      })
    } catch (e) { /* ignore */ }
  },

  async loadDetail() {
    wx.showLoading({ title: '加载中', mask: true })
    try {
      const goods = await request({ url: '/goods/detail', data: { goodsId: this.data.goodsId } })
      const reviews = await request({ url: '/goods/reviews', data: { goodsId: this.data.goodsId, page: 1, size: 100 } })
      const recommend = await request({ url: '/goods/recommend', data: { goodsId: this.data.goodsId } })
      const allReviews = (reviews.records || []).map(r => ({ ...r, timeText: formatRelative(r.createTime) }))
      this.setData({
        goods,
        pics: goods.pics,
        detailImages: goods.detailImages,
        skuPrice: goods.price,
        skuStock: goods.stock,
        isCollect: goods.isCollect,
        reviewSummary: goods.reviewSummary,
        allReviews,
        reviews: this.filterReviews('all', allReviews).slice(0, 3),
        recommend,
        loading: false
      })
      wx.hideLoading()
    } catch (e) {
      wx.hideLoading()
      this.setData({ loading: false })
    }
  },

  loadCartCount() {
    const cart = wx.getStorageSync('mock_cart') || []
    this.setData({ cartCount: cart.filter(c => c.valid).reduce((s, c) => s + c.count, 0) })
  },

  // ===== 轮播 =====
  onSwiperChange(e) {
    this.setData({ swiperIndex: e.detail.current })
  },
  previewImage(e) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({ urls: this.data.pics, current: url })
  },

  // ===== SKU =====
  openSku(e) {
    const mode = e.currentTarget.dataset.mode || 'cart'
    // 有规格才需要选择；无规格直接执行
    if (!this.data.goods.specs || this.data.goods.specs.length === 0) {
      if (mode === 'cart') this.confirmAddCart()
      else this.confirmBuy()
      return
    }
    this.setData({
      showSku: true,
      skuMode: mode,
      specs: this.data.goods.specs,
      selected: {},
      selectedText: '',
      count: 1,
      skuPrice: this.data.goods.price,
      skuStock: this.data.goods.stock
    })
  },
  closeSku() {
    this.setData({ showSku: false })
  },
  // 阻止冒泡，点击内容区不关闭
  stopPropagation() {},

  selectSpec(e) {
    const { specname, label } = e.currentTarget.dataset
    const selected = { ...this.data.selected }
    // 取消再点
    if (selected[specname] === label) delete selected[specname]
    else selected[specname] = label
    this.setData({ selected })
    this.computeSku()
  },

  computeSku() {
    const { goods, selected } = this.data
    let price = goods.price
    let stock = goods.stock
    ;(goods.specs || []).forEach(spec => {
      const val = selected[spec.name]
      if (!val) return
      const opt = spec.values.find(v => v.label === val)
      if (!opt) return
      if (['规格', '数量', '包装', '尺寸'].includes(spec.name)) {
        if (opt.price !== undefined) price = opt.price
        if (opt.stock !== undefined) stock = opt.stock
      } else {
        if (opt.price) price += opt.price
      }
    })
    const specText = (goods.specs || []).map(sp => selected[sp.name]).filter(Boolean).join(' · ')
    this.setData({ skuPrice: +price.toFixed(2), skuStock: stock, selectedText: specText })
  },

  changeCount(e) {
    const { op } = e.currentTarget.dataset
    let count = this.data.count + op
    if (count < 1) count = 1
    if (count > this.data.skuStock) {
      toastInfo('已达到库存上限')
      count = this.data.skuStock
    }
    this.setData({ count })
  },

  // 检查规格是否选完整
  checkComplete() {
    const { goods, selected } = this.data
    if (!goods.specs || goods.specs.length === 0) return true
    return goods.specs.every(s => selected[s.name])
  },

  buildSpecText() {
    const { goods, selected } = this.data
    if (!goods.specs || goods.specs.length === 0) return '默认规格'
    return goods.specs.map(s => selected[s.name]).filter(Boolean).join(' · ')
  },

  // 加入购物车
  async confirmAddCart() {
    if (!this.checkComplete()) {
      toastInfo('请选择完整规格')
      return
    }
    const { goods, skuPrice, count, selected } = this.data
    const res = await this.addToCartApi({
      goodsId: goods.id,
      specText: this.buildSpecText(),
      price: skuPrice,
      count,
      mainPic: goods.mainPic,
      name: goods.name
    })
    if (res && res.success) {
      toastSuccess('已加入购物车')
      this.setData({ showSku: false })
      this.loadCartCount()
    }
  },

  // 立即购买
  confirmBuy() {
    if (!this.checkComplete()) {
      toastInfo('请选择完整规格')
      return
    }
    const { goods, skuPrice, count } = this.data
    const pending = {
      items: [{
        goodsId: goods.id,
        name: goods.name,
        mainPic: goods.mainPic,
        specText: this.buildSpecText(),
        price: skuPrice,
        count
      }],
      from: 'buyNow'
    }
    wx.setStorageSync('pending_buy', pending)
    this.setData({ showSku: false })
    wx.navigateTo({ url: '/pages/pay/index' })
  },

  // ===== 收藏 =====
  async handleCollect() {
    const res = await request({ url: '/collect/toggle', method: 'POST', data: { goodsId: this.data.goodsId } })
    this.setData({ isCollect: res.isCollect })
    toastSuccess(res.isCollect ? '收藏成功' : '已取消收藏')
  },

  // ===== 参数折叠 =====
  toggleParams() {
    this.setData({ showParams: !this.data.showParams })
  },

  // ===== 评价 =====
  filterReviews(filter, list) {
    const source = list || this.data.allReviews
    switch (filter) {
      case 'good': return source.filter(r => r.rating >= 4)
      case 'mid': return source.filter(r => r.rating === 3)
      case 'bad': return source.filter(r => r.rating <= 2)
      case 'withImage': return source.filter(r => r.images && r.images.length > 0)
      default: return source
    }
  },
  setReviewFilter(e) {
    const { filter } = e.currentTarget.dataset
    this.setData({
      reviewFilter: filter,
      reviews: this.filterReviews(filter).slice(0, this.data.showAllReviews ? 100 : 3)
    })
  },
  toggleShowAll() {
    const showAll = !this.data.showAllReviews
    this.setData({
      showAllReviews: showAll,
      reviews: this.filterReviews(this.data.reviewFilter).slice(0, showAll ? 100 : 3)
    })
  },
  previewReviewImg(e) {
    const { urls, current } = e.currentTarget.dataset
    wx.previewImage({ urls, current })
  },

  // ===== 推荐 =====
  goRecommend(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  goCart() {
    wx.switchTab({ url: '/pages/cart/index' })
  },

  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '客服热线：400-618-4000\n服务时间：9:00-21:00',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: this.data.goods.name,
      imageUrl: this.data.goods.mainPic,
      path: `/pages/goods_detail/index?goods_id=${this.data.goodsId}`
    }
  }
})
