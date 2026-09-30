// Toast 统一封装：成功 / 失败 / 加载
export function success(title = '操作成功') {
  wx.showToast({ title, icon: 'success', mask: true })
}

export function fail(title = '操作失败') {
  wx.showToast({ title, icon: 'none', mask: true })
}

export function loading(title = '加载中') {
  wx.showLoading({ title, mask: true })
}

export function hideLoading() {
  wx.hideLoading()
}

// 二次确认
export function confirm(content, title = '提示') {
  return new Promise(resolve => {
    wx.showModal({
      title,
      content,
      success: (res) => resolve(res.confirm),
      fail: () => resolve(false)
    })
  })
}
