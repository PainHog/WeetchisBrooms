// Shared scene kit for the Witch & Ward book art (cover, part pages, chapter
// vignettes, spots, diagrams). Palette-agnostic: colours come from the PLACEHOLDER
// palette in ../lib.mjs (which mirrors book/src/book.css). Nothing here draws a
// particular character or place.
import { C } from "../lib.mjs";
export { C };

export const ART = new URL("../../../art/", import.meta.url).pathname; // book/art/

export const n = v => (Math.round(v * 10) / 10).toString();
export const pts = a => a.map(p => `${n(p[0])},${n(p[1])}`).join(" ");

/** Seeded LCG — deterministic scatter (stipple, hatch jitter). */
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

/** A complete SVG document: viewBox only (no fixed width/height), with a title for accessibility. */
export function svg(vb, title, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${title}">\n<title>${title}</title>\n${body}\n</svg>\n`;
}

// Straight hatch lines inside a clip shape.
export function hatch(id, clipShape, x0, y0, x1, y1, gap = 6, ang = 45, stroke = C.ink, w = 1, op = 0.35) {
  const out = [];
  const L = Math.hypot(x1 - x0, y1 - y0);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const a = ang * Math.PI / 180, dx = Math.cos(a), dy = Math.sin(a), px = -dy, py = dx;
  for (let t = -L / 2; t <= L / 2; t += gap) {
    const ox = cx + px * t, oy = cy + py * t;
    out.push(`M${n(ox - dx * L / 2)} ${n(oy - dy * L / 2)}L${n(ox + dx * L / 2)} ${n(oy + dy * L / 2)}`);
  }
  return `<clipPath id="${id}">${clipShape}</clipPath><path clip-path="url(#${id})" d="${out.join("")}" stroke="${stroke}" stroke-width="${w}" opacity="${op}" fill="none"/>`;
}

export function stipple(seed, cx, cy, rx, ry, count, r = 1, fill = C.ink, op = 0.3) {
  const R = rng(seed); let d = "";
  for (let i = 0; i < count; i++) {
    const t = R() * Math.PI * 2, u = Math.sqrt(R());
    d += `M${n(cx + Math.cos(t) * rx * u)} ${n(cy + Math.sin(t) * ry * u)}h0.01`;
  }
  return `<path d="${d}" stroke="${fill}" stroke-width="${r * 2}" stroke-linecap="round" opacity="${op}"/>`;
}

export function sparkle(x, y, r, fill = C.accentB, stroke = C.ink) {
  const a = r, b = r * 0.26;
  return `<path d="M${n(x)} ${n(y - a)}Q${n(x + b)} ${n(y - b)} ${n(x + a)} ${n(y)}Q${n(x + b)} ${n(y + b)} ${n(x)} ${n(y + a)}Q${n(x - b)} ${n(y + b)} ${n(x - a)} ${n(y)}Q${n(x - b)} ${n(y - b)} ${n(x)} ${n(y - a)}z" fill="${fill}" stroke="${stroke}" stroke-width="${n(Math.max(0.9, r * .1))}" stroke-linejoin="round"/>`;
}

// The shared vignette stage: a soft light glow + an inked ground line with hatch.
// Everything in a scene stands on this one ground line (ART-CHECKLIST §4).
export function stage(id, o = {}) {
  const { w = 900, h = 300, groundY = 262, cx = 450, glow = true, ground = true, gw = 0.8 } = o;
  let s = `<defs><radialGradient id="${id}-glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${C.paper2}"/><stop offset=".6" stop-color="${C.paper2}" stop-opacity=".75"/><stop offset="1" stop-color="${C.paper2}" stop-opacity="0"/></radialGradient></defs>`;
  if (glow) s += `<ellipse cx="${cx}" cy="${n(h * .5)}" rx="${n(w * .48)}" ry="${n(h * .5)}" fill="url(#${id}-glow)"/>`;
  if (ground) {
    const x0 = cx - w * gw / 2, x1 = cx + w * gw / 2;
    s += `<path d="M${n(x0)} ${groundY}H${n(x1)}" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round"/>`;
    let d = "";
    for (let xx = x0 + 14; xx < x1 - 4; xx += 11) d += `M${n(xx)} ${groundY + 5}l-7 9`;
    s += `<path d="${d}" stroke="${C.ink}" stroke-width="1.3" opacity=".3"/>`;
  }
  return s;
}

/** Contact shadow under anything resting on a surface. */
export const shadow = (x, y, rx, ry = rx * 0.18, op = .18) => `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(rx)}" ry="${n(ry)}" fill="${C.ink}" opacity="${op}"/>`;
export const line = (d, w = 2, c = C.ink, extra = "") => `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
/** A rope/thread/cable hanging between two anchor points with a little sag. Both ends must be anchored to something real. */
export const sag = (x1, y1, x2, y2, s = 10, c = C.accent, w = 1.6) => `<path d="M${n(x1)} ${n(y1)}Q${n((x1 + x2) / 2)} ${n((y1 + y2) / 2 + s)} ${n(x2)} ${n(y2)}" stroke="${c}" stroke-width="${w}" fill="none"/>`;

// Cobweb fan anchored at a corner (x,y) spreading into the quadrant given by angles a0..a1 (deg).
export function cobweb(x, y, R, a0 = 0, a1 = 90, spokes = 6, rings = 5, stroke = C.ink, w = 1.4, op = 1) {
  const rad = d => d * Math.PI / 180;
  let d = "";
  const angs = [];
  for (let i = 0; i < spokes; i++) angs.push(a0 + (a1 - a0) * i / (spokes - 1));
  for (const a of angs) d += `M${n(x)} ${n(y)}L${n(x + Math.cos(rad(a)) * R)} ${n(y + Math.sin(rad(a)) * R)}`;
  for (let k = 1; k <= rings; k++) {
    const rr = R * (k / (rings + 0.4)) ** 1.1;
    for (let i = 0; i < spokes - 1; i++) {
      const p = [x + Math.cos(rad(angs[i])) * rr, y + Math.sin(rad(angs[i])) * rr];
      const q = [x + Math.cos(rad(angs[i + 1])) * rr, y + Math.sin(rad(angs[i + 1])) * rr];
      const mA = rad((angs[i] + angs[i + 1]) / 2), mr = rr * 0.86;
      d += `M${n(p[0])} ${n(p[1])}Q${n(x + Math.cos(mA) * mr)} ${n(y + Math.sin(mA) * mr)} ${n(q[0])} ${n(q[1])}`;
    }
  }
  return `<path d="${d}" stroke="${stroke}" stroke-width="${w}" fill="none" stroke-linecap="round" opacity="${op}"/>`;
}
