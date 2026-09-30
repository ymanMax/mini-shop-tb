/**
 * 收藏 / 浏览足迹 / 热门搜索词的初始数据
 * 由 Mock 数据体系统一维护，字段结构与 `三、核心数据模型定义` 保持一致
 */
// 初始收藏：storage 中只存 goodsId
export const collectGoodsIds = [
  1001,
  1009,
  1014,
  1026,
  1036,
  1042,
  1058
]

// 浏览足迹：用 `hoursAgo` 表达相对时间，水合时换算成 browseTime，
// 保证任意时间点运行都能覆盖「今天 / 昨天 / 更早」
export const browseHistory = [
  {
    "goodsId": 1004,
    "hoursAgo": 0.5
  },
  {
    "goodsId": 1014,
    "hoursAgo": 2
  },
  {
    "goodsId": 1001,
    "hoursAgo": 4
  },
  {
    "goodsId": 1022,
    "hoursAgo": 6
  },
  {
    "goodsId": 1031,
    "hoursAgo": 9
  },
  {
    "goodsId": 1047,
    "hoursAgo": 11
  },
  {
    "goodsId": 1009,
    "hoursAgo": 25
  },
  {
    "goodsId": 1018,
    "hoursAgo": 28
  },
  {
    "goodsId": 1036,
    "hoursAgo": 31
  },
  {
    "goodsId": 1053,
    "hoursAgo": 36
  },
  {
    "goodsId": 1061,
    "hoursAgo": 40
  },
  {
    "goodsId": 1006,
    "hoursAgo": 50
  },
  {
    "goodsId": 1025,
    "hoursAgo": 58
  },
  {
    "goodsId": 1042,
    "hoursAgo": 72
  },
  {
    "goodsId": 1012,
    "hoursAgo": 96
  },
  {
    "goodsId": 1029,
    "hoursAgo": 120
  },
  {
    "goodsId": 1065,
    "hoursAgo": 144
  },
  {
    "goodsId": 1071,
    "hoursAgo": 160
  }
]

export const hotKeywords = [
  "肉松烧饼",
  "芝麻薄饼",
  "绿豆糕",
  "蛋黄酥",
  "手工桃酥",
  "红糖麻花",
  "花生酥",
  "龙须酥",
  "梅干菜",
  "锅巴"
]
