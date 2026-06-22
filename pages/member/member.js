const { getRecommendHistory, getComplaintHistory, formatHistoryTime } = require('../../utils/storage');

Page({
  data: {
    recommendHistory: [],
    complaintHistory: [],
    activeTab: 'recommend'
  },

  onShow() {
    this.loadHistory();
  },

  loadHistory() {
    const recommendHistory = getRecommendHistory().map((item) => ({
      ...item,
      timeStr: formatHistoryTime(item.time)
    }));
    const complaintHistory = getComplaintHistory().map((item) => ({
      ...item,
      timeStr: formatHistoryTime(item.time)
    }));
    this.setData({ recommendHistory, complaintHistory });
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  goChat() {
    wx.navigateTo({ url: '/pages/chat/chat' });
  },

  goComplaint() {
    wx.navigateTo({ url: '/pages/complaint/complaint' });
  },

  goProposal() {
    wx.navigateTo({ url: '/pages/proposal/proposal' });
  },

  goRoute() {
    wx.navigateTo({ url: '/pages/route-plan/route-plan' });
  }
});
