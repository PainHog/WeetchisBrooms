# Core rules review: v0.4 to v0.7

The review procedure (`docs/REVIEW-PROCEDURE.md`) run on the core rules: a rules review of v0.4 (§1 below), two real-dice playtests of v0.4 (§2), the fixes made in v0.5 and v0.6 (§3), and a verification playtest of v0.6 with the v0.7 fixes (§4).

## 1. Rules review

### Issues

| # | Severity | Passage | Problem | Fix |
|---|---|---|---|---|
| R1 | blocker | "The episode ends when … every witch is Down" | Read literally (A12), an episode ends if every witch is Down during the investigation, but the same page lets Down characters rest there. | "every witch is Down in the showdown". |
| R2 | blocker | "1–3 it attacks whoever hurt it last" | Nobody has hurt it in round 1, or that character is Down (A13). | "(if nobody has, or they're Down, whoever is most hurt)". |
| R3 | confusing | "4–5 whoever is most hurt and still standing" | No tie rule; at the start everyone is tied (A13). | "Ties: the Storyteller picks." |
| R4 | confusing | "Shield … someone near it" | There is no map, so "near" is undefined (A13). | "In a showdown everyone counts as near." |
| R5 | confusing | "hold": the guardian's **Hold**, the threat **holding** the innocent, and a Vanquish where the threat "holds on" | One word, three meanings (A16). | The innocent is **in its grip**; a missed Vanquish means the threat "isn't destroyed". |
| R6 | confusing | "**Magic** means a Power, a spell, a potion or a guardian gift" | "Magic" is also the witches' points (A16). | Call the category **casting**. |
| R7 | confusing | Threat stat **Attack** | Also the everyday verb "attack" (A16). | Rename the stat **Danger**. |
| R8 | confusing | "**Critical:** … it does one thing extra" | Only some actions say what the extra is (A3, A11). | A default: +1 damage, +1 Clue, +1 potion or −1 more Exposure, as fits; otherwise +1 die on your next roll. |
| R9 | blocker | Wild's Surge | The simulator gives Wild "1 more Clue" on a lead, like Sight and Voice; the page only gives the showdown effect (A11). | Match the page to what was tested: Wild's Surge gives 1 more Clue on a lead, or the Defence effect in a showdown. |
| R10 | confusing | "In a round, resolve the characters' actions, then the threat's attacks, then Exposure, then Doom" | When "the end of the first round" check for the innocent happens isn't in the list (A15). | Add it after the threat's attacks. |
| R11 | confusing | "If Doom reaches the Showdown mark (5) first" | If the coven gets the Clues in the same scene that Doom reaches the mark, which comes first? (A15) | "The coven decides whether to go at the end of a scene, after Doom rises; if Doom has reached the mark, it's too late." |
| R12 | minor | "the threat loses its next attack" (Bind, Force, Binding) | Do several add up? (A15) | "Each one cancels one attack; they add up." |
| R13 | minor | "Using one takes no action" (potions) | When? Can a Down witch use one? (A15) | "On your turn, on yourself or someone near you." (A Down witch can't take a turn.) |
| R14 | minor | "Every other witch may join" (Vanquish) | A standing witch who already acted this round? (A15) | "…who hasn't acted this round". |
| R15 | confusing | Hide in a public showdown | Hide is casting, so it raises that round's Exposure as it lowers it; it does nothing there unless Critical (A6). | "Casting Hide never raises Exposure." |
| R16 | minor | Clues needed, Toughness | Do they change if a player leaves or joins mid-episode? (A1) | "Set the numbers at the start of the episode; they don't change." |
| R17 | minor | Clues, Toughness | What happens to extra Clues or damage past the total? (A1) | "Extra is lost." |
| R18 | minor | "destroyed threats get a page in the Book (next time, start knowing what it is)" | "Knowing what it is" is half the Clues; say so. A threat that won (Doom filled) has no carry-over, so a Loss costs nothing in a season (A4, A18). | "start with half the Clues"; "A threat that wasn't destroyed comes back later with 2 more Toughness." |

### Part A, pass or fail

| Rule | Result | Note |
|---|---|---|
| A1 every state of every track | fail → fixed | R16, R17 |
| A2 one event, one rise | pass | Public Exposure once a round; group checks one cost |
| A3 no cheap undo | pass | Hide, Voice and healing all cost Magic or Ward and an action or a brew; R8 keeps Criticals off the threat tracks |
| A4 losing costs at every stage | fail → fixed | R18 |
| A5 no free spend | pass | Spending at the end of an episode is the point ("spend it") |
| A6 no dominated option | fail → fixed | R15; brewing fixed in v0.4 |
| A7 resources spent | pass | Simulator: median witch spends 83% of Magic |
| A8 nothing skips a roll for free | pass | Potions are paid for by a brewing roll; Carry and Sense cost Ward |
| A9 every option matters | open | Needs the ready-made episodes; Shelter isn't modelled yet |
| A10 limits stated | pass | Scene, episode and per-round limits all defined |
| A11 one source of truth | fail → fixed | R8, R9 |
| A12 literal at start and end | fail → fixed | R1 |
| A13 "there is none" | fail → fixed | R2, R3, R4 |
| A14 consumables | pass | Potions spoil; points reset |
| A15 order of resolution | fail → fixed | R10–R14 |
| A16 one meaning per term | fail → fixed | R5, R6, R7 |
| A17 examples | n/a | None yet |
| A18 say the true cost | fail → fixed | R18 |
| A19–A21 simulated, labels from results, 3/4/5 players | pass | `sim/REPORT.md` |
| A22 clocks bind | pass | The mark forces about 1 showdown in 4; Exposure presses most public fights |
| A23 partial wins are partial | pass | |
| A24 long events capped | pass | Doom caps every showdown |
| A25–A26 scenarios and generators | n/a | After approval |
| A27 first night | open | Biggest roll is a 5-witch Vanquish: up to 13 dice. Say so in the first-night chapter |
| A28 sheets | n/a | After approval |
| A29 one-card round | pass | 5 steps: actions, threat, innocent, Exposure, Doom |

## 2. Playtests (v0.4, real dice, every roll logged)

| Test | Table | Result | Report |
|---|---|---|---|
| A, first night | Easy, 3 new players, no guardian player | Win; the threat never attacked. Setup about 30–45 minutes, play about 65 | `sim/playtests/test-a-first-night.md` (26 issues) |
| B, rowdy table | Hard, 4 witches and a guardian player, waiting for the Weakness on purpose | Win; the threat never attacked (Bind plus a Binding potion cancelled both attacks). Losses happened in the drills | `sim/playtests/test-b-rowdy-hard.md` (38 issues) |

What both found most: free potions (no roll, no action) and stacked "loses its next attack" made threats harmless; half the Clues and the Showdown mark in the same scene; target rules with no answer for "nobody" or ties; undefined Critical extras; "Magic", "attack" and "hold" with two or more meanings; Book research not saying what it rolls; casting free once Seen. Test B also flagged "Vanquish" as the show's word.

## 3. Fixes

- **v0.5** (`book/REVIEW.md` #20–32): every review item R1–R18 and playtest A's issues: go-or-wait timing, Book research as a lead, Life timing, one meaning per word (casting, Danger, in its grip), target fallbacks and ties, guard and free outcomes, the default Critical extra, Hide never raising Exposure, Seen feeding Doom, at most one potion per character, numbers fixed at the start, Loss carry-over.
- **v0.6** (`book/REVIEW.md` #33–42): playtest B: "Vanquish" renamed **the Unmaking**; Blasting adds damage to an attack instead of skipping the roll; at most one lost attack a round; a Partial brew makes one potion; Sense's die outside the +2 limit; Wild can Surge for a potion; Shelter, Hold, Sight, group checks, retreat and the guardian settled; a d6 Life table; threats grow with the witches in a season.
- **Simulator after the fixes** (`sim/REPORT.md`): wins 87 / 73 / 56% and losses 0 / 9 / 26% for Easy / Standard / Hard; every Power within 1.5 points; a guardian player within about 5 points of an extra witch; seasons steady at about 74–80% (Standard) and 55–65% (Hard).

## 4. Verification of v0.6, and v0.7

`sim/playtests/verify-v0.6.md` (Standard, 3 witches and a guardian player, real dice): of the 64 earlier issues, 39 fixed, 13 partly fixed, 4 unchanged by choice, 8 changed differently. The episode was a Win, but the threat again made no attacks: with the Weakness known, a coven Broke it in round 1 before it acted about 90% of the time. 18 new issues, mostly small.

- **v0.7** (`book/REVIEW.md` #43–51): the threat acts first in round 1; Binding needs a working attack; extra lost attacks are wasted; Shield once a round; Shelter and guarding end if you go Down; Toughness 3w / 3w / 4w; season threat growth of 2 Toughness per witch after the 2nd and 4th episodes; the verification's small items.
- **Simulator after v0.7** (`sim/REPORT.md`): wins 85 / 73 / 59% and losses 0 / 8 / 23% (Easy / Standard / Hard); a witch goes Down in 39% of Standard and 61% of Hard episodes; every Power within 1.5 points; a guardian player within 5 points of an extra witch; seasons hold at 72–78% (Standard) and 55–64% (Hard) over 8 episodes.
- **Next step in the procedure:** a second verification playtest of v0.7 before the chapters (Part D asks for two clean playtests in a row).

## 5. Still open

- Every group size within 5 points of the label's target: Easy runs 80–90% (5 witches lowest) and Standard 67–79%.
- Easy sits at 85% wins (target ~90%): the only lever found jumps it to 96%.
- Criticals are 12–13% of rolls (target 15–25%): pools are small. Could count a Critical on any success with a 6 when the pool is 3 dice or fewer, if it matters at the table.
- At Easy the guardian spends little Ward and half the potions go unused: Easy fights are short (2 rounds). Acceptable for a first night.
- The page is now about 2,200 words: a dense page, not a short one. The chapters will spread it out; a one-card round summary and a quick reference come with the chapters.
- Ready-made content (episodes, threats, the home) and the first-night pack wait for Richard's approval of the core.
