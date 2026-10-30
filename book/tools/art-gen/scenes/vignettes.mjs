// TEMP TEST ART for the Witch & Ward rulebook: the three part-page pieces, the
// sixteen chapter vignettes and the end-of-chapter spots.
//
//   node book/tools/art-gen/scenes/vignettes.mjs              every piece
//   node book/tools/art-gen/scenes/vignettes.mjs vignette-ch03 spot-garage   just these
//
// The art direction is undecided: this is test art in the shared style of the
// Foundry art already made for the game (tools/vtt-art/tokens.mjs, maps.mjs):
// flat, hand-built vector shapes, soft gradients, a dark ink outline. Night-time
// Larkhaven. Palette: night navy and slate, lamp gold, coven violet (#7b5bc4),
// guardian brass (#c29a45), danger red (#b5473f), calm green (#3f7f58) used
// sparingly. Coven members match their tokens (looks from docs/CONTENT.md and
// book chapter 13), with every asymmetric feature on the correct side (never a
// mirror-flip): see book/art/ART-LOG.md for the reference notes and the
// object and character tables.
//
// Shapes: part pages 900×300 (3:1). Chapter vignettes 1185×300, the exact shape of
// the 1.8in-tall .chapter-art box at full text width, so the art fills it. Spots
// 800×600 (4:3). Every SVG has a viewBox only (the CSS sizes it), a <title>, and
// no <image>, <script>, filters or external links. Nothing here may echo the TV
// show the game is loosely based on (AGENTS.md, docs/DESIGN.md §2).
import { save, setPrefix, uid } from "../lib.mjs";

// =============================================================== colour
const hex2rgb = h => { h = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
const rgb2hex = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const mix = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(A.map((v, i) => v + (B[i] - v) * t)); };
const dk = (c, t) => mix(c, "#000000", t);
const lt = (c, t) => mix(c, "#ffffff", t);

/** The test palette (book/art/README.md lists it). Tints and shades of these only. */
const K = {
  ink: "#22191f",
  // night sky and shadow
  n0: "#0e1324", n1: "#161d36", n2: "#212b4b", n3: "#32406a", n4: "#4a5a86",
  slate: "#4e5a74", slate2: "#6f7a92", fog: "#a9b2c6",
  // lamp light
  gold: "#f2c14e", lamp: "#ffdf94", glow: "#ffe9b8", amber: "#e0913a",
  // the four role colours (same as the token rings)
  violet: "#7b5bc4", violetHi: "#c3aef0", violetLo: "#48308a",
  brass: "#c29a45", brassHi: "#f0d999", brassLo: "#7f5f24",
  red: "#b5473f", redHi: "#e8857a", redLo: "#6e2222",
  green: "#3f7f58", greenHi: "#8cc9a0", greenLo: "#24503a",
  // materials
  brick: "#6a443c", brickD: "#4a2f2b", stone: "#7d786f", stoneD: "#55524c",
  wood: "#8a6243", woodD: "#5b3f28", woodL: "#b58a5e",
  paper: "#efe6d2", paperD: "#d6c9ad", slateRoof: "#3a4152",
  water: "#1a2b4a", waterD: "#101c33",
  fire: "#ff8a2e", fireHi: "#ffd27a",
};
const INK = K.ink;

// =============================================================== svg basics
const r = v => Math.round(v * 100) / 100;
const pt = p => `${r(p[0])},${r(p[1])}`;
const poly = (pts, close = true) => "M" + pts.map(pt).join("L") + (close ? "Z" : "");
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

function at(o) {
  let s = "";
  if (o.s) s += ` stroke="${o.s}" stroke-width="${r(o.w ?? 2)}" stroke-linejoin="round" stroke-linecap="${o.cap ?? "round"}"`;
  if (o.dash) s += ` stroke-dasharray="${o.dash}"`;
  if (o.op != null) s += ` opacity="${o.op}"`;
  if (o.fop != null) s += ` fill-opacity="${o.fop}"`;
  if (o.clip) s += ` clip-path="${o.clip}"`;
  if (o.tf) s += ` transform="${o.tf}"`;
  if (o.fr) s += ` fill-rule="${o.fr}"`;
  return s;
}
const P = (d, f = "none", o = {}) => `<path d="${d}" fill="${f}"${at(o)}/>`;
const S = (d, s = INK, w = 2, o = {}) => P(d, "none", { s, w, ...o });
const E = (cx, cy, rx, ry, f, o = {}) => `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(rx)}" ry="${r(ry)}" fill="${f}"${at(o)}/>`;
const C = (cx, cy, rr, f, o = {}) => `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(rr)}" fill="${f}"${at(o)}/>`;
const R = (x, y, w, h, f, o = {}) => `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}"${o.rx ? ` rx="${r(o.rx)}"` : ""} fill="${f}"${at(o)}/>`;
const G = (inner, o = {}) => `<g${at(o)}>${inner}</g>`;

/** Smooth path through points (Catmull-Rom). A point [x, y, 1] is a sharp corner. */
function sm(pts, closed = true, k = 1) {
  const n = pts.length, A = i => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M${pt(pts[0])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = A(i - 1), p1 = A(i), p2 = A(i + 1), p3 = A(i + 2);
    const c1 = p1[2] ? p1 : [p1[0] + (p2[0] - p0[0]) * k / 6, p1[1] + (p2[1] - p0[1]) * k / 6];
    const c2 = p2[2] ? p2 : [p2[0] - (p3[0] - p1[0]) * k / 6, p2[1] - (p3[1] - p1[1]) * k / 6];
    d += `C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return closed ? d + "Z" : d;
}
/** Mirror a right half (x ≥ 0, listed top to bottom) into a whole closed loop. */
const symm = (right, cx = 0) => [...right, ...right.slice(1, -1).reverse().map(([x, y, c]) => [2 * cx - x, y, c])];

/** Seeded PRNG (mulberry32): the same seed always draws the same picture. */
function rng(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- per-piece defs (gradients, clips), with ids from lib.mjs's uid()
let DEFS = [], GCACHE = new Map();
function begin(name) { setPrefix(name.replace(/[^a-z0-9]/gi, "")); DEFS = []; GCACHE = new Map(); }
const stops = list => list.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ""}/>`).join("");
function lin(list, x1 = 0, y1 = 0, x2 = 0, y2 = 1, user = false) {
  const key = "l" + JSON.stringify([list, x1, y1, x2, y2, user]);
  if (GCACHE.has(key)) return GCACHE.get(key);
  const id = uid("g");
  DEFS.push(`<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${user ? ` gradientUnits="userSpaceOnUse"` : ""}>${stops(list)}</linearGradient>`);
  GCACHE.set(key, `url(#${id})`);
  return `url(#${id})`;
}
function rad(list, cx = 0.5, cy = 0.5, rr = 0.5, user = false) {
  const key = "r" + JSON.stringify([list, cx, cy, rr, user]);
  if (GCACHE.has(key)) return GCACHE.get(key);
  const id = uid("g");
  DEFS.push(`<radialGradient id="${id}" cx="${r(cx)}" cy="${r(cy)}" r="${r(rr)}"${user ? ` gradientUnits="userSpaceOnUse"` : ""}>${stops(list)}</radialGradient>`);
  GCACHE.set(key, `url(#${id})`);
  return `url(#${id})`;
}
function clip(inner) { const id = uid("c"); DEFS.push(`<clipPath id="${id}">${inner}</clipPath>`); return `url(#${id})`; }
/** Soft cloth/hair shading: light from the upper left (as in the tokens). */
const shade = (c, hi = 0.18, lo = 0.32) => lin([[0, lt(c, hi)], [0.55, c], [1, dk(c, lo)]], 0.15, 0, 0.85, 1);
/** A warm glow (lamp light, a lit window): radial, fading to nothing. */
const glow = (c = K.lamp, a = 0.7) => rad([[0, c, a], [0.45, c, a * 0.4], [1, c, 0]]);

/** Write the piece: defs first, then the body. */
function out(name, vb, title, body) {
  save(name, vb, title, (DEFS.length ? `<defs>${DEFS.join("")}</defs>\n` : "") + body);
}

// =============================================================== scene kit
/** Night sky: a vertical gradient over the whole frame. */
function sky(w, h, top = K.n0, bottom = K.n3, mid = null) {
  const g = mid ? lin([[0, top], [0.55, mid], [1, bottom]]) : lin([[0, top], [1, bottom]]);
  return R(0, 0, w, h, g);
}
/** Small stars (dots, a few with a soft halo). Kept sparse: no sparkle effects. */
function stars(seed, x0, y0, x1, y1, n, avoid = () => false) {
  const R0 = rng(seed); let s = "";
  for (let i = 0; i < n; i++) {
    const x = x0 + R0() * (x1 - x0), y = y0 + R0() * (y1 - y0);
    if (avoid(x, y)) continue;
    const rr = 0.6 + R0() * 1.1;
    s += C(x, y, rr, "#f4ecd8", { op: r(0.45 + R0() * 0.45) });
  }
  return s;
}
function moon(x, y, rr, phase = 0.35) {
  // a waxing crescent-gibbous moon: a disc with a soft shadowed side, plus halo
  let s = C(x, y, rr * 3.2, glow("#f3e9cc", 0.22));
  s += C(x, y, rr, lin([[0, "#fbf3dc"], [1, "#e6d7b0"]], 0.2, 0, 0.8, 1), { s: INK, w: Math.max(1.2, rr * 0.08) });
  s += P(`M${r(x)},${r(y - rr)} A${r(rr)},${r(rr)} 0 0 1 ${r(x)},${r(y + rr)} A${r(rr * phase)},${r(rr)} 0 0 0 ${r(x)},${r(y - rr)}Z`, "#c9bc98", { op: 0.55 });
  s += C(x - rr * 0.3, y - rr * 0.25, rr * 0.14, "#d9cba5", { op: 0.8 }) + C(x + rr * 0.2, y + rr * 0.35, rr * 0.1, "#d9cba5", { op: 0.7 });
  return s;
}
/** A soft wisp of fog or cloud. */
function wisp(x, y, w, h, c = K.fog, op = 0.12) { return E(x, y, w, h, c, { op }); }

/** Lit or dark window with frame and glazing bars. */
function windowRect(x, y, w, h, o = {}) {
  const { lit = true, frame = K.ink, bars = "cross", sill = true, curtain = null, warm = K.lamp, sw = 1.6, dim = false } = o;
  let s = "";
  const g = lit ? lin([[0, lt(warm, 0.25)], [1, dk(K.amber, dim ? 0.3 : 0.05)]]) : lin([[0, K.n3], [1, K.n1]]);
  s += R(x, y, w, h, g, { s: frame, w: sw });
  if (curtain && lit) s += P(`M${r(x)},${r(y)}L${r(x + w * 0.28)},${r(y)}Q${r(x + w * 0.12)},${r(y + h * 0.5)} ${r(x + w * 0.2)},${r(y + h)}L${r(x)},${r(y + h)}Z`, curtain, { op: 0.85 })
    + P(`M${r(x + w)},${r(y)}L${r(x + w * 0.72)},${r(y)}Q${r(x + w * 0.88)},${r(y + h * 0.5)} ${r(x + w * 0.8)},${r(y + h)}L${r(x + w)},${r(y + h)}Z`, curtain, { op: 0.85 });
  if (bars === "cross") s += S(`M${r(x + w / 2)},${r(y)}V${r(y + h)}M${r(x)},${r(y + h / 2)}H${r(x + w)}`, frame, sw * 0.8);
  else if (bars === "sash") s += S(`M${r(x)},${r(y + h / 2)}H${r(x + w)}M${r(x + w / 2)},${r(y)}V${r(y + h)}M${r(x + w / 4)},${r(y)}V${r(y + h / 2)}M${r(x + w * 0.75)},${r(y)}V${r(y + h / 2)}`, frame, sw * 0.7);
  else if (bars === "v") s += S(`M${r(x + w / 2)},${r(y)}V${r(y + h)}`, frame, sw * 0.8);
  if (sill) s += R(x - w * 0.08, y + h, w * 1.16, Math.max(1.6, h * 0.07), K.stone, { s: frame, w: sw * 0.7 });
  return s;
}

/** A terraced house front (narrow, brick or render) standing on groundY. Returns svg. */
function houseFront(x, groundY, w, h, o = {}) {
  const { wall = K.brick, roof = K.slateRoof, floors = 3, lit = [], door = "c", seed = 1, chimney = true, roofH = h * 0.16, sw = 2, trim = K.stone, bay = false, attic = false } = o;
  const R0 = rng(seed);
  let s = "";
  const top = groundY - h;
  // roof (pitched, seen from the front: a band with a ridge)
  if (chimney) {
    const cx = x + w * (0.25 + R0() * 0.5);
    s += R(cx - w * 0.07, top - roofH - h * 0.08, w * 0.14, h * 0.12, dk(wall, 0.15), { s: INK, w: sw * 0.8 });
    s += R(cx - w * 0.085, top - roofH - h * 0.09, w * 0.17, h * 0.025, trim, { s: INK, w: sw * 0.7 });
    s += R(cx - w * 0.04, top - roofH - h * 0.125, w * 0.03, h * 0.04, K.brickD, { s: INK, w: sw * 0.6 }) + R(cx + w * 0.01, top - roofH - h * 0.125, w * 0.03, h * 0.04, K.brickD, { s: INK, w: sw * 0.6 });
  }
  s += P(poly([[x - w * 0.02, top], [x + w * 0.05, top - roofH], [x + w * 0.95, top - roofH], [x + w * 1.02, top]]), shade(roof, 0.12, 0.3), { s: INK, w: sw });
  s += R(x, top, w, h, shade(wall, 0.1, 0.28), { s: INK, w: sw });
  s += R(x - w * 0.02, top - 1, w * 1.04, Math.max(2, h * 0.025), trim, { s: INK, w: sw * 0.7 });   // eaves band
  // windows per floor
  const fh = h / floors;
  let li = 0;
  for (let f = 0; f < floors; f++) {
    const fy = top + f * fh;
    const ww = w * 0.24, wh = fh * 0.52;
    const isGround = f === floors - 1;
    if (isGround) {
      // ground floor: door + one window (or a bay)
      const dw = w * 0.22, dh = fh * 0.78;
      const dx = door === "l" ? x + w * 0.14 : door === "r" ? x + w * 0.64 : x + w * 0.39;
      s += R(dx, groundY - dh, dw, dh, shade(o.doorC ?? "#3d4b6a", 0.12, 0.3), { s: INK, w: sw });
      s += R(dx + dw * 0.18, groundY - dh * 0.88, dw * 0.64, dh * 0.3, "none", { s: dk(o.doorC ?? "#3d4b6a", 0.35), w: sw * 0.6 });
      s += R(dx + dw * 0.18, groundY - dh * 0.5, dw * 0.64, dh * 0.36, "none", { s: dk(o.doorC ?? "#3d4b6a", 0.35), w: sw * 0.6 });
      s += C(dx + dw * 0.8, groundY - dh * 0.46, Math.max(0.8, dw * 0.05), K.brass);
      s += R(dx - dw * 0.1, groundY - 2, dw * 1.2, 2, K.stone, { s: INK, w: sw * 0.6 });            // step
      const wx = door === "l" ? x + w * 0.52 : x + w * 0.1;
      const isLit = lit.includes(li++);
      s += windowRect(wx, groundY - fh * 0.82, w * 0.34, fh * 0.5, { lit: isLit, sw: sw * 0.8, bars: "sash" });
    } else {
      for (const k of [0.14, 0.62]) {
        const isLit = lit.includes(li++);
        s += windowRect(x + w * k, fy + fh * 0.22, ww, wh, { lit: isLit, sw: sw * 0.8, bars: "sash" });
      }
    }
  }
  return s;
}

/** A street lamp on a post: base on groundY, lantern at the top. Glow drawn separately with lampGlow(). */
function streetLamp(x, groundY, h, o = {}) {
  const { sw = 1.8, col = "#2b2f3a", lit = true } = o;
  let s = "";
  s += P(poly([[x - h * 0.05, groundY], [x - h * 0.03, groundY - h * 0.08], [x + h * 0.03, groundY - h * 0.08], [x + h * 0.05, groundY]]), col, { s: INK, w: sw });
  s += R(x - h * 0.014, groundY - h * 0.86, h * 0.028, h * 0.8, col, { s: INK, w: sw });
  s += R(x - h * 0.045, groundY - h * 0.88, h * 0.09, h * 0.025, col, { s: INK, w: sw * 0.8 });
  // lantern: a tapered glass box with a cap
  const ly = groundY - h * 0.88, lw = h * 0.07, lh = h * 0.12;
  s += P(poly([[x - lw, ly], [x - lw * 1.25, ly - lh], [x + lw * 1.25, ly - lh], [x + lw, ly]]), lit ? lin([[0, K.glow], [1, K.gold]]) : K.n3, { s: INK, w: sw });
  s += S(`M${r(x)},${r(ly)}V${r(ly - lh)}`, INK, sw * 0.5);
  s += P(poly([[x - lw * 1.45, ly - lh], [x, ly - lh * 1.55], [x + lw * 1.45, ly - lh]]), col, { s: INK, w: sw });
  s += C(x, ly - lh * 1.62, h * 0.012, col, { s: INK, w: sw * 0.6 });
  return s;
}
const lampGlow = (x, y, rr, a = 0.55, c = K.lamp) => C(x, y, rr, glow(c, a));

/** A contact shadow under anything standing on a surface. */
const shadow = (x, y, rx, ry = rx * 0.2, op = 0.3, c = "#05070d") => E(x, y, rx, ry, c, { op });

/** Cobbles (rows of rounded stones) in a band. */
function cobbles(x0, y0, x1, y1, seed = 3, o = {}) {
  const { c = "#3d4459", line = "#262b3a", rows = 5, op = 1 } = o;
  const R0 = rng(seed);
  let s = R(x0, y0, x1 - x0, y1 - y0, lin([[0, lt(c, 0.06)], [1, dk(c, 0.25)]]), { op });
  let d = "";
  for (let i = 0; i < rows; i++) {
    const t0 = i / rows, t1 = (i + 1) / rows;
    const ya = y0 + (y1 - y0) * t0 * t0 * 0.6 + (y1 - y0) * t0 * 0.4, yb = y0 + (y1 - y0) * t1 * t1 * 0.6 + (y1 - y0) * t1 * 0.4;
    const hgt = yb - ya, cw = hgt * 2.2;
    let x = x0 - R0() * cw;
    while (x < x1) {
      const w = cw * (0.75 + R0() * 0.5);
      d += `M${r(x + 1.2)},${r(ya + hgt * 0.5)}Q${r(x + 1.2)},${r(ya + 0.8)} ${r(x + w / 2)},${r(ya + 0.8)}Q${r(x + w - 1.2)},${r(ya + 0.8)} ${r(x + w - 1.2)},${r(ya + hgt * 0.5)}Q${r(x + w - 1.2)},${r(yb - 0.8)} ${r(x + w / 2)},${r(yb - 0.8)}Q${r(x + 1.2)},${r(yb - 0.8)} ${r(x + 1.2)},${r(ya + hgt * 0.5)}Z`;
      x += w;
    }
  }
  s += P(d, "none", { s: line, w: 1, op: 0.55 * op });
  return s;
}

/** String lights hung between two anchors, sagging, with bulbs. */
function stringLights(a, b, sag, n, o = {}) {
  const { bulb = K.gold, sw = 1, glowR = 6 } = o;
  const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + sag * 2];
  let s = S(`M${pt(a)}Q${pt(mid)} ${pt(b)}`, INK, sw);
  for (let i = 1; i < n; i++) {
    const t = i / n;
    const x = (1 - t) * (1 - t) * a[0] + 2 * (1 - t) * t * mid[0] + t * t * b[0];
    const y = (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * mid[1] + t * t * b[1];
    s += C(x, y + glowR * 0.25, glowR, glow(bulb, 0.5)) + E(x, y + glowR * 0.28, glowR * 0.22, glowR * 0.3, bulb, { s: INK, w: sw * 0.6 });
  }
  return s;
}

/** Water band with lamp reflections. */
function water(x0, y0, x1, y1, o = {}) {
  const { top = K.n2, bottom = K.waterD, seed = 5, refl = [], ripples = 26 } = o;
  const R0 = rng(seed);
  let s = R(x0, y0, x1 - x0, y1 - y0, lin([[0, top], [1, bottom]]));
  for (const [x, w, c = K.gold, op = 0.75] of refl) {
    for (let k = 0; k < 7; k++) {
      const y = y0 + 3 + k * (y1 - y0 - 6) / 7 + R0() * 2;
      const ww = w * (1 - k * 0.09) * (0.6 + R0() * 0.5);
      s += P(`M${r(x - ww / 2)},${r(y)}h${r(ww)}`, "none", { s: c, w: 1.6, op: r(op * (1 - k * 0.1)) });
    }
  }
  let d = "";
  for (let i = 0; i < ripples; i++) {
    const x = x0 + R0() * (x1 - x0), y = y0 + 4 + R0() * (y1 - y0 - 6), w = 6 + R0() * 22;
    d += `M${r(x)},${r(y)}h${r(w)}`;
  }
  s += P(d, "none", { s: "#8fa3c8", w: 1, op: 0.25 });
  return s;
}

/** A framed panel (spots and part art): rounded rectangle, ink outline, thin brass inner line. */
function frameRect(w, h, rr = 22, o = {}) {
  const { sw = 5, inner = K.brass, m = 9 } = o;
  return R(sw / 2, sw / 2, w - sw, h - sw, "none", { s: INK, w: sw, rx: rr }) +
    R(m, m, w - 2 * m, h - 2 * m, "none", { s: inner, w: 1.6, rx: rr - m * 0.6, op: 0.85 });
}
const frameClip = (w, h, rr = 22) => clip(R(0, 0, w, h, "#000", { rx: rr }));

// =============================================================== people
// Figures are drawn in local units: 100 tall, feet on y=0, centre line x=0, then
// placed with fig(). The character's RIGHT side is at −x (viewer's left) in a
// front view. Asymmetric features are always drawn on the character's own side.
const SK = {
  dana: "#6e4632", marco: "#c99670", june: "#f2d4b9", quinn: "#f7dcc9", tess: "#f4d7c4", noor: "#c9936a", rook: "#dbc7b5",
  quiet: "#b3b1ac", widow: "#e6dcd6",
};

/** Place a local-unit figure at x (centre), y (feet), height h. lw = world outline width. */
function fig(drawFn, x, y, h, pose = {}) {
  const s = h / 100;
  const ctx = { s, lw: (pose.lw ?? Math.max(1.3, Math.min(2.6, h / 80))) / s, detail: pose.detail ?? (h > 260 ? "hi" : "lo") };
  return `<g transform="translate(${r(x)} ${r(y)}) scale(${r(s * 1000) / 1000})">${drawFn(ctx, pose)}</g>`;
}

/** Two-bone arm: returns [shoulder, elbow, wrist]. bend: +1 elbow out to the figure's outside. */
function ik(sh, wrist, l1, l2, bend = 1) {
  const dx = wrist[0] - sh[0], dy = wrist[1] - sh[1];
  let d = Math.hypot(dx, dy);
  const dd = Math.min(d, l1 + l2 - 0.01);
  const a = Math.atan2(dy, dx);
  const cosA = Math.max(-1, Math.min(1, (l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd)));
  const b = Math.acos(cosA) * bend;
  const el = [sh[0] + Math.cos(a - b) * l1, sh[1] + Math.sin(a - b) * l1];
  const wr = d > l1 + l2 ? [sh[0] + Math.cos(a) * (l1 + l2 - 0.01), sh[1] + Math.sin(a) * (l1 + l2 - 0.01)] : wrist;
  return [sh, el, wr];
}

/** A limb as an outlined stroke (sleeve or trouser), with a soft highlight. */
function limb(pts, w, col, lw, o = {}) {
  const d = pts.length > 2 ? sm(pts, false, 0.8) : poly(pts, false);
  let s = S(d, INK, w + lw * 2, { cap: o.cap ?? "round" });
  s += S(d, col, w, { cap: o.cap ?? "round" });
  if (o.hi !== false) s += S(d, lt(col, 0.22), w * 0.28, { op: 0.6, tf: `translate(${r(-w * 0.2)} 0)`, cap: "round" });
  return s;
}

/** A hand at the wrist, pointing along dir (radians). size ≈ hand length. Five fingers when big enough. */
function hand(wr, dir, size, skin, lw, o = {}) {
  const { side = 1, fingers = false, open = false, worldLen = size } = o;   // side: which way the thumb points (+1 left of travel)
  const ca = Math.cos(dir), sa = Math.sin(dir), nx = -sa * side, ny = ca * side;
  const P0 = (u, v) => [wr[0] + ca * u + nx * v, wr[1] + sa * u + ny * v];
  let s = "";
  if (!fingers) {
    // mitt with a thumb (fingers too small to resolve at print size)
    s += P(sm([P0(-0.1 * size, -0.36 * size), P0(0.45 * size, -0.42 * size), P0(0.92 * size, -0.22 * size), P0(1.0 * size, 0.08 * size), P0(0.7 * size, 0.38 * size), P0(0.1 * size, 0.36 * size)]), skin, { s: INK, w: lw });
    s += S(sm([P0(0.18 * size, 0.3 * size), P0(0.45 * size, 0.62 * size), P0(0.62 * size, 0.56 * size)], false), INK, lw * 0.9);
    s += P(sm([P0(0.16 * size, 0.28 * size), P0(0.44 * size, 0.58 * size), P0(0.6 * size, 0.52 * size), P0(0.5 * size, 0.3 * size)]), skin);
    return s;
  }
  // palm + four fingers + thumb
  const fw = size * 0.17;
  const palm = sm([P0(-0.05 * size, -0.34 * size), P0(0.5 * size, -0.36 * size), P0(0.56 * size, 0.3 * size), P0(0.05 * size, 0.34 * size)]);
  const fl = open ? [0.5, 0.58, 0.55, 0.44] : [0.36, 0.42, 0.4, 0.32];
  const offs = [-0.27, -0.09, 0.09, 0.26];
  let fs = "";
  for (let i = 0; i < 4; i++) {
    const a = P0(0.48 * size, offs[i] * size), b = P0((0.48 + fl[i]) * size, offs[i] * size * (open ? 1.25 : 1.05));
    fs += S(poly([a, b], false), INK, fw + lw * 2) + S(poly([a, b], false), skin, fw);
  }
  const t0 = P0(0.2 * size, 0.28 * size), t1 = P0(0.48 * size, 0.62 * size);
  s += fs + S(poly([t0, t1], false), INK, fw * 1.1 + lw * 2) + S(poly([t0, t1], false), skin, fw * 1.1);
  s += P(palm, skin, { s: INK, w: lw }) + P(palm, skin);
  // re-draw finger roots over the palm outline so they read as one hand
  for (let i = 0; i < 4; i++) { const a = P0(0.44 * size, offs[i] * size), b = P0(0.6 * size, offs[i] * size * 1.04); s += S(poly([a, b], false), skin, fw); }
  s += S(poly([P0(0.24 * size, 0.24 * size), P0(0.36 * size, 0.42 * size)], false), skin, fw * 1.1);
  return s;
}

/** Simple face: eyes, brows, mouth. y offsets from the head centre (0,-89.5). */
function face(c, o = {}) {
  const { skin, dx = 0, brow = INK, mouth = "smile", eyeC = "#1d1418", glasses = false, blush = null, lw, lids = false } = o;
  const hi = c.detail === "hi";
  let s = "";
  const ey = -89.4, ex = 2.45;
  if (blush) s += E(-3.6 + dx, -86.4, 1.4, 0.8, blush, { op: 0.45 }) + E(3.6 + dx, -86.4, 1.4, 0.8, blush, { op: 0.45 });
  for (const sd of [-1, 1]) {
    if (hi) {
      s += E(sd * ex + dx, ey, 1.05, 0.8, "#f8f3ea", { s: INK, w: lw * 0.45 });
      s += C(sd * ex + dx + 0.12, ey, 0.6, eyeC) + C(sd * ex + dx - 0.12, ey - 0.25, 0.2, "#ffffff");
    } else s += E(sd * ex + dx, ey, 0.62, 0.72, eyeC);
    if (lids) s += S(`M${r(sd * ex + dx - 0.9)},${r(ey - 0.3)}Q${r(sd * ex + dx)},${r(ey - 0.85)} ${r(sd * ex + dx + 0.9)},${r(ey - 0.3)}`, INK, lw * 0.5);
    s += S(`M${r(sd * ex + dx - sd * 1.1)},${r(ey - 1.95)}Q${r(sd * ex + dx)},${r(ey - 2.55)} ${r(sd * ex + dx + sd * 1.2)},${r(ey - 2.05)}`, brow, lw * 0.75);
  }
  if (hi) s += S(`M${r(dx + 0.3)},${r(-88.4)}Q${r(dx + 0.9)},${r(-86.7)} ${r(dx - 0.1)},${r(-86.4)}`, dk(skin, 0.35), lw * 0.5);
  const my = -84.5;
  if (mouth === "smile") s += S(`M${r(dx - 1.5)},${r(my - 0.3)}Q${r(dx)},${r(my + 0.9)} ${r(dx + 1.5)},${r(my - 0.3)}`, dk(skin, 0.55), lw * 0.6);
  else if (mouth === "grin") s += P(`M${r(dx - 1.8)},${r(my - 0.5)}Q${r(dx)},${r(my + 1.6)} ${r(dx + 1.8)},${r(my - 0.5)}Z`, "#f6efe6", { s: dk(skin, 0.6), w: lw * 0.5 });
  else if (mouth === "o") s += E(dx, my, 0.9, 1.1, dk(skin, 0.65));
  else if (mouth === "open") s += P(`M${r(dx - 1.4)},${r(my - 0.4)}Q${r(dx)},${r(my + 1.8)} ${r(dx + 1.4)},${r(my - 0.4)}Z`, "#5a2a2a", { s: dk(skin, 0.6), w: lw * 0.45 });
  else if (mouth === "grim") s += S(`M${r(dx - 1.4)},${r(my)}L${r(dx + 1.4)},${r(my - 0.1)}`, dk(skin, 0.55), lw * 0.6);
  else s += S(`M${r(dx - 1.2)},${r(my)}Q${r(dx)},${r(my + 0.3)} ${r(dx + 1.2)},${r(my)}`, dk(skin, 0.55), lw * 0.6);
  if (glasses) {
    for (const sd of [-1, 1]) s += C(sd * ex + dx, ey, 1.65, "#ffffff", { op: 0.12 }) + C(sd * ex + dx, ey, 1.65, "none", { s: "#2b211e", w: lw * 0.85 });
    s += S(`M${r(dx - 0.8)},${r(ey - 0.3)}Q${r(dx)},${r(ey - 0.9)} ${r(dx + 0.8)},${r(ey - 0.3)}`, "#2b211e", lw * 0.7);
  }
  return s;
}

const HEAD = symm([[0, -97.4], [4.7, -96.3], [6.3, -91.4], [6.1, -87.4], [4.9, -83.6], [2.5, -81.9], [0, -81.5]]);
function head(c, skin, o = {}) {
  const { w = 1, ears = true, lw = c.lw } = o;
  const pts = HEAD.map(([x, y]) => [x * w, y]);
  let s = "";
  if (ears) for (const sd of [-1, 1]) s += E(sd * 6.15 * w, -88.6, 1.15, 1.8, skin, { s: INK, w: lw * 0.8 });
  s += P(sm(pts), lin([[0, lt(skin, 0.14)], [0.5, skin], [1, dk(skin, 0.22)]], 0.1, 0, 0.9, 0.4), { s: INK, w: lw });
  return s;
}
const neck = (c, skin, w = 2.3, top = -84, bot = -76) => R(-w, top, w * 2, bot - top, dk(skin, 0.12), { s: INK, w: c.lw * 0.8 }) + R(-w + c.lw * 0.4, top, w * 2 - c.lw * 0.8, bot - top, dk(skin, 0.12));

/** Torso outline: shoulders (half-width sh) down to the hem (y = hem) with hem half-width hw. */
function torsoPath(sh = 10, hem = -45, hw = 9, waist = 7.8, waistY = -58) {
  return sm([[-2.8, -78.4], [-sh + 2.4, -77.8], [-sh, -75.4], [-sh + 0.5, -68], [-waist, waistY], [-hw, hem + 1.2], [-hw, hem, 1], [hw, hem, 1], [hw, hem + 1.2], [waist, waistY], [sh - 0.5, -68], [sh, -75.4], [sh - 2.4, -77.8], [2.8, -78.4]]);
}
/** Legs: two trouser legs from the hip to the ankles, then shoes. spread = ankle offset. */
function legs(c, col, shoe, o = {}) {
  const { spread = 0, hip = -45, hipW = 8.6, kneeW = 3.2, ankleW = 2.4, lw = c.lw, shoeL = 3.9, boots = false, skirtSkin = null } = o;
  let s = "";
  for (const sd of [-1, 1]) {
    const ax = sd * (4.1 + spread);
    const leg = [[sd * 0.4, hip - 1], [sd * hipW, hip - 1.5], [sd * (hipW - 0.6) + sd * spread * 0.5, -24], [ax + sd * ankleW, -3.2], [ax - sd * ankleW, -3.2], [sd * 1.2 + sd * spread * 0.5, -24], [sd * 0.4, hip + 2]];
    s += P(sm(leg.map((p, i) => i === 0 || i === 6 ? [...p, 1] : p)), skirtSkin ?? lin([[0, lt(col, 0.12)], [1, dk(col, 0.25)]], 0, 0, 1, 0), { s: INK, w: lw });
    if (!skirtSkin) s += S(`M${r(sd * 3.6)},${r(hip + 3)}L${r(ax + sd * 0.3)},${r(-5)}`, dk(col, 0.25), lw * 0.4, { op: 0.6 });
    // shoe
    const sx = ax + sd * 0.6;
    const shoeD = boots
      ? sm([[sx - shoeL * 0.75, -0.2, 1], [sx - shoeL * 0.7, -4.6], [sx + shoeL * 0.4, -4.8], [sx + sd * shoeL * 0.15 + shoeL * 0.75, -1.8], [sx + shoeL * 0.85, -0.2, 1]])
      : sm([[sx - shoeL * 0.8, -0.2, 1], [sx - shoeL * 0.75, -2.6], [sx + shoeL * 0.2, -3.3], [sx + shoeL * 0.85, -1.6], [sx + shoeL * 0.9, -0.2, 1]]);
    s += P(shoeD, shade(shoe, 0.2, 0.3), { s: INK, w: lw });
  }
  return s;
}

/** Arm from the shoulder to a wrist target, sleeve colour (and bare forearm if rolled), plus hand. */
function arm(c, side, target, o = {}) {
  const { sh = 10, sleeve, skin, w = 4.2, rolled = false, cuff = null, bend = 1, handSize = 4.6, thumb = 1, fingers = null, open = false, l1 = 16, l2 = 14.5, behind = false } = o;
  const shoulder = [side * (sh - 1.7), -75.2];
  const [S0, El, Wr] = ik(shoulder, target, l1, l2, bend * side);
  const lw = c.lw;
  let s = "";
  if (rolled) {
    const mid = lerp(El, Wr, 0.12);
    s += limb([S0, El], w, sleeve, lw) + limb([mid, Wr], w * 0.82, skin, lw, { hi: false });
    s += limb([lerp(El, Wr, -0.12), lerp(El, Wr, 0.18)], w * 1.12, lt(sleeve, 0.12), lw, { cap: "butt", hi: false });   // rolled cuff
  } else {
    s += limb([S0, El, Wr], w, sleeve, lw);
    if (cuff) s += limb([lerp(El, Wr, 0.86), Wr], w * 1.02, cuff, lw, { cap: "butt", hi: false });
  }
  const dir = Math.atan2(Wr[1] - El[1], Wr[0] - El[0]);
  const fing = fingers ?? (c.detail === "hi");
  s += hand(Wr, dir, handSize, skin, lw, { side: -side * thumb, fingers: fing, open });
  return { svg: s, wrist: Wr, elbow: El, dir };
}

// ---------------------------------------------------------------- the coven
// Each witch: tall/small/lanky etc. via the height passed to fig(); see HEIGHT.
export const HEIGHT = { dana: 1.02, marco: 0.97, june: 0.86, quinn: 1.05, tess: 0.98, noor: 0.92, rook: 1.16 };

/** Dana Okafor: tall, short natural hair, teal scrubs under a denim jacket, silver ring on her LEFT thumb, silver studs. */
function dana(c, p = {}) {
  const skin = SK.dana, denim = "#4f72a8", scrubs = "#2e9e95", hair = "#1b1412", lw = c.lw;
  const sh = 10.2;
  let s = "";
  s += legs(c, scrubs, "#e8e4dc", { spread: p.spread ?? 0.4 });
  s += P(torsoPath(sh, -45, 8.6, 7.6), shade(scrubs), { s: INK, w: lw });                                 // scrubs top
  s += S(`M-3.4,-78L0,-71L3.4,-78`, dk(scrubs, 0.35), lw * 0.7);                                          // V-neck
  // denim jacket, open, cropped at the waist
  for (const sd of [-1, 1]) {
    s += P(sm([[sd * 3.2, -78.6, 1], [sd * (sh - 2.4), -77.9], [sd * sh, -75.2], [sd * (sh - 0.3), -60], [sd * (sh - 1.2), -53.2, 1], [sd * 5.6, -53.4, 1], [sd * 4.8, -66], [sd * 3.6, -74]]), shade(denim, 0.14, 0.3), { s: INK, w: lw });
    s += P(poly([[sd * 3.2, -78.8], [sd * 7.2, -77.6], [sd * 6.4, -72.4], [sd * 4.6, -70.8]]), lt(denim, 0.12), { s: INK, w: lw * 0.8 });   // collar
    s += S(`M${sd * 5.6},-55.4H${sd * (sh - 1.1)}`, "#e0a548", lw * 0.45, { dash: "0.9 0.7" });              // waistband stitch
    s += R(sd > 0 ? 5.6 : -8.6, -71, 3, 2.6, lt(denim, 0.06), { s: INK, w: lw * 0.6 });                      // chest pockets
  }
  s += neck(c, skin, 2.2);
  const aL = arm(c, 1, p.left ?? [sh + 1.6, -47], { sh, sleeve: denim, skin, cuff: lt(denim, 0.1) });
  const aR = arm(c, -1, p.right ?? [-sh - 1.6, -47], { sh, sleeve: denim, skin, cuff: lt(denim, 0.1) });
  s += aR.svg + aL.svg;
  // silver ring on her LEFT thumb (the thumb sits toward the body on a hanging hand)
  {
    const W = aL.wrist, d = aL.dir, ca = Math.cos(d), sa = Math.sin(d), sz = 4.6, sd = -1;
    const tp = [W[0] + ca * sz * 0.4 + -sa * sd * sz * 0.5, W[1] + sa * sz * 0.4 + ca * sd * sz * 0.5];
    s += C(tp[0], tp[1], 0.75, "#cdd3da", { s: INK, w: lw * 0.4 });
  }
  s += head(c, skin, { w: 0.95 });
  for (const sd of [-1, 1]) s += C(sd * 5.95, -86.9, 0.55, "#cdd3da", { s: INK, w: lw * 0.35 });         // studs
  s += face(c, { skin, lw, dx: p.look ?? 0, brow: hair, mouth: p.mouth ?? "smile", eyeC: "#2a1610" });
  // close-cropped natural hair
  s += P(sm([[-6.4, -88.6, 1], [-6.6, -93.2], [-4.6, -97.6], [0, -99.2], [4.6, -97.6], [6.6, -93.2], [6.4, -88.6, 1], [5.6, -91.6], [3.4, -93.6], [0, -94.2], [-3.4, -93.6], [-5.6, -91.6]]), shade(hair, 0.16, 0.2), { s: INK, w: lw });
  s += S(`M-3,-97.2Q0,-98.4 3,-97.4`, lt(hair, 0.3), lw * 0.6, { op: 0.8 });
  return s;
}

/** Marco Rossi: stocky, oil on his hands, rolled sleeves, burn scar on his RIGHT forearm; red rag in his left chest pocket. */
function marco(c, p = {}) {
  const skin = SK.marco, shirt = "#3d5170", hair = "#2a1d17", trousers = "#3a3532", lw = c.lw;
  const sh = 11.6;
  let s = "";
  s += legs(c, trousers, "#5a3d2a", { spread: p.spread ?? 0.8, hipW: 9.4, boots: true });
  s += P(torsoPath(sh, -45, 9.6, 9.2), shade(shirt, 0.14, 0.3), { s: INK, w: lw });
  s += P(`M-3.6,-78.6L0,-72L3.6,-78.6Z`, skin, { s: INK, w: lw * 0.7 });                                  // open collar
  for (const sd of [-1, 1]) s += P(poly([[sd * 3.4, -79], [sd * 7.6, -77.6], [sd * 6.6, -73], [sd * 1.6, -72.4]]), lt(shirt, 0.1), { s: INK, w: lw * 0.8 });
  s += S(`M0,-72V-45.5`, dk(shirt, 0.35), lw * 0.6) + C(0.9, -66, 0.5, "#d8d2c4") + C(0.9, -58, 0.5, "#d8d2c4") + C(0.9, -50, 0.5, "#d8d2c4");
  // chest pocket on his LEFT (viewer's right) with the red rag
  s += P(sm([[4.2, -71.4], [5.0, -73.6], [6.0, -72.6], [7.0, -74], [8.0, -72.4], [7.8, -70.6], [4.4, -70.6]]), "#c8402e", { s: INK, w: lw * 0.55 });
  s += R(3.8, -71.2, 4.6, 4.2, lt(shirt, 0.06), { s: INK, w: lw * 0.6 });
  s += R(-10, -46.6, 20, 2.2, "#4a3a2c", { s: INK, w: lw * 0.6 }) + R(-1.2, -46.9, 2.4, 2.8, "#c9a24a", { s: INK, w: lw * 0.4 });   // belt
  s += neck(c, skin, 2.9);
  const aL = arm(c, 1, p.left ?? [sh + 1.4, -47], { sh, sleeve: shirt, skin, rolled: true, w: 4.8 });
  const aR = arm(c, -1, p.right ?? [-sh - 1.4, -47], { sh, sleeve: shirt, skin, rolled: true, w: 4.8 });
  s += aR.svg + aL.svg;
  // burn scar on his RIGHT forearm (viewer's left in a front view)
  {
    const m = lerp(aR.elbow, aR.wrist, 0.55), d = aR.dir * 180 / Math.PI;
    s += E(m[0], m[1], 1.9, 1.1, "#e9a796", { s: dk("#e9a796", 0.3), w: lw * 0.35, tf: `rotate(${r(d)} ${r(m[0])} ${r(m[1])})` });
  }
  // oil on the hands
  for (const a of [aL, aR]) s += C(a.wrist[0] + Math.cos(a.dir) * 2.4, a.wrist[1] + Math.sin(a.dir) * 2.4, 0.9, "#2b2622", { op: 0.45 });
  if (p.prop) s += p.prop(aL, aR);
  s += head(c, skin, { w: 1.06 });
  s += P(`M-6.2,-87.6C-5,-84 -3,-82.6 0,-82.3C3,-82.6 5,-84 6.2,-87.6L5.8,-84.4C4.4,-82 2.4,-81.4 0,-81.3C-2.4,-81.4 -4.4,-82 -5.8,-84.4Z`, hair, { op: 0.32 });   // stubble
  s += face(c, { skin, lw, dx: p.look ?? 0, brow: hair, mouth: p.mouth ?? "grin", eyeC: "#3a2414" });
  s += E(-3.6, -86.2, 1.2, 0.5, "#2b2622", { op: 0.35 });                                               // oil smudge, right cheek
  s += P(sm([[-6.7, -88.4, 1], [-6.9, -93.4], [-5, -97.8], [-1, -99.6], [3.4, -99.4], [6.2, -96.8], [6.9, -92.8], [6.7, -88.4, 1], [5.9, -91.8], [3.8, -93.9], [0.6, -94.6], [-3, -94], [-5.6, -92]]), shade(hair, 0.2, 0.2), { s: INK, w: lw });
  s += S(`M-3.6,-97.4Q-0.6,-99 2.6,-98.2`, lt(hair, 0.32), lw * 0.6, { op: 0.8 });
  return s;
}

/** June Takeda: small, black bob with a blunt fringe, round glasses, yellow raincoat, red notebook in her LEFT hand. */
function june(c, p = {}) {
  const skin = SK.june, coat = "#f4c22f", hair = "#1b1920", jumper = "#2f5f63", lw = c.lw;
  const sh = 9.2;
  let s = "";
  // back of the bob
  s += P(sm(symm([[0, -99], [5.8, -97.6], [7.6, -92.4], [7.8, -86.4], [7.6, -82.2, 1], [0, -82.2, 1]])), shade(hair, 0.12, 0.2), { s: INK, w: lw });
  s += legs(c, "#2b3348", "#7a3b30", { spread: p.spread ?? 0.3, hipW: 7.8 });
  // raincoat to mid-thigh, A-line, hood down behind the neck
  s += P(sm(symm([[0, -78.6], [3, -78.8], [sh - 2, -77.6], [sh, -75.2], [sh + 0.2, -64], [sh + 1.8, -36.4, 1], [0, -36, 1]])), shade(coat, 0.16, 0.24), { s: INK, w: lw });
  s += P(sm([[-5.6, -78.4], [-6.6, -80.6], [0, -81.4], [6.6, -80.6], [5.6, -78.4], [0, -77.6]]), dk(coat, 0.1), { s: INK, w: lw * 0.8 });   // hood, down
  s += P(`M-3,-78.6L0,-73L3,-78.6Z`, jumper, { s: INK, w: lw * 0.7 });
  for (const sd of [-1, 1]) s += P(poly([[sd * 2.8, -79], [sd * 6.6, -77.4], [sd * 5.4, -72.6], [sd * 1.0, -71.6]]), lt(coat, 0.1), { s: INK, w: lw * 0.75 });
  s += S(`M0.8,-71.6L1.4,-36.6`, dk(coat, 0.3), lw * 0.55);
  for (const y of [-66, -58, -50, -42]) s += C(2.6, y, 0.55, "#3c3c42");
  s += neck(c, skin, 2.0);
  const aR = arm(c, -1, p.right ?? [-sh - 1.6, -48], { sh, sleeve: coat, skin, w: 4.2 });
  // notebook held against her chest by her LEFT hand (viewer's right)
  const aL = arm(c, 1, p.left ?? [4.2, -63], { sh, sleeve: coat, skin, w: 4.2, bend: -0.6 });
  if (p.notebook !== false && !p.left) {
    s += P(poly([[1.6, -69.8], [8.4, -70.6], [9.2, -58.6], [2.4, -57.8]]), shade("#b8463a", 0.14, 0.3), { s: INK, w: lw * 0.8 });
    s += S(`M7.6,-70.4L8.4,-58.6`, "#2a1f22", lw * 0.7) + S(`M2.8,-67.4L7.6,-68`, "#d9a36a", lw * 0.4);
  }
  s += aR.svg + aL.svg;
  if (p.prop) s += p.prop(aL, aR);
  s += head(c, skin, { w: 0.96 });
  s += face(c, { skin, lw, dx: p.look ?? 0, brow: hair, mouth: p.mouth ?? "smile", glasses: true, eyeC: "#2a1a12", blush: "#e88a7a" });
  // fringe and side curtains
  s += P(sm([[-7.8, -82.6, 1], [-7.9, -89], [-7.2, -94.6], [-4.4, -98.4], [0, -99.4], [4.4, -98.4], [7.2, -94.6], [7.9, -89], [7.8, -82.6, 1], [6.2, -82.6, 1], [6.1, -88], [5.8, -91.4, 1], [0, -91.7, 1], [-5.8, -91.4, 1], [-6.1, -88], [-6.2, -82.6, 1]]), shade(hair, 0.16, 0.2), { s: INK, w: lw });
  s += S(`M-3.4,-97.4Q0,-98.8 3.4,-97.6`, "#4a4d5c", lw * 0.6, { op: 0.8 });
  return s;
}

/** Quinn Abernathy (they): lanky, curly red hair, purple cardigan over a cream shirt, a whistle on a cord. */
function quinn(c, p = {}) {
  const skin = SK.quinn, hair = "#c4502a", card = "#7d5aa6", shirtC = "#f4eddc", lw = c.lw;
  const sh = 9.4;
  let s = "";
  // curls behind the head
  s += curls(c, [[0, -94, 8.2], [-6.4, -91, 4.6], [6.4, -91, 4.6], [-7, -85.6, 3.6], [7, -85.6, 3.6], [-4, -99.4, 4], [4, -99.4, 4]], hair, 21);
  s += legs(c, "#4a4e5e", "#6b4a32", { spread: p.spread ?? 0.3, hipW: 7.6, kneeW: 2.8 });
  s += P(torsoPath(sh, -45, 8.0, 6.8), shade(shirtC, 0.1, 0.18), { s: INK, w: lw });
  for (const sd of [-1, 1]) {
    s += P(sm([[sd * 2.8, -78.8, 1], [sd * (sh - 2.4), -77.9], [sd * sh, -75.2], [sd * (sh - 0.4), -62], [sd * (sh - 0.9), -43.6, 1], [sd * 2.8, -43.6, 1], [sd * 2.2, -60]]), shade(card, 0.14, 0.3), { s: INK, w: lw });
    s += S(`M${sd * 2.4},-60L${sd * 2.8},-44`, lt(card, 0.25), lw * 0.4, { op: 0.6 });
  }
  s += C(-2.6, -54, 0.55, "#efe2c4", { s: INK, w: lw * 0.3 }) + C(-2.7, -49, 0.55, "#efe2c4", { s: INK, w: lw * 0.3 });
  s += neck(c, skin, 2.0);
  // whistle on a cord, hanging at the centre of the chest
  s += S(`M-2,-77.8L0.4,-66.6M2,-77.8L0.6,-66.6`, "#1d2a3a", lw * 0.5);
  s += P(poly([[-0.6, -66.4], [2.6, -66.4], [2.6, -65], [0.6, -64.6]]), "#b9c1c9", { s: INK, w: lw * 0.45 }) + C(-0.2, -64.8, 1.2, "#c9d0d6", { s: INK, w: lw * 0.45 });
  const aL = arm(c, 1, p.left ?? [sh + 1.2, -46], { sh, sleeve: card, skin, w: 3.8, l1: 16.6, l2: 15 });
  const aR = arm(c, -1, p.right ?? [-sh - 1.2, -46], { sh, sleeve: card, skin, w: 3.8, l1: 16.6, l2: 15 });
  s += aR.svg + aL.svg;
  if (p.prop) s += p.prop(aL, aR);
  s += head(c, skin, { w: 0.93 });
  const R0 = rng(4);
  for (let i = 0; i < 10; i++) s += C((i % 2 ? 1 : -1) * (1.6 + R0() * 2.6) + (p.look ?? 0), -87.2 + R0() * 1.8, 0.22, "#c98557", { op: 0.8 });   // freckles
  s += face(c, { skin, lw, dx: p.look ?? 0, brow: "#a2452a", mouth: p.mouth ?? "smile", eyeC: "#3c5a30", blush: "#ee9a86" });
  s += curls(c, [[-5.2, -93.6, 2.8], [-3, -95.8, 3], [0, -96.6, 3.2], [3, -95.8, 3], [5.2, -93.6, 2.8], [-1.6, -98.6, 3], [1.8, -98.6, 3]], hair, 22);
  return s;
}
/** Curly hair as one outlined mass of merged circles, with curl marks. */
function curls(c, list, col, seed) {
  const lw = c.lw;
  let s = list.map(([x, y, rr]) => C(x, y, rr + lw * 0.5, INK)).join("");
  s += list.map(([x, y, rr]) => C(x, y, rr - lw * 0.5, col)).join("");
  const R0 = rng(seed);
  let d = "";
  for (const [x, y, rr] of list) for (let k = 0; k < 3; k++) {
    const a = R0() * 6.28, q = rr * (0.2 + R0() * 0.5), cx = x + Math.cos(a) * q, cy = y + Math.sin(a) * q, cr = rr * 0.28;
    d += `M${r(cx - cr)},${r(cy)}a${r(cr)},${r(cr)} 0 1 1 ${r(cr * 1.4)},${r(cr * 0.6)}`;
  }
  s += S(d, dk(col, 0.3), lw * 0.45, { op: 0.8 });
  s += list.slice(0, 3).map(([x, y, rr]) => C(x - rr * 0.3, y - rr * 0.35, rr * 0.3, lt(col, 0.3), { op: 0.35 })).join("");
  return s;
}

/** Tess Lindqvist: broad-shouldered, blonde braid over her RIGHT shoulder with a pale streak, navy driver's uniform, badge on her left chest. */
function tess(c, p = {}) {
  const skin = SK.tess, hair = "#d6a94b", streak = "#f8f5ee", navy = "#25355a", lw = c.lw;
  const sh = 11.8;
  let s = "";
  s += legs(c, navy, "#1d1d22", { spread: p.spread ?? 0.6, hipW: 9 });
  s += P(torsoPath(sh, -44.6, 9.4, 8.6), shade(navy, 0.16, 0.3), { s: INK, w: lw });
  s += P(`M-3.8,-78.6L3.8,-78.6L1.8,-62L-1.8,-62Z`, "#bcd2ea", { s: INK, w: lw * 0.6 });               // shirt
  s += P(poly([[-0.9, -76.8], [0.9, -76.8], [1.3, -66], [0, -64.4], [-1.3, -66]]), "#7a2234", { s: INK, w: lw * 0.5 });   // tie
  for (const sd of [-1, 1]) s += P(poly([[sd * 3.8, -78.8], [sd * 1.8, -62.2], [sd * 4.4, -66], [sd * 6.6, -73], [sd * 6.0, -77.4]]), lt(navy, 0.1), { s: INK, w: lw * 0.6 });   // lapels
  s += S(`M0,-62V-45`, dk(navy, 0.4), lw * 0.5) + C(1.2, -57, 0.5, "#d9b55a") + C(1.2, -50, 0.5, "#d9b55a");
  for (const sd of [-1, 1]) s += P(poly([[sd * 6.4, -78], [sd * (sh - 0.6), -76.8], [sd * (sh - 0.8), -75.4], [sd * 6.2, -76.6]]), dk(navy, 0.25), { s: INK, w: lw * 0.4 });   // epaulettes
  s += C(7.2, -69.6, 1.25, "#d9b55a", { s: INK, w: lw * 0.45 });                                        // badge on her LEFT chest
  s += neck(c, skin, 2.7);
  const aL = arm(c, 1, p.left ?? [sh + 1.4, -47], { sh, sleeve: navy, skin, w: 4.8, cuff: dk(navy, 0.2) });
  const aR = arm(c, -1, p.right ?? [-sh - 1.4, -47], { sh, sleeve: navy, skin, w: 4.8, cuff: dk(navy, 0.2) });
  s += aR.svg + aL.svg;
  if (p.prop) s += p.prop(aL, aR);
  s += head(c, skin, { w: 1.0 });
  s += face(c, { skin, lw, dx: p.look ?? 0, brow: "#9a7434", mouth: p.mouth ?? "flat", eyeC: "#33557a" });
  // hair pulled back; the pale streak from her RIGHT temple (viewer's left)
  s += P(sm([[-6.5, -88.2, 1], [-6.8, -93], [-4.8, -97.6], [0, -99], [4.8, -97.6], [6.8, -93], [6.5, -88.2, 1], [5.8, -91.6], [3.6, -93.8], [0, -94.4], [-3.6, -93.8], [-5.8, -91.6]]), shade(hair, 0.25, 0.25), { s: INK, w: lw });
  s += P(sm([[-4.6, -94.6], [-3.2, -97.6], [-1.8, -98.2], [-2.6, -95.6], [-4.4, -92.6], [-5.6, -90.4], [-6.1, -89.2]]), streak, { s: dk(hair, 0.35), w: lw * 0.35 });
  // braid: from behind her right ear, forward over her RIGHT shoulder, down the front
  const top = [-6.4, -84.6], bot = [-7.4, -61.6];
  for (let i = 0; i < 7; i++) {
    const t = i / 6.6, q = lerp(top, bot, t), wv = 1.75 - i * 0.07;
    s += E(q[0] - 0.7, q[1] + 0.4, wv, wv * 1.3, hair, { s: INK, w: lw * 0.55, tf: `rotate(-26 ${r(q[0] - 0.7)} ${r(q[1] + 0.4)})` });
    s += E(q[0] + 0.8, q[1] + 1.8, wv, wv * 1.3, streak, { s: INK, w: lw * 0.55, tf: `rotate(26 ${r(q[0] + 0.8)} ${r(q[1] + 1.8)})` });
  }
  s += R(bot[0] - 1.4, bot[1] + 2.6, 2.8, 1.2, navy, { s: INK, w: lw * 0.4 });
  s += P(sm([[bot[0] - 1.2, bot[1] + 3.8], [bot[0] + 1.4, bot[1] + 3.8], [bot[0] + 1, bot[1] + 6], [bot[0], bot[1] + 6.8], [bot[0] - 1, bot[1] + 6]]), hair, { s: INK, w: lw * 0.5 });
  return s;
}

/** Noor Haddad: green headscarf, cream top, brown garden-centre apron, a crow feather in the apron pocket on her LEFT. */
function noor(c, p = {}) {
  const skin = SK.noor, scarf = "#2f8f5c", apron = "#8b6a47", top = "#e9dcc2", lw = c.lw;
  const sh = 9.8;
  let s = "";
  // scarf behind the head and over the shoulders
  s += P(sm(symm([[0, -99.6], [5.8, -98.4], [8.3, -93.6], [8.6, -86.6], [8.8, -81.4], [10.4, -77], [8.6, -73.4], [4, -71.4], [0, -71]])), shade(scarf, 0.16, 0.3), { s: INK, w: lw });
  s += legs(c, "#3c4a36", "#4a3a2c", { spread: p.spread ?? 0.4, hipW: 8.2 });
  s += P(torsoPath(sh, -45, 8.6, 7.6), shade(top, 0.1, 0.2), { s: INK, w: lw });
  // apron bib, waist and straps, to just below the knee
  s += P(poly([[-5.6, -71.8], [5.6, -71.8], [6.2, -58.6], [8.6, -56.8], [9.6, -26.4], [-9.6, -26.4], [-8.6, -56.8], [-6.2, -58.6]]), shade(apron, 0.12, 0.28), { s: INK, w: lw });
  s += S(`M-8.6,-57.2H8.6`, dk(apron, 0.3), lw * 0.45, { dash: "0.9 0.7" });
  s += E(-3.6, -40, 1.2, 0.6, "#4a3626", { op: 0.4 }) + E(-2.2, -37.6, 0.8, 0.45, "#4a3626", { op: 0.35 });   // soil marks
  // pocket on her LEFT (viewer's right) with the crow feather standing in it
  s += P(sm([[5.2, -47.6], [5.6, -52], [6.4, -57.4], [7.6, -62.4], [8.2, -61.8], [7.6, -56.6], [6.8, -51.4], [6.1, -47.6]]), lin([[0, "#4a4458"], [0.5, "#1c1a22"], [1, "#0f0e13"]], 0, 0, 1, 1), { s: INK, w: lw * 0.5 });
  s += S(`M5.7,-47.6L7.9,-62`, "#d8d4cc", lw * 0.3, { op: 0.9 });
  s += R(3.4, -50.4, 5.6, 4.8, lt(apron, 0.06), { s: INK, w: lw * 0.6 });
  s += neck(c, skin, 2.1);
  const aL = arm(c, 1, p.left ?? [sh + 1.4, -47], { sh, sleeve: top, skin, w: 4.0 });
  const aR = arm(c, -1, p.right ?? [-sh - 1.4, -47], { sh, sleeve: top, skin, w: 4.0 });
  s += aR.svg + aL.svg;
  if (p.prop) s += p.prop(aL, aR);
  s += head(c, skin, { w: 0.95, ears: false });
  s += face(c, { skin, lw, dx: p.look ?? 0, brow: "#2a1a12", mouth: p.mouth ?? "smile", eyeC: "#2c1a10", blush: "#d9776a" });
  // the front fold of the scarf framing the face
  const outer = symm([[0, -99.6], [5.8, -98.4], [8.3, -93.6], [8.6, -86.6], [7.8, -81.6], [4.6, -79.4], [0, -78.8]]);
  const inner = symm([[0, -96.2], [4.4, -95.4], [6.2, -91.4], [6.2, -86.8], [4.8, -83.2], [2.4, -81.6], [0, -81.2]]);
  s += P(sm(outer) + sm(inner), lin([[0, lt(scarf, 0.2)], [1, dk(scarf, 0.15)]], 0, 0, 1, 1), { s: INK, w: lw, fr: "evenodd" });
  s += S(`M-3.6,-98.2Q0,-99.2 3.6,-98.2`, lt(scarf, 0.35), lw * 0.55, { op: 0.8 });
  return s;
}

/** Rook in human shape: very tall, very still, long grey coat with a high collar, black swept-back hair, grey eyes. */
function rookMan(c, p = {}) {
  const skin = SK.rook, coat = "#7b7f86", hair = "#17151b", lw = c.lw;
  const sh = 10.2;
  let s = "";
  s += legs(c, "#1f1e24", "#141317", { spread: p.spread ?? 0.2, hipW: 7.4 });
  // long coat, buttoned, to just above the ankle, slight flare
  s += P(sm([[-2.8, -78.4], [-sh + 2.4, -77.8], [-sh, -75.4], [-sh + 0.6, -64], [-8.4, -50], [-9.8, -12.4, 1], [9.8, -12.4, 1], [8.4, -50], [sh - 0.6, -64], [sh, -75.4], [sh - 2.4, -77.8], [2.8, -78.4]]), shade(coat, 0.14, 0.3), { s: INK, w: lw });
  s += P(`M-2.6,-79.6L2.6,-79.6L3,-70L0,-64L-3,-70Z`, "#232228", { s: INK, w: lw * 0.7 });
  for (const sd of [-1, 1]) {
    s += P(sm([[sd * 2.8, -83.2, 1], [sd * 5.6, -82.4], [sd * 7.8, -77.6], [sd * 9.4, -73.6], [sd * 6.8, -70.8], [sd * 0.4, -62.6, 1], [sd * 3.2, -70.4], [sd * 2.8, -77]]), sd < 0 ? lt(coat, 0.06) : dk(coat, 0.06), { s: INK, w: lw * 0.85 });
  }
  s += S(`M0,-62.6V-12.8`, dk(coat, 0.35), lw * 0.5);
  for (const y of [-58, -50, -42, -34]) s += C(1.2, y, 0.55, "#3a3a40");
  s += S(`M-6,-40Q-6.4,-26 -7,-13M6,-40Q6.4,-26 7,-13`, dk(coat, 0.28), lw * 0.4, { op: 0.7 });
  const aL = arm(c, 1, p.left ?? [sh + 0.6, -45], { sh, sleeve: coat, skin, w: 4.2, l1: 17, l2: 16 });
  const aR = arm(c, -1, p.right ?? [-sh - 0.6, -45], { sh, sleeve: coat, skin, w: 4.2, l1: 17, l2: 16 });
  s += aR.svg + aL.svg;
  if (p.prop) s += p.prop(aL, aR);
  s += head(c, skin, { w: 0.9 });
  s += face(c, { skin, lw, dx: p.look ?? 0, brow: hair, mouth: "flat", eyeC: "#7d8890", lids: true });
  s += P(sm([[-5.7, -87.4, 1], [-6.9, -88.6, 1], [-6.2, -90.2], [-7.2, -91.6, 1], [-6.1, -93], [-5.4, -96.6], [-2.8, -98.8], [0, -99.3], [2.8, -98.8], [5.4, -96.6], [6.1, -93], [7.2, -91.6, 1], [6.2, -90.2], [6.9, -88.6, 1], [5.7, -87.4, 1], [5.4, -91.4], [4, -93.6], [0, -94.2], [-4, -93.6], [-5.4, -91.4]]), shade(hair, 0.18, 0.1), { s: INK, w: lw });
  s += S(`M-2.4,-94.2Q-3.2,-96.4 -2.6,-98.2M0.8,-94.2Q0.2,-96.6 0.8,-98.8M3.4,-94Q4.2,-96 3.6,-98`, "#4d4760", lw * 0.45, { op: 0.85 });
  return s;
}

/** Rook in animal shape: a large black rook, side view. facing: -1 = beak to the viewer's left. feetY = perch line (local 0). */
function rookBird(x, y, size, facing = -1, o = {}) {
  // local units: body ~100 long; feet at (0,0); the bird faces -x when facing = -1
  const { sw = 2, looking = 0 } = o;
  const k = size / 100, F = facing;
  const M = ([px, py]) => [x + (F < 0 ? px : -px) * k, y + py * k];
  const lw = sw;
  const black = "#16141a", sheen = "#4a3f66";
  let s = "";
  // tail
  s += P(sm([[30, -34], [62, -22], [78, -14, 1], [70, -10], [54, -14], [26, -22]].map(M)), shade(black, 0.12, 0.1), { s: INK, w: lw });
  // legs (two, side by side; the far one slightly behind) and feet gripping the perch
  for (const [dx, col] of [[4, "#2a2830"], [-2, "#1c1a20"]]) {
    s += S(poly([M([dx, -18]), M([dx - 1, -2])], false), INK, lw * 2.4) + S(poly([M([dx, -18]), M([dx - 1, -2])], false), col, lw * 1.2);
    s += S(poly([M([dx - 9, 0]), M([dx - 1, -1.5]), M([dx + 6, 0])], false), INK, lw * 1.4);
  }
  // body
  const body = [[-26, -46], [-12, -54], [12, -52], [34, -40], [40, -30], [26, -18], [0, -14], [-20, -20], [-30, -32]];
  s += P(sm(body.map(M)), shade(black, 0.14, 0.15), { s: INK, w: lw });
  s += P(sm(body.map(M)), lin([[0, sheen, 0.5], [0.5, sheen, 0], [1, "#3a4a3e", 0.35]], 0, 0, 1, 1));
  // folded wing
  s += P(sm([[-12, -46], [10, -48], [32, -38], [48, -24], [30, -22], [6, -24], [-8, -32]].map(M)), shade("#1c1a22", 0.16, 0.2), { s: INK, w: lw * 0.9 });
  s += S(sm([[0, -40], [22, -36], [38, -26]].map(M), false), sheen, lw * 0.6, { op: 0.8 }) + S(sm([[-2, -32], [18, -29], [32, -24]].map(M), false), sheen, lw * 0.6, { op: 0.7 });
  // head with peaked crown
  const hd = [[-24, -50], [-30, -64], [-24, -74], [-14, -78, 1], [-6, -74], [-2, -64], [-6, -52], [-16, -46]];
  s += P(sm(hd.map(M)), shade(black, 0.16, 0.12), { s: INK, w: lw });
  // pale bare skin at the beak base, then the long straight beak
  s += P(sm([[-28, -68], [-22, -66], [-22, -56], [-28, -52], [-32, -58]].map(M)), "#d8d1c6", { s: INK, w: lw * 0.8 });
  s += P(poly([M([-30, -68]), M([-54, -60]), M([-30, -54])]), lin([[0, "#5a5a62"], [1, "#1c1b20"]], 0, 0, 1, 1), { s: INK, w: lw * 0.9 });
  s += S(poly([M([-31, -60.6]), M([-52, -60])], false), "#8a8a92", lw * 0.5, { op: 0.8 });
  // eye (side view: one visible)
  s += C(...M([-18, -64]), 3.2 * k, "#2a1d16", { s: INK, w: lw * 0.7 }) + C(...M([-18.6, -64.8]), 1 * k, "#ffffff", { op: 0.9 });
  return s;
}

export { K, INK, mix, dk, lt, P, S, E, C, R, G, sm, symm, poly, rng, lin, rad, clip, shade, glow, out, begin, fig, dana, marco, june, quinn, tess, noor, rookMan, rookBird };

// =============================================================== the pieces
const PIECES = {};
const piece = (name, fn) => { PIECES[name] = fn; };

// ----- Chapter 3: the six witches
piece("vignette-ch03", () => {
  const W = 1185, H = 300;
  let s = sky(W, H, K.n1, K.n3);
  s += wisp(300, 230, 500, 60, K.violet, 0.12) + wisp(900, 220, 520, 70, K.violet, 0.1);
  s += C(W / 2, 180, 520, glow(K.lamp, 0.22));
  // a low wall of light behind them: the warm glow of the Lantern House windows
  const ground = 284;
  s += R(0, ground, W, H - ground, lin([[0, "#2a2f45"], [1, "#1a1e2e"]]));
  s += S(`M0,${ground}H${W}`, INK, 2);
  const cast = [["dana", dana, 120], ["marco", marco, 300], ["june", june, 470], ["quinn", quinn, 650], ["tess", tess, 840], ["noor", noor, 1040]];
  for (const [k, fn, x] of cast) {
    const h = 232 * HEIGHT[k];
    s += shadow(x, ground, 24, 4, 0.45);
    s += fig(fn, x, ground, h, {});
  }
  return { vb: `0 0 ${W} ${H}`, title: "The six witches of the coven, side by side", body: s };
});

// =============================================================== run
const want = process.argv.slice(2);
for (const [name, fn] of Object.entries(PIECES)) {
  if (want.length && !want.includes(name)) continue;
  begin(name);
  const { vb, title, body } = fn();
  out(name, vb, title, body);
  console.log("wrote", name);
}
