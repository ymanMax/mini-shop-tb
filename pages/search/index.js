// pages/search/index.js —— 搜索（历史/热门/联想/结果）
import { request } from '../../api/http.js'
import common from '../../behaviors/common.js'
import regeneratorRuntime from '../../lib/runtime/runtime.js'
import { toastInfo, confirm } from '../../utils/toast.js'

Page({
  behaviors: [common],
  data: {
    keyword: '',
    focused: true,
    // 历史 + 热门
    history: [],
    hotWords: [],
    // 联想
    suggestions: [],
    searching: false,
    // 结果
    results: [],
    activeSort: 'comprehensive',
    sorts: [
      { key: 'comprehensive', label: '综合' },
      { key: 'priceAsc', label: '价格升序' },
      { key: 'priceDesc', label: '价格降序' },
      { key: 'sales', label: '销量' }
    ],
    page: 1,
    size: 10,
    total: 0,
    noMore: false,
    loading: false,
    searched: false
  },

  onLoad(options) {
    if (options.keyword) {
      const kw = decodeURIComponent(options.keyword)
      this.setData({ keyword: kw, focused: false })
      this.doSearch(kw)
    }
    this.loadMeta()
  },

  onShow() {
    this.loadMeta()
  },

  async loadMeta() {
    const [history, hot] = await Promise.all([
      request({ url: '/search/history' }),
      request({ url: '/search/hot' })
    ])
    this.setData({ history: history || [], hotWords: hot || [] })
  },

  onInput(e) {
    const kw = e.detail.value
    this.setData({ keyword: kw })
    clearTimeout(this._debounce)
    if (!kw || !kw.trim()) {
      this.setData({ suggestions: [], searched: false, results: [] })
      return
    }
    this._debounce = setTimeout(() => this.loadSuggest(kw.trim()), 300)
  },

  async loadSuggest(kw) {
    const res = await request({ url: '/search/suggest', data: { keyword: kw } })
    // 为每条联想切分高亮片段
    const list = (res || []).map(item => ({
      ...item,
      parts: this.buildHighlight(item.name, kw)
    }))
    this.setData({ suggestions: list })
  },

  // 将商品名按关键词切分为 {text, highlight} 片段
  buildHighlight(name, kw) {
    const idx = name.toLowerCase().indexOf(kw.toLowerCase())
    if (idx === -1) return [{ text: name, highlight: false }]
    return [
      { text: name.slice(0, idx), highlight: false },
      { text: name.slice(idx, idx + kw.length), highlight: true },
      { text: name.slice(idx + kw.length), highlight: false }
    ]
  },

  onFocus() {
    this.setData({ focused: true })
  },

  onConfirm() {
    this.doSearch(this.data.keyword)
  },

  tapHot(e) {
    const { word } = e.currentTarget.dataset
    this.setData({ keyword: word, suggestions: [] })
    this.doSearch(word)
  },

  tapHistory(e) {
    const { word } = e.currentTarget.dataset
    this.setData({ keyword: word, suggestions: [] })
    this.doSearch(word)
  },

  tapSuggest(e) {
    const { id, name } = e.currentTarget.dataset
    request({ url: '/search/history/add', method: 'POST', data: { keyword: name } })
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  async doSearch(kw) {
    if (!kw || !kw.trim()) {
      toastInfo('请输入搜索关键词')
      return
    }
    this.setData({ focused: false, searching: true, searched: true, suggestions: [], page: 1, noMore: false, results: [] })
    await request({ url: '/search/history/add', method: 'POST', data: { keyword: kw.trim() } })
    this.loadMeta()
    await this.loadResults(true)
  },

  async loadResults(reset) {
    this.setData({ loading: true })
    const res = await request({
      url: '/goods/search',
      data: {
        keyword: this.data.keyword,
        sort: this.data.activeSort,
        page: reset ? 1 : this.data.page,
        size: this.data.size
      }
    })
    const records = res.records || []
    const list = reset ? records : [...this.data.results, ...records]
    this.setData({
      results: list,
      total: res.total,
      page: reset ? 2 : this.data.page + 1,
      noMore: list.length >= res.total,
      loading: false,
      searching: false
    })
  },

  switchSort(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ activeSort: key, results: [], page: 1, noMore: false })
    this.loadResults(true)
  },

  onReachBottom() {
    if (this.data.searched && !this.data.noMore && !this.data.loading) this.loadResults(false)
  },

  deleteHistory(e) {
    const { word } = e.currentTarget.dataset
    request({ url: '/search/history/delete', method: 'POST', data: { keyword: word } }).then(() => this.loadMeta())
  },

  async clearHistory() {
    const ok = await confirm('确定清空全部搜索历史吗？')
    if (!ok) return
    await request({ url: '/search/history/clear', method: 'POST' })
    this.loadMeta()
  },

  clearInput() {
    this.setData({ keyword: '', suggestions: [], searched: false, results: [], focused: true })
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
