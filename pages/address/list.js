// pages/address/list.js —— 地址列表（管理/选择模式）
import { get, post } from '../../api/http.js'
import { success, fail, confirm } from '../../utils/toast.js'

Page({
  data: {
    addresses: [],
    mode: 'manage', // manage | select
    loading: true,
    swipedId: null
  },

  onLoad(options) {
    if (options.mode === 'select') {
      this.setData({ mode: 'select' })
      wx.setNavigationBarTitle({ title: '选择收货地址' })
    }
  },

  onShow() {
    this.loadAddresses()
  },

  async loadAddresses() {
    const addresses = await get('/user/address')
    this.setData({ addresses, loading: false })
  },

  // 选择模式：点击地址回填
  handleSelect(e) {
    const { id } = e.currentTarget.dataset
    if (this.data.mode !== 'select') return
    const addr = this.data.addresses.find(a => a.id === id)
    // 写入 storage 供上一页读取
    wx.setStorageSync('selectedAddress', addr)
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

  // 设为默认
  async setDefault(e) {
    const { id } = e.currentTarget.dataset
    await post('/user/address/setDefault', { id })
    success('已设为默认地址')
    this.loadAddresses()
  },

  // 删除
  async removeAddress(e) {
    const { id } = e.currentTarget.dataset
    const addr = this.data.addresses.find(a => a.id === id)
    if (addr && addr.isDefault) {
      fail('默认地址不可删除，请先设置其他地址为默认')
      return
    }
    const ok = await confirm('确定删除该地址吗?')
    if (!ok) return
    await post('/address/delete', { id })
    success('已删除')
    this.loadAddresses()
  },

  // 左滑
  touchStartX: 0,
  handleTouchStart(e) {
    this.touchStartX = e.touches[0].clientX
  },
  handleTouchEnd(e) {
    const delta = e.changedTouches[0].clientX - this.touchStartX
    const { id } = e.currentTarget.dataset
    if (delta < -50) this.setData({ swipedId: id })
    else if (delta > 50) this.setData({ swipedId: null })
  }
})
