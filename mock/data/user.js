// Mock 用户数据 + 收货地址 + 收藏 + 足迹 + 搜索历史
const mockUser = {
  id: 10001,
  nickName: '烧饼爱好者',
  avatar: '/static/images/default-avatar.png',
  phone: '138****8888',
  points: 2680,
  level: '黄金会员',
  growth: 86
}

const initialAddresses = [
  {
    id: 'a1',
    name: '王小明',
    phone: '13812348888',
    region: '北京市 朝阳区',
    detail: '望京街道阜通东大街6号院 3号楼 502室',
    tag: '家',
    tagClass: 'tag_home',
    isDefault: true
  },
  {
    id: 'a2',
    name: '李阿姨',
    phone: '13912346666',
    region: '上海市 浦东新区',
    detail: '张江高科技园区博云路2号 601室',
    tag: '公司',
    tagClass: 'tag_company',
    isDefault: false
  },
  {
    id: 'a3',
    name: '张建国',
    phone: '13712341234',
    region: '广东省 广州市 天河区',
    detail: '体育西路103号 维多利广场 B座 1208室',
    tag: '公司',
    tagClass: 'tag_company',
    isDefault: false
  },
  {
    id: 'a4',
    name: '王晓',
    phone: '13612345555',
    region: '浙江省 杭州市 西湖区',
    detail: '文三路478号 华星科技大厦 8层',
    tag: '学校',
    tagClass: 'tag_school',
    isDefault: false
  },
  {
    id: 'a5',
    name: '王小明',
    phone: '13812348888',
    region: '北京市 海淀区',
    detail: '中关村大街1号 科技大厦 1508室',
    tag: '其他',
    tagClass: 'tag_other',
    isDefault: false
  }
]

// 初始收藏（6-8 条）
const initialCollect = [
  { id: 1001, name: '老式五仁大烧饼 传统手工制作 500g 装', mainPic: 'https://picsum.photos/seed/bao-1001-0/600/600', price: 12.9, unit: '斤', collectTime: Date.now() - 3600 * 1000 * 5 },
  { id: 1006, name: '黄桥烧饼 蟹黄味 江苏老字号 8个装', mainPic: 'https://picsum.photos/seed/bao-1006-0/600/600', price: 22.0, unit: '盒', collectTime: Date.now() - 3600 * 1000 * 26 },
  { id: 2006, name: '流心蛋黄酥 雪媚娘皮 6枚装', mainPic: 'https://picsum.photos/seed/bao-2006-0/600/600', price: 21.8, unit: '盒', collectTime: Date.now() - 3600 * 1000 * 50 },
  { id: 4001, name: '每日坚果 混合装 30包 750g', mainPic: 'https://picsum.photos/seed/bao-4001-0/600/600', price: 59.9, unit: '箱', collectTime: Date.now() - 3600 * 1000 * 72 },
  { id: 4002, name: '靖江猪肉脯 蜜汁味 500g 散装', mainPic: 'https://picsum.photos/seed/bao-4002-0/600/600', price: 39.9, unit: '袋', collectTime: Date.now() - 3600 * 1000 * 100 },
  { id: 6001, name: '北京驴打滚 正宗豆沙馅 400g', mainPic: 'https://picsum.photos/seed/bao-6001-0/600/600', price: 16.8, unit: '盒', collectTime: Date.now() - 3600 * 1000 * 130 },
  { id: 7001, name: '新品：藤椒鸡肉烧饼 青麻鲜香 6枚', mainPic: 'https://picsum.photos/seed/bao-7001-0/600/600', price: 19.9, unit: '盒', collectTime: Date.now() - 3600 * 1000 * 150 }
]

// 初始浏览足迹（15-20 条，覆盖近 7 天）
function makeHistory(id, daysAgo, hour) {
  const goods = require('./goods.js').find(g => g.id === id)
  if (!goods) return null
  return {
    goodsId: id,
    name: goods.name,
    mainPic: goods.mainPic,
    price: goods.price,
    browseTime: Date.now() - daysAgo * 86400 * 1000 - hour * 3600 * 1000
  }
}

const initialHistory = [
  makeHistory(1002, 0, 2),
  makeHistory(1003, 0, 5),
  makeHistory(2006, 0, 8),
  makeHistory(4001, 1, 3),
  makeHistory(4003, 1, 6),
  makeHistory(6004, 1, 10),
  makeHistory(1005, 2, 4),
  makeHistory(2002, 2, 7),
  makeHistory(3001, 2, 9),
  makeHistory(4002, 3, 2),
  makeHistory(7002, 3, 5),
  makeHistory(9002, 3, 8),
  makeHistory(1001, 4, 3),
  makeHistory(5001, 4, 6),
  makeHistory(2004, 5, 4),
  makeHistory(4006, 5, 7),
  makeHistory(6002, 6, 2),
  makeHistory(8001, 6, 5),
  makeHistory(3002, 6, 9),
  makeHistory(9001, 7, 3)
].filter(Boolean)

// 初始搜索历史（8 条）
const initialSearchHistory = [
  '五仁烧饼', '蛋黄酥', '绿豆糕', '猪肉脯', '酸梅汤', '每日坚果', '驴打滚', '藤椒烧饼'
]

// 热门搜索词（8-10 个）
const hotSearchWords = [
  '肉松烧饼', '芝麻薄饼', '绿豆糕', '蛋黄酥', '手工桃酥', '红糖麻花', '花生酥', '龙须酥', '梅干菜烧饼', '山药薄片'
]

module.exports = {
  mockUser,
  initialAddresses,
  initialCollect,
  initialHistory,
  initialSearchHistory,
  hotSearchWords
}
