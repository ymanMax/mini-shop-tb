// 消息通知：15+ 条，分布各类型，3 条未读
// type: 1系统 2订单 3促销
const now = Date.now()
const H = 3600 * 1000
const D = 24 * H

const msg = (id, type, title, content, isRead, createTime, relatedId) => ({
  id, type, title, content, isRead, createTime, relatedId
})

export const initialMessages = [
  // 订单消息
  msg('m1', 2, '订单已发货', '您的订单 o5 已发货，顺丰速运正在配送中，请耐心等待。', false, now - 2 * H, 'o5'),
  msg('m2', 2, '订单送达提醒', '您的订单 o7 已到达驿站，请及时取件。', false, now - 5 * H, 'o7'),
  msg('m3', 2, '订单支付成功', '您的订单支付成功，商家正在为您打包。', true, now - 1 * D, 'o1'),
  msg('m4', 2, '确认收货提醒', '订单 o8 已完成，记得对商品进行评价哦。', true, now - 4 * D, 'o8'),
  msg('m5', 2, '订单已取消', '您的订单 o12 已取消，如非本人操作请联系客服。', true, now - 8 * D, 'o12'),
  // 促销消息
  msg('m6', 3, '限时抢购开始啦', '10:00 场限时抢购已开始，烧饼低至 5.9 元，先到先得！', false, now - 3 * H, 'seckill'),
  msg('m7', 3, '优惠券到期提醒', '您的「满30减5」券将于 24 小时后过期，抓紧使用~', true, now - 6 * H, 'coupon'),
  msg('m8', 3, '领券中心上新', '新人专属无门槛券已到账，全场通用无限制。', true, now - 2 * D, 'coupon'),
  msg('m9', 3, '限时特惠', '今日特价原味烧饼 1 斤装仅需 6.9 元，亏本冲量！', true, now - 3 * D, 'seckill'),
  msg('m10', 3, '连签奖励翻倍', '连续签到 7 天可获 50 积分大奖，坚持就是胜利！', true, now - 4 * D, 'checkin'),
  // 系统消息
  msg('m11', 1, '欢迎来到烧饼商品', '欢迎注册烧饼商品小程序，现烤烧饼每天新鲜出炉！', true, now - 30 * D),
  msg('m12', 1, '版本更新通知', 'V2.0 版本上线：新增限时抢购、优惠券、积分签到功能。', true, now - 5 * D),
  msg('m13', 1, '售后保障说明', '所有商品支持 7 天无理由退货，坏果包赔。', true, now - 10 * D),
  msg('m14', 1, '收货地址变更', '您的默认收货地址已更新。', true, now - 6 * D),
  msg('m15', 1, '积分到账通知', '您的评价获得 20 积分奖励，可在积分中心兑换好礼。', true, now - 6 * D, 'points'),
  msg('m16', 1, '配送说明', '所有订单顺丰速运发货，免运费。', true, now - 12 * D)
]
