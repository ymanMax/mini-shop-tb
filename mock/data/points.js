// 积分 Mock 数据
// 用户初始积分 680，积分记录 15+ 条

const initialPoints = 680

// 积分记录
const pointsRecords = [
  { id: 'p1', type: 'earn', source: '购物', amount: 236, time: Date.now() - 3600 * 1000 * 5, orderNo: '20260925164509007' },
  { id: 'p2', type: 'earn', source: '每日签到', amount: 5, time: Date.now() - 3600 * 1000 * 26 },
  { id: 'p3', type: 'earn', source: '订单评价', amount: 20, time: Date.now() - 3600 * 1000 * 30 },
  { id: 'p4', type: 'earn', source: '购物', amount: 158, time: Date.now() - 3600 * 1000 * 50, orderNo: '20260920101122009' },
  { id: 'p5', type: 'earn', source: '每日签到', amount: 5, time: Date.now() - 3600 * 1000 * 50 },
  { id: 'p6', type: 'earn', source: '每日签到', amount: 10, time: Date.now() - 3600 * 1000 * 74 },
  { id: 'p7', type: 'earn', source: '购物', amount: 89, time: Date.now() - 3600 * 1000 * 100, orderNo: '20260918153044010' },
  { id: 'p8', type: 'earn', source: '订单评价', amount: 20, time: Date.now() - 3600 * 1000 * 100 },
  { id: 'p9', type: 'earn', source: '每日签到', amount: 5, time: Date.now() - 3600 * 1000 * 100 },
  { id: 'p10', type: 'earn', source: '每日签到', amount: 5, time: Date.now() - 3600 * 1000 * 122 },
  { id: 'p11', type: 'earn', source: '购物', amount: 32, time: Date.now() - 3600 * 1000 * 150, orderNo: '20260915092011011' },
  { id: 'p12', type: 'earn', source: '每日签到', amount: 10, time: Date.now() - 3600 * 1000 * 150 },
  { id: 'p13', type: 'spend', source: '积分兑换', amount: -100, time: Date.now() - 3600 * 1000 * 200, item: '满30减5券' },
  { id: 'p14', type: 'earn', source: '购物', amount: 268, time: Date.now() - 3600 * 1000 * 250, orderNo: '20260910145530012' },
  { id: 'p15', type: 'earn', source: '每日签到', amount: 5, time: Date.now() - 3600 * 1000 * 250 },
  { id: 'p16', type: 'earn', source: '订单评价', amount: 20, time: Date.now() - 3600 * 1000 * 260 }
]

// 积分兑换项
const exchangeItems = [
  { id: 'ex1', points: 100, name: '满30减5券', desc: '全场通用，7天有效', type: 'coupon', couponId: 'c1' },
  { id: 'ex2', points: 200, name: '满50减10券', desc: '全场通用，7天有效', type: 'coupon', couponId: 'c4' },
  { id: 'ex3', points: 500, name: '满99减25券', desc: '全场通用，7天有效', type: 'coupon', couponId: 'c2' },
  { id: 'ex4', points: 800, name: '指定商品免费兑换', desc: '老式五仁大烧饼1斤装', type: 'goods', goodsId: 1001 }
]

module.exports = { initialPoints, pointsRecords, exchangeItems }
