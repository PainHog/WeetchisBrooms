# Core rules v0.4: review

A rules review of `docs/CORE-RULES.md` v0.4 (`docs/REVIEW-PROCEDURE.md` §1), done before the two real-dice playtests in `sim/playtests/`. The combined findings and the fixes made are at the end.

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
