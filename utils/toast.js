/**
 * 统一 Toast / Loading / Modal 封装
 * 成功、失败、加载三种样式统一收口，避免各页面样式不一致
 */

/** 普通提示（无图标） */
export const toast = (title, duration = 1800) => {
  wx.showToast({ title, icon: 'none', duration, mask: false });
};

/** 成功提示 */
export const toastSuccess = (title = '操作成功', duration = 1500) => {
  wx.showToast({ title, icon: 'success', duration, mask: true });
};

/** 失败提示 */
export const toastError = (title = '操作失败', duration = 1800) => {
  wx.showToast({ title, icon: 'none', duration, mask: true });
};

/** 加载中 */
export const showLoading = (title = '加载中') => {
  wx.showLoading({ title, mask: true });
};

/** 关闭加载 */
export const hideLoading = () => {
  wx.hideLoading();
};

/**
 * Promise 化的 showModal
 * resolve(true) 表示用户点击确定
 */
export const confirm = ({
  title = '提示',
  content = '',
  confirmText = '确定',
  cancelText = '取消',
  confirmColor = '#eb4450',
} = {}) =>
  new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmText,
      cancelText,
      confirmColor,
      success: (res) => resolve(!!res.confirm),
      fail: () => resolve(false),
    });
  });

/** Promise 化的 showActionSheet，返回被点击的索引，取消返回 -1 */
export const actionSheet = (itemList = []) =>
  new Promise((resolve) => {
    wx.showActionSheet({
      itemList,
      success: (res) => resolve(res.tapIndex),
      fail: () => resolve(-1),
    });
  });

/** 轻震动反馈 */
export const vibrate = () => {
  wx.vibrateShort({ type: 'light', fail: () => {} });
};

export default {
  toast,
  toastSuccess,
  toastError,
  showLoading,
  hideLoading,
  confirm,
  actionSheet,
  vibrate,
};
