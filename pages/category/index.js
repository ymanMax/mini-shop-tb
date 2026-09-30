// pages/category/index.js —— 分类页重构
import { request } from '../../api/http.js'
import common from '../../behaviors/common.js'
import regeneratorRuntime from '../../lib/runtime/runtime.js'

Page({
  behaviors: [common],
  data: {
    // 左侧一级分类
    leftMenu: [],
    currentCateId: 1,
    currentCateName: '',
    // 右侧二级分类
    subCates: [],
    currentSubId: 0, // 0 = 全部
    // 排序
    sort: 'comprehensive', // comprehensive | priceAsc | priceDesc | sales
    sortOptions: [
      { key: 'comprehensive', label: '综合' },
      { key: 'priceAsc', label: '价格升序' },
      { key: 'priceDesc', label: '价格降序' },
      { key: 'sales', label: '销量' }
    ],
    // 筛选面板
    showFilter: false,
    minPrice: '',
    maxPrice: '',
    onlyStock: false,
    // 商品
    goodsList: [],
    page: 1,
    size: 10,
    total: 0,
    noMore: false,
    loading: true,
    // 骨架屏
    skeleton: true
  },

  onLoad() {
    this.loadCategories()
  },

  onShow() {
    // 角标同步
    this.refreshCartBadge()
  },

  // 加载一级分类
  async loadCategories() {
    const res = await request({ url: '/categories' })
    this.setData({ leftMenu: res, currentCateId: res[0].id, currentCateName: res[0].name })
    this.initSubCates(res[0])
    this.loadGoods(true)
  },

  // 初始化二级分类
  initSubCates(cate) {
    const subs = [{ id: 0, name: '全部', icon: '🌟' }, ...(cate.children || [])]
    this.setData({ subCates: subs, currentSubId: 0 })
  },

  // 切换一级分类
  async handleCateTap(e) {
    const { id, index } = e.currentTarget.dataset
    const cate = this.data.leftMenu[index]
    this.setData({ currentCateId: id, currentCateName: cate.name, goodsList: [], page: 1, noMore: false, skeleton: true })
    this.initSubCates(cate)
    this.loadGoods(true)
  },

  // 切换二级分类
  handleSubTap(e) {
    const { id } = e.currentTarget.dataset
    this.setData({ currentSubId: id, goodsList: [], page: 1, noMore: false, skeleton: true })
    this.loadGoods(true)
  },

  // 切换排序
  handleSortTap(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ sort: key, goodsList: [], page: 1, noMore: false, skeleton: true })
    this.loadGoods(true)
  },

  // 打开/关闭筛选面板
  toggleFilter() {
    this.setData({ showFilter: !this.data.showFilter })
  },
  closeFilter() {
    this.setData({ showFilter: false })
  },
  onMinPrice(e) { this.setData({ minPrice: e.detail.value }) },
  onMaxPrice(e) { this.setData({ maxPrice: e.detail.value }) },
  toggleStock() { this.setData({ onlyStock: !this.data.onlyStock }) },
  resetFilter() {
    this.setData({ minPrice: '', maxPrice: '', onlyStock: false, showFilter: false, goodsList: [], page: 1, noMore: false, skeleton: true })
    this.loadGoods(true)
  },
  applyFilter() {
    this.setData({ showFilter: false, goodsList: [], page: 1, noMore: false, skeleton: true })
    this.loadGoods(true)
  },

  // 加载商品
  async loadGoods(reset = false) {
    if (this.data.loading && !reset) return
    this.setData({ loading: true })
    const params = {
      categoryId: this.data.currentCateId,
      subCategoryId: this.data.currentSubId || undefined,
      sort: this.data.sort,
      minPrice: this.data.minPrice !== '' ? this.data.minPrice : undefined,
      maxPrice: this.data.maxPrice !== '' ? this.data.maxPrice : undefined,
      onlyStock: this.data.onlyStock || undefined,
      page: reset ? 1 : this.data.page,
      size: this.data.size
    }
    try {
      const res = await request({ url: '/goods/list', data: params })
      const records = res.records || []
      const list = reset ? records : [...this.data.goodsList, ...records]
      this.setData({
        goodsList: list,
        total: res.total,
        page: reset ? 2 : this.data.page + 1,
        noMore: list.length >= res.total,
        loading: false,
        skeleton: false
      })
    } catch (e) {
      this.setData({ loading: false, skeleton: false })
    }
  },

  // 上拉加载
  onReachBottom() {
    if (!this.data.noMore && !this.data.loading) this.loadGoods(false)
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.setData({ goodsList: [], page: 1, noMore: false, skeleton: true })
    this.loadGoods(true).then(() => wx.stopPullDownRefresh())
  },

  // 加入购物车
  async handleAddCart(e) {
    const { item } = e.currentTarget.dataset
    // 无规格商品直接加购；有规格则跳详情选择
    if (item.specs && item.specs.length > 0) {
      wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${item.id}` })
      return
    }
    const res = await this.addToCartApi({
      goodsId: item.id,
      specText: '默认规格',
      price: item.price,
      count: 1,
      mainPic: item.mainPic,
      name: item.name
    })
    if (res && res.success) {
      wx.showToast({ title: '已加入购物车', icon: 'success' })
    }
  },

  // 跳详情
  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  // 清除筛选
  clearFilter() {
    this.setData({ minPrice: '', maxPrice: '', onlyStock: false, sort: 'comprehensive', currentSubId: 0, goodsList: [], page: 1, noMore: false, skeleton: true })
    this.loadGoods(true)
  }
})
