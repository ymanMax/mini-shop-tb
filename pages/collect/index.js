// pages/collect/index.js
import { request } from '../../api/http.js'
import { toast, confirm } from '../../utils/toast.js'
import { formatPrice } from '../../utils/format.js'

Page({
  data: {
    tabs: [
      { id: 0, value: '全部', filter: 'all' },
      { id: 1, value: '正在热卖', filter: 'hot' },
      { id: 2, value: '即将上线', filter: 'new' }
    ],
    activeTab: 0,
    collect: [],
    swipeId: null,
    touchStartX: 0
  },

  onShow() {
    this.loadCollect()
  },

  async loadCollect() {
    const res = await request({ url: '/collect/list' })
    let list = (res.data || []).map(g => ({ ...g, priceText: formatPrice(g.price), originalPriceText: formatPrice(g.originalPrice) }))
    // 按 tab 过滤
    const filter = this.data.tabs[this.data.activeTab].filter
    if (filter === 'hot') list = list.filter(g => g.sales >= 1000)
    else if (filter === 'new') list = list.filter(g => g.categoryId === 7)
    this.setData({ collect: list, swipeId: null })
  },

  onTabTap(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ activeTab: index })
    this.loadCollect()
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  // 左滑
  onTouchStart(e) {
    this.setData({ touchStartX: e.touches[0].clientX })
  },
  onTouchEnd(e) {
    const { id } = e.currentTarget.dataset
    const delta = e.changedTouches[0].clientX - this.data.touchStartX
    if (delta < -60) this.setData({ swipeId: id })
    else this.setData({ swipeId: null })
  },

  // 取消收藏
  async removeCollect(e) {
    const { id } = e.currentTarget.dataset
    await request({ url: '/collect/remove', method: 'POST', data: { goodsId: id } })
    toast.success('已取消收藏')
    this.loadCollect()
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  onImgError(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ [`collect[${index}].mainPic`]: '/static/images/default.png' })
  }
})
