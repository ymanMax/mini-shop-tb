// pages/index/index.js
// 首页：搜索入口 / 轮播 / 限时抢购 / 分类导航 / 限时特惠楼层 / 为你推荐
import { request } from '../../api/http.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
import { formatPrice } from '../../utils/format.js';
import { toast, toastSuccess, toastError, vibrate } from '../../utils/toast.js';
import { syncCartBadge } from '../../utils/cart.js';

const DEFAULT_IMAGE = '/static/images/default.png';
/** 抢购倒计时刷新间隔 */
const SECKILL_TICK = 1000;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    // 轮播图
    swiperList: [],
    currentSwiper: 0,
    // 分类导航
    catesList: [],
    // 楼层
    floors: [],
    // 为你推荐
    recommend: [],
    // 购物车角标
    cartCount: 0,
    // 公告
    notice: '新用户首单立减 5 元 · 满 50 元包邮到家 · 当日 15:00 前下单当天发货',

    // 限时抢购
    seckillSessions: [],
    seckillCurrentId: 0,
    // 当前展示的场次（默认跟随正在进行的场次，也允许手动切看其它场次）
    seckillActiveId: 0,
    seckillActiveGoods: [],
    seckillStatus: '',
    seckillStatusText: '',
    seckillCountdown: '00:00:00',
    seckillCountdownLabel: '',

    // 抢购 SKU 弹层
    seckillSkuVisible: false,
    seckillSkuGoods: null,
    seckillSpecDims: [],
    seckillSpecComplete: true,
    seckillSpecText: '',
    seckillPriceText: '0.00',
  },

  // 抢购倒计时定时器
  seckillTimer: null,

  onLoad() {
    this.loadHome();
    this.loadSeckill();
  },

  onShow() {
    // 从其它页面返回时保持购物车角标实时，并恢复抢购倒计时
    this.setData({ cartCount: syncCartBadge() });
    this.startSeckillTimer();
  },

  onHide() {
    this.stopSeckillTimer();
  },

  onUnload() {
    this.stopSeckillTimer();
  },

  onPullDownRefresh() {
    Promise.all([this.loadHome(), this.loadSeckill()]).then(() => wx.stopPullDownRefresh());
  },

  onShareAppMessage() {
    return { title: '烧饼商品 · 老手艺现烤现发', path: '/pages/index/index' };
  },

  async loadHome() {
    this.setData({ loading: true });
    try {
      const res = await request({ url: '/home/index' });
      this.setData({
        loading: false,
        swiperList: (res.swiper || []).map((item) => ({
          ...item,
          url: `/pages/goods_detail/index?goods_id=${item.goodsId}`,
        })),
        catesList: res.cates || [],
        floors: (res.floors || []).map((floor) => ({
          ...floor,
          product_list: (floor.product_list || []).map((g) => ({
            ...g,
            priceText: formatPrice(g.price),
          })),
        })),
        recommend: (res.recommend || []).map((g) => ({
          ...g,
          priceText: formatPrice(g.price),
        })),
      });
    } catch (err) {
      this.setData({ loading: false });
      toastError((err && err.message) || '首页加载失败');
    }
  },

  // ---------------------------------------------------------------- 限时抢购
  async loadSeckill() {
    try {
      const res = await request({ url: '/seckill/sessions' });
      const sessions = (res.sessions || []).map((s) => ({
        ...s,
        statusText: { active: '抢购中', upcoming: '即将开始', ended: '已结束' }[s.status],
        goods: s.goods.map((g) => this.decorateSeckillGoods(g)),
      }));
      // 首次进入跟随「当前场」，之后保留用户手动切换的选择
      const activeId = this.data.seckillActiveId && sessions.some((s) => s.id === this.data.seckillActiveId)
        ? this.data.seckillActiveId
        : res.currentId;
      this.setData({ seckillSessions: sessions, seckillCurrentId: res.currentId, seckillActiveId: activeId });
      this.applySeckillSession(activeId);
      this.startSeckillTimer();
    } catch (err) {
      // 抢购区失败不影响首页其它模块
      this.setData({ seckillSessions: [], seckillActiveGoods: [] });
    }
  },

  /** 补齐抢购商品在 WXML 中直接使用的展示字段 */
  decorateSeckillGoods(g) {
    // 按钮文案在 JS 里算好，避免 WXML 里堆一长串三元表达式
    let btnText = '马上抢';
    if (g.soldOut) btnText = '已抢光';
    else if (g.statusText === '已结束') btnText = '已结束';
    else if (g.limitReached) btnText = '已抢过';
    else if (g.statusText === '即将开始') btnText = '即将开始';

    return {
      ...g,
      btnText,
      seckillPriceText: formatPrice(g.seckillPrice),
      priceText: formatPrice(g.price),
      progressStyle: `width:${Math.min(100, g.progress)}%`,
    };
  },

  /** 把某个场次设为当前展示场次并刷新倒计时 */
  applySeckillSession(sessionId) {
    const session = this.data.seckillSessions.filter((s) => s.id === sessionId)[0];
    if (!session) return;
    this.setData({
      seckillActiveId: sessionId,
      seckillActiveGoods: session.goods,
      seckillStatus: session.status,
      seckillStatusText: session.statusText,
      seckillCountdownLabel:
        session.status === 'active' ? '距本场结束' : session.status === 'upcoming' ? '距本场开始' : '本场已结束',
    });
    this.tickSeckill();
  },

  startSeckillTimer() {
    this.stopSeckillTimer();
    if (!this.data.seckillSessions.length) return;
    this.seckillTimer = setInterval(() => this.tickSeckill(), SECKILL_TICK);
  },

  stopSeckillTimer() {
    if (this.seckillTimer) {
      clearInterval(this.seckillTimer);
      this.seckillTimer = null;
    }
  },

  /** 每秒刷新倒计时；归零时重新拉取场次状态（相当于自动切到下一场） */
  tickSeckill() {
    const session = this.data.seckillSessions.filter((s) => s.id === this.data.seckillActiveId)[0];
    if (!session) return;
    const now = Date.now();
    const target = session.status === 'upcoming' ? session.startTime : session.endTime;
    const remain = target - now;

    if (remain <= 0) {
      this.setData({ seckillCountdown: '00:00:00' });
      // 场次状态发生了翻转，重新拉一次拿到最新状态与当前场
      this.loadSeckill();
      return;
    }
    const total = Math.floor(remain / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n) => String(n).padStart(2, '0');
    this.setData({ seckillCountdown: `${pad(h)}:${pad(m)}:${pad(s)}` });
  },

  /** 点击场次条切换查看的场次 */
  handleSeckillSession(e) {
    const { id } = e.currentTarget.dataset;
    if (id === this.data.seckillActiveId) return;
    vibrate();
    this.applySeckillSession(id);
  },

  /** 抢购商品点击进详情 */
  handleSeckillGoods(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` });
  },

  // ---------------------------------------------------------------- 抢购 SKU
  handleSeckillBuy(e) {
    const { id } = e.currentTarget.dataset;
    const goods = this.data.seckillActiveGoods.filter((g) => g.goodsId === id)[0];
    if (!goods) return;
    if (goods.soldOut) {
      toast('该商品已抢光');
      return;
    }
    if (goods.limitReached) {
      toast('每人每场每商品限购 1 件，你已抢过啦');
      return;
    }
    if (this.data.seckillStatus === 'upcoming') {
      toast(`本场 ${this.data.seckillSessions.filter((s) => s.id === this.data.seckillActiveId)[0].label} 开抢，先收藏一下吧`);
      return;
    }
    if (this.data.seckillStatus === 'ended') {
      toast('本场已结束，看看下一场吧');
      return;
    }

    vibrate();
    const specDims = (goods.specs || []).map((dim) => ({
      name: dim.name,
      values: dim.values.map((v) => ({ label: v.label })),
      activeIndex: -1,
    }));
    this.setData({
      seckillSkuVisible: true,
      seckillSkuGoods: goods,
      seckillSpecDims: specDims,
      // 无规格商品直接视为已选完整
      seckillSpecComplete: specDims.length === 0,
      seckillSpecText: specDims.length ? '请选择规格' : `默认规格 · 1${goods.unit}`,
      seckillPriceText: formatPrice(goods.seckillPrice),
    });
  },

  handleSeckillSpec(e) {
    const { dim, value } = e.currentTarget.dataset;
    const specDims = this.data.seckillSpecDims.slice();
    if (!specDims[dim]) return;
    specDims[dim] = { ...specDims[dim], activeIndex: specDims[dim].activeIndex === value ? -1 : value };
    vibrate();
    const labels = specDims.filter((d) => d.activeIndex >= 0).map((d) => d.values[d.activeIndex].label);
    const complete = specDims.every((d) => d.activeIndex >= 0);
    const firstMissing = (specDims.filter((d) => d.activeIndex < 0)[0] || {}).name || '';
    this.setData({
      specDims,
      seckillSpecComplete: complete,
      seckillSpecText: complete ? labels.join(' · ') : `${labels.length ? `${labels.join(' · ')} · ` : ''}请选择${firstMissing}`,
    });
  },

  handleCloseSeckillSku() {
    this.setData({ seckillSkuVisible: false });
  },

  handleStopPropagation() {},

  async handleSeckillConfirm() {
    const { seckillSkuGoods, seckillSpecComplete, seckillSpecText, seckillActiveId } = this.data;
    if (!seckillSpecComplete) {
      toast('请选择完整规格');
      return;
    }
    if (!seckillSkuGoods) return;
    try {
      const res = await request({
        url: '/seckill/buy',
        method: 'POST',
        data: {
          sessionId: seckillActiveId,
          goodsId: seckillSkuGoods.goodsId,
          specText: seckillSpecText,
        },
      });
      this.setData({ seckillSkuVisible: false, cartCount: syncCartBadge() });
      toastSuccess(`抢购成功 ¥${formatPrice(res.seckillPrice)}`);
      // 库存与进度已变化，重新拉一次让进度条推进
      this.loadSeckill();
    } catch (err) {
      toastError((err && err.message) || '抢购失败');
    }
  },

  handleSeckillImageError(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`seckillActiveGoods[${index}].mainPic`]: DEFAULT_IMAGE });
  },

  // ---------------------------------------------------------------- 交互
  handleSwiperChange(e) {
    this.setData({ currentSwiper: e.detail.current });
  },

  /** 点击分类导航：switchTab 不能带参，用 globalData 传递目标分类 */
  handleGoCate(e) {
    const { id } = e.currentTarget.dataset;
    const app = getApp();
    if (app && app.globalData) app.globalData.pendingCategoryId = id;
    wx.switchTab({ url: '/pages/category/index' });
  },

  handleGoGoods(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` });
  },

  handleGoCart() {
    wx.switchTab({ url: '/pages/cart/index' });
  },

  handleGoSearch() {
    wx.navigateTo({ url: '/pages/search/index' });
  },

  /** 楼层「更多」：把该楼层分类带到分类页 */
  handleGoFloorMore(e) {
    const { categoryId } = e.currentTarget.dataset;
    const app = getApp();
    if (app && app.globalData) app.globalData.pendingCategoryId = categoryId;
    wx.switchTab({ url: '/pages/category/index' });
  },

  // ---------------------------------------------------------------- 图片兜底
  handleSwiperImageError(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`swiperList[${index}].image_src`]: DEFAULT_IMAGE });
  },

  handleCateImageError(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`catesList[${index}].image_src`]: DEFAULT_IMAGE });
  },

  handleFloorImageError(e) {
    const { floor, index } = e.currentTarget.dataset;
    this.setData({ [`floors[${floor}].product_list[${index}].image_src`]: DEFAULT_IMAGE });
  },

  handleRecommendImageError(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`recommend[${index}].mainPic`]: DEFAULT_IMAGE });
  },
});
