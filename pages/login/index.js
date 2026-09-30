/*
 * 登录页
 * 后端未启动，登录即写入 Mock 用户资料；游客本就可体验全部功能，
 * 因此这里不拦截任何流程，只做昵称 / 头像的同步。
 */
import { toastSuccess } from '../../utils/toast.js';

/** 与 app.js 的 MOCK_USER 保持一致 */
const MOCK_USER = {
  id: 10001,
  nickName: '烧饼爱好者',
  avatar: '/static/images/default-avatar.png',
  phone: '138****8888',
};

Page({
  data: {
    // 登录后可以做的事情，用于填充页面信息量
    benefits: [
      { icon: '📦', title: '同步订单', desc: '换设备也能查看历史订单与物流' },
      { icon: '❤️', title: '云端收藏', desc: '收藏的好物不怕丢' },
      { icon: '🎁', title: '专属优惠', desc: '会员价与优惠券优先领取' },
      { icon: '⭐', title: '评价积分', desc: '晒单评价得积分，可抵现' },
    ],
    currentUser: {},
  },

  onLoad() {
    this.setData({ currentUser: wx.getStorageSync('userInfo') || {} });
  },

  handleGetUserInfo(e) {
    const detail = (e && e.detail && e.detail.userInfo) || {};
    const userInfo = {
      ...MOCK_USER,
      // 微信授权返回的昵称头像优先，缺失时用 Mock 资料兜底
      nickName: detail.nickName || MOCK_USER.nickName,
      avatar: detail.avatarUrl || MOCK_USER.avatar,
      avatarUrl: detail.avatarUrl || MOCK_USER.avatar,
    };

    wx.setStorageSync('userInfo', userInfo);
    const app = getApp();
    if (app && app.globalData) app.globalData.userInfo = userInfo;

    toastSuccess('登录成功');
    setTimeout(() => {
      wx.navigateBack({ delta: 1, fail: () => wx.switchTab({ url: '/pages/user/index' }) });
    }, 600);
  },

  /** 不登录直接返回，游客模式同样可用 */
  handleSkip() {
    wx.navigateBack({ delta: 1, fail: () => wx.switchTab({ url: '/pages/index/index' }) });
  },
});
