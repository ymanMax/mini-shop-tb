// pages/goods_detail/index.js —— 商品详情页（模块 2 + 5.1）
import { get, post } from '../../api/http.js'
import { success, fail, confirm } from '../../utils/toast.js'
import { formatPrice, relativeTime } from '../../utils/format.js'

Page({
  data: {
    goodsId: null,
    goods: null,
    // 轮播
    swiperCurrent: 0,
    // SKU 弹层
    showSku: false,
    selectedSpecs: {}, // { 规格名: label }
    buyCount: 1,
    // 折叠面板
    showParams: true,
    // 评价
    reviews: [],
    reviewTotal: 0,
    avgRating: 0,
    ratingDist: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    reviewFilter: 'all', // all / good(4-5) / mid(3) / bad(1-2) / images
    showAllReviews: false,
    // 推荐
    recommends: [],
    // 收藏
    isCollect: false,
    cartCount: 0,
    selectedPrice: 0,
    selectedStock: 0,
    filteredReviews: [],
    loading: true
  },

  onLoad(options) {
    this.setData({ goodsId: Number(options.goods_id) })
    this.loadGoods()
    this.loadReviews()
    this.loadRecommends()
  },

  onShow() {
    const app = getApp()
    app.refreshCartCount && app.refreshCartCount()
    this.setData({ cartCount: app.globalData.cartCount || 0 })
  },

  async loadGoods() {
    const goods = await get('/goods/detail', { goodsId: this.data.goodsId })
    this.setData({
      goods,
      isCollect: goods.isCollect,
      selectedPrice: goods.price,
      selectedPriceText: formatPrice(goods.price),
      selectedStock: goods.stock,
      loading: false
    })
    wx.setNavigationBarTitle({ title: goods.name.slice(0, 20) })
    // 记录浏览足迹
    post('/history/add', { goodsId: this.data.goodsId }).catch(() => {})
  },

  async loadReviews() {
    const res = await get('/reviews/list', { goodsId: this.data.goodsId, page: 1, size: 50 })
    const reviews = (res.records || []).map(r => ({
      ...r,
      timeText: relativeTime(r.createTime)
    }))
    const total = res.total
    // 计算平均分和分布
    let sum = 0
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(r => {
      sum += r.rating
      dist[r.rating] = (dist[r.rating] || 0) + 1
    })
    const avg = total ? (sum / total).toFixed(1) : 0
    this.setData({
      reviews,
      reviewTotal: total,
      avgRating: avg,
      ratingDist: dist,
      filteredReviews: reviews,
      displayReviews: reviews.slice(0, 3)
    })
  },

  async loadRecommends() {
    const goods = await get('/goods/recommend', { categoryId: this.data.goods.categoryId, excludeId: this.data.goodsId })
    this.setData({ recommends: goods.slice(0, 6) })
  },

  // 轮播切换
  handleSwiperChange(e) {
    this.setData({ swiperCurrent: e.detail.current })
  },

  // 图片放大
  handlePreviewImage(e) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({
      urls: this.data.goods.pics,
      current: url
    })
  },

  // 打开 SKU 弹层
  openSku(e) {
    const { type } = e.currentTarget.dataset
    this.setData({ showSku: true, skuType: type || 'cart' })
  },

  closeSku() {
    this.setData({ showSku: false })
  },

  // 选择规格
  handleSpecSelect(e) {
    const { name, label } = e.currentTarget.dataset
    const selectedSpecs = { ...this.data.selectedSpecs }
    selectedSpecs[name] = label
    this.setData({ selectedSpecs })
    this.updateSkuInfo()
  },

  // 更新 SKU 联动信息（价格/库存）
  updateSkuInfo() {
    const price = this.getSelectedPrice()
    this.setData({
      selectedPrice: price,
      selectedPriceText: formatPrice(price),
      selectedStock: this.getSelectedStock()
    })
  },

  // 数量调整
  handleCountChange(e) {
    const { operation } = e.currentTarget.dataset
    let count = this.data.buyCount + operation
    // 受库存约束
    const stock = this.getSelectedStock()
    if (count < 1) count = 1
    if (count > stock) {
      count = stock
      fail('已达到库存上限')
    }
    this.setData({ buyCount: count })
  },

  // 获取当前选中规格的库存
  getSelectedStock() {
    const goods = this.data.goods
    if (!goods || !goods.specs.length) return goods.stock
    // 找规格维度中带 stock 的
    let stock = goods.stock
    goods.specs.forEach(spec => {
      const label = this.data.selectedSpecs[spec.name]
      if (label) {
        const val = spec.values.find(v => v.label === label)
        if (val && val.stock) stock = val.stock
      }
    })
    return stock
  },

  // 获取当前选中规格的价格
  getSelectedPrice() {
    const goods = this.data.goods
    if (!goods || !goods.specs.length) return goods.price
    let price = goods.price
    goods.specs.forEach(spec => {
      const label = this.data.selectedSpecs[spec.name]
      if (label) {
        const val = spec.values.find(v => v.label === label)
        if (val && val.price) price = val.price
      }
    })
    return price
  },

  // 构造规格文案
  buildSpecText() {
    const specs = this.data.selectedSpecs
    const keys = Object.keys(specs)
    if (!keys.length) return '标准装'
    return keys.map(k => specs[k]).join(' · ')
  },

  // 校验规格是否选完整
  checkSpecsComplete() {
    const goods = this.data.goods
    if (!goods.specs.length) return true
    return goods.specs.every(spec => this.data.selectedSpecs[spec.name])
  },

  // 加入购物车
  async handleAddCart() {
    if (!this.checkSpecsComplete()) {
      fail('请选择完整规格')
      return
    }
    await post('/cart/add', {
      goodsId: this.data.goodsId,
      specText: this.buildSpecText(),
      price: this.getSelectedPrice(),
      count: this.data.buyCount
    })
    success('已加入购物车')
    this.setData({ showSku: false })
    const app = getApp()
    app.refreshCartCount && app.refreshCartCount()
    this.setData({ cartCount: app.globalData.cartCount || 0 })
  },

  // 立即购买
  async handleBuyNow() {
    if (!this.checkSpecsComplete()) {
      fail('请选择完整规格')
      return
    }
    // 直接跳转支付页，带购买参数
    const payload = {
      goodsId: this.data.goodsId,
      specText: this.buildSpecText(),
      price: this.getSelectedPrice(),
      count: this.data.buyCount,
      name: this.data.goods.name,
      mainPic: this.data.goods.mainPic
    }
    wx.setStorageSync('buyNowPayload', payload)
    wx.navigateTo({ url: '/pages/pay/index?buyNow=1' })
  },

  // 收藏
  async handleCollect() {
    const res = await post('/collect/toggle', { goodsId: this.data.goodsId })
    this.setData({ isCollect: res.isCollect })
    success(res.isCollect ? '收藏成功' : '已取消收藏')
  },

  // 折叠参数
  toggleParams() {
    this.setData({ showParams: !this.data.showParams })
  },

  // 评价筛选
  handleReviewFilter(e) {
    const { filter } = e.currentTarget.dataset
    this.setData({ reviewFilter: filter, showAllReviews: false })
    this.computeFilteredReviews()
  },

  computeFilteredReviews() {
    const { reviews, reviewFilter } = this.data
    let filtered = reviews
    if (reviewFilter === 'good') filtered = reviews.filter(r => r.rating >= 4)
    else if (reviewFilter === 'mid') filtered = reviews.filter(r => r.rating === 3)
    else if (reviewFilter === 'bad') filtered = reviews.filter(r => r.rating <= 2)
    else if (reviewFilter === 'images') filtered = reviews.filter(r => r.images && r.images.length)
    this.setData({
      filteredReviews: filtered,
      displayReviews: this.data.showAllReviews ? filtered : filtered.slice(0, 3)
    })
  },

  // 展开全部评价
  expandAllReviews() {
    this.setData({
      showAllReviews: true,
      displayReviews: this.data.filteredReviews
    })
  },

  // 评价晒图放大
  handlePreviewReviewImage(e) {
    const { urls, current } = e.currentTarget.dataset
    wx.previewImage({ urls, current })
  },

  // 跳转推荐商品
  goRecommend(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  // 跳转购物车
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

  // 图片加载失败
  handleImgError(e) {
    const { field } = e.currentTarget.dataset
    if (field) this.setData({ [field]: '/static/images/default.png' })
  }
})
