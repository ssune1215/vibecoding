#!/usr/bin/env node
/**
 * Cloudflare Pages build script
 * - Auto-generates tests.json by scanning top-level folders that contain index.html
 * - Keeps existing titles/groups if they already exist in tests.json
 *
 * Convention (optional, recommended for new tests):
 *   <meta name="vibecoding:title" content="...">
 *   <meta name="vibecoding:group" content="love|etc|...">
 */
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd()); // repo root on Pages (this script is run from root)
const TESTS_JSON = join(ROOT, "tests.json");

function safeReadJson(path) {
  try {
    if (!existsSync(path)) return [];
    const raw = readFileSync(path, "utf-8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("[build] Failed to read tests.json:", e?.message || e);
    return [];
  }
}

function extractMeta(html, name) {
  // name like vibecoding:title
  const re = new RegExp(`<meta\\s+[^>]*name=["']${name}["'][^>]*content=["']([^"']+)["'][^>]*>`, "i");
  const m = html.match(re);
  return m ? m[1].trim() : null;
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m ? m[1].trim() : null;
}

function inferGroup(dirName) {
  const loveLike = new Set(["love", "lovembti", "lovertest", "loveother", "yandere"]);
  if (loveLike.has(dirName.toLowerCase())) return "love";
  return "etc";
}

const existing = safeReadJson(TESTS_JSON);
const existingByDir = new Map();
for (const item of existing) {
  if (!item?.path) continue;
  // path like "./folder/"
  const dir = String(item.path).replace(/^\.\//, "").replace(/\/+$/, "");
  if (dir) existingByDir.set(dir, item);
}

const entries = readdirSync(ROOT, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((name) => !name.startsWith("."))
  .filter((name) => !["assets", "og", "tools"].includes(name));

const tests = [];

for (const dirName of entries) {
  const dirPath = join(ROOT, dirName);
  // ensure directory and has index.html
  try {
    if (!statSync(dirPath).isDirectory()) continue;
  } catch { continue; }

  const indexPath = join(dirPath, "index.html");
  if (!existsSync(indexPath)) continue;

  const html = readFileSync(indexPath, "utf-8");

  // Prefer explicit meta, then existing tests.json, then <title>, then folder name
  const metaTitle = extractMeta(html, "vibecoding:title");
  const metaGroup = extractMeta(html, "vibecoding:group");

  const prev = existingByDir.get(dirName);

  const title = metaTitle || prev?.title || extractTitle(html) || dirName;
  const group = metaGroup || prev?.group || inferGroup(dirName);

  tests.push({
    title,
    path: `./${dirName}/`,
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
