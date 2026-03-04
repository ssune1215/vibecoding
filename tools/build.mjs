import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const BASE_URL_RAW = process.env.CF_PAGES_URL || process.env.BASE_URL || "";
const BASE_URL = BASE_URL_RAW.replace(/\/+$/, "");
const KAKAO_JS_KEY = process.env.KAKAO_JS_KEY || "";
const THUMB_URL = process.env.THUMB_URL || "https://cdn.jsdelivr.net/gh/ssune1215/vibecoding-assets@main/share-thumb.jpg?v=5";

// ---- helpers
function isDir(p) {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}
function readText(p) {
  return fs.readFileSync(p, "utf8");
}
function writeText(p, s) {
  fs.writeFileSync(p, s, "utf8");
}
function walk(dir, exts, out=[]) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) {
      if (name === ".git" || name === ".github" || name === "node_modules") continue;
      walk(p, exts, out);
    } else {
      if (exts.includes(path.extname(name))) out.push(p);
    }
  }
  return out;
}

// ---- 1) auto-generate tests.json from folders that contain index.html
const EXCLUDE = new Set(["assets", "og", "tools"]);
const entries = [];

for (const name of fs.readdirSync(ROOT)) {
  const p = path.join(ROOT, name);
  if (!isDir(p)) continue;
  if (EXCLUDE.has(name)) continue;

  const indexPath = path.join(p, "index.html");
  if (!fs.existsSync(indexPath)) continue;

  const lower = name.toLowerCase();
  const group = (lower.includes("love") || lower.includes("yandere") || lower.includes("lover")) ? "love" : "etc";

  const title = name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());

  entries.push({ title, path: `./${name}/`, group });
}

entries.sort((a,b) => (a.group+a.title).localeCompare(b.group+b.title, "en"));

writeText(path.join(ROOT, "tests.json"), JSON.stringify(entries, null, 2));

// ---- 2) token replacement across html/js
const files = [
  ...walk(ROOT, [".html", ".js"])
];

for (const fp of files) {
  let s = readText(fp);

  // Replace tokens if present
  if (s.includes("__KAKAO_JS_KEY__")) s = s.replaceAll("__KAKAO_JS_KEY__", KAKAO_JS_KEY);
  if (s.includes("__THUMB_URL__")) s = s.replaceAll("__THUMB_URL__", THUMB_URL);
  if (s.includes("__BASE_URL__")) s = s.replaceAll("__BASE_URL__", BASE_URL);

  writeText(fp, s);
}

console.log("build ok:", {count: entries.length, BASE_URL, hasKey: Boolean(KAKAO_JS_KEY)});
