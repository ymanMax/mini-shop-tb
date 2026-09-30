// components/SearchInput/SearchInput.js
// 首页 / 商品列表 / 意见反馈 共用的搜索入口条（点击进入搜索页）
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 占位文案
    placeholder: {
      type: String,
      value: '搜索商品',
    },
    // 点击后跳转的地址
    url: {
      type: String,
      value: '/pages/search/index',
    },
    // 是否展示右侧「搜索」按钮
    showButton: {
      type: Boolean,
      value: true,
    },
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    handleTap() {
      this.triggerEvent('search');
    },
  },
});
