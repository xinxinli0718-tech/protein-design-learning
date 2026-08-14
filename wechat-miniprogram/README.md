# 蛋白质设计实操助手（微信小程序）

与网站版「实践中心」配套的微信小程序：手机看分步指导，电脑上动手实操。

## 如何运行

1. 下载安装「微信开发者工具」（稳定版）：https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. 打开开发者工具 → 导入项目 → 选择本目录 `wechat-miniprogram/`
3. `project.config.json` 已填好你的 AppID（wx89c20954764f7127），直接导入即可
4. 导入后点「编译」，在模拟器里查看；点「预览」可扫码在真机上体验

> 备注：如果要在其他机器上开发，把 AppID 填成你自己的；只想体验可用「测试号」。

## 发布上线（正式版）

1. 在 mp.weixin.qq.com 注册小程序账号，完成主体认证（个人号可发布，无需企业认证费用）
2. 完成微信要求的 ICP 备案（设置 → 基本设置 → 备案）
3. 配置「用户隐私保护指引」（设置 → 服务内容声明）
4. 在开发者工具里点「上传」，填版本号（如 1.0.0）
5. 到小程序后台「版本管理」提交审核，审核通过后点「发布」

## 目录结构

```
wechat-miniprogram/
  app.js / app.json / app.wxss    全局配置与样式
  data/tasks.js                   实践任务数据（与网站 assets/practice-data.js 对应）
  pages/index/                    任务列表页
  pages/practice/                 分步实操页（进度、复制链接、常见问题）
```

## 维护说明

- 加任务：在 `data/tasks.js` 里追加一段数据即可，两个页面会自动渲染
- 进度存在本机 `wx.setStorageSync`，换设备不共享（后续可接云开发同步）
- 小程序无法直接打开外部网页，所以链接采用「复制」方式；如需二维码，可后续接入 canvas 绘制
