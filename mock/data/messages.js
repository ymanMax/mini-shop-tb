/**
 * 消息：17 条，覆盖系统 / 订单 / 促销三种类型，其中 3 条未读
 * 由 Mock 数据体系统一维护，字段结构与需求文档保持一致
 */
export const messages = [
  {
    "id": 8001,
    "type": 3,
    "title": "限时抢购开抢提醒",
    "content": "20:00 场已开抢，经典芝麻烧饼 5 折起，数量有限先到先得",
    "isRead": false,
    "hoursAgo": 0.3,
    "relatedType": "seckill",
    "relatedId": 0
  },
  {
    "id": 8002,
    "type": 2,
    "title": "订单已发货",
    "content": "您的订单 20260928001 已由顺丰速运揽收，点击查看物流详情",
    "isRead": false,
    "hoursAgo": 1.5,
    "relatedType": "order",
    "relatedId": 0
  },
  {
    "id": 8003,
    "type": 3,
    "title": "您有一张券即将过期",
    "content": "「满 30 减 5」将于 24 小时后过期，记得尽快使用哦",
    "isRead": false,
    "hoursAgo": 3,
    "relatedType": "coupon",
    "relatedId": 0
  },
  {
    "id": 8004,
    "type": 1,
    "title": "系统维护完成通知",
    "content": "本次系统升级已完成，新增限时抢购、优惠券与积分商城功能，感谢您的支持",
    "isRead": true,
    "hoursAgo": 8,
    "relatedType": "none",
    "relatedId": 0
  },
  {
    "id": 8005,
    "type": 2,
    "title": "订单待付款提醒",
    "content": "您的订单 20260929002 尚未支付，请在 24 小时内完成支付",
    "isRead": true,
    "hoursAgo": 12,
    "relatedType": "order",
    "relatedId": 0
  },
  {
    "id": 8006,
    "type": 3,
    "title": "新品上市：肉松烧饼",
    "content": "咸香肉松满满，新品尝鲜价 27.9 元，前 100 名下单再减 3 元",
    "isRead": true,
    "hoursAgo": 20,
    "relatedType": "goods",
    "relatedId": 0
  },
  {
    "id": 8007,
    "type": 2,
    "title": "订单已签收",
    "content": "您的订单 20260925005 已签收，快来评价赚 20 积分吧",
    "isRead": true,
    "hoursAgo": 26,
    "relatedType": "order",
    "relatedId": 0
  },
  {
    "id": 8008,
    "type": 3,
    "title": "领券中心上新",
    "content": "满 159 减 25 券限量发放中，先到先得",
    "isRead": true,
    "hoursAgo": 32,
    "relatedType": "coupon",
    "relatedId": 0
  },
  {
    "id": 8009,
    "type": 1,
    "title": "积分规则更新",
    "content": "购物每 1 元累计 1 积分，评价再得 20 积分，积分可兑换优惠券",
    "isRead": true,
    "hoursAgo": 40,
    "relatedType": "points",
    "relatedId": 0
  },
  {
    "id": 8010,
    "type": 2,
    "title": "退款已到账",
    "content": "订单 20260920003 的退款 32.80 元已原路退回",
    "isRead": true,
    "hoursAgo": 52,
    "relatedType": "order",
    "relatedId": 0
  },
  {
    "id": 8011,
    "type": 3,
    "title": "连续签到有惊喜",
    "content": "连续签到第 7 天可得 50 积分大奖，别忘了每天来打卡",
    "isRead": true,
    "hoursAgo": 64,
    "relatedType": "checkin",
    "relatedId": 0
  },
  {
    "id": 8012,
    "type": 1,
    "title": "隐私政策更新",
    "content": "我们更新了隐私政策，请您查阅了解个人信息处理方式",
    "isRead": true,
    "hoursAgo": 76,
    "relatedType": "none",
    "relatedId": 0
  },
  {
    "id": 8013,
    "type": 2,
    "title": "订单已完成",
    "content": "订单 20260918003 已完成，感谢您的购买",
    "isRead": true,
    "hoursAgo": 90,
    "relatedType": "order",
    "relatedId": 0
  },
  {
    "id": 8014,
    "type": 3,
    "title": "中秋礼盒限时特惠",
    "content": "中秋团圆礼盒直降 70 元，送礼有面儿",
    "isRead": true,
    "hoursAgo": 110,
    "relatedType": "goods",
    "relatedId": 0
  },
  {
    "id": 8015,
    "type": 1,
    "title": "欢迎使用烧饼商品",
    "content": "老手艺现烤现发，一口回到小时候。新用户下单立减 5 元",
    "isRead": true,
    "hoursAgo": 140,
    "relatedType": "none",
    "relatedId": 0
  },
  {
    "id": 8016,
    "type": 2,
    "title": "订单已取消",
    "content": "订单 20260912001 已取消，如已支付将原路退回",
    "isRead": true,
    "hoursAgo": 168,
    "relatedType": "order",
    "relatedId": 0
  },
  {
    "id": 8017,
    "type": 3,
    "title": "会员日双倍积分",
    "content": "每月 8 日会员日，购物积分翻倍，别错过",
    "isRead": true,
    "hoursAgo": 200,
    "relatedType": "points",
    "relatedId": 0
  }
]

export default messages
