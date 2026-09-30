// pages/order/review/index.js —— 订单评价
import { request } from '../../../api/http.js'
import common from '../../../behaviors/common.js'
import { toastSuccess, toastInfo, confirm } from '../../../utils/toast.js'
import regeneratorRuntime from '../../../lib/runtime/runtime.js'

const QUICK_TAGS = ['新鲜美味', '分量足', '包装好', '物流快', '性价比高', '口感好']

Page({
  behaviors: [common],
  data: {
    orderNo: '',
    order: null,
    // 每个商品的评价表单
    forms: [],
    quickTags: QUICK_TAGS,
    maxLen: 100,
    submitting: false
  },

  onLoad(options) {
    this.setData({ orderNo: options.orderNo })
    this.loadOrder()
  },

  async loadOrder() {
    const res = await request({ url: '/orders/detail', data: { orderNo: this.data.orderNo } })
    const forms = res.items.map(it => ({
      goodsId: it.goodsId,
      name: it.name,
      mainPic: it.mainPic,
      specText: it.specText,
      price: it.price,
      count: it.count,
      rating: 5,
      content: '',
      tags: [],
      tagMap: {},  // {标签: true} 供 WXML 判断选中态
      images: []
    }))
    this.setData({ order: res, forms })
  },

  // 星级评分（每个商品）
  setRating(e) {
    const { index, star } = e.currentTarget.dataset
    const forms = this.data.forms.map((f, i) => i === index ? { ...f, rating: star } : f)
    this.setData({ forms })
  },

  // 快捷标签多选
  toggleTag(e) {
    const { index, tag } = e.currentTarget.dataset
    const forms = this.data.forms.map((f, i) => {
      if (i !== index) return f
      const has = f.tags.indexOf(tag) !== -1
      const tags = has ? f.tags.filter(t => t !== tag) : [...f.tags, tag]
      const tagMap = { ...f.tagMap }
      if (has) delete tagMap[tag]
      else tagMap[tag] = true
      return { ...f, tags, tagMap }
    })
    this.setData({ forms })
  },


  // 文字输入
  onContent(e) {
    const { index } = e.currentTarget.dataset
    const forms = this.data.forms.map((f, i) => i === index ? { ...f, content: e.detail.value } : f)
    this.setData({ forms })
  },

  // 晒图上传
  chooseImg(e) {
    const { index } = e.currentTarget.dataset
    const cur = this.data.forms[index].images
    if (cur.length >= 6) {
      toastInfo('最多上传6张图片')
      return
    }
    wx.chooseImage({
      count: 6 - cur.length,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const paths = res.tempFilePaths
        // mock 上传：直接使用本地临时路径
        const uploaded = []
        for (const p of paths) {
          const r = await request({ url: '/upload', method: 'POST', data: { path: p } })
          uploaded.push(r.url || p)
        }
        const forms = this.data.forms.map((f, i) => i === index ? { ...f, images: [...f.images, ...uploaded] } : f)
        this.setData({ forms })
      }
    })
  },

  removeImg(e) {
    const { index, imgidx } = e.currentTarget.dataset
    const forms = this.data.forms.map((f, i) => {
      if (i !== index) return f
      const images = f.images.filter((_, k) => k !== imgidx)
      return { ...f, images }
    })
    this.setData({ forms })
  },

  previewImg(e) {
    const { index, imgidx } = e.currentTarget.dataset
    const urls = this.data.forms[index].images
    wx.previewImage({ urls, current: urls[imgidx] })
  },

  // 提交
  async submit() {
    // 验证：至少星级（默认5）+ 文字
    for (const f of this.data.forms) {
      if (!f.content || !f.content.trim()) {
        toastInfo('请填写评价内容')
        return
      }
      if (f.rating < 1) {
        toastInfo('请选择星级评分')
        return
      }
    }
    this.setData({ submitting: true })
    wx.showLoading({ title: '提交中', mask: true })
    const payload = {
      orderId: this.data.order.id,
      items: this.data.forms.map(f => ({
        goodsId: f.goodsId,
        rating: f.rating,
        content: f.content,
        tags: f.tags,
        specText: f.specText,
        images: f.images
      }))
    }
    await request({ url: '/reviews/submit', method: 'POST', data: payload })
    wx.hideLoading()
    this.setData({ submitting: false })
    wx.showToast({ title: '评价成功 +20积分', icon: 'success', mask: true })
    setTimeout(() => wx.navigateBack(), 1200)
  }
})
