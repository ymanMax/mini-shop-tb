// pages/checkin/index.js —— 每日签到
import { get, post } from '../../api/http.js'
import { success, loading, hideLoading } from '../../utils/toast.js'

Page({
  data: {
    signedDays: [],
    streak: 0,
    streakRewards: [],
    currentYear: 0,
    currentMonth: 0,
    calendarDays: [],
    todaySigned: false,
    showSuccess: false,
    reward: 0
  },

  onLoad() {
    const now = new Date()
    this.setData({
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth()
    })
    this.loadCheckin()
  },

  async loadCheckin() {
    const res = await get('/checkin/info')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTs = today.getTime()
    this.setData({
      signedDays: res.signedDays,
      streak: res.streak,
      streakRewards: res.streakRewards,
      todaySigned: res.signedDays.includes(todayTs)
    })
    this.buildCalendar()
  },

  buildCalendar() {
    const { currentYear, currentMonth, signedDays } = this.data
    const firstDay = new Date(currentYear, currentMonth, 1)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const weekDay = firstDay.getDay() // 0=周日
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTs = today.getTime()

    const days = []
    // 前置空
    for (let i = 0; i < weekDay; i++) {
      days.push({ empty: true })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const ts = new Date(currentYear, currentMonth, d).getTime()
      days.push({
        day: d,
        ts,
        signed: signedDays.includes(ts),
        isToday: ts === todayTs,
        future: ts > todayTs
      })
    }
    this.setData({ calendarDays: days })
  },

  // 翻月
  prevMonth() {
    let { currentYear, currentMonth } = this.data
    currentMonth--
    if (currentMonth < 0) {
      currentMonth = 11
      currentYear--
    }
    this.setData({ currentYear, currentMonth })
    this.buildCalendar()
  },
  nextMonth() {
    let { currentYear, currentMonth } = this.data
    currentMonth++
    if (currentMonth > 11) {
      currentMonth = 0
      currentYear++
    }
    this.setData({ currentYear, currentMonth })
    this.buildCalendar()
  },

  async handleCheckin() {
    if (this.data.todaySigned) return
    loading('签到中...')
    const res = await post('/checkin/do')
    hideLoading()
    this.setData({
      todaySigned: true,
      showSuccess: true,
      reward: res.reward,
      streak: res.streak
    })
    success(`签到成功 +${res.reward}积分`)
    this.loadCheckin()
  },

  closeSuccess() {
    this.setData({ showSuccess: false })
  }
})
