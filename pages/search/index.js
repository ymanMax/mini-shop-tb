// pages/search/index.js
import { request, updateCartBadge } from '../../api/http.js'
import { toast } from '../../utils/toast.js'
import { confirm } from '../../utils/toast.js'
import { formatPrice } from '../../utils/format.js'

Page({
  data: {
    inpValue: '',
    focused: true,
    // 历史 + 热门
    historyList: [],
    hotWords: [],
    // 联想
    suggestList: [],
    showSuggest: false,
    // 结果
    goodsList: [],
    searched: false,
    activeSort: 'default',
    page: 1,
    size: 10,
    total: 0,
    noMore: false,
    loading: false,
    // 高亮
    highlight: ''
  },

  timer: null,

  onLoad() {
    this.loadMeta()
  },

  onShow() {
    updateCartBadge()
  },

  async loadMeta() {
    const [histRes, hotRes] = await Promise.all([
      request({ url: '/search/history' }),
      request({ url: '/search/hot' })
    ])
    this.setData({
      historyList: histRes.data || [],
      hotWords: hotRes.data || []
    })
  },

  // 输入框聚焦
  onFocus() {
    this.setData({ focused: true, searched: false, showSuggest: false, suggestList: [] })
  },

  // 输入（防抖 300ms）
  handleInput(e) {
    const value = e.detail.value
    this.setData({ inpValue: value, highlight: value })
    if (this.timer) clearTimeout(this.timer)
    if (!value || !value.trim()) {
      this.setData({ showSuggest: false, suggestList: [] })
      return
    }
    this.timer = setTimeout(() => {
      this.loadSuggest(value.trim())
    }, 300)
  },

  // 联想
  async loadSuggest(keyword) {
    const res = await request({ url: '/search/suggest', data: { keyword } })
    const kw = keyword.toLowerCase()
    const list = (res.data || []).map(g => {
      const idx = g.name.toLowerCase().indexOf(kw)
      let parts = null
      if (idx !== -1) {
        parts = {
          before: g.name.slice(0, idx),
          match: g.name.slice(idx, idx + keyword.length),
          after: g.name.slice(idx + keyword.length)
        }
      }
      return { ...g, priceText: formatPrice(g.price), parts }
    })
    this.setData({ suggestList: list, showSuggest: list.length > 0 })
  },

  // 点击联想项 → 直接跳详情
  tapSuggest(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  // 提交搜索
  onSearchConfirm(e) {
    const keyword = (e.detail && e.detail.value) || this.data.inpValue
    this.doSearch(keyword)
  },

  tapHot(e) {
    const { word } = e.currentTarget.dataset
    this.setData({ inpValue: word })
    this.doSearch(word)
  },

  async doSearch(keyword) {
    const kw = (keyword || '').trim()
    if (!kw) {
      toast.info('请输入搜索关键词')
      return
    }
    // 写入搜索历史
    await request({ url: '/search/history/add', method: 'POST', data: { keyword: kw } })
    this.setData({
      focused: false,
      searched: true,
      showSuggest: false,
      suggestList: [],
      inpValue: kw
    })
    this.loadMeta()
    this.loadGoods(true)
  },

  // 加载结果
  async loadGoods(reset = false) {
    if (this.data.loading) return
    this.setData({ loading: true })
    if (reset) this.setData({ page: 1, goodsList: [], noMore: false })
    const res = await request({
      url: '/goods/list',
      data: {
        keyword: this.data.inpValue,
        page: this.data.page,
        size: this.data.size,
        sort: this.data.activeSort
      }
    })
    const { records, total } = res.data || { records: [], total: 0 }
    const list = records.map(g => ({ ...g, priceText: formatPrice(g.price), originalPriceText: formatPrice(g.originalPrice) }))
    this.setData({
      goodsList: reset ? list : [...this.data.goodsList, ...list],
      total,
      loading: false,
      noMore: this.data.page * this.data.size >= total
    })
    wx.stopPullDownRefresh()
  },

  // 排序
  onSortTap(e) {
    const { sort } = e.currentTarget.dataset
    this.setData({ activeSort: sort })
    this.loadGoods(true)
  },

  // 加购
  async addToCart(e) {
    const { item } = e.currentTarget.dataset
    let specText = '标准装'
    if (item.specs && item.specs.length) {
      specText = item.specs.map(s => s.values[0] ? s.values[0].label : '').filter(Boolean).join(' · ')
    }
    await request({
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
    toast.success('加入成功')
    updateCartBadge()
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  // 删除单条历史
  async removeHistory(e) {
    const { word } = e.currentTarget.dataset
    await request({ url: '/search/history/remove', method: 'POST', data: { keyword: word } })
    this.loadMeta()
  },

  // 清空历史
  async clearHistory() {
    const ok = await confirm('确定清空全部搜索历史吗？')
    if (!ok) return
    await request({ url: '/search/history/clear', method: 'POST' })
    this.loadMeta()
    toast.success('已清空')
  },

  // 取消/返回搜索框
  backToInput() {
    this.setData({
      focused: true,
      searched: false,
      showSuggest: false,
      suggestList: [],
      goodsList: [],
      inpValue: ''
    })
    this.loadMeta()
  },

  onReachBottom() {
    if (this.data.noMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadGoods()
  },

  onPullDownRefresh() {
    if (this.data.searched) this.loadGoods(true)
    else wx.stopPullDownRefresh()
  },

  onImgError(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ [`goodsList[${index}].mainPic`]: '/static/images/default.png' })
  },

  onUnload() {
    if (this.timer) clearTimeout(this.timer)
  }
})
