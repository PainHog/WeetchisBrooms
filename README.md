# Witch & Ward (working title)

A tabletop roleplaying game about a group of witches, by **Richard Moore**. It takes the concept of the original *Charmed* TV show and makes a new game of it, without any of the show's own material. The players are a group of witches, more than three if they like, and one player can play the group's guardian; demons and other ideas may come in later.

**Status:** v0.9 for testing. The core rules are approved (`docs/CORE-RULES.md`), the simulator has balanced them (`sim/REPORT.md`), the rulebook is being written in `book/`, and the Foundry VTT system is ready to test.

## What's in here
| Folder | What it is |
|---|---|
| `docs/` | `DESIGN.md` (pitch, name check, early flags, decisions, open questions), `DESIGN-RULES.md` (lessons from earlier games), `REVIEW-PROCEDURE.md`, the kickoff prompt, and reference studies |
| `book/` | The rulebook: HTML chapters built into a typeset PDF (digital and print-on-demand), and `book/art/ART-CHECKLIST.md` |
| `sim/` | The rules simulator for balance testing (`npm run sim` writes `sim/REPORT.md`) |
| `module/`, `templates/`, `styles/`, `lang/`, `packs/` | The Foundry VTT game system (Foundry v13) |
| `tools/`, `test/` | Build, validation and test tooling |

## Commands
```
npm install
npm run build:book          # rulebook PDF → book/dist/
node book/build.mjs --print # print-on-demand interior + covers
npm run check               # validate the Foundry system + run tests
```

## Testing the Foundry system
**Install.** Either:
- **From a release:** on GitHub, open Actions → Release → Run workflow, enter `0.9.0`. When it finishes, in Foundry's Setup screen choose Game Systems → Install System and paste the manifest URL `https://github.com/PainHog/WeetchisBrooms/releases/latest/download/system.json`.
- **By hand:** download the repository as a zip, unzip it into Foundry's `Data/systems/` folder and rename the folder to `witch-ward` (the folder name must match the system id).

**Play an episode.** Make a world with the Witch & Ward system. Open the compendium **Adventures (ready-made episodes)** and import one of the book's three episodes: **Episode 1: Night Market** (Easy, the best first game), **Episode 2: Cinders** (Standard) or **Episode 3: Low Tide** (Hard). Each brings the coven, Rook, the threat and the episode's people, four scenes with maps and tokens (Larkhaven, the Lantern House, and the episode's public and hidden showdown places), the full episode journal, its Life calls table, and two macros (Episode 1 also has the episode generator tables). Open the journal *<episode>: run this episode* and follow it: give each player a witch, run the macro **Start <episode>**, and play. Players roll from their sheets; the GM's client applies each roll card (Clues, damage, Exposure, Hurt, potions). This can be switched off in the system settings.

**Maps and tokens are test art** (hand-built, made by the scripts in `tools/vtt-art/`); the game's art direction isn't decided yet. To rebuild the adventures after changing an episode in the book: `node tools/make-adventure.mjs` then `npm run build:packs`.

© 2026 Richard Moore. All rights reserved.
