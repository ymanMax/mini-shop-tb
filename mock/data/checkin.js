// 每日签到 Mock 数据
// 用户连签 3 天，当月已签 8 天

const now = new Date()
const year = now.getFullYear()
const month = now.getMonth() // 0-based

// 当月已签日期（8 天）
const signedDays = [1, 3, 5, 8, 12, 15, 20, 25].map(d => {
  return new Date(year, month, d).getTime()
})

// 连续签到天数
const streak = 3

// 连签奖励梯度
const streakRewards = [
  { day: 1, points: 5 },
  { day: 2, points: 5 },
  { day: 3, points: 10 },
  { day: 4, points: 10 },
  { day: 5, points: 15 },
  { day: 6, points: 20 },
  { day: 7, points: 50 }
]

module.exports = { signedDays, streak, streakRewards }
