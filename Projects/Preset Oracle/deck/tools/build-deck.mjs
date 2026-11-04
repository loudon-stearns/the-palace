// Pour the one deck file into every page that deals from it, between /*DECK*/ and /*/DECK*/.
// The deck lives once, in "Preset Oracle — deck draft.json"; the pages carry a copy because a
// sandboxed page can't fetch the file beside it. Run after any change to the deck:
//   node tools/build-deck.mjs
// Today it feeds the vetting table only. The journal and the encounter sheet join once Loudon
// has vetted the deck, so no unvetted card reaches a student.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const deckDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const deck = JSON.parse(readFileSync(resolve(deckDir, "Preset Oracle — deck draft.json"), "utf8"));
const targets = [resolve(deckDir, "Preset Oracle — vetting table.html")];
const ids = new Set();
for (const c of deck.cards) {
  for (const f of ["id", "name", "anchor", "constraint", "direction", "why", "thinker", "pool"]) if (!c[f]) throw new Error(`card ${c.id || "?"} lacks ${f}`);
  if (ids.has(c.id)) throw new Error(`duplicate id ${c.id}`); ids.add(c.id);
}
const payload = JSON.stringify({ version: deck.version, cards: deck.cards });
for (const t of targets) {
  const s = readFileSync(t, "utf8");
  const out = s.replace(/\/\*DECK\*\/[\s\S]*?\/\*\/DECK\*\//, `/*DECK*/${payload}/*/DECK*/`);
  if (out === s && !s.includes(payload)) throw new Error(`no deck markers in ${t}`);
  writeFileSync(t, out);
  console.log(`${deck.cards.length} cards → ${t.split("/").pop()}`);
}
