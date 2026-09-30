// pages/index/index.js —— 首页（轮播 + 限时抢购 + 分类导航 + 楼层）
import { request } from '../../api/http.js'
import common from '../../behaviors/common.js'
import regeneratorRuntime from '../../lib/runtime/runtime.js'
import { toastSuccess, toastInfo } from '../../utils/toast.js'

Page({
  behaviors: [common],
  data: {
    banners: [],
    cates: [],
    floors: [],
    loading: true,
    // 抢购
    sessions: [],
    activeSession: 0,
    countdown: '00:00:00',
    now: Date.now()
  },

  onLoad() {
    this.loadHome()
    this.loadSeckill()
  },

  onShow() {
    this.refreshCartBadge()
    // 刷新抢购状态（可能已抢购）
    this.loadSeckill()
  },

  onUnload() {
    if (this._timer) clearInterval(this._timer)
  },

  async loadHome() {
    try {
      const [banners, cates, floors] = await Promise.all([
        request({ url: '/home/swiperdata' }),
        request({ url: '/home/catitems' }),
        request({ url: '/home/floordata' })
      ])
      this.setData({ banners, cates, floors, loading: false })
    } catch (e) {
      this.setData({ loading: false })
    }
  },

  async loadSeckill() {
    const sessions = await request({ url: '/seckill/sessions' })
    // 计算当前场次：当前小时落在哪个 [hour, hour+2) 区间
    const now = new Date()
    const curHour = now.getHours()
    let activeIdx = sessions.findIndex(s => curHour >= s.hour && curHour < s.hour + 2)
    if (activeIdx === -1) {
      // 找最近的：默认第一个（演示用）
      activeIdx = 0
    }
    this.setData({ sessions, activeSession: activeIdx })
    this.startCountdown(sessions[activeIdx])
  },

  // 倒计时：从当前时间到本场结束（hour+2:00）
  startCountdown(session) {
    if (this._timer) clearInterval(this._timer)
    const now = new Date()
    const end = new Date(now)
    end.setHours(session.hour + 2, 0, 0, 0)
    // 若已过结束时间，取当天或次日该场
    if (end.getTime() < now.getTime()) {
      end.setDate(end.getDate() + 1)
    }
    const tick = () => {
      const diff = end.getTime() - Date.now()
      if (diff <= 0) {
        this.setData({ countdown: '00:00:00' })
        // 自动切下一场
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

  // 马上抢：按抢购价加购（限购1件）
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

  goBanner(e) {
    const { link } = e.currentTarget.dataset
    if (link) wx.navigateTo({ url: link })
  },

  goCate(e) {
    wx.switchTab({ url: '/pages/category/index' })
  },

  onFloorImgError(e) {
    const { fidx, gidx } = e.currentTarget.dataset
    const floors = this.data.floors
    floors[fidx].product_list[gidx].mainPic = '/static/images/default.png'
    this.setData({ floors })
  },

  goGoods(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  goSeckill() {
    wx.navigateTo({ url: '/pages/seckill/index' })
  },

  onPullDownRefresh() {
    Promise.all([this.loadHome(), this.loadSeckill()]).then(() => wx.stopPullDownRefresh())
  }
})
