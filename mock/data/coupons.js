// 优惠券 Mock 数据
// 券模板：8-10 张（5 满减 + 2 折扣 + 1 无门槛）
// 用户初始持 4 张

const couponTemplates = [
  {
    id: 'c1',
    type: 'full', // 满减券
    amount: 5,
    threshold: 39,
    name: '满39减5',
    scope: '全场通用',
    validDays: 7,
    total: 1000,
    claimed: 600
  },
  {
    id: 'c2',
    type: 'full',
    amount: 15,
    threshold: 99,
    name: '满99减15',
    scope: '全场通用',
    validDays: 7,
    total: 500,
    claimed: 320
  },
  {
    id: 'c3',
    type: 'full',
    amount: 25,
    threshold: 199,
    name: '满199减25',
    scope: '糕点类专用',
    validDays: 7,
    total: 300,
    claimed: 180
  },
  {
    id: 'c4',
    type: 'full',
    amount: 10,
    threshold: 59,
    name: '满59减10',
    scope: '零食类专用',
    validDays: 7,
    total: 800,
    claimed: 450
  },
  {
    id: 'c5',
    type: 'full',
    amount: 8,
    threshold: 49,
    name: '满49减8',
    scope: '烧饼类专用',
    validDays: 7,
    total: 600,
    claimed: 300
  },
  {
    id: 'c6',
    type: 'discount', // 折扣券
    discount: 0.8, // 8折
    name: '糕点类8折',
    scope: '糕点类专用',
    validDays: 7,
    total: 400,
    claimed: 200
  },
  {
    id: 'c7',
    type: 'discount',
    discount: 0.85,
    name: '零食类85折',
    scope: '零食类专用',
    validDays: 7,
    total: 400,
    claimed: 150
  },
  {
    id: 'c8',
    type: 'none', // 无门槛券
    amount: 3,
    name: '无门槛3元券',
    scope: '全场通用',
    validDays: 7,
    total: 2000,
    claimed: 1500
  }
]

// 用户初始持有的优惠券（4 张）
const userCoupons = [
  {
    id: 'uc1',
    templateId: 'c1',
    type: 'full',
    amount: 5,
    threshold: 39,
    name: '满39减5',
    scope: '全场通用',
    status: 'unused', // unused / used / expired
    receiveTime: Date.now() - 2 * 86400 * 1000,
    expireTime: Date.now() + 5 * 86400 * 1000
  },
  {
    id: 'uc2',
    templateId: 'c2',
    type: 'full',
    amount: 15,
    threshold: 99,
    name: '满99减15',
    scope: '全场通用',
    status: 'unused',
    receiveTime: Date.now() - 1 * 86400 * 1000,
    expireTime: Date.now() + 6 * 86400 * 1000
  },
  {
    id: 'uc3',
    templateId: 'c4',
    type: 'full',
    amount: 10,
    threshold: 59,
    name: '满59减10',
    scope: '零食类专用',
    status: 'used',
    receiveTime: Date.now() - 5 * 86400 * 1000,
    useTime: Date.now() - 3 * 86400 * 1000,
    expireTime: Date.now() + 2 * 86400 * 1000
  },
  {
    id: 'uc4',
    templateId: 'c8',
    type: 'none',
    amount: 3,
    name: '无门槛3元券',
    scope: '全场通用',
    status: 'expired',
    receiveTime: Date.now() - 10 * 86400 * 1000,
    expireTime: Date.now() - 3 * 86400 * 1000
  }
]

module.exports = { couponTemplates, userCoupons }
