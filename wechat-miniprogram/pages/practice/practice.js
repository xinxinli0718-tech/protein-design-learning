const tasks = require("../../data/tasks.js");

Page({
  data: {
    task: null,
    steps: [],
    current: 0,
    doneCount: 0,
    total: 0,
    progressPercent: 0,
    allDone: false,
    nextTip: ""
  },

  onLoad(options) {
    const id = options.task;
    const task = tasks.find((t) => t.id === id);
    if (!task) {
      wx.redirectTo({ url: "/pages/index/index" });
      return;
    }
    const saved = wx.getStorageSync("pdg-progress-" + id) || [];
    const steps = task.steps.map((s, idx) => ({
      ...s,
      idx,
      done: !!saved[idx]
    }));
    const nextTip = task.steps.length ? task.steps[task.steps.length - 1].tip || "" : "";
    this.setData({
      task,
      steps,
      total: steps.length,
      nextTip
    });
    this.refreshProgress();
  },

  refreshProgress() {
    const doneCount = this.data.steps.filter((s) => s.done).length;
    const total = this.data.total || 1;
    this.setData({
      doneCount,
      progressPercent: Math.round((doneCount / total) * 100),
      allDone: doneCount === this.data.total && this.data.total > 0
    });
    wx.setStorageSync("pdg-progress-" + this.data.task.id, this.data.steps.map((s) => s.done));
  },

  toggleDone(e) {
    const idx = Number(e.currentTarget.dataset.idx);
    const steps = this.data.steps;
    steps[idx].done = !steps[idx].done;
    this.setData({ steps });
    this.refreshProgress();
  },

  goTo(idx) {
    const clamped = Math.max(0, Math.min(this.data.total - 1, idx));
    this.setData({ current: clamped });
    wx.pageScrollTo({
      selector: "#step-" + clamped,
      duration: 300
    });
  },

  prevStep() {
    this.goTo(this.data.current - 1);
  },

  nextStep() {
    this.goTo(this.data.current + 1);
  },

  copyLink(e) {
    const url = e.currentTarget.dataset.url;
    wx.setClipboardData({
      data: url,
      success() {
        wx.showToast({ title: "链接已复制", icon: "success" });
      }
    });
  },

  onShareAppMessage() {
    return {
      title: this.data.task ? this.data.task.title : "蛋白设计实操",
      path: "/pages/index/index"
    };
  }
});
