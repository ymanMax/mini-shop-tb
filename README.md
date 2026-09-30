# 烧饼商品 - 原生微信小程序电商项目

基于原生微信小程序开发的烧饼 / 糕点电商购物平台，支持商品浏览、分类筛选、规格选择、搜索联想、购物车、下单支付、订单管理、评价晒图、收藏与浏览足迹、收货地址管理等完整电商闭环。

> **当前为 Mock 模式**：后端服务未启动，全站数据来自 `mock/` 目录，所有页面均可见、可交互、有真实数据。

## 技术栈

- **框架**：微信小程序原生开发（非 Taro / uni-app），style v2，原生导航栏
- **样式**：WXSS（`.less` 为同内容的源文件，与 `.wxss` 逐字节一致）
- **数据层**：`api/http.js` 统一收口，`USE_MOCK` 开关切换 Mock / 真实后端
- **组件化**：自定义 SearchInput、Tabs、UpImg（无第三方 UI 库）

## Mock 数据体系

后端未启动，所有接口由 `mock/index.js` 的路由表接管：

```
mock/
├── index.js            # API 路由分发（url + method 匹配）+ 内存态 store
├── delay.js            # 模拟 200~600ms 随机网络延迟
└── data/
    ├── categories.js   # 10 个一级分类 / 29 个二级分类（含 emoji 图标与描述）
    ├── goods.js        # 78 条商品（52 条含多规格，含参数 / 售后 / 详情图）
    ├── carts.js        # 购物车初始数据（4 条有效 + 1 条失效商品）
    ├── orders.js       # 14 条订单，覆盖 6 种状态，含物流轨迹
    ├── reviews.js      # 349 条评价，覆盖全部商品，约 1/3 带晒图
    ├── user.js         # Mock 用户与 5 条收货地址（1 条默认，含家/公司/学校/其他标签）
    ├── history.js      # 初始收藏（7 个 goodsId）、浏览足迹（18 条）、热门搜索词（10 个）
    ├── seckill.js      # 限时抢购：10/14/20 三场，共 23 个抢购商品（含抢购价与已抢进度）
    ├── coupons.js      # 9 张券模板（5 满减 + 2 折扣 + 2 无门槛）与用户初始持有的 4 张
    ├── points.js       # 初始 680 积分、16 条积分明细、6 个兑换项
    └── messages.js     # 17 条消息，覆盖系统 / 订单 / 促销，其中 3 条未读
```

约定：

- 所有接口统一返回 `{ code, data, msg }`；`api/http.js` 校验 `code` 后把 `data` 直接 resolve 出去
- 分页接口的 `data` 为 `{ records, total, current, size }`
- 写操作（加购 / 下单 / 评价 / 收藏 / 足迹 / 地址）**先在内存态生效，再写入 storage 持久化**，保证跨页面一致
- 首次进入时把初始 Mock 数据落盘，避免「角标读 storage、列表页读接口」出现数据不一致
- 图片统一使用 `https://picsum.photos/seed/{唯一seed}/{宽}/{高}`，每条数据独立 seed，刷新不变

### 本地存储键

| 键 | 内容 | 上限 |
|---|---|---|
| `cartList` | 购物车条目 | — |
| `orderList` | 订单 | — |
| `goods_collect` | 收藏的 **goodsId 数组** | — |
| `browse_history` | `{ goodsId, name, mainPic, price, browseTime }` | 50 条 |
| `addresses` | 收货地址 | 10 条 |
| `selectedAddressId` | 结算时选中的地址 id | — |
| `userReviews` | 用户提交的评价 | — |
| `search_history` | 搜索历史（纯客户端，见 `utils/history.js`） | 15 条 |
| `user_coupons` | 用户持有的优惠券 | — |
| `user_points` | 积分余额 | — |
| `points_records` | 积分明细 | — |
| `checkin_data` | 签到数据：`{ consecutiveDays, signedDates }` | — |
| `messages` | 消息中心 | — |
| `seckill_records` | 抢购购买记录（用于每人每场限购 1 件） | — |
| `userInfo` | 登录态 | — |

### 切换到真实后端

只需改一处：

```js
// api/http.js
export const USE_MOCK = false;   // 关闭 Mock
export const baseUrl = 'https://your-api.com/api/v1';
```

页面代码无需任何改动。

## 目录结构

```
├── app.js                     # 入口：注入 Mock 登录态 + 初始化购物车角标
├── app.json                   # 页面路由、TabBar（4 个 Tab，保持不变）、窗口样式
├── app.wxss                   # 全局样式：主题变量、骨架屏、空态、标签、按钮、角标
├── api/
│   └── http.js                # 统一请求入口：request / upload + USE_MOCK 开关
├── mock/                      # Mock 数据体系（见上）
├── utils/
│   ├── format.js              # 金额 / 时间 / 相对时间 / 销量格式化
│   ├── toast.js               # Toast、Loading、Modal 统一封装
│   ├── cart.js                # 购物车读取与 tabBar 角标同步
│   ├── history.js             # 搜索历史（纯客户端 storage，去重 + 15 条上限）
│   └── asyncWx.js             # 微信 API Promise 化
├── request/index.js           # 旧入口，已废弃，仅转发到 api/http.js
├── components/                # SearchInput / Tabs / UpImg
├── static/images/             # 图片兜底图：default.png、default-avatar.png
├── icons/                     # TabBar 图标
└── pages/                     # 页面
```

## 页面清单

### Tab 页（4 个，结构不变）

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `pages/index/index` | 搜索入口、轮播、**限时抢购**、分类导航、公告、限时特惠楼层、为你推荐、悬浮购物车角标 |
| 分类 | `pages/category/index` | 左侧一级分类导航 + 右侧二级分类标签 + 吸顶排序筛选栏 + 商品卡片（含分页） |
| 购物车 | `pages/cart/index` | 地址切换、左滑删除、数量增减、全选、失效商品区、满减提示、猜你喜欢 |
| 我的 | `pages/user/index` | 用户资料、资产、订单入口（带各状态数量）、购物车 / 收藏入口、设置列表 |

### 功能页

| 页面 | 路径 | 说明 |
|------|------|------|
| 商品详情 | `pages/goods_detail/index` | 多图轮播、SKU 规格弹层、参数折叠、售后保障、图文详情、**评价模块**、看了又看 |
| 订单列表 | `pages/order/index` | 5 个状态 Tab、订单卡片、按状态显示操作按钮、下拉刷新与分页 |
| 订单详情 | `pages/order/detail` | 状态头部、物流 timeline、地址、商品清单、金额明细、**模拟配送进度** |
| 订单评价 | `pages/order/review` | 星级评分、快捷标签多选、文字评价、晒图上传（逐商品评价） |
| 支付确认 | `pages/pay/index` | 地址、清单、金额明细、备注、Mock 支付流程 |
| 商品列表 | `pages/goods_list/index` | 按分类 / 关键词筛选，综合 / 销量 / 价格排序，分页 |
| 搜索 | `pages/search/index` | 搜索历史、热门搜索、实时联想（高亮匹配）、结果排序与分页 |
| 收藏 | `pages/collect/index` | 全部 / 正在热卖 / 即将上线三个 Tab，左滑取消收藏，一键加购 |
| 浏览足迹 | `pages/footprint/index` | 按今天 / 昨天 / 更早分组，左滑单条删除、一键清空 |
| 收货地址 | `pages/address/list`、`pages/address/edit` | 管理模式（增删改）与选择模式（结算时点选回填）；编辑页支持校验、地区三级联动、标签与默认开关 |
| 领券中心 | `pages/coupon/index` | 券卡列表（满减 / 折扣 / 无门槛三色区分）、立即领取、每人限领、已领置灰 |
| 我的优惠券 | `pages/coupon/mine` | 未使用 / 已使用 / 已过期三个 Tab，有效期倒计时与临期红色标识 |
| 积分中心 | `pages/points/index` | 积分概览 + 签到入口、积分明细分页（绿加红减）、积分兑换专区 |
| 每日签到 | `pages/checkin/index` | 当月签到日历（可翻月）、签到成功弹层、连签 7 天奖励条 |
| 消息中心 | `pages/message/index` | 类型 Tab、未读红点、点击已读并跳转关联页、全部已读、进页 3 秒自动推送 |
| 意见反馈 | `pages/feedback/index` | 问题分类、文本描述、图片上传 |
| 登录 / 授权 | `pages/login/index`、`pages/auth/index` | 写入 Mock 登录态（游客本就可体验全部功能） |

## 核心数据模型

- **分类** `{ id, name, icon(emoji), desc, children: [{ id, name, icon, desc, categoryId }] }`
- **商品** `{ id, name, pics[], mainPic, categoryId, subCategoryId, price, originalPrice, sales, stock, unit, tags[], specs[], params[], afterSale, description, detailImages[], isCollect }`
  - `specs` 结构：`[{ name: '规格', values: [{ label, price?, stock? }] }]`
  - SKU 取值规则：**价格**取已选各项中最后一个带 `price` 的值（否则用商品原价）；**库存**取已选各项中带 `stock` 的值的最小值
- **购物车项** `{ id, goodsId, name, mainPic, specText, price, count, checked, stock, unit, invalid }`
- **订单** `{ id, orderNo, status, statusText, items[], totalAmount, discountAmount, freight, payAmount, addressSnapshot, createTime, payTime, payMethod, remark, logistics{ company, trackingNo, timeline[] }, isReviewed }`
  - 状态：`1 待付款 / 2 待发货 / 3 配送中 / 4 待收货 / 5 已完成 / 6 已取消`
- **评价** `{ id, orderId, goodsId, userName, userAvatar, rating, content, images[], tags[], createTime, specText }`
- **收货地址** `{ id, userName, telNumber, provinceName, cityName, countyName, detailInfo, all, tag('家'|'学校'|'公司'|'其他'), isDefault }`
- **浏览足迹** `{ goodsId, name, mainPic, price, browseTime }`
- **抢购商品** `{ goodsId, name, mainPic, price, seckillPrice, stock, sold, progress, remain, limitPerUser, soldOut, limitReached, buyable, statusText }`
  - 场次状态：`active 抢购中 / upcoming 即将开始 / ended 已结束`
- **优惠券** `{ id, templateId, type('full'|'discount'|'none'), title, amount, threshold, scope, status('unused'|'used'|'expired'), startTime, endTime, expiring, remainHours }`
  - 折扣券的 `amount` 是折扣率（`0.88` = 8.8 折），优惠额 = `订单额 × (1 - amount)`，最高减 50 元
- **积分记录** `{ id, type('earn'|'spend'), source('购物'|'签到'|'评价'|'兑换'), title, points, createTime }`
- **签到数据** `{ consecutiveDays, signedDates: ['YYYY-MM-DD'], todaySigned }`（连续天数始终由已签日期实时推算）
- **消息** `{ id, type(1系统/2订单/3促销), title, content, isRead, createTime, relatedType, relatedId }`

## 关键接口

| 接口 | 说明 |
|------|------|
| `GET /home/index` | 首页聚合数据（轮播 / 分类导航 / 楼层 / 推荐） |
| `GET /categories` | 分类树 |
| `GET /goods/search` | 商品搜索：`categoryId, subCategoryId, keyword, sort, page, size, minPrice, maxPrice, onlyStock` |
| `GET /goods/detail` | 商品详情（含 `reviewStats` 评分统计） |
| `GET /goods/recommend` | 看了又看 / 猜你喜欢 |
| `GET /goods/suggest` | 搜索联想（前缀优先，返回 `matchStart/matchEnd` 供高亮） |
| `GET /search/hot` | 热门搜索词（10 个，均已确认能搜到商品） |
| `GET/POST /seckill/*` | 限时抢购：`sessions`（三场次+状态+倒计时基准）、`buy`（按抢购价加购，含限购校验） |
| `GET/POST /coupon/*` | 优惠券：`templates / claim / mine / count / available`（按订单金额给出可用与不可用券） |
| `GET/POST /points/*` | 积分：`info / records / goods / exchange` |
| `GET/POST /checkin/*` | 签到：`info`（日历+连签+奖励梯度）、`do` |
| `GET/POST /messages/*` | 消息：`list / unreadCount / detail / read / readAll / push` |
| `GET/POST /cart/*` | 购物车增删改查：`list / count / add / update / checked / remove / clearInvalid` |
| `GET/POST /orders/*` | 订单：`list / count / detail / create / pay / cancel / confirm / advance / urge / again` |
| `GET/POST /reviews/*` | 评价：`list / stats / submit` |
| `GET/POST /collect/*` | 收藏：`list / ids / count / toggle / remove` |
| `GET/POST /history/*` | 浏览足迹：`list / add / remove / clear` |
| `GET/POST /address/*` | 地址：`list / detail / default / current / count / select / setDefault / save / remove` |
| `POST /upload` | 图片上传（Mock 直接返回本地临时路径） |

> `GET /address/current` 是**结算用**地址：优先返回「本次选中的地址」，否则回退默认地址；
> `POST /address/select` 只改「选中」不改「默认」，两者语义分离。

## 交互与数据联动

- **购物车角标全局同步**：加购后首页 / 分类 / 详情 / 我的的角标实时更新
- **收藏跨页同步**：详情页心形按钮切换后写入 `goods_collect`，收藏列表页与详情页在 `onShow` 实时读取
- **浏览足迹自动记录**：进入商品详情页即写入，同一商品去重并置顶，最多保留 50 条
- **页面返回刷新**：详情页返回列表、订单列表返回我的页、地址编辑页返回列表，均通过 `onShow` 重查数据
- **状态流转**：下单 → 购物车清空 + 订单新增；评价 → 商品评价区刷新 + 订单标记已评价；确认收货 → 评价入口出现
- **模拟配送**：订单详情页「🔧 模拟配送进度」可把订单从待发货一路推进到已完成，便于演示完整流程
- **限时抢购**：每天 10:00 / 14:00 / 20:00 三场，倒计时归零后自动切下一场；抢购商品按抢购价单独成行加入购物车，每人每场每商品限购 1 件
- **优惠券联动**：支付页按订单金额自动匹配最优券，实付 = 商品总价 − 满减 − 优惠券；下单即核销，同一张券不可复用
- **积分闭环**：购物（每 1 元 1 分）、签到（连签梯度 5/5/10/10/15/20/50）、评价（+20）、兑换（扣分换券）四条链路都写入同一份积分明细
- **消息推送**：下单自动写入订单消息、券临期 24 小时自动生成提醒、进入消息中心 3 秒后收到一条促销推送；未读数实时同步到「我的」Tab 角标

## 开发约定

- **图片兜底**：所有 `<image>` 必须写 `binderror` 回退本地占位图，杜绝灰色裂图
  - 商品图 → `/static/images/default.png`，头像 → `/static/images/default-avatar.png`
- **金额**：一律以数字（元）存储，展示前用 `formatPrice()` 格式化为两位小数，禁止字符串价格参与计算
- **WXML 不写函数调用**：价格、时间、星级等展示文案统一在 JS 里预格式化后再 `setData`
- **主题色**：`var(--themeColor)` = `#eb4450`
- **加载与空态**：首屏用骨架屏（`.skeleton-block`），空数据用空态组件（`.empty`），不允许白屏

## 运行方式

1. 用微信开发者工具打开本项目目录
2. AppID 可使用测试号（`project.config.json` 中已设 `urlCheck: false`，可直接加载公网图片）
3. 编译运行即可，无需启动任何后端服务

## 主题配色

- 导航栏背景色：`#eb4450`
- TabBar 选中色：`#ff2d4a`
- 主题色变量：`--themeColor: #eb4450`
- 小程序名称：烧饼商品
