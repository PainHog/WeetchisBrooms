/**
 * Plays one Witch & Ward episode strictly by docs/CORE-RULES.md (v0.1).
 * Section names in comments ("Investigation", "The threat" …) are the
 * headings on that page. Player choices are simple, documented policies
 * (params.mjs POLICY); gaps the page leaves open are JUDGEMENT params.
 *
 * Abstractions: no map (moving is free, everyone in a showdown is "near"),
 * one generic threat per difficulty label, and a Life fits a lead with a
 * fixed chance.
 */
import { readRoll, rollOdds, RESULT, works } from "../module/logic/rules.mjs";
import { fits, members } from "./character.mjs";

const LIFE_FIT_CHANCE = 1 / 3; // a lead that matches the witch's job or role
const POTION_ORDER = ["blasting", "healing", "binding"];

export function playEpisode({ coven, label, settings, rng }) {
  const N = settings.numbers[label];
  const R = settings.rules;
  const J = settings.judgement;
  const P = settings.policy;
  const w = coven.witches.length;
  const g = coven.guardian ? 1 : 0;
  const n = w + g;
  const all = members(coven);

  const st = {
    doom: 0, exposure: 0, seen: false, clues: 0,
    cluesNeeded: N.cluesPer * n + N.cluesAdd,  // [T] Clues needed
    scene: 0, phase: "investigation", place: "hidden", forced: false,
    veiledScene: -1, veiledShowdown: false,
    innocent: { present: false, safe: false, lost: false, guard: null, held: false },
    threat: null, round: 0, magicThisRound: false, ended: null,
    brewed: 0, potionsUsed: 0, vanquishTries: 0, vanquishLog: [], cluesAtShowdown: 0, doomAtShowdown: 0,
    rolls: { critical: 0, success: 0, partial: 0, failure: 0 },
    rollsByPhase: { investigation: 0, showdown: 0 },
    damageBy: Object.fromEntries(all.map(c => [c.id, 0])),
    callUsed: false, senseScene: -1, carefulRounds: 0,
    use: {},
  };
  const half = () => Math.ceil(st.cluesNeeded / 2);
  const weakness = () => st.clues >= st.cluesNeeded;
  const standing = list => list.filter(c => !c.down);

  // ---------------------------------------------------------------- helpers
  function spend(ch, k, pool = "magic") {
    if (k <= 0) return 0;
    const have = pool === "magic" ? ch.magic : ch.ward;
    const s = Math.min(k, have);
    if (pool === "magic") { ch.magic -= s; ch.magicSpent += s; } else { ch.ward -= s; ch.wardSpent += s; }
    return s;
  }
  function hurt(ch, k) {
    if (k <= 0) return;
    ch.hurt = Math.min(ch.hurtMax, ch.hurt + k); // "Hurt can't go past full."
    if (ch.hurt >= ch.hurtMax && !ch.down) { ch.down = true; ch.everDown = true; }
  }
  function heal(ch, k) {
    ch.hurt = Math.max(0, ch.hurt - k);
    if (ch.down && ch.hurt < ch.hurtMax) ch.down = false; // "back up when Hurt drops below full"
  }
  function raiseExposure(k) {
    if (k <= 0) return;
    if (st.seen) { // "Once Seen, any further rise in Exposure becomes +1 Doom instead."
      const key = st.phase === "showdown" ? `r${st.round}` : `s${st.scene}`; // once per round or scene
      if (R.seenToDoom && st.seenDoomKey !== key && !(st.threat && st.threat.broken)) { st.doom = Math.min(N.doomMax, st.doom + 1); st.seenDoom = (st.seenDoom || 0) + 1; st.seenDoomKey = key; }
      return;
    }
    st.exposure = Math.min(N.exposureMax, st.exposure + k);
    if (st.exposure >= N.exposureMax) st.seen = true; // "when full, the coven is Seen; it stays full"
  }
  function lowerExposure(k) {
    if (st.seen) return; // stays full once Seen
    st.exposure = Math.max(0, st.exposure - k);
  }
  /** Magic a witch keeps back in the showdown for the Vanquish (1 to join, 1 for a die). */
  const RESERVE = 2;
  /** Magic a character is willing to spend on extra dice right now. */
  function spareMagic(ch, keep) {
    if (P.magic === "careful") keep = st.phase === "showdown" ? Math.max(keep, 3) : 99;
    else keep = st.phase === "showdown" ? keep : Math.max(keep, 3);
    return Math.max(0, ch.magic - keep);
  }
  /**
   * One roll (CORE-RULES "The roll"). `free` = extra dice that cost nothing
   * (Life, Book, Sense); `buy` = Magic the roller spends on dice; both share the
   * +2 cap. Using a Power counts as using magic.
   */
  function roll(ch, { rating, action, difficulty, power = true, free = 0, buy = 0, joiners = 0, spell = false, quiet = false }) {
    const powerFits = power && fits(ch, action);
    let extra = Math.min(free, R.bonusCap);
    extra += spend(ch, Math.min(buy, R.bonusCap - extra));
    const pool = (ch.ratings[rating] || 0) + (powerFits ? R.powerDice : 0) + extra + joiners;
    const r = readRoll(rng.roll(pool, 6), difficulty, { successFace: R.successFace, critSixes: R.critSixes });
    st.rolls[r.result]++;
    st.rollsByPhase[st.phase]++;
    const usedMagic = (powerFits || spell) && !quiet;
    if (usedMagic && st.phase === "showdown") st.magicThisRound = true;
    return { ...r, pool, usedMagic };
  }
  /** "Cost: if you used magic where ordinary people could see, Exposure +1; otherwise 1 Hurt." */
  function investigationCost(ch, usedMagic, isPublic) {
    if (J.investigationCost === "none") return;
    if (usedMagic && isPublic) { if (st.veiledScene !== st.scene) raiseExposure(1); }
    else hurt(ch, 1);
  }
  const use = k => { st.use[k] = (st.use[k] || 0) + 1; };
  const pick = arr => arr[Math.floor(rng.next() * arr.length)];
  const maxBy = (arr, f) => arr.reduce((best, x) => (best === null || f(x) > f(best) ? x : best), null);
  const minBy = (arr, f) => arr.reduce((best, x) => (best === null || f(x) < f(best) ? x : best), null);
  const surgeOk = (ch, keep) => ch.kind === "witch" && ch.surgedScene !== surgeKey() && ch.magic >= R.surgeCost + keep;
  const surgeKey = () => (st.phase === "showdown" ? "showdown" : st.scene); // the showdown counts as one scene
  function surge(ch, quiet = false) { spend(ch, R.surgeCost); ch.surgedScene = surgeKey(); use(`surge:${ch.power}`); if (st.phase === "showdown" && !quiet) st.magicThisRound = true; }

  // ------------------------------------------------------- lead pools
  function leadOptions(ch) {
    const r = ch.ratings;
    const opts = [
      { kind: "leadHeart", rating: "heart", pub: true },
      { kind: "leadWits", rating: "wits", pub: true },
    ];
    if (ch.kind === "witch" && ch.magic >= 4) opts.push({ kind: "reveal", rating: "craft", pub: true, spell: true });
    for (const o of opts) {
      o.pool = r[o.rating] + (fits(ch, o.kind) ? R.powerDice : 0);
      const od = rollOdds(o.pool, N.leadD, R);
      o.value = 2 * od.critical + od.success + od.partial + (o.spell ? R.revealBonus * (od.success + od.critical) - 0.3 : 0) - ((fits(ch, o.kind) || o.spell) ? 0.05 : 0);
    }
    return opts;
  }
  const bestLead = ch => maxBy(leadOptions(ch), o => o.value);
  const researchPool = ch => ch.ratings.wits + 1 + (fits(ch, "research") ? R.powerDice : 0);
  const brewPool = ch => ch.ratings.craft + (fits(ch, "brew") ? R.powerDice : 0);
  const hidePool = ch => ch.ratings.craft + (fits(ch, "hide") ? R.powerDice : 0);
  function expectedDamage(pool, bonus) {
    const o = rollOdds(pool, Math.max(1, effectiveDefenceSafe()), R);
    return (R.damage.critical + bonus) * o.critical + (R.damage.success + bonus) * o.success + (R.damage.partial + bonus) * o.partial;
  }
  function attackPool(ch, allowMagic = true) {
    const nerve = ch.ratings.nerve + (allowMagic && fits(ch, "attack") ? R.powerDice : 0);
    const craft = allowMagic && ch.magic >= RESERVE + 1 ? ch.ratings.craft + (fits(ch, "attack") ? R.powerDice : 0) : -1;
    if (craft >= 0 && expectedDamage(craft, R.blastBonus) >= expectedDamage(nerve, 0) + 0.5) return { rating: "craft", pool: craft, spell: true };
    return { rating: "nerve", pool: nerve, spell: false };
  }

  // ------------------------------------------------------- investigation
  function investigation() {
    for (;;) {
      st.scene++;
      sceneOfActions();
      st.doom = Math.min(N.doomMax, st.doom + 1); // "Then Doom +1."
      if (st.doom >= N.mark) { st.forced = true; return showdown("public"); } // "the threat comes to them"
      if (shouldGo()) return showdown("hidden"); // "may go to it"
    }
  }

  function shouldGo() {
    if (st.clues < half()) return false;
    if (P.go === "asap") return true;
    if (P.go === "waitForWeakness") return weakness();
    if (weakness()) return true;
    if (st.doom < N.mark - 1) return false;
    if (P.go === "gamble") return st.cluesNeeded - st.clues > Math.max(1, Math.floor(0.8 * n));
    return true;
  }

  function sceneOfActions() {
    const assigned = new Map();
    const witches = coven.witches;
    // Guardian first: mend a Down witch, otherwise follow a lead.
    const gd = coven.guardian;
    if (gd && !gd.down) {
      const downW = witches.filter(x => x.down);
      if (downW.length && gd.ward >= 1) {
        const t = maxBy(downW, x => attackPool(x).pool);
        spend(gd, 1, "ward"); heal(t, R.mendHeal); use("gift:mend");
      } else assigned.set(gd, { act: "lead" });
    } else if (gd && gd.down) assigned.set(gd, { act: "rest" });

    const free = witches.slice();
    const take = (ch, a) => { assigned.set(ch, a); free.splice(free.indexOf(ch), 1); };
    for (const ch of witches) if (ch.down || ch.hurt >= ch.hurtMax - 1) take(ch, { act: "rest" });
    // Cover up when Exposure is getting high.
    if (!st.seen && st.exposure >= N.exposureMax - 2) {
      const h = maxBy(free.filter(x => x.magic >= 1), hidePool);
      if (h) take(h, { act: "hide" });
    }
    // Life.
    if (P.life === "always" && st.scene === 1) for (const ch of free.slice()) if (!ch.lifeAnswered) take(ch, { act: "life" });
    if (P.life === "spare" && st.doom <= N.mark - 2) {
      const pools = free.map(x => bestLead(x).pool).sort((a, b) => a - b);
      const median = pools[Math.floor((pools.length - 1) / 2)];
      for (const ch of free.slice()) if (!ch.lifeAnswered && bestLead(ch).pool <= median && free.length > 1) take(ch, { act: "life" });
    }
    // Brewing, once the coven knows what the threat is.
    const brewTarget = brewLimit();
    if (!R.brewWithBook && st.brewed < brewTarget && st.clues >= half() && st.doom <= N.mark - 2 && free.length > 1) {
      const b = maxBy(free, brewPool);
      if (b) take(b, { act: "brew" });
    }
    // The Book.
    for (let i = 0; i < J.bookPerScene && free.length; i++) {
      const best = maxBy(free, researchPool);
      if (best && researchPool(best) >= bestLead(best).pool) take(best, { act: "research" });
      else break;
    }
    for (const ch of free.slice()) take(ch, { act: "lead" });

    for (const [ch, a] of assigned) {
      if (st.clues >= st.cluesNeeded && (a.act === "lead" || a.act === "research")) continue;
      sceneAction(ch, a);
    }
  }

  function sceneAction(ch, a) {
    switch (a.act) {
      case "rest": heal(ch, ch.hurtMax); use("rest"); return; // "rest (clear all Hurt)"
      case "life": ch.lifeAnswered = true; ch.magic += 1; ch.magicGained += 1; use("life"); return; // "gain 1 Magic"
      case "hide": return hide(ch);
      case "brew": return brew(ch);
      case "research": {
        lead(ch, { kind: "research", rating: "wits", pub: false }, 1);
        if (R.brewWithBook && st.brewed < brewLimit() && coven.potions.length < potionCap() && !ch.down) brew(ch); // brewing alongside the Book
        return;
      }
      case "lead": return lead(ch, bestLead(ch), 0);
    }
  }

  function lead(ch, opt, bookDie) {
    if (opt.spell) { spend(ch, 1); use("spell:reveal"); } // Reveal costs 1 Magic
    use(opt.kind === "research" ? "research" : "lead");
    const life = ch.kind === "witch" && rng.next() < LIFE_FIT_CHANCE ? 1 : 0;
    let sense = 0;
    const gd = coven.guardian;
    if (gd && !gd.down && st.senseScene !== st.scene && gd.ward >= 4 && ch !== gd && life + bookDie < R.bonusCap) {
      spend(gd, 1, "ward"); st.senseScene = st.scene; sense = 1; use("gift:sense"); // Sense: "+1 die on a lead this scene"
    }
    // Sight and Wild Surge on a lead: one more Clue.
    let surged = false;
    if ((ch.power === "sight" || ch.power === "wild" || (ch.power === "voice" && R.voiceClue)) && fits(ch, opt.kind) && surgeOk(ch, 3) && P.magic === "spendy") { surge(ch); surged = true; }
    // Veil Surge: no Exposure from magic this scene, when Exposure is high.
    const magical = fits(ch, opt.kind) || !!opt.spell;
    if (ch.power === "veil" && magical && opt.pub && st.exposure >= N.exposureMax - 2 && surgeOk(ch, 2)) { surge(ch); st.veiledScene = st.scene; }
    const r = roll(ch, { rating: opt.rating, action: opt.kind, difficulty: N.leadD, free: life + bookDie + sense, buy: spareMagic(ch, 3) > 0 ? 1 : 0, spell: !!opt.spell });
    let gain = r.result === RESULT.CRITICAL ? 2 : works(r.result) ? 1 : 0;
    if (surged && works(r.result)) gain += 1;
    if (opt.spell && (r.result === RESULT.SUCCESS || r.result === RESULT.CRITICAL)) gain += R.revealBonus;
    st.clues = Math.min(st.cluesNeeded, st.clues + gain);
    if (r.result === RESULT.PARTIAL || r.result === RESULT.FAILURE) investigationCost(ch, r.usedMagic, opt.pub);
  }

  function potionCap() { return R.potionCap === "witches" ? w : R.potionCap === "characters" ? n : R.potionCap; }
  function brewLimit() { return P.brew === "cap" ? 99 : { none: 0, one: 1, two: 2 }[P.brew]; }
  function brew(ch) {
    const r = roll(ch, { rating: "craft", action: "brew", difficulty: N.leadD });
    const made = r.result === RESULT.CRITICAL ? R.potionYield + 1 : works(r.result) ? R.potionYield : 0;
    for (let i = 0; i < made; i++) { if (coven.potions.length >= potionCap()) break; const k = pick(POTION_ORDER); coven.potions.push(k); use(`brewed:${k}`); } // "at most one potion per witch"
    st.brewed += 1;
    st.potionsMade = (st.potionsMade || 0) + made;
    if (r.result === RESULT.PARTIAL || r.result === RESULT.FAILURE) investigationCost(ch, true, false); // at home
  }

  function hide(ch) {
    spend(ch, 1);
    use("spell:hide");
    let surged = false;
    const quiet = R.hideQuiet; // "Casting Hide never raises Exposure."
    if (ch.power === "voice" && surgeOk(ch, 0)) { surge(ch, quiet); surged = true; }
    if (ch.power === "veil" && st.phase === "showdown" && st.place === "public" && surgeOk(ch, 0)) { surge(ch, quiet); st.veiledShowdown = true; }
    const r = roll(ch, { rating: "craft", action: "hide", difficulty: 2, spell: true, quiet });
    if (works(r.result)) lowerExposure((r.result === RESULT.CRITICAL ? 2 : 1) + (surged ? 1 : 0));
    if (r.result === RESULT.PARTIAL || r.result === RESULT.FAILURE) {
      if (st.phase === "showdown") hurt(ch, 1);
      else investigationCost(ch, !quiet, true);
    }
  }

  // ------------------------------------------------------- showdown
  function showdown(place) {
    st.phase = "showdown";
    st.place = place;
    st.innocent.present = place === "public";
    st.innocent.held = st.innocent.present && R.innocentHeld > 0; // "the threat starts holding the innocent"
    st.cluesAtShowdown = st.clues;
    st.doomAtShowdown = st.doom;
    for (const ch of coven.witches) if (!ch.lifeAnswered) { // "they lose 1 Magic (1 Hurt if they have none)"
      if (ch.magic > 0) { ch.magicLost = 1; ch.magic -= 1; } else hurt(ch, 1);
    }
    st.threat = {
      toughness: N.tWitch * w + N.tGuardian * g + toughnessExtra(),
      damage: 0, broken: false, brokenRound: null, skip: 0,
      lastHurtBy: null, hold: false, defenceMod: 0,
      attacks: settings.size.attacks[settings.size.attacksBy === "w" ? w : n],
    };
    while (!st.ended) round();
  }

  function toughnessExtra() {
    const by = settings.size.toughnessBy;
    if (by === "allWitches") return g ? 0 : settings.size.toughnessMod[n] || 0; // only covens with no guardian player
    return settings.size.toughnessMod[by === "w" ? w : n] || 0;
  }
  function threatExposed() {
    const i = st.innocent;
    return i.present && !i.safe && !i.lost;
  }
  /** The innocent is out of the threat's grip but still in the fight. */
  const innocentLoose = () => threatExposed() && !st.innocent.held;
  const freePool = ch => ch.ratings.nerve + (fits(ch, "free") ? R.powerDice : 0);
  /** Free a held innocent: Nerve against Defence; a Partial or better frees them. */
  function freeInnocent(ch) {
    use("free");
    const careful = carefulRound();
    const r = roll(ch, { rating: "nerve", action: "free", difficulty: Math.max(1, effectiveDefence()), power: !careful, buy: ch.kind === "witch" ? Math.min(2, spareMagic(ch, RESERVE)) : 0 });
    if (R.freeNeedsSuccess ? r.result === RESULT.SUCCESS || r.result === RESULT.CRITICAL : works(r.result)) st.innocent.held = false;
    fightCost(ch, r.result);
  }

  function round() {
    const T = st.threat;
    st.round++;
    st.magicThisRound = false;
    T.defenceMod = 0;
    st.innocent.guard = null;
    st.shelter = new Set();
    // No guardian player: one call per episode (Carry the innocent, or Mend a Down witch).
    if (coven.guardianCall && !st.callUsed) {
      const downW = coven.witches.filter(x => x.down);
      if (innocentLoose()) { st.innocent.safe = true; st.callUsed = true; use("call:carry"); if (st.place === "public") st.magicThisRound = true; }
      else if (downW.length) { heal(maxBy(downW, x => attackPool(x).pool), R.mendHeal); st.callUsed = true; use("call:mend"); if (st.place === "public") st.magicThisRound = true; }
    }
    const acted = new Set();
    const gd = coven.guardian;
    if (gd && !gd.down) { guardianAct(gd); acted.add(gd); }
    // A held innocent: up to two witches try to free them.
    if (st.innocent.held && !T.broken) {
      const cands = standing(coven.witches).filter(x => !acted.has(x)).sort((a, b) => freePool(b) - freePool(a));
      for (const ch of cands.slice(0, 2)) { if (!st.innocent.held) break; freeInnocent(ch); acted.add(ch); }
    }
    // Pick a guard for a loose innocent nobody is carrying out.
    if (innocentLoose() && !st.threat.broken) {
      const cands = standing(coven.witches);
      if (cands.length > 1) {
        const guard = minBy(cands, x => attackPool(x).pool);
        st.innocent.guard = guard; acted.add(guard); use("guard");
      }
    }
    if (carefulRound()) st.carefulRounds++;
    const order = standing(coven.witches).filter(x => !acted.has(x))
      .sort((a, b) => (b.power === "wild") - (a.power === "wild") || (b.power === "veil") - (a.power === "veil") || attackPool(b).pool - attackPool(a).pool);
    for (const ch of order) {
      if (st.ended) return;
      if (acted.has(ch) || ch.down) continue;
      witchAct(ch, acted);
      acted.add(ch);
    }
    if (st.ended) return;
    if (!T.broken) threatActs(); // "Then the threat acts."
    if (st.innocent.held && T.broken) st.innocent.held = false; // a Broken threat lets go
    if (st.innocent.held && st.round >= R.innocentHeld) { st.innocent.held = false; st.innocent.lost = true; } // "still held at the end of round 2: lost"
    if (st.place === "public" && st.magicThisRound && !st.veiledShowdown) raiseExposure(1); // once per round
    if (standing(coven.witches).length === 0) return end("allDown");
    if (T.broken) {
      if (J.brokenFlees === "thisRound" || st.round >= T.brokenRound + 1) return end("fled");
    } else {
      st.doom = Math.min(N.doomMax, st.doom + 1); // "Then Doom +1." (not once Broken)
      if (st.doom >= N.doomMax) return end("doom");
    }
  }

  function carefulRound() {
    return P.publicCare === "careful" && st.place === "public" && !st.seen && !st.veiledShowdown && st.exposure >= N.exposureMax - 1;
  }

  function mendTarget() {
    const downW = coven.witches.filter(x => x.down);
    if (downW.length) return maxBy(downW, x => attackPool(x).pool);
    const low = standing(coven.witches).filter(x => x.hurt >= 2);
    return low.length ? maxBy(low, x => x.hurt) : null;
  }
  function mend(gd, t) {
    spend(gd, 1, "ward"); heal(t, R.mendHeal); use("gift:mend"); if (st.place === "public") st.magicThisRound = true;
  }

  function guardianAct(gd) {
    if (R.mendFree) { const t = mendTarget(); if (t && gd.ward >= 1) mend(gd, t); } // no action, once a round
    if (st.innocent.held && !st.threat.broken) return freeInnocent(gd); // free them first
    if (innocentLoose() && gd.ward >= 1) { // Carry the innocent out
      spend(gd, 1, "ward"); st.innocent.safe = true; use("gift:carry"); if (st.place === "public") st.magicThisRound = true; return;
    }
    if (!R.mendFree) { const t = mendTarget(); if (t && gd.ward >= 1) return mend(gd, t); }
    // Hold: Nerve against Defence; the threat's next attack must target the guardian.
    if (gd.hurt > gd.hurtMax - 3) return; // too hurt to draw attacks: it stays back
    use("gift:hold");
    const r = roll(gd, { rating: "nerve", action: "hold", difficulty: Math.max(1, effectiveDefence()) });
    if (works(r.result)) st.threat.hold = true;
    fightCost(gd, r.result);
  }

  function effectiveDefence() { return Math.max(0, N.defence + st.threat.defenceMod + (weakness() ? 0 : R.noWeaknessDefence)); }
  function effectiveDefenceSafe() { return st.threat ? effectiveDefence() : N.defence; }

  function fightCost(ch, result) {
    if (result === RESULT.FAILURE) hurt(ch, 1);
    else if (result === RESULT.PARTIAL && J.fightPartialCost === "hurt") hurt(ch, 1);
  }

  function damageThreat(ch, k) {
    const T = st.threat;
    if (k <= 0 || T.broken) return;
    T.damage += k;
    st.damageBy[ch.id] += k;
    T.lastHurtBy = ch;
    if (T.damage >= T.toughness) { T.broken = true; T.brokenRound = st.round; } // "it is Broken"
  }

  function witchAct(ch, acted) {
    const T = st.threat;
    if (T.broken) {
      // A Broken threat stays until the end of the next round, so the coven waits for a round where
      // everyone can join, unless it would flee first.
      const fresh = st.round > T.brokenRound || J.brokenFlees === "thisRound";
      return fresh ? vanquish(ch, acted) : undefined;
    }
    const careful = carefulRound();
    // Free potion (no action, one per character per round), when the rule allows it.
    if (R.potionFree && !careful) {
      const needHeal = coven.witches.filter(x => x.down || x.hurt >= x.hurtMax - 1);
      if (needHeal.length && coven.potions.includes("healing")) { usePotion("healing"); heal(maxBy(needHeal, x => x.hurt * 10 + attackPool(x).pool), R.potionHeal); }
      else if (coven.potions.includes("blasting")) { usePotion("blasting"); damageThreat(ch, R.potionBlast); if (T.broken) return; }
      else if (coven.potions.includes("binding") && T.skip === 0) { usePotion("binding"); T.skip += 1; }
    }
    // Healing potion on a Down witch.
    const needHeal = coven.witches.filter(x => x.down || x.hurt >= x.hurtMax - 1);
    if (!R.potionFree && needHeal.length && coven.potions.includes("healing") && !careful) {
      usePotion("healing"); heal(maxBy(needHeal, x => x.hurt * 10 + attackPool(x).pool), R.potionHeal); return;
    }
    // Veil in a public showdown: Hide with a Surge, so the rest of the showdown is unseen.
    if (ch.power === "veil" && st.place === "public" && !st.veiledShowdown && !st.seen && ch.magic >= RESERVE + 1 + R.surgeCost) return hide(ch);
    // Voice in a public showdown with Exposure climbing: Hide.
    if (ch.power === "voice" && st.place === "public" && !st.seen && !st.veiledShowdown && st.exposure >= N.exposureMax - 2 && ch.magic >= RESERVE + 1) return hide(ch);
    // Study the threat if the Weakness is still unknown.
    if (!weakness()) {
      const studiers = standing(coven.witches).filter(x => !acted.has(x));
      const best = maxBy(studiers, x => x.ratings.wits + (fits(x, "study") ? R.powerDice : 0) - attackPool(x).pool / 2);
      if (best === ch && standing(coven.witches).length > 1) {
        use("study");
        const r = roll(ch, { rating: "wits", action: "study", difficulty: Math.max(1, effectiveDefence()), power: !careful, buy: spareMagic(ch, RESERVE) > 0 ? 1 : 0 });
        if (works(r.result)) st.clues = Math.min(st.cluesNeeded, st.clues + (r.result === RESULT.CRITICAL ? 2 : 1));
        fightCost(ch, r.result);
        return;
      }
    }
    // Wild: Bind (with a Surge the first time: the threat's Defence is 1 lower this round).
    if (ch.power === "wild" && ch.magic >= RESERVE + 1 && !careful && T.skip === 0) {
      spend(ch, 1);
      use("spell:bind");
      const surged = surgeOk(ch, RESERVE) ? (surge(ch), true) : false;
      const r = roll(ch, { rating: "craft", action: "bind", difficulty: Math.max(1, effectiveDefence()), spell: true, buy: Math.min(2, spareMagic(ch, RESERVE)) });
      if (works(r.result)) { T.skip += 1; if (surged) T.defenceMod -= 1; }
      fightCost(ch, r.result);
      return;
    }
    // Potions before rolling.
    if (!R.potionFree && !careful && coven.potions.includes("blasting")) { usePotion("blasting"); damageThreat(ch, R.potionBlast); return; }
    if (!R.potionFree && !careful && coven.potions.includes("binding") && T.skip === 0) { usePotion("binding"); T.skip += 1; return; }
    // Attack.
    const opt = attackPool(ch, !careful);
    if (opt.spell) { spend(ch, 1); use("spell:blast"); } else use("attack"); // Blast or a plain attack
    let surged = null;
    if (!careful && (ch.power === "force" || ch.power === "flame") && surgeOk(ch, RESERVE)) { surge(ch); surged = ch.power; }
    const r = roll(ch, { rating: opt.rating, action: "attack", difficulty: Math.max(1, effectiveDefence()), power: !careful, spell: opt.spell, buy: Math.min(2, spareMagic(ch, RESERVE)) });
    let dmg = R.damage[r.result] + (opt.spell && works(r.result) ? R.blastBonus : 0) + (weakness() && works(r.result) ? R.weaknessDamage : 0);
    if (surged === "flame" && works(r.result)) dmg += 2;
    if (surged === "force" && works(r.result)) T.skip += 1;
    damageThreat(ch, dmg);
    fightCost(ch, r.result);
  }

  function usePotion(kind) {
    coven.potions.splice(coven.potions.indexOf(kind), 1);
    use(`potion:${kind}`);
    st.potionsUsed++;
    if (st.place === "public") st.magicThisRound = true;
  }

  /** "The Vanquish (only against a Broken threat)." */
  function vanquish(ch, acted) {
    const avail = standing(coven.witches).filter(x => !acted.has(x));
    const leaders = avail.filter(x => x.magic >= 1);
    if (!leaders.length) return; // nobody can pay for the spell this round
    const leader = maxBy(leaders, x => x.ratings.craft);
    const joiners = [...avail.filter(x => x !== leader && x.magic >= 1), ...coven.witches.filter(x => x.down && x.magic >= 1)];
    spend(leader, 1);
    for (const j of joiners) { spend(j, 1); if (!j.down) acted.add(j); }
    const gd = coven.guardian;
    let gJoin = 0;
    if (R.guardianVanquish && gd && !gd.down && gd.ward >= 1) { spend(gd, 1, "ward"); gJoin = R.guardianVanquish; } // joins without an action
    acted.add(leader);
    // Extra dice for the leader: the leader's own Magic, then helpers' Magic, inside the +2 cap.
    let extra = spend(leader, Math.min(R.bonusCap, leader.magic));
    for (const h of coven.witches) { if (extra >= R.bonusCap) break; if (h !== leader && h.magic >= 1) extra += spend(h, 1); }
    st.vanquishTries++;
    use("spell:vanquish");
    const d = (R.vanquishByWitches ? w + N.vanquishAdd : N.vanquishD + (settings.size.vanquishMod[w] || 0)) + (weakness() ? 0 : R.noWeaknessVanquish);
    const r = roll(leader, { rating: "craft", action: "vanquish", difficulty: d, free: extra, joiners: joiners.length * R.vanquishJoinDice + gJoin, spell: true });
    st.vanquishLog.push({ pool: r.pool, d, result: r.result, joiners: joiners.length + gJoin });
    if (R.vanquishNeedsSuccess) {
      if (r.result === RESULT.SUCCESS || r.result === RESULT.CRITICAL) return end("destroyed");
      return; // the threat holds on; no extra cost
    }
    if (works(r.result)) {
      if (r.result === RESULT.PARTIAL) for (const j of [leader, ...joiners]) hurt(j, 1); // "each joiner takes 1 Hurt"
      return end("destroyed");
    }
    hurt(leader, 1);
  }

  function threatActs() {
    const T = st.threat;
    for (let i = 0; i < T.attacks; i++) {
      if (T.skip > 0) { T.skip--; continue; } // "loses its next attack"
      const d = rng.d6();
      if (d === 6) {
        if (innocentLoose()) {
          const guard = st.innocent.guard;
          if (guard && !guard.down) { attackOn(guard, 0); continue; } // "the threat must attack you instead"
          st.innocent.lost = true; continue; // "it takes the innocent instead"
        }
        if (J.signature === "heavy") { attackOn(target(4), 1); continue; }
        const a = target(1);
        attackOn(a, 0);
        const others = standing(all).filter(x => x !== a);
        if (others.length) attackOn(maxBy(others, x => x.hurt), 0);
        continue;
      }
      attackOn(target(d), 0);
    }
  }

  function target(d) {
    const T = st.threat;
    const up = standing(all);
    if (!up.length) return null;
    if (T.hold && coven.guardian && !coven.guardian.down) { T.hold = false; st.heldAttack = true; return coven.guardian; }
    if (d <= 3 && T.lastHurtBy && !T.lastHurtBy.down) return T.lastHurtBy; // "whoever hurt it last"
    const most = Math.max(...up.map(x => x.hurt));
    return pick(up.filter(x => x.hurt === most)); // "whoever is most hurt and still standing"
  }

  function attackOn(tgt, hitBonus) {
    if (!tgt) return;
    const hit = N.hit + hitBonus;
    if (st.shelter.has(tgt)) return;
    // Guardian Shield: take an attack that would put a witch Down.
    const gd = coven.guardian;
    if (gd && !gd.down && tgt.kind === "witch" && gd.ward >= 1 && tgt.hurt + hit >= tgt.hurtMax && gd.hurt + hit < gd.hurtMax) {
      spend(gd, 1, "ward"); tgt = gd; use("gift:shield");
    }
    // Sight Surge: "one attack this round misses".
    if (tgt.hurt + hit >= tgt.hurtMax && !carefulRound()) {
      const seer = standing(coven.witches).find(x => x.power === "sight" && surgeOk(x, 0));
      if (seer) { surge(seer); return; }
    }
    const careful = carefulRound();
    const danger = tgt.hurt + hit >= tgt.hurtMax;
    const held = st.heldAttack && tgt.kind === "guardian";
    st.heldAttack = false;
    const r = roll(tgt, { rating: "nerve", action: "defend", difficulty: N.attack, power: !careful, free: held ? R.holdDice : 0, buy: danger ? Math.min(2, spareMagic(tgt, RESERVE)) : 0 });
    const h = r.result === RESULT.FAILURE ? hit : r.result === RESULT.PARTIAL ? 1 : 0;
    hurt(tgt, h);
  }

  function end(reason) {
    if (st.ended) return;
    st.ended = reason;
  }

  // ------------------------------------------------------- play
  investigation();
  let result;
  switch (st.ended) {
    case "destroyed": result = st.innocent.lost ? "partial" : "win"; break;
    case "fled": result = "partial"; break;
    default: result = "loss"; // doom, allDown, retreat
  }
  if (st.ended === "doom") st.innocent.lost = true;
  if (st.seen) result = result === "win" ? "partial" : "loss"; // "Seen drops the result one step"

  const witchesDown = coven.witches.filter(x => x.everDown).length;
  return {
    result, reason: st.ended, label, w, g, n,
    powers: coven.witches.map(x => x.power),
    forced: st.forced, scenes: st.scene, rounds: st.round,
    cluesNeeded: st.cluesNeeded, cluesAtShowdown: st.cluesAtShowdown, weaknessAtShowdown: st.cluesAtShowdown >= st.cluesNeeded,
    weaknessAtEnd: weakness(), doomAtShowdown: st.doomAtShowdown, doomEnd: st.doom, doomMax: N.doomMax,
    exposure: st.exposure, seen: st.seen, innocentLost: st.innocent.lost,
    witchesDown, guardianDown: !!(coven.guardian && coven.guardian.everDown),
    downByPower: Object.fromEntries(coven.witches.map(x => [x.power, x.everDown])),
    magic: coven.witches.map(x => ({ power: x.power, spent: x.magicSpent, had: x.magicStart + x.magicGained, life: x.lifeAnswered })),
    ward: coven.guardian ? { spent: coven.guardian.wardSpent, had: coven.guardian.wardStart } : null,
    callUsed: st.callUsed, carefulRounds: st.carefulRounds, use: st.use,
    potionsMade: st.potionsMade || 0, potionsUsed: st.potionsUsed, brewed: st.brewed,
    vanquishTries: st.vanquishTries, vanquishLog: st.vanquishLog,
    rolls: st.rolls, rollsByPhase: st.rollsByPhase,
    damageBy: Object.fromEntries(coven.witches.map(x => [x.power, st.damageBy[x.id]])),
  };
}
