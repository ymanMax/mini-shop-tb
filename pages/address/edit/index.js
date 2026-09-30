// pages/address/edit/index.js —— 新增/编辑地址
import { request } from '../../../api/http.js'
import regeneratorRuntime from '../../../lib/runtime/runtime.js'
import { toastSuccess, toastInfo } from '../../../utils/toast.js'

Page({
  data: {
    id: null,
    isEdit: false,
    form: {
      name: '',
      phone: '',
      region: [], // [province, city, district]
      detail: '',
      tag: '家',
      isDefault: false
    },
    tags: ['家', '学校', '公司', '其他'],
    regionText: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: Number(options.id), isEdit: true })
      wx.setNavigationBarTitle({ title: '编辑地址' })
      this.loadAddress(Number(options.id))
    } else {
      wx.setNavigationBarTitle({ title: '新增地址' })
    }
  },

  async loadAddress(id) {
    const list = await request({ url: '/address/list' })
    const addr = (list || []).find(a => a.id === id)
    if (addr) {
      this.setData({
        form: {
          name: addr.name,
          phone: addr.phone,
          region: [addr.province, addr.city, addr.district],
          detail: addr.detail,
          tag: addr.tag || '家',
          isDefault: !!addr.isDefault
        },
        regionText: [addr.province, addr.city, addr.district].join(' ')
      })
    }
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onRegionChange(e) {
    const region = e.detail.value
    this.setData({
      'form.region': region,
      regionText: Array.isArray(region) && region.length === 3 ? region.join(' ') : ''
    })
  },

  selectTag(e) {
    const { tag } = e.currentTarget.dataset
    this.setData({ 'form.tag': tag })
  },

  toggleDefault(e) {
    this.setData({ 'form.isDefault': e.detail.value })
  },

  async handleSave() {
    const { name, phone, region, detail, tag, isDefault } = this.data.form
    if (!name.trim()) return toastInfo('请填写收货人姓名')
    if (!/^1\d{10}$/.test(phone.trim())) return toastInfo('请填写正确的11位手机号')
    if (!region || region.length !== 3 || !region[0]) return toastInfo('请选择所在地区')
    if (!detail.trim()) return toastInfo('请填写详细地址')

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      province: region[0],
      city: region[1],
      district: region[2],
      region: region.join(' '),
      detail: detail.trim(),
      tag,
      isDefault
    }

    if (this.data.isEdit) {
      await request({ url: '/address/update', method: 'POST', data: { id: this.data.id, patch: payload } })
    } else {
      await request({ url: '/address/add', method: 'POST', data: payload })
    }
    toastSuccess(this.data.isEdit ? '地址已更新' : '地址已保存')
    setTimeout(() => wx.navigateBack(), 800)
  }
})
