/**
 * Render book art to PNG for review.
 *   node book/tools/preview-art.mjs <outDir> [name ...]
 * Writes <outDir>/<name>.png for each SVG (all of book/art/*.svg when no names
 * are given) on a page-coloured ground at print-ish size, plus <outDir>/_sheet.png
 * (a labelled contact sheet). Fails if any SVG is not well-formed XML.
 * Look at every PNG yourself and audit it against book/art/ART-CHECKLIST.md.
 */
import { chromium } from "playwright-core";
import { readFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ART = join(dirname(fileURLToPath(import.meta.url)), "..", "art");
const PAPER = "#f2f1ee";   // PLACEHOLDER page colour (book/src/book.css --paper)
const EDGE = "#c9c6bf";    // (book/src/book.css --paper-edge)
const [outDir, ...names] = process.argv.slice(2);
if (!outDir) { console.error("usage: node book/tools/preview-art.mjs <outDir> [name ...]"); process.exit(2); }
mkdirSync(outDir, { recursive: true });
const list = names.length ? names : readdirSync(ART).filter(f => f.endsWith(".svg")).map(f => f.slice(0, -4)).sort();

const CHROME = process.env.CHROME_PATH ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);
const browser = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
let bad = 0;
const cells = [];
for (const name of list) {
  const svg = readFileSync(join(ART, `${name}.svg`), "utf8");
  // Well-formedness check via the browser's XML parser.
  const err = await page.evaluate(s => {
    const d = new DOMParser().parseFromString(s, "image/svg+xml");
    const e = d.querySelector("parsererror"); return e ? e.textContent.slice(0, 200) : null;
  }, svg);
  if (err) { console.error(`✗ ${name}: ${err}`); bad++; continue; }
  await page.setContent(`<body style="margin:0;background:${PAPER};display:grid;place-items:center;min-height:100vh">
    <div id="a" style="width:800px;max-height:860px">${svg}</div></body>`);
  await page.evaluate(() => { const s = document.querySelector("#a svg"); s.style.width = "100%"; s.style.height = "auto"; s.style.maxHeight = "860px"; });
  await page.locator("#a").screenshot({ path: join(outDir, `${name}.png`) });
  cells.push(`<figure style="margin:0;background:${PAPER};padding:6px;border:1px solid ${EDGE}"><div style="height:200px;display:grid;place-items:center">${svg.replace(/<svg/, '<svg style="max-width:100%;max-height:200px;width:auto;height:auto"')}</div><figcaption style="font:12px sans-serif;text-align:center">${name}</figcaption></figure>`);
  console.log(`✓ ${name}`);
}
if (cells.length) {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.setContent(`<body style="margin:8px;background:#fff;display:grid;grid-template-columns:repeat(6,1fr);align-items:start;gap:8px">${cells.join("")}</body>`);
  await page.screenshot({ path: join(outDir, "_sheet.png"), fullPage: true });
}
await browser.close();
if (bad) process.exit(1);
