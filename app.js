/**
 * 烧饼商品小程序入口
 *
 * 后端服务未启动，全站数据来自 mock/ 目录（见 api/http.js 的 USE_MOCK 开关）。
 * onLaunch 自动注入 Mock 登录态，保证依赖登录态的页面（订单、评价、我的）零报错。
 */
import { syncCartBadge } from './utils/cart.js';
import { syncMessageBadge } from './utils/message.js';

/** 默认 Mock 用户，与 mock/data/user.js 保持一致 */
const MOCK_USER = {
  id: 10001,
  nickName: '烧饼爱好者',
  avatar: '/static/images/default-avatar.png',
  phone: '138****8888',
};

App({
  globalData: {
    /** 当前登录用户 */
    userInfo: null,
    /** 购物车件数，供各页面角标展示 */
    cartCount: 0,
    /** 未读消息数 */
    unreadCount: 0,
    /** 是否处于 Mock 模式 */
    useMock: true,
  },

  onLaunch() {
    this.initUserInfo();
    this.initCartBadge();
    this.initMessageBadge();
  },

  onShow() {
    // 从后台回前台时刷新一次角标，保证多页面操作后角标一致
    this.initCartBadge();
    this.initMessageBadge();
  },

  /** 注入 Mock 登录态：无缓存时自动写入，游客无需登录即可体验全部功能 */
  initUserInfo() {
    let userInfo = null;
    try {
      userInfo = wx.getStorageSync('userInfo');
    } catch (e) {
      userInfo = null;
    }

    if (!userInfo || !userInfo.id) {
      userInfo = { ...MOCK_USER };
      try {
        wx.setStorageSync('userInfo', userInfo);
      } catch (e) {
        /* 忽略写入异常 */
      }
    }

    this.globalData.userInfo = userInfo;
    return userInfo;
  },

  /** 获取登录用户，必要时代为初始化 */
  getUserInfo() {
    return this.globalData.userInfo || this.initUserInfo();
  },

  /** 同步购物车角标 */
  initCartBadge() {
    const count = syncCartBadge();
    this.globalData.cartCount = count;
    return count;
  },

  /** 同步「我的」Tab 的未读消息角标 */
  initMessageBadge() {
    return syncMessageBadge().then((count) => {
      this.globalData.unreadCount = count;
      return count;
    });
  },
});
