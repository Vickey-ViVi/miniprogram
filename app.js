// app.js
App({
  onLaunch() {
    wx.login({
      success: () => {}
    });
  },
  globalData: {
    userInfo: null
  }
});
