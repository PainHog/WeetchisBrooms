/**
 * WITCH & WARD — Pure Rules Logic
 * -----------------------------------
 * The convention (carried over from Heisty Spideys): every rule the system
 * automates is computed by a Foundry-free function in module/logic/ — no
 * `game`, `ui`, `foundry`, `Hooks`, `CONFIG` or DOM; only plain data in, plain
 * data out, plus static data from ../config.mjs (itself Foundry-free). Sheets,
 * chat cards and GM operations call these functions and only do the Foundry
 * plumbing around them. That keeps the rules unit-testable with `node --test`
 * (no live Foundry needed) and lets the simulator (sim/) reuse the exact same
 * code the table uses.
 *
 * Each function's doc comment cites the rulebook passage it implements. The
 * rulebook (book/src/chapters/) is the source of truth: change the book first,
 * then this file and its tests.
 *
 * Empty on purpose: the game's rules are not written yet.
 */

export {};
