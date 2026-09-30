/**
 * 优惠券：9 张模板（5 满减 + 2 折扣 + 2 无门槛）与用户初始持有的 4 张
 * 由 Mock 数据体系统一维护，字段结构与需求文档保持一致
 */
export const couponTemplates = [
  {
    "id": 6001,
    "type": "full",
    "title": "满 30 减 5",
    "amount": 5,
    "threshold": 30,
    "scope": "全场通用",
    "scopeType": "all",
    "categoryId": 0,
    "days": 7,
    "total": 1000,
    "claimed": 200,
    "description": "订单满 30 元可用"
  },
  {
    "id": 6002,
    "type": "full",
    "title": "满 59 减 10",
    "amount": 10,
    "threshold": 59,
    "scope": "全场通用",
    "scopeType": "all",
    "categoryId": 0,
    "days": 7,
    "total": 1000,
    "claimed": 260,
    "description": "订单满 59 元可用"
  },
  {
    "id": 6003,
    "type": "full",
    "title": "满 99 减 15",
    "amount": 15,
    "threshold": 99,
    "scope": "全场通用",
    "scopeType": "all",
    "categoryId": 0,
    "days": 15,
    "total": 1000,
    "claimed": 320,
    "description": "订单满 99 元可用"
  },
  {
    "id": 6004,
    "type": "full",
    "title": "满 159 减 25",
    "amount": 25,
    "threshold": 159,
    "scope": "仅限烧饼类",
    "scopeType": "category",
    "categoryId": 1,
    "days": 15,
    "total": 1000,
    "claimed": 380,
    "description": "订单满 159 元可用"
  },
  {
    "id": 6005,
    "type": "full",
    "title": "满 299 减 40",
    "amount": 40,
    "threshold": 299,
    "scope": "全场通用",
    "scopeType": "all",
    "categoryId": 0,
    "days": 30,
    "total": 1000,
    "claimed": 440,
    "description": "订单满 299 元可用"
  },
  {
    "id": 6006,
    "type": "discount",
    "title": "8.8 折券",
    "amount": 0.88,
    "threshold": 50,
    "scope": "全场通用",
    "scopeType": "all",
    "categoryId": 0,
    "days": 7,
    "total": 1000,
    "claimed": 500,
    "description": "订单满 50 元可用，最高可减 50 元"
  },
  {
    "id": 6007,
    "type": "discount",
    "title": "9.2 折券",
    "amount": 0.92,
    "threshold": 0,
    "scope": "仅限糕点类",
    "scopeType": "category",
    "categoryId": 2,
    "days": 10,
    "total": 1000,
    "claimed": 560,
    "description": "订单满 0 元可用，最高可减 50 元"
  },
  {
    "id": 6008,
    "type": "none",
    "title": "无门槛 3 元券",
    "amount": 3,
    "threshold": 0,
    "scope": "全场通用",
    "scopeType": "all",
    "categoryId": 0,
    "days": 3,
    "total": 1000,
    "claimed": 620,
    "description": "无使用门槛，全场通用"
  },
  {
    "id": 6009,
    "type": "none",
    "title": "无门槛 8 元券",
    "amount": 8,
    "threshold": 0,
    "scope": "全场通用",
    "scopeType": "all",
    "categoryId": 0,
    "days": 5,
    "total": 1000,
    "claimed": 680,
    "description": "无使用门槛，全场通用"
  }
]

// 用户初始持券：expireInHours 为相对当前时间的小时数（负数表示已过期）
export const initialCoupons = [
  {
    "templateId": 6001,
    "status": "unused",
    "expireInHours": 20
  },
  {
    "templateId": 6002,
    "status": "unused",
    "expireInHours": 144
  },
  {
    "templateId": 6006,
    "status": "used",
    "expireInHours": 72,
    "usedDaysAgo": 3
  },
  {
    "templateId": 6008,
    "status": "expired",
    "expireInHours": -48
  }
]

export default couponTemplates
