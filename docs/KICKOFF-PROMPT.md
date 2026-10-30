# Kickoff prompt: Witch & Ward

1. Create your new, empty GitHub repository (suggested name: **WitchAndWard**) and start a new Claude Code session with **only that repository** selected.
2. Attach **`Witch-and-Ward-Starter.zip`**.
3. Paste everything below the line.

---

I'm Richard Moore, starting a new tabletop RPG, working title **Witch & Ward**. It takes the concept of the original *Charmed* TV show and makes a new game of it, without any of the show's own material: no whitelighters, darklighters, the manor's name and so on. You play a group of witches, more than the show's three if we want, and one player can play the group's guardian, with a Storyteller running the game. Demons or other ideas from the show might come in, but that's not important yet. My earlier games were reviewed with simulators and agent playtests, and the same mistakes kept turning up. This project starts with those lessons built in.

**Setup first:**
1. Unzip the attached `Witch-and-Ward-Starter.zip` into the root of this repository. Its top folder's *contents* go at the root, not the folder itself.
2. Check that the GitHub URLs in `system.json` match this repository's name. They're set to `PainHog/WitchAndWard`; fix them if the name is different.
3. Run `npm install` and `npm run check`. Tell me if anything fails.
4. Commit everything to the default branch with the message "Project setup: design docs and toolchain", and push.

**Then read, in this order:**
1. `CLAUDE.md`: how we work. These are the project's rules. I decide all game content; you give options and I choose.
2. `docs/DESIGN.md`: my pitch, the name check, the early flags, and the open questions.
3. `docs/DESIGN-RULES.md`: Part A hard rules, Part B questions, Part C process, Part D release gates.
4. `book/art/ART-CHECKLIST.md` and `docs/REVIEW-PROCEDURE.md`: for later stages.

**Today's goal is the core design**, not chapters or art:
- **Interview me** through the open questions in `docs/DESIGN.md` §5, in order and one topic at a time. Settle the early flags in §4 as they come up.
  - For each topic, give two or three concrete options, with your recommendation and why, and wait for my choice.
  - Start with **question 1** (tone, ages, player count now that more witches are allowed, session length, one-off episodes or a campaign, the setting and era, and the title), then **question 2**: how many witches, what binds them and gives them their strength at any group size, and what the guardian does that a witch can't, including what happens if nobody plays one.
- **Keep clear of the show.** None of its names, terms or designs go into the game; the list is in `docs/DESIGN.md` §2. If something I suggest leans on the show, tell me and offer an alternative.
- **When one of my ideas would repeat a mistake** from `DESIGN-RULES.md` Part A, tell me straight away and name the rule.
- **After each decision,** add it to the Decisions log in `docs/DESIGN.md`, then commit and push.
- **Once the core is settled:**
  1. Write the one-page `docs/CORE-RULES.md`.
  2. Build a first simulator in `sim/`.
  3. Show me the episode win and loss rates by difficulty and group size, with and without a guardian player, how long demon fights run, how often witches are taken out, and how spells and other resources get used, against the targets we agree on.
- **No rulebook chapters or art until I approve the core rules.**

Start with the setup, then ask me the first question.
