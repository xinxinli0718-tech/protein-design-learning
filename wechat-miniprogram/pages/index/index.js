const tasks = require("../../data/tasks.js");

Page({
  data: {
    tasks: []
  },
  onLoad() {
    this.setData({ tasks });
  },
  openTask(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: "/pages/practice/practice?task=" + id });
  }
});
