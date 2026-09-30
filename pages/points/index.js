// pages/points/index.js —— 积分中心
import { request } from '../../api/http.js'
import common from '../../behaviors/common.js'
import regeneratorRuntime from '../../lib/runtime/runtime.js'
import { toastSuccess, toastInfo, confirm } from '../../utils/toast.js'
import { formatTime } from '../../utils/format.js'

Page({
  behaviors: [common],
  data: {
    points: 0,
    records: [],
    exchangeItems: [],
    loading: true
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    const info = await request({ url: '/points/info' })
    const records = (info.records || []).map(r => ({ ...r, timeText: formatTime(r.time) }))
    this.setData({
      points: info.points,
      records,
      exchangeItems: info.exchangeItems || [],
      loading: false
    })
  },

  async exchange(e) {
    const { id, cost, name } = e.currentTarget.dataset
    if (this.data.points < cost) {
      toastInfo('积分不足')
      return
    }
    const ok = await confirm(`确认消耗 ${cost} 积分兑换「${name}」吗？`)
    if (!ok) return
    const res = await request({ url: '/points/exchange', method: 'POST', data: { exchangeId: id } })
    if (res.success) {
      toastSuccess('兑换成功')
      this.loadData()
    } else {
      toastInfo(res.msg || '兑换失败')
    }
  },

  goCheckin() {
    wx.navigateTo({ url: '/pages/checkin/index' })
  },

  goCoupon() {
    wx.navigateTo({ url: '/pages/coupon/index' })
  }
})
