// pages/history/index.js —— 浏览足迹
import { get, post } from '../../api/http.js'
import { success, confirm } from '../../utils/toast.js'
import { relativeTime } from '../../utils/format.js'

Page({
  data: {
    groups: [],
    loading: true,
    swipedId: null
  },

  onShow() {
    this.loadHistory()
  },

  async loadHistory() {
    const list = await get('/history/list')
    // 按日期分组：今天/昨天/更早
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const yesterday = today.getTime() - 86400 * 1000

    const groupsMap = { 今天: [], 昨天: [], 更早: [] }
    list.forEach(item => {
      const t = item.browseTime
      if (t >= today.getTime()) groupsMap['今天'].push(item)
      else if (t >= yesterday) groupsMap['昨天'].push(item)
      else groupsMap['更早'].push(item)
    })

    const groups = []
    Object.keys(groupsMap).forEach(key => {
      if (groupsMap[key].length) {
        groups.push({
          title: key,
          items: groupsMap[key].map(it => ({ ...it, timeText: relativeTime(it.browseTime) }))
        })
      }
    })

    this.setData({ groups, loading: false })
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  async removeItem(e) {
    const { id } = e.currentTarget.dataset
    const ok = await confirm('确定删除这条记录吗?')
    if (!ok) return
    await post('/history/remove', { goodsId: id })
    success('已删除')
    this.loadHistory()
  },

  async clearAll() {
    const ok = await confirm('确定清空全部浏览记录吗?')
    if (!ok) return
    await post('/history/clear')
    success('已清空')
    this.loadHistory()
  },

  // 左滑
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
    const { groupIndex, itemIndex } = e.currentTarget.dataset
    this.setData({ [`groups[${groupIndex}].items[${itemIndex}].mainPic`]: '/static/images/default.png' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' })
  }
})
