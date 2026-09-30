// 消息通知：15+ 条，3 条未读，分布 系统/订单/促销
// type: 1系统 / 2订单 / 3促销
const day = 24 * 3600 * 1000
const hour = 3600 * 1000
const now = Date.now()

export const seedMessages = [
  // 促销（3 条，1 未读）
  { id: 1, type: 3, title: '限时抢购开场啦！', content: '10:00 场限时抢购已开始，芝麻烧饼低至 9.9 元，手慢无！', isRead: false, createTime: now - 2 * hour, relatedId: 'seckill' },
  { id: 2, type: 3, title: '新人专享券已到账', content: '您领取的「无门槛10元」券已放入我的优惠券，7天内有效。', isRead: false, createTime: now - 5 * hour, relatedId: 'coupon' },
  { id: 3, type: 3, title: '中秋糕点礼盒提前订', content: '中秋礼盒8折起，下单送手提袋，送礼首选。', isRead: true, createTime: now - 1 * day, relatedId: 'coupon' },
  { id: 4, type: 3, title: '每日10点秒杀', content: '每天10点整点开抢，整箱烧饼低至5折，记得定闹钟~', isRead: true, createTime: now - 2 * day, relatedId: 'seckill' },
  { id: 5, type: 3, title: '积分兑换上新', content: '800积分可免费兑换老式芝麻大烧饼，快来积分中心看看！', isRead: true, createTime: now - 3 * day, relatedId: 'points' },

  // 订单（6 条，1 未读）
  { id: 6, type: 2, title: '订单已发货', content: '您的订单「梅干菜扣肉烧饼」已由顺丰速运揽收，预计2天送达。', isRead: false, createTime: now - 6 * hour, relatedId: 10005 },
  { id: 7, type: 2, title: '支付成功', content: '订单「红烧牛肉馅烧饼」支付成功，商家正在备货。', isRead: true, createTime: now - 1 * day, relatedId: 10004 },
  { id: 8, type: 2, title: '包裹签收', content: '您的订单「千层油酥烧饼」已签收，感谢购买，欢迎评价！', isRead: true, createTime: now - 4 * day, relatedId: 10009 },
  { id: 9, type: 2, title: '发货提醒', content: '您的订单「烧饼全家福礼盒」已发货，顺丰单号 SF1023456789。', isRead: true, createTime: now - 2 * day, relatedId: 10003 },
  { id: 10, type: 2, title: '待付款提醒', content: '订单「芋泥麻薯软欧包」还未支付，30分钟内支付可锁定库存。', isRead: true, createTime: now - 18 * hour, relatedId: 10002 },
  { id: 11, type: 2, title: '评价得积分', content: '您有3笔已完成订单待评价，每条评价可得20积分。', isRead: true, createTime: now - 5 * day, relatedId: 10010 },

  // 系统（6 条，1 未读）
  { id: 12, type: 1, title: '签到成功', content: '今日签到成功，+5积分！连续签到3天，明天可领+10积分。', isRead: false, createTime: now - 3 * hour, relatedId: 'checkin' },
  { id: 13, type: 1, title: '会员等级提升', content: '恭喜您升级为黄金会员，专享专属优惠与优先发货。', isRead: true, createTime: now - 6 * day, relatedId: 'points' },
  { id: 14, type: 1, title: '券即将过期', content: '您的「满50减10」券将于24小时后过期，尽快使用哦。', isRead: true, createTime: now - 8 * hour, relatedId: 'coupon' },
  { id: 15, type: 1, title: '系统维护通知', content: '平台将于本周日 23:00-次日 02:00 进行系统维护，期间下单可能延迟。', isRead: true, createTime: now - 3 * day, relatedId: '' },
  { id: 16, type: 1, title: '收货地址更新', content: '您的收货信息已更新，如非本人操作请及时联系客服。', isRead: true, createTime: now - 7 * day, relatedId: '' },
  { id: 17, type: 1, title: '欢迎来到烧饼工坊', content: '感谢注册！新人专享无门槛10元券已发放，祝您购物愉快。', isRead: true, createTime: now - 10 * day, relatedId: 'coupon' },
  { id: 18, type: 1, title: '积分过期提醒', content: '您有100积分将于月底过期，请及时使用。', isRead: true, createTime: now - 2 * day, relatedId: 'points' }
]
