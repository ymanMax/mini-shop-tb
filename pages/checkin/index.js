// pages/checkin/index.js —— 每日签到
import { request } from '../../api/http.js'
import common from '../../behaviors/common.js'
import regeneratorRuntime from '../../lib/runtime/runtime.js'
import { toastSuccess } from '../../utils/toast.js'

Page({
  behaviors: [common],
  data: {
    grid: [],
    streak: 0,
    month: '',
    signedDays: [],
    currentYear: 0,
    currentMonth: 0,   // 0-based
    daysInMonth: 0,
    today: 0,
    isCurrentMonth: true,
    signedToday: false,
    showSuccess: false,
    reward: 0,
    calendarCells: []  // 预计算的日历格子
  },

  onLoad() {
    this.initCalendar()
    this.loadCheckin()
  },

  onShow() {
    this.loadCheckin()
  },

  initCalendar() {
    const now = new Date()
    this.setData({
      currentYear: now.getFullYear(),
      currentMonth: now.getMonth(),
      today: now.getDate(),
      isCurrentMonth: true
    })
  },

  // 构造日历格子：月初空白 + 日期
  buildCells() {
    const { currentYear, currentMonth, daysInMonth, signedDays, today, isCurrentMonth } = this.data
    const firstDay = new Date(currentYear, currentMonth, 1).getDay() // 0=周日
    const cells = []
    for (let i = 0; i < firstDay; i++) cells.push({ empty: true })
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({
        empty: false,
        day: d,
        signed: signedDays.includes(d),
        isToday: isCurrentMonth && d === today,
        future: isCurrentMonth && d > today
      })
    }
    this.setData({ calendarCells: cells })
  },

  async loadCheckin() {
    const info = await request({ url: '/checkin/info' })
    const now = new Date()
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const signedDays = info.month === monthStr ? info.signedDays : []
    this.setData({
      grid: info.grid || [],
      streak: info.streak,
      month: info.month,
      signedDays,
      signedToday: signedDays.includes(now.getDate())
    })
    this.buildCells()
  },

  prevMonth() {
    let { currentYear, currentMonth } = this.data
    currentMonth--
    if (currentMonth < 0) { currentMonth = 11; currentYear-- }
    const now = new Date()
    this.setData({
      currentYear, currentMonth,
      isCurrentMonth: currentYear === now.getFullYear() && currentMonth === now.getMonth()
    })
    this.buildCells()
  },
  nextMonth() {
    let { currentYear, currentMonth } = this.data
    currentMonth++
    if (currentMonth > 11) { currentMonth = 0; currentYear++ }
    const now = new Date()
    this.setData({
      currentYear, currentMonth,
      isCurrentMonth: currentYear === now.getFullYear() && currentMonth === now.getMonth()
    })
    this.buildCells()
  },

  async doCheckin() {
    if (this.data.signedToday) return
    const res = await request({ url: '/checkin/do', method: 'POST' })
    if (res.success) {
      this.setData({ showSuccess: true, reward: res.reward, streak: res.streak })
      toastSuccess(`签到成功 +${res.reward}积分`)
      this.loadCheckin()
    }
  },

  closeSuccess() {
    this.setData({ showSuccess: false })
  },

  goPoints() {
    wx.navigateTo({ url: '/pages/points/index' })
  }
})
