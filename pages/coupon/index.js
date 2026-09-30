// pages/coupon/index.js —— 领券中心 + 我的优惠券
import { request } from '../../api/http.js'
import common from '../../behaviors/common.js'
import regeneratorRuntime from '../../lib/runtime/runtime.js'
import { toastSuccess, toastInfo } from '../../utils/toast.js'
import { formatTime } from '../../utils/format.js'

Page({
  behaviors: [common],
  data: {
    mode: 'center', // center 领券中心 | mine 我的券
    tabs: [
      { key: 'unused', label: '未使用' },
      { key: 'used', label: '已使用' },
      { key: 'expired', label: '已过期' }
    ],
    activeTab: 'unused',
    templates: [],
    myCoupons: [],
    filtered: [],
    loading: true
  },

  onLoad(options) {
    if (options.mode === 'mine') {
      this.setData({ mode: 'mine' })
      wx.setNavigationBarTitle({ title: '我的优惠券' })
    }
  },

  onShow() {
    if (this.data.mode === 'center') this.loadTemplates()
    this.loadMyCoupons()
  },

  async loadTemplates() {
    const templates = await request({ url: '/coupon/templates' })
    const myCoupons = await request({ url: '/coupon/list' })
    // 标记已领（unused 状态）
    const claimed = new Set(myCoupons.filter(c => c.status === 'unused').map(c => c.templateId))
    const list = templates.map(t => ({ ...t, claimed: claimed.has(t.id) }))
    this.setData({ templates: list, loading: false })
  },

  async loadMyCoupons() {
    const list = await request({ url: '/coupon/list' })
    // 附加有效期文本
    const now = Date.now()
    const enriched = (list || []).map(c => {
      const tpl = c.template || {}
      const expireText = c.expireTime ? formatTime(c.expireTime) : ''
      const remainHours = c.expireTime ? Math.round((c.expireTime - now) / 3600000) : 0
      return { ...c, expireText, remainHours, tpl }
    })
    this.setData({ myCoupons: enriched })
    this.applyFilter()
  },

  applyFilter() {
    const filtered = this.data.myCoupons.filter(c => c.status === this.data.activeTab)
    this.setData({ filtered })
  },

  switchTab(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ activeTab: key })
    this.applyFilter()
  },

  async receive(e) {
    const { id } = e.currentTarget.dataset
    const res = await request({ url: '/coupon/receive', method: 'POST', data: { templateId: id } })
    if (res.success) {
      toastSuccess('领取成功')
      this.loadTemplates()
      this.loadMyCoupons()
    } else {
      toastInfo(res.msg || '领取失败')
    }
  },

  goUse(e) {
    // 去使用：跳首页或分类
    wx.switchTab({ url: '/pages/index/index' })
  },

  goCenter() {
    wx.navigateTo({ url: '/pages/coupon/index' })
  }
})
