// pages/goods_list/index.js —— 商品列表（支持关键词/分类/排序/分页）
import { request } from '../../api/http.js'
import common from '../../behaviors/common.js'
import regeneratorRuntime from '../../lib/runtime/runtime.js'

Page({
  behaviors: [common],
  data: {
    tabs: [
      { key: 'comprehensive', label: '综合' },
      { key: 'sales', label: '销量' },
      { key: 'priceAsc', label: '价格升序' },
      { key: 'priceDesc', label: '价格降序' }
    ],
    activeSort: 'comprehensive',
    keyword: '',
    cid: '',
    goodsList: [],
    page: 1,
    size: 10,
    total: 0,
    noMore: false,
    loading: true,
    skeleton: true
  },

  onLoad(options) {
    this.setData({
      keyword: options.keyword || options.query || '',
      cid: options.cid || ''
    })
    this.loadGoods(true)
  },

  onShow() {
    this.refreshCartBadge()
  },

  switchSort(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ activeSort: key, goodsList: [], page: 1, noMore: false, skeleton: true })
    this.loadGoods(true)
  },

  async loadGoods(reset) {
    this.setData({ loading: true })
    const params = {
      keyword: this.data.keyword || undefined,
      categoryId: this.data.cid || undefined,
      sort: this.data.activeSort,
      page: reset ? 1 : this.data.page,
      size: this.data.size
    }
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
  },

  onReachBottom() {
    if (!this.data.noMore && !this.data.loading) this.loadGoods(false)
  },

  onPullDownRefresh() {
    this.loadGoods(true).then(() => wx.stopPullDownRefresh())
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  async addToCart(e) {
    const { item } = e.currentTarget.dataset
    if (item.specs && item.specs.length > 0) {
      wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${item.id}` })
      return
    }
    await this.addToCartApi({
      goodsId: item.id,
      specText: '默认规格',
      price: item.price,
      count: 1,
      mainPic: item.mainPic,
      name: item.name
    })
    wx.showToast({ title: '已加入购物车', icon: 'success' })
  }
})
