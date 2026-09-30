// 签到数据：用户连签 3 天（昨天及之前），当月已签 8 天，今日未签可签到
// storage 结构：{ consecutiveDays: 3, monthSigned: [日...], lastSignDate: 'YYYY-MM-DD' }
const now = new Date()
const year = now.getFullYear()
const month = now.getMonth() // 0-based
const today = now.getDate()
const yesterday = new Date(now.getTime() - 24 * 3600 * 1000).getDate()
const dayBefore = new Date(now.getTime() - 2 * 24 * 3600 * 1000).getDate()

// 当月已签日期（日）：最近连续 3 天（昨天及之前），共 8 天，今日未签
export const initialCheckin = {
  consecutiveDays: 3,
  monthSigned: [1, 2, 5, 6, 7, dayBefore, yesterday],
  lastSignDate: `${year}-${String(month + 1).padStart(2, '0')}-${String(yesterday).padStart(2, '0')}`,
  year,
  month
}

// 连签梯度奖励
export const checkinRewards = [
  { day: 1, points: 5 },
  { day: 2, points: 5 },
  { day: 3, points: 10 },
  { day: 4, points: 10 },
  { day: 5, points: 15 },
  { day: 6, points: 20 },
  { day: 7, points: 50 }
]
