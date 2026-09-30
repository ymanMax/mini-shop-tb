// pages/collect/index.js —— 收藏页
import { get, post } from '../../api/http.js'
import { success, confirm } from '../../utils/toast.js'

Page({
  data: {
    tabs: [
      { id: 0, value: '全部', isActive: true },
      { id: 1, value: '正在热卖', isActive: false },
      { id: 2, value: '即将上线', isActive: false }
    ],
    collect: [],
    filtered: [],
    loading: true,
    swipedId: null
  },

  onShow() {
    this.loadCollect()
  },

  async loadCollect() {
    const collect = await get('/collect/list')
    this.setData({ collect, loading: false })
    this.applyFilter()
  },

  applyFilter() {
    const { collect, tabs } = this.data
    const activeTab = tabs.find(t => t.isActive)
    let filtered = collect
    if (activeTab.id === 1) {
      // 正在热卖：销量 > 3000
      filtered = collect.filter(g => g.sales > 3000)
    } else if (activeTab.id === 2) {
      // 即将上线：新品分类
      filtered = collect.filter(g => g.categoryId === 7)
    }
    this.setData({ filtered })
  },

  handleTabChange(e) {
    const { index } = e.detail
    const tabs = this.data.tabs.map((t, i) => ({ ...t, isActive: i === index }))
    this.setData({ tabs })
    this.applyFilter()
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  async removeCollect(e) {
    const { id } = e.currentTarget.dataset
    const ok = await confirm('确定取消收藏吗?')
    if (!ok) return
    await post('/collect/toggle', { goodsId: id })
    success('已取消收藏')
    this.loadCollect()
  },

  // 左滑删除
  touchStartX: 0,
  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX
  },
  handleTouchEnd(e) {
    const delta = e.changedTouches[0].clientX - this.touchStartX
    const { id } = e.currentTarget.dataset
    if (delta < -50) this.setData({ swipedId: id })
    else if (delta > 50) this.setData({ swipedId: null })
  },

  handleImgError(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ [`filtered[${index}].mainPic`]: '/static/images/default.png' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
