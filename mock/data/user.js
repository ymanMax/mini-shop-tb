// Mock 用户数据
export const mockUser = {
  id: 10001,
  nickName: '烧饼爱好者',
  avatar: '/static/images/default-avatar.png',
  phone: '138****8888',
  points: 268,
  level: '黄金会员',
  coupons: 3
}

// 初始收货地址（4-5 条，含 1 条默认）
export const initialAddresses = [
  {
    id: 'a1',
    name: '王小明',
    phone: '13812345678',
    province: '河北省',
    city: '石家庄市',
    district: '长安区',
    detail: '建设北大街 88 号 烧饼小区 3 号楼 2 单元 501',
    tag: '家',
    isDefault: true
  },
  {
    id: 'a2',
    name: '王小明',
    phone: '13812345678',
    province: '河北省',
    city: '石家庄市',
    district: '桥西区',
    detail: '裕华西路 120 号 翰林广场 A 座 1508 室',
    tag: '公司',
    isDefault: false
  },
  {
    id: 'a3',
    name: '王大力',
    phone: '13998765432',
    province: '河北省',
    city: '保定市',
    district: '莲池区',
    detail: '五四东路 399 号 河北大学家属院 12 号楼 3 门 402',
    tag: '学校',
    isDefault: false
  },
  {
    id: 'a4',
    name: '王小明',
    phone: '13655556666',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    detail: '望京 SOHO T3 座 2206 室',
    tag: '其他',
    isDefault: false
  },
  {
    id: 'a5',
    name: '李奶奶',
    phone: '13766667777',
    province: '河北省',
    city: '石家庄市',
    district: '新华区',
    detail: '革新街 15 号 幸福里小区 5 号楼 1 单元 101',
    tag: '家',
    isDefault: false
  }
]
