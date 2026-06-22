const api = require('../../utils/api');
const { saveComplaintHistory } = require('../../utils/storage');

const TYPE_LABELS = {
  ac: '空调问题',
  clean: '卫生问题',
  lost: '失物招领'
};

const PHONE_REGEX = /1[3-9]\d{9}/;

Page({
  data: {
    type: '',
    typeLabel: '',
    showPhoto: false,
    lostGuide: false,
    images: [],
    description: '',
    phone: ''
  },

  onTypeChange(e) {
    const type = e.detail.value;
    this.setData({
      type,
      typeLabel: TYPE_LABELS[type] || '',
      showPhoto: type !== 'lost',
      lostGuide: type === 'lost'
    });
  },

  chooseImage() {
    wx.chooseMedia({
      count: 3 - this.data.images.length,
      mediaType: ['image'],
      success: (res) => {
        const paths = res.tempFiles.map((f) => f.tempFilePath);
        this.setData({ images: [...this.data.images, ...paths].slice(0, 3) });
      }
    });
  },

  removeImage(e) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.images];
    images.splice(index, 1);
    this.setData({ images });
  },

  onDescInput(e) {
    this.setData({ description: e.detail.value });
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  extractPhone(text) {
    const match = text.match(PHONE_REGEX);
    return match ? match[0] : '';
  },

  submitComplaint() {
    const { type, description, images, phone } = this.data;

    if (!type) {
      wx.showToast({ title: '请选择类型', icon: 'none' });
      return;
    }
    if (!description.trim()) {
      wx.showToast({ title: '请填写描述', icon: 'none' });
      return;
    }

    const data = {
      type,
      description: description.trim(),
      images
    };

    if (type === 'lost') {
      const detectedPhone = this.extractPhone(description) || phone.trim();
      if (detectedPhone) {
        if (!PHONE_REGEX.test(detectedPhone)) {
          wx.showToast({ title: '手机号格式错误', icon: 'none' });
          return;
        }
        data.phone = detectedPhone;
        this.sendComplaint(data);
      } else {
        this.askPhoneAndSubmit(data);
      }
    } else {
      this.sendComplaint(data);
    }
  },

  askPhoneAndSubmit(data) {
    wx.showModal({
      title: '补充联系方式',
      content: '请留下您的手机号，以便通知您失物进展',
      editable: true,
      placeholderText: '请输入手机号',
      success: (res) => {
        if (res.confirm && res.content) {
          const phone = res.content.trim();
          if (!PHONE_REGEX.test(phone)) {
            wx.showToast({ title: '手机号格式错误', icon: 'none' });
            return;
          }
          data.phone = phone;
          this.sendComplaint(data);
        } else if (res.confirm) {
          wx.showToast({ title: '未提供手机号，无法提交', icon: 'none' });
        }
      }
    });
  },

  sendComplaint(data) {
    wx.showLoading({ title: '提交中...' });
    api.submitComplaint(data).then((res) => {
      wx.hideLoading();
      if (res.code === 200) {
        saveComplaintHistory({
          type: TYPE_LABELS[data.type],
          ticketNo: res.ticketNo,
          description: data.description.slice(0, 30)
        });
        wx.showModal({
          title: '提交成功',
          content: `您的工单已生成\n工单号：${res.ticketNo}\n我们会尽快处理`,
          showCancel: false,
          success: () => wx.navigateBack()
        });
      } else {
        wx.showToast({ title: res.message || '提交失败', icon: 'none' });
      }
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({ title: '网络错误', icon: 'none' });
    });
  }
});
