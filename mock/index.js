/**
 * Mock 总入口：API 路由分发
 *
 * - 所有接口统一返回 { code, data, msg }
 * - 分页接口 data 结构为 { records, total, current, size }
 * - 写操作（加购 / 下单 / 评价 / 收藏 / 地址）先在内存中生效，再写入 storage 持久化
 * - 所有接口带 200~600ms 随机延迟，便于展示 loading 与骨架屏
 */
import delay from './delay.js';
import categories from './data/categories.js';
import goods from './data/goods.js';
import staticReviews from './data/reviews.js';
import initCarts from './data/carts.js';
import initOrders from './data/orders.js';
import { user as mockUser, address as mockAddress, addressList as mockAddressList } from './data/user.js';
import { collectGoodsIds, browseHistory, hotKeywords } from './data/history.js';
import { seckillSessions as seckillSeed } from './data/seckill.js';
import { couponTemplates as couponSeed, initialCoupons } from './data/coupons.js';
import { initialPoints, pointRecords as pointRecordSeed, pointGoods } from './data/points.js';
import { messages as messageSeed } from './data/messages.js';

/** storage 键名统一收口，避免各页面硬编码 */
export const STORAGE_KEYS = {
  cart: 'cartList',
  orders: 'orderList',
  /** 收藏：只存 goodsId 数组 */
  collect: 'goods_collect',
  /** 浏览足迹：{ goodsId, name, mainPic, price, browseTime } */
  history: 'browse_history',
  /** 收货地址列表 */
  addresses: 'addresses',
  /** 结算时选中的地址 id */
  selectedAddress: 'selectedAddressId',
  /** 用户持有的优惠券 */
  coupons: 'user_coupons',
  /** 用户积分余额 */
  points: 'user_points',
  /** 积分明细 */
  pointsRecords: 'points_records',
  /** 签到数据：{ consecutiveDays, signedDates } */
  checkin: 'checkin_data',
  /** 消息中心 */
  messages: 'messages',
  /** 抢购购买记录，用于「每人每场每商品限购 1 件」 */
  seckillRecords: 'seckill_records',
  reviews: 'userReviews',
  userInfo: 'userInfo',
};

/** 浏览足迹最多保留条数 */
const HISTORY_MAX = 50;
/** 收货地址最多保存条数 */
const ADDRESS_MAX = 10;
/** 抢购场次时长（小时） */
const SECKILL_DURATION = 2;
/** 每人每场每商品限购件数 */
const SECKILL_LIMIT = 1;
/** 购物返积分比例：每 1 元 = 1 积分 */
const POINTS_PER_YUAN = 1;
/** 评价奖励积分 */
const POINTS_PER_REVIEW = 20;
/** 连续签到 1~7 天的奖励梯度 */
const CHECKIN_REWARDS = [5, 5, 10, 10, 15, 20, 50];
/** 券临期提醒阈值（小时） */
const COUPON_EXPIRE_WARN_HOURS = 24;

// ------------------------------------------------------------------ 内存态
const read = (key, fallback) => {
  try {
    const value = wx.getStorageSync(key);
    return value === '' || value === undefined || value === null ? fallback : value;
  } catch (e) {
    return fallback;
  }
};

const write = (key, value) => {
  try {
    wx.setStorageSync(key, value);
  } catch (e) {
    /* 忽略写入异常，内存态仍然可用 */
  }
};

const clone = (value) => JSON.parse(JSON.stringify(value));

/** 全局内存态：首次访问时用 storage 或初始 Mock 数据水合 */
const store = {
  cart: null,
  orders: null,
  /** 收藏的 goodsId 数组 */
  collect: null,
  /** 浏览足迹，按 browseTime 倒序 */
  history: null,
  /** 收货地址数组 */
  addresses: null,
  /** 结算时选中的地址 id，0 表示未选 */
  selectedAddressId: null,
  /** 用户持有的优惠券 */
  coupons: null,
  /** 积分余额 */
  points: null,
  /** 积分明细 */
  pointsRecords: null,
  /** 签到数据 */
  checkin: null,
  /** 消息中心 */
  messages: null,
  /** 抢购购买记录 */
  seckillRecords: null,
  reviews: null,
  user: null,

  init() {
    // 首次进入时把初始 Mock 数据落盘，保证「读 storage 的角标」与「读接口的列表页」数据一致
    if (this.cart === null) {
      const cached = read(STORAGE_KEYS.cart, null);
      this.cart = cached || clone(initCarts);
      if (!cached) write(STORAGE_KEYS.cart, this.cart);
    }
    if (this.orders === null) {
      const cached = read(STORAGE_KEYS.orders, null);
      this.orders = cached || clone(initOrders);
      if (!cached) write(STORAGE_KEYS.orders, this.orders);
    }
    if (this.collect === null) {
      const cached = read(STORAGE_KEYS.collect, null);
      this.collect = Array.isArray(cached) ? cached : clone(collectGoodsIds);
      if (!Array.isArray(cached)) write(STORAGE_KEYS.collect, this.collect);
    }
    if (this.history === null) {
      const cached = read(STORAGE_KEYS.history, null);
      this.history = Array.isArray(cached) ? cached : buildHistorySeed();
      if (!Array.isArray(cached)) write(STORAGE_KEYS.history, this.history);
    }
    if (this.addresses === null) {
      const cached = read(STORAGE_KEYS.addresses, null);
      const usable = Array.isArray(cached) && cached.length > 0;
      this.addresses = usable ? cached : clone(mockAddressList);
      if (!usable) write(STORAGE_KEYS.addresses, this.addresses);
    }
    if (this.selectedAddressId === null) {
      this.selectedAddressId = Number(read(STORAGE_KEYS.selectedAddress, 0)) || 0;
    }
    if (this.coupons === null) {
      const cached = read(STORAGE_KEYS.coupons, null);
      const usable = Array.isArray(cached) && cached.length > 0;
      this.coupons = usable ? cached : buildCouponsSeed();
      if (!usable) write(STORAGE_KEYS.coupons, this.coupons);
    }
    if (this.points === null) {
      const cached = read(STORAGE_KEYS.points, null);
      this.points = typeof cached === 'number' ? cached : initialPoints;
      if (typeof cached !== 'number') write(STORAGE_KEYS.points, this.points);
    }
    if (this.pointsRecords === null) {
      const cached = read(STORAGE_KEYS.pointsRecords, null);
      const usable = Array.isArray(cached) && cached.length > 0;
      this.pointsRecords = usable ? cached : buildPointsSeed();
      if (!usable) write(STORAGE_KEYS.pointsRecords, this.pointsRecords);
    }
    if (this.checkin === null) {
      const cached = read(STORAGE_KEYS.checkin, null);
      const usable = !!cached && Array.isArray(cached.signedDates);
      this.checkin = usable ? cached : buildCheckinSeed();
      if (typeof this.checkin.todaySigned !== 'boolean') this.checkin.todaySigned = false;
      // 连续天数始终按已签日期实时推算，避免落盘值与日历显示不一致
      this.checkin.consecutiveDays = computeConsecutive(this.checkin.signedDates, this.checkin.todaySigned);
      write(STORAGE_KEYS.checkin, this.checkin);
    }
    if (this.messages === null) {
      const cached = read(STORAGE_KEYS.messages, null);
      const usable = Array.isArray(cached) && cached.length > 0;
      this.messages = usable ? cached : buildMessagesSeed();
      if (!usable) write(STORAGE_KEYS.messages, this.messages);
    }
    if (this.seckillRecords === null) this.seckillRecords = read(STORAGE_KEYS.seckillRecords, []);
    if (this.reviews === null) this.reviews = read(STORAGE_KEYS.reviews, []);
    // 用户信息以 app.js onLaunch 注入的登录态为准，缺失字段用 Mock 档案补齐
    if (this.user === null) this.user = { ...clone(mockUser), ...read(STORAGE_KEYS.userInfo, {}) };
    return this;
  },

  persistCart() {
    write(STORAGE_KEYS.cart, this.cart);
  },
  persistOrders() {
    write(STORAGE_KEYS.orders, this.orders);
  },
  persistCollect() {
    write(STORAGE_KEYS.collect, this.collect);
  },
  persistHistory() {
    write(STORAGE_KEYS.history, this.history);
  },
  persistAddresses() {
    write(STORAGE_KEYS.addresses, this.addresses);
  },
  persistSelectedAddress() {
    write(STORAGE_KEYS.selectedAddress, this.selectedAddressId);
  },
  persistCoupons() {
    write(STORAGE_KEYS.coupons, this.coupons);
  },
  persistPoints() {
    write(STORAGE_KEYS.points, this.points);
  },
  persistPointsRecords() {
    write(STORAGE_KEYS.pointsRecords, this.pointsRecords);
  },
  persistCheckin() {
    write(STORAGE_KEYS.checkin, this.checkin);
  },
  persistMessages() {
    write(STORAGE_KEYS.messages, this.messages);
  },
  persistSeckillRecords() {
    write(STORAGE_KEYS.seckillRecords, this.seckillRecords);
  },
  persistReviews() {
    write(STORAGE_KEYS.reviews, this.reviews);
  },
};

// ------------------------------------------------------------------ 工具
let autoId = 800000;
const nextId = () => ++autoId;

const ok = (data, msg = 'success') => ({ code: 200, data, msg });

/** 生成 { records, total, current, size } 分页结构 */
const paginate = (list, current = 1, size = 10) => {
  const page = Math.max(1, Number(current) || 1);
  const pageSize = Math.max(1, Number(size) || 10);
  const start = (page - 1) * pageSize;
  return {
    records: list.slice(start, start + pageSize),
    total: list.length,
    current: page,
    size: pageSize,
  };
};

/** 确定性伪随机，保证同一商品每次推荐结果稳定 */
const seededShuffle = (list, seed) => {
  const arr = list.slice();
  let s = seed || 1;
  const rand = () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const findGoods = (goodsId) => goods.find((g) => g.id === Number(goodsId));

/** 商品的收藏态以 store.collect（goodsId 数组）为准 */
const withCollect = (item) => ({ ...clone(item), isCollect: store.collect.includes(item.id) });

/**
 * 构造浏览足迹的初始数据
 * 种子数据用「距今多少小时」表达，水合时再换算成时间戳，
 * 这样无论何时运行都能覆盖「今天 / 昨天 / 更早」三个分组
 */
function buildHistorySeed() {
  const now = Date.now();
  return browseHistory
    .map(({ goodsId, hoursAgo }) => {
      const g = findGoods(goodsId);
      if (!g) return null;
      return {
        goodsId,
        name: g.name,
        mainPic: g.mainPic,
        price: g.price,
        browseTime: now - Math.round(hoursAgo * HOUR),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.browseTime - a.browseTime);
}

/** 当前默认地址（没有标记时退回第一条） */
const defaultAddress = () => store.addresses.find((a) => a.isDefault) || store.addresses[0] || null;

/** 结算时优先用「本次选中的地址」，否则回退到默认地址 */
const currentAddress = () => store.addresses.find((a) => a.id === store.selectedAddressId) || defaultAddress();

/** 把某条地址设为默认，其余取消 */
const markDefaultAddress = (id) => {
  store.addresses = store.addresses.map((a) => ({ ...a, isDefault: a.id === id }));
};

// ------------------------------------------------------------------ 时间 / 日期
const DAY_MS = 24 * 3600 * 1000;
const HOUR_MS = 3600 * 1000;

const pad2 = (n) => String(n).padStart(2, '0');

/** 时间戳 -> 'YYYY-MM-DD' */
const dateKey = (ts) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

/** 当天 0 点的时间戳 */
const dayStart = (ts) => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const round2 = (n) => Math.round(n * 100) / 100;

// ------------------------------------------------------------------ 各模块种子
/**
 * 从今天（今天已签则含今天，否则从昨天）往前数连续签到天数
 * 断签即中断，符合「断签重新从第 1 天计算」的规则
 */
function computeConsecutive(signedDates, todaySigned) {
  const signed = new Set(signedDates);
  let cursor = todaySigned ? dayStart(Date.now()) : dayStart(Date.now()) - DAY_MS;
  let count = 0;
  while (signed.has(dateKey(cursor))) {
    count += 1;
    cursor -= DAY_MS;
  }
  return count;
}

/** 签到种子：连签 3 天（截至昨天），当月共 8 天已签 */
function buildCheckinSeed() {
  const today = dayStart(Date.now());
  const monthStart = new Date(today);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  // 越靠近今天的偏移越先排，保证连续签到的这一段始终存在
  const offsets = [1, 2, 3, 6, 8, 11, 14, 17];
  const signedDates = offsets
    .map((o) => today - o * DAY_MS)
    .filter((ts) => ts >= monthStart.getTime())
    .map(dateKey)
    .sort();
  return { signedDates, todaySigned: false };
}

/** 用户持券种子：把 expireInHours 换算成真实起止时间 */
function buildCouponsSeed() {
  const now = Date.now();
  return initialCoupons.map((item, i) => {
    const tpl = couponSeed.filter((t) => t.id === item.templateId)[0];
    return {
      id: 6501 + i,
      templateId: tpl.id,
      type: tpl.type,
      title: tpl.title,
      amount: tpl.amount,
      threshold: tpl.threshold,
      scope: tpl.scope,
      scopeType: tpl.scopeType,
      categoryId: tpl.categoryId || 0,
      description: tpl.description,
      startTime: now - DAY_MS,
      endTime: now + item.expireInHours * HOUR_MS,
      status: item.status,
      usedTime: item.status === 'used' ? now - (item.usedDaysAgo || 1) * DAY_MS : 0,
      orderId: 0,
    };
  });
}

/** 积分明细种子：hoursAgo 换算成 createTime，按时间倒序 */
function buildPointsSeed() {
  const now = Date.now();
  return pointRecordSeed
    .map((r, i) => ({
      id: 7501 + i,
      type: r.points >= 0 ? 'earn' : 'spend',
      source: r.source,
      title: r.title,
      points: r.points,
      createTime: now - r.hoursAgo * HOUR_MS,
    }))
    .sort((a, b) => b.createTime - a.createTime);
}

/** 消息种子：hoursAgo 换算成 createTime，按时间倒序 */
function buildMessagesSeed() {
  const now = Date.now();
  return messageSeed
    .map((m) => ({
      id: m.id,
      type: m.type,
      title: m.title,
      content: m.content,
      isRead: m.isRead,
      createTime: now - m.hoursAgo * HOUR_MS,
      relatedType: m.relatedType,
      relatedId: m.relatedId,
    }))
    .sort((a, b) => b.createTime - a.createTime);
}

// ------------------------------------------------------------------ 券计算
/** 券的实时状态：已使用保持，过期按 endTime 判定 */
const couponStatus = (c) => {
  if (c.status === 'used') return 'used';
  return c.endTime <= Date.now() ? 'expired' : 'unused';
};

/** 补上状态、临期标记与展示文案 */
const withCouponStatus = (c) => {
  const status = couponStatus(c);
  const remainMs = c.endTime - Date.now();
  return {
    ...clone(c),
    status,
    expiring: status === 'unused' && remainMs > 0 && remainMs <= COUPON_EXPIRE_WARN_HOURS * HOUR_MS,
    remainHours: Math.max(0, Math.floor(remainMs / HOUR_MS)),
    startTimeText: dateKey(c.startTime),
    endTimeText: dateKey(c.endTime),
  };
};

/**
 * 某张券对指定金额的优惠额
 * 返回 -1 表示该券不可用
 */
const couponDiscountFor = (coupon, amount) => {
  if (coupon.type === 'none') return Math.min(coupon.amount, amount);
  if (amount < coupon.threshold) return -1;
  if (coupon.type === 'full') return Math.min(coupon.amount, amount);
  if (coupon.type === 'discount') {
    // 折扣券最高优惠 50 元，避免大额订单被折到 0
    return Math.min(round2(amount * (1 - coupon.amount)), 50);
  }
  return -1;
};

/** 不可用原因，用于支付页置灰说明 */
const couponUnavailableReason = (coupon, amount) => {
  if (amount < coupon.threshold) return `未满 ${coupon.threshold} 元`;
  return '当前订单不可用';
};

/** 从可用券中挑优惠最大的一张 */
const pickBestCoupon = (amount) => {
  let best = null;
  let bestDiscount = 0;
  store.coupons
    .filter((c) => couponStatus(c) === 'unused')
    .forEach((c) => {
      const d = couponDiscountFor(c, amount);
      if (d > bestDiscount) {
        bestDiscount = d;
        best = c;
      }
    });
  return best;
};

/** 按模板给用户发一张券 */
const grantCoupon = (tpl) => {
  const now = Date.now();
  const coupon = {
    id: nextId(),
    templateId: tpl.id,
    type: tpl.type,
    title: tpl.title,
    amount: tpl.amount,
    threshold: tpl.threshold,
    scope: tpl.scope,
    scopeType: tpl.scopeType,
    categoryId: tpl.categoryId || 0,
    description: tpl.description,
    startTime: now,
    endTime: now + tpl.days * DAY_MS,
    status: 'unused',
    usedTime: 0,
    orderId: 0,
  };
  store.coupons.unshift(coupon);
  store.persistCoupons();
  return coupon;
};

/**
 * 购物车加项的公共实现，/cart/add 与 /seckill/buy 共用
 * only = true 时只勾选当前商品，其余取消勾选（立即购买 / 马上抢）
 */
const addToCartInternal = ({ goodsId, name, mainPic, specText, price, count = 1, stock = 99, unit = '份', only = false }) => {
  if (only) store.cart.forEach((c) => { c.checked = false; });
  let item = store.cart.filter((c) => c.goodsId === Number(goodsId) && c.specText === specText && !c.invalid)[0];
  if (item) {
    item.count = Math.min(item.count + count, item.stock || stock);
    if (only) item.checked = true;
  } else {
    item = {
      id: nextId(),
      goodsId: Number(goodsId),
      name,
      mainPic,
      specText,
      price,
      count,
      checked: true,
      stock: stock || 99,
      unit: unit || '份',
      invalid: false,
    };
    store.cart.unshift(item);
  }
  store.persistCart();
  return item;
};

const cartTotalCount = () => store.cart.filter((c) => !c.invalid).reduce((s, c) => s + c.count, 0);

/** 券临期 24 小时自动生成提醒消息，同一张券只提醒一次 */
const ensureCouponExpiryMessages = () => {
  store.coupons.forEach((c) => {
    if (couponStatus(c) !== 'unused') return;
    const remain = c.endTime - Date.now();
    if (remain <= 0 || remain > COUPON_EXPIRE_WARN_HOURS * HOUR_MS) return;
    const exists = store.messages.some((m) => m.relatedType === 'coupon' && m.relatedId === c.id);
    if (exists) return;
    pushMessage({
      type: 3,
      title: '您有一张券即将过期',
      content: `「${c.title}」将于 ${dateKey(c.endTime)} 过期，记得尽快使用哦`,
      relatedType: 'coupon',
      relatedId: c.id,
    });
  });
};

// ------------------------------------------------------------------ 积分
/** 加/减积分并写入明细 */
const applyPoints = (points, source, title) => {
  store.points = Math.max(0, store.points + points);
  store.pointsRecords.unshift({
    id: nextId(),
    type: points >= 0 ? 'earn' : 'spend',
    source,
    title,
    points,
    createTime: Date.now(),
  });
  store.persistPoints();
  store.persistPointsRecords();
  return store.points;
};

// ------------------------------------------------------------------ 消息
/** 写入一条消息，返回该消息 */
const pushMessage = ({ type, title, content, relatedType = 'none', relatedId = 0 }) => {
  const message = {
    id: nextId(),
    type,
    title,
    content,
    isRead: false,
    createTime: Date.now(),
    relatedType,
    relatedId,
  };
  store.messages.unshift(message);
  // 统一按时间倒序排列，避免依赖插入顺序与时钟单调性
  store.messages.sort((a, b) => b.createTime - a.createTime);
  store.persistMessages();
  return message;
};

const unreadCount = () => store.messages.filter((m) => !m.isRead).length;

// ------------------------------------------------------------------ 抢购
/** 某场次当前的开始 / 结束时间戳（按当天固定时刻计算） */
const sessionRange = (session, baseTs) => {
  const base = new Date(baseTs);
  const start = new Date(base);
  start.setHours(session.startHour, 0, 0, 0);
  const end = new Date(base);
  end.setHours(session.startHour + SECKILL_DURATION, 0, 0, 0);
  return { start: start.getTime(), end: end.getTime() };
};

/**
 * 计算每个场次的状态
 * active 进行中 / upcoming 即将开始 / ended 已结束
 */
const buildSeckillState = () => {
  const now = Date.now();
  const sessions = seckillSeed.map((session) => {
    let { start, end } = sessionRange(session, now);
    let status;
    if (now >= start && now < end) status = 'active';
    else if (now < start) status = 'upcoming';
    else {
      // 今天的这一场已结束，同样的时刻明天还会再开一场
      status = 'ended';
    }
    const bought = store.seckillRecords;
    const goods = session.goods.map((g) => {
      const soldOut = g.remain <= 0;
      const boughtCount = bought.filter((r) => r.sessionId === session.id && r.goodsId === g.goodsId).length;
      return {
        ...clone(g),
        soldOut,
        // 限购：已买过或已抢光都不能再抢
        limitReached: boughtCount >= SECKILL_LIMIT,
        buyable: status === 'active' && !soldOut && boughtCount < SECKILL_LIMIT,
        statusText: soldOut ? '已抢光' : status === 'ended' ? '已结束' : status === 'upcoming' ? '即将开始' : '',
      };
    });
    return {
      ...clone(session),
      goods,
      status,
      startTime: start,
      endTime: end,
    };
  });

  // 当前场：进行中的优先；没有进行中的就取最近一场未开始的
  const active = sessions.filter((s) => s.status === 'active')[0];
  const upcoming = sessions.filter((s) => s.status === 'upcoming')[0];
  const current = active || upcoming || sessions[sessions.length - 1];
  return { sessions, currentId: current.id, serverTime: now };
};

/** 按状态推导物流轨迹，供下单 / 模拟配送进度复用 */
const STATUS_TEXT = { 1: '待付款', 2: '待发货', 3: '配送中', 4: '待收货', 5: '已完成', 6: '已取消' };
const LOGISTICS_TEXT = { 1: '等待付款', 2: '待揽收', 3: '运输中', 4: '派送中', 5: '已签收', 6: '订单已取消' };
const HOUR = 3600 * 1000;

const buildTimeline = (status, baseTime) => {
  const steps = [
    { text: '商品已下单', desc: '订单提交成功，等待商家发货' },
    { text: '商家已发货', desc: '包裹已揽收，正在发往分拨中心' },
    { text: '运输中', desc: '包裹已到达杭州转运中心' },
    { text: '派送中', desc: '快递员正在为您派送，请保持电话畅通' },
    { text: '已签收', desc: '包裹已签收，感谢您的购买' },
  ];
  const doneCount = { 1: 1, 2: 1, 3: 3, 4: 4, 5: 5, 6: 1 }[status] || 1;
  return steps
    .map((s, i) => ({ text: s.text, desc: s.desc, time: baseTime + i * 9 * HOUR, done: i < doneCount }))
    .reverse();
};

/** 把订单里的商品重新加回购物车（再来一单） */
const addOrderItemsToCart = (order) => {
  order.items.forEach((item) => {
    const exist = store.cart.find((c) => c.goodsId === item.goodsId && c.specText === item.specText);
    if (exist) {
      exist.count += item.count;
      exist.checked = true;
    } else {
      const g = findGoods(item.goodsId);
      store.cart.unshift({
        id: nextId(),
        goodsId: item.goodsId,
        name: item.name,
        mainPic: item.mainPic,
        specText: item.specText,
        price: item.price,
        count: item.count,
        checked: true,
        stock: g ? g.stock : 99,
        unit: item.unit || (g ? g.unit : '份'),
        invalid: false,
      });
    }
  });
  store.persistCart();
};

/** 生成订单号：20260928120000001 */
const makeOrderNo = () => {
  const d = new Date();
  const p = (n, len = 2) => String(n).padStart(len, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(
    d.getSeconds()
  )}${p(Math.floor(Math.random() * 1000), 3)}`;
};

// ------------------------------------------------------------------ 评价统计
const collectReviews = (goodsId) => {
  const list = [...store.reviews.filter((r) => r.goodsId === Number(goodsId)), ...staticReviews.filter((r) => r.goodsId === Number(goodsId))];
  return list.sort((a, b) => b.createTime - a.createTime);
};

const reviewStats = (goodsId) => {
  const list = collectReviews(goodsId);
  const total = list.length;
  const sum = list.reduce((s, r) => s + r.rating, 0);
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = list.filter((r) => r.rating === star).length;
    return { star, count, percent: total ? Math.round((count / total) * 100) : 0 };
  });
  return {
    goodsId: Number(goodsId),
    total,
    avgRating: total ? Math.round((sum / total) * 10) / 10 : 0,
    goodRate: total ? Math.round((list.filter((r) => r.rating >= 4).length / total) * 100) : 0,
    imageCount: list.filter((r) => r.images && r.images.length).length,
    distribution,
  };
};

// ------------------------------------------------------------------ 路由表
const routes = {
  // ---------------- 首页 ----------------
  'GET /home/index': () => {
    const swiperGoods = [goods[13], goods[8], goods[0], goods[26], goods[35]];
    const swiper = swiperGoods.map((g, i) => ({
      id: 4001 + i,
      goodsId: g.id,
      image_src: `https://picsum.photos/seed/banner${g.id}/750/360`,
      title: g.name,
      navigator_url: `/pages/goods_detail/index?goods_id=${g.id}`,
    }));
    const cates = categories.slice(0, 8).map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      image_src: `https://picsum.photos/seed/cate${c.id}/200/200`,
      navigator_url: `/pages/category/index?categoryId=${c.id}`,
    }));
    const floors = [
      { id: 1, title: '烧饼现烤 · 外酥里软', categoryId: 1, goods: goods.filter((g) => g.categoryId === 1).slice(0, 3) },
      { id: 2, title: '手工糕点 · 甜而不腻', categoryId: 2, goods: goods.filter((g) => g.categoryId === 2).slice(0, 3) },
      { id: 3, title: '限时特惠 · 售完即止', categoryId: 8, goods: goods.filter((g) => g.categoryId === 8 || g.categoryId === 7).slice(0, 3) },
    ].map((f) => ({
      ...f,
      floor_title: { image_src: '' },
      product_list: f.goods.map((g) => ({
        goods_id: g.id,
        name: g.name,
        image_src: g.mainPic,
        price: g.price,
        originalPrice: g.originalPrice,
        sales: g.sales,
        navigator_url: `/pages/goods_detail/index?goods_id=${g.id}`,
      })),
    }));
    const recommend = seededShuffle(goods, 88).slice(0, 6);
    return ok({ swiper, cates, floors, recommend: recommend.map(withCollect) });
  },

  // ---------------- 分类 ----------------
  'GET /categories': () => ok(clone(categories)),

  // ---------------- 商品 ----------------
  'GET /goods/search': ({ data = {} }) => {
    const { categoryId, subCategoryId, keyword = '', sort = 'default', page = 1, size = 10, minPrice, maxPrice, onlyStock } = data;
    let list = goods.slice();

    if (categoryId) list = list.filter((g) => g.categoryId === Number(categoryId));
    if (subCategoryId) list = list.filter((g) => g.subCategoryId === Number(subCategoryId));
    if (keyword) {
      const kw = String(keyword).trim().toLowerCase();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(kw) ||
          g.categoryName.includes(kw) ||
          g.subCategoryName.includes(kw) ||
          g.tags.some((t) => t.includes(kw))
      );
    }
    if (minPrice !== undefined && minPrice !== '' && minPrice !== null) list = list.filter((g) => g.price >= Number(minPrice));
    if (maxPrice !== undefined && maxPrice !== '' && maxPrice !== null) list = list.filter((g) => g.price <= Number(maxPrice));
    if (onlyStock) list = list.filter((g) => g.stock > 0);

    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'sales') list.sort((a, b) => b.sales - a.sales);
    else list.sort((a, b) => b.sales * 0.6 + b.stock * 0.4 - (a.sales * 0.6 + a.stock * 0.4));

    return ok(paginate(list.map(withCollect), page, size));
  },

  'GET /goods/detail': ({ data = {} }) => {
    const item = findGoods(data.goodsId);
    if (!item) return { code: 404, data: null, msg: '商品不存在' };
    const stats = reviewStats(item.id);
    return ok({ ...withCollect(item), reviewStats: stats });
  },

  'GET /goods/recommend': ({ data = {} }) => {
    const item = findGoods(data.goodsId);
    const limit = Number(data.limit) || 6;
    const sameCategory = item ? goods.filter((g) => g.categoryId === item.categoryId && g.id !== item.id) : goods;
    const pool = sameCategory.length >= 4 ? sameCategory : goods.filter((g) => g.id !== (item && item.id));
    return ok(seededShuffle(pool, item ? item.id : 1).slice(0, limit).map(withCollect));
  },

  // ---------------- 购物车 ----------------
  'GET /cart/list': () => {
    const valid = store.cart.filter((c) => !c.invalid);
    const invalid = store.cart.filter((c) => c.invalid);
    return ok({
      list: clone(valid),
      invalidList: clone(invalid),
      totalCount: valid.reduce((s, c) => s + c.count, 0),
      checkedCount: valid.filter((c) => c.checked).reduce((s, c) => s + c.count, 0),
      checkedAmount: Math.round(valid.filter((c) => c.checked).reduce((s, c) => s + c.price * c.count, 0) * 100) / 100,
    });
  },

  'GET /cart/count': () => ok({ count: store.cart.filter((c) => !c.invalid).reduce((s, c) => s + c.count, 0) }),

  'POST /cart/add': ({ data = {} }) => {
    const { goodsId, specText = '默认规格', price, count = 1, name, mainPic, stock = 99, unit = '份', only = false } = data;
    const g = findGoods(goodsId);
    const item = addToCartInternal({
      goodsId,
      name: name || (g && g.name) || '商品',
      mainPic: mainPic || (g && g.mainPic) || '',
      specText,
      price: price === undefined ? (g ? g.price : 0) : price,
      count,
      stock: stock || (g ? g.stock : 99),
      unit: unit || (g ? g.unit : '份'),
      only,
    });
    return ok({ count: cartTotalCount(), item: clone(item) }, '加入购物车成功');
  },

  'POST /cart/update': ({ data = {} }) => {
    const item = store.cart.find((c) => c.id === Number(data.id));
    if (!item) return { code: 404, data: null, msg: '购物车商品不存在' };
    if (data.count !== undefined) item.count = Math.max(1, Math.min(Number(data.count), item.stock || 999));
    if (data.checked !== undefined) item.checked = !!data.checked;
    store.persistCart();
    return ok(clone(item));
  },

  'POST /cart/checked': ({ data = {} }) => {
    const { ids, checked, all } = data;
    store.cart.forEach((c) => {
      if (c.invalid) return;
      if (all || (ids && ids.includes(c.id))) c.checked = !!checked;
    });
    store.persistCart();
    return ok({ list: clone(store.cart) });
  },

  'POST /cart/remove': ({ data = {} }) => {
    const ids = data.ids || [];
    store.cart = store.cart.filter((c) => !ids.includes(c.id));
    store.persistCart();
    return ok({ list: clone(store.cart) });
  },

  'POST /cart/clearInvalid': () => {
    store.cart = store.cart.filter((c) => !c.invalid);
    store.persistCart();
    return ok({ list: clone(store.cart) });
  },

  // ---------------- 订单 ----------------
  'GET /orders/list': ({ data = {} }) => {
    const { status = 0, page = 1, size = 10 } = data;
    let list = store.orders.slice().sort((a, b) => b.createTime - a.createTime);
    const bucket = Number(status);
    if (bucket === 3) list = list.filter((o) => o.status === 3 || o.status === 4);
    else if (bucket) list = list.filter((o) => o.status === bucket);
    return ok(paginate(clone(list), page, size));
  },

  'GET /orders/count': () => {
    const count = { all: store.orders.length, 1: 0, 2: 0, 3: 0, 5: 0 };
    store.orders.forEach((o) => {
      if (o.status === 3 || o.status === 4) count[3] += 1;
      else if (count[o.status] !== undefined) count[o.status] += 1;
    });
    return ok(count);
  },

  'GET /orders/detail': ({ data = {} }) => {
    const order = store.orders.find((o) => o.id === Number(data.orderId));
    if (!order) return { code: 404, data: null, msg: '订单不存在' };
    return ok(clone(order));
  },

  'POST /orders/create': ({ data = {} }) => {
    const { items = [], addressSnapshot, remark = '', payMethod = '微信支付', couponId = 0 } = data;
    const totalAmount = round2(items.reduce((s, it) => s + it.price * it.count, 0));
    // 满减规则（与前端展示保持一致）
    const discountAmount = totalAmount >= 100 ? 15 : totalAmount >= 50 ? 5 : 0;

    // 优惠券：先校验再抵扣，避免下单后才发现券不可用
    let couponDiscount = 0;
    let usedCoupon = null;
    if (couponId) {
      const coupon = store.coupons.filter((c) => c.id === Number(couponId))[0];
      if (!coupon) return { code: 404, data: null, msg: '优惠券不存在' };
      if (couponStatus(coupon) !== 'unused') return { code: 400, data: null, msg: '该优惠券已不可用' };
      const d = couponDiscountFor(coupon, totalAmount);
      if (d <= 0) return { code: 400, data: null, msg: couponUnavailableReason(coupon, totalAmount) };
      couponDiscount = round2(d);
      usedCoupon = coupon;
    }

    const freight = 0;
    const payAmount = Math.max(0, round2(totalAmount - discountAmount - couponDiscount + freight));
    const now = Date.now();
    const order = {
      id: nextId(),
      orderNo: makeOrderNo(),
      status: 1,
      statusText: STATUS_TEXT[1],
      items: clone(items),
      totalAmount,
      discountAmount,
      couponId: usedCoupon ? usedCoupon.id : 0,
      couponTitle: usedCoupon ? usedCoupon.title : '',
      couponDiscount,
      freight,
      payAmount,
      addressSnapshot: clone(addressSnapshot || currentAddress() || {}),
      createTime: now,
      payTime: 0,
      payMethod,
      remark,
      logistics: { company: '待分配', trackingNo: '', statusText: LOGISTICS_TEXT[1], timeline: buildTimeline(1, now) },
      isReviewed: false,
    };
    store.orders.unshift(order);

    // 用券后立即核销，避免同一张券被重复下单
    if (usedCoupon) {
      usedCoupon.status = 'used';
      usedCoupon.usedTime = now;
      usedCoupon.orderId = order.id;
      store.persistCoupons();
    }

    // 购物返积分：每 1 元 = 1 积分，按实付金额取整
    const earnedPoints = Math.floor(payAmount * POINTS_PER_YUAN);
    if (earnedPoints > 0) applyPoints(earnedPoints, '购物', `订单 ${order.orderNo} 消费返积分`);

    // 下单后自动写入一条订单消息
    pushMessage({
      type: 2,
      title: '订单提交成功',
      content: `订单 ${order.orderNo} 已提交，实付 ¥${payAmount.toFixed(2)}，请尽快完成支付`,
      relatedType: 'order',
      relatedId: order.id,
    });

    return ok({ ...clone(order), earnedPoints }, '下单成功');
  },

  'POST /orders/pay': ({ data = {} }) => {
    const order = store.orders.find((o) => o.id === Number(data.orderId));
    if (!order) return { code: 404, data: null, msg: '订单不存在' };
    const now = Date.now();
    order.status = 2;
    order.statusText = STATUS_TEXT[2];
    order.payTime = now;
    order.payMethod = data.payMethod || order.payMethod || '微信支付';
    order.logistics = {
      company: '顺丰速运',
      trackingNo: `SF${100000000000 + Math.floor(Math.random() * 899999999)}`,
      statusText: LOGISTICS_TEXT[2],
      timeline: buildTimeline(2, order.createTime),
    };
    store.persistOrders();
    return ok(clone(order), '支付成功');
  },

  'POST /orders/cancel': ({ data = {} }) => {
    const order = store.orders.find((o) => o.id === Number(data.orderId));
    if (!order) return { code: 404, data: null, msg: '订单不存在' };
    order.status = 6;
    order.statusText = STATUS_TEXT[6];
    order.logistics = { ...order.logistics, statusText: LOGISTICS_TEXT[6], timeline: buildTimeline(6, order.createTime) };
    store.persistOrders();
    return ok(clone(order), '订单已取消');
  },

  'POST /orders/confirm': ({ data = {} }) => {
    const order = store.orders.find((o) => o.id === Number(data.orderId));
    if (!order) return { code: 404, data: null, msg: '订单不存在' };
    order.status = 5;
    order.statusText = STATUS_TEXT[5];
    order.logistics = { ...order.logistics, statusText: LOGISTICS_TEXT[5], timeline: buildTimeline(5, order.createTime) };
    store.persistOrders();
    return ok(clone(order), '确认收货成功');
  },

  /** 演示用：把订单状态往前推进一格（待发货 -> 配送中 -> 待收货 -> 已完成） */
  'POST /orders/advance': ({ data = {} }) => {
    const order = store.orders.find((o) => o.id === Number(data.orderId));
    if (!order) return { code: 404, data: null, msg: '订单不存在' };
    const next = { 2: 3, 3: 4, 4: 5, 5: 5, 1: 1, 6: 6 }[order.status] || order.status;
    order.status = next;
    order.statusText = STATUS_TEXT[next];
    order.logistics = {
      ...order.logistics,
      statusText: LOGISTICS_TEXT[next],
      company: order.logistics.company === '待分配' ? '顺丰速运' : order.logistics.company,
      trackingNo: order.logistics.trackingNo || `SF${100000000000 + Math.floor(Math.random() * 899999999)}`,
      timeline: buildTimeline(next, order.createTime),
    };
    store.persistOrders();
    return ok(clone(order), `已推进为「${STATUS_TEXT[next]}」`);
  },

  'POST /orders/urge': () => ok({ urged: true }, '已提醒商家尽快发货'),

  'POST /orders/again': ({ data = {} }) => {
    const order = store.orders.find((o) => o.id === Number(data.orderId));
    if (!order) return { code: 404, data: null, msg: '订单不存在' };
    addOrderItemsToCart(order);
    return ok({ count: store.cart.filter((c) => !c.invalid).reduce((s, c) => s + c.count, 0) }, '已加入购物车');
  },

  // ---------------- 评价 ----------------
  'GET /reviews/list': ({ data = {} }) => {
    const { goodsId, type = 'all', page = 1, size = 10 } = data;
    let list = collectReviews(goodsId);
    if (type === 'good') list = list.filter((r) => r.rating >= 4);
    else if (type === 'mid') list = list.filter((r) => r.rating === 3);
    else if (type === 'bad') list = list.filter((r) => r.rating <= 2);
    else if (type === 'image') list = list.filter((r) => r.images && r.images.length);
    return ok(paginate(clone(list), page, size));
  },

  'GET /reviews/stats': ({ data = {} }) => ok(reviewStats(data.goodsId)),

  'POST /reviews/submit': ({ data = {} }) => {
    const { orderId, reviews: list = [] } = data;
    const created = list.map((item) => {
      const g = findGoods(item.goodsId);
      return {
        id: nextId(),
        orderId: Number(orderId),
        goodsId: Number(item.goodsId),
        goodsName: (g && g.name) || item.goodsName || '',
        userId: store.user.id,
        userName: store.user.nickName,
        userAvatar: store.user.avatar,
        rating: Number(item.rating) || 5,
        content: item.content || '',
        images: item.images || [],
        tags: item.tags || [],
        createTime: Date.now(),
        specText: item.specText || '',
      };
    });
    store.reviews = [...created, ...store.reviews];
    store.persistReviews();

    const order = store.orders.find((o) => o.id === Number(orderId));
    if (order) {
      order.isReviewed = true;
      store.persistOrders();
    }

    // 评价奖励积分，并在明细里留痕
    const earned = POINTS_PER_REVIEW * created.length;
    if (earned > 0) applyPoints(earned, '评价', `评价 ${created.length} 个商品`);

    return ok({ reviews: created, points: earned, totalPoints: store.points }, '评价成功');
  },

  // ---------------- 收藏 ----------------
  /**
   * 收藏列表
   * tab: all 全部 / hot 正在热卖 / soon 即将上线
   */
  'GET /collect/list': ({ data = {} }) => {
    const tab = data.tab || 'all';
    let list = store.collect.map((id) => findGoods(id)).filter(Boolean).map(withCollect);
    if (tab === 'hot') list = list.filter((g) => g.stock > 0 && g.sales >= 3000);
    else if (tab === 'soon') list = list.filter((g) => g.stock === 0 || g.sales < 3000);
    return ok(list);
  },

  /** 收藏的商品 id 数组，详情页用来同步收藏态 */
  'GET /collect/ids': () => ok(clone(store.collect)),

  /** 各 Tab 的收藏数量，用于标签角标 */
  'GET /collect/count': () => {
    const all = store.collect.map((id) => findGoods(id)).filter(Boolean);
    return ok({
      all: all.length,
      hot: all.filter((g) => g.stock > 0 && g.sales >= 3000).length,
      soon: all.filter((g) => g.stock === 0 || g.sales < 3000).length,
    });
  },

  'POST /collect/toggle': ({ data = {} }) => {
    const id = Number(data.goodsId);
    const item = findGoods(id);
    if (!item) return { code: 404, data: null, msg: '商品不存在' };
    const index = store.collect.indexOf(id);
    let isCollect;
    if (index === -1) {
      store.collect.unshift(id);
      isCollect = true;
    } else {
      store.collect.splice(index, 1);
      isCollect = false;
    }
    store.persistCollect();
    return ok({ isCollect, total: store.collect.length }, isCollect ? '收藏成功' : '已取消收藏');
  },

  'POST /collect/remove': ({ data = {} }) => {
    const id = Number(data.goodsId);
    store.collect = store.collect.filter((goodsId) => goodsId !== id);
    store.persistCollect();
    return ok({ total: store.collect.length }, '已取消收藏');
  },

  // ---------------- 浏览足迹 ----------------
  'GET /history/list': () => ok(clone(store.history)),

  'POST /history/add': ({ data = {} }) => {
    const id = Number(data.goodsId);
    const g = findGoods(id);
    if (!g) return { code: 404, data: null, msg: '商品不存在' };
    // 去重：同一商品重复浏览时更新时间戳并移到最前
    store.history = [
      { goodsId: id, name: g.name, mainPic: g.mainPic, price: g.price, browseTime: Date.now() },
      ...store.history.filter((h) => h.goodsId !== id),
    ];
    // 超出上限时丢弃最早的记录
    if (store.history.length > HISTORY_MAX) store.history = store.history.slice(0, HISTORY_MAX);
    store.persistHistory();
    return ok({ total: store.history.length });
  },

  'POST /history/remove': ({ data = {} }) => {
    store.history = store.history.filter((h) => h.goodsId !== Number(data.goodsId));
    store.persistHistory();
    return ok({ total: store.history.length }, '已删除该条足迹');
  },

  'POST /history/clear': () => {
    store.history = [];
    store.persistHistory();
    return ok({ total: 0 }, '已清空浏览足迹');
  },

  // ---------------- 搜索辅助 ----------------
  'GET /search/hot': () => ok(clone(hotKeywords)),

  /** 搜索联想：前缀优先、其次包含，返回匹配区间供前端高亮 */
  'GET /goods/suggest': ({ data = {} }) => {
    const kw = String(data.keyword || '').trim().toLowerCase();
    if (!kw) return ok([]);
    const limit = Number(data.limit) || 10;
    const prefix = [];
    const contains = [];
    goods.forEach((g) => {
      const at = g.name.toLowerCase().indexOf(kw);
      if (at === 0) prefix.push({ g, at });
      else if (at > 0) contains.push({ g, at });
    });
    return ok(
      [...prefix, ...contains].slice(0, limit).map(({ g, at }) => ({
        id: g.id,
        name: g.name,
        mainPic: g.mainPic,
        price: g.price,
        categoryName: g.categoryName,
        matchStart: at,
        matchEnd: at + kw.length,
      }))
    );
  },

  // ---------------- 用户 / 地址 ----------------
  'GET /user/info': () => ok(clone(store.user)),

  'GET /address/list': () => ok(clone(store.addresses)),

  /** 地址数量概览，用于「最多 10 条」提示 */
  'GET /address/count': () => ok({ total: store.addresses.length, max: ADDRESS_MAX }),

  'GET /address/detail': ({ data = {} }) => {
    const item = store.addresses.find((a) => a.id === Number(data.id));
    if (!item) return { code: 404, data: null, msg: '地址不存在' };
    return ok(clone(item));
  },

  'GET /address/default': () => ok(clone(defaultAddress())),

  /** 结算流程当前使用的地址：优先「本次选中」，否则默认地址 */
  'GET /address/current': () => ok(clone(currentAddress())),

  /** 选择模式下选中一条地址（不改动默认地址设置） */
  'POST /address/select': ({ data = {} }) => {
    const item = store.addresses.find((a) => a.id === Number(data.id));
    if (!item) return { code: 404, data: null, msg: '地址不存在' };
    store.selectedAddressId = item.id;
    store.persistSelectedAddress();
    return ok(clone(item), '已选择该地址');
  },

  'POST /address/setDefault': ({ data = {} }) => {
    const id = Number(data.id);
    if (!store.addresses.some((a) => a.id === id)) return { code: 404, data: null, msg: '地址不存在' };
    markDefaultAddress(id);
    store.persistAddresses();
    return ok(clone(store.addresses.find((a) => a.id === id)), '已设为默认地址');
  },

  /** 新增 / 编辑地址：带 id 为编辑，不带为新增 */
  'POST /address/save': ({ data = {} }) => {
    const { id, userName, telNumber, provinceName, cityName, countyName, detailInfo, tag, isDefault } = data;
    if (!String(userName || '').trim()) return { code: 400, data: null, msg: '请填写收货人姓名' };
    if (!/^1[3-9]\d{9}$/.test(String(telNumber || ''))) return { code: 400, data: null, msg: '请填写正确的手机号' };
    if (!String(detailInfo || '').trim()) return { code: 400, data: null, msg: '请填写详细地址' };

    const all = `${provinceName || ''}${cityName || ''}${countyName || ''}${detailInfo}`;

    if (id) {
      const index = store.addresses.findIndex((a) => a.id === Number(id));
      if (index === -1) return { code: 404, data: null, msg: '地址不存在' };
      store.addresses[index] = {
        ...store.addresses[index],
        userName,
        telNumber,
        provinceName,
        cityName,
        countyName,
        detailInfo,
        tag: tag || store.addresses[index].tag || '家',
        all,
      };
      if (isDefault) markDefaultAddress(store.addresses[index].id);
    } else {
      if (store.addresses.length >= ADDRESS_MAX) {
        return { code: 400, data: null, msg: `最多只能保存 ${ADDRESS_MAX} 条地址` };
      }
      const created = {
        id: nextId(),
        userName,
        telNumber,
        provinceName,
        cityName,
        countyName,
        detailInfo,
        tag: tag || '家',
        all,
        isDefault: false,
      };
      store.addresses.push(created);
      // 第一条地址自动成为默认地址
      if (isDefault || store.addresses.length === 1) markDefaultAddress(created.id);
    }
    store.persistAddresses();
    return ok(clone(store.addresses), id ? '地址已更新' : '地址已添加');
  },

  'POST /address/remove': ({ data = {} }) => {
    const id = Number(data.id);
    const target = store.addresses.find((a) => a.id === id);
    if (!target) return { code: 404, data: null, msg: '地址不存在' };
    if (target.isDefault && store.addresses.length > 1) {
      return { code: 400, data: null, msg: '默认地址不可删除，请先设置其他地址为默认' };
    }
    store.addresses = store.addresses.filter((a) => a.id !== id);
    if (store.selectedAddressId === id) {
      store.selectedAddressId = 0;
      store.persistSelectedAddress();
    }
    store.persistAddresses();
    return ok(clone(store.addresses), '地址已删除');
  },

  // ---------------- 限时抢购 ----------------
  'GET /seckill/sessions': () => ok(buildSeckillState()),

  'POST /seckill/buy': ({ data = {} }) => {
    const state = buildSeckillState();
    const session = state.sessions.filter((s) => s.id === Number(data.sessionId))[0];
    if (!session) return { code: 404, data: null, msg: '场次不存在' };
    if (session.status === 'upcoming') return { code: 400, data: null, msg: `本场 ${session.label} 开抢，请稍候` };
    if (session.status === 'ended') return { code: 400, data: null, msg: '本场已结束，看看下一场吧' };
    const item = session.goods.filter((g) => g.goodsId === Number(data.goodsId))[0];
    if (!item) return { code: 404, data: null, msg: '该商品不在本场抢购中' };
    if (item.soldOut) return { code: 400, data: null, msg: '该商品已抢光' };
    if (item.limitReached) return { code: 400, data: null, msg: `每人每场每商品限购 ${SECKILL_LIMIT} 件` };

    // 扣减本场库存并把进度往前推，让进度条在连续抢购时肉眼可见地增长
    const seat = seckillSeed
      .filter((s) => s.id === session.id)[0]
      .goods.filter((g) => g.goodsId === item.goodsId)[0];
    seat.sold += 1;
    seat.remain = seat.stock - seat.sold;
    seat.progress = Math.round((seat.sold / seat.stock) * 100);
    store.seckillRecords.push({ sessionId: session.id, goodsId: item.goodsId, time: Date.now() });
    store.persistSeckillRecords();

    const cartItem = addToCartInternal({
      goodsId: item.goodsId,
      name: item.name,
      mainPic: item.mainPic,
      // 抢购商品单独成行：否则会和购物车里同规格的正价商品合并，
      // 用户明明点的抢购价，结算时却按原价计费
      specText: `${data.specText || `默认规格 · 1${item.unit}`} · 限时抢购`,
      price: item.seckillPrice,
      count: SECKILL_LIMIT,
      stock: item.remain,
      unit: item.unit,
      only: !!data.only,
    });

    return ok(
      {
        count: store.cart.filter((c) => !c.invalid).reduce((s, c) => s + c.count, 0),
        item: clone(cartItem),
        seckillPrice: item.seckillPrice,
      },
      '抢购成功，已加入购物车'
    );
  },

  // ---------------- 优惠券 ----------------
  'GET /coupon/templates': () =>
    ok(
      couponSeed.map((t) => ({
        ...clone(t),
        claimed: store.coupons.some((c) => c.templateId === t.id),
        remain: Math.max(0, t.total - t.claimed),
        soldOut: t.claimed >= t.total,
      }))
    ),

  'POST /coupon/claim': ({ data = {} }) => {
    const tpl = couponSeed.filter((t) => t.id === Number(data.templateId))[0];
    if (!tpl) return { code: 404, data: null, msg: '优惠券不存在' };
    // 每人每券限领 1 张
    if (store.coupons.some((c) => c.templateId === tpl.id)) {
      return { code: 400, data: null, msg: '该券每人限领 1 张，你已领取过' };
    }
    const coupon = grantCoupon(tpl);
    return ok({ coupon, total: store.coupons.length }, '领取成功');
  },

  'GET /coupon/mine': ({ data = {} }) => {
    const status = data.status || 'unused';
    return ok(store.coupons.map(withCouponStatus).filter((c) => c.status === status));
  },

  'GET /coupon/count': () => {
    const all = store.coupons.map(withCouponStatus);
    return ok({
      unused: all.filter((c) => c.status === 'unused').length,
      used: all.filter((c) => c.status === 'used').length,
      expired: all.filter((c) => c.status === 'expired').length,
      expiring: all.filter((c) => c.expiring).length,
      total: all.length,
    });
  },

  /** 支付页用：按订单金额给出可用 / 不可用券，并给出最优券 */
  'GET /coupon/available': ({ data = {} }) => {
    const amount = Number(data.amount) || 0;
    const available = [];
    const unavailable = [];
    store.coupons
      .filter((c) => couponStatus(c) === 'unused')
      .map(withCouponStatus)
      .forEach((c) => {
        const discount = couponDiscountFor(c, amount);
        if (discount > 0) available.push({ ...c, discount: round2(discount) });
        else unavailable.push({ ...c, reason: couponUnavailableReason(c, amount) });
      });
    available.sort((a, b) => b.discount - a.discount);
    const best = available[0] || null;
    return ok({ amount, available, unavailable, bestId: best ? best.id : 0 });
  },

  // ---------------- 积分 ----------------
  'GET /points/info': () => {
    const todayKey = dateKey(dayStart(Date.now()));
    return ok({
      points: store.points,
      totalEarned: store.pointsRecords.filter((r) => r.points > 0).reduce((s, r) => s + r.points, 0),
      totalSpent: Math.abs(store.pointsRecords.filter((r) => r.points < 0).reduce((s, r) => s + r.points, 0)),
      recordCount: store.pointsRecords.length,
      consecutiveDays: store.checkin.consecutiveDays,
      todaySigned: store.checkin.signedDates.indexOf(todayKey) !== -1,
    });
  },

  'GET /points/records': ({ data = {} }) => ok(paginate(store.pointsRecords.map(clone), data.page, data.size)),

  'GET /points/goods': () =>
    ok(pointGoods.map((g) => ({ ...clone(g), affordable: store.points >= g.points }))),

  'POST /points/exchange': ({ data = {} }) => {
    const item = pointGoods.filter((g) => g.id === Number(data.id))[0];
    if (!item) return { code: 404, data: null, msg: '兑换项不存在' };
    if (store.points < item.points) return { code: 400, data: null, msg: '积分不足，再攒攒吧' };

    applyPoints(-item.points, '兑换', `兑换「${item.name}」`);
    // 绑定券模板的兑换项，兑换后券直接到账
    let coupon = null;
    if (item.templateId) {
      const tpl = couponSeed.filter((t) => t.id === item.templateId)[0];
      if (tpl) coupon = grantCoupon(tpl);
    }
    return ok({ points: store.points, coupon }, `兑换成功，已扣除 ${item.points} 积分`);
  },

  // ---------------- 每日签到 ----------------
  'GET /checkin/info': ({ data = {} }) => {
    const now = Date.now();
    const today = dayStart(now);
    const nowDate = new Date(now);
    let year = nowDate.getFullYear();
    let month = nowDate.getMonth() + 1;
    // month 形如 '2026-09'，不传则默认当月
    if (data.month) {
      const parts = String(data.month).split('-').map(Number);
      if (parts[0] && parts[1]) {
        year = parts[0];
        month = parts[1];
      }
    }
    const daysInMonth = new Date(year, month, 0).getDate();
    const signedSet = new Set(store.checkin.signedDates);
    const days = [];
    for (let d = 1; d <= daysInMonth; d += 1) {
      const ts = new Date(year, month - 1, d).getTime();
      const key = dateKey(ts);
      days.push({ day: d, date: key, signed: signedSet.has(key), isToday: ts === today, isFuture: ts > today });
    }
    const todayKey = dateKey(today);
    const todaySigned = signedSet.has(todayKey);
    const consecutiveDays = computeConsecutive(store.checkin.signedDates, todaySigned);

    return ok({
      year,
      month,
      days,
      // 日历首格前面要空几格（周一作为一周起点）
      firstWeekday: (new Date(year, month - 1, 1).getDay() + 6) % 7,
      todaySigned,
      consecutiveDays,
      monthSigned: days.filter((d) => d.signed).length,
      totalSigned: store.checkin.signedDates.length,
      rewards: CHECKIN_REWARDS.map((p, i) => ({ day: i + 1, points: p, reached: consecutiveDays >= i + 1 })),
      // 今天签到能拿到的积分（连签超过 7 天按第 7 天算）
      todayReward: CHECKIN_REWARDS[Math.min(consecutiveDays, CHECKIN_REWARDS.length - 1)],
    });
  },

  'POST /checkin/do': () => {
    const todayKey = dateKey(dayStart(Date.now()));
    // 每天限签 1 次
    if (store.checkin.signedDates.indexOf(todayKey) !== -1) {
      return { code: 400, data: null, msg: '今天已经签到过了' };
    }
    store.checkin.signedDates = store.checkin.signedDates.concat(todayKey).sort();
    store.checkin.todaySigned = true;
    store.checkin.consecutiveDays = computeConsecutive(store.checkin.signedDates, true);
    store.persistCheckin();

    const idx = Math.min(store.checkin.consecutiveDays, CHECKIN_REWARDS.length) - 1;
    const reward = CHECKIN_REWARDS[idx];
    applyPoints(reward, '签到', `连续签到第 ${store.checkin.consecutiveDays} 天奖励`);

    return ok(
      {
        points: reward,
        consecutiveDays: store.checkin.consecutiveDays,
        totalPoints: store.points,
        isBigReward: store.checkin.consecutiveDays % 7 === 0,
      },
      `签到成功，+${reward} 积分`
    );
  },

  // ---------------- 消息中心 ----------------
  'GET /messages': ({ data = {} }) => {
    // 每次拉取都检查券临期，命中则自动生成一条提醒消息
    ensureCouponExpiryMessages();
    const type = Number(data.type) || 0;
    const list = type ? store.messages.filter((m) => m.type === type) : store.messages.slice();
    return ok(paginate(list.map(clone), data.page, data.size));
  },

  'GET /messages/unreadCount': () => {
    const unread = store.messages.filter((m) => !m.isRead);
    return ok({
      count: unread.length,
      byType: {
        1: unread.filter((m) => m.type === 1).length,
        2: unread.filter((m) => m.type === 2).length,
        3: unread.filter((m) => m.type === 3).length,
      },
    });
  },

  'GET /messages/detail': ({ data = {} }) => {
    const msg = store.messages.filter((m) => m.id === Number(data.id))[0];
    if (!msg) return { code: 404, data: null, msg: '消息不存在' };
    return ok(clone(msg));
  },

  'POST /messages/read': ({ data = {} }) => {
    const msg = store.messages.filter((m) => m.id === Number(data.id))[0];
    if (!msg) return { code: 404, data: null, msg: '消息不存在' };
    msg.isRead = true;
    store.persistMessages();
    return ok({ unread: unreadCount() });
  },

  'POST /messages/readAll': ({ data = {} }) => {
    const type = Number(data.type) || 0;
    store.messages.forEach((m) => {
      if (!type || m.type === type) m.isRead = true;
    });
    store.persistMessages();
    return ok({ unread: unreadCount() }, '已全部标记为已读');
  },

  /** 模拟推送：进入消息中心 3 秒后由页面触发 */
  'POST /messages/push': ({ data = {} }) => {
    const msg = pushMessage({
      type: Number(data.type) || 3,
      title: data.title || '限时抢购开抢提醒',
      content: data.content || '新一场限时抢购已开启，多款烧饼 5 折起，先到先得',
      relatedType: data.relatedType || 'seckill',
      relatedId: 0,
    });
    return ok({ message: msg, unread: unreadCount() }, '收到一条新消息');
  },

  // ---------------- 图片上传（评价晒图） ----------------
  'POST /upload': ({ data = {} }) => ok({ url: data.filePath, size: data.size || 0 }, '上传成功'),
};

// ------------------------------------------------------------------ 分发
/**
 * 匹配路由并返回 Promise<{ code, data, msg }>
 * @param {{ url: string, method?: string, data?: object }} options
 */
export const mockRequest = async ({ url, method = 'GET', data = {} } = {}) => {
  store.init();
  const path = String(url).split('?')[0];
  const key = `${String(method).toUpperCase()} ${path}`;
  const handler = routes[key];

  await delay();

  if (!handler) {
    return { code: 404, data: null, msg: `Mock 接口未定义：${key}` };
  }
  try {
    return handler({ data, method, url });
  } catch (err) {
    return { code: 500, data: null, msg: (err && err.message) || 'Mock 处理异常' };
  }
};

/** 模拟文件上传，直接返回本地临时路径 */
export const mockUpload = async ({ filePath, name = 'file' } = {}) => {
  await delay();
  if (!filePath) return { code: 400, data: null, msg: '缺少 filePath' };
  return routes['POST /upload']({ data: { filePath, name } });
};

export { store, mockUser, mockAddress, mockAddressList };
export default mockRequest;
