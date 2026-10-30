# Playtest A: first night (core rules v0.4)

- **Rules used:** `docs/CORE-RULES.md` v0.4 only. Nothing else was treated as a rule.
- **Table:** a Storyteller who has read the page once, and 3 brand-new players. Easy. No guardian player.
- **Dice:** every roll came from a script (`Math.random`) and is listed in section 7.
- **Result:** **Win.** The threat was destroyed in round 2 of a hidden showdown, and the innocent was safe. Exposure ended at 1 of 5.

---

## 1. Setup and setup time

### The numbers for this table (Easy, w = 3, n = 3)

| Item | Value | How it was worked out |
|---|---|---|
| Lead Difficulty | 1 | table |
| Threat Defence / Attack / Hit | 1 / 1 / 2 | table; Defence is 2 until the Weakness is known |
| Toughness | 12 | 3 × 3 = 9, plus 3 "against 3 characters" |
| Attacks a round | 1 | "1 attack a round against 3 characters" |
| Clues needed | 9 (half = 5) | 3 × 3; half of 9 rounded up |
| Exposure boxes | 5 | table |
| Doom | 12, mark at 5 | Tracks |
| Vanquish Difficulty | 3 (5 without the Weakness) | number of witches, +2 |

### The witches

Powers were rolled on a d6 (1 Force, 2 Flame, 3 Sight, 4 Voice, 5 Veil, 6 Wild): 3, 2, 4. No duplicates, so no rerolls.

| Witch | Power | Heart | Wits | Nerve | Craft | Life | Hurt | Magic |
|---|---|---|---|---|---|---|---|---|
| Mara Quill | Sight | 2 | **3** | 2 | 1 | night-shift nurse | 0 / 4 | 5 |
| Dee Okafor | Flame | 1 | 2 | **3** | 2 | line cook at an all-night diner | 0 / 4 | 5 |
| Jun Park | Voice | **3** | 1 | 2 | 2 | student reporter on the campus paper | 0 / 4 | 5 |

Ratings followed each Power: Sight fits leads, so Wits 3; Flame fits attacks, so Nerve 3; Voice fits talking leads and Hide, so Heart 3 and Craft 2. Nobody has Craft 3, so the Vanquish leader rolls only 2 dice of their own.

### The threat and the innocent

- **The Hush:** a spirit that steals sleep. **Plan:** at Doom 12 it takes the innocent's last breath and wears him.
- **Weakness:** iron and the sound of a bell.
- **Signature move** (the page gives none, see Issue 5): *Lullaby*, an attack on the witch with the most Magic left; on a Failure they also lose 1 Magic.
- **Target table** (from the page): 1–3 whoever hurt it last; 4–5 whoever is most hurt and still standing; 6 the signature move, or the innocent if they are there and free.
- **Innocent:** Ben Ashby, a violinist who busks in the Calder Street underpass.

### Setup time (estimate)

| Step | Minutes | Notes |
|---|---|---|
| Storyteller reads the page and glossary (before the night) | 15 | About 2,550 words. Not counted below. |
| Storyteller makes a threat and an innocent | 15 | Four look-ups and two sums (9 + 3 Toughness; half of 9). Has to invent a signature move. Not counted below if done ahead. |
| Explain the game to 3 new players | 12 | The roll, Partials, the cost line, the +2 cap, Magic as points versus Magic as a kind of action, the scene loop, Lives, half and all Clues, the mark, Exposure. |
| Make 3 witches | 12 | Roll Powers (1). Ratings (2–3 each, mostly "what does my Power fit?"). Invent a Life and a name. Copy Power text onto paper, since there is no sheet. |
| Draw trackers on paper | 5 | Doom, Exposure, Clues, Toughness, the innocent, Hurt and Magic. |
| **Total at the table** | **about 30** | **About 45 if the threat is made at the table.** That is right at or over the 30-minute target (DESIGN-RULES A27). Ready-made witches and a printed tracker would cut it to about 15. |

### What the table needs to print or track

- **Per player, a witch sheet:** four ratings; Power with what it fits and its Surge; Life and what it fits; 4 Hurt boxes; a Magic track that goes to 6 (a Life can push it past 5); potions held; a "Life called / answered" box; a "Surge used this scene" box.
- **Episode tracker:** Doom 1–12 with the mark at 5; Exposure boxes (5 at Easy); Clues 1–9 with the half mark at 5; the threat's Toughness (12 boxes); a "Weakness known" box that changes Defence; the innocent (held / free / guarded / lost / safe); "guardian called" (once per episode); round order (actions, threat, Exposure, Doom).
- **Threat card:** stats, target table, signature move, Weakness, plan.
- **Reference card per player:** spells, potions, the six Powers, what a Critical does for each kind of roll.
- **Dice:** 8 six-sided dice per player covers the biggest pools seen (the Vanquish leader: 2 + 4 joiner dice + 2 extra = 8; an attack: 3 + 2 + 2 = 7). The Storyteller needs 1–2 dice for the target table and tie-breaks. No second colour is needed.
- **Tokens:** about 18 Magic tokens, and something to stand for potions.

---

## 2. Play log

Track line format: **Doom / Exposure / Clues**, then each witch's Hurt and Magic. Roll IDs (A004 and so on) match section 7.

### Opening

A night-bus driver is found at the Larkin Street depot, asleep, and nobody can wake him. The Hush has struck.

**Tracks:** Doom 0/12 · Exposure 0/5 · Clues 0/9 · Mara H0 M5 · Dee H0 M5 · Jun H0 M5.

> **Newcomer question:** "When does my Life call?" The page doesn't say (Issue 3). **Ruling:** the Storyteller calls one Life at the start of each of the first three scenes. A witch can answer in that scene or any later scene before the showdown, once.

### Scene 1

Dee's Life calls: the diner is short-staffed.

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Mara | Lead: visits the sleeping driver at her own hospital | Wits 3 + Sight 2 + Life 1 = 6 vs 1 | A004 | Success: +1 Clue |
| Jun | Talking lead: interviews depot staff | Heart 3 + Voice 2 = 5 vs 1 | A005 | Success: +1 Clue |
| Dee | Answers her Life | no roll | — | +1 Magic (6) |

Then Doom +1.

- **Newcomer question:** "Does using Sight cost me Magic?" The page uses "Magic" for both the points and for using a Power (Issue 4). **Ruling:** a Power costs nothing to use; only its Surge costs Magic. It still counts as magic for Exposure.
- **Missed:** Jun's player forgot to ask for his Life die (a student reporter interviewing people fits). Nothing changed, since the roll succeeded, but the sheet should list what a Life fits (Issue 3).
- **Newcomer question:** "Can I go above 5 Magic?" (Issue 25). **Ruling:** yes.

**Tracks after scene 1:** Doom 1 · Exposure 0 · Clues 2 · Mara H0 M5 · Dee H0 M6 · Jun H0 M5 · Potions: none.

### Scene 2

Jun's Life calls: a story is due for the campus paper.

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Mara | Researches the Book at home | Wits 3 + Sight 2 + Book 1 = 6 vs 1 | A006 | Success: +1 Clue |
| Mara | Also brews Healing (the researcher's extra brew) | Craft 1 vs 1 | A007 | Failure: 1 Hurt |
| Dee | Searching lead in the bus yard | Wits 2 vs 1 | A008 | Failure: 1 Hurt, no Clue |
| Jun | Answers his Life | no roll | — | +1 Magic (6) |

Then Doom +1.

- **Gap:** "research the Book" gives +1 die but doesn't say what it rolls against or what it finds (Issue 2). **Ruling:** it is a lead done at home (Wits +1 die against the Lead Difficulty, Clues as a lead). *Other reading:* research gives no Clues on its own, just a die for later. Then Mara's three research rolls give nothing, the investigation needs about two more scenes, and Doom reaches the mark first. That turns this Win into a public fight with Ben held.
- **Newcomer question:** "I get hurt for failing to brew? And Dee gets hurt for not finding anything in a bus yard?" Yes. The cost line gives 1 Hurt for any failure that isn't magic out in the city (Issue 14).
- **Newcomer question:** "Is Sight allowed on Book research?" **Ruling:** yes. Sight fits leads, and research is a lead.

**Tracks after scene 2:** Doom 2 · Exposure 0 · Clues 3 · Mara H1 M5 · Dee H1 M6 · Jun H0 M6 · Potions: none.

### Scene 3

Mara's Life calls: an extra shift. She is the best researcher, so she lets it wait.

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Mara | Researches the Book | Wits 3 + Sight 2 + Book 1 = 6 vs 1 | A009 | Success: +1 Clue |
| Mara | Also brews Blasting | Craft 1 vs 1 | A010 | Failure: 1 Hurt |
| Jun | Talking lead: Ben's busker friends | Heart 3 + Voice 2 = 5 vs 1 | A011 | Success: +1 Clue |
| Dee | Brews Healing at home | Craft 2 vs 1 | A012 | Success: 2 Healing potions |

Then Doom +1.

Clues reach 5, half of 9. The coven knows it is the Hush and that it nests under the Calder Street underpass.

- **Choice:** go now, or push for the Weakness? Doom is 3, so one more scene is safe (Doom 4). The players push.
- **Newcomer question:** "If we wait two scenes, does the threat still come to us at 5, even though we already know where it is?" The page says both "if Doom reaches the mark first" and "reaching the mark starts the showdown" (Issue 1). **Ruling:** yes, reaching 5 always starts the showdown, so they must go after one more scene.

**Tracks after scene 3:** Doom 3 · Exposure 0 · Clues 5 (half) · Mara H2 M5 · Dee H1 M6 · Jun H0 M6 · Potions: Healing ×2 (Dee).

### Scene 4

Mara drinks a Healing potion before acting (no action): Hurt 2 → 0.

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Mara | Researches the Book | 6 vs 1 | A013 | Success: +1 Clue (6) |
| Mara | Also brews Blasting | Craft 1 vs 1 | A014 | Success: 2 Blasting potions |
| Jun | Casts Reveal in the old subway (1 Magic) | Craft 2 vs 1 | A015 | Failure: magic out in the city, Exposure +1 |
| Dee | Casts Reveal at the depot (1 Magic) | Craft 2 vs 1 | A016 | **Critical:** 2 Clues for a lead's Critical, +1 for Reveal = 3 (9) |

Then Doom +1.

All 9 Clues: the Weakness is known.

- **Rulings:**
  - Mara could drink a potion during the investigation, though "one a round" only talks about rounds (Issue 10).
  - A Critical Reveal gives 3 Clues (Issue 22). *Other reading:* 2 Clues. Then Clues end at 8, there is no Weakness, the showdown runs at Defence 2 with a Vanquish at Difficulty 5, and it plays much like Drill 5.
- **Newcomer question:** "Can we make it home and brew first?" Any more scenes would push Doom to 5. They go now.
- **Newcomer question:** "Does going take a scene?" The page doesn't say (Issue 1). **Ruling:** no. Going is what happens next. *Other reading:* if going took a scene, Doom would reach 5 on the way, and the threat would come to them in public.

**Tracks after scene 4:** Doom 4 · Exposure 1 · Clues 9 (Weakness known) · Mara H0 M5 · Dee H1 M5 · Jun H0 M5 · Potions: Healing ×1, Blasting ×2. Mara's Life is unanswered.

### Showdown (hidden place: a sealed platform under the underpass; Ben is not there)

**Start:**
- Mara's Life was never answered, so she loses 1 Magic (5 → 4).
- Potions are handed out (Issue 10, ruling: potions can be handed over outside a round): Dee Blasting, Mara Blasting, Jun Healing.
- **Threat:** Defence 1, Attack 1, Hit 2, Toughness 0/12. Vanquish Difficulty 3.

#### Round 1

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Dee | Blast with Flame and Surge (1 + 2 Magic) | Craft 2 + Flame 2 = 4 vs 1 | A017 | Success: 2 + 1 (Blast) + 1 (Weakness) + 2 (Surge) = **6** |
| Dee | Throws Blasting (no action) | no roll | — | 2 damage (Toughness 8) |
| Mara | Attacks with a thrown iron bell | Nerve 2 vs 1 | A018 | Success: 2 + 1 (Weakness) = 3 (Toughness 11) |
| Mara | Throws Blasting (no action) | no roll | — | 2 damage: Toughness full, **Broken** |
| Jun | Leads the Vanquish alone; spends 1 of his own Magic; Mara helps for 1 Magic | Craft 2 + 1 + 1 = 4 vs 3 | A019 | Failure: it holds on |

Then:
- **Threat:** Broken, so no attack.
- **Exposure:** hidden place, no rise.
- **Doom:** Broken, no rise.

**Rulings this round:**
- **Surge** is paid before the roll (Issue 19).
- **Blasting potions** do a flat 2 with no Weakness bonus (Issue 18). *Other reading:* 3 each. That's 15 damage instead of 13, with the same outcome.
- **Mara helped** the Vanquish after she had already acted, since helping needs no action (Issue 11). *Other reading:* if a witch who has acted can't help, Jun rolls 3 dice, not 4. It still almost surely fails, so nothing changes.
- **The failed Vanquish** costs no Hurt ("no other cost", Issue 13).

**Newcomer question:** "It never got to hit us?" Correct. It broke before its first attack.

**Tracks after round 1:** Doom 4 · Exposure 1 · Clues 9 · Toughness 12/12 (Broken; flees at the end of round 2) · Mara H0 M3 · Dee H1 M2 · Jun H0 M3 · Potions: Healing ×1 (Jun).

#### Round 2

No retreat.

| Who | Action | Dice | Roll | Result |
|---|---|---|---|---|
| Jun leads; Dee and Mara join (1 Magic each); Jun spends his last 2 Magic | Vanquish | Craft 2 + 2 + 2 + 2 = 8 vs 3 | A020 | **Success: the Hush is destroyed** |

**Tracks at the end:** Doom 4 · Exposure 1 · Clues 9 · Toughness 12/12 (destroyed) · Mara H0 M2 · Dee H1 M1 · Jun H0 M0 · Potions: Healing ×1 (spoils).

### Closing

- Ben wakes up rested and never knew he was the target. The driver wakes too.
- **Result: Win** (destroyed, innocent safe, not Seen).
- **Carry-over:** the Hush gets a page in the Book. No Scars. One Healing potion spoils. Mara, Dee and Jun lose 2, 1 and 0 unspent Magic.

### Summary

| | Value |
|---|---|
| Scenes | 4 |
| Showdown rounds | 2 |
| Threat attacks made | 0 |
| Doom at the end | 4 / 12 (never reached the mark) |
| Exposure at the end | 1 / 5 |
| Magic | 17 in all (15 + 2 from Lives): 13 spent, 1 lost to the unanswered Life, 3 left unspent |
| Potions | 4 brewed, 3 used, 1 spoiled |
| Guardian call | not used |
| Witches Down | none |
| Episode rolls (A004–A020) | 17: 11 Successes, 1 Critical (6%), 0 Partials, 5 Failures (29%) |

---

## 3. Issues

Severity: **blocker** = the text gives opposite answers on something that changes the result; **confusing** = a new table must stop and invent a ruling; **minor** = wording or a gap that rarely matters.

| # | Severity | Exact passage | What happened | Suggested fix | Ruling to use tonight |
|---|---|---|---|---|---|
| 1 | **blocker** | "With half the Clues … may **go to it** … If Doom reaches the **Showdown mark** (5) first, the threat **comes to them**" and, in Tracks, "Reaching the mark (5) starts the showdown" | Drill 6: Clues reached half during the same scene in which Doom then reached 5. One passage says the coven got there first and may go to it (hidden, no innocent). The other says the showdown starts in public with the innocent held. It also doesn't say when the coven decides to go, or whether going takes a scene. Scene 3 raised the same question. | One sentence, for example: "At the end of a scene, after Doom rises: if the coven has half the Clues, it may go to it now. If it doesn't, and Doom is at the mark, the threat comes to them. Going takes no scene." | Clues found in a scene count before that scene's Doom rise. The coven may go to it at the end of any scene with half the Clues. Otherwise Doom 5 brings the threat. |
| 2 | confusing | "research the **Book** at home (Wits +1 die; one character per scene; they may also brew one potion that scene)" | It doesn't say what the roll is against or what it gives. Mara researched three times. | "Research the Book at home: a lead (Wits +1 die) …" | It's a lead at home: Wits +1 die against the Lead Difficulty, with Clues as for a lead. |
| 3 | confusing | "Each witch's Life calls once per episode; if they haven't answered it by the showdown, they lose 1 Magic." and "your Life (+1 when it fits)" | Nobody knew when a Life calls, who decides, whether it can be answered early or twice, or who decides when a Life "fits". Jun's player forgot his Life die on interviews. | Say who calls it and when (for example, "the Storyteller calls each Life at the start of one of the first three scenes"), and that it's answered once. Give each Life a "fits" line on the sheet. | The Storyteller calls one Life per scene in scenes 1–3. It can be answered once, in that scene or later. The Storyteller says when a Life fits. |
| 4 | confusing | "**Magic** means a Power, a spell, a potion or a guardian gift." and "5 **Magic** each episode" (the glossary gives two meanings) | The same word means points and a kind of action, which breaks A16. New players asked: "Does my Power cost Magic?" and "Is helping (paid with Magic) using magic, for Exposure?" | Rename the points (pick a word checked against the show list and Richard's other books), or rename the category ("spellwork"). | Powers cost no points (only a Surge does). Helping is not magic for Exposure. |
| 5 | confusing | "**6** its signature move" | The page never says what a signature move does or how strong it should be. A table making its own threat must invent it. (No 6 came up tonight.) | Give a default, for example "Signature move: one attack with Hit +1" or "one attack on every standing character", and a strength guide. | Use "one attack on the witch with the most Magic left; on a Failure they also lose 1 Magic". |
| 6 | confusing | "**1–3** it attacks whoever hurt it last; **4–5** whoever is most hurt and still standing" | It doesn't cover round 1 when nobody has hurt it yet (likely when everyone tries to free the innocent), ties (Drill 1 round 3: Mara and Dee both at 3), or a last attacker who is now Down (Drill 4). This is A13's "there is none" case. | Add: "If there's no such target, use the next line down. Ties: roll among them." | Nobody yet, or that witch is Down: use 4–5. A tie: roll a die among the tied. |
| 7 | confusing | "**free** or **guard** the innocent" | It doesn't say how long a guard lasts, or whether it needs an action every round. Jun guarded for three rounds, then stopped to lead the Vanquish. | "Guard (action): until your next action, if the threat goes for the innocent, it attacks you instead." | Guarding is that round's action and lasts until the guard's next action. |
| 8 | confusing | "or **takes them** if nobody is guarding them" and "If they're still held at the end of the first round, they're lost." | It doesn't say what happens if a freed innocent is taken in round 2 or later: lost at once, held again and freeable, or lost at the end of that round. | State it. The design log (Q7) says "lost if the threat takes them during a fight". | Taken means held again; if still held at the end of that round, they're lost. (*Other reading:* lost at once, which is much harsher.) |
| 9 | confusing | "**No guardian player:** once per episode, the coven may call it for one Mend or one Carry." | It doesn't say whether calling uses a witch's action, whether it rolls or costs Ward, whether it counts as magic in public, or whether it works in the investigation. Drill 4 called it to Mend a Down witch. | "Calling it takes no action and no roll; it counts as magic." | No action, no roll, no cost. It counts as magic, so it raises Exposure in public. Usable in a scene or a round. |
| 10 | confusing | "Using one takes no action, but each character can use only one a round." | It doesn't say who holds brewed potions, whether they can be handed over, whether you can use one on someone else, whether a Down witch can drink one ("can't act"), or what "a round" means in the investigation. | "The brewer holds them and can hand them over. You can use one on someone next to you; it counts as your one this round (or scene)." | Potions can be handed over outside a round. A witch may use one on a neighbour, Down or not. A Down witch can't use one herself. One per scene in the investigation. |
| 11 | confusing | "helpers (1 Magic or Ward each, no action needed)" and "Every other witch may join for 1 Magic (a standing witch uses their action …)" | Mara helped Jun's Vanquish after she had already acted. In Drill 5 Mara both joined and helped. It isn't clear whether that's allowed, or whether helping is a cheap way round "joining uses your action". | Say whether helpers can add to the Vanquish, and whether a joiner can also help. | Yes to both, inside the +2 limit. |
| 12 | confusing | "**Critical:** a success that shows two or more 6s; it does one thing extra." | Mara rolled a Critical defence and Jun a Critical free. The page names the extra for leads, attacks, brewing and Hide, but not for defence, freeing, study, Bind, Shelter or the Vanquish. | Add a default: "If no extra is listed, +1 die on your next roll" (or gain 1 Magic). | No extra beyond the story. |
| 13 | confusing | "only a success frees them" and the Vanquish: "On a Partial or Failure it holds on, with no other cost" | A Partial "works, with a cost", but here it doesn't work. Drill 2b: Mara's Partial free. Does it still cost 1 Hurt? And "no other cost" on the Vanquish: other than what? | "A Partial on a free counts as a Failure." "A failed Vanquish costs no Hurt." | A Partial free doesn't free and costs 1 Hurt. A failed Vanquish costs only the Magic paid. |
| 14 | minor | "**Cost:** in a showdown, 1 Hurt. Otherwise, Exposure +1 if you used magic out in the city, or else 1 Hurt." | Mara took 2 Hurt from failed brews at home, and Dee 1 Hurt from a failed search. New players found Hurt for reading or brewing strange. It's also the only Hurt anyone took all episode. | Keep it, but say it where it applies ("a failed brew burns: 1 Hurt"), or give home failures a different cost. | As written: 1 Hurt. |
| 15 | minor | "The Storyteller sets the **Difficulty** (1–4)." (the glossary repeats 1–4) | The Vanquish without the Weakness is Difficulty 5 for 3 witches (Drill 5), and up to 7 for 5 witches. | "(usually 1–4; the Vanquish can be higher)". | Follow the Vanquish line. |
| 16 | minor | "**Partial:** at least half the Difficulty (round up), but less than all of it." | At Difficulty 1 there's no Partial. Every Easy lead, brew and defence is all or nothing (0 Partials in 17 episode rolls). "A Partial 1 with a cost" on a lead never happens at Easy. A new player asked. | Add: "At Difficulty 1 there is no Partial." | As written. |
| 17 | minor | "**Down** (can't act …)" and "rest (clear all Hurt; the one action a Down character can take)" | The two lines disagree on whether a Down witch can act. | "Down: no actions except rest in the investigation." | A Down witch may rest in a scene and nothing else. |
| 18 | minor | "Once it knows it, attacks that work do 1 more damage." | Do Blasting potions (no roll) or a Blast count? Does a Partial attack ("it works") get the +1? | Name them: "attack rolls that work, including Blast; not potions". | Attack rolls (including Blast and Partials) get +1; potions don't. |
| 19 | minor | "Once per scene its **Surge** (2 Magic, added to an action using the Power) does more, on a Partial or better" | It doesn't say whether the Magic is paid before the roll, or whether it and the once-per-scene use are lost on a Failure. | "Say it before you roll; the Magic and the use are spent either way." | Declared and paid before the roll; spent even on a Failure. |
| 20 | minor | "**Exposure:** when full [T], the coven is **Seen**; it stays full for the rest of the episode." | Drill 3: once Seen, magic in public and magic failures in the city cost nothing more (the extra Exposure goes nowhere). That's a free spend (A5). Seen also does nothing until the end. | "When Exposure is full, any further Exposure cost is 1 Hurt instead." | As written: extra Exposure is lost. |
| 21 | minor | "**Hide** (Difficulty 2): Exposure −1" with "Partial … works, with a cost" | Out in the city, a Partial Hide gives −1 then +1 for using magic: 1 Magic for nothing. (Found while reading; Hide wasn't cast.) | "Hide's cost is 1 Hurt." | As written (net 0). |
| 22 | minor | "**Reveal** … a success gives 1 more Clue." | Dee's Critical Reveal: is it the lead's 2 + 1 = 3, or just 2? It decided whether the Weakness was found. | "A Critical Reveal gives 3." | 3 Clues. |
| 23 | minor | "**Broken:** it stops attacking" and "taking them isn't an attack" | Drill 5: Jun stopped guarding to lead the Vanquish. Can a Broken threat still take a free, unguarded innocent? | "A Broken threat makes no moves." | No. It makes no rolls once Broken. |
| 24 | minor | "Each witch also has one **Power** (Force, Flame, Sight, Voice, Veil or Wild), a **Life** (a job or role)" and "talking leads", "searching leads" | The page doesn't say whether to roll or pick a Power, whether two witches can share one, or what Lives exist. "Talking" and "searching" leads aren't defined. | Add the d6 order and "reroll a Power someone has". Add a d6 Life table. Say "talking lead = Heart, searching lead = Wits". | Roll in the listed order and reroll duplicates. Talking = Heart, searching = Wits. Sight and Wild fit all leads. |
| 25 | minor | "5 **Magic** each episode" and "gain 1 Magic" / "they lose 1 Magic" | Dee and Jun went to 6. A witch at 0 Magic loses nothing for an unanswered Life, so it's free (A5). | State "no cap", and what happens at 0 (for example, 1 Hurt instead). | No cap. At 0, nothing more is lost. |
| 26 | minor | "when full, the threat's plan is complete and it escapes with the innocent" and "the showdown is in a hidden place, and the innocent isn't there" | If Doom fills in a hidden showdown, the innocent isn't there to escape with. The result is a Loss either way, so this is wording only. | "… and the innocent is lost." | The innocent is lost; the result is a Loss. |

---

## 4. Drills

All drills use the same coven and the same Easy threat, with fresh dice. Each starts from a stated set-up, not from the episode.

### Drill 1: the threat comes to them at the mark, with the innocent held

- **Set-up:** Doom reached 5 at the end of a scene, with Clues at 4 of 9 (under half). The showdown starts at once in a public place (the Calder Street night market), with the Hush holding Ben.
- **Threat:** Defence 2 (no Weakness), Attack 1, Toughness 0/12, Vanquish Difficulty 5.
- **Tracks at the start:** Exposure 4/5 · Mara H1 M4 · Dee H2 M4 (Blasting ×2) · Jun H2 M4 (Healing ×1). Guardian call unused.

| Round | Who | Action | Roll | Result |
|---|---|---|---|---|
| 1 | Dee | Frees Ben: Nerve 3 + Mara helps 1 = 4 vs 2 | A021 | Success: Ben is free (Mara M3) |
| 1 | Jun | Guards Ben | — | — |
| 1 | Mara | Attacks: Nerve 2 vs 2 | A022 | Partial: 1 damage, 1 Hurt (Mara H2) |
| 1 | Threat | Target d6 | A023 = 2 | Whoever hurt it last: Mara |
| 1 | Mara | Defends without Sight, to keep Exposure off: Nerve 2 vs 1 | A024 | Critical: no Hurt (no extra stated, Issue 12) |

- **End of round 1:** no magic was used (helping isn't magic, Issue 4), so Exposure stays 4. Ben is free, so not lost. Doom 6.
- **Tracks:** Doom 6 · Exposure 4 · Toughness 1/12 · Mara H2 M3 · Dee H2 M4 · Jun H2 M4 (guarding).
- **Findings:**
  - The held-innocent opening is tense and clear: everyone knew round 1 was about Ben.
  - Exposure at 4 made a real choice. Mara chose a weaker defence to stay hidden.

### Drill 2: freeing the innocent

- **2a** is Drill 1 round 1: Dee (Nerve 3, plus 1 help) freed Ben on the first try.
- **2b** checks the weaker witches. If Dee isn't there, Mara and Jun (Nerve 2 each, Difficulty 2) try in round 1:
  - **Mara, A044:** Partial. "Only a success frees them", so no free, and 1 Hurt (Issue 13).
  - **Jun, A045:** Critical. Ben is free.
- **Finding:** with Nerve 2 against Defence 2, each try is only 25%, so two weak witches free the innocent about 44% of the time. A coven with no Nerve 3 or Force witch will often lose the innocent. That's a fair cost of letting Doom reach the mark, but players should be told it.

### Drill 3: Exposure fills (Seen)

This is the same fight as Drill 1, continued.

| Round | Who | Action | Roll | Result |
|---|---|---|---|---|
| 2 | Dee | Attacks with Flame + Surge (2 Magic): Nerve 3 + Flame 2 = 5 vs 2 | A025 | Success: 2 + 2 (Surge) = 4. Throws Blasting: 2. Toughness 7 |
| 2 | Mara | Studies the threat: Wits 3 + Sight 2 = 5 vs 2 | A026 | Failure: 1 Hurt (H3), no Clue |
| 2 | Jun | Guards Ben | — | — |
| 2 | Threat | Target d6 | A027 = 3 | Last hurt it: Dee |
| 2 | Dee | Defends: Nerve 3 vs 1 | A028 | Success: no Hurt |

- **End of round 2:** magic was used, so Exposure goes 4 → **5: Seen.** It stays full. Doom 7.
- **Tracks:** Doom 7 · Exposure 5 (Seen) · Toughness 7/12 · Mara H3 M3 · Dee H2 M2 (Blasting ×1) · Jun H2 M4 (guarding).
- **Findings:**
  - Once Seen, magic carries no further cost for the rest of the episode (Issue 20). Nobody held back after this.
  - **Not played, but worth testing:** actions resolve before Exposure. So a Voice or Veil witch who casts Hide every round cancels that round's rise (−1, then +1). In a showdown a Partial Hide still works (the cost is Hurt there), so it lands about 94% of the time for 1 Magic. It may become the standard public-fight tactic.

### Drill 3 continued: rounds 3 and 4 (these set up Drill 5)

| Round | Who | Action | Roll | Result |
|---|---|---|---|---|
| 3 | Dee | Attacks with Flame: 5 vs 2 | A029 | Failure (five 1s): 1 Hurt (H3). Throws Blasting: 2. Toughness 9 |
| 3 | Mara | Attacks: Nerve 2 vs 2 | A030 | Success: 2. Toughness 11 |
| 3 | Jun | Guards Ben | — | — |
| 3 | Threat | Target d6 | A031 = 5 | Most hurt: Mara 3 and Dee 3 tie (Issue 6) |
| 3 | Tie-break | d6, odd Mara, even Dee | A032 = 4 | Dee |
| 3 | Dee | Defends: Nerve 3 vs 1 | A033 | Success: no Hurt |
| 4 | Dee | Attacks with Flame: 5 vs 2 | A034 | Success: 2. Toughness 12/12, **Broken** (flees at the end of round 5) |

- **After round 3:** Doom 8 · Exposure 5 (Seen) · Toughness 11/12 · Mara H3 M3 · Dee H3 M2 · Jun H2 M4.
- **After Dee's round 4 attack:** Doom stops at 8. Ben was already free.

### Drill 5: a Vanquish that fails, and the threat flees

| Round | Who | Action | Roll | Result |
|---|---|---|---|---|
| 4 | Jun (stops guarding) leads; Mara joins; Jun spends 2 of his own Magic | Craft 2 + 2 + 2 = 6 vs 5 | A035 | Partial (3 successes, two 6s, so not a Critical): it holds on |
| 4 | Threat | Broken: no attack, no target roll, so it can't take the unguarded Ben (Issue 23) | — | — |
| 5 | Dee leads; Jun and Mara join; Dee spends 1 of her own Magic; Mara helps for 1 | Craft 2 + 2 + 2 + 1 + 1 = 8 vs 5 | A036 | Partial (3): it holds on |
| End of round 5 | — | The Hush flees | — | Episode ends |

- **Tracks at the end:** Doom 8 · Exposure 5 (Seen) · Toughness 12/12 · Mara H3 M0 · Dee H3 M0 · Jun H2 M0 · Ben safe.
- **Result:** fled = Partial; Seen drops it one step = **Loss**. Nobody is Down, so no Scars. Next time the Hush returns with 2 more Toughness. No Book page.
- **Findings:**
  - The "Broken stays until the end of the next round" window worked well. It gave two clear tries.
  - Without the Weakness, Difficulty 5 is hard for 3 witches (36% with all 8 dice). This is where a slow investigation really costs.
  - Seen turning "we saved Ben" into a Loss felt harsh but fair. Retreating at the start of round 5 would also have been a Loss, so losing wasn't better than fighting on (A4 holds).

### Drill 4: a witch goes Down, and the coven calls the guardian

- **Set-up:** a public fight in round 2. Doom 6 · Exposure 2 · Toughness 4/12 · Defence 2 · Mara H1 M3 · Dee H2 M3 · Jun H3 M3. Ben is free and unguarded. No potions. Guardian call unused.

| Who | Action | Roll | Result |
|---|---|---|---|
| Jun | Attacks at Hurt 3: Nerve 2 vs 2 | A037 | Partial: 1 damage (Toughness 5), 1 Hurt: Jun is **Down** (4/4) |
| Mara | Calls the guardian: Mend on Jun (Issue 9 ruling: no action, no roll) | — | Jun clears 2 Hurt (H2) and is back up. He has already acted this round |
| Mara | Guards Ben | — | — |
| Dee | Attacks with Flame: 5 vs 2 | A038 | Partial: 1 damage (Toughness 6), 1 Hurt (H3) |
| Threat | Target d6 | A039 = 4 | Most hurt standing: Dee (3) |
| Dee | Defends: Nerve 3 vs 1 | A040 | Success: no Hurt |

- **End of round:** magic was used (Flame, and the guardian's gift), so Exposure 2 → 3. Doom 7.
- **Tracks:** Doom 7 · Exposure 3 · Toughness 6/12 · Mara H1 M3 (guarding) · Dee H3 M3 · Jun H2 M3. Guardian call used.
- **Findings:**
  - A witch can put herself Down with her own Partial. It feels fair, and the cost line made it clear.
  - The one call is a real choice: using the Mend on Jun means no Carry for Ben later.
  - If the call is gone, a Down witch has to wait for someone to give her a Healing potion (rest isn't possible in a round). She can still help and join the Vanquish. A Down witch joins without spending an action, so being Down costs little at the Vanquish.

### Drill 6: a Life left unanswered (and the mark race)

- **Set-up:** the start of a scene with Doom 4 and Clues 3. With Doom starting at 0, this is really a fifth scene; the dice labels call it "S4". Jun's Life calls this scene, and he follows a lead instead.

| Who | Action | Roll | Result |
|---|---|---|---|
| Mara | Lead: Wits 3 + Sight 2 = 5 vs 1 | A041 | Success: Clues 4 |
| Dee | Lead: Wits 2 vs 1 | A042 | Success: Clues 5 (half) |
| Jun | Talking lead: Heart 3 + Voice 2 = 5 vs 1 | A043 | Success: Clues 6 |

- **Then:** Doom +1 → 5, the mark.
- **Ruling (Issue 1):** half the Clues came first, so the coven goes to it. The showdown is hidden, and Ben isn't there.
  - *Other reading* ("reaching the mark starts the showdown"): the threat comes to them in public, holding Ben, which is Drill 1. That's a very different night.
- **Life:** Jun never answered, so at the showdown he loses 1 Magic (5 → 4). Had he already spent down to 0, the loss would cost nothing (Issue 25).
- **Findings:**
  - A Life that calls in the last scene before the mark forces a hard choice (answer it or find the last Clue). That's good.
  - Players need to know that a late call is possible. In the main episode, Mara chose to skip hers and paid 1 Magic. That was felt, but small.

---

## 5. What worked

- **The roll is fast.** New players got it after one example. Difficulty 1 at Easy meant early wins, which is good for a first night.
- **The scene loop is easy to run:** everyone acts, then Doom +1. Doom as the single clock read clearly all night.
- **Half and all the Clues** gave a clear choice at Doom 3: go now, or push for the Weakness. The players talked it over, which is the point.
- **Lives pulled against the case.** Two players answered at once. One skipped hers to research and paid 1 Magic. Each was a real choice.
- **Exposure in public fights** forced choices (Drill 1: defend without Sight; Drill 3: go all in and accept Seen).
- **The held-innocent opening** (Drill 1) is tense and easy to explain.
- **The Vanquish felt like a team moment.** "Keep 2 Magic for the Vanquish" worked: everyone had Magic for it. The two-try window after Broken worked well.
- **The round order line** ("actions, then attacks, then Exposure, then Doom") answered several questions at once.
- **The Down rules** kept players in the game: a Down witch can still help and join.

---

## 6. How it felt

- **Was losing a real risk? Not in the episode.**
  - With 5–6 dice against Difficulty 1, leads almost never failed for the witches with a fitting Power. Half the Clues came in scene 3, and all of them in scene 4, at Doom 4.
  - The hidden showdown had no innocent and no Exposure at stake.
  - The Hush was Broken in round 1 before it ever acted: 6 (Blast, Surge and Weakness) + 2 + 3 + 2 (two Blasting potions) = 13 against 12 Toughness. **It made 0 attacks all episode.** The only Hurt anyone took came from their own failed rolls.
  - That fits the Easy target (about 90% wins), but the fight had no tension. It lasted 2 rounds, under the 3–5 round target.
  - **The drills show the risk is real** once Doom reaches the mark first: a public fight without the Weakness ended as a Loss (Seen, plus two failed Vanquish rolls at Difficulty 5).
- **Were resources spent?** Mostly.
  - **Magic:** 13 of 17 spent (76%), 1 lost to the Life, 3 left.
  - **Potions:** 3 of 4 used.
  - **Guardian call:** never needed.
- **Dominant tactics seen:**
  1. **Research plus the free brew.** The researcher gets a second roll every scene. Mara (Craft 1) still produced 2 Blasting potions.
  2. **Blasting potions.** No action, no roll, 2 damage each. Two of them did a third of the threat's Toughness in round 1.
  3. **Reveal at Easy.** Craft 2 against Difficulty 1 is 75% for 2 Clues, for 1 Magic. A Critical gave 3 Clues and ended the investigation.
  4. **Try the Vanquish twice.** Whoever hasn't acted tries in the breaking round, then everyone tries next round. The extra try costs only Magic.
  5. **Hide to cancel Exposure in public** (Drill 3 note; not played yet).
- **Powers in the investigation:**
  - Sight, Voice and Wild fit leads. Force and Flame fit nothing until the showdown.
  - Dee (Flame) had the weakest investigation: a plain Wits 2 lead failed, so she brewed and cast Reveal instead.
  - Not a bug, but every Power should have something to do in a scene.
- **How long it took:**
  - **Setup:** about 30 minutes (45 if the threat is made at the table).
  - **Play:** opening 3, four scenes at about 10 each (first-night questions), showdown about 15, closing 5. **About 65 minutes of play, and about 1 hour 45 with setup.**
  - With fuller roleplay in scenes, the episode would fill about 2 hours. At Easy it may still run short of a 2–3 hour session.
- **Roll results:**
  - **Episode** (17 rolls): 1 Critical (6%), 5 Failures (29%), 0 Partials. That's a small sample, and Easy has no Partials below Difficulty 2.
  - **Drills** (20 checks at Difficulty 1–5): 6 Partials, which feel very different.

---

## 7. Dice appendix (every roll, in order)

- **Script:** `node rollA.mjs "label" dice [difficulty]` (`Math.random`, faces 1–6). It counts 4–6 as successes and labels the result by the core rule: a Success needs successes ≥ Difficulty; a Critical is a Success with two or more 6s; a Partial needs at least half the Difficulty (rounded up).
- **Log note:** A004 and A005 were first written to a shared scratch log by mistake and copied here unchanged. Their faces are as rolled.

```
A001 | Setup: Witch 1 Power (1 Force,2 Flame,3 Sight,4 Voice,5 Veil,6 Wild) | 1d6 | faces: 3
A002 | Setup: Witch 2 Power | 1d6 | faces: 2
A003 | Setup: Witch 3 Power | 1d6 | faces: 4
A004 | S1 Mara lead at hospital: Wits 3 + Sight 2 + Life(nurse) 1 | 6 dice vs Diff 1 | faces: 3 3 2 2 4 2 | 1 succ, 0 six | SUCCESS
A005 | S1 Jun talking lead at depot: Heart 3 + Voice 2 | 5 dice vs Diff 1 | faces: 6 1 4 3 2 | 2 succ, 1 six | SUCCESS
A006 | S2 Mara researches the Book: Wits 3 + Sight 2 + Book 1 | 6 dice vs Diff 1 | faces: 1 1 1 5 2 4 | 2 succ, 0 six | SUCCESS
A007 | S2 Mara brews Healing (researcher's extra brew): Craft 1 | 1 dice vs Diff 1 | faces: 3 | 0 succ, 0 six | FAILURE
A008 | S2 Dee searching lead in bus yard: Wits 2 | 2 dice vs Diff 1 | faces: 1 3 | 0 succ, 0 six | FAILURE
A009 | S3 Mara researches the Book: Wits 3 + Sight 2 + Book 1 | 6 dice vs Diff 1 | faces: 1 1 5 4 6 1 | 3 succ, 1 six | SUCCESS
A010 | S3 Mara brews Blasting (researcher's extra brew): Craft 1 | 1 dice vs Diff 1 | faces: 2 | 0 succ, 0 six | FAILURE
A011 | S3 Jun talking lead (the violinist's friends): Heart 3 + Voice 2 | 5 dice vs Diff 1 | faces: 5 6 2 1 4 | 3 succ, 1 six | SUCCESS
A012 | S3 Dee brews Healing at home: Craft 2 | 2 dice vs Diff 1 | faces: 5 2 | 1 succ, 0 six | SUCCESS
A013 | S4 Mara researches the Book: Wits 3 + Sight 2 + Book 1 | 6 dice vs Diff 1 | faces: 3 2 4 3 3 4 | 2 succ, 0 six | SUCCESS
A014 | S4 Mara brews Blasting (researcher's extra brew): Craft 1 | 1 dice vs Diff 1 | faces: 4 | 1 succ, 0 six | SUCCESS
A015 | S4 Jun casts Reveal in the old subway: Craft 2 (1 Magic) | 2 dice vs Diff 1 | faces: 1 1 | 0 succ, 0 six | FAILURE
A016 | S4 Dee casts Reveal at the depot: Craft 2 (1 Magic) | 2 dice vs Diff 1 | faces: 6 6 | 2 succ, 2 six | CRITICAL
A017 | R1 Dee casts Blast with Flame + Surge: Craft 2 + Flame 2 vs Defence 1 (Weakness known) (3 Magic) | 4 dice vs Diff 1 | faces: 2 6 1 3 | 1 succ, 1 six | SUCCESS
A018 | R1 Mara attacks (thrown iron bell): Nerve 2 vs Defence 1 | 2 dice vs Diff 1 | faces: 4 2 | 1 succ, 0 six | SUCCESS
A019 | R1 Jun leads Vanquish alone: Craft 2 + own Magic 1 + Mara helps 1 vs Diff 3 (3 witches, Weakness known) | 4 dice vs Diff 3 | faces: 1 5 3 2 | 1 succ, 0 six | FAILURE
A020 | R2 Vanquish: Jun leads Craft 2 + Dee joins 2 + Mara joins 2 + Jun own Magic 2 vs Diff 3 | 8 dice vs Diff 3 | faces: 4 4 2 4 3 2 3 2 | 3 succ, 0 six | SUCCESS
A021 | DRILL1 R1 Dee frees innocent: Nerve 3 + Mara helps 1 vs Defence 2 (no Weakness) | 4 dice vs Diff 2 | faces: 1 4 6 5 | 3 succ, 1 six | SUCCESS
A022 | DRILL1 R1 Mara attacks: Nerve 2 vs Defence 2 | 2 dice vs Diff 2 | faces: 6 3 | 1 succ, 1 six | PARTIAL
A023 | DRILL1 R1 Threat target d6 (1-3 last hurt it, 4-5 most hurt, 6 signature/innocent) | 1d6 | faces: 2
A024 | DRILL1 R1 Mara defends (no Sight, to avoid Exposure): Nerve 2 vs Attack 1 | 2 dice vs Diff 1 | faces: 6 6 | 2 succ, 2 six | CRITICAL
A025 | DRILL1 R2 Dee attacks with Flame + Surge: Nerve 3 + Flame 2 vs Defence 2 (2 Magic) | 5 dice vs Diff 2 | faces: 1 6 1 2 4 | 2 succ, 1 six | SUCCESS
A026 | DRILL1 R2 Mara studies the threat: Wits 3 + Sight 2 vs Defence 2 | 5 dice vs Diff 2 | faces: 3 1 1 1 3 | 0 succ, 0 six | FAILURE
A027 | DRILL1 R2 Threat target d6 | 1d6 | faces: 3
A028 | DRILL1 R2 Dee defends: Nerve 3 vs Attack 1 | 3 dice vs Diff 1 | faces: 4 4 1 | 2 succ, 0 six | SUCCESS
A029 | DRILL1 R3 Dee attacks with Flame: Nerve 3 + Flame 2 vs Defence 2 | 5 dice vs Diff 2 | faces: 1 1 1 1 1 | 0 succ, 0 six | FAILURE
A030 | DRILL1 R3 Mara attacks at Hurt 3: Nerve 2 vs Defence 2 | 2 dice vs Diff 2 | faces: 6 4 | 2 succ, 1 six | SUCCESS
A031 | DRILL1 R3 Threat target d6 | 1d6 | faces: 5
A032 | DRILL1 R3 Tie-break most hurt (Mara 3, Dee 3): odd Mara, even Dee | 1d6 | faces: 4
A033 | DRILL1 R3 Dee defends at Hurt 3: Nerve 3 vs Attack 1 | 3 dice vs Diff 1 | faces: 4 5 2 | 2 succ, 0 six | SUCCESS
A034 | DRILL1 R4 Dee attacks with Flame: Nerve 3 + Flame 2 vs Defence 2 | 5 dice vs Diff 2 | faces: 1 3 6 4 4 | 3 succ, 1 six | SUCCESS
A035 | DRILL5 R4 Vanquish: Jun leads Craft 2 + Mara joins 2 + Jun own Magic 2 vs Diff 5 (no Weakness) | 6 dice vs Diff 5 | faces: 3 6 1 4 2 6 | 3 succ, 2 six | PARTIAL
A036 | DRILL5 R5 Vanquish: Dee leads Craft 2 + Jun joins 2 + Mara joins 2 + Dee own Magic 1 + Mara helps 1 vs Diff 5 | 8 dice vs Diff 5 | faces: 3 6 1 1 3 1 5 5 | 3 succ, 1 six | PARTIAL
A037 | DRILL4 R2 Jun attacks at Hurt 3: Nerve 2 vs Defence 2 | 2 dice vs Diff 2 | faces: 6 2 | 1 succ, 1 six | PARTIAL
A038 | DRILL4 R2 Dee attacks with Flame: Nerve 3 + Flame 2 vs Defence 2 | 5 dice vs Diff 2 | faces: 6 3 3 2 3 | 1 succ, 1 six | PARTIAL
A039 | DRILL4 R2 Threat target d6 | 1d6 | faces: 4
A040 | DRILL4 R2 Dee defends at Hurt 3: Nerve 3 vs Attack 1 | 3 dice vs Diff 1 | faces: 1 6 3 | 1 succ, 1 six | SUCCESS
A041 | DRILL6 S4 Mara lead: Wits 3 + Sight 2 vs Lead 1 | 5 dice vs Diff 1 | faces: 2 4 6 3 2 | 2 succ, 1 six | SUCCESS
A042 | DRILL6 S4 Dee lead: Wits 2 vs Lead 1 | 2 dice vs Diff 1 | faces: 3 5 | 1 succ, 0 six | SUCCESS
A043 | DRILL6 S4 Jun talking lead instead of his Life: Heart 3 + Voice 2 vs Lead 1 | 5 dice vs Diff 1 | faces: 6 5 3 2 4 | 3 succ, 1 six | SUCCESS
A044 | DRILL2b R1 Mara frees innocent alone: Nerve 2 vs Defence 2 | 2 dice vs Diff 2 | faces: 5 1 | 1 succ, 0 six | PARTIAL
A045 | DRILL2b R1 Jun frees innocent: Nerve 2 vs Defence 2 | 2 dice vs Diff 2 | faces: 6 6 | 2 succ, 2 six | CRITICAL
```
