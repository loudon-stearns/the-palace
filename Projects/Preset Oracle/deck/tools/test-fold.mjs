// The whole path from Loudon's verdicts to a student's hands, run on a throwaway copy of the
// bundle so the real deck is never touched: take the hand-back the vetting table's own
// click-through wrote (handback-sample.txt: one kept, one mended, one struck), fold it, rebuild
// the pages, then deal through the copied journal in headless Chrome and check what comes out.
//   node tools/click-through.mjs && node tools/test-fold.mjs
import { cpSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const bundle = resolve(here, "..", "..");
const mirror = mkdtempSync(join(tmpdir(), "oracle-fold-"));
for (const d of ["deck", "encounters"]) cpSync(join(bundle, d), join(mirror, d), { recursive: true });
const deckPath = join(mirror, "deck", "Preset Oracle — deck draft.json");
const before = JSON.parse(readFileSync(deckPath, "utf8"));
const V = JSON.parse(readFileSync(join(here, "handback-sample.txt"), "utf8").split("\n").filter((l) => l.startsWith("verdicts-json:")).pop().slice(14));
const run = (...a) => execFileSync("node", a, { encoding: "utf8" });
const results = [];
const check = (what, ok, detail = "") => { results.push({ what, ok }); console.log(`${ok ? "PASS" : "FAIL"}  ${what}${detail ? "  — " + detail : ""}`); };

const ids = Object.keys(V);
const kept = ids.find((i) => V[i].verdict === "keep"), mended = ids.find((i) => V[i].verdict === "mend"), struck = ids.find((i) => V[i].verdict === "strike");
const nameOf = (i) => before.cards.find((c) => c.id === i).name;
const dealtBefore = before.cards.filter((c) => c.dealt).length;
const newlyDealt = [kept, mended].filter((i) => !before.cards.find((c) => c.id === i).dealt).length;
const struckWasDealt = before.cards.find((c) => c.id === struck).dealt ? 1 : 0;

// A dry run writes nothing.
run(join(mirror, "deck", "tools", "fold-verdicts.mjs"), join(here, "handback-sample.txt"), "--dry-run");
check("a dry run leaves the deck as it was", readFileSync(deckPath, "utf8") === JSON.stringify(before, null, 0) || JSON.stringify(JSON.parse(readFileSync(deckPath, "utf8"))) === JSON.stringify(before));

// An id the deck doesn't know is refused, and nothing is written.
const bad = join(mirror, "bad.txt");
execFileSync("sh", ["-c", `printf 'verdicts-json: {"no-such-card":{"verdict":"keep"}}\\n' > "${bad}"`]);
let refused = false; try { execFileSync("node", [join(mirror, "deck", "tools", "fold-verdicts.mjs"), bad], { stdio: "pipe" }); } catch { refused = true; }
check("a hand-back naming an unknown card is refused", refused && JSON.stringify(JSON.parse(readFileSync(deckPath, "utf8"))) === JSON.stringify(before));

// The real fold.
const said = run(join(mirror, "deck", "tools", "fold-verdicts.mjs"), join(here, "handback-sample.txt"));
const after = JSON.parse(readFileSync(deckPath, "utf8"));
check("the struck card leaves the deck for the struck list", !after.cards.some((c) => c.id === struck) && after.struck?.[0]?.id === struck && !!after.struck[0].vetted.note, nameOf(struck));
check("the struck card keeps its reason", after.struck?.[0]?.vetted?.note === V[struck].note);
const m = after.cards.find((c) => c.id === mended);
check("the mended card takes Loudon's words", Object.entries(V[mended].mended).every(([f, w]) => m[f] === w), nameOf(mended));
check("the mended card remembers what it was", Object.keys(V[mended].mended).every((f) => m.vetted.was[f] === before.cards.find((c) => c.id === mended)[f]));
check("kept and mended cards are dealt", after.cards.find((c) => c.id === kept).dealt === true && m.dealt === true);
check("47 cards less one struck", after.cards.length === before.cards.length - 1);
check("the version stays draft while cards wait", after.version === before.version);
check("the fold reports what it did", said.includes("1 kept · 1 mended · 1 struck"));

const expected = dealtBefore + newlyDealt - struckWasDealt;
const journal = readFileSync(join(mirror, "encounters", "Preset Oracle — encounter journal.html"), "utf8");
const sheet = readFileSync(join(mirror, "encounters", "Preset Oracle — encounter sheet.html"), "utf8");
const dealtIn = (s) => JSON.parse(s.match(/\/\*DECK\*\/([\s\S]*?)\/\*\/DECK\*\//)[1]).cards;
check(`the journal now deals ${expected} cards`, dealtIn(journal).length === expected, `${dealtIn(journal).length}`);
check("the sheet deals the same cards as the journal", JSON.stringify(dealtIn(sheet)) === JSON.stringify(dealtIn(journal)));
check("no card's back reaches a student page", dealtIn(journal).every((c) => !("why" in c)));
check("no unvetted, undealt card reaches a student page", dealtIn(journal).every((c) => after.cards.find((d) => d.id === c.id).dealt === true));
check("the mended words are what a student reads", dealtIn(journal).find((c) => c.id === mended)?.constraint === m.constraint);

// Deal through the copied journal in a real browser.
const ct = run(join(mirror, "encounters", "tools", "click-through.mjs"));
const tally = ct.trim().split("\n").pop();
check(`the rebuilt journal passes its own click-through (${tally})`, /^(\d+)\/\1 passed$/.test(tally) && ct.includes(`deals all ${expected} cards`));

rmSync(mirror, { recursive: true, force: true });
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
