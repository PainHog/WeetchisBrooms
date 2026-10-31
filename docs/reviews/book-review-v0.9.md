# Rules review: Witch & Ward v0.9 (the whole rulebook)

A fresh rules review of the v0.9 test edition, following `docs/REVIEW-PROCEDURE.md` §1. The reviewer only read the book and reports here: nothing else was changed.

**What was read:** every chapter in `book/src/chapters/` in order (00 to 99, including `40-sheets.html`); the built PDF `book/dist/Witch_and_Ward_v0.9.pdf` (78 pages, built 2026-10-30 20:24) for tables, sheets and the six maps; `docs/CORE-RULES.md`; `book/REVIEW.md` (rulings 1–105, with 62–105 checked one by one); `docs/GLOSSARY.md`; `AGENTS.md`; `docs/DESIGN.md` §2.

**Snapshot:** the chapter text was read at commit `ed234be`. Since then (`7248d15`, `9df75c7`, `6fb169a`) only `book.css` changed (maps at full width), along with art files. The map labels are the same, apart from one line break. The PDF was rebuilt at 20:24 from that text, so it matches the chapters, the new credits line included.

**Page numbers** are pages of the 78-page PDF built at 20:24 (the footer number). An earlier 75-page build had the same pages up to p54; later pages moved by up to three.

**Checked by script:** the odds table in Chapter 2 (exact binomial odds); every Clues, half, Toughness, season Toughness, attacks and Unmaking number in Chapters 9, 11, 14, 15 and 16 against the Chapter 6 table; the Unmaking odds in Chapter 7; and every die, total and result in every example. The scripts are summarised in Appendix B.

**Not covered** (not asked for in this pass): a new simulator run, layout and art, and rights. The figures quoted from `sim/REPORT.md` are read, not re-run.

---

## Verdict

The book is in good shape. Every number in every table, lookup and episode matches the Chapter 6 table, and every worked example adds up. The quick reference, sheets and tracker match the chapters almost line for line, and the cross-references all point to the right chapter. None of the show's terms appear, and nothing credits an assistant or AI.

Two things need fixing before the book goes outside the table: what happens to the guardian after it **Carries** someone out of a showdown (B1), and the **Hush** move, which contradicts itself in the first-night episode (B2). Eight smaller gaps need one sentence each, mostly "there is none" and order-of-resolution cases.

| Severity | Count |
|---|---|
| Blocker | 2 |
| Confusing | 8 |
| Minor | 29 (M4 was fixed by the 20:24 rebuild and isn't counted) |
| Differences between `CORE-RULES.md` and the chapters (each minor; the chapters win) | 18 |

---

## Blockers

### B1. Carry in a showdown: where is the guardian afterwards, and whom can it carry?
- **Where:** `14-ch04.html` (p15, the gifts table and "Playing the guardian well"); `17-ch07.html` (p24–25); `31-ch13.html` (p53); the "In its grip" paragraphs in `32-ch14.html` (p59), `33-ch15.html` (p65) and `34-ch16.html` (p71); guardian sheet (p74); quick reference (p76).
- **Quote:** "Take one person to a place it knows, such as the freed innocent out of a fight. It can’t carry the coven out of a showdown or past a threat." (Ch 4). "Once she is free, Rook (or the coven’s call) can Carry her to a place it knows, such as the Lantern House." (Ch 14).
- **Problem:**
  - Read literally, the guardian goes with the person it carries, and nothing brings it back. Rook would then be at the Lantern House for the rest of the fight: no Shield, no Hold, no Ward dice. The simulator keeps the guardian in the fight after a Carry (`sim/engine.mjs`, the Carry branch), so the balance figures assume the opposite of the literal reading.
  - Every public showdown with a guardian player reaches this point. Chapter 4 tells the guardian to "Carry the freed innocent out", so a Storyteller has to rule on it.
  - "It can’t carry the coven out of a showdown" can be read as "all of them at once" (so carrying one Down witch to safety would be allowed, as the DESIGN Q6 decision said) or as "anyone in the coven". "Past a threat" isn't explained.
- **Fix (wording, matching the simulator):** add to Carry in Chapter 4, and repeat it on the guardian sheet and quick reference: "Carrying takes only the guardian’s action: it is back where it was at once. It can’t carry a witch, or itself, out of a showdown, and it can’t take anyone past the threat to reach them." The same line covers the coven’s call. *Letting it carry a Down witch out, as DESIGN Q6 first said, would be a rule change.*

### B2. Hush contradicts itself, the ruling and the simulator
- **Where:** `22-ch10.html` (p39), the Quiet Man’s signature move. Episode 1 (`32-ch14.html`, p56) points to it, so it is the first move new groups meet.
- **Quote:** "On their next action they can’t use a Power, cast a spell or use a gift, so they can’t lead or join the Unmaking with it. They can’t use a potion until Hush ends. It doesn’t stop what takes no action: their defence dice, Sight’s miss, or a Down witch joining the Unmaking. Hush ends when they next act, or at the end of the next round."
- **Problem:**
  - Using a potion takes no action (Chapter 5), so "can’t use a potion until Hush ends" and "it doesn’t stop what takes no action" give opposite answers.
  - "Can’t … use a gift" would also stop the guardian’s Hold and Shield. But Hush is "can’t cast", Hold isn’t casting, and Shield takes no action.
  - Ruling 89 says Hush stops the *next action* being casting ("no Power, spell or potion"). The simulator (`sim/params.mjs`, the Hush entry) blocks only what is done in that turn, and it lets Hold and Shield through. The page says something different from both.
- **Fix (wording, matching ruling 89 and the simulator):** "On their next action they can’t cast: no Power dice, no spell (so they can’t lead or join the Unmaking as that action), no potion that round, and, for the guardian, no Mend or Carry. Hold isn’t casting, so it still works. Hush doesn’t stop anything outside that action: defence rolls and their Power dice, Sight’s miss, Shield, helping, or a Down witch joining the Unmaking. Hush ends when they next act, or at the end of the next round." *If Richard prefers "no potion until Hush ends", that is a small rule change, and the simulator must follow it.*

---

## Confusing

### C1. Is researching the Book a searching lead? Only Chapters 13–16 say so (ruling 79)
- **Where:** `13-ch03.html` (p11), `15-ch05.html` (p19), `16-ch06.html` (p21), quick reference (p76), against `31-ch13.html` (p54) and the Book lead in each episode (p57, p63, p69).
- **Quote:** Ch 3’s ratings table, Wits row: "Searching leads, researching the Book, studying the threat". Ch 5: "It is a lead using Wits, with +1 die (inside the +2 limit)". Ch 6: "Researching the Book is a lead using Wits at home." Ch 13: "researching the Book (a searching lead using Wits, +1 die, with no Exposure; one character per scene; Sight, Veil and Wild fit it)".
- **Problem:** Ruling 79 is logged for Chapter 3, but Chapter 3 doesn’t have it. Its table lists Book research as a separate item from searching leads, which suggests Veil ("searching leads") doesn’t fit it. A Tess or Noor player reading Part One can’t tell whether they get +2 dice at home.
- **Fix (wording):** Ch 3, Wits row: "Searching leads (researching the Book is one), studying the threat". Ch 5, Ch 6 and the quick reference: "a searching lead using Wits".

### C2. "a success" means a die in one sentence and a result in the next
- **Where:** quick reference (p76: "Each 4, 5 or 6 is a success." then "a success gives 1 Clue, a Critical 2, a Partial 1 with a cost" and "a success does 2 damage"); witch sheet and quick reference: Magic (p73, p77: "a success gives 1 more Clue"); Ch 5 (p17: "plus 1 Clue on a success"); Ch 9 (p35: "Only a success frees them"); every episode’s Reveal lead and "In its grip" paragraph (p57 and p59, p63 and p65, p69 and p71).
- **Problem:** Chapter 2 uses "success" for a die showing 4–6 and **Success** for a result. Elsewhere the lower-case word stands for the result. On the first-night handout, a newcomer can read "a success gives 1 Clue" as one Clue for each die that shows 4–6.
- **Fix (wording):** always capitalise the result: "a Success gives 1 Clue", "only a Success frees them". Keep lower case only for dice ("each 4, 5 or 6 is a success").

### C3. Group checks: what does a Failure mean, and who is "worst"?
- **Where:** `12-ch02.html` (p9); quick reference (p76).
- **Quote:** "Everyone rolls. It isn’t an action, so nobody uses their action on it. There is only one cost, and whoever rolled worst takes it."
- **Problem:** The book doesn’t say whether a character who fails still gets there (does June reach the drowned village?), whether "worst" means the lowest result or the fewest successes, what happens on a tie, or that there is no cost when everyone succeeds. A Storyteller has to invent all four. (The simulator never uses group checks, so nothing depends on the answer.)
- **Fix (wording, plus a small ruling):** "Everyone who gets a Success or a Partial manages it; the Storyteller says what a Failure means in the story. If anyone got a Partial or a Failure, there is one cost: the lowest result takes it (a Failure before a Partial; ties: roll a die among them)."

### C4. Borrowed Face against a Shield
- **Where:** `22-ch10.html` (p40).
- **Quote:** "attack the witch with the most Magic left; on a Failure they also lose 1 Magic. … Under Hold it attacks the guardian, which loses 1 Ward instead."
- **Problem:** Ruling 82 covers Hold only. If the guardian Shields the witch and fails its defence, does it lose 1 Ward, or nothing? The Mirror Thief is the threat in Chapter 11’s worked episode, so this will come up.
- **Fix (a one-line ruling):** "If the guardian takes the attack (Hold or Shield), it loses 1 Ward instead."

### C5. A Hold or a Shelter whose own cost puts the roller Down
- **Where:** `14-ch04.html` (p15); `15-ch05.html` (p17); `17-ch07.html` (p24).
- **Quote:** "Hold: “works” means a Partial or better, and a Partial still costs 1 Hurt." Shelter: "It ends if you go Down."
- **Problem:** A guardian with 4 Hurt that Holds and gets a Partial goes Down and fades home, but "the threat’s next attack must target the guardian". A witch with 3 Hurt whose Shelter is a Partial goes Down from its cost, so the Shelter "works" and ends at once. Neither order is stated (A13, A15).
- **Fix (a one-line ruling each):** "If the guardian is Down when a Held attack comes, roll for it as usual." "A Shelter whose own cost puts you Down still protects until the end of the threat’s next turn" (or "ends at once"; either works, as long as the book says which).

### C6. "Two different characters" when only one is standing
- **Where:** `17-ch07.html` (p24); `22-ch10.html` (p38, p39).
- **Quote:** "“Two different characters” means the most Hurt and the next most Hurt, both standing."
- **Problem:** Late in a fight there may be only one standing character. Does Hush (or the default move) make one attack, or two at the same character? (A13)
- **Fix (a one-line ruling):** "If only one character is standing, it makes one attack."

### C7. The Hold paragraphs are hard to follow
- **Where:** `17-ch07.html` (p24), "The threat’s turn"; `22-ch10.html` (p38), the Hold bullet; quick reference: Magic (p77).
- **Quote:** "Taking the innocent isn’t an attack, so Hold can’t stop it. That is why the Storyteller rolls the d6 even for an attack Hold has aimed. If it shows 6, the signature move still happens (or the innocent is taken). Hold only aims attacks: … A move with no attack in it leaves Hold for the next attack."
- **Problem:** Eight sentences cover five cases, out of order and partly repeated. The last case (a move with no attack) doesn’t exist among the six threats.
- **Fix (wording):** a four-row table, "Hold and the d6":
  - 1–5: the attack goes to the guardian; Hold is used up.
  - 6, a move that attacks: the guardian is its first target; Hold is used up. Any part that isn’t an attack (Lure’s Heart roll) still happens.
  - 6, the innocent is free and guarded: the attack on the guard goes to the guardian; Hold is used up.
  - 6, the innocent is free and unguarded: they are taken (not an attack); Hold stays for the next attack.

### C8. The quick reference’s investigation paragraph is one 94-word sentence
- **Where:** quick reference (p76), "Investigation (scenes)".
- **Quote:** "Each character takes one action: follow a lead out in the city (Heart, Wits or Reveal against the Lead Difficulty: a success gives 1 Clue, a Critical 2, a Partial 1 with a cost); research the Book at home (…); brew a potion at home; rest (clear all Hurt); cover up out in the city (Hide); or answer their Life (no roll; gain 1 Magic)."
- **Problem:** This is the page new players read first, and the actions are hard to pick out.
- **Fix (wording):** a six-line list, one action a line, as in Chapter 6’s table.

---

## Minor

| # | Where (file, page) | Quote | Problem | Suggested fix |
|---|---|---|---|---|
| M1 | `21-ch09.html` p32 | "About 59% Wins and 23% Losses. A witch goes Down in most episodes (61%)"; "about two episodes in five (39%)"; "Wins run from 67% (five witches) to 79%" | `sim/REPORT.md` now gives Hard 60% / 22% / 60%, Standard Down 38%, and a Standard range of 67–80% (after ruling 105). | Update the figures (only the printed numbers change, not a rule). |
| M2 | `21-ch09.html` p32 | "from 36,000 simulated episodes" | Tells readers that software was used to test the game. It names no tool, but Richard’s standing rule is close. His call. | "from thousands of test games", or keep it. |
| M3 | PDF properties | Creator "HeadlessChrome/153…", Producer "Skia/PDF m153" | The file properties name the software that made the PDF. AGENTS.md’s portal rule bans that in downloads. | Clear the properties when building. |
| M4 | `01-credits.html` / PDF p2 | Source: "Pictures and maps: Temporary art made for this test edition…" | **Fixed during the review:** the 75-page build lacked this line; the 20:24 rebuild (p2) has it. Not counted. | — |
| M5 | `31-ch13.html` p52–53 | Noor: "Or, in a showdown, the threat’s Defence is 1 lower for everyone this round." Tess: "…or in a showdown for this round and the next (a casting roll’s cost becomes 1 Hurt)." Rook: "Mend (action): clear 2 Hurt from someone it touches." | Chapter 12 fills the sheets from Chapter 13, but these leave out "goes with Bind, starting after the Bind roll", "covers the whole coven’s casting; in a showdown it goes with Hide", and "itself included" (Ch 3, Ch 4). | Copy the Ch 3 and Ch 4 wording. |
| M6 | Quick reference p76–77 | "a Down witch joins without one."; "Study the threat: Wits against Defence: 1 Clue."; "Hold only aims attacks: on a 6, an attacking move still happens…" | Leaves out the Lure exception for joining the Unmaking (ruling 100), the Partial cost and Critical 2 Clues for study, and ruling 85’s guard case. | "…a Down witch, or one who lost their action to Lure, joins without one"; "Study: Wits against Defence; a Success or Partial gives 1 Clue, a Critical 2"; add the guard row from C7. |
| M7 | Tracker p75 | "Witches ____"; "Full: the innocent is lost and the threat escapes." | No box for n (characters), which sets Clues, attacks and the potion limit; the Doom line leaves out "unless already carried to safety". | Add "Characters (n) ____"; add the exception. |
| M8 | `21-ch09.html` p32 | "No guardian player? Leave the “guardian called” box empty." | The box is empty at the start anyway, so the step reads as an instruction to do nothing. | "With a guardian player, cross out the “guardian called” box; without one, tick it when the coven calls." |
| M9 | `18-ch08.html` p28 | "Each episode starts fresh: … and Doom, Exposure and Clues at 0." | Leaves out a Book page (half the Clues) and the generator’s reporter twist (Exposure 1). | "…Doom and Exposure at 0, and Clues at 0 unless the Book has a page on the threat." |
| M10 | `17-ch07.html` p25; `GLOSSARY.md` | Results table: "Partial — The threat fled, or…"; glossary: "Partial — At least half the Difficulty but not all of it" | One word for a roll result and an episode result (A16); the glossary has only the first. | Add the episode meaning to the glossary, or call the episode result "Partial win" everywhere. |
| M11 | `31-ch13.html` p51, `32-ch14.html` p57, `34-ch16.html` p68–69, `22-ch10.html` p40, `23-ch11.html` p45–46 | "An old man on her ward"; "The ward is two nurses short"; "a ward at Larkhaven General"; "night wards"; "a short-staffed ward" | The glossary says Ward has "only this meaning in the rules". Lower-case hospital wards appear seven times. | Accept it (it’s lower case and never in a rule) and soften the glossary line, or use "unit" and "shift". |
| M12 | Throughout | "Life call" / "call the guardian"; "Life scenes", "Closing scene"; "lead" / "leads the Unmaking"; "on any character’s turn"; "whoever hurt it last"; "Sight’s miss" / "Sight’s Surge" / "Sight’s miss Surge" | Small double meanings (A16): "call" and "scene" have two meanings, "lead" is also a verb, "turn" is never defined for characters, a threat takes damage rather than Hurt, and one effect has three names. | "During the characters’ part of a round" for "on any character’s turn"; "whoever last did it damage"; pick one name for "Sight’s miss". |
| M13 | `GLOSSARY.md` | — | Missing terms the chapters use: group check, cost, talking lead, searching lead, Lead Difficulty, hidden place, public place, signature move, retreat, Win/Partial/Loss, w and n, Lantern House. | Add them. |
| M14 | `16-ch06.html` p20; `21-ch09.html` p33 | "In each scene, every character takes one action, in any order."; "A lead can be followed again" | The book doesn’t say whether two characters may follow the same lead in the same scene (only the Book is limited to one a scene). | "Two characters can follow the same lead in a scene; each rolls for themselves." |
| M15 | `15-ch05.html` p18; `17-ch07.html` p23 | "Each character uses at most one potion a round (or a scene)."; "The whole showdown counts as one scene for anything that works once per scene" | Read together, these could mean one potion per showdown. Chapter 7 settles it ("one per character a round"), but Chapter 5 doesn’t. | Ch 5: "…one potion a round in a showdown, or one a scene in the investigation." |
| M16 | `12-ch02.html` p8 | "+1 die on your next roll this episode" | Must it go on the very next roll, even an unwanted defence roll? | "…on your next roll this episode (you can’t save it)." |
| M17 | `22-ch10.html` p41; `34-ch16.html` p68 | Lure: "rolls Heart against Danger (no Power fits it, it isn’t casting, …)" | The book doesn’t say whether helpers or the character’s own Magic can add dice to this roll. | "Helpers and Magic can add dice as usual." |
| M18 | `16-ch06.html` p21; `14-ch04.html` p15 | "The guardian can also use Mend or Carry as its action" | Carry in the investigation has no effect in the rules (the threat has the innocent at the mark whatever the coven did, ruling 39). | Say it is for the story, or drop it from the investigation list. |
| M19 | `21-ch09.html` p33 | "Standard. Dana, June and Quinn are the witches, and a fourth player plays Rook" | The running Cinders example (Ch 6–7) is Dana, Marco and June, at 9 Clues after scene 3; this one is a different coven at 9 Clues after scene 4. Readers following Cinders will trip. | Use Dana, Marco and June, or say "at another table". |
| M20 | `32-ch14.html` p57, `33-ch15.html` p63, `34-ch16.html` p68 | "A nurse’s Life might fit here." | Across the three episodes only nurse and student get a "might fit" note; teacher, mechanic, shop worker and bus driver never do (A9). | Add one note per Life across the three episodes (Quinn and Finn’s choir, Marco and the lifeboat tractor, Tess and the Heights bus). |
| M21 | `22-ch10.html` p37 | "A threat has no numbers of its own. … Each stat block below repeats them." | Reads as a contradiction. | "A threat’s numbers come from the label, not the threat. Each stat block repeats them for convenience." |
| M22 | `23-ch11.html` p44 | "Plan 4’s +2 Toughness is on top of the usual +2 …, so after that escape it comes back with 4 more." | "That escape" should be the one where Doom filled; a threat that fled didn’t complete its plan. | "If Doom fills with plan 4, the threat comes back with 4 more Toughness (2 for escaping, 2 for feeding)." |
| M23 | Quick reference p76 | "1 / 1 · 2 / 3 · 2 / 3"; "Success no Hurt, Partial 1 Hurt, Failure Hit Hurt" | Slashes and dots mixed in one cell; "Hit Hurt" reads oddly. | Split Defence and Danger into two rows; "Failure: Hurt equal to Hit". |
| M24 | `11-ch01.html` p6; `31-ch13.html` p54 | "Fog in the mornings, ferries, steep streets" | Close to the show’s San Francisco (DESIGN Q1 says "Not San Francisco"). A judgement call; the British place names already set it apart. | Optional: swap one image (sea mist, a tidal river, a castle hill). |
| M25 | `17-ch07.html` p23 | "Some things take no action: helping a roll, using a potion, the guardian’s Shield, Sight’s miss Surge, and a Down witch joining the Unmaking." | Leaves out calling the guardian and a witch who lost their action to Lure joining the Unmaking. | Add both. |
| M26 | `book/REVIEW.md` #88; `22-ch10.html` p41 | "Changes a threat’s move: for Richard’s approval" | The new Lure is already printed. | Confirm Richard approved it, and note that in the ruling. |
| M27 | `15-ch05.html` p17 | "You can leave your Power off a roll so that your Power doesn’t make it casting, though a spell or a potion still does" | Awkward. | "If you leave your Power off, the roll isn’t casting, unless it is a spell or uses a potion." |
| M28 | `16-ch06.html` p22 | "It rises by 1 when a casting roll out in the city has a cost (except Hide, whose cost is always 1 Hurt), and by 1 for each round of a public showdown in which anyone was casting (Chapter 7)." | 40 words, two rules. | Two bullets. |
| M29 | `11-ch01.html` p5 | "A witch sheet for each witch, the guardian sheet if someone plays the guardian, and an episode tracker for the Storyteller." | Leaves out the quick reference, which Chapter 12 asks you to print. | Add "and the quick reference". |
| M30 | `14-ch04.html` p15; `17-ch07.html` p24 | Hold "aims the threat’s next attack" | If the threat lost an attack (Bind) in the same round, Hold should aim the first attack it actually makes. Implied, never said. | "Hold aims the next attack the threat actually makes." |

---

## 1. Contradictions

### 1a. Between chapters
Apart from B1, B2, C1 and M15 above, the chapters agree with each other. These were checked and found consistent: casting (Ch 2, 4, 5, 7, 9); costs (Ch 2, 5, 6, 9); Down (Ch 3, 4, 6, 7); potions (Ch 5, 7, 9); the round order (Ch 7 and the Storyteller’s round box in Ch 9); the end of a round (every witch Down before a Broken threat flees); Seen (Ch 6, 7, 9); the Unmaking (Ch 4, 5, 7, 9); the season rules (Ch 8, 10, 12, 16); dice counts (Ch 1 and 12, up to 13 dice, or 14 with Craft 4).

### 1b. Chapters against the quick reference, sheets and tracker (line by line)
- **Witch sheet (p73):** ratings, Hurt (4), Magic (5, no top limit), the Surge line, the spell list, the Magic spends and the Down note all match Ch 3 and Ch 5. Pass.
- **Guardian sheet (p74):** ratings, Hurt (5), Ward (5), the gifts table (including "itself included") and the can’t-do paragraph match Ch 4 and Ch 13. Pass. (Carry wording: see B1.)
- **Tracker (p75):** Doom 12 with the mark at 5; Exposure 5 boxes, box 5 crossed out at Standard and Hard; 20 Clue pips (the most needed is 20); 45 damage pips (the most is 40 plus returns); 5 potion lines; 12 round boxes. All match. Gaps: M7.
- **Quick reference (p76):** the roll, Criticals, Partial, group check, costs, casting, extra dice, investigation, round order, actions, the threat’s d6, the Unmaking, gifts, the end and the numbers table all match Ch 2–7 and the Ch 6 table. Gaps: C2, C8, M6, M23.
- **Quick reference: Magic (p77):** spells, Powers (Veil’s "whole coven" and Wild’s "after the Bind roll" both present), potions, innocent, showdown details, tracks and seasons all match. Gap: M6 (ruling 85).

### 1c. Ready-made characters (Ch 13) against the creation rules (Ch 3)
All six witches have 3, 2, 2, 1, with the 3 where their Power is used most. No two share a Power or a Life. Each has 4 Hurt and 5 Magic. Rook has 3, 2, 2, 5 Hurt and 5 Ward. The Ch 3 example witch (Ruth Penhale: Wild, teacher) and her season entry in Ch 8 (Nerve 1 to 2) agree. Only the Surge and Mend summaries fall short (M5).

### 1d. The three episodes against the episode-building rules (Ch 9, 11)
Each episode has everything Chapter 11 asks for: an opening, an innocent, the threat’s stat block, a label and Clues table, six leads (two talking, two searching, one Book, one Reveal) with "What and where" and "Weakness" answers, a d6 Life-call table, a hidden and a public place with at least two ways in and out, a twist tied to a lead, "As Doom rises" beats, and Win, Partial, Loss and Seen closings. The Powers listed for each lead match Ch 3 (talking: Sight, Voice, Wild; searching and Book: Sight, Veil, Wild; Reveal: Sight).

**Numbers by group size, checked by script** against the Chapter 6 table: the Ch 9 lookup (6 rows: Toughness, Clues, half, attacks, Unmaking), the Ch 11 Clues lookup (3 rows) and each episode’s Clues (3 rows) and Toughness (5 rows, plus Ch 16’s season column). **0 mismatches.**

**Maps against text:** the labelled ways in and out on all six maps (radio tower, night market, Mariner Theatre, harbour fireworks, drowned village, long pier) match the episode text exactly, including the way-out-only routes (the steep bank, the mudflats).

### 1e. `CORE-RULES.md` against the chapters (every difference; the chapters win)
The core page has fallen behind on most rulings since #62. None of these changes how the chapters play, but the "approved one-page summary" no longer summarises the book.

| # | Topic | The chapters say | `CORE-RULES.md` |
|---|---|---|---|
| D1 | Wild’s showdown Surge | goes with Bind; Defence −1 starts after the Bind roll (Ch 3, 5; ruling 95) | "the threat’s Defence is 1 lower for everyone this round" |
| D2 | Veil’s Surge | covers the whole coven’s casting, its own roll included; in a showdown it goes with Hide (Ch 3, 5; rulings 76, 95) | not stated |
| D3 | Surges and defence | a defence roll isn’t an action, so it takes no Surge (Ch 3, 7) | implied only |
| D4 | Potions | you choose each potion’s kind; a witch can use one on the guardian (Ch 5; rulings 70, 86) | not stated |
| D5 | Mend | "itself included" (Ch 4; ruling 96) | not stated |
| D6 | Down guardian | nobody can heal or help it while it’s faded (Ch 4; ruling 96) | not stated |
| D7 | Hold and a 6 | the move still happens; the guardian is the first target; the guard case; taking an unguarded innocent leaves Hold (Ch 7, 10; rulings 64, 82, 85) | only "even for an attack Hold has aimed" |
| D8 | Shield and Sight’s Surge on one attack | Shield is chosen first (Ch 7; ruling 67) | not stated |
| D9 | The Unmaking is casting | every try counts toward a public round’s Exposure (Ch 7; ruling 98) | not stated |
| D10 | Lure and the Unmaking | a witch who lost their action can still join (Ch 7, 10; ruling 100) | not stated |
| D11 | End of a round | "every witch Down" is checked before a Broken threat flees (Ch 7, 9; ruling 83) | not stated |
| D12 | Doom fills | an innocent already carried to safety isn’t lost (Ch 6, 7, 9; ruling 101) | "the innocent is lost" |
| D13 | Book page | half the Clues, rounded up (Ch 5, 6, 8; ruling 66) | "start with half the Clues" |
| D14 | Season growth | the guardian doesn’t grow (Ch 8, 12; ruling 71) | not stated |
| D15 | The opening | isn’t a scene; leads can be followed again (Ch 9; rulings 78, 93) | not stated |
| D16 | Helpers | must be able to help in the story (Ch 2; ruling 102) | not stated |
| D17 | New and replacement witches | join at the lowest witch’s growth, share pages, bring no Scars (Ch 8) | not stated |
| D18 | Signature-move targets | standing characters only; "one attack" aimed like a 4–5 (Ch 7, 10; rulings 63, 81) | not stated |

**Fix:** bring `CORE-RULES.md` up to date in one pass, or add one line at the top: "Rulings from #62 on are in the chapters only."

### 1f. Rulings #62–105: are they in the chapters as stated?

| # | In the chapters? | Note |
|---|---|---|
| 62 | yes | Ch 3, 7, 8 and CORE |
| 63 | yes | Lure part superseded by 88; the book follows 88 |
| 64 | yes | Ch 7, 9, 10 |
| 65 | yes | Ch 11 |
| 66 | yes | Ch 5, 6, 8 (not CORE: D13) |
| 67 | yes | Ch 7, 9, 10 |
| 68 | yes | glossary |
| 69 | yes | Ch 3 |
| 70 | yes | Ch 5, quick reference |
| 71 | yes | Ch 3, 8, 12, CORE (guardian growth not in CORE: D14) |
| 72 | yes | Ch 2, 4 |
| 73 | yes | Ch 4, 6 |
| 74 | yes | extended by 94 |
| 75 | yes | the innocent-on-retreat part is in Ch 7 and 9, not Ch 8 as logged; fine (stated once) |
| 76 | yes | Ch 2, 3, 4, 5, 7 |
| 77 | yes | Ch 9 points to Ch 6 |
| 78 | yes | Ch 9, 14–16 |
| 79 | **partly** | Ch 13 and 14–16 only; not in Ch 3 as logged (C1) |
| 80 | yes | each episode’s Reveal lead |
| 81 | yes | Ch 7, 10 |
| 82 | yes | Lure part superseded by 88 |
| 83 | yes | Ch 7, 9 box |
| 84 | yes | |
| 85 | yes | Ch 7, 10 (not the quick reference: M6) |
| 86 | yes | Ch 5 |
| 87 | yes | |
| 88 | yes | printed, but the ruling says it awaits Richard’s approval (M26) |
| 89 | **differs** | Ch 10’s wording goes further than the ruling and contradicts itself (B2) |
| 90 | yes | Ch 2, 5, 9, quick reference |
| 91 | yes | Ch 2, 3, 7, quick reference |
| 92 | yes | Ch 7, 9, 10, quick reference |
| 93 | yes | Ch 9, 14–16 |
| 94 | yes | Ch 5, 7, quick reference |
| 95 | yes | Ch 3, 5, quick reference (not Ch 13: M5) |
| 96 | yes | Ch 4, guardian sheet |
| 97 | yes | Ch 4 |
| 98 | yes | Ch 7 box and Timing |
| 99 | yes | Ch 4, 5, sheets |
| 100 | yes | Ch 3, 7, 10 |
| 101 | yes | Ch 6, 7, 9 |
| 102 | yes | Ch 2, 12 |
| 103 | yes | Ch 4, 9 |
| 104 | yes | Ch 14–16, witch sheet |
| 105 | simulator | Ch 9’s quoted figures weren’t updated (M1) |

### 1g. The glossary against the chapters
Every entry matches how the chapters use it. Gaps: M10, M11, M12, M13.

---

## 2. A full session, walked through

A Standard episode (Cinders) for four players, one playing Rook (w = 3, n = 4), run strictly by the book. "**Ruling needed**" marks every point where the Storyteller would have to invent something.

1. **Setup.** Pick witches and Rook (Ch 12), read off 15 Clues (half 8), Toughness 9, 2 attacks a round and Unmaking 3/5 (Ch 9 lookup), and cross out Exposure box 5. Smooth. The tracker has nowhere to write n (M7). The "guardian called" step is unclear (M8).
2. **Opening.** Read it aloud and hand out the Life calls. "The opening isn’t a scene" settles the players who chase the woman in the dress. Smooth.
3. **Scene 1.** Leads, Book research, brewing, resting, covering up and Life calls are all covered. **Ruling needed:** can two witches take the same lead this scene (M14)? Does Veil fit Book research (C1)? A helper at home phoning a witch in the city is covered (Ch 2).
4. **Costs.** Hurt or Exposure, and Hide’s cost, are clear. If the Storyteller calls a group check (Ch 2’s tide example), **ruling needed** on what a Failure means and who is "worst" (C3).
5. **End of a scene.** Doom +1, the mark, then half the Clues: clear (Ch 6 box). A lead that crosses half tells them what and where (Ch 9).
6. **Going to the threat (hidden showdown).** No scene is spent; there is no Exposure; Life penalties apply. Round 1: the threat attacks first; on a tie, roll a die. Shield before Sight’s Surge. Clear.
7. **Public showdown (if they wait).** The innocent is in its grip; free her in round 1 with a Success. Then **ruling needed:** after Rook Carries Hannah away, is Rook still in the fight to Shield and Hold (B1)? Could Rook carry a Down witch out instead (B1)?
8. **Signature moves.** Cinders is clear. If the episode is Night Market or the Mirror Thief: **ruling needed** on whether a Hushed witch can use a potion, or a Hushed guardian can Hold (B2); whether a Shielding guardian loses Ward to Borrowed Face (C4); and what a two-target move does when only one character is standing (C6).
9. **Edge cases in the fight.** **Ruling needed** when a Partial Hold or Shelter puts the roller Down (C5), and on whether a Critical’s extra die must go on an unwanted defence roll (M16). Lure’s Heart roll: can others help (M17)?
10. **Broken and the Unmaking.** Clear and well taught (the Timing paragraph and the worked showdown). Exposure from a failed try is stated (ruling 98).
11. **The end.** The "ends at once" list, the round-end order, the results table, Seen, Scars and retreat are all clear.
12. **Closing and carry-over.** Book page (rounded up), returning threats, growth, season Toughness and new witches: all clear. Chapter 8’s "starts fresh … Clues at 0" needs the Book-page exception (M9).

**In short:** the two blockers and eight confusing items are the only places a careful Storyteller would have to stop and invent. Everything else in a full session is answered by the book, usually in one place.

---

## 3. Worked examples (every die, total and result re-checked)

| Chapter | Example | Result |
|---|---|---|
| 2 | A Critical (June: Wits 3 + Sight 2 + 1 helper = 6 dice; 6,6,5,2,1,1 against 2) | correct: 3 successes, two 6s, Critical, 2 Clues |
| 2 | Leaving the Power off (Tess: 2 + Life + Magic = 4; 5,3,2,1) | correct: Partial, 1 Hurt |
| 2 | Group check (Dana 4,4,2; Tess 6,3,1; June 2) | correct |
| 2 | Odds table (24 cells) | correct by exact calculation (half-up rounding) |
| 3 | Making a witch (Ruth) | correct: rerolls follow the rules; ratings 3/2/2/1 |
| 4 | Rook in a fight (Hold 5,4,1; defence 4,2; Shield 6,4) | correct; Ward 3 → 2 → 1; Hurt 2 then 3 of 5 |
| 5 | Covering up (Quinn: 4 dice; 6,4,2,1; 3 Magic) | correct; Exposure 3 → 1 |
| 5 | Brewing (Noor: 5 dice; 6,6,4,2,1) | correct: Critical, 3 made, 1 lost to the cap of 4 |
| 6 | A scene in Cinders (two scenes; Clues 6 → 9 → 13; Magic and Ward) | correct throughout; half of 15 is 8 |
| 7 | The Ash Widow (setup, rounds 1–3) | correct throughout: every defence, study, damage total (5, 3, 2), Toughness 9 of 9, both Unmaking rolls (6 dice Partial, 8 dice Success), and every Magic and Ward count |
| 7 | Unmaking odds (8 dice: 86% at 3, 36% at 5) | correct (85.5%, 36.3%) |
| 7 | Freeing the innocent (Night Market) | correct: Toughness 12, damage 4, Exposure 2 → 3 |
| 8 | Four episodes of a season | correct: Toughness 18 and 22; growth and new-witch raise |
| 9 | 3-dice odds (88 / 50 / 13%) | correct |
| 9 | Go now, or stay? | correct (see M19 for the coven change) |
| 9 | The threat’s turn (5,4,1; 6,4,2) | correct |
| 10 | Toughness (15, then 12) and season Toughness (20, 28) | correct |
| 10 | A signature move (Cinders: 6,4,2; 5,5,4,3,1; 2) | correct |
| 11 | The Face in the Glass (rolls 3,6,2,5,6,4; the numbers box) | correct |
| 12 | Four players with Rook (Easy numbers); practice roll (6,4,2) | correct |
| 12 | Low Tide in a season (24) | correct |
| 1, 12 | Dice needed (13, or 14 with Craft 4) | correct: 3 + 8 + 2, and 4 + 8 + 2 |

No arithmetic errors found.

---

## 4. Terminology, typos, cross-references, the show’s terms, AI

- **Cross-references:** all 130 "Chapter N" references were listed and checked; each points to the chapter that holds the rule. **No wrong pointers.**
- **Typos:** a scripted scan for doubled words, stray spaces, missing spaces and unbalanced brackets or quotes found none. British spelling is consistent (Defence, colour, harbour).
- **Terminology drift:** C2 (success/Success), M10 (Partial), M11 (ward), M12 (call, scene, lead, turn, "hurt it", the names for Sight’s miss).
- **The show’s terms (`DESIGN.md` §2):** none found. Searched for Charmed, Charmed Ones, the Power of Three, whitelighter, darklighter, orbing, the Elders, the Source, Halliwell, Prescott, manor, triquetra, Book of Shadows, Vanquish, the sisters’ and guardian’s names, P3 and San Francisco. "Warden" and "Harm" (Richard’s other games) are also absent. The one judgement call is Larkhaven’s fog, ferries and steep streets (M24).
- **AI, assistants or software:** none of these are named or credited anywhere in the book or the HTML source. Two borderline items: "36,000 simulated episodes" (M2), and the PDF’s file properties (M3). The "Foundry VTT" credit is the online version, not a tool that helped make the book.

---

## 5. Plain English

The book is mostly short and plain. The passages that are hard to follow are C7 (the Hold paragraphs), C8 (the quick reference’s investigation sentence), B2 (the Hush text), M21, M22, M23, M27 and M28. Two more could be shorter:
- Ch 10 (p41) and Ch 16 (p68), Lure: 45 words before the italic details. Split it: "One attack. Then the standing character with the lowest Heart rolls Heart against Danger. On a Failure they lose their next action. (No Power fits this roll, it isn’t casting, and it never causes Hurt.)"
- Quick reference: Magic (p77), "Showdown details": a 52-word sentence on Hold. Replace it with the C7 table.

---

## Appendix A. `DESIGN-RULES.md` Part A, pass or fail

| Rule | Result | Note |
|---|---|---|
| A1 every state of every track | pass | Hurt, Magic, Ward, Exposure, Doom, Toughness and Clues all defined; numbers fixed at the start |
| A2 one event, one rise | pass | once per round or scene everywhere |
| A3 no cheap undo | pass | |
| A4 losing costs at every stage | pass | Scars, returning threats, the Loss result |
| A5 no free spend | pass | casting after Seen and Broken is free by ruling 60 (by design) |
| A6 no dominated option | open | not re-simulated; Shelter is never cast by the simulator (`sim/notes.mjs`) |
| A7 resources spent | pass | spend advice in Ch 3, 7, 12 |
| A8 nothing skips a roll | pass | |
| A9 every option matters | partly | Lives in the episodes (M20); Shelter unmodelled |
| A10 limits stated | pass | |
| A11 one source of truth | partly | C1, M5, M6, the CORE differences (§1e) |
| A12 literal at start and end | pass | round 1, the first scene and the end checks all read correctly |
| A13 "there is none" | fail | C4, C5, C6 |
| A14 consumables | pass | |
| A15 order of resolution | fail | B1, C5 |
| A16 one meaning per term | fail | C2, M10–M12 |
| A17 examples correct and teach good play | pass | §3 |
| A18 say the true cost | pass | "That is the guardian’s true cost" (Ch 4) |
| A19–A21 simulated; labels; 3/4/5 players | pass | `sim/REPORT.md`; Ch 9 figures 1 point stale (M1) |
| A22 clocks bind | pass, with a note | the mark binds (21% Standard, 34% Hard); Exposure rarely fills (Seen 0 / 5 / 9% in `sim/REPORT.md`) |
| A23 partial wins are partial | pass | |
| A24 long events capped | pass | Doom caps every showdown |
| A25 scenarios | pass | maps match text; two or more ways in and out; no rolls to get past; every threat has the d6 procedure |
| A26 generators validated | not run | the generator wasn’t rolled 50–100 times in this pass; no unplayable combination found on reading |

## Appendix B. Scripts used
- **Odds:** exact binomial odds, p = ½ per die, for 2–7 dice at Difficulty 1–4. Success = at least D successes; Partial = at least ⌈D/2⌉ but fewer than D (none at D 1). Each figure rounded half up and compared with the Ch 2 table. All 24 cells match.
- **Numbers:** read the tables out of `21-ch09.html`, `23-ch11.html` and `32`–`34-ch1x.html`, and recomputed each cell from the Ch 6 table: Toughness = 3w / 3w / 4w, +3 if w = 3 with no guardian player, +2w for the season column; Clues = 3n / 4n − 1 / 4n, half rounded up; attacks = 1 if n = 3, else 2; Unmaking = w. 0 mismatches.
- **Text checks:** listed every "Chapter N" with its context; scanned for doubled words, spacing and brackets; searched for the show’s terms and for AI, assistant or software words; found PDF pages by searching each page’s text.
