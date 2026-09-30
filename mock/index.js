// Mock 总入口：API 路由分发（url + method 匹配）
import { delay } from './delay.js'
import { categories } from './data/categories.js'
import { goodsList } from './data/goods.js'
import { initialCarts } from './data/carts.js'
import { initialOrders } from './data/orders.js'
import { initialReviews } from './data/reviews.js'
import { mockUser, initialAddresses } from './data/user.js'
import { initialCollect } from './data/collect.js'
import { initialHistory } from './data/history.js'
import { initialSearchHistory, hotWords } from './data/search.js'
import { seckillSessions } from './data/seckill.js'
import { couponTemplates, initialUserCoupons } from './data/coupon.js'
import { initialPointsRecords, exchangeItems } from './data/points.js'
import { initialCheckin, checkinRewards } from './data/checkin.js'
import { initialMessages } from './data/message.js'

// ============ 内存状态（首次从 storage 读取，写操作双写） ============
const load = (key, fallback) => {
  const v = wx.getStorageSync(key)
  return v ? v : fallback
}

let cartList = load('mk_cart', JSON.parse(JSON.stringify(initialCarts)))
let orderList = load('mk_orders', JSON.parse(JSON.stringify(initialOrders)))
let reviewList = load('mk_reviews', JSON.parse(JSON.stringify(initialReviews)))
let collectList = load('goods_collect', JSON.parse(JSON.stringify(initialCollect)))
let addressList = load('addresses', JSON.parse(JSON.stringify(initialAddresses)))
let historyList = load('browse_history', JSON.parse(JSON.stringify(initialHistory)))
let searchHistory = load('search_history', JSON.parse(JSON.stringify(initialSearchHistory)))
let userCoupons = load('user_coupons', JSON.parse(JSON.stringify(initialUserCoupons)))
let userPoints = load('user_points', 680)
let pointsRecords = load('points_records', JSON.parse(JSON.stringify(initialPointsRecords)))
let checkinState = load('checkin', JSON.parse(JSON.stringify(initialCheckin)))
let messageList = load('messages', JSON.parse(JSON.stringify(initialMessages)))

const persist = () => {
  wx.setStorageSync('mk_cart', cartList)
  wx.setStorageSync('mk_orders', orderList)
  wx.setStorageSync('mk_reviews', reviewList)
  wx.setStorageSync('goods_collect', collectList)
  wx.setStorageSync('addresses', addressList)
  wx.setStorageSync('browse_history', historyList)
  wx.setStorageSync('search_history', searchHistory)
  wx.setStorageSync('user_coupons', userCoupons)
  wx.setStorageSync('user_points', userPoints)
  wx.setStorageSync('points_records', pointsRecords)
  wx.setStorageSync('checkin', checkinState)
  wx.setStorageSync('messages', messageList)
}

// ============ 工具 ============
const ok = (data, msg = 'success') => ({ code: 200, data, msg })
const fail = (msg = 'error', code = 500) => ({ code, data: null, msg })

const paginate = (list, page, size) => {
  const current = Number(page) || 1
  const s = Number(size) || 10
  const start = (current - 1) * s
  return {
    records: list.slice(start, start + s),
    total: list.length,
    current,
    size: s
  }
}

// ============ 路由表 ============
const routes = [
  // ---- 首页 ----
  {
    url: '/home/swiper', method: 'GET',
    handler: () => ok([
      { id: 1, image: 'https://picsum.photos/seed/banner-shaobing/750/360', link: '/pages/goods_detail/index?goods_id=101', title: '现烤烧饼 新品上市' },
      { id: 2, image: 'https://picsum.photos/seed/banner-jingdian/750/360', link: '/pages/goods_detail/index?goods_id=201', title: '京八件礼盒 限时特惠' },
      { id: 3, image: 'https://picsum.photos/seed/banner-nuts/750/360', link: '/pages/goods_detail/index?goods_id=401', title: '每日坚果 买二送一' },
      { id: 4, image: 'https://picsum.photos/seed/banner-sale/750/360', link: '/pages/category/index', title: '限时特惠 亏本冲量' }
    ])
  },
  {
    url: '/home/cates', method: 'GET',
    handler: () => ok(categories.slice(0, 8).map(c => ({ id: c.id, name: c.name, icon: c.icon })))
  },
  {
    url: '/home/floors', method: 'GET',
    handler: () => ok([
      {
        id: 1, title: '烧饼类', icon: '🫓',
        list: goodsList.filter(g => g.categoryId === 1).slice(0, 4)
      },
      {
        id: 2, title: '糕点类', icon: '🍪',
        list: goodsList.filter(g => g.categoryId === 2).slice(0, 4)
      },
      {
        id: 3, title: '零食类', icon: '🍿',
        list: goodsList.filter(g => g.categoryId === 4).slice(0, 4)
      }
    ])
  },

  // ---- 分类 ----
  {
    url: '/categories', method: 'GET',
    handler: () => ok(categories)
  },

  // ---- 商品 ----
  {
    url: '/goods/list', method: 'GET',
    handler: (params) => {
      let list = [...goodsList]
      if (params.categoryId) list = list.filter(g => g.categoryId === Number(params.categoryId))
      if (params.subCategoryId) list = list.filter(g => g.subCategoryId === Number(params.subCategoryId))
      if (params.keyword) {
        const kw = String(params.keyword).toLowerCase()
        list = list.filter(g => g.name.toLowerCase().includes(kw) || g.categoryName.includes(params.keyword))
      }
      if (params.priceMin) list = list.filter(g => g.price >= Number(params.priceMin))
      if (params.priceMax) list = list.filter(g => g.price <= Number(params.priceMax))
      if (params.onlyStock === '1' || params.onlyStock === 1) list = list.filter(g => g.stock > 0)
      // 排序
      if (params.sort === 'priceAsc') list.sort((a, b) => a.price - b.price)
      else if (params.sort === 'priceDesc') list.sort((a, b) => b.price - a.price)
      else if (params.sort === 'sales') list.sort((a, b) => b.sales - a.sales)
      else list.sort((a, b) => b.sales - a.sales) // 综合默认按销量
      return ok(paginate(list, params.page, params.size))
    }
  },
  {
    url: '/goods/detail', method: 'GET',
    handler: (params) => {
      const g = goodsList.find(n => n.id === Number(params.id || params.goodsId))
      if (!g) return fail('商品不存在', 404)
      return ok({ ...g, isCollect: collectList.some(c => c.id === g.id) })
    }
  },
  {
    url: '/goods/recommend', method: 'GET',
    handler: (params) => {
      const pool = goodsList.filter(g => g.categoryId === Number(params.categoryId) && g.id !== Number(params.excludeId))
      // 稳定取 6 个
      const picked = pool.slice(0, 6)
      return ok(picked)
    }
  },

  // ---- 购物车 ----
  {
    url: '/cart/list', method: 'GET',
    handler: () => ok(cartList)
  },
  {
    url: '/cart/add', method: 'POST',
    handler: (params) => {
      const { goodsId, specText, price, count, mainPic, name, stock } = params
      const exist = cartList.find(c => c.goodsId === Number(goodsId) && c.specText === specText)
      if (exist) {
        exist.count += Number(count) || 1
        exist.checked = true
      } else {
        cartList.push({
          id: 'c' + Date.now(),
          goodsId: Number(goodsId),
          name, mainPic, specText, price: Number(price),
          count: Number(count) || 1,
          checked: true,
          stock: stock || 999
        })
      }
      persist()
      return ok({ cart: cartList, total: cartList.reduce((s, c) => s + c.count, 0) })
    }
  },
  {
    url: '/cart/update', method: 'POST',
    handler: (params) => {
      const item = cartList.find(c => c.id === params.id)
      if (!item) return fail('购物车项不存在')
      if (params.count !== undefined) item.count = Math.max(1, Number(params.count))
      if (params.checked !== undefined) item.checked = !!params.checked
      persist()
      return ok(cartList)
    }
  },
  {
    url: '/cart/remove', method: 'POST',
    handler: (params) => {
      cartList = cartList.filter(c => c.id !== params.id)
      persist()
      return ok(cartList)
    }
  },
  {
    url: '/cart/clearInvalid', method: 'POST',
    handler: () => {
      cartList = cartList.filter(c => c.stock > 0)
      persist()
      return ok(cartList)
    }
  },

  // ---- 订单 ----
  {
    url: '/orders/list', method: 'GET',
    handler: (params) => {
      let list = [...orderList].sort((a, b) => b.createTime - a.createTime)
      if (params.status && params.status !== '0') {
        const s = Number(params.status)
        // 待收货 tab 包含 配送中(3) 与 待收货(4)
        if (s === 3) list = list.filter(o => o.status === 3 || o.status === 4)
        else list = list.filter(o => o.status === s)
      }
      return ok(paginate(list, params.page, params.size))
    }
  },
  {
    url: '/orders/detail', method: 'GET',
    handler: (params) => {
      const o = orderList.find(n => n.id === params.id || n.orderNo === params.orderNo)
      if (!o) return fail('订单不存在', 404)
      return ok(o)
    }
  },
  {
    url: '/orders/create', method: 'POST',
    handler: (params) => {
      const { items, address, totalAmount, discountAmount, freight, payAmount } = params
      const d = new Date()
      const pad = n => String(n).padStart(2, '0')
      const orderNo = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}${String(Math.floor(Math.random() * 900) + 100)}`
      const newOrder = {
        id: 'o' + Date.now(),
        orderNo,
        status: 2, // 待发货
        items,
        totalAmount: Number(totalAmount),
        discountAmount: Number(discountAmount) || 0,
        freight: Number(freight) || 0,
        payAmount: Number(payAmount),
        addressSnapshot: address,
        createTime: d.getTime(),
        logistics: {
          company: '顺丰速运',
          trackingNo: 'SF' + String(Math.floor(Math.random() * 9000000000) + 1000000000),
          statusText: '商家已接单，正在打包',
          timeline: [
            { title: '订单已创建', desc: '商家已收到订单，正在准备发货', time: d.getTime(), done: true },
            { title: '商品已打包', desc: '商品已打包完成，等待快递揽收', time: null, done: false },
            { title: '快递已揽收', desc: '顺丰速运已揽收，正在发往中转中心', time: null, done: false },
            { title: '运输中', desc: '快件正在发往目的地', time: null, done: false },
            { title: '已送达', desc: '快件已送达，请及时取件', time: null, done: false }
          ]
        },
        isReviewed: false
      }
      orderList.unshift(newOrder)
      // 清空已结算购物车
      cartList = cartList.filter(c => !c.checked)
      // 写入订单消息
      messageList.unshift({
        id: 'm' + Date.now(),
        type: 2,
        title: '订单支付成功',
        content: `您的订单 ${orderNo} 支付成功，商家正在为您打包。`,
        isRead: false,
        createTime: Date.now(),
        relatedId: newOrder.id
      })
      persist()
      return ok(newOrder)
    }
  },
  {
    url: '/orders/cancel', method: 'POST',
    handler: (params) => {
      const o = orderList.find(n => n.id === params.id)
      if (!o) return fail('订单不存在')
      o.status = 6
      o.logistics.statusText = '订单已取消'
      persist()
      return ok(o)
    }
  },
  {
    url: '/orders/confirm', method: 'POST',
    handler: (params) => {
      const o = orderList.find(n => n.id === params.id)
      if (!o) return fail('订单不存在')
      o.status = 5
      o.logistics.statusText = '已签收'
      o.logistics.timeline.forEach(n => { n.done = true; if (!n.time) n.time = Date.now() })
      persist()
      return ok(o)
    }
  },
  {
    url: '/orders/urge', method: 'POST',
    handler: () => ok({ urged: true })
  },
  {
    url: '/orders/pay', method: 'POST',
    handler: (params) => {
      const o = orderList.find(n => n.id === params.id)
      if (!o) return fail('订单不存在')
      o.status = 2 // 待发货
      o.logistics.statusText = '商家已接单，正在打包'
      o.logistics.timeline[0].done = true
      o.logistics.timeline[0].time = Date.now()
      persist()
      return ok(o)
    }
  },
  {
    url: '/orders/simulate', method: 'POST',
    handler: (params) => {
      const o = orderList.find(n => n.id === params.id)
      if (!o) return fail('订单不存在')
      // action: ship 发货 / deliver 配送 / reach 送达
      const now = Date.now()
      if (params.action === 'ship' && o.status === 2) {
        o.status = 3
        o.logistics.statusText = '快递已揽收，正在运输中'
        o.logistics.timeline[1].done = true; o.logistics.timeline[1].time = now
        o.logistics.timeline[2].done = true; o.logistics.timeline[2].time = now
      } else if (params.action === 'deliver' && o.status === 3) {
        o.status = 4
        o.logistics.statusText = '已到达驿站，请及时取件'
        o.logistics.timeline[3].done = true; o.logistics.timeline[3].time = now
        o.logistics.timeline[4].done = true; o.logistics.timeline[4].time = now
      } else if (params.action === 'reach' && o.status === 4) {
        o.status = 5
        o.logistics.statusText = '已签收'
        o.logistics.timeline.forEach(n => { n.done = true; if (!n.time) n.time = now })
      }
      persist()
      return ok(o)
    }
  },

  // ---- 评价 ----
  {
    url: '/reviews/list', method: 'GET',
    handler: (params) => {
      let list = [...reviewList].sort((a, b) => b.createTime - a.createTime)
      if (params.goodsId) list = list.filter(r => r.goodsId === Number(params.goodsId))
      if (params.filter === 'good') list = list.filter(r => r.rating >= 4)
      else if (params.filter === 'mid') list = list.filter(r => r.rating === 3)
      else if (params.filter === 'bad') list = list.filter(r => r.rating <= 2)
      else if (params.filter === 'withImage') list = list.filter(r => r.images && r.images.length > 0)
      return ok(paginate(list, params.page, params.size))
    }
  },
  {
    url: '/reviews/stats', method: 'GET',
    handler: (params) => {
      let list = [...reviewList]
      if (params.goodsId) list = list.filter(r => r.goodsId === Number(params.goodsId))
      const total = list.length
      const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      list.forEach(r => dist[r.rating]++)
      const avg = total ? (list.reduce((s, r) => s + r.rating, 0) / total).toFixed(1) : '5.0'
      return ok({ total, avg, dist })
    }
  },
  {
    url: '/reviews/submit', method: 'POST',
    handler: (params) => {
      const { orderId, goodsId, rating, content, tags, images, specText } = params
      const order = orderList.find(o => o.id === orderId)
      const newReview = {
        id: 'r' + Date.now(),
        orderId,
        goodsId: Number(goodsId),
        userId: 10001,
        userName: '烧饼爱好者',
        userAvatar: '/static/images/default-avatar.png',
        rating: Number(rating),
        content: content || '',
        images: images || [],
        tags: tags || [],
        createTime: Date.now(),
        specText: specText || ''
      }
      reviewList.unshift(newReview)
      if (order) order.isReviewed = true
      persist()
      return ok(newReview)
    }
  },

  // ---- 收藏 ----
  {
    url: '/collect/list', method: 'GET',
    handler: () => ok(collectList)
  },
  {
    url: '/collect/toggle', method: 'POST',
    handler: (params) => {
      const g = goodsList.find(n => n.id === Number(params.goodsId))
      if (!g) return fail('商品不存在')
      const idx = collectList.findIndex(c => c.id === g.id)
      let isCollect
      if (idx !== -1) {
        collectList.splice(idx, 1)
        isCollect = false
      } else {
        collectList.push({
          id: g.id, name: g.name, mainPic: g.mainPic,
          price: g.price, originalPrice: g.originalPrice,
          sales: g.sales, categoryId: g.categoryId
        })
        isCollect = true
      }
      persist()
      return ok({ isCollect })
    }
  },
  {
    url: '/collect/remove', method: 'POST',
    handler: (params) => {
      collectList = collectList.filter(c => c.id !== Number(params.goodsId))
      persist()
      return ok(collectList)
    }
  },

  // ---- 浏览足迹 ----
  {
    url: '/history/list', method: 'GET',
    handler: () => ok([...historyList].sort((a, b) => b.browseTime - a.browseTime))
  },
  {
    url: '/history/add', method: 'POST',
    handler: (params) => {
      const g = goodsList.find(n => n.id === Number(params.goodsId))
      if (!g) return fail('商品不存在')
      // 去重：同一商品更新时间戳并移到最前
      historyList = historyList.filter(h => h.goodsId !== g.id)
      historyList.unshift({
        goodsId: g.id,
        name: g.name,
        mainPic: g.mainPic,
        price: g.price,
        browseTime: Date.now()
      })
      // 最多 50 条
      if (historyList.length > 50) historyList = historyList.slice(0, 50)
      persist()
      return ok(historyList)
    }
  },
  {
    url: '/history/remove', method: 'POST',
    handler: (params) => {
      historyList = historyList.filter(h => h.goodsId !== Number(params.goodsId))
      persist()
      return ok(historyList)
    }
  },
  {
    url: '/history/clear', method: 'POST',
    handler: () => {
      historyList = []
      persist()
      return ok(historyList)
    }
  },

  // ---- 搜索历史 / 热门 ----
  {
    url: '/search/hot', method: 'GET',
    handler: () => ok(hotWords)
  },
  {
    url: '/search/history', method: 'GET',
    handler: () => ok(searchHistory)
  },
  {
    url: '/search/history/add', method: 'POST',
    handler: (params) => {
      const kw = String(params.keyword || '').trim()
      if (!kw) return fail('关键词不能为空')
      searchHistory = searchHistory.filter(k => k !== kw)
      searchHistory.unshift(kw)
      if (searchHistory.length > 15) searchHistory = searchHistory.slice(0, 15)
      persist()
      return ok(searchHistory)
    }
  },
  {
    url: '/search/history/remove', method: 'POST',
    handler: (params) => {
      searchHistory = searchHistory.filter(k => k !== params.keyword)
      persist()
      return ok(searchHistory)
    }
  },
  {
    url: '/search/history/clear', method: 'POST',
    handler: () => {
      searchHistory = []
      persist()
      return ok(searchHistory)
    }
  },
  // 搜索联想：前缀匹配商品名称（中文逐字前缀），前缀优先，其次包含
  {
    url: '/search/suggest', method: 'GET',
    handler: (params) => {
      const kw = String(params.keyword || '').trim().toLowerCase()
      if (!kw) return ok([])
      const prefix = goodsList.filter(g => g.name.toLowerCase().startsWith(kw))
      const contains = goodsList.filter(g => !g.name.toLowerCase().startsWith(kw) && g.name.toLowerCase().includes(kw))
      const matched = [...prefix, ...contains]
        .slice(0, 10)
        .map(g => ({ id: g.id, name: g.name, mainPic: g.mainPic, price: g.price }))
      return ok(matched)
    }
  },

  // ---- 用户 / 地址 ----
  {
    url: '/user/info', method: 'GET',
    handler: () => ok(mockUser)
  },
  {
    url: '/address/list', method: 'GET',
    handler: () => ok(addressList)
  },
  {
    url: '/address/save', method: 'POST',
    handler: (params) => {
      const addr = { ...params, id: params.id || 'a' + Date.now() }
      if (addr.isDefault) {
        addressList.forEach(a => a.isDefault = false)
      }
      const idx = addressList.findIndex(a => a.id === addr.id)
      if (idx !== -1) addressList[idx] = addr
      else addressList.push(addr)
      persist()
      return ok(addressList)
    }
  },
  {
    url: '/address/remove', method: 'POST',
    handler: (params) => {
      const addr = addressList.find(a => a.id === params.id)
      if (addr && addr.isDefault) return fail('默认地址不可删除，请先设置其他地址为默认')
      addressList = addressList.filter(a => a.id !== params.id)
      persist()
      return ok(addressList)
    }
  },
  {
    url: '/address/default', method: 'POST',
    handler: (params) => {
      addressList.forEach(a => a.isDefault = a.id === params.id)
      persist()
      return ok(addressList)
    }
  },

  // ---- 限时抢购 ----
  {
    url: '/seckill/sessions', method: 'GET',
    handler: () => {
      // 为每个场次补充商品详情
      const sessions = seckillSessions.map(s => ({
        ...s,
        items: s.items.map(it => {
          const g = goodsList.find(n => n.id === it.goodsId)
          return g ? { ...it, name: g.name, mainPic: g.mainPic, originalPrice: g.price, sales: g.sales } : it
        })
      }))
      return ok(sessions)
    }
  },
  // 抢购加购（限购 1 件/人/场/商品）
  {
    url: '/seckill/buy', method: 'POST',
    handler: (params) => {
      const { sessionId, goodsId, specText, count } = params
      // 检查限购：该场次该商品是否已抢过
      const seckillKey = `seckill_${sessionId}_${goodsId}`
      const bought = wx.getStorageSync(seckillKey)
      if (bought) return fail('每场每商品限购 1 件')
      const session = seckillSessions.find(s => s.id === sessionId)
      const item = session && session.items.find(i => i.goodsId === Number(goodsId))
      if (!item) return fail('抢购商品不存在')
      if (item.stock <= 0) return fail('已抢光')
      // 加入购物车（抢购价）
      const exist = cartList.find(c => c.goodsId === Number(goodsId) && c.specText === specText)
      if (exist) {
        exist.count += Number(count) || 1
        exist.checked = true
      } else {
        const g = goodsList.find(n => n.id === Number(goodsId))
        cartList.push({
          id: 'c' + Date.now(),
          goodsId: Number(goodsId),
          name: g.name,
          mainPic: g.mainPic,
          specText: specText || '标准装',
          price: item.seckillPrice,
          count: Number(count) || 1,
          checked: true,
          stock: item.stock
        })
      }
      wx.setStorageSync(seckillKey, true)
      persist()
      return ok({ cart: cartList })
    }
  },

  // ---- 优惠券 ----
  {
    url: '/coupon/templates', method: 'GET',
    handler: () => {
      // 标记当前用户是否已领取
      const list = couponTemplates.map(t => ({
        ...t,
        received: userCoupons.some(c => c.templateId === t.id && c.status === 1)
      }))
      return ok(list)
    }
  },
  {
    url: '/coupon/claim', method: 'POST',
    handler: (params) => {
      const tpl = couponTemplates.find(t => t.id === params.templateId)
      if (!tpl) return fail('券不存在')
      if (userCoupons.some(c => c.templateId === tpl.id && c.status === 1)) return fail('您已领取过该券')
      const now = Date.now()
      const userCoupon = {
        id: 'uc' + Date.now(),
        templateId: tpl.id,
        type: tpl.type,
        title: tpl.title,
        amount: tpl.amount,
        threshold: tpl.threshold,
        discount: tpl.discount,
        scope: tpl.scope,
        status: 1,
        receiveTime: now,
        expireTime: now + tpl.validDays * 24 * 3600 * 1000
      }
      userCoupons.unshift(userCoupon)
      persist()
      return ok(userCoupon)
    }
  },
  {
    url: '/coupon/my', method: 'GET',
    handler: (params) => {
      let list = [...userCoupons].sort((a, b) => b.receiveTime - a.receiveTime)
      if (params.status) list = list.filter(c => c.status === Number(params.status))
      return ok(list)
    }
  },
  // 计算券优惠金额
  {
    url: '/coupon/calc', method: 'POST',
    handler: (params) => {
      const { couponId, totalAmount } = params
      const coupon = userCoupons.find(c => c.id === couponId)
      if (!coupon || coupon.status !== 1) return fail('券不可用')
      if (totalAmount < coupon.threshold) return fail(`未满 ${coupon.threshold} 元`)
      let discountAmount = 0
      if (coupon.type === 2) {
        discountAmount = +(totalAmount * (1 - coupon.discount)).toFixed(2)
      } else {
        discountAmount = coupon.amount
      }
      return ok({ discountAmount })
    }
  },
  // 使用券（下单后标记）
  {
    url: '/coupon/use', method: 'POST',
    handler: (params) => {
      const coupon = userCoupons.find(c => c.id === params.couponId)
      if (!coupon) return fail('券不存在')
      coupon.status = 2
      coupon.orderId = params.orderId
      persist()
      return ok(coupon)
    }
  },

  // ---- 积分 ----
  {
    url: '/points/info', method: 'GET',
    handler: () => ok({ balance: userPoints, records: pointsRecords })
  },
  {
    url: '/points/records', method: 'GET',
    handler: (params) => ok(paginate(pointsRecords, params.page, params.size))
  },
  {
    url: '/points/exchange', method: 'POST',
    handler: (params) => {
      const item = exchangeItems.find(e => e.id === params.exchangeId)
      if (!item) return fail('兑换项不存在')
      if (userPoints < item.points) return fail('积分不足')
      userPoints -= item.points
      const now = Date.now()
      pointsRecords.unshift({
        id: 'pr' + Date.now(),
        points: -item.points,
        type: 4,
        source: `兑换${item.title}`,
        time: now
      })
      // 兑券：发一张券
      if (item.couponTemplateId) {
        const tpl = couponTemplates.find(t => t.id === item.couponTemplateId)
        userCoupons.unshift({
          id: 'uc' + Date.now(),
          templateId: tpl.id,
          type: tpl.type,
          title: tpl.title,
          amount: tpl.amount,
          threshold: tpl.threshold,
          discount: tpl.discount,
          scope: tpl.scope,
          status: 1,
          receiveTime: now,
          expireTime: now + tpl.validDays * 24 * 3600 * 1000
        })
      }
      // 免费兑换商品：加入购物车（0元）
      if (item.goodsId) {
        const g = goodsList.find(n => n.id === item.goodsId)
        if (g) {
          cartList.push({
            id: 'c' + Date.now(),
            goodsId: g.id,
            name: g.name,
            mainPic: g.mainPic,
            specText: '免费兑换',
            price: 0,
            count: 1,
            checked: true,
            stock: 1
          })
        }
      }
      persist()
      return ok({ balance: userPoints, item })
    }
  },

  // ---- 签到 ----
  {
    url: '/checkin/state', method: 'GET',
    handler: () => ok({ ...checkinState, rewards: checkinRewards })
  },
  {
    url: '/checkin/sign', method: 'POST',
    handler: () => {
      const now = new Date()
      const today = now.getDate()
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(today).padStart(2, '0')}`
      if (checkinState.lastSignDate === todayStr) return fail('今日已签到')
      // 断签判断：昨天是否签过
      const yesterday = new Date(now.getTime() - 24 * 3600 * 1000)
      const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
      let consecutive = checkinState.consecutiveDays
      if (checkinState.lastSignDate === yStr) {
        consecutive += 1
      } else {
        consecutive = 1
      }
      // 连签奖励：第7天50，第3/4天10，第5天15，第6天20，其余5
      const rewardIdx = (consecutive - 1) % 7
      const reward = checkinRewards[rewardIdx].points
      checkinState.consecutiveDays = consecutive
      checkinState.monthSigned = Array.from(new Set([...checkinState.monthSigned, today]))
      checkinState.lastSignDate = todayStr
      userPoints += reward
      pointsRecords.unshift({
        id: 'pr' + Date.now(),
        points: reward,
        type: 2,
        source: `每日签到（连签第${consecutive}天）`,
        time: Date.now()
      })
      persist()
      return ok({ reward, consecutive, balance: userPoints })
    }
  },

  // ---- 消息 ----
  {
    url: '/message/list', method: 'GET',
    handler: (params) => {
      let list = [...messageList].sort((a, b) => b.createTime - a.createTime)
      if (params.type && params.type !== '0') list = list.filter(m => m.type === Number(params.type))
      return ok(list)
    }
  },
  {
    url: '/message/unread', method: 'GET',
    handler: () => ok({ count: messageList.filter(m => !m.isRead).length })
  },
  {
    url: '/message/read', method: 'POST',
    handler: (params) => {
      const m = messageList.find(x => x.id === params.id)
      if (m) m.isRead = true
      persist()
      return ok(messageList)
    }
  },
  {
    url: '/message/readAll', method: 'POST',
    handler: () => {
      messageList.forEach(m => m.isRead = true)
      persist()
      return ok(messageList)
    }
  },
  {
    url: '/message/push', method: 'POST',
    handler: (params) => {
      const msg = {
        id: 'm' + Date.now(),
        type: params.type || 3,
        title: params.title,
        content: params.content,
        isRead: false,
        createTime: Date.now(),
        relatedId: params.relatedId || null
      }
      messageList.unshift(msg)
      persist()
      return ok(msg)
    }
  },

  // ---- 图片上传（mock） ----
  {
    url: '/upload', method: 'POST',
    handler: (params) => ok({ url: params.tempFilePath || 'https://picsum.photos/seed/upload/400/400' })
  }
]

// ============ 分发 ============
export const mockRequest = async (options) => {
  await delay()
  const { url, method = 'GET', data = {} } = options
  const route = routes.find(r => r.url === url && r.method === method)
  if (!route) {
    console.warn(`[mock] 未匹配路由: ${method} ${url}`)
    return fail(`接口不存在: ${method} ${url}`, 404)
  }
  return route.handler(data)
}
