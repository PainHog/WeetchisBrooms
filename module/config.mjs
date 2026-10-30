/**
 * WITCH & WARD — System Configuration
 * ---------------------------------------
 * Static, version-agnostic game data lives here (attributes, tracks, tables …)
 * so data models, sheets, dice code and the pure rules logic can all share it
 * without importing any Foundry API. Pure data only: no `game`, `ui`, `foundry`
 * or DOM, so `module/logic/` and the simulator (`sim/`) can import it under plain
 * Node.
 *
 * Empty on purpose: the game's rules are not written yet. Add data only once the
 * author has approved it in the rulebook (book/src/chapters/), which is the source
 * of truth — this file follows the book, never the other way round.
 */

export const WW = {};

/** The system id (must match system.json "id" and contracts.mjs SYSTEM_ID). */
WW.id = "witch-ward";
