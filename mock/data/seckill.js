// 限时抢购：3 个场次（10:00 / 14:00 / 20:00），每场 7 个商品
// 每场限时 2 小时；seckillPrice 为抢购价；sold 为已售数量；stock 为总库存
// 商品引用现有 goodsId，「马上抢」跳详情带 seckillId，按抢购价加购

// 场次定义：hour 为开始钟点；products 引用 goods id + 抢购价 + 进度
export const seckillSessions = [
  {
    id: 's10',
    hour: 10,
    title: '上午场',
    products: [
      { goodsId: 1001, seckillPrice: 9.9, originalPrice: 12.9, sold: 168, stock: 200 },
      { goodsId: 1003, seckillPrice: 14.9, originalPrice: 18.8, sold: 150, stock: 200 },
      { goodsId: 2002, seckillPrice: 19.9, originalPrice: 25.9, sold: 120, stock: 150 },
      { goodsId: 3001, seckillPrice: 13.9, originalPrice: 16.8, sold: 96, stock: 120 },
      { goodsId: 4004, seckillPrice: 19.9, originalPrice: 24.9, sold: 88, stock: 110 },
      { goodsId: 6001, seckillPrice: 14.9, originalPrice: 18.8, sold: 130, stock: 160 },
      { goodsId: 8001, seckillPrice: 15.9, originalPrice: 19.9, sold: 190, stock: 200 }
    ]
  },
  {
    id: 's14',
    hour: 14,
    title: '下午场',
    products: [
      { goodsId: 1002, seckillPrice: 7.9, originalPrice: 9.9, sold: 140, stock: 180 },
      { goodsId: 1005, seckillPrice: 13.9, originalPrice: 16.8, sold: 100, stock: 150 },
      { goodsId: 2003, seckillPrice: 10.9, originalPrice: 13.9, sold: 170, stock: 200 },
      { goodsId: 3003, seckillPrice: 15.9, originalPrice: 19.9, sold: 75, stock: 100 },
      { goodsId: 4005, seckillPrice: 38.9, originalPrice: 45.9, sold: 60, stock: 90 },
      { goodsId: 7002, seckillPrice: 19.9, originalPrice: 24.9, sold: 130, stock: 160 },
      { goodsId: 1010, seckillPrice: 10.9, originalPrice: 13.9, sold: 90, stock: 130 }
    ]
  },
  {
    id: 's20',
    hour: 20,
    title: '晚间场',
    products: [
      { goodsId: 1004, seckillPrice: 8.9, originalPrice: 11.5, sold: 150, stock: 180 },
      { goodsId: 2001, seckillPrice: 23.9, originalPrice: 29.9, sold: 110, stock: 140 },
      { goodsId: 2007, seckillPrice: 12.9, originalPrice: 15.9, sold: 130, stock: 160 },
      { goodsId: 3006, seckillPrice: 21.9, originalPrice: 26.9, sold: 55, stock: 80 },
      { goodsId: 4008, seckillPrice: 23.9, originalPrice: 28.9, sold: 95, stock: 120 },
      { goodsId: 5001, seckillPrice: 58.0, originalPrice: 68.0, sold: 40, stock: 60 },
      { goodsId: 4009, seckillPrice: 9.9, originalPrice: 12.9, sold: 160, stock: 200 }
    ]
  }
]

// 每场限购：每人每场每商品限 1 件（mock 用 seckill_purchase 记录）
export const SECKILL_DURATION = 2 * 3600 * 1000 // 2 小时
