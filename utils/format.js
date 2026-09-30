// 金额与时间格式化工具

// 金额格式化为 ¥xx.xx（数字类型输入）
export const formatPrice = (n) => {
  const num = Number(n) || 0
  return '¥' + num.toFixed(2)
}

// 仅数字部分（用于大号价格展示）
export const priceText = (n) => {
  const num = Number(n) || 0
  return num.toFixed(2)
}

// 相对时间：x分钟前 / x小时前 / x天前 / x个月前，超过一年显示日期
export const formatRelative = (ts) => {
  const time = Number(ts)
  if (!time) return ''
  const diff = Date.now() - time
  if (diff < 0) return formatTime(ts)
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return min + '分钟前'
  const hour = Math.floor(min / 60)
  if (hour < 24) return hour + '小时前'
  const day = Math.floor(hour / 24)
  if (day < 30) return day + '天前'
  const month = Math.floor(day / 30)
  if (month < 12) return month + '个月前'
  return formatTime(ts)
}

// 完整时间 YYYY-MM-DD HH:mm
export const formatTime = (ts) => {
  const time = Number(ts)
  if (!time) return ''
  const d = new Date(time)
  const pad = (n) => (n < 10 ? '0' + n : '' + n)
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
    ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

// 完整日期 YYYY-MM-DD
export const formatDate = (ts) => {
  const time = Number(ts)
  if (!time) return ''
  const d = new Date(time)
  const pad = (n) => (n < 10 ? '0' + n : '' + n)
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

// 订单号脱敏展示（保留前4后4）
export const maskOrderNo = (no) => {
  if (!no) return ''
  const s = String(no)
  if (s.length <= 8) return s
  return s.slice(0, 4) + '****' + s.slice(-4)
}
