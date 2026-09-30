// pages/address/list/index.js —— 地址列表（管理 / 选择双模式）
import { request } from '../../../api/http.js'
import common from '../../../behaviors/common.js'
import regeneratorRuntime from '../../../lib/runtime/runtime.js'
import { toastSuccess, toastInfo, confirm } from '../../../utils/toast.js'

Page({
  behaviors: [common],
  data: {
    mode: 'manage', // manage | select
    addresses: [],
    swipedId: null
  },

  onLoad(options) {
    this.setData({ mode: options.mode || 'manage' })
  },

  onShow() {
    this.loadList()
  },

  async loadList() {
    const res = await request({ url: '/address/list' })
    this.setData({ addresses: res || [] })
  },

  // 选择模式：点击地址卡片选中（设为默认）并返回
  tapAddress(e) {
    const { id } = e.currentTarget.dataset
    if (this.data.mode === 'select') {
      request({ url: '/address/setDefault', method: 'POST', data: { id } }).then(() => {
        toastSuccess('已选择该地址')
        wx.navigateBack()
      })
    }
  },

  // 编辑
  goEdit(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({ url: `/pages/address/edit/index?id=${id}` })
  },

  // 删除（左滑）
  async deleteAddress(e) {
    const { id } = e.currentTarget.dataset
    const target = this.data.addresses.find(a => a.id === id)
    if (target && target.isDefault) {
      toastInfo('默认地址不可删除，请先设置其他地址为默认')
      return
    }
    const ok = await confirm('确定删除该地址吗？')
    if (!ok) return
    await request({ url: '/address/delete', method: 'POST', data: { id } })
    toastSuccess('已删除')
    this.setData({ swipedId: null })
    this.loadList()
  },

  // 设为默认
  setDefault(e) {
    const { id } = e.currentTarget.dataset
    request({ url: '/address/setDefault', method: 'POST', data: { id } }).then(() => {
      toastSuccess('已设为默认')
      this.loadList()
    })
  },

  goAdd() {
    wx.navigateTo({ url: '/pages/address/edit/index' })
  },

  stopPropagation() {},

  // 左滑
  touchStart(e) {
    this._touchX = e.touches[0].clientX
    this._touchId = e.currentTarget.dataset.id
  },
  touchMove(e) {
    const dx = e.touches[0].clientX - this._touchX
    if (dx < -40 && this._touchId) this.setData({ swipedId: this._touchId })
    else if (dx > 40) this.setData({ swipedId: null })
  },
  closeSwipe() {
    this.setData({ swipedId: null })
  }
})
