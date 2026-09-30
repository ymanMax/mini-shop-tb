# 烧饼商品 - 原生微信小程序电商项目

基于原生微信小程序开发的电商购物平台，支持商品浏览、搜索、购物车、下单支付、订单管理、收藏、意见反馈等完整电商功能。

## 技术栈

- **框架**：微信小程序原生开发（非 Taro / uni-app）
- **样式**：Less + WXSS，style v2
- **请求封装**：基于 wx.request 的 Promise 封装，统一处理 loading 和 header token
- **组件化**：自定义 SearchInput、Tabs、UpImg 等可复用组件

## 功能模块

### Tab 页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | `pages/index/index` | 搜索入口、轮播图、分类导航、商品推荐 |
| 分类 | `pages/category/index` | 左侧分类导航 + 右侧商品列表 |
| 购物车 | `pages/cart/index` | 商品管理、结算 |
| 个人中心 | `pages/user/index` | 用户信息、订单管理、收藏、反馈 |

### 功能页面

| 页面 | 路径 | 说明 |
|------|------|------|
| 商品列表 | `pages/goods_list/index` | 按分类筛选商品，支持分页加载 |
| 商品详情 | `pages/goods_detail/index` | 商品轮播图、价格、详情、加入购物车 |
| 商品搜索 | `pages/search/index` | 搜索商品 |
| 订单管理 | `pages/order/index` | 查看订单状态 |
| 支付页面 | `pages/pay/index` | 订单支付 |
| 商品收藏 | `pages/collect/index` | 收藏的商品列表 |
| 意见反馈 | `pages/feedback/index` | 用户意见反馈 |
| 登录授权 | `pages/login/index`、`pages/auth/index` | 用户登录与授权 |

## 自定义组件

| 组件 | 路径 | 说明 |
|------|------|------|
| SearchInput | `components/SearchInput/` | 顶部搜索栏组件 |
| Tabs | `components/Tabs/` | 标签页切换组件 |
| UpImg | `components/UpImg/` | 图片上传组件 |

## 项目结构

```
├── app.js                  # 小程序入口
├── app.json                # 全局配置（页面路由、TabBar、窗口样式）
├── app.wxss                # 全局样式
├── project.config.json     # 项目配置文件
├── sitemap.json            # 站点地图
├── components/             # 自定义组件
│   ├── SearchInput/        # 搜索输入框组件
│   ├── Tabs/               # 标签页组件
│   └── UpImg/              # 图片上传组件
├── icons/                  # TabBar 图标资源
├── lib/runtime/            # 运行时库
├── pages/                  # 页面目录
│   ├── index/              # 首页
│   ├── category/           # 分类页
│   ├── cart/               # 购物车
│   ├── goods_list/         # 商品列表
│   ├── goods_detail/       # 商品详情
│   ├── search/             # 搜索页
│   ├── order/              # 订单页
│   ├── pay/                # 支付页
│   ├── collect/            # 收藏页
│   ├── feedback/           # 意见反馈
│   ├── user/               # 个人中心
│   ├── login/              # 登录页
│   └── auth/               # 授权页
├── request/                # 网络请求封装
│   └── index.js            # 统一请求封装（baseUrl、loading、token）
├── styles/                 # 公共样式
│   └── iconfont.wxss       # 图标字体样式
└── utils/                  # 工具函数
    └── asyncWx.js          # 微信 API Promise 化
```

## 接口说明

项目对接后端 API 服务，请求封装在 [request/index.js](request/index.js) 中：

- **baseUrl**：`https://api-hmugo-web.itheima.net/api/public/v1`
- **请求方式**：基于 `wx.request` 的 Promise 封装
- **Loading 控制**：并发请求自动管理 loading 显示/隐藏
- **Token 管理**：私有接口（路径含 `/my/`）自动携带 Authorization header

## 主题配色

- 导航栏背景色：`#eb4450`
- TabBar 选中色：`#ff2d4a`
- 小程序名称：烧饼商品

## 运行方式

1. 克隆项目到本地
2. 使用微信开发者工具打开项目目录
3. 填入 AppID 或使用测试号
4. 编译运行即可预览