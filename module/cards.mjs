/**
 * WITCH & WARD — rolls, chat cards and what they do.
 *
 * A player rolls on their own sheet: their client spends their own Magic or
 * Ward and posts a card carrying structured flags. The active GM's client reads
 * the card and applies it to the episode and to other actors (Clues, damage,
 * Exposure, Hurt, potions, the innocent), so players never need permission to
 * write world state. With the "apply automatically" setting off, the GM gets an
 * Apply button on each card instead.
 */
import { WW } from "./config.mjs";
import { SYSTEM_ID, FLAG, SETTINGS, CARD } from "./contracts.mjs";
import { readRoll, RESULT, works } from "./logic/rules.mjs";
import * as E from "./logic/episode.mjs";
import { getEpisode, setEpisode, covenStatus, isActiveGM, witchesStanding } from "./store.mjs";
import { esc } from "./util.mjs";

const RESULT_LABEL = { critical: "Critical", success: "Success", partial: "Partial", failure: "Failure" };
const isFull = r => r === RESULT.SUCCESS || r === RESULT.CRITICAL;

/** Default rating and Difficulty for each purpose, from the episode. */
export function purposeDefaults(purpose, actor, state = getEpisode()) {
  const s = state?.active ? state : null;
  const best = keys => keys.reduce((b, k) => ((actor.system[k] ?? 0) > (actor.system[b] ?? 0) ? k : b), keys[0]);
  const table = {
    lead: [best(["heart", "wits"]), s?.leadD ?? 2],
    research: ["wits", s?.leadD ?? 2],
    reveal: ["craft", s?.leadD ?? 2],
    brew: ["craft", s?.leadD ?? 2],
    hide: ["craft", 2],
    attack: ["nerve", s ? E.defence(s) : 2],
    blast: ["craft", s ? E.defence(s) : 2],
    bind: ["craft", s ? E.defence(s) : 2],
    shelter: ["craft", 2],
    free: ["nerve", s ? E.defence(s) : 2],
    study: ["wits", s ? E.defence(s) : 2],
    hold: ["nerve", s ? E.defence(s) : 2],
    defend: ["nerve", s?.danger ?? 2],
    other: [best(["heart", "wits", "nerve", "craft"]), 2],
  };
  const [rating, difficulty] = table[purpose] ?? table.other;
  return { rating, difficulty };
}

/**
 * Roll for an actor (CORE-RULES "The roll"). `spec`: { purpose, rating, difficulty,
 * powerFits, casting, life, book, helpers, ownMagic, sense, surge, potion, brewKind }.
 * Spends the roller's own Magic (or the guardian's Ward) and posts the card.
 */
export async function performRoll(actor, spec) {
  const sys = actor.system;
  const isGuardian = actor.type === "guardian";
  const purpose = spec.purpose ?? "other";
  const spell = !!WW.purposes[purpose]?.spell;
  const powerFits = !isGuardian && !!spec.powerFits;
  const ownMagic = Math.max(0, Math.floor(spec.ownMagic ?? 0));
  const helperIds = (spec.helperIds ?? []).filter(id => id && id !== actor.id);
  const extra = Math.min(2, (spec.life ? 1 : 0) + (spec.book ? 1 : 0) + helperIds.length + ownMagic); // the +2 limit
  const outside = spec.sense ? 1 : 0; // "Sense's die doesn't count toward the limit"
  const rating = Math.max(0, sys[spec.rating] ?? 0);
  const pool = rating + (powerFits ? 2 : 0) + extra + outside;

  // Spend: spells 1 Magic, a Surge 2, own dice 1 each (Ward for the guardian).
  const cost = (spell ? 1 : 0) + (spec.surge && !isGuardian ? 2 : 0) + ownMagic;
  const purse = isGuardian ? "ward" : "magic";
  if (cost > (sys[purse] ?? 0)) {
    ui.notifications.warn(`${actor.name} hasn't got ${cost} ${isGuardian ? "Ward" : "Magic"} for that roll.`);
    return null;
  }
  const updates = {};
  if (cost) updates[`system.${purse}`] = sys[purse] - cost;
  if (sys.down && (spec.surge || spec.potion)) { ui.notifications.warn(`${actor.name} is Down: no Surges or potions.`); return null; }
  if (spec.surge && !isGuardian) {
    if (sys.surgeUsed) { ui.notifications.warn(`${actor.name} has already used a Surge this scene.`); return null; }
    updates["system.surgeUsed"] = true;
  }
  if (Object.keys(updates).length) await actor.update(updates);

  let faces = [];
  let roll = null;
  if (pool > 0) {
    roll = await new Roll(`${pool}d6`).evaluate();
    faces = roll.dice[0].results.map(r => r.result);
  }
  const read = readRoll(faces, Math.max(0, spec.difficulty ?? 2));
  const casting = !!(spec.casting || spell || powerFits || spec.potion);
  const card = {
    kind: CARD.roll, actorId: actor.id, actorType: actor.type, power: sys.power ?? null,
    purpose, rating: spec.rating, difficulty: spec.difficulty, pool, faces,
    successes: read.successes, sixes: read.sixes, result: read.result,
    casting, surge: !!spec.surge && !isGuardian, potion: spec.potion || null, brewKind: spec.brewKind || "healing",
    helperIds, targetId: spec.targetId ?? null, applied: false, summary: [],
  };
  const content = rollCardHtml(actor, card);
  const msg = await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor }), content, rolls: roll ? [roll] : [],
    flags: { [FLAG]: { card } },
  });
  return msg;
}

function rollCardHtml(actor, card) {
  const dice = card.faces.map(f => `<span class="ww-die${f >= 4 ? " ww-hit" : ""}${f === 6 ? " ww-six" : ""}">${f}</span>`).join("") || "<em>no dice</em>";
  const tags = [card.casting ? "casting" : null, card.surge ? `${WW.powers[card.power]?.label ?? ""} Surge` : null, card.potion ? `${WW.potions[card.potion]?.label} potion` : null].filter(Boolean);
  return `<div class="ww-card ww-roll">
    <header><strong>${esc(actor.name)}</strong>: ${esc(WW.purposes[card.purpose]?.label ?? card.purpose)}</header>
    <div class="ww-dice">${dice}</div>
    <p><strong>${card.successes}</strong> successes against Difficulty <strong>${card.difficulty}</strong> (${card.pool} dice, ${esc(WW.ratings[card.rating]?.label ?? card.rating)})</p>
    <p class="ww-result ww-${card.result}">${RESULT_LABEL[card.result]}</p>
    ${tags.length ? `<p class="ww-tags">${tags.map(esc).join(" · ")}</p>` : ""}
    <div class="ww-summary"></div>
  </div>`;
}

/* ------------------------------------------------------------------ */
/*  Applying cards (GM)                                               */
/* ------------------------------------------------------------------ */

/** Hurt an actor (capped at full). */
async function hurtActor(actor, k) {
  if (!actor || k <= 0) return;
  const max = actor.system.hurtMax ?? 4;
  await actor.update({ "system.hurt": Math.min(max, (actor.system.hurt ?? 0) + k) });
}
async function healActor(actor, k) {
  if (!actor || k <= 0) return;
  await actor.update({ "system.hurt": Math.max(0, (actor.system.hurt ?? 0) - k) });
}

/** The cost of a Partial or Failure (CORE-RULES "Cost"). Returns { state, hurt, text }. */
function payCost(s, card) {
  if (card.result !== RESULT.PARTIAL && card.result !== RESULT.FAILURE) return { state: s, hurt: 0, text: null };
  if (s.phase === "showdown") return { state: s, hurt: 1, text: "Cost: 1 Hurt." };
  const outInCity = ["lead", "reveal", "other"].includes(card.purpose);
  const veiled = s.veiledScene === s.scene;
  if (card.casting && outInCity && !veiled && card.purpose !== "hide") return { state: E.raiseExposure(s, 1), hurt: 0, text: "Cost: Exposure +1." };
  return { state: s, hurt: 1, text: "Cost: 1 Hurt." };
}

/** Work out and apply what a roll card does. Returns lines of summary. */
export async function applyRollCard(message) {
  const card = message.flags?.[FLAG]?.card;
  if (!card || card.kind !== CARD.roll || card.applied) return [];
  let s = getEpisode();
  const actor = game.actors.get(card.actorId);
  const lines = [];
  let hurt = 0;
  if (!s?.active || s.phase === "closing") { await markApplied(message, ["No episode is running: nothing applied."]); return []; }

  if (card.potion) {
    const i = s.potions.indexOf(card.potion);
    if (i >= 0) { s = { ...s, potions: s.potions.filter((_, j) => j !== i) }; lines.push(`Used a ${WW.potions[card.potion].label} potion.`); }
    else { lines.push(`No ${WW.potions[card.potion].label} potion left: it had no effect.`); card.potion = null; }
  }
  // Helpers pay 1 Magic (Ward for the guardian) each.
  for (const id of card.helperIds ?? []) {
    const h = game.actors.get(id);
    if (!h) continue;
    const purse = h.type === "guardian" ? "ward" : "magic";
    if ((h.system[purse] ?? 0) > 0) { await h.update({ [`system.${purse}`]: h.system[purse] - 1 }); lines.push(`${h.name} helped (−1 ${purse === "ward" ? "Ward" : "Magic"}).`); }
    else lines.push(`${h.name} had nothing left to help with: take one die off.`);
  }
  const surgeIs = p => card.surge && card.power === p;
  const cost = () => { const c = payCost(s, card); s = c.state; hurt += c.hurt; if (c.text) lines.push(c.text); };

  switch (card.purpose) {
    case "lead": case "reveal": case "research": {
      const surge = card.surge && ["sight", "voice", "wild"].includes(card.power);
      if (surgeIs("veil")) s = { ...s, veiledScene: s.scene };
      const k = E.leadClues(card.result, { reveal: card.purpose === "reveal", surge: surge && works(card.result) });
      s = E.addClues(s, k);
      if (k) lines.push(`+${k} Clue${k > 1 ? "s" : ""} (${s.clues}/${s.cluesNeeded}).`);
      if (s.clues >= s.half && E.canGo(s)) lines.push("The coven knows what the threat is and where: it may go to it.");
      if (E.weaknessKnown(s)) lines.push("All the Clues: the coven knows the Weakness.");
      cost();
      break;
    }
    case "brew": {
      const n = E.brewPotions(card.result, { surge: surgeIs("wild") });
      const before = s.potions.length;
      s = E.addPotions(s, Array(n).fill(card.brewKind || "healing"));
      if (n) lines.push(`Brewed ${s.potions.length - before} ${WW.potions[card.brewKind || "healing"].label} potion(s)${s.potions.length - before < n ? " (the rest were lost: the coven is at its limit)" : ""}.`);
      cost();
      break;
    }
    case "hide": {
      if (works(card.result)) {
        const k = 1 + (card.result === RESULT.CRITICAL ? 1 : 0) + (surgeIs("voice") ? 1 : 0);
        s = E.lowerExposure(s, k);
        lines.push(`Exposure −${k} (${s.exposure}/${s.exposureMax}).`);
      }
      if (surgeIs("veil")) {
        s = s.phase === "showdown" ? { ...s, veiledUntil: s.round + 1 } : { ...s, veiledScene: s.scene };
        lines.push(s.phase === "showdown" ? "Veil: no Exposure from casting this round and the next." : "Veil: no Exposure from casting for the rest of the scene.");
      }
      if (card.result === RESULT.PARTIAL || card.result === RESULT.FAILURE) { hurt += 1; lines.push("Cost: 1 Hurt."); } // Hide never raises Exposure
      break;
    }
    case "attack": case "blast": {
      const dmg = E.attackDamage(s, card.result, { blast: card.purpose === "blast", flameSurge: surgeIs("flame"), blasting: card.potion === "blasting" });
      s = E.damageThreat(s, dmg, card.actorId);
      if (dmg) lines.push(`${dmg} damage (${s.damage}/${s.toughness}).${s.broken ? " The threat is Broken." : ""}`);
      if (works(card.result) && surgeIs("force")) { s = E.loseAttack(s); lines.push("Force: the threat loses its next attack."); }
      if (works(card.result) && card.potion === "binding") { s = E.loseAttack(s); lines.push("Binding: the threat loses its next attack."); }
      cost();
      break;
    }
    case "bind": {
      if (works(card.result)) { s = E.loseAttack(s); lines.push("The threat loses its next attack."); }
      if (works(card.result) && surgeIs("wild")) { s = { ...s, defenceMod: (s.defenceMod ?? 0) - 1 }; lines.push("Wild: the threat's Defence is 1 lower for everyone this round."); }
      cost();
      break;
    }
    case "study": {
      if (works(card.result)) { const k = card.result === RESULT.CRITICAL ? 2 : 1; s = E.addClues(s, k); lines.push(`+${k} Clue (${s.clues}/${s.cluesNeeded}).${E.weaknessKnown(s) ? " The coven knows the Weakness." : ""}`); }
      cost();
      break;
    }
    case "free": {
      if (isFull(card.result) && s.innocent === "grip") { s = { ...s, innocent: "free" }; lines.push("The innocent is free."); }
      else if (!isFull(card.result)) lines.push("Not freed.");
      cost();
      break;
    }
    case "hold": {
      if (works(card.result)) { s = { ...s, hold: true }; lines.push("The threat's next attack must target the guardian."); }
      cost();
      break;
    }
    case "defend": {
      const k = E.defenceHurt(s, card.result);
      hurt += k;
      lines.push(k ? `Takes ${k} Hurt.` : "No Hurt.");
      break;
    }
    case "shelter": {
      if (works(card.result)) lines.push("Sheltered until the end of the threat's next turn (mark it on the tracker).");
      cost();
      break;
    }
    default: break;
  }
  if (card.casting && s.phase === "showdown") s = { ...s, castingThisRound: true };
  await setEpisode(s);
  if (hurt && actor) {
    await hurtActor(actor, hurt);
    if (actor.system.down) lines.push(`${actor.name} is Down.`);
  }
  await markApplied(message, lines);
  return lines;
}

async function markApplied(message, lines) {
  const extra = lines.length ? `<ul class="ww-applied">${lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul>` : "";
  const content = String(message.content ?? "").replace('<div class="ww-summary"></div>', `<div class="ww-summary">${extra}</div>`);
  await message.update({ content, [`flags.${FLAG}.card.applied`]: true, [`flags.${FLAG}.card.summary`]: lines });
}

/* ------------------------------------------------------------------ */
/*  The threat's turn                                                 */
/* ------------------------------------------------------------------ */

const RULE_TEXT = {
  last: "whoever hurt it last", most: "whoever has the most Hurt marked and is still standing",
  signature: "its signature move", innocent: "it takes the free, unguarded innocent: they're lost", guard: "it attacks the innocent's guard",
  hold: "Hold: it must target the guardian",
};

/** Roll the threat's attacks for this round and post the card (GM). */
export async function threatTurn() {
  let s = getEpisode();
  if (!s?.active || s.phase !== "showdown") return ui.notifications.warn("The threat acts only in a showdown.");
  if (s.broken) return ui.notifications.info("A Broken threat makes no more rolls or moves.");
  const threat = game.actors.get(s.threatId);
  const r = E.threatAttacks(s);
  s = r.state;
  const coven = covenStatus(s);
  const rows = [];
  for (let i = 0; i < r.attacks; i++) {
    const roll = await new Roll("1d6").evaluate();
    const d6 = roll.dice[0].results[0].result;
    let t = E.attackTarget(s, d6, coven);
    if (t.rule === "hold" && !t.candidates.length) t = E.attackTarget({ ...s, hold: false }, d6, coven); // the guardian is Down
    if (t.rule === "hold") s = { ...s, hold: false };
    const notAttack = threat?.system.signatureIsAttack === false; // ruling 82: a move that isn't an attack (Lure) ignores Hold
    if (t.rule === "signature" && s.hold && !notAttack) { // Hold: the guardian is an attacking move's first target
      const g = t.candidates.filter(c => c.guardian);
      t = { ...t, candidates: [...g, ...t.candidates.filter(c => !c.guardian)] };
      s = { ...s, hold: false };
    }
    if (t.rule === "guard" && s.hold && coven.some(c => c.guardian && !c.down)) { // ruling 85: Hold sends the attack on the guard to the guardian
      t = { ...t, rule: "hold", candidates: coven.filter(c => c.guardian && !c.down) };
      s = { ...s, hold: false };
    }
    if (t.rule === "guard") t = { ...t, candidates: coven.filter(c => !c.down) }; // whoever is guarding
    if (t.takesInnocent) s = { ...s, innocent: "lost" };
    // Ruling 92: a tie for the target is settled by a die roll among the tied characters.
    let tie = "";
    if ((t.rule === "most" || t.rule === "guard") && t.candidates.length > 1) {
      const pick = await new Roll(`1d${t.candidates.length}`).evaluate();
      const chosen = t.candidates[pick.total - 1];
      tie = ` (a tie: rolled ${pick.total} of ${t.candidates.length}, so ${esc(chosen.name)})`;
      t = { ...t, candidates: [chosen] };
    }
    const sig = t.rule === "signature" ? `: ${esc(threat?.system.signature ?? "Attacks two different characters.")}` : tie;
    const buttons = t.candidates.map(c => `<button type="button" data-ww-action="defend" data-actor="${c.id}">Defend: ${esc(c.name)}</button>`).join("");
    rows.push(`<li class="ww-attack"><span class="ww-die">${d6}</span> ${esc(RULE_TEXT[t.rule])}${sig}<div class="ww-buttons">${buttons}</div></li>`);
  }
  if (r.lostOne) rows.push(`<li>It loses one attack this round.</li>`);
  await setEpisode(s);
  const content = `<div class="ww-card ww-threat"><header><strong>${esc(threat?.name ?? "The threat")}</strong> acts (round ${s.round})</header>
    <p>Each target rolls Nerve (plus a Power that fits) against Danger ${s.danger}: Success no Hurt, Partial 1 Hurt, Failure ${s.hit} Hurt.</p>
    <ol class="ww-attacks">${rows.join("") || "<li>No attacks this round.</li>"}</ol></div>`;
  return ChatMessage.create({ speaker: { alias: threat?.name ?? "The threat" }, content, flags: { [FLAG]: { card: { kind: CARD.threatTurn, round: s.round } } } });
}

/* ------------------------------------------------------------------ */
/*  Guardian gifts                                                    */
/* ------------------------------------------------------------------ */

/** A guardian uses a gift: spends its own Ward and posts a card the GM applies. */
export async function useGift(guardian, gift, { targetId = null } = {}) {
  const g = WW.gifts[gift];
  if (!g) return null;
  if (gift === "hold") return null; // Hold is a roll
  if ((guardian.system.ward ?? 0) < g.ward) { ui.notifications.warn(`${guardian.name} has no Ward left.`); return null; }
  await guardian.update({ "system.ward": guardian.system.ward - g.ward });
  const target = targetId ? game.actors.get(targetId) : null;
  const content = `<div class="ww-card ww-gift"><header><strong>${esc(guardian.name)}</strong>: ${esc(g.label)}${target ? ` on ${esc(target.name)}` : ""}</header><p>${esc(g.text)}</p><div class="ww-summary"></div></div>`;
  return ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: guardian }), content, flags: { [FLAG]: { card: { kind: CARD.gift, gift, actorId: guardian.id, targetId, applied: false } } } });
}

export async function applyGiftCard(message) {
  const card = message.flags?.[FLAG]?.card;
  if (!card || card.kind !== CARD.gift || card.applied) return [];
  let s = getEpisode();
  const lines = [];
  if (card.gift === "mend") {
    const t = game.actors.get(card.targetId);
    if (t) { await healActor(t, 2); lines.push(`${t.name} clears 2 Hurt.`); }
  } else if (card.gift === "carry" && s?.active) {
    if (s.innocent === "free" || s.innocent === "guarded") { s = { ...s, innocent: "carried" }; lines.push("The innocent is carried to safety."); }
    else lines.push("Carried (the innocent wasn't free to carry).");
  } else if (card.gift === "shield") lines.push("Shield: the guardian takes that attack instead (roll its defence).");
  else if (card.gift === "sense") lines.push("Sense: +1 die on a lead this scene, outside the +2 limit.");
  if (s?.active && s.phase === "showdown" && ["mend", "carry"].includes(card.gift)) s = { ...s, castingThisRound: true };
  if (s?.active) await setEpisode(s);
  await markApplied(message, lines);
  return lines;
}

/* ------------------------------------------------------------------ */
/*  Healing potions                                                   */
/* ------------------------------------------------------------------ */

/** Drink (or give) a Healing potion from the coven's shared stock. The GM applies it. */
export async function drinkHealing(actor, { targetId = null } = {}) {
  const s = getEpisode();
  if (!s?.active || !s.potions?.includes("healing")) { ui.notifications.warn("The coven has no Healing potion."); return null; }
  if (actor.system.down) { ui.notifications.warn(`${actor.name} is Down and can't use a potion; someone else can use one on them.`); return null; }
  const target = game.actors.get(targetId ?? actor.id) ?? actor;
  const content = `<div class="ww-card ww-potion"><header><strong>${esc(actor.name)}</strong>: Healing potion${target.id !== actor.id ? ` for ${esc(target.name)}` : ""}</header><div class="ww-summary"></div></div>`;
  return ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content, flags: { [FLAG]: { card: { kind: CARD.potion, actorId: actor.id, targetId: target.id, applied: false } } } });
}

export async function applyPotionCard(message) {
  const card = message.flags?.[FLAG]?.card;
  if (!card || card.kind !== CARD.potion || card.applied) return [];
  let s = getEpisode();
  const lines = [];
  const i = s?.potions?.indexOf("healing") ?? -1;
  if (i < 0) lines.push("No Healing potion left: nothing happens.");
  else {
    s = { ...s, potions: s.potions.filter((_, j) => j !== i) };
    await setEpisode(s);
    const t = game.actors.get(card.targetId);
    if (t) { await healActor(t, 2); lines.push(`${t.name} clears 2 Hurt.`); }
    if (s.phase === "showdown") { s = { ...s, castingThisRound: true }; await setEpisode(s); }
  }
  await markApplied(message, lines);
  return lines;
}

/* ------------------------------------------------------------------ */
/*  Hooks                                                             */
/* ------------------------------------------------------------------ */

export async function applyCard(message) {
  const kind = message.flags?.[FLAG]?.card?.kind;
  if (kind === CARD.roll) return applyRollCard(message);
  if (kind === CARD.gift) return applyGiftCard(message);
  if (kind === CARD.potion) return applyPotionCard(message);
  return [];
}

const APPLIES = new Set([CARD.roll, CARD.gift, CARD.potion]);

export function registerCardHooks() {
  // The active GM applies new cards automatically (unless switched off).
  Hooks.on("createChatMessage", message => {
    if (!isActiveGM()) return;
    if (!game.settings.get(SYSTEM_ID, SETTINGS.autoApply)) return;
    const kind = message.flags?.[FLAG]?.card?.kind;
    if (APPLIES.has(kind)) applyCard(message).catch(err => console.error("Witch & Ward | applying a card failed", err));
  });

  // Buttons: Apply (GM, when automation is off) and Defend (the target's owner).
  Hooks.on("renderChatMessageHTML", (message, html) => {
    const card = message.flags?.[FLAG]?.card;
    if (!card) return;
    if (APPLIES.has(card.kind) && !card.applied && game.user.isGM && !game.settings.get(SYSTEM_ID, SETTINGS.autoApply)) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = "Apply";
      btn.addEventListener("click", () => applyCard(message));
      html.querySelector?.(".ww-summary")?.appendChild(btn) ?? html.appendChild(btn);
    }
    if (card.kind === CARD.threatTurn) {
      for (const b of html.querySelectorAll?.("[data-ww-action='defend']") ?? []) {
        const actor = game.actors.get(b.dataset.actor);
        if (!actor?.isOwner) { b.disabled = true; continue; }
        b.addEventListener("click", () => game.witchWard.rollDialog(actor, { purpose: "defend" }));
      }
      // Shield: a guardian someone owns may take any attack instead.
      const s = getEpisode();
      const guardians = (s?.coven ?? []).map(id => game.actors.get(id)).filter(a => a?.type === "guardian" && a.isOwner && !a.system.down);
      for (const g of guardians) {
        for (const li of html.querySelectorAll?.("li.ww-attack") ?? []) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.textContent = `Shield: ${g.name}`;
          btn.addEventListener("click", async () => { if (await useGift(g, "shield")) game.witchWard.rollDialog(g, { purpose: "defend" }); });
          (li.querySelector?.(".ww-buttons") ?? li).appendChild(btn);
        }
      }
    }
  });
}

export { witchesStanding };
