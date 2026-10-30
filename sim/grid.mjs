/**
 * Runs the full grid: every difficulty label × 3/4/5 players × with and
 * without a guardian player, with common random numbers (same seed and run
 * index → same coven and dice wherever the code paths agree).
 */
import { makeRng } from "./rng.mjs";
import { makeCoven, validateCoven } from "./character.mjs";
import { playEpisode } from "./engine.mjs";
import { newCell, record } from "./recorder.mjs";

export const LABELS = ["easy", "standard", "hard"];
export const PLAYERS = [3, 4, 5];
export const GUARDIAN = [false, true];

export function cellKey(label, players, guardian) {
  return `${label}|${players}|${guardian ? "g" : "-"}`;
}

export function runCell({ label, players, guardian, runs, seed, settings }) {
  const cell = newCell();
  for (let i = 0; i < runs; i++) {
    const rng = makeRng(seed, label, players, guardian, i);
    const coven = makeCoven({ witches: guardian ? players - 1 : players, guardian }, rng.fork("coven"), settings.policy.ratings, settings.rules);
    validateCoven(coven, settings.rules);
    record(cell, playEpisode({ coven, label, settings, rng: rng.fork("dice") }));
  }
  return cell;
}

export function runGrid({ runs, seed, settings, labels = LABELS, players = PLAYERS }) {
  const cells = {};
  for (const label of labels) for (const p of players) for (const g of GUARDIAN) {
    cells[cellKey(label, p, g)] = runCell({ label, players: p, guardian: g, runs, seed, settings });
  }
  return cells;
}
