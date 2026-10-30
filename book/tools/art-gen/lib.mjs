// Shared drawing primitives for the Witch & Ward book art.
// Palette-agnostic: every colour comes from C, which mirrors the PLACEHOLDER
// tokens at the top of book/src/book.css. Art direction is undecided — when the
// palette is chosen, change C (and book.css, and book/art/README.md) together.
// Nothing in here draws a particular character, creature or place; build those
// in their own modules on top of these primitives (see scenes/placeholders.mjs).
import { writeFileSync } from "node:fs";

export const OUT = new URL("../../art/", import.meta.url).pathname; // book/art/

/** PLACEHOLDER palette — keep in step with book/src/book.css :root tokens. */
export const C = {
  dark: "#3a3a3c", deep: "#222224", soft: "#5c5c60",
  paper: "#f2f1ee", paper2: "#e3e1dc", edge: "#c9c6bf", light: "#faf9f6",
  ink: "#161618", inkSoft: "#5a5a5e",
  accent: "#7a7f88", accentDeep: "#555a63", accentB: "#e4e6ea",
  alarm: "#7c2a2a", alarmB: "#b5473f", good: "#3f6f52",
};

// Unique ids per piece (clipPaths, gradients) — the book build also namespaces them.
let PFX = "x", N = 0;
export const setPrefix = p => { PFX = p; N = 0; };
export const uid = s => `${PFX}-${s}${N++}`;
export const r1 = v => Math.round(v * 10) / 10;
export const pt = p => `${r1(p[0])} ${r1(p[1])}`;
export const poly = pts => "M" + pts.map(pt).join(" L");

/** Seeded PRNG (mulberry32): the same seed always draws the same piece. */
export function rng(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Write book/art/<name>.svg: viewBox only (never a fixed width/height — the CSS sizes it), with a <title>. */
export function save(name, vb, title, body) {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-labelledby="${name}-title">\n` +
    `<title id="${name}-title">${title}</title>\n${body}\n</svg>\n`;
  writeFileSync(OUT + name + ".svg", s);
}

// ---------- primitives ----------
export const circ = (x, y, r, fill, st = C.ink, sw = 0, extra = "") =>
  `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${fill}"${sw ? ` stroke="${st}" stroke-width="${sw}"` : ""}${extra}/>`;
export const ell = (x, y, rx, ry, fill, st = C.ink, sw = 0, extra = "") =>
  `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="${r1(rx)}" ry="${r1(ry)}" fill="${fill}"${sw ? ` stroke="${st}" stroke-width="${sw}"` : ""}${extra}/>`;
export const path = (d, fill = "none", st = C.ink, sw = 3, extra = "") =>
  `<path d="${d}" fill="${fill}"${sw ? ` stroke="${st}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"` : ""}${extra}/>`;
export const line = (a, b, st = C.ink, sw = 2, extra = "") =>
  `<path d="M${pt(a)} L${pt(b)}" stroke="${st}" stroke-width="${sw}" stroke-linecap="round"${extra}/>`;

// Motion / speed lines: list of [x1,y1,x2,y2]
export const strokes = (list, st = C.ink, sw = 3, extra = "") =>
  list.map(([a, b, c, d]) => line([a, b], [c, d], st, sw, extra)).join("");

// Pseudo-random stipple inside an ellipse band (dotted shading).
function inEll(x, y, cx, cy, rx, ry) { return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; }

// Ellipse with crescent shadow (lower right), stipple along the terminator, and highlight.
export function shaded(cx, cy, rx, ry, o = {}) {
  const { col = C.dark, shade = C.deep, hi = C.soft, sw = 4, rot = 0, seed = 7, pattern = "", dots = 1, fuzz = 0, light = [-0.16, -0.18] } = o;
  const k = uid("c");
  const lx = cx + rx * light[0], ly = cy + ry * light[1];
  let s = `<g transform="rotate(${rot} ${r1(cx)} ${r1(cy)})">`;
  s += `<clipPath id="${k}">${ell(cx, cy, rx, ry, "#000")}</clipPath>`;
  s += ell(cx, cy, rx, ry, shade);
  s += `<g clip-path="url(#${k})">`;
  s += ell(lx, ly, rx * 1.02, ry * 1.02, col);
  // stipple
  const R = rng(seed); let dd = "";
  const n = Math.round(rx * ry * 0.09 * dots);
  for (let i = 0; i < n; i++) {
    const x = cx + (R() * 2 - 1) * rx, y = cy + (R() * 2 - 1) * ry;
    if (inEll(x, y, cx, cy, rx, ry) > 1) continue;
    const q = inEll(x, y, lx, ly, rx * 1.02, ry * 1.02);
    if (q > 1 || q < 0.55) continue;
    if ((x - lx) * 1 + (y - ly) * 1.1 < 0) continue;
    if (R() < (q - 0.55) / 0.45) dd += `M${r1(x)} ${r1(y)}h0`;
  }
  if (dd) s += `<path d="${dd}" stroke="${shade}" stroke-width="${r1(Math.max(1.8, rx / 26))}" stroke-linecap="round"/>`;
  s += pattern;
  if (hi) s += ell(cx - rx * 0.36, cy - ry * 0.46, rx * 0.3, ry * 0.16, hi, C.ink, 0, ` transform="rotate(-24 ${r1(cx - rx * 0.36)} ${r1(cy - ry * 0.46)})" opacity="0.9"`);
  s += `</g>`;
  if (fuzz) s += hairRing(cx, cy, rx, ry, fuzz, seed + 3);
  s += ell(cx, cy, rx, ry, "none", C.ink, sw);
  s += `</g>`;
  return s;
}

// Little hair ticks around an ellipse outline.
export function hairRing(cx, cy, rx, ry, n = 30, seed = 1, len = 5, sw = 1.8) {
  const R = rng(seed); let d = "";
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2 + R() * 0.1;
    const x = cx + Math.cos(t) * rx, y = cy + Math.sin(t) * ry;
    const nx = Math.cos(t) * ry, ny = Math.sin(t) * rx, m = Math.hypot(nx, ny);
    const L = len * (0.6 + R() * 0.7);
    const bx = x + (nx / m) * L - (ny / m) * L * 0.35, by = y + (ny / m) * L + (nx / m) * L * 0.35;
    d += `M${r1(x - nx / m)} ${r1(y - ny / m)} L${r1(bx)} ${r1(by)}`;
  }
  return `<path d="${d}" stroke="${C.ink}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>`;
}

// ---------- frames ----------
// Round cameo: light disc with a double ring. Returns {bg, clip, ring}
export function cameo(cx = 200, cy = 200, r = 178) {
  const k = uid("cam");
  const bg = `<clipPath id="${k}">${circ(cx, cy, r, "#000")}</clipPath>` +
    circ(cx, cy, r + 8, C.paper, C.edge, 3) +
    circ(cx, cy, r, C.paper2, C.edge, 2.5);
  const ring = circ(cx, cy, r, "none", C.ink, 3) + circ(cx, cy, r + 8, "none", C.accent, 1.6, ` stroke-dasharray="1.5 7" stroke-linecap="round"`);
  return { bg, clip: `url(#${k})`, ring };
}

// Oval cameo. Returns {bg, clip, ring}
export function oval(cx = 240, cy = 202, rx = 224, ry = 184) {
  const k = uid("ov");
  const bg = `<clipPath id="${k}">${ell(cx, cy, rx, ry, "#000")}</clipPath>` +
    ell(cx, cy, rx + 8, ry + 8, C.paper, C.edge, 3) + ell(cx, cy, rx, ry, C.paper2, C.edge, 2.5);
  const ring = ell(cx, cy, rx, ry, "none", C.ink, 3) + ell(cx, cy, rx + 8, ry + 8, "none", C.accent, 1.6, ` stroke-dasharray="1.5 7" stroke-linecap="round"`);
  return { bg, clip: `url(#${k})`, ring };
}

// Scalloped seal: wavy rim + beaded ring + light field (a badge frame, 400×400). Returns {bg, clip, ring}
export function medallion(field = C.paper2) {
  const cx = 200, cy = 200, R = 192, n = 28;
  let d = "";
  for (let i = 0; i <= n; i++) {
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2, a1 = ((i + 0.5) / n) * Math.PI * 2 - Math.PI / 2, a2 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2;
    if (i === 0) d += `M${r1(cx + Math.cos(a0) * (R - 7))} ${r1(cy + Math.sin(a0) * (R - 7))}`;
    if (i < n) d += ` Q${r1(cx + Math.cos(a1) * (R + 5))} ${r1(cy + Math.sin(a1) * (R + 5))} ${r1(cx + Math.cos(a2) * (R - 7))} ${r1(cy + Math.sin(a2) * (R - 7))}`;
  }
  d += "Z";
  const k = uid("med");
  let bg = path(d, C.dark, C.ink, 4);
  // sheen
  bg += path(`M${cx - 150} ${cy - 70} A 165 165 0 0 1 ${cx - 40} ${cy - 160}`, "none", C.soft, 7, ` opacity="0.8"`);
  bg += path(`M${cx + 150} ${cy + 80} A 165 165 0 0 1 ${cx + 60} ${cy + 158}`, "none", C.deep, 7);
  bg += circ(cx, cy, 160, C.accent, C.ink, 3);
  let beads = "";
  for (let i = 0; i < 40; i++) { const a = (i / 40) * Math.PI * 2; beads += circ(cx + Math.cos(a) * 160, cy + Math.sin(a) * 160, 2.6, C.accentB); }
  bg += beads;
  bg += `<clipPath id="${k}">${circ(cx, cy, 148, "#000")}</clipPath>`;
  bg += circ(cx, cy, 148, field, C.ink, 3);
  const ring = circ(cx, cy, 148, "none", C.ink, 3.5);
  return { bg, clip: `url(#${k})`, ring };
}

// Soft ground (contact) shadow — every object that rests on something gets one (ART-CHECKLIST §2).
export const shadow = (x, y, rx, ry, col = C.edge, op = 0.9) => ell(x, y, rx, ry, col, C.ink, 0, ` opacity="${op}"`);

// Sparkle / star
export function star(x, y, r, fill = C.accentB, sw = 2) {
  let d = "";
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.38 : r; d += (i ? "L" : "M") + r1(x + Math.cos(a) * rr) + " " + r1(y + Math.sin(a) * rr); }
  return path(d + "Z", fill, C.ink, sw);
}

// A jointed limb from root to end point with the two middle joints bulging to the left of the
// travel direction (negative bulge bends the other way). Returns [root, joint1, joint2, end].
export function arch(root, foot, bulge = 30, kt = 0.38, at = 0.74, ab = 0.5) {
  const dx = foot[0] - root[0], dy = foot[1] - root[1], L = Math.hypot(dx, dy);
  const nx = dy / L, ny = -dx / L;
  return [root, [root[0] + dx * kt + nx * bulge, root[1] + dy * kt + ny * bulge],
    [root[0] + dx * at + nx * bulge * ab, root[1] + dy * at + ny * bulge * ab], foot];
}
// World point -> local coords of a figure placed with {x, y, s, rot, flip}.
export function toLocal({ x = 0, y = 0, s = 1, rot = 0, flip = false }, [wx, wy]) {
  const dx = (wx - x) / s, dy = (wy - y) / s, a = -rot * Math.PI / 180;
  let lx = dx * Math.cos(a) - dy * Math.sin(a); const ly = dx * Math.sin(a) + dy * Math.cos(a);
  if (flip) lx = -lx;
  return [lx, ly];
}
// Local figure coords -> world point.
export function toWorld({ x = 0, y = 0, s = 1, rot = 0, flip = false }, [lx, ly]) {
  const a = rot * Math.PI / 180, px = (flip ? -lx : lx) * s, py = ly * s;
  return [x + px * Math.cos(a) - py * Math.sin(a), y + px * Math.sin(a) + py * Math.cos(a)];
}

// polar helper
export const pol = (cx, cy, r, deg) => [cx + Math.cos(deg * Math.PI / 180) * r, cy + Math.sin(deg * Math.PI / 180) * r];

// Fur / grass ticks along an arbitrary polyline (list of points), on one side.
export function furTicks(pts, len = 7, every = 12, side = 1, st = C.ink, sw = 2, seed = 1) {
  const R = rng(seed); let d = "";
  for (let i = 0; i < pts.length - 1; i++) {
    const [a, b] = [pts[i], pts[i + 1]];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), n = Math.max(1, Math.floor(L / every));
    const nx = (-dy / L) * side, ny = (dx / L) * side;
    for (let j = 0; j < n; j++) {
      const t = (j + 0.5) / n, x = a[0] + dx * t, y = a[1] + dy * t, l = len * (0.6 + R() * 0.6);
      d += `M${r1(x)} ${r1(y)} l${r1(nx * l + (dx / L) * l * 0.5)} ${r1(ny * l + (dy / L) * l * 0.5)}`;
    }
  }
  return `<path d="${d}" stroke="${st}" stroke-width="${sw}" stroke-linecap="round" fill="none"/>`;
}

// A merged puff cloud (smoke, dust, foliage) from circles [[x,y,r],...]
export function cloud(list, fill = C.paper, sw = 2.6) {
  return list.map(([x, y, r]) => circ(x, y, r + sw / 2, C.ink)).join("") +
    list.map(([x, y, r]) => circ(x, y, r - sw / 2, fill)).join("");
}
