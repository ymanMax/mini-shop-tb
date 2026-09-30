// 商品数据：40+ 条，覆盖所有分类
const pic = (seed, w = 600, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`

// 商品工厂：统一补充 specs/params/afterSale/detailImages
function goods(g) {
  const seed = g.seed
  return {
    id: g.id,
    name: g.name,
    pics: g.pics || [1, 2, 3, 4, 5].map(i => pic(`${seed}-p${i}`, 600, 600)),
    mainPic: pic(seed, 600, 600),
    categoryId: g.categoryId,
    categoryName: g.categoryName,
    subCategoryId: g.subCategoryId,
    subCategoryName: g.subCategoryName,
    price: g.price,
    originalPrice: g.originalPrice,
    sales: g.sales,
    stock: g.stock,
    unit: g.unit,
    specs: g.specs || [],
    params: g.params || [
      { key: '保质期', value: '30天' },
      { key: '储存方法', value: '常温避光保存' },
      { key: '产地', value: '河北省石家庄市' },
      { key: '生产日期', value: '见包装喷码' }
    ],
    afterSale: {
      supportReturn: true,
      returnDays: 7,
      supportExchange: true,
      guaranteeText: '坏果包赔·48小时售后'
    },
    description: g.description,
    detailImages: g.detailImages || [
      pic(`${seed}-d1`, 750, 500),
      pic(`${seed}-d2`, 750, 500),
      pic(`${seed}-d3`, 750, 500)
    ],
    tags: g.tags || ['现烤现卖', '手工制作'],
    isCollect: false
  }
}

export const goodsList = [
  // ============ 烧饼类 ============
  goods({
    id: 101, seed: 'shaobing-yuanwei', categoryId: 1, categoryName: '烧饼类', subCategoryId: 101, subCategoryName: '传统原味烧饼',
    name: '老式五仁大烧饼 传统手工制作 500g 真空包装', price: 12.9, originalPrice: 18.8, sales: 3260, stock: 200, unit: '斤',
    specs: [
      { name: '规格', values: [{ label: '1斤装', price: 12.9, stock: 200 }, { label: '3斤装', price: 34.9, stock: 150 }, { label: '5斤装', price: 54.9, stock: 80 }] },
      { name: '口味', values: [{ label: '原味' }, { label: '甜味' }, { label: '咸味' }] }
    ],
    description: '选用优质小麦粉与芝麻，老面发酵，炭火炉烤制，外酥里嫩，五仁馅料足，一口回到小时候的味道。',
    tags: ['现烤现卖', '手工制作', '五仁馅料']
  }),
  goods({
    id: 102, seed: 'shaobing-jiaoyan', categoryId: 1, categoryName: '烧饼类', subCategoryId: 102, subCategoryName: '咸味烧饼',
    name: '椒盐葱香烧饼 咸香酥脆 8个装 早餐必备', price: 9.9, originalPrice: 13.9, sales: 2870, stock: 300, unit: '份',
    specs: [
      { name: '规格', values: [{ label: '8个装', price: 9.9, stock: 300 }, { label: '16个装', price: 18.9, stock: 200 }] },
      { name: '口味', values: [{ label: '椒盐' }, { label: '葱香' }, { label: '麻盐' }] }
    ],
    description: '椒盐与葱花的完美搭配，烤出来层层酥脆，咸香适口，加热后依然酥脆，是早餐的好选择。',
    tags: ['咸香适口', '早餐优选']
  }),
  goods({
    id: 103, seed: 'shaobing-hongtang', categoryId: 1, categoryName: '烧饼类', subCategoryId: 103, subCategoryName: '甜味烧饼',
    name: '红糖流心烧饼 甜而不腻 6个装 现烤发出', price: 11.9, originalPrice: 15.9, sales: 1980, stock: 120, unit: '份',
    specs: [
      { name: '规格', values: [{ label: '6个装', price: 11.9, stock: 120 }, { label: '12个装', price: 21.9, stock: 90 }] }
    ],
    description: '古法熬制红糖做馅，烤后流心不腻，外皮酥软，甜度适中，老人小孩都爱吃。',
    tags: ['红糖流心', '甜而不腻']
  }),
  goods({
    id: 104, seed: 'shaobing-baicai', categoryId: 1, categoryName: '烧饼类', subCategoryId: 104, subCategoryName: '夹馅烧饼',
    name: '白菜猪肉夹馅烧饼 皮薄馅大 4个装', price: 13.9, originalPrice: 17.9, sales: 1560, stock: 100, unit: '份',
    specs: [
      { name: '规格', values: [{ label: '4个装', price: 13.9, stock: 100 }, { label: '8个装', price: 25.9, stock: 70 }] },
      { name: '馅料', values: [{ label: '白菜猪肉' }, { label: '韭菜鸡蛋' }, { label: '素三鲜' }] }
    ],
    description: '皮薄馅大，猪肉鲜嫩，白菜爽口，一口咬下去满满的馅料，加热即食。',
    tags: ['皮薄馅大', '加热即食']
  }),
  goods({
    id: 105, seed: 'shaobing-niujiaomo', categoryId: 1, categoryName: '烧饼类', subCategoryId: 104, subCategoryName: '夹馅烧饼',
    name: '牛肉夹馍烧饼 酱卤牛肉 2个装 西北风味', price: 16.9, originalPrice: 22.9, sales: 1320, stock: 60, unit: '份',
    description: '酱卤牛肉剁碎夹入现烤烧饼，配上青椒碎，西北风味，肉香四溢。',
    tags: ['西北风味', '酱卤牛肉']
  }),
  goods({
    id: 106, seed: 'shaobing-zhima', categoryId: 1, categoryName: '烧饼类', subCategoryId: 101, subCategoryName: '传统原味烧饼',
    name: '芝麻酥烧饼 满口芝麻 10个装 独立包装', price: 10.9, originalPrice: 14.9, sales: 2100, stock: 260, unit: '份',
    specs: [
      { name: '规格', values: [{ label: '10个装', price: 10.9, stock: 260 }, { label: '20个装', price: 19.9, stock: 180 }] }
    ],
    description: '两面沾满芝麻，烤后芝麻香浓，酥到掉渣，独立包装方便携带。',
    tags: ['满口芝麻', '独立包装']
  }),
  goods({
    id: 107, seed: 'shaobing-sucai', categoryId: 1, categoryName: '烧饼类', subCategoryId: 104, subCategoryName: '夹馅烧饼',
    name: '梅干菜扣肉烧饼 徽州风味 6个装', price: 14.9, originalPrice: 19.9, sales: 1750, stock: 90, unit: '份',
    description: '徽州梅干菜配扣肉，咸香入味，烤后酥香，江南风味一绝。',
    tags: ['徽州风味', '梅干菜']
  }),
  goods({
    id: 108, seed: 'shaobing-xiaochang', categoryId: 1, categoryName: '烧饼类', subCategoryId: 102, subCategoryName: '咸味烧饼',
    name: '小昌烧饼 迷你一口酥 20个装 儿童零食', price: 8.9, originalPrice: 12.9, sales: 2430, stock: 320, unit: '份',
    description: '迷你小烧饼，一口一个，酥脆咸香，孩子零食的好选择。',
    tags: ['一口一个', '儿童零食']
  }),

  // ============ 糕点类 ============
  goods({
    id: 201, seed: 'gaodian-bajian', categoryId: 2, categoryName: '糕点类', subCategoryId: 201, subCategoryName: '传统糕点',
    name: '京八件传统糕点礼盒 8种口味 1000g', price: 45.9, originalPrice: 68.0, sales: 860, stock: 60, unit: '盒',
    specs: [
      { name: '规格', values: [{ label: '1000g简装', price: 45.9, stock: 60 }, { label: '1500g礼盒', price: 65.9, stock: 40 }] }
    ],
    description: '京八件是北京传统糕点代表，八种口味八种造型，酥皮馅料，送礼自食皆宜。',
    tags: ['京八件', '传统糕点']
  }),
  goods({
    id: 202, seed: 'gaodian-supi', categoryId: 2, categoryName: '糕点类', subCategoryId: 202, subCategoryName: '酥皮点心',
    name: '酥皮莲蓉点心 层层酥皮 12个装', price: 18.9, originalPrice: 25.9, sales: 1120, stock: 150, unit: '盒',
    specs: [
      { name: '口味', values: [{ label: '莲蓉' }, { label: '豆沙' }, { label: '枣泥' }] }
    ],
    description: '层层酥皮，莲蓉馅细腻，入口即化，老北京酥皮点心的手艺。',
    tags: ['层层酥皮', '入口即化']
  }),
  goods({
    id: 203, seed: 'gaodian-dangao', categoryId: 2, categoryName: '糕点类', subCategoryId: 203, subCategoryName: '蛋糕面包',
    name: '老蛋糕 鸡蛋糕 传统槽子糕 500g', price: 15.9, originalPrice: 21.9, sales: 1680, stock: 180, unit: '斤',
    specs: [
      { name: '规格', values: [{ label: '500g', price: 15.9, stock: 180 }, { label: '1000g', price: 29.9, stock: 120 }] }
    ],
    description: '传统槽子糕做法，鸡蛋含量高，松软香甜，儿时的味道。',
    tags: ['传统槽子糕', '松软香甜']
  }),
  goods({
    id: 204, seed: 'gaodian-huoshao', categoryId: 2, categoryName: '糕点类', subCategoryId: 202, subCategoryName: '酥皮点心',
    name: '山西太谷饼 酥软香甜 800g 特产', price: 19.9, originalPrice: 26.9, sales: 940, stock: 100, unit: '箱',
    description: '山西太谷饼，酥软香甜，久放不硬，地方特产名点。',
    tags: ['山西特产', '酥软香甜']
  }),
  goods({
    id: 205, seed: 'gaodian-mooncake', categoryId: 2, categoryName: '糕点类', subCategoryId: 201, subCategoryName: '传统糕点',
    name: '五仁月饼 老式手工月饼 5个装 中秋特惠', price: 22.9, originalPrice: 32.9, sales: 760, stock: 80, unit: '份',
    specs: [
      { name: '口味', values: [{ label: '五仁' }, { label: '豆沙' }, { label: '枣泥' }] }
    ],
    description: '老式五仁月饼，青红丝、瓜子仁、核桃仁，传统配方，中秋怀旧必备。',
    tags: ['老式月饼', '五仁']
  }),
  goods({
    id: 206, seed: 'gaodian-miantuo', categoryId: 2, categoryName: '糕点类', subCategoryId: 203, subCategoryName: '蛋糕面包',
    name: '手撕面包 奶香原味 1000g 整箱早餐', price: 24.9, originalPrice: 32.9, sales: 2050, stock: 200, unit: '箱',
    description: '层层手撕，奶香浓郁，松软可口，整箱装早餐囤货必备。',
    tags: ['手撕面包', '整箱早餐']
  }),
  goods({
    id: 207, seed: 'gaodian-sayao', categoryId: 2, categoryName: '糕点类', subCategoryId: 202, subCategoryName: '酥皮点心',
    name: '陕西锅盔馍 椒叶香酥 500g 特产', price: 16.9, originalPrice: 22.9, sales: 880, stock: 110, unit: '个',
    description: '陕西锅盔，椒叶调味，外脆内软，耐储存，越嚼越香。',
    tags: ['陕西特产', '椒叶香酥']
  }),

  // ============ 饮品类 ============
  goods({
    id: 301, seed: 'drink-doujiang', categoryId: 3, categoryName: '饮品类', subCategoryId: 301, subCategoryName: '豆浆豆乳',
    name: '石磨现磨豆浆粉 原味无添加 300g', price: 12.9, originalPrice: 16.9, sales: 1540, stock: 220, unit: '袋',
    specs: [
      { name: '规格', values: [{ label: '300g', price: 12.9, stock: 220 }, { label: '600g', price: 23.9, stock: 160 }] },
      { name: '口味', values: [{ label: '原味' }, { label: '甜味' }, { label: '黑豆' }] }
    ],
    description: '石磨工艺慢磨，保留大豆原香，无添加蔗糖，冲调即饮。',
    tags: ['石磨现磨', '无添加']
  }),
  goods({
    id: 302, seed: 'drink-douru', categoryId: 3, categoryName: '饮品类', subCategoryId: 301, subCategoryName: '豆浆豆乳',
    name: '无糖纯豆乳 250ml*12盒 整箱', price: 29.9, originalPrice: 39.9, sales: 1320, stock: 150, unit: '箱',
    description: '纯豆乳无添加，蛋白质含量高，早餐配面包刚刚好。',
    tags: ['无糖纯豆乳', '整箱']
  }),
  goods({
    id: 303, seed: 'drink-chaye', categoryId: 3, categoryName: '饮品类', subCategoryId: 302, subCategoryName: '茶饮',
    name: '茉莉花茶 清香型 250g 罐装', price: 35.9, originalPrice: 49.9, sales: 680, stock: 90, unit: '罐',
    specs: [
      { name: '规格', values: [{ label: '250g罐装', price: 35.9, stock: 90 }, { label: '500g袋装', price: 65.9, stock: 60 }] }
    ],
    description: '茉莉清茶，窨制工艺，清香扑鼻，解腻佳品。',
    tags: ['茉莉花茶', '清香型']
  }),
  goods({
    id: 304, seed: 'drink-zhou', categoryId: 3, categoryName: '饮品类', subCategoryId: 303, subCategoryName: '粥品',
    name: '八宝粥料包 五谷杂粮 800g 熬粥食材', price: 18.9, originalPrice: 24.9, sales: 920, stock: 130, unit: '袋',
    description: '八种杂粮科学配比，熬粥稠糯，营养早餐一碗搞定。',
    tags: ['五谷杂粮', '科学配比']
  }),
  goods({
    id: 305, seed: 'drink-suanmei', categoryId: 3, categoryName: '饮品类', subCategoryId: 302, subCategoryName: '茶饮',
    name: '酸梅汤原料包 古法熬制 100g*5包', price: 15.9, originalPrice: 21.9, sales: 1150, stock: 140, unit: '盒',
    description: '乌梅、山楂、甘草古法配比，熬出正宗老北京酸梅汤。',
    tags: ['古法熬制', '老北京']
  }),

  // ============ 零食类 ============
  goods({
    id: 401, seed: 'snack-jianguo', categoryId: 4, categoryName: '零食类', subCategoryId: 401, subCategoryName: '坚果炒货',
    name: '每日坚果 混合果仁 750g 30包 礼盒装', price: 59.9, originalPrice: 89.9, sales: 1420, stock: 100, unit: '盒',
    specs: [
      { name: '规格', values: [{ label: '30包/750g', price: 59.9, stock: 100 }, { label: '15包/375g', price: 32.9, stock: 130 }] }
    ],
    description: '巴旦木、核桃、腰果、蔓越莓等七种坚果果干，每日一包营养均衡。',
    tags: ['每日坚果', '30包']
  }),
  goods({
    id: 402, seed: 'snack-huangguazi', categoryId: 4, categoryName: '零食类', subCategoryId: 401, subCategoryName: '坚果炒货',
    name: '焦糖瓜子 大颗粒 500g 炒货零食', price: 13.9, originalPrice: 18.9, sales: 2360, stock: 260, unit: '袋',
    specs: [
      { name: '口味', values: [{ label: '焦糖' }, { label: '山核桃' }, { label: '原味' }] }
    ],
    description: '大颗粒葵花籽，焦糖慢炒，香甜酥脆，追剧必备。',
    tags: ['大颗粒', '焦糖']
  }),
  goods({
    id: 403, seed: 'snack-rougan', categoryId: 4, categoryName: '零食类', subCategoryId: 402, subCategoryName: '肉干肉脯',
    name: '靖江猪肉脯 蜜汁味 200g 手撕肉干', price: 22.9, originalPrice: 32.9, sales: 1780, stock: 150, unit: '袋',
    specs: [
      { name: '口味', values: [{ label: '蜜汁' }, { label: '香辣' }, { label: '孜然' }] }
    ],
    description: '靖江猪肉脯，蜜汁调味，手撕成片，越嚼越香。',
    tags: ['靖江特产', '蜜汁']
  }),
  goods({
    id: 404, seed: 'snack-niurou', categoryId: 4, categoryName: '零食类', subCategoryId: 402, subCategoryName: '肉干肉脯',
    name: '风干牛肉干 内蒙古手撕 500g 原味', price: 89.9, originalPrice: 129.0, sales: 860, stock: 70, unit: '袋',
    specs: [
      { name: '口味', values: [{ label: '原味' }, { label: '香辣' }, { label: '孜然' }] }
    ],
    description: '内蒙古风干牛肉干，手撕长条，嚼劲十足，真材实料。',
    tags: ['内蒙古', '风干牛肉']
  }),
  goods({
    id: 405, seed: 'snack-pengua', categoryId: 4, categoryName: '零食类', subCategoryId: 403, subCategoryName: '膨化零食',
    name: '山药脆片 薄片薯片 3包装 休闲零食', price: 9.9, originalPrice: 14.9, sales: 1980, stock: 300, unit: '组',
    specs: [
      { name: '口味', values: [{ label: '番茄' }, { label: '麻辣' }, { label: '烧烤' }] }
    ],
    description: '山药切片脆炸，薄脆可口，三种口味组合装。',
    tags: ['山药脆片', '薄脆']
  }),
  goods({
    id: 406, seed: 'snack-huasheng', categoryId: 4, categoryName: '零食类', subCategoryId: 401, subCategoryName: '坚果炒货',
    name: '蒜香花生 带壳炒制 500g 下酒菜', price: 11.9, originalPrice: 16.9, sales: 2140, stock: 240, unit: '袋',
    description: '带壳花生蒜香慢炒，咸香酥脆，下酒零食两相宜。',
    tags: ['蒜香', '下酒菜']
  }),

  // ============ 礼盒装 ============
  goods({
    id: 501, seed: 'gift-heboxiaobing', categoryId: 5, categoryName: '礼盒装', subCategoryId: 501, subCategoryName: '节日礼盒',
    name: '烧饼糕点组合礼盒 8种口味 1500g 送礼', price: 88.0, originalPrice: 128.0, sales: 420, stock: 50, unit: '盒',
    description: '烧饼、糕点、坚果组合大礼盒，八种口味，走亲访友体面之选。',
    tags: ['组合礼盒', '送礼佳品']
  }),
  goods({
    id: 502, seed: 'gift-niujiaoguo', categoryId: 5, categoryName: '礼盒装', subCategoryId: 502, subCategoryName: '点心礼盒',
    name: '牛脚裹点心礼盒 传统酥点 1200g', price: 68.0, originalPrice: 98.0, sales: 380, stock: 45, unit: '盒',
    description: '传统牛脚裹酥点，三种造型六种口味，老味新食。',
    tags: ['传统酥点', '六种口味']
  }),
  goods({
    id: 503, seed: 'gift-jianhe', categoryId: 5, categoryName: '礼盒装', subCategoryId: 501, subCategoryName: '节日礼盒',
    name: '坚果炒货大礼盒 12袋 2000g 年货', price: 128.0, originalPrice: 188.0, sales: 350, stock: 40, unit: '盒',
    description: '12袋坚果炒货组合，2000克大份量，年货礼盒一步到位。',
    tags: ['年货礼盒', '12袋装']
  }),
  goods({
    id: 504, seed: 'gift-midangao', categoryId: 5, categoryName: '礼盒装', subCategoryId: 502, subCategoryName: '点心礼盒',
    name: '蜜三刀蜜麻花礼盒 老式甜食 1000g', price: 39.9, originalPrice: 59.9, sales: 520, stock: 60, unit: '盒',
    description: '蜜三刀、蜜麻花、江米条组合，老式甜食，怀旧味道。',
    tags: ['老式甜食', '怀旧']
  }),

  // ============ 地方特产 ============
  goods({
    id: 601, seed: 'techan-jingjin', categoryId: 6, categoryName: '地方特产', subCategoryId: 601, subCategoryName: '华北特产',
    name: '天津麻花 桂发祥风味 散装 500g', price: 24.9, originalPrice: 34.9, sales: 960, stock: 100, unit: '袋',
    specs: [
      { name: '口味', values: [{ label: '什锦' }, { label: '黑芝麻' }, { label: '山楂' }] }
    ],
    description: '天津麻花风味，酥脆香甜，什锦配料，地方特产。',
    tags: ['天津特产', '酥脆香甜']
  }),
  goods({
    id: 602, seed: 'techan-luqv', categoryId: 6, categoryName: '地方特产', subCategoryId: 601, subCategoryName: '华北特产',
    name: '唐山蜂蜜麻糖 传统糕点 400g', price: 26.9, originalPrice: 36.9, sales: 720, stock: 80, unit: '盒',
    description: '唐山蜂蜜麻糖，薄如蝉翼，蜜香浓郁，河北名点。',
    tags: ['唐山特产', '蜂蜜麻糖']
  }),
  goods({
    id: 603, seed: 'techan-shandong', categoryId: 6, categoryName: '地方特产', subCategoryId: 601, subCategoryName: '华北特产',
    name: '山东周村烧饼 薄脆芝麻 65g*8袋', price: 32.9, originalPrice: 45.9, sales: 880, stock: 90, unit: '盒',
    description: '周村烧饼，薄如纸片，芝麻满口，山东特产名吃。',
    tags: ['山东特产', '薄脆']
  }),
  goods({
    id: 604, seed: 'techan-jiangnan', categoryId: 6, categoryName: '地方特产', subCategoryId: 602, subCategoryName: '华东特产',
    name: '苏州糕团 桂花糕 传统米糕 400g', price: 28.9, originalPrice: 39.9, sales: 640, stock: 70, unit: '盒',
    description: '苏州桂花糕团，软糯清甜，桂花香气，江南风味。',
    tags: ['苏州特产', '软糯清甜']
  }),
  goods({
    id: 605, seed: 'techan-ningbo', categoryId: 6, categoryName: '地方特产', subCategoryId: 602, subCategoryName: '华东特产',
    name: '宁波油赞子 小麻花 海苔味 400g', price: 19.9, originalPrice: 26.9, sales: 1050, stock: 120, unit: '袋',
    specs: [
      { name: '口味', values: [{ label: '海苔' }, { label: '芝麻' }, { label: '甜味' }] }
    ],
    description: '宁波油赞子，海苔味小麻花，酥脆咸香，当地排队小吃。',
    tags: ['宁波特产', '海苔味']
  }),

  // ============ 新品上市 ============
  goods({
    id: 701, seed: 'new-chunri', categoryId: 7, categoryName: '新品上市', subCategoryId: 701, subCategoryName: '春季限定',
    name: '樱花季限定烧饼 樱花粉 6个装', price: 15.9, originalPrice: 19.9, sales: 420, stock: 80, unit: '份',
    description: '春季限定樱花风味烧饼，粉色面皮，花香清甜，限时发售。',
    tags: ['春季限定', '樱花风味']
  }),
  goods({
    id: 702, seed: 'new-qingming', categoryId: 7, categoryName: '新品上市', subCategoryId: 701, subCategoryName: '春季限定',
    name: '艾草青团 豆沙蛋黄 6枚装 清明限定', price: 18.9, originalPrice: 24.9, sales: 560, stock: 90, unit: '盒',
    specs: [
      { name: '口味', values: [{ label: '豆沙' }, { label: '蛋黄肉松' }, { label: '芝麻' }] }
    ],
    description: '新鲜艾草打汁，青团软糯，豆沙蛋黄馅，清明时令。',
    tags: ['清明限定', '艾草青团']
  }),
  goods({
    id: 703, seed: 'new-xiangun', categoryId: 7, categoryName: '新品上市', subCategoryId: 702, subCategoryName: '季节尝鲜',
    name: '鲜笋肉烧饼 春笋馅 4个装 尝鲜价', price: 14.9, originalPrice: 18.9, sales: 380, stock: 70, unit: '份',
    description: '春笋鲜嫩配猪肉，春季限定馅料，尝鲜价限时供应。',
    tags: ['春笋', '尝鲜价']
  }),
  goods({
    id: 704, seed: 'new-heye', categoryId: 7, categoryName: '新品上市', subCategoryId: 702, subCategoryName: '季节尝鲜',
    name: '荷叶夹饼 梅菜扣肉 2个装 夏季新品', price: 15.9, originalPrice: 19.9, sales: 320, stock: 60, unit: '份',
    description: '荷叶清香夹饼，梅菜扣肉肥而不腻，夏季新品。',
    tags: ['夏季新品', '荷叶清香']
  }),
  goods({
    id: 705, seed: 'new-niangao', categoryId: 7, categoryName: '新品上市', subCategoryId: 702, subCategoryName: '季节尝鲜',
    name: '桂花糖年糕 手工水磨 500g 秋季新品', price: 16.9, originalPrice: 21.9, sales: 450, stock: 85, unit: '袋',
    description: '手工水磨年糕，桂花糖酱拌匀，软糯拉丝，秋季新品。',
    tags: ['水磨年糕', '桂花']
  }),

  // ============ 限时特惠 ============
  goods({
    id: 801, seed: 'sale-tejia', categoryId: 8, categoryName: '限时特惠', subCategoryId: 801, subCategoryName: '今日特价',
    name: '今日特价 原味烧饼 1斤装 亏本冲量', price: 6.9, originalPrice: 12.9, sales: 3560, stock: 500, unit: '斤',
    description: '每日一款特价，原味烧饼1斤装，亏本冲量，手慢无！',
    tags: ['亏本冲量', '每日特价']
  }),
  goods({
    id: 802, seed: 'sale-pintuan', categoryId: 8, categoryName: '限时特惠', subCategoryId: 802, subCategoryName: '拼团优惠',
    name: '三人拼团 椒盐烧饼 16个装 半价畅享', price: 9.9, originalPrice: 18.9, sales: 2890, stock: 400, unit: '份',
    description: '三人拼团半价畅享，椒盐烧饼16个装，邀好友一起拼。',
    tags: ['三人拼团', '半价']
  }),
  goods({
    id: 803, seed: 'sale-manjian', categoryId: 8, categoryName: '限时特惠', subCategoryId: 801, subCategoryName: '今日特价',
    name: '清仓 小昌烧饼 20个装 临期特惠', price: 5.9, originalPrice: 10.9, sales: 1980, stock: 150, unit: '份',
    description: '临期清仓，小昌烧饼20个装，保质期内，特价处理。',
    tags: ['临期清仓', '特价']
  }),
  goods({
    id: 804, seed: 'sale-zengsong', categoryId: 8, categoryName: '限时特惠', subCategoryId: 802, subCategoryName: '拼团优惠',
    name: '买二送一 豆浆粉 300g 组合装', price: 19.9, originalPrice: 38.7, sales: 1560, stock: 200, unit: '组',
    description: '买二送一，石磨豆浆粉300g*3袋，组合装更划算。',
    tags: ['买二送一', '组合装']
  })
]
