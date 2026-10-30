# Witch & Ward: simulator report

Rules: `docs/CORE-RULES.md` v0.4. Command: `node sim/run.mjs --runs 2000 --seed 1 --sweep-runs 500`. 2,000 episodes per cell, 36,000 in all. Same seed, same report.

A **cell** is one difficulty label, one number of players (3, 4 or 5), with or without a guardian player. With a guardian player, one player plays the guardian and the rest play witches. **Win / Partial / Loss** are the episode results from CORE-RULES "The end".

## 1. Against the targets

| Target (DESIGN Q16) | Easy | Standard | Hard | On target? |
|---|---|---|---|---|
| Win: Easy ~90%, Standard ~75%, Hard 55–60% | 87% | 72% | 56% | yes |
| Loss: Easy ≤5%, Standard 5–15%, Hard 15–30% | 0% | 9% | 24% | yes |
| Every cell within 5 points of its label's win target | 85–89% | 69–76% | 52–59% | **no** |
| Guardian player within 5 points of an extra witch | 3.3 / 4.7 / 1.7 | -1.5 / 3.5 / 3.8 | -6.0 / 0.6 / 3.5 | **no** |
| Showdown: median 3–5 rounds | 2 (90%: 3, most 7) | 3 (90%: 4, most 8) | 4 (90%: 5, most 9) | **no** |
| A witch Down: Easy ≤15%, Standard ≥25%, Hard ≥40% of episodes | 0% | 28% | 59% | yes |
| Criticals 15–25% of rolls | 14% | 14% | 13% | **no** |
| Failures 10–20% of rolls | 13% | 15% | 17% | yes |
| The median witch spends at least half of their Magic | 83% | 83% | 83% | yes |
| The guardian spends at least half its Ward (median) | 40% | 80% | 60% | **no** |
| 70% or more of brewed potions get used | 53% | 71% | 79% | **no** |
| Seen in 5–15% of Standard episodes | 0% | 7% | 10% | yes |
| The Showdown mark forces a public fight in 15–40% of episodes | 1% | 19% | 30% | yes |
| Every Power within 5 points of the average | Force +0.2, Flame -0.2, Sight +0.4, Voice -0.2, Veil -1.4, Wild +1.2 | | | yes |

The public-fight row is pooled over all labels (16%); the guardian row reads 3 / 4 / 5 players (points of win rate, guardian minus witch).

## 2. Win, Partial and Loss by cell

| Label | Players | Guardian player | Witches | Win | Partial | Loss | Threat destroyed | Threat fled | Doom filled | Every witch Down |
|---|---|---|---|---|---|---|---|---|---|---|
| Easy | 3 | no | 3 | 86% | 14% | 0% | 86% | 14% | 0% | 0% |
| Easy | 3 | yes | 2 | 89% | 11% | 0% | 89% | 11% | 0% | 0% |
| Easy | 4 | no | 4 | 85% | 15% | 0% | 85% | 15% | 0% | 0% |
| Easy | 4 | yes | 3 | 89% | 11% | 0% | 89% | 11% | 0% | 0% |
| Easy | 5 | no | 5 | 85% | 15% | 0% | 85% | 15% | 0% | 0% |
| Easy | 5 | yes | 4 | 87% | 13% | 0% | 87% | 13% | 0% | 0% |
| Standard | 3 | no | 3 | 76% | 15% | 10% | 78% | 15% | 0% | 7% |
| Standard | 3 | yes | 2 | 74% | 14% | 12% | 76% | 13% | 0% | 10% |
| Standard | 4 | no | 4 | 71% | 22% | 8% | 74% | 22% | 0% | 4% |
| Standard | 4 | yes | 3 | 74% | 16% | 10% | 77% | 16% | 0% | 7% |
| Standard | 5 | no | 5 | 69% | 23% | 8% | 73% | 25% | 0% | 1% |
| Standard | 5 | yes | 4 | 72% | 22% | 5% | 76% | 22% | 0% | 2% |
| Hard | 3 | no | 3 | 58% | 15% | 27% | 62% | 16% | 0% | 22% |
| Hard | 3 | yes | 2 | 52% | 19% | 29% | 56% | 18% | 0% | 26% |
| Hard | 4 | no | 4 | 54% | 23% | 23% | 57% | 25% | 0% | 18% |
| Hard | 4 | yes | 3 | 55% | 17% | 28% | 59% | 17% | 0% | 25% |
| Hard | 5 | no | 5 | 56% | 25% | 19% | 61% | 30% | 0% | 10% |
| Hard | 5 | yes | 4 | 59% | 24% | 17% | 65% | 24% | 0% | 12% |

A Partial is a threat that fled, or a destroyed threat whose innocent was lost; being Seen also drops a Win to a Partial and a Partial to a Loss.

## 3. How episodes play out

| | Easy | Standard | Hard |
|---|---|---|---|
| Investigation scenes (median) | 3 | 4 | 4 |
| Doom when the showdown starts (mean, mark 5) | 3.1 | 4.0 | 4.2 |
| Weakness known when the showdown starts | 100% | 97% | 93% |
| Showdown mark reached: public fight with the innocent there | 1% | 19% | 30% |
| Showdown rounds: median / 90% / most | 2 / 3 / 7 | 3 / 4 / 8 | 4 / 5 / 9 |
| Vanquish rolls that destroy the threat | 87% | 80% | 74% |
| Seen (Exposure full) | 0% | 7% | 10% |
| Public fights where Exposure pressed (a round without magic, or Seen) | 47% | 86% | 90% |
| Innocent lost | 0% | 1% | 4% |

## 4. Witches taken out

| | Easy | Standard | Hard |
|---|---|---|---|
| Episodes with at least one witch Down | 0% | 28% | 59% |
| Witches Down per episode | 0.0 | 0.5 | 1.2 |
| Share of all witches who go Down | 0% | 13% | 35% |
| Guardian Down (episodes with a guardian player) | 0% | 25% | 51% |

Nobody dies from the dice; Down means out of action until mended or the episode ends.

## 5. Rolls and resources

| | Easy | Standard | Hard |
|---|---|---|---|
| Player rolls per episode | 17 | 23 | 27 |
| Criticals / Partials / Failures (share of rolls) | 14% / 1% / 13% | 14% / 28% / 15% | 13% / 29% / 17% |
| Magic spent by the median witch | 83% | 83% | 83% |
| Witches who spend at least half their Magic | 100% | 99% | 97% |
| Witches who answer their Life | 67% | 66% | 66% |
| Ward spent by the median guardian | 40% | 80% | 60% |
| Guardians who spend at least half their Ward | 19% | 79% | 74% |
| Potions brewed per episode / share used | 2.7 / 53% | 2.4 / 71% | 2.4 / 79% |
| No guardian player: the call is used | 1% | 42% | 71% |

## 6. What gets used

Average uses per episode (gifts per episode with a guardian player; the call per episode without one).

| | Easy | Standard | Hard |
|---|---|---|---|
| Leads followed out in the city | 6.09 | 9.24 | 9.83 |
| Book research at home | 2.57 | 2.86 | 3.02 |
| Reveal (spell) | 2.62 | 0.91 | 0.91 |
| Life answered | 2.33 | 2.30 | 2.32 |
| Rest | 0.00 | 0.18 | 0.20 |
| Hide (spell) | 0.01 | 0.30 | 0.33 |
| Plain attacks (Nerve) | 2.12 | 4.98 | 6.49 |
| Blast (spell) | 1.49 | 0.91 | 0.80 |
| Bind (spell) | 0.22 | 0.38 | 0.36 |
| Study the threat | 0.00 | 0.15 | 0.36 |
| Guard the innocent (rounds) | 0.01 | 0.25 | 0.40 |
| Vanquish attempts | 1.00 | 0.95 | 0.81 |
| Surge: Force | 0.12 | 0.13 | 0.09 |
| Surge: Flame | 0.13 | 0.14 | 0.10 |
| Surge: Sight | 0.62 | 0.85 | 1.07 |
| Surge: Voice | 0.20 | 0.68 | 0.69 |
| Surge: Veil | 0.00 | 0.04 | 0.04 |
| Surge: Wild | 0.01 | 0.02 | 0.01 |
| Potions brewed: Blasting / Healing / Binding | 0.89 / 0.91 / 0.88 | 0.80 / 0.80 / 0.80 | 0.80 / 0.80 / 0.80 |
| Potions used: Blasting / Healing / Binding | 0.87 / 0.01 / 0.54 | 0.79 / 0.28 / 0.64 | 0.78 / 0.40 / 0.70 |
| Guardian: Mend | 0.22 | 1.32 | 1.20 |
| Guardian: Shield | 0.02 | 0.11 | 0.11 |
| Guardian: Carry | 0.01 | 0.10 | 0.16 |
| Guardian: Sense | 1.96 | 2.00 | 2.00 |
| Guardian: Hold | 2.14 | 0.55 | 0.47 |
| No guardian player: call for Carry / Mend | 0.01 / 0.00 | 0.17 / 0.25 | 0.27 / 0.45 |

## 7. Powers

Win-rate difference for covens that include each Power, compared with the average of the same cell (all labels and sizes pooled).

| Power | Win difference | Witch goes Down | Damage dealt per episode |
|---|---|---|---|
| Force | +0.2 points | 15% | 5.5 |
| Flame | -0.2 points | 17% | 6.2 |
| Sight | +0.4 points | 17% | 2.6 |
| Voice | -0.2 points | 23% | 2.7 |
| Veil | -1.4 points | 10% | 5.7 |
| Wild | +1.2 points | 15% | 3.8 |

## 8. Guardian player or one more witch

| Label | Players | All witches: win / loss | With a guardian player: win / loss | Difference in win |
|---|---|---|---|---|
| Easy | 3 | 86% / 0% | 89% / 0% | +3.3 |
| Easy | 4 | 85% / 0% | 89% / 0% | +4.7 |
| Easy | 5 | 85% / 0% | 87% / 0% | +1.7 |
| Standard | 3 | 76% / 10% | 74% / 12% | -1.5 |
| Standard | 4 | 71% / 8% | 74% / 10% | +3.5 |
| Standard | 5 | 69% / 8% | 72% / 5% | +3.8 |
| Hard | 3 | 58% / 27% | 52% / 29% | -6.0 |
| Hard | 4 | 54% / 23% | 55% / 28% | +0.6 |
| Hard | 5 | 56% / 19% | 59% / 17% | +3.5 |

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
| (defaults) | — | 73% / 9% | 57% / 23% |
| judgement: signature | heavy | 73% / 8% | 58% / 21% |
| judgement: fightPartialCost | none | 74% / 7% | 60% / 17% |
| judgement: investigationCost | none | 83% / 2% | 71% / 11% |
| judgement: brokenFlees | thisRound | 19% / 10% | 11% / 24% |
| judgement: bookPerScene | 99 | 75% / 8% | 58% / 22% |
| players: magic | careful | 71% / 14% | 55% / 32% |
| players: go | weaknessOrLate | 72% / 9% | 57% / 22% |
| players: go | asap | 14% / 67% | 5% / 87% |
| players: go | waitForWeakness | 73% / 8% | 57% / 23% |
| players: life | always | 69% / 12% | 52% / 30% |
| players: life | never | 72% / 5% | 58% / 17% |
| players: brew | one | 72% / 8% | 55% / 25% |
| players: brew | none | 70% / 10% | 48% / 31% |
| players: ratings | random | 71% / 10% | 54% / 26% |
| players: publicCare | reckless | 70% / 8% | 51% / 21% |
| preset | generous (every open rule read for the players) | 85% / 1% | 77% / 7% |
| preset | strict (every open rule read against them) | 19% / 10% | 12% / 22% |
| rules | v0.1 Vanquish (1 die per joiner, fixed Difficulty, Partial destroys) | 82% / 7% | 68% / 20% |
| rules | v0.2 innocent (not held at the start of a public showdown) | 76% / 6% | 63% / 17% |
| rules | v0.2 Weakness (no Defence +1 without it, no extra damage with it) | 61% / 19% | 38% / 46% |
| rules | v0.3 potions (using one is an action, brewing is its own action, one potion per brew) | 60% / 22% | 36% / 50% |
| rules | no extra Toughness against 3 characters | 74% / 7% | 60% / 20% |
| rules | success on 5–6 instead of 4–6 | 13% / 67% | 5% / 85% |

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
| broken | Brewing potions didn't pay for itself (v0.3) | Potions; Investigation | In v0.3 a brewing action was a lead not followed, and the lost Clue cost more than the potion gave back: covens that never brewed did 3–4 points better. v0.4: using a potion takes no action (one per character per round), the Book researcher may also brew that scene, and a brew makes two potions (three on a Critical). Brewing is now worth 1–3 points. | v0.4 |
| info | Small covens at Hard; 3 more Toughness against 3 characters | The threat | With 1 attack a round against 3 characters and 2 against 4 or 5, 3-character covens had the easiest fights. v0.4 gives the threat 3 more Toughness against 3 characters. The weakest cell left is 2 witches plus a guardian at Hard (about 52%). | v0.4 |
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
| attack | 1 | 3 | 3 |
| hit | 2 | 2 | 3 |
| tWitch | 3 | 4 | 5 |
| cluesPer | 3 | 4 | 4 |
| cluesAdd | 0 | -1 | 0 |
| mark | 5 | 5 | 5 |
| doomMax | 12 | 12 | 12 |
| exposureMax | 5 | 4 | 4 |
| vanquishAdd | 0 | 0 | 0 |

Threat attacks per round by characters: 3: 1, 4: 2, 5: 2. Extra Toughness by characters: 3: 3, 4: 0, 5: 0.

