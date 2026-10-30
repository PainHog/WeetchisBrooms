/**
 * A whole episode on the fake Foundry: a GM and two players, real system code,
 * scripted dice. Checks that the GM's client applies each card the book's way.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { installFoundry, log, Hooks, diceQueue, dialogResponders, fakeForm, settle, renderMessage, clickButton, asUser, packDoc } from "../tools/fake-foundry.mjs";

const GM = { id: "gmUser0000000000", name: "GM", isGM: true };
const P1 = { id: "player1000000000", name: "Ana" };
const P2 = { id: "player2000000000", name: "Ben" };

const { game } = installFoundry({ users: [GM, P1, P2] });
await import("../module/witch-ward.mjs");
Hooks.callAll("init");
Hooks.callAll("ready");

const gm = game.users.get(GM.id), p1 = game.users.get(P1.id), p2 = game.users.get(P2.id);
const owned = (data, user) => ({ ...data, ownership: { default: 0, [user.id]: 3 } });
const answer = values => dialogResponders.push(opts => opts.ok.callback(null, { form: fakeForm(values) }));
const lastCard = () => game.messages.at(-1);
const ep = () => game.witchWard.episode.get();

let dana, june, quinn, quiet;

test("set up: actors from the pack sources, then start an episode", async () => {
  await asUser(gm, async () => {
    dana = await Actor.create(owned(packDoc("coven", "1-dana-okafor", "witch"), p1));
    june = await Actor.create(owned(packDoc("coven", "3-june-takeda", "witch"), p2));
    quinn = await Actor.create(packDoc("coven", "4-quinn-abernathy", "witch"));
    quiet = await Actor.create(packDoc("threats", "1-quiet-man", "threat"));
    await dana.update({ "system.hurt": 3, "system.scar": true });
    await game.witchWard.episode.start({ label: "easy", threatId: quiet.id, coven: [dana.id, june.id, quinn.id] });
  });
  await settle();
  const s = ep();
  assert.equal(s.active, true);
  assert.equal(s.witches, 3);
  assert.equal(s.toughness, 3 * 3 + 3, "3 witches, no guardian player");
  assert.equal(s.cluesNeeded, 9);
  assert.equal(dana.system.hurt, 1, "a Scar is 1 Hurt at the start");
  assert.equal(dana.system.scar, false);
  assert.equal(dana.system.magic, 5);
  assert.deepEqual(log.errors, []);
});

test("a player's lead: the GM's client adds the Clues; casting out in the city costs Exposure", async () => {
  // June (Sight): Wits 3 + Sight 2 = 5 dice, Lead Difficulty 1. Two 6s: a Critical, 2 Clues.
  diceQueue.push(6, 6, 2, 1, 1);
  answer({ purpose: "lead", rating: "wits", difficulty: "1", powerFits: true });
  await asUser(p2, () => game.witchWard.rollDialog(june, { purpose: "lead" }));
  await settle();
  assert.equal(lastCard().flags["witch-ward"].card.result, "critical");
  assert.equal(lastCard().flags["witch-ward"].card.applied, true);
  assert.equal(ep().clues, 2);
  // Dana leads with Force (doesn't really fit, but she ticks it): a Failure while casting → Exposure +1.
  diceQueue.push(1, 1, 1, 1);
  answer({ purpose: "lead", rating: "heart", difficulty: "1", powerFits: true });
  await asUser(p1, () => game.witchWard.rollDialog(dana, { purpose: "lead" }));
  await settle();
  assert.equal(ep().exposure, 1);
  assert.equal(dana.system.hurt, 1, "the cost was Exposure, not Hurt");
});

test("helpers pay their own Magic; the +2 limit holds", async () => {
  // Quinn researches the Book (+1) with June and Dana helping: only +2 counts. Wits 2 + 2 = 4 dice.
  diceQueue.push(4, 4, 1, 1);
  answer({ purpose: "research", rating: "wits", difficulty: "1", book: true, [`helper-${june.id}`]: true, [`helper-${dana.id}`]: true });
  await asUser(gm, () => game.witchWard.rollDialog(quinn, { purpose: "research" }));
  await settle();
  const card = lastCard().flags["witch-ward"].card;
  assert.equal(card.pool, 4);
  assert.equal(june.system.magic, 4);
  assert.equal(dana.system.magic, 4);
  assert.equal(ep().clues, 3);
});

test("answering a Life gives 1 Magic; an unanswered Life costs 1 Magic at the showdown", async () => {
  await asUser(p1, () => dana.update({ "system.lifeAnswered": true, "system.magic": dana.system.magic + 1 }));
  const juneMagic = june.system.magic;
  const quinnMagic = quinn.system.magic;
  await asUser(gm, async () => { for (let i = 0; i < 5; i++) await game.witchWard.episode.endScene(); });
  await settle();
  const s = ep();
  assert.equal(s.phase, "showdown", "Doom reached the mark: the threat comes to them");
  assert.equal(s.place, "public");
  assert.equal(s.innocent, "grip");
  assert.equal(june.system.magic, juneMagic - 1);
  assert.equal(quinn.system.magic, quinnMagic - 1);
  assert.equal(dana.system.magic, 5);
});

test("the threat acts: targets by the d6, the target defends from the card", async () => {
  // Nobody has hurt it: a 2 becomes "most Hurt" → Dana (1 Hurt).
  diceQueue.push(2);
  await asUser(gm, () => game.witchWard.threatTurn());
  await settle();
  const msg = lastCard();
  const root = renderMessage(msg, p1);
  // Dana defends: Nerve 3 + Force? No: Force doesn't fit defending. 3 dice against Danger 1; a Failure = Hit 2.
  diceQueue.push(1, 2, 3);
  answer({ purpose: "defend", rating: "nerve", difficulty: "1" });
  clickButton(root, "Defend: Dana", p1);
  await settle();
  assert.equal(dana.system.hurt, 3);
  // June can't press Dana's button.
  const other = renderMessage(msg, p2);
  assert.ok(other.buttons().find(b => b.textContent.includes("Defend: Dana")).disabled);
});

test("freeing the innocent, damage to Broken, then the Unmaking", async () => {
  // Dana frees the innocent: Nerve 3 + Force 2, Defence 2 (Easy 1, +1 without the Weakness).
  diceQueue.push(5, 5, 1, 1, 1);
  answer({ purpose: "free", rating: "nerve", difficulty: "2", powerFits: true });
  await asUser(p1, () => game.witchWard.rollDialog(dana, { purpose: "free" }));
  await settle();
  assert.equal(ep().innocent, "free");
  assert.equal(ep().castingThisRound, true);
  await asUser(gm, () => game.witchWard.episode.endRound());
  await settle();
  assert.equal(ep().innocent, "free", "freed in round 1: not lost");
  assert.equal(ep().exposure, 2, "public casting this round: Exposure +1");
  // Damage it to Broken by hand, then unmake: D = 3 witches + 2 without the Weakness = 5.
  await asUser(gm, () => game.witchWard.episode.adjust("damage", 99));
  await settle();
  assert.equal(ep().broken, true);
  assert.equal(ep().innocent, "free");
  // Leader June: Craft 2 + 2 joiners × 2 = 6 dice.
  diceQueue.push(6, 5, 5, 4, 4, 1);
  await asUser(gm, () => game.witchWard.episode.unmaking({ leaderId: june.id, joinerIds: [dana.id, quinn.id] }));
  await settle();
  const s = ep();
  assert.equal(s.ended, "destroyed");
  assert.equal(s.result, "win");
  assert.equal(s.phase, "closing");
  assert.deepEqual(log.errors, []);
});

test("the tracker and the sheets render", async () => {
  const tracker = await asUser(gm, () => game.witchWard.tracker());
  await settle();
  assert.match(tracker.element.innerHTML, /The Quiet Man/);
  const { WitchSheet, GuardianSheet, ThreatSheet } = await import("../module/sheets.mjs");
  const ws = new WitchSheet({ document: dana });
  await asUser(p1, () => ws.render(true));
  assert.match(ws.element.innerHTML, /Dana Okafor/);
  const rook = await asUser(gm, () => Actor.create(packDoc("coven", "7-rook", "guardian")));
  const gs = new GuardianSheet({ document: rook });
  await asUser(gm, () => gs.render(true));
  assert.match(gs.element.innerHTML, /Mend/);
  const ts = new ThreatSheet({ document: quiet });
  await asUser(gm, () => ts.render(true));
  assert.match(ts.element.innerHTML, /radio tower/);
  assert.deepEqual(log.errors, []);
});

test("players can't run the episode", async () => {
  await assert.rejects(asUser(p1, () => game.witchWard.episode.set({ active: false })), /Only a GM/);
});
