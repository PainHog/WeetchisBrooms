/**
 * The Night Market adventure: every link resolves, every image exists, and its
 * macros work on the fake Foundry.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, PACKS, readSource, toCliDoc } from "../tools/pack-config.mjs";

const def = PACKS.find(p => p.type === "Adventure");
const raw = readSource(def.file).find(r => r.key === "night-market");
const adv = toCliDoc(def, raw, 0);
const local = src => (src?.startsWith("systems/witch-ward/") ? join(ROOT, src.slice("systems/witch-ward/".length)) : null);

test("the adventure has the coven, the threat, the innocent, four scenes, its journals, tables and macros", () => {
  const names = adv.actors.map(a => a.name);
  for (const n of ["Dana Okafor", "Marco Rossi", "June Takeda", "Quinn Abernathy", "Tess Lindqvist", "Noor Haddad", "Rook", "The Quiet Man", "Grace Ellery"]) assert.ok(names.includes(n), n);
  assert.equal(adv.scenes.length, 4);
  assert.ok(adv.journal.find(j => j.name.includes("(Storyteller)")).pages.length >= 10, "the whole episode from Chapter 14");
  assert.equal(adv.tables.find(t => t.name.includes("Life calls")).results.length, 6);
  assert.equal(adv.macros.length, 2);
});

test("every token, note and folder link resolves; tokens sit on the map and on the grid", () => {
  const actorIds = new Set(adv.actors.map(a => a._id));
  const pages = new Map(adv.journal.map(j => [j._id, new Set(j.pages.map(p => p._id))]));
  const folders = new Set(adv.folders.map(f => f._id));
  for (const s of adv.scenes) {
    assert.ok(pages.has(s.journal), `${s.name}: journal`);
    for (const t of s.tokens) {
      assert.ok(actorIds.has(t.actorId), `${s.name}: token ${t.name}`);
      assert.ok(t.x >= 0 && t.y >= 0 && t.x < s.width && t.y < s.height, `${s.name}: ${t.name} on the map`);
      if (s.grid.type) assert.ok(t.x % s.grid.size === 0 && t.y % s.grid.size === 0, `${s.name}: ${t.name} on the grid`);
    }
    for (const n of s.notes) {
      assert.ok(pages.has(n.entryId), `${s.name}: note ${n.text}`);
      if (n.pageId) assert.ok(pages.get(n.entryId).has(n.pageId), `${s.name}: note page ${n.text}`);
    }
  }
  for (const d of [...adv.actors, ...adv.scenes, ...adv.journal, ...adv.tables, ...adv.macros]) assert.ok(d.folder === null || folders.has(d.folder), `${d.name}: folder`);
  const showdown = adv.scenes.find(s => s.name.includes("Market"));
  assert.ok(showdown.tokens.some(t => t.name === "Grace Ellery"), "the innocent is at the public showdown");
});

test("every image the adventure uses exists", () => {
  const imgs = [adv.img, ...adv.actors.flatMap(a => [a.img, a.prototypeToken.texture.src]), ...adv.scenes.flatMap(s => [s.background.src, ...s.tokens.map(t => t.texture.src)])];
  for (const src of imgs) { const f = local(src); if (f) assert.ok(existsSync(f), src); }
});

test("its macros run: Start Night Market opens the start dialog with Easy and the Quiet Man picked", async () => {
  const { installFoundry, Hooks, dialogResponders, settle, asUser, log } = await import("../tools/fake-foundry.mjs");
  const { game } = installFoundry({ users: [{ id: "gmUser0000000000", name: "GM", isGM: true }] });
  await import("../module/witch-ward.mjs");
  Hooks.callAll("init");
  Hooks.callAll("ready");
  const gm = game.users.get("gmUser0000000000");
  let quiet;
  await asUser(gm, async () => {
    for (const a of adv.actors) {
      const made = await Actor.create({ name: a.name, type: a.type, img: a.img, system: a.system });
      if (a.name === "The Quiet Man") quiet = made;
    }
  });
  let content = "";
  dialogResponders.push(opts => { content = opts.content; return null; });
  const start = adv.macros.find(m => m.name === "Start Night Market");
  await asUser(gm, () => new Function("game", start.command)(game));
  await settle();
  assert.match(content, new RegExp(`value="easy" selected`));
  assert.match(content, new RegExp(`value="${quiet.id}" selected`));
  const tracker = adv.macros.find(m => m.name === "Episode Tracker");
  await asUser(gm, () => new Function("game", tracker.command)(game));
  await settle();
  assert.deepEqual(log.errors, []);
  // People have a sheet that renders.
  const { PersonSheet } = await import("../module/sheets.mjs");
  const grace = game.actors.getName("Grace Ellery");
  const sheet = new PersonSheet({ document: grace });
  await asUser(gm, () => sheet.render(true));
  assert.match(sheet.element.innerHTML, /Grace Ellery/);
  assert.match(readFileSync(join(ROOT, "system.json"), "utf8"), /"person"/);
});
