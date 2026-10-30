# How to review a version of the game

This is the procedure that found the problems in *Heisty Spideys*, *Don't Get Forked* and *Nine Lives Gang*. Run it on every version before calling it done. Separate agents (or separate passes) do each part, so the parts don't influence each other. Reviewers only read the book; fixes happen afterwards, with the author deciding.

## 1. Rules review
- **Read the whole book.** Use the PDF for tables, sheets and maps.
- **Contradictions:** between chapters; between the chapters and the quick reference, sheets and trackers; between ready-made characters and the creation rules; between scenarios and the scenario-building rules. Check every scenario's numbers and map against its text.
- **Walk a full session in your head,** noting every point where a Storyteller would have to invent a ruling.
- **Odds and simulation:**
  - exact odds for the core roll;
  - a Monte Carlo simulator of a whole session that follows the rules as written, with every assumption documented and every Storyteller judgement a named parameter;
  - results reported as win **and** loss rates per scenario, difficulty label and party size; how fast each track fills; resource use; and each option's effect.
- **Audit every option** (abilities, perks, roles, instincts, body types) for skipped rolls, missing limits, dead or dominated choices, and references to rules that don't exist.
- **Check every worked example's arithmetic.**
- **Terminology drift and typos.**
- **Check against `DESIGN-RULES.md` Part A,** pass or fail per rule.
- **For every issue:** severity (blocker / confusing / minor), page, exact quote, and a suggested fix.

## 2. Playtests: at least two, with real dice
- **Real dice only,** from a script (e.g. `node -e` with `Math.random`), every roll logged with a label. Never invent results.
- **Test A, first night:** a Storyteller who has read the book once, with 3 new players. Time the setup. Note every newcomer question the book doesn't answer quickly, and anything missing from the sheets. Play the easiest ready-made scenario, then one built with the scenario generator.
- **Test B, rowdy table:** 5 experienced players on the hardest scenarios. Split up, take risks, use every ability and push every track.
- **Drills:** for anything the dice don't force, run labelled drills with fresh rolls. Cover every failure state, every limit, every "what if both happen", a roll that succeeds *and* hits the limit, everyone caught, the session-end conditions, and the campaign carry-over.
- **Output:**
  - a play log;
  - issues, each with a one-line "ruling to use tonight";
  - what worked;
  - how it felt: was losing a real risk, were resources spent, was there a dominant tactic, and how long did it take?

## 3. Layout and art review
- **Render every page and look at it yourself.** Zoom into every picture.
- **Art:** apply `ART-CHECKLIST.md` to every picture, with written object and character tables. Compare recurring characters against their reference sheets, left side and right side.
- **Layout:** near-empty pages, gaps, uneven columns, bad table breaks, text under 7.5 pt, meaning shown by colour alone, footers, the contents page versus actual pages, and whether the sheets work when printed. Also check bleed, fonts (embedded, credited, no Type 3) and a printer-friendly version.
- **Rights:**
  - no echoes of famous characters, brands or logos;
  - the name checked against existing products and trademarks;
  - an image source log;
  - font credits.

## 4. Verification (from the second version on)
- **Mark every item from the previous review** as fixed, partly fixed, not changed or changed differently, with the new page and quote.
- **Re-run the simulator** with the same policy and seeds, and compare old and new numbers.
- **Check that fixes didn't open new gaps.** Reflow creates new empty pages, and new wording creates new edge cases.

## 5. Combine
Write one review document with these sections:
1. Verdict.
2. Fix before anyone outside the table sees it.
3. Blockers.
4. Design decisions, each with options.
5. Wording fixes.
6. Art.
7. Layout and sheets.
8. Rights and credits.
9. What works.

Verify every blocker and every sensitive claim against the book yourself before reporting it. If a group is playing soon, also make a one-page **table rulings** sheet. Zip the review, the detailed reports, the dice logs and the simulator together, with a README and a ready-to-paste prompt.
