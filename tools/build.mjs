#!/usr/bin/env node
/**
 * Cloudflare Pages build script
 * - Auto-generates tests.json by scanning /tests/* folders that contain index.html
 * - Keeps existing titles/groups if they already exist in tests.json
 *
 * Optional meta (recommended for new tests):
 *   <meta name="vibecoding:title" content="...">
 *   <meta name="vibecoding:group" content="love|etc|...">
 */
import { copyFileSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd());
const TESTS_DIR = join(ROOT, "tests");
const TESTS_JSON = join(ROOT, "tests.json");
const OG_DEFAULT = join(ROOT, "assets", "og-default.png");

function safeReadJson(path) {
  try {
    if (!existsSync(path)) return [];
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return [];
  }
}

function extractMeta(html, name) {
  const re = new RegExp(`<meta\\s+[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`, "i");
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m ? m[1].trim() : null;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function ensureOgAndMeta(testDirName, indexPath, html, title) {
  // 1) Ensure og.png exists in /tests/<test>/og.png
  const ogPath = join(TESTS_DIR, testDirName, "og.png");
  if (!existsSync(ogPath) && existsSync(OG_DEFAULT)) {
    try { copyFileSync(OG_DEFAULT, ogPath); } catch {}
  }

  // 2) Ensure OG/Twitter meta tags exist (relative to the test page)
  const needsOgImage = !/property=["']og:image["']/i.test(html);
  const needsOgTitle = !/property=["']og:title["']/i.test(html);
  const needsOgDesc  = !/property=["']og:description["']/i.test(html);
  const needsOgUrl   = !/property=["']og:url["']/i.test(html);
  const needsTwCard  = !/name=["']twitter:card["']/i.test(html);

  if (!(needsOgImage || needsOgTitle || needsOgDesc || needsOgUrl || needsTwCard)) return html;

  const desc = "결과를 확인하고 바로 공유해보세요.";
  const tags = [
    needsOgTitle ? `  <meta property=\"og:title\" content=\"${escapeHtml(title)}\">` : null,
    needsOgDesc  ? `  <meta property=\"og:description\" content=\"${escapeHtml(desc)}\">` : null,
    needsOgUrl   ? `  <meta property=\"og:url\" content=\"./\">` : null,
    needsOgImage ? `  <meta property=\"og:image\" content=\"og.png\">` : null,
    needsOgImage ? `  <meta property=\"og:image:width\" content=\"1200\">` : null,
    needsOgImage ? `  <meta property=\"og:image:height\" content=\"630\">` : null,
    needsTwCard  ? `  <meta name=\"twitter:card\" content=\"summary_large_image\">` : null,
    needsTwCard  ? `  <meta name=\"twitter:title\" content=\"${escapeHtml(title)}\">` : null,
    needsTwCard  ? `  <meta name=\"twitter:description\" content=\"${escapeHtml(desc)}\">` : null,
    needsTwCard  ? `  <meta name=\"twitter:image\" content=\"og.png\">` : null,
  ].filter(Boolean).join("\n");

  const headRe = /<head(\\s[^>]*)?>/i;
  if (headRe.test(html)) return html.replace(headRe, (m) => `${m}\n${tags}`);
  return `${tags}\n${html}`;
}

function inferGroup(dirName) {
  const loveLike = new Set(["love", "lovembti", "lovertest", "loveother", "yandere"]);
  if (loveLike.has(dirName.toLowerCase())) return "love";
  return "etc";
}

// Load existing tests.json to preserve titles/groups if present
const existing = safeReadJson(TESTS_JSON);
const existingByDir = new Map();
for (const item of existing) {
  if (!item?.path) continue;
  // path like "./tests/<dir>/"
  const dir = String(item.path)
    .replace(/^\.\//, "")
    .replace(/^tests\//, "")
    .replace(/\/+$/, "")
    .replace(/^tests\//, "");
  const clean = dir.replace(/^tests\//, "");
  if (clean) existingByDir.set(clean, item);
}

if (!existsSync(TESTS_DIR)) {
  console.error("[build] /tests 폴더가 없습니다.");
  process.exit(1);
}

const entries = readdirSync(TESTS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((name) => !name.startsWith("."))
  .filter((name) => !name.startsWith("_")); // _template 등 제외

const tests = [];

for (const dirName of entries) {
  const indexPath = join(TESTS_DIR, dirName, "index.html");
  if (!existsSync(indexPath)) continue;

  const html = readFileSync(indexPath, "utf-8");

  const metaTitle = extractMeta(html, "vibecoding:title");
  const metaGroup = extractMeta(html, "vibecoding:group");

  const prev = existingByDir.get(dirName);
  const title = metaTitle || prev?.title || extractTitle(html) || dirName;
  const group = metaGroup || prev?.group || inferGroup(dirName);

  const updatedHtml = ensureOgAndMeta(dirName, indexPath, html, title);
  if (updatedHtml !== html) {
    try { writeFileSync(indexPath, updatedHtml, "utf-8"); } catch {}
  }

  tests.push({
    title,
    path: `./tests/${dirName}/`,
    group,
  });
}

// Stable sort: group then title then path
tests.sort((a, b) =>
  String(a.group).localeCompare(String(b.group)) ||
  String(a.title).localeCompare(String(b.title)) ||
  String(a.path).localeCompare(String(b.path))
);

writeFileSync(TESTS_JSON, JSON.stringify(tests, null, 2) + "\n", "utf-8");
console.log(`[build] Generated tests.json with ${tests.length} items.`);
