// pages/address/list.js
import { request } from '../../api/http.js'
import { toast, confirm } from '../../utils/toast.js'

Page({
  data: {
    mode: 'manage',   // manage | select
    addressList: [],
    swipeId: null,
    touchStartX: 0
  },

  onLoad(options) {
    this.setData({ mode: options.mode || 'manage' })
  },

  onShow() {
    this.loadList()
  },

  async loadList() {
    const res = await request({ url: '/address/list' })
    this.setData({ addressList: res.data || [], swipeId: null })
  },

  // 选择模式：点击地址卡片回填
  tapAddress(e) {
    const { id } = e.currentTarget.dataset
    if (this.data.mode !== 'select') return
    const addr = this.data.addressList.find(a => a.id === id)
    if (!addr) return
    // 设为默认并返回
    request({ url: '/address/default', method: 'POST', data: { id } })
    const pages = getCurrentPages()
    const prev = pages[pages.length - 2]
    if (prev && prev.onAddressSelected) {
      prev.onAddressSelected(addr)
    }
    wx.navigateBack()
  },

  // 编辑
  goEdit(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/address/edit?id=${id}` })
  },

  // 新增
  goAdd() {
    wx.navigateTo({ url: '/pages/address/edit' })
  },

  // 左滑
  onTouchStart(e) {
    this.setData({ touchStartX: e.touches[0].clientX })
  },
  onTouchEnd(e) {
    const { id } = e.currentTarget.dataset
    const delta = e.changedTouches[0].clientX - this.data.touchStartX
    if (delta < -60) this.setData({ swipeId: id })
    else this.setData({ swipeId: null })
  },

  // 删除
  async removeAddress(e) {
    const { id } = e.currentTarget.dataset
    const addr = this.data.addressList.find(a => a.id === id)
    if (addr && addr.isDefault) {
      toast.info('默认地址不可删除，请先设置其他地址为默认')
      return
    }
    const ok = await confirm('确定删除该地址吗？')
    if (!ok) return
    const res = await request({ url: '/address/remove', method: 'POST', data: { id } })
    if (res.code === 200) {
      toast.success('已删除')
      this.loadList()
    } else {
      toast.error(res.msg || '删除失败')
    }
  },

  // 设为默认
  async setDefault(e) {
    const { id } = e.currentTarget.dataset
    await request({ url: '/address/default', method: 'POST', data: { id } })
    toast.success('已设为默认')
    this.loadList()
  }
})
