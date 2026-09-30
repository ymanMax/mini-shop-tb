// pages/category/index.js
import { request, updateCartBadge } from '../../api/http.js'
import { toast } from '../../utils/toast.js'
import { formatPrice } from '../../utils/format.js'

Page({
  data: {
    categories: [],        // 一级分类
    currentCatId: 1,       // 当前一级分类 id
    subList: [],           // 当前一级分类的二级分类
    activeSubId: 0,        // 当前二级分类 id（0=全部）
    goodsList: [],
    page: 1,
    size: 10,
    total: 0,
    loading: false,
    skeleton: true,        // 骨架屏
    sort: 'default',       // default / priceAsc / priceDesc / sales
    showFilter: false,
    priceMin: '',
    priceMax: '',
    onlyStock: false,
    noMore: false
  },

  onLoad() {
    this.loadCategories()
  },

  onShow() {
    updateCartBadge()
  },

  // 加载分类
  async loadCategories() {
    const res = await request({ url: '/categories' })
    const categories = res.data || []
    this.setData({
      categories,
      currentCatId: categories[0] ? categories[0].id : 1,
      subList: categories[0] ? categories[0].children : []
    })
    this.loadGoods(true)
  },

  // 加载商品
  async loadGoods(reset = false) {
    if (this.data.loading) return
    this.setData({ loading: true })
    if (reset) {
      this.setData({ page: 1, goodsList: [], noMore: false, skeleton: this.data.goodsList.length === 0 })
    }
    const params = {
      categoryId: this.data.currentCatId,
      page: this.data.page,
      size: this.data.size,
      sort: this.data.sort
    }
    if (this.data.activeSubId) params.subCategoryId = this.data.activeSubId
    if (this.data.priceMin !== '') params.priceMin = this.data.priceMin
    if (this.data.priceMax !== '') params.priceMax = this.data.priceMax
    if (this.data.onlyStock) params.onlyStock = 1

    const res = await request({ url: '/goods/list', data: params })
    const { records, total } = res.data || { records: [], total: 0 }
    const list = records.map(g => ({ ...g, priceText: formatPrice(g.price), originalPriceText: formatPrice(g.originalPrice) }))
    this.setData({
      goodsList: reset ? list : [...this.data.goodsList, ...list],
      total,
      loading: false,
      skeleton: false,
      noMore: this.data.page * this.data.size >= total
    })
    wx.stopPullDownRefresh()
  },

  // 左侧一级分类点击
  onCategoryTap(e) {
    const { id, index } = e.currentTarget.dataset
    const cat = this.data.categories[index]
    this.setData({
      currentCatId: id,
      subList: cat.children || [],
      activeSubId: 0,
      sort: 'default',
      priceMin: '',
      priceMax: '',
      onlyStock: false
    })
    this.loadGoods(true)
  },

  // 二级分类点击
  onSubTap(e) {
    const { id } = e.currentTarget.dataset
    this.setData({ activeSubId: id })
    this.loadGoods(true)
  },

  // 排序切换
  onSortTap(e) {
    const { sort } = e.currentTarget.dataset
    this.setData({ sort })
    this.loadGoods(true)
  },

  // 筛选面板
  openFilter() {
    this.setData({ showFilter: true })
  },
  closeFilter() {
    this.setData({ showFilter: false })
  },
  onPriceMin(e) {
    this.setData({ priceMin: e.detail.value })
  },
  onPriceMax(e) {
    this.setData({ priceMax: e.detail.value })
  },
  toggleStock() {
    this.setData({ onlyStock: !this.data.onlyStock })
  },
  applyFilter() {
    this.setData({ showFilter: false })
    this.loadGoods(true)
  },
  resetFilter() {
    this.setData({ priceMin: '', priceMax: '', onlyStock: false, showFilter: false })
    this.loadGoods(true)
  },
  clearFilter() {
    this.setData({ activeSubId: 0, sort: 'default', priceMin: '', priceMax: '', onlyStock: false })
    this.loadGoods(true)
  },

  // 加购
  async addToCart(e) {
    const { item } = e.currentTarget.dataset
    // 默认规格：取每个规格维度的第一个选项
    let specText = '标准装'
    if (item.specs && item.specs.length) {
      specText = item.specs.map(s => s.values[0] ? s.values[0].label : '').filter(Boolean).join(' · ')
    }
    const res = await request({
      url: '/cart/add',
      method: 'POST',
      data: {
        goodsId: item.id,
        specText,
        price: item.price,
        count: 1,
        mainPic: item.mainPic,
        name: item.name,
        stock: item.stock
      }
    })
    if (res.code === 200) {
      toast.success('加入成功')
      updateCartBadge()
    }
  },

  // 跳转详情
  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  // 跳转搜索
  goSearch() {
    wx.navigateTo({ url: '/pages/search/index' })
  },

  // 上拉加载
  onReachBottom() {
    if (this.data.noMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadGoods()
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadGoods(true)
  },

  // 图片加载失败回退
  onImgError(e) {
    const { index } = e.currentTarget.dataset
    this.setData({
      [`goodsList[${index}].mainPic`]: '/static/images/default.png'
    })
  }
})
