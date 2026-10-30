/**
 * Rule gaps found while building the simulator, and what is and isn't
 * modelled. run.mjs prints both lists into REPORT.md.
 */

/** Gaps in the core rules, with the reading the simulator uses and the version that settles it. */
export const GAPS = [
  { kind: "gap", title: "When can a Surge be used in a showdown?", ref: "Powers: 'once per scene'", reading: "The whole showdown counts as one scene, so each witch gets one Surge in it. A Surge works on a Partial or better.", fixed: "v0.2" },
  { kind: "gap", title: "Does the Cost rule add Exposure in a public showdown on top of the once-a-round rise?", ref: "The roll: 'Cost'; Showdown", reading: "No. In a showdown the cost of a Partial or Failure is always 1 Hurt; Exposure comes only from the once-a-round rule.", fixed: "v0.2" },
  { kind: "gap", title: "Where do leads happen (public or at home)?", ref: "Investigation", reading: "Leads are out in the city (public). Book research and brewing are at home and never raise Exposure.", fixed: "v0.2" },
  { kind: "gap", title: "How many characters can research the Book in one scene?", ref: "Extra dice: 'the Book'", reading: "One.", fixed: "v0.2" },
  { kind: "gap", title: "Can a Down character do anything during investigation?", ref: "Tracks: 'Down (can't act…)'", reading: "Yes: resting is the one action a Down character can take.", fixed: "v0.2" },
  { kind: "gap", title: "Hold against a 6 that takes the innocent", ref: "The threat; Hold", reading: "Taking the innocent is not an attack, so Hold doesn't stop it. Only a guard does.", fixed: "v0.2" },
  { kind: "gap", title: "Sight's Surge needs no action?", ref: "Powers: Sight", reading: "Yes: spend it when an attack is aimed at anyone.", fixed: "v0.2" },
  { kind: "gap", title: "Do potions and guardian gifts count as magic in public?", ref: "Showdown: 'anyone used magic'", reading: "Yes.", fixed: "v0.2" },
  { kind: "gap", title: "A Down guardian 'fades back to the home until the next scene'", ref: "DESIGN Q6", reading: "The showdown is one scene, so a guardian that goes Down is out for the rest of it.", fixed: "v0.2" },
  { kind: "gap", title: "When does an unanswered Life cost its 1 Magic?", ref: "Investigation: Life", reading: "At the start of the showdown.", fixed: "v0.2" },
  { kind: "broken", title: "The Vanquish got much easier with every extra witch (v0.1)", ref: "The Vanquish", reading: "v0.1 gave 1 die per joiner against a fixed Difficulty, so 5 witches almost never failed and 2 often did. v0.2: each joiner adds 2 dice, the Difficulty is the number of witches, and only a full success destroys the threat. Win rates by group size are now within a few points.", fixed: "v0.2" },
  { kind: "broken", title: "The guardian was worth 10–20 points less than another witch (v0.1)", ref: "The guardian; Toughness", reading: "Toughness now counts witches only; the guardian adds nothing to it. With that, a guardian player is within about 5 points of an extra witch.", fixed: "v0.2" },
  { kind: "broken", title: "Investigation was too short and Doom never pressed (v0.1)", ref: "[T] Clues needed: n + 2", reading: "With n + 2 Clues the coven knew the Weakness after 2 scenes and the Showdown mark was never reached. v0.2: 3 Clues per character plus a label amount.", fixed: "v0.2" },
  { kind: "broken", title: "Brewing potions didn't pay for itself (v0.3)", ref: "Potions; Investigation", reading: "In v0.3 a brewing action was a lead not followed, and the lost Clue cost more than the potion gave back: covens that never brewed did 3–4 points better. v0.4: using a potion takes no action (one per character per round), the Book researcher may also brew that scene, and a brew makes two potions (three on a Critical). Brewing is now worth 1–3 points.", fixed: "v0.4" },
  { kind: "info", title: "Small covens at Hard; 3 more Toughness against 3 characters", ref: "The threat", reading: "With 1 attack a round against 3 characters and 2 against 4 or 5, 3-character covens had the easiest fights. v0.4 gives the threat 3 more Toughness against 3 characters. The weakest cell left is 2 witches plus a guardian at Hard (about 52%).", fixed: "v0.4" },
  { kind: "info", title: "Players should keep 2 Magic for the Vanquish", ref: "Magic", reading: "Covens that spent down to 0 couldn't afford the Vanquish and the threat fled. The simulated players keep 2 each until the threat is Broken; the book should give that advice.", fixed: "v0.2 (advice)" },
  { kind: "broken", title: "The innocent was almost never lost, and going in early beat waiting for the Weakness (v0.2)", ref: "The threat; The Vanquish", reading: "In v0.2 guarding or carrying the innocent always worked, and a coven that went in without the Weakness did as well or better than one that waited and was found (Hard: 20% vs 10% losses). v0.3: a public showdown starts with the threat holding the innocent (free them in round 1 or lose them), and until the coven knows the Weakness the threat's Defence is 1 higher; once it knows, attacks that work do 1 more damage. Waiting for the Weakness and going early now come out within about a point of each other, and rushing in with half the Clues loses badly.", fixed: "v0.3 (Richard, 2026-10-30)" },
  { kind: "broken", title: "Small groups fell behind at Hard (v0.3 draft)", ref: "[T] Clues needed", reading: "With 3n + 4 Clues, 3-player covens found the Weakness far less often and won about 45% at Hard against 65% for 5 players. Clues are now 4 per character at Hard (and 4 per character minus 1 at Standard, 3 per character at Easy), which brings every size within a few points.", fixed: "v0.3" },
];

/** What the simulator models and what it leaves out. */
export const MODELLED = {
  yes: [
    "The roll, Partials, Criticals, the +2 extra-dice limit, Power dice, helpers (as the roller's own Magic) and group size.",
    "Investigation scenes: leads (Heart, Wits, Reveal), the Book, brewing, resting, Hide, Life calls, Sense; Clues, Doom and the Showdown mark; going to the threat.",
    "Showdown rounds: attacks (Nerve or Blast), Bind, potions, guarding the innocent, studying the threat, Surges for all six Powers, the threat's d6 move table, Shield, Mend, Carry, Hold, Broken, the Vanquish, Doom, public Exposure.",
    "The no-guardian call, Down and back up, every way an episode ends, Seen dropping the result.",
  ],
  no: [
    "No map: moving is free and everyone in a showdown is near everyone else.",
    "One generic threat per difficulty label; real threats will have their own signature moves (the generic one attacks two characters).",
    "A Life fits a lead one time in three.",
    "Shelter is never cast, group checks never come up, helpers are modelled as the roller spending their own Magic, and the coven never retreats (the policies use guarding and fight to the end).",
    "Seasons are not simulated: no Scars, growth, Book pages or returning threats. Each episode starts fresh.",
    "Players' story choices, romance and everyday-life scenes beyond the Life call.",
  ],
};
