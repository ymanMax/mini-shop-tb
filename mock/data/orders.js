// 订单 Mock 数据：12+ 条，覆盖全部 6 种状态
// 状态：1待付款 / 2待发货 / 3配送中 / 4待收货 / 5已完成 / 6已取消
const goodsList = require('./goods.js')

function byId(id) {
  return goodsList.find(g => g.id === id)
}

// 构造订单商品条目
function item(goodsId, specText, price, count) {
  const g = byId(goodsId)
  return {
    goodsId,
    name: g.name,
    mainPic: g.mainPic,
    specText,
    price,
    count
  }
}

// 时间偏移（分钟）
function timeAgo(minutes) {
  return Date.now() - minutes * 60 * 1000
}

const addressBook = {
  beijing: { name: '王小明', phone: '138****8888', address: '北京市朝阳区望京街道阜通东大街6号院 3号楼 502室' },
  shanghai: { name: '李阿姨', phone: '139****6666', address: '上海市浦东新区张江高科技园区博云路2号 601室' },
  guangzhou: { name: '张建国', phone: '137****1234', address: '广州市天河区体育西路103号 维多利广场 B座 1208室' },
  hangzhou: { name: '陈晓', phone: '136****5555', address: '杭州市西湖区文三路478号 华星科技大厦 8层' }
}

// 按状态生成物流时间线
function buildTimeline(status, createTime) {
  const t = (offsetMin) => new Date(createTime + offsetMin * 60 * 1000).toLocaleString('zh-CN', { hour12: false })
  const steps = {
    1: [
      { text: '订单提交成功，等待支付', time: t(0), done: true }
    ],
    2: [
      { text: '订单提交成功', time: t(0), done: true },
      { text: '商家已接单，正在备货', time: t(30), done: true },
      { text: '商品出库，等待揽收', time: t(60 * 6), done: false }
    ],
    3: [
      { text: '订单提交成功', time: t(0), done: true },
      { text: '商家已接单', time: t(30), done: true },
      { text: '商品出库', time: t(60 * 6), done: true },
      { text: '顺丰速运已揽收', time: t(60 * 10), done: true },
      { text: '快件运输中，到达【杭州转运中心】', time: t(60 * 26), done: true },
      { text: '快件派送中，请保持电话畅通', time: t(60 * 30), done: false }
    ],
    4: [
      { text: '订单提交成功', time: t(0), done: true },
      { text: '商家已接单', time: t(30), done: true },
      { text: '商品出库', time: t(60 * 6), done: true },
      { text: '顺丰速运已揽收', time: t(60 * 10), done: true },
      { text: '快件运输中', time: t(60 * 26), done: true },
      { text: '派送员已取件，正在为您派送', time: t(60 * 30), done: true },
      { text: '已签收，感谢购买', time: t(60 * 32), done: false }
    ],
    5: [
      { text: '订单提交成功', time: t(0), done: true },
      { text: '商家已接单', time: t(30), done: true },
      { text: '商品出库', time: t(60 * 6), done: true },
      { text: '顺丰速运已揽收', time: t(60 * 10), done: true },
      { text: '快件运输中', time: t(60 * 26), done: true },
      { text: '派送员已取件，正在为您派送', time: t(60 * 30), done: true },
      { text: '已签收，感谢购买', time: t(60 * 32), done: true }
    ],
    6: [
      { text: '订单提交成功', time: t(0), done: true },
      { text: '订单已取消', time: t(60 * 2), done: true }
    ]
  }
  return steps[status] || steps[1]
}

function buildOrder(o) {
  const totalAmount = o.items.reduce((s, it) => s + it.price * it.count, 0)
  const discountAmount = o.discountAmount || 0
  const freight = 0
  const payAmount = Math.round((totalAmount - discountAmount + freight) * 100) / 100
  const logistics = {
    company: '顺丰速运',
    trackingNo: o.trackingNo || 'SF' + String(100000000000 + Math.floor((o.id % 100) * 13757)),
    statusText: o.statusText || '',
    timeline: buildTimeline(o.status, o.createTime)
  }
  return {
    id: o.id,
    orderNo: o.orderNo,
    status: o.status,
    items: o.items,
    totalAmount: Math.round(totalAmount * 100) / 100,
    discountAmount,
    freight,
    payAmount,
    addressSnapshot: o.address,
    createTime: o.createTime,
    logistics,
    isReviewed: !!o.isReviewed,
    remark: o.remark || ''
  }
}

const orders = [
  // ===== 待付款 =====
  buildOrder({
    id: 'o1', orderNo: '20260928102345001', status: 1,
    items: [item(1001, '2斤装 · 黑芝麻', 23.9, 1), item(3001, '300g袋装', 17.9, 1)],
    discountAmount: 5, address: addressBook.beijing,
    createTime: timeAgo(35), remark: '请尽快发货，谢谢'
  }),
  buildOrder({
    id: 'o2', orderNo: '20260928091230002', status: 1,
    items: [item(8001, '原味烧饼尝鲜装', 3.9, 1)],
    discountAmount: 0, address: addressBook.shanghai,
    createTime: timeAgo(90)
  }),
  // ===== 待发货 =====
  buildOrder({
    id: 'o3', orderNo: '20260927183012003', status: 2,
    items: [item(2006, '蛋黄流沙', 21.8, 2)],
    discountAmount: 3, address: addressBook.guangzhou,
    createTime: timeAgo(60 * 18)
  }),
  buildOrder({
    id: 'o4', orderNo: '20260927142008004', status: 2,
    items: [item(4002, '蜜汁味', 39.9, 1), item(4004, '麻辣味', 13.9, 2)],
    discountAmount: 8, address: addressBook.hangzhou,
    createTime: timeAgo(60 * 24)
  }),
  // ===== 配送中 =====
  buildOrder({
    id: 'o5', orderNo: '20260926091522005', status: 3,
    items: [item(5001, '欢聚款2000g', 128.0, 1)],
    discountAmount: 15, address: addressBook.beijing,
    createTime: timeAgo(60 * 48), trackingNo: 'SF138998877665'
  }),
  buildOrder({
    id: 'o6', orderNo: '20260926083011006', status: 3,
    items: [item(1005, '6个装 · 微辣', 29.8, 1), item(1003, '800g分享装', 18.8, 1)],
    discountAmount: 0, address: addressBook.shanghai,
    createTime: timeAgo(60 * 50), trackingNo: 'SF138998877012'
  }),
  // ===== 待收货 =====
  buildOrder({
    id: 'o7', orderNo: '20260925164509007', status: 4,
    items: [item(4001, '30包750g', 59.9, 1)],
    discountAmount: 5, address: addressBook.guangzhou,
    createTime: timeAgo(60 * 72), trackingNo: 'SF138888123456'
  }),
  buildOrder({
    id: 'o8', orderNo: '20260925112033008', status: 4,
    items: [item(6002, '小米', 19.9, 2), item(6006, '八年陈酿', 25.8, 1)],
    discountAmount: 0, address: addressBook.hangzhou,
    createTime: timeAgo(60 * 80), trackingNo: 'SF138888123987'
  }),
  // ===== 已完成（2~3 条未评价）=====
  buildOrder({
    id: 'o9', orderNo: '20260920101122009', status: 5,
    items: [item(1002, '6个装 · 牛肉', 18.8, 1)],
    discountAmount: 0, address: addressBook.beijing,
    createTime: timeAgo(60 * 24 * 8), isReviewed: false, trackingNo: 'SF137777112233'
  }),
  buildOrder({
    id: 'o10', orderNo: '20260918153044010', status: 5,
    items: [item(3002, '熬煮8包装', 15.8, 2), item(2002, '桂花', 14.9, 1)],
    discountAmount: 3, address: addressBook.shanghai,
    createTime: timeAgo(60 * 24 * 10), isReviewed: false, trackingNo: 'SF137777114455'
  }),
  buildOrder({
    id: 'o11', orderNo: '20260915092011011', status: 5,
    items: [item(9002, '500g', 18.8, 2)],
    discountAmount: 0, address: addressBook.guangzhou,
    createTime: timeAgo(60 * 24 * 13), isReviewed: true, trackingNo: 'SF136666554433'
  }),
  buildOrder({
    id: 'o12', orderNo: '20260910145530012', status: 5,
    items: [item(4003, '500g厚切', 26.8, 1), item(4007, '500g', 14.9, 1), item(7003, '原味', 18.9, 1)],
    discountAmount: 6, address: addressBook.hangzhou,
    createTime: timeAgo(60 * 24 * 18), isReviewed: true, trackingNo: 'SF136666551122'
  }),
  // ===== 已取消 =====
  buildOrder({
    id: 'o13', orderNo: '20260922201508013', status: 6,
    items: [item(7001, '微麻', 19.9, 1)],
    discountAmount: 0, address: addressBook.beijing,
    createTime: timeAgo(60 * 24 * 6)
  }),
  buildOrder({
    id: 'o14', orderNo: '20260912113022014', status: 6,
    items: [item(5003, '10盒起订', 99.0, 1)],
    discountAmount: 0, address: addressBook.shanghai,
    createTime: timeAgo(60 * 24 * 16)
  })
]

module.exports = orders
