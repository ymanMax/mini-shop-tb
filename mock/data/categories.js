// 分类 Mock 数据：一级分类 + 二级分类
// id 与商品数据中的 categoryId / subCategoryId 关联

const categories = [
  {
    id: 1,
    name: '烧饼类',
    icon: '🥞',
    desc: '传统手工烧饼，酥香可口',
    children: [
      { id: 101, name: '传统烧饼', icon: '🫓', desc: '老面发酵，炭火烧制' },
      { id: 102, name: '酥皮烧饼', icon: '🥐', desc: '层层起酥，一碰掉渣' },
      { id: 103, name: '夹馅烧饼', icon: '🥟', desc: '肉馅饱满，多汁入味' },
      { id: 104, name: '甜味烧饼', icon: '🍯', desc: '香甜软糯，桂花红糖' }
    ]
  },
  {
    id: 2,
    name: '糕点类',
    icon: '🍰',
    desc: '中式糕点，怀旧味道',
    children: [
      { id: 201, name: '中式糕点', icon: '🥮', desc: '京八件、绿豆糕' },
      { id: 202, name: '酥饼麻花', icon: '🥨', desc: '香酥麻花，甜咸适口' },
      { id: 203, name: '蛋糕点心', icon: '🧁', desc: '现烤蛋糕，松软香甜' },
      { id: 204, name: '节日糕点', icon: '🎑', desc: '月饼、年糕、粽子' }
    ]
  },
  {
    id: 3,
    name: '饮品类',
    icon: '🥤',
    desc: '现磨豆浆，佐餐佳品',
    children: [
      { id: 301, name: '豆浆豆奶', icon: '🥛', desc: '现磨浓浆，无添加' },
      { id: 302, name: '茶饮酸梅汤', icon: '🍵', desc: '古法熬制，解腻消暑' },
      { id: 303, name: '粥品米糊', icon: '🥣', desc: '暖胃早餐，熬制绵密' }
    ]
  },
  {
    id: 4,
    name: '零食类',
    icon: '🍿',
    desc: '休闲零食，追剧必备',
    children: [
      { id: 401, name: '坚果炒货', icon: '🥜', desc: '每日坚果，炒货飘香' },
      { id: 402, name: '肉脯卤味', icon: '🍖', desc: '靖江肉脯，卤味小食' },
      { id: 403, name: '果干蜜饯', icon: '🍒', desc: '芒果干、话梅、果脯' },
      { id: 404, name: '膨化食品', icon: '🍟', desc: '薯片、米饼、锅巴' }
    ]
  },
  {
    id: 5,
    name: '礼盒装',
    icon: '🎁',
    desc: '走亲访友，送礼佳品',
    children: [
      { id: 501, name: '节日礼盒', icon: '🏮', desc: '年货礼盒，节庆送礼' },
      { id: 502, name: '伴手礼', icon: '🎀', desc: '精致伴手，心意之选' },
      { id: 503, name: '企业团购', icon: '🏢', desc: '大批量定制，优惠价' }
    ]
  },
  {
    id: 6,
    name: '地方特产',
    icon: '🏮',
    desc: '全国各地风味特产',
    children: [
      { id: 601, name: '北京特产', icon: '🏯', desc: '京味小吃，地道北京' },
      { id: 602, name: '山东特产', icon: '⛰️', desc: '齐鲁风味，大饼卷葱' },
      { id: 603, name: '山西特产', icon: '🫕', desc: '老陈醋、太谷饼' },
      { id: 604, name: '陕西特产', icon: '🌙', desc: '羊肉泡馍、甑糕' }
    ]
  },
  {
    id: 7,
    name: '新品上市',
    icon: '✨',
    desc: '本月新品，抢先尝鲜',
    children: [
      { id: 701, name: '本月新品', icon: '🆕', desc: '新鲜出炉，限时尝鲜' },
      { id: 702, name: '季节限定', icon: '🍂', desc: '当季限定，过期不候' }
    ]
  },
  {
    id: 8,
    name: '限时特惠',
    icon: '🔥',
    desc: '秒杀满减，超值优惠',
    children: [
      { id: 801, name: '限时秒杀', icon: '⚡', desc: '整点秒杀，手慢无' },
      { id: 802, name: '满减专区', icon: '💰', desc: '满39减5，满99减15' }
    ]
  },
  {
    id: 9,
    name: '健康粗粮',
    icon: '🌾',
    desc: '粗粮制作，健康之选',
    children: [
      { id: 901, name: '全麦粗粮', icon: '🍞', desc: '全麦杂粮，低脂饱腹' },
      { id: 902, name: '无蔗糖', icon: '🚫', desc: '无蔗糖配方，适合长辈' }
    ]
  }
]

module.exports = categories
