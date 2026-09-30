// 积分体系：初始积分 680 + 15+ 条积分记录
// 来源：购物 / 签到 / 评价 / 兑换
const day = 24 * 3600 * 1000
const now = Date.now()

export const seedPoints = 680

// 积分记录（最新在前）
export const seedPointRecords = [
  { id: 1, change: -100, source: '兑换', desc: '兑换「满30减5」券', time: now - 2 * day },
  { id: 2, change: 20, source: '评价', desc: '评价商品「老式芝麻大烧饼」', time: now - 3 * day },
  { id: 3, change: 5, source: '签到', desc: '每日签到 +5', time: now - 1 * day },
  { id: 4, change: 128, source: '购物', desc: '订单消费 128 元', time: now - 4 * day },
  { id: 5, change: 20, source: '评价', desc: '评价商品「酥皮蛋黄酥」', time: now - 5 * day },
  { id: 6, change: 5, source: '签到', desc: '每日签到 +5', time: now - 5 * day },
  { id: 7, change: -200, source: '兑换', desc: '兑换「满50减10」券', time: now - 6 * day },
  { id: 8, change: 86, source: '购物', desc: '订单消费 86 元', time: now - 7 * day },
  { id: 9, change: 15, source: '签到', desc: '连签第5天 +15', time: now - 8 * day },
  { id: 10, change: 20, source: '评价', desc: '评价商品「现磨纯黄豆浆粉」', time: now - 9 * day },
  { id: 11, change: 5, source: '签到', desc: '每日签到 +5', time: now - 10 * day },
  { id: 12, change: 210, source: '购物', desc: '订单消费 210 元', time: now - 12 * day },
  { id: 13, change: 20, source: '评价', desc: '评价商品「牛肉干 内蒙古手撕风干」', time: now - 13 * day },
  { id: 14, change: 10, source: '签到', desc: '连签第3天 +10', time: now - 14 * day },
  { id: 15, change: 64, source: '购物', desc: '订单消费 64 元', time: now - 15 * day },
  { id: 16, change: 5, source: '签到', desc: '每日签到 +5', time: now - 16 * day },
  { id: 17, change: 150, source: '购物', desc: '订单消费 150 元', time: now - 18 * day }
]

// 积分兑换专区（4 项）
export const exchangeItems = [
  { id: 'ex1', name: '满30减5券', cost: 100, desc: '全品类通用 · 7天有效', type: 'cash', value: 5, threshold: 30, couponTemplateId: 1 },
  { id: 'ex2', name: '满50减10券', cost: 200, desc: '全品类通用 · 7天有效', type: 'cash', value: 10, threshold: 50, couponTemplateId: 2 },
  { id: 'ex3', name: '满99减25券', cost: 500, desc: '全品类通用 · 15天有效', type: 'cash', value: 25, threshold: 99, couponTemplateId: 3 },
  { id: 'ex4', name: '指定商品免费兑', cost: 800, desc: '老式芝麻大烧饼 1份', type: 'gift', value: 0, goodsId: 1001 }
]
