// 商品 Mock 数据：40+ 条，覆盖全部分类
// 图片使用 picsum.photos 固定 seed，刷新不变、各不相同
const categories = require('./categories.js')

const catMap = {}
categories.forEach(c => {
  catMap[c.id] = c
  c.children.forEach(ch => { catMap[ch.id] = ch })
})

// 构造商品：自动补全 pics / mainPic / detailImages / 分类名
function makeGoods(o) {
  const cat = catMap[o.categoryId] || {}
  const sub = catMap[o.subCategoryId] || {}
  const pics = [0, 1, 2, 3].map(i => `https://picsum.photos/seed/bao-${o.id}-${i}/600/600`)
  const detailImages = [0, 1, 2].map(i => `https://picsum.photos/seed/bao-${o.id}-detail-${i}/750/500`)
  return {
    id: o.id,
    name: o.name,
    pics,
    mainPic: pics[0],
    categoryId: o.categoryId,
    subCategoryId: o.subCategoryId,
    categoryName: cat.name || '烧饼类',
    subCategoryName: sub.name || '',
    price: o.price,
    originalPrice: o.originalPrice,
    sales: o.sales,
    stock: o.stock,
    unit: o.unit || '份',
    tags: o.tags || [],
    specs: o.specs || [],
    params: o.params || [
      { key: '保质期', value: '30天' },
      { key: '储存方法', value: '常温避光保存' },
      { key: '生产日期', value: '见包装喷码' },
      { key: '产地', value: '山东潍坊' }
    ],
    afterSale: o.afterSale || {
      supportReturn: true,
      returnDays: 7,
      supportExchange: true,
      guaranteeText: '坏果包赔·48小时售后'
    },
    description: o.description || '',
    detailImages,
    isCollect: false
  }
}

const goodsList = [
  // ===== 烧饼类 =====
  makeGoods({
    id: 1001, name: '老式五仁大烧饼 传统手工制作 500g 装', categoryId: 1, subCategoryId: 101,
    price: 12.9, originalPrice: 18.0, sales: 3200, stock: 200, unit: '斤',
    tags: ['热卖', '手工现做'],
    specs: [
      { name: '规格', values: [{ label: '1斤装', price: 12.9, stock: 100 }, { label: '2斤装', price: 23.9, stock: 80 }, { label: '5斤装', price: 55.9, stock: 40 }] },
      { name: '口味', values: [{ label: '五仁' }, { label: '黑芝麻' }, { label: '白糖' }] }
    ],
    description: '老式五仁大烧饼，采用老面自然发酵，木炭炉手工烤制。皮酥馅足，五仁馅料饱满，咬一口满嘴香，是小时候的味道。每一个都是现烤现发，收到后加热3分钟风味更佳。'
  }),
  makeGoods({
    id: 1002, name: '酥皮牛肉烧饼 多汁夹馅 6个装', categoryId: 1, subCategoryId: 103,
    price: 18.8, originalPrice: 25.0, sales: 2100, stock: 150, unit: '盒',
    tags: ['爆汁', '肉馅饱满'],
    specs: [
      { name: '规格', values: [{ label: '6个装', price: 18.8, stock: 80 }, { label: '12个装', price: 35.8, stock: 60 }] },
      { name: '口味', values: [{ label: '牛肉' }, { label: '猪肉大葱' }, { label: '羊肉' }] }
    ],
    description: '酥皮牛肉烧饼，外皮层层起酥，内馅选用新鲜黄牛腿肉，调配秘制汤汁，咬开有汁水流出来。烤箱180度加热8分钟即可还原刚出炉的口感。'
  }),
  makeGoods({
    id: 1003, name: '红糖桂花酥烧饼 甜而不腻 400g', categoryId: 1, subCategoryId: 104,
    price: 9.9, originalPrice: 15.0, sales: 5600, stock: 300, unit: '袋',
    tags: ['香甜', '桂花'],
    specs: [
      { name: '规格', values: [{ label: '400g袋装', price: 9.9, stock: 200 }, { label: '800g分享装', price: 18.8, stock: 150 }] }
    ],
    description: '红糖桂花酥烧饼，选用广西红糖与桂林金桂，酥皮一碰就掉渣，内馅香甜不腻，配一杯清茶就是惬意的下午茶。'
  }),
  makeGoods({
    id: 1004, name: '椒盐芝麻酥烧饼 咸香口味 500g', categoryId: 1, subCategoryId: 102,
    price: 11.9, originalPrice: 16.0, sales: 1800, stock: 180, unit: '斤',
    tags: ['咸香', '芝麻'],
    description: '椒盐芝麻酥烧饼，满覆白芝麻，咸香适口，层层酥脆。无糖配方，适合控糖人士和中老年朋友。'
  }),
  makeGoods({
    id: 1005, name: '缙云烧饼 梅干菜扣肉味 传统桶饼', categoryId: 1, subCategoryId: 103,
    price: 15.8, originalPrice: 22.0, sales: 2900, stock: 160, unit: '个',
    tags: ['缙云特产', '梅干菜'],
    specs: [
      { name: '规格', values: [{ label: '3个装', price: 15.8, stock: 90 }, { label: '6个装', price: 29.8, stock: 70 }] },
      { name: '辣度', values: [{ label: '不辣' }, { label: '微辣' }, { label: '特辣' }] }
    ],
    description: '正宗缙云烧饼，梅干菜与五花肉的经典搭配，桶炉烤制，饼皮薄脆，梅干菜吸满肉汁，是浙江缙云的街头味道。'
  }),
  makeGoods({
    id: 1006, name: '黄桥烧饼 蟹黄味 江苏老字号 8个装', categoryId: 1, subCategoryId: 102,
    price: 22.0, originalPrice: 30.0, sales: 1200, stock: 100, unit: '盒',
    tags: ['老字号', '蟹黄'],
    description: '黄桥烧饼是江苏泰兴名点，蟹黄版本酥香鲜美，层次分明，曾是贡品级别的点心。独立包装，方便携带。'
  }),

  // ===== 糕点类 =====
  makeGoods({
    id: 2001, name: '京八件礼盒 传统糕点八种口味 800g', categoryId: 2, subCategoryId: 201,
    price: 68.0, originalPrice: 98.0, sales: 860, stock: 60, unit: '盒',
    tags: ['京八件', '礼盒'],
    specs: [
      { name: '规格', values: [{ label: '经典款800g', price: 68.0, stock: 40 }, { label: '尊享款1200g', price: 108.0, stock: 20 }] }
    ],
    description: '京八件礼盒包含八样传统京味糕点：福字饼、禄字饼、寿字饼、喜字饼、椒盐饼、枣花酥等，老北京风味，送礼自用两相宜。'
  }),
  makeGoods({
    id: 2002, name: '绿豆糕 老式手工 无添蔗糖 500g', categoryId: 2, subCategoryId: 201,
    price: 14.9, originalPrice: 20.0, sales: 4200, stock: 250, unit: '袋',
    tags: ['无蔗糖', '绿豆'],
    specs: [
      { name: '口味', values: [{ label: '原味' }, { label: '桂花' }, { label: '抹茶' }] }
    ],
    description: '老式绿豆糕，甄选内蒙古绿豆，细腻研磨，入口即化。无添蔗糖配方，清甜爽口，夏天冰镇后风味更佳。'
  }),
  makeGoods({
    id: 2003, name: '天津麻花 十八街风味 什锦味 500g', categoryId: 2, subCategoryId: 202,
    price: 19.9, originalPrice: 28.0, sales: 3100, stock: 200, unit: '盒',
    tags: ['天津特产', '什锦'],
    specs: [
      { name: '口味', values: [{ label: '什锦味' }, { label: '黑芝麻' }, { label: '五味' }] }
    ],
    description: '天津十八街风味麻花，酥脆香甜，什锦口味包含芝麻、花生、桂花等多种配料，一根麻花多重口感。'
  }),
  makeGoods({
    id: 2004, name: '蜂蜜大麻花 软麻花 现炸现发 6根装', categoryId: 2, subCategoryId: 202,
    price: 13.9, originalPrice: 19.0, sales: 5100, stock: 220, unit: '份',
    tags: ['现炸', '蜂蜜'],
    description: '东北蜂蜜软麻花，外酥里软，蜂蜜甜味自然，不是那种齁甜。现炸现发，收到3天内口感最佳。'
  }),
  makeGoods({
    id: 2005, name: '老蛋糕 鸡蛋糕 老式槽子糕 500g', categoryId: 2, subCategoryId: 203,
    price: 16.8, originalPrice: 23.0, sales: 2800, stock: 180, unit: '袋',
    tags: ['鸡蛋多', '松软'],
    description: '老式槽子糕，鸡蛋含量高达35%，不加水，纯蛋打发。口感松软有嚼劲，是爷爷奶奶辈熟悉的味道。'
  }),
  makeGoods({
    id: 2006, name: '流心蛋黄酥 雪媚娘皮 6枚装', categoryId: 2, subCategoryId: 203,
    price: 21.8, originalPrice: 29.9, sales: 6700, stock: 300, unit: '盒',
    tags: ['流心', '雪媚娘'],
    specs: [
      { name: '口味', values: [{ label: '蛋黄流沙' }, { label: '抹茶' }, { label: '红豆' }] }
    ],
    description: '流心蛋黄酥，六层口感：酥皮、雪媚娘、豆沙、咸蛋黄、流心酱。切开有流沙涌出，下午茶标配。'
  }),
  makeGoods({
    id: 2007, name: '广式月饼 双黄白莲蓉 中秋礼盒', categoryId: 2, subCategoryId: 204,
    price: 88.0, originalPrice: 128.0, sales: 560, stock: 80, unit: '盒',
    tags: ['中秋', '双黄'],
    description: '广式双黄白莲蓉月饼，湘莲磨蓉，搭配两个完整咸蛋黄，饼皮油润回甜。中秋送礼佳品。'
  }),
  makeGoods({
    id: 2008, name: '红糖年糕 手工糯米糍粑 500g', categoryId: 2, subCategoryId: 204,
    price: 12.9, originalPrice: 18.0, sales: 1500, stock: 140, unit: '袋',
    tags: ['手工', '红糖'],
    description: '宁波风味红糖年糕，纯糯米手工捶打，煎至两面金黄蘸红糖汁，外脆里糯，拉丝能拉半米长。'
  }),

  // ===== 饮品类 =====
  makeGoods({
    id: 3001, name: '现磨纯豆浆粉 无添加蔗糖 300g', categoryId: 3, subCategoryId: 301,
    price: 17.9, originalPrice: 24.0, sales: 8900, stock: 400, unit: '袋',
    tags: ['现磨', '无添加'],
    specs: [
      { name: '规格', values: [{ label: '300g袋装', price: 17.9, stock: 300 }, { label: '600g家庭装', price: 32.9, stock: 200 }] }
    ],
    description: '现磨纯豆浆粉，选用东北非转基因大豆，低温研磨，无添加蔗糖、无香精。热水一冲就是一杯浓醇豆浆。'
  }),
  makeGoods({
    id: 3002, name: '古法酸梅汤原料包 熬煮8包装', categoryId: 3, subCategoryId: 302,
    price: 15.8, originalPrice: 22.0, sales: 3400, stock: 260, unit: '盒',
    tags: ['古法', '解腻'],
    description: '古法酸梅汤原料包，乌梅、山楂、陈皮、甘草、桂花八味配料，自己熬煮，无糖无色素，夏天冰镇喝爽极了。'
  }),
  makeGoods({
    id: 3003, name: '绿豆粥料包 五谷杂粮组合 7日装', categoryId: 3, subCategoryId: 303,
    price: 23.9, originalPrice: 32.0, sales: 1900, stock: 150, unit: '盒',
    tags: ['五谷', '7日装'],
    description: '7日绿豆粥料包，每天一袋不重样：绿豆百合、绿豆莲子、绿豆西米等搭配，配料干净，熬粥方便。'
  }),
  makeGoods({
    id: 3004, name: '原味豆奶 早餐奶 250ml*12盒', categoryId: 3, subCategoryId: 301,
    price: 29.9, originalPrice: 39.9, sales: 4500, stock: 200, unit: '箱',
    tags: ['早餐奶', '整箱'],
    description: '原味豆奶，整颗大豆研磨，植物蛋白饮料，250ml便携装，早餐配烧饼刚刚好。'
  }),
  makeGoods({
    id: 3005, name: '桂花乌龙茶 冷泡茶 三角包20袋', categoryId: 3, subCategoryId: 302,
    price: 26.8, originalPrice: 36.0, sales: 2200, stock: 180, unit: '罐',
    tags: ['冷泡', '桂花'],
    description: '桂花乌龙茶，台湾高山乌龙搭配金桂，冷热两泡皆可。冷泡4小时，清香回甘，办公室常备。'
  }),

  // ===== 零食类 =====
  makeGoods({
    id: 4001, name: '每日坚果 混合装 30包 750g', categoryId: 4, subCategoryId: 401,
    price: 59.9, originalPrice: 89.0, sales: 12000, stock: 350, unit: '箱',
    tags: ['每日坚果', '30包'],
    specs: [
      { name: '规格', values: [{ label: '30包750g', price: 59.9, stock: 200 }, { label: '15包375g', price: 32.9, stock: 150 }] }
    ],
    description: '每日坚果，巴旦木、核桃、腰果、榛子、蔓越莓干、蓝莓干科学配比，独立小包装，每天一包补充营养。'
  }),
  makeGoods({
    id: 4002, name: '靖江猪肉脯 蜜汁味 500g 散装', categoryId: 4, subCategoryId: 402,
    price: 39.9, originalPrice: 59.0, sales: 7800, stock: 280, unit: '袋',
    tags: ['靖江', '蜜汁'],
    specs: [
      { name: '口味', values: [{ label: '蜜汁' }, { label: '香辣' }, { label: '原味' }] }
    ],
    description: '靖江猪肉脯，精选猪后腿肉，整片烘烤，蜜汁风味甜中带咸。500g大包装，追剧聊天停不下来。'
  }),
  makeGoods({
    id: 4003, name: '芒果干 500g 菲律宾风味 厚切', categoryId: 4, subCategoryId: 403,
    price: 26.8, originalPrice: 36.0, sales: 6500, stock: 300, unit: '袋',
    tags: ['厚切', '芒果干'],
    description: '厚切芒果干，菲律宾吕宋芒制作，果肉厚实，酸甜适中，不添加色素。500g实惠大包装。'
  }),
  makeGoods({
    id: 4004, name: '锅巴 麻辣味 老式大米锅巴 400g', categoryId: 4, subCategoryId: 404,
    price: 13.9, originalPrice: 19.9, sales: 9300, stock: 350, unit: '袋',
    tags: ['麻辣', '锅巴'],
    specs: [
      { name: '口味', values: [{ label: '麻辣' }, { label: '五香味' }, { label: '蟹黄味' }] }
    ],
    description: '老式大米锅巴，米粒清晰可见，麻辣味过瘾。咔嚓咔嚓的脆，是小时候放学路上的味道。'
  }),
  makeGoods({
    id: 4005, name: '手剥巴旦木 奶油味 500g 罐装', categoryId: 4, subCategoryId: 401,
    price: 32.9, originalPrice: 45.0, sales: 5400, stock: 220, unit: '罐',
    tags: ['手剥', '奶油味'],
    description: '手剥巴旦木，奶油味烘烤，壳薄好剥，果仁饱满。罐装密封，防潮保鲜。'
  }),
  makeGoods({
    id: 4006, name: '香辣鸭脖 卤味零食 200g 真空装', categoryId: 4, subCategoryId: 402,
    price: 21.9, originalPrice: 29.9, sales: 4100, stock: 180, unit: '袋',
    tags: ['卤味', '香辣'],
    specs: [
      { name: '辣度', values: [{ label: '微辣' }, { label: '中辣' }, { label: '爆辣' }] }
    ],
    description: '香辣鸭脖，卤制8小时入味，真空独立包装，肉厚耐嚼，追剧神器。'
  }),
  makeGoods({
    id: 4007, name: '山楂条 桑葚味 无添加 500g', categoryId: 4, subCategoryId: 403,
    price: 14.9, originalPrice: 21.0, sales: 5800, stock: 260, unit: '袋',
    tags: ['山楂', '无添加'],
    description: '桑葚山楂条，山楂与桑葚打浆制作，酸甜开胃，无色素无防腐剂，孩子也能放心吃。'
  }),

  // ===== 礼盒装 =====
  makeGoods({
    id: 5001, name: '烧饼糕点年货大礼包 12种组合 2000g', categoryId: 5, subCategoryId: 501,
    price: 128.0, originalPrice: 188.0, sales: 420, stock: 60, unit: '盒',
    tags: ['年货', '12种组合'],
    specs: [
      { name: '规格', values: [{ label: '欢聚款2000g', price: 128.0, stock: 40 }, { label: '尊享款3000g', price: 188.0, stock: 20 }] }
    ],
    description: '年货大礼包包含烧饼、麻花、蛋黄酥、绿豆糕等12种糕点组合，红色礼盒装，走亲访友有面子。'
  }),
  makeGoods({
    id: 5002, name: '伴手礼小礼盒 烧饼+酸梅汤组合', categoryId: 5, subCategoryId: 502,
    price: 45.0, originalPrice: 65.0, sales: 860, stock: 100, unit: '盒',
    tags: ['伴手礼', '组合'],
    description: '伴手礼小礼盒，手工烧饼6枚 + 古法酸梅汤原料包1份，精致手提袋，出差旅行送同事刚刚好。'
  }),
  makeGoods({
    id: 5003, name: '企业团购定制礼盒 可印LOGO 10盒起订', categoryId: 5, subCategoryId: 503,
    price: 99.0, originalPrice: 159.0, sales: 230, stock: 999, unit: '套',
    tags: ['定制', '团购'],
    description: '企业团购定制礼盒，支持LOGO印制，10盒起订，适合员工福利、客户拜访。联系客服获取定制方案。'
  }),

  // ===== 地方特产 =====
  makeGoods({
    id: 6001, name: '北京驴打滚 正宗豆沙馅 400g', categoryId: 6, subCategoryId: 601,
    price: 16.8, originalPrice: 23.0, sales: 3600, stock: 200, unit: '盒',
    tags: ['北京特产', '驴打滚'],
    description: '北京驴打滚，黄豆面裹满糯叽叽的豆沙卷，豆香浓郁，豆沙细腻。老北京小吃十三绝之一。'
  }),
  makeGoods({
    id: 6002, name: '山东煎饼 小米杂粮 即食 1000g', categoryId: 6, subCategoryId: 602,
    price: 19.9, originalPrice: 28.0, sales: 5200, stock: 260, unit: '袋',
    tags: ['山东特产', '杂粮'],
    specs: [
      { name: '口味', values: [{ label: '小米' }, { label: '玉米' }, { label: '全麦' }] }
    ],
    description: '山东小米煎饼，石磨研磨，手工摊制，卷大葱蘸大酱是地道吃法，也可以卷一切。'
  }),
  makeGoods({
    id: 6003, name: '山西太谷饼 老式糕点 整箱 1000g', categoryId: 6, subCategoryId: 603,
    price: 21.9, originalPrice: 30.0, sales: 2900, stock: 180, unit: '箱',
    tags: ['山西特产', '太谷饼'],
    specs: [
      { name: '规格', values: [{ label: '1000g整箱', price: 21.9, stock: 120 }, { label: '2000g家庭装', price: 39.9, stock: 60 }] }
    ],
    description: '山西太谷饼，晋式糕点代表，芝麻表面，酥软香甜，存放越久越绵软，一箱1000g约20枚。'
  }),
  makeGoods({
    id: 6004, name: '陕西甑糕 红枣芸豆 西安特产 400g', categoryId: 6, subCategoryId: 604,
    price: 18.8, originalPrice: 26.0, sales: 2400, stock: 160, unit: '盒',
    tags: ['陕西特产', '甑糕'],
    description: '西安甑糕，糯米、红枣、芸豆层层蒸制，枣泥融化进糯米里，甜而不腻，镜糕小哥哥同款。'
  }),
  makeGoods({
    id: 6005, name: '羊肉泡馍 方便装 陕西名吃 2包', categoryId: 6, subCategoryId: 604,
    price: 29.9, originalPrice: 39.9, sales: 1800, stock: 140, unit: '盒',
    tags: ['羊肉泡馍', '方便'],
    description: '羊肉泡馍方便装，真实羊肉块 + 死面饼，煮一煮就是西安老孙家的味道。'
  }),
  makeGoods({
    id: 6006, name: '山西老陈醋 八年陈酿 500ml 瓶装', categoryId: 6, subCategoryId: 603,
    price: 25.8, originalPrice: 35.0, sales: 1500, stock: 120, unit: '瓶',
    tags: ['老陈醋', '八年陈'],
    description: '山西老陈醋，八年陈酿，酸香浓厚，凉拌、蘸饺子都香。GB/T 19777 国家标准酿造。'
  }),

  // ===== 新品上市 =====
  makeGoods({
    id: 7001, name: '新品：藤椒鸡肉烧饼 青麻鲜香 6枚', categoryId: 7, subCategoryId: 701,
    price: 19.9, originalPrice: 26.0, sales: 800, stock: 150, unit: '盒',
    tags: ['新品', '藤椒'],
    specs: [
      { name: '辣度', values: [{ label: '微麻' }, { label: '中麻' }] }
    ],
    description: '本月新品藤椒鸡肉烧饼，青花椒的麻香搭配嫩滑鸡肉，口口生津，尝鲜价限时优惠。'
  }),
  makeGoods({
    id: 7002, name: '新品：芋泥麻薯酥 秋冬限定 6枚', categoryId: 7, subCategoryId: 702,
    price: 23.8, originalPrice: 32.0, sales: 600, stock: 120, unit: '盒',
    tags: ['新品', '芋泥'],
    description: '秋冬限定芋泥麻薯酥，荔浦芋头打泥 + 拉丝麻薯，甜香绵软，限定发售。'
  }),
  makeGoods({
    id: 7003, name: '新品：全麦贝果 低脂粗粮 4个装', categoryId: 7, subCategoryId: 701,
    price: 18.9, originalPrice: 25.0, sales: 900, stock: 160, unit: '袋',
    tags: ['新品', '低脂'],
    specs: [
      { name: '口味', values: [{ label: '原味' }, { label: '蓝莓' }, { label: '洋葱' }] }
    ],
    description: '新品全麦贝果，低脂低糖，有嚼劲，早餐对半切开夹蛋夹菜就是能量满满的一餐。'
  }),

  // ===== 限时特惠 =====
  makeGoods({
    id: 8001, name: '秒杀：原味烧饼 尝鲜装 2个', categoryId: 8, subCategoryId: 801,
    price: 3.9, originalPrice: 9.9, sales: 15000, stock: 500, unit: '份',
    tags: ['秒杀', '尝鲜'],
    description: '秒杀尝鲜装！原味烧饼2个，新客户首单专享，每人限1份。'
  }),
  makeGoods({
    id: 8002, name: '满减：酥脆麻花礼盒 混合口味 1000g', categoryId: 8, subCategoryId: 802,
    price: 39.9, originalPrice: 59.0, sales: 3300, stock: 200, unit: '盒',
    tags: ['满减', '混合口味'],
    description: '酥脆麻花礼盒装，甜、咸、麻、辣四种口味混合，满39减5、满99减15专区商品。'
  }),
  makeGoods({
    id: 8003, name: '秒杀：绿豆冰糕 夏日限定 200g', categoryId: 8, subCategoryId: 801,
    price: 6.9, originalPrice: 12.9, sales: 11000, stock: 400, unit: '盒',
    tags: ['秒杀', '冰糕'],
    description: '夏日限定绿豆冰糕，冰镇后口感像冰淇淋，秒杀价6.9元，每天10点/15点两场。'
  }),

  // ===== 健康粗粮 =====
  makeGoods({
    id: 9001, name: '全麦烧饼 粗粮低脂 8个装', categoryId: 9, subCategoryId: 901,
    price: 17.9, originalPrice: 24.0, sales: 2600, stock: 180, unit: '袋',
    tags: ['全麦', '低脂'],
    specs: [
      { name: '规格', values: [{ label: '8个装', price: 17.9, stock: 120 }, { label: '16个装', price: 33.9, stock: 80 }] }
    ],
    description: '全麦烧饼，全麦粉含量50%以上，低脂饱腹，健身代餐好选择。'
  }),
  makeGoods({
    id: 9002, name: '无蔗糖桃酥 老式核桃酥 500g', categoryId: 9, subCategoryId: 902,
    price: 18.8, originalPrice: 26.0, sales: 3800, stock: 220, unit: '袋',
    tags: ['无蔗糖', '桃酥'],
    description: '无蔗糖桃酥，糖醇替代蔗糖，酥松化渣，适合控糖人群和孝敬长辈。'
  }),
  makeGoods({
    id: 9003, name: '玉米窝头 粗粮馒头 12个装', categoryId: 9, subCategoryId: 901,
    price: 15.9, originalPrice: 22.0, sales: 2100, stock: 160, unit: '袋',
    tags: ['粗粮', '窝头'],
    description: '玉米窝头，玉米面 + 黄豆面手工制作，不添加面粉，粗粮健康，蒸热即食。'
  }),
  makeGoods({
    id: 9004, name: '紫薯燕麦饼 无蔗糖代餐 500g', categoryId: 9, subCategoryId: 902,
    price: 16.9, originalPrice: 23.0, sales: 4400, stock: 240, unit: '袋',
    tags: ['紫薯', '代餐'],
    description: '紫薯燕麦饼，紫薯粉 + 燕麦片压制，无蔗糖，代餐扛饿，办公室抽屉常备。'
  })
]

module.exports = goodsList
