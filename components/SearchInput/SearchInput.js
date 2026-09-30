// components/SearchInput/SearchInput.js
Component({
  properties: {
    placeholder: {
      type: String,
      value: '搜索烧饼、糕点、零食…'
    },
    keyword: {
      type: String,
      value: ''
    }
  },
  methods: {
    goSearch() {
      const url = '/pages/search/index' + (this.data.keyword ? '?keyword=' + encodeURIComponent(this.data.keyword) : '')
      wx.navigateTo({ url })
    }
  }
})
