const { saveRecommendHistory } = require('../../utils/storage');

Page({
  data: {
    recommendations: [],
    typeLabel: ''
  },

  onLoad(options) {
    if (options.data) {
      const data = JSON.parse(decodeURIComponent(options.data));
      const typeMap = {
        food: '美食',
        entertainment: '玩乐',
        shopping: '购物',
        gift: '购物'
      };
      const recommendations = (data.recommendations || []).map((item) => ({
        ...item,
        tagList: item.tags ? String(item.tags).split(/[,，、]/).filter(Boolean) : []
      }));
      this.setData({
        recommendations,
        typeLabel: typeMap[data.type] || '精选'
      });
      saveRecommendHistory({
        type: data.type,
        count: recommendations.length,
        shops: recommendations.map((s) => s.name).join('、')
      });
    }
  },

  planRoute() {
    const shopIds = this.data.recommendations.map((shop) => shop.id).filter(Boolean);
    const url = shopIds.length >= 2
      ? `/pages/route-plan/route-plan?shopIds=${shopIds.join(',')}`
      : '/pages/route-plan/route-plan';
    wx.navigateTo({ url });
  },

  goChat() {
    wx.navigateTo({ url: '/pages/chat/chat?resume=1' });
  }
});
