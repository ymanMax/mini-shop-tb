// pages/message/index.js
// 消息通知中心：类型 Tab 过滤 + 上拉分页 + 未读标记 + 模拟推送，数据全部走 api 层（Mock）
import { request } from '../../api/http.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
import { fromNow } from '../../utils/format.js';
import { toast, toastSuccess, toastError } from '../../utils/toast.js';
import { syncMessageBadge } from '../../utils/message.js';

const PAGE_SIZE = 10;

// Tab 顺序与需求一致：全部 / 订单 / 促销 / 系统，type 与接口参数一一对应
const TABS = [
  { type: 0, value: '全部', icon: '📭', emptyText: '暂无消息，新的通知会出现在这里' },
  { type: 2, value: '订单', icon: '📦', emptyText: '暂无订单消息，下单后物流动态会提醒你' },
  { type: 3, value: '促销', icon: '🎁', emptyText: '暂无促销消息，优惠活动会第一时间通知你' },
  { type: 1, value: '系统', icon: '⚙️', emptyText: '暂无系统消息' },
];

// 类型图标与淡色圆底在 JS 里映射成 class，WXML 不能调用函数
const TYPE_META = {
  1: { icon: '⚙️', cls: 'type-system' },
  2: { icon: '📦', cls: 'type-order' },
  3: { icon: '🎁', cls: 'type-promo' },
};

// 把消息加工成可直接渲染的字段（相对时间必须 JS 预算，WXML 不能调函数）
const decorateMessage = (msg) => {
  const meta = TYPE_META[msg.type] || TYPE_META[1];
  return {
    ...msg,
    icon: meta.icon,
    typeClass: meta.cls,
    timeText: fromNow(msg.createTime),
    expanded: false, // relatedType === 'none' 时点击就地展开
    isNew: false, // 模拟推送插入时标记，用于淡入动画
  };
};

Page({
  data: {
    tabs: TABS.map((t, i) => ({ ...t, isActive: i === 0 })),
    activeIndex: 0,
    activeType: 0,
    list: [],
    loading: true, // 首次/切换 Tab 展示骨架屏
    loadingMore: false,
    noMore: false,
    unreadTotal: 0,
    unreadByType: { 1: 0, 2: 0, 3: 0 },
    canReadAll: false, // 当前 Tab 是否还有未读，控制「全部已读」置灰
    readAllLoading: false,
  },

  page: 1,
  hasShown: false,
  pushTimer: null, // 延迟推送定时器，onUnload 必须清理

  onLoad() {
    this.loadUnread();
    this.loadList(true);
    // 模拟进入消息中心 3 秒后收到一条促销推送（每次进入都会推一条，符合预期）
    this.pushTimer = setTimeout(() => {
      this.pushTimer = null;
      this.mockPush();
    }, 3000);
  },

  onShow() {
    syncMessageBadge();
    if (this.hasShown) {
      // 从跳转页返回时刷新列表与未读数，保证已读状态一致
      this.loadUnread();
      this.loadList(true);
    }
    this.hasShown = true;
  },

  onUnload() {
    // 离开页面必须清掉定时器，避免在别的页面弹出推送
    if (this.pushTimer) {
      clearTimeout(this.pushTimer);
      this.pushTimer = null;
    }
  },

  currentTab() {
    return this.data.tabs[this.data.activeIndex] || TABS[0];
  },

  /** 本地计算「全部已读」按钮是否可用 */
  computeCanReadAll(index, unreadTotal, unreadByType) {
    const type = (TABS[index] || TABS[0]).type;
    if (type === 0) return unreadTotal > 0;
    return (unreadByType[type] || 0) > 0;
  },

  buildTabs(activeIndex) {
    return TABS.map((t, i) => ({ ...t, isActive: i === activeIndex }));
  },

  onTabTap(e) {
    const index = Number(e.currentTarget.dataset.index);
    if (index === this.data.activeIndex) return;
    const activeType = TABS[index].type;
    this.setData({
      tabs: this.buildTabs(index),
      activeIndex: index,
      activeType,
      list: [],
      noMore: false,
      loading: true,
      canReadAll: this.computeCanReadAll(index, this.data.unreadTotal, this.data.unreadByType),
    });
    this.loadList(true);
  },

  async loadList(reset) {
    const tab = this.currentTab();
    if (reset) this.page = 1;
    if (!reset) this.setData({ loadingMore: true });
    try {
      const res = await request({
        url: '/messages',
        data: { type: tab.type, page: this.page, size: PAGE_SIZE },
      });
      const records = (res.records || []).map(decorateMessage);
      const total = res.total || 0;
      const list = reset ? records : this.data.list.concat(records);
      this.setData({
        list,
        loading: false,
        loadingMore: false,
        noMore: list.length >= total,
      });
      // 拉取消息时券临期可能补一条未读，同步一次未读概览
      this.loadUnread();
    } catch (err) {
      this.setData({ loading: false, loadingMore: false });
      if (reset) this.setData({ list: [], noMore: true });
      toastError((err && err.message) || '消息加载失败');
    }
  },

  /** 拉取未读总数与分类型未读数，用于顶部提示与按钮置灰 */
  async loadUnread() {
    try {
      const res = await request({ url: '/messages/unreadCount' });
      const byType = res.byType || {};
      const unreadTotal = res.count || 0;
      const unreadByType = { 1: byType[1] || 0, 2: byType[2] || 0, 3: byType[3] || 0 };
      this.setData({
        unreadTotal,
        unreadByType,
        canReadAll: this.computeCanReadAll(this.data.activeIndex, unreadTotal, unreadByType),
      });
    } catch (err) {
      /* 未读数失败不阻塞主流程 */
    }
  },

  /** 乐观更新未读数（标记已读后立即反馈，随后由接口校准） */
  applyUnreadDelta(type, delta) {
    const unreadByType = { ...this.data.unreadByType };
    if (unreadByType[type] !== undefined) {
      unreadByType[type] = Math.max(0, unreadByType[type] + delta);
    }
    const unreadTotal = Math.max(0, this.data.unreadTotal + delta);
    this.setData({
      unreadTotal,
      unreadByType,
      canReadAll: this.computeCanReadAll(this.data.activeIndex, unreadTotal, unreadByType),
    });
  },

  /** 点击消息：先标记已读并立即置灰红点，再按 relatedType 处理 */
  onMsgTap(e) {
    const index = Number(e.currentTarget.dataset.index);
    const msg = this.data.list[index];
    if (!msg) return;

    if (!msg.isRead) this.markRead(msg, index);

    if (msg.relatedType === 'none') {
      // 就地展开/收起全文
      this.setData({ [`list[${index}].expanded`]: !msg.expanded });
      return;
    }
    this.navigateByRelated(msg);
  },

  /** 标记单条已读：状态立即更新，不等接口返回 */
  markRead(msg, index) {
    this.setData({ [`list[${index}].isRead`]: true });
    this.applyUnreadDelta(msg.type, -1);
    request({ url: '/messages/read', method: 'POST', data: { id: msg.id } })
      .then(() => syncMessageBadge())
      .catch(() => syncMessageBadge());
  },

  /** 按 relatedType 跳转（冻结路径） */
  navigateByRelated(msg) {
    const { relatedType, relatedId } = msg;
    switch (relatedType) {
      case 'order':
        if (relatedId) wx.navigateTo({ url: `/pages/order/detail?orderId=${relatedId}` });
        else wx.navigateTo({ url: '/pages/order/index?type=1' });
        break;
      case 'coupon':
        wx.navigateTo({ url: '/pages/coupon/mine' });
        break;
      case 'seckill':
        wx.switchTab({ url: '/pages/index/index' });
        break;
      case 'goods':
        if (relatedId) wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${relatedId}` });
        else wx.switchTab({ url: '/pages/index/index' });
        break;
      case 'points':
        wx.navigateTo({ url: '/pages/points/index' });
        break;
      case 'checkin':
        wx.navigateTo({ url: '/pages/checkin/index' });
        break;
      default:
        break;
    }
  },

  /** 全部已读：按当前 Tab 的 type 标记，成功后清空可见红点并刷新角标 */
  async handleReadAll() {
    if (!this.data.canReadAll || this.data.readAllLoading) return;
    const type = this.data.activeType;
    this.setData({ readAllLoading: true });
    try {
      await request({ url: '/messages/readAll', method: 'POST', data: { type } });
      const list = this.data.list.map((m) => (m.isRead ? m : { ...m, isRead: true }));
      const unreadByType = { ...this.data.unreadByType };
      let unreadTotal;
      if (type === 0) {
        unreadByType[1] = 0;
        unreadByType[2] = 0;
        unreadByType[3] = 0;
        unreadTotal = 0;
      } else {
        const dec = unreadByType[type] || 0;
        unreadByType[type] = 0;
        unreadTotal = Math.max(0, this.data.unreadTotal - dec);
      }
      this.setData({
        list,
        unreadTotal,
        unreadByType,
        canReadAll: false,
      });
      toastSuccess('已全部标为已读');
      syncMessageBadge();
    } catch (err) {
      toastError((err && err.message) || '操作失败');
    } finally {
      this.setData({ readAllLoading: false });
    }
  },

  /** 模拟推送：成功后仅在「全部 / 促销」Tab 插入列表顶部并淡入 */
  async mockPush() {
    try {
      const res = await request({ url: '/messages/push', method: 'POST', data: { type: 3 } });
      const msg = decorateMessage(res.message);
      toast('收到一条新消息');
      syncMessageBadge();
      this.loadUnread();

      const activeType = this.data.activeType;
      if (activeType !== 0 && activeType !== 3) return;
      if (activeType === 3 && msg.type !== 3) return;

      msg.isNew = true;
      this.setData({ list: [msg, ...this.data.list] });
      // 动画播放完清除标记，避免后续重渲染重复播放
      const newId = msg.id;
      setTimeout(() => {
        const list = this.data.list.map((m) => (m.id === newId ? { ...m, isNew: false } : m));
        this.setData({ list });
      }, 800);
    } catch (err) {
      /* 推送失败静默处理，不打扰用户 */
    }
  },

  goHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  onReachBottom() {
    if (this.data.loading || this.data.loadingMore || this.data.noMore) return;
    this.page += 1;
    this.loadList(false);
  },
});
