#!/usr/bin/env node
/**
 * Test token and portrait art for the Witch & Ward Foundry system.
 *
 * Each portrait is a hand-built SVG bust (shapes and gradients only) inside a
 * ring whose colour shows the role. It is rendered with the local Chromium
 * (Playwright, launched the same way as book/build.mjs) and converted to WebP
 * with Python Pillow.
 *
 *   node tools/vtt-art/tokens.mjs                  every token, then the contact sheet
 *   node tools/vtt-art/tokens.mjs june-takeda rook just these (sheet still covers all)
 *   node tools/vtt-art/tokens.mjs --no-sheet       skip the contact sheet
 *
 * Shipped:  assets/tokens/<slug>.webp  (400x400, transparent outside the circle)
 * Scratch:  tools/vtt-art/out/tokens/  (SVG sources, 2x PNGs, contact sheet; git-ignored)
 *
 * Rings: coven violet (thin light inner line), guardian brass (double line),
 * threats danger red (notches), other people calm green (plain). The pattern
 * repeats the colour so the role survives colour blindness (ART-CHECKLIST 18).
 *
 * Test art only: the art direction is undecided. Looks follow docs/CONTENT.md and
 * book chapters 10, 13, 14, 15 and 16. Nothing here may echo the TV show (AGENTS.md).
 */
import { chromium } from "playwright-core";
import { existsSync, mkdirSync, writeFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const OUT = join(HERE, "out", "tokens");
const DEST = join(ROOT, "assets", "tokens");
const CHROME = process.env.CHROME_PATH ?? (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium" : undefined);

// ---------------------------------------------------------------- basics
const CX = 200;            // the face's centre line
const INK = "#22191f";     // outline colour
const LW = 3;              // main outline width
const R_IN = 184, R_OUT = 198;
const RING = {
  coven:    { c: "#7b5bc4", hi: "#c3aef0", lo: "#48308a" },
  guardian: { c: "#c29a45", hi: "#f0d999", lo: "#7f5f24" },
  threat:   { c: "#b5473f", hi: "#e8857a", lo: "#6e2222" },   // book palette alarmB
  person:   { c: "#3f7f58", hi: "#8cc9a0", lo: "#24503a" },   // book palette good, lifted
};

const r = v => Math.round(v * 10) / 10;
const hex2rgb = h => { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
const rgb2hex = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A.map((v, i) => v + (B[i] - v) * t)); };
const dk = (c, t) => mix(c, "#000000", t);
const lt = (c, t) => mix(c, "#ffffff", t);

function attrs(o) {
  return Object.entries(o).filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => ` ${k}="${typeof v === "number" ? r(v) : v}"`).join("");
}
const tag = (t, o, inner) => inner === undefined ? `<${t}${attrs(o)}/>` : `<${t}${attrs(o)}>${inner}</${t}>`;
const strokeAttrs = o => o.s ? { stroke: o.s, "stroke-width": o.w ?? LW, "stroke-linejoin": "round", "stroke-linecap": o.cap ?? "round", "stroke-dasharray": o.dash } : {};
/** Filled path. o: s (stroke), w (width), op, clip, tf (transform), fr (fill-rule), dash, cap */
const P = (d, f, o = {}) => tag("path", { d, fill: f ?? "none", ...strokeAttrs(o), opacity: o.op, "clip-path": o.clip, transform: o.tf, "fill-rule": o.fr, mask: o.mask });
/** Stroke-only path. */
const S = (d, s, w = 2, op, o = {}) => P(d, "none", { s, w, op, ...o });
const E = (cx, cy, rx, ry, f, o = {}) => tag("ellipse", { cx, cy, rx, ry, fill: f, ...strokeAttrs(o), opacity: o.op, transform: o.tf, "clip-path": o.clip });
const C = (cx, cy, rr, f, o = {}) => tag("circle", { cx, cy, r: rr, fill: f, ...strokeAttrs(o), opacity: o.op, "clip-path": o.clip, transform: o.tf });
const G = (inner, o = {}) => tag("g", { transform: o.tf, opacity: o.op, "clip-path": o.clip, mask: o.mask }, inner);
const poly = (pts, close = true) => "M" + pts.map(p => `${r(p[0])},${r(p[1])}`).join("L") + (close ? "Z" : "");

/** Smooth path through points (Catmull-Rom). A point [x, y, 1] is a sharp corner. */
function smooth(pts, closed = true, k = 1) {
  const n = pts.length, at = i => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${r(pts[0][0])},${r(pts[0][1])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = p1[2] ? p1 : [p1[0] + (p2[0] - p0[0]) * k / 6, p1[1] + (p2[1] - p0[1]) * k / 6];
    const c2 = p2[2] ? p2 : [p2[0] - (p3[0] - p1[0]) * k / 6, p2[1] - (p3[1] - p1[1]) * k / 6];
    d += `C${r(c1[0])},${r(c1[1])} ${r(c2[0])},${r(c2[1])} ${r(p2[0])},${r(p2[1])}`;
  }
  return closed ? d + "Z" : d;
}
/** Right half (top centre ... bottom centre) mirrored into a whole loop. */
const sym = right => [...right, ...right.slice(1, -1).reverse().map(([x, y, c]) => [2 * CX - x, y, c])];
const ssym = (right, k) => smooth(sym(right), true, k);

/** Seeded PRNG (mulberry32), so every run draws the same picture. */
function rng(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Per-picture defs (gradients, clips, masks) with unique ids. */
class Art {
  constructor(slug) { this.slug = slug; this.defs = []; this.n = 0; }
  uid(p) { return `${this.slug}-${p}${this.n++}`; }
  stops(list) { return list.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ""}/>`).join(""); }
  lin(list, x1 = 0, y1 = 0, x2 = 0, y2 = 1, user = false) {
    const id = this.uid("lg");
    this.defs.push(tag("linearGradient", { id, x1, y1, x2, y2, gradientUnits: user ? "userSpaceOnUse" : undefined }, this.stops(list)));
    return `url(#${id})`;
  }
  rad(list, cx = 0.5, cy = 0.5, rr = 0.5, user = false) {
    const id = this.uid("rg");
    this.defs.push(tag("radialGradient", { id, cx, cy, r: rr, gradientUnits: user ? "userSpaceOnUse" : undefined }, this.stops(list)));
    return `url(#${id})`;
  }
  clip(d) { const id = this.uid("cp"); this.defs.push(`<clipPath id="${id}"><path d="${d}"/></clipPath>`); return `url(#${id})`; }
  mask(inner) { const id = this.uid("mk"); this.defs.push(`<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="400">${inner}</mask>`); return `url(#${id})`; }
  pattern(inner, w, h) { const id = this.uid("pt"); this.defs.push(`<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">${inner}</pattern>`); return `url(#${id})`; }
}

// ---------------------------------------------------------------- body parts
const HEAD = { top: 92, chin: 250, hw: 63, temple: 0.9, jaw: 0.82, chinW: 0.38, cheekY: 160 };
function headD(h) {
  const { top, chin, hw, temple, jaw, chinW, cheekY } = { ...HEAD, ...h };
  const H = chin - top;
  return ssym([[CX, top], [CX + hw * 0.6, top + 5], [CX + hw * temple, top + H * 0.19], [CX + hw, cheekY],
    [CX + hw * 0.97, top + H * 0.62], [CX + hw * jaw, top + H * 0.83], [CX + hw * chinW, chin - 4], [CX, chin]]);
}

/** A skin (or any) shape with light from the upper left and an outline. */
function shaded(A, d, base, o = {}) {
  const g = A.lin([[0, lt(base, o.hi ?? 0.16), 0.55], [0.45, base, 0], [1, dk(base, o.lo ?? 0.32), 0.6]], 0, 0, 1, 0.35);
  return P(d, base) + P(d, g) + (o.line === false ? "" : P(d, "none", { s: INK, w: o.w ?? LW }));
}
/** Hair or cloth: gradient fill, outlined. */
function fill(A, d, base, o = {}) {
  const g = A.lin([[0, lt(base, o.hi ?? 0.18)], [0.55, base], [1, dk(base, o.lo ?? 0.35)]], o.x1 ?? 0.2, 0, o.x2 ?? 0.8, 1);
  return P(d, g, { s: o.s === undefined ? INK : o.s, w: o.w ?? LW, fr: o.fr, op: o.op, clip: o.clip });
}

function ears(skin, hw, y = 180, o = {}) {
  let s = "";
  for (const side of [-1, 1]) {
    const ex = CX + side * (hw - 3);
    s += E(ex, y, o.rx ?? 9.5, o.ry ?? 16, skin, { s: INK, w: 2.6 });
    s += S(`M${ex + side * 1},${y - 9} Q${ex + side * 6},${y - 2} ${ex + side * 1},${y + 9}`, dk(skin, 0.3), 2);
  }
  return s;
}

function neck(A, skin, w = 25, top = 200, base = 300, chin = 250) {
  const d = `M${CX - w},${top} L${CX + w},${top} L${CX + w},${base - 30} Q${CX + w + 2},${base - 8} ${CX + w + 16},${base} L${CX - w - 16},${base} Q${CX - w - 2},${base - 8} ${CX - w},${base - 30} Z`;
  const sb = chin + 16;
  return P(d, skin, { s: INK }) +
    P(`M${CX - w + 1.5},${top} L${CX + w - 1.5},${top} L${CX + w - 1.5},${sb - 6} Q${CX},${sb + 9} ${CX - w + 1.5},${sb - 6} Z`, dk(skin, 0.3), { op: 0.5 });
}

/** Shoulders and chest, from the neck base down off the bottom of the frame. */
function torsoD({ sw = 140, ny = 268, nw = 28, sy = 292 } = {}) {
  return ssym([[CX, ny], [CX + nw + 4, ny], [CX + nw + 44, ny + 12], [CX + sw - 26, sy + 4], [CX + sw - 2, sy + 24],
    [CX + sw + 12, sy + 60], [CX + sw + 22, 440, 1], [CX, 440, 1]]);
}

function eye(A, cx, side, e, skin) {
  const { y, w, h, iris, ir, tilt, look, lidDrop } = e;
  const x0 = cx - w / 2, x1 = cx + w / 2;
  const y0 = y - (side < 0 ? tilt : 0), y1 = y - (side > 0 ? tilt : 0);
  const top = y - h * 1.15, bot = y + h * 0.85;
  const d = `M${x0},${y0} Q${cx},${top} ${x1},${y1} Q${cx},${bot} ${x0},${y0} Z`;
  if (e.style === "dot") {   // simple bystander eyes
    return E(cx, y, 4.2, 5, INK) + C(cx - 1.3, y - 1.8, 1.4, "#ffffff");
  }
  const clip = A.clip(d);
  let s = P(d, e.white ?? "#fbf7f0");
  const ix = cx + look, iy = y + 0.8;
  const ig = A.rad([[0, lt(iris, 0.3)], [0.65, iris], [1, dk(iris, 0.5)]], 0.5, 0.62, 0.6);
  s += G(C(ix, iy, ir, ig) + C(ix, iy, ir * (e.pupil ?? 0.46), e.pupilColor ?? "#120c10") +
    C(ix - ir * 0.35, iy - ir * 0.42, Math.max(1.3, ir * 0.27), "#ffffff", { op: 0.95 }) +
    (lidDrop ? P(`M${x0 - 2},${y0} Q${cx},${top + lidDrop * 2} ${x1 + 2},${y1} L${x1 + 2},${top - 6} L${x0 - 2},${top - 6} Z`, dk(skin, 0.08)) : "") +
    P(`M${x0},${y0} Q${cx},${top + lidDrop * 2} ${x1},${y1}`, "none", { s: dk(skin, 0.4), w: 5, op: 0.25 }), { clip });
  s += S(`M${x0 - 1},${y0 + 0.5} Q${cx},${top + lidDrop * 2} ${x1 + 1},${y1 + 0.5}`, e.lid ?? INK, e.lidW ?? 3);
  if (e.lash) { const ox = side > 0 ? x1 : x0, oy = side > 0 ? y1 : y0; s += S(`M${ox},${oy + 0.5} q${side * 3.5},${-1.5} ${side * 6},${-5}`, e.lid ?? INK, 2.4); }
  s += S(`M${x0 + 3},${y0 + 2} Q${cx},${bot + 1.5} ${x1 - 3},${y1 + 2}`, dk(skin, 0.35), 1.4, 0.55);
  return s;
}

function nose(o, skin) {
  const { y = 204, w = 8, len = 24, bridge = true } = o;
  const c = o.c ?? dk(skin, 0.38);
  let s = "";
  if (bridge) s += S(`M${CX + 3},${y - len} Q${CX + 7},${y - len * 0.4} ${CX + 5},${y - 3}`, c, 2, 0.5);
  s += S(`M${CX - w},${y - 3} Q${CX - w - 2},${y + 3} ${CX - w * 0.35},${y + 3} Q${CX},${y + 6} ${CX + w * 0.35},${y + 3} Q${CX + w + 2},${y + 3} ${CX + w},${y - 3}`, c, 2.2, o.op ?? 1);
  return s;
}

function mouth(A, o, skin) {
  const { y = 224, w = 24, kind = "smile", curve = 4 } = o;
  const lip = o.lip ?? mix(skin, "#b34a5a", 0.3);
  const line = o.line ?? dk(skin, 0.58);
  const xl = CX - w / 2, xr = CX + w / 2;
  let s = "";
  const lipstick = o.lipstick;
  if (kind === "smile" || kind === "smirk" || kind === "flat") {
    const lc = kind === "smirk" ? [y + 1, y - 3] : kind === "flat" ? [y, y] : [y - 1, y - 1];
    const cv = kind === "flat" ? 1 : curve;
    if (lipstick) {
      s += P(`M${xl},${lc[0]} Q${CX - w * 0.25},${y - 6} ${CX},${y - 3} Q${CX + w * 0.25},${y - 6} ${xr},${lc[1]} Q${CX},${y + cv * 0.6} ${xl},${lc[0]} Z`, dk(lipstick, 0.12));
      s += P(`M${xl + 1},${lc[0]} Q${CX},${y + cv + 9} ${xr - 1},${lc[1]} Q${CX},${y + cv * 0.6} ${xl + 1},${lc[0]} Z`, lipstick);
      s += E(CX - 2, y + cv * 0.5 + 4, w * 0.16, 1.6, "#ffffff", { op: 0.35 });
    } else {
      s += P(`M${xl + 3},${lc[0] + 2} Q${CX},${y + cv + 8} ${xr - 3},${lc[1] + 2} Q${CX},${y + cv + 2} ${xl + 3},${lc[0] + 2} Z`, lip, { op: 0.75 });
    }
    s += S(`M${xl},${lc[0]} Q${CX},${y + cv + 1} ${xr},${lc[1]}`, line, 2.6);
  } else if (kind === "grin") {
    const d = `M${xl},${y - 2} Q${CX},${y + 1} ${xr},${y - 2} Q${CX},${y + curve + 15} ${xl},${y - 2} Z`;
    const clip = A.clip(d);
    s += P(d, "#5a2128") + G(P(`M${xl},${y - 6} L${xr},${y - 6} L${xr},${y + 4} Q${CX},${y + 7} ${xl},${y + 4} Z`, "#fbf7ef") +
      E(CX, y + curve + 13, w * 0.3, 5, "#c0505a"), { clip });
    if (lipstick) s += P(`M${xl - 1},${y - 2} Q${CX - w * 0.25},${y - 7} ${CX},${y - 4} Q${CX + w * 0.25},${y - 7} ${xr + 1},${y - 2} Q${CX},${y + 1} ${xl - 1},${y - 2} Z`, lipstick) +
      P(`M${xl - 1},${y - 2} Q${CX},${y + curve + 15} ${xr + 1},${y - 2} Q${CX},${y + curve + 20} ${xl - 1},${y - 2} Z`, lipstick);
    s += P(d, "none", { s: line, w: 2.4 });
  } else if (kind === "sad") {
    s += P(`M${xl + 4},${y + 3} Q${CX},${y + 7} ${xr - 4},${y + 3} Q${CX},${y + 2} ${xl + 4},${y + 3} Z`, lip, { op: 0.7 });
    s += S(`M${xl + 2},${y + 2} Q${CX},${y - 3} ${xr - 2},${y + 2}`, line, 2.4);
  } else if (kind === "o") {
    s += E(CX, y + 3, w * 0.24, w * 0.32, "#14262a", { s: line, w: 2 });
  }
  return s;
}

/** Brows, eyes, nose, mouth and blush. Everything shifts by o.dy. */
function face(A, o) {
  const dy = o.dy ?? 0, skin = o.skin;
  const e = { y: 172, dx: 25, w: 24, h: 12, iris: "#4b2e1f", ir: 6, tilt: 0, look: 0, lidDrop: 0, lash: 0, ...o.eyes };
  e.y += dy;
  let s = "";
  if (o.under) s += o.under(e);
  const b = { y: e.y - 19, dx: e.dx + 1, w: 25, th: 5.5, arch: 3, tilt: 0, color: "#2a1c16", ...o.brows };
  if (o.brows?.y != null) b.y += dy;
  for (const side of [-1, 1]) {
    const xi = CX + side * (b.dx - b.w / 2), xo = CX + side * (b.dx + b.w / 2);
    const yi = b.y - b.tilt, yo = b.y + b.tilt * 0.4;
    const xm = (xi + xo) / 2, ym = (yi + yo) / 2 - b.arch;
    s += P(`M${xi},${yi - b.th / 2} Q${xm},${ym - b.th / 2} ${xo},${yo} Q${xm},${ym + b.th * 0.35} ${xi},${yi + b.th / 2} Z`, b.color, { s: b.color, w: 1 });
  }
  for (const side of [-1, 1]) s += eye(A, CX + side * e.dx, side, e, skin);
  if (o.nose !== false) s += nose({ ...o.nose, y: (o.nose?.y ?? 204) + dy }, skin);
  if (o.mouth !== false) s += mouth(A, { ...o.mouth, y: (o.mouth?.y ?? 224) + dy }, skin);
  if (o.blush) for (const side of [-1, 1]) s += E(CX + side * 36, e.y + 30, 11, 6, o.blush, { op: 0.3 });
  return s;
}

function bg(A, inner, outer, cy = 0.4) {
  return tag("rect", { x: 0, y: 0, width: 400, height: 400, fill: A.rad([[0, inner], [1, outer]], 0.5, cy, 0.65) });
}

/** A thick line drawn as an outlined capsule (fingers, thumbs, cords). */
function capsule(pts, w, color, o = {}) {
  const d = smooth(pts, false);
  return S(d, o.s ?? INK, w + (o.ow ?? 5), o.op) + S(d, color, w, o.op);
}
/** A tapering limb (a long finger) along a centreline, w0 wide at the base, w1 at the rounded tip. */
function taper(pts, w0, w1, color, o = {}) {
  const n = pts.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy), w = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
    L.push([pts[i][0] - dy / len * w, pts[i][1] + dx / len * w]); R.push([pts[i][0] + dy / len * w, pts[i][1] - dx / len * w]);
  }
  const a = pts[n - 2], b = pts[n - 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const tip = [b[0] + (b[0] - a[0]) / len * w1 * 0.55, b[1] + (b[1] - a[1]) / len * w1 * 0.55];
  return P(smooth([...L, tip, ...R.reverse()]), color, { s: INK, w: o.w ?? 2.4 });
}
/** Point at fraction t along a straight segment, and the unit normal. */
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
function normal(a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); return [-dy / L, dx / L]; }

/** Curly hair as one mass: the circles merge into a single outlined shape, with curl marks inside. */
function curlMass(A, circles, base, seed, o = {}) {
  const rnd = rng(seed);
  const ow = o.ow ?? 3;
  const xs = circles.map(c => c[0]), ys = circles.map(c => c[1]);
  const g = A.lin([[0, lt(base, o.hi ?? 0.25)], [0.5, base], [1, dk(base, o.lo ?? 0.3)]], Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys), true);
  let s = circles.map(([x, y, rr]) => C(x, y, rr + ow, INK)).join("") + circles.map(([x, y, rr]) => C(x, y, rr, g)).join("");
  const id = A.uid("cm");
  A.defs.push(`<clipPath id="${id}">${circles.map(([x, y, rr]) => C(x, y, rr)).join("")}</clipPath>`);
  let tex = "";
  for (let i = 0; i < (o.n ?? 70); i++) {
    const c = circles[Math.floor(rnd() * circles.length)];
    const a = rnd() * Math.PI * 2, dd = rnd() * c[2] * 0.85;
    const x = c[0] + Math.cos(a) * dd, y = c[1] + Math.sin(a) * dd, sz = (o.size ?? 5) + rnd() * 4;
    const dark = rnd() < 0.62;
    tex += S(`M${r(x - sz)},${r(y)} a${r(sz * 0.62)},${r(sz * 0.62)} 0 1 1 ${r(sz * 0.95)},${r(sz * 0.55)}`, dark ? dk(base, 0.42) : lt(base, 0.32), dark ? 2.1 : 1.7, 0.85);
  }
  return s + G(tex, { clip: `url(#${id})` });
}
/** Circles along an ellipse arc (for curly hair outlines). */
function cloud(cx, cy, rx, ry, a0, a1, step, rr, seed) {
  const rnd = rng(seed), out = [];
  for (let a = a0; a <= a1 + 1e-6; a += step) out.push([cx + Math.cos(a) * rx + (rnd() - 0.5) * 6, cy + Math.sin(a) * ry + (rnd() - 0.5) * 6, rr + rnd() * 5]);
  return out;
}

/**
 * An open hand, palm towards the viewer, fingers up. side = -1 puts the thumb on the
 * viewer's left (the person's LEFT hand), +1 on the right. Optional ring on the thumb.
 */
function palmHand(A, cx, cy, rot, palm, o = {}) {
  const sd = o.side ?? -1, sx = v => v * -sd;     // build with the thumb at -x, then mirror if needed
  const fingers = [[[-13, -18], [-15, -36], [-17, -50]], [[-4, -20], [-4.5, -40], [-5, -56]], [[6, -20], [7, -38], [8, -52]], [[15, -16], [18, -30], [21, -42]]]
    .map(f => f.map(([x, y]) => [sx(x), y]));
  const thumb = [[-14, 10], [-28, -2], [-37, -17]].map(([x, y]) => [sx(x), y]);
  const palmD = smooth([[-19, -20], [-6, -24], [8, -24], [19, -20], [22, 2], [17, 22], [2, 30], [-12, 26], [-20, 6]].map(([x, y]) => [sx(x), y]));
  const fw = 9, tw = 10.5;
  let s = P(palmD, INK, { s: INK, w: 5 });
  for (const f of fingers) s += S(smooth(f, false), INK, fw + 5);
  s += S(smooth(thumb, false), INK, tw + 5);
  s += P(palmD, palm);
  for (const f of fingers) s += S(smooth(f, false), palm, fw);
  s += S(smooth(thumb, false), palm, tw);
  const crease = dk(palm, 0.32);
  s += S(`M${sx(-9)},-22 L${sx(-9)},-15 M${sx(1)},-23 L${sx(1)},-15 M${sx(11)},-20 L${sx(11)},-13`, crease, 1.6);
  s += S(`M${sx(-16)},-4 Q${sx(0)},-10 ${sx(17)},-6 M${sx(-8)},20 Q${sx(-13)},6 ${sx(-12)},-6`, crease, 1.5, 0.7);
  if (o.ring) {   // a band across the thumb's lower joint: dark edges, silver face, a white glint
    const a = thumb[0], b = thumb[1];
    const p = lerp(a, b, 0.5), q = lerp(a, b, 0.78);
    const d = `M${r(p[0])},${r(p[1])} L${r(q[0])},${r(q[1])}`;
    s += S(d, INK, tw + 5, undefined, { cap: "butt" }) + S(d, o.ring, tw + 1.2, undefined, { cap: "butt" });
    const n = normal(a, b), m = lerp(a, b, 0.64);
    s += S(`M${r(m[0] - n[0] * 4)},${r(m[1] - n[1] * 4)} L${r(m[0] + n[0] * 2)},${r(m[1] + n[1] * 2)}`, "#ffffff", 2, 0.95);
    s += S(`M${r(p[0] + n[0] * 5.5)},${r(p[1] + n[1] * 5.5)} L${r(q[0] + n[0] * 5.5)},${r(q[1] + n[1] * 5.5)}`, dk(o.ring, 0.35), 2);
  }
  return G(s, { tf: `translate(${cx} ${cy}) rotate(${rot})` });
}

// ---------------------------------------------------------------- frame
function frame(A, role, body) {
  const R = RING[role];
  const disc = A.uid("disc");
  A.defs.push(`<clipPath id="${disc}"><circle cx="200" cy="200" r="${R_IN + 1}"/></clipPath>`);
  const mid = (R_IN + R_OUT) / 2, bw = R_OUT - R_IN;
  const ringG = A.lin([[0, R.hi], [0.45, R.c], [1, R.lo]], 0.15, 0, 0.85, 1);
  let ring = C(200, 200, mid, "none", { s: ringG, w: bw });
  if (role === "coven") ring += C(200, 200, R_IN + 3.4, "none", { s: lt(R.hi, 0.4), w: 1.8, op: 0.95 }) + C(200, 200, R_OUT - 3.4, "none", { s: lt(R.hi, 0.4), w: 1.8, op: 0.95 });
  if (role === "guardian") ring += C(200, 200, mid, "none", { s: R.lo, w: 2.6 });
  if (role === "threat") {
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2 - Math.PI / 2, ca = Math.cos(a), sa = Math.sin(a);
      ring += S(`M${r(200 + ca * (R_IN + 2.5))},${r(200 + sa * (R_IN + 2.5))} L${r(200 + ca * (R_OUT - 2.5))},${r(200 + sa * (R_OUT - 2.5))}`, R.lo, 3.4, undefined, { cap: "butt" });
    }
  }
  ring += C(200, 200, R_OUT, "none", { s: INK, w: 2.5 }) + C(200, 200, R_IN, "none", { s: INK, w: 2.5 });
  return `<g clip-path="url(#${disc})">${body}</g>${ring}`;
}

function svgDoc(A, role, body) {
  const content = frame(A, role, body);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400"><defs>${A.defs.join("")}</defs>${content}</svg>`;
}

// ================================================================ THE COVEN

/** Dana Okafor: tall, short natural hair, scrubs under a denim jacket, silver ring on her LEFT thumb. */
function dana(A) {
  const skin = "#6e4632", hd = { top: 90, chin: 252, hw: 58, jaw: 0.76, chinW: 0.32 };
  const denim = "#4f72a8", scrubs = "#2e9e95", hair = "#1b1412", silver = "#cdd3da";
  let s = bg(A, "#f8d6ba", "#cd7a5c");
  const tD = torsoD({ sw: 142, nw: 26 });
  s += fill(A, tD, denim, { hi: 0.1, lo: 0.3 });
  s += neck(A, skin, 24, 200, 330, hd.chin);
  // scrubs in the jacket opening, V-neck
  s += fill(A, `M${CX - 54},276 L${CX - 22},272 L${CX},320 L${CX + 22},272 L${CX + 54},276 L${CX + 42},420 L${CX - 42},420 Z`, scrubs, { hi: 0.12, lo: 0.25 });
  s += S(`M${CX - 21},273 L${CX},318 L${CX + 21},273`, dk(scrubs, 0.3), 4);
  s += S(`M${CX - 30},336 L${CX - 30},420 M${CX + 30},336 L${CX + 30},420`, dk(scrubs, 0.2), 1.6, 0.6); // scrub pocket seams
  // jacket: yoke stitching and chest pockets
  const stitch = "#e0a548";
  s += S(`M${CX - 64},300 Q${CX - 100},304 ${CX - 136},300 M${CX + 64},300 Q${CX + 100},304 ${CX + 136},300`, stitch, 1.6, 0.9, { dash: "4 3" });
  s += fill(A, `M${CX - 116},318 L${CX - 70},318 L${CX - 72},346 L${CX - 112},346 Z`, lt(denim, 0.06), { w: 2.2 });
  s += S(`M${CX - 116},328 L${CX - 70},328`, stitch, 1.4, 0.9, { dash: "3 3" }) + C(CX - 93, 324, 3.2, "#c9ced4", { s: INK, w: 1.4 });
  // collar
  for (const side of [-1, 1]) {
    const pts = [[CX + side * 26, 258], [CX + side * 64, 270], [CX + side * 78, 286], [CX + side * 52, 318, 1], [CX + side * 40, 286], [CX + side * 30, 272]];
    s += fill(A, smooth(pts), lt(denim, 0.1), { w: 2.6 });
  }
  // her LEFT hand (viewer's right) raised, palm out ("Sit down. Let me look at that."), silver ring on the thumb
  s += fill(A, `M282,292 L318,294 L356,420 L300,420 Z`, denim, { w: 2.6 });                        // sleeve
  s += fill(A, `M280,286 L320,289 L322,304 L282,302 Z`, lt(denim, 0.1), { w: 2.4 });                 // cuff
  s += palmHand(A, 304, 256, 8, mix(skin, "#e2aa86", 0.42), { side: -1, ring: silver });
  // head
  s += ears(skin, hd.hw, 180);
  for (const side of [-1, 1]) s += C(CX + side * (hd.hw - 2), 194, 3.2, silver, { s: INK, w: 1.4 });   // silver studs
  const hD = headD(hd);
  s += shaded(A, hD, skin, { hi: 0.12, lo: 0.3 });
  s += face(A, { skin, eyes: { iris: "#3a2116", lash: 1 }, brows: { color: hair, tilt: -0.5, arch: 4, th: 4.8 }, nose: { w: 9 }, mouth: { kind: "smile", curve: 3, w: 23, lipstick: "#8a4740" } });
  // short natural hair (close crop), textured
  const hairD = smooth([[140, 166], [134, 134], [142, 100], [166, 76], [200, 68], [234, 76], [258, 100], [266, 134], [260, 166],
    [254, 150, 1], [249, 128], [232, 116], [200, 112], [168, 116], [151, 128], [146, 150, 1]]);
  s += fill(A, hairD, hair, { hi: 0.12, lo: 0.2 });
  s += P(hairD, A.pattern(C(2, 2, 1.7, lt(hair, 0.16)) + C(5.5, 5.5, 1.7, lt(hair, 0.12)), 7, 7), { clip: A.clip(hairD) });
  return svgDoc(A, "coven", s);
}

/** Marco Rossi: stocky, oil on his hands, rolled sleeves, burn scar on his RIGHT forearm. */
function marco(A) {
  const skin = "#c99670", hd = { top: 94, chin: 254, hw: 68, jaw: 0.92, chinW: 0.5, temple: 0.93 };
  const shirt = "#3d5170", hair = "#2a1d17", oil = "#2b2622";
  let s = bg(A, "#f8cf78", "#cc6a2a");
  // wrench, held up in his right fist (viewer's left), head clear of his face
  const w0 = [164, 294], w1 = [104, 210];
  const steel = A.lin([[0, "#e3e7ea"], [0.5, "#a8b0b8"], [1, "#6f7881"]], 0, 0, 1, 1);
  s += S(`M${w0[0]},${w0[1]} L${w1[0]},${w1[1]}`, INK, 19) + S(`M${w0[0]},${w0[1]} L${w1[0]},${w1[1]}`, "#a3abb3", 13);
  s += S(`M${w0[0] - 3},${w0[1] - 4} L${w1[0] - 3},${w1[1] - 4}`, "#e6eaee", 3, 0.8);
  const jaw = A.mask(`<rect width="400" height="400" fill="#fff"/><path d="M${w1[0] - 30},${w1[1] - 46} L${w1[0] - 4},${w1[1] - 4} L${w1[0] - 22},${w1[1] + 10} L${w1[0] - 48},${w1[1] - 30} Z" fill="#000" transform="rotate(-8 ${w1[0]} ${w1[1]})"/>`);
  s += G(C(w1[0] - 6, w1[1] - 8, 21, steel, { s: INK, w: 3 }), { mask: jaw });
  // body: work shirt
  const tD = torsoD({ sw: 168, nw: 33, sy: 296 });
  s += fill(A, tD, shirt, { hi: 0.12, lo: 0.3 });
  s += neck(A, skin, 32, 205, 320, hd.chin);
  s += fill(A, `M${CX - 40},282 L${CX},322 L${CX + 40},282 L${CX + 46},300 L${CX},346 L${CX - 46},300 Z`, shirt, { s: false }); // V of the open collar
  for (const side of [-1, 1]) s += fill(A, smooth([[CX + side * 32, 262], [CX + side * 74, 274], [CX + side * 86, 290], [CX + side * 56, 320, 1], [CX + side * 42, 292], [CX + side * 34, 276]]), lt(shirt, 0.08), { w: 2.6 });
  s += S(`M${CX},322 L${CX},420`, dk(shirt, 0.35), 2.4) + C(CX + 6, 350, 3, "#d8d2c4", { s: INK, w: 1.2 }) + C(CX + 6, 380, 3, "#d8d2c4", { s: INK, w: 1.2 });
  // chest pocket (his left, viewer's right) with a red rag
  s += P(smooth([[CX + 60, 320], [CX + 70, 306], [CX + 80, 312], [CX + 90, 302], [CX + 100, 314], [CX + 98, 330], [CX + 62, 330]]), "#c8402e", { s: INK, w: 2.2 });
  s += fill(A, `M${CX + 54},326 L${CX + 104},326 L${CX + 102},366 L${CX + 56},366 Z`, lt(shirt, 0.05), { w: 2.4 });
  s += S(`M${CX + 54},338 L${CX + 104},338`, dk(shirt, 0.3), 1.8);
  // his right forearm, rolled sleeve, burn scar
  const A0 = [114, 330], B0 = [148, 286];
  const n = normal(A0, B0), L0 = Math.hypot(B0[0] - A0[0], B0[1] - A0[1]), u = [(B0[0] - A0[0]) / L0, (B0[1] - A0[1]) / L0];
  const fa = [[A0[0] - n[0] * 23, A0[1] - n[1] * 23], [B0[0] - n[0] * 16, B0[1] - n[1] * 16], [B0[0] + n[0] * 16, B0[1] + n[1] * 16], [A0[0] + n[0] * 23, A0[1] + n[1] * 23]];
  s += shaded(A, poly(fa), skin, { w: 2.8 });
  s += S(`M${r(A0[0] - n[0] * 12)},${r(A0[1] - n[1] * 12)} L${r(B0[0] - n[0] * 9)},${r(B0[1] - n[1] * 9)}`, dk(skin, 0.25), 1.4, 0.4);
  const ang = Math.atan2(B0[1] - A0[1], B0[0] - A0[0]) * 180 / Math.PI;
  const sc = lerp(A0, B0, 0.5);
  s += E(sc[0], sc[1], 11, 6.5, "#e9a796", { tf: `rotate(${r(ang)} ${r(sc[0])} ${r(sc[1])})`, s: dk("#e9a796", 0.25), w: 1.4 });
  s += S(`M${r(sc[0] - 6)},${r(sc[1] + 4)} q4,-3 9,-9 M${r(sc[0] - 1)},${r(sc[1] + 5)} q4,-4 7,-8`, "#f6cbbd", 1.6);
  const c1 = [A0[0] - u[0] * 8, A0[1] - u[1] * 8], c2 = [A0[0] + u[0] * 9, A0[1] + u[1] * 9];
  const at = (p, nn, uu = 0) => [p[0] + n[0] * nn + u[0] * uu, p[1] + n[1] * nn + u[1] * uu];
  s += fill(A, smooth([at(c1, -29), at(c2, -28), at(c2, 0, 3), at(c2, 28), at(c1, 29), at(c1, 0, -3)]), lt(shirt, 0.18), { w: 2.6 });   // the rolled sleeve
  for (const t of [0.35, 0.68]) { const m = lerp(c1, c2, t); s += S(smooth([at(m, -26), at(m, 0, 1.5), at(m, 26)], false), dk(shirt, 0.3), 1.7); }
  // fist round the wrench handle, oily
  const fc = [157, 275], k = 1.25;
  s += shaded(A, smooth([[-18, -6], [-8, -17], [10, -16], [19, -4], [16, 13], [-2, 17], [-15, 10]].map(([x, y]) => [fc[0] + x * k, fc[1] + y * k])), skin, { w: 2.8 });
  s += S(`M${fc[0] - 11},${fc[1] - 16} q4,10 1,20 M${fc[0] + 1},${fc[1] - 19} q4,11 1,22 M${fc[0] + 12},${fc[1] - 15} q4,10 1,19`, dk(skin, 0.4), 1.8);
  s += capsule([[fc[0] - 17, fc[1] + 5], [fc[0] - 2, fc[1] + 11], [fc[0] + 12, fc[1] + 8]], 11, skin, { ow: 4.5 });       // thumb across the front
  s += E(fc[0] - 7, fc[1] - 12, 6, 3.5, oil, { op: 0.55 }) + E(fc[0] + 11, fc[1] - 5, 5, 3, oil, { op: 0.5 }) + E(fc[0] + 2, fc[1] + 11, 5, 2.4, oil, { op: 0.45 });
  // head
  s += ears(skin, hd.hw, 182, { rx: 10.5, ry: 17 });
  const hD = headD(hd);
  s += shaded(A, hD, skin);
  const stub = `M136,196 C150,214 170,206 186,212 C193,208 207,208 214,212 C230,206 250,214 264,196 L272,272 L128,272 Z`;
  s += P(stub, hair, { op: 0.2, clip: A.clip(hD) });
  s += P(stub, A.pattern(C(1.5, 1.5, 0.8, hair) + C(4.5, 4, 0.8, hair), 6, 6), { op: 0.5, clip: A.clip(hD) });
  s += P(hD, "none", { s: INK, w: LW });
  s += face(A, { skin, dy: 2, eyes: { iris: "#5a3a22", h: 11, tilt: 1 }, brows: { color: hair, th: 7.5, w: 27, arch: 3, tilt: 1 }, nose: { w: 10, len: 26 }, mouth: { kind: "grin", w: 32, curve: 6 } });
  s += E(158, 216, 9, 3.6, oil, { op: 0.45, tf: "rotate(-18 158 216)" });   // oil smudge on his right cheek
  const hairD = smooth([[134, 168], [131, 130], [140, 100], [160, 80], [186, 70], [214, 68], [244, 76], [262, 96], [270, 128], [268, 168],
    [261, 150, 1], [255, 126], [238, 114], [214, 118], [196, 110], [172, 114], [154, 126], [142, 150, 1]]);
  s += fill(A, hairD, hair, { hi: 0.2 });
  s += S(`M160,92 Q182,80 206,84 M214,80 Q236,82 252,98 M150,112 Q170,96 192,98`, lt(hair, 0.28), 2.4, 0.8);
  return svgDoc(A, "coven", s);
}

/** June Takeda: small, round glasses, yellow raincoat, always carries a notebook. */
function june(A) {
  const skin = "#f2d4b9", hd = { top: 96, chin: 248, hw: 60, jaw: 0.8, chinW: 0.42, temple: 0.92, cheekY: 165 };
  const coat = "#f4c22f", hair = "#1b1920", dy = 4;
  let s = bg(A, "#a9c3c9", "#3f5c66");
  // rain on the window behind her
  const rnd = rng(7);
  for (let i = 0; i < 26; i++) { const x = rnd() * 400, y = rnd() * 400; s += S(`M${r(x)},${r(y)} l-3,12`, "#ffffff", 1.6, 0.25); }
  s += fill(A, ssym([[CX, 232], [240, 232], [276, 246], [294, 272], [272, 286], [CX, 286]]), dk(coat, 0.12));     // hood, down
  s += fill(A, ssym([[CX, 70], [240, 74], [270, 98], [283, 140], [286, 195], [284, 238], [278, 252, 1], [CX, 252, 1]]), hair, { hi: 0.12 });
  const tD = torsoD({ sw: 124, nw: 24, sy: 296 });
  s += fill(A, tD, coat, { hi: 0.15, lo: 0.22 });
  s += neck(A, skin, 22, 205, 300, hd.chin);
  s += fill(A, `M${CX - 30},276 L${CX},300 L${CX + 30},276 L${CX + 34},300 L${CX},330 L${CX - 34},300 Z`, "#2f5f63", { w: 2.4 }); // teal jumper
  for (const side of [-1, 1]) s += fill(A, smooth([[CX + side * 24, 262], [CX + side * 56, 270], [CX + side * 66, 286], [CX + side * 44, 318, 1], [CX + side * 32, 292], [CX + side * 26, 276]]), lt(coat, 0.08), { w: 2.6 });
  s += S(`M${CX + 8},330 L${CX + 6},420`, dk(coat, 0.3), 2.2) + C(CX + 18, 350, 3.4, "#3c3c42") + C(CX + 18, 378, 3.4, "#3c3c42");
  // notebook held to her chest by her left hand (viewer's right); thumb on the cover
  const nb = "M214,300 L264,294 L272,362 L222,368 Z";
  s += P("M264,294 L270,295 L278,362 L272,362 Z", "#f3ead6", { s: INK, w: 2.2 });                     // page edges
  s += fill(A, nb, "#b8463a", { hi: 0.12, w: 2.6 });
  s += S("M258,296 L266,363", "#2a1f22", 3) + S("M222,312 L262,307", "#d9a36a", 1.6, 0.8);
  s += fill(A, "M270,328 L298,336 L304,380 L272,372 Z", coat, { w: 2.6 });                              // her sleeve behind
  s += shaded(A, smooth([[268, 322], [282, 326], [288, 342], [282, 356], [270, 356]]), skin, { w: 2.4 });
  s += capsule([[270, 344], [258, 334], [250, 328]], 9, skin, { ow: 4.5 });
  // head
  const hD = headD(hd);
  s += shaded(A, hD, skin, { hi: 0.1, lo: 0.25 });
  s += face(A, { skin, dy, eyes: { iris: "#3a2418", lash: 1 }, brows: { color: hair, tilt: 2.5, th: 5, arch: 3 }, nose: { w: 7, len: 20 }, mouth: { curve: 3.5, w: 20 }, blush: "#e88a7a" });
  // bob with a blunt fringe
  const front = smooth([[130, 246, 1], [124, 190], [126, 130], [146, 92], [CX, 72], [254, 92], [274, 130], [276, 190], [270, 246, 1],
    [256, 246, 1], [252, 200], [250, 160], [246, 143, 1], [222, 141], [CX, 143], [178, 141], [154, 143, 1], [150, 160], [148, 200], [144, 246, 1]]);
  s += fill(A, front, hair, { hi: 0.16 });
  s += S(`M160,98 Q186,84 214,86`, "#4a4d5c", 3, 0.8) + S(`M138,150 Q136,190 140,232 M262,150 Q264,190 260,232`, "#3a3c48", 2, 0.7);
  // round glasses
  const gy = 176 + 0;
  const fr = "#2b211e";
  for (const side of [-1, 1]) {
    const gx = CX + side * 25;
    s += C(gx, gy, 17, "#ffffff", { op: 0.12 }) + S(`M${gx - 9},${gy - 8} l7,-5`, "#ffffff", 2.4, 0.7);
    s += C(gx, gy, 17, "none", { s: fr, w: 4.5 });
    s += S(`M${gx + side * 17},${gy - 3} L${gx + side * 26},${gy - 6}`, fr, 3.5);
  }
  s += S(`M${CX - 8},${gy - 3} Q${CX},${gy - 9} ${CX + 8},${gy - 3}`, fr, 3.5);
  return svgDoc(A, "coven", s);
}

/** Quinn Abernathy (they): lanky, curly red hair, cardigan, a whistle on a cord. */
function quinn(A) {
  const skin = "#f7dcc9", hd = { top: 92, chin: 258, hw: 58, jaw: 0.78, chinW: 0.36, cheekY: 164 };
  const hair = "#c4502a", card = "#7d5aa6", shirtC = "#f4eddc", dy = 3;
  let s = bg(A, "#dbead0", "#77a374");
  const rnd = rng(11);
  // curly hair, one mass behind the head
  const back = [...cloud(CX, 150, 82, 88, 1.95, 7.47, 0.24, 15, 3), [CX, 112, 62], [156, 150, 42], [244, 150, 42], [146, 200, 30], [254, 200, 30]];
  s += curlMass(A, back, hair, 3, { n: 90 });
  const tD = torsoD({ sw: 120, nw: 21, sy: 298 });
  s += fill(A, tD, card, { hi: 0.14, lo: 0.3 });
  s += P(tD, A.pattern(S("M0,3 L6,3", dk(card, 0.2), 1, 0.5), 6, 6), { clip: A.clip(tD) });   // knit texture
  s += neck(A, skin, 21, 200, 300, hd.chin);
  // shirt and collar inside the cardigan's V
  s += fill(A, `M${CX - 34},276 L${CX + 34},276 L${CX + 22},360 L${CX - 22},360 Z`, shirtC, { w: 2.4 });
  s += P(`M${CX - 21},266 L${CX + 21},266 L${CX + 21},284 L${CX},298 L${CX - 21},284 Z`, skin);
  for (const side of [-1, 1]) s += fill(A, poly([[CX + side * 22, 264], [CX + side * 4, 300], [CX + side * 30, 296], [CX + side * 34, 274]]), shirtC, { w: 2.2 });
  for (const side of [-1, 1]) s += fill(A, poly([[CX + side * 36, 272], [CX + side * 6, 380], [CX + side * 2, 420], [CX + side * 60, 420], [CX + side * 62, 280]]), card, { w: 2.6, lo: 0.25 });
  s += C(CX - 10, 372, 3.6, "#efe2c4", { s: INK, w: 1.4 });
  // whistle on a cord: the cord hangs from behind the neck to the whistle's ring
  const ring = [205, 326];
  s += S(`M${CX - 19},270 L${ring[0] - 1},${ring[1]} M${CX + 19},270 L${ring[0] + 1},${ring[1]}`, "#1d2a3a", 2.6);
  s += C(ring[0], ring[1] + 2, 4, "none", { s: "#9aa2aa", w: 2 });
  const wg = A.lin([[0, "#f4f6f8"], [0.5, "#b9c1c9"], [1, "#78818b"]], 0, 0, 0.6, 1);
  s += P(`M${ring[0] - 6},${ring[1] + 6} L${ring[0] + 26},${ring[1] + 6} L${ring[0] + 26},${ring[1] + 16} L${ring[0] + 6},${ring[1] + 18} Z`, wg, { s: INK, w: 2.2 });
  s += C(ring[0] - 4, ring[1] + 18, 12, wg, { s: INK, w: 2.4 });
  s += P(`M${ring[0] - 2},${ring[1] + 7} L${ring[0] + 6},${ring[1] + 7} L${ring[0] + 4},${ring[1] + 11} Z`, "#2a2a30");
  s += C(ring[0] - 8, ring[1] + 13, 3, "#ffffff", { op: 0.8 });
  // head
  s += ears(skin, hd.hw, 182);
  const hD = headD(hd);
  s += shaded(A, hD, skin, { hi: 0.1, lo: 0.25 });
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1, t = rnd();
    s += C(CX + side * (12 + rnd() * 30), 190 + dy + t * 22 - (1 - Math.abs(side)) * 4, 1.3 + rnd() * 0.6, "#c98557", { op: 0.75 });
  }
  s += face(A, { skin, dy, eyes: { iris: "#5c8a4c" }, brows: { color: "#a2452a", tilt: 1.5, th: 5, arch: 4 }, nose: { w: 7, len: 26 }, mouth: { curve: 5, w: 24 }, blush: "#ee9a86" });
  // fringe curls over the forehead
  s += curlMass(A, [[148, 136, 14], [160, 118, 15], [180, 108, 15], [202, 104, 16], [224, 107, 15], [244, 118, 15], [254, 138, 13], [196, 92, 20], [170, 96, 16], [228, 96, 16]], hair, 5, { n: 30, ow: 2.6 });
  return svgDoc(A, "coven", s);
}

/** Tess Lindqvist: broad-shouldered, blonde braid with a pale streak, driver's uniform. */
function tess(A) {
  const skin = "#f4d7c4", hd = { top: 92, chin: 252, hw: 64, jaw: 0.86, chinW: 0.44 };
  const hair = "#d6a94b", streak = "#f8f5ee", navy = "#25355a";
  let s = bg(A, "#f2d3d8", "#b27080");
  const tD = torsoD({ sw: 172, nw: 30, sy: 296 });
  s += fill(A, tD, navy, { hi: 0.14, lo: 0.3 });
  s += neck(A, skin, 28, 200, 320, hd.chin);
  // shirt, collar and tie
  s += fill(A, `M${CX - 42},280 L${CX + 42},280 L${CX + 20},420 L${CX - 20},420 Z`, "#bcd2ea", { w: 2.4 });
  s += fill(A, `M${CX - 8},298 L${CX + 8},298 L${CX + 12},380 L${CX},394 L${CX - 12},380 Z`, "#7a2234", { w: 2.2 });
  s += fill(A, `M${CX - 9},288 L${CX + 9},288 L${CX + 7},300 L${CX - 7},300 Z`, "#7a2234", { w: 2 });
  for (const side of [-1, 1]) s += fill(A, poly([[CX + side * 28, 266], [CX + side * 3, 292], [CX + side * 26, 304], [CX + side * 38, 278]]), "#d4e3f2", { w: 2.2 });
  // jacket fronts and lapels
  for (const side of [-1, 1]) s += fill(A, poly([[CX + side * 40, 276], [CX + side * 14, 360], [CX + side * 10, 420], [CX + side * 90, 420], [CX + side * 80, 290]]), navy, { w: 2.6, lo: 0.25 });
  for (const side of [-1, 1]) s += fill(A, poly([[CX + side * 38, 274], [CX + side * 18, 352], [CX + side * 40, 326], [CX + side * 56, 300], [CX + side * 50, 284]]), lt(navy, 0.1), { w: 2.2 });
  // epaulettes and the company badge (her left chest, viewer's right)
  for (const side of [-1, 1]) {
    s += fill(A, poly([[CX + side * 92, 284], [CX + side * 150, 300], [CX + side * 146, 314], [CX + side * 88, 298]]), dk(navy, 0.2), { w: 2.2 });
    s += C(CX + side * 96, 292, 3.6, "#d9b55a", { s: INK, w: 1.4 });
  }
  s += C(CX + 92, 340, 13, "#d9b55a", { s: INK, w: 2.4 }) + C(CX + 92, 340, 7.5, "none", { s: dk("#d9b55a", 0.35), w: 2 }) + C(CX + 89, 336, 3, "#ffffff", { op: 0.6 });
  // braid from behind her right ear (viewer's left), down past the jaw and forward over her right shoulder;
  // the pale streak runs down one strand of it
  const top = [138, 204], bot = [150, 350];
  for (let i = 0; i < 8; i++) {
    const t = i / 7.4, p = lerp(top, bot, t);
    const wv = 12 - i * 0.5;
    s += E(p[0] - 5, p[1] + 4, wv, wv * 1.25, hair, { s: INK, w: 2.2, tf: `rotate(-28 ${r(p[0] - 5)} ${r(p[1] + 4)})` });
    s += E(p[0] + 6, p[1] + 13, wv, wv * 1.25, streak, { s: INK, w: 2.2, tf: `rotate(28 ${r(p[0] + 6)} ${r(p[1] + 13)})` });
  }
  s += P(`M${bot[0] - 9},${bot[1] + 8} L${bot[0] + 12},${bot[1] + 10} L${bot[0] + 11},${bot[1] + 18} L${bot[0] - 10},${bot[1] + 16} Z`, navy, { s: INK, w: 2 });
  s += P(smooth([[bot[0] - 8, bot[1] + 18], [bot[0] + 10, bot[1] + 19], [bot[0] + 8, bot[1] + 30], [bot[0], bot[1] + 34], [bot[0] - 8, bot[1] + 29]]), hair, { s: INK, w: 2 });
  // head
  s += ears(skin, hd.hw, 180);
  const hD = headD(hd);
  s += shaded(A, hD, skin, { hi: 0.1, lo: 0.25 });
  s += face(A, { skin, eyes: { iris: "#4f7fa8", lidDrop: 2 }, brows: { color: "#9a7434", tilt: -0.5, arch: 2, th: 5 }, nose: { w: 9 }, mouth: { kind: "smirk", w: 22, curve: 2 } });
  // hair pulled back, side part at her left; the pale streak starts at her right temple (viewer's left)
  const hairD = smooth([[138, 166], [134, 136], [146, 100], [172, 80], [CX, 74], [230, 78], [256, 98], [268, 136], [264, 166],
    [257, 152, 1], [252, 132], [240, 116], [222, 106, 1], [CX, 112], [172, 116], [154, 132], [146, 152, 1]]);
  s += fill(A, hairD, hair, { hi: 0.25, lo: 0.25 });
  s += S(`M222,108 Q246,104 258,130 M222,108 Q196,100 170,104 M214,112 Q190,110 160,124`, dk(hair, 0.3), 2, 0.8);
  s += P(smooth([[176, 113], [160, 120], [146, 140], [140, 166], [148, 166], [152, 142], [164, 126], [182, 118]]), streak, { s: dk(hair, 0.35), w: 1.6 });
  return svgDoc(A, "coven", s);
}

/** Noor Haddad: green headscarf, soil under her nails, a crow feather in her pocket. */
function noor(A) {
  const skin = "#c9936a", hd = { top: 96, chin: 250, hw: 60 };
  const scarf = "#2f8f5c", apron = "#8b6a47", top = "#e9dcc2", dy = 2;
  let s = bg(A, "#d2e6f2", "#6a97b6");
  // a few leaves in the sunlit glass behind her
  const tD = torsoD({ sw: 138, nw: 26, sy: 298 });
  s += fill(A, tD, top, { hi: 0.1, lo: 0.2 });
  // apron bib and straps
  s += fill(A, `M${CX - 58},300 L${CX + 58},300 L${CX + 66},420 L${CX - 66},420 Z`, apron, { w: 2.6, lo: 0.25 });
  for (const side of [-1, 1]) s += fill(A, poly([[CX + side * 54, 302], [CX + side * 62, 302], [CX + side * 82, 268], [CX + side * 72, 266]]), dk(apron, 0.15), { w: 2 });
  s += S(`M${CX - 50},312 L${CX + 50},312`, dk(apron, 0.3), 1.6, 0.8, { dash: "4 3" });
  s += E(CX - 30, 380, 9, 4, "#4a3626", { op: 0.4 }) + E(CX - 16, 392, 6, 3, "#4a3626", { op: 0.35 });   // soil marks on the apron
  // headscarf behind the face, draping over the shoulders
  const outer = ssym([[CX, 68], [244, 74], [276, 102], [290, 150], [290, 200], [282, 236], [288, 262], [300, 284], [264, 304], [230, 318], [CX, 322]]);
  const hD = headD(hd);
  s += fill(A, outer, scarf, { hi: 0.16, lo: 0.3 });
  s += S(`M152,262 Q176,292 200,300 Q224,292 248,262 M140,276 Q170,306 200,312 M258,286 Q240,300 222,306`, dk(scarf, 0.3), 2.2, 0.8);
  s += shaded(A, hD, skin, { hi: 0.1, lo: 0.28 });
  s += face(A, { skin, dy, eyes: { iris: "#4a2c1b", lash: 1 }, brows: { color: "#2a1a12", tilt: 1, th: 5.5, arch: 3.5 }, nose: { w: 9, len: 24 }, mouth: { curve: 5, w: 24 }, blush: "#d9776a" });
  // front fold of the scarf framing the face
  const opening = ssym([[CX, 114], [232, 118], [252, 140], [258, 172], [254, 208], [240, 234], [220, 250], [CX, 254]]);
  const frontBand = ssym([[CX, 96], [242, 100], [270, 126], [278, 172], [272, 214], [256, 246], [230, 266], [CX, 272]]);
  s += P(frontBand + opening, A.lin([[0, lt(scarf, 0.2)], [1, dk(scarf, 0.15)]], 0, 0, 1, 1), { s: INK, w: LW, fr: "evenodd" });
  s += S(smooth([[160, 106], [CX, 100], [240, 106]], false), lt(scarf, 0.35), 2.4, 0.8);
  // apron pocket with a crow feather standing in it
  const pk = [CX + 14, 332, CX + 68, 378];
  const fb = [CX + 40, 362], ft = [CX + 68, 244];
  const fn = normal(fb, ft);
  const fpt = t => lerp(fb, ft, t);
  const vane = [];
  for (let i = 0; i <= 10; i++) { const t = 0.12 + i * 0.088, p = fpt(t), wv = 12 * Math.sin(Math.PI * Math.min(1, t * 1.05)); vane.push([p[0] + fn[0] * wv, p[1] + fn[1] * wv]); }
  for (let i = 10; i >= 0; i--) { const t = 0.12 + i * 0.088, p = fpt(t), wv = 9 * Math.sin(Math.PI * Math.min(1, t * 1.05)); vane.push([p[0] - fn[0] * wv, p[1] - fn[1] * wv]); }
  s += P(smooth(vane), A.lin([[0, "#4a4458"], [0.5, "#1c1a22"], [1, "#0f0e13"]], 0, 0, 1, 1), { s: INK, w: 2 });
  for (let i = 1; i < 6; i++) { const p = fpt(0.2 + i * 0.12); s += S(`M${r(p[0])},${r(p[1])} l${r(fn[0] * 7 + 2)},${r(fn[1] * 7 + 3)}`, "#5a5568", 1.2, 0.8); }
  s += S(`M${r(fpt(0.05)[0])},${r(fpt(0.05)[1])} L${r(fpt(0.98)[0])},${r(fpt(0.98)[1])}`, "#d8d4cc", 1.4, 0.9);
  s += fill(A, `M${pk[0]},${pk[1]} L${pk[2]},${pk[1]} L${pk[2] - 2},${pk[3]} L${pk[0] + 2},${pk[3]} Z`, lt(apron, 0.06), { w: 2.4 });
  s += S(`M${pk[0] + 2},${pk[1] + 5} L${pk[2] - 2},${pk[1] + 5}`, dk(apron, 0.3), 1.4, 0.8, { dash: "3 3" });
  // her right hand (viewer's left) holds a seedling in a small pot; soil under her nails
  const soil = "#3b2a1e";
  s += fill(A, `M66,330 L104,318 L122,360 L84,384 Z`, top, { w: 2.6 });                                  // sleeve
  s += S(`M140,316 Q138,302 141,288`, "#3f7a3a", 3) + P(`M141,292 Q128,280 122,286 Q130,296 141,292 Z`, "#6aae5a", { s: INK, w: 1.6 }) + P(`M141,290 Q152,276 160,282 Q152,294 141,290 Z`, "#6aae5a", { s: INK, w: 1.6 });
  s += fill(A, `M122,322 L158,322 L154,356 L126,356 Z`, "#c4693f", { w: 2.4 });                        // terracotta pot
  s += fill(A, `M116,312 L164,312 L163,324 L117,324 Z`, "#d27a4c", { w: 2.4 });
  s += E(140, 314, 20, 3, soil);
  s += shaded(A, smooth([[100, 324], [118, 322], [124, 340], [120, 358], [104, 362], [96, 344]]), skin, { w: 2.4 });   // back of the hand
  for (const [y, len] of [[330, 18], [338, 20], [346, 19], [354, 15]]) {
    s += capsule([[116, y], [116 + len, y + 1]], 7.5, skin, { ow: 4 });
    s += E(116 + len + 0.5, y + 1, 2.6, 2.8, soil);                                                    // soil under the nail
  }
  return svgDoc(A, "coven", s);
}

// ================================================================ THE GUARDIAN

/** Rook in human shape: very tall, very still, long grey coat, grey eyes. */
function rook(A) {
  const skin = "#dbc7b5", hd = { top: 84, chin: 256, hw: 56, jaw: 0.76, chinW: 0.32, cheekY: 156 };
  const coat = "#7b7f86", hair = "#17151b", dy = -4;
  let s = bg(A, "#f1e8d3", "#a39985", 0.35);
  const tD = torsoD({ sw: 138, nw: 24, sy: 292 });
  s += fill(A, tD, coat, { hi: 0.12, lo: 0.3 });
  s += neck(A, skin, 22, 200, 300, hd.chin);
  s += fill(A, `M${CX - 24},258 L${CX + 24},258 L${CX + 30},300 L${CX},346 L${CX - 30},300 Z`, "#232228", { w: 2.4 });   // dark high-necked top
  s += S(`M${CX - 22},262 Q${CX},270 ${CX + 22},262`, "#3a3940", 2);
  // high turned-up collar and wide lapels
  for (const side of [-1, 1]) {
    s += fill(A, smooth([[CX + side * 26, 226, 1], [CX + side * 54, 232], [CX + side * 74, 268], [CX + side * 112, 298], [CX + side * 86, 318], [CX + side * 4, 356, 1], [CX + side * 28, 300], [CX + side * 26, 262]]), side < 0 ? lt(coat, 0.06) : dk(coat, 0.06), { w: 2.8 });
    s += fill(A, smooth([[CX + side * 27, 230, 1], [CX + side * 50, 236], [CX + side * 60, 258], [CX + side * 34, 262, 1]]), dk(coat, 0.32), { w: 2 });   // collar's inside
  }
  s += C(CX, 372, 4.4, "#3a3a40", { s: INK, w: 1.4 });
  s += S(`M${CX - 128},330 Q${CX - 112},360 ${CX - 108},400 M${CX + 128},330 Q${CX + 112},360 ${CX + 108},400`, dk(coat, 0.3), 2, 0.7);
  // head
  s += ears(skin, hd.hw, 172, { rx: 8.5, ry: 15 });
  const hD = headD(hd);
  s += shaded(A, hD, skin, { hi: 0.1, lo: 0.3 });
  s += S(`M152,194 Q160,214 166,222 M248,194 Q240,214 234,222`, dk(skin, 0.18), 3, 0.35);             // cheekbone shadows
  s += face(A, { skin, dy, eyes: { iris: "#9aa4ab", ir: 6.4, h: 12, w: 24 }, brows: { color: hair, tilt: 0, arch: 1, th: 5.5, w: 26 }, nose: { w: 8, len: 30 }, mouth: { kind: "flat", w: 22 } });
  // black hair swept back, the ends ragged like feathers
  const hairD = smooth([[140, 172], [126, 164, 1], [134, 152], [122, 140, 1], [134, 128], [132, 104], [146, 84], [170, 70], [CX, 66], [230, 70], [254, 84], [268, 104],
    [266, 128], [278, 140, 1], [266, 152], [274, 164, 1], [260, 172], [256, 150, 1], [252, 124], [236, 106], [CX, 101], [164, 106], [148, 124], [144, 150, 1]]);
  s += fill(A, hairD, hair, { hi: 0.18, lo: 0.1 });
  s += S(`M176,104 Q166,90 170,76 M200,101 Q194,86 198,70 M224,104 Q232,90 230,76 M152,118 Q144,104 150,92 M248,118 Q256,104 250,92`, "#4d4760", 2.2, 0.85);
  return svgDoc(A, "guardian", s);
}

/** Rook in animal shape: a large black rook, side view facing left (pale bare skin at the beak base). */
function rookBird(A) {
  const black = "#16141a", sheen = "#4a3f66", sheen2 = "#3a4a3e";
  let s = bg(A, "#f7dfa4", "#cf8a68", 0.35);
  // body and wing
  const body = smooth([[176, 172], [150, 214], [132, 268], [136, 330], [160, 400, 1], [400, 400, 1], [372, 320], [330, 262], [296, 222], [268, 178], [262, 140]]);
  s += fill(A, body, black, { hi: 0.1, lo: 0.2 });
  s += P(body, A.lin([[0, sheen, 0.55], [0.5, sheen, 0], [1, sheen2, 0.4]], 0, 0, 1, 1));
  const wing = smooth([[222, 252], [262, 236], [318, 260], [366, 320], [390, 400, 1], [244, 400, 1], [236, 350, 1], [220, 340], [228, 318, 1], [212, 304], [222, 284, 1], [208, 270]]);
  s += fill(A, wing, "#1c1a22", { hi: 0.14, lo: 0.2 });
  s += S(`M250,262 Q300,276 340,330 M236,300 Q290,312 324,360 M232,340 Q270,350 296,392`, sheen, 2.2, 0.8);
  // shaggy throat feathers
  s += P(smooth([[176, 176], [166, 196, 1], [160, 190], [154, 214, 1], [148, 208], [142, 236, 1], [150, 250], [180, 236], [198, 200]]), black, { s: INK, w: 2 });
  // head: peaked crown, steep forehead
  const headP = smooth([[172, 130], [180, 104], [204, 86], [226, 82, 1], [238, 92], [256, 104], [268, 132], [266, 162], [244, 188], [204, 196], [178, 184], [168, 160]]);
  s += fill(A, headP, black, { hi: 0.16, lo: 0.15 });
  s += S(`M190,100 Q212,86 234,90`, "#6a5f88", 2.6, 0.8) + S(`M246,108 Q262,128 262,152`, "#4d5f52", 2.4, 0.6);
  // beak: long, straight and pointed; bare greyish-white skin at its base
  s += P(smooth([[184, 124], [210, 132], [214, 160], [204, 190], [178, 196], [166, 176], [168, 140]]), "#d8d1c6", { s: INK, w: 2.4 });
  s += P(smooth([[188, 132], [200, 140], [198, 160], [190, 176]], false), "none", { s: "#b9b1a5", w: 2 });
  const beak = `M184,124 C150,132 112,150 72,176 C108,170 150,166 182,168 Z`;
  s += P(beak, A.lin([[0, "#5a5a62"], [0.6, "#2c2b31"], [1, "#16151a"]], 0, 0, 1, 1), { s: INK, w: 2.6 });
  s += P(`M182,168 C150,168 110,172 72,176 C110,180 150,186 178,190 Z`, "#232228", { s: INK, w: 2.4 });
  s += S(`M178,134 C150,142 118,156 92,170`, "#8a8a92", 2, 0.8);
  // eye (one visible: side view)
  s += C(222, 132, 8.5, "#2a1d16", { s: INK, w: 2.4 }) + C(222, 132, 4, "#0b0a0d") + C(219, 129, 2.2, "#ffffff", { op: 0.95 });
  s += S(`M212,126 Q222,120 232,126`, "#3a3348", 1.6);
  return svgDoc(A, "guardian", s);
}

// ================================================================ THREATS

/** The Quiet Man: a demon in a grey suit and hat whose face nobody can describe, who steals voices. */
function quietMan(A) {
  const skin = "#b3b1ac", hd = { top: 94, chin: 252, hw: 60, jaw: 0.8, chinW: 0.36 };
  const suit = "#6f7076", hat = "#3c3c43";
  let s = bg(A, "#4b4b57", "#141419", 0.45);
  s += E(200, 330, 260, 40, "#ffffff", { op: 0.05 }) + E(120, 250, 160, 26, "#ffffff", { op: 0.04 });   // fog
  const tD = torsoD({ sw: 142, nw: 26, sy: 294 });
  s += fill(A, tD, suit, { hi: 0.1, lo: 0.3 });
  s += neck(A, skin, 24, 200, 300, hd.chin);
  s += fill(A, `M${CX - 30},270 L${CX + 30},270 L${CX + 16},420 L${CX - 16},420 Z`, "#e6e4df", { w: 2.4 });
  s += fill(A, `M${CX - 7},290 L${CX + 7},290 L${CX + 10},380 L${CX},394 L${CX - 10},380 Z`, "#2b2b31", { w: 2 });
  s += fill(A, `M${CX - 8},281 L${CX + 8},281 L${CX + 6},292 L${CX - 6},292 Z`, "#2b2b31", { w: 2 });
  for (const side of [-1, 1]) s += fill(A, poly([[CX + side * 24, 266], [CX + side * 2, 288], [CX + side * 24, 298], [CX + side * 32, 276]]), "#f1efea", { w: 2 });
  for (const side of [-1, 1]) {
    s += fill(A, poly([[CX + side * 32, 272], [CX + side * 12, 360], [CX + side * 8, 420], [CX + side * 80, 420], [CX + side * 76, 286]]), suit, { w: 2.6, lo: 0.25 });
    s += fill(A, poly([[CX + side * 31, 270], [CX + side * 14, 350], [CX + side * 36, 322], [CX + side * 42, 310], [CX + side * 56, 312], [CX + side * 52, 292], [CX + side * 44, 278]]), lt(suit, 0.08), { w: 2.2 });
  }
  // a stolen voice: an old glass radio valve in his breast pocket, glowing faintly amber
  const vx = 262;
  s += C(vx, 300, 38, A.rad([[0, "#ffc35a", 0.55], [1, "#ffc35a", 0]]));
  s += P(`M${vx - 10},334 L${vx - 10},300 A10,10 0 0 1 ${vx + 10},300 L${vx + 10},334 Z`, "#fff6dd", { op: 0.35 });
  s += S(`M${vx - 5},330 L${vx - 5},304 M${vx + 5},330 L${vx + 5},304 M${vx - 5},312 L${vx + 5},312`, "#8a6a3a", 1.4);
  s += E(vx, 316, 4, 9, "#ffb53e") + E(vx, 316, 2, 5, "#fff2c2");
  s += P(`M${vx - 10},334 L${vx - 10},300 A10,10 0 0 1 ${vx + 10},300 L${vx + 10},334`, "none", { s: INK, w: 2.4 });
  s += S(`M${vx - 6},300 Q${vx - 5},294 ${vx},292`, "#ffffff", 1.6, 0.8);
  s += fill(A, `M${vx - 24},332 L${vx + 24},330 L${vx + 25},340 L${vx - 23},342 Z`, dk(suit, 0.1), { w: 2.2 });
  // head: no mouth, faint features in the shadow of the brim
  s += ears(skin, hd.hw, 180);
  const hD = headD(hd);
  s += shaded(A, hD, skin, { hi: 0.08, lo: 0.3 });
  s += face(A, { skin, eyes: { iris: "#e9e6de", white: "#7c7a77", ir: 3.6, pupil: 0.3, lid: "#5a5856", lidW: 2, h: 10, w: 21 }, brows: { color: "#7d7b77", th: 3.5, arch: 1 }, nose: { w: 7, c: dk(skin, 0.22), op: 0.8 }, mouth: false });
  s += tag("rect", { x: 120, y: 90, width: 160, height: 100, fill: A.lin([[0, "#14141a", 0.6], [0.45, "#14141a", 0.3], [1, "#14141a", 0]]), "clip-path": A.clip(hD) });
  // trilby: a narrow brim and a pinched crown
  s += E(CX, 118, 94, 19, A.lin([[0, lt(hat, 0.12)], [1, dk(hat, 0.3)]]), { s: INK, w: LW, tf: "rotate(-4 200 118)" });
  const crown = smooth([[142, 116, 1], [146, 86], [160, 62], [180, 56], [CX, 66], [220, 56], [240, 62], [254, 86], [258, 112, 1]]);
  s += fill(A, crown, hat, { hi: 0.12, lo: 0.3 });
  s += P(`M144,98 Q200,104 256,96 L257,110 Q200,118 143,113 Z`, "#16161a", { s: INK, w: 2 });
  s += S(`M190,64 Q200,78 210,64`, dk(hat, 0.4), 2);
  return svgDoc(A, "threat", s);
}

/** A tongue of flame rising from (x, base) to height h. */
function flame(A, x, base, h, wdt, lean = 0) {
  const pts = [[x - wdt, base], [x - wdt * 0.8, base - h * 0.35], [x - wdt * 0.2 + lean * 0.4, base - h * 0.62], [x + lean * 0.7 - wdt * 0.25, base - h * 0.8], [x + lean, base - h, 1],
    [x + lean * 0.6 + wdt * 0.3, base - h * 0.72], [x + wdt * 0.55, base - h * 0.5], [x + wdt * 0.9, base - h * 0.28], [x + wdt, base]];
  const g = A.lin([[0, "#ffe07a"], [0.4, "#ff9a2a"], [1, "#c1271c"]], 0, 0, 0, 1);
  return P(smooth(pts), g);
}

/** The Ash Widow: a fire spirit in a burned wedding dress. */
function ashWidow(A) {
  const skin = "#d3c7bd", hd = { top: 96, chin: 250, hw: 58, jaw: 0.8, chinW: 0.36 };
  const dress = "#e8e0d4", hair = "#2e2a2a", ember = "#ff7a26", char = "#2a2321";
  let s = bg(A, "#6a2318", "#140808", 0.55);
  for (const [x, h, w, l] of [[30, 230, 40, 10], [90, 300, 46, -12], [150, 200, 36, 8], [250, 210, 38, -8], [312, 300, 46, 14], [372, 236, 40, -10]]) s += flame(A, x, 420, h, w, l);
  // veil behind her, ragged and charred at the edges
  const veil = smooth([[CX, 76], [246, 80], [290, 128], [312, 200], [324, 250, 1], [312, 262], [334, 300, 1], [320, 314], [346, 350, 1], [336, 420, 1],
    [64, 420, 1], [54, 350, 1], [80, 314], [66, 300, 1], [88, 262], [76, 250, 1], [88, 200], [110, 128], [154, 80]]);
  s += S(veil, char, 7) + S(veil, ember, 2.4);
  s += P(veil, A.lin([[0, "#f6f1ea", 0.85], [1, "#cfc6bc", 0.7]]));
  const tD = torsoD({ sw: 128, nw: 23, sy: 300 });
  s += fill(A, tD, dress, { hi: 0.1, lo: 0.25 });
  s += neck(A, skin, 22, 200, 300, hd.chin);
  // lace neckline
  let lace = "";
  for (let x = CX - 42; x <= CX + 42; x += 12) lace += C(x, 282 + Math.abs(x - CX) * 0.12, 6.5, lt(dress, 0.3), { s: dk(dress, 0.25), w: 1.4 });
  s += P(`M${CX - 46},276 Q${CX},292 ${CX + 46},276 L${CX + 50},300 Q${CX},314 ${CX - 50},300 Z`, dress, { s: dk(dress, 0.25), w: 1.5 }) + lace;
  s += S(`M${CX - 30},330 Q${CX},346 ${CX + 30},330 M${CX},346 L${CX},420`, dk(dress, 0.2), 1.6, 0.8);
  // the dress burned from the bottom up, and at the outer edge of each shoulder: scorch, then char, with a glowing edge
  const rnd = rng(19);
  const tclip = A.clip(tD);
  const burnEdge = (y0, amp) => { const pts = []; for (let x = 20; x <= 380; x += 9) pts.push([x, y0 + (rnd() - 0.5) * amp + (pts.length % 2 ? 5 : -5) - Math.abs(x - CX) * 0.1]); return pts; };
  const scorch = burnEdge(336, 12), charE = scorch.map(([x, y]) => [x, y + 10 + rnd() * 10]);
  const below = pts => poly([...pts, [380, 440], [20, 440]]);
  s += P(below(scorch), A.lin([[0, "#7a4a2a", 0.55], [1, "#3a2418", 0.8]]), { clip: tclip });
  s += P(below(charE), char, { clip: tclip }) + G(S(poly(charE, false), ember, 2.2), { clip: tclip });
  for (const side of [-1, 1]) {
    const sh = poly([[CX + side * 96, 290], [CX + side * 108, 300], [CX + side * 102, 310], [CX + side * 116, 318], [CX + side * 108, 328], [CX + side * 124, 336], [CX + side * 118, 346], [CX + side * 138, 352], [CX + side * 190, 360], [CX + side * 190, 280]]);
    s += P(sh, char, { clip: tclip }) + G(P(sh, "none", { s: ember, w: 2.2 }), { clip: tclip });
  }
  // embers rising
  for (let i = 0; i < 18; i++) s += C(30 + rnd() * 340, 40 + rnd() * 240, 1.4 + rnd() * 1.8, i % 3 ? "#ffb347" : "#ffe08a", { op: 0.85 });
  // hair up in a bun
  s += fill(A, ssym([[CX, 50], [222, 56], [228, 78], [216, 96], [CX, 98]]), hair, { hi: 0.15 });
  s += ears(skin, hd.hw, 182);
  const hD = headD(hd);
  s += shaded(A, hD, skin, { hi: 0.08, lo: 0.3 });
  s += P(`M120,200 L280,200 L280,260 L120,260 Z`, A.lin([[0, ember, 0], [1, ember, 0.3]]), { clip: A.clip(hD) });   // firelight from below
  s += face(A, { skin, eyes: { iris: "#ff8a2a", ir: 5.6, lash: 1, white: "#efe6dc" }, brows: { color: "#3a302c", tilt: 4, th: 4.5, arch: 2 }, nose: { w: 7 }, mouth: { kind: "sad", w: 20, lip: "#9a6a62" } });
  s += S(`M152,152 Q150,190 160,214`, "#3a302c", 2.4, 0.9);   // a loose strand
  const hairD = smooth([[142, 170], [138, 134], [150, 104], [176, 88], [CX, 84], [224, 88], [250, 104], [262, 134], [258, 170],
    [252, 146, 1], [244, 124], [222, 112], [CX, 108, 1], [178, 112], [156, 124], [148, 146, 1]]);
  s += fill(A, hairD, hair, { hi: 0.18 });
  // a band of orange blossom across her hair, half of it burned
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (1.12 + 0.76 * (i / 6)), x = CX + Math.cos(a) * 62, y = 136 + Math.sin(a) * 40;
    const burnt = i % 3 === 2;
    for (let k = 0; k < 5; k++) { const b = k * Math.PI * 0.4; s += C(x + Math.cos(b) * 4.6, y + Math.sin(b) * 4.6, 4.2, burnt ? "#4a403c" : "#fbf8f0", { s: INK, w: 1 }); }
    s += C(x, y, 2.6, burnt ? ember : "#f2c14e");
  }
  return svgDoc(A, "threat", s);
}

/** The Mirror Thief: a thin creature wearing a stolen face, in front of an old mirror. */
function mirrorThief(A) {
  const silver = "#bcc3cc", hd = { top: 84, chin: 258, hw: 55, jaw: 0.72, chinW: 0.3, temple: 0.9, cheekY: 160 };
  const coat = "#1f3d44", stolen = "#e0b18a";
  let s = bg(A, "#3d2c4a", "#120c18", 0.4);
  // the old mirror behind it, cracked
  s += E(CX, 176, 120, 152, A.lin([[0, "#5a6372"], [1, "#1d2129"]], 0, 0, 1, 1));
  s += S(`M270,70 L236,120 L252,150 M236,120 L206,112 M252,150 L300,176 M270,70 L296,110`, "#c9d3dc", 1.6, 0.55);
  s += E(CX, 176, 120, 152, "none", { s: INK, w: 18 }) + E(CX, 176, 120, 152, "none", { s: A.lin([[0, "#f0d27a"], [0.5, "#b88a34"], [1, "#6e4f1c"]], 0, 0, 1, 1), w: 12 });
  s += C(CX, 24, 12, "#c99a3e", { s: INK, w: 2.4 });
  // thin body: long neck, narrow shoulders, dark coat with a high collar
  const tD = torsoD({ sw: 108, nw: 16, ny: 278, sy: 312 });
  s += fill(A, tD, coat, { hi: 0.14, lo: 0.3 });
  s += neck(A, dk(silver, 0.3), 15, 200, 320, hd.chin);
  s += fill(A, poly([[CX - 19, 252], [CX + 19, 252], [CX + 30, 300], [CX - 30, 300]]), dk(coat, 0.15), { w: 2.4 });   // high dark neckcloth
  for (const side of [-1, 1]) s += fill(A, smooth([[CX + side * 18, 262, 1], [CX + side * 42, 254], [CX + side * 54, 300], [CX + side * 4, 360, 1], [CX + side * 20, 304]]), lt(coat, 0.1), { w: 2.4 });
  // its own head: mirror-silver in flat facets like broken glass, no ears, no hair
  const hD = headD(hd);
  const hc = A.clip(hD);
  s += P(hD, silver);
  for (const [pts, c] of [[[[120, 60], [196, 52], [210, 150], [130, 168]], "#dfe4ea"], [[[196, 52], [290, 70], [270, 156], [210, 150]], "#a9b1bb"],
    [[[130, 168], [210, 150], [204, 280], [120, 270]], "#9aa2ad"], [[[210, 150], [270, 156], [270, 280], [204, 280]], "#7f8894"], [[[226, 60], [250, 66], [214, 150], [204, 148]], "#f4f7fa"]]) {
    s += P(poly(pts), c, { clip: hc });
  }
  s += G(S(`M196,52 L210,150 L270,156 M130,168 L210,150 L204,280`, "#eef2f6", 1.4, 0.8), { clip: hc });
  s += P(hD, "none", { s: INK, w: LW });
  // its own eye, peeping out where the stolen face doesn't cover
  s += P(`M231,171 Q242,162 253,168 Q243,178 231,171 Z`, "#14101a", { s: INK, w: 1.4 }) + C(243, 170, 3.2, "#e9e6c4") + C(243, 170, 1.4, "#14101a");
  // the stolen face, pushed askew: a separate mask with a visible pale edge
  const tf = "rotate(-12 200 178) translate(-17 6)";
  const mD = headD({ top: 104, chin: 250, hw: 50, jaw: 0.82, chinW: 0.4, cheekY: 168, temple: 0.92 });
  s += G(P(mD, "#0d0b10", { op: 0.4, tf: "translate(7 4)" }) + P(mD, "#f3dcc4", { s: INK, w: 2.4, tf: "translate(4 2)" }) +
    shaded(A, mD, stolen, { hi: 0.1, lo: 0.22, w: 2.6 }) +
    face(A, { skin: stolen, eyes: { y: 170, dx: 21, w: 21, h: 11, iris: "#6a4a2a", ir: 5.2 }, brows: { color: "#5a3a24", y: 152, dx: 22, w: 21, th: 4.6, arch: 3 }, nose: { y: 200, w: 7, len: 20 }, mouth: { y: 220, w: 22, curve: 6 }, blush: "#e08a7a" }), { tf });
  // long thin silver fingers curled over the edge of the face (its left hand, viewer's right)
  s += fill(A, `M266,250 L288,242 L330,400 L300,400 Z`, coat, { w: 2.4 });                              // sleeve
  const finger = "#c3c7d3";
  s += taper([[266, 246], [256, 256], [244, 258]], 8, 6, finger);                                       // thumb
  for (const f of [[[266, 196], [252, 186], [238, 188], [228, 196]], [[268, 208], [250, 202], [234, 205], [224, 212]], [[268, 220], [250, 218], [236, 222], [228, 229]], [[266, 232], [254, 234], [244, 239], [238, 245]]]) s += taper(f, 8, 5, finger);
  s += shaded(A, smooth([[262, 190], [272, 188], [280, 204], [282, 228], [276, 246], [266, 250], [260, 228]]), finger, { w: 2.4, hi: 0.25, lo: 0.35 });   // back of the hand
  return svgDoc(A, "threat", s);
}

/** The Night Nurse: a creature that feeds on the sleeping sick. Old-fashioned cap and cape, a lily. */
function nightNurse(A) {
  const skin = "#c9c2cc", hd = { top: 96, chin: 252, hw: 59, jaw: 0.8, chinW: 0.38 };
  const cape = "#27304a", uni = "#d8d6cf", hair = "#3e3a40";
  let s = bg(A, "#58695f", "#151d1a", 0.4);
  s += P(`M176,0 L224,0 L236,400 L164,400 Z`, "#d8e6d8", { op: 0.06 });   // light at the end of the corridor
  // the old-fashioned nurse's veil: white cloth over the head, falling behind to the shoulders
  const veil = "#efeee9";
  s += fill(A, ssym([[CX, 70], [244, 74], [276, 104], [290, 150], [294, 220], [304, 286], [312, 330, 1], [CX, 330, 1]]), veil, { hi: 0.1, lo: 0.22 });
  s += S(`M128,160 Q122,230 112,300 M272,160 Q278,230 288,300 M140,130 Q132,200 128,280 M260,130 Q268,200 272,280`, "#bdbcb6", 1.6, 0.8);
  const tD = torsoD({ sw: 140, nw: 25, sy: 294 });
  s += fill(A, tD, uni, { hi: 0.1, lo: 0.25 });
  s += neck(A, skin, 23, 200, 300, hd.chin);
  s += P(`M${CX - 26},268 Q${CX},282 ${CX + 26},268 L${CX + 30},280 Q${CX},296 ${CX - 30},280 Z`, "#f6f5f1", { s: INK, w: 2 });   // white neckline
  // cape, open at the front, fastened with a chain
  for (const side of [-1, 1]) s += fill(A, smooth([[CX + side * 40, 270, 1], [CX + side * 100, 280], [CX + side * 150, 304], [CX + side * 170, 360], [CX + side * 180, 430, 1], [CX + side * 60, 430, 1], [CX + side * 48, 330], [CX + side * 46, 296]]), cape, { w: 2.6, hi: 0.12, lo: 0.3 });
  s += C(CX - 46, 300, 5, "#c9ced4", { s: INK, w: 1.6 }) + C(CX + 46, 300, 5, "#c9ced4", { s: INK, w: 1.6 });
  s += S(`M${CX - 42},302 Q${CX},322 ${CX + 42},302`, "#c9ced4", 2.4);
  // a fob watch hanging from a pin on her bib (her right, viewer's left)
  s += S(`M${CX - 26},326 L${CX - 14},326`, "#c9ced4", 3) + S(`M${CX - 20},326 L${CX - 20},334`, "#c9ced4", 1.6);
  s += C(CX - 20, 343, 9, "#d6dadf", { s: INK, w: 2 }) + C(CX - 20, 343, 6, "#f8f7f2") + S(`M${CX - 20},343 L${CX - 20},347 M${CX - 20},343 L${CX - 23},341`, "#2a2a30", 1.2);
  // a lily pinned to the cape (her left, viewer's right)
  const lx = 266, ly = 326;
  s += S(`M${lx + 4},${ly + 12} Q${lx + 12},${ly + 34} ${lx + 8},${ly + 56}`, "#4f7a46", 4);
  s += P(`M${lx + 8},${ly + 34} Q${lx + 28},${ly + 24} ${lx + 32},${ly + 40} Q${lx + 18},${ly + 44} ${lx + 8},${ly + 34} Z`, "#5f8a52", { s: INK, w: 1.6 });
  for (const a of [-62, 0, 62]) s += P(`M${lx},${ly + 10} Q${lx - 12},${ly - 8} ${lx},${ly - 28} Q${lx + 12},${ly - 8} ${lx},${ly + 10} Z`, "#f8f6ef", { s: INK, w: 1.8, tf: `rotate(${a} ${lx} ${ly + 10})` });
  s += S(`M${lx},${ly + 8} L${lx - 4},${ly - 10} M${lx},${ly + 8} L${lx + 5},${ly - 9}`, "#c9842a", 1.8) + C(lx - 4, ly - 11, 2.2, "#d9902a") + C(lx + 5, ly - 10, 2.2, "#d9902a");
  s += C(lx + 4, ly + 14, 3, "#d0d4d8", { s: INK, w: 1.2 });
  // head: cold grey skin, sunken eyes, a patient smile
  s += ears(skin, hd.hw, 182);
  const hD = headD(hd);
  s += shaded(A, hD, skin, { hi: 0.08, lo: 0.3 });
  s += face(A, {
    skin, under: e => E(CX - e.dx, e.y + 2, 17, 12, "#5e4f68", { op: 0.45 }) + E(CX + e.dx, e.y + 2, 17, 12, "#5e4f68", { op: 0.45 }),
    eyes: { iris: "#dcd8cf", ir: 5.4, pupil: 0.25, white: "#efece6" }, brows: { color: "#5a5560", th: 3.5, tilt: 1, arch: 3 }, nose: { w: 7 }, mouth: { curve: 4, w: 22, lip: "#9c8a96", line: "#5a4b55" },
  });
  const hairD = smooth([[144, 172], [140, 136], [152, 112], [176, 104], [CX, 102], [224, 104], [248, 112], [260, 136], [256, 172], [250, 150, 1], [240, 130], [CX, 122, 1], [160, 130], [150, 150, 1]]);
  s += fill(A, hairD, hair, { hi: 0.18 });
  // the veil's starched band across the forehead (no cross or other emblem)
  s += fill(A, smooth([[134, 118, 1], [148, 100], [CX, 90], [252, 100], [266, 118, 1], [256, 126], [CX, 112], [144, 126]]), "#fbfaf7", { w: 2.6, hi: 0.1, lo: 0.12 });
  return svgDoc(A, "threat", s);
}

/** Vesper Crane: a witch who stole other witches' power. Long coat, rosemary, a chain of small vials. */
function vesper(A) {
  const skin = "#efd2bf", hd = { top: 92, chin: 254, hw: 58, jaw: 0.74, chinW: 0.3, cheekY: 158 };
  const coat = "#43243f", hair = "#cfcbd6";
  let s = bg(A, "#4a3428", "#140d0a", 0.45);
  // library shelves behind her: books standing on the planks
  const rnd = rng(23);
  for (const sy of [118, 246, 374]) {
    let x = 0;
    while (x < 400) {
      const w = 10 + rnd() * 12, h = 70 + rnd() * 34;
      const col = ["#6e2a2a", "#2e4a3a", "#2c3756", "#8a6a32", "#5a3a28", "#4a2a4a"][Math.floor(rnd() * 6)];
      s += P(`M${r(x)},${sy} L${r(x)},${r(sy - h)} L${r(x + w)},${r(sy - h)} L${r(x + w)},${sy} Z`, col, { s: "#120c0a", w: 1.4 });
      s += S(`M${r(x + 2)},${r(sy - h + 12)} L${r(x + w - 2)},${r(sy - h + 12)}`, "#c9a25a", 1.2, 0.6);
      x += w + (rnd() < 0.15 ? 4 : 0);
    }
    s += P(`M0,${sy} L400,${sy} L400,${sy + 10} L0,${sy + 10} Z`, "#3a2618", { s: "#120c0a", w: 1.4 });
  }
  s += tag("rect", { x: 0, y: 0, width: 400, height: 400, fill: A.rad([[0, "#140d0a", 0.25], [1, "#140d0a", 0.75]], 0.5, 0.4, 0.6) });
  s += fill(A, ssym([[CX, 72], [244, 78], [272, 106], [282, 150], [284, 200], [280, 238], [270, 250, 1], [CX, 250, 1]]), hair, { hi: 0.15, lo: 0.4 });   // back of the bob
  const tD = torsoD({ sw: 132, nw: 23, sy: 296 });
  s += fill(A, tD, coat, { hi: 0.14, lo: 0.3 });
  s += neck(A, skin, 22, 200, 300, hd.chin);
  s += fill(A, `M${CX - 30},272 L${CX + 30},272 L${CX + 40},420 L${CX - 40},420 Z`, "#18151a", { w: 2.4 });
  s += S(`M${CX - 22},270 Q${CX},278 ${CX + 22},270`, "#2e2a30", 2);
  for (const side of [-1, 1]) s += fill(A, smooth([[CX + side * 26, 248, 1], [CX + side * 56, 256], [CX + side * 92, 290], [CX + side * 74, 316], [CX + side * 92, 336], [CX + side * 40, 420, 1], [CX + side * 34, 330], [CX + side * 30, 280]]), lt(coat, 0.06), { w: 2.6 });
  // rosemary pinned to her right lapel (viewer's left)
  const rb = [CX - 66, 340], rt = [CX - 50, 290];
  s += S(`M${rb[0]},${rb[1]} L${rt[0]},${rt[1]}`, "#5a4a30", 2.4);
  for (let i = 0; i < 9; i++) { const p = lerp(rb, rt, 0.1 + i * 0.1), side = i % 2 ? 1 : -1; s += E(p[0] + side * 5, p[1] + 1, 6, 2, "#5f8a5a", { s: "#2a3a26", w: 1, tf: `rotate(${side * 30 - 70} ${r(p[0] + side * 5)} ${r(p[1] + 1)})` }); }
  s += C(CX - 61, 325, 2.6, "#d0d4d8", { s: INK, w: 1 });
  // a fine chain with small stoppered vials: other witches' stolen power
  s += S(`M${CX - 23},266 Q${CX},334 ${CX + 23},266`, "#d8c08a", 1.6);
  const cols = ["#d9473f", "#e2b23a", "#5fbf6a", "#9a6ad8", "#e9e4da"];
  [-16, -8, 0, 8, 16].forEach((dx, i) => {
    const x = CX + dx, t = (dx + 23) / 46, y = (1 - t) ** 2 * 266 + 2 * (1 - t) * t * 334 + t * t * 266;
    s += S(`M${x},${r(y)} L${x},${r(y + 4)}`, "#d8c08a", 1.4);
    s += P(`M${x - 2.6},${r(y + 4)} L${x + 2.6},${r(y + 4)} L${x + 2.6},${r(y + 8)} L${x - 2.6},${r(y + 8)} Z`, "#b8915a", { s: INK, w: 0.8 });
    s += P(`M${x - 3.6},${r(y + 8)} L${x + 3.6},${r(y + 8)} L${x + 3.6},${r(y + 20)} A3.6,3.6 0 0 1 ${x - 3.6},${r(y + 20)} Z`, "#ffffff", { op: 0.25 });
    s += P(`M${x - 3.6},${r(y + 13)} L${x + 3.6},${r(y + 13)} L${x + 3.6},${r(y + 20)} A3.6,3.6 0 0 1 ${x - 3.6},${r(y + 20)} Z`, cols[i]);
    s += P(`M${x - 3.6},${r(y + 8)} L${x + 3.6},${r(y + 8)} L${x + 3.6},${r(y + 20)} A3.6,3.6 0 0 1 ${x - 3.6},${r(y + 20)} Z`, "none", { s: INK, w: 1.1 });
    s += S(`M${x - 1.8},${r(y + 10)} L${x - 1.8},${r(y + 19)}`, "#ffffff", 1, 0.7);
  });
  // head: sharp, amber eyes, plum lips, sure of herself
  const hD = headD(hd);
  s += shaded(A, hD, skin, { hi: 0.1, lo: 0.3 });
  s += face(A, { skin, eyes: { iris: "#c8902e", tilt: 1, lash: 1, lidDrop: 1.5 }, brows: { color: "#6e6874", tilt: -1.5, arch: 5.5, th: 4.5, w: 27 }, nose: { w: 7, len: 28 }, mouth: { kind: "smirk", w: 22, curve: 3, lipstick: "#7a2a4a" } });
  // sleek silver bob, parted on her left, swept across the forehead (ears covered)
  const hairD = smooth([[130, 246, 1], [124, 190], [128, 130], [148, 96], [186, 80], [224, 84, 1], [254, 96], [274, 130], [278, 190], [272, 246, 1],
    [258, 246, 1], [255, 200], [252, 160], [244, 130], [224, 104, 1], [196, 114], [170, 128], [154, 150], [149, 196], [145, 246, 1]]);
  s += fill(A, hairD, hair, { hi: 0.25, lo: 0.4 });
  s += S(`M222,90 Q190,96 162,126 M220,98 Q186,112 156,150 M228,90 Q254,104 264,140 M140,150 Q136,196 140,236 M264,170 Q266,204 262,236`, dk(hair, 0.3), 1.8, 0.8);
  return svgDoc(A, "threat", s);
}

/** One drowned villager's face (drawn on the standard head, then scaled into place). */
function ghostFace(A, o) {
  const skin = "#b9d5ca", hair = o.hair ?? "#2c4a48";
  const hd = { top: 92, chin: 250, hw: 58, jaw: 0.8, chinW: 0.38 };
  let s = "";
  if (o.long) s += fill(A, ssym([[CX, 78], [246, 86], [272, 130], [278, 220], [286, 300, 1], [CX, 300, 1]]), hair, { hi: 0.1, lo: 0.3 });
  const hD = headD(hd);
  s += shaded(A, hD, skin, { hi: 0.12, lo: 0.32 });
  s += face(A, { skin, eyes: { iris: "#e4f4ec", white: "#21393b", ir: 3.4, pupil: 0.2, lid: "#14262a" }, brows: { color: "#4a6a66", th: 3.6, tilt: 3, arch: 2 }, nose: { w: 7, c: dk(skin, 0.3) }, mouth: { kind: "o", w: 26, line: "#14262a" } });
  if (o.cap === "bonnet") s += fill(A, smooth([[118, 210, 1], [118, 130], [146, 82], [CX, 66], [254, 82], [282, 130], [282, 210, 1], [262, 206], [254, 140], [226, 110], [CX, 106], [174, 110], [146, 140], [138, 206]]), "#506e6a", { hi: 0.15 });
  else if (o.cap === "flat") s += fill(A, smooth([[132, 132, 1], [146, 92], [CX, 78], [254, 92], [268, 124], [286, 136, 1], [CX, 134], [132, 132, 1]]), "#3c5450", { hi: 0.15 });
  else s += fill(A, smooth([[144, 170], [140, 130], [156, 100], [CX, 88], [244, 100], [260, 130], [256, 170], [248, 140], [224, 118], [CX, 124], [176, 118], [152, 140]]), hair, { hi: 0.12 });
  if (o.strands) s += S(`M150,140 Q144,190 150,240 M250,140 Q258,190 250,236`, hair, 4, 0.9);
  return s;
}

/** The Drowned Choir: ghosts of a village the sea took, singing together. */
function drownedChoir(A) {
  let s = bg(A, "#2f6a6a", "#081619", 0.3);
  for (const [x, w] of [[120, 40], [210, 30], [300, 44]]) s += P(`M${x - w / 2},0 L${x + w / 2},0 L${x + w * 1.6},400 L${x - w * 0.4},400 Z`, "#d8f2e8", { op: 0.06 });
  const rnd = rng(31);
  for (let i = 0; i < 14; i++) s += C(30 + rnd() * 340, 30 + rnd() * 330, 2 + rnd() * 3, "none", { s: "#d8f2e8", w: 1.2, op: 0.5 });
  const place = (cx, cy, sc, o, op) => G(ghostFace(A, o), { tf: `translate(${cx} ${cy}) scale(${sc}) translate(-200 -170)`, op });
  s += place(104, 112, 0.46, { cap: "flat" }, 0.55) + place(296, 108, 0.46, { long: true, strands: true }, 0.55);
  s += place(86, 214, 0.56, { cap: "bonnet" }, 0.75) + place(314, 214, 0.56, { strands: true, hair: "#3a5450" }, 0.75);
  s += tag("rect", { x: 0, y: 0, width: 400, height: 400, fill: "#0e2a2c", opacity: 0.25 });
  // lead singer in front, with a shawl
  const shawl = "#3f5f5a";
  const front = G(fill(A, ssym([[CX, 78], [246, 86], [274, 130], [282, 220], [292, 300, 1], [CX, 300, 1]]), "#28423f", { hi: 0.1 }) +
    fill(A, torsoD({ sw: 128, nw: 23, sy: 300 }), "#6f8a86", { hi: 0.1 }) + neck(A, "#b9d5ca", 22, 200, 300, 250) +
    fill(A, smooth([[CX - 64, 276], [CX, 300], [CX + 64, 276], [CX + 150, 320], [CX + 160, 440, 1], [CX - 160, 440, 1], [CX - 150, 320]]), shawl, { hi: 0.12 }) +
    S(`M${CX - 60},300 Q${CX},340 ${CX + 60},300 M${CX - 90},330 Q${CX},380 ${CX + 90},330`, dk(shawl, 0.35), 2, 0.8) +
    ghostFace(A, { strands: true, hair: "#28423f" }), { tf: "translate(0 26)" });
  s += front;
  return svgDoc(A, "threat", s);
}

// ================================================================ PEOPLE (Episode 1, and a stand-in)

/** Grace Ellery: the late-show host on Radio Larkhaven; brash, kind, famous voice. */
function grace(A) {
  const skin = "#a46e4d", hd = { top: 94, chin: 252, hw: 62, jaw: 0.82, chinW: 0.4 };
  const hair = "#2a1a12", jacket = "#9b5a2f";
  let s = bg(A, "#f2d2df", "#a3668b");
  const back = [...cloud(CX, 176, 90, 100, 1.75, 7.68, 0.22, 16, 9), [CX, 120, 66], [150, 170, 46], [250, 170, 46], [140, 236, 36], [260, 236, 36], [CX, 230, 50]];
  s += curlMass(A, back, hair, 9, { n: 110, hi: 0.3 });
  const tD = torsoD({ sw: 140, nw: 25, sy: 296 });
  s += fill(A, tD, jacket, { hi: 0.15, lo: 0.3 });
  s += neck(A, skin, 24, 200, 300, hd.chin);
  s += fill(A, `M${CX - 36},274 Q${CX},300 ${CX + 36},274 L${CX + 44},420 L${CX - 44},420 Z`, "#232025", { w: 2.4 });
  for (const side of [-1, 1]) s += fill(A, smooth([[CX + side * 34, 262, 1], [CX + side * 72, 270], [CX + side * 96, 300], [CX + side * 70, 314], [CX + side * 84, 334], [CX + side * 44, 420, 1], [CX + side * 40, 320], [CX + side * 36, 286]]), lt(jacket, 0.08), { w: 2.6 });
  s += S(`M${CX + 58},340 L${CX + 60},420`, "#d9c08a", 2) + S(`M${CX - 112},330 Q${CX - 96},360 ${CX - 92},400`, dk(jacket, 0.35), 2, 0.8);
  s += ears(skin, hd.hw, 182);
  const hD = headD(hd);
  s += shaded(A, hD, skin, { hi: 0.12, lo: 0.3 });
  s += S(`M174,214 Q168,222 171,230 M226,214 Q232,222 229,230`, dk(skin, 0.25), 1.5, 0.45);   // smile lines
  s += face(A, { skin, eyes: { iris: "#3b2216", lash: 1, tilt: 1 }, brows: { color: hair, tilt: -0.5, arch: 4.5, th: 5 }, nose: { w: 9 }, mouth: { kind: "grin", w: 28, curve: 5, lipstick: "#b8323f" } });
  s += curlMass(A, [[150, 130, 15], [166, 112, 16], [190, 102, 17], [214, 102, 17], [238, 112, 16], [254, 132, 14], [CX, 86, 24], [166, 90, 18], [236, 90, 18]], hair, 13, { n: 34, ow: 2.6, hi: 0.3 });
  // studio headphones
  s += S(`M128,190 C122,90 278,90 272,190`, INK, 16) + S(`M128,190 C122,90 278,90 272,190`, "#3d3d45", 10) + S(`M140,130 C160,96 240,96 260,130`, "#6a6a74", 2.2, 0.8);
  for (const side of [-1, 1]) {
    const x = CX + side * 70;
    s += P(`M${x - 15},170 Q${x - 15},158 ${x - 3},158 L${x + 3},158 Q${x + 15},158 ${x + 15},170 L${x + 15},204 Q${x + 15},216 ${x + 3},216 L${x - 3},216 Q${x - 15},216 ${x - 15},204 Z`, A.lin([[0, "#4a4a52"], [1, "#1c1c22"]], 0, 0, 1, 1), { s: INK, w: 2.6 });
    s += E(x + side * 3, 187, 6, 17, "#e8a33a", { s: INK, w: 1.6 });
  }
  return svgDoc(A, "person", s);
}

/** Bea Santos: sings with her guitar on the steps of St Bride's every Friday; lost her voice. */
function bea(A) {
  const skin = "#c78e5d", hd = { top: 96, chin: 250, hw: 60, jaw: 0.8, chinW: 0.4 };
  const hair = "#2b1a13", hat = "#b5482e", jacket = "#6c7040", wood = "#d49a52";
  let s = bg(A, "#3d3a6c", "#121024", 0.35);
  // a string of fairy lights behind her, sagging between the frame edges
  s += S(`M0,64 Q200,150 400,70`, "#1a1830", 2);
  const col = ["#ffd27a", "#ff9f7a", "#fff1c9", "#ffc35a"];
  for (let i = 1; i < 12; i++) {
    const t = i / 12, x = 400 * t, y = (1 - t) ** 2 * 64 + 2 * (1 - t) * t * 150 + t * t * 70;
    s += C(x, y + 6, 12, A.rad([[0, col[i % 4], 0.5], [1, col[i % 4], 0]])) + C(x, y + 5, 4.2, col[i % 4], { s: "#1a1830", w: 1.2 });
  }
  // guitar on her back: the neck rises over her right shoulder (viewer's left)
  s += P(`M128,320 L104,190 L118,187 L144,316 Z`, A.lin([[0, lt(wood, 0.15)], [1, dk(wood, 0.2)]], 0, 0, 1, 0), { s: INK, w: 2.6 });
  s += P(`M100,194 L92,128 L118,124 L124,190 Z`, wood, { s: INK, w: 2.6 });
  for (let i = 0; i < 3; i++) { s += C(89, 140 + i * 17, 4.4, "#e9e4d8", { s: INK, w: 1.6 }) + C(121, 137 + i * 17, 4.4, "#e9e4d8", { s: INK, w: 1.6 }); }
  // long dark wavy hair
  s += fill(A, smooth([[CX, 84], [252, 92], [280, 140], [288, 210], [300, 270], [292, 330], [264, 340, 1], [CX, 330, 1], [136, 340, 1], [108, 330], [100, 270], [112, 210], [120, 140], [148, 92]]), hair, { hi: 0.12 });
  const tD = torsoD({ sw: 134, nw: 24, sy: 300 });
  s += fill(A, tD, jacket, { hi: 0.14, lo: 0.3 });
  s += P(tD, A.pattern(S("M2,0 L2,6", dk(jacket, 0.25), 1.2, 0.6), 5, 6), { clip: A.clip(tD) });   // corduroy
  s += neck(A, skin, 23, 200, 300, hd.chin);
  s += fill(A, `M${CX - 32},276 L${CX + 32},276 L${CX + 40},420 L${CX - 40},420 Z`, "#d9d2c2", { w: 2.4 });
  // guitar strap across her chest, right shoulder to left hip
  s += P(`M118,292 L142,282 L306,420 L276,420 Z`, "#6a4128", { s: INK, w: 2.4 });
  s += S(`M126,292 L284,420 M138,286 L298,420`, "#c99a6a", 1.2, 0.8, { dash: "4 3" });
  // front locks over the shoulders
  s += fill(A, smooth([[146, 200], [138, 250], [128, 300], [140, 330], [156, 300], [160, 250], [158, 210]]), hair, { hi: 0.15 });
  s += fill(A, smooth([[254, 200], [262, 250], [272, 300], [260, 330], [244, 300], [240, 250], [242, 210]]), hair, { hi: 0.15 });
  // scarf snug round her throat
  s += fill(A, smooth([[CX - 34, 254], [CX, 262], [CX + 34, 254], [CX + 40, 276], [CX, 290], [CX - 40, 276]]), "#efe6d2", { w: 2.4 });
  s += S(`M${CX - 30},266 Q${CX},278 ${CX + 30},266`, "#c9bfa8", 1.6);
  s += ears(skin, hd.hw, 182);
  const hD = headD(hd);
  s += shaded(A, hD, skin, { hi: 0.12, lo: 0.3 });
  s += face(A, { skin, dy: 4, eyes: { iris: "#3e2618", lash: 1 }, brows: { color: hair, tilt: 4, th: 5, arch: 2 }, nose: { w: 8 }, mouth: { kind: "flat", w: 18 }, blush: "#d9776a" });
  // beanie with a folded, ribbed band
  s += fill(A, smooth([[134, 132, 1], [136, 96], [160, 70], [CX, 60], [240, 70], [264, 96], [266, 132, 1]]), hat, { hi: 0.15 });
  s += fill(A, smooth([[128, 120, 1], [CX, 112], [272, 120, 1], [272, 142, 1], [CX, 136], [128, 142, 1]]), dk(hat, 0.08), { w: 2.6 });
  let ribs = "";
  for (let x = 136; x <= 266; x += 8) ribs += `M${x},${r(118 + Math.abs(x - CX) * 0.05)} L${x},${r(138 + Math.abs(x - CX) * 0.05)}`;
  s += S(ribs, dk(hat, 0.3), 1.2, 0.7);
  return svgDoc(A, "person", s);
}

/** Hannah Price (Episode 2): a firefighter at the Old Town station, marrying Jess next Saturday. */
function hannah(A) {
  const skin = "#8d5b3d", hd = { top: 94, chin: 252, hw: 61, jaw: 0.82, chinW: 0.4 };
  const tunic = "#c69d52", hair = "#24170f", helmet = "#f0c22e", navy = "#26314a";
  const hiVis = "#d9e04c", silverB = "#dfe3e7";
  let s = bg(A, "#a9c8da", "#2c5269");
  const tD = torsoD({ sw: 148, nw: 26, sy: 294 });
  const tc = A.clip(tD);
  s += fill(A, tD, tunic, { hi: 0.15, lo: 0.3 });
  // reflective bands: across the chest and down each upper arm
  s += G(P(`M0,350 L400,350 L400,374 L0,374 Z`, hiVis) + P(`M0,355 L400,355 L400,369 L0,369 Z`, silverB) +
    P(`M38,300 L62,296 L76,420 L50,420 Z`, hiVis) + P(`M43,302 L57,300 L70,420 L56,420 Z`, silverB) +
    P(`M362,300 L338,296 L324,420 L350,420 Z`, hiVis) + P(`M357,302 L343,300 L330,420 L344,420 Z`, silverB), { clip: tc });
  s += G(S(`M0,350 L400,350 M0,374 L400,374`, INK, 1.6, 0.6), { clip: tc });
  s += neck(A, skin, 24, 200, 300, hd.chin);
  s += fill(A, `M${CX - 30},274 L${CX + 30},274 L${CX + 18},334 L${CX - 18},334 Z`, navy, { w: 2.4 });   // navy T-shirt in the open collar
  // her engagement ring, on a chain round her neck while she's on duty
  s += S(`M${CX - 20},274 L${CX - 1},312 M${CX + 20},274 L${CX + 1},312`, "#e2c05a", 1.6);
  s += C(CX, 318, 6, "none", { s: INK, w: 4.2 }) + C(CX, 318, 6, "none", { s: "#e8c55a", w: 2.4 }) + C(CX, 311, 2.2, "#ffffff", { s: INK, w: 0.8 });
  // tunic collar and front edges
  for (const side of [-1, 1]) {
    s += fill(A, smooth([[CX + side * 24, 254, 1], [CX + side * 44, 258], [CX + side * 52, 276], [CX + side * 32, 300], [CX + side * 20, 340, 1], [CX + side * 26, 290]]), lt(tunic, 0.08), { w: 2.6 });
  }
  s += S(`M${CX},340 L${CX},420`, dk(tunic, 0.35), 2.4);
  // head
  s += ears(skin, hd.hw, 182);
  const hD = headD(hd);
  s += shaded(A, hD, skin, { hi: 0.12, lo: 0.3 });
  s += face(A, { skin, eyes: { iris: "#3a2316", lash: 1 }, brows: { color: hair, tilt: -0.5, arch: 4, th: 5.2 }, nose: { w: 9 }, mouth: { kind: "grin", w: 28, curve: 5 } });
  // dark hair showing under the helmet at the temples
  for (const side of [-1, 1]) s += fill(A, smooth([[CX + side * 64, 140], [CX + side * 50, 136], [CX + side * 54, 160], [CX + side * 64, 172]]), hair, { w: 2 });
  // helmet: yellow dome, raised centre ridge, smoked visor folded up, reflective band, chin strap
  s += S(`M138,142 Q142,214 162,242 Q182,258 ${CX},258 Q218,258 238,242 Q258,214 262,142`, "#2a2a30", 3);
  const dome = smooth([[119, 168, 1], [117, 120], [130, 84], [160, 62], [CX, 54], [240, 62], [270, 84], [283, 120], [281, 168, 1], [268, 162], [263, 142], [248, 132], [CX, 126], [152, 132], [137, 142], [132, 162]]);
  s += fill(A, dome, helmet, { hi: 0.25, lo: 0.25 });
  s += G(P(`M110,140 Q${CX},120 290,140 L290,156 Q${CX},136 110,156 Z`, silverB) + S(`M110,140 Q${CX},120 290,140 M110,156 Q${CX},136 290,156`, dk(helmet, 0.2), 3), { clip: A.clip(dome) });
  s += P(`M${CX - 7},57 L${CX + 7},57 L${CX + 6},124 L${CX - 6},124 Z`, lt(helmet, 0.2), { s: dk(helmet, 0.35), w: 1.8 });
  s += P(`M142,108 Q${CX},80 258,108 L252,122 Q${CX},100 148,122 Z`, "#56606c", { s: INK, w: 2.2 });   // smoked visor, folded up
  s += S(`M156,106 Q178,94 198,91`, "#ffffff", 2.2, 0.55);
  s += P(dome, "none", { s: INK, w: LW });
  return svgDoc(A, "person", s);
}

/** Finn Marlow (Episode 3): twelve, sings in the Hillside School choir, shy with adults, always humming. A child, not a small adult. */
function finn(A) {
  // child proportions: a big rounded head on narrow shoulders and a thin neck, eyes low and large, a small nose and mouth
  const skin = "#f2d5bf", hd = { top: 86, chin: 246, hw: 66, jaw: 0.86, chinW: 0.5, temple: 0.94, cheekY: 174 };
  const jumper = "#7a2e3a", hair = "#8a6440", shirtC = "#f4f2ec";
  let s = bg(A, "#ded3ee", "#8274ab");
  const tD = torsoD({ sw: 112, nw: 18, ny: 268, sy: 302 });
  s += fill(A, tD, jumper, { hi: 0.14, lo: 0.3 });
  s += P(tD, A.pattern(S("M0,3 L6,3", dk(jumper, 0.2), 1, 0.5), 6, 6), { clip: A.clip(tD) });   // knit texture
  s += neck(A, skin, 17, 200, 300, hd.chin);
  // school shirt and tie in the jumper's V-neck
  s += fill(A, `M${CX - 26},268 L${CX + 26},268 L${CX + 6},330 L${CX - 6},330 Z`, shirtC, { w: 2.2 });
  s += fill(A, `M${CX - 6},286 L${CX + 6},286 L${CX + 8},330 L${CX - 8},330 Z`, "#27365a", { w: 1.8 });
  s += S(`M${CX - 6},300 L${CX + 6},296 M${CX - 7},314 L${CX + 7},310`, "#d9b04a", 2);
  s += fill(A, `M${CX - 7},278 L${CX + 7},278 L${CX + 6},288 L${CX - 6},288 Z`, "#27365a", { w: 1.8 });
  for (const side of [-1, 1]) s += fill(A, poly([[CX + side * 18, 262], [CX + side * 3, 282], [CX + side * 22, 290], [CX + side * 28, 270]]), shirtC, { w: 2 });
  for (const side of [-1, 1]) s += fill(A, poly([[CX + side * 30, 270], [CX + side * 4, 340], [CX + side * 2, 420], [CX + side * 50, 420], [CX + side * 50, 276]]), jumper, { w: 2.4, lo: 0.25 });
  s += S(`M${CX - 30},272 L${CX - 3},336 M${CX + 30},272 L${CX + 3},336`, dk(jumper, 0.3), 3);
  // choir badge with a music note (his left chest, viewer's right)
  const bx = CX + 62, by = 334;
  s += C(bx, by, 12, "#d9b04a", { s: INK, w: 2.2 }) + C(bx, by, 8.5, "#27365a");
  s += E(bx - 2, by + 3.5, 3, 2.3, "#ffffff", { tf: `rotate(-20 ${bx - 2} ${by + 3.5})` }) + S(`M${bx + 0.8},${by + 3} L${bx + 0.8},${by - 6} Q${bx + 4},${by - 4} ${bx + 4.5},${by - 1}`, "#ffffff", 1.6);
  // head
  s += ears(skin, hd.hw, 188, { rx: 11, ry: 17 });
  const hD = headD(hd);
  s += shaded(A, hD, skin, { hi: 0.1, lo: 0.22 });
  s += face(A, { skin, eyes: { y: 186, dx: 27, w: 26, h: 14, ir: 7.4, iris: "#7a6a3c", look: -2.2 }, brows: { color: dk(hair, 0.25), y: 165, th: 3.8, arch: 3, tilt: 1.5, w: 22 },
    nose: { y: 212, w: 6, len: 14, bridge: false }, mouth: { y: 228, w: 15, curve: 2.5 }, blush: "#eb9a8a" });
  // untidy mop of mousy hair, ragged fringe, a tuft at the crown
  const hairD = smooth([[132, 184], [125, 146], [133, 108], [156, 80], [186, 66], [214, 64], [244, 74], [266, 98], [276, 134], [272, 184],
    [265, 176, 1], [262, 150], [252, 140], [246, 160, 1], [238, 140], [224, 134], [218, 156, 1], [208, 136], [194, 132], [188, 152, 1], [178, 134], [166, 132], [160, 150, 1], [150, 138], [142, 150], [140, 176, 1]]);
  s += fill(A, hairD, hair, { hi: 0.22, lo: 0.3 });
  s += P(`M196,68 Q186,48 204,42 Q200,54 212,64 Z`, hair, { s: INK, w: 2.2 });
  s += S(`M170,86 Q190,74 214,76 M150,112 Q166,96 186,94 M226,90 Q246,94 258,112`, lt(hair, 0.3), 2.2, 0.8);
  return svgDoc(A, "person", s);
}

/** A plain stand-in for any extra person. */
function bystander(A) {
  const skin = "#cfa585", hd = { top: 94, chin: 250, hw: 62 };
  const coat = "#b5a487", hair = "#6b4a32";
  let s = bg(A, "#e3e9df", "#93a592");
  const tD = torsoD({ sw: 140, nw: 25, sy: 296 });
  s += fill(A, tD, coat, { hi: 0.12, lo: 0.28 });
  s += neck(A, skin, 24, 200, 300, hd.chin);
  s += fill(A, smooth([[CX - 40, 262], [CX, 274], [CX + 40, 262], [CX + 48, 288], [CX, 302], [CX - 48, 288]]), "#5f7488", { w: 2.4 });
  s += fill(A, `M${CX + 14},294 L${CX + 34},292 L${CX + 38},370 L${CX + 18},372 Z`, "#5f7488", { w: 2.2 });
  for (const side of [-1, 1]) s += fill(A, smooth([[CX + side * 44, 278, 1], [CX + side * 90, 290], [CX + side * 100, 320], [CX + side * 64, 330, 1], [CX + side * 50, 300]]), lt(coat, 0.08), { w: 2.4 });
  s += ears(skin, hd.hw, 180);
  const hD = headD(hd);
  s += shaded(A, hD, skin, { hi: 0.1, lo: 0.28 });
  s += face(A, { skin, eyes: { style: "dot" }, brows: { color: dk(hair, 0.3), th: 4.5, arch: 2 }, nose: { w: 8, bridge: false }, mouth: { kind: "flat", w: 18 } });
  const hairD = smooth([[140, 162], [136, 128], [152, 98], [178, 84], [CX, 82], [222, 84], [248, 98], [264, 128], [260, 162], [254, 140, 1], [246, 120], [214, 112], [CX, 116], [170, 112], [154, 124], [146, 140, 1]]);
  s += fill(A, hairD, hair, { hi: 0.18 });
  return svgDoc(A, "person", s);
}

// ---------------------------------------------------------------- the list
const TOKENS = [
  ["dana-okafor", dana], ["marco-rossi", marco], ["june-takeda", june], ["quinn-abernathy", quinn], ["tess-lindqvist", tess], ["noor-haddad", noor],
  ["rook", rook], ["rook-bird", rookBird],
  ["quiet-man", quietMan], ["ash-widow", ashWidow], ["mirror-thief", mirrorThief], ["night-nurse", nightNurse], ["vesper-crane", vesper], ["drowned-choir", drownedChoir],
  ["grace-ellery", grace], ["bea-santos", bea], ["hannah-price", hannah], ["finn-marlow", finn],
  ["bystander", bystander],
];

// ---------------------------------------------------------------- render
const PY_CONVERT = String.raw`
import sys, os
from PIL import Image, ImageDraw
png_dir, dest = sys.argv[1], sys.argv[2]
slugs = sys.argv[3:]
size = 400
# hard circular alpha so nothing outside the ring survives (soft 1px edge)
big = Image.new("L", (size * 4, size * 4), 0)
ImageDraw.Draw(big).ellipse((0, 0, size * 4 - 1, size * 4 - 1), fill=255)
circle = big.resize((size, size), Image.LANCZOS)
for slug in slugs:
    im = Image.open(os.path.join(png_dir, slug + ".png")).convert("RGBA").resize((size, size), Image.LANCZOS)
    a = Image.composite(im.getchannel("A"), Image.new("L", (size, size), 0), circle)
    im.putalpha(a)
    im.save(os.path.join(dest, slug + ".webp"), "WEBP", quality=85, method=6)
    print("wrote", os.path.join(dest, slug + ".webp"))
`;

const PY_SHEET = String.raw`
import sys, os
from PIL import Image, ImageDraw, ImageFont
dest, out = sys.argv[1], sys.argv[2]
slugs = sys.argv[3:]
font = ImageFont.load_default(size=13)
cols = 6
cell_w, cell_h = 250, 150
rows = (len(slugs) + cols - 1) // cols
sheet = Image.new("RGBA", (cols * cell_w, rows * cell_h), (38, 38, 43, 255))
d = ImageDraw.Draw(sheet)
for i, slug in enumerate(slugs):
    im = Image.open(os.path.join(dest, slug + ".webp")).convert("RGBA")
    x0, y0 = (i % cols) * cell_w, (i // cols) * cell_h
    d.rectangle((x0 + 150, y0, x0 + cell_w - 1, y0 + cell_h - 1), fill=(232, 228, 218, 255))
    sheet.alpha_composite(im.resize((100, 100), Image.LANCZOS), (x0 + 12, y0 + 10))
    sheet.alpha_composite(im.resize((50, 50), Image.LANCZOS), (x0 + 160, y0 + 10))
    sheet.alpha_composite(im.resize((72, 72), Image.LANCZOS), (x0 + 166, y0 + 66))
    d.text((x0 + 12, y0 + 120), slug, fill=(235, 235, 235, 255), font=font)
sheet.save(out)
print("wrote", out)
`;

function python(code, args) {
  const res = spawnSync("python3", ["-c", code, ...args], { encoding: "utf8" });
  if (res.status !== 0) throw new Error(`python failed:\n${res.stderr}`);
  process.stdout.write(res.stdout);
}

async function main() {
  const args = process.argv.slice(2);
  const noSheet = args.includes("--no-sheet");
  const want = args.filter(a => !a.startsWith("--"));
  const unknown = want.filter(w => !TOKENS.some(([s]) => s === w));
  if (unknown.length) throw new Error(`unknown slug(s): ${unknown.join(", ")}\nknown: ${TOKENS.map(([s]) => s).join(", ")}`);
  const list = want.length ? TOKENS.filter(([s]) => want.includes(s)) : TOKENS;

  for (const dir of [join(OUT, "svg"), join(OUT, "png"), DEST]) mkdirSync(dir, { recursive: true });
  const browser = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 400, height: 400 }, deviceScaleFactor: 2 });
    for (const [slug, draw] of list) {
      const svg = draw(new Art(slug));
      writeFileSync(join(OUT, "svg", `${slug}.svg`), svg);
      await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>${svg}</body></html>`);
      await page.screenshot({ path: join(OUT, "png", `${slug}.png`), omitBackground: true, clip: { x: 0, y: 0, width: 400, height: 400 } });
    }
  } finally {
    await browser.close();
  }
  python(PY_CONVERT, [join(OUT, "png"), DEST, ...list.map(([s]) => s)]);
  if (!noSheet) {
    const all = TOKENS.map(([s]) => s).filter(s => existsSync(join(DEST, `${s}.webp`)));
    python(PY_SHEET, [DEST, join(OUT, "contact-sheet.png"), ...all]);
  }
  const extra = readdirSync(DEST).filter(f => f.endsWith(".webp") && !TOKENS.some(([s]) => `${s}.webp` === f));
  if (extra.length) console.warn(`note: assets/tokens has files this script doesn't make: ${extra.join(", ")}`);
}

await main();
