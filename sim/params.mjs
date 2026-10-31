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

/** DESIGN Q16 targets (REPORT.md §1). Win and loss in % of episodes; `down` = episodes with a witch Down. */
export const TARGETS = {
  easy: { win: [85, 95], loss: [0, 5], down: [0, 15] },
  standard: { win: [70, 80], loss: [5, 15], down: [25, 100], seen: [5, 15] },
  hard: { win: [55, 60], loss: [15, 30], down: [40, 100] },
};
/** The win each cell should be within 5 points of. */
export const WIN_TARGET = { easy: 90, standard: 75, hard: 57.5 };

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
  noBindTwice: false,   // the threat can't lose attacks two rounds in a row
  veilRounds: 2,        // in a showdown, Veil's Surge hides casting for this round and the next (99 = the whole showdown, v0.8)
  shieldPerRound: 1,    // Shields the guardian can use each round
  blastingBoost: true,  // Blasting: 2 more damage on your attack this round if it works (v0.5: 2 damage with no roll)
  maxLostAttacks: 1,    // the threat loses at most this many attacks a round, whatever the cause (99 = no limit)
  brewPartial: 1,       // potions a Partial brew makes (v0.5: the same as a success)
  senseClue: false,     // Sense: a lead this scene that succeeds gives 1 more Clue (instead of a die)
  senseOutside: true,   // Sense's die doesn't count toward the +2 limit (v0.5: it did)
  wildBrew: true,       // Wild's Surge on a brew makes 1 more potion
  bookPages: true,      // season: a Book page means starting with half the Clues
  growthRule: "any",   // season growth: "any" rating (most 4), "belowHighest" or "upTo3"
  seasonToughness: 2,  // season: the threat has this much more Toughness per witch for every growth step the coven has taken…
  seasonCap: 2,        // …counting at most this many steps ("after the 2nd and 4th episodes")
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
  signatureFrom: 6,        // lowest d6 face that uses the signature move (5 = a 5 uses it too; the innocent is still only a 6). Not in the book: REPORT-threats.md tests it
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
  bind: {
    default: "wild",
    values: ["wild", "any"],
    doc: "Who casts Bind in a showdown: only a Wild witch (wild), or the best Craft witch whenever the threat has an attack left to lose (any).",
  },
  publicCare: {
    default: "careful",
    values: ["careful", "reckless"],
    doc: "careful: in a public showdown with Exposure one short of full, the coven uses no magic that round; reckless: it never holds back.",
  },
};

/**
 * The threat's signature move: what a 6 on the move table does when the
 * innocent isn't there and free. This is content, not a judgement call, so it
 * isn't swept in REPORT.md; `node sim/threats.mjs` runs every value and writes
 * REPORT-threats.md. "generic" (the default) is the move REPORT.md has always
 * used, so the main report doesn't move.
 *
 * THREATS.readings holds the readings that apply to every move; each move's
 * `doc` holds its own.
 */
export const THREATS = {
  default: "generic",
  readings: [
    "A move picks only standing characters, when it starts; a target who goes Down during the move isn't attacked again (rulings 63, 81).",
    "\"One attack\" is aimed like a 4–5: the most Hurt, standing. \"Two different characters\" are the most Hurt, then the next most Hurt, both standing (ruling 63).",
    "Ties go to the Storyteller; the simulator picks at random (ruling 63).",
    "Hold: an attacking move puts the guardian first and uses Hold up; a part of a move that isn't an attack (Lure's roll) ignores Hold, which stays for the next attack (rulings 64, 82, 88).",
    "A 6 still goes for a free innocent instead of the move (attacking their guard, or taking them), as before (Ch 7, ruling 85).",
    "\"Next action\" (Static, Lure) is the character's next turn: this round's in round 1, when the threat acts first, and next round's after that, when everyone has had their turn. A Down character keeps it until they are back up and take a turn (ruling 63).",
    "The player policies are REPORT.md's; nobody plays around a move (for example, nobody keeps Heart high against Lure or Magic low against Borrowed Face).",
  ],
  values: ["generic", "plain", "twoAttacks", "quietMan", "ashWidow", "mirrorThief", "nightNurse", "vesperCrane", "drownedChoir"],
  moves: {
    generic: {
      name: "Generic (REPORT.md)", short: "generic", yardstick: true,
      doc: "What REPORT.md uses: judgement.signature. With the default 'double', the first attack is aimed like a 1–3 (whoever hurt it last, else the most Hurt) and the second at the most Hurt of the rest; 'heavy' is one attack with Hit 1 higher.",
      ref: "CORE-RULES The threat: '6 its signature move (if it has none, it attacks two different characters)'",
    },
    plain: {
      name: "No move (a plain attack)", short: "plain", yardstick: true,
      doc: "Not in the book. A 6 is one ordinary attack aimed like a 4–5. The floor: a move that does no better than this doesn't matter.",
      ref: "Yardstick only",
    },
    twoAttacks: {
      name: "Two different characters", short: "two attacks", yardstick: true,
      doc: "The move for a threat with none, read by ruling 63: attack the most Hurt, then the next most Hurt, both standing. The book's yardstick for a new move ('about as strong as attack two different characters'). It is Static without the 'can't cast'.",
      ref: "Ch 7 move table; Ch 10 'Making your own threat'; REVIEW 63",
    },
    quietMan: {
      name: "The Quiet Man: Static", short: "Static", threat: "The Quiet Man", episode: 1,
      doc: "Attack two different characters (the most Hurt, then the next most Hurt). The first of them, in that order, who takes any Hurt can't cast on their next action. Under Shield, the guardian took the attack, so it is the one hurt. Can't cast = on that turn no Power dice, no Surge, no spell (so no leading or joining the Unmaking as their action), no potion and no guardian gift that takes an action (Mend, Carry). Not stopped: things outside their turn (defence rolls and their Power dice, Sight's miss, helping, Shield, a Down witch joining the Unmaking) and acts that aren't casting (a plain Nerve attack, freeing or studying with the Power left off, guarding, Hold). A second Static before that turn changes nothing.",
      ref: "Ch 10 The Quiet Man; REVIEW 63, 64",
    },
    ashWidow: {
      name: "The Ash Widow: Cinders", short: "Cinders", threat: "The Ash Widow", episode: 2,
      doc: "Attack every standing character, the guardian included, each at Hit 1 (so a Partial and a Failure both do 1 Hurt). Order: the guardian first under Hold, then the most Hurt first; the order only matters for Shield (once a round: the guardian may take one witch's attack as well as its own) and Sight's miss (once a showdown).",
      ref: "Ch 10 The Ash Widow; REVIEW 63, 64",
    },
    mirrorThief: {
      name: "The Mirror Thief: Borrowed Face", short: "Borrowed Face", threat: "The Mirror Thief", episode: null,
      doc: "Attack the standing witch with the most Magic left (ties at random) at the normal Hit; on a Failure they also lose 1 Magic (none if they have none). Under Hold it attacks the guardian, which loses 1 Ward instead. Under Shield the guardian takes the attack and, on a Failure, loses 1 Ward (read like ruling 82). Lost Magic isn't counted as spent.",
      ref: "Ch 10 The Mirror Thief; REVIEW 81, 82",
    },
    nightNurse: {
      name: "The Night Nurse: Drain", short: "Drain", threat: "The Night Nurse", episode: null,
      doc: "One attack aimed like a 4–5 (most Hurt, standing; the guardian under Hold). If it does any Hurt (a Partial or a Failure, to whoever takes it, Shield included), the threat clears up to 2 of its marked damage, never below 0.",
      ref: "Ch 10 The Night Nurse; REVIEW 63",
    },
    vesperCrane: {
      name: "Vesper Crane: Turned Spell", short: "Turned Spell", threat: "Vesper Crane", episode: null,
      doc: "One attack aimed like a 4–5 with Hit 1 higher (a Partial is still 1 Hurt). The same as the generic 'heavy' reading.",
      ref: "Ch 10 Vesper Crane; REVIEW 63",
    },
    drownedChoir: {
      name: "The Drowned Choir: Lure", short: "Lure", threat: "The Drowned Choir", episode: 3,
      doc: "Ruling 88: one attack, aimed like a 4–5 (most Hurt, standing; the guardian under Hold). Then the standing character with the lowest Heart (the guardian included; ties at random) rolls Heart against Danger. No Power fits that roll and it isn't casting. No Hurt on a Partial or a Failure; on a Failure they lose their next action: that turn they do nothing (no action, so no potion either; they can still help, defend and use Sight's miss). The roll isn't an attack, so Shield, Hold and Sight's miss don't touch it, and Hold stays for the next attack. A second Lure before that turn changes nothing. The players' dice for the roll are threatJudgement.lureDice.",
      ref: "Ruling 88 in book/REVIEW.md (one attack, then the Lure roll; no Hurt from the roll); Ch 10 The Drowned Choir; REVIEW 63, 81, 82",
    },
  },
  /** Candidate fixes, not in the book. REPORT-threats.md §8 tests them; they are never a default. */
  candidates: {
    faceHeavy: {
      name: "Borrowed Face at Hit +1 (candidate)", short: "Borrowed Face, Hit +1", for: "mirrorThief",
      doc: "Not in the book. 'Borrowed Face: attack the witch with the most Magic left, with Hit 1 higher; on a Failure they also lose 1 Magic.' Otherwise as Borrowed Face.",
      ref: "Candidate fix for Ch 10 The Mirror Thief",
    },
  },
};

/** What the signature moves leave to the players. Swept for Low Tide in REPORT-threats.md. (Lure's Partial was open until ruling 88: no Hurt.) */
export const THREAT_JUDGEMENT = {
  lureDice: {
    default: "spare",
    values: ["spare", "none"],
    doc: "Players: a lured witch spends spare Magic (above the 2 kept for the Unmaking) on up to +2 dice, as for a defence that could put them Down (spare), or rolls Heart alone (none).",
    ref: "Policy, not a rule",
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
    threat: THREATS.default,
    threatJudgement: defaults(THREAT_JUDGEMENT),
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
