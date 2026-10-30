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

/** Suggested fixes, printed only when the matching flag fires. */
const FIX = { label: {}, quietMan: {} };
/** What this report leaves out. */
const NOT_COVERED = [];

const f0 = x => x.toFixed(0);
const f1 = x => x.toFixed(1);
const pctS = x => `${f0(x)}%`;
const sgn = x => `${x >= 0 ? "+" : "−"}${f1(Math.abs(x))}`;
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
  const cellList = cs => cs.map(c => `${c.p}${c.g ? "+guardian" : ""} (${pctS(C(e.move, c.key).win)})`).join(", ");
  if (pushed) flag("move pushes episode off target", `${e.n}. ${e.name}: ${short(e.move)}`, `Win ${pctS(s.win)} against ${pctS(g.win)} with the generic move.`, FIX[e.move]?.off);
  if (!inRange(s.win, TARGETS[L].win) || offCells.length) {
    const why = pushedCells.length ? `${short(e.move)} pushes ${cellList(pushedCells)} out of the ±${OFF} band; the generic move keeps them in.` : `The generic move is off in the same way (${pctS(g.win)} pooled), so the label, not the move, is the cause.`;
    flag(pushedCells.length ? "move pushes cells off target" : "episode off target (label)", `${e.n}. ${e.name} (${NAME[L]}, ${short(e.move)})`,
      `Win ${pctS(s.win)} (target ${TARGETS[L].win.join("–")}%).${offCells.length ? ` Cells more than ${OFF} points off: ${cellList(offCells)}.` : ""} ${why}`, pushedCells.length ? FIX[e.move]?.off : FIX.label[L]);
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
  for (const f of flags) out(`| ${f.kind} | ${f.what} | ${f.detail} | ${f.fix || "—"} |`);
}
out("");
out(`Summary: ${flagsOf("move pushes")} episode flags caused by a move, ${flagsOf("episode off")} episodes off target because of their label, ${flagsOf("dead") + flagsOf("the yardstick")} dead moves (including the yardstick), ${flagsOf("dominated")} dominated by a plain attack, ${flagsOf("dominant")} dominant.`);
out("");

// ---------------------------------------------------------------- 8. sensitivity
out("## 8. Sensitivity");
out("");
out("### Lure's open points (Low Tide, Hard)");
out("");
out("| Setting | Value | Win / Partial / Loss | Cells | A witch Down | Turns lost per episode |");
out("|---|---|---|---|---|---|");
for (const [k, v, s, r] of lureRows) {
  const w = cellsOf(["hard"]).map(c => r.cell[c.key].win);
  out(`| ${k} | ${v} | ${wpl(s)} | ${f0(Math.min(...w))}–${f0(Math.max(...w))}% | ${pctS(s.anyDown)} | ${f1(s.use["lure:lostTurn"] || 0)} |`);
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
