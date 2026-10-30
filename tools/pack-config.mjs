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
 * A pack with `subtype: null` holding Actors takes each document's own `type`
 * (the coven pack mixes witches and the guardian).
 */
export const PACKS = [
  { file: "coven", out: "coven", collection: "actors", type: "Actor", subtype: null },
  { file: "threats", out: "threats", collection: "actors", type: "Actor", subtype: "threat" },
  { file: "rules", out: "rules", collection: "journal", type: "JournalEntry", subtype: null },
];

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

  if (def.type === "Adventure") return adventureDoc(def, raw, id, sort);

  const doc = {
    _id: id,
    _key: `!${def.collection}!${id}`,
    name: raw.name,
    type: raw.type ?? def.subtype,
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
    doc.prototypeToken = { bar1: { attribute: null }, bar2: { attribute: null }, ...(raw.prototypeToken ?? {}) };
  }
  return doc;
}

/* ------------------------------------------------------------------ */
/*  Adventures                                                        */
/* ------------------------------------------------------------------ */

/**
 * An Adventure bundles actors, scenes, journals, roll tables, macros and
 * folders, stored inline in one document. The source refers to everything by
 * `key`; ids are derived here, and links (a token's actor, a note's journal
 * page, a document's folder) are resolved from keys to ids.
 */
function adventureDoc(def, raw, id, sort) {
  const nid = (kind, key, sub) => makeId(def.out, raw.key, kind, key, ...(sub ? [sub] : []));
  const ids = {};
  for (const kind of ["actors", "scenes", "journal", "tables", "macros", "folders"]) {
    ids[kind] = Object.fromEntries((raw[kind] ?? []).map(d => [d.key, nid(kind, d.key)]));
  }
  const ref = (kind, key, where) => {
    if (key == null) return null;
    const v = ids[kind][key];
    if (!v) throw new Error(`adventure ${raw.key}: ${where} refers to unknown ${kind} "${key}"`);
    return v;
  };
  const pageId = (entryKey, pageKey) => (pageKey ? nid("journal", entryKey, pageKey) : null);
  const base = (kind, d, i) => ({ _id: ids[kind][d.key], folder: ref("folders", d.folder, `${kind}/${d.key}`), sort: (i + 1) * 100, flags: {}, _stats: STATS });

  const folders = (raw.folders ?? []).map((f, i) => ({
    _id: ids.folders[f.key], name: f.name, type: f.type, folder: null, sorting: "a", sort: (i + 1) * 100, color: f.color ?? null, description: "", flags: {}, _stats: STATS,
  }));
  const actors = (raw.actors ?? []).map((a, i) => ({
    ...base("actors", a, i), name: a.name, type: a.type, img: a.img, system: a.system ?? {}, items: [], effects: [],
    ownership: { default: 0 },
    prototypeToken: {
      name: a.name, displayName: 20, actorLink: true, width: 1, height: 1, lockRotation: true, disposition: a.disposition ?? 0,
      texture: { src: a.token ?? a.img }, bar1: { attribute: null }, bar2: { attribute: null }, sight: { enabled: false },
    },
  }));
  const journal = (raw.journal ?? []).map((j, i) => ({
    ...base("journal", j, i), name: j.name, categories: [], ownership: { default: j.observer ? 2 : 0 },
    pages: (j.pages ?? []).map((pg, p) => ({
      _id: pageId(j.key, pg.key), name: pg.name, type: "text", title: { show: true, level: 1 },
      text: { format: 1, content: pg.content ?? "" }, sort: (p + 1) * 100, ownership: { default: -1 }, flags: {}, _stats: STATS,
    })),
  }));
  const tables = (raw.tables ?? []).map((t, i) => ({
    ...base("tables", t, i), name: t.name, img: t.img ?? "icons/svg/d6-grey.svg", description: t.description ?? "",
    formula: t.formula ?? `1d${t.results.length}`, replacement: true, displayRoll: true, ownership: { default: 0 },
    results: t.results.map((r, k) => ({
      _id: nid("tables", t.key, `r${k + 1}`), type: "text", name: r, description: r, text: r, img: "icons/svg/d6-grey.svg",
      weight: 1, range: [k + 1, k + 1], drawn: false, flags: {}, _stats: STATS,
    })),
  }));
  const macros = (raw.macros ?? []).map((m, i) => ({
    ...base("macros", m, i), name: m.name, type: "script", scope: "global", img: m.img ?? "icons/svg/book.svg", command: m.command, ownership: { default: 0 },
  }));
  const scenes = (raw.scenes ?? []).map((sc, i) => ({
    ...base("scenes", sc, i), name: sc.name, navName: sc.navName ?? "", navigation: true, navOrder: (i + 1) * 100, active: false,
    background: { src: sc.background }, width: sc.width, height: sc.height, padding: 0.1,
    initial: null, backgroundColor: "#1b1b1f",
    grid: { type: sc.gridless ? 0 : 1, size: sc.grid ?? 100, style: "solidLines", thickness: 1, color: "#000000", alpha: 0.15, distance: 1, units: "" },
    tokenVision: false, fog: { exploration: false },
    environment: { darknessLevel: 0, globalLight: { enabled: true } },
    journal: ref("journal", sc.journal, `scene ${sc.key}`), journalEntryPage: pageId(sc.journal, sc.journalPage),
    ownership: { default: 0 },
    drawings: [], lights: [], sounds: [], regions: [], templates: [], tiles: [], walls: [],
    tokens: (sc.tokens ?? []).map((t, k) => {
      const actor = actors.find(a => a._id === ref("actors", t.actor, `scene ${sc.key} token`));
      return {
        _id: nid("scenes", sc.key, `t${k + 1}`), name: actor.name, actorId: actor._id, actorLink: true, displayName: 20,
        width: 1, height: 1, x: t.x, y: t.y, elevation: 0, sort: k, rotation: 0, alpha: 1, lockRotation: true, locked: false,
        hidden: !!t.hidden, disposition: actor.prototypeToken.disposition, texture: { src: actor.prototypeToken.texture.src },
        bar1: { attribute: null }, bar2: { attribute: null }, sight: { enabled: false }, flags: {},
      };
    }),
    notes: (sc.notes ?? []).map((n, k) => ({
      _id: nid("scenes", sc.key, `n${k + 1}`), entryId: ref("journal", n.journal, `scene ${sc.key} note`), pageId: pageId(n.journal, n.page),
      x: n.x, y: n.y, elevation: 0, sort: k, texture: { src: n.icon ?? "icons/svg/book.svg" }, iconSize: 48,
      text: n.text, fontSize: 28, textAnchor: 1, textColor: "#ffffff", global: false, flags: {},
    })),
  }));
  return {
    _id: id, _key: `!adventures!${id}`, name: raw.name, img: raw.img ?? null, caption: raw.caption ?? "", description: raw.description ?? "",
    actors, combats: [], items: [], journal, scenes, tables, macros, cards: [], playlists: [], folders,
    sort, flags: {}, _stats: STATS,
  };
}
