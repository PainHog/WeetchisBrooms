/**
 * WITCH & WARD — Cross-package contracts.
 * Constants only: no imports, no Foundry globals, no logic. Every name that two
 * parts of the system must agree on (setting keys, chat-card kinds, GM operation
 * names, hook names, flag scopes) is declared here once and imported everywhere.
 */
export const SYSTEM_ID = "witch-ward";
/** Flag scope for documents (flags["witch-ward"]). */
export const FLAG = "witch-ward";
/** CONFIG.queries handler name for GM-authoritative operations. */
export const QUERY = "witch-ward.op";
/** Socket channel (system.json "socket": true). */
export const SOCKET = "system.witch-ward";

/** World/client setting keys. */
export const SETTINGS = Object.freeze({
  episode: "episode",       // world: the running episode's state (module/logic/episode.mjs), written only by a GM
  autoApply: "autoApply",   // world: the GM's client applies roll results to the episode and actors automatically
  migration: "systemMigrationVersion",
});
/** Chat-card kinds (flags["witch-ward"].card.kind). */
export const CARD = Object.freeze({
  roll: "roll",
  threatTurn: "threatTurn",
  gift: "gift",
  potion: "potion",
  unmaking: "unmaking",
  episode: "episode",
});
/** GM-authoritative operation names. */
export const OPS = Object.freeze({
  applyCard: "applyCard",
});
/** Hooks this system fires (other modules may listen). */
export const HOOKS = Object.freeze({
  episodeChanged: "witchWard.episodeChanged",
});
