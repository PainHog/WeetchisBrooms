#!/usr/bin/env node
// Witch & Ward: scene maps for the Foundry VTT one-shot of Episode 1, "Night Market".
//
// TEST ART. The art direction is undecided, so these are clean, readable
// top-down maps, not final art. Every map is hand-built SVG (shapes, patterns,
// gradients), rendered to PNG by the local Chromium (Playwright, launched the
// same way as book/build.mjs), then converted to WebP (quality 82) by Python
// Pillow.
//
//   node tools/vtt-art/maps.mjs                 all four maps
//   node tools/vtt-art/maps.mjs night-market    just the named map(s)
//
// Writes:  assets/scenes/<name>.webp   the scene background (3000 x 2000 px)
//          assets/scenes/<name>.json   map-note points and token start squares
//          tools/vtt-art/out/maps/     SVG, HTML and PNG working files (git-ignored)
//
// Gridded maps use a 100 px grid (30 x 20 squares). Walls, stalls and objects sit
// on it, but the grid itself is not drawn: Foundry draws it.
// Places and features come from book/src/chapters/32-ch14.html (Episode 1) and
// 31-ch13.html (the Lantern House, Larkhaven). Change the book first, then here.

import { chromium } from "playwright-core";
import { writeFileSync, mkdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const OUT = join(HERE, "out", "maps");
const DEST = join(ROOT, "assets", "scenes");
const W = 3000, H = 2000, G = 100;
const CHROME = process.env.CHROME_PATH ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);

/* ------------------------------------------------------------- fonts ---- */
// The book's PLACEHOLDER typefaces (book/build.mjs), so labels match the book.
const FONT_DIR = join(ROOT, "node_modules", "@fontsource");
const fontFace = (family, pkg, weight, style = "normal") => {
  const f = join(FONT_DIR, pkg, "files", `${pkg}-latin-${weight}-${style}.woff2`);
  if (!existsSync(f)) throw new Error(`font file missing: ${f} (run npm install)`);
  return `@font-face{font-family:"${family}";src:url("${pathToFileURL(f).href}") format("woff2");font-weight:${weight};font-style:${style};}`;
};
const FONTS = [
  ...[600, 700, 900].flatMap(w => [fontFace("Fraunces", "fraunces", w), fontFace("Fraunces", "fraunces", w, "italic")]),
  fontFace("Alegreya", "alegreya", 400), fontFace("Alegreya", "alegreya", 400, "italic"), fontFace("Alegreya", "alegreya", 700),
  ...[500, 700, 800].map(w => fontFace("Alegreya Sans", "alegreya-sans", w)),
  fontFace("Alegreya Sans", "alegreya-sans", 700, "italic"),
].join("\n");

/* ----------------------------------------------------------- helpers ---- */
const f1 = v => Math.round(v * 10) / 10;
/** Seeded PRNG (mulberry32): the same seed always draws the same map. */
function rng(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const attrs = o => Object.entries(o)
  .filter(([, v]) => v !== undefined && v !== null && v !== false)
  .map(([k, v]) => `${k}="${typeof v === "number" ? f1(v) : esc(v)}"`).join(" ");
const el = (tag, a = {}, inner) => inner == null ? `<${tag} ${attrs(a)}/>` : `<${tag} ${attrs(a)}>${inner}</${tag}>`;
const grp = (inner, a = {}) => el("g", a, Array.isArray(inner) ? inner.join("") : inner);
const rect = (x, y, w, h, a = {}) => el("rect", { x, y, width: w, height: h, ...a });
const circle = (cx, cy, r, a = {}) => el("circle", { cx, cy, r, ...a });
const ellipse = (cx, cy, rx, ry, a = {}) => el("ellipse", { cx, cy, rx, ry, ...a });
const path = (d, a = {}) => el("path", { d, ...a });
const line = (x1, y1, x2, y2, a = {}) => el("line", { x1, y1, x2, y2, ...a });
const P = p => `${f1(p[0])} ${f1(p[1])}`;
const polyD = (pts, close = true) => "M" + pts.map(P).join(" L") + (close ? " Z" : "");
const lerp = (a, b, t) => a + (b - a) * t;
const lerpP = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Smooth path through points (Catmull-Rom as cubic Beziers). */
function smoothD(pts, closed = false) {
  const n = pts.length;
  if (n < 3) return polyD(pts, closed);
  const Q = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M${P(pts[0])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = Q(i - 1), p1 = Q(i), p2 = Q(i + 1), p3 = Q(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${P(c1)} ${P(c2)} ${P(p2)}`;
  }
  return d + (closed ? " Z" : "");
}
/** Dense points along the same Catmull-Rom curve (for distance tests). */
function sampleSmooth(pts, step = 8, closed = false) {
  const n = pts.length, out = [];
  if (n < 2) return pts.slice();
  const Q = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = Q(i - 1), p1 = Q(i), p2 = Q(i + 1), p3 = Q(i + 2);
    const k = Math.max(2, Math.ceil(dist(p1, p2) / step));
    for (let j = 0; j < k; j++) {
      const t = j / k, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * ((2 * b) + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(closed ? pts[0] : pts[n - 1]);
  return out;
}
function inPoly(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const minDist = (p, pts) => pts.reduce((m, q) => Math.min(m, dist(p, q)), Infinity);
/** A wobbly closed blob around a centre (bushes, tree crowns, rocks). */
function blobPts(cx, cy, r, R, n = 14, wob = 0.18) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + (R() - 0.5) * 2 * wob;
    out.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]);
  }
  return out;
}

/** A tree crown seen from above: a soft shadow, then leafy clumps lit from the top left. */
function treeCrown(cx, cy, r, R, o = {}) {
  const { dark = "#2b4a26", mid = "#3e6634", light = "#5c8c46", edge = "#15240f", shadow = 0.35 } = o;
  let s = ellipse(cx + r * 0.16, cy + r * 0.2, r * 1.02, r * 0.95, { fill: "#000", opacity: shadow });
  s += path(smoothD(blobPts(cx, cy, r, R, 18, 0.1), true), { fill: dark, stroke: edge, "stroke-width": Math.max(2, r * 0.025) });
  const n = Math.round(8 + r / 5);
  for (let i = 0; i < n; i++) {
    const a = R() * Math.PI * 2, d = Math.sqrt(R()) * r * 0.66;
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, rr = r * (0.2 + R() * 0.14);
    s += path(smoothD(blobPts(x, y, rr, R, 10, 0.2), true), { fill: mid, stroke: edge, "stroke-opacity": 0.45, "stroke-width": 1.5 });
  }
  for (let i = 0; i < n * 0.7; i++) {
    const a = R() * Math.PI * 2, d = Math.sqrt(R()) * r * 0.5;
    const x = cx - r * 0.14 + Math.cos(a) * d, y = cy - r * 0.14 + Math.sin(a) * d, rr = r * (0.1 + R() * 0.09);
    s += path(smoothD(blobPts(x, y, rr, R, 9, 0.22), true), { fill: light, opacity: 0.8 });
  }
  return s;
}

/* ------------------------------------------------------------ labels ---- */
const FAM = { display: "Fraunces", serif: "Alegreya", sans: "Alegreya Sans" };
/** Text with a dark halo so it reads on any ground. `text` may be an array of lines. */
function label(x, y, text, o = {}) {
  const { size = 28, weight = 700, font = "sans", fill = "#f6eedb", halo = "#0c1016", hw = Math.max(4, size * 0.24),
    anchor = "middle", ls, rot = 0, italic = false, opacity, lh = 1.12 } = o;
  const lines = Array.isArray(text) ? text : [text];
  const y0 = y - ((lines.length - 1) * size * lh) / 2;
  const inner = lines.map((t, i) => el("tspan", { x, y: y0 + i * size * lh }, esc(t))).join("");
  return el("text", {
    x, y: y0, "font-family": FAM[font], "font-size": size, "font-weight": weight, "font-style": italic ? "italic" : undefined,
    "text-anchor": anchor, "dominant-baseline": "central", "letter-spacing": ls, fill, stroke: halo, "stroke-width": hw,
    "stroke-linejoin": "round", "paint-order": "stroke", opacity, transform: rot ? `rotate(${rot} ${x} ${y})` : undefined,
  }, inner);
}
/** A way in and out: an arrow pointing off the map plus a label tag. */
function wayMarker(x, y, angleDeg, text, o = {}) {
  const { size = 30, lx = x, ly = y, anchor = "middle", col = "#ffd98a" } = o;
  const a = (angleDeg * Math.PI) / 180;
  const arrow = grp([
    path("M -46 -26 L 0 0 L -46 26 L -34 0 Z", { fill: col, stroke: "#14100a", "stroke-width": 5, "stroke-linejoin": "round", "paint-order": "stroke" }),
    path("M -96 -26 L -50 0 L -96 26 L -84 0 Z", { fill: col, opacity: 0.6, stroke: "#14100a", "stroke-width": 5, "stroke-linejoin": "round", "paint-order": "stroke" }),
  ], { transform: `translate(${f1(x)} ${f1(y)}) rotate(${f1(angleDeg)})` });
  void a;
  return arrow + label(lx, ly, text, { size, anchor, fill: col, weight: 800 });
}

/* -------------------------------------------------------- shared defs --- */
function glowGrad(id, color, op = 0.6, mid = 0.35) {
  return `<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${op}"/>` +
    `<stop offset="${mid}" stop-color="${color}" stop-opacity="${op * 0.45}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
}
/** Fine grain over the whole map, so flat fills don't look plastic. */
const grainFilter = (id, op = 0.07, freq = 0.85) =>
  `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="7" result="n"/>` +
  `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 ${op * 6} ${-op * 2.4}"/></filter>`;
/** Blotchy light/dark variation for large grounds (grass, mud, water). */
const mottleFilter = (id, freq = 0.012, op = 0.22, seed = 3) =>
  `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="3" seed="${seed}" result="n"/>` +
  `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${op * 4} ${-op * 1.6}"/></filter>`;

/** Cobblestones as a 200 px tile (rows of rounded stones, jittered). */
function cobblePattern(id, seed, tones, joint, size = 200, stone = 24, hi = true) {
  const R = rng(seed);
  let s = rect(0, 0, size, size, { fill: joint });
  const rows = Math.round(size / stone);
  const rh = size / rows;
  for (let r = 0; r < rows; r++) {
    let x = -R() * stone;
    while (x < size) {
      const w = stone * (0.8 + R() * 0.6);
      const t = tones[Math.floor(R() * tones.length)];
      const cx = x + 1.5, cy = r * rh + 1.5, cw = w - 3, ch = rh - 3;
      // draw wrapped copies so the tile repeats cleanly
      for (const dx of [0, size, -size]) {
        if (cx + dx + cw < 0 || cx + dx > size) continue;
        s += rect(cx + dx, cy, cw, ch, { rx: 6, fill: t });
        if (hi) s += rect(cx + dx + 2, cy + 2, cw - 6, Math.max(2, ch * 0.32), { rx: 4, fill: "#ffffff", opacity: 0.07 });
      }
      x += w;
    }
  }
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${s}</pattern>`;
}
/** Planks: rows of boards with staggered butt joints. */
function plankPattern(id, seed, tones, seam, size = 200, board = 20, vertical = false) {
  const R = rng(seed);
  let s = rect(0, 0, size, size, { fill: seam });
  for (let r = 0; r < size / board; r++) {
    let x = -R() * 120;
    while (x < size) {
      const w = 70 + R() * 110;
      const t = tones[Math.floor(R() * tones.length)];
      for (const dx of [0, size]) {
        const bx = x + dx - (x + w > size ? size : 0) * 0;
        s += rect(bx + 1, r * board + 1, w - 2, board - 2, { fill: t });
      }
      s += line(x + 6, r * board + board * 0.5, x + w - 8, r * board + board * 0.5, { stroke: "#000", "stroke-opacity": 0.08, "stroke-width": 1 });
      x += w;
    }
  }
  const tr = vertical ? ` patternTransform="rotate(90)"` : "";
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse"${tr}>${s}</pattern>`;
}
/** Flagstones: irregular rectangular slabs. */
function slabPattern(id, seed, tones, joint, size = 200, slab = 50) {
  const R = rng(seed);
  let s = rect(0, 0, size, size, { fill: joint });
  const rows = Math.round(size / slab);
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * slab * 0.5;
    for (let x = -off; x < size; x += slab) {
      const t = tones[Math.floor(R() * tones.length)];
      s += rect(x + 2, r * slab + 2, slab - 4, slab - 4, { rx: 3, fill: t });
      if (x < 0) s += rect(x + size + 2, r * slab + 2, slab - 4, slab - 4, { rx: 3, fill: t });
    }
  }
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${s}</pattern>`;
}
/** Small square tiles (bathrooms, hall). `alt` makes a checkerboard. */
function tilePattern(id, a, b, grout, t = 25) {
  const s = rect(0, 0, t * 2, t * 2, { fill: grout }) +
    rect(1, 1, t - 2, t - 2, { fill: a }) + rect(t + 1, t + 1, t - 2, t - 2, { fill: a }) +
    rect(t + 1, 1, t - 2, t - 2, { fill: b }) + rect(1, t + 1, t - 2, t - 2, { fill: b });
  return `<pattern id="${id}" width="${t * 2}" height="${t * 2}" patternUnits="userSpaceOnUse">${s}</pattern>`;
}
/** Short grass strokes and speckles. */
function grassPattern(id, seed, base, tones, size = 160, n = 90) {
  const R = rng(seed);
  let s = rect(0, 0, size, size, { fill: base });
  for (let i = 0; i < n; i++) {
    const x = R() * size, y = R() * size, l = 4 + R() * 7, a = -Math.PI / 2 + (R() - 0.5) * 1.2;
    const c = tones[Math.floor(R() * tones.length)];
    for (const [dx, dy] of [[0, 0], [size, 0], [-size, 0], [0, size], [0, -size]]) {
      s += line(x + dx, y + dy, x + dx + Math.cos(a) * l, y + dy + Math.sin(a) * l, { stroke: c, "stroke-width": 2, "stroke-linecap": "round" });
    }
  }
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${s}</pattern>`;
}
/** Gravel: many little stones. */
function gravelPattern(id, seed, base, tones, size = 120, n = 260) {
  const R = rng(seed);
  let s = rect(0, 0, size, size, { fill: base });
  for (let i = 0; i < n; i++) {
    const x = R() * size, y = R() * size, r = 1.2 + R() * 2.6;
    const c = tones[Math.floor(R() * tones.length)];
    for (const [dx, dy] of [[0, 0], [size, 0], [-size, 0], [0, size], [0, -size]]) s += circle(x + dx, y + dy, r, { fill: c });
  }
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${s}</pattern>`;
}
/** Brick courses (walls seen from above are just their tops, but huts and beds show brick). */
function brickPattern(id, a, b, mortar, bw = 24, bh = 12) {
  let s = rect(0, 0, bw * 2, bh * 2, { fill: mortar });
  s += rect(1, 1, bw - 2, bh - 2, { fill: a }) + rect(bw + 1, 1, bw - 2, bh - 2, { fill: b });
  s += rect(-bw / 2 + 1, bh + 1, bw - 2, bh - 2, { fill: b }) + rect(bw / 2 + 1, bh + 1, bw - 2, bh - 2, { fill: a }) + rect(bw * 1.5 + 1, bh + 1, bw - 2, bh - 2, { fill: b });
  return `<pattern id="${id}" width="${bw * 2}" height="${bh * 2}" patternUnits="userSpaceOnUse">${s}</pattern>`;
}
/** Roof tiles / slates: overlapping rows, for building roofs. */
function slatePattern(id, seed, tones, line_, size = 120, row = 16, tw = 22) {
  const R = rng(seed);
  let s = rect(0, 0, size, size, { fill: line_ });
  for (let r = 0; r < size / row; r++) {
    const off = (r % 2) * tw / 2;
    for (let x = -off; x < size; x += tw) {
      const t = tones[Math.floor(R() * tones.length)];
      s += rect(x + 1, r * row + 1, tw - 2, row - 1.5, { rx: 2, fill: t });
      if (x < 0) s += rect(x + size + 1, r * row + 1, tw - 2, row - 1.5, { rx: 2, fill: t });
    }
  }
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${s}</pattern>`;
}

/* ----------------------------------------------- walls, doors, windows -- */
/** A straight wall from (x1,y1) to (x2,y2), thickness t, with openings [[a,b],...] measured along it. */
function wall(x1, y1, x2, y2, t, openings = [], o = {}) {
  const { fill = "#2a221d", edge = "#7a6a5c" } = o;
  const len = dist([x1, y1], [x2, y2]);
  const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
  const cuts = [...openings].sort((a, b) => a[0] - b[0]);
  const parts = [];
  let s = -t / 2;
  for (const [a, b] of cuts) { if (a > s) parts.push([s, a]); s = b; }
  if (s < len + t / 2) parts.push([s, len + t / 2]);
  return parts.map(([a, b]) => {
    const ax = x1 + ux * a, ay = y1 + uy * a, bx = x1 + ux * b, by = y1 + uy * b;
    const nx = -uy * t / 2, ny = ux * t / 2;
    const pts = [[ax + nx, ay + ny], [bx + nx, by + ny], [bx - nx, by - ny], [ax - nx, ay - ny]];
    return path(polyD(pts), { fill, stroke: edge, "stroke-width": 2 });
  }).join("");
}
/** A door in a wall opening: leaf drawn open at 90 degrees, with a light swing arc.
 *  (hx,hy) hinge; (ex,ey) the latch end when closed; `side` +1/-1 which way it opens. */
function door(hx, hy, ex, ey, side = 1, o = {}) {
  const { leaf = "#8a5a36", arc = true } = o;
  const len = dist([hx, hy], [ex, ey]);
  const ux = (ex - hx) / len, uy = (ey - hy) / len;
  const nx = -uy * side, ny = ux * side;
  const ox = hx + nx * len, oy = hy + ny * len;
  let s = "";
  if (arc) s += path(`M${P([ex, ey])} A ${f1(len)} ${f1(len)} 0 0 ${side > 0 ? 1 : 0} ${P([ox, oy])}`,
    { fill: "none", stroke: "#f2e6cc", "stroke-opacity": 0.35, "stroke-width": 2, "stroke-dasharray": "6 6" });
  const t = 7;
  const pts = [[hx - ux * t / 2, hy - uy * t / 2], [ox - ux * t / 2, oy - uy * t / 2], [ox + ux * t / 2, oy + uy * t / 2], [hx + ux * t / 2, hy + uy * t / 2]];
  s += path(polyD(pts), { fill: leaf, stroke: "#1a120c", "stroke-width": 2 });
  s += circle(hx, hy, 4, { fill: "#c8a050" });
  return s;
}
/** Glass in a wall: frame plus pane. Horizontal if y1==y2. */
function windowPane(x1, y1, x2, y2, t = 16) {
  const horiz = Math.abs(y1 - y2) < 1;
  const x = Math.min(x1, x2), y = Math.min(y1, y2);
  const w = horiz ? Math.abs(x2 - x1) : t, h = horiz ? t : Math.abs(y2 - y1);
  const rx = horiz ? x : x - t / 2, ry = horiz ? y - t / 2 : y;
  let s = rect(rx, ry, w, h, { fill: "#9cc3d8", stroke: "#2a221d", "stroke-width": 3 });
  s += horiz ? line(rx, ry + h / 2, rx + w, ry + h / 2, { stroke: "#e8f4fa", "stroke-width": 2 })
    : line(rx + w / 2, ry, rx + w / 2, ry + h, { stroke: "#e8f4fa", "stroke-width": 2 });
  return s;
}

/* ------------------------------------------------- render + convert ---- */
const PY_WEBP = "import sys\nfrom PIL import Image\nim = Image.open(sys.argv[1]).convert('RGB')\nim.save(sys.argv[2], 'WEBP', quality=int(sys.argv[3]), method=6)\n";

async function renderMap(browser, map) {
  const { name, svg } = map;
  writeFileSync(join(OUT, `${name}.svg`), svg);
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}\nhtml,body{margin:0;padding:0;background:#000}svg{display:block}</style></head><body>${svg}</body></html>`;
  const htmlPath = join(OUT, `${name}.html`);
  writeFileSync(htmlPath, html);
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  try {
    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
    const faces = ['500 30px "Alegreya Sans"', '700 30px "Alegreya Sans"', '800 30px "Alegreya Sans"', 'italic 700 30px "Alegreya Sans"',
      '700 30px "Fraunces"', '900 30px "Fraunces"'];
    const missing = await page.evaluate(async fs => {
      await Promise.all(fs.map(f => document.fonts.load(f)));
      await document.fonts.ready;
      return fs.filter(f => !document.fonts.check(f));
    }, faces);
    if (missing.length) throw new Error(`${name}: fonts not loaded: ${missing.join(", ")}`);
    const png = join(OUT, `${name}.png`);
    await page.screenshot({ path: png, clip: { x: 0, y: 0, width: W, height: H } });
    const webp = join(DEST, `${name}.webp`);
    execFileSync("python3", ["-I", "-c", PY_WEBP, png, webp, "82"]);
    const mb = statSync(webp).size / 1048576;
    writeFileSync(join(DEST, `${name}.json`), JSON.stringify(map.data, null, 2) + "\n");
    console.log(`${name}: ${webp.replace(ROOT + "/", "")} ${mb.toFixed(2)} MB`);
    if (mb > 2.5) console.warn(`  WARNING: ${name}.webp is over 2.5 MB`);
  } finally {
    await page.close();
  }
}

/** Check token squares: multiples of the grid, inside the map, no two the same. */
function checkTokens(name, t) {
  if (!t) return;
  const all = [...(t.coven ?? []), t.threat, t.innocent].filter(Boolean);
  const seen = new Set();
  for (const [x, y] of all) {
    if (x % G || y % G || x < 0 || y < 0 || x > W - G || y > H - G) throw new Error(`${name}: token square ${x},${y} is off the grid or the map`);
    const k = `${x},${y}`;
    if (seen.has(k)) throw new Error(`${name}: two tokens start on ${k}`);
    seen.add(k);
  }
  if (t.coven && t.coven.length !== 7) throw new Error(`${name}: need 7 coven squares, have ${t.coven.length}`);
}

const svgDoc = (body, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${body}</svg>`;

/* ------------------------------------------------- book (print) maps ---- */
// Every showdown map also has a print version for the book, book/art/map-<name>.svg.
// The same drawing code runs with PRINT set, so the two versions always match:
//   - no night tint, lights, grain, blur or other filters, and no blend modes;
//   - the ground patterns swap to light print ones (each map's `print` overrides);
//   - every colour is mapped onto the book's PLACEHOLDER palette (book/art/README.md);
//   - labels are drawn at print size in the book's fonts, by family name only.
// The print map is about 6.5 in wide, so 1 map unit = 0.156 pt and a 7.5 pt label
// (ART-CHECKLIST 19) needs size 48. Print labels use 50 and up.
// No grid: the rules never count squares (docs/CORE-RULES.md).
let PRINT = false;
const BOOK_ART = join(ROOT, "book", "art");
const PRINT_W_IN = 6.5, PRINT_DPI = 150;
/** The book's PLACEHOLDER palette (book/art/README.md, book/src/book.css). */
const PAL = {
  ink: "#161618", deep: "#222224", dark: "#3a3a3c", soft: "#5c5c60", accentDeep: "#555a63", accent: "#7a7f88",
  edge: "#c9c6bf", paper2: "#e3e1dc", accentB: "#e4e6ea", paper: "#f2f1ee", light: "#faf9f6",
  alarm: "#7c2a2a", alarmB: "#b5473f", good: "#3f6f52",
};
const PAL_SET = new Set(Object.values(PAL));
const hexRgb = h => {
  let s = h.slice(1);
  if (s.length === 3) s = [...s].map(c => c + c).join("");
  return [0, 2, 4].map(i => parseInt(s.slice(i, i + 2), 16) / 255);
};
const lumOf = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const GREY_RAMP = ["ink", "deep", "dark", "soft", "accent", "edge", "paper2", "paper", "light"].map(k => [PAL[k], lumOf(hexRgb(PAL[k]))]);
/** Map any colour onto the palette: strong reds to the alarm pair, strong greens to `good`,
 *  everything else to the grey with the nearest lightness. */
function toPalette(hex) {
  const h = hex.toLowerCase();
  if (PAL_SET.has(h)) return h;
  const rgb = hexRgb(h);
  const [r, g, b] = rgb, mx = Math.max(r, g, b), mn = Math.min(r, g, b), c = mx - mn;
  let hue = 0;
  if (c > 0) hue = mx === r ? (60 * ((g - b) / c) + 360) % 360 : mx === g ? 60 * ((b - r) / c) + 120 : 60 * ((r - g) / c) + 240;
  const L = lumOf(rgb);
  if (c > 0.32 && (hue < 12 || hue > 340) && L < 0.5) return L < 0.26 ? PAL.alarm : PAL.alarmB;
  if (c > 0.22 && hue > 90 && hue < 170 && L < 0.5) return PAL.good;
  let best = GREY_RAMP[0][0], bd = Infinity;
  for (const [hx, l] of GREY_RAMP) { const d = Math.abs(l - L); if (d < bd) { bd = d; best = hx; } }
  return best;
}
/** Turn a drawing made with PRINT set into a book SVG: palette colours, no filters,
 *  print overrides for patterns, unused defs pruned. */
function bookSvg(title, body, defs, overrides = {}) {
  let d = defs.replace(/<filter\b[\s\S]*?<\/filter>/g, "");
  d = d.replace(/<(pattern|linearGradient|radialGradient)\b[^>]*\bid="([^"]+)"[\s\S]*?<\/\1>/g, (m, tag, id) => overrides[id] ?? m);
  for (const [id, def] of Object.entries(overrides)) if (!d.includes(`id="${id}"`)) d += def;
  // keep only the defs the body (or another kept def) refers to
  const items = [...d.matchAll(/<(pattern|linearGradient|radialGradient|mask|clipPath)\b[^>]*\bid="([^"]+)"[\s\S]*?<\/\1>/g)];
  const used = new Set();
  let scan = body, grew = true;
  while (grew) {
    grew = false;
    for (const [m, , id] of items) if (!used.has(id) && (scan.includes(`url(#${id})`) || scan.includes(`href="#${id}"`))) { used.add(id); scan += m; grew = true; }
  }
  d = items.filter(([, , id]) => used.has(id)).map(([m]) => m).join("");
  const colour = s => s.replace(/(fill|stroke|stop-color)="(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})"/g, (m, a, hx) => `${a}="${toPalette(hx)}"`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}"><title>${esc(title)}</title>` +
    `<defs>${colour(d)}</defs>${colour(body)}</svg>\n`;
}
/** The book's art rules (book/art/README.md), checked on every print map. */
function checkBookSvg(name, svg) {
  const bad = [];
  const root = svg.match(/<svg\b[^>]*>/)[0];
  if (!/viewBox="0 0 \d+ \d+"/.test(root)) bad.push("no viewBox");
  if (/\s(width|height)="/.test(root)) bad.push("fixed width or height on <svg>");
  if (!/<title>[^<]+<\/title>/.test(svg)) bad.push("no <title>");
  for (const [re, what] of [[/<image\b/, "<image>"], [/<script\b/i, "<script>"], [/<filter\b|filter="/, "a filter"], [/feTurbulence|feGaussianBlur/, "a filter primitive"],
    [/mix-blend-mode/, "a blend mode"], [/@font-face|@import/, "a web font"], [/(href|src)="(https?:|data:|file:)/, "an external link"], [/url\((?!#)/, "an external url()"]]) if (re.test(svg)) bad.push(what);
  const fams = new Set([...svg.matchAll(/font-family="([^"]+)"/g)].map(m => m[1]));
  for (const f of fams) if (f !== "Fraunces" && f !== "Alegreya Sans") bad.push(`font ${f}`);
  const sizes = [...svg.matchAll(/font-size="([\d.]+)"/g)].map(m => +m[1]);
  const minPt = Math.min(...sizes) * (PRINT_W_IN * 72 / W);
  if (minPt < 7.5) bad.push(`smallest label ${minPt.toFixed(1)} pt at ${PRINT_W_IN} in`);
  const off = [...svg.matchAll(/(?:fill|stroke|stop-color)="(#[0-9a-fA-F]{3,6})"/g)].map(m => m[1].toLowerCase()).filter(c => !PAL_SET.has(c));
  if (off.length) bad.push(`colours off the palette: ${[...new Set(off)].join(" ")}`);
  const kb = Buffer.byteLength(svg) / 1024;
  if (kb > 400) bad.push(`${kb.toFixed(0)} KB (over 400)`);
  if (bad.length) throw new Error(`book map ${name}: ${bad.join("; ")}`);
  return { kb, minPt };
}

/** Print label: ink on a paper halo. */
function plabel(x, y, text, o = {}) {
  const size = o.size ?? 54;
  return label(x, y, text, { weight: 700, fill: PAL.ink, halo: PAL.paper, hw: Math.max(8, size * 0.26), ...o, size });
}
/** Print way marker: a solid double arrow pointing off the map, and its label. */
function pwayMarker(x, y, angleDeg, text, o = {}) {
  const { size = 52, lx = x, ly = y, anchor = "middle", k = 1.45 } = o;
  const arrow = grp([
    path("M -46 -26 L 0 0 L -46 26 L -34 0 Z", { fill: PAL.ink, stroke: PAL.paper, "stroke-width": 4, "stroke-linejoin": "round", "paint-order": "stroke" }),
    path("M -96 -26 L -50 0 L -96 26 L -84 0 Z", { fill: PAL.accentDeep, stroke: PAL.paper, "stroke-width": 4, "stroke-linejoin": "round", "paint-order": "stroke" }),
  ], { transform: `translate(${f1(x)} ${f1(y)}) rotate(${f1(angleDeg)}) scale(${k})` });
  return arrow + plabel(lx, ly, text, { size, anchor, weight: 800, italic: o.italic });
}
/** A thin frame round the print map, so it sits cleanly on the page. */
const printFrame = () => rect(4, 4, W - 8, H - 8, { fill: "none", stroke: PAL.ink, "stroke-width": 8 });

/* ===================================================================== */
/*  2. THE LANTERN HOUSE (gridded): three floors side by side             */
/* ===================================================================== */
// Each floor is a 10-square panel: margin, next door, the house (6 squares
// wide, rows 7-17), next door, margin. Rows 1-6 are the walled garden behind
// the house; rows 18-19 are the street in front. Upper floors show the garden
// and street dimmed, seen from above.
function lanternHouse() {
  const R = rng(1926);
  const defs = [
    plankPattern("lh-planks", 11, ["#7a5638", "#82603f", "#6f4e33", "#8a6644"], "#3d2a1c"),
    plankPattern("lh-planks-attic", 12, ["#5e4d3e", "#665445", "#574738", "#6c5a49"], "#2e241b"),
    slabPattern("lh-flags", 13, ["#8d857a", "#958c80", "#867e73", "#9a9184"], "#4f4942", 200, 50),
    tilePattern("lh-hall", "#b9a78c", "#7c4a38", "#4a3a30", 20),
    tilePattern("lh-bath", "#d4dcd9", "#c8d2cf", "#8a9592", 16),
    slabPattern("lh-pave", 14, ["#6e7176", "#74777c", "#696c71"], "#3f4246", 200, 50),
    cobblePattern("lh-cobble", 15, ["#4c4f57", "#555861", "#474a52", "#5b5e66"], "#25272c", 200, 22),
    grassPattern("lh-grass", 16, "#34492f", ["#3f5937", "#2c3f28", "#486541", "#3a5233"]),
    gravelPattern("lh-gravel", 17, "#7b7568", ["#918a7c", "#686357", "#a39b8c", "#5a564c"]),
    slatePattern("lh-slate", 18, ["#3b3f48", "#353941", "#41454e"], "#202328"),
    brickPattern("lh-brick", "#6d4636", "#774d3b", "#3a2a22", 20, 10),
    glowGrad("lh-lamp", "#ffcf73", 0.75, 0.3),
    glowGrad("lh-warm", "#ffc56a", 0.28, 0.4),
    glowGrad("lh-fire", "#ff9a3c", 0.7, 0.3),
    glowGrad("lh-pot", "#9fe0a8", 0.7, 0.3),
    grainFilter("lh-grain", 0.06),
    `<linearGradient id="lh-eave-l" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0.55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`,
    `<linearGradient id="lh-eave-r" x1="1" x2="0"><stop offset="0" stop-color="#000" stop-opacity="0.55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`,
  ].join("");

  const T = 24; // outer wall thickness
  const IT = 14; // inner wall thickness
  const out = [];
  out.push(rect(0, 0, W, H, { fill: "#141a22" }));

  // ---- the outside, drawn per panel (garden behind, street in front) ----
  function outside(ox, dim) {
    const s = [];
    // neighbours' gardens and the backs of their houses
    s.push(rect(ox + 100, 100, 100, 600, { fill: "#2a3a2a" }), rect(ox + 800, 100, 100, 600, { fill: "#2a3a2a" }));
    s.push(rect(ox + 100, 100, 100, 600, { fill: "url(#lh-grass)", opacity: 0.6 }), rect(ox + 800, 100, 100, 600, { fill: "url(#lh-grass)", opacity: 0.6 }));
    // next-door houses (slate roofs)
    for (const nx of [ox + 100, ox + 800]) {
      s.push(rect(nx, 700, 100, 1100, { fill: "url(#lh-slate)" }));
      s.push(rect(nx, 700, 100, 1100, { fill: "none", stroke: "#15171b", "stroke-width": 4 }));
    }
    // our garden
    s.push(rect(ox + 200, 100, 600, 600, { fill: "url(#lh-grass)" }));
    // gravel path from the back door to the bench
    s.push(path(smoothD([[ox + 550, 700], [ox + 548, 600], [ox + 530, 500], [ox + 470, 430]]), { fill: "none", stroke: "#7b7568", "stroke-width": 74, "stroke-linecap": "round" }));
    s.push(path(smoothD([[ox + 550, 700], [ox + 548, 600], [ox + 530, 500], [ox + 470, 430]]), { fill: "none", stroke: "url(#lh-gravel)", "stroke-width": 66, "stroke-linecap": "round" }));
    // herb beds along the side walls (brick edges, soil, herbs)
    const herbBed = (x, y, w, h, seed) => {
      const r2 = rng(seed);
      let b = rect(x, y, w, h, { fill: "url(#lh-brick)", rx: 4 });
      b += rect(x + 8, y + 8, w - 16, h - 16, { fill: "#3d2c20", rx: 3 });
      const cols = ["#5f8a4a", "#7aa35a", "#4e7a45", "#8fb26a", "#6b9a7a"];
      for (let i = 0; i < Math.floor((w * h) / 900); i++) {
        const px = x + 18 + r2() * (w - 36), py = y + 18 + r2() * (h - 36);
        const c = cols[Math.floor(r2() * cols.length)], rr = 8 + r2() * 8;
        b += path(smoothD(blobPts(px, py, rr, r2, 9, 0.35), true), { fill: c, stroke: "#22331c", "stroke-width": 1.5 });
        b += circle(px, py, 2.2, { fill: "#2b3a22" });
      }
      return b;
    };
    s.push(herbBed(ox + 215, 230, 70, 420, 31), herbBed(ox + 715, 120, 70, 300, 32), herbBed(ox + 300, 120, 300, 70, 33));
    // the apple tree (crown seen from above) with a bench under it
    s.push(rect(ox + 400, 360, 120, 34, { fill: "#6d5038", stroke: "#2b1d12", "stroke-width": 3, rx: 3 })); // bench seat
    for (let i = 1; i < 4; i++) s.push(line(ox + 400, 360 + i * 8.5, ox + 520, 360 + i * 8.5, { stroke: "#4a3424", "stroke-width": 1.5 }));
    s.push(rect(ox + 400, 352, 120, 10, { fill: "#5a412c", stroke: "#2b1d12", "stroke-width": 2, rx: 2 })); // bench back
    s.push(treeCrown(ox + 600, 290, 125, R, { dark: "#2e5228", mid: "#3f6c34", light: "#5e9447" }));
    for (let i = 0; i < 14; i++) {
      const a = R() * Math.PI * 2, rr = 20 + R() * 100;
      s.push(circle(ox + 600 + Math.cos(a) * rr, 290 + Math.sin(a) * rr * 0.9, 6, { fill: "#b8442f", stroke: "#4a1810", "stroke-width": 1.5 }));
    }
    // fallen apples on the grass, a watering can by the bed
    s.push(circle(ox + 660, 430, 6, { fill: "#a13d2a", stroke: "#4a1810", "stroke-width": 1.5 }), circle(ox + 690, 404, 6, { fill: "#a13d2a", stroke: "#4a1810", "stroke-width": 1.5 }));
    // garden walls: high, old stone, on three sides (the house closes the fourth)
    const gw = { fill: "#5d5a52", edge: "#8e897d" };
    s.push(wall(ox + 200, 100, ox + 800, 100, 30, [], gw), wall(ox + 200, 100, ox + 200, 700, 30, [], gw), wall(ox + 800, 100, ox + 800, 700, 30, [], gw));
    // moss on the wall tops
    for (let i = 0; i < 16; i++) {
      const t = R();
      const [mx, my] = i < 6 ? [ox + 200 + t * 600, 100] : i < 11 ? [ox + 200, 100 + t * 600] : [ox + 800, 100 + t * 600];
      s.push(ellipse(mx, my, 8 + R() * 10, 5 + R() * 4, { fill: "#4e6b3a", opacity: 0.8 }));
    }
    // the street: pavement, kerb, cobbled road
    s.push(rect(ox, 1800, 1000, 90, { fill: "url(#lh-pave)" }));
    s.push(rect(ox, 1886, 1000, 10, { fill: "#8b8d90" }));
    s.push(rect(ox, 1896, 1000, 104, { fill: "url(#lh-cobble)" }));
    // a little gutter shadow under the house fronts
    s.push(rect(ox + 100, 1800, 800, 8, { fill: "#000", opacity: 0.35 }));
    // the lamp's light falls on the street on every floor (it never goes out)
    s.push(circle(ox + 350, 1855, 190, { fill: "url(#lh-lamp)", style: "mix-blend-mode:screen" }));
    if (dim) s.push(rect(ox, 100, 1000, 600, { fill: "#05080d", opacity: 0.55 }), rect(ox, 1800, 1000, 200, { fill: "#05080d", opacity: 0.5 }),
      rect(ox + 100, 700, 100, 1100, { fill: "#05080d", opacity: 0.35 }), rect(ox + 800, 700, 100, 1100, { fill: "#05080d", opacity: 0.35 }));
    return s.join("");
  }

  // ---- furniture kit ----
  const wood = "#9a7350", woodD = "#5b3f28";
  const sofa = (x, y, w, h, col, back, seats = 2) => {
    // back: "n" | "s" | "e" | "w" (the side the backrest is on)
    let s = rect(x, y, w, h, { rx: 10, fill: col, stroke: "#1c1410", "stroke-width": 3 });
    const bt = 16, at = 14;
    if (back === "n" || back === "s") {
      const by = back === "n" ? y : y + h - bt;
      s += rect(x, by, w, bt, { rx: 8, fill: col, stroke: "#1c1410", "stroke-width": 2, filter: undefined });
      s += rect(x, y, at, h, { rx: 7, fill: col, stroke: "#1c1410", "stroke-width": 2 }) + rect(x + w - at, y, at, h, { rx: 7, fill: col, stroke: "#1c1410", "stroke-width": 2 });
      for (let i = 1; i < seats; i++) s += line(x + at + ((w - 2 * at) * i) / seats, y + (back === "n" ? bt : 4), x + at + ((w - 2 * at) * i) / seats, y + h - (back === "s" ? bt : 4), { stroke: "#1c1410", "stroke-opacity": 0.5, "stroke-width": 2 });
    } else {
      const bx = back === "w" ? x : x + w - bt;
      s += rect(bx, y, bt, h, { rx: 8, fill: col, stroke: "#1c1410", "stroke-width": 2 });
      s += rect(x, y, w, at, { rx: 7, fill: col, stroke: "#1c1410", "stroke-width": 2 }) + rect(x, y + h - at, w, at, { rx: 7, fill: col, stroke: "#1c1410", "stroke-width": 2 });
      for (let i = 1; i < seats; i++) s += line(x + (back === "w" ? bt : 4), y + at + ((h - 2 * at) * i) / seats, x + w - (back === "e" ? bt : 4), y + at + ((h - 2 * at) * i) / seats, { stroke: "#1c1410", "stroke-opacity": 0.5, "stroke-width": 2 });
    }
    s += rect(x + 3, y + 3, w - 6, h - 6, { rx: 8, fill: "#fff", opacity: 0.06 });
    return s;
  };
  const rug = (x, y, w, h, a, b) =>
    rect(x, y, w, h, { rx: 6, fill: a, stroke: "#1c1410", "stroke-width": 2 }) +
    rect(x + 10, y + 10, w - 20, h - 20, { rx: 4, fill: "none", stroke: b, "stroke-width": 5 }) +
    rect(x + 22, y + 22, w - 44, h - 44, { rx: 3, fill: "none", stroke: b, "stroke-width": 2, "stroke-dasharray": "10 6" });
  const tableTop = (x, y, w, h, col = wood) => {
    let s = rect(x + 4, y + 5, w, h, { rx: 5, fill: "#000", opacity: 0.3 });
    s += rect(x, y, w, h, { rx: 5, fill: col, stroke: woodD, "stroke-width": 3 });
    for (let i = 1; i < Math.floor(h / 14); i++) s += line(x + 6, y + i * 14, x + w - 6, y + i * 14, { stroke: woodD, "stroke-opacity": 0.35, "stroke-width": 1.5 });
    return s;
  };
  const chair = (cx, cy, rot = 0, col = "#6d4a2f") =>
    grp([rect(-15, -15, 30, 30, { rx: 4, fill: col, stroke: "#22160d", "stroke-width": 2.5 }), rect(-15, -15, 30, 7, { rx: 3, fill: "#4e3320", stroke: "#22160d", "stroke-width": 2 })],
      { transform: `translate(${cx} ${cy}) rotate(${rot})` });
  const bed = (x, y, w, h, head, cover, pillows = 2) => {
    // head: "n" | "s" | "e" | "w"
    let s = rect(x + 4, y + 5, w, h, { rx: 5, fill: "#000", opacity: 0.3 });
    s += rect(x, y, w, h, { rx: 5, fill: "#5b3f28", stroke: "#22160d", "stroke-width": 3 });
    const pad = 5;
    s += rect(x + pad, y + pad, w - 2 * pad, h - 2 * pad, { rx: 4, fill: "#e9e2d2" });
    const horizHead = head === "e" || head === "w";
    const L = horizHead ? w : h, S = horizHead ? h : w;
    const pl = 30; // pillow zone depth
    // cover over the foot two thirds, turned down
    if (head === "n") s += rect(x + pad, y + pad + pl + 8, w - 2 * pad, h - 2 * pad - pl - 8, { rx: 4, fill: cover }) + rect(x + pad, y + pad + pl + 8, w - 2 * pad, 12, { fill: "#f4efe4", opacity: 0.8 });
    if (head === "s") s += rect(x + pad, y + pad, w - 2 * pad, h - 2 * pad - pl - 8, { rx: 4, fill: cover }) + rect(x + pad, y + h - pad - pl - 20, w - 2 * pad, 12, { fill: "#f4efe4", opacity: 0.8 });
    if (head === "w") s += rect(x + pad + pl + 8, y + pad, w - 2 * pad - pl - 8, h - 2 * pad, { rx: 4, fill: cover }) + rect(x + pad + pl + 8, y + pad, 12, h - 2 * pad, { fill: "#f4efe4", opacity: 0.8 });
    if (head === "e") s += rect(x + pad, y + pad, w - 2 * pad - pl - 8, h - 2 * pad, { rx: 4, fill: cover }) + rect(x + w - pad - pl - 20, y + pad, 12, h - 2 * pad, { fill: "#f4efe4", opacity: 0.8 });
    for (let i = 0; i < pillows; i++) {
      const span = (S - 2 * pad - 6) / pillows;
      if (head === "n") s += rect(x + pad + 3 + i * span, y + pad + 3, span - 4, pl - 4, { rx: 7, fill: "#f7f3ea", stroke: "#b9b2a2", "stroke-width": 1.5 });
      if (head === "s") s += rect(x + pad + 3 + i * span, y + h - pad - pl + 1, span - 4, pl - 4, { rx: 7, fill: "#f7f3ea", stroke: "#b9b2a2", "stroke-width": 1.5 });
      if (head === "w") s += rect(x + pad + 3, y + pad + 3 + i * span, pl - 4, span - 4, { rx: 7, fill: "#f7f3ea", stroke: "#b9b2a2", "stroke-width": 1.5 });
      if (head === "e") s += rect(x + w - pad - pl + 1, y + pad + 3 + i * span, pl - 4, span - 4, { rx: 7, fill: "#f7f3ea", stroke: "#b9b2a2", "stroke-width": 1.5 });
    }
    void L;
    return s;
  };
  const cupboard = (x, y, w, h, col = "#6a4a30") =>
    rect(x + 3, y + 4, w, h, { fill: "#000", opacity: 0.3 }) + rect(x, y, w, h, { rx: 3, fill: col, stroke: "#22160d", "stroke-width": 3 }) +
    rect(x + 5, y + 5, w - 10, h - 10, { rx: 2, fill: "none", stroke: "#22160d", "stroke-opacity": 0.5, "stroke-width": 1.5 });
  const shelfJars = (x, y, w, h, seed, vertical = true) => {
    const r2 = rng(seed);
    let s = rect(x, y, w, h, { fill: "#6a4a30", stroke: "#22160d", "stroke-width": 3 });
    const cols = ["#c9a14a", "#7fb08a", "#a65a4a", "#8a7fb8", "#d8cfb0", "#5f8fa8", "#b88a5a"];
    const n = Math.floor((vertical ? h : w) / 15);
    for (let i = 0; i < n; i++) {
      const c = cols[Math.floor(r2() * cols.length)];
      const r = 5 + r2() * 2.5;
      const cx = vertical ? x + w / 2 + (r2() - 0.5) * (w - 2 * r - 6) : x + 9 + i * 15;
      const cy = vertical ? y + 9 + i * 15 : y + h / 2 + (r2() - 0.5) * (h - 2 * r - 6);
      s += circle(cx, cy, r, { fill: c, stroke: "#1f1712", "stroke-width": 1.5 }) + circle(cx - r * 0.3, cy - r * 0.3, r * 0.35, { fill: "#fff", opacity: 0.45 });
    }
    return s;
  };
  const stairs = (x, y, w, h, n, upArrowDir, lbl, down = false) => {
    // treads across the short side; arrow points the way up ("n" or "s")
    let s = rect(x, y, w, h, { fill: "#7a5a3c", stroke: "#2b1d12", "stroke-width": 3 });
    for (let i = 1; i < n; i++) s += line(x, y + (h * i) / n, x + w, y + (h * i) / n, { stroke: "#3a281a", "stroke-width": 2.5 });
    for (let i = 0; i < n; i++) s += rect(x + 2, y + (h * i) / n + 2, w - 4, h / n * 0.35, { fill: "#fff", opacity: 0.07 });
    const cx = x + w / 2;
    const dir = down ? (upArrowDir === "n" ? "s" : "n") : upArrowDir; // the arrow points the way you go
    const [ya, yb] = dir === "n" ? [y + h - 22, y + 30] : [y + 22, y + h - 30];
    s += line(cx, ya, cx, yb, { stroke: "#f2e6cc", "stroke-width": 4 });
    const dy = dir === "n" ? 1 : -1;
    s += path(`M${cx - 12} ${yb + 14 * dy} L${cx} ${yb} L${cx + 12} ${yb + 14 * dy}`, { fill: "none", stroke: "#f2e6cc", "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round" });
    if (lbl) s += label(cx, dir === "n" ? y + h - 56 : y + 56, lbl, { size: 20, weight: 800, rot: -90 });
    return s;
  };
  const banister = (x1, y1, x2, y2) => line(x1, y1, x2, y2, { stroke: "#4a2f1c", "stroke-width": 8, "stroke-linecap": "round" }) +
    line(x1, y1, x2, y2, { stroke: "#a57a4f", "stroke-width": 3, "stroke-linecap": "round" });
  const trunk = (x, y, w, h, col, locked, seed) => {
    let s = rect(x + 4, y + 5, w, h, { rx: 4, fill: "#000", opacity: 0.35 });
    s += rect(x, y, w, h, { rx: 5, fill: col, stroke: "#1a120c", "stroke-width": 3 });
    s += rect(x + 4, y + 4, w - 8, h - 8, { rx: 3, fill: "none", stroke: "#000", "stroke-opacity": 0.3, "stroke-width": 2 });
    const vert = h > w;
    const n = 2;
    for (let i = 1; i <= n; i++) {
      if (vert) s += rect(x - 1, y + (h * i) / (n + 1) - 4, w + 2, 8, { fill: "#8a7a5a", stroke: "#2a2014", "stroke-width": 1.5 });
      else s += rect(x + (w * i) / (n + 1) - 4, y - 1, 8, h + 2, { fill: "#8a7a5a", stroke: "#2a2014", "stroke-width": 1.5 });
    }
    // corner caps
    for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) s += circle(cx, cy, 4, { fill: "#a89468", stroke: "#2a2014", "stroke-width": 1 });
    if (locked) {
      const lx = vert ? x + w / 2 : x + w / 2, ly = vert ? y + h / 2 : y + h / 2;
      s += path(`M${lx - 5} ${ly - 2} v-5 a5 5 0 0 1 10 0 v5`, { fill: "none", stroke: "#d9c27a", "stroke-width": 2.5 }) + rect(lx - 7, ly - 2, 14, 11, { rx: 2, fill: "#d9c27a", stroke: "#3a2a10", "stroke-width": 1.5 });
    }
    void seed;
    return s;
  };

  // ---- one floor's house shell: floors, outer walls ----
  const floorFill = (ox, x, y, w, h, fill) => rect(ox + x, y, w, h, { fill });

  // ================= GROUND FLOOR (panel 0) =================
  const g0 = [];
  {
    const ox = 0;
    g0.push(outside(ox, false));
    g0.push(floorFill(ox, 200, 700, 600, 500, "url(#lh-flags)")); // kitchen
    g0.push(floorFill(ox, 200, 1200, 200, 600, "url(#lh-hall)")); // hall
    g0.push(floorFill(ox, 400, 1200, 400, 600, "url(#lh-planks)")); // front room
    // bay window floor
    g0.push(path(polyD([[ox + 470, 1800], [ox + 510, 1858], [ox + 690, 1858], [ox + 730, 1800]]), { fill: "url(#lh-planks)" }));
    // warm light in the rooms
    g0.push(circle(ox + 600, 1500, 330, { fill: "url(#lh-warm)", style: "mix-blend-mode:screen" }));
    g0.push(circle(ox + 500, 950, 330, { fill: "url(#lh-warm)", style: "mix-blend-mode:screen" }));
    // ---- kitchen ----
    g0.push(shelfJars(ox + 214, 760, 34, 400, 41)); // shelves of jars along the left wall
    g0.push(shelfJars(ox + 560, 1146, 200, 34, 42, false)); // more jars along the hall wall side
    // the old range against the right wall, a pot on it
    g0.push(rect(ox + 718, 820, 70, 190, { fill: "#2c2d31", stroke: "#0e0e10", "stroke-width": 3, rx: 4 }));
    g0.push(rect(ox + 724, 826, 58, 178, { fill: "#3b3d42", rx: 3 }));
    for (const cy of [865, 965]) g0.push(circle(ox + 753, cy, 20, { fill: "#1d1e21", stroke: "#56585e", "stroke-width": 3 }));
    g0.push(circle(ox + 753, 865, 70, { fill: "url(#lh-pot)", style: "mix-blend-mode:screen" }));
    g0.push(circle(ox + 753, 865, 18, { fill: "#4a4c52", stroke: "#111", "stroke-width": 3 }) + circle(ox + 753, 865, 13, { fill: "#8ed39a" }) + circle(ox + 749, 861, 4, { fill: "#d8f7dc" }));
    g0.push(line(ox + 766, 878, ox + 784, 896, { stroke: "#4a4c52", "stroke-width": 5, "stroke-linecap": "round" })); // pot handle
    g0.push(rect(ox + 760, 910, 22, 36, { fill: "#55301c", rx: 2 }) + rect(ox + 762, 914, 18, 28, { fill: "#ff9a3c", opacity: 0.8, rx: 2 })); // firebox
    g0.push(circle(ox + 770, 928, 60, { fill: "url(#lh-fire)", style: "mix-blend-mode:screen", opacity: 0.6 }));
    // sink and window on the back wall; dresser
    g0.push(rect(ox + 260, 712, 120, 48, { fill: "#d9d6cf", stroke: "#4a4842", "stroke-width": 3, rx: 4 }) + rect(ox + 272, 720, 96, 32, { fill: "#a9b4b6", rx: 6 }) + circle(ox + 320, 730, 4, { fill: "#6d7072" }));
    g0.push(cupboard(ox + 630, 712, 150, 44, "#5d6b5a"));
    for (let i = 0; i < 5; i++) g0.push(circle(ox + 650 + i * 28, 734, 10, { fill: "#e8e1d0", stroke: "#8a8270", "stroke-width": 2 }));
    // the long scrubbed table with chairs
    g0.push(tableTop(ox + 360, 880, 260, 110, "#c9ad84"));
    for (const cx of [400, 470, 540, 590]) { g0.push(chair(ox + cx, 862, 0)); g0.push(chair(ox + cx, 1008, 180)); }
    g0.push(chair(ox + 338, 935, -90), chair(ox + 642, 935, 90));
    // things on the table: a mortar, a bundle of herbs, a book of recipes, jars (all on the top)
    g0.push(circle(ox + 410, 915, 14, { fill: "#8d8a82", stroke: "#3a3833", "stroke-width": 2.5 }) + circle(ox + 410, 915, 8, { fill: "#5e5b54" }));
    g0.push(rect(ox + 450, 905, 60, 18, { rx: 8, fill: "#6e8f4c", stroke: "#2e3f1f", "stroke-width": 2, transform: `rotate(-12 ${ox + 480} 914)` }));
    g0.push(rect(ox + 530, 935, 56, 40, { rx: 2, fill: "#7a3a2c", stroke: "#2a120c", "stroke-width": 2 }) + line(ox + 558, 935, ox + 558, 975, { stroke: "#2a120c", "stroke-width": 2 }));
    g0.push(circle(ox + 480, 960, 9, { fill: "#c9a14a", stroke: "#2a2014", "stroke-width": 2 }), circle(ox + 500, 962, 8, { fill: "#7fb08a", stroke: "#2a2014", "stroke-width": 2 }));
    // ---- hall ----
    g0.push(stairs(ox + 205, 1300, 92, 300, 9, "n", "UP"));
    g0.push(banister(ox + 300, 1300, ox + 300, 1600));
    g0.push(circle(ox + 300, 1600, 7, { fill: "#a57a4f", stroke: "#4a2f1c", "stroke-width": 3 }));
    // coat hooks by the front door (on the wall), a mat inside the door
    for (let i = 0; i < 3; i++) g0.push(circle(ox + 386, 1722 + i * 24, 5, { fill: "#c8a050", stroke: "#3a2a10", "stroke-width": 1.5 }));
    g0.push(rect(ox + 312, 1735, 76, 50, { rx: 4, fill: "#6a5a3a", stroke: "#2a2010", "stroke-width": 2 }));
    // ---- front room ----
    g0.push(rug(ox + 470, 1330, 260, 260, "#6b2f35", "#d6b36a"));
    // fireplace on the right wall (chimney breast, hearth, fire)
    g0.push(rect(ox + 760, 1400, 40, 200, { fill: "#4a3a30", stroke: "#1e1712", "stroke-width": 3 }));
    g0.push(rect(ox + 712, 1430, 50, 140, { fill: "#7d756b", stroke: "#3a342e", "stroke-width": 3 }));
    g0.push(rect(ox + 760, 1450, 26, 100, { fill: "#24160e" }) + rect(ox + 764, 1462, 16, 76, { fill: "#ff8a2a", opacity: 0.85 }));
    g0.push(circle(ox + 755, 1500, 140, { fill: "url(#lh-fire)", style: "mix-blend-mode:screen" }));
    // two sofas that don't match
    g0.push(sofa(ox + 412, 1330, 62, 220, "#a8843a", "w", 3));
    g0.push(sofa(ox + 490, 1212, 210, 64, "#3d6a5a", "n", 3));
    // armchair in the bay window
    g0.push(sofa(ox + 560, 1760, 80, 70, "#7a4a6a", "s", 1));
    // coffee table with takeaway boxes (all on the top)
    g0.push(tableTop(ox + 540, 1410, 130, 90, "#8a6444"));
    g0.push(rect(ox + 552, 1422, 36, 30, { fill: "#f3eee2", stroke: "#8a8270", "stroke-width": 2 }) + rect(ox + 598, 1430, 36, 30, { fill: "#f3eee2", stroke: "#8a8270", "stroke-width": 2 }) + circle(ox + 650, 1478, 9, { fill: "#d8cfc0", stroke: "#6a6458", "stroke-width": 2 }));
    g0.push(rect(ox + 600, 1466, 32, 22, { fill: "#c43b2b", stroke: "#5a150d", "stroke-width": 2, rx: 2 }));
    // bookcase on the hall wall
    g0.push(cupboard(ox + 412, 1212, 60, 34, "#5a3e28"));
    // ---- walls (ground floor) ----
    const Wd = { fill: "#2a221d", edge: "#7a6a5c" };
    g0.push(wall(ox + 200, 700, ox + 800, 700, T, [[300, 400]], Wd)); // back wall: back door at x 500-600 (opening 300..400 along wall)
    g0.push(windowPane(ox + 250, 700, ox + 390, 700, 18));
    g0.push(windowPane(ox + 620, 700, ox + 760, 700, 18));
    g0.push(wall(ox + 200, 700, ox + 200, 1800, T + 6, [], Wd)); // party walls
    g0.push(wall(ox + 800, 700, ox + 800, 1800, T + 6, [], Wd));
    g0.push(wall(ox + 200, 1800, ox + 800, 1800, T, [[100, 200], [270, 530]], Wd)); // front: door at x 300-400, bay at 470-730
    g0.push(wall(ox + 200, 1200, ox + 800, 1200, IT, [[100, 200]], Wd)); // kitchen / hall + front room, door at x 300-400
    g0.push(wall(ox + 400, 1200, ox + 400, 1800, IT, [[400, 500]], Wd)); // hall / front room, door at y 1600-1700
    // bay window walls with glass
    const bay = [[ox + 470, 1800], [ox + 510, 1858], [ox + 690, 1858], [ox + 730, 1800]];
    g0.push(path(polyD(bay, false), { fill: "none", stroke: "#2a221d", "stroke-width": 20, "stroke-linejoin": "miter" }));
    g0.push(path(polyD(bay, false), { fill: "none", stroke: "#9cc3d8", "stroke-width": 8 }));
    g0.push(path(polyD(bay, false), { fill: "none", stroke: "#e8f4fa", "stroke-width": 2 }));
    // doors
    g0.push(door(ox + 600, 700, ox + 500, 700, -1)); // back door, opens into the kitchen
    g0.push(door(ox + 400, 1800, ox + 300, 1800, 1, { leaf: "#3d5a4a" })); // front door (green), opens into the hall
    g0.push(door(ox + 400, 1200, ox + 300, 1200, -1)); // hall to kitchen
    g0.push(door(ox + 400, 1700, ox + 400, 1600, 1)); // hall to front room
    // the doorstep and the lamp over the front door (on a bracket fixed to the wall)
    g0.push(rect(ox + 296, 1812, 108, 26, { fill: "#8f8a80", stroke: "#4a4640", "stroke-width": 2 }));
    out.push(grp(g0));
  }

  // ================= FIRST FLOOR (panel 1) =================
  const g1 = [];
  {
    const ox = 1000;
    g1.push(outside(ox, true));
    g1.push(floorFill(ox, 200, 700, 600, 1100, "url(#lh-planks)"));
    g1.push(floorFill(ox, 400, 1000, 400, 300, "url(#lh-bath)"));
    g1.push(circle(ox + 500, 1250, 450, { fill: "url(#lh-warm)", style: "mix-blend-mode:screen", opacity: 0.8 }));
    // ---- back bedroom (lodger's room) ----
    g1.push(rug(ox + 440, 790, 200, 120, "#3e5a6a", "#c9b27a"));
    g1.push(bed(ox + 214, 760, 140, 110, "w", "#5b7f4f")); // double bed, head on the left wall
    g1.push(cupboard(ox + 680, 716, 106, 46));
    g1.push(rect(ox + 600, 940, 110, 44, { rx: 3, fill: "#6a4a30", stroke: "#22160d", "stroke-width": 3 })); // desk under the landing wall
    for (const [px, py, c] of [[ox + 300, 716, "#5f8a4a"], [ox + 340, 716, "#7aa35a"], [ox + 380, 716, "#4e7a45"]]) {
      g1.push(rect(px - 12, py, 24, 18, { fill: "#a0583a", stroke: "#3a1a10", "stroke-width": 2 }) + path(smoothD(blobPts(px, py + 9, 14, R, 9, 0.35), true), { fill: c, stroke: "#22331c", "stroke-width": 1.5 }));
    }
    // ---- bathroom ----
    // claw-foot bath along the back of the bathroom, feet showing at the corners
    for (const [fx, fy] of [[ox + 612, 1018], [ox + 776, 1018], [ox + 612, 1078], [ox + 776, 1078]]) g1.push(circle(fx, fy, 6, { fill: "#c8a050", stroke: "#3a2a10", "stroke-width": 1.5 }));
    g1.push(rect(ox + 606, 1012, 176, 72, { rx: 30, fill: "#f2efe8", stroke: "#6d6a62", "stroke-width": 3 }) + rect(ox + 618, 1022, 152, 52, { rx: 24, fill: "#bcd2d6" }) + circle(ox + 762, 1048, 4, { fill: "#6d6a62" }));
    // pipes that knock, along the right wall
    g1.push(line(ox + 784, 1090, ox + 784, 1290, { stroke: "#a77a4a", "stroke-width": 6 }) + line(ox + 774, 1090, ox + 774, 1290, { stroke: "#a77a4a", "stroke-width": 6 }));
    for (const py of [1130, 1200, 1270]) g1.push(rect(ox + 768, py, 22, 6, { fill: "#6d4a2a" }));
    // sink with the mirror on the wall above it, toilet
    g1.push(rect(ox + 430, 1278, 60, 10, { fill: "#d9e6ea", stroke: "#4a4842", "stroke-width": 2, opacity: 0.9 })); // mirror (on the wall)
    g1.push(ellipse(ox + 460, 1255, 30, 20, { fill: "#f2efe8", stroke: "#6d6a62", "stroke-width": 3 }) + ellipse(ox + 460, 1257, 20, 12, { fill: "#bcd2d6" }));
    g1.push(rect(ox + 520, 1250, 50, 36, { rx: 4, fill: "#f2efe8", stroke: "#6d6a62", "stroke-width": 3 }) + ellipse(ox + 545, 1228, 22, 26, { fill: "#f2efe8", stroke: "#6d6a62", "stroke-width": 3 }));
    g1.push(rect(ox + 640, 1210, 80, 60, { rx: 4, fill: "#6a7f86", opacity: 0.8 })); // bath mat
    // ---- front bedroom (gran's room) ----
    g1.push(rug(ox + 470, 1470, 220, 160, "#5a3a5e", "#d6b36a"));
    g1.push(bed(ox + 540, 1316, 120, 150, "n", "#8a4a3e"));
    g1.push(rect(ox + 476, 1320, 50, 44, { rx: 3, fill: "#6a4a30", stroke: "#22160d", "stroke-width": 3 }) + circle(ox + 501, 1342, 11, { fill: "#f3e3b0", stroke: "#8a7040", "stroke-width": 2 })); // bedside table and lamp
    g1.push(rect(ox + 760, 1400, 40, 200, { fill: "#4a3a30", stroke: "#1e1712", "stroke-width": 3 })); // chimney breast (same as below)
    g1.push(rect(ox + 726, 1450, 36, 100, { fill: "#7d756b", stroke: "#3a342e", "stroke-width": 2 }));
    g1.push(cupboard(ox + 416, 1660, 46, 120)); // wardrobe
    g1.push(rect(ox + 560, 1746, 120, 40, { rx: 3, fill: "#6a4a30", stroke: "#22160d", "stroke-width": 3 }) + rect(ox + 600, 1750, 40, 8, { fill: "#d9e6ea", opacity: 0.9 })); // dressing table in the window
    g1.push(chair(ox + 620, 1716, 180, "#7a5a8a"));
    // ---- small room over the stairs ----
    g1.push(bed(ox + 214, 1716, 150, 70, "w", "#a8843a", 1));
    g1.push(rect(ox + 330, 1640, 40, 40, { rx: 3, fill: "#6a4a30", stroke: "#22160d", "stroke-width": 3 })); // little table
    for (let i = 0; i < 4; i++) g1.push(rect(ox + 334 + (i % 2) * 4, 1644 + i * 7, 30, 6, { fill: ["#c9a14a", "#5f8fa8", "#a65a4a", "#7fb08a"][i], stroke: "#1f1712", "stroke-width": 1 })); // a stack of notebooks on it
    // ---- landing and stairs ----
    g1.push(rect(ox + 205, 1300, 92, 300, { fill: "#0e0b08" })); // stairwell (looking down)
    g1.push(stairs(ox + 205, 1300, 92, 300, 9, "n", null, true));
    g1.push(rect(ox + 205, 1300, 92, 300, { fill: "#000", opacity: 0.35 }));
    g1.push(label(ox + 251, 1355, "DOWN", { size: 20, weight: 800, rot: -90 }));
    g1.push(banister(ox + 300, 1300, ox + 300, 1600), banister(ox + 205, 1600, ox + 300, 1600));
    g1.push(stairs(ox + 205, 1005, 92, 195, 6, "n", "UP"));
    g1.push(banister(ox + 300, 1005, ox + 300, 1200));
    // ---- walls (first floor) ----
    const Wd = { fill: "#2a221d", edge: "#7a6a5c" };
    g1.push(wall(ox + 200, 700, ox + 800, 700, T, [], Wd));
    g1.push(windowPane(ox + 420, 700, ox + 620, 700, 18));
    g1.push(wall(ox + 200, 700, ox + 200, 1800, T + 6, [], Wd));
    g1.push(wall(ox + 800, 700, ox + 800, 1800, T + 6, [], Wd));
    g1.push(wall(ox + 200, 1800, ox + 800, 1800, T, [], Wd));
    g1.push(windowPane(ox + 240, 1800, ox + 360, 1800, 18));
    g1.push(windowPane(ox + 520, 1800, ox + 720, 1800, 18));
    g1.push(wall(ox + 200, 1000, ox + 800, 1000, IT, [[100, 200]], Wd)); // back bedroom, door at x 300-400
    g1.push(wall(ox + 400, 1000, ox + 400, 1800, IT, [[100, 200], [400, 500]], Wd)); // landing / bathroom + front bedroom
    g1.push(wall(ox + 400, 1300, ox + 800, 1300, IT, [], Wd));
    g1.push(wall(ox + 200, 1600, ox + 400, 1600, IT, [[100, 200]], Wd)); // small room, door at x 300-400
    g1.push(door(ox + 400, 1000, ox + 300, 1000, 1)); // into the back bedroom
    g1.push(door(ox + 400, 1200, ox + 400, 1100, 1)); // bathroom
    g1.push(door(ox + 400, 1500, ox + 400, 1400, 1)); // front bedroom
    g1.push(door(ox + 400, 1600, ox + 300, 1600, -1)); // small room
    out.push(grp(g1));
  }

  // ================= ATTIC (panel 2) =================
  const g2 = [];
  {
    const ox = 2000;
    g2.push(outside(ox, true));
    g2.push(floorFill(ox, 200, 700, 600, 1100, "url(#lh-planks-attic)"));
    // low roof along both side walls (the roof slopes down to them)
    g2.push(rect(ox + 200, 700, 90, 1100, { fill: "url(#lh-eave-l)" }), rect(ox + 710, 700, 90, 1100, { fill: "url(#lh-eave-r)" }));
    // roof beams overhead (faint): ridge and rafters
    g2.push(line(ox + 500, 712, ox + 500, 1788, { stroke: "#2e241b", "stroke-width": 10, opacity: 0.45 }));
    for (let y = 800; y < 1800; y += 200) g2.push(line(ox + 212, y, ox + 788, y, { stroke: "#2e241b", "stroke-width": 6, opacity: 0.3 }));
    // a warm pool of light by the Book (candle) and cool light from the round window
    g2.push(circle(ox + 500, 1300, 320, { fill: "url(#lh-warm)", style: "mix-blend-mode:screen" }));
    // ---- the Book on its lectern, on a rug, a candle on a stand beside it ----
    g2.push(rug(ox + 400, 1200, 200, 200, "#4a2a2e", "#c9a65a"));
    g2.push(rect(ox + 486, 1290, 28, 28, { fill: "#4a3020", stroke: "#1a100a", "stroke-width": 2 })); // lectern post base
    g2.push(rect(ox + 462, 1262, 76, 54, { rx: 3, fill: "#6a4428", stroke: "#1a100a", "stroke-width": 3 })); // sloped top
    g2.push(rect(ox + 466, 1266, 68, 46, { rx: 2, fill: "#3a2418" })); // book cover (overhang)
    g2.push(rect(ox + 470, 1269, 30, 40, { fill: "#efe4c8" }) + rect(ox + 500, 1269, 30, 40, { fill: "#f4ead2" }) + line(ox + 500, 1269, ox + 500, 1309, { stroke: "#7a6a4a", "stroke-width": 2 }));
    for (let i = 0; i < 5; i++) {
      g2.push(path(`M${ox + 474} ${1276 + i * 7} q 5 -2 10 0 t 10 0`, { fill: "none", stroke: "#6a5a40", "stroke-width": 1.2 }));
      g2.push(path(`M${ox + 504} ${1276 + i * 7} q 5 -2 10 0 t 10 0`, { fill: "none", stroke: "#6a5a40", "stroke-width": 1.2 }));
    }
    g2.push(circle(ox + 590, 1236, 14, { fill: "#5a4a3a", stroke: "#1a120c", "stroke-width": 2 }) + circle(ox + 590, 1236, 6, { fill: "#f3e7c8" }) + circle(ox + 590, 1236, 2.5, { fill: "#ffb347" }));
    g2.push(circle(ox + 590, 1236, 80, { fill: "url(#lh-lamp)", style: "mix-blend-mode:screen", opacity: 0.6 }));
    // a reading chair at the round window, looking down at the door
    g2.push(sofa(ox + 540, 1700, 76, 70, "#6a5a3a", "n", 1));
    // ---- old trunks under the low roof ----
    g2.push(trunk(ox + 216, 720, 70, 46, "#5a3b28", false));
    g2.push(trunk(ox + 216, 790, 70, 46, "#3d4a5a", true));
    g2.push(trunk(ox + 216, 1320, 70, 50, "#6a4a2a", true)); // gran's trunk (labelled)
    g2.push(rect(ox + 236, 1334, 22, 14, { fill: "#efe4c8", stroke: "#6a5a40", "stroke-width": 1.5 }) + line(ox + 240, 1341, ox + 254, 1341, { stroke: "#6a5a40", "stroke-width": 1.2 }));
    g2.push(trunk(ox + 216, 1450, 70, 46, "#4a3a2a", false));
    g2.push(trunk(ox + 714, 730, 70, 46, "#2f3f35", true));
    g2.push(trunk(ox + 714, 830, 70, 50, "#5a2f2a", false));
    g2.push(trunk(ox + 714, 1180, 70, 46, "#4a4030", true));
    g2.push(trunk(ox + 714, 1660, 70, 46, "#3a3040", false));
    // boxes, a rolled carpet, a stack of books
    g2.push(rect(ox + 230, 1560, 52, 52, { fill: "#8a7350", stroke: "#3a2a18", "stroke-width": 2.5 }) + line(ox + 230, 1586, ox + 282, 1586, { stroke: "#3a2a18", "stroke-width": 1.5 }));
    g2.push(rect(ox + 640, 1000, 40, 150, { rx: 18, fill: "#7a3a3a", stroke: "#2a1010", "stroke-width": 2.5 }) + ellipse(ox + 660, 1003, 17, 6, { fill: "#a8584a" }));
    for (let i = 0; i < 4; i++) g2.push(rect(ox + 300 + (i % 2) * 3, 1680 + i * 9, 40, 8, { fill: ["#7a3a2c", "#3d4a5a", "#6a5a3a", "#4a6a4a"][i], stroke: "#1f1712", "stroke-width": 1 }));
    // chimney stack on the right wall (same place as the fireplaces below)
    g2.push(rect(ox + 742, 1400, 58, 200, { fill: "url(#lh-brick)", stroke: "#1e1712", "stroke-width": 3 }));
    // ---- stair opening (up from the first floor) with a rail round it ----
    g2.push(rect(ox + 205, 1005, 92, 195, { fill: "#0e0b08" }));
    g2.push(stairs(ox + 205, 1005, 92, 195, 6, "n", null, true));
    g2.push(rect(ox + 205, 1005, 92, 195, { fill: "#000", opacity: 0.35 }));
    g2.push(label(ox + 251, 1062, "DOWN", { size: 20, weight: 800, rot: -90 }));
    g2.push(banister(ox + 300, 1005, ox + 300, 1200), banister(ox + 205, 1200, ox + 300, 1200));
    // ---- walls (attic) ----
    const Wd = { fill: "#2a221d", edge: "#7a6a5c" };
    g2.push(wall(ox + 200, 700, ox + 800, 700, T, [], Wd));
    g2.push(wall(ox + 200, 700, ox + 200, 1800, T + 6, [], Wd));
    g2.push(wall(ox + 800, 700, ox + 800, 1800, T + 6, [], Wd));
    g2.push(wall(ox + 200, 1800, ox + 800, 1800, T, [[245, 355]], Wd));
    // the round window in the front gable: a ring of frame, four panes
    g2.push(circle(ox + 500, 1800, 54, { fill: "#2a221d", stroke: "#7a6a5c", "stroke-width": 2 }));
    g2.push(circle(ox + 500, 1800, 42, { fill: "#9cc3d8" }));
    for (const d of [-21, 0, 21]) {
      const hh = Math.sqrt(42 * 42 - d * d);
      g2.push(line(ox + 500 + d, 1800 - hh, ox + 500 + d, 1800 + hh, { stroke: "#2a221d", "stroke-width": d ? 3 : 4 }));
      g2.push(line(ox + 500 - hh, 1800 + d, ox + 500 + hh, 1800 + d, { stroke: "#2a221d", "stroke-width": d ? 3 : 4 }));
    }
    g2.push(circle(ox + 500, 1800, 42, { fill: "none", stroke: "#e8f4fa", "stroke-width": 2 }));
    out.push(grp(g2));
  }

  // the lamp over the front door, drawn last on the ground floor so it sits over the step
  {
    const ox = 0;
    out.push(line(ox + 350, 1812, ox + 350, 1846, { stroke: "#1a1612", "stroke-width": 6, "stroke-linecap": "round" })); // bracket from the wall
    out.push(rect(ox + 336, 1840, 28, 28, { rx: 3, fill: "#2a2520", stroke: "#0f0c09", "stroke-width": 3 }) + rect(ox + 341, 1845, 18, 18, { rx: 2, fill: "#ffe2a0" }));
    out.push(circle(ox + 350, 1854, 60, { fill: "url(#lh-lamp)", style: "mix-blend-mode:screen" }));
  }

  // ---- labels ----
  const L = [];
  const floorTitle = (ox, t) => label(ox + 500, 52, t, { font: "display", size: 40, weight: 700, ls: 6, fill: "#f3e3bb" });
  L.push(floorTitle(0, "GROUND FLOOR"), floorTitle(1000, "FIRST FLOOR"), floorTitle(2000, "ATTIC"));
  const rl = (x, y, t, o = {}) => label(x, y, t, { size: 26, weight: 700, ...o });
  L.push(rl(470, 150, "Walled garden", { size: 28 }));
  L.push(rl(300, 1080, "Kitchen"), rl(300, 1112, "(brewing)", { size: 20, weight: 500 }));
  L.push(rl(300, 1235, "Hall", { size: 22 }));
  L.push(rl(600, 1640, "Front room"));
  L.push(rl(550, 1950, "Street", { size: 24 }), rl(1550, 1950, "Street (below)", { size: 22, weight: 500 }), rl(2550, 1950, "Street (below)", { size: 22, weight: 500 }));
  L.push(rl(220, 1952, "Front door, lamp over it", { size: 20, anchor: "start" }));
  L.push(rl(625, 668, "Back door", { size: 20, anchor: "start" }));
  L.push(rl(1500, 400, "Garden (below)", { size: 22, weight: 500 }), rl(2500, 400, "Garden (below)", { size: 22, weight: 500 }));
  L.push(rl(1500, 935, "Back bedroom"));
  L.push(rl(1500, 1160, "Bathroom"));
  L.push(rl(1600, 1660, "Front bedroom"));
  L.push(rl(1300, 1655, "Small room", { size: 20 }), rl(1300, 1677, "over the stairs", { size: 16, weight: 500 }));
  L.push(rl(1350, 1080, "Landing", { size: 20, rot: -90 }));
  L.push(rl(2500, 1435, "The Book", { size: 26 }), rl(2500, 1462, "on its lectern", { size: 18, weight: 500 }));
  L.push(rl(2540, 880, "Old trunks", { size: 24 }));
  L.push(rl(2500, 1885, "Round window", { size: 22 }));
  L.push(rl(150, 1250, "Next door", { size: 18, weight: 500, rot: -90, opacity: 0.8 }), rl(850, 1250, "Next door", { size: 18, weight: 500, rot: -90, opacity: 0.8 }));
  out.push(grp(L));
  out.push(rect(0, 0, W, H, { filter: "url(#lh-grain)", opacity: 1 }));
  // panel separators
  out.push(line(1000, 0, 1000, H, { stroke: "#0a0d12", "stroke-width": 6 }), line(2000, 0, 2000, H, { stroke: "#0a0d12", "stroke-width": 6 }));

  const data = {
    width: W, height: H, grid: G,
    points: [
      { key: "front-door", label: "The front door, with the lamp over it that has never gone out", x: 350, y: 1850 },
      { key: "front-room", label: "The front room: sofas that don't match, a fireplace, a bay window onto the street", x: 600, y: 1520 },
      { key: "hall", label: "The hall (Rook stands here in human shape)", x: 350, y: 1450 },
      { key: "kitchen", label: "The kitchen: long table, old range, shelves of jars. Potions are brewed here", x: 500, y: 1080 },
      { key: "walled-garden", label: "The back door and the walled garden: herbs, an apple tree, a bench under it", x: 550, y: 520 },
      { key: "back-bedroom", label: "Back bedroom (the lodger's room)", x: 1500, y: 880 },
      { key: "bathroom", label: "The bathroom: a claw-foot bath, knocking pipes, a mirror that fogs over", x: 1650, y: 1150 },
      { key: "front-bedroom", label: "Front bedroom (the gran's room)", x: 1600, y: 1550 },
      { key: "small-room", label: "The small room over the stairs", x: 1300, y: 1720 },
      { key: "the-book", label: "The Book on its lectern (research happens here)", x: 2500, y: 1290 },
      { key: "old-trunks", label: "Old trunks: clothes, letters, tools and keepsakes. Some are locked", x: 2250, y: 800 },
      { key: "round-window", label: "The round window: it looks down on the street and the lamp", x: 2500, y: 1760 },
    ],
    tokens: {
      // front room (2), kitchen, garden, hall (where Rook stands), front bedroom, attic by the Book
      coven: [[500, 1600], [700, 1300], [400, 1100], [500, 500], [300, 1400], [1600, 1600], [2600, 1300]],
      threat: null, innocent: null,
    },
  };
  return { name: "lantern-house", svg: svgDoc(out.join(""), defs), data };
}

/* ===================================================================== */
/*  Shared town kit (night market and city): roofs, stalls, string lights */
/* ===================================================================== */
/** A pitched roof seen from above: slates, a ridge, the far slope in shade, maybe chimneys. */
function roof(x, y, w, h, o = {}) {
  const { pat = "url(#tk-slate)", ridge = w >= h ? "h" : "v", R = rng(1), chimneys = 1, edge = "#0d0f13", shade = 0.28 } = o;
  let s = rect(x + 6, y + 8, w, h, { fill: "#000", opacity: 0.35 });
  s += rect(x, y, w, h, { fill: pat, stroke: edge, "stroke-width": 4 });
  if (ridge === "h") {
    s += rect(x, y + h / 2, w, h / 2, { fill: "#000", opacity: shade });
    s += line(x + 2, y + h / 2, x + w - 2, y + h / 2, { stroke: "#5d6068", "stroke-width": 5 });
  } else {
    s += rect(x + w / 2, y, w / 2, h, { fill: "#000", opacity: shade });
    s += line(x + w / 2, y + 2, x + w / 2, y + h - 2, { stroke: "#5d6068", "stroke-width": 5 });
  }
  for (let i = 0; i < chimneys; i++) {
    const t = 0.2 + R() * 0.6;
    const cx = ridge === "h" ? x + w * t : x + w / 2 + (R() < 0.5 ? -18 : 18) * 0.4;
    const cy = ridge === "h" ? y + h / 2 + (R() < 0.5 ? -18 : 18) * 0.4 : y + h * t;
    s += rect(cx - 6, cy - 3, 34, 24, { fill: "#000", opacity: 0.35 });
    s += rect(cx - 17, cy - 12, 34, 24, { fill: "#6a4a3c", stroke: "#1e1410", "stroke-width": 3 });
    for (const dx of [-8, 8]) s += circle(cx + dx, cy, 6, { fill: "#a0644a", stroke: "#1e1410", "stroke-width": 2 }) + circle(cx + dx, cy, 3, { fill: "#140e0b" });
  }
  return s;
}
/** Warm light from a lit window spilling onto the ground in front of a wall. */
const spill = (x, y, w, h, op = 0.5) => rect(x, y, w, h, { fill: "url(#tk-spill)", opacity: op, style: "mix-blend-mode:screen" });
/** A soft half-ellipse of light thrown from a lit opening in a wall.
 *  "s"/"n": the opening runs a..b along x at height c; "e"/"w": a..b along y at x = c. */
function pool(a, b, c, depth, dir, op = 0.85) {
  const r = (b - a) / 2;
  if (dir === "s") return path(`M${a} ${c} A ${f1(r)} ${depth} 0 0 0 ${b} ${c} Z`, { fill: "url(#tk-pool-s)", opacity: op });
  if (dir === "n") return path(`M${a} ${c} A ${f1(r)} ${depth} 0 0 1 ${b} ${c} Z`, { fill: "url(#tk-pool-n)", opacity: op });
  if (dir === "e") return path(`M${c} ${a} A ${depth} ${f1(r)} 0 0 1 ${c} ${b} Z`, { fill: "url(#tk-pool-e)", opacity: op });
  return path(`M${c} ${a} A ${depth} ${f1(r)} 0 0 0 ${c} ${b} Z`, { fill: "url(#tk-pool-w)", opacity: op });
}
/** A market stall: striped canopy over the back, a counter at the front with its goods.
 *  facing: the side the customers stand on ("n" | "s" | "e" | "w"). */
function stall(x, y, w, h, facing, colA, colB, goods, seed) {
  const R = rng(seed);
  const s = [];
  const fd = 30; // counter depth at the front
  s.push(rect(x + 6, y + 8, w - 4, h - 4, { fill: "#000", opacity: 0.35 }));
  // counter strip
  let cx = x, cy = y, cw = w, ch = h, kx = x, ky = y, kw = w, kh = h;
  if (facing === "w") { kw = fd; cx = x + fd - 6; cw = w - fd + 6; }
  if (facing === "e") { kx = x + w - fd; kw = fd; cw = w - fd + 6; }
  if (facing === "n") { kh = fd; cy = y + fd - 6; ch = h - fd + 6; }
  if (facing === "s") { ky = y + h - fd; kh = fd; ch = h - fd + 6; }
  s.push(rect(kx + 4, ky + 4, kw - 8, kh - 8, { fill: "#8a6a48", stroke: "#2a1c10", "stroke-width": 2.5, rx: 3 }));
  // goods on the counter (inside its outline)
  const gx = kx + 8, gy = ky + 8, gw = kw - 16, gh = kh - 16;
  const along = facing === "w" || facing === "e" ? "v" : "h";
  const n = Math.max(3, Math.floor((along === "v" ? gh : gw) / 22));
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const px = along === "v" ? gx + gw / 2 : gx + gw * t, py = along === "v" ? gy + gh * t : gy + gh / 2;
    if (goods === "food") {
      const c = ["#d9a440", "#b8562e", "#e8d7a0", "#7a9a3a", "#c47a3a"][Math.floor(R() * 5)];
      s.push(circle(px, py, 8, { fill: "#3a3a3e", stroke: "#111", "stroke-width": 1.5 }) + circle(px, py, 5.5, { fill: c }));
    } else if (goods === "records") {
      s.push(rect(px - 9, py - 9, 18, 18, { fill: ["#c94a3a", "#e0c050", "#3a7ac9", "#2a2a2a", "#9a5ac9"][Math.floor(R() * 5)], stroke: "#111", "stroke-width": 1.5 }) + circle(px, py, 5, { fill: "#111" }));
    } else if (goods === "clothes") {
      s.push(rect(px - 7, py - 9, 14, 18, { rx: 3, fill: ["#c47a9a", "#5a8ac4", "#d9c27a", "#7ab07a", "#c4603a", "#e8e2d2"][Math.floor(R() * 6)], stroke: "#111", "stroke-width": 1.5 }));
    } else if (goods === "fortune") {
      if (i === Math.floor(n / 2)) s.push(circle(px, py, 9, { fill: "#cfe4f0", stroke: "#3a4a5a", "stroke-width": 2 }) + circle(px - 3, py - 3, 3, { fill: "#fff" }));
      else s.push(rect(px - 6, py - 8, 12, 16, { rx: 2, fill: "#efe4c8", stroke: "#4a3a60", "stroke-width": 1.5, transform: `rotate(${(R() - 0.5) * 40} ${px} ${py})` }));
    } else if (goods === "fish") {
      s.push(rect(px - 10, py - 9, 20, 18, { rx: 2, fill: "#e8ecec", stroke: "#6a7070", "stroke-width": 1.5 }));
      s.push(ellipse(px - 1, py, 7, 3, { fill: "#8a9aa8" }) + path(`M${px + 5} ${py} l5 -4 l0 8 Z`, { fill: "#8a9aa8" }));
    } else if (goods === "books") {
      s.push(rect(px - 8, py - 9, 16, 18, { fill: ["#7a3a2c", "#3d4a5a", "#6a5a3a", "#4a6a4a", "#8a6a2a"][Math.floor(R() * 5)], stroke: "#111", "stroke-width": 1.5 }));
    } else if (goods === "plants") {
      s.push(circle(px, py, 8, { fill: "#a0583a", stroke: "#3a1a10", "stroke-width": 1.5 }) + circle(px, py, 6, { fill: ["#5f8a4a", "#7aa35a", "#4e7a45"][Math.floor(R() * 3)] }));
    } else { // lamps, candles, trinkets
      s.push(circle(px, py, 6, { fill: ["#e8c46a", "#c9a14a", "#d98a5a", "#9ac4c4"][Math.floor(R() * 4)], stroke: "#2a1c10", "stroke-width": 1.5 }));
    }
  }
  // canopy with stripes running front to back, and a scalloped front edge
  const stripes = [];
  const sN = Math.max(3, Math.round((along === "v" ? ch : cw) / 20));
  for (let i = 0; i < sN; i++) {
    if (i % 2) continue;
    if (along === "v") stripes.push(rect(cx, cy + (ch * i) / sN, cw, ch / sN, { fill: colB }));
    else stripes.push(rect(cx + (cw * i) / sN, cy, cw / sN, ch, { fill: colB }));
  }
  s.push(rect(cx, cy, cw, ch, { fill: colA, stroke: "#14100c", "stroke-width": 3, rx: 2 }));
  s.push(...stripes);
  // the far half of the canopy in shade (it slopes away from the front)
  if (facing === "w") s.push(rect(cx + cw / 2, cy, cw / 2, ch, { fill: "#000", opacity: 0.22 }));
  if (facing === "e") s.push(rect(cx, cy, cw / 2, ch, { fill: "#000", opacity: 0.22 }));
  if (facing === "n") s.push(rect(cx, cy + ch / 2, cw, ch / 2, { fill: "#000", opacity: 0.22 }));
  if (facing === "s") s.push(rect(cx, cy, cw, ch / 2, { fill: "#000", opacity: 0.22 }));
  s.push(rect(cx, cy, cw, ch, { fill: "none", stroke: "#14100c", "stroke-width": 3, rx: 2 }));
  // scallops on the front edge
  const sc = [];
  if (facing === "w" || facing === "e") {
    const ex = facing === "w" ? cx : cx + cw;
    for (let yy = cy; yy < cy + ch - 1; yy += 20) sc.push(path(`M${ex} ${yy} a 10 7 0 0 ${facing === "w" ? 0 : 1} 0 20`, { fill: colA, stroke: "#14100c", "stroke-width": 2 }));
  } else {
    const ey = facing === "n" ? cy : cy + ch;
    for (let xx = cx; xx < cx + cw - 1; xx += 20) sc.push(path(`M${xx} ${ey} a 7 10 0 0 ${facing === "n" ? 1 : 0} 20 0`, { fill: colA, stroke: "#14100c", "stroke-width": 2 }));
  }
  s.push(...sc);
  // corner poles
  for (const [px, py] of [[cx, cy], [cx + cw, cy], [cx, cy + ch], [cx + cw, cy + ch]]) s.push(circle(px, py, 4.5, { fill: "#3a3a3e", stroke: "#0c0c0e", "stroke-width": 1.5 }));
  return s.join("");
}
/** A string of fairy lights between two anchors (a slight curve, bulbs along it). */
function lightString(a, b, R, o = {}) {
  const { bend = 0.06, gap = 24, cols = ["#fff1c4", "#ffd27a", "#ffe9a8", "#ffc0a0", "#d8f0c0"] } = o;
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const L = dist(a, b);
  const nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L;
  const k = (R() - 0.5) * 2 * bend * L;
  const c = [mx + nx * k, my + ny * k];
  const wire = path(`M${P(a)} Q${P(c)} ${P(b)}`, { fill: "none", stroke: "#1a1814", "stroke-width": 2, opacity: 0.9 });
  const glowWire = path(`M${P(a)} Q${P(c)} ${P(b)}`, { fill: "none", stroke: "#ffcf73", "stroke-width": 20, opacity: 0.1, "stroke-linecap": "round" });
  const n = Math.max(2, Math.floor(L / gap));
  const bulbs = [], glows = [];
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const x = (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0];
    const y = (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1];
    const col = cols[Math.floor(R() * cols.length)];
    glows.push(circle(x, y, 13, { fill: "url(#tk-bulb)" }));
    bulbs.push(circle(x, y, 3.6, { fill: col, stroke: "#5a4a20", "stroke-width": 0.8 }));
  }
  return { glow: glowWire + glows.join(""), wire: wire + bulbs.join("") };
}
/** A lamp post (or light pole) seen from above: base, lamp head, pool of light. */
const lampPost = (x, y, r = 210) =>
  circle(x, y, r, { fill: "url(#tk-lamp)", style: "mix-blend-mode:screen" }) +
  circle(x + 3, y + 4, 11, { fill: "#000", opacity: 0.4 }) + circle(x, y, 11, { fill: "#2a2c30", stroke: "#0c0c0e", "stroke-width": 3 }) +
  circle(x, y, 6, { fill: "#fff0c0" });

function townDefs(p) {
  return [
    slatePattern("tk-slate", 21, ["#3a3e48", "#343842", "#40444f", "#383c46"], "#1c1f25"),
    slatePattern("tk-slate-warm", 22, ["#4a3a36", "#523f3a", "#44352f", "#58443d"], "#211816"),
    slatePattern("tk-slate-low", 23, ["#2c3038", "#272b32", "#30343c"], "#15171c"),
    `<linearGradient id="tk-spill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ffc56a" stop-opacity="0.7"/><stop offset="1" stop-color="#ffc56a" stop-opacity="0"/></linearGradient>`,
    ...["s", "n", "e", "w"].map(d => {
      const [cx, cy, sx, sy] = { s: [0.5, 0, 1, 2], n: [0.5, 1, 1, 2], e: [0, 0.5, 2, 1], w: [1, 0.5, 2, 1] }[d];
      return `<radialGradient id="tk-pool-${d}" cx="${cx}" cy="${cy}" r="0.5" gradientTransform="translate(${cx} ${cy}) scale(${sx} ${sy}) translate(${-cx} ${-cy})">` +
        `<stop offset="0" stop-color="#ffc56a" stop-opacity="0.95"/><stop offset="0.5" stop-color="#ffc56a" stop-opacity="0.42"/><stop offset="1" stop-color="#ffc56a" stop-opacity="0"/></radialGradient>`;
    }),
    `<linearGradient id="tk-spill-e" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#ffc56a" stop-opacity="0.7"/><stop offset="1" stop-color="#ffc56a" stop-opacity="0"/></linearGradient>`,
    `<radialGradient id="tk-bulb"><stop offset="0" stop-color="#ffd98a" stop-opacity="0.75"/><stop offset="0.4" stop-color="#ffc56a" stop-opacity="0.25"/><stop offset="1" stop-color="#ffc56a" stop-opacity="0"/></radialGradient>`,
    glowGrad("tk-lamp", "#ffcf7a", 0.42, 0.3),
  ].join("");
}

/** Print versions of the town kit patterns: light grounds, mid-grey roofs. */
function printTownDefs() {
  return {
    "tk-slate": slatePattern("tk-slate", 21, [PAL.accent, PAL.accent, PAL.edge], PAL.soft),
    "tk-slate-warm": slatePattern("tk-slate-warm", 22, [PAL.accent, PAL.soft, PAL.accent], PAL.dark),
    "tk-slate-low": slatePattern("tk-slate-low", 23, [PAL.soft, PAL.accent], PAL.dark),
  };
}
/** Print ground patterns, by the Foundry ground they stand in for. */
const printGround = {
  cobble: (id, seed, stone = 22) => cobblePattern(id, seed, [PAL.paper2, PAL.paper, PAL.paper2, PAL.accentB], PAL.edge, 200, stone, false),
  slab: (id, seed, slab = 50) => slabPattern(id, seed, [PAL.paper, PAL.light, PAL.paper2], PAL.edge, 200, slab),
  planks: (id, seed, board = 20) => plankPattern(id, seed, [PAL.paper2, PAL.paper, PAL.accentB], PAL.edge, 200, board),
  gravel: (id, seed, n = 90) => gravelPattern(id, seed, PAL.paper2, [PAL.edge, PAL.edge, PAL.accent, PAL.paper], 120, n),
  grass: (id, seed, n = 36) => grassPattern(id, seed, PAL.paper2, [PAL.edge, PAL.accent, PAL.edge], 160, n),
};

/* ===================================================================== */
/*  3. THE FRIDAY NIGHT MARKET (gridded, night)                            */
/* ===================================================================== */
// Grid plan (columns 0-29, rows 0-19; each square 100 px):
//   St Bride's market hall   cols 9-20, rows 1-5; main doors in the south wall at cols 14-15,
//                            side doors in the east wall onto Bell Street
//   St Bride's steps         landing rows 6-7 and steps rows 8-9, cols 10-19; Grace's desk on the landing
//   The square (crowd)       cols 9-20, rows 10-17
//   The lanes of stalls      cols 1-8, rows 5-17 (two lanes, stall blocks between)
//   Chip shop                cols 2-7, rows 2-4, front onto the lanes; Cooper's Lane behind it (row 1)
//   Market Street arch       cols 4-6 at the bottom edge (Market Street runs off the map)
//   Bell Street              cols 21-22, rows 0-5, off the top edge (reached through the hall)
//   The food yard            cols 21-28, rows 11-16: tables, small stage, salt-fish stall
//   The Harbour Steps        cols 24-25, rows 17-18, down to the harbour road (row 19)
function nightMarket() {
  const R = rng(1105);
  const defs = [
    townDefs(),
    cobblePattern("nm-cobble", 51, ["#55585f", "#5d6067", "#50535a", "#63666d", "#585b62"], "#27292e", 200, 20),
    cobblePattern("nm-cobble-lane", 52, ["#524f4c", "#5a5753", "#4d4a47", "#5f5c58"], "#262422", 200, 18),
    slabPattern("nm-flags", 53, ["#85827b", "#8d8a82", "#7f7c75", "#938f87"], "#4a4843", 200, 40),
    slabPattern("nm-hallfloor", 54, ["#7a6e60", "#827566", "#73685b", "#7e7263"], "#3e3730", 200, 40),
    plankPattern("nm-boards", 55, ["#7a5a3c", "#82603f", "#6f5035"], "#33241a", 200, 20),
    gravelPattern("nm-yard", 56, "#5c5850", ["#6e6960", "#504c46", "#7b756a", "#635e56"]),
    `<pattern id="nm-ironroof" width="40" height="40" patternUnits="userSpaceOnUse"><line x1="0" y1="0" x2="0" y2="40" stroke="#b8c4cc" stroke-width="3"/></pattern>`,
    `<linearGradient id="nm-drop" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.7"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`,
    glowGrad("nm-desk", "#bfe4ff", 0.45, 0.3),
    glowGrad("nm-hall", "#ffc77a", 0.35, 0.5),
    grainFilter("nm-grain", 0.05),
  ].join("");
  const out = [];    // the ground, buildings and objects
  const lights = []; // added on top of the night tint (screen blend)
  const top = [];    // bulbs, lamp heads and labels: always bright

  // ---------- ground ----------
  out.push(rect(0, 0, W, H, { fill: "url(#nm-cobble)" }));
  out.push(rect(0, 500, 900, 1300, { fill: "url(#nm-cobble-lane)" })); // the lanes
  out.push(rect(2100, 1100, 800, 600, { fill: "url(#nm-yard)" })); // food yard (packed gravel)
  out.push(rect(1000, 600, 1000, 200, { fill: "url(#nm-flags)" })); // landing at the top of the steps
  // the lower level beyond the food yard balustrade, and the harbour road at the bottom
  out.push(rect(2000, 1700, 1000, 300, { fill: "#1b1f26" }));
  out.push(rect(2000, 1900, 1000, 100, { fill: "#33373f" }));
  out.push(line(2000, 1975, 3000, 1975, { stroke: "#c9b35a", "stroke-width": 4, "stroke-dasharray": "40 30", opacity: 0.5 }));
  out.push(rect(2000, 1700, 1000, 60, { fill: "url(#nm-drop)" }));
  // a gutter down the middle of each lane
  for (const x of [200, 600]) out.push(line(x, 520, x, 1790, { stroke: "#1c1b1a", "stroke-width": 6, opacity: 0.5 }));

  // ---------- buildings (roofs) ----------
  const rr = rng(77);
  // top row, behind the hall and Cooper's Lane
  out.push(roof(0, -40, 520, 140, { R: rr, chimneys: 2 }), roof(520, -40, 400, 140, { R: rr, pat: "url(#tk-slate-warm)" }));
  out.push(roof(920, -40, 600, 140, { R: rr }), roof(1520, -40, 580, 140, { R: rr, pat: "url(#tk-slate-warm)", chimneys: 2 }));
  // east of Bell Street
  out.push(roof(2300, -40, 360, 340, { R: rr, ridge: "v", chimneys: 2 }), roof(2660, -40, 380, 340, { R: rr, pat: "url(#tk-slate-warm)", ridge: "v" }));
  out.push(roof(2300, 300, 740, 300, { R: rr, chimneys: 2 }));
  // the block that closes Bell Street off from the square and the food yard
  out.push(roof(2100, 600, 500, 500, { R: rr, pat: "url(#tk-slate-warm)", chimneys: 2 }), roof(2600, 600, 440, 500, { R: rr }));
  // west of the chip shop, the chip shop, the strip along the west lane
  out.push(roof(-40, 200, 240, 300, { R: rr, ridge: "v" }));
  out.push(roof(200, 200, 600, 300, { R: rr, pat: "url(#tk-slate-warm)", chimneys: 2 })); // chip shop (Bea's flat above)
  out.push(roof(-40, 500, 140, 1300, { R: rr, ridge: "v", chimneys: 3 }));
  // the bottom row (shops facing the square), either side of Market Street
  out.push(roof(-40, 1800, 440, 240, { R: rr }), roof(700, 1800, 600, 240, { R: rr, pat: "url(#tk-slate-warm)", chimneys: 2 }), roof(1300, 1800, 700, 240, { R: rr, chimneys: 2 }));
  // east of the food yard
  out.push(roof(2900, 1100, 140, 600, { R: rr, ridge: "v", pat: "url(#tk-slate-warm)" }));
  // lower roofs below the food yard (down the hill), either side of the Harbour Steps
  out.push(roof(2000, 1760, 400, 140, { R: rr, pat: "url(#tk-slate-low)", shade: 0.35 }), roof(2600, 1760, 440, 140, { R: rr, pat: "url(#tk-slate-low)", shade: 0.35 }));
  // lit shop windows: a bright edge on the facade, light spilling onto the cobbles
  const shopLight = (x, y, w, dir) => {
    // dir: the way the light falls ("s" | "n" | "e")
    const t = 8;
    if (dir === "s") { top.push(rect(x, y - t, w, t, { fill: "#ffe2a6", opacity: 0.9 })); lights.push(pool(x - 50, x + w + 50, y, 150, "s")); }
    if (dir === "n") { top.push(rect(x, y, w, t, { fill: "#ffe2a6", opacity: 0.9 })); lights.push(pool(x - 50, x + w + 50, y, 150, "n")); }
    if (dir === "e") { top.push(rect(x - t, y, t, w, { fill: "#ffe2a6", opacity: 0.9 })); lights.push(pool(y - 40, y + w + 40, x, 130, "e")); }
  };
  shopLight(240, 500, 290, "s"); shopLight(610, 500, 150, "s"); // the chip shop front
  for (let y = 560; y < 1760; y += 240) shopLight(100, y, 120, "e"); // shops along the west lane
  for (const x of [780, 1060, 1420, 1760]) shopLight(x, 1800, 200, "n"); // shops along the bottom of the square
  // chip shop door; back door and bins on Cooper's Lane
  out.push(rect(550, 488, 40, 14, { fill: "#6a3a2a", stroke: "#1a0c08", "stroke-width": 2 }));
  out.push(rect(640, 196, 40, 10, { fill: "#4a3a2a", stroke: "#1a0c08", "stroke-width": 2 }));
  for (const bx of [560, 596]) out.push(rect(bx, 112, 30, 34, { rx: 3, fill: "#2f4a3a", stroke: "#0c140f", "stroke-width": 2.5 }) + line(bx, 120, bx + 30, 120, { stroke: "#0c140f", "stroke-width": 2 }));
  out.push(rect(300, 116, 46, 30, { rx: 3, fill: "#5a4a30", stroke: "#1a140c", "stroke-width": 2 }));
  lights.push(circle(660, 170, 90, { fill: "url(#tk-lamp)", opacity: 0.7 })); // a lamp over the back door

  // ---------- St Bride's market hall ----------
  {
    const hx = 900, hy = 100, hw = 1200, hh = 500;
    out.push(rect(hx + 8, hy + 10, hw, hh, { fill: "#000", opacity: 0.4 }));
    out.push(rect(hx, hy, hw, hh, { fill: "url(#nm-hallfloor)" }));
    const cols2 = [["#b23a3f", "#f0d08a"], ["#2f7f95", "#efe6cc"], ["#9a7a2a", "#f5e6b0"], ["#6a4a9a", "#e0d0f5"], ["#2f8a5a", "#efe8c0"], ["#c0602f", "#f8e0b8"]];
    const goodsIn = ["books", "food", "clothes", "records", "plants", "trinkets"];
    let k = 0;
    for (let c = 10; c < 20; c += 2) { const [a, b] = cols2[k % 6]; out.push(stall(c * 100 + 6, 106, 188, 88, "s", a, b, goodsIn[k % 6], 300 + k)); k++; }
    for (let c = 11; c < 19; c += 2) { const [a, b] = cols2[(k + 2) % 6]; out.push(stall(c * 100 + 6, 306, 188, 88, "n", a, b, goodsIn[k % 6], 300 + k)); k++; }
    // cast-iron columns holding the roof
    for (let c = 10; c <= 20; c += 2) for (const ry of [300, 400]) out.push(circle(c * 100, ry, 9, { fill: "#2e3a40", stroke: "#0c1012", "stroke-width": 3 }));
    // the iron roof, cut away: faint ribs and the glazed ridge
    out.push(rect(hx, hy, hw, hh, { fill: "url(#nm-ironroof)", opacity: 0.08 }));
    out.push(rect(hx + 20, hy + 230, hw - 40, 40, { fill: "#bcd8e8", opacity: 0.08 }));
    lights.push(rect(hx, hy, hw, hh, { fill: "#ffcf7a", opacity: 0.22 }));
    for (let c = 11; c < 20; c += 3) lights.push(circle(c * 100 + 50, 250, 180, { fill: "url(#nm-hall)" }));
    // walls: brick, with side doors on Bell Street and three doorways onto the steps
    const hwall = { fill: "#5a3a2e", edge: "#9a7a62" };
    out.push(wall(hx, hy, hx + hw, hy, 26, [], hwall));
    out.push(wall(hx, hy, hx, hy + hh, 26, [], hwall));
    out.push(wall(hx + hw, hy, hx + hw, hy + hh, 26, [[100, 300]], hwall)); // side doors at rows 2-3
    out.push(wall(hx, hy + hh, hx + hw, hy + hh, 26, [[200, 300], [500, 700], [900, 1000]], hwall)); // doors at cols 11, 14-15, 18
    for (const [wy1, wy2] of [[130, 190], [420, 480]]) out.push(windowPane(hx, wy1, hx, wy2, 14), windowPane(hx + hw, wy1, hx + hw, wy2, 14));
    // open doors, leaves folded back against the wall
    const leaf = (x, y, w, h) => rect(x, y, w, h, { fill: "#4a3424", stroke: "#140c08", "stroke-width": 2 });
    out.push(leaf(1300, 578, 100, 9), leaf(1600, 578, 100, 9), leaf(1000, 578, 100, 9), leaf(2000, 578, 100, 9)); // front doors, folded back inside
    out.push(leaf(2078, 100 + 26, 9, 74), leaf(2078, 400, 9, 74)); // side doors onto Bell Street, folded back inside
    // light from the open doors onto the landing and onto Bell Street
    for (const [x, w] of [[1100, 100], [1400, 200], [1800, 100]]) lights.push(pool(x - 60, x + w + 60, 600, 190, "s", 0.95));
    lights.push(pool(170, 430, 2100, 190, "e", 0.9));
    // warm glow down each lane of stalls
    for (const x of [200, 600]) lights.push(ellipse(x, 1150, 190, 700, { fill: "url(#tk-lamp)", opacity: 0.55 }));
  }
  // ---------- St Bride's steps ----------
  {
    for (let i = 0; i < 6; i++) {
      const y = 800 + i * 33.3;
      out.push(rect(1000, y, 1000, 33.3, { fill: i % 2 ? "#7f7c74" : "#87847c" }));
      out.push(line(1000, y + 33.3, 2000, y + 33.3, { stroke: "#2e2c28", "stroke-width": 3 }));
      out.push(line(1000, y + 4, 2000, y + 4, { stroke: "#aaa69c", "stroke-width": 2, opacity: 0.6 }));
    }
    out.push(rect(1000, 800, 1000, 200, { fill: "#000", opacity: 0.1 }));
    // balustrade plinths either side of the steps and landing, a planter on each
    for (const px of [900, 2000]) {
      out.push(rect(px + 6, 608, 100, 400, { fill: "#000", opacity: 0.35 }));
      out.push(rect(px, 600, 100, 400, { fill: "#8a867c", stroke: "#2e2c28", "stroke-width": 4 }));
      out.push(rect(px + 12, 612, 76, 376, { fill: "none", stroke: "#5e5b54", "stroke-width": 2 }));
      out.push(circle(px + 50, 940, 26, { fill: "#6e6a62", stroke: "#2e2c28", "stroke-width": 3 }) + circle(px + 50, 940, 17, { fill: "#3d5a32" }) + circle(px + 45, 935, 6, { fill: "#5a7a46" }));
    }
    // Grace's broadcast desk: table, microphone, mixer; speakers on stands either side, cables on the ground
    out.push(path("M1400 790 C 1360 800, 1300 790, 1250 765", { fill: "none", stroke: "#111", "stroke-width": 4 }));
    out.push(path("M1600 790 C 1640 800, 1700 790, 1750 765", { fill: "none", stroke: "#111", "stroke-width": 4 }));
    out.push(rect(1395, 757, 210, 44, { rx: 4, fill: "#000", opacity: 0.35 }));
    out.push(rect(1390, 752, 210, 44, { rx: 4, fill: "#3a3c44", stroke: "#0e0f12", "stroke-width": 3 }));
    out.push(rect(1500, 758, 80, 32, { rx: 2, fill: "#22242a", stroke: "#5a5e68", "stroke-width": 1.5 })); // mixer
    for (let i = 0; i < 6; i++) out.push(rect(1506 + i * 12, 764, 6, 20, { fill: "#11131a" }) + rect(1506 + i * 12, 768 + (i * 7) % 12, 6, 5, { fill: "#cfd6e0" }));
    top.push(rect(1400, 760, 50, 28, { rx: 2, fill: "#7ab8e8", opacity: 0.85 })); // laptop screen
    out.push(circle(1462, 770, 6, { fill: "#2a2a2e" }) + line(1462, 770, 1452, 748, { stroke: "#2a2a2e", "stroke-width": 3 }) + circle(1450, 744, 8, { fill: "#3a3a40", stroke: "#0c0c0e", "stroke-width": 2 })); // microphone on its desk stand, turned to the chair
    out.push(rect(1430, 708, 40, 34, { rx: 6, fill: "#5a3a3a", stroke: "#1a0e0e", "stroke-width": 2.5 })); // Grace's chair
    lights.push(circle(1450, 760, 220, { fill: "url(#nm-desk)" }));
    for (const sx of [1250, 1750]) {
      out.push(circle(sx + 4, 764, 20, { fill: "#000", opacity: 0.4 }));
      for (const a of [90, 210, 330]) { const r = (a * Math.PI) / 180; out.push(line(sx, 760, sx + Math.cos(r) * 30, 760 + Math.sin(r) * 30, { stroke: "#2a2a2e", "stroke-width": 4, "stroke-linecap": "round" })); }
      out.push(rect(sx - 24, 740, 48, 36, { rx: 4, fill: "#1e1f24", stroke: "#0a0a0c", "stroke-width": 3 }) + circle(sx, 758, 11, { fill: "#3a3c44" }) + circle(sx, 758, 5, { fill: "#11131a" }));
    }
  }
  // ---------- lanes of stalls (west) ----------
  const poles = []; // canopy poles the fairy lights hang from
  {
    const pal = [["#b23a3f", "#f0d08a"], ["#2f7f95", "#efe6cc"], ["#9a7a2a", "#f5e6b0"], ["#6a4a9a", "#e0d0f5"], ["#2f8a5a", "#efe8c0"], ["#c0602f", "#f8e0b8"], ["#3a5a9a", "#f5d070"]];
    const goods = ["food", "records", "clothes", "fortune", "food", "books", "trinkets", "plants", "food", "clothes", "records", "food"];
    let k = 0;
    const segs = [[6, 8], [10, 12], [14, 16]];
    for (const [r0, r1] of segs) {
      // block 1 (cols 3-4): col 3 faces west into lane A, col 4 faces east into lane B
      // block 2 (cols 7-8): col 7 faces west into lane B, col 8 faces east onto the square
      for (const [c, f, rEnd] of [[3, "w", r1], [4, "e", r1], [7, "w", r0 === 14 ? 15 : r1], [8, "e", r0 === 14 ? 15 : r1]]) {
        let r = r0;
        while (r <= rEnd) {
          const len = rEnd - r + 1 >= 2 && R() < 0.6 ? 2 : 1;
          const [a, b] = pal[k % pal.length];
          out.push(stall(c * 100 + 4, r * 100 + 4, 92, len * 100 - 8, f, a, b, goods[k % goods.length], 400 + k));
          k++; r += len;
        }
      }
    }
    // pole lines facing each lane (the canopy corners on the lane side)
    for (const [r0, r1] of [[6, 9], [10, 13], [14, 17]]) for (let r = r0; r < r1; r++) { poles.push([328, r * 100 + 4], [472, r * 100 + 4], [728, r * 100 + 4]); }
  }
  // ---------- the food yard ----------
  {
    const bal = { fill: "#8a867c", edge: "#cfc9bb" };
    out.push(wall(2100, 1700, 2400, 1700, 22, [], bal), wall(2600, 1700, 2900, 1700, 22, [], bal));
    out.push(wall(2900, 1100, 2900, 1700, 22, [], { fill: "#4a4a50", edge: "#8a8a90" }));
    // the Harbour Steps going down to the harbour road, walls either side
    for (let i = 0; i < 10; i++) {
      const y = 1700 + i * 20;
      out.push(rect(2400, y, 200, 20, { fill: i % 2 ? "#6e6b64" : "#77746c" }), line(2400, y + 20, 2600, y + 20, { stroke: "#2a2824", "stroke-width": 2.5 }));
    }
    out.push(rect(2400, 1700, 200, 200, { fill: "url(#nm-drop)", opacity: 0.6 }));
    out.push(wall(2400, 1700, 2400, 1900, 16, [], bal), wall(2600, 1700, 2600, 1900, 16, [], bal));
    lights.push(circle(2650, 1940, 160, { fill: "url(#tk-lamp)" })); // a street lamp on the harbour road
    // small stage against the north wall (cols 26-28, rows 11-12)
    out.push(rect(2606, 1108, 290, 190, { fill: "#000", opacity: 0.35 }));
    out.push(rect(2600, 1100, 290, 190, { fill: "url(#nm-boards)", stroke: "#1a120c", "stroke-width": 4 }));
    out.push(line(2600, 1290, 2890, 1290, { stroke: "#d8c890", "stroke-width": 3, opacity: 0.5 }));
    out.push(rect(2620, 1120, 50, 40, { rx: 3, fill: "#1e1f24", stroke: "#0a0a0c", "stroke-width": 2 }) + rect(2820, 1120, 50, 40, { rx: 3, fill: "#1e1f24", stroke: "#0a0a0c", "stroke-width": 2 })); // two amps
    out.push(circle(2745, 1220, 7, { fill: "#2a2a2e" }) + line(2745, 1220, 2745, 1196, { stroke: "#2a2a2e", "stroke-width": 3 }) + circle(2745, 1192, 6, { fill: "#55585e" })); // mic stand
    lights.push(circle(2745, 1200, 190, { fill: "url(#tk-lamp)" }));
    // long tables with benches (each one square row deep)
    const longTable = (x, y, w) => {
      let s = rect(x + 6, y + 30, w, 44, { rx: 4, fill: "#000", opacity: 0.35 });
      s += rect(x, y + 10, w, 14, { rx: 3, fill: "#6a4a30", stroke: "#22160d", "stroke-width": 2 });
      s += rect(x, y + 76, w, 14, { rx: 3, fill: "#6a4a30", stroke: "#22160d", "stroke-width": 2 });
      s += rect(x, y + 28, w, 44, { rx: 4, fill: "#9a7350", stroke: "#3a2614", "stroke-width": 3 });
      for (let i = 1; i < 3; i++) s += line(x + 4, y + 28 + i * 14.6, x + w - 4, y + 28 + i * 14.6, { stroke: "#3a2614", "stroke-opacity": 0.4, "stroke-width": 1.5 });
      const r2 = rng(x + y);
      for (let px = x + 30; px < x + w - 20; px += 46 + r2() * 30) s += circle(px, y + 42 + r2() * 16, 7, { fill: "#e8e2d2", stroke: "#6a6458", "stroke-width": 1.5 });
      return s;
    };
    out.push(longTable(2120, 1200, 360), longTable(2120, 1400, 360), longTable(2600, 1400, 190));
    // salt-fish stall against the balustrade (cols 21-22, row 16), salt bins beside it (col 23)
    out.push(stall(2106, 1604, 188, 90, "n", "#2e4a5a", "#e8ecec", "fish", 777));
    for (const bx of [2318, 2358]) {
      out.push(rect(bx + 3, 1636, 34, 50, { rx: 3, fill: "#000", opacity: 0.35 }));
      out.push(rect(bx, 1632, 34, 50, { rx: 3, fill: "#5a6a70", stroke: "#1a2024", "stroke-width": 2.5 }) + rect(bx + 4, 1636, 26, 42, { rx: 2, fill: "#eceae2" }));
      for (let i = 0; i < 8; i++) out.push(circle(bx + 7 + R() * 20, 1640 + R() * 34, 1.6, { fill: "#c9c6bc" }));
    }
    // a food stall along the east wall (col 28, rows 15-16), facing the tables
    out.push(stall(2804, 1504, 92, 192, "w", "#8a4a2e", "#f0d8b0", "food", 778));
  }
  // ---------- the square: a few benches and bollards, the crowd stands here ----------
  {
    const bench = (x, y, horiz = true) => horiz
      ? rect(x + 4, y + 5, 90, 26, { fill: "#000", opacity: 0.35 }) + rect(x, y, 90, 26, { rx: 3, fill: "#6a4a30", stroke: "#22160d", "stroke-width": 2.5 }) + line(x + 3, y + 9, x + 87, y + 9, { stroke: "#22160d", "stroke-width": 1.5 }) + line(x + 3, y + 17, x + 87, y + 17, { stroke: "#22160d", "stroke-width": 1.5 })
      : rect(x + 4, y + 5, 26, 90, { fill: "#000", opacity: 0.35 }) + rect(x, y, 26, 90, { rx: 3, fill: "#6a4a30", stroke: "#22160d", "stroke-width": 2.5 }) + line(x + 9, y + 3, x + 9, y + 87, { stroke: "#22160d", "stroke-width": 1.5 }) + line(x + 17, y + 3, x + 17, y + 87, { stroke: "#22160d", "stroke-width": 1.5 });
    out.push(bench(1105, 1755), bench(1805, 1755), bench(2066, 1405, false));
    for (const x of [1300, 1400, 1600, 1700]) out.push(circle(x + 3, 1704, 9, { fill: "#000", opacity: 0.4 }) + circle(x, 1700, 9, { fill: "#3a3c42", stroke: "#0c0c0e", "stroke-width": 2.5 }));
    // a drain grate in the middle
    out.push(rect(1480, 1580, 40, 40, { fill: "#1c1d20", stroke: "#0a0a0c", "stroke-width": 2 }));
    for (let i = 1; i < 5; i++) out.push(line(1480 + i * 8, 1582, 1480 + i * 8, 1618, { stroke: "#3a3c42", "stroke-width": 2 }));
  }
  // ---------- Market Street arch (striped, between the corner buildings) ----------
  {
    const ay = 1800;
    out.push(rect(406, ay - 10, 300, 36, { fill: "#000", opacity: 0.4 }));
    out.push(rect(400, ay - 18, 300, 36, { fill: "#e8e0cc", stroke: "#1a1612", "stroke-width": 3 }));
    for (let x = 400; x < 700; x += 30) out.push(rect(x, ay - 18, 15, 36, { fill: "#a8322e" }));
    out.push(rect(400, ay - 18, 300, 36, { fill: "none", stroke: "#1a1612", "stroke-width": 3 }));
    for (const px of [400, 700]) out.push(rect(px - 22, ay - 22, 44, 44, { fill: "#6e6a62", stroke: "#1a1612", "stroke-width": 3 }));
    const st = lightString([400, ay], [700, ay], R, { bend: 0 });
    lights.push(st.glow); top.push(st.wire);
  }
  // ---------- lamp posts, the light pole in the square ----------
  const lamp = (x, y, r = 210) => {
    out.push(circle(x + 3, y + 4, 11, { fill: "#000", opacity: 0.4 }), circle(x, y, 11, { fill: "#2a2c30", stroke: "#0c0c0e", "stroke-width": 3 }));
    lights.push(circle(x, y, r, { fill: "url(#tk-lamp)" }));
    top.push(circle(x, y, 6, { fill: "#fff0c0" }));
  };
  for (const [x, y] of [[900, 1000], [2100, 1000], [900, 1700], [2000, 1700]]) lamp(x, y);
  // thin light poles the strings across the square hang from
  for (const [x, y] of [[900, 1250], [900, 1500], [2100, 1250], [2100, 1500]]) out.push(circle(x + 2, y + 3, 7, { fill: "#000", opacity: 0.4 }), circle(x, y, 7, { fill: "#2a2c30", stroke: "#0c0c0e", "stroke-width": 2 }));
  // ---------- fairy lights ----------
  {
    const add = (a, b, o) => { const s = lightString(a, b, R, o); lights.push(s.glow); top.push(s.wire); };
    // across each lane, from wall hooks / canopy poles on one side to poles on the other
    // (only where there is a stall to hang them from: rows 6-8, 10-12, 14-16; block 2 stops at row 15)
    for (const r0 of [6, 10, 14]) for (const d of [20, 120, 220]) {
      const y = r0 * 100 + d;
      add([100, y], [328, y + 34], { bend: 0.03 });
      if (!(r0 === 14 && d === 220)) add([472, y], [728, y + 34], { bend: 0.03 });
    }
    // in front of the chip shop
    add([100, 500], [328, 604]); add([328, 500], [560, 604]); add([560, 500], [800, 604]);
    // a canopy of strings from the pole in the middle of the square out to the lamp posts and the shop fronts
    // parallel strings across the square, pole to pole
    add([900, 1000], [2100, 1000], { bend: 0 });
    add([900, 1250], [2100, 1250], { bend: 0.035 }); add([900, 1500], [2100, 1500], { bend: 0.035 }); add([900, 1700], [2000, 1700], { bend: 0.02 });
    // a soft general glow over the square from all the strings
    lights.push(ellipse(1500, 1350, 620, 420, { fill: "url(#tk-lamp)", opacity: 0.45 }));
    // over the food yard, wall to balustrade posts
    for (const x of [2200, 2400, 2600, 2800]) add([x, 1100], [x - 50, 1700], { bend: 0.02 });
    add([2100, 1100], [2900, 1100], { bend: 0 }); add([2100, 1700], [2900, 1700], { bend: 0 });
    void poles;
  }

  // ---------- labels and ways in and out ----------
  const labels = [];
  if (!PRINT) {
    const fl = (x, y, t, o = {}) => label(x, y, t, { size: 30, weight: 800, ...o });
    labels.push(fl(1500, 205, "ST BRIDE'S MARKET HALL", { size: 34, font: "display", weight: 700, ls: 3 }));
    labels.push(fl(1500, 253, "covered hall, iron roof, full of stalls", { size: 22, weight: 600 }));
    labels.push(fl(1500, 935, "ST BRIDE'S STEPS", { size: 30, font: "display", weight: 700, ls: 3 }));
    labels.push(fl(1650, 690, "Grace's broadcast desk", { size: 22, weight: 700 }));
    labels.push(fl(1500, 1180, "The crowd in front of the steps", { size: 26, weight: 700 }));
    labels.push(fl(200, 1150, "THE LANES OF STALLS", { size: 26, font: "display", weight: 700, ls: 2, rot: -90 }));
    labels.push(fl(600, 1150, "food, records, clothes, fortune-tellers", { size: 20, weight: 700, rot: -90 }));
    labels.push(fl(500, 340, "Chip shop", { size: 26 }));
    labels.push(fl(500, 372, "(Bea's flat above)", { size: 20, weight: 600 }));
    labels.push(fl(2500, 1325, "THE FOOD YARD", { size: 28, font: "display", weight: 700, ls: 2 }));
    labels.push(fl(2745, 1260, "Small stage", { size: 22 }));
    labels.push(fl(2200, 1565, "Salt-fish stall", { size: 22 }), fl(2350, 1610, "salt bins", { size: 18, weight: 700 }));
    labels.push(fl(2200, 330, "Bell Street", { size: 26, rot: -90 }));
    labels.push(fl(550, 1745, "Market Street arch", { size: 22 }));
    const way = (x, y, ang, t, o) => wayMarker(x, y, ang, t, { size: 26, ...o });
    labels.push(way(550, 1955, 90, "Way in and out: Market Street", { lx: 550, ly: 1868 }));
    labels.push(way(2500, 1975, 90, "Way in and out: the Harbour Steps, down to the harbour road", { lx: 2500, ly: 1835, size: 24 }));
    labels.push(way(40, 150, 180, "Way in and out: Cooper's Lane", { lx: 110, ly: 150, anchor: "start" }));
    labels.push(way(2200, 40, -90, "Way in and out: through the hall", { lx: 2200, ly: 145, size: 22 }));
  } else {
    const T = (x, y, t, o = {}) => plabel(x, y, t, { size: 66, font: "display", ls: 3, ...o });
    const F = (x, y, t, o = {}) => plabel(x, y, t, { size: 54, ...o });
    labels.push(T(1500, 250, "ST BRIDE'S MARKET HALL", { size: 70 }));
    labels.push(T(1500, 905, "ST BRIDE'S STEPS"));
    labels.push(F(1500, 668, "Grace's broadcast desk", { size: 52 }));
    labels.push(F(1500, 1200, "The crowd in front of the steps"));
    labels.push(T(200, 1150, "THE LANES OF STALLS", { size: 58, rot: -90, ls: 2 }));
    labels.push(F(600, 1150, "food, records, clothes, fortune-tellers", { size: 50, rot: -90 }));
    labels.push(F(500, 325, "Chip shop", { size: 58 }), F(500, 395, "(Bea's flat above)", { size: 50 }));
    labels.push(T(2500, 1340, "THE FOOD YARD", { size: 62, ls: 2 }));
    labels.push(F(2745, 1240, "Small stage", { size: 50 }));
    labels.push(F(2215, 1555, "Salt-fish stall", { size: 50 }));
    labels.push(F(2200, 330, "Bell Street", { rot: -90 }));
    labels.push(F(550, 1735, "Market Street arch", { size: 50 }));
    labels.push(pwayMarker(550, 1950, 90, "Way in and out: Market Street", { lx: 550, ly: 1878 }));
    labels.push(pwayMarker(2500, 1950, 90, ["Way in and out:", "the Harbour Steps"], { lx: 2370, ly: 1830, anchor: "end" }));
    labels.push(pwayMarker(60, 150, 180, "Way in and out: Cooper's Lane", { lx: 150, ly: 150, anchor: "start" }));
    labels.push(pwayMarker(2200, 60, -90, ["Way in and out: through", "the hall to Bell Street"], { lx: 2300, ly: 100, anchor: "start" }));
  }

  const body = PRINT ? out.join("") + top.join("") + labels.join("") + printFrame() :
    out.join("") +
    rect(0, 0, W, H, { fill: "#8a96bc", style: "mix-blend-mode:multiply" }) +
    grp(lights, { style: "mix-blend-mode:screen" }) +
    rect(0, 0, W, H, { filter: "url(#nm-grain)" }) +
    top.join("") + labels.join("");

  const data = {
    width: W, height: H, grid: G,
    points: [
      { key: "way-market-street", label: "The Market Street arch: a striped arch at the bottom of the hill, the busiest way in (a way in and out)", x: 550, y: 1800 },
      { key: "way-harbour-steps", label: "The Harbour Steps: a stone stair from the food yard down to the harbour road (a way in and out)", x: 2500, y: 1750 },
      { key: "way-coopers-lane", label: "Cooper's Lane: a narrow back alley behind the chip shop (a way in and out)", x: 150, y: 150 },
      { key: "way-bell-street", label: "Through the market hall to Bell Street, by the side doors (a way in and out)", x: 2200, y: 300 },
      { key: "st-brides-steps", label: "St Bride's steps: Grace's broadcast desk, with speakers playing her show to the whole market", x: 1500, y: 850 },
      { key: "market-hall", label: "St Bride's market hall: the covered hall with its iron roof, full of stalls, with side doors onto Bell Street", x: 1500, y: 300 },
      { key: "lanes-of-stalls", label: "The lanes of stalls: food, records, second-hand clothes and fortune-tellers, under strings of fairy lights", x: 600, y: 1300 },
      { key: "food-yard", label: "The food yard: long tables, a small stage and the salt-fish stall", x: 2500, y: 1350 },
      { key: "salt-fish-stall", label: "The salt-fish stall, with its salt bins", x: 2250, y: 1650 },
      { key: "chip-shop", label: "The chip shop on Cooper's Lane (Bea Santos lives in the flat above)", x: 500, y: 450 },
      { key: "the-crowd", label: "The crowd in front of St Bride's steps", x: 1500, y: 1250 },
    ],
    tokens: {
      coven: [[300, 1700], [400, 1700], [500, 1700], [600, 1700], [700, 1700], [500, 1600], [600, 1600]],
      threat: [1400, 600],
      innocent: [1400, 700],
    },
  };
  if (PRINT) {
    const pd = {
      ...printTownDefs(),
      "nm-cobble": printGround.cobble("nm-cobble", 51, 20),
      "nm-cobble-lane": printGround.cobble("nm-cobble-lane", 52, 18),
      "nm-flags": printGround.slab("nm-flags", 53, 40),
      "nm-hallfloor": slabPattern("nm-hallfloor", 54, [PAL.paper2, PAL.accentB, PAL.paper2], PAL.edge, 200, 40),
      "nm-boards": printGround.planks("nm-boards", 55),
      "nm-yard": printGround.gravel("nm-yard", 56),
    };
    return { name: "night-market", svg: bookSvg("Map: the Friday night market", body, defs, pd), data };
  }
  return { name: "night-market", svg: svgDoc(body, defs), data };
}

/* ===================================================================== */
/*  4. THE OLD RADIO TOWER (gridded, night)                                */
/* ===================================================================== */
// A fenced hilltop above the big houses of the Heights, next to the observatory.
//   The tower      four concrete feet centred on squares (12,7) (16,7) (12,11) (16,11);
//                  its top (and the six valves) over square (14,9)
//   The hut        cols 18-21, rows 4-6; door in the south wall
//   The trench     row 6, from the hut's east wall under the fence to an open end at cols 27-28
//   The gate       cols 7-8 in the south fence; the steep lane runs off the bottom edge
//   The fence gap  east fence, row 11, by the observatory path
//   The bank       west of the fence, down to the gardens of the big houses (left edge)
function radioTower() {
  const R = rng(1926);
  const defs = [
    townDefs(),
    grassPattern("rt-grass", 61, "#3b4c36", ["#46593f", "#33432f", "#4f6446", "#3f5139"], 160, 120),
    grassPattern("rt-lawn", 62, "#43603b", ["#4c6a42", "#3b5434", "#55744a"], 160, 70),
    gravelPattern("rt-gravel", 63, "#59564f", ["#6a665d", "#4d4a44", "#767166", "#625e56"], 120, 300),
    `<filter id="rt-feather" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="14"/></filter>`,
    `<radialGradient id="rt-dome" cx="0.38" cy="0.36" r="0.7"><stop offset="0" stop-color="#e6e9ec"/><stop offset="0.6" stop-color="#b9bdc2"/><stop offset="1" stop-color="#8a8f95"/></radialGradient>`,
    brickPattern("rt-brick", "#6a4030", "#5e382a", "#2a1e18", 24, 12),
    slabPattern("rt-concrete", 64, ["#7a7873", "#82807a", "#74726d"], "#4a4844", 200, 50),
    plankPattern("rt-floor", 65, ["#4e4236", "#564a3d", "#483d32"], "#231c16", 200, 18),
    cobblePattern("rt-lane", 66, ["#4c4b48", "#555451", "#474643", "#5b5a56"], "#24231f", 200, 18),
    `<pattern id="rt-mesh" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M0 0 L10 10 M10 0 L0 10" stroke="#b9c2c8" stroke-width="1.2"/></pattern>`,
    `<pattern id="rt-grate" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#3a4046"/><path d="M0 6 H12 M6 0 V12" stroke="#7e8a92" stroke-width="2"/></pattern>`,
    mottleFilter("rt-mottle", 0.005, 0.16, 5),
    glowGrad("rt-valve", "#cfe6ff", 0.55, 0.25),
    glowGrad("rt-warm", "#ffcf7a", 0.5, 0.3),
    glowGrad("rt-hill", "#c8d8ff", 0.22, 0.5),
    grainFilter("rt-grain", 0.05),
    `<radialGradient id="rt-vignette" cx="0.47" cy="0.47" r="0.62"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.4"/></radialGradient>`,
  ].join("");
  const out = [], lights = [], top = [];

  // ---------- the hillside ----------
  out.push(rect(0, 0, W, H, { fill: "url(#rt-grass)" }));
  if (!PRINT) out.push(rect(0, 0, W, H, { filter: "url(#rt-mottle)" }));
  // the gardens of the big houses, at the foot of the bank (left edge)
  out.push(path("M0 0 L170 0 C 190 300, 150 600, 180 900 C 200 1200, 160 1500, 190 1750 L 230 2000 L0 2000 Z", { fill: "url(#rt-lawn)" }));
  for (let i = 0; i < 9; i++) out.push(rect(0, i * 230 - 40, 160, 115, { fill: "#fff", opacity: 0.025 })); // mowing stripes
  // hedges between the gardens, a greenhouse, a garden wall
  const hedge = (pts, w = 46) => path(smoothD(pts), { fill: "none", stroke: "#1d2c1b", "stroke-width": w + 8, "stroke-linecap": "round" }) + path(smoothD(pts), { fill: "none", stroke: "#2c4428", "stroke-width": w, "stroke-linecap": "round" }) + path(smoothD(pts), { fill: "none", stroke: "#3b5a34", "stroke-width": w * 0.45, "stroke-linecap": "round", opacity: 0.7, transform: "translate(-6 -6)" });
  out.push(hedge([[-30, 640], [80, 650], [175, 630]]), hedge([[-30, 1330], [90, 1320], [185, 1340]]));
  out.push(rect(30, 860, 110, 70, { fill: "#9cc3d8", opacity: 0.35, stroke: "#c9d8e0", "stroke-width": 3 }));
  for (let x = 30; x <= 140; x += 22) out.push(line(x, 860, x, 930, { stroke: "#c9d8e0", "stroke-width": 1.5, opacity: 0.7 }));
  out.push(line(30, 895, 140, 895, { stroke: "#c9d8e0", "stroke-width": 2.5 }));
  out.push(path(smoothD([[0, 1770], [80, 1830], [140, 1910], [168, 2010]]), { fill: "none", stroke: "#6a6458", "stroke-width": 26 })); // a garden path
  // corners of two big houses at the left edge, lit windows
  out.push(roof(-120, 160, 210, 300, { pat: "url(#tk-slate-warm)", ridge: "v", R: rng(5) }), roof(-120, 1420, 200, 260, { pat: "url(#tk-slate)", ridge: "v", R: rng(6) }));
  lights.push(pool(200, 420, 90, 130, "e", 0.75), pool(1450, 1650, 80, 120, "e", 0.7));
  top.push(rect(88, 230, 6, 120, { fill: "#ffe2a6", opacity: 0.85 }), rect(78, 1480, 6, 120, { fill: "#ffe2a6", opacity: 0.85 }));
  // a flower bed and a garden bench
  out.push(path(smoothD(blobPts(90, 1150, 46, rng(8), 12, 0.15), true), { fill: "#3a2c20", stroke: "#1a140e", "stroke-width": 2 }));
  for (let i = 0; i < 9; i++) out.push(circle(70 + R() * 44, 1128 + R() * 44, 6, { fill: ["#c46a8a", "#e0c060", "#8a7ac4", "#e8e2d2"][i % 4], stroke: "#2a2018", "stroke-width": 1 }));
  out.push(rect(40, 760, 26, 80, { rx: 3, fill: "#6a4a30", stroke: "#22160d", "stroke-width": 2.5 }));
  // the steep bank, from the fence down to the gardens: hachures pointing downhill
  {
    out.push(path("M400 0 L400 2000 L215 2000 C 170 1500, 200 1200, 180 900 C 150 600, 190 300, 170 0 Z", { fill: PRINT ? PAL.edge : "#4d5539" }));
    // tapered hachures in two staggered rows: thick at the top of the bank, thin at the foot
    const H_ = [];
    for (let y = 12; y < 1995; y += 15) {
      for (const [x0, len, off] of [[396, 70 + R() * 50, 0], [300 - R() * 20, 60 + R() * 40, 7]]) {
        const yy = y + off, x1 = Math.max(185, x0 - len), w = 1.6 + R() * 1.2;
        H_.push(`M${f1(x0)} ${f1(yy - w)} L${f1(x0)} ${f1(yy + w)} L${f1(x1)} ${f1(yy + (R() - 0.5) * 4)} Z`);
      }
    }
    out.push(path(H_.join(" "), { fill: PRINT ? PAL.soft : "#1c2216", opacity: PRINT ? 0.75 : 0.6 }));
  }
  // the hilltop is lighter (moonlight), the slopes fall away into the dark
  lights.push(ellipse(1450, 900, 1150, 850, { fill: "url(#rt-hill)" }));

  // gorse and shrubs on the hillside outside the fence
  for (const [x, y, r] of [[620, 70, 46], [980, 110, 38], [1300, 60, 52], [1750, 95, 40], [2150, 70, 48], [2330, 260, 34],
    [480, 1820, 50], [1150, 1900, 44], [1500, 1800, 56], [1900, 1880, 42], [2250, 1790, 38], [2380, 1930, 46], [1700, 1960, 36], [560, 1960, 34]]) {
    out.push(treeCrown(x, y, r, R, PRINT ? { dark: PAL.accent, mid: PAL.edge, light: PAL.paper2, edge: PAL.soft, shadow: 0.15 } : { dark: "#24361f", mid: "#2f4628", light: "#4a6a3a", shadow: 0.3 }));
  }
  // ---------- observatory grounds (east) ----------
  out.push(path("M2470 0 L3000 0 L3000 2000 L2700 2000 C 2620 1700, 2560 1400, 2480 1000 C 2460 700, 2470 300, 2470 0 Z", { fill: "url(#rt-lawn)" }));
  out.push(path("M2470 0 C 2470 300, 2460 700, 2480 1000 C 2560 1400, 2620 1700, 2700 2000", { fill: "none", stroke: "#1d2c1b", "stroke-width": 10, opacity: 0.6 })); // the edge of the mown grass
  // the observatory path
  const obsPath = [[2720, 520], [2630, 700], [2560, 950], [2540, 1150], [2570, 1450], [2640, 1750], [2690, 2010]];
  out.push(path(smoothD(obsPath), { fill: "none", stroke: "#3a3832", "stroke-width": 84, "stroke-linecap": "round" }));
  out.push(path(smoothD(obsPath), { fill: "none", stroke: "url(#rt-gravel)", "stroke-width": 72, "stroke-linecap": "round" }));
  // trodden track from the path to the gap in the fence
  out.push(path("M2545 1150 C 2500 1150, 2460 1152, 2405 1150", { fill: "none", stroke: "#4a4638", "stroke-width": 40, "stroke-linecap": "round", opacity: 0.8 }));
  // the observatory: dome with its shutter slit, and a low annex with the door
  out.push(rect(2600, 470, 240, 90, { fill: "#000", opacity: 0.35, transform: "translate(8 10)" }));
  out.push(rect(2600, 470, 240, 90, { fill: "#8f8c86", stroke: "#2a2926", "stroke-width": 4 }));
  out.push(rect(2600, 470, 240, 90, { fill: "url(#rt-concrete)", opacity: 0.5 }));
  out.push(circle(2728, 300, 200, { fill: "#000", opacity: 0.4, transform: "translate(10 14)" }));
  out.push(circle(2728, 300, 212, { fill: "#6e6a62", stroke: "#2a2c30", "stroke-width": 4 })); // the drum wall top
  out.push(circle(2728, 300, 198, { fill: "url(#rt-dome)", stroke: "#3a3e44", "stroke-width": 3 }));
  out.push(path("M2702 104 L2754 104 L2754 300 L2702 300 Z", { fill: "#3a3e44", stroke: "#1a1c20", "stroke-width": 3 })); // the shutter slit
  out.push(line(2702, 104, 2702, 300, { stroke: "#d8dcdf", "stroke-width": 2 }));
  out.push(rect(2700, 554, 50, 10, { fill: "#4a3424", stroke: "#140c08", "stroke-width": 2 })); // annex door
  lights.push(circle(2725, 590, 140, { fill: "url(#rt-warm)" })); // lamp over the observatory door
  top.push(circle(2725, 572, 7, { fill: "#fff0c0", stroke: "#3a3020", "stroke-width": 2 }));

  // ---------- the lane up to the gate ----------
  const lanePoly = [[700, 1700], [900, 1700], [915, 1800], [950, 1900], [985, 2010], [745, 2010], [715, 1900], [695, 1800]];
  out.push(path(smoothD(lanePoly, true), { fill: "#1c1d1f", transform: "translate(0 0)" }));
  out.push(path(polyD(lanePoly), { fill: "url(#rt-lane)", stroke: "#1a1a18", "stroke-width": 6 }));
  // low banks and weeds either side of the lane
  for (const side of [[[690, 1720], [680, 1850], [705, 1950], [730, 2010]], [[910, 1720], [925, 1830], [960, 1930], [1000, 2010]]]) out.push(path(smoothD(side), { fill: "none", stroke: PRINT ? PAL.accent : "#1d2c1b", "stroke-width": 22, "stroke-linecap": "round" }));
  // "steep" chevrons pointing downhill
  for (const y of [1770, 1860, 1950]) { const cx = 800 + (y - 1700) * 0.28; out.push(path(`M${cx - 40} ${y - 16} L${cx} ${y + 6} L${cx + 40} ${y - 16}`, { fill: "none", stroke: "#cfc8b0", "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.55 })); }

  // ---------- the yard: gravel and nettles ----------
  const yard = [[820, 520], [1050, 380], [1400, 330], [1780, 340], [2250, 360], [2300, 760], [2120, 980], [2150, 1300], [1900, 1480], [1500, 1520], [1100, 1560], [800, 1660], [700, 1640], [760, 1300], [700, 1000], [740, 700]];
  out.push(`<mask id="rt-yardmask" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">` + path(smoothD(yard, true), { fill: "#fff", filter: PRINT ? undefined : "url(#rt-feather)" }) + `</mask>`);
  out.push(rect(0, 0, W, H, { fill: "url(#rt-gravel)", mask: "url(#rt-yardmask)" }));
  // worn track from the gate to the tower and on to the hut door
  out.push(path(smoothD([[800, 1700], [880, 1500], [1100, 1300], [1300, 1170], [1500, 1150], [1750, 1000], [1880, 760], [1900, 705]]), { fill: "none", stroke: PRINT ? PAL.edge : "#6e695f", "stroke-width": 60, "stroke-linecap": "round", opacity: 0.55 }));
  // nettle clumps (round the feet, along the fence, at the yard's edge)
  const nettle = (cx, cy, r) => {
    let s = "";
    for (let i = 0; i < 9; i++) {
      const a = R() * Math.PI * 2, d = R() * r * 0.7;
      const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d;
      const pts = [];
      for (let k = 0; k < 10; k++) { const aa = (k / 10) * Math.PI * 2 + R() * 0.3; const rr = (k % 2 ? 7 : 14) * (0.8 + R() * 0.4); pts.push([x + Math.cos(aa) * rr, y + Math.sin(aa) * rr]); }
      s += path(polyD(pts), { fill: R() < 0.5 ? "#3d7034" : "#4f8442", stroke: "#142612", "stroke-width": 1.5 });
    }
    return s;
  };
  const nettleSpots = [[1190, 690, 40], [1710, 690, 34], [1190, 1210, 36], [1710, 1220, 42], [960, 560, 50], [2180, 900, 46], [1000, 1480, 48], [1650, 1450, 40], [760, 900, 44], [2230, 1200, 40], [520, 600, 50], [560, 1250, 46], [2300, 1400, 44], [1500, 380, 40], [880, 420, 36]];
  for (const [x, y, r] of nettleSpots) out.push(nettle(x, y, r));

  // ---------- the cable trench (row 6), covered with concrete slabs ----------
  {
    const y0 = 610, y1 = 690;
    out.push(rect(2200, y0 - 6, 600, y1 - y0 + 12, { fill: "#1a1a1a" }));
    for (let x = 2200; x < 2700; x += 50) out.push(rect(x + 2, y0, 46, y1 - y0, { fill: "url(#rt-concrete)", stroke: "#2e2d2a", "stroke-width": 2 }) + rect(x + 18, y0 + 34, 12, 12, { rx: 3, fill: "none", stroke: "#3a3936", "stroke-width": 2 }));
    // the open end in the observatory grounds: slabs off, iron rungs going down, cables inside
    out.push(rect(2700, y0, 100, y1 - y0, { fill: "#0c0c0c", stroke: "#2e2d2a", "stroke-width": 3 }));
    out.push(path("M2705 640 C 2740 645, 2770 655, 2795 650", { fill: "none", stroke: "#3a2a1a", "stroke-width": 8 }) + path("M2705 662 C 2740 668, 2770 670, 2795 664", { fill: "none", stroke: "#2a2a2a", "stroke-width": 7 }));
    for (const x of [2716, 2740, 2764]) out.push(line(x, y0 + 4, x, y1 - 4, { stroke: "#7a7064", "stroke-width": 3 }));
    out.push(rect(2806, 612, 70, 60, { fill: "url(#rt-concrete)", stroke: "#2e2d2a", "stroke-width": 2, transform: "rotate(12 2840 642)" })); // lifted slab, lying on the grass
  }

  // ---------- the transmitter hut (cols 18-21, rows 4-6) ----------
  {
    const hx = 1800, hy = 400, hw = 400, hh = 300;
    out.push(rect(hx + 10, hy + 12, hw, hh, { fill: "#000", opacity: 0.45 }));
    out.push(rect(hx, hy, hw, hh, { fill: "url(#rt-floor)" }));
    // racks of dead valves along the north wall
    for (const [x, w] of [[1830, 150], [2010, 150]]) {
      out.push(rect(x, 418, w, 50, { fill: "#2c3034", stroke: "#0c0e10", "stroke-width": 3 }));
      for (let i = 0; i < Math.floor(w / 18); i++) for (const yy of [432, 454]) out.push(circle(x + 10 + i * 18, yy, 6, { fill: "#6a7a84", stroke: "#1a1e22", "stroke-width": 1.5 }) + circle(x + 8 + i * 18, yy - 2, 2, { fill: "#cfd8de", opacity: 0.6 }));
    }
    // desk along the east wall with the 1926 logbook (open, on the desk top), a chair
    out.push(rect(2112, 500, 70, 140, { fill: "#5a4030", stroke: "#1a100a", "stroke-width": 3 }));
    out.push(rect(2122, 540, 50, 36, { fill: "#2a3a2a", stroke: "#0c120c", "stroke-width": 1.5 }) + rect(2125, 543, 21, 30, { fill: "#e6dcc0" }) + rect(2148, 543, 21, 30, { fill: "#e6dcc0" }));
    for (let i = 0; i < 4; i++) out.push(path(`M${2128} ${549 + i * 6} q 4 -2 8 0 t 8 0`, { fill: "none", stroke: "#7a6a4a", "stroke-width": 1 }) + path(`M${2151} ${549 + i * 6} q 4 -2 8 0 t 8 0`, { fill: "none", stroke: "#7a6a4a", "stroke-width": 1 }));
    out.push(rect(2076, 552, 30, 30, { rx: 4, fill: "#4a3a2a", stroke: "#1a100a", "stroke-width": 2.5 }));
    // the trench hatch in the floor (east side)
    out.push(rect(2112, 650, 70, 40, { fill: "#2a2a2a", stroke: "#0a0a0a", "stroke-width": 3 }) + line(2112, 670, 2182, 670, { stroke: "#4a4a4a", "stroke-width": 2 }));
    // thick cables: from the racks across the floor, out through the west wall, to the tower's north-east leg
    const cab = [[1900, 470], [1890, 560], [1840, 640], [1800, 660], [1700, 700], [1660, 742]];
    out.push(path(smoothD(cab), { fill: "none", stroke: "#0e0e0e", "stroke-width": 16, "stroke-linecap": "round" }));
    out.push(path(smoothD(cab), { fill: "none", stroke: "#3a2a1a", "stroke-width": 8, "stroke-linecap": "round" }));
    out.push(path(smoothD(cab.map(([x, y]) => [x + 9, y + 6])), { fill: "none", stroke: "#2a2a2a", "stroke-width": 7, "stroke-linecap": "round" }));
    // brick walls: door (south), boarded windows (west, south, north), cable hole (west)
    const bw = { fill: "url(#rt-brick)", edge: "#1a100c" };
    out.push(wall(hx, hy, hx + hw, hy, 22, [], bw), wall(hx + hw, hy, hx + hw, hy + hh, 22, [], bw));
    out.push(wall(hx, hy, hx, hy + hh, 22, [], bw), wall(hx, hy + hh, hx + hw, hy + hh, 22, [[60, 140]], bw));
    const boards = (x, y, w, h) => {
      let s = rect(x, y, w, h, { fill: "#1a1410" });
      const horiz = w > h;
      for (let i = 0; i < 3; i++) s += horiz ? rect(x + 6 + i * (w - 12) / 3, y - 4, (w - 12) / 3 - 4, h + 8, { fill: "#6a5a44", stroke: "#2a2014", "stroke-width": 1.5, transform: `rotate(${(i - 1) * 8} ${x + 6 + (i + 0.5) * (w - 12) / 3} ${y + h / 2})` })
        : rect(x - 4, y + 6 + i * (h - 12) / 3, w + 8, (h - 12) / 3 - 4, { fill: "#6a5a44", stroke: "#2a2014", "stroke-width": 1.5, transform: `rotate(${(i - 1) * 8} ${x + w / 2} ${y + 6 + (i + 0.5) * (h - 12) / 3})` });
      return s;
    };
    out.push(boards(1789, 480, 22, 70), boards(2050, 689, 90, 22), boards(1950, 389, 90, 22));
    // the door, hanging open on its hinge
    out.push(door(1860, 700, 1940, 700, 1, { leaf: "#4a3424" }));
  }

  // ---------- the tower ----------
  const cx = 1450, cy = 950;
  const corner = (k, h) => { // k: 0 NW, 1 NE, 2 SE, 3 SW; h: half-size at that height
    const sx = k === 0 || k === 3 ? -1 : 1, sy = k === 0 || k === 1 ? -1 : 1;
    return [cx + sx * h, cy + sy * h];
  };
  const levels = [200, 160, 110, 80, 50]; // half-size at the feet, a third up, halfway, two thirds, the top
  {
    // concrete feet
    for (let k = 0; k < 4; k++) {
      const [x, y] = corner(k, 200);
      out.push(rect(x - 40 + 6, y - 40 + 8, 80, 80, { fill: "#000", opacity: 0.4 }));
      out.push(rect(x - 40, y - 40, 80, 80, { fill: "#8a8781", stroke: "#2a2926", "stroke-width": 4 }));
      out.push(rect(x - 40, y - 40, 80, 80, { fill: "url(#rt-concrete)", opacity: 0.4 }));
      for (const [dx, dy] of [[-22, -22], [22, -22], [-22, 22], [22, 22]]) out.push(circle(x + dx, y + dy, 5, { fill: "#5a5650", stroke: "#2a2926", "stroke-width": 1.5 }));
    }
    const steel = "#7d8790", steelD = "#2a3036";
    const L = [];
    const seg = (a, b, w) => L.push(line(a[0], a[1], b[0], b[1], { stroke: steelD, "stroke-width": w + 4, "stroke-linecap": "round" }), line(a[0], a[1], b[0], b[1], { stroke: steel, "stroke-width": w, "stroke-linecap": "round" }));
    // bracing: horizontal rings at each level, X braces on each face between levels
    for (let i = 0; i < levels.length - 1; i++) {
      for (let k = 0; k < 4; k++) {
        const a0 = corner(k, levels[i]), b0 = corner((k + 1) % 4, levels[i]);
        const a1 = corner(k, levels[i + 1]), b1 = corner((k + 1) % 4, levels[i + 1]);
        seg(a0, b1, 3); seg(b0, a1, 3);
      }
    }
    for (const h of levels.slice(1)) for (let k = 0; k < 4; k++) seg(corner(k, h), corner((k + 1) % 4, h), 4);
    // the four legs (heavier)
    for (let k = 0; k < 4; k++) seg(corner(k, 200), corner(k, 50), 9);
    out.push(grp(L));
    // the cables run up the north-east leg
    out.push(line(1650, 750, 1500, 900, { stroke: "#3a2a1a", "stroke-width": 5, opacity: 0.9 }));
    // the platform halfway up (grating, with a hole for the ladder)
    out.push(path(`${polyD([corner(0, 132), corner(1, 132), corner(2, 132), corner(3, 132)])} ${polyD([corner(0, 96), corner(1, 96), corner(2, 96), corner(3, 96)])}`, { fill: "url(#rt-grate)", "fill-rule": "evenodd", stroke: "#1a1e22", "stroke-width": 3, opacity: 0.88 }));
    out.push(path(polyD([corner(0, 132), corner(1, 132), corner(2, 132), corner(3, 132)]), { fill: "none", stroke: "#a8b2ba", "stroke-width": 3 })); // its railing
    // the caged ladder up the south face, centre
    out.push(line(1438, 1150, 1438, 1000, { stroke: "#9aa4ac", "stroke-width": 3 }), line(1462, 1150, 1462, 1000, { stroke: "#9aa4ac", "stroke-width": 3 }));
    for (let y = 1004; y < 1150; y += 12) out.push(line(1438, y, 1462, y, { stroke: "#9aa4ac", "stroke-width": 2 }));
    for (let y = 1010; y < 1150; y += 26) out.push(path(`M1430 ${y} A 22 14 0 0 0 1470 ${y}`, { fill: "none", stroke: "#c0c8ce", "stroke-width": 2.5 }));
    // the platform at the top, with its railing
    out.push(rect(cx - 66, cy - 66, 132, 132, { fill: "url(#rt-grate)", stroke: "#1a1e22", "stroke-width": 3 }));
    out.push(rect(cx - 66, cy - 66, 132, 132, { fill: "none", stroke: "#b8c2ca", "stroke-width": 4 }));
    // the old aerial: a mast stub and a crossbar, with six valves hung from it and wired together
    out.push(line(cx - 130, cy, cx + 130, cy, { stroke: steelD, "stroke-width": 12, "stroke-linecap": "round" }), line(cx - 130, cy, cx + 130, cy, { stroke: "#9aa4ac", "stroke-width": 6, "stroke-linecap": "round" }));
    out.push(circle(cx, cy, 14, { fill: "#5a646c", stroke: steelD, "stroke-width": 3 }));
    const vx = [-112, -76, -40, 40, 76, 112];
    lights.push(ellipse(cx, cy + 10, 260, 170, { fill: "url(#rt-valve)" }));
    for (const dx of vx) lights.push(circle(cx + dx, cy + 14, 40, { fill: "url(#rt-valve)" }));
    top.push(path(`M${cx - 112} ${cy + 14} ${vx.map(dx => `L${cx + dx} ${cy + 14}`).join(" ")}`, { fill: "none", stroke: "#2a2a2a", "stroke-width": 2 }));
    for (const dx of vx) {
      top.push(line(cx + dx, cy - 4, cx + dx, cy + 4, { stroke: "#2a3036", "stroke-width": 3 })); // the hook on the bar
      top.push(circle(cx + dx, cy + 14, 11, { fill: "#e8f4ff", stroke: "#6a8aa8", "stroke-width": 2.5, opacity: 0.95 }) + circle(cx + dx, cy + 14, 4, { fill: "#ffffff" }));
    }
    // steel guy wires from the top and the halfway platform to three anchors in the ground
    const anchors = [[1250, 380], [2050, 1050], [1050, 1400]];
    for (const [ax, ay] of anchors) {
      out.push(rect(ax - 26 + 5, ay - 26 + 7, 52, 52, { fill: "#000", opacity: 0.4 }), rect(ax - 26, ay - 26, 52, 52, { fill: "#86837d", stroke: "#2a2926", "stroke-width": 3 }), circle(ax, ay, 7, { fill: "#4a4a48", stroke: "#1a1a18", "stroke-width": 2 }));
      const ang = Math.atan2(ay - cy, ax - cx);
      for (const r of [40, 100]) top.push(line(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r, ax, ay, { stroke: PRINT ? PAL.soft : "#c9d2d8", "stroke-width": PRINT ? 3 : 2.2, opacity: 0.85 }));
    }
  }

  // ---------- the chain-link fence round the hilltop ----------
  const fence = [[500, 200], [2100, 200], [2400, 500], [2400, 1500], [2200, 1700], [600, 1700], [400, 1500], [400, 300]];
  {
    const gaps = { gate: [700, 900], hole: [1115, 1190], slump: [900, 1200] };
    const F = [];
    const meshSeg = (a, b) => {
      F.push(line(a[0], a[1], b[0], b[1], { stroke: "#11161a", "stroke-width": 12, "stroke-linecap": "butt" }));
      F.push(line(a[0], a[1], b[0], b[1], { stroke: "url(#rt-mesh)", "stroke-width": 8, "stroke-linecap": "butt" }));
      F.push(line(a[0], a[1], b[0], b[1], { stroke: "#a9b3b9", "stroke-width": 1.5, opacity: 0.8 }));
    };
    for (let i = 0; i < fence.length; i++) {
      const a = fence[i], b = fence[(i + 1) % fence.length];
      if (a[1] === 1700 && b[1] === 1700) { meshSeg(a, [gaps.gate[1], 1700]); meshSeg([gaps.gate[0], 1700], b); continue; } // the gate gap (south side runs east to west)
      if (a[0] === 2400 && b[0] === 2400) { meshSeg(a, [2400, gaps.hole[0]]); meshSeg([2400, gaps.hole[1]], b); continue; } // the hole by the observatory path
      if (a[0] === 400 && b[0] === 400) { meshSeg(a, [400, gaps.slump[1]]); meshSeg([400, gaps.slump[0]], b); continue; } // the slumped stretch on the bank
      meshSeg(a, b);
    }
    // the slumped stretch: posts leaning out over the bank, the mesh sagging down it
    F.push(path("M400 1200 C 360 1150, 340 1080, 345 1050 C 350 1010, 360 950, 400 900", { fill: "none", stroke: "#11161a", "stroke-width": 11 }));
    F.push(path("M400 1200 C 360 1150, 340 1080, 345 1050 C 350 1010, 360 950, 400 900", { fill: "none", stroke: "url(#rt-mesh)", "stroke-width": 7, "stroke-dasharray": "40 14" }));
    for (const [y, dx] of [[1000, -48], [1100, -50]]) F.push(line(400, y, 400 + dx, y + 6, { stroke: "#5a5a58", "stroke-width": 9, "stroke-linecap": "round" }) + circle(400, y, 6, { fill: "#2a2a28" }));
    // the peeled-back flap at the hole
    F.push(path("M2400 1115 C 2430 1120, 2450 1135, 2440 1150 C 2432 1160, 2415 1150, 2410 1140", { fill: "none", stroke: "url(#rt-mesh)", "stroke-width": 8 }));
    F.push(path("M2400 1115 C 2430 1120, 2450 1135, 2440 1150 C 2432 1160, 2415 1150, 2410 1140", { fill: "none", stroke: "#a9b3b9", "stroke-width": 1.5 }));
    // posts every square along the straight runs and at the corners
    const posts = new Set();
    const addPost = (x, y) => posts.add(`${x},${y}`);
    for (let i = 0; i < fence.length; i++) {
      const a = fence[i], b = fence[(i + 1) % fence.length];
      const n = Math.round(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])) / 100);
      for (let k = 0; k <= n; k++) addPost(Math.round(a[0] + ((b[0] - a[0]) * k) / n), Math.round(a[1] + ((b[1] - a[1]) * k) / n));
    }
    for (const k of ["400,1000", "400,1100", "800,1700"]) posts.delete(k);
    for (const p of posts) { const [x, y] = p.split(",").map(Number); F.push(circle(x + 3, y + 4, 7, { fill: "#000", opacity: 0.4 }), circle(x, y, 7, { fill: "#6a6e72", stroke: "#1a1c1e", "stroke-width": 2.5 })); }
    // the iron gate: two leaves pushed open, the rusted chain hanging from one, the sign on the other
    const gl = (x1, y1, x2, y2) => line(x1, y1, x2, y2, { stroke: "#121416", "stroke-width": 12, "stroke-linecap": "round" }) + line(x1, y1, x2, y2, { stroke: "#4a5056", "stroke-width": 6, "stroke-linecap": "round" });
    F.push(gl(700, 1700, 760, 1610), gl(900, 1700, 855, 1606));
    for (let i = 0; i < 6; i++) F.push(ellipse(758 - i * 4 + (i % 2) * 3, 1622 + i * 11, 4, 6, { fill: "none", stroke: "#a0522d", "stroke-width": 3 })); // the chain, hanging from the left leaf
    F.push(rect(856, 1624, 34, 22, { fill: "#e8e2d2", stroke: "#3a2a1a", "stroke-width": 2, transform: "rotate(-64 873 1635)" }) + rect(860, 1630, 26, 4, { fill: "#a8322e", transform: "rotate(-64 873 1635)" }));
    F.push(rect(686, 1686, 28, 28, { fill: "#3a3e42", stroke: "#0e1012", "stroke-width": 3 }), rect(886, 1686, 28, 28, { fill: "#3a3e42", stroke: "#0e1012", "stroke-width": 3 })); // gate posts
    out.push(grp(F));
  }

  // ---------- labels and ways in and out ----------
  const labels = [];
  if (!PRINT) {
    const fl = (x, y, t, o = {}) => label(x, y, t, { size: 30, weight: 800, ...o });
    labels.push(fl(1450, 1300, "THE OLD RADIO TOWER", { size: 36, font: "display", weight: 700, ls: 3 }));
    labels.push(fl(1450, 1345, "six glowing valves hang from the aerial at the top", { size: 22, weight: 700 }));
    labels.push(fl(2000, 345, "Transmitter hut", { size: 26 }));
    labels.push(fl(1990, 590, ["dead valves, desk,", "1926 logbook"], { size: 18, weight: 700 }));
    labels.push(fl(1000, 1150, "The yard", { size: 26 }), fl(1000, 1185, "gravel and nettles", { size: 18, weight: 700 }));
    labels.push(fl(2450, 570, "Cable trench (covered)", { size: 22 }));
    labels.push(fl(800, 1560, "Iron gate", { size: 22 }), fl(800, 1590, "chain rusted through", { size: 17, weight: 700 }));
    labels.push(fl(2728, 300 - 0, "Observatory", { size: 28, font: "display", weight: 700 }));
    labels.push(fl(2640, 1600, "Observatory path", { size: 22, rot: 76 }));
    labels.push(fl(88, 1010, ["Gardens of", "the big", "houses"], { size: 22 }));
    labels.push(fl(285, 640, "Steep bank", { size: 22, rot: -90 }));
    labels.push(fl(1480, 160, "Chain-link fence round the whole hilltop", { size: 20, weight: 700, opacity: 0.9 }));
    labels.push(fl(975, 1850, "Steep lane", { size: 22, anchor: "start" }));
    const way = (x, y, ang, t, o) => wayMarker(x, y, ang, t, { size: 24, ...o });
    labels.push(way(860, 1965, 90, "Way in and out: the front gate", { lx: 1000, ly: 1935, anchor: "start" }));
    labels.push(way(2520, 1150, 0, "Way in and out:", { lx: 2620, ly: 1080, anchor: "start" }), fl(2620, 1110, "the gap in the fence", { size: 24, anchor: "start", fill: "#ffd98a" }));
    labels.push(way(2750, 712, -90, "Way in and out:", { lx: 2830, ly: 845, anchor: "middle" }), fl(2830, 875, "the cable trench", { size: 24, fill: "#ffd98a" }));
    labels.push(way(265, 1050, 180, "Way out only:", { lx: 255, ly: 1180, anchor: "middle", size: 22 }), fl(255, 1208, "slide down the bank", { size: 20, fill: "#ffd98a" }), fl(255, 1232, "(too steep to climb up)", { size: 17, weight: 700, fill: "#ffd98a" }));
  } else {
    const T = (x, y, t, o = {}) => plabel(x, y, t, { size: 66, font: "display", ls: 3, ...o });
    const F = (x, y, t, o = {}) => plabel(x, y, t, { size: 54, ...o });
    labels.push(T(1450, 1290, "THE OLD RADIO TOWER", { size: 70 }));
    labels.push(F(1450, 1362, "six glowing valves hang at the top", { size: 50 }));
    labels.push(F(2000, 338, "Transmitter hut", { size: 56 }));
    labels.push(F(1000, 1150, "The yard", { size: 58 }), F(1000, 1215, "gravel and nettles", { size: 50 }));
    labels.push(F(2450, 548, ["Cable trench", "(covered)"], { size: 50 }));
    labels.push(F(800, 1545, "Iron gate, chain rusted through", { size: 50 }));
    labels.push(T(2728, 300, "Observatory", { size: 60, ls: 1 }));
    labels.push(F(2655, 1640, "Observatory path", { size: 50, rot: 76 }));
    labels.push(F(88, 985, "Gardens of the big houses", { size: 52, rot: -90 }));
    labels.push(F(292, 520, "Steep bank", { size: 52, rot: -90 }));
    labels.push(F(1480, 148, "Chain-link fence round the whole hilltop", { size: 50 }));
    labels.push(F(1000, 1845, "Steep lane", { size: 52, anchor: "start" }));
    labels.push(pwayMarker(860, 1950, 90, "Way in and out: the front gate", { lx: 1000, ly: 1930, anchor: "start" }));
    labels.push(pwayMarker(2510, 1150, 0, ["Way in and out:", "the gap in", "the fence"], { lx: 2790, ly: 1270 }));
    labels.push(pwayMarker(2750, 730, -90, ["Way in and out:", "the cable trench"], { lx: 2790, ly: 875 }));
    labels.push(pwayMarker(275, 1050, 180, ["Way out only:", "slide down", "the bank (too", "steep to climb)"], { lx: 255, ly: 1300, size: 50 }));
  }

  const body = PRINT ? out.join("") + top.join("") + labels.join("") + printFrame() :
    out.join("") +
    rect(0, 0, W, H, { fill: "#95a3c8", style: "mix-blend-mode:multiply" }) +
    grp(lights, { style: "mix-blend-mode:screen" }) +
    rect(0, 0, W, H, { fill: "url(#rt-vignette)" }) +
    rect(0, 0, W, H, { filter: "url(#rt-grain)" }) +
    top.join("") + labels.join("");

  const data = {
    width: W, height: H, grid: G,
    points: [
      { key: "way-front-gate", label: "The lane and the gate: a steep lane ends at an iron gate with a rusted chain (rusted through) and a sign: Radio Larkhaven. Private. (a way in and out)", x: 800, y: 1700 },
      { key: "way-fence-gap", label: "A gap in the fence by the observatory path (a way in and out)", x: 2400, y: 1150 },
      { key: "way-cable-trench", label: "The cable trench, from the observatory grounds (a way in and out)", x: 2750, y: 650 },
      { key: "way-steep-bank", label: "The steep bank down into the gardens of the big houses (a way out only: too steep to climb up, easy to slide down)", x: 330, y: 1050 },
      { key: "transmitter-hut", label: "The transmitter hut: brick, boarded windows. Inside: racks of dead valves, a desk, a 1926 logbook, thick cables running out and up the tower", x: 2000, y: 550 },
      { key: "the-yard", label: "The yard: gravel and nettles round the tower's four concrete feet. Steel guy wires hum, though there is no wind", x: 1000, y: 1250 },
      { key: "the-tower", label: "The tower: a steel lattice mast with a caged ladder, a platform halfway up and a platform at the top", x: 1450, y: 1100 },
      { key: "the-valves", label: "Six glowing valves hang from the old aerial at the top, wired together. This is where he sings", x: 1450, y: 950 },
      { key: "cable-trench", label: "The cable trench: covered, it runs from the hut, under the fence, into the observatory grounds", x: 2300, y: 650 },
      { key: "observatory", label: "The observatory, next door", x: 2728, y: 420 },
    ],
    tokens: {
      coven: [[600, 1500], [700, 1500], [800, 1500], [900, 1500], [600, 1400], [700, 1400], [800, 1400]], // just inside the gate
      threat: [1400, 900],
      innocent: null,
    },
  };
  if (PRINT) {
    const pd = {
      ...printTownDefs(),
      "rt-grass": printGround.grass("rt-grass", 61, 36),
      "rt-lawn": grassPattern("rt-lawn", 62, PAL.paper, [PAL.edge, PAL.paper2], 160, 24),
      "rt-gravel": printGround.gravel("rt-gravel", 63),
      "rt-concrete": slabPattern("rt-concrete", 64, [PAL.paper2, PAL.edge, PAL.paper2], PAL.accent, 200, 50),
      "rt-floor": printGround.planks("rt-floor", 65, 18),
      "rt-lane": printGround.cobble("rt-lane", 66, 18),
    };
    return { name: "radio-tower", svg: bookSvg("Map: the old radio tower", body, defs, pd), data };
  }
  return { name: "radio-tower", svg: svgDoc(body, defs), data };
}

/* ===================================================================== */
/*  1. LARKHAVEN (gridless): the city at night                             */
/* ===================================================================== */
// An invented harbour city (ch13): sea to the south, the Harbour and Old Town in
// the middle, the Heights on the hill above (north), University Hill to the
// north-west, the Docks along the western shore, Saltmarsh to the east.
// Pins mark the Episode 1 places (ch14). Ch14 doesn't say which area Larkhaven
// General is in; it sits here between Old Town and University Hill.
function larkhaven() {
  const R = rng(1885);
  const defs = [
    townDefs(),
    grainFilter("lk-grain", 0.05),
    mottleFilter("lk-mottle", 0.004, 0.25, 9),
    `<linearGradient id="lk-sea" x1="0" x2="0" y1="0.55" y2="1"><stop offset="0" stop-color="#173852"/><stop offset="1" stop-color="#0a1828"/></linearGradient>`,
    glowGrad("lk-glow", "#ffcf7a", 0.6, 0.3),
    glowGrad("lk-cool", "#cfe0ff", 0.35, 0.4),
    `<linearGradient id="lk-beamlin" gradientUnits="userSpaceOnUse" x1="1660" y1="1745" x2="1990" y2="2010"><stop offset="0" stop-color="#fff3c8" stop-opacity="0.28"/><stop offset="1" stop-color="#fff3c8" stop-opacity="0"/></linearGradient>`,
    `<pattern id="lk-reeds" width="60" height="60" patternUnits="userSpaceOnUse">` +
      (() => { const r2 = rng(71); let s = `<rect width="60" height="60" fill="#3a4630"/>`; for (let i = 0; i < 46; i++) { const x = r2() * 60, y = r2() * 60; s += `<path d="M${f1(x)} ${f1(y)} l${f1((r2() - 0.5) * 3)} -${f1(5 + r2() * 6)}" stroke="${["#5a6a44", "#4a5838", "#6e7a52", "#2e3826"][Math.floor(r2() * 4)]}" stroke-width="1.6" stroke-linecap="round"/>`; } return s; })() + `</pattern>`,
    `<pattern id="lk-fields" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#24301f"/><path d="M0 10 H40 M0 30 H40" stroke="#2c3a26" stroke-width="3"/></pattern>`,
    `<pattern id="lk-mud" width="50" height="50" patternUnits="userSpaceOnUse"><rect width="50" height="50" fill="#3a3a33"/><path d="M5 12 q10 -4 20 0 M28 34 q8 -3 16 0 M8 40 q6 -2 12 0" stroke="#4a4a40" stroke-width="2" fill="none"/></pattern>`,
  ].join("");
  const out = [], lights = [], top = [];

  // ---------- sea, coast and land ----------
  const coast = [[0, 1210], [300, 1225], [600, 1240], [900, 1255], [1050, 1300], [1150, 1370], [1220, 1400], [1350, 1415], [1500, 1420],
    [1650, 1410], [1800, 1390], [1880, 1370], [1980, 1350], [2100, 1340], [2250, 1322], [2400, 1345], [2550, 1322], [2700, 1352], [2850, 1332], [3000, 1345]];
  const coastS = sampleSmooth(coast, 10);
  const land = [...coastS, [3000, 0], [0, 0]];
  out.push(rect(0, 0, W, H, { fill: "url(#lk-sea)" }));
  // waves
  for (let i = 0; i < 260; i++) {
    const x = R() * W, y = 1300 + R() * 700, l = 14 + R() * 26;
    out.push(path(`M${f1(x)} ${f1(y)} q ${f1(l / 2)} -5 ${f1(l)} 0`, { fill: "none", stroke: "#4a7090", "stroke-width": 2, opacity: 0.18 + R() * 0.2 }));
  }
  // mudflats off Saltmarsh (the drowned village shows here at low tide)
  const mud = [[2180, 1328], [2320, 1400], [2500, 1450], [2700, 1500], [2900, 1470], [3000, 1440], [3000, 1345], [2850, 1332], [2700, 1352], [2550, 1322], [2400, 1345], [2250, 1322]];
  out.push(path(smoothD(mud, true), { fill: "url(#lk-mud)", opacity: 0.85 }));
  out.push(path(smoothD(mud, true), { fill: "none", stroke: "#2a2a24", "stroke-width": 3, opacity: 0.6 }));
  // the harbour basin: calmer water inside the walls
  const westArm = [[1150, 1372], [1172, 1500], [1262, 1620], [1400, 1690]];
  const eastArm = [[1880, 1370], [1910, 1500], [1840, 1650], [1660, 1745]];
  out.push(path(polyD([...sampleSmooth(westArm, 10), ...sampleSmooth(eastArm, 10).reverse(), [1650, 1412], [1350, 1418]]), { fill: "#1f4862", opacity: 0.6 }));
  // the land
  out.push(path(polyD(land), { fill: "#202b29" }));
  out.push(path(polyD(land), { fill: "#000", filter: "url(#lk-mottle)", opacity: 1 }));
  out.push(path(polyD(coastS, false), { fill: "none", stroke: "#4a6274", "stroke-width": 4, opacity: 0.8 }));
  // fields and woods along the top edge (north of the city)
  const fieldsPoly = [[0, 0], [3000, 0], [3000, 120], [2400, 150], [2000, 190], [1700, 120], [1400, 170], [1150, 260], [900, 230], [500, 170], [150, 290], [0, 300]];
  out.push(path(smoothD(fieldsPoly, true), { fill: "url(#lk-fields)", opacity: 0.8 }));
  for (const [x1, y1, x2, y2] of [[300, 0, 330, 210], [700, 0, 690, 200], [1100, 0, 1130, 240], [1500, 0, 1480, 150], [2100, 0, 2120, 180], [2600, 0, 2580, 140], [0, 120, 600, 110], [800, 110, 1400, 90], [1800, 70, 2600, 60]]) out.push(line(x1, y1, x2, y2, { stroke: "#16200f", "stroke-width": 6, opacity: 0.8 }));
  for (const [x, y, r] of [[480, 60, 50], [560, 90, 40], [900, 140, 46], [1250, 70, 44], [1320, 120, 36], [2300, 60, 52], [2380, 100, 40], [2800, 50, 46], [150, 180, 40], [1850, 40, 34]]) out.push(treeCrown(x, y, r, R, { dark: "#1c2a18", mid: "#253620", light: "#36502c", shadow: 0.3 }));

  // ---------- areas ----------
  const AREA = {
    oldTown: [[1060, 1290], [1050, 1120], [1110, 930], [1250, 840], [1500, 815], [1750, 830], [1960, 880], [2010, 1050], [2000, 1330], [1880, 1362], [1650, 1402], [1350, 1408], [1150, 1362]],
    heights: [[1180, 820], [1120, 620], [1210, 380], [1400, 210], [1700, 150], [2010, 210], [2160, 430], [2110, 700], [1960, 860], [1750, 815], [1500, 800], [1260, 820]],
    uni: [[150, 330], [480, 210], [880, 260], [1100, 460], [1100, 780], [990, 880], [620, 940], [300, 900], [150, 660]],
    docks: [[0, 960], [300, 950], [600, 960], [960, 900], [1045, 1060], [1050, 1285], [900, 1250], [0, 1205]],
    marsh: [[2040, 200], [2400, 150], [3000, 120], [3000, 1340], [2850, 1325], [2700, 1345], [2550, 1316], [2400, 1338], [2250, 1316], [2110, 1330], [2020, 1050], [2170, 430]],
  };
  // ground tints per area
  out.push(path(smoothD(AREA.oldTown, true), { fill: "#2c2c2a", opacity: 0.8 }));
  out.push(path(smoothD(AREA.heights, true), { fill: "#22362a", opacity: 0.85 }));
  out.push(path(smoothD(AREA.uni, true), { fill: "#26302c", opacity: 0.8 }));
  out.push(path(smoothD(AREA.docks, true), { fill: "#2a2c30", opacity: 0.85 }));
  out.push(path(smoothD(AREA.marsh, true), { fill: "url(#lk-reeds)", opacity: 0.9 }));
  // hill contours (the Heights, University Hill) and the slope of Old Town
  const contour = (cx, cy, rx, ry, seed) => { const r2 = rng(seed); return path(smoothD(blobPts(cx, cy, rx, r2, 16, 0.07).map(([x, y]) => [x, cy + (y - cy) * (ry / rx)]), true), { fill: "none", stroke: "#a8c0a0", "stroke-width": 2, opacity: 0.16 }); };
  for (let i = 1; i <= 6; i++) out.push(contour(1660, 300, 90 * i, 70 * i, 300 + i));
  for (let i = 1; i <= 4; i++) out.push(contour(620, 560, 95 * i, 80 * i, 400 + i));
  for (const y of [1000, 1150, 1280]) out.push(path(smoothD([[1080, y + 20], [1300, y - 10], [1550, y - 30], [1800, y - 15], [1990, y + 10]]), { fill: "none", stroke: "#a8c0a0", "stroke-width": 2, opacity: 0.1 }));
  // Saltmarsh channels of black water
  for (const ch of [
    [[2200, 300], [2300, 500], [2260, 700], [2380, 900], [2330, 1100], [2420, 1330]],
    [[2700, 200], [2650, 420], [2760, 640], [2700, 860], [2820, 1080], [2760, 1340]],
    [[2380, 900], [2500, 960], [2640, 940], [2700, 860]],
    [[2900, 400], [2850, 600], [2950, 800], [3000, 900]],
  ]) {
    out.push(path(smoothD(ch), { fill: "none", stroke: "#0c141a", "stroke-width": 16, "stroke-linecap": "round" }));
    out.push(path(smoothD(ch), { fill: "none", stroke: "#1e3446", "stroke-width": 8, "stroke-linecap": "round" }));
  }

  // pools in the marsh, and paler patches of reed
  for (let i = 0; i < 26; i++) {
    const p = [2150 + R() * 830, 220 + R() * 1060];
    if (!inPoly(p, AREA.marsh)) continue;
    if (i % 3) out.push(path(smoothD(blobPts(p[0], p[1], 50 + R() * 70, R, 12, 0.3), true), { fill: "#5a6a44", opacity: 0.35 }));
    else out.push(path(smoothD(blobPts(p[0], p[1], 14 + R() * 22, R, 10, 0.25), true), { fill: "#162a38", stroke: "#0c141a", "stroke-width": 3 }));
  }

  // ---------- roads ----------
  const ROADS = [
    { w: 16, pts: [[460, 1196], [800, 1215], [1040, 1262], [1150, 1342], [1300, 1384], [1500, 1392], [1700, 1382], [1900, 1344], [2100, 1316], [2300, 1296], [2500, 1300], [2700, 1312], [3000, 1305]] }, // harbour road
    { w: 12, pts: [[1900, 1344], [1880, 1250], [1935, 1150], [1895, 1050], [1965, 960], [1900, 860], [1965, 760], [1880, 660], [1950, 560], [1850, 470], [1740, 390], [1660, 330], [1640, 280]], bus: true }, // Hill Road, up to the Heights
    { w: 9, pts: [[1450, 1390], [1462, 1300], [1480, 1215]] }, // Market Street
    { w: 7, pts: [[1480, 1180], [1420, 1080], [1330, 1000], [1250, 930], [1130, 870], [1000, 820], [850, 770]] },
    { w: 7, pts: [[1480, 1180], [1560, 1080], [1640, 1000], [1700, 930], [1760, 850], [1800, 760], [1760, 640], [1800, 520], [1720, 420], [1600, 360], [1500, 330]] },
    { w: 6, pts: [[1150, 1345], [1200, 1250], [1265, 1150], [1330, 1080]] },
    { w: 6, pts: [[1700, 1384], [1720, 1300], [1700, 1200], [1650, 1120], [1640, 1000]] },
    { w: 7, pts: [[1060, 1160], [1250, 1120], [1400, 1100], [1560, 1080], [1750, 1060], [1960, 1050], [2050, 1040]] },
    { w: 6, pts: [[1150, 960], [1350, 905], [1500, 880], [1650, 885], [1800, 905], [1950, 960]] },
    { w: 5, pts: [[1250, 1260], [1380, 1240], [1480, 1215], [1600, 1235], [1760, 1250], [1880, 1250]] },
    { w: 5, pts: [[1260, 1340], [1300, 1260], [1380, 1240]] },
    { w: 5, pts: [[1580, 1395], [1600, 1300], [1600, 1235]] },
    // the Heights: avenues round the hill
    { w: 7, pts: [[1220, 760], [1300, 620], [1420, 520], [1560, 470], [1700, 480], [1850, 470]] },
    { w: 6, pts: [[1280, 450], [1400, 360], [1540, 300], [1640, 330]] },
    { w: 6, pts: [[1965, 760], [2060, 640], [2080, 480], [2010, 330], [1900, 270], [1822, 252]] },
    // University Hill
    { w: 9, pts: [[850, 770], [700, 720], [560, 650], [420, 560], [300, 440], [220, 330]] },
    { w: 7, pts: [[1000, 820], [960, 640], [900, 480], [800, 330], [700, 240]] },
    { w: 6, pts: [[300, 700], [480, 580], [640, 460], [800, 400], [960, 400]] },
    { w: 6, pts: [[420, 860], [560, 800], [700, 720]] },
    // the Docks
    { w: 9, pts: [[0, 1060], [300, 1040], [600, 1030], [900, 1000], [1060, 1160]] },
    { w: 7, pts: [[450, 1030], [460, 1196]] }, { w: 7, pts: [[760, 1020], [770, 1215]] },
    { w: 8, pts: [[300, 1040], [360, 900], [420, 860]] },
    // out to Saltmarsh: a lane and the boardwalk to the hide
    { w: 7, pts: [[2050, 1040], [2200, 1000], [2350, 960], [2500, 980]] },
  ];
  const roadSamples = [];
  for (const r of ROADS) {
    const sm = sampleSmooth(r.pts, 6);
    for (let i = 0; i < sm.length; i++) {
      const a = sm[Math.max(0, i - 1)], b = sm[Math.min(sm.length - 1, i + 1)];
      roadSamples.push({ p: sm[i], ang: Math.atan2(b[1] - a[1], b[0] - a[0]), w: r.w });
    }
  }
  const roadD = ROADS.map(r => ({ d: smoothD(r.pts), w: r.w, bus: r.bus }));
  for (const r of roadD) out.push(path(r.d, { fill: "none", stroke: "#0e1214", "stroke-width": r.w + 6, "stroke-linecap": "round", "stroke-linejoin": "round" }));
  for (const r of roadD) out.push(path(r.d, { fill: "none", stroke: r.w >= 12 ? "#8c8576" : "#77715f", "stroke-width": r.w, "stroke-linecap": "round", "stroke-linejoin": "round" }));
  // steps on the steepest Old Town lanes
  for (const pts of [[[1150, 1345], [1200, 1250], [1265, 1150]], [[1700, 1300], [1700, 1200], [1650, 1120]]]) {
    out.push(path(smoothD(pts), { fill: "none", stroke: "#2a2620", "stroke-width": 8, "stroke-dasharray": "2 7" }));
  }
  // the boardwalk out to the birdwatchers' hide
  out.push(path("M2500 980 L2560 930", { stroke: "#8a7458", "stroke-width": 8 }));

  // ---------- buildings ----------
  const near = (p, minExtra) => {
    let best = null, bd = Infinity;
    for (const s of roadSamples) { const d = dist(p, s.p) - s.w / 2; if (d < bd) { bd = d; best = s; } }
    return { d: bd - minExtra, s: best };
  };
  const keepOut = [[1480, 1185, 70], [1700, 1010, 40], [1270, 1040, 40], [960, 950, 70], [1395, 1145, 30], [1885, 1250, 30], [1800, 245, 50], [1640, 225, 70], [700, 1080, 60], [690, 690, 70], [2560, 930, 40]];
  const blocked = p => keepOut.some(([x, y, r]) => dist(p, [x, y]) < r) || !inPoly(p, land);
  const scatter = (poly, step, size, opts = {}) => {
    const { roofs = ["#3c4048", "#463a36", "#3a3e44", "#4a4038"], density = 0.9, gap = 6, garden = false, maxFromRoad = 70, lit = 0.25 } = opts;
    const [minX, minY, maxX, maxY] = poly.reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x), Math.max(b[3], y)], [1e9, 1e9, -1e9, -1e9]);
    const s = [];
    for (let y = minY; y < maxY; y += step) for (let x = minX; x < maxX; x += step) {
      const p = [x + (R() - 0.5) * step * 0.6, y + (R() - 0.5) * step * 0.6];
      if (!inPoly(p, poly) || blocked(p) || R() > density) continue;
      const w = size[0] + R() * (size[1] - size[0]), h = size[0] * 0.7 + R() * (size[1] - size[0]) * 0.7;
      const { d, s: rs } = near(p, Math.max(w, h) / 2 + gap);
      if (d < 0 || d > maxFromRoad) continue;
      const ang = (rs.ang * 180) / Math.PI;
      if (garden) s.push(rect(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24, { fill: "#2c4630", stroke: "#1a2c1c", "stroke-width": 3, transform: `translate(${f1(p[0])} ${f1(p[1])}) rotate(${f1(ang)})` }));
      const col = roofs[Math.floor(R() * roofs.length)];
      s.push(rect(-w / 2, -h / 2, w, h, { fill: col, stroke: "#0c0e10", "stroke-width": 2, transform: `translate(${f1(p[0])} ${f1(p[1])}) rotate(${f1(ang)})` }));
      s.push(line(-w / 2 + 2, 0, w / 2 - 2, 0, { stroke: "#6a6e74", "stroke-width": 1.5, opacity: 0.6, transform: `translate(${f1(p[0])} ${f1(p[1])}) rotate(${f1(ang)})` }));
      if (R() < lit) { lights.push(circle(p[0], p[1], 16 + R() * 10, { fill: "url(#lk-glow)", opacity: 0.8 })); top.push(circle(p[0] + (R() - 0.5) * w * 0.5, p[1] + (R() - 0.5) * h * 0.5, 2.2, { fill: "#ffe2a0" })); }
    }
    return s.join("");
  };
  out.push(scatter(AREA.oldTown, 24, [14, 24], { density: 0.95, gap: 3, maxFromRoad: 60, lit: 0.3 }));
  out.push(scatter(AREA.heights, 64, [26, 40], { density: 0.75, gap: 18, garden: true, maxFromRoad: 70, lit: 0.25, roofs: ["#4a3c36", "#3e424a", "#524238"] }));
  out.push(scatter(AREA.uni, 40, [20, 34], { density: 0.8, gap: 6, maxFromRoad: 70, lit: 0.2 }));
  out.push(scatter(AREA.docks.filter(([x]) => x > 0), 46, [30, 50], { density: 0.8, gap: 6, maxFromRoad: 80, lit: 0.15, roofs: ["#4a5058", "#40464e", "#565c64"] }));

  // ---------- landmarks ----------
  // St Bride's market hall with the night market's lights round it
  out.push(rect(-44, -28, 88, 56, { fill: "#6a5a4a", stroke: "#0c0e10", "stroke-width": 3, transform: "translate(1480 1185) rotate(-8)" }));
  for (let i = -36; i <= 36; i += 12) out.push(line(i, -26, i, 26, { stroke: "#a0907a", "stroke-width": 1.5, transform: "translate(1480 1185) rotate(-8)" }));
  lights.push(circle(1470, 1200, 90, { fill: "url(#lk-glow)" }));
  for (let i = 0; i < 40; i++) { const a = R() * Math.PI * 2, r = 50 + R() * 40; top.push(circle(1470 + Math.cos(a) * r, 1200 + Math.sin(a) * r * 0.7, 1.8, { fill: "#ffe9a8" })); }
  // the Lantern House: a narrow house with its lamp
  out.push(rect(-7, -12, 14, 24, { fill: "#4a3c36", stroke: "#0c0e10", "stroke-width": 2, transform: "translate(1700 1010) rotate(-30)" }));
  lights.push(circle(1700, 1010, 50, { fill: "url(#lk-glow)" }));
  // Radio Larkhaven: a studio building with a small mast on the roof
  out.push(rect(-22, -16, 44, 32, { fill: "#40464e", stroke: "#0c0e10", "stroke-width": 2.5, transform: "translate(1270 1040) rotate(-20)" }));
  out.push(circle(1278, 1036, 5, { fill: "none", stroke: "#c9d2d8", "stroke-width": 2 }));
  // Larkhaven General: a big H-shaped block and its car park
  out.push(path("M920 920 h30 v20 h30 v-20 h30 v70 h-30 v-20 h-30 v20 h-30 Z", { fill: "#5a6068", stroke: "#0c0e10", "stroke-width": 3 }));
  out.push(rect(915, 1000, 100, 34, { fill: "#33363a", stroke: "#0c0e10", "stroke-width": 2 }));
  for (let x = 922; x < 1012; x += 10) out.push(line(x, 1002, x, 1014, { stroke: "#5a5e62", "stroke-width": 1.5 }));
  lights.push(circle(965, 960, 70, { fill: "url(#lk-cool)" }));
  // University library
  out.push(rect(640, 655, 110, 70, { fill: "#4a4440", stroke: "#0c0e10", "stroke-width": 3 }));
  out.push(rect(660, 672, 70, 36, { fill: "#2a3a2c", stroke: "#0c0e10", "stroke-width": 2 })); // its courtyard
  // the observatory and the old radio tower at the top of the Heights
  // (as on the radio-tower map: the observatory is just east of the tower's fence)
  out.push(circle(1800, 245, 22, { fill: "#c9ccd0", stroke: "#0c0e10", "stroke-width": 3 }) + rect(1795, 223, 10, 22, { fill: "#3a3e44" }));
  out.push(rect(1595, 180, 90, 90, { fill: "#33402e", stroke: "#a9b3b9", "stroke-width": 2, "stroke-dasharray": "5 4" }));
  out.push(rect(1625, 210, 30, 30, { fill: "none", stroke: "#9aa4ac", "stroke-width": 3 }) + line(1625, 210, 1655, 240, { stroke: "#9aa4ac", "stroke-width": 2 }) + line(1655, 210, 1625, 240, { stroke: "#9aa4ac", "stroke-width": 2 }));
  out.push(rect(1660, 195, 18, 12, { fill: "#6a4030", stroke: "#0c0e10", "stroke-width": 1.5 }));
  lights.push(circle(1640, 225, 40, { fill: "url(#lk-cool)", opacity: 0.9 }));
  lights.push(circle(1800, 268, 30, { fill: "url(#lk-glow)", opacity: 0.8 }));
  // the burned-out theatre
  out.push(path("M670 1050 L740 1048 L742 1112 L700 1114 L690 1100 L672 1110 Z", { fill: "#24180f", stroke: "#0c0e10", "stroke-width": 3 }));
  out.push(path("M684 1062 L726 1060 L728 1100 L686 1098 Z", { fill: "#120c08" }));
  // container yard and cranes (works through the night)
  for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) {
    if (R() < 0.15) continue;
    out.push(rect(40 + c * 36, 1085 + r * 16, 30, 11, { fill: ["#8a3a2a", "#2a5a7a", "#3a6a3a", "#7a7a7a", "#a07a2a"][Math.floor(R() * 5)], stroke: "#0c0e10", "stroke-width": 1.5 }));
  }
  // a container ship at the quay, and the gantry cranes working it
  out.push(path("M50 1238 L380 1238 L410 1262 L380 1286 L50 1286 Z", { fill: "#2a3440", stroke: "#0c0e10", "stroke-width": 3 }));
  for (let c = 0; c < 9; c++) for (let r = 0; r < 2; r++) if (R() < 0.85) out.push(rect(66 + c * 34, 1244 + r * 20, 30, 16, { fill: ["#8a3a2a", "#2a5a7a", "#3a6a3a", "#7a7a7a", "#a07a2a"][Math.floor(R() * 5)], stroke: "#0c0e10", "stroke-width": 1.5 }));
  out.push(rect(350, 1246, 24, 32, { fill: "#d8d4c8", stroke: "#0c0e10", "stroke-width": 2 })); // the bridge
  for (const x of [110, 230, 330]) {
    out.push(rect(x - 6, 1150, 12, 30, { fill: "#4a3a1a", stroke: "#0c0e10", "stroke-width": 1.5 })); // counterweight, on the quay
    out.push(rect(x - 4, 1150, 8, 150, { fill: "none", stroke: "#e0b048", "stroke-width": 2.5 })); // boom, reaching out over the ship
    for (let y = 1160; y < 1300; y += 14) out.push(line(x - 4, y, x + 4, y + 14, { stroke: "#e0b048", "stroke-width": 1.2 }));
    out.push(rect(x - 18, 1186, 36, 30, { fill: "none", stroke: "#e0b048", "stroke-width": 4 })); // gantry frame on the quay edge
    for (const [dx, dy] of [[-18, 1186], [18, 1186], [-18, 1216], [18, 1216]]) out.push(circle(x + dx, dy, 4, { fill: "#e0b048" }));
  }
  lights.push(ellipse(220, 1140, 230, 90, { fill: "url(#lk-cool)", opacity: 0.8 }));
  // the Docks quays and jetties
  for (const x of [520, 800]) out.push(rect(x, 1236, 50, 120, { fill: "#4a4a48", stroke: "#0c0e10", "stroke-width": 2 }));
  // new flats with glass balconies along the waterfront
  for (const [x, y] of [[480, 1150], [600, 1160], [820, 1150], [930, 1180]]) {
    out.push(rect(x, y, 90, 32, { fill: "#4a5058", stroke: "#0c0e10", "stroke-width": 2 }));
    out.push(line(x + 4, y + 30, x + 86, y + 30, { stroke: "#8ac4e0", "stroke-width": 3 }));
    for (let i = 0; i < 4; i++) top.push(rect(x + 8 + i * 21, y + 22, 8, 5, { fill: "#ffe2a0", opacity: 0.85 }));
  }
  // the harbour walls, the lighthouse, the fish market, the ferry jetty
  for (const arm of [westArm, eastArm]) {
    out.push(path(smoothD(arm), { fill: "none", stroke: "#0c0e10", "stroke-width": 30, "stroke-linecap": "round" }));
    out.push(path(smoothD(arm), { fill: "none", stroke: "#6a6a66", "stroke-width": 22, "stroke-linecap": "round" }));
  }
  out.push(rect(1236, 1378, 100, 26, { fill: "#5a5650", stroke: "#0c0e10", "stroke-width": 2.5 })); // fish market
  out.push(rect(1590, 1405, 16, 110, { fill: "#5a5650", stroke: "#0c0e10", "stroke-width": 2 })); // ferry jetty
  const ferry = (x, y, ang) => grp([
    path("M-40 -11 L30 -11 L42 0 L30 11 L-40 11 Z", { fill: "#d8d4c8", stroke: "#0c0e10", "stroke-width": 2.5 }),
    rect(-28, -6, 44, 12, { fill: "#6a7a8a", stroke: "#0c0e10", "stroke-width": 1.5 }),
    ...[-22, -12, -2, 8].map(dx => rect(dx, -4, 6, 8, { fill: "#ffe2a0" })),
  ], { transform: `translate(${x} ${y}) rotate(${ang})` });
  out.push(ferry(1640, 1480, -90 + 90));
  // ferry routes across the bay, and two ferries out on them
  out.push(path("M1530 1735 Q 1400 1860 1180 2010", { fill: "none", stroke: "#cfe0ff", "stroke-width": 3, "stroke-dasharray": "14 12", opacity: 0.45 }));
  out.push(path("M1530 1735 Q 1900 1900 2380 2010", { fill: "none", stroke: "#cfe0ff", "stroke-width": 3, "stroke-dasharray": "14 12", opacity: 0.45 }));
  for (const [x, y, a] of [[1330, 1895, 145], [2060, 1912, 18]]) {
    const r = (a * Math.PI) / 180;
    out.push(path(`M${f1(x - Math.cos(r) * 40)} ${f1(y - Math.sin(r) * 40)} l ${f1(-Math.cos(r - 0.3) * 70)} ${f1(-Math.sin(r - 0.3) * 70)} M${f1(x - Math.cos(r) * 40)} ${f1(y - Math.sin(r) * 40)} l ${f1(-Math.cos(r + 0.3) * 70)} ${f1(-Math.sin(r + 0.3) * 70)}`, { stroke: "#cfe0ff", "stroke-width": 2.5, opacity: 0.5, fill: "none" }));
    out.push(ferry(x, y, a));
    lights.push(circle(x, y, 50, { fill: "url(#lk-glow)", opacity: 0.6 }));
  }
  // the long pier: arcade at the sea end, lifeboat ramp near the shore
  out.push(rect(2068, 1330, 24, 380, { fill: "#6a5a48", stroke: "#0c0e10", "stroke-width": 2.5 }));
  for (let y = 1345; y < 1705; y += 14) out.push(line(2070, y, 2090, y, { stroke: "#3a2e22", "stroke-width": 1.5 }));
  out.push(rect(2030, 1700, 100, 60, { fill: "#5a4a6a", stroke: "#0c0e10", "stroke-width": 3 }));
  lights.push(circle(2080, 1730, 90, { fill: "url(#lk-glow)" }));
  for (let i = 0; i < 12; i++) top.push(circle(2034 + (i % 6) * 18, 1702 + Math.floor(i / 6) * 56, 2.5, { fill: ["#ffd27a", "#ff9a9a", "#9ad8ff"][i % 3] }));
  out.push(path("M2092 1420 L2140 1440 L2140 1460 L2092 1450 Z", { fill: "#7a7468", stroke: "#0c0e10", "stroke-width": 2 })); // lifeboat ramp
  out.push(rect(2096, 1396, 26, 22, { fill: "#8a3a2a", stroke: "#0c0e10", "stroke-width": 2 })); // lifeboat house
  // the lighthouse on the far arm, its beam out to sea
  lights.push(path("M1660 1745 L1830 2010 L2160 2010 Z", { fill: "url(#lk-beamlin)" }));
  lights.push(circle(1660, 1745, 80, { fill: "url(#lk-glow)" }));
  out.push(circle(1660, 1745, 16, { fill: "#e8e2d2", stroke: "#0c0e10", "stroke-width": 3 }));
  top.push(circle(1660, 1745, 7, { fill: "#fff3c8" }));
  // the drowned village: wall stubs showing in the mud
  for (const [x, y, w, h] of [[2600, 1395, 40, 30], [2660, 1410, 34, 26], [2720, 1400, 44, 30], [2640, 1450, 50, 22], [2710, 1452, 30, 24], [2780, 1430, 26, 26]]) out.push(rect(x, y, w, h, { fill: "none", stroke: "#8a8470", "stroke-width": 3, opacity: 0.7 }));
  out.push(rect(2683, 1438, 14, 14, { fill: "none", stroke: "#8a8470", "stroke-width": 3, opacity: 0.8 })); // the church tower base
  // the birdwatchers' hide on stilts
  for (const [dx, dy] of [[-12, -12], [12, -12], [-12, 12], [12, 12]]) out.push(circle(2560 + dx, 930 + dy, 3, { fill: "#2a2018" }));
  out.push(rect(2546, 916, 28, 28, { fill: "#6a5438", stroke: "#0c0e10", "stroke-width": 2.5 }));

  // ---------- street lights ----------
  for (const r of ROADS) {
    if (r.w < 6) continue;
    const sm = sampleSmooth(r.pts, 40);
    for (const p of sm) {
      if (!inPoly(p, land) || R() < 0.25) continue;
      lights.push(circle(p[0], p[1], 14, { fill: "url(#lk-glow)", opacity: 0.7 }));
      top.push(circle(p[0], p[1], 1.6, { fill: "#ffe9b0", opacity: 0.9 }));
    }
  }

  // ---------- labels ----------
  const area = (x, y, t, o = {}) => label(x, y, t, { font: "display", size: 60, weight: 700, ls: 10, fill: "#f3e6c4", hw: 12, ...o });
  top.push(area(1460, 925, "OLD TOWN"));
  top.push(area(1660, 650, "THE HEIGHTS"));
  top.push(area(600, 350, "UNIVERSITY HILL", { size: 54 }));
  top.push(area(470, 990, "THE DOCKS"));
  top.push(area(1530, 1560, "THE HARBOUR", { size: 50 }));
  top.push(area(2600, 700, "SALTMARSH"));
  const lm = (x, y, t, o = {}) => label(x, y, t, { size: 24, weight: 700, fill: "#dfe6ea", italic: true, ...o });
  top.push(lm(1660, 1790, "Lighthouse"), lm(2080, 1800, "Long pier: arcade"), lm(2185, 1430, "lifeboat ramp", { anchor: "start", size: 20 }));
  top.push(lm(1285, 1440, "Fish market", { size: 20 }), lm(1650, 1380 + 150, "Ferries", { size: 20, anchor: "start" }));
  top.push(lm(1160, 1960, "Ferries across the bay", { anchor: "end" }));
  top.push(lm(705, 1140, "Burned-out theatre", { size: 20 }), lm(220, 1060, "Container yard", { size: 20 }));
  top.push(lm(695, 750, "Library", { size: 20 }));
  top.push(lm(1800, 295, "Observatory", { size: 20 }));
  top.push(lm(2560, 975, "Birdwatchers' hide", { size: 20 }), lm(2700, 1510, "Drowned village (low tide)", { size: 20 }));
  top.push(lm(2560, 400, "Reed beds", { size: 22 }));
  top.push(lm(2010, 720, "Hill Road, the bus route", { size: 18, rot: -72 }));
  // the title and a north arrow
  top.push(label(490, 1690, "LARKHAVEN", { font: "display", size: 96, weight: 900, ls: 12, fill: "#f3e6c4", hw: 14 }));
  top.push(label(490, 1765, "a harbour city, at night", { size: 30, weight: 700, italic: true, fill: "#cfd8de" }));
  top.push(path("M2850 1640 L2872 1720 L2850 1706 L2828 1720 Z", { fill: "#f3e6c4", stroke: "#0c1016", "stroke-width": 4, "paint-order": "stroke" }));
  top.push(label(2850, 1612, "N", { font: "display", size: 34, weight: 700 }));

  // ---------- pins: the Episode 1 places ----------
  const PINS = [
    { key: "lantern-house", x: 1700, y: 1010, t: "Lantern House", lx: 24, ly: -6, a: "start", label: "The Lantern House (Old Town): the coven's home. The Book is in the attic (lead 5)" },
    { key: "st-brides", x: 1480, y: 1185, t: "St Bride's & the night market", lx: 26, ly: 42, a: "start", label: "St Bride's market hall and the Friday night market (Old Town): the market lanes (lead 3), the steps of St Bride's (lead 6), and the public place" },
    { key: "beas-flat", x: 1395, y: 1145, t: "Bea's flat, Cooper's Lane", lx: -24, ly: -8, a: "end", label: "Bea Santos's flat over the chip shop on Cooper's Lane (Old Town): lead 1" },
    { key: "radio-larkhaven", x: 1270, y: 1040, t: "Radio Larkhaven", lx: -24, ly: -6, a: "end", label: "The Radio Larkhaven studio (Old Town), where Grace Ellery hosts the late show: lead 2" },
    { key: "voice-clinic", x: 960, y: 950, t: "Voice clinic, Larkhaven General", lx: 0, ly: -62, a: "middle", label: "The voice clinic at Larkhaven General: lead 4" },
    { key: "bus-stop", x: 1885, y: 1250, t: "Bus stop for the Heights", lx: 24, ly: -6, a: "start", label: "The bus stop for the Heights, where the trail of grey threads leads (lead 3)" },
    { key: "radio-tower", x: 1640, y: 225, t: "Old radio tower", lx: -26, ly: -6, a: "end", label: "The old radio tower (the Heights), next to the observatory: the Quiet Man's hidden place" },
  ];
  for (const p of PINS) {
    top.push(path(`M${p.x} ${p.y} c -6 -12 -16 -18 -16 -30 a 16 16 0 0 1 32 0 c 0 12 -10 18 -16 30 Z`, { fill: "#e8a63a", stroke: "#1a1206", "stroke-width": 3.5 }));
    top.push(circle(p.x, p.y - 30, 6.5, { fill: "#1a1206" }));
    top.push(label(p.x + p.lx, p.y - 30 + p.ly, p.t, { size: 26, weight: 800, fill: "#ffd98a", anchor: p.a }));
  }

  const body = out.join("") +
    rect(0, 0, W, H, { fill: "#a8b4d4", style: "mix-blend-mode:multiply" }) +
    grp(lights, { style: "mix-blend-mode:screen" }) +
    rect(0, 0, W, H, { filter: "url(#lk-grain)" }) +
    top.join("");

  const data = {
    width: W, height: H, grid: G, gridless: true,
    points: PINS.map(p => ({ key: p.key, label: p.label, x: p.x, y: p.y })),
    tokens: null,
  };
  return { name: "larkhaven", svg: svgDoc(body, defs), data };
}

/* ===================================================================== */
/*  Harbour kit (Episodes 2 and 3): water, mud, sand, reeds, boats         */
/* ===================================================================== */
/** The tile offsets a mark near a tile edge needs so the tile repeats cleanly. */
function wraps(x, y, e, size) {
  const xs = [0], ys = [0];
  if (x - e < 0) xs.push(size);
  if (x + e > size) xs.push(-size);
  if (y - e < 0) ys.push(size);
  if (y + e > size) ys.push(-size);
  return xs.flatMap(dx => ys.map(dy => [dx, dy]));
}
/** Ripples: short curved strokes on flat water, as a tile. */
function waterPattern(id, seed, base, tones, size = 240, n = 30, sw = 2.2) {
  const R = rng(seed);
  let s = rect(0, 0, size, size, { fill: base });
  for (let i = 0; i < n; i++) {
    const x = R() * size, y = R() * size, l = 16 + R() * 30, c = tones[Math.floor(R() * tones.length)];
    for (const [dx, dy] of wraps(x + l / 2, y, l / 2 + 4, size)) s += path(`M${f1(x + dx)} ${f1(y + dy)} q ${f1(l / 2)} -6 ${f1(l)} 0`, { fill: "none", stroke: c, "stroke-width": sw, "stroke-linecap": "round" });
  }
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${s}</pattern>`;
}
/** Wet mud: a flat ground with sheen streaks and pits. */
function mudPattern(id, seed, base, sheen, pit, size = 200, n = 26) {
  const R = rng(seed);
  let s = rect(0, 0, size, size, { fill: base });
  for (let i = 0; i < n; i++) {
    const x = R() * size, y = R() * size, l = 12 + R() * 34;
    for (const [dx, dy] of wraps(x + l / 2, y, l / 2 + 4, size)) s += path(`M${f1(x + dx)} ${f1(y + dy)} q ${f1(l / 2)} -3 ${f1(l)} 0`, { fill: "none", stroke: sheen, "stroke-width": 2, "stroke-linecap": "round", opacity: 0.8 });
  }
  for (let i = 0; i < n * 1.4; i++) {
    const x = R() * size, y = R() * size, r = 1.2 + R() * 2.4;
    for (const [dx, dy] of wraps(x, y, r, size)) s += circle(x + dx, y + dy, r, { fill: pit });
  }
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${s}</pattern>`;
}
/** Sand: stipple and faint ripple marks. */
function sandPattern(id, seed, base, dots, ripple, size = 200, n = 120) {
  const R = rng(seed);
  let s = rect(0, 0, size, size, { fill: base });
  for (let i = 0; i < 9; i++) {
    const x = R() * size, y = R() * size, l = 40 + R() * 60;
    for (const [dx, dy] of wraps(x + l / 2, y, l / 2 + 4, size)) s += path(`M${f1(x + dx)} ${f1(y + dy)} q ${f1(l / 4)} -5 ${f1(l / 2)} 0 t ${f1(l / 2)} 0`, { fill: "none", stroke: ripple, "stroke-width": 2, opacity: 0.6 });
  }
  for (let i = 0; i < n; i++) {
    const x = R() * size, y = R() * size, r = 0.9 + R() * 1.6;
    for (const [dx, dy] of wraps(x, y, r, size)) s += circle(x + dx, y + dy, r, { fill: dots[Math.floor(R() * dots.length)] });
  }
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${s}</pattern>`;
}
/** Reeds seen from above: dense short strokes leaning one way. */
function reedPattern(id, seed, base, tones, size = 120, n = 150, sw = 2) {
  const R = rng(seed);
  let s = rect(0, 0, size, size, { fill: base });
  for (let i = 0; i < n; i++) {
    const x = R() * size, y = R() * size, l = 8 + R() * 12, a = -Math.PI / 2 + 0.5 + (R() - 0.5) * 0.9;
    const c = tones[Math.floor(R() * tones.length)];
    for (const [dx, dy] of wraps(x, y, l, size)) s += line(x + dx, y + dy, x + dx + Math.cos(a) * l, y + dy + Math.sin(a) * l, { stroke: c, "stroke-width": sw, "stroke-linecap": "round" });
  }
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${s}</pattern>`;
}
/** Corrugated iron (roofs, containers): stripes, `w` px apart. */
const corrugatedPattern = (id, base, rib, w = 16, rot = 0) =>
  `<pattern id="${id}" width="${w}" height="${w}" patternUnits="userSpaceOnUse"${rot ? ` patternTransform="rotate(${rot})"` : ""}>` +
  rect(0, 0, w, w, { fill: base }) + rect(0, 0, w * 0.42, w, { fill: rib }) + `</pattern>`;
/** Polished marble tiles, two tones in a checkerboard, with a few veins. */
function marblePattern(id, seed, a, b, vein, grout, t = 50) {
  const R = rng(seed);
  const size = t * 4;
  let s = rect(0, 0, size, size, { fill: grout });
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) s += rect(i * t + 1, j * t + 1, t - 2, t - 2, { fill: (i + j) % 2 ? a : b });
  for (let k = 0; k < 7; k++) {
    const x = R() * size, y = R() * size;
    s += path(`M${f1(x)} ${f1(y)} q ${f1(10 + R() * 20)} ${f1((R() - 0.5) * 30)} ${f1(30 + R() * 30)} ${f1((R() - 0.5) * 30)}`, { fill: "none", stroke: vein, "stroke-width": 1.2, opacity: 0.55 });
  }
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">${s}</pattern>`;
}
/** A small boat from above: pointed bow, square stern, thwarts. (x,y) centre; `ang` the way the bow points. */
function boat(x, y, len, wid, ang, o = {}) {
  const { hull = "#e0dccf", inside = "#7a5a3c", edge = "#14100c", thwarts = 2, shadow = 0.35 } = o;
  const L = len / 2, Wd = wid / 2;
  const hullD = `M ${f1(L)} 0 C ${f1(L * 0.6)} ${f1(-Wd)}, ${f1(-L * 0.5)} ${f1(-Wd)}, ${f1(-L)} ${f1(-Wd * 0.8)} L ${f1(-L)} ${f1(Wd * 0.8)} C ${f1(-L * 0.5)} ${f1(Wd)}, ${f1(L * 0.6)} ${f1(Wd)}, ${f1(L)} 0 Z`;
  const inD = `M ${f1(L * 0.8)} 0 C ${f1(L * 0.5)} ${f1(-Wd * 0.72)}, ${f1(-L * 0.45)} ${f1(-Wd * 0.72)}, ${f1(-L * 0.88)} ${f1(-Wd * 0.6)} L ${f1(-L * 0.88)} ${f1(Wd * 0.6)} C ${f1(-L * 0.45)} ${f1(Wd * 0.72)}, ${f1(L * 0.5)} ${f1(Wd * 0.72)}, ${f1(L * 0.8)} 0 Z`;
  const parts = [path(hullD, { fill: "#000", opacity: shadow, transform: "translate(5 7)" }), path(hullD, { fill: hull, stroke: edge, "stroke-width": 3 }), path(inD, { fill: inside, stroke: edge, "stroke-width": 1.5 })];
  for (let i = 0; i < thwarts; i++) { const tx = -L * 0.5 + (i + 0.5) * (L * 1.1 / thwarts); parts.push(rect(tx - 5, -Wd * 0.66, 10, Wd * 1.32, { fill: "#a07a50", stroke: edge, "stroke-width": 1.2 })); }
  return grp(parts, { transform: `translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)})` });
}
/** A mooring bollard on a quay. */
const bollard = (x, y, r = 12) =>
  circle(x + 3, y + 4, r, { fill: "#000", opacity: 0.4 }) + circle(x, y, r, { fill: "#2a2c30", stroke: "#0c0c0e", "stroke-width": 3 }) + circle(x - r * 0.3, y - r * 0.3, r * 0.35, { fill: "#5a5e66" });
/** A rope that sags a little between two points. */
function rope(a, b, sag = 0.08, o = {}) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, L = dist(a, b);
  const c = [mx - (b[1] - a[1]) * sag, my + (b[0] - a[0]) * sag]; // bowed sideways a little
  return path(`M${P(a)} Q${P(c)} ${P(b)}`, { fill: "none", stroke: o.col ?? "#c8b48a", "stroke-width": o.w ?? 4, "stroke-linecap": "round", opacity: o.op });
}
/** A railing along a line: a top rail and posts every `gap`. */
function railing(a, b, o = {}) {
  const { gap = 50, col = "#9aa4ac", dark = "#14181c", w = 5 } = o;
  let s = line(a[0], a[1], b[0], b[1], { stroke: dark, "stroke-width": w + 4, "stroke-linecap": "round" }) + line(a[0], a[1], b[0], b[1], { stroke: col, "stroke-width": w, "stroke-linecap": "round" });
  const n = Math.max(1, Math.round(dist(a, b) / gap));
  for (let i = 0; i <= n; i++) { const p = lerpP(a, b, i / n); s += circle(p[0], p[1], w * 0.9, { fill: col, stroke: dark, "stroke-width": 2 }); }
  return s;
}
/** A park or pier bench from above, `ang` the way the sitter faces. */
const benchTop = (x, y, ang = 0, w = 90) => grp([
  rect(-w / 2 + 4, -10 + 5, w, 26, { fill: "#000", opacity: 0.35 }),
  rect(-w / 2, -8, w, 22, { rx: 3, fill: "#6a4a30", stroke: "#22160d", "stroke-width": 2.5 }),
  line(-w / 2 + 3, -1, w / 2 - 3, -1, { stroke: "#22160d", "stroke-width": 1.5 }), line(-w / 2 + 3, 6, w / 2 - 3, 6, { stroke: "#22160d", "stroke-width": 1.5 }),
  rect(-w / 2, -14, w, 7, { rx: 2, fill: "#4e3320", stroke: "#22160d", "stroke-width": 2 }),
], { transform: `translate(${f1(x)} ${f1(y)}) rotate(${f1(ang)})` });
/** Night lighting helpers shared by the new maps: a lamp post (out + lights + top). */
function lampKit(out, lights, top, grad) {
  return (x, y, r = 200, op = 1) => {
    out.push(circle(x + 3, y + 4, 11, { fill: "#000", opacity: 0.4 }), circle(x, y, 11, { fill: "#2a2c30", stroke: "#0c0c0e", "stroke-width": 3 }));
    lights.push(circle(x, y, r, { fill: `url(#${grad})`, opacity: op }));
    top.push(circle(x, y, 6, { fill: "#fff0c0" }));
  };
}
/** Light speckles (drifting ash, spray, sparks). */
function speckles(R, n, x0, y0, w, h, o = {}) {
  const { col = "#d8d4cc", rmin = 1.5, rmax = 4, op = 0.5, test } = o;
  let s = "";
  for (let i = 0; i < n; i++) {
    const x = x0 + R() * w, y = y0 + R() * h;
    if (test && !test([x, y])) continue;
    s += circle(x, y, rmin + R() * (rmax - rmin), { fill: col, opacity: op * (0.5 + R() * 0.5) });
  }
  return s;
}

/* ===================================================================== */
/*  5. THE MARINER THEATRE (gridded, night): Episode 2's hidden place      */
/* ===================================================================== */
// A burned-out theatre in the middle of the Docks, between new flats and the
// container yard (book/src/chapters/33-ch15.html). Grid plan (100 px squares):
//   Warehouse next door  cols 6-20, rows 0-3 (roof only). The broken roof route
//                        crosses from it, over the stage house wall, onto the fly gallery
//   The theatre          cols 6-24, rows 4-14:
//     stage house        cols 6-12: the stage, the wedding arch (col 7), the fly gallery
//                        overhead (north and south walls and the back), stairs down (row 12),
//                        the stage door (west wall, row 10), the loading dock (south wall, cols 7-9)
//     stalls             cols 13-20: burnt seats in curved rows, roof trusses, open sky
//     foyer              cols 21-24: marble floor, grand staircase (north), mirror wall (south)
//   The front            east wall, three boarded doorways; canopy, ticket booth, sign (cols 25-27)
//   The street           cols 27-29
//   Container yard       cols 0-5, rows 0-12
//   Service lane         rows 15-16; New flats rows 17-19
//   Under the stage      inset, cols 0-5, rows 13-19 (the floor below the stage)
function marinerTheatre() {
  const R = rng(1911);
  const pc = (f, p) => PRINT ? p : f;
  const defs = [
    townDefs(),
    plankPattern("mt-stage", 71, ["#6e5238", "#765a3e", "#664a32", "#7c5e40"], "#2a1c12", 200, 20),
    plankPattern("mt-burnt", 72, ["#4c4540", "#544c46", "#47403b", "#403a35"], "#1a1410", 200, 18),
    marblePattern("mt-marble", 73, "#1e1e22", "#2c2c32", "#c8c8d0", "#0c0c0e", 50),
    corrugatedPattern("mt-tin", "#5a6068", "#474c54", 18),
    corrugatedPattern("mt-tin-rust", "#6a5040", "#57402f", 18),
    slabPattern("mt-pave", 74, ["#5e6066", "#66686e", "#595b61"], "#36383c", 200, 50),
    cobblePattern("mt-lane", 75, ["#4a4b4e", "#525356", "#45464a", "#57585b"], "#232426", 200, 20),
    gravelPattern("mt-yard", 76, "#4a4a4c", ["#58585a", "#3e3e40", "#646466", "#525254"], 120, 200),
    gravelPattern("mt-flatroof", 77, "#5c6066", ["#6a6e74", "#50545a", "#74787e"], 120, 160),
    slabPattern("mt-concrete", 78, ["#6a6a68", "#72726f", "#646462"], "#3e3e3c", 200, 100),
    `<pattern id="mt-grate" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#30363c"/><path d="M0 6 H12 M6 0 V12" stroke="#7e8a92" stroke-width="2"/></pattern>`,
    waterPattern("mt-seep", 79, "#25343a", ["#3e5560", "#4a6670", "#31444c"], 160, 18, 2),
    glowGrad("mt-moon", "#c8d8ff", 0.2, 0.5),
    glowGrad("mt-ember", "#ff9a4a", 0.6, 0.3),
    glowGrad("mt-flood", "#e8f0ff", 0.45, 0.3),
    grainFilter("mt-grain", 0.05),
  ].join("");
  const out = [], lights = [], top = [];
  const lamp = lampKit(out, lights, top, "tk-lamp");

  // ---------- ground: container yard, street, pavement, service lane ----------
  out.push(rect(0, 0, W, H, { fill: "url(#mt-yard)" }));
  out.push(rect(2500, 0, 260, 1720, { fill: "url(#mt-pave)" })); // pavement in front of the theatre
  out.push(rect(2760, 0, 240, H, { fill: pc("#2c2e33", PAL.edge) })); // the street
  out.push(rect(2756, 0, 10, 1720, { fill: pc("#8b8d90", PAL.accent) })); // kerb
  out.push(line(2885, 0, 2885, H, { stroke: pc("#c9b35a", PAL.paper), "stroke-width": 5, "stroke-dasharray": "50 40", opacity: 0.6 }));
  out.push(rect(600, 1500, 2160, 220, { fill: "url(#mt-lane)" })); // the service lane
  out.push(rect(2500, 1720, 260, 280, { fill: "url(#mt-pave)" }));

  // ---------- the warehouse next door (north) and the block north of the foyer ----------
  {
    out.push(rect(606, 8, 1500, 400, { fill: "#000", opacity: 0.35 }));
    out.push(rect(600, -20, 1500, 420, { fill: "url(#mt-tin)", stroke: "#0e1012", "stroke-width": 5 }));
    out.push(line(600, 190, 2100, 190, { stroke: pc("#7a828a", PAL.soft), "stroke-width": 6 })); // ridge
    out.push(rect(600, 190, 1500, 210, { fill: "#000", opacity: 0.22 }));
    for (const [x, y, w, h] of [[1300, 60, 160, 90], [1700, 250, 140, 80], [1050, 280, 120, 70]]) out.push(rect(x, y, w, h, { fill: "url(#mt-tin-rust)", opacity: 0.85 })); // rust patches
    for (const x of [1550, 1850]) out.push(rect(x, 40, 70, 120, { fill: pc("#8fb0c0", PAL.accentB), stroke: "#14181c", "stroke-width": 3, opacity: 0.8 }) + line(x, 100, x + 70, 100, { stroke: "#14181c", "stroke-width": 2 })); // skylights
    out.push(roof(2100, -40, 400, 440, { R: rng(3), pat: "url(#tk-slate-warm)", ridge: "v", chimneys: 2 }));
  }
  // ---------- the new flats (south) ----------
  {
    out.push(rect(606, 1728, 2134, 300, { fill: "#000", opacity: 0.35 }));
    out.push(rect(600, 1720, 2140, 300, { fill: "url(#mt-flatroof)", stroke: "#0e1012", "stroke-width": 5 }));
    out.push(rect(612, 1732, 2116, 280, { fill: "none", stroke: pc("#8a8e94", PAL.accent), "stroke-width": 6 })); // parapet
    for (let x = 700; x < 2700; x += 330) out.push(rect(x, 1820, 90, 60, { fill: pc("#7a7e84", PAL.edge), stroke: "#1a1c20", "stroke-width": 3 }) + circle(x + 45, 1850, 20, { fill: pc("#4a4e54", PAL.accent), stroke: "#1a1c20", "stroke-width": 2 })); // roof fans
    // glass balconies along the north face, lit windows behind
    for (let x = 640; x < 2700; x += 220) {
      out.push(rect(x, 1700, 160, 26, { fill: pc("#4e5a64", PAL.paper2), stroke: "#14181c", "stroke-width": 2.5 }));
      out.push(line(x + 2, 1702, x + 158, 1702, { stroke: pc("#8ac4e0", PAL.accent), "stroke-width": 3 }));
      if (R() < 0.6) { lights.push(pool(x - 10, x + 170, 1700, 110, "n", 0.55)); top.push(rect(x + 20, 1716, 120, 6, { fill: "#ffe2a6", opacity: 0.85 })); }
    }
  }
  // ---------- the container yard (west) ----------
  {
    const box = (x, y, w, h, col, stacked = false) => {
      let s = rect(x + 8, y + 10, w, h, { fill: "#000", opacity: stacked ? 0.5 : 0.38 });
      s += rect(x, y, w, h, { fill: col, stroke: "#0e1012", "stroke-width": 4 });
      const vert = h > w;
      for (let t = 14; t < (vert ? h : w) - 6; t += 14) s += vert ? line(x + 4, y + t, x + w - 4, y + t, { stroke: "#000", "stroke-width": 2, opacity: 0.28 }) : line(x + t, y + 4, x + t, y + h - 4, { stroke: "#000", "stroke-width": 2, opacity: 0.28 });
      s += rect(x, y, w, h, { fill: "none", stroke: "#fff", "stroke-width": 2, opacity: 0.12 });
      if (stacked) s += rect(x + 10, y + 10, w - 20, h - 20, { fill: "none", stroke: "#000", "stroke-width": 3, opacity: 0.35 });
      return s;
    };
    out.push(box(20, 30, 400, 160, "#7a3a2e", true), box(20, 200, 400, 160, "#2e5a7a"), box(440, 30, 140, 330, "#6a6e72"));
    out.push(box(20, 470, 400, 160, "#3a6a4a", true), box(60, 650, 400, 160, "#a8602e"));
    // pallets and a floodlight mast by the stage door
    for (const [x, y] of [[470, 520], [470, 600]]) out.push(rect(x, y, 90, 70, { fill: "#8a6a44", stroke: "#2a1c10", "stroke-width": 2.5 }) + line(x, y + 23, x + 90, y + 23, { stroke: "#2a1c10", "stroke-width": 2 }) + line(x, y + 47, x + 90, y + 47, { stroke: "#2a1c10", "stroke-width": 2 }));
    out.push(circle(530, 900, 14, { fill: "#2a2c30", stroke: "#0c0c0e", "stroke-width": 3 }));
    lights.push(circle(520, 960, 300, { fill: "url(#mt-flood)", opacity: 0.8 }));
    top.push(rect(516, 886, 28, 14, { fill: "#f4f8ff", stroke: "#1a1c20", "stroke-width": 2 }));
    // painted lane marks on the yard
    for (const y of [920, 1220]) out.push(line(0, y, 560, y, { stroke: pc("#c9b35a", PAL.paper), "stroke-width": 6, "stroke-dasharray": "40 30", opacity: 0.45 }));
  }

  // ---------- the theatre floors ----------
  const TX0 = 600, TX1 = 2500, TY0 = 400, TY1 = 1500; // outer wall lines
  const PROS = 1250, FOY = 2080;
  out.push(rect(TX0 + 10, TY0 + 12, TX1 - TX0, TY1 - TY0, { fill: "#000", opacity: 0.4 }));
  out.push(rect(TX0, TY0, PROS - TX0, TY1 - TY0, { fill: "url(#mt-stage)" })); // stage house: the stage floor
  out.push(rect(PROS, TY0, FOY - PROS, TY1 - TY0, { fill: "url(#mt-burnt)" })); // the stalls: scorched boards
  out.push(rect(FOY, TY0, TX1 - FOY, TY1 - TY0, { fill: "url(#mt-marble)" })); // the foyer
  // the apron: the stage reaches past the proscenium in a curve, with dead footlights along its lip
  const apron = `M${PROS} 640 C ${PROS + 80} 680, ${PROS + 115} 820, ${PROS + 118} 950 C ${PROS + 115} 1080, ${PROS + 80} 1220, ${PROS} 1260 Z`;
  out.push(path(apron, { fill: "url(#mt-stage)", stroke: "#140e0a", "stroke-width": 6 }));
  for (let i = 1; i < 14; i++) {
    const t = i / 14, a = -1.05 + 2.1 * t;
    const x = PROS + 6 + 104 * Math.cos(a) , y = 950 + 300 * Math.sin(a);
    out.push(circle(x, y, 5, { fill: pc("#9a9488", PAL.paper2), stroke: "#1a1612", "stroke-width": 1.5 }));
  }
  // soot and scorch marks on the stage boards, worst near the proscenium
  for (let i = 0; i < 6; i++) { const e = ellipse(1110 + R() * 120, 520 + R() * 860, 30 + R() * 40, 20 + R() * 30, { fill: "#000", opacity: 0.1 + R() * 0.08 }); if (!PRINT) out.push(e); }

  // ---------- the stalls: burnt seats in curved rows ----------
  const SC = [1150, 950]; // the rows curve round this point
  const seats = [];
  {
    const seat = (cx, cy, angDeg, k) => {
      const velvet = k < 0.18, tipped = k > 0.94;
      const fill = velvet ? "#6a2a2a" : "#1e1a18";
      return grp([
        rect(-9, -12, 18, 24, { rx: 3, fill, stroke: pc("#8a7e74", PAL.ink), "stroke-width": 1.6 }),
        rect(8, -13, 7, 26, { rx: 2, fill: velvet ? "#4a1e1e" : "#141110", stroke: pc("#8a7e74", PAL.ink), "stroke-width": 1.4 }),
      ], { transform: `translate(${f1(cx)} ${f1(cy)}) rotate(${f1(angDeg + (tipped ? 24 : 0))})` });
    };
    const rows = [300, 362, 424, 486, 548, 672, 734, 796, 858];
    for (const r of rows) {
      const step = 34 / r; // radians per seat (34 px apart along the row)
      for (let a = -0.62; a <= 0.62; a += step) {
        if (Math.abs(r * (Math.abs(a) - 0.34)) < 38) continue; // the two aisles, each about a square wide
        const x = SC[0] + r * Math.cos(a), y = SC[1] + r * Math.sin(a);
        if (y < 470 || y > 1430 || x > 2040 || x < PROS + 150) continue;
        const k = R();
        if (k < 0.07) continue; // burnt away
        seats.push(seat(x, y, (a * 180) / Math.PI, k));
      }
    }
    out.push(grp(seats));
    // rubble and fallen beams among the seats
    const beam = (x, y, l, ang) => grp([rect(-l / 2 + 5, -11 + 7, l, 22, { fill: "#000", opacity: 0.4 }), rect(-l / 2, -11, l, 22, { fill: "#2a1e16", stroke: "#0a0604", "stroke-width": 3 }),
      line(-l / 2 + 6, -3, l / 2 - 6, -3, { stroke: "#4a3424", "stroke-width": 2 })], { transform: `translate(${x} ${y}) rotate(${ang})` });
    out.push(beam(1700, 760, 300, 64), beam(1560, 1250, 240, -20), beam(1880, 1160, 220, 100));
    for (const [x, y, r] of [[1640, 700, 40], [1950, 1300, 46], [1480, 1340, 34], [1960, 620, 38]]) out.push(path(smoothD(blobPts(x, y, r, R, 12, 0.35), true), { fill: pc("#3a3430", PAL.accent), stroke: "#14100c", "stroke-width": 2 }) + speckles(R, 10, x - r, y - r, r * 2, r * 2, { col: "#6a625a", rmin: 3, rmax: 7, op: 0.9 }));
  }

  // ---------- the stage: wedding arch, ash bed, stairs down, fly gallery ----------
  {
    // the ash bed where she sleeps, in front of the arch
    out.push(path(smoothD(blobPts(860, 950, 82, R, 16, 0.22), true), { fill: pc("#8a8680", PAL.edge), opacity: 0.85 }));
    out.push(path(smoothD(blobPts(855, 950, 52, R, 14, 0.25), true), { fill: pc("#b4b0a8", PAL.paper2), opacity: 0.9 }));
    out.push(speckles(R, 40, 770, 860, 180, 180, { col: "#d8d4cc", rmin: 1.5, rmax: 3.5, op: 0.8, test: p => dist(p, [860, 950]) < 90 }));
    lights.push(circle(860, 950, 170, { fill: "url(#mt-ember)", opacity: 0.55 }));
    // the arch: two posts and the wire arc between them (seen from above, a line), wax flowers along it
    const ax = 760, ay0 = 830, ay1 = 1070;
    out.push(line(ax + 6, ay0 + 6, ax + 6, ay1 + 6, { stroke: "#000", "stroke-width": 10, opacity: 0.35 }));
    out.push(line(ax, ay0, ax, ay1, { stroke: "#20242a", "stroke-width": 9 }), line(ax, ay0, ax, ay1, { stroke: pc("#9aa0a6", PAL.accent), "stroke-width": 4 }));
    for (const y of [ay0, ay1]) out.push(rect(ax - 12, y - 12, 24, 24, { fill: "#3a3a3e", stroke: "#0c0c0e", "stroke-width": 3 }));
    for (let i = 0; i < 26; i++) {
      const y = ay0 + 14 + R() * (ay1 - ay0 - 28), x = ax + (R() - 0.5) * 22, r = 6 + R() * 6;
      out.push(path(smoothD(blobPts(x, y, r, R, 8, 0.3), true), { fill: ["#efe8d8", "#e6dcc4", "#f4f0e6", "#d8ccb0"][i % 4], stroke: "#5a5040", "stroke-width": 1.2 }));
    }
    for (let i = 0; i < 6; i++) out.push(ellipse(ax + 14 + R() * 20, ay0 + 30 + R() * (ay1 - ay0 - 60), 5, 3, { fill: "#efe8d8", opacity: 0.85 })); // melted wax drips on the boards
    // stairs down to under the stage (south-west of the stage), with a rail
    const sx0 = 640, sx1 = 860, sy0 = 1250, sy1 = 1350;
    out.push(rect(sx0, sy0, sx1 - sx0, sy1 - sy0, { fill: pc("#1a1410", PAL.soft) }));
    for (let i = 0; i < 9; i++) { const x = sx1 - 12 - i * 23; out.push(rect(x - 20, sy0 + 4, 22, sy1 - sy0 - 8, { fill: pc(`rgb(${110 - i * 9},${88 - i * 8},${64 - i * 6})`, i < 4 ? PAL.edge : PAL.accent) })); }
    out.push(rect(sx0, sy0, sx1 - sx0, sy1 - sy0, { fill: "none", stroke: "#0c0806", "stroke-width": 4 }));
    out.push(line(sx0, sy0 - 4, sx1, sy0 - 4, { stroke: "#7a7468", "stroke-width": 5 }));
    out.push(path(`M ${sx1 - 30} ${sy0 + 50} L ${sx0 + 50} ${sy0 + 50} M ${sx0 + 74} ${sy0 + 34} L ${sx0 + 50} ${sy0 + 50} L ${sx0 + 74} ${sy0 + 66}`, { fill: "none", stroke: pc("#e8dcc0", PAL.paper), "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.8 }));
    // rope coils and a sandbag on the stage, under the galleries
    for (const [x, y] of [[1000, 560], [1120, 1330], [700, 600]]) { out.push(circle(x + 3, y + 4, 22, { fill: "#000", opacity: 0.35 })); for (const r of [20, 14, 8]) out.push(circle(x, y, r, { fill: "none", stroke: "#b8a070", "stroke-width": 4 })); }
    out.push(ellipse(1180, 1210, 22, 16, { fill: "#8a7a5a", stroke: "#2a2014", "stroke-width": 2 }));
  }
  // ---------- the stage door (west) and the loading dock (south) ----------
  {
    // steps outside the stage door, and the door hanging open into the yard
    out.push(rect(540, 1040, 60, 120, { fill: "url(#mt-concrete)", stroke: "#1a1a18", "stroke-width": 3 }));
    out.push(line(570, 1042, 570, 1158, { stroke: "#2a2a28", "stroke-width": 2 }));
    // the loading dock: raised concrete platform with a striped edge, the roller door half up
    out.push(rect(680, 1515, 300, 90, { fill: "url(#mt-concrete)", stroke: "#1a1a18", "stroke-width": 4 }));
    for (let x = 680; x < 980; x += 30) out.push(path(`M${x} 1605 L${x + 15} 1590 L${x + 30} 1590 L${x + 15} 1605 Z`, { fill: pc("#d8b030", PAL.paper) }));
    out.push(line(680, 1597, 980, 1597, { stroke: "#1a1a18", "stroke-width": 3 }));
    for (let i = 0; i < 3; i++) out.push(rect(985, 1520 + i * 28, 40, 26, { fill: pc("#5e5e5c", PAL.edge), stroke: "#1a1a18", "stroke-width": 2 })); // steps up to the dock
    // a skip and pallets in the lane
    out.push(rect(1090, 1535, 170, 90, { fill: "#000", opacity: 0.35, transform: "translate(6 8)" }), rect(1090, 1535, 170, 90, { rx: 4, fill: "#3a5a46", stroke: "#0c140f", "stroke-width": 3 }), rect(1102, 1547, 146, 66, { fill: "#24302a", stroke: "#0c140f", "stroke-width": 2 }));
    for (let i = 0; i < 5; i++) out.push(rect(1110 + R() * 110, 1555 + R() * 40, 18 + R() * 16, 8 + R() * 8, { fill: ["#4a3a2a", "#6a6a6a", "#2a2a2a"][i % 3], transform: `rotate(${(R() - 0.5) * 60} 1170 1580)` }));
    lamp(2200, 1610, 190);
    lamp(1500, 1610, 170, 0.8);
  }

  // ---------- the foyer: grand staircase, mirror wall ----------
  {
    // the grand staircase: rises west along the north wall, then ends in empty air
    const gx0 = 2150, gx1 = 2470, gy0 = 440, gy1 = 640;
    out.push(rect(gx0 - 60, gy0, 60, gy1 - gy0, { fill: pc("#0c0c0e", PAL.soft) })); // the drop where the landing was
    out.push(rect(gx0 - 60, gy0, 60, gy1 - gy0, { fill: "url(#mt-burnt)", opacity: 0.35 }));
    for (let i = 0; i < 12; i++) {
      const x = gx1 - (i + 1) * ((gx1 - gx0) / 12);
      const shade = 0.12 + i * 0.045;
      out.push(rect(x, gy0, (gx1 - gx0) / 12, gy1 - gy0, { fill: pc("#6a6266", PAL.paper2) }));
      if (!PRINT) out.push(rect(x, gy0, (gx1 - gx0) / 12, gy1 - gy0, { fill: "#fff", opacity: shade * 0.5 }));
      out.push(line(x, gy0, x, gy1, { stroke: "#1a1618", "stroke-width": 3 }));
    }
    out.push(rect(gx0, gy0 + 50, gx1 - gx0, 100, { fill: pc("#6a2a2e", PAL.accent), opacity: 0.7 })); // the stair carpet, scorched
    out.push(line(gx0, gy0 + 6, gx1, gy0 + 6, { stroke: "#2a2224", "stroke-width": 12 }), line(gx0, gy1 - 6, gx1, gy1 - 6, { stroke: "#2a2224", "stroke-width": 12 })); // banisters
    out.push(line(gx0, gy0 + 6, gx1, gy0 + 6, { stroke: pc("#8a7a6a", PAL.accent), "stroke-width": 5 }), line(gx0, gy1 - 6, gx1, gy1 - 6, { stroke: pc("#8a7a6a", PAL.accent), "stroke-width": 5 }));
    // the broken top edge
    out.push(path(`M${gx0} ${gy0} L${gx0 - 14} ${gy0 + 30} L${gx0 + 6} ${gy0 + 62} L${gx0 - 18} ${gy0 + 100} L${gx0 + 4} ${gy0 + 138} L${gx0 - 10} ${gy0 + 170} L${gx0} ${gy1}`, { fill: "none", stroke: "#0a0808", "stroke-width": 6, "stroke-linejoin": "round" }));
    for (const [x, y, w] of [[2108, 470, 26], [2120, 560, 30], [2102, 610, 20]]) out.push(rect(x, y, w, 10, { fill: "#2a1e16", transform: `rotate(${(R() - 0.5) * 70} ${x} ${y})` })); // charred stair timbers below
    // the wall of mirrors along the south wall, cracked by the heat, shards on the floor
    const my = 1458;
    out.push(rect(2110, my, 360, 22, { fill: pc("#9cb4c4", PAL.accentB), stroke: "#1a1c20", "stroke-width": 3 }));
    for (let x = 2110; x <= 2470; x += 60) out.push(line(x, my, x, my + 22, { stroke: "#1a1c20", "stroke-width": 3 }));
    for (let i = 0; i < 9; i++) { const x = 2120 + R() * 340; out.push(path(`M${f1(x)} ${my} l ${f1((R() - 0.5) * 20)} 11 l ${f1((R() - 0.5) * 20)} 11`, { fill: "none", stroke: "#f4f8fa", "stroke-width": 1.6 })); }
    for (let i = 0; i < 12; i++) { const x = 2120 + R() * 340, y = my - 10 - R() * 40; out.push(path(`M${f1(x)} ${f1(y)} l 9 -4 l -3 10 Z`, { fill: pc("#cfe0ea", PAL.light), stroke: "#2a3036", "stroke-width": 1, transform: `rotate(${f1(R() * 360)} ${f1(x)} ${f1(y)})` })); }
    // light through the gaps in the boarded front doors
    for (const y of [800, 950, 1100]) lights.push(pool(y - 40, y + 40, 2500, 140, "w", 0.5));
  }

  // ---------- walls ----------
  {
    const bw = { fill: pc("#3a2620", PAL.dark), edge: pc("#7a5a48", PAL.ink) };
    out.push(wall(TX0, TY0, TX1, TY0, 30, [], bw)); // north
    out.push(wall(TX0, TY1, TX1, TY1, 30, [[100, 350]], bw)); // south: the loading dock opening, x 700-950
    out.push(wall(TX0, TY0, TX0, TY1, 30, [[650, 750]], bw)); // west: the stage door, y 1050-1150
    out.push(wall(TX1, TY0, TX1, TY1, 30, [[350, 450], [500, 600], [650, 750]], bw)); // east: three boarded doorways
    out.push(wall(PROS, TY0, PROS, TY1, 34, [[200, 900]], bw)); // the proscenium wall and its arch
    out.push(wall(FOY, TY0, FOY, TY1, 24, [[320, 440], [660, 780]], bw)); // foyer to stalls: two doorways
    // scorch above every opening, soot streaks on the wall tops
    for (let i = 0; i < 24; i++) { const t = R(); out.push(ellipse(TX0 + t * (TX1 - TX0), R() < 0.5 ? TY0 : TY1, 30 + R() * 40, 10, { fill: "#000", opacity: 0.3 })); }
    // the stage door, hanging open into the yard
    out.push(door(600, 1150, 600, 1050, -1, { leaf: "#3a2a1e" }));
    // the roller door, half up: its slats fill the opening, with a dark gap under the bottom edge
    out.push(rect(700, 1490, 250, 20, { fill: pc("#6a7076", PAL.accent), stroke: "#14181c", "stroke-width": 2 }));
    for (let x = 704; x < 950; x += 10) out.push(line(x, 1491, x, 1509, { stroke: "#14181c", "stroke-width": 1.5, opacity: 0.6 }));
    out.push(rect(700, 1508, 250, 6, { fill: "#000", opacity: 0.6 }));
    // boards across the front doorways: some pulled away and dropped on the pavement
    for (const [y0, y1] of [[750, 850], [900, 1000], [1050, 1150]]) {
      for (let i = 0; i < 4; i++) {
        if (y0 === 900 && i === 1) continue; // one board already pulled off
        const yy = y0 + 12 + i * 24;
        out.push(rect(2484, yy - 7, 32, 14, { fill: "#6a5a44", stroke: "#2a2014", "stroke-width": 2, transform: `rotate(${(R() - 0.5) * 10} 2500 ${yy})` }));
      }
    }
    for (const [x, y, a] of [[2560, 930, 70], [2590, 1010, 35]]) out.push(rect(x - 45, y - 7, 90, 14, { fill: "#6a5a44", stroke: "#2a2014", "stroke-width": 2, transform: `rotate(${a} ${x} ${y})` }));
  }

  // ---------- the front: sagging canopy, ticket booth, sign ----------
  {
    // ticket booth (octagonal, burnt), at the south end under the canopy
    const bx = 2625, by = 1160, br = 46;
    const oct = Array.from({ length: 8 }, (_, i) => [bx + br * Math.cos((i + 0.5) * Math.PI / 4), by + br * Math.sin((i + 0.5) * Math.PI / 4)]);
    out.push(path(polyD(oct.map(([x, y]) => [x + 6, y + 8])), { fill: "#000", opacity: 0.4 }));
    out.push(path(polyD(oct), { fill: pc("#4a3a30", PAL.accent), stroke: "#14100c", "stroke-width": 4 }));
    out.push(path(polyD(oct.map(([x, y]) => [bx + (x - bx) * 0.62, by + (y - by) * 0.62])), { fill: pc("#2a201a", PAL.soft), stroke: "#14100c", "stroke-width": 2 }));
    out.push(line(bx + 30, by - 30, bx + 44, by + 14, { stroke: pc("#9cb4c4", PAL.accentB), "stroke-width": 5 })); // the ticket window
    // the sign: a board fixed across the middle doorway's boards
    out.push(rect(2512, 905, 26, 90, { fill: "#000", opacity: 0.35, transform: "translate(5 6)" }));
    out.push(rect(2512, 905, 26, 90, { fill: pc("#e8e2d2", PAL.paper), stroke: "#3a2a1a", "stroke-width": 2.5 }));
    out.push(rect(2512, 905, 26, 18, { fill: pc("#a8322e", PAL.alarmB) }), rect(2512, 977, 26, 18, { fill: pc("#a8322e", PAL.alarmB) }));
    // the canopy: an iron frame over the pavement, panels missing, its south end sagging
    const cx0 = 2510, cx1 = 2730, cy0 = 690, cy1 = 1220;
    const cv = [];
    cv.push(rect(cx0 + 10, cy0 + 14, cx1 - cx0, cy1 - cy0, { fill: "#000", opacity: 0.25 }));
    const panels = [];
    for (let j = 0; j < 7; j++) for (let i = 0; i < 2; i++) {
      if ((j === 2 && i === 1) || (j === 5 && i === 0) || (j === 6 && i === 1)) continue; // missing panels
      const x = cx0 + i * 110, y = cy0 + j * 75.7;
      const sag = j >= 5 ? (j - 4) * 6 : 0;
      panels.push(rect(x + 3, y + 3 + sag * 0.3, 104, 70, { fill: pc("#4a4440", PAL.soft), stroke: "#14100c", "stroke-width": 2, opacity: 0.9, transform: sag ? `rotate(${i ? sag * 0.4 : -sag * 0.4} ${x + 55} ${y + 37})` : undefined }));
    }
    cv.push(...panels);
    cv.push(rect(cx0, cy0, cx1 - cx0, cy1 - cy0, { fill: "none", stroke: "#20242a", "stroke-width": 10 }), rect(cx0, cy0, cx1 - cx0, cy1 - cy0, { fill: "none", stroke: pc("#6a6e74", PAL.accent), "stroke-width": 4 }));
    cv.push(line(cx0 + 110, cy0, cx0 + 110, cy1, { stroke: pc("#6a6e74", PAL.accent), "stroke-width": 4 }));
    for (const [x, y] of [[cx1, cy0], [cx1, cy0 + 265], [cx1, cy1]]) cv.push(circle(x, y, 9, { fill: "#2a2c30", stroke: "#0c0c0e", "stroke-width": 2.5 })); // posts
    for (let i = 0; i < 4; i++) cv.push(circle(cx1 - 4, cy0 + 40 + i * 130, 5, { fill: pc("#9a9488", PAL.paper2), stroke: "#1a1612", "stroke-width": 1.5 })); // dead bulbs along the edge
    out.push(grp(cv, { opacity: 0.92 }));
    lamp(2700, 380, 210); lamp(2700, 1500, 200);
  }

  // ---------- overhead: the fly gallery, the broken roof, the stalls' roof trusses ----------
  const over = [];
  {
    // the fly gallery: iron walkways along the north and south walls and across the back
    const gal = (x, y, w, h) => {
      let s = rect(x + 10, y + 14, w, h, { fill: "#000", opacity: 0.3 });
      s += rect(x, y, w, h, { fill: "url(#mt-grate)", opacity: 0.85 });
      s += rect(x, y, w, h, { fill: "none", stroke: pc("#a8b2ba", PAL.dark), "stroke-width": 4 });
      return s;
    };
    over.push(gal(618, 418, 610, 84), gal(618, 1398, 610, 84), gal(618, 502, 70, 896));
    // pin rails along the inner edges, ropes tied off and hanging
    for (const [y, d] of [[502, 1], [1398, -1]]) {
      over.push(line(700, y, 1225, y, { stroke: "#20242a", "stroke-width": 7 }), line(700, y, 1225, y, { stroke: pc("#c8a060", PAL.accent), "stroke-width": 3 }));
      for (let x = 730; x < 1220; x += 44) over.push(path(`M${x} ${y} q 8 ${12 * d} 0 ${26 * d} q -6 ${8 * d} 3 ${16 * d}`, { fill: "none", stroke: "#b8a070", "stroke-width": 3 }));
    }
    // battens hanging across the stage (high up): dashed, with ropes up to the grid
    for (const x of [850, 960, 1070, 1180]) over.push(line(x, 520, x, 1380, { stroke: pc("#c8c0a8", PAL.accent), "stroke-width": 4, "stroke-dasharray": "22 14", opacity: 0.6 }));
    // iron ladders down from the gallery to the stage, against the proscenium wall
    for (const [y0, y1] of [[505, 625], [1275, 1395]]) {
      over.push(line(1206, y0, 1206, y1, { stroke: pc("#9aa4ac", PAL.dark), "stroke-width": 4 }), line(1230, y0, 1230, y1, { stroke: pc("#9aa4ac", PAL.dark), "stroke-width": 4 }));
      for (let y = y0 + 8; y < y1; y += 14) over.push(line(1206, y, 1230, y, { stroke: pc("#9aa4ac", PAL.dark), "stroke-width": 2.5 }));
    }
    // the broken roof: torn edge over the north gallery, a ladder laid across from the warehouse roof
    over.push(path("M780 400 L800 372 L830 392 L860 360 L900 386 L930 356 L960 384 L990 366 L1010 400 Z", { fill: "#0a0a0c", opacity: 0.85 }));
    for (const x of [810, 880, 950]) over.push(rect(x - 6, 330, 12, 90, { fill: "#2a1e16", stroke: "#0a0604", "stroke-width": 2, transform: `rotate(${(R() - 0.5) * 30} ${x} 400)` }));
    over.push(line(895, 250, 895, 470, { stroke: "#1a1612", "stroke-width": 9 }), line(925, 250, 925, 470, { stroke: "#1a1612", "stroke-width": 9 }));
    over.push(line(895, 250, 895, 470, { stroke: pc("#a08060", PAL.accent), "stroke-width": 5 }), line(925, 250, 925, 470, { stroke: pc("#a08060", PAL.accent), "stroke-width": 5 }));
    for (let y = 262; y < 470; y += 22) over.push(line(895, y, 925, y, { stroke: pc("#a08060", PAL.accent), "stroke-width": 4 }));
    // the stalls' roof: three trusses still span the walls, one broken; ragged roof edges along the walls
    const truss = (x, y0, y1) => {
      if (PRINT) { // overhead: drawn light and dashed, so it can't be read as a wall
        let s = rect(x - 13, y0, 26, y1 - y0, { fill: PAL.paper, opacity: 0.7, stroke: PAL.soft, "stroke-width": 3, "stroke-dasharray": "16 10" });
        for (let y = y0 + 40; y < y1 - 20; y += 80) s += line(x - 12, y, x + 12, y + 40, { stroke: PAL.accent, "stroke-width": 3 });
        return s;
      }
      let s = rect(x - 10 + 8, y0 + 10, 20, y1 - y0, { fill: "#000", opacity: 0.35 });
      s += rect(x - 13, y0, 26, y1 - y0, { fill: "#2e2420", stroke: "#0a0604", "stroke-width": 3 });
      for (let y = y0 + 40; y < y1 - 20; y += 80) s += line(x - 12, y, x + 12, y + 40, { stroke: "#5a4636", "stroke-width": 3 });
      return s;
    };
    over.push(truss(1450, 415, 1485), truss(1910, 415, 1485), truss(1680, 415, 820), truss(1680, 1180, 1485));
    over.push(rect(1655, 812, 50, 16, { fill: pc("#2a1e16", PAL.accent), transform: "rotate(18 1680 820)" }), rect(1655, 1172, 50, 16, { fill: pc("#2a1e16", PAL.accent), transform: "rotate(-24 1680 1180)" }));
    const edge = (y, d) => { const pts = [[1265, y]]; for (let x = 1265; x <= 2068; x += 40) pts.push([x, y + d * (14 + R() * 40)]); pts.push([2068, y]); return path(polyD(pts), { fill: pc("#2a2a2e", PAL.accent), stroke: "#0c0c0e", "stroke-width": 2, opacity: 0.9 }); };
    over.push(edge(415, 1), edge(1485, -1));
    // drifting ash over the stalls (and some on the stage)
    over.push(speckles(R, PRINT ? 160 : 420, 1265, 430, 800, 1040, { col: pc("#d8d4cc", PAL.edge), rmin: 1.6, rmax: 4, op: PRINT ? 0.9 : 0.55 }));
    over.push(speckles(R, PRINT ? 40 : 90, 640, 430, 600, 1040, { col: pc("#d8d4cc", PAL.edge), rmin: 1.4, rmax: 3, op: PRINT ? 0.8 : 0.4 }));
    // moonlight through the open roof
    lights.push(rect(1265, 470, 803, 960, { fill: "#a8b8e0", opacity: 0.05 }));
    lights.push(ellipse(1680, 950, 520, 520, { fill: "url(#mt-moon)" }));
  }

  // ---------- under the stage (inset panel, bottom left) ----------
  const inset = [];
  {
    const ix = 0, iy = 1300, iw = 600, ih = 700;
    inset.push(rect(ix + 10, iy - 4, iw, ih + 10, { fill: "#000", opacity: 0.5 }));
    inset.push(rect(ix, iy, iw, ih, { fill: pc("#1a1c20", PAL.paper2), stroke: pc("#c8b48a", PAL.ink), "stroke-width": 8 }));
    inset.push(rect(ix + 4, iy + 4, iw - 8, 92, { fill: pc("#2a2620", PAL.paper) })); // title band
    inset.push(line(ix, iy + 98, ix + iw, iy + 98, { stroke: pc("#c8b48a", PAL.ink), "stroke-width": 4 }));
    // floors: three dressing rooms (west), the corridor and the stairs up (east)
    const fy0 = iy + 100, fy1 = iy + ih - 4;
    inset.push(rect(ix + 4, fy0, iw - 8, fy1 - fy0, { fill: "url(#mt-burnt)" }));
    // seeping harbour water, ankle-deep at high tide
    inset.push(rect(ix + 4, fy0, iw - 8, fy1 - fy0, { fill: "url(#mt-seep)", opacity: pc(0.7, 0.55) }));
    inset.push(path(`M ${ix + 4} ${fy0 + 60} C ${ix + 140} ${fy0 + 40}, ${ix + 260} ${fy0 + 90}, ${ix + 420} ${fy0 + 60}`, { fill: "none", stroke: pc("#5a7a84", PAL.accent), "stroke-width": 3, opacity: 0.6, "stroke-dasharray": "10 8" })); // the tide line
    const cx = ix + 430; // corridor west wall
    // stairs up to the stage, at the north end of the corridor
    for (let i = 0; i < 7; i++) inset.push(rect(cx + 12, fy0 + 6 + i * 20, 146, 18, { fill: pc(`rgb(${90 + i * 8},${78 + i * 7},${62 + i * 6})`, i < 3 ? PAL.accent : PAL.edge), stroke: "#14100c", "stroke-width": 1.5 }));
    inset.push(path(`M ${cx + 85} ${fy0 + 128} L ${cx + 85} ${fy0 + 22} M ${cx + 69} ${fy0 + 42} L ${cx + 85} ${fy0 + 22} L ${cx + 101} ${fy0 + 42}`, { fill: "none", stroke: pc("#e8dcc0", PAL.ink), "stroke-width": 5, "stroke-linecap": "round", "stroke-linejoin": "round" }));
    // walls
    const iw2 = { fill: pc("#3a2620", PAL.dark), edge: pc("#7a5a48", PAL.ink) };
    const rooms = [[fy0, fy0 + 198], [fy0 + 198, fy0 + 398], [fy0 + 398, fy1]];
    inset.push(wall(cx, fy0, cx, fy1, 16, rooms.map(([a, b]) => [(a + b) / 2 - fy0 - 40, (a + b) / 2 - fy0 + 40]), iw2));
    for (const [, b] of rooms.slice(0, 2)) inset.push(wall(ix + 4, b, cx, b, 14, [], iw2));
    rooms.forEach(([a, b], k) => {
      // a dressing table with bulbs round the mirror along the west wall, two chairs, a clothes rail
      inset.push(rect(ix + 14, a + 22, 44, b - a - 44, { fill: pc("#5a4030", PAL.accent), stroke: "#14100c", "stroke-width": 2.5 }));
      inset.push(rect(ix + 8, a + 34, 10, b - a - 68, { fill: pc("#9cb4c4", PAL.accentB), stroke: "#14100c", "stroke-width": 1.5 }));
      for (let y = a + 36; y < b - 34; y += 18) inset.push(circle(ix + 22, y, 3.5, { fill: pc("#cfc8b0", PAL.paper), stroke: "#2a2014", "stroke-width": 1 }));
      for (const dy of [0.35, 0.68]) inset.push(rect(ix + 72, a + (b - a) * dy - 15, 30, 30, { rx: 4, fill: pc("#4a3a2a", PAL.soft), stroke: "#14100c", "stroke-width": 2 }));
      inset.push(line(ix + 220, a + 30, ix + 380, a + 30, { stroke: pc("#9aa4ac", PAL.dark), "stroke-width": 5 }));
      for (let x = ix + 230; x < ix + 375; x += 22) inset.push(path(`M ${x} ${a + 30} l -8 14 l 16 0 Z`, { fill: pc(["#6a3a4a", "#3a4a6a", "#5a5a3a"][(x + k) % 3], PAL.accent), stroke: "#14100c", "stroke-width": 1.2 }));
      if (k === 1) inset.push(rect(ix + 260, b - 80, 110, 60, { fill: pc("#5a3a24", PAL.accent), stroke: "#14100c", "stroke-width": 2.5 }) + line(ix + 260, b - 60, ix + 370, b - 60, { stroke: "#14100c", "stroke-width": 2 })); // costume trunk
      inset.push(door(cx, (a + b) / 2 + 40, cx, (a + b) / 2 - 40, -1, { leaf: "#3a2a1e" }));
    });
    lights.push(rect(ix + 4, fy0, iw - 8, fy1 - fy0, { fill: "#6a8a9a", opacity: 0.08 }));
  }

  // ---------- labels and ways in and out ----------
  const labels = [];
  if (!PRINT) {
    const fl = (x, y, t, o = {}) => label(x, y, t, { size: 26, weight: 800, ...o });
    const T = (x, y, t, o = {}) => fl(x, y, t, { size: 30, font: "display", weight: 700, ls: 3, ...o });
    labels.push(T(1660, 500, "THE MARINER THEATRE", { size: 38 }), fl(1660, 548, "burned out: the roof is mostly sky", { size: 22, weight: 700 }));
    labels.push(T(1700, 960, "THE STALLS"), fl(1700, 1000, "rows of burnt seats; ash drifts down", { size: 20, weight: 700 }));
    labels.push(T(1010, 760, "THE STAGE"), fl(1010, 795, "the boards are sound", { size: 20, weight: 700 }));
    labels.push(fl(760, 790, "Wedding arch", { size: 22 }), fl(760, 1112, ["wire and wax flowers:", "she sleeps here"], { size: 18, weight: 700 }));
    labels.push(fl(930, 455, "Fly gallery (iron walkways high above)", { size: 18, weight: 700 }), fl(930, 1440, "Fly gallery (high above), hung with old ropes", { size: 18, weight: 700 }));
    labels.push(fl(750, 1225, "Stairs down to under the stage", { size: 18, weight: 700 }));
    labels.push(fl(470, 1015, "Stage door", { size: 22, anchor: "end" }));
    labels.push(T(2290, 920, "THE FOYER", { size: 26, ls: 2 }), fl(2290, 955, "black marble floor", { size: 18, weight: 700 }));
    labels.push(fl(2300, 690, "Grand staircase: ends in empty air", { size: 18, weight: 700 }));
    labels.push(fl(2290, 1410, "Wall of mirrors, cracked by heat", { size: 18, weight: 700 }));
    labels.push(T(2630, 640, "THE FRONT", { size: 24, ls: 2 }), fl(2630, 672, "sagging canopy", { size: 18, weight: 700 }));
    labels.push(fl(2625, 1240, "Ticket booth", { size: 18, weight: 700 }));
    labels.push(fl(2610, 960, ["Sign:", "Danger.", "Keep Out."], { size: 17, weight: 700, anchor: "start" }));
    labels.push(fl(240, 420, "Container yard", { size: 24 }));
    labels.push(fl(1350, 230, "The warehouse next door", { size: 24 }));
    labels.push(fl(1700, 1880, "New flats", { size: 24 }));
    labels.push(fl(1800, 1580, "Service lane", { size: 20 }));
    labels.push(T(300, 1335, "UNDER THE STAGE", { size: 24, ls: 2 }), fl(300, 1370, "the floor below the stage", { size: 17, weight: 700 }));
    labels.push(fl(210, 1440, "Damp dressing rooms", { size: 18 }), fl(210, 1470, "harbour water seeps in at high tide", { size: 15, weight: 700 }));
    labels.push(fl(515, 1560, ["stairs up", "to the", "stage"], { size: 15, weight: 700 }));
    const way = (x, y, ang, t, o) => wayMarker(x, y, ang, t, { size: 22, ...o });
    labels.push(way(2950, 950, 0, ["Way in and out:", "the front doors", "(the boards", "come away)"], { lx: 2870, ly: 1080 }));
    labels.push(way(60, 1100, 180, ["Way in and out: the stage", "door, from the container yard"], { lx: 260, ly: 1170 }));
    labels.push(way(825, 1690, 90, ["Way in and out: the loading dock", "(roller door half up)"], { lx: 880, ly: 1790, anchor: "start" }));
    labels.push(way(910, 50, -90, ["Way in and out: the broken roof,", "from the warehouse next door"], { lx: 1000, ly: 110, anchor: "start" }));
  } else {
    const T = (x, y, t, o = {}) => plabel(x, y, t, { size: 64, font: "display", ls: 3, ...o });
    const F = (x, y, t, o = {}) => plabel(x, y, t, { size: 52, ...o });
    labels.push(T(1666, 560, "THE MARINER THEATRE", { size: 58, ls: 2 }));
    labels.push(T(1700, 950, "THE STALLS", { size: 60 }), F(1700, 1020, "burnt seats; roof mostly sky", { size: 50 }));
    labels.push(T(1010, 720, "THE STAGE", { size: 56, ls: 2 }));
    labels.push(F(780, 790, "Wedding arch", { size: 50 }), F(860, 1120, ["she sleeps", "here"], { size: 50 }));
    labels.push(F(930, 462, "Fly gallery (high above)", { size: 50 }), F(930, 1440, "Fly gallery (high above)", { size: 50 }));
    labels.push(F(760, 1205, "Stairs down", { size: 50 }));
    labels.push(F(470, 1000, "Stage door", { anchor: "end" }));
    labels.push(T(2290, 900, "THE FOYER", { size: 52, ls: 2 }), F(2290, 965, "marble floor", { size: 50 }));
    labels.push(F(2300, 710, ["Grand staircase:", "ends in empty air"], { size: 50 }));
    labels.push(F(2290, 1385, ["Wall of mirrors,", "cracked"], { size: 50 }));
    labels.push(F(2630, 640, "Canopy", { size: 50 }));
    labels.push(F(2625, 1255, "Ticket booth", { size: 50 }));
    labels.push(F(2700, 850, ["Sign:", "Danger.", "Keep Out."], { size: 50 }));
    labels.push(F(240, 430, "Container yard", { size: 56 }));
    labels.push(F(1500, 220, "The warehouse next door", { size: 56 }));
    labels.push(F(1700, 1880, "New flats", { size: 56 }));
    labels.push(T(300, 1350, "UNDER THE STAGE", { size: 50, ls: 1 }));
    labels.push(F(215, 1500, ["Damp", "dressing", "rooms"], { size: 50 }));
    labels.push(F(515, 1610, ["stairs", "up"], { size: 50 }));
    labels.push(F(240, 1905, ["water at", "high tide"], { size: 50 }));
    labels.push(pwayMarker(2930, 950, 0, ["Way in", "and out:", "the front", "doors"], { lx: 2880, ly: 1135, size: 50 }));
    labels.push(pwayMarker(70, 1100, 180, ["Way in and out:", "the stage door"], { lx: 300, ly: 1180, size: 50 }));
    labels.push(pwayMarker(825, 1680, 90, ["Way in and out: the loading", "dock (roller door half up)"], { lx: 880, ly: 1800, anchor: "start", size: 50 }));
    labels.push(pwayMarker(910, 70, -90, ["Way in and out: the broken", "roof, from the warehouse"], { lx: 1010, ly: 100, anchor: "start", size: 50 }));
  }

  const body = PRINT ? out.join("") + grp(over) + top.join("") + grp(inset) + labels.join("") + printFrame() :
    out.join("") + grp(over) + grp(inset) +
    rect(0, 0, W, H, { fill: "#8a94b8", style: "mix-blend-mode:multiply" }) +
    grp(lights, { style: "mix-blend-mode:screen" }) +
    rect(0, 0, W, H, { filter: "url(#mt-grain)" }) +
    top.join("") + labels.join("");

  const data = {
    width: W, height: H, grid: G,
    points: [
      { key: "way-front-doors", label: "The front doors: boarded, under a sagging canopy; the boards come away (a way in and out)", x: 2500, y: 950 },
      { key: "way-stage-door", label: "The stage door, from the container yard (a way in and out)", x: 600, y: 1100 },
      { key: "way-loading-dock", label: "The loading dock at the side, with its roller door half up (a way in and out)", x: 825, y: 1500 },
      { key: "way-broken-roof", label: "The broken roof, from the warehouse next door: across onto the fly gallery (a way in and out)", x: 910, y: 380 },
      { key: "the-front", label: "The front: boarded doors under a sagging canopy, an old ticket booth and a sign: Danger. Keep Out.", x: 2620, y: 950 },
      { key: "the-foyer", label: "The foyer: a black marble floor, a grand staircase that ends in empty air, and a wall of mirrors cracked by heat", x: 2290, y: 950 },
      { key: "the-stalls", label: "The stalls: rows of burnt seats under a roof that is mostly sky. Ash drifts down like snow, though nothing is burning", x: 1700, y: 950 },
      { key: "the-stage", label: "The stage: the boards are sound. A wedding arch of wire and wax flowers still stands at the back. This is where she sleeps", x: 900, y: 950 },
      { key: "fly-gallery", label: "The fly gallery: iron walkways high above the stage, hung with old ropes", x: 930, y: 460 },
      { key: "under-the-stage", label: "Under the stage (inset): damp dressing rooms. At high tide, harbour water seeps in ankle-deep", x: 300, y: 1650 },
    ],
    tokens: {
      coven: [[2700, 800], [2800, 800], [2900, 800], [2800, 900], [2900, 900], [2800, 1000], [2900, 1000]], // outside the front doors
      threat: [800, 900], // she rises out of the ash on the stage
      innocent: null,
    },
  };
  if (PRINT) {
    const pd = {
      ...printTownDefs(),
      "mt-stage": printGround.planks("mt-stage", 71, 20),
      "mt-burnt": plankPattern("mt-burnt", 72, [PAL.edge, PAL.paper2, PAL.edge], PAL.accent, 200, 18),
      "mt-marble": marblePattern("mt-marble", 73, PAL.accent, PAL.soft, PAL.paper, PAL.dark, 50),
      "mt-tin": corrugatedPattern("mt-tin", PAL.accent, PAL.soft, 18),
      "mt-tin-rust": corrugatedPattern("mt-tin-rust", PAL.soft, PAL.dark, 18),
      "mt-pave": printGround.slab("mt-pave", 74, 50),
      "mt-lane": printGround.cobble("mt-lane", 75, 20),
      "mt-yard": printGround.gravel("mt-yard", 76),
      "mt-flatroof": gravelPattern("mt-flatroof", 77, PAL.edge, [PAL.accent, PAL.paper2], 120, 60),
      "mt-concrete": slabPattern("mt-concrete", 78, [PAL.paper2, PAL.paper], PAL.accent, 200, 100),
      "mt-seep": waterPattern("mt-seep", 79, PAL.accentB, [PAL.accent, PAL.edge], 160, 10, 2.5),
    };
    return { name: "mariner-theatre", svg: bookSvg("Map: the Mariner Theatre", body, defs, pd), data };
  }
  return { name: "mariner-theatre", svg: svgDoc(body, defs), data };
}

/* ===================================================================== */
/*  6. THE HARBOUR FIREWORKS (gridded, night): Episode 2's public place    */
/* ===================================================================== */
// Fireworks night on the quayside (book/src/chapters/33-ch15.html). Grid plan:
//   Fish market          cols 0-7, rows 0-6, flat roof (people climb up by the iron stair
//                        in the lane); its cold store closes the west end of the quay (cols 0-1)
//   Fish market lane     cols 8-9, rows 0-6, off the top edge
//   Ferry terminal       cols 17-23, rows 1-5: a glass hall, doors north (to the street) and south
//   The promenade        cols 26-28, rows 0-12: the wide walk along the water, off the top edge
//   The quayside         rows 7-12: food vans (row 7), music stage, the fire engine (row 10),
//                        the fireboat moored at the quay edge (rows 12-13)
//   The harbour steps    cols 6-8, row 12: steps down to the water; small boats tied up
//   The harbour          rows 13-19 and col 29; the fireworks barge, cols 12-17, rows 16-17
function harbourFireworks() {
  const R = rng(1105);
  const pc = (f, p) => PRINT ? p : f;
  const defs = [
    townDefs(),
    slabPattern("hf-quay", 81, ["#615d57", "#69655e", "#5b5752", "#6e6a63"], "#33302c", 200, 50),
    slabPattern("hf-prom", 82, ["#6e6a64", "#77736c", "#68645e"], "#3a3733", 200, 100),
    cobblePattern("hf-lane", 83, ["#4c4b48", "#555451", "#474643", "#5b5a56"], "#24231f", 200, 18),
    waterPattern("hf-water", 84, "#14303e", ["#2a5066", "#22445a", "#3a6278", "#1c3a4c"], 240, 34, 2.4),
    gravelPattern("hf-flat", 85, "#5a5e64", ["#686c72", "#4e5258", "#72767c"], 120, 150),
    slabPattern("hf-hall", 86, ["#8a8e92", "#92969a", "#868a8e"], "#5a5e62", 200, 100),
    plankPattern("hf-deck", 87, ["#6a5a48", "#726250", "#625240"], "#2a2018", 200, 16),
    `<pattern id="hf-mortars" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#3a3a3a"/><circle cx="12" cy="12" r="8" fill="#1a1a1a" stroke="#8a8a8a" stroke-width="2"/></pattern>`,
    glowGrad("hf-hallglow", "#cfe6ff", 0.42, 0.5),
    glowGrad("hf-van", "#ffcf7a", 0.6, 0.3),
    glowGrad("hf-burst", "#ffffff", 0.85, 0.2),
    glowGrad("hf-spark", "#ffd27a", 0.7, 0.25),
    `<linearGradient id="hf-quayedge" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0.55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`,
    grainFilter("hf-grain", 0.05),
  ].join("");
  const out = [], lights = [], top = [];
  const lamp = lampKit(out, lights, top, "tk-lamp");
  const QY = 1250; // the quay edge

  // ---------- water, quay, promenade, lane ----------
  out.push(rect(0, 0, W, H, { fill: "url(#hf-water)" }));
  out.push(rect(0, 0, 2880, QY, { fill: "url(#hf-quay)" }));
  out.push(rect(2560, 0, 320, QY, { fill: "url(#hf-prom)" })); // the promenade
  out.push(rect(820, 0, 180, 700, { fill: "url(#hf-lane)" })); // the fish market lane
  out.push(rect(0, 0, 2560, 120, { fill: "url(#hf-prom)" })); // the street behind the terminal (top)
  // the quay wall and its coping, a drop to the water
  out.push(rect(0, QY, 2880, 26, { fill: "url(#hf-quayedge)" }));
  out.push(line(0, QY - 6, 2880, QY - 6, { stroke: pc("#8e8a80", PAL.ink), "stroke-width": 14 }), line(2874, 0, 2874, QY, { stroke: pc("#8e8a80", PAL.ink), "stroke-width": 14 }));
  out.push(line(0, QY - 12, 2868, QY - 12, { stroke: pc("#b0aa9c", PAL.edge), "stroke-width": 3 }));
  // reflections of the quay lights in the water
  for (let x = 100; x < 2800; x += 180) lights.push(ellipse(x + R() * 60, QY + 90, 40, 70, { fill: "url(#hf-van)", opacity: 0.25 }));

  // ---------- buildings along the top ----------
  {
    const rr = rng(88);
    out.push(roof(1000, -40, 330, 660, { R: rr, ridge: "v", chimneys: 2 }), roof(1330, -40, 320, 660, { R: rr, pat: "url(#tk-slate-warm)", ridge: "v", chimneys: 1 }));
    out.push(roof(2350, -40, 210, 660, { R: rr, ridge: "v", chimneys: 1 }));
    // lit shopfronts onto the quay
    for (const [x, w] of [[1030, 260], [1360, 260], [2370, 170]]) { top.push(rect(x, 612, w, 8, { fill: "#ffe2a6", opacity: 0.9 })); lights.push(pool(x - 40, x + w + 40, 620, 150, "s", 0.8)); }
  }
  // ---------- the fish market (flat roof) and its cold store ----------
  {
    out.push(rect(10, 12, 800, 720, { fill: "#000", opacity: 0.4 }));
    out.push(rect(0, -20, 800, 740, { fill: "url(#hf-flat)", stroke: "#0e1012", "stroke-width": 5 }));
    out.push(rect(14, -6, 772, 712, { fill: "none", stroke: pc("#8a8e94", PAL.accent), "stroke-width": 10 })); // parapet
    for (let x = 120; x < 720; x += 160) out.push(rect(x, 260, 90, 200, { fill: pc("#8fb0c0", PAL.accentB), stroke: "#14181c", "stroke-width": 3, opacity: 0.85 }) + line(x + 45, 260, x + 45, 460, { stroke: "#14181c", "stroke-width": 2 })); // roof lights
    for (const [x, y] of [[120, 90], [600, 110], [380, 560]]) out.push(rect(x, y, 60, 60, { fill: pc("#7a7e84", PAL.edge), stroke: "#1a1c20", "stroke-width": 3 }) + circle(x + 30, y + 30, 18, { fill: pc("#4a4e54", PAL.accent), stroke: "#1a1c20", "stroke-width": 2 }));
    // cold store, closing the west end of the quay
    out.push(rect(8, 732, 200, 520, { fill: "#000", opacity: 0.4 }), rect(0, 720, 200, 530, { fill: "url(#hf-flat)", stroke: "#0e1012", "stroke-width": 5 }));
    out.push(rect(12, 732, 176, 506, { fill: "none", stroke: pc("#8a8e94", PAL.accent), "stroke-width": 8 }));
    // lit doors along the market front
    for (const x of [260, 520]) { top.push(rect(x, 712, 120, 8, { fill: "#ffe2a6", opacity: 0.9 })); lights.push(pool(x - 40, x + 160, 720, 150, "s", 0.8)); }
    // the iron stair up to the roof, against the market's east wall in the lane
    const sx = 812, sy0 = 300, sy1 = 600;
    out.push(rect(sx + 4, sy0 + 6, 52, sy1 - sy0, { fill: "#000", opacity: 0.35 }));
    out.push(rect(sx, sy0, 52, sy1 - sy0, { fill: pc("#3a4046", PAL.accent), stroke: "#0c0e10", "stroke-width": 3 }));
    for (let y = sy0 + 10; y < sy1; y += 16) out.push(line(sx + 4, y, sx + 48, y, { stroke: pc("#8a949c", PAL.paper), "stroke-width": 3 }));
    out.push(line(sx + 52, sy0, sx + 52, sy1, { stroke: pc("#9aa4ac", PAL.ink), "stroke-width": 4 }));
    // bins in the lane
    for (const y of [120, 160]) out.push(rect(940, y, 40, 34, { rx: 3, fill: "#2f4a3a", stroke: "#0c140f", "stroke-width": 2.5 }));
  }
  // ---------- the ferry terminal: a glass hall ----------
  {
    const x0 = 1650, x1 = 2350, y0 = 120, y1 = 620;
    out.push(rect(x0 + 8, y0 + 10, x1 - x0, y1 - y0, { fill: "#000", opacity: 0.35 }));
    out.push(rect(x0, y0, x1 - x0, y1 - y0, { fill: "url(#hf-hall)" }));
    // benches in rows, a ticket desk, turnstiles by the south doors, timetable boards
    for (const y of [260, 360, 460]) for (const x of [1740, 2140]) {
      out.push(rect(x, y, 140, 40, { rx: 4, fill: pc("#3a4a5a", PAL.accent), stroke: "#0e1418", "stroke-width": 2.5 }));
      for (let i = 1; i < 4; i++) out.push(line(x + i * 35, y + 2, x + i * 35, y + 38, { stroke: "#0e1418", "stroke-width": 1.5 }));
    }
    out.push(rect(1940, 180, 140, 50, { fill: pc("#6a5a48", PAL.soft), stroke: "#1a140e", "stroke-width": 3 }), rect(1950, 186, 120, 10, { fill: pc("#cfe6ff", PAL.paper2) }));
    for (const x of [1960, 2010, 2060]) out.push(rect(x, 540, 10, 40, { fill: pc("#9aa4ac", PAL.dark) }) + line(x + 10, 548, x + 32, 548, { stroke: pc("#9aa4ac", PAL.dark), "stroke-width": 4 }));
    for (const x of [1700, 2250]) out.push(rect(x, 140, 60, 16, { fill: pc("#1e2830", PAL.dark), stroke: "#0a0e12", "stroke-width": 2 }) + rect(x + 6, 143, 48, 10, { fill: pc("#ffcf6a", PAL.paper) }));
    // glass walls with mullions; doors north (to the street) and south (onto the quay)
    const glass = (ax, ay, bx, by, gaps = []) => {
      const horiz = ay === by;
      const len = horiz ? bx - ax : by - ay;
      let s = wall(ax, ay, bx, by, 12, gaps, { fill: pc("#9cc8dc", PAL.accentB), edge: pc("#2a3a44", PAL.ink) });
      for (let t = 0; t <= len; t += 50) {
        if (gaps.some(([a, b]) => t > a && t < b)) continue;
        s += horiz ? rect(ax + t - 3, ay - 8, 6, 16, { fill: pc("#2a3036", PAL.ink) }) : rect(ax - 8, ay + t - 3, 16, 6, { fill: pc("#2a3036", PAL.ink) });
      }
      return s;
    };
    out.push(glass(x0, y0, x1, y0, [[300, 400]]), glass(x0, y1, x1, y1, [[300, 500]]), glass(x0, y0, x0, y1), glass(x1, y0, x1, y1));
    lights.push(rect(x0, y0, x1 - x0, y1 - y0, { fill: "#cfe6ff", opacity: 0.22 }));
    lights.push(ellipse(2000, 370, 520, 380, { fill: "url(#hf-hallglow)" }));
    lights.push(pool(1900, 2200, 620, 220, "s", 0.7), pool(1940, 2060, 120, 110, "n", 0.6));
  }
  // ---------- the promenade: planters with trees, benches, a railing over the water ----------
  {
    for (const y of [120, 420, 720, 1020]) {
      out.push(rect(2585, y, 70, 70, { fill: pc("#5a5650", PAL.accent), stroke: "#1a1814", "stroke-width": 3 }));
      out.push(treeCrown(2620, y + 35, 62, R, PRINT ? { dark: PAL.accent, mid: PAL.edge, light: PAL.paper2, edge: PAL.soft, shadow: 0.15 } : { dark: "#26381f", mid: "#34502a", light: "#4e7038", shadow: 0.3 }));
    }
    for (const y of [270, 570, 870]) out.push(benchTop(2830, y, 90, 90));
    out.push(railing([2868, 0], [2868, QY - 10], { gap: 60 }));
    for (const y of [200, 650, 1100]) lamp(2730, y, 190);
  }
  // ---------- the quayside: food vans, music stage, festoon lights, barriers ----------
  {
    const van = (x, y, col, seed) => {
      const r2 = rng(seed);
      let s = rect(x + 8, y + 10, 220, 110, { rx: 10, fill: "#000", opacity: 0.4 });
      s += rect(x, y, 220, 110, { rx: 14, fill: col, stroke: "#0e1012", "stroke-width": 4 });
      s += rect(x + 12, y + 12, 196, 60, { rx: 8, fill: "#fff", opacity: 0.12 });
      s += rect(x + 176, y + 16, 34, 78, { rx: 6, fill: pc("#2a3036", PAL.dark), opacity: 0.8 }); // cab windscreen
      s += rect(x + 30, y + 104, 130, 24, { fill: pc("#e8d8b0", PAL.paper), stroke: "#2a2014", "stroke-width": 2 }); // serving hatch shelf
      for (let i = 0; i < 4; i++) s += circle(x + 46 + i * 32, y + 116, 6, { fill: ["#d9a440", "#b8562e", "#e8d7a0", "#7a9a3a"][Math.floor(r2() * 4)] });
      return s;
    };
    const vans = [[230, 770, "#2f7f95"], [1040, 650, "#b23a3f"], [1300, 650, "#9a7a2a"], [2380, 650, "#2f8a5a"], [1600, 690, "#6a4a9a"]];
    vans.forEach(([x, y, c], i) => { out.push(van(x, y, c, 900 + i)); lights.push(circle(x + 95, y + 130, 160, { fill: "url(#hf-van)" })); });
    // music stage: a low platform with speaker stacks, in front of the market
    out.push(rect(526, 776, 260, 150, { fill: "#000", opacity: 0.35 }), rect(520, 770, 260, 150, { fill: "url(#hf-deck)", stroke: "#1a120c", "stroke-width": 4 }));
    for (const x of [530, 730]) out.push(rect(x, 780, 40, 50, { rx: 3, fill: "#1e1f24", stroke: "#0a0a0c", "stroke-width": 2 }) + circle(x + 20, 805, 12, { fill: "#3a3c44" }));
    out.push(circle(650, 850, 7, { fill: "#2a2a2e" }) + circle(650, 830, 6, { fill: "#55585e" }) + line(650, 850, 650, 830, { stroke: "#2a2a2e", "stroke-width": 3 }));
    lights.push(circle(650, 840, 210, { fill: "url(#tk-lamp)" }));
    // crowd barriers along the quay edge (keeping people back from the drop)
    for (let x = 220; x < 2860; x += 120) {
      if (x > 560 && x < 1000) continue; // the harbour steps
      if (x > 1880 && x < 2480) continue; // the fireboat berth
      out.push(rect(x, QY - 60, 100, 8, { fill: pc("#9aa4ac", PAL.accent), stroke: "#14181c", "stroke-width": 2 }));
      for (const dx of [8, 92]) out.push(rect(x + dx - 6, QY - 66, 12, 20, { fill: pc("#5a646c", PAL.dark) }));
    }
    // festoon lights across the quay, building to lamp post
    const add = (a, b, o) => { const st = lightString(a, b, R, o); lights.push(st.glow); top.push(st.wire); };
    for (const x of [400, 800, 1200, 1600, 2000, 2400]) add([x, 700], [x + 120, 1180], { bend: 0.02, gap: 30 });
    add([220, 1000], [2860, 1000], { bend: 0.01, gap: 30 });
    for (const x of [400, 1200, 2000]) lamp(x, 1180, 200, 0.9);
  }
  // ---------- the harbour steps and the small boats ----------
  {
    // steps cut into the quay edge, going down westward to a landing at the water
    const x0 = 600, x1 = 960, y0 = 1160, y1 = QY;
    out.push(rect(x0, y0, x1 - x0, y1 - y0 + 20, { fill: pc("#2a2a28", PAL.soft) }));
    for (let i = 0; i < 12; i++) { const x = x1 - (i + 1) * 26; out.push(rect(x, y0 + 4, 26, y1 - y0 + 12, { fill: pc(`rgb(${126 - i * 6},${120 - i * 6},${110 - i * 6})`, i < 6 ? PAL.edge : PAL.accent) }), line(x, y0 + 4, x, y1 + 16, { stroke: "#1e1c1a", "stroke-width": 2.5 })); }
    out.push(rect(x0, y0 + 4, 48, y1 - y0 + 12, { fill: pc("#4a5a5e", PAL.accent) }), rect(x0, y0 + 4, 48, y1 - y0 + 12, { fill: "url(#hf-water)", opacity: 0.5 })); // the wet landing
    out.push(line(x0, y0, x1, y0, { stroke: pc("#8e8a80", PAL.ink), "stroke-width": 10 }));
    for (const x of [640, 760, 880]) out.push(circle(x, y1 + 2, 7, { fill: "none", stroke: pc("#a09070", PAL.ink), "stroke-width": 3 })); // mooring rings
    // rowing boats tied up below the steps
    const boats = [[560, 1360, 220, 70, 100], [720, 1400, 200, 66, 76], [880, 1370, 180, 60, 96]];
    for (const [x, y, l, w, a] of boats) out.push(boat(x, y, l, w, a, { hull: ["#e0dccf", "#c8d4dc", "#d8c8a8"][Math.floor(R() * 3)] }));
    out.push(rope([640, QY + 2], [560, 1260], 0.1), rope([760, QY + 2], [725, 1300], 0.1), rope([880, QY + 2], [882, 1285], 0.1));
  }
  // ---------- the fire engine and the fireboat ----------
  {
    // the fire engine, parked on the quay
    const ex = 1960, ey = 1010, ew = 600, eh = 170;
    out.push(rect(ex + 10, ey + 12, ew, eh, { rx: 12, fill: "#000", opacity: 0.45 }));
    out.push(rect(ex, ey, ew, eh, { rx: 14, fill: pc("#b8282a", PAL.alarmB), stroke: "#1a0808", "stroke-width": 4 }));
    out.push(rect(ex + 460, ey + 10, 130, eh - 20, { rx: 10, fill: pc("#a02022", PAL.alarm), stroke: "#1a0808", "stroke-width": 3 })); // the cab roof
    out.push(rect(ex + 560, ey + 18, 24, eh - 36, { rx: 4, fill: pc("#2a3036", PAL.dark) })); // windscreen
    for (const y of [ey + 22, ey + eh - 30]) out.push(rect(ex + 520, y, 34, 8, { rx: 3, fill: pc("#5aa0ff", PAL.light), stroke: "#0a0e1a", "stroke-width": 1.5 })); // blue lights
    out.push(rect(ex + 20, ey + 50, 420, 70, { fill: pc("#c8ccd0", PAL.edge), stroke: "#2a2e32", "stroke-width": 3 })); // the ladder
    for (let x = ex + 30; x < ex + 440; x += 22) out.push(line(x, ey + 52, x, ey + 118, { stroke: "#2a2e32", "stroke-width": 2 }));
    out.push(line(ex + 20, ey + 85, ex + 440, ey + 85, { stroke: "#2a2e32", "stroke-width": 2 }));
    out.push(rect(ex + 10, ey + 8, ew - 160, 12, { fill: pc("#f0e8d0", PAL.paper) }), rect(ex + 10, ey + eh - 20, ew - 160, 12, { fill: pc("#f0e8d0", PAL.paper) })); // white stripes
    lights.push(circle(ex + 540, ey + 85, 120, { fill: "#5aa0ff", opacity: 0.12 }));
    // the fireboat, moored alongside the quay
    const bx = 2180, by = 1335;
    out.push(boat(bx, by, 480, 130, 180, { hull: pc("#b8282a", PAL.alarmB), inside: pc("#d8d4c8", PAL.paper2), thwarts: 0 }));
    out.push(rect(bx - 40, by - 40, 130, 80, { rx: 8, fill: pc("#e8e4d8", PAL.light), stroke: "#14100c", "stroke-width": 3 }), rect(bx - 40, by - 40, 30, 80, { fill: pc("#2a3036", PAL.dark) })); // wheelhouse
    for (const [x, y] of [[bx - 160, by], [bx + 140, by - 20], [bx + 140, by + 20]]) out.push(circle(x, y, 16, { fill: pc("#c8b048", PAL.edge), stroke: "#2a2010", "stroke-width": 3 }) + line(x, y, x + (x < bx ? -40 : 34), y, { stroke: pc("#c8b048", PAL.edge), "stroke-width": 8, "stroke-linecap": "round" })); // water monitors
    out.push(rope([1990, QY - 10], [1960, by - 30], 0.06), rope([2400, QY - 10], [2410, by - 30], 0.06));
    out.push(bollard(1990, QY - 18), bollard(2400, QY - 18));
    for (const x of [300, 1500, 2700]) out.push(bollard(x, QY - 18));
    // a hose from the engine to the quay edge
    out.push(path(`M${ex + 300} ${ey + eh} C ${ex + 300} ${ey + eh + 40}, ${ex + 220} ${QY - 50}, ${ex + 150} ${QY - 20}`, { fill: "none", stroke: pc("#d8c890", PAL.edge), "stroke-width": 8, "stroke-linecap": "round" }));
  }
  // ---------- where the first rocket falls: a burst of white sparks on the quay ----------
  const BURST = [2250, 840];
  {
    const [x, y] = BURST;
    if (PRINT) {
      const pts = [];
      for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 34 : 86; pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); }
      out.push(path(polyD(pts), { fill: PAL.paper, stroke: PAL.alarm, "stroke-width": 6, "stroke-linejoin": "round" }));
    } else {
      out.push(path(smoothD(blobPts(x, y, 70, R, 14, 0.3), true), { fill: "#000", opacity: 0.4 })); // scorch
      lights.push(circle(x, y, 230, { fill: "url(#hf-spark)" }), circle(x, y, 90, { fill: "url(#hf-burst)" }));
      for (let i = 0; i < 26; i++) { const a = R() * Math.PI * 2, r = 30 + R() * 110; top.push(circle(x + Math.cos(a) * r, y + Math.sin(a) * r, 2 + R() * 3, { fill: ["#ffffff", "#fff2c0", "#ffd27a"][i % 3], opacity: 0.9 })); }
    }
  }
  // ---------- the fireworks barge, moored out in the harbour ----------
  {
    const x0 = 1250, y0 = 1600, w = 560, h = 200;
    // safety buoys in a ring round it, and its mooring lines
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; out.push(circle(x0 + w / 2 + Math.cos(a) * 420, y0 + h / 2 + Math.sin(a) * 210, 10, { fill: pc("#e8a030", PAL.paper), stroke: "#2a1a08", "stroke-width": 3 })); }
    for (const [ax, ay, bx, by] of [[x0, y0 + 20, x0 - 160, y0 - 60], [x0 + w, y0 + h - 20, x0 + w + 160, y0 + h + 60]]) { out.push(line(ax, ay, bx, by, { stroke: pc("#8a8070", PAL.ink), "stroke-width": 4 }), circle(bx, by, 16, { fill: pc("#c84030", PAL.alarmB), stroke: "#2a0a08", "stroke-width": 3 })); }
    out.push(rect(x0 + 10, y0 + 14, w, h, { fill: "#000", opacity: 0.4 }));
    out.push(rect(x0, y0, w, h, { rx: 10, fill: pc("#4a4a48", PAL.accent), stroke: "#0c0c0a", "stroke-width": 5 }));
    out.push(rect(x0 + 14, y0 + 14, w - 28, h - 28, { rx: 6, fill: "url(#hf-deck)" }));
    for (const [mx, my] of [[x0 + 40, y0 + 40], [x0 + 200, y0 + 40], [x0 + 40, y0 + 110], [x0 + 200, y0 + 110]]) out.push(rect(mx, my, 144, 48, { fill: "url(#hf-mortars)", stroke: "#0c0c0a", "stroke-width": 2.5 }));
    out.push(rect(x0 + 380, y0 + 40, 140, 120, { fill: pc("#d8d4c8", PAL.paper2), stroke: "#14100c", "stroke-width": 3 }), rect(x0 + 380, y0 + 40, 140, 30, { fill: pc("#2a3036", PAL.dark) })); // firing cabin
    for (const [cx, cy] of [[x0 + 360, y0 + 170], [x0 + 520, y0 + 172]]) out.push(rect(cx - 20, cy - 12, 40, 24, { fill: "#6a4a2a", stroke: "#1a100a", "stroke-width": 2 }));
    lights.push(circle(x0 + w / 2, y0 + h / 2, 300, { fill: "url(#tk-lamp)", opacity: 0.5 }));
  }

  // ---------- labels and ways in and out ----------
  const labels = [];
  if (!PRINT) {
    const fl = (x, y, t, o = {}) => label(x, y, t, { size: 26, weight: 800, ...o });
    const T = (x, y, t, o = {}) => fl(x, y, t, { size: 32, font: "display", weight: 700, ls: 3, ...o });
    labels.push(T(1200, 920, "THE QUAYSIDE", { size: 38 }), fl(1200, 965, "thousands of people, food vans and music", { size: 22 }));
    labels.push(fl(2260, 970, "Hannah's fire engine", { size: 22 }));
    labels.push(fl(2180, 1445, "The fireboat, moored at the quay", { size: 22 }));
    labels.push(fl(2250, 735, "where the first rocket falls", { size: 20, italic: true }));
    labels.push(T(1530, 1860, "THE FIREWORKS BARGE", { size: 30 }), fl(1530, 1900, "moored out in the harbour: the show is fired from here", { size: 20 }));
    labels.push(T(2000, 300, "FERRY TERMINAL", { size: 28 }), fl(2000, 335, "a glass hall, open late for the festival", { size: 18 }));
    labels.push(T(400, 200, "FISH MARKET ROOF", { size: 28 }), fl(400, 235, "a flat roof where people climb for a better view", { size: 18 }));
    labels.push(fl(770, 460, ["iron stair", "up to the roof"], { size: 17, anchor: "end" }));
    labels.push(fl(910, 380, "Fish market lane", { size: 22, rot: -90 }));
    labels.push(T(2720, 860, "THE PROMENADE", { size: 26, rot: -90, ls: 2 }), fl(2780, 860, "the wide walk from Old Town to the long pier", { size: 17, rot: -90 }));
    labels.push(fl(780, 1120, "The harbour steps", { size: 22 }), fl(720, 1475, "small boats tie up here", { size: 18 }));
    labels.push(fl(650, 750, "Music", { size: 20 }));
    labels.push(fl(1250, 790, "Food vans", { size: 20 }));
    labels.push(T(700, 1700, "THE HARBOUR", { size: 30, ls: 6, opacity: 0.85 }));
    const way = (x, y, ang, t, o) => wayMarker(x, y, ang, t, { size: 22, ...o });
    labels.push(way(910, 50, -90, ["Way in and out:", "the fish market lane"], { lx: 1020, ly: 90, anchor: "start" }));
    labels.push(way(2000, 50, -90, ["Way in and out: through", "the ferry terminal"], { lx: 2090, ly: 75, anchor: "start" }));
    labels.push(way(2720, 50, -90, ["Way in and out: the", "promenade, from Old Town"], { lx: 2640, ly: 210, anchor: "middle" }));
    labels.push(way(650, 1950, 90, ["Way in and out: by boat,", "to the harbour steps"], { lx: 780, ly: 1600, anchor: "start" }));
  } else {
    const T = (x, y, t, o = {}) => plabel(x, y, t, { size: 64, font: "display", ls: 3, ...o });
    const F = (x, y, t, o = {}) => plabel(x, y, t, { size: 52, ...o });
    labels.push(T(1200, 920, "THE QUAYSIDE", { size: 72 }), F(1200, 995, "crowds, food vans and music"));
    labels.push(F(2260, 960, "Hannah's fire engine", { size: 50 }));
    labels.push(F(2180, 1455, "The fireboat", { size: 50 }));
    labels.push(F(2250, 720, "where the first rocket falls", { size: 50, italic: true }));
    labels.push(T(1530, 1860, "THE FIREWORKS BARGE", { size: 56, ls: 2 }));
    labels.push(T(2000, 300, "FERRY", { size: 56 }), T(2000, 370, "TERMINAL", { size: 56 }), F(2000, 440, "glass hall", { size: 50 }));
    labels.push(T(400, 200, "FISH MARKET", { size: 58, ls: 2 }), T(400, 270, "ROOF", { size: 58, ls: 2 }), F(400, 345, "people climb up here", { size: 50 }));
    labels.push(F(780, 470, ["iron", "stair"], { size: 50, anchor: "end" }));
    labels.push(F(910, 420, "Fish market lane", { size: 50, rot: -90 }));
    labels.push(T(2735, 760, "THE PROMENADE", { size: 56, rot: -90, ls: 2 }));
    labels.push(F(780, 1110, "The harbour steps", { size: 52 }));
    labels.push(F(660, 735, "Music", { size: 50 }));
    labels.push(F(1250, 800, "Food vans", { size: 50 }));
    labels.push(T(560, 1700, "THE HARBOUR", { size: 60, ls: 6 }));
    labels.push(pwayMarker(910, 70, -90, ["Way in and out:", "the fish market lane"], { lx: 1020, ly: 100, anchor: "start", size: 50 }));
    labels.push(pwayMarker(2000, 70, -90, ["Way in and out: through", "the ferry terminal"], { lx: 2090, ly: 100, anchor: "start", size: 50 }));
    labels.push(pwayMarker(2720, 70, -90, ["Way in and out:", "the promenade,", "from Old Town"], { lx: 2700, ly: 300, size: 50 }));
    labels.push(pwayMarker(650, 1940, 90, ["Way in and out: by boat,", "to the harbour steps"], { lx: 790, ly: 1570, anchor: "start", size: 50 }));
  }

  const body = PRINT ? out.join("") + top.join("") + labels.join("") + printFrame() :
    out.join("") +
    rect(0, 0, W, H, { fill: "#8a96bc", style: "mix-blend-mode:multiply" }) +
    grp(lights, { style: "mix-blend-mode:screen" }) +
    rect(0, 0, W, H, { filter: "url(#hf-grain)" }) +
    top.join("") + labels.join("");

  const data = {
    width: W, height: H, grid: G,
    points: [
      { key: "way-promenade", label: "The promenade from Old Town (a way in and out)", x: 2720, y: 150 },
      { key: "way-ferry-terminal", label: "Through the ferry terminal (a way in and out)", x: 2000, y: 120 },
      { key: "way-fish-market-lane", label: "The fish market lane (a way in and out)", x: 910, y: 150 },
      { key: "way-harbour-steps", label: "By boat to the harbour steps (a way in and out)", x: 700, y: 1300 },
      { key: "the-quayside", label: "The quayside: thousands of people, food vans and music. Hannah's fire engine is parked here, and the fireboat is moored at the quay", x: 1200, y: 950 },
      { key: "fire-engine", label: "Hannah's fire engine", x: 2260, y: 1095 },
      { key: "fireboat", label: "The fireboat, moored at the quay (its pumps draw straight from the harbour)", x: 2180, y: 1335 },
      { key: "rocket-falls", label: "Where the first rocket bursts white and falls burning onto the quay: the Ash Widow walks out of the sparks with Hannah in her grip", x: BURST[0], y: BURST[1] },
      { key: "fireworks-barge", label: "The fireworks barge: moored out in the harbour. The show is fired from here", x: 1530, y: 1700 },
      { key: "ferry-terminal", label: "The ferry terminal: a glass hall, open late for the festival", x: 2000, y: 370 },
      { key: "fish-market-roof", label: "The fish market roof: a flat roof where people climb for a better view (the iron stair in the lane)", x: 400, y: 360 },
      { key: "the-promenade", label: "The promenade: the wide walk from Old Town to the long pier", x: 2720, y: 700 },
      { key: "harbour-steps", label: "The harbour steps: stone steps down to the water, where small boats tie up", x: 780, y: 1200 },
    ],
    tokens: {
      coven: [[2600, 300], [2700, 300], [2800, 300], [2600, 400], [2700, 400], [2800, 400], [2700, 500]], // on the promenade, coming from Old Town
      threat: [2200, 800], // out of the sparks where the rocket fell
      innocent: [2300, 800], // Hannah, in her grip
    },
  };
  if (PRINT) {
    const pd = {
      ...printTownDefs(),
      "hf-quay": printGround.slab("hf-quay", 81, 50),
      "hf-prom": slabPattern("hf-prom", 82, [PAL.paper, PAL.light, PAL.paper2], PAL.edge, 200, 100),
      "hf-lane": printGround.cobble("hf-lane", 83, 18),
      "hf-water": waterPattern("hf-water", 84, PAL.accentB, [PAL.accent, PAL.edge, PAL.accent], 240, 16, 3),
      "hf-flat": gravelPattern("hf-flat", 85, PAL.edge, [PAL.accent, PAL.paper2], 120, 60),
      "hf-hall": slabPattern("hf-hall", 86, [PAL.light, PAL.paper], PAL.edge, 200, 100),
      "hf-deck": printGround.planks("hf-deck", 87, 16),
      "hf-mortars": `<pattern id="hf-mortars" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="${PAL.edge}"/><circle cx="12" cy="12" r="8" fill="${PAL.soft}" stroke="${PAL.ink}" stroke-width="2"/></pattern>`,
    };
    return { name: "harbour-fireworks", svg: bookSvg("Map: the harbour fireworks", body, defs, pd), data };
  }
  return { name: "harbour-fireworks", svg: svgDoc(body, defs), data };
}

/* ===================================================================== */
/** Render a book map the way the book shows it (book fonts loaded by family name,
 *  the SVG sized by CSS), at the print width and PRINT_DPI, plus a 2x copy for close checks. */
async function renderBookCheck(browser, name, svg) {
  const px = Math.round(PRINT_W_IN * PRINT_DPI);
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${FONTS}\nhtml,body{margin:0;padding:0;background:${PAL.paper}}` +
    `.fig{width:${px}px}.fig svg{display:block;width:100%;height:auto}</style></head><body><div class="fig">${svg}</div></body></html>`;
  const htmlPath = join(OUT, `${name}-print.html`);
  writeFileSync(htmlPath, html);
  for (const scale of [1, 2]) {
    const page = await browser.newPage({ viewport: { width: px, height: Math.round(px * H / W) }, deviceScaleFactor: scale });
    try {
      await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
      const faces = ['700 30px "Alegreya Sans"', '800 30px "Alegreya Sans"', 'italic 700 30px "Alegreya Sans"', '700 30px "Fraunces"'];
      const missing = await page.evaluate(async fs => {
        await Promise.all(fs.map(f => document.fonts.load(f)));
        await document.fonts.ready;
        return fs.filter(f => !document.fonts.check(f));
      }, faces);
      if (missing.length) throw new Error(`${name} (print): fonts not loaded: ${missing.join(", ")}`);
      await page.screenshot({ path: join(OUT, `${name}-print${scale === 2 ? "@2x" : ""}.png`), clip: { x: 0, y: 0, width: px, height: Math.round(px * H / W) } });
    } finally {
      await page.close();
    }
  }
}

const MAPS = {
  larkhaven, "lantern-house": lanternHouse,
  "night-market": nightMarket, "radio-tower": radioTower,
  "mariner-theatre": marinerTheatre, "harbour-fireworks": harbourFireworks,
  // "drowned-village": drownedVillage, "long-pier": longPier,
};
/** The showdown maps: each also gets a print version for the book. */
const BOOK_MAPS = new Set(["night-market", "radio-tower", "mariner-theatre", "harbour-fireworks", "drowned-village", "long-pier"]);

const want = process.argv.slice(2);
for (const w of want) if (!MAPS[w]) { console.error(`unknown map: ${w} (have: ${Object.keys(MAPS).join(", ")})`); process.exit(1); }
mkdirSync(OUT, { recursive: true });
mkdirSync(DEST, { recursive: true });
const browser = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
try {
  for (const name of (want.length ? want : Object.keys(MAPS))) {
    PRINT = false;
    const map = MAPS[name]();
    checkTokens(name, map.data.tokens);
    await renderMap(browser, map);
    if (!BOOK_MAPS.has(name)) continue;
    PRINT = true;
    const book = MAPS[name]();
    PRINT = false;
    writeFileSync(join(OUT, `${name}-print.svg`), book.svg);
    const { kb, minPt } = checkBookSvg(name, book.svg);
    writeFileSync(join(BOOK_ART, `map-${name}.svg`), book.svg);
    await renderBookCheck(browser, name, book.svg);
    console.log(`${name}: book/art/map-${name}.svg ${kb.toFixed(0)} KB, smallest label ${minPt.toFixed(1)} pt at ${PRINT_W_IN} in`);
  }
} finally {
  await browser.close();
}
