// 评价 Mock 数据：30+ 条，涵盖不同评分、标签、晒图
// 评分分布：5星约20条 / 4星约6条 / 3星约3条 / 2星约2条 / 1星约1条
const goodsList = require('./goods.js')

// 简单确定性伪随机，保证每次加载数据稳定
function lcg(seed) {
  let s = seed
  return function () {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}
const rand = lcg(20260928)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]

const userNames = [
  '爱吃烧饼的猫', '北方的狼', '甜甜圈本圈', '美食探险家', '老饕一枚',
  '烧饼老师傅', '下午茶达人', '减脂中的胖子', '宝妈小李', '独居青年',
  '舌尖上的中国粉丝', '酥脆控', '甜食爱好者', '咸口党', '外卖测评师',
  '办公室零食王', '健身餐搭配师', '返乡青年', '胡同里的北京妞', '江南小吃货',
  '爱吃面的西北人', '两广好胃口', '带娃的张姐', '退休老王', '学生党小周',
  '深夜放毒选手', '早餐固定户', '囤货达人', '挑剔的食客', '回头客第N次'
]

const contents = {
  5: [
    '太好吃了！外皮酥得掉渣，馅料很足，加热之后跟刚出炉的一样，已经回购第三次了。',
    '包装很用心，冰袋+气泡柱，收到的时候一点没碎。味道正宗，家里老人特别喜欢。',
    '性价比很高，分量足，一个人吃两个就饱了。物流也快，第二天就到了，好评！',
    '配料表很干净，没有乱七八糟的添加剂，给孩子吃也放心。口感松软香甜，会继续买。',
    '第一次在网上买这类点心，比预期好太多。酥皮层次分明，内馅饱满，强烈推荐。',
    '回购无数次了，全家都爱吃。这次搞活动又囤了一箱，够吃一个月。',
    '口感非常正宗，跟当地老店买的一个味道。包装精致，送人也有面子。',
    '发货很快，快递小哥态度也好。商品本身没话说，酥、香、甜都恰到好处。',
    '早上用平底锅加热两分钟，配一杯豆浆，完美的早餐！孩子抢着吃。',
    '研究了很久才下单，没有失望。用料扎实，能吃到真实的食材味道，不是那种香精味。'
  ],
  4: [
    '整体不错，味道正宗，就是物流比预期慢了一天，不过商品没问题，给个四星。',
    '好吃，包装也严实。美中不足是个别几个压碎了，不影响食用，希望改进包装。',
    '味道可以，分量足。个人觉得稍微甜了一点点，配茶吃刚好。',
    '回购款了，品质稳定。这次的比上次略干一点，但总体还是满意的。',
    '不错的商品，对得起这个价格。送的小料包很贴心，会推荐给朋友。',
    '整体满意，口感酥脆，就是快递盒有点软，建议加固。'
  ],
  3: [
    '味道中规中矩，没有特别惊艳，可能期待太高了。分量还行。',
    '个人觉得偏油了一点，吃两个就腻了。口味因人而异，供参考。',
    '物流等了三天，味道一般般，不会特别回购。'
  ],
  2: [
    '收到的时候碎了一半，联系客服处理了，但体验不太好。味道还行吧。',
    '感觉没有描述的那么好，偏甜，价格也不算便宜，不太会回购。'
  ],
  1: [
    '收到时已经过期两天了，包装上的日期很模糊，体验很差，已申请售后。'
  ]
}

const tagPool = ['新鲜', '口感好', '包装好', '物流快', '性价比高', '分量足', '酥脆', '香甜']

// 选择被评价的商品（覆盖大部分商品）
const reviewedGoods = [1001, 1002, 1003, 1004, 1005, 1006, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 3001, 3002, 3004, 4001, 4002, 4003, 4004, 4005, 4006, 4007, 5001, 6001, 6002, 6003, 6004, 7001, 8001, 9002]

const specTextPool = ['标准装', '家庭装', '原味', '微辣', '不辣', '甜口', '咸口', '礼盒装']

function buildReviews() {
  const list = []
  const ratingPlan = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 4, 4, 4, 4, 4, 4, 3, 3, 3, 2, 2, 1]
  let idSeq = 1
  ratingPlan.forEach((rating, idx) => {
    const goodsId = reviewedGoods[idx % reviewedGoods.length]
    const g = goodsList.find(x => x.id === goodsId)
    const hasImages = [0, 5, 11, 16, 21, 25, 28, 30, 31, 8].includes(idx)
    const images = hasImages ? [0, 1, 2].slice(0, 1 + Math.floor(rand() * 3)).map(i => `https://picsum.photos/seed/rev-${idSeq}-${i}/400/400`) : []
    const tagCount = 1 + Math.floor(rand() * 3)
    const tags = []
    while (tags.length < tagCount) {
      const t = pick(tagPool)
      if (!tags.includes(t)) tags.push(t)
    }
    list.push({
      id: 'r' + idSeq,
      orderId: 'o' + (100 + idSeq),
      goodsId,
      userId: 'u' + (1000 + idx),
      userName: userNames[idx % userNames.length],
      userAvatar: `https://picsum.photos/seed/avatar-${idx}/100/100`,
      rating,
      content: pick(contents[rating]),
      images,
      tags,
      createTime: Date.now() - Math.floor(rand() * 30 + 1) * 24 * 3600 * 1000 - Math.floor(rand() * 3600) * 1000,
      specText: g && g.specs.length ? pick(g.specs[0].values).label : pick(specTextPool)
    })
    idSeq++
  })
  return list
}

const reviews = buildReviews()

module.exports = reviews
