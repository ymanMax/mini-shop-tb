/**
 * 统一请求入口
 *
 * 后端服务未启动，项目默认走 Mock：USE_MOCK = true 时匹配 mock/index.js 路由表。
 * 后续联调真实后端只需把 USE_MOCK 改为 false 并切换 baseUrl，页面代码无需改动。
 *
 * 约定：
 * - Mock / 后端统一返回 { code, data, msg }
 * - request() 校验 code 后把 data 直接 resolve 出去，页面拿到的就是业务数据
 * - code !== 200 时 reject 一个 Error，页面可统一 catch 后 toast
 */
import { mockRequest, mockUpload } from '../mock/index.js';
import { showLoading, hideLoading } from '../utils/toast.js';

/** Mock 开关：联调真实后端时改为 false */
export const USE_MOCK = true;

/** 真实后端基地址（USE_MOCK 为 false 时生效） */
export const baseUrl = 'https://api-hmugo-web.itheima.net/api/public/v1';

/** 并发请求计数，用于自动收口 loading */
let ajaxTimes = 0;

const startLoading = (title) => {
  ajaxTimes += 1;
  if (ajaxTimes === 1) showLoading(title);
};

const stopLoading = () => {
  ajaxTimes = Math.max(0, ajaxTimes - 1);
  if (ajaxTimes === 0) hideLoading();
};

/**
 * 发起请求
 * @param {object} options
 * @param {string} options.url        接口路径，如 '/goods/detail'
 * @param {string} [options.method]   请求方法，默认 GET
 * @param {object} [options.data]     请求参数
 * @param {object} [options.header]   额外请求头
 * @param {boolean} [options.loading] 是否展示全局 loading，默认 false（页面用骨架屏）
 * @param {string} [options.loadingTitle]
 * @returns {Promise<any>} resolve 业务数据 data
 */
export const request = (options = {}) => {
  const { url, method = 'GET', data = {}, header = {}, loading = false, loadingTitle = '加载中' } = options;

  if (loading) startLoading(loadingTitle);

  const done = () => {
    if (loading) stopLoading();
  };

  if (USE_MOCK) {
    return mockRequest({ url, method, data }).then((res) => {
      done();
      if (!res || res.code !== 200) {
        const err = new Error((res && res.msg) || '请求失败');
        err.code = res && res.code;
        throw err;
      }
      return res.data;
    }, (err) => {
      done();
      throw err;
    });
  }

  // ---- 真实后端分支 ----
  const finalHeader = { ...header };
  if (String(url).includes('/my/')) {
    finalHeader.Authorization = wx.getStorageSync('token');
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + url,
      method,
      data,
      header: finalHeader,
      success: (res) => {
        const body = res.data || {};
        if (body.code === 200 || res.statusCode === 200) {
          resolve(body.data !== undefined ? body.data : body.message);
        } else {
          const err = new Error(body.msg || `请求失败(${res.statusCode})`);
          err.code = body.code;
          reject(err);
        }
      },
      fail: (err) => reject(err),
      complete: done,
    });
  });
};

/**
 * 上传文件（评价晒图）
 * Mock 模式下直接返回本地临时路径，模拟上传成功
 * @param {object} options
 * @param {string} options.filePath 本地临时文件路径
 * @param {string} [options.name]   文件字段名
 * @returns {Promise<{url: string}>}
 */
export const upload = (options = {}) => {
  const { filePath, name = 'file', loading = false, loadingTitle = '上传中' } = options;

  if (loading) startLoading(loadingTitle);

  const done = () => {
    if (loading) stopLoading();
  };

  if (USE_MOCK) {
    return mockUpload({ filePath, name }).then((res) => {
      done();
      if (!res || res.code !== 200) throw new Error((res && res.msg) || '上传失败');
      return res.data;
    }, (err) => {
      done();
      throw err;
    });
  }

  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: `${baseUrl}/upload`,
      filePath,
      name,
      header: { Authorization: wx.getStorageSync('token') },
      success: (res) => {
        try {
          const body = JSON.parse(res.data);
          if (body.code === 200) resolve(body.data);
          else reject(new Error(body.msg || '上传失败'));
        } catch (e) {
          reject(e);
        }
      },
      fail: (err) => reject(err),
      complete: done,
    });
  });
};

/** 图片地址兜底：空地址统一回退到本地默认图 */
export const DEFAULT_IMAGE = '/static/images/default.png';
export const DEFAULT_AVATAR = '/static/images/default-avatar.png';

export default { request, upload, USE_MOCK, baseUrl, DEFAULT_IMAGE, DEFAULT_AVATAR };
