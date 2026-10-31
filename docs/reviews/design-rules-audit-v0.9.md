# Design-rules audit: Witch & Ward v0.9 (test edition)

**Date:** 2026-10-30. **What this is:** a fresh reader's check of the v0.9 rulebook against `docs/DESIGN-RULES.md` (Part A hard rules, Part B core questions, Part D release gates), plus the options audit from `docs/REVIEW-PROCEDURE.md` §1. It reports; it fixes nothing. Every suggested fix is for Richard to decide.

**Read:** `docs/DESIGN-RULES.md`, every chapter in `book/src/chapters/` (the rules), the sheets and quick reference (`40-sheets.html`), `sim/REPORT.md`, `sim/REPORT-threats.md`, `book/REVIEW.md` (rulings 1–105), `docs/DESIGN.md`, `docs/GLOSSARY.md`, `docs/CORE-RULES.md`, both book playtests (`sim/playtests/book-test-a-night-market.md`, `book-test-b-low-tide.md`) and the open-issue lists of the five earlier playtests. The built PDFs in `book/dist/` were checked for fonts, text size and contents page.

**State of the repository while auditing.** Other work was landing at the same time. The audit is of HEAD `7248d15` ("Print maps: labels without stroked text…"). The working tree also had uncommitted edits to the six map SVGs and `tools/vtt-art/maps.mjs`; those were not treated as final. PDF build times: digital copy 20:11; print interior, printer-friendly copy and covers 20:07.

**Severity** (REVIEW-PROCEDURE): **blocker** = opposite answers that change the result; **confusing** = a table must stop and invent a ruling; **minor** = wording or a rare gap.

---

## Summary

| Check | Result |
|---|---|
| **Part B** (32 questions, split from the 12 headings) | **24 answered, 7 partly, 1 not answered.** By heading: 7 answered, 5 partly, 0 not answered. |
| **Part A** (29 rules) | **14 pass, 15 fail.** 6 of the fails are wording or sheet fixes; 9 need a design decision, a number change or a process step. |
| **Part D** (8 gates) | **0 pass. 6 fail, 2 not yet.** |

**The ten things that matter most**
1. **No playtest of the current text exists.** Rulings 88–104 changed the book after both book playtests, and both of those needed invented rulings on core flow (B also had a blocker). Gate 4 can't pass until two new book playtests run clean.
2. **Balance misses the project's own targets** (DESIGN Q16): Easy wins 85% (target ~90%), 5 of 18 cells more than 5 points off, Criticals 13–14% (target 15–25%), Easy showdowns 2 rounds (target 3–5), Ward 40% spent at Easy and Hard (target ≥50%), potions 46/61/69% used (target ≥70%).
3. **All six signature moves are "dead"** by the simulator's own flag (within ±2 points of a plain attack), and Borrowed Face is dominated by a plain attack. No decision accepting this is logged in DESIGN.md.
4. **Going to the threat before Doom 4 without the Weakness is a dominated choice** (simulator "asap": 16% wins at Standard, 6% at Hard), but Chapter 6 offers it as an option with no warning.
5. **Shelter can't protect the innocent** (taking isn't an attack), yet Chapter 5's example says "A ring of salt round the innocent is Shelter". Shelter is also never cast by the simulator, so the "no dead or dominated options" gate can't be checked for it.
6. **Doom's full state never ends an episode** (0.0% in 36,000 runs), and at Easy the Showdown mark binds in only 1% of episodes (A22).
7. **The episode generator has never been validated** (A26; DESIGN Q14 promised 100 generated episodes).
8. **First night setup measured 32 minutes** in book test A, over the 30-minute rule (A27).
9. **Map labels print at 4.1–6.6 pt** (PDF pages 58, 63, 68), under the 7.5 pt layout rule; the print interior and printer-friendly PDFs still hold 22 Type 3 fonts.
10. **Several "there is none" and order gaps are still open from earlier tests:** two guards on one innocent, an attack with nobody standing, Borrowed Face with no standing witch, Drain below 2 damage, Carry on a witch, Seen making later casting costs in a scene free.

---

## 1. Part B: questions the core rules must answer

"One place" says whether the rule is stated fully once (A11): **yes**, **split** (parts in different chapters, each pointing to the other), or **drift** (repeated somewhere with different words).

| # | Question | Where the book answers it | Quote | Status | One place? |
|---|---|---|---|---|---|
| B1.1 | Dice, success, partial and failure bands, critical | Ch 2, Rolling; Reading the roll | "Each 4, 5 or 6 is a success." "Partial: at least half the Difficulty (round up), but less than all of it." "Critical: a Success that shows two or more 6s." | **Answered** | Yes |
| B1.2 | Bonus cap from all sources | Ch 2, Extra dice (table of every source) | "On top of your Power, you can add at most +2 dice from everything else together" | **Answered** | Yes |
| B1.3 | Opposed rolls: are there any, and how do modifiers apply? | Nowhere stated. Implied by Ch 2 ("The Storyteller sets the Difficulty") and Ch 12 | "Dice are never compared, so one colour is fine." | **Partly**: the answer (none) is only implied | — |
| B2.1 | Group checks | Ch 2, Group checks; quick reference | "Everyone rolls. It isn't an action… There is only one cost, and whoever rolled worst takes it." | **Partly**: doesn't say what a group Success or Failure *does* (does the group succeed if one fails? does each result apply to each roller?), what "worst" means on a tie, or whether Powers and helpers apply | Yes |
| B2.2 | Helping: who, how many, what it costs | Ch 2, Helpers | "To help, spend 1 Magic (the guardian spends 1 Ward) and add 1 die to someone else's roll… Helping takes no action" | **Answered** | Yes |
| B2.3 | What one roll covers | Ch 5, Researching the Book; Ch 9, Costs | "Each roll has its own result and its own cost." "Never add a second cost." | **Partly**: per case, no general statement; unclear for group checks | Split |
| B3.1 | What a turn, round and scene are | Ch 6, Scenes; Ch 7, Rounds | "In each scene, every character takes one action, in any order. At the end of the scene, Doom rises by 1." | **Partly**: scene and round are defined; "turn" is used but never defined ("on any character's turn", Ch 4, Ch 12, Ch 13) | Yes |
| B3.2 | What one action is | Ch 6, action table; Ch 7, Actions | "Some things take no action: helping a roll, using a potion, the guardian's Shield, Sight's miss Surge, and a Down witch joining the Unmaking." | **Answered** | Yes |
| B3.3 | Does movement cost the action? | Not answered. The nearest is Ch 4's Shield line | "In a showdown, everyone is near." | **Not answered**: the maps show rooms and ways in, but no line says moving is free or that position never matters; "near" is undefined outside a showdown (it matters for potions) | — |
| B4.1 | Every track and every state | Ch 3, Hurt and Down; Ch 6, Clues, Doom, Exposure and Seen; Ch 7, Broken | "Hurt can't go past full." "Nothing lowers it [Doom]." "Exposure stays full… Any further rise becomes Doom +1 instead (once per round or scene)" | **Answered** (minor gap: Drain lowers Toughness with no stated floor; see A13) | Split, with pointers |
| B4.2 | One event, one trigger | Ch 7, Public showdowns; Ch 2, Group checks; Ch 9, Costs | "every round in which anyone was casting raises Exposure by 1, once per round" | **Answered** | Split |
| B4.3 | What raises it, lowers it, what happens at the top | Ch 6, Doom; Exposure and Seen | "It rises… It falls when someone casts Hide… never below 0." "Full (12): the plan is complete." | **Answered** | Yes |
| B5.1 | How resources are earned and spent | Ch 3, Magic (table); Ch 4, Ratings, Hurt and Ward; Ch 5, Potions; Ch 5 and 8, Book pages | "Spend Magic like this: … Cast a spell 1 · Surge your Power 2 · Help 1 · Add a die 1 · Lead or join the Unmaking 1" | **Answered** | Yes |
| B5.2 | Whether any resource is ever free or dominated | Ch 3 advice; the simulator | "Unspent Magic is lost at the end of the episode, so spend it." | **Partly**: see A5–A7 (free costs after Seen; Ward and potions under target) | — |
| B6.1 | Creation steps | Ch 3, Making a witch; Ch 4 for the guardian | "Making a witch takes five steps and about ten minutes." | **Answered** | Yes |
| B6.2 | Random tables for every step, with duplicate rerolls | Ch 3, steps 1 and 3 only | Step 4: "Ties have no rules." Step 5: "Choose a name and pronouns." | **Partly**: only Power and Life have d6 tables (ruling 69 leaves the rest open); ratings are assigned, not rolled | Yes |
| B6.3 | Starting resources that don't swing | Ch 3; Ch 4 | "Every witch has 4 Hurt boxes, all empty, and starts each episode with 5 Magic." | **Answered** | Yes |
| B6.4 | What a replacement inherits | Ch 8, New and replacement witches | "A new or replacement witch joins at the same growth as the coven's lowest witch… They bring no Scars." | **Partly**: between episodes only; a witch who joins or leaves *mid-episode* (Magic, Life call, potion cap) isn't covered beyond "the numbers don't change" | Yes |
| B7.1 | NPC and threat stats or procedures | Ch 6 numbers table; Ch 7, The threat's turn (d6 table); Ch 10 stat blocks; Ch 9, The innocent | "A threat has no numbers of its own." "Other people the coven meets don't need stats. Talking to them is a lead…" | **Answered** | Split (Ch 7 full, Ch 9 and 10 repeat consistently) |
| B7.2 | How threats detect, attack, are beaten or driven off | Ch 7, The threat's turn; Defending; Broken; The Unmaking | "When the threat's Toughness is full, it is Broken… At the end of the next round it flees, unless the coven unmakes it first." | **Answered** | Yes |
| B7.3 | When threats are "active" | Ch 9, Framing scenes | "Before the showdown the threat has no attacks. It shows itself through Doom and through costs." | **Answered** | Yes |
| B8.1 | The prize (the innocent): carrying, passing, dropping | Ch 7, The innocent; Ch 4, Carry | "While they are, nobody can guard or carry them." "Once they're free, if the threat takes them, they're lost." | **Answered** (sizes and passing don't apply) | Yes (Ch 9 repeats) |
| B8.2 | What "partial" means | Ch 7, How it ends | "Partial: The threat fled, or it was destroyed but the innocent was lost." | **Answered** (see A4 on "fled and lost" scoring the same as "fled and safe") | Yes |
| B8.3 | What capture does to it | Ch 7, The innocent; How it ends | "In each case, an innocent already carried to safety isn't lost, but the result is still a Loss." | **Answered** | Yes |
| B9.1 | Out (Down) and how a character comes back | Ch 3, Down; Ch 4, When the guardian goes Down | "You are back up as soon as your Hurt drops below full." | **Answered** | Split |
| B9.2 | What everyone-down means | Ch 7, How it ends; Ch 6 | "every witch is Down at the end of a showdown round (a standing guardian doesn't count)" | **Answered** | Yes |
| B9.3 | Can you give up? | Ch 7, Retreat | "At the start of any round, the coven may retreat… it is a Loss… Nobody gets a Scar for a retreat" | **Answered** | Yes |
| B10.1 | Every way a session ends, literal at first and last moment | Ch 7, How it ends | "The episode ends at once, and the rest of the round doesn't happen, when: …" | **Answered** | Yes |
| B10.2 | Result tiers | Ch 7, results table; Seen | "If the coven is Seen, the result drops one step" | **Answered** | Yes |
| B10.3 | Rewards and campaign carry-over | Ch 8, table "What carries over" | Scars, growth, Book pages, returning threats, stronger threats | **Answered** | Yes |
| B11 | Party size 3, 4 and 5, with explicit adjustments | Ch 6 table (w, n); Ch 7, The threat's attacks; Ch 9 lookup table | "It makes 1 attack a round against 3 characters, and 2 against 4 or 5." | **Answered** | Split (Ch 9 gathers every size in one table) |
| B12 | Simulator targets | `docs/DESIGN.md` Q16; `sim/REPORT.md` §1; quoted in Ch 9 | "Here is what each label feels like, from 36,000 simulated episodes." | **Answered** (the targets are set and measured; several are missed, see A19) | Yes |

**Tally:** 24 answered, 7 partly (B1.3, B2.1, B2.3, B3.1, B5.2, B6.2, B6.4), 1 not answered (B3.3).

---

## 2. Part A: hard rules, pass or fail

"Changes" says what a fix touches: **wording** (something the book already implies), **rule**, **number**, **sheet**, or **process**.

| Rule | Result | Evidence | Suggested fix | Changes |
|---|---|---|---|---|
| **A1** Every state of every track | **Pass** | Hurt (Ch 3: can't pass full, clears by rest, potion, Mend), Doom (Ch 6: 12 boxes, mark 5, nothing lowers it, stops when Broken), Exposure and Seen (Ch 6), Clues ("past the total are lost"), Toughness ("damage past its Toughness is lost"), Magic ("no top limit"). Two tracks full: "every witch is Down" checked before a Broken threat flees (Ch 7). Numbers fixed for the episode (Ch 6). | Minor: say Drain never takes damage below 0 (see A13). | Wording |
| **A2** No feedback spirals; one event, one rise | **Pass** | Public Exposure "once per round"; Seen's Doom "once per round or scene"; group check "only one cost"; Ch 9 "Never add a second cost". Hurt never removes dice. | — | — |
| **A3** No good result undoes the threat cheaply | **Pass** | Doom can't be lowered. Exposure falls only through Hide (1 Magic, an action, a roll); a Critical adds −1 (13% of rolls). Note: Hide + Voice Surge + Critical took Exposure 3 → 0 in one action for 3 Magic (book test B, D13); Seen is at the bottom of its band (5% Standard), so watch Voice. | None needed now. | — |
| **A4** Losing costs at every stage; never better than fighting on | **Fail** (design call) | Ch 7: "Partial: The threat fled, or it was destroyed but the innocent was lost." Once the threat flees, losing the innocent costs nothing in the result (book test A, M10, sent to Richard, no ruling logged). And once a coven is Seen with the innocent lost, every result is a Loss, so in a one-off episode retreating (no Scars) beats fighting on. | Either log a decision that the innocent's fate is story once the threat escapes, or make "fled, and the innocent lost" a Loss. Simulate first. | Rule (results table) |
| **A5** No spend is ever free | **Fail** (minor) | Ch 6: once Seen, "Any further rise becomes Doom +1 instead (once per round or scene)". Before Seen, every casting cost in the city adds 1 Exposure; after Seen only the first in a scene costs anything, so later casting costs that scene are free (carried since verify-v0.6 as N9). (Public rounds after the first cast are free by design, under A2; the book teaches it: "Bunch your casting into the same rounds".) | Out in the city, make each casting cost after Seen its own Doom +1 (the once-per-scene cap isn't needed by A2, since each city roll is its own event). Or log the current reading as a decision. | Rule |
| **A6** No dominated option | **Fail** | (1) Going to the threat before Doom 4 without the Weakness: REPORT §10 "players: go asap" 16% / 59% (Standard win / loss), 6% / 84% (Hard), against 74% / 7% for the default; REPORT §12: "Before Doom 4 there's no reason to go without the Weakness". Ch 6 still offers it: "You can also go earlier, at the end of any scene, once you have half the Clues." (2) Borrowed Face is dominated by a plain attack (REPORT-threats §7). | (1) Tell players plainly in Ch 6 that going before Doom 4 without the Weakness gains nothing (waiting is free until then), or give going early a real reward and simulate it. (2) The tested candidate: "attack the witch with the most Magic left, with Hit 1 higher; on a Failure they also lose 1 Magic" (REPORT-threats §8). | (1) Wording, or rule. (2) Rule (threat move) |
| **A7** Resources must get spent | **Fail** | REPORT §1/§5: median guardian spends 40% of Ward at Easy and Hard (target ≥50%); potions used 46% / 61% / 69% (target ≥70%). Magic passes (83%). The book does tell players to spend Ward and potions (Ch 4 "Spend your Ward"; Ch 7 "Use your potions"), but Ch 4 also says "don't spend all your Ward on Sense". Binding potions are often wasted by the one-lost-attack cap (book test B: both spoiled). | Ward: let a Down guardian still help with Ward from the house (book test B issue 19), or retune the simulator's guardian policy and re-measure. Potions: accept that Easy fights end before potions matter, or make a wasted Binding potion do something (e.g. +1 damage). Simulate either. | Rule, or simulator policy |
| **A8** Nothing skips a roll for free | **Pass** | Shelter, Sight's miss, Carry, Bind and Binding all cost Magic or Ward, an action or a roll. Shelter on the guardian with Hold and Shield is closed by ruling 99. The no-guardian call (Mend or Carry, no action, no roll) is free in a hidden place, but limited to once an episode. | Simulate Shelter (see the options audit): it is the one roll-skipper never measured. | Process |
| **A9** Every option matters in the shipped scenarios | **Fail** | REPORT-threats §7: "dead moves, the yardstick included, 7; moves dominated by a plain attack 1"; Hush's rider is dead too. In Episode 1 (Easy), the public fight happens in 1% of episodes and Seen in 0%, so Hide (0.01 uses an episode), Healing potions (0.05 used of 0.98 brewed), rest (0.01), study (0.00), guarding (0.01) and Force's "freeing" fit almost never matter; book test A: "Keeping magic secret: not in the episode." Hold is near-dead at Standard and Hard (0.10 / 0.14 uses). Force, Flame, Veil and Wild Surges are used 0.00–0.10 times an episode by the simulated players. | Moves: log a decision that moves are flavour (REPORT-threats already argues it), or make them come up more and retune the labels. Easy: accept and say so in Ch 12 (Easy teaches the roll, not secrecy), or add a scripted public moment to Night Market. Surges and Hold: check whether the simulator's "keep 2 Magic" policy, not the rules, is starving them before changing anything. | Decision log; or rule and numbers |
| **A10** Limits per character or group, stated outright | **Fail** (minor) | Per-character and per-group limits are clear (Surge once a scene per witch; Shield once a round; Sense once a scene; potions one a round or scene per character; the call once an episode per coven; showdown = one scene). Missing: what a witch who joins or leaves *mid-episode* has (Magic, Life call, potion cap); "on any character's turn" for the call, when "turn" is undefined. | One line in Ch 8: a mid-episode newcomer starts with 5 Magic, no Hurt and an unanswered Life call; the numbers and potion cap don't change. Replace "on any character's turn" with "during the characters' part of a round, or in a scene". | Wording (small new rule for mid-episode joins) |
| **A11** One source of truth per rule | **Fail** (minor) | Drifts found: (a) Ch 6 "A lead is any action that can find Clues" against Ch 4 "Sense: only on a lead in the investigation, never on studying the threat" (studying finds Clues). (b) Ch 9's label figures are from before ruling 105: "About 59% Wins and 23% Losses… (61%)", "(39%)", "to 79%", against REPORT 60% / 22%, 60%, 38%, 80%. (c) Tracker: "Full: the innocent is lost and the threat escapes" drops "(unless already carried to safety)" (ruling 101). (d) Quick reference, The Unmaking, drops "and so does a witch who lost their action to Lure" (ruling 100). (e) Ch 13 shortens Noor's and Tess's Surges: no "goes with Bind… after the Bind roll", no "goes with Hide", no "whole coven's casting". (f) Ch 9 pacing still counts the opening twice (book test A M8, unfixed). (g) `sim/REPORT.md` §13 says "Seasons are not simulated" while §11 reports seasons. | Fix each line to match its chapter of record; point Ch 13's Surges to Ch 3 instead of restating them; regenerate Ch 9's figures from REPORT.md. | Wording, sheet |
| **A12** Read every rule literally at start and end | **Pass** | No end condition is true at the start (Doom 0; "every witch is Down" only at the end of a showdown round). The round the threat is destroyed ends at once with no Exposure step (Ch 7). Round 1's innocent check is after the characters act. | — | — |
| **A13** Every "nearest / other / empty" handles "there is none" | **Fail** (minor) | Open: (a) an attack when nobody is standing (4–5 "whoever has the most Hurt marked and is still standing"; carried since v0.7 as N16); (b) two guards on one innocent ("it attacks you instead", carried as N3); (c) Borrowed Face with no standing witch, or with 0 Magic, or under Shield; (d) Drain when the threat has 0 or 1 damage; (e) "two different characters" (generic move, Hush) when only one is standing. | One sentence each: an attack with no standing target is lost; with two guards, roll a die between them; Borrowed Face with no standing witch attacks like a 4–5, takes nothing from 0 Magic, and under Shield costs the guardian 1 Ward; Drain never goes below 0; a second attack with no second target is lost. | Wording |
| **A14** Nothing consumable runs out without a rule | **Pass** | Potions (cap, spoil, extras lost), Magic and Ward (reset each episode; Life call takes 1 Hurt at 0 Magic), leads ("A lead can be followed again"), Powers and Lives (6 entries, at most 5 witches), the call (once). | — | — |
| **A15** Order of resolution is stated | **Pass** | Covered: Shield before Sight's Surge; Hold and a 6 (and with a guarded or unguarded innocent); potions only in the characters' part of the round; Lure's lost action this round or next; "every witch Down" before a Broken threat flees; Veil covers its own roll; Wild's −1 starts after the Bind roll; the mark checked only at the end of a scene. Minor open: does Drain heal when the guardian Shields the attack? | One line under Drain. | Wording |
| **A16** Terms have one meaning each | **Fail** (minor) | "Partial" is both a roll result (Ch 2) and an episode result (Ch 7); the glossary lists only the roll. "Lead" has two scopes (A11a). "Turn" is used for characters but never defined; ruling 94 removed it from potions but not from the call. | Rename one Partial (e.g. call the episode result a "close call", or "Partial win"), and add it to the glossary. Define "turn" or drop it. | Wording |
| **A17** Examples are rules-checked and teach good play | **Fail** (minor) | Every number in every example checks out (Ch 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 re-done by hand; Ch 7's 86% / 36% Unmaking odds are exact). But: (a) Ch 2's group-check example is "wading out before the tide covers the drowned village", and Ch 16 says of that water: "The water is story only: it needs no roll." (b) Ch 9's threat's-turn example has Rook *guarding* a freed Hannah instead of Carrying her, the weaker play Ch 4 warns against ("Carry the freed innocent out. Once they are gone, the threat can't take them."). (c) Ch 5's "A ring of salt round the innocent is Shelter" teaches a spell that does nothing (see options audit). | (a) Move the group check to a place with no "no roll" line. (b) Have Rook Carry Hannah, or say why it guards. (c) Change the example (e.g. "a ring of salt round Dana is Shelter"). | Wording |
| **A18** Say the true cost | **Pass** | Seen ("Being Seen is costly. A Win becomes a Partial…"), Down ("Down has a real cost"), retreat ("It never turns a bad fight into anything better than a Loss"), the guardian ("That is the guardian's true cost"), a failed Unmaking in public ("in a public place it counts as casting"), Low Tide ("expect witches to go Down"). | — | — |
| **A19** Simulate; targets | **Fail** | REPORT §1: Easy wins 85% (target ~90%; Partials 14–20% are threats that fled); Hard 60.2% (band 55–60%); Criticals 13% / 14% / 13% (target 15–25%); Easy showdown median 2 rounds (target 3–5). Losses are reported and real at Hard (22%). Failures 13–17% (Q16 band 10–20%). The default Critical die isn't modelled (REPORT §13). | Easy: lower the Unmaking Difficulty at Easy by 1, or let a Broken threat stay one round longer at Easy; or log a new Easy target of 85%. Criticals: accept and amend the target, or widen the Critical (e.g. any roll of 5+ dice with one 6 and a Success); simulate. Model the Critical die before deciding. | Number or rule; or decision log |
| **A20** Labels come from simulated results | **Pass** | Ch 9 quotes the simulator for every label ("About 85% of Easy episodes end in a Win… almost none end in a Loss"). Each episode was re-run with its own move (REPORT-threats §1). The figures are slightly stale (A11b). | — | — |
| **A21** Test 3, 4 and 5 players | **Fail** | Every size is simulated and the adjustments are explicit (Ch 6, Ch 7, Ch 9 lookup). But 5 of 18 cells miss DESIGN Q16's "within 5 points": Easy 4 players 83%, 5 players 80%, 5 with guardian 84% (target 90); Standard 5 players 67% (target 75); Hard 5 with guardian 63% (target 57.5). Big covens do worst at Easy and Standard. No report says which role a small group can't do without (book test A noticed only Dana frees well). | Simulate a lower Unmaking Difficulty (or fewer Clues) for 5-witch covens; add a "roles" line to REPORT.md (e.g. win rate with no Nerve-3 witch). | Number; process |
| **A22** Every clock must bind | **Fail** (Easy) | The Showdown mark forces a public fight in 1% / 21% / 34% of episodes (REPORT §3): it binds at Standard and Hard, not at Easy. Doom filling ended **0%** of episodes in every cell (REPORT §2), so the 12-box limit never ends a session. | Accept Doom 12 as a backstop and log it; or shorten Doom, or move Easy's mark to 4, and re-simulate. | Number, or decision log |
| **A23** Partial wins must be partial | **Pass** | A Partial needs the threat to flee or the innocent to be lost; Seen drops a step. | (See A4 for the reverse case.) | — |
| **A24** Watch long events | **Pass** | Showdowns: most 8 rounds (REPORT §1); Doom clocks every fight, and a Broken threat flees after the next round. | — | — |
| **A25** Every ready-made scenario has the essentials | **Pass** | Six maps (temporary art) whose labels match their location lists room by room (checked label by label); every place has 3–4 ways in and out and nothing closes them; "Nothing here needs a roll to get past"; every lead has its roll and Difficulty; the threat runs by its d6 table, other people "don't need stats"; retreat needs no roll; each episode has talking, searching, Book and Reveal leads. Note: DESIGN Q14 promised a map of the Lantern House; there isn't one (no scene happens there, so A25 doesn't require it). | — | — |
| **A26** Generators are tables, validated | **Fail** | Ch 11's generator is d6 tables, but no record of 50–100 generated episodes exists (DESIGN Q14 promised 100). The book says "Any result works with any other", untested: e.g. twist 4 "The threat was once a witch" with Vesper Crane (still a witch). REVIEW-PROCEDURE Test A asks for a generated episode to be played; neither book test played one. | Generate 100 episodes, check each, mark any banned pairs in the tables. | Process (maybe table text) |
| **A27** First night under 30 minutes | **Fail** | Book test A: "Total 25 [book] / 32 [table]… 2 over the 30-minute target." Causes: reading six sheets, and crossing out 33 damage boxes and 11 Clue boxes on the tracker. Everything else is there: print list, dice ("Dice are never compared"), tie-break, players don't see the episode, pre-made witches. | Print the six ready-made witches and Rook as filled-in sheets in the book; give the tracker rows for each group size (or a 3-player tracker) so nothing needs crossing out. Re-time. | Sheet |
| **A28** Sheets fit the biggest case | **Pass** | Damage boxes 45, Clues 20 (the most needed), Exposure 5, Doom 12, rounds 12, Magic 9 pips; boxes for Hush/Lure, Critical die, Surge, potion, Life, Scar, Shield, Sense, Hold, Shelter, guard, Wild, Veil. Edge: a 5-witch Hard threat from episode 5 that has escaped three times needs 46 boxes; no box for "acted this round" (needed to join the Unmaking); the tracker's Veil box covers only the showdown, not the city. | Optional: 50 damage boxes; an "acted" tick per character. | Sheet |
| **A29** The Storyteller's load fits one card | **Pass** | Ch 9's "The Storyteller's round" box has five steps; the quick reference holds every showdown rule (book test A taught the fight from it in 8 minutes). | — | — |

**Tally: 14 pass, 15 fail.** Fails needing a decision, numbers or process: A4, A6, A7, A9, A19, A21, A22, A26, A27. Wording or sheet fixes: A5, A10, A11, A13, A16, A17 (A5 can also be logged as a decision).

---

## 3. Part D: release gates

| Gate | Status | Evidence | What's needed to pass |
|---|---|---|---|
| 1. Every Part B question is answered in the text, in one place | **Fail** | 24 / 7 / 1 (section 1). Not answered: movement. Partly: opposed rolls, group checks, what one roll covers, "turn", free or dominated resources, creation tables, mid-episode replacements. | One line each in Ch 2 (no opposed rolls; group-check outcome and ties), Ch 6 or 7 (moving is free; "near" outside a showdown), a definition of "turn", Ch 8 (mid-episode newcomers), and either d6 tables for tie, name and look or a logged decision that those stay free choices. |
| 2. Quick reference, sheets and trackers checked against the chapters, line by line | **Fail** | No record of a line-by-line check after rulings 88–104 went in (`a0a1267`). This audit's own pass found: tracker Doom "Full" line missing the carried-to-safety exception; quick reference Unmaking missing the Lure exception; quick reference Mend missing "itself included"; Ch 13's Surge summaries shortened; the call's undefined "turn". No contradictions on numbers. | Fix those lines, then log a dated line-by-line check in REVIEW.md. |
| 3. Simulated win and loss rates on target for every label and party size; no dead or dominated options | **Fail** | REPORT §1 "On target?" has seven "no" rows: Easy wins 85%; cells 80–90 / 67–80 / 57–63; Easy showdown median 2; Criticals 13–14%; Ward 40%; potions 46–69%; Seen (5% at Standard, on the edge of its 5–15% band). REPORT-threats: 7 dead moves, 1 dominated. "go asap" dominated (A6). Shelter, group checks, retreat and the Critical die aren't simulated (REPORT §13), so "no dead options" can't be shown for them. | Decide each A19/A21/A7/A9 item (change or log a new target); add Shelter, group checks and the Critical die to the simulator; re-run; every row "yes" or a logged decision. |
| 4. Two clean playtests in a row | **Fail** | The last two book playtests (A: Night Market, B: Low Tide) both needed invented rulings on core flow. A: the opening (C5), Difficulty 0 (C3), when a potion can be used (M11), whether the Weakness must be fetched (M6); its own verdict says "no blocker", but those are invented rulings. B: a **blocker** (does Lure cost Hurt, issue 1) plus potion timing (2), potion stacking (3), a Down witch using potions (4), Surge scope (5), healing a Down guardian (6), Sense on studying (8). Rulings 88–104 then changed the text, so **the current book has had no playtest.** (The "four clean playtests in a row" in DESIGN.md were of CORE-RULES v0.7–v0.8, before the book existed.) | Two new real-dice playtests of the current chapters (an Easy first night with a generated episode, and a Hard rowdy table), each with no blocker and no invented ruling on core flow. |
| 5. Every picture passes ART-CHECKLIST.md, with object and character tables | **Not yet** | All art is "TEMP test art" (`book/art/README.md`); the art direction is undecided and Richard will draw the final art. `ART-LOG.md` has object and character tables for the temporary pieces. | Final art, each piece checked with its tables. |
| 6. Layout | **Fail** | Contents page matches every chapter start (checked against the PDF). No near-empty pages found (only the cover, part pages and back cover are short, as intended). **Text under 7.5 pt:** map labels are 4.1–6.6 pt on pages 58, 63 and 68 of the 20:11 digital PDF (e.g. "six glowing valves hang at the top" 4.1 pt, "THE LONG PIER" 6.6 pt); body CSS has nothing under 7.8 pt except invisible markers. No layout audit or reflow check on record for v0.9. Colour: potions carry symbols as well as colours (art README). | Enlarge map labels (or give each map its own page), rebuild, render a contact sheet and log the layout check. |
| 7. Print | **Fail** | There is a printer-friendly white copy, an interior with 0.125 in bleed (630 × 810 pt, 74 pages), and a cover spread with spine. Fonts are embedded and credited. **But** the print interior and printer-friendly PDFs (built 20:07) each contain **22 Type 3 fonts**, and predate the credits line for pictures and maps. The 20:11 digital rebuild has no Type 3 fonts, so the latest map fix probably clears this once the print files are rebuilt. | Rebuild the print files; re-run `pdffonts` (no Type 3) and re-check text size. |
| 8. Credits and rights | **Not yet** | Pictures-and-maps credit: in `01-credits.html` and the digital PDF, not yet in the print files. Image source log: `book/art/README.md` "Image sources" (all original). Name check: only a first web check (`docs/reviews/name-check-2026-10-30.md`), with "USPTO… UK IPO and EUIPO" still to do; the title is still a working title. Famous-name echoes: names checked and two renamed (DESIGN log, 2026-10-30). Public-domain notice: not needed (no stand-ins). Online companion: named ("Foundry VTT: the Witch & Ward game system") but not linked. | Final title, then the full trademark search; a link for the online version; rebuild the print files with the credit. |

---

## 4. Options audit (REVIEW-PROCEDURE §1)

For each option: skipped rolls, missing limits, dead or dominated choices, and references to rules that don't exist. Numbers are from `sim/REPORT.md` (uses per episode, Easy / Standard / Hard) and `sim/REPORT-threats.md`.

### Powers and Surges

All six Powers are within the ±5-point target (REPORT §7: Force −1.0, Flame −1.1, Sight −0.3, Voice +1.4, Veil −0.3, Wild +1.3). No Power has a missing limit: each Surge is 2 Magic, once a scene per witch, paid before the roll, works on a Partial or better, and never while Down.

| Power | Fits | Surge uses (E/S/H) | Findings |
|---|---|---|---|
| **Force** | attacks, freeing | 0.09 / 0.09 / 0.05 | Surge rarely used. It overlaps Bind and Binding potions under "loses at most one attack a round", so stacking wastes them (book test B: both Binding potions spoiled). "Freeing" only matters in public fights (1% at Easy). Ch 7's worked showdown shows the Surge wasted (the threat Breaks before the lost attack comes due). Not dead overall. |
| **Flame** | attacks | 0.10 / 0.10 / 0.06 | Fits nothing in the investigation (by design). Blast + Flame Surge + Blasting potion + Weakness = 8 damage in one action (book test B, D13); the threat acting first in round 1 keeps it from being a first-strike kill. Fine. |
| **Sight** | leads (all kinds, including Reveal and the Book), defending, studying | 0.75 / 1.07 / 1.15 | Broadest fit and the most-used Surge. The miss skips a defence roll, but costs 2 Magic once a showdown. At Easy (Danger 1) the miss is nearly worthless. Fine. |
| **Voice** | talking leads, Hide | 0.20 / 0.68 / 0.69 | Fits nothing in a hidden showdown. Hide + Surge + Critical can clear 3 Exposure in one action (A3 note). Highest Power (+1.4). Fine, watch it. |
| **Veil** | defending, searching leads, Hide | 0.00 / 0.04 / 0.05 | **Surge nearly dead:** worthless in a hidden showdown and at Easy (Seen 0%); in a public showdown it needs Hide (an action, 1 + 2 Magic). Veil's value is defence (witch Down 9% vs 17–22% for others). Ruling 95 settled whose casting it covers. |
| **Wild** | talking and searching leads, Bind, brewing | 0.06 / 0.07 / 0.07 | Showdown Surge **dead at Easy once the Weakness is known** (Defence 1 can't go lower; book test A C3, ruling 91 made the floor explicit but left the Surge dead). The lead and brew Surges are strong (Book research + brew + Surge in one action; book test B). Ch 13 omits "goes with Bind" (A11e). |

### Spells (Craft, 1 Magic each)

| Spell | Uses (E/S/H) | Findings |
|---|---|---|
| **Reveal** | 2.57 / 0.90 / 0.90 | A lead against the Lead Difficulty, +1 Clue on a success; always casting; only Sight fits (ruling 79). Each episode has a Reveal-only lead (ruling 80). Not dominated. |
| **Bind** | 0.24 / 0.44 / 0.41 | Costs a roll, an action and 1 Magic. Against 3 characters the threat has one attack, so a Wild witch (5 dice vs Difficulty 2, works 97%) can cancel every attack from round 2 on; a lost attack also means no d6, so no 6 can take a free innocent. Ruling 56 accepts this on simulator evidence ("players: bind any" 73% / 59% vs 74% / 61%). Fine, but it is the strongest innocent protection in a 3-character fight, stronger than guarding. |
| **Blast** | 1.42 / 0.56 / 0.38 | Craft attack, +1 damage; Force and Flame fit. The right attack for a Craft 3 witch. Fine. |
| **Shelter** | **never simulated** | Skips the defence roll (costed: a roll, 1 Magic, an action). **Can't protect the innocent**, because taking them "isn't an attack", yet Ch 5's example says "A ring of salt round the innocent is Shelter", and DESIGN Q7 lists "shelter them" as a way to keep the innocent safe. That example points to a protection that doesn't exist. Shelter on the witch the d6 will pick (the last hitter or the most hurt) can blank most of a round (verify-v0.8 W4, book test B D4); ruling 99 closed only the guardian version. Unmeasured, so neither dead nor dominant can be ruled out. Book test B issue 12 (Hold must take the next attack even when the target is Sheltered) has no ruling. |
| **Hide** | 0.01 / 0.30 / 0.33 | Dead at Easy (Seen 0%) and in hidden showdowns; real at Standard and Hard. Cost always 1 Hurt (never raises Exposure). Fine. |
| **The Unmaking** | 1.00 / 0.96 / 0.84 attempts; destroys 85% / 79% / 77% | Needs a full Success; no Power fits, so no Surge. Its Difficulty rising with witches (5 for a 5-witch coven) is a likely cause of big covens' low win rates (A21). |
| **Any other spell** | — | "Closest spell, +1 Difficulty if it's a stretch"; "What magic can't do" closes healing, the dead, the past and love. The Shelter example above is the one problem. |

### Potions

Cap one per character (the guardian counts if played), extras lost, spoil at the end, no action to use, one per character a round or scene, an attack takes at most one (the attacker's own), named before the roll. Limits are complete. Brewed 3.2 / 2.3 / 2.4 an episode; used 46% / 61% / 69% (target ≥70%, A7).

| Potion | Brewed / used (E/S/H) | Findings |
|---|---|---|
| **Healing** | 0.98 / 0.73 / 0.77 brewed; 0.05 / 0.35 / 0.44 used | **Dead at Easy.** At home, drinking one to make room for the researcher's free brew turns that brew into free healing (book test B A5); capped by one a scene per character, so not broken. Can't reach a Down guardian (ruling 96). Fine. |
| **Blasting** | 0.95 / 0.75 / 0.76; 0.88 / 0.70 / 0.73 used | The most-used potion. A Partial with Blasting (1 + 2, + 1 Weakness = 4) beats a plain Success (3). Fine. |
| **Binding** | 0.96 / 0.73 / 0.75; 0.55 / 0.35 / 0.47 used | Wasted whenever Bind or Force's Surge already took the round's attack, or the threat Breaks first. Not dominated by measurement (no test removes it), but half are wasted. |
| "Someone near you" | — | "Near" is defined only for a showdown. Out in the city, can a witch use a Healing potion on someone across town? Not stated. |

### The guardian's gifts and the call

| Gift | Uses (E/S/H) | Findings |
|---|---|---|
| **Mend** | 0.41 / 0.74 / 0.67 | Action, 1 Ward, clear 2 Hurt, itself included (ruling 96). Fine. |
| **Shield** | 0.22 / 0.35 / 0.21 | No action, 1 Ward, once a round; not under Shelter. Fine. |
| **Carry** | 0.01 / 0.04 / 0.06 | **Missing rule:** "It can't carry the coven out of a showdown or past a threat." Can it carry *one witch* (say, a Down one) out of a fight? DESIGN Q6 said yes ("an innocent or a Down witch"); the book is ambiguous, and nothing says what a carried witch can then do or whether she counts for "every witch Down". In the investigation Carry has no rules effect (ruling 39: the threat has the innocent "whatever the coven did for them before"), so as an investigation action it is story only. |
| **Sense** | 2.00 an episode (the simulator caps it) | No action, 1 Ward, once a scene, outside the +2 limit, investigation leads only (ruling 97). Ch 6's definition of a lead contradicts the "never on studying" line (A11a). |
| **Hold** | 1.66 / 0.10 / 0.14 | **Near-dead at Standard and Hard:** Nerve 2 against Defence 2 (3 without the Weakness) works 75% (25% at Defence 3) and draws an attack the guardian defends badly (2 dice vs Danger 3: 75% Failure, Hit 2–3). Can't be released when it would send an attack away from a Sheltered target (book test B issue 12, unruled). |
| **The no-guardian call** | used in 3% / 48% / 70% of episodes | Once an episode, Mend or Carry, no action, no roll, counts as casting. Free in a hidden place apart from the limit; fine. "On any character's turn" uses an undefined term (A10, A16). |

### Lives

All six Lives work the same way: +1 die when the Storyteller agrees it fits (inside the +2 limit), and a call once an episode (answer: an action for +1 Magic; ignore: −1 Magic, or 1 Hurt at 0 Magic). No missing limits.

- **The call's trade leans toward ignoring at Hard.** REPORT §10: "players: life never" 71% / 5% at Standard and **61% / 14% at Hard**, against the default 74% / 7% and **61% / 21%**. Same Hard wins, 7 points fewer losses. Not strictly dominated (Standard wins drop 3 points), but close.
- **Shipped episodes name only two Lives as fits:** nurse (Episode 1 lead 4, Episode 3 lead 1) and student (Episode 2 lead 4). Shop worker, teacher, mechanic and bus driver are never named (Ch 6 and Ch 11's examples use mechanic and bus driver). Fits still depend on the Storyteller, so not dead, but the ready-made episodes favour two Lives.
- The simulator plays a Life fit as one roll in three for every Life, so it can't tell the Lives apart.

### The guardian as a choice

- **Balance:** guardian player minus an extra witch: +3.8 / +3.3 / +3.3 (Easy), +4.2 / +3.5 / +4.8 (Standard), +0.4 / −0.3 / +1.6 (Hard): inside ±5, but near the edge at Standard. Ch 4's "does about as well as a coven with one more witch" is true.
- **Swingy spotlight:** the guardian goes Down in 45% of Standard and 65% of Hard episodes with a guardian player (REPORT §4), and a Down guardian "can't help" for the rest of the fight while Down witches still help and join the Unmaking (book test B issue 19; ruling 103 added advice only).
- **No season stakes:** "The guardian doesn't grow" (Ch 8) and Scars go to "a witch". Ch 4 never says outright that the guardian gets no Scar (book test B issue 20).
- **Design log drift:** DESIGN Q6 says "Some threats have Bane: guardian and hurt it 1 more." No threat in the book has it.

### Signature moves (threat options; flagged by the simulator)

| Move | Win vs a plain attack (E/S/H) | Flag |
|---|---|---|
| Hush (Quiet Man) | 0.0 / −0.9 / −1.6 | dead; its "can't cast" rider is dead too (0.2 turns without casting per Hard episode) |
| Cinders (Ash Widow) | +0.1 / −0.5 / +0.1 | dead |
| Borrowed Face (Mirror Thief) | +0.3 / +0.2 / +0.1 | dead **and dominated** (the coven wins more and goes Down less than against a plain attack); undefined with no standing witch, at 0 Magic, and under Shield |
| Drain (Night Nurse) | 0.0 / −0.1 / −0.4 | dead; no floor for the damage it clears; Shield case unstated |
| Turned Spell (Vesper Crane) | −0.4 / −0.3 / −0.3 | dead |
| Lure (Drowned Choir) | 0.0 / −0.9 / −1.0 | dead; ruling 88 changed it and is marked "for Richard's approval" in REVIEW.md; DESIGN.md logs the change but not an approval |

The yardstick Ch 10 gives for a new move ("about as strong as 'attack two different characters'") is itself dead (REPORT-threats §7).

---

## 5. Open items with no ruling yet

These were raised in earlier playtests and are still open in the text.

| Source | Item | Severity |
|---|---|---|
| Book test A M3 | In a hidden showdown, Night Market's twist may never come out (it relies on Grace being there). | minor |
| Book test A M7 | Ch 12's prep reading (Ch 9 and Episode 1) doesn't cover the showdown; the table taught it from the quick reference. | minor |
| Book test A M8 | Ch 9's pacing table counts the opening twice on a first night. | minor |
| Book test A M10 | "Fled, innocent lost" and "fled, innocent safe" are both a Partial (sent to Richard). | design call (A4) |
| Book test B 12 | Hold can't be released when it would pull an attack off a Sheltered target. | minor |
| Book test B 20 | No line says the guardian never gets a Scar. | minor |
| verify-v0.6 N9 | Once Seen, only the first casting cost in a scene counts. | minor (A5) |
| verify-v0.7/0.8 N3 | Two guards on one innocent. | minor (A13) |
| verify-v0.7/0.8 N16 | A second attack in a round when nobody is standing. | minor (A13) |
| REVIEW 88 | Lure's change is marked for Richard's approval; DESIGN.md logs the change but no approval. | process |

---

## 6. Notes on the evidence

- **The simulator follows `docs/CORE-RULES.md`, not the chapters** (its header says so, and `params.mjs` cites CORE-RULES passages). AGENTS.md makes the chapters the rules, and Part C says the simulator follows the book. The two agree today, as far as this audit found, but the simulator still describes ties as "the Storyteller picks" (ruling 92 now rolls a die; the simulator already rolls).
- **What the simulator doesn't play** limits what gates 3 and A9 can show: Shelter, group checks, retreat, the default Critical die, and (per REPORT §13, which contradicts §11) seasons.
- **Every worked example's arithmetic was re-done** and checks out (Ch 2 odds table equals REPORT §9; Ch 7's 86% / 36%; Ch 8, 10 and 12's season Toughness figures; Ch 9's lookup table; every Clue and Magic count in Ch 6 and Ch 7).
- **The two book playtests' own "clean" verdicts are generous.** Test A reports "no blocker and no invented ruling on core flow" while logging rulings it had to invent on the opening, Difficulty 0 and potion timing. Gate 4 above uses the strict reading.
