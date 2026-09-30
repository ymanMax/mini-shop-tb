// pages/goods_list/index.js
// 商品列表：按分类 / 关键词筛选，支持综合、销量、价格排序与分页
import { request } from '../../api/http.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
import { formatPrice, formatSales } from '../../utils/format.js';
import { toastSuccess, toastError, vibrate } from '../../utils/toast.js';
import { syncCartBadge } from '../../utils/cart.js';

const DEFAULT_IMAGE = '/static/images/default.png';
const PAGE_SIZE = 10;

const SORTS = [
  { key: 'default', label: '综合' },
  { key: 'sales', label: '销量' },
  { key: 'price', label: '价格' },
];

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    goodsList: [],
    sorts: SORTS,
    // 当前排序：default | sales | price-asc | price-desc
    sort: 'default',
    priceAsc: true,
    categoryId: '',
    keyword: '',
    title: '商品列表',
    page: 1,
    total: 0,
    hasMore: false,
    loadingMore: false,
  },

  onLoad(options) {
    // 兼容旧参数 cid / query
    const categoryId = options.categoryId || options.cid || '';
    const keyword = options.keyword || options.query || '';
    this.setData({ categoryId, keyword, loading: true, page: 1, goodsList: [] });
    if (keyword) wx.setNavigationBarTitle({ title: `搜索：${keyword}` });
    this.getGoodsList({ reset: true });
  },

  onShow() {
    syncCartBadge();
  },

  onReachBottom() {
    if (!this.data.hasMore || this.data.loadingMore) return;
    this.getGoodsList({ reset: false });
  },

  onPullDownRefresh() {
    this.getGoodsList({ reset: true }).then(() => wx.stopPullDownRefresh());
  },

  async getGoodsList({ reset = false } = {}) {
    const page = reset ? 1 : this.data.page + 1;
    this.setData(reset ? { loading: true } : { loadingMore: true });
    try {
      const res = await request({
        url: '/goods/search',
        data: {
          categoryId: this.data.categoryId,
          keyword: this.data.keyword,
          sort: this.data.sort,
          page,
          size: PAGE_SIZE,
        },
      });
      const records = (res.records || []).map((g) => ({
        ...g,
        priceText: formatPrice(g.price),
        originalPriceText: formatPrice(g.originalPrice),
        salesText: formatSales(g.sales),
      }));
      const goodsList = reset ? records : this.data.goodsList.concat(records);
      this.setData({
        loading: false,
        loadingMore: false,
        goodsList,
        page,
        total: res.total || 0,
        hasMore: goodsList.length < (res.total || 0),
      });
    } catch (err) {
      this.setData({ loading: false, loadingMore: false });
      toastError((err && err.message) || '商品加载失败');
    }
  },

  // ---------------------------------------------------------------- 排序
  handleSort(e) {
    const { key } = e.currentTarget.dataset;
    let sort = key;
    let priceAsc = this.data.priceAsc;
    if (key === 'price') {
      // 再次点击价格在升降序之间切换
      priceAsc = this.data.sort === 'price-asc' ? false : this.data.sort === 'price-desc' ? true : true;
      sort = priceAsc ? 'price-asc' : 'price-desc';
    }
    if (sort === this.data.sort) return;
    vibrate();
    this.setData({ sort, priceAsc, goodsList: [], page: 1 }, () => this.getGoodsList({ reset: true }));
  },

  // ---------------------------------------------------------------- 加购
  async handleAddCart(e) {
    const { index } = e.currentTarget.dataset;
    const item = this.data.goodsList[index];
    vibrate();
    try {
      await request({
        url: '/cart/add',
        method: 'POST',
        data: {
          goodsId: item.id,
          name: item.name,
          mainPic: item.mainPic,
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

  handleGoGoods(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` });
  },

  handleImageError(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`goodsList[${index}].mainPic`]: DEFAULT_IMAGE });
  },
});
