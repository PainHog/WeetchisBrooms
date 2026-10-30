/**
 * Simulator tests: the core roll against hand-worked cases, exact odds,
 * coven legality, determinism, and track invariants over many episodes.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readRoll, rollOdds, poolSize, partialNeeded, RESULT } from "../module/logic/rules.mjs";
import { makeRng } from "./rng.mjs";
import { makeCoven, validateCoven } from "./character.mjs";
import { playEpisode } from "./engine.mjs";
import { baseSettings, NUMBERS, withPreset } from "./params.mjs";
import { runCell } from "./grid.mjs";

test("the roll reads as CORE-RULES says", () => {
  // Difficulty 2: two successes = Success; one = Partial; none = Failure.
  assert.equal(readRoll([4, 5, 1], 2).result, RESULT.SUCCESS);
  assert.equal(readRoll([6, 1, 1], 2).result, RESULT.PARTIAL);
  assert.equal(readRoll([1, 2, 3], 2).result, RESULT.FAILURE);
  // A success with two 6s is a Critical; two 6s short of the Difficulty is not.
  assert.equal(readRoll([6, 6, 1], 2).result, RESULT.CRITICAL);
  assert.equal(readRoll([6, 6, 1, 1], 3).result, RESULT.PARTIAL);
  // Difficulty 1 has no Partial; Difficulty 3 and 4 need 2 for a Partial.
  assert.equal(readRoll([1, 1], 1).result, RESULT.FAILURE);
  assert.equal(partialNeeded(3), 2);
  assert.equal(partialNeeded(4), 2);
  assert.equal(readRoll([4, 4, 1, 1], 4).result, RESULT.PARTIAL);
  assert.equal(readRoll([4, 1, 1, 1], 4).result, RESULT.FAILURE);
  // 5–6 reading
  assert.equal(readRoll([4, 4], 2, { successFace: 5 }).result, RESULT.FAILURE);
});

test("extra dice are capped at +2; Unmaking joiners are not", () => {
  assert.equal(poolSize({ rating: 3, powerFits: true, extra: 5 }), 7);
  assert.equal(poolSize({ rating: 2, extra: 1, joiners: 6 }), 9);
});

test("exact odds add up and match hand counts", () => {
  for (let pool = 1; pool <= 8; pool++) for (let d = 1; d <= 4; d++) {
    const o = rollOdds(pool, d);
    assert.ok(Math.abs(o.critical + o.success + o.partial + o.failure - 1) < 1e-9);
  }
  const o = rollOdds(3, 2);
  assert.ok(Math.abs(o.success + o.critical - 0.5) < 1e-9, "3 dice, Difficulty 2: half succeed");
  assert.ok(Math.abs(o.failure - 0.125) < 1e-9, "3 dice, Difficulty 2: one in eight fail");
  // Two or more 6s on 4 dice: 1 - (5/6)^4 - 4(1/6)(5/6)^3
  const two6 = 1 - (5 / 6) ** 4 - 4 * (1 / 6) * (5 / 6) ** 3;
  assert.ok(Math.abs(rollOdds(4, 2).critical - two6) < 1e-9);
});

test("covens are legal: 3-2-2-1 ratings, no duplicate Powers, 3–5 players", () => {
  for (let i = 0; i < 300; i++) {
    const rng = makeRng(9, "coven", i);
    const g = i % 2 === 0;
    const players = 3 + (i % 3);
    const coven = makeCoven({ witches: g ? players - 1 : players, guardian: g }, rng, i % 4 === 0 ? "random" : "sensible");
    assert.ok(validateCoven(coven));
  }
  const bad = makeCoven({ witches: 3, guardian: false }, makeRng(1, "bad"));
  bad.witches[1].power = bad.witches[0].power;
  assert.throws(() => validateCoven(bad), /duplicate Power/);
});

function play(seed, label, players, guardian, settings = baseSettings()) {
  const rng = makeRng(seed, label, players, guardian, 0);
  const coven = makeCoven({ witches: guardian ? players - 1 : players, guardian }, rng.fork("coven"), settings.policy.ratings, settings.rules);
  const ep = playEpisode({ coven, label, settings, rng: rng.fork("dice") });
  return { ep, coven };
}

test("same seed, same episode", () => {
  for (const label of ["easy", "standard", "hard"]) {
    const a = play(42, label, 4, true).ep;
    const b = play(42, label, 4, true).ep;
    assert.deepEqual(a, b);
  }
});

test("tracks stay inside their limits and every episode ends one of the defined ways", () => {
  for (const preset of [null, "generous", "strict"]) {
    const settings = preset ? withPreset(baseSettings(), preset) : baseSettings();
    for (let seed = 0; seed < 150; seed++) for (const label of ["easy", "standard", "hard"]) {
      const players = 3 + (seed % 3);
      const { ep, coven } = play(seed, label, players, seed % 2 === 0, settings);
      const N = NUMBERS[label];
      assert.ok(["win", "partial", "loss"].includes(ep.result));
      assert.ok(["destroyed", "fled", "doom", "allDown", "retreat"].includes(ep.reason));
      assert.ok(ep.doomEnd <= N.doomMax && ep.doomEnd >= 0);
      assert.ok(ep.exposure <= N.exposureMax && ep.exposure >= 0);
      assert.equal(ep.seen, ep.exposure >= N.exposureMax);
      assert.ok(ep.scenes <= N.mark, "the Showdown mark always ends the investigation");
      assert.ok(ep.rounds <= N.doomMax, "Doom caps the showdown");
      for (const c of [...coven.witches, ...(coven.guardian ? [coven.guardian] : [])]) {
        assert.ok(c.hurt >= 0 && c.hurt <= c.hurtMax);
        assert.ok(c.magic >= 0 && c.ward >= 0);
      }
      if (ep.reason === "doom") assert.equal(ep.innocentLost, true);
      if (ep.seen) assert.notEqual(ep.result, "win");
    }
  }
});

test("a grid cell runs and counts every episode", () => {
  const cell = runCell({ label: "standard", players: 4, guardian: true, runs: 50, seed: 3, settings: baseSettings() });
  assert.equal(cell.runs, 50);
  assert.equal(cell.win + cell.partial + cell.loss, 50);
});

test("a season plays every episode, the same way for the same seed", async () => {
  const { playSeason } = await import("./season.mjs");
  const run = () => playSeason({ witches: 3, guardian: true, label: "standard", episodes: 6, settings: baseSettings(), rng: makeRng(11, "season") });
  const a = run(), b = run();
  assert.equal(a.length, 6);
  assert.deepEqual(a.map(e => [e.result, e.reason, e.returning]), b.map(e => [e.result, e.reason, e.returning]));
  for (const ep of a) assert.ok(["win", "partial", "loss"].includes(ep.result));
});

// ---------------------------------------------------------------- signature moves
const withThreat = (threat, extra = {}) => ({ ...baseSettings(), threat, ...extra });
const sansUse = ep => { const { use, ...rest } = ep; return rest; };

test("the default threat is the generic move, so REPORT.md doesn't move", async () => {
  const { THREATS } = await import("./params.mjs");
  assert.equal(baseSettings().threat, "generic");
  assert.equal(THREATS.default, "generic");
  const noKey = baseSettings();
  delete noKey.threat;
  for (const label of ["easy", "standard", "hard"]) assert.deepEqual(play(5, label, 4, true, noKey).ep, play(5, label, 4, true).ep);
});

test("Turned Spell plays exactly as the generic 'heavy' move", () => {
  const heavy = { ...baseSettings(), judgement: { ...baseSettings().judgement, signature: "heavy" } };
  for (let seed = 0; seed < 60; seed++) for (const label of ["standard", "hard"]) {
    const players = 3 + (seed % 3), g = seed % 2 === 0;
    assert.deepEqual(sansUse(play(seed, label, players, g, withThreat("vesperCrane")).ep), sansUse(play(seed, label, players, g, heavy).ep));
  }
});

test("Hush is two attacks plus its rider; Drain is a plain attack plus its heal", () => {
  let hushSame = 0, hushBit = 0, drainSame = 0, drainBit = 0;
  for (let seed = 0; seed < 200; seed++) for (const label of ["standard", "hard"]) {
    const players = 3 + (seed % 3), g = seed % 2 === 0;
    const hush = play(seed, label, players, g, withThreat("quietMan")).ep;
    if (hush.use["hush:mutedTurn"]) hushBit++;
    else { hushSame++; assert.deepEqual(sansUse(hush), sansUse(play(seed, label, players, g, withThreat("twoAttacks")).ep)); }
    const drain = play(seed, label, players, g, withThreat("nightNurse")).ep;
    if (drain.use["drain:cleared"]) drainBit++;
    else { drainSame++; assert.deepEqual(sansUse(drain), sansUse(play(seed, label, players, g, withThreat("plain")).ep)); }
  }
  assert.ok(hushBit > 0 && hushSame > 0 && drainBit > 0 && drainSame > 0, "both branches are exercised");
});

test("every signature move keeps the tracks inside their limits, and its own effect fires", async () => {
  const { THREATS } = await import("./params.mjs");
  const own = { quietMan: "hush:hushed", ashWidow: "cinders:attack", mirrorThief: "face:magic", nightNurse: "drain:fired", vesperCrane: "turned:failure", drownedChoir: "lure:lostTurn", faceHeavy: "face:magic" };
  for (const threat of [...THREATS.values, ...Object.keys(THREATS.candidates)]) {
    let fired = 0;
    for (let seed = 0; seed < 150; seed++) for (const label of ["easy", "standard", "hard"]) {
      const players = 3 + (seed % 3);
      const { ep, coven } = play(seed, label, players, seed % 2 === 0, withThreat(threat, threat === "drownedChoir" && seed % 2 ? { threatJudgement: { lureDice: "none" } } : {}));
      const N = NUMBERS[label];
      assert.ok(["win", "partial", "loss"].includes(ep.result));
      assert.ok(ep.doomEnd <= N.doomMax && ep.exposure <= N.exposureMax && ep.rounds <= N.doomMax);
      for (const c of [...coven.witches, ...(coven.guardian ? [coven.guardian] : [])]) {
        assert.ok(c.hurt >= 0 && c.hurt <= c.hurtMax, `${threat}: Hurt in range`);
        assert.ok(c.magic >= 0 && c.ward >= 0, `${threat}: Magic and Ward never below 0`);
      }
      if (own[threat] && ep.use[own[threat]]) fired++;
      if (ep.use["hush:mutedTurn"]) assert.ok(ep.use["hush:mutedTurn"] <= ep.use["hush:hushed"]);
    }
    if (own[threat]) assert.ok(fired > 0, `${threat}: its effect never fired`);
  }
});
