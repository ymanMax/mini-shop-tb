// Mock 内存状态 + storage 持久化
// 所有写操作在内存中真实生效，并同步写入 wx.storage，保证跨页面一致

import { seedCarts } from './data/carts.js'
import { seedOrders } from './data/orders.js'
import { seedReviews } from './data/reviews.js'
import { mockUser, mockAddresses } from './data/user.js'
import { seedCollectIds, seedHistory, seedSearchHistory } from './data/seeds.js'
import { couponTemplates, seedUserCoupons } from './data/coupons.js'
import { seedPoints, seedPointRecords, exchangeItems } from './data/points.js'
import { seedCheckin } from './data/checkin.js'
import { seedMessages } from './data/messages.js'
import { seckillSessions } from './data/seckill.js'
import { goods, getGoodsById } from './data/goods.js'

const KEYS = {
  cart: 'mock_cart',
  orders: 'mock_orders',
  reviews: 'mock_reviews',
  collect: 'goods_collect',
  history: 'browse_history',
  search: 'search_history',
  addresses: 'mock_addresses',
  user: 'mock_user',
  coupons: 'user_coupons',
  points: 'user_points',
  pointRecords: 'points_records',
  checkin: 'checkin',
  messages: 'messages',
  seckillPurchases: 'seckill_purchases',
  seeded: 'mock_seeded'
}

// 简单深拷贝（数据均为可 JSON 序列化对象）
const clone = (o) => JSON.parse(JSON.stringify(o))

// 首次启动时注入种子数据
export const initMockState = () => {
  if (wx.getStorageSync(KEYS.seeded)) return
  wx.setStorageSync(KEYS.cart, clone(seedCarts))
  wx.setStorageSync(KEYS.orders, clone(seedOrders))
  wx.setStorageSync(KEYS.reviews, clone(seedReviews))
  wx.setStorageSync(KEYS.addresses, clone(mockAddresses))
  wx.setStorageSync(KEYS.user, clone(mockUser))
  wx.setStorageSync(KEYS.collect, clone(seedCollectIds))
  wx.setStorageSync(KEYS.history, clone(seedHistory))
  wx.setStorageSync(KEYS.search, clone(seedSearchHistory))
  wx.setStorageSync(KEYS.coupons, clone(seedUserCoupons))
  wx.setStorageSync(KEYS.points, seedPoints)
  wx.setStorageSync(KEYS.pointRecords, clone(seedPointRecords))
  wx.setStorageSync(KEYS.checkin, clone(seedCheckin))
  wx.setStorageSync(KEYS.messages, clone(seedMessages))
  wx.setStorageSync(KEYS.seckillPurchases, [])
  wx.setStorageSync(KEYS.seeded, true)
}

// ===== 购物车 =====
export const getCart = () => wx.getStorageSync(KEYS.cart) || []
export const saveCart = (cart) => wx.setStorageSync(KEYS.cart, cart)

export const addToCart = ({ goodsId, specText, price, count, mainPic, name }) => {
  const cart = getCart()
  const goodsItem = getGoodsById(goodsId)
  const exist = cart.find((c) => c.goodsId === Number(goodsId) && c.specText === specText)
  if (exist) {
    exist.count = Math.min(exist.count + count, exist.stock || 999)
  } else {
    cart.push({
      id: 'c' + Date.now() + Math.floor(Math.random() * 1000),
      goodsId: Number(goodsId),
      name,
      mainPic,
      specText,
      price,
      count,
      checked: true,
      stock: goodsItem ? goodsItem.stock : 999,
      valid: true
    })
  }
  saveCart(cart)
  return { success: true, total: cart.filter((c) => c.valid).reduce((s, c) => s + c.count, 0) }
}

// ===== 订单 =====
export const getOrders = () => wx.getStorageSync(KEYS.orders) || []
export const saveOrders = (orders) => wx.setStorageSync(KEYS.orders, orders)

const genOrderNo = () => {
  const d = new Date()
  const pad = (n) => (n < 10 ? '0' + n : '' + n)
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}${Math.floor(Math.random() * 9000 + 1000)}`
}

export const createOrder = ({ items, addressId, remark }) => {
  const orders = getOrders()
  const addresses = getAddresses()
  const address = addresses.find((a) => a.id === Number(addressId)) || addresses.find((a) => a.isDefault) || addresses[0]
  const totalAmount = items.reduce((s, it) => s + it.price * it.count, 0)
  const discountAmount = totalAmount >= 99 ? 10 : totalAmount >= 49 ? 5 : 0
  const payAmount = +(totalAmount - discountAmount).toFixed(2)
  const order = {
    id: 20000 + orders.length + Math.floor(Math.random() * 100),
    orderNo: genOrderNo(),
    status: 1,
    statusText: '待付款',
    items,
    totalAmount: +totalAmount.toFixed(2),
    discountAmount,
    freight: 0,
    payAmount,
    payMethod: '微信支付',
    remark: remark || '',
    addressSnapshot: address,
    createTime: Date.now(),
    logistics: {
      company: '顺丰速运',
      trackingNo: 'SF' + Math.floor(1e9 + Math.random() * 8.9e9),
      statusText: '待发货',
      timeline: [
        { title: '订单已提交', desc: '订单创建成功，等待付款', time: new Date().toLocaleString('zh-CN', { hour12: false }), done: true }
      ]
    },
    isReviewed: false
  }
  orders.unshift(order)
  saveOrders(orders)
  // 从购物车移除已结算商品
  const cart = getCart()
  const remain = cart.filter((c) => !items.some((it) => it.goodsId === c.goodsId && it.specText === c.specText))
  saveCart(remain)
  return order
}

export const updateOrderStatus = (orderNo, status, extra) => {
  const orders = getOrders()
  const order = orders.find((o) => o.orderNo === orderNo)
  if (!order) return null
  order.status = status
  const textMap = { 1: '待付款', 2: '待发货', 3: '配送中', 4: '待收货', 5: '已完成', 6: '已取消' }
  order.statusText = textMap[status]
  if (extra) Object.assign(order, extra)
  saveOrders(orders)
  return order
}

// ===== 评价 =====
export const getReviews = () => wx.getStorageSync(KEYS.reviews) || []
export const saveReviews = (reviews) => wx.setStorageSync(KEYS.reviews, reviews)

export const submitReviews = ({ orderId, items }) => {
  const reviews = getReviews()
  const user = getUser()
  const orders = getOrders()
  const order = orders.find((o) => o.id === Number(orderId))
  const now = Date.now()
  items.forEach((it, idx) => {
    reviews.unshift({
      id: 60000 + reviews.length + idx + Math.floor(Math.random() * 100),
      orderId: Number(orderId),
      goodsId: it.goodsId,
      userId: user.id,
      userName: user.nickName,
      userAvatar: user.avatar,
      rating: it.rating,
      content: it.content,
      images: it.images || [],
      tags: it.tags || [],
      createTime: now,
      specText: it.specText
    })
  })
  saveReviews(reviews)
  if (order) {
    order.isReviewed = true
    saveOrders(orders)
  }
  return { success: true, points: 20 }
}

// ===== 收藏（存储 goodsId 数组）=====
export const getCollect = () => wx.getStorageSync(KEYS.collect) || []
// 解析为完整商品对象列表
export const getCollectGoods = () => {
  const ids = getCollect()
  return ids.map((id) => getGoodsById(id)).filter(Boolean)
}
export const toggleCollect = (goodsId) => {
  let collect = getCollect()
  const gid = Number(goodsId)
  const exist = collect.includes(gid)
  if (exist) {
    collect = collect.filter((id) => id !== gid)
    wx.setStorageSync(KEYS.collect, collect)
    return { isCollect: false }
  }
  collect.push(gid)
  wx.setStorageSync(KEYS.collect, collect)
  return { isCollect: true }
}

// ===== 浏览足迹（{ goodsId, name, mainPic, price, browseTime }，去重，最多 50 条）=====
export const getHistory = () => wx.getStorageSync(KEYS.history) || []
export const saveHistory = (list) => wx.setStorageSync(KEYS.history, list)

export const addHistory = (goodsId) => {
  const g = getGoodsById(goodsId)
  if (!g) return { success: false }
  let history = getHistory()
  // 去重：同一商品移除旧记录
  history = history.filter((h) => h.goodsId !== Number(goodsId))
  history.unshift({
    goodsId: g.id,
    name: g.name,
    mainPic: g.mainPic,
    price: g.price,
    browseTime: Date.now()
  })
  // 最多 50 条
  if (history.length > 50) history = history.slice(0, 50)
  saveHistory(history)
  return { success: true }
}

export const deleteHistory = (goodsId) => {
  let history = getHistory().filter((h) => h.goodsId !== Number(goodsId))
  saveHistory(history)
  return { success: true }
}

export const clearHistory = () => {
  saveHistory([])
  return { success: true }
}

// ===== 搜索历史（关键词字符串数组，去重，最多 15 条）=====
export const getSearchHistory = () => wx.getStorageSync(KEYS.search) || []
export const saveSearchHistory = (list) => wx.setStorageSync(KEYS.search, list)

export const addSearchHistory = (keyword) => {
  const kw = String(keyword).trim()
  if (!kw) return { success: false }
  let history = getSearchHistory().filter((k) => k !== kw)
  history.unshift(kw)
  if (history.length > 15) history = history.slice(0, 15)
  saveSearchHistory(history)
  return { success: true }
}

export const deleteSearchHistory = (keyword) => {
  saveSearchHistory(getSearchHistory().filter((k) => k !== keyword))
  return { success: true }
}

export const clearSearchHistory = () => {
  saveSearchHistory([])
  return { success: true }
}

// ===== 地址 =====
export const getAddresses = () => wx.getStorageSync(KEYS.addresses) || []
export const saveAddresses = (list) => wx.setStorageSync(KEYS.addresses, list)

export const addAddress = (addr) => {
  const list = getAddresses()
  const newAddr = { id: Date.now() + Math.floor(Math.random() * 100), isDefault: list.length === 0, ...addr }
  // 若标记为默认，则取消其他默认
  if (addr.isDefault) list.forEach((a) => (a.isDefault = false))
  list.push(newAddr)
  saveAddresses(list)
  return newAddr
}

export const updateAddress = (id, patch) => {
  const list = getAddresses()
  const idx = list.findIndex((a) => a.id === Number(id))
  if (idx === -1) return null
  Object.assign(list[idx], patch)
  if (patch.isDefault) list.forEach((a, i) => (a.isDefault = i === idx))
  saveAddresses(list)
  return list[idx]
}

export const deleteAddress = (id) => {
  const list = getAddresses()
  const target = list.find((a) => a.id === Number(id))
  if (!target) return { success: false, msg: '地址不存在' }
  if (target.isDefault) return { success: false, msg: '默认地址不可删除，请先设置其他地址为默认' }
  saveAddresses(list.filter((a) => a.id !== Number(id)))
  return { success: true }
}

export const setDefaultAddress = (id) => {
  const list = getAddresses()
  list.forEach((a) => (a.isDefault = a.id === Number(id)))
  saveAddresses(list)
  return true
}

// ===== 用户 =====
export const getUser = () => wx.getStorageSync(KEYS.user) || clone(mockUser)

// ===== 优惠券 =====
export const getCouponTemplates = () => couponTemplates
export const getUserCoupons = () => wx.getStorageSync(KEYS.coupons) || []
export const saveUserCoupons = (list) => wx.setStorageSync(KEYS.coupons, list)

// 领券：每人每券限领 1 张
export const receiveCoupon = (templateId) => {
  const list = getUserCoupons()
  const tid = Number(templateId)
  const tpl = couponTemplates.find(t => t.id === tid)
  if (!tpl) return { success: false, msg: '券模板不存在' }
  if (list.some(c => c.templateId === tid && c.status === 'unused')) {
    return { success: false, msg: '您已领取过该券' }
  }
  const now = Date.now()
  const coupon = {
    id: 20000 + list.length + Math.floor(Math.random() * 100),
    templateId: tid,
    status: 'unused',
    receiveTime: now,
    expireTime: now + tpl.validDays * 24 * 3600 * 1000,
    usedTime: null
  }
  list.push(coupon)
  saveUserCoupons(list)
  return { success: true, coupon }
}

// 使用券（下单时）
export const useCoupon = (couponId) => {
  const list = getUserCoupons()
  const c = list.find(x => x.id === Number(couponId))
  if (!c || c.status !== 'unused') return { success: false, msg: '券不可用' }
  c.status = 'used'
  c.usedTime = Date.now()
  saveUserCoupons(list)
  return { success: true }
}

// ===== 积分 =====
export const getPoints = () => wx.getStorageSync(KEYS.points) || 0
export const savePoints = (p) => wx.setStorageSync(KEYS.points, p)
export const getPointRecords = () => wx.getStorageSync(KEYS.pointRecords) || []
export const savePointRecords = (list) => wx.setStorageSync(KEYS.pointRecords, list)

export const addPoints = (amount, source, desc) => {
  const pts = getPoints() + amount
  savePoints(pts)
  const records = getPointRecords()
  records.unshift({
    id: Date.now() + Math.floor(Math.random() * 100),
    change: amount,
    source,
    desc,
    time: Date.now()
  })
  savePointRecords(records)
  return { success: true, points: pts }
}

// 积分兑换
export const exchangePoints = (exchangeId) => {
  const item = exchangeItems.find(e => e.id === exchangeId)
  if (!item) return { success: false, msg: '兑换项不存在' }
  const pts = getPoints()
  if (pts < item.cost) return { success: false, msg: '积分不足' }
  savePoints(pts - item.cost)
  const records = getPointRecords()
  records.unshift({
    id: Date.now(),
    change: -item.cost,
    source: '兑换',
    desc: `兑换「${item.name}」`,
    time: Date.now()
  })
  savePointRecords(records)
  // 如果是券兑换，发券到账
  if (item.type === 'cash' && item.couponTemplateId) {
    const list = getUserCoupons()
    const tpl = couponTemplates.find(t => t.id === item.couponTemplateId)
    const now = Date.now()
    list.push({
      id: 20000 + list.length + Math.floor(Math.random() * 100),
      templateId: item.couponTemplateId,
      status: 'unused',
      receiveTime: now,
      expireTime: now + tpl.validDays * 24 * 3600 * 1000,
      usedTime: null
    })
    saveUserCoupons(list)
  }
  // 如果是实物兑换（gift），按 0 元加入购物车
  if (item.type === 'gift' && item.goodsId) {
    const g = getGoodsById(item.goodsId)
    if (g) {
      addToCart({
        goodsId: item.goodsId,
        specText: '积分免费兑',
        price: 0,
        count: 1,
        mainPic: g.mainPic,
        name: g.name
      })
    }
  }
  return { success: true, item }
}

// ===== 签到 =====
export const getCheckin = () => wx.getStorageSync(KEYS.checkin) || clone(seedCheckin)
export const saveCheckin = (c) => wx.setStorageSync(KEYS.checkin, c)

export const doCheckin = () => {
  const c = getCheckin()
  const today = new Date()
  const ymd = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const month = ymd.slice(0, 7)
  // 本月已签
  if (c.month !== month) {
    c.month = month
    c.signedDays = []
  }
  const dayOfMonth = today.getDate()
  if (c.signedDays.includes(dayOfMonth)) {
    return { success: false, msg: '今日已签到' }
  }
  // 连续天数：昨天签过则 +1，否则重置为 1
  const yesterday = new Date(today.getTime() - 24 * 3600 * 1000)
  const ymdY = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  if (c.lastSignDate === ymdY) {
    c.streak = c.streak + 1
  } else {
    c.streak = 1
  }
  c.signedDays.push(dayOfMonth)
  c.lastSignDate = ymd
  saveCheckin(c)
  // 积分：按连签梯度
  const grid = [5, 5, 10, 10, 15, 20, 50]
  const reward = grid[(c.streak - 1) % 7]
  addPoints(reward, '签到', `连签第${c.streak}天 +${reward}`)
  return { success: true, reward, streak: c.streak }
}

// ===== 消息 =====
export const getMessages = () => wx.getStorageSync(KEYS.messages) || []
export const saveMessages = (list) => wx.setStorageSync(KEYS.messages, list)

export const addMessage = (msg) => {
  const list = getMessages()
  list.unshift({
    id: Date.now() + Math.floor(Math.random() * 100),
    isRead: false,
    createTime: Date.now(),
    ...msg
  })
  saveMessages(list)
  return { success: true }
}

export const markMessageRead = (id) => {
  const list = getMessages()
  const m = list.find(x => x.id === Number(id))
  if (m) { m.isRead = true; saveMessages(list) }
  return { success: true }
}

export const markAllRead = () => {
  const list = getMessages().map(m => ({ ...m, isRead: true }))
  saveMessages(list)
  return { success: true }
}

export const getUnreadCount = () => getMessages().filter(m => !m.isRead).length

// ===== 抢购 =====
export const getSeckillSessions = () => seckillSessions
export const getSeckillPurchases = () => wx.getStorageSync(KEYS.seckillPurchases) || []
export const saveSeckillPurchases = (list) => wx.setStorageSync(KEYS.seckillPurchases, list)

// 抢购加购：每人每场每商品限 1 件
export const seckillPurchase = ({ sessionId, goodsId, price }) => {
  const purchases = getSeckillPurchases()
  const key = `${sessionId}_${goodsId}`
  if (purchases.includes(key)) {
    return { success: false, msg: '每场每商品限购1件' }
  }
  purchases.push(key)
  saveSeckillPurchases(purchases)
  // 按抢购价加入购物车
  const g = getGoodsById(goodsId)
  if (!g) return { success: false, msg: '商品不存在' }
  addToCart({
    goodsId,
    specText: '限时抢购',
    price,
    count: 1,
    mainPic: g.mainPic,
    name: g.name
  })
  return { success: true }
}

export { goods, getGoodsById }
