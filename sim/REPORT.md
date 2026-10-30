# Witch & Ward: simulator report

Rules: `docs/CORE-RULES.md` v0.3. Command: `node sim/run.mjs --runs 2000 --seed 1 --sweep-runs 500`. 2,000 episodes per cell, 36,000 in all. Same seed, same report.

A **cell** is one difficulty label, one number of players (3, 4 or 5), with or without a guardian player. With a guardian player, one player plays the guardian and the rest play witches. **Win / Partial / Loss** are the episode results from CORE-RULES "The end".

## 1. Against the targets

| Target (DESIGN Q16) | Easy | Standard | Hard | On target? |
|---|---|---|---|---|
| Win: Easy ~90%, Standard ~75%, Hard 55–60% | 87% | 73% | 59% | yes |
| Loss: Easy ≤5%, Standard 5–15%, Hard 15–30% | 0% | 8% | 19% | yes |
| Every cell within 5 points of its label's win target | 84–90% | 69–77% | 58–62% | **no** |
| Guardian player within 5 points of an extra witch | 2.4 / 3.1 / 1.6 | 2.9 / 3.4 / 4.5 | -2.9 / 0.3 / 4.4 | yes |
| Showdown: median 3–5 rounds | 3 (90%: 3, most 7) | 3 (90%: 4, most 9) | 4 (90%: 5, most 9) | yes |
| A witch Down: Easy ≤15%, Standard ≥25%, Hard ≥40% of episodes | 0% | 14% | 38% | **no** |
| Criticals 15–25% of rolls | 14% | 15% | 14% | **no** |
| Failures 10–20% of rolls | 11% | 11% | 13% | yes |
| The median witch spends at least half of their Magic | 83% | 83% | 83% | yes |
| The guardian spends at least half its Ward (median) | 40% | 60% | 60% | **no** |
| 70% or more of brewed potions get used | 66% | 73% | 80% | **no** |
| Seen in 5–15% of Standard episodes | 0% | 8% | 15% | yes |
| The Showdown mark forces a public fight in 15–40% of episodes | 3% | 27% | 39% | yes |
| Every Power within 5 points of the average | Force -0.5, Flame -0.6, Sight +0.1, Voice +0.7, Veil -1.5, Wild +1.8 | | | yes |

The public-fight row is pooled over all labels (23%); the guardian row reads 3 / 4 / 5 players (points of win rate, guardian minus witch).

## 2. Win, Partial and Loss by cell

| Label | Players | Guardian player | Witches | Win | Partial | Loss | Threat destroyed | Threat fled | Doom filled | Every witch Down |
|---|---|---|---|---|---|---|---|---|---|---|
| Easy | 3 | no | 3 | 87% | 13% | 0% | 87% | 13% | 0% | 0% |
| Easy | 3 | yes | 2 | 90% | 10% | 0% | 90% | 10% | 0% | 0% |
| Easy | 4 | no | 4 | 85% | 15% | 0% | 85% | 15% | 0% | 0% |
| Easy | 4 | yes | 3 | 88% | 12% | 0% | 88% | 12% | 0% | 0% |
| Easy | 5 | no | 5 | 84% | 16% | 0% | 84% | 16% | 0% | 0% |
| Easy | 5 | yes | 4 | 86% | 14% | 0% | 86% | 14% | 0% | 0% |
| Standard | 3 | no | 3 | 74% | 17% | 10% | 78% | 16% | 0% | 6% |
| Standard | 3 | yes | 2 | 77% | 15% | 8% | 80% | 15% | 0% | 5% |
| Standard | 4 | no | 4 | 71% | 21% | 7% | 77% | 21% | 0% | 2% |
| Standard | 4 | yes | 3 | 75% | 17% | 9% | 79% | 16% | 0% | 5% |
| Standard | 5 | no | 5 | 69% | 23% | 8% | 75% | 24% | 0% | 1% |
| Standard | 5 | yes | 4 | 74% | 21% | 5% | 78% | 21% | 0% | 1% |
| Hard | 3 | no | 3 | 61% | 16% | 23% | 66% | 20% | 0% | 14% |
| Hard | 3 | yes | 2 | 58% | 22% | 21% | 64% | 22% | 0% | 14% |
| Hard | 4 | no | 4 | 59% | 22% | 19% | 65% | 26% | 0% | 9% |
| Hard | 4 | yes | 3 | 59% | 20% | 21% | 67% | 20% | 0% | 13% |
| Hard | 5 | no | 5 | 58% | 25% | 17% | 67% | 29% | 0% | 5% |
| Hard | 5 | yes | 4 | 62% | 24% | 14% | 72% | 24% | 0% | 5% |

A Partial is a threat that fled, or a destroyed threat whose innocent was lost; being Seen also drops a Win to a Partial and a Partial to a Loss.

## 3. How episodes play out

| | Easy | Standard | Hard |
|---|---|---|---|
| Investigation scenes (median) | 3 | 4 | 4 |
| Doom when the showdown starts (mean, mark 5) | 3.3 | 4.2 | 4.4 |
| Weakness known when the showdown starts | 100% | 95% | 89% |
| Showdown mark reached: public fight with the innocent there | 3% | 27% | 39% |
| Showdown rounds: median / 90% / most | 3 / 3 / 7 | 3 / 4 / 9 | 4 / 5 / 9 |
| Vanquish rolls that destroy the threat | 87% | 81% | 74% |
| Seen (Exposure full) | 0% | 8% | 15% |
| Public fights where Exposure pressed (a round without magic, or Seen) | 29% | 75% | 87% |
| Innocent lost | 0% | 2% | 4% |

## 4. Witches taken out

| | Easy | Standard | Hard |
|---|---|---|---|
| Episodes with at least one witch Down | 0% | 14% | 38% |
| Witches Down per episode | 0.0 | 0.2 | 0.7 |
| Share of all witches who go Down | 0% | 7% | 20% |
| Guardian Down (episodes with a guardian player) | 0% | 18% | 37% |

Nobody dies from the dice; Down means out of action until mended or the episode ends.

## 5. Rolls and resources

| | Easy | Standard | Hard |
|---|---|---|---|
| Player rolls per episode | 16 | 22 | 25 |
| Criticals / Partials / Failures (share of rolls) | 14% / 1% / 11% | 15% / 27% / 11% | 14% / 28% / 13% |
| Magic spent by the median witch | 83% | 83% | 83% |
| Witches who spend at least half their Magic | 100% | 99% | 98% |
| Witches who answer their Life | 67% | 64% | 64% |
| Ward spent by the median guardian | 40% | 60% | 60% |
| Guardians who spend at least half their Ward | 14% | 68% | 74% |
| Potions brewed per episode / share used | 0.9 / 66% | 1.0 / 73% | 1.0 / 80% |
| No guardian player: the call is used | 3% | 35% | 61% |

## 6. What gets used

Average uses per episode (gifts per episode with a guardian player; the call per episode without one).

| | Easy | Standard | Hard |
|---|---|---|---|
| Leads followed out in the city | 6.04 | 9.05 | 9.60 |
| Book research at home | 2.66 | 3.03 | 3.17 |
| Reveal (spell) | 2.49 | 0.75 | 0.82 |
| Life answered | 2.35 | 2.25 | 2.25 |
| Rest | 0.00 | 0.04 | 0.05 |
| Hide (spell) | 0.01 | 0.27 | 0.29 |
| Plain attacks (Nerve) | 2.16 | 3.69 | 5.52 |
| Blast (spell) | 1.50 | 0.74 | 0.62 |
| Bind (spell) | 0.29 | 0.46 | 0.44 |
| Study the threat | 0.00 | 0.27 | 0.61 |
| Guard the innocent (rounds) | 0.03 | 0.33 | 0.50 |
| Vanquish attempts | 1.00 | 0.96 | 0.90 |
| Surge: Force | 0.11 | 0.12 | 0.08 |
| Surge: Flame | 0.11 | 0.12 | 0.09 |
| Surge: Sight | 0.61 | 0.83 | 1.10 |
| Surge: Voice | 0.20 | 0.67 | 0.67 |
| Surge: Veil | 0.00 | 0.03 | 0.04 |
| Surge: Wild | 0.03 | 0.03 | 0.02 |
| Potions brewed: Blasting / Healing / Binding | 0.30 / 0.31 / 0.31 | 0.32 / 0.33 / 0.32 | 0.32 / 0.33 / 0.32 |
| Potions used: Blasting / Healing / Binding | 0.30 / 0.01 / 0.30 | 0.32 / 0.08 / 0.31 | 0.32 / 0.14 / 0.32 |
| Guardian: Mend | 0.13 | 0.90 | 1.08 |
| Guardian: Shield | 0.03 | 0.08 | 0.08 |
| Guardian: Carry | 0.03 | 0.17 | 0.25 |
| Guardian: Sense | 1.95 | 1.99 | 2.00 |
| Guardian: Hold | 2.33 | 0.67 | 0.59 |
| No guardian player: call for Carry / Mend | 0.02 / 0.01 | 0.24 / 0.11 | 0.35 / 0.26 |

## 7. Powers

Win-rate difference for covens that include each Power, compared with the average of the same cell (all labels and sizes pooled).

| Power | Win difference | Witch goes Down | Damage dealt per episode |
|---|---|---|---|
| Force | -0.5 points | 9% | 4.7 |
| Flame | -0.6 points | 11% | 5.4 |
| Sight | +0.1 points | 6% | 2.4 |
| Voice | +0.7 points | 12% | 2.5 |
| Veil | -1.5 points | 6% | 4.4 |
| Wild | +1.8 points | 9% | 1.8 |

## 8. Guardian player or one more witch

| Label | Players | All witches: win / loss | With a guardian player: win / loss | Difference in win |
|---|---|---|---|---|
| Easy | 3 | 87% / 0% | 90% / 0% | +2.4 |
| Easy | 4 | 85% / 0% | 88% / 0% | +3.1 |
| Easy | 5 | 84% / 0% | 86% / 0% | +1.6 |
| Standard | 3 | 74% / 10% | 77% / 8% | +2.9 |
| Standard | 4 | 71% / 7% | 75% / 9% | +3.4 |
| Standard | 5 | 69% / 8% | 74% / 5% | +4.5 |
| Hard | 3 | 61% / 23% | 58% / 21% | -2.9 |
| Hard | 4 | 59% / 19% | 59% / 21% | +0.3 |
| Hard | 5 | 58% / 17% | 62% / 14% | +4.4 |

## 9. Exact odds of the core roll

Chance of Success or better / Partial / Failure (4, 5 or 6 is a success). Difficulty 1 has no Partial.

| Dice | Difficulty 1 | Difficulty 2 | Difficulty 3 | Difficulty 4 |
|---|---|---|---|---|
| 1 | 50 / 0 / 50 | 0 / 50 / 50 | 0 / 0 / 100 | 0 / 0 / 100 |
| 2 | 75 / 0 / 25 | 25 / 50 / 25 | 0 / 25 / 75 | 0 / 25 / 75 |
| 3 | 88 / 0 / 13 | 50 / 38 / 13 | 13 / 38 / 50 | 0 / 50 / 50 |
| 4 | 94 / 0 / 6 | 69 / 25 / 6 | 31 / 38 / 31 | 6 / 63 / 31 |
| 5 | 97 / 0 / 3 | 81 / 16 / 3 | 50 / 31 / 19 | 19 / 63 / 19 |
| 6 | 98 / 0 / 2 | 89 / 9 / 2 | 66 / 23 / 11 | 34 / 55 / 11 |
| 7 | 99 / 0 / 1 | 94 / 5 / 1 | 77 / 16 / 6 | 50 / 44 / 6 |
| 8 | 100 / 0 / 0 | 96 / 3 / 0 | 86 / 11 / 4 | 64 / 33 / 4 |

Critical (a success with two or more 6s) at Difficulty 2: 3 dice 7%, 4 dice 13%, 5 dice 20%, 6 dice 26%.

## 10. Judgement calls and player habits

Each row changes one setting and re-runs Standard and Hard (500 episodes per cell, same seed). The first row is the default.

| Setting | Value | Standard win / loss | Hard win / loss |
|---|---|---|---|
| (defaults) | — | 73% / 8% | 60% / 18% |
| judgement: signature | heavy | 73% / 8% | 61% / 18% |
| judgement: fightPartialCost | none | 75% / 6% | 62% / 15% |
| judgement: investigationCost | none | 83% / 2% | 73% / 10% |
| judgement: brokenFlees | thisRound | 17% / 9% | 12% / 21% |
| judgement: bookPerScene | 99 | 74% / 8% | 62% / 18% |
| players: magic | careful | 69% / 13% | 56% / 28% |
| players: go | weaknessOrLate | 71% / 8% | 60% / 17% |
| players: go | asap | 21% / 42% | 10% / 67% |
| players: go | waitForWeakness | 74% / 7% | 61% / 17% |
| players: life | always | 71% / 11% | 55% / 25% |
| players: life | never | 74% / 4% | 63% / 11% |
| players: brew | none | 76% / 5% | 64% / 13% |
| players: brew | two | 70% / 11% | 56% / 24% |
| players: ratings | random | 72% / 9% | 57% / 20% |
| players: publicCare | reckless | 71% / 8% | 54% / 18% |
| preset | generous (every open rule read for the players) | 83% / 2% | 76% / 8% |
| preset | strict (every open rule read against them) | 17% / 9% | 12% / 21% |
| rules | v0.1 Vanquish (1 die per joiner, fixed Difficulty, Partial destroys) | 81% / 6% | 71% / 14% |
| rules | v0.2 innocent (not held at the start of a public showdown) | 76% / 6% | 66% / 14% |
| rules | v0.2 Weakness (no Defence +1 without it, no extra damage with it) | 71% / 9% | 54% / 23% |
| rules | candidate: potions need no action | 75% / 7% | 63% / 16% |
| rules | candidate: potions need no action, and the Book researcher may also brew | 77% / 4% | 65% / 12% |
| rules | success on 5–6 instead of 4–6 | 18% / 57% | 8% / 77% |

What each setting means:

- **judgement: signature** — The generic signature move on a 6 when no innocent is exposed: attack two different characters (double), or one attack whose Hit is 1 higher (heavy). (CORE-RULES The threat: '6 its signature move' (each threat's own move is content, not yet written))
- **judgement: fightPartialCost** — Whether a Partial attack in a fight costs 1 Hurt (hurt) or nothing (none, the generous reading). (CORE-RULES Showdown: 'a Partial 1 with a cost')
- **judgement: investigationCost** — Whether lead and brewing Partials/Failures cost 1 Hurt or Exposure as the Cost rule says (rule), or the Storyteller always picks a story cost with no track effect (none). (CORE-RULES The roll: 'Cost')
- **judgement: brokenFlees** — A Broken threat flees at the end of the next round (nextRound), or at the end of the round it broke (thisRound, strict). (CORE-RULES The threat: 'it flees at the end of the next round')
- **judgement: bookPerScene** — How many characters may research the Book at home in one scene. (CORE-RULES Extra dice: 'the Book (+1 to Wits for research at home)')
- **players: magic** — spendy: in the showdown spend everything above 2 Magic (kept for the Vanquish); in investigation spend above 3. careful: keep 3 in the showdown and spend nothing in investigation.
- **players: go** — When the coven goes to the threat. gamble: as soon as it knows the Weakness; with half the Clues and one scene before the Showdown mark, it stays one more scene (and will be found) if the missing Clues look reachable in one scene, otherwise it goes. weaknessOrLate: the Weakness, or half the Clues one scene before the mark. asap: as soon as it has half. waitForWeakness: only with the Weakness, even if that means being found.
- **players: life** — spare: a witch answers their Life when their best lead is no better than the coven's median and Doom is at least 2 short of the mark; always: everyone answers in scene 1; never: everyone lets it slide.
- **players: brew** — How many brewing actions the best brewer takes once the coven has half the Clues and time to spare.
- **players: ratings** — sensible: the 3 goes where the Power is used most; random: any legal spread.
- **players: publicCare** — careful: in a public showdown with Exposure one short of full, the coven uses no magic that round; reckless: it never holds back.

## 11. Rule gaps and findings

| Kind | Finding | Rules passage | Reading used | Settled |
|---|---|---|---|---|
| gap | When can a Surge be used in a showdown? | Powers: 'once per scene' | The whole showdown counts as one scene, so each witch gets one Surge in it. A Surge works on a Partial or better. | v0.2 |
| gap | Does the Cost rule add Exposure in a public showdown on top of the once-a-round rise? | The roll: 'Cost'; Showdown | No. In a showdown the cost of a Partial or Failure is always 1 Hurt; Exposure comes only from the once-a-round rule. | v0.2 |
| gap | Where do leads happen (public or at home)? | Investigation | Leads are out in the city (public). Book research and brewing are at home and never raise Exposure. | v0.2 |
| gap | How many characters can research the Book in one scene? | Extra dice: 'the Book' | One. | v0.2 |
| gap | Can a Down character do anything during investigation? | Tracks: 'Down (can't act…)' | Yes: resting is the one action a Down character can take. | v0.2 |
| gap | Hold against a 6 that takes the innocent | The threat; Hold | Taking the innocent is not an attack, so Hold doesn't stop it. Only a guard does. | v0.2 |
| gap | Sight's Surge needs no action? | Powers: Sight | Yes: spend it when an attack is aimed at anyone. | v0.2 |
| gap | Do potions and guardian gifts count as magic in public? | Showdown: 'anyone used magic' | Yes. | v0.2 |
| gap | A Down guardian 'fades back to the home until the next scene' | DESIGN Q6 | The showdown is one scene, so a guardian that goes Down is out for the rest of it. | v0.2 |
| gap | When does an unanswered Life cost its 1 Magic? | Investigation: Life | At the start of the showdown. | v0.2 |
| broken | The Vanquish got much easier with every extra witch (v0.1) | The Vanquish | v0.1 gave 1 die per joiner against a fixed Difficulty, so 5 witches almost never failed and 2 often did. v0.2: each joiner adds 2 dice, the Difficulty is the number of witches, and only a full success destroys the threat. Win rates by group size are now within a few points. | v0.2 |
| broken | The guardian was worth 10–20 points less than another witch (v0.1) | The guardian; Toughness | Toughness now counts witches only; the guardian adds nothing to it. With that, a guardian player is within about 5 points of an extra witch. | v0.2 |
| broken | Investigation was too short and Doom never pressed (v0.1) | [T] Clues needed: n + 2 | With n + 2 Clues the coven knew the Weakness after 2 scenes and the Showdown mark was never reached. v0.2: 3 Clues per character plus a label amount. | v0.2 |
| broken | Brewing potions doesn't pay for itself | Potions; Investigation | A brewing action is a lead not followed, and the lost Clue costs more than the potion gives back: covens that never brew do 1–3 points better (§10, players: brew). Making potions free to use helps a little; free to use and brewed alongside Book research makes brewing worth about 1–2 points. Not changed yet: next on the list. | open |
| info | Players should keep 2 Magic for the Vanquish | Magic | Covens that spent down to 0 couldn't afford the Vanquish and the threat fled. The simulated players keep 2 each until the threat is Broken; the book should give that advice. | v0.2 (advice) |
| broken | The innocent was almost never lost, and going in early beat waiting for the Weakness (v0.2) | The threat; The Vanquish | In v0.2 guarding or carrying the innocent always worked, and a coven that went in without the Weakness did as well or better than one that waited and was found (Hard: 20% vs 10% losses). v0.3: a public showdown starts with the threat holding the innocent (free them in round 1 or lose them), and until the coven knows the Weakness the threat's Defence is 1 higher; once it knows, attacks that work do 1 more damage. Waiting for the Weakness and going early now come out within about a point of each other, and rushing in with half the Clues loses badly. | v0.3 (Richard, 2026-10-30) |
| broken | Small groups fell behind at Hard (v0.3 draft) | [T] Clues needed | With 3n + 4 Clues, 3-player covens found the Weakness far less often and won about 45% at Hard against 65% for 5 players. Clues are now 4 per character at Hard (and 4 per character minus 1 at Standard, 3 per character at Easy), which brings every size within a few points. | v0.3 |

## 12. What is and isn't modelled

Modelled:

- The roll, Partials, Criticals, the +2 extra-dice limit, Power dice, helpers (as the roller's own Magic) and group size.
- Investigation scenes: leads (Heart, Wits, Reveal), the Book, brewing, resting, Hide, Life calls, Sense; Clues, Doom and the Showdown mark; going to the threat.
- Showdown rounds: attacks (Nerve or Blast), Bind, potions, guarding the innocent, studying the threat, Surges for all six Powers, the threat's d6 move table, Shield, Mend, Carry, Hold, Broken, the Vanquish, Doom, public Exposure.
- The no-guardian call, Down and back up, every way an episode ends, Seen dropping the result.

Not modelled:

- No map: moving is free and everyone in a showdown is near everyone else.
- One generic threat per difficulty label; real threats will have their own signature moves (the generic one attacks two characters).
- A Life fits a lead one time in three.
- Shelter is never cast, group checks never come up, helpers are modelled as the roller spending their own Magic, and the coven never retreats (the policies use guarding and fight to the end).
- Seasons are not simulated: no Scars, growth, Book pages or returning threats. Each episode starts fresh.
- Players' story choices, romance and everyday-life scenes beyond the Life call.

## 13. The numbers used

| | Easy | Standard | Hard |
|---|---|---|---|
| leadD | 1 | 2 | 2 |
| defence | 1 | 2 | 2 |
| attack | 1 | 2 | 2 |
| hit | 2 | 2 | 3 |
| tWitch | 3 | 3 | 4 |
| cluesPer | 3 | 4 | 4 |
| cluesAdd | 0 | -1 | 0 |
| mark | 5 | 5 | 5 |
| doomMax | 12 | 12 | 12 |
| exposureMax | 5 | 4 | 4 |
| vanquishAdd | 0 | 0 | 0 |

Threat attacks per round by characters: 3: 1, 4: 2, 5: 2.

