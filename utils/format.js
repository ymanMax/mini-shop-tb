// 金额与时间格式化

// ¥xx.xx（整数补 .00）
export const formatPrice = (n) => {
  const num = Number(n) || 0
  return '¥' + num.toFixed(2)
}

// 相对时间：刚刚 / x分钟前 / x小时前 / x天前 / x个月前
export const formatRelative = (ts) => {
  const diff = Date.now() - Number(ts)
  if (diff < 60 * 1000) return '刚刚'
  if (diff < 60 * 60 * 1000) return Math.floor(diff / 60000) + '分钟前'
  if (diff < 24 * 60 * 60 * 1000) return Math.floor(diff / 3600000) + '小时前'
  if (diff < 30 * 24 * 60 * 60 * 1000) return Math.floor(diff / 86400000) + '天前'
  if (diff < 365 * 24 * 60 * 60 * 1000) return Math.floor(diff / (30 * 86400000)) + '个月前'
  return formatDateTime(ts)
}

// 完整日期时间：2026-09-28 14:30
export const formatDateTime = (ts) => {
  const d = new Date(Number(ts))
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// 仅日期：2026-09-28
export const formatDate = (ts) => {
  const d = new Date(Number(ts))
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
