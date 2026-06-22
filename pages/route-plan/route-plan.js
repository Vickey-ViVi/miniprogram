const api = require('../../utils/api');

const markShopsSelected = (shops, selected) => {
  const ids = selected.map((s) => String(s.id));
  return shops.map((s) => ({
    ...s,
    selected: ids.includes(String(s.id))
  }));
};

Page({
  data: {
    mode: 'select',
    selectedShops: [],
    allShops: [],
    naturalInput: '',
    timeLimit: 120,
    hasStroller: false,
    hasWheelchair: false,
    routeResult: null,
    loading: false
  },

  onLoad(options) {
    this.fetchShops(options.shopIds);
  },

  fetchShops(shopIdsStr) {
    this.setData({ loading: true });
    api.getShopsList().then((data) => {
      const shops = Array.isArray(data) ? data : (data.list || []);
      let selected = [];
      if (shopIdsStr) {
        const ids = shopIdsStr.split(',').map(String);
        selected = shops.filter((s) => ids.includes(String(s.id)));
      }
      this.setData({
        allShops: markShopsSelected(shops, selected),
        selectedShops: selected,
        loading: false
      });
    }).catch(() => {
      this.setData({ allShops: [], loading: false });
    });
  },

  switchMode(e) {
    this.setData({ mode: e.currentTarget.dataset.mode, routeResult: null });
  },

  toggleSelect(e) {
    const shop = e.currentTarget.dataset.shop;
    let selected = [...this.data.selectedShops];
    const index = selected.findIndex((s) => String(s.id) === String(shop.id));
    if (index === -1) {
      selected.push(shop);
    } else {
      selected.splice(index, 1);
    }
    this.setData({
      selectedShops: selected,
      allShops: markShopsSelected(this.data.allShops, selected)
    });
  },

  onNaturalInput(e) {
    this.setData({ naturalInput: e.detail.value });
  },

  onTimeChange(e) {
    this.setData({ timeLimit: e.detail.value });
  },

  onStrollerChange(e) {
    this.setData({ hasStroller: e.detail.value });
  },

  onWheelchairChange(e) {
    this.setData({ hasWheelchair: e.detail.value });
  },

  generateRoute() {
    const { mode, selectedShops, naturalInput, timeLimit, hasStroller, hasWheelchair } = this.data;

    if (mode === 'select' && selectedShops.length < 2) {
      wx.showToast({ title: '请至少选择 2 个地点', icon: 'none' });
      return;
    }
    if (mode === 'natural' && !naturalInput.trim()) {
      wx.showToast({ title: '请描述您的逛店路线', icon: 'none' });
      return;
    }

    const payload = { timeLimit, hasStroller, hasWheelchair };
    if (mode === 'select') {
      payload.shopIds = selectedShops.map((s) => s.id);
    } else {
      payload.naturalInput = naturalInput.trim();
    }

    wx.showLoading({ title: 'AI 规划路线中...' });
    api.generateRoute(payload).then((data) => {
      wx.hideLoading();
      this.setData({ routeResult: data.route || data });
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({ title: '路线规划失败，请稍后重试', icon: 'none' });
    });
  }
});
