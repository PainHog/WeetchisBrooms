/**
 * WITCH & WARD — character sheets (witch, guardian, threat).
 */
import { WW } from "./config.mjs";
import { rollDialog, pickActor } from "./dialogs.mjs";
import { useGift, drinkHealing, performRoll } from "./cards.mjs";
import { getEpisode, covenActors } from "./store.mjs";
import { FLAG, CARD } from "./contracts.mjs";
import { esc } from "./util.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

const boxes = (n, filled) => Array.from({ length: n }, (_, i) => ({ value: i + 1, filled: i < filled }));
const choices = (keys, current, label = k => k) => keys.map(k => ({ value: k, label: label(k), selected: k === current }));

class WWActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["witch-ward", "ww-sheet"],
    position: { width: 560, height: "auto" },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      roll: async function (event, target) { await rollDialog(this.actor, { ...target.dataset }); },
      setHurt: async function (event, target) {
        const v = Number(target.dataset.value);
        await this.actor.update({ "system.hurt": this.actor.system.hurt === v ? v - 1 : v });
      },
      adjustPool: async function (event, target) {
        const key = target.dataset.field;
        await this.actor.update({ [`system.${key}`]: Math.max(0, (this.actor.system[key] ?? 0) + Number(target.dataset.delta)) });
      },
    },
  };

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    const s = getEpisode();
    return {
      ...ctx,
      actor: this.actor, system: this.actor.system, editable: this.isEditable,
      hurtBoxes: boxes(this.actor.system.hurtMax ?? 4, this.actor.system.hurt ?? 0),
      episode: s?.active ? s : null,
      investigation: s?.active && s.phase === "investigation",
      showdown: s?.active && s.phase === "showdown",
    };
  }
}

export class WitchSheet extends WWActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ["witch-ward", "ww-sheet", "ww-witch"],
    actions: {
      answerLife: async function () {
        const a = this.actor;
        if (a.system.lifeAnswered) return ui.notifications.info(`${a.name} has already answered their Life this episode.`);
        await a.update({ "system.lifeAnswered": true, "system.magic": (a.system.magic ?? 0) + 1 });
        await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: a }), content: `<div class="ww-card"><header><strong>${esc(a.name)}</strong> answers their Life (${esc(a.system.life || "Life")}): +1 Magic.</header></div>` });
      },
      rest: async function () {
        await this.actor.update({ "system.hurt": 0 });
        await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: this.actor }), content: `<div class="ww-card"><header><strong>${esc(this.actor.name)}</strong> rests: all Hurt cleared.</header></div>` });
      },
      drinkHealing: async function () {
        const s = getEpisode();
        const near = covenActors(s).filter(a => a.type === "witch" || a.type === "guardian");
        const who = near.length > 1 ? await pickActor("Healing potion: for whom?", near) : this.actor.id;
        if (who) await drinkHealing(this.actor, { targetId: who });
      },
      sightSurge: async function () {
        const a = this.actor;
        if (a.system.power !== "sight") return;
        if (a.system.surgeUsed) return ui.notifications.warn(`${a.name} has already used a Surge this scene.`);
        if ((a.system.magic ?? 0) < 2) return ui.notifications.warn(`${a.name} hasn't got 2 Magic.`);
        await a.update({ "system.magic": a.system.magic - 2, "system.surgeUsed": true });
        await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: a }), content: `<div class="ww-card"><header><strong>${esc(a.name)}</strong>: Sight Surge</header><p>One attack aimed at anyone misses (no defence roll). This isn't a lost attack.</p></div>`, flags: { [FLAG]: { card: { kind: CARD.episode } } } });
      },
    },
  };
  static PARTS = { main: { template: "systems/witch-ward/templates/sheets/witch.hbs" } };

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    const sys = this.actor.system;
    const s = ctx.episode;
    return {
      ...ctx,
      ratings: Object.entries(WW.ratings).map(([key, r]) => ({ key, label: r.label, hint: r.hint, value: sys[key] ?? 0 })),
      powerOptions: choices(WW.powerOrder, sys.power, k => WW.powers[k].label),
      lifeOptions: choices(["", ...WW.lives], sys.life, k => k || "(pick)"),
      power: WW.powers[sys.power] ?? null,
      isSight: sys.power === "sight",
      hasHealing: !!s?.potions?.includes("healing"),
      spells: Object.values(WW.spells),
    };
  }
}

export class GuardianSheet extends WWActorSheet {
  static DEFAULT_OPTIONS = {
    classes: ["witch-ward", "ww-sheet", "ww-guardian"],
    actions: {
      gift: async function (event, target) {
        const gift = target.dataset.gift;
        if (gift === "hold") return rollDialog(this.actor, { purpose: "hold" });
        let targetId = null;
        if (gift === "mend") {
          const s = getEpisode();
          const people = s?.active ? covenActors(s) : game.actors.filter(a => a.type === "witch" || a.type === "guardian");
          targetId = await pickActor("Mend: who does it touch?", people);
          if (!targetId) return null;
        }
        return useGift(this.actor, gift, { targetId });
      },
    },
  };
  static PARTS = { main: { template: "systems/witch-ward/templates/sheets/guardian.hbs" } };

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    const sys = this.actor.system;
    return {
      ...ctx,
      ratings: ["heart", "wits", "nerve"].map(key => ({ key, label: WW.ratings[key].label, hint: WW.ratings[key].hint, value: sys[key] ?? 0 })),
      gifts: Object.entries(WW.gifts).map(([key, g]) => ({ key, ...g })),
    };
  }
}

export class ThreatSheet extends WWActorSheet {
  static DEFAULT_OPTIONS = { classes: ["witch-ward", "ww-sheet", "ww-threat"], position: { width: 520 } };
  static PARTS = { main: { template: "systems/witch-ward/templates/sheets/threat.hbs" } };

  async _prepareContext(options) {
    const ctx = await super._prepareContext(options);
    const s = ctx.episode;
    return { ...ctx, inPlay: !!s && s.threatId === this.actor.id };
  }
}

export { performRoll };
