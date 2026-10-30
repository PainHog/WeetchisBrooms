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

/** `onEpisode(ep, i)`, if given, sees every episode as it is recorded (for extra statistics). */
export function runCell({ label, players, guardian, runs, seed, settings, onEpisode }) {
  const cell = newCell();
  for (let i = 0; i < runs; i++) {
    const rng = makeRng(seed, label, players, guardian, i);
    const coven = makeCoven({ witches: guardian ? players - 1 : players, guardian }, rng.fork("coven"), settings.policy.ratings, settings.rules);
    validateCoven(coven, settings.rules);
    const ep = playEpisode({ coven, label, settings, rng: rng.fork("dice") });
    record(cell, ep);
    if (onEpisode) onEpisode(ep, i);
  }
  return cell;
}

export function runGrid({ runs, seed, settings, labels = LABELS, players = PLAYERS, onEpisode }) {
  const cells = {};
  for (const label of labels) for (const p of players) for (const g of GUARDIAN) {
    const key = cellKey(label, p, g);
    cells[key] = runCell({ label, players: p, guardian: g, runs, seed, settings, onEpisode: onEpisode ? (ep, i) => onEpisode(ep, i, key) : undefined });
  }
  return cells;
}
