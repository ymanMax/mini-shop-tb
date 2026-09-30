// 购物车初始 Mock 数据（3~4 条已选中商品，含不同规格）
const goodsList = require('./goods.js')

function byId(id) {
  return goodsList.find(g => g.id === id)
}

// 构造购物车条目
function cartItem(id, goodsId, specText, price, count, checked = true, stock) {
  const g = byId(goodsId)
  return {
    id,
    goodsId,
    name: g.name,
    mainPic: g.mainPic,
    specText,
    price,
    count,
    checked,
    stock: stock != null ? stock : g.stock
  }
}

const initialCarts = [
  cartItem('c1', 1001, '2斤装 · 黑芝麻', 23.9, 2, true),
  cartItem('c2', 1002, '12个装 · 牛肉', 35.8, 1, true),
  cartItem('c3', 4001, '30包750g', 59.9, 1, true),
  cartItem('c4', 1003, '400g袋装', 9.9, 3, false)
]

module.exports = initialCarts
