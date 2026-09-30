// 积分记录（15+ 条）
// type: 1购物 + 2签到 + 3评价 + 4兑换 -
const now = Date.now()
const D = 24 * 3600 * 1000

const rec = (id, points, type, source, time) => ({ id, points, type, source, time })

export const initialPointsRecords = [
  rec('p1', 680, 1, '账户初始积分', now - 30 * D),
  rec('p2', 34, 1, '购物下单（订单 o8）', now - 4 * D),
  rec('p3', 25, 1, '购物下单（订单 o9）', now - 5 * D),
  rec('p4', 41, 1, '购物下单（订单 o10）', now - 6 * D),
  rec('p5', 20, 3, '评价订单 o10 商品', now - 6 * D + 3600000),
  rec('p6', 19, 1, '购物下单（订单 o11）', now - 7 * D),
  rec('p7', 20, 3, '评价订单 o11 商品', now - 7 * D + 3600000),
  rec('p8', 5, 2, '每日签到', now - 1 * D),
  rec('p9', 5, 2, '每日签到', now - 2 * D),
  rec('p10', 10, 2, '每日签到（连签第3天）', now - 3 * D),
  rec('p11', 5, 2, '每日签到', now - 4 * D),
  rec('p12', 5, 2, '每日签到', now - 5 * D),
  rec('p13', 5, 2, '每日签到', now - 6 * D),
  rec('p14', 5, 2, '每日签到', now - 7 * D),
  rec('p15', 5, 2, '每日签到', now - 8 * D),
  rec('p16', 12, 1, '购物下单（订单 o5）', now - 2 * D),
  rec('p17', 8, 1, '购物下单（订单 o6）', now - 2 * D - 3600000)
]

// 积分兑换项
export const exchangeItems = [
  { id: 'ex1', points: 100, title: '满30减5券', desc: '满30元可用，全场通用', couponTemplateId: 'cp1' },
  { id: 'ex2', points: 200, title: '满50减10券', desc: '满50元可用，全场通用', couponTemplateId: 'cp2' },
  { id: 'ex3', points: 500, title: '满99减25券', desc: '满99元可用，全场通用', couponTemplateId: 'cp3' },
  { id: 'ex4', points: 800, title: '指定商品免费兑换', desc: '免费兑换芝麻酥烧饼1份', goodsId: 106 }
]
