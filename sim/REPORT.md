# Witch & Ward: simulator report

Rules: `docs/CORE-RULES.md` v0.7. Command: `node sim/run.mjs --runs 2000 --seed 1 --sweep-runs 500`. 2,000 episodes per cell, 36,000 in all. Same seed, same report.

A **cell** is one difficulty label, one number of players (3, 4 or 5), with or without a guardian player. With a guardian player, one player plays the guardian and the rest play witches. **Win / Partial / Loss** are the episode results from CORE-RULES "The end".

## 1. Against the targets

| Target (DESIGN Q16) | Easy | Standard | Hard | On target? |
|---|---|---|---|---|
| Win: Easy ~90%, Standard ~75%, Hard 55–60% | 85% | 73% | 59% | **no** |
| Loss: Easy ≤5%, Standard 5–15%, Hard 15–30% | 0% | 8% | 23% | yes |
| Every cell within 5 points of its label's win target | 80–90% | 67–79% | 56–62% | **no** |
| Guardian player within 5 points of an extra witch | 3.8 / 3.3 / 3.3 | 4.0 / 3.4 / 4.7 | -0.4 / -1.3 / 0.2 | yes |
| Showdown: median 3–5 rounds | 2 (90%: 3, most 8) | 3 (90%: 4, most 7) | 4 (90%: 5, most 8) | **no** |
| A witch Down: Easy ≤15%, Standard ≥25%, Hard ≥40% of episodes | 2% | 39% | 61% | yes |
| Criticals 15–25% of rolls | 13% | 14% | 13% | **no** |
| Failures 10–20% of rolls | 13% | 16% | 18% | yes |
| The median witch spends at least half of their Magic | 83% | 83% | 83% | yes |
| The guardian spends at least half its Ward (median) | 40% | 60% | 40% | **no** |
| 70% or more of brewed potions get used | 46% | 61% | 68% | **no** |
| Seen in 5–15% of Standard episodes | 0% | 5% | 9% | **no** |
| The Showdown mark forces a public fight in 15–40% of episodes | 1% | 21% | 34% | yes |
| Every Power within 5 points of the average | Force -1.1, Flame -1.2, Sight -0.2, Voice +1.4, Veil -0.3, Wild +1.3 | | | yes |

The public-fight row is pooled over all labels (19%); the guardian row reads 3 / 4 / 5 players (points of win rate, guardian minus witch).

## 2. Win, Partial and Loss by cell

| Label | Players | Guardian player | Witches | Win | Partial | Loss | Threat destroyed | Threat fled | Doom filled | Every witch Down |
|---|---|---|---|---|---|---|---|---|---|---|
| Easy | 3 | no | 3 | 86% | 14% | 0% | 86% | 14% | 0% | 0% |
| Easy | 3 | yes | 2 | 90% | 10% | 0% | 90% | 10% | 0% | 0% |
| Easy | 4 | no | 4 | 83% | 17% | 0% | 83% | 17% | 0% | 0% |
| Easy | 4 | yes | 3 | 86% | 14% | 0% | 86% | 14% | 0% | 0% |
| Easy | 5 | no | 5 | 80% | 20% | 0% | 80% | 20% | 0% | 0% |
| Easy | 5 | yes | 4 | 84% | 16% | 0% | 84% | 16% | 0% | 0% |
| Standard | 3 | no | 3 | 75% | 15% | 9% | 78% | 15% | 0% | 7% |
| Standard | 3 | yes | 2 | 79% | 15% | 6% | 82% | 14% | 0% | 4% |
| Standard | 4 | no | 4 | 71% | 20% | 8% | 74% | 22% | 0% | 5% |
| Standard | 4 | yes | 3 | 75% | 16% | 9% | 77% | 17% | 0% | 7% |
| Standard | 5 | no | 5 | 67% | 25% | 8% | 72% | 27% | 0% | 1% |
| Standard | 5 | yes | 4 | 72% | 21% | 7% | 74% | 24% | 0% | 3% |
| Hard | 3 | no | 3 | 61% | 13% | 26% | 65% | 15% | 0% | 21% |
| Hard | 3 | yes | 2 | 60% | 19% | 20% | 64% | 19% | 0% | 17% |
| Hard | 4 | no | 4 | 57% | 19% | 24% | 61% | 23% | 0% | 16% |
| Hard | 4 | yes | 3 | 56% | 13% | 31% | 58% | 15% | 0% | 27% |
| Hard | 5 | no | 5 | 61% | 20% | 18% | 68% | 24% | 0% | 9% |
| Hard | 5 | yes | 4 | 62% | 19% | 19% | 65% | 22% | 0% | 13% |

A Partial is a threat that fled, or a destroyed threat whose innocent was lost; being Seen also drops a Win to a Partial and a Partial to a Loss.

## 3. How episodes play out

| | Easy | Standard | Hard |
|---|---|---|---|
| Investigation scenes (median) | 3 | 4 | 4 |
| Doom when the showdown starts (mean, mark 5) | 3.1 | 4.1 | 4.3 |
| Weakness known when the showdown starts | 100% | 97% | 92% |
| Showdown mark reached: public fight with the innocent there | 1% | 21% | 34% |
| Showdown rounds: median / 90% / most | 2 / 3 / 8 | 3 / 4 / 7 | 4 / 5 / 8 |
| Unmaking rolls that destroy the threat | 85% | 79% | 77% |
| Seen (Exposure full) | 0% | 5% | 9% |
| Public fights where Exposure pressed (a round without magic, or Seen) | 30% | 76% | 85% |
| Innocent lost | 0% | 3% | 6% |

## 4. Witches taken out

| | Easy | Standard | Hard |
|---|---|---|---|
| Episodes with at least one witch Down | 2% | 39% | 61% |
| Witches Down per episode | 0.0 | 0.6 | 1.2 |
| Share of all witches who go Down | 1% | 16% | 34% |
| Guardian Down (episodes with a guardian player) | 1% | 45% | 65% |

Nobody dies from the dice; Down means out of action until mended or the episode ends.

## 5. Rolls and resources

| | Easy | Standard | Hard |
|---|---|---|---|
| Player rolls per episode | 18 | 23 | 26 |
| Criticals / Partials / Failures (share of rolls) | 13% / 1% / 13% | 14% / 28% / 16% | 13% / 29% / 18% |
| Magic spent by the median witch | 83% | 83% | 83% |
| Witches who spend at least half their Magic | 100% | 99% | 97% |
| Witches who answer their Life | 67% | 66% | 66% |
| Ward spent by the median guardian | 40% | 60% | 40% |
| Guardians who spend at least half their Ward | 37% | 57% | 48% |
| Potions brewed per episode / share used | 3.2 / 46% | 2.3 / 61% | 2.4 / 68% |
| No guardian player: the call is used | 3% | 48% | 70% |

## 6. What gets used

Average uses per episode (gifts per episode with a guardian player; the call per episode without one).

| | Easy | Standard | Hard |
|---|---|---|---|
| Leads followed out in the city | 6.17 | 9.43 | 10.04 |
| Book research at home | 2.49 | 2.67 | 2.82 |
| Reveal (spell) | 2.57 | 0.90 | 0.90 |
| Life answered | 2.34 | 2.31 | 2.32 |
| Rest | 0.01 | 0.38 | 0.45 |
| Hide (spell) | 0.01 | 0.30 | 0.33 |
| Plain attacks (Nerve) | 2.18 | 3.94 | 5.59 |
| Blast (spell) | 1.42 | 0.56 | 0.37 |
| Bind (spell) | 0.24 | 0.43 | 0.40 |
| Study the threat | 0.00 | 0.13 | 0.34 |
| Guard the innocent (rounds) | 0.01 | 0.31 | 0.52 |
| Unmaking attempts | 1.00 | 0.95 | 0.83 |
| Surge: Force | 0.09 | 0.09 | 0.05 |
| Surge: Flame | 0.10 | 0.10 | 0.06 |
| Surge: Sight | 0.75 | 1.07 | 1.15 |
| Surge: Voice | 0.20 | 0.68 | 0.69 |
| Surge: Veil | 0.00 | 0.04 | 0.05 |
| Surge: Wild | 0.06 | 0.07 | 0.07 |
| Potions brewed: Blasting / Healing / Binding | 0.95 / 0.98 / 0.96 | 0.75 / 0.73 / 0.73 | 0.76 / 0.77 / 0.75 |
| Potions used: Blasting / Healing / Binding | 0.88 / 0.05 / 0.55 | 0.70 / 0.35 / 0.35 | 0.72 / 0.43 / 0.47 |
| Guardian: Mend | 0.41 | 0.74 | 0.67 |
| Guardian: Shield | 0.22 | 0.35 | 0.21 |
| Guardian: Carry | 0.01 | 0.04 | 0.06 |
| Guardian: Sense | 2.00 | 2.00 | 2.00 |
| Guardian: Hold | 1.66 | 0.10 | 0.14 |
| No guardian player: call for Carry / Mend | 0.01 / 0.02 | 0.19 / 0.29 | 0.29 / 0.41 |

## 7. Powers

Win-rate difference for covens that include each Power, compared with the average of the same cell (all labels and sizes pooled).

| Power | Win difference | Witch goes Down | Damage dealt per episode |
|---|---|---|---|
| Force | -1.1 points | 20% | 4.8 |
| Flame | -1.2 points | 19% | 5.4 |
| Sight | -0.2 points | 22% | 2.0 |
| Voice | +1.4 points | 17% | 2.4 |
| Veil | -0.3 points | 9% | 5.1 |
| Wild | +1.3 points | 14% | 2.2 |

## 8. Guardian player or one more witch

| Label | Players | All witches: win / loss | With a guardian player: win / loss | Difference in win |
|---|---|---|---|---|
| Easy | 3 | 86% / 0% | 90% / 0% | +3.8 |
| Easy | 4 | 83% / 0% | 86% / 0% | +3.3 |
| Easy | 5 | 80% / 0% | 84% / 0% | +3.3 |
| Standard | 3 | 75% / 9% | 79% / 6% | +4.0 |
| Standard | 4 | 71% / 8% | 75% / 9% | +3.4 |
| Standard | 5 | 67% / 8% | 72% / 7% | +4.7 |
| Hard | 3 | 61% / 26% | 60% / 20% | -0.4 |
| Hard | 4 | 57% / 24% | 56% / 31% | -1.3 |
| Hard | 5 | 61% / 18% | 62% / 19% | +0.2 |

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
| (defaults) | — | 74% / 7% | 60% / 22% |
| judgement: signature | heavy | 74% / 7% | 61% / 20% |
| judgement: fightPartialCost | none | 74% / 6% | 63% / 18% |
| judgement: investigationCost | none | 84% / 1% | 77% / 6% |
| judgement: brokenFlees | thisRound | 18% / 7% | 13% / 22% |
| judgement: bookPerScene | 99 | 74% / 7% | 61% / 22% |
| players: magic | careful | 72% / 13% | 56% / 31% |
| players: go | weaknessOrLate | 71% / 9% | 59% / 22% |
| players: go | asap | 16% / 59% | 6% / 84% |
| players: go | waitForWeakness | 74% / 7% | 60% / 22% |
| players: life | always | 75% / 10% | 59% / 29% |
| players: life | never | 71% / 5% | 61% / 15% |
| players: brew | one | 73% / 7% | 60% / 21% |
| players: brew | none | 73% / 7% | 58% / 24% |
| players: brew | two | 73% / 7% | 60% / 22% |
| players: ratings | random | 74% / 8% | 58% / 25% |
| players: publicCare | reckless | 71% / 7% | 54% / 21% |
| preset | generous (every open rule read for the players) | 85% / 1% | 78% / 5% |
| preset | strict (every open rule read against them) | 16% / 7% | 12% / 20% |
| rules | v0.1 Unmaking (1 die per joiner, fixed Difficulty, Partial destroys) | 83% / 5% | 69% / 20% |
| rules | v0.2 innocent (not held at the start of a public showdown) | 75% / 5% | 64% / 16% |
| rules | v0.2 Weakness (no Defence +1 without it, no extra damage with it) | 67% / 14% | 44% / 40% |
| rules | v0.3 potions (using one is an action, brewing is its own action, one potion per brew) | 66% / 17% | 43% / 43% |
| rules | no extra Toughness against 3 characters | 74% / 7% | 61% / 21% |
| rules | success on 5–6 instead of 4–6 | 15% / 62% | 7% / 82% |

What each setting means:

- **judgement: signature** — The generic signature move on a 6 when no innocent is exposed: attack two different characters (double), or one attack whose Hit is 1 higher (heavy). (CORE-RULES The threat: '6 its signature move' (each threat's own move is content, not yet written))
- **judgement: fightPartialCost** — Whether a Partial attack in a fight costs 1 Hurt (hurt) or nothing (none, the generous reading). (CORE-RULES Showdown: 'a Partial 1 with a cost')
- **judgement: investigationCost** — Whether lead and brewing Partials/Failures cost 1 Hurt or Exposure as the Cost rule says (rule), or the Storyteller always picks a story cost with no track effect (none). (CORE-RULES The roll: 'Cost')
- **judgement: brokenFlees** — A Broken threat flees at the end of the next round (nextRound), or at the end of the round it broke (thisRound, strict). (CORE-RULES The threat: 'it flees at the end of the next round')
- **judgement: bookPerScene** — How many characters may research the Book at home in one scene. (CORE-RULES Extra dice: 'the Book (+1 to Wits for research at home)')
- **players: magic** — spendy: in the showdown spend everything above 2 Magic (kept for the Unmaking); in investigation spend above 3. careful: keep 3 in the showdown and spend nothing in investigation.
- **players: go** — When the coven goes to the threat. gamble: as soon as it knows the Weakness; with half the Clues and one scene before the Showdown mark, it stays one more scene (and will be found) if the missing Clues look reachable in one scene, otherwise it goes. weaknessOrLate: the Weakness, or half the Clues one scene before the mark. asap: as soon as it has half. waitForWeakness: only with the Weakness, even if that means being found.
- **players: life** — spare: a witch answers their Life when their best lead is no better than the coven's median and Doom is at least 2 short of the mark; always: everyone answers in scene 1; never: everyone lets it slide.
- **players: brew** — How much the coven brews: cap = the Book researcher brews whenever the coven has fewer potions than it may carry; one / two = at most that many brews; none = never.
- **players: ratings** — sensible: the 3 goes where the Power is used most; random: any legal spread.
- **players: publicCare** — careful: in a public showdown with Exposure one short of full, the coven uses no magic that round; reckless: it never holds back.

## 11. Seasons

Eight episodes in a row with the same coven (500 seasons each for 3 witches, 3 witches + guardian, and 5 witches, pooled), carrying over Scars, growth, Book pages and returning threats as CORE-RULES "The end" says. Each threat is one of 6 kinds at random unless one that wasn't destroyed is due back (two episodes later). Win / Loss by episode:

| Label | Ep 1 | Ep 2 | Ep 3 | Ep 4 | Ep 5 | Ep 6 | Ep 7 | Ep 8 |
|---|---|---|---|---|---|---|---|---|
| Standard | 73 / 9 | 73 / 9 | 80 / 7 | 81 / 5 | 83 / 4 | 81 / 4 | 82 / 4 | 82 / 4 |
| Hard | 60 / 25 | 59 / 25 | 66 / 20 | 70 / 17 | 70 / 17 | 70 / 16 | 71 / 17 | 70 / 17 |

## 12. Rule gaps and findings

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
| broken | The Unmaking got much easier with every extra witch (v0.1) | The Unmaking | v0.1 gave 1 die per joiner against a fixed Difficulty, so 5 witches almost never failed and 2 often did. v0.2: each joiner adds 2 dice, the Difficulty is the number of witches, and only a full success destroys the threat. Win rates by group size are now within a few points. | v0.2 |
| broken | The guardian was worth 10–20 points less than another witch (v0.1) | The guardian; Toughness | Toughness now counts witches only; the guardian adds nothing to it. With that, a guardian player is within about 5 points of an extra witch. | v0.2 |
| broken | Investigation was too short and Doom never pressed (v0.1) | [T] Clues needed: n + 2 | With n + 2 Clues the coven knew the Weakness after 2 scenes and the Showdown mark was never reached. v0.2: 3 Clues per character plus a label amount. | v0.2 |
| broken | Brewing potions didn't pay for itself (v0.3) | Potions; Investigation | In v0.3 a brewing action was a lead not followed, and the lost Clue cost more than the potion gave back: covens that never brewed did 3–4 points better. v0.4: using a potion takes no action (one per character per round), the Book researcher may also brew that scene, and a brew makes two potions (three on a Critical). Brewing is now worth 1–3 points. | v0.4 |
| info | Small covens at Hard; 3 more Toughness against 3 characters | The threat | With 1 attack a round against 3 characters and 2 against 4 or 5, 3-character covens had the easiest fights. v0.4 gives the threat 3 more Toughness against 3 characters. The weakest cell left is 2 witches plus a guardian at Hard (about 52%). | v0.4 |
| broken | Casting was free once the coven was Seen (v0.4) | Tracks: Exposure | Extra Exposure after Seen went nowhere (A5). v0.5: any further rise becomes Doom +1, once per round or scene. | v0.5 (playtest A) |
| broken | A coven could stockpile potions (v0.4) | Potions | The Book researcher could brew every scene and arrive with a pile of free Blasting potions. v0.5: at most one potion per character. | v0.5 (playtest A) |
| gap | Half the Clues and the Showdown mark in the same scene (v0.4) | Investigation | The coven decides to go after Doom rises at the end of the scene; if Doom has reached the mark, the threat comes to them. | v0.5 (playtest A, review) |
| broken | Potions skipped too many rolls (v0.5) | Potions; The threat | Blasting potions did damage with no roll and no action, and Bind plus a Binding potion cancelled every attack. v0.6: Blasting adds 2 damage to an attack that works; the threat loses at most one attack a round; a Partial brew makes one potion. | v0.6 (playtest B) |
| broken | Sense was dominated by helping (v0.5) | Gifts: Sense | Same cost as a Ward helper, same die, but only on leads. v0.6: its die sits outside the +2 limit. (A '+1 Clue' version made guardian covens about 10 points stronger.) | v0.6 (playtest B) |
| broken | Later season episodes got much easier (v0.5) | The end: Season | Growth with no matching threat growth took Standard from 74% to 87% wins by episode 5. v0.6: threats get 1 more Toughness per witch at each growth step. Later episodes still run 3–8 points easier than a one-off, mostly from Book pages. | v0.6 |
| broken | Covens Broke the threat before it acted (v0.6) | Showdown | Every character acted before the threat, and with the Weakness, Surges and potions a coven Broke a Standard threat in round 1 about 90% of the time (verification playtest). v0.7: the threat acts first in round 1; Binding needs a working attack; lost attacks beyond one a round are wasted; Shield once a round. | v0.7 (verification playtest) |
| info | Going early is only a real choice one scene before the mark | Investigation | Before Doom 4 there's no reason to go without the Weakness: waiting costs nothing until the next scene would reach the mark. The choice that matters is at Doom 4 (go now, hidden, maybe without the Weakness; or wait, likely be found in public with it). Rushing in early loses badly (section 10). | kept |
| info | Veil's Surge covers a whole public showdown | Powers: Veil | The showdown is one scene, so one Veil Surge removes Exposure for the rest of a public fight. It's Veil's job and Veil isn't above average (§7), so it stays; watch it in later playtests. | kept |
| info | Players should keep 2 Magic for the Unmaking | Magic | Covens that spent down to 0 couldn't afford the Unmaking and the threat fled. The simulated players keep 2 each until the threat is Broken; the book should give that advice. | v0.2 (advice) |
| broken | The innocent was almost never lost, and going in early beat waiting for the Weakness (v0.2) | The threat; The Unmaking | In v0.2 guarding or carrying the innocent always worked, and a coven that went in without the Weakness did as well or better than one that waited and was found (Hard: 20% vs 10% losses). v0.3: a public showdown starts with the threat holding the innocent (free them in round 1 or lose them), and until the coven knows the Weakness the threat's Defence is 1 higher; once it knows, attacks that work do 1 more damage. Waiting for the Weakness and going early now come out within about a point of each other, and rushing in with half the Clues loses badly. | v0.3 (Richard, 2026-10-30) |
| broken | Small groups fell behind at Hard (v0.3 draft) | [T] Clues needed | With 3n + 4 Clues, 3-player covens found the Weakness far less often and won about 45% at Hard against 65% for 5 players. Clues are now 4 per character at Hard (and 4 per character minus 1 at Standard, 3 per character at Easy), which brings every size within a few points. | v0.3 |

## 13. What is and isn't modelled

Modelled:

- The roll, Partials, Criticals, the +2 extra-dice limit, Power dice, helpers (as the roller's own Magic) and group size.
- Investigation scenes: leads (Heart, Wits, Reveal), the Book, brewing, resting, Hide, Life calls, Sense; Clues, Doom and the Showdown mark; going to the threat.
- Showdown rounds: attacks (Nerve or Blast), Bind, potions, guarding the innocent, studying the threat, Surges for all six Powers, the threat's d6 move table, Shield, Mend, Carry, Hold, Broken, the Unmaking, Doom, public Exposure.
- The no-guardian call, Down and back up, every way an episode ends, Seen dropping the result.

Not modelled:

- No map: moving is free and everyone in a showdown is near everyone else.
- One generic threat per difficulty label; real threats will have their own signature moves (the generic one attacks two characters).
- A Life fits a lead one time in three.
- Shelter is never cast, group checks never come up, helpers are modelled as the roller spending their own Magic, and the coven never retreats (the policies use guarding and fight to the end).
- Seasons are not simulated: no Scars, growth, Book pages or returning threats. Each episode starts fresh.
- Players' story choices, romance and everyday-life scenes beyond the Life call.
- The default Critical extra (+1 die on your next roll) for actions with no listed extra.

## 14. The numbers used

| | Easy | Standard | Hard |
|---|---|---|---|
| leadD | 1 | 2 | 2 |
| defence | 1 | 2 | 2 |
| attack | 1 | 3 | 3 |
| hit | 2 | 2 | 3 |
| tWitch | 3 | 3 | 4 |
| cluesPer | 3 | 4 | 4 |
| cluesAdd | 0 | -1 | 0 |
| mark | 5 | 5 | 5 |
| doomMax | 12 | 12 | 12 |
| exposureMax | 5 | 4 | 4 |
| unmakeAdd | 0 | 0 | 0 |

Threat attacks per round by characters: 3: 1, 4: 2, 5: 2. Extra Toughness by characters: 2: 0, 3: 3, 4: 0, 5: 0.

