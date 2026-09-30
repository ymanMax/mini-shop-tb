// pages/coupon/index.js —— 领券中心 + 我的优惠券
import { get, post } from '../../api/http.js'
import { success, confirm } from '../../utils/toast.js'

Page({
  data: {
    tabs: [
      { id: 0, value: '领券中心', isActive: true },
      { id: 1, value: '未使用', isActive: false },
      { id: 2, value: '已使用', isActive: false },
      { id: 3, value: '已过期', isActive: false }
    ],
    templates: [],
    myCoupons: [],
    loading: true
  },

  onShow() {
    this.loadTemplates()
    this.loadMyCoupons()
  },

  async loadTemplates() {
    const templates = await get('/coupon/templates')
    // 标记已领
    const myCoupons = await get('/coupon/my')
    const claimedIds = myCoupons.filter(c => c.status === 'unused').map(c => c.templateId)
    const list = templates.map(t => ({ ...t, claimed: claimedIds.includes(t.id) }))
    this.setData({ templates: list, loading: false })
  },

  async loadMyCoupons() {
    const myCoupons = await get('/coupon/my')
    this.setData({ myCoupons })
  },

  handleTabChange(e) {
    const { index } = e.detail
    const tabs = this.data.tabs.map((t, i) => ({ ...t, isActive: i === index }))
    this.setData({ tabs })
  },

  async claimCoupon(e) {
    const { id } = e.currentTarget.dataset
    await post('/coupon/claim', { templateId: id })
    success('领取成功')
    this.loadTemplates()
    this.loadMyCoupons()
  },

  goUse(e) {
    wx.switchTab({ url: '/pages/index/index' })
  },

  handleImgError() {}
})
