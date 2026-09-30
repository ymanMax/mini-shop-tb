// Toast 统一封装
export const toast = {
  success: (title = '操作成功') => {
    wx.showToast({ title, icon: 'success', mask: true })
  },
  error: (title = '操作失败') => {
    wx.showToast({ title, icon: 'none', mask: true })
  },
  info: (title) => {
    wx.showToast({ title, icon: 'none', mask: true })
  },
  loading: (title = '加载中') => {
    wx.showLoading({ title, mask: true })
  },
  hideLoading: () => {
    wx.hideLoading()
  }
}

// 二次确认
export const confirm = (content, title = '提示') => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmColor: '#eb4450',
      success: (res) => resolve(res.confirm),
      fail: () => resolve(false)
    })
  })
}
