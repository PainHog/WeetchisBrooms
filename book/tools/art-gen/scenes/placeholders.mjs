// Example scene module: clearly marked PLACEHOLDER art in the three standard book
// shapes, so the book builds and preview-art has something to render before any
// real art exists. Replace each with a real piece (same name, same aspect) — or
// point the chapters at the real art names — when the art direction is set.
//   node book/tools/art-gen/scenes/build.mjs            (writes all three)
import { C, svg, n, stage, line } from "./lib.mjs";

/** A labelled placeholder panel: dashed frame, corner-to-corner cross, centred label. */
function panel(w, h, label, sub, { dark = false, id = "ph" } = {}) {
  const bg = dark ? C.deep : C.paper;
  const fg = dark ? C.accentB : C.accentDeep;
  const m = Math.round(Math.min(w, h) * 0.06);
  let s = `<rect x="0" y="0" width="${w}" height="${h}" fill="${bg}"/>`;
  if (!dark) s += stage(id, { w, h, ground: false });
  s += `<rect x="${m}" y="${m}" width="${w - 2 * m}" height="${h - 2 * m}" rx="${n(m * 0.4)}" fill="none" stroke="${fg}" stroke-width="3" stroke-dasharray="14 10"/>`;
  s += line(`M${m} ${m}L${w - m} ${h - m}M${w - m} ${m}L${m} ${h - m}`, 1.6, fg, ` opacity=".35"`);
  const fs = Math.round(Math.min(w / 14, h / 6));
  // generous width estimate for a generic sans (the label must never touch its box)
  const bw = Math.round(Math.max(label.length * (fs * 0.74 + 2), sub.length * fs * 0.55 * 0.58) + fs * 1.4), bh = Math.round(fs * 2.9);
  s += `<rect x="${n((w - bw) / 2)}" y="${n(h / 2 - bh / 2)}" width="${bw}" height="${bh}" rx="${n(fs * 0.3)}" fill="${bg}" stroke="${fg}" stroke-width="2"/>`;
  s += `<text x="${n(w / 2)}" y="${n(h / 2 - fs * 0.1)}" text-anchor="middle" font-family="sans-serif" font-weight="700" font-size="${fs}" letter-spacing="2" fill="${fg}">${label}</text>`;
  s += `<text x="${n(w / 2)}" y="${n(h / 2 + fs * 0.95)}" text-anchor="middle" font-family="sans-serif" font-size="${n(fs * 0.55)}" fill="${fg}">${sub}</text>`;
  return s;
}

/** Cover-shaped placeholder (612×792, the US Letter page). */
export function placeholder_cover() {
  return svg("0 0 612 792", "Placeholder cover art", panel(612, 792, "PLACEHOLDER", "cover art to be made (612×792)", { dark: true, id: "phc" }));
}

/** Wide placeholder (3:1): chapter vignettes and part-page art. */
export function placeholder_wide() {
  return svg("0 0 900 300", "Placeholder wide art", panel(900, 300, "PLACEHOLDER", "wide art to be made (3:1)", { id: "phw" }));
}

/** 4:3 placeholder: spot illustrations and the back-cover panel. */
export function placeholder() {
  return svg("0 0 800 600", "Placeholder art", panel(800, 600, "PLACEHOLDER", "illustration to be made (4:3)", { id: "php" }));
}
