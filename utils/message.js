/**
 * 消息未读角标工具
 *
 * 未读数由 mock 层实时计算，这里只负责把它同步到 TabBar「我的」上。
 * TabBar 角标有 0 和 99+ 两种边界处理，失败时静默忽略（非 Tab 页调用会报错）。
 */
import { request } from '../api/http.js';

/** 「我的」在 tabBar 中的下标 */
const MESSAGE_TAB_INDEX = 3;

const setBadge = (count) => {
  if (count > 0) {
    wx.setTabBarBadge({
      index: MESSAGE_TAB_INDEX,
      text: count > 99 ? '99+' : String(count),
      fail: () => {},
    });
  } else {
    wx.removeTabBarBadge({ index: MESSAGE_TAB_INDEX, fail: () => {} });
  }
};

/**
 * 拉取未读数并同步到 TabBar，返回未读数
 * 页面在 onShow、标记已读之后调用
 */
export const syncMessageBadge = () =>
  request({ url: '/messages/unreadCount' })
    .then((res) => {
      const count = (res && res.count) || 0;
      setBadge(count);
      return count;
    })
    .catch(() => 0);

/** 直接把角标清零（进入消息页或「全部已读」后） */
export const clearMessageBadge = () => {
  setBadge(0);
  return Promise.resolve(0);
};

export default { syncMessageBadge, clearMessageBadge };
