/**
 * 旧请求入口（已废弃，保留仅为兼容历史引用）
 *
 * 项目已统一收口到 api/http.js：
 *   import { request, upload } from '../../api/http.js'
 *
 * 该文件不再连接真实后端，仅做转发。
 */
export { request, upload, USE_MOCK, baseUrl, DEFAULT_IMAGE, DEFAULT_AVATAR } from '../api/http.js';
