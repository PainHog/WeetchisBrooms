/**
 * WITCH & WARD — build the Night Market adventure source from the book.
 * -------------------------------------------------------------------
 * Reads Episode 1 (book/src/chapters/32-ch14.html), the ready-made coven and
 * threats (packs/_source/), the episode generator (docs/CONTENT.md) and the
 * scene maps' points files (assets/scenes/*.json), and writes
 * packs/_source/adventures/night-market.json. The book is the source of truth:
 * re-run this after changing Episode 1, then `npm run build:packs`.
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

/* ------------------------------------------------------------ the chapter -- */

const chapter = read("book/src/chapters/32-ch14.html")
  .replace(/<figure[^>]*data-art[^>]*>[\s\S]*?<\/figure>/g, "")
  .replace(/\s+id="[^"]*"/g, "");

/** Split the chapter at its <h3> headings: [{title, html}]. */
function sections(html) {
  const parts = html.split(/<h3>/).slice(1);
  return parts.map(p => {
    const end = p.indexOf("</h3>");
    const title = p.slice(0, end).replace(/<[^>]+>/g, "").trim();
    let body = p.slice(end + 5);
    body = body.replace(/<\/section>\s*$/, "").replace(/<h4>/g, "<h3>").replace(/<\/h4>/g, "</h3>").trim();
    return { title, html: body };
  });
}
const secs = sections(chapter);
const sec = start => secs.find(s => s.title.toLowerCase().startsWith(start.toLowerCase()));
const slug = s => s.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const text = html => html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

// The "Storyteller only" box before the first <h3>.
const intro = chapter.slice(chapter.indexOf("</h2>") + 5, chapter.indexOf("<h3>")).trim();

// Life calls: the table rows under "Life calls".
const lifeRows = [...(sec("Life calls")?.html ?? "").matchAll(/<tr>\s*<td[^>]*>(\d)<\/td>\s*<td[^>]*>([^<]+)<\/td>\s*<td[^>]*>([\s\S]*?)<\/td>\s*<\/tr>/g)]
  .map(m => `${m[2].trim()}: ${text(m[3])}`);
if (lifeRows.length !== 6) throw new Error(`expected 6 Life calls in Episode 1, found ${lifeRows.length}`);

// The read-aloud opening (the first <em> paragraph under "The opening").
const opening = (sec("The opening")?.html.match(/<p><em>[\s\S]*?<\/em><\/p>/) ?? [""])[0];

/* ---------------------------------------------------------------- actors -- */

const src = (pack, key) => json(`packs/_source/${pack}/${key}.json`);
const covenKeys = ["1-dana-okafor", "2-marco-rossi", "3-june-takeda", "4-quinn-abernathy", "5-tess-lindqvist", "6-noor-haddad", "7-rook"];
const coven = covenKeys.map(k => {
  const d = src("coven", k);
  const s = k.replace(/^\d-/, "");
  const img = token(s) ?? d.img;
  return { key: s, name: d.name, type: d.type, img, token: img, disposition: 1, system: d.system, folder: "f-coven" };
});
const quiet = src("threats", "1-quiet-man");
const people = [
  { key: "grace-ellery", name: "Grace Ellery", role: "innocent", from: "The innocent" },
  { key: "bea-santos", name: "Bea Santos", role: "witness", from: "Leads" },
  { key: "bystander", name: "Bystander", role: "bystander", from: null },
];
const actors = [
  ...coven,
  { key: "quiet-man", name: quiet.name, type: "threat", img: token("quiet-man") ?? quiet.img, token: token("quiet-man") ?? quiet.img, disposition: -1, system: quiet.system, folder: "f-threat" },
  ...people.map(p => ({
    key: p.key, name: p.name, type: "person", img: token(p.key) ?? "icons/svg/mystery-man.svg", token: token(p.key) ?? "icons/svg/mystery-man.svg",
    disposition: 0, folder: "f-people",
    system: { role: p.role, look: "", notes: p.role === "innocent" ? text(sec("The innocent")?.html ?? "").slice(0, 600) : p.role === "witness" ? "The singer at the night market whose voice was stolen. See the episode journal, Leads." : "Anyone else at the scene." },
  })),
];

/* --------------------------------------------------------------- journal -- */

const run = `
<p>This is the book's Episode 1 (Chapter 14), ready to play: an Easy episode against <strong>the Quiet Man</strong>, for 3–5 players and a Storyteller. Play takes 2–3 hours.</p>
<h2>Before the players arrive</h2>
<ol>
<li>Give each player one witch from the <strong>Night Market: the coven</strong> folder (right-click the actor, Configure Ownership, set the player to Owner). If a player wants to play <strong>Rook</strong>, give them Rook; if nobody does, leave Rook unowned.</li>
<li>Show the players the <strong>Night Market: for the players</strong> journal and the <strong>Lantern House</strong> scene.</li>
<li>Run the macro <strong>Start Night Market</strong> (or open the Episode Tracker from the Actors sidebar and press Start an episode). Easy and the Quiet Man are already picked; tick the witches being played, and Rook only if a player plays it. Press Start. Every number for your group is set for you.</li>
</ol>
<h2>Playing</h2>
<ol>
<li>Read the opening aloud (it's in the player journal), then roll on the <strong>Night Market: Life calls</strong> table for each witch, or pick.</li>
<li><strong>Investigation:</strong> use the <strong>Larkhaven</strong> scene; its pins are the places the leads send the coven. Each character takes one action a scene: players roll from their sheets. When everyone has acted, press <strong>End the scene</strong> on the tracker.</li>
<li>When the tracker says the coven may go to it, the players choose: go now (the <strong>Old Radio Tower</strong> scene, a hidden showdown) or keep looking for the Weakness. If Doom reaches the mark first, the Quiet Man comes to them: the <strong>Friday Night Market</strong> scene, with Grace in his grip.</li>
<li><strong>Showdown:</strong> round 1, press <strong>The threat acts</strong> first. Each target clicks Defend on the card. Then the characters act, then <strong>End the round</strong>. From round 2, the characters act first. When he's Broken, press <strong>The Unmaking</strong>.</li>
<li>Play the closing scene from the episode journal.</li>
</ol>
<p>The full rules are in the <em>Rules and episodes</em> compendium and the rulebook. The episode journal below is the book's text.</p>`;

const episodePages = [
  { key: "storyteller", name: "Storyteller only", content: intro },
  ...secs.map(s => ({ key: slug(s.title), name: s.title, content: s.html })),
];
const pageKey = start => slug(sec(start)?.title ?? start);

const lanternHouse = `
<p>A narrow, three-storey house in Old Town with a lamp over the door that has never gone out. The Book lives in the attic. The kitchen is where potions get brewed. The guardian, Rook, is bound to the house.</p>
<ul>
<li><strong>Ground floor:</strong> front room, kitchen (brewing), back door to a walled garden.</li>
<li><strong>First floor:</strong> three bedrooms, bathroom.</li>
<li><strong>Attic:</strong> the Book on a lectern, old trunks, a round window over the street.</li>
</ul>
<p>Researching the Book happens here: a lead using Wits, +1 die, with no Exposure (one character a scene, who may also brew that scene).</p>`;

const journal = [
  { key: "run", name: "Night Market: run this one-shot", folder: "f-journal", pages: [{ key: "start", name: "Start here", content: run }] },
  { key: "episode", name: "Episode 1: Night Market (Storyteller)", folder: "f-journal", pages: episodePages },
  { key: "players", name: "Night Market: for the players", folder: "f-journal", observer: true, pages: [
    { key: "opening", name: "The opening", content: opening },
    { key: "house", name: "The Lantern House", content: lanternHouse },
  ] },
];

/* ---------------------------------------------------------------- tables -- */

// The episode generator, from docs/CONTENT.md ("Episode generator (d6 tables)").
const content = read("docs/CONTENT.md");
const gen = content.slice(content.indexOf("## Episode generator"));
const genRows = gen.split("\n").filter(l => /^\| [1-6] \|/.test(l)).map(l => l.split("|").slice(2, -1).map(c => c.trim()));
const genHead = ["Threat", "Innocent", "Plan (what happens at Doom 12)", "Public place", "Hidden place", "Twist"];
if (genRows.length !== 6) throw new Error("expected 6 generator rows in docs/CONTENT.md");
const tables = [
  { key: "life-calls", name: "Night Market: Life calls", folder: "f-tables", description: "Episode 1: what each witch's Life wants from them this episode.", results: lifeRows },
  ...genHead.map((h, c) => ({ key: `gen-${slug(h)}`, name: `Episode generator: ${h.replace(/ \(.*\)/, "")}`, folder: "f-tables", description: "Chapter 11: roll each table once.", results: genRows.map(r => r[c]) })),
];

/* ---------------------------------------------------------------- macros -- */

const macros = [
  { key: "start", name: "Start Night Market", folder: "f-macros", img: "icons/svg/book.svg", command: 'game.witchWard.episode.startDialog({ label: "easy", threatName: "The Quiet Man" });' },
  { key: "tracker", name: "Episode Tracker", folder: "f-macros", img: "icons/svg/clockwork.svg", command: "game.witchWard.tracker();" },
];

/* ---------------------------------------------------------------- scenes -- */

const covenOrder = ["dana-okafor", "marco-rossi", "june-takeda", "quinn-abernathy", "tess-lindqvist", "noor-haddad", "rook"];
function scene(key, name, file, { gridless = false, journalPage = null, threat = false, innocent = false, coven = true } = {}) {
  const pts = json(`assets/scenes/${file}.json`);
  const bg = asset(`assets/scenes/${file}.webp`);
  if (!bg) throw new Error(`missing map assets/scenes/${file}.webp`);
  const tokens = [];
  if (coven && pts.tokens?.coven) pts.tokens.coven.slice(0, 7).forEach(([x, y], i) => tokens.push({ actor: covenOrder[i], x, y }));
  if (threat && pts.tokens?.threat) tokens.push({ actor: "quiet-man", x: pts.tokens.threat[0], y: pts.tokens.threat[1] });
  if (innocent && pts.tokens?.innocent) tokens.push({ actor: "grace-ellery", x: pts.tokens.innocent[0], y: pts.tokens.innocent[1] });
  const notes = (pts.points ?? []).map(p => ({ journal: "episode", page: journalPage, x: p.x, y: p.y, text: p.label, icon: "icons/svg/book.svg" }));
  return { key, name, background: bg, width: pts.width, height: pts.height, grid: pts.grid ?? 100, gridless, journal: "episode", journalPage, folder: "f-scenes", tokens, notes };
}
const scenes = [
  scene("larkhaven", "Larkhaven", "larkhaven", { gridless: true, journalPage: pageKey("Leads"), coven: false }),
  { ...scene("lantern-house", "The Lantern House", "lantern-house", { journalPage: null }), journal: "players", journalPage: "house", notes: [] },
  scene("night-market", "The Friday Night Market", "night-market", { journalPage: pageKey("The public place"), threat: true, innocent: true }),
  scene("radio-tower", "The Old Radio Tower", "radio-tower", { journalPage: pageKey("The hidden place"), threat: true }),
];

/* --------------------------------------------------------------- folders -- */

const folders = [
  { key: "f-coven", name: "Night Market: the coven", type: "Actor" },
  { key: "f-threat", name: "Night Market: the threat", type: "Actor" },
  { key: "f-people", name: "Night Market: people", type: "Actor" },
  { key: "f-scenes", name: "Night Market", type: "Scene" },
  { key: "f-journal", name: "Night Market", type: "JournalEntry" },
  { key: "f-tables", name: "Witch & Ward tables", type: "RollTable" },
  { key: "f-macros", name: "Witch & Ward", type: "Macro" },
];

const adventure = {
  key: "night-market",
  name: "Episode 1: Night Market",
  img: asset("assets/scenes/night-market.webp"),
  caption: "A ready-to-play one-shot: an Easy episode against the Quiet Man.",
  description: "<p>Friday night in Old Town, a singer's voice is stolen in front of a hundred people. The coven has until Doom fills to find the Quiet Man before he takes the seventh voice he needs.</p><p>Includes the ready-made coven and Rook, the Quiet Man, Grace Ellery and Bea Santos; four scenes (Larkhaven, the Lantern House, the Friday Night Market, the Old Radio Tower); the full episode journal from the rulebook; the Life calls and episode generator tables; and macros to start the episode and open the Episode Tracker. Start with the journal <em>Night Market: run this one-shot</em>.</p>",
  folders, actors, journal, tables, macros, scenes,
};

mkdirSync(join(SRC, "adventures"), { recursive: true });
writeFileSync(join(SRC, "adventures", "night-market.json"), JSON.stringify(adventure, null, 2) + "\n");
console.log(`Wrote packs/_source/adventures/night-market.json: ${actors.length} actors, ${scenes.length} scenes, ${journal.length} journals (${episodePages.length} episode pages), ${tables.length} tables, ${macros.length} macros.`);
