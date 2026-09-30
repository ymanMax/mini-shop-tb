// 每日签到：连签 3 天，当月（9月）已签 8 天，今日(9-30)未签
// 连签梯度：第1-7天 +5/+5/+10/+10/+15/+20/+50

export const checkinRewardGrid = [
  { day: 1, points: 5 },
  { day: 2, points: 5 },
  { day: 3, points: 10 },
  { day: 4, points: 10 },
  { day: 5, points: 15 },
  { day: 6, points: 20 },
  { day: 7, points: 50 }
]

// 当月已签日期（9 月），不含今日 30 号
export const seedCheckin = {
  streak: 3,
  month: '2026-09',
  signedDays: [1, 2, 3, 10, 11, 27, 28, 29],
  lastSignDate: '2026-09-29'
}
