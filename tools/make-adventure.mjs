/**
 * WITCH & WARD — build the ready-made episodes' adventure sources from the book.
 * ---------------------------------------------------------------------------
 * Reads each episode chapter (book/src/chapters/32-ch14.html, 33-ch15.html,
 * 34-ch16.html), the ready-made coven and threats (packs/_source/), the episode
 * generator (docs/CONTENT.md) and the scene maps' points files
 * (assets/scenes/*.json), and writes packs/_source/adventures/<episode>.json.
 * The book is the source of truth: re-run this after changing an episode, then
 * `npm run build:packs`.
 *
 * Usage:  node tools/make-adventure.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { ROOT, SRC } from "./pack-config.mjs";

const SYS = "systems/witch-ward/";
const read = rel => readFileSync(join(ROOT, rel), "utf8");
const json = rel => JSON.parse(read(rel));
const asset = rel => (existsSync(join(ROOT, rel)) ? SYS + rel : null);
const token = slug => asset(`assets/tokens/${slug}.webp`);
const slug = s => s.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const text = html => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

/** The three ready-made episodes (Chapters 14–16). */
const EPISODES = [
  {
    key: "night-market", number: 1, title: "Night Market", chapter: "32-ch14", label: "easy", threat: "1-quiet-man",
    innocent: { key: "grace-ellery", name: "Grace Ellery" }, witnesses: [{ key: "bea-santos", name: "Bea Santos", notes: "The singer at the night market whose voice was stolen. See the episode journal, Leads." }],
    publicMap: "night-market", publicName: "The Friday Night Market", hiddenMap: "radio-tower", hiddenName: "The Old Radio Tower",
    cityNotes: true, generator: true,
    blurb: "Friday night in Old Town, a singer's voice is stolen in front of a hundred people. The coven has until Doom fills to find the Quiet Man before he takes the voice he needs.",
  },
  {
    key: "cinders", number: 2, title: "Cinders", chapter: "33-ch15", label: "standard", threat: "2-ash-widow",
    innocent: { key: "hannah-price", name: "Hannah Price" }, witnesses: [],
    publicMap: "harbour-fireworks", publicName: "The Harbour Fireworks", hiddenMap: "mariner-theatre", hiddenName: "The Mariner Theatre",
    cityNotes: false, generator: false,
    blurb: "A row of old houses burns in the shape of a wedding ring. A firefighter is getting married next week, and the Ash Widow wants the bride.",
  },
  {
    key: "low-tide", number: 3, title: "Low Tide", chapter: "34-ch16", label: "hard", threat: "6-drowned-choir",
    innocent: { key: "finn-marlow", name: "Finn Marlow" }, witnesses: [],
    publicMap: "long-pier", publicName: "The Long Pier at Dusk", hiddenMap: "drowned-village", hiddenName: "The Drowned Village",
    cityNotes: false, generator: false,
    blurb: "Three people walk into the sea at dusk, singing. The Drowned Choir wants one more voice, and a boy from the school choir hears it calling.",
  },
];

const LABEL = { easy: "Easy", standard: "Standard", hard: "Hard" };

/* ------------------------------------------------------------- shared bits -- */

const src = (pack, key) => json(`packs/_source/${pack}/${key}.json`);
const covenKeys = ["1-dana-okafor", "2-marco-rossi", "3-june-takeda", "4-quinn-abernathy", "5-tess-lindqvist", "6-noor-haddad", "7-rook"];
const covenOrder = covenKeys.map(k => k.replace(/^\d-/, ""));

// The episode generator, from docs/CONTENT.md ("Episode generator (d6 tables)").
const content = read("docs/CONTENT.md");
const gen = content.slice(content.indexOf("## Episode generator"));
const genRows = gen.split("\n").filter(l => /^\| [1-6] \|/.test(l)).map(l => l.split("|").slice(2, -1).map(c => c.trim()));
const genHead = ["Threat", "Innocent", "Plan (what happens at Doom 12)", "Public place", "Hidden place", "Twist"];
if (genRows.length !== 6) throw new Error("expected 6 generator rows in docs/CONTENT.md");

const lanternHouse = `
<p>A narrow, three-storey house in Old Town with a lamp over the door that has never gone out. The Book lives in the attic. The kitchen is where potions get brewed. The guardian, Rook, is bound to the house.</p>
<ul>
<li><strong>Ground floor:</strong> front room, kitchen (brewing), back door to a walled garden.</li>
<li><strong>First floor:</strong> three bedrooms, bathroom.</li>
<li><strong>Attic:</strong> the Book on a lectern, old trunks, a round window over the street.</li>
</ul>
<p>Researching the Book happens here: a lead using Wits, +1 die, with no Exposure (one character a scene, who may also brew that scene).</p>`;

/* --------------------------------------------------------------- one episode -- */

function build(ep) {
  const chapter = read(`book/src/chapters/${ep.chapter}.html`)
    .replace(/<figure[^>]*data-art[^>]*>[\s\S]*?<\/figure>/g, "")
    .replace(/\s+id="[^"]*"/g, "");
  const secs = chapter.split(/<h3>/).slice(1).map(p => {
    const end = p.indexOf("</h3>");
    return {
      title: p.slice(0, end).replace(/<[^>]+>/g, "").trim(),
      html: p.slice(end + 5).replace(/<\/section>\s*$/, "").replace(/<h4>/g, "<h3>").replace(/<\/h4>/g, "</h3>").trim(),
    };
  });
  const sec = start => secs.find(s => s.title.toLowerCase().startsWith(start.toLowerCase()));
  const pageKey = start => slug(sec(start)?.title ?? start);
  const intro = chapter.slice(chapter.indexOf("</h2>") + 5, chapter.indexOf("<h3>")).trim();
  const lifeRows = [...(sec("Life calls")?.html ?? "").matchAll(/<tr>\s*<td[^>]*>(\d)<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/g)]
    .map(m => `${m[2].trim()}: ${text(m[3])}`);
  if (lifeRows.length !== 6) throw new Error(`expected 6 Life calls in ${ep.chapter}, found ${lifeRows.length}`);
  const opening = (sec("The opening")?.html.match(/<p><em>[\s\S]*?<\/em><\/p>/) ?? [""])[0];

  /* actors */
  const coven = covenKeys.map(k => {
    const d = src("coven", k);
    const img = token(k.replace(/^\d-/, "")) ?? d.img;
    return { key: k.replace(/^\d-/, ""), name: d.name, type: d.type, img, token: img, disposition: 1, system: d.system, folder: "f-coven" };
  });
  const t = src("threats", ep.threat);
  const tslug = ep.threat.replace(/^\d-/, "");
  const person = (key, name, role, notes) => ({
    key, name, type: "person", img: token(key) ?? "icons/svg/mystery-man.svg", token: token(key) ?? "icons/svg/mystery-man.svg",
    disposition: 0, folder: "f-people", system: { role, look: "", notes },
  });
  const actors = [
    ...coven,
    { key: tslug, name: t.name, type: "threat", img: token(tslug) ?? t.img, token: token(tslug) ?? t.img, disposition: -1, system: t.system, folder: "f-threat" },
    person(ep.innocent.key, ep.innocent.name, "innocent", text(sec("The innocent")?.html ?? "").slice(0, 600)),
    ...ep.witnesses.map(w => person(w.key, w.name, "witness", w.notes)),
    person("bystander", "Bystander", "bystander", "Anyone else at the scene."),
  ];

  /* journal */
  const start = `${ep.label === "easy" ? "Start" : "Start " + ep.title}`;
  const run = `
<p>This is the book's Episode ${ep.number} (Chapter ${13 + ep.number}), ready to play: a ${LABEL[ep.label]} episode against <strong>${t.name.replace(/^The /, "the ")}</strong>, for 3–5 players and a Storyteller. Play takes 2–3 hours.</p>
<h2>Before the players arrive</h2>
<ol>
<li>Give each player one witch from the <strong>${ep.title}: the coven</strong> folder (right-click the actor, Configure Ownership, set the player to Owner). If a player wants to play <strong>Rook</strong>, give them Rook; if nobody does, leave Rook unowned.</li>
<li>Show the players the <strong>${ep.title}: for the players</strong> journal and the <strong>Lantern House</strong> scene.</li>
<li>Run the macro <strong>Start ${ep.title}</strong> (or open the Episode Tracker from the Actors sidebar and press Start an episode). ${LABEL[ep.label]} and ${t.name.replace(/^The /, "the ")} are already picked; tick the witches being played, and Rook only if a player plays it. Press Start. Every number for your group is set for you.</li>
</ol>
<h2>Playing</h2>
<ol>
<li>Read the opening aloud (it's in the player journal), then roll on the <strong>${ep.title}: Life calls</strong> table for each witch, or pick.</li>
<li><strong>Investigation:</strong> use the <strong>Larkhaven</strong> scene for the city. Each character takes one action a scene: players roll from their sheets. When everyone has acted, press <strong>End the scene</strong> on the tracker.</li>
<li>When the tracker says the coven may go to it, the players choose: go now (<strong>${ep.hiddenName}</strong>, a hidden showdown) or keep looking for the Weakness. If Doom reaches the mark first, the threat comes to them: <strong>${ep.publicName}</strong>, with ${ep.innocent.name} in its grip.</li>
<li><strong>Showdown:</strong> round 1, press <strong>The threat acts</strong> first. Each target clicks Defend on the card. Then the characters act, then <strong>End the round</strong>. From round 2, the characters act first. When the threat is Broken, press <strong>The Unmaking</strong>.</li>
<li>Play the closing scene from the episode journal.</li>
</ol>
<p>The full rules are in the <em>Rules and episodes</em> compendium and the rulebook. The episode journal below is the book's text.</p>`;
  const journal = [
    { key: "run", name: `${ep.title}: run this episode`, folder: "f-journal", pages: [{ key: "start", name: "Start here", content: run }] },
    { key: "episode", name: `Episode ${ep.number}: ${ep.title} (Storyteller)`, folder: "f-journal", pages: [
      { key: "storyteller", name: "Storyteller only", content: intro },
      ...secs.map(s => ({ key: slug(s.title), name: s.title, content: s.html })),
    ] },
    { key: "players", name: `${ep.title}: for the players`, folder: "f-journal", observer: true, pages: [
      { key: "opening", name: "The opening", content: opening },
      { key: "house", name: "The Lantern House", content: lanternHouse },
    ] },
  ];

  /* tables */
  const tables = [
    { key: "life-calls", name: `${ep.title}: Life calls`, folder: "f-tables", description: `Episode ${ep.number}: what each witch's Life wants from them this episode.`, results: lifeRows },
    ...(ep.generator ? genHead.map((h, c) => ({ key: `gen-${slug(h)}`, name: `Episode generator: ${h.replace(/ \(.*\)/, "")}`, folder: "f-tables", description: "Chapter 11: roll each table once.", results: genRows.map(r => r[c]) })) : []),
  ];

  /* macros */
  const macros = [
    { key: "start", name: `Start ${ep.title}`, folder: "f-macros", img: "icons/svg/book.svg", command: `game.witchWard.episode.startDialog({ label: "${ep.label}", threatName: ${JSON.stringify(t.name)} });` },
    { key: "tracker", name: "Episode Tracker", folder: "f-macros", img: "icons/svg/clockwork.svg", command: "game.witchWard.tracker();" },
  ];

  /* scenes */
  function scene(key, name, file, { gridless = false, journalKey = "episode", journalPage = null, threat = false, innocent = false, coven = true, notes = true } = {}) {
    const pts = json(`assets/scenes/${file}.json`);
    const bg = asset(`assets/scenes/${file}.webp`);
    if (!bg) throw new Error(`missing map assets/scenes/${file}.webp`);
    const tokens = [];
    if (coven && pts.tokens?.coven) pts.tokens.coven.slice(0, 7).forEach(([x, y], i) => tokens.push({ actor: covenOrder[i], x, y }));
    if (threat && pts.tokens?.threat) tokens.push({ actor: tslug, x: pts.tokens.threat[0], y: pts.tokens.threat[1] });
    if (innocent && pts.tokens?.innocent) tokens.push({ actor: ep.innocent.key, x: pts.tokens.innocent[0], y: pts.tokens.innocent[1] });
    const ns = notes ? (pts.points ?? []).map(p => ({ journal: journalKey, page: journalPage, x: p.x, y: p.y, text: p.label, icon: "icons/svg/book.svg" })) : [];
    return { key, name, background: bg, width: pts.width, height: pts.height, grid: pts.grid ?? 100, gridless, journal: journalKey, journalPage, folder: "f-scenes", tokens, notes: ns };
  }
  const scenes = [
    scene("larkhaven", "Larkhaven", "larkhaven", { gridless: true, journalPage: pageKey("Leads"), coven: false, notes: ep.cityNotes }),
    scene("lantern-house", "The Lantern House", "lantern-house", { journalKey: "players", journalPage: "house", notes: false }),
    scene(ep.publicMap, ep.publicName, ep.publicMap, { journalPage: pageKey("The public place"), threat: true, innocent: true }),
    scene(ep.hiddenMap, ep.hiddenName, ep.hiddenMap, { journalPage: pageKey("The hidden place"), threat: true }),
  ];

  const folders = [
    { key: "f-coven", name: `${ep.title}: the coven`, type: "Actor" },
    { key: "f-threat", name: `${ep.title}: the threat`, type: "Actor" },
    { key: "f-people", name: `${ep.title}: people`, type: "Actor" },
    { key: "f-scenes", name: ep.title, type: "Scene" },
    { key: "f-journal", name: ep.title, type: "JournalEntry" },
    { key: "f-tables", name: "Witch & Ward tables", type: "RollTable" },
    { key: "f-macros", name: "Witch & Ward", type: "Macro" },
  ];

  return {
    key: `${ep.number}-${ep.key}`,
    name: `Episode ${ep.number}: ${ep.title}`,
    img: asset(`assets/scenes/${ep.publicMap}.webp`),
    caption: `A ready-to-play episode: ${LABEL[ep.label]}, against ${t.name.replace(/^The /, "the ")}.`,
    description: `<p>${ep.blurb}</p><p>Includes the ready-made coven and Rook, ${t.name.replace(/^The /, "the ")}, ${ep.innocent.name}${ep.witnesses.map(w => ` and ${w.name}`).join("")}; four scenes (Larkhaven, the Lantern House, ${ep.publicName}, ${ep.hiddenName}); the full episode journal from the rulebook; the Life calls table${ep.generator ? " and the episode generator tables" : ""}; and macros to start the episode and open the Episode Tracker. Start with the journal <em>${ep.title}: run this episode</em>. Import one episode per world, or delete the last one's actors first, so names don't repeat.</p>`,
    folders, actors, journal, tables, macros, scenes,
  };
}

mkdirSync(join(SRC, "adventures"), { recursive: true });
for (const ep of EPISODES) {
  const adv = build(ep);
  writeFileSync(join(SRC, "adventures", `${adv.key}.json`), JSON.stringify(adv, null, 2) + "\n");
  console.log(`Wrote ${adv.key}: ${adv.actors.length} actors, ${adv.scenes.length} scenes, ${adv.journal[1].pages.length} episode pages, ${adv.tables.length} tables.`);
}
