// 消息通知 Mock 数据
// 15+ 条，分布各类型，3 条未读
// type: 1系统 / 2订单 / 3促销

const messages = [
  { id: 'm1', type: 2, title: '订单发货通知', content: '您的订单 #20260926091522005 已发货，顺丰速运正在为您配送', isRead: false, createTime: Date.now() - 3600 * 1000 * 2, relatedId: 'o5' },
  { id: 'm2', type: 3, title: '限时抢购提醒', content: '今晚20:00场抢购开始，老式五仁大烧饼仅需9.9元', isRead: false, createTime: Date.now() - 3600 * 1000 * 5, relatedId: '' },
  { id: 'm3', type: 1, title: '系统通知', content: '烧饼商城更新至V2.0版本，新增抢购、优惠券、积分功能', isRead: false, createTime: Date.now() - 3600 * 1000 * 26, relatedId: '' },
  { id: 'm4', type: 2, title: '订单支付成功', content: '您的订单 #20260925164509007 支付成功，商家正在备货', isRead: true, createTime: Date.now() - 3600 * 1000 * 50, relatedId: 'o7' },
  { id: 'm5', type: 3, title: '优惠券到账', content: '您领取的满99减15券已到账，有效期7天', isRead: true, createTime: Date.now() - 3600 * 1000 * 50, relatedId: '' },
  { id: 'm6', type: 1, title: '签到提醒', content: '今日还未签到，签到可得5积分，连续签到7天得50积分大奖', isRead: true, createTime: Date.now() - 3600 * 1000 * 74, relatedId: '' },
  { id: 'm7', type: 2, title: '订单签收提醒', content: '您的订单 #20260920101122009 已签收，欢迎评价', isRead: true, createTime: Date.now() - 3600 * 1000 * 100, relatedId: 'o9' },
  { id: 'm8', type: 3, title: '中秋礼盒特惠', content: '中秋礼盒限时8折，满199减25，送礼佳品', isRead: true, createTime: Date.now() - 3600 * 1000 * 122, relatedId: '' },
  { id: 'm9', type: 1, title: '售后通知', content: '您的售后工单已处理完成，退款已到账', isRead: true, createTime: Date.now() - 3600 * 1000 * 150, relatedId: '' },
  { id: 'm10', type: 2, title: '订单取消提醒', content: '您的订单 #20260922201508013 已取消', isRead: true, createTime: Date.now() - 3600 * 1000 * 200, relatedId: 'o13' },
  { id: 'm11', type: 3, title: '新品上架', content: '藤椒鸡肉烧饼新品上市，尝鲜价16.9元', isRead: true, createTime: Date.now() - 3600 * 1000 * 250, relatedId: '' },
  { id: 'm12', type: 1, title: '积分到账', content: '您的订单评价获得20积分，当前积分680', isRead: true, createTime: Date.now() - 3600 * 1000 * 260, relatedId: '' },
  { id: 'm13', type: 2, title: '退款成功', content: '您的退款已原路退回，请注意查收', isRead: true, createTime: Date.now() - 3600 * 1000 * 300, relatedId: '' },
  { id: 'm14', type: 3, title: '限时秒杀', content: '原味烧饼尝鲜装秒杀价3.9元，每天10点/15点两场', isRead: true, createTime: Date.now() - 3600 * 1000 * 350, relatedId: '' },
  { id: 'm15', type: 1, title: '版本更新', content: '优化了购物车体验，新增左滑删除功能', isRead: true, createTime: Date.now() - 3600 * 1000 * 400, relatedId: '' }
]

module.exports = messages
