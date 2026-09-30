// pages/address/edit.js
// 收货地址编辑页：新增 / 编辑复用，有 options.id 为编辑
import { request } from '../../api/http.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
import { toast, toastSuccess, toastError } from '../../utils/toast.js';

/** 地址标签单选项，配色与列表页保持一致 */
const TAGS = [
  { label: '家', cls: 'tag-pill--home' },
  { label: '学校', cls: 'tag-pill--school' },
  { label: '公司', cls: 'tag-pill--company' },
  { label: '其他', cls: 'tag-pill--other' },
];

Page({
  data: {
    isEdit: false,
    tags: TAGS,

    // 表单字段
    userName: '',
    telNumber: '',
    region: [], // [省, 市, 区]
    regionText: '', // 展示用，空格拼接；未选为空串
    detailInfo: '',
    tag: '家',
    isDefault: false,

    saving: false, // 防重复提交
  },

  onLoad(options) {
    this.id = options && options.id ? Number(options.id) : 0;
    const isEdit = !!this.id;
    this.setData({ isEdit });
    wx.setNavigationBarTitle({ title: isEdit ? '编辑地址' : '新增地址' });
    if (isEdit) this.loadDetail();
  },

  /** 编辑模式：回填地址详情 */
  async loadDetail() {
    try {
      const address = await request({ url: '/address/detail', data: { id: this.id } });
      if (!address) {
        toastError('地址不存在');
        return;
      }
      const region = [address.provinceName, address.cityName, address.countyName].filter(Boolean);
      this.setData({
        userName: address.userName || '',
        telNumber: address.telNumber || '',
        region,
        regionText: region.join(' '),
        detailInfo: address.detailInfo || '',
        tag: address.tag || '家',
        isDefault: !!address.isDefault,
      });
    } catch (e) {
      toastError((e && e.message) || '地址加载失败');
    }
  },

  // ---------- 表单输入 ----------
  handleNameInput(e) {
    this.setData({ userName: e.detail.value });
  },

  handlePhoneInput(e) {
    this.setData({ telNumber: e.detail.value });
  },

  /** 三级地区选择器 */
  handleRegionChange(e) {
    const region = e.detail.value || [];
    this.setData({ region, regionText: region.filter(Boolean).join(' ') });
  },

  handleDetailInput(e) {
    this.setData({ detailInfo: e.detail.value });
  },

  /** 标签单选 */
  handleTagSelect(e) {
    const { tag } = e.currentTarget.dataset;
    this.setData({ tag });
  },

  handleDefaultChange(e) {
    this.setData({ isDefault: !!e.detail.value });
  },

  // ---------- 提交 ----------
  /** 本地校验，返回地区对象或 null（不通过时已 toast 具体原因） */
  validate() {
    const { userName, telNumber, region, detailInfo } = this.data;
    if (!String(userName || '').trim()) {
      toast('请填写收货人姓名');
      return null;
    }
    if (!/^1[3-9]\d{9}$/.test(String(telNumber || ''))) {
      toast('请填写正确的手机号');
      return null;
    }
    if (!region || region.length < 3 || !region[0] || !region[1] || !region[2]) {
      toast('请选择所在地区');
      return null;
    }
    if (!String(detailInfo || '').trim()) {
      toast('请填写详细地址');
      return null;
    }
    return { provinceName: region[0], cityName: region[1], countyName: region[2] };
  },

  async handleSave() {
    if (this.data.saving) return;
    const region = this.validate();
    if (!region) return;

    const { userName, telNumber, detailInfo, tag, isDefault } = this.data;
    const payload = {
      userName: String(userName).trim(),
      telNumber: String(telNumber).trim(),
      provinceName: region.provinceName,
      cityName: region.cityName,
      countyName: region.countyName,
      detailInfo: String(detailInfo).trim(),
      tag,
      isDefault,
    };
    // 编辑模式带上 id，新增模式不带
    if (this.id) payload.id = this.id;

    this.setData({ saving: true });
    try {
      await request({ url: '/address/save', method: 'POST', data: payload });
      toastSuccess(this.id ? '地址已更新' : '地址已添加');
      // 延迟返回，让列表页 onShow 拉到最新数据
      setTimeout(() => wx.navigateBack(), 600);
    } catch (err) {
      // 接口同样会做校验并返回 code 400，这里透出后端提示
      toastError((err && err.message) || '保存失败');
      this.setData({ saving: false });
    }
  },
});
