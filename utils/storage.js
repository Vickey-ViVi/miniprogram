const RECOMMEND_KEY = 'recommend_history';
const COMPLAINT_KEY = 'complaint_history';
const CHAT_SESSION_KEY = 'chat_session';

const saveChatSession = (session) => {
  wx.setStorageSync(CHAT_SESSION_KEY, session);
};

const getChatSession = () => wx.getStorageSync(CHAT_SESSION_KEY) || null;

const clearChatSession = () => {
  wx.removeStorageSync(CHAT_SESSION_KEY);
};

const saveRecommendHistory = (item) => {
  const list = wx.getStorageSync(RECOMMEND_KEY) || [];
  list.unshift({
    ...item,
    time: Date.now()
  });
  wx.setStorageSync(RECOMMEND_KEY, list.slice(0, 20));
};

const getRecommendHistory = () => wx.getStorageSync(RECOMMEND_KEY) || [];

const saveComplaintHistory = (item) => {
  const list = wx.getStorageSync(COMPLAINT_KEY) || [];
  list.unshift({
    ...item,
    time: Date.now()
  });
  wx.setStorageSync(COMPLAINT_KEY, list.slice(0, 20));
};

const getComplaintHistory = () => wx.getStorageSync(COMPLAINT_KEY) || [];

const formatHistoryTime = (timestamp) => {
  const d = new Date(timestamp);
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

module.exports = {
  saveChatSession,
  getChatSession,
  clearChatSession,
  saveRecommendHistory,
  getRecommendHistory,
  saveComplaintHistory,
  getComplaintHistory,
  formatHistoryTime
};
