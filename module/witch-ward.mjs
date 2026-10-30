/**
 * WITCH & WARD
 * A tabletop roleplaying game by Richard Moore.
 * Foundry VTT game system — entry point.
 *
 * This file only wires things up: data models, sheets, settings and hooks in
 * "init", the GM's automation in "ready". Rules logic lives in module/logic/
 * (Foundry-free); shared names live in module/contracts.mjs.
 */

import { WW } from "./config.mjs";
import { SYSTEM_ID, SETTINGS, HOOKS } from "./contracts.mjs";
import { WitchData, GuardianData, ThreatData, PersonData } from "./data.mjs";
import { WitchSheet, GuardianSheet, ThreatSheet, PersonSheet } from "./sheets.mjs";
import { registerCardHooks, performRoll, threatTurn, useGift, drinkHealing, applyCard } from "./cards.mjs";
import { rollDialog } from "./dialogs.mjs";
import { EpisodeTracker, startEpisodeDialog, startEpisode, endScene, goToIt, endRound, finishEpisode, unmaking, callGuardian, adjust } from "./tracker.mjs";
import { getEpisode, setEpisode } from "./store.mjs";
import * as episodeRules from "./logic/episode.mjs";

let tracker = null;
/** Open (or bring up) the Episode Tracker. */
function openTracker() {
  tracker ??= new EpisodeTracker();
  tracker.render(true);
  return tracker;
}

/* -------------------------------------------- */
/*  Init                                        */
/* -------------------------------------------- */

Hooks.once("init", function () {
  console.log("Witch & Ward | Initialising the system.");

  CONFIG.WW = WW;

  // Data models for the three actor types (system.json documentTypes).
  Object.assign(CONFIG.Actor.dataModels, { witch: WitchData, guardian: GuardianData, threat: ThreatData, person: PersonData });

  // Sheets.
  const DSC = foundry.applications.apps.DocumentSheetConfig;
  DSC.registerSheet(Actor, SYSTEM_ID, WitchSheet, { types: ["witch"], makeDefault: true, label: "Witch sheet" });
  DSC.registerSheet(Actor, SYSTEM_ID, GuardianSheet, { types: ["guardian"], makeDefault: true, label: "Guardian sheet" });
  DSC.registerSheet(Actor, SYSTEM_ID, ThreatSheet, { types: ["threat"], makeDefault: true, label: "Threat sheet" });
  DSC.registerSheet(Actor, SYSTEM_ID, PersonSheet, { types: ["person"], makeDefault: true, label: "Person sheet" });

  // Settings.
  game.settings.register(SYSTEM_ID, SETTINGS.migration, { scope: "world", config: false, type: String, default: "" });
  game.settings.register(SYSTEM_ID, SETTINGS.episode, {
    scope: "world", config: false, type: Object, default: { active: false },
    onChange: value => Hooks.callAll(HOOKS.episodeChanged, value),
  });
  game.settings.register(SYSTEM_ID, SETTINGS.autoApply, {
    name: "Apply roll results automatically",
    hint: "The GM's client adds Clues, damage, Exposure, Hurt and potions from each roll card. Turn it off to get an Apply button on each card instead.",
    scope: "world", config: true, type: Boolean, default: true,
  });

  registerCardHooks();

  // Public API for macros and modules.
  game.witchWard = Object.assign(game.witchWard ?? {}, {
    WW, id: SYSTEM_ID,
    rollDialog, performRoll, threatTurn, useGift, drinkHealing, applyCard,
    tracker: openTracker,
    episode: { get: getEpisode, set: setEpisode, start: startEpisode, startDialog: startEpisodeDialog, endScene, goToIt, endRound, finish: finishEpisode, unmaking, callGuardian, adjust },
    rules: episodeRules,
  });
});

/* -------------------------------------------- */
/*  Buttons to open the tracker                 */
/* -------------------------------------------- */

// A button in the token controls (v13 controls are records of tools).
Hooks.on("getSceneControlButtons", controls => {
  try {
    const tokens = controls?.tokens ?? (Array.isArray(controls) ? controls.find(c => c.name === "token") : null);
    if (!tokens) return;
    const tool = { name: "wwTracker", title: "Episode Tracker", icon: "fa-solid fa-hat-wizard", button: true, visible: true, order: 99, onChange: () => openTracker(), onClick: () => openTracker() }; // onClick for older cores
    if (Array.isArray(tokens.tools)) tokens.tools.push(tool);
    else if (tokens.tools) tokens.tools.wwTracker = { ...tool, order: Object.keys(tokens.tools).length };
  } catch (err) { console.warn("Witch & Ward | could not add the tracker button", err); }
});

// A button at the top of the Actors sidebar.
Hooks.on("renderActorDirectory", (app, html) => {
  const root = html instanceof HTMLElement ? html : html?.[0];
  if (!root || root.querySelector?.(".ww-open-tracker")) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "ww-open-tracker";
  btn.textContent = "Episode Tracker";
  btn.addEventListener("click", () => openTracker());
  (root.querySelector?.(".header-actions") ?? root).appendChild(btn);
});

/* -------------------------------------------- */
/*  Ready                                       */
/* -------------------------------------------- */

Hooks.once("ready", function () {
  console.log("Witch & Ward | Ready.");
});
