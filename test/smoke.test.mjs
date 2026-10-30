/**
 * Skeleton smoke tests — run with `npm test` (node --test).
 *  - the pure modules (config, contracts, logic/) import under plain Node and
 *    touch no Foundry globals;
 *  - the system id agrees everywhere;
 *  - the simulator's seeded RNG is deterministic;
 *  - the system entry module boots on the fake Foundry (tools/fake-foundry.mjs);
 *  - the validator (npm run validate) passes;
 *  - the pack pipeline's id derivation is deterministic.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(ROOT, "system.json"), "utf8"));

test("pure modules import under plain Node", async () => {
  const config = await import("../module/config.mjs");
  const contracts = await import("../module/contracts.mjs");
  await import("../module/logic/rules.mjs");
  assert.equal(typeof config.WW, "object");
  for (const k of ["SETTINGS", "CARD", "OPS", "HOOKS"]) assert.ok(Object.isFrozen(contracts[k]), `${k} is frozen`);
});

test("pure modules reference no Foundry globals", () => {
  const files = ["module/config.mjs", "module/contracts.mjs",
    ...readdirSync(join(ROOT, "module/logic")).filter(f => f.endsWith(".mjs")).map(f => `module/logic/${f}`)];
  for (const f of files) {
    // strip comments, then look for Foundry globals
    const code = readFileSync(join(ROOT, f), "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
      .replace(/(["'`])(?:\\.|(?!\1)[^\\])*\1/g, '""'); // ignore string literals (ids like "x-game")
    assert.doesNotMatch(code, /\b(game|ui|foundry|Hooks|CONFIG|canvas|document|window)\s*[.[(]/, `${f} must stay Foundry-free`);
  }
});

test("the system id agrees everywhere", async () => {
  const { SYSTEM_ID, FLAG, QUERY, SOCKET } = await import("../module/contracts.mjs");
  const { WW } = await import("../module/config.mjs");
  assert.equal(manifest.id, "witch-ward");
  assert.equal(SYSTEM_ID, manifest.id);
  assert.equal(WW.id, manifest.id);
  assert.equal(FLAG, manifest.id);
  assert.equal(QUERY, `${manifest.id}.op`);
  assert.equal(SOCKET, `system.${manifest.id}`);
});

test("sim rng is deterministic and in range", async () => {
  const { makeRng, Rng, hash32 } = await import("../sim/rng.mjs");
  const seq = r => Array.from({ length: 50 }, () => r.next());
  assert.deepEqual(seq(makeRng(1, "a", 0)), seq(makeRng(1, "a", 0)), "same seed + labels → same stream");
  assert.notDeepEqual(seq(makeRng(1, "a", 0)), seq(makeRng(1, "a", 1)), "a different run index → a different stream");
  assert.notDeepEqual(seq(makeRng(1, "a")), seq(makeRng(2, "a")), "a different seed → a different stream");
  assert.equal(hash32("x", 1), hash32("x", 1));
  const r = new Rng(7);
  for (const f of r.roll(500, 6)) assert.ok(f >= 1 && f <= 6 && Number.isInteger(f));
  for (const f of r.roll(500, 20)) assert.ok(f >= 1 && f <= 20);
  for (let i = 0; i < 200; i++) { const v = r.int(3, 5); assert.ok(v >= 3 && v <= 5); }
  assert.deepEqual(new Rng(9).fork("x").roll(10), new Rng(9).fork("x").roll(10), "forks are reproducible");
  assert.deepEqual(new Rng(3).shuffle([1, 2, 3, 4]).sort(), [1, 2, 3, 4]);
  assert.equal(new Rng(4).weighted({ a: 0, b: 1 }), "b");
});

test("the entry module boots on the fake Foundry", async () => {
  const { installFoundry, log, Hooks } = await import("../tools/fake-foundry.mjs");
  const { game, CONFIG } = installFoundry({ users: [{ id: "gmUser0000000000", name: "GM", isGM: true }] });
  await import("../module/witch-ward.mjs");
  Hooks.callAll("init");
  Hooks.callAll("ready");
  await new Promise(r => setImmediate(r));
  assert.deepEqual(log.errors, []);
  assert.equal(CONFIG.WW.id, manifest.id);
  assert.equal(game.witchWard.id, manifest.id);
  assert.equal(game.settings.get(manifest.id, "systemMigrationVersion"), "");
});

test("validate passes", () => {
  const r = spawnSync(process.execPath, [join(ROOT, "tools/validate.mjs")], { cwd: ROOT, encoding: "utf8" });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /All checks passed/);
});

test("pack ids are deterministic 16-char ids", async () => {
  const { makeId, toCliDoc } = await import("../tools/pack-config.mjs");
  assert.equal(makeId("p", "k"), makeId("p", "k"));
  assert.match(makeId("p", "k"), /^[a-f0-9]{16}$/);
  assert.notEqual(makeId("p", "k"), makeId("p", "k2"));
  const j = toCliDoc({ out: "j", type: "JournalEntry" }, { key: "a", name: "A", pages: [{ key: "p1", name: "P1" }] }, 0);
  assert.equal(j.pages.length, 1);
  assert.equal(j.pages[0]._key, `!journal.pages!${j._id}.${j.pages[0]._id}`);
  assert.equal(j._stats.systemId, manifest.id);
});
