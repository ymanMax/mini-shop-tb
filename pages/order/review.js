// pages/order/review.js —— 订单评价页（模块 5.2）
import { get, post, upload } from '../../api/http.js'
import { success, fail, loading, hideLoading } from '../../utils/toast.js'

Page({
  data: {
    order: null,
    goods: null,
    rating: 5,
    content: '',
    images: [],
    selectedTags: [],
    quickTags: ['新鲜美味', '分量足', '包装好', '物流快', '性价比高', '口感好'],
    submitting: false,
    tagSelected: {}
  },

  onLoad(options) {
    this.orderId = options.id
    this.loadOrder()
  },

  async loadOrder() {
    const order = await get('/orders/detail', { id: this.orderId })
    // 评价页默认评价第一个商品（简化：支持多商品时取第一个）
    const goods = order.items[0]
    this.setData({ order, goods })
  },

  // 星级选择
  handleStarSelect(e) {
    const { star } = e.currentTarget.dataset
    this.setData({ rating: star })
  },

  // 快捷标签
  handleTagToggle(e) {
    const { tag } = e.currentTarget.dataset
    const selectedTags = [...this.data.selectedTags]
    const tagSelected = { ...this.data.tagSelected }
    const idx = selectedTags.indexOf(tag)
    if (idx >= 0) {
      selectedTags.splice(idx, 1)
      tagSelected[tag] = false
    } else {
      selectedTags.push(tag)
      tagSelected[tag] = true
    }
    this.setData({ selectedTags, tagSelected })
  },

  // 输入评价
  handleContentInput(e) {
    this.setData({ content: e.detail.value })
  },

  // 选择晒图
  handleChooseImage() {
    const remain = 6 - this.data.images.length
    if (remain <= 0) {
      fail('最多上传6张图片')
      return
    }
    wx.chooseImage({
      count: remain,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        loading('上传中')
        // mock 上传：直接使用本地临时路径
        const newImages = []
        for (const path of res.tempFilePaths) {
          const r = await upload({ tempFilePath: path })
          newImages.push(r.url || path)
        }
        hideLoading()
        this.setData({ images: [...this.data.images, ...newImages] })
      }
    })
  },

  // 删除晒图
  handleRemoveImage(e) {
    const { index } = e.currentTarget.dataset
    const images = [...this.data.images]
    images.splice(index, 1)
    this.setData({ images })
  },

  handleImgError(e) {
    const { field } = e.currentTarget.dataset
    if (field) this.setData({ [field]: '/static/images/default.png' })
  },

  // 预览晒图
  handlePreviewImage(e) {
    const { url } = e.currentTarget.dataset
    wx.previewImage({ urls: this.data.images, current: url })
  },

  // 提交评价
  async handleSubmit() {
    if (this.data.submitting) return
    if (!this.data.rating) {
      fail('请选择星级')
      return
    }
    this.setData({ submitting: true })
    loading('提交中')
    await post('/reviews/submit', {
      orderId: this.orderId,
      goodsId: this.data.goods.goodsId,
      rating: this.data.rating,
      content: this.data.content,
      images: this.data.images,
      tags: this.data.selectedTags,
      specText: this.data.goods.specText
    })
    hideLoading()
    success('评价成功 +20积分')
    setTimeout(() => {
      wx.navigateBack()
    }, 1500)
  }
})
