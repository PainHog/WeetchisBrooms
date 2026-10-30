/**
 * Shared compendium pack configuration — the single source of truth for the
 * pack build (build-packs.mjs) and the validator (validate.mjs), so the two
 * can never drift on pack names, id derivation, or source layout.
 *
 * Source layout: one JSON file per document under packs/_source/<file>/, each
 * with a human-friendly `key` slug (no ids). Ids are derived deterministically
 * from (pack, key), so rebuilding never reshuffles them.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SRC = join(ROOT, "packs", "_source");
export const OUT = join(ROOT, "packs");

/**
 * file → output pack, document class & subtype. Must match system.json packs[]
 * (and an Item/Actor subtype must be declared in system.json documentTypes).
 * Empty until the game has content. Examples of the shape:
 *   { file: "things", out: "things", collection: "items", type: "Item", subtype: "thing" },
 *   { file: "rules", out: "rules", collection: "journal", type: "JournalEntry", subtype: null }
 */
export const PACKS = [];

/** Deterministic 16-char alphanumeric id from a namespace + key (sha256 hex prefix). */
export function makeId(...parts) {
  return createHash("sha256").update(parts.join("::")).digest("hex").slice(0, 16);
}

/**
 * Read a pack's source: one JSON file per document under packs/_source/<name>/,
 * returned as an array sorted by filename (deterministic for reproducible builds).
 */
export function readSource(file) {
  const dir = join(SRC, file);
  if (!existsSync(dir)) throw new Error(`pack source folder missing: packs/_source/${file}/`);
  return readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .sort()
    .map(f => JSON.parse(readFileSync(join(dir, f), "utf8")));
}

const manifest = JSON.parse(readFileSync(join(ROOT, "system.json"), "utf8"));

/** Provenance stamped on every document. */
export const STATS = {
  // Oldest core whose schema this data fits: v13 refuses to import documents
  // stamped with a newer core, and v14 migrates up from here.
  coreVersion: "13.351",
  systemId: manifest.id,
  systemVersion: manifest.version,
  createdTime: null,
  modifiedTime: null,
  lastModifiedBy: null,
  compendiumSource: null,
  duplicateSource: null,
  exportSource: null
};

/**
 * Turn one of our source docs into a CLI-ready document (deterministic `_id`,
 * `_key`, `_stats`, inline embedded pages). Shared by the build and validator.
 */
export function toCliDoc(def, raw, index) {
  const id = makeId(def.out, raw.key);
  const sort = (index + 1) * 100;

  if (def.type === "JournalEntry") {
    return {
      _id: id,
      _key: `!journal!${id}`,
      name: raw.name,
      pages: (raw.pages ?? []).map((page, p) => {
        const pid = makeId(def.out, raw.key, page.key ?? String(p));
        return {
          _id: pid,
          _key: `!journal.pages!${id}.${pid}`,
          name: page.name,
          type: page.type ?? "text",
          title: page.title ?? { show: true, level: 1 },
          text: page.text ?? { format: 1, content: "" },
          sort: (p + 1) * 100,
          ownership: { default: -1 },
          flags: {},
          _stats: STATS
        };
      }),
      categories: [],
      folder: null,
      sort,
      ownership: { default: 0 },
      flags: {},
      _stats: STATS
    };
  }

  const doc = {
    _id: id,
    _key: `!${def.collection}!${id}`,
    name: raw.name,
    type: def.subtype,
    img: raw.img,
    system: raw.system ?? {},
    effects: [],
    folder: null,
    sort,
    ownership: { default: 0 },
    flags: {},
    _stats: STATS
  };
  if (def.type === "Actor") {
    doc.items = [];
    // null (not "") disables a token bar; "" would be cleaned back to the
    // system's primaryTokenAttribute. Override per pack once actors exist.
    doc.prototypeToken = { bar1: { attribute: null }, bar2: { attribute: null } };
  }
  return doc;
}
