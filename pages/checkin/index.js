// pages/checkin/index.js
// 每日签到：当月签到日历 + 连续奖励条 + 签到成功弹层，数据全部走 api 层（Mock）
import { request } from '../../api/http.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
import { toast, toastError, vibrate } from '../../utils/toast.js';

/** 星期表头：接口 firstWeekday 以「周一」为一周起点，表头必须同为周一开头才能对齐 */
const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

const pad2 = (n) => String(n).padStart(2, '0');
const monthKey = (year, month) => `${year}-${pad2(month)}`;

Page({
  data: {
    loading: true,
    error: false,
    // 日历
    weekdays: WEEKDAYS,
    cells: [],
    year: 0,
    month: 0,
    monthKey: '',
    monthText: '',
    canPrev: true,
    canNext: false,
    // 签到状态
    todaySigned: false,
    consecutiveDays: 0,
    monthSigned: 0,
    totalSigned: 0,
    todayReward: 0,
    totalPoints: 0,
    // 签到按钮文案与置灰状态（WXML 不拼接字符串）
    signBtnText: '',
    signBtnDisabled: false,
    signing: false,
    // 7 天奖励条
    rewards: [],
    // 签到成功弹层
    showReward: false,
    rewardPoints: 0,
    rewardDays: 0,
    rewardIsBig: false,
  },

  onLoad() {
    this.loadCheckin();
    this.loadPoints();
  },

  onShow() {
    // 从其它页面返回时（如积分中心）同步一次今日签到态与积分
    if (this.loaded) {
      this.loadCheckin(this.data.monthKey, true);
      this.loadPoints();
    }
  },

  onPullDownRefresh() {
    Promise.all([this.loadCheckin(this.data.monthKey, true), this.loadPoints()]).then(() => wx.stopPullDownRefresh());
  },

  // ---------------------------------------------------------------- 数据加载
  /** 拉取某月签到信息；month 形如 'YYYY-MM'，不传则默认当月；silent 为 true 时不显示骨架屏（用于签到后回刷） */
  async loadCheckin(month, silent) {
    if (!silent) this.setData({ loading: true, error: false });
    const data = month ? { month } : {};
    try {
      const res = await request({ url: '/checkin/info', data });
      const now = new Date();
      // 只有早于当前月的月份才允许向后翻，未来月份禁止
      const canNext = res.year < now.getFullYear() || (res.year === now.getFullYear() && res.month < now.getMonth() + 1);
      this.loaded = true;
      this.setData({
        loading: false,
        weekdays: WEEKDAYS,
        cells: this.buildCells(res.days, res.firstWeekday),
        year: res.year,
        month: res.month,
        monthKey: monthKey(res.year, res.month),
        monthText: `${res.year} 年 ${res.month} 月`,
        canPrev: res.year > now.getFullYear() - 5,
        canNext,
        todaySigned: !!res.todaySigned,
        consecutiveDays: res.consecutiveDays,
        monthSigned: res.monthSigned,
        totalSigned: res.totalSigned,
        todayReward: res.todayReward,
        rewards: (res.rewards || []).map((r) => ({ ...r, isBig: r.day === 7 })),
      });
      this.updateSignButton(!!res.todaySigned, res.todayReward);
    } catch (err) {
      if (!silent) this.setData({ loading: false, error: true });
      toastError((err && err.message) || '签到信息加载失败');
    }
  },

  /** 单独拉积分概览，用于签到后同步 totalPoints */
  async loadPoints() {
    try {
      const info = await request({ url: '/points/info' });
      // 按钮文案由 loadCheckin 统一维护，这里只同步积分与签到态，避免并发时序把奖励数覆盖成 0
      this.setData({ totalPoints: info.points, todaySigned: !!info.todaySigned });
    } catch (err) {
      /* 静默失败：积分展示失败不影响签到主流程 */
    }
  },

  /** 首行前补 firstWeekday 个空格子，并给每个日期算好状态 class */
  buildCells(days, firstWeekday) {
    const cells = [];
    for (let i = 0; i < firstWeekday; i += 1) {
      cells.push({ key: `blank-${i}`, empty: true });
    }
    (days || []).forEach((d) => {
      cells.push({
        key: d.date,
        empty: false,
        day: d.day,
        date: d.date,
        signed: d.signed,
        isToday: d.isToday,
        isFuture: d.isFuture,
        cls: this.cellClass(d),
      });
    });
    return cells;
  },

  /** 日历格子状态：今日 > 已签 > 未来 > 过去未签 */
  cellClass(d) {
    if (d.isToday) return d.signed ? 'cell today signed' : 'cell today';
    if (d.signed) return 'cell signed';
    if (d.isFuture) return 'cell future';
    return 'cell';
  },

  /** 签到按钮文案 / 置灰在 JS 里算好，WXML 直接渲染 */
  updateSignButton(todaySigned, todayReward) {
    this.setData({
      signBtnDisabled: !!todaySigned,
      signBtnText: todaySigned ? '今日已签到 ✓' : `立即签到 +${todayReward} 积分`,
    });
  },

  // ---------------------------------------------------------------- 翻月
  handlePrevMonth() {
    if (!this.data.canPrev) return;
    this.changeMonth(-1);
  },

  handleNextMonth() {
    if (!this.data.canNext) return;
    this.changeMonth(1);
  },

  changeMonth(delta) {
    const d = new Date(this.data.year, this.data.month - 1 + delta, 1);
    this.loadCheckin(monthKey(d.getFullYear(), d.getMonth() + 1));
  },

  // ---------------------------------------------------------------- 签到
  /** 点击日历格子：今天未签则签到，已签给提示，未来/过去未签不可点 */
  handleDayTap(e) {
    const { today, signed, future } = e.currentTarget.dataset;
    if (future) return;
    if (today && !signed) {
      this.handleCheckin();
      return;
    }
    if (signed) toast('这天已经签到啦');
  },

  async handleCheckin() {
    if (this.data.todaySigned || this.data.signing) return;
    this.setData({ signing: true });
    try {
      const res = await request({ url: '/checkin/do', method: 'POST' });
      vibrate();
      this.setData({
        showReward: true,
        rewardPoints: res.points,
        rewardDays: res.consecutiveDays,
        rewardIsBig: !!res.isBigReward,
        totalPoints: res.totalPoints,
        todaySigned: true,
      });
      this.updateSignButton(true, this.data.todayReward);
      // 刷新日历（已签标记）与连续天数、奖励条；静默刷新避免弹层背后闪骨架屏
      await this.loadCheckin(this.data.monthKey, true);
    } catch (err) {
      // 重复签到（code 400）等错误统一提示，并回拉最新状态
      toastError((err && err.message) || '签到失败');
      this.loadCheckin(this.data.monthKey, true);
    } finally {
      this.setData({ signing: false });
    }
  },

  /** 关闭弹层：刷新一次积分，保证与积分中心一致 */
  handleCloseReward() {
    this.setData({ showReward: false });
    this.loadPoints();
  },

  /** 阻止弹层内部点击穿透到遮罩 */
  noop() {},

  handleRetry() {
    this.loadCheckin(this.data.monthKey);
    this.loadPoints();
  },
});
