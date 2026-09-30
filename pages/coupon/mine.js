// pages/coupon/mine.js
// 我的优惠券：未使用 / 已使用 / 已过期 三个 Tab（吸顶 + 数量），临期券红色倒计时
import { request } from '../../api/http.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
import { toastError } from '../../utils/toast.js';

// 三个状态 Tab，status 与接口参数一一对应；空态文案按 Tab 区分
const TABS = [
  { status: 'unused', value: '未使用', emptyText: '还没有可用的优惠券' },
  { status: 'used', value: '已使用', emptyText: '还没有使用过优惠券' },
  { status: 'expired', value: '已过期', emptyText: '没有已过期的优惠券' },
];

const TYPE_CLASS = { full: 'card-full', discount: 'card-discount', none: 'card-none' };

/** 左侧面额区文案：与领券中心保持同一套映射规则 */
const buildFace = (c) => {
  if (c.type === 'discount') {
    const zhe = Math.round(Number(c.amount) * 100) / 10;
    return {
      symbol: '',
      amountMain: String(zhe),
      unitText: '折',
      subText: c.threshold > 0 ? `满 ${c.threshold} 可用` : '无门槛',
    };
  }
  return {
    symbol: '¥',
    amountMain: String(c.amount),
    unitText: '',
    subText: c.type === 'none' ? '无门槛' : `满 ${c.threshold} 可用`,
  };
};

const decorate = (c) => {
  const used = c.status === 'used';
  const expired = c.status === 'expired';
  return {
    ...c,
    ...buildFace(c),
    // 已使用 / 已过期整体置灰
    cardClass: (TYPE_CLASS[c.type] || TYPE_CLASS.full) + (used || expired ? ' is-disabled' : ''),
    // 临期（24 小时内）优先展示红色倒计时
    expiring: !!c.expiring,
    validText: c.expiring ? `仅剩 ${c.remainHours} 小时` : `有效期至 ${c.endTimeText}`,
    sealText: used ? '已使用' : expired ? '已过期' : '',
    showSeal: used || expired,
    showUse: !used && !expired,
    scopeText: c.scope,
  };
};

Page({
  data: {
    tabs: TABS.map((t, i) => ({ ...t, isActive: i === 0, count: 0 })),
    activeIndex: 0,
    coupons: [],
    loading: true,
  },

  onLoad() {
    this.loadCount();
    this.loadList();
  },

  onShow() {
    // 从领券中心返回后重新拉取，保证新领的券立即可见
    if (this.hasShown) {
      this.loadCount();
      this.loadList();
    }
    this.hasShown = true;
  },

  async loadCount() {
    try {
      const c = await request({ url: '/coupon/count' });
      const counts = { unused: c.unused || 0, used: c.used || 0, expired: c.expired || 0 };
      this.setData({
        tabs: TABS.map((t, i) => ({ ...t, isActive: i === this.data.activeIndex, count: counts[t.status] || 0 })),
      });
    } catch (e) {
      // 数量失败不影响列表主流程
    }
  },

  async loadList() {
    const tab = TABS[this.data.activeIndex] || TABS[0];
    this.setData({ loading: true, coupons: [] });
    try {
      const list = await request({ url: '/coupon/mine', data: { status: tab.status } });
      this.setData({ loading: false, coupons: (list || []).map(decorate) });
    } catch (e) {
      this.setData({ loading: false, coupons: [] });
      toastError((e && e.message) || '优惠券加载失败');
    }
  },

  onTabTap(e) {
    const index = Number(e.currentTarget.dataset.index);
    if (index === this.data.activeIndex) return;
    this.setData({
      activeIndex: index,
      tabs: TABS.map((t, i) => ({ ...t, isActive: i === index, count: this.data.tabs[i].count })),
    });
    this.loadList();
  },

  /** 去使用：优惠券为线上下单抵扣，直接回首页选购 */
  handleUse() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  handleGoCenter() {
    wx.navigateTo({ url: '/pages/coupon/index' });
  },
});
