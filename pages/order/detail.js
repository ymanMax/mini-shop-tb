// pages/order/detail.js
// 订单详情：状态头部 + 物流 timeline + 地址 + 商品清单 + 金额明细 + 订单信息 + 底部操作
import { request } from '../../api/http.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
import { formatPrice, formatTime } from '../../utils/format.js';
import { toast, toastSuccess, toastError, confirm } from '../../utils/toast.js';
import { syncCartBadge } from '../../utils/cart.js';

// 各状态的大号图标与描述文案，WXML 不能调用函数，统一在 JS 里算好
const STATUS_ICON = { 1: '💰', 2: '📦', 3: '🚚', 4: '🚚', 5: '✅', 6: '❌' };
const STATUS_DESC = {
  1: '订单尚未支付，请尽快完成支付',
  2: '商家正在备货，请耐心等待发货',
  3: '您的订单正在配送中，请保持电话畅通',
  4: '包裹正在派送中，请保持电话畅通',
  5: '订单已完成，感谢您的购买',
  6: '订单已取消，期待您再次光临',
};

// 把订单原始数据加工成可直接渲染的字段
const decorateDetail = (order) => {
  const items = (order.items || []).map((it) => ({
    ...it,
    priceText: formatPrice(it.price),
    subtotalText: formatPrice(it.price * it.count),
  }));
  const itemCount = items.reduce((total, it) => total + (it.count || 0), 0);

  const rawTimeline = (order.logistics && order.logistics.timeline) || [];
  // timeline 已是倒序（最新在前），连接线颜色取决于「更旧」的那个节点是否已完成
  const timeline = rawTimeline.map((node, i) => ({
    ...node,
    timeText: node.done ? formatTime(node.time, 'YYYY-MM-DD HH:mm') : '待更新',
    lineDone: i < rawTimeline.length - 1 && rawTimeline[i + 1].done,
  }));

  return {
    ...order,
    items,
    itemCount,
    statusIcon: STATUS_ICON[order.status] || '📦',
    statusDesc: STATUS_DESC[order.status] || '',
    createTimeText: formatTime(order.createTime, 'YYYY-MM-DD HH:mm'),
    payTimeText: order.payTime ? formatTime(order.payTime, 'YYYY-MM-DD HH:mm') : '未支付',
    remarkText: order.remark || '无',
    totalAmountText: formatPrice(order.totalAmount),
    discountAmountText: formatPrice(order.discountAmount || 0),
    freightText: formatPrice(order.freight || 0),
    payAmountText: formatPrice(order.payAmount),
    logistics: { ...(order.logistics || {}), timeline },
    // 待发货及以上且未取消才展示物流
    showLogistics: order.status >= 2 && order.status !== 6 && timeline.length > 0,
    // 仅配送流程中订单展示「模拟配送进度」按钮
    canAdvance: order.status === 2 || order.status === 3 || order.status === 4,
  };
};

Page({
  data: {
    loading: true,
    loadError: false,
    order: null,
  },

  orderId: 0,
  hasShown: false,

  onLoad(options) {
    this.orderId = Number(options.orderId) || 0;
    if (!this.orderId) {
      this.setData({ loading: false, loadError: true });
      toastError('缺少订单参数');
      return;
    }
    this.loadDetail();
  },

  onShow() {
    syncCartBadge();
    // 从评价页返回后刷新，反映 isReviewed 变化
    if (this.hasShown) this.loadDetail();
    this.hasShown = true;
  },

  async loadDetail() {
    try {
      const data = await request({ url: '/orders/detail', data: { orderId: this.orderId } });
      this.setData({ order: decorateDetail(data), loading: false, loadError: false });
    } catch (err) {
      this.setData({ loading: false, loadError: true });
      toastError((err && err.message) || '订单加载失败');
    }
  },

  // 商品图兜底
  handleImageError(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`order.items[${index}].mainPic`]: '/static/images/default.png' });
  },

  handleGoods(e) {
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${e.currentTarget.dataset.id}` });
  },

  copyText(e) {
    const text = String(e.currentTarget.dataset.text || '');
    if (!text) return;
    wx.setClipboardData({
      data: text,
      success: () => toast('已复制'),
    });
  },

  handleBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/index/index' }) });
  },

  handleRetry() {
    this.setData({ loading: true, loadError: false });
    this.loadDetail();
  },

  handlePay() {
    wx.navigateTo({ url: `/pages/pay/index?orderId=${this.orderId}` });
  },

  handleReview() {
    wx.navigateTo({ url: `/pages/order/review?orderId=${this.orderId}` });
  },

  // 滚动到物流卡片（用 boundingClientRect + scrollOffset 兼容老基础库）
  handleViewLogistics() {
    wx.createSelectorQuery()
      .select('#logistics')
      .boundingClientRect((rect) => {
        if (!rect) return;
        wx.createSelectorQuery()
          .selectViewport()
          .scrollOffset((scroll) => {
            wx.pageScrollTo({ scrollTop: rect.top + scroll.scrollTop - 20, duration: 300 });
          })
          .exec();
      })
      .exec();
  },

  async handleCancel() {
    const confirmed = await confirm({ content: '确定要取消该订单吗？' });
    if (!confirmed) return;
    try {
      await request({ url: '/orders/cancel', method: 'POST', data: { orderId: this.orderId } });
      toastSuccess('订单已取消');
      this.loadDetail();
    } catch (err) {
      toastError((err && err.message) || '取消失败');
    }
  },

  async handleConfirm() {
    const confirmed = await confirm({ content: '请确认已收到商品，确认后订单完成' });
    if (!confirmed) return;
    try {
      await request({ url: '/orders/confirm', method: 'POST', data: { orderId: this.orderId } });
      toastSuccess('确认收货成功');
      this.loadDetail();
    } catch (err) {
      toastError((err && err.message) || '操作失败');
    }
  },

  async handleUrge() {
    try {
      await request({ url: '/orders/urge', method: 'POST', data: { orderId: this.orderId } });
      toast('已提醒商家尽快发货');
    } catch (err) {
      toastError((err && err.message) || '催发货失败');
    }
  },

  async handleAgain() {
    try {
      await request({ url: '/orders/again', method: 'POST', data: { orderId: this.orderId } });
      toastSuccess('已加入购物车');
      syncCartBadge();
    } catch (err) {
      toastError((err && err.message) || '操作失败');
    }
  },

  // 演示用：把订单状态往前推进一格并刷新
  async handleAdvance() {
    try {
      const data = await request({ url: '/orders/advance', method: 'POST', data: { orderId: this.orderId } });
      toast(`已推进为「${data.statusText}」`);
      this.loadDetail();
    } catch (err) {
      toastError((err && err.message) || '推进失败');
    }
  },
});
