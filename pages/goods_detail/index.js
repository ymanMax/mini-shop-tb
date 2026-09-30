// pages/goods_detail/index.js
import { request, updateCartBadge } from '../../api/http.js'
import { toast } from '../../utils/toast.js'
import { formatPrice, formatRelative } from '../../utils/format.js'

Page({
  data: {
    goodsId: null,
    goods: {},
    pics: [],
    currentPicIndex: 0,
    // SKU
    showSku: false,
    skuAction: 'cart',
    selectedSpecs: {},      // {规格: '3斤装', 口味: '原味'}
    skuPrice: 0,
    skuStock: 0,
    count: 1,
    specsText: '',
    // 评价
    reviewStats: { total: 0, avg: '5.0', dist: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } },
    reviewFilter: 'all',    // all / good / mid / bad / withImage
    reviewList: [],
    reviewPage: 1,
    reviewTotal: 0,
    reviewExpanded: false,
    // 推荐
    recommendList: [],
    // 折叠
    paramsOpen: false,
    cartCount: 0,
    isCollect: false
  },

  onLoad(options) {
    this.setData({ goodsId: Number(options.goods_id) })
    this.loadDetail()
    this.loadRecommend()
    // 记录浏览足迹
    request({ url: '/history/add', method: 'POST', data: { goodsId: Number(options.goods_id) } })
  },

  onShow() {
    updateCartBadge()
    this.setData({ cartCount: this.getCartCount() })
  },

  getCartCount() {
    const cart = wx.getStorageSync('mk_cart') || []
    return cart.reduce((s, c) => s + c.count, 0)
  },

  // 加载商品详情
  async loadDetail() {
    const res = await request({ url: '/goods/detail', data: { id: this.data.goodsId } })
    if (res.code !== 200) {
      toast.error('商品不存在')
      return
    }
    const goods = res.data
    // 默认选中每个规格维度的第一个选项
    const selectedSpecs = {}
    if (goods.specs) {
      goods.specs.forEach(s => {
        if (s.values && s.values.length) selectedSpecs[s.name] = s.values[0].label
      })
    }
    this.setData({
      goods,
      pics: goods.pics || [],
      isCollect: goods.isCollect,
      skuPrice: goods.price,
      skuPriceText: formatPrice(goods.price),
      originalPriceText: formatPrice(goods.originalPrice),
      skuStock: goods.stock,
      selectedSpecs,
      specsText: Object.values(selectedSpecs).join(' · ')
    })
    this.loadReviews()
  },

  // 加载推荐
  async loadRecommend() {
    if (!this.data.goods.categoryId) return
    const res = await request({ url: '/goods/recommend', data: { categoryId: this.data.goods.categoryId, excludeId: this.data.goodsId } })
    if (res.code === 200) {
      this.setData({ recommendList: (res.data || []).map(g => ({ ...g, priceText: formatPrice(g.price) })) })
    }
  },

  // ============ 轮播 ============
  onSwiperChange(e) {
    this.setData({ currentPicIndex: e.detail.current })
  },
  previewImage(e) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({ urls: this.data.pics, current: url })
  },

  // ============ SKU ============
  openSku(e) {
    const { action } = e.currentTarget.dataset
    this.setData({ showSku: true, skuAction: action || 'cart' })
  },
  closeSku() {
    this.setData({ showSku: false })
  },
  stopPropagation() {},

  // 选择规格
  onSpecTap(e) {
    const { specName, label } = e.currentTarget.dataset
    const selectedSpecs = { ...this.data.selectedSpecs, [specName]: label }
    // 联动价格/库存：取带 price/stock 的选项
    let skuPrice = this.data.goods.price
    let skuStock = this.data.goods.stock
    this.data.goods.specs.forEach(s => {
      const val = s.values.find(v => v.label === selectedSpecs[s.name])
      if (val) {
        if (val.price !== undefined) skuPrice = val.price
        if (val.stock !== undefined) skuStock = val.stock
      }
    })
    this.setData({ selectedSpecs, skuPrice, skuPriceText: formatPrice(skuPrice), skuStock, count: Math.min(this.data.count, skuStock || 1), specsText: Object.values(selectedSpecs).join(' · ') })
  },

  // 数量调整
  onCountChange(e) {
    const { delta } = e.currentTarget.dataset
    let count = this.data.count + delta
    const stock = this.data.skuStock || 999
    if (count < 1) count = 1
    if (count > stock) {
      toast.info('已达库存上限')
      count = stock
    }
    this.setData({ count })
  },
  onCountInput(e) {
    let count = parseInt(e.detail.value, 10) || 1
    const stock = this.data.skuStock || 999
    if (count > stock) count = stock
    if (count < 1) count = 1
    this.setData({ count })
  },

  // 检查规格是否选全
  checkSpecs() {
    const { goods, selectedSpecs } = this.data
    if (!goods.specs || !goods.specs.length) return true
    return goods.specs.every(s => selectedSpecs[s.name])
  },

  // 加入购物车
  async confirmAddCart() {
    if (!this.checkSpecs()) {
      toast.info('请选择完整规格')
      return
    }
    const specText = Object.values(this.data.selectedSpecs).join(' · ')
    const res = await request({
      url: '/cart/add',
      method: 'POST',
      data: {
        goodsId: this.data.goodsId,
        specText,
        price: this.data.skuPrice,
        count: this.data.count,
        mainPic: this.data.goods.mainPic,
        name: this.data.goods.name,
        stock: this.data.skuStock
      }
    })
    if (res.code === 200) {
      toast.success('加入成功')
      this.setData({ showSku: false, cartCount: this.getCartCount() })
      updateCartBadge()
    }
  },

  // 立即购买
  buyNow() {
    if (!this.checkSpecs()) {
      toast.info('请选择完整规格')
      return
    }
    const specText = Object.values(this.data.selectedSpecs).join(' · ')
    // 直接购买：写入临时结算数据
    wx.setStorageSync('mk_buyNow', {
      items: [{
        goodsId: this.data.goodsId,
        name: this.data.goods.name,
        mainPic: this.data.goods.mainPic,
        specText,
        price: this.data.skuPrice,
        count: this.data.count
      }],
      payAmount: this.data.skuPrice * this.data.count
    })
    this.setData({ showSku: false })
    wx.navigateTo({ url: '/pages/pay/index?mode=buyNow' })
  },

  // ============ 收藏 ============
  async toggleCollect() {
    const res = await request({ url: '/collect/toggle', method: 'POST', data: { goodsId: this.data.goodsId } })
    if (res.code === 200) {
      this.setData({ isCollect: res.data.isCollect })
      toast.success(res.data.isCollect ? '收藏成功' : '已取消收藏')
    }
  },

  // ============ 评价 ============
  async loadReviews() {
    const statsRes = await request({ url: '/reviews/stats', data: { goodsId: this.data.goodsId } })
    const stats = statsRes.data || { total: 0, avg: 5.0, dist: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }
    stats.avg = Number(stats.avg)
    stats.avgText = stats.avg.toFixed(1)
    stats.distPct = {}
    Object.keys(stats.dist).forEach(k => {
      stats.distPct[k] = stats.total ? Math.round(stats.dist[k] / stats.total * 100) : 0
    })
    this.setData({ reviewStats: stats })
    this.loadReviewList(true)
  },

  async loadReviewList(reset = false) {
    const page = reset ? 1 : this.data.reviewPage
    const res = await request({
      url: '/reviews/list',
      data: {
        goodsId: this.data.goodsId,
        filter: this.data.reviewFilter,
        page,
        size: this.data.reviewExpanded ? 10 : 3
      }
    })
    const { records, total } = res.data || { records: [], total: 0 }
    const list = records.map(r => ({ ...r, timeText: formatRelative(r.createTime) }))
    this.setData({
      reviewList: reset ? list : [...this.data.reviewList, ...list],
      reviewTotal: total,
      reviewPage: page,
      loading: false
    })
  },

  onReviewFilter(e) {
    const { filter } = e.currentTarget.dataset
    this.setData({ reviewFilter: filter, reviewExpanded: true })
    this.loadReviewList(true)
  },

  expandReviews() {
    this.setData({ reviewExpanded: true })
    this.loadReviewList(true)
  },

  previewReviewImage(e) {
    const { urls, current } = e.currentTarget.dataset
    wx.previewImage({ urls, current })
  },

  // 折叠参数
  toggleParams() {
    this.setData({ paramsOpen: !this.data.paramsOpen })
  },

  // 推荐跳转
  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.redirectTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  goCart() {
    wx.switchTab({ url: '/pages/cart/index' })
  },

  // 分享
  onShareAppMessage() {
    return {
      title: this.data.goods.name,
      imageUrl: this.data.goods.mainPic,
      path: `/pages/goods_detail/index?goods_id=${this.data.goodsId}`
    }
  },

  onImgError(e) {
    const { field } = e.currentTarget.dataset
    if (field === 'mainPic') {
      this.setData({ 'goods.mainPic': '/static/images/default.png' })
    }
  }
})
