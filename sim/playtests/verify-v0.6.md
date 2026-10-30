# Verification playtest: core rules v0.6

- **Rules used:** `docs/CORE-RULES.md` v0.6 only. Nothing else was treated as a rule. The glossary was read but only used to check words.
- **Table:** 4 experienced players who play to win and look for edges: 3 witches and a guardian player. A Storyteller. **Standard.**
- **Dice:** every roll came from a dice script (`node roll.mjs "label" dice [difficulty]`, `Math.random`, faces 1–6). Each roll was logged with a label as it was made. Section 9 lists all 110 rolls (V001–V110). Roll IDs are cited throughout. No roll was invented, changed or rolled again.
- **Episode result:** **Win.** The coven found all 15 Clues by the end of scene 4 (Doom 4), went to the threat in a hidden place, Broke it in round 1 before it ever acted, and destroyed it with the Unmaking in round 2. Exposure ended at 1 of 4.
- **Short verdict:** v0.6 fixed most of what the two v0.4 tests found. The go-or-wait timing, Book research, Lives, the word "casting", target fallbacks, the free roll and the Critical menu all ran with no ruling. But **the threat still never attacked**: with the Weakness known, this coven Breaks a Standard threat in round 1 about 90% of the time (section 4, N1). The drills found new edge cases around Shelter plus Shield, Down guards, Seen in mid-scene, Blasting timing and the potion cap.

Severity used below: **blocker** = the text gives opposite answers that change the result, or a core design goal fails in play; **confusing** = a table has to stop and invent a ruling, or a core choice doesn't work; **minor** = wording, or a gap that rarely matters.

---

## 1. Verification table

Status: **fixed** = the v0.6 text answers it; **partly** = some of it is answered; **not changed** = no new text answers it; **changed differently** = answered, but not in the way the issue suggested. Quotes are from `docs/CORE-RULES.md` v0.6, with bold removed.

### Playtest A (first night, v0.4), issues 1–26

| A# | Issue (short) | Status | v0.6 text that answers it, or what is still open |
|---|---|---|---|
| 1 | Half the Clues and the mark in the same scene; when to decide; does going take a scene | fixed | "At the end of each scene, Doom +1. Then, if the coven has half the Clues [T] (rounded up), … may go to it (this takes no scene) … But if Doom has reached the Showdown mark (5), it's too late". Ran with no dispute in the episode and in D1. |
| 2 | Book research: what it rolls and finds | fixed | "research the Book at home (a lead using Wits, +1 die, with no Exposure …)" |
| 3 | When a Life calls, who decides, who says it fits | fixed | "Each witch's Life calls once per episode, and they can answer it in any scene"; "your Life (+1 when the Storyteller agrees it fits)". |
| 4 | "Magic" has two meanings | fixed | "Casting means using a Power, a spell, a potion or a guardian gift." Magic is now only the points. No confusion at the table. |
| 5 | Signature move undefined | partly | Default given: "6 its signature move (if it has none, it attacks two different characters)". No guide to how strong a home-made move should be, and it doesn't say whether "two different characters" is two attacks (for the one-lost-attack limit and Hold). |
| 6 | Targets: nobody hurt it yet, ties, last attacker Down | fixed | "1–3 it attacks whoever hurt it last (if nobody has, or they're Down, use 4–5); 4–5 whoever is most hurt and still standing (ties: the Storyteller picks)". Used in D9 with no ruling. |
| 7 | How long a guard lasts | fixed | "guard the innocent (until your next action, …)". New gap when the guard goes Down: N3. |
| 8 | A freed innocent taken again | fixed | "Once free, if the threat takes them, they're lost." Seen in D8. |
| 9 | No-guardian call: action, roll, casting | fixed | "calling takes no action and no roll, and counts as casting". |
| 10 | Who holds potions; handing over; on a neighbour; Down witch; "a round" in scenes | partly | "The coven shares its potions … Using one takes no action: on your turn, on yourself or someone near you, one a round." Still open: can a Down witch use one on herself, and what "one a round" means in a scene. |
| 11 | Helpers on the Unmaking; a joiner also helping | fixed | "helping takes no action, so anyone can help, even after acting or while Down"; "joiners don't count toward the +2 limit". Finn joined and helped in round 2 with no question. |
| 12 | Critical extras missing for most rolls | fixed | "It does one thing extra: +1 damage, +1 Clue, +1 potion or −1 more Exposure, as fits; otherwise +1 die on your next roll." New small gap: N10. |
| 13 | Partial free; "no other cost" on a missed Unmaking (then under its old name) | fixed | "only a success frees them (a Partial doesn't, and still costs 1 Hurt)"; "On a Partial or Failure it isn't destroyed and nobody takes Hurt". |
| 14 | Hurt for failed reading or brewing at home feels odd | not changed | The cost line is the same: "Otherwise, Exposure +1 if you were casting out in the city, or else 1 Hurt." Rosa took 3 Hurt at home this episode (V008, V012, V013). Kept on purpose, it seems. |
| 15 | Difficulty 1–4 vs the Unmaking | fixed | "usually 1–4; the Unmaking can be higher". (The glossary still says 1–4: N18.) |
| 16 | No Partial at Difficulty 1 | fixed | "(At Difficulty 1 there is no Partial.)" |
| 17 | Can a Down witch act | fixed | "Down: no actions except resting during the investigation, but you can still help and join the Unmaking". |
| 18 | Weakness damage: Blast, potions, Partials | fixed | "attack rolls (including Blast) that work do 1 more damage; potions don't." A Partial "works", so it gets the +1 (Rosa's Partial in D4, V057). |
| 19 | When a Surge is paid | fixed | "paid before you roll and spent even on a Failure". |
| 20 | Seen makes later Exposure free | changed differently | Suggested Hurt; v0.6 chose Doom: "any further rise becomes Doom +1 instead (once per round or scene)". It bites (D2). New gap: only the first rise per scene or round counts (N9). |
| 21 | A Partial Hide nets zero | changed differently | Suggested a Hurt cost; v0.6 says "Casting Hide never raises Exposure." It no longer says what a Partial or failed Hide costs out in the city (N11). |
| 22 | A Critical Reveal: 2 or 3 Clues | partly | No new line. Read with the Critical menu ("+1 Clue") and "Reveal … a success gives 1 more Clue", it comes to 3, which is how Ivy's Critical Reveal (V010) was scored. A one-line example would close it. |
| 23 | Can a Broken threat still take the innocent | fixed | "it makes no more rolls or moves". |
| 24 | Roll or pick Powers; shared; Lives; talking and searching leads | fixed | "roll a d6 in this order, or pick: Force, Flame, Sight, Voice, Veil, Wild; no two witches share one"; the d6 Life table; "A talking lead uses Heart; a searching lead uses Wits." Setup took about 10 minutes. |
| 25 | Magic above 5; skipping a Life at 0 Magic | partly | "(or take 1 Hurt if they have none)" fixes 0. Going above 5 is still unstated (Finn reached 6 in scene 2). |
| 26 | Doom full in a hidden showdown, with no innocent there | fixed | "when full, the plan is complete: the innocent is lost and the threat escapes." |

### Playtest B (rowdy table, v0.4), issues 1–38

| B# | Issue (short) | Status | v0.6 text that answers it, or what is still open |
|---|---|---|---|
| 1 | Potions with no roll and no action make the threat harmless | changed differently | Not the suggested action cost. Instead: "Blasting: use it with your attack; if the attack works, 2 more damage"; "a Partial one with its cost"; "can carry at most one per character"; "It loses at most one attack a round". Binding still has "no roll" and no action. **The threat still made 0 attacks this episode** (N1), now from Surges plus the Weakness rather than potions alone. |
| 2 | Half the Clues vs Doom 5 timing | fixed | Same text as A1. Chosen at the end of the scene, not the start as suggested, but clear. |
| 3 | An innocent taken after round 1 can never be lost | changed differently | Suggested "lost at the end of the next round"; v0.6: "Once free, if the threat takes them, they're lost." (at once). |
| 4 | Partial on free and Hold | changed differently | Free as suggested: "only a success frees them". Hold the other way: "Nerve against Defence; if it works" — a Partial works, with 1 Hurt (D8). |
| 5 | Shelter stops a witch's own costs | fixed | "until your next action, one person can't be hurt by the threat's attacks." Rosa's own Failure still cost 1 Hurt while Sheltered (D7a). New edges: N2, N3. |
| 6 | Book research: what it rolls; do Sight and Sense fit | fixed | "a lead using Wits, +1 die". It is a lead, so Sight and Sense fit (used every scene). |
| 7 | The researcher's extra brew: one potion or a full roll | fixed | "who may also make one brewing roll that scene; each roll has its own result and cost". |
| 8 | Targets: none, Down, ties; guardian never picked by 1–3 | fixed | As A6. The guardian still can't be "whoever hurt it last", but 4–5, Hold and Shield reach it. |
| 9 | Character count when people go Down or fade | fixed | "Set every number at the start of the episode; they don't change if someone joins or leaves." |
| 10 | Can a Down witch drink a potion herself | not changed | Nothing says. "Using one takes no action" and Down is "no actions except resting", so it reads as allowed. |
| 11 | How long a Down guardian is gone | fixed | "for the rest of the scene (in a showdown, the rest of the fight) and can't help from there." |
| 12 | Sight's no-action Surge: timing, "on a Partial or better", while Down | partly | Timing fixed: "with no action, before the defence roll, one attack aimed at anyone misses." But the general Surge line still says it is "added to an action using the Power" and works "on a Partial or better", which can't apply to a Surge with no action and no roll. Use while Down is still unstated. |
| 13 | Critical extras | fixed | As A12. |
| 14 | Doom fills while the innocent is free or carried away | changed differently | Suggested "a held innocent is lost"; v0.6: "the innocent is lost" in every case. |
| 15 | "Magic" two meanings; does Sense count as magic you used | partly | The rename is done. Whose roll is "casting" when the guardian's Sense is on it is still open: "Exposure +1 if you were casting" (N12). |
| 16 | Every witch Down mid-round | changed differently | Suggested "at once"; v0.6: "when every witch is Down at the end of a showdown round". Clear in D10. |
| 17 | Group check: who takes the cost; is it an action | fixed | "it isn't an action. One cost, taken by whoever rolled worst." (Ties for worst are unstated; rare.) |
| 18 | Veil's Surge removes Exposure for the whole showdown | not changed | "no Exposure from casting for the rest of the scene"; "the whole showdown counts as one scene". |
| 19 | A Partial Hide cancels itself | changed differently | As A21. |
| 20 | Weakness +1 on Partials; potions | fixed | As A18. |
| 21 | Difficulty above 4 | fixed | As A15. |
| 22 | "Keep 2 Magic" puzzled the table | fixed | "keep 2 Magic: 1 to join the Unmaking and 1 for a die or a second try". |
| 23 | Guardian helping the Unmaking; joiner also helping | fixed | "The guardian can't … join the Unmaking … but it can help with Ward." Thistle helped in round 2. |
| 24 | Life timing; Magic above 5; below 0 | partly | Timing and 0 fixed. Above 5 still unstated. |
| 25 | Sense dominated; no limit per scene | partly | "outside the +2 limit" makes it worth Ward now. Still no limit per scene: Thistle cast two Senses in one scene in D6 (N12). |
| 26 | Carry before the mark; when the guardian comes back after a Carry; is everyone at the showdown | partly | "(whatever the coven did for them before)" answers Carry before the mark. When the guardian returns after a Carry, and whether everyone is at a showdown the threat brings, are still unstated. |
| 27 | Stacked lost attacks; is a lost attack's d6 rolled | partly | Stacking capped: "It loses at most one attack a round, whatever the cause; any more wait for later rounds." Whether a lost attack still rolls its d6 (a 6 could take the innocent) is unstated. |
| 28 | What an attack with a Power rolls | fixed | "attack (Nerve, or Craft with Blast; a Power that fits adds 2 dice …)". |
| 29 | Healing whose Hurt; who holds; mixed kinds; "one a round" in scenes | partly | Shared stock and "on yourself or someone near you" fixed. Mixed kinds from one brew and "one a round" in scenes unstated. |
| 30 | Wild's Surge on brewing; does −1 Defence count for its own roll | partly | "1 more Clue or potion" fixes brewing. Own-roll timing still unstated. |
| 31 | Tracks past full | fixed | "Extra Clues or damage past the total are lost." Used twice this episode (Clues 18 → 15, Toughness 14 → 12). |
| 32 | Casting free once Seen | fixed | "any further rise becomes Doom +1 instead". In a public showdown this covers every round. In scenes, only once per scene (N9). |
| 33 | A Down witch joins the Unmaking without an action | not changed | "a Down witch joins without one". Seems kept on purpose. |
| 34 | How Down witches leave on a retreat | fixed | "(at the start of any round; everyone leaves together)". |
| 35 | The guardian can't add dice to its own rolls; no rating, no roll | partly | "your own Magic (Ward for the guardian; 1 each)" fixed. Whether the guardian (no Craft) may make the Book researcher's brewing roll is unstated. |
| 36 | No Life table | fixed | "d6: 1 student, 2 nurse, 3 shop worker, 4 teacher, 5 mechanic, 6 bus driver". |
| 37 | One action, two rolls, two costs | fixed | "each roll has its own result and cost". |
| 38 | The old name for the Unmaking was the show's word | fixed | Renamed "the Unmaking" everywhere. |

### Counts

| | Fixed | Partly | Not changed | Changed differently | Total |
|---|---|---|---|---|---|
| Playtest A | 19 | 4 | 1 | 2 | 26 |
| Playtest B | 20 | 9 | 3 | 6 | 38 |
| **Both** | **39** | **13** | **4** | **8** | **64** |

All three v0.4 blockers that were about text (A1/B2 timing, B3 retaking) are fixed. The balance blocker (B1) was answered differently, and the same symptom came back in this test (N1).

---

## 2. Setup

### Numbers for this table (Standard, w = 3 witches, n = 4 with the guardian player)

| Item | Value | How it was worked out |
|---|---|---|
| Lead Difficulty | 2 | table |
| Defence / Danger | 2 / 3 | table; Defence 3 until the Weakness is known |
| Hit | 2 | table (3 on the signature move, below) |
| Toughness | 12 | 4 × 3. No extra 3: that is only "against a coven of 3 witches and no guardian player" |
| Attacks a round | 2 | "2 against 4 or 5" characters (the guardian counts) |
| Clues needed | 15 (half = 8) | 4 × 4 − 1; half of 15 rounded up |
| Exposure boxes | 4 | table |
| Doom | 12, mark at 5 | Tracks |
| Unmaking Difficulty | 3 (5 without the Weakness) | number of witches, +2 |
| Potion cap | 4 | "one per character"; ruled to count the guardian (N6) |

### The witches

Powers rolled in the page's order (1 Force, 2 Flame, 3 Sight, 4 Voice, 5 Veil, 6 Wild): V001 = 2, V002 = 3, V003 = 1. No duplicates. Lives from the page's d6 table: V004 = 6, V005 = 5, V006 = 4. Ratings 3, 2, 2, 1 were placed to win: each witch put the 3 where her Power and her job in the fight are.

| Witch | Power | Heart | Wits | Nerve | Craft | Life | Hurt | Magic | Plan |
|---|---|---|---|---|---|---|---|---|---|
| Ivy Marsh | Flame (V001) | 2 | 1 | 2 | **3** | bus driver (V004) | 0/4 | 5 | Blast with Flame (5 dice), lead the Unmaking, Reveal |
| Rosa Teague | Sight (V002) | 1 | **3** | 2 | 2 | mechanic (V005) | 0/4 | 5 | Book research every scene, defend and study with Sight |
| Finn Adeyemi | Force (V003) | 2 | 1 | **3** | 2 | teacher (V006) | 0/4 | 5 | Free and attack with Force (5 dice), talking leads |

### The guardian

**Thistle**, an old spirit bound to the coven's flat above a launderette by the canal. It looks like a grey cat, or an old man in a work coat. Heart 3, Wits 2, Nerve 2 (read as fixed: N14). Hurt 0/5. Ward 5.

### The threat (Standard column)

- **The Drowner:** a spirit that rises from the canal and pulls night walkers under.
- **Stats:** Defence 2 (3 until the Weakness), Danger 3, Hit 2, Toughness 12, 2 attacks a round.
- **Signature move, Undertow:** one attack on the standing character with the most Magic (or Ward) left, at Hit 3 instead of 2.
- **Weakness** (all 15 Clues): salt from the old lock-keeper's store, thrown where it rises.
- **Plan:** at Doom 12 it takes the innocent under and walks out wearing her face.

### The innocent

**Nell Brannigan**, who runs a second-hand bookshop on a narrowboat moored at the basin.

### Rulings used all night (from the new issues in section 4)

- Magic may go above 5 (as both v0.4 tests ruled; still unstated).
- A Critical Reveal gives 3 Clues (lead Critical 2, plus Reveal's 1).
- The potion cap counts every character and caps the whole stock (N6).
- Blasting is declared before the attack roll and is spent either way (N5).
- The Critical "+1 die on your next roll" counts toward the +2 limit (N10).
- A roll the guardian's Sense adds to counts as casting (N12). (No such roll failed tonight, so it never mattered.)

### Setup time (estimate)

About 12 minutes: 2 to roll Powers and Lives, 5 to place ratings and name everyone, 5 for the Storyteller to look up the Standard column and do the sums (Toughness, Clues, half, the Unmaking). Writing a signature move took a minute. The d6 tables helped a lot.

---

## 3. Play log

Track line: **Doom / Exposure / Clues**, then each character's Hurt (H) and Magic (M) or Ward (W), then potions.

### Opening

A night jogger is pulled from the canal at Coal Wharf, alive but unable to speak, her lips blue. The Drowner has struck.

**Tracks:** Doom 0/12 · Exposure 0/4 · Clues 0/15 · Ivy H0 M5 · Rosa H0 M5 · Finn H0 M5 · Thistle H0/5 W5 · Potions none.

### Scene 1

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Rosa | Book research at home | Wits 3 + Sight 2 + Book 1, + Sense 1 (Thistle, 1 Ward, outside the limit) = 7 vs 2 | V007 | Critical: 2 Clues |
| Rosa | Researcher's brewing roll | Craft 2 vs 2 | V008 | Partial: 1 Blasting potion. Cost: at home, so 1 Hurt |
| Finn | Talking lead: a pupil who runs the towpath | Heart 2 + Life (teacher) 1 = 3 vs 2 | V009 | Partial: 1 Clue. Not casting, so 1 Hurt |
| Ivy | Reveal at the lock (1 Magic) | Craft 3 = 3 vs 2 | V010 | Critical: 3 Clues (ruling above) |
| Thistle | Talking lead at the moorings | Heart 3 = 3 vs 2 | V011 | Failure: no Clue. Its own roll had no gift on it, so 1 Hurt |

Then Doom +1.

- The coven spent Thistle's Sense on Rosa, the strongest roll, to push her Critical chance. Sense outside the limit made this worth the Ward.
- **Question:** Thistle had cast Sense this scene. Was it "casting out in the city" when its own lead failed? Ruled no: the Sense was on Rosa's roll at home, not on Thistle's (N12).

**After scene 1:** Doom 1 · Exposure 0 · Clues 6 · Ivy H0 M4 · Rosa H1 M5 · Finn H1 M5 · Thistle H1 W4 · Potions: Blasting 1 (cap 4).

### Scene 2

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Rosa | Book research | 6 + Sense 1 (Thistle, 1 Ward) = 7 vs 2 | V012 | Partial: 1 Clue. Casting (Sight) but at home, so 1 Hurt |
| Rosa | Researcher's brewing roll | Craft 2 vs 2 | V013 | Failure: no potion, 1 Hurt |
| Ivy | Reveal on the towpath (1 Magic) | Craft 3 vs 2 | V014 | Partial: 1 Clue. Casting out in the city, so Exposure +1 |
| Thistle | Talking lead with the lock-keeper | Heart 3 vs 2 | V015 | Partial: 1 Clue, 1 Hurt |
| Finn | Answers his Life (parents' evening) | no roll | — | +1 Magic (6) |

Then Doom +1. Clues reach 9, past half (8). The coven knows it is a drowned spirit nesting in the old lock chamber under Mill Bridge, and **may go to it now.**

- **The go-or-wait talk.** The players went through it out loud. Going now means a hidden fight with no Weakness (Defence 3, the Unmaking at Difficulty 5). Waiting is free until Doom 4: the only cost is that the showdown starts at Doom 4 instead of 2, and a fight that lasts 2–4 rounds never gets near Doom 12. Waiting buys two more scenes for Clues, brewing and rest. **They waited.** Nobody could name a reason to go early (N8).

**After scene 2:** Doom 2 · Exposure 1 · Clues 9 (half) · Ivy H0 M3 · Rosa H3 M5 · Finn H1 M6 · Thistle H2 W3 · Potions: Blasting 1.

### Scene 3

Rosa is at Hurt 3. A brewing cost would put her Down, so she skips the brewing roll and adds her own Magic to research. With 7 dice against 2, she only pays a cost on 0 or 1 successes (about 6%).

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Rosa | Book research | Wits 3 + Sight 2 + Book 1 + own Magic 1 = 7 vs 2 | V016 | Critical: 2 Clues |
| Finn | Talking lead: parents at the school gate | Heart 2 + Life 1 + own Magic 1 = 4 vs 2 | V017 | Partial: 1 Clue, 1 Hurt |
| Thistle | Talking lead: boat owners at the basin | Heart 3 vs 2 | V018 | Failure: 1 Hurt |
| Ivy | Answers her Life (an extra night route) | no roll | — | +1 Magic (4) |

Then Doom +1. Clues 12. The coven may go; it waits one more scene, for the same reason.

**After scene 3:** Doom 3 · Exposure 1 · Clues 12 · Ivy H0 M4 · Rosa H3 M4 · Finn H2 M5 · Thistle H3 W3 · Potions: Blasting 1.

### Scene 4 (the last free scene)

The table weighed resting against pushing for the Weakness. They pushed: everyone on Clues.

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Rosa | Book research | 7 + Sense 1 (Thistle, 1 Ward) = 8 vs 2 | V019 | Critical: 2 Clues (14) |
| Finn | Talking lead: a former pupil who works the boats | Heart 2 + Life 1 + own Magic 1 = 4 vs 2 | V020 | Success: 1 Clue (15). **Weakness known** |
| Ivy | Talking lead: night-bus regulars at the canal bridge | Heart 2 + Life 1 = 3 vs 2 | V021 | Critical: 2 Clues, lost (past 15) |
| Thistle | Talking lead: the old towpath preacher | Heart 3 vs 2 | V022 | Success: 1 Clue, lost |

Then Doom +1 → 4. The coven has all 15 Clues and Doom is under the mark. It **goes to it now**. Waiting one more scene would bring Doom to 5 and put Nell in its grip in public.

- 3 Clues were lost past the total ("Extra Clues … past the total are lost"). Clear.
- **Rosa never answered her Life.** She researched every scene. At the showdown she loses 1 Magic (3 → 2). The table felt it.

**After scene 4:** Doom 4 · Exposure 1 · Clues 15 (Weakness) · Ivy H0 M4 · Rosa H3 M3 · Finn H2 M4 · Thistle H3 W2 · Potions: Blasting 1.

### Showdown (hidden: the old lock chamber under Mill Bridge; Nell is not there)

**Start:** Rosa's unanswered Life: M3 → 2. The Blasting potion goes to Ivy. Threat: Defence 2, Danger 3, Hit 2, Toughness 0/12, 2 attacks a round. Unmaking Difficulty 3. Hidden place, so no Exposure from rounds.

#### Round 1

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Finn | Attack with Force + Force Surge (2 Magic) | Nerve 3 + Force 2 = 5 vs 2 | V023 | Success: 2 + 1 (Weakness) = 3. The threat loses its next attack. Toughness 3 |
| Ivy | Blast + Flame Surge (1 + 2 Magic), Blasting declared before the roll | Craft 3 + Flame 2 = 5 vs 2 | V024 | Success: 2 + 1 (Blast) + 1 (Weakness) + 2 (Surge) + 2 (Blasting) = **8**. Toughness 11 |
| Rosa | Attack at Hurt 3, own Magic 1, Thistle helps (1 Ward) | Nerve 2 + 1 + 1 = 4 vs 2 | V025 | Success: 3. Toughness 14 → 12 (2 lost). **Broken** |
| Thistle | No action needed | — | — | — |

- Rosa's choice: at Hurt 3, any Partial or Failure would put her Down. But any Partial would also Break the threat, and a Down witch can still join the Unmaking. So the risk was small. The table liked how clear this was.
- **Threat:** Broken, so no attacks. **It never acted.** The lost attack from Force didn't matter.
- **Exposure:** hidden place. **Doom:** stops rising once Broken.
- Nobody was left who hadn't acted, so no Unmaking this round. It flees at the end of round 2.

**After round 1:** Doom 4 · Exposure 1 · Toughness 12/12 (Broken) · Ivy H0 M1 · Rosa H3 M1 · Finn H2 M2 · Thistle H3 W1 · Potions none.

#### Round 2

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Ivy leads (1 Magic); Finn and Rosa join (1 Magic each, 2 dice each); Thistle helps (1 Ward) and Finn helps (1 Magic) | The Unmaking | Craft 3 + 2 + 2 + 2 = 9 vs 3 | V026 | Critical (5 successes): **the Drowner is destroyed** |

- The Critical extra on the Unmaking is "+1 die on your next roll". The next roll is next episode (N10).

**End:** Doom 4 · Exposure 1/4 · Clues 15 · Toughness 12/12 (destroyed) · Ivy H0 M0 · Rosa H3 M0 · Finn H2 M0 · Thistle H3/5 W0.

### Closing

- Nell sells a book to a quiet stranger the next morning and never learns how close it came. The jogger finds her voice.
- **Result: Win** (destroyed, innocent safe, not Seen).
- **Carry-over:** the Drowner gets a page in the Book. No Scars.

### Summary

| | Value |
|---|---|
| Scenes | 4 |
| Showdown rounds | 2 |
| Threat attacks made | **0** (third test in a row) |
| Doom at the end | 4/12 |
| Exposure at the end | 1/4 |
| Clues | 18 found, 15 counted, 3 lost |
| Magic | 17 in all (15 + 2 Lives): 16 spent, 1 lost to Rosa's Life, 0 left |
| Ward | 5 of 5 spent (3 Sense, 2 help) |
| Potions | 1 brewed, 1 used |
| Hurt taken | 8, all from the witches' and guardian's own rolls during the investigation |
| Episode rolls with a result (V007–V026) | 20: 6 Critical (30%), 5 Success, 6 Partial, 3 Failure (15%) |

---

## 4. New issues

| # | Severity | Quote (v0.6) | What happened | Suggested fix | Ruling to use tonight |
|---|---|---|---|---|---|
| N1 | **blocker** (balance) | "Each character takes one action, in any order … Then the threat acts." with "Flame (attacks): 2 more damage", "Blasting: … 2 more damage" and "attack rolls … that work do 1 more damage" | Round 1: Finn 3 + Ivy 8 + Rosa 3 = 14 against Toughness 12. The threat was Broken before it acted. Exact odds for this coven with the Weakness and one Blasting potion: **90%** Broken in round 1; with three Blasting potions (one each), 97%. Without the Weakness: 7%. D4 Broke it in round 1 with no Surges at all (15 damage). D11, after a season step (Toughness 15), it fell 1 short. The B1 fix moved the problem from potions to the first round. | Simulate one of: (a) **the threat acts first in round 1** of every showdown; (b) Flame's Surge and Blasting can't both go on one attack; (c) no extra Toughness cut for a guardian coven (3 witches + guardian: 15, as for 3 witches). (a) is the smallest change and keeps every option. Also report "rounds before the first threat attack" in `sim/REPORT.md`. | As written. |
| N2 | confusing (balance) | "Shield (no action): take an attack meant for someone near it" and "Shelter … one person can't be hurt by the threat's attacks" | D7b: Ivy Sheltered Thistle (Partial). Both attacks went at Rosa; Thistle Shielded both (2 Ward). The whole round did no Hurt, for 1 Magic, 2 Ward and one action. Shield has no limit per round, and this gets round "loses at most one attack a round" because the attacks aren't lost, just wasted. | "Shield: once a round." Or: "A Sheltered character can't Shield." | As written (allowed). |
| N3 | confusing | "guard the innocent (until your next action …)"; "Shelter … until your next action"; "Down: no actions except resting" | A Down guard never reaches "your next action", so the guard lasts forever. Then on a 6 the threat "attacks their guard", who is Down and can't take more Hurt ("Hurt can't go past full"): the innocent is safe for good. The same with Shelter if the caster goes Down. Spotted in D9; the dice didn't force it. Also "their guard" doesn't say who, if two characters guard (Finn and Thistle in D9 round 2). | "Guarding and Shelter end at your next action, or when you go Down." "If two guard, the Storyteller picks which one it attacks." | Both end when the guard or caster goes Down. With two guards, the Storyteller picks. |
| N4 | confusing (order) | "any further rise becomes Doom +1 instead (once per round or scene)" and "Reaching the mark (5) during the investigation brings the threat" vs "At the end of each scene, Doom +1. Then … if Doom has reached the Showdown mark (5), it's too late" | D2b: in scene 5 at Doom 4, already Seen, Finn's failed Reveal (V042) turned into Doom +1 → 5 with two characters still to act. Does the threat come now, or at the end of the scene? With the end-of-scene rise, the showdown started at Doom 6. | "Doom rises from Seen during a scene count at the end of the scene, with the scene's own rise." (Or "the threat comes at once".) Say which. | Finish the scene; check at its end. Doom can reach 6 this way. |
| N5 | confusing (order) | "Blasting: use it with your attack; if the attack works, 2 more damage." | It doesn't say whether you choose it before or after the roll. Players asked to add it after seeing a success, which makes it riskless. | "Say so before you roll; it's used up even if the attack fails" (as with a Surge). | Declared before the roll; spent either way. |
| N6 | confusing | "The coven shares its potions and can carry at most one per character." | D3: the coven had 3; Rosa's Partial brew made a 4th, and Ivy's success made 2 more. Two questions: does the guardian count as a character (it can't use potions), and is this a cap on what the coven holds or only on what it carries out? Under a carry-only reading, potions pile up at home and get drunk there before going. | "The coven can hold at most one potion per witch; a brew past that is wasted." | The cap counts every character (4 tonight) and is the whole stock. Extra potions are lost when brewed. |
| N7 | confusing (balance) | "It makes 1 attack a round against 3 characters … It loses at most one attack a round, whatever the cause; any more wait for later rounds." | D5: Bind, a Binding potion and Force all landed in round 1. The threat lost 1 attack that round and banked 2 for rounds 2 and 3. Against a coven of 3 witches with no guardian player (1 attack a round), the limit never bites: 3 Binding potions mean 3 rounds with no attacks and no rolls (A8). | Simulate: "lost attacks don't carry past the next round", or "against 3 characters, a lost attack makes the next one roll at Danger −1 instead". | As written. |
| N8 | confusing (design) | "At the end of each scene, Doom +1. Then, if the coven has half the Clues …, may go to it" | The coven had half the Clues at Doom 2 and saw no reason to go before Doom 4. Waiting gives free scenes for Clues, brewing and rest; the only cost is a showdown that starts at Doom 4, and fights end long before Doom 12. Same in D1a. Going at Doom 1–3 is dominated by going at Doom 4 (A6). The real choice is only at Doom 4: go, or let the threat come with the innocent. | Give going early a reward, for example: "If you go to it before Doom 4, it isn't ready: it loses its first attack." Or make waiting cost something each scene after half the Clues. Simulate. | As written. |
| N9 | minor (balance) | "any further rise becomes Doom +1 instead (once per round or scene)" | D2a: once Seen, Rosa's failed Reveal in the city cost Doom +1. A third casting cost that scene would cost nothing at all. So after the first, a Partial while casting costs nothing, while a Partial without casting still costs 1 Hurt. Casting becomes the cheap choice once Seen (A5). Also: once the threat is Broken, Doom doesn't rise, so Seen costs nothing more. | "Once Seen, each further rise is Doom +1" (drop "once per scene" in scenes), or "… or 1 Hurt after the first". | As written. |
| N10 | minor | "otherwise +1 die on your next roll" | D7a: Ivy's Critical Shelter gave her +1 die; is it inside or outside the +2 limit? The episode's Critical Unmaking gave +1 die on a "next roll" that is next episode. | "+1 die on your next roll this episode (it counts toward the +2 limit)." | Inside the limit; lost at the end of the episode. |
| N11 | minor | "Casting Hide never raises Exposure." with "Cost: … Exposure +1 if you were casting out in the city, or else 1 Hurt." | Found while reading. A Partial or failed Hide in the city: is the cost 1 Hurt, or nothing? Nothing would make Hide free to fail. | "A Hide's cost is 1 Hurt." | 1 Hurt. |
| N12 | minor | "Exposure +1 if you were casting out in the city" and "Sense (no action): +1 die on a lead this scene, outside the +2 limit." | When Sense goes on a witch's lead in the city, is she "casting", so a Partial costs Exposure, not Hurt? (Test B used this to dodge Hurt.) There is still no limit per scene: Thistle cast two Senses in one scene in D6. Two Senses on one lead isn't ruled out either. | "A roll with Sense on it counts as casting. Sense: once per lead." Consider "once a scene". | A roll Sense adds to is casting. One Sense per lead; no limit per scene. |
| N13 | minor (order) | "Hold …: the threat's next attack must target the guardian" and "(taking them isn't an attack, so Hold can't stop it)" | D8: is the d6 rolled for a Held attack? It has to be, to see if a 6 takes the innocent; we rolled it (V080 = 3). Open: if a Held attack's die shows 6 and the innocent is guarded by a witch, does it go to the guard or the guardian? If it shows the signature move, does Undertow's "most Magic" target lose to Hold? And is a lost attack's d6 rolled at all (B27)? | "Roll the d6 for every attack that isn't lost. A 6 still takes a free, unguarded innocent. Otherwise a Held attack, signature move included, goes to the guardian." | That. |
| N14 | minor | "The guardian has Heart, Wits and Nerve (3, 2, 2)" vs witches "put 3, 2, 2 and 1 into them" | The guardian player wanted Nerve 3 for Hold, freeing and defence. Fixed values, or placed? | "Heart 3, Wits 2, Nerve 2", or "put 3, 2 and 2 into them". | Fixed: Heart 3, Wits 2, Nerve 2. |
| N15 | minor | "After every second episode, each witch raises one rating by 1 (most 4), and threats have 1 more Toughness per witch from then on." and "destroyed threats get a page in the Book (next time, start with half the Clues)" | D11: Does the Toughness rise add up at each step (+1 per witch after episode 2, +2 after episode 4)? Does the guardian grow? Does "next time" mean the next episode, or the next time that kind of threat comes? | "Each step adds 1 more Toughness per witch. The guardian raises one rating too" (or doesn't). "Next time you face that kind of threat." | It adds up. The guardian doesn't grow. The Book page counts when that kind of threat comes again. |
| N16 | minor | "4–5 whoever is most hurt and still standing" | The guardian has 5 boxes and a witch 4. Is "most hurt" boxes filled or how close to Down? In D10 both gave Ivy (3/4 vs 2/5), but Ivy 2/4 vs Thistle 3/5 would differ. Also: with every witch Down and the guardian faded, nobody is "still standing" (A13). | "Most Hurt boxes filled." "If nobody is standing, the attack does nothing." | Count boxes. No target, no attack. |
| N17 | minor | "a Life (a job or role; d6: 1 student, …)" | No reroll rule for Lives, so two witches can share a job. (Part B asks for duplicate rerolls on every table.) Didn't happen tonight. | "Reroll a Life someone has, if you like." | Allowed either way. |
| N18 | minor | Glossary: "Casting where ordinary people can see raises Exposure (except Hide)"; "Difficulty: … (1–4)" | The core page only raises Exposure from casting as a cost, or once per public round. The glossary says every cast in public does. The glossary's 1–4 misses the Unmaking (A11, one source of truth). | Glossary: "Casting out in the city can raise Exposure (see the cost rule and public showdowns)"; "usually 1–4". | Follow the core page. |

---

## 5. Drills

Each drill uses fresh dice and the same coven and threat, from a stated setup. Hurt and Magic at the start of each drill are as stated (0 Hurt and full Magic or Ward unless given).

### D1. Go or wait at the end of a scene

- **D1a.** Start of scene 3: Doom 2, Clues 6/15 (half is 8).
  - Rosa researches (V027): Critical, 2 Clues. Finn's talking lead (V028): Partial, 1 Clue, 1 Hurt. Thistle (V029): Partial, 1 Clue, 1 Hurt. Ivy answers her Life.
  - Clues 10. End of scene: Doom 3. Half the Clues, under the mark: the coven may go now.
  - The players chose to wait one more scene, for the reasons in the episode (N8).
- **D1b.** Start of scene 5: Doom 4, Clues 6/15. The coven didn't have half at the end of scene 4, so it couldn't go.
  - Rosa (V030): Success, 7. Finn (V031): Failure, 1 Hurt. Ivy's Reveal (V032): Success, 2 Clues, 9. Thistle (V033): Success, 10.
  - Half came mid-scene. End of scene: Doom 5. "But if Doom has reached the Showdown mark (5), it's too late": the threat comes to them in public, with Nell in its grip.
- **Finding:** the timing is now clear. Nobody argued. A1/B2 is fixed.

### D2. Seen turning Exposure into Doom

- **D2a (scenes).** Start of scene 3: Doom 2, Exposure 3/4.
  - Scene 3: Ivy's Reveal (V034), Finn's Reveal (V035), Rosa's searching lead with Sight (V036), and Thistle's lead with Sense on itself (V038) all succeeded. No costs. Doom 3.
  - Scene 4: Finn's Reveal (V039) succeeded. Ivy's Reveal (V040) failed: casting in the city, Exposure 3 → **4: Seen.** Rosa's Reveal with Sight (V041) failed: Exposure is full, so **Doom +1** (3 → 4), mid-scene. Thistle rested.
  - End of scene: Doom 4 → 5. Too late to go: the threat comes.
  - **Finding:** Seen ate the last free scene. It works and it bites. A third casting cost that scene would have cost nothing (N9).
- **D2b (Seen reaches the mark mid-scene).** Start of scene 5: Doom 4, already Seen, Clues 7.
  - Ivy's Reveal (V037): Success, 9 Clues. Finn's Reveal (V042): Failure, so Doom +1 → **5, with Rosa and Thistle still to act.**
  - Ruling (N4): finish the scene. Rosa (V043): Success, 10 Clues. Thistle (V044): Partial, 11 Clues, 1 Hurt.
  - End of scene: Doom 6. The showdown starts in public at **Doom 6**, Nell in its grip, Seen.
- **D2c (Seen in a public round).** Doom 6, Exposure 4 (Seen), no Weakness (11 Clues, then 12), Defence 3. Ivy H0 M3, Rosa H0 M4, Finn H1 M4, Thistle H1 W4.
  - Finn frees Nell with Force and 1 Magic (V045): Success. Ivy's Blast (V046): Critical, 2 + 1 + 1 = 4 (Toughness 4). Rosa studies with Sight (V047): Success, Clue 12. Thistle guards Nell.
  - Threat: attack 1 (V048 = 6): Nell is free and guarded, so it attacks her guard, Thistle. Thistle defends with 1 Ward (V050): Failure, 2 Hurt (H3/5). Attack 2 (V049 = 3): whoever hurt it last, Ivy. Ivy defends (V051): Failure, 2 Hurt (H2).
  - Casting happened, so Exposure would rise: **Doom +1** (6 → 7). Then the round's **Doom +1** (→ 8).
  - **Finding:** Seen doubles the clock in a public fight. From Doom 6, Doom fills at the end of round 3 unless the threat is Broken or the coven stops casting. Hide can't help ("before then"). Clear and strong.

### D3. The potion cap and the researcher's brewing roll

- **D3.** Start of scene 3. The coven holds 3 potions (Blasting 2, Healing 1). Cap 4 (ruling, N6).
  - Rosa researches (V052): Success, 1 Clue. Her brewing roll with 2 Magic (V053): Partial, 1 Binding, 1 Hurt. Stock 4.
  - Ivy brews with 1 Magic (V054): Success, 2 potions. The stock would be 6. Under tonight's ruling both are lost, and Ivy's Magic did nothing.
  - Under the other reading ("carry" only limits what goes out), the coven keeps 6 at home, drinks the Healing there, and carries 4.
- **D3b.** Finn researches in scene 2 (V055): Partial, 1 Clue, 1 Hurt. His brewing roll (V056): Success, 2 potions. Two rolls, two results, one cost. "Each roll has its own result and cost" settled it.
- **Finding:** the researcher's brewing roll is clear. The cap needs the two answers in N6. With only 4 potions allowed, the coven filled it in two scenes, so further brewing was wasted.

### D4. Blasting with an attack

- **Setup:** public round 1, Weakness known (Defence 2), Toughness 0/12. Each witch holds a Blasting potion and declares it before rolling (N5).
- Rosa, plain attack (V057): Partial. 1 + 1 (Weakness) + 2 (Blasting) = 4. Cost 1 Hurt.
- Finn, attack with Force, no Surge (V058): Success. 2 + 1 + 2 = 5.
- Ivy, Blast (V059): Success. 2 + 1 (Blast) + 1 (Weakness) + 2 = 6.
- Total 15: **Broken in round 1, with no Surges.** Using a potion is casting, so Exposure +1 even if nobody used a Power. Doom doesn't rise (Broken).
- **Finding:** "if the attack works" includes a Partial, and the Weakness adds to the roll's damage but not the potion's. The text handled every case. But three Blasting potions plus the Weakness still Break a Standard threat before it acts (N1).

### D5. Bind, a Binding potion and Force all land

- **Setup:** public round 1, Weakness known, Nell in its grip, 2 attacks a round.
- Finn frees Nell with Force + Force Surge and 1 Magic (V060): Critical. Nell is free, and the threat loses its next attack. Finn gets +1 die on his next roll.
- Rosa casts Bind with 2 Magic (V061): Success. It loses its next attack.
- Ivy uses a Binding potion (no roll), then Blasts (V062): Partial, 1 + 1 + 1 = 3, 1 Hurt.
- Thistle guards Nell.
- **Threat:** three lost attacks. "It loses at most one attack a round": it makes 1 of its 2 attacks; 2 wait. The remaining attack (V063 = 1) goes to whoever hurt it last, Ivy. Ivy defends (V064): Failure, 2 Hurt (H3).
- **End of round 1:** Nell free. Exposure +1. Doom +1. Toughness 3/12. Banked: rounds 2 and 3 each lose 1 attack, so the threat makes 1 attack in each.
- **No dice (a coven of 3 witches, no guardian player):** it makes 1 attack a round. Three Binding potions, one a round, mean three rounds with no attacks and no rolls. The limit does nothing there (N7).
- **Finding:** the limit is clear and ends B1's "Bind plus potion wipes a round" for 4–5 characters. It doesn't help against small covens. Whether a lost attack still rolls its d6 is unstated (B27).

### D6. Sense outside the +2 limit

- **D6a.** Finn's talking lead in the city: Heart 2 + Life 1 + own Magic 1 (the +2 limit is full) + Sense 1 (Thistle, 1 Ward) = 5 dice (V065): Success.
- **D6b.** Same scene. Ivy's talking lead: Heart 2 + own Magic 1 + a second Sense (1 Ward) = 4 dice (V066): Success.
- **Finding:** "outside the +2 limit" read cleanly, and Sense is now worth its Ward. Thistle spent 2 Ward on Senses in one scene; nothing limits it. Neither roll failed, so the "is Sense casting?" cost question didn't come up (N12).

### D7. Shelter: against attacks, and against the sheltered character's own costs

- **D7a.** Hidden round 1, no Weakness (Defence 3).
  - Ivy casts Shelter on Rosa (V067): Critical. Nothing on the menu fits, so +1 die on Ivy's next roll.
  - Rosa attacks while Sheltered (V068): Failure. **She takes 1 Hurt anyway**: Shelter only stops the threat's attacks. B5 is fixed.
  - Finn attacks with Force (V069): Partial, 1 damage, 1 Hurt (H1).
  - Threat: attack 1 (V070 = 5) is "most hurt": Rosa and Finn tie at 1. The Storyteller let a die pick (V072 = 4): Finn. Attack 2 (V071 = 2): whoever hurt it last, Finn. Finn defends (V073, V074): Failure, Failure. 1 + 2 + 2 = 5, capped at 4: **Down**.
  - The threat, picking freely, chose the unsheltered witch. Rosa was never attacked while Sheltered.
- **D7b.** Round 2. Ivy's Shelter on Rosa ends at Ivy's next action.
  - Ivy casts Shelter on Thistle, with her Critical die (V075): Partial. It works; Ivy takes 1 Hurt.
  - Rosa attacks (V076): Partial, 1 damage (Toughness 2), 1 Hurt (H2). Finn is Down.
  - Threat: attack 1 (V077 = 2) and attack 2 (V078 = 2) both go to whoever hurt it last, Rosa. Thistle Shields both (2 Ward). Thistle is Sheltered: **no Hurt from either attack.** No defence roll is needed.
- **Finding:** Shelter now does what it says. But Shelter plus Shield wipes out a full round for 1 Magic, 2 Ward and one action, and nothing limits Shield per round (N2). If the Shelter caster goes Down, the Shelter has no end (N3).

### D8. Hold on a Partial (and an innocent taken after being freed)

- **Setup:** public round 2, Weakness known. Nell was freed in round 1 and nobody is guarding her.
- Thistle Holds (V079): Partial. "If it works": it works, with 1 Hurt (H1/5). The threat's next attack must target Thistle.
- Attack 1: its d6 is rolled only to see if it's a 6 (N13): V080 = 3. Held, so it goes to Thistle. Thistle defends with 1 Ward (V082): Partial, 1 Hurt (H2/5).
- Attack 2 (V081 = 6): Nell is there, free and unguarded. **It takes her. She is lost** ("Once free, if the threat takes them, they're lost").
- **Finding:** Hold on a Partial is clear (B4). Losing a freed innocent at once is clear and harsh: the best result now is a Partial. The order of Hold and a 6 needs a line (N13).

### D9. Freeing the innocent the hard way, and guarding

- **Setup:** public round 1, no Weakness (Defence 3), Nell in its grip.
- Finn frees with Force and 1 Magic (V083): Partial. Not freed; 1 Hurt (H1).
- Rosa frees with 1 Magic and Ivy's help (V084): Failure. 1 Hurt (H1).
- Thistle frees with 2 Ward on its own roll (V085): Critical. **Nell is free.** (+1 die on Thistle's next roll.)
- Ivy guards Nell.
- Threat: attack 1 (V086 = 2): nobody has hurt it, so use 4–5: most hurt, Finn and Rosa tie at 1. A die picks (V088 = 1): Finn. Finn defends (V090): Partial, H2. Attack 2 (V087 = 4): most hurt is now Finn alone (2), so the second tie die (V089) wasn't needed. Finn defends with 1 Magic (V091): Partial, H3.
- End of round 1: Nell is free, so not lost.
- Round 2: Thistle guards; Ivy Blasts (V092), Failure, 1 Hurt, and her guard ends because she acted; Rosa attacks with 1 Magic (V093), Partial, 1 damage, 1 Hurt; Finn guards too (no roll). Attacks (V094 = 2, V095 = 2): whoever hurt it last, Rosa. Rosa defends with Sight (V096, V097): Critical, Success. No Hurt.
- **Finding:** the target fallbacks (nobody yet; ties) worked with no ruling. A guardian freeing with its own Ward is a real option now. "Their guard" with two guards is unstated (N3). The take itself is in D8.

### D10. Every witch Down at the end of a round

- **Setup:** public round 3, Weakness known, Toughness 6/12. Nell was carried out earlier. Rosa and Finn are Down. Ivy H3 M3. Thistle H2/5, W0.
- Ivy Blasts, with 1 Magic each from Rosa and Finn (both Down, both may help) (V098): Critical. 2 + 1 + 1 + 1 (Critical: +1 damage fits) = 5. **Toughness 11/12.**
- Thistle Holds (V099): Success.
- Threat: attack 1 (V100 = 1) is Held: Thistle. Thistle defends (V102): Failure, 2 Hurt (H4/5, still standing). Attack 2 (V101 = 4): most hurt and still standing, Ivy (3 of 4). Ivy defends with 2 Magic (V103): Partial, 1 Hurt: **Down.**
- End of the round: every witch is Down. The guardian standing doesn't count. **Loss**, with the threat 1 short of Broken. All three witches get a Scar.
- **Finding:** "at the end of a showdown round" was clear (B16). Down witches helping kept Ivy in it. Nobody could use a potion after the threat acted, since potions are used "on your turn".

### D11. A season step

- **Setup:** after episode 2. Each witch raised one rating: Ivy Craft 4, Rosa Wits 4, Finn Nerve 4. Threats have 1 more Toughness per witch: **Toughness 15** at Standard (12 + 3). A threat that wasn't destroyed would come back with 2 more (17). The guardian doesn't grow (N15).
- Episode 3, hidden, Weakness known, one Blasting potion. Round 1:
  - Finn, attack + Force Surge (V104): Success, 3, and the threat loses an attack.
  - Ivy, Blast + Flame Surge + Blasting (V105): Success, 8.
  - Rosa, with 1 Magic and Thistle's help (V106): Success, 3.
  - Total 14: **1 short of 15.** The threat acts: 1 attack (the other lost to Force). V107 = 5: most hurt; everyone is at 0, so the Storyteller picks Ivy. Thistle Shields it (1 Ward) and defends with 1 Ward (V108): Partial, 1 Hurt.
- Round 2: Rosa attacks (V109): Partial, 2 (Weakness), Broken; 1 Hurt. Ivy leads the Unmaking, Finn joins, Rosa and Thistle help (V110): Success, destroyed.
- **Finding:** the extra Toughness did its job: the threat got one attack in. The text left three questions: does the rise add up each step, does the guardian grow, and when does a Book page count (N15).

---

## 6. Part A checks that failed

- **A1 (every state of every track).**
  - Magic above 5 is still unstated (Finn reached 6).
  - The potion stock past the cap (N6).
  - Doom reaching the mark mid-scene through Seen (N4).
- **A5 (no free spend).**
  - Once Seen, only the first casting cost in a scene costs anything (N9). After Broken, Seen costs nothing more.
  - A Down guard keeps guarding for free (N3).
  - A Down witch joins the Unmaking without an action (B33, kept).
- **A6 (no dominated option).** Going to the threat at Doom 1–3 is dominated by going at Doom 4 (N8).
- **A8 (nothing skips a roll for free).**
  - Shelter plus Shield cancels a round of attacks with one roll (N2).
  - Binding still cancels an attack with no roll and no action; against 1-attack covens the one-a-round limit doesn't bite (N7).
  - The threat acting after every character lets a prepared coven Break it before it rolls once (N1). Not a free skip as such, but the same effect.
- **A10 (limits stated outright).** Sense has no limit per scene or per lead (N12). Shield has no limit per round (N2). Guard and Shelter have no end when Down (N3).
- **A11 (one source of truth).** The glossary says casting in public raises Exposure, and that Difficulty is 1–4 (N18).
- **A13 ("there is none").** A Down guard as "their guard" (N3); "most hurt and still standing" with nobody standing (N16).
- **A15 (order of resolution).** Seen's Doom mid-scene (N4); Blasting before or after the roll (N5); Hold against a 6 and the signature move (N13); a lost attack's d6 (B27).
- **A19 (balance).** At Standard with the Weakness, this coven Breaks the threat in round 1 about 90% of the time (N1). The simulator's 74% win rate for this cell may still be right overall, since it includes episodes without the Weakness. But fights where the threat never acts can't meet the "losing is a real risk" aim. Criticals in this episode's 20 rolls were 30% (a small sample; big pools on leads).

**Passes worth noting:**
- **A2:** in a public round, Exposure (or Seen's Doom) rises once and Doom once. Seen makes Doom +2 a round in public (D2c). That is fast but stated, and it doesn't make rolls harder.
- **A4:** D10's Loss at 11/12 gave Scars; retreat is still a Loss.
- **A7:** every point of Magic and Ward was spent in the episode.
- **A12:** read literally at the start (Opening) and the end (every-witch-Down at the end of a round, Broken then flees), the page holds.
- **A16:** casting, Danger, in its grip and the Unmaking caused no confusion.
- **A22:** Doom bound in D1b and D2 (the mark arrived and changed the fight).

---

## 7. What worked

- **The go-or-wait timing is clear.** "At the end of each scene, Doom +1. Then …" answered every case in the episode and D1 with no talk about rules.
- **Book research as a lead, with its own brewing roll,** ran cleanly every scene. "Each roll has its own result and cost" settled two-roll actions at once.
- **One meaning per word.** Nobody asked whether a Power costs Magic. "Casting" made the city cost easy to call on every roll.
- **The Critical menu** covered every Critical tonight (Clues, damage, a die) with no invented extras.
- **Target fallbacks and ties** (D7a, D9) worked as written.
- **Free, Hold and the Unmaking Partials** are all stated. Nobody had to ask.
- **Lives bite.** Rosa chose research over her Life every scene and lost 1 Magic. Finn and Ivy each spent one action on theirs.
- **Extra Clues and damage are lost:** used twice, no questions.
- **Sense outside the limit** made the guardian's investigation Ward worth spending. The guardian player was busy every scene.
- **Seen feeding Doom** has teeth: it ate the last free scene (D2a) and doubled the clock in a public fight (D2c).
- **The d6 tables** made setup quick (about 12 minutes).
- **The Unmaking** was again the high point: 9 dice, everyone in, the guardian helping.
- **"Every witch Down at the end of a round"** (D10) let the guardian's Hold and the helpers matter before the end.

---

## 8. How it felt

- **Was losing a real risk? In the investigation, yes. In the fight, no.**
  - Failed leads hurt. By scene 4 Rosa was at Hurt 3, Thistle at 3 and Finn at 2. The table argued about resting against pushing for the Weakness, which is the right kind of choice.
  - Exposure stayed low because the coven used little magic in the city: only Ivy's Reveals cast there.
  - The fight never started: Broken in round 1, destroyed in round 2, **0 threat attacks**. With the Weakness, this coven breaks a Standard threat in round 1 about 90% of the time (exact odds, N1). Without it, 7%. So the whole risk sits in the Clue race, and the fight is a victory lap or a hard slog with little in between.
  - The drills show real losses once things go wrong: a Loss at 11/12 (D10), an innocent lost on a 6 (D8), and Seen doubling Doom (D2c).
- **Were resources spent? Yes.** 16 of 17 Magic spent (1 lost to Rosa's Life), 5 of 5 Ward. Only 1 potion was brewed: Rosa's brewing rolls at Craft 2 went Partial and Failure, and then she skipped them to stay up.
- **Dominant tactics:**
  1. Book research with Sight, Sense and 1 Magic every scene: 7–8 dice against 2, a Critical about 40% of the time.
  2. Wait until Doom 4, then go. Nothing rewards going sooner (N8).
  3. The round-1 strike: Force Surge, then Blast + Flame Surge + Blasting with the Weakness (8 damage from one action).
  4. In drills: Shelter on the guardian plus Shield on every attack (N2).
- **The guardian versus a fourth witch.** Thistle drove the investigation (Sense on Rosa three times, four leads) and helped twice in the fight, but did no damage and never had to Shield. With a guardian player, the threat has 12 Toughness instead of 15; three witches did all the damage and it was plenty.
- **How long it took (estimate):** setup 12 minutes; four scenes about 40 minutes; showdown about 8 minutes; closing 5. **About 65 minutes of play.** Short for a session; the fight was over in two rolls and an Unmaking.
- **Simulator note:** `sim/REPORT.md` gives Standard, 4 players with a guardian, Win 74% / Loss 11%. Worth adding "rounds before the threat's first attack" and "share of fights where it never attacks" to the report, and a policy that waits until Doom 4.

---

## 9. Dice appendix

All 110 rolls, in the order they were made. Format: ID | label | dice | faces | successes vs Difficulty | result. The script counts 4–6 as successes; a Success needs successes ≥ Difficulty; a Critical is a Success with two or more 6s; a Partial needs at least half the Difficulty, rounded up (none at Difficulty 1).

**Notes on the log:**
- **V038** is labelled D2a scene 3 but was rolled after V037 (D2b). Only the order differs; the faces are as rolled.
- **V072 and V088** are the Storyteller's tie picks, made with a die to stay neutral.
- **V089** was rolled but not used: after attack 1 hurt Finn, attack 2 had a single "most hurt" target.
- The episode is V007–V026. Setup is V001–V006. Drills are V027–V110.

```
V001 | Setup: Witch 1 Power (1 Force 2 Flame 3 Sight 4 Voice 5 Veil 6 Wild) | 1d6 | faces: 2
V002 | Setup: Witch 2 Power (1 Force 2 Flame 3 Sight 4 Voice 5 Veil 6 Wild) | 1d6 | faces: 3
V003 | Setup: Witch 3 Power (1 Force 2 Flame 3 Sight 4 Voice 5 Veil 6 Wild) | 1d6 | faces: 1
V004 | Setup: Witch 1 Life (1 student 2 nurse 3 shop worker 4 teacher 5 mechanic 6 bus driver) | 1d6 | faces: 6
V005 | Setup: Witch 2 Life (1 student 2 nurse 3 shop worker 4 teacher 5 mechanic 6 bus driver) | 1d6 | faces: 5
V006 | Setup: Witch 3 Life (1 student 2 nurse 3 shop worker 4 teacher 5 mechanic 6 bus driver) | 1d6 | faces: 4
V007 | EP S1 Rosa Book research: Wits 3 + Sight 2 + Book 1 + Sense 1 (Thistle, 1 Ward, outside limit) | 7d6 | faces: 3 2 5 3 6 6 3 | 3 succ, 2 six vs Diff 2 | CRITICAL
V008 | EP S1 Rosa researcher's brewing roll: Craft 2 | 2d6 | faces: 2 5 | 1 succ, 0 six vs Diff 2 | PARTIAL
V009 | EP S1 Finn talking lead (student on the towpath): Heart 2 + Life teacher 1 | 3d6 | faces: 6 2 2 | 1 succ, 1 six vs Diff 2 | PARTIAL
V010 | EP S1 Ivy Reveal at the lock (city, 1 Magic): Craft 3 | 3d6 | faces: 6 4 6 | 3 succ, 2 six vs Diff 2 | CRITICAL
V011 | EP S1 Thistle talking lead at the moorings: Heart 3 | 3d6 | faces: 2 1 1 | 0 succ, 0 six vs Diff 2 | FAILURE
V012 | EP S2 Rosa Book research: Wits 3 + Sight 2 + Book 1 + Sense 1 (Thistle, 1 Ward) | 7d6 | faces: 2 3 1 1 1 6 2 | 1 succ, 1 six vs Diff 2 | PARTIAL
V013 | EP S2 Rosa researcher's brewing roll: Craft 2 | 2d6 | faces: 3 3 | 0 succ, 0 six vs Diff 2 | FAILURE
V014 | EP S2 Ivy Reveal on the towpath (city, 1 Magic): Craft 3 | 3d6 | faces: 6 2 3 | 1 succ, 1 six vs Diff 2 | PARTIAL
V015 | EP S2 Thistle talking lead with the lock-keeper: Heart 3 | 3d6 | faces: 3 3 6 | 1 succ, 1 six vs Diff 2 | PARTIAL
V016 | EP S3 Rosa Book research: Wits 3 + Sight 2 + Book 1 + own Magic 1 | 7d6 | faces: 2 2 6 2 3 6 2 | 2 succ, 2 six vs Diff 2 | CRITICAL
V017 | EP S3 Finn talking lead (parents at the school gate): Heart 2 + Life 1 + own Magic 1 | 4d6 | faces: 3 2 5 3 | 1 succ, 0 six vs Diff 2 | PARTIAL
V018 | EP S3 Thistle talking lead (boat owners at the basin): Heart 3 | 3d6 | faces: 1 2 3 | 0 succ, 0 six vs Diff 2 | FAILURE
V019 | EP S4 Rosa Book research: Wits 3 + Sight 2 + Book 1 + own Magic 1 + Sense 1 (Thistle, 1 Ward) | 8d6 | faces: 5 6 1 5 2 1 6 5 | 5 succ, 2 six vs Diff 2 | CRITICAL
V020 | EP S4 Finn talking lead (former pupil on the boats): Heart 2 + Life 1 + own Magic 1 | 4d6 | faces: 5 5 3 6 | 3 succ, 1 six vs Diff 2 | SUCCESS
V021 | EP S4 Ivy talking lead (night-bus regulars at the canal bridge): Heart 2 + Life bus driver 1 | 3d6 | faces: 6 6 1 | 2 succ, 2 six vs Diff 2 | CRITICAL
V022 | EP S4 Thistle talking lead (the old towpath preacher): Heart 3 | 3d6 | faces: 4 5 4 | 3 succ, 0 six vs Diff 2 | SUCCESS
V023 | EP R1 Finn attack with Force + Force Surge (2 Magic): Nerve 3 + Force 2 vs Defence 2 (Weakness known) | 5d6 | faces: 2 3 1 4 5 | 2 succ, 0 six vs Diff 2 | SUCCESS
V024 | EP R1 Ivy Blast + Flame Surge (3 Magic) + Blasting potion declared: Craft 3 + Flame 2 vs Defence 2 | 5d6 | faces: 3 5 1 5 6 | 3 succ, 1 six vs Diff 2 | SUCCESS
V025 | EP R1 Rosa attack at Hurt 3: Nerve 2 + own Magic 1 + Thistle helps 1 Ward vs Defence 2 | 4d6 | faces: 6 3 5 3 | 2 succ, 1 six vs Diff 2 | SUCCESS
V026 | EP R2 Unmaking: Ivy leads Craft 3 (1 Magic) + Finn joins 2 + Rosa joins 2 + helpers Thistle 1 Ward, Finn 1 Magic vs Diff 3 (3 witches, Weakness known) | 9d6 | faces: 4 3 6 4 6 4 2 3 1 | 5 succ, 2 six vs Diff 3 | CRITICAL
V027 | D1a S3 (Doom 2, Clues 6/15) Rosa Book research: Wits 3 + Sight 2 + Book 1 | 6d6 | faces: 4 4 6 2 6 2 | 4 succ, 2 six vs Diff 2 | CRITICAL
V028 | D1a S3 Finn talking lead: Heart 2 + Life 1 | 3d6 | faces: 2 6 3 | 1 succ, 1 six vs Diff 2 | PARTIAL
V029 | D1a S3 Thistle talking lead: Heart 3 | 3d6 | faces: 4 3 2 | 1 succ, 0 six vs Diff 2 | PARTIAL
V030 | D1b S5 (Doom 4, Clues 6/15) Rosa Book research: Wits 3 + Sight 2 + Book 1 | 6d6 | faces: 4 3 6 4 5 2 | 4 succ, 1 six vs Diff 2 | SUCCESS
V031 | D1b S5 Finn talking lead: Heart 2 + Life 1 | 3d6 | faces: 3 1 2 | 0 succ, 0 six vs Diff 2 | FAILURE
V032 | D1b S5 Ivy Reveal (city, 1 Magic): Craft 3 | 3d6 | faces: 5 4 2 | 2 succ, 0 six vs Diff 2 | SUCCESS
V033 | D1b S5 Thistle talking lead: Heart 3 | 3d6 | faces: 5 5 4 | 3 succ, 0 six vs Diff 2 | SUCCESS
V034 | D2a S3 (Doom 2, Exposure 3/4) Ivy Reveal (city, 1 Magic): Craft 3 | 3d6 | faces: 3 6 4 | 2 succ, 1 six vs Diff 2 | SUCCESS
V035 | D2a S3 Finn Reveal (city, 1 Magic): Craft 2 | 2d6 | faces: 5 4 | 2 succ, 0 six vs Diff 2 | SUCCESS
V036 | D2a S3 Rosa searching lead with Sight (city): Wits 3 + Sight 2 | 5d6 | faces: 2 4 1 5 4 | 3 succ, 0 six vs Diff 2 | SUCCESS
V037 | D2b S5 (Doom 4, Exposure 4/4 Seen, Clues 7/15) Ivy Reveal (city, 1 Magic): Craft 3 | 3d6 | faces: 5 2 5 | 2 succ, 0 six vs Diff 2 | SUCCESS
V038 | D2a S3 Thistle talking lead with Sense on itself (city, gift = casting): Heart 3 + Sense 1 | 4d6 | faces: 5 4 6 3 | 3 succ, 1 six vs Diff 2 | SUCCESS
V039 | D2a S4 (Doom 3, Exposure 3/4) Finn Reveal (city, 1 Magic): Craft 2 | 2d6 | faces: 5 4 | 2 succ, 0 six vs Diff 2 | SUCCESS
V040 | D2a S4 Ivy Reveal (city, 1 Magic): Craft 3 | 3d6 | faces: 3 2 3 | 0 succ, 0 six vs Diff 2 | FAILURE
V041 | D2a S4 Rosa Reveal with Sight (city, 1 Magic): Craft 2 + Sight 2 | 4d6 | faces: 1 3 1 1 | 0 succ, 0 six vs Diff 2 | FAILURE
V042 | D2b S5 Finn Reveal (city, 1 Magic): Craft 2 | 2d6 | faces: 2 1 | 0 succ, 0 six vs Diff 2 | FAILURE
V043 | D2b S5 (after Doom hit 5 mid-scene) Rosa Book research: Wits 3 + Sight 2 + Book 1 | 6d6 | faces: 4 2 3 4 5 1 | 3 succ, 0 six vs Diff 2 | SUCCESS
V044 | D2b S5 Thistle talking lead: Heart 3 | 3d6 | faces: 2 4 1 | 1 succ, 0 six vs Diff 2 | PARTIAL
V045 | D2c R1 public, Seen, Doom 6, no Weakness: Finn frees with Force: Nerve 3 + Force 2 + own Magic 1 vs Defence 3 | 6d6 | faces: 2 6 4 5 4 3 | 4 succ, 1 six vs Diff 3 | SUCCESS
V046 | D2c R1 Ivy Blast (1 Magic): Craft 3 + Flame 2 vs Defence 3 | 5d6 | faces: 6 4 6 1 3 | 3 succ, 2 six vs Diff 3 | CRITICAL
V047 | D2c R1 Rosa study: Wits 3 + Sight 2 vs Defence 3 | 5d6 | faces: 4 4 1 6 2 | 3 succ, 1 six vs Diff 3 | SUCCESS
V048 | D2c R1 threat attack 1 target d6 (1-3 last hurt it, 4-5 most hurt, 6 signature or innocent) | 1d6 | faces: 6
V049 | D2c R1 threat attack 2 target d6 | 1d6 | faces: 3
V050 | D2c R1 Thistle (guard) defends attack 1: Nerve 2 + own Ward 1 vs Danger 3 | 3d6 | faces: 6 3 1 | 1 succ, 1 six vs Diff 3 | FAILURE
V051 | D2c R1 Ivy defends attack 2: Nerve 2 vs Danger 3 | 2d6 | faces: 5 2 | 1 succ, 0 six vs Diff 3 | FAILURE
V052 | D3 S3 (coven holds 3 potions) Rosa Book research: Wits 3 + Sight 2 + Book 1 | 6d6 | faces: 1 2 1 2 5 6 | 2 succ, 1 six vs Diff 2 | SUCCESS
V053 | D3 S3 Rosa researcher's brewing roll: Craft 2 + own Magic 2 | 4d6 | faces: 1 2 2 4 | 1 succ, 0 six vs Diff 2 | PARTIAL
V054 | D3 S3 Ivy brews at home: Craft 3 + own Magic 1 | 4d6 | faces: 5 3 5 4 | 3 succ, 0 six vs Diff 2 | SUCCESS
V055 | D3b S2 Finn researches the Book: Wits 1 + Book 1 | 2d6 | faces: 3 5 | 1 succ, 0 six vs Diff 2 | PARTIAL
V056 | D3b S2 Finn researcher's brewing roll: Craft 2 | 2d6 | faces: 6 5 | 2 succ, 1 six vs Diff 2 | SUCCESS
V057 | D4 R1 (public, Weakness known, Defence 2) Rosa plain attack + Blasting declared: Nerve 2 | 2d6 | faces: 1 6 | 1 succ, 1 six vs Diff 2 | PARTIAL
V058 | D4 R1 Finn attack with Force (no Surge) + Blasting declared: Nerve 3 + Force 2 | 5d6 | faces: 4 3 2 2 5 | 2 succ, 0 six vs Diff 2 | SUCCESS
V059 | D4 R1 Ivy Blast (1 Magic) + Blasting declared: Craft 3 + Flame 2 | 5d6 | faces: 4 2 1 4 2 | 2 succ, 0 six vs Diff 2 | SUCCESS
V060 | D5 R1 (public, Weakness known, Nell in grip) Finn frees with Force + Force Surge (2 Magic): Nerve 3 + Force 2 + own Magic 1 vs Defence 2 | 6d6 | faces: 1 4 2 1 6 6 | 3 succ, 2 six vs Diff 2 | CRITICAL
V061 | D5 R1 Rosa Bind (1 Magic): Craft 2 + own Magic 2 vs Defence 2 | 4d6 | faces: 2 3 4 6 | 2 succ, 1 six vs Diff 2 | SUCCESS
V062 | D5 R1 Ivy Blast (1 Magic) after using a Binding potion: Craft 3 + Flame 2 vs Defence 2 | 5d6 | faces: 3 2 2 4 3 | 1 succ, 0 six vs Diff 2 | PARTIAL
V063 | D5 R1 threat's one remaining attack (1 of 2 lost): target d6 | 1d6 | faces: 1
V064 | D5 R1 Ivy defends: Nerve 2 vs Danger 3 | 2d6 | faces: 3 4 | 1 succ, 0 six vs Diff 3 | FAILURE
V065 | D6a S2 Finn talking lead (city): Heart 2 + Life 1 + own Magic 1 (limit reached) + Sense 1 (Thistle, 1 Ward) | 5d6 | faces: 5 5 2 6 5 | 4 succ, 1 six vs Diff 2 | SUCCESS
V066 | D6b S2 Ivy talking lead (city), no Power: Heart 2 + own Magic 1 + Sense 1 (Thistle, 1 Ward) | 4d6 | faces: 5 5 6 4 | 4 succ, 1 six vs Diff 2 | SUCCESS
V067 | D7a R1 (hidden, no Weakness, Defence 3) Ivy Shelter on Rosa (1 Magic): Craft 3 vs 2 | 3d6 | faces: 6 6 3 | 2 succ, 2 six vs Diff 2 | CRITICAL
V068 | D7a R1 Rosa (Sheltered) attack: Nerve 2 vs Defence 3 | 2d6 | faces: 3 5 | 1 succ, 0 six vs Diff 3 | FAILURE
V069 | D7a R1 Finn attack with Force: Nerve 3 + Force 2 vs Defence 3 | 5d6 | faces: 5 1 4 1 1 | 2 succ, 0 six vs Diff 3 | PARTIAL
V070 | D7a R1 threat attack 1 target d6 | 1d6 | faces: 5
V071 | D7a R1 threat attack 2 target d6 | 1d6 | faces: 2
V072 | D7a R1 Storyteller's tie pick for attack 1, most hurt Rosa 1 / Finn 1 (odd Rosa, even Finn) | 1d6 | faces: 4
V073 | D7a R1 Finn defends attack 1: Nerve 3 vs Danger 3 | 3d6 | faces: 1 1 3 | 0 succ, 0 six vs Diff 3 | FAILURE
V074 | D7a R1 Finn defends attack 2: Nerve 3 vs Danger 3 | 3d6 | faces: 4 2 3 | 1 succ, 0 six vs Diff 3 | FAILURE
V075 | D7b R2 Ivy Shelter on Thistle (1 Magic): Craft 3 + Critical's next-roll die 1 vs 2 | 4d6 | faces: 5 2 1 1 | 1 succ, 0 six vs Diff 2 | PARTIAL
V076 | D7b R2 Rosa attack: Nerve 2 vs Defence 3 | 2d6 | faces: 5 6 | 2 succ, 1 six vs Diff 3 | PARTIAL
V077 | D7b R2 threat attack 1 target d6 | 1d6 | faces: 2
V078 | D7b R2 threat attack 2 target d6 | 1d6 | faces: 2
V079 | D8 R2 (public, Weakness known, Nell free and unguarded) Thistle Hold: Nerve 2 vs Defence 2 | 2d6 | faces: 2 4 | 1 succ, 0 six vs Diff 2 | PARTIAL
V080 | D8 R2 threat attack 1 d6 (Held: goes to Thistle unless 6 = take Nell) | 1d6 | faces: 3
V081 | D8 R2 threat attack 2 target d6 | 1d6 | faces: 6
V082 | D8 R2 Thistle defends the Held attack: Nerve 2 + own Ward 1 vs Danger 3 | 3d6 | faces: 3 6 5 | 2 succ, 1 six vs Diff 3 | PARTIAL
V083 | D9 R1 (public, no Weakness, Defence 3, Nell in grip) Finn frees with Force: Nerve 3 + Force 2 + own Magic 1 vs Defence 3 | 6d6 | faces: 5 6 1 2 3 2 | 2 succ, 1 six vs Diff 3 | PARTIAL
V084 | D9 R1 Rosa frees: Nerve 2 + own Magic 1 + Ivy helps 1 Magic vs Defence 3 | 4d6 | faces: 2 4 2 1 | 1 succ, 0 six vs Diff 3 | FAILURE
V085 | D9 R1 Thistle frees: Nerve 2 + own Ward 2 vs Defence 3 | 4d6 | faces: 4 6 6 6 | 4 succ, 3 six vs Diff 3 | CRITICAL
V086 | D9 R1 threat attack 1 target d6 (Nell free, Ivy guarding) | 1d6 | faces: 2
V087 | D9 R1 threat attack 2 target d6 | 1d6 | faces: 4
V088 | D9 R1 Storyteller tie pick attack 1, Finn 1 / Rosa 1 (odd Finn, even Rosa) | 1d6 | faces: 1
V089 | D9 R1 Storyteller tie pick attack 2, Finn / Rosa (odd Finn, even Rosa) | 1d6 | faces: 6
V090 | D9 R1 Finn defends attack 1: Nerve 3 vs Danger 3 | 3d6 | faces: 3 6 4 | 2 succ, 1 six vs Diff 3 | PARTIAL
V091 | D9 R1 Finn defends attack 2 (now most hurt): Nerve 3 + own Magic 1 vs Danger 3 | 4d6 | faces: 5 4 1 3 | 2 succ, 0 six vs Diff 3 | PARTIAL
V092 | D9 R2 Ivy Blast (1 Magic, ends her guard): Craft 3 + Flame 2 vs Defence 3 | 5d6 | faces: 1 3 2 5 1 | 1 succ, 0 six vs Diff 3 | FAILURE
V093 | D9 R2 Rosa attack: Nerve 2 + own Magic 1 vs Defence 3 | 3d6 | faces: 3 6 4 | 2 succ, 1 six vs Diff 3 | PARTIAL
V094 | D9 R2 threat attack 1 target d6 (Nell free, Thistle guarding) | 1d6 | faces: 2
V095 | D9 R2 threat attack 2 target d6 | 1d6 | faces: 2
V096 | D9 R2 Rosa defends attack 1 with Sight: Nerve 2 + Sight 2 vs Danger 3 | 4d6 | faces: 5 6 6 6 | 4 succ, 3 six vs Diff 3 | CRITICAL
V097 | D9 R2 Rosa defends attack 2 with Sight: Nerve 2 + Sight 2 vs Danger 3 | 4d6 | faces: 2 5 5 4 | 3 succ, 0 six vs Diff 3 | SUCCESS
V098 | D10 R3 (public, Weakness known, Toughness 6/12; Rosa and Finn Down) Ivy at Hurt 3 Blast (1 Magic): Craft 3 + Flame 2 + Rosa helps 1 + Finn helps 1 (both Down) vs Defence 2 | 7d6 | faces: 1 5 6 1 1 6 4 | 4 succ, 2 six vs Diff 2 | CRITICAL
V099 | D10 R3 Thistle (Hurt 2/5, Ward 0) Hold: Nerve 2 vs Defence 2 | 2d6 | faces: 4 4 | 2 succ, 0 six vs Diff 2 | SUCCESS
V100 | D10 R3 threat attack 1 target d6 | 1d6 | faces: 1
V101 | D10 R3 threat attack 2 target d6 | 1d6 | faces: 4
V102 | D10 R3 Thistle defends Held attack 1: Nerve 2 vs Danger 3 | 2d6 | faces: 2 1 | 0 succ, 0 six vs Diff 3 | FAILURE
V103 | D10 R3 Ivy defends attack 2: Nerve 2 + own Magic 2 vs Danger 3 | 4d6 | faces: 4 2 3 5 | 2 succ, 0 six vs Diff 3 | PARTIAL
V104 | D11 Ep3 R1 (Toughness 15, Weakness known) Finn attack + Force Surge: Nerve 4 + Force 2 vs Defence 2 | 6d6 | faces: 1 1 3 3 4 5 | 2 succ, 0 six vs Diff 2 | SUCCESS
V105 | D11 Ep3 R1 Ivy Blast + Flame Surge + Blasting: Craft 4 + Flame 2 vs Defence 2 | 6d6 | faces: 3 4 2 1 6 3 | 2 succ, 1 six vs Diff 2 | SUCCESS
V106 | D11 Ep3 R1 Rosa attack: Nerve 2 + own Magic 1 + Thistle helps 1 vs Defence 2 | 4d6 | faces: 2 5 6 2 | 2 succ, 1 six vs Diff 2 | SUCCESS
V107 | D11 Ep3 R1 threat's one attack (other lost to Force): target d6 | 1d6 | faces: 5
V108 | D11 Ep3 R1 Thistle Shields the attack on Ivy (1 Ward) and defends: Nerve 2 + own Ward 1 vs Danger 3 | 3d6 | faces: 4 5 1 | 2 succ, 0 six vs Diff 3 | PARTIAL
V109 | D11 Ep3 R2 Rosa attack: Nerve 2 vs Defence 2 | 2d6 | faces: 1 4 | 1 succ, 0 six vs Diff 2 | PARTIAL
V110 | D11 Ep3 R2 Unmaking: Ivy leads Craft 4 + Finn joins 2 + helpers Rosa 1 Magic, Thistle 1 Ward vs Diff 3 | 8d6 | faces: 4 2 1 4 2 4 5 1 | 4 succ, 0 six vs Diff 3 | SUCCESS
```

**Exact odds used in N1** (worked out by listing every face combination, not by rolling): with the Weakness, Finn (5 dice: 3 damage on a success, 2 on a Partial), Ivy (5 dice: 8 / 7 with Blast, Flame's Surge and one Blasting) and Rosa (4 dice: 3 / 2) reach 12 damage in round 1 with probability 0.898. With a Blasting potion each, 0.965 (and 0.883 against 15 Toughness). Without the Weakness (Defence 3), 0.072.
