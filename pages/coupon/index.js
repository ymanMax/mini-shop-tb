// pages/coupon/index.js
// 领券中心：9 张模板券卡（满减红 / 折扣橙 / 无门槛金），领取后置灰并刷新角标
import { request } from '../../api/http.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
import { toastSuccess, toastError } from '../../utils/toast.js';

// 三种券类型对应的卡片配色 class，WXML 只做展示
const TYPE_CLASS = { full: 'card-full', discount: 'card-discount', none: 'card-none' };

/**
 * 左侧面额区文案：不同券类型的「大号数字 + 单位 + 门槛」各不相同
 * 折扣券 amount 是折扣率（0.88 -> 8.8 折），满减/无门槛 amount 是元
 */
const buildFace = (tpl) => {
  if (tpl.type === 'discount') {
    const zhe = Math.round(Number(tpl.amount) * 100) / 10;
    return {
      symbol: '',
      amountMain: String(zhe),
      unitText: '折',
      subText: tpl.threshold > 0 ? `满 ${tpl.threshold} 可用` : '无门槛',
    };
  }
  return {
    symbol: '¥',
    amountMain: String(tpl.amount),
    unitText: '',
    subText: tpl.type === 'none' ? '无门槛' : `满 ${tpl.threshold} 可用`,
  };
};

const decorate = (tpl) => {
  const claimed = !!tpl.claimed;
  const soldOut = !!tpl.soldOut;
  return {
    ...tpl,
    ...buildFace(tpl),
    cardClass: TYPE_CLASS[tpl.type] || TYPE_CLASS.full,
    claimed,
    soldOut,
    disabled: claimed || soldOut,
    btnText: claimed ? '已领取' : soldOut ? '已领完' : '立即领取',
    daysText: `有效期 ${tpl.days} 天`,
  };
};

Page({
  data: {
    loading: true,
    templates: [],
    unusedCount: 0,
    empty: false,
  },

  onLoad() {
    this.loadTemplates();
  },

  onShow() {
    // 从「我的优惠券」返回时刷新未使用角标
    this.loadCount();
  },

  async loadTemplates() {
    this.setData({ loading: true });
    try {
      const list = await request({ url: '/coupon/templates' });
      const templates = (list || []).map(decorate);
      // 全部售罄或列表为空时进入空态，绝不白屏
      this.setData({
        loading: false,
        templates,
        empty: !templates.length || templates.every((t) => t.soldOut),
      });
    } catch (e) {
      this.setData({ loading: false, templates: [], empty: true });
      toastError((e && e.message) || '优惠券加载失败');
    }
  },

  async loadCount() {
    try {
      const c = await request({ url: '/coupon/count' });
      this.setData({ unusedCount: c.unused || 0 });
    } catch (e) {
      // 角标失败不影响主流程
    }
  },

  async handleClaim(e) {
    const index = Number(e.currentTarget.dataset.index);
    const tpl = this.data.templates[index];
    if (!tpl || tpl.disabled) return;
    try {
      await request({ url: '/coupon/claim', method: 'POST', data: { templateId: tpl.id } });
      toastSuccess('领取成功');
      // 单张券每人限领 1 张，领取后立即置灰并刷新未使用数量
      this.setData({
        [`templates[${index}].claimed`]: true,
        [`templates[${index}].disabled`]: true,
        [`templates[${index}].btnText`]: '已领取',
      });
      this.loadCount();
    } catch (err) {
      // 重复领取接口返回 code 400，直接把后端提示呈现给用户
      toastError((err && err.message) || '领取失败');
    }
  },

  handleGoMine() {
    wx.navigateTo({ url: '/pages/coupon/mine' });
  },
});
