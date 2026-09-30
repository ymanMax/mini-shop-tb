// 分类数据：8 个一级分类，每个含 2~4 个二级分类
export const categories = [
  {
    id: 1,
    name: '烧饼类',
    icon: '🥞',
    desc: '传统手工烧饼，现烤现发',
    children: [
      { id: 101, name: '芝麻烧饼', icon: '🫓', desc: '层层酥脆，芝麻飘香' },
      { id: 102, name: '千层烧饼', icon: '🥞', desc: '十八层起酥，外酥里嫩' },
      { id: 103, name: '肉馅烧饼', icon: '🥩', desc: '皮薄馅大，肉香四溢' },
      { id: 104, name: '甜味烧饼', icon: '🍯', desc: '红糖豆沙，香甜不腻' }
    ]
  },
  {
    id: 2,
    name: '糕点类',
    icon: '🍪',
    desc: '老式糕点，童年味道',
    children: [
      { id: 201, name: '传统月饼', icon: '🥮', desc: '五仁莲蓉，经典口味' },
      { id: 202, name: '酥皮点心', icon: '🍪', desc: '一口酥掉渣' },
      { id: 203, name: '蛋糕面包', icon: '🍰', desc: '新鲜短保，早餐首选' },
      { id: 204, name: '传统饽饽', icon: '🥮', desc: '京八件，送礼佳品' }
    ]
  },
  {
    id: 3,
    name: '饮品类',
    icon: '🥤',
    desc: '豆浆粥品，搭配一绝',
    children: [
      { id: 301, name: '豆浆豆奶', icon: '🥛', desc: '现磨浓浆，醇厚豆香' },
      { id: 302, name: '杂粮粥', icon: '🥣', desc: '五谷熬制，暖胃养生' },
      { id: 303, name: '饮品冲调', icon: '🍵', desc: '芝麻糊豆粉，即冲即饮' },
      { id: 304, name: '果汁茶饮', icon: '🧃', desc: '鲜榨果味，清爽解腻' }
    ]
  },
  {
    id: 4,
    name: '零食类',
    icon: '🥨',
    desc: '休闲小食，追剧必备',
    children: [
      { id: 401, name: '坚果炒货', icon: '🥜', desc: '现炒现卖，香脆可口' },
      { id: 402, name: '膨化零食', icon: '🍿', desc: '咔嚓咔嚓，停不下来' },
      { id: 403, name: '果干果脯', icon: '🍇', desc: '酸甜软糯，健康零食' },
      { id: 404, name: '肉干卤味', icon: '🍖', desc: '越嚼越香，解馋必备' }
    ]
  },
  {
    id: 5,
    name: '礼盒装',
    icon: '🎁',
    desc: '走亲访友，体面送礼',
    children: [
      { id: 501, name: '糕点礼盒', icon: '🎁', desc: '精装伴手礼' },
      { id: 502, name: '烧饼礼盒', icon: '📦', desc: '全家福组合装' },
      { id: 503, name: '坚果礼盒', icon: '🥜', desc: '年货大礼包' }
    ]
  },
  {
    id: 6,
    name: '地方特产',
    icon: '🗺️',
    desc: '全国各地，风味特产',
    children: [
      { id: 601, name: '北京特产', icon: '🏮', desc: '京味十足' },
      { id: 602, name: '天津风味', icon: '🌊', desc: '麻花炸糕' },
      { id: 603, name: '东北特色', icon: '❄️', desc: '农家味道' },
      { id: 604, name: '江南小吃', icon: '🏞️', desc: '精致点心' }
    ]
  },
  {
    id: 7,
    name: '新品上市',
    icon: '✨',
    desc: '新鲜尝鲜，限量发售',
    children: [
      { id: 701, name: '季节限定', icon: '🌸', desc: '当季新品' },
      { id: 702, name: '网红爆款', icon: '🔥', desc: '抖音同款' },
      { id: 703, name: '联名款', icon: '🤝', desc: '限定联名' }
    ]
  },
  {
    id: 8,
    name: '限时特惠',
    icon: '⏰',
    desc: '低价秒杀，手慢无',
    children: [
      { id: 801, name: '每日秒杀', icon: '⚡', desc: '整点开抢' },
      { id: 802, name: '拼团特惠', icon: '👥', desc: '三人成团' },
      { id: 803, name: '清仓特卖', icon: '🏷️', desc: '一件不留' }
    ]
  }
]
