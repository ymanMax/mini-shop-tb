// pages/address/list.js
// 收货地址列表：管理模式（我的页进入，可增删改）与选择模式（购物车/支付页进入，点选返回）
import { request } from '../../api/http.js';
import regeneratorRuntime from '../../lib/runtime/runtime';
import { toast, toastSuccess, toastError, confirm, vibrate } from '../../utils/toast.js';

/** 标签 -> 胶囊配色类名，WXML 不能调用函数，故在 JS 里预先映射好 */
const TAG_CLASS = {
  家: 'tag-pill--home',
  公司: 'tag-pill--company',
  学校: 'tag-pill--school',
  其他: 'tag-pill--other',
};

/** 左滑最大露出的删除按钮宽度（rpx），与 wxss 中保持一致 */
const MAX_SLIDE = 140;

/** 地址条数上限兜底值，正常以 /address/count 返回的 max 为准 */
const ADDRESS_MAX = 10;

Page({
  data: {
    mode: 'manage', // manage=管理模式 / select=选择模式

    loading: true, // 首屏骨架屏

    list: [],
    // 选择模式下当前选中的地址 id（来自 /address/current），用于主题色高亮
    currentId: 0,

    // 地址数量与上限
    total: 0,
    max: ADDRESS_MAX,
    isFull: false,

    // 左滑状态：slideId 为当前位移的行，slideX 为 rpx 位移量（负值）
    slideId: 0,
    slideX: 0,
  },

  onLoad(options) {
    const mode = options && options.mode === 'select' ? 'select' : 'manage';
    this.setData({ mode });
    wx.setNavigationBarTitle({ title: mode === 'select' ? '选择收货地址' : '收货地址' });

    // 像素 -> rpx 的换算比例，用于把 touchmove 的 px 位移换算成 rpx
    const { windowWidth } = wx.getSystemInfoSync();
    this.rpxRatio = windowWidth / 750 || 0.5;
    this.startX = 0;
    this.startY = 0;
    this.dragging = false;
    this.lastDragTime = 0;

    // onShow 紧接着会触发，首屏骨架屏交给 onShow 处理
    this.firstShow = true;
  },

  // 从编辑页返回时重新拉取，保证新增 / 修改实时体现
  onShow() {
    this.loadList(this.firstShow);
    this.firstShow = false;
  },

  /**
   * 拉取地址列表 + 数量
   * @param {boolean} showSkeleton 是否展示骨架屏（仅首次）
   */
  async loadList(showSkeleton) {
    if (showSkeleton) this.setData({ loading: true });
    try {
      const tasks = [request({ url: '/address/list' }), request({ url: '/address/count' })];
      // 选择模式额外取「本次选中」地址用于高亮
      if (this.data.mode === 'select') tasks.push(request({ url: '/address/current' }).catch(() => null));

      const [list, count, current] = await Promise.all(tasks);
      const total = count && typeof count.total === 'number' ? count.total : (list || []).length;
      const max = (count && count.max) || ADDRESS_MAX;

      const mapped = (Array.isArray(list) ? list : []).map((item) => ({
        ...item,
        tagClass: TAG_CLASS[item.tag] || 'tag-pill--other',
      }));

      this.setData({
        list: mapped,
        currentId: current ? current.id : 0,
        total,
        max,
        isFull: total >= max,
        loading: false,
        // 刷新后收起左滑，避免操作到已不存在的行
        slideId: 0,
        slideX: 0,
      });
    } catch (e) {
      // 接口失败：toast + 空态，不能白屏
      toastError('地址加载失败');
      this.setData({ list: [], loading: false, isFull: false, slideId: 0, slideX: 0 });
    }
  },

  // ---------- 点击行为 ----------
  /** 点击地址卡片：选择模式下选中并返回；管理模式下仅收起左滑 */
  async handleCardTap(e) {
    // 刚拖动过忽略这次 tap，避免展开立即被收起
    if (Date.now() - this.lastDragTime < 300) return;

    if (this.data.mode !== 'select') {
      if (this.data.slideId) this.setData({ slideId: 0, slideX: 0 });
      return;
    }

    const { id } = e.currentTarget.dataset;
    try {
      await request({ url: '/address/select', method: 'POST', data: { id } });
      toastSuccess('地址已选择');
      // 留一点时间展示 toast，再返回让上一页 onShow 回填
      setTimeout(() => wx.navigateBack(), 600);
    } catch (err) {
      toastError((err && err.message) || '选择失败');
    }
  },

  /** 跳编辑页 */
  handleEdit(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/address/edit?id=${id}` });
  },

  /** 设为默认 */
  async handleSetDefault(e) {
    const { id } = e.currentTarget.dataset;
    try {
      await request({ url: '/address/setDefault', method: 'POST', data: { id } });
      toastSuccess('已设为默认地址');
      await this.loadList(false);
    } catch (err) {
      toastError((err && err.message) || '设置失败');
    }
  },

  /** 删除：二次确认后调接口，默认地址会被接口拒绝（code 400） */
  async handleDelete(e) {
    const { id } = e.currentTarget.dataset;
    const ok = await confirm({ content: '确定要删除这条收货地址吗？' });
    if (!ok) return;
    try {
      await request({ url: '/address/remove', method: 'POST', data: { id } });
      toastSuccess('已删除');
      await this.loadList(false);
    } catch (err) {
      // 默认地址不可删除，接口返回 code 400，这里透出后端的明确提示
      toastError((err && err.message) || '删除失败');
    }
  },

  /** 新增地址；已达上限时置灰并提示 */
  handleAdd() {
    if (this.data.isFull) {
      toast(`最多只能保存 ${this.data.max} 条地址`);
      return;
    }
    wx.navigateTo({ url: '/pages/address/edit' });
  },

  // ---------- 左滑交互（仅管理模式生效） ----------
  handleTouchStart(e) {
    if (this.data.mode !== 'manage') return;
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
    if (this.data.mode !== 'manage') return;
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
    if (this.data.mode !== 'manage') return;
    const { id } = e.currentTarget.dataset;
    if (id !== this.data.slideId) return;
    // 超过一半则保持展开，否则回弹
    const open = this.data.slideX < -MAX_SLIDE / 2;
    this.setData({ slideId: open ? id : 0, slideX: open ? -MAX_SLIDE : 0 });
    if (this.dragging) vibrate();
    this.dragging = false;
  },
});
