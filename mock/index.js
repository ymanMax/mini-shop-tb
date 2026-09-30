// Mock 总入口：API 路由分发（url + method 匹配）
import { mockDelay } from './delay.js'
import { categories } from './data/categories.js'
import { goods, getGoodsById, getGoodsByCategory } from './data/goods.js'
import { hotWords } from './data/seeds.js'
import { exchangeItems } from './data/points.js'
import { checkinRewardGrid } from './data/checkin.js'
import * as store from './state.js'
import regeneratorRuntime from '../lib/runtime/runtime.js'

// 横幅轮播图
const banners = [
  { id: 1, title: '现烤烧饼 第二件半价', image: 'https://picsum.photos/seed/banner-1/750/360', link: '/pages/goods_list/index?keyword=烧饼' },
  { id: 2, title: '中秋糕点礼盒 提前预订', image: 'https://picsum.photos/seed/banner-2/750/360', link: '/pages/goods_list/index?keyword=礼盒' },
  { id: 3, title: '每日10点秒杀 低至5折', image: 'https://picsum.photos/seed/banner-3/750/360', link: '/pages/goods_list/index?keyword=秒杀' },
  { id: 4, title: '新品上市 樱花草莓酥', image: 'https://picsum.photos/seed/banner-4/750/360', link: '/pages/goods_detail/index?goods_id=7001' }
]

// 楼层数据（首页）
const floors = [
  {
    id: 1,
    title: '招牌必吃',
    icon: '⭐',
    goodsIds: [1001, 1003, 1005, 1002, 2002, 3001]
  },
  {
    id: 2,
    title: '早餐搭配',
    icon: '🌅',
    goodsIds: [2003, 3001, 3003, 1006, 1007, 6001]
  },
  {
    id: 3,
    title: '限时特惠',
    icon: '⏰',
    goodsIds: [8001, 8002, 8003, 8004, 7002, 4003]
  }
]

const ok = (data, msg = 'success') => ({ code: 200, data, msg })
const fail = (msg = '请求失败') => ({ code: 500, data: null, msg })

// 分页工具
const paginate = (list, page = 1, size = 10) => {
  const current = Number(page)
  const pageSize = Number(size)
  const start = (current - 1) * pageSize
  return {
    records: list.slice(start, start + pageSize),
    total: list.length,
    current,
    size: pageSize
  }
}

// 商品列表查询（分类/搜索/筛选/排序）
const queryGoods = (params) => {
  const { categoryId, subCategoryId, keyword, sort = 'comprehensive', minPrice, maxPrice, onlyStock, page = 1, size = 10 } = params
  let list = [...goods]
  if (categoryId) list = list.filter((g) => g.categoryId === Number(categoryId))
  if (subCategoryId) list = list.filter((g) => g.subCategoryId === Number(subCategoryId))
  if (keyword) {
    const kw = String(keyword).toLowerCase()
    list = list.filter((g) => g.name.toLowerCase().includes(kw) || g.tags.some((t) => t.includes(kw)) || g.categoryName === kw)
  }
  if (minPrice !== undefined && minPrice !== '') list = list.filter((g) => g.price >= Number(minPrice))
  if (maxPrice !== undefined && maxPrice !== '') list = list.filter((g) => g.price <= Number(maxPrice))
  if (onlyStock) list = list.filter((g) => g.stock > 0)
  // 排序
  if (sort === 'priceAsc') list.sort((a, b) => a.price - b.price)
  else if (sort === 'priceDesc') list.sort((a, b) => b.price - a.price)
  else if (sort === 'sales') list.sort((a, b) => b.sales - a.sales)
  else list.sort((a, b) => b._heat - a._heat)
  return paginate(list, page, size)
}

// 评价列表查询
const queryReviews = (params) => {
  const { goodsId, rating, tag, page = 1, size = 10 } = params
  let list = [...store.getReviews()]
  if (goodsId) list = list.filter((r) => r.goodsId === Number(goodsId))
  if (rating === 'good') list = list.filter((r) => r.rating >= 4)
  else if (rating === 'mid') list = list.filter((r) => r.rating === 3)
  else if (rating === 'bad') list = list.filter((r) => r.rating <= 2)
  else if (rating === 'all') { /* 全部 */ }
  if (tag === 'withImage') list = list.filter((r) => r.images && r.images.length > 0)
  list.sort((a, b) => b.createTime - a.createTime)
  return paginate(list, page, size)
}

// 评价统计
const reviewSummary = (goodsId) => {
  const list = store.getReviews().filter((r) => r.goodsId === Number(goodsId))
  const total = list.length
  const stars = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  list.forEach((r) => stars[r.rating]++)
  const avg = total ? (list.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : '5.0'
  const distribution = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: stars[s],
    percent: total ? Math.round((stars[s] / total) * 100) : 0
  }))
  return { total, avg, distribution }
}

// 路由表：method + url 匹配
const routes = [
  // ===== 首页 =====
  { method: 'GET', url: '/home/swiperdata', handler: () => ok(banners) },
  { method: 'GET', url: '/home/catitems', handler: () => ok(categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon, image_src: `https://picsum.photos/seed/cat-${c.id}/200/200` }))) },
  { method: 'GET', url: '/home/floordata', handler: () => ok(floors.map((f) => ({
    id: f.id,
    floor_title: { title: f.title, icon: f.icon },
    product_list: f.goodsIds.map((id) => getGoodsById(id)).filter(Boolean)
  }))) },

  // ===== 分类 =====
  { method: 'GET', url: '/categories', handler: () => ok(categories) },

  // ===== 商品 =====
  { method: 'GET', url: '/goods/list', handler: (params) => ok(queryGoods(params)) },
  { method: 'GET', url: '/goods/search', handler: (params) => ok(queryGoods({ ...params, size: 20 })) },
  { method: 'GET', url: '/goods/detail', handler: (params) => {
    const g = getGoodsById(params.goodsId)
    if (!g) return fail('商品不存在')
    const collect = store.getCollect()
    const { _heat, ...rest } = g
    return ok({ ...rest, isCollect: collect.includes(g.id), reviewSummary: reviewSummary(g.id) })
  } },
  // 搜索联想：前缀匹配商品名（最多 10 条）
  { method: 'GET', url: '/search/suggest', handler: (params) => {
    const kw = String(params.keyword || '').toLowerCase().trim()
    if (!kw) return ok([])
    const list = goods
      .filter((g) => g.name.toLowerCase().includes(kw))
      .slice(0, 10)
      .map((g) => ({ id: g.id, name: g.name, mainPic: g.mainPic, price: g.price }))
    return ok(list)
  } },
  { method: 'GET', url: '/goods/reviews', handler: (params) => ok(queryReviews(params)) },
  { method: 'GET', url: '/goods/recommend', handler: (params) => {
    const g = getGoodsById(params.goodsId)
    if (!g) return ok([])
    const list = goods.filter((x) => x.categoryId === g.categoryId && x.id !== g.id)
    // 随机取 5 个（用 sales 做伪随机，保证稳定）
    const picked = list.sort((a, b) => (b._heat + g.id) % 7 - (a._heat + g.id) % 7).slice(0, 5)
    return ok(picked)
  } },

  // ===== 购物车 =====
  { method: 'GET', url: '/cart/list', handler: () => {
    const cart = store.getCart()
    const valid = cart.filter((c) => c.valid)
    const invalid = cart.filter((c) => !c.valid)
    return ok({ valid, invalid, total: valid.reduce((s, c) => s + c.count, 0) })
  } },
  { method: 'POST', url: '/cart/add', handler: (params) => ok(store.addToCart(params)) },
  { method: 'POST', url: '/cart/update', handler: (params) => {
    const cart = store.getCart()
    const item = cart.find((c) => c.id === params.id)
    if (!item) return fail('购物车商品不存在')
    if (params.count !== undefined) item.count = Math.max(1, Math.min(params.count, item.stock || 999))
    if (params.checked !== undefined) item.checked = !!params.checked
    store.saveCart(cart)
    return ok({ success: true })
  } },
  { method: 'POST', url: '/cart/remove', handler: (params) => {
    let cart = store.getCart()
    const ids = Array.isArray(params.ids) ? params.ids : [params.id]
    cart = cart.filter((c) => !ids.includes(c.id))
    store.saveCart(cart)
    return ok({ success: true })
  } },
  { method: 'POST', url: '/cart/clearInvalid', handler: () => {
    const cart = store.getCart().filter((c) => c.valid)
    store.saveCart(cart)
    return ok({ success: true })
  } },

  // ===== 地址 =====
  { method: 'GET', url: '/address/list', handler: () => ok(store.getAddresses()) },
  { method: 'POST', url: '/address/add', handler: (params) => ok(store.addAddress(params)) },
  { method: 'POST', url: '/address/update', handler: (params) => ok(store.updateAddress(params.id, params.patch || params)) },
  { method: 'POST', url: '/address/delete', handler: (params) => ok(store.deleteAddress(params.id)) },
  { method: 'POST', url: '/address/setDefault', handler: (params) => ok(store.setDefaultAddress(params.id)) },

  // ===== 订单 =====
  { method: 'GET', url: '/orders/list', handler: (params) => {
    let list = [...store.getOrders()]
    if (params.status && params.status !== 'all' && Number(params.status) !== 0) {
      const s = Number(params.status)
      // 待收货 Tab 包含 配送中(3) + 待收货(4)
      if (s === 4) list = list.filter((o) => o.status === 3 || o.status === 4)
      else list = list.filter((o) => o.status === s)
    }
    list.sort((a, b) => b.createTime - a.createTime)
    return ok(paginate(list, params.page || 1, params.size || 10))
  } },
  { method: 'GET', url: '/orders/detail', handler: (params) => {
    const order = store.getOrders().find((o) => o.id === Number(params.id) || o.orderNo === params.orderNo)
    if (!order) return fail('订单不存在')
    return ok(order)
  } },
  { method: 'POST', url: '/orders/create', handler: (params) => ok(store.createOrder(params)) },
  { method: 'POST', url: '/orders/pay', handler: (params) => {
    const order = store.updateOrderStatus(params.orderNo, 2, {
      logistics: {
        company: '顺丰速运',
        trackingNo: 'SF' + Math.floor(1e9 + Math.random() * 8.9e9),
        statusText: '待发货',
        timeline: [
          { title: '订单已提交', desc: '订单创建成功，等待付款', time: new Date(params.createTime || Date.now()).toLocaleString('zh-CN', { hour12: false }), done: true },
          { title: '付款成功', desc: '微信支付完成，等待商家发货', time: new Date().toLocaleString('zh-CN', { hour12: false }), done: true }
        ]
      }
    })
    return ok(order)
  } },
  { method: 'POST', url: '/orders/cancel', handler: (params) => {
    const order = store.updateOrderStatus(params.orderNo, 6, {
      logistics: { ...store.getOrders().find((o) => o.orderNo === params.orderNo)?.logistics, statusText: '已取消' }
    })
    return ok(order)
  } },
  { method: 'POST', url: '/orders/ship', handler: (params) => {
    const order = store.getOrders().find((o) => o.orderNo === params.orderNo)
    if (!order) return fail('订单不存在')
    order.status = 3
    order.statusText = '配送中'
    order.logistics.statusText = '运输中'
    order.logistics.timeline.push(
      { title: '商家已发货', desc: '包裹已交由顺丰速运揽收', time: new Date().toLocaleString('zh-CN', { hour12: false }), done: true },
      { title: '运输中', desc: '包裹已到达【石家庄转运中心】', time: new Date().toLocaleString('zh-CN', { hour12: false }), done: true }
    )
    store.saveOrders(store.getOrders())
    return ok(order)
  } },
  { method: 'POST', url: '/orders/deliver', handler: (params) => {
    const order = store.getOrders().find((o) => o.orderNo === params.orderNo)
    if (!order) return fail('订单不存在')
    order.status = 4
    order.statusText = '待收货'
    order.logistics.statusText = '派送中'
    order.logistics.timeline.push(
      { title: '到达派送点', desc: '包裹已到达【朝阳望京营业部】，派送员：张师傅 138****1234', time: new Date().toLocaleString('zh-CN', { hour12: false }), done: true },
      { title: '派送中', desc: '派送员正在为您送货，请保持电话畅通', time: '', done: false }
    )
    store.saveOrders(store.getOrders())
    return ok(order)
  } },
  { method: 'POST', url: '/orders/confirmReceive', handler: (params) => {
    const order = store.getOrders().find((o) => o.orderNo === params.orderNo)
    if (!order) return fail('订单不存在')
    order.status = 5
    order.statusText = '已完成'
    order.logistics.statusText = '已签收'
    order.logistics.timeline = order.logistics.timeline.filter((t) => t.title !== '派送中')
    order.logistics.timeline.push({ title: '已签收', desc: '本人签收，感谢使用', time: new Date().toLocaleString('zh-CN', { hour12: false }), done: true })
    store.saveOrders(store.getOrders())
    return ok(order)
  } },
  { method: 'POST', url: '/orders/urge', handler: () => ok({ success: true, message: '已提醒商家发货，我们会尽快为您安排～' }) },
  { method: 'POST', url: '/orders/again', handler: (params) => {
    const order = store.getOrders().find((o) => o.orderNo === params.orderNo)
    if (!order) return fail('订单不存在')
    order.items.forEach((it) => {
      store.addToCart({ goodsId: it.goodsId, specText: it.specText, price: it.price, count: it.count, mainPic: it.mainPic, name: it.name })
    })
    return ok({ success: true })
  } },

  // ===== 评价 =====
  { method: 'GET', url: '/reviews/list', handler: (params) => ok(queryReviews(params)) },
  { method: 'POST', url: '/reviews/submit', handler: (params) => ok(store.submitReviews(params)) },

  // ===== 收藏（返回完整商品对象）=====
  { method: 'GET', url: '/collect/list', handler: () => ok(store.getCollectGoods()) },
  { method: 'POST', url: '/collect/toggle', handler: (params) => ok(store.toggleCollect(params.goodsId)) },

  // ===== 浏览足迹 =====
  { method: 'GET', url: '/history/list', handler: () => ok(store.getHistory()) },
  { method: 'POST', url: '/history/add', handler: (params) => ok(store.addHistory(params.goodsId)) },
  { method: 'POST', url: '/history/delete', handler: (params) => ok(store.deleteHistory(params.goodsId)) },
  { method: 'POST', url: '/history/clear', handler: () => ok(store.clearHistory()) },

  // ===== 搜索历史 =====
  { method: 'GET', url: '/search/hot', handler: () => ok(hotWords) },
  { method: 'GET', url: '/search/history', handler: () => ok(store.getSearchHistory()) },
  { method: 'POST', url: '/search/history/add', handler: (params) => ok(store.addSearchHistory(params.keyword)) },
  { method: 'POST', url: '/search/history/delete', handler: (params) => ok(store.deleteSearchHistory(params.keyword)) },
  { method: 'POST', url: '/search/history/clear', handler: () => ok(store.clearSearchHistory()) },

  // ===== 用户 =====
  { method: 'GET', url: '/user/info', handler: () => ok(store.getUser()) },

  // ===== 限时抢购 =====
  { method: 'GET', url: '/seckill/sessions', handler: () => {
    // 组装每场商品完整信息（含商品图/名）
    const sessions = store.getSeckillSessions().map(s => ({
      ...s,
      products: s.products.map(p => {
        const g = store.getGoodsById(p.goodsId)
        const soldPct = Math.round(p.sold / p.stock * 100)
        return {
          ...p,
          name: g ? g.name : '',
          mainPic: g ? g.mainPic : '',
          soldPct,
          remain: p.stock - p.sold,
          soldOut: p.sold >= p.stock
        }
      })
    }))
    return ok(sessions)
  } },
  { method: 'POST', url: '/seckill/buy', handler: (params) => ok(store.seckillPurchase(params)) },

  // ===== 优惠券 =====
  { method: 'GET', url: '/coupon/templates', handler: () => ok(store.getCouponTemplates()) },
  { method: 'GET', url: '/coupon/list', handler: () => {
    // 返回用户券 + 模板信息合并
    const list = store.getUserCoupons().map(c => {
      const tpl = store.getCouponTemplates().find(t => t.id === c.templateId)
      return { ...c, template: tpl }
    })
    return ok(list)
  } },
  { method: 'POST', url: '/coupon/receive', handler: (params) => ok(store.receiveCoupon(params.templateId)) },
  { method: 'POST', url: '/coupon/use', handler: (params) => ok(store.useCoupon(params.couponId)) },

  // ===== 积分 =====
  { method: 'GET', url: '/points/info', handler: () => ok({
    points: store.getPoints(),
    records: store.getPointRecords(),
    exchangeItems
  }) },
  { method: 'GET', url: '/points/records', handler: () => ok(store.getPointRecords()) },
  { method: 'POST', url: '/points/add', handler: (params) => ok(store.addPoints(params.amount, params.source, params.desc)) },
  { method: 'GET', url: '/points/exchange', handler: () => ok(exchangeItems) },
  { method: 'POST', url: '/points/exchange', handler: (params) => ok(store.exchangePoints(params.exchangeId)) },

  // ===== 签到 =====
  { method: 'GET', url: '/checkin/info', handler: () => {
    const c = store.getCheckin()
    return ok({ ...c, grid: checkinRewardGrid })
  } },
  { method: 'POST', url: '/checkin/do', handler: () => ok(store.doCheckin()) },

  // ===== 消息 =====
  { method: 'GET', url: '/message/list', handler: () => ok(store.getMessages()) },
  { method: 'POST', url: '/message/read', handler: (params) => ok(store.markMessageRead(params.id)) },
  { method: 'POST', url: '/message/readAll', handler: () => ok(store.markAllRead()) },
  { method: 'POST', url: '/message/push', handler: (params) => ok(store.addMessage(params)) },
  { method: 'GET', url: '/message/unread', handler: () => ok({ count: store.getUnreadCount() }) },

  // ===== 图片上传（mock：直接返回本地路径）=====
  { method: 'POST', url: '/upload', handler: (params) => ok({ url: params.path || params.tempFilePath || 'https://picsum.photos/seed/upload-' + Date.now() + '/400/400' }) }
]

// Mock 请求入口
export const mockRequest = async (options) => {
  await mockDelay()
  const { url, method = 'GET', data = {} } = options
  // 去除 query string
  const path = url.split('?')[0]
  const route = routes.find((r) => r.method === method.toUpperCase() && r.url === path)
  if (!route) {
    return { code: 404, data: null, msg: `Mock 接口未匹配: ${method} ${path}` }
  }
  try {
    const result = route.handler(data)
    return result
  } catch (e) {
    return { code: 500, data: null, msg: 'Mock 处理异常: ' + e.message }
  }
}
