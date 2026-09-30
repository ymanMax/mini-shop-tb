// pages/index/index.js —— 首页（轮播 + 分类 + 楼层 + 限时抢购）
import { get, post } from '../../api/http.js'
import { success, fail } from '../../utils/toast.js'

Page({
  data: {
    swiperList: [],
    catesList: [],
    floorList: [],
    cartCount: 0,
    loading: true,
    // 限时抢购
    sessions: [],
    currentSession: 0,
    countdown: '00:00:00',
    seckillItems: []
  },

  onLoad() {
    this.loadData()
    this.loadSeckill()
    this.startCountdown()
  },

  onShow() {
    const app = getApp()
    app.refreshCartCount && app.refreshCartCount()
    this.setData({ cartCount: app.globalData.cartCount || 0 })
  },

  onUnload() {
    clearInterval(this.timer)
  },
  onHide() {
    clearInterval(this.timer)
  },

  async loadData() {
    const [swiper, cates, floors] = await Promise.all([
      get('/home/swiperdata'),
      get('/home/catitems'),
      get('/home/floordata')
    ])
    this.setData({
      swiperList: swiper || [],
      catesList: cates || [],
      floorList: floors || [],
      loading: false
    })
  },

  async loadSeckill() {
    const sessions = await get('/seckill/sessions')
    // 根据当前时间判断当前场次
    const now = new Date()
    const hour = now.getHours()
    let current = 0
    sessions.forEach((s, i) => {
      if (hour >= s.startHour && hour < s.endHour) current = i
    })
    this.setData({ sessions, currentSession: current, seckillItems: sessions[current].items })
  },

  // 倒计时
  startCountdown() {
    this.timer = setInterval(() => {
      const session = this.data.sessions[this.data.currentSession]
      if (!session) return
      const now = new Date()
      const end = new Date(now)
      end.setHours(session.endHour, 0, 0, 0)
      let diff = end - now
      if (diff <= 0) {
        // 切下一场
        const next = (this.data.currentSession + 1) % this.data.sessions.length
        this.setData({ currentSession: next, seckillItems: this.data.sessions[next].items })
        diff = 86400 * 1000 // 简化：下一场 24 小时后
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      const pad = (n) => String(n).padStart(2, '0')
      this.setData({ countdown: `${pad(h)}:${pad(m)}:${pad(s)}` })
    }, 1000)
  },

  // 切换场次
  handleSessionTap(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ currentSession: index, seckillItems: this.data.sessions[index].items })
  },

  // 马上抢 → 加购
  async handleSeckillBuy(e) {
    const { item } = e.currentTarget.dataset
    await post('/seckill/add', {
      goodsId: item.goodsId,
      seckillPrice: item.seckillPrice,
      count: 1
    })
    success('已加入购物车')
    const app = getApp()
    app.refreshCartCount && app.refreshCartCount()
    this.setData({ cartCount: app.globalData.cartCount || 0 })
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/index' })
  },

  goBanner(e) {
    const { link } = e.currentTarget.dataset
    if (link) wx.navigateTo({ url: link })
  },

  goCategory(e) {
    const { link } = e.currentTarget.dataset
    if (link) {
      const m = link.match(/categoryId=(\d+)/)
      if (m) wx.setStorageSync('pendingCategoryId', Number(m[1]))
      wx.switchTab({ url: '/pages/category/index' })
    }
  },

  goGoods(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  goSeckillDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  handleImgError(e) {
    const { field } = e.currentTarget.dataset
    if (field) this.setData({ [field]: '/static/images/default.png' })
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh())
  }
})
