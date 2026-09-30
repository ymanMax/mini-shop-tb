// pages/order/review.js
// 订单评价页：一个订单可含多个商品，每个商品独立一个评价块（星级 / 标签 / 文字 / 晒图）
import { request, upload, DEFAULT_IMAGE } from '../../api/http.js';
import { toast, toastSuccess, toastError, showLoading, hideLoading, vibrate } from '../../utils/toast.js';
import { syncCartBadge } from '../../utils/cart.js';
import regeneratorRuntime from '../../lib/runtime/runtime';

/** 星级对应文案，索引即星级 */
const RATING_TEXT = { 1: '非常差', 2: '差', 3: '一般', 4: '满意', 5: '非常满意' };

/** 快捷评价标签 */
const TAG_OPTIONS = ['新鲜美味', '分量足', '包装好', '物流快', '性价比高', '口感好'];

/** 晒图上限 */
const MAX_IMAGES = 6;

/** 每个商品评价块的初始结构，避免多处重复字面量 */
const createBlock = (item) => ({
  goodsId: item.goodsId,
  name: item.name,
  mainPic: item.mainPic || DEFAULT_IMAGE,
  specText: item.specText || '默认规格',
  rating: 5,
  ratingText: RATING_TEXT[5],
  tags: TAG_OPTIONS.map((label) => ({ label, selected: false })),
  content: '',
  contentLength: 0,
  images: [],
});

Page({
  data: {
    // loading(骨架) / ready(可评价) / empty(订单不存在) / reviewed(已评价)
    loadState: 'loading',
    orderId: 0,
    orderNo: '',
    items: [],
    stars: [1, 2, 3, 4, 5],
    submitting: false,
  },

  onLoad(options) {
    const orderId = options && options.orderId ? Number(options.orderId) : 0;
    this.setData({ orderId });
    this.loadOrder();
  },

  onShow() {
    syncCartBadge();
  },

  /** 拉取订单详情并铺平为评价块 */
  async loadOrder() {
    const { orderId } = this.data;
    if (!orderId) {
      this.setData({ loadState: 'empty' });
      return;
    }
    try {
      const order = await request({ url: '/orders/detail', data: { orderId } });
      if (!order) {
        this.setData({ loadState: 'empty' });
        return;
      }
      // 已评价订单不再允许二次提交
      if (order.isReviewed) {
        this.setData({ loadState: 'reviewed', orderNo: order.orderNo });
        return;
      }
      const items = (order.items || []).map(createBlock);
      this.setData({ loadState: 'ready', orderNo: order.orderNo, items });
    } catch (e) {
      this.setData({ loadState: 'empty' });
    }
  },

  /** 选星：轻震动 + 文案联动 */
  handleStarTap(e) {
    const { itemIndex, star } = e.currentTarget.dataset;
    const rating = Number(star);
    vibrate();
    this.setData({
      [`items[${itemIndex}].rating`]: rating,
      [`items[${itemIndex}].ratingText`]: RATING_TEXT[rating],
    });
  },

  /** 标签多选：按索引取反，避免 WXML 里调用 indexOf */
  handleTagTap(e) {
    const { itemIndex, tagIndex } = e.currentTarget.dataset;
    const path = `items[${itemIndex}].tags[${tagIndex}].selected`;
    this.setData({ [path]: !this.data.items[itemIndex].tags[tagIndex].selected });
  },

  /** 文字评价输入 */
  handleContentInput(e) {
    const { itemIndex } = e.currentTarget.dataset;
    const value = e.detail.value || '';
    this.setData({
      [`items[${itemIndex}].content`]: value,
      [`items[${itemIndex}].contentLength`]: value.length,
    });
  },

  /** 晒图：选图后先占位并显示 loading，再逐个上传 */
  handleChooseImage(e) {
    const { itemIndex } = e.currentTarget.dataset;
    const current = this.data.items[itemIndex].images;
    const remain = MAX_IMAGES - current.length;
    if (remain <= 0) return;

    wx.chooseImage({
      count: remain,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (result) => {
        const paths = result.tempFilePaths || [];
        if (!paths.length) return;
        const startAt = this.data.items[itemIndex].images.length;
        // 占位图先入列，上传完成后再替换为服务端返回地址
        const placeholders = paths.map((url, i) => ({ key: `${Date.now()}-${startAt}-${i}`, url, uploading: true }));
        this.setData({ [`items[${itemIndex}].images`]: [...current, ...placeholders] });

        placeholders.forEach((img, i) => {
          const slot = startAt + i;
          upload({ filePath: img.url })
            .then((res) => {
              this.setData({
                [`items[${itemIndex}].images[${slot}].url`]: (res && res.url) || img.url,
                [`items[${itemIndex}].images[${slot}].uploading`]: false,
              });
            })
            .catch(() => {
              this.setData({ [`items[${itemIndex}].images[${slot}].uploading`]: false });
              toastError('图片上传失败');
            });
        });
      },
    });
  },

  /** 删除某张晒图 */
  handleRemoveImage(e) {
    const { itemIndex, imgIndex } = e.currentTarget.dataset;
    const images = this.data.items[itemIndex].images.slice();
    images.splice(imgIndex, 1);
    this.setData({ [`items[${itemIndex}].images`]: images });
  },

  /** 商品图兜底 */
  handleGoodsImageError(e) {
    const { itemIndex } = e.currentTarget.dataset;
    this.setData({ [`items[${itemIndex}].mainPic`]: DEFAULT_IMAGE });
  },

  /** 用户晒图兜底（本地临时路径异常时也回退默认图） */
  handleReviewImageError(e) {
    const { itemIndex, imgIndex } = e.currentTarget.dataset;
    this.setData({ [`items[${itemIndex}].images[${imgIndex}].url`]: DEFAULT_IMAGE });
  },

  /** 提交评价 */
  async handleSubmit() {
    if (this.data.submitting) return;
    const { items, orderId } = this.data;

    // 星级校验：默认 5 星，理论上不会为 0，兜底防止被清空
    for (let i = 0; i < items.length; i++) {
      if (!items[i].rating) {
        toast(`请为「${items[i].name}」选择星级`);
        return;
      }
      if (items[i].images.some((img) => img.uploading)) {
        toast('图片上传中，请稍候');
        return;
      }
    }

    const reviews = items.map((it) => ({
      goodsId: it.goodsId,
      rating: it.rating,
      content: it.content,
      images: it.images.map((img) => img.url),
      tags: it.tags.filter((t) => t.selected).map((t) => t.label),
      specText: it.specText,
    }));

    this.setData({ submitting: true });
    showLoading('提交中');
    try {
      const res = await request({
        url: '/reviews/submit',
        method: 'POST',
        data: { orderId, reviews },
      });
      hideLoading();
      toastSuccess('评价成功');
      const points = (res && res.points) || 20;
      setTimeout(() => toast(`获得 ${points} 积分`), 800);
      setTimeout(() => wx.navigateBack({ delta: 1 }), 2100);
    } catch (e) {
      hideLoading();
      toastError((e && e.message) || '评价失败');
      this.setData({ submitting: false });
    }
  },

  /** 空态 / 已评价态的返回：无返回栈时兜底回首页 */
  handleBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => wx.switchTab({ url: '/pages/index/index' }),
    });
  },
});
