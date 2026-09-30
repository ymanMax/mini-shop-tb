// pages/order/review.js
import { request } from '../../api/http.js'
import { toast } from '../../utils/toast.js'

const TAGS = ['新鲜美味', '分量足', '包装好', '物流快', '性价比高', '口感好']

Page({
  data: {
    orderId: null,
    order: null,
    items: [],
    activeItemIndex: 0,
    rating: 5,
    selectedTags: [],
    content: '',
    images: [],
    submitting: false,
    tagOptions: TAGS.map(t => ({ label: t, active: false })),
    starLabel: '非常满意'
  },

  // 评分文案
  starText(rating) {
    return ['', '非常差', '不满意', '一般', '满意', '非常满意'][rating] || ''
  },

  onLoad(options) {
    this.setData({ orderId: options.orderId })
    this.loadOrder()
  },

  async loadOrder() {
    const res = await request({ url: '/orders/detail', data: { id: this.data.orderId } })
    if (res.code !== 200) {
      toast.error('订单不存在')
      return
    }
    this.setData({ order: res.data, items: res.data.items || [] })
  },

  // 选择评分
  onStarTap(e) {
    const { value } = e.currentTarget.dataset
    this.setData({ rating: value, starLabel: this.starText(value) })
  },

  // 快捷标签多选
  toggleTag(e) {
    const { tag } = e.currentTarget.dataset
    const selectedTags = [...this.data.selectedTags]
    const idx = selectedTags.indexOf(tag)
    if (idx !== -1) selectedTags.splice(idx, 1)
    else selectedTags.push(tag)
    // 重建标签选项并标记选中态（WXML 不支持 indexOf 调用）
    const tagOptions = TAGS.map(t => ({ label: t, active: selectedTags.indexOf(t) !== -1 }))
    this.setData({ selectedTags, tagOptions })
  },

  // 文字输入
  onContentInput(e) {
    this.setData({ content: e.detail.value })
  },

  // 选择商品（多商品时）
  selectItem(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ activeItemIndex: index })
  },

  // 晒图上传
  chooseImage() {
    const remain = 6 - this.data.images.length
    if (remain <= 0) {
      toast.info('最多上传6张图片')
      return
    }
    wx.chooseImage({
      count: remain,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // mock 上传：直接使用本地临时路径
        const images = [...this.data.images, ...res.tempFilePaths]
        this.setData({ images })
      }
    })
  },

  removeImage(e) {
    const { index } = e.currentTarget.dataset
    const images = [...this.data.images]
    images.splice(index, 1)
    this.setData({ images })
  },

  // 提交评价
  async submit() {
    if (this.data.submitting) return
    if (!this.data.rating) {
      toast.info('请选择星级评分')
      return
    }
    const activeItem = this.data.items[this.data.activeItemIndex]
    if (!activeItem) {
      toast.error('商品信息异常')
      return
    }
    this.setData({ submitting: true })
    toast.loading('提交中')

    // mock 上传：直接使用本地临时路径作为晒图
    const uploadedImages = this.data.images

    const res = await request({
      url: '/reviews/submit',
      method: 'POST',
      data: {
        orderId: this.data.orderId,
        goodsId: activeItem.goodsId,
        rating: this.data.rating,
        content: this.data.content,
        tags: this.data.selectedTags,
        images: uploadedImages,
        specText: activeItem.specText
      }
    })

    toast.hideLoading()
    if (res.code === 200) {
      toast.success('评价成功 +20积分')
      setTimeout(() => {
        wx.navigateBack()
      }, 1000)
    } else {
      toast.error('提交失败')
    }
    this.setData({ submitting: false })
  },

  onImgError(e) {
    const { index } = e.currentTarget.dataset
    this.setData({ [`items[${index}].mainPic`]: '/static/images/default.png' })
  }
})
