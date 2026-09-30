/**
 * 购物车初始数据：登录后首次进入购物车自动载入
 * 由 Mock 数据体系统一维护，字段结构与 `三、核心数据模型定义` 保持一致
 */
export const carts = [
  {
    "id": 3001,
    "goodsId": 1001,
    "name": "老式芝麻大烧饼 传统炭炉烤制 500g",
    "mainPic": "https://picsum.photos/seed/sb1001-1/750/750",
    "specText": "500g",
    "price": 12.8,
    "count": 2,
    "checked": true,
    "stock": 326,
    "unit": "袋",
    "invalid": false
  },
  {
    "id": 3002,
    "goodsId": 1009,
    "name": "宫廷桃酥 酥到掉渣 400g",
    "mainPic": "https://picsum.photos/seed/sb1009-1/750/750",
    "specText": "1kg",
    "price": 36.82,
    "count": 1,
    "checked": true,
    "stock": 420,
    "unit": "袋",
    "invalid": false
  },
  {
    "id": 3003,
    "goodsId": 1014,
    "name": "雪媚娘蛋黄酥 咸蛋黄流心 6枚",
    "mainPic": "https://picsum.photos/seed/sb1014-1/750/750",
    "specText": "默认规格 · 1盒",
    "price": 39.9,
    "count": 3,
    "checked": false,
    "stock": 208,
    "unit": "盒",
    "invalid": false
  },
  {
    "id": 3004,
    "goodsId": 1017,
    "name": "黑豆核桃豆浆粉 早餐冲饮 20条",
    "mainPic": "https://picsum.photos/seed/sb1017-1/750/750",
    "specText": "默认规格 · 1盒",
    "price": 42.8,
    "count": 1,
    "checked": true,
    "stock": 204,
    "unit": "盒",
    "invalid": false
  },
  {
    "id": 3005,
    "goodsId": 1044,
    "name": "三鲜虾仁水饺 皮薄馅大 48只",
    "mainPic": "https://picsum.photos/seed/sb1044-1/750/750",
    "specText": "默认规格 · 1袋",
    "price": 59.9,
    "count": 1,
    "checked": false,
    "stock": 0,
    "unit": "袋",
    "invalid": true
  }
]

export default carts
