// 优惠券模板（8-10 张：5 张满减 + 2 张折扣 + 1 张无门槛）
// type: 1满减券 2折扣券 3无门槛券
export const couponTemplates = [
  { id: 'cp1', type: 1, title: '满30减5', amount: 5, threshold: 30, discount: null, scope: '全场通用', validDays: 7, total: 200, received: 156 },
  { id: 'cp2', type: 1, title: '满50减10', amount: 10, threshold: 50, discount: null, scope: '全场通用', validDays: 7, total: 200, received: 180 },
  { id: 'cp3', type: 1, title: '满99减25', amount: 25, threshold: 99, discount: null, scope: '全场通用', validDays: 15, total: 100, received: 68 },
  { id: 'cp4', type: 1, title: '满20减3', amount: 3, threshold: 20, discount: null, scope: '烧饼类', validDays: 7, total: 300, received: 210 },
  { id: 'cp5', type: 1, title: '满69减15', amount: 15, threshold: 69, discount: null, scope: '糕点类', validDays: 10, total: 150, received: 92 },
  { id: 'cp6', type: 2, title: '8.5折券', amount: null, threshold: 0, discount: 0.85, scope: '零食类', validDays: 7, total: 200, received: 145 },
  { id: 'cp7', type: 2, title: '9折券', amount: null, threshold: 0, discount: 0.9, scope: '全场通用', validDays: 7, total: 300, received: 200 },
  { id: 'cp8', type: 3, title: '无门槛5元', amount: 5, threshold: 0, discount: null, scope: '全场通用', validDays: 3, total: 100, received: 100 }
]

// 用户初始持有的优惠券（4 张）
// userCoupon: { id, templateId, type, title, amount, threshold, discount, scope, validDays, status: 1未使用/2已使用/3已过期, receiveTime, expireTime, orderId? }
const now = Date.now()
const D = 24 * 3600 * 1000

export const initialUserCoupons = [
  { id: 'uc1', templateId: 'cp1', type: 1, title: '满30减5', amount: 5, threshold: 30, discount: null, scope: '全场通用', status: 1, receiveTime: now - 2 * D, expireTime: now + 5 * D },
  { id: 'uc2', templateId: 'cp2', type: 1, title: '满50减10', amount: 10, threshold: 50, discount: null, scope: '全场通用', status: 1, receiveTime: now - 1 * D, expireTime: now + 6 * D },
  { id: 'uc3', templateId: 'cp7', type: 2, title: '9折券', amount: null, threshold: 0, discount: 0.9, scope: '全场通用', status: 1, receiveTime: now - 3 * D, expireTime: now + 4 * D },
  { id: 'uc4', templateId: 'cp8', type: 3, title: '无门槛5元', amount: 5, threshold: 0, discount: null, scope: '全场通用', status: 2, receiveTime: now - 10 * D, expireTime: now - 3 * D, orderId: 'o8' }
]
