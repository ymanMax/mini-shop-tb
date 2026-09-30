// pages/message/index.js
import { request } from '../../api/http.js'
import { toast } from '../../utils/toast.js'
import { formatRelative } from '../../utils/format.js'

Page({
  data: {
    tabs: [
      { id: 0, value: '全部', type: 0 },
      { id: 1, value: '订单', type: 2 },
      { id: 2, value: '促销', type: 3 },
      { id: 3, value: '系统', type: 1 }
    ],
    activeTab: 0,
    messages: [],
    unreadCount: 0
  },

  onShow() {
    this.loadMessages()
    // 进入消息中心后延迟 3 秒自动 push 一条促销消息
    if (!this._pushed) {
      this._pushed = true
      setTimeout(() => {
        request({
          url: '/message/push',
          method: 'POST',
          data: {
            type: 3,
            title: '限时抢购提醒',
            content: '您关注的抢购场即将开始，快来看看吧！',
            relatedId: 'seckill'
          }
        }).then(() => this.loadMessages())
      }, 3000)
    }
  },

  async loadMessages() {
    const tab = this.data.tabs[this.data.activeTab]
    const res = await request({ url: '/message/list', data: { type: tab.type } })
    const list = (res.data || []).map(m => ({
      ...m,
      timeText: formatRelative(m.createTime),
      typeIcon: m.type === 1 ? '⚙️' : m.type === 2 ? '📦' : '🎉'
    }))
    this.setData({ messages: list })
    const unreadRes = await request({ url: '/message/unread' })
    this.setData({ unreadCount: unreadRes.data.count })
    this.updateTabBadge()
  },

  updateTabBadge() {
    if (this.data.unreadCount > 0) {
      wx.setTabBarBadge({ index: 3, text: String(this.data.unreadCount), fail: () => {} })
    } else {
      wx.removeTabBarBadge({ index: 3, fail: () => {} })
    }
  },

  onTabTap(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ activeTab: index })
    this.loadMessages()
  },

  // 点击消息：标记已读 + 跳转
  async tapMessage(e) {
    const { id, relatedid, type } = e.currentTarget.dataset
    await request({ url: '/message/read', method: 'POST', data: { id } })
    this.loadMessages()
    // 跳转关联页
    if (type === 2 && relatedid) {
      wx.navigateTo({ url: `/pages/order/detail?id=${relatedid}` })
    } else if (type === 3) {
      if (relatedid === 'seckill') {
        wx.switchTab({ url: '/pages/index/index' })
      } else if (relatedid === 'coupon') {
        wx.navigateTo({ url: '/pages/coupon/index?tab=claim' })
      } else if (relatedid === 'checkin') {
        wx.navigateTo({ url: '/pages/checkin/index' })
      } else if (relatedid === 'points') {
        wx.navigateTo({ url: '/pages/points/index' })
      }
    }
    // 系统消息就地展开（不跳转）
  },

  // 全部已读
  async readAll() {
    await request({ url: '/message/readAll', method: 'POST' })
    toast.success('已全部标记为已读')
    this.loadMessages()
  }
})
