// 购物车初始数据（3~4 条已选中商品，含不同规格 + 1 条失效商品）
export const seedCarts = [
  {
    id: 'c1',
    goodsId: 1001,
    name: '老式芝麻大烧饼 传统手工烤制 500g（5个装）',
    mainPic: 'https://picsum.photos/seed/sb-1001-1/600/600',
    specText: '10个装 1kg · 椒盐味',
    price: 24.9,
    count: 2,
    checked: true,
    stock: 150,
    valid: true
  },
  {
    id: 'c2',
    goodsId: 1003,
    name: '红烧牛肉馅烧饼 皮薄馅大 400g（4个）',
    mainPic: 'https://picsum.photos/seed/sb-1003-1/600/600',
    specText: '4个装 400g · 中辣',
    price: 18.8,
    count: 1,
    checked: true,
    stock: 120,
    valid: true
  },
  {
    id: 'c3',
    goodsId: 3001,
    name: '现磨纯黄豆浆粉 无添加蔗糖 500g',
    mainPic: 'https://picsum.photos/seed/sb-3001-1/600/600',
    specText: '500g 袋装',
    price: 16.8,
    count: 1,
    checked: true,
    stock: 200,
    valid: true
  },
  {
    id: 'c4',
    goodsId: 2002,
    name: '酥皮蛋黄酥 雪媚娘流心 6枚装',
    mainPic: 'https://picsum.photos/seed/sb-2002-1/600/600',
    specText: '红豆蛋黄',
    price: 25.9,
    count: 3,
    checked: false,
    stock: 90,
    valid: true
  },
  // 失效商品：已下架
  {
    id: 'c5',
    goodsId: 99901,
    name: '【已下架】老式大烧饼 限量品尝装',
    mainPic: 'https://picsum.photos/seed/sb-offsale-1/600/600',
    specText: '2个装',
    price: 6.6,
    count: 1,
    checked: false,
    stock: 0,
    valid: false,
    invalidReason: '商品已下架'
  }
]
