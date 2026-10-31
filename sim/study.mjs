#!/usr/bin/env node
/**
 * Balance study: the REPORT.md §1 targets that are still missed, and candidate
 * fixes for each, run over the whole grid. Writes sim/REPORT-study.md.
 *   node sim/study.mjs [--runs 2000] [--seed 1] [--jobs 4] [--out sim/REPORT-study.md]
 * Same runs and seed as REPORT.md, so the baseline rows are REPORT.md's numbers.
 * Same seed and runs → same report, whatever --jobs is.
 *
 * Nothing here changes a rule, a number or a default. Every candidate is an
 * override on a fresh copy of baseSettings(), and is run with grid.mjs.
 *
 * A few candidates are player habits, or rules, that params.mjs has no setting
 * for (the guardian helping with Ward, choosing potion kinds, a different
 * Critical, …). Those run on an in-memory copy of engine.mjs with small hooks
 * (ENGINE_HOOKS below). Each hook must match the engine text exactly once,
 * does nothing unless its `settings.study` field is set, and the report checks
 * that the copy with no hooks gives exactly grid.mjs's results.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cpus } from "node:os";
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";
import { runGrid, LABELS, PLAYERS, GUARDIAN, cellKey } from "./grid.mjs";
import { merge, summary, newCell, record } from "./recorder.mjs";
import { baseSettings, TARGETS, WIN_TARGET } from "./params.mjs";
import { makeRng } from "./rng.mjs";
import { makeCoven, validateCoven, POWER_KEYS } from "./character.mjs";
import { readRoll, RESULT } from "../module/logic/rules.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------- the engine with study hooks
/** [what it lets the study test, engine text, replacement]. Each must match exactly once. */
const ENGINE_HOOKS = [
  ["imports", 'from "../module/logic/rules.mjs"', `from "${new URL("../module/logic/rules.mjs", import.meta.url)}"`],
  ["imports", 'from "./character.mjs"', `from "${new URL("./character.mjs", import.meta.url)}"`],
  ["another Critical rule (study.readRoll)",
    "const r = readRoll(rng.roll(pool, 6), difficulty,",
    "const r = (settings.study?.readRoll || readRoll)(rng.roll(pool, 6), difficulty,"],
  ["try the Unmaking in the round the threat Breaks (study.unmakeNow)",
    'const fresh = st.round > T.brokenRound || J.brokenFlees === "thisRound";',
    'const fresh = st.round > T.brokenRound || J.brokenFlees === "thisRound" || !!settings.study?.unmakeNow;'],
  ["a Broken threat stays longer (study.fleeAfter rounds)",
    'st.round >= T.brokenRound + 1) return end("fled");',
    'st.round >= T.brokenRound + (settings.study?.fleeAfter ?? 1)) return end("fled");'],
  ["the guardian pays the Unmaking leader's extra dice with Ward first (study.wardUnmake); a different limit on them (study.unmakeCap)",
    "let extra = spend(leader, Math.min(R.bonusCap, leader.magic));\n    for (const h of coven.witches) { if (extra >= R.bonusCap) break;",
    "const UCAP = settings.study?.unmakeCap ?? R.bonusCap;\n    let extra = settings.study?.wardUnmake && gd && !gd.down ? spend(gd, UCAP, \"ward\") : 0;\n    extra += spend(leader, Math.min(UCAP - extra, leader.magic));\n    for (const h of coven.witches) { if (extra >= UCAP) break;"],
  ["(the Unmaking dice above the usual limit, for study.unmakeCap)",
    "free: extra, joiners: joiners.length * R.unmakeJoinDice + gJoin,",
    "free: Math.min(extra, R.bonusCap), joiners: joiners.length * R.unmakeJoinDice + gJoin + Math.max(0, extra - R.bonusCap),"],
  ["the guardian adds 1 Ward die to a witch's defence that could put her Down (study.wardDefend)",
    "free: held ? R.holdDice : 0, buy: danger ?",
    "free: (held ? R.holdDice : 0) + (settings.study?.wardDefend && danger && tgt.kind === \"witch\" && gd && !gd.down && gd.ward >= 2 ? spend(gd, 1, \"ward\") : 0), buy: danger ?"],
  ["the brewer chooses each potion's kind (study.potionKind)",
    "const k = pick(POTION_ORDER);",
    "const k = settings.study?.potionKind ? settings.study.potionKind(coven, label) : pick(POTION_ORDER);"],
];
function hookedEngineSource() {
  let src = readFileSync(join(HERE, "engine.mjs"), "utf8");
  for (const [what, from, to] of ENGINE_HOOKS) {
    const i = src.indexOf(from);
    if (i < 0 || src.indexOf(from, i + 1) >= 0) throw new Error(`study hook no longer matches engine.mjs exactly once: ${what}`);
    src = src.slice(0, i) + to + src.slice(i + from.length);
  }
  return src;
}
const { playEpisode: playHooked } = await import("data:text/javascript;base64," + Buffer.from(hookedEngineSource()).toString("base64"));

/** grid.mjs runCell, line for line, with the hooked engine. */
function runGridHooked({ runs, seed, settings, labels }) {
  const cells = {};
  for (const label of labels) for (const players of PLAYERS) for (const guardian of GUARDIAN) {
    const cell = newCell();
    for (let i = 0; i < runs; i++) {
      const rng = makeRng(seed, label, players, guardian, i);
      const coven = makeCoven({ witches: guardian ? players - 1 : players, guardian }, rng.fork("coven"), settings.policy.ratings, settings.rules);
      validateCoven(coven, settings.rules);
      record(cell, playHooked({ coven, label, settings, rng: rng.fork("dice") }));
    }
    cells[cellKey(label, players, guardian)] = cell;
  }
  return cells;
}

// ---------------------------------------------------------------- candidates
const B = () => baseSettings();
/** Change label L0 only. */
const at = (L0, fn) => L => { const s = B(); if (L === L0) fn(s); return s; };
/** Change every label. */
const every = fn => L => { const s = B(); fn(s, L); return s; };
const study = (o, L0) => L => { const s = B(); s.study = !L0 || L === L0 ? o : {}; return s; };
/** The Unmaking Difficulty by number of witches (via the per-size row; unmakeD 0). */
const unmakeTable = (s, L, tbl) => { s.rules.unmakeByWitches = false; s.numbers[L].unmakeD = 0; s.size.unmakeMod = { ...tbl }; };
/** +X Toughness for every coven at label L (tGuardian for guardian covens, the per-size row for the rest). */
const flatToughness = (s, L, X) => { s.numbers[L].tGuardian = X; s.size.toughnessMod = { 2: X, 3: 3 + X, 4: X, 5: X }; };
const count = (c, k) => c.potions.filter(x => x === k).length;
/** Potion kinds, players' choice (ruling 70). */
const KINDS = {
  /** Blasting and Binding, whichever the coven has fewer of (ties: Blasting); never Healing. */
  attack: c => (count(c, "binding") < count(c, "blasting") ? "binding" : "blasting"),
  /** As attack, but at Standard and Hard the coven first makes sure it has one Healing. */
  oneHealing: (c, L) => (L !== "easy" && !c.potions.includes("healing") ? "healing" : KINDS.attack(c)),
};
/** A Critical rule: the book's, plus `extra(successes, sixes, dice, difficulty)` as another way to get one. */
const critRule = extra => (faces, d, o) => {
  const r = readRoll(faces, d, o);
  if (r.result === RESULT.SUCCESS && extra(r.successes, r.sixes, faces.length, d)) r.result = RESULT.CRITICAL;
  return r;
};

/**
 * Every run in the study. `make(L)` gives the settings for label L; only `labels` are run, and the
 * other labels are the baseline's cells (they would replay identically). `hooked` = needs the hooked engine.
 * kind: number (a value in the Ch 6 table), rule (a rule's wording), advice (a habit the book already allows;
 * the fix is a line of advice and the simulator's player policy), reference (shown to explain, not a candidate).
 */
const V = [
  { id: "base", miss: "base", name: "The book as it is (v0.9)", kind: "reference", make: () => B() },

  // Easy win and Easy cells
  { id: "eCap3", miss: "easy", name: "Easy: at most +3 extra dice (was +2)", change: "Ch 2 extra-dice limit, as a new Ch 6 row: +3 / +2 / +2", table: true, kind: "number", labels: ["easy"], make: at("easy", s => { s.rules.bonusCap = 3; }) },
  { id: "eUcap3", miss: "easy", name: "Easy: the Unmaking leader adds up to +3 dice (was +2)", change: "Ch 7 the Unmaking, as a new Ch 6 row", table: true, kind: "number", labels: ["easy"], hooked: true, make: study({ unmakeCap: 3 }, "easy") },
  { id: "eJoin3", miss: "easy", name: "Easy: each joiner adds 3 dice (was 2)", change: "Ch 7 the Unmaking, as a new Ch 6 row", table: true, kind: "number", labels: ["easy"], make: at("easy", s => { s.rules.unmakeJoinDice = 3; }) },
  { id: "eUm1", miss: "easy", name: "Easy: Unmaking Difficulty = witches − 1", change: "Ch 7 the Unmaking, as a new Ch 6 row", table: true, kind: "number", labels: ["easy"], make: at("easy", s => { s.numbers.easy.unmakeAdd = -1; }) },
  { id: "eUm45", miss: "easy", name: "Easy: Unmaking Difficulty 1 lower with 4 or 5 witches", change: "Ch 7 the Unmaking, as a new Ch 6 row", table: true, kind: "number", labels: ["easy"], make: at("easy", s => unmakeTable(s, "easy", { 2: 2, 3: 3, 4: 3, 5: 4 })) },
  { id: "eFlee2", miss: "easy", name: "Easy: a Broken threat flees a round later", change: "Ch 7 Broken", table: false, kind: "rule", labels: ["easy"], hooked: true, make: study({ fleeAfter: 2 }, "easy") },

  // Cell spreads (Standard's 5-witch cell; Easy's are above; Hard's below)
  { id: "umCap4", miss: "cells", name: "Unmaking Difficulty: the number of witches, at most 4", change: "Ch 7 the Unmaking", table: false, kind: "rule", make: every((s, L) => unmakeTable(s, L, { 2: 2, 3: 3, 4: 4, 5: 4 })) },
  { id: "umCap4ES", miss: "cells", name: "As above, at Easy and Standard only", change: "Ch 7 the Unmaking, as a new Ch 6 row", table: true, kind: "number", labels: ["easy", "standard"], make: L => { const s = B(); if (L !== "hard") unmakeTable(s, L, { 2: 2, 3: 3, 4: 4, 5: 4 }); return s; } },
  { id: "join3d1", miss: "cells", name: "Each joiner adds 3 dice; Difficulty = witches + 1", change: "Ch 7 the Unmaking", table: false, kind: "rule", make: every((s, L) => { s.rules.unmakeJoinDice = 3; s.numbers[L].unmakeAdd = 1; }) },
  { id: "t5m3", miss: "cells", name: "Against 5 witches, the threat has 3 less Toughness", change: "Ch 7 the threat (per-size rule)", table: false, kind: "rule", make: every(s => { s.size.toughnessMod = { 2: 0, 3: 3, 4: 0, 5: -3 }; }) },
  { id: "tByN", miss: "cells", name: "The +3 Toughness against any 3 characters (guardian included)", change: "Ch 7 the threat (per-size rule)", table: false, kind: "rule", make: every(s => { s.size.toughnessBy = "n"; }) },
  { id: "no3T", miss: "cells", name: "No extra Toughness against 3 witches", change: "Ch 7 the threat (per-size rule)", table: false, kind: "reference", make: every(s => { s.size.toughnessMod = { 2: 0, 3: 0, 4: 0, 5: 0 }; }) },
  { id: "att4is1", miss: "cells", name: "1 attack a round against 4 characters (was 2)", change: "Ch 7 the threat (per-size rule)", table: false, kind: "reference", make: every(s => { s.size.attacks = { 2: 1, 3: 1, 4: 1, 5: 2 }; }) },

  // Hard 55–60%
  { id: "hT1", miss: "hard", name: "Hard Toughness 4 × w + 1", change: "Ch 6 table: Toughness at Hard", table: true, kind: "number", labels: ["hard"], make: at("hard", s => flatToughness(s, "hard", 1)) },
  { id: "hDanger4", miss: "hard", name: "Hard Danger 4 (was 3)", change: "Ch 6 table: Defence / Danger at Hard 2 / 4", table: true, kind: "number", labels: ["hard"], make: at("hard", s => { s.numbers.hard.attack = 4; }) },
  { id: "hTG1", miss: "hard", name: "Hard: 1 more Toughness against a guardian player", change: "Ch 6 table: Toughness at Hard (4 × w, +1 with a guardian player)", table: true, kind: "number", labels: ["hard"], make: at("hard", s => { s.numbers.hard.tGuardian = 1; }) },
  { id: "hT2", miss: "hard", name: "Hard Toughness 4 × w + 2", change: "Ch 6 table: Toughness at Hard", table: true, kind: "number", labels: ["hard"], make: at("hard", s => flatToughness(s, "hard", 2)) },
  { id: "hHit4", miss: "hard", name: "Hard Hit 4 (was 3)", change: "Ch 6 table: Hit at Hard", table: true, kind: "number", labels: ["hard"], make: at("hard", s => { s.numbers.hard.hit = 4; }) },
  { id: "hClue1", miss: "hard", name: "Hard Clues 4 × n + 1", change: "Ch 6 table: Clues at Hard", table: true, kind: "number", labels: ["hard"], make: at("hard", s => { s.numbers.hard.cluesAdd = 1; }) },
  { id: "hExp3", miss: "hard", name: "Hard Exposure boxes 3 (was 4)", change: "Ch 6 table: Exposure at Hard", table: true, kind: "number", labels: ["hard"], make: at("hard", s => { s.numbers.hard.exposureMax = 3; }) },

  // Easy showdown length
  { id: "eT4", miss: "rounds", name: "Easy Toughness 4 × w (was 3 × w)", change: "Ch 6 table: Toughness at Easy", table: true, kind: "number", labels: ["easy"], make: at("easy", s => { s.numbers.easy.tWitch = 4; }) },
  { id: "eT5", miss: "rounds", name: "Easy Toughness 5 × w", change: "Ch 6 table: Toughness at Easy", table: true, kind: "number", labels: ["easy"], make: at("easy", s => { s.numbers.easy.tWitch = 5; }) },
  { id: "eT6", miss: "rounds", name: "Easy Toughness 6 × w", change: "Ch 6 table: Toughness at Easy", table: true, kind: "number", labels: ["easy"], make: at("easy", s => { s.numbers.easy.tWitch = 6; }) },

  // Criticals
  { id: "critSmall", miss: "crit", name: "Critical: also any 6 on a success with 1 or 2 dice", change: "Ch 2 the roll (and every odds table and worked roll)", table: false, kind: "rule", hooked: true, make: () => { const s = B(); s.study = { readRoll: critRule((succ, six, dice) => dice <= 2 && six >= 1) }; return s; } },
  { id: "critHard", miss: "crit", name: "Critical: also any 6 on a success at Difficulty 3 or more", change: "Ch 2 the roll (and every odds table and worked roll)", table: false, kind: "rule", hooked: true, make: () => { const s = B(); s.study = { readRoll: critRule((succ, six, dice, d) => d >= 3 && six >= 1) }; return s; } },
  { id: "critSmall3", miss: "crit", name: "Critical: also any 6 on a success with 3 dice or fewer", change: "Ch 2 the roll (and every odds table and worked roll)", table: false, kind: "rule", hooked: true, make: () => { const s = B(); s.study = { readRoll: critRule((succ, six, dice) => dice <= 3 && six >= 1) }; return s; } },

  // Ward
  { id: "wardUnmake", miss: "ward", name: "The guardian helps the Unmaking with Ward (allowed now)", change: "Advice (Ch 4 or Ch 7) and the simulator's guardian", table: false, kind: "advice", hooked: true, make: study({ wardUnmake: true }) },
  { id: "wardBoth", miss: "ward", name: "…and adds a Ward die to a defence that could put a witch Down", change: "Advice and the simulator's guardian", table: false, kind: "advice", hooked: true, make: study({ wardUnmake: true, wardDefend: true }) },
  { id: "mendFree", miss: "ward", name: "Mend takes no action (once a round)", change: "Ch 4 gifts", table: false, kind: "rule", make: every(s => { s.rules.mendFree = true; }) },
  { id: "shield2", miss: "ward", name: "Shield twice a round", change: "Ch 4 gifts", table: false, kind: "rule", make: every(s => { s.rules.shieldPerRound = 2; }) },
  { id: "gUnmake1", miss: "ward", name: "The guardian joins the Unmaking for 1 Ward (+1 die)", change: "Ch 4, Ch 7", table: false, kind: "rule", make: every(s => { s.rules.guardianUnmake = 1; }) },
  { id: "ward4", miss: "ward", name: "The guardian has 4 Ward (was 5)", change: "Ch 4", table: false, kind: "rule", make: every(s => { s.rules.ward = 4; }) },

  // Potions
  { id: "potNeed", miss: "potions", name: "Brewers choose kinds: Blasting and Binding, one Healing at Standard and Hard", change: "Advice (Ch 5) and the simulator's brewers", table: false, kind: "advice", hooked: true, make: study({ potionKind: KINDS.oneHealing }) },
  { id: "potAttack", miss: "potions", name: "Brewers make only Blasting and Binding", change: "Advice and the simulator's brewers", table: false, kind: "advice", hooked: true, make: study({ potionKind: KINDS.attack }) },
  { id: "yield1", miss: "potions", name: "A brew makes one potion (two on a Critical)", change: "Ch 5 potions", table: false, kind: "rule", make: every(s => { s.rules.potionYield = 1; }) },
  { id: "cap2", miss: "potions", name: "The coven carries at most 2 potions", change: "Ch 5 potions", table: false, kind: "rule", make: every(s => { s.rules.potionCap = 2; }) },
  { id: "brewOne", miss: "potions", name: "The coven brews once an episode", change: "Advice and the simulator's brewers", table: false, kind: "advice", make: every(s => { s.policy.brew = "one"; }) },

  // Seen at Standard
  { id: "sExp3", miss: "seen", name: "Standard Exposure boxes 3 (was 4)", change: "Ch 6 table: Exposure at Standard", table: true, kind: "number", labels: ["standard"], make: at("standard", s => { s.numbers.standard.exposureMax = 3; }) },
  { id: "sClue0", miss: "seen", name: "Standard Clues 4 × n (was 4 × n − 1)", change: "Ch 6 table: Clues at Standard", table: true, kind: "number", labels: ["standard"], make: at("standard", s => { s.numbers.standard.cluesAdd = 0; }) },
  { id: "reckless", miss: "seen", name: "Players never hold back in public", change: "(players, not a rule)", table: false, kind: "reference", make: every(s => { s.policy.publicCare = "reckless"; }) },
  { id: "seed2", miss: "seen", name: "The book as it is, seed 2", kind: "reference", seed: 2, make: () => B() },
  { id: "seed3", miss: "seen", name: "The book as it is, seed 3", kind: "reference", seed: 3, make: () => B() },

  // Side finding: the Unmaking's timing advice
  { id: "unmakeNow", miss: "side", name: "Try the Unmaking in the round it Breaks, with whoever is left", change: "Ch 7 'Timing' advice", table: false, kind: "reference", hooked: true, make: study({ unmakeNow: true }) },

  // The recommended set, and its checks
  { id: "recNumbers", miss: "set", name: "Set: Easy Unmaking +3 dice, Easy Toughness 4 × w, Hard Toughness 4 × w + 1", table: true, kind: "number", hooked: true, make: L => { const s = B(); if (L === "easy") { s.study = { unmakeCap: 3 }; s.numbers.easy.tWitch = 4; } if (L === "hard") flatToughness(s, "hard", 1); return s; } },
  { id: "recAll", miss: "set", name: "Set + the two advice lines played (Ward in the Unmaking; brew by need)", table: true, kind: "number", hooked: true, make: L => { const s = B(); s.study = { wardUnmake: true, potionKind: KINDS.oneHealing }; if (L === "easy") { s.study.unmakeCap = 3; s.numbers.easy.tWitch = 4; } if (L === "hard") flatToughness(s, "hard", 1); return s; } },
  { id: "recAll2", miss: "set", name: "Set + advice, seed 2", kind: "number", hooked: true, seed: 2, make: L => V.find(v => v.id === "recAll").make(L) },
  { id: "recAll3", miss: "set", name: "Set + advice, seed 3", kind: "number", hooked: true, seed: 3, make: L => V.find(v => v.id === "recAll").make(L) },

  // Low Tide (Hard, Lure): the episode that uses Hard with its own threat
  { id: "lt:base", miss: "lure", name: "Low Tide as the book is", labels: ["hard"], make: () => { const s = B(); s.threat = "drownedChoir"; return s; } },
  { id: "lt:hT1", miss: "lure", name: "Low Tide, Hard Toughness 4 × w + 1", labels: ["hard"], make: () => { const s = B(); s.threat = "drownedChoir"; flatToughness(s, "hard", 1); return s; } },
  { id: "lt:hDanger4", miss: "lure", name: "Low Tide, Hard Danger 4", labels: ["hard"], make: () => { const s = B(); s.threat = "drownedChoir"; s.numbers.hard.attack = 4; return s; } },
  { id: "lt:recAll", miss: "lure", name: "Low Tide, set + advice", labels: ["hard"], hooked: true, make: () => { const s = V.find(v => v.id === "recAll").make("hard"); s.threat = "drownedChoir"; return s; } },
];
const byId = Object.fromEntries(V.map(v => [v.id, v]));

// ---------------------------------------------------------------- one run → §1 numbers
const cellsOf = L => PLAYERS.flatMap(p => GUARDIAN.map(g => cellKey(L, p, g)));
function digest(cells) {
  const out = { label: {}, cell: {} };
  for (const L of LABELS) {
    const keys = cellsOf(L).filter(k => cells[k]);
    if (!keys.length) continue;
    const m = merge(keys.map(k => cells[k]));
    const s = summary(m);
    const kept = ["blasting", "healing", "binding"].reduce((a, k) => a + (m.use[`brewed:${k}`] || 0), 0);
    out.label[L] = {
      win: s.win, loss: s.loss, partial: s.partial, roundsMedian: s.roundsMedian, anyDown: s.anyDown, crit: s.crit, fail: s.fail,
      magicMedian: s.magicMedian, wardMedian: s.wardMedian, potionsUsed: s.potionsUsed, keptUsed: kept ? (100 * m.potionsUsed) / kept : 0,
      potionsPerEp: s.potionsPerEp, seen: s.seen, pressured: s.pressured, forced: s.forced, runs: s.runs, forcedN: m.forced, unmakeHit: s.unmakeHit, guardianDown: s.guardianDown,
      use: s.use, guardianRuns: m.guardianRuns, wardFrac: m.wardFrac,
    };
    for (const k of keys) { const c = summary(cells[k]); out.cell[k] = { win: c.win, partial: c.partial, loss: c.loss, unmakeHit: c.unmakeHit }; }
  }
  const all = Object.values(cells);
  out.power = {};
  for (const p of POWER_KEYS) {
    let num = 0, den = 0;
    for (const c of all) { const s = c.power[p]; if (!s.n) continue; num += (s.win / s.n - c.win / c.runs) * s.n; den += s.n; }
    out.power[p] = den ? (100 * num) / den : 0;
  }
  const ALL = merge(all);
  out.forcedAll = (100 * ALL.forced) / ALL.runs;
  return out;
}

function runVariant(v, { runs, seed, baseCells }) {
  const labels = v.labels || LABELS;
  const sd = v.seed || seed;
  const cells = {};
  for (const L of labels) Object.assign(cells, (v.hooked ? runGridHooked : runGrid)({ runs, seed: sd, settings: v.make(L), labels: [L] }));
  if (v.id.startsWith("lt:")) return digest(cells); // Low Tide: Hard only
  if (sd === seed && baseCells) for (const L of LABELS) if (!labels.includes(L)) for (const k of cellsOf(L)) cells[k] = baseCells[k];
  return digest(cells);
}

/** The roll mix behind the Critical rate: rolls by dice and Difficulty, per label. */
function rollMix({ runs, seed }) {
  const mix = {};
  for (const L of LABELS) {
    const s = B();
    const m = (mix[L] = {});
    s.study = { readRoll: (faces, d, o) => { const k = `${faces.length}|${d}`; m[k] = (m[k] || 0) + 1; return readRoll(faces, d, o); } };
    runGridHooked({ runs, seed, settings: s, labels: [L] });
  }
  return mix;
}

async function main() {
  const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith("--") ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
  const RUNS = +(args.runs || 2000);
  const SEED = +(args.seed || 1);
  const JOBS = Math.max(1, +(args.jobs || Math.min(4, cpus().length)));
  const OUT = args.out || join(HERE, "REPORT-study.md");
  const t0 = Date.now();

  // Baseline with grid.mjs, and the hooked engine with no hooks set: they must agree exactly.
  const baseCells = runGrid({ runs: RUNS, seed: SEED, settings: B() });
  const hookedBase = runGridHooked({ runs: RUNS, seed: SEED, settings: B(), labels: LABELS });
  const identical = Object.keys(baseCells).every(k => JSON.stringify(baseCells[k]) === JSON.stringify(hookedBase[k]));
  if (!identical) throw new Error("the hooked engine with no hooks set doesn't reproduce grid.mjs: fix ENGINE_HOOKS");

  const ids = ["@rollMix", ...V.filter(v => v.id !== "base").map(v => v.id)];
  const R = { base: digest(baseCells) };
  if (JOBS === 1) {
    for (const id of ids) R[id] = id === "@rollMix" ? rollMix({ runs: RUNS, seed: SEED }) : runVariant(byId[id], { runs: RUNS, seed: SEED, baseCells });
  } else {
    const shares = Array.from({ length: JOBS }, () => []);
    ids.forEach((id, i) => shares[i % JOBS].push(id));
    await Promise.all(shares.map(share => new Promise((res, rej) => {
      const w = new Worker(fileURLToPath(import.meta.url), { workerData: { ids: share, runs: RUNS, seed: SEED, baseCells } });
      w.on("message", m => { R[m.id] = m.d; process.stdout.write("."); });
      w.on("error", rej);
      w.on("exit", code => (code ? rej(new Error(`worker exit ${code}`)) : res()));
    })));
    process.stdout.write("\n");
  }
  writeFileSync(OUT, report(R, { RUNS, SEED, identical }));
  console.log(`wrote ${OUT} in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
}

// ---------------------------------------------------------------- the report
const NAME = { easy: "Easy", standard: "Standard", hard: "Hard" };
const f0 = x => x.toFixed(0);
const f1 = x => x.toFixed(1);
const sgn = x => (Math.abs(x) < 0.05 ? "0.0" : `${x > 0 ? "+" : "−"}${f1(Math.abs(x))}`);
const inRange = (x, [a, b]) => x >= a - 1e-9 && x <= b + 1e-9;
const bold = (s, ok) => (ok ? s : `**${s}**`);

/** The 14 rows of REPORT.md §1, checked the same way as run.mjs. */
function targets(d) {
  const lab = L => d.label[L];
  const wins = L => cellsOf(L).map(k => d.cell[k].win);
  const gd = L => PLAYERS.map(p => d.cell[cellKey(L, p, true)].win - d.cell[cellKey(L, p, false)].win);
  const T = [];
  const row = (key, name, cellText, ok) => T.push({ key, name, cellText, ok });
  row("win", "Win", L => f1(lab(L).win), L => inRange(lab(L).win, TARGETS[L].win));
  row("loss", "Loss", L => f1(lab(L).loss), L => inRange(lab(L).loss, TARGETS[L].loss));
  row("cells", "Cells within 5 of target", L => `${f1(Math.min(...wins(L)))}–${f1(Math.max(...wins(L)))}`, L => wins(L).every(w => Math.abs(w - WIN_TARGET[L]) <= 5));
  row("guardian", "Guardian − witch (worst)", L => { const g = gd(L); const w = g.reduce((a, x) => (Math.abs(x) > Math.abs(a) ? x : a), 0); return sgn(w); }, L => gd(L).every(x => Math.abs(x) <= 5));
  row("rounds", "Showdown median", L => String(lab(L).roundsMedian), L => inRange(lab(L).roundsMedian, [3, 5]));
  row("down", "A witch Down", L => f0(lab(L).anyDown), L => inRange(lab(L).anyDown, TARGETS[L].down));
  row("crit", "Criticals", L => f1(lab(L).crit), L => inRange(lab(L).crit, [15, 25]));
  row("fail", "Failures", L => f1(lab(L).fail), L => inRange(lab(L).fail, [10, 20]));
  row("magic", "Magic spent (median)", L => f0(lab(L).magicMedian), L => lab(L).magicMedian >= 50);
  row("ward", "Ward spent (median)", L => f0(lab(L).wardMedian), L => lab(L).wardMedian >= 50);
  row("potions", "Potions used", L => f0(lab(L).potionsUsed), L => lab(L).potionsUsed >= 70);
  return T;
}
function status(d) {
  const T = targets(d);
  const per = T.map(t => ({ ...t, oks: LABELS.map(L => t.ok(L)), texts: LABELS.map(L => t.cellText(L)) }));
  const seenOk = inRange(d.label.standard.seen, TARGETS.standard.seen);
  const publicOk = inRange(d.forcedAll, [15, 40]);
  const pw = Math.max(...Object.values(d.power).map(Math.abs));
  const missed = per.filter(t => !t.oks.every(Boolean)).map(t => t.key);
  if (!seenOk) missed.push("seen");
  if (!publicOk) missed.push("public");
  if (pw > 5) missed.push("powers");
  return { per, seenOk, publicOk, pw, missed, met: 14 - missed.length };
}
const MISS_NAME = { win: "win", loss: "loss", cells: "cells", guardian: "guardian", rounds: "showdown length", down: "Down", crit: "Criticals", fail: "Failures", magic: "Magic", ward: "Ward", potions: "potions", seen: "Seen", public: "public fights", powers: "Powers" };

/** One compact row with every §1 target; misses in bold. */
const HEAD = "| Option | Win E / S / H | Loss E / S / H | Cells E; S; H | Guardian − witch, worst E / S / H | Showdown median | Witch Down | Criticals | Failures | Magic | Ward | Potions used | Seen (S) | Public fights | Powers, worst | §1 targets met |";
const SEP = "|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|";
function fullRow(name, d) {
  const st = status(d);
  const g = k => { const t = st.per.find(x => x.key === k); return LABELS.map((L, i) => bold(t.texts[i], t.oks[i])).join(k === "cells" ? "; " : " / "); };
  const misses = st.missed.length ? `${st.met} of 14 (misses: ${st.missed.map(k => MISS_NAME[k]).join(", ")})` : "**14 of 14**";
  return `| ${name} | ${g("win")} | ${g("loss")} | ${g("cells")} | ${g("guardian")} | ${g("rounds")} | ${g("down")} | ${g("crit")} | ${g("fail")} | ${g("magic")} | ${g("ward")} | ${g("potions")} | ${bold(f1(d.label.standard.seen), st.seenOk)} | ${bold(f1(d.forcedAll), st.publicOk)} | ${bold(f1(st.pw), st.pw <= 5)} | ${misses} |`;
}

function report(R, { RUNS, SEED, identical }) {
  const L = [];
  const out = s => L.push(s);
  const base = R.base;
  const table = (ids, opts = {}) => {
    out(HEAD); out(SEP);
    out(fullRow("The book as it is (v0.9)", base));
    for (const id of ids) { const v = byId[id]; out(fullRow(`${v.name}${v.table ? " ‡" : ""}${opts.kind ? ` *(${v.kind})*` : ""}`, R[id])); }
    out("");
  };
  const cellRow = (d, L0) => cellsOf(L0).map(k => f1(d.cell[k].win)).join(" / ");
  const W = (id, L0) => R[id].label[L0];

  out("# Witch & Ward: balance study of the remaining misses");
  out("");
  out(`Rules: the book as it is (v0.9, \`docs/CORE-RULES.md\` and the chapters, rulings to 105). Command: \`node sim/study.mjs --runs ${RUNS} --seed ${SEED}\`. ${RUNS.toLocaleString("en")} episodes per cell, the same seed and runs as \`REPORT.md\`, so every "book as it is" row is REPORT.md's numbers. Same seed, same report.`);
  out("");
  out("**This is a study. It changes no rule, number or default.** Every option below is a setting the simulator already has, run on a copy of the defaults. A few options are player habits the book already allows, or rules the simulator has no setting for. Those run on a copy of the engine with small switches, each off by default. With every switch off, the copy gives exactly the same results as `grid.mjs`: " + (identical ? "checked, identical." : "**NOT identical**.") + " Options marked ‡ change the numbers table in Chapter 6 and need Richard's approval. All other options change a chapter's wording, or only how the simulated players play.");
  out("");
  out("How to read the option tables: each row is one full run over the grid (18 cells, " + (18 * RUNS).toLocaleString("en") + " episodes), with every REPORT.md §1 target. Numbers in **bold** miss their target. Win, loss and the other shares are % of episodes. Cells are the lowest and highest cell at each label. Guardian − witch is the worst of 3 / 4 / 5 players, in points of win. Ward and Magic are the median share spent. Potions used is REPORT.md's measure (potions made, including any lost to the carry limit). Public fights are pooled over all labels. Powers is the worst Power's distance from the average.");
  out("");

  // ------------------------------------------------ summary
  out("## 1. Summary");
  out("");
  out("| Miss (REPORT.md §1) | Now | Why | Recommendation | Ch 6 table? |");
  out("|---|---|---|---|---|");
  out(`| Easy win ~90% | ${f1(base.label.easy.win)}% | Easy can't be lost, so the Easy win is the chance the single Unmaking try works, about 85%. The seed matters too: seeds 2 and 3 give ${f1(W("seed2", "easy").win)}% and ${f1(W("seed3", "easy").win)}% | **Easy: the Unmaking leader adds up to +3 dice** (${f1(W("eUcap3", "easy").win)}%, Easy cells ${f1(Math.min(...cellsOf("easy").map(k => R.eUcap3.cell[k].win)))}–${f1(Math.max(...cellsOf("easy").map(k => R.eUcap3.cell[k].win)))}%) | yes: a new row |`);
  out(`| Every cell within 5 points | Easy ${f1(Math.min(...cellsOf("easy").map(k => base.cell[k].win)))}–${f1(Math.max(...cellsOf("easy").map(k => base.cell[k].win)))}, Standard ${f1(Math.min(...cellsOf("standard").map(k => base.cell[k].win)))}–${f1(Math.max(...cellsOf("standard").map(k => base.cell[k].win)))}, Hard ${f1(Math.min(...cellsOf("hard").map(k => base.cell[k].win)))}–${f1(Math.max(...cellsOf("hard").map(k => base.cell[k].win)))} | Each witch adds 2 dice to the Unmaking and 1 to its Difficulty, so bigger covens fail it more often (about 3–4 points per witch at Easy and Standard). That same slope gives a guardian coven (one witch fewer) its 3–5 point lead | Easy and Hard: fixed by their own changes. **Standard, 5 witches with no guardian player (${f1(base.cell[cellKey("standard", 5, false)].win)}%): leave it.** Every fix tested either breaks the guardian balance at 5 players, moves Hard out of its band, or does nothing | Easy and Hard rows only |`);
  out(`| Hard 55–60% | ${f1(base.label.hard.win)}% | ${f1(base.label.hard.win - 60)} points over; seeds 2 and 3 give ${f1(W("seed2", "hard").win)}% and ${f1(W("seed3", "hard").win)}%; one cell at ${f1(base.cell[cellKey("hard", 5, true)].win)}% | **Hard Toughness 4 × w + 1** (${f1(W("hT1", "hard").win)}%; Low Tide ${f1(R["lt:hT1"].label.hard.win)}%) | yes |`);
  out(`| Showdown median 3–5 rounds | Easy ${base.label.easy.roundsMedian} | The Easy threat Breaks in round 1 or 2 | **Easy Toughness 4 × w** (median ${W("eT4", "easy").roundsMedian}) | yes |`);
  out(`| Criticals 15–25% | ${LABELS.map(l => f1(base.label[l].crit)).join(" / ")} | Two 6s on pools of mostly 2–5 dice: the roll's shape, not a number | **Leave the rule; lower the target to 10–20%.** A rule that gets there changes Ch 2, every odds table, many worked rolls and the shared roll code, for a feel target | no |`);
  out(`| Ward: median guardian spends half | ${LABELS.map(l => f0(base.label[l].wardMedian)).join(" / ")}% | The simulated guardian never spends Ward as a helper die, though the book allows it and its own worked showdown does it | **No rule change.** A line of advice ("help the Unmaking with your Ward; it's lost at the end anyway"), and the simulator's guardian follows it: ${LABELS.map(l => f0(W("wardUnmake", l).wardMedian)).join(" / ")}% | no |`);
  out(`| 70% of brewed potions used | ${LABELS.map(l => f0(base.label[l].potionsUsed)).join(" / ")}% | The simulated brewers pick each potion's kind at random (ruling 70 says players choose), so Easy covens carry Healing nobody needs | **No rule change.** A line of advice ("brew what the fight needs") and the simulator's brewers follow it; with Easy Toughness 4 × w this gives ${LABELS.map(l => f0(W("recAll", l).potionsUsed)).join(" / ")}% | no |`);
  out(`| Seen in 5–15% of Standard episodes | ${f1(base.label.standard.seen)}% | ${f1(5 - base.label.standard.seen)} points short, inside the dice noise: seeds 2 and 3 give ${f1(W("seed2", "standard").seen)}% and ${f1(W("seed3", "standard").seen)}% | **Leave it.** The smallest number changes (Exposure 3, Clues 4 × n) cost Standard ${f1(base.label.standard.win - W("sExp3", "standard").win)} and ${f1(base.label.standard.win - W("sClue0", "standard").win)} points of win | no |`);
  out("");
  out("**Recommended set:** three table changes (Easy: the Unmaking leader adds up to +3 dice; Easy Toughness 4 × w; Hard Toughness 4 × w + 1) and two lines of advice, played by the simulator (the guardian helps the Unmaking with Ward; brew the potions the fight needs). No change for Criticals (lower the target), Seen (noise) or Standard with 5 witches (leave it). Against the targets:");
  out("");
  out(HEAD); out(SEP);
  out(fullRow("The book as it is (v0.9)", base));
  out(fullRow("Set: the three table changes ‡", R.recNumbers));
  out(fullRow("Set + the two advice lines played ‡", R.recAll));
  out(fullRow("Set + advice, seed 2 ‡", R.recAll2));
  out(fullRow("Set + advice, seed 3 ‡", R.recAll3));
  out("");
  const recMiss = status(R.recAll).missed;
  out(`With the set and the advice, what is still missed on seed ${SEED}: ${recMiss.length ? recMiss.map(k => MISS_NAME[k]).join(", ") : "nothing"}. The rows for seeds 2 and 3 show how much of the rest is dice noise. With the set and the advice, the Standard 5-witch cell is ${["recAll", "recAll2", "recAll3"].map(id => f1(R[id].cell[cellKey("standard", 5, false)].win)).join("%, ")}% on seeds ${SEED}, 2 and 3, and the worst guardian − witch at Standard is ${["recAll", "recAll2", "recAll3"].map(id => sgn(Math.max(...PLAYERS.map(p => R[id].cell[cellKey("standard", p, true)].win - R[id].cell[cellKey("standard", p, false)].win)))).join(", ")}.`);
  out("");
  out("Win by cell (3 players, 3 with a guardian player, 4, 4 with one, 5, 5 with one):");
  out("");
  out("| Label | The book as it is | Set | Set + advice |");
  out("|---|---|---|---|");
  for (const L0 of LABELS) out(`| ${NAME[L0]} | ${cellRow(base, L0)} | ${cellRow(R.recNumbers, L0)} | ${cellRow(R.recAll, L0)} |`);
  out("");
  out("Book text the set needs (each for Richard to approve):");
  out("");
  out("- **Ch 6 numbers table:** Toughness `4 × w | 3 × w | 4 × w + 1` (was `3 × w | 3 × w | 4 × w`), and a new row \"Unmaking: dice the leader may add: +3 | +2 | +2\". Then the same in CORE-RULES [T], the quick reference, the tracker sheet, `sim/params.mjs` NUMBERS, the Foundry numbers, and the Chapter 7 Unmaking box (\"up to +2 dice of their own\" gets \"+3 at Easy\").");
  out("- **Ch 7 worked examples:** the Night Market example (Easy) works out Toughness as 3 × 3 = 9, + 3 = 12; it becomes 4 × 3 = 12, + 3 = 15. Low Tide and every Hard episode's printed Toughness gets the + 1.");
  out("- **Advice:** Ch 4 or Ch 7, next to \"Keep 2 Magic for the Unmaking\": \"Ward is lost at the end too: in the Unmaking, help the leader with it.\" Ch 5: \"Brew what the fight will need: Blasting and Binding for any fight; Healing when the threat hits hard.\" These match rulings 70 and 103 and need no rule change.");
  out("- **Targets (DESIGN Q16):** Criticals \"10–20% of rolls\" instead of 15–25%. Potions: count only potions the coven keeps (see §8).");
  out("");

  // ------------------------------------------------ per miss
  const missSection = (n, title, why, ids, rec) => {
    out(`## ${n}. ${title}`);
    out("");
    for (const p of why) { out(p); out(""); }
    table(ids, { kind: true });
    for (const p of rec) { out(p); out(""); }
  };

  missSection(2, "Easy win ~90% (now " + f1(base.label.easy.win) + "%)", [
    `**Why.** Easy has no losses (${f1(base.label.easy.loss)}%). Every Easy episode that isn't a Win is a threat that fled, because the one Unmaking try failed. The coven waits for the round after the threat Breaks, so that every witch can join; then the threat flees at the end of that round. The Unmaking hit rate by cell is ${cellsOf("easy").map(k => f1(base.cell[k].unmakeHit)).join(" / ")}% (3 players, 3 with a guardian player, 4, 4 with one, 5, 5 with one), and the Easy win by cell follows it exactly: ${cellRow(base, "easy")}. So Toughness, Clues and the Lead Difficulty barely move the Easy win (Toughness 4 × w: ${f1(W("eT4", "easy").win)}%). Only the Unmaking does.`,
    `A second try doesn't help on its own: with a Broken threat staying a round longer, the coven has spent the Magic it needs on the first try (${f1(W("eFlee2", "easy").win)}%).`,
    `The pooled miss is small (${f1(base.label.easy.win)}% against 85%) and within seed noise (seeds 2 and 3: ${f1(W("seed2", "easy").win)}%, ${f1(W("seed3", "easy").win)}%). The cells for 4 and 5 witches (${f1(base.cell[cellKey("easy", 4, false)].win)}%, ${f1(base.cell[cellKey("easy", 5, false)].win)}%, and ${f1(base.cell[cellKey("easy", 5, true)].win)}% for 4 witches + guardian) are the real miss.`,
  ], ["eUcap3", "eCap3", "eJoin3", "eUm1", "eUm45", "eFlee2"], [
    `**Recommendation: Easy, the Unmaking leader may add up to +3 dice** (Ch 6 table, new row; Ch 7 Unmaking box). Easy goes to ${f1(W("eUcap3", "easy").win)}% with every Easy cell at ${f1(Math.min(...cellsOf("easy").map(k => R.eUcap3.cell[k].win)))}–${f1(Math.max(...cellsOf("easy").map(k => R.eUcap3.cell[k].win)))}%. The guardian stays within ${f1(Math.max(...PLAYERS.map(p => Math.abs(R.eUcap3.cell[cellKey("easy", p, true)].win - R.eUcap3.cell[cellKey("easy", p, false)].win))))} points of a witch, and nothing at Standard or Hard moves. The general \"+3 extra dice at Easy\" gives almost the same numbers (${f1(W("eCap3", "easy").win)}%), but changes the core roll's limit for every Easy roll, so it costs more text for no gain. Each joiner adding 3 dice overshoots (${f1(W("eJoin3", "easy").win)}%, one cell over 95%). The Difficulty options either overshoot or break the guardian balance: a guardian coven has one witch fewer, so it gets a different Difficulty.`,
    `If Richard would rather not add a row for ${f1(85 - base.label.easy.win)} points of pooled win: leaving Easy as it is is defensible (the pooled win is inside seed noise). But then ${cellsOf("easy").filter(k => base.cell[k].win < 85).length} of the 6 Easy cells stay under 85% (lowest ${f1(Math.min(...cellsOf("easy").map(k => base.cell[k].win)))}%).`,
  ]);

  missSection(3, "Every cell within 5 points of its label's target", [
    `**Why.** Cells now: Easy ${cellRow(base, "easy")}; Standard ${cellRow(base, "standard")}; Hard ${cellRow(base, "hard")} (3 players, 3 with a guardian player, 4, 4 with one, 5, 5 with one). At Easy and Standard the win falls by about 3–4 points for each extra witch. The Unmaking adds 2 dice and 1 Difficulty per witch, so the dice spread grows faster than the margin (Unmaking hit by cell at Standard: ${cellsOf("standard").map(k => f1(base.cell[k].unmakeHit)).join(" / ")}%). Hard has no such slope (Toughness 4 × w and more losses in the fight), and its 4-character covens face 2 attacks among 4 people.`,
    `The Easy spread is fixed by §2 and the Hard cell by §4. What's left is **Standard, 5 witches with no guardian player: ${f1(base.cell[cellKey("standard", 5, false)].win)}%** (2.6 points under 70%; seeds 2 and 3: ${f1(R.seed2.cell[cellKey("standard", 5, false)].win)}%, ${f1(R.seed3.cell[cellKey("standard", 5, false)].win)}%).`,
  ], ["umCap4", "umCap4ES", "join3d1", "t5m3", "tByN", "no3T", "att4is1"], [
    `**Recommendation: leave Standard's 5-witch cell.** Any per-size Unmaking rule gives the 5-witch coven a lower Difficulty than the 4 witches + guardian coven at the same table size, and the guardian falls 9 points behind a witch. Less Toughness against 5 witches does nothing, because that coven loses at the Unmaking, not in the fight. Each joiner adding 3 dice against witches + 1 flattens Standard but puts Hard's cells at ${f1(Math.min(...cellsOf("hard").map(k => R.join3d1.cell[k].win)))}–${f1(Math.max(...cellsOf("hard").map(k => R.join3d1.cell[k].win)))}%. The +3 Toughness against any 3 characters trims Standard's top cell, but drops Hard's 2 witches + guardian to ${f1(R.tByN.cell[cellKey("hard", 3, true)].win)}%. A new rule for one cell that is 2.6 points short costs more than it gains. If anything: one line in Ch 9 telling a Storyteller with five witches at Standard that the fight is a little harder (about 67% wins), or that one of them can play the guardian (72%).`,
    `The two per-size rules both earn their place. Without the +3 Toughness against 3 witches, Hard's 3-witch cell goes to ${f1(R.no3T.cell[cellKey("hard", 3, false)].win)}%. With 1 attack against 4 characters, Hard's cells go to ${f1(Math.min(...cellsOf("hard").map(k => R.att4is1.cell[k].win)))}–${f1(Math.max(...cellsOf("hard").map(k => R.att4is1.cell[k].win)))}%. Keep both as they are.`,
  ]);

  missSection(4, "Hard 55–60% (now " + f1(base.label.hard.win) + "%)", [
    `**Why.** Hard sits ${f1(base.label.hard.win - 60)} points over the band, on every seed (${f1(W("seed2", "hard").win)}%, ${f1(W("seed3", "hard").win)}%), and its 4 witches + guardian cell is at ${f1(base.cell[cellKey("hard", 5, true)].win)}% (limit 62.5%). Ruling 105 moved it there. A small step down fixes both.`,
  ], ["hT1", "hDanger4", "hTG1", "hT2", "hHit4", "hClue1", "hExp3"], [
    `Low Tide (the Hard episode, with Lure) under the two smallest options, Hard only:`,
  ]);
  out("| Low Tide (Hard, Lure) | Win / Partial / Loss | Cells | A witch Down | In band (55–60%) and every cell within 5? |");
  out("|---|---|---|---|---|");
  for (const id of ["lt:base", "lt:hT1", "lt:hDanger4", "lt:recAll"]) {
    const h = R[id].label.hard, w = cellsOf("hard").map(k => R[id].cell[k].win);
    const ok = inRange(h.win, TARGETS.hard.win) && w.every(x => Math.abs(x - WIN_TARGET.hard) <= 5);
    out(`| ${byId[id].name.replace("Low Tide, ", "").replace("Low Tide as the book is", "The book as it is")} | ${f1(h.win)} / ${f1(h.partial)} / ${f1(h.loss)} | ${f1(Math.min(...w))}–${f1(Math.max(...w))} | ${f0(h.anyDown)} | ${ok ? "yes" : "**no**"} |`);
  }
  out("");
  out(`**Recommendation: Hard Toughness 4 × w + 1** (Ch 6 table). Hard goes to ${f1(W("hT1", "hard").win)}%, with cells ${f1(Math.min(...cellsOf("hard").map(k => R.hT1.cell[k].win)))}–${f1(Math.max(...cellsOf("hard").map(k => R.hT1.cell[k].win)))}% and loss ${f1(W("hT1", "hard").loss)}%. That leaves about 2 points of room on both sides, and Low Tide is ${f1(R["lt:hT1"].label.hard.win)}%. Danger 4 is the other one-number step. But it leaves Hard at the top of its band (${f1(W("hDanger4", "hard").win)}%, top cell ${f1(Math.max(...cellsOf("hard").map(k => R.hDanger4.cell[k].win)))}%), puts Low Tide's top cell over (${f1(Math.max(...cellsOf("hard").map(k => R["lt:hDanger4"].cell[k].win)))}%), and also makes Lure's Heart roll harder. 1 more Toughness against a guardian player only works on guardian covens. Toughness + 2, Clues 4 × n + 1 and Exposure 3 are each too big a step.`);
  out("");

  missSection(5, "Showdown median 3–5 rounds (Easy now " + base.label.easy.roundsMedian + ")", [
    `**Why.** Also a §1 miss, though not in the list this study was asked about. With Defence 1 nearly every Easy attack works, and Toughness 3 × w breaks in round 1 or 2; the Unmaking takes the next round.`,
  ], ["eT4", "eT5", "eT6"], [
    `**Recommendation: Easy Toughness 4 × w** (Ch 6 table). The median goes to ${W("eT4", "easy").roundsMedian} rounds with no other target moving: Easy win ${f1(W("eT4", "easy").win)}%, a witch Down ${f0(W("eT4", "easy").anyDown)}%, and Easy potions used up from ${f0(base.label.easy.potionsUsed)}% to ${f0(W("eT4", "easy").potionsUsed)}% (more rounds to use them in). The Easy threat stays gentler in every other number (Defence 1, Danger 1, Hit 2), so a tougher Easy threat is a longer fight, not a harder one. 6 × w puts an Easy cell under 80%.`,
  ]);

  // Criticals
  out("## 6. Criticals 15–25% of rolls (now " + LABELS.map(l => f1(base.label[l].crit)).join(" / ") + "%)");
  out("");
  const mix = R["@rollMix"];
  out("**Why.** A Critical needs two 6s on a success. The rolls the coven makes are mostly 2–5 dice, so two 6s come up on about 13% of rolls. That is the roll's shape, not a number in the table. The roll mix, all cells pooled (share of rolls by dice, and by Difficulty):");
  out("");
  out("| Label | 1 die | 2 | 3 | 4 | 5 | 6 | 7+ | Difficulty 1 | 2 | 3+ |");
  out("|---|---|---|---|---|---|---|---|---|---|---|");
  for (const L0 of LABELS) {
    const m = mix[L0]; const tot = Object.values(m).reduce((a, b) => a + b, 0);
    const byN = n => Object.entries(m).filter(([k]) => (n === 7 ? +k.split("|")[0] >= 7 : +k.split("|")[0] === n)).reduce((a, [, v]) => a + v, 0);
    const byD = d => Object.entries(m).filter(([k]) => (d === 3 ? +k.split("|")[1] >= 3 : +k.split("|")[1] === d)).reduce((a, [, v]) => a + v, 0);
    out(`| ${NAME[L0]} | ${[1, 2, 3, 4, 5, 6, 7].map(n => f0((100 * byN(n)) / tot)).join(" | ")} | ${[1, 2, 3].map(d => f0((100 * byD(d)) / tot)).join(" | ")} |`);
  }
  out("");
  out("Bigger pools would mean retuning every label. So the options are new Critical rules:");
  out("");
  table(["critSmall", "critHard", "critSmall3"], { kind: true });
  out(`**Recommendation: leave the Critical rule as it is, and lower the target to 10–20%.** "Any 6 on 1 or 2 dice" is the only rule tested that lands in 15–25% at every label (${LABELS.map(l => f1(W("critSmall", l).crit)).join(" / ")}%), and it moves the wins by ${LABELS.map(l => sgn(W("critSmall", l).win - base.label[l].win)).join(" / ")} points. But it rewards the smallest pools, which is odd. It also changes the core roll in Ch 2, the odds tables in Ch 2, Ch 9 and REPORT.md §9, the shared roll code in \`module/logic/rules.mjs\` and its tests, and many worked rolls in the chapters that read "one 6: a Success". The target came from another game's pools (DESIGN-RULES A19). The cost of a new rule is bigger than the gain. Of the other two, "Difficulty 3 or more" falls short at Easy, where nearly every roll is against Difficulty 1 (${LABELS.map(l => f1(W("critHard", l).crit)).join(" / ")}%), and "3 dice or fewer" gives too many at Easy (${LABELS.map(l => f1(W("critSmall3", l).crit)).join(" / ")}%).`);
  out("");

  // Ward
  out("## 7. Ward: the median guardian spends at least half (now " + LABELS.map(l => f0(base.label[l].wardMedian)).join(" / ") + "%)");
  out("");
  const wHist = L0 => { const wf = base.label[L0].wardFrac; const h = {}; for (const x of wf) h[Math.round(x * 5)] = (h[Math.round(x * 5)] || 0) + 1; return [0, 1, 2, 3, 4, 5].map(k => f0((100 * (h[k] || 0)) / wf.length)).join(" / "); };
  const gUse = (L0, k) => ((base.label[L0].use[k] || 0) * base.label[L0].runs / Math.max(1, base.label[L0].guardianRuns)).toFixed(2);
  out(`**Why.** Ward spent per guardian, share of guardians spending 0 / 1 / 2 / 3 / 4 / 5: Easy ${wHist("easy")}; Standard ${wHist("standard")}; Hard ${wHist("hard")}. Every simulated guardian spends 2 on Sense in the investigation (it keeps 3 for the fight). In the fight it spends only on Mend (${LABELS.map(l => gUse(l, "gift:mend")).join(" / ")} per episode), Shield (${LABELS.map(l => gUse(l, "gift:shield")).join(" / ")}) and Carry. At Easy nobody gets hurt, so there is nothing to spend on. At Hard the guardian goes Down in ${f0(base.label.hard.guardianDown)}% of episodes and can't spend after that. The simulated guardian **never helps a roll with Ward**, though the book allows it (Ch 2: helpers pay 1 Magic or Ward) and Chapter 7's worked showdown has Rook do it twice in the Unmaking.`);
  out("");
  table(["wardUnmake", "wardBoth", "mendFree", "shield2", "gUnmake1", "ward4"], { kind: true });
  out(`**Recommendation: no rule change.** Add a line of advice, and have the simulator's guardian follow it. In the Unmaking the guardian pays the leader's extra dice with Ward before the witches pay Magic (Ward is lost at the end anyway). That alone meets the target at every label (${LABELS.map(l => f0(W("wardUnmake", l).wardMedian)).join(" / ")}%). It is play the book already allows, so the simulator should do it whatever Richard decides. Be aware that it makes guardian covens a little stronger. When the witches are short of Magic, the guardian now fills the leader's dice. At Standard with 3 players the guardian's edge goes from ${sgn(base.cell[cellKey("standard", 3, true)].win - base.cell[cellKey("standard", 3, false)].win)} to ${sgn(R.wardUnmake.cell[cellKey("standard", 3, true)].win - R.wardUnmake.cell[cellKey("standard", 3, false)].win)} points, and that cell goes to ${f1(R.wardUnmake.cell[cellKey("standard", 3, true)].win)}%. That is the real game showing through, not a cost of the advice. No rule option works. Mend with no action, two Shields and 4 Ward don't raise the share. Joining the Unmaking for Ward does, but makes a guardian player worth up to ${f1(Math.max(...LABELS.flatMap(l => PLAYERS.map(p => R.gUnmake1.cell[cellKey(l, p, true)].win - R.gUnmake1.cell[cellKey(l, p, false)].win))))} points more than a witch.`);
  out("");

  // Potions
  out("## 8. 70% of brewed potions get used (now " + LABELS.map(l => f0(base.label[l].potionsUsed)).join(" / ") + "%)");
  out("");
  const pu = (L0, k) => (base.label[L0].use[k] || 0).toFixed(2);
  out(`**Why.** Potions per episode, kept and used, Blasting / Healing / Binding: Easy ${["blasting", "healing", "binding"].map(k => `${pu("easy", `brewed:${k}`)} → ${pu("easy", `potion:${k}`)}`).join(", ")}; Standard ${["blasting", "healing", "binding"].map(k => `${pu("standard", `brewed:${k}`)} → ${pu("standard", `potion:${k}`)}`).join(", ")}; Hard ${["blasting", "healing", "binding"].map(k => `${pu("hard", `brewed:${k}`)} → ${pu("hard", `potion:${k}`)}`).join(", ")}. Blasting nearly always gets used. Healing at Easy almost never does, because nobody gets hurt there. Binding gets used about once a round, because the threat loses at most one attack a round. The simulated brewer picks each kind at random, but ruling 70 says the player chooses. Two more things pull the share down. REPORT.md counts potions lost to the carry limit as brewed (made ${LABELS.map(l => f1(base.label[l].potionsPerEp)).join(" / ")} per episode; counting only kept potions, the share used is ${LABELS.map(l => f0(base.label[l].keptUsed)).join(" / ")}%). And potions left when the threat Breaks are never used, since nobody drinks during the Unmaking round.`);
  out("");
  table(["potNeed", "potAttack", "yield1", "cap2", "brewOne"], { kind: true });
  out(`**Recommendation: no rule change.** Add a line of advice in Ch 5 ("brew what the fight will need: Blasting and Binding for any fight, Healing when the threat hits hard"), and have the simulator's brewers choose kinds that way. Standard and Hard then meet the target (${f0(W("potNeed", "standard").potionsUsed)}% and ${f0(W("potNeed", "hard").potionsUsed)}%). Easy gets to ${f0(W("potNeed", "easy").potionsUsed)}% on its own, and ${f0(W("recAll", "easy").potionsUsed)}% with Easy Toughness 4 × w (§5), because there are more rounds to use potions in. Making only Blasting and Binding costs Hard ${sgn(W("potAttack", "hard").win - base.label.hard.win)} points, so one Healing at Standard and Hard is worth keeping. The rule options only move the share by making fewer potions: one potion per brew, or a carry limit of 2. Neither reaches 70% at Easy, and both make potions smaller for no reason. Also worth deciding: count only kept potions for this target, since a potion lost to the carry limit was never the coven's.`);
  out("");

  // Seen
  out("## 9. Seen in 5–15% of Standard episodes (now " + f1(base.label.standard.seen) + "%)");
  out("");
  out(`**Why.** ${f1(base.label.standard.seen)}% is ${f1(5 - base.label.standard.seen)} points short. With ${(6 * RUNS).toLocaleString("en")} Standard episodes the dice noise on that share is about ±0.2 points, and seeds 2 and 3 give ${f1(W("seed2", "standard").seen)}% and ${f1(W("seed3", "standard").seen)}%. Exposure does bind: ${f1(base.label.standard.forced)}% of Standard episodes end in a public fight, and in ${f0(base.label.standard.pressured)}% of those the coven holds back or is Seen (REPORT.md §3).`);
  out("");
  table(["sExp3", "sClue0", "reckless", "seed2", "seed3"], { kind: true });
  out(`**Recommendation: leave it.** It isn't a real miss. The smallest number changes (3 Exposure boxes, or Clues 4 × n) roughly double the Seen share, but cost Standard ${sgn(W("sExp3", "standard").win - base.label.standard.win)} and ${sgn(W("sClue0", "standard").win - base.label.standard.win)} points of win, which breaks the Standard band and its cells.`);
  out("");

  // Side findings
  out("## 10. Other findings");
  out("");
  out(`- **Chapter 7's Unmaking \"Timing\" advice costs wins.** It says: \"If most of the coven has already acted, try now with whoever is left: a failed try costs no Hurt, only Magic.\" Played that way, the coven wins ${LABELS.map(l => sgn(W("unmakeNow", l).win - base.label[l].win)).join(" / ")} points less (Easy / Standard / Hard). The small early try spends the Magic the full try needs next round. Suggested wording for Richard: \"Unless it will flee first, wait for the next round, when every standing witch can join.\" This is advice, not a rule, but it changes how tables play.`);
  out(`- **The guardian row is near its limit on every seed.** Guardian − witch at Standard is ${PLAYERS.map(p => sgn(base.cell[cellKey("standard", p, true)].win - base.cell[cellKey("standard", p, false)].win)).join(" / ")} on seed ${SEED}, ${PLAYERS.map(p => sgn(R.seed2.cell[cellKey("standard", p, true)].win - R.seed2.cell[cellKey("standard", p, false)].win)).join(" / ")} on seed 2 and ${PLAYERS.map(p => sgn(R.seed3.cell[cellKey("standard", p, true)].win - R.seed3.cell[cellKey("standard", p, false)].win)).join(" / ")} on seed 3. One cell's win has about ±1 point of noise at ${RUNS.toLocaleString("en")} runs, so a difference of two cells has about ±1.4. A guardian player is worth about 4 points more than a witch at Easy and Standard, and that edge comes mostly from the Unmaking: a guardian coven has one witch fewer, so a lower Difficulty. REPORT.md's \"yes\" on that row is luck as much as balance. Consider more runs for that row, or a 6-point limit.`);
  out(`- **What the simulator should change, whatever Richard decides** (\`sim/engine.mjs\` policies, not rules): the guardian helps the Unmaking with Ward; brewers choose potion kinds. Both are play the book already allows. Ward spent goes from ${LABELS.map(l => f0(base.label[l].wardMedian)).join(" / ")}% to ${LABELS.map(l => f0(W("wardUnmake", l).wardMedian)).join(" / ")}%, and potions used from ${LABELS.map(l => f0(base.label[l].potionsUsed)).join(" / ")}% to ${LABELS.map(l => f0(W("potNeed", l).potionsUsed)).join(" / ")}%. Until then, those two rows measure the simulated players more than the rules.`);
  out("- **Each threat's signature move:** with the recommended Hard Toughness, Low Tide stays inside its band (§4). The other ready-made episodes use Easy and Standard, where the threat's move changes the win by less than a point (REPORT-threats.md), so this study runs them with the generic move.");
  out("");

  // All runs
  out("## 11. Every run");
  out("");
  out("Every option in this study in one table, in the order run. Low Tide's runs are in §4.");
  out("");
  out(HEAD); out(SEP);
  out(fullRow("The book as it is (v0.9)", base));
  for (const v of V) if (v.id !== "base" && !v.id.startsWith("lt:")) out(fullRow(`${v.name}${v.table ? " ‡" : ""}`, R[v.id]));
  out("");
  out("‡ changes the Chapter 6 numbers table.");
  out("");
  out("What each study switch on the engine copy does (`sim/study.mjs` ENGINE_HOOKS; all off by default):");
  out("");
  for (const [what] of ENGINE_HOOKS) if (what !== "imports") out(`- ${what}`);
  out("");
  return L.join("\n") + "\n";
}

// ---------------------------------------------------------------- workers
if (!isMainThread) {
  const { ids, runs, seed, baseCells } = workerData;
  for (const id of ids) parentPort.postMessage({ id, d: id === "@rollMix" ? rollMix({ runs, seed }) : runVariant(byId[id], { runs, seed, baseCells }) });
} else {
  await main();
}
