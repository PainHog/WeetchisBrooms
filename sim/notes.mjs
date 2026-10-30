/**
 * Rule gaps found while building the simulator, and what is and isn't
 * modelled. run.mjs prints both lists into REPORT.md.
 */

/** Gaps in CORE-RULES v0.1, with the reading the simulator uses and where v0.2 settles it. */
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
  { kind: "info", title: "Players should keep 2 Magic for the Vanquish", ref: "Magic", reading: "Covens that spent down to 0 couldn't afford the Vanquish and the threat fled. The simulated players keep 2 each until the threat is Broken; the book should give that advice.", fixed: "v0.2 (advice)" },
  { kind: "info", title: "The innocent is almost never lost", ref: "The threat: '6 … it takes the innocent'", reading: "The simulated coven always guards the innocent or has the guardian carry them out, so the 6 rarely lands. The cost shows up as a witch who isn't attacking. Open question for Richard: should a public showdown start with the innocent already in danger?", fixed: "open" },
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
