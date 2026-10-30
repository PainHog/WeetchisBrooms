# Witch & Ward (working title): working rules

Author and designer: **Richard Moore**. Richard's earlier games were reviewed with simulators and agent playtests, and the same mistakes kept turning up. The lessons are written down in this repository. His earlier games are *Heisty Spideys* (v4.8, with a fully automated Foundry VTT system), *Don't Get Forked* (v0.3), *Nine Lives Gang* (v0.8), *Second Nature* (v0.1) and *Nightwake* (v0.1), each with its own Foundry system.

**Read these before any work:**
1. `docs/DESIGN.md`: the pitch, name check, early flags, decisions and open questions.
2. `docs/DESIGN-RULES.md`: Part A hard rules, Part B questions the core rules must answer, Part C process, Part D release gates. **They are this project's rules.**
3. `book/art/ART-CHECKLIST.md`: before any art.
4. `docs/REVIEW-PROCEDURE.md`: after every version.

## Keep Richard's other games separate
- Richard's other games are separate products: *Heisty Spideys* (SpideyHeist), *Don't Get Forked* (DontGetForked), *Nine Lives Gang* (KittenJob), *Cat Burglars* (CBZ), *Nightwake* (EF), *Second Nature* (Animahs) and *Don't Get Gobble Gobbled* (GobblinGlobbin), and the other projects in development.
- If one is ever attached to a session, it is **read-only reference**: never edit, commit to, push to, branch or release from it.
- Copy anything useful into this repository (with a note of where it came from) and adapt the copy. Never import from or link to their files.
- If another game seems to need a change, stop and tell Richard.

## Stay clear of the show
This game is built on the concept of the original *Charmed* TV show, and Richard's pitch rules out any of its material.
- **Never use the show's names, terms or designs** in the book, the Foundry system, file names or the code. The list is in `docs/DESIGN.md` §2: "Charmed" itself, Charmed Ones, the Power of Three, whitelighter, darklighter, orbing, the Elders, the Source, the manor and family names, the characters, the triquetra-marked spellbook, the house, the logo, the theme song and the spell rhymes.
- **Give every concept the game's own word,** keep it in the glossary, and check each new term against that list and against Richard's other games.
- **If an idea leans on something distinctive from the show,** say so and offer an alternative.

## Richard's standing rules (2026-10-30)
- **No tool labels or credits anywhere.** Never name, label or credit the assistant or software that helped make the game: not in the game, the book, the Foundry system, the code, the docs, commit messages or commit trailers. Richard rewrites everything himself, so there is no credit or disclosure line.
- **Plain English.** Short, simple words and sentences. Don't dress things up.
- **Pick the recommended option.** For every design decision, work out two or three options, choose the recommended one, and record it in the `docs/DESIGN.md` Decisions log with the date and a line on what else was considered. Don't stop to ask.
- **Only contact Richard for** serious questions, approvals (such as approving the core rules), or when a piece of work is done.
- **The game must feel as full as the show's concept:** threats, spells, potions, fighting, investigating, keeping magic secret, and everyday life, with real choices for the players in each.

## The author decides the game
- **Richard owns every decision.** Under his standing rules above, decisions are made by picking the recommended option and logging it; Richard can overrule any logged decision at any time. That covers rules, numbers, witches, the guardian, powers, spells and potions, demons and other threats, innocents, episodes, setting text and the names of mechanics.
- **When one of Richard's ideas would repeat a mistake from `docs/DESIGN-RULES.md` Part A,** say so straight away, name the rule, and offer options.
- **Wording clarifications and fixes** for things the book already implies may be made directly. Anything that changes numbers or adds rules goes to Richard first.
- **When Richard gives feedback on art or layout,** fix it and audit the whole book for the same kind of mistake.

## Order of work (DESIGN-RULES Part C)
1. **Design interview** through every Part B question.
2. **One-page core rules** in `docs/CORE-RULES.md`.
3. **Simulator** in `sim/`: episode win and loss rates by difficulty and group size, with and without a guardian player; demon-fight length; how often witches are taken out; spell and resource use; and balance between powers, and between the guardian and another witch.
4. **Richard approves the core.**
5. **Then** chapters, then art, then layout. No chapters or art before step 4.

After every version, run `docs/REVIEW-PROCEDURE.md`. A version isn't done until it passes the DESIGN-RULES Part D release gates.

## Source of truth
- **The rulebook source is the rules:** `book/src/chapters/*.html`, and `docs/CORE-RULES.md` until chapters exist.
- **Everything else follows the book in the same piece of work:** the simulator, the Foundry system, the quick reference and the sheets.
- **Each rule is stated fully in one place.** After every change, check the quick reference, sheets and trackers against the chapters.
- **Log every ruling** in `book/REVIEW.md`: what changed, where, why, and the source (author, playtest or simulator).

## Quality bars
- **Balance is simulated, not guessed.** Report numbers: win **and** loss rates, per difficulty and party size.
- **Playtests are run by agents strictly by the book, with real dice.** Rolls come from a script and are logged, never invented.
- **Art** passes `book/art/ART-CHECKLIST.md`, including the object and character tables. Look at every render yourself.
- **Layout:** after every build, render a contact sheet and look at every page. Check reflow after every edit.
- **Foundry, if built, is automation-first.** Rules logic lives in Foundry-free modules (`module/logic/`), tested with `node --test`. GM-authoritative writes. Every automation can be switched off.
- **When this repository's name is known,** check that the GitHub URLs in `system.json` match it.

## Housekeeping
- Commit and push work in progress often; sessions and agents can stop at any time (usage limits). Resume stopped agents rather than restarting the work.
- No tool labels or credits in commits, code or docs, and no commit trailers (see Richard's standing rules).
- **Credits:** "Game design & writing: Richard Moore".
