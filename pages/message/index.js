// pages/message/index.js —— 消息中心
import { get, post } from '../../api/http.js'
import { relativeTime } from '../../utils/format.js'

Page({
  data: {
    tabs: [
      { id: 0, value: '全部', type: 0, isActive: true },
      { id: 1, value: '订单', type: 2, isActive: false },
      { id: 2, value: '促销', type: 3, isActive: false },
      { id: 3, value: '系统', type: 1, isActive: false }
    ],
    messages: [],
    loading: true
  },

  onShow() {
    this.loadMessages()
    // 延迟 3 秒自动 push 一条促销消息
    if (!this._pushed) {
      this._pushed = true
      setTimeout(() => {
        post('/messages/push', {
          type: 3,
          title: '限时抢购提醒',
          content: '新品藤椒烧饼限时8折，今晚20:00准时开抢',
          relatedId: ''
        }).then(() => this.loadMessages())
      }, 3000)
    }
  },

  async loadMessages() {
    const activeTab = this.data.tabs.find(t => t.isActive)
    const messages = await get('/messages/list', { type: activeTab.type })
    const list = (messages || []).map(m => ({ ...m, timeText: relativeTime(m.createTime) }))
    this.setData({ messages: list, loading: false })
    this.updateBadge()
  },

  updateBadge() {
    const app = getApp()
    const unread = this.data.messages.filter(m => !m.isRead).length
    // 我的页角标（tabBar 索引 3）
    if (unread > 0) {
      wx.setTabBarBadge({ index: 3, text: String(unread), fail: () => {} })
    } else {
      wx.removeTabBarBadge({ index: 3, fail: () => {} })
    }
  },

  handleTabChange(e) {
    const { index } = e.detail
    const tabs = this.data.tabs.map((t, i) => ({ ...t, isActive: i === index }))
    this.setData({ tabs, loading: true })
    this.loadMessages()
  },

  async handleMessageTap(e) {
    const { id, type, relatedId } = e.currentTarget.dataset
    // 标记已读
    await post('/messages/read', { id })
    this.loadMessages()
    // 跳转
    if (type === 2 && relatedId) {
      wx.navigateTo({ url: `/pages/order/detail?id=${relatedId}` })
    } else if (type === 3) {
      wx.navigateTo({ url: '/pages/coupon/index' })
    }
    // 系统消息就地展开（无跳转）
  },

  async readAll() {
    await post('/messages/readAll')
    this.loadMessages()
  }
})
