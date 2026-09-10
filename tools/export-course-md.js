/* 把课程 HTML 导出成可直接粘贴进面包多的 Markdown 文本。
   用法：node tools/export-course-md.js
   输出到 ../../paid-content/<course>-mbd.md（公开仓库之外）。 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.resolve(ROOT, "..", "paid-content");
const SITE = "https://xinxinli0718-tech.github.io/protein-design-learning/";

const COURSES = [
  { file: "course-binder.html", out: "binder-mbd.md", title: "RFdiffusion binder 设计实战", weeks: "6 周" },
  { file: "course-denovo.html", out: "denovo-mbd.md", title: "从头设计（de novo）实战", weeks: "4 周" },
  { file: "course-enzyme.html", out: "enzyme-mbd.md", title: "酶设计入门", weeks: "3 周" }
];

function decode(s) {
  return s
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
}

function convert(html) {
  let s = html;
  const start = s.indexOf('<p class="section-desc"');
  const end = s.indexOf('<script src="assets/paid-gate.js"');
  s = s.slice(start, end > start ? end : s.length);

  s = s.replace(/<div class="paid-gate-holder"[^>]*>\s*<\/div>/g, "");

  // 代码块
  s = s.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g, (m, code) =>
    "\n```\n" + decode(code.replace(/<[^>]+>/g, "")) .trim() + "\n```\n");

  // 链接（相对路径转绝对）
  s = s.replace(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (m, href, text) => {
    const url = /^https?:/.test(href) ? href : SITE + href;
    return "[" + text.replace(/<[^>]+>/g, "") + "](" + url + ")";
  });

  // 提示框 / 作业框 / 课时信息
  s = s.replace(/<div class="todo-box">([\s\S]*?)<\/div>/g, (m, inner) =>
    "\n> **本周作业**\n> " + inner.trim().replace(/\n+/g, " ") + "\n");
  s = s.replace(/<div class="note[^"]*"[^>]*>([\s\S]*?)<\/div>/g, (m, inner) =>
    "\n> " + inner.trim().replace(/\n+/g, " ") + "\n");
  s = s.replace(/<div class="lesson-meta">([\s\S]*?)<\/div>/g, (m, inner) =>
    "\n*" + inner.trim().replace(/\n+/g, " ") + "*\n");

  // 表格
  s = s.replace(/<tr>([\s\S]*?)<\/tr>/g, (m, row) => {
    const cells = [];
    row.replace(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g, (mm, cell) => { cells.push(cell.trim()); return mm; });
    return "- " + cells.join(" ｜ ") + "\n";
  });
  s = s.replace(/<\/?(table|thead|tbody)[^>]*>/g, "\n");

  // 标题与段落
  s = s.replace(/<h3[^>]*>/g, "\n## ").replace(/<\/h3>/g, "\n");
  s = s.replace(/<h4[^>]*>/g, "\n### ").replace(/<\/h4>/g, "\n");
  s = s.replace(/<div[^>]*>/g, "\n").replace(/<\/div>/g, "\n");
  s = s.replace(/<p[^>]*>/g, "\n").replace(/<\/p>/g, "\n");
  s = s.replace(/<li[^>]*>/g, "\n- ").replace(/<\/li>/g, "");
  s = s.replace(/<\/?(ul|ol)[^>]*>/g, "\n");
  s = s.replace(/<br\s*\/?>/g, "\n");

  // 行内
  s = s.replace(/<(strong|b)>([\s\S]*?)<\/\1>/g, "**$2**");
  s = s.replace(/<(em|i)>([\s\S]*?)<\/\1>/g, "*$2*");
  s = s.replace(/<code>([\s\S]*?)<\/code>/g, "`$1`");

  s = s.replace(/<[^>]+>/g, "");
  s = decode(s);
  s = s.replace(/\n[ \t]+-/g, "\n-");
  s = s.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

fs.mkdirSync(OUT_DIR, { recursive: true });
COURSES.forEach((c) => {
  const html = fs.readFileSync(path.join(ROOT, c.file), "utf8");
  const body = convert(html);
  const text = [
    "# " + c.title + "（" + c.weeks + "）",
    "",
    "> **早鸟价说明**：当前售价 ¥49；2026 年 10 月 1 日起恢复原价 ¥69。早鸟期间购买的用户，永久享受本课程全部更新。",
    "",
    "> 使用说明：一个商品的付费内容可一次发布，也可按周分批更新；下面按周分隔，直接复制。",
    "",
    body,
    ""
  ].join("\n");
  fs.writeFileSync(path.join(OUT_DIR, c.out), text, "utf8");
  console.log("已导出 " + path.join(OUT_DIR, c.out) + "（" + text.length + " 字）");
});
