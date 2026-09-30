// pages/footprint/index.js
// 浏览足迹：按「今天 / 昨天 / 更早」分组，支持左滑单条删除与一键清空
import { request } from '../../api/http.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
import { formatPrice, formatTime } from '../../utils/format.js';
import { toast, toastSuccess, toastError, confirm, vibrate } from '../../utils/toast.js';
import { syncCartBadge } from '../../utils/cart.js';

const DEFAULT_IMAGE = '/static/images/default.png';

/** 左滑露出的删除按钮宽度（rpx） */
const SLIDE_WIDTH = 140;
/** 触发吸附到展开态的位移阈值 */
const SLIDE_THRESHOLD = 60;

const DAY = 24 * 3600 * 1000;

/** 取某个时间戳当天 0 点，用于按自然日分组 */
const startOfDay = (ts) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    // [{ key, label, items: [] }]
    groups: [],
    total: 0,
  },

  // 左滑手势的临时状态
  touchStartX: 0,
  touchKey: '',
  touching: false,

  onShow() {
    syncCartBadge();
    this.loadHistory();
  },

  onPullDownRefresh() {
    this.loadHistory().then(() => wx.stopPullDownRefresh());
  },

  // ---------------------------------------------------------------- 数据
  async loadHistory() {
    this.setData({ loading: true });
    try {
      const list = await request({ url: '/history/list' });
      const records = Array.isArray(list) ? list : [];
      this.setData({
        loading: false,
        total: records.length,
        groups: this.groupByDate(records),
      });
    } catch (err) {
      this.setData({ loading: false, groups: [], total: 0 });
      toastError((err && err.message) || '浏览足迹加载失败');
    }
  },

  /** 按今天 / 昨天 / 更早分组；接口已按时间倒序返回，组内顺序直接沿用 */
  groupByDate(records) {
    const todayStart = startOfDay(Date.now());
    const yesterdayStart = todayStart - DAY;
    const buckets = [
      { key: 'today', label: '今天', items: [] },
      { key: 'yesterday', label: '昨天', items: [] },
      { key: 'earlier', label: '更早', items: [] },
    ];

    records.forEach((item) => {
      const t = item.browseTime;
      const bucket = t >= todayStart ? buckets[0] : t >= yesterdayStart ? buckets[1] : buckets[2];
      bucket.items.push({
        ...item,
        priceText: formatPrice(item.price),
        // 「更早」组跨天，需要带上日期才能分辨
        timeText: bucket.key === 'earlier' ? formatTime(t, 'MM-DD HH:mm') : formatTime(t, 'HH:mm'),
        offset: 0,
      });
    });

    return buckets.filter((b) => b.items.length > 0);
  },

  // ---------------------------------------------------------------- 左滑
  handleTouchStart(e) {
    const { key, gi, ii } = e.currentTarget.dataset;
    this.touching = true;
    this.touchStartX = e.touches[0].clientX;
    this.touchKey = `${gi}-${ii}`;
    // 滑动某一行时先收起其它已展开的行
    this.setData({ groups: this.collapseAll(this.data.groups, this.touchKey) });
  },

  handleTouchMove(e) {
    if (!this.touching) return;
    const pos = this.findItem(this.touchKey);
    if (!pos) return;
    const delta = e.touches[0].clientX - this.touchStartX;
    const base = this.data.groups[pos.gi].items[pos.ii].offset === 0 ? 0 : -SLIDE_WIDTH;
    const offset = Math.min(0, Math.max(-SLIDE_WIDTH, base + delta));
    this.setData({ [`groups[${pos.gi}].items[${pos.ii}].offset`]: offset });
  },

  handleTouchEnd() {
    if (!this.touching) return;
    this.touching = false;
    const pos = this.findItem(this.touchKey);
    if (!pos) return;
    const offset = this.data.groups[pos.gi].items[pos.ii].offset;
    const snapped = offset < -SLIDE_THRESHOLD ? -SLIDE_WIDTH : 0;
    this.setData({ [`groups[${pos.gi}].items[${pos.ii}].offset`]: snapped });
  },

  /** 把除 keepKey 之外所有行的位移归零 */
  collapseAll(groups, keepKey) {
    return groups.map((group, gi) =>
      ({ ...group, items: group.items.map((item, ii) => (item.offset === 0 || `${gi}-${ii}` === keepKey ? item : { ...item, offset: 0 })) })
    );
  },

  /** 由 `${gi}-${ii}` 反查分组 / 下标 */
  findItem(key) {
    const [gi, ii] = String(key).split('-').map(Number);
    const group = this.data.groups[gi];
    if (!group || !group.items[ii]) return null;
    return { gi, ii };
  },

  handleRowTap() {
    this.setData({ groups: this.collapseAll(this.data.groups, '') });
  },

  // ---------------------------------------------------------------- 操作
  /** 左滑删除单条足迹 */
  async handleRemove(e) {
    const { id } = e.currentTarget.dataset;
    try {
      await request({ url: '/history/remove', method: 'POST', data: { goodsId: id } });
      // 按 goodsId 过滤而不是下标：请求期间列表可能已经变化
      const groups = this.data.groups
        .map((group) => ({ ...group, items: group.items.filter((item) => item.goodsId !== id) }))
        .filter((group) => group.items.length > 0);
      this.setData({ groups, total: Math.max(0, this.data.total - 1) });
      toastSuccess('已删除该条足迹');
    } catch (err) {
      toastError((err && err.message) || '删除失败');
    }
  },

  /** 清空全部足迹 */
  async handleClearAll() {
    if (!this.data.total) return;
    const ok = await confirm({ content: '确定要清空全部浏览足迹吗？清空后不可恢复。' });
    if (!ok) return;
    try {
      await request({ url: '/history/clear', method: 'POST' });
      this.setData({ groups: [], total: 0 });
      toastSuccess('已清空浏览足迹');
    } catch (err) {
      toastError((err && err.message) || '清空失败');
    }
  },

  async handleAddCart(e) {
    const { id } = e.currentTarget.dataset;
    // 不用 flatMap：部分低版本小程序运行时没有该方法
    let item = null;
    this.data.groups.forEach((group) => {
      const hit = group.items.filter((g) => g.goodsId === id)[0];
      if (hit) item = hit;
    });
    if (!item) return;
    vibrate();
    try {
      await request({
        url: '/cart/add',
        method: 'POST',
        data: {
          goodsId: item.goodsId,
          name: item.name,
          mainPic: item.mainPic,
          specText: `默认规格 · 1${item.unit || '份'}`,
          price: item.price,
          count: 1,
          stock: 999,
          unit: item.unit || '份',
        },
      });
      syncCartBadge();
      toastSuccess('加入购物车成功');
    } catch (err) {
      toastError((err && err.message) || '加入购物车失败');
    }
  },

  handleGoGoods(e) {
    const { goodsid } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${goodsid}` });
  },

  handleGoHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  handleImageError(e) {
    const { gi, ii } = e.currentTarget.dataset;
    this.setData({ [`groups[${gi}].items[${ii}].mainPic`]: DEFAULT_IMAGE });
  },
});
