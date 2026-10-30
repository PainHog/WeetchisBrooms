/**
 * WITCH & WARD — the roll dialog and the Storyteller's dialogs.
 */
import { WW } from "./config.mjs";
import { performRoll, purposeDefaults } from "./cards.mjs";
import { getEpisode } from "./store.mjs";
import { esc } from "./util.mjs";

const DialogV2 = () => foundry.applications.api.DialogV2;

/** Which purposes each Power fits by default (CORE-RULES "Powers"); the player can untick it. */
export const POWER_FITS = {
  force: ["attack", "blast", "free"],
  flame: ["attack", "blast"],
  sight: ["lead", "research", "reveal", "defend", "study"],
  voice: ["lead", "hide"],
  veil: ["lead", "research", "defend", "hide"],
  wild: ["lead", "research", "bind", "brew"],
};
const GUARDIAN_PURPOSES = ["lead", "research", "free", "study", "hold", "defend", "other"];

/** Read a form control by name: checkbox → boolean, else its value. */
export function formValue(form, name) {
  const el = form?.elements?.namedItem?.(name) ?? form?.elements?.[name];
  if (!el) return undefined;
  if (el.type === "checkbox") return !!el.checked;
  if (el.checked === true && el.value === "on") return true;
  return el.value;
}
const num = (v, d = 0) => (Number.isFinite(Number(v)) && v !== "" && v != null ? Number(v) : d);
const bool = v => v === true || v === "on" || v === "true";

/** The purposes this actor may roll now. */
export function purposesFor(actor, state = getEpisode()) {
  const phase = state?.active ? state.phase : null;
  return Object.entries(WW.purposes)
    .filter(([k]) => (actor.type === "guardian" ? GUARDIAN_PURPOSES.includes(k) : k !== "hold"))
    .filter(([, p]) => !phase || p.phase === "any" || p.phase === phase || phase === "closing")
    .map(([k]) => k);
}

/**
 * Open the roll dialog for an actor. `preset` may set purpose and any field.
 * Returns the posted chat message (or null).
 */
export async function rollDialog(actor, preset = {}) {
  const state = getEpisode();
  const isGuardian = actor.type === "guardian";
  const purposes = purposesFor(actor, state);
  const purpose = purposes.includes(preset.purpose) ? preset.purpose : purposes[0];
  const fitsList = isGuardian ? [] : (POWER_FITS[actor.system.power] ?? []);
  const ratings = Object.keys(WW.ratings).filter(k => !(isGuardian && k === "craft"));

  // Defaults per purpose, kept here (not in data- attributes, which dialog content cleaning may drop).
  const table = Object.fromEntries(purposes.map(k => [k, { ...purposeDefaults(k, actor, state), fits: fitsList.includes(k) }]));
  const opt = k => `<option value="${k}" ${k === purpose ? "selected" : ""}>${esc(WW.purposes[k].label)}</option>`;
  const rating = preset.rating ?? table[purpose].rating;
  const difficulty = preset.difficulty ?? table[purpose].difficulty;
  const helpers = (state?.active ? state.covenNames ?? [] : []).filter(c => c.id !== actor.id);
  const potions = [...new Set((state?.potions ?? []).filter(p => p !== "healing"))];

  const content = `<div class="witch-ward ww-roll-dialog">
    <div class="form-group"><label>Roll for</label><select name="purpose">${purposes.map(opt).join("")}</select></div>
    <div class="form-group"><label>Rating</label><select name="rating">${ratings.map(k => `<option value="${k}" ${k === rating ? "selected" : ""}>${esc(WW.ratings[k].label)} (${actor.system[k] ?? 0})</option>`).join("")}</select></div>
    <div class="form-group"><label>Difficulty</label><input type="number" name="difficulty" min="0" max="12" value="${difficulty}"></div>
    ${isGuardian ? "" : `<div class="form-group"><label><input type="checkbox" name="powerFits" ${(preset.powerFits ?? fitsList.includes(purpose)) ? "checked" : ""}> ${esc(WW.powers[actor.system.power]?.label)} fits (+2 dice, casting)</label></div>
    <div class="form-group"><label><input type="checkbox" name="surge" ${preset.surge ? "checked" : ""} ${actor.system.surgeUsed ? "disabled" : ""}> Surge (2 Magic, once a scene): ${esc(WW.powers[actor.system.power]?.surge)}</label></div>
    <div class="form-group"><label><input type="checkbox" name="casting" ${preset.casting ? "checked" : ""}> Casting anyway (another spell)</label></div>`}
    <fieldset><legend>Extra dice (+2 at most together)</legend>
      <label><input type="checkbox" name="life" ${preset.life ? "checked" : ""}> Life fits (+1)</label>
      <label><input type="checkbox" name="book" ${(preset.book ?? purpose === "research") ? "checked" : ""}> The Book (+1)</label>
      <label>Own ${isGuardian ? "Ward" : "Magic"} dice <input type="number" name="ownMagic" min="0" max="2" value="${preset.ownMagic ?? 0}"></label>
      ${helpers.map(h => `<label><input type="checkbox" name="helper-${h.id}"> ${esc(h.name)} helps (1 ${h.guardian ? "Ward" : "Magic"})</label>`).join("")}
      <label><input type="checkbox" name="sense" ${preset.sense ? "checked" : ""}> Sense (+1, outside the limit)</label>
    </fieldset>
    ${!isGuardian && potions.length ? `<div class="form-group"><label>Potion with this attack</label><select name="potion"><option value="">None</option>${potions.map(p => `<option value="${p}">${esc(WW.potions[p].label)}</option>`).join("")}</select></div>` : ""}
    ${isGuardian ? "" : `<div class="form-group"><label>If brewing, brew</label><select name="brewKind">${Object.keys(WW.potions).map(p => `<option value="${p}">${esc(WW.potions[p].label)}</option>`).join("")}</select></div>`}
  </div>`;

  const spec = await DialogV2().prompt({
    window: { title: `${actor.name}: roll` },
    content,
    rejectClose: false,
    // When the purpose changes, update the rating, Difficulty and Power box (if this option is supported).
    render: (event, dialog) => {
      const root = dialog?.element ?? (dialog instanceof HTMLElement ? dialog : null) ?? event?.target?.element;
      const select = root?.querySelector?.("select[name=purpose]");
      select?.addEventListener("change", () => {
        const o = table[select.value];
        if (!o) return;
        const r = root.querySelector("select[name=rating]");
        const dfc = root.querySelector("input[name=difficulty]");
        const pf = root.querySelector("input[name=powerFits]");
        const bk = root.querySelector("input[name=book]");
        if (r) r.value = o.rating;
        if (dfc) dfc.value = o.difficulty;
        if (pf) pf.checked = o.fits;
        if (bk) bk.checked = select.value === "research";
      });
    },
    ok: {
      label: "Roll",
      callback: (event, button) => readRollForm(button.form, helpers),
    },
  });
  if (!spec) return null;
  return performRoll(actor, { ...preset, ...spec });
}

/** Turn the roll dialog's form into a roll spec. */
export function readRollForm(form, helpers = []) {
  const v = n => formValue(form, n);
  return {
    purpose: v("purpose") ?? "other",
    rating: v("rating") ?? "heart",
    difficulty: num(v("difficulty"), 2),
    powerFits: bool(v("powerFits")),
    surge: bool(v("surge")),
    casting: bool(v("casting")),
    life: bool(v("life")),
    book: bool(v("book")),
    ownMagic: num(v("ownMagic"), 0),
    sense: bool(v("sense")),
    potion: v("potion") || null,
    brewKind: v("brewKind") || "healing",
    helperIds: helpers.filter(h => bool(v(`helper-${h.id}`))).map(h => h.id),
  };
}

/** Pick one actor from a list (for Mend). Returns an id or null. */
export async function pickActor(title, actors) {
  if (!actors.length) return null;
  return DialogV2().prompt({
    window: { title },
    content: `<div class="witch-ward"><div class="form-group"><label>Who</label><select name="who">${actors.map(a => `<option value="${a.id}">${esc(a.name)}</option>`).join("")}</select></div></div>`,
    rejectClose: false,
    ok: { label: "OK", callback: (event, button) => formValue(button.form, "who") },
  });
}
