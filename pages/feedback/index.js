// pages/feedback/index.js —— 意见反馈
import { toastSuccess } from '../../utils/toast.js'

Page({
  data: {
    type: '体验问题',
    types: ['体验问题', '商品投诉', '功能建议', '其他'],
    textVal: '',
    chooseImgs: []
  },

  switchType(e) {
    const { type } = e.currentTarget.dataset
    this.setData({ type })
  },

  handleTextInput(e) {
    this.setData({ textVal: e.detail.value })
  },

  handleChooseImg() {
    if (this.data.chooseImgs.length >= 3) {
      wx.showToast({ title: '最多上传3张', icon: 'none' })
      return
    }
    wx.chooseImage({
      count: 3 - this.data.chooseImgs.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ chooseImgs: [...this.data.chooseImgs, ...res.tempFilePaths] })
      }
    })
  },

  removeImg(e) {
    const { index } = e.currentTarget.dataset
    const chooseImgs = this.data.chooseImgs.filter((_, i) => i !== index)
    this.setData({ chooseImgs })
  },

  handleSubmit() {
    if (!this.data.textVal.trim()) {
      wx.showToast({ title: '请描述您的问题', icon: 'none' })
      return
    }
    wx.showLoading({ title: '提交中', mask: true })
    setTimeout(() => {
      wx.hideLoading()
      toastSuccess('反馈成功，感谢您的建议')
      setTimeout(() => wx.navigateBack(), 800)
    }, 800)
  }
})
