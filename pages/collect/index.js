// pages/collect/index.js
// 商品收藏：全部 / 正在热卖 / 即将上线三个 Tab，支持左滑取消收藏
import { request } from '../../api/http.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
import { formatPrice, formatSales } from '../../utils/format.js';
import { toast, toastSuccess, toastError, confirm, vibrate } from '../../utils/toast.js';
import { syncCartBadge } from '../../utils/cart.js';

const DEFAULT_IMAGE = '/static/images/default.png';

/** 左滑露出的删除按钮宽度（rpx） */
const SLIDE_WIDTH = 140;
/** 触发吸附到展开态的位移阈值 */
const SLIDE_THRESHOLD = 60;

const TABS = [
  { key: 'all', label: '全部' },
  { key: 'hot', label: '正在热卖' },
  { key: 'soon', label: '即将上线' },
];

/** 拼出加购用的规格文案，与商品详情页的默认规格保持一致 */
const buildSpecText = (item) => {
  if (item.specs && item.specs.length) {
    return item.specs.map((dim) => dim.values[0].label).join(' · ');
  }
  return `默认规格 · 1${item.unit || '份'}`;
};

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    tabs: TABS.map((t) => ({ ...t, count: 0 })),
    currentTab: 'all',
    list: [],
    // 收藏总数，供「我的」页角标与空态判断使用
    total: 0,
  },

  // 左滑手势的临时状态（不参与渲染，避免频繁 setData）
  touchStartX: 0,
  touchItemId: 0,
  touching: false,

  onShow() {
    syncCartBadge();
    this.loadCounts();
    this.loadList();
  },

  onPullDownRefresh() {
    Promise.all([this.loadCounts(), this.loadList()]).then(() => wx.stopPullDownRefresh());
  },

  // ---------------------------------------------------------------- 数据
  async loadCounts() {
    try {
      const counts = await request({ url: '/collect/count' });
      this.setData({
        tabs: TABS.map((t) => ({ ...t, count: (counts && counts[t.key]) || 0 })),
        total: (counts && counts.all) || 0,
      });
    } catch (e) {
      /* 计数失败不影响列表展示 */
    }
  },

  async loadList() {
    this.setData({ loading: true });
    try {
      const list = await request({ url: '/collect/list', data: { tab: this.data.currentTab } });
      this.setData({
        loading: false,
        list: (list || []).map((g) => this.decorate(g)),
      });
    } catch (err) {
      this.setData({ loading: false, list: [] });
      toastError((err && err.message) || '收藏加载失败');
    }
  },

  /** 补齐渲染需要的字段：价格文案、销量文案、左滑位移 */
  decorate(g) {
    const label = g.specs && g.specs.length ? g.specs[0].values[0].label : `1${g.unit}`;
    return {
      ...g,
      priceText: formatPrice(g.price),
      originalPriceText: formatPrice(g.originalPrice),
      salesText: formatSales(g.sales),
      specLabel: label,
      soldOut: g.stock === 0,
      offset: 0,
    };
  },

  // ---------------------------------------------------------------- Tab
  handleTabTap(e) {
    const { key } = e.currentTarget.dataset;
    if (key === this.data.currentTab) return;
    vibrate();
    this.setData({ currentTab: key, list: [] }, () => this.loadList());
  },

  // ---------------------------------------------------------------- 左滑
  handleTouchStart(e) {
    const { id, index } = e.currentTarget.dataset;
    this.touching = true;
    this.touchStartX = e.touches[0].clientX;
    this.touchItemId = id;
    // 滑动某一行时先收起其它已展开的行
    const list = this.data.list.map((item, i) => (i === index || item.offset === 0 ? item : { ...item, offset: 0 }));
    this.setData({ list });
  },

  handleTouchMove(e) {
    if (!this.touching) return;
    const index = this.data.list.findIndex((item) => item.id === this.touchItemId);
    if (index === -1) return;
    const delta = e.touches[0].clientX - this.touchStartX;
    const base = this.data.list[index].offset === 0 ? 0 : -SLIDE_WIDTH;
    // 只允许向左拉开，向右最多回到 0
    const offset = Math.min(0, Math.max(-SLIDE_WIDTH, base + delta));
    this.setData({ [`list[${index}].offset`]: offset });
  },

  handleTouchEnd() {
    if (!this.touching) return;
    this.touching = false;
    const index = this.data.list.findIndex((item) => item.id === this.touchItemId);
    if (index === -1) return;
    const offset = this.data.list[index].offset;
    const snapped = offset < -SLIDE_THRESHOLD ? -SLIDE_WIDTH : 0;
    this.setData({ [`list[${index}].offset`]: snapped });
  },

  /** 点击行内其它区域时收起左滑 */
  handleRowTap() {
    const list = this.data.list.map((item) => (item.offset === 0 ? item : { ...item, offset: 0 }));
    this.setData({ list });
  },

  // ---------------------------------------------------------------- 操作
  /** 左滑露出的删除按钮：取消收藏 */
  async handleRemove(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.list.find((g) => g.id === id);
    if (!item) return;
    const ok = await confirm({ content: `确定要取消收藏「${item.name}」吗？` });
    if (!ok) {
      // 取消后把滑开的那行收回去
      this.handleRowTap();
      return;
    }
    try {
      await request({ url: '/collect/remove', method: 'POST', data: { goodsId: id } });
      const list = this.data.list.filter((g) => g.id !== id);
      this.setData({ list, total: Math.max(0, this.data.total - 1) });
      toastSuccess('已取消收藏');
      this.loadCounts();
    } catch (err) {
      toastError((err && err.message) || '操作失败');
    }
  },

  /** 加入购物车 */
  async handleAddCart(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.list.find((g) => g.id === id);
    if (!item) return;
    if (item.soldOut) {
      toast('该商品暂时缺货');
      return;
    }
    vibrate();
    try {
      await request({
        url: '/cart/add',
        method: 'POST',
        data: {
          goodsId: item.id,
          name: item.name,
          mainPic: item.mainPic,
          specText: buildSpecText(item),
          price: item.price,
          count: 1,
          stock: item.stock,
          unit: item.unit,
        },
      });
      syncCartBadge();
      toastSuccess('加入购物车成功');
    } catch (err) {
      toastError((err && err.message) || '加入购物车失败');
    }
  },

  handleGoGoods(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` });
  },

  handleGoHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  handleImageError(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`list[${index}].mainPic`]: DEFAULT_IMAGE });
  },
});
