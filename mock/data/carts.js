// 购物车初始数据：3~4 条已选中商品，含不同规格
export const initialCarts = [
  {
    id: 'c1',
    goodsId: 101,
    name: '老式五仁大烧饼 传统手工制作 500g 真空包装',
    mainPic: 'https://picsum.photos/seed/shaobing-yuanwei/600/600',
    specText: '3斤装 · 甜味',
    price: 34.9,
    count: 2,
    checked: true,
    stock: 150
  },
  {
    id: 'c2',
    goodsId: 102,
    name: '椒盐葱香烧饼 咸香酥脆 8个装 早餐必备',
    mainPic: 'https://picsum.photos/seed/shaobing-jiaoyan/600/600',
    specText: '8个装 · 椒盐',
    price: 9.9,
    count: 1,
    checked: true,
    stock: 300
  },
  {
    id: 'c3',
    goodsId: 401,
    name: '每日坚果 混合果仁 750g 30包 礼盒装',
    mainPic: 'https://picsum.photos/seed/snack-jianguo/600/600',
    specText: '30包/750g',
    price: 59.9,
    count: 1,
    checked: true,
    stock: 100
  },
  {
    id: 'c4',
    goodsId: 301,
    name: '石磨现磨豆浆粉 原味无添加 300g',
    mainPic: 'https://picsum.photos/seed/drink-doujiang/600/600',
    specText: '300g · 黑豆',
    price: 12.9,
    count: 3,
    checked: false,
    stock: 220
  }
]
