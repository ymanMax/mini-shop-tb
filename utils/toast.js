// 统一 Toast 封装：success / error / loading

export const toastSuccess = (title = '操作成功') => {
  wx.showToast({ title, icon: 'success', mask: true, duration: 1800 })
}

export const toastError = (title = '操作失败') => {
  wx.showToast({ title, icon: 'none', mask: true, duration: 2000 })
}

export const toastInfo = (title = '') => {
  wx.showToast({ title, icon: 'none', mask: true, duration: 2000 })
}

export const showLoading = (title = '加载中') => {
  wx.showLoading({ title, mask: true })
}

export const hideLoading = () => {
  wx.hideLoading()
}

// 二次确认弹窗（Promise）
export const confirm = (content, title = '提示') => {
  return new Promise((resolve) => {
    wx.showModal({
      title,
      content,
      confirmText: '确定',
      cancelText: '取消',
      success: (res) => resolve(!!res.confirm),
      fail: () => resolve(false)
    })
  })
}
