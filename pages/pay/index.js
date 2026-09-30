// pages/pay/index.js
// 支付确认页：支持「购物车结算」（无参）与「待付款订单再次支付」（?orderId=）两种入口
import { request, DEFAULT_IMAGE } from '../../api/http.js';
import { formatPrice, round2, sum } from '../../utils/format.js';
import { toastSuccess, toastError, showLoading, hideLoading } from '../../utils/toast.js';
import { syncCartBadge } from '../../utils/cart.js';
import regeneratorRuntime from '../../lib/runtime/runtime';

/** 与 mock 一致的满减规则：满 100 减 15、满 50 减 5 */
const calcDiscount = (amount) => (amount >= 100 ? 15 : amount >= 50 ? 5 : 0);

// 券类型对应的配色 class，WXML 只做展示
const TYPE_CLASS = { full: 'card-full', discount: 'card-discount', none: 'card-none' };

/** 券面额文案：折扣券展示「8.8折」，满减/无门槛展示「¥x」 */
const couponFaceText = (c) =>
  c.type === 'discount' ? `${Math.round(Number(c.amount) * 100) / 10}折` : `¥${c.amount}`;

/** 加工券数据，避免在 WXML 里做计算 */
const decorateCoupon = (c) => ({
  ...c,
  typeClass: TYPE_CLASS[c.type] || TYPE_CLASS.full,
  faceText: couponFaceText(c),
  thresholdText: c.type === 'none' ? '无门槛' : `满 ${c.threshold} 元可用`,
  endText: `有效期至 ${c.endTimeText}`,
  discountText: c.discount !== undefined ? formatPrice(c.discount) : '',
});

Page({
  data: {
    mode: 'cart', // cart=购物车结算 / order=待付款订单再次支付
    loading: true,
    hasGoods: false,
    emptyText: '没有待支付的商品',
    address: null,
    goodsItems: [],
    totalCount: 0,
    totalText: '0.00',
    discountText: '0.00',
    freightText: '0.00',
    payText: '0.00',
    // 优惠券相关
    couponEnabled: true, // 订单再次支付时券已核销，禁止再选
    couponList: [], // 可用券（含 discount）
    couponUnavailable: [], // 不可用券（含 reason）
    couponCount: 0,
    selectedCouponId: 0,
    selectedCouponTitle: '',
    couponText: '未使用',
    hasCoupon: false,
    couponPopVisible: false,
    remark: '',
    paying: false,
  },

  onLoad(options) {
    // 携带 orderId 即待付款订单再次支付
    this.orderId = options && options.orderId ? Number(options.orderId) : 0;
    this.cartIds = [];
    this.totalAmount = 0;
    this.setData({ mode: this.orderId ? 'order' : 'cart', couponEnabled: !this.orderId });
    this.loadData();
  },

  onShow() {
    syncCartBadge();
    // 从地址列表返回后重新回填当前地址（订单再次支付用的是下单快照，不刷新）
    if (this.data.mode === 'cart') this.refreshAddress();
  },

  /** 结算地址：优先「本次选中」，否则默认地址 */
  async refreshAddress() {
    try {
      const address = await request({ url: '/address/current' });
      this.setData({ address: address || null });
    } catch (e) {
      // 地址失败不影响金额主体，保留原值
    }
  },

  /** 按入口模式分别加载数据 */
  loadData() {
    if (this.data.mode === 'order') {
      this.loadOrder();
    } else {
      this.loadCart();
    }
  },

  /** 购物车结算：取已勾选有效商品 + 结算地址，金额在前端按同规则预算 */
  async loadCart() {
    try {
      const [cartRes, address] = await Promise.all([
        request({ url: '/cart/list' }),
        request({ url: '/address/current' }),
      ]);
      const list = (cartRes.list || []).filter((v) => v.checked && !v.invalid);
      this.cartIds = list.map((v) => v.id);
      if (!list.length) {
        this.setData({ loading: false, hasGoods: false, address, emptyText: '没有待支付的商品' });
        return;
      }
      const goodsItems = list.map((v) => ({
        key: v.id,
        goodsId: v.goodsId,
        name: v.name,
        mainPic: v.mainPic || DEFAULT_IMAGE,
        specText: v.specText,
        price: v.price,
        priceText: formatPrice(v.price),
        count: v.count,
        unit: v.unit,
      }));
      const totalAmount = round2(sum(goodsItems, (v) => v.price * v.count));
      this.totalAmount = totalAmount;
      // 按商品总价拉取可用券，并自动选中接口给出的最优券
      const couponDiscount = await this.loadAvailable(totalAmount);
      this.setData({
        loading: false,
        hasGoods: true,
        address: address || null,
        goodsItems,
        totalCount: goodsItems.reduce((s, v) => s + v.count, 0),
        ...this.buildAmount(totalAmount, calcDiscount(totalAmount), 0, undefined, couponDiscount),
      });
    } catch (e) {
      this.setData({ loading: false, hasGoods: false, emptyText: '加载失败，请稍后重试' });
    }
  },

  /** 待付款订单再次支付：用订单 items 与金额明细渲染，跳过下单接口 */
  async loadOrder() {
    try {
      const order = await request({ url: '/orders/detail', data: { orderId: this.orderId } });
      if (!order) {
        this.setData({ loading: false, hasGoods: false, emptyText: '订单不存在或已失效' });
        return;
      }
      this.orderId = order.id;
      const goodsItems = (order.items || []).map((v, i) => ({
        key: `${v.goodsId}-${i}`,
        goodsId: v.goodsId,
        name: v.name,
        mainPic: v.mainPic || DEFAULT_IMAGE,
        specText: v.specText,
        price: v.price,
        priceText: formatPrice(v.price),
        count: v.count,
        unit: v.unit,
      }));
      if (!goodsItems.length) {
        this.setData({ loading: false, hasGoods: false, emptyText: '订单没有待支付商品' });
        return;
      }
      // 券已在下单时核销，这里仅用订单自带的 couponDiscount 展示，不允许再选
      this.setData({
        loading: false,
        hasGoods: true,
        address: order.addressSnapshot || null,
        goodsItems,
        totalCount: goodsItems.reduce((s, v) => s + v.count, 0),
        couponEnabled: false,
        ...this.buildAmount(
          order.totalAmount,
          order.discountAmount,
          order.freight,
          order.payAmount,
          order.couponDiscount
        ),
      });
    } catch (e) {
      this.setData({ loading: false, hasGoods: false, emptyText: '订单不存在或已失效' });
    }
  },

  /** 拉取可用/不可用券并自动选中最优券，返回当前选中券的优惠额 */
  async loadAvailable(amount) {
    try {
      const res = await request({ url: '/coupon/available', data: { amount } });
      const available = (res.available || []).map(decorateCoupon);
      const unavailable = (res.unavailable || []).map(decorateCoupon);
      const best = available.filter((c) => c.id === Number(res.bestId))[0] || null;
      this.setData({
        couponList: available,
        couponUnavailable: unavailable,
        couponCount: available.length,
        selectedCouponId: best ? best.id : 0,
        selectedCouponTitle: best ? best.title : '',
      });
      return best ? best.discount : 0;
    } catch (e) {
      // 券接口失败不阻断下单，退化为「不使用优惠券」
      this.setData({
        couponList: [],
        couponUnavailable: [],
        couponCount: 0,
        selectedCouponId: 0,
        selectedCouponTitle: '',
      });
      return 0;
    }
  },

  /** 金额统一在 JS 侧格式化为字符串，WXML 只做展示；实付 = 商品总价 − 满减 − 优惠券 + 运费 */
  buildAmount(totalAmount, discountAmount, freight = 0, payAmount, couponDiscount = 0) {
    const total = round2(totalAmount);
    const discount = round2(discountAmount);
    const coupon = round2(couponDiscount);
    const finalPay =
      payAmount === undefined ? round2(total - discount - coupon + freight) : round2(payAmount);
    return {
      totalText: formatPrice(total),
      discountText: formatPrice(discount),
      freightText: formatPrice(freight),
      couponText: coupon > 0 ? `-¥${formatPrice(coupon)}` : '未使用',
      hasCoupon: coupon > 0,
      payText: formatPrice(finalPay),
    };
  },

  /** 商品图兜底 */
  handleGoodsImageError(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`goodsItems[${index}].mainPic`]: DEFAULT_IMAGE });
  },

  /** 订单备注 */
  handleRemarkInput(e) {
    this.setData({ remark: e.detail.value || '' });
  },

  /** 打开券列表弹层 */
  handleToggleCoupon() {
    if (!this.data.couponEnabled) return;
    this.setData({ couponPopVisible: true });
  },

  handleCloseCoupon() {
    this.setData({ couponPopVisible: false });
  },

  /** 阻止弹层内点击穿透到遮罩 */
  handleStopPropagation() {},

  /** 选择优惠券：id 为 0 表示不使用；选完立即重算金额并关闭弹层 */
  handleCouponSelect(e) {
    const id = Number(e.currentTarget.dataset.id);
    const coupon = id ? this.data.couponList.filter((c) => c.id === id)[0] : null;
    if (id && !coupon) return;
    const couponDiscount = coupon ? coupon.discount : 0;
    this.setData({
      selectedCouponId: id,
      selectedCouponTitle: coupon ? coupon.title : '',
      couponPopVisible: false,
      ...this.buildAmount(this.totalAmount, calcDiscount(this.totalAmount), 0, undefined, couponDiscount),
    });
  },

  /** 点击地址区：跳地址列表选择模式，返回后由 onShow 回填 */
  handleGoAddress() {
    wx.navigateTo({ url: '/pages/address/list?mode=select' });
  },

  /** 跳首页 */
  handleGoShopping() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  /** 立即支付 */
  async handlePay() {
    if (this.data.paying || !this.data.hasGoods) return;
    const isCart = this.data.mode === 'cart';
    this.setData({ paying: true });
    showLoading('支付中');
    try {
      let orderId = this.orderId;
      if (isCart) {
        // 模拟微信支付收银台，保留 2 秒 loading
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const items = this.data.goodsItems.map((v) => ({
          goodsId: v.goodsId,
          name: v.name,
          mainPic: v.mainPic,
          specText: v.specText,
          price: v.price,
          count: v.count,
          unit: v.unit,
        }));
        const order = await request({
          url: '/orders/create',
          method: 'POST',
          data: {
            items,
            addressSnapshot: this.data.address,
            remark: this.data.remark,
            payMethod: '微信支付',
            // 未选券传 0；mock 会自动核销券、返积分、写订单消息，页面无需重复处理
            couponId: this.data.selectedCouponId || 0,
          },
        });
        orderId = order.id;
        await request({ url: '/orders/pay', method: 'POST', data: { orderId } });
        // 结算成功后才清空购物车中已结算的商品
        await request({ url: '/cart/remove', method: 'POST', data: { ids: this.cartIds } });
        syncCartBadge();
      } else {
        await request({ url: '/orders/pay', method: 'POST', data: { orderId } });
      }
      hideLoading();
      toastSuccess('支付成功');
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/order/detail?orderId=' + orderId });
      }, 700);
    } catch (e) {
      // 任一步失败都必须收掉 loading，避免卡死
      hideLoading();
      toastError((e && e.message) || '支付失败');
      this.setData({ paying: false });
    }
  },
});
