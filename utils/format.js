/**
 * 通用格式化工具
 * 金额统一以「元」为单位的数字存储，展示时再格式化，禁止字符串价格参与计算
 */

/** 补零 */
const pad = (n, len = 2) => String(n).padStart(len, '0');

/**
 * 金额格式化：数字 -> 保留两位小数的字符串
 * formatPrice(12) => '12.00'   formatPrice(12.5) => '12.50'
 */
export const formatPrice = (value) => {
  const num = Number(value);
  if (!isFinite(num)) return '0.00';
  return num.toFixed(2);
};

/**
 * 带符号金额：formatMoney(12) => '¥12.00'
 */
export const formatMoney = (value) => `¥${formatPrice(value)}`;

/**
 * 金额徽标：仅返回数字部分，配合 wxml 中的 ¥ 符号使用
 */
export const formatAmount = (value) => formatPrice(value);

/**
 * 价格拆分，用于「¥ 12.50」大小号混排
 * 返回 { integer: '12', decimal: '50' }
 */
export const splitPrice = (value) => {
  const [integer, decimal] = formatPrice(value).split('.');
  return { integer, decimal };
};

/**
 * 时间格式化
 * formatTime(ts)               => '2024-01-01 12:00:00'
 * formatTime(ts, 'YYYY-MM-DD') => '2024-01-01'
 */
export const formatTime = (value, pattern = 'YYYY-MM-DD HH:mm:ss') => {
  const date = value instanceof Date ? value : new Date(Number(value) || value);
  if (isNaN(date.getTime())) return '';
  const map = {
    YYYY: date.getFullYear(),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  };
  return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (key) => map[key]);
};

/**
 * 相对时间：'刚刚' / '5分钟前' / '3小时前' / '3天前' / '2024-01-01'
 */
export const fromNow = (value) => {
  const time = value instanceof Date ? value.getTime() : new Date(Number(value) || value).getTime();
  if (!time || isNaN(time)) return '';
  const diff = Date.now() - time;
  if (diff < 0) return formatTime(time, 'YYYY-MM-DD');
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < 30 * day) return `${Math.floor(diff / day)}天前`;
  return formatTime(time, 'YYYY-MM-DD');
};

/**
 * 大数字缩写：12345 -> '1.2万'
 */
export const formatSales = (value) => {
  const num = Number(value) || 0;
  if (num < 10000) return String(num);
  return `${(num / 10000).toFixed(1)}万`;
};

/**
 * 手机号脱敏：13812345678 -> 138****5678
 */
export const maskPhone = (phone) => {
  const str = String(phone || '');
  if (str.length < 7) return str;
  return `${str.slice(0, 3)}****${str.slice(-4)}`;
};

/** 数字保留两位小数的安全运算（避免浮点误差） */
export const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100;

/** 求和 */
export const sum = (list = [], iteratee = (v) => v) =>
  round2(list.reduce((total, item) => total + (Number(iteratee(item)) || 0), 0));

export default {
  formatPrice,
  formatMoney,
  formatAmount,
  splitPrice,
  formatTime,
  fromNow,
  formatSales,
  maskPhone,
  round2,
  sum,
};
