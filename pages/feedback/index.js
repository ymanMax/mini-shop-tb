// pages/feedback/index.js —— 意见反馈
Page({
  data: {
    tabs: [
      { id: 0, value: '体验问题', isActive: true },
      { id: 1, value: '商品、商家投诉', isActive: false }
    ],
    chooseImgs: [],
    textVal: ''
  },

  handleTabsItemChange(e) {
    const { index } = e.detail
    const tabs = this.data.tabs.map((t, i) => ({ ...t, isActive: i === index }))
    this.setData({ tabs })
  },

  handleChooseImg() {
    wx.chooseImage({
      count: 9,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (result) => {
        this.setData({
          chooseImgs: [...this.data.chooseImgs, ...result.tempFilePaths]
        })
      }
    })
  },

  handleRemoveImg(e) {
    const { index } = e.currentTarget.dataset
    const chooseImgs = [...this.data.chooseImgs]
    chooseImgs.splice(index, 1)
    this.setData({ chooseImgs })
  },

  handleTextInput(e) {
    this.setData({ textVal: e.detail.value })
  },

  handleImgError(e) {
    const { field } = e.currentTarget.dataset
    if (field) this.setData({ [field]: '/static/images/default.png' })
  },

  handleFormSubmit() {
    const { textVal, chooseImgs } = this.data
    if (!textVal.trim()) {
      wx.showToast({ title: '请输入反馈内容', icon: 'none' })
      return
    }
    wx.showLoading({ title: '提交中', mask: true })
    setTimeout(() => {
      wx.hideLoading()
      wx.showToast({ title: '反馈成功，感谢您的建议', icon: 'success' })
      this.setData({ textVal: '', chooseImgs: [] })
      setTimeout(() => wx.navigateBack({ delta: 1 }), 1500)
    }, 1000)
  }
})
