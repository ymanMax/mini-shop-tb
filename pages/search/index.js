// pages/search/index.js —— 搜索页（历史 + 热门 + 联想）
import { get, post } from '../../api/http.js'
import { success, confirm } from '../../utils/toast.js'

Page({
  data: {
    goods: [],
    isFocus: true,
    inpValue: '',
    loading: false,
    history: [],
    hotWords: [],
    suggestions: [],
    searching: false,
    sort: 'comprehensive',
    sortOptions: [
      { key: 'comprehensive', label: '综合' },
      { key: 'priceAsc', label: '价格升序' },
      { key: 'priceDesc', label: '价格降序' },
      { key: 'sales', label: '销量' }
    ],
    page: 1,
    size: 10,
    total: 0,
    noMore: false
  },

  onLoad() {
    this.loadHistory()
    this.loadHotWords()
  },

  async loadHistory() {
    const history = await get('/search/history')
    this.setData({ history })
  },

  async loadHotWords() {
    const hotWords = await get('/search/hot')
    this.setData({ hotWords })
  },

  handleInput(e) {
    const { value } = e.detail
    this.setData({ inpValue: value })
    clearTimeout(this.TimeId)
    if (!value.trim()) {
      this.setData({ suggestions: [], searching: false, goods: [] })
      return
    }
    // 300ms 防抖联想
    this.TimeId = setTimeout(() => {
      this.loadSuggest(value)
    }, 300)
  },

  async loadSuggest(q) {
    const list = await get('/search/suggest', { q })
    // 高亮匹配前缀
    const suggestions = list.map(s => {
      const idx = s.name.toLowerCase().indexOf(q.toLowerCase())
      if (idx >= 0) {
        return { ...s, highlightBefore: s.name.slice(0, idx + q.length), highlightAfter: s.name.slice(idx + q.length) }
      }
      return { ...s, highlightBefore: s.name, highlightAfter: '' }
    })
    this.setData({ suggestions, searching: true })
  },

  // 提交搜索
  handleSearch() {
    const q = this.data.inpValue.trim()
    if (!q) return
    // 写入历史
    post('/search/history/add', { keyword: q })
    this.setData({ history: [q, ...this.data.history.filter(x => x !== q)].slice(0, 15) })
    this.doSearch(q)
  },

  async doSearch(q, reset = true) {
    if (reset) this.setData({ loading: true, suggestions: [], searching: false, page: 1, goods: [], noMore: false })
    const res = await get('/goods/search', {
      query: q,
      sort: this.data.sort,
      page: reset ? 1 : this.data.page,
      size: this.data.size
    })
    const records = res.records || []
    const goods = reset ? records : [...this.data.goods, ...records]
    this.setData({
      goods,
      total: res.total,
      loading: false,
      noMore: goods.length >= res.total
    })
  },

  handleSortTap(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ sort: key })
    this.doSearch(this.data.inpValue.trim())
  },

  onReachBottom() {
    if (this.data.noMore || this.data.loading || !this.data.inpValue) return
    this.setData({ page: this.data.page + 1 })
    this.doSearch(this.data.inpValue.trim(), false)
  },

  // 点击历史/热门词搜索
  handleQuickSearch(e) {
    const { keyword } = e.currentTarget.dataset
    this.setData({ inpValue: keyword })
    post('/search/history/add', { keyword })
    this.setData({ history: [keyword, ...this.data.history.filter(x => x !== keyword)].slice(0, 15) })
    this.doSearch(keyword)
  },

  // 点击联想项 → 直接跳详情
  handleSuggestTap(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  // 单条删除历史
  async removeHistory(e) {
    const { keyword } = e.currentTarget.dataset
    await post('/search/history/remove', { keyword })
    this.setData({ history: this.data.history.filter(x => x !== keyword) })
  },

  // 清空历史
  async clearHistory() {
    const ok = await confirm('确定清空搜索历史吗?')
    if (!ok) return
    await post('/search/history/clear')
    this.setData({ history: [] })
    success('已清空')
  },

  handleCancel() {
    this.setData({ inpValue: '', goods: [], suggestions: [], searching: false, isFocus: false })
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

  handleImgError(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ [`goods[${index}].mainPic`]: '/static/images/default.png' })
  }
})
