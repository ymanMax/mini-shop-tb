// pages/points/index.js
// 积分中心：积分概览 + 明细分页 + 兑换专区，数据全部走 api 层（Mock）
import { request } from '../../api/http.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
import { fromNow } from '../../utils/format.js';
import { toastError, toastSuccess, toast, confirm, vibrate } from '../../utils/toast.js';

/** 明细每页条数 */
const PAGE_SIZE = 10;

/** 来源 -> 图标，接口只给来源文案，图标在页面侧映射，避免 WXML 里做判断 */
const SOURCE_ICON = {
  购物: '🛍️',
  签到: '📅',
  评价: '⭐',
  兑换: '🎁',
};

/** 把接口概览加工成可直接渲染的字段（大字积分、连续天数等） */
const decorateInfo = (info = {}) => ({
  points: Number(info.points) || 0,
  pointsText: String(Number(info.points) || 0),
  totalEarned: Number(info.totalEarned) || 0,
  totalSpent: Number(info.totalSpent) || 0,
  recordCount: Number(info.recordCount) || 0,
  consecutiveDays: Number(info.consecutiveDays) || 0,
  todaySigned: !!info.todaySigned,
});

/** 明细项：拆分图标、正负号与相对时间，绿加红减由 isEarn 决定 */
const decorateRecord = (r) => {
  const points = Number(r.points) || 0;
  return {
    id: r.id,
    icon: SOURCE_ICON[r.source] || '🎁',
    title: r.title,
    source: r.source,
    timeText: fromNow(r.createTime),
    pointsText: points > 0 ? `+${points}` : `${points}`,
    isEarn: points > 0,
  };
};

/** 兑换项：积分不足时按钮置灰并改文案 */
const decorateGoods = (g) => ({
  ...g,
  canExchange: !!g.affordable,
  buttonText: g.affordable ? '兑换' : '积分不够',
});

Page({
  data: {
    loading: true,
    error: false,
    info: decorateInfo(),
    // 明细
    records: [],
    recordTotal: 0,
    page: 1,
    hasMore: true,
    loadingMore: false,
    // 兑换专区
    goods: [],
  },

  onLoad() {
    this.loadAll();
  },

  onShow() {
    // 从签到页返回时今日签到态 / 连续天数可能已变化，重新拉一次概览
    if (this.loaded) this.refreshInfo();
  },

  onPullDownRefresh() {
    this.loadAll().then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    this.loadRecords(false);
  },

  // ---------------------------------------------------------------- 数据加载
  /** 首屏：概览 + 兑换专区并行拉取，再加载明细首页 */
  async loadAll() {
    this.setData({ loading: true, error: false, records: [], page: 1, hasMore: true });
    try {
      const [info, goods] = await Promise.all([
        request({ url: '/points/info' }),
        request({ url: '/points/goods' }),
      ]);
      this.loaded = true;
      this.setData({
        loading: false,
        info: decorateInfo(info),
        goods: (goods || []).map(decorateGoods),
      });
      await this.loadRecords(true);
    } catch (err) {
      this.setData({ loading: false, error: true });
      toastError((err && err.message) || '积分数据加载失败');
    }
  },

  /** 只刷新概览（兑换 / 签到返回后调用） */
  async refreshInfo() {
    try {
      const info = await request({ url: '/points/info' });
      this.setData({ info: decorateInfo(info) });
    } catch (err) {
      /* 静默失败：概览刷新失败不打断主流程 */
    }
  },

  /** 明细分页：reset 为 true 表示回到第一页 */
  async loadRecords(reset) {
    if (this.data.loadingMore) return;
    if (!reset && !this.data.hasMore) return;
    const page = reset ? 1 : this.data.page + 1;
    this.setData({ loadingMore: true });
    try {
      const res = await request({ url: '/points/records', data: { page, size: PAGE_SIZE } });
      const list = (res.records || []).map(decorateRecord);
      const records = reset ? list : this.data.records.concat(list);
      this.setData({
        records,
        page,
        recordTotal: res.total || 0,
        hasMore: records.length < (res.total || 0),
        loadingMore: false,
      });
    } catch (err) {
      this.setData({ loadingMore: false });
      toastError((err && err.message) || '积分明细加载失败');
    }
  },

  // ---------------------------------------------------------------- 交互
  /** 去签到页 */
  handleGoCheckin() {
    wx.navigateTo({ url: '/pages/checkin/index' });
  },

  /** 兑换：二次确认 -> 扣分 -> 刷新概览 / 明细 / 专区可兑状态 */
  async handleExchange(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.goods.filter((g) => g.id === id)[0];
    if (!item) return;
    if (!item.canExchange) {
      // 按钮虽然置灰，但仍然要给出明确原因，避免「点了没反应」
      const lack = item.points - ((this.data.info && this.data.info.points) || 0);
      toast(`还差 ${lack > 0 ? lack : item.points} 积分，再攒攒吧`);
      return;
    }

    const ok = await confirm({ content: `确定使用 ${item.points} 积分兑换「${item.name}」吗？` });
    if (!ok) return;

    vibrate();
    try {
      const data = await request({ url: '/points/exchange', method: 'POST', data: { id } });
      // request() 只解出 data，接口 msg 在此按同一文案还原：券到账时额外提示
      const hasCoupon = !!(data && data.coupon);
      toastSuccess(hasCoupon ? '兑换成功，券已到账' : `兑换成功，已扣除 ${item.points} 积分`);
      await Promise.all([this.refreshInfo(), this.loadGoods()]);
      this.loadRecords(true);
    } catch (err) {
      // 积分不足等业务错误（code 400）统一走这里
      toastError((err && err.message) || '兑换失败');
    }
  },

  /** 兑换后重新拉专区，刷新每项的 affordable */
  async loadGoods() {
    try {
      const goods = await request({ url: '/points/goods' });
      this.setData({ goods: (goods || []).map(decorateGoods) });
    } catch (err) {
      /* 静默失败 */
    }
  },

  /** 骨架屏失败后的重试 */
  handleRetry() {
    this.loadAll();
  },
});
