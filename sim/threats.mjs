#!/usr/bin/env node
/**
 * Runs each threat's signature move over the whole grid and writes
 * sim/REPORT-threats.md: the three ready-made episodes against the targets,
 * every move at every label and cell, how often each move comes up, flags,
 * and a few sensitivity runs.
 *   node sim/threats.mjs [--runs 2000] [--seed 1] [--out sim/REPORT-threats.md]
 * The runs per cell and the seed default to REPORT.md's, so the generic rows
 * match REPORT.md exactly. Same seed and runs → same report.
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runGrid, LABELS, PLAYERS, cellKey } from "./grid.mjs";
import { merge, summary, mean } from "./recorder.mjs";
import { baseSettings, THREATS, THREAT_JUDGEMENT, TARGETS, WIN_TARGET } from "./params.mjs";

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith("--") ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const RUNS = +(args.runs || 2000);
const SEED = +(args.seed || 1);
const OUT = args.out || join(dirname(fileURLToPath(import.meta.url)), "REPORT-threats.md");

const NAME = { easy: "Easy", standard: "Standard", hard: "Hard" };
/** docs/CONTENT.md "Ready-made episodes". */
const EPISODES = [
  { n: 1, name: "Night Market", label: "easy", move: "quietMan" },
  { n: 2, name: "Cinders", label: "standard", move: "ashWidow" },
  { n: 3, name: "Low Tide", label: "hard", move: "drownedChoir" },
];
const MOVES = THREATS.values;
const SIX = MOVES.filter(m => !THREATS.moves[m].yardstick);
const short = m => THREATS.moves[m].short;
/** Flag thresholds. */
const DEAD = 2;      // DESIGN-RULES A9: "flags any option worth less than ±2 points"
const OFF = 5;       // DESIGN Q16: every cell within 5 points of its label's win target
const DOMINANT = 5;  // a move this many points of win harder than the book's yardstick

/** Suggested fixes, printed only when the matching flag fires. Functions read the runs below when the flag fires. */
const FIX = {
  label: Object.fromEntries(EPISODES.map(e => [e.label, () => {
    const g = P("generic", e.label), w = cellsOf([e.label]).map(c => C("generic", c.key).win);
    return `Not the move: with the generic move ${NAME[e.label]} is ${f1(g.win)}% (cells ${f1(Math.min(...w))}–${f1(Math.max(...w))}%, REPORT.md §1), off in the same way, and ${short(e.move)} changes the pooled win by ${sgn(winVs(e.move, "generic", e.label))} points. Leave ${short(e.move)} as it is.`;
  }])),
  drownedChoir: {
    off: () => {
      const L = "hard", y = P("twoAttacks", L).win, w = P("drownedChoir", L).win, top = TARGETS[L].win[1];
      const asYard = Math.abs(w - y) < DEAD;
      return `Lure is already ruling 88 (one attack, then the Lure roll). Low Tide is ${f1(w)}%${w > top ? `, ${f1(w - top)} points over the top of the band` : ""}; the generic move gives ${f1(P("generic", L).win)}% and "two different characters" ${f1(y)}%. ${asYard ? `Lure is within ±${DEAD} points of the book's yardstick, so no further change to Lure. Hard sits at the top of its band with any move of that strength (§3); moving Low Tide into the middle of the band would mean changing the Hard numbers, for the whole label.` : `That is still ${sgn(w - y)} points from the book's yardstick; the next smallest step is a cost on the Lure roll (1 Hurt on a Failure), which needs a new simulation first.`}`;
    },
    weak: () => {
      const small = LABELS.every(L => Math.abs(worth("drownedChoir", L)) < DEAD);
      return `Lure is already ruling 88, with an attack in it. It is now ${LABELS.map(L => `${NAME[L]} ${sgn(-worth("drownedChoir", L))}`).join(", ")} points against a plain attack${small ? `, all within ±${DEAD}, so no change is needed` : `; the next smallest step is a cost on the Lure roll, which needs a new simulation first`}.`;
    },
    dead: () => "See the note under this table.",
  },
  mirrorThief: {
    weak: () => {
      const better = ["standard", "hard"].every(L => worth("faceHeavy", L, VC) > 0);
      return `"Borrowed Face: attack the witch with the most Magic left, with Hit 1 higher; on a Failure they also lose 1 Magic." Tested (§8): ${LABELS.map(L => `${NAME[L]} ${sgn(-worth("faceHeavy", L, VC))}`).join(", ")} points against a plain attack, so it ${better ? "is no longer weaker than a plain attack" : "is still no stronger than a plain attack"}. It isn't in a ready-made episode, so this is low priority.`;
    },
    dead: () => "See the note under this table.",
  },
  quietMan: {
    rider: () => {
      const strongest = ["standard", "hard"].every(L => SIX.every(m => P("quietMan", L).win <= P(m, L).win));
      return `None needed for balance: ${strongest ? "Hush is already the hardest of the six at Standard and Hard, because it is two attacks" : "Hush is two attacks, as strong as the book's yardstick"}. The rider rarely bites, because a hushed witch still makes a plain Nerve attack and loses only her Power's 2 dice or a spell.`;
    },
    dead: () => "See the note under this table.",
  },
  ashWidow: { dead: () => "See the note under this table." },
  nightNurse: { dead: () => "See the note under this table." },
  vesperCrane: { dead: () => "See the note under this table." },
  yardstick: () => `None: Chapter 10's yardstick for a move is itself under ±${DEAD} points, so every move meets "about as strong as two different characters", and none is dominant.`,
};
/** What this report leaves out. */
const NOT_COVERED = [
  "Shelter is never cast (as in REPORT.md), so Shelter against Cinders, and Shelter not stopping Lure, never come up.",
  "Seasons (REPORT.md §11, `season.mjs`) still use the generic move for all six kinds of threat.",
  "Low Tide played as the 3rd episode of a season (Chapter 16's Season column: 2 more Toughness per witch, after the coven has grown once) isn't run. Every episode here starts fresh, as in REPORT.md.",
  "The episodes' leads, twists and places are story. Only the label and the threat's move change the numbers.",
  "Nobody plays around a move: no witch keeps Magic low against Borrowed Face or puts a higher rating into Heart against Lure.",
];
const fx = f => (typeof f === "function" ? f() : f);
const andList = a => (a.length < 2 ? a.join("") : `${a.slice(0, -1).join(", ")} and ${a[a.length - 1]}`);

const f0 = x => x.toFixed(0);
const f1 = x => x.toFixed(1);
const pctS = x => `${f0(x)}%`;
const sgn = x => (Math.abs(x) < 0.05 ? "0.0" : `${x > 0 ? "+" : "−"}${f1(Math.abs(x))}`);
const inRange = (x, [a, b]) => x >= a - 1e-9 && x <= b + 1e-9;
const mark = ok => (ok ? "yes" : "**no**");
const wpl = s => `${pctS(s.win)} / ${pctS(s.partial)} / ${pctS(s.loss)}`;
const cellsOf = (labels = LABELS) => labels.flatMap(L => PLAYERS.flatMap(p => [false, true].map(g => ({ L, p, g, key: cellKey(L, p, g) }))));

// ---------------------------------------------------------------- runs
const t0 = Date.now();
let episodes = 0;
/** One setting over the grid (or some labels): pooled and per-cell summaries, plus the share of episodes where the move was used. */
function run(settings, labels = LABELS) {
  const used = {};
  const cells = runGrid({ runs: RUNS, seed: SEED, settings, labels, onEpisode: (ep, i, key) => { if (ep.use["sig:move"]) used[key] = (used[key] || 0) + 1; } });
  const digest = keys => {
    const m = merge(keys.map(k => cells[k]));
    return { ...summary(m), roundsMean: mean(m.rounds), usedEp: (100 * keys.reduce((a, k) => a + (used[k] || 0), 0)) / m.runs };
  };
  const out = { pooled: {}, cell: {} };
  for (const L of labels) out.pooled[L] = digest(cellsOf([L]).map(c => c.key));
  for (const c of cellsOf(labels)) out.cell[c.key] = digest([c.key]);
  episodes += Object.values(cells).reduce((a, c) => a + c.runs, 0);
  return out;
}
const base = baseSettings();
const V = Object.fromEntries(MOVES.map(m => [m, run({ ...base, threat: m })]));
const P = (m, L) => V[m].pooled[L];
const C = (m, key) => V[m].cell[key];

// Sensitivity: Lure's open points, at Hard (Low Tide).
const lureRows = [["(defaults)", "—", V.drownedChoir.pooled.hard, V.drownedChoir]];
for (const [k, d] of Object.entries(THREAT_JUDGEMENT)) for (const v of d.values) if (v !== d.default) {
  const r = run({ ...base, threat: "drownedChoir", threatJudgement: { ...base.threatJudgement, [k]: v } }, ["hard"]);
  lureRows.push([k, v, r.pooled.hard, r]);
}
// A candidate rule change, not in the book: a 5 also uses the signature move.
const FIVE = ["plain", "twoAttacks", ...SIX];
const V5 = Object.fromEntries(FIVE.map(m => [m, run({ ...base, threat: m, rules: { ...base.rules, signatureFrom: 5 } })]));
// Candidate fixes, not in the book (params.mjs THREATS.candidates), next to the plain attack they are measured against.
const CAND = Object.keys(THREATS.candidates);
const VC = { plain: V.plain, twoAttacks: V.twoAttacks, ...Object.fromEntries(CAND.map(m => [m, run({ ...base, threat: m })])) };

// ---------------------------------------------------------------- measures
const winVs = (m, ref, L, v = V) => v[m].pooled[L].win - v[ref].pooled[L].win;
/** Points of win a move takes off the coven compared with a plain attack (positive = the move makes the episode harder). */
const worth = (m, L, v = V) => v.plain.pooled[L].win - v[m].pooled[L].win;
const cellOff = (m, c) => Math.abs(C(m, c.key).win - WIN_TARGET[c.L]) > OFF;

// ---------------------------------------------------------------- report
const lines = [];
const out = s => lines.push(s);
out("# Witch & Ward: the threats' signature moves");
out("");
out(`Rules: book Chapter 7 and Chapter 10 (the moves and whom they target), \`docs/CONTENT.md\` (which threat each ready-made episode uses), rulings 63, 64, 81, 82 and 85 in \`book/REVIEW.md\`. Command: \`node sim/threats.mjs --runs ${RUNS} --seed ${SEED}\`. ${RUNS.toLocaleString("en")} episodes per cell, the same runs and seed as \`REPORT.md\`, so the **generic** rows below are REPORT.md's numbers. ${episodes.toLocaleString("en")} episodes in all. Same seed, same report.`);
out("");
out("Every run plays the same coven with the same dice under every move (common random numbers). Two moves only play differently from the first 6 on which they do something different, so small differences between moves are the moves, not luck.");
out("");
out(`The six threats' moves are run next to three yardsticks: **generic** (the move REPORT.md uses), **plain** (a 6 is only an ordinary attack, aimed like a 4–5: the floor) and **two attacks** ("attack two different characters" read by ruling 63, the move for a threat with none, and the book's yardstick for a new move). Section 9 lists every reading used. The targets are REPORT.md §1 (DESIGN Q16).`);
out("");

// ---------------------------------------------------------------- 1. episodes
out("## 1. The three ready-made episodes");
out("");
out(`Win / Partial / Loss with the episode's own threat, against the same cell with the generic move. **Win vs target** is the win minus the label's target (Easy 90, Standard 75, Hard 57.5); bold when more than ${OFF} points off.`);
out("");
out("| Episode | Players | Guardian player | Win / Partial / Loss | Generic move | Win vs generic | Win vs target |");
out("|---|---|---|---|---|---|---|");
for (const e of EPISODES) {
  const title = `${e.n}. ${e.name} (${NAME[e.label]}, ${short(e.move)})`;
  for (const c of cellsOf([e.label])) {
    const s = C(e.move, c.key), g = C("generic", c.key);
    const d = s.win - WIN_TARGET[e.label];
    out(`| ${title} | ${c.p} | ${c.g ? "yes" : "no"} | ${wpl(s)} | ${wpl(g)} | ${sgn(s.win - g.win)} | ${Math.abs(d) > OFF ? `**${sgn(d)}**` : sgn(d)} |`);
  }
  const s = P(e.move, e.label), g = P("generic", e.label);
  const d = s.win - WIN_TARGET[e.label];
  out(`| **${title}** | **all** | | **${wpl(s)}** | ${wpl(g)} | ${sgn(s.win - g.win)} | ${Math.abs(d) > OFF ? `**${sgn(d)}**` : sgn(d)} |`);
}
out("");

// ---------------------------------------------------------------- 2. targets
out("## 2. The episodes against the targets");
out("");
out("Each episode with its own threat, then its label with the generic move (REPORT.md §1).");
out("");
out("| Target (DESIGN Q16) | " + EPISODES.map(e => `${e.n}. ${e.name} | ${NAME[e.label]}, generic`).join(" | ") + " |");
out("|---|" + "---|".repeat(EPISODES.length * 2));
const tRows = [
  ["Win: Easy ~90%, Standard ~75%, Hard 55–60%", (m, L) => [pctS(P(m, L).win), inRange(P(m, L).win, TARGETS[L].win)]],
  ["Loss: Easy ≤5%, Standard 5–15%, Hard 15–30%", (m, L) => [pctS(P(m, L).loss), inRange(P(m, L).loss, TARGETS[L].loss)]],
  [`Every cell within ${OFF} points of the label's win target`, (m, L) => { const w = cellsOf([L]).map(c => C(m, c.key).win); return [`${f0(Math.min(...w))}–${f0(Math.max(...w))}%`, w.every(x => Math.abs(x - WIN_TARGET[L]) <= OFF)]; }],
  ["Showdown: median 3–5 rounds", (m, L) => [`${P(m, L).roundsMedian} (mean ${f1(P(m, L).roundsMean)})`, inRange(P(m, L).roundsMedian, [3, 5])]],
  ["A witch Down: Easy ≤15%, Standard ≥25%, Hard ≥40%", (m, L) => [pctS(P(m, L).anyDown), inRange(P(m, L).anyDown, TARGETS[L].down)]],
];
for (const [name, fn] of tRows) out(`| ${name} | ` + EPISODES.flatMap(e => [fn(e.move, e.label), fn("generic", e.label)].map(([v, ok]) => `${v} (${ok ? "yes" : "**no**"})`)).join(" | ") + " |");
out("");

// ---------------------------------------------------------------- 3. every move
out("## 3. Every move at every label");
out("");
out("All sizes pooled, with and without a guardian player. **vs plain** is the move's win minus a plain attack's: negative means the move makes the episode harder than an ordinary attack would.");
out("");
out("| Move | Easy: Win / Partial / Loss | Standard | Hard | Win vs generic (E / S / H) | Win vs plain (E / S / H) |");
out("|---|---|---|---|---|---|");
for (const m of MOVES) out(`| ${THREATS.moves[m].name} | ${LABELS.map(L => wpl(P(m, L))).join(" | ")} | ${LABELS.map(L => sgn(winVs(m, "generic", L))).join(" / ")} | ${LABELS.map(L => sgn(winVs(m, "plain", L))).join(" / ")} |`);
out("");
out(`The generic move and "two different characters" differ only in where the first attack goes (REPORT.md aims it like a 1–3, at whoever hurt the threat last; ruling 63 aims it at the most Hurt): ${LABELS.map(L => `${NAME[L]} ${sgn(winVs("twoAttacks", "generic", L))}`).join(", ")} points. At Hard the generic move keeps the label at ${f1(P("generic", "hard").win)}%, near the top of its 55–60% band; every move that is one attack (${SIX.filter(m => P(m, "hard").win > TARGETS.hard.win[1]).map(short).join(", ")}) puts Hard above 60%.`);
out("");

// ---------------------------------------------------------------- 4. length and harm
out("## 4. Showdown length and witches Down");
out("");
out("| Move | Rounds, median / mean / 90%: Easy | Standard | Hard | A witch Down (E / S / H) | Witches Down per episode (E / S / H) | Guardian Down (E / S / H) |");
out("|---|---|---|---|---|---|---|");
for (const m of MOVES) out(`| ${THREATS.moves[m].name} | ${LABELS.map(L => `${P(m, L).roundsMedian} / ${f1(P(m, L).roundsMean)} / ${P(m, L).roundsP90}`).join(" | ")} | ${LABELS.map(L => pctS(P(m, L).anyDown)).join(" / ")} | ${LABELS.map(L => f1(P(m, L).downPerEp)).join(" / ")} | ${LABELS.map(L => pctS(P(m, L).guardianDown)).join(" / ")} |`);
out("");

// ---------------------------------------------------------------- 5. cells
out("## 5. Win by cell, every move");
out("");
out(`Bold: more than ${OFF} points from the label's win target. The episode's own move is in its label's rows: Easy Hush, Standard Cinders, Hard Lure.`);
out("");
out("| Label | Players | Guardian player | " + MOVES.map(short).join(" | ") + " |");
out("|---|---|---|" + "---|".repeat(MOVES.length));
for (const c of cellsOf()) out(`| ${NAME[c.L]} | ${c.p} | ${c.g ? "yes" : "no"} | ${MOVES.map(m => (cellOff(m, c) ? `**${pctS(C(m, c.key).win)}**` : pctS(C(m, c.key).win))).join(" | ")} |`);
out("");

// ---------------------------------------------------------------- 6. how often
out("## 6. How often each move comes up, and what it does");
out("");
out("A move is used on a 6 when no free innocent is there. **Used** is the share of episodes where the threat used its move at least once. The effects are averages per episode.");
out("");
const u = (m, L, k) => P(m, L).use[k] || 0;
const EFFECT = {
  quietMan: L => `${f1(u("quietMan", L, "hush:hushed"))} hushed, ${f1(u("quietMan", L, "hush:mutedTurn"))} turns without casting`,
  ashWidow: L => `${f1(u("ashWidow", L, "cinders:attack"))} attacks, ${f1(u("ashWidow", L, "cinders:hurt"))} Hurt`,
  mirrorThief: L => `${f1(u("mirrorThief", L, "face:magic"))} Magic and ${f1(u("mirrorThief", L, "face:ward"))} Ward lost`,
  nightNurse: L => `${f1(u("nightNurse", L, "drain:fired"))} drains, ${f1(u("nightNurse", L, "drain:cleared"))} damage cleared`,
  vesperCrane: L => `${f1(u("vesperCrane", L, "turned:failure"))} Failures at Hit +1`,
  drownedChoir: L => `${f1(u("drownedChoir", L, "lure:roll"))} rolls, ${f1(u("drownedChoir", L, "lure:failure"))} Failures, ${f1(u("drownedChoir", L, "lure:lostTurn"))} turns lost`,
};
out("| Move | Used (E / S / H) | Uses per episode (E / S / H) | What it did per episode: Standard | Hard |");
out("|---|---|---|---|---|");
for (const m of MOVES) out(`| ${THREATS.moves[m].name} | ${LABELS.map(L => pctS(P(m, L).usedEp)).join(" / ")} | ${LABELS.map(L => P(m, L).use["sig:move"]?.toFixed(2) ?? "0.00").join(" / ")} | ${EFFECT[m] ? EFFECT[m]("standard") : "—"} | ${EFFECT[m] ? EFFECT[m]("hard") : "—"} |`);
out("");

// ---------------------------------------------------------------- 7. flags
out("## 7. Flags");
out("");
const flags = [];
const flag = (kind, what, detail, fix) => flags.push({ kind, what, detail, fix });
// Episodes off target, and whether their own move is the cause.
for (const e of EPISODES) {
  const L = e.label, s = P(e.move, L), g = P("generic", L);
  const offCells = cellsOf([L]).filter(c => cellOff(e.move, c));
  const pushedCells = cellsOf([L]).filter(c => cellOff(e.move, c) && !cellOff("generic", c));
  const pushed = Math.abs(s.win - g.win) > OFF || cellsOf([L]).some(c => Math.abs(C(e.move, c.key).win - C("generic", c.key).win) > OFF);
  const cellList = cs => cs.map(c => `${c.p} players${c.g ? " with a guardian player" : ""} (${f1(C(e.move, c.key).win)}%)`).join(", ");
  if (pushed) flag("move moves the episode's win more than 5 points", `${e.n}. ${e.name}: ${short(e.move)}`, `Win ${f1(s.win)}% against ${f1(g.win)}% with the generic move.`, FIX[e.move]?.off);
  const offPooled = !inRange(s.win, TARGETS[L].win);
  const pushedPooled = offPooled && inRange(g.win, TARGETS[L].win);
  if (offPooled || offCells.length) {
    const byMove = pushedPooled || pushedCells.length > 0;
    const what = [pushedPooled ? "the pooled win" : null, pushedCells.length ? cellList(pushedCells) : null].filter(Boolean).join(" and ");
    const why = byMove ? `${short(e.move)} takes ${what} off target, where the generic move is on it.` : `The generic move is off in the same way, so the label, not the move, is the cause.`;
    flag(byMove ? "move pushes episode off target" : "episode off target (label)", `${e.n}. ${e.name} (${NAME[L]}, ${short(e.move)})`,
      `Win ${f1(s.win)}% (target ${TARGETS[L].win.join("–")}%; generic move ${f1(g.win)}%). ${offCells.length ? `Cells more than ${OFF} points off: ${cellList(offCells)}.` : `Every cell is within ${OFF} points of ${WIN_TARGET[L]}%.`} ${why}`, byMove ? FIX[e.move]?.off : FIX.label[L]);
  }
}
// Dead, dominated and dominant moves.
const yard = "twoAttacks";
for (const m of [yard, ...SIX]) {
  const w = LABELS.map(L => worth(m, L));
  const downLess = ["standard", "hard"].every(L => P(m, L).anyDown < P("plain", L).anyDown);
  const weaker = ["standard", "hard"].every(L => worth(m, L) < 0) && downLess;
  const desc = `Win vs a plain attack ${LABELS.map((L, i) => `${NAME[L]} ${sgn(-w[i])}`).join(", ")}; a witch Down ${LABELS.map(L => `${pctS(P(m, L).anyDown)} (plain ${pctS(P("plain", L).anyDown)})`).join(", ")}.`;
  if (w.every(x => Math.abs(x) < DEAD)) flag(m === yard ? "the yardstick itself is dead" : "dead (A9: under ±2 points)", THREATS.moves[m].name, `${desc} Used in ${LABELS.map(L => pctS(P(m, L).usedEp)).join(" / ")} of episodes (E / S / H).`, m === yard ? FIX.yardstick : FIX[m]?.dead);
  if (weaker) flag("dominated by a plain attack", THREATS.moves[m].name, `The coven wins more and goes Down less against it than if the threat simply attacked. ${desc}`, FIX[m]?.weak);
  if (m !== yard && LABELS.some(L => P(m, L).win < P(yard, L).win - DOMINANT)) flag("dominant", THREATS.moves[m].name, `More than ${DOMINANT} points of win harder than "two different characters" at ${LABELS.filter(L => P(m, L).win < P(yard, L).win - DOMINANT).map(L => NAME[L]).join(", ")}.`, FIX[m]?.strong);
}
// Hush's rider: Hush is "two attacks" plus "can't cast".
const rider = LABELS.map(L => winVs("quietMan", "twoAttacks", L));
if (rider.every(x => Math.abs(x) < DEAD)) flag("rider dead", "Hush's \"can't cast on their next action\"", `Hush against the same two attacks without it: ${LABELS.map((L, i) => `${NAME[L]} ${sgn(rider[i])}`).join(", ")} points of win; ${f1(u("quietMan", "hard", "hush:mutedTurn"))} turns without casting per Hard episode.`, FIX.quietMan.rider);
const flagsOf = k => flags.filter(f => f.kind.startsWith(k)).length;
if (!flags.length) out("No flags.");
else {
  out(`Flag rules: an episode is off target when its pooled win is outside its label's band, or a cell is more than ${OFF} points from the label's win target; a move **pushes** it off when the generic move keeps it on target, or the move moves the win more than ${OFF} points. A move is **dead** when it is within ±${DEAD} points of win of a plain attack at every label (DESIGN-RULES A9), **dominated** when the coven wins more and goes Down less against it than against a plain attack at Standard and Hard, and **dominant** when it is more than ${DOMINANT} points of win harder than "two different characters" at any label.`);
  out("");
  out("| Flag | What | Numbers | Smallest fix |");
  out("|---|---|---|---|");
  for (const f of flags) out(`| ${f.kind} | ${f.what} | ${f.detail} | ${fx(f.fix) || "—"} |`);
}
out("");
if (flags.some(f => f.kind.startsWith("dead"))) {
  const used = SIX.flatMap(m => LABELS.map(L => P(m, L).usedEp));
  const uses = SIX.flatMap(m => LABELS.map(L => P(m, L).use["sig:move"] || 0));
  const fiveOk = FIVE.filter(m => m !== "plain" && LABELS.some(L => Math.abs(worth(m, L, V5)) >= DEAD)).map(m => THREATS.moves[m].short);
  const down = SIX.map(m => P(m, "hard").anyDown);
  out(`**Why the moves are dead.** A move needs a 6 with no free innocent, and showdowns are short, so the threat uses its move in only ${f0(Math.min(...used))}–${f0(Math.max(...used))}% of episodes (${Math.min(...uses).toFixed(2)}–${Math.max(...uses).toFixed(2)} times per episode). When it does, most moves are worth about one attack. Making a 5 use the move too (§8) lifts only ${fiveOk.length ? andList(fiveOk) : "none of them"} past ±${DEAD} points. The moves still change who goes Down (at Hard, a witch goes Down in ${f0(Math.min(...down))}–${f0(Math.max(...down))}% of episodes, depending on the move), so they give each threat its own feel without moving the win. No balance fix is needed: whichever threat the coven meets, the label's numbers hold, which is what lets any threat go with any label. If Richard wants the moves to swing results (DESIGN-RULES A9), they would have to come up more often and do more than one attack's worth, and every label would need re-tuning.`);
  out("");
}
out(`Summary of flags: episodes pushed off target by their move ${flagsOf("move")}; episodes off target because of their label ${flagsOf("episode off")}; dead moves, the yardstick included, ${flagsOf("dead") + flagsOf("the yardstick")}; moves dominated by a plain attack ${flagsOf("dominated")}; dominant moves ${flagsOf("dominant")}.`);
out("");

// ---------------------------------------------------------------- 8. sensitivity
out("## 8. Sensitivity");
out("");
out("### Lure: the players' dice (Low Tide, Hard)");
out("");
out("| Setting | Value | Win / Partial / Loss | Cells | A witch Down | Turns lost per episode |");
out("|---|---|---|---|---|---|");
for (const [k, v, s, r] of lureRows) {
  const w = cellsOf(["hard"]).map(c => r.cell[c.key].win);
  out(`| ${k} | ${v} | ${f1(s.win)}% / ${f1(s.partial)}% / ${f1(s.loss)}% | ${f1(Math.min(...w))}–${f1(Math.max(...w))}% | ${pctS(s.anyDown)} | ${f1(s.use["lure:lostTurn"] || 0)} |`);
}
out("");
for (const [k, d] of Object.entries(THREAT_JUDGEMENT)) out(`- **${k}** — ${d.doc} (${d.ref})`);
out("");
out("### If a 5 also used the move (not in the book)");
out("");
out("A test of the smallest rule change that would make the moves come up twice as often: the signature move on a 5 or a 6 (a free innocent is still only a 6, and the 4–5 result becomes 4 only). A plain attack is the same either way, so **vs plain** compares like with like.");
out("");
out("| Move | Win vs plain, move on a 6 (E / S / H) | Win vs plain, move on a 5–6 (E / S / H) | Win / Loss with the move on a 5–6 (E; S; H) | Uses per episode on a 5–6 (E / S / H) |");
out("|---|---|---|---|---|");
for (const m of FIVE.filter(x => x !== "plain")) out(`| ${THREATS.moves[m].name} | ${LABELS.map(L => sgn(-worth(m, L))).join(" / ")} | ${LABELS.map(L => sgn(-worth(m, L, V5))).join(" / ")} | ${LABELS.map(L => `${pctS(V5[m].pooled[L].win)} / ${pctS(V5[m].pooled[L].loss)}`).join("; ")} | ${LABELS.map(L => (V5[m].pooled[L].use["sig:move"] || 0).toFixed(2)).join(" / ")} |`);
out("");

// ---------------------------------------------------------------- 9. readings
out("### Candidate fixes (not in the book)");
out("");
out("The smallest wording changes for the flagged moves (section 7), run over the whole grid like the moves above.");
out("");
out("| Move | Win / Loss (E; S; H) | Win vs plain (E / S / H) | Win vs two attacks (E / S / H) | A witch Down (E / S / H) | Cells (E; S; H) |");
out("|---|---|---|---|---|---|");
for (const m of ["plain", "twoAttacks", ...CAND]) {
  const d = m in THREATS.moves ? THREATS.moves[m] : THREATS.candidates[m];
  const pp = L => VC[m].pooled[L];
  const cr = L => { const w = cellsOf([L]).map(c => VC[m].cell[c.key].win); return `${f1(Math.min(...w))}–${f1(Math.max(...w))}%`; };
  out(`| ${d.name} | ${LABELS.map(L => `${f1(pp(L).win)}% / ${f1(pp(L).loss)}%`).join("; ")} | ${LABELS.map(L => sgn(-worth(m, L, VC))).join(" / ")} | ${LABELS.map(L => sgn(winVs(m, "twoAttacks", L, VC))).join(" / ")} | ${LABELS.map(L => pctS(pp(L).anyDown)).join(" / ")} | ${LABELS.map(cr).join("; ")} |`);
}
out("");
for (const m of CAND) out(`- **${THREATS.candidates[m].name}** — ${THREATS.candidates[m].doc}`);
out("");

out("## 9. Readings used");
out("");
out("For every move:");
out("");
for (const r of THREATS.readings) out(`- ${r}`);
out("");
out("Each move (`sim/params.mjs` THREATS):");
out("");
for (const m of MOVES) out(`- **${THREATS.moves[m].name}** — ${THREATS.moves[m].doc} (${THREATS.moves[m].ref})`);
out("");
out("## 10. Not covered here");
out("");
for (const n of NOT_COVERED) out(`- ${n}`);
out("");

writeFileSync(OUT, lines.join("\n") + "\n");
console.log(`wrote ${OUT} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
