/**
 * Mock 用户与收货地址数据
 * 由 Mock 数据体系统一维护，字段结构与 `三、核心数据模型定义` 保持一致
 */
export const user = {
  "id": 10001,
  "nickName": "烧饼爱好者",
  "avatar": "/static/images/default-avatar.png",
  "phone": "138****8888",
  "memberLevel": "黄金会员",
  "points": 1280,
  "coupons": 3,
  "balance": 268.5
}

export const address = {
  "id": 1,
  "userName": "张小烧",
  "telNumber": "13888888888",
  "provinceName": "浙江省",
  "cityName": "杭州市",
  "countyName": "西湖区",
  "detailInfo": "文三路 478 号华星时代广场 A 座 1802 室",
  "all": "浙江省杭州市西湖区文三路 478 号华星时代广场 A 座 1802 室",
  "tag": "家",
  "isDefault": true
}

export const addressList = [
  {
    "id": 1,
    "userName": "张小烧",
    "telNumber": "13888888888",
    "provinceName": "浙江省",
    "cityName": "杭州市",
    "countyName": "西湖区",
    "detailInfo": "文三路 478 号华星时代广场 A 座 1802 室",
    "all": "浙江省杭州市西湖区文三路 478 号华星时代广场 A 座 1802 室",
    "tag": "家",
    "isDefault": true
  },
  {
    "id": 2,
    "userName": "张小烧",
    "telNumber": "13999999999",
    "provinceName": "江苏省",
    "cityName": "苏州市",
    "countyName": "姑苏区",
    "detailInfo": "观前街 128 号 3 单元 602 室",
    "all": "江苏省苏州市姑苏区观前街 128 号 3 单元 602 室",
    "tag": "家",
    "isDefault": false
  },
  {
    "id": 3,
    "userName": "李小花",
    "telNumber": "13777777777",
    "provinceName": "上海市",
    "cityName": "上海市",
    "countyName": "浦东新区",
    "detailInfo": "张江高科技园区博云路 2 号 5 楼",
    "all": "上海市上海市浦东新区张江高科技园区博云路 2 号 5 楼",
    "tag": "公司",
    "isDefault": false
  },
  {
    "id": 4,
    "userName": "王大力",
    "telNumber": "13666666666",
    "provinceName": "北京市",
    "cityName": "北京市",
    "countyName": "海淀区",
    "detailInfo": "中关村大街 1 号院 5 号楼 302 室",
    "all": "北京市北京市海淀区中关村大街 1 号院 5 号楼 302 室",
    "tag": "学校",
    "isDefault": false
  },
  {
    "id": 5,
    "userName": "陈小满",
    "telNumber": "13555555555",
    "provinceName": "广东省",
    "cityName": "深圳市",
    "countyName": "南山区",
    "detailInfo": "科技园南区深南大道 9988 号腾讯大厦 20 楼",
    "all": "广东省深圳市南山区科技园南区深南大道 9988 号腾讯大厦 20 楼",
    "tag": "其他",
    "isDefault": false
  }
]

export default user
