/* 随机兑换码生成器（本地运行，不接触网络）
   用法：
     node tools/generate-codes.js binder 50          # 生成 50 个 binder 兑换码
     node tools/generate-codes.js binder 50 --sql     # 同时输出可直接粘贴进 Supabase SQL 的 INSERT
   码格式：PDG-XXXX-XXXX-XXXX（剔除了易混淆的 0/O/1/I） */
const crypto = require("crypto");

const COURSES = ["binder", "denovo", "enzyme", "bundle"];
const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const args = process.argv.slice(2);
const course = (args[0] || "").toLowerCase();
const count = parseInt(args[1] || "0", 10);
const wantSql = args.includes("--sql");

if (!COURSES.includes(course) || !(count > 0 && count <= 10000)) {
  console.error("用法：node tools/generate-codes.js <binder|denovo|enzyme|bundle> <数量> [--sql]");
  process.exit(1);
}

function randomCode() {
  const seg = () => {
    let s = "";
    for (let i = 0; i < 4; i++) s += CHARS[crypto.randomInt(CHARS.length)];
    return s;
  };
  return "PDG-" + seg() + "-" + seg() + "-" + seg();
}

const seen = new Set();
const rows = [];
while (rows.length < count) {
  const code = randomCode();
  if (!seen.has(code)) {
    seen.add(code);
    rows.push(code);
  }
}

if (wantSql) {
  const values = rows.map((c) => "('" + c + "','" + course + "')").join(",\n  ");
  console.log("insert into public.redemption_codes (code, course) values\n  " + values + ";");
} else {
  rows.forEach((c) => console.log(c));
}
