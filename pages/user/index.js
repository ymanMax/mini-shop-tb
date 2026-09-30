// pages/user/index.js
// 个人中心：Mock 用户资料 / 订单入口（带各状态数量）/ 收藏 / 购物车角标
import { request } from '../../api/http.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
import { formatPrice } from '../../utils/format.js';
import { toast, toastError } from '../../utils/toast.js';
import { syncCartBadge } from '../../utils/cart.js';

const DEFAULT_AVATAR = '/static/images/default-avatar.png';

// 订单入口与订单页 Tab 的 type 参数一一对应
const ORDER_ENTRIES = [
  { type: 2, icon: '💰', name: '待付款', countKey: '1' },
  { type: 3, icon: '📦', name: '待发货', countKey: '2' },
  { type: 4, icon: '🚚', name: '待收货', countKey: '3' },
  { type: 5, icon: '✅', name: '已完成', countKey: '5' },
];

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    avatar: DEFAULT_AVATAR,
    collectNums: 0,
    historyNums: 0,
    cartCount: 0,
    // 优惠券 / 积分 / 签到 / 消息
    couponCount: 0,
    points: 0,
    todaySigned: true,
    unreadCount: 0,
    orderEntries: ORDER_ENTRIES,
    orderCount: { all: 0, 1: 0, 2: 0, 3: 0, 5: 0 },
    addressText: '',
    balanceText: '0.00',
    loading: true,
  },

  onShow() {
    this.loadData();
  },

  onPullDownRefresh() {
    this.loadData().then(() => wx.stopPullDownRefresh());
  },

  async loadData() {
    // 购物车角标与用户资料先用本地缓存秒开，再拉接口补全
    const cached = wx.getStorageSync('userInfo') || {};
    this.setData({
      cartCount: syncCartBadge(),
      userInfo: cached,
      avatar: cached.avatar || DEFAULT_AVATAR,
    });

    try {
      const [user, collectCount, orderCount, address, history, couponCount, pointsInfo, unread] = await Promise.all([
        request({ url: '/user/info' }),
        request({ url: '/collect/count' }).catch(() => ({})),
        request({ url: '/orders/count' }).catch(() => ({})),
        // 结算用地址：优先本次选中，否则默认地址
        request({ url: '/address/current' }).catch(() => null),
        request({ url: '/history/list' }).catch(() => []),
        request({ url: '/coupon/count' }).catch(() => ({})),
        request({ url: '/points/info' }).catch(() => ({})),
        request({ url: '/messages/unreadCount' }).catch(() => ({})),
      ]);

      this.setData({
        loading: false,
        userInfo: user,
        avatar: user.avatar || DEFAULT_AVATAR,
        balanceText: formatPrice(user.balance),
        collectNums: (collectCount && collectCount.all) || 0,
        historyNums: (history || []).length,
        couponCount: (couponCount && couponCount.unused) || 0,
        // 积分以接口为准，签到后回到本页能立刻看到最新值
        points: (pointsInfo && pointsInfo.points) || 0,
        todaySigned: !pointsInfo || pointsInfo.todaySigned !== false,
        unreadCount: (unread && unread.count) || 0,
        orderCount: { all: 0, 1: 0, 2: 0, 3: 0, 5: 0, ...orderCount },
        addressText: address ? `${address.userName} ${address.telNumber}` : '暂无收货地址',
      });
    } catch (err) {
      this.setData({ loading: false });
      toastError((err && err.message) || '加载失败');
    }
  },

  // ---------------------------------------------------------------- 交互
  handleGoOrderAll() {
    wx.navigateTo({ url: '/pages/order/index?type=1' });
  },

  handleGoOrder(e) {
    const { type } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/order/index?type=${type}` });
  },

  handleGoCollect() {
    wx.navigateTo({ url: '/pages/collect/index' });
  },

  handleGoFootprint() {
    wx.navigateTo({ url: '/pages/footprint/index' });
  },

  handleGoCoupon() {
    wx.navigateTo({ url: '/pages/coupon/mine' });
  },

  handleGoPoints() {
    wx.navigateTo({ url: '/pages/points/index' });
  },

  handleGoCheckin() {
    wx.navigateTo({ url: '/pages/checkin/index' });
  },

  handleGoMessage() {
    wx.navigateTo({ url: '/pages/message/index' });
  },

  /** 收货地址管理：管理模式进入地址列表页 */
  handleGoAddress() {
    wx.navigateTo({ url: '/pages/address/list' });
  },

  handleGoCart() {
    wx.switchTab({ url: '/pages/cart/index' });
  },

  handleGoFeedback() {
    wx.navigateTo({ url: '/pages/feedback/index' });
  },

  handleGoSearch() {
    wx.navigateTo({ url: '/pages/search/index' });
  },

  handleContact() {
    toast('客服热线 400-618-4000（9:00-21:00）');
  },

  handleAbout() {
    toast('烧饼商品 v2.0 · 老手艺现烤现发');
  },

  handleShare() {
    toast('点击右上角「···」把小程序推荐给朋友');
  },

  handleAvatarError() {
    this.setData({ avatar: DEFAULT_AVATAR });
  },
});
