/**
 * 积分：初始 680 积分、16 条明细与兑换专区
 * 由 Mock 数据体系统一维护，字段结构与需求文档保持一致
 */
export const initialPoints = 680

// hoursAgo 为相对当前时间的小时数，水合时换算成 createTime
export const pointRecords = [
  {
    "source": "购物",
    "title": "订单 20260912001 消费返积分",
    "points": 128,
    "hoursAgo": 420
  },
  {
    "source": "签到",
    "title": "每日签到奖励",
    "points": 5,
    "hoursAgo": 396
  },
  {
    "source": "评价",
    "title": "评价商品「老式芝麻大烧饼」",
    "points": 20,
    "hoursAgo": 380
  },
  {
    "source": "购物",
    "title": "订单 20260915002 消费返积分",
    "points": 86,
    "hoursAgo": 340
  },
  {
    "source": "签到",
    "title": "每日签到奖励",
    "points": 5,
    "hoursAgo": 320
  },
  {
    "source": "购物",
    "title": "订单 20260918003 消费返积分",
    "points": 45,
    "hoursAgo": 288
  },
  {
    "source": "评价",
    "title": "评价商品「雪媚娘蛋黄酥」",
    "points": 20,
    "hoursAgo": 260
  },
  {
    "source": "签到",
    "title": "每日签到奖励",
    "points": 5,
    "hoursAgo": 244
  },
  {
    "source": "兑换",
    "title": "兑换「满 30 减 5 券」",
    "points": -100,
    "hoursAgo": 200
  },
  {
    "source": "购物",
    "title": "订单 20260922004 消费返积分",
    "points": 156,
    "hoursAgo": 168
  },
  {
    "source": "签到",
    "title": "每日签到奖励",
    "points": 5,
    "hoursAgo": 140
  },
  {
    "source": "评价",
    "title": "评价商品「宫廷桃酥」",
    "points": 20,
    "hoursAgo": 116
  },
  {
    "source": "购物",
    "title": "订单 20260925005 消费返积分",
    "points": 210,
    "hoursAgo": 90
  },
  {
    "source": "签到",
    "title": "连续签到第 3 天奖励",
    "points": 5,
    "hoursAgo": 68
  },
  {
    "source": "购物",
    "title": "订单 20260928006 消费返积分",
    "points": 65,
    "hoursAgo": 40
  },
  {
    "source": "签到",
    "title": "每日签到奖励",
    "points": 5,
    "hoursAgo": 20
  }
]

export const pointGoods = [
  {
    "id": 7001,
    "name": "满 30 减 5 券",
    "desc": "全场通用，有效期 7 天",
    "points": 100,
    "icon": "🎫",
    "templateId": 6001
  },
  {
    "id": 7002,
    "name": "满 59 减 10 券",
    "desc": "全场通用，有效期 7 天",
    "points": 200,
    "icon": "🎟️",
    "templateId": 6002
  },
  {
    "id": 7003,
    "name": "满 99 减 25 券",
    "desc": "全场通用，有效期 15 天",
    "points": 500,
    "icon": "🎁",
    "templateId": 6003
  },
  {
    "id": 7004,
    "name": "指定商品免费兑换",
    "desc": "经典芝麻烧饼 5 个装 1 份",
    "points": 800,
    "icon": "🥯",
    "templateId": 0
  },
  {
    "id": 7005,
    "name": "无门槛 5 元券",
    "desc": "无使用门槛，有效期 3 天",
    "points": 300,
    "icon": "💰",
    "templateId": 0
  },
  {
    "id": 7006,
    "name": "8.8 折券",
    "desc": "订单满 50 元可用",
    "points": 350,
    "icon": "🏷️",
    "templateId": 6006
  }
]

export default pointGoods
