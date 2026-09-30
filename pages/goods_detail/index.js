// pages/goods_detail/index.js
// 商品详情页：多图轮播 / SKU 规格选择 / 参数 / 售后 / 图文详情 / 评价模块 / 看了又看
import { request } from '../../api/http.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
import { formatPrice, formatSales, fromNow } from '../../utils/format.js';
import { toast, toastSuccess, toastError, vibrate } from '../../utils/toast.js';
import { syncCartBadge } from '../../utils/cart.js';

const DEFAULT_IMAGE = '/static/images/default.png';
const DEFAULT_AVATAR = '/static/images/default-avatar.png';

// 评价默认只展示 3 条，点「查看全部」后按每页 10 条分页加载
const REVIEW_PREVIEW_COUNT = 3;
const REVIEW_PAGE_SIZE = 10;
// 参数区默认折叠到 4 行
const PARAM_COLLAPSE_COUNT = 4;

/** 星级文案：4 -> '★★★★☆'（WXML 不支持函数调用，统一在 JS 里算好） */
const buildStarText = (rating) => {
  const n = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
};

/** 评价标签筛选项，count 由评分分布实时算出 */
const REVIEW_TABS = [
  { key: 'all', label: '全部' },
  { key: 'good', label: '好评' },
  { key: 'mid', label: '中评' },
  { key: 'bad', label: '差评' },
  { key: 'image', label: '有图' },
];

Page({
  data: {
    loading: true,
    goodsId: 0,
    goods: {},
    pics: [],
    currentPic: 1,
    priceText: '0.00',
    originalPriceText: '0.00',
    salesText: '0',
    isCollect: false,
    cartCount: 0,
    descLines: [],

    // 商品参数
    params: [],
    visibleParams: [],
    paramExpanded: false,
    paramFoldable: false,

    // 售后保障
    serviceList: [],

    // 评价模块
    reviewStats: { total: 0, avgRating: 0, goodRate: 0, imageCount: 0, distribution: [] },
    avgStarText: '☆☆☆☆☆',
    reviewTabs: [],
    reviewType: 'all',
    reviews: [],
    reviewTotal: 0,
    reviewExpanded: false,
    reviewHasMore: false,
    reviewLoading: false,

    // 看了又看
    recommend: [],

    // SKU 规格弹层
    skuVisible: false,
    skuMode: 'cart',
    specDims: [],
    skuComplete: true,
    skuPriceText: '0.00',
    skuOriginalText: '0.00',
    skuStock: 0,
    skuImage: '',
    skuSpecText: '默认规格',
    skuCount: 1,
    skuActionText: '加入购物车',
    skuStockTip: '',
  },

  // 原始商品数据（不参与渲染，避免 setData 传输冗余字段）
  GoodsInfo: {},
  // 评价分页游标
  reviewPage: 0,
  // 评价请求序号，用于丢弃切换筛选后返回的过期响应
  reviewRequestId: 0,

  onLoad(options) {
    const goodsId = Number(options.goods_id || options.goodsId || 0);
    if (!goodsId) {
      this.setData({ loading: false });
      toastError('商品不存在');
      return;
    }
    this.setData({ goodsId });
    this.loadAll(goodsId);
  },

  onShow() {
    // 从收藏页返回时同步收藏态，并保持角标实时
    const cartCount = syncCartBadge();
    this.setData({ cartCount });
    if (this.data.goodsId) this.syncCollectState();
  },

  onShareAppMessage() {
    const { goods, goodsId } = this.data;
    return {
      title: goods.name || '烧饼商品',
      path: `/pages/goods_detail/index?goods_id=${goodsId}`,
      imageUrl: this.data.pics[0] || DEFAULT_IMAGE,
    };
  },

  onShareTimeline() {
    return {
      title: this.data.goods.name || '烧饼商品',
      query: `goods_id=${this.data.goodsId}`,
      imageUrl: this.data.pics[0] || DEFAULT_IMAGE,
    };
  },

  // ---------------------------------------------------------------- 数据加载
  async loadAll(goodsId) {
    this.setData({ loading: true });
    try {
      const [goods, recommend] = await Promise.all([
        request({ url: '/goods/detail', data: { goodsId } }),
        request({ url: '/goods/recommend', data: { goodsId, limit: 6 } }).catch(() => []),
      ]);
      this.applyGoods(goods);
      // 进入详情页即写入浏览足迹（接口内部负责去重、置顶与 50 条上限）
      this.recordHistory();
      this.setData({
        recommend: (recommend || []).map((item) => ({
          ...item,
          priceText: formatPrice(item.price),
          salesText: formatSales(item.sales),
        })),
      });
      // 评价区首屏先取 3 条
      this.loadReviews({ reset: true, size: REVIEW_PREVIEW_COUNT });
    } catch (err) {
      this.setData({ loading: false });
      toastError((err && err.message) || '商品加载失败');
    }
  },

  /** 把接口数据转换成可直接渲染的结构 */
  applyGoods(goods) {
    const pics = (goods.pics && goods.pics.length ? goods.pics : [DEFAULT_IMAGE]).slice();
    const params = goods.params || [];
    const afterSale = goods.afterSale || {};

    const serviceList = [];
    if (afterSale.supportReturn) {
      serviceList.push({
        icon: '↩️',
        title: `${afterSale.returnDays || 7}天无理由退货`,
        desc: '签收后 7 天内可申请',
      });
    }
    if (afterSale.supportExchange) {
      serviceList.push({ icon: '🔄', title: '支持换货', desc: '质量问题免费换新' });
    }
    serviceList.push({ icon: '🛡️', title: afterSale.guaranteeText || '48小时售后', desc: '专属客服极速响应' });
    serviceList.push({ icon: '🚚', title: '全场包邮', desc: '当日 15:00 前下单当天发货' });

    const hasSpecs = !!(goods.specs && goods.specs.length);

    this.GoodsInfo = goods;
    this.setData({
      loading: false,
      goods,
      pics,
      currentPic: 1,
      priceText: formatPrice(goods.price),
      originalPriceText: formatPrice(goods.originalPrice),
      salesText: formatSales(goods.sales),
      isCollect: !!goods.isCollect,
      descLines: String(goods.description || '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      params,
      visibleParams: params.slice(0, PARAM_COLLAPSE_COUNT),
      paramFoldable: params.length > PARAM_COLLAPSE_COUNT,
      serviceList,
      specDims: this.buildSpecDims(goods),
      skuImage: pics[0],
      skuStock: goods.stock,
      skuPriceText: formatPrice(goods.price),
      skuOriginalText: formatPrice(goods.originalPrice),
      skuSpecText: hasSpecs ? '请选择规格' : `默认规格 · 1${goods.unit || '份'}`,
      skuComplete: !hasSpecs,
      skuCount: 1,
      skuStockTip: `库存 ${goods.stock} ${goods.unit || '件'}`,
    });
    this.applyReviewStats(goods.reviewStats);
  },

  /** 同步收藏态（收藏页可能改动过） */
  async syncCollectState() {
    try {
      const ids = await request({ url: '/collect/ids' });
      const isCollect = (ids || []).indexOf(this.data.goodsId) !== -1;
      if (isCollect !== this.data.isCollect) this.setData({ isCollect });
    } catch (e) {
      /* 收藏态同步失败不影响主流程 */
    }
  },

  /** 记录浏览足迹；失败不打扰用户，毕竟只是辅助数据 */
  recordHistory() {
    request({ url: '/history/add', method: 'POST', data: { goodsId: this.data.goodsId } }).catch(() => {});
  },

  // ---------------------------------------------------------------- 轮播
  handleSwiperChange(e) {
    this.setData({ currentPic: e.detail.current + 1 });
  },

  handleImageError(e) {
    const { index } = e.currentTarget.dataset;
    if (index === undefined) return;
    this.setData({ [`pics[${index}]`]: DEFAULT_IMAGE });
  },

  handlePreview(e) {
    const { index } = e.currentTarget.dataset;
    const urls = this.data.pics.slice();
    wx.previewImage({ urls, current: urls[index] || urls[0] });
  },

  // ---------------------------------------------------------------- 参数 / 售后
  handleToggleParam() {
    if (!this.data.paramFoldable) return;
    const expanded = !this.data.paramExpanded;
    this.setData({
      paramExpanded: expanded,
      visibleParams: expanded ? this.data.params : this.data.params.slice(0, PARAM_COLLAPSE_COUNT),
    });
  },

  // ---------------------------------------------------------------- 收藏
  async handleCollect() {
    try {
      vibrate();
      const res = await request({ url: '/collect/toggle', method: 'POST', data: { goodsId: this.data.goodsId } });
      this.setData({ isCollect: res.isCollect });
      if (res.isCollect) toastSuccess('收藏成功');
      else toast('已取消收藏');
    } catch (err) {
      toastError((err && err.message) || '操作失败');
    }
  },

  // ---------------------------------------------------------------- SKU 规格
  /** 构造规格维度，activeIndex = -1 表示未选 */
  buildSpecDims(goods) {
    return (goods.specs || []).map((dim) => ({
      name: dim.name,
      values: dim.values.map((v) => ({ label: v.label, price: v.price, stock: v.stock })),
      activeIndex: -1,
    }));
  },

  handleOpenSku(e) {
    const mode = (e.currentTarget && e.currentTarget.dataset.mode) || 'cart';
    vibrate();
    this.setData({
      skuVisible: true,
      skuMode: mode,
      skuActionText: mode === 'buy' ? '立即购买' : '加入购物车',
    });
    this.computeSku();
  },

  handleCloseSku() {
    this.setData({ skuVisible: false });
  },

  /** 阻止弹层内部点击冒泡到遮罩 */
  handleStopPropagation() {},

  handleSelectSpec(e) {
    const { dim, value } = e.currentTarget.dataset;
    const specDims = this.data.specDims.slice();
    if (!specDims[dim]) return;
    // 再次点击同一项视为取消选择
    specDims[dim] = {
      ...specDims[dim],
      activeIndex: specDims[dim].activeIndex === value ? -1 : value,
    };
    vibrate();
    this.setData({ specDims }, () => this.computeSku());
  },

  /**
   * 联动计算价格 / 库存 / 主图
   * 有效价格 = 已选各项中最后一个带 price 的值，否则用商品原价
   * 有效库存 = 已选各项中带 stock 的值取最小值
   */
  computeSku() {
    const goods = this.GoodsInfo || {};
    const { specDims, pics } = this.data;
    let price = goods.price || 0;
    let stock = goods.stock || 0;
    let complete = true;
    const labels = [];
    let firstMissing = '';

    specDims.forEach((dim) => {
      if (dim.activeIndex < 0) {
        complete = false;
        if (!firstMissing) firstMissing = dim.name;
        return;
      }
      const value = dim.values[dim.activeIndex];
      labels.push(value.label);
      if (value.price !== undefined) price = value.price;
      if (value.stock !== undefined) stock = Math.min(stock, value.stock);
    });

    const hasSpecs = specDims.length > 0;
    // 主图跟随第一个规格维度切换，营造真实的多规格主图联动效果
    const imgIndex = hasSpecs && specDims[0].activeIndex >= 0 ? specDims[0].activeIndex % pics.length : 0;
    const skuSpecText = hasSpecs
      ? complete
        ? labels.join(' · ')
        : `${labels.length ? `${labels.join(' · ')} · ` : ''}请选择${firstMissing}`
      : `默认规格 · 1${goods.unit || '份'}`;

    this.setData({
      skuComplete: hasSpecs ? complete : true,
      skuPriceText: formatPrice(price),
      skuOriginalText: formatPrice(goods.originalPrice),
      skuStock: stock,
      skuImage: pics[imgIndex] || pics[0] || DEFAULT_IMAGE,
      skuSpecText,
      // 切换规格后把数量收敛到新库存范围内
      skuCount: Math.max(1, Math.min(this.data.skuCount, stock || 1)),
      skuStockTip: stock > 0 ? `库存 ${stock} ${goods.unit || '件'}` : '该规格暂时缺货',
    });
  },

  handleSkuCount(e) {
    const { operation } = e.currentTarget.dataset;
    const { skuCount, skuStock } = this.data;
    const next = skuCount + Number(operation);
    if (next < 1) {
      toast('至少购买 1 件');
      return;
    }
    if (next > skuStock) {
      toast(`该规格最多可购买 ${skuStock} 件`);
      return;
    }
    this.setData({ skuCount: next });
  },

  /** 弹层内的确定按钮：加入购物车 / 立即购买 */
  async handleSkuConfirm() {
    const { skuComplete, skuMode, skuStock } = this.data;
    if (!skuComplete) {
      toast('请选择完整规格');
      return;
    }
    if (skuStock <= 0) {
      toast('该规格暂时缺货');
      return;
    }
    await this.addToCart({ only: skuMode === 'buy' });
  },

  /** 底部栏按钮：有规格则先弹 SKU，无规格直接加购 */
  handleQuickAdd(e) {
    const mode = (e.currentTarget && e.currentTarget.dataset.mode) || 'cart';
    if (this.data.specDims.length) {
      this.handleOpenSku({ currentTarget: { dataset: { mode } } });
      return;
    }
    this.addToCart({ only: mode === 'buy' });
  },

  async addToCart({ only = false } = {}) {
    const { goodsId, goods, skuPriceText, skuCount, skuStock, skuSpecText, skuImage } = this.data;
    try {
      await request({
        url: '/cart/add',
        method: 'POST',
        data: {
          goodsId,
          name: goods.name,
          mainPic: skuImage || goods.mainPic,
          specText: skuSpecText,
          price: Number(skuPriceText),
          count: skuCount,
          stock: skuStock,
          unit: goods.unit,
          only,
        },
      });
      this.setData({ skuVisible: false, cartCount: syncCartBadge() });
      if (only) {
        // 立即购买：只勾选当前商品，直接进入支付确认页
        wx.navigateTo({ url: '/pages/pay/index' });
      } else {
        toastSuccess('加入购物车成功');
      }
    } catch (err) {
      toastError((err && err.message) || '加入购物车失败');
    }
  },

  // ---------------------------------------------------------------- 评价
  applyReviewStats(stats) {
    if (!stats) return;
    const distribution = (stats.distribution || []).map((d) => ({
      ...d,
      widthStyle: `width:${d.percent}%`,
    }));
    const countOf = (stars) =>
      (stats.distribution || []).filter((d) => stars.includes(d.star)).reduce((s, d) => s + d.count, 0);

    const reviewTabs = REVIEW_TABS.map((tab) => {
      let count = stats.total;
      if (tab.key === 'good') count = countOf([4, 5]);
      else if (tab.key === 'mid') count = countOf([3]);
      else if (tab.key === 'bad') count = countOf([1, 2]);
      else if (tab.key === 'image') count = stats.imageCount || 0;
      return { ...tab, count };
    });

    this.setData({
      reviewStats: { ...stats, distribution },
      avgStarText: buildStarText(stats.avgRating),
      reviewTabs,
      reviewTotal: stats.total,
    });
  },

  /** 加载评价列表：reset 为 true 时从第 1 页开始 */
  async loadReviews({ reset = false, size = REVIEW_PAGE_SIZE } = {}) {
    const page = reset ? 1 : this.reviewPage + 1;
    const requestId = ++this.reviewRequestId;
    this.setData({ reviewLoading: true });
    try {
      const res = await request({
        url: '/reviews/list',
        data: { goodsId: this.data.goodsId, type: this.data.reviewType, page, size },
      });
      // 竞态保护：切换筛选后返回的旧响应直接丢弃
      if (requestId !== this.reviewRequestId) return;
      this.reviewPage = page;
      const records = (res.records || []).map((r) => this.decorateReview(r));
      const reviews = reset ? records : this.data.reviews.concat(records);
      this.setData({
        reviews,
        reviewLoading: false,
        reviewTotal: res.total,
        reviewHasMore: reviews.length < res.total,
      });
    } catch (err) {
      if (requestId !== this.reviewRequestId) return;
      this.setData({ reviewLoading: false });
      toastError((err && err.message) || '评价加载失败');
    }
  },

  decorateReview(r) {
    const content = r.content || '';
    return {
      ...r,
      starText: buildStarText(r.rating),
      timeText: fromNow(r.createTime),
      avatar: r.userAvatar || DEFAULT_AVATAR,
      contentExpanded: false,
      // 内容较长时才显示「展开」
      needExpand: content.length > 60,
    };
  },

  handleReviewTab(e) {
    const { key } = e.currentTarget.dataset;
    if (key === this.data.reviewType) return;
    this.setData({ reviewType: key, reviews: [], reviewExpanded: true }, () => {
      this.loadReviews({ reset: true, size: REVIEW_PAGE_SIZE });
    });
  },

  /** 查看全部评价：展开为每页 10 条的分页列表，并滚动到评价区 */
  handleExpandReviews() {
    this.setData({ reviewExpanded: true, reviews: [] }, () => {
      this.loadReviews({ reset: true, size: REVIEW_PAGE_SIZE });
      wx.pageScrollTo({ selector: '#review', duration: 300, fail: () => {} });
    });
  },

  handleLoadMoreReviews() {
    if (this.data.reviewLoading || !this.data.reviewHasMore) return;
    this.loadReviews({ size: REVIEW_PAGE_SIZE });
  },

  handleToggleReviewContent(e) {
    const { index } = e.currentTarget.dataset;
    const reviews = this.data.reviews.slice();
    reviews[index] = { ...reviews[index], contentExpanded: !reviews[index].contentExpanded };
    this.setData({ reviews });
  },

  handleReviewAvatarError(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`reviews[${index}].avatar`]: DEFAULT_AVATAR });
  },

  handlePreviewReviewImage(e) {
    const { index, url } = e.currentTarget.dataset;
    const images = this.data.reviews[index].images || [];
    wx.previewImage({ urls: images, current: url });
  },

  handleReviewImageError(e) {
    const { index, img } = e.currentTarget.dataset;
    this.setData({ [`reviews[${index}].images[${img}]`]: DEFAULT_IMAGE });
  },

  // ---------------------------------------------------------------- 跳转
  handleGoCart() {
    wx.switchTab({ url: '/pages/cart/index' });
  },

  handleGoGoods(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` });
  },

  handleRecommendImageError(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`recommend[${index}].mainPic`]: DEFAULT_IMAGE });
  },

  /** 客服入口：Mock 环境下用 toast 模拟会话 */
  handleContact() {
    toast('客服小烧为您服务，请拨打 400-618-4000');
  },
});
