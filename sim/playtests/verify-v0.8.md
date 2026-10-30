# Verification playtest: core rules v0.8

- **Rules used:** `docs/CORE-RULES.md` v0.8 only. Nothing else was treated as a rule. The glossary was read only to check words.
- **Episode 1:** Standard, 4 players: 3 witches and a guardian player. Players who play to win. The coven chose to wait for the Weakness, so Doom reached the Showdown mark and the threat came to them in public.
- **Episode 2:** Easy, 3 new players, no guardian player. The dice decided the leads. When the coven had half the Clues before Doom 5, it chose to keep investigating, so this episode also ended in a public showdown.
- **Dice:** every roll came from a dice script (`roll.mjs "label" dice [difficulty]`, `Math.random`, faces 1–6). Each roll was logged with a label as it was made. Section 9 lists all 95 rolls (Z001–Z095). No roll was invented, changed or made again.
- **Results:**
  - **Episode 1: Win.** 14 of 15 Clues at Doom 4. The coven played a fifth scene for the last Clue and the Weakness, so the threat came at Doom 5 with the innocent in its grip. The threat struck first (2 attacks). The guardian freed the innocent. A Veil Surge switched off public Exposure for the whole fight. Broken in round 2; the Unmaking worked in round 3.
  - **Episode 2: Win.** All 9 Clues by the end of scene 5, so the threat came at Doom 5. It struck first (1 attack, defended). Force freed the innocent. One big Blast did 8 of 12. Broken in round 2, and the Unmaking worked in the same round.
- **Short verdict:** v0.8 fixed both v0.7 blockers in play. The innocent can now be freed in round 1, and a guard or Shelter made in round 1 now covers round 2's attacks. Both public showdowns ran from the text with no stop. **Both episodes were clean.** But the public path was cheap: both covens let Doom reach 5 on purpose and won easily (W5), partly because Veil's Surge still switches off public Exposure for a whole fight (W1). Drills found one new gap on core flow: how long a guard lasts when the threat's attack is lost (W2).

Severity used below: **blocker** = the text gives opposite answers that change the result, or a core design goal fails in play; **confusing** = a table has to stop and invent a ruling, or a core choice doesn't work; **minor** = wording, or a gap that rarely matters.

---

## 1. Verification table

Status: **fixed** = the v0.8 text answers it; **partly** = some of it is answered; **not changed** = no new text answers it; **changed differently** = answered, but not in the way the issue suggested. Quotes are from `docs/CORE-RULES.md` v0.8, with bold removed.

| V# | Issue (short) | Status | v0.8 text that answers it, or what is still open |
|---|---|---|---|
| V1 | Innocent lost before anyone can free them (blocker) | fixed | The innocent: "If they're still in its grip at the end of the first round, they're lost." Tracks: "Round 1: the threat's attacks, the characters' actions, the innocent, Exposure, Doom." Glossary: "Lost if still in the threat's grip at the end of the first round." In play: both innocents were freed in round 1 after the threat's first strike (Z035, Z062). Drill C again (Z077). No question at the table. |
| V2 | Guard and Shelter in round 1 do nothing | fixed | Shelter: "until the threat has next acted, one person can't be hurt by its attacks (it ends if you go Down)". Guard: "(until the threat has next acted, if it goes for them it attacks you instead; it ends if you go Down)". Drill A: a round-1 guard and a round-1 Shelter both covered round 2's attacks, even though the guard attacked in round 2. New edge: what "acted" means when its attack is lost (W2). |
| V3 | Bind every round leaves a 1-attack threat with nothing | not changed (on purpose) | No text change. `book/REVIEW.md` row 56: "Binding the threat every round with Bind is allowed. Simulated: a coven that Binds every round wins no more than one that attacks." Neither coven had a Wild witch or cast Bind, so it didn't come up. |
| V4 | When the no-guardian call can be made | fixed | "once per episode, on any character's turn, the coven may call it for one Mend or one Carry". The v0.7 D10 case is now clear: there is no character's turn during the threat's attacks, so it's a Loss. Use in scenes isn't stated, but "once per episode" reads as yes. The call wasn't needed in Episode 2. |
| V5 | Under Veil's Surge a failed casting roll costs nothing | fixed | Veil: "no Exposure from casting for the rest of the scene (a casting roll's cost becomes 1 Hurt)". Whose casting is still unstated (it reads as everyone's). The showdown version is still open: see W1. |
| V6 | Potion cap with no guardian player | fixed | "at most one per character (the guardian counts if a player plays it)". Episode 1 cap 4; Episode 2 cap 3, and a fourth potion from a brew was lost (Z056) with no question. |
| V7 | Glossary not updated | partly | Round ("In round 1 the threat acts first"), In its grip and Guard are updated. Seen still reads "any further rise in Exposure becomes Doom +1", without the page's "(once per round or scene)". |
| V8 | One potion a round: per character or per coven | partly | "each character uses at most one a round." Episode 1 round 1: Dolly drank Healing and Mira used Blasting, no question. Still no limit in the investigation, where there are no rounds. |
| V9 | Can a character skip their action | fixed | "Each character takes one action, in any order (or does nothing)". Used in Episode 1 round 2 (three characters held after the Break) and Drill B. |
| V10 | Can a Down witch lead the Unmaking | fixed | "One standing witch leads with Craft as their action and pays 1 Magic." Episode 1 round 3 (Dolly) and Episode 2 round 2 (Rafi) ran clean. |
| V11 | Is Sight's miss a lost attack | fixed | "(this isn't a lost attack)". Not used in play (Ines kept her Magic for the Unmaking). |
| V12 | Long Life rerolls | not changed | Still "d6, reroll one someone has". Episode 1's witch 2 needed three rerolls (Z009–Z011). |
| V13 | Critical die is easy to forget (sheets) | not changed | No sheets yet. In Drill C the die from Z077 was remembered on Z079. |

### Counts

| Fixed | Partly | Not changed | Changed differently | Total |
|---|---|---|---|---|
| **8** (V1, V2, V4, V5, V6, V9, V10, V11) | **2** (V7, V8) | **3** (V3 on purpose, V12, V13) | **0** | **13** |

Both v0.7 items that broke public showdowns (V1, V2) are fixed and held up in play.

---

## 2. Setup

### Episode 1 numbers (Standard; w = 3 witches; n = 4 with the guardian player)

| Item | Value | How it was worked out |
|---|---|---|
| Lead Difficulty | 2 | table |
| Defence / Danger | 2 / 3 | table; Defence 3 until the Weakness is known |
| Hit | 2 (3 on its signature move) | table |
| Toughness | 9 | 3 × 3. No extra 3 (only for 3 witches and no guardian player) |
| Attacks a round | 2 | "2 against 4 or 5" characters |
| Clues needed | 15 (half = 8) | 4 × 4 − 1; half rounded up |
| Exposure boxes | 4 | table |
| Doom | 12, mark at 5 | Tracks |
| Unmaking Difficulty | 3 (5 without the Weakness) | number of witches, +2 |
| Potion cap | 4 | one per character, guardian counted (a player plays it) |

### Episode 1 characters

Powers rolled in the page's order (1 Force, 2 Flame, 3 Sight, 4 Voice, 5 Veil, 6 Wild): Z001 = 4 Voice; Z002 = 4 and Z003 = 4 (both taken); rerolls Z004 = 5 Veil, Z005 = 3 Sight. **No attack Power** (no Force, Flame or Wild). Lives: Z006 = 3, Z007 = 3 (taken), Z008 = 4; witch 2 rerolled Z009 = 3, Z010 = 4, Z011 = 6. Ratings 3, 2, 2, 1 placed to win.

| Witch | Power | Heart | Wits | Nerve | Craft | Life | Hurt | Magic | Plan |
|---|---|---|---|---|---|---|---|---|---|
| Mira Quint | Voice | **3** | 1 | 2 | 2 | shop worker | 0/4 | 5 | Talking leads (5–6 dice); Hide |
| Dolly Asante | Veil | 1 | 2 | 2 | **3** | bus driver | 0/4 | 5 | Brew; Hide; lead the Unmaking |
| Ines Harrow | Sight | 2 | **3** | 2 | 1 | teacher | 0/4 | 5 | Book research every scene |

**Fen**, the guardian: an old spirit bound to the coven's flat above a boatyard. A dog fox, or a thin man in a duffel coat. Placed Heart 2, Wits 2, **Nerve 3**. Hurt 0/5. Ward 5.

**The threat: the Lamplighter.** A towpath spirit that walks the canal with a lantern and leads people into the locks. Two men have drowned.
- Defence 2 (3 until the Weakness), Danger 3, Hit 2, Toughness 9, 2 attacks a round.
- **Signature move, Lure:** one attack at Hit 3 on the standing character with the least Hurt marked (ties: the Storyteller picks).
- **Weakness:** its own lantern, drowned in the lock it came from.
- **Plan:** at Doom 12 it walks the innocent into the lock and wears him.

**The innocent:** Sol Becker, the night lock-keeper at Five Locks.

### Episode 2 numbers (Easy; w = 3; n = 3; no guardian player)

| Item | Value | How it was worked out |
|---|---|---|
| Lead Difficulty | 1 (so no Partial on leads) | table |
| Defence / Danger | 1 / 1 | table; Defence 2 until the Weakness |
| Hit | 2 (3 on its signature move) | table |
| Toughness | 12 | 3 × 3, plus 3 "against a coven of 3 witches and no guardian player" |
| Attacks a round | 1 | "1 attack a round against 3 characters" |
| Clues needed | 9 (half = 5) | 3 × 3; half rounded up |
| Exposure boxes | 5 | table |
| Unmaking Difficulty | 3 (5 without the Weakness) | number of witches, +2 |
| Potion cap | 3 | the guardian isn't played, so not counted |
| The call | once: one Mend or one Carry | "No guardian player" |

### Episode 2 characters

Powers: Z041 = 4 Voice, Z042 = 1 Force, Z043 = 2 Flame. No duplicates. Lives: Z044 = 1, Z045 = 4, Z046 = 3. New players put the 3 where their Power seemed to fit.

| Witch | Power | Heart | Wits | Nerve | Craft | Life | Hurt | Magic |
|---|---|---|---|---|---|---|---|---|
| Noor Pell | Voice | **3** | 2 | 1 | 2 | student | 0/4 | 5 |
| Rafi Doyle | Force | 2 | 1 | **3** | 2 | teacher | 0/4 | 5 |
| Bea Lindqvist | Flame | 1 | 2 | 2 | **3** | shop worker | 0/4 | 5 |

**The threat: the Tidewife.** A creature of the river mud that takes people who walk the foreshore at night. A boy has gone missing.
- Defence 1 (2 until the Weakness), Danger 1, Hit 2, Toughness 12, 1 attack a round.
- **Signature move, Mire:** one attack at Hit 3 on the standing witch with the most Magic left (ties: the Storyteller picks).
- **Weakness:** salt from the old salt warehouse, thrown in its eyes.
- **Plan:** at Doom 12 it takes the innocent under.

**The innocent:** Jonah Pike, 14, a mudlarker who saw his friend taken.

### Rulings used (episodes and drills)

| Ruling | Where it came up | Issue |
|---|---|---|
| Veil's Surge covers the round it is cast in (the Exposure step comes after it) | Episode 1 round 1 | W1 |
| The guardian may free the innocent (nothing forbids it) | Episode 1 round 1 | W7 |
| A witch may leave her Power off a roll, and then the roll isn't casting | Drill C | W3 |
| The threat's step counts as acting even if all its attacks are lost | Drill B | W2 |
| The episode ends at once when the threat is destroyed; no Exposure step | Episode 2 round 2 (no effect on the result) | W6 |
| Once the threat is Broken, Seen adds no Doom | Drill C round 3 | W8 |
| Magic may go above 5 | Episode 2 scenes 2–3 | W9 (carried) |
| A Sheltered target doesn't roll defence | Drills A and E | W10 |
| Storyteller ties are picked with a logged die | throughout | — |

### Setup time (estimate)

- Episode 1: about 12 minutes. Two Power rerolls and three Life rerolls (V12). The Storyteller's sums (9, 15, 8, 3) took 2 minutes.
- Episode 2: about 8 minutes. No rerolls.

---

## 3. Play logs

Track line: **Doom / Exposure / Clues**, then each character's Hurt (H) and Magic (M) or Ward (W), then potions.

### Episode 1 (Standard, 3 witches + Fen)

#### Opening

A barge crew finds a second drowned man in the lock at Five Locks. Both men were seen walking toward a lantern on the towpath. The Lamplighter has struck.

**Tracks:** Doom 0/12 · Exposure 0/4 · Clues 0/15 · Mira H0 M5 · Dolly H0 M5 · Ines H0 M5 · Fen H0/5 W5 · Potions none (cap 4). No Life answered.

#### Scene 1

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Ines | Book research | Wits 3 + Sight 2 + Book 1, + Sense 1 (Fen, 1 Ward) = 7 vs 2 | Z012 | Success: 1 Clue |
| Mira | Talking lead with Voice: customers at her shop | Heart 3 + Voice 2 + Life 1 = 6 vs 2 | Z013 | Success: 1 Clue |
| Dolly | Brews at home | Craft 3 vs 2 | Z014 | Success: 2 potions (Healing, Blasting) |
| Fen | Searching lead: the towpath | Wits 2 vs 2 | Z015 | Failure: not casting, so 1 Hurt |

Then Doom +1.

**After scene 1:** Doom 1 · Exposure 0 · Clues 2/15 · Mira H0 M5 · Dolly H0 M5 · Ines H0 M5 · Fen H1 W4 · Potions: Healing, Blasting.

#### Scene 2

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Ines | Book research | 6 + Sense 1 (1 Ward) = 7 vs 2 | Z016 | Success: 1 Clue |
| Mira | Talking lead with Voice: the lock pub | 5 vs 2 | Z017 | Success: 1 Clue |
| Dolly | Reveal at Five Locks (1 Magic) | Craft 3 vs 2 | Z018 | Partial: 1 Clue (the extra Clue needs a success); casting in the city, Exposure +1 |
| Fen | Talking lead: boat people | Heart 2 vs 2 | Z019 | Failure: 1 Hurt |

Then Doom +1.

**After scene 2:** Doom 2 · Exposure 1 · Clues 5 · Mira H0 M5 · Dolly H0 M4 · Ines H0 M5 · Fen H2 W3 · Potions 2.

#### Scene 3

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Ines | Book research | 7 vs 2 (Sense, 1 Ward) | Z020 | Critical: 2 Clues |
| Mira | Talking lead with Voice + Voice Surge (2 Magic): the widow | 5 vs 2 | Z021 | Success: 1 + 1 = 2 Clues |
| Dolly | Searching lead with Veil: the lock-keeper's hut | Wits 2 + Veil 2 = 4 vs 2 | Z022 | Failure: casting in the city, Exposure +1 |
| Fen | Searching lead: old canal maps | Wits 2 vs 2 | Z023 | Success: 1 Clue |

Then Doom +1. Clues 10: **half.** They know it's a lantern spirit that haunts the pumping house at Five Locks, and may go now. Without the Weakness (Defence 3, Unmaking 5) they don't.

**After scene 3:** Doom 3 · Exposure 2 · Clues 10 · Mira H0 M3 · Dolly H0 M4 · Ines H0 M5 · Fen H2 W2 · Potions 2.

#### Scene 4

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Ines | Book research + Sight Surge (2 Magic) | 7 vs 2 (Sense, 1 Ward) | Z024 | Success: 1 + 1 = 2 Clues |
| Mira | Talking lead with Voice: the night-bus driver | 5 vs 2 | Z025 | Partial: 1 Clue; casting in the city, Exposure +1 |
| Fen | Talking lead: the pumping-house caretaker | Heart 2 vs 2 | Z026 | Partial: 1 Clue; 1 Hurt |
| Dolly | Answers her Life (a double shift) | — | — | +1 Magic |

Then Doom +1 → 4. **Clues 14 of 15.**

- **Go or wait.** This was the episode's real choice, and the table argued it.
  - **Go now** (hidden, Sol not there, no Exposure from rounds): Defence 3, so a 2-dice Nerve attack can never fully work (Partial 25%, else Failure), and the Unmaking falls to 8 dice against 5 (36%).
  - **Wait one scene:** Ines's research alone finds the last Clue 98% of the time, but at Doom 5 the threat comes to them in public with Sol in its grip, at Exposure 3/4.
  - **They waited**, and planned a Hide to clear a box first.

**After scene 4:** Doom 4 · Exposure 3 · Clues 14 · Mira H0 M3 · Dolly H0 M5 · Ines H0 M3 · Fen H3 W1 · Potions 2.

#### Scene 5

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Ines | Book research (no Sense: Fen keeps its last Ward) | 6 vs 2 | Z027 | Success: 1 Clue (15). **Weakness known** |
| Dolly | Hide with Veil (1 Magic) | Craft 3 + Veil 2 = 5 vs 2 | Z028 | Success: Exposure 3 → 2 |
| Mira | Answers her Life (stocktake) | — | — | +1 Magic |
| Fen | Rests | — | — | Hurt cleared |

Then Doom +1 → **5. The mark.** Too late to go: the Lamplighter comes to them in public with Sol in its grip. They know the Weakness ("With all the Clues it knows the Weakness").

**After scene 5:** Doom 5 · Exposure 2 · Clues 15/15 · Mira H0 M4 · Dolly H0 M4 · Ines H0 M3 · Fen H0 W1 · Potions: Healing, Blasting.

#### Showdown (public: the canal-side market at Five Locks, at dusk; Sol in its grip)

**Start:** Ines never answered her Life: M2. Threat: Defence 2, Danger 3, Hit 2 (Lure 3), Toughness 0/9, 2 attacks. Unmaking Difficulty 3.

##### Round 1 (the threat's attacks, the characters' actions, the innocent, Exposure, Doom)

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Threat | Attack 1: d6 | — | Z029 = 3 | Nobody has hurt it, so use 4–5: all at Hurt 0, a tie. Storyteller's die (Z030 = 4): **Fen** |
| Fen | Defends (keeps its Ward for Carry) | Nerve 3 vs 3 | Z031 | Partial: 1 Hurt |
| Threat | Attack 2: d6 | — | Z032 = 6 | Sol is in its grip, not free, so **Lure**: least Hurt, the witches tie at 0. Storyteller's die (Z033 = 4): **Dolly** |
| Dolly | Defends with Veil, Hit 3 | Nerve 2 + Veil 2 = 4 vs 3 | Z034 | Failure: 3 Hurt (H3/4) |
| Fen | **Frees Sol**, Mira helps (1 Magic) | Nerve 3 + 1 = 4 vs 2 | Z035 | **Success: Sol is free** |
| Dolly | Drinks the Healing (no action), then Hide + **Veil Surge** (1 + 2 Magic) | Craft 3 + Veil 2 = 5 vs 2 | Z036 | Success: Exposure 2 → 1. No Exposure from casting for the rest of the showdown |
| Mira | Blast (1 Magic) + Blasting declared + own Magic 1 | Craft 2 + 1 = 3 vs 2 | Z037 | Partial: 1 + 1 (Blast) + 1 (Weakness) + 2 (Blasting) = **5**; 1 Hurt |
| Ines | Attack + own Magic 1 | Nerve 2 + 1 = 3 vs 2 | Z038 | Partial: 1 + 1 = 2; 1 Hurt |

- **Order worked:** the threat struck first, then the coven freed Sol before the end-of-round check. No question.
- **The innocent:** Sol is free at the end of round 1, so not lost.
- **Exposure:** Dolly's Veil defence, the Healing, Mira's Blast and the Blasting were all casting in public. But Veil's Surge came before the Exposure step, so no rise (ruling, W1). Hide itself never raises Exposure.
- Doom +1.

**After round 1:** Doom 6 · Exposure 1 · Toughness 7/9 · Mira H1 M1 · Dolly H1 M1 · Ines H1 M1 · Fen H1 W1 · Potions none · Sol free, unguarded (Fen plans to Carry him in round 2, before the threat acts).

##### Round 2 (the characters' actions, the threat's attacks, Exposure, Doom)

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Mira | Attack (keeps her last Magic) | Nerve 2 vs 2 | Z039 | Success: 2 + 1 = 3 → **Broken** (1 lost past the total) |
| Dolly, Ines, Fen | Do nothing | — | — | A Broken threat makes no rolls or moves, so Fen needn't Carry Sol. An Unmaking now (Dolly leads, Ines joins, Fen and Mira help: 7 dice, 77%) would leave no Magic for a retry. Next round all three witches join and Fen helps (8 dice, 86%), and it flees only at the end of round 3 |

No casting, no attacks. Doom doesn't rise once it's Broken.

**After round 2:** Doom 6 · Exposure 1 · Toughness 9/9 (Broken) · Mira H1 M1 · Dolly H1 M1 · Ines H1 M1 · Fen H1 W1.

##### Round 3

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Dolly leads (1 Magic); Mira and Ines join as their actions (1 Magic each); Fen helps (1 Ward) | The Unmaking | Craft 3 + 2 + 2 + 1 = 8 vs 3 | Z040 | Critical: **the Lamplighter is destroyed** |

The chance was 85.5%. The episode ends at once.

**End:** Doom 6/12 · Exposure 1/4 · Clues 15 · Mira H1 M0 · Dolly H1 M0 · Ines H1 M0 · Fen H1/5 W0.

#### Closing

- The lantern goes out in the lock. Sol keeps his job and never walks the towpath at night again.
- **Result: Win** (destroyed, innocent safe, not Seen). Carry-over: the Lamplighter gets a page in the Book.

### Episode 2 (Easy, 3 witches, no guardian player)

#### Opening

A boy's trainers are found at the edge of the tide mud below Gallows Stairs, with no prints going out. The Tidewife has struck.

**Tracks:** Doom 0/12 · Exposure 0/5 · Clues 0/9 · Noor H0 M5 · Rafi H0 M5 · Bea H0 M5 · Potions none (cap 3) · Call unused.

#### Scene 1

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Noor | Talking lead with Voice: mudlarkers on the steps | Heart 3 + Voice 2 = 5 vs 1 | Z047 | Success: 1 Clue |
| Rafi | Talking lead: Jonah's form tutor | Heart 2 + Life 1 = 3 vs 1 | Z048 | Success: 1 Clue |
| Bea | Brews at home | Craft 3 vs 1 | Z049 | Success: 2 potions (Healing, Blasting) |

Then Doom +1.

**After scene 1:** Doom 1 · Exposure 0 · Clues 2/9 · Noor H0 M5 · Rafi H0 M5 · Bea H0 M5 · Potions: Healing, Blasting.

#### Scene 2

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Noor | Book research | Wits 2 + Book 1 = 3 vs 1 | Z050 | Success: 1 Clue |
| Bea | Searching lead: the foreshore | Wits 2 vs 1 | Z051 | Success: 1 Clue |
| Rafi | Answers his Life (a school trip) | — | — | +1 Magic: **6** (ruling: Magic may go above 5, W9) |

Then Doom +1.

**After scene 2:** Doom 2 · Exposure 0 · Clues 4 · Noor H0 M5 · Rafi H0 M6 · Bea H0 M5 · Potions 2.

#### Scene 3

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Noor | Talking lead with Voice: the lock-up owner | 5 vs 1 | Z052 | Success: 1 Clue |
| Rafi | Book research | Wits 1 + Book 1 = 2 vs 1 | Z053 | Success: 1 Clue |
| Bea | Answers her Life (a Saturday shift) | — | — | +1 Magic: 6 |

Then Doom +1. Clues 6: **past half (5).** They know it's a mud creature that lairs under Gallows Stairs. They keep investigating for the Weakness.

**After scene 3:** Doom 3 · Exposure 0 · Clues 6 · Noor H0 M5 · Rafi H0 M6 · Bea H0 M6 · Potions 2.

#### Scene 4

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Noor | Talking lead with Voice: Jonah's gran | 5 vs 1 | Z054 | Success: 1 Clue |
| Rafi | Book research | 2 vs 1 | Z055 | Failure: at home, 1 Hurt |
| Bea | Brews at home | Craft 3 vs 1 | Z056 | Success: 2 potions. The coven would hold 4; cap 3, so one is lost. They keep a Binding |

Then Doom +1 → 4. Clues 7 of 9. They could go now (hidden, Defence 2, Unmaking 5). They stay for the Weakness, knowing the threat will come to them.

**After scene 4:** Doom 4 · Exposure 0 · Clues 7 · Noor H0 M5 · Rafi H1 M6 · Bea H0 M6 · Potions: Healing, Blasting, Binding.

#### Scene 5

The three rolls were declared together before any dice were rolled.

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Noor | Talking lead with Voice: the river police | 5 vs 1 | Z057 | Success: 1 Clue (8) |
| Rafi | Book research | 2 vs 1 | Z058 | Success: 1 Clue (9). **Weakness known** |
| Bea | Searching lead: the salt warehouse | Wits 2 vs 1 | Z059 | Success: Clue lost (past 9) |

Then Doom +1 → **5. The mark.** The Tidewife comes to them in public with Jonah in its grip.

**After scene 5:** Doom 5 · Exposure 0 · Clues 9/9 · Noor H0 M5 · Rafi H1 M6 · Bea H0 M6 · Potions 3 · Call unused.

#### Showdown (public: the riverside walk by Gallows Stairs, on a busy evening; Jonah in its grip)

**Start:** Noor never answered her Life: M4. Threat: Defence 1, Danger 1, Hit 2 (Mire 3), Toughness 0/12, 1 attack. Unmaking Difficulty 3.

##### Round 1

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Threat | Attack: d6 | — | Z060 = 5 | Most Hurt marked and standing: **Rafi** (1) |
| Rafi | Defends | Nerve 3 vs 1 | Z061 | Success: no Hurt |
| Rafi | **Frees Jonah** with Force | Nerve 3 + Force 2 = 5 vs 1 | Z062 | **Success: Jonah is free** |
| Noor | **Guards Jonah** (until the threat has next acted) | — | — | No roll |
| Bea | Blast with Flame + Flame Surge (1 + 2 Magic) + Blasting declared | Craft 3 + Flame 2 = 5 vs 1 | Z063 | Success: 2 + 1 (Blast) + 1 (Weakness) + 2 (Flame Surge) + 2 (Blasting) = **8** |

- **The innocent:** free at the end of round 1.
- **Exposure:** casting in public (Force, Blast, Flame, the potion): +1 → 1/5.
- Doom +1.

**After round 1:** Doom 6 · Exposure 1/5 · Toughness 8/12 · Noor H0 M4 (guarding) · Rafi H1 M6 · Bea H0 M3 · Potions: Healing, Binding.

##### Round 2

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Bea | Blast with Flame (1 Magic) | 5 vs 1 | Z064 | Success: 2 + 1 + 1 = 4 → **Broken** (12/12) |
| Rafi leads (1 Magic, + 2 of his own Magic); Noor joins as her action (1 Magic) | The Unmaking | Craft 2 + 2 + 2 = 6 vs 3 | Z065 | Success: **the Tidewife is destroyed** |

- New players went for it at once (65.6%). A miss would still have left round 3: Bea leading with both others joining and 2 dice of help, 9 dice against 3 (91%).
- **The episode ends at once** when the threat is destroyed, so the round's Exposure step never came (ruling, W6). Under the other reading Exposure would be 2/5; the result is the same.
- The threat made one attack in the whole fight. Noor's guard never mattered.

**End:** Doom 6/12 · Exposure 1/5 · Clues 9 · Noor H0 M3 · Rafi H1 M3 · Bea H0 M2 · Potions: Healing and Binding unused (they spoil) · Call unused.

#### Closing

- The tide goes out and finds nothing. Jonah tells the river police he got lost in the fog.
- **Result: Win** (destroyed, innocent safe, not Seen). Carry-over: the Tidewife gets a page in the Book.

### Summary

| | Episode 1 (Standard, 4 players) | Episode 2 (Easy, 3 players) |
|---|---|---|
| Result | **Win** | **Win** |
| Scenes / rounds | 5 / 3 | 5 / 2 |
| Why the fight was public | Waited one scene at 14/15 Clues for the Weakness | Stayed at 6/9 and 7/9 for the Weakness |
| The free | Fen, 4 dice vs 2 (68.8%): success | Rafi with Force, 5 dice vs 1 (96.9%): success |
| Threat attacks made | **2** (both in round 1, before anyone acted) | **1** (round 1) |
| Hurt from the threat | 4 (Fen 1, Dolly 3) | 0 |
| Characters Down | 0 | 0 |
| Doom at the end | 6/12 | 6/12 |
| Exposure at the end | 1/4 (Veil's Surge) | 1/5 |
| Clues | 15 found, 15 counted | 10 found, 9 counted |
| Magic | 17 (15 + 2 Lives): 16 spent, 1 lost to an unanswered Life, **0 left** | 17 (15 + 2 Lives): 8 spent, 1 lost to a Life, **8 left** |
| Ward | 5/5 (4 Sense, 1 help) | — |
| Potions | 2 brewed, 2 used | 4 brewed (1 lost to the cap), 1 used, 2 spoiled |
| Rolls with a result | 25: 2 Critical (8%), 13 Success, 6 Partial, 4 Failure (16%) | 18: 0 Critical, 17 Success, 1 Failure (6%) |
| Play time (estimate) | about 65 minutes | about 45 minutes |

### Drills (what the episodes didn't force)

Each drill uses fresh dice and the characters above, from a stated setup. Some setups are "what if" states (for example Exposure 4/5), not results of rolls.

#### DA. A round-1 guard and a round-1 Shelter across the threat's round-2 attacks

- **Setup:** Episode 1 round 1, from just after Fen freed Sol (Z035). Instead of attacking, Ines guards Sol, and Mira casts Shelter on Ines (Z066): Success.
- **Round 2:** Ines attacks, last on purpose (her guard stays up: it lasts until the threat has next acted). Dolly (Z067) Failure, 1 Hurt. Mira (Z068) Partial, 2 damage, 1 Hurt. Ines (Z069) Partial, 2 damage, 1 Hurt (Shelter only stops the threat's attacks).
- **Threat:** attack 1 (Z070 = 2): whoever hurt it last, Ines. She is Sheltered: no Hurt, no roll (W10). Attack 2 (Z071 = 5): most Hurt marked, Dolly (H2). Dolly defends (Z072): Partial, 1 Hurt.
- The threat has now acted: the guard and the Shelter both end. Sol needs a new guard or a Carry in round 3.
- **Finding:** V2 is fixed. Both protections made in round 1 covered round 2. Under v0.7 both would have ended at Ines's round-2 action.

#### DB. A guard when the threat's only attack is lost

- **Setup:** Episode 2 after round 1 (Jonah free, Noor guarding since round 1, threat 8/12).
- **Round 2:** Rafi attacks with Force and a Binding declared (Z073): Success, 3 damage (11/12), and the threat loses its next attack, its only one this round. Bea and Noor do nothing. The threat's step comes with no attack.
- **Round 3, before anyone acts:** is Noor still guarding? "Until the threat has next acted": did it act? The page doesn't say. If not, the guard stands. If so, Noor must spend her action guarding again. The round-3 target die (Z074 = 2, Rafi) didn't show a 6, so it didn't bite here. On a 6, one reading loses Jonah and the other doesn't.
- **Finding:** a new gap on core flow (W2).

#### DC. Exposure one short of full in public, then Seen

- **Setup:** Episode 2's coven at its public start, but at Exposure 4/5 (as if earlier casting rolls had gone wrong). Doom 5. Weakness known. Threat 0/12.
- **Round 1:** threat first (Z075 = 4): most Hurt, Rafi. Rafi defends (Z076): Success. Rafi frees Jonah **without Force**, so the roll isn't casting (ruling, W3) (Z077): Critical, Jonah free, and +1 die on Rafi's next roll. Noor guards. Bea attacks **without Flame** (Z078): Success, 3 (3/12). No casting this round: Exposure stays 4/5. Doom 6.
- **Round 2:** Rafi with Force and his Critical die (Z079): Critical, 4 (7/12). Noor, no Power (Z080): Failure, 1 Hurt. Bea, Blast with Flame (Z081): Success, 4 (11/12). Threat (Z082 = 5): most Hurt, Rafi and Noor tie at 1; the Storyteller's die (Z083 = 5) picks Noor. Noor defends (Z084): Success. Casting this round: Exposure 5/5, **Seen**. Doom 7.
- **Round 3:** Rafi with Force (Z085): Critical, **Broken**. Bea leads the Unmaking, Noor joins, Rafi helps, Bea adds 1 Magic (Z086): 7 dice, **Failure**. Not destroyed; nobody takes Hurt. Casting while Seen should become Doom +1, but "Doom doesn't rise once the threat is Broken" (ruling: no Doom, W8).
- **Round 4:** the retry, with Rafi joining too (Z087): 9 dice, Success. **Destroyed.**
- **Result:** Partial (a Win dropped one step for Seen).
- **Finding:** the public Exposure step and Seen ran from the text. Holding back Powers at 4/5 was a real choice, but the page doesn't say a Power can be left off (W3).

#### DD. Seen when the threat breaks the same round

- **Setup:** Episode 1's coven, public round 2, Seen (4/4) after round 1, no Veil Surge. Doom 6. Threat 4/9. Fen Carried Sol away (1 Ward, no roll).
- Dolly's Blast (Z088): Success, 4 (8/9). Mira (Z089): Partial, 2, **Broken**; 1 Hurt. Ines's attack (Z090) was declared with the others before rolling; its damage is lost past the total.
- Casting this round (Carry, Blast) while Seen, but the threat is Broken: no Doom (W8).
- **Finding:** Seen's Doom rise never bit in a public fight where the threat broke first. The fights were too short for it.

#### DE. Seen feeding Doom while the threat stands, and Shelter on the last hitter

- **Setup:** as DD, but the threat is fresh (0/9). Fen Carried Sol away (1 Ward).
- Mira casts Shelter on Dolly (Z091): Partial, it works, 1 Hurt. Dolly attacks (Z092): Critical, 3 + 1 = 4 (4/9). Ines attacks (Z093): Failure, 1 Hurt.
- **Threat:** attack 1 (Z094 = 1) and attack 2 (Z095 = 1): both go to whoever hurt it last, Dolly. She is Sheltered: neither does anything. Then the threat has acted, and the Shelter ends.
- **Exposure step:** casting (Carry, Shelter) while Seen → **Doom +1** (once per round) → 7. Then **Doom +1** → 8.
- **Finding:** "any further rise becomes Doom +1 instead (once per round or scene)" ran clean: Seen costs 2 Doom a round, so from Doom 8 the plan completes at the end of round 4. Separately, one Shelter on the witch who had both hit last and had the most Hurt soaked a whole round (W4).

---

## 4. New issues

| # | Severity | Quote (v0.8) | What happened | Suggested fix | Ruling to use tonight |
|---|---|---|---|---|---|
| W1 | confusing (balance; carried from playtest B #18, never fixed) | Veil: "no Exposure from casting for the rest of the scene (a casting roll's cost becomes 1 Hurt)"; Powers: "the whole showdown counts as one scene"; Showdown: "In a public place, every round in which anyone was casting raises Exposure by 1" | Episode 1 round 1: Dolly cast Hide with a Veil Surge (Z036). It works on any single success from 5 dice (96.9%). For 3 Magic, the public fight raised no Exposure at all. A second question: Dolly had already cast that round before the Surge (her Veil defence, Z034, and her Healing). The text doesn't say whether the Surge covers the round it was cast in. | "(in a showdown: until the end of the next round)", or "it doesn't stop a public round's Exposure". Say whether casting earlier in the same round counts. Simulate it. | As written. The Exposure step comes after the Surge, so it covers the round it was cast in. |
| W2 | confusing | Guard and Shelter: "until the threat has next acted"; "It loses at most one attack a round, whatever the cause"; Broken: "it makes no more rolls or moves" | Drill B: a Binding attack (Z073) took the threat's only round-2 attack. At the start of round 3 the table had to decide whether Noor's round-1 guard still stood. If a step with no attack counts as acting, the guard is over and Noor must guard again. If not, it stands. On a round-3 six, one reading loses Jonah (Win → Partial) and the other doesn't. | "…until the end of the threat's next turn, even if it makes no attack." | The threat's step counts as acting even if all its attacks are lost. Guard again. |
| W3 | confusing | "your Power adds 2 dice when it fits"; "The target rolls Nerve (plus a Power that fits)"; "Casting means using a Power, a spell, a potion or a guardian gift" | Whether a roll is casting decides its cost in the city (Exposure, not Hurt) and whether a public round raises Exposure. Episode 1 round 1: Dolly's Veil defence (Z034) made round 1 a casting round before any witch acted. Drill C: at Exposure 4/5, Rafi freed (Z077) and Bea attacked (Z078) without their Powers, so the round had no casting. The page doesn't say a Power can be left off. (The simulator's "careful" public policy assumes it can.) | "You may leave your Power off a roll. If you add its dice, the roll is casting." | You may leave it off. |
| W4 | confusing (balance) | Shelter: "until the threat has next acted, one person can't be hurt by its attacks"; targets: "1–3 it attacks whoever hurt it last … 4–5 whoever has the most Hurt marked" | The threat's d6 is easy to steer: the coven picks who hits last, and Hurt is open. Drill E: one Partial Shelter (Z091; 1 Magic and 1 Hurt) on Dolly, who hit last and had the most Hurt. Both attacks (Z094, Z095) went to her and did nothing. Drill A: Shelter on Ines, who hit last, took attack 1 (Z070). In all, 3 of 4 attacks went into a Shelter. Against 2 attacks a round, one Shelter on the right witch cancels most of a round. | Simulate a "Shelter whoever will hit last" policy. Options: Shelter stops one attack; or a 1–3 or 4–5 that lands on a Sheltered person passes to the next target. | As written. |
| W5 | confusing (balance) | Investigation: "if Doom has reached the Showdown mark (5), it's too late: the threat comes to them, and the showdown starts in a public place with the innocent in its grip" | Both covens let Doom reach 5 on purpose to get the Weakness, and both won easily. The public costs were small. Episode 1 freed Sol at 68.8% (the guardian's Nerve 3 and a helper), and Veil's Surge ended Exposure (W1). Episode 2 freed Jonah at 96.9% (Force, 5 dice against Defence 1), and Exposure ended at 1/5. The threats made 2 and 1 attacks. Going at Doom 4 without the Weakness looked far worse: in Episode 1, Defence 3 means a 2-dice attack can never fully work, and the Unmaking falls from 85% to 36%. The simulator agrees: "waitForWeakness" plays as well as the default (74% / 7% at Standard), and the old rule with no innocent in its grip is only 1 point easier (`sim/REPORT.md` §10). So "too late" is little penalty (A22), and going early without the Weakness is close to a dead option (A6). | Simulate and pick one: freeing in public is against Defence +1; or a public showdown starts at Exposure +1; or fix W1 so Veil can't switch public Exposure off. Report "threat attacks per fight" by label and group size. | As written. |
| W6 | minor (A12) | "The episode ends when the threat is destroyed"; Showdown: "every round in which anyone was casting raises Exposure by 1" | Episode 2 round 2: the Unmaking (Z065) destroyed the Tidewife mid-round, after casting that round. Read literally, the episode ends at once, so the Exposure step never comes (1/5, not 2/5). At Exposure one short of full, this decides whether the coven is Seen (a result step). It also means a winning Unmaking never costs Exposure. | Say it: "The episode ends at once; the round's Exposure step doesn't happen." (or the reverse) | It ends at once. No Exposure step. |
| W7 | minor | Gifts: "The guardian can't cast spells, use potions, join the Unmaking or damage a threat" | Freeing isn't on that list, so Fen freed Sol (Z035) with Nerve 3, the coven's best freer. Guarding and studying aren't on it either. A table may ask. | "It can free, guard and study." (or forbid freeing) | Yes, it can. |
| W8 | minor (A15, A5) | Tracks: "any further rise becomes Doom +1 instead" and "Doom doesn't rise once the threat is Broken" | Drill C round 3 and Drill D: a Seen coven cast after the threat was Broken. The rise had to become Doom +1, but Doom can't rise. So casting is free once Seen and Broken. Small, since Seen has already cost the result step. | Say which wins: "Once the threat is Broken, Seen adds no Doom." | Broken wins: no Doom. |
| W9 | minor (A1; carried since v0.4) | "5 Magic each episode"; Life: "gain 1 Magic" | Episode 2: Rafi and Bea answered their Lives at 5 Magic and went to 6. No cap is stated. | "Magic can go above 5." (or "at most 5") | It can. |
| W10 | minor | Shelter: "can't be hurt by its attacks"; "The target rolls Nerve (plus a Power that fits) against Danger" | Drills A and E: does a Sheltered target still roll? It only matters for a defence Critical's extra die. | "A Sheltered target doesn't roll." | No roll. |

---

## 5. Part A checks that failed

- **A1 (every state of every track):**
  - Magic above 5 (W9, carried).
  - The second attack in a round when nobody is standing (N16, carried from v0.7).
- **A5 (no free spend):**
  - Veil's Surge makes a whole public fight's casting cost no Exposure, for 3 Magic (W1).
  - Once Seen and Broken, casting costs nothing (W8).
  - A winning Unmaking never raises Exposure if the episode ends at once (W6).
  - Once Seen, only the first casting cost in a scene counts (N9, carried; not hit in play).
- **A6 (no dominated option):**
  - Going to the threat at half the Clues without the Weakness looked dominated by waiting and fighting in public, at both tables (W5). The simulator's "asap" policy (16% / 59% at Standard) agrees that going at half is nearly always wrong.
- **A8 (nothing skips a roll for free):** a Shelter on the witch the d6 will pick cancels most of a round (W4). It costs a roll and 1 Magic, so it isn't free, but it is strong.
- **A10 (limits stated outright):**
  - How long a guard or Shelter lasts when the threat's attack is lost (W2).
  - Whether a Power can be left off a roll (W3).
  - Potions in the investigation: still no limit (V8).
  - Sense: no limit per scene or per lead (N12, carried).
- **A11 (each rule in one place):** the glossary's Seen entry drops "(once per round or scene)" (V7).
- **A12 (read every rule literally at the start and end):** the round in which the threat is destroyed (W6).
- **A13 ("there is none"):** two guards (N3, carried); nobody standing (N16, carried).
- **A15 (order of resolution):**
  - Veil's Surge against casting earlier in the same round (W1).
  - Seen against "Doom doesn't rise once Broken" (W8).
  - A Held attack whose d6 shows 6 (N13, carried; not hit).
- **A19 (balance):** the threat made 2 attacks at Standard and 1 at Easy. Episode 2 had no Criticals in 18 rolls. Over all 65 rolls with a result: Criticals 9%, Failures 14%. That is a small sample, but it's worth a simulator check on attacks per fight (W5).

**Passes worth noting:**
- **A2:** in a public round, Exposure (or Seen's Doom) rose once and Doom once (Drill E: +2 Doom, no more).
- **A4:** losing still costs. Seen dropped Drill C's Win to a Partial; a missed round-1 free would have capped Episode 1 at Partial.
- **A7:** Episode 1 spent every point of Magic and Ward and both potions. Episode 2 left 8 of 17 Magic (47%), just under the "more than half" line; Easy fights end fast.
- **A12:** round 1 now reads right at the start of a public showdown (V1 fixed).
- **A16:** casting, in its grip, Broken, Danger and the Unmaking caused no confusion.
- **A22:** the mark bound both tables: each decided, with the mark in mind, to take the public fight.
- **A24:** fights lasted 2–4 rounds.

---

## 6. Clean or not

- **Episode 1: clean.** No blocker came up, and the table never had to invent a ruling on core flow. Round 1's order, the end-of-round-1 check on the innocent, the mark, the Weakness and the Unmaking all ran from the text. Two small rulings were used:
  - Veil's Surge covers the round it was cast in (W1). This is the literal reading, and it is about one Power's reach.
  - The guardian may free the innocent (W7). Nothing forbids it.
- **Episode 2: clean.** No blocker. Two small rulings:
  - Magic may go above 5 (W9, carried since v0.4).
  - The episode ends at once when the threat is destroyed, so the last round's Exposure step doesn't happen (W6). It changed nothing.
- **But clean partly by route.** Both fights were short (2 and 3 rounds; 2 and 1 threat attacks), so much of the showdown text never came up in the episodes: Seen feeding Doom, Shelter, a guard across a lost attack. The drills found W2, a real gap on core flow. A table that guards the innocent and also Binds the threat (or uses a Binding or Force's Surge) in the same fight will have to invent a ruling.

---

## 7. What worked

- **The round-1 order line.** "Round 1: the threat's attacks, the characters' actions, the innocent, Exposure, Doom" ran both public fights with no question. Both innocents were freed after the threat's first strike. V1 is truly fixed.
- **"Until the threat has next acted."** Drill A showed a round-1 guard and a round-1 Shelter covering round 2. Drill E showed a round-2 Shelter covering both of the threat's attacks and then ending.
- **The Weakness against the mark.** Episode 1's choice at 14 of 15 Clues and Doom 4 was the best moment of either session. The table weighed Defence 3 and a 36% Unmaking against a public fight, with Sol in its grip, at Exposure 3/4. The page gave them everything they needed to choose.
- **Exposure as a planning track.** In Episode 1, Exposure 3/4 at Doom 4 made Dolly spend scene 5 on a Hide. In Drill C, Exposure 4/5 made the coven fight without Powers for a round. Seen cost a result step. Seen feeding Doom (+2 a round) ran clean in Drill E.
- **Potions with attacks.** Blasting on a Partial Blast (5 damage) and on a Success (8 damage); Binding on a working attack in Drill B. "Works" includes a Partial; the potion is named before the roll. No questions.
- **The threat striking first.** Episode 1's first strike put Dolly, the Unmaking leader, at 3 of 4 Hurt before she acted. That drove her Healing, her Hide, and the whole plan.
- **The Unmaking rules.** A standing leader as their action; joiners outside the +2 limit; helpers and the guardian's Ward inside it. A failed attempt followed by a retry before it fled (Drill C) ran clean. Waiting a round after the Break, so that everyone could join, was a real and readable choice.
- **Small rules that just worked:** the potion cap with and without a guardian player; lost Clues past the total; Lives skipped and paid for (two witches); "or does nothing"; Hide never raising Exposure; Sense outside the limit; target ties by the Storyteller's die.
- **The guardian.** Fen gave four Senses, took the first strike, freed Sol and helped the Unmaking. It felt worth a seat.

---

## 8. How it felt

- **Was losing a real risk?**
  - **Episode 1:** a Partial was a real risk; a Loss never was. The free was 68.8%, and a miss would have lost Sol. Dolly was one hit from Down before she acted; Down, she couldn't have led the Unmaking, and Mira leading (Craft 2) would have had about 77% instead of 86%.
  - **Episode 2:** no. The free was 96.9%, the threat made one attack (defended at 87.5%), and the Unmaking had a retry in hand. That suits Easy (target about 90% wins).
- **Did secrecy matter?**
  - In the investigation, yes at Standard: three Exposure from city casting, and a Hide action to undo one. At Easy, no casting roll failed (Difficulty 1 with 5 dice), so Exposure never moved before the fight.
  - In public, it mattered only where nothing switched it off. Veil's Surge erased it in Episode 1 (W1). In Drill C it shaped every choice.
- **Did the innocent matter?** In Episode 1 the free was the tensest roll of the night. In Episode 2 it was a formality with Force. With no guardian player, the call's Carry could also lift a freed innocent out of the fight with no action and no roll, so a guard isn't needed once per episode.
- **Were resources spent?**
  - Episode 1: all 17 Magic (one lost to a Life), all 5 Ward, both potions.
  - Episode 2: 8 of 17 Magic left, 1 of 3 potions used, the call unused. The fight ended too fast to need them.
- **Dominant tactics seen:**
  1. Veil's Surge on Hide in round 1 of a public fight (W1).
  2. Wait for the Weakness, even past the mark (W5). Both tables did it, and it was right both times.
  3. Big single hits: Blast + Blasting (+ Flame's Surge) did 5 of 9 and 8 of 12 in one roll.
  4. Shelter on the witch who will hit last and has the most Hurt (W4).
  5. Book research with Sense every scene: Ines found 7 of Episode 1's 15 Clues.
  6. After the Break, hold actions for a round so that everyone can join the Unmaking.
- **The guardian against a fourth witch.** With Fen played, Toughness was 9 and the Unmaking Difficulty 3. A fourth witch would make them 12 and 4, and add a damage dealer. Fen's Senses and the free were worth it.
- **How long it took (estimate):** Episode 1 about 65 minutes (setup 12, scenes 35, fight 15, closing 3). Episode 2 about 45 minutes (setup 8, scenes 25, fight 8, closing 4).
- **Simulator notes:** it already has a "waitForWeakness" policy and a "careful" public policy that leaves magic off (which assumes W3's ruling). Worth adding: threat attacks per fight by label and group size; a "Shelter the last hitter" policy (W4); and a run with Veil's showdown Surge limited (W1).

---

## 9. Dice appendix

All 95 rolls, in the order they were made. Format: ID | label | dice | faces | successes vs Difficulty | result. The script counts 4–6 as successes. A Success needs successes ≥ Difficulty; a Critical is a Success with two or more 6s; a Partial needs at least half the Difficulty, rounded up (none at Difficulty 1). Labels give each roll's dice pool as built at the table.

**Notes on the log:**
- Episode 1 is Z001–Z040 (setup Z001–Z011). Episode 2 is Z041–Z065 (setup Z041–Z046). Drills are Z066–Z095 (DA Z066–Z072, DB Z073–Z074, DC Z075–Z087, DD Z088–Z090, DE Z091–Z095).
- **Z002–Z005:** witch 3 rolled (Z003) before witch 2's reroll; both rerolled, in order.
- **Z030, Z033, Z083:** Storyteller tie picks, made with a die to stay neutral.
- **Z057–Z059** (Episode 2 scene 5) and **Z088–Z090** (Drill D) were declared together before rolling. Bea's Clue (Z059) and Ines's damage (Z090) were lost past the total.
- **Z074** is the target die the round-3 attack would use; the drill stops there.

```
Z001 | E1 setup: Witch 1 Power (1 Force 2 Flame 3 Sight 4 Voice 5 Veil 6 Wild) | 1d6 | faces: 4
Z002 | E1 setup: Witch 2 Power (1 Force 2 Flame 3 Sight 4 Voice 5 Veil 6 Wild) | 1d6 | faces: 4
Z003 | E1 setup: Witch 3 Power (1 Force 2 Flame 3 Sight 4 Voice 5 Veil 6 Wild) | 1d6 | faces: 4
Z004 | E1 setup: Witch 2 Power reroll (4 Voice taken) | 1d6 | faces: 5
Z005 | E1 setup: Witch 3 Power reroll (4 Voice taken) | 1d6 | faces: 3
Z006 | E1 setup: Witch 1 Life (1 student 2 nurse 3 shop worker 4 teacher 5 mechanic 6 bus driver) | 1d6 | faces: 3
Z007 | E1 setup: Witch 2 Life (1 student 2 nurse 3 shop worker 4 teacher 5 mechanic 6 bus driver) | 1d6 | faces: 3
Z008 | E1 setup: Witch 3 Life (1 student 2 nurse 3 shop worker 4 teacher 5 mechanic 6 bus driver) | 1d6 | faces: 4
Z009 | E1 setup: Witch 2 Life reroll (3 shop worker taken) | 1d6 | faces: 3
Z010 | E1 setup: Witch 2 Life reroll again (3 shop worker taken) | 1d6 | faces: 4
Z011 | E1 setup: Witch 2 Life reroll a third time (4 teacher taken by Witch 3) | 1d6 | faces: 6
Z012 | E1 S1 Ines Book research (home): Wits 3 + Sight 2 + Book 1 + Sense 1 (Fen, 1 Ward, outside limit) | 7d6 | faces: 1 3 6 1 3 3 5 | 2 succ, 1 six vs Diff 2 | SUCCESS
Z013 | E1 S1 Mira talking lead with Voice (customers at her corner shop; city, casting): Heart 3 + Voice 2 + Life shop worker 1 | 6d6 | faces: 3 4 3 2 3 5 | 2 succ, 0 six vs Diff 2 | SUCCESS
Z014 | E1 S1 Dolly brews at home: Craft 3 | 3d6 | faces: 5 3 6 | 2 succ, 1 six vs Diff 2 | SUCCESS
Z015 | E1 S1 Fen searching lead (the towpath where the drowned man was found; city, no gift): Wits 2 | 2d6 | faces: 1 2 | 0 succ, 0 six vs Diff 2 | FAILURE
Z016 | E1 S2 Ines Book research (home): Wits 3 + Sight 2 + Book 1 + Sense 1 (Fen, 1 Ward) | 7d6 | faces: 2 5 2 4 2 4 1 | 3 succ, 0 six vs Diff 2 | SUCCESS
Z017 | E1 S2 Mira talking lead with Voice (regulars at the lock pub; city, casting): Heart 3 + Voice 2 | 5d6 | faces: 5 5 2 1 2 | 2 succ, 0 six vs Diff 2 | SUCCESS
Z018 | E1 S2 Dolly Reveal at Five Locks (city, 1 Magic): Craft 3 | 3d6 | faces: 3 6 2 | 1 succ, 1 six vs Diff 2 | PARTIAL
Z019 | E1 S2 Fen talking lead (boat people moored by the lock; city, no gift): Heart 2 | 2d6 | faces: 3 1 | 0 succ, 0 six vs Diff 2 | FAILURE
Z020 | E1 S3 Ines Book research (home): Wits 3 + Sight 2 + Book 1 + Sense 1 (Fen, 1 Ward) | 7d6 | faces: 3 6 6 5 1 3 6 | 4 succ, 3 six vs Diff 2 | CRITICAL
Z021 | E1 S3 Mira talking lead with Voice + Voice Surge (2 Magic; the drowned man's widow; city, casting): Heart 3 + Voice 2 | 5d6 | faces: 1 5 6 1 2 | 2 succ, 1 six vs Diff 2 | SUCCESS
Z022 | E1 S3 Dolly searching lead with Veil (the lock-keeper's hut; city, casting): Wits 2 + Veil 2 | 4d6 | faces: 3 2 3 3 | 0 succ, 0 six vs Diff 2 | FAILURE
Z023 | E1 S3 Fen searching lead (old canal-company maps at the museum; city, no gift): Wits 2 | 2d6 | faces: 4 6 | 2 succ, 1 six vs Diff 2 | SUCCESS
Z024 | E1 S4 Ines Book research + Sight Surge (2 Magic): Wits 3 + Sight 2 + Book 1 + Sense 1 (Fen, 1 Ward) | 7d6 | faces: 4 3 6 5 4 5 2 | 5 succ, 1 six vs Diff 2 | SUCCESS
Z025 | E1 S4 Mira talking lead with Voice (the night-bus driver who saw the lantern; city, casting): Heart 3 + Voice 2 | 5d6 | faces: 2 3 1 3 5 | 1 succ, 0 six vs Diff 2 | PARTIAL
Z026 | E1 S4 Fen talking lead (the pumping-house caretaker; city, no gift): Heart 2 | 2d6 | faces: 6 2 | 1 succ, 1 six vs Diff 2 | PARTIAL
Z027 | E1 S5 Ines Book research (home, no Sense): Wits 3 + Sight 2 + Book 1 | 6d6 | faces: 2 2 4 5 6 4 | 4 succ, 1 six vs Diff 2 | SUCCESS
Z028 | E1 S5 Dolly Hide with Veil (city, 1 Magic): Craft 3 + Veil 2 | 5d6 | faces: 6 4 3 1 4 | 3 succ, 1 six vs Diff 2 | SUCCESS
Z029 | E1 R1 (public, threat first) attack 1 target d6 (1-3 last hurt it, none so 4-5; 4-5 most Hurt marked; 6 Lure, innocent in grip not free) | 1d6 | faces: 3
Z030 | E1 R1 Storyteller tie pick for attack 1, all Hurt 0 (1 Mira 2 Dolly 3 Ines 4 Fen 5-6 reroll) | 1d6 | faces: 4
Z031 | E1 R1 Fen (H0/5, W1 kept for Carry) defends attack 1: Nerve 3 vs Danger 3 | 3d6 | faces: 1 4 5 | 2 succ, 0 six vs Diff 3 | PARTIAL
Z032 | E1 R1 (threat first) attack 2 target d6 (1-3 nobody hurt it so 4-5; 4-5 most Hurt marked = Fen H1; 6 Lure on least Hurt) | 1d6 | faces: 6
Z033 | E1 R1 Storyteller tie pick for Lure (least Hurt, witches at 0: 1-2 Mira 3-4 Dolly 5-6 Ines) | 1d6 | faces: 4
Z034 | E1 R1 Dolly (H0, M4) defends Lure (Hit 3): Nerve 2 + Veil 2 (defending) vs Danger 3 | 4d6 | faces: 1 1 1 4 | 1 succ, 0 six vs Diff 3 | FAILURE
Z035 | E1 R1 Fen (H1/5) frees Sol: Nerve 3 + Mira helps 1 (1 Magic) vs Defence 2 (Weakness) | 4d6 | faces: 4 1 4 6 | 3 succ, 1 six vs Diff 2 | SUCCESS
Z036 | E1 R1 Dolly (H1 after Healing) Hide + Veil Surge (1 + 2 Magic): Craft 3 + Veil 2 vs 2 | 5d6 | faces: 6 5 1 1 2 | 2 succ, 1 six vs Diff 2 | SUCCESS
Z037 | E1 R1 Mira (H0) Blast (1 Magic) + Blasting potion declared + own Magic 1: Craft 2 + 1 vs Defence 2 | 3d6 | faces: 6 3 1 | 1 succ, 1 six vs Diff 2 | PARTIAL
Z038 | E1 R1 Ines (H0, M2) attack: Nerve 2 + own Magic 1 vs Defence 2 | 3d6 | faces: 4 2 3 | 1 succ, 0 six vs Diff 2 | PARTIAL
Z039 | E1 R2 Mira (H1, M1 kept for the Unmaking) attack: Nerve 2 vs Defence 2 (needs 2 damage to Break) | 2d6 | faces: 4 6 | 2 succ, 1 six vs Diff 2 | SUCCESS
Z040 | E1 R3 Unmaking: Dolly leads Craft 3 (1 Magic) + Mira joins 2 + Ines joins 2 (1 Magic each, their actions) + Fen helps 1 (1 Ward) vs Diff 3 (3 witches, Weakness known) | 8d6 | faces: 4 6 6 1 1 4 3 2 | 4 succ, 2 six vs Diff 3 | CRITICAL
Z041 | E2 setup: Witch 1 Power (1 Force 2 Flame 3 Sight 4 Voice 5 Veil 6 Wild) | 1d6 | faces: 4
Z042 | E2 setup: Witch 2 Power (1 Force 2 Flame 3 Sight 4 Voice 5 Veil 6 Wild) | 1d6 | faces: 1
Z043 | E2 setup: Witch 3 Power (1 Force 2 Flame 3 Sight 4 Voice 5 Veil 6 Wild) | 1d6 | faces: 2
Z044 | E2 setup: Witch 1 Life (1 student 2 nurse 3 shop worker 4 teacher 5 mechanic 6 bus driver) | 1d6 | faces: 1
Z045 | E2 setup: Witch 2 Life (1 student 2 nurse 3 shop worker 4 teacher 5 mechanic 6 bus driver) | 1d6 | faces: 4
Z046 | E2 setup: Witch 3 Life (1 student 2 nurse 3 shop worker 4 teacher 5 mechanic 6 bus driver) | 1d6 | faces: 3
Z047 | E2 S1 Noor talking lead with Voice (mudlarkers on the foreshore steps; city, casting): Heart 3 + Voice 2 | 5d6 | faces: 6 1 2 1 5 | 2 succ, 1 six vs Diff 1 | SUCCESS
Z048 | E2 S1 Rafi talking lead (Jonah's form tutor; city, not casting): Heart 2 + Life teacher 1 | 3d6 | faces: 4 2 4 | 2 succ, 0 six vs Diff 1 | SUCCESS
Z049 | E2 S1 Bea brews at home: Craft 3 vs Lead Difficulty 1 | 3d6 | faces: 4 4 6 | 3 succ, 1 six vs Diff 1 | SUCCESS
Z050 | E2 S2 Noor Book research (home): Wits 2 + Book 1 | 3d6 | faces: 5 1 2 | 1 succ, 0 six vs Diff 1 | SUCCESS
Z051 | E2 S2 Bea searching lead (the foreshore where Jonah lost his friend; city, not casting): Wits 2 | 2d6 | faces: 4 2 | 1 succ, 0 six vs Diff 1 | SUCCESS
Z052 | E2 S3 Noor talking lead with Voice (the lock-up owner under the bridge; city, casting): Heart 3 + Voice 2 | 5d6 | faces: 5 2 5 6 3 | 3 succ, 1 six vs Diff 1 | SUCCESS
Z053 | E2 S3 Rafi Book research (home): Wits 1 + Book 1 | 2d6 | faces: 5 5 | 2 succ, 0 six vs Diff 1 | SUCCESS
Z054 | E2 S4 Noor talking lead with Voice (Jonah's gran at the flats; city, casting): Heart 3 + Voice 2 | 5d6 | faces: 1 4 3 1 4 | 2 succ, 0 six vs Diff 1 | SUCCESS
Z055 | E2 S4 Rafi Book research (home): Wits 1 + Book 1 | 2d6 | faces: 3 1 | 0 succ, 0 six vs Diff 1 | FAILURE
Z056 | E2 S4 Bea brews at home: Craft 3 vs 1 | 3d6 | faces: 2 5 6 | 2 succ, 1 six vs Diff 1 | SUCCESS
Z057 | E2 S5 Noor talking lead with Voice (the tide-warden at the river police; city, casting): Heart 3 + Voice 2 | 5d6 | faces: 1 4 5 1 6 | 3 succ, 1 six vs Diff 1 | SUCCESS
Z058 | E2 S5 Rafi Book research (home): Wits 1 + Book 1 | 2d6 | faces: 2 4 | 1 succ, 0 six vs Diff 1 | SUCCESS
Z059 | E2 S5 Bea searching lead (the old salt warehouse; city, not casting): Wits 2 | 2d6 | faces: 5 3 | 1 succ, 0 six vs Diff 1 | SUCCESS
Z060 | E2 R1 (public, threat first) attack target d6 (1-3 nobody hurt it so 4-5; 4-5 most Hurt marked = Rafi H1; 6 Mire on most Magic, Jonah in grip so not free) | 1d6 | faces: 5
Z061 | E2 R1 Rafi (H1) defends: Nerve 3 vs Danger 1 | 3d6 | faces: 2 6 3 | 1 succ, 1 six vs Diff 1 | SUCCESS
Z062 | E2 R1 Rafi (H1) frees Jonah: Nerve 3 + Force 2 (freeing) vs Defence 1 (Weakness) | 5d6 | faces: 3 6 2 3 5 | 2 succ, 1 six vs Diff 1 | SUCCESS
Z063 | E2 R1 Bea (H0, M6) Blast with Flame + Flame Surge (1 + 2 Magic) + Blasting potion declared: Craft 3 + Flame 2 vs Defence 1 | 5d6 | faces: 2 5 1 6 1 | 2 succ, 1 six vs Diff 1 | SUCCESS
Z064 | E2 R2 Bea (H0, M3) Blast with Flame (1 Magic): Craft 3 + Flame 2 vs Defence 1 (needs 4 damage to Break) | 5d6 | faces: 1 5 5 1 3 | 2 succ, 0 six vs Diff 1 | SUCCESS
Z065 | E2 R2 Unmaking: Rafi leads Craft 2 (1 Magic) + own Magic 2 + Noor joins 2 (1 Magic, her action) vs Diff 3 (3 witches, Weakness known) | 6d6 | faces: 1 5 6 4 3 3 | 3 succ, 1 six vs Diff 3 | SUCCESS
Z066 | DA R1 (E1 public line after Fen frees Sol, Z035) Mira (H0, M3) Shelter on Ines (1 Magic): Craft 2 vs 2 | 2d6 | faces: 6 4 | 2 succ, 1 six vs Diff 2 | SUCCESS
Z067 | DA R2 Dolly (H1, M1) attack: Nerve 2 vs Defence 2 | 2d6 | faces: 3 3 | 0 succ, 0 six vs Diff 2 | FAILURE
Z068 | DA R2 Mira (H0, M2) attack: Nerve 2 vs Defence 2 | 2d6 | faces: 3 6 | 1 succ, 1 six vs Diff 2 | PARTIAL
Z069 | DA R2 Ines (H0, guarding Sol, Sheltered) attack, last on purpose: Nerve 2 vs Defence 2 | 2d6 | faces: 1 5 | 1 succ, 0 six vs Diff 2 | PARTIAL
Z070 | DA R2 threat attack 1 target d6 (1-3 Ines hurt it last; 4-5 most Hurt marked = Dolly H2; 6 Sol free and guarded: attacks guard Ines) | 1d6 | faces: 2
Z071 | DA R2 threat attack 2 target d6 (same table) | 1d6 | faces: 5
Z072 | DA R2 Dolly (H2/4) defends attack 2: Nerve 2 + Veil 2 vs Danger 3 | 4d6 | faces: 1 1 5 4 | 2 succ, 0 six vs Diff 3 | PARTIAL
Z073 | DB R2 (E2 line after round 1: Jonah free, Noor guarding since R1, threat 8/12) Rafi (H1) attack with Force + Binding potion declared: Nerve 3 + Force 2 vs Defence 1 | 5d6 | faces: 2 2 5 4 4 | 3 succ, 0 six vs Diff 1 | SUCCESS
Z074 | DB R3 threat attack target d6, if no witch Breaks it first (1-3 Rafi hurt it last; 4-5 most Hurt = Rafi H1; 6 goes for Jonah: guard question) | 1d6 | faces: 2
Z075 | DC R1 (E2 coven, public, Exposure 4/5, Doom 5, Weakness known, threat 0/12) threat first: target d6 (nobody hurt it so 4-5; 4-5 most Hurt = Rafi H1; 6 Mire on most Magic) | 1d6 | faces: 4
Z076 | DC R1 Rafi (H1) defends: Nerve 3 vs Danger 1 | 3d6 | faces: 5 5 6 | 3 succ, 1 six vs Diff 1 | SUCCESS
Z077 | DC R1 Rafi frees Jonah WITHOUT Force (to avoid casting at Exposure 4/5): Nerve 3 vs Defence 1 | 3d6 | faces: 4 6 6 | 3 succ, 2 six vs Diff 1 | CRITICAL
Z078 | DC R1 Bea (H0) attack WITHOUT Flame (no casting): Nerve 2 vs Defence 1 | 2d6 | faces: 5 6 | 2 succ, 1 six vs Diff 1 | SUCCESS
Z079 | DC R2 Rafi (H1, M6) attack with Force + Critical die from Z077: Nerve 3 + Force 2 + 1 vs Defence 1 | 6d6 | faces: 1 6 2 6 3 4 | 3 succ, 2 six vs Diff 1 | CRITICAL
Z080 | DC R2 Noor (H0, guarding) attack, no Power: Nerve 1 vs Defence 1 | 1d6 | faces: 3 | 0 succ, 0 six vs Diff 1 | FAILURE
Z081 | DC R2 Bea (H0, M6) Blast with Flame (1 Magic): Craft 3 + Flame 2 vs Defence 1 | 5d6 | faces: 5 6 1 1 5 | 3 succ, 1 six vs Diff 1 | SUCCESS
Z082 | DC R2 threat attack target d6 (1-3 Bea or whoever hurt it last; 4-5 most Hurt marked; 6 Jonah free and guarded by Noor: attacks Noor) | 1d6 | faces: 5
Z083 | DC R2 Storyteller tie pick, most Hurt marked (Rafi H1, Noor H1): 1-3 Rafi 4-6 Noor | 1d6 | faces: 5
Z084 | DC R2 Noor (H1/4) defends: Nerve 1 vs Danger 1 | 1d6 | faces: 4 | 1 succ, 0 six vs Diff 1 | SUCCESS
Z085 | DC R3 (Seen 5/5, Doom 7) Rafi attack with Force: Nerve 3 + Force 2 vs Defence 1 (needs 1 damage to Break) | 5d6 | faces: 6 6 4 5 6 | 5 succ, 3 six vs Diff 1 | CRITICAL
Z086 | DC R3 Unmaking (public, Seen): Bea leads Craft 3 (1 Magic) + Noor joins 2 (1 Magic) + Rafi helps 1 + Bea own Magic 1 vs Diff 3 | 7d6 | faces: 1 3 3 3 2 2 1 | 0 succ, 0 six vs Diff 3 | FAILURE
Z087 | DC R4 Unmaking retry (Broken, flees at end of R4): Bea leads Craft 3 (1 Magic) + Noor joins 2 + Rafi joins 2 (1 Magic each) + Rafi helps 1 + Bea own Magic 1 vs Diff 3 | 9d6 | faces: 3 2 1 4 1 4 4 3 5 | 4 succ, 0 six vs Diff 3 | SUCCESS
Z088 | DD R2 (E1 coven, public, Seen 4/4 after R1, Doom 6, threat 4/9, no Veil Surge; Fen Carried Sol, no roll) Dolly (H3, M4) Blast (1 Magic): Craft 3 vs Defence 2 | 3d6 | faces: 5 6 4 | 3 succ, 1 six vs Diff 2 | SUCCESS
Z089 | DD R2 Mira (H1) attack, no casting: Nerve 2 vs Defence 2 | 2d6 | faces: 6 1 | 1 succ, 1 six vs Diff 2 | PARTIAL
Z090 | DD R2 Ines (H1) attack, no casting: Nerve 2 vs Defence 2 | 2d6 | faces: 4 6 | 2 succ, 1 six vs Diff 2 | SUCCESS
Z091 | DE R2 (E1 coven, public, Seen 4/4, Doom 6, threat 0/9; Fen Carried Sol, no roll) Mira (H1, M2) Shelter on Dolly (1 Magic): Craft 2 vs 2 | 2d6 | faces: 2 5 | 1 succ, 0 six vs Diff 2 | PARTIAL
Z092 | DE R2 Dolly (H3) attack, no casting: Nerve 2 vs Defence 2 | 2d6 | faces: 6 6 | 2 succ, 2 six vs Diff 2 | CRITICAL
Z093 | DE R2 Ines (H1) attack, no casting: Nerve 2 vs Defence 2 | 2d6 | faces: 3 3 | 0 succ, 0 six vs Diff 2 | FAILURE
Z094 | DE R2 threat attack 1 target d6 (1-3 Dolly hurt it last, Sheltered; 4-5 most Hurt marked = Dolly H3; 6 Lure on least Hurt; Sol carried away) | 1d6 | faces: 1
Z095 | DE R2 threat attack 2 target d6 (same) | 1d6 | faces: 1
```

**Roll totals:** 65 rolls with a result: 6 Critical (9%), 39 Success, 11 Partial, 9 Failure (14%). The other 30 are single d6s (17 setup, 13 targets and tie picks).

**Exact odds used above** (worked out by counting, not by rolling):
- A Surge that works on a Partial or better, 5 dice against Difficulty 2: 1 − (1/2)^5 = 96.9%.
- Episode 1's free, 4 dice needing 2 successes: 11/16 = 68.8%. Episode 2's free, 5 dice needing 1: 96.9%.
- Unmaking against Difficulty 3: 6 dice 65.6%; 7 dice 77.3%; 8 dice 85.5%; 9 dice 91.0%. Against Difficulty 5 with 8 dice (Episode 1 without the Weakness): 36.3%.
- A 2-dice attack against Defence 3: no Success possible; Partial (2 successes) 25%.
- Defending with 3 dice against Danger 3: Success 12.5%, Partial 37.5%, Failure 50%. With 4 dice: 31.3%, 37.5%, 31.3%.
- A lead finding at least one Clue with 6 dice against Difficulty 2 (a Partial needs 1 success): 63/64 = 98.4%.
