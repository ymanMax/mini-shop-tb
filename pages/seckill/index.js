// pages/seckill/index.js —— 限时抢购全场页
import { request } from '../../api/http.js'
import common from '../../behaviors/common.js'
import regeneratorRuntime from '../../lib/runtime/runtime.js'
import { toastSuccess, toastInfo } from '../../utils/toast.js'

Page({
  behaviors: [common],
  data: {
    sessions: [],
    activeSession: 0,
    countdown: '00:00:00'
  },

  onLoad() {
    this.loadSeckill()
  },

  onShow() {
    this.loadSeckill()
  },

  onUnload() {
    if (this._timer) clearInterval(this._timer)
  },

  async loadSeckill() {
    const sessions = await request({ url: '/seckill/sessions' })
    const now = new Date()
    const curHour = now.getHours()
    let activeIdx = sessions.findIndex(s => curHour >= s.hour && curHour < s.hour + 2)
    if (activeIdx === -1) activeIdx = 0
    this.setData({ sessions, activeSession: activeIdx })
    this.startCountdown(sessions[activeIdx])
  },

  startCountdown(session) {
    if (this._timer) clearInterval(this._timer)
    const now = new Date()
    const end = new Date(now)
    end.setHours(session.hour + 2, 0, 0, 0)
    if (end.getTime() < now.getTime()) end.setDate(end.getDate() + 1)
    const tick = () => {
      const diff = end.getTime() - Date.now()
      if (diff <= 0) {
        this.setData({ countdown: '00:00:00' })
        const next = (this.data.activeSession + 1) % this.data.sessions.length
        this.setData({ activeSession: next })
        this.startCountdown(this.data.sessions[next])
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      const pad = (n) => (n < 10 ? '0' + n : '' + n)
      this.setData({ countdown: `${pad(h)}:${pad(m)}:${pad(s)}` })
    }
    tick()
    this._timer = setInterval(tick, 1000)
  },

  switchSession(e) {
    const { idx } = e.currentTarget.dataset
    this.setData({ activeSession: idx })
    this.startCountdown(this.data.sessions[idx])
  },

  async seckillBuy(e) {
    const { sessionid, goodsid, price } = e.currentTarget.dataset
    const res = await request({
      url: '/seckill/buy',
      method: 'POST',
      data: { sessionId: sessionid, goodsId: goodsid, price }
    })
    if (res.success) {
      toastSuccess('已抢购，加入购物车')
      this.refreshCartBadge()
      this.loadSeckill()
    } else {
      toastInfo(res.msg || '抢购失败')
    }
  },

  goGoods(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  }
})
