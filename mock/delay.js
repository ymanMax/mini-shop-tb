/**
 * Mock 网络延迟模拟
 * 统一 200~600ms 随机延迟，配合页面的 loading 态与骨架屏
 */

/** 随机延迟毫秒数：200 ~ 600 */
export const randomDelay = () => 200 + Math.floor(Math.random() * 400);

/**
 * 等待一段时间
 * @param {number} [ms] 不传则使用 200~600ms 随机值
 */
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms === undefined ? randomDelay() : ms));

export default delay;
