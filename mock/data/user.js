// Mock 用户数据 + 收货地址（含省市区、标签、默认）
export const mockUser = {
  id: 10001,
  nickName: '烧饼爱好者',
  avatar: '/static/images/default-avatar.png',
  phone: '138****8888',
  balance: 268.50,
  points: 1280,
  level: '黄金会员',
  coupons: 5,
  joinDate: '2023-06-18'
}

// 预置收货地址（5 条，含 1 条默认，覆盖 家/学校/公司/其他 标签）
// region 为拼接展示串，province/city/district 供 region 选择器回填
export const mockAddresses = [
  {
    id: 1,
    name: '王大饼',
    phone: '13888888888',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    region: '北京市 北京市 朝阳区',
    detail: '望京街道烧饼胡同 12 号院 3 号楼 502',
    tag: '家',
    isDefault: true
  },
  {
    id: 2,
    name: '王大饼',
    phone: '13888888888',
    province: '上海市',
    city: '上海市',
    district: '浦东新区',
    region: '上海市 上海市 浦东新区',
    detail: '张江高科技园区 科苑路 88 号 创富大厦 18 层',
    tag: '公司',
    isDefault: false
  },
  {
    id: 3,
    name: '李酥饼',
    phone: '13966666666',
    province: '广东省',
    city: '广州市',
    district: '天河区',
    region: '广东省 广州市 天河区',
    detail: '天河路 385 号 太古汇一座 2206 室',
    tag: '学校',
    isDefault: false
  },
  {
    id: 4,
    name: '王大饼',
    phone: '13888888888',
    province: '河北省',
    city: '石家庄市',
    district: '长安区',
    region: '河北省 石家庄市 长安区',
    detail: '建设南大街 88 号 传统烧饼铺宿舍 2 单元 401',
    tag: '其他',
    isDefault: false
  },
  {
    id: 5,
    name: '张芝麻',
    phone: '13777777777',
    province: '北京市',
    city: '北京市',
    district: '海淀区',
    region: '北京市 北京市 海淀区',
    detail: '中关村大街 27 号 中关村大厦 1508 室',
    tag: '公司',
    isDefault: false
  }
]
