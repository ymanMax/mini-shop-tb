// 页面通用行为：图片错误兜底、购物车角标刷新
import { request } from '../api/http.js'
import regeneratorRuntime from '../lib/runtime/runtime.js'

export default Behavior({
  data: {
    defaultImg: '/static/images/default.png',
    defaultAvatar: '/static/images/default-avatar.png'
  },
  methods: {
    // 图片加载失败兜底，支持三种用法：
    //  1. 单图：data-key="fieldName"（data 顶层字段）
    //  2. 对象数组：data-list="goodsList" data-idx="{{index}}" data-field="mainPic"
    //  3. 任意嵌套：data-path="reviews[0].images[2]"（setData 路径）
    handleImgError(e) {
      const { idx, list, field, key, path } = e.currentTarget.dataset
      if (path) {
        this.setData({ [path]: '/static/images/default.png' })
        return
      }
      if (idx !== undefined && list) {
        const arr = this.data[list]
        if (arr && arr[idx] !== undefined) {
          if (field) arr[idx][field] = '/static/images/default.png'
          else arr[idx] = '/static/images/default.png'
          this.setData({ [list]: arr })
        }
        return
      }
      if (key) {
        this.setData({ [key]: '/static/images/default.png' })
      }
    },
    // 刷新全局购物车角标
    refreshCartBadge() {
      const app = getApp()
      if (app && app.refreshCartCount) app.refreshCartCount()
    },
    // 加入购物车通用处理
    async addToCartApi(opts) {
      const res = await request({ url: '/cart/add', method: 'POST', data: opts })
      this.refreshCartBadge()
      return res
    }
  }
})
