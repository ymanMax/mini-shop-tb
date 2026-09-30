// 限时抢购 Mock 数据：3 场（10:00 / 14:00 / 20:00），每场 6-8 个商品
const goods = require('./goods.js')

function g(id) {
  return goods.find(x => x.id === id)
}

// 构造抢购商品
function sk(goodsId, seckillPrice, progress, stock) {
  const goods = g(goodsId)
  return {
    goodsId,
    name: goods.name,
    mainPic: goods.mainPic,
    originalPrice: goods.price,
    seckillPrice,
    progress, // 已抢百分比 20-80
    stock,
    sales: goods.sales
  }
}

// 场次定义
const sessions = [
  {
    id: 's10',
    time: '10:00',
    label: '上午场',
    startHour: 10,
    endHour: 12,
    items: [
      sk(8001, 2.9, 80, 100),
      sk(1003, 7.9, 65, 200),
      sk(2006, 18.8, 45, 150),
      sk(4004, 11.9, 70, 180),
      sk(3002, 12.8, 30, 120),
      sk(6001, 13.8, 55, 90),
      sk(9002, 15.8, 40, 110)
    ]
  },
  {
    id: 's14',
    time: '14:00',
    label: '午后场',
    startHour: 14,
    endHour: 16,
    items: [
      sk(1002, 15.8, 60, 120),
      sk(4001, 49.9, 75, 80),
      sk(2002, 12.9, 50, 160),
      sk(4002, 32.9, 68, 100),
      sk(7001, 16.9, 35, 90),
      sk(3001, 14.9, 42, 140),
      sk(2004, 10.9, 58, 200),
      sk(8003, 5.9, 85, 60)
    ]
  },
  {
    id: 's20',
    time: '20:00',
    label: '晚间场',
    startHour: 20,
    endHour: 22,
    items: [
      sk(1001, 9.9, 72, 150),
      sk(5001, 99.0, 30, 50),
      sk(4003, 21.8, 65, 130),
      sk(2005, 13.8, 48, 110),
      sk(6002, 15.9, 55, 100),
      sk(7002, 19.8, 25, 80),
      sk(4006, 17.9, 62, 95),
      sk(9001, 14.9, 40, 120)
    ]
  }
]

module.exports = sessions
