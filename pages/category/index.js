// pages/category/index.js —— 分类页（模块 1）
import { get, post } from '../../api/http.js'
import { success } from '../../utils/toast.js'
import { formatPrice } from '../../utils/format.js'

Page({
  data: {
    categories: [],
    currentCategoryId: 1,
    subCategories: [],
    currentSubId: 0,
    goodsList: [],
    sort: 'comprehensive',
    sortOptions: [
      { key: 'comprehensive', label: '综合' },
      { key: 'priceAsc', label: '价格升序' },
      { key: 'priceDesc', label: '价格降序' },
      { key: 'sales', label: '销量' }
    ],
    showFilter: false,
    priceMin: '',
    priceMax: '',
    onlyStock: false,
    page: 1,
    size: 10,
    total: 0,
    noMore: false,
    loading: true,
    empty: false,
    cartCount: 0,
    refreshing: false
  },

  onLoad(options) {
    const pending = wx.getStorageSync('pendingCategoryId')
    if (pending) {
      this.setData({ currentCategoryId: pending })
      wx.removeStorageSync('pendingCategoryId')
    } else if (options.categoryId) {
      this.setData({ currentCategoryId: Number(options.categoryId) })
    }
    this.loadCategories()
  },

  onShow() {
    const app = getApp()
    app.refreshCartCount && app.refreshCartCount()
    this.setData({ cartCount: app.globalData.cartCount || 0 })
  },

  async loadCategories() {
    const categories = await get('/categories')
    this.setData({ categories })
    this.initSubCategories()
    this.loadGoods()
  },

  initSubCategories() {
    const cat = this.data.categories.find(c => c.id === this.data.currentCategoryId)
    const subs = cat ? cat.children : []
    this.setData({ subCategories: subs, currentSubId: 0 })
  },

  async loadGoods(reset = true) {
    if (reset) {
      this.setData({ loading: true, page: 1, goodsList: [], noMore: false, empty: false })
    }
    const params = {
      categoryId: this.data.currentCategoryId,
      subCategoryId: this.data.currentSubId || undefined,
      sort: this.data.sort,
      page: this.data.page,
      size: this.data.size,
      priceMin: this.data.priceMin || undefined,
      priceMax: this.data.priceMax || undefined,
      onlyStock: this.data.onlyStock ? 1 : undefined
    }
    const res = await get('/goods/search', params)
    const records = res.records || []
    const goodsList = reset ? records : [...this.data.goodsList, ...records]
    this.setData({
      goodsList,
      total: res.total,
      loading: false,
      noMore: goodsList.length >= res.total,
      empty: res.total === 0
    })
  },

  handleCategoryTap(e) {
    const { id } = e.currentTarget.dataset
    this.setData({ currentCategoryId: id })
    this.initSubCategories()
    this.loadGoods()
  },

  handleSubTap(e) {
    const { id } = e.currentTarget.dataset
    this.setData({ currentSubId: id })
    this.loadGoods()
  },

  handleSortTap(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ sort: key })
    this.loadGoods()
  },

  toggleFilter() {
    this.setData({ showFilter: !this.data.showFilter })
  },

  handlePriceInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [field]: e.detail.value })
  },

  handleOnlyStockChange(e) {
    this.setData({ onlyStock: e.detail.value })
  },

  applyFilter() {
    this.setData({ showFilter: false })
    this.loadGoods()
  },

  resetFilter() {
    this.setData({ priceMin: '', priceMax: '', onlyStock: false })
  },

  clearFilter() {
    this.setData({ priceMin: '', priceMax: '', onlyStock: false, currentSubId: 0, sort: 'comprehensive' })
    this.loadGoods()
  },

  async handleAddCart(e) {
    const { goods } = e.currentTarget.dataset
    await post('/cart/add', {
      goodsId: goods.id,
      specText: '标准装',
      price: goods.price,
      count: 1
    })
    success('已加入购物车')
    const app = getApp()
    app.refreshCartCount && app.refreshCartCount()
    this.setData({ cartCount: app.globalData.cartCount || 0 })
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/index' })
  },

  handleScrollToLower() {
    if (this.data.noMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadGoods(false)
  },

  onReachBottom() {
    this.handleScrollToLower()
  },

  async handleRefresh() {
    this.setData({ refreshing: true })
    await this.loadGoods()
    this.setData({ refreshing: false })
  },

  onPullDownRefresh() {
    this.handleRefresh()
  },

  handleImgError(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ [`goodsList[${index}].mainPic`]: '/static/images/default.png' })
  }
})
