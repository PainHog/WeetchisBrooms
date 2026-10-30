/**
 * The episode rules (module/logic/episode.mjs) against docs/CORE-RULES.md v0.9.
 */
import test from "node:test";
import assert from "node:assert/strict";
import * as E from "../module/logic/episode.mjs";
import { RESULT } from "../module/logic/rules.mjs";

test("numbers follow the [T] table and the per-size rules", () => {
  const std3 = E.episodeNumbers({ label: "standard", witches: 3, guardianPlayer: false });
  assert.equal(std3.toughness, 3 * 3 + 3, "3 witches, no guardian player: +3");
  assert.equal(std3.cluesNeeded, 4 * 3 - 1);
  assert.equal(std3.attacks, 1);
  const std3g = E.episodeNumbers({ label: "standard", witches: 3, guardianPlayer: true });
  assert.equal(std3g.toughness, 9, "no +3 with a guardian player");
  assert.equal(std3g.cluesNeeded, 15);
  assert.equal(std3g.attacks, 2);
  assert.equal(std3g.potionCap, 4);
  const hard5 = E.episodeNumbers({ label: "hard", witches: 5 });
  assert.equal(hard5.toughness, 20);
  assert.equal(hard5.cluesNeeded, 20);
  assert.equal(hard5.exposureMax, 4);
  assert.equal(E.episodeNumbers({ label: "easy", witches: 2, guardianPlayer: true }).cluesNeeded, 9);
  // Season: +2 per witch after the 2nd and 4th episodes.
  assert.equal(E.episodeNumbers({ label: "standard", witches: 4, seasonEpisode: 3 }).toughness, 12 + 8);
  assert.equal(E.episodeNumbers({ label: "standard", witches: 4, seasonEpisode: 6 }).toughness, 12 + 16);
});

test("the Showdown mark is checked at the end of a scene", () => {
  let s = E.newEpisode({ label: "standard", witches: 3, guardianPlayer: true });
  for (let i = 0; i < 4; i++) { const r = E.endScene(s); assert.equal(r.forced, false); s = r.state; }
  assert.equal(s.doom, 4);
  const r = E.endScene(s);
  assert.equal(r.forced, true);
  assert.equal(r.state.phase, "showdown");
  assert.equal(r.state.place, "public");
  assert.equal(r.state.innocent, "grip");
});

test("going to the threat needs half the Clues and Doom below the mark", () => {
  let s = E.newEpisode({ label: "easy", witches: 3 });
  assert.equal(E.canGo(s), false);
  s = E.addClues(s, s.half);
  assert.equal(E.canGo(s), true);
  s = E.addClues(s, 99);
  assert.equal(s.clues, s.cluesNeeded, "extra Clues are lost");
  assert.equal(E.weaknessKnown(s), true);
});

test("Exposure fills to Seen, then further rises become Doom once per round or scene", () => {
  let s = E.newEpisode({ label: "standard", witches: 4 });
  s = E.raiseExposure(s, 3);
  assert.equal(s.seen, false);
  s = E.lowerExposure(s, 1);
  assert.equal(s.exposure, 2);
  s = E.raiseExposure(s, 5);
  assert.equal(s.exposure, 4);
  assert.equal(s.seen, true);
  const d = s.doom;
  s = E.raiseExposure(s, 1);
  s = E.raiseExposure(s, 1);
  assert.equal(s.doom, d + 1, "once per scene");
  s = E.lowerExposure(s, 1);
  assert.equal(s.exposure, 4, "stays full once Seen");
});

test("Defence is 1 higher without the Weakness; the Unmaking is 2 harder", () => {
  let s = E.newEpisode({ label: "standard", witches: 4 });
  assert.equal(E.defence(s), 3);
  assert.equal(E.unmakeDifficulty(s), 6);
  s = E.addClues(s, 99);
  assert.equal(E.defence(s), 2);
  assert.equal(E.unmakeDifficulty(s), 4);
});

test("attack damage adds Blast, the Weakness, Flame and Blasting only when it works", () => {
  let s = E.addClues(E.newEpisode({ label: "standard", witches: 3 }), 99);
  assert.equal(E.attackDamage(s, RESULT.SUCCESS), 3);
  assert.equal(E.attackDamage(s, RESULT.CRITICAL, { blast: true, flameSurge: true, blasting: true }), 3 + 1 + 1 + 2 + 2);
  assert.equal(E.attackDamage(s, RESULT.PARTIAL), 2);
  assert.equal(E.attackDamage(s, RESULT.FAILURE, { blasting: true }), 0);
});

test("the threat loses at most one attack a round; extras are wasted", () => {
  let s = E.startShowdown(E.newEpisode({ label: "hard", witches: 4, guardianPlayer: true }), "hidden");
  s = E.loseAttack(E.loseAttack(E.loseAttack(s)));
  const r = E.threatAttacks(s);
  assert.equal(r.attacks, 1);
  assert.equal(r.state.lost, 0);
});

test("targets: last to hurt it, most hurt (ties), the innocent on a 6, Hold", () => {
  const coven = [{ id: "a", hurt: 1, down: false }, { id: "b", hurt: 2, down: false }, { id: "c", hurt: 2, down: false }, { id: "g", hurt: 0, down: false, guardian: true }];
  let s = E.startShowdown(E.newEpisode({ label: "standard", witches: 3, guardianPlayer: true }), "public");
  assert.equal(E.attackTarget(s, 2, coven).rule, "most", "nobody has hurt it yet: use 4–5");
  assert.deepEqual(E.attackTarget(s, 5, coven).candidates.map(c => c.id), ["b", "c"]);
  s.lastHurtBy = "a";
  assert.deepEqual(E.attackTarget(s, 1, coven).candidates.map(c => c.id), ["a"]);
  assert.equal(E.attackTarget(s, 6, coven).rule, "signature", "in its grip: the signature move");
  s.innocent = "free";
  assert.equal(E.attackTarget(s, 6, coven).takesInnocent, true);
  s.innocent = "guarded";
  assert.equal(E.attackTarget(s, 6, coven).rule, "guard");
  s.hold = true;
  assert.deepEqual(E.attackTarget(s, 3, coven).candidates.map(c => c.id), ["g"]);
});

test("round 1: an innocent still in its grip is lost; Broken threats let go and flee next round", () => {
  let s = E.startShowdown(E.newEpisode({ label: "standard", witches: 3 }), "public");
  s = E.endRound(s);
  assert.equal(s.innocent, "lost");
  let t = E.startShowdown(E.newEpisode({ label: "standard", witches: 3 }), "public");
  t = E.damageThreat(t, 99, "x");
  assert.equal(t.innocent, "free", "a Broken threat lets go");
  const doom = t.doom;
  t = E.endRound(t);
  assert.equal(t.doom, doom, "Doom doesn't rise once Broken");
  assert.equal(t.ended, null);
  t = E.endRound(t);
  assert.equal(t.ended, "fled");
  assert.equal(t.result, "partial");
});

test("public casting raises Exposure once a round unless Veiled; Doom full is a Loss", () => {
  let s = E.startShowdown(E.newEpisode({ label: "standard", witches: 4 }), "public");
  s.innocent = "free";
  s.castingThisRound = true;
  s = E.endRound(s);
  assert.equal(s.exposure, 1);
  s.castingThisRound = true;
  s.veiledUntil = s.round;
  s = E.endRound(s);
  assert.equal(s.exposure, 1, "Veiled");
  s.doom = 11;
  s = E.endRound(s);
  assert.equal(s.ended, "doom");
  assert.equal(s.result, "loss");
});

test("results: destroyed is a Win, minus a step for Seen or a lost innocent", () => {
  const base = E.newEpisode({ label: "easy", witches: 3 });
  assert.equal(E.finish(base, "destroyed").result, "win");
  assert.equal(E.finish({ ...base, innocent: "lost" }, "destroyed").result, "partial");
  assert.equal(E.finish({ ...base, seen: true }, "destroyed").result, "partial");
  assert.equal(E.finish({ ...base, seen: true }, "fled").result, "loss");
  assert.equal(E.finish(base, "retreat").result, "loss");
});

test("leads, brews and the potion cap", () => {
  assert.equal(E.leadClues(RESULT.CRITICAL, { reveal: true, surge: true }), 4);
  assert.equal(E.leadClues(RESULT.PARTIAL, { reveal: true }), 1);
  assert.equal(E.brewPotions(RESULT.PARTIAL), 1);
  assert.equal(E.brewPotions(RESULT.CRITICAL, { surge: true }), 4);
  let s = E.newEpisode({ label: "easy", witches: 3 });
  s = E.addPotions(s, ["healing", "blasting", "binding", "healing"]);
  assert.equal(s.potions.length, 3, "one per character");
});
