// pages/address/edit.js
import { request } from '../../api/http.js'
import { toast } from '../../utils/toast.js'

const TAG_OPTIONS = ['家', '学校', '公司', '其他']

Page({
  data: {
    id: null,
    isEdit: false,
    name: '',
    phone: '',
    region: ['河北省', '石家庄市', '长安区'],
    detail: '',
    tag: '家',
    isDefault: false,
    tagOptions: TAG_OPTIONS
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ id: options.id, isEdit: true })
      this.loadAddress(options.id)
      wx.setNavigationBarTitle({ title: '编辑地址' })
    } else {
      wx.setNavigationBarTitle({ title: '新增地址' })
    }
  },

  async loadAddress(id) {
    const res = await request({ url: '/address/list' })
    const addr = (res.data || []).find(a => a.id === id)
    if (addr) {
      this.setData({
        name: addr.name,
        phone: addr.phone,
        region: [addr.province, addr.city, addr.district],
        detail: addr.detail,
        tag: addr.tag || '家',
        isDefault: !!addr.isDefault
      })
    }
  },

  onNameInput(e) {
    this.setData({ name: e.detail.value })
  },
  onPhoneInput(e) {
    this.setData({ phone: e.detail.value })
  },
  onDetailInput(e) {
    this.setData({ detail: e.detail.value })
  },
  onRegionChange(e) {
    this.setData({ region: e.detail.value })
  },
  onTagTap(e) {
    const { tag } = e.currentTarget.dataset
    this.setData({ tag })
  },
  onDefaultChange(e) {
    this.setData({ isDefault: e.detail.value })
  },

  // 保存
  async save() {
    const { name, phone, region, detail, tag, isDefault, id, isEdit } = this.data
    if (!name.trim()) {
      toast.info('请填写收货人姓名')
      return
    }
    if (!phone.trim()) {
      toast.info('请填写手机号')
      return
    }
    if (!/^1\d{10}$/.test(phone.trim())) {
      toast.info('请输入正确的11位手机号')
      return
    }
    if (!detail.trim()) {
      toast.info('请填写详细地址')
      return
    }
    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      province: region[0],
      city: region[1],
      district: region[2],
      detail: detail.trim(),
      tag,
      isDefault
    }
    if (isEdit) payload.id = id
    const res = await request({ url: '/address/save', method: 'POST', data: payload })
    if (res.code === 200) {
      toast.success('保存成功')
      setTimeout(() => wx.navigateBack(), 800)
    } else {
      toast.error('保存失败')
    }
  }
})
