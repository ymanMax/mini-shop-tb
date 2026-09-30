// pages/goods_list/index.js
import { request, updateCartBadge } from '../../api/http.js'
import { toast } from '../../utils/toast.js'
import { formatPrice } from '../../utils/format.js'

Page({
  data: {
    tabs: [
      { id: 0, value: '综合', sort: 'default' },
      { id: 1, value: '销量', sort: 'sales' },
      { id: 2, value: '价格升序', sort: 'priceAsc' },
      { id: 3, value: '价格降序', sort: 'priceDesc' }
    ],
    activeTab: 0,
    goodsList: [],
    cid: '',
    keyword: '',
    page: 1,
    size: 10,
    total: 0,
    loading: false,
    noMore: false,
    skeleton: true
  },

  onLoad(options) {
    this.setData({
      cid: options.cid || '',
      keyword: options.query || ''
    })
    this.loadGoods(true)
  },

  onShow() {
    updateCartBadge()
  },

  async loadGoods(reset = false) {
    if (this.data.loading) return
    this.setData({ loading: true })
    if (reset) {
      this.setData({ page: 1, goodsList: [], noMore: false, skeleton: this.data.goodsList.length === 0 })
    }
    const tab = this.data.tabs[this.data.activeTab]
    const params = {
      page: this.data.page,
      size: this.data.size,
      sort: tab.sort
    }
    if (this.data.cid) params.categoryId = this.data.cid
    if (this.data.keyword) params.keyword = this.data.keyword
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

  onTabTap(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ activeTab: index })
    this.loadGoods(true)
  },

  addToCart(e) {
    const { item } = e.currentTarget.dataset
    let specText = '标准装'
    if (item.specs && item.specs.length) {
      specText = item.specs.map(s => s.values[0] ? s.values[0].label : '').filter(Boolean).join(' · ')
    }
    request({
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
    }).then(() => {
      toast.success('加入成功')
      updateCartBadge()
    })
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/index' })
  },

  onReachBottom() {
    if (this.data.noMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadGoods()
  },

  onPullDownRefresh() {
    this.loadGoods(true)
  },

  onImgError(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ [`goodsList[${index}].mainPic`]: '/static/images/default.png' })
  }
})
