# Verification playtest: core rules v0.7

- **Rules used:** `docs/CORE-RULES.md` v0.7 only. Nothing else was treated as a rule. The glossary was read only to check words.
- **Episode 1:** Hard, 5 players: 4 witches and a guardian player. Experienced players who play to win and hunt for edges. A Storyteller.
- **Episode 2:** Standard, 3 players, no guardian player. Newer players making sensible choices.
- **Dice:** every roll came from a dice script (`node roll.mjs "label" dice [difficulty]`, `Math.random`, faces 1–6). Each roll was logged with a label as it was made. Section 10 lists all 148 rolls (X001–X148). Roll IDs are cited throughout. No roll was invented, changed or made again.
- **Results:**
  - **Episode 1: Win.** All 20 Clues by the end of scene 4 (Doom 4). Hidden showdown. The threat struck first and made 4 attacks in two rounds. The guardian and one witch went Down. Broken in round 3 by a 2-dice Nerve attack. The Unmaking (a coin flip at 7 dice against 4) worked in round 4.
  - **Episode 2: Win.** All 11 Clues by the end of scene 4 (Doom 4). Hidden showdown. The threat made 1 attack (round 1). Bind took its round-2 attack. Broken in round 2, destroyed in round 3.
- **Short verdict:** v0.7 fixed what it set out to fix. The threat now attacks: 4 attacks in the Hard fight, and the round-1 strike shaped both fights. Shield, Binding, wasted lost attacks, Down guards and the mark timing all ran with no ruling. But moving the threat to the front of round 1 broke the innocent rule: read literally, **an innocent in its grip is lost before any witch can act** (V1, blocker). It also makes a guard or Shelter cast in round 1 do nothing (V2). Against 3 characters, Bind every round leaves the threat with one attack per fight (V3).

Severity used below: **blocker** = the text gives opposite answers that change the result, or a core design goal fails in play; **confusing** = a table has to stop and invent a ruling, or a core choice doesn't work; **minor** = wording, or a gap that rarely matters.

---

## 1. Verification table

Status: **fixed** = the v0.7 text answers it; **partly** = some of it is answered; **not changed** = no new text answers it; **changed differently** = answered, but not in the way the issue suggested. Quotes are from `docs/CORE-RULES.md` v0.7, with bold removed.

| N# | Issue (short) | Status | v0.7 text that answers it, or what is still open |
|---|---|---|---|
| N1 | Threat Broken before it ever acted | fixed | "Then the threat acts (in the first round it acts before the characters instead)." Tracks: "(in round 1, the threat's attacks first)". Toughness was also cut (Standard 3 × w, Hard 4 × w). In play the threat attacked in every fight: 4 attacks in Episode 1, 1 in Episode 2, 1 in each season drill. But see V1, V2 and V3, which this change opened or uncovered. |
| N2 | Shelter plus unlimited Shields cancels a round | fixed | "Shield (no action, once a round)". D4: the second Shield was refused with no argument. |
| N3 | A Down guard or Shelter caster never ends; two guards | partly | Down is fixed: guard "(… it ends if you go Down)" and Shelter "(it ends if you go Down)". D5 ran clean. Still open: "it attacks their guard" doesn't say which one if two characters guard. |
| N4 | Seen pushes Doom to the mark mid-scene | fixed | "At the end of each scene, Doom +1. The Showdown mark is only checked then, even if Doom rose during the scene." D6b: Doom hit 5 mid-scene, the scene ran on, the showdown started at Doom 6. No ruling. |
| N5 | Blasting declared before or after the roll | fixed | "Say you're using a potion before you roll; it's used up either way." Used three times in Episode 1 with no question. |
| N6 | Potion cap: does the guardian count; whole stock or carried | fixed | "can have at most one per character, guardian included; extra potions from a brew are lost." New gap with no guardian player: V6. |
| N7 | Banked lost attacks; Binding with no roll | changed differently | Suggested a carry limit or a Danger cut. v0.7 instead: "Binding: use it with your attack; if the attack works, the threat loses its next attack" and "any more are wasted." D2 and D3 ran clean. But a Bind every round still leaves a 1-attack threat with nothing (V3). |
| N8 | Going before Doom 4 is dominated by going at Doom 4 | not changed | No new text. Both tables had half the Clues early (Episode 1 at Doom 2, Episode 2 at Doom 3) and both waited until Doom 4 with no debate. |
| N9 | Once Seen, only the first casting cost per scene counts | not changed | Still "any further rise becomes Doom +1 instead (once per round or scene)". In D6b, after Wren's failed Reveal became Doom +1, any later casting cost that scene would have been free. |
| N10 | Critical die: inside the limit; next episode | fixed | "+1 die on your next roll this episode (inside the +2 limit)". Small usability note: the die was forgotten once (X133; it could not have changed the result). |
| N11 | What a failed Hide costs | fixed | "Casting Hide never raises Exposure, so its cost is always 1 Hurt." |
| N12 | Is a roll with Sense on it casting; Sense limits | partly | Casting is answered, the other way from the suggestion: "A helper's die or Sense doesn't make your roll casting." Still no limit: "Sense (no action): +1 die on a lead this scene" allows several Senses in a scene and two on one lead. (The simulator plays one Sense a scene; the text doesn't say so.) |
| N13 | Hold and the d6; Hold against a 6 or a signature move; a lost attack's d6 | partly | "roll a d6 (even for an attack Hold has aimed, since a 6 can still take the innocent)". Still open: a Held attack whose d6 shows 6 with no free innocent (does a signature move that picks its own target obey Hold?); a Held 6 with a guarded innocent (guard or guardian?); and whether a lost attack rolls its d6. D12's Held die showed 5, so it didn't come up. |
| N14 | Guardian ratings fixed or placed | fixed | "The guardian puts 3, 2 and 2 into Heart, Wits and Nerve". (The v0.6 ruling was "fixed"; v0.7 chose "placed". Moss took Nerve 3.) |
| N15 | Season Toughness adds up; guardian growth; "next time" | partly | Adding up is answered, with a new shape: "After the 2nd and the 4th episodes, threats also get 2 more Toughness per witch (so 4 more per witch from the 5th episode on)." D7 used it with no question. Still unstated: does the guardian grow, and does "next time, start with half the Clues" mean the next episode or the next time that kind of threat comes? |
| N16 | "Most hurt": boxes or closeness; nobody standing | partly | "whoever has the most Hurt marked and is still standing". Boxes are answered. Still open: the second attack in a round when every witch is Down and the guardian has faded. |
| N17 | Lives can repeat | fixed | "d6, reroll one someone has". Note: one witch needed 9 rolls in Episode 1 setup (V12). |
| N18 | Glossary: casting in public; Difficulty 1–4 | fixed | Glossary now: "In a public showdown, any round with casting raises Exposure by 1; out in the city, a casting roll's cost is Exposure" and "usually 1–4; the Unmaking can be higher". But other glossary entries weren't updated for v0.7 (V7). |

### Counts

| Fixed | Partly | Not changed | Changed differently | Total |
|---|---|---|---|---|
| **10** (N1, N2, N4, N5, N6, N10, N11, N14, N17, N18) | **5** (N3, N12, N13, N15, N16) | **2** (N8, N9) | **1** (N7) | **18** |

The v0.6 blocker (N1) is fixed: the threat attacked in every fight. The fix itself caused a new blocker (V1) because "The innocent" paragraph still times the loss by when the threat acts.

---

## 2. Setup

### Episode 1 numbers (Hard; w = 4 witches; n = 5 with the guardian player)

| Item | Value | How it was worked out |
|---|---|---|
| Lead Difficulty | 2 | table |
| Defence / Danger | 2 / 3 | table; Defence 3 until the Weakness is known |
| Hit | 3 | table |
| Toughness | 16 | 4 × 4. No extra 3 (that is only for 3 witches and no guardian player) |
| Attacks a round | 2 | "2 against 4 or 5" characters |
| Clues needed | 20 (half = 10) | 4 × 5 |
| Exposure boxes | 4 | table |
| Doom | 12, mark at 5 | Tracks |
| Unmaking Difficulty | 4 (6 without the Weakness) | number of witches, +2 |
| Potion cap | 5 | "one per character, guardian included" |

### Episode 1 characters

Powers rolled in the page's order (1 Force, 2 Flame, 3 Sight, 4 Voice, 5 Veil, 6 Wild): X001 = 5, X002 = 4, X003 = 3, X004 = 4 (taken) → X005 = 6. **No Force and no Flame**, so no Power adds dice to an attack. Lives: X006 = 1, X007 = 1 (taken), X008 = 5, X009 = 3; witch 2 rerolled X010–X018 until a free job came up (nurse). Ratings 3, 2, 2, 1 placed to win: every witch kept Nerve 2, because Hard hits for 3.

| Witch | Power | Heart | Wits | Nerve | Craft | Life | Hurt | Magic | Plan |
|---|---|---|---|---|---|---|---|---|---|
| Wren Okafor | Veil | 1 | 2 | 2 | **3** | student | 0/4 | 5 | Blast; Veil Surge to make a scene's casting safe |
| Juno Sallis | Voice | **3** | 1 | 2 | 2 | nurse | 0/4 | 5 | Talking leads (6 dice with Voice and Life) |
| Odile Brack | Sight | 1 | **3** | 2 | 2 | mechanic | 0/4 | 5 | Book research every scene; Sight's fight Surge |
| Pim Larkin | Wild | 1 | 2 | 2 | **3** | shop worker | 0/4 | 5 | Brew with Wild (5 dice); Bind; Blast; lead the Unmaking |

**Moss**, the guardian: an old spirit bound to the coven's rooms over a closed-down cinema. A heron, or a woman in a waxed coat. Placed Heart 2, Wits 2, **Nerve 3** (for Hold and defence). Hurt 0/5. Ward 5.

**The threat: the Tallyman.** A debt-taker that buys years from desperate people and collects them all at once. Men are found aged forty years overnight.
- Defence 2 (3 until the Weakness), Danger 3, Hit 3, Toughness 16, 2 attacks a round.
- **Signature move, Collect:** one attack on the standing character with the most Magic (or Ward) left; if it does any Hurt, they also lose 1 Magic (or Ward).
- **Weakness:** his own ledger, burned with one of his coins.
- **Plan:** at Doom 12 he collects from the innocent.

**The innocent:** Tobias Rook, a pawnbroker who signed something he shouldn't have.

### Episode 2 numbers (Standard; w = 3; n = 3; no guardian player)

| Item | Value | How it was worked out |
|---|---|---|
| Lead Difficulty | 2 | table |
| Defence / Danger | 2 / 3 | table; Defence 3 until the Weakness |
| Hit | 2 (3 on its signature move) | table |
| Toughness | 12 | 3 × 3, plus 3 "against a coven of 3 witches and no guardian player" |
| Attacks a round | 1 | "1 attack a round against 3 characters" |
| Clues needed | 11 (half = 6) | 4 × 3 − 1 |
| Exposure boxes | 4 | table |
| Unmaking Difficulty | 3 (5 without the Weakness) | number of witches, +2 |
| Potion cap | 3 | ruling V6 (4 if the uncalled guardian counts) |
| The call | once: one Mend or one Carry | "No guardian player" |

### Episode 2 characters

Powers: X058 = 5 Veil, X059 = 1 Force, X060 = 6 Wild. Lives: X061 = 1, X062 = 1 (taken) → X064 = 4, X063 = 3. Newer players placed ratings where the Power fits.

| Witch | Power | Heart | Wits | Nerve | Craft | Life | Hurt | Magic |
|---|---|---|---|---|---|---|---|---|
| Hana Petrova | Veil | 2 | **3** | 2 | 1 | student | 0/4 | 5 |
| Tom Achebe | Force | 2 | 1 | **3** | 2 | teacher | 0/4 | 5 |
| Bel Ferris | Wild | 2 | 1 | 2 | **3** | shop worker | 0/4 | 5 |

**The threat: the Ash-Wife.** A hearth spirit in a condemned tower block, starting small fires to drive the last tenants out.
- Defence 2 (3 until the Weakness), Danger 3, Hit 2, Toughness 12, 1 attack a round.
- **Signature move, Flare:** one attack on the standing character with the least Hurt marked (ties: the Storyteller picks), at Hit 3.
- **Weakness:** water from the tower's flooded basement, poured on her hearthstone.

**The innocent:** Lottie Shaw, a night-shift baker on the 14th floor.

### Rulings used (both episodes and the drills)

| Ruling | Where it came up | Issue |
|---|---|---|
| An innocent in its grip is checked at the end of round 1, after the characters act (the Tracks order) | D1a, D8 | V1 |
| A guard or Shelter made in round 1 lasts only until that character's round-2 action, as written | D8 | V2 |
| The potion cap counts the guardian only if a player plays it | Episode 2 (never bit), D9 | V6 |
| The no-guardian call is made at the start of a round or on a witch's turn, not during the threat's attacks | D10 | V4 |
| Under Veil's Surge, a casting roll's cost becomes 1 Hurt | D11 only (no casting roll failed under Veil in Episode 1) | V5 |
| Potions: one a round **per character** | Episode 1 round 1 (three witches each used one) | V8 |
| A character may take no action in a round | Episode 1 round 1 (Moss) | V9 |
| A brew may make mixed kinds | Episode 1 S1, Episode 2 S1 | carried (B29) |
| Magic may go above 5 | Episode 2 S2 (Tom 6) | carried (A25/B24) |
| Wild's fight Surge takes effect after its own roll | Episode 2 round 1 (made no difference) | carried (B30) |
| Storyteller ties are picked with a logged die | throughout | — |
| Sight's fight Surge follows its own text (no roll, no action), not the general Surge line | Episode 1 round 1 | carried (B12) |

### Setup time (estimate)

- Episode 1: about 15 minutes. Powers took one reroll. Witch 2's Life took 9 rolls to find a free job (V12). The Storyteller's sums (16, 20, 10, 4) took 3 minutes.
- Episode 2: about 10 minutes.

---

## 3. Play logs

Track line: **Doom / Exposure / Clues**, then each character's Hurt (H) and Magic (M) or Ward (W), then potions.

### Episode 1 (Hard, 4 witches + Moss)

#### Opening

A bookmaker's runner is found in the betting shop at dawn, his hair white, his hands those of an old man. He is 31. The Tallyman has struck.

**Tracks:** Doom 0/12 · Exposure 0/4 · Clues 0/20 · Wren H0 M5 · Juno H0 M5 · Odile H0 M5 · Pim H0 M5 · Moss H0/5 W5 · Potions none (cap 5).

#### Scene 1

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Odile | Book research | Wits 3 + Sight 2 + Book 1, + Sense 1 (Moss, 1 Ward) = 7 vs 2 | X019 | Critical: 2 Clues |
| Pim | Brews at home | Craft 3 + Wild 2 = 5 vs 2 | X020 | Success: 2 potions (Blasting, Binding) |
| Juno | Talking lead: the aged man on her ward | Heart 3 + Voice 2 + Life 1 = 6 vs 2 | X021 | Critical: 2 Clues |
| Wren | Reveal at the betting shop (1 Magic) | Craft 3 vs 2 | X022 | Failure: casting in the city, Exposure +1 |
| Moss | Talking lead: the bookie's runner | Heart 2 vs 2 | X023 | Partial: 1 Clue; not casting, so 1 Hurt |

Then Doom +1.

**After scene 1:** Doom 1 · Exposure 1 · Clues 5/20 · Wren H0 M4 · Juno H0 M5 · Odile H0 M5 · Pim H0 M5 · Moss H1 W4 · Potions: Blasting 1, Binding 1.

#### Scene 2

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Odile | Book research | 6 + Sense 1 (Moss, 1 Ward) = 7 vs 2 | X024 | Critical: 2 Clues |
| Pim | Brews | 5 vs 2 | X025 | Partial: 1 Blasting; at home, 1 Hurt |
| Juno | Talking lead + Voice Surge (2 Magic) | Heart 3 + Voice 2 = 5 vs 2 | X026 | Success: 1 + 1 = 2 Clues |
| Wren | Searching lead with Veil | Wits 2 + Veil 2 = 4 vs 2 | X027 | Failure: casting in the city, Exposure +1 |
| Moss | Searching lead: the dog-track ledgers | Wits 2 vs 2 | X028 | Success: 1 Clue |

Then Doom +1. Clues 10: **half.** The coven knows it is a debt-taker working out of a shut pawn shop on Canal Row, and may go now.

- **Go or wait:** the players saw at once that waiting is free until Doom 4 (N8). Without the Weakness, Defence is 3 and the Unmaking is Difficulty 6; with no attack Powers, that fight looked hopeless. **They waited.**

**After scene 2:** Doom 2 · Exposure 2 · Clues 10 · Wren H0 M4 · Juno H0 M3 · Odile H0 M5 · Pim H1 M5 · Moss H1 W3 · Potions: Blasting 2, Binding 1.

#### Scene 3

The edge-hunters opened with Veil's Surge so the rest of the scene's casting would raise no Exposure (V5).

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Wren | Searching lead with Veil + Veil Surge (2 Magic), first | 4 vs 2 | X029 | Success: 1 Clue. No Exposure from casting for the rest of the scene |
| Odile | Book research + Sight Surge (2 Magic) | 6 + Sense 1 (Moss, 1 Ward) = 7 vs 2 | X030 | Success: 1 + 1 = 2 Clues |
| Pim | Reveal (1 Magic) + own Magic 1 | Craft 3 + 1 = 4 vs 2 | X031 | Success: 1 + 1 = 2 Clues |
| Juno | Talking lead with Voice | 5 vs 2 | X032 | Success: 1 Clue |
| Moss | Talking lead: the arcade's night porter | Heart 2 vs 2 | X033 | Failure: not casting, so Veil doesn't help: 1 Hurt |

Then Doom +1. No casting roll failed, so the Veil question (V5) didn't bite.

**After scene 3:** Doom 3 · Exposure 2 · Clues 16 · Wren H0 M2 · Juno H0 M3 · Odile H0 M3 · Pim H1 M3 · Moss H2 W2 · Potions: 3.

#### Scene 4 (the last free scene)

Wren has the weakest lead and the least Magic, so she answers her Life. The others push for the last 4 Clues. **The players declared all four rolls before any dice were rolled** (to save time). Rolled one at a time, Pim and Moss would have switched to rest once the 20th Clue came in. "In any order" allows that; this table didn't use it here.

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Wren | Answers her Life (an exam she can't miss) | — | — | +1 Magic (3) |
| Odile | Book research | 6 + Sense 1 (Moss, 1 Ward) = 7 vs 2 | X034 | Critical: 2 Clues (18) |
| Juno | Talking lead: the ward sister | Heart 3 + Voice 2 + Life 1 = 6 vs 2 | X035 | Critical: 2 Clues (20). **Weakness known** |
| Pim | Searching lead with Wild | 4 vs 2 | X036 | Success: 1 Clue, lost (past 20) |
| Moss | Talking lead: the racing-paper seller | Heart 2 vs 2 | X037 | Partial: Clue lost; 1 Hurt |

Then Doom +1 → 4. All 20 Clues, under the mark: **go now.**

- Juno, Odile and Pim never answered their Lives: −1 Magic each at the showdown.
- Moss's useless Partial put it at Hurt 3. That decides where the threat's first strike goes.

**After scene 4:** Doom 4 · Exposure 2 · Clues 20 (Weakness) · Wren H0 M3 · Juno H0 M3 · Odile H0 M3 · Pim H1 M3 · Moss H3/5 W1 · Potions: Blasting 2, Binding 1.

#### Showdown (hidden: the shut pawn shop on Canal Row; Tobias is not there)

**Start:** unanswered Lives: Juno M2, Odile M2, Pim M2. Threat: Defence 2, Danger 3, Hit 3, Toughness 0/16, 2 attacks. Unmaking Difficulty 4. Hidden, so no Exposure from rounds.

##### Round 1 (the threat acts first)

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Threat | Attack 1: d6 | — | X038 = 5 | Most Hurt marked and standing: **Moss** (3). (A 1–3 would have gone the same way: nobody has hurt it yet, so use 4–5.) |
| Moss | Defends with own Ward 1 | Nerve 3 + 1 = 4 vs 3 | X039 | Success: no Hurt. W0 |
| Threat | Attack 2: d6 | — | X040 = 5 | Moss again (still most Hurt) |
| Odile | Sight Surge, no action (2 Magic) | — | — | "before the defence roll, one attack aimed at anyone misses." Missed. Odile M0 |
| Wren | Blast (1 Magic) + Blasting declared + own Magic 1 | Craft 3 + 1 = 4 vs 2 | X041 | Failure: 1 Hurt. The potion is used up |
| Pim | Blast (1 Magic) + Blasting declared | Craft 3 vs 2 | X042 | Success: 2 + 1 (Blast) + 1 (Weakness) + 2 (Blasting) = **6** |
| Juno | Attack + **Binding declared** | Nerve 2 vs 2 | X043 | **Failure: 1 Hurt. Binding used up, no effect** (the drill case, in play) |
| Odile | Attack (last, so 1–3 points at her: she is unhurt) | Nerve 2 vs 2 | X044 | Partial: 1 + 1 = 2 damage; 1 Hurt |
| Moss | No action (W0; Hold would cost it Hurt on a Partial) | — | — | ruling V9 |

- **Round-1 edges the players found:** Shelter or a guard cast now would end at the caster's round-2 action, before the threat's round-2 attacks, so they're worthless in round 1 (V2). Bind, Force, Binding and Hold all aim at round 2, which works.
- Hidden: no Exposure. Doom +1.

**After round 1:** Doom 5 · Exposure 2 · Toughness 8/16 · Wren H1 M1 · Juno H1 M2 · Odile H1 M0 · Pim H1 M1 · Moss H3/5 W0 · Potions none.

##### Round 2

All remaining Magic (Wren 1, Juno 2, Pim 1) is held for the Unmaking: lead 1 + two joiners. So the witches attack with Nerve, free, at 2 dice each.

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Moss | Hold | Nerve 3 vs 2 | X045 | Success: the next attack must target Moss |
| Pim | Attack | Nerve 2 vs 2 | X046 | Failure: 1 Hurt |
| Juno | Attack | Nerve 2 vs 2 | X047 | Failure: 1 Hurt |
| Wren | Attack | Nerve 2 vs 2 | X048 | Failure: 1 Hurt |
| Odile | Attack | Nerve 2 vs 2 | X049 | Success: 3 damage (11/16) |
| Threat | Attack 1: d6 (Held) | — | X050 = 2 | Goes to Moss |
| Moss | Defends | Nerve 3 vs 3 | X051 | Failure: 3 Hurt → 5/5, **Down**. Fades home for the rest of the fight |
| Threat | Attack 2: d6 | — | X052 = 6 | **Collect:** most Magic left is Juno (2) |
| Juno | Defends, keeping her Magic for the Unmaking | Nerve 2 vs 3 | X053 | Failure: 3 Hurt → 4/4, **Down**; Collect takes 1 Magic |

Doom +1. Two witches still standing who can attack, plus Odile.

**After round 2:** Doom 6 · Exposure 2 · Toughness 11/16 · Wren H2 M1 · Juno H4 (Down) M1 · Odile H1 M0 · Pim H2 M1 · Moss H5/5 (faded) W0.

##### Round 3

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Pim | Attack | Nerve 2 vs 2 | X054 | Failure: 1 Hurt (H3) |
| Wren | Attack | Nerve 2 vs 2 | X055 | Success: 3 (14/16) |
| Odile | Attack | Nerve 2 vs 2 | X056 | Partial: 2 → **16/16, Broken**; 1 Hurt |

- Broken: no attacks, Doom stops, it flees at the end of round 4.
- Every standing witch has acted, so no Unmaking this round. Juno is Down and could *join* without an action, but nothing says a Down witch can *lead* (V10). It wouldn't have helped: alone she has 2 dice against 4.

**After round 3:** Doom 6 · Exposure 2 · Toughness 16/16 (Broken) · Wren H2 M1 · Juno H4 (Down) M1 · Odile H2 M0 · Pim H3 M1 · Moss gone.

##### Round 4

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Pim leads (1 Magic); Wren joins as her action (1 Magic); Juno joins while Down (1 Magic) | The Unmaking | Craft 3 + 2 + 2 = 7 vs 4 | X057 | Critical (5 successes): **the Tallyman is destroyed** |

The chance was exactly 50% (7 dice, 4 successes needed). A failure meant it fled: a Partial.

**End:** Doom 6 · Exposure 2/4 · Clues 20 · Toughness 16/16 (destroyed) · Wren H2 M0 · Juno H4 M0 · Odile H2 M0 · Pim H3 M0 · Moss H5/5 W0.

#### Closing

- The aged men stay old, but no more are taken. Tobias finds his signed paper has turned to ash.
- **Result: Win** (destroyed, innocent safe, not Seen). No Scars (Scars are only for a loss).
- **Carry-over:** the Tallyman gets a page in the Book.

### Episode 2 (Standard, 3 witches, no guardian player)

#### Opening

A fire alarm empties Calder Tower at 3 a.m. for the third night running. Nobody finds a fire. The Ash-Wife has struck.

**Tracks:** Doom 0/12 · Exposure 0/4 · Clues 0/11 · Hana H0 M5 · Tom H0 M5 · Bel H0 M5 · Potions none (cap 3) · Call unused.

#### Scene 1

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Hana | Book research (a lead using Wits is a searching lead, so Veil fits) | Wits 3 + Veil 2 + Book 1 = 6 vs 2 | X065 | Critical: 2 Clues |
| Tom | Talking lead: a pupil who lives in the tower | Heart 2 + Life 1 = 3 vs 2 | X066 | Partial: 1 Clue; not casting, 1 Hurt |
| Bel | Brews at home | Craft 3 + Wild 2 = 5 vs 2 | X067 | Success: 2 potions (Healing, Blasting) |

Then Doom +1.

**After scene 1:** Doom 1 · Exposure 0 · Clues 3/11 · Hana H0 M5 · Tom H1 M5 · Bel H0 M5 · Potions: Healing 1, Blasting 1.

#### Scene 2

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Hana | Book research | 6 vs 2 | X068 | Success: 1 Clue |
| Bel | Talking lead with Wild: the old caretaker | Heart 2 + Wild 2 = 4 vs 2 | X069 | Partial: 1 Clue; casting in the city, Exposure +1 |
| Tom | Answers his Life (parents' evening) | — | — | +1 Magic: **6** (ruling: Magic may go above 5) |

Then Doom +1.

**After scene 2:** Doom 2 · Exposure 1 · Clues 5 · Hana H0 M5 · Tom H1 M6 · Bel H0 M5.

#### Scene 3

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Hana | Book research | 6 vs 2 | X070 | Success: 1 Clue |
| Tom | Talking lead: the fire officer, + own Magic 1 | Heart 2 + 1 = 3 vs 2 | X071 | Partial: 1 Clue, 1 Hurt (H2) |
| Bel | Talking lead with Wild: tenants at the bus stop | 4 vs 2 | X072 | Success: 1 Clue |

Then Doom +1. Clues 8: past half (6). They know it's a hearth spirit in Calder Tower's boiler room. **They wait** one more scene for the Weakness; the page says it makes the fight and the Unmaking easier.

**After scene 3:** Doom 3 · Exposure 1 · Clues 8 · Hana H0 M5 · Tom H2 M5 · Bel H0 M5.

#### Scene 4 (the last free scene)

Tom is at Hurt 2 and is their fighter, so he rests. Hana researches first. Bel planned to answer her Life, but after Hana's roll the coven is one Clue short, so Bel takes a lead instead (sequencing by "in any order").

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Hana | Book research + own Magic 1 | 7 vs 2 | X073 | Critical: 2 Clues (10) |
| Bel | Talking lead with Wild: the baker's landlord | 4 vs 2 | X074 | Success: 1 Clue (11). **Weakness known** |
| Tom | Rests | — | — | Hurt cleared |

Then Doom +1 → 4. **Go now.** Hana and Bel never answered their Lives: −1 Magic each.

**After scene 4:** Doom 4 · Exposure 1 · Clues 11/11 · Hana H0 M4 · Tom H0 M5 · Bel H0 M5 · Potions 2.

#### Showdown (hidden: the boiler room; Lottie is not there)

**Start:** unanswered Lives: Hana M3, Bel M4. Threat: Defence 2, Danger 3, Hit 2, Toughness 0/12, 1 attack. Unmaking Difficulty 3.

##### Round 1 (the threat acts first)

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Threat | Attack: d6 | — | X075 = 5 | Most Hurt marked: all at 0, a tie. Storyteller's die (X076 = 5): **Bel** |
| Bel | Defends | Nerve 2 vs 3 | X077 | Failure: 2 Hurt |
| Bel | Bind with Wild + Wild Surge (1 + 2 Magic) | Craft 3 + Wild 2 = 5 vs 2 | X078 | Success: it loses its next attack; Defence is 1 lower for everyone this round |
| Tom | Attack with Force + Blasting declared | Nerve 3 + Force 2 = 5 vs **1** | X079 | Success: 2 + 1 (Weakness) + 2 = **5** |
| Hana | Attack | Nerve 2 vs 1 | X080 | Failure: 1 Hurt |

- Newer players didn't add a Force Surge: Bel's Bind already took round 2's attack, and a second loss would be wasted ("any more are wasted"). Clear to them from the page.
- Doom +1.

**After round 1:** Doom 5 · Exposure 1 · Toughness 5/12 · Hana H1 M3 · Tom H0 M5 · Bel H2 M1 · Potions: Healing 1 · Threat's next attack lost.

##### Round 2

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Bel | Drinks the Healing (no action, on her turn) | — | — | H2 → 0 |
| Hana | Attack | Nerve 2 vs 2 | X081 | Partial: 2 (7/12); 1 Hurt |
| Bel | Attack | Nerve 2 vs 2 | X082 | Success: 3 (10/12) |
| Tom | Attack with Force | 5 vs 2 | X083 | Critical: 3 + 1 = 4 → **12/12, Broken** (2 lost past the total) |

Its round-2 attack was lost to Bind anyway, and now it's Broken. Doom stops.

**After round 2:** Doom 5 · Exposure 1 · Toughness 12/12 (Broken) · Hana H2 M3 · Tom H0 M5 · Bel H0 M1 · Potions none.

##### Round 3

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Bel leads (1 Magic); Tom and Hana join (1 Magic each); Tom and Hana help (1 Magic each) | The Unmaking | Craft 3 + 2 + 2 + 2 = 9 vs 3 | X084 | Critical (6 successes): **destroyed** |

**End:** Doom 5 · Exposure 1/4 · Clues 11 · Hana H2 M1 · Tom H0 M3 · Bel H0 M0. The call was never used.

#### Closing

- The alarms stop. Lottie bakes the morning bread and the tower's last tenants stay another winter.
- **Result: Win** (destroyed, innocent safe, not Seen). Carry-over: the Ash-Wife gets a page in the Book.

### Summary

| | Episode 1 (Hard, 5 players) | Episode 2 (Standard, 3 players) |
|---|---|---|
| Result | **Win** | **Win** |
| Scenes / rounds | 4 / 4 | 4 / 3 |
| Threat attacks made | **4** (2 in round 1 before anyone acted, 2 in round 2); 1 made to miss by Sight's Surge | **1** (round 1); 1 lost to Bind |
| Hurt from the threat | 4 boxes (Hit 3 was capped twice) | 2 |
| Characters Down | 2 (Moss faded; Juno) | 0 |
| Doom at the end | 6/12 | 5/12 |
| Exposure at the end | 2/4 | 1/4 |
| Clues | 22 found, 20 counted, 2 lost | 11 found, 11 counted |
| Magic | 21 (20 + 1 Life): 17 spent, 3 lost to Lives, 1 taken by Collect, **0 left** | 16 (15 + 1 Life): 10 spent, 2 lost to Lives, 4 left (Tom 3, Hana 1) |
| Ward | 5/5 (4 Sense, 1 own die) | — |
| Potions | 3 brewed, 3 used (1 did damage) | 2 brewed, 2 used |
| Rolls with a result | 35: 6 Critical (17%), 13 Success, 5 Partial, 11 Failure (31%) | 18: 4 Critical (22%), 8 Success, 4 Partial, 2 Failure (11%) |
| Play time (estimate) | about 90 minutes | about 57 minutes |

---

## 4. New issues

| # | Severity | Quote (v0.7) | What happened | Suggested fix | Ruling to use tonight |
|---|---|---|---|---|---|
| V1 | **blocker** | The innocent: "If they're still in its grip after the threat acts in the first round, they're lost." with Showdown: "(in the first round it acts before the characters instead)". Tracks: "resolve the characters' actions, then the threat's attacks (in round 1, the threat's attacks first), then the innocent". Glossary: "Lost if still in the threat's grip after it acts in the first round." | D1a: the threat came at Doom 5 with Tobias in its grip. It made both its round-1 attacks before anyone acted. Read literally, Tobias was lost right then, so **no public showdown can ever be a Win**. The Tracks line puts "the innocent" after the characters, which gives the coven one round to free him. Two readings, opposite results. The v0.7 change (REVIEW row 43) updated Showdown and Tracks but not "The innocent" or the glossary. The simulator checks after the characters act. | "If they're still in its grip **at the end of the first round**, they're lost." Same change in the glossary's "In its grip". | Check at the end of round 1, after the characters act (the Tracks order). |
| V2 | confusing | Guard: "until your next action, if the threat goes for them it attacks you instead"; Shelter: "until your next action, one person can't be hurt by the threat's attacks" | With the threat first in round 1, a guard or Shelter made in round 1 ends at that character's round-2 action, which always comes before the threat's round-2 attacks. So **in round 1 both do nothing.** D8: Odile guarded the freed Tobias in round 1, attacked in round 2, and the threat's round-2 die showed 6: Tobias, now unguarded, was taken and lost. The table had assumed the guard covered him. | "…until the threat has next acted (or you go Down)." This reads the same in rounds 2+ and fixes round 1. | As written: guard and Shelter in round 1 do nothing; do them again in round 2. Tell the players before the fight. |
| V3 | confusing (balance) | "It makes 1 attack a round against 3 characters" with "Bind (against Defence): the threat loses its next attack" and "Partial: … It works, with a cost." | Against 3 characters, after its round-1 strike, a Bind each round takes its only attack. A Partial counts, so with the Weakness (Defence 2) Bind works 87.5% of the time at Craft 3, 96.9% with Wild (5 dice), 98.4% at Craft 4 + Wild. Cost: 1 Magic a round. In Episode 2, D7 episode 3 and D7 episode 5, **the threat made exactly 1 attack per fight**, even with Toughness 18 and 24. The season Toughness rise added rounds but no danger. (The simulator binds every round only with a Wild witch; any Craft-3 witch can do it.) | Simulate one of: (a) Bind needs a success, not a Partial; (b) Bind can't be cast two rounds running by the same witch; (c) against 3 characters, a lost attack still rolls but at Danger −1. Report "threat attacks per fight" by group size. | As written. |
| V4 | confusing | "No guardian player: once per episode, the coven may call it for one Mend or one Carry; calling takes no action and no roll, and counts as casting." | It doesn't say **when** it can be called. D10: the threat's attack put the last standing witch Down. If the coven may call Mend now, Tom gets back up and the fight goes on; if not, every witch is Down at the end of the round: **Loss** and three Scars. Also unclear: whether it can be called in the investigation (a Mend there saves a rest). | "Call it at the start of a round or on a witch's turn, like a potion" (this is what the simulator does). Say if it works in scenes. | At the start of a round or on a witch's turn; not during the threat's attacks. Allowed in scenes. |
| V5 | confusing (A5) | Veil's Surge: "no Exposure from casting for the rest of the scene." with "Cost: … Exposure +1 if you were casting out in the city, or else 1 Hurt." | Read literally it covers everyone, and a casting roll's cost *is* the Exposure, so under Veil a failed casting roll costs **nothing**. D11: Bel's failed Reveal cost nothing; Tom's non-casting Partial in the same scene cost 1 Hurt. Edge-hunters opened Episode 1's scene 3 with Veil's Surge for exactly this. (B18, the showdown version, is still open too.) | "…no Exposure from your casting for the rest of the scene; a casting roll's cost becomes 1 Hurt, as with Hide." | Everyone's casting is covered; a casting roll's cost becomes 1 Hurt. |
| V6 | confusing | "can have at most one per character, guardian included" | With no guardian player, is the guardian a "character"? It can be called once, but nobody plays it. D9: the coven held 2 and brewed 2; under one reading the cap is 3 and one potion is lost, under the other it's 4. | "One per witch, plus one if a player plays the guardian." (The simulator uses this.) | Count the guardian only if a player plays it. |
| V7 | minor (A11) | Glossary: "Round: … everyone acts, the threat acts, Doom rises"; "In its grip: … Lost if still in the threat's grip after it acts in the first round"; "Seen: … any further rise in Exposure becomes Doom +1" | The glossary wasn't updated for the threat acting first, and Seen drops "(once per round or scene)". | Update the three entries after V1 is fixed. | Follow the core page. |
| V8 | minor | "Using one takes no action: on your turn, on yourself or someone near you, one a round." | One a round per character, or for the whole coven? In Episode 1 round 1 three witches each used a potion; in D2 two witches each used a Binding in one round. A coven-wide reading would have changed Episode 1's damage. "In a scene" is still open too (B29). | "Each character can use one potion a round (one a scene in the investigation)." | One per character per round or scene. |
| V9 | minor | "Each character takes one action" | Can a character skip their action? Moss had nothing worth doing in round 1. It matters for V2 (skipping keeps a guard or Shelter up) and for keeping a standing witch free to join the Unmaking. | "You may take no action." | Yes, you may skip. |
| V10 | minor | "One witch leads with Craft and pays 1 Magic. … A standing witch joins as their action …; a Down witch joins without one." | Can a Down witch **lead**? In Episode 1 round 3, Juno was Down when the threat broke and every standing witch had acted. Down says "you can still help and join the Unmaking", not lead. | "The leader must be standing and use their action." | A Down witch can join but not lead. |
| V11 | minor | Sight: "one attack aimed at anyone misses" and "It loses at most one attack a round, whatever the cause" | Is a miss a lost attack for the one-a-round cap? With 2 attacks, Bind plus Sight's Surge clears a whole round. (Episode 1 used Sight's Surge with no Bind.) | "A miss isn't a lost attack." or the reverse; say which. | A miss isn't a lost attack. |
| V12 | minor | Life: "d6, reroll one someone has" | With 4 witches, witch 2 needed 9 rolls (X007, X010–X018). Powers say "or pick"; Lives don't. | "d6, or pick; reroll one someone has." | Pick a free one after two rerolls. |
| V13 | minor (sheets) | "otherwise +1 die on your next roll this episode" | Easy to forget: in D7 Hana's Critical defence die was left off her next roll (X133; with no 6 showing it could not have changed the result). | A box on the sheet for it. | Players remind each other. |

---

## 5. Drills

Each drill uses fresh dice and the characters above, from a stated setup.

### D1. The threat acts first in round 1

- **D1a: against an innocent in its grip (public).**
  - **Setup:** Episode 1's coven. The threat came at Doom 5 (Clues 16/20, so Defence 3). Tobias in its grip. Wren H1 M3, Juno H0 M3, Odile H0 M3, Pim H1 M3, Moss H2/5 W3. Exposure 2.
  - **Threat first.** Attack 1 (X085 = 5): nobody has hurt it, most Hurt marked is Moss. Moss defends with 1 Ward (X087): Failure, 3 Hurt → 5/5, Down and fades. Attack 2 (X086 = 6): Tobias is in its grip, not free, so it's the signature move. Collect: the witches tie at 3 Magic; the Storyteller's die (X088 = 5, reroll; X089 = 3) picks Odile. Odile defends with Sight (X090): Partial, 1 Hurt, and Collect takes 1 Magic.
  - **Literal reading:** the threat has acted in round 1 and Tobias is still in its grip, so he is **lost now**, before any witch can try (V1).
  - **Under tonight's ruling** (check at the end of round 1): Pim casts Bind with Wild and a Wild Surge (X091): Critical. It loses its next attack and Defence is 2 this round; Pim gets +1 die on his next roll. Juno frees (X092): Partial, not freed, 1 Hurt. Wren frees with 1 Magic and Odile's help (X093): **Success, Tobias is free.** Odile guards him (see D8).
  - End of round 1: he is free, so not lost. Casting happened in public: Exposure 3. Doom 6.
  - **Finding:** the two texts give opposite results. Under the literal one, every public showdown ends at Partial at best.
- **D1b: target choice when nobody has hurt it yet.** Seen five times with no ruling:
  - Episode 1 round 1 (X038, X040): both attacks went to Moss, the most Hurt marked, via "if nobody has … use 4–5".
  - Episode 2 round 1 (X075, X076): all at 0, so the Storyteller picked.
  - D1a (X085) and D7 (X117/X118, X128/X129): the same rule, and a signature move with its own tie.
  - **Finding:** clear. One effect worth knowing: investigation Hurt now decides who takes the first strike. Moss's pointless Partial in scene 4 drew both round-1 attacks.

### D2. Binding with an attack that fails, and with one that works

- **Fails (in play):** Episode 1 round 1, Juno declared Binding and attacked (X043): Failure. 1 Hurt, the potion was used up, and the threat lost nothing. "Say you're using a potion before you roll; it's used up either way" settled it at once.
- **Works:** hidden round 2, Weakness known, Standard (1 attack a round). Hana attacks with Binding (X094): Success, 3 damage, it loses its next attack. Bel attacks with Binding (X095): Partial, 2 damage, 1 Hurt; a Partial "works", so it would lose another attack (see D3).
- **Finding:** clear in every case.

### D3. Two lost attacks in one round (the extra wasted)

- **Standard (1 attack a round):** from D2, two Bindings land in round 2. The threat loses its round-2 attack; the second loss is wasted ("any more are wasted"). Two potions bought one lost attack. Round 3 it attacks as normal.
- **Hard (2 attacks a round):** in round 1, after the threat's first strike, Pim Binds (X096): Success, aimed at round 2's attack. In round 2 Juno's Binding attack works (X097). Round 2: one attack lost, one wasted, so the threat makes 1 of its 2. Its d6 (X098 = 5): most Hurt marked, Juno.
- **Finding:** clear. A round-1 Bind and a round-2 Binding compete for the same round's attack; the page handles it. Newer players in Episode 2 saw this and didn't add a Force Surge.

### D4. Shield twice in a round (refused)

- **Setup:** hidden round 2, Weakness known. Pim hurt it last. Wren H2, Pim H1. Moss H0 W3. Juno M3.
- Attack 1 (X099 = 5): most Hurt marked, Wren. Moss Shields it (1 Ward) and defends with 1 Ward (X101): Success, no Hurt.
- Attack 2 (X100 = 6): Collect, most Magic: Juno. Moss tries to Shield again: **refused**, "once a round". Juno defends (X102): Failure, 3 Hurt, loses 1 Magic.
- **Finding:** clear, and the guardian still matters. N2 is fixed.

### D5. Shelter and guard end when the caster or guard goes Down

- **Setup:** public round 2, no Weakness (Defence 3). Tobias freed in round 1. Moss faded. Wren H3 (she hurt it last), Juno H3, Pim H0, Odile H0.
- Wren guards Tobias. Juno casts Shelter on Odile (X103): Success. (Pim and Odile act without hurting it.)
- Attack 1 (X104 = 1): whoever hurt it last, Wren. Wren defends with Veil (X105): Failure, **Down. Her guard ends.**
- Attack 2 (X106 = 4): Wren is Down, so use 4–5: most Hurt marked and standing, Juno. Juno defends (X107): Failure, **Down. Her Shelter on Odile ends.**
- Next round Tobias is unguarded and Odile is unsheltered.
- **Finding:** both endings are clear (N3). Two guards is still open.

### D6. The Showdown mark is only checked at the end of a scene

- **D6a.** Episode 2's coven, scene 5, Doom 4, Seen (4/4), Clues 5/11. Bel's Wild lead (X110): Success, 6 Clues, half. Hana's Veil lead (X111): Success, 7. Tom's plain lead (X112): Partial, 8; not casting, 1 Hurt. No Seen rise. End of scene: Doom 5. **Too late:** the threat comes, even though the coven reached half the Clues this scene.
- **D6b.** Episode 1's coven, scene 5, Doom 4, Seen, Clues 12/20. Wren's Reveal (X113): Failure. Casting in the city with Exposure full, so **Doom +1 → 5, mid-scene.** The scene goes on: Pim's Reveal (X114): Success, 14. Juno's Voice lead (X115): Success, 15. Odile's research (X116): Critical, 17. Moss rests. End of scene: Doom 6. Mark checked: the showdown starts in public at **Doom 6**, Seen, Tobias in its grip.
- **Finding:** "only checked then" ran with no question. N4 is fixed. Two notes: a later casting cost in D6b would have been free ("once per … scene", N9); and Seen in a public fight then costs Doom +2 a round, so from Doom 6 Doom fills at the end of round 3.

### D7. A full season step (episodes 3 and 5)

**Toughness by the page** ("After the 2nd and the 4th episodes, threats also get 2 more Toughness per witch"):

| Coven | Episodes 1–2 | Episodes 3–4 | Episode 5 on |
|---|---|---|---|
| Episode 1's (Hard, 4 witches, guardian player) | 16 | 24 (+8) | 32 (+16) |
| Episode 2's (Standard, 3 witches, no guardian player) | 12 (9 + 3) | 18 (9 + 6 + 3) | 24 (9 + 12 + 3) |

Witches raise one rating after episodes 2 and 4 (most 4): Tom Nerve 4, Bel Craft 4, Hana Wits 4; then Tom Heart 3, Bel Nerve 3, Hana Nerve 3. The guardian's growth isn't stated (N15).

- **Episode 3, Episode 2's coven, Toughness 18, hidden, Weakness known.**
  - Round 1: threat first (X117 = 6): Flare, least Hurt, a tie; the die picks Bel (X118). Bel defends (X119): Failure, 3 Hurt. Bel Binds with Wild and a Surge (X120): Success. Tom attacks with Force and Blasting at Defence 1 (X121): Critical, 6. Hana (X122): Success, 3. **9/18.**
  - Round 2: its attack is lost to Bind. Bel drinks the Healing. Tom (X123): Critical, 4. Hana (X124): Success, 3. Bel's Blast (X125): Failure, 1 Hurt. **16/18.**
  - Round 3: Tom (X126): Success, **Broken.** Bel and Hana haven't acted: the Unmaking now, Bel leads with Hana joining and Tom helping twice (X127): Success, destroyed.
  - **The threat made 1 attack.**
- **Episode 5, same coven, Toughness 24.**
  - Round 1: threat first (X128 = 3; nobody has hurt it, a tie; X129 picks Hana). Hana defends with Veil (X130): Critical, no Hurt. Bel's Bind and Surge (X131): Success. Tom (X132): Success, 5. Hana (X133): Success, 3. **8/24.** (Hana's Critical die was forgotten on X133; with no 6 showing it couldn't have changed the result.)
  - Round 2: attack lost. Tom (X134), Hana (X135), Bel (X136): three Successes, 9. **17/24.**
  - Round 3: Tom with a Force Surge (X137), Hana (X138), Bel (X139): three Successes, 9. **Broken.**
  - Round 4: the Unmaking, 10 dice against 3 (X140): Critical, destroyed.
  - **The threat made 1 attack.**
- **Finding:** the season text needed no ruling. But for a 3-witch coven with a Wild witch, extra Toughness only added rounds, not danger: Bind took every attack after round 1 (V3).

### D8. A guard made in round 1 (new, from V2)

- **Setup:** D1a continued. Odile guarded the freed Tobias in round 1.
- Round 2: Odile, believing her guard still held, attacked (X109; logged after X108, made before it): Failure, 1 Hurt. Her action ended the guard.
- Threat: one attack lost to Pim's round-1 Bind. The other (X108 = 6): Tobias is free and unguarded: **taken, lost.**
- **Finding:** the round-1 guard protected him from nothing. The best result is now a Partial. V2.

### D9. The potion cap with no guardian player (new, from V6)

- Episode 2's coven holds 2 potions. Bel brews (X141): Success, 2 more. Cap 3 (no guardian counted): one is lost. Cap 4 ("guardian included"): both are kept. The page doesn't say which.

### D10. When the no-guardian call can be made (new, from V4)

- **Setup:** Standard round 3, Hana and Bel Down, Tom H3/4 and hurt it last. The call is unused.
- The attack (X142 = 2) goes to Tom. Tom defends (X143): Failure, 2 Hurt, **Down.** Every witch is Down.
- If the call can be made now, Mend clears 2 Hurt and Tom is standing at the end of the round. If not, it's a **Loss** and all three get a Scar. Tonight's ruling (start of round or a witch's turn): Loss.

### D11. Veil's Surge in the city (new, from V5)

- Exposure 3/4. Hana's searching lead with a Veil Surge (X144): Success. No Exposure from casting for the rest of the scene.
- Bel's Reveal (X145): Failure. Read literally: no Exposure, so **no cost at all.** Tonight's ruling: 1 Hurt.
- Tom's lead with no Power (X146): Partial, 1 Hurt (not casting, so Veil doesn't help).
- **Finding:** under Veil, the non-caster pays and the caster doesn't. V5.

### D12. A Held attack's d6

- Moss Holds (X147): Partial, works, 1 Hurt. The Held attack's d6 (X148 = 5): goes to Moss. No 6, so the Hold-against-signature question (N13) didn't come up.

---

## 6. Part A checks that failed

- **A1 (every state of every track):**
  - Magic above 5 is still unstated (Tom reached 6). Carried from v0.4.
  - The potion cap with no guardian player (V6).
  - The second attack with nobody standing (N16).
- **A5 (no free spend):**
  - Under Veil's Surge a failed casting roll costs nothing (V5).
  - Once Seen, later casting costs in a scene are free (N9).
  - A Down witch joins the Unmaking without an action (kept on purpose, it seems).
- **A6 (no dominated option):**
  - A guard or Shelter in round 1 does nothing; it's always better in round 2 (V2).
  - Going to the threat at Doom 1–3 is dominated by going at Doom 4 (N8). Both tables waited.
- **A10 (limits stated outright):**
  - Sense has no limit per scene or per lead (N12).
  - Potions: "one a round" per character or per coven (V8).
  - When the no-guardian call can be made (V4).
- **A11 (one source of truth):**
  - The glossary's Round, In its grip and Seen entries don't match v0.7 (V7).
  - The simulator plays one Sense a scene; the page has no such limit (N12).
- **A12 (read every rule literally at the start and end):** at the start of a public showdown, "after the threat acts in the first round" is true before any witch has acted (V1).
- **A13 ("there is none"):** two guards (N3); nobody standing (N16).
- **A15 (order of resolution):**
  - The innocent check against the threat acting first (V1).
  - The call's timing against the end-of-round check (V4).
  - A Held 6 against a signature move or a guard; a lost attack's d6 (N13).
  - Sight's miss against the one-lost-attack cap (V11).
- **A19 (balance):** against 3 characters, the threat made 1 attack in each of three fights (Episode 2, D7 episodes 3 and 5) because a Bind each round takes its only attack (V3). Hard with 5 players was a real fight.

**Passes worth noting:**
- **A2:** in a public round, Exposure (or Seen's Doom) rises once and Doom once.
- **A4:** losing still costs (Scars in D10; Tobias lost in D8 drops the best result to Partial).
- **A7:** Episode 1 spent every point of Magic and Ward. Episode 2 left 4 of 16 Magic (25%), under the "more than half" line.
- **A8:** no roll was skipped for free. Binding now needs a working attack; Bind is a roll and costs Magic.
- **A16:** casting, Danger, in its grip, wasted and Broken caused no confusion.
- **A22:** the mark bound both tables: each went at Doom 4, the last safe moment.
- **A24:** fights lasted 3–4 rounds.

---

## 7. Clean or not

- **Episode 1: clean**, by the procedure's standard. No blocker came up and the table never had to invent a ruling on core flow. Four small rulings were used (potions one a round per character, skipping an action, mixed potions from one brew, and Sight's Surge following its own text). All follow the most natural reading, and none needed the table to stop. The Veil question (V5) was set up but no casting roll failed under it.
- **Episode 2: clean.** Two small rulings (Magic above 5; Wild's Surge after its own roll, which changed nothing). Nothing stopped play.
- **But both were clean partly by luck of route.** Both covens reached the threat before Doom 5, so neither fought in public with the innocent in its grip. D1a shows that the first public showdown will hit V1, a blocker on core flow, and D8 shows V2 will cost the innocent at a table that guards in round 1. **A table whose Doom reaches 5 will not have a clean episode under v0.7.**

---

## 8. What worked

- **The threat acting first.** It made the Hard fight a fight: the first strike took Moss's last Ward and Odile's Sight Surge before any witch acted, and round 2 put two characters Down. The coven had to plan around it. Nobody asked how it worked.
- **Target choice on a fresh threat.** "If nobody has … use 4–5" plus ties worked five times with no ruling, and it makes investigation Hurt matter.
- **Binding needs a working attack.** Juno's failed Binding attack was a real loss, and the table felt it. "Named before the roll, used up either way" closed the old dispute.
- **Wasted lost attacks.** D3 showed round-1 and round-2 effects competing for one attack; the page handled it, and newer players planned around it.
- **Shield once a round, and guard and Shelter ending on Down** ran clean in D4 and D5.
- **"The Showdown mark is only checked then"** settled D6b at once.
- **Season Toughness** is easy to work out with the new wording.
- **Hard without attack Powers was tense and fair.** The coven won on Nerve attacks, the Weakness and a 50% Unmaking, with every point of Magic and Ward spent.
- **Down witches joining the Unmaking** kept Juno in the game after she dropped.
- **Lives bit at both tables:** five of seven witches skipped theirs and lost Magic for it, by choice.
- **The d6 Power and Life tables** made setup quick, apart from long Life rerolls (V12).

---

## 9. How it felt

- **Was losing a real risk?**
  - **Episode 1: yes.** Two characters went Down by round 2. The threat was Broken by a 2-dice Partial in round 3. The Unmaking was exactly a coin flip (7 dice against 4); a miss meant it fled (Partial). Nobody at the table felt safe.
  - **Episode 2: in the fight, not really.** The threat hit once, Bind took round 2, and it was Broken in round 2. The risk sat in the Clue race and in Doom 4.
  - **Season drills:** with a Wild witch, a 3-witch coven gave the threat one attack per fight even at 18 and 24 Toughness (V3).
  - Defence is harsh: a witch with Nerve 2 and no fitting Power can never fully defend against Danger 3 (Success needs 3 successes from 2 dice). 25% Partial, 75% Failure. At Hard that's 3 Hurt of 4. It makes Shield, Hold and Sight's Surge precious, which felt right.
- **Did the threat get to attack?** Yes, every fight: 4 attacks in Episode 1 and 1 in Episode 2 (and 1 in each season drill). The v0.6 problem (0 attacks in three tests) is gone.
- **Were resources spent?**
  - Episode 1: all 21 Magic and 5 Ward; all 3 potions.
  - Episode 2: 12 of 16 Magic spent or lost; both potions. The call was never needed.
- **Dominant tactics:**
  1. Sense on the Book researcher every scene: Odile rolled 7 dice four times and got 3 Criticals.
  2. Wait until Doom 4, then go (N8). Both tables.
  3. Bind with a Wild Surge in round 1: Defence drops to 1 for the round and round 2's attack is gone.
  4. Bind every round against 3 characters (V3).
  5. Order the round so the healthiest witch hurts it last, because 1–3 goes to "whoever hurt it last". Legal and clever; not a problem.
  6. Open a scene with Veil's Surge to make every casting roll riskless (V5).
- **The guardian against a fourth witch.** Moss drove the investigation (4 Senses, all on Odile), took both round-1 attacks and survived them, then Held and went Down. It did no damage. With Moss played, Toughness was 16; a fifth witch would make it 20 but add a damage dealer. It felt worth a seat at Hard.
- **How long it took (estimate):** Episode 1 about 90 minutes (setup 15, scenes 45, fight 25, closing 5). Episode 2 about 57 minutes (setup 10, scenes 30, fight 12, closing 5).
- **Simulator note:** the simulator checks the innocent after the characters act (it matches tonight's ruling for V1, not the page). It resets guards and Shelter each round, which matches V2's effect. It binds every round only with a Wild witch. Worth adding: attacks per fight by group size, a policy where any Craft-3 witch Binds each round, and the potion cap and call timing as named settings.

---

## 10. Dice appendix

All 148 rolls, in the order they were made. Format: ID | label | dice | faces | successes vs Difficulty | result. The script counts 4–6 as successes; a Success needs successes ≥ Difficulty; a Critical is a Success with two or more 6s; a Partial needs at least half the Difficulty, rounded up (none at Difficulty 1).

**Notes on the log:**
- Episode 1 is X001–X057 (setup X001–X018). Episode 2 is X058–X084 (setup X058–X064). Drills are X085–X148.
- **X036 and X037:** Episode 1 scene 4 actions were declared together before rolling (section 3).
- **X076, X088, X089, X118, X129:** Storyteller tie picks, made with a die to stay neutral. X088 showed 5, which the pick scheme said to reroll (X089).
- **X109** was made before X108 in play order but logged after it. Only the order differs.
- **X133:** Hana's Critical die from X130 was left off. With no 6 showing, one more die could not have changed the result.
- **D3** (X098) and **D5** (Pim's and Odile's actions) skip rolls that didn't bear on the drill.

```
X001 | E1 setup: Witch 1 Power (1 Force 2 Flame 3 Sight 4 Voice 5 Veil 6 Wild) | 1d6 | faces: 5
X002 | E1 setup: Witch 2 Power (1 Force 2 Flame 3 Sight 4 Voice 5 Veil 6 Wild) | 1d6 | faces: 4
X003 | E1 setup: Witch 3 Power (1 Force 2 Flame 3 Sight 4 Voice 5 Veil 6 Wild) | 1d6 | faces: 3
X004 | E1 setup: Witch 4 Power (1 Force 2 Flame 3 Sight 4 Voice 5 Veil 6 Wild) | 1d6 | faces: 4
X005 | E1 setup: Witch 4 Power reroll (4 Voice taken) | 1d6 | faces: 6
X006 | E1 setup: Witch 1 Life (1 student 2 nurse 3 shop worker 4 teacher 5 mechanic 6 bus driver) | 1d6 | faces: 1
X007 | E1 setup: Witch 2 Life (1 student 2 nurse 3 shop worker 4 teacher 5 mechanic 6 bus driver) | 1d6 | faces: 1
X008 | E1 setup: Witch 3 Life (1 student 2 nurse 3 shop worker 4 teacher 5 mechanic 6 bus driver) | 1d6 | faces: 5
X009 | E1 setup: Witch 4 Life (1 student 2 nurse 3 shop worker 4 teacher 5 mechanic 6 bus driver) | 1d6 | faces: 3
X010 | E1 setup: Witch 2 Life reroll (1 student taken) | 1d6 | faces: 5
X011 | E1 setup: Witch 2 Life reroll again (5 mechanic taken by Witch 3) | 1d6 | faces: 1
X012 | E1 setup: Witch 2 Life reroll a third time (1 student taken) | 1d6 | faces: 3
X013 | E1 setup: Witch 2 Life reroll a fourth time (3 shop worker taken by Witch 4) | 1d6 | faces: 5
X014 | E1 setup: Witch 2 Life reroll a fifth time (5 mechanic taken) | 1d6 | faces: 5
X015 | E1 setup: Witch 2 Life reroll a sixth time (5 mechanic taken) | 1d6 | faces: 1
X016 | E1 setup: Witch 2 Life reroll a seventh time (1 student taken) | 1d6 | faces: 3
X017 | E1 setup: Witch 2 Life reroll an eighth time (3 shop worker taken) | 1d6 | faces: 3
X018 | E1 setup: Witch 2 Life reroll a ninth time (3 shop worker taken) | 1d6 | faces: 2
X019 | E1 S1 Odile Book research: Wits 3 + Sight 2 + Book 1 + Sense 1 (Moss, 1 Ward, outside limit) | 7d6 | faces: 6 5 6 3 3 2 2 | 3 succ, 2 six vs Diff 2 | CRITICAL
X020 | E1 S1 Pim brews at home: Craft 3 + Wild 2 | 5d6 | faces: 4 1 4 3 5 | 3 succ, 0 six vs Diff 2 | SUCCESS
X021 | E1 S1 Juno talking lead (the aged man on her ward; city, Voice = casting): Heart 3 + Voice 2 + Life nurse 1 | 6d6 | faces: 3 6 5 6 6 5 | 5 succ, 3 six vs Diff 2 | CRITICAL
X022 | E1 S1 Wren Reveal at the betting shop (city, 1 Magic): Craft 3 | 3d6 | faces: 3 3 3 | 0 succ, 0 six vs Diff 2 | FAILURE
X023 | E1 S1 Moss talking lead (the bookie's runner; city, no gift on it): Heart 2 | 2d6 | faces: 6 3 | 1 succ, 1 six vs Diff 2 | PARTIAL
X024 | E1 S2 Odile Book research: Wits 3 + Sight 2 + Book 1 + Sense 1 (Moss, 1 Ward) | 7d6 | faces: 6 2 4 4 6 3 2 | 4 succ, 2 six vs Diff 2 | CRITICAL
X025 | E1 S2 Pim brews at home: Craft 3 + Wild 2 | 5d6 | faces: 5 1 2 3 1 | 1 succ, 0 six vs Diff 2 | PARTIAL
X026 | E1 S2 Juno talking lead + Voice Surge (2 Magic; the bookie's widow; city): Heart 3 + Voice 2 | 5d6 | faces: 5 5 3 2 2 | 2 succ, 0 six vs Diff 2 | SUCCESS
X027 | E1 S2 Wren searching lead with Veil (the pawn shop's back room; city): Wits 2 + Veil 2 | 4d6 | faces: 1 1 2 2 | 0 succ, 0 six vs Diff 2 | FAILURE
X028 | E1 S2 Moss searching lead (the dog track ledgers; city): Wits 2 | 2d6 | faces: 4 5 | 2 succ, 0 six vs Diff 2 | SUCCESS
X029 | E1 S3 Wren searching lead with Veil + Veil Surge (2 Magic; the old debt office; city): Wits 2 + Veil 2 | 4d6 | faces: 1 5 5 4 | 3 succ, 0 six vs Diff 2 | SUCCESS
X030 | E1 S3 Odile Book research + Sight Surge (2 Magic): Wits 3 + Sight 2 + Book 1 + Sense 1 (Moss, 1 Ward) | 7d6 | faces: 5 4 2 6 4 2 2 | 4 succ, 1 six vs Diff 2 | SUCCESS
X031 | E1 S3 Pim Reveal (city, 1 Magic) + own Magic 1: Craft 3 + 1 | 4d6 | faces: 1 5 5 6 | 3 succ, 1 six vs Diff 2 | SUCCESS
X032 | E1 S3 Juno talking lead with Voice (the pawnbroker's daughter; city): Heart 3 + Voice 2 | 5d6 | faces: 4 4 1 2 2 | 2 succ, 0 six vs Diff 2 | SUCCESS
X033 | E1 S3 Moss talking lead (night porter at the arcade; city): Heart 2 | 2d6 | faces: 3 2 | 0 succ, 0 six vs Diff 2 | FAILURE
X034 | E1 S4 Odile Book research: Wits 3 + Sight 2 + Book 1 + Sense 1 (Moss, 1 Ward) | 7d6 | faces: 6 5 6 3 2 6 1 | 4 succ, 3 six vs Diff 2 | CRITICAL
X035 | E1 S4 Juno talking lead with Voice (ward sister on the aged man's visitors; city): Heart 3 + Voice 2 + Life nurse 1 | 6d6 | faces: 1 1 6 1 2 6 | 2 succ, 2 six vs Diff 2 | CRITICAL
X036 | E1 S4 Pim searching lead with Wild (the arcade's back stairs; city): Wits 2 + Wild 2 | 4d6 | faces: 4 1 4 3 | 2 succ, 0 six vs Diff 2 | SUCCESS
X037 | E1 S4 Moss talking lead (the man who sells the racing paper; city): Heart 2 | 2d6 | faces: 5 3 | 1 succ, 0 six vs Diff 2 | PARTIAL
X038 | E1 R1 (threat first) attack 1 target d6 (1-3 last hurt it; 4-5 most Hurt marked; 6 Collect) | 1d6 | faces: 5
X039 | E1 R1 Moss (H3/5) defends attack 1: Nerve 3 + own Ward 1 vs Danger 3 | 4d6 | faces: 4 5 4 5 | 4 succ, 0 six vs Diff 3 | SUCCESS
X040 | E1 R1 (threat first) attack 2 target d6 | 1d6 | faces: 5
X041 | E1 R1 Wren Blast (1 Magic) + Blasting potion declared + own Magic 1: Craft 3 + 1 vs Defence 2 (Weakness) | 4d6 | faces: 1 2 3 3 | 0 succ, 0 six vs Diff 2 | FAILURE
X042 | E1 R1 Pim Blast (1 Magic) + Blasting potion declared: Craft 3 vs Defence 2 | 3d6 | faces: 4 1 5 | 2 succ, 0 six vs Diff 2 | SUCCESS
X043 | E1 R1 Juno attack + Binding potion declared: Nerve 2 vs Defence 2 | 2d6 | faces: 1 3 | 0 succ, 0 six vs Diff 2 | FAILURE
X044 | E1 R1 Odile attack: Nerve 2 vs Defence 2 | 2d6 | faces: 1 5 | 1 succ, 0 six vs Diff 2 | PARTIAL
X045 | E1 R2 Moss (H3/5, W0) Hold: Nerve 3 vs Defence 2 | 3d6 | faces: 6 2 4 | 2 succ, 1 six vs Diff 2 | SUCCESS
X046 | E1 R2 Pim attack: Nerve 2 vs Defence 2 | 2d6 | faces: 2 2 | 0 succ, 0 six vs Diff 2 | FAILURE
X047 | E1 R2 Juno attack: Nerve 2 vs Defence 2 | 2d6 | faces: 3 2 | 0 succ, 0 six vs Diff 2 | FAILURE
X048 | E1 R2 Wren attack: Nerve 2 vs Defence 2 | 2d6 | faces: 2 2 | 0 succ, 0 six vs Diff 2 | FAILURE
X049 | E1 R2 Odile attack: Nerve 2 vs Defence 2 | 2d6 | faces: 4 5 | 2 succ, 0 six vs Diff 2 | SUCCESS
X050 | E1 R2 threat attack 1 d6 (Held: must target Moss; d6 rolled anyway) | 1d6 | faces: 2
X051 | E1 R2 Moss (H3/5) defends Held attack 1: Nerve 3 vs Danger 3 | 3d6 | faces: 3 3 1 | 0 succ, 0 six vs Diff 3 | FAILURE
X052 | E1 R2 threat attack 2 target d6 (1-3 Odile hurt it last; 4-5 most Hurt marked; 6 Collect) | 1d6 | faces: 6
X053 | E1 R2 Juno (H2/4, M2) defends Collect: Nerve 2 vs Danger 3 | 2d6 | faces: 6 2 | 1 succ, 1 six vs Diff 3 | FAILURE
X054 | E1 R3 Pim (H2) attack: Nerve 2 vs Defence 2 | 2d6 | faces: 3 3 | 0 succ, 0 six vs Diff 2 | FAILURE
X055 | E1 R3 Wren (H2) attack: Nerve 2 vs Defence 2 | 2d6 | faces: 4 4 | 2 succ, 0 six vs Diff 2 | SUCCESS
X056 | E1 R3 Odile (H1) attack: Nerve 2 vs Defence 2 | 2d6 | faces: 4 1 | 1 succ, 0 six vs Diff 2 | PARTIAL
X057 | E1 R4 Unmaking: Pim leads Craft 3 (1 Magic) + Wren joins 2 (1 Magic, her action) + Juno joins 2 (Down, 1 Magic) vs Diff 4 (4 witches, Weakness known) | 7d6 | faces: 4 2 6 4 6 5 3 | 5 succ, 2 six vs Diff 4 | CRITICAL
X058 | E2 setup: Witch 1 Power (1 Force 2 Flame 3 Sight 4 Voice 5 Veil 6 Wild) | 1d6 | faces: 5
X059 | E2 setup: Witch 2 Power (1 Force 2 Flame 3 Sight 4 Voice 5 Veil 6 Wild) | 1d6 | faces: 1
X060 | E2 setup: Witch 3 Power (1 Force 2 Flame 3 Sight 4 Voice 5 Veil 6 Wild) | 1d6 | faces: 6
X061 | E2 setup: Witch 1 Life (1 student 2 nurse 3 shop worker 4 teacher 5 mechanic 6 bus driver) | 1d6 | faces: 1
X062 | E2 setup: Witch 2 Life (1 student 2 nurse 3 shop worker 4 teacher 5 mechanic 6 bus driver) | 1d6 | faces: 1
X063 | E2 setup: Witch 3 Life (1 student 2 nurse 3 shop worker 4 teacher 5 mechanic 6 bus driver) | 1d6 | faces: 3
X064 | E2 setup: Witch 2 Life reroll (1 student taken) | 1d6 | faces: 4
X065 | E2 S1 Hana Book research (searching, so Veil fits): Wits 3 + Veil 2 + Book 1 | 6d6 | faces: 6 5 2 4 6 5 | 5 succ, 2 six vs Diff 2 | CRITICAL
X066 | E2 S1 Tom talking lead (a pupil who lives in the tower; city): Heart 2 + Life teacher 1 | 3d6 | faces: 2 6 2 | 1 succ, 1 six vs Diff 2 | PARTIAL
X067 | E2 S1 Bel brews at home: Craft 3 + Wild 2 | 5d6 | faces: 1 3 6 4 2 | 2 succ, 1 six vs Diff 2 | SUCCESS
X068 | E2 S2 Hana Book research: Wits 3 + Veil 2 + Book 1 | 6d6 | faces: 4 6 1 1 2 3 | 2 succ, 1 six vs Diff 2 | SUCCESS
X069 | E2 S2 Bel talking lead with Wild (the tower's old caretaker; city, casting): Heart 2 + Wild 2 | 4d6 | faces: 6 2 3 2 | 1 succ, 1 six vs Diff 2 | PARTIAL
X070 | E2 S3 Hana Book research: Wits 3 + Veil 2 + Book 1 | 6d6 | faces: 4 5 4 6 3 1 | 4 succ, 1 six vs Diff 2 | SUCCESS
X071 | E2 S3 Tom talking lead (the fire officer who signed off the tower; city): Heart 2 + own Magic 1 | 3d6 | faces: 2 2 4 | 1 succ, 0 six vs Diff 2 | PARTIAL
X072 | E2 S3 Bel talking lead with Wild (tenants at the bus stop; city, casting): Heart 2 + Wild 2 | 4d6 | faces: 3 5 1 5 | 2 succ, 0 six vs Diff 2 | SUCCESS
X073 | E2 S4 Hana Book research: Wits 3 + Veil 2 + Book 1 + own Magic 1 | 7d6 | faces: 6 5 1 6 5 3 6 | 5 succ, 3 six vs Diff 2 | CRITICAL
X074 | E2 S4 Bel talking lead with Wild (the baker's landlord; city, casting): Heart 2 + Wild 2 | 4d6 | faces: 4 6 5 1 | 3 succ, 1 six vs Diff 2 | SUCCESS
X075 | E2 R1 (threat first) attack target d6 (1-3 last hurt it; 4-5 most Hurt marked; 6 Flare) | 1d6 | faces: 5
X076 | E2 R1 Storyteller tie pick, all at Hurt 0 (1-2 Hana, 3-4 Tom, 5-6 Bel) | 1d6 | faces: 5
X077 | E2 R1 Bel defends: Nerve 2 vs Danger 3 | 2d6 | faces: 1 2 | 0 succ, 0 six vs Diff 3 | FAILURE
X078 | E2 R1 Bel (H2) Bind with Wild + Wild Surge (1 + 2 Magic): Craft 3 + Wild 2 vs Defence 2 | 5d6 | faces: 5 3 5 2 3 | 2 succ, 0 six vs Diff 2 | SUCCESS
X079 | E2 R1 Tom attack with Force + Blasting potion declared: Nerve 3 + Force 2 vs Defence 1 (Wild Surge) | 5d6 | faces: 1 2 6 3 5 | 2 succ, 1 six vs Diff 1 | SUCCESS
X080 | E2 R1 Hana attack: Nerve 2 vs Defence 1 (Wild Surge) | 2d6 | faces: 2 2 | 0 succ, 0 six vs Diff 1 | FAILURE
X081 | E2 R2 Hana (H1) attack: Nerve 2 vs Defence 2 | 2d6 | faces: 6 1 | 1 succ, 1 six vs Diff 2 | PARTIAL
X082 | E2 R2 Bel (H0 after Healing) attack: Nerve 2 vs Defence 2 | 2d6 | faces: 6 4 | 2 succ, 1 six vs Diff 2 | SUCCESS
X083 | E2 R2 Tom attack with Force: Nerve 3 + Force 2 vs Defence 2 | 5d6 | faces: 6 3 6 2 1 | 2 succ, 2 six vs Diff 2 | CRITICAL
X084 | E2 R3 Unmaking: Bel leads Craft 3 (1 Magic) + Tom joins 2 + Hana joins 2 (1 Magic each) + helpers Tom 1, Hana 1 vs Diff 3 (3 witches, Weakness known) | 9d6 | faces: 4 4 6 1 3 6 4 5 3 | 6 succ, 2 six vs Diff 3 | CRITICAL
X085 | D1a R1 public (threat came at Doom 5), Tobias in its grip, threat first: attack 1 target d6 | 1d6 | faces: 5
X086 | D1a R1 threat first: attack 2 target d6 | 1d6 | faces: 6
X087 | D1a R1 Moss (H2/5, W3) defends attack 1: Nerve 3 + own Ward 1 vs Danger 3 | 4d6 | faces: 5 1 3 3 | 1 succ, 0 six vs Diff 3 | FAILURE
X088 | D1a R1 Storyteller tie pick for Collect, witches at Magic 3 (1 Wren 2 Juno 3 Odile 4 Pim, 5-6 reroll) | 1d6 | faces: 5
X089 | D1a R1 Storyteller tie pick for Collect, reroll (1 Wren 2 Juno 3 Odile 4 Pim, 5-6 reroll) | 1d6 | faces: 3
X090 | D1a R1 Odile (H0, M3) defends Collect with Sight: Nerve 2 + Sight 2 vs Danger 3 | 4d6 | faces: 3 4 1 4 | 2 succ, 0 six vs Diff 3 | PARTIAL
X091 | D1a R1 Pim (H1) Bind with Wild + Wild Surge (3 Magic): Craft 3 + Wild 2 vs Defence 3 (no Weakness) | 5d6 | faces: 1 6 2 5 6 | 3 succ, 2 six vs Diff 3 | CRITICAL
X092 | D1a R1 Juno frees Tobias: Nerve 2 + own Magic 1 vs Defence 2 (Wild Surge) | 3d6 | faces: 3 3 4 | 1 succ, 0 six vs Diff 2 | PARTIAL
X093 | D1a R1 Wren (H1) frees Tobias: Nerve 2 + own Magic 1 + Odile helps 1 vs Defence 2 (Wild Surge) | 4d6 | faces: 3 4 1 6 | 2 succ, 1 six vs Diff 2 | SUCCESS
X094 | D2 R2 hidden, Weakness known (Def 2): Hana attack + Binding potion declared: Nerve 2 | 2d6 | faces: 6 5 | 2 succ, 1 six vs Diff 2 | SUCCESS
X095 | D2 R2 Bel attack + Binding potion declared: Nerve 2 | 2d6 | faces: 5 2 | 1 succ, 0 six vs Diff 2 | PARTIAL
X096 | D3 Hard R1 (after threat-first attacks) Pim Bind with Wild (1 Magic): Craft 3 + Wild 2 vs Defence 2 (Weakness) | 5d6 | faces: 5 1 6 5 1 | 3 succ, 1 six vs Diff 2 | SUCCESS
X097 | D3 Hard R2 Juno attack + Binding potion declared: Nerve 2 + own Magic 1 vs Defence 2 | 3d6 | faces: 3 4 5 | 2 succ, 0 six vs Diff 2 | SUCCESS
X098 | D3 Hard R2 threat's one remaining attack (1 lost, 1 wasted): target d6 (1-3 Juno hurt it last) | 1d6 | faces: 5
X099 | D4 Hard R2 threat attack 1 target d6 (Pim hurt it last; Wren most Hurt) | 1d6 | faces: 5
X100 | D4 Hard R2 threat attack 2 target d6 | 1d6 | faces: 6
X101 | D4 Moss Shields attack 1 (meant for Wren), defends: Nerve 3 + own Ward 1 vs Danger 3 | 4d6 | faces: 5 5 6 1 | 3 succ, 1 six vs Diff 3 | SUCCESS
X102 | D4 Juno (M3) defends Collect, Moss's second Shield refused: Nerve 2 vs Danger 3 | 2d6 | faces: 4 1 | 1 succ, 0 six vs Diff 3 | FAILURE
X103 | D5 public R2: Juno (H3) Shelter on Odile (1 Magic): Craft 2 + own Magic 1 vs 2 | 3d6 | faces: 6 5 5 | 3 succ, 1 six vs Diff 2 | SUCCESS
X104 | D5 R2 threat attack 1 target d6 (1-3 Wren hurt it last; 4-5 tie Wren/Juno H3; 6 Tobias free and guarded: attacks guard Wren) | 1d6 | faces: 1
X105 | D5 R2 Wren (H3/4, guarding) defends attack 1: Nerve 2 + Veil 2 (defending fits) vs Danger 3 | 4d6 | faces: 1 5 1 1 | 1 succ, 0 six vs Diff 3 | FAILURE
X106 | D5 R2 threat attack 2 target d6 (1-3 Wren is Down so use 4-5: Juno H3; 6 Tobias now unguarded: taken) | 1d6 | faces: 4
X107 | D5 R2 Juno (H3/4, Shelter caster) defends attack 2: Nerve 2 vs Danger 3 | 2d6 | faces: 4 3 | 1 succ, 0 six vs Diff 3 | FAILURE
X108 | D8 (D1a cont.) R2: Odile guarded in R1, then attacked in R2 (guard ended). Threat's one attack (other lost to Bind): target d6 | 1d6 | faces: 6
X109 | D8 (D1a cont.) R2 Odile attack, made before the threat acted (rolled after X108; order of logging only): Nerve 2 vs Defence 3 | 2d6 | faces: 2 2 | 0 succ, 0 six vs Diff 3 | FAILURE
X110 | D6 S5 (Doom 4, Seen 4/4, Clues 5/11) Bel talking lead with Wild (city, casting): Heart 2 + Wild 2 | 4d6 | faces: 6 2 5 1 | 2 succ, 1 six vs Diff 2 | SUCCESS
X111 | D6 S5 Hana searching lead with Veil (city, casting): Wits 3 + Veil 2 | 5d6 | faces: 3 1 6 4 3 | 2 succ, 1 six vs Diff 2 | SUCCESS
X112 | D6 S5 Tom talking lead (city, not casting): Heart 2 | 2d6 | faces: 1 6 | 1 succ, 1 six vs Diff 2 | PARTIAL
X113 | D6b S5 (Hard coven, Doom 4, Seen 4/4, Clues 12/20) Wren Reveal (city, 1 Magic): Craft 3 | 3d6 | faces: 1 3 1 | 0 succ, 0 six vs Diff 2 | FAILURE
X114 | D6b S5 Pim Reveal (city, 1 Magic): Craft 3 | 3d6 | faces: 1 4 4 | 2 succ, 0 six vs Diff 2 | SUCCESS
X115 | D6b S5 (Doom now 5 mid-scene) Juno talking lead with Voice (city, casting): Heart 3 + Voice 2 | 5d6 | faces: 1 5 2 3 4 | 2 succ, 0 six vs Diff 2 | SUCCESS
X116 | D6b S5 Odile Book research: Wits 3 + Sight 2 + Book 1 | 6d6 | faces: 2 6 3 2 6 1 | 2 succ, 2 six vs Diff 2 | CRITICAL
X117 | D7 ep3 R1 (Standard 3 witches, Toughness 18, Weakness known) threat first: target d6 | 1d6 | faces: 6
X118 | D7 ep3 R1 Storyteller tie pick, all Hurt 0 (1-2 Hana 3-4 Tom 5-6 Bel) | 1d6 | faces: 5
X119 | D7 ep3 R1 Bel defends Flare (Hit 3): Nerve 2 vs Danger 3 | 2d6 | faces: 3 2 | 0 succ, 0 six vs Diff 3 | FAILURE
X120 | D7 ep3 R1 Bel Bind with Wild + Wild Surge (3 Magic): Craft 4 + Wild 2 vs Defence 2 | 6d6 | faces: 5 5 1 6 5 1 | 4 succ, 1 six vs Diff 2 | SUCCESS
X121 | D7 ep3 R1 Tom attack with Force + Blasting declared: Nerve 4 + Force 2 vs Defence 1 if Surge worked | 6d6 | faces: 2 1 6 6 1 4 | 3 succ, 2 six vs Diff 1 | CRITICAL
X122 | D7 ep3 R1 Hana attack: Nerve 2 vs Defence 1 if Surge worked | 2d6 | faces: 3 5 | 1 succ, 0 six vs Diff 1 | SUCCESS
X123 | D7 ep3 R2 Tom attack with Force: Nerve 4 + Force 2 vs Defence 2 | 6d6 | faces: 1 5 6 2 5 6 | 4 succ, 2 six vs Diff 2 | CRITICAL
X124 | D7 ep3 R2 Hana attack: Nerve 2 + own Magic 1 vs Defence 2 | 3d6 | faces: 5 4 3 | 2 succ, 0 six vs Diff 2 | SUCCESS
X125 | D7 ep3 R2 Bel (H1 after Healing) Blast (1 Magic): Craft 4 vs Defence 2 | 4d6 | faces: 2 1 3 3 | 0 succ, 0 six vs Diff 2 | FAILURE
X126 | D7 ep3 R3 Tom attack with Force: Nerve 4 + Force 2 vs Defence 2 (needs 2 to Break) | 6d6 | faces: 6 1 5 4 5 4 | 5 succ, 1 six vs Diff 2 | SUCCESS
X127 | D7 ep3 R3 Unmaking: Bel leads Craft 4 (1 Magic) + Hana joins 2 + helpers Tom 2 Magic vs Diff 3 | 8d6 | faces: 3 4 4 5 6 1 1 5 | 5 succ, 1 six vs Diff 3 | SUCCESS
X128 | D7 ep5 R1 (Toughness 24, Weakness known) threat first: target d6 | 1d6 | faces: 3
X129 | D7 ep5 R1 Storyteller tie pick, all Hurt 0 (1-2 Hana 3-4 Tom 5-6 Bel) | 1d6 | faces: 2
X130 | D7 ep5 R1 Hana defends: Nerve 3 + Veil 2 vs Danger 3 | 5d6 | faces: 6 6 4 3 5 | 4 succ, 2 six vs Diff 3 | CRITICAL
X131 | D7 ep5 R1 Bel Bind with Wild + Wild Surge (3 Magic): Craft 4 + Wild 2 vs Defence 2 | 6d6 | faces: 1 4 2 6 2 1 | 2 succ, 1 six vs Diff 2 | SUCCESS
X132 | D7 ep5 R1 Tom attack with Force + Blasting declared: Nerve 4 + Force 2 vs Defence 1 if Surge worked | 6d6 | faces: 5 5 3 4 1 1 | 3 succ, 0 six vs Diff 1 | SUCCESS
X133 | D7 ep5 R1 Hana attack: Nerve 3 vs Defence 1 if Surge worked | 3d6 | faces: 1 4 2 | 1 succ, 0 six vs Diff 1 | SUCCESS
X134 | D7 ep5 R2 Tom attack with Force: Nerve 4 + Force 2 vs Defence 2 | 6d6 | faces: 5 5 1 4 6 2 | 4 succ, 1 six vs Diff 2 | SUCCESS
X135 | D7 ep5 R2 Hana attack: Nerve 3 + own Magic 1 vs Defence 2 | 4d6 | faces: 6 1 5 4 | 3 succ, 1 six vs Diff 2 | SUCCESS
X136 | D7 ep5 R2 Bel attack: Nerve 3 vs Defence 2 | 3d6 | faces: 4 5 4 | 3 succ, 0 six vs Diff 2 | SUCCESS
X137 | D7 ep5 R3 Tom attack with Force + Force Surge (2 Magic): Nerve 4 + Force 2 vs Defence 2 | 6d6 | faces: 2 4 1 4 6 2 | 3 succ, 1 six vs Diff 2 | SUCCESS
X138 | D7 ep5 R3 Hana attack: Nerve 3 + own Magic 1 vs Defence 2 | 4d6 | faces: 6 3 4 4 | 3 succ, 1 six vs Diff 2 | SUCCESS
X139 | D7 ep5 R3 Bel attack: Nerve 3 vs Defence 2 | 3d6 | faces: 4 5 6 | 3 succ, 1 six vs Diff 2 | SUCCESS
X140 | D7 ep5 R4 Unmaking: Bel leads Craft 4 + Tom joins 2 + Hana joins 2 + helpers Tom 1, Hana 1 vs Diff 3 | 10d6 | faces: 6 6 4 5 1 1 3 6 6 6 | 7 succ, 5 six vs Diff 3 | CRITICAL
X141 | D9 S3 (3 witches, no guardian player, coven holds 2 potions) Bel brews at home: Craft 3 + Wild 2 | 5d6 | faces: 4 4 1 3 3 | 2 succ, 0 six vs Diff 2 | SUCCESS
X142 | D10 R3 (Standard, 3 witches, no guardian player; Hana and Bel Down; call unused) threat attack target d6 (Tom is the only one standing) | 1d6 | faces: 2
X143 | D10 R3 Tom (H3/4) defends: Nerve 3 vs Danger 3 | 3d6 | faces: 2 1 3 | 0 succ, 0 six vs Diff 3 | FAILURE
X144 | D11 S2 (Exposure 3/4) Hana searching lead with Veil + Veil Surge (2 Magic; city): Wits 3 + Veil 2 | 5d6 | faces: 4 4 3 4 1 | 3 succ, 0 six vs Diff 2 | SUCCESS
X145 | D11 S2 Bel Reveal (city, 1 Magic): Craft 3 | 3d6 | faces: 2 2 2 | 0 succ, 0 six vs Diff 2 | FAILURE
X146 | D11 S2 Tom talking lead with no Power (city, not casting): Heart 2 | 2d6 | faces: 4 3 | 1 succ, 0 six vs Diff 2 | PARTIAL
X147 | D12 Hard R3 hidden: Moss Hold: Nerve 3 vs Defence 2 | 3d6 | faces: 1 4 2 | 1 succ, 0 six vs Diff 2 | PARTIAL
X148 | D12 Hard R3 Held attack d6 (6 = Collect, which picks the most Magic; Hold says Moss) | 1d6 | faces: 5
```

**Roll totals:** 101 rolls with a result across everything: 16 Critical (16%), 47 Success, 15 Partial, 23 Failure (23%). The other 47 are single d6s (setup, targets, tie picks).

**Exact odds used above** (worked out by counting, not by rolling):
- Bind works (Partial or better) against Defence 2 with n dice: 1 − (1/2)^n. 3 dice 87.5%; 5 dice 96.9%; 6 dice 98.4%. Against Defence 3 (a Partial needs 2 successes): 3 dice 50%; 5 dice 81.3%.
- Episode 1's Unmaking, 7 dice needing 4 successes: exactly 50%.
- Episode 2's Unmaking, 9 dice needing 3: 91.0%.
- Defending with 2 dice against Danger 3: Success 0%, Partial 25%, Failure 75%.
