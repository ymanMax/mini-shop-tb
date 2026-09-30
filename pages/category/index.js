// pages/category/index.js
// 商品分类页：左侧一级分类导航 + 右侧二级分类 / 排序 / 筛选 / 商品列表
import { request } from '../../api/http.js';
import { formatPrice, formatSales } from '../../utils/format.js';
import { toastError, toastSuccess, vibrate } from '../../utils/toast.js';
import { syncCartBadge } from '../../utils/cart.js';
import regeneratorRuntime from '../../lib/runtime/runtime';

/** 每页条数，与接口约定保持一致 */
const PAGE_SIZE = 10;

/** 价格区间快捷档位，min/max 用字符串方便直接绑定 input */
const PRICE_RANGES = [
  { label: '0-20', min: '0', max: '20' },
  { label: '20-50', min: '20', max: '50' },
  { label: '50-100', min: '50', max: '100' },
  { label: '100以上', min: '100', max: '' },
];

/** 二级分类的「全部」项，id 用 0 表示不过滤 */
const ALL_SUB = { id: 0, name: '全部', icon: '✨' };

/**
 * 把接口商品格式化成可直接渲染的结构
 * WXML 不支持函数调用，所有文案（价格 / 销量）必须在这里预算好
 */
const formatGoods = (g) => {
  const price = Number(g.price) || 0;
  const originalPrice = Number(g.originalPrice) || 0;
  const stock = Number(g.stock) || 0;
  return {
    id: g.id,
    name: g.name,
    mainPic: g.mainPic || '/static/images/default.png',
    price,
    priceText: formatPrice(price),
    originalPriceText: formatPrice(originalPrice),
    showOrigin: originalPrice > price,
    salesText: formatSales(g.sales),
    tags: (g.tags || []).slice(0, 2),
    unit: g.unit || '份',
    stock,
    soldOut: stock <= 0,
  };
};

Page({
  data: {
    // 一级分类（左侧导航）与当前选中项
    leftMenu: [],
    currentIndex: 0,
    currentCategory: {},
    navIntoView: '',

    // 二级分类标签栏
    subCategories: [ALL_SUB],
    currentSubId: 0,

    // 排序：default / price-asc / price-desc / sales
    activeSort: 'default',

    // 商品列表与分页状态
    goodsList: [],
    isFirstLoad: true, // 首屏骨架屏
    loadingMore: false,
    hasMore: true,
    loadError: false,
    addingId: 0, // 正在加购的商品 id，用于播放缩放动画

    // 筛选面板（draft：面板内编辑态；applied：真正生效的值）
    isFilterOpen: false,
    priceRanges: PRICE_RANGES,
    filterMin: '',
    filterMax: '',
    filterStock: false,
    activeRange: -1,
    appliedMin: '',
    appliedMax: '',
    appliedStock: false,
    filterChips: [],
  },

  onLoad(options) {
    // 一级分类只请求一次，这里做内存缓存
    this.categoriesLoaded = false;
    this.isLoadingGoods = false;
    // 分页游标，只保留页码（其余条件从 data 读取，保证 setData 后即时生效）
    this.query = { page: 1 };
    // 外部带参（非 switchTab 场景可直接传）
    this.pendingCategoryId = options && options.categoryId ? Number(options.categoryId) : 0;
    this.loadCategories();
  },

  onShow() {
    syncCartBadge();
    // switchTab 无法带参，其他页面会写入 globalData.pendingCategoryId
    const app = getApp();
    const pending = app && app.globalData && app.globalData.pendingCategoryId;
    if (pending) {
      app.globalData.pendingCategoryId = 0; // 用后即清，避免反复触发
      this.pendingCategoryId = Number(pending);
      if (this.categoriesLoaded) this.selectCategoryById(Number(pending));
    }
  },

  onPullDownRefresh() {
    this.query.page = 1;
    this.loadGoods(true).then(() => wx.stopPullDownRefresh());
  },

  onReachBottom() {
    if (!this.data.hasMore || this.isLoadingGoods) return;
    this.query.page += 1;
    this.loadGoods(false);
  },

  /** 拉取分类树并选中目标一级分类 */
  async loadCategories() {
    try {
      const list = await request({ url: '/categories' });
      const categories = list || [];
      this.categoriesLoaded = true;
      this.setData({
        leftMenu: categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon, desc: c.desc })),
      });

      let index = 0;
      if (this.pendingCategoryId) {
        const i = categories.findIndex((c) => c.id === Number(this.pendingCategoryId));
        if (i > -1) index = i;
      }
      this.categories = categories;
      this.switchCategory(index, true);
    } catch (e) {
      toastError('分类加载失败，请稍后重试');
      this.setData({ isFirstLoad: false, loadError: true });
    }
  },

  /** 按 id 选中一级分类（供 onShow 的全局参数使用） */
  selectCategoryById(id) {
    const index = (this.categories || []).findIndex((c) => c.id === Number(id));
    if (index > -1) this.switchCategory(index, true);
  },

  /**
   * 切换一级分类：重置二级分类 / 分页 / 筛选，回到顶部
   * resetFilter 为 true 时同时清空价格与库存筛选
   */
  switchCategory(index, resetFilter) {
    const category = (this.categories || [])[index];
    if (!category) return;
    const subCategories = [ALL_SUB].concat(category.children || []);
    const patch = {
      currentIndex: index,
      currentCategory: category,
      subCategories,
      currentSubId: 0,
      navIntoView: `cat-${category.id}`,
    };
    if (resetFilter) {
      patch.appliedMin = '';
      patch.appliedMax = '';
      patch.appliedStock = false;
      patch.filterChips = [];
      patch.filterMin = '';
      patch.filterMax = '';
      patch.filterStock = false;
      patch.activeRange = -1;
    }
    this.query.page = 1;
    this.setData(patch);
    wx.pageScrollTo({ scrollTop: 0, duration: 200 });
    this.loadGoods(true);
  },

  /** 左侧一级分类点击 */
  handleCategoryTap(e) {
    const index = Number(e.currentTarget.dataset.index);
    if (index === this.data.currentIndex) return;
    this.switchCategory(index, true);
  },

  /** 二级分类标签点击 */
  handleSubTap(e) {
    const id = Number(e.currentTarget.dataset.id);
    if (id === this.data.currentSubId) return;
    this.query.page = 1;
    this.setData({ currentSubId: id });
    this.loadGoods(true);
  },

  /** 排序切换：价格项在升序 / 降序之间轮换 */
  handleSortTap(e) {
    const key = e.currentTarget.dataset.key;
    let activeSort = key;
    if (key === 'price') {
      activeSort = this.data.activeSort === 'price-asc' ? 'price-desc' : 'price-asc';
    }
    if (activeSort === this.data.activeSort) return;
    this.query.page = 1;
    this.setData({ activeSort });
    this.loadGoods(true);
  },

  /** 顶部搜索栏 */
  handleSearchTap() {
    wx.navigateTo({ url: '/pages/search/index' });
  },

  // ---------------- 筛选面板 ----------------
  openFilter() {
    this.setData({ isFilterOpen: true });
  },

  closeFilter() {
    this.setData({ isFilterOpen: false });
  },

  /** 阻止面板内部点击冒泡到遮罩 */
  noop() {},

  handleRangeTap(e) {
    const index = Number(e.currentTarget.dataset.index);
    const range = PRICE_RANGES[index];
    if (this.data.activeRange === index) {
      // 再次点击取消该档位
      this.setData({ activeRange: -1, filterMin: '', filterMax: '' });
      return;
    }
    this.setData({ activeRange: index, filterMin: range.min, filterMax: range.max });
  },

  handleMinInput(e) {
    // 手动输入后与快捷档位互斥
    this.setData({ filterMin: e.detail.value, activeRange: -1 });
  },

  handleMaxInput(e) {
    this.setData({ filterMax: e.detail.value, activeRange: -1 });
  },

  handleStockChange(e) {
    this.setData({ filterStock: e.detail.value });
  },

  /** 面板内重置：仅清空编辑态，点确定后才生效 */
  resetFilterDraft() {
    this.setData({ filterMin: '', filterMax: '', filterStock: false, activeRange: -1 });
  },

  /** 确定筛选：把编辑态提交为生效值 */
  confirmFilter() {
    const min = this.data.filterMin === '' ? '' : Number(this.data.filterMin);
    const max = this.data.filterMax === '' ? '' : Number(this.data.filterMax);
    if (min !== '' && max !== '' && min > max) {
      toastError('最低价不能高于最高价');
      return;
    }
    this.applyFilter(min, max, this.data.filterStock, true);
  },

  /** 删除已应用的筛选 chip */
  handleChipRemove(e) {
    const key = e.currentTarget.dataset.key;
    if (key === 'price') {
      this.applyFilter('', '', this.data.appliedStock, false);
    } else {
      this.applyFilter(this.data.appliedMin, this.data.appliedMax, false, false);
    }
  },

  /** 统一提交筛选值，rebuild chips 并按需重新加载 */
  applyFilter(min, max, stock, reload) {
    const chips = [];
    if (min !== '' || max !== '') {
      let text = '';
      if (min !== '' && max !== '') text = `¥${min}-${max}`;
      else if (min !== '') text = `¥${min}以上`;
      else text = `¥${max}以下`;
      chips.push({ key: 'price', text });
    }
    if (stock) chips.push({ key: 'stock', text: '仅看有货' });

    this.setData({
      isFilterOpen: false,
      appliedMin: min,
      appliedMax: max,
      appliedStock: stock,
      filterMin: min === '' ? '' : String(min),
      filterMax: max === '' ? '' : String(max),
      filterStock: stock,
      filterChips: chips,
    });
    if (reload) {
      this.query.page = 1;
      this.loadGoods(true);
    }
  },

  /** 空态「清除筛选」：排序 / 筛选 / 二级分类全部复位 */
  clearAllFilter() {
    this.query.page = 1;
    this.setData({
      activeSort: 'default',
      currentSubId: 0,
      appliedMin: '',
      appliedMax: '',
      appliedStock: false,
      filterMin: '',
      filterMax: '',
      filterStock: false,
      activeRange: -1,
      filterChips: [],
    });
    this.loadGoods(true);
  },

  /** 加载商品列表；reset 为 true 表示回到第一页覆盖数据 */
  async loadGoods(reset) {
    if (this.isLoadingGoods) return;
    this.isLoadingGoods = true;
    if (reset) this.query.page = 1;

    const page = this.query.page;
    // 首屏 / 重新筛选时用骨架屏，翻页时用底部 loading
    if (page === 1) this.setData({ isFirstLoad: true, loadError: false });
    else this.setData({ loadingMore: true });

    const params = {
      categoryId: this.data.currentCategory.id,
      sort: this.data.activeSort,
      page,
      size: PAGE_SIZE,
    };
    if (this.data.currentSubId) params.subCategoryId = this.data.currentSubId;
    if (this.data.appliedMin !== '') params.minPrice = this.data.appliedMin;
    if (this.data.appliedMax !== '') params.maxPrice = this.data.appliedMax;
    if (this.data.appliedStock) params.onlyStock = true;

    try {
      const data = await request({ url: '/goods/search', data: params });
      const records = (data && data.records) || [];
      const list = records.map(formatGoods);
      const goodsList = page === 1 ? list : this.data.goodsList.concat(list);
      this.setData({
        goodsList,
        hasMore: goodsList.length < ((data && data.total) || 0),
        isFirstLoad: false,
        loadingMore: false,
      });
    } catch (e) {
      // 失败兜底：提示并展示空态，绝不白屏
      toastError('商品加载失败');
      this.setData({
        goodsList: page === 1 ? [] : this.data.goodsList,
        hasMore: false,
        isFirstLoad: false,
        loadingMore: false,
        loadError: true,
      });
    } finally {
      this.isLoadingGoods = false;
    }
  },

  /** 加入购物车：真实写入并同步角标 */
  async handleAddCart(e) {
    const index = Number(e.currentTarget.dataset.index);
    const item = this.data.goodsList[index];
    if (!item) return;
    if (item.soldOut) {
      toastError('该商品已售罄');
      return;
    }
    // 短促缩放动画
    this.setData({ addingId: item.id });
    setTimeout(() => {
      if (this.data.addingId === item.id) this.setData({ addingId: 0 });
    }, 350);

    try {
      await request({
        url: '/cart/add',
        method: 'POST',
        data: {
          goodsId: item.id,
          specText: '默认规格',
          price: item.price,
          count: 1,
          name: item.name,
          mainPic: item.mainPic,
          stock: item.stock,
          unit: item.unit,
        },
      });
      toastSuccess('已加入购物车');
      vibrate();
      syncCartBadge();
    } catch (err) {
      toastError('加入购物车失败');
    }
  },

  /** 点击商品跳转详情 */
  handleGoodsTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` });
  },

  /** 图片加载失败回退本地兜底图 */
  handleImageError(e) {
    const index = Number(e.currentTarget.dataset.index);
    this.setData({ [`goodsList[${index}].mainPic`]: '/static/images/default.png' });
  },
});
