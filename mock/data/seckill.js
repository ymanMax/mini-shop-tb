/**
 * 限时抢购：每天 10:00 / 14:00 / 20:00 三场，每场 2 小时、6~8 个商品
 * 由 Mock 数据体系统一维护，字段结构与需求文档保持一致
 */
export const seckillSessions = [
  {
    "id": 1,
    "label": "10:00",
    "startHour": 10,
    "endHour": 12,
    "durationHours": 2,
    "goods": [
      {
        "goodsId": 1001,
        "name": "老式芝麻大烧饼 传统炭炉烤制 500g",
        "mainPic": "https://picsum.photos/seed/sb1001-1/750/750",
        "price": 12.8,
        "originalPrice": 19.8,
        "seckillPrice": 6.4,
        "stock": 200,
        "sold": 40,
        "progress": 20,
        "remain": 160,
        "unit": "袋",
        "specs": [
          {
            "name": "规格",
            "values": [
              {
                "label": "500g",
                "price": 12.8,
                "stock": 326
              },
              {
                "label": "1kg",
                "price": 23.68,
                "stock": 88
              },
              {
                "label": "2kg",
                "price": 33.28,
                "stock": 42
              }
            ]
          }
        ],
        "limitPerUser": 1
      },
      {
        "goodsId": 1009,
        "name": "宫廷桃酥 酥到掉渣 400g",
        "mainPic": "https://picsum.photos/seed/sb1009-1/750/750",
        "price": 19.9,
        "originalPrice": 29.9,
        "seckillPrice": 11.94,
        "stock": 600,
        "sold": 168,
        "progress": 28,
        "remain": 432,
        "unit": "袋",
        "specs": [
          {
            "name": "规格",
            "values": [
              {
                "label": "500g",
                "price": 19.9,
                "stock": 420
              },
              {
                "label": "1kg",
                "price": 36.82,
                "stock": 114
              },
              {
                "label": "2kg",
                "price": 51.74,
                "stock": 54
              }
            ]
          }
        ],
        "limitPerUser": 1
      },
      {
        "goodsId": 1014,
        "name": "雪媚娘蛋黄酥 咸蛋黄流心 6枚",
        "mainPic": "https://picsum.photos/seed/sb1014-1/750/750",
        "price": 39.9,
        "originalPrice": 55.9,
        "seckillPrice": 21.95,
        "stock": 400,
        "sold": 304,
        "progress": 76,
        "remain": 96,
        "unit": "盒",
        "specs": [],
        "limitPerUser": 1
      },
      {
        "goodsId": 1022,
        "name": "咸蛋黄糯米锅巴 追剧零食 300g",
        "mainPic": "https://picsum.photos/seed/sb1022-1/750/750",
        "price": 19.9,
        "originalPrice": 28.9,
        "seckillPrice": 8.96,
        "stock": 300,
        "sold": 69,
        "progress": 23,
        "remain": 231,
        "unit": "袋",
        "specs": [
          {
            "name": "规格",
            "values": [
              {
                "label": "20条",
                "price": 19.9,
                "stock": 268
              },
              {
                "label": "30条",
                "price": 28.85,
                "stock": 92
              }
            ]
          },
          {
            "name": "口味",
            "values": [
              {
                "label": "原味"
              },
              {
                "label": "红枣味"
              },
              {
                "label": "黑芝麻"
              }
            ]
          }
        ],
        "limitPerUser": 1
      },
      {
        "goodsId": 1027,
        "name": "烧饼糕点双拼礼盒 伴手礼 12件",
        "mainPic": "https://picsum.photos/seed/sb1027-1/750/750",
        "price": 128,
        "originalPrice": 178,
        "seckillPrice": 64,
        "stock": 600,
        "sold": 426,
        "progress": 71,
        "remain": 174,
        "unit": "盒",
        "specs": [
          {
            "name": "规格",
            "values": [
              {
                "label": "6个装",
                "price": 128,
                "stock": 88
              },
              {
                "label": "12个装",
                "price": 245.76,
                "stock": 23
              }
            ]
          },
          {
            "name": "口味",
            "values": [
              {
                "label": "原味"
              },
              {
                "label": "辣味"
              },
              {
                "label": "椒盐"
              }
            ]
          }
        ],
        "limitPerUser": 1
      },
      {
        "goodsId": 1036,
        "name": "经典芝麻烧饼 限时秒杀 5个装",
        "mainPic": "https://picsum.photos/seed/sb1036-1/750/750",
        "price": 5.9,
        "originalPrice": 11.9,
        "seckillPrice": 2.36,
        "stock": 200,
        "sold": 50,
        "progress": 25,
        "remain": 150,
        "unit": "袋",
        "specs": [
          {
            "name": "口味",
            "values": [
              {
                "label": "原味"
              },
              {
                "label": "麻辣味"
              },
              {
                "label": "孜然味"
              }
            ]
          },
          {
            "name": "包装",
            "values": [
              {
                "label": "简装",
                "price": 5.9,
                "stock": 260
              },
              {
                "label": "礼盒装",
                "price": 8.85,
                "stock": 87
              }
            ]
          }
        ],
        "limitPerUser": 1
      },
      {
        "goodsId": 1045,
        "name": "老面手工馒头 零添加 10个",
        "mainPic": "https://picsum.photos/seed/sb1045-1/750/750",
        "price": 16.8,
        "originalPrice": 24.8,
        "seckillPrice": 10.08,
        "stock": 300,
        "sold": 120,
        "progress": 40,
        "remain": 180,
        "unit": "袋",
        "specs": [
          {
            "name": "规格",
            "values": [
              {
                "label": "250g",
                "price": 16.8,
                "stock": 288
              },
              {
                "label": "500g",
                "price": 31.58,
                "stock": 77
              },
              {
                "label": "1000g",
                "price": 44.52,
                "stock": 36
              }
            ]
          },
          {
            "name": "包装",
            "values": [
              {
                "label": "袋装",
                "price": 16.8,
                "stock": 288
              },
              {
                "label": "礼盒装",
                "price": 26.88,
                "stock": 90
              }
            ]
          }
        ],
        "limitPerUser": 1
      },
      {
        "goodsId": 1053,
        "name": "燕麦杂粮桃酥 粗粮代餐 500g",
        "mainPic": "https://picsum.photos/seed/sb1053-1/750/750",
        "price": 26.9,
        "originalPrice": 37.9,
        "seckillPrice": 13.45,
        "stock": 200,
        "sold": 96,
        "progress": 48,
        "remain": 104,
        "unit": "袋",
        "specs": [],
        "limitPerUser": 1
      }
    ]
  },
  {
    "id": 2,
    "label": "14:00",
    "startHour": 14,
    "endHour": 16,
    "durationHours": 2,
    "goods": [
      {
        "goodsId": 1003,
        "name": "鲜肉馅烧饼 现烤现发 6个装",
        "mainPic": "https://picsum.photos/seed/sb1003-1/750/750",
        "price": 26.8,
        "originalPrice": 36.8,
        "seckillPrice": 14.74,
        "stock": 600,
        "sold": 204,
        "progress": 34,
        "remain": 396,
        "unit": "盒",
        "specs": [
          {
            "name": "规格",
            "values": [
              {
                "label": "6个装",
                "price": 26.8,
                "stock": 142
              },
              {
                "label": "12个装",
                "price": 51.46,
                "stock": 37
              }
            ]
          },
          {
            "name": "口味",
            "values": [
              {
                "label": "原味"
              },
              {
                "label": "辣味"
              },
              {
                "label": "椒盐"
              }
            ]
          }
        ],
        "limitPerUser": 1
      },
      {
        "goodsId": 1011,
        "name": "冰皮绿豆糕 低糖少油 12枚",
        "mainPic": "https://picsum.photos/seed/sb1011-1/750/750",
        "price": 25.9,
        "originalPrice": 35.9,
        "seckillPrice": 12.95,
        "stock": 500,
        "sold": 210,
        "progress": 42,
        "remain": 290,
        "unit": "盒",
        "specs": [],
        "limitPerUser": 1
      },
      {
        "goodsId": 1017,
        "name": "黑豆核桃豆浆粉 早餐冲饮 20条",
        "mainPic": "https://picsum.photos/seed/sb1017-1/750/750",
        "price": 42.8,
        "originalPrice": 58.8,
        "seckillPrice": 25.68,
        "stock": 500,
        "sold": 180,
        "progress": 36,
        "remain": 320,
        "unit": "盒",
        "specs": [],
        "limitPerUser": 1
      },
      {
        "goodsId": 1025,
        "name": "每日混合果干 独立小包装 750g",
        "mainPic": "https://picsum.photos/seed/sb1025-1/750/750",
        "price": 56.8,
        "originalPrice": 79.8,
        "seckillPrice": 25.56,
        "stock": 400,
        "sold": 176,
        "progress": 44,
        "remain": 224,
        "unit": "盒",
        "specs": [
          {
            "name": "规格",
            "values": [
              {
                "label": "500g",
                "price": 56.8,
                "stock": 168
              },
              {
                "label": "1kg",
                "price": 105.08,
                "stock": 45
              },
              {
                "label": "2kg",
                "price": 147.68,
                "stock": 22
              }
            ]
          }
        ],
        "limitPerUser": 1
      },
      {
        "goodsId": 1032,
        "name": "重庆怪味胡豆 麻辣酥脆 400g",
        "mainPic": "https://picsum.photos/seed/sb1032-1/750/750",
        "price": 18.8,
        "originalPrice": 27.8,
        "seckillPrice": 9.4,
        "stock": 600,
        "sold": 270,
        "progress": 45,
        "remain": 330,
        "unit": "袋",
        "specs": [],
        "limitPerUser": 1
      },
      {
        "goodsId": 1041,
        "name": "手工鲜肉大包 老面发酵 12个",
        "mainPic": "https://picsum.photos/seed/sb1041-1/750/750",
        "price": 36.8,
        "originalPrice": 49.8,
        "seckillPrice": 20.24,
        "stock": 200,
        "sold": 120,
        "progress": 60,
        "remain": 80,
        "unit": "袋",
        "specs": [],
        "limitPerUser": 1
      },
      {
        "goodsId": 1058,
        "name": "桂花酸梅汤浓缩汁 兑水即饮 1L",
        "mainPic": "https://picsum.photos/seed/sb1058-1/750/750",
        "price": 32.8,
        "originalPrice": 45.8,
        "seckillPrice": 16.4,
        "stock": 400,
        "sold": 280,
        "progress": 70,
        "remain": 120,
        "unit": "瓶",
        "specs": [
          {
            "name": "规格",
            "values": [
              {
                "label": "4个装",
                "price": 32.8,
                "stock": 132
              },
              {
                "label": "8个装",
                "price": 62.32,
                "stock": 35
              },
              {
                "label": "12个装",
                "price": 88.56,
                "stock": 16
              }
            ]
          }
        ],
        "limitPerUser": 1
      }
    ]
  },
  {
    "id": 3,
    "label": "20:00",
    "startHour": 20,
    "endHour": 22,
    "durationHours": 2,
    "goods": [
      {
        "goodsId": 1004,
        "name": "黑椒牛肉烧饼 皮薄馅大 5个装",
        "mainPic": "https://picsum.photos/seed/sb1004-1/750/750",
        "price": 32.8,
        "originalPrice": 45.8,
        "seckillPrice": 16.4,
        "stock": 300,
        "sold": 123,
        "progress": 41,
        "remain": 177,
        "unit": "盒",
        "specs": [
          {
            "name": "口味",
            "values": [
              {
                "label": "原味"
              },
              {
                "label": "麻辣味"
              },
              {
                "label": "孜然味"
              }
            ]
          },
          {
            "name": "包装",
            "values": [
              {
                "label": "简装",
                "price": 32.8,
                "stock": 96
              },
              {
                "label": "礼盒装",
                "price": 49.2,
                "stock": 32
              }
            ]
          }
        ],
        "limitPerUser": 1
      },
      {
        "goodsId": 1010,
        "name": "核桃仁桃酥 手工现烤 500g",
        "mainPic": "https://picsum.photos/seed/sb1010-1/750/750",
        "price": 28.8,
        "originalPrice": 39.8,
        "seckillPrice": 15.84,
        "stock": 300,
        "sold": 105,
        "progress": 35,
        "remain": 195,
        "unit": "袋",
        "specs": [
          {
            "name": "规格",
            "values": [
              {
                "label": "4个装",
                "price": 28.8,
                "stock": 156
              },
              {
                "label": "8个装",
                "price": 54.72,
                "stock": 41
              },
              {
                "label": "12个装",
                "price": 77.76,
                "stock": 19
              }
            ]
          }
        ],
        "limitPerUser": 1
      },
      {
        "goodsId": 1015,
        "name": "紫薯麻薯蛋黄酥 双拼口味 8枚",
        "mainPic": "https://picsum.photos/seed/sb1015-1/750/750",
        "price": 45.9,
        "originalPrice": 62.9,
        "seckillPrice": 20.66,
        "stock": 600,
        "sold": 132,
        "progress": 22,
        "remain": 468,
        "unit": "盒",
        "specs": [
          {
            "name": "规格",
            "values": [
              {
                "label": "10个装",
                "price": 45.9,
                "stock": 118
              },
              {
                "label": "20个装",
                "price": 87.21,
                "stock": 31
              }
            ]
          },
          {
            "name": "口味",
            "values": [
              {
                "label": "红糖"
              },
              {
                "label": "枣泥"
              },
              {
                "label": "豆沙"
              }
            ]
          }
        ],
        "limitPerUser": 1
      },
      {
        "goodsId": 1023,
        "name": "天津大麻花 什锦味 500g",
        "mainPic": "https://picsum.photos/seed/sb1023-1/750/750",
        "price": 24.8,
        "originalPrice": 35.8,
        "seckillPrice": 14.88,
        "stock": 500,
        "sold": 150,
        "progress": 30,
        "remain": 350,
        "unit": "袋",
        "specs": [],
        "limitPerUser": 1
      },
      {
        "goodsId": 1030,
        "name": "中秋团圆礼盒 蛋黄酥+桃酥 20件",
        "mainPic": "https://picsum.photos/seed/sb1030-1/750/750",
        "price": 198,
        "originalPrice": 268,
        "seckillPrice": 99,
        "stock": 200,
        "sold": 62,
        "progress": 31,
        "remain": 138,
        "unit": "盒",
        "specs": [
          {
            "name": "规格",
            "values": [
              {
                "label": "20条",
                "price": 198,
                "stock": 45
              },
              {
                "label": "30条",
                "price": 287.1,
                "stock": 16
              }
            ]
          },
          {
            "name": "口味",
            "values": [
              {
                "label": "原味"
              },
              {
                "label": "红枣味"
              },
              {
                "label": "黑芝麻"
              }
            ]
          }
        ],
        "limitPerUser": 1
      },
      {
        "goodsId": 1039,
        "name": "元气单人早餐组合 烧饼+豆浆 5份",
        "mainPic": "https://picsum.photos/seed/sb1039-1/750/750",
        "price": 39.9,
        "originalPrice": 56.9,
        "seckillPrice": 15.96,
        "stock": 300,
        "sold": 138,
        "progress": 46,
        "remain": 162,
        "unit": "箱",
        "specs": [
          {
            "name": "规格",
            "values": [
              {
                "label": "10个装",
                "price": 39.9,
                "stock": 156
              },
              {
                "label": "20个装",
                "price": 75.81,
                "stock": 41
              }
            ]
          },
          {
            "name": "口味",
            "values": [
              {
                "label": "红糖"
              },
              {
                "label": "枣泥"
              },
              {
                "label": "豆沙"
              }
            ]
          }
        ],
        "limitPerUser": 1
      },
      {
        "goodsId": 1050,
        "name": "麻酱糖火烧 老北京早点 12个装",
        "mainPic": "https://picsum.photos/seed/sb1050-1/750/750",
        "price": 26.8,
        "originalPrice": 38.8,
        "seckillPrice": 14.74,
        "stock": 300,
        "sold": 225,
        "progress": 75,
        "remain": 75,
        "unit": "盒",
        "specs": [],
        "limitPerUser": 1
      },
      {
        "goodsId": 1064,
        "name": "春节年货礼盒 走亲访友 24件",
        "mainPic": "https://picsum.photos/seed/sb1064-1/750/750",
        "price": 188,
        "originalPrice": 258,
        "seckillPrice": 94,
        "stock": 400,
        "sold": 256,
        "progress": 64,
        "remain": 144,
        "unit": "盒",
        "specs": [
          {
            "name": "套餐",
            "values": [
              {
                "label": "单人份",
                "price": 188,
                "stock": 52
              },
              {
                "label": "双人份",
                "price": 338.4,
                "stock": 14
              },
              {
                "label": "家庭装",
                "price": 545.2,
                "stock": 8
              }
            ]
          }
        ],
        "limitPerUser": 1
      }
    ]
  }
]

export default seckillSessions
