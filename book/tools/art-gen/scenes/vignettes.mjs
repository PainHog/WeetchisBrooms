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
  const ctx = { s, lw: (pose.lw ?? Math.max(1.3, Math.min(2.6, h / 80))) / s, detail: pose.detail ?? (h > 260 ? "hi" : "lo"), fingers: pose.fingers ?? h >= 140 };
  return `<g transform="translate(${r(x)} ${r(y)}) scale(${r(s * 1000) / 1000})">${drawFn(ctx, pose)}</g>`;
}

/** Which side of the forearm the thumb goes on (hand()'s side): toward the body's centre line, or on top for a level forearm. */
function thumbSide(armSide, dir) {
  const sa = Math.sin(dir), ca = Math.cos(dir);
  return Math.abs(sa) > 0.35 ? armSide * Math.sign(sa) : -Math.sign(ca || 1);
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
  // palm + four fingers + thumb (thinner outlines than the body, so the fingers stay readable when small)
  lw = lw * 0.55;
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
    } else s += E(sd * ex + dx, ey, 1.0, 0.68, "#f4efe6") + C(sd * ex + dx + 0.1, ey, 0.56, eyeC);
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
  const fing = fingers ?? c.fingers;
  const tside = thumbSide(side, dir) * thumb;
  const hs = fing ? handSize * 1.12 : handSize;
  const handSvg = hand(Wr, dir, hs, skin, lw, { side: tside, fingers: fing, open });
  s += handSvg;
  const ca = Math.cos(dir), sa = Math.sin(dir), nx = -sa * tside, ny = ca * tside;
  const thumbTip = [Wr[0] + ca * hs * 0.5 + nx * hs * 0.55, Wr[1] + sa * hs * 0.5 + ny * hs * 0.55];
  return { svg: s, handSvg, wrist: Wr, elbow: El, dir, thumb: thumbTip };
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
  const aL = arm(c, 1, p.left ?? [sh + 1.5, -45.4], { sh, sleeve: denim, skin, cuff: lt(denim, 0.1) });
  const aR = arm(c, -1, p.right ?? [-sh - 1.5, -45.4], { sh, sleeve: denim, skin, cuff: lt(denim, 0.1) });
  if (p.under) s += p.under(aL, aR);
  s += aR.svg + aL.svg;
  // silver ring on her LEFT thumb (the thumb sits toward the body on a hanging hand)
  s += C(aL.thumb[0], aL.thumb[1], 0.7, "#cdd3da", { s: INK, w: lw * 0.35 });
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
  const aL = arm(c, 1, p.left ?? [sh + 1.4, -45.4], { sh, sleeve: shirt, skin, rolled: true, w: 4.8 });
  const aR = arm(c, -1, p.right ?? [-sh - 1.4, -45.4], { sh, sleeve: shirt, skin, rolled: true, w: 4.8 });
  if (p.under) s += p.under(aL, aR);
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
  const aR = arm(c, -1, p.right ?? [-sh - 1.5, -45.6], { sh, sleeve: coat, skin, w: 4.2 });
  // her red notebook, held by its spine in her LEFT hand (viewer's right)
  const aL = arm(c, 1, p.left ?? [sh + 1.8, -46.2], { sh, sleeve: coat, skin, w: 4.2 });
  if (p.notebook !== false && !p.left) {
    const [nx, ny] = aL.wrist;
    s += P(poly([[nx - 2.4, ny + 0.6], [nx + 4.2, ny + 0.2], [nx + 4.8, ny + 9.4], [nx - 1.8, ny + 9.8]]), shade("#b8463a", 0.14, 0.3), { s: INK, w: lw * 0.8 });
    s += S(`M${r(nx - 1.6)},${r(ny + 0.6)}L${r(nx - 1)},${r(ny + 9.7)}`, "#2a1f22", lw * 0.8) + S(`M${r(nx)},${r(ny + 6.8)}L${r(nx + 4.2)},${r(ny + 6.6)}`, "#d9a36a", lw * 0.4);
  }
  if (p.under) s += p.under(aL, aR);
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
  const aL = arm(c, 1, p.left ?? [sh + 1.3, -44.6], { sh, sleeve: card, skin, w: 3.8, l1: 16.6, l2: 15 });
  const aR = arm(c, -1, p.right ?? [-sh - 1.3, -44.6], { sh, sleeve: card, skin, w: 3.8, l1: 16.6, l2: 15 });
  if (p.under) s += p.under(aL, aR);
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
    d += `M${r(cx - cr)},${r(cy)}a${r(cr)},${r(cr)} 0 0 1 ${r(cr * 2)},0`;
  }
  s += S(d, dk(col, 0.28), lw * 0.4, { op: 0.6 });
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
  const aL = arm(c, 1, p.left ?? [sh + 1.4, -45.4], { sh, sleeve: navy, skin, w: 4.8, cuff: dk(navy, 0.2) });
  const aR = arm(c, -1, p.right ?? [-sh - 1.4, -45.4], { sh, sleeve: navy, skin, w: 4.8, cuff: dk(navy, 0.2) });
  if (p.under) s += p.under(aL, aR);
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
  s += P(sm([[4.8, -47.6, 1], [4.6, -53], [5.4, -59.4], [7.4, -65.4], [8.8, -64.4], [8.4, -58.4], [7.4, -52.4], [6.6, -47.6, 1]]), lin([[0, "#4a4458"], [0.5, "#1c1a22"], [1, "#0f0e13"]], 0, 0, 1, 1), { s: INK, w: lw * 0.5 });
  s += S(`M5.6,-47.6Q6,-57 8.1,-64.8`, "#d8d4cc", lw * 0.3, { op: 0.9 });
  s += R(3.4, -50.4, 5.6, 4.8, lt(apron, 0.06), { s: INK, w: lw * 0.6 });
  s += neck(c, skin, 2.1);
  const aL = arm(c, 1, p.left ?? [sh + 1.4, -45.4], { sh, sleeve: top, skin, w: 4.0 });
  const aR = arm(c, -1, p.right ?? [-sh - 1.4, -45.4], { sh, sleeve: top, skin, w: 4.0 });
  if (p.under) s += p.under(aL, aR);
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
  s += neck(c, skin, 2.1, -84, -74);
  s += P(`M-2.8,-76.4Q0,-75 2.8,-76.4L3,-70L0,-64L-3,-70Z`, "#232228", { s: INK, w: lw * 0.7 });
  for (const sd of [-1, 1]) {
    s += P(sm([[sd * 2.8, -83.2, 1], [sd * 5.6, -82.4], [sd * 7.8, -77.6], [sd * 9.4, -73.6], [sd * 6.8, -70.8], [sd * 0.4, -62.6, 1], [sd * 3.2, -70.4], [sd * 2.8, -77]]), sd < 0 ? lt(coat, 0.06) : dk(coat, 0.06), { s: INK, w: lw * 0.85 });
  }
  s += S(`M0,-62.6V-12.8`, dk(coat, 0.35), lw * 0.5);
  for (const y of [-58, -50, -42, -34]) s += C(1.2, y, 0.55, "#3a3a40");
  s += S(`M-6,-40Q-6.4,-26 -7,-13M6,-40Q6.4,-26 7,-13`, dk(coat, 0.28), lw * 0.4, { op: 0.7 });
  const aL = arm(c, 1, p.left ?? [sh + 0.8, -43.4], { sh, sleeve: coat, skin, w: 4.2, l1: 17, l2: 16 });
  const aR = arm(c, -1, p.right ?? [-sh - 0.8, -43.4], { sh, sleeve: coat, skin, w: 4.2, l1: 17, l2: 16 });
  if (p.under) s += p.under(aL, aR);
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

// ---------------------------------------------------------------- other people
/** A generic person (bystanders, players, the innocent). Options set skin, hair style and clothes. */
function civ(o = {}) {
  return (c, p = {}) => {
    const q = { skin: "#d9a982", hair: "#3a2a20", style: "short", top: "#6a7a5a", bottom: "#30343f", shoe: "#2a2420", sh: 10, coat: null, coatLen: -40, mouth: "smile", eyeC: "#2a1a12", hat: null, scarf: null, ...o, ...p };
    const lw = c.lw, sh = q.sh;
    let s = "";
    if (q.style === "long" || q.style === "beanie") s += P(sm(symm([[0, -99], [6, -97.4], [7.8, -91], [8.4, -82], [8.8, q.hairLen ?? -72, 1], [0, q.hairLen ?? -72, 1]])), shade(q.hair, 0.14, 0.22), { s: INK, w: lw });
    if (q.style === "curly") s += curls(c, [[0, -93.5, 8.6], [-6.8, -89, 5], [6.8, -89, 5], [-6.4, -83, 4.2], [6.4, -83, 4.2]], q.hair, 31);
    if (q.style === "bun") s += C(0, -99.6, 3.1, q.hair, { s: INK, w: lw });
    if (!q.noLegs) s += legs(c, q.bottom, q.shoe, { spread: q.spread ?? 0.4, hipW: sh - 1.4 });
    if (q.skirt) s += P(sm([[-sh + 1.4, -48, 1], [sh - 1.4, -48, 1], [sh + 1.4, q.skirt, 1], [-sh - 1.4, q.skirt, 1]]), shade(q.skirtC ?? q.bottom), { s: INK, w: lw });
    s += P(torsoPath(sh, -45, sh - 1.2, sh - 2.4), shade(q.top), { s: INK, w: lw });
    if (q.coat) {
      for (const sd of [-1, 1]) s += P(sm([[sd * 3, -78.6, 1], [sd * (sh - 2.3), -77.9], [sd * (sh + 0.2), -75.2], [sd * (sh - 0.2), -60], [sd * (sh + 0.6), q.coatLen, 1], [sd * 3.4, q.coatLen, 1], [sd * 2.6, -60]]), shade(q.coat, 0.14, 0.3), { s: INK, w: lw });
      for (const sd of [-1, 1]) s += P(poly([[sd * 3, -79], [sd * 6.8, -77.6], [sd * 5.4, -72], [sd * 2.6, -70.6]]), lt(q.coat, 0.1), { s: INK, w: lw * 0.7 });
    }
    if (q.scarf) s += P(sm([[-4.2, -79.6], [0, -78], [4.2, -79.6], [4.8, -76.4], [0, -74.4], [-4.8, -76.4]]), q.scarf, { s: INK, w: lw * 0.7 });
    s += neck(c, q.skin, 2.2);
    const sleeve = q.coat ?? q.top;
    const aL = arm(c, 1, q.left ?? [sh + 1.4, -45.4], { sh, sleeve, skin: q.skin, w: 4.1, bend: q.bendL ?? 1 });
    const aR = arm(c, -1, q.right ?? [-sh - 1.4, -45.4], { sh, sleeve, skin: q.skin, w: 4.1, bend: q.bendR ?? 1 });
    if (q.under) s += q.under(aL, aR);
    if (p.under) s += p.under(aL, aR);
  s += aR.svg + aL.svg;
    if (q.prop) s += q.prop(aL, aR);
    if (q.back) {
      s += head(c, q.skin, { w: q.headW ?? 0.97, ears: true });
      const backHair = q.style === "long" || q.style === "beanie" ? [[-7.8, q.hairLen ?? -72, 1], [-8, -90], [-5.6, -97.6], [0, -99.2], [5.6, -97.6], [8, -90], [7.8, q.hairLen ?? -72, 1]] : q.style === "bald" ? null : [[-6.4, -84.6, 1], [-6.8, -92], [-4.8, -97.6], [0, -99.2], [4.8, -97.6], [6.8, -92], [6.4, -84.6, 1], [0, -82.4]];
      if (q.style === "curly") s += curls(c, [[0, -92, 8.4], [-6, -87, 4.6], [6, -87, 4.6], [-3, -84, 4], [3, -84, 4]], q.hair, 33);
      else if (backHair) s += P(sm(backHair), shade(q.hair, 0.18, 0.25), { s: INK, w: lw });
      if (q.style === "bun") s += C(0, -96, 3, q.hair, { s: INK, w: lw });
      if (q.style === "beanie") s += P(sm([[-7.2, -92], [-6.6, -97.6], [-3, -100.6], [3, -100.6], [6.6, -97.6], [7.2, -92]]), shade(q.hatC ?? "#b5482e", 0.18, 0.3), { s: INK, w: lw });
      return s;
    }
    s += head(c, q.skin, { w: q.headW ?? 0.97, ears: q.style !== "beanie" && q.style !== "long" });
    s += face(c, { skin: q.skin, lw, dx: q.look ?? 0, brow: q.brow ?? dk(q.hair, 0.2), mouth: q.mouth, eyeC: q.eyeC, glasses: q.glasses });
    const cap = [[-6.6, -88.2, 1], [-6.8, -93], [-4.8, -97.6], [0, -99.2], [4.8, -97.6], [6.8, -93], [6.6, -88.2, 1], [5.8, -91.6], [3.6, -93.8], [0, -94.4], [-3.6, -93.8], [-5.8, -91.6]];
    if (q.style === "short" || q.style === "bun") s += P(sm(cap), shade(q.hair, 0.2, 0.2), { s: INK, w: lw });
    if (q.style === "long") s += P(sm([[-7.6, -80, 1], [-7.8, -90], [-5.4, -97.4], [0, -99.2], [5.4, -97.4], [7.8, -90], [7.6, -80, 1], [6.2, -80, 1], [6, -89], [3, -94.4], [0.4, -94], [-3.6, -93.2], [-6, -89], [-6.2, -80, 1]]), shade(q.hair, 0.18, 0.2), { s: INK, w: lw });
    if (q.style === "curly") s += curls(c, [[-5, -93.8, 2.9], [-2.4, -96.4, 3.1], [0.8, -96.8, 3.2], [3.8, -95.6, 3], [5.6, -93, 2.6]], q.hair, 32);
    if (q.style === "bald") s += P(sm([[-6.4, -86.6, 1], [-6.6, -91.6], [-5.4, -93.6], [-5.6, -90.4], [-5.8, -86.6, 1]]), q.hair, { s: INK, w: lw * 0.6 }) + P(sm([[6.4, -86.6, 1], [6.6, -91.6], [5.4, -93.6], [5.6, -90.4], [5.8, -86.6, 1]]), q.hair, { s: INK, w: lw * 0.6 });
    if (q.style === "beanie") {
      s += P(sm([[-7.8, -80, 1], [-7.6, -89], [-6, -92.6], [6, -92.6], [7.6, -89], [7.8, -80, 1], [6.2, -80, 1], [6, -88.6], [-6, -88.6], [-6.2, -80, 1]]), shade(q.hair, 0.18, 0.2), { s: INK, w: lw });
      s += P(sm([[-7.2, -92], [-6.6, -97.6], [-3, -100.6], [3, -100.6], [6.6, -97.6], [7.2, -92]]), shade(q.hatC ?? "#b5482e", 0.18, 0.3), { s: INK, w: lw });
      s += R(-7.6, -93.4, 15.2, 2.6, dk(q.hatC ?? "#b5482e", 0.12), { s: INK, w: lw * 0.8, rx: 1 });
    }
    if (q.hat === "cap") s += P(sm([[-6.8, -92.4, 1], [-6.4, -97], [0, -100], [6.4, -97], [6.8, -92.4, 1]]), shade(q.hatC ?? "#4a4a52"), { s: INK, w: lw }) + P(poly([[-6.8, -92.4], [6.8, -92.4], [8.8, -91.2], [-6.8, -91.2]]), dk(q.hatC ?? "#4a4a52", 0.2), { s: INK, w: lw * 0.8 });
    if (q.glassesOnly) s += "";
    return s;
  };
}

// ---------------------------------------------------------------- threats
/** The Quiet Man: a demon in a grey suit and hat; a face nobody can describe; holds a glass radio valve with a stolen voice in it. */
function quietMan(c, p = {}) {
  const skin = SK.quiet, suit = "#6f7076", hat = "#3c3c43", lw = c.lw, sh = 10;
  let s = "";
  s += legs(c, suit, "#1c1c20", { spread: 0.2, hipW: 8 });
  s += P(sm([[-2.8, -78.4], [-sh + 2.4, -77.8], [-sh, -75.4], [-sh + 0.5, -64], [-8.4, -46], [-8.2, -40, 1], [8.2, -40, 1], [8.4, -46], [sh - 0.5, -64], [sh, -75.4], [sh - 2.4, -77.8], [2.8, -78.4]]), shade(suit, 0.12, 0.3), { s: INK, w: lw });
  s += P(`M-3.2,-78.6L3.2,-78.6L1.4,-60L-1.4,-60Z`, "#e8e6e0", { s: INK, w: lw * 0.6 });
  s += P(poly([[-0.8, -77], [0.8, -77], [1.1, -63], [0, -61.6], [-1.1, -63]]), "#1c1c22", { s: INK, w: lw * 0.4 });
  for (const sd of [-1, 1]) s += P(poly([[sd * 3.2, -78.8], [sd * 1.4, -60.4], [sd * 4.2, -64], [sd * 6.4, -72], [sd * 5.8, -77.4]]), lt(suit, 0.08), { s: INK, w: lw * 0.6 });
  s += neck(c, skin, 2.2);
  const aR = arm(c, -1, [-sh - 0.8, -45], { sh, sleeve: suit, skin, w: 4 });
  const vh = p.valveHand ?? [5.4, -60];
  const aL = arm(c, 1, vh, { sh, sleeve: suit, skin, w: 4, bend: -0.7 });
  if (p.under) s += p.under(aL, aR);
  s += aR.svg + aL.svg;
  if (p.valve !== false) {
    // the valve held upright in his LEFT hand: a glass bulb on a dark base, glowing faintly
    const [vx, vy] = [aL.wrist[0] + 1.6, aL.wrist[1] - 1.2];
    s += C(vx, vy - 3.4, 6, glow(K.lamp, 0.5));
    s += R(vx - 1.3, vy - 1.2, 2.6, 1.8, "#2a2a30", { s: INK, w: lw * 0.5 });
    s += P(sm([[vx - 1.2, vy - 1.2, 1], [vx - 1.5, vy - 4.4], [vx - 0.9, vy - 6.4], [vx, vy - 6.9], [vx + 0.9, vy - 6.4], [vx + 1.5, vy - 4.4], [vx + 1.2, vy - 1.2, 1]]), lin([[0, "#fff6d6", 0.9], [1, K.gold, 0.7]]), { s: INK, w: lw * 0.5 });
    s += C(vx, vy - 3.8, 0.7, "#ffffff", { op: 0.9 });
  }
  s += head(c, skin, { w: 0.95 });
  s += E(-2.4, -89.2, 0.75, 0.55, "#e6ecef") + E(2.4, -89.2, 0.75, 0.55, "#e6ecef");               // pale eyes, nothing else he lets you see
  s += S(`M-1,-84.6H1`, dk(skin, 0.3), lw * 0.4, { op: 0.6 });
  // hat
  s += P(sm([[-10, -93.6, 1], [-6.4, -94.8], [-5.8, -100.4], [-2, -102.2], [0, -101], [2, -102.2], [5.8, -100.4], [6.4, -94.8], [10, -93.6, 1], [6, -92.6], [-6, -92.6]]), shade(hat, 0.16, 0.25), { s: INK, w: lw });
  s += P(poly([[-6.1, -96.6], [6.1, -96.6], [6.3, -94.9], [-6.3, -94.9]]), "#1a1a1f");
  return s;
}

/** The Ash Widow: a fire spirit in a burned wedding dress; veil; dark hair up with a band of orange blossom; embers rise from her. */
function ashWidow(c, p = {}) {
  const skin = SK.widow, dress = "#e8e0d4", hair = "#2e2a2a", lw = c.lw, sh = 9;
  let s = "";
  // veil behind, to the waist
  s += P(sm([[-6.6, -96], [-9.6, -84], [-12, -62], [-11, -52, 1], [11, -52, 1], [12, -62], [9.6, -84], [6.6, -96]]), "#f4efe6", { s: INK, w: lw * 0.7, fop: 0.55 });
  // the dress, to the ground; the hem burned ragged and glowing
  const hem = [];
  const R0 = rng(9);
  for (let i = 0; i <= 12; i++) { const x = 13.4 - i * 26.8 / 12; hem.push([x, -0.4 - (i % 2 ? 3.2 + R0() * 2 : 0.2)]); }
  const dressD = sm([[-2.8, -78.4], [-sh + 2.2, -77.8], [-sh, -75.4], [-sh + 1.4, -66], [-6, -56], [-9, -36], [-13.4, -0.4, 1], ...hem.slice(1, -1).reverse().map(([x, y]) => [x, y, 1]).reverse(), [13.4, -0.4, 1], [9, -36], [6, -56], [sh - 1.4, -66], [sh, -75.4], [sh - 2.2, -77.8], [2.8, -78.4]].map(q => q));
  s += P(dressD, lin([[0, "#fbf7f0"], [0.6, dress], [0.88, "#b9aa98"], [1, "#3a2e28"]]), { s: INK, w: lw });
  s += P(poly([...hem.map(([x, y]) => [x, y - 1.6])], false) + "", "none", { s: K.fire, w: lw * 1.4, op: 0.9 });
  s += S(poly(hem, false), "#2a2321", lw * 0.8);
  s += S(`M-6,-56Q0,-53.6 6,-56`, "#c9bba8", lw * 0.5);
  for (let i = 0; i < 7; i++) s += C(-4.2 + i * 1.4, -74.4 + Math.abs(i - 3) * 0.3, 0.55, "#fffaf0", { s: INK, w: lw * 0.25 });   // pearls
  s += neck(c, skin, 2);
  const aL = arm(c, 1, p.left ?? [sh + 1.4, -46], { sh, sleeve: dress, skin, w: 3.4 });
  const aR = arm(c, -1, p.right ?? [-sh - 1.4, -46], { sh, sleeve: dress, skin, w: 3.4 });
  if (p.under) s += p.under(aL, aR);
  s += aR.svg + aL.svg;
  s += head(c, skin, { w: 0.92 });
  s += E(-2.4, -89.3, 0.7, 0.6, "#ff9a3c") + E(2.4, -89.3, 0.7, 0.6, "#ff9a3c");
  s += S(`M-3.4,-91.6Q-2.4,-92.2 -1.4,-91.8M1.4,-91.8Q2.4,-92.2 3.4,-91.6`, hair, lw * 0.6);
  s += S(`M-1,-84.4Q0,-85 1,-84.4`, dk(skin, 0.45), lw * 0.5);
  s += P(sm([[-6.4, -87.6, 1], [-6.6, -93], [-4.6, -97.4], [0, -98.6], [4.6, -97.4], [6.6, -93], [6.4, -87.6, 1], [5.6, -91.6], [3, -93.6], [0, -94], [-3, -93.6], [-5.6, -91.6]]), shade(hair, 0.18, 0.2), { s: INK, w: lw });
  s += C(0, -100.6, 3, hair, { s: INK, w: lw });                                                           // bun
  for (let i = 0; i < 6; i++) { const a = Math.PI * (1.05 + i * 0.18); s += C(Math.cos(a) * 6.2, -93 + Math.sin(a) * 5.2, 0.9, i > 3 ? "#5a4a3a" : "#fffdf5", { s: INK, w: lw * 0.3 }); }   // blossom band, half burned
  if (p.embers !== false) {
    const R1 = rng(17);
    for (let i = 0; i < 14; i++) { const x = (R1() - 0.5) * 30, y = -10 - R1() * 80; s += C(x, y, 0.4 + R1() * 0.5, R1() < 0.5 ? K.fire : K.fireHi, { op: r(0.5 + R1() * 0.5) }); }
  }
  return s;
}

/** The Mirror Thief: a thin creature with a head of mirror-silver facets; long arms; five long fingers on each hand. */
function mirrorThief(c, p = {}) {
  const coat = "#2d4a4c", skin = "#c9d2d6", lw = c.lw, sh = 8.4;
  let s = "";
  s += legs(c, "#1e2e30", "#141c1e", { spread: p.spread ?? 3, hipW: 6.4, kneeW: 2.2, ankleW: 1.6 });
  s += P(sm([[-2.4, -78.4], [-sh + 2, -77.8], [-sh, -75.4], [-6.6, -60], [-7.6, -30, 1], [7.6, -30, 1], [6.6, -60], [sh, -75.4], [sh - 2, -77.8], [2.4, -78.4]]), shade(coat, 0.14, 0.32), { s: INK, w: lw });
  s += S(`M0,-74V-30.4`, dk(coat, 0.4), lw * 0.5);
  const reach = p.reach ?? [-26, -66];
  const aR = arm(c, -1, reach, { sh, sleeve: coat, skin, w: 3, l1: 19, l2: 18, handSize: 6, fingers: true, open: true });
  const aL = arm(c, 1, p.left ?? [sh + 3, -40], { sh, sleeve: coat, skin, w: 3, l1: 19, l2: 18, handSize: 6, fingers: true, open: true });
  s += aL.svg + aR.svg;
  s += R(-1.6, -84, 3.2, 6, "#8e9aa0", { s: INK, w: lw * 0.6 });
  // faceted mirror head (no ears, no hair)
  const hd = [[0, -101], [4.6, -98.6], [6, -92], [5, -85.4], [0, -82.4], [-5, -85.4], [-6, -92], [-4.6, -98.6]];
  s += P(poly(hd), lin([[0, "#f2f6f8"], [0.5, "#aab6bd"], [1, "#5d6b73"]], 0, 0, 1, 1), { s: INK, w: lw });
  s += P(poly([[0, -101], [1.2, -92.4], [-6, -92]]), "#ffffff", { op: 0.45 }) + P(poly([[1.2, -92.4], [5, -85.4], [6, -92]]), "#3d4a52", { op: 0.4 }) + P(poly([[1.2, -92.4], [0, -82.4], [-5, -85.4]]), "#7d8a92", { op: 0.4 });
  s += S(`M0,-101L1.2,-92.4L-6,-92M1.2,-92.4L6,-92M1.2,-92.4L0,-82.4M1.2,-92.4L5,-85.4M-5,-85.4L1.2,-92.4`, INK, lw * 0.4, { op: 0.6 });
  return s;
}

/** A ghost of the Drowned Choir (waist up, rising out of the water or mud): bonnet or loose hair, mouth open, singing. */
function ghost(c, p = {}) {
  const lw = c.lw, g = "#9fd3c4", hair = p.hair ?? "#2c4a48";
  let s = "";
  s += P(sm([[-2.6, -78.4], [-8, -77.4], [-9.6, -74], [-9.4, -60], [-9.8, -50, 1], [9.8, -50, 1], [9.4, -60], [9.6, -74], [8, -77.4], [2.6, -78.4]]), lin([[0, "#5f8f86", 0.85], [1, "#3e6a66", 0.2]]), { s: "#1c3a38", w: lw * 0.8 });
  s += head(c, "#b9d5ca", { w: 0.92, ears: false, lw: lw * 0.8 });
  if (p.bonnet) s += P(sm([[-7.6, -84, 1], [-7.8, -93], [-5, -99], [0, -100.4], [5, -99], [7.8, -93], [7.6, -84, 1], [6, -88], [5.4, -94], [0, -95.6], [-5.4, -94], [-6, -88]]), "#56807a", { s: "#1c3a38", w: lw * 0.8 });
  else s += P(sm([[-7, -78, 1], [-7.4, -90], [-5, -97.6], [0, -99], [5, -97.6], [7.4, -90], [7, -78, 1], [5.8, -78, 1], [5.6, -90], [3, -94], [-3, -94], [-5.6, -90], [-5.8, -78, 1]]), hair, { s: "#1c3a38", w: lw * 0.8, op: 0.9 });
  s += E(-2.4, -89.4, 0.7, 0.5, "#1c3a38") + E(2.4, -89.4, 0.7, 0.5, "#1c3a38");
  s += E(0, -84.6, 1, 1.4, "#1c3a38");
  return G(s, { op: p.op ?? 0.85 });
}

// ---------------------------------------------------------------- city kit
/** A distant building block: body, roof and a grid of windows (some lit). */
function block(x, base, w, h, col, o = {}) {
  const { roof = "flat", rows = 3, cols = 2, seed = 1, litP = 0.45, sw = 1.2, warm = K.lamp, roofH = w * 0.32 } = o;
  const R0 = rng(seed);
  let s = "";
  if (roof === "gable") s += P(poly([[x - 1, base - h], [x + w / 2, base - h - roofH], [x + w + 1, base - h]]), dk(col, 0.25), { s: INK, w: sw });
  if (roof === "slope") s += P(poly([[x - 1, base - h], [x + w * 0.1, base - h - roofH * 0.5], [x + w * 0.9, base - h - roofH * 0.5], [x + w + 1, base - h]]), dk(col, 0.25), { s: INK, w: sw });
  s += R(x, base - h, w, h, lin([[0, lt(col, 0.06)], [1, dk(col, 0.22)]]), { s: INK, w: sw });
  if (rows && cols) {
    const mx = w * 0.16, my = h * 0.12, gw = (w - 2 * mx) / cols, gh = (h - 2 * my) / rows;
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      const lit = R0() < litP;
      s += R(x + mx + j * gw + gw * 0.22, base - h + my + i * gh + gh * 0.2, gw * 0.56, gh * 0.55, lit ? warm : dk(col, 0.35), { op: lit ? 0.95 : 0.8 });
    }
  }
  return s;
}
/** A row of distant terraced houses with pitched roofs and chimneys, stepping up a slope. */
function terraceRow(x0, x1, base, o = {}) {
  const { seed = 2, hMin = 34, hMax = 48, wMin = 22, wMax = 32, cols = [K.slate, "#5a4f60", "#4a5468", "#5d5050"], slope = 0, litP = 0.45, sw = 1.2, rows = 2 } = o;
  const R0 = rng(seed);
  let s = "", x = x0;
  while (x < x1) {
    const w = wMin + R0() * (wMax - wMin), h = hMin + R0() * (hMax - hMin), b = base - (x - x0) * slope;
    const col = cols[Math.floor(R0() * cols.length)];
    s += R(x + w * 0.62, b - h - w * 0.36, w * 0.12, w * 0.3, dk(col, 0.2), { s: INK, w: sw * 0.8 });   // chimney
    s += block(x, b, w, h, col, { roof: "gable", rows, cols: 2, seed: Math.floor(R0() * 1e6), litP, sw, roofH: w * 0.28 });
    x += w;
  }
  return s;
}
/** A gantry crane on the docks: legs on the quay (base), boom out over the water. */
function crane(x, base, h, col = "#3e4a63", o = {}) {
  const { sw = 1.4, boom = 1 } = o;
  const top = base - h, lw = h * 0.035;
  let s = "";
  for (const dx of [-h * 0.16, h * 0.16]) s += R(x + dx - lw / 2, top + h * 0.1, lw, h * 0.9, col, { s: INK, w: sw });
  s += S(`M${r(x - h * 0.16)},${r(base - h * 0.15)}L${r(x + h * 0.16)},${r(top + h * 0.25)}M${r(x + h * 0.16)},${r(base - h * 0.15)}L${r(x - h * 0.16)},${r(top + h * 0.25)}`, INK, sw * 0.7);
  s += R(x - h * 0.3, top, h * (0.3 + 0.7 * boom), h * 0.07, col, { s: INK, w: sw });
  s += R(x - h * 0.12, top - h * 0.12, h * 0.2, h * 0.13, dk(col, 0.1), { s: INK, w: sw });
  s += C(x + h * 0.6 * boom, top + h * 0.035, h * 0.018, K.red);                                        // warning light
  return s;
}
/** The old radio tower: a lattice mast standing on base. */
function radioMast(x, base, h, o = {}) {
  const { sw = 1.2, col = "#6c6f7a", light = true } = o;
  const b = h * 0.09, t = h * 0.014, segs = 9;
  let d = `M${r(x - b)},${r(base)}L${r(x - t)},${r(base - h)}M${r(x + b)},${r(base)}L${r(x + t)},${r(base - h)}`;
  for (let i = 0; i < segs; i++) {
    const y0 = base - h * i / segs, y1 = base - h * (i + 1) / segs, w0 = b - (b - t) * i / segs, w1 = b - (b - t) * (i + 1) / segs;
    d += `M${r(x - w0)},${r(y0)}L${r(x + w1)},${r(y1)}M${r(x + w0)},${r(y0)}L${r(x - w1)},${r(y1)}M${r(x - w1)},${r(y1)}H${r(x + w1)}`;
  }
  let s = S(d, INK, sw * 2.2) + S(d, col, sw);
  s += R(x - h * 0.05, base - h * 0.8, h * 0.1, h * 0.012, col, { s: INK, w: sw * 0.7 });
  s += S(`M${r(x)},${r(base - h)}V${r(base - h * 1.08)}`, INK, sw * 1.2);
  if (light) s += C(x, base - h * 1.08, h * 0.05, glow(K.red, 0.6)) + C(x, base - h * 1.08, h * 0.012, K.red, { s: INK, w: sw * 0.5 });
  return s;
}
/** The lighthouse on the harbour wall. beam: angle in degrees (0 = right). */
function lighthouse(x, base, h, o = {}) {
  const { sw = 1.4, beam = null, beamLen = h * 3 } = o;
  const bw = h * 0.16, tw = h * 0.1, ly = base - h * 0.78;
  let s = "";
  if (beam != null) {
    const a = beam * Math.PI / 180, sp = 0.1;
    s += P(poly([[x, ly - h * 0.08], [x + Math.cos(a - sp) * beamLen, ly - h * 0.08 + Math.sin(a - sp) * beamLen], [x + Math.cos(a + sp) * beamLen, ly - h * 0.08 + Math.sin(a + sp) * beamLen]]), lin([[0, K.lamp, 0.4], [1, K.lamp, 0]], x, ly, x + Math.cos(a) * beamLen, ly + Math.sin(a) * beamLen, true));
  }
  s += P(poly([[x - bw, base], [x - tw, ly], [x + tw, ly], [x + bw, base]]), lin([[0, "#f1ece0"], [1, "#a9a49a"]], 0, 0, 1, 0), { s: INK, w: sw });
  for (const t of [0.25, 0.55]) { const y0 = base - h * 0.78 * t, w0 = bw - (bw - tw) * t, y1 = y0 - h * 0.08, w1 = bw - (bw - tw) * (t + 0.1); s += P(poly([[x - w0, y0], [x - w1, y1], [x + w1, y1], [x + w0, y0]]), "#3e4a63", { s: INK, w: sw * 0.7 }); }
  s += R(x - tw * 1.5, ly - h * 0.025, tw * 3, h * 0.03, "#2b2f3a", { s: INK, w: sw });                  // gallery
  s += C(x, ly - h * 0.09, h * 0.18, glow(K.lamp, 0.65));
  s += R(x - tw * 0.85, ly - h * 0.15, tw * 1.7, h * 0.12, lin([[0, K.glow], [1, K.gold]]), { s: INK, w: sw });
  s += S(`M${r(x)},${r(ly - h * 0.15)}V${r(ly - h * 0.03)}`, INK, sw * 0.5);
  s += P(`M${r(x - tw * 1.1)},${r(ly - h * 0.15)}Q${r(x)},${r(ly - h * 0.27)} ${r(x + tw * 1.1)},${r(ly - h * 0.15)}Z`, "#2b2f3a", { s: INK, w: sw });
  return s;
}
/** A ferry on the water (waterline y), cabin windows lit. dir: -1 bow to the left. */
function ferry(x, wy, w, o = {}) {
  const { dir = 1, sw = 1.4, hull = "#2c3550", cabin = "#e9e3d4" } = o;
  const h = w * 0.16, M = ([px, py]) => [x + px * w * dir, wy + py * w];
  let s = "";
  s += P(poly([M([-0.5, -0.02]), M([-0.46, -0.13]), M([0.5, -0.13]), M([0.44, 0.0])]), shade(hull, 0.15, 0.3), { s: INK, w: sw });
  s += S(poly([M([-0.47, -0.09]), M([0.48, -0.09])], false), K.red, sw * 1.2);
  s += P(poly([M([-0.34, -0.13]), M([-0.32, -0.25]), M([0.3, -0.25]), M([0.36, -0.13])]), lin([[0, cabin], [1, dk(cabin, 0.2)]]), { s: INK, w: sw });
  for (let i = 0; i < 8; i++) { const a = M([-0.28 + i * 0.075, -0.225]), b = M([-0.235 + i * 0.075, -0.17]); s += R(Math.min(a[0], b[0]), a[1], Math.abs(b[0] - a[0]), b[1] - a[1], K.lamp, { s: INK, w: sw * 0.5 }); }
  s += P(poly([M([-0.18, -0.25]), M([-0.16, -0.33]), M([0.16, -0.33]), M([0.18, -0.25])]), lin([[0, cabin], [1, dk(cabin, 0.2)]]), { s: INK, w: sw });
  s += R(Math.min(M([0.04, 0])[0], M([0.12, 0])[0]), M([0, -0.42])[1], Math.abs(M([0.08, 0])[0] - x), w * 0.09, "#b5473f", { s: INK, w: sw });   // funnel
  s += S(poly([M([-0.08, -0.33]), M([-0.08, -0.45])], false), INK, sw);
  s += C(...M([-0.08, -0.46]), w * 0.01, K.lamp);
  return s;
}

/** An open book seen from above at an angle (spine along the centre), pages with squiggle "writing". */
function openBook(cx, cy, w, o = {}) {
  const { sw = 1.6, cover = "#5a3248", page = K.paper, rot = 0, seed = 3, drawing = "leaf" } = o;
  const h = w * 0.62, R0 = rng(seed);
  let s = "";
  // cover edges under the pages
  s += P(sm([[-w * 0.52, -h * 0.44], [0, -h * 0.5, 1], [w * 0.52, -h * 0.44], [w * 0.53, h * 0.48, 1], [0, h * 0.5, 1], [-w * 0.53, h * 0.48, 1]].map(([x, y, c]) => [x, y, c ?? 1])), dk(cover, 0.1), { s: INK, w: sw });
  // page blocks (a few page edges)
  for (const sd of [-1, 1]) {
    const pg = [[sd * 0.02 * w, -h * 0.46], [sd * 0.25 * w, -h * 0.5], [sd * 0.49 * w, -h * 0.42, 1], [sd * 0.49 * w, h * 0.42, 1], [sd * 0.25 * w, h * 0.38], [sd * 0.02 * w, h * 0.44, 1]];
    s += P(sm(pg.map((q, i) => i === 0 ? [...q, 1] : q)), lin([[0, lt(page, 0.3)], [1, dk(page, 0.08)]], sd < 0 ? 1 : 0, 0, sd < 0 ? 0 : 1, 0), { s: INK, w: sw });
    s += S(`M${r(sd * 0.49 * w)},${r(-h * 0.39)}L${r(sd * 0.505 * w)},${r(h * 0.44)}`, dk(page, 0.2), sw * 0.5);
    // writing squiggles
    let d = "";
    for (let i = 0; i < 9; i++) {
      const y = -h * 0.33 + i * h * 0.075, xa = sd < 0 ? -0.44 * w : 0.08 * w, xb = sd < 0 ? -0.08 * w : 0.44 * w;
      if (drawing && sd > 0 && i > 1 && i < 7) continue;
      let x = xa; d += `M${r(x)},${r(y)}`;
      while (x < xb) { const step = w * (0.012 + R0() * 0.01); d += `q${r(step / 2)},${r(-h * 0.02)} ${r(step)},0`; x += step; if (R0() < 0.08) { x += w * 0.02; d += `m${r(w * 0.02)},0`; } }
    }
    s += S(d, "#5a4a3a", sw * 0.45, { op: 0.75 });
  }
  if (drawing === "leaf") {
    const lx = w * 0.26, ly = h * 0.02;
    s += S(`M${r(lx - w * 0.06)},${r(ly + h * 0.16)}Q${r(lx)},${r(ly)} ${r(lx + w * 0.02)},${r(ly - h * 0.16)}`, "#5a4a3a", sw * 0.6);
    for (const k of [-1, 1]) for (const t of [0.3, 0.6]) s += P(`M${r(lx - w * 0.04 + t * w * 0.05)},${r(ly + h * 0.12 - t * h * 0.28)}q${r(k * w * 0.05)},${r(-h * 0.02)} ${r(k * w * 0.07)},${r(-h * 0.09)}q${r(-k * w * 0.05)},${r(0)} ${r(-k * w * 0.07)},${r(h * 0.09)}`, "#7a9a6a", { s: "#5a4a3a", w: sw * 0.4, op: 0.85 });
  } else if (drawing === "moon") {
    s += C(w * 0.26, 0, h * 0.13, "none", { s: "#5a4a3a", w: sw * 0.6 }) + P(`M${r(w * 0.26)},${r(-h * 0.13)}A${r(h * 0.13)},${r(h * 0.13)} 0 0 1 ${r(w * 0.26)},${r(h * 0.13)}A${r(h * 0.07)},${r(h * 0.13)} 0 0 0 ${r(w * 0.26)},${r(-h * 0.13)}Z`, "#5a4a3a", { op: 0.6 });
  }
  s += S(`M0,${r(-h * 0.47)}L0,${r(h * 0.46)}`, dk(page, 0.35), sw * 0.7);
  if (o.ribbon) s += P(`M${r(w * 0.04)},${r(h * 0.44)}l${r(w * 0.02)},${r(h * 0.22)}l${r(w * 0.015)},${r(-h * 0.05)}l${r(w * 0.015)},${r(h * 0.05)}l${r(-w * 0.01)},${r(-h * 0.24)}Z`, K.violet, { s: INK, w: sw * 0.6 });
  return `<g transform="translate(${r(cx)} ${r(cy)}) rotate(${rot})">${s}</g>`;
}

/** A potion bottle standing on y (base). kind: "heal" (round flask, green), "blast" (tall, red), "bind" (square, violet). */
function bottle(x, y, size, kind = "heal", o = {}) {
  const { sw = 1.4 } = o;
  const col = kind === "heal" ? K.green : kind === "blast" ? K.red : K.violet;
  const hi = kind === "heal" ? K.greenHi : kind === "blast" ? K.redHi : K.violetHi;
  const k = size / 40;
  let s = shadow(x, y, 12 * k, 2.4 * k, 0.35);
  let body;
  if (kind === "heal") body = sm([[-4 * k, -40 * k, 1], [4 * k, -40 * k, 1], [4 * k, -28 * k], [14 * k, -18 * k], [14 * k, -6 * k], [8 * k, -0.2 * k, 1], [-8 * k, -0.2 * k, 1], [-14 * k, -6 * k], [-14 * k, -18 * k], [-4 * k, -28 * k]]);
  else if (kind === "blast") body = sm([[-3.6 * k, -44 * k, 1], [3.6 * k, -44 * k, 1], [3.6 * k, -34 * k], [9 * k, -28 * k], [9 * k, -0.2 * k, 1], [-9 * k, -0.2 * k, 1], [-9 * k, -28 * k], [-3.6 * k, -34 * k]]);
  else body = poly([[-4 * k, -38 * k], [4 * k, -38 * k], [4 * k, -30 * k], [11 * k, -28 * k], [11 * k, -0.2 * k], [-11 * k, -0.2 * k], [-11 * k, -28 * k], [-4 * k, -30 * k]]);
  const g = `<g transform="translate(${r(x)} ${r(y)})">`;
  s += g + P(body, lin([[0, lt(col, 0.35)], [0.5, col], [1, dk(col, 0.35)]], 0, 0, 1, 0.3), { s: INK, w: sw });
  // liquid line and glint
  s += P(body, "#ffffff", { op: 0.12 });
  s += S(`M${r(-8 * k)},${r(-14 * k)}Q${r(-9 * k)},${r(-6 * k)} ${r(-6 * k)},${r(-3 * k)}`, "#ffffff", sw * 0.8, { op: 0.6 });
  // cork
  const top = kind === "blast" ? -44 * k : kind === "heal" ? -40 * k : -38 * k;
  s += R(-3.4 * k, top - 5 * k, 6.8 * k, 5.4 * k, K.woodL, { s: INK, w: sw * 0.8, rx: 1 * k });
  // label with a symbol, so the kind never rests on colour alone: + heal, ✶ blast (burst), ∞-free "knot"? no: a simple chain link for bind
  s += R(-6 * k, -16 * k, 12 * k, 9 * k, K.paper, { s: INK, w: sw * 0.6, rx: 1 * k });
  if (kind === "heal") s += S(`M0,${r(-14.4 * k)}V${r(-8.6 * k)}M${r(-2.9 * k)},${r(-11.5 * k)}H${r(2.9 * k)}`, K.greenLo, sw * 0.9);
  else if (kind === "blast") s += P(poly([[0, -15.2 * k], [1.1 * k, -12.6 * k], [3.6 * k, -12.4 * k], [1.6 * k, -10.8 * k], [2.4 * k, -8.2 * k], [0, -9.8 * k], [-2.4 * k, -8.2 * k], [-1.6 * k, -10.8 * k], [-3.6 * k, -12.4 * k], [-1.1 * k, -12.6 * k]]), K.redLo);
  else s += R(-3.6 * k, -13.6 * k, 4 * k, 2.6 * k, "none", { s: K.violetLo, w: sw * 0.7, rx: 1.2 * k }) + R(-0.4 * k, -12.2 * k, 4 * k, 2.6 * k, "none", { s: K.violetLo, w: sw * 0.7, rx: 1.2 * k });
  s += "</g>";
  void hi;
  return s;
}

/** A candle in a brass holder standing on y. lit adds a flame and glow. */
function candle(x, y, h, o = {}) {
  const { sw = 1.2, lit = true, wax = "#efe6d2" } = o;
  let s = shadow(x, y, h * 0.32, h * 0.06, 0.35);
  s += P(sm([[x - h * 0.3, y, 1], [x - h * 0.26, y - h * 0.08], [x + h * 0.26, y - h * 0.08], [x + h * 0.3, y, 1]]), shade(K.brass), { s: INK, w: sw });
  s += R(x - h * 0.1, y - h * 0.86, h * 0.2, h * 0.8, lin([[0, lt(wax, 0.2)], [1, dk(wax, 0.15)]], 0, 0, 1, 0), { s: INK, w: sw });
  s += S(`M${r(x)},${r(y - h * 0.86)}V${r(y - h * 0.92)}`, INK, sw * 0.6);
  if (lit) {
    s += C(x, y - h * 1.02, h * 0.55, glow(K.lamp, 0.55));
    s += P(`M${r(x)},${r(y - h * 1.22)}Q${r(x + h * 0.08)},${r(y - h * 1.02)} ${r(x)},${r(y - h * 0.92)}Q${r(x - h * 0.08)},${r(y - h * 1.02)} ${r(x)},${r(y - h * 1.22)}Z`, lin([[0, K.glow], [1, K.amber]]), { s: dk(K.amber, 0.3), w: sw * 0.4 });
  }
  return s;
}

/** A six-sided die seen from above (a square with pips). */
function dieTop(cx, cy, size, n, o = {}) {
  const { rot = 0, sw = 1.4, body = "#f4efe4", pip = INK } = o;
  const h = size / 2, q = size * 0.26, pr = size * 0.085;
  const pos = { 1: [[0, 0]], 2: [[-q, -q], [q, q]], 3: [[-q, -q], [0, 0], [q, q]], 4: [[-q, -q], [q, -q], [-q, q], [q, q]], 5: [[-q, -q], [q, -q], [0, 0], [-q, q], [q, q]], 6: [[-q, -q], [q, -q], [-q, 0], [q, 0], [-q, q], [q, q]] }[n];
  let s = `<g transform="translate(${r(cx)} ${r(cy)}) rotate(${rot})">`;
  s += R(-h + size * 0.06, -h + size * 0.1, size, size, "#000", { rx: size * 0.18, op: 0.28 });
  s += R(-h, -h, size, size, lin([[0, lt(body, 0.3)], [1, dk(body, 0.12)]], 0, 0, 1, 1), { s: INK, w: sw, rx: size * 0.18 });
  for (const [x, y] of pos) s += C(x, y, pr, pip);
  return s + "</g>";
}
/** A die in an oblique view resting on a surface: top face n, front face f, right face g (valid die faces). */
function dieBox(x, y, size, n, f, g, o = {}) {
  const { sw = 1.4, body = "#f4efe4", dx = 0.42, dy = 0.3 } = o;
  const a = size, ox = a * dx, oy = a * dy;
  // front square from (x,y-a) to (x+a,y); top parallelogram; right side
  let s = shadow(x + a * 0.6, y + 1, a * 0.75, a * 0.12, 0.35);
  const front = [[x, y - a], [x + a, y - a], [x + a, y], [x, y]];
  const top = [[x, y - a], [x + ox, y - a - oy], [x + a + ox, y - a - oy], [x + a, y - a]];
  const side = [[x + a, y - a], [x + a + ox, y - a - oy], [x + a + ox, y - oy], [x + a, y]];
  s += P(poly(side), dk(body, 0.22), { s: INK, w: sw }) + P(poly(top), lt(body, 0.2), { s: INK, w: sw }) + P(poly(front), body, { s: INK, w: sw });
  const pips = (k, map) => {
    const q = 0.26, pos = { 1: [[0, 0]], 2: [[-q, -q], [q, q]], 3: [[-q, -q], [0, 0], [q, q]], 4: [[-q, -q], [q, -q], [-q, q], [q, q]], 5: [[-q, -q], [q, -q], [0, 0], [-q, q], [q, q]], 6: [[-q, -q], [q, -q], [-q, 0], [q, 0], [-q, q], [q, q]] }[k];
    return pos.map(([u, v]) => map(u, v)).map(([px, py, rx, ry]) => E(px, py, rx, ry, INK)).join("");
  };
  s += pips(f, (u, v) => [x + a / 2 + u * a, y - a / 2 + v * a, a * 0.08, a * 0.08]);
  // top face: u across, v from back (−) to front (+); right face: u from front (−) to back (+), v down
  s += pips(n, (u, v) => [x + a * (0.5 + u) + ox * (0.5 - v), y - a - oy * (0.5 - v), a * 0.075, a * 0.05]);
  s += pips(g, (u, v) => [x + a + ox * (0.5 + u), y - a / 2 + v * a - oy * (0.5 + u), a * 0.035, a * 0.075]);
  return s;
}

export { K, INK, mix, dk, lt, P, S, E, C, R, G, sm, symm, poly, rng, lin, rad, clip, shade, glow, out, begin, fig, dana, marco, june, quinn, tess, noor, rookMan, rookBird, civ, quietMan, ashWidow, mirrorThief, ghost };

// =============================================================== the pieces
const PIECES = {};
const piece = (name, fn) => { PIECES[name] = fn; };

// ----- Chapter 3: the six witches
piece("vignette-ch03", () => {
  const W = 1185, H = 300, ground = 284;
  let s = sky(W, H, K.n0, K.n3, K.n1);
  s += stars(33, 0, 4, W, 90, 50);
  // an Old Town street behind them, softly lit
  s += terraceRow(-20, W + 20, 232, { seed: 61, hMin: 70, hMax: 96, wMin: 60, wMax: 84, litP: 0.5, sw: 1.2, rows: 2 });
  s += R(0, 0, W, ground, lin([[0, K.n1, 0], [0.55, K.n1, 0.15], [1, K.n1, 0.55]]));
  s += R(0, 230, W, ground - 230, lin([[0, "#2a3046"], [1, "#22273a"]]));
  for (const lx of [210, 590, 975]) s += streetLamp(lx, 236, 120, { sw: 1.4 }) + lampGlow(lx, 120, 110, 0.32);
  s += C(W / 2, 200, 560, glow(K.lamp, 0.12));
  s += R(0, ground, W, H - ground, lin([[0, "#2c3248"], [1, "#1a1e2e"]]));
  s += S(`M0,${ground}H${W}`, INK, 2);
  const cast = [["dana", dana, 115, {}], ["marco", marco, 305, {}], ["june", june, 487, {}], ["quinn", quinn, 672, {}], ["tess", tess, 865, {}], ["noor", noor, 1060, {}]];
  for (const [k, fn, x, p] of cast) {
    const h = 232 * HEIGHT[k];
    s += shadow(x, ground, 26, 4, 0.5);
    s += fig(fn, x, ground, h, p);
  }
  return { vb: `0 0 ${W} ${H}`, title: "The six witches of the coven, side by side on an Old Town street", body: s };
});

// ---------------------------------------------------------------- houses
/** Faint brick coursing inside a rectangle. */
function brickLines(x, y, w, h, gap, col = "#000", op = 0.12, sw = 0.8) {
  let d = "";
  for (let yy = y + gap, i = 0; yy < y + h; yy += gap, i++) {
    d += `M${r(x)},${r(yy)}H${r(x + w)}`;
    for (let xx = x + (i % 2 ? gap : gap * 2); xx < x + w; xx += gap * 3.2) d += `M${r(xx)},${r(yy)}V${r(yy - gap)}`;
  }
  return S(d, col, sw, { op });
}
/**
 * The Lantern House: a narrow three-storey terraced house. Local units: 130 wide, ground at 0,
 * eaves −170, ridge −206, dormer apex −226, chimney top −236. u = world units per local unit.
 * Bay window and door on the ground floor, the lamp on an iron bracket over the door (it never goes
 * out), two sash windows on the first floor, a round attic window in the dormer, chimney on the right party wall.
 */
function lanternHouse(x, base, u, o = {}) {
  const { wall = "#7a4f43", sw = 2, litAll = true, lampOn = true, rookOnChimney = false } = o;
  const lw = sw / u;
  const roof = "#3a4152";
  let s = "";
  // chimney (behind the roof line), with two pots
  s += R(114, -240, 24, 46, shade("#6a4a40", 0.1, 0.25), { s: INK, w: lw });
  s += R(111, -244, 30, 6, K.stone, { s: INK, w: lw * 0.8 });
  for (const px of [118, 130]) s += P(poly([[px - 3.2, -244], [px - 2.4, -254], [px + 2.4, -254], [px + 3.2, -244]]), "#9a5a3c", { s: INK, w: lw * 0.8 });
  // roof
  s += P(poly([[-2, -170], [2, -206], [128, -206], [132, -170]]), shade(roof, 0.12, 0.3), { s: INK, w: lw });
  s += S(`M1,-182H129M0.5,-194H129.5`, dk(roof, 0.35), lw * 0.5, { op: 0.7 });
  // dormer with the round window
  s += P(poly([[45, -176], [45, -212], [65, -228], [85, -212], [85, -176]]), shade("#d9cdb6", 0.1, 0.25), { s: INK, w: lw });
  s += P(poly([[42, -211], [65, -231], [88, -211], [85, -209], [65, -226], [45, -209]]), roof, { s: INK, w: lw * 0.8 });
  s += C(65, -194, 12.5, lin([[0, K.glow], [1, K.amber]]), { s: INK, w: lw });
  s += S(`M65,-206.5V-181.5M52.5,-194H77.5`, INK, lw * 0.6);
  s += C(65, -194, 12.5, "none", { s: "#5a4a3a", w: lw * 1.6 });
  // walls
  s += R(0, -170, 130, 170, shade(wall, 0.1, 0.26), { s: INK, w: lw });
  s += brickLines(0, -170, 130, 170, 6, INK, 0.1, lw * 0.35);
  s += R(-2, -174, 134, 6, K.stone, { s: INK, w: lw * 0.8 });                                            // cornice
  // first floor: two sash windows with stone lintels
  for (const wx of [16, 76]) {
    s += R(wx - 3, -164, 44, 5, K.stone, { s: INK, w: lw * 0.7 });
    s += windowRect(wx, -158, 38, 50, { lit: litAll, sw: lw, bars: "sash", curtain: wx < 50 ? "#7b5bc4" : "#3f7f58" });
  }
  // ground floor: the bay window (three faces, the side faces in shade), small lead roof
  s += P(poly([[6, -86], [12, -94], [58, -94], [64, -86]]), "#4d5566", { s: INK, w: lw });
  s += R(6, -86, 58, 70, "#e9e1cf", { s: INK, w: lw });
  s += windowRect(9, -82, 10, 62, { lit: litAll, sw: lw * 0.9, bars: "v", sill: false, dim: true });
  s += windowRect(22, -82, 26, 62, { lit: litAll, sw: lw * 0.9, bars: "sash", sill: false, curtain: "#b5473f" });
  s += windowRect(51, -82, 10, 62, { lit: litAll, sw: lw * 0.9, bars: "v", sill: false, dim: true });
  s += R(4, -18, 62, 18, "#d9cdb6", { s: INK, w: lw });
  // door with a fanlight; one stone step
  s += P(`M80,-72A14,14 0 0 1 108,-72Z`, lin([[0, K.glow], [1, K.gold]]), { s: INK, w: lw });
  s += S(`M94,-72V-86M94,-72L84.6,-82M94,-72L103.4,-82`, INK, lw * 0.5);
  s += R(80, -72, 28, 68, shade("#2f3f5c", 0.14, 0.3), { s: INK, w: lw });
  s += R(84, -66, 20, 24, "none", { s: dk("#2f3f5c", 0.4), w: lw * 0.6 }) + R(84, -36, 20, 26, "none", { s: dk("#2f3f5c", 0.4), w: lw * 0.6 });
  s += C(101, -38, 1.6, K.brass, { s: INK, w: lw * 0.4 }) + R(91, -48, 6, 2, K.brass, { s: INK, w: lw * 0.4 });
  s += R(76, -5, 36, 5, K.stone, { s: INK, w: lw * 0.8 });
  // the lamp: an iron bracket fixed to the wall, a ring on its hook, the lantern hanging below
  if (lampOn) s += C(94, -95, 34, glow(K.lamp, 0.55));
  s += R(108, -112, 4, 14, "#24262e", { s: INK, w: lw * 0.6 });                                          // wall plate
  s += S(`M110,-108C104,-112 96,-112 94,-108`, INK, lw * 2.6) + S(`M110,-108C104,-112 96,-112 94,-108`, "#2d3038", lw * 1.4);
  s += S(`M110,-101C106,-101 102,-104 101,-108`, "#2d3038", lw * 1.1);
  s += C(94, -106.4, 1.6, "none", { s: "#2d3038", w: lw * 0.9 });                                       // ring on the hook
  s += P(poly([[88.5, -101], [94, -105], [99.5, -101]]), "#2d3038", { s: INK, w: lw * 0.6 });
  s += P(poly([[89.5, -101], [98.5, -101], [97.5, -88], [90.5, -88]]), lampOn ? lin([[0, "#fff6d8"], [1, K.gold]]) : K.n3, { s: INK, w: lw * 0.7 });
  s += S(`M94,-101V-88`, INK, lw * 0.4);
  s += R(89.5, -88, 9, 2.2, "#2d3038", { s: INK, w: lw * 0.5 });
  if (rookOnChimney) s += "";
  return `<g transform="translate(${r(x)} ${r(base)}) scale(${r(u * 1000) / 1000})">${s}</g>`;
}
/** A neighbouring terraced house (same frame as the Lantern House). */
function neighbour(x, base, u, o = {}) {
  const { wall = K.slate, sw = 2, lit = [0, 2], door = "l", seed = 1, render = false } = o;
  const lw = sw / u;
  let s = "";
  s += R(o.chimX ?? 6, -238, 22, 40, shade(dk(wall, 0.1), 0.1, 0.25), { s: INK, w: lw }) + R((o.chimX ?? 6) - 3, -242, 28, 6, K.stone, { s: INK, w: lw * 0.8 });
  s += P(poly([[-2, -170], [2, -206], [128, -206], [132, -170]]), shade("#363c4c", 0.1, 0.3), { s: INK, w: lw });
  s += S(`M1,-182H129M0.5,-194H129.5`, "#262a36", lw * 0.5, { op: 0.7 });
  s += R(0, -170, 130, 170, shade(wall, 0.08, 0.28), { s: INK, w: lw });
  if (!render) s += brickLines(0, -170, 130, 170, 6, INK, 0.1, lw * 0.35);
  s += R(-2, -174, 134, 6, K.stone, { s: INK, w: lw * 0.8 });
  let li = 0;
  for (const wx of [16, 76]) { s += R(wx - 3, -164, 44, 5, K.stone, { s: INK, w: lw * 0.7 }); s += windowRect(wx, -158, 38, 50, { lit: lit.includes(li++), sw: lw, bars: "sash", dim: true }); }
  const dx = door === "l" ? 16 : 86, wx = door === "l" ? 62 : 14;
  s += R(dx, -72, 28, 68, shade(o.doorC ?? "#4a3a3a", 0.12, 0.3), { s: INK, w: lw }) + C(dx + 22, -38, 1.6, K.brass);
  s += R(dx - 4, -5, 36, 5, K.stone, { s: INK, w: lw * 0.8 });
  s += windowRect(wx, -84, 48, 56, { lit: lit.includes(li++), sw: lw, bars: "sash", dim: true });
  return `<g transform="translate(${r(x)} ${r(base)}) scale(${r(u * 1000) / 1000})">${s}</g>`;
}

/** Old Town on a hillside, seen across the water: rows of terraces stepping up, with lit windows. */
function oldTownHill(x0, x1, base, o = {}) {
  const { seed = 7, rows = 4, h0 = 22, slopeH = 70 } = o;
  let s = "";
  for (let i = rows - 1; i >= 0; i--) {
    const b = base - i * (slopeH / rows) - 4;
    s += terraceRow(x0 - 20 + i * 13, x1 + 20, b, { seed: seed + i * 11, hMin: h0 * 0.8, hMax: h0 * 1.3, wMin: h0 * 0.8, wMax: h0 * 1.3, litP: 0.5 - i * 0.06, sw: 0.9, cols: [dk(K.slate, i * 0.08), dk("#5a4f60", i * 0.08), dk("#4a5468", i * 0.08), dk("#5d5050", i * 0.08)] });
  }
  return s;
}
/** St Bride's market hall: a long hall with a gabled iron-and-glass roof, arched windows, steps. */
function marketHall(x, base, w, h, o = {}) {
  const { sw = 1.4, lit = true } = o;
  let s = "";
  s += P(poly([[x - w * 0.02, base - h * 0.6], [x + w * 0.5, base - h], [x + w * 1.02, base - h * 0.6]]), shade("#4b5570", 0.12, 0.3), { s: INK, w: sw });
  s += S(`M${r(x + w * 0.5)},${r(base - h)}V${r(base - h * 0.6)}M${r(x + w * 0.25)},${r(base - h * 0.8)}V${r(base - h * 0.6)}M${r(x + w * 0.75)},${r(base - h * 0.8)}V${r(base - h * 0.6)}`, "#2a3044", sw * 0.6);
  s += R(x, base - h * 0.6, w, h * 0.6, shade("#8a7f70", 0.1, 0.3), { s: INK, w: sw });
  const n = 5, aw = w / n;
  for (let i = 0; i < n; i++) {
    const ax = x + i * aw + aw * 0.2, awid = aw * 0.6, ay = base - h * 0.5, ah = h * 0.36;
    s += P(`M${r(ax)},${r(ay + ah)}V${r(ay + awid / 2)}A${r(awid / 2)},${r(awid / 2)} 0 0 1 ${r(ax + awid)},${r(ay + awid / 2)}V${r(ay + ah)}Z`, lit ? lin([[0, K.glow], [1, K.amber]]) : K.n2, { s: INK, w: sw * 0.8 });
  }
  s += R(x - w * 0.04, base - h * 0.08, w * 1.08, h * 0.08, K.stone, { s: INK, w: sw * 0.8 });
  return s;
}
/** The Heights: a dark hill with big houses, the observatory dome and the old radio tower. */
function heights(x0, x1, base, top, o = {}) {
  const { seed = 4, towerX = (x0 + x1) * 0.55, towerH = 60, domeX = null, sw = 1.1 } = o;
  const R0 = rng(seed);
  const mid = (x0 + x1) / 2;
  let s = P(sm([[x0, base, 1], [x0 + (x1 - x0) * 0.15, base - (base - top) * 0.55], [mid, top], [x1 - (x1 - x0) * 0.15, base - (base - top) * 0.5], [x1, base, 1]]), lin([[0, "#24304a"], [1, "#1b2338"]]), { s: INK, w: sw });
  for (let i = 0; i < 9; i++) {
    const t = 0.12 + R0() * 0.76, x = x0 + (x1 - x0) * t, yy = base - (base - top) * (1 - Math.abs(t - 0.5) * 1.8) * (0.4 + R0() * 0.4);
    s += block(x, yy, 12 + R0() * 8, 8 + R0() * 6, "#3e4660", { roof: "gable", rows: 1, cols: 2, seed: i + seed, litP: 0.6, sw: 0.8, roofH: 5 });
  }
  if (domeX) {
    const dy = base - (base - top) * 0.82;
    s += R(domeX - 7, dy - 6, 14, 6, "#8a8f9c", { s: INK, w: sw }) + P(`M${r(domeX - 8)},${r(dy - 6)}A8,8 0 0 1 ${r(domeX + 8)},${r(dy - 6)}Z`, shade("#c9ccd4", 0.1, 0.3), { s: INK, w: sw });
  }
  s += radioMast(towerX, top + 3, towerH, { sw: 0.9 });
  return s;
}
/** The burned-out Mariner Theatre, seen from a distance: a dark shell with broken roof, a faint ember glow. */
function theatreShell(x, base, w, h, o = {}) {
  const { sw = 1.2, ember = 0.5 } = o;
  let s = "";
  s += P(poly([[x, base], [x, base - h * 0.78], [x + w * 0.18, base - h], [x + w * 0.42, base - h * 0.86], [x + w * 0.5, base - h * 0.96], [x + w * 0.62, base - h * 0.8], [x + w * 0.8, base - h * 0.92], [x + w, base - h * 0.74], [x + w, base]]), lin([[0, "#3a2e2e"], [1, "#221a1a"]]), { s: INK, w: sw });
  for (let i = 0; i < 3; i++) s += P(`M${r(x + w * (0.14 + i * 0.28))},${r(base - h * 0.1)}V${r(base - h * 0.5)}A${r(w * 0.08)},${r(w * 0.08)} 0 0 1 ${r(x + w * (0.3 + i * 0.28))},${r(base - h * 0.5)}V${r(base - h * 0.1)}Z`, lin([[0, K.amber, ember], [1, K.red, ember * 0.6]]), { s: INK, w: sw * 0.7 });
  return s;
}
/** The long pier on piles, with the arcade at the landward end (x0) and the pier head (x1). */
function pier(x0, x1, deckY, waterY, o = {}) {
  const { sw = 1.2, arcade = true } = o;
  let s = "";
  let d = "";
  for (let x = x0 + 10; x < x1; x += 16) d += `M${r(x)},${r(deckY)}V${r(waterY + 4)}`;
  s += S(d, INK, sw * 2.2) + S(d, "#4a4f5e", sw);
  s += R(x0, deckY - 3, x1 - x0, 4, "#5a5f6e", { s: INK, w: sw });
  let rail = `M${r(x0)},${r(deckY - 8)}H${r(x1)}`;
  for (let x = x0; x <= x1; x += 8) rail += `M${r(x)},${r(deckY - 3)}V${r(deckY - 8)}`;
  s += S(rail, "#8a8f9c", sw * 0.6);
  for (let x = x0 + 30; x < x1 - 20; x += 46) s += C(x, deckY - 12, 3.6, glow(K.lamp, 0.6)) + C(x, deckY - 12, 1, K.lamp);
  if (arcade) {
    s += C(x0 + 26, deckY - 16, 34, glow(K.lamp, 0.35));
    s += R(x0, deckY - 26, 52, 23, shade("#6a4a6e", 0.12, 0.3), { s: INK, w: sw });
    s += P(`M${r(x0 - 2)},${r(deckY - 26)}Q${r(x0 + 26)},${r(deckY - 42)} ${r(x0 + 54)},${r(deckY - 26)}Z`, shade("#7b5bc4", 0.12, 0.3), { s: INK, w: sw });
    for (let i = 0; i < 6; i++) s += C(x0 + 6 + i * 8, deckY - 29, 1.2, i % 2 ? K.lamp : K.redHi);
    for (let i = 0; i < 4; i++) s += R(x0 + 5 + i * 11.5, deckY - 20, 7, 13, K.lamp, { s: INK, w: sw * 0.5, op: 0.9 });
  }
  // pier head: bandstand
  const hx = o.headAt === "x0" ? x0 + 34 : x1;
  s += R(hx - 30, deckY - 20, 26, 17, "none", { s: "#8a8f9c", w: sw * 0.7 });
  s += P(`M${r(hx - 34)},${r(deckY - 20)}Q${r(hx - 17)},${r(deckY - 34)} ${r(hx)},${r(deckY - 20)}Z`, shade("#3f7f58", 0.12, 0.3), { s: INK, w: sw });
  return s;
}

// ----- Part One: the coven on a Larkhaven street at night
piece("part-one", () => {
  const W = 900, H = 300, cl = frameClip(W, H);
  let s = sky(W, H, K.n0, K.n3, K.n1);
  s += stars(11, 10, 8, 890, 120, 60, (x, y) => Math.hypot(x - 770, y - 58) < 40);
  s += moon(770, 58, 20);
  s += heights(430, 900, 196, 120, { towerX: 690, towerH: 46, domeX: 800, seed: 5 });
  s += oldTownHill(-10, 640, 214, { seed: 3, rows: 4, h0: 18, slopeH: 64 });
  // the Lantern House lamp, a warm point among the roofs
  s += C(318, 168, 10, glow(K.lamp, 0.7)) + C(318, 168, 1.6, K.glow);
  s += R(0, 210, W, 6, "#1d2640");
  s += water(0, 214, W, 232, { refl: [[318, 14], [120, 10], [520, 12], [770, 16, "#f3e9cc", 0.5]], ripples: 30, top: "#26345a" });
  // harbour wall and railing
  s += R(0, 230, W, 8, shade(K.stoneD, 0.1, 0.3), { s: INK, w: 1.4 });
  let rail = "M0,214H900";
  for (let x = 4; x < W; x += 14) rail += `M${x},230V214`;
  s += S(rail, INK, 2.4) + S(rail, "#3a4258", 1.2);
  // the street
  s += cobbles(0, 238, W, H, 21, { c: "#353c52", line: "#1d2233", rows: 5 });
  for (const lx of [60, 840]) s += lampGlow(lx, 140, 90, 0.4) + R(lx - 60, 238, 120, 62, rad([[0, K.lamp, 0.22], [1, K.lamp, 0]], 0.5, 0.2, 0.6));
  s += streetLamp(60, 252, 120) + streetLamp(840, 252, 120);
  s += shadow(60, 252, 10, 2) + shadow(840, 252, 10, 2);
  // the coven, walking along the harbour road: Rook a little apart, very still
  const base = 150;
  const cast = [["rook", rookMan, 150, 284, { look: 0.6 }], ["noor", noor, 262, 280, { look: 0.5 }], ["dana", dana, 348, 286, { look: 0.4 }], ["june", june, 430, 282, {}], ["marco", marco, 512, 287, { look: -0.4 }], ["quinn", quinn, 600, 281, { look: -0.5, mouth: "grin" }], ["tess", tess, 690, 285, { look: -0.6 }]];
  for (const [k, fn, x, y, p] of cast) s += shadow(x + 6, y, 18, 3.2, 0.45) + fig(fn, x, y, base * HEIGHT[k], p);
  return { vb: `0 0 ${W} ${H}`, title: "The coven walks along the harbour road at night, Old Town on the hill behind", body: G(s, { clip: cl }) + frameRect(W, H, 18) };
});

// ----- Chapter 1: Larkhaven skyline and harbour
piece("vignette-ch01", () => {
  const W = 1185, H = 300;
  let s = sky(W, H, K.n0, "#3a3f66", K.n1);
  s += stars(3, 0, 6, W, 110, 90, (x, y) => Math.hypot(x - 980, y - 50) < 34);
  s += moon(980, 50, 18);
  s += wisp(300, 120, 260, 14, K.fog, 0.08) + wisp(820, 96, 200, 10, K.fog, 0.07);
  // University Hill (left), the Heights (centre right), Saltmarsh flat (far right)
  s += P(sm([[-10, 200, 1], [60, 150], [170, 128], [280, 150], [340, 196, 1]]), lin([[0, "#26304a"], [1, "#1c2338"]]), { s: INK, w: 1.1 });
  s += block(150, 136, 26, 12, "#4a4f66", { roof: "gable", rows: 1, cols: 3, litP: 0.7, sw: 0.8, roofH: 7, seed: 9 });   // the library
  s += terraceRow(40, 300, 186, { seed: 12, hMin: 9, hMax: 14, wMin: 10, wMax: 16, slope: 0, litP: 0.55, sw: 0.8, rows: 1 });
  s += heights(560, 940, 196, 104, { towerX: 760, towerH: 58, domeX: 860, seed: 8 });
  s += R(930, 186, 260, 14, lin([[0, "#2a3a3a"], [1, "#1e2a2c"]]));
  let reeds = "";
  const RR = rng(4);
  for (let x = 934; x < W; x += 3) reeds += `M${x},${r(194 + RR() * 4)}l${r(RR() * 2 - 1)},${r(-4 - RR() * 6)}`;
  s += S(reeds, "#4f6a5a", 1, { op: 0.8 });
  s += P(poly([[1088, 190], [1088, 176], [1092, 170], [1096, 176], [1096, 190]]), "#3a4044", { s: INK, w: 0.9, op: 0.8 });   // the drowned church tower, far off
  // the Docks (left): cranes, containers, the burned theatre
  s += crane(70, 214, 70) + crane(150, 214, 62);
  for (let i = 0; i < 14; i++) s += R(20 + (i % 7) * 22, 214 - 9 - Math.floor(i / 7) * 9, 21, 9, ["#7b5bc4", "#3f7f58", "#b5473f", "#c29a45", "#4f72a8"][i % 5], { s: INK, w: 0.7, op: 0.85 });
  s += theatreShell(228, 214, 64, 46, { ember: 0.45 });
  // Old Town on its hill, St Bride's market hall, the Lantern House's lamp
  s += oldTownHill(300, 640, 214, { seed: 21, rows: 5, h0: 17, slopeH: 74 });
  s += marketHall(430, 212, 92, 52);
  s += stringLights([396, 206], [430, 196], 3, 5, { glowR: 3 }) + stringLights([522, 196], [560, 206], 3, 5, { glowR: 3 });
  s += C(574, 164, 10, glow(K.lamp, 0.75)) + C(574, 164, 1.6, K.glow);
  // the harbour: quay line, water, harbour wall with the lighthouse, ferry, the long pier
  s += R(0, 212, W, 5, "#2a3048", { s: INK, w: 1 });
  s += water(0, 216, W, H, { refl: [[110, 20, K.red, 0.5], [470, 60], [574, 12], [980, 26, "#f3e9cc", 0.5], [705, 18], [880, 30]], ripples: 60, top: "#22305a" });
  s += pier(860, 1150, 236, 260, {});
  s += P(sm([[700, 300, 1], [690, 270], [640, 248], [560, 240, 1], [560, 246, 1], [636, 254], [680, 274], [688, 300, 1]]), shade(K.stoneD, 0.1, 0.3), { s: INK, w: 1.4 });   // harbour wall
  s += lighthouse(566, 244, 66, { beam: 352, beamLen: 300 });
  s += ferry(330, 262, 120, { dir: 1 });
  s += S(`M250,264h40M380,262h50`, "#8fa3c8", 1, { op: 0.5 });
  return { vb: `0 0 ${W} ${H}`, title: "Larkhaven at night: the docks, Old Town, the Heights and the harbour", body: s };
});

// ----- Chapter 4: Rook in both shapes
piece("vignette-ch04", () => {
  const W = 1185, H = 300, g = 290, u = 2.5;
  let s = sky(W, H, K.n0, K.n3);
  s += stars(8, 860, 8, W, 150, 30);
  s += moon(1112, 54, 16);
  s += terraceRow(970, 1200, 214, { seed: 41, hMin: 34, hMax: 50, wMin: 28, wMax: 36, litP: 0.4, sw: 1 });
  // the Lantern House and its neighbours, seen close (the first floor runs out of the frame)
  const hx = 190;
  s += neighbour(hx - 130 * u, g, u, { wall: "#596179", lit: [2], door: "r" });
  s += lanternHouse(hx, g, u, { wall: "#7a4f43" });
  s += neighbour(hx + 130 * u, g, u, { wall: "#5c5470", lit: [1, 2], door: "l", render: true });
  s += R(0, g, W, H - g, lin([[0, "#3d4459"], [1, "#2a2f3f"]]), { s: INK, w: 1.6 });
  // area railings in front of the next house, ending in a stone gatepost
  const rx0 = hx + 130 * u + 140, rx1 = 1000;
  let rail = `M${rx0},${g - 62}H${rx1}M${rx0},${g - 8}H${rx1}`;
  for (let x = rx0 + 4; x < rx1 - 2; x += 11) rail += `M${x},${g}V${g - 70}M${x - 2.2},${g - 70}L${x},${g - 76}L${x + 2.2},${g - 70}`;
  s += S(rail, INK, 3) + S(rail, "#2d3038", 1.6);
  s += R(rx1, g - 116, 28, 116, shade(K.stone, 0.1, 0.3), { s: INK, w: 2 }) + R(rx1 - 6, g - 124, 40, 9, lt(K.stone, 0.1), { s: INK, w: 2 });
  s += shadow(rx1 + 14, g, 22, 3);
  // Rook in human shape, in front of the lit bay window; the lamp over the door beside him
  s += shadow(hx + 36 * u, g, 22, 3.4, 0.55);
  s += fig(rookMan, hx + 36 * u, g, 162, { look: 1.4 });
  // ...and in rook shape on the gatepost, looking back at him
  s += rookBird(rx1 + 14, g - 124, 50, -1);
  return { vb: `0 0 ${W} ${H}`, title: "Rook in human shape by the Lantern House bay window, and in rook shape on a gatepost down the street", body: s };
});

// ----- Chapter 13: the Lantern House
piece("vignette-ch13", () => {
  const W = 1185, H = 300;
  let s = sky(W, H, K.n0, K.n3, K.n1);
  s += stars(13, 0, 6, W, 140, 70, (x, y) => Math.hypot(x - 1070, y - 56) < 30);
  s += moon(1070, 56, 17);
  // a steep Old Town street: each house steps up from left to right
  const u = 1.12;
  const houses = [
    [neighbour, 40, 312, { wall: "#5a6078", lit: [0, 2], door: "r" }],
    [neighbour, 40 + 130 * u, 300, { wall: "#6c5a50", lit: [1], door: "l", render: true }],
    [lanternHouse, 40 + 260 * u, 288, { wall: "#7a4f43" }],
    [neighbour, 40 + 390 * u, 276, { wall: "#5c5470", lit: [0, 2], door: "r", render: true }],
    [neighbour, 40 + 520 * u, 264, { wall: "#4f5a70", lit: [1, 2], door: "l" }],
    [neighbour, 40 + 650 * u, 252, { wall: "#665248", lit: [0], door: "r", render: true }],
  ];
  s += lampGlow(40 + 260 * u + 94 * u, 288 - 95 * u, 70, 0.35);
  for (const [fn, x, b, o] of houses) s += fn(x, b, u, o);
  // the steep pavement in front, rising to the right, with a kerb
  s += P(poly([[0, 312], [40 + 130 * u, 312], [40 + 130 * u, 300], [40 + 260 * u, 300], [40 + 260 * u, 288], [40 + 390 * u, 288], [40 + 390 * u, 276], [40 + 520 * u, 276], [40 + 520 * u, 264], [40 + 650 * u, 264], [40 + 650 * u, 252], [W, 252], [W, H], [0, H]]), lin([[0, "#3d4459"], [1, "#2a2f3f"]]), { s: INK, w: 1.6 });
  s += S(`M0,${H - 3}L${W},${H - 30}`, "#5a6178", 2);
  // the street lamp at the corner, and a garden wall glimpse at the far right
  s += streetLamp(1120, 252, 150) + lampGlow(1120, 120, 70, 0.4) + shadow(1120, 252, 9, 2);
  return { vb: `0 0 ${W} ${H}`, title: "The Lantern House on its steep Old Town street, the lamp lit over the door", body: s };
});

// ----- Part Three: the Lantern House lit up, the three episodes' places beyond
piece("part-three", () => {
  const W = 900, H = 300, cl = frameClip(W, H);
  let s = sky(W, H, K.n0, "#5a4a78", K.n2);
  s += R(560, 140, 340, 80, lin([[0, "#c08a6a", 0], [1, "#c08a6a", 0.4]]));                            // dusk over Saltmarsh
  s += stars(31, 0, 6, W, 110, 60, (x, y) => Math.hypot(x - 120, y - 46) < 30);
  s += moon(120, 46, 15);
  // left: down the hill, the docks and the burned theatre, St Bride's and the night market lights
  s += R(0, 190, 340, 40, "#1f2a46");
  s += water(0, 206, 340, 222, { refl: [[95, 16, K.red, 0.5]], ripples: 8, top: "#26345a" });
  s += crane(36, 206, 50) + theatreShell(70, 206, 54, 38, { ember: 0.6 });
  s += C(97, 178, 30, glow(K.red, 0.28));
  for (const [x, y, rr, op] of [[92, 160, 7, 0.35], [96, 146, 9, 0.3], [90, 130, 11, 0.24], [98, 112, 13, 0.18]]) s += C(x, y, rr, "#5a5058", { op });   // smoke rising
  s += P(sm([[0, 300, 1], [0, 236], [120, 226], [240, 232], [340, 250], [340, 300, 1]]), "#1a2034");
  s += oldTownHill(100, 340, 262, { seed: 51, rows: 4, h0: 16, slopeH: 44 });
  s += marketHall(160, 250, 86, 44);
  s += stringLights([126, 246], [160, 236], 3, 5, { glowR: 3 }) + stringLights([246, 236], [290, 248], 3, 5, { glowR: 3 }) + stringLights([120, 262], [310, 262], 6, 14, { glowR: 3.2 });
  s += P(sm([[0, 300, 1], [0, 268], [120, 272], [250, 282], [340, 290], [340, 300, 1]]), "#141a2a");
  // right: the harbour, the long pier with its arcade, Saltmarsh and the church tower above the mud
  s += water(560, 206, W, H, { refl: [[700, 30], [620, 14]], ripples: 30, top: "#3a3a66" });
  s += R(780, 200, 120, 8, "#3a3a44");
  s += P(poly([[860, 204], [860, 184], [865, 176], [870, 184], [870, 204]]), "#3a4044", { s: INK, w: 1 });
  s += pier(600, 840, 232, 262, {});
  s += P(sm([[560, 300, 1], [560, 270], [640, 276], [760, 286], [900, 290], [900, 300, 1]]), "#141a2a");
  // the Lantern House block on the crest of the street, between its neighbours
  const u = 0.95;
  s += neighbour(330 - 130 * u, 300, u, { wall: "#5a6078", lit: [2], door: "r" });
  s += neighbour(330 + 130 * u, 300, u, { wall: "#5c5470", lit: [0], door: "l", render: true });
  s += lampGlow(330 + 94 * u, 300 - 95 * u, 60, 0.45) + C(330 + 65 * u, 300 - 194 * u, 30, glow(K.lamp, 0.4));
  s += lanternHouse(330, 300, u, {});
  s += R(0, 296, W, 6, "#1d2233");
  return { vb: `0 0 ${W} ${H}`, title: "The Lantern House lit up at night; beyond it the night market, the burned theatre and the long pier", body: G(s, { clip: cl }) + frameRect(W, H, 18) };
});

// ---------------------------------------------------------------- table-top kit (seen from above; light from the upper left)
/** A wooden surface with grain. */
function woodTop(x, y, w, h, seed = 1, col = "#6a4a34") {
  const R0 = rng(seed);
  let s = R(x, y, w, h, lin([[0, lt(col, 0.08)], [1, dk(col, 0.18)]], 0, 0, 1, 1));
  let d = "";
  for (let yy = y + 6; yy < y + h; yy += 7 + R0() * 9) {
    let xx = x; d += `M${r(xx)},${r(yy)}`;
    while (xx < x + w) { const st = 40 + R0() * 80; d += `q${r(st / 2)},${r((R0() - 0.5) * 4)} ${r(st)},0`; xx += st; }
  }
  s += S(d, dk(col, 0.35), 1, { op: 0.35 });
  return s;
}
/** A sheet of paper lying flat, rotated, with squiggle lines (no readable text). */
function sheet(cx, cy, w, h, rot = 0, o = {}) {
  const { col = K.paper, lines = 8, seed = 2, sw = 1.2, boxes = 0, title = true } = o;
  const R0 = rng(seed);
  let s = R(-w / 2 + 3, -h / 2 + 4, w, h, "#000", { op: 0.25 });
  s += R(-w / 2, -h / 2, w, h, lin([[0, lt(col, 0.2)], [1, dk(col, 0.06)]], 0, 0, 1, 1), { s: INK, w: sw });
  let d = "";
  if (title) d += `M${r(-w * 0.38)},${r(-h * 0.38)}h${r(w * 0.4)}`;
  for (let i = 0; i < lines; i++) {
    const y = -h * 0.26 + i * (h * 0.62 / lines), x0 = -w * 0.38, len = w * (0.5 + R0() * 0.26);
    let x = x0; d += `M${r(x)},${r(y)}`;
    while (x < x0 + len) { const st = w * 0.03; d += `q${r(st / 2)},${r(-h * 0.012)} ${r(st)},0`; x += st; }
  }
  s += S(d, "#6a5a4a", sw * 0.6, { op: 0.7 });
  for (let i = 0; i < boxes; i++) s += R(w * 0.12 + (i % 6) * w * 0.05, h * 0.3 - Math.floor(i / 6) * h * 0.08, w * 0.04, h * 0.05, "none", { s: "#6a5a4a", w: sw * 0.5 });
  return `<g transform="translate(${r(cx)} ${r(cy)}) rotate(${rot})">${s}</g>`;
}
/** A pencil lying flat (whole length on its surface). */
function pencil(x1, y1, x2, y2, o = {}) {
  const { w = 6, col = "#e0b03a", sw = 1.1 } = o;
  const a = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI, L = Math.hypot(x2 - x1, y2 - y1);
  let s = R(2, -w / 2 + 3, L, w, "#000", { op: 0.22 });
  s += R(0, -w / 2, L * 0.82, w, lin([[0, lt(col, 0.2)], [1, dk(col, 0.2)]]), { s: INK, w: sw });
  s += R(-w * 0.9, -w / 2, w * 0.9, w, "#d98a8a", { s: INK, w: sw }) + R(-w * 0.2, -w / 2, w * 0.35, w, "#b9b9b9", { s: INK, w: sw * 0.7 });
  s += P(poly([[L * 0.82, -w / 2], [L, 0], [L * 0.82, w / 2]]), "#e8c9a0", { s: INK, w: sw }) + P(poly([[L * 0.95, -w * 0.14], [L, 0], [L * 0.95, w * 0.14]]), "#333");
  return `<g transform="translate(${r(x1)} ${r(y1)}) rotate(${r(a)})">${s}</g>`;
}
/** A mug seen from above, with tea and a handle. */
function mugTop(x, y, rr, o = {}) {
  const { col = "#7b5bc4", drink = "#8a5a36", sw = 1.4, hand = 30 } = o;
  const a = hand * Math.PI / 180;
  let s = C(x + 4, y + 5, rr * 1.05, "#000", { op: 0.25 });
  s += P(`M${r(x + Math.cos(a - 0.35) * rr)},${r(y + Math.sin(a - 0.35) * rr)}Q${r(x + Math.cos(a) * rr * 1.75)},${r(y + Math.sin(a) * rr * 1.75)} ${r(x + Math.cos(a + 0.35) * rr)},${r(y + Math.sin(a + 0.35) * rr)}`, "none", { s: INK, w: rr * 0.32 }) + P(`M${r(x + Math.cos(a - 0.35) * rr)},${r(y + Math.sin(a - 0.35) * rr)}Q${r(x + Math.cos(a) * rr * 1.75)},${r(y + Math.sin(a) * rr * 1.75)} ${r(x + Math.cos(a + 0.35) * rr)},${r(y + Math.sin(a + 0.35) * rr)}`, "none", { s: col, w: rr * 0.18 });
  s += C(x, y, rr, shade(col, 0.2, 0.3), { s: INK, w: sw });
  s += C(x, y, rr * 0.8, lin([[0, lt(drink, 0.15)], [1, dk(drink, 0.2)]], 0, 0, 1, 1), { s: INK, w: sw * 0.7 });
  s += E(x - rr * 0.3, y - rr * 0.3, rr * 0.22, rr * 0.1, "#ffffff", { op: 0.35, tf: `rotate(-35 ${r(x - rr * 0.3)} ${r(y - rr * 0.3)})` });
  return s;
}
/** A map pin seen from above: round head with a highlight, the shadow falling to the lower right. */
function pinTop(x, y, col = K.gold, rr = 5) {
  return E(x + rr * 0.9, y + rr * 1.1, rr * 0.9, rr * 0.6, "#000", { op: 0.3 }) + C(x, y, rr, shade(col, 0.3, 0.3), { s: INK, w: 1.2 }) + C(x - rr * 0.35, y - rr * 0.35, rr * 0.3, "#ffffff", { op: 0.7 });
}
/** A plain tick mark in a box (pencil). */
const tick = (x, y, s0) => S(`M${r(x + s0 * 0.2)},${r(y + s0 * 0.55)}L${r(x + s0 * 0.42)},${r(y + s0 * 0.8)}L${r(x + s0 * 0.85)},${r(y + s0 * 0.2)}`, "#3a3a44", s0 * 0.16);

// ----- Part Two: the Storyteller's view of the city map, pins and dice
piece("part-two", () => {
  const W = 900, H = 300, cl = frameClip(W, H);
  let s = woodTop(0, 0, W, H, 7, "#5a3e2c");
  s += R(0, 0, W, H, rad([[0, K.lamp, 0.28], [0.6, K.lamp, 0.06], [1, "#000", 0.25]], 0.45, 0.4, 0.75));
  // the map of Larkhaven, lying flat
  const mw = 520, mh = 250;
  let m = R(-mw / 2 + 5, -mh / 2 + 6, mw, mh, "#000", { op: 0.3 });
  m += R(-mw / 2, -mh / 2, mw, mh, lin([[0, "#f3ead6"], [1, "#e2d4b6"]], 0, 0, 1, 1), { s: INK, w: 1.6 });
  const mc = clip(R(-mw / 2, -mh / 2, mw, mh, "#000"));
  let land = "";
  // sea along the bottom, the harbour bay in the middle
  land += P(sm([[-270, 40], [-200, 30], [-120, 34], [-60, 44], [-30, 70], [30, 74], [60, 46], [120, 34], [200, 40], [270, 34], [270, 140, 1], [-270, 140, 1]]), "#9db4c4", { s: "#5a7488", w: 1.2 });
  land += S(`M-40,60Q-10,40 0,74M60,50Q40,64 30,76`, "#5a7488", 3);                                    // harbour arms
  // districts as soft washes
  land += E(-180, -40, 70, 50, "#c9b6c9", { op: 0.55 }) + E(-170, 10, 70, 24, "#b9bcc4", { op: 0.6 }) + E(-10, -6, 70, 36, "#e6c38c", { op: 0.6 }) + E(40, -78, 110, 40, "#b6c8a8", { op: 0.55 }) + E(190, -20, 70, 70, "#a9c2a6", { op: 0.55 });
  // roads and streets
  land += S(`M-260,24Q-120,16 0,22Q120,26 260,18M-180,-80Q-90,-30 -10,-6Q60,10 120,-60M-10,-6L0,22M120,-60Q160,-90 200,-100M40,-100Q60,-60 60,-10`, "#8a7a64", 1.6, { op: 0.8 });
  for (let i = 0; i < 40; i++) { const R0 = rng(i + 3); land += R(-60 + R0() * 120, -30 + R0() * 50, 5, 4, "#a8865a", { op: 0.6 }); }
  // map squiggle labels (no readable text) and a north arrow
  land += S(`M-220,-80h40M-40,-34h50M10,-110h44M160,-70h48M-210,4h36M180,106h30`, "#6a5a4a", 1.4, { op: 0.6 });
  land += P(poly([[230, -100], [236, -84], [230, -88], [224, -84]]), "#6a5a4a");
  m += G(land, { clip: mc });
  // pins: gold for places the coven knows, the threat's pin red with a pencil ring and an X (so it never rests on colour)
  m += pinTop(-6, -12, K.gold) + pinTop(-36, 14, K.gold) + pinTop(-140, 10, K.gold) + pinTop(150, 92, K.gold);
  m += C(60, -96, 15, "none", { s: "#3a3a44", w: 1.5 }) + S(`M44,-114l-6,-6M76,-114l6,-6`, "#3a3a44", 1.4) + pinTop(60, -96, K.red, 6);
  m += S(`M-6,-12Q30,-60 52,-90`, "#3a3a44", 1.2, { dash: "4 4", op: 0.8 });
  s += `<g transform="translate(400 150) rotate(-2)">${m}</g>`;
  // the episode tracker card, a pencil, dice and a mug
  s += sheet(775, 112, 150, 110, 4, { lines: 3, boxes: 0, seed: 5 });
  let tr = "";
  for (let i = 0; i < 12; i++) { tr += R(-62 + i * 10, 10, 8, 8, "none", { s: "#3a3a44", w: 1 }); if (i < 4) tr += tick(-62 + i * 10, 10, 8); }
  tr += R(-62 + 4 * 10, 9, 8, 10, "none", { s: K.red, w: 1.4 });                                          // the Showdown mark at 5
  for (let i = 0; i < 4; i++) { tr += R(-62 + i * 12, 30, 10, 10, "none", { s: "#3a3a44", w: 1 }); if (i < 1) tr += tick(-62 + i * 12, 30, 10); }
  s += `<g transform="translate(775 112) rotate(4)">${tr}</g>`;
  s += pencil(705, 205, 840, 186, {});
  s += dieTop(735, 250, 26, 6, { rot: 12 }) + dieTop(772, 262, 26, 4, { rot: -8 }) + dieTop(808, 242, 26, 6, { rot: 30 });
  s += mugTop(76, 92, 28, { col: K.green }) + sheet(80, 220, 110, 90, -6, { lines: 5, seed: 9 });
  return { vb: `0 0 ${W} ${H}`, title: "The Storyteller's table: a map of Larkhaven with pins, the episode tracker, dice and a mug of tea", body: G(s, { clip: cl }) + frameRect(W, H, 18) };
});

// ----- Chapter 2: dice and a roll
piece("vignette-ch02", () => {
  const W = 1185, H = 300, tY = 96;
  let s = R(0, 0, W, tY, lin([[0, "#1c2238"], [1, "#2c2c40"]]));
  // the window behind the table: Larkhaven's roofs at night
  s += R(760, 8, 300, 88, lin([[0, K.n1], [1, K.n3]]), { s: INK, w: 2 });
  s += G(terraceRow(756, 1066, 96, { seed: 22, hMin: 22, hMax: 34, wMin: 20, wMax: 30, litP: 0.5, sw: 0.9 }) + stars(23, 765, 12, 1055, 50, 12), { clip: clip(R(760, 8, 300, 88, "#000")) });
  s += S(`M910,8V96M760,52H1060`, "#4a3a30", 5) + R(760, 8, 300, 88, "none", { s: "#4a3a30", w: 7 }) + R(756, 4, 308, 96, "none", { s: INK, w: 2 });
  s += C(480, 30, 380, glow(K.lamp, 0.25));
  // the table top, seen from just above
  s += woodTop(0, tY, W, H - tY, 3, "#6a4a34");
  s += R(0, tY, W, 6, "#4a3424") + S(`M0,${tY}H${W}`, INK, 2);
  s += R(0, tY, W, H - tY, lin([[0, "#000", 0.3], [0.4, "#000", 0], [1, "#000", 0.15]]));
  // a witch sheet lying flat with a pencil on it; the rulebook and a mug at the back
  const sh0 = [[40, 286], [300, 286], [370, 214], [110, 214]];
  s += P(poly(sh0.map(([x, y]) => [x + 4, y + 4])), "#000", { op: 0.25 }) + P(poly(sh0), lin([[0, "#f6eedc"], [1, "#ddd0b4"]]), { s: INK, w: 1.6 });
  let d = "";
  for (let i = 0; i < 6; i++) { const t = 0.16 + i * 0.12; d += `M${r(70 + 70 * t + 20)},${r(286 - 72 * t)}h${r(110 + (i % 3) * 20)}`; }
  s += S(d, "#6a5a4a", 1.2, { op: 0.6 });
  for (let i = 0; i < 4; i++) s += R(232 + i * 15, 256, 10, 10, "none", { s: "#6a5a4a", w: 1 });
  s += pencil(140, 270, 270, 248, { w: 7 });
  s += P(poly([[120, 196], [250, 196], [282, 160], [152, 160]]), shade("#2b3348", 0.2, 0.3), { s: INK, w: 1.6 }) + P(poly([[120, 196], [250, 196], [250, 204], [120, 204]]), "#e8dcc4", { s: INK, w: 1.4 });
  s += shadow(366, 186, 34, 5, 0.35) + R(340, 140, 52, 46, shade(K.green, 0.2, 0.3), { s: INK, w: 1.6, rx: 4 }) + E(366, 140, 26, 7, "#5a3e2c", { s: INK, w: 1.6 }) + P(`M392,150Q412,152 410,166Q408,178 392,176`, "none", { s: INK, w: 5 }) + P(`M392,150Q412,152 410,166Q408,178 392,176`, "none", { s: K.green, w: 2.6 });
  // the dice cup lying on its side, its mouth toward the dice
  s += shadow(520, 262, 74, 9, 0.4);
  s += P(`M440,196L566,206L566,262L440,262Z`, shade("#5a2f3a", 0.15, 0.35), { s: INK, w: 2 });
  s += S(`M442,214L564,222M442,244L564,248`, "#c29a45", 2);
  s += E(440, 229, 15, 33, "#3a1f28", { s: INK, w: 2 });
  s += E(566, 234, 18, 28, "#2a161c", { s: INK, w: 2 }) + E(568, 236, 12, 21, "#140a0e");
  // six dice: the three successes (6, 6, 5) together, the three misses (2, 1, 1) where they fell
  s += dieBox(626, 284, 50, 6, 3, 2) + dieBox(700, 266, 50, 6, 2, 4) + dieBox(612, 216, 44, 5, 1, 3);
  s += dieBox(842, 256, 46, 2, 1, 4) + dieBox(930, 290, 46, 1, 2, 3) + dieBox(1040, 236, 42, 1, 4, 2);
  s += S(`M972,192Q1010,170 1036,182M978,206Q1012,190 1032,198`, "#f4efe4", 2.4, { op: 0.6 });         // the last die still rolling
  return { vb: `0 0 ${W} ${H}`, title: "A roll: six dice spilled from a cup across the table, beside a witch sheet and the rulebook", body: s };
});

// ----- Chapter 5: magic (a spell, a potion and the Book, in the attic)
piece("vignette-ch05", () => {
  const W = 1185, H = 300, fl = 270;
  let s = R(0, 0, W, H, lin([[0, "#2a2232"], [1, "#3a2c34"]]));
  // the attic: walls, the round window over the street, sloping beams
  s += C(592, 92, 52, lin([[0, "#24305a"], [1, "#0e1530"]]), { s: INK, w: 3 });
  s += stars(55, 545, 45, 640, 140, 12, (x, y) => Math.hypot(x - 592, y - 92) > 48);
  s += S(`M592,40V144M540,92H644`, "#5a4a3a", 4) + C(592, 92, 52, "none", { s: "#5a4a3a", w: 7 }) + C(592, 92, 56, "none", { s: INK, w: 2 });
  s += P(`M0,0L300,0L0,170Z`, "#1e1820", { s: INK, w: 2 }) + P(`M${W},0L${W - 300},0L${W},170Z`, "#1e1820", { s: INK, w: 2 });
  s += S(`M0,170L300,0M${W},170L${W - 300},0`, "#5a4a3a", 9) + S(`M0,170L300,0M${W},170L${W - 300},0`, INK, 1.5);
  s += R(0, fl, W, H - fl, lin([[0, "#5a4030"], [1, "#3a2a20"]]), { s: INK, w: 2 });
  s += S(`M0,${fl + 10}H${W}M0,${fl + 21}H${W}`, "#2a1e16", 1, { op: 0.6 });
  s += C(592, 170, 300, glow(K.lamp, 0.28));
  // the lectern and the Book
  s += shadow(592, fl, 46, 6, 0.45);
  s += P(poly([[560, fl], [580, fl - 8], [604, fl - 8], [624, fl]]), shade(K.woodD), { s: INK, w: 2 });
  s += R(584, 186, 16, 78, shade(K.wood, 0.15, 0.3), { s: INK, w: 2 });
  s += P(poly([[528, 196], [656, 176], [660, 190], [532, 210]]), shade(K.wood, 0.15, 0.3), { s: INK, w: 2 });
  s += R(526, 204, 10, 9, K.woodD, { s: INK, w: 1.4 });                                                    // the ledge the Book rests on
  s += `<g transform="translate(594 178) rotate(-9)">${openBook(0, 0, 130, { drawing: "moon", seed: 5, ribbon: true }).replace(/^<g transform="[^"]*">/, "<g>")}</g>`;
  // candles on an old trunk to the left of the lectern
  s += shadow(430, fl, 62, 6, 0.45);
  s += R(372, 222, 116, 48, shade("#5a3a2a", 0.15, 0.3), { s: INK, w: 2, rx: 4 }) + R(372, 222, 116, 12, "#4a2e22", { s: INK, w: 1.6, rx: 4 }) + R(424, 234, 12, 14, K.brass, { s: INK, w: 1.4 });
  s += candle(398, 222, 26) + candle(458, 222, 20);
  // potions on a wall shelf (resting within the shelf), held up on two iron brackets
  s += R(70, 150, 170, 7, K.woodD, { s: INK, w: 1.6 });
  for (const bx of [86, 220]) s += P(`M${bx},157V178L${bx + 4},178Q${bx + 4},162 ${bx + 16},157Z`, "#2d3038", { s: INK, w: 1 });
  s += bottle(100, 150, 34, "heal") + bottle(142, 150, 38, "blast") + bottle(184, 150, 34, "bind") + bottle(220, 150, 30, "heal");
  // Noor holds a healing potion up to the light
  s += shadow(320, fl, 20, 3.4, 0.5);
  s += fig(noor, 320, fl, 196, { look: 1.2, right: [-19, -70], under: (aL, aR) => { const [x, y] = aR.wrist; return bottle(x - 0.5, y + 7.5, 13, "heal", { sw: 0.6 }); } });
  // Marco casts: a small flame burning above his open LEFT palm
  s += shadow(900, fl, 22, 3.6, 0.5);
  s += fig(marco, 900, fl, 210, {
    look: -1.2, left: [22, -57], prop: (aL) => {
      const [x, y] = aL.wrist, fx = x + 2.6, fy = y - 3.4;
      return C(fx, fy - 2, 16, glow(K.fire, 0.5)) + P(`M${r(fx)},${r(fy - 9)}Q${r(fx + 3.4)},${r(fy - 3)} ${r(fx + 2.2)},${r(fy + 1.2)}Q${r(fx)},${r(fy + 2.6)} ${r(fx - 2.2)},${r(fy + 1.2)}Q${r(fx - 3.2)},${r(fy - 2.6)} ${r(fx)},${r(fy - 9)}Z`, lin([[0, K.fireHi], [1, K.fire]]), { s: dk(K.fire, 0.4), w: 0.5 }) + P(`M${r(fx)},${r(fy - 4.4)}Q${r(fx + 1.4)},${r(fy - 1)} ${r(fx)},${r(fy + 0.8)}Q${r(fx - 1.4)},${r(fy - 1)} ${r(fx)},${r(fy - 4.4)}Z`, "#fff3c8");
    }
  });
  // old trunks on the right
  s += shadow(1060, fl, 70, 6, 0.45);
  s += R(990, 214, 140, 56, shade("#3f4a5a", 0.12, 0.3), { s: INK, w: 2, rx: 5 }) + R(990, 214, 140, 14, "#323b4a", { s: INK, w: 1.6, rx: 5 });
  s += S(`M1020,214V270M1100,214V270`, K.brassLo, 4) + R(1054, 228, 12, 14, K.brass, { s: INK, w: 1.4 });
  s += R(1010, 186, 90, 28, shade("#6a4a34", 0.12, 0.3), { s: INK, w: 2, rx: 4 });
  return { vb: `0 0 ${W} ${H}`, title: "Magic in the attic: Noor holds up a potion, the Book lies open on its lectern, Marco holds a flame in his palm", body: s };
});

// ----- Chapter 6: an investigation
piece("vignette-ch06", () => {
  const W = 1185, H = 300, g = 280;
  let s = sky(W, H, K.n0, K.n3);
  s += stars(66, 0, 4, W, 60, 30);
  // terraced houses; the middle one burned: soot over boarded windows
  const u = 1.06;
  s += neighbour(-40, g - 6, u, { wall: "#5a6078", lit: [1], door: "l" });
  s += neighbour(-40 + 130 * u, g - 6, u, { wall: "#4a4448", lit: [], door: "l", doorC: "#2a2424" });
  { const x = -40 + 130 * u;
    for (const [wx, wy, ww, wh] of [[16, -158, 38, 50], [76, -158, 38, 50], [62, -84, 48, 56]]) {
      s += R(x + wx * u, g - 6 + wy * u, ww * u, wh * u, "#141012", { s: INK, w: 1.6 });
      s += S(`M${r(x + wx * u)},${r(g - 6 + (wy + wh * 0.3) * u)}h${r(ww * u)}M${r(x + wx * u)},${r(g - 6 + (wy + wh * 0.7) * u)}h${r(ww * u)}`, "#6a5444", 5);
      s += P(`M${r(x + (wx - 4) * u)},${r(g - 6 + wy * u)}Q${r(x + (wx + ww / 2) * u)},${r(g - 6 + (wy - 36) * u)} ${r(x + (wx + ww + 4) * u)},${r(g - 6 + wy * u)}Z`, "#151012", { op: 0.75 });
    } }
  s += neighbour(-40 + 260 * u, g - 6, u, { wall: "#6c5a50", lit: [0, 2], door: "r", render: true });
  s += neighbour(-40 + 390 * u, g - 6, u, { wall: "#5c5470", lit: [1, 2], door: "l" });
  s += neighbour(-40 + 520 * u, g - 6, u, { wall: "#4f5a70", lit: [0], door: "r", render: true });
  s += neighbour(-40 + 650 * u, g - 6, u, { wall: "#665248", lit: [0, 2], door: "l" });
  s += neighbour(-40 + 780 * u, g - 6, u, { wall: "#5a6078", lit: [1], door: "r" });
  s += R(0, g - 6, W, H - g + 6, lin([[0, "#3d4459"], [1, "#262b3a"]]), { s: INK, w: 1.6 });
  // striped tape across the burned house, tied to two posts
  const t0 = -40 + 130 * u - 6, t1 = -40 + 260 * u + 6;
  for (const tx of [t0, t1]) s += R(tx - 3, g - 64, 6, 64, "#c9ccd4", { s: INK, w: 1.4 }) + shadow(tx, g, 8, 2);
  s += P(`M${t0},${g - 56}Q${(t0 + t1) / 2},${g - 46} ${t1},${g - 56}L${t1},${g - 50}Q${(t0 + t1) / 2},${g - 40} ${t0},${g - 50}Z`, "#f1ece0", { s: INK, w: 1 });
  for (let i = 0; i < 9; i++) { const x = t0 + 8 + i * (t1 - t0 - 16) / 8; s += R(x - 4, g - 54 + Math.sin(i / 8 * Math.PI) * 9, 8, 6, K.red, { op: 0.9 }); }
  // small bare footprints in the ash on the pavement
  for (let i = 0; i < 6; i++) { const x = 330 + i * 26, y = g + 8 + (i % 2) * 6; s += E(x, y, 4, 2, "#151216", { op: 0.6 }) + E(x + 5, y - 0.5, 1.4, 1, "#151216", { op: 0.6 }); }
  // the lamp
  s += streetLamp(650, g - 4, 150) + lampGlow(650, g - 140, 120, 0.35) + shadow(650, g - 4, 9, 2);
  // Dana talks to a neighbour on her doorstep (a talking lead)
  const nx = -40 + 390 * u + 30 * u;
  s += C(nx, g - 60, 70, glow(K.lamp, 0.35));
  s += fig(civ({ skin: "#e8c8b0", hair: "#d8d4cc", style: "bun", top: "#8a6a7a", bottom: "#4a4a58", shoe: "#3a2a2a", coat: "#6a7a8a", coatLen: -30, mouth: "flat" }), nx, g - 10, 150, { look: -1, left: [8, -64], right: [-11, -45] });
  s += shadow(nx - 90, g, 18, 3) + fig(dana, nx - 90, g, 176, { look: 1.4, left: [11, -48], right: [-6, -60], mouth: "smile" });
  // June searches: she writes in her notebook by the footprints (a searching lead)
  s += shadow(270, g, 16, 3) + fig(june, 270, g, 150, {
    look: 1, notebook: false, left: [3.2, -60], right: [-1.6, -61],
    prop: (aL, aR) => {
      const [x, y] = aL.wrist;
      let t = P(poly([[x - 9, y - 4], [x + 2, y - 5.4], [x + 2.6, y + 3.6], [x - 8.4, y + 5]]), "#f6eedc", { s: INK, w: 0.5 }) + P(poly([[x + 2, y - 5.4], [x + 10.6, y - 6], [x + 11.2, y + 3], [x + 2.6, y + 3.6]]), "#efe4cc", { s: INK, w: 0.5 });
      t += S(`M${r(x - 7.6)},${r(y - 1.6)}h7M${r(x - 7.4)},${r(y + 0.6)}h6M${r(x + 3.6)},${r(y - 2.6)}h6`, "#6a5a4a", 0.4);
      const [hx, hy] = aR.wrist;
      t += S(`M${r(hx + 1.2)},${r(hy - 1)}L${r(hx + 4.6)},${r(hy - 5)}`, INK, 1.4) + S(`M${r(hx + 1.2)},${r(hy - 1)}L${r(hx + 4.6)},${r(hy - 5)}`, "#3a5a8a", 0.8);
      t += aR.handSvg;
      return t;
    }
  });
  // Noor asks a gull on the garden wall what it saw (Wild)
  s += R(820, g - 52, 190, 52, shade(K.stone, 0.12, 0.3), { s: INK, w: 1.6 }) + R(814, g - 58, 202, 8, lt(K.stone, 0.12), { s: INK, w: 1.6 });
  const gx = 900, gy = g - 58;
  s += gull(gx, gy, 30, 1);
  s += shadow(860, g, 16, 3) + fig(noor, 860, g, 168, { look: 1.4, left: [14, -62] });
  return { vb: `0 0 ${W} ${H}`, title: "An investigation on a burned street: June notes footprints in the ash, Dana questions a neighbour, Noor asks a gull", body: s };
});

/** A herring gull standing on a surface (feet at x, y), side view. facing: +1 = beak to the right. */
function gull(x, y, size, facing = 1, o = {}) {
  const { sw = 1.2 } = o;
  const k = size / 40, M = ([px, py]) => [x + px * k * facing, y + py * k];
  let s = shadow(x, y, 9 * k, 1.6 * k, 0.4);
  for (const dx of [-2, 2]) s += S(poly([M([dx, -12]), M([dx, -0.5])], false), "#e0a868", sw * 1.2) + S(poly([M([dx - 3, 0]), M([dx + 3, 0])], false), "#e0a868", sw);
  s += P(sm([[-18, -22], [-6, -28], [10, -26], [16, -20], [6, -12], [-10, -12], [-22, -16]].map(M)), lin([[0, "#ffffff"], [1, "#c9ccd4"]]), { s: INK, w: sw });
  s += P(sm([[-20, -20], [-6, -26], [8, -22], [-4, -18], [-26, -14]].map(M)), "#8a929e", { s: INK, w: sw * 0.8 });
  s += P(poly([M([-26, -14]), M([-30, -12]), M([-22, -15])]), "#2a2a30");
  s += C(...M([12, -30]), 6 * k, "#ffffff", { s: INK, w: sw });
  s += P(poly([M([17, -31]), M([24, -29.5]), M([17, -28])]), "#f0c040", { s: INK, w: sw * 0.6 }) + C(...M([22, -29.6]), 0.8 * k, K.red);
  s += C(...M([13.6, -31.4]), 1.1 * k, "#1a1a1a");
  return s;
}

// ----- Chapter 8: seasons (the walled garden through the year; the Book open in front)
piece("vignette-ch08", () => {
  const W = 1185, H = 300, pw = W / 4;
  const seasons = [
    { sky: ["#1e2a4a", "#4a5a86"], leaf: "#f2c9d4", fruit: null, ground: "#3f5a3a", name: "spring" },
    { sky: ["#162040", "#3a4a78"], leaf: "#3f7f58", fruit: K.red, ground: "#36502f", name: "summer" },
    { sky: ["#1e1c38", "#5a4a6a"], leaf: "#d98a3a", fruit: null, ground: "#4a4430", name: "autumn" },
    { sky: ["#1a2238", "#6a7690"], leaf: null, fruit: null, ground: "#e8ecf2", name: "winter" },
  ];
  let s = "";
  seasons.forEach((q, i) => {
    const x0 = i * pw, cx = x0 + pw / 2;
    const cl = clip(R(x0, 0, pw, H, "#000"));
    let p = R(x0, 0, pw, H, lin([[0, q.sky[0]], [1, q.sky[1]]]));
    p += stars(70 + i, x0, 4, x0 + pw, 80, 10);
    // the garden wall and the ground
    p += R(x0, 150, pw, 70, shade("#6a443c", 0.1, 0.3), { s: INK, w: 1.4 }) + brickLines(x0, 150, pw, 70, 7, INK, 0.12, 0.8) + R(x0, 146, pw, 6, K.stone, { s: INK, w: 1.2 });
    p += R(x0, 218, pw, 82, q.ground, { s: INK, w: 1.4 });
    // the apple tree and the bench under it
    const tx = cx + (i % 2 ? 26 : -26), ty = 220;
    p += shadow(tx, ty, 34, 5, 0.35);
    p += P(`M${tx - 6},${ty}Q${tx - 4},${ty - 40} ${tx - 2},${ty - 70}L${tx + 4},${ty - 70}Q${tx + 4},${ty - 40} ${tx + 8},${ty}Z`, shade("#5a3e2c"), { s: INK, w: 1.4 });
    p += S(`M${tx},${ty - 62}Q${tx - 24},${ty - 84} ${tx - 40},${ty - 92}M${tx + 2},${ty - 66}Q${tx + 22},${ty - 88} ${tx + 42},${ty - 96}M${tx},${ty - 70}Q${tx + 2},${ty - 96} ${tx - 4},${ty - 112}`, INK, 6) + S(`M${tx},${ty - 62}Q${tx - 24},${ty - 84} ${tx - 40},${ty - 92}M${tx + 2},${ty - 66}Q${tx + 22},${ty - 88} ${tx + 42},${ty - 96}M${tx},${ty - 70}Q${tx + 2},${ty - 96} ${tx - 4},${ty - 112}`, "#5a3e2c", 3.6);
    if (q.leaf) {
      const R0 = rng(80 + i), blobs = [];
      for (let k = 0; k < 9; k++) blobs.push([tx - 50 + R0() * 100, ty - 130 + R0() * 50, 16 + R0() * 10]);
      p += blobs.map(([x, y, rr]) => C(x, y, rr + 1, INK)).join("") + blobs.map(([x, y, rr]) => C(x, y, rr - 0.6, q.leaf)).join("");
      p += blobs.slice(0, 5).map(([x, y, rr]) => C(x - rr * 0.3, y - rr * 0.3, rr * 0.4, lt(q.leaf, 0.25), { op: 0.5 })).join("");
      if (q.fruit) for (let k = 0; k < 8; k++) p += C(tx - 40 + R0() * 80, ty - 120 + R0() * 40, 3.4, q.fruit, { s: INK, w: 0.8 });
      if (q.name === "autumn") for (let k = 0; k < 8; k++) { const lx = tx - 70 + R0() * 140, ly = ty - 60 + R0() * 60; p += E(lx, ly, 3.4, 1.8, "#d98a3a", { s: INK, w: 0.6, tf: `rotate(${r(R0() * 180)} ${r(lx)} ${r(ly)})` }); }
      if (q.name === "autumn") for (let k = 0; k < 10; k++) { const lx = x0 + 10 + R0() * (pw - 20), ly = 226 + R0() * 60; p += E(lx, ly, 3.4, 1.6, "#c97a2e", { op: 0.9 }); }
      if (q.name === "spring") for (let k = 0; k < 7; k++) { const lx = tx - 60 + R0() * 120, ly = ty - 50 + R0() * 50; p += C(lx, ly, 1.6, "#f6dde4"); }
    } else {
      p += S(`M${tx - 40},${ty - 92}Q${tx - 30},${ty - 110} ${tx - 50},${ty - 120}M${tx + 42},${ty - 96}Q${tx + 50},${ty - 112} ${tx + 36},${ty - 126}M${tx - 4},${ty - 112}Q${tx + 10},${ty - 124} ${tx + 6},${ty - 136}`, INK, 4.4) + S(`M${tx - 40},${ty - 92}Q${tx - 30},${ty - 110} ${tx - 50},${ty - 120}M${tx + 42},${ty - 96}Q${tx + 50},${ty - 112} ${tx + 36},${ty - 126}M${tx - 4},${ty - 112}Q${tx + 10},${ty - 124} ${tx + 6},${ty - 136}`, "#5a3e2c", 2.4);
      p += S(`M${tx},${ty - 63}Q${tx - 24},${ty - 85} ${tx - 40},${ty - 93}M${tx + 2},${ty - 67}Q${tx + 22},${ty - 89} ${tx + 42},${ty - 97}`, "#f2f4f8", 1.6);
      const R0 = rng(90);
      for (let k = 0; k < 40; k++) p += C(x0 + R0() * pw, R0() * 210, 1 + R0() * 1.2, "#f4f6fa", { op: 0.85 });
      p += R(x0, 144, pw, 5, "#f2f4f8", { s: INK, w: 0.8 });
    }
    const bx = tx + (i % 2 ? -64 : 40);
    p += R(bx, ty - 22, 46, 5, K.woodD, { s: INK, w: 1.2 }) + R(bx + 4, ty - 17, 4, 17, K.woodD, { s: INK, w: 1 }) + R(bx + 38, ty - 17, 4, 17, K.woodD, { s: INK, w: 1 }) + R(bx, ty - 36, 46, 4, K.woodD, { s: INK, w: 1.2 }) + R(bx + 2, ty - 36, 3, 15, K.woodD) + R(bx + 41, ty - 36, 3, 15, K.woodD);
    if (q.name === "winter") p += R(bx, ty - 24, 46, 3, "#f4f6fa");
    s += G(p, { clip: cl });
    if (i) s += S(`M${x0},0V${H}`, INK, 3) + S(`M${x0},0V${H}`, K.brass, 1);
  });
  // the Book lying open on the sill in front, a few pages turning
  s += R(0, 268, W, 32, shade(K.wood, 0.12, 0.3), { s: INK, w: 2 });
  s += shadow(592, 270, 150, 8, 0.4);
  s += openBook(592, 252, 250, { drawing: "leaf", seed: 8, ribbon: true });
  s += P(`M592,180Q628,150 664,150Q680,151 688,158L688,300L592,300Z`.replace("L688,300L592,300", "Q676,232 692,292Q640,288 592,322"), lin([[0, "#fbf5e6"], [1, "#e2d6bc"]], 0, 0, 1, 0), { s: INK, w: 1.4 });
  return { vb: `0 0 ${W} ${H}`, title: "Seasons: the walled garden's apple tree in spring, summer, autumn and winter, with the Book open in front", body: s };
});

// ----- Chapter 11: the episode generator (a board of pinned cards; six dice on the desk)
piece("vignette-ch11", () => {
  const W = 1185, H = 300, dY = 238;
  let s = R(0, 0, W, H, lin([[0, "#2e2a3a"], [1, "#3a3040"]]));
  s += C(590, 60, 520, glow(K.lamp, 0.22));
  // the cork board, screwed to the wall
  s += R(150, 14, 885, 206, "#000", { op: 0.25, rx: 6, tf: "translate(5 6)" });
  s += R(150, 14, 885, 206, shade("#6a4a34", 0.12, 0.3), { s: INK, w: 2.4, rx: 6 });
  s += R(162, 26, 861, 182, lin([[0, "#c99a62"], [1, "#a87a48"]]), { s: INK, w: 1.6 });
  const R0 = rng(111);
  let dots = "";
  for (let i = 0; i < 400; i++) dots += `M${r(164 + R0() * 856)},${r(28 + R0() * 178)}h0.01`;
  s += S(dots, "#7a5430", 1.6, { op: 0.5 });
  for (const [x, y] of [[158, 20], [1029, 20], [158, 214], [1029, 214]]) s += C(x, y, 2.6, "#9aa2aa", { s: INK, w: 1 });
  // six columns of index cards (threat, innocent, plan, public place, hidden place, twist); each top card shows its d6 column
  const cols = 6, cw = 118, gap = (861 - cols * cw) / (cols + 1);
  const pins = [];
  for (let i = 0; i < cols; i++) {
    const x = 162 + gap + i * (cw + gap);
    for (let j = 0; j < 2; j++) {
      const y = 40 + j * 82, rot = (R0() - 0.5) * 6, cx = x + cw / 2, cy = y + 32;
      s += sheet(cx, cy, cw - 8, 64, rot, { lines: j ? 4 : 3, seed: i * 10 + j, col: j ? "#f2ead8" : "#f6efe0" });
      if (!j) s += dieTop(cx + cw * 0.3, cy + 14, 18, i + 1, { rot: rot });
      const px = cx - cw * 0.0, py = cy - 28;
      s += pinTop(px, py, i === 0 && j === 0 ? K.red : [K.violet, K.green, K.gold, K.brass][(i + j) % 4], 4.4);
      pins.push([px, py]);
    }
  }
  // the column icons: a hat (threat), a person (innocent), a clock (plan), an awning (public), a tower (hidden), a curling arrow (twist)
  const ic = (i, d) => { const x = 162 + gap + i * (cw + gap) + 22, y = 64; return `<g transform="translate(${r(x)} ${r(y)})">${d}</g>`; };
  s += ic(0, P(`M-10,4h20l-4,-2v-8q-6,-3 -12,0v8z`, "#3c3c43", { s: INK, w: 1 }));
  s += ic(1, C(0, -6, 4, "#6a5a4a") + P(`M-7,6q7,-12 14,0z`, "#6a5a4a"));
  s += ic(2, C(0, 0, 8, "none", { s: "#6a5a4a", w: 1.6 }) + S(`M0,0V-5M0,0L4,2`, "#6a5a4a", 1.4));
  s += ic(3, P(`M-10,-2h20l-3,-6h-14z`, "#b5473f", { s: INK, w: 1 }) + S(`M-8,-2v9M8,-2v9`, "#6a5a4a", 1.4));
  s += ic(4, S(`M-5,8L0,-10L5,8M-3,0H3M-4,4H4`, "#6a5a4a", 1.4));
  s += ic(5, S(`M-8,4Q-8,-8 2,-6Q8,-4 4,2`, "#6a5a4a", 1.6) + P(`M4,2l-4,-1l5,5z`, "#6a5a4a"));
  // red thread from the threat's card to the twist, anchored on the pins
  s += S(`M${pt(pins[0])}Q${r((pins[0][0] + pins[9][0]) / 2)},${r(pins[0][1] + 40)} ${pt(pins[9])}`, K.red, 1.6) + S(`M${pt(pins[9])}Q${r((pins[9][0] + pins[10][0]) / 2)},${r(pins[9][1] + 30)} ${pt(pins[10])}`, K.red, 1.6);
  // the desk, six dice rolled in a row, a notebook and a pencil
  s += R(0, dY, W, H - dY, lin([[0, "#6a4a34"], [1, "#3e2a1e"]]), { s: INK, w: 2 });
  const rolls = [[3, 1, 2], [6, 2, 4], [1, 2, 3], [5, 1, 3], [2, 1, 4], [4, 1, 5]];
  rolls.forEach(([t, f, g], i) => { s += dieBox(330 + i * 92, 290, 36, t, f, g); });
  s += P(poly([[110, 290], [240, 290], [270, 262], [140, 262]]), lin([[0, "#7b5bc4"], [1, "#5a3e9a"]]), { s: INK, w: 1.6 }) + P(poly([[114, 286], [236, 286], [262, 264], [142, 264]]), "#f4ecd8", { s: INK, w: 1 });
  s += S(`M176,286L202,264`, "#5a3e9a", 1.6);
  s += pencil(880, 282, 1010, 266, { w: 7 });
  return { vb: `0 0 ${W} ${H}`, title: "Making an episode: index cards pinned on a cork board, one column per table, and six dice rolled on the desk", body: s };
});

// ----- Chapter 12: the first night (the table set up, from above)
piece("vignette-ch12", () => {
  const W = 1185, H = 300;
  let s = R(0, 0, W, H, lin([[0, "#4a3426"], [1, "#3a281e"]]));
  let boards = "";
  for (let y = 16; y < H; y += 26) boards += `M0,${y}H${W}`;
  for (let i = 0; i < 40; i++) { const R0 = rng(i); boards += `M${r(R0() * W)},${r(Math.floor(R0() * 12) * 26 + 16)}v26`; }
  s += S(boards, "#2a1c14", 1.2, { op: 0.6 });
  s += R(150, 20, 885, 260, K.violetLo, { op: 0.5, rx: 10 }) + R(162, 30, 861, 240, "none", { s: K.brass, w: 2, rx: 6, op: 0.6 });   // the rug
  s += C(592, 150, 420, glow(K.lamp, 0.3));
  // chairs (seen from above), tucked under the table
  const chair = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})">${R(-24, -22, 48, 44, "#000", { op: 0.25, rx: 6, tf: "translate(4 5)" })}${R(-24, -22, 48, 44, shade("#7a5236", 0.15, 0.3), { s: INK, w: 1.6, rx: 6 })}${R(-26, 16, 52, 10, shade("#5a3a26", 0.15, 0.3), { s: INK, w: 1.6, rx: 4 })}</g>`;
  for (const x of [380, 592, 804]) s += chair(x, 52, 180) + chair(x, 248, 0);
  s += chair(262, 150, 90) + chair(922, 150, -90);
  // the table
  s += R(260, 62, 665, 176, "#000", { op: 0.3, rx: 14, tf: "translate(6 8)" });
  s += R(260, 62, 665, 176, lin([[0, "#9a6e4a"], [1, "#7a5236"]], 0, 0, 1, 1), { s: INK, w: 2.4, rx: 14 });
  let grain = "";
  for (let y = 74; y < 236; y += 11) grain += `M268,${y}Q590,${y + 3} 918,${y}`;
  s += S(grain, "#5a3a26", 1, { op: 0.35 });
  // at each seat: a witch sheet and a pencil
  const seat = (x, y, rot, k) => sheet(x, y, 70, 52, rot, { lines: 5, seed: k, boxes: 4 }) + pencil(x - 24 * Math.cos(rot * Math.PI / 180), y + 30 * (y < 150 ? 1 : -1), x + 30 * Math.cos(rot * Math.PI / 180), y + 26 * (y < 150 ? 1 : -1), { w: 5 });
  s += seat(380, 98, 182, 1) + seat(592, 96, 178, 2) + seat(804, 98, 183, 3) + seat(380, 202, -3, 4) + seat(592, 204, 2, 5) + seat(804, 202, -2, 6);
  // the Storyteller's end: the tracker, this book (closed) and the episode notes
  s += sheet(868, 150, 54, 74, 90, { lines: 6, seed: 7, boxes: 6 });
  s += R(296, 118, 56, 70, "#000", { op: 0.3, rx: 3, tf: "translate(4 5)" }) + R(296, 118, 56, 70, shade("#2b3348", 0.2, 0.3), { s: INK, w: 1.6, rx: 3 }) + R(302, 126, 44, 54, "none", { s: K.brass, w: 1.2, rx: 2 });
  s += P(`M318,144L330,144L332,166L316,166Z`, "none", { s: K.brass, w: 1.4 }) + P(`M315,144L324,136L333,144Z`, "none", { s: K.brass, w: 1.4 }) + C(324, 133, 2.4, "none", { s: K.brass, w: 1.2 }) + C(324, 155, 3, K.brass, { op: 0.8 });
  // the shared dice pile in a tray (13 dice), a bowl of crisps, a jug and glasses
  s += R(530, 128, 124, 44, shade("#3a2a3a", 0.15, 0.3), { s: INK, w: 1.6, rx: 8 }) + R(536, 134, 112, 32, "#2a1e2a", { rx: 6 });
  const R1 = rng(12);
  for (let i = 0; i < 13; i++) s += dieTop(546 + (i % 7) * 15 + R1() * 3, 142 + Math.floor(i / 7) * 15 + R1() * 2, 12, 1 + Math.floor(R1() * 6), { rot: R1() * 40 - 20, sw: 0.9 });
  s += C(470, 150, 26, "#000", { op: 0.25, tf: "translate(4 5)" }) + C(470, 150, 26, shade("#3f7f58", 0.2, 0.3), { s: INK, w: 1.6 }) + C(470, 150, 21, "#e8b860", { s: INK, w: 1 });
  for (let i = 0; i < 12; i++) { const a = R1() * 6.28, q = R1() * 16; s += E(470 + Math.cos(a) * q, 150 + Math.sin(a) * q, 4.4, 3, "#f2cc78", { s: dk("#e8b860", 0.3), w: 0.6, tf: `rotate(${r(R1() * 180)} ${r(470 + Math.cos(a) * q)} ${r(150 + Math.sin(a) * q)})` }); }
  s += mugTop(712, 150, 17, { col: "#c9d6dc", drink: "#bcd6e6", hand: -20 });
  for (const [x, y] of [[420, 132], [760, 128], [760, 172], [420, 170]]) s += C(x + 3, y + 4, 9, "#000", { op: 0.2 }) + C(x, y, 9, "#dfe9ee", { s: INK, w: 1.2, fop: 0.7 }) + C(x, y, 6.6, "#bcd6e6", { op: 0.7 });
  return { vb: `0 0 ${W} ${H}`, title: "The first night: the table set for the coven, with sheets, pencils, a tray of dice, crisps and the Storyteller's notes", body: s };
});

// ---------------------------------------------------------------- more threats
/** The Night Nurse: an old-fashioned nurse's veil cap and cape, grey-violet skin, dark-ringed eyes, a white lily. */
const nightNurse = (c, p = {}) => civ({
  skin: "#b9b4c8", hair: "#3e3a40", style: "short", top: "#d8d6cf", bottom: "#d8d6cf", shoe: "#2a2a30", coat: "#27304a", coatLen: -30, mouth: "flat", eyeC: "#2a2430", skirt: -22, skirtC: "#d8d6cf",
  prop: (aL) => { const [x, y] = aL.wrist; return S(`M${r(x + 1)},${r(y + 1)}L${r(x + 2)},${r(y - 9)}`, "#4a7a4a", 0.8) + P(`M${r(x + 2)},${r(y - 9)}l-2.4,-3.2l2.4,1.2l2.4,-1.2z`, "#f6f4ee", { s: INK, w: 0.4 }); },
  ...p,
})(c, { ...p, left: p.left ?? [5, -58] }) + G(P(sm([[-8.6, -78, 1], [-8, -92], [-5.6, -98.8], [0, -100.6], [5.6, -98.8], [8, -92], [8.6, -78, 1], [6.6, -80], [6.2, -92.6], [0, -94.4], [-6.2, -92.6], [-6.6, -80]]), "#f2f0ea", { s: INK, w: c.lw }) + E(-2.4, -89.4, 1.6, 1.2, "#4a3a5a", { op: 0.45 }) + E(2.4, -89.4, 1.6, 1.2, "#4a3a5a", { op: 0.45 }));

/** Vesper Crane: a witch who stole other witches' power. Silver bob, long plum coat, a necklace of small glowing vials. */
const vesper = (c, p = {}) => civ({
  skin: "#efdccf", hair: "#cfcbd6", style: "long", hairLen: -80, top: "#1e1a22", bottom: "#2a2230", shoe: "#1a1418", coat: "#43243f", coatLen: -14, mouth: "flat", eyeC: "#8a6a2a",
  prop: () => { let t = S(`M-3.4,-78Q0,-71 3.4,-78`, "#c9a24a", 0.5); ["#b5473f", "#3f7f58", "#7b5bc4", "#c29a45", "#4f72a8"].forEach((col, i) => { const x = -2.6 + i * 1.3, y = -74.6 + Math.abs(i - 2) * -0.6; t += R(x - 0.45, y, 0.9, 2.2, col, { s: INK, w: 0.25 }); }); return t; },
  ...p,
})(c, p);

// ----- Chapter 7: a showdown (the Mirror Thief, behind the mirrors of a closed department store)
piece("vignette-ch07", () => {
  const W = 1185, H = 300, g = 290;
  let s = R(0, 0, W, H, lin([[0, "#1a1c2a"], [1, "#2a2a3a"]]));
  // the back wall: tall mirrors in gilt frames, fixed to the wall; one shattered
  for (let i = 0; i < 6; i++) {
    const x = 40 + i * 190, broken = i === 4;
    s += R(x - 6, 26, 112, 214, shade("#8a6a3a", 0.2, 0.35), { s: INK, w: 2 });
    s += R(x, 32, 100, 202, broken ? "#141622" : lin([[0, "#5a6a7a"], [0.5, "#2e3a4a"], [1, "#1e2634"]], 0, 0, 1, 1), { s: INK, w: 1.4 });
    if (!broken) s += P(poly([[x + 14, 32], [x + 40, 32], [x + 8, 120], [x, 120], [x, 70]]), "#ffffff", { op: 0.08 }) + S(`M${x + 60},${40}L${x + 30},${130}`, "#ffffff", 2, { op: 0.12 });
    else {
      s += P(poly([[x, 32], [x + 46, 32], [x + 30, 70], [x, 96]]), lin([[0, "#5a6a7a"], [1, "#2e3a4a"]]), { s: INK, w: 1 }) + P(poly([[x + 100, 120], [x + 100, 234], [x + 62, 234], [x + 78, 170]]), lin([[0, "#4a5a6a"], [1, "#2e3a4a"]]), { s: INK, w: 1 });
      s += C(x + 50, 130, 70, glow("#9fb4c8", 0.18));
    }
  }
  s += R(0, 240, W, 50, lin([[0, "#2a2838"], [1, "#22202e"]]));
  s += R(0, g - 22, W, H - g + 22, lin([[0, "#3a3848"], [1, "#2a2836"]]), { s: INK, w: 1.6 });
  let tl = "";
  for (let x = -40; x < W + 40; x += 90) tl += `M${x},${g - 22}L${x - 30},${H}`;
  s += S(tl + `M0,${g - 8}H${W}`, "#1e1c28", 1.2, { op: 0.7 });
  const R0 = rng(77);
  for (let i = 0; i < 9; i++) { const x = 800 + R0() * 150, y = g - 16 + R0() * 18; s += P(poly([[x, y], [x + 6 + R0() * 6, y - 2], [x + 4, y + 3]]), "#8fa3b8", { s: INK, w: 0.8 }); }
  // dust sheets over the display tables
  s += P(sm([[30, g - 10, 1], [34, g - 50], [60, g - 66], [120, g - 64], [140, g - 46], [146, g - 10, 1]]), shade("#bfbab0", 0.1, 0.3), { s: INK, w: 1.6 }) + shadow(88, g - 10, 60, 4);
  s += P(sm([[1066, g - 10, 1], [1070, g - 56], [1096, g - 72], [1150, g - 70], [1172, g - 52], [1176, g - 10, 1]]), shade("#bfbab0", 0.1, 0.3), { s: INK, w: 1.6 }) + shadow(1120, g - 10, 60, 4);
  // Noor's Bind: ivy from a big planter wraps the creature's legs (the stems reach into the soil)
  s += shadow(880, g, 34, 5, 0.45);
  s += P(poly([[856, g], [850, g - 34], [910, g - 34], [904, g]]), shade("#8a5a3a", 0.15, 0.3), { s: INK, w: 1.6 }) + R(846, g - 40, 68, 8, "#9a6a4a", { s: INK, w: 1.4 }) + E(880, g - 38, 30, 3, "#3b2a1e");
  // the Mirror Thief, its long right hand grabbing at Rook
  const tx = 990;
  s += shadow(tx, g, 40, 5, 0.5);
  s += fig(mirrorThief, tx, g, 268, { reach: [-34, -70], left: [16, -46], spread: 3.4 });
  const ivy = `M874,${g - 38}C864,${g - 80} 930,${g - 70} 962,${g - 60}C990,${g - 52} 1020,${g - 70} 1010,${g - 90}M886,${g - 38}C898,${g - 70} 950,${g - 40} 980,${g - 30}C1006,${g - 22} 1020,${g - 44} 1008,${g - 56}M870,${g - 38}C840,${g - 70} 856,${g - 110} 896,${g - 104}`;
  s += S(ivy, INK, 6) + S(ivy, "#3f7f58", 3.4);
  for (const [lx, ly, a] of [[930, g - 70, -30], [962, g - 60, 20], [990, g - 54, -10], [950, g - 42, 30], [994, g - 26, -20], [856, g - 90, 40], [888, g - 104, -20], [1010, g - 86, 10]]) s += E(lx, ly, 6, 3.4, "#5aa070", { s: INK, w: 0.9, tf: `rotate(${a} ${lx} ${ly})` });
  // Dana's Force: a dust-sheeted bust flies over Rook's head at the creature
  s += S(`M640,30Q720,22 820,28M650,46Q730,38 816,44M680,62Q760,56 812,58`, "#cfd6e6", 2, { op: 0.5 });
  s += `<g transform="translate(862 42) rotate(18)">${P(sm([[-16, 14, 1], [-14, -4], [-8, -14], [0, -18], [8, -14], [14, -4], [16, 14, 1]]), shade("#bfbab0", 0.1, 0.3), { s: INK, w: 1.4 })}${R(-18, 14, 36, 6, K.woodD, { s: INK, w: 1.2 })}</g>`;
  // the coven: Dana, Noor, Marco (a ball of fire ready in his hand); Rook steps in to take the blow
  s += shadow(130, g, 20, 3.6, 0.5) + fig(dana, 130, g, 204, { look: 1.6, left: [22, -74], right: [-12, -46], mouth: "grim" });
  s += shadow(300, g, 18, 3.4, 0.5) + fig(noor, 300, g, 184, { look: 1.6, left: [24, -58], mouth: "grim" });
  s += shadow(450, g, 22, 3.6, 0.5) + fig(marco, 450, g, 196, {
    look: 1.6, mouth: "grim", left: [20, -82], prop: (aL) => {
      const [x, y] = aL.wrist, fx = x + 1.6, fy = y - 7;
      return C(fx, fy, 14, glow(K.fire, 0.55)) + C(fx, fy, 4.6, rad([[0, "#fff3c8"], [0.5, K.fireHi], [1, K.fire]]), { s: dk(K.fire, 0.4), w: 0.5 }) + P(`M${r(fx - 3.6)},${r(fy - 2)}Q${r(fx - 1)},${r(fy - 10)} ${r(fx + 1)},${r(fy - 12)}Q${r(fx + 2)},${r(fy - 7)} ${r(fx + 3.8)},${r(fy - 2)}Z`, K.fire, { op: 0.85 });
    }
  });
  s += shadow(740, g, 24, 4, 0.5) + fig(rookMan, 740, g, 230, { look: 1.4, left: [20, -78], right: [-14, -50] });
  return { vb: `0 0 ${W} ${H}`, title: "A showdown in a closed department store: the coven and Rook against the Mirror Thief", body: s };
});

// ----- Chapter 9: the Storyteller's table (players around it, the Storyteller at the end)
piece("vignette-ch09", () => {
  const W = 1185, H = 300, tY = 206;
  let s = R(0, 0, W, H, lin([[0, "#3a2c3a"], [1, "#2a2230"]]));
  // the front room: a window onto the night street, a bookcase
  s += R(70, 26, 190, 140, lin([[0, K.n1], [1, K.n3]]), { s: INK, w: 2 });
  s += G(terraceRow(66, 266, 166, { seed: 91, hMin: 40, hMax: 60, wMin: 34, wMax: 46, litP: 0.5, sw: 1 }) + stars(91, 74, 30, 256, 80, 10), { clip: clip(R(70, 26, 190, 140, "#000")) });
  s += S(`M165,26V166M70,96H260`, "#5a4030", 5) + R(70, 26, 190, 140, "none", { s: "#5a4030", w: 8 }) + R(64, 20, 202, 152, "none", { s: INK, w: 2 });
  s += P(`M56,14Q90,90 70,180L44,180Q60,90 40,14Z`, K.violetLo, { s: INK, w: 1.4 }) + P(`M274,14Q240,90 262,180L288,180Q272,90 292,14Z`, K.violetLo, { s: INK, w: 1.4 }) + R(36, 10, 262, 6, K.woodD, { s: INK, w: 1.4 });
  s += R(930, 20, 210, 190, shade(K.woodD, 0.1, 0.3), { s: INK, w: 2 });
  for (let i = 0; i < 4; i++) {
    const y = 26 + i * 46;
    s += R(938, y + 40, 194, 5, K.wood, { s: INK, w: 1 });
    const R0 = rng(i + 9);
    for (let x = 942; x < 1124;) { const bw = 7 + R0() * 9, bh = 26 + R0() * 12; s += R(x, y + 40 - bh, bw, bh, ["#7b5bc4", "#3f7f58", "#b5473f", "#c29a45", "#4f72a8", "#8a6a5a"][Math.floor(R0() * 6)], { s: INK, w: 0.8 }); x += bw + 1; }
  }
  // the lamp over the table, on its cord from the ceiling
  s += S(`M560,0V50`, INK, 1.6) + P(`M530,74Q560,40 590,74Z`, shade(K.brass, 0.25, 0.3), { s: INK, w: 1.6 }) + E(560, 74, 30, 4, K.glow, { s: INK, w: 1 }) + C(560, 120, 300, glow(K.lamp, 0.3));
  // the players, seated behind the table (only their upper halves show above it)
  const seat = (fn, x, h, p) => fig(fn, x, tY - 0.36 * h + h, h, p);
  s += seat(civ({ skin: "#8a5a3c", hair: "#1a1210", style: "curly", top: "#c29a45", glasses: true }), 400, 190, { look: 0.8, left: [9, -56], right: [-9, -56] });
  s += seat(civ({ skin: "#e8c4a8", hair: "#7a4a2a", style: "long", top: "#3f7f58", hairLen: -76 }), 520, 180, { look: 0.6, mouth: "grin", left: [6, -78], right: [-9, -58], bendL: -1 });
  s += seat(civ({ skin: "#c9936a", hair: "#2a1a12", style: "short", top: "#4f72a8", hat: null }), 650, 190, { look: 1, left: [10, -56], right: [-10, -56] });
  s += seat(civ({ skin: "#f0d0b8", hair: "#c4a060", style: "bun", top: "#b5473f" }), 770, 182, { look: 1.2, mouth: "o", left: [9, -56], right: [-9, -56] });
  // dice thrown above the table, mid-roll, from the second player's raised hand
  s += S(`M548,150Q560,136 568,140M550,156Q574,146 588,160`, "#f4efe4", 1.6, { op: 0.55 });
  s += dieTop(572, 146, 12, 5, { rot: 20, sw: 1 }) + dieTop(594, 168, 12, 2, { rot: -15, sw: 1 });
  // the table, with a long cloth to the floor
  s += P(poly([[300, tY], [880, tY], [890, tY + 12], [290, tY + 12]]), lin([[0, "#7a5236"], [1, "#9a6e4a"]]), { s: INK, w: 1.6 });
  s += P(poly([[290, tY + 12], [890, tY + 12], [896, H + 2], [284, H + 2]]), shade(K.violetLo, 0.12, 0.3), { s: INK, w: 1.6 });
  s += S(`M290,${tY + 20}H890`, K.brass, 2);
  // on the table: sheets lying flat, mugs, dice, the tracker
  s += P(poly([[360, tY + 9], [410, tY + 9], [416, tY + 3], [366, tY + 3]]), K.paper, { s: INK, w: 1 }) + P(poly([[600, tY + 9], [650, tY + 9], [656, tY + 3], [606, tY + 3]]), K.paper, { s: INK, w: 1 }) + P(poly([[740, tY + 9], [790, tY + 9], [796, tY + 3], [746, tY + 3]]), K.paper, { s: INK, w: 1 });
  for (const [x, col] of [[452, K.green], [700, "#c9d6dc"], [826, K.red]]) s += R(x - 9, tY - 12, 18, 18, shade(col, 0.2, 0.3), { s: INK, w: 1.2, rx: 2 }) + E(x, tY - 12, 9, 2.4, "#5a3e2c", { s: INK, w: 1 });
  s += dieBox(480, tY + 8, 12, 6, 2, 4, { sw: 1 }) + dieBox(500, tY + 9, 12, 3, 1, 2, { sw: 1 });
  // the Storyteller, standing at the end with the episode tracker
  s += fig(civ({ skin: "#d9a982", hair: "#2a2420", style: "short", top: "#2b3348", bottom: "#3a3a44", coat: "#5a4a6a", coatLen: -42, glasses: true, mouth: "grin" }), 960, 292, 226, {
    look: -1.4, left: [6, -60], right: [-16, -66],
    prop: (aL) => { const [x, y] = aL.wrist; return R(x - 2, y - 9, 11, 14, K.paper, { s: INK, w: 0.6, tf: `rotate(-10 ${r(x)} ${r(y)})` }) + S(`M${r(x)},${r(y - 6)}h6M${r(x)},${r(y - 3)}h6`, "#6a5a4a", 0.4) + aL.handSvg; },
  });
  return { vb: `0 0 ${W} ${H}`, title: "The Storyteller at the end of the table, players rolling dice in the front room", body: s };
});

// ----- Chapter 10: the threats, side by side in the fog
piece("vignette-ch10", () => {
  const W = 1185, H = 300, g = 292;
  let s = R(0, 0, W, H, lin([[0, "#140f1c"], [0.6, "#2a1622"], [1, "#3a1a22"]]));
  s += E(592, 230, 640, 140, K.red, { op: 0.16 });
  const line = [[quietMan, 100, 236, {}], [ashWidow, 290, 222, {}], [mirrorThief, 500, 262, { reach: [-16, -44], left: [16, -44], spread: 2.4 }], [nightNurse, 700, 214, {}], [vesper, 880, 224, {}]];
  for (const [fn, x, h, p] of line) s += C(x, g - h * 0.6, h * 0.55, glow(K.red, 0.3)) + fig(fn, x, g, h, p);
  // the Drowned Choir: three ghosts standing waist-deep in the fog
  s += C(1080, 200, 110, glow("#7fc9b6", 0.2));
  s += fig(ghost, 1040, g + 78, 200, { bonnet: true }) + fig(ghost, 1124, g + 82, 196, { hair: "#28423f" }) + fig(ghost, 1082, g + 100, 214, {});
  // fog over their feet
  s += R(0, 236, W, 64, lin([[0, "#5a4a5a", 0], [0.5, "#5a4a5a", 0.55], [1, "#4a3a4a", 0.9]]));
  for (const [x, w] of [[120, 220], [420, 260], [760, 240], [1060, 220]]) s += E(x, 270, w, 26, "#6a5a6a", { op: 0.35 });
  return { vb: `0 0 ${W} ${H}`, title: "The threats of Larkhaven in a red fog: the Quiet Man, the Ash Widow, the Mirror Thief, the Night Nurse, Vesper Crane and the Drowned Choir", body: s };
});

/** A market stall seen from the front: a striped awning on two poles, a counter with goods. */
function stall(x, g, w, o = {}) {
  const { a = K.red, b = "#efe6d2", goods = "jars", sw = 1.4, lit = true } = o;
  const h = w * 0.9;
  let s = shadow(x + w / 2, g, w * 0.55, 4, 0.4);
  for (const px of [x + 3, x + w - 3]) s += R(px - 2, g - h, 4, h, "#5a4030", { s: INK, w: sw * 0.7 });
  s += R(x, g - h * 0.42, w, h * 0.42, shade(K.wood, 0.12, 0.3), { s: INK, w: sw });
  s += R(x - 2, g - h * 0.46, w + 4, 5, K.woodL, { s: INK, w: sw * 0.8 });
  const R0 = rng(Math.round(x));
  if (goods === "jars") for (let i = 0; i < Math.floor(w / 10); i++) s += R(x + 4 + i * 10, g - h * 0.46 - 8, 7, 8, ["#c97a2e", K.gold, K.red, K.green][i % 4], { s: INK, w: 0.6, rx: 1 });
  else if (goods === "fruit") for (let i = 0; i < Math.floor(w / 7); i++) s += C(x + 5 + i * 7, g - h * 0.46 - 3, 3, ["#e0913a", K.red, "#8cc94a"][Math.floor(R0() * 3)], { s: INK, w: 0.5 });
  else if (goods === "records") for (let i = 0; i < Math.floor(w / 12); i++) s += R(x + 4 + i * 12, g - h * 0.46 - 11, 10, 11, ["#3a3a44", "#7b5bc4", "#b5473f"][i % 3], { s: INK, w: 0.6 });
  // awning: stripes, scalloped front edge
  const ay = g - h, n = 6, sw2 = (w + 8) / n;
  for (let i = 0; i < n; i++) s += P(poly([[x - 4 + i * sw2, ay], [x - 4 + (i + 1) * sw2, ay], [x - 4 + (i + 1) * sw2 + 2, ay - 14], [x - 4 + i * sw2 + 2, ay - 14]]), i % 2 ? b : a);
  let sc = `M${r(x - 4)},${r(ay)}`;
  for (let i = 0; i < n; i++) sc += `q${r(sw2 / 2)},7 ${r(sw2)},0`;
  s += P(sc + "Z", a, { s: INK, w: sw * 0.7 });
  s += P(poly([[x - 4, ay], [x + w + 4, ay], [x + w + 6, ay - 14], [x - 2, ay - 14]]), "none", { s: INK, w: sw });
  if (lit) s += C(x + w / 2, ay + 10, w * 0.6, glow(K.lamp, 0.35));
  return s;
}

// ----- Chapter 14: the night market, and the Quiet Man in the crowd
piece("vignette-ch14", () => {
  const W = 1185, H = 300, g = 292;
  let s = sky(W, H, K.n0, K.n3, K.n1);
  s += stars(141, 0, 4, W, 70, 30);
  s += terraceRow(-20, 380, 168, { seed: 142, hMin: 60, hMax: 80, wMin: 50, wMax: 70, litP: 0.5 }) + terraceRow(800, W + 20, 168, { seed: 143, hMin: 60, hMax: 80, wMin: 50, wMax: 70, litP: 0.5 });
  s += marketHall(370, 196, 440, 150, { sw: 2 });
  s += R(340, 196, 500, 10, K.stone, { s: INK, w: 1.6 }) + R(320, 206, 540, 10, lt(K.stone, 0.06), { s: INK, w: 1.6 });     // St Bride's steps
  s += cobbles(0, 214, W, H, 144, { c: "#3a3f54", line: "#22263a", rows: 5 });
  // Bea sings on the steps with her guitar
  s += shadow(590, 206, 10, 2, 0.4) + fig(civ({ skin: "#d9a982", hair: "#2b1a13", style: "beanie", top: "#efe6d2", coat: "#6c7040", coatLen: -44, bottom: "#3a3a44", mouth: "open", hairLen: -70 }), 590, 206, 120, {
    left: [4, -58], right: [-6, -52],
    under: () => P(`M-6,-46Q-14,-46 -14,-40Q-14,-34 -6,-34Q-2,-30 4,-34Q10,-34 10,-40Q10,-46 4,-46Q-1,-50 -6,-46Z`, shade("#d49a52", 0.2, 0.3), { s: INK, w: 0.8 }) + C(-2, -40, 2, "#3a2a1a") + R(2, -60, 2.4, 20, "#5a3a22", { s: INK, w: 0.5, tf: "rotate(30 2 -40)" }),
  });
  // string lights hung from pole to pole over the lanes
  for (const px of [40, 300, 880, 1140]) s += R(px - 2.5, 60, 5, 162, "#2d3038", { s: INK, w: 1.2 }) + shadow(px, 222, 6, 1.5);
  s += stringLights([40, 64], [300, 64], 18, 12) + stringLights([880, 64], [1140, 64], 18, 12) + stringLights([300, 64], [370, 100], 6, 4) + stringLights([810, 100], [880, 64], 6, 4);
  s += stall(20, 250, 110, { a: K.red, goods: "jars" }) + stall(150, 252, 100, { a: K.green, goods: "fruit" }) + stall(920, 252, 100, { a: K.violet, goods: "records" }) + stall(1050, 250, 120, { a: K.brass, goods: "jars" });
  // the crowd, watching Bea (their backs to us), at different depths
  const crowd = [[380, 250, 110, "#e8c4a8", "#5a3a2a", "#4f72a8", "long"], [470, 246, 104, "#8a5a3c", "#1a1210", "#b5473f", "short"], [700, 248, 106, "#f0d0b8", "#c4a060", "#3f7f58", "bun"], [790, 252, 110, "#c9936a", "#2a1a12", "#c29a45", "curly"], [300, 284, 140, "#d9a982", "#3a2a20", "#5a4a6a", "short"], [540, 290, 146, "#6e4632", "#1b1412", "#e0913a", "short"], [640, 280, 136, "#f2d4b9", "#6a4a32", "#7b5bc4", "long"], [880, 290, 142, "#e8c8b0", "#7a6a5a", "#3e5a7a", "short"]];
  crowd.sort((a, b) => a[1] - b[1]);
  for (const [x, y, h, skin, hair, top, style] of crowd) s += shadow(x, y, h * 0.1, 2.4, 0.4) + fig(civ({ skin, hair, style, top, bottom: "#30343f", back: true, hairLen: -74 }), x, y, h, {});
  // the Quiet Man, at the edge of the crowd and facing the other way, very still, holding a stolen voice in a glass valve
  s += C(1000, 200, 70, glow(K.lamp, 0.16));
  s += shadow(1000, g, 18, 3, 0.55) + fig(quietMan, 1000, g, 178, {});
  return { vb: `0 0 ${W} ${H}`, title: "The Friday night market at St Bride's: stalls, string lights, a crowd watching Bea sing on the steps, and the Quiet Man standing still at its edge", body: s };
});

// ----- Chapter 15: the Ash Widow at the burned-out Mariner Theatre
piece("vignette-ch15", () => {
  const W = 1185, H = 300, g = 288;
  let s = sky(W, H, K.n0, "#3a2236", K.n1);
  s += stars(151, 0, 4, W, 80, 26);
  // the docks behind: cranes, container stacks, new flats with lit windows
  s += crane(90, 230, 150, "#3e4a63") + crane(1090, 230, 160, "#3e4a63");
  s += block(940, 230, 110, 150, "#4a5068", { rows: 7, cols: 4, seed: 3, litP: 0.5 }) + block(150, 230, 90, 120, "#4a5068", { rows: 6, cols: 3, seed: 4, litP: 0.4 });
  for (let i = 0; i < 10; i++) s += R(20 + (i % 5) * 34, 230 - 14 - Math.floor(i / 5) * 14, 33, 14, ["#7b5bc4", "#3f7f58", "#b5473f", "#c29a45", "#4f72a8"][i % 5], { s: INK, w: 0.9, op: 0.8 });
  // the Mariner: a classical front, burned; roof fallen in, charred beams against the sky
  const tx = 330, tw = 520, top = 60;
  s += C(tx + tw / 2, 180, 300, glow(K.fire, 0.18));
  s += P(poly([[tx, g], [tx, top + 40], [tx + 60, top + 40], [tx + 90, top], [tx + 180, top + 28], [tx + 260, top - 6], [tx + 330, top + 30], [tx + 420, top + 8], [tx + 460, top + 40], [tx + tw, top + 40], [tx + tw, g]]), shade("#5a4a46", 0.1, 0.3), { s: INK, w: 2 });
  s += S(`M${tx + 120},${top + 30}L${tx + 150},${top - 18}M${tx + 200},${top + 24}L${tx + 230},${top - 26}M${tx + 360},${top + 28}L${tx + 380},${top - 10}`, INK, 7) + S(`M${tx + 120},${top + 30}L${tx + 150},${top - 18}M${tx + 200},${top + 24}L${tx + 230},${top - 26}M${tx + 360},${top + 28}L${tx + 380},${top - 10}`, "#2a2020", 4);
  s += R(tx - 6, top + 40, tw + 12, 10, "#6a5a54", { s: INK, w: 1.6 });
  for (const sx of [tx + 70, tx + 450]) s += R(sx - 12, top + 50, 24, g - top - 50, shade("#6a5a54", 0.12, 0.3), { s: INK, w: 1.6 });
  // soot streaks over the upper windows, glowing inside
  for (let i = 0; i < 5; i++) {
    const wx = tx + 110 + i * 64;
    s += P(`M${wx},${top + 130}V${top + 84}A16,16 0 0 1 ${wx + 32},${top + 84}V${top + 130}Z`, lin([[0, K.amber], [1, K.red]]), { s: INK, w: 1.6 });
    s += P(`M${wx - 4},${top + 76}Q${wx + 16},${top + 30} ${wx + 36},${top + 76}Z`, "#1a1416", { op: 0.75 });
  }
  // three arched doorways, boarded; a sagging canopy over the middle one, still hung on its chains
  for (let i = 0; i < 3; i++) {
    const dx = tx + 120 + i * 110;
    s += P(`M${dx},${g}V${g - 70}A28,28 0 0 1 ${dx + 56},${g - 70}V${g}Z`, "#1a1416", { s: INK, w: 1.8 });
    s += S(`M${dx + 2},${g - 60}L${dx + 54},${g - 40}M${dx + 2},${g - 30}L${dx + 54},${g - 46}M${dx + 2},${g - 16}H${dx + 54}`, "#6a5444", 6) + S(`M${dx + 2},${g - 60}L${dx + 54},${g - 40}M${dx + 2},${g - 30}L${dx + 54},${g - 46}M${dx + 2},${g - 16}H${dx + 54}`, INK, 1, { op: 0.5 });
  }
  s += S(`M${tx + 210},${g - 140}L${tx + 230},${g - 112}M${tx + 330},${g - 140}L${tx + 316},${g - 106}`, "#2d3038", 1.6);
  s += P(poly([[tx + 220, g - 112], [tx + 324, g - 104], [tx + 330, g - 96], [tx + 214, g - 106]]), "#3a2e2c", { s: INK, w: 1.6 });
  // the ticket booth at the side
  s += R(tx + 476, g - 64, 36, 64, shade("#4a3a36", 0.1, 0.3), { s: INK, w: 1.6 }) + R(tx + 482, g - 56, 24, 20, "#140f12", { s: INK, w: 1.2 }) + P(poly([[tx + 472, g - 64], [tx + 494, g - 80], [tx + 516, g - 64]]), "#3a2e2c", { s: INK, w: 1.4 });
  s += R(0, g, W, H - g, lin([[0, "#2a2a36"], [1, "#1a1a24"]]), { s: INK, w: 1.6 });
  // the Ash Widow, at the middle doorway; the ground lit by her
  s += E(tx + 278, g, 90, 10, K.fire, { op: 0.25 }) + C(tx + 278, g - 100, 120, glow(K.fire, 0.35));
  s += fig(ashWidow, tx + 278, g, 196, {});
  return { vb: `0 0 ${W} ${H}`, title: "The Ash Widow at the door of the burned-out Mariner Theatre on the docks", body: s };
});

// ----- Chapter 16: the drowned village at low tide and the long pier at dusk
piece("vignette-ch16", () => {
  const W = 1185, H = 300, hz = 176;
  let s = R(0, 0, W, H, lin([[0, "#2a2448"], [0.45, "#5a3a62"], [0.75, "#a0586a"], [1, "#e0a070"]]));
  s += C(780, hz, 220, glow("#ffc890", 0.45));
  s += stars(161, 0, 4, W, 60, 20);
  // the sea and the mudflats, shining with the sky
  s += R(0, hz, W, H - hz, lin([[0, "#7a5a7a"], [1, "#3a3050"]]));
  s += P(`M0,${hz + 10}L360,${hz + 14}Q500,${hz + 18} 560,${hz + 44}Q600,${hz + 80} 640,${H}L0,${H}Z`, lin([[0, "#7a5a6a"], [0.35, "#56404e"], [1, "#2e2434"]]), { s: INK, w: 1.4 });
  s += S(`M30,${hz + 40}Q160,${hz + 30} 280,${hz + 52}M60,${hz + 80}Q220,${hz + 66} 400,${hz + 96}M120,${hz + 110}Q260,${hz + 100} 470,${hz + 122}`, "#c88a8a", 3, { op: 0.6 });
  // reeds at the near edge
  let rd = "";
  const R0 = rng(5);
  for (let x = 0; x < 230; x += 3.4) rd += `M${r(x)},${H}q${r(R0() * 6 - 3)},${r(-20 - R0() * 30)} ${r(R0() * 8 - 4)},${r(-34 - R0() * 30)}`;
  s += S(rd, "#5a6a4a", 1.4);
  // stumps of cottage walls, the dry well
  for (const [x, w, h] of [[120, 40, 14], [200, 30, 10], [270, 46, 18], [360, 34, 12]]) s += P(poly([[x, hz + 40], [x, hz + 40 - h], [x + w * 0.3, hz + 40 - h * 1.3], [x + w * 0.6, hz + 40 - h * 0.8], [x + w, hz + 40 - h], [x + w, hz + 40]]), "#4a4448", { s: INK, w: 1.2 });
  s += E(320, hz + 64, 14, 4, "#2a2228", { s: INK, w: 1.2 }) + R(306, hz + 56, 28, 8, "#5a5458", { s: INK, w: 1.2 });
  // St Agnes: roofless nave walls and the tower, an empty bell frame at the top
  const cx = 430, cb = hz + 46;
  // the choir, faint, standing in rows in the roofless nave (behind its broken wall)
  s += C(cx - 96, cb - 24, 50, glow("#7fc9b6", 0.25));
  for (let i = 0; i < 6; i++) s += fig(ghost, cx - 138 + i * 16, cb + 10, 44, { op: 0.6, bonnet: i % 2 === 0 });
  s += P(poly([[cx - 150, cb], [cx - 150, cb - 34], [cx - 136, cb - 38], [cx - 126, cb - 14], [cx - 100, cb - 10], [cx - 72, cb - 16], [cx - 60, cb - 36], [cx - 40, cb - 40], [cx - 40, cb]]), "#5a5458", { s: INK, w: 1.6 });
  s += P(`M${cx - 56},${cb - 6}V${cb - 22}A6,6 0 0 1 ${cx - 44},${cb - 22}V${cb - 6}Z`, "#e0a070", { s: INK, w: 1.2, op: 0.9 }) + P(`M${cx - 146},${cb - 6}V${cb - 20}A5,5 0 0 1 ${cx - 136},${cb - 20}V${cb - 6}Z`, "#e0a070", { s: INK, w: 1.2, op: 0.9 });
  s += R(cx - 40, cb - 140, 54, 140, shade("#6a6468", 0.12, 0.3), { s: INK, w: 1.8 });
  s += P(poly([[cx - 46, cb - 140], [cx - 13, cb - 176], [cx + 20, cb - 140]]), "#4a4448", { s: INK, w: 1.6 });
  s += P(`M${cx - 28},${cb - 92}V${cb - 120}A15,15 0 0 1 ${cx + 2},${cb - 120}V${cb - 92}Z`, "#e0a070", { s: INK, w: 1.4 });
  s += S(`M${cx - 26},${cb - 112}H${cx}M${cx - 13},${cb - 112}V${cb - 104}`, "#3a3034", 2);              // the bell frame, its smallest place empty
  // the long pier at dusk, with the arcade lights at the landward end (right)
  s += pier(560, 1150, 214, 250, { arcade: false, headAt: "x0" });
  s += C(1120, 180, 60, glow(K.lamp, 0.45)) + R(1090, 172, 95, 40, shade("#6a4a6e", 0.12, 0.3), { s: INK, w: 1.4 }) + P(`M1086,172Q1140,148 1190,172Z`, shade(K.violet, 0.12, 0.3), { s: INK, w: 1.4 });
  for (let i = 0; i < 8; i++) s += C(1094 + i * 12, 168, 1.6, i % 2 ? K.lamp : K.redHi);
  for (let i = 0; i < 4; i++) s += R(1098 + i * 21, 182, 12, 22, K.lamp, { s: INK, w: 0.8 });
  // the tide coming in, small waves
  let wv = "";
  for (let i = 0; i < 26; i++) { const R1 = rng(i + 200); const x = 520 + R1() * 660, y = hz + 50 + R1() * 110; wv += `M${r(x)},${r(y)}q6,-4 12,0q6,-4 12,0`; }
  s += S(wv, "#f0c8b8", 1.2, { op: 0.45 });
  return { vb: `0 0 ${W} ${H}`, title: "Dusk at low tide: the drowned church tower in the Saltmarsh mud, the choir faint in its nave, and the long pier", body: s };
});

// ---------------------------------------------------------------- spots (800×600, framed)
const SW = 800, SH = 600;
const spot = (body) => G(body, { clip: frameClip(SW, SH, 26) }) + frameRect(SW, SH, 26, { sw: 6, m: 11 });
/** A figure seated behind a table: only the part above the table's near edge is drawn. */
const seated = (fn, x, tableY, h, p, nearY = tableY + 12) => G(fig(fn, x, tableY - 0.36 * h + h, h, p), { clip: clip(R(0, 0, SW, nearY, "#000")) });
/** As seated(), but also returns the two hands on their own, to draw again on top of the table top. */
function seatedParts(fn, x, tableY, h, p, nearY = tableY + 12) {
  let hands = "";
  const fy = tableY - 0.36 * h + h;
  const p2 = { ...p, prop: (aL, aR) => { hands = aL.handSvg + aR.handSvg; return p.prop ? p.prop(aL, aR) : ""; } };
  const body = G(fig(fn, x, fy, h, p2), { clip: clip(R(0, 0, SW, nearY, "#000")) });
  return { body, hands: `<g transform="translate(${r(x)} ${r(fy)}) scale(${r(h / 100 * 1000) / 1000})">${hands}</g>` };
}

// ----- Spot (Chapter 1): the last bus of the night, Tess at the wheel
piece("spot-last-bus", () => {
  let s = sky(SW, SH, K.n0, K.n3, K.n1);
  s += stars(201, 20, 20, 780, 160, 40) + moon(640, 96, 26);
  s += terraceRow(-20, 820, 440, { seed: 202, hMin: 150, hMax: 210, wMin: 120, wMax: 170, litP: 0.5, sw: 1.6, rows: 3 });
  s += R(0, 0, SW, SH, lin([[0, K.fog, 0], [0.6, K.fog, 0.08], [1, K.fog, 0.16]]));
  s += R(0, 436, SW, 30, lin([[0, "#4a5068"], [1, "#3a4058"]]), { s: INK, w: 1.6 });                     // pavement
  s += R(0, 466, SW, 134, lin([[0, "#2a2f40"], [1, "#1c2030"]]), { s: INK, w: 1.6 });                     // road
  s += S(`M40,560H180M300,560H440M560,560H700`, "#d9d2bc", 4, { op: 0.6 });
  // the stop: a post on the pavement with a round sign showing a bus
  s += streetLamp(60, 452, 300, { sw: 2 }) + lampGlow(60, 190, 180, 0.4) + shadow(60, 452, 16, 3);
  s += R(737, 236, 7, 216, "#3a3e4a", { s: INK, w: 1.6 }) + shadow(740, 452, 12, 2.5);
  s += C(740, 230, 28, "#e9e3d4", { s: INK, w: 2 }) + C(740, 230, 22, "none", { s: K.red, w: 3 });
  s += R(726, 220, 28, 16, "#2f4f7f", { s: INK, w: 1, rx: 3 }) + C(731, 238, 3, INK) + C(749, 238, 3, INK);
  // the bus, its front to the left; lit windows, two passengers
  const bx = 90, by = 268, bw = 600, bh = 236;
  s += shadow(bx + bw / 2, 538, 320, 12, 0.5);
  s += P(sm([[bx, by + 30], [bx + 14, by, 1], [bx + bw, by, 1], [bx + bw, by + bh, 1], [bx, by + bh, 1]].map((q, i) => i === 0 ? q : q)), shade("#2f4f7f", 0.15, 0.3), { s: INK, w: 2.4 });
  s += R(bx, by + 150, bw, 24, "#e9e3d4", { s: INK, w: 1.6 });
  s += R(bx + 4, by + bh - 20, bw - 8, 16, "#24385c", { s: INK, w: 1.2 });
  // the destination display (blank amber glow, no words)
  s += R(bx + 20, by + 10, 140, 26, "#2a2420", { s: INK, w: 1.6, rx: 3 }) + R(bx + 26, by + 15, 128, 16, K.amber, { op: 0.85, rx: 2 });
  // passenger windows
  for (let i = 0; i < 5; i++) {
    const wx = bx + 190 + i * 80;
    s += R(wx, by + 48, 70, 88, lin([[0, K.glow], [1, K.gold]]), { s: INK, w: 1.8, rx: 4 });
  }
  for (const [px, col] of [[bx + 300, "#5a4a6a"], [bx + 465, "#3f5a4a"]]) s += C(px, by + 102, 13, col, { op: 0.75 }) + R(px - 18, by + 114, 36, 22, col, { op: 0.75, rx: 8 });
  // the door, and the driver's window, where Tess looks out at the stop
  s += R(bx + 108, by + 48, 70, 176, lin([[0, K.glow, 0.8], [1, K.gold, 0.6]]), { s: INK, w: 1.8, rx: 3 }) + S(`M${bx + 143},${by + 48}V${by + 224}`, INK, 1.6);
  const dw = clip(R(bx + 14, by + 48, 84, 102, "#000", { rx: 6 }));
  s += R(bx + 14, by + 48, 84, 102, lin([[0, "#3a4258"], [1, "#2a3044"]]), { rx: 6 });
  s += G(fig(tess, bx + 58, by + 278, 214, { look: 1, mouth: "smile" }), { clip: dw });
  s += R(bx + 14, by + 48, 84, 102, "#ffffff", { op: 0.06, rx: 6 }) + R(bx + 14, by + 48, 84, 102, "none", { s: INK, w: 2, rx: 6 });
  s += R(bx - 6, by + 196, 22, 16, K.glow, { s: INK, w: 1.4, rx: 4 }) + C(bx - 4, by + 204, 50, glow(K.lamp, 0.45));   // headlight
  s += R(bx + bw - 10, by + 186, 12, 24, K.red, { s: INK, w: 1.2, rx: 3 });                                // tail light
  // wheels, standing on the road
  for (const wx of [bx + 120, bx + bw - 120]) {
    s += P(`M${wx - 50},${by + bh}A50,50 0 0 1 ${wx + 50},${by + bh}Z`, "#141820", { s: INK, w: 1.6 });
    s += C(wx, 534 - 38, 38, "#1c1c22", { s: INK, w: 2 }) + C(wx, 534 - 38, 18, "#8a8f9c", { s: INK, w: 1.6 }) + C(wx, 534 - 38, 6, "#4a4f5c");
  }
  return { vb: `0 0 ${SW} ${SH}`, title: "The last bus of the night at a stop in the fog, Tess at the wheel", body: spot(s) };
});

// ----- Spot (Chapter 2): June searches the newspaper archive in the university library
piece("spot-archive", () => {
  const tY = 400;
  let s = R(0, 0, SW, SH, lin([[0, "#2e2430"], [1, "#3a2c30"]]));
  // panelled walls, two bookcases, a tall window onto University Hill at night
  s += R(310, 40, 180, 250, lin([[0, K.n1], [1, K.n3]]), { s: INK, w: 2 });
  s += G(terraceRow(306, 494, 290, { seed: 211, hMin: 40, hMax: 70, wMin: 30, wMax: 44, litP: 0.5 }) + stars(212, 316, 46, 484, 140, 14) + moon(440, 90, 14), { clip: clip(R(310, 40, 180, 250, "#000")) });
  s += S(`M400,40V290M310,165H490`, "#5a4030", 6) + R(310, 40, 180, 250, "none", { s: "#5a4030", w: 10 }) + R(303, 33, 194, 264, "none", { s: INK, w: 2 });
  for (const bx of [30, 560]) {
    s += R(bx, 30, 210, 380, shade(K.woodD, 0.1, 0.3), { s: INK, w: 2 });
    for (let i = 0; i < 5; i++) {
      const y = 40 + i * 72;
      s += R(bx + 8, y + 64, 194, 7, K.wood, { s: INK, w: 1.2 });
      const R0 = rng(bx + i);
      for (let x = bx + 12; x < bx + 196;) { const w = 10 + R0() * 12, h = 40 + R0() * 18; if (x + w > bx + 200) break; s += R(x, y + 64 - h, w, h, ["#5a3248", "#3f5a4a", "#6a4a2a", "#2f4f7f", "#7a2a2a", "#8a7a5a"][Math.floor(R0() * 6)], { s: INK, w: 1 }); x += w + 1.5; }
    }
  }
  // June, seated at the reading table (only her upper half shows above it)
  const jn = seatedParts(june, 400, tY, 380, { look: 0.4, notebook: false, left: [9, -64], right: [-9, -64], mouth: "o" });
  s += jn.body;
  // the table top, seen from just above, and its front
  s += P(poly([[40, tY + 4], [760, tY + 4], [790, tY + 40], [10, tY + 40]]), lin([[0, "#8a6040"], [1, "#a07450"]]), { s: INK, w: 2 });
  s += R(10, tY + 40, 780, 24, shade(K.woodD, 0.1, 0.3), { s: INK, w: 2 });
  for (const lx of [40, 740]) s += R(lx, tY + 64, 24, SH - tY - 64, shade(K.woodD, 0.1, 0.3), { s: INK, w: 2 });
  // on the table: the bound newspaper volume open in front of her, a green-shaded reading lamp, a pile of books, her notebook
  s += `<g transform="translate(400 ${tY + 22}) scale(1 0.32)">${openBook(0, 0, 330, { cover: "#3a2a24", seed: 21, drawing: null })}</g>`;
  s += shadow(600, tY + 26, 50, 6, 0.4) + E(600, tY + 24, 40, 7, shade("#2a2a30", 0.3, 0.2), { s: INK, w: 1.6 });
  s += R(596, tY - 72, 8, 96, "#c29a45", { s: INK, w: 1.4 });
  s += P(`M540,${tY - 80}Q600,${tY - 112} 660,${tY - 80}L650,${tY - 70}L550,${tY - 70}Z`, shade(K.green, 0.25, 0.3), { s: INK, w: 1.8 });
  s += C(600, tY - 30, 140, glow(K.lamp, 0.4)) + E(600, tY - 70, 48, 4, K.glow, { s: INK, w: 1 });
  s += shadow(170, tY + 28, 66, 6, 0.4);
  for (const [y, w, col] of [[tY + 26, 120, "#5a3248"], [tY + 8, 110, "#2f4f7f"], [tY - 10, 116, "#6a4a2a"]]) s += R(170 - w / 2, y - 18, w, 18, shade(col, 0.15, 0.3), { s: INK, w: 1.6, rx: 2 }) + R(170 - w / 2 + 4, y - 15, w - 8, 3, "#e8dcc4", { op: 0.7 });
  s += P(poly([[660, tY + 34], [730, tY + 34], [744, tY + 18], [674, tY + 18]]), "#b8463a", { s: INK, w: 1.4 });
  s += jn.hands;
  return { vb: `0 0 ${SW} ${SH}`, title: "June reads old newspapers by a green-shaded lamp in the university library", body: spot(s) };
});

// ----- Spot (Chapter 3): Marco's other life, the garage
piece("spot-garage", () => {
  const fl = 548;
  let s = R(0, 0, SW, SH, lin([[0, "#2a2a34"], [1, "#363440"]]));
  s += R(0, 0, SW, fl, shade("#4a3a38", 0.06, 0.3)) + brickLines(0, 0, SW, fl, 18, INK, 0.18, 1);
  // pegboard with tools hung on its pegs
  s += R(40, 70, 260, 170, "#8a7a5a", { s: INK, w: 2 });
  let holes = "";
  for (let y = 84; y < 236; y += 14) for (let x = 54; x < 296; x += 14) holes += `M${x},${y}h0.01`;
  s += S(holes, "#5a4a32", 2.4);
  const peg = (x, y) => C(x, y, 2.6, "#c9ccd4", { s: INK, w: 1 });
  s += peg(82, 98) + S(`M82,98L82,190`, INK, 9) + S(`M82,98L82,190`, "#a8b0b8", 6) + C(82, 104, 10, "none", { s: INK, w: 8 }) + C(82, 104, 10, "none", { s: "#a8b0b8", w: 5 });
  s += peg(138, 98) + R(134, 100, 8, 70, "#7a4a2a", { s: INK, w: 1.4 }) + R(124, 168, 28, 16, "#8a8f9c", { s: INK, w: 1.6 });
  s += peg(194, 98) + R(190, 100, 8, 52, "#b5473f", { s: INK, w: 1.4, rx: 3 }) + R(192, 152, 4, 40, "#c9ccd4", { s: INK, w: 1 });
  s += peg(250, 98) + P(`M250,100L240,190L246,192L250,130L254,192L260,190Z`, "#8a8f9c", { s: INK, w: 1.4 });
  // a tyre leaning on the wall (on the floor), a toolbox on the floor
  s += shadow(100, fl, 60, 6) + E(100, fl - 60, 30, 60, "#1c1c22", { s: INK, w: 2 }) + E(104, fl - 60, 14, 34, "#3a3a44", { s: INK, w: 1.6 });
  s += shadow(170, fl, 50, 5) + R(130, fl - 54, 84, 54, shade(K.red, 0.15, 0.3), { s: INK, w: 2, rx: 3 }) + R(126, fl - 62, 92, 12, dk(K.red, 0.1), { s: INK, w: 1.6, rx: 3 }) + R(158, fl - 72, 28, 10, "none", { s: INK, w: 3 });
  // the floor
  s += R(0, fl, SW, SH - fl, lin([[0, "#5a5a62"], [1, "#3a3a44"]]), { s: INK, w: 2 });
  s += E(600, fl + 20, 70, 8, "#1a1a20", { op: 0.4 });                                                     // an oil patch
  // the van, nose to the left, the rest running out of the frame; bonnet propped open on its stay
  const vx = 420;
  s += shadow(640, fl, 260, 10, 0.5);
  s += P(poly([[vx, fl - 70], [vx, fl - 170], [vx + 120, fl - 190], [vx + 190, fl - 330], [SW + 10, fl - 340], [SW + 10, fl - 70]]), shade("#d9d2bc", 0.1, 0.3), { s: INK, w: 2.4 });
  s += P(poly([[vx + 132, fl - 196], [vx + 194, fl - 318], [vx + 300, fl - 320], [vx + 300, fl - 200]]), lin([[0, "#5a6a80"], [1, "#2a3448"]]), { s: INK, w: 2 });
  s += S(`M${vx + 310},${fl - 320}V${fl - 80}`, INK, 2) + R(vx + 330, fl - 200, 30, 8, "#3a3a44", { s: INK, w: 1.2, rx: 3 });
  s += R(vx - 6, fl - 100, 40, 30, "#8a8f9c", { s: INK, w: 1.6, rx: 4 }) + R(vx + 2, fl - 160, 26, 20, K.glow, { s: INK, w: 1.4, rx: 4 });
  // the engine bay, the bonnet raised on its rear hinge, held by the stay rod; a work lamp hung from the bonnet's front edge
  s += P(poly([[vx + 4, fl - 166], [vx + 118, fl - 186], [vx + 118, fl - 150], [vx + 4, fl - 140]]), "#1a1a20", { s: INK, w: 1.6 });
  const hinge = [vx + 122, fl - 190], tipB = [vx + 30, fl - 300];
  s += P(poly([hinge, tipB, [tipB[0] - 4, tipB[1] + 12], [hinge[0] - 2, hinge[1] + 10]]), shade("#d9d2bc", 0.1, 0.3), { s: INK, w: 2 });
  s += S(`M${vx + 14},${fl - 160}L${vx + 50},${fl - 264}`, INK, 4) + S(`M${vx + 14},${fl - 160}L${vx + 50},${fl - 264}`, "#c9ccd4", 2);
  s += C(tipB[0] + 4, tipB[1] + 10, 3, "none", { s: INK, w: 2 });
  s += S(`M${tipB[0] + 4},${tipB[1] + 13}V${fl - 200}`, INK, 1.8);
  s += P(`M${tipB[0] - 6},${fl - 200}L${tipB[0] + 14},${fl - 200}L${tipB[0] + 10},${fl - 176}L${tipB[0] - 2},${fl - 176}Z`, lin([[0, "#fff6d8"], [1, K.gold]]), { s: INK, w: 1.4 });
  s += C(tipB[0] + 4, fl - 186, 70, glow(K.lamp, 0.5));
  // wheels on the floor
  for (const wx of [vx + 120, 760]) s += P(`M${wx - 62},${fl - 70}A62,62 0 0 1 ${wx + 62},${fl - 70}Z`, "#1a1a20", { s: INK, w: 1.6 }) + C(wx, fl - 52, 52, "#1c1c22", { s: INK, w: 2 }) + C(wx, fl - 52, 24, "#8a8f9c", { s: INK, w: 1.6 });
  // Marco, wrench in his right hand, the scar on his right forearm
  s += shadow(270, fl, 40, 6, 0.5);
  s += fig(marco, 270, fl, 400, {
    look: 0.6, mouth: "grin", right: [-13, -47], left: [16, -52],
    prop: (aL, aR) => { const [x, y] = aR.wrist; return S(`M${r(x + 1)},${r(y + 2)}L${r(x - 1)},${r(y + 16)}`, INK, 3.4) + S(`M${r(x + 1)},${r(y + 2)}L${r(x - 1)},${r(y + 16)}`, "#a8b0b8", 2.2) + C(x - 1.4, y + 17.6, 2.6, "none", { s: INK, w: 2.4 }) + C(x - 1.4, y + 17.6, 2.6, "none", { s: "#a8b0b8", w: 1.4 }) + aR.handSvg; },
  });
  return { vb: `0 0 ${SW} ${SH}`, title: "Marco at the garage at night, wrench in hand, a van's bonnet propped open beside him", body: spot(s) };
});

// ----- Spot (Chapter 4): Rook on the Lantern House chimney
piece("spot-rook-chimney", () => {
  let s = sky(SW, SH, K.n0, K.n3, K.n1);
  s += stars(241, 20, 16, 780, 300, 70, (x, y) => Math.hypot(x - 600, y - 140) < 90);
  s += moon(600, 140, 66);
  // Old Town roofs and the harbour below
  s += R(0, 420, SW, 180, "#1a2236");
  s += water(0, 440, SW, 470, { refl: [[600, 30, "#f3e9cc", 0.4], [200, 14]], ripples: 14, top: "#22305a" });
  s += terraceRow(-20, 820, 520, { seed: 242, hMin: 60, hMax: 90, wMin: 50, wMax: 80, litP: 0.5, sw: 1.4 });
  // the roof slope of the Lantern House, its dormer and round window glowing
  s += P(poly([[0, 600], [0, 520], [800, 470], [800, 600]]), shade(K.slateRoof, 0.12, 0.3), { s: INK, w: 2 });
  let sl = "";
  for (let i = 0; i < 6; i++) sl += `M0,${540 + i * 14}L800,${490 + i * 14}`;
  s += S(sl, "#262a36", 1.2, { op: 0.6 });
  s += C(110, 560, 60, glow(K.lamp, 0.4)) + C(110, 560, 26, lin([[0, K.glow], [1, K.amber]]), { s: INK, w: 2 }) + C(110, 560, 26, "none", { s: "#5a4a3a", w: 4 }) + S(`M110,534V586M84,560H136`, INK, 1.4);
  // the chimney stack: brick, a stone cap and two clay pots; a thin thread of smoke from one
  s += R(260, 380, 300, 160, shade("#6a4a40", 0.1, 0.3), { s: INK, w: 2.4 }) + brickLines(260, 380, 300, 160, 14, INK, 0.2, 1);
  s += R(244, 366, 332, 20, K.stone, { s: INK, w: 2 });
  for (const [x, top] of [[330, 232], [490, 262]]) {
    s += P(poly([[x - 52, 366], [x - 44, top + 12], [x + 44, top + 12], [x + 52, 366]]), shade("#a2603e", 0.15, 0.3), { s: INK, w: 2.2 });
    s += R(x - 50, top, 100, 14, "#b06a46", { s: INK, w: 2, rx: 3 }) + E(x, top + 2, 42, 5, "#3a2218", { s: INK, w: 1 });
  }
  for (const [x, y, rr, op] of [[492, 236, 10, 0.3], [500, 206, 14, 0.24], [490, 170, 18, 0.18], [506, 130, 22, 0.12]]) s += C(x, y, rr, "#8a8f9c", { op });
  // Rook in rook shape, standing on the rim of the left pot, looking out over the city
  s += rookBird(330, 232, 150, -1, { sw: 2.4 });
  return { vb: `0 0 ${SW} ${SH}`, title: "Rook, a large black rook, on the chimney of the Lantern House under the moon", body: spot(s) };
});

// ----- Spot (Chapter 5): Noor brewing at the old range in the Lantern House kitchen
piece("spot-brewing", () => {
  const fl = 560;
  let s = R(0, 0, SW, SH, lin([[0, "#3a2c28"], [1, "#4a3830"]]));
  s += R(0, 300, SW, fl - 300, "#d9cdb6", { op: 0.12 });
  let tiles = "";
  for (let y = 300; y < fl; y += 26) tiles += `M0,${y}H${SW}`;
  for (let x = 0; x < SW; x += 26) tiles += `M${x},300V${fl}`;
  s += S(tiles, "#2a201c", 1, { op: 0.4 });
  // the window onto the walled garden at night
  s += R(40, 60, 170, 170, lin([[0, K.n1], [1, "#2a3a3a"]]), { s: INK, w: 2 }) + G(stars(251, 46, 66, 204, 130, 12) + R(40, 170, 170, 60, "#4a3a34") + C(160, 150, 40, "#2e4a2a", { s: INK, w: 1.4 }), { clip: clip(R(40, 60, 170, 170, "#000")) });
  s += S(`M125,60V230M40,145H210`, "#5a4030", 6) + R(40, 60, 170, 170, "none", { s: "#5a4030", w: 9 }) + R(34, 54, 182, 182, "none", { s: INK, w: 2 }) + R(30, 230, 190, 10, K.stone, { s: INK, w: 1.6 });
  // shelves of jars (labels are squiggles), on brackets
  for (const y of [120, 210]) {
    s += R(560, y, 210, 8, K.woodD, { s: INK, w: 1.6 });
    for (const bx of [574, 750]) s += P(`M${bx},${y + 8}V${y + 30}L${bx + 4},${y + 30}Q${bx + 4},${y + 14} ${bx + 16},${y + 8}Z`, "#2d3038", { s: INK, w: 1 });
    const R0 = rng(y);
    for (let x = 572; x < 760; x += 34) { const h = 34 + R0() * 22, col = ["#c97a2e", "#7a8a5a", "#b9a27a", "#6a4a3a"][Math.floor(R0() * 4)]; s += R(x, y - h, 26, h, lin([[0, lt(col, 0.3)], [1, col]]), { s: INK, w: 1.4, rx: 3 }) + R(x - 1, y - h - 6, 28, 7, K.woodL, { s: INK, w: 1, rx: 2 }) + R(x + 4, y - h * 0.6, 18, 10, K.paper, { s: INK, w: 0.8 }) + S(`M${x + 7},${r(y - h * 0.6 + 5)}h12`, "#6a5a4a", 1); }
  }
  s += bottle(600, 300, 50, "heal") + bottle(660, 300, 56, "blast") + bottle(720, 300, 50, "bind");
  s += R(570, 300, 200, 8, K.woodD, { s: INK, w: 1.6 });
  // a beam over the range with herbs hung from hooks by their strings
  s += R(220, 40, 340, 18, shade(K.woodD, 0.1, 0.3), { s: INK, w: 2 });
  for (const [x, col] of [[260, "#6a8a4a"], [330, "#8a7a4a"], [400, "#5a7a5a"], [470, "#9a6a4a"]]) {
    s += P(`M${x},58V66`, "none", { s: "#2d3038", w: 2.4 }) + P(`M${x - 4},70Q${x - 4},64 ${x},64Q${x + 4},64 ${x + 4},68`, "none", { s: "#2d3038", w: 2 });
    s += S(`M${x},70V92`, "#c9b98a", 1.6) + P(sm([[x - 4, 92, 1], [x + 4, 92, 1], [x + 16, 140], [x, 150], [x - 16, 140]]), shade(col, 0.2, 0.3), { s: INK, w: 1.4 }) + S(`M${x - 6},94H${x + 6}`, "#c9b98a", 3);
  }
  // the range: black iron, two ovens, the hob; a pot on it, steam rising
  s += shadow(330, fl, 200, 8, 0.5);
  s += R(160, 340, 340, fl - 340, shade("#2a2a30", 0.15, 0.3), { s: INK, w: 2.4 });
  s += R(150, 326, 360, 18, "#3a3a44", { s: INK, w: 2 });
  for (const ox of [180, 340]) s += R(ox, 380, 130, 120, "#1e1e24", { s: INK, w: 2 }) + R(ox + 50, 392, 30, 6, K.brass, { s: INK, w: 1 }) + R(ox + 12, 430, 106, 54, "#2a2a30", { s: INK, w: 1.4 });
  s += C(330, 326, 60, glow(K.fire, 0.3));
  s += P(poly([[260, 326], [264, 250], [396, 250], [400, 326]]), shade("#6a4a3a", 0.2, 0.35), { s: INK, w: 2.4 }) + E(330, 250, 68, 10, "#2a1e18", { s: INK, w: 2 }) + E(330, 252, 60, 7, "#5aa070", { op: 0.9 });
  s += S(`M256,276h-18v14h18M404,276h18v14h-18`, INK, 3);
  for (const [x, y, rr, op] of [[310, 226, 14, 0.35], [340, 206, 18, 0.3], [318, 176, 22, 0.24], [348, 140, 26, 0.18], [326, 100, 28, 0.12]]) s += C(x, y, rr, "#e8e4dc", { op });
  s += R(0, fl, SW, SH - fl, lin([[0, "#5a4434"], [1, "#3a2c22"]]), { s: INK, w: 2 });
  // Noor stirs the pot with a long wooden spoon (its bowl in the brew) and holds a bundle of herbs
  s += shadow(500, fl, 34, 6, 0.5);
  s += fig(noor, 500, fl, 360, {
    look: -1.6, mouth: "smile", right: [-26, -92], left: [14, -60],
    under: (aL, aR) => { const [x, y] = aR.wrist, ex = (322 - 500) / 3.6, ey = (251 - 560) / 3.6; return S(`M${r(x + 2)},${r(y - 3)}L${r(ex)},${r(ey)}`, INK, 3.4) + S(`M${r(x + 2)},${r(y - 3)}L${r(ex)},${r(ey)}`, K.woodL, 2) + E(ex, ey + 0.3, 3, 0.8, "#4a8a5a"); },
    prop: (aL) => { const [x, y] = aL.wrist; return P(sm([[x + 1, y - 2, 1], [x + 4, y - 2, 1], [x + 10, y - 16], [x + 3, y - 20], [x - 4, y - 14]]), shade("#6a8a4a", 0.2, 0.3), { s: INK, w: 0.5 }) + S(`M${r(x + 2.5)},${r(y - 2)}V${r(y + 4)}`, "#c9b98a", 0.8) + aL.handSvg; },
  });
  return { vb: `0 0 ${SW} ${SH}`, title: "Noor brews a potion at the old range in the Lantern House kitchen, herbs hanging overhead", body: spot(s) };
});

// ----- Spot (Chapter 8): Quinn on a date, at a café window table
piece("spot-cafe", () => {
  const tY = 400;
  let s = R(0, 0, SW, SH, lin([[0, "#3a2a2a"], [1, "#4a3430"]]));
  // the big window onto the wet street, rain on the glass
  s += R(60, 40, 680, 300, lin([[0, K.n1], [1, K.n3]]), { s: INK, w: 2 });
  s += G(terraceRow(50, 760, 340, { seed: 261, hMin: 110, hMax: 160, wMin: 90, wMax: 130, litP: 0.5, sw: 1.4 }) + streetLamp(620, 340, 200, { sw: 1.6 }) + lampGlow(620, 160, 120, 0.4), { clip: clip(R(60, 40, 680, 300, "#000")) });
  const R0 = rng(262);
  let rain = "";
  for (let i = 0; i < 70; i++) { const x = 66 + R0() * 668, y = 46 + R0() * 280; rain += `M${r(x)},${r(y)}l-2,${r(8 + R0() * 10)}`; }
  s += S(rain, "#cfe0f0", 1.2, { op: 0.4 });
  s += S(`M400,40V340`, "#5a4030", 7) + R(60, 40, 680, 300, "none", { s: "#5a4030", w: 10 }) + R(53, 33, 694, 314, "none", { s: INK, w: 2 }) + R(46, 340, 708, 14, K.woodD, { s: INK, w: 1.6 });
  // the pendant lamp on its cord
  s += S(`M400,0V60`, INK, 2) + P(`M366,90Q400,50 434,90Z`, shade(K.brass, 0.25, 0.3), { s: INK, w: 2 }) + E(400, 90, 34, 5, K.glow, { s: INK, w: 1 }) + C(400, 200, 260, glow(K.lamp, 0.3));
  // chair backs, then the two of them, seated
  for (const x of [190, 610]) s += R(x - 50, tY - 150, 100, 150, shade(K.woodD, 0.15, 0.3), { s: INK, w: 2, rx: 8 }) + R(x - 38, tY - 138, 76, 70, "#000", { op: 0.15, rx: 6 });
  const qn = seatedParts(quinn, 220, tY, 380, { look: 1.4, mouth: "grin", left: [12, -65], right: [-9, -66] });
  const dt = seatedParts(civ({ skin: "#9a6a48", hair: "#1e1612", style: "short", top: "#8a5a3a", coat: "#6a4a3a", coatLen: -40, glasses: true, mouth: "smile" }), 580, tY, 370, { look: -1.4, left: [9, -66], right: [-12, -65] });
  s += qn.body + dt.body;
  // the round table with a checked cloth to the floor
  s += E(400, tY + 10, 230, 22, lin([[0, "#efe6d2"], [1, "#d9cdb6"]]), { s: INK, w: 2 });
  s += P(`M170,${tY + 10}Q166,520 150,${SH + 4}L650,${SH + 4}Q634,520 630,${tY + 10}Q400,${tY + 50} 170,${tY + 10}Z`, shade("#b5473f", 0.12, 0.3), { s: INK, w: 2 });
  let chk = "";
  for (let x = 190; x < 640; x += 30) chk += `M${x},${tY + 24}L${x - (x - 400) * 0.12},${SH}`;
  for (let y = tY + 50; y < SH; y += 30) chk += `M${r(170 - (y - tY) * 0.08)},${y}H${r(630 + (y - tY) * 0.08)}`;
  s += S(chk, "#efe6d2", 6, { op: 0.35 });
  // on the table: two mugs, a slice of cake on its plate with a fork, a candle in a jar
  for (const [x, col] of [[300, K.violet], [510, K.green]]) s += shadow(x, tY + 14, 22, 3.6, 0.35) + R(x - 18, tY - 28, 36, 40, shade(col, 0.2, 0.3), { s: INK, w: 1.8, rx: 4 }) + E(x, tY - 28, 18, 4, "#5a3e2c", { s: INK, w: 1.4 }) + P(`M${x + 18},${tY - 20}q14,2 12,12q-2,8 -12,8`, "none", { s: INK, w: 3.4 });
  s += E(410, tY + 10, 46, 9, "#f4f2ec", { s: INK, w: 1.6 }) + P(poly([[388, tY + 6], [432, tY + 2], [428, tY - 18], [392, tY - 20]]), "#f2d9a0", { s: INK, w: 1.4 }) + P(poly([[392, tY - 20], [428, tY - 18], [430, tY - 26], [396, tY - 28]]), "#7a4a3a", { s: INK, w: 1.2 }) + C(412, tY - 30, 5, K.red, { s: INK, w: 1 });
  s += S(`M436,${tY + 12}L462,${tY + 8}`, "#c9ccd4", 2.4);
  s += shadow(360, tY + 12, 12, 2.4, 0.35) + R(350, tY - 12, 20, 22, "#dfe9ee", { s: INK, w: 1.4, fop: 0.6, rx: 3 }) + candle(360, tY + 8, 14, { sw: 1 });
  s += qn.hands + dt.hands;
  return { vb: `0 0 ${SW} ${SH}`, title: "Quinn laughs on a date at a café window table, rain on the glass", body: spot(s) };
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
