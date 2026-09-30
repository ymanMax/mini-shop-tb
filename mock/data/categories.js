// 分类数据：8~10 个一级分类，每个含 2~4 个二级分类
export const categories = [
  {
    id: 1,
    name: '烧饼类',
    icon: '🫓',
    desc: '现烤现卖 · 传统手工',
    children: [
      { id: 101, name: '传统原味烧饼', icon: '🫓', desc: '老面发酵 芝麻飘香' },
      { id: 102, name: '咸味烧饼', icon: '🧂', desc: '椒盐葱香 咸香可口' },
      { id: 103, name: '甜味烧饼', icon: '🍯', desc: '红糖白糖 甜而不腻' },
      { id: 104, name: '夹馅烧饼', icon: '🥟', desc: '肉馅素馅 实在料足' }
    ]
  },
  {
    id: 2,
    name: '糕点类',
    icon: '🍪',
    desc: '酥皮点心 · 老味新吃',
    children: [
      { id: 201, name: '传统糕点', icon: '🥮', desc: '京八件 老味道' },
      { id: 202, name: '酥皮点心', icon: '🥧', desc: '层层酥皮 入口即化' },
      { id: 203, name: '蛋糕面包', icon: '🍞', desc: '早餐搭档 松软香甜' }
    ]
  },
  {
    id: 3,
    name: '饮品类',
    icon: '🥤',
    desc: '现磨豆浆 · 暖胃粥品',
    children: [
      { id: 301, name: '豆浆豆乳', icon: '🥛', desc: '石磨现磨 香浓醇厚' },
      { id: 302, name: '茶饮', icon: '🍵', desc: '清茶解腻 冷热皆宜' },
      { id: 303, name: '粥品', icon: '🥣', desc: '熬煮稠糯 暖胃暖心' }
    ]
  },
  {
    id: 4,
    name: '零食类',
    icon: '🍿',
    desc: '闲嘴小食 · 越嚼越香',
    children: [
      { id: 401, name: '坚果炒货', icon: '🥜', desc: '每日坚果 香脆可口' },
      { id: 402, name: '肉干肉脯', icon: '🥩', desc: '古法腌制 越嚼越香' },
      { id: 403, name: '膨化零食', icon: '🍟', desc: '酥脆解馋 休闲必备' }
    ]
  },
  {
    id: 5,
    name: '礼盒装',
    icon: '🎁',
    desc: '走亲访友 · 体面好礼',
    children: [
      { id: 501, name: '节日礼盒', icon: '🧧', desc: '节庆送礼 大气上档次' },
      { id: 502, name: '点心礼盒', icon: '📦', desc: '多种组合 一次尝遍' }
    ]
  },
  {
    id: 6,
    name: '地方特产',
    icon: '🌾',
    desc: '地道风味 · 产地直供',
    children: [
      { id: 601, name: '华北特产', icon: '🏮', desc: '京津冀鲁 地道风味' },
      { id: 602, name: '华东特产', icon: '🏞️', desc: '江南点心 细腻清甜' }
    ]
  },
  {
    id: 7,
    name: '新品上市',
    icon: '✨',
    desc: '季节限定 · 抢先尝鲜',
    children: [
      { id: 701, name: '春季限定', icon: '🌱', desc: '春日新货 鲜货抢先' },
      { id: 702, name: '季节尝鲜', icon: '🍃', desc: '时令食材 限时供应' }
    ]
  },
  {
    id: 8,
    name: '限时特惠',
    icon: '🔥',
    desc: '亏本冲量 · 手慢无',
    children: [
      { id: 801, name: '今日特价', icon: '💰', desc: '每天一款 低价回馈' },
      { id: 802, name: '拼团优惠', icon: '👥', desc: '三人拼团 半价畅享' }
    ]
  }
]
