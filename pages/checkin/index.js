// pages/checkin/index.js
import { request } from '../../api/http.js'
import { toast } from '../../utils/toast.js'

Page({
  data: {
    year: 0,
    month: 0,          // 0-based
    days: [],           // 日历格子 [{ day, signed, isToday, isFuture }]
    consecutiveDays: 0,
    monthSigned: [],
    lastSignDate: '',
    rewards: [],
    signed: false,
    showSuccess: false,
    reward: 0
  },

  onLoad() {
    this.loadState()
  },

  async loadState() {
    const res = await request({ url: '/checkin/state' })
    if (res.code === 200) {
      const d = res.data
      const now = new Date()
      this.setData({
        year: d.year || now.getFullYear(),
        month: d.month !== undefined ? d.month : now.getMonth(),
        consecutiveDays: d.consecutiveDays,
        monthSigned: d.monthSigned || [],
        lastSignDate: d.lastSignDate || '',
        rewards: d.rewards || [],
        signed: d.lastSignDate === this.todayStr()
      })
      this.buildCalendar()
    }
  },

  todayStr() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  },

  buildCalendar() {
    const { year, month, monthSigned } = this.data
    const firstDay = new Date(year, month, 1).getDay() // 0=周日
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const today = new Date()
    const todayDate = today.getDate()
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month

    const days = []
    // 前置空格
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: '', empty: true })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const signed = monthSigned.includes(d)
      const isToday = isCurrentMonth && d === todayDate
      const isFuture = isCurrentMonth && d > todayDate
      days.push({ day: d, signed, isToday, isFuture, empty: false })
    }
    this.setData({ days })
  },

  // 翻月
  prevMonth() {
    let { year, month } = this.data
    month--
    if (month < 0) { month = 11; year-- }
    this.setData({ year, month })
    this.buildCalendar()
  },
  nextMonth() {
    let { year, month } = this.data
    month++
    if (month > 11) { month = 0; year++ }
    this.setData({ year, month })
    this.buildCalendar()
  },

  // 签到
  async sign() {
    if (this.data.signed) {
      toast.info('今日已签到')
      return
    }
    const res = await request({ url: '/checkin/sign', method: 'POST' })
    if (res.code === 200) {
      this.setData({
        signed: true,
        showSuccess: true,
        reward: res.data.reward,
        consecutiveDays: res.data.consecutive
      })
      this.loadState()
    } else {
      toast.error(res.msg || '签到失败')
    }
  },

  closeSuccess() {
    this.setData({ showSuccess: false })
  }
})
