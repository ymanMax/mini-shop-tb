// pages/search/index.js
// 搜索页：搜索历史 / 热门搜索 / 实时联想 / 结果列表（排序 + 上拉分页 + 加购）
import { request } from '../../api/http.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
import { formatPrice, formatSales } from '../../utils/format.js';
import {
  getSearchHistory, addSearchHistory, removeSearchHistory, clearSearchHistory,
} from '../../utils/history.js';
import { toast, toastSuccess, toastError, confirm, vibrate } from '../../utils/toast.js';
import { syncCartBadge } from '../../utils/cart.js';

const DEFAULT_IMAGE = '/static/images/default.png';
const PAGE_SIZE = 10;
// 联想防抖时长：太短会每敲一个字都打接口，太长又显得迟钝
const SUGGEST_DEBOUNCE = 300;

// 排序栏：价格项在升 / 降序之间切换，故只占一个按钮
const SORTS = [
  { key: 'default', label: '综合' },
  { key: 'price', label: '价格' },
  { key: 'sales', label: '销量' },
];

Page({
  /**
   * 页面的初始数据
   */
  data: {
    inpValue: '',
    // idle 空闲(历史 + 热门) | suggest 联想 | result 结果 | empty 无结果
    mode: 'idle',
    history: [],
    hotKeywords: [],
    // 联想项已预拆 nameBefore / nameMatch / nameAfter，WXML 不能调用函数
    suggests: [],
    goods: [],
    sorts: SORTS,
    // default | price-asc | price-desc | sales
    sort: 'default',
    priceAsc: true,
    loading: false,
    loadingMore: false,
    hasMore: false,
    page: 1,
    total: 0,
  },

  // 联想防抖 timer 挂在实例上，onUnload 统一清理
  timer: null,

  onLoad() {
    // 历史是纯客户端状态，直接读取 storage（首次访问由工具函数写入 8 条种子数据）
    this.setData({ history: getSearchHistory() });
    this.loadHot();
  },

  onShow() {
    // 从详情页 / 购物车返回时保持 tabBar 角标实时
    syncCartBadge();
  },

  onUnload() {
    clearTimeout(this.timer);
  },

  onReachBottom() {
    const { mode, hasMore, loading, loadingMore } = this.data;
    if (mode !== 'result' || !hasMore || loading || loadingMore) return;
    this.loadGoods({ reset: false });
  },

  // ---------------------------------------------------------------- 热门搜索
  async loadHot() {
    try {
      const list = await request({ url: '/search/hot' });
      this.setData({ hotKeywords: Array.isArray(list) ? list : [] });
    } catch (err) {
      // 热门词失败不影响历史展示，给出空态而非白屏
      this.setData({ hotKeywords: [] });
      toastError((err && err.message) || '热门搜索加载失败');
    }
  },

  // ---------------------------------------------------------------- 输入 / 联想
  handleInput(e) {
    const value = e.detail.value;
    this.setData({ inpValue: value });
    clearTimeout(this.timer);

    const kw = value.trim();
    // 输入为空时隐藏联想，回到「历史 + 热门」
    if (!kw) {
      this.setData({ mode: 'idle', suggests: [], goods: [], total: 0, hasMore: false });
      return;
    }
    this.timer = setTimeout(() => this.loadSuggest(kw), SUGGEST_DEBOUNCE);
  },

  async loadSuggest(keyword) {
    try {
      const list = await request({ url: '/goods/suggest', data: { keyword, limit: 10 } });
      // 请求返回时输入已变化，丢弃过期联想，避免覆盖新结果
      if (this.data.inpValue.trim() !== keyword) return;
      const suggests = (list || []).map((item) => {
        const name = item.name || '';
        const start = Math.max(0, item.matchStart);
        const end = Math.min(name.length, item.matchEnd);
        return {
          ...item,
          nameBefore: name.slice(0, start),
          nameMatch: name.slice(start, end),
          nameAfter: name.slice(end),
          priceText: formatPrice(item.price),
        };
      });
      // 0 条联想时不展示空白块，仍展示历史 + 热门
      this.setData({ suggests, mode: suggests.length ? 'suggest' : 'idle' });
    } catch (err) {
      if (this.data.inpValue.trim() !== keyword) return;
      this.setData({ suggests: [], mode: 'idle' });
    }
  },

  handleClear() {
    clearTimeout(this.timer);
    this.setData({ inpValue: '', mode: 'idle', suggests: [], goods: [], total: 0, hasMore: false });
  },

  handleCancel() {
    wx.navigateBack({ delta: 1, fail: () => wx.switchTab({ url: '/pages/index/index' }) });
  },

  // 联想面板顶部「搜索「xx」」按钮
  handleSearch() {
    this.doSearch(this.data.inpValue);
  },

  // 键盘「搜索」（confirm-type="search"）
  handleConfirm(e) {
    this.doSearch(e.detail.value);
  },

  // 点击热词 / 历史词，直接进入结果态
  handleKeywordTap(e) {
    this.doSearch(e.currentTarget.dataset.keyword);
  },

  // ---------------------------------------------------------------- 搜索结果
  async doSearch(keyword) {
    const kw = String(keyword || '').trim();
    if (!kw) return;
    clearTimeout(this.timer);
    // 每次提交都写入历史；去重 / 置顶 / 上限由工具函数保证
    this.setData({
      inpValue: kw,
      history: addSearchHistory(kw),
      sort: 'default',
      priceAsc: true,
    });
    await this.loadGoods({ reset: true, keyword: kw });
  },

  async loadGoods({ reset = false, keyword } = {}) {
    const kw = keyword !== undefined ? keyword : this.data.inpValue.trim();
    if (!kw) return;
    const page = reset ? 1 : this.data.page + 1;
    // 首屏用骨架屏，上拉加载用「加载中...」行
    this.setData({ mode: 'result', loading: reset, loadingMore: !reset });
    try {
      const res = await request({
        url: '/goods/search',
        data: { keyword: kw, sort: this.data.sort, page, size: PAGE_SIZE },
      });
      const records = (res.records || []).map((g) => ({
        ...g,
        priceText: formatPrice(g.price),
        originalPriceText: formatPrice(g.originalPrice),
        salesText: formatSales(g.sales),
      }));
      const goods = reset ? records : this.data.goods.concat(records);
      this.setData({
        mode: goods.length ? 'result' : 'empty',
        loading: false,
        loadingMore: false,
        goods,
        page,
        total: res.total || 0,
        hasMore: goods.length < (res.total || 0),
      });
    } catch (err) {
      // 接口失败也必须给出空态，不能白屏
      this.setData({ mode: 'empty', loading: false, loadingMore: false, goods: [], total: 0, hasMore: false });
      toastError((err && err.message) || '搜索失败');
    }
  },

  // ---------------------------------------------------------------- 排序
  handleSort(e) {
    const { key } = e.currentTarget.dataset;
    let sort = key;
    let priceAsc = this.data.priceAsc;
    if (key === 'price') {
      // 再次点击价格在升降序之间切换
      priceAsc = this.data.sort !== 'price-asc';
      sort = priceAsc ? 'price-asc' : 'price-desc';
    }
    if (sort === this.data.sort) return;
    vibrate();
    this.setData({ sort, priceAsc, goods: [], page: 1, total: 0, hasMore: false });
    this.loadGoods({ reset: true });
  },

  // ---------------------------------------------------------------- 加购
  async handleAddCart(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.goods[index];
    if (!item) return;
    vibrate();
    try {
      await request({
        url: '/cart/add',
        method: 'POST',
        data: {
          goodsId: item.id,
          name: item.name,
          mainPic: item.mainPic,
          // 有规格取首个规格值，无规格给出统一默认文案
          specText: item.specs && item.specs.length ? item.specs[0].values[0].label : `默认规格 · 1${item.unit}`,
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

  // ---------------------------------------------------------------- 搜索历史
  handleRemoveHistory(e) {
    const { keyword } = e.currentTarget.dataset;
    this.setData({ history: removeSearchHistory(keyword) });
    toast('已删除该条历史');
  },

  async handleClearHistory() {
    const sure = await confirm({ content: '确定要清空搜索历史吗？' });
    if (!sure) return;
    this.setData({ history: clearSearchHistory() });
    toast('已清空搜索历史');
  },

  // ---------------------------------------------------------------- 跳转 / 兜底
  handleGoGoods(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` });
  },

  handleImageError(e) {
    const { index, source } = e.currentTarget.dataset;
    this.setData({ [`${source}[${index}].mainPic`]: DEFAULT_IMAGE });
  },
});
