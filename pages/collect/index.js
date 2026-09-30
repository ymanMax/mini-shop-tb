// pages/collect/index.js —— 商品收藏（Tab 切换 + 左滑删除）
import { request } from '../../api/http.js'
import common from '../../behaviors/common.js'
import { toastSuccess, confirm } from '../../utils/toast.js'

Page({
  behaviors: [common],
  data: {
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'hot', label: '正在热卖' },
      { key: 'new', label: '即将上线' }
    ],
    activeTab: 'all',
    collect: [],
    loading: true,
    swipedId: null
  },

  onShow() {
    this.loadCollect()
  },

  switchTab(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ activeTab: key, swipedId: null })
  },

  async loadCollect() {
    const res = await request({ url: '/collect/list' })
    let list = res || []
    // 按 tab 过滤：热卖=销量>1500；即将上线=新品/限定类（用 tags 含"新品"或 id>=7000 近似）
    if (this.data.activeTab === 'hot') list = list.filter(g => g.sales >= 1500)
    else if (this.data.activeTab === 'new') list = list.filter(g => g.id >= 7000 || (g.tags || []).some(t => t.includes('新品') || t.includes('限定') || t.includes('网红')))
    this.setData({ collect: list, loading: false })
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  async removeCollect(e) {
    const { id } = e.currentTarget.dataset
    const ok = await confirm('确定取消收藏该商品吗？')
    if (!ok) return
    await request({ url: '/collect/toggle', method: 'POST', data: { goodsId: id } })
    toastSuccess('已取消收藏')
    this.setData({ swipedId: null })
    this.loadCollect()
  },

  // 左滑
  touchStart(e) {
    this._touchX = e.touches[0].clientX
    this._touchId = e.currentTarget.dataset.id
  },
  touchMove(e) {
    const dx = e.touches[0].clientX - this._touchX
    if (dx < -40 && this._touchId) this.setData({ swipedId: this._touchId })
    else if (dx > 40) this.setData({ swipedId: null })
  },
  closeSwipe() {
    this.setData({ swipedId: null })
  },

  goShop() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
