// 优惠券系统：模板 + 用户持有
// 类型：cash 满减券 / discount 折扣券 / none 无门槛券

const day = 24 * 3600 * 1000
const now = Date.now()

// 券模板（10 张：6 满减 + 2 折扣 + 2 无门槛）
export const couponTemplates = [
  { id: 1, name: '满30减5', type: 'cash', value: 5, threshold: 30, scope: '全品类通用', validDays: 7, color: 'red', desc: '满30元可用' },
  { id: 2, name: '满50减10', type: 'cash', value: 10, threshold: 50, scope: '全品类通用', validDays: 7, color: 'red', desc: '满50元可用' },
  { id: 3, name: '满99减25', type: 'cash', value: 25, threshold: 99, scope: '全品类通用', validDays: 15, color: 'red', desc: '满99元可用' },
  { id: 4, name: '满20减3', type: 'cash', value: 3, threshold: 20, scope: '全品类通用', validDays: 7, color: 'red', desc: '满20元可用' },
  { id: 5, name: '满199减40', type: 'cash', value: 40, threshold: 199, scope: '礼品卡专用', validDays: 30, color: 'red', desc: '满199元可用' },
  { id: 6, name: '满129减20', type: 'cash', value: 20, threshold: 129, scope: '糕点类专用', validDays: 15, color: 'red', desc: '满129元可用' },
  { id: 7, name: '8.5折券', type: 'discount', value: 0.85, threshold: 50, scope: '全品类通用', validDays: 7, color: 'orange', desc: '满50元享8.5折' },
  { id: 8, name: '9折券', type: 'discount', value: 0.9, threshold: 30, scope: '全品类通用', validDays: 7, color: 'orange', desc: '满30元享9折' },
  { id: 9, name: '无门槛5元', type: 'none', value: 5, threshold: 0, scope: '全品类通用', validDays: 7, color: 'gold', desc: '无门槛' },
  { id: 10, name: '无门槛10元', type: 'none', value: 10, threshold: 0, scope: '新用户专享', validDays: 3, color: 'gold', desc: '无门槛·新人专享' }
]

// 用户初始持有 4 张：3 未使用 + 1 已过期
export const seedUserCoupons = [
  { id: 101, templateId: 1, status: 'unused', receiveTime: now - 2 * day, expireTime: now + 5 * day, usedTime: null },
  { id: 102, templateId: 2, status: 'unused', receiveTime: now - 1 * day, expireTime: now + 6 * day, usedTime: null },
  { id: 103, templateId: 7, status: 'unused', receiveTime: now - 3 * day, expireTime: now + 4 * day, usedTime: null },
  { id: 104, templateId: 9, status: 'expired', receiveTime: now - 10 * day, expireTime: now - 3 * day, usedTime: null }
]
