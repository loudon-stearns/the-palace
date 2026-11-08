// Pour the one deck file into every page that deals from it, between /*DECK*/ and /*/DECK*/.
// The deck lives once, in "Preset Oracle — deck.json" (made by tools/restore-deck.mjs from
// Loudon's original page plus the new cards); the pages carry a copy because a sandboxed page
// can't fetch the file beside it. Run after any change to the deck:
//   node tools/build-deck.mjs [path/to/deck.json]
// Two audiences. The oracle gets every card whole: name, theme, quote, technical guidance, four
// hints, the hidden transmission, and the memory fragments. The encounter journal and sheet
// still carry three slots per card, so they get the theme, the guidance and the transmission in
// them. The 47-card draft and its vetting table were set aside on 2026-11-04 and are not built.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const deckDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bundle = resolve(deckDir, "..");
const deckPath = process.argv[2] ? resolve(process.argv[2]) : resolve(deckDir, "Preset Oracle — deck.json");
const deck = JSON.parse(readFileSync(deckPath, "utf8"));
const ids = new Set();
for (const c of deck.cards) {
  for (const f of ["id", "name", "theme", "technical", "hints", "quote", "surprise"]) if (!c[f]) throw new Error(`card ${c.id || "?"} lacks ${f}`);
  if (c.hints.length !== 4) throw new Error(`card ${c.id} has ${c.hints.length} hints, not four`);
  if (ids.has(c.id)) throw new Error(`duplicate id ${c.id}`); ids.add(c.id);
}

const slots = deck.cards.map(({ id, name, theme, technical, surprise }) => ({ id, name, anchor: theme, constraint: technical, direction: surprise }));
const audiences = [
  { payload: { version: deck.version, fragments: deck.fragments, cards: deck.cards }, pages: [resolve(bundle, "oracle", "Preset Oracle — the oracle.html")] },
  { payload: { version: deck.version, cards: slots }, pages: [
    resolve(bundle, "encounters", "Preset Oracle — encounter journal.html"),
    resolve(bundle, "encounters", "Preset Oracle — encounter sheet.html")] },
];
for (const { payload, pages } of audiences) {
  const text = JSON.stringify(payload).replace(/<\//g, "<\\/");
  for (const t of pages) {
    const s = readFileSync(t, "utf8");
    if (!/\/\*DECK\*\/[\s\S]*?\/\*\/DECK\*\//.test(s)) throw new Error(`no deck markers in ${t}`);
    writeFileSync(t, s.replace(/\/\*DECK\*\/[\s\S]*?\/\*\/DECK\*\//, () => `/*DECK*/${text}/*/DECK*/`));
    console.log(`${payload.cards.length} cards → ${t.split("/").pop()}`);
  }
}
