/**
 * 订单数据：14 条订单，覆盖 6 种状态，含物流轨迹
 * 由 Mock 数据体系统一维护，字段结构与 `三、核心数据模型定义` 保持一致
 */
export const orders = [
  {
    "id": 9001,
    "orderNo": "20260928101000000",
    "status": 1,
    "statusText": "待付款",
    "items": [
      {
        "goodsId": 1001,
        "name": "老式芝麻大烧饼 传统炭炉烤制 500g",
        "mainPic": "https://picsum.photos/seed/sb1001-1/750/750",
        "specText": "500g",
        "price": 12.8,
        "count": 1,
        "unit": "袋"
      }
    ],
    "totalAmount": 12.8,
    "discountAmount": 5,
    "freight": 0,
    "payAmount": 7.8,
    "addressSnapshot": {
      "id": 2,
      "userName": "张小烧",
      "telNumber": "13999999999",
      "provinceName": "江苏省",
      "cityName": "苏州市",
      "countyName": "姑苏区",
      "detailInfo": "观前街 128 号 3 单元 602 室",
      "all": "江苏省苏州市姑苏区观前街 128 号 3 单元 602 室",
      "tag": "家",
      "isDefault": false
    },
    "createTime": 1790586000000,
    "payTime": 0,
    "payMethod": "微信支付",
    "remark": "",
    "logistics": {
      "company": "顺丰速运",
      "trackingNo": "SF100000000000",
      "statusText": "等待付款",
      "timeline": [
        {
          "text": "已签收",
          "desc": "包裹已签收，感谢您的购买",
          "time": 1790715600000,
          "done": false
        },
        {
          "text": "派送中",
          "desc": "快递员正在为您派送，请保持电话畅通",
          "time": 1790683200000,
          "done": false
        },
        {
          "text": "运输中",
          "desc": "包裹已到达杭州转运中心",
          "time": 1790650800000,
          "done": false
        },
        {
          "text": "商家已发货",
          "desc": "包裹已揽收，正在发往分拨中心",
          "time": 1790618400000,
          "done": false
        },
        {
          "text": "商品已下单",
          "desc": "订单提交成功，等待商家发货",
          "time": 1790586000000,
          "done": true
        }
      ]
    },
    "isReviewed": false
  },
  {
    "id": 9002,
    "orderNo": "20260927111000137",
    "status": 1,
    "statusText": "待付款",
    "items": [
      {
        "goodsId": 1006,
        "name": "黄山梅干菜薄脆烧饼 原味 250g",
        "mainPic": "https://picsum.photos/seed/sb1006-1/750/750",
        "specText": "20条 · 原味",
        "price": 18.8,
        "count": 2,
        "unit": "袋"
      },
      {
        "goodsId": 1017,
        "name": "黑豆核桃豆浆粉 早餐冲饮 20条",
        "mainPic": "https://picsum.photos/seed/sb1017-1/750/750",
        "specText": "默认规格 · 1盒",
        "price": 42.8,
        "count": 3,
        "unit": "盒"
      }
    ],
    "totalAmount": 166,
    "discountAmount": 10,
    "freight": 0,
    "payAmount": 156,
    "addressSnapshot": {
      "id": 1,
      "userName": "张小烧",
      "telNumber": "13888888888",
      "provinceName": "浙江省",
      "cityName": "杭州市",
      "countyName": "西湖区",
      "detailInfo": "文三路 478 号华星时代广场 A 座 1802 室",
      "all": "浙江省杭州市西湖区文三路 478 号华星时代广场 A 座 1802 室",
      "tag": "家",
      "isDefault": true
    },
    "createTime": 1790492400000,
    "payTime": 0,
    "payMethod": "货到付款",
    "remark": "请务必工作日送达",
    "logistics": {
      "company": "中通快递",
      "trackingNo": "SF100000007919",
      "statusText": "等待付款",
      "timeline": [
        {
          "text": "已签收",
          "desc": "包裹已签收，感谢您的购买",
          "time": 1790622000000,
          "done": false
        },
        {
          "text": "派送中",
          "desc": "快递员正在为您派送，请保持电话畅通",
          "time": 1790589600000,
          "done": false
        },
        {
          "text": "运输中",
          "desc": "包裹已到达杭州转运中心",
          "time": 1790557200000,
          "done": false
        },
        {
          "text": "商家已发货",
          "desc": "包裹已揽收，正在发往分拨中心",
          "time": 1790524800000,
          "done": false
        },
        {
          "text": "商品已下单",
          "desc": "订单提交成功，等待商家发货",
          "time": 1790492400000,
          "done": true
        }
      ]
    },
    "isReviewed": false
  },
  {
    "id": 9003,
    "orderNo": "20260926121000274",
    "status": 2,
    "statusText": "待发货",
    "items": [
      {
        "goodsId": 1011,
        "name": "冰皮绿豆糕 低糖少油 12枚",
        "mainPic": "https://picsum.photos/seed/sb1011-1/750/750",
        "specText": "默认规格 · 1盒",
        "price": 25.9,
        "count": 3,
        "unit": "盒"
      },
      {
        "goodsId": 1022,
        "name": "咸蛋黄糯米锅巴 追剧零食 300g",
        "mainPic": "https://picsum.photos/seed/sb1022-1/750/750",
        "specText": "20条 · 原味",
        "price": 19.9,
        "count": 1,
        "unit": "袋"
      },
      {
        "goodsId": 1033,
        "name": "山西太谷饼 老字号 10个装",
        "mainPic": "https://picsum.photos/seed/sb1033-1/750/750",
        "specText": "500g",
        "price": 26.8,
        "count": 2,
        "unit": "袋"
      }
    ],
    "totalAmount": 151.2,
    "discountAmount": 0,
    "freight": 0,
    "payAmount": 151.2,
    "addressSnapshot": {
      "id": 1,
      "userName": "张小烧",
      "telNumber": "13888888888",
      "provinceName": "浙江省",
      "cityName": "杭州市",
      "countyName": "西湖区",
      "detailInfo": "文三路 478 号华星时代广场 A 座 1802 室",
      "all": "浙江省杭州市西湖区文三路 478 号华星时代广场 A 座 1802 室",
      "tag": "家",
      "isDefault": true
    },
    "createTime": 1790398800000,
    "payTime": 1790398980000,
    "payMethod": "微信支付",
    "remark": "不要放快递柜，谢谢",
    "logistics": {
      "company": "圆通速递",
      "trackingNo": "SF100000015838",
      "statusText": "待揽收",
      "timeline": [
        {
          "text": "已签收",
          "desc": "包裹已签收，感谢您的购买",
          "time": 1790528400000,
          "done": false
        },
        {
          "text": "派送中",
          "desc": "快递员正在为您派送，请保持电话畅通",
          "time": 1790496000000,
          "done": false
        },
        {
          "text": "运输中",
          "desc": "包裹已到达杭州转运中心",
          "time": 1790463600000,
          "done": false
        },
        {
          "text": "商家已发货",
          "desc": "包裹已揽收，正在发往分拨中心",
          "time": 1790431200000,
          "done": false
        },
        {
          "text": "商品已下单",
          "desc": "订单提交成功，等待商家发货",
          "time": 1790398800000,
          "done": true
        }
      ]
    },
    "isReviewed": false
  },
  {
    "id": 9004,
    "orderNo": "20260925131000411",
    "status": 2,
    "statusText": "待发货",
    "items": [
      {
        "goodsId": 1016,
        "name": "现磨原味豆浆粉 无蔗糖 30条",
        "mainPic": "https://picsum.photos/seed/sb1016-1/750/750",
        "specText": "单人份",
        "price": 36.8,
        "count": 1,
        "unit": "盒"
      }
    ],
    "totalAmount": 36.8,
    "discountAmount": 5,
    "freight": 0,
    "payAmount": 31.8,
    "addressSnapshot": {
      "id": 2,
      "userName": "张小烧",
      "telNumber": "13999999999",
      "provinceName": "江苏省",
      "cityName": "苏州市",
      "countyName": "姑苏区",
      "detailInfo": "观前街 128 号 3 单元 602 室",
      "all": "江苏省苏州市姑苏区观前街 128 号 3 单元 602 室",
      "tag": "家",
      "isDefault": false
    },
    "createTime": 1790305200000,
    "payTime": 1790305380000,
    "payMethod": "货到付款",
    "remark": "需要发票",
    "logistics": {
      "company": "京东物流",
      "trackingNo": "SF100000023757",
      "statusText": "待揽收",
      "timeline": [
        {
          "text": "已签收",
          "desc": "包裹已签收，感谢您的购买",
          "time": 1790434800000,
          "done": false
        },
        {
          "text": "派送中",
          "desc": "快递员正在为您派送，请保持电话畅通",
          "time": 1790402400000,
          "done": false
        },
        {
          "text": "运输中",
          "desc": "包裹已到达杭州转运中心",
          "time": 1790370000000,
          "done": false
        },
        {
          "text": "商家已发货",
          "desc": "包裹已揽收，正在发往分拨中心",
          "time": 1790337600000,
          "done": false
        },
        {
          "text": "商品已下单",
          "desc": "订单提交成功，等待商家发货",
          "time": 1790305200000,
          "done": true
        }
      ]
    },
    "isReviewed": false
  },
  {
    "id": 9005,
    "orderNo": "20260924141000548",
    "status": 2,
    "statusText": "待发货",
    "items": [
      {
        "goodsId": 1021,
        "name": "手工柴火锅巴 麻辣味 260g",
        "mainPic": "https://picsum.photos/seed/sb1021-1/750/750",
        "specText": "250g · 袋装",
        "price": 16.8,
        "count": 2,
        "unit": "袋"
      },
      {
        "goodsId": 1032,
        "name": "重庆怪味胡豆 麻辣酥脆 400g",
        "mainPic": "https://picsum.photos/seed/sb1032-1/750/750",
        "specText": "默认规格 · 1袋",
        "price": 18.8,
        "count": 3,
        "unit": "袋"
      }
    ],
    "totalAmount": 90,
    "discountAmount": 10,
    "freight": 0,
    "payAmount": 80,
    "addressSnapshot": {
      "id": 1,
      "userName": "张小烧",
      "telNumber": "13888888888",
      "provinceName": "浙江省",
      "cityName": "杭州市",
      "countyName": "西湖区",
      "detailInfo": "文三路 478 号华星时代广场 A 座 1802 室",
      "all": "浙江省杭州市西湖区文三路 478 号华星时代广场 A 座 1802 室",
      "tag": "家",
      "isDefault": true
    },
    "createTime": 1790211600000,
    "payTime": 1790211780000,
    "payMethod": "微信支付",
    "remark": "",
    "logistics": {
      "company": "顺丰速运",
      "trackingNo": "SF100000031676",
      "statusText": "待揽收",
      "timeline": [
        {
          "text": "已签收",
          "desc": "包裹已签收，感谢您的购买",
          "time": 1790341200000,
          "done": false
        },
        {
          "text": "派送中",
          "desc": "快递员正在为您派送，请保持电话畅通",
          "time": 1790308800000,
          "done": false
        },
        {
          "text": "运输中",
          "desc": "包裹已到达杭州转运中心",
          "time": 1790276400000,
          "done": false
        },
        {
          "text": "商家已发货",
          "desc": "包裹已揽收，正在发往分拨中心",
          "time": 1790244000000,
          "done": false
        },
        {
          "text": "商品已下单",
          "desc": "订单提交成功，等待商家发货",
          "time": 1790211600000,
          "done": true
        }
      ]
    },
    "isReviewed": false
  },
  {
    "id": 9006,
    "orderNo": "20260923151000685",
    "status": 3,
    "statusText": "配送中",
    "items": [
      {
        "goodsId": 1026,
        "name": "手工山楂条 无添加色素 200g",
        "mainPic": "https://picsum.photos/seed/sb1026-1/750/750",
        "specText": "默认规格 · 1袋",
        "price": 5.9,
        "count": 3,
        "unit": "袋"
      },
      {
        "goodsId": 1037,
        "name": "手工桃酥尝鲜装 限时 5 折 200g",
        "mainPic": "https://picsum.photos/seed/sb1037-1/750/750",
        "specText": "250g · 袋装",
        "price": 9.9,
        "count": 1,
        "unit": "袋"
      },
      {
        "goodsId": 1048,
        "name": "香菇鸡肉烧饼 低脂轻食 5个装",
        "mainPic": "https://picsum.photos/seed/sb1048-1/750/750",
        "specText": "单人份",
        "price": 28.8,
        "count": 2,
        "unit": "盒"
      }
    ],
    "totalAmount": 85.2,
    "discountAmount": 0,
    "freight": 0,
    "payAmount": 85.2,
    "addressSnapshot": {
      "id": 1,
      "userName": "张小烧",
      "telNumber": "13888888888",
      "provinceName": "浙江省",
      "cityName": "杭州市",
      "countyName": "西湖区",
      "detailInfo": "文三路 478 号华星时代广场 A 座 1802 室",
      "all": "浙江省杭州市西湖区文三路 478 号华星时代广场 A 座 1802 室",
      "tag": "家",
      "isDefault": true
    },
    "createTime": 1790118000000,
    "payTime": 1790118180000,
    "payMethod": "货到付款",
    "remark": "放门口即可",
    "logistics": {
      "company": "中通快递",
      "trackingNo": "SF100000039595",
      "statusText": "运输中",
      "timeline": [
        {
          "text": "已签收",
          "desc": "包裹已签收，感谢您的购买",
          "time": 1790247600000,
          "done": false
        },
        {
          "text": "派送中",
          "desc": "快递员正在为您派送，请保持电话畅通",
          "time": 1790215200000,
          "done": false
        },
        {
          "text": "运输中",
          "desc": "包裹已到达杭州转运中心",
          "time": 1790182800000,
          "done": true
        },
        {
          "text": "商家已发货",
          "desc": "包裹已揽收，正在发往分拨中心",
          "time": 1790150400000,
          "done": true
        },
        {
          "text": "商品已下单",
          "desc": "订单提交成功，等待商家发货",
          "time": 1790118000000,
          "done": true
        }
      ]
    },
    "isReviewed": false
  },
  {
    "id": 9007,
    "orderNo": "20260922161000822",
    "status": 3,
    "statusText": "配送中",
    "items": [
      {
        "goodsId": 1031,
        "name": "苏州定胜糕 江南传统糕点 8块",
        "mainPic": "https://picsum.photos/seed/sb1031-1/750/750",
        "specText": "10个装 · 红糖",
        "price": 32.8,
        "count": 1,
        "unit": "盒"
      }
    ],
    "totalAmount": 32.8,
    "discountAmount": 5,
    "freight": 0,
    "payAmount": 27.8,
    "addressSnapshot": {
      "id": 2,
      "userName": "张小烧",
      "telNumber": "13999999999",
      "provinceName": "江苏省",
      "cityName": "苏州市",
      "countyName": "姑苏区",
      "detailInfo": "观前街 128 号 3 单元 602 室",
      "all": "江苏省苏州市姑苏区观前街 128 号 3 单元 602 室",
      "tag": "家",
      "isDefault": false
    },
    "createTime": 1790024400000,
    "payTime": 1790024580000,
    "payMethod": "微信支付",
    "remark": "",
    "logistics": {
      "company": "圆通速递",
      "trackingNo": "SF100000047514",
      "statusText": "运输中",
      "timeline": [
        {
          "text": "已签收",
          "desc": "包裹已签收，感谢您的购买",
          "time": 1790154000000,
          "done": false
        },
        {
          "text": "派送中",
          "desc": "快递员正在为您派送，请保持电话畅通",
          "time": 1790121600000,
          "done": false
        },
        {
          "text": "运输中",
          "desc": "包裹已到达杭州转运中心",
          "time": 1790089200000,
          "done": true
        },
        {
          "text": "商家已发货",
          "desc": "包裹已揽收，正在发往分拨中心",
          "time": 1790056800000,
          "done": true
        },
        {
          "text": "商品已下单",
          "desc": "订单提交成功，等待商家发货",
          "time": 1790024400000,
          "done": true
        }
      ]
    },
    "isReviewed": false
  },
  {
    "id": 9008,
    "orderNo": "20260921171000959",
    "status": 4,
    "statusText": "待收货",
    "items": [
      {
        "goodsId": 1036,
        "name": "经典芝麻烧饼 限时秒杀 5个装",
        "mainPic": "https://picsum.photos/seed/sb1036-1/750/750",
        "specText": "原味 · 简装",
        "price": 5.9,
        "count": 2,
        "unit": "袋"
      },
      {
        "goodsId": 1047,
        "name": "椒盐芝麻烧饼 咸香酥脆 6个装",
        "mainPic": "https://picsum.photos/seed/sb1047-1/750/750",
        "specText": "默认规格 · 1盒",
        "price": 19.9,
        "count": 3,
        "unit": "盒"
      }
    ],
    "totalAmount": 71.5,
    "discountAmount": 10,
    "freight": 0,
    "payAmount": 61.5,
    "addressSnapshot": {
      "id": 1,
      "userName": "张小烧",
      "telNumber": "13888888888",
      "provinceName": "浙江省",
      "cityName": "杭州市",
      "countyName": "西湖区",
      "detailInfo": "文三路 478 号华星时代广场 A 座 1802 室",
      "all": "浙江省杭州市西湖区文三路 478 号华星时代广场 A 座 1802 室",
      "tag": "家",
      "isDefault": true
    },
    "createTime": 1789930800000,
    "payTime": 1789930980000,
    "payMethod": "货到付款",
    "remark": "请务必工作日送达",
    "logistics": {
      "company": "京东物流",
      "trackingNo": "SF100000055433",
      "statusText": "派送中",
      "timeline": [
        {
          "text": "已签收",
          "desc": "包裹已签收，感谢您的购买",
          "time": 1790060400000,
          "done": false
        },
        {
          "text": "派送中",
          "desc": "快递员正在为您派送，请保持电话畅通",
          "time": 1790028000000,
          "done": true
        },
        {
          "text": "运输中",
          "desc": "包裹已到达杭州转运中心",
          "time": 1789995600000,
          "done": true
        },
        {
          "text": "商家已发货",
          "desc": "包裹已揽收，正在发往分拨中心",
          "time": 1789963200000,
          "done": true
        },
        {
          "text": "商品已下单",
          "desc": "订单提交成功，等待商家发货",
          "time": 1789930800000,
          "done": true
        }
      ]
    },
    "isReviewed": false
  },
  {
    "id": 9009,
    "orderNo": "20260920181001096",
    "status": 4,
    "statusText": "待收货",
    "items": [
      {
        "goodsId": 1041,
        "name": "手工鲜肉大包 老面发酵 12个",
        "mainPic": "https://picsum.photos/seed/sb1041-1/750/750",
        "specText": "默认规格 · 1袋",
        "price": 36.8,
        "count": 3,
        "unit": "袋"
      },
      {
        "goodsId": 1052,
        "name": "葱油咸桃酥 咸口党福音 400g",
        "mainPic": "https://picsum.photos/seed/sb1052-1/750/750",
        "specText": "原味 · 简装",
        "price": 21.9,
        "count": 1,
        "unit": "袋"
      },
      {
        "goodsId": 1063,
        "name": "咸甜双拼礼盒 一次尝遍 14件",
        "mainPic": "https://picsum.photos/seed/sb1063-1/750/750",
        "specText": "10个装 · 红糖",
        "price": 138,
        "count": 2,
        "unit": "盒"
      }
    ],
    "totalAmount": 408.3,
    "discountAmount": 0,
    "freight": 0,
    "payAmount": 408.3,
    "addressSnapshot": {
      "id": 1,
      "userName": "张小烧",
      "telNumber": "13888888888",
      "provinceName": "浙江省",
      "cityName": "杭州市",
      "countyName": "西湖区",
      "detailInfo": "文三路 478 号华星时代广场 A 座 1802 室",
      "all": "浙江省杭州市西湖区文三路 478 号华星时代广场 A 座 1802 室",
      "tag": "家",
      "isDefault": true
    },
    "createTime": 1789837200000,
    "payTime": 1789837380000,
    "payMethod": "微信支付",
    "remark": "不要放快递柜，谢谢",
    "logistics": {
      "company": "顺丰速运",
      "trackingNo": "SF100000063352",
      "statusText": "派送中",
      "timeline": [
        {
          "text": "已签收",
          "desc": "包裹已签收，感谢您的购买",
          "time": 1789966800000,
          "done": false
        },
        {
          "text": "派送中",
          "desc": "快递员正在为您派送，请保持电话畅通",
          "time": 1789934400000,
          "done": true
        },
        {
          "text": "运输中",
          "desc": "包裹已到达杭州转运中心",
          "time": 1789902000000,
          "done": true
        },
        {
          "text": "商家已发货",
          "desc": "包裹已揽收，正在发往分拨中心",
          "time": 1789869600000,
          "done": true
        },
        {
          "text": "商品已下单",
          "desc": "订单提交成功，等待商家发货",
          "time": 1789837200000,
          "done": true
        }
      ]
    },
    "isReviewed": false
  },
  {
    "id": 9010,
    "orderNo": "20260919191001233",
    "status": 5,
    "statusText": "已完成",
    "items": [
      {
        "goodsId": 1046,
        "name": "芝麻烧饼家庭装 现烤直发 10个",
        "mainPic": "https://picsum.photos/seed/sb1046-1/750/750",
        "specText": "20条 · 原味",
        "price": 29.9,
        "count": 1,
        "unit": "盒"
      }
    ],
    "totalAmount": 29.9,
    "discountAmount": 5,
    "freight": 0,
    "payAmount": 24.9,
    "addressSnapshot": {
      "id": 2,
      "userName": "张小烧",
      "telNumber": "13999999999",
      "provinceName": "江苏省",
      "cityName": "苏州市",
      "countyName": "姑苏区",
      "detailInfo": "观前街 128 号 3 单元 602 室",
      "all": "江苏省苏州市姑苏区观前街 128 号 3 单元 602 室",
      "tag": "家",
      "isDefault": false
    },
    "createTime": 1789743600000,
    "payTime": 1789743780000,
    "payMethod": "货到付款",
    "remark": "需要发票",
    "logistics": {
      "company": "中通快递",
      "trackingNo": "SF100000071271",
      "statusText": "已签收",
      "timeline": [
        {
          "text": "已签收",
          "desc": "包裹已签收，感谢您的购买",
          "time": 1789873200000,
          "done": true
        },
        {
          "text": "派送中",
          "desc": "快递员正在为您派送，请保持电话畅通",
          "time": 1789840800000,
          "done": true
        },
        {
          "text": "运输中",
          "desc": "包裹已到达杭州转运中心",
          "time": 1789808400000,
          "done": true
        },
        {
          "text": "商家已发货",
          "desc": "包裹已揽收，正在发往分拨中心",
          "time": 1789776000000,
          "done": true
        },
        {
          "text": "商品已下单",
          "desc": "订单提交成功，等待商家发货",
          "time": 1789743600000,
          "done": true
        }
      ]
    },
    "isReviewed": false
  },
  {
    "id": 9011,
    "orderNo": "20260918201001370",
    "status": 5,
    "statusText": "已完成",
    "items": [
      {
        "goodsId": 1051,
        "name": "黑糖桂圆糖火烧 女生最爱 8个装",
        "mainPic": "https://picsum.photos/seed/sb1051-1/750/750",
        "specText": "6个装 · 原味",
        "price": 24.9,
        "count": 2,
        "unit": "盒"
      },
      {
        "goodsId": 1062,
        "name": "冻干草莓脆 无添加蔗糖 100g",
        "mainPic": "https://picsum.photos/seed/sb1062-1/750/750",
        "specText": "默认规格 · 1袋",
        "price": 32.8,
        "count": 3,
        "unit": "袋"
      }
    ],
    "totalAmount": 148.2,
    "discountAmount": 10,
    "freight": 0,
    "payAmount": 138.2,
    "addressSnapshot": {
      "id": 1,
      "userName": "张小烧",
      "telNumber": "13888888888",
      "provinceName": "浙江省",
      "cityName": "杭州市",
      "countyName": "西湖区",
      "detailInfo": "文三路 478 号华星时代广场 A 座 1802 室",
      "all": "浙江省杭州市西湖区文三路 478 号华星时代广场 A 座 1802 室",
      "tag": "家",
      "isDefault": true
    },
    "createTime": 1789650000000,
    "payTime": 1789650180000,
    "payMethod": "微信支付",
    "remark": "",
    "logistics": {
      "company": "圆通速递",
      "trackingNo": "SF100000079190",
      "statusText": "已签收",
      "timeline": [
        {
          "text": "已签收",
          "desc": "包裹已签收，感谢您的购买",
          "time": 1789779600000,
          "done": true
        },
        {
          "text": "派送中",
          "desc": "快递员正在为您派送，请保持电话畅通",
          "time": 1789747200000,
          "done": true
        },
        {
          "text": "运输中",
          "desc": "包裹已到达杭州转运中心",
          "time": 1789714800000,
          "done": true
        },
        {
          "text": "商家已发货",
          "desc": "包裹已揽收，正在发往分拨中心",
          "time": 1789682400000,
          "done": true
        },
        {
          "text": "商品已下单",
          "desc": "订单提交成功，等待商家发货",
          "time": 1789650000000,
          "done": true
        }
      ]
    },
    "isReviewed": false
  },
  {
    "id": 9012,
    "orderNo": "20260917211001507",
    "status": 5,
    "statusText": "已完成",
    "items": [
      {
        "goodsId": 1056,
        "name": "抹茶麻薯蛋黄酥 下午茶点心 6枚",
        "mainPic": "https://picsum.photos/seed/sb1056-1/750/750",
        "specText": "默认规格 · 1盒",
        "price": 42.9,
        "count": 3,
        "unit": "盒"
      },
      {
        "goodsId": 1067,
        "name": "冬日姜枣糕 暖身新品 8块",
        "mainPic": "https://picsum.photos/seed/sb1067-1/750/750",
        "specText": "6个装 · 原味",
        "price": 31.8,
        "count": 1,
        "unit": "盒"
      },
      {
        "goodsId": 1078,
        "name": "龙须酥 手工拉丝 传统茶点 250g",
        "mainPic": "https://picsum.photos/seed/sb1078-1/750/750",
        "specText": "20条 · 原味",
        "price": 33.8,
        "count": 2,
        "unit": "盒"
      }
    ],
    "totalAmount": 228.1,
    "discountAmount": 0,
    "freight": 0,
    "payAmount": 228.1,
    "addressSnapshot": {
      "id": 1,
      "userName": "张小烧",
      "telNumber": "13888888888",
      "provinceName": "浙江省",
      "cityName": "杭州市",
      "countyName": "西湖区",
      "detailInfo": "文三路 478 号华星时代广场 A 座 1802 室",
      "all": "浙江省杭州市西湖区文三路 478 号华星时代广场 A 座 1802 室",
      "tag": "家",
      "isDefault": true
    },
    "createTime": 1789556400000,
    "payTime": 1789556580000,
    "payMethod": "货到付款",
    "remark": "放门口即可",
    "logistics": {
      "company": "京东物流",
      "trackingNo": "SF100000087109",
      "statusText": "已签收",
      "timeline": [
        {
          "text": "已签收",
          "desc": "包裹已签收，感谢您的购买",
          "time": 1789686000000,
          "done": true
        },
        {
          "text": "派送中",
          "desc": "快递员正在为您派送，请保持电话畅通",
          "time": 1789653600000,
          "done": true
        },
        {
          "text": "运输中",
          "desc": "包裹已到达杭州转运中心",
          "time": 1789621200000,
          "done": true
        },
        {
          "text": "商家已发货",
          "desc": "包裹已揽收，正在发往分拨中心",
          "time": 1789588800000,
          "done": true
        },
        {
          "text": "商品已下单",
          "desc": "订单提交成功，等待商家发货",
          "time": 1789556400000,
          "done": true
        }
      ]
    },
    "isReviewed": false
  },
  {
    "id": 9013,
    "orderNo": "20260916221001644",
    "status": 6,
    "statusText": "已取消",
    "items": [
      {
        "goodsId": 1061,
        "name": "椒盐小麻花 独立包装 400g",
        "mainPic": "https://picsum.photos/seed/sb1061-1/750/750",
        "specText": "250g · 袋装",
        "price": 19.9,
        "count": 1,
        "unit": "袋"
      }
    ],
    "totalAmount": 19.9,
    "discountAmount": 5,
    "freight": 0,
    "payAmount": 14.9,
    "addressSnapshot": {
      "id": 2,
      "userName": "张小烧",
      "telNumber": "13999999999",
      "provinceName": "江苏省",
      "cityName": "苏州市",
      "countyName": "姑苏区",
      "detailInfo": "观前街 128 号 3 单元 602 室",
      "all": "江苏省苏州市姑苏区观前街 128 号 3 单元 602 室",
      "tag": "家",
      "isDefault": false
    },
    "createTime": 1789462800000,
    "payTime": 0,
    "payMethod": "微信支付",
    "remark": "",
    "logistics": {
      "company": "顺丰速运",
      "trackingNo": "SF100000095028",
      "statusText": "订单已取消",
      "timeline": [
        {
          "text": "已签收",
          "desc": "包裹已签收，感谢您的购买",
          "time": 1789592400000,
          "done": false
        },
        {
          "text": "派送中",
          "desc": "快递员正在为您派送，请保持电话畅通",
          "time": 1789560000000,
          "done": false
        },
        {
          "text": "运输中",
          "desc": "包裹已到达杭州转运中心",
          "time": 1789527600000,
          "done": false
        },
        {
          "text": "商家已发货",
          "desc": "包裹已揽收，正在发往分拨中心",
          "time": 1789495200000,
          "done": false
        },
        {
          "text": "商品已下单",
          "desc": "订单提交成功，等待商家发货",
          "time": 1789462800000,
          "done": true
        }
      ]
    },
    "isReviewed": false
  },
  {
    "id": 9014,
    "orderNo": "20260915101001781",
    "status": 6,
    "statusText": "已取消",
    "items": [
      {
        "goodsId": 1066,
        "name": "四川叶儿粑 咸甜双味 10个",
        "mainPic": "https://picsum.photos/seed/sb1066-1/750/750",
        "specText": "4个装",
        "price": 30.8,
        "count": 2,
        "unit": "袋"
      },
      {
        "goodsId": 1077,
        "name": "花生酥 颗颗花生仁 350g",
        "mainPic": "https://picsum.photos/seed/sb1077-1/750/750",
        "specText": "默认规格 · 1袋",
        "price": 23.9,
        "count": 3,
        "unit": "袋"
      }
    ],
    "totalAmount": 133.3,
    "discountAmount": 10,
    "freight": 0,
    "payAmount": 123.3,
    "addressSnapshot": {
      "id": 1,
      "userName": "张小烧",
      "telNumber": "13888888888",
      "provinceName": "浙江省",
      "cityName": "杭州市",
      "countyName": "西湖区",
      "detailInfo": "文三路 478 号华星时代广场 A 座 1802 室",
      "all": "浙江省杭州市西湖区文三路 478 号华星时代广场 A 座 1802 室",
      "tag": "家",
      "isDefault": true
    },
    "createTime": 1789369200000,
    "payTime": 0,
    "payMethod": "货到付款",
    "remark": "请务必工作日送达",
    "logistics": {
      "company": "中通快递",
      "trackingNo": "SF100000102947",
      "statusText": "订单已取消",
      "timeline": [
        {
          "text": "已签收",
          "desc": "包裹已签收，感谢您的购买",
          "time": 1789498800000,
          "done": false
        },
        {
          "text": "派送中",
          "desc": "快递员正在为您派送，请保持电话畅通",
          "time": 1789466400000,
          "done": false
        },
        {
          "text": "运输中",
          "desc": "包裹已到达杭州转运中心",
          "time": 1789434000000,
          "done": false
        },
        {
          "text": "商家已发货",
          "desc": "包裹已揽收，正在发往分拨中心",
          "time": 1789401600000,
          "done": false
        },
        {
          "text": "商品已下单",
          "desc": "订单提交成功，等待商家发货",
          "time": 1789369200000,
          "done": true
        }
      ]
    },
    "isReviewed": false
  }
]

export default orders
