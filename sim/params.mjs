/**
 * Every number and every judgement call the simulator uses.
 *
 * NUMBERS mirrors the [T] table in docs/CORE-RULES.md. RULES holds the core
 * rules' fixed numbers. JUDGEMENT holds what the page leaves open (each with a
 * doc and the passage that leaves it open), and POLICY holds how the simulated
 * players choose. Every JUDGEMENT and POLICY entry lists its alternative
 * values, and `run.mjs --sweep` re-runs the grid once per alternative.
 */

/** CORE-RULES "[T] Numbers", per difficulty label. */
export const NUMBERS = {
  easy:     { leadD: 1, defence: 1, attack: 1, hit: 2, tWitch: 3, tGuardian: 0, mark: 5, doomMax: 12, exposureMax: 5, cluesPer: 3, cluesAdd: 0, unmakeAdd: 0 },
  standard: { leadD: 2, defence: 2, attack: 3, hit: 2, tWitch: 3, tGuardian: 0, mark: 5, doomMax: 12, exposureMax: 4, cluesPer: 4, cluesAdd: -1, unmakeAdd: 0 },
  hard:     { leadD: 2, defence: 2, attack: 3, hit: 3, tWitch: 4, tGuardian: 0, mark: 5, doomMax: 12, exposureMax: 4, cluesPer: 4, cluesAdd: 0, unmakeAdd: 0 },
};

/** CORE-RULES per-size rows: threat attacks per round (by characters) and Unmaking Difficulty change (by witches). */
export const SIZE = {
  attacks: { 2: 1, 3: 1, 4: 2, 5: 2 },
  attacksBy: "n",   // count characters (n) or witches only (w) when looking up attacks per round
  unmakeMod: { 2: 0, 3: 0, 4: 0, 5: 0 },
  toughnessMod: { 2: 0, 3: 3, 4: 0, 5: 0 }, // "Against 3 witches and no guardian player, the threat has 3 more Toughness"
  toughnessBy: "allWitches", // extra Toughness only against a coven with no guardian player ("allWitches"), or by characters (n) or witches (w)
};

/** CORE-RULES fixed numbers. */
export const RULES = {
  successFace: 4,       // "Each 4, 5 or 6 is a success."
  critSixes: 2,         // "two or more 6s"
  bonusCap: 2,          // "at most +2 dice from everything else together"
  powerDice: 2,         // "your Power adds 2 dice when it fits"
  witchRatings: [3, 2, 2, 1],
  guardianRatings: [3, 2, 2],
  witchHurt: 4,
  guardianHurt: 5,
  magic: 5,
  ward: 5,
  damage: { critical: 3, success: 2, partial: 1, failure: 0 },
  surgeCost: 2,
  noWeaknessUnmake: 2, // "+2 without the Weakness"
  threatFirst: true,    // in round 1 of every showdown the threat acts before the characters (v0.6: after)
  bindingBoost: true,   // Binding is used with an attack: if the attack works, the threat loses its next attack (v0.6: no roll)
  bankLostAttacks: false, // lost attacks beyond the one-a-round limit wait for later rounds (v0.6) or are wasted (v0.7)
  shieldPerRound: 1,    // Shields the guardian can use each round
  blastingBoost: true,  // Blasting: 2 more damage on your attack this round if it works (v0.5: 2 damage with no roll)
  maxLostAttacks: 1,    // the threat loses at most this many attacks a round, whatever the cause (99 = no limit)
  brewPartial: 1,       // potions a Partial brew makes (v0.5: the same as a success)
  senseClue: false,     // Sense: a lead this scene that succeeds gives 1 more Clue (instead of a die)
  senseOutside: true,   // Sense's die doesn't count toward the +2 limit (v0.5: it did)
  wildBrew: true,       // Wild's Surge on a brew makes 1 more potion
  seasonToughness: 1,  // season: the threat has this much more Toughness per witch for every growth step the coven has taken
  seasonDanger: 0,     // season: +1 Danger every this many growth steps (0 = never)
  seenToDoom: true,     // once Seen, any further Exposure rise becomes +1 Doom instead
  potionCap: "characters", // most potions the coven can carry: "characters" (one per character), "witches" (one per witch) or a number (99 = no cap)
  hideQuiet: true,      // casting Hide never raises Exposure (v0.4: it counted as casting)
  potionYield: 2,       // potions a successful brew makes (a Critical makes one more)
  potionFree: true,     // using a potion needs no action (one potion per character per round)
  brewWithBook: true,   // the character researching the Book may also brew one potion that scene (instead of brewing taking its own action)
  potionBlast: 2,
  potionHeal: 2,
  mendHeal: 2,
  freeNeedsSuccess: true,  // freeing a held innocent takes a full success (a Partial doesn't free them)
  innocentHeld: 1,         // public showdown: the threat starts holding the innocent; lost if still held at the end of this round (0 = off, v0.2)
  noWeaknessDefence: 1,    // the threat's Defence is this much higher until the coven knows its Weakness
  weaknessDamage: 1,       // extra damage on attacks that work once the Weakness is known (v0.2: 0)
  revealBonus: 1,          // extra Clue Reveal gives on a Success or Critical (v0.1: 0)
  blastBonus: 1,           // extra damage Blast does on a Partial or better (v0.1: 0)
  voiceClue: true,         // Voice's Surge can instead give 1 more Clue on a talking lead (v0.1: false)
  unmakeByWitches: true,  // Unmaking Difficulty = number of witches + the label's unmakeAdd (instead of the label's unmakeD)
  unmakeJoinDice: 2,      // dice each joining witch adds
  unmakeNeedsSuccess: true, // only a full success destroys the threat (a Partial is a miss, with no extra cost)
  // Rule switches (the defaults are CORE-RULES v0.2; v0.1 was: unmakeByWitches false, unmakeJoinDice 1, unmakeNeedsSuccess false, guardianUnmake 0, holdDice 0)
  guardianUnmake: 0,     // dice the guardian adds when it joins the Unmaking for 1 Ward (0 = it can't join)
  mendFree: false,         // Mend needs no action (once per round)
  holdDice: 0,             // extra defence dice for the guardian against an attack it drew with Hold
};

/** What the core rules leave to the Storyteller or leave undefined. */
export const JUDGEMENT = {
  signature: {
    default: "double",
    values: ["double", "heavy"],
    doc: "The generic signature move on a 6 when no innocent is exposed: attack two different characters (double), or one attack whose Hit is 1 higher (heavy).",
    ref: "CORE-RULES The threat: '6 its signature move' (each threat's own move is content, not yet written)",
  },
  fightPartialCost: {
    default: "hurt",
    values: ["hurt", "none"],
    doc: "Whether a Partial attack in a fight costs 1 Hurt (hurt) or nothing (none, the generous reading).",
    ref: "CORE-RULES Showdown: 'a Partial 1 with a cost'",
  },
  investigationCost: {
    default: "rule",
    values: ["rule", "none"],
    doc: "Whether lead and brewing Partials/Failures cost 1 Hurt or Exposure as the Cost rule says (rule), or the Storyteller always picks a story cost with no track effect (none).",
    ref: "CORE-RULES The roll: 'Cost'",
  },
  brokenFlees: {
    default: "nextRound",
    values: ["nextRound", "thisRound"],
    doc: "A Broken threat flees at the end of the next round (nextRound), or at the end of the round it broke (thisRound, strict).",
    ref: "CORE-RULES The threat: 'it flees at the end of the next round'",
  },
  bookPerScene: {
    default: 1,
    values: [1, 99],
    doc: "How many characters may research the Book at home in one scene.",
    ref: "CORE-RULES Extra dice: 'the Book (+1 to Wits for research at home)'",
  },
};

/** How the simulated players choose. Never perfect play. */
export const POLICY = {
  magic: {
    default: "spendy",
    values: ["spendy", "careful"],
    doc: "spendy: in the showdown spend everything above 2 Magic (kept for the Unmaking); in investigation spend above 3. careful: keep 3 in the showdown and spend nothing in investigation.",
  },
  go: {
    default: "gamble",
    values: ["gamble", "weaknessOrLate", "asap", "waitForWeakness"],
    doc: "When the coven goes to the threat. gamble: as soon as it knows the Weakness; with half the Clues and one scene before the Showdown mark, it stays one more scene (and will be found) if the missing Clues look reachable in one scene, otherwise it goes. weaknessOrLate: the Weakness, or half the Clues one scene before the mark. asap: as soon as it has half. waitForWeakness: only with the Weakness, even if that means being found.",
  },
  life: {
    default: "spare",
    values: ["spare", "always", "never"],
    doc: "spare: a witch answers their Life when their best lead is no better than the coven's median and Doom is at least 2 short of the mark; always: everyone answers in scene 1; never: everyone lets it slide.",
  },
  brew: {
    default: "cap",
    values: ["cap", "one", "none", "two"],
    doc: "How much the coven brews: cap = the Book researcher brews whenever the coven has fewer potions than it may carry; one / two = at most that many brews; none = never.",
  },
  ratings: {
    default: "sensible",
    values: ["sensible", "random"],
    doc: "sensible: the 3 goes where the Power is used most; random: any legal spread.",
  },
  publicCare: {
    default: "careful",
    values: ["careful", "reckless"],
    doc: "careful: in a public showdown with Exposure one short of full, the coven uses no magic that round; reckless: it never holds back.",
  },
};

export function defaults(table) {
  return Object.fromEntries(Object.entries(table).map(([k, v]) => [k, v.default]));
}

/** The settings one run uses: book numbers + default judgement + default policy. */
export function baseSettings(overrides = {}) {
  return {
    numbers: structuredClone(NUMBERS),
    size: structuredClone(SIZE),
    rules: { ...RULES },
    judgement: defaults(JUDGEMENT),
    policy: defaults(POLICY),
    ...overrides,
  };
}

/** Generous and strict brackets (sim/README §3). */
export const PRESETS = {
  generous: { judgement: { fightPartialCost: "none", investigationCost: "none", brokenFlees: "nextRound", bookPerScene: 99, signature: "double" } },
  strict: { judgement: { fightPartialCost: "hurt", investigationCost: "rule", brokenFlees: "thisRound", bookPerScene: 1, signature: "heavy" } },
};

export function withPreset(settings, name) {
  const p = PRESETS[name];
  if (!p) return settings;
  return { ...settings, judgement: { ...settings.judgement, ...p.judgement } };
}
