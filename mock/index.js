// Mock 总入口：API 路由分发（url + method 匹配）
// 所有写操作在内存中真实生效，并同步 wx.storage 持久化
const delay = require('./delay.js')

const categories = require('./data/categories.js')
const goodsSeed = require('./data/goods.js')
const cartsSeed = require('./data/carts.js')
const ordersSeed = require('./data/orders.js')
const reviewsSeed = require('./data/reviews.js')
const { mockUser, initialAddresses, initialCollect, initialHistory, initialSearchHistory, hotSearchWords } = require('./data/user.js')
const seckillSessions = require('./data/seckill.js')
const { couponTemplates, userCoupons } = require('./data/coupons.js')
const { initialPoints, pointsRecords, exchangeItems } = require('./data/points.js')
const { signedDays, streak, streakRewards } = require('./data/checkin.js')
const messagesSeed = require('./data/messages.js')

// ============ 内存状态（首次从 storage 恢复，否则用种子数据） ============
const STORAGE_KEYS = {
  cart: 'mock_cart',
  orders: 'mock_orders',
  reviews: 'mock_reviews',
  collect: 'mock_collect',
  address: 'mock_address',
  user: 'mock_user',
  history: 'mock_history',
  searchHistory: 'mock_search_history',
  userCoupons: 'mock_user_coupons',
  points: 'mock_points',
  pointsRecords: 'mock_points_records',
  checkin: 'mock_checkin',
  messages: 'mock_messages'
}

function load(key, seed) {
  try {
    const v = wx.getStorageSync(key)
    if (v && (Array.isArray(v) ? v.length > 0 : typeof v === 'object')) return v
  } catch (e) {}
  return JSON.parse(JSON.stringify(seed))
}

function save(key, value) {
  try { wx.setStorageSync(key, value) } catch (e) {}
}

const state = {
  cart: load(STORAGE_KEYS.cart, cartsSeed),
  orders: load(STORAGE_KEYS.orders, ordersSeed),
  reviews: load(STORAGE_KEYS.reviews, reviewsSeed),
  collect: load(STORAGE_KEYS.collect, initialCollect),
  address: load(STORAGE_KEYS.address, initialAddresses),
  user: load(STORAGE_KEYS.user, mockUser),
  history: load(STORAGE_KEYS.history, initialHistory),
  searchHistory: load(STORAGE_KEYS.searchHistory, initialSearchHistory),
  userCoupons: load(STORAGE_KEYS.userCoupons, userCoupons),
  points: load(STORAGE_KEYS.points, initialPoints),
  pointsRecords: load(STORAGE_KEYS.pointsRecords, pointsRecords),
  checkin: load(STORAGE_KEYS.checkin, { signedDays, streak, streakRewards }),
  messages: load(STORAGE_KEYS.messages, messagesSeed)
}

// 深拷贝工具，避免外部修改污染种子
function clone(o) { return JSON.parse(JSON.stringify(o)) }

// ============ 工具 ============
function paginate(list, page, size) {
  page = page || 1
  size = size || 10
  const start = (page - 1) * size
  return {
    records: clone(list.slice(start, start + size)),
    total: list.length,
    current: page,
    size
  }
}

function ok(data, msg) {
  return { code: 200, data, msg: msg || 'success' }
}

// 金额格式化（在 mock 层预计算，避免 WXS 语法兼容问题）
const priceText = (n) => '¥' + (Number(n) || 0).toFixed(2)

// 给商品对象附加展示用价格字段
function withGoodsPrice(g) {
  return {
    ...g,
    priceText: priceText(g.price),
    originPriceText: priceText(g.originalPrice)
  }
}

// 给订单项附加展示用价格字段
function withItemPrice(it) {
  return { ...it, priceText: priceText(it.price) }
}

// 给订单附加展示用金额字段
function withOrderMoney(o) {
  return {
    ...o,
    items: (o.items || []).map(withItemPrice),
    payAmountText: priceText(o.payAmount),
    totalAmountText: priceText(o.totalAmount),
    discountText: priceText(o.discountAmount),
    freightText: o.freight === 0 ? '免运费' : priceText(o.freight)
  }
}

function fail(msg, code) {
  return { code: code || 400, data: null, msg: msg || '操作失败' }
}

// ============ 路由表 ============
// 每个 handler: (params, data, method) => data（可直接返回值或 Promise）
const routes = []

function route(method, pattern, handler) {
  routes.push({ method, pattern, handler })
}

// ---------- 分类 ----------
route('GET', '/categories', () => {
  return ok(clone(categories))
})

// ---------- 商品 ----------
route('GET', '/goods/search', (params) => {
  let list = clone(goodsSeed)
  // 关键词
  if (params.query) {
    const q = String(params.query).toLowerCase()
    list = list.filter(g => g.name.toLowerCase().includes(q) || (g.tags || []).join('').includes(q) || g.categoryName.includes(q))
  }
  // 一级分类
  if (params.categoryId) {
    list = list.filter(g => g.categoryId === Number(params.categoryId))
  }
  // 二级分类
  if (params.subCategoryId) {
    list = list.filter(g => g.subCategoryId === Number(params.subCategoryId))
  }
  // 仅看有货
  if (params.onlyStock === '1' || params.onlyStock === 1) {
    list = list.filter(g => g.stock > 0)
  }
  // 价格区间
  if (params.priceMin !== undefined && params.priceMin !== '') {
    list = list.filter(g => g.price >= Number(params.priceMin))
  }
  if (params.priceMax !== undefined && params.priceMax !== '') {
    list = list.filter(g => g.price <= Number(params.priceMax))
  }
  // 排序：comprehensive / priceAsc / priceDesc / sales
  const sort = params.sort || 'comprehensive'
  if (sort === 'priceAsc') list.sort((a, b) => a.price - b.price)
  else if (sort === 'priceDesc') list.sort((a, b) => b.price - a.price)
  else if (sort === 'sales') list.sort((a, b) => b.sales - a.sales)
  else list.sort((a, b) => b.sales - a.sales)

  // 收藏态
  list.forEach(g => { g.isCollect = state.collect.some(c => c.id === g.id) })

  const pageData = paginate(list, params.page, params.size)
  pageData.records = pageData.records.map(withGoodsPrice)
  return ok(pageData)
})

route('GET', '/goods/detail', (params) => {
  const g = goodsSeed.find(x => x.id === Number(params.goodsId))
  if (!g) return fail('商品不存在', 404)
  const detail = withGoodsPrice(clone(g))
  detail.isCollect = state.collect.some(c => c.id === g.id)
  return ok(detail)
})

route('GET', '/goods/recommend', (params) => {
  const categoryId = Number(params.categoryId)
  const excludeId = Number(params.excludeId)
  let list = clone(goodsSeed)
  if (categoryId) list = list.filter(g => g.categoryId === categoryId && g.id !== excludeId)
  if (excludeId) list = list.filter(g => g.id !== excludeId)
  // 随机取 6 个（用确定性的伪随机：按销量打乱取前6）
  list.sort((a, b) => b.sales - a.sales)
  const picked = list.slice(0, 6).map(withGoodsPrice)
  return ok(picked)
})

// ---------- 首页 ----------
route('GET', '/home/swiperdata', () => {
  const banners = [
    { id: 'b1', pic: 'https://picsum.photos/seed/banner-1/750/320', title: '手工烧饼 现烤现发', link: '/pages/goods_detail/index?goods_id=1001' },
    { id: 'b2', pic: 'https://picsum.photos/seed/banner-2/750/320', title: '中秋礼盒 限时8折', link: '/pages/goods_detail/index?goods_id=5001' },
    { id: 'b3', pic: 'https://picsum.photos/seed/banner-3/750/320', title: '新品藤椒烧饼 尝鲜价', link: '/pages/goods_detail/index?goods_id=7001' },
    { id: 'b4', pic: 'https://picsum.photos/seed/banner-4/750/320', title: '每日坚果 买一送一', link: '/pages/goods_detail/index?goods_id=4001' }
  ]
  return ok(banners)
})

route('GET', '/home/catitems', () => {
  const navs = [
    { id: 1, icon: '🥞', name: '烧饼类', link: '/pages/category/index?categoryId=1' },
    { id: 2, icon: '🍰', name: '糕点类', link: '/pages/category/index?categoryId=2' },
    { id: 3, icon: '🥤', name: '饮品类', link: '/pages/category/index?categoryId=3' },
    { id: 4, icon: '🍿', name: '零食类', link: '/pages/category/index?categoryId=4' },
    { id: 5, icon: '🎁', name: '礼盒装', link: '/pages/category/index?categoryId=5' },
    { id: 6, icon: '🏮', name: '地方特产', link: '/pages/category/index?categoryId=6' },
    { id: 7, icon: '✨', name: '新品上市', link: '/pages/category/index?categoryId=7' },
    { id: 8, icon: '🔥', name: '限时特惠', link: '/pages/category/index?categoryId=8' }
  ]
  return ok(navs)
})

route('GET', '/home/floordata', () => {
  const floors = [
    {
      id: 'f1', title: '烧饼必买', icon: '🥞',
      goods: goodsSeed.filter(g => g.categoryId === 1).slice(0, 4).map(withGoodsPrice)
    },
    {
      id: 'f2', title: '糕点热销', icon: '🍰',
      goods: goodsSeed.filter(g => g.categoryId === 2).slice(0, 4).map(withGoodsPrice)
    },
    {
      id: 'f3', title: '零食囤货', icon: '🍿',
      goods: goodsSeed.filter(g => g.categoryId === 4).slice(0, 4).map(withGoodsPrice)
    }
  ]
  return ok(floors)
})

// ---------- 购物车 ----------
route('GET', '/cart/list', () => {
  const list = clone(state.cart)
  // 同步最新商品价/库存
  list.forEach(item => {
    const g = goodsSeed.find(x => x.id === item.goodsId)
    if (g) {
      item.name = g.name
      item.mainPic = g.mainPic
      item.stock = g.stock
    }
    item.priceText = priceText(item.price)
  })
  return ok(list)
})

route('POST', '/cart/add', (params) => {
  const { goodsId, specText, price, count } = params
  const g = goodsSeed.find(x => x.id === Number(goodsId))
  if (!g) return fail('商品不存在', 404)
  const c = count || 1
  const existing = state.cart.find(x => x.goodsId === Number(goodsId) && x.specText === specText)
  if (existing) {
    existing.count = Math.min(existing.count + c, existing.stock || 999)
  } else {
    state.cart.push({
      id: 'c' + Date.now() + Math.floor(Math.random() * 1000),
      goodsId: g.id,
      name: g.name,
      mainPic: g.mainPic,
      specText: specText || '标准装',
      price: price != null ? price : g.price,
      count: c,
      checked: true,
      stock: g.stock
    })
  }
  save(STORAGE_KEYS.cart, state.cart)
  return ok({ count: state.cart.reduce((s, x) => s + x.count, 0) })
})

route('POST', '/cart/update', (params) => {
  const { id, count, checked } = params
  const item = state.cart.find(x => x.id === id)
  if (!item) return fail('购物车项不存在', 404)
  if (count !== undefined) item.count = Math.max(1, Math.min(count, item.stock || 999))
  if (checked !== undefined) item.checked = checked
  save(STORAGE_KEYS.cart, state.cart)
  const ret = clone(item)
  ret.priceText = priceText(ret.price)
  return ok(ret)
})

route('POST', '/cart/remove', (params) => {
  const { ids } = params
  const idArr = Array.isArray(ids) ? ids : [ids]
  state.cart = state.cart.filter(x => !idArr.includes(x.id))
  save(STORAGE_KEYS.cart, state.cart)
  return ok({ count: state.cart.length })
})

route('POST', '/cart/clearInvalid', () => {
  state.cart = state.cart.filter(x => x.stock > 0)
  save(STORAGE_KEYS.cart, state.cart)
  return ok({ count: state.cart.length })
})

// ---------- 订单 ----------
route('GET', '/orders/list', (params) => {
  let list = clone(state.orders)
  if (params.status && Number(params.status) !== 0) {
    list = list.filter(o => o.status === Number(params.status))
  }
  list.sort((a, b) => b.createTime - a.createTime)
  const pageData = paginate(list, params.page, params.size)
  pageData.records = pageData.records.map(withOrderMoney)
  return ok(pageData)
})

route('GET', '/orders/detail', (params) => {
  const o = state.orders.find(x => x.id === params.id || x.orderNo === params.orderNo)
  if (!o) return fail('订单不存在', 404)
  return ok(withOrderMoney(clone(o)))
})

route('POST', '/orders/create', (params) => {
  const { items, address, discountAmount, remark } = params
  if (!items || !items.length) return fail('订单商品为空')
  const totalAmount = items.reduce((s, it) => s + it.price * it.count, 0)
  const payAmount = Math.round((totalAmount - (discountAmount || 0)) * 100) / 100
  const now = Date.now()
  const orderNo = String(now).slice(0, 14) + String(Math.floor(Math.random() * 9000) + 1000)
  // 归一化地址快照
  const addr = address || {}
  const addressSnapshot = {
    name: addr.name || '',
    phone: addr.phone || '',
    address: addr.address || ((addr.region || '') + (addr.detail || ''))
  }
  const order = {
    id: 'o' + now,
    orderNo,
    status: 2, // 支付成功 → 待发货
    items: clone(items),
    totalAmount: Math.round(totalAmount * 100) / 100,
    discountAmount: discountAmount || 0,
    freight: 0,
    payAmount,
    addressSnapshot,
    createTime: now,
    logistics: {
      company: '顺丰速运',
      trackingNo: 'SF' + String(100000000000 + Math.floor(Math.random() * 89999999)),
      statusText: '待发货',
      timeline: [
        { text: '订单提交成功', time: new Date(now).toLocaleString('zh-CN', { hour12: false }), done: true },
        { text: '商家已接单', time: new Date(now + 30 * 60000).toLocaleString('zh-CN', { hour12: false }), done: true },
        { text: '商品出库，等待揽收', time: '', done: false }
      ]
    },
    isReviewed: false,
    remark: remark || ''
  }
  state.orders.unshift(order)
  // 购物积分：1元=1积分
  const earnPoints = Math.round(payAmount)
  state.points += earnPoints
  state.pointsRecords.unshift({
    id: 'p' + Date.now(),
    type: 'earn',
    source: '购物',
    amount: earnPoints,
    time: Date.now(),
    orderNo: order.orderNo
  })
  // 写入订单消息
  state.messages.unshift({
    id: 'm' + Date.now(),
    type: 2,
    title: '订单创建成功',
    content: `您的订单 #${order.orderNo} 已创建，商家正在备货`,
    isRead: false,
    createTime: Date.now(),
    relatedId: order.id
  })
  save(STORAGE_KEYS.orders, state.orders)
  save(STORAGE_KEYS.points, state.points)
  save(STORAGE_KEYS.pointsRecords, state.pointsRecords)
  save(STORAGE_KEYS.messages, state.messages)
  return ok(withOrderMoney(order))
})

// 待付款订单支付：状态 1 → 2（待发货）
route('POST', '/orders/pay', (params) => {
  const o = state.orders.find(x => x.id === params.id)
  if (!o) return fail('订单不存在', 404)
  if (o.status !== 1) return fail('订单状态异常')
  o.status = 2
  o.logistics.statusText = '待发货'
  o.logistics.timeline = [
    { text: '订单提交成功', time: new Date(o.createTime).toLocaleString('zh-CN', { hour12: false }), done: true },
    { text: '支付成功，商家备货中', time: new Date().toLocaleString('zh-CN', { hour12: false }), done: true },
    { text: '商品出库，等待揽收', time: '', done: false }
  ]
  save(STORAGE_KEYS.orders, state.orders)
  return ok(withOrderMoney(clone(o)))
})

route('POST', '/orders/cancel', (params) => {
  const o = state.orders.find(x => x.id === params.id)
  if (!o) return fail('订单不存在', 404)
  if (o.status !== 1) return fail('当前状态不可取消')
  o.status = 6
  o.logistics.timeline = [
    { text: '订单提交成功', time: new Date(o.createTime).toLocaleString('zh-CN', { hour12: false }), done: true },
    { text: '订单已取消', time: new Date().toLocaleString('zh-CN', { hour12: false }), done: true }
  ]
  save(STORAGE_KEYS.orders, state.orders)
  return ok(withOrderMoney(clone(o)))
})

route('POST', '/orders/confirm', (params) => {
  const o = state.orders.find(x => x.id === params.id)
  if (!o) return fail('订单不存在', 404)
  o.status = 5
  o.logistics.statusText = '已签收'
  o.logistics.timeline.forEach(t => t.done = true)
  save(STORAGE_KEYS.orders, state.orders)
  return ok(withOrderMoney(clone(o)))
})

route('POST', '/orders/remind', () => {
  return ok({ message: '已提醒商家，我们会尽快为您发货~' })
})

// 模拟配送进度：待发货→配送中→待收货→已完成
route('POST', '/orders/simulate', (params) => {
  const o = state.orders.find(x => x.id === params.id)
  if (!o) return fail('订单不存在', 404)
  const now = new Date().toLocaleString('zh-CN', { hour12: false })
  if (o.status === 2) {
    o.status = 3
    o.logistics.statusText = '运输中'
    o.logistics.timeline = [
      { text: '订单提交成功', time: new Date(o.createTime).toLocaleString('zh-CN', { hour12: false }), done: true },
      { text: '商家已接单', time: now, done: true },
      { text: '商品出库', time: now, done: true },
      { text: '顺丰速运已揽收', time: now, done: true },
      { text: '快件运输中，到达【杭州转运中心】', time: now, done: true },
      { text: '快件派送中，请保持电话畅通', time: '', done: false }
    ]
  } else if (o.status === 3) {
    o.status = 4
    o.logistics.statusText = '派送中'
    o.logistics.timeline.forEach(t => t.done = true)
    o.logistics.timeline[o.logistics.timeline.length - 1].done = false
  } else if (o.status === 4) {
    o.status = 5
    o.logistics.statusText = '已签收'
    o.logistics.timeline.forEach(t => t.done = true)
  }
  save(STORAGE_KEYS.orders, state.orders)
  return ok(withOrderMoney(clone(o)))
})

// ---------- 评价 ----------
route('GET', '/reviews/list', (params) => {
  let list = clone(state.reviews)
  if (params.goodsId) list = list.filter(r => r.goodsId === Number(params.goodsId))
  if (params.rating) {
    const r = Number(params.rating)
    if (r === 4) list = list.filter(x => x.rating >= 4)
    else if (r === 3) list = list.filter(x => x.rating === 3)
    else if (r === 2) list = list.filter(x => x.rating <= 2)
    else list = list.filter(x => x.rating === r)
  }
  if (params.tag) list = list.filter(x => x.tags.includes(params.tag))
  if (params.withImages === '1' || params.withImages === 1) list = list.filter(x => x.images && x.images.length)
  list.sort((a, b) => b.createTime - a.createTime)
  return ok(paginate(list, params.page, params.size))
})

route('POST', '/reviews/submit', (params) => {
  const { orderId, goodsId, rating, content, images, tags, specText } = params
  if (!rating || rating < 1) return fail('请选择星级')
  const review = {
    id: 'r' + Date.now(),
    orderId,
    goodsId: Number(goodsId),
    userId: state.user.id,
    userName: state.user.nickName,
    userAvatar: state.user.avatar,
    rating: Number(rating),
    content: content || '',
    images: images || [],
    tags: tags || [],
    createTime: Date.now(),
    specText: specText || '标准装'
  }
  state.reviews.unshift(review)
  // 标记订单已评价
  const order = state.orders.find(o => o.id === orderId)
  if (order) order.isReviewed = true
  // 评价积分：+20
  state.points += 20
  state.pointsRecords.unshift({
    id: 'p' + Date.now(),
    type: 'earn',
    source: '订单评价',
    amount: 20,
    time: Date.now()
  })
  save(STORAGE_KEYS.reviews, state.reviews)
  save(STORAGE_KEYS.orders, state.orders)
  save(STORAGE_KEYS.points, state.points)
  save(STORAGE_KEYS.pointsRecords, state.pointsRecords)
  return ok(review)
})

// ---------- 收藏 ----------
route('GET', '/collect/list', () => {
  const list = clone(state.collect)
  // 补全商品信息
  list.forEach(c => {
    const g = goodsSeed.find(x => x.id === c.id)
    if (g) Object.assign(c, g)
    c.priceText = priceText(c.price)
  })
  return ok(list)
})

route('POST', '/collect/toggle', (params) => {
  const goodsId = Number(params.goodsId)
  const idx = state.collect.findIndex(c => c.id === goodsId)
  let isCollect
  if (idx >= 0) {
    state.collect.splice(idx, 1)
    isCollect = false
  } else {
    const g = goodsSeed.find(x => x.id === goodsId)
    if (!g) return fail('商品不存在', 404)
    state.collect.push({ id: g.id, name: g.name, mainPic: g.mainPic, price: g.price, unit: g.unit })
    isCollect = true
  }
  save(STORAGE_KEYS.collect, state.collect)
  return ok({ isCollect })
})

// ---------- 用户 / 地址 ----------
route('GET', '/user/info', () => ok(clone(state.user)))

route('GET', '/user/address', () => ok(clone(state.address)))

route('POST', '/user/address/save', (params) => {
  const { id, name, phone, region, detail, tag, isDefault } = params
  const tagClassMap = { '家': 'tag_home', '学校': 'tag_school', '公司': 'tag_company', '其他': 'tag_other' }
  const tagClass = tagClassMap[tag] || 'tag_other'
  if (id) {
    const a = state.address.find(x => x.id === id)
    if (a) Object.assign(a, { name, phone, region, detail, tag, tagClass })
  } else {
    state.address.push({ id: 'a' + Date.now(), name, phone, region, detail, tag, tagClass, isDefault: false })
  }
  if (isDefault) {
    state.address.forEach(a => a.isDefault = false)
    const target = state.address.find(x => x.name === name && x.phone === phone && x.detail === detail)
    if (target) target.isDefault = true
  }
  save(STORAGE_KEYS.address, state.address)
  return ok(clone(state.address))
})

route('POST', '/user/address/setDefault', (params) => {
  state.address.forEach(a => a.isDefault = a.id === params.id)
  save(STORAGE_KEYS.address, state.address)
  return ok(clone(state.address))
})

// ---------- 浏览足迹 ----------
route('GET', '/history/list', () => {
  const list = clone(state.history)
  list.sort((a, b) => b.browseTime - a.browseTime)
  return ok(list)
})

route('POST', '/history/add', (params) => {
  const { goodsId } = params
  const g = goodsSeed.find(x => x.id === Number(goodsId))
  if (!g) return fail('商品不存在', 404)
  // 去重：移除已有同 goodsId
  state.history = state.history.filter(h => h.goodsId !== Number(goodsId))
  state.history.unshift({
    goodsId: g.id,
    name: g.name,
    mainPic: g.mainPic,
    price: g.price,
    browseTime: Date.now()
  })
  // 最多 50 条
  if (state.history.length > 50) state.history = state.history.slice(0, 50)
  save(STORAGE_KEYS.history, state.history)
  return ok({ count: state.history.length })
})

route('POST', '/history/remove', (params) => {
  const { goodsId } = params
  state.history = state.history.filter(h => h.goodsId !== Number(goodsId))
  save(STORAGE_KEYS.history, state.history)
  return ok({ count: state.history.length })
})

route('POST', '/history/clear', () => {
  state.history = []
  save(STORAGE_KEYS.history, state.history)
  return ok({ count: 0 })
})

// ---------- 搜索 ----------
route('GET', '/search/hot', () => {
  return ok(hotSearchWords)
})

route('GET', '/search/suggest', (params) => {
  const q = String(params.q || '').trim().toLowerCase()
  if (!q) return ok([])
  // 前缀匹配商品名称（中文逐字前缀）
  const list = goodsSeed.filter(g => g.name.toLowerCase().startsWith(q) || g.name.includes(q))
  const picked = list.slice(0, 10).map(g => ({
    goodsId: g.id,
    name: g.name,
    mainPic: g.mainPic,
    price: g.price,
    priceText: priceText(g.price)
  }))
  return ok(picked)
})

route('GET', '/search/history', () => {
  return ok(clone(state.searchHistory))
})

route('POST', '/search/history/add', (params) => {
  const { keyword } = params
  const k = String(keyword || '').trim()
  if (!k) return ok({ count: state.searchHistory.length })
  state.searchHistory = state.searchHistory.filter(x => x !== k)
  state.searchHistory.unshift(k)
  if (state.searchHistory.length > 15) state.searchHistory = state.searchHistory.slice(0, 15)
  save(STORAGE_KEYS.searchHistory, state.searchHistory)
  return ok(state.searchHistory)
})

route('POST', '/search/history/remove', (params) => {
  const { keyword } = params
  state.searchHistory = state.searchHistory.filter(x => x !== keyword)
  save(STORAGE_KEYS.searchHistory, state.searchHistory)
  return ok(state.searchHistory)
})

route('POST', '/search/history/clear', () => {
  state.searchHistory = []
  save(STORAGE_KEYS.searchHistory, state.searchHistory)
  return ok([])
})

// ---------- 地址 ----------
route('POST', '/address/delete', (params) => {
  const { id } = params
  const addr = state.address.find(a => a.id === id)
  if (addr && addr.isDefault) return fail('默认地址不可删除，请先设置其他地址为默认')
  state.address = state.address.filter(a => a.id !== id)
  save(STORAGE_KEYS.address, state.address)
  return ok(clone(state.address))
})

// ---------- 限时抢购 ----------
route('GET', '/seckill/sessions', () => {
  return ok(clone(seckillSessions))
})

route('POST', '/seckill/add', (params) => {
  const { goodsId, seckillPrice, count } = params
  // 限购 1 件
  const existing = state.cart.find(x => x.goodsId === Number(goodsId) && x.specText === '抢购')
  if (existing) return fail('每人每场每商品限购1件')
  const g = goodsSeed.find(x => x.id === Number(goodsId))
  if (!g) return fail('商品不存在', 404)
  state.cart.push({
    id: 'c' + Date.now() + Math.floor(Math.random() * 1000),
    goodsId: g.id,
    name: g.name,
    mainPic: g.mainPic,
    specText: '限时抢购',
    price: seckillPrice,
    count: count || 1,
    checked: true,
    stock: g.stock
  })
  save(STORAGE_KEYS.cart, state.cart)
  return ok({ count: state.cart.reduce((s, x) => s + x.count, 0) })
})

// ---------- 优惠券 ----------
route('GET', '/coupon/templates', () => {
  return ok(clone(couponTemplates))
})

route('GET', '/coupon/my', (params) => {
  let list = clone(state.userCoupons)
  if (params.status) {
    list = list.filter(c => c.status === params.status)
  }
  list.sort((a, b) => b.receiveTime - a.receiveTime)
  return ok(list)
})

route('POST', '/coupon/claim', (params) => {
  const { templateId } = params
  const tpl = couponTemplates.find(t => t.id === templateId)
  if (!tpl) return fail('券不存在', 404)
  // 每人每券限领 1 张
  const existing = state.userCoupons.find(c => c.templateId === templateId && c.status === 'unused')
  if (existing) return fail('您已领取过该券')
  if (tpl.claimed >= tpl.total) return fail('优惠券已被领完')
  tpl.claimed++
  const now = Date.now()
  const coupon = {
    id: 'uc' + now,
    templateId,
    type: tpl.type,
    amount: tpl.amount,
    threshold: tpl.threshold,
    discount: tpl.discount,
    name: tpl.name,
    scope: tpl.scope,
    status: 'unused',
    receiveTime: now,
    expireTime: now + tpl.validDays * 86400 * 1000
  }
  state.userCoupons.unshift(coupon)
  save(STORAGE_KEYS.userCoupons, state.userCoupons)
  return ok(coupon)
})

route('POST', '/coupon/use', (params) => {
  const { id } = params
  const coupon = state.userCoupons.find(c => c.id === id)
  if (!coupon) return fail('券不存在', 404)
  coupon.status = 'used'
  coupon.useTime = Date.now()
  save(STORAGE_KEYS.userCoupons, state.userCoupons)
  return ok(clone(coupon))
})

route('POST', '/coupon/exchange', (params) => {
  const { points, couponId } = params
  if (state.points < points) return fail('积分不足')
  const tpl = couponTemplates.find(t => t.id === couponId)
  if (!tpl) return fail('券不存在', 404)
  state.points -= points
  // 扣积分记录
  state.pointsRecords.unshift({
    id: 'p' + Date.now(),
    type: 'spend',
    source: '积分兑换',
    amount: -points,
    time: Date.now(),
    item: tpl.name
  })
  // 发券
  const now = Date.now()
  state.userCoupons.unshift({
    id: 'uc' + now,
    templateId: couponId,
    type: tpl.type,
    amount: tpl.amount,
    threshold: tpl.threshold,
    discount: tpl.discount,
    name: tpl.name,
    scope: tpl.scope,
    status: 'unused',
    receiveTime: now,
    expireTime: now + tpl.validDays * 86400 * 1000
  })
  save(STORAGE_KEYS.points, state.points)
  save(STORAGE_KEYS.pointsRecords, state.pointsRecords)
  save(STORAGE_KEYS.userCoupons, state.userCoupons)
  return ok({ points: state.points })
})

// ---------- 积分 ----------
route('GET', '/points/info', () => {
  return ok({ points: state.points, records: clone(state.pointsRecords) })
})

route('GET', '/points/exchange', () => {
  return ok(clone(exchangeItems))
})

// ---------- 签到 ----------
route('GET', '/checkin/info', () => {
  return ok(clone(state.checkin))
})

route('POST', '/checkin/do', () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTs = today.getTime()
  // 今日已签
  if (state.checkin.signedDays.includes(todayTs)) return fail('今日已签到')
  // 连续签到：昨天签了则 streak+1，否则重置为 1
  const yesterday = todayTs - 86400 * 1000
  const signedYesterday = state.checkin.signedDays.includes(yesterday)
  const newStreak = signedYesterday ? state.checkin.streak + 1 : 1
  // 第 7 天大奖
  const reward = newStreak === 7 ? 50 : (newStreak <= 2 ? 5 : newStreak <= 4 ? 10 : newStreak <= 6 ? 15 : 20)
  state.checkin.signedDays.push(todayTs)
  state.checkin.streak = newStreak
  state.points += reward
  state.pointsRecords.unshift({
    id: 'p' + Date.now(),
    type: 'earn',
    source: '每日签到',
    amount: reward,
    time: Date.now()
  })
  save(STORAGE_KEYS.checkin, state.checkin)
  save(STORAGE_KEYS.points, state.points)
  save(STORAGE_KEYS.pointsRecords, state.pointsRecords)
  return ok({ reward, streak: newStreak })
})

// ---------- 消息 ----------
route('GET', '/messages/list', (params) => {
  let list = clone(state.messages)
  if (params.type && Number(params.type) !== 0) {
    list = list.filter(m => m.type === Number(params.type))
  }
  list.sort((a, b) => b.createTime - a.createTime)
  return ok(list)
})

route('POST', '/messages/read', (params) => {
  const { id } = params
  const msg = state.messages.find(m => m.id === id)
  if (msg) msg.isRead = true
  save(STORAGE_KEYS.messages, state.messages)
  return ok(clone(state.messages))
})

route('POST', '/messages/readAll', () => {
  state.messages.forEach(m => m.isRead = true)
  save(STORAGE_KEYS.messages, state.messages)
  return ok(clone(state.messages))
})

route('POST', '/messages/push', (params) => {
  const msg = {
    id: 'm' + Date.now(),
    type: params.type || 3,
    title: params.title || '促销消息',
    content: params.content || '',
    isRead: false,
    createTime: Date.now(),
    relatedId: params.relatedId || ''
  }
  state.messages.unshift(msg)
  save(STORAGE_KEYS.messages, state.messages)
  return ok(msg)
})

// ---------- 图片上传（mock） ----------
route('POST', '/upload/image', (params) => {
  // 直接返回本地临时路径
  return ok({ url: params.tempFilePath || 'https://picsum.photos/seed/upload-' + Date.now() + '/400/400' })
})

// ============ 路由匹配 ============
function matchRoute(method, url) {
  // 去掉 query string
  const path = url.split('?')[0]
  for (const r of routes) {
    if (r.method !== method) continue
    if (r.pattern === path) return r
  }
  return null
}

// 解析 query string
function parseQuery(url) {
  const q = {}
  const idx = url.indexOf('?')
  if (idx < 0) return q
  const str = url.slice(idx + 1)
  str.split('&').forEach(pair => {
    if (!pair) return
    const [k, v] = pair.split('=')
    q[decodeURIComponent(k)] = decodeURIComponent(v || '')
  })
  return q
}

// 主入口：mockRequest({ url, method, data })
async function mockRequest(options) {
  await delay()
  const method = (options.method || 'GET').toUpperCase()
  const url = options.url || ''
  const query = parseQuery(url)
  const params = { ...query, ...(options.data || {}) }
  const r = matchRoute(method, url)
  if (!r) {
    return { code: 404, data: null, msg: `未匹配的 Mock 接口: ${method} ${url}` }
  }
  try {
    const result = r.handler(params, options.data || {}, method)
    return result
  } catch (e) {
    return { code: 500, data: null, msg: 'Mock 处理异常: ' + e.message }
  }
}

// 首次启动：把种子数据持久化到 storage，保证 app.js 直接读 storage 也能拿到
function ensureInit() {
  const keys = ['cart', 'orders', 'reviews', 'collect', 'address', 'user']
  keys.forEach(k => {
    const existing = wx.getStorageSync(STORAGE_KEYS[k])
    if (!existing || (Array.isArray(existing) && existing.length === 0)) {
      save(STORAGE_KEYS[k], state[k])
    }
  })
}

module.exports = { mockRequest, state, STORAGE_KEYS, ensureInit }
