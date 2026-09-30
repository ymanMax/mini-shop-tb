// pages/history/index.js —— 浏览足迹
import { request } from '../../api/http.js'
import common from '../../behaviors/common.js'
import { formatRelative } from '../../utils/format.js'
import { toastSuccess, confirm } from '../../utils/toast.js'

Page({
  behaviors: [common],
  data: {
    groups: [], // [{ label: '今天'|'昨天'|'更早', items: [...] }]
    loading: true,
    swipedId: null
  },

  onShow() {
    this.loadHistory()
  },

  async loadHistory() {
    const res = await request({ url: '/history/list' })
    const list = res || []
    // 按日期分组：今天 / 昨天 / 更早（按月日）
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const yesterday = today - 24 * 3600 * 1000
    const groupsMap = { 今天: [], 昨天: [], 更早: [] }
    list.forEach((h) => {
      const t = h.browseTime
      const d = new Date(t)
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      let label
      if (dayStart === today) label = '今天'
      else if (dayStart === yesterday) label = '昨天'
      else label = '更早'
      groupsMap[label].push({ ...h, timeText: formatRelative(t) })
    })
    const groups = ['今天', '昨天', '更早']
      .map(label => ({ label, items: groupsMap[label] }))
      .filter(g => g.items.length > 0)
    this.setData({ groups, loading: false })
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  async deleteItem(e) {
    const { id } = e.currentTarget.dataset
    const ok = await confirm('确定删除这条浏览记录吗？')
    if (!ok) return
    await request({ url: '/history/delete', method: 'POST', data: { goodsId: id } })
    toastSuccess('已删除')
    this.setData({ swipedId: null })
    this.loadHistory()
  },

  async clearAll() {
    const ok = await confirm('确定清空全部浏览记录吗？')
    if (!ok) return
    await request({ url: '/history/clear', method: 'POST' })
    toastSuccess('已清空')
    this.setData({ swipedId: null })
    this.loadHistory()
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
