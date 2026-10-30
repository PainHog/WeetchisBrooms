/**
 * Coven generation, the way CORE-RULES "Characters" says players make them,
 * plus a validator that rejects anything illegal.
 */
import { RULES } from "./params.mjs";

/**
 * The six Powers (CORE-RULES "Powers") and where each one fits, in the
 * simulator's action vocabulary:
 *   attack, defend, leadHeart (a talking lead), leadWits (a searching lead out
 *   in the city), research (the Book at home), reveal, study, bind, hide, brew.
 * `main` is the rating a sensible player puts the 3 into.
 */
export const POWERS = {
  force: { name: "Force", fits: ["attack"], main: "nerve" },
  flame: { name: "Flame", fits: ["attack"], main: "nerve" },
  sight: { name: "Sight", fits: ["leadHeart", "leadWits", "research", "reveal", "study", "defend"], main: "wits" },
  voice: { name: "Voice", fits: ["leadHeart", "hide"], main: "heart" },
  veil: { name: "Veil", fits: ["defend", "hide", "leadWits"], main: "nerve" },
  wild: { name: "Wild", fits: ["leadHeart", "leadWits", "bind", "brew"], main: "craft" },
};
export const POWER_KEYS = Object.keys(POWERS);
export const WITCH_RATINGS = ["heart", "wits", "nerve", "craft"];
export const GUARDIAN_RATINGS = ["heart", "wits", "nerve"];

export function fits(char, action) {
  return !!char.power && POWERS[char.power].fits.includes(action);
}

function spread(keys, values, rng, mainKey) {
  const out = {};
  let rest = keys.slice();
  let vals = values.slice().sort((a, b) => b - a);
  if (mainKey) {
    out[mainKey] = vals.shift();
    rest = rest.filter(k => k !== mainKey);
  }
  vals = rng.shuffle(vals);
  rest.forEach((k, i) => (out[k] = vals[i]));
  return out;
}

export function makeWitch(id, power, rng, policy = "sensible", rules = RULES) {
  const main = policy === "sensible" ? POWERS[power].main : null;
  const magic = rules.magic;
  return {
    id, kind: "witch", power,
    ratings: spread(WITCH_RATINGS, rules.witchRatings, rng, main),
    hurtMax: rules.witchHurt, hurt: 0, down: false, everDown: false,
    magic, magicStart: magic, magicGained: 0, magicSpent: 0,
    ward: 0, wardStart: 0, wardSpent: 0,
    lifeAnswered: false, surgedScene: -1,
  };
}

export function makeGuardian(rules = RULES) {
  return {
    id: "guardian", kind: "guardian", power: null,
    ratings: { heart: 3, wits: 2, nerve: 2, craft: 0 },
    hurtMax: rules.guardianHurt, hurt: 0, down: false, everDown: false,
    magic: 0, magicStart: 0, magicGained: 0, magicSpent: 0,
    ward: rules.ward, wardStart: rules.ward, wardSpent: 0,
    lifeAnswered: true, surgedScene: -1,
  };
}

/**
 * A coven of `witches` witches, plus the guardian if a player plays it.
 * Powers come off a d6 table and duplicates are rerolled (CORE-RULES / Q4).
 */
export function makeCoven({ witches, guardian }, rng, ratingsPolicy = "sensible", rules = RULES) {
  const powers = rng.shuffle(POWER_KEYS).slice(0, witches);
  const list = powers.map((p, i) => makeWitch(`w${i + 1}`, p, rng, ratingsPolicy, rules));
  return {
    witches: list,
    guardian: guardian ? makeGuardian(rules) : null,
    guardianCall: !guardian, // "No guardian player: once per episode ... one Mend or one Carry"
    potions: [],
  };
}

export function members(coven) {
  return coven.guardian ? [...coven.witches, coven.guardian] : coven.witches.slice();
}

/** Throws on an illegal coven. */
export function validateCoven(coven, rules = RULES) {
  const sorted = a => a.slice().sort((x, y) => y - x).join(",");
  if (coven.witches.length < 2 || coven.witches.length > 5) throw new Error("a coven has 2–5 witches");
  const total = coven.witches.length + (coven.guardian ? 1 : 0);
  if (total < 3 || total > 5) throw new Error("3–5 players");
  const seen = new Set();
  for (const w of coven.witches) {
    if (!POWERS[w.power]) throw new Error(`unknown Power ${w.power}`);
    if (seen.has(w.power)) throw new Error(`duplicate Power ${w.power}`);
    seen.add(w.power);
    if (sorted(WITCH_RATINGS.map(k => w.ratings[k])) !== sorted(rules.witchRatings)) throw new Error(`illegal ratings for ${w.id}`);
    if (w.hurtMax !== rules.witchHurt || w.magicStart !== rules.magic) throw new Error(`illegal start for ${w.id}`);
  }
  if (coven.guardian) {
    const g = coven.guardian;
    if (sorted(GUARDIAN_RATINGS.map(k => g.ratings[k])) !== sorted(rules.guardianRatings)) throw new Error("illegal guardian ratings");
    if (g.hurtMax !== rules.guardianHurt || g.wardStart !== rules.ward) throw new Error("illegal guardian start");
  }
  return true;
}
