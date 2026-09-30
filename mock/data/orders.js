// 订单数据：12+ 条，覆盖全部 6 种状态
// status: 1待付款 / 2待发货 / 3配送中 / 4待收货 / 5已完成 / 6已取消

const now = Date.now()
const H = 3600 * 1000
const D = 24 * H

const item = (goodsId, name, mainPic, specText, price, count) => ({
  goodsId, name, mainPic, specText, price, count
})

// 生成物流时间线
const timeline = (stage) => {
  // stage: 0 待发货 1 已发货 2 运输中 3 已送达
  const base = now - 2 * D
  const nodes = [
    { title: '订单已创建', desc: '商家已收到订单，正在准备发货', time: base, done: true },
    { title: '商品已打包', desc: '商品已打包完成，等待快递揽收', time: base + 2 * H, done: stage >= 1 },
    { title: '快递已揽收', desc: '顺丰速运已揽收，正在发往中转中心', time: base + 5 * H, done: stage >= 2 },
    { title: '运输中', desc: '快件已到达石家庄转运中心，正在发往目的地', time: base + 10 * H, done: stage >= 2 },
    { title: '已送达', desc: '快件已到达目的地驿站，请及时取件', time: base + 26 * H, done: stage >= 3 }
  ]
  return nodes
}

export const initialOrders = [
  {
    id: 'o1',
    orderNo: '20260928100000001',
    status: 1,
    items: [
      item(103, '红糖流心烧饼 甜而不腻 6个装 现烤发出', 'https://picsum.photos/seed/shaobing-hongtang/600/600', '6个装', 11.9, 2),
      item(305, '酸梅汤原料包 古法熬制 100g*5包', 'https://picsum.photos/seed/drink-suanmei/600/600', '100g*5包', 15.9, 1)
    ],
    totalAmount: 39.7,
    discountAmount: 5.0,
    freight: 0,
    payAmount: 34.7,
    addressSnapshot: { name: '王小明', phone: '138****8888', address: '河北省石家庄市长安区建设北大街88号烧饼小区3号楼2单元501' },
    createTime: now - 2 * H,
    logistics: { company: '顺丰速运', trackingNo: 'SF1000000001', statusText: '等待商家发货', timeline: timeline(0) },
    isReviewed: false
  },
  {
    id: 'o2',
    orderNo: '20260928093000002',
    status: 1,
    items: [
      item(801, '今日特价 原味烧饼 1斤装 亏本冲量', 'https://picsum.photos/seed/sale-tejia/600/600', '1斤装', 6.9, 3)
    ],
    totalAmount: 20.7,
    discountAmount: 0,
    freight: 0,
    payAmount: 20.7,
    addressSnapshot: { name: '王小明', phone: '138****8888', address: '河北省石家庄市长安区建设北大街88号烧饼小区3号楼2单元501' },
    createTime: now - 3 * H,
    logistics: { company: '顺丰速运', trackingNo: 'SF1000000002', statusText: '等待商家发货', timeline: timeline(0) },
    isReviewed: false
  },
  {
    id: 'o3',
    orderNo: '20260927150000003',
    status: 2,
    items: [
      item(501, '烧饼糕点组合礼盒 8种口味 1500g 送礼', 'https://picsum.photos/seed/gift-heboxiaobing/600/600', '1500g', 88.0, 1)
    ],
    totalAmount: 88.0,
    discountAmount: 10.0,
    freight: 0,
    payAmount: 78.0,
    addressSnapshot: { name: '王小明', phone: '138****8888', address: '河北省石家庄市长安区建设北大街88号烧饼小区3号楼2单元501' },
    createTime: now - 1 * D,
    logistics: { company: '顺丰速运', trackingNo: 'SF1000000003', statusText: '商家已打包，等待揽收', timeline: timeline(1) },
    isReviewed: false
  },
  {
    id: 'o4',
    orderNo: '20260927110000004',
    status: 2,
    items: [
      item(404, '风干牛肉干 内蒙古手撕 500g 原味', 'https://picsum.photos/seed/snack-niurou/600/600', '500g · 香辣', 89.9, 1),
      item(402, '焦糖瓜子 大颗粒 500g 炒货零食', 'https://picsum.photos/seed/snack-huangguazi/600/600', '500g · 焦糖', 13.9, 2)
    ],
    totalAmount: 117.7,
    discountAmount: 8.0,
    freight: 0,
    payAmount: 109.7,
    addressSnapshot: { name: '王小明', phone: '138****8888', address: '河北省石家庄市长安区建设北大街88号烧饼小区3号楼2单元501' },
    createTime: now - 1 * D - 2 * H,
    logistics: { company: '顺丰速运', trackingNo: 'SF1000000004', statusText: '商家已打包，等待揽收', timeline: timeline(1) },
    isReviewed: false
  },
  {
    id: 'o5',
    orderNo: '20260926160000005',
    status: 3,
    items: [
      item(201, '京八件传统糕点礼盒 8种口味 1000g', 'https://picsum.photos/seed/gaodian-bajian/600/600', '1000g简装', 45.9, 1)
    ],
    totalAmount: 45.9,
    discountAmount: 5.0,
    freight: 0,
    payAmount: 40.9,
    addressSnapshot: { name: '王小明', phone: '138****8888', address: '河北省石家庄市长安区建设北大街88号烧饼小区3号楼2单元501' },
    createTime: now - 2 * D,
    logistics: { company: '顺丰速运', trackingNo: 'SF1000000005', statusText: '运输中，预计明天送达', timeline: timeline(2) },
    isReviewed: false
  },
  {
    id: 'o6',
    orderNo: '20260926090000006',
    status: 3,
    items: [
      item(603, '山东周村烧饼 薄脆芝麻 65g*8袋', 'https://picsum.photos/seed/techan-shandong/600/600', '65g*8袋', 32.9, 1),
      item(601, '天津麻花 桂发祥风味 散装 500g', 'https://picsum.photos/seed/techan-jingjin/600/600', '500g · 什锦', 24.9, 1)
    ],
    totalAmount: 57.8,
    discountAmount: 0,
    freight: 0,
    payAmount: 57.8,
    addressSnapshot: { name: '王小明', phone: '138****8888', address: '河北省石家庄市长安区建设北大街88号烧饼小区3号楼2单元501' },
    createTime: now - 2 * D - 3 * H,
    logistics: { company: '中通快递', trackingNo: 'ZT2000000005', statusText: '运输中，正在发往石家庄', timeline: timeline(2) },
    isReviewed: false
  },
  {
    id: 'o7',
    orderNo: '20260925140000007',
    status: 4,
    items: [
      item(302, '无糖纯豆乳 250ml*12盒 整箱', 'https://picsum.photos/seed/drink-douru/600/600', '250ml*12盒', 29.9, 1)
    ],
    totalAmount: 29.9,
    discountAmount: 0,
    freight: 0,
    payAmount: 29.9,
    addressSnapshot: { name: '王小明', phone: '138****8888', address: '河北省石家庄市长安区建设北大街88号烧饼小区3号楼2单元501' },
    createTime: now - 3 * D,
    logistics: { company: '顺丰速运', trackingNo: 'SF1000000007', statusText: '已送达驿站，请及时取件', timeline: timeline(3) },
    isReviewed: false
  },
  {
    id: 'o8',
    orderNo: '20260924100000008',
    status: 5,
    items: [
      item(101, '老式五仁大烧饼 传统手工制作 500g 真空包装', 'https://picsum.photos/seed/shaobing-yuanwei/600/600', '1斤装 · 原味', 12.9, 2),
      item(106, '芝麻酥烧饼 满口芝麻 10个装 独立包装', 'https://picsum.photos/seed/shaobing-zhima/600/600', '10个装', 10.9, 1)
    ],
    totalAmount: 36.7,
    discountAmount: 3.0,
    freight: 0,
    payAmount: 33.7,
    addressSnapshot: { name: '王小明', phone: '138****8888', address: '河北省石家庄市长安区建设北大街88号烧饼小区3号楼2单元501' },
    createTime: now - 4 * D,
    logistics: { company: '顺丰速运', trackingNo: 'SF1000000008', statusText: '已签收', timeline: timeline(3) },
    isReviewed: false
  },
  {
    id: 'o9',
    orderNo: '20260923160000009',
    status: 5,
    items: [
      item(206, '手撕面包 奶香原味 1000g 整箱早餐', 'https://picsum.photos/seed/gaodian-miantuo/600/600', '1000g', 24.9, 1)
    ],
    totalAmount: 24.9,
    discountAmount: 0,
    freight: 0,
    payAmount: 24.9,
    addressSnapshot: { name: '王小明', phone: '138****8888', address: '河北省石家庄市长安区建设北大街88号烧饼小区3号楼2单元501' },
    createTime: now - 5 * D,
    logistics: { company: '圆通速递', trackingNo: 'YT3000000009', statusText: '已签收', timeline: timeline(3) },
    isReviewed: false
  },
  {
    id: 'o10',
    orderNo: '20260922110000010',
    status: 5,
    items: [
      item(403, '靖江猪肉脯 蜜汁味 200g 手撕肉干', 'https://picsum.photos/seed/snack-rougan/600/600', '200g · 蜜汁', 22.9, 2)
    ],
    totalAmount: 45.8,
    discountAmount: 5.0,
    freight: 0,
    payAmount: 40.8,
    addressSnapshot: { name: '王小明', phone: '138****8888', address: '河北省石家庄市长安区建设北大街88号烧饼小区3号楼2单元501' },
    createTime: now - 6 * D,
    logistics: { company: '顺丰速运', trackingNo: 'SF1000000010', statusText: '已签收', timeline: timeline(3) },
    isReviewed: true
  },
  {
    id: 'o11',
    orderNo: '20260921150000011',
    status: 5,
    items: [
      item(702, '艾草青团 豆沙蛋黄 6枚装 清明限定', 'https://picsum.photos/seed/new-qingming/600/600', '6枚装 · 蛋黄肉松', 18.9, 1)
    ],
    totalAmount: 18.9,
    discountAmount: 0,
    freight: 0,
    payAmount: 18.9,
    addressSnapshot: { name: '王小明', phone: '138****8888', address: '河北省石家庄市长安区建设北大街88号烧饼小区3号楼2单元501' },
    createTime: now - 7 * D,
    logistics: { company: '顺丰速运', trackingNo: 'SF1000000011', statusText: '已签收', timeline: timeline(3) },
    isReviewed: true
  },
  {
    id: 'o12',
    orderNo: '20260920100000012',
    status: 6,
    items: [
      item(503, '坚果炒货大礼盒 12袋 2000g 年货', 'https://picsum.photos/seed/gift-jianhe/600/600', '12袋/2000g', 128.0, 1)
    ],
    totalAmount: 128.0,
    discountAmount: 0,
    freight: 0,
    payAmount: 128.0,
    addressSnapshot: { name: '王小明', phone: '138****8888', address: '河北省石家庄市长安区建设北大街88号烧饼小区3号楼2单元501' },
    createTime: now - 8 * D,
    logistics: { company: '顺丰速运', trackingNo: 'SF1000000012', statusText: '订单已取消', timeline: timeline(0) },
    isReviewed: false
  },
  {
    id: 'o13',
    orderNo: '20260919090000013',
    status: 6,
    items: [
      item(303, '茉莉花茶 清香型 250g 罐装', 'https://picsum.photos/seed/drink-chaye/600/600', '250g罐装', 35.9, 1)
    ],
    totalAmount: 35.9,
    discountAmount: 0,
    freight: 0,
    payAmount: 35.9,
    addressSnapshot: { name: '王小明', phone: '138****8888', address: '河北省石家庄市长安区建设北大街88号烧饼小区3号楼2单元501' },
    createTime: now - 9 * D,
    logistics: { company: '顺丰速运', trackingNo: 'SF1000000013', statusText: '订单已取消', timeline: timeline(0) },
    isReviewed: false
  }
]
