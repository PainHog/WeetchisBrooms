# Witch & Ward: the threats' signature moves

Rules: book Chapter 7 and Chapter 10 (the moves and whom they target), `docs/CONTENT.md` (which threat each ready-made episode uses), rulings 63, 64, 81, 82 and 85 in `book/REVIEW.md`. Command: `node sim/threats.mjs --runs 2000 --seed 1`. 2,000 episodes per cell, the same runs and seed as `REPORT.md`, so the **generic** rows below are REPORT.md's numbers. 660,000 episodes in all. Same seed, same report.

Every run plays the same coven with the same dice under every move (common random numbers). Two moves only play differently from the first 6 on which they do something different, so small differences between moves are the moves, not luck.

The six threats' moves are run next to three yardsticks: **generic** (the move REPORT.md uses), **plain** (a 6 is only an ordinary attack, aimed like a 4–5: the floor) and **two attacks** ("attack two different characters" read by ruling 63, the move for a threat with none, and the book's yardstick for a new move). Section 9 lists every reading used. The targets are REPORT.md §1 (DESIGN Q16).

## 1. The three ready-made episodes

Win / Partial / Loss with the episode's own threat, against the same cell with the generic move. **Win vs target** is the win minus the label's target (Easy 90, Standard 75, Hard 57.5); bold when more than 5 points off.

| Episode | Players | Guardian player | Win / Partial / Loss | Generic move | Win vs generic | Win vs target |
|---|---|---|---|---|---|---|
| 1. Night Market (Easy, Hush) | 3 | no | 87% / 13% / 0% | 86% / 14% / 0% | +0.5 | −3.4 |
| 1. Night Market (Easy, Hush) | 3 | yes | 90% / 10% / 0% | 90% / 10% / 0% | −0.3 | −0.3 |
| 1. Night Market (Easy, Hush) | 4 | no | 82% / 18% / 0% | 83% / 17% / 0% | −0.7 | **−8.0** |
| 1. Night Market (Easy, Hush) | 4 | yes | 86% / 14% / 0% | 86% / 14% / 0% | +0.4 | −3.6 |
| 1. Night Market (Easy, Hush) | 5 | no | 80% / 20% / 0% | 80% / 20% / 0% | +0.1 | **−9.7** |
| 1. Night Market (Easy, Hush) | 5 | yes | 84% / 16% / 0% | 84% / 16% / 0% | +0.1 | **−6.3** |
| **1. Night Market (Easy, Hush)** | **all** | | **85% / 15% / 0%** | 85% / 15% / 0% | 0.0 | **−5.2** |
| 2. Cinders (Standard, Cinders) | 3 | no | 76% / 15% / 9% | 75% / 15% / 9% | +0.6 | +0.9 |
| 2. Cinders (Standard, Cinders) | 3 | yes | 80% / 15% / 5% | 80% / 15% / 6% | +0.3 | +4.8 |
| 2. Cinders (Standard, Cinders) | 4 | no | 71% / 21% / 8% | 71% / 20% / 8% | −0.2 | −3.9 |
| 2. Cinders (Standard, Cinders) | 4 | yes | 75% / 17% / 9% | 75% / 16% / 9% | +0.2 | 0.0 |
| 2. Cinders (Standard, Cinders) | 5 | no | 68% / 25% / 7% | 67% / 25% / 8% | +0.3 | **−7.3** |
| 2. Cinders (Standard, Cinders) | 5 | yes | 72% / 22% / 6% | 72% / 21% / 7% | −0.5 | −3.3 |
| **2. Cinders (Standard, Cinders)** | **all** | | **74% / 19% / 7%** | 73% / 19% / 8% | +0.1 | −1.5 |
| 3. Low Tide (Hard, Lure) | 3 | no | 62% / 14% / 25% | 61% / 13% / 26% | +0.5 | +4.1 |
| 3. Low Tide (Hard, Lure) | 3 | yes | 62% / 20% / 18% | 62% / 19% / 19% | +0.8 | +4.8 |
| 3. Low Tide (Hard, Lure) | 4 | no | 57% / 21% / 22% | 57% / 20% / 23% | +0.3 | 0.0 |
| 3. Low Tide (Hard, Lure) | 4 | yes | 58% / 15% / 27% | 57% / 14% / 29% | +0.9 | +0.3 |
| 3. Low Tide (Hard, Lure) | 5 | no | 62% / 20% / 18% | 61% / 20% / 18% | +0.4 | +4.3 |
| 3. Low Tide (Hard, Lure) | 5 | yes | 63% / 20% / 17% | 63% / 19% / 18% | +0.1 | **+5.5** |
| **3. Low Tide (Hard, Lure)** | **all** | | **61% / 18% / 21%** | 60% / 18% / 22% | +0.5 | +3.2 |

## 2. The episodes against the targets

Each episode with its own threat, then its label with the generic move (REPORT.md §1).

| Target (DESIGN Q16) | 1. Night Market | Easy, generic | 2. Cinders | Standard, generic | 3. Low Tide | Hard, generic |
|---|---|---|---|---|---|---|
| Win: Easy ~90%, Standard ~75%, Hard 55–60% | 85% (**no**) | 85% (**no**) | 74% (yes) | 73% (yes) | 61% (**no**) | 60% (**no**) |
| Loss: Easy ≤5%, Standard 5–15%, Hard 15–30% | 0% (yes) | 0% (yes) | 7% (yes) | 8% (yes) | 21% (yes) | 22% (yes) |
| Every cell within 5 points of the label's win target | 80–90% (**no**) | 80–90% (**no**) | 68–80% (**no**) | 67–80% (**no**) | 57–63% (**no**) | 57–63% (**no**) |
| Showdown: median 3–5 rounds | 2 (mean 2.4) (**no**) | 2 (mean 2.4) (**no**) | 3 (mean 3.0) (yes) | 3 (mean 3.0) (yes) | 4 (mean 3.7) (yes) | 4 (mean 3.6) (yes) |
| A witch Down: Easy ≤15%, Standard ≥25%, Hard ≥40% | 2% (yes) | 2% (yes) | 35% (yes) | 38% (yes) | 57% (yes) | 60% (yes) |

## 3. Every move at every label

All sizes pooled, with and without a guardian player. **vs plain** is the move's win minus a plain attack's: negative means the move makes the episode harder than an ordinary attack would.

| Move | Easy: Win / Partial / Loss | Standard | Hard | Win vs generic (E / S / H) | Win vs plain (E / S / H) |
|---|---|---|---|---|---|
| Generic (REPORT.md) | 85% / 15% / 0% | 73% / 19% / 8% | 60% / 18% / 22% | 0.0 / 0.0 / 0.0 | −0.1 / −0.6 / −1.5 |
| No move (a plain attack) | 85% / 15% / 0% | 74% / 19% / 7% | 62% / 18% / 20% | +0.1 / +0.6 / +1.5 | 0.0 / 0.0 / 0.0 |
| Two different characters | 85% / 15% / 0% | 73% / 19% / 8% | 60% / 18% / 22% | 0.0 / −0.3 / +0.1 | 0.0 / −0.9 / −1.4 |
| The Quiet Man: Hush | 85% / 15% / 0% | 73% / 19% / 8% | 60% / 17% / 23% | 0.0 / −0.3 / −0.1 | 0.0 / −0.9 / −1.6 |
| The Ash Widow: Cinders | 85% / 15% / 0% | 74% / 19% / 7% | 62% / 18% / 20% | +0.2 / +0.1 / +1.5 | +0.1 / −0.5 / +0.1 |
| The Mirror Thief: Borrowed Face | 85% / 15% / 0% | 74% / 19% / 7% | 62% / 19% / 20% | +0.4 / +0.9 / +1.6 | +0.3 / +0.2 / +0.1 |
| The Night Nurse: Drain | 85% / 15% / 0% | 74% / 19% / 7% | 61% / 18% / 21% | +0.1 / +0.5 / +1.0 | 0.0 / −0.1 / −0.4 |
| Vesper Crane: Turned Spell | 84% / 16% / 0% | 74% / 19% / 7% | 61% / 19% / 20% | −0.4 / +0.4 / +1.2 | −0.4 / −0.3 / −0.3 |
| The Drowned Choir: Lure | 85% / 15% / 0% | 73% / 19% / 8% | 61% / 18% / 21% | 0.0 / −0.2 / +0.5 | 0.0 / −0.9 / −1.0 |

The generic move and "two different characters" differ only in where the first attack goes (REPORT.md aims it like a 1–3, at whoever hurt the threat last; ruling 63 aims it at the most Hurt): Easy 0.0, Standard −0.3, Hard +0.1 points. At Hard the generic move keeps the label at 60.2%, near the top of its 55–60% band; every move that is one attack (Hush, Cinders, Borrowed Face, Drain, Turned Spell, Lure) puts Hard above 60%.

## 4. Showdown length and witches Down

| Move | Rounds, median / mean / 90%: Easy | Standard | Hard | A witch Down (E / S / H) | Witches Down per episode (E / S / H) | Guardian Down (E / S / H) |
|---|---|---|---|---|---|---|
| Generic (REPORT.md) | 2 / 2.4 / 3 | 3 / 3.0 / 4 | 4 / 3.6 / 5 | 2% / 38% / 60% | 0.0 / 0.6 / 1.2 | 1% / 45% / 65% |
| No move (a plain attack) | 2 / 2.4 / 3 | 3 / 3.0 / 4 | 4 / 3.6 / 5 | 2% / 35% / 55% | 0.0 / 0.5 / 1.0 | 1% / 42% / 61% |
| Two different characters | 2 / 2.4 / 3 | 3 / 3.0 / 4 | 4 / 3.6 / 5 | 2% / 38% / 60% | 0.0 / 0.6 / 1.2 | 1% / 45% / 65% |
| The Quiet Man: Hush | 2 / 2.4 / 3 | 3 / 3.0 / 4 | 4 / 3.6 / 5 | 2% / 39% / 60% | 0.0 / 0.6 / 1.2 | 1% / 45% / 65% |
| The Ash Widow: Cinders | 2 / 2.4 / 3 | 3 / 3.0 / 4 | 3 / 3.6 / 5 | 1% / 35% / 54% | 0.0 / 0.5 / 1.0 | 1% / 39% / 57% |
| The Mirror Thief: Borrowed Face | 2 / 2.4 / 3 | 3 / 3.0 / 4 | 3 / 3.6 / 5 | 1% / 33% / 54% | 0.0 / 0.5 / 1.0 | 1% / 35% / 53% |
| The Night Nurse: Drain | 2 / 2.4 / 3 | 3 / 3.0 / 4 | 4 / 3.6 / 5 | 2% / 35% / 56% | 0.0 / 0.5 / 1.0 | 1% / 42% / 61% |
| Vesper Crane: Turned Spell | 2 / 2.4 / 3 | 3 / 3.0 / 4 | 4 / 3.6 / 5 | 2% / 36% / 56% | 0.0 / 0.5 / 1.0 | 1% / 44% / 61% |
| The Drowned Choir: Lure | 2 / 2.4 / 3 | 3 / 3.1 / 4 | 4 / 3.7 / 5 | 2% / 36% / 57% | 0.0 / 0.5 / 1.1 | 1% / 43% / 63% |

## 5. Win by cell, every move

Bold: more than 5 points from the label's win target. The episode's own move is in its label's rows: Easy Hush, Standard Cinders, Hard Lure.

| Label | Players | Guardian player | generic | plain | two attacks | Hush | Cinders | Borrowed Face | Drain | Turned Spell | Lure |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Easy | 3 | no | 86% | 86% | 87% | 87% | 87% | 86% | 86% | 86% | 86% |
| Easy | 3 | yes | 90% | 90% | 90% | 90% | 90% | 90% | 90% | 90% | 90% |
| Easy | 4 | no | **83%** | **83%** | **82%** | **82%** | **83%** | **83%** | **83%** | **82%** | **82%** |
| Easy | 4 | yes | 86% | 86% | 87% | 86% | 86% | 87% | 86% | 86% | 86% |
| Easy | 5 | no | **80%** | **81%** | **80%** | **80%** | **80%** | **81%** | **81%** | **79%** | **81%** |
| Easy | 5 | yes | **84%** | **83%** | **84%** | **84%** | **84%** | **84%** | **83%** | **83%** | **83%** |
| Standard | 3 | no | 75% | 76% | 75% | 75% | 76% | 76% | 76% | 76% | 75% |
| Standard | 3 | yes | 80% | **80%** | 79% | 79% | 80% | 80% | **80%** | 80% | 79% |
| Standard | 4 | no | 71% | 71% | 70% | 70% | 71% | 71% | 71% | 70% | 70% |
| Standard | 4 | yes | 75% | 76% | 75% | 75% | 75% | 76% | 76% | 75% | 75% |
| Standard | 5 | no | **67%** | **68%** | **68%** | **67%** | **68%** | **69%** | **68%** | **69%** | **68%** |
| Standard | 5 | yes | 72% | 73% | 72% | 72% | 72% | 74% | 73% | 73% | 72% |
| Hard | 3 | no | 61% | 62% | 61% | 61% | 62% | 62% | 62% | 62% | 62% |
| Hard | 3 | yes | 62% | **63%** | 62% | 62% | **64%** | **64%** | **63%** | 62% | 62% |
| Hard | 4 | no | 57% | 60% | 57% | 56% | 58% | 59% | 59% | 60% | 57% |
| Hard | 4 | yes | 57% | 60% | 58% | 58% | 60% | 60% | 59% | 59% | 58% |
| Hard | 5 | no | 61% | 61% | 61% | 61% | 61% | 61% | 61% | 61% | 62% |
| Hard | 5 | yes | **63%** | **64%** | **63%** | **63%** | **65%** | **65%** | **64%** | **64%** | **63%** |

## 6. How often each move comes up, and what it does

A move is used on a 6 when no free innocent is there. **Used** is the share of episodes where the threat used its move at least once. The effects are averages per episode.

| Move | Used (E / S / H) | Uses per episode (E / S / H) | What it did per episode: Standard | Hard |
|---|---|---|---|---|
| Generic (REPORT.md) | 27% / 28% / 34% | 0.29 / 0.31 / 0.41 | — | — |
| No move (a plain attack) | 27% / 28% / 34% | 0.29 / 0.31 / 0.42 | — | — |
| Two different characters | 27% / 28% / 34% | 0.29 / 0.31 / 0.42 | — | — |
| The Quiet Man: Hush | 27% / 28% / 34% | 0.29 / 0.31 / 0.43 | 0.3 hushed, 0.2 turns without casting | 0.4 hushed, 0.2 turns without casting |
| The Ash Widow: Cinders | 27% / 28% / 34% | 0.29 / 0.31 / 0.41 | 1.2 attacks, 1.0 Hurt | 1.5 attacks, 1.2 Hurt |
| The Mirror Thief: Borrowed Face | 27% / 28% / 34% | 0.29 / 0.31 / 0.42 | 0.1 Magic and 0.0 Ward lost | 0.2 Magic and 0.0 Ward lost |
| The Night Nurse: Drain | 27% / 28% / 34% | 0.29 / 0.31 / 0.42 | 0.2 drains, 0.0 damage cleared | 0.3 drains, 0.2 damage cleared |
| Vesper Crane: Turned Spell | 27% / 28% / 34% | 0.29 / 0.31 / 0.42 | 0.1 Failures at Hit +1 | 0.2 Failures at Hit +1 |
| The Drowned Choir: Lure | 27% / 28% / 34% | 0.29 / 0.32 / 0.44 | 0.3 rolls, 0.2 Failures, 0.2 turns lost | 0.4 rolls, 0.3 Failures, 0.3 turns lost |

## 7. Flags

Flag rules: an episode is off target when its pooled win is outside its label's band, or a cell is more than 5 points from the label's win target; a move **pushes** it off when the generic move keeps it on target, or the move moves the win more than 5 points. A move is **dead** when it is within ±2 points of win of a plain attack at every label (DESIGN-RULES A9), **dominated** when the coven wins more and goes Down less against it than against a plain attack at Standard and Hard, and **dominant** when it is more than 5 points of win harder than "two different characters" at any label.

| Flag | What | Numbers | Smallest fix |
|---|---|---|---|
| episode off target (label) | 1. Night Market (Easy, Hush) | Win 84.8% (target 85–95%; generic move 84.8%). Cells more than 5 points off: 4 players (82.0%), 5 players (80.3%), 5 players with a guardian player (83.7%). The generic move is off in the same way, so the label, not the move, is the cause. | Not the move: with the generic move Easy is 84.8% (cells 80.2–89.9%, REPORT.md §1), off in the same way, and Hush changes the pooled win by 0.0 points. Leave Hush as it is. |
| episode off target (label) | 2. Cinders (Standard, Cinders) | Win 73.5% (target 70–80%; generic move 73.4%). Cells more than 5 points off: 5 players (67.8%). The generic move is off in the same way, so the label, not the move, is the cause. | Not the move: with the generic move Standard is 73.4% (cells 67.4–79.5%, REPORT.md §1), off in the same way, and Cinders changes the pooled win by +0.1 points. Leave Cinders as it is. |
| episode off target (label) | 3. Low Tide (Hard, Lure) | Win 60.7% (target 55–60%; generic move 60.2%). Cells more than 5 points off: 5 players with a guardian player (63.0%). The generic move is off in the same way, so the label, not the move, is the cause. | Not the move: with the generic move Hard is 60.2% (cells 56.9–63.0%, REPORT.md §1), off in the same way, and Lure changes the pooled win by +0.5 points. Leave Lure as it is. |
| the yardstick itself is dead | Two different characters | Win vs a plain attack Easy 0.0, Standard −0.9, Hard −1.4; a witch Down 2% (plain 2%), 38% (plain 35%), 60% (plain 55%). Used in 27% / 28% / 34% of episodes (E / S / H). | None: Chapter 10's yardstick for a move is itself under ±2 points, so every move meets "about as strong as two different characters", and none is dominant. |
| dead (A9: under ±2 points) | The Quiet Man: Hush | Win vs a plain attack Easy 0.0, Standard −0.9, Hard −1.6; a witch Down 2% (plain 2%), 39% (plain 35%), 60% (plain 55%). Used in 27% / 28% / 34% of episodes (E / S / H). | See the note under this table. |
| dead (A9: under ±2 points) | The Ash Widow: Cinders | Win vs a plain attack Easy +0.1, Standard −0.5, Hard +0.1; a witch Down 1% (plain 2%), 35% (plain 35%), 54% (plain 55%). Used in 27% / 28% / 34% of episodes (E / S / H). | See the note under this table. |
| dead (A9: under ±2 points) | The Mirror Thief: Borrowed Face | Win vs a plain attack Easy +0.3, Standard +0.2, Hard +0.1; a witch Down 1% (plain 2%), 33% (plain 35%), 54% (plain 55%). Used in 27% / 28% / 34% of episodes (E / S / H). | See the note under this table. |
| dominated by a plain attack | The Mirror Thief: Borrowed Face | The coven wins more and goes Down less against it than if the threat simply attacked. Win vs a plain attack Easy +0.3, Standard +0.2, Hard +0.1; a witch Down 1% (plain 2%), 33% (plain 35%), 54% (plain 55%). | "Borrowed Face: attack the witch with the most Magic left, with Hit 1 higher; on a Failure they also lose 1 Magic." Tested (§8): Easy +0.3, Standard −0.2, Hard −0.7 points against a plain attack, so it is no longer weaker than a plain attack. It isn't in a ready-made episode, so this is low priority. |
| dead (A9: under ±2 points) | The Night Nurse: Drain | Win vs a plain attack Easy 0.0, Standard −0.1, Hard −0.4; a witch Down 2% (plain 2%), 35% (plain 35%), 56% (plain 55%). Used in 27% / 28% / 34% of episodes (E / S / H). | See the note under this table. |
| dead (A9: under ±2 points) | Vesper Crane: Turned Spell | Win vs a plain attack Easy −0.4, Standard −0.3, Hard −0.3; a witch Down 2% (plain 2%), 36% (plain 35%), 56% (plain 55%). Used in 27% / 28% / 34% of episodes (E / S / H). | See the note under this table. |
| dead (A9: under ±2 points) | The Drowned Choir: Lure | Win vs a plain attack Easy 0.0, Standard −0.9, Hard −1.0; a witch Down 2% (plain 2%), 36% (plain 35%), 57% (plain 55%). Used in 27% / 28% / 34% of episodes (E / S / H). | See the note under this table. |
| rider dead | Hush's "can't cast on their next action" | Hush against the same two attacks without it: Easy 0.0, Standard 0.0, Hard −0.2 points of win; 0.2 turns without casting per Hard episode. | None needed for balance: Hush is already the hardest of the six at Standard and Hard, because it is two attacks. The rider rarely bites, because a hushed witch still makes a plain Nerve attack and loses only her Power's 2 dice or a spell. |

**Why the moves are dead.** A move needs a 6 with no free innocent, and showdowns are short, so the threat uses its move in only 27–34% of episodes (0.29–0.44 times per episode). When it does, most moves are worth about one attack. Making a 5 use the move too (§8) lifts only two attacks, Hush and Lure past ±2 points. The moves still change who goes Down (at Hard, a witch goes Down in 54–60% of episodes, depending on the move), so they give each threat its own feel without moving the win. No balance fix is needed: whichever threat the coven meets, the label's numbers hold, which is what lets any threat go with any label. If Richard wants the moves to swing results (DESIGN-RULES A9), they would have to come up more often and do more than one attack's worth, and every label would need re-tuning.

Summary of flags: episodes pushed off target by their move 0; episodes off target because of their label 3; dead moves, the yardstick included, 7; moves dominated by a plain attack 1; dominant moves 0.

## 8. Sensitivity

### Lure: the players' dice (Low Tide, Hard)

| Setting | Value | Win / Partial / Loss | Cells | A witch Down | Turns lost per episode |
|---|---|---|---|---|---|
| (defaults) | — | 60.7% / 18.1% / 21.2% | 57.5–63.0% | 57% | 0.3 |
| lureDice | none | 60.5% / 18.2% / 21.3% | 57.1–63.0% | 57% | 0.3 |

- **lureDice** — Players: a lured witch spends spare Magic (above the 2 kept for the Unmaking) on up to +2 dice, as for a defence that could put them Down (spare), or rolls Heart alone (none). (Policy, not a rule)

### If a 5 also used the move (not in the book)

A test of the smallest rule change that would make the moves come up twice as often: the signature move on a 5 or a 6 (a free innocent is still only a 6, and the 4–5 result becomes 4 only). A plain attack is the same either way, so **vs plain** compares like with like.

| Move | Win vs plain, move on a 6 (E / S / H) | Win vs plain, move on a 5–6 (E / S / H) | Win / Loss with the move on a 5–6 (E; S; H) | Uses per episode on a 5–6 (E / S / H) |
|---|---|---|---|---|
| Two different characters | 0.0 / −0.9 / −1.4 | +0.1 / −1.9 / −4.4 | 85% / 0%; 72% / 9%; 57% / 25% | 0.56 / 0.65 / 0.90 |
| The Quiet Man: Hush | 0.0 / −0.9 / −1.6 | +0.1 / −2.1 / −4.8 | 85% / 0%; 72% / 9%; 57% / 26% | 0.56 / 0.66 / 0.91 |
| The Ash Widow: Cinders | +0.1 / −0.5 / +0.1 | +0.9 / −0.9 / −0.4 | 86% / 0%; 73% / 8%; 61% / 21% | 0.56 / 0.64 / 0.84 |
| The Mirror Thief: Borrowed Face | +0.3 / +0.2 / +0.1 | +0.9 / +0.6 / −0.4 | 86% / 0%; 75% / 7%; 61% / 20% | 0.56 / 0.63 / 0.86 |
| The Night Nurse: Drain | 0.0 / −0.1 / −0.4 | 0.0 / −0.3 / −1.2 | 85% / 0%; 74% / 8%; 60% / 22% | 0.56 / 0.65 / 0.90 |
| Vesper Crane: Turned Spell | −0.4 / −0.3 / −0.3 | −0.7 / −0.8 / −0.5 | 84% / 0%; 73% / 7%; 61% / 20% | 0.56 / 0.64 / 0.87 |
| The Drowned Choir: Lure | 0.0 / −0.9 / −1.0 | +0.2 / −2.1 / −3.0 | 85% / 0%; 72% / 8%; 59% / 23% | 0.56 / 0.68 / 0.96 |

### Candidate fixes (not in the book)

The smallest wording changes for the flagged moves (section 7), run over the whole grid like the moves above.

| Move | Win / Loss (E; S; H) | Win vs plain (E / S / H) | Win vs two attacks (E / S / H) | A witch Down (E / S / H) | Cells (E; S; H) |
|---|---|---|---|---|---|
| No move (a plain attack) | 84.8% / 0.0%; 74.0% / 7.2%; 61.6% / 19.9% | 0.0 / 0.0 / 0.0 | 0.0 / +0.9 / +1.4 | 2% / 35% / 55% | 80.5–90.1%; 68.4–80.3%; 59.6–64.5% |
| Two different characters | 84.8% / 0.0%; 73.2% / 7.8%; 60.2% / 22.3% | 0.0 / −0.9 / −1.4 | 0.0 / 0.0 / 0.0 | 2% / 38% / 60% | 80.3–89.7%; 67.5–79.0%; 56.5–63.0% |
| Borrowed Face at Hit +1 (candidate) | 85.1% / 0.0%; 73.8% / 7.2%; 60.9% / 20.1% | +0.3 / −0.2 / −0.7 | +0.3 / +0.7 / +0.7 | 1% / 35% / 55% | 80.7–89.9%; 68.7–79.3%; 58.6–63.1% |

- **Borrowed Face at Hit +1 (candidate)** — Not in the book. 'Borrowed Face: attack the witch with the most Magic left, with Hit 1 higher; on a Failure they also lose 1 Magic.' Otherwise as Borrowed Face.

## 9. Readings used

For every move:

- A move picks only standing characters, when it starts; a target who goes Down during the move isn't attacked again (rulings 63, 81).
- "One attack" is aimed like a 4–5: the most Hurt, standing. "Two different characters" are the most Hurt, then the next most Hurt, both standing (ruling 63).
- Ties go to the Storyteller; the simulator picks at random (ruling 63).
- Hold: an attacking move puts the guardian first and uses Hold up; a part of a move that isn't an attack (Lure's roll) ignores Hold, which stays for the next attack (rulings 64, 82, 88).
- A 6 still goes for a free innocent instead of the move (attacking their guard, or taking them), as before (Ch 7, ruling 85).
- "Next action" (Hush, Lure) is the character's next turn: this round's in round 1, when the threat acts first, and next round's after that, when everyone has had their turn. A Down character keeps it until they are back up and take a turn (ruling 63).
- The player policies are REPORT.md's; nobody plays around a move (for example, nobody keeps Heart high against Lure or Magic low against Borrowed Face).

Each move (`sim/params.mjs` THREATS):

- **Generic (REPORT.md)** — What REPORT.md uses: judgement.signature. With the default 'double', the first attack is aimed like a 1–3 (whoever hurt it last, else the most Hurt) and the second at the most Hurt of the rest; 'heavy' is one attack with Hit 1 higher. (CORE-RULES The threat: '6 its signature move (if it has none, it attacks two different characters)')
- **No move (a plain attack)** — Not in the book. A 6 is one ordinary attack aimed like a 4–5. The floor: a move that does no better than this doesn't matter. (Yardstick only)
- **Two different characters** — The move for a threat with none, read by ruling 63: attack the most Hurt, then the next most Hurt, both standing. The book's yardstick for a new move ('about as strong as attack two different characters'). It is Hush without the 'can't cast'. (Ch 7 move table; Ch 10 'Making your own threat'; REVIEW 63)
- **The Quiet Man: Hush** — Attack two different characters (the most Hurt, then the next most Hurt). The first of them, in that order, who takes any Hurt can't cast on their next action. Under Shield, the guardian took the attack, so it is the one hurt. Can't cast = on that turn no Power dice, no Surge, no spell (so no leading or joining the Unmaking as their action), no potion and no guardian gift that takes an action (Mend, Carry). Not stopped: things outside their turn (defence rolls and their Power dice, Sight's miss, helping, Shield, a Down witch joining the Unmaking) and acts that aren't casting (a plain Nerve attack, freeing or studying with the Power left off, guarding, Hold). A second Hush before that turn changes nothing. (Ch 10 The Quiet Man; REVIEW 63, 64)
- **The Ash Widow: Cinders** — Attack every standing character, the guardian included, each at Hit 1 (so a Partial and a Failure both do 1 Hurt). Order: the guardian first under Hold, then the most Hurt first; the order only matters for Shield (once a round: the guardian may take one witch's attack as well as its own) and Sight's miss (once a showdown). (Ch 10 The Ash Widow; REVIEW 63, 64)
- **The Mirror Thief: Borrowed Face** — Attack the standing witch with the most Magic left (ties at random) at the normal Hit; on a Failure they also lose 1 Magic (none if they have none). Under Hold it attacks the guardian, which loses 1 Ward instead. Under Shield the guardian takes the attack and, on a Failure, loses 1 Ward (read like ruling 82). Lost Magic isn't counted as spent. (Ch 10 The Mirror Thief; REVIEW 81, 82)
- **The Night Nurse: Drain** — One attack aimed like a 4–5 (most Hurt, standing; the guardian under Hold). If it does any Hurt (a Partial or a Failure, to whoever takes it, Shield included), the threat clears up to 2 of its marked damage, never below 0. (Ch 10 The Night Nurse; REVIEW 63)
- **Vesper Crane: Turned Spell** — One attack aimed like a 4–5 with Hit 1 higher (a Partial is still 1 Hurt). The same as the generic 'heavy' reading. (Ch 10 Vesper Crane; REVIEW 63)
- **The Drowned Choir: Lure** — Ruling 88: one attack, aimed like a 4–5 (most Hurt, standing; the guardian under Hold). Then the standing character with the lowest Heart (the guardian included; ties at random) rolls Heart against Danger. No Power fits that roll and it isn't casting. No Hurt on a Partial or a Failure; on a Failure they lose their next action: that turn they do nothing (no action, so no potion either; they can still help, defend and use Sight's miss). The roll isn't an attack, so Shield, Hold and Sight's miss don't touch it, and Hold stays for the next attack. A second Lure before that turn changes nothing. The players' dice for the roll are threatJudgement.lureDice. (Ruling 88 in book/REVIEW.md (one attack, then the Lure roll; no Hurt from the roll); Ch 10 The Drowned Choir; REVIEW 63, 81, 82)

## 10. Not covered here

- Shelter is never cast (as in REPORT.md), so Shelter against Cinders, and Shelter not stopping Lure, never come up.
- Seasons (REPORT.md §11, `season.mjs`) still use the generic move for all six kinds of threat.
- Low Tide played as the 3rd episode of a season (Chapter 16's Season column: 2 more Toughness per witch, after the coven has grown once) isn't run. Every episode here starts fresh, as in REPORT.md.
- The episodes' leads, twists and places are story. Only the label and the threat's move change the numbers.
- Nobody plays around a move: no witch keeps Magic low against Borrowed Face or puts a higher rating into Heart against Lure.

