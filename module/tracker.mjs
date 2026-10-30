/**
 * WITCH & WARD — the Episode Tracker (Storyteller's screen).
 *
 * Everyone can open it to see Doom, Exposure, Clues and the threat's damage.
 * Only a GM can press its buttons: it runs the episode's steps (CORE-RULES
 * "An episode") with the pure rules in module/logic/episode.mjs.
 */
import { WW } from "./config.mjs";
import { FLAG, CARD, HOOKS } from "./contracts.mjs";
import * as E from "./logic/episode.mjs";
import { readRoll, RESULT } from "./logic/rules.mjs";
import { getEpisode, setEpisode, covenActors, witchesStanding } from "./store.mjs";
import { threatTurn } from "./cards.mjs";
import { formValue } from "./dialogs.mjs";
import { esc } from "./util.mjs";

const { ApplicationV2, HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;
const RESULT_TEXT = { win: "Win", partial: "Partial", loss: "Loss" };
const ENDED_TEXT = { destroyed: "the threat was destroyed", fled: "the threat fled", doom: "Doom filled", allDown: "every witch was Down", retreat: "the coven retreated" };

/* ------------------------------------------------------------------ */
/*  Episode steps (GM)                                                */
/* ------------------------------------------------------------------ */

/** Start a new episode and reset the coven (Magic, Ward, Hurt, Life, Surges, Scars). */
export async function startEpisode({ label = "standard", threatId = null, coven = [], seasonEpisode = 1, returningBonus = 0, bookPage = false, exposure = 0 } = {}) {
  const actors = coven.map(id => game.actors.get(id)).filter(Boolean);
  const witches = actors.filter(a => a.type === "witch").length;
  if (!witches) { ui.notifications.warn("Pick at least one witch for the coven."); return null; }
  const guardianPlayer = actors.some(a => a.type === "guardian");
  const state = {
    ...E.newEpisode({ label, witches, guardianPlayer, seasonEpisode, returningBonus, bookPage, exposure, threatId }),
    coven: actors.map(a => a.id),
    covenNames: actors.map(a => ({ id: a.id, name: a.name, guardian: a.type === "guardian" })),
    guardianCalled: false,
  };
  for (const a of actors) {
    if (a.type === "witch") await a.update({ "system.magic": WW.startMagic, "system.hurt": a.system.scar ? 1 : 0, "system.scar": false, "system.lifeAnswered": false, "system.surgeUsed": false });
    else await a.update({ "system.ward": WW.startWard, "system.hurt": 0 });
  }
  await setEpisode(state);
  const threat = game.actors.get(threatId);
  await postEpisodeCard(`A new episode: ${WW.labels[label]}${threat ? `, ${threat.name}` : ""}. ${witches} witch${witches > 1 ? "es" : ""}${guardianPlayer ? " and the guardian" : ", no guardian player"}. Clues needed ${state.cluesNeeded} (half ${state.half}); threat Toughness ${state.toughness}.`);
  return state;
}

async function resetSurges(state) {
  for (const a of covenActors(state)) if (a.type === "witch" && a.system.surgeUsed) await a.update({ "system.surgeUsed": false });
}

/** Start the showdown: unanswered Lives cost 1 Magic (or 1 Hurt), Surges refresh. */
async function beginShowdown(state, place, { started = false } = {}) {
  const s = started ? state : E.startShowdown(state, place);
  const lines = [];
  for (const a of covenActors(s)) {
    if (a.type !== "witch" || a.system.lifeAnswered) continue;
    if ((a.system.magic ?? 0) > 0) { await a.update({ "system.magic": a.system.magic - 1, "system.lifeAnswered": true }); lines.push(`${a.name} never answered their Life: −1 Magic.`); }
    else { await a.update({ "system.hurt": Math.min(a.system.hurtMax ?? 4, (a.system.hurt ?? 0) + 1), "system.lifeAnswered": true }); lines.push(`${a.name} never answered their Life: 1 Hurt.`); }
  }
  await resetSurges(s);
  await setEpisode(s);
  const head = place === "public"
    ? "Too late: the threat comes to them. A public showdown, the innocent in its grip. Round 1: the threat acts first."
    : "The coven goes to it: a hidden showdown, no innocent there. Round 1: the threat acts first.";
  await postEpisodeCard(head, lines);
  return s;
}

export async function endScene() {
  const s0 = getEpisode();
  if (!s0?.active || s0.phase !== "investigation") return null;
  const { state, forced } = E.endScene(s0);
  if (forced) return beginShowdown(state, "public", { started: true });
  await resetSurges(state);
  await setEpisode(state);
  return state;
}

export async function goToIt() {
  const s = getEpisode();
  if (!s?.active || !E.canGo(s)) { ui.notifications.warn("The coven needs half the Clues, before the Showdown mark, to go to it."); return null; }
  return beginShowdown(s, "hidden");
}

/** End the showdown round (Exposure, Doom, the innocent, the end checks). */
export async function endRound() {
  const s0 = getEpisode();
  if (!s0?.active || s0.phase !== "showdown") return null;
  const s = E.endRound(s0, { witchesStanding: witchesStanding(s0) });
  if (s.ended) return closeEpisode(s);
  await setEpisode(s);
  return s;
}

/** End the episode for a reason (destroyed, fled, retreat). */
export async function finishEpisode(reason) {
  const s0 = getEpisode();
  if (!s0?.active || s0.phase === "closing") return null;
  return closeEpisode(E.finish(s0, reason));
}

/** Record the end: Scars for witches Down in a Loss, a chat card, the closing phase. */
async function closeEpisode(s) {
  const lines = [];
  if (s.result === "loss" && s.ended !== "retreat") { // retreating gives no Scars
    for (const a of covenActors(s)) if (a.type === "witch" && a.system.down) { await a.update({ "system.scar": true }); lines.push(`${a.name} was Down: a Scar (1 Hurt at the start of the next episode).`); }
  }
  if (s.seen) lines.push("The coven was Seen: the result dropped one step.");
  if (s.innocent === "lost") lines.push("The innocent was lost.");
  await setEpisode(s);
  await postEpisodeCard(`The episode ends: ${ENDED_TEXT[s.ended] ?? s.ended}. Result: ${RESULT_TEXT[s.result]}.`, lines);
  return s;
}

/** The Unmaking (CORE-RULES): leader Craft + 2 dice per joiner, Difficulty = witches (+2 without the Weakness). */
export async function unmaking({ leaderId, joinerIds = [], extra = 0 } = {}) {
  let s = getEpisode();
  if (!s?.active || s.phase !== "showdown" || !s.broken) { ui.notifications.warn("The Unmaking works only on a Broken threat."); return null; }
  const leader = game.actors.get(leaderId);
  if (!leader || leader.type !== "witch" || leader.system.down) { ui.notifications.warn("The Unmaking needs a standing witch to lead."); return null; }
  const own = Math.max(0, Math.min(2, Math.floor(extra)));
  if ((leader.system.magic ?? 0) < 1 + own) { ui.notifications.warn(`${leader.name} hasn't got the Magic to lead.`); return null; }
  await leader.update({ "system.magic": leader.system.magic - 1 - own });
  const joined = [];
  for (const id of joinerIds) {
    const j = game.actors.get(id);
    if (!j || j.id === leader.id || j.type !== "witch") continue;
    if ((j.system.magic ?? 0) < 1) continue;
    await j.update({ "system.magic": j.system.magic - 1 });
    joined.push(j);
  }
  const pool = (leader.system.craft ?? 0) + 2 * joined.length + own;
  const difficulty = E.unmakeDifficulty(s);
  const roll = await new Roll(`${pool}d6`).evaluate();
  const faces = roll.dice[0].results.map(r => r.result);
  const read = readRoll(faces, difficulty);
  const destroyed = read.result === RESULT.SUCCESS || read.result === RESULT.CRITICAL;
  if (s.place === "public") s = { ...s, castingThisRound: true };
  await setEpisode(s);
  const dice = faces.map(f => `<span class="ww-die${f >= 4 ? " ww-hit" : ""}">${f}</span>`).join("");
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ actor: leader }),
    content: `<div class="ww-card ww-unmaking"><header><strong>The Unmaking</strong>, led by ${esc(leader.name)}${joined.length ? `, with ${joined.map(j => esc(j.name)).join(", ")}` : ""}</header>
      <div class="ww-dice">${dice}</div><p><strong>${read.successes}</strong> successes against Difficulty <strong>${difficulty}</strong> (${pool} dice)</p>
      <p class="ww-result ww-${destroyed ? "success" : "failure"}">${destroyed ? "The threat is destroyed." : "Not destroyed. Nobody takes Hurt: try again next round if it's still there."}</p></div>`,
    rolls: [roll],
    flags: { [FLAG]: { card: { kind: CARD.unmaking, result: read.result, pool, difficulty } } },
  });
  if (destroyed) return finishEpisode("destroyed");
  return getEpisode();
}

/** No guardian player: once per episode, call it for one Mend or one Carry (counts as casting). */
export async function callGuardian(kind, targetId = null) {
  let s = getEpisode();
  if (!s?.active || s.guardianCalled) { ui.notifications.warn("The guardian can be called once an episode."); return null; }
  const lines = [];
  if (kind === "mend") {
    const t = game.actors.get(targetId);
    if (!t) return null;
    await t.update({ "system.hurt": Math.max(0, (t.system.hurt ?? 0) - 2) });
    lines.push(`The guardian mends ${t.name}: clear 2 Hurt.`);
  } else {
    if (s.innocent === "free" || s.innocent === "guarded") s = { ...s, innocent: "carried" };
    lines.push("The guardian carries someone to safety.");
  }
  s = { ...s, guardianCalled: true, castingThisRound: s.phase === "showdown" ? true : s.castingThisRound };
  await setEpisode(s);
  await postEpisodeCard("The coven calls its guardian.", lines);
  return s;
}

/** Storyteller corrections: nudge a number on the episode. */
export async function adjust(field, delta) {
  let s = getEpisode();
  if (!s?.active) return null;
  const n = Number(delta) || 0;
  if (field === "doom") s = { ...s, doom: Math.max(0, Math.min(s.doomMax, s.doom + n)) };
  else if (field === "exposure") s = n > 0 ? E.raiseExposure(s, n) : { ...s, exposure: Math.max(0, s.exposure + n), seen: s.exposure + n >= s.exposureMax ? s.seen : false };
  else if (field === "clues") s = n > 0 ? E.addClues(s, n) : { ...s, clues: Math.max(0, s.clues + n) };
  else if (field === "damage") s = n > 0 ? E.damageThreat(s, n) : { ...s, damage: Math.max(0, s.damage + n), broken: s.damage + n >= s.toughness ? s.broken : false };
  else if (field === "lost") s = n > 0 ? E.loseAttack(s, n) : { ...s, lost: Math.max(0, s.lost + n) };
  else if (field === "round") s = { ...s, round: Math.max(1, s.round + n) };
  else if (field === "scene") s = { ...s, scene: Math.max(1, s.scene + n) };
  else return null;
  return setEpisode(s);
}

async function postEpisodeCard(head, lines = []) {
  return ChatMessage.create({
    speaker: { alias: "The episode" },
    content: `<div class="ww-card ww-episode"><header>${esc(head)}</header>${lines.length ? `<ul>${lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul>` : ""}</div>`,
    flags: { [FLAG]: { card: { kind: CARD.episode } } },
  });
}

/* ------------------------------------------------------------------ */
/*  The app                                                           */
/* ------------------------------------------------------------------ */

const gmOnly = fn => async function (event, target) {
  if (!game.user.isGM) return ui.notifications.warn("Only the Storyteller (a GM) runs the episode.");
  return fn.call(this, event, target);
};

export class EpisodeTracker extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "witch-ward-tracker",
    classes: ["witch-ward", "ww-tracker"],
    tag: "section",
    window: { title: "Episode Tracker", resizable: true },
    position: { width: 520, height: "auto" },
    actions: {
      start: gmOnly(async function () { await startEpisodeDialog(); }),
      endScene: gmOnly(async function () { await endScene(); }),
      goToIt: gmOnly(async function () { await goToIt(); }),
      threatTurn: gmOnly(async function () { await threatTurn(); }),
      endRound: gmOnly(async function () { await endRound(); }),
      unmaking: gmOnly(async function () { await unmakingDialog(); }),
      retreat: gmOnly(async function () {
        if (await DialogV2.confirm({ window: { title: "Retreat" }, content: "<p>The coven retreats together. The episode ends in a Loss.</p>" })) await finishEpisode("retreat");
      }),
      fled: gmOnly(async function () { await finishEpisode("fled"); }),
      adjust: gmOnly(async function (event, target) { await adjust(target.dataset.field, Number(target.dataset.delta)); }),
      innocent: gmOnly(async function (event, target) { const s = getEpisode(); if (s?.active) await setEpisode({ ...s, innocent: target.dataset.value }); }),
      hold: gmOnly(async function () { const s = getEpisode(); if (s?.active) await setEpisode({ ...s, hold: !s.hold }); }),
      addPotion: gmOnly(async function (event, target) { const s = getEpisode(); if (s?.active) await setEpisode(E.addPotions(s, [target.dataset.kind])); }),
      removePotion: gmOnly(async function (event, target) { const s = getEpisode(); if (s?.active) await setEpisode({ ...s, potions: s.potions.filter((_, i) => i !== Number(target.dataset.index)) }); }),
      callGuardian: gmOnly(async function () { await callGuardianDialog(); }),
      clear: gmOnly(async function () {
        if (await DialogV2.confirm({ window: { title: "Clear the episode" }, content: "<p>Close this episode and clear the tracker?</p>" })) await setEpisode({ active: false });
      }),
      openActor: async function (event, target) { game.actors.get(target.dataset.id)?.sheet?.render(true); },
    },
  };

  static PARTS = { main: { template: "systems/witch-ward/templates/apps/tracker.hbs" } };

  async _prepareContext(options) {
    const s = getEpisode();
    const ctx = { isGM: !!game.user?.isGM, active: !!s?.active };
    if (!s?.active) return ctx;
    const threat = game.actors.get(s.threatId);
    const boxes = (n, filled, mark = 0) => Array.from({ length: n }, (_, i) => ({ filled: i < filled, mark: mark && i === mark - 1 }));
    const coven = covenActors(s).map(a => ({
      id: a.id, name: a.name, guardian: a.type === "guardian",
      hurt: a.system.hurt ?? 0, hurtMax: a.system.hurtMax ?? 4, down: !!a.system.down,
      pool: a.type === "guardian" ? a.system.ward : a.system.magic, poolLabel: a.type === "guardian" ? "Ward" : "Magic",
      lifeAnswered: !!a.system.lifeAnswered, surgeUsed: !!a.system.surgeUsed, isWitch: a.type === "witch",
    }));
    const potionCounts = Object.keys(WW.potions).map(k => ({ kind: k, label: WW.potions[k].label }));
    const step = s.phase === "investigation"
      ? `Scene ${s.scene}. Each character takes one action. Then end the scene (Doom +1; the mark is ${s.mark}).`
      : s.phase === "showdown"
        ? (s.round === 1 ? "Round 1: the threat acts first, then the characters act, then end the round." : `Round ${s.round}: the characters act, then the threat acts, then end the round.`)
        : `The episode is over: ${RESULT_TEXT[s.result]} (${ENDED_TEXT[s.ended] ?? s.ended}). Play the closing scenes, then clear the tracker.`;
    return {
      ...ctx, s, threatName: threat?.name ?? "The threat", threatWeakness: threat?.system?.weakness ?? "",
      label: WW.labels[s.label] ?? s.label, step,
      investigation: s.phase === "investigation", showdown: s.phase === "showdown", closing: s.phase === "closing",
      doomBoxes: boxes(s.doomMax, s.doom, s.mark), exposureBoxes: boxes(s.exposureMax, s.exposure),
      damageText: `${s.damage}/${s.toughness}`, cluesText: `${s.clues}/${s.cluesNeeded}`,
      canGo: E.canGo(s), weaknessKnown: E.weaknessKnown(s), defence: E.defence(s), unmakeD: E.unmakeDifficulty(s),
      innocentLabel: WW.innocent[s.innocent] ?? s.innocent, publicPlace: s.place === "public",
      innocentStates: Object.entries(WW.innocent).map(([value, text]) => ({ value, text, current: value === s.innocent })),
      potions: (s.potions ?? []).map((k, index) => ({ index, label: WW.potions[k]?.label ?? k })), potionKinds: potionCounts,
      potionCap: s.potionCap, coven, canCall: !s.guardianPlayer && !s.guardianCalled,
      resultText: RESULT_TEXT[s.result] ?? "",
    };
  }

  /** Re-render when the episode or a coven actor changes. */
  _onFirstRender(context, options) {
    super._onFirstRender?.(context, options);
    this._hooks = [
      [HOOKS.episodeChanged, Hooks.on(HOOKS.episodeChanged, () => this.render())],
      ["updateActor", Hooks.on("updateActor", actor => { if (getEpisode()?.coven?.includes(actor.id)) this.render(); })],
    ];
  }
  _onClose(options) {
    super._onClose?.(options);
    for (const [name, id] of this._hooks ?? []) Hooks.off(name, id);
    this._hooks = [];
  }
}

/* ------------------------------------------------------------------ */
/*  Dialogs                                                           */
/* ------------------------------------------------------------------ */

const list = (type) => game.actors.filter(a => a.type === type);

export async function startEpisodeDialog(preset = {}) {
  const threats = list("threat");
  const label0 = preset.label ?? "standard";
  const threat0 = preset.threatId ?? (preset.threatName ? threats.find(t => t.name === preset.threatName)?.id : null);
  const witches = list("witch");
  const guardians = list("guardian");
  const content = `<div class="witch-ward ww-start">
    <div class="form-group"><label>Difficulty</label><select name="label">${Object.entries(WW.labels).map(([k, v]) => `<option value="${k}" ${k === label0 ? "selected" : ""}>${v}</option>`).join("")}</select></div>
    <div class="form-group"><label>Threat</label><select name="threatId"><option value="">(none)</option>${threats.map(t => `<option value="${t.id}" ${t.id === threat0 ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</select></div>
    <fieldset><legend>The coven</legend>${witches.map(w => `<label><input type="checkbox" name="c-${w.id}" ${w.hasPlayerOwner ? "checked" : ""}> ${esc(w.name)}</label>`).join("")}
      ${guardians.map(g => `<label><input type="checkbox" name="c-${g.id}" ${g.hasPlayerOwner ? "checked" : ""}> ${esc(g.name)} (guardian: tick only if a player plays it)</label>`).join("")}</fieldset>
    <div class="form-group"><label>Episode in the season</label><input type="number" name="seasonEpisode" min="1" value="1"></div>
    <div class="form-group"><label>Returning threat bonus (Toughness)</label><input type="number" name="returningBonus" min="0" value="0"></div>
    <div class="form-group"><label>Starting Exposure</label><input type="number" name="exposure" min="0" value="0"></div>
    <div class="form-group"><label><input type="checkbox" name="bookPage"> A Book page from last time: start with half the Clues</label></div>
  </div>`;
  const ids = [...witches, ...guardians].map(a => a.id);
  const opts = await DialogV2.prompt({
    window: { title: "Start an episode" }, content, rejectClose: false,
    ok: {
      label: "Start",
      callback: (event, button) => {
        const f = button.form;
        return {
          label: formValue(f, "label") || "standard",
          threatId: formValue(f, "threatId") || null,
          coven: ids.filter(id => formValue(f, `c-${id}`) === true),
          seasonEpisode: Number(formValue(f, "seasonEpisode")) || 1,
          returningBonus: Number(formValue(f, "returningBonus")) || 0,
          exposure: Number(formValue(f, "exposure")) || 0,
          bookPage: formValue(f, "bookPage") === true,
        };
      },
    },
  });
  if (!opts) return null;
  return startEpisode(opts);
}

export async function unmakingDialog() {
  const s = getEpisode();
  if (!s?.active || !s.broken) return ui.notifications.warn("The Unmaking works only on a Broken threat.");
  const witches = covenActors(s).filter(a => a.type === "witch");
  const standing = witches.filter(w => !w.system.down && (w.system.magic ?? 0) >= 1);
  if (!standing.length) return ui.notifications.warn("No standing witch has the Magic to lead the Unmaking.");
  const content = `<div class="witch-ward ww-unmake">
    <p>Difficulty ${E.unmakeDifficulty(s)}${E.weaknessKnown(s) ? "" : " (+2: the coven doesn't know the Weakness)"}. The leader rolls Craft and pays 1 Magic. Each joiner pays 1 Magic and adds 2 dice (a standing witch joins as their action; a Down witch joins without one).</p>
    <div class="form-group"><label>Leader</label><select name="leader">${standing.map(w => `<option value="${w.id}">${esc(w.name)} (Craft ${w.system.craft}, Magic ${w.system.magic})</option>`).join("")}</select></div>
    <fieldset><legend>Joiners</legend>${witches.map(w => `<label><input type="checkbox" name="j-${w.id}" ${(w.system.magic ?? 0) >= 1 ? "checked" : "disabled"}> ${esc(w.name)} (Magic ${w.system.magic})</label>`).join("")}</fieldset>
    <div class="form-group"><label>Leader's own Magic dice (+2 at most)</label><input type="number" name="extra" min="0" max="2" value="0"></div>
  </div>`;
  const opts = await DialogV2.prompt({
    window: { title: "The Unmaking" }, content, rejectClose: false,
    ok: {
      label: "Roll",
      callback: (event, button) => {
        const f = button.form;
        const leaderId = formValue(f, "leader");
        return { leaderId, joinerIds: witches.filter(w => w.id !== leaderId && formValue(f, `j-${w.id}`) === true).map(w => w.id), extra: Number(formValue(f, "extra")) || 0 };
      },
    },
  });
  if (!opts) return null;
  return unmaking(opts);
}

export async function callGuardianDialog() {
  const s = getEpisode();
  if (!s?.active || s.guardianCalled || s.guardianPlayer) return ui.notifications.warn("The guardian can be called once an episode, and only with no guardian player.");
  const coven = covenActors(s);
  const content = `<div class="witch-ward"><p>Once an episode: one Mend or one Carry. It takes no action and no roll, and counts as casting.</p>
    <div class="form-group"><label>Call it to</label><select name="kind"><option value="mend">Mend (clear 2 Hurt)</option><option value="carry">Carry (take one person to safety)</option></select></div>
    <div class="form-group"><label>Mend who</label><select name="who">${coven.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join("")}</select></div></div>`;
  const opts = await DialogV2.prompt({
    window: { title: "Call the guardian" }, content, rejectClose: false,
    ok: { label: "Call", callback: (event, button) => ({ kind: formValue(button.form, "kind"), who: formValue(button.form, "who") }) },
  });
  if (!opts) return null;
  return callGuardian(opts.kind, opts.who);
}
