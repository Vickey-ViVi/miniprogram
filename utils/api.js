const BASE_URL = 'http://localhost:8080/api';

const request = (url, method, data) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'content-type': 'application/json',
        'Authorization': wx.getStorageSync('token') || ''
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) resolve(res.data);
        else reject(res);
      },
      fail: reject
    });
  });
};

module.exports = {
  BASE_URL,
  chatConverse: (data) => request('/chat/converse', 'POST', data),
  getRecommend: (data) => request('/chat/recommend', 'POST', data),
  getShopsList: () => request('/shops/list', 'GET'),
  generateRoute: (data) => request('/route/generate', 'POST', data),
  submitComplaint: (data) => request('/complaint/submit', 'POST', data),
  addProposal: (brand, reason) => request('/proposal/add', 'POST', { brand, reason }),
  getHotProposals: () => request('/proposal/hot', 'GET'),
  likeProposal: (brand) => request('/proposal/like', 'POST', { brand })
};
