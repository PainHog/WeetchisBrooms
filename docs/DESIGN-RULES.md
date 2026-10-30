# Design rules for Richard Moore's games

These rules come from reviewing three games: *Heisty Spideys* (simulated, playtested and fixed through v4.8), *Don't Get Forked* (v0.1 and v0.2) and *Nine Lives Gang* (v0.8). The same mistakes turned up in all three. Every rule below exists because a real playtest or simulation hit the problem.

The **core ideas were never the problem**: the dice, the main loop and the fun held up every time. The problems were in the edges: what happens at the limits, in combinations, in odd orders, and between chapters.

**How to use this file:** read it before designing anything. The core rules aren't finished until they answer every question in Part B. The book isn't finished until it passes Part D.

---

## Part A: Hard rules (don't break these)

### Threat tracks and meters
1. **Define every state of every track.** For each track or meter (Alert, Suspicion, Broom, Patience…), write down:
   - what happens when it hits its maximum;
   - whether it can go past the maximum, and whether the extra is lost;
   - whether it can come back down;
   - what happens when two tracks are full at once;
   - what happens when a limit moves under a track's current value. In Nine Lives Gang, Patience dropped onto an already-filled meter, and the book didn't say whether it was full.
2. **No feedback spirals.** A bad result must never make the next roll harder *and* cost threat again, round after round, inside one event. In Don't Get Forked v0.1 the chase raised Suspicion every round and the mob's Difficulty climbed with it, so one failed roll ended a raid on Turn 2.
   - **One event, one rise:** an event (a roll, a chase, a group check) raises the threat once, by its biggest trigger.
   - **Fix difficulties at the start of an event.**
3. **No good result undoes the threat cheaply.** In Heisty v4.5, Criticals lowered the Alert half the time, and the Alert barely moved.
4. **Losing must cost something at every stage**, including at the last obstacle, after the loot is in hand, and at the limit. And losing must never be better than fighting on. In Don't Get Forked v0.1, everyone captured scored better than being forked.

### Resources and spending
5. **No spend is ever free.** Check every resource in every state.
   - Is it free once doom is certain? Points past the Limit are lost, so overdraws became free in Don't Get Forked.
   - Is it free in a particular round? Soon-Weakness overdraws were free in round 2.
   - Is it free when it lands on a roll that already costs as much?
6. **No dominated option.** If option A is always better than option B, cut B or fix it. Buying a Cattitude die was always worse than pushing.
7. **Resources must get spent.** If the median player ends with more than half of a resource unspent, the game isn't asking for it. Fix that, or tell players plainly to spend it.

### Abilities
8. **Nothing skips a roll for free**, including in combination with free actions:
   - Heisty: the Spitting Spider's jam and the Bypass.
   - Don't Get Forked: Spectral plus a free hand-off let the Ghost pass every group obstacle without rolling.
   - Nine Lives Gang: give-ins that act as free Distracts and hides.

   Test every ability against handing items over, moving, helping and repeating it.
9. **Every option matters in the shipped scenarios.** Strong Back did nothing because no ready-made town had Huge furniture. A Castle Duty did nothing when its kind wasn't on the shopping list. Chonky hurt because no house had a Tight inside path. The simulator flags any option worth less than ±2 points, or dominated by another.
10. **Limits are per character or per group, stated outright.** "Once per scene" and "once per heist" need a defined scene and heist, and must say what a replacement character inherits.

### Rules text
11. **One source of truth per rule.** Each rule is stated fully in one place. Quick references, sheets and trackers are checked against the chapters after every change. Every game had chapters contradicting each other or their quick reference: whether the prize resets after any catch or only the carrier's; when the Prize Clock ticks; a Ghost's pass.
12. **Read every rule literally at the start and end of a session.** Nine Lives Gang's "the robbery ends as soon as no free cat is inside" was true before round 1 started.
13. **Every "nearest X", "the other Y" or "an empty Z" must handle "there is none".** Shoos shut the nearest working entrance, and houses ran out of entrances.
14. **Nothing consumable may run out without a rule.** Entrances, routes, tokens, cards: either they come back, or the book says what happens when they're gone.
15. **Order of resolution is stated** for every combination:
    - a roll that succeeds *and* fills the limit;
    - the hunt starting mid-turn while others haven't acted;
    - a temptation versus an awake dog, both "before anything else";
    - a distracted human "sees nobody" but "sees everything" while holding a cat.
16. **Terms have one meaning each.** "Hard", "Clean" and "Easy/Standard" were each used for two different things, and "ways", "entrances" and "ways in" were mixed. Keep a glossary and check against it.
17. **Examples of play are rules-checked and teach good play.** One example broke the Prize Clock rule. Another taught a tactic (taking the Monster in a chase) that usually loses, and players copied it.
18. **Say the true cost.** "Capture is only a setback" undersold "your loot is gone for the night". If a rule hurts, say so where players will read it.

### Difficulty and balance
19. **Simulate before writing chapters,** then after every rule change. Targets that played well:
    - wins: Easy ~90%, Standard ~75%, Hard ~55–60%;
    - real losses at Hard;
    - Criticals 15–25% of rolls, failures about 10%.

    Report the **losing** rate too: Nine Lives Gang's labels were upside down for losing, with Standard 25–35% Busted and Hard 1–7%.
20. **Labels come from simulated results,** not intentions. Re-check a scenario after any change to it; one unannounced Difficulty 8→10 change cost a town 3–6 points.
21. **Test 3, 4 and 5 players.** "Three or five players do about as well" was false in Nine Lives Gang. Five matching Duties made Don't Get Forked's Standard easy. Give explicit per-size adjustments, and test which role a small group can't do without.
22. **Every clock must bind.** If a turn limit or dawn exists, it should end or pressure a meaningful share of sessions in the simulator, otherwise remove it. Don't Get Forked's dawn arrived in under 1% of raids.
23. **Partial wins must be partial.** Eating half the food counted as a getaway, which made the Hard food houses nearly unlosable.
24. **Watch long events.** Cap or clock anything that can run more than about 6 rounds inside one player's turn; two chases ran 15 rounds.

### Scenarios and generators
25. **Every ready-made scenario has:**
    - a map that matches its text room by room;
    - at least two ways in, and enough ways out that they can't all close;
    - every obstacle's roll and Difficulty;
    - stats or a procedure for every NPC (a d6 table, not a script);
    - an escape solvable without the athletic trait;
    - furniture or prizes that use the options players can pick.
26. **Generators are tables, validated.** Generate 50–100 results and check that each is playable. Rolled towns put inside-only obstacles at the way in; Nine Lives Gang's "Making a House" was a checklist, not a generator. Mark which table results are allowed where.

### The table experience
27. **First night under 30 minutes of setup.** The book says:
    - what to print;
    - every die needed, including a second die of the same size in a different colour where two dice are compared, and that "0 on a d10 is 10";
    - what to track and where;
    - a tie-break for two players wanting the same character;
    - whether players see the scenario page.

    Offer premade or pre-filled characters.
28. **Sheets fit the biggest case.** Trackers have rows for the most NPCs in any shipped scenario (Nine Lives Gang's had 3; one house needed 5), room for full ability text, and a box for every state players track.
29. **The Storyteller's load fits on one card.** If a round has more than about 5 steps, provide a round card and a simpler "first session" mode.

---

## Part B: Questions the core rules must answer before any chapter is written

- **The roll:** dice, success, partial and failure bands, critical. Bonus cap, from all sources. Opposed rolls: are there any, and how do modifiers apply to them?
- **Group actions:** group checks, helping (who, how many, what it costs), and what one roll covers.
- **Time:** what a turn, round and scene each are. What one action is. Does movement cost the action?
- **Threat:** every track and every state (A1–A4). One event, one trigger. What raises it, what lowers it, and what happens at the top.
- **Resources:** how they're earned and spent, and whether they're ever free or dominated (A5–A7).
- **Characters:** creation steps, random tables for every step with duplicate rerolls, starting resources that don't swing by species, and what a replacement inherits.
- **NPCs and threats:** stats or procedures, how they detect, attack, are beaten or driven off, and when they're "active".
- **The prize:** sizes, carrying, passing it around, dropping it, what "partial" means, and what capture does to it.
- **Failure states:** caught, captured, out, adopted, forked; how a character comes back; what everyone-down means; can you give up?
- **The end:** every way a session ends, literal at the first and last moment. Result tiers. Rewards and campaign carry-over.
- **Party size:** 3, 4 and 5, with explicit adjustments.
- **Simulator targets:** win and loss rates per label, resource use, Critical and failure rates.

## Part C: Process

1. **Pitch → design interview → core rules summary (one page) → simulator → approve the core → chapters → art.** Never write chapters or art before the core rules are approved and simulated.
2. **Book first.** The rulebook source is the rules. The simulator, the Foundry system and the reference pages follow the book in the same change.
3. **Log every ruling** (what, where, why, source) in REVIEW.md.
4. **After each version:**
   - a rules review: contradictions, gaps, odds, the simulator re-run;
   - at least two real-dice playtests by agents, covering an Easy first night and a Hard aggressive table, plus drills for every failure state;
   - a layout and art audit;
   - a verification pass on the previous review's items.
5. **Keep the simulator measuring what it was built for.** Freeze a copy of the old rules when the live rules change.
6. **Foundry, if planned, is automation-first:** players and the Storyteller should never track rules by hand.

## Part D: Release gates (the book isn't finished until all pass)

- [ ] Every Part B question is answered in the text, in one place.
- [ ] The quick reference, sheets and trackers have been checked against the chapters, line by line.
- [ ] Simulated win and loss rates are on target for every label and party size, and there are no dead or dominated options.
- [ ] Two clean playtests in a row: no blocker and no "the table had to invent a ruling" on core flow.
- [ ] Every picture passes ART-CHECKLIST.md, with object and character tables written.
- [ ] Layout:
  - no near-empty pages, and reflow checked after every edit (fixing one gap often opens another);
  - no text under 7.5 pt;
  - no meaning shown by colour alone;
  - contents page and cross-references verified.
- [ ] Print:
  - a printer-friendly white version;
  - for print-on-demand: 0.125 in bleed, a cover spread with spine, all fonts embedded and credited, no Type 3 fonts.
- [ ] Credits and rights:
  - maps and art credits;
  - an image source log;
  - name and logo trademark search (e.g. "Nine Lives" against the 9Lives cat-food brand);
  - no famous-character echoes;
  - a public-domain notice if stand-ins are used;
  - any online companion named and linked.

## What worked, and should be reused
- **The core mechanics:**
  - One roll, one rise; one chase, one rise.
  - "A roll's result comes first."
  - One raise or bonus cap per roll from any source.
  - No opposed rolls; the opposition is a single Difficulty.
  - Push-your-luck rerolls.
  - The Mask/Monster-style risk choice on every roll.
- **Teamwork:** helpers spend resources without spending their action, and abilities shared in the climax were the most fun moments in every game.
- **Temptations and flaws** that drive the story.
- **Comic failure** (Shoos, Scoops, getting forked) that's tactical, not just punishing.
- **Duties and roles** that give every player a spotlight place.
- **A one-page "At the Table" reference.**
