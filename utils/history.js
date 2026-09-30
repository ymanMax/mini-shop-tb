/**
 * 搜索历史工具
 *
 * 搜索历史是纯客户端状态（真实项目里也不会同步到服务端），
 * 因此直接读写 storage，不走 api 层。
 *
 * 规则：相同关键词去重并移到最前，最多保留 15 条
 */
const STORAGE_KEY = 'search_history';

/** 最多保留的条数 */
export const HISTORY_MAX = 15;

/** 首次进入时的种子数据，保证搜索页一打开就有内容 */
const DEFAULT_HISTORY = ['烧饼', '蛋黄酥', '桃酥', '无蔗糖', '水饺', '礼盒', '限时秒杀', '锅巴'];

const read = () => {
  try {
    const list = wx.getStorageSync(STORAGE_KEY);
    if (Array.isArray(list)) return list.filter((k) => typeof k === 'string' && k.trim());
  } catch (e) {
    /* 读取失败按空历史处理 */
  }
  return null;
};

const write = (list) => {
  try {
    wx.setStorageSync(STORAGE_KEY, list);
  } catch (e) {
    /* 忽略写入异常 */
  }
};

/** 读取搜索历史；首次访问时写入种子数据 */
export const getSearchHistory = () => {
  const list = read();
  if (list === null) {
    write(DEFAULT_HISTORY);
    return DEFAULT_HISTORY.slice();
  }
  return list;
};

/** 写入一条搜索历史：去重、移到最前、超出上限丢弃最早的 */
export const addSearchHistory = (keyword) => {
  const kw = String(keyword || '').trim();
  if (!kw) return getSearchHistory();
  const list = [kw, ...getSearchHistory().filter((item) => item !== kw)].slice(0, HISTORY_MAX);
  write(list);
  return list;
};

/** 删除单条搜索历史 */
export const removeSearchHistory = (keyword) => {
  const list = getSearchHistory().filter((item) => item !== keyword);
  write(list);
  return list;
};

/** 清空搜索历史 */
export const clearSearchHistory = () => {
  write([]);
  return [];
};

export default { getSearchHistory, addSearchHistory, removeSearchHistory, clearSearchHistory, HISTORY_MAX };
