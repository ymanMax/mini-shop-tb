// pages/message/index.js —— 消息中心
import { request } from '../../api/http.js'
import common from '../../behaviors/common.js'
import regeneratorRuntime from '../../lib/runtime/runtime.js'
import { formatRelative } from '../../utils/format.js'

Page({
  behaviors: [common],
  data: {
    tabs: [
      { key: 'all', label: '全部' },
      { key: 2, label: '订单' },
      { key: 3, label: '促销' },
      { key: 1, label: '系统' }
    ],
    activeTab: 'all',
    messages: [],
    filtered: [],
    loading: true
  },

  onLoad() {
    // 进入消息中心后延迟 3 秒自动 push 一条促销消息
    this._pushTimer = setTimeout(() => {
      request({
        url: '/message/push',
        method: 'POST',
        data: {
          type: 3,
          title: '🎉 限时福利来袭',
          content: '您有一张无门槛券待使用，限时抢购专场即将开始，快来看看吧！',
          relatedId: 'seckill'
        }
      }).then(() => this.loadMessages())
    }, 3000)
  },

  onUnload() {
    if (this._pushTimer) clearTimeout(this._pushTimer)
  },

  onShow() {
    this.loadMessages()
  },

  async loadMessages() {
    const list = await request({ url: '/message/list' })
    const enriched = (list || []).map(m => ({ ...m, timeText: formatRelative(m.createTime) }))
    this.setData({ messages: enriched, loading: false })
    this.applyFilter()
  },

  applyFilter() {
    const filtered = this.data.activeTab === 'all'
      ? this.data.messages
      : this.data.messages.filter(m => m.type === this.data.activeTab)
    this.setData({ filtered })
  },

  switchTab(e) {
    const { key } = e.currentTarget.dataset
    this.setData({ activeTab: key })
    this.applyFilter()
  },

  async tapMessage(e) {
    const { id, type, relatedid } = e.currentTarget.dataset
    // 标记已读
    await request({ url: '/message/read', method: 'POST', data: { id } })
    this.loadMessages()
    // 跳转关联页
    if (type === 2 && relatedid) {
      // 订单消息 -> 订单详情
      wx.navigateTo({ url: `/pages/order/detail/index?id=${relatedid}` })
    } else if (type === 3) {
      // 促销消息 -> 领券中心 / 抢购
      if (relatedid === 'seckill') wx.navigateTo({ url: '/pages/seckill/index' })
      else if (relatedid === 'coupon') wx.navigateTo({ url: '/pages/coupon/index' })
      else if (relatedid === 'points') wx.navigateTo({ url: '/pages/points/index' })
    } else if (type === 1) {
      // 系统消息 -> 就地展开（toggle 显示内容）
      this.toggleExpand(id)
    }
  },

  toggleExpand(id) {
    const messages = this.data.messages.map(m => m.id === id ? { ...m, expanded: !m.expanded } : m)
    this.setData({ messages })
    this.applyFilter()
  },

  async readAll() {
    await request({ url: '/message/readAll', method: 'POST' })
    this.loadMessages()
    // 清零 tabBar 角标
    const app = getApp()
    if (app && app.refreshCartCount) {
      // 消息角标独立管理
    }
    wx.removeTabBarBadge({ index: 3, fail: () => {} })
  }
})
