# 蛋白质设计学习指南（Protein Design Learning Guide）

一份面向中文用户的蛋白质设计自学网站：从结构生物学基础到 AI 蛋白设计，
覆盖核心概念、软件工具、重要文献、学习资源和术语表。纯静态页面，
无任何外部依赖，双击即可打开，离线也能用。

## 页面结构

| 页面 | 内容 |
| --- | --- |
| `index.html` | 首页：什么是蛋白设计 + 5 阶段学习路径（带进度勾选） |
| `concepts.html` | 核心概念：基础 / 设计核心 / 机器学习原理，共 17 个概念 |
| `software.html` | 软件工具：6 大分类 20+ 工具，可筛选搜索 |
| `literature.html` | 重要文献：5 组 27 篇，附阅读建议 |
| `resources.html` | 学习资源：文档、课程、数据库、社区、免安装动手环境 |
| `glossary.html` | 术语表：50+ 中英对照词条，支持搜索 |
| `practice.html` | 实践中心：任务列表（手机实操伴侣入口） |
| `practice-task.html` | 实操任务页：分步指导、进度保存、二维码、常见问题 |
| `disclaimer.html` | 免责声明与致谢（商标归属、外部链接、第三方开源许可） |
| `wechat-miniprogram/` | 微信小程序版（导入微信开发者工具即可运行） |

## PWA（可安装到手机/桌面）

- `manifest.webmanifest` + `sw.js`：支持离线缓存和「添加到主屏幕」
- 手机上用浏览器打开线上地址 → 分享/添加到主屏幕，即可像 App 一样使用
- 实操任务进度保存在本机浏览器 localStorage

## 如何打开

直接用浏览器打开 `index.html` 即可（推荐 Chrome / Safari / Edge）。

```bash
open index.html
```

## 如何部署到线上（可选）

网站是纯静态的，任何静态托管服务都能直接上传 `protein-design-guide/` 目录：

- GitHub Pages：把目录推到一个仓库，开启 Pages 即可
- Vercel / Netlify：拖拽上传或连仓库，零配置
- 内网 / 本地服务器：`python3 -m http.server 8000` 后访问 `localhost:8000`

## 如何扩展成 App / Skill

### 变成 Codex Skill
把 `concepts.html`、`literature.html` 等页面内容整理成 Markdown 知识库，
放到 `~/.codex/skills/protein-design-tutor/`，写一份 `SKILL.md`
定义触发词（如「蛋白设计入门」「帮我讲 RFdiffusion」）即可让 Codex 成为你的设计导师。

### 变成交互 App
页面里的筛选、搜索、进度保存已经用原生 JS 实现，可直接套壳：
- 本地 App：用 Electron / Tauri 把目录打包
- 在线应用：加后端（如 FastAPI + 任务队列）把 Colab 流水线接进来，变成「输入靶点结构 → 返回设计候选」的工具
- 微信小程序：`wechat-miniprogram/` 已提供脚手架，用微信开发者工具导入即可（详见该目录 README）

## 维护建议

- 文献页的 arXiv/DOI 链接建议每半年核对一次
- 软件页的新工具（如新发布的生成模型）可以按现有卡片格式追加
- 术语表可以随阅读不断补充；搜索是基于 `data-search` 属性，加词条时记得补全中英文关键词

## 说明

内容基于公开资料整理，仅供学习交流；引用文献链接以官方出版方为准。
