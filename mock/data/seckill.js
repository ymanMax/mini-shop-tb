// 限时抢购：3 个场次（10:00 / 14:00 / 20:00），每场 6-8 个商品
// 场次时间为当天小时；抢购价 seckillPrice，已抢百分比 soldPercent，库存 stock
const sk = (goodsId, seckillPrice, soldPercent, stock) => ({ goodsId, seckillPrice, soldPercent, stock })

export const seckillSessions = [
  {
    id: 's10',
    time: '10:00',
    label: '上午场',
    startHour: 10,
    items: [
      sk(101, 9.9, 68, 30),
      sk(102, 7.9, 82, 20),
      sk(106, 8.9, 45, 50),
      sk(301, 9.9, 30, 60),
      sk(402, 10.9, 55, 40),
      sk(801, 5.9, 90, 10),
      sk(203, 12.9, 25, 45)
    ]
  },
  {
    id: 's14',
    time: '14:00',
    label: '午后场',
    startHour: 14,
    items: [
      sk(103, 9.9, 75, 25),
      sk(104, 11.9, 40, 35),
      sk(201, 39.9, 60, 18),
      sk(401, 49.9, 52, 22),
      sk(305, 12.9, 35, 40),
      sk(603, 27.9, 48, 30),
      sk(702, 15.9, 88, 12)
    ]
  },
  {
    id: 's20',
    time: '20:00',
    label: '晚间场',
    startHour: 20,
    items: [
      sk(105, 13.9, 58, 28),
      sk(107, 12.9, 66, 22),
      sk(206, 19.9, 72, 30),
      sk(403, 18.9, 50, 36),
      sk(302, 24.9, 42, 25),
      sk(501, 69.9, 33, 15),
      sk(601, 19.9, 61, 20),
      sk(405, 7.9, 80, 50)
    ]
  }
]
