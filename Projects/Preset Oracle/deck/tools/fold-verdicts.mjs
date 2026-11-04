// Fold Loudon's hand-back from the vetting table into the deck, then rebuild the pages.
// Kept cards are dealt as they are; mended cards take his words and are dealt; struck cards
// leave the deck for its "struck" list, with his reason, so they never reach a student and
// are never drafted again. The hand-back is the text the table's "copy" button gives; only
// its last "verdicts-json:" line is read, so the prose around it can be anything.
//   node tools/fold-verdicts.mjs handback.txt            fold, write the deck, rebuild
//   node tools/fold-verdicts.mjs handback.txt --dry-run  say what would change, write nothing
//   node tools/fold-verdicts.mjs handback.txt --deck other.json --no-build   (for tests)
// Refuses, writing nothing, on an id the deck doesn't know, a verdict it can't read, or a
// mend that would empty a field.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const opt = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const handbackPath = args.find((a, i) => !a.startsWith("--") && args[i - 1] !== "--deck");
if (!handbackPath) { console.error("usage: node tools/fold-verdicts.mjs handback.txt [--dry-run] [--deck path] [--no-build]"); process.exit(2); }
const deckPath = resolve(opt("--deck") || resolve(here, "..", "Preset Oracle — deck draft.json"));

const text = readFileSync(handbackPath, "utf8");
const line = text.split("\n").filter((l) => l.trim().startsWith("verdicts-json:")).pop();
if (!line) throw new Error("no verdicts-json: line in the hand-back — paste the whole text the table's copy button gives");
const V = JSON.parse(line.trim().slice("verdicts-json:".length));
const deck = JSON.parse(readFileSync(deckPath, "utf8"));
const byId = new Map(deck.cards.map((c) => [c.id, c]));
const FIELDS = ["name", "anchor", "constraint", "direction"];
const today = new Date().toISOString().slice(0, 10);

for (const [id, v] of Object.entries(V)) {
  if (!byId.has(id)) throw new Error(`the hand-back names ${id}, which this deck doesn't hold (an older or newer draft?)`);
  if (!["keep", "mend", "strike"].includes(v.verdict)) throw new Error(`${id}: unreadable verdict ${JSON.stringify(v.verdict)}`);
  for (const [f, w] of Object.entries(v.mended || {})) {
    if (!FIELDS.includes(f)) throw new Error(`${id}: a mend to ${f}, which is not a face of the card`);
    if (!String(w).trim()) throw new Error(`${id}: the mend would empty ${f}`);
  }
}

const said = { keep: [], mend: [], strike: [] };
const struck = deck.struck || [];
const cards = [];
for (const c of deck.cards) {
  const v = V[c.id];
  if (!v) { cards.push(c); continue; }
  const vetted = { verdict: v.verdict, on: today, ...(v.note ? { note: v.note } : {}) };
  if (v.verdict === "strike") { struck.push({ ...c, dealt: false, vetted }); said.strike.push(c.name); continue; }
  const next = { ...c, dealt: true, vetted };
  if (v.verdict === "mend") {
    const was = {};
    for (const [f, w] of Object.entries(v.mended || {})) { was[f] = c[f]; next[f] = String(w).trim(); }
    if (Object.keys(was).length) next.vetted.was = was;
    said.mend.push(`${c.name}${Object.keys(was).length ? ` (${Object.keys(was).join(", ")})` : " (note only)"}`);
  } else said.keep.push(c.name);
  cards.push(next);
}
const waiting = cards.filter((c) => !c.vetted).length;
const version = waiting ? deck.version : String(deck.version).replace(/^draft/, "vetted");
const out = { about: deck.about, version, cards, ...(struck.length ? { struck } : {}) };

console.log(`${Object.keys(V).length} verdicts · ${said.keep.length} kept · ${said.mend.length} mended · ${said.strike.length} struck · ${waiting} still waiting`);
for (const k of ["keep", "mend", "strike"]) for (const n of said[k]) console.log(`  ${k.padEnd(6)} ${n}`);
console.log(`dealt to students after this: ${cards.filter((c) => c.dealt === true).length} cards · version ${version}`);
if (flag("--dry-run")) { console.log("(dry run: nothing written)"); process.exit(0); }

// One card per line, as the draft is laid out, so a diff shows one card per change.
const row = (c) => "    " + JSON.stringify(c);
const json = `{\n  "about": ${JSON.stringify(out.about)},\n  "version": ${JSON.stringify(out.version)},\n  "cards": [\n${out.cards.map(row).join(",\n")}\n  ]${out.struck ? `,\n  "struck": [\n${out.struck.map(row).join(",\n")}\n  ]` : ""}\n}\n`;
JSON.parse(json);
writeFileSync(deckPath, json);
console.log(`wrote ${deckPath.split("/").pop()}`);
if (!flag("--no-build")) execFileSync("node", [resolve(here, "build-deck.mjs"), deckPath], { stdio: "inherit" });
