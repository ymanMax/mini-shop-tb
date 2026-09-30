/*
 * 授权页
 * 后端未启动，不做真实换取 token；授权后直接写入 Mock 登录态。
 * 该账号非企业账号，无法完成真实微信授权，故这里只演示授权流程本身。
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
    // 授权项说明，让页面有真实信息量
    scopes: [
      { icon: '👤', name: '用户信息', desc: '用于展示昵称与头像', required: true },
      { icon: '📍', name: '收货地址', desc: '用于下单时填写收货信息', required: false },
      { icon: '📷', name: '相册权限', desc: '用于评价时上传晒图', required: false },
    ],
    authorized: false,
    currentUser: {},
  },

  onLoad() {
    const currentUser = wx.getStorageSync('userInfo') || {};
    this.setData({ currentUser, authorized: !!currentUser.id });
  },

  handleGetUserInfo() {
    const current = wx.getStorageSync('userInfo') || {};
    const userInfo = {
      ...MOCK_USER,
      ...current,
      // 已存在的头像优先，否则用 Mock 默认头像
      avatar: current.avatar || MOCK_USER.avatar,
    };
    wx.setStorageSync('userInfo', userInfo);

    const app = getApp();
    if (app && app.globalData) app.globalData.userInfo = userInfo;

    this.setData({ authorized: true, currentUser: userInfo });
    toastSuccess('授权成功');
    setTimeout(() => {
      wx.navigateBack({ delta: 1, fail: () => wx.switchTab({ url: '/pages/user/index' }) });
    }, 700);
  },

  handleBack() {
    wx.navigateBack({ delta: 1, fail: () => wx.switchTab({ url: '/pages/index/index' }) });
  },

  /** 头像加载失败回退到本地默认头像，避免灰色裂图 */
  handleAvatarError() {
    this.setData({ 'currentUser.avatar': MOCK_USER.avatar });
  },
});
