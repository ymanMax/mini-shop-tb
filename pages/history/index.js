// pages/history/index.js
import { request } from '../../api/http.js'
import { toast, confirm } from '../../utils/toast.js'
import { formatPrice, formatDateTime } from '../../utils/format.js'

Page({
  data: {
    groups: [],        // [{ title: '今天', items: [...] }]
    swipeId: null,
    touchStartX: 0
  },

  onShow() {
    this.loadHistory()
  },

  async loadHistory() {
    const res = await request({ url: '/history/list' })
    const list = (res.data || []).map(h => ({
      ...h,
      priceText: formatPrice(h.price),
      timeText: formatDateTime(h.browseTime)
    }))
    // 按日期分组：今天/昨天/更早
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const yesterday = today - 24 * 3600 * 1000
    const groups = [
      { title: '今天', items: [] },
      { title: '昨天', items: [] },
      { title: '更早', items: [] }
    ]
    list.forEach(h => {
      const t = h.browseTime
      if (t >= today) groups[0].items.push(h)
      else if (t >= yesterday) groups[1].items.push(h)
      else groups[2].items.push(h)
    })
    // 每组内按时间倒序（接口已返回倒序，这里保证）
    groups.forEach(g => g.items.sort((a, b) => b.browseTime - a.browseTime))
    // 过滤空组
    const filtered = groups.filter(g => g.items.length > 0)
    this.setData({ groups: filtered, swipeId: null })
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

  // 单条删除
  async removeItem(e) {
    const { id } = e.currentTarget.dataset
    await request({ url: '/history/remove', method: 'POST', data: { goodsId: id } })
    toast.success('已删除')
    this.loadHistory()
  },

  // 清空全部
  async clearAll() {
    const ok = await confirm('确定清空全部浏览记录吗？')
    if (!ok) return
    await request({ url: '/history/clear', method: 'POST' })
    toast.success('已清空')
    this.loadHistory()
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  },

  onImgError(e) {
    const { group, index } = e.currentTarget.dataset
    this.setData({ [`groups[${group}].items[${index}].mainPic`]: '/static/images/default.png' })
  }
})
