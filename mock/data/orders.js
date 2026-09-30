// 订单数据：13 条，覆盖全部 6 种状态
// 状态：1待付款 / 2待发货 / 3配送中 / 4待收货 / 5已完成 / 6已取消

const day = 24 * 3600 * 1000
const now = Date.now()

// 物流时间线构造器
const tl = (nodes) => nodes.map((n, i) => ({
  title: n.title,
  desc: n.desc,
  time: n.time,
  done: i < nodes.length - 1 || nodes[nodes.length - 1].done
}))

// 简化：直接给每个订单写 timeline
const buildTimeline = (status, baseTime) => {
  // baseTime = 下单时间
  const t = (offsetHours, title, desc) => ({
    title,
    desc,
    time: new Date(baseTime + offsetHours * 3600 * 1000).toLocaleString('zh-CN', { hour12: false }),
    done: true
  })
  if (status === 1) {
    return [{ title: '订单已提交', desc: '等待买家付款', time: new Date(baseTime).toLocaleString('zh-CN', { hour12: false }), done: true }]
  }
  if (status === 2) {
    return [
      t(0, '订单已提交', '订单创建成功，等待付款'),
      t(0.2, '付款成功', '微信支付完成，等待商家发货')
    ]
  }
  // 3 配送中 / 4 待收货 / 5 已完成
  return [
    t(0, '订单已提交', '订单创建成功'),
    t(0.3, '付款成功', '微信支付完成'),
    t(2, '商家已发货', '包裹已交由顺丰速运揽收'),
    t(8, '运输中', '包裹已到达【石家庄转运中心】'),
    t(26, '到达派送点', '包裹已到达【朝阳望京营业部】，派送员：张师傅 138****1234'),
    status >= 4 ? t(30, '已签收', '本人签收，感谢使用') : { title: '派送中', desc: '派送员正在为您送货，请保持电话畅通', time: '', done: false }
  ]
}

const mk = (o) => {
  const items = o.items
  const totalAmount = items.reduce((s, it) => s + it.price * it.count, 0)
  const payAmount = +(totalAmount - (o.discountAmount || 0) + (o.freight || 0)).toFixed(2)
  return {
    id: o.id,
    orderNo: o.orderNo,
    status: o.status,
    statusText: o.statusText,
    items,
    totalAmount: +totalAmount.toFixed(2),
    discountAmount: o.discountAmount || 0,
    freight: o.freight || 0,
    payAmount,
    payMethod: o.payMethod || '微信支付',
    remark: o.remark || '',
    addressSnapshot: o.address,
    createTime: o.createTime,
    logistics: {
      company: '顺丰速运',
      trackingNo: o.trackingNo || 'SF' + (1000000000 + o.id * 137).toString().slice(0, 10),
      statusText: o.logisticsText || '',
      timeline: buildTimeline(o.status, o.createTime)
    },
    isReviewed: !!o.isReviewed
  }
}

const addr1 = { name: '王大饼', phone: '13888888888', region: '北京市 北京市 朝阳区', detail: '望京街道烧饼胡同 12 号院 3 号楼 502' }
const addr2 = { name: '王大饼', phone: '13888888888', region: '上海市 上海市 浦东新区', detail: '张江高科技园区 科苑路 88 号 创富大厦 18 层' }

export const seedOrders = [
  // ===== 待付款（2 条）=====
  mk({
    id: 10001, orderNo: '20260928102345001', status: 1, statusText: '待付款',
    items: [
      { goodsId: 1001, name: '老式芝麻大烧饼 传统手工烤制 500g（5个装）', mainPic: 'https://picsum.photos/seed/sb-1001-1/600/600', specText: '5个装 500g · 原味', price: 12.9, count: 2 },
      { goodsId: 3003, name: '黑芝麻糊 现磨黑芝麻 600g', mainPic: 'https://picsum.photos/seed/sb-3003-1/600/600', specText: '600g 罐装', price: 19.9, count: 1 }
    ],
    discountAmount: 5, freight: 0, address: addr1, createTime: now - 2 * 3600 * 1000, remark: '麻烦下午送货，谢谢'
  }),
  mk({
    id: 10002, orderNo: '20260927183012002', status: 1, statusText: '待付款',
    items: [
      { goodsId: 7002, name: '芋泥麻薯软欧包 网红爆款 2个装', mainPic: 'https://picsum.photos/seed/sb-7002-1/600/600', specText: '2个装', price: 24.9, count: 1 }
    ],
    discountAmount: 0, freight: 0, address: addr2, createTime: now - 18 * 3600 * 1000
  }),

  // ===== 待发货（2 条）=====
  mk({
    id: 10003, orderNo: '20260926091522003', status: 2, statusText: '待发货',
    items: [
      { goodsId: 5001, name: '烧饼全家福礼盒 8种口味 2kg', mainPic: 'https://picsum.photos/seed/sb-5001-1/600/600', specText: '2kg 礼盒装', price: 68.0, count: 1 }
    ],
    discountAmount: 10, freight: 0, address: addr1, createTime: now - 2 * day, remark: '送礼用，麻烦包装好看点'
  }),
  mk({
    id: 10004, orderNo: '20260925142033004', status: 2, statusText: '待发货',
    items: [
      { goodsId: 4005, name: '牛肉干 内蒙古手撕风干 250g', mainPic: 'https://picsum.photos/seed/sb-4005-1/600/600', specText: '香辣味', price: 47.9, count: 2 },
      { goodsId: 4004, name: '芒果干 菲律宾进口 500g', mainPic: 'https://picsum.photos/seed/sb-4004-1/600/600', specText: '500g', price: 24.9, count: 1 }
    ],
    discountAmount: 8, freight: 0, address: addr2, createTime: now - 3 * day
  }),

  // ===== 配送中（2 条）=====
  mk({
    id: 10005, orderNo: '20260924110845005', status: 3, statusText: '配送中', logisticsText: '运输中',
    items: [
      { goodsId: 1005, name: '梅干菜扣肉烧饼 黄山风味 400g', mainPic: 'https://picsum.photos/seed/sb-1005-1/600/600', specText: '8个装 800g', price: 32.8, count: 1 }
    ],
    discountAmount: 0, freight: 0, address: addr1, createTime: now - 4 * day
  }),
  mk({
    id: 10006, orderNo: '20260923164512006', status: 3, statusText: '配送中', logisticsText: '派送中',
    items: [
      { goodsId: 2002, name: '酥皮蛋黄酥 雪媚娘流心 6枚装', mainPic: 'https://picsum.photos/seed/sb-2002-1/600/600', specText: '榴莲流心', price: 29.9, count: 1 },
      { goodsId: 2007, name: '绿豆糕 传统手工 桂花味 300g', mainPic: 'https://picsum.photos/seed/sb-2007-1/600/600', specText: '桂花原味', price: 15.9, count: 1 }
    ],
    discountAmount: 5, freight: 0, address: addr1, createTime: now - 5 * day
  }),

  // ===== 待收货（2 条）=====
  mk({
    id: 10007, orderNo: '20260922093018007', status: 4, statusText: '待收货', logisticsText: '派送中',
    items: [
      { goodsId: 3001, name: '现磨纯黄豆浆粉 无添加蔗糖 500g', mainPic: 'https://picsum.photos/seed/sb-3001-1/600/600', specText: '1kg 家庭装', price: 29.8, count: 2 }
    ],
    discountAmount: 6, freight: 0, address: addr2, createTime: now - 6 * day
  }),
  mk({
    id: 10008, orderNo: '20260921152230008', status: 4, statusText: '待收货', logisticsText: '派送中',
    items: [
      { goodsId: 6002, name: '天津十八街麻花 什锦味 500g', mainPic: 'https://picsum.photos/seed/sb-6002-1/600/600', specText: '什锦味 500g', price: 26.8, count: 1 },
      { goodsId: 6001, name: '北京驴打滚 老式糕点 400g', mainPic: 'https://picsum.photos/seed/sb-6001-1/600/600', specText: '400g', price: 18.8, count: 1 }
    ],
    discountAmount: 0, freight: 0, address: addr1, createTime: now - 7 * day
  }),

  // ===== 已完成（3 条，其中 2 条未评价）=====
  mk({
    id: 10009, orderNo: '20260915101230009', status: 5, statusText: '已完成', logisticsText: '已签收',
    items: [
      { goodsId: 1002, name: '千层油酥烧饼 十八层起酥 300g', mainPic: 'https://picsum.photos/seed/sb-1002-1/600/600', specText: '12个装 600g', price: 18.9, count: 2 }
    ],
    discountAmount: 4, freight: 0, address: addr1, createTime: now - 13 * day, isReviewed: true
  }),
  mk({
    id: 10010, orderNo: '20260912143522010', status: 5, statusText: '已完成', logisticsText: '已签收',
    items: [
      { goodsId: 4001, name: '现炒核桃 纸皮核桃仁 500g', mainPic: 'https://picsum.photos/seed/sb-4001-1/600/600', specText: '1kg 家庭装', price: 59.9, count: 1 },
      { goodsId: 4006, name: '山楂条 古法熬制 400g', mainPic: 'https://picsum.photos/seed/sb-4006-1/600/600', specText: '400g', price: 11.9, count: 2 }
    ],
    discountAmount: 10, freight: 0, address: addr2, createTime: now - 16 * day, isReviewed: false
  }),
  mk({
    id: 10011, orderNo: '20260908094815011', status: 5, statusText: '已完成', logisticsText: '已签收',
    items: [
      { goodsId: 2003, name: '老式鸡蛋糕 无水蜂蜜蛋糕 500g', mainPic: 'https://picsum.photos/seed/sb-2003-1/600/600', specText: '500g', price: 13.9, count: 3 }
    ],
    discountAmount: 0, freight: 0, address: addr1, createTime: now - 20 * day, isReviewed: false
  }),

  // ===== 已取消（2 条）=====
  mk({
    id: 10012, orderNo: '20260910182045012', status: 6, statusText: '已取消',
    items: [
      { goodsId: 7001, name: '樱花限定草莓酥 春季新品 6枚', mainPic: 'https://picsum.photos/seed/sb-7001-1/600/600', specText: '6枚装', price: 28.9, count: 1 }
    ],
    discountAmount: 0, freight: 0, address: addr2, createTime: now - 18 * day, remark: '拍错了，取消'
  }),
  mk({
    id: 10013, orderNo: '20260905113022013', status: 6, statusText: '已取消',
    items: [
      { goodsId: 5003, name: '坚果大礼包 8袋组合 1.5kg', mainPic: 'https://picsum.photos/seed/sb-5003-1/600/600', specText: '1.5kg 礼盒', price: 88.0, count: 1 }
    ],
    discountAmount: 0, freight: 0, address: addr1, createTime: now - 23 * day
  })
]
