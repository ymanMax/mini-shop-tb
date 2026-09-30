// 商品数据：44 条，覆盖所有一级/二级分类
// 图片统一使用 picsum.photos 固定 seed，保证刷新不变、各不相同

const pic = (seed, w = 600, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`

// 生成轮播多图
const makePics = (seed, n = 5) => {
  const arr = []
  for (let i = 1; i <= n; i++) arr.push(pic(`${seed}-${i}`, 750, 750))
  return arr
}

// 生成详情图（宽幅）
const makeDetail = (seed, n = 3) => {
  const arr = []
  for (let i = 1; i <= n; i++) arr.push(pic(`${seed}-d${i}`, 750, 1000))
  return arr
}

// 通用售后
const afterSale = (text) => ({
  supportReturn: true,
  returnDays: 7,
  supportExchange: true,
  guaranteeText: text || '坏果包赔·48小时售后·7天无理由退换'
})

// 通用参数
const baseParams = (extra) => [
  { key: '保质期', value: '30天（建议阴凉干燥处保存）' },
  { key: '储存方法', value: '常温避光，开封后请尽快食用' },
  { key: '生产工艺', value: '传统手工制作，现烤现发' },
  { key: '发货地', value: '河北省石家庄市' },
  ...(extra || [])
]

// 规格简写
const spec = (name, values) => ({ name, values })
const sv = (label, price, stock) => ({ label, price, stock })

const rawGoods = [
  // ===== 烧饼类 =====
  { id: 1001, name: '老式芝麻大烧饼 传统手工烤制 500g（5个装）', categoryId: 1, subCategoryId: 101, price: 12.9, originalPrice: 18.0, sales: 3268, stock: 200, unit: '份', tags: ['新鲜', '口感好', '性价比高'], description: '选用优质小麦粉与脱皮白芝麻，老面发酵，炭火烤制，外酥里软，层次分明，满口芝麻香。', specs: [spec('规格', [sv('5个装 500g', 12.9, 200), sv('10个装 1kg', 23.9, 150), sv('20个装 2kg（家庭装）', 45.9, 80)]), spec('口味', [sv('原味', 0), sv('椒盐味', 1.0), sv('甜味', 1.0)])] },
  { id: 1002, name: '千层油酥烧饼 十八层起酥 300g', categoryId: 1, subCategoryId: 102, price: 9.9, originalPrice: 15.0, sales: 2156, stock: 150, unit: '份', tags: ['口感好', '包装好'], description: '层层起酥，一碰掉渣，猪油与面粉反复折叠，烤至金黄酥脆，越嚼越香。', specs: [spec('规格', [sv('6个装 300g', 9.9, 150), sv('12个装 600g', 18.9, 100)])] },
  { id: 1003, name: '红烧牛肉馅烧饼 皮薄馅大 400g（4个）', categoryId: 1, subCategoryId: 103, price: 18.8, originalPrice: 26.0, sales: 1893, stock: 120, unit: '份', tags: ['新鲜', '分量足'], description: '精选黄牛后腿肉，手工调馅，皮薄如纸，咬一口汤汁四溢，肉香浓郁。', specs: [spec('规格', [sv('4个装 400g', 18.8, 120), sv('8个装 800g', 35.8, 90)]), spec('辣度', [sv('不辣', 0), sv('微辣', 0), sv('中辣', 0)])] },
  { id: 1004, name: '红糖芝麻酱烧饼 香甜流心 350g', categoryId: 1, subCategoryId: 104, price: 11.5, originalPrice: 16.0, sales: 1542, stock: 160, unit: '份', tags: ['口感好', '性价比高'], description: '古法熬制红糖馅，调入白芝麻酱，烤后流心不腻，甜而不齁，早餐甜品首选。' },
  { id: 1005, name: '梅干菜扣肉烧饼 黄山风味 400g', categoryId: 1, subCategoryId: 103, price: 16.8, originalPrice: 22.0, sales: 2087, stock: 130, unit: '份', tags: ['新鲜', '口感好'], description: '徽州梅干菜与五花扣肉相遇，咸香入味，酥皮包裹，一口吃到皖南味道。', specs: [spec('规格', [sv('4个装 400g', 16.8, 130), sv('8个装 800g', 32.8, 100)])] },
  { id: 1006, name: '葱油葱花烧饼 葱香四溢 300g（6个）', categoryId: 1, subCategoryId: 102, price: 8.9, originalPrice: 12.0, sales: 2764, stock: 180, unit: '份', tags: ['口感好', '物流快'], description: '新鲜小香葱切碎卷入油酥，葱香扑鼻，咸淡适中，复烤3分钟依旧酥脆。' },
  { id: 1007, name: '豆沙馅烧饼 手工红豆沙 400g（5个）', categoryId: 1, subCategoryId: 104, price: 10.9, originalPrice: 15.0, sales: 1320, stock: 140, unit: '份', tags: ['新鲜', '性价比高'], description: '红豆慢熬4小时去皮制沙，不加香精，香甜细腻，老人小孩都爱吃。' },
  { id: 1008, name: '宫廷烧饼组合装 6种口味混合 1.2kg', categoryId: 1, subCategoryId: 101, price: 39.9, originalPrice: 59.0, sales: 986, stock: 60, unit: '箱', tags: ['包装好', '送礼佳品'], description: '芝麻、椒盐、豆沙、红糖、葱油、梅干菜六种口味一次尝遍，独立包装，分享装。', specs: [spec('数量', [sv('1.2kg 混合装（约18个）', 39.9, 60), sv('2.4kg 双份装', 75.9, 40)])] },

  // ===== 糕点类 =====
  { id: 2001, name: '老式五仁月饼 传统京式 800g（8个）', categoryId: 2, subCategoryId: 201, price: 29.9, originalPrice: 45.0, sales: 1654, stock: 100, unit: '盒', tags: ['新鲜', '性价比高'], description: '核桃仁、杏仁、花生仁、芝麻仁、瓜子仁五味果脯，老师傅手工包制，皮薄馅足。', specs: [spec('规格', [sv('8个装 800g', 29.9, 100), sv('16个装 1.6kg', 55.9, 60)]), spec('口味', [sv('五仁', 0), sv('莲蓉', 2.0), sv('豆沙', 2.0), sv('蛋黄莲蓉', 5.0)])] },
  { id: 2002, name: '酥皮蛋黄酥 雪媚娘流心 6枚装', categoryId: 2, subCategoryId: 202, price: 25.9, originalPrice: 39.0, sales: 2310, stock: 90, unit: '盒', tags: ['口感好', '包装好'], description: '6层酥皮包裹整颗咸蛋黄，搭配雪媚娘麻薯，流心爆浆，下午茶绝配。', specs: [spec('口味', [sv('红豆蛋黄', 0), sv('紫薯蛋黄', 2.0), sv('榴莲流心', 4.0)])] },
  { id: 2003, name: '老式鸡蛋糕 无水蜂蜜蛋糕 500g', categoryId: 2, subCategoryId: 203, price: 13.9, originalPrice: 19.0, sales: 2876, stock: 150, unit: '份', tags: ['新鲜', '口感好'], description: '新鲜鸡蛋+蜂蜜打发，不加水，老式炉烘烤，松软香甜，儿童早餐首选。' },
  { id: 2004, name: '京八件礼盒 传统饽饽铺 1.5kg', categoryId: 2, subCategoryId: 204, price: 88.0, originalPrice: 128.0, sales: 642, stock: 50, unit: '盒', tags: ['包装好', '送礼佳品'], description: '福字饼、禄字饼、寿字饼、喜字饼等八道京式糕点，红木纹礼盒，体面大方。' },
  { id: 2005, name: '桃花酥 梅花酥 中式茶点 6枚', categoryId: 2, subCategoryId: 202, price: 22.9, originalPrice: 32.0, sales: 1120, stock: 80, unit: '盒', tags: ['颜值高', '口感好'], description: '手工开酥做花瓣造型，红豆沙内馅，好看更好吃，配一壶清茶便是半日闲。' },
  { id: 2006, name: '老面包 老式酸种面包 400g', categoryId: 2, subCategoryId: 203, price: 12.5, originalPrice: 18.0, sales: 1432, stock: 120, unit: '份', tags: ['新鲜', '性价比高'], description: '老面酸种发酵36小时，无添加改良剂，组织拉丝，麦香纯粹。' },
  { id: 2007, name: '绿豆糕 传统手工 桂花味 300g', categoryId: 2, subCategoryId: 202, price: 15.9, originalPrice: 22.0, sales: 1789, stock: 110, unit: '盒', tags: ['口感好', '包装好'], description: '脱皮绿豆细磨，调入江南桂花酱，入口即化，清凉不甜腻。', specs: [spec('口味', [sv('桂花原味', 0), sv('抹茶味', 2.0), sv('巧克力味', 2.0)])] },
  { id: 2008, name: '老婆饼 酥皮冬蓉馅 10枚装 500g', categoryId: 2, subCategoryId: 202, price: 19.9, originalPrice: 29.0, sales: 1567, stock: 130, unit: '盒', tags: ['口感好', '性价比高'], description: '冬蓉冬瓜馅甜润不腻，酥皮层层掉渣，广式传统味道，寓意美好。' },

  // ===== 饮品类 =====
  { id: 3001, name: '现磨纯黄豆浆粉 无添加蔗糖 500g', categoryId: 3, subCategoryId: 301, price: 16.8, originalPrice: 24.0, sales: 2543, stock: 200, unit: '袋', tags: ['新鲜', '性价比高'], description: '东北非转基因大豆，低温研磨，无添加蔗糖与香精，冲调即饮，浓郁豆香。', specs: [spec('规格', [sv('500g 袋装', 16.8, 200), sv('1kg 家庭装', 29.8, 150)])] },
  { id: 3002, name: '五谷杂粮粥料包 7日组合 840g', categoryId: 3, subCategoryId: 302, price: 23.9, originalPrice: 35.0, sales: 1876, stock: 120, unit: '盒', tags: ['新鲜', '包装好'], description: '每天一袋，小米、红豆、薏米、莲子等7种搭配，冷水下锅30分钟即成养胃粥。' },
  { id: 3003, name: '黑芝麻糊 现磨黑芝麻 600g', categoryId: 3, subCategoryId: 303, price: 19.9, originalPrice: 28.0, sales: 2034, stock: 160, unit: '罐', tags: ['口感好', '营养'], description: '黑芝麻+黑米+黑豆三黑配方，石磨现磨，香稠养发，早餐冲调方便。' },
  { id: 3004, name: '鲜榨玉米汁粉 无添加 300g', categoryId: 3, subCategoryId: 304, price: 14.9, originalPrice: 21.0, sales: 1321, stock: 140, unit: '袋', tags: ['新鲜', '性价比高'], description: '甜玉米低温锁鲜，冲调后如鲜榨般浓稠，宝宝爱喝，不含植脂末。' },
  { id: 3005, name: '豆乳奶茶粉 日式豆乳 300g', categoryId: 3, subCategoryId: 301, price: 21.9, originalPrice: 32.0, sales: 987, stock: 100, unit: '袋', tags: ['口感好', '网红'], description: '黄豆粉+红茶底+奶盖粉三合一，在家复刻日式豆乳奶茶，甜而不腻。' },
  { id: 3006, name: '红枣枸杞银耳羹 即食冲泡 90g', categoryId: 3, subCategoryId: 303, price: 26.9, originalPrice: 39.0, sales: 1456, stock: 110, unit: '盒', tags: ['营养', '包装好'], description: '冻干银耳羹，热水冲调60秒出胶，红枣枸杞搭配，办公室养颜必备。' },

  // ===== 零食类 =====
  { id: 4001, name: '现炒核桃 纸皮核桃仁 500g', categoryId: 4, subCategoryId: 401, price: 32.9, originalPrice: 48.0, sales: 1765, stock: 130, unit: '袋', tags: ['新鲜', '营养'], description: '云南纸皮核桃，手捏即开，当年新货现炒，仁白饱满，补脑零食。', specs: [spec('规格', [sv('500g 袋装', 32.9, 130), sv('1kg 家庭装', 59.9, 90)])] },
  { id: 4002, name: '蟹黄味瓜子仁 无壳 300g', categoryId: 4, subCategoryId: 401, price: 12.9, originalPrice: 19.0, sales: 3120, stock: 200, unit: '袋', tags: ['口感好', '停不下来'], description: '蟹香蛋黄裹覆葵花籽仁，酥香入味，无壳设计，追剧一把接一把。' },
  { id: 4003, name: '山药脆片 薄片薯片 番茄味 200g', categoryId: 4, subCategoryId: 402, price: 9.9, originalPrice: 15.0, sales: 2654, stock: 180, unit: '袋', tags: ['口感好', '性价比高'], description: '怀山药切片低温油炸，薄脆轻食，番茄/烧烤/原味三种口味。', specs: [spec('口味', [sv('番茄味', 0), sv('烧烤味', 0), sv('原味', 0), sv('黄瓜味', 0)])] },
  { id: 4004, name: '芒果干 菲律宾进口 500g', categoryId: 4, subCategoryId: 403, price: 24.9, originalPrice: 36.0, sales: 1987, stock: 150, unit: '袋', tags: ['新鲜', '口感好'], description: '菲律宾宿务芒果，厚切烘干，保留果肉纤维，酸甜有嚼劲，无色素。' },
  { id: 4005, name: '牛肉干 内蒙古手撕风干 250g', categoryId: 4, subCategoryId: 404, price: 45.9, originalPrice: 68.0, sales: 1543, stock: 90, unit: '袋', tags: ['新鲜', '分量足'], description: '黄牛后腿肉自然风干，手撕成条，咸香有嚼劲，高蛋白零食。', specs: [spec('口味', [sv('原味', 0), sv('香辣', 2.0), sv('孜然', 2.0)])] },
  { id: 4006, name: '山楂条 古法熬制 400g', categoryId: 4, subCategoryId: 403, price: 11.9, originalPrice: 17.0, sales: 2234, stock: 170, unit: '袋', tags: ['口感好', '儿童爱吃'], description: '新鲜山楂熬制成条，低糖配方，酸甜开胃，孩子的健康零食。' },
  { id: 4007, name: '爆米花 焦糖奶油味 150g', categoryId: 4, subCategoryId: 402, price: 8.9, originalPrice: 13.0, sales: 1876, stock: 190, unit: '袋', tags: ['口感好', '追剧必备'], description: '玉米粒美式爆裂，焦糖裹覆均匀，颗颗饱满，电影院在家看。' },
  { id: 4008, name: '鸭脖 卤味真空装 麻辣味 300g', categoryId: 4, subCategoryId: 404, price: 28.9, originalPrice: 42.0, sales: 1654, stock: 100, unit: '袋', tags: ['新鲜', '辣得过瘾'], description: '卤汤老汤慢卤2小时，麻辣入味，真空独立包装，开袋即食。', specs: [spec('辣度', [sv('微辣', 0), sv('中辣', 0), sv('爆辣', 2.0)])] },

  // ===== 礼盒装 =====
  { id: 5001, name: '烧饼全家福礼盒 8种口味 2kg', categoryId: 5, subCategoryId: 502, price: 68.0, originalPrice: 98.0, sales: 743, stock: 60, unit: '箱', tags: ['包装好', '送礼佳品'], description: '8种口味烧饼独立小包装，红金礼盒，中秋春节走亲访友体面之选。' },
  { id: 5002, name: '中式糕点礼盒 12味拼装 1.8kg', categoryId: 5, subCategoryId: 501, price: 118.0, originalPrice: 168.0, sales: 521, stock: 40, unit: '盒', tags: ['包装好', '送礼佳品'], description: '京八件+苏式月饼+酥皮点心12味拼装，手提礼盒，附赠贺卡。' },
  { id: 5003, name: '坚果大礼包 8袋组合 1.5kg', categoryId: 5, subCategoryId: 503, price: 88.0, originalPrice: 138.0, sales: 867, stock: 70, unit: '箱', tags: ['包装好', '年货必备'], description: '核桃、巴旦木、腰果、开心果等8袋精选坚果，年货礼盒装。' },
  { id: 5004, name: '茶点伴手礼 桃花酥+绿豆糕 600g', categoryId: 5, subCategoryId: 501, price: 78.0, originalPrice: 108.0, sales: 432, stock: 50, unit: '盒', tags: ['颜值高', '送礼佳品'], description: '桃花酥与绿豆糕双拼，青瓷色礼盒，配手提袋，春日伴手礼。' },

  // ===== 地方特产 =====
  { id: 6001, name: '北京驴打滚 老式糕点 400g', categoryId: 6, subCategoryId: 601, price: 18.8, originalPrice: 26.0, sales: 1432, stock: 110, unit: '盒', tags: ['口感好', '老北京味道'], description: '黄豆面滚裹糯米卷，红豆沙夹心，软糯香甜，老北京传统小吃。' },
  { id: 6002, name: '天津十八街麻花 什锦味 500g', categoryId: 6, subCategoryId: 602, price: 26.8, originalPrice: 38.0, sales: 1287, stock: 100, unit: '盒', tags: ['酥脆', '特产'], description: '什锦馅料夹馅麻花，酥脆不硬，天津老字号风味，独立包装。' },
  { id: 6003, name: '东北大列巴 全麦面包 500g', categoryId: 6, subCategoryId: 603, price: 19.9, originalPrice: 29.0, sales: 1567, stock: 120, unit: '个', tags: ['新鲜', '饱腹感强'], description: '哈尔滨风味大列巴，全麦+果仁，密实耐嚼，早餐切片配果酱。' },
  { id: 6004, name: '苏州梅花糕 豆沙馅 6枚', categoryId: 6, subCategoryId: 604, price: 23.9, originalPrice: 34.0, sales: 986, stock: 90, unit: '盒', tags: ['口感好', '江南风味'], description: '苏州观前街传统小吃，桂花豆沙馅，外脆内软，加热即食。' },
  { id: 6005, name: '济南油旋 葱香酥饼 6个装', categoryId: 6, subCategoryId: 601, price: 15.9, originalPrice: 22.0, sales: 1123, stock: 130, unit: '份', tags: ['口感好', '特产'], description: '济南名吃油旋，螺旋酥皮葱香浓郁，趁热吃酥香掉渣。' },
  { id: 6006, name: '杭州定胜糕 桂花米糕 8枚', categoryId: 6, subCategoryId: 604, price: 21.9, originalPrice: 31.0, sales: 876, stock: 100, unit: '盒', tags: ['寓意好', '江南风味'], description: '大米粉蒸制，桂花红糖馅，软糯清甜，传统考试祈福点心。' },

  // ===== 新品上市 =====
  { id: 7001, name: '樱花限定草莓酥 春季新品 6枚', categoryId: 7, subCategoryId: 701, price: 28.9, originalPrice: 39.0, sales: 1345, stock: 80, unit: '盒', tags: ['颜值高', '季节限定'], description: '春日限定，樱花粉酥皮包裹整颗草莓冻干，酸甜初恋味。' },
  { id: 7002, name: '芋泥麻薯软欧包 网红爆款 2个装', categoryId: 7, subCategoryId: 702, price: 24.9, originalPrice: 36.0, sales: 2109, stock: 90, unit: '份', tags: ['口感好', '网红'], description: '荔浦芋泥+麻薯+肉松三重内馅，软欧包体，抖音同款拉丝。' },
  { id: 7003, name: '烧饼×酸奶联名款 老面酸奶烧饼 4枚', categoryId: 7, subCategoryId: 703, price: 19.9, originalPrice: 29.0, sales: 765, stock: 70, unit: '份', tags: ['联名款', '新奇口味'], description: '老面发酵加入酸奶，柔软酸甜，联名限定包装，数量有限。' },
  { id: 7004, name: '冰皮月饼 流心奶黄 8枚装', categoryId: 7, subCategoryId: 701, price: 45.9, originalPrice: 68.0, sales: 1876, stock: 60, unit: '盒', tags: ['口感好', '季节限定'], description: '冷藏口感，流心奶黄爆浆，中秋限定，配冰袋发货。' },

  // ===== 限时特惠 =====
  { id: 8001, name: '【每日秒杀】芝麻烧饼 3斤装 1.5kg', categoryId: 8, subCategoryId: 801, price: 19.9, originalPrice: 39.9, sales: 3421, stock: 50, unit: '箱', tags: ['秒杀', '性价比高'], description: '每日10点整点开抢，3斤装家庭分享装，限量50份，售完即止。' },
  { id: 8002, name: '【拼团】千层烧饼 3人成团 1kg', categoryId: 8, subCategoryId: 802, price: 14.9, originalPrice: 29.9, sales: 2876, stock: 80, unit: '箱', tags: ['拼团', '超值'], description: '3人拼团专享价，1kg装约20个，拼团成功48小时内发货。' },
  { id: 8003, name: '【清仓】蛋黄酥 临期特惠 6枚', categoryId: 8, subCategoryId: 803, price: 12.9, originalPrice: 25.9, sales: 1654, stock: 30, unit: '盒', tags: ['清仓', '超值'], description: '保质期剩余15天，口感不变，半价清仓，介意慎拍。' },
  { id: 8004, name: '【秒杀】牛肉馅烧饼 2盒装 800g', categoryId: 8, subCategoryId: 801, price: 29.9, originalPrice: 49.9, sales: 1987, stock: 40, unit: '箱', tags: ['秒杀', '肉香'], description: '每天20点秒杀，2盒8个装牛肉烧饼，限量40份。' },

  // ===== 补充：覆盖热门搜索词 =====
  { id: 1009, name: '肉松烧饼 咸香肉松馅 400g（4个）', categoryId: 1, subCategoryId: 103, price: 16.8, originalPrice: 24.0, sales: 2456, stock: 120, unit: '份', tags: ['新鲜', '口感好', '肉松'], description: '酥脆烧饼裹满咸香肉松，肉丝分明，咸香不腻，早餐加餐皆宜。' },
  { id: 1010, name: '芝麻薄饼 香脆薄脆 500g', categoryId: 1, subCategoryId: 101, price: 13.9, originalPrice: 19.9, sales: 1876, stock: 150, unit: '袋', tags: ['酥脆', '芝麻香'], description: '薄如纸片，双面铺满芝麻，咬下咔嚓作响，越嚼越香，怀旧零食。' },
  { id: 2009, name: '手工桃酥 传统核桃酥 500g', categoryId: 2, subCategoryId: 202, price: 18.9, originalPrice: 28.0, sales: 2103, stock: 130, unit: '盒', tags: ['口感好', '手工'], description: '老式桃酥，核桃仁足量，入口即化，酥到掉渣，配茶绝配。' },
  { id: 4009, name: '红糖麻花 传统手工小麻花 300g', categoryId: 4, subCategoryId: 402, price: 12.9, originalPrice: 19.0, sales: 2654, stock: 180, unit: '袋', tags: ['红糖', '酥脆', '网红'], description: '红糖熬制裹面，小麻花酥脆不粘牙，甜甜不腻，一口一个停不下来。' },
  { id: 4010, name: '花生酥 老式花生糖 300g', categoryId: 4, subCategoryId: 401, price: 15.9, originalPrice: 23.0, sales: 1987, stock: 140, unit: '袋', tags: ['花生香', '酥脆'], description: '精选花生仁慢火熬糖，香甜酥脆，花生含量高，儿时味道。' },
  { id: 2010, name: '龙须酥 传统手工糖丝 200g', categoryId: 2, subCategoryId: 202, price: 19.9, originalPrice: 29.0, sales: 1543, stock: 100, unit: '盒', tags: ['手工', '龙须酥', '老式'], description: '细如龙须的糖丝裹满花生粉，入口即化，经典老式糕点，送礼自食皆宜。' }
]

// 组装完整商品对象
export const goods = rawGoods.map((g, i) => {
  const seed = `sb-${g.id}`
  const pics = makePics(seed, 5)
  return {
    id: g.id,
    name: g.name,
    pics,
    mainPic: pics[0],
    categoryId: g.categoryId,
    subCategoryId: g.subCategoryId,
    price: g.price,
    originalPrice: g.originalPrice,
    sales: g.sales,
    stock: g.stock,
    unit: g.unit,
    tags: g.tags || [],
    specs: g.specs || [],
    params: baseParams(g.paramsExtra),
    afterSale: afterSale(),
    description: g.description,
    detailImages: makeDetail(seed, 3),
    isCollect: false,
    // 排序辅助字段
    _heat: (g.sales || 0) + i * 137
  }
})

// 按 id 查商品
export const getGoodsById = (id) => goods.find((g) => g.id === Number(id))

// 按分类查商品
export const getGoodsByCategory = (categoryId, subCategoryId) => {
  return goods.filter((g) => {
    if (categoryId && g.categoryId !== Number(categoryId)) return false
    if (subCategoryId && g.subCategoryId !== Number(subCategoryId)) return false
    return true
  })
}
