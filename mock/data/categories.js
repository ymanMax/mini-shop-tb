/**
 * 分类数据：10 个一级分类，每个含 2~4 个二级分类
 * 由 Mock 数据体系统一维护，字段结构与 `三、核心数据模型定义` 保持一致
 */
export const categories = [
  {
    "id": 1,
    "name": "烧饼类",
    "icon": "🥯",
    "desc": "传统炭炉烤制，外酥里软",
    "children": [
      {
        "id": 101,
        "name": "芝麻烧饼",
        "icon": "🫓",
        "desc": "双层芝麻，一口掉渣",
        "categoryId": 1,
        "categoryName": "烧饼类"
      },
      {
        "id": 102,
        "name": "肉馅烧饼",
        "icon": "🥩",
        "desc": "现剁鲜肉，汁水丰盈",
        "categoryId": 1,
        "categoryName": "烧饼类"
      },
      {
        "id": 103,
        "name": "梅干菜烧饼",
        "icon": "🥬",
        "desc": "江南风味，咸香微甜",
        "categoryId": 1,
        "categoryName": "烧饼类"
      },
      {
        "id": 104,
        "name": "糖火烧",
        "icon": "🍯",
        "desc": "红糖麻酱，层层起酥",
        "categoryId": 1,
        "categoryName": "烧饼类"
      }
    ]
  },
  {
    "id": 2,
    "name": "糕点类",
    "icon": "🍰",
    "desc": "手工现做，甜而不腻",
    "children": [
      {
        "id": 201,
        "name": "桃酥",
        "icon": "🍪",
        "desc": "酥到掉渣的老味道",
        "categoryId": 2,
        "categoryName": "糕点类"
      },
      {
        "id": 202,
        "name": "绿豆糕",
        "icon": "🟩",
        "desc": "低糖少油，入口即化",
        "categoryId": 2,
        "categoryName": "糕点类"
      },
      {
        "id": 203,
        "name": "桂花糕",
        "icon": "🌼",
        "desc": "现蒸现发，桂花清香",
        "categoryId": 2,
        "categoryName": "糕点类"
      },
      {
        "id": 204,
        "name": "蛋黄酥",
        "icon": "🥮",
        "desc": "咸蛋黄流心，层层酥皮",
        "categoryId": 2,
        "categoryName": "糕点类"
      }
    ]
  },
  {
    "id": 3,
    "name": "饮品类",
    "icon": "🥤",
    "desc": "现磨豆浆与古法酸梅汤",
    "children": [
      {
        "id": 301,
        "name": "现磨豆浆",
        "icon": "🥛",
        "desc": "非转基因黄豆，无蔗糖",
        "categoryId": 3,
        "categoryName": "饮品类"
      },
      {
        "id": 302,
        "name": "酸梅汤",
        "icon": "🧋",
        "desc": "古法熬制，乌梅山楂",
        "categoryId": 3,
        "categoryName": "饮品类"
      },
      {
        "id": 303,
        "name": "米酿饮品",
        "icon": "🍶",
        "desc": "低度微醺，桂花香气",
        "categoryId": 3,
        "categoryName": "饮品类"
      }
    ]
  },
  {
    "id": 4,
    "name": "零食类",
    "icon": "🍿",
    "desc": "追剧必备的解馋小食",
    "children": [
      {
        "id": 401,
        "name": "锅巴",
        "icon": "🍘",
        "desc": "柴火慢烘，越嚼越香",
        "categoryId": 4,
        "categoryName": "零食类"
      },
      {
        "id": 402,
        "name": "麻花",
        "icon": "🥨",
        "desc": "手工搓制，酥脆不油腻",
        "categoryId": 4,
        "categoryName": "零食类"
      },
      {
        "id": 403,
        "name": "果干蜜饯",
        "icon": "🍑",
        "desc": "鲜果烘干，酸甜适口",
        "categoryId": 4,
        "categoryName": "零食类"
      }
    ]
  },
  {
    "id": 5,
    "name": "礼盒装",
    "icon": "🎁",
    "desc": "走亲访友的体面之选",
    "children": [
      {
        "id": 501,
        "name": "双拼礼盒",
        "icon": "📦",
        "desc": "烧饼糕点，一盒双味",
        "categoryId": 5,
        "categoryName": "礼盒装"
      },
      {
        "id": 502,
        "name": "八宝礼盒",
        "icon": "🎀",
        "desc": "八样传统点心齐聚",
        "categoryId": 5,
        "categoryName": "礼盒装"
      },
      {
        "id": 503,
        "name": "节庆礼盒",
        "icon": "🏮",
        "desc": "节日限定，送礼有面",
        "categoryId": 5,
        "categoryName": "礼盒装"
      }
    ]
  },
  {
    "id": 6,
    "name": "地方特产",
    "icon": "🏮",
    "desc": "一城一味，地道风味",
    "children": [
      {
        "id": 601,
        "name": "江南风味",
        "icon": "⛩️",
        "desc": "苏杭老手艺",
        "categoryId": 6,
        "categoryName": "地方特产"
      },
      {
        "id": 602,
        "name": "川渝风味",
        "icon": "🌶️",
        "desc": "麻辣鲜香够劲",
        "categoryId": 6,
        "categoryName": "地方特产"
      },
      {
        "id": 603,
        "name": "北方风味",
        "icon": "🏔️",
        "desc": "晋冀老字号",
        "categoryId": 6,
        "categoryName": "地方特产"
      }
    ]
  },
  {
    "id": 7,
    "name": "新品上市",
    "icon": "🆕",
    "desc": "本周上新，先尝为快",
    "children": [
      {
        "id": 701,
        "name": "当季新品",
        "icon": "🍂",
        "desc": "跟着节气吃",
        "categoryId": 7,
        "categoryName": "新品上市"
      },
      {
        "id": 702,
        "name": "联名新品",
        "icon": "🤝",
        "desc": "老字号跨界联名",
        "categoryId": 7,
        "categoryName": "新品上市"
      }
    ]
  },
  {
    "id": 8,
    "name": "限时特惠",
    "icon": "⏰",
    "desc": "折扣倒计时，售完即止",
    "children": [
      {
        "id": 801,
        "name": "今日秒杀",
        "icon": "⚡",
        "desc": "每天 10 点开抢",
        "categoryId": 8,
        "categoryName": "限时特惠"
      },
      {
        "id": 802,
        "name": "清仓特卖",
        "icon": "🏷️",
        "desc": "临期特价，低至 5 折",
        "categoryId": 8,
        "categoryName": "限时特惠"
      }
    ]
  },
  {
    "id": 9,
    "name": "早餐组合",
    "icon": "🌅",
    "desc": "一份搞定的元气早餐",
    "children": [
      {
        "id": 901,
        "name": "单人早餐",
        "icon": "🍽️",
        "desc": "一个人也要好好吃饭",
        "categoryId": 9,
        "categoryName": "早餐组合"
      },
      {
        "id": 902,
        "name": "家庭早餐",
        "icon": "👨👩👧",
        "desc": "一家人的早餐囤货",
        "categoryId": 9,
        "categoryName": "早餐组合"
      }
    ]
  },
  {
    "id": 10,
    "name": "手工面点",
    "icon": "🥟",
    "desc": "老面发酵，现包现蒸",
    "children": [
      {
        "id": 1001,
        "name": "手工包子",
        "icon": "🥠",
        "desc": "皮薄馅大，老面发酵",
        "categoryId": 10,
        "categoryName": "手工面点"
      },
      {
        "id": 1002,
        "name": "手工饺子",
        "icon": "🥟",
        "desc": "现包速冻，锁住鲜味",
        "categoryId": 10,
        "categoryName": "手工面点"
      },
      {
        "id": 1003,
        "name": "手工馒头",
        "icon": "🍞",
        "desc": "零添加，麦香十足",
        "categoryId": 10,
        "categoryName": "手工面点"
      }
    ]
  }
]

export default categories
