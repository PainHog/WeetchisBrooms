/**
 * WITCH & WARD — System Configuration
 * ---------------------------------------
 * Static game data shared by the data models, sheets, dice code and the pure
 * rules logic. Pure data only: no `game`, `ui`, `foundry` or DOM, so
 * `module/logic/` and the simulator can import it under plain Node.
 *
 * The rulebook (docs/CORE-RULES.md, then book/src/chapters/) is the source of
 * truth: this file follows it, never the other way round.
 */

export const WW = {};

/** The system id (must match system.json "id" and contracts.mjs SYSTEM_ID). */
WW.id = "witch-ward";

/** CORE-RULES "Characters". */
WW.ratings = {
  heart: { label: "Heart", hint: "people" },
  wits: { label: "Wits", hint: "noticing, research" },
  nerve: { label: "Nerve", hint: "moving, fighting, standing firm" },
  craft: { label: "Craft", hint: "spells, potions" },
};
WW.witchHurt = 4;
WW.guardianHurt = 5;
WW.startMagic = 5;
WW.startWard = 5;

/** CORE-RULES "Powers": what each fits and its Surge (2 Magic, once per scene; the showdown is one scene). */
WW.powers = {
  force: { label: "Force", fits: "attacks, freeing", surge: "The threat loses its next attack." },
  flame: { label: "Flame", fits: "attacks", surge: "2 more damage." },
  sight: { label: "Sight", fits: "leads, defending, studying", surge: "1 more Clue; or, with no action, before the defence roll, one attack aimed at anyone misses." },
  voice: { label: "Voice", fits: "talking leads, Hide", surge: "1 more Clue, or Exposure −1." },
  veil: { label: "Veil", fits: "defending, searching leads, Hide", surge: "No Exposure from casting for the rest of the scene, or in a showdown for this round and the next (a casting roll's cost becomes 1 Hurt)." },
  wild: { label: "Wild", fits: "talking and searching leads, Bind, brewing", surge: "1 more Clue or potion; or in a showdown, the threat's Defence is 1 lower for everyone this round." },
};
/** The d6 order for rolling a Power. */
WW.powerOrder = ["force", "flame", "sight", "voice", "veil", "wild"];

/** CORE-RULES "Characters": the d6 Life table. */
WW.lives = ["Student", "Nurse", "Shop worker", "Teacher", "Mechanic", "Bus driver"];

/** CORE-RULES "Spells" (Craft, 1 Magic). */
WW.spells = {
  reveal: { label: "Reveal", text: "A lead using Craft; a success gives 1 more Clue." },
  bind: { label: "Bind", text: "Against Defence: the threat loses its next attack." },
  blast: { label: "Blast", text: "An attack using Craft; 1 more damage if it works." },
  shelter: { label: "Shelter", text: "Difficulty 2: until the end of the threat's next turn, one person can't be hurt by its attacks." },
  hide: { label: "Hide", text: "Difficulty 2: Exposure −1. Never raises Exposure itself." },
};

/** CORE-RULES "Potions". */
WW.potions = {
  healing: { label: "Healing", text: "Clear 2 Hurt." },
  blasting: { label: "Blasting", text: "Use it with your attack; if the attack works, 2 more damage." },
  binding: { label: "Binding", text: "Use it with your attack; if the attack works, the threat loses its next attack." },
};

/** CORE-RULES "The guardian's gifts" (1 Ward each, Hold free). */
WW.gifts = {
  mend: { label: "Mend", text: "Action: clear 2 Hurt from someone it touches.", ward: 1 },
  shield: { label: "Shield", text: "No action, once a round: take an attack meant for someone near it.", ward: 1 },
  carry: { label: "Carry", text: "Action: take one person to a place it knows.", ward: 1 },
  sense: { label: "Sense", text: "No action: +1 die on a lead this scene, outside the +2 limit.", ward: 1 },
  hold: { label: "Hold", text: "Action, no Ward: Nerve against Defence; if it works, the threat's next attack must target the guardian.", ward: 0 },
};

/** What a roll is for. `phase` limits where it shows; `casting` is the default for the casting box. */
WW.purposes = {
  lead: { label: "Lead (out in the city)", phase: "investigation" },
  research: { label: "Research the Book (at home)", phase: "investigation" },
  reveal: { label: "Reveal (spell lead)", phase: "investigation", spell: true },
  brew: { label: "Brew a potion (at home)", phase: "investigation" },
  hide: { label: "Hide (spell)", phase: "any", spell: true },
  attack: { label: "Attack", phase: "showdown" },
  blast: { label: "Blast (spell attack)", phase: "showdown", spell: true },
  bind: { label: "Bind (spell)", phase: "showdown", spell: true },
  shelter: { label: "Shelter (spell)", phase: "showdown", spell: true },
  free: { label: "Free the innocent", phase: "showdown" },
  study: { label: "Study the threat", phase: "showdown" },
  hold: { label: "Hold (guardian)", phase: "showdown" },
  defend: { label: "Defend", phase: "showdown" },
  other: { label: "Other roll", phase: "any" },
};

/** Difficulty labels (CORE-RULES "[T] Numbers"). */
WW.labels = { easy: "Easy", standard: "Standard", hard: "Hard" };

/** Innocent states. */
WW.innocent = { safe: "Safe (not in the fight)", grip: "In its grip", free: "Free", guarded: "Free and guarded", carried: "Carried to safety", lost: "Lost" };
