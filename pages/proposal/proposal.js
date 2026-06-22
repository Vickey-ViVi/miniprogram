const api = require('../../utils/api');

Page({
  data: {
    brand: '',
    reason: '',
    hotBrands: [],
    loading: false
  },

  onLoad() {
    this.fetchHotBrands();
  },

  onShow() {
    this.fetchHotBrands();
  },

  onBrandInput(e) {
    this.setData({ brand: e.detail.value });
  },

  onReasonInput(e) {
    this.setData({ reason: e.detail.value });
  },

  submitProposal() {
    const brand = this.data.brand.trim();
    const reason = this.data.reason.trim();

    if (!brand) {
      wx.showToast({ title: '请输入品牌名称', icon: 'none' });
      return;
    }
    if (!reason) {
      wx.showToast({ title: '请填写推荐理由', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '提交中...' });
    api.addProposal(brand, reason).then((res) => {
      wx.hideLoading();
      if (!res.success) {
        wx.showToast({ title: res.message || '提交失败', icon: 'none' });
        return;
      }

      if (res.isNew === false || res.existing) {
        const count = res.count || res.proposalCount || 0;
        wx.showModal({
          title: '已有相同提议',
          content: `已有 ${count} 人提议「${brand}」，您是否点赞支持？`,
          confirmText: '点赞支持',
          cancelText: '暂不',
          success: (modal) => {
            if (modal.confirm) {
              this.likeBrandByName(brand);
            }
            this.setData({ brand: '', reason: '' });
            this.fetchHotBrands();
          }
        });
      } else {
        wx.showToast({ title: '提议已记录，感谢参与', icon: 'success' });
        this.setData({ brand: '', reason: '' });
        this.fetchHotBrands();
      }
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({ title: '网络错误', icon: 'none' });
    });
  },

  likeBrand(e) {
    const brand = e.currentTarget.dataset.brand;
    this.likeBrandByName(brand);
  },

  likeBrandByName(brand) {
    api.likeProposal(brand).then(() => {
      wx.showToast({ title: '支持成功', icon: 'success' });
      this.fetchHotBrands();
    }).catch(() => {
      wx.showToast({ title: '操作失败', icon: 'none' });
    });
  },

  fetchHotBrands() {
    this.setData({ loading: true });
    api.getHotProposals().then((data) => {
      const hotBrands = Array.isArray(data) ? data : (data.list || []);
      this.setData({ hotBrands, loading: false });
    }).catch(() => {
      this.setData({ loading: false });
    });
  }
});
