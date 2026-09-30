// pages/goods_list/index.js —— 商品列表（搜索结果/分类跳转）
import { get, post } from '../../api/http.js'
import { success } from '../../utils/toast.js'

Page({
  data: {
    tabs: [
      { id: 0, value: '综合', isActive: true, sort: 'comprehensive' },
      { id: 1, value: '销量', isActive: false, sort: 'sales' },
      { id: 2, value: '价格升序', isActive: false, sort: 'priceAsc' },
      { id: 3, value: '价格降序', isActive: false, sort: 'priceDesc' }
    ],
    goodsList: [],
    query: '',
    cid: '',
    page: 1,
    size: 10,
    total: 0,
    noMore: false,
    loading: true
  },

  onLoad(options) {
    this.setData({
      query: options.query || '',
      cid: options.cid || ''
    })
    this.loadGoods()
  },

  async loadGoods(reset = true) {
    if (reset) {
      this.setData({ loading: true, page: 1, goodsList: [], noMore: false })
    }
    const activeTab = this.data.tabs.find(t => t.isActive)
    const res = await get('/goods/search', {
      query: this.data.query || undefined,
      categoryId: this.data.cid || undefined,
      sort: activeTab.sort,
      page: this.data.page,
      size: this.data.size
    })
    const records = res.records || []
    const goodsList = reset ? records : [...this.data.goodsList, ...records]
    this.setData({
      goodsList,
      total: res.total,
      loading: false,
      noMore: goodsList.length >= res.total
    })
  },

  handleTabChange(e) {
    const { index } = e.detail
    const tabs = this.data.tabs.map((t, i) => ({ ...t, isActive: i === index }))
    this.setData({ tabs })
    this.loadGoods()
  },

  handleAddCart(e) {
    const { goods } = e.currentTarget.dataset
    post('/cart/add', {
      goodsId: goods.id,
      specText: '标准装',
      price: goods.price,
      count: 1
    }).then(() => {
      success('已加入购物车')
      const app = getApp()
      app.refreshCartCount && app.refreshCartCount()
    })
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  onReachBottom() {
    if (this.data.noMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadGoods(false)
  },

  onPullDownRefresh() {
    this.loadGoods().then(() => wx.stopPullDownRefresh())
  },

  handleImgError(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ [`goodsList[${index}].mainPic`]: '/static/images/default.png' })
  }
})
