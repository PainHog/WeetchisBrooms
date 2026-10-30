/**
 * WITCH & WARD — Pure Rules Logic
 * -----------------------------------
 * The convention (carried over from Heisty Spideys): every rule the system
 * automates is computed by a Foundry-free function in module/logic/ — no
 * `game`, `ui`, `foundry`, `Hooks`, `CONFIG` or DOM; only plain data in, plain
 * data out, plus static data from ../config.mjs (itself Foundry-free). Sheets,
 * chat cards and GM operations call these functions and only do the Foundry
 * plumbing around them. That keeps the rules unit-testable with `node --test`
 * (no live Foundry needed) and lets the simulator (sim/) reuse the exact same
 * code the table uses.
 *
 * Each function's doc comment cites the rulebook passage it implements. Until
 * the chapters exist, the rules are docs/CORE-RULES.md: change that page first,
 * then this file and its tests.
 */

/** The four ways a roll can read (CORE-RULES "The roll"). */
export const RESULT = Object.freeze({
  CRITICAL: "critical",
  SUCCESS: "success",
  PARTIAL: "partial",
  FAILURE: "failure",
});

/** Default reading of the roll (CORE-RULES "The roll"). */
export const ROLL_DEFAULTS = Object.freeze({
  successFace: 4, // "Each 4, 5 or 6 is a success."
  critSixes: 2,   // "a success that shows two or more 6s"
  bonusCap: 2,    // "at most +2 dice from everything else together"
});

/**
 * Successes a Partial needs: "at least half the Difficulty (round up), but
 * less than all of it". At Difficulty 1 that equals the Difficulty, so a
 * Difficulty 1 roll is either a success or a Failure.
 */
export function partialNeeded(difficulty) {
  return Math.ceil(difficulty / 2);
}

/** True when the result counts as working (Partial, Success or Critical). */
export function works(result) {
  return result !== RESULT.FAILURE;
}

/**
 * Read a set of d6 faces against a Difficulty (CORE-RULES "The roll").
 * @param {number[]} faces
 * @param {number} difficulty  1–4 (anything below 1 always succeeds)
 * @returns {{successes:number, sixes:number, result:string}}
 */
export function readRoll(faces, difficulty, opts = {}) {
  const { successFace, critSixes } = { ...ROLL_DEFAULTS, ...opts };
  let successes = 0;
  let sixes = 0;
  for (const f of faces) {
    if (f >= successFace) successes++;
    if (f === 6) sixes++;
  }
  let result;
  if (successes >= difficulty) result = sixes >= critSixes ? RESULT.CRITICAL : RESULT.SUCCESS;
  else if (successes >= partialNeeded(difficulty)) result = RESULT.PARTIAL;
  else result = RESULT.FAILURE;
  return { successes, sixes, result };
}

/**
 * Size of a pool (CORE-RULES "Extra dice"): the rating, +2 when the Power
 * fits, plus extra dice capped at +2 from all other sources together. Unmaking
 * joiners are outside the cap ("joiners don't count toward the +2 limit").
 */
export function poolSize({ rating = 0, powerFits = false, extra = 0, joiners = 0, powerDice = 2, bonusCap = ROLL_DEFAULTS.bonusCap } = {}) {
  return Math.max(0, rating + (powerFits ? powerDice : 0) + Math.min(extra, bonusCap) + joiners);
}

function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let c = 1;
  for (let i = 1; i <= k; i++) c = (c * (n - k + i)) / i;
  return c;
}

/**
 * Exact odds of each result for a pool against a Difficulty, by counting the
 * multinomial split of dice into fails / non-six successes / sixes.
 * @returns {{critical:number, success:number, partial:number, failure:number}}
 */
export function rollOdds(pool, difficulty, opts = {}) {
  const { successFace, critSixes } = { ...ROLL_DEFAULTS, ...opts };
  const pFail = (successFace - 1) / 6;
  const pSix = 1 / 6;
  const pMid = 1 - pFail - pSix; // successes that are not sixes
  const out = { critical: 0, success: 0, partial: 0, failure: 0 };
  for (let six = 0; six <= pool; six++) {
    for (let mid = 0; mid + six <= pool; mid++) {
      const fail = pool - six - mid;
      const p = choose(pool, six) * choose(pool - six, mid) * pSix ** six * pMid ** mid * pFail ** fail;
      const successes = six + mid;
      if (successes >= difficulty) out[six >= critSixes ? "critical" : "success"] += p;
      else if (successes >= partialNeeded(difficulty)) out.partial += p;
      else out.failure += p;
    }
  }
  return out;
}
