// pages/index/index.js
import { request, updateCartBadge } from '../../api/http.js'
import { toast } from '../../utils/toast.js'
import { formatPrice } from '../../utils/format.js'

Page({
  data: {
    swiperList: [],
    catesList: [],
    floorList: [],
    cartCount: 0,
    skeleton: true,
    // 限时抢购
    seckillSessions: [],
    currentSession: 0,
    countdown: '00:00:00',
    // SKU 弹层
    showSku: false,
    skuGoods: null,
    skuSessionId: null,
    selectedSpecs: {},
    skuPrice: 0,
    skuStock: 0,
    count: 1,
    specsText: ''
  },

  timer: null,

  onLoad() {
    this.loadData()
    this.loadSeckill()
  },

  onShow() {
    updateCartBadge()
    this.setData({ cartCount: this.getCartCount() })
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer)
  },

  getCartCount() {
    const cart = wx.getStorageSync('mk_cart') || []
    return cart.reduce((s, c) => s + c.count, 0)
  },

  async loadData() {
    const [swiperRes, catesRes, floorsRes] = await Promise.all([
      request({ url: '/home/swiper' }),
      request({ url: '/home/cates' }),
      request({ url: '/home/floors' })
    ])
    const swiperList = (swiperRes.data || []).map(s => ({ ...s, image: s.image }))
    const catesList = catesRes.data || []
    const floorList = (floorsRes.data || []).map(f => ({
      ...f,
      list: (f.list || []).map(g => ({ ...g, priceText: formatPrice(g.price) }))
    }))
    this.setData({ swiperList, catesList, floorList, skeleton: false })
  },

  // ============ 限时抢购 ============
  async loadSeckill() {
    const res = await request({ url: '/seckill/sessions' })
    const sessions = res.data || []
    // 计算当前场次：按小时判断
    const now = new Date()
    const hour = now.getHours()
    let current = 0
    sessions.forEach((s, i) => {
      if (hour >= s.startHour) current = i
    })
    this.setData({ seckillSessions: sessions, currentSession: current })
    this.startCountdown()
  },

  startCountdown() {
    if (this.timer) clearInterval(this.timer)
    this.timer = setInterval(() => {
      const session = this.data.seckillSessions[this.data.currentSession]
      if (!session) return
      const now = new Date()
      // 场次结束时间 = startHour + 2
      const end = new Date(now)
      end.setHours(session.startHour + 2, 0, 0, 0)
      let diff = end - now
      if (diff <= 0) {
        // 切到下一场
        const next = (this.data.currentSession + 1) % this.data.seckillSessions.length
        this.setData({ currentSession: next })
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      const pad = n => String(n).padStart(2, '0')
      this.setData({ countdown: `${pad(h)}:${pad(m)}:${pad(s)}` })
    }, 1000)
  },

  onSessionTap(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ currentSession: index })
    this.startCountdown()
  },

  // 马上抢 → 打开 SKU
  openSku(e) {
    const { goods } = e.currentTarget.dataset
    const session = this.data.seckillSessions[this.data.currentSession]
    // 默认选中每个规格第一个
    const selectedSpecs = {}
    if (goods.specs && goods.specs.length) {
      goods.specs.forEach(s => {
        if (s.values && s.values.length) selectedSpecs[s.name] = s.values[0].label
      })
    }
    this.setData({
      showSku: true,
      skuGoods: goods,
      skuSessionId: session.id,
      selectedSpecs,
      skuPrice: goods.seckillPrice,
      skuStock: goods.stock,
      count: 1,
      specsText: Object.values(selectedSpecs).join(' · ') || '标准装'
    })
  },

  closeSku() {
    this.setData({ showSku: false })
  },

  onSpecTap(e) {
    const { specName, label } = e.currentTarget.dataset
    const selectedSpecs = { ...this.data.selectedSpecs, [specName]: label }
    let skuPrice = this.data.skuGoods.seckillPrice
    let skuStock = this.data.skuGoods.stock
    this.data.skuGoods.specs.forEach(s => {
      const val = s.values.find(v => v.label === selectedSpecs[s.name])
      if (val) {
        if (val.price !== undefined) skuPrice = val.price
        if (val.stock !== undefined) skuStock = val.stock
      }
    })
    this.setData({ selectedSpecs, skuPrice, skuStock, specsText: Object.values(selectedSpecs).join(' · ') || '标准装' })
  },

  onCountChange(e) {
    const { delta } = e.currentTarget.dataset
    let count = this.data.count + delta
    const stock = this.data.skuStock || 999
    if (count < 1) count = 1
    if (count > stock) {
      toast.info('已达库存上限')
      count = stock
    }
    this.setData({ count })
  },

  // 确认抢购
  async confirmSeckill() {
    const goods = this.data.skuGoods
    const specText = Object.values(this.data.selectedSpecs).join(' · ') || '标准装'
    const res = await request({
      url: '/seckill/buy',
      method: 'POST',
      data: {
        sessionId: this.data.skuSessionId,
        goodsId: goods.goodsId,
        specText,
        count: this.data.count
      }
    })
    if (res.code === 200) {
      toast.success('抢购成功，已加入购物车')
      this.setData({ showSku: false })
      updateCartBadge()
      this.setData({ cartCount: this.getCartCount() })
    } else {
      toast.error(res.msg || '抢购失败')
    }
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/index' })
  },

  goCategory() {
    wx.switchTab({ url: '/pages/category/index' })
  },

  goDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` })
  },

  goSwiper(e) {
    const { link } = e.currentTarget.dataset
    if (link) {
      wx.navigateTo({ url: link })
    }
  },

  onImgError(e) {
    const { type, index } = e.currentTarget.dataset
    if (type === 'swiper') {
      this.setData({ [`swiperList[${index}].image`]: '/static/images/default.png' })
    } else if (type === 'floor') {
      const { fidx, gidx } = e.currentTarget.dataset
      this.setData({ [`floorList[${fidx}].list[${gidx}].mainPic`]: '/static/images/default.png' })
    } else if (type === 'seckill') {
      const { sidx } = e.currentTarget.dataset
      this.setData({ [`seckillSessions[${this.data.currentSession}].items[${sidx}].mainPic`]: '/static/images/default.png' })
    }
  }
})
