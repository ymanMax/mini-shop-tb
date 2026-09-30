// pages/points/index.js
import { request } from '../../api/http.js'
import { toast, confirm } from '../../utils/toast.js'
import { formatDateTime, formatRelative } from '../../utils/format.js'

Page({
  data: {
    balance: 0,
    records: [],
    exchangeItems: [],
    page: 1,
    size: 15,
    total: 0,
    noMore: false,
    loading: false
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    const infoRes = await request({ url: '/points/info' })
    if (infoRes.code === 200) {
      this.setData({ balance: infoRes.data.balance })
      this.loadRecords()
    }
    // 兑换项（mock 常量）
    this.setData({
      exchangeItems: [
        { id: 'ex1', points: 100, title: '满30减5券', desc: '满30元可用，全场通用', couponTemplateId: 'cp1' },
        { id: 'ex2', points: 200, title: '满50减10券', desc: '满50元可用，全场通用', couponTemplateId: 'cp2' },
        { id: 'ex3', points: 500, title: '满99减25券', desc: '满99元可用，全场通用', couponTemplateId: 'cp3' },
        { id: 'ex4', points: 800, title: '指定商品免费兑换', desc: '免费兑换芝麻酥烧饼1份', goodsId: 106 }
      ]
    })
  },

  async loadRecords() {
    if (this.data.loading) return
    this.setData({ loading: true })
    const res = await request({ url: '/points/records', data: { page: this.data.page, size: this.data.size } })
    const { records, total } = res.data || { records: [], total: 0 }
    const list = records.map(r => ({
      ...r,
      timeText: formatRelative(r.time),
      typeText: r.type === 1 ? '购物' : r.type === 2 ? '签到' : r.type === 3 ? '评价' : '兑换'
    }))
    this.setData({
      records: this.data.page === 1 ? list : [...this.data.records, ...list],
      total,
      loading: false,
      noMore: this.data.page * this.data.size >= total
    })
  },

  // 兑换
  async exchange(e) {
    const { id, points, title } = e.currentTarget.dataset
    if (this.data.balance < points) {
      toast.info('积分不够')
      return
    }
    const ok = await confirm(`确定使用 ${points} 积分兑换「${title}」吗？`)
    if (!ok) return
    const res = await request({ url: '/points/exchange', method: 'POST', data: { exchangeId: id } })
    if (res.code === 200) {
      toast.success('兑换成功')
      this.loadData()
    } else {
      toast.error(res.msg || '兑换失败')
    }
  },

  goCheckin() {
    wx.navigateTo({ url: '/pages/checkin/index' })
  },

  onReachBottom() {
    if (this.data.noMore || this.data.loading) return
    this.setData({ page: this.data.page + 1 })
    this.loadRecords()
  }
})
