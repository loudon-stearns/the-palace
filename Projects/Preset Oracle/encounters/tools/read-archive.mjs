// Read every kept encounter together and pour the reading into "Preset Oracle — archive reading.html",
// between /*ARCHIVE*/ and /*/ARCHIVE*/. The page can't fetch the records beside it, so it carries a copy.
// Run after any record is saved to encounters/:
//   node tools/read-archive.mjs [encountersDir] [deck.json]
// What it reads: each record's frontmatter and its sections, as the journal writes them.
// Two kinds of maker are kept apart. A student's surprise is heard; an agent's is measured
// (tuning item 2), so agent records are read as calibration and never counted as students.
// A keep-private record is counted and read, but sealed: the page marks it not for quoting.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const encDir = process.argv[2] ? resolve(process.argv[2]) : resolve(here, "..");
const deckPath = process.argv[3] ? resolve(process.argv[3]) : resolve(here, "..", "..", "deck", "Preset Oracle — deck draft.json");
const page = resolve(encDir, "Preset Oracle — archive reading.html");

const SECTIONS = ["The instrument", "The moves", "The recording", "Their reading", "The surprise", "The miss", "Teacher's note"];
const isAgent = (maker) => /\b(AI|agent|steward|Claude)\b/i.test(maker || "");

function parse(file) {
  const text = readFileSync(file, "utf8");
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) throw new Error(`no frontmatter in ${file}`);
  const meta = {};
  for (const line of fm[1].split("\n")) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (m) meta[m[1]] = m[2].replace(/^"(.*)"$/, "$1");
  }
  for (const f of ["challenge", "date", "consent"]) if (!meta[f]) throw new Error(`${file} lacks ${f}`);
  const body = text.slice(fm[0].length);
  const card = {};
  for (const k of ["Anchor", "Constraint", "Direction"]) {
    const m = body.match(new RegExp(`\\*\\*${k}\\*\\* · (.*?)\\s*$`, "m"));
    card[k.toLowerCase()] = m ? m[1] : "";
  }
  const parts = {};
  const chunks = body.split(/^## /m).slice(1);
  for (const c of chunks) {
    const nl = c.indexOf("\n");
    const head = c.slice(0, nl).trim();
    const val = c.slice(nl).trim();
    if (SECTIONS.includes(head)) parts[head] = val === "_(left blank)_" ? "" : val;
  }
  const minutes = /^\d+(\.\d+)?$/.test(meta.minutes_to_commit || "") ? Number(meta.minutes_to_commit) : null;
  return {
    file: file.split("/").pop(), date: meta.date, challenge: meta.challenge, source: meta.card_source || "",
    maker: meta.maker || "", setting: meta.setting || "", minutes, consent: meta.consent,
    kind: isAgent(meta.maker) ? "agent" : "student", card, parts,
  };
}

const records = readdirSync(encDir)
  .filter((f) => /^Preset Oracle — encounter — \d{4}-\d{2}-\d{2} — .+\.md$/.test(f))
  .sort().map((f) => parse(join(encDir, f)));
if (records.some((r) => r.consent === "do-not-keep")) throw new Error("a do-not-keep record is on disk; the journal should never have written it — remove it");

const deck = JSON.parse(readFileSync(deckPath, "utf8"));
const dealt = deck.cards.filter((c) => c.dealt === true).map(({ id, name, thinker }) => ({ id, name, thinker }));
const waiting = deck.cards.filter((c) => c.dealt !== true).length;

const payload = { readAt: new Date().toISOString().slice(0, 10), deckVersion: deck.version, dealt, waiting, records, sections: SECTIONS };
const s = readFileSync(page, "utf8");
if (!/\/\*ARCHIVE\*\/[\s\S]*?\/\*\/ARCHIVE\*\//.test(s)) throw new Error(`no archive markers in ${page}`);
writeFileSync(page, s.replace(/\/\*ARCHIVE\*\/[\s\S]*?\/\*\/ARCHIVE\*\//, () => `/*ARCHIVE*/${JSON.stringify(payload)}/*/ARCHIVE*/`));
const students = records.filter((r) => r.kind === "student").length;
console.log(`${records.length} record${records.length === 1 ? "" : "s"} (${students} student, ${records.length - students} agent) · ${dealt.length} dealt cards → ${page.split("/").pop()}`);
