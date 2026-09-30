// components/UpImg/Upimg.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    src: {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 图片加载失败时回退到本地占位图，避免出现灰色裂图
    handleError() {
      this.setData({ src: '/static/images/default.png' });
    },
  },
})
