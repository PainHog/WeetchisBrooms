/**
 * WITCH & WARD
 * A tabletop roleplaying game by Richard Moore.
 * Foundry VTT game system — entry point (skeleton).
 *
 * Nothing game-specific lives here yet. As the system grows, this file only
 * wires things up: register data models, document classes, sheets, settings and
 * GM operations in "init", start runtime services in "ready". Rules logic goes
 * in module/logic/ (Foundry-free); shared names go in module/contracts.mjs.
 */

import { WW } from "./config.mjs";
import { SYSTEM_ID } from "./contracts.mjs";

/* -------------------------------------------- */
/*  Init                                        */
/* -------------------------------------------- */

Hooks.once("init", function () {
  console.log("Witch & Ward | Initialising the system.");

  // Static game data, reachable as CONFIG.WW (and from macros/modules via the API below).
  CONFIG.WW = WW;

  // Public API namespace for macros and other modules.
  game.witchWard = Object.assign(game.witchWard ?? {}, { WW, id: SYSTEM_ID });

  // World-migration bookkeeping (version-keyed, GM-only migrations come later).
  game.settings.register(SYSTEM_ID, "systemMigrationVersion", {
    scope: "world", config: false, type: String, default: ""
  });
});

/* -------------------------------------------- */
/*  Ready                                       */
/* -------------------------------------------- */

Hooks.once("ready", function () {
  console.log("Witch & Ward | Ready.");
});
