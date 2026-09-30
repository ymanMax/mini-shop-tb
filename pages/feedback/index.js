// pages/feedback/index.js
import { toast } from '../../utils/toast.js'

Page({
  data: {
    types: ['功能建议', '商品投诉', '物流问题', '其他问题'],
    activeType: 0,
    chooseImgs: [],
    textVal: ''
  },

  onTypeTap(e) {
    this.setData({ activeType: e.currentTarget.dataset.index })
  },

  handleTextInput(e) {
    this.setData({ textVal: e.detail.value })
  },

  handleChooseImg() {
    const remain = 3 - this.data.chooseImgs.length
    if (remain <= 0) {
      toast.info('最多上传3张图片')
      return
    }
    wx.chooseImage({
      count: remain,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({ chooseImgs: [...this.data.chooseImgs, ...res.tempFilePaths] })
      }
    })
  },

  handleRemoveImg(e) {
    const { index } = e.currentTarget.dataset
    const chooseImgs = [...this.data.chooseImgs]
    chooseImgs.splice(index, 1)
    this.setData({ chooseImgs })
  },

  handleFormSubmit() {
    if (!this.data.textVal.trim()) {
      toast.info('请输入反馈内容')
      return
    }
    toast.loading('提交中')
    setTimeout(() => {
      toast.hideLoading()
      toast.success('反馈成功')
      setTimeout(() => wx.navigateBack({ delta: 1 }), 1000)
    }, 1000)
  }
})
