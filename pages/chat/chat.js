const { saveChatSession, getChatSession, clearChatSession } = require('../../utils/storage');

Page({
  data: {
    messages: [],
    showOptions: false,
    showInput: false,
    chatMode: false,
    currentQuestion: null,
    inputValue: '',
    scrollToView: 'bottom',
    userContext: {},
    step: 0
  },

  onLoad(options) {
    if (options.resume === '1') {
      const session = getChatSession();
      if (session && session.messages && session.messages.length) {
        this.restoreSession(session);
        return;
      }
    }
    if (options.fresh === '1') {
      clearChatSession();
    }
    this.startConversation();
  },

  persistSession() {
    saveChatSession({
      messages: this.data.messages,
      userContext: this.data.userContext,
      chatMode: this.data.chatMode,
      step: this.data.step
    });
  },

  restoreSession(session) {
    const messages = [...(session.messages || [])];
    messages.push({ role: 'bot', content: '欢迎回来，您可以继续提问或点击「获取店铺推荐」。' });
    this.setData({
      messages,
      userContext: session.userContext || {},
      chatMode: !!session.chatMode,
      step: session.step != null ? session.step : 2,
      showInput: !!session.chatMode,
      showOptions: false,
      scrollToView: 'bottom'
    }, () => this.persistSession());
  },

  startConversation() {
    clearChatSession();
    this.setData({
      messages: [],
      userContext: {},
      step: 0,
      chatMode: false,
      showInput: false,
      showOptions: false
    });
    this.addBotMessage('请选择您想咨询的类型：');
    this.showOptions(['🍔 美食', '🎮 玩乐', '🛍️ 购物', '🗺️ 规划路线']);
  },

  addBotMessage(content) {
    this.setData({
      messages: [...this.data.messages, { role: 'bot', content }],
      scrollToView: 'bottom'
    }, () => this.persistSession());
  },

  addUserMessage(content) {
    this.setData({
      messages: [...this.data.messages, { role: 'user', content }],
      scrollToView: 'bottom'
    }, () => this.persistSession());
  },

  showOptions(options) {
    this.setData({
      showOptions: true,
      showInput: false,
      currentQuestion: { text: '', options }
    });
  },

  hideOptionsAndInput() {
    this.setData({ showOptions: false });
  },

  enterChatMode() {
    this.setData({
      chatMode: true,
      showInput: true,
      showOptions: false,
      step: 2
    }, () => this.persistSession());
    this.addBotMessage('请告诉我您的具体需求，例如口味偏好、预算、想逛的品类等。随时输入，我会为您解答；准备好后点击「获取店铺推荐」。');
  },

  selectOption(e) {
    const selected = e.currentTarget.dataset.value;
    this.addUserMessage(selected);
    this.hideOptionsAndInput();

    const step = this.data.step;
    const context = { ...this.data.userContext };

    if (step === 0) {
      let type = '';
      if (selected.includes('美食')) type = 'food';
      else if (selected.includes('玩乐')) type = 'entertainment';
      else if (selected.includes('购物')) type = 'shopping';
      else if (selected.includes('路线')) type = 'route';

      if (type === 'route') {
        wx.navigateTo({ url: '/pages/route-plan/route-plan' });
        return;
      }
      context.type = type;
      this.setData({ userContext: context, step: 1 }, () => this.persistSession());
      this.addBotMessage('请选择同行人数：');
      this.showOptions(['1人', '2人', '3人以上']);
    } else if (step === 1) {
      context.companions = selected;
      this.setData({ userContext: context }, () => this.persistSession());
      this.enterChatMode();
    }
  },

  onInputConfirm() {
    this.sendInput();
  },

  sendInput() {
    const inputText = this.data.inputValue.trim();
    if (!inputText) return;

    if (!this.data.chatMode) return;

    this.addUserMessage(inputText);
    this.setData({ inputValue: '' });

    wx.showLoading({ title: 'AI思考中...' });
    const api = require('../../utils/api');
    const history = this.buildHistory(this.data.messages.slice(0, -1));

    api.chatConverse({
      type: this.data.userContext.type,
      companions: this.data.userContext.companions,
      message: inputText,
      history
    }).then((res) => {
      wx.hideLoading();
      if (res.success && res.reply) {
        this.addBotMessage(res.reply);
      } else {
        this.addBotMessage('抱歉，暂时无法回答，请稍后重试。');
      }
    }).catch(() => {
      wx.hideLoading();
      this.addBotMessage('网络错误，请检查后端服务是否启动。');
    });
  },

  buildHistory(msgs) {
    const source = msgs || this.data.messages;
    return source
      .filter((m) => m.role === 'user' || m.role === 'bot')
      .slice(-10)
      .map((m) => ({
        role: m.role === 'bot' ? 'assistant' : 'user',
        content: m.content
      }));
  },

  resetQuestionType() {
    this.setData({
      userContext: {},
      step: 0,
      chatMode: false,
      showInput: false,
      showOptions: false
    }, () => this.persistSession());
    this.addBotMessage('请重新选择您想咨询的类型：');
    this.showOptions(['🍔 美食', '🎮 玩乐', '🛍️ 购物', '🗺️ 规划路线']);
  },

  getRecommendations() {
    const context = this.data.userContext;
    this.persistSession();
    wx.showLoading({ title: 'AI正在推荐...' });

    const api = require('../../utils/api');
    api.getRecommend({
      type: context.type,
      companions: context.companions,
      messages: this.buildHistory()
    }).then((res) => {
      wx.hideLoading();
      if (res.success) {
        wx.navigateTo({
          url: `/pages/recommend-result/recommend-result?data=${encodeURIComponent(JSON.stringify(res))}`
        });
      } else {
        wx.showToast({ title: '推荐失败', icon: 'none' });
      }
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({ title: '网络错误', icon: 'none' });
    });
  }
});
