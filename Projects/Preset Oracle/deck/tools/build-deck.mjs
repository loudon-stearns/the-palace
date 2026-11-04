// Pour the one deck file into every page that deals from it, between /*DECK*/ and /*/DECK*/.
// The deck lives once, in "Preset Oracle — deck draft.json"; the pages carry a copy because a
// sandboxed page can't fetch the file beside it. Run after any change to the deck:
//   node tools/build-deck.mjs [path/to/deck.json]
// Two audiences. The vetting table gets every card, backs included. The journal and the
// encounter sheet get only cards marked "dealt": true, fronts only, so no unvetted card and
// no teacher's note reaches a student. tools/fold-verdicts.mjs sets "dealt" from Loudon's verdicts.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const deckDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bundle = resolve(deckDir, "..");
const deckPath = process.argv[2] ? resolve(process.argv[2]) : resolve(deckDir, "Preset Oracle — deck draft.json");
const deck = JSON.parse(readFileSync(deckPath, "utf8"));
const ids = new Set();
for (const c of deck.cards) {
  for (const f of ["id", "name", "anchor", "constraint", "direction", "why", "thinker", "pool"]) if (!c[f]) throw new Error(`card ${c.id || "?"} lacks ${f}`);
  if (ids.has(c.id)) throw new Error(`duplicate id ${c.id}`); ids.add(c.id);
}
const dealt = deck.cards.filter((c) => c.dealt === true)
  .map(({ id, name, anchor, constraint, direction }) => ({ id, name, anchor, constraint, direction }));
if (!dealt.length) throw new Error("no card is dealt: the journal and the sheet would have nothing to deal");

const audiences = [
  { payload: { version: deck.version, cards: deck.cards }, pages: [resolve(deckDir, "Preset Oracle — vetting table.html")] },
  { payload: { version: deck.version, cards: dealt }, pages: [
    resolve(bundle, "encounters", "Preset Oracle — encounter journal.html"),
    resolve(bundle, "encounters", "Preset Oracle — encounter sheet.html")] },
];
for (const { payload, pages } of audiences) {
  const text = JSON.stringify(payload);
  for (const t of pages) {
    const s = readFileSync(t, "utf8");
    if (!/\/\*DECK\*\/[\s\S]*?\/\*\/DECK\*\//.test(s)) throw new Error(`no deck markers in ${t}`);
    writeFileSync(t, s.replace(/\/\*DECK\*\/[\s\S]*?\/\*\/DECK\*\//, () => `/*DECK*/${text}/*/DECK*/`));
    console.log(`${payload.cards.length} cards → ${t.split("/").pop()}`);
  }
}
