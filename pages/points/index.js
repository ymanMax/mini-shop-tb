// pages/points/index.js —— 积分中心
import { get, post } from '../../api/http.js'
import { success, fail, confirm } from '../../utils/toast.js'
import { relativeTime } from '../../utils/format.js'

Page({
  data: {
    points: 0,
    records: [],
    exchangeItems: [],
    loading: true
  },

  onShow() {
    this.loadPoints()
    this.loadExchange()
  },

  async loadPoints() {
    const res = await get('/points/info')
    const records = (res.records || []).map(r => ({ ...r, timeText: relativeTime(r.time) }))
    this.setData({ points: res.points, records, loading: false })
  },

  async loadExchange() {
    const exchangeItems = await get('/points/exchange')
    this.setData({ exchangeItems })
  },

  async handleExchange(e) {
    const { id, points, name } = e.currentTarget.dataset
    if (this.data.points < points) {
      fail('积分不够')
      return
    }
    const ok = await confirm(`确定用 ${points} 积分兑换「${name}」吗?`)
    if (!ok) return
    await post('/coupon/exchange', { points, couponId: id })
    success('兑换成功')
    this.loadPoints()
    this.loadExchange()
  },

  goCheckin() {
    wx.navigateTo({ url: '/pages/checkin/index' })
  }
})
