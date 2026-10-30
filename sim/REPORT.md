# Witch & Ward: simulator report

Rules: `docs/CORE-RULES.md` v0.2. Command: `node sim/run.mjs --runs 2000 --seed 1 --sweep-runs 500`. 2,000 episodes per cell, 36,000 in all. Same seed, same report.

A **cell** is one difficulty label, one number of players (3, 4 or 5), with or without a guardian player. With a guardian player, one player plays the guardian and the rest play witches. **Win / Partial / Loss** are the episode results from CORE-RULES "The end".

## 1. Against the targets

| Target (DESIGN Q16) | Easy | Standard | Hard | On target? |
|---|---|---|---|---|
| Win: Easy ~90%, Standard ~75%, Hard 55–60% | 86% | 76% | 60% | yes |
| Loss: Easy ≤5%, Standard 5–15%, Hard 15–30% | 0% | 4% | 18% | **no** |
| Every cell within 5 points of its label's win target | 83–89% | 71–78% | 54–64% | **no** |
| Guardian player within 5 points of an extra witch | 2.3 / 3.7 / 3.6 | -0.4 / 3.1 / 4.2 | -6.0 / 0.9 / -0.4 | **no** |
| Showdown: median 3–5 rounds | 3 (90%: 4, most 9) | 4 (90%: 5, most 9) | 5 (90%: 6, most 9) | yes |
| A witch Down: Easy ≤15%, Standard ≥25%, Hard ≥40% of episodes | 1% | 21% | 57% | **no** |
| Criticals 15–25% of rolls | 13% | 14% | 13% | **no** |
| Failures 10–20% of rolls | 12% | 11% | 13% | yes |
| The median witch spends at least half of their Magic | 83% | 83% | 83% | yes |
| The guardian spends at least half its Ward (median) | 40% | 80% | 80% | **no** |
| 70% or more of brewed potions get used | 68% | 78% | 86% | **no** |
| Seen in 5–15% of Standard episodes | 0% | 4% | 12% | **no** |
| The Showdown mark forces a public fight in 15–40% of episodes | 6% | 17% | 36% | yes |
| Every Power within 5 points of the average | Force +1.2, Flame +1.0, Sight -2.7, Voice -1.2, Veil -0.2, Wild +2.0 | | | yes |

The public-fight row is pooled over all labels (19%); the guardian row reads 3 / 4 / 5 players (points of win rate, guardian minus witch).

## 2. Win, Partial and Loss by cell

| Label | Players | Guardian player | Witches | Win | Partial | Loss | Threat destroyed | Threat fled | Doom filled | Every witch Down |
|---|---|---|---|---|---|---|---|---|---|---|
| Easy | 3 | no | 3 | 87% | 13% | 0% | 87% | 13% | 0% | 0% |
| Easy | 3 | yes | 2 | 89% | 11% | 0% | 89% | 11% | 0% | 0% |
| Easy | 4 | no | 4 | 84% | 16% | 0% | 84% | 16% | 0% | 0% |
| Easy | 4 | yes | 3 | 88% | 12% | 0% | 88% | 12% | 0% | 0% |
| Easy | 5 | no | 5 | 83% | 17% | 0% | 83% | 17% | 0% | 0% |
| Easy | 5 | yes | 4 | 87% | 13% | 0% | 87% | 13% | 0% | 0% |
| Standard | 3 | no | 3 | 78% | 16% | 5% | 79% | 19% | 0% | 2% |
| Standard | 3 | yes | 2 | 78% | 17% | 5% | 80% | 17% | 0% | 4% |
| Standard | 4 | no | 4 | 74% | 22% | 4% | 75% | 24% | 0% | 1% |
| Standard | 4 | yes | 3 | 78% | 18% | 4% | 80% | 18% | 0% | 2% |
| Standard | 5 | no | 5 | 71% | 25% | 3% | 73% | 27% | 0% | 0% |
| Standard | 5 | yes | 4 | 76% | 23% | 2% | 77% | 23% | 0% | 0% |
| Hard | 3 | no | 3 | 60% | 18% | 21% | 61% | 25% | 0% | 14% |
| Hard | 3 | yes | 2 | 54% | 23% | 23% | 60% | 25% | 0% | 15% |
| Hard | 4 | no | 4 | 57% | 20% | 22% | 59% | 27% | 0% | 14% |
| Hard | 4 | yes | 3 | 58% | 21% | 21% | 66% | 21% | 0% | 14% |
| Hard | 5 | no | 5 | 64% | 23% | 13% | 66% | 29% | 0% | 5% |
| Hard | 5 | yes | 4 | 63% | 26% | 10% | 71% | 25% | 0% | 4% |

A Partial is a threat that fled, or a destroyed threat whose innocent was lost; being Seen also drops a Win to a Partial and a Partial to a Loss.

## 3. How episodes play out

| | Easy | Standard | Hard |
|---|---|---|---|
| Investigation scenes (median) | 4 | 4 | 4 |
| Doom when the showdown starts (mean, mark 5) | 3.6 | 4.1 | 4.3 |
| Weakness known when the showdown starts | 99% | 97% | 85% |
| Showdown mark reached: public fight with the innocent there | 6% | 17% | 36% |
| Showdown rounds: median / 90% / most | 3 / 4 / 9 | 4 / 5 / 9 | 5 / 6 / 9 |
| Vanquish rolls that destroy the threat | 86% | 79% | 72% |
| Seen (Exposure full) | 0% | 4% | 12% |
| Public fights where Exposure pressed (a round without magic, or Seen) | 17% | 66% | 88% |
| Innocent lost | 0% | 0% | 0% |

## 4. Witches taken out

| | Easy | Standard | Hard |
|---|---|---|---|
| Episodes with at least one witch Down | 1% | 21% | 57% |
| Witches Down per episode | 0.0 | 0.3 | 1.1 |
| Share of all witches who go Down | 0% | 9% | 31% |
| Guardian Down (episodes with a guardian player) | 0% | 17% | 46% |

Nobody dies from the dice; Down means out of action until mended or the episode ends.

## 5. Rolls and resources

| | Easy | Standard | Hard |
|---|---|---|---|
| Player rolls per episode | 20 | 23 | 29 |
| Criticals / Partials / Failures (share of rolls) | 13% / 1% / 12% | 14% / 28% / 11% | 13% / 30% / 13% |
| Magic spent by the median witch | 83% | 83% | 83% |
| Witches who spend at least half their Magic | 100% | 100% | 98% |
| Witches who answer their Life | 68% | 64% | 64% |
| Ward spent by the median guardian | 40% | 80% | 80% |
| Guardians who spend at least half their Ward | 25% | 80% | 87% |
| Potions brewed per episode / share used | 1.0 / 68% | 1.0 / 78% | 1.0 / 86% |
| No guardian player: the call is used | 7% | 42% | 81% |

## 6. What gets used

Average uses per episode (gifts per episode with a guardian player; the call per episode without one).

| | Easy | Standard | Hard |
|---|---|---|---|
| Leads followed out in the city | 6.61 | 8.39 | 9.46 |
| Book research at home | 2.89 | 2.87 | 3.14 |
| Reveal (spell) | 2.71 | 0.67 | 0.80 |
| Life answered | 2.39 | 2.23 | 2.25 |
| Rest | 0.00 | 0.03 | 0.04 |
| Hide (spell) | 0.02 | 0.22 | 0.28 |
| Plain attacks (Nerve) | 3.51 | 5.63 | 8.32 |
| Blast (spell) | 1.56 | 0.93 | 0.86 |
| Bind (spell) | 0.31 | 0.48 | 0.45 |
| Study the threat | 0.02 | 0.11 | 0.59 |
| Guard the innocent (rounds) | 0.00 | 0.01 | 0.03 |
| Vanquish attempts | 1.00 | 0.98 | 0.88 |
| Surge: Force | 0.08 | 0.18 | 0.10 |
| Surge: Flame | 0.09 | 0.18 | 0.10 |
| Surge: Sight | 0.65 | 0.97 | 1.15 |
| Surge: Voice | 0.20 | 0.65 | 0.67 |
| Surge: Veil | 0.00 | 0.03 | 0.04 |
| Surge: Wild | 0.04 | 0.04 | 0.03 |
| Potions brewed: Blasting / Healing / Binding | 0.32 / 0.32 / 0.33 | 0.33 / 0.33 / 0.32 | 0.31 / 0.33 / 0.32 |
| Potions used: Blasting / Healing / Binding | 0.32 / 0.02 / 0.32 | 0.33 / 0.12 / 0.32 | 0.31 / 0.20 / 0.31 |
| Guardian: Mend | 0.24 | 1.28 | 1.39 |
| Guardian: Shield | 0.05 | 0.11 | 0.12 |
| Guardian: Carry | 0.07 | 0.16 | 0.36 |
| Guardian: Sense | 1.98 | 1.99 | 2.00 |
| Guardian: Hold | 2.53 | 0.78 | 0.69 |
| No guardian player: call for Carry / Mend | 0.05 / 0.02 | 0.17 / 0.25 | 0.34 / 0.47 |

## 7. Powers

Win-rate difference for covens that include each Power, compared with the average of the same cell (all labels and sizes pooled).

| Power | Win difference | Witch goes Down | Damage dealt per episode |
|---|---|---|---|
| Force | +1.2 points | 10% | 5.0 |
| Flame | +1.0 points | 10% | 5.3 |
| Sight | -2.7 points | 15% | 2.2 |
| Voice | -1.2 points | 26% | 2.2 |
| Veil | -0.2 points | 5% | 4.2 |
| Wild | +2.0 points | 14% | 1.8 |

## 8. Guardian player or one more witch

| Label | Players | All witches: win / loss | With a guardian player: win / loss | Difference in win |
|---|---|---|---|---|
| Easy | 3 | 87% / 0% | 89% / 0% | +2.3 |
| Easy | 4 | 84% / 0% | 88% / 0% | +3.7 |
| Easy | 5 | 83% / 0% | 87% / 0% | +3.6 |
| Standard | 3 | 78% / 5% | 78% / 5% | -0.4 |
| Standard | 4 | 74% / 4% | 78% / 4% | +3.1 |
| Standard | 5 | 71% / 3% | 76% / 2% | +4.2 |
| Hard | 3 | 60% / 21% | 54% / 23% | -6.0 |
| Hard | 4 | 57% / 22% | 58% / 21% | +0.9 |
| Hard | 5 | 64% / 13% | 63% / 10% | -0.4 |

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
| (defaults) | — | 77% / 4% | 60% / 18% |
| judgement: signature | heavy | 77% / 4% | 62% / 16% |
| judgement: fightPartialCost | none | 79% / 3% | 66% / 11% |
| judgement: investigationCost | none | 83% / 1% | 71% / 11% |
| judgement: brokenFlees | thisRound | 18% / 5% | 12% / 20% |
| judgement: bookPerScene | 99 | 77% / 3% | 60% / 17% |
| players: magic | careful | 79% / 4% | 66% / 13% |
| players: go | weaknessOrLate | 77% / 2% | 64% / 10% |
| players: go | asap | 46% / 6% | 33% / 18% |
| players: go | waitForWeakness | 77% / 4% | 60% / 20% |
| players: life | always | 76% / 5% | 57% / 22% |
| players: life | never | 72% / 3% | 59% / 16% |
| players: brew | none | 75% / 4% | 61% / 17% |
| players: brew | two | 74% / 6% | 58% / 21% |
| players: ratings | random | 76% / 4% | 54% / 24% |
| players: publicCare | reckless | 75% / 4% | 52% / 17% |
| preset | generous (every open rule read for the players) | 86% / 1% | 76% / 5% |
| preset | strict (every open rule read against them) | 18% / 5% | 12% / 18% |
| rules | v0.1 Vanquish (1 die per joiner, fixed Difficulty, Partial destroys) | 86% / 2% | 72% / 15% |
| rules | success on 5–6 instead of 4–6 | 17% / 51% | 5% / 81% |

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
| info | Players should keep 2 Magic for the Vanquish | Magic | Covens that spent down to 0 couldn't afford the Vanquish and the threat fled. The simulated players keep 2 each until the threat is Broken; the book should give that advice. | v0.2 (advice) |
| info | The innocent is almost never lost | The threat: '6 … it takes the innocent' | The simulated coven always guards the innocent or has the guardian carry them out, so the 6 rarely lands. The cost shows up as a witch who isn't attacking. Open question for Richard: should a public showdown start with the innocent already in danger? | open |

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
| cluesPer | 3 | 3 | 3 |
| cluesAdd | 1 | 2 | 4 |
| mark | 5 | 5 | 5 |
| doomMax | 12 | 12 | 12 |
| exposureMax | 5 | 4 | 4 |
| vanquishAdd | 0 | 0 | 0 |

Threat attacks per round by characters: 3: 1, 4: 2, 5: 2.

