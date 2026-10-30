/**
 * Plays a season: several episodes in a row with the same coven, carrying over
 * what CORE-RULES "The end" says carries over: Scars, growth, Book pages and
 * returning threats.
 *
 * Assumptions (not rules): each episode's threat is one of 6 kinds, picked at
 * random unless a returning threat is due; a threat that wasn't destroyed
 * returns two episodes later; growth goes into the rating the witch's Power
 * uses most, then the next highest.
 */
import { makeCoven, POWERS, WITCH_RATINGS } from "./character.mjs";
import { playEpisode } from "./engine.mjs";

const KINDS = 6;

function freshCopy(sheet) {
  return {
    ...sheet,
    witches: sheet.witches.map(w => ({ ...w, ratings: { ...w.ratings }, hurt: w.scar || 0, down: false, everDown: false,
      magic: w.magicStart, magicGained: 0, magicSpent: 0, lifeAnswered: false, surgedScene: -1 })),
    guardian: sheet.guardian ? { ...sheet.guardian, hurt: 0, down: false, everDown: false, ward: sheet.guardian.wardStart, wardSpent: 0, surgedScene: -1 } : null,
    guardianCall: !sheet.guardian,
    potions: [],
  };
}

function grow(w, rule) {
  if (rule === "upTo3") { // "raise a rating below 3 by 1"
    const k = WITCH_RATINGS.filter(r => w.ratings[r] < 3).sort((a, b) => w.ratings[b] - w.ratings[a])[0];
    if (k) w.ratings[k] += 1;
    return;
  }
  if (rule === "belowHighest") { // "raise a rating that is lower than your highest" (once all are equal, any, most 4)
    const top = Math.max(...WITCH_RATINGS.map(k => w.ratings[k]));
    const lower = WITCH_RATINGS.filter(k => w.ratings[k] < top).sort((a, b) => w.ratings[b] - w.ratings[a]);
    const k = lower[0] || WITCH_RATINGS.find(r => w.ratings[r] < 4);
    if (k) w.ratings[k] += 1;
    return;
  }
  const order = [POWERS[w.power].main, ...WITCH_RATINGS.filter(k => k !== POWERS[w.power].main).sort((a, b) => w.ratings[b] - w.ratings[a])];
  const k = order.find(r => w.ratings[r] < 4);
  if (k) w.ratings[k] += 1; // "raise one rating by 1 (most 4)"
}

export function playSeason({ witches, guardian, label, episodes, settings, rng }) {
  const sheet = makeCoven({ witches, guardian }, rng.fork("coven"), settings.policy.ratings, settings.rules);
  const pages = new Set();
  const returning = []; // { kind, bonus, due }
  const out = [];
  for (let e = 1; e <= episodes; e++) {
    const due = returning.findIndex(r => r.due <= e);
    const threat = due >= 0 ? returning.splice(due, 1)[0] : { kind: Math.floor(rng.next() * KINDS), bonus: 0 };
    const coven = freshCopy(sheet);
    const step = Math.min(Math.floor((e - 1) / 2), settings.rules.seasonCap ?? 99); // growth steps the coven has taken (counted up to the cap)
    const seasonBonus = (settings.rules.seasonToughness || 0) * witches * step + (settings.rules.seasonDanger && step >= settings.rules.seasonDanger ? 0 : 0);
    const ep = playEpisode({ coven, label, settings, rng: rng.fork("ep", e), season: { toughnessBonus: threat.bonus + seasonBonus, dangerBonus: settings.rules.seasonDanger ? Math.floor(step / settings.rules.seasonDanger) : 0, bookPage: settings.rules.bookPages && pages.has(threat.kind) } });
    ep.episode = e;
    ep.returning = threat.bonus > 0;
    ep.scars = sheet.witches.filter(w => w.scar).length;
    out.push(ep);
    // Carry-over.
    sheet.witches.forEach((w, i) => { w.scar = ep.result === "loss" && coven.witches[i].down ? 1 : 0; }); // "Down when the coven loses: a Scar"
    if (ep.reason === "destroyed") pages.add(threat.kind); // "destroyed threats get a page in the Book"
    else returning.push({ kind: threat.kind, bonus: threat.bonus + 2, due: e + 2 }); // "comes back later with 2 more Toughness"
    if (e % 2 === 0) sheet.witches.forEach(w => grow(w, settings.rules.growthRule)); // "After every second episode"
  }
  return out;
}
