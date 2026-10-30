# Rules simulator — method

The first simulator for Witch & Ward is built: it plays whole episodes by
`docs/CORE-RULES.md` (v0.2) and writes `sim/REPORT.md`.

```
npm run sim                                   # node sim/run.mjs → sim/REPORT.md (2,000 episodes per cell, seed 1)
node sim/run.mjs --runs 5000 --seed 2         # more runs, another seed
npm test                                      # includes sim/sim.test.mjs
```

The rest of this file is the method that worked on *Heisty Spideys*, which this simulator
follows.

**Why simulate.** On Heisty Spideys the rulebook read as tense and risky, but the
simulator showed that, as written, a party almost could not lose: the dice pools were far
larger than the Difficulties, and the free bonuses stacked. No amount of reading would have
found that. Balance is measured, not guessed: a rule isn’t “done” until it has run here
against the agreed targets.

## 1. An engine that follows the rules text
- One engine plays a whole session (or the game’s natural unit of play) from start to
  finish, **strictly by the rules text** in `book/src/chapters/`. Every rule it implements
  carries a comment citing the chapter and passage.
- It reuses the Foundry system’s pure rules functions (`module/logic/*.mjs`) and static data
  (`module/config.mjs`) wherever they exist, so the simulator, the table and the virtual
  tabletop all run the same code.
- Characters are generated the way the book says players make them (all legal options,
  random but valid), with a validator that rejects an illegal character.
- Decisions players make (what to attempt, who helps, when to spend a resource) are simple,
  sensible, documented **policies**. A policy is never “perfect play”; where a policy matters,
  it becomes a parameter too.
- Abstractions are stated up front (for example: movement not simulated, adjacency assumed
  where the fiction allows it).

## 2. Every judgement call is a named parameter
Whatever the book leaves to the person running the game — or leaves undefined — is a
**named, documented parameter** (`params.mjs`) with:
- a default (the simulator’s best reading of the book),
- the alternative readings,
- a one-line title and a `doc` explaining each value,
- `ref`: the book passage that leaves it open.

The runner re-runs everything once per alternative value of every parameter (a **sweep**),
so the report can say what each judgement call is worth in win rate.

## 3. Generous and strict readings
Two presets bracket the real game:
- **generous** — every ambiguous rule read in the players’ favour;
- **strict** — every ambiguous rule read against them.

The real game lies between. Where a number moves a lot between generous and strict, the rules
are underspecified at that point, and that is a finding in its own right.

## 4. Clarified baseline and packages
- Once the ambiguities are known, pick one reading for each (with the author): the
  **clarified baseline**, written as proposed book text.
- Candidate rule changes are bundled into **packages** (P0 = baseline only, P1, P2, …). Each
  package = the strict reading + the clarified baseline + that package’s own changes, so a
  tested game is never easier than the book allows.
- Compare packages side by side on the same seeds and dice (common random numbers via
  `makeRng(seed, label, run)`), recommend one, and list the exact book changes it needs.

## 5. Balance targets
Agree the targets with the author **before** tuning, and report every package against them in
one table: e.g. win rate per difficulty level, how often things go badly wrong, how often a
character is taken out, how often a total loss happens, the share of rolls that are big
successes and failures, and whether players actually spend their resources. Report numbers,
not impressions.

## 6. Issue detectors
A recorder counts stats and fires **issue detectors** while the engine plays. Each detector
has a kind:
- `gap` — the rules don’t say what happens (the simulator had to choose),
- `broken` — the rules say, and the result looks wrong or degenerate,
- `info` — worth knowing.

Each has a title and the book reference. Typical finds on Heisty Spideys: obstacles stuck
forever because nothing ends a run of failures; rolls that can’t succeed; abilities or
options that never fire (dead content); options that are clearly stronger or weaker than
their peers; resources nobody spends; modifiers stacking past sensible limits.

## 7. Reports
- `run.mjs` → `REPORT.md`: top findings first, then tables (outcomes per scenario under each
  reading, parameter sweeps, detector rates, dead content, outliers). Same seed → same
  report, and the exact command is printed at the top.
- `packages.mjs` → the package comparison (`BALANCE.md`), with the targets row on top.
- `notes.mjs`: the rule gaps found while implementing, and which options are / aren’t modelled.

## 8. When the live rules change: freeze the old version
When the rulebook (and so `module/logic/`) moves to a new rules version, the simulator’s
baseline must still be able to measure the version it was built against. Copy the old
functions into a **frozen file** (e.g. `rules-v0_3.mjs`, with a header saying which version it
is and why it is kept) and point the old baseline at it; the new rules become a package to
compare against it.

## 9. Playtests by agents
The simulator is backed by procedural playtests: an agent plays a session strictly by the
book with **real dice** (a `node -e` random roll script, never invented results, every roll
logged in an appendix), logs every ambiguity with severity, the quoted passage and a
suggested fix, and tries the other defensible reading as a branch. After each fix round, a
verification playtest confirms the fixes at the table.

## 10. Tests
`test/` covers the simulator: determinism (same seed → same result), the engine against
hand-worked examples with fixed dice, the character generator’s legality, and each
package’s rule switches.

## Files
| File | What |
|---|---|
| `rng.mjs` | Seeded RNG (mulberry32 + FNV-1a stream derivation) |
| `params.mjs` | The [T] numbers, the core rules' fixed numbers and rule switches, every judgement call (default, alternatives, doc, the passage that leaves it open), the player policies, and the generous/strict presets |
| `character.mjs` | Legal random covens (Powers off a d6 with duplicates rerolled, 3-2-2-1 ratings) and a validator |
| `engine.mjs` | Plays one episode by the rules text: investigation scenes, the showdown, every ending |
| `grid.mjs` | Runs every label × 3/4/5 players × with and without a guardian player, with common random numbers |
| `recorder.mjs` | Per-cell statistics |
| `notes.mjs` | Rule gaps found while building it, and what is and isn't modelled |
| `run.mjs` | CLI → `REPORT.md` (targets, outcomes, usage, Powers, guardian, exact odds, sweeps, findings) |
| `sim.test.mjs` | The roll against hand-worked cases, exact odds, coven legality, determinism, track limits |

Still to come, as the book grows: one stat block per ready-made threat (`scenarios.mjs`), seasons
(Scars, growth, Book pages, returning threats), packages (`packages.mjs`) and agent playtests
(`playtests/`). The core roll itself lives in `module/logic/rules.mjs`, shared with the Foundry system.
