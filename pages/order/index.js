// pages/order/index.js
// 订单列表：状态 Tab + 卡片列表 + 分页 + 各状态操作，数据全部走 api 层（Mock）
import { request } from '../../api/http.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
import { formatPrice, formatTime } from '../../utils/format.js';
import { toast, toastSuccess, toastError, confirm } from '../../utils/toast.js';
import { syncCartBadge } from '../../utils/cart.js';

const PAGE_SIZE = 10;

// 5 个状态 Tab，status 与接口参数一一对应；空态文案按 Tab 区分
const TABS = [
  { status: 0, value: '全部', icon: '🛒', emptyText: '还没有订单，快去挑选心仪的美食吧' },
  { status: 1, value: '待付款', icon: '💰', emptyText: '还没有待付款的订单' },
  { status: 2, value: '待发货', icon: '📦', emptyText: '还没有待发货的订单' },
  { status: 3, value: '待收货', icon: '🚚', emptyText: '还没有待收货的订单' },
  { status: 5, value: '已完成', icon: '✅', emptyText: '还没有完成的订单' },
];

// WXML 不能调用函数，状态徽章配色在 JS 里映射成 class
const STATUS_CLASS = {
  1: 'st-pay',
  2: 'st-deliver',
  3: 'st-receive',
  4: 'st-receive',
  5: 'st-done',
  6: 'st-cancel',
};

// 把订单原始数据加工成可直接渲染的字段，避免在 WXML 里做计算
const decorateOrder = (order) => {
  const items = (order.items || []).map((it) => ({
    ...it,
    priceText: formatPrice(it.price),
    subtotalText: formatPrice(it.price * it.count),
  }));
  const itemCount = items.reduce((total, it) => total + (it.count || 0), 0);
  return {
    ...order,
    items,
    mainItem: items[0] || {},
    itemCount,
    statusClass: STATUS_CLASS[order.status] || 'st-cancel',
    createTimeText: formatTime(order.createTime, 'YYYY-MM-DD HH:mm'),
    payAmountText: formatPrice(order.payAmount),
  };
};

Page({
  data: {
    tabs: TABS.map((t, i) => ({ ...t, isActive: i === 0 })),
    activeIndex: 0,
    orders: [],
    count: { all: 0, pay: 0, deliver: 0, receive: 0, done: 0 },
    loading: true, // 首次/切换 Tab 时展示骨架屏
    loadingMore: false,
    noMore: false,
  },

  page: 1,
  hasShown: false,

  onLoad(options) {
    const index = this.resolveTabIndex(options);
    this.setData({ tabs: this.buildTabs(index), activeIndex: index, loading: true });
    this.loadCount();
    this.loadList(true);
  },

  onShow() {
    // 从详情/支付页返回时刷新列表与角标，保证状态与优惠实时
    syncCartBadge();
    if (this.hasShown) {
      this.loadList(true);
      this.loadCount();
    }
    this.hasShown = true;
  },

  // 外部入参 type(1~5) / status(0,1,2,3,5) 都映射到 Tab 下标
  resolveTabIndex(options = {}) {
    const { type, status } = options;
    if (status !== undefined && status !== '') {
      const byStatus = TABS.findIndex((t) => t.status === Number(status));
      if (byStatus > -1) return byStatus;
    }
    if (type !== undefined && type !== '') {
      const byType = Number(type) - 1;
      if (byType >= 0 && byType < TABS.length) return byType;
    }
    return 0;
  },

  buildTabs(activeIndex) {
    return TABS.map((t, i) => ({ ...t, isActive: i === activeIndex }));
  },

  onTabTap(e) {
    const index = Number(e.currentTarget.dataset.index);
    if (index === this.data.activeIndex) return;
    // 切换 Tab 清空列表并展示骨架屏，避免旧数据闪一下
    this.setData({ tabs: this.buildTabs(index), activeIndex: index, orders: [], noMore: false, loading: true });
    this.loadList(true);
  },

  async loadList(reset) {
    const tab = this.data.tabs[this.data.activeIndex] || TABS[0];
    if (reset) this.page = 1;
    if (!reset) this.setData({ loadingMore: true });
    try {
      const res = await request({
        url: '/orders/list',
        data: { status: tab.status, page: this.page, size: PAGE_SIZE },
      });
      const records = (res.records || []).map(decorateOrder);
      const total = res.total || 0;
      const orders = reset ? records : this.data.orders.concat(records);
      this.setData({
        orders,
        loading: false,
        loadingMore: false,
        noMore: orders.length >= total,
      });
    } catch (err) {
      this.setData({ loading: false, loadingMore: false });
      toastError((err && err.message) || '订单加载失败');
    }
  },

  async loadCount() {
    try {
      const c = await request({ url: '/orders/count' });
      this.setData({
        count: {
          all: c.all || 0,
          pay: c[1] || 0,
          deliver: c[2] || 0,
          receive: c[3] || 0,
          done: c[5] || 0,
        },
      });
    } catch (err) {
      /* 数量概览失败不影响主流程 */
    }
  },

  // 写操作后重新拉取当前 Tab 列表与数量
  refresh() {
    this.loadList(true);
    this.loadCount();
  },

  // 图片兜底：多图用 gi 定位，单图固定 gi=0
  handleImageError(e) {
    const { oi, gi } = e.currentTarget.dataset;
    this.setData({ [`orders[${oi}].items[${gi}].mainPic`]: '/static/images/default.png' });
  },

  handleDetail(e) {
    wx.navigateTo({ url: `/pages/order/detail?orderId=${e.currentTarget.dataset.id}` });
  },

  handleViewLogistics(e) {
    // 直接跳详情页即可，详情页会展示完整物流
    wx.navigateTo({ url: `/pages/order/detail?orderId=${e.currentTarget.dataset.id}` });
  },

  handlePay(e) {
    wx.navigateTo({ url: `/pages/pay/index?orderId=${e.currentTarget.dataset.id}` });
  },

  handleReview(e) {
    wx.navigateTo({ url: `/pages/order/review?orderId=${e.currentTarget.dataset.id}` });
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  async handleCancel(e) {
    const id = e.currentTarget.dataset.id;
    const confirmed = await confirm({ content: '确定要取消该订单吗？' });
    if (!confirmed) return;
    try {
      await request({ url: '/orders/cancel', method: 'POST', data: { orderId: id } });
      toastSuccess('订单已取消');
      this.refresh();
    } catch (err) {
      toastError((err && err.message) || '取消失败');
    }
  },

  async handleConfirm(e) {
    const id = e.currentTarget.dataset.id;
    const confirmed = await confirm({ content: '请确认已收到商品，确认后订单完成' });
    if (!confirmed) return;
    try {
      await request({ url: '/orders/confirm', method: 'POST', data: { orderId: id } });
      toastSuccess('确认收货成功');
      this.refresh();
    } catch (err) {
      toastError((err && err.message) || '操作失败');
    }
  },

  async handleUrge(e) {
    const id = e.currentTarget.dataset.id;
    try {
      await request({ url: '/orders/urge', method: 'POST', data: { orderId: id } });
      toast('已提醒商家尽快发货');
      this.refresh();
    } catch (err) {
      toastError((err && err.message) || '催发货失败');
    }
  },

  async handleAgain(e) {
    const id = e.currentTarget.dataset.id;
    try {
      await request({ url: '/orders/again', method: 'POST', data: { orderId: id } });
      toastSuccess('已加入购物车');
      syncCartBadge();
      this.refresh();
    } catch (err) {
      toastError((err && err.message) || '操作失败');
    }
  },

  onReachBottom() {
    if (this.data.loading || this.data.loadingMore || this.data.noMore) return;
    this.page += 1;
    this.loadList(false);
  },

  async onPullDownRefresh() {
    await this.loadList(true);
    await this.loadCount();
    wx.stopPullDownRefresh();
  },
});
