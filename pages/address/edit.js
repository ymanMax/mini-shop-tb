// pages/address/edit.js —— 新增/编辑地址
import { get, post } from '../../api/http.js'
import { success, fail, loading, hideLoading } from '../../utils/toast.js'

Page({
  data: {
    id: null,
    name: '',
    phone: '',
    region: '',
    detail: '',
    tag: '家',
    isDefault: false,
    tags: ['家', '学校', '公司', '其他'],
    regionArray: []
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id })
      wx.setNavigationBarTitle({ title: '编辑地址' })
      this.loadAddress(options.id)
    } else {
      wx.setNavigationBarTitle({ title: '新增地址' })
    }
  },

  async loadAddress(id) {
    const list = await get('/user/address')
    const addr = list.find(a => a.id === id)
    if (addr) {
      this.setData({
        name: addr.name,
        phone: addr.phone,
        region: addr.region,
        detail: addr.detail,
        tag: addr.tag || '家',
        isDefault: addr.isDefault
      })
    }
  },

  handleNameInput(e) {
    this.setData({ name: e.detail.value })
  },

  handlePhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },

  handleDetailInput(e) {
    this.setData({ detail: e.detail.value })
  },

  handleRegionChange(e) {
    // picker mode="region" 返回省市区数组
    this.setData({ region: e.detail.value.join(' ') })
  },

  handleTagSelect(e) {
    const { tag } = e.currentTarget.dataset
    this.setData({ tag })
  },

  handleDefaultChange(e) {
    this.setData({ isDefault: e.detail.value })
  },

  async handleSave() {
    const { name, phone, region, detail, tag, isDefault, id } = this.data
    if (!name.trim()) {
      fail('请输入收货人姓名')
      return
    }
    if (!/^1\d{10}$/.test(phone.trim())) {
      fail('请输入正确的11位手机号')
      return
    }
    if (!region) {
      fail('请选择所在地区')
      return
    }
    if (!detail.trim()) {
      fail('请输入详细地址')
      return
    }

    loading('保存中')
    await post('/user/address/save', {
      id,
      name: name.trim(),
      phone: phone.trim(),
      region,
      detail: detail.trim(),
      tag,
      isDefault
    })
    hideLoading()
    success('保存成功')
    setTimeout(() => wx.navigateBack(), 1000)
  }
})
