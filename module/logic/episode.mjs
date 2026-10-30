/**
 * WITCH & WARD — episode rules (pure).
 * The numbers table, the tracks and the round order from docs/CORE-RULES.md
 * (v0.9), as plain functions over a plain state object. No Foundry globals:
 * the Episode Tracker, the chat-card automation and the tests all call these.
 */
import { RESULT, works } from "./rules.mjs";

/** CORE-RULES "[T] Numbers". */
export const NUMBERS = {
  easy: { leadD: 1, defence: 1, danger: 1, hit: 2, toughnessPerWitch: 3, cluesPer: 3, cluesAdd: 0, exposureMax: 5 },
  standard: { leadD: 2, defence: 2, danger: 3, hit: 2, toughnessPerWitch: 3, cluesPer: 4, cluesAdd: -1, exposureMax: 4 },
  hard: { leadD: 2, defence: 2, danger: 3, hit: 3, toughnessPerWitch: 4, cluesPer: 4, cluesAdd: 0, exposureMax: 4 },
};
export const DOOM_MAX = 12;
export const MARK = 5;

/**
 * Season growth for threats: "After the 2nd and the 4th episodes, threats also
 * get 2 more Toughness per witch". Episode 1–2: 0 steps, 3–4: 1, 5+: 2.
 */
export function seasonSteps(seasonEpisode = 1) {
  return (seasonEpisode >= 3 ? 1 : 0) + (seasonEpisode >= 5 ? 1 : 0);
}

/**
 * Every number set at the start of an episode ("Set every number at the start
 * of the episode; they don't change if someone joins or leaves").
 */
export function episodeNumbers({ label = "standard", witches = 3, guardianPlayer = false, seasonEpisode = 1, returningBonus = 0 } = {}) {
  const N = NUMBERS[label] ?? NUMBERS.standard;
  const n = witches + (guardianPlayer ? 1 : 0);
  const smallCoven = witches === 3 && !guardianPlayer ? 3 : 0; // "Against a coven of 3 witches and no guardian player, it has 3 more Toughness."
  const toughness = N.toughnessPerWitch * witches + smallCoven + 2 * witches * seasonSteps(seasonEpisode) + returningBonus;
  const cluesNeeded = N.cluesPer * n + N.cluesAdd;
  return {
    label, witches, guardianPlayer, n,
    leadD: N.leadD, defence: N.defence, danger: N.danger, hit: N.hit, exposureMax: N.exposureMax,
    toughness, cluesNeeded, half: Math.ceil(cluesNeeded / 2),
    attacks: n <= 3 ? 1 : 2, // "1 attack a round against 3 characters, 2 against 4 or 5"
    potionCap: n,            // "at most one per character (the guardian counts if a player plays it)"
    doomMax: DOOM_MAX, mark: MARK,
  };
}

/** A fresh episode state (CORE-RULES "Opening": Doom, Exposure and Clues start at 0). */
export function newEpisode(opts = {}) {
  const numbers = episodeNumbers(opts);
  const bookPage = !!opts.bookPage; // "next time, start with half the Clues"
  return {
    active: true,
    ...numbers,
    seasonEpisode: opts.seasonEpisode ?? 1,
    returningBonus: opts.returningBonus ?? 0,
    threatId: opts.threatId ?? null,
    phase: "investigation", scene: 1, round: 0, place: null,
    doom: 0, exposure: Math.min(opts.exposure ?? 0, numbers.exposureMax - 1), seen: false, seenKey: null,
    clues: bookPage ? numbers.half : 0,
    damage: 0, broken: false, brokenRound: null,
    innocent: "safe", hold: false, veiledUntil: 0, veiledScene: 0,
    lost: 0, lostThisRound: 0, defenceMod: 0, castingThisRound: false,
    lastHurtBy: null, potions: [], ended: null, result: null, log: [],
  };
}

export const weaknessKnown = s => s.clues >= s.cluesNeeded;
export const canGo = s => s.phase === "investigation" && s.clues >= s.half && s.doom < s.mark;
/** "Until the coven knows it, the threat's Defence is 1 higher." */
export const defence = s => Math.max(1, s.defence + (weaknessKnown(s) ? 0 : 1) + (s.defenceMod ?? 0));
export const unmakeDifficulty = s => s.witches + (weaknessKnown(s) ? 0 : 2);
const clone = s => JSON.parse(JSON.stringify(s));
const note = (s, text) => { s.log.push(text); return s; };

export function addClues(state, k) {
  const s = clone(state);
  s.clues = Math.max(0, Math.min(s.cluesNeeded, s.clues + k)); // "Extra Clues … past the total are lost."
  return s;
}

/** Exposure +k. "Once Seen … any further rise becomes Doom +1 instead (once per round or scene)." */
export function raiseExposure(state, k = 1) {
  if (k <= 0) return state;
  const s = clone(state);
  if (s.seen) {
    const key = s.phase === "showdown" ? `r${s.round}` : `s${s.scene}`;
    if (s.seenKey !== key && !s.broken) { // "Doom doesn't rise once the threat is Broken (not even from Seen)."
      s.seenKey = key;
      s.doom = Math.min(s.doomMax, s.doom + 1);
      note(s, "Seen: a further rise in Exposure became Doom +1.");
    }
    return s;
  }
  s.exposure = Math.min(s.exposureMax, s.exposure + k);
  if (s.exposure >= s.exposureMax) { s.seen = true; note(s, "Exposure is full: the coven is Seen."); }
  return s;
}

/** Hide and Voice: lower Exposure, never below 0, and not once Seen. */
export function lowerExposure(state, k = 1) {
  const s = clone(state);
  if (!s.seen) s.exposure = Math.max(0, s.exposure - k);
  return s;
}

/**
 * End of an investigation scene: Doom +1, then the mark check ("The Showdown
 * mark is only checked then"). Returns { state, forced }.
 */
export function endScene(state) {
  const s = clone(state);
  s.doom = Math.min(s.doomMax, s.doom + 1);
  if (s.doom >= s.mark) return { state: startShowdown(s, "public"), forced: true };
  s.scene += 1;
  return { state: s, forced: false };
}

/** Start the showdown: hidden (the coven went to it) or public (it came to them). */
export function startShowdown(state, place) {
  const s = clone(state);
  s.phase = "showdown";
  s.place = place;
  s.round = 1;
  s.innocent = place === "public" ? "grip" : "safe"; // "with the innocent in its grip"
  s.castingThisRound = false;
  s.lostThisRound = 0;
  s.defenceMod = 0;
  note(s, place === "public" ? "The threat came to them: a public showdown, the innocent in its grip." : "The coven went to it: a hidden showdown.");
  return s;
}

/** Damage to the threat. Breaks it when Toughness is full. */
export function damageThreat(state, k, byActorId = null) {
  if (k <= 0 || state.broken) return state;
  const s = clone(state);
  s.damage = Math.min(s.toughness, s.damage + k);
  if (byActorId) s.lastHurtBy = byActorId;
  if (s.damage >= s.toughness) {
    s.broken = true;
    s.brokenRound = s.round;
    if (s.innocent === "grip") s.innocent = "free"; // "A Broken threat lets go."
    note(s, "The threat is Broken.");
  }
  return s;
}

/** "the threat loses its next attack" — banked until its turn. */
export function loseAttack(state, k = 1) {
  const s = clone(state);
  s.lost += k;
  return s;
}

/**
 * The threat's turn: how many attacks it makes after lost attacks ("It loses
 * at most one attack a round, whatever the cause; any more are wasted").
 */
export function threatAttacks(state) {
  const s = clone(state);
  const lose = Math.min(1, s.lost, s.attacks);
  s.lostThisRound = lose;
  s.lost = 0;
  return { state: s, attacks: s.attacks - lose, lostOne: lose > 0 };
}

/**
 * Who an attack targets (CORE-RULES "The threat"). `coven`: [{id, name, hurt, down}]
 * of standing and Down characters. Returns { rule, candidates, takesInnocent }.
 */
export function attackTarget(state, d6, coven) {
  const standing = coven.filter(c => !c.down);
  const mostHurt = () => {
    if (!standing.length) return [];
    const top = Math.max(...standing.map(c => c.hurt));
    return standing.filter(c => c.hurt === top);
  };
  if (d6 === 6) {
    if (state.innocent === "free") return { rule: "innocent", candidates: [], takesInnocent: true };
    if (state.innocent === "guarded") return { rule: "guard", candidates: [], takesInnocent: false };
    // Ruling 63: a move's targets are the most Hurt, then the next most Hurt, still standing.
    return { rule: "signature", candidates: [...standing].sort((a, b) => b.hurt - a.hurt), takesInnocent: false };
  }
  if (state.hold) return { rule: "hold", candidates: coven.filter(c => c.guardian && !c.down), takesInnocent: false };
  if (d6 <= 3) {
    const last = standing.find(c => c.id === state.lastHurtBy);
    if (last) return { rule: "last", candidates: [last], takesInnocent: false };
  }
  return { rule: "most", candidates: mostHurt(), takesInnocent: false }; // "ties: the Storyteller picks"
}

/** Hurt from a defence roll: Success none, Partial 1, Failure Hit. */
export function defenceHurt(state, result) {
  if (result === RESULT.FAILURE) return state.hit;
  if (result === RESULT.PARTIAL) return 1;
  return 0;
}

/**
 * Damage from an attack roll that works: 2 (Critical 3, Partial 1), +1 Blast,
 * +1 with the Weakness, +2 Flame Surge, +2 Blasting potion.
 */
export function attackDamage(state, result, { blast = false, flameSurge = false, blasting = false } = {}) {
  if (!works(result)) return 0;
  const base = result === RESULT.CRITICAL ? 3 : result === RESULT.SUCCESS ? 2 : 1;
  return base + (blast ? 1 : 0) + (weaknessKnown(state) ? 1 : 0) + (flameSurge ? 2 : 0) + (blasting ? 2 : 0);
}

/** Clues from a lead: success 1, Critical 2, Partial 1; +1 Reveal on a success; +1 Surge if it works. */
export function leadClues(result, { reveal = false, surge = false } = {}) {
  if (!works(result)) return 0;
  const base = result === RESULT.CRITICAL ? 2 : 1;
  const full = result === RESULT.SUCCESS || result === RESULT.CRITICAL;
  return base + (reveal && full ? 1 : 0) + (surge ? 1 : 0);
}

/** Potions from a brew: success 2, Critical 3, Partial 1; +1 for a Wild Surge if it works. */
export function brewPotions(result, { surge = false } = {}) {
  if (!works(result)) return 0;
  const base = result === RESULT.CRITICAL ? 3 : result === RESULT.SUCCESS ? 2 : 1;
  return base + (surge ? 1 : 0);
}

/** Add potions up to the cap ("extra potions from a brew are lost"). */
export function addPotions(state, kinds) {
  const s = clone(state);
  for (const k of kinds) if (s.potions.length < s.potionCap) s.potions.push(k);
  return s;
}

/**
 * End of a showdown round, in the rules' order: (the characters and the threat
 * have acted) the innocent (round 1), Exposure, Doom; then the Broken threat
 * flees "at the end of the next round".
 */
export function endRound(state, { witchesStanding = 1 } = {}) {
  let s = clone(state);
  if (s.round === 1 && s.innocent === "grip") { s.innocent = "lost"; note(s, "The innocent was still in its grip: lost."); }
  const veiled = s.veiledUntil >= s.round;
  if (s.place === "public" && s.castingThisRound && !veiled) s = raiseExposure(s, 1);
  if (witchesStanding <= 0) return finish(s, "allDown");
  if (s.broken) {
    if (s.round > s.brokenRound) return finish(s, "fled");
  } else {
    s.doom = Math.min(s.doomMax, s.doom + 1);
    if (s.doom >= s.doomMax) { s.innocent = "lost"; return finish(s, "doom"); }
  }
  s.round += 1;
  s.castingThisRound = false;
  s.lostThisRound = 0;
  s.defenceMod = 0;
  return s;
}

/** End the episode and read the result (CORE-RULES "The end"). */
export function finish(state, reason) {
  const s = clone(state);
  s.ended = reason;
  s.phase = "closing";
  let result;
  if (reason === "destroyed") result = s.innocent === "lost" ? "partial" : "win";
  else if (reason === "fled") result = "partial";
  else result = "loss"; // doom, allDown, retreat
  // Ruling 75: on a retreat or with every witch Down, an innocent still in the fight is lost.
  if ((reason === "retreat" || reason === "allDown") && ["grip", "free", "guarded"].includes(s.innocent)) s.innocent = "lost";
  if (s.seen) result = result === "win" ? "partial" : "loss"; // "Seen drops the result one step"
  s.result = result;
  note(s, `The episode ends (${reason}): ${result}.`);
  return s;
}
