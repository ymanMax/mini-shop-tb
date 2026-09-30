// 种子数据：初始收藏、浏览足迹、搜索历史
import { goods, getGoodsById } from './goods.js'

// ===== 初始收藏（8 个商品，存 goodsId 数组）=====
export const seedCollectIds = [1001, 1003, 2002, 3001, 4001, 5001, 7002, 8001]

// ===== 初始浏览足迹（18 条，覆盖近 7 天）=====
// 结构：{ goodsId, name, mainPic, price, browseTime }
const day = 24 * 3600 * 1000
const now = Date.now()

// 挑选一批商品 id 用于足迹（覆盖各分类）
const historyGoodsIds = [
  1002, 1004, 1006, 1007, 1008, 2001, 2003, 2005, 2007, 2008,
  3002, 3003, 3004, 4002, 4004, 4006, 6001, 6002, 7001, 7004, 8002, 8003
]

// 时间偏移（小时），散布在 0~7 天内，最新的在前
const timeOffsets = [
  2, 5, 9, 26, 30, 33, 50, 55, 58, 74,
  80, 90, 100, 120, 130, 140, 155, 165
]

export const seedHistory = historyGoodsIds.slice(0, timeOffsets.length).map((gid, i) => {
  const g = getGoodsById(gid)
  return {
    goodsId: gid,
    name: g.name,
    mainPic: g.mainPic,
    price: g.price,
    browseTime: now - timeOffsets[i] * 3600 * 1000
  }
})

// ===== 初始搜索历史（8 条）=====
export const seedSearchHistory = [
  '芝麻烧饼',
  '蛋黄酥',
  '绿豆糕',
  '牛肉干',
  '月饼',
  '现磨豆浆',
  '年货礼盒',
  '红糖麻花'
]

// ===== 热门搜索词（10 个）=====
export const hotWords = [
  '肉松烧饼',
  '芝麻薄饼',
  '绿豆糕',
  '蛋黄酥',
  '手工桃酥',
  '红糖麻花',
  '花生酥',
  '龙须酥',
  '老婆饼',
  '驴打滚'
]
