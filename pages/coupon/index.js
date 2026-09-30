// pages/coupon/index.js
import { request } from '../../api/http.js'
import { toast } from '../../utils/toast.js'
import { formatPrice, formatDateTime } from '../../utils/format.js'

Page({
  data: {
    tab: 'claim',   // claim 领券中心 | mine 我的优惠券
    // 领券中心
    templates: [],
    // 我的优惠券
    myTabs: [
      { id: 1, value: '未使用' },
      { id: 2, value: '已使用' },
      { id: 3, value: '已过期' }
    ],
    activeMyTab: 1,
    myCoupons: [],
    // 有效期倒计时
    now: Date.now()
  },

  onLoad(options) {
    if (options.tab) this.setData({ tab: options.tab })
  },

  onShow() {
    this.loadData()
  },

  async loadData() {
    if (this.data.tab === 'claim') {
      await this.loadTemplates()
    } else {
      await this.loadMyCoupons()
    }
  },

  switchTab(e) {
    const { tab } = e.currentTarget.dataset
    this.setData({ tab })
    this.loadData()
  },

  // ============ 领券中心 ============
  async loadTemplates() {
    const res = await request({ url: '/coupon/templates' })
    const list = (res.data || []).map(t => ({
      ...t,
      amountText: t.amount ? formatPrice(t.amount) : '',
      discountText: t.discount ? (t.discount * 10).toFixed(1) + '折' : ''
    }))
    this.setData({ templates: list })
  },

  async claim(e) {
    const { id } = e.currentTarget.dataset
    const res = await request({ url: '/coupon/claim', method: 'POST', data: { templateId: id } })
    if (res.code === 200) {
      toast.success('领取成功')
      this.loadTemplates()
    } else {
      toast.error(res.msg || '领取失败')
    }
  },

  // ============ 我的优惠券 ============
  async loadMyCoupons() {
    const res = await request({ url: '/coupon/my', data: { status: this.data.activeMyTab } })
    const list = (res.data || []).map(c => ({
      ...c,
      amountText: c.amount ? formatPrice(c.amount) : '',
      discountText: c.discount ? (c.discount * 10).toFixed(1) + '折' : '',
      expireText: formatDateTime(c.expireTime),
      remainHours: Math.max(0, Math.ceil((c.expireTime - Date.now()) / 3600000))
    }))
    this.setData({ myCoupons: list })
  },

  onMyTabTap(e) {
    const { id } = e.currentTarget.dataset
    this.setData({ activeMyTab: id })
    this.loadMyCoupons()
  },

  goUse(e) {
    const { scope } = e.currentTarget.dataset
    // 跳首页或分类页
    wx.switchTab({ url: '/pages/category/index' })
  }
})
