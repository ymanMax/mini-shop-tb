/**
 * 购物车角标与本地缓存读取工具
 *
 * 购物车数据由 mock 层持久化在 storage 的 cartList 下，
 * 这里只做「读取 + 角标同步」，写操作一律通过 api 层完成，保证跨页面一致。
 *
 * Mock 模式下直接以 mock 层的内存态为准：
 * 内存态在首次接口调用时水合，比 storage 更早可用，
 * 这样首页/分类/详情/我的的角标不会出现「购物车页有 4 件、角标却是 0」的不一致。
 */
import { request, USE_MOCK } from '../api/http.js';
import { store } from '../mock/index.js';

/** storage 键名，与 mock/index.js 中的 STORAGE_KEYS 保持一致 */
export const CART_STORAGE_KEY = 'cartList';

/** 购物车 Tab 在 tabBar 中的下标 */
const CART_TAB_INDEX = 2;

/** 读取购物车数组（Mock 模式取内存态，真实后端模式取本地缓存） */
export const getCartList = () => {
  if (USE_MOCK) {
    try {
      store.init();
      return store.cart || [];
    } catch (e) {
      /* 内存态不可用时退回 storage */
    }
  }
  try {
    const list = wx.getStorageSync(CART_STORAGE_KEY);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
};

/** 购物车有效商品总件数（用于角标） */
export const getCartCount = () => getCartList().filter((v) => !v.invalid).reduce((total, v) => total + (v.count || 0), 0);

/** 设置 tabBar 购物车角标 */
const setTabBarBadge = (count) => {
  if (count > 0) {
    wx.setTabBarBadge({
      index: CART_TAB_INDEX,
      text: count > 99 ? '99+' : String(count),
      fail: () => {},
    });
  } else {
    wx.removeTabBarBadge({ index: CART_TAB_INDEX, fail: () => {} });
  }
};

/**
 * 同步购物车角标，返回当前件数
 * 页面在 onShow 中调用即可保证首页 / 分类 / 详情 / 我的的角标实时更新
 */
export const syncCartBadge = () => {
  const count = getCartCount();
  setTabBarBadge(count);
  return count;
};

/**
 * 向 api 层查询购物车件数并同步角标
 * 对数据准确性要求更高的场景（如支付成功后）使用
 */
export const refreshCartBadge = () =>
  request({ url: '/cart/count' })
    .then((res) => {
      const count = (res && res.count) || 0;
      setTabBarBadge(count);
      return count;
    })
    .catch(() => syncCartBadge());

export default { getCartList, getCartCount, syncCartBadge, refreshCartBadge, CART_STORAGE_KEY };
