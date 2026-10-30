/**
 * Collects episode results into per-cell statistics and runs the issue
 * detectors (sim/README §6).
 */
import { POWER_KEYS } from "./character.mjs";

export function newCell() {
  return {
    runs: 0, win: 0, partial: 0, loss: 0, seen: 0, forced: 0, innocentLost: 0,
    reasons: {}, rounds: [], scenes: [], anyDown: 0, witchesDown: 0, witchCount: 0, guardianDown: 0, guardianRuns: 0,
    rolls: { critical: 0, success: 0, partial: 0, failure: 0 },
    magicFrac: [], lifeAnswered: 0, wardFrac: [], potionsMade: 0, potionsUsed: 0, weaknessAtShowdown: 0,
    unmakeTries: 0, doomAtShowdown: [], callUsed: 0, pressured: 0, unmakeRolls: 0, unmakeHits: 0, use: {},
    power: Object.fromEntries(POWER_KEYS.map(p => [p, { n: 0, win: 0, loss: 0, down: 0, damage: 0 }])),
  };
}

export function record(cell, ep) {
  cell.runs++;
  cell[ep.result]++;
  if (ep.seen) cell.seen++;
  if (ep.forced) cell.forced++;
  if (ep.innocentLost) cell.innocentLost++;
  cell.reasons[ep.reason] = (cell.reasons[ep.reason] || 0) + 1;
  cell.rounds.push(ep.rounds);
  cell.scenes.push(ep.scenes);
  if (ep.witchesDown > 0) cell.anyDown++;
  cell.witchesDown += ep.witchesDown;
  cell.witchCount += ep.w;
  if (ep.g) { cell.guardianRuns++; if (ep.guardianDown) cell.guardianDown++; }
  for (const k of Object.keys(cell.rolls)) cell.rolls[k] += ep.rolls[k];
  for (const m of ep.magic) { cell.magicFrac.push(m.had ? m.spent / m.had : 0); if (m.life) cell.lifeAnswered++; }
  if (ep.ward) cell.wardFrac.push(ep.ward.spent / ep.ward.had);
  cell.potionsMade += ep.potionsMade;
  cell.potionsUsed += ep.potionsUsed;
  if (ep.weaknessAtShowdown) cell.weaknessAtShowdown++;
  cell.unmakeTries += ep.unmakeTries;
  cell.doomAtShowdown.push(ep.doomAtShowdown);
  if (ep.callUsed) cell.callUsed++;
  for (const [k, v] of Object.entries(ep.use)) cell.use[k] = (cell.use[k] || 0) + v;
  if (ep.forced && (ep.carefulRounds > 0 || ep.seen)) cell.pressured++;
  for (const v of ep.unmakeLog) { cell.unmakeRolls++; if (v.result === "success" || v.result === "critical") cell.unmakeHits++; }
  for (const p of ep.powers) {
    const s = cell.power[p];
    s.n++;
    if (ep.result === "win") s.win++;
    if (ep.result === "loss") s.loss++;
    if (ep.downByPower[p]) s.down++;
    s.damage += ep.damageBy[p] || 0;
  }
}

export function merge(cells) {
  const out = newCell();
  for (const c of cells) {
    for (const k of ["runs", "win", "partial", "loss", "seen", "forced", "innocentLost", "anyDown", "witchesDown", "witchCount", "guardianDown", "guardianRuns", "lifeAnswered", "potionsMade", "potionsUsed", "weaknessAtShowdown", "unmakeTries", "callUsed", "pressured", "unmakeRolls", "unmakeHits"]) out[k] += c[k];
    for (const k of Object.keys(out.rolls)) out.rolls[k] += c.rolls[k];
    for (const [k, v] of Object.entries(c.reasons)) out.reasons[k] = (out.reasons[k] || 0) + v;
    for (const [k, v] of Object.entries(c.use)) out.use[k] = (out.use[k] || 0) + v;
    for (const k of ["rounds", "scenes", "magicFrac", "wardFrac", "doomAtShowdown"]) out[k].push(...c[k]);
    for (const p of POWER_KEYS) for (const k of Object.keys(out.power[p])) out.power[p][k] += c.power[p][k];
  }
  return out;
}

export const pct = (a, b) => (b ? (100 * a) / b : 0);
export function quantile(arr, q) {
  if (!arr.length) return 0;
  const s = arr.slice().sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(q * (s.length - 1)))];
}
export const mean = arr => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

export function summary(c) {
  const rolls = Object.values(c.rolls).reduce((a, b) => a + b, 0);
  return {
    runs: c.runs,
    win: pct(c.win, c.runs), partial: pct(c.partial, c.runs), loss: pct(c.loss, c.runs),
    seen: pct(c.seen, c.runs), forced: pct(c.forced, c.runs), innocentLost: pct(c.innocentLost, c.runs),
    roundsMedian: quantile(c.rounds, 0.5), roundsP90: quantile(c.rounds, 0.9), roundsMax: quantile(c.rounds, 1),
    scenesMedian: quantile(c.scenes, 0.5),
    anyDown: pct(c.anyDown, c.runs), downPerEp: c.runs ? c.witchesDown / c.runs : 0, downShare: pct(c.witchesDown, c.witchCount),
    guardianDown: pct(c.guardianDown, c.guardianRuns),
    crit: pct(c.rolls.critical, rolls), fail: pct(c.rolls.failure, rolls), partialRolls: pct(c.rolls.partial, rolls), rollsPerEp: c.runs ? rolls / c.runs : 0,
    magicMedian: 100 * quantile(c.magicFrac, 0.5), magicHalf: pct(c.magicFrac.filter(x => x >= 0.5).length, c.magicFrac.length),
    lifeAnswered: pct(c.lifeAnswered, c.magicFrac.length),
    wardMedian: 100 * quantile(c.wardFrac, 0.5), wardHalf: pct(c.wardFrac.filter(x => x >= 0.5).length, c.wardFrac.length),
    potionsUsed: pct(c.potionsUsed, c.potionsMade), potionsPerEp: c.runs ? c.potionsMade / c.runs : 0,
    weaknessAtShowdown: pct(c.weaknessAtShowdown, c.runs),
    doomAtShowdown: mean(c.doomAtShowdown),
    pressured: pct(c.pressured, c.forced),
    callUsed: pct(c.callUsed, c.runs - c.guardianRuns),
    unmakeHit: pct(c.unmakeHits, c.unmakeRolls),
    use: Object.fromEntries(Object.entries(c.use).map(([k, v]) => [k, v / c.runs])),
    guardianRuns: c.guardianRuns,
    reasons: Object.fromEntries(Object.entries(c.reasons).map(([k, v]) => [k, pct(v, c.runs)])),
  };
}
