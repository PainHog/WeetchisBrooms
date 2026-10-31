// The Witch & Ward front cover and back-cover panel.
//
//   node book/tools/art-gen/scenes/covers.mjs                 both
//   node book/tools/art-gen/scenes/covers.mjs cover           just the cover
//   node book/tools/art-gen/scenes/covers.mjs back-cover      just the back panel
//
// Writes book/art/cover.svg (612×792, the cover slot) and book/art/back-cover.svg
// (800×600, the 4:3 back-cover panel) with lib.mjs's save().
//
// The cover: the six ready-made witches stand in the street in Old Town under the
// lamp of the Lantern House, at night. Rook, in rook shape, sits on the chimney
// against the moon. Up the hill behind, the old radio tower on the Heights; in the
// dark archway on the right, a man in a grey suit and hat is watching (the Quiet
// Man, Episode 1's threat). The top 2.6in is quiet sky for the title, subtitle and
// author line; the bottom inch is dark cobbles for "Test edition" (book.css).
//
// The back cover: Rook in human shape on the doorstep of the Lantern House, under
// the lamp, with the lit hall and its coat stand behind.
//
// Every head comes from portraits.mjs (the same code as the portraits and the
// Foundry tokens), so each witch is the same person on the cover. The bodies and
// outfits follow the written looks and the other book art (the Lantern House and the
// coven line-ups in vignettes.mjs): same house front, same clothes and colours.
//
// Scale (ART-CHECKLIST 12, 23): one eye level for the whole picture. Each figure is
// drawn at the scale its distance from the viewer gives it, and the houses at
// theirs: a camera 150 cm above the street, so a thing standing on the ground at
// screen height y is (y − horizon) / 150 screen units per centimetre.
import { save, setPrefix } from "../lib.mjs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import {
  Art, P, S, E, C, G, tag, smooth, sym, poly, rng, mix, dk, lt, r, CX, INK, LW, setStroke,
  fill, shaded, neck, capsule, palmHand, lerp, normal, flame,
  dana, marco, june, quinn, tess, noor, rook, rookHead, NIGHT,
} from "./portraits.mjs";

// ---------------------------------------------------------------- the figure kit
// A standing figure faces the viewer, drawn in the portrait's own units: the head is
// the portrait head (crown about y 92, chin about y 250, centre line x 200), and the
// body goes on down to the soles. N is the stature in head heights (158 units each).

/** Body levels for a figure N heads tall: y(f) is the height f of the way from crown to sole. */
function levels(N) {
  const T = N * 158;
  const y = f => 92 + f * T;
  return { T, y, sole: y(1) };
}

/** A torso outline: neck base, shoulders, armpits, waist, hips, down to y(bot). */
function torsoShape(y, { nw = 26, sw, ww, hw, bot = 0.52, shY = 0.19, flare = 0 }) {
  return smooth(sym([[CX, y(0.155)], [CX + nw, y(0.155)], [CX + nw + 38, y(shY) - 4], [CX + sw - 12, y(shY) + 4], [CX + sw, y(shY + 0.035)],
    [CX + sw - 8, y(0.27)], [CX + ww, y(0.4)], [CX + hw, y(Math.min(bot, 0.5) - 0.02)], [CX + hw + flare, y(bot), 1], [CX, y(bot), 1]]));
}

/** Trousers: two legs from the waist to the hems, with a crease down each leg. */
function trousers(A, y, o) {
  const { hw, col, kx = 50, fx = 52, kw = 40, aw = 33, top = 0.4, hem = 0.955 } = o;
  const hipY = y(0.48), crotchY = y(0.535), kneeY = y(0.73), hemY = y(hem);
  const right = [[CX, y(top)], [CX + hw - 6, y(top)], [CX + hw + 2, hipY], [CX + kx + kw, kneeY], [CX + fx + aw, hemY, 1], [CX + fx - aw, hemY, 1], [CX + kx - kw + 8, kneeY], [CX + 14, crotchY + 30], [CX, crotchY, 1]];
  let s = fill(A, smooth(sym(right)), col, { hi: 0.12, lo: 0.32 });
  for (const sd of [-1, 1]) s += S(`M${r(CX + sd * (kx + 2))},${r(crotchY + 40)} L${r(CX + sd * (fx + 2))},${r(hemY - 12)}`, dk(col, 0.35), 2, 0.55);
  return s;
}

/** A pair of shoes or boots seen from the front, standing on y = sole, with their contact shadow. */
function shoes(A, y, o) {
  const { col, fx = 52, w = 40, h = 52, sole = col === "#eef0f2" ? "#b9bec6" : dk(col, 0.45), boot = 0 } = o;
  const sy = y(1);
  let s = E(CX, sy + 4, fx + w + 24, 16, "#05070c", { op: 0.45 });
  for (const sd of [-1, 1]) {
    const x = CX + sd * fx, tx = x + sd * 5;
    const d = smooth([[x - w, sy, 1], [x - w * 0.98, sy - h * 0.5], [tx - w * 0.6, sy - h - boot], [tx + w * 0.6, sy - h - boot], [x + w * 0.98, sy - h * 0.5], [x + w, sy, 1]]);
    s += fill(A, d, col, { hi: 0.18, lo: 0.3 });
    s += P(`M${r(x - w)},${r(sy - 9)} L${r(x + w)},${r(sy - 9)} L${r(x + w)},${r(sy)} L${r(x - w)},${r(sy)} Z`, sole, { s: INK, w: 2 });
    s += E(tx - w * 0.3, sy - h * 0.62, w * 0.28, h * 0.12, "#ffffff", { op: 0.25 });
  }
  return s;
}

/** A sleeve or bare limb along [shoulder, elbow, wrist]: rounded at the shoulder, cut square at the cuff. */
function limb(A, pts, w0, w1, color, o = {}) {
  const n = pts.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy);
    const w = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
    L.push([pts[i][0] - dy / len * w, pts[i][1] + dx / len * w]); R.push([pts[i][0] + dy / len * w, pts[i][1] - dx / len * w]);
  }
  const a = pts[0], b = pts[1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const cap = [a[0] - (b[0] - a[0]) / len * w0 * 0.22, a[1] - (b[1] - a[1]) / len * w0 * 0.22];
  const Le = L[n - 1], Re = R[n - 1];
  const all = [cap, ...L.slice(0, n - 1), [Le[0], Le[1], 1], [Re[0], Re[1], 1], ...R.slice(0, n - 1).reverse()];
  return fill(A, smooth(all), color, { hi: o.hi ?? 0.14, lo: o.lo ?? 0.32 });
}

/** Unit vector from a to b, and the angle (deg) that turns +y onto it. */
function dirOf(a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy); return { u: [dx / L, dy / L], deg: Math.atan2(-dx, dy) * 180 / Math.PI }; }

/**
 * A relaxed hanging hand: the back of the hand towards the viewer, fingers down, thumb on
 * the side towards the body's centre line. thumb = +1 puts it on the viewer's right (a
 * person's RIGHT hand, which is on the viewer's left), −1 on the viewer's left.
 * o.ring: a band round the thumb (Dana's silver ring); o.oil: smudges (Marco).
 */
function hangHand(A, wrist, deg, skin, thumb, o = {}) {
  const ts = thumb, k = getK();
  skin = dk(skin, 0.07);
  const palm = smooth([[-21, -6], [21, -6], [24, 24], [20, 46], [-20, 46], [-24, 24]]);
  const fingers = [[-15, 28], [-5, 33], [5, 32], [15, 26]].map(([x, len]) => [[x, 40], [x + ts * 1, 40 + len * 0.6], [x + ts * 4, 40 + len]]);
  const th = [[ts * 13, 6], [ts * 22, 24], [ts * 19, 44]];
  const fw = 10.5, tw = 12, ow = 3 * k;
  let s = P(palm, INK, { s: INK, w: ow, raw: true });
  for (const f of fingers) s += S(smooth(f, false), INK, fw + ow, undefined, { raw: true });
  s += P(palm, skin);
  for (const f of fingers) s += S(smooth(f, false), skin, fw, undefined, { raw: true });
  // finger divisions and knuckles
  s += S(`M-10,42 L${-10 + ts * 2},${40 + 26} M0,42 L${ts * 2.5},${40 + 30} M10,42 L${10 + ts * 2},${40 + 26}`, dk(skin, 0.4), 2.2, 0.9, { raw: true });
  s += S(`M-17,34 Q0,30 17,34`, dk(skin, 0.3), 1.6, 0.6, { raw: true });
  // thumb on top, towards the centre line
  s += S(smooth(th, false), INK, tw + ow, undefined, { raw: true }) + S(smooth(th, false), skin, tw, undefined, { raw: true });
  if (o.ring) {
    const p = lerp(th[1], th[2], 0.1), q = lerp(th[1], th[2], 0.42);
    s += S(`M${r(p[0])},${r(p[1])} L${r(q[0])},${r(q[1])}`, INK, tw + ow, undefined, { cap: "butt", raw: true }) + S(`M${r(p[0])},${r(p[1])} L${r(q[0])},${r(q[1])}`, o.ring, tw + 1, undefined, { cap: "butt", raw: true });
    s += C(r(lerp(p, q, 0.5)[0] - ts * 3), r(lerp(p, q, 0.5)[1]), 2.4, "#ffffff", { op: 0.95 });
  }
  if (o.oil) s += E(-8, 18, 9, 5, o.oil, { op: 0.5 }) + E(10, 34, 7, 4, o.oil, { op: 0.45 }) + E(-14, 62, 4, 6, o.oil, { op: 0.4 });
  return G(s, { tf: `translate(${r(wrist[0])} ${r(wrist[1])}) rotate(${r(deg)})` });
}
let KNOW = 2;
const getK = () => KNOW;

/** An arm hanging at the figure's side, with its hand. side −1 = viewer's left (the person's right arm). */
function hangArm(A, y, sd, o) {
  const { sw, col, skin, w0 = 62, w1 = 50, out = 0, cuff, bare = false } = o;
  const sh = [CX + sd * (sw - w0 / 2 - 1), y(0.212)];
  const el = [CX + sd * (sw - w0 / 2 + 14 + out), y(0.395)];
  const wr = [CX + sd * (sw - w0 / 2 + 12 + out * 1.4), y(0.515)];
  let s = "";
  if (bare) {   // rolled sleeve to the elbow, bare forearm
    s += limb(A, [sh, el], w0, w0 - 6, col);
    s += limb(A, [lerp(sh, el, 0.95), lerp(el, wr, 0.5), wr], w1 + 4, w1 - 6, skin, { hi: 0.12, lo: 0.3 });
    s += rolledCuff(A, sh, el, w0 + 4, col);
  } else {
    s += limb(A, [sh, el, wr], w0, w1, col);
    if (cuff) s += cuffBand(A, el, wr, w1 + 2, cuff);
  }
  const { deg } = dirOf(el, wr);
  s += hangHand(A, [wr[0], wr[1] - 4], deg, o.hand ?? skin, -sd, { ring: o.ring, oil: o.oil });
  return s;
}
/** A cuff band at the end of a sleeve. */
function cuffBand(A, el, wr, w, col) {
  const { u } = dirOf(el, wr), n = [-u[1], u[0]];
  const a = [wr[0] - u[0] * 16, wr[1] - u[1] * 16];
  return fill(A, poly([[a[0] + n[0] * w / 2, a[1] + n[1] * w / 2], [wr[0] + n[0] * w / 2, wr[1] + n[1] * w / 2], [wr[0] - n[0] * w / 2, wr[1] - n[1] * w / 2], [a[0] - n[0] * w / 2, a[1] - n[1] * w / 2]]), col, { w: 2.4 });
}
/** A sleeve rolled up above the elbow: a fat band with two fold lines. */
function rolledCuff(A, sh, el, w, col) {
  const { u } = dirOf(sh, el), n = [-u[1], u[0]];
  const a = [el[0] - u[0] * 26, el[1] - u[1] * 26], b = [el[0] + u[0] * 6, el[1] + u[1] * 6];
  const q = (p, k) => [p[0] + n[0] * k, p[1] + n[1] * k];
  let s = fill(A, smooth([q(a, -w / 2), q(lerp(a, b, 0.5), -w / 2 - 3), q(b, -w / 2), q(b, w / 2), q(lerp(a, b, 0.5), w / 2 + 3), q(a, w / 2)]), lt(col, 0.16), { w: 2.6 });
  for (const t of [0.35, 0.7]) { const m = lerp(a, b, t); s += S(`M${r(q(m, -w / 2 + 2)[0])},${r(q(m, -w / 2 + 2)[1])} L${r(q(m, w / 2 - 2)[0])},${r(q(m, w / 2 - 2)[1])}`, dk(col, 0.3), 2); }
  return s;
}

/** A figure, drawn by its body function, placed in the scene: feet at (x, ys), stature in cm. */
function place(body, x, ys, cm, horizon, k = 2) {
  const N = body.N, T = N * 158, H = cm * (ys - horizon) / 150, sc = H / T;
  KNOW = k; setStroke(k);
  const s = G(body.draw(), { tf: `translate(${r(x)} ${r(ys)}) scale(${(Math.round(sc * 10000) / 10000)}) translate(${-CX} ${r(-(92 + T))})` });
  setStroke(1); KNOW = 2;
  return s;
}

// ---------------------------------------------------------------- the coven, full figure
// Each body draws, back to front: what is behind the body (hair, hood), shoes, legs,
// torso and clothes, arms and hands, the neck and the portrait head, then props.

/** Dana Okafor: tall; teal scrubs top and trousers under an open denim jacket; white trainers; silver ring on her LEFT thumb. */
function danaBody(A, look = 0) {
  const ch = dana, N = 7.3, { y } = levels(N), sw = 126, ww = 94, hw = 108;
  const { skin, denim, scrubs } = ch;
  const palm = mix(skin, "#e2aa86", 0.25);
  let s = shoes(A, y, { col: "#eef0f2", fx: 50, w: 38, h: 50 });
  s += trousers(A, y, { hw: hw - 4, col: scrubs, kx: 48, fx: 50, kw: 42, aw: 36 });
  s += fill(A, torsoShape(y, { sw: sw - 6, ww: ww - 4, hw: hw - 2, bot: 0.53 }), scrubs, { hi: 0.12, lo: 0.25 });   // scrub top
  // the denim jacket, open, to the hip
  for (const sd of [-1, 1]) {
    const pts = [[CX + sd * 28, y(0.155)], [CX + sd * 66, y(0.19) - 4], [CX + sd * (sw - 12), y(0.19) + 4], [CX + sd * sw, y(0.225)], [CX + sd * (sw - 8), y(0.27)],
      [CX + sd * (ww + 4), y(0.4)], [CX + sd * (hw + 4), y(0.49), 1], [CX + sd * 40, y(0.49), 1], [CX + sd * 36, y(0.3)], [CX + sd * 30, y(0.2)]];
    s += fill(A, smooth(pts), denim, { hi: 0.12, lo: 0.3 });
    s += S(`M${r(CX + sd * 44)},${r(y(0.45))} L${r(CX + sd * (hw + 2))},${r(y(0.45))}`, "#e0a548", 1.6, 0.9, { dash: "4 3" });   // waistband stitching
    s += fill(A, `M${r(CX + sd * 58)},${r(y(0.255))} L${r(CX + sd * 104)},${r(y(0.255))} L${r(CX + sd * 102)},${r(y(0.29))} L${r(CX + sd * 60)},${r(y(0.29))} Z`, lt(denim, 0.06), { w: 2.2 });   // chest pocket
    s += C(CX + sd * 81, y(0.262), 3.4, "#c9ced4", { s: INK, w: 1.4 });
    s += fill(A, smooth([[CX + sd * 26, y(0.152)], [CX + sd * 66, y(0.168)], [CX + sd * 80, y(0.19)], [CX + sd * 50, y(0.235), 1], [CX + sd * 38, y(0.2)], [CX + sd * 30, y(0.18)]]), lt(denim, 0.1), { w: 2.6 });   // collar
  }
  s += S(`M${CX - 21},${r(y(0.158))} L${CX},${r(y(0.205))} L${CX + 21},${r(y(0.158))}`, dk(scrubs, 0.3), 4);   // the scrubs' V-neck
  s += P(`M${CX - 21},${r(y(0.158))} L${CX},${r(y(0.2))} L${CX + 21},${r(y(0.158))} Z`, skin);
  for (const sd of [-1, 1]) s += hangArm(A, y, sd, { sw, col: denim, skin, hand: palm, cuff: lt(denim, 0.1), ring: sd > 0 ? ch.silver : undefined });   // her left hand (viewer's right) has the ring
  s += neck(A, skin, 24, 200, y(0.17), ch.hd.chin);
  s += P(`M${CX - 21},${r(y(0.158))} L${CX},${r(y(0.2))} L${CX + 21},${r(y(0.158))}`, "none", { s: dk(scrubs, 0.3), w: 4 });
  s += withEyes(ch, look, A);
  return s;
}

/** Marco Rossi: stocky; navy work shirt with the sleeves rolled up; burn scar on his RIGHT forearm; oil on his hands; his right hand raised with a small flame (his Flame Power). */
function marcoBody(A, look = 0) {
  const ch = marco, N = 6.8, { y } = levels(N), sw = 150, ww = 124, hw = 122;
  const { skin, shirt, oil } = ch;
  const trouser = "#3e3a36", boot = "#7a4a2a";
  let s = shoes(A, y, { col: boot, fx: 56, w: 42, h: 58, boot: 10 });
  s += trousers(A, y, { hw, col: trouser, kx: 54, fx: 56, kw: 44, aw: 38 });
  s += fill(A, `M${CX - hw + 2},${r(y(0.415))} L${CX + hw - 2},${r(y(0.415))} L${CX + hw},${r(y(0.445))} L${CX - hw},${r(y(0.445))} Z`, "#2a2420", { w: 2.4 });   // belt
  s += fill(A, `M${CX - 14},${r(y(0.41))} L${CX + 14},${r(y(0.41))} L${CX + 14},${r(y(0.45))} L${CX - 14},${r(y(0.45))} Z`, "#d9b55a", { w: 2 });
  s += fill(A, torsoShape(y, { sw, ww, hw, bot: 0.42, nw: 33 }), shirt, { hi: 0.12, lo: 0.3 });
  s += S(`M${CX},${r(y(0.205))} L${CX},${r(y(0.41))}`, dk(shirt, 0.35), 2.4);
  for (const f of [0.25, 0.3, 0.35]) s += C(CX + 6, y(f), 3.2, "#d8d2c4", { s: INK, w: 1.2 });
  // chest pocket with the red rag (his left, viewer's right)
  s += P(smooth([[CX + 60, y(0.232)], [CX + 70, y(0.22)], [CX + 80, y(0.226)], [CX + 90, y(0.216)], [CX + 100, y(0.227)], [CX + 98, y(0.24)], [CX + 62, y(0.24)]]), "#c8402e", { s: INK, w: 2.2 });
  s += fill(A, `M${CX + 54},${r(y(0.236))} L${CX + 104},${r(y(0.236))} L${CX + 102},${r(y(0.272))} L${CX + 56},${r(y(0.272))} Z`, lt(shirt, 0.05), { w: 2.4 });
  // his left arm hangs, sleeve rolled; oily hand
  s += hangArm(A, y, 1, { sw, col: shirt, skin, bare: true, w0: 70, w1: 52, oil });
  // his right arm raised: forearm up, hand open, palm out, a small flame dancing over it
  const sh = [CX - (sw - 22), y(0.205)], el = [CX - sw - 34, y(0.34)], wr = [CX - sw - 18, y(0.215)];
  s += limb(A, [sh, el], 70, 64, shirt);
  s += limb(A, [lerp(sh, el, 0.94), lerp(el, wr, 0.5), wr], 56, 46, skin, { hi: 0.12, lo: 0.3 });
  s += rolledCuff(A, sh, el, 74, shirt);
  // burn scar on the forearm
  const sc = lerp(el, wr, 0.48), ang = dirOf(el, wr).deg;
  s += E(sc[0], sc[1], 7, 13, "#e9a796", { tf: `rotate(${r(ang)} ${r(sc[0])} ${r(sc[1])})`, s: dk("#e9a796", 0.25), w: 1.4 });
  s += E(el[0] + 6, el[1] - 40, 6, 3.5, oil, { op: 0.45 });
  s += palmHand(A, wr[0] + 2, wr[1] - 30, -6, mix(skin, "#e0b088", 0.3), { side: 1 });
  s += E(wr[0] - 4, wr[1] - 40, 7, 4, oil, { op: 0.4 }) + E(wr[0] + 12, wr[1] - 18, 5, 3, oil, { op: 0.35 });
  s += flameInHand(A, wr[0] - 2, wr[1] - 102);   // just above the fingertips (they end about wr - 86), so all five digits show
  s += neck(A, skin, 32, 205, y(0.165), ch.hd.chin);
  s += fill(A, `M${CX - 40},${r(y(0.158))} L${CX},${r(y(0.205))} L${CX + 40},${r(y(0.158))} L${CX + 46},${r(y(0.175))} L${CX},${r(y(0.225))} L${CX - 46},${r(y(0.175))} Z`, shirt, { s: false });
  for (const sd of [-1, 1]) s += fill(A, smooth([[CX + sd * 32, y(0.148)], [CX + sd * 74, y(0.16)], [CX + sd * 86, y(0.175)], [CX + sd * 56, y(0.205), 1], [CX + sd * 42, y(0.178)], [CX + sd * 34, y(0.163)]]), lt(shirt, 0.08), { w: 2.6 });
  s += withEyes(ch, look, A);
  return s;
}

/** A small flame standing over Marco's palm, with a warm glow round it. */
function flameInHand(A, x, y) {
  const glow = A.rad([[0, "#ffd27a", 0.7], [0.5, "#ff9a2a", 0.25], [1, "#ff9a2a", 0]]);
  let s = C(x, y - 30, 95, glow);
  s += P(smooth([[x - 22, y + 4], [x - 26, y - 22], [x - 10, y - 52], [x - 4, y - 76], [x + 4, y - 102, 1], [x + 10, y - 70], [x + 24, y - 44], [x + 26, y - 16], [x + 20, y + 4]]),
    A.lin([[0, "#fff3c2"], [0.35, "#ffc24a"], [0.75, "#ff7a26"], [1, "#c1271c"]], 0, 1, 0, 0), { s: "#8a2a14", w: 2.4 });
  s += P(smooth([[x - 10, y - 2], [x - 12, y - 22], [x - 2, y - 44], [x + 3, y - 60, 1], [x + 8, y - 36], [x + 12, y - 16], [x + 8, y - 2]]), "#fff6d8", { op: 0.95 });
  return s;
}

/** June Takeda: small; yellow raincoat to the thigh, hood down; round glasses; red notebook held to her chest with her left hand. */
function juneBody(A, look = 0) {
  const ch = june, N = 6.3, { y } = levels(N), sw = 112, ww = 92, hw = 104;
  const { skin, coat } = ch;
  let s = ch.backHair(A);
  s += shoes(A, y, { col: "#8a4a32", fx: 46, w: 34, h: 46 });
  s += trousers(A, y, { hw: hw - 14, col: "#26304a", kx: 44, fx: 46, kw: 34, aw: 30 });
  // raincoat: flares a little to the thigh
  s += fill(A, torsoShape(y, { sw, ww, hw, bot: 0.64, flare: 10 }), coat, { hi: 0.15, lo: 0.22 });
  s += S(`M${CX + 8},${r(y(0.21))} L${CX + 6},${r(y(0.64))}`, dk(coat, 0.3), 2.2);
  for (const f of [0.27, 0.34, 0.41, 0.48]) s += C(CX + 18, y(f), 3.6, "#3c3c42");
  for (const sd of [-1, 1]) s += fill(A, `M${r(CX + sd * 40)},${r(y(0.45))} L${r(CX + sd * 82)},${r(y(0.45))} L${r(CX + sd * 82)},${r(y(0.47))} L${r(CX + sd * 40)},${r(y(0.47))} Z`, dk(coat, 0.1), { w: 2 });   // pocket flaps
  // hood, down behind the neck
  s += ch.hood(A).replace(/<path/, `<path transform="translate(0 ${r(y(0.155) - 268)})"`);
  // right arm (viewer's left) hangs
  s += hangArm(A, y, -1, { sw, col: coat, skin, cuff: dk(coat, 0.08) });
  // left arm bent: the notebook held flat to her chest; her hand round its right edge, thumb on the cover
  const sh = [CX + (sw - 30), y(0.212)], el = [CX + sw + 4, y(0.385)], wr = [CX + 100, y(0.31)];
  const nb = [[CX + 4, y(0.222)], [CX + 92, y(0.214)], [CX + 100, y(0.362)], [CX + 12, y(0.37)]];
  s += P(poly([[CX + 92, y(0.214)], [CX + 99, y(0.216)], [CX + 107, y(0.362)], [CX + 100, y(0.362)]]), "#f3ead6", { s: INK, w: 2.2 });   // page edges
  s += fill(A, poly(nb), "#b8463a", { hi: 0.12, w: 2.6 });
  s += S(`M${CX + 84},${r(y(0.216))} L${CX + 92},${r(y(0.364))}`, "#2a1f22", 3.4) + S(`M${CX + 12},${r(y(0.245))} L${CX + 80},${r(y(0.24))}`, "#d9a36a", 1.8, 0.8);   // elastic strap and a label line
  s += limb(A, [sh, el, wr], 58, 50, coat);
  s += cuffBand(A, el, wr, 52, dk(coat, 0.08));
  const hx = wr[0] - 6, hy = wr[1] - 6;
  s += shaded(A, smooth([[hx - 6, hy - 20], [hx + 12, hy - 22], [hx + 20, hy - 4], [hx + 16, hy + 18], [hx, hy + 22], [hx - 10, hy + 4]]), skin, { w: 2.4 });
  for (const [dy, len] of [[-14, 26], [-4, 30], [6, 29], [16, 23]]) s += capsule([[hx - 4, hy + dy], [hx - 4 - len, hy + dy - 1]], 9, skin, { ow: 3.4 });
  s += capsule([[hx + 6, hy - 20], [hx - 8, hy - 30], [hx - 26, hy - 32]], 10, skin, { ow: 3.4 });
  s += neck(A, skin, 22, 205, y(0.17), ch.hd.chin);
  s += fill(A, `M${CX - 30},${r(y(0.158))} L${CX},${r(y(0.19))} L${CX + 30},${r(y(0.158))} L${CX + 34},${r(y(0.18))} L${CX},${r(y(0.215))} L${CX - 34},${r(y(0.18))} Z`, "#2f5f63", { w: 2.4 });   // teal jumper
  for (const sd of [-1, 1]) s += fill(A, smooth([[CX + sd * 24, y(0.15)], [CX + sd * 56, y(0.16)], [CX + sd * 66, y(0.175)], [CX + sd * 44, y(0.205), 1], [CX + sd * 32, y(0.18)], [CX + sd * 26, y(0.165)]]), lt(coat, 0.08), { w: 2.6 });
  s += withEyes(ch, look, A, true);
  return s;
}

/** Quinn Abernathy: lanky; curly red hair; a long violet cardigan over a cream shirt; grey trousers; a whistle on a cord. */
function quinnBody(A, look = 0) {
  const ch = quinn, N = 7.5, { y } = levels(N), sw = 112, ww = 84, hw = 92;
  const { skin, card, shirtC } = ch;
  let s = ch.under(A);
  s += shoes(A, y, { col: "#7a4a2a", fx: 46, w: 36, h: 48 });
  s += trousers(A, y, { hw: hw - 6, col: "#5d6270", kx: 44, fx: 46, kw: 34, aw: 30 });
  s += fill(A, torsoShape(y, { sw: sw - 8, ww: ww - 6, hw: hw - 6, bot: 0.5 }), shirtC, { hi: 0.1, lo: 0.2 });
  for (const f of [0.25, 0.31, 0.37, 0.43]) s += C(CX, y(f), 2.8, "#d9ccb0", { s: INK, w: 1 });
  // cardigan: two long open fronts, knit texture
  const knit = A.pattern(S("M0,3 L6,3", dk(card, 0.2), 1, 0.5), 6, 6);
  for (const sd of [-1, 1]) {
    const pts = [[CX + sd * 26, y(0.152)], [CX + sd * 64, y(0.188)], [CX + sd * (sw - 12), y(0.19) + 4], [CX + sd * sw, y(0.225)], [CX + sd * (sw - 8), y(0.27)],
      [CX + sd * (ww + 6), y(0.4)], [CX + sd * (hw + 8), y(0.57), 1], [CX + sd * 30, y(0.57), 1], [CX + sd * 34, y(0.25)]];
    const d = smooth(pts);
    s += fill(A, d, card, { hi: 0.14, lo: 0.3 }) + P(d, knit, { clip: A.clip(d) });
    s += fill(A, `M${r(CX + sd * 46)},${r(y(0.46))} L${r(CX + sd * 92)},${r(y(0.46))} L${r(CX + sd * 92)},${r(y(0.52))} L${r(CX + sd * 48)},${r(y(0.52))} Z`, dk(card, 0.05), { w: 2.2 });   // pockets
  }
  s += C(CX - 34, y(0.33), 3.6, "#efe2c4", { s: INK, w: 1.4 });
  for (const sd of [-1, 1]) s += hangArm(A, y, sd, { sw, col: card, skin, w0: 56, w1: 46, out: 4, cuff: dk(card, 0.12) });
  s += neck(A, skin, 21, 200, y(0.17), ch.hd.chin);
  s += P(`M${CX - 21},${r(y(0.15))} L${CX + 21},${r(y(0.15))} L${CX + 21},${r(y(0.165))} L${CX},${r(y(0.18))} L${CX - 21},${r(y(0.165))} Z`, skin);
  for (const sd of [-1, 1]) s += fill(A, poly([[CX + sd * 22, y(0.148)], [CX + sd * 4, y(0.18)], [CX + sd * 30, y(0.177)], [CX + sd * 34, y(0.158)]]), shirtC, { w: 2.2 });
  s += ch.whistle(A, [205, y(0.235)], y(0.15), 19);
  s += withEyes(ch, look, A);
  return s;
}

/** Tess Lindqvist: broad-shouldered; navy driver's uniform with gold buttons, epaulettes and badge; blonde braid with a pale streak over her right shoulder. */
function tessBody(A, look = 0) {
  const ch = tess, N = 7.0, { y } = levels(N), sw = 148, ww = 108, hw = 114;
  const { skin, navy } = ch;
  let s = shoes(A, y, { col: "#1c1c22", fx: 52, w: 38, h: 46 });
  s += trousers(A, y, { hw: hw - 6, col: navy, kx: 50, fx: 52, kw: 40, aw: 34 });
  s += fill(A, torsoShape(y, { sw, ww, hw, bot: 0.5 }), navy, { hi: 0.14, lo: 0.3 });
  // shirt, tie and lapels
  s += fill(A, `M${CX - 40},${r(y(0.16))} L${CX + 40},${r(y(0.16))} L${CX + 12},${r(y(0.33))} L${CX - 12},${r(y(0.33))} Z`, "#bcd2ea", { w: 2.4 });
  s += fill(A, `M${CX - 8},${r(y(0.19))} L${CX + 8},${r(y(0.19))} L${CX + 11},${r(y(0.3))} L${CX},${r(y(0.318))} L${CX - 11},${r(y(0.3))} Z`, "#7a2234", { w: 2.2 });
  s += fill(A, `M${CX - 9},${r(y(0.18))} L${CX + 9},${r(y(0.18))} L${CX + 7},${r(y(0.192))} L${CX - 7},${r(y(0.192))} Z`, "#7a2234", { w: 2 });
  for (const sd of [-1, 1]) {
    s += fill(A, poly([[CX + sd * 40, y(0.165)], [CX + sd * 12, y(0.33)], [CX + sd * 10, y(0.5)], [CX + sd * (hw + 2), y(0.5)], [CX + sd * (ww + 2), y(0.4)], [CX + sd * 80, y(0.19)]]), navy, { w: 2.6, lo: 0.25 });
    s += fill(A, poly([[CX + sd * 38, y(0.163)], [CX + sd * 16, y(0.3)], [CX + sd * 40, y(0.255)], [CX + sd * 56, y(0.205)], [CX + sd * 50, y(0.178)]]), lt(navy, 0.1), { w: 2.2 });
    s += fill(A, poly([[CX + sd * 92, y(0.18)], [CX + sd * (sw + 2), y(0.205)], [CX + sd * (sw - 2), y(0.218)], [CX + sd * 88, y(0.193)]]), dk(navy, 0.2), { w: 2.2 });   // epaulette
    s += C(CX + sd * 96, y(0.187), 3.6, "#d9b55a", { s: INK, w: 1.4 });
  }
  for (const f of [0.36, 0.42, 0.47]) s += C(CX - 18, y(f), 3.8, "#d9b55a", { s: INK, w: 1.4 });
  s += C(CX + 62, y(0.255), 12, "#d9b55a", { s: INK, w: 2.4 }) + C(CX + 62, y(0.255), 7, "none", { s: dk("#d9b55a", 0.35), w: 2 }) + C(CX + 59, y(0.25), 3, "#ffffff", { op: 0.6 });   // badge, her left chest (inside the arm, which covers CX + 81 outwards)
  for (const sd of [-1, 1]) s += hangArm(A, y, sd, { sw, col: navy, skin, w0: 66, w1: 52, cuff: dk(navy, 0.15) });
  s += neck(A, skin, 28, 200, y(0.17), ch.hd.chin);
  s += fill(A, poly([[CX - 28, y(0.152)], [CX - 3, y(0.18)], [CX - 26, y(0.19)], [CX - 38, y(0.165)]]), "#d4e3f2", { w: 2.2 }) + fill(A, poly([[CX + 28, y(0.152)], [CX + 3, y(0.18)], [CX + 26, y(0.19)], [CX + 38, y(0.165)]]), "#d4e3f2", { w: 2.2 });
  s += ch.braid(A, [138, 204], [150, y(0.27)]);
  s += withEyes(ch, look, A);
  return s;
}

/** Noor Haddad: green headscarf over her shoulders; cream top; long brown apron with a crow feather in its pocket; olive trousers; boots; a potion in her right hand. */
function noorBody(A, look = 0) {
  const ch = noor, N = 6.8, { y } = levels(N), sw = 116, ww = 94, hw = 108;
  const { skin, apron, top } = ch;
  let s = shoes(A, y, { col: "#6a4a30", fx: 48, w: 36, h: 52, boot: 14 });
  s += trousers(A, y, { hw: hw - 6, col: "#4a5a3c", kx: 46, fx: 48, kw: 36, aw: 32 });
  s += fill(A, torsoShape(y, { sw, ww, hw, bot: 0.5 }), top, { hi: 0.1, lo: 0.2 });
  // long apron: bib and skirt to the knee, straps over the shoulders
  s += fill(A, smooth([[CX - 58, y(0.22), 1], [CX + 58, y(0.22), 1], [CX + 62, y(0.37)], [CX + hw + 2, y(0.42)], [CX + hw + 10, y(0.72), 1], [CX - hw - 10, y(0.72), 1], [CX - hw - 2, y(0.42)], [CX - 62, y(0.37)]]), apron, { w: 2.6, lo: 0.25 });
  for (const sd of [-1, 1]) s += fill(A, poly([[CX + sd * 52, y(0.222)], [CX + sd * 62, y(0.222)], [CX + sd * 84, y(0.17)], [CX + sd * 72, y(0.168)]]), dk(apron, 0.15), { w: 2 });
  s += S(`M${CX - 52},${r(y(0.232))} L${CX + 52},${r(y(0.232))}`, dk(apron, 0.3), 1.6, 0.8, { dash: "4 3" });
  s += E(CX - 30, y(0.6), 10, 4, "#4a3626", { op: 0.4 }) + E(CX + 34, y(0.66), 7, 3, "#4a3626", { op: 0.35 });   // soil marks
  // the apron pocket with the crow feather standing in it (her left, viewer's right, as on her portrait)
  const pk = [CX + 12, y(0.44), CX + 68, y(0.51)];                    // clear of her hanging left arm (inner edge about CX + 74)
  s += ch.feather(A, [CX + 38, y(0.49)], [CX + 54, y(0.365)], 10);
  s += fill(A, `M${pk[0]},${r(pk[1])} L${pk[2]},${r(pk[1])} L${pk[2] - 2},${r(pk[3])} L${pk[0] + 2},${r(pk[3])} Z`, lt(apron, 0.06), { w: 2.4 });
  s += S(`M${pk[0] + 2},${r(pk[1] + 6)} L${pk[2] - 2},${r(pk[1] + 6)}`, dk(apron, 0.3), 1.4, 0.8, { dash: "3 3" });
  // left arm hangs
  s += hangArm(A, y, 1, { sw, col: top, skin, w0: 58, w1: 48, oil: "#3b2a1e" });
  // right arm bent forward: a stoppered potion bottle held at her waist
  const sh = [CX - (sw - 22), y(0.205)], el = [CX - sw - 6, y(0.375)], wr = [CX - 60, y(0.37)];
  s += limb(A, [sh, el, wr], 58, 50, top);
  s += potion(A, CX - 30, y(0.37));
  // her hand round the bottle: back of the hand, four fingers across it, thumb on the near side; soil under the nails
  const hx = wr[0] + 2, hy = wr[1] - 4;
  s += shaded(A, smooth([[hx - 14, hy - 18], [hx + 6, hy - 22], [hx + 14, hy - 6], [hx + 10, hy + 18], [hx - 6, hy + 22], [hx - 16, hy + 2]]), skin, { w: 2.4 });
  for (const [dy, len] of [[-12, 22], [-2, 26], [8, 25], [18, 20]]) {
    s += capsule([[hx + 6, hy + dy], [hx + 6 + len, hy + dy + 1]], 9, skin, { ow: 3.4 });
    s += E(hx + 6 + len + 0.5, hy + dy + 1, 2.4, 2.6, "#3b2a1e");
  }
  s += capsule([[hx, hy - 20], [hx + 14, hy - 30], [hx + 28, hy - 30]], 10, skin, { ow: 3.4 });
  // headscarf over the shoulders, then the head
  s += neck(A, skin, 24, 200, y(0.17), ch.hd.chin);
  s += ch.over(A).replace(/<path/g, `<path transform="translate(0 ${r(y(0.155) - 268)})"`);   // the scarf, moved to this body's neck
  s += withEyes(ch, look, A);
  return s;
}

/** A stoppered potion bottle (round body, cork) with a faint green light inside; centre x, base y. */
function potion(A, x, base) {
  const glass = A.rad([[0, "#c9f0d2", 0.95], [0.6, "#5fae7a", 0.85], [1, "#2f6a48", 0.9]], 0.4, 0.4, 0.7);
  let s = C(x, base - 40, 72, A.rad([[0, "#9fe0b0", 0.35], [1, "#9fe0b0", 0]]));
  s += P(`M${x - 9},${base - 66} L${x + 9},${base - 66} L${x + 9},${base - 48} Q${x + 30},${base - 40} ${x + 30},${base - 18} Q${x + 30},${base} ${x},${base} Q${x - 30},${base} ${x - 30},${base - 18} Q${x - 30},${base - 40} ${x - 9},${base - 48} Z`, glass, { s: INK, w: 2.4 });
  s += P(`M${x - 8},${base - 80} L${x + 8},${base - 80} L${x + 7},${base - 64} L${x - 7},${base - 64} Z`, "#b88a5a", { s: INK, w: 2 });
  s += S(`M${x - 18},${base - 30} Q${x - 20},${base - 16} ${x - 12},${base - 8}`, "#ffffff", 2.4, 0.7);
  return s;
}

/** The portrait head (with its back parts already drawn by the body), eyes turned by `look`. */
function withEyes(ch, look, A) {
  ch.eyes = look ? { look } : undefined;
  const s = ch.head(A);
  ch.eyes = undefined;
  return s;
}

/** Rook in human shape, full figure: very tall; long grey coat with the high collar; dark trousers; black shoes; standing very still. */
function rookBody(A, look = 0) {
  const ch = rook, N = 8.0, { y } = levels(N), sw = 124, ww = 98, hw = 104;
  const { skin, coat } = ch;
  const hand = mix(skin, "#e8d4c2", 0.3);
  let s = shoes(A, y, { col: "#1c1b20", fx: 46, w: 36, h: 44 });
  s += trousers(A, y, { hw: hw - 10, col: "#26252b", kx: 44, fx: 46, kw: 34, aw: 30 });
  // the long coat, to below the knee, buttoned, with a deep back vent line
  const coatD = smooth(sym([[CX, y(0.155)], [CX + 26, y(0.155)], [CX + 64, y(0.185)], [CX + sw - 12, y(0.19)], [CX + sw, y(0.225)], [CX + sw - 8, y(0.27)], [CX + ww, y(0.4)], [CX + hw + 4, y(0.5)], [CX + hw + 22, y(0.81), 1], [CX, y(0.81), 1]]));
  s += fill(A, coatD, coat, { hi: 0.12, lo: 0.3 });
  s += S(`M${CX},${r(y(0.26))} L${CX},${r(y(0.81))}`, dk(coat, 0.35), 2.4);
  for (const f of [0.3, 0.37, 0.44]) s += C(CX - 12, y(f), 4.2, "#3a3a40", { s: INK, w: 1.4 });
  s += S(`M${CX - hw},${r(y(0.47))} Q${CX - hw - 10},${r(y(0.64))} ${CX - hw - 16},${r(y(0.8))} M${CX + hw},${r(y(0.47))} Q${CX + hw + 10},${r(y(0.64))} ${CX + hw + 16},${r(y(0.8))}`, dk(coat, 0.28), 2, 0.6);
  for (const sd of [-1, 1]) s += fill(A, `M${r(CX + sd * 40)},${r(y(0.43))} L${r(CX + sd * 86)},${r(y(0.43))} L${r(CX + sd * 88)},${r(y(0.45))} L${r(CX + sd * 40)},${r(y(0.45))} Z`, dk(coat, 0.15), { w: 2 });   // pocket flaps
  for (const sd of [-1, 1]) s += hangArm(A, y, sd, { sw, col: coat, skin, hand, w0: 60, w1: 50, cuff: dk(coat, 0.12) });
  s += neck(A, skin, 22, 200, y(0.17), ch.hd.chin);
  s += fill(A, `M${CX - 25},${r(y(0.152))} Q${CX},${r(y(0.16))} ${CX + 25},${r(y(0.152))} L${CX + 30},${r(y(0.17))} L${CX},${r(y(0.215))} L${CX - 30},${r(y(0.17))} Z`, "#2e2d35", { w: 2.4 });
  s += ch.collar(A, y(0.215));
  s += withEyes(ch, look, A);
  return s;
}

// ---------------------------------------------------------------- the street kit (screen units)

const SKY = { top: "#0b1120", mid: "#1a2442", low: "#34406a" };
const FAC = { brick: "#8a5444", brickDk: "#5e3a32", stone: "#d8ccb4", slate: "#2c3348", slateHi: "#47506c" };

/** Night sky, stars and the moon. */
function sky(A, w, h, horizon, moon) {
  let s = tag("rect", { x: 0, y: 0, width: w, height: h, fill: A.lin([[0, SKY.top], [0.55, SKY.mid], [1, SKY.low]], 0, 0, 0, horizon / h * 1.05) });
  const rnd = rng(41);
  for (let i = 0; i < 90; i++) {
    const x = rnd() * w, yy = rnd() * horizon * 0.8, rr = 0.5 + rnd() * 1.1;
    s += C(x, yy, rr, "#f4f1e4", { op: 0.35 + rnd() * 0.5 });
  }
  if (moon) {
    const [mx, my, mr] = moon;
    s += C(mx, my, mr * 3.2, A.rad([[0, "#f6efd0", 0.28], [1, "#f6efd0", 0]]));
    s += C(mx, my, mr, A.rad([[0, "#fffbea"], [0.75, "#f3e9c4"], [1, "#d9cfa8"]], 0.42, 0.4, 0.6), { s: "#b8ad88", w: 1.2 });
    s += C(mx + mr * 0.3, my - mr * 0.2, mr * 0.18, "#e2d7b0", { op: 0.8 }) + C(mx - mr * 0.35, my + mr * 0.3, mr * 0.12, "#e2d7b0", { op: 0.7 });
  }
  return s;
}

/** A sash window: frame, glass (lit or dark), glazing bars, sill. Lit windows can have curtains. */
function sash(A, x, y, w, h, o = {}) {
  const { lit = false, curtain, frame = "#efe7d6", sw = 1.4 } = o;
  let s = P(`M${r(x - 3)},${r(y - 4)} L${r(x + w + 3)},${r(y - 4)} L${r(x + w + 3)},${r(y)} L${r(x - 3)},${r(y)} Z`, mix(frame, "#8c8a90", 0.3), { s: INK, w: sw });   // lintel
  const glass = lit ? A.lin([[0, "#ffe9a8"], [0.6, "#f2c46b"], [1, "#c98a3e"]], 0, 0, 0, 1) : A.lin([[0, "#2c3a5e"], [1, "#151c30"]], 0, 0, 0, 1);
  s += P(`M${r(x)},${r(y)} L${r(x + w)},${r(y)} L${r(x + w)},${r(y + h)} L${r(x)},${r(y + h)} Z`, glass);
  if (lit && curtain) {
    s += P(`M${r(x)},${r(y)} L${r(x + w * 0.24)},${r(y)} Q${r(x + w * 0.12)},${r(y + h * 0.6)} ${r(x + w * 0.2)},${r(y + h)} L${r(x)},${r(y + h)} Z`, curtain);
    s += P(`M${r(x + w)},${r(y)} L${r(x + w * 0.76)},${r(y)} Q${r(x + w * 0.88)},${r(y + h * 0.6)} ${r(x + w * 0.8)},${r(y + h)} L${r(x + w)},${r(y + h)} Z`, curtain);
  }
  if (!lit) s += S(`M${r(x + w * 0.2)},${r(y + h * 0.15)} L${r(x + w * 0.35)},${r(y + h * 0.05)}`, "#8a9cc4", 1, 0.5);
  s += S(`M${r(x + w / 2)},${r(y)} L${r(x + w / 2)},${r(y + h)} M${r(x)},${r(y + h / 2)} L${r(x + w)},${r(y + h / 2)}`, frame, sw * 1.4);
  s += P(`M${r(x)},${r(y)} L${r(x + w)},${r(y)} L${r(x + w)},${r(y + h)} L${r(x)},${r(y + h)} Z`, "none", { s: INK, w: sw * 1.3 });
  s += P(`M${r(x - 2)},${r(y + h)} L${r(x + w + 2)},${r(y + h)} L${r(x + w + 3)},${r(y + h + 3)} L${r(x - 3)},${r(y + h + 3)} Z`, mix(frame, "#8c8a90", 0.3), { s: INK, w: sw * 0.9 });   // sill
  return s;
}

/** A row of slates on a roof band (x0..x1, y top..bottom). */
function slates(A, x0, x1, y0, y1, col = FAC.slate) {
  let s = P(poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]), A.lin([[0, lt(col, 0.08)], [1, dk(col, 0.25)]], 0, 0, 0, 1), { s: INK, w: 1.4 });
  let d = "";
  for (let yy = y0 + 6; yy < y1 - 2; yy += 6) d += `M${r(x0)},${r(yy)} L${r(x1)},${r(yy)}`;
  s += S(d, FAC.slateHi, 0.8, 0.6);
  return s;
}

/** Brick texture over a facade rectangle (soft courses, at the house's scale). */
function bricks(A, x0, y0, x1, y1, scale) {
  const ch = 7.5 * scale / 0.31;   // brick course height, in screen units
  const id = A.pattern(S(`M0,${r(ch)} L${r(ch * 6)},${r(ch)} M${r(ch * 1.5)},0 L${r(ch * 1.5)},${r(ch)} M${r(ch * 4.5)},${r(ch)} L${r(ch * 4.5)},${r(ch * 2)}`, "#3a221d", 0.6, 0.35), r(ch * 6), r(ch * 2));
  return P(poly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]]), id);
}

/**
 * The Lantern House front (the design in vignettes.mjs: red brick, a white bay window with
 * red curtains, a slate-blue door with a gold fanlight, the lamp on a curled iron bracket, two
 * sash windows with violet and green curtains, a slate roof with a small gable round window
 * and a brick chimney with two pots on the right). x0 = left party wall, base = floor level,
 * k = screen units per cm. Returns the parts and the lamp's position.
 */
function lanternHouse(A, x0, base, k, o = {}) {
  const W = 500 * k, g = 290 * k, f1 = 280 * k, x1 = x0 + W;
  const yG = base - g, yF = yG - f1, yE = yF - 8 * k * 2;
  let s = "";
  // roof, chimney and dormer behind the cornice
  const roofTop = yE - 175 * k;
  const chx = x1 - 70 * k, chw = 50 * k, cht = roofTop - 70 * k;
  s += P(poly([[chx, roofTop + 20 * k], [chx, cht], [chx + chw, cht], [chx + chw, roofTop + 20 * k]]), A.lin([[0, FAC.brick], [1, FAC.brickDk]], 0, 0, 1, 0), { s: INK, w: 1.4 });
  s += P(poly([[chx - 4 * k, cht], [chx + chw + 4 * k, cht], [chx + chw + 4 * k, cht - 10 * k], [chx - 4 * k, cht - 10 * k]]), FAC.stone, { s: INK, w: 1.2 });
  const pots = [chx + chw * 0.28, chx + chw * 0.72];
  for (const px of pots) s += P(poly([[px - 7 * k, cht - 10 * k], [px + 7 * k, cht - 10 * k], [px + 5.5 * k, cht - 34 * k], [px - 5.5 * k, cht - 34 * k]]), "#b8643c", { s: INK, w: 1.2 });
  s += slates(A, x0 - 4 * k, x1 + 4 * k, roofTop, yE);
  // dormer gable with the round window
  const dw = 150 * k, dx = x0 + W / 2 - dw / 2, dTop = roofTop - 70 * k, dBase = yE + 2;
  s += P(poly([[dx - 8 * k, dTop + 62 * k], [dx + dw / 2, dTop - 8 * k], [dx + dw + 8 * k, dTop + 62 * k]]), FAC.slate, { s: INK, w: 1.4 });
  s += P(poly([[dx, dBase], [dx, dTop + 58 * k], [dx + dw / 2, dTop + 2 * k], [dx + dw, dTop + 58 * k], [dx + dw, dBase]]), A.lin([[0, "#f1e8d6"], [1, "#c9bfae"]], 0, 0, 0, 1), { s: INK, w: 1.4 });
  const rx = dx + dw / 2, ry = dTop + 90 * k, rr = 38 * k;
  s += C(rx, ry, rr + 6 * k, "#7a6a58", { s: INK, w: 1.3 });
  s += C(rx, ry, rr, A.rad([[0, "#ffeab0"], [1, "#e8a84a"]]), { s: INK, w: 1 });
  s += S(`M${r(rx - rr)},${r(ry)} L${r(rx + rr)},${r(ry)} M${r(rx)},${r(ry - rr)} L${r(rx)},${r(ry + rr)}`, "#7a6a58", 1.6);
  // the brick front
  s += P(poly([[x0, base + 30 * k], [x0, yE], [x1, yE], [x1, base + 30 * k]]), A.lin([[0, mix(FAC.brick, "#c98a5a", 0.12)], [1, FAC.brickDk]], 0, 1, 0, 0), { s: INK, w: 1.4 });
  s += bricks(A, x0, yE, x1, base + 30 * k, k);
  s += P(poly([[x0 - 4 * k, yE], [x1 + 4 * k, yE], [x1 + 4 * k, yE - 12 * k], [x0 - 4 * k, yE - 12 * k]]), FAC.stone, { s: INK, w: 1.2 });   // cornice
  // first floor: violet and green curtains (the coven's colours, as in the other pictures)
  const ww = 105 * k, wh = 165 * k, wy = yF + 55 * k;
  s += sash(A, x0 + 75 * k, wy, ww, wh, { lit: true, curtain: "#8a6ad0" });
  s += sash(A, x1 - 75 * k - ww, wy, ww, wh, { lit: true, curtain: "#4f9a6a" });
  // ground floor: bay window (left), door (right)
  const bx = x0 + 40 * k, bw = 220 * k, by = yG + 40 * k;
  s += P(poly([[bx - 6 * k, by - 18 * k], [bx + bw + 6 * k, by - 18 * k], [bx + bw - 12 * k, by - 40 * k], [bx + 12 * k, by - 40 * k]]), FAC.slate, { s: INK, w: 1.2 });   // bay roof
  s += P(poly([[bx, by - 18 * k], [bx + bw, by - 18 * k], [bx + bw, base], [bx, base]]), "#efe7d6", { s: INK, w: 1.3 });
  const pane = (px, pw, cur) => {
    let t = P(poly([[px, by], [px + pw, by], [px + pw, base - 70 * k], [px, base - 70 * k]]), A.lin([[0, "#ffe9a8"], [0.6, "#f2c46b"], [1, "#c98a3e"]], 0, 0, 0, 1), { s: INK, w: 1 });
    if (cur) t += P(poly([[px, by], [px + pw * 0.3, by], [px + pw * 0.2, base - 70 * k], [px, base - 70 * k]]), "#c0503a") + P(poly([[px + pw, by], [px + pw * 0.7, by], [px + pw * 0.8, base - 70 * k], [px + pw, base - 70 * k]]), "#c0503a");
    return t + S(`M${r(px)},${r(by + (base - 70 * k - by) * 0.45)} L${r(px + pw)},${r(by + (base - 70 * k - by) * 0.45)}`, "#efe7d6", 1.2);
  };
  s += pane(bx + 12 * k, 40 * k) + pane(bx + 62 * k, 96 * k, true) + pane(bx + 168 * k, 40 * k);
  s += P(poly([[bx - 4 * k, base - 70 * k], [bx + bw + 4 * k, base - 70 * k], [bx + bw + 4 * k, base - 58 * k], [bx - 4 * k, base - 58 * k]]), FAC.stone, { s: INK, w: 1 });
  // the door: slate blue, two panels, brass letterbox and knob, gold fanlight, stone step
  const dW = 100 * k, dX = x1 - 50 * k - dW, dH = 205 * k, dY = base - dH;
  s += P(`M${r(dX - 8 * k)},${r(base)} L${r(dX - 8 * k)},${r(dY)} A${r(dW / 2 + 8 * k)},${r(dW / 2 + 8 * k)} 0 0 1 ${r(dX + dW + 8 * k)},${r(dY)} L${r(dX + dW + 8 * k)},${r(base)} Z`, FAC.stone, { s: INK, w: 1.2 });
  s += P(`M${r(dX)},${r(dY)} A${r(dW / 2)},${r(dW / 2)} 0 0 1 ${r(dX + dW)},${r(dY)} Z`, A.rad([[0, "#fff1c4"], [1, "#f0b850"]], 0.5, 1, 0.9), { s: INK, w: 1 });
  let rays = "";
  for (const a of [30, 60, 90, 120, 150]) { const t = a * Math.PI / 180; rays += `M${r(dX + dW / 2)},${r(dY)} L${r(dX + dW / 2 - Math.cos(t) * dW / 2)},${r(dY - Math.sin(t) * dW / 2)}`; }
  s += S(rays, "#9a7a3a", 1);
  s += P(poly([[dX, dY], [dX + dW, dY], [dX + dW, base], [dX, base]]), A.lin([[0, "#4a6488"], [1, "#2c3d58"]], 0, 0, 1, 1), { s: INK, w: 1.3 });
  s += P(poly([[dX + 18 * k, dY + 18 * k], [dX + dW - 18 * k, dY + 18 * k], [dX + dW - 18 * k, dY + 90 * k], [dX + 18 * k, dY + 90 * k]]), "none", { s: "#22324a", w: 1 }) +
    P(poly([[dX + 18 * k, dY + 110 * k], [dX + dW - 18 * k, dY + 110 * k], [dX + dW - 18 * k, base - 16 * k], [dX + 18 * k, base - 16 * k]]), "none", { s: "#22324a", w: 1 });
  s += P(poly([[dX + 36 * k, dY + 98 * k], [dX + 64 * k, dY + 98 * k], [dX + 64 * k, dY + 104 * k], [dX + 36 * k, dY + 104 * k]]), "#d9b55a", { s: INK, w: 0.8 });
  s += C(dX + dW - 22 * k, dY + 112 * k, 4.5 * k, "#d9b55a", { s: INK, w: 0.8 });
  s += P(poly([[dX - 14 * k, base], [dX + dW + 14 * k, base], [dX + dW + 18 * k, base + 18 * k], [dX - 18 * k, base + 18 * k]]), "#a89e8c", { s: INK, w: 1.1 });   // doorstep
  // the lamp: an iron bracket on the wall right of the door, the lantern hanging over the door's top corner
  const lx = dX + dW - 4 * k, bracketX = dX + dW + 34 * k, ly = dY - 52 * k;
  s += P(poly([[bracketX - 4 * k, ly - 34 * k], [bracketX + 6 * k, ly - 34 * k], [bracketX + 6 * k, ly + 6 * k], [bracketX - 4 * k, ly + 6 * k]]), "#1b1a1f", { s: INK, w: 0.8 });   // wall plate
  s += S(`M${r(bracketX)},${r(ly - 20 * k)} L${r(lx)},${r(ly - 20 * k)}`, "#1b1a1f", 3.2 * k / 0.31) +
    S(`M${r(bracketX)},${r(ly)} Q${r(bracketX - 26 * k)},${r(ly - 2 * k)} ${r(bracketX - 30 * k)},${r(ly - 18 * k)} Q${r(bracketX - 32 * k)},${r(ly - 30 * k)} ${r(bracketX - 20 * k)},${r(ly - 28 * k)}`, "#1b1a1f", 2.2 * k / 0.31);   // arm and its curl
  s += S(`M${r(lx)},${r(ly - 20 * k)} L${r(lx)},${r(ly - 8 * k)}`, "#1b1a1f", 1.4 * k / 0.31);   // hook and ring
  const L = lamp(A, lx, ly - 8 * k, k);
  return { s, lamp: L, door: [dX, dW, dY, base], x1, yG, yF, yE, roofTop, chimney: [chx, chw, cht - 34 * k, pots] };
}

/** The lantern hanging from (x, top): cap, glowing glass, brass frame, finial. Returns {s, glow:[x,y]}. */
function lamp(A, x, top, k, wk = k / 0.31) {
  const w = 34 * k, h = 52 * k, cy = top + 12 * k + h / 2;
  let s = C(x, cy, 26 * k * 4, A.rad([[0, "#ffd98a", 0.55], [0.35, "#ffc35a", 0.18], [1, "#ffc35a", 0]]));
  s += C(x, top - 1 * k, 3 * k, "none", { s: "#1b1a1f", w: 1.2 * wk });   // the ring on the hook
  s += P(poly([[x - w * 0.62, top + 12 * k], [x, top], [x + w * 0.62, top + 12 * k]]), "#1b1a1f", { s: INK, w: 1 });
  s += P(poly([[x - w / 2, top + 12 * k], [x + w / 2, top + 12 * k], [x + w * 0.42, top + 12 * k + h], [x - w * 0.42, top + 12 * k + h]]), A.rad([[0, "#fffbe6"], [0.6, "#ffe08a"], [1, "#f2b84a"]]), { s: NIGHT.brass, w: 1.4 * wk });
  s += S(`M${r(x)},${r(top + 12 * k)} L${r(x)},${r(top + 12 * k + h)}`, NIGHT.brass, 1 * wk);
  s += P(poly([[x - w * 0.46, top + 12 * k + h], [x + w * 0.46, top + 12 * k + h], [x + w * 0.2, top + 20 * k + h], [x - w * 0.2, top + 20 * k + h]]), "#1b1a1f", { s: INK, w: 0.8 });
  return { s, glow: [x, cy] };
}

/** A plain terraced house front (neighbours): brick or render, sash windows, a roof band. */
function terrace(A, x0, x1, base, k, o = {}) {
  const { floors = 2, col = "#4a4f68", lit = [], roof = true, door, arch, chimney, dormer } = o;
  const g = 290 * k, f = 280 * k;
  const yTop = base - g - f * (floors - 1) - 16 * k;
  let s = "";
  if (roof) {
    const rt = yTop - 150 * k;
    if (chimney) { const cx = chimney; s += P(poly([[cx, rt + 10 * k], [cx, rt - 60 * k], [cx + 46 * k, rt - 60 * k], [cx + 46 * k, rt + 10 * k]]), dk(col, 0.25), { s: INK, w: 1.2 }) + P(poly([[cx - 4 * k, rt - 60 * k], [cx + 50 * k, rt - 60 * k], [cx + 50 * k, rt - 70 * k], [cx - 4 * k, rt - 70 * k]]), dk(col, 0.1), { s: INK, w: 1 }); }
    s += slates(A, x0 - 3 * k, x1 + 3 * k, rt, yTop, o.roofCol ?? FAC.slate);
    if (dormer) { const dx = dormer, dw = 120 * k; s += P(poly([[dx, yTop], [dx, rt + 20 * k], [dx + dw / 2, rt - 18 * k], [dx + dw, rt + 20 * k], [dx + dw, yTop]]), dk(col, 0.15), { s: INK, w: 1.2 }) + sash(A, dx + 25 * k, rt + 24 * k, dw - 50 * k, 70 * k, { lit: lit.includes("d"), sw: 1 }); }
  }
  s += P(poly([[x0, base + 30 * k], [x0, yTop], [x1, yTop], [x1, base + 30 * k]]), A.lin([[0, lt(col, 0.06)], [1, dk(col, 0.3)]], 0, 0, 0, 1), { s: INK, w: 1.3 });
  if (o.brick) s += bricks(A, x0, yTop, x1, base + 30 * k, k);
  s += P(poly([[x0 - 3 * k, yTop], [x1 + 3 * k, yTop], [x1 + 3 * k, yTop + 10 * k], [x0 - 3 * k, yTop + 10 * k]]), lt(col, 0.18), { s: INK, w: 1 });
  const ww = 100 * k, wh = 160 * k, W = x1 - x0;
  const n = Math.max(1, Math.round(W / (230 * k)));
  for (let fl = 1; fl < floors; fl++) {
    const wy = base - g - f * fl + 55 * k;
    for (let i = 0; i < n; i++) { const wx = x0 + W * (i + 0.5) / n - ww / 2; s += sash(A, wx, wy, ww, wh, { lit: lit.includes(`${fl}${i}`), curtain: o.curtain, sw: 1.1 }); }
  }
  for (let i = 0; i < n; i++) {
    const wx = x0 + W * (i + 0.5) / n - ww / 2;
    if (door === i || arch === i) continue;
    s += sash(A, wx, base - g + 50 * k, ww, wh, { lit: lit.includes(`0${i}`), curtain: o.curtain, sw: 1.1 });
  }
  if (door != null) { const dx = x0 + W * (door + 0.5) / n - 50 * k; s += P(poly([[dx, base], [dx, base - 205 * k], [dx + 100 * k, base - 205 * k], [dx + 100 * k, base]]), "#4a3a36", { s: INK, w: 1.1 }) + C(dx + 80 * k, base - 100 * k, 4 * k, "#c9a45a"); }
  return { s, yTop };
}

/** Cobbled street from the kerb line (depth scale k0) down to the bottom edge, rows getting larger towards the viewer. */
function cobbles(A, w, h, horizon, kerbY, slope, cx) {
  const gy = (x, Y) => Y - slope * (x - cx);
  let s = P(poly([[0, gy(0, kerbY)], [w, gy(w, kerbY)], [w, h], [0, h]]), A.lin([[0, "#2a3048"], [0.5, "#20263a"], [1, "#11141f"]], 0, 0, 0, 1));
  let d = "", hi = "";
  const rnd = rng(17);
  // row depth in cm from the camera, stepping 14 cm; screen y of a row = horizon + 150 * f / dist
  const f = (kerbY - horizon) / 150 * 840;   // the kerb is 840 cm away
  for (let dist = 840, row = 0; ; dist -= 14 * Math.max(1, dist / 600), row++) {
    const yy = horizon + (150 * (f / dist));
    if (yy > h + 10) break;
    const sc = (yy - horizon) / 150;   // units per cm here
    const next = horizon + 150 * f / (dist - 14 * Math.max(1, dist / 600));
    const rh = next - yy;
    d += `M0,${r(gy(0, yy))} L${w},${r(gy(w, yy))}`;
    const cw = 20 * sc * Math.max(1, dist / 600), off = (row % 2) * cw / 2 + rnd() * cw * 0.3;
    for (let x = -off; x < w; x += cw) { d += `M${r(x)},${r(gy(x, yy))} L${r(x)},${r(gy(x, yy) + rh)}`; if (rh > 3) hi += `M${r(x + cw * 0.18)},${r(gy(x, yy) + rh * 0.3)} L${r(x + cw * 0.7)},${r(gy(x + cw * 0.5, yy) + rh * 0.3)}`; }
  }
  s += S(d, "#0b0e17", 0.9, 0.85) + S(hi, "#56607e", 0.8, 0.45);
  return s;
}

/** A small black rook seen from the side, facing left, standing on (x, y), `len` units long. Same bird as the portrait (pale bare skin at the beak base). */
function rookPerched(A, x, y, len) {
  const k = len / 100;
  // drawn in a 100-unit box: feet at (52, 0), beak tip to the left
  const T = (px, py) => [x + (px - 52) * k, y + py * k];
  const pts = arr => arr.map(([a, b, c]) => { const [u, v] = T(a, b); return c ? [u, v, 1] : [u, v]; });
  let s = "";
  s += P(smooth(pts([[30, -46], [44, -62], [66, -62], [86, -50], [100, -36, 1], [96, -30], [70, -22], [46, -18], [30, -26]])), "#16141a", { s: INK, w: 1 });   // body and tail
  s += P(smooth(pts([[46, -54], [70, -56], [92, -40], [70, -32], [50, -36]])), "#24212c", { s: INK, w: 0.8 });   // wing
  s += P(smooth(pts([[24, -60], [30, -72], [42, -74], [48, -64], [44, -50], [30, -48]])), "#16141a", { s: INK, w: 1 });   // head
  s += P(poly(pts([[26, -66], [6, -60], [26, -58]])), "#4a4a52", { s: INK, w: 0.8 });   // beak
  s += P(smooth(pts([[24, -68], [30, -66], [30, -58], [24, -56]])), "#d8d1c6", { s: INK, w: 0.6 });   // bare pale skin at the beak base
  s += C(...T(35, -66), 1.4 * k * 3, "#2a1d16");
  s += S(`M${r(T(48, -20)[0])},${r(T(48, -20)[1])} L${r(T(50, 0)[0])},${r(T(50, 0)[1])} M${r(T(56, -20)[0])},${r(T(56, -20)[1])} L${r(T(58, 0)[0])},${r(T(58, 0)[1])}`, "#3a3a40", 1.2);
  return s;
}

/** The Quiet Man, small, in the dark of an archway: grey suit, trilby, no face to see, the radio valve's faint amber glow. */
function quietManSmall(A, x, feet, h) {
  const k = h / 180;   // drawn in cm, 180 tall
  const T = (px, py) => `${r(x + px * k)},${r(feet + py * k)}`;
  let s = E(x, feet, 26 * k, 5 * k, "#000", { op: 0.4 });
  s += P(`M${T(-20, 0)} L${T(-17, -80)} L${T(-27, -138)} L${T(-20, -150)} L${T(20, -150)} L${T(27, -138)} L${T(17, -80)} L${T(20, 0)} Z`, "#6a6b72", { s: INK, w: 1 });   // suit
  s += P(`M${T(-2, 0)} L${T(0, -76)} L${T(2, 0)} Z`, "#2a2a30");
  s += P(`M${T(-6, -150)} L${T(0, -128)} L${T(6, -150)} Z`, "#e6e4df") + P(`M${T(-1.5, -146)} L${T(1.5, -146)} L${T(1, -128)} L${T(-1, -128)} Z`, "#22222a");
  s += P(`M${T(-26, -138)} L${T(-30, -86)} L${T(-24, -84)} L${T(-20, -134)} Z M${T(26, -138)} L${T(30, -86)} L${T(24, -84)} L${T(20, -134)} Z`, "#5e5f66", { s: INK, w: 0.8 });   // arms
  s += C(+T(-27, -82).split(",")[0], +T(-27, -82).split(",")[1], 3.4 * k, "#a9a7a2") + C(+T(27, -82).split(",")[0], +T(27, -82).split(",")[1], 3.4 * k, "#a9a7a2");   // hands
  s += E(x, feet - 160 * k, 9 * k, 11 * k, "#9d9b96", { s: INK, w: 0.8 });   // head, no face
  s += E(x, feet - 163 * k, 9 * k, 7 * k, "#14141a", { op: 0.75 });   // shadow under the brim
  s += E(x, feet - 170 * k, 17 * k, 3.4 * k, "#34343b", { s: INK, w: 0.8 }) + P(`M${T(-9, -170)} L${T(-8, -183)} L${T(0, -180)} L${T(8, -183)} L${T(9, -170)} Z`, "#3c3c43", { s: INK, w: 0.8 });   // trilby
  s += C(x + 12 * k, feet - 128 * k, 9 * k, A.rad([[0, "#ffc35a", 0.8], [1, "#ffc35a", 0]])) + C(x + 12 * k, feet - 128 * k, 1.8 * k, "#ffd27a");   // the valve in his pocket
  return s;
}

/** The old radio tower: a tapering steel lattice mast on the hill, with faint rings round its top (it is sending again). */
function radioTower(A, x, base, h) {
  const top = base - h, wb = h * 0.16, wt = h * 0.02;
  const at = t => [lerp([x - wb, base], [x - wt, top], t), lerp([x + wb, base], [x + wt, top], t)];
  let d = `M${r(x - wb)},${r(base)} L${r(x - wt)},${r(top)} M${r(x + wb)},${r(base)} L${r(x + wt)},${r(top)}`;
  for (let i = 0; i < 9; i++) {
    const [a0, b0] = at(i / 9), [a1, b1] = at((i + 1) / 9);
    d += `M${r(a0[0])},${r(a0[1])} L${r(b1[0])},${r(b1[1])} M${r(b0[0])},${r(b0[1])} L${r(a1[0])},${r(a1[1])} M${r(a1[0])},${r(a1[1])} L${r(b1[0])},${r(b1[1])}`;
  }
  let s = S(d, "#0c0f1a", 1.1);
  s += S(`M${r(x)},${r(top)} L${r(x)},${r(top - h * 0.1)}`, "#0c0f1a", 1.1);
  for (const [rr, op] of [[10, 0.55], [18, 0.35], [27, 0.2]]) s += P(`M${r(x - rr)},${r(top - h * 0.1 + rr * 0.15)} A${rr},${rr} 0 0 1 ${r(x + rr)},${r(top - h * 0.1 + rr * 0.15)}`, "none", { s: NIGHT.danger, w: 1.2, op });
  s += C(x, top - h * 0.1, 1.8, "#e8857a");
  return s;
}

// ---------------------------------------------------------------- the cover

function cover() {
  const A = new Art();
  const W = 612, Hh = 792, HOR = 445, SL = 0.05, CXs = 306;
  const gy = (x, y0) => y0 - SL * (x - CXs);                // a ground line through (306, y0), rising to the right
  const kH = 0.31;                                           // houses: screen units per cm
  const base0 = HOR + 150 * kH;                             // house fronts' foot at x = 306
  let s = sky(A, W, Hh, HOR, [313, 203, 18]);
  // the Heights: a dark hill rising to the right behind the roofs, its big houses' lit windows, and the old radio tower on top
  const ridge = [[300, 312], [380, 290], [460, 258], [540, 228], [612, 212], [640, 210]];
  const ridgeY = x => { for (let i = 0; i < ridge.length - 1; i++) { const [a, b] = [ridge[i], ridge[i + 1]]; if (x <= b[0]) return a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0]); } return 210; };
  s += P(smooth([...ridge, [640, 420, 1], [300, 420, 1]]), A.lin([[0, "#121a2e"], [1, "#0c111d"]], 0, 0, 0, 1));
  s += S(smooth(ridge, false), "#2e3a5e", 1.2, 0.9);
  for (const [hx, hw, hh] of [[452, 22, 12], [486, 26, 14], [584, 24, 13]]) {   // big houses behind their hedges
    const hy = ridgeY(hx + hw / 2) + 6;
    s += P(poly([[hx, hy], [hx, hy - hh], [hx + hw / 2, hy - hh - 8], [hx + hw, hy - hh], [hx + hw, hy]]), "#161d33", { s: "#0a0d16", w: 0.8 });
    s += P(poly([[hx + 4, hy - hh + 4], [hx + 8, hy - hh + 4], [hx + 8, hy - hh + 7.5], [hx + 4, hy - hh + 7.5]]), "#f2c46b", { op: 0.85 }) + P(poly([[hx + hw - 9, hy - hh + 4], [hx + hw - 5, hy - hh + 4], [hx + hw - 5, hy - hh + 7.5], [hx + hw - 9, hy - hh + 7.5]]), "#f2c46b", { op: 0.6 });
    s += E(hx + hw / 2, hy + 1, hw * 0.8, 4, "#0e1a1a");   // hedge
  }
  s += radioTower(A, 548, ridgeY(548) + 1, 64);
  // houses: the left neighbour (downhill), the Lantern House, the right neighbour (uphill) with an archway
  const lhX0 = 166, lhBase = gy(lhX0 + 155, base0) - 2;
  const LH = lanternHouse(A, lhX0, lhBase, kH);
  const left = terrace(A, -20, lhX0, gy(lhX0, base0) + 1, kH, { floors: 2, col: "#525873", lit: ["10", "02"], curtain: "#b88a5a", chimney: 40, dormer: 60 });
  const right = terrace(A, LH.x1, 640, gy(640, base0) - 4, kH, { floors: 2, col: "#4b5068", lit: ["11", "00"], brick: false, chimney: 470, arch: 1, roofCol: "#262c3e" });
  s += left.s + right.s + LH.s;
  // the archway (a close running up the hill) in the right neighbour, with the Quiet Man inside
  const aw = 46, ax = 546, aBase = gy(ax + aw / 2, base0) - 4, aTop = aBase - 82;
  s += P(`M${ax - 5},${r(aBase)} L${ax - 5},${r(aTop + aw / 2)} A${aw / 2 + 5},${aw / 2 + 5} 0 0 1 ${ax + aw + 5},${r(aTop + aw / 2)} L${ax + aw + 5},${r(aBase)} Z`, "#8a8478", { s: INK, w: 1.2 });
  const archD = `M${ax},${r(aBase)} L${ax},${r(aTop + aw / 2)} A${aw / 2},${aw / 2} 0 0 1 ${ax + aw},${r(aTop + aw / 2)} L${ax + aw},${r(aBase)} Z`;
  let inside = P(archD, A.lin([[0, "#0a0d16"], [1, "#111624"]], 0, 0, 0, 1));
  inside += P(poly([[ax + 12, aBase - 52], [ax + aw - 12, aBase - 52], [ax + aw - 12, aBase - 28], [ax + 12, aBase - 28]]), A.lin([[0, "#5d6e70"], [1, "#2a3436"]], 0, 0, 0, 1), { op: 0.8 });   // the far end, lit cold
  for (let i = 0; i < 4; i++) inside += S(`M${ax + 10 - i * 3},${r(aBase - 28 + i * 7)} L${ax + aw - 10 + i * 3},${r(aBase - 28 + i * 7)}`, "#3a4648", 1, 0.8);   // steps climbing away
  inside += C(ax + aw / 2, aBase - 58, 14, A.rad([[0, "#cfe0d8", 0.45], [1, "#cfe0d8", 0]])) + C(ax + aw / 2, aBase - 60, 1.8, "#e6f0ea");   // a dim lamp at the far end
  inside += quietManSmall(A, ax + aw / 2, aBase - 30, 34);
  s += G(inside, { clip: A.clip(archD) }) + P(archD, "none", { s: INK, w: 1.2 });
  // pavement and kerb along the house fronts
  const kerbY0 = HOR + 150 * (kH * 1000 / 840);              // the kerb is 840 cm from the camera (the fronts 1000 cm)
  s += P(poly([[0, gy(0, base0)], [W, gy(W, base0)], [W, gy(W, kerbY0)], [0, gy(0, kerbY0)]]), A.lin([[0, "#4a4f62"], [1, "#363b4e"]], 0, 0, 0, 1));
  s += P(poly([[0, gy(0, kerbY0)], [W, gy(W, kerbY0)], [W, gy(W, kerbY0) + 4], [0, gy(0, kerbY0) + 4]]), "#6a6e7c", { s: INK, w: 0.8 });
  s += cobbles(A, W, Hh, HOR, kerbY0 + 4, SL, CXs);
  // the lamp: its light on the street, then the lantern itself
  const [lx, ly] = LH.lamp.glow;
  s += E(lx - 10, gy(lx, 600), 260, 120, A.rad([[0, "#ffcf7a", 0.32], [0.5, "#ffb84a", 0.12], [1, "#ffb84a", 0]]));
  s += LH.lamp.s;
  // Rook, in rook shape, on the chimney pot, against the moon
  const [chx, chw, potTop, pots] = LH.chimney;
  s += rookPerched(A, pots[1], potTop, 17);
  // the coven, back to front: [body, x, y0 (feet before the slope), cm]
  const cast = [
    [marcoBody, 82, 690, 172, 2], [noorBody, 518, 690, 165, 3], [tessBody, 150, 697, 174, 2], [danaBody, 452, 697, 180, 2.5],
    [juneBody, 216, 706, 155, 2.5], [quinnBody, 382, 704, 182, 3],
  ];
  const figs = cast.map(([fn, x, y0, cm, look]) => ({ fn, x, ys: gy(x, y0), cm, look })).sort((a, b) => a.ys - b.ys);
  // lamp shadows on the cobbles, falling away from the lamp, then the people
  for (const f of figs) {
    const dx = f.x - lx, dy = f.ys - (ly + 80), a = Math.atan2(dx, dy) * 180 / Math.PI;
    s += E(f.x, f.ys + 36, 26, 52, A.lin([[0, "#05070c", 0.5], [1, "#05070c", 0]], 0, 0, 0, 1), { tf: `rotate(${r(-a)} ${r(f.x)} ${r(f.ys)})` });
  }
  for (const f of figs) s += place({ N: { [danaBody.name]: 7.3, [marcoBody.name]: 6.8, [juneBody.name]: 6.3, [quinnBody.name]: 7.5, [tessBody.name]: 7.0, [noorBody.name]: 6.8 }[f.fn.name], draw: () => f.fn(A, f.look) }, f.x, f.ys, f.cm, HOR, 2);
  // warm light from the lamp over the whole street, and night at the edges
  s += tag("rect", { x: 0, y: 0, width: W, height: Hh, fill: A.rad([[0, "#ffcf7a", 0.1], [0.4, "#ffcf7a", 0.03], [1, "#ffcf7a", 0]], lx / W, ly / Hh, 0.6) });
  s += tag("rect", { x: 0, y: 0, width: W, height: Hh, fill: A.rad([[0, "#000000", 0], [0.7, "#000000", 0], [1, "#05070c", 0.45]], 0.5, 0.55, 0.75) });
  return ["0 0 612 792", "The coven at night in an Old Town street, under the lamp of the Lantern House: Marco with a flame over his raised hand, Tess, June with her notebook, Quinn, Dana and Noor with a potion; Rook as a rook on the chimney against the moon; up the hill, the old radio tower; in a dark archway, a man in a grey suit and hat watching", A.out() + s];
}

// ---------------------------------------------------------------- the back cover

function backCover() {
  const A = new Art();
  const W = 800, Hh = 600;
  const k = 2.1;                        // the house front: screen units per cm
  const stepTop = 560;                  // Rook stands on the doorstep, 18 cm above the street
  const HOR = stepTop - 132 * k;        // the eye 150 cm above the street, so 132 cm above the step
  const VPX = 400;
  const dX = 300, dW = 95 * k, dH = 210 * k, dY = stepTop - dH, dR = dX + dW;   // the doorway
  let s = "";
  // ---- the hall, seen through the open door (lit, warm). Depth scale at d cm inside: k * 250 / (250 + d).
  const kd = d => k * 250 / (250 + d);
  const fy = d => HOR + 132 * kd(d);                        // floor line at depth d
  const wx = (d, side) => VPX + side * 55 * kd(d);          // hall walls, 110 cm apart
  const back = 350, cy = d => fy(d) - 262 * kd(d);          // back wall, ceiling
  let hall = P(poly([[wx(0, -1) - 60, dY - 40], [wx(0, 1) + 60, dY - 40], [wx(0, 1) + 60, stepTop], [wx(0, -1) - 60, stepTop]]), "#5a3a2a");
  hall += P(poly([[wx(back, -1), cy(back)], [wx(back, 1), cy(back)], [wx(back, 1), fy(back)], [wx(back, -1), fy(back)]]), A.lin([[0, "#f6dca2"], [1, "#d9a85e"]], 0, 0, 0, 1));   // back wall
  hall += P(poly([[wx(0, -1), dY - 40], [wx(back, -1), cy(back)], [wx(back, -1), fy(back)], [wx(0, -1), stepTop]]), A.lin([[0, "#c98a4a"], [1, "#e8bb72"]], 0, 0, 1, 0));   // left wall
  hall += P(poly([[wx(0, 1), dY - 40], [wx(back, 1), cy(back)], [wx(back, 1), fy(back)], [wx(0, 1), stepTop]]), A.lin([[0, "#e8bb72"], [1, "#b97a3e"]], 0, 0, 1, 0));    // right wall
  hall += P(poly([[wx(0, -1), stepTop], [wx(back, -1), fy(back)], [wx(back, 1), fy(back)], [wx(0, 1), stepTop]]), A.lin([[0, "#8a5a3a"], [1, "#5e3a26"]], 0, 0, 0, 1));   // floorboards
  for (const t of [-0.6, -0.2, 0.2, 0.6]) hall += S(`M${r(VPX + t * 55 * kd(0))},${stepTop} L${r(VPX + t * 55 * kd(back))},${r(fy(back))}`, "#4a2e1e", 1.2, 0.6);
  hall += P(poly([[VPX - 30 * kd(20), fy(20)], [VPX + 30 * kd(20), fy(20)], [VPX + 30 * kd(300), fy(300)], [VPX - 30 * kd(300), fy(300)]]), "#7a2e3a", { op: 0.85 });   // a runner rug
  // stairs going up along the right wall. No newel post or handrail: the stair's open side is behind Rook,
  // and a post there stood 6 cm from the coat stand's pole, so the stand read as having two poles and a leaning stick.
  for (let i = 0; i < 8; i++) {
    const d0 = 120 + i * 26, rise = 19 * (i + 1);
    const yy = fy(d0) - rise * kd(d0), x0 = wx(d0, 1) - 80 * kd(d0);
    hall += P(poly([[x0, yy], [wx(d0, 1), yy], [wx(d0, 1), yy + 19 * kd(d0)], [x0, yy + 19 * kd(d0)]]), i % 2 ? "#a56a3e" : "#8f5a34", { s: "#4a2e1e", w: 0.8 });
  }
  // a hanging light in the hall
  const hx = VPX - 10, hTop = cy(200);
  hall += S(`M${hx},${r(hTop)} L${hx},${r(hTop + 40 * kd(200))}`, "#2a1a12", 1.4);
  hall += C(hx, hTop + 52 * kd(200), 60, A.rad([[0, "#fff1c4", 0.6], [1, "#fff1c4", 0]])) + P(`M${r(hx - 14)},${r(hTop + 40 * kd(200))} L${r(hx + 14)},${r(hTop + 40 * kd(200))} L${r(hx + 22)},${r(hTop + 58 * kd(200))} L${r(hx - 22)},${r(hTop + 58 * kd(200))} Z`, "#f6e2a8", { s: "#5a3a22", w: 1.2 });
  // the coat stand, left of the hall, as tall and as still as Rook: a pole on three feet, hooks at the top,
  // with a violet scarf and a yellow raincoat (June's: she sleeps here more nights than at home)
  const cd = 110, ck = kd(cd), cx = wx(cd, -1) + 22 * ck, cf = fy(cd), ctop = cf - 185 * ck;
  hall += E(cx, cf + 2, 30 * ck, 5 * ck, "#2a160c", { op: 0.5 });
  hall += S(`M${r(cx)},${r(cf - 30 * ck)} L${r(cx - 24 * ck)},${r(cf)} M${r(cx)},${r(cf - 30 * ck)} L${r(cx + 24 * ck)},${r(cf)} M${r(cx)},${r(cf - 30 * ck)} L${r(cx + 4 * ck)},${r(cf + 4 * ck)}`, "#3a2416", 3.4);
  hall += S(`M${r(cx)},${r(cf - 30 * ck)} L${r(cx)},${r(ctop)}`, "#4a2e1e", 4.2) + C(cx, ctop - 3, 4.5, "#4a2e1e");
  hall += S(`M${r(cx)},${r(ctop + 14 * ck)} q${r(-18 * ck)},${r(-2 * ck)} ${r(-20 * ck)},${r(-14 * ck)} M${r(cx)},${r(ctop + 14 * ck)} q${r(18 * ck)},${r(-2 * ck)} ${r(20 * ck)},${r(-14 * ck)}`, "#4a2e1e", 2.6);
  hall += P(smooth([[cx - 20 * ck, ctop + 2 * ck], [cx - 30 * ck, ctop + 30 * ck], [cx - 34 * ck, ctop + 100 * ck, 1], [cx - 8 * ck, ctop + 104 * ck, 1], [cx - 12 * ck, ctop + 30 * ck], [cx - 16 * ck, ctop + 4 * ck]]), "#f4c22f", { s: INK, w: 1.6 });   // the raincoat, on the left hook
  hall += S(`M${r(cx - 22 * ck)},${r(ctop + 40 * ck)} L${r(cx - 20 * ck)},${r(ctop + 96 * ck)}`, dk("#f4c22f", 0.3), 1.2);
  hall += P(poly([[cx + 16 * ck, ctop], [cx + 24 * ck, ctop], [cx + 26 * ck, ctop + 80 * ck], [cx + 18 * ck, ctop + 82 * ck]]), "#7b5bc4", { s: INK, w: 1.4 });   // the scarf, on the right hook
  hall += S(`M${r(cx + 18 * ck)},${r(ctop + 82 * ck)} l0,6 M${r(cx + 22 * ck)},${r(ctop + 82 * ck)} l0,6 M${r(cx + 26 * ck)},${r(ctop + 80 * ck)} l0,6`, "#7b5bc4", 1.4);
  // the door leaf, opened inwards against the left wall
  hall += P(poly([[dX, dY], [dX + 26, dY + 14], [dX + 26, stepTop - 6], [dX, stepTop]]), A.lin([[0, "#3c5478"], [1, "#2c3d58"]], 0, 0, 1, 0), { s: INK, w: 1.6 });
  hall += C(dX + 18, dY + dH * 0.55, 3.6, "#d9b55a", { s: INK, w: 0.8 });
  s += G(hall, { clip: A.clip(poly([[dX, dY], [dR, dY], [dR, stepTop], [dX, stepTop]])) });
  // ---- the brick front around the door (as on the cover: red brick, white bay window, stone door surround)
  const brickD = `M0,0 H${W} V${Hh} H0 Z M${dX},${dY} V${stepTop} H${dR} V${dY} Z`;
  let front = P(brickD, A.lin([[0, "#6e4236"], [0.5, FAC.brick], [1, "#5a362c"]], 0, 0, 1, 0.4), { fr: "evenodd" });
  front += G(bricks(A, 0, 0, W, Hh, k), { clip: A.clip(brickD) });
  // the right neighbour (render), past the party wall
  const party = dR + 50 * k;
  front += P(poly([[party, 0], [W, 0], [W, Hh], [party, Hh]]), A.lin([[0, "#575c76"], [1, "#3e4258"]], 0, 0, 1, 0), { s: INK, w: 2 });
  front += sash(A, party + 70, 150, 160, 260, { sw: 2.4 });
  // the bay window, its right end (the rest is off to the left)
  const bayR = dX - 50 * k, bayTop = dY + 20;
  front += P(poly([[-10, bayTop - 50], [bayR + 14, bayTop - 50], [bayR - 6, bayTop - 90], [-10, bayTop - 90]]), FAC.slate, { s: INK, w: 2 });   // its little roof
  front += P(poly([[-10, bayTop - 50], [bayR, bayTop - 50], [bayR, 600], [-10, 600]]), "#efe7d6", { s: INK, w: 2 });
  for (const [px, pw, cur] of [[bayR - 92, 76, false], [-10, bayR - 112, true]]) {
    front += P(poly([[px, bayTop - 30], [px + pw, bayTop - 30], [px + pw, 470], [px, 470]]), A.lin([[0, "#ffe9a8"], [0.6, "#f2c46b"], [1, "#c98a3e"]], 0, 0, 0, 1), { s: INK, w: 1.6 });
    if (cur) front += P(poly([[px + pw, bayTop - 30], [px + pw - 34, bayTop - 30], [px + pw - 22, 470], [px + pw, 470]]), "#c0503a", { s: INK, w: 1 });
    front += S(`M${r(px)},${r(bayTop + 140)} L${r(px + pw)},${r(bayTop + 140)}`, "#efe7d6", 3);
  }
  front += P(poly([[-10, 470], [bayR + 6, 470], [bayR + 6, 488], [-10, 488]]), FAC.stone, { s: INK, w: 1.6 });
  // the stone door surround with the gold fanlight (rays), the step, the pavement
  const fr = dW / 2;
  front += P(`M${dX - 18},${stepTop} L${dX - 18},${dY} A${fr + 18},${fr + 18} 0 0 1 ${r(dR + 18)},${dY} L${r(dR + 18)},${stepTop} L${r(dR)},${stepTop} L${r(dR)},${dY} L${dX},${dY} L${dX},${stepTop} Z`, A.lin([[0, "#e6dcc6"], [1, "#b9ad96"]], 0, 0, 1, 1), { s: INK, w: 2 });
  front += P(`M${dX},${dY} A${r(fr)},${r(fr)} 0 0 1 ${r(dR)},${dY} Z`, A.rad([[0, "#fff1c4"], [1, "#f0b850"]], 0.5, 1, 0.9), { s: INK, w: 1.8 });
  let rays = "";
  for (const a of [30, 60, 90, 120, 150]) { const t = a * Math.PI / 180; rays += `M${r(dX + fr)},${dY} L${r(dX + fr - Math.cos(t) * fr)},${r(dY - Math.sin(t) * fr)}`; }
  front += S(rays, "#9a7a3a", 2.2) + P(`M${r(dX + fr - 14)},${dY} A14,14 0 0 1 ${r(dX + fr + 14)},${dY} Z`, "#9a7a3a");
  front += P(poly([[dX - 40, stepTop], [dR + 40, stepTop], [dR + 46, 600], [dX - 46, 600]]), A.lin([[0, "#b8ae9a"], [1, "#8a8170"]], 0, 0, 0, 1), { s: INK, w: 2 });   // the doorstep
  front += P(poly([[dX - 40, stepTop], [dR + 40, stepTop], [dR + 40, stepTop + 6], [dX - 40, stepTop + 6]]), "#cfc6b2");
  // a black feather lying on the step (Rook's other shape)
  front += P(smooth([[dX + 20, 580], [dX + 34, 574], [dX + 64, 571], [dX + 86, 574], [dX + 66, 580], [dX + 34, 582]]), "#16141a", { s: INK, w: 1.2 });
  front += S(`M${dX + 16},581 L${dX + 84},574`, "#5a5568", 1, 0.9);
  front += E(dX + 52, 583, 34, 3, "#000", { op: 0.25 });
  s += front;
  // ---- the lamp: an iron bracket on the wall right of the door, the lantern hanging by the fanlight
  const bx = dR + 84, lx = dR + 40, ly = 40;
  s += P(poly([[bx - 6, ly - 4], [bx + 8, ly - 4], [bx + 8, ly + 70], [bx - 6, ly + 70]]), "#1b1a1f", { s: INK, w: 1.2 });
  s += S(`M${bx},${ly + 8} L${lx},${ly + 8}`, "#1b1a1f", 6);
  s += S(`M${bx},${ly + 56} Q${bx - 34},${ly + 52} ${bx - 40},${ly + 30} Q${bx - 42},${ly + 12} ${bx - 26},${ly + 14}`, "#1b1a1f", 4.4);
  s += S(`M${lx},${ly + 8} L${lx},${ly + 22}`, "#1b1a1f", 2.6);
  s += lamp(A, lx, ly + 26, k * 0.62, 2).s;
  // ---- Rook in human shape, on the threshold: very tall, very still
  s += E(VPX + 30, stepTop + 2, 92, 10, "#000", { op: 0.35 });
  s += place({ N: 8.0, draw: () => rookBody(A, 0) }, VPX + 30, stepTop, 200, stepTop - 150 * k, 2);   // k units per cm on the step
  // the lamp's light on Rook and the step, night at the edges
  s += tag("rect", { x: 0, y: 0, width: W, height: Hh, fill: A.rad([[0, "#ffd98a", 0.16], [0.5, "#ffd98a", 0.05], [1, "#ffd98a", 0]], lx / W, 0.12, 0.7) });
  s += tag("rect", { x: 0, y: 0, width: W, height: Hh, fill: A.rad([[0, "#0b1120", 0], [0.6, "#0b1120", 0.05], [1, "#0b1120", 0.55]], 0.5, 0.45, 0.75) });
  const body = G(s, { clip: A.clip(`M18,0 H${W - 18} A18,18 0 0 1 ${W},18 V${Hh - 18} A18,18 0 0 1 ${W - 18},${Hh} H18 A18,18 0 0 1 0,${Hh - 18} V18 A18,18 0 0 1 18,0 Z`) });
  return ["0 0 800 600", "Rook in human shape, very tall and still in a long grey coat, on the doorstep of the Lantern House under its lamp; behind, the lit hall with its stairs and a coat stand just as tall, a yellow raincoat and a violet scarf on its hooks; a black feather on the step", A.out() + body];
}

export const COVERS = { cover, "back-cover": backCover };

/** Draw and save the named pieces (both when none are named). */
export function make(names = []) {
  const list = names.length ? names : Object.keys(COVERS);
  for (const name of list) {
    if (!COVERS[name]) { console.error("no piece", name, "— known:", Object.keys(COVERS).join(", ")); process.exitCode = 1; continue; }
    setPrefix(name); setStroke(1);
    const [vb, title, body] = COVERS[name]();
    save(name, vb, title, body);
    console.log("wrote", name);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) make(process.argv.slice(2));
