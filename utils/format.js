// 金额格式化：¥xx.xx（整数补 .00）
export function formatPrice(n) {
  const num = Number(n) || 0
  return '¥' + num.toFixed(2)
}

// 相对时间：x分钟前 / x小时前 / x天前
export function relativeTime(ts) {
  const now = Date.now()
  const diff = now - Number(ts)
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 30 * 24 * 3600 * 1000) return Math.floor(diff / 86400000) + '天前'
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 完整时间 YYYY-MM-DD HH:mm:ss
export function fullTime(ts) {
  const d = new Date(ts)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
