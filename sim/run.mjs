#!/usr/bin/env node
/**
 * Runs the simulator over the whole grid and writes sim/REPORT.md.
 *   node sim/run.mjs [--runs 2000] [--seed 1] [--sweep-runs 500] [--out sim/REPORT.md]
 * Same seed and runs → same report.
 */
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { runGrid, runCell, LABELS, PLAYERS, cellKey } from "./grid.mjs";
import { merge, summary } from "./recorder.mjs";
import { baseSettings, withPreset, JUDGEMENT, POLICY, NUMBERS, SIZE } from "./params.mjs";
import { POWERS, POWER_KEYS } from "./character.mjs";
import { rollOdds } from "../module/logic/rules.mjs";
import { GAPS, MODELLED } from "./notes.mjs";
import { playSeason } from "./season.mjs";
import { makeRng } from "./rng.mjs";

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => (v.startsWith("--") ? [...a, [v.slice(2), arr[i + 1]]] : a), []));
const RUNS = +(args.runs || 2000);
const SEED = +(args.seed || 1);
const SWEEP_RUNS = +(args["sweep-runs"] || 500);
const OUT = args.out || join(dirname(fileURLToPath(import.meta.url)), "REPORT.md");

const f0 = x => x.toFixed(0);
const f1 = x => x.toFixed(1);
const pctS = x => `${f0(x)}%`;
const NAME = { easy: "Easy", standard: "Standard", hard: "Hard" };
const TARGET = {
  easy: { win: [85, 95], loss: [0, 5], down: [0, 15] },
  standard: { win: [70, 80], loss: [5, 15], down: [25, 100], seen: [5, 15] },
  hard: { win: [55, 60], loss: [15, 30], down: [40, 100] },
};
const inRange = (x, [a, b]) => x >= a - 1e-9 && x <= b + 1e-9;
const mark = ok => (ok ? "yes" : "**no**");

const settings = baseSettings();
const t0 = Date.now();
const cells = runGrid({ runs: RUNS, seed: SEED, settings });
const byLabel = Object.fromEntries(LABELS.map(L => [L, PLAYERS.flatMap(p => [cells[cellKey(L, p, false)], cells[cellKey(L, p, true)]])]));
const S = Object.fromEntries(LABELS.map(L => [L, summary(merge(byLabel[L]))]));
const C = (L, p, g) => summary(cells[cellKey(L, p, g)]);
const allCells = Object.values(cells);
const ALL = summary(merge(allCells));

function powerTable() {
  const rows = [];
  for (const p of POWER_KEYS) {
    let num = 0, den = 0, down = 0, dmg = 0;
    for (const c of allCells) { const s = c.power[p]; if (!s.n) continue; num += (s.win / s.n - c.win / c.runs) * s.n; den += s.n; down += s.down; dmg += s.damage; }
    rows.push({ p, delta: (100 * num) / den, down: (100 * down) / den, dmg: dmg / den, n: den });
  }
  return rows;
}

const lines = [];
const out = s => lines.push(s);
out("# Witch & Ward: simulator report");
out("");
out(`Rules: \`docs/CORE-RULES.md\` v0.8. Command: \`node sim/run.mjs --runs ${RUNS} --seed ${SEED} --sweep-runs ${SWEEP_RUNS}\`. ${RUNS.toLocaleString("en")} episodes per cell, ${(RUNS * allCells.length).toLocaleString("en")} in all. Same seed, same report.`);
out("");
out("A **cell** is one difficulty label, one number of players (3, 4 or 5), with or without a guardian player. With a guardian player, one player plays the guardian and the rest play witches. **Win / Partial / Loss** are the episode results from CORE-RULES \"The end\".");
out("");

// ---------------------------------------------------------------- targets
out("## 1. Against the targets");
out("");
out("| Target (DESIGN Q16) | Easy | Standard | Hard | On target? |");
out("|---|---|---|---|---|");
const cellWins = L => PLAYERS.flatMap(p => [C(L, p, false).win, C(L, p, true).win]);
const winT = { easy: 90, standard: 75, hard: 57.5 };
const rowsT = [
  ["Win: Easy ~90%, Standard ~75%, Hard 55–60%", L => pctS(S[L].win), LABELS.every(L => inRange(S[L].win, TARGET[L].win)) ],
  ["Loss: Easy ≤5%, Standard 5–15%, Hard 15–30%", L => pctS(S[L].loss), LABELS.every(L => inRange(S[L].loss, TARGET[L].loss)) ],
  ["Every cell within 5 points of its label's win target", L => `${f0(Math.min(...cellWins(L)))}–${f0(Math.max(...cellWins(L)))}%`, LABELS.every(L => cellWins(L).every(w => Math.abs(w - winT[L]) <= 5)) ],
  ["Guardian player within 5 points of an extra witch", L => PLAYERS.map(p => f1(C(L, p, true).win - C(L, p, false).win)).join(" / "), LABELS.every(L => PLAYERS.every(p => Math.abs(C(L, p, true).win - C(L, p, false).win) <= 5)) ],
  ["Showdown: median 3–5 rounds", L => `${S[L].roundsMedian} (90%: ${S[L].roundsP90}, most ${S[L].roundsMax})`, LABELS.every(L => inRange(S[L].roundsMedian, [3, 5])) ],
  ["A witch Down: Easy ≤15%, Standard ≥25%, Hard ≥40% of episodes", L => pctS(S[L].anyDown), LABELS.every(L => inRange(S[L].anyDown, TARGET[L].down)) ],
  ["Criticals 15–25% of rolls", L => pctS(S[L].crit), LABELS.every(L => inRange(S[L].crit, [15, 25])) ],
  ["Failures 10–20% of rolls", L => pctS(S[L].fail), LABELS.every(L => inRange(S[L].fail, [10, 20])) ],
  ["The median witch spends at least half of their Magic", L => pctS(S[L].magicMedian), LABELS.every(L => S[L].magicMedian >= 50) ],
  ["The guardian spends at least half its Ward (median)", L => pctS(S[L].wardMedian), LABELS.every(L => S[L].wardMedian >= 50) ],
  ["70% or more of brewed potions get used", L => pctS(S[L].potionsUsed), LABELS.every(L => S[L].potionsUsed >= 70) ],
  ["Seen in 5–15% of Standard episodes", L => pctS(S[L].seen), inRange(S.standard.seen, [5, 15]) ],
  ["The Showdown mark forces a public fight in 15–40% of episodes", L => pctS(S[L].forced), inRange(ALL.forced, [15, 40]) ],
];
for (const [label, fn, ok] of rowsT) out(`| ${label} | ${fn("easy")} | ${fn("standard")} | ${fn("hard")} | ${mark(ok)} |`);
const pt = powerTable();
const powerOk = pt.every(r => Math.abs(r.delta) <= 5);
out(`| Every Power within 5 points of the average | ${pt.map(r => `${POWERS[r.p].name} ${r.delta >= 0 ? "+" : ""}${f1(r.delta)}`).join(", ")} | | | ${mark(powerOk)} |`);
out("");
out(`The public-fight row is pooled over all labels (${pctS(ALL.forced)}); the guardian row reads 3 / 4 / 5 players (points of win rate, guardian minus witch).`);
out("");

// ---------------------------------------------------------------- outcomes
out("## 2. Win, Partial and Loss by cell");
out("");
out("| Label | Players | Guardian player | Witches | Win | Partial | Loss | Threat destroyed | Threat fled | Doom filled | Every witch Down |");
out("|---|---|---|---|---|---|---|---|---|---|---|");
for (const L of LABELS) for (const p of PLAYERS) for (const g of [false, true]) {
  const s = C(L, p, g);
  out(`| ${NAME[L]} | ${p} | ${g ? "yes" : "no"} | ${g ? p - 1 : p} | ${pctS(s.win)} | ${pctS(s.partial)} | ${pctS(s.loss)} | ${pctS(s.reasons.destroyed || 0)} | ${pctS(s.reasons.fled || 0)} | ${pctS(s.reasons.doom || 0)} | ${pctS(s.reasons.allDown || 0)} |`);
}
out("");
out("A Partial is a threat that fled, or a destroyed threat whose innocent was lost; being Seen also drops a Win to a Partial and a Partial to a Loss.");
out("");

// ---------------------------------------------------------------- shape
out("## 3. How episodes play out");
out("");
out("| | Easy | Standard | Hard |");
out("|---|---|---|---|");
const shape = [
  ["Investigation scenes (median)", L => S[L].scenesMedian],
  ["Doom when the showdown starts (mean, mark 5)", L => f1(S[L].doomAtShowdown)],
  ["Weakness known when the showdown starts", L => pctS(S[L].weaknessAtShowdown)],
  ["Showdown mark reached: public fight with the innocent there", L => pctS(S[L].forced)],
  ["Showdown rounds: median / 90% / most", L => `${S[L].roundsMedian} / ${S[L].roundsP90} / ${S[L].roundsMax}`],
  ["Unmaking rolls that destroy the threat", L => pctS(S[L].unmakeHit)],
  ["Seen (Exposure full)", L => pctS(S[L].seen)],
  ["Public fights where Exposure pressed (a round without magic, or Seen)", L => pctS(S[L].pressured)],
  ["Innocent lost", L => pctS(S[L].innocentLost)],
];
for (const [k, fn] of shape) out(`| ${k} | ${fn("easy")} | ${fn("standard")} | ${fn("hard")} |`);
out("");

// ---------------------------------------------------------------- harm
out("## 4. Witches taken out");
out("");
out("| | Easy | Standard | Hard |");
out("|---|---|---|---|");
const harm = [
  ["Episodes with at least one witch Down", L => pctS(S[L].anyDown)],
  ["Witches Down per episode", L => f1(S[L].downPerEp)],
  ["Share of all witches who go Down", L => pctS(S[L].downShare)],
  ["Guardian Down (episodes with a guardian player)", L => pctS(S[L].guardianDown)],
];
for (const [k, fn] of harm) out(`| ${k} | ${fn("easy")} | ${fn("standard")} | ${fn("hard")} |`);
out("");
out("Nobody dies from the dice; Down means out of action until mended or the episode ends.");
out("");

// ---------------------------------------------------------------- rolls and resources
out("## 5. Rolls and resources");
out("");
out("| | Easy | Standard | Hard |");
out("|---|---|---|---|");
const res = [
  ["Player rolls per episode", L => f0(S[L].rollsPerEp)],
  ["Criticals / Partials / Failures (share of rolls)", L => `${pctS(S[L].crit)} / ${pctS(S[L].partialRolls)} / ${pctS(S[L].fail)}`],
  ["Magic spent by the median witch", L => pctS(S[L].magicMedian)],
  ["Witches who spend at least half their Magic", L => pctS(S[L].magicHalf)],
  ["Witches who answer their Life", L => pctS(S[L].lifeAnswered)],
  ["Ward spent by the median guardian", L => pctS(S[L].wardMedian)],
  ["Guardians who spend at least half their Ward", L => pctS(S[L].wardHalf)],
  ["Potions brewed per episode / share used", L => `${f1(S[L].potionsPerEp)} / ${pctS(S[L].potionsUsed)}`],
  ["No guardian player: the call is used", L => pctS(S[L].callUsed)],
];
for (const [k, fn] of res) out(`| ${k} | ${fn("easy")} | ${fn("standard")} | ${fn("hard")} |`);
out("");

// ---------------------------------------------------------------- usage
out("## 6. What gets used");
out("");
out("Average uses per episode (gifts per episode with a guardian player; the call per episode without one).");
out("");
const USE = [
  ["Leads followed out in the city", "lead"], ["Book research at home", "research"], ["Reveal (spell)", "spell:reveal"], ["Life answered", "life"], ["Rest", "rest"],
  ["Hide (spell)", "spell:hide"], ["Plain attacks (Nerve)", "attack"], ["Blast (spell)", "spell:blast"], ["Bind (spell)", "spell:bind"], ["Study the threat", "study"],
  ["Guard the innocent (rounds)", "guard"], ["Unmaking attempts", "spell:unmake"],
  ...POWER_KEYS.map(p => [`Surge: ${POWERS[p].name}`, `surge:${p}`]),
  ["Potions brewed: Blasting / Healing / Binding", ["brewed:blasting", "brewed:healing", "brewed:binding"]],
  ["Potions used: Blasting / Healing / Binding", ["potion:blasting", "potion:healing", "potion:binding"]],
  ["Guardian: Mend", "gift:mend", "g"], ["Guardian: Shield", "gift:shield", "g"], ["Guardian: Carry", "gift:carry", "g"], ["Guardian: Sense", "gift:sense", "g"], ["Guardian: Hold", "gift:hold", "g"],
  ["No guardian player: call for Carry / Mend", ["call:carry", "call:mend"], "n"],
];
out("| | Easy | Standard | Hard |");
out("|---|---|---|---|");
for (const [name, key, scope] of USE) {
  const val = L => {
    const s = S[L];
    const per = scope === "g" ? s.runs / Math.max(1, s.guardianRuns) : scope === "n" ? s.runs / Math.max(1, s.runs - s.guardianRuns) : 1;
    const one = k => ((s.use[k] || 0) * per).toFixed(2);
    return Array.isArray(key) ? key.map(one).join(" / ") : one(key);
  };
  out(`| ${name} | ${val("easy")} | ${val("standard")} | ${val("hard")} |`);
}
out("");

// ---------------------------------------------------------------- powers
out("## 7. Powers");
out("");
out("Win-rate difference for covens that include each Power, compared with the average of the same cell (all labels and sizes pooled).");
out("");
out("| Power | Win difference | Witch goes Down | Damage dealt per episode |");
out("|---|---|---|---|");
for (const r of pt) out(`| ${POWERS[r.p].name} | ${r.delta >= 0 ? "+" : ""}${f1(r.delta)} points | ${pctS(r.down)} | ${f1(r.dmg)} |`);
out("");

// ---------------------------------------------------------------- guardian
out("## 8. Guardian player or one more witch");
out("");
out("| Label | Players | All witches: win / loss | With a guardian player: win / loss | Difference in win |");
out("|---|---|---|---|---|");
for (const L of LABELS) for (const p of PLAYERS) {
  const a = C(L, p, false), b = C(L, p, true);
  out(`| ${NAME[L]} | ${p} | ${pctS(a.win)} / ${pctS(a.loss)} | ${pctS(b.win)} / ${pctS(b.loss)} | ${b.win - a.win >= 0 ? "+" : ""}${f1(b.win - a.win)} |`);
}
out("");

// ---------------------------------------------------------------- odds
out("## 9. Exact odds of the core roll");
out("");
out("Chance of Success or better / Partial / Failure (4, 5 or 6 is a success). Difficulty 1 has no Partial.");
out("");
out("| Dice | Difficulty 1 | Difficulty 2 | Difficulty 3 | Difficulty 4 |");
out("|---|---|---|---|---|");
for (let pool = 1; pool <= 8; pool++) {
  const cellsO = [1, 2, 3, 4].map(d => { const o = rollOdds(pool, d); return `${f0(100 * (o.success + o.critical))} / ${f0(100 * o.partial)} / ${f0(100 * o.failure)}`; });
  out(`| ${pool} | ${cellsO.join(" | ")} |`);
}
out("");
out("Critical (a success with two or more 6s) at Difficulty 2: " + [3, 4, 5, 6].map(p => `${p} dice ${f0(100 * rollOdds(p, 2).critical)}%`).join(", ") + ".");
out("");

// ---------------------------------------------------------------- sweeps
out("## 10. Judgement calls and player habits");
out("");
out(`Each row changes one setting and re-runs Standard and Hard (${SWEEP_RUNS.toLocaleString("en")} episodes per cell, same seed). The first row is the default.`);
out("");
out("| Setting | Value | Standard win / loss | Hard win / loss |");
out("|---|---|---|---|");
function sweepRow(name, value, s2) {
  const r = L => summary(merge(PLAYERS.flatMap(p => [false, true].map(g => runCell({ label: L, players: p, guardian: g, runs: SWEEP_RUNS, seed: SEED, settings: s2 })))));
  const a = r("standard"), b = r("hard");
  out(`| ${name} | ${value} | ${pctS(a.win)} / ${pctS(a.loss)} | ${pctS(b.win)} / ${pctS(b.loss)} |`);
}
sweepRow("(defaults)", "—", settings);
for (const [k, d] of Object.entries(JUDGEMENT)) for (const v of d.values) if (v !== d.default) sweepRow(`judgement: ${k}`, String(v), { ...settings, judgement: { ...settings.judgement, [k]: v } });
for (const [k, d] of Object.entries(POLICY)) for (const v of d.values) if (v !== d.default) sweepRow(`players: ${k}`, String(v), { ...settings, policy: { ...settings.policy, [k]: v } });
sweepRow("preset", "generous (every open rule read for the players)", withPreset(settings, "generous"));
sweepRow("preset", "strict (every open rule read against them)", withPreset(settings, "strict"));
sweepRow("rules", "v0.1 Unmaking (1 die per joiner, fixed Difficulty, Partial destroys)", { ...settings, rules: { ...settings.rules, unmakeByWitches: false, unmakeJoinDice: 1, unmakeNeedsSuccess: false }, numbers: Object.fromEntries(Object.entries(settings.numbers).map(([k, v]) => [k, { ...v, unmakeD: { easy: 2, standard: 3, hard: 3 }[k] }])) });
sweepRow("rules", "v0.2 innocent (not held at the start of a public showdown)", { ...settings, rules: { ...settings.rules, innocentHeld: 0 } });
sweepRow("rules", "v0.2 Weakness (no Defence +1 without it, no extra damage with it)", { ...settings, rules: { ...settings.rules, noWeaknessDefence: 0, weaknessDamage: 0 } });
sweepRow("rules", "v0.3 potions (using one is an action, brewing is its own action, one potion per brew)", { ...settings, rules: { ...settings.rules, potionFree: false, brewWithBook: false, potionYield: 1 } });
sweepRow("rules", "no extra Toughness against 3 characters", { ...settings, size: { ...settings.size, toughnessMod: { 3: 0, 4: 0, 5: 0 } } });
sweepRow("rules", "success on 5–6 instead of 4–6", { ...settings, rules: { ...settings.rules, successFace: 5 } });
out("");
out("What each setting means:");
out("");
for (const [k, d] of Object.entries(JUDGEMENT)) out(`- **judgement: ${k}** — ${d.doc} (${d.ref})`);
for (const [k, d] of Object.entries(POLICY)) out(`- **players: ${k}** — ${d.doc}`);
out("");

// ---------------------------------------------------------------- seasons
out("## 11. Seasons");
out("");
const SEASON_RUNS = Math.max(200, Math.round(SWEEP_RUNS));
out(`Eight episodes in a row with the same coven (${SEASON_RUNS.toLocaleString("en")} seasons each for 3 witches, 3 witches + guardian, and 5 witches, pooled), carrying over Scars, growth, Book pages and returning threats as CORE-RULES "The end" says. Each threat is one of 6 kinds at random unless one that wasn't destroyed is due back (two episodes later). Win / Loss by episode:`);
out("");
out("| Label | " + Array.from({ length: 8 }, (_, i) => `Ep ${i + 1}`).join(" | ") + " |");
out("|---|" + "---|".repeat(8));
for (const L of ["standard", "hard"]) {
  const by = Array.from({ length: 8 }, () => ({ win: 0, loss: 0, n: 0 }));
  for (const [p, g] of [[3, false], [4, true], [5, false]]) for (let i = 0; i < SEASON_RUNS; i++) {
    for (const ep of playSeason({ witches: g ? p - 1 : p, guardian: g, label: L, episodes: 8, settings, rng: makeRng(SEED, "season", L, p, g, i) })) {
      const b = by[ep.episode - 1]; b.n++; if (ep.result === "win") b.win++; if (ep.result === "loss") b.loss++;
    }
  }
  out(`| ${NAME[L]} | ${by.map(b => `${f0((100 * b.win) / b.n)} / ${f0((100 * b.loss) / b.n)}`).join(" | ")} |`);
}
out("");

// ---------------------------------------------------------------- findings
out("## 12. Rule gaps and findings");
out("");
out("| Kind | Finding | Rules passage | Reading used | Settled |");
out("|---|---|---|---|---|");
for (const g of GAPS) out(`| ${g.kind} | ${g.title} | ${g.ref} | ${g.reading} | ${g.fixed} |`);
out("");
out("## 13. What is and isn't modelled");
out("");
out("Modelled:");
out("");
for (const m of MODELLED.yes) out(`- ${m}`);
out("");
out("Not modelled:");
out("");
for (const m of MODELLED.no) out(`- ${m}`);
out("");
out("## 14. The numbers used");
out("");
out("| | " + LABELS.map(L => NAME[L]).join(" | ") + " |");
out("|---|---|---|---|");
for (const k of ["leadD", "defence", "attack", "hit", "tWitch", "cluesPer", "cluesAdd", "mark", "doomMax", "exposureMax", "unmakeAdd"]) out(`| ${k} | ${LABELS.map(L => NUMBERS[L][k]).join(" | ")} |`);
out("");
out(`Threat attacks per round by characters: ${Object.entries(SIZE.attacks).filter(([n]) => n >= 3).map(([n, a]) => `${n}: ${a}`).join(", ")}. Extra Toughness by characters: ${Object.entries(SIZE.toughnessMod).map(([n, a]) => `${n}: ${a}`).join(", ")}.`);
out("");

writeFileSync(OUT, lines.join("\n") + "\n");
console.log(`wrote ${OUT} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
