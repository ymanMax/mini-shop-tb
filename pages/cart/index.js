// pages/cart/index.js
// 购物车：全部读写走 api 层（mock 层负责 storage 持久化），页面只做展示与交互编排
import { request } from '../../api/http.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
import { formatPrice } from '../../utils/format.js';
import { toast, toastSuccess, toastError, confirm, vibrate } from '../../utils/toast.js';
import { syncCartBadge } from '../../utils/cart.js';

/** 商品图本地兜底，杜绝灰色裂图 */
const DEFAULT_IMAGE = '/static/images/default.png';

/** 左滑最大露出的删除按钮宽度（rpx），与 wxss 中保持一致 */
const MAX_SLIDE = 140;

/** 判断购物车项是否失效：invalid 标记或库存为 0 */
const isInvalidItem = (item) => !!item.invalid || Number(item.stock) === 0;

Page({
  data: {
    loading: true, // 首屏骨架屏

    // 收货地址
    address: {},
    hasAddress: false,

    // 有效 / 失效商品
    list: [],
    invalidList: [],
    hasValid: false,

    // 结算数据（金额、件数均在 JS 里预格式化，WXML 不能调用函数）
    checkedCount: 0,
    checkedCountText: '0',
    checkedAmountText: '0.00',
    allChecked: false,

    // 满减 mock 规则，active 标记当前已达成的那一档
    discountTiers: [
      { threshold: 50, text: '满 50 元减 5 元', active: false },
      { threshold: 100, text: '满 100 元减 15 元', active: false },
    ],

    // 左滑状态：slideId 为当前位移的行，slideX 为 rpx 位移量（负值）
    slideId: 0,
    slideX: 0,

    // 猜你喜欢
    recommendList: [],
  },

  onLoad() {
    // 像素 -> rpx 的换算比例，用于把 touchmove 的 px 位移换算成 rpx
    const { windowWidth } = wx.getSystemInfoSync();
    this.rpxRatio = windowWidth / 750 || 0.5;
    this.startX = 0;
    this.startY = 0;
    this.dragging = false;
    this.lastDragTime = 0;
  },

  // 每次显示都重新拉取：从支付页返回后要能看到已清空 / 数量变化
  async onShow() {
    await Promise.all([this.loadAddress(), this.loadCart()]);
    this.loadRecommend();
    syncCartBadge();
  },

  /** 读取结算地址：优先「本次选中」，否则默认地址 */
  async loadAddress() {
    try {
      const address = await request({ url: '/address/current' });
      const hasAddress = !!(address && address.userName);
      this.setData({ address: hasAddress ? address : {}, hasAddress });
    } catch (e) {
      // 地址失败不影响购物车主体展示，降级为「+ 请添加收货地址」
      this.setData({ address: {}, hasAddress: false });
    }
  },

  /** 点击地址区：跳地址列表选择模式，返回后由 onShow 回填 */
  handleGoAddress() {
    wx.navigateTo({ url: '/pages/address/list?mode=select' });
  },

  /**
   * 拉取购物车
   * @param {boolean} showSkeleton 是否展示骨架屏（仅首次）
   */
  async loadCart() {
    try {
      const res = (await request({ url: '/cart/list' })) || {};
      const rawList = Array.isArray(res.list) ? res.list : [];
      const rawInvalid = Array.isArray(res.invalidList) ? res.invalidList : [];

      // 二次兜底拆分：库存为 0 也视为失效
      const valid = rawList.filter((v) => !isInvalidItem(v));
      const invalid = rawInvalid.concat(rawList.filter((v) => isInvalidItem(v)));

      const list = valid.map((v) => ({ ...v, priceText: formatPrice(v.price) }));
      const invalidList = invalid.map((v) => ({ ...v, priceText: formatPrice(v.price) }));

      // 结算数据本地重算，避免与接口字段不一致
      let checkedCount = 0;
      let checkedAmount = 0;
      valid.forEach((v) => {
        if (v.checked) {
          checkedCount += v.count || 0;
          checkedAmount += (Number(v.price) || 0) * (v.count || 0);
        }
      });
      checkedAmount = Math.round(checkedAmount * 100) / 100;

      // 只高亮已达成档位中门槛最高的一档
      let activeThreshold = 0;
      this.data.discountTiers.forEach((t) => {
        if (checkedAmount >= t.threshold) activeThreshold = Math.max(activeThreshold, t.threshold);
      });
      const discountTiers = this.data.discountTiers.map((t) => ({
        ...t,
        active: t.threshold === activeThreshold && activeThreshold > 0,
      }));

      this.setData({
        list,
        invalidList,
        hasValid: list.length > 0,
        allChecked: list.length > 0 && list.every((v) => v.checked),
        checkedCount,
        checkedCountText: String(checkedCount),
        checkedAmountText: formatPrice(checkedAmount),
        discountTiers,
        loading: false,
        // 刷新后收起所有左滑，避免操作到已不存在的行
        slideId: 0,
        slideX: 0,
      });
    } catch (e) {
      // 接口失败：toast + 空态，不能白屏
      toastError('购物车加载失败');
      this.setData({
        list: [],
        invalidList: [],
        hasValid: false,
        allChecked: false,
        checkedCount: 0,
        checkedCountText: '0',
        checkedAmountText: '0.00',
        loading: false,
      });
    } finally {
      syncCartBadge();
    }
  },

  /** 猜你喜欢：以首个购物车商品的 goodsId 取同类推荐，空车固定 1001 */
  async loadRecommend() {
    const first = this.data.list[0];
    const goodsId = first ? first.goodsId : 1001;
    try {
      const list = await request({ url: '/goods/recommend', data: { goodsId, limit: 6 } });
      const recommendList = (Array.isArray(list) ? list : []).map((v) => ({
        ...v,
        priceText: formatPrice(v.price),
      }));
      this.setData({ recommendList });
    } catch (e) {
      // 推荐失败不阻断主流程
      this.setData({ recommendList: [] });
    }
  },

  // ---------- 图片兜底 ----------
  handleImageError(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`list[${index}].mainPic`]: DEFAULT_IMAGE });
  },

  handleInvalidImageError(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`invalidList[${index}].mainPic`]: DEFAULT_IMAGE });
  },

  handleRecommendImageError(e) {
    const { index } = e.currentTarget.dataset;
    this.setData({ [`recommendList[${index}].mainPic`]: DEFAULT_IMAGE });
  },

  // ---------- 勾选 ----------
  /** 单选：切换后调 /cart/checked，再刷新列表 */
  async handleCheckItem(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.list.find((v) => v.id === id);
    if (!item) return;
    try {
      await request({ url: '/cart/checked', method: 'POST', data: { ids: [id], checked: !item.checked } });
      await this.loadCart();
    } catch (err) {
      toastError('操作失败');
    }
  },

  /** 全选：只作用于有效商品 */
  async handleAllCheck() {
    const target = !this.data.allChecked;
    try {
      await request({ url: '/cart/checked', method: 'POST', data: { checked: target, all: true } });
      await this.loadCart();
    } catch (err) {
      toastError('操作失败');
    }
  },

  // ---------- 数量增减 ----------
  async handleDecrease(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.list.find((v) => v.id === id);
    if (!item) return;
    // 减到 1 再减 => 二次确认删除
    if (item.count <= 1) {
      const ok = await confirm({ content: '确定要删除这件商品吗？' });
      if (!ok) return;
      await this.removeItems([id]);
      return;
    }
    await this.updateItem(id, { count: item.count - 1 });
  },

  async handleIncrease(e) {
    const { id } = e.currentTarget.dataset;
    const item = this.data.list.find((v) => v.id === id);
    if (!item) return;
    if (item.count >= item.stock) {
      toastError('库存不足');
      return;
    }
    await this.updateItem(id, { count: item.count + 1 });
  },

  /** 更新数量并刷新 */
  async updateItem(id, payload) {
    try {
      await request({ url: '/cart/update', method: 'POST', data: { id, ...payload } });
      await this.loadCart();
    } catch (err) {
      toastError('修改失败');
    }
  },

  /** 删除若干项 */
  async removeItems(ids) {
    try {
      await request({ url: '/cart/remove', method: 'POST', data: { ids } });
      await this.loadCart();
    } catch (err) {
      toastError('删除失败');
    }
  },

  /** 左滑删除按钮 */
  async handleRemove(e) {
    const { id } = e.currentTarget.dataset;
    await this.removeItems([id]);
    toastSuccess('已删除');
  },

  /** 清空失效商品：二次确认 */
  async handleClearInvalid() {
    const ok = await confirm({ content: '确定清空所有失效商品吗？' });
    if (!ok) return;
    try {
      await request({ url: '/cart/clearInvalid', method: 'POST' });
      await this.loadCart();
      toastSuccess('已清空');
    } catch (err) {
      toastError('清空失败');
    }
  },

  // ---------- 左滑交互 ----------
  handleTouchStart(e) {
    const touch = e.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    this.dragging = false;
    const { id } = e.currentTarget.dataset;
    // 滑动时若已有其他行展开，先收起
    if (this.data.slideId && this.data.slideId !== id) {
      this.setData({ slideId: 0, slideX: 0 });
    }
  },

  handleTouchMove(e) {
    const touch = e.touches[0];
    const dx = touch.clientX - this.startX;
    const dy = touch.clientY - this.startY;
    // 纵向滑动优先，交给页面滚动
    if (Math.abs(dx) < Math.abs(dy)) return;
    if (!this.dragging && Math.abs(dx) < 6) return;
    this.dragging = true;
    this.lastDragTime = Date.now();

    const { id } = e.currentTarget.dataset;
    // px -> rpx，限制在 [-MAX_SLIDE, 0]
    let slideX = dx / this.rpxRatio;
    if (slideX > 0) slideX = 0;
    if (slideX < -MAX_SLIDE) slideX = -MAX_SLIDE;
    this.setData({ slideId: id, slideX });
  },

  handleTouchEnd(e) {
    const { id } = e.currentTarget.dataset;
    if (id !== this.data.slideId) return;
    // 超过一半则保持展开，否则回弹
    const open = this.data.slideX < -MAX_SLIDE / 2;
    this.setData({ slideId: open ? id : 0, slideX: open ? -MAX_SLIDE : 0 });
    if (this.dragging) vibrate();
    this.dragging = false;
  },

  /** 点击行内其他区域：收起左滑 */
  handleRowTap() {
    // 刚拖动过忽略这次 tap，避免展开立即被收起
    if (Date.now() - this.lastDragTime < 300) return;
    if (this.data.slideId) this.setData({ slideId: 0, slideX: 0 });
  },

  // ---------- 结算 / 跳转 ----------
  handleGoCheckout() {
    if (this.data.checkedCount === 0) {
      toast('请选择要购买的商品');
      return;
    }
    wx.navigateTo({ url: '/pages/pay/index' });
  },

  handleGoHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  handleGoGoods(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/goods_detail/index?goods_id=${id}` });
  },
});
