Page({
  goToSmartAsk() {
    wx.navigateTo({ url: '/pages/chat/chat' });
  },
  goToComplaint() {
    wx.navigateTo({ url: '/pages/complaint/complaint' });
  },
  goToProposal() {
    wx.navigateTo({ url: '/pages/proposal/proposal' });
  }
});