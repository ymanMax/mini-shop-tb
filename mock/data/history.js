// 初始浏览足迹（15-20 条，覆盖近 7 天）
const now = Date.now()
const H = 3600 * 1000
const D = 24 * H

const h = (goodsId, name, seed, price, ago) => ({
  goodsId,
  name,
  mainPic: `https://picsum.photos/seed/${seed}/600/600`,
  price,
  browseTime: now - ago
})

export const initialHistory = [
  h(103, '红糖流心烧饼 甜而不腻 6个装 现烤发出', 'shaobing-hongtang', 11.9, 2 * H),
  h(404, '风干牛肉干 内蒙古手撕 500g 原味', 'snack-niurou', 89.9, 5 * H),
  h(702, '艾草青团 豆沙蛋黄 6枚装 清明限定', 'new-qingming', 18.9, 26 * H),
  h(206, '手撕面包 奶香原味 1000g 整箱早餐', 'gaodian-miantuo', 24.9, 28 * H),
  h(101, '老式五仁大烧饼 传统手工制作 500g 真空包装', 'shaobing-yuanwei', 12.9, 1.2 * D),
  h(401, '每日坚果 混合果仁 750g 30包 礼盒装', 'snack-jianguo', 59.9, 1.5 * D),
  h(305, '酸梅汤原料包 古法熬制 100g*5包', 'drink-suanmei', 15.9, 1.8 * D),
  h(501, '烧饼糕点组合礼盒 8种口味 1500g 送礼', 'gift-heboxiaobing', 88.0, 2.2 * D),
  h(107, '梅干菜扣肉烧饼 徽州风味 6个装', 'shaobing-sucai', 14.9, 2.5 * D),
  h(603, '山东周村烧饼 薄脆芝麻 65g*8袋', 'techan-shandong', 32.9, 3 * D),
  h(201, '京八件传统糕点礼盒 8种口味 1000g', 'gaodian-bajian', 45.9, 3.3 * D),
  h(403, '靖江猪肉脯 蜜汁味 200g 手撕肉干', 'snack-rougan', 22.9, 3.6 * D),
  h(302, '无糖纯豆乳 250ml*12盒 整箱', 'drink-douru', 29.9, 4 * D),
  h(102, '椒盐葱香烧饼 咸香酥脆 8个装 早餐必备', 'shaobing-jiaoyan', 9.9, 4.2 * D),
  h(701, '樱花季限定烧饼 樱花粉 6个装', 'new-chunri', 15.9, 4.5 * D),
  h(601, '天津麻花 桂发祥风味 散装 500g', 'techan-jingjin', 24.9, 5 * D),
  h(203, '老蛋糕 鸡蛋糕 传统槽子糕 500g', 'gaodian-dangao', 15.9, 5.5 * D),
  h(402, '焦糖瓜子 大颗粒 500g 炒货零食', 'snack-huangguazi', 13.9, 6 * D),
  h(106, '芝麻酥烧饼 满口芝麻 10个装 独立包装', 'shaobing-zhima', 10.9, 6.5 * D)
]
