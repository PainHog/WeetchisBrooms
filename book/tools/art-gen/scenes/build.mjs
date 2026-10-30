// Regenerate book art: node book/tools/art-gen/scenes/build.mjs [name ...]
// Every exported function of the modules below whose name matches PIECE is a piece;
// its name with "_" → "-" is the art name (book/art/<name>.svg). Add new scene
// modules to `mods` (a module that doesn't exist yet is skipped).
import { writeFileSync } from "node:fs";
import { ART } from "./lib.mjs";
const mods = ["./placeholders.mjs"];
const map = {};
const PIECE = /^(placeholder|cover|part_|ch_|map_|diagram_|orn_|spot_)/;
for (const m of mods) {
  let mm; try { mm = await import(m); } catch (e) { if (e.code === "ERR_MODULE_NOT_FOUND" && e.message.includes(m.slice(2))) continue; throw e; }
  for (const [k, v] of Object.entries(mm)) if (typeof v === "function" && PIECE.test(k)) map[k.replace(/_/g, "-")] = v;
}
const want = process.argv.slice(2);
for (const name of (want.length ? want : Object.keys(map))) {
  if (!map[name]) { console.error("no piece", name); process.exitCode = 1; continue; }
  const out = map[name]();
  if (/<image|<script|feTurbulence|href="http|width="\d+" height="\d+" (?:role|viewBox)/.test(out)) console.error("WARN forbidden content in", name);
  writeFileSync(ART + name + ".svg", out);
  console.log("wrote", name, out.length);
}
