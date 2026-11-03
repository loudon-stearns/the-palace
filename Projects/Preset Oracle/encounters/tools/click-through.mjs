// Click through the encounter journal in real headless Chrome, the way a person would:
// draw (asking twice if the oracle is reluctant), start and commit the clock, fill the form,
// try to write before consent, write after it, and check the record that comes out.
// No dependencies: Chrome's DevTools protocol over Node's built-in WebSocket.
// Usage: node click-through.mjs   (screenshot lands beside this file)
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const journal = pathToFileURL(resolve(here, "..", "Preset Oracle — encounter journal.html")).href;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, "--window-size=900,2600",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "oracle-"))}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let tabs;
for (let i = 0; i < 40; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(tabs.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const waiting = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (waiting.has(d.id)) { waiting.get(d.id)(d); waiting.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const n = ++id; waiting.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const js = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.result.value;

// A real click: find the element's box and send mouse events to its centre.
async function click(sel) {
  const box = await js(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
  for (const type of ["mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x: box[0], y: box[1], button: "left", clickCount: 1 });
  await sleep(60);
}
async function type(sel, text) { await click(sel); await send("Input.insertText", { text }); }

const results = []; const check = (name, ok, detail = "") => results.push({ name, ok, detail });
const errors = [];
await send("Runtime.enable");
ws.addEventListener("message", (m) => { const d = JSON.parse(m.data); if (d.method === "Runtime.exceptionThrown") errors.push(d.params.exceptionDetails.text); });
await send("Page.enable");
await send("Page.navigate", { url: journal });
await sleep(800);

// i · draw — the oracle may refuse once (30%); a person clicks again.
let tries = 0;
while ((await js(`document.getElementById("c-name").textContent`)) === "—" && tries < 6) { await click("#draw"); tries++; }
const drawn = await js(`document.getElementById("c-name").textContent`);
check("a card is drawn by clicking", drawn !== "—", `${drawn} (after ${tries} click${tries > 1 ? "s" : ""})`);

// Draw through the whole deck: seven distinct cards before any repeat.
const seen = new Set([drawn]);
for (let k = 0; k < 40 && seen.size < 7; k++) { await click("#draw"); seen.add(await js(`document.getElementById("c-name").textContent`)); }
check("the seed deck deals all seven", seen.size === 7, `${seen.size} distinct`);

// Or the card from the oracle itself.
await click("#ownToggle");
await type("#o-name", "The Pleasure Boat Upside Down: Reprise");
await type("#o-anchor", "Barthes");
await type("#o-constraint", "No more than two oscillators");
await type("#o-direction", "A rowboat in fog");
await click("#useOwn");
const own = await js(`document.getElementById("c-name").textContent`);
check("a typed-in card replaces the drawn one", own.startsWith("The Pleasure Boat"), own);

// ii · make — the clock runs and commits.
await click("#start"); await sleep(1300);
const t = await js(`document.getElementById("timer").textContent`);
check("the clock counts down", t !== "45:00", t);
await click("#commit");
check("committing stops the clock", /Committed at minute 0/.test(await js(`document.getElementById("commitNote").textContent`)));

// iii · say what happened
await type("#maker", "R. M.: second year");
await type("#setting", "MTEC 210, Tuesday studio");
await type("#instrument", "Vital, init patch");
await type("#moves", "Two oscillators, one FM'd by the other. Then a slow detune.");
await type("#recording", "rm-pleasure-boat.wav");
await type("#reading", "Barthes says the pleasure is in the gap. I left a gap.");
await type("#surprise", "The detune made it sound like it was \"breathing\".");

// iv · keep — before consent, it refuses.
await click("#make");
check("it will not write before consent", /before writing/.test(await js(`document.getElementById("warn").textContent`)));
await js(`(() => { const s = document.getElementById("consent"); s.value = "quote-named"; s.dispatchEvent(new Event("change")); })()`);
await click("#make");
const rec = await js(`document.getElementById("out").textContent`);
check("the record carries the typed card", rec.includes('challenge: "The Pleasure Boat Upside Down: Reprise"'));
check("card_source says the oracle", rec.includes("card_source: the oracle"));
check("a name with a colon stays quoted", rec.includes('maker: "R. M.: second year"'));
check("double quotes in a field can't break the header", !/maker: ".*".*"/.test(rec));
check("minutes_to_commit is recorded", /minutes_to_commit: 0/.test(rec));
check("empty miss is marked, not dropped", rec.includes("## The miss\n\n_(left blank)_"));

// Anonymous consent hides the name.
await js(`(() => { const s = document.getElementById("consent"); s.value = "quote-anonymous"; })()`);
await click("#make");
check("anonymous consent names no one", (await js(`document.getElementById("out").textContent`)).includes('maker: "anonymous"'));
await js(`(() => { const s = document.getElementById("consent"); s.value = "do-not-keep"; })()`);
await click("#make");
check("don't-keep writes nothing", /Not kept/.test(await js(`document.getElementById("out").textContent`)));

check("no script errors", errors.length === 0, errors.join("; "));

const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
writeFileSync(join(here, "click-through.png"), Buffer.from(shot.result.data, "base64"));
ws.close(); chrome.kill();

for (const r of results) console.log(`${r.ok ? "pass" : "FAIL"}  ${r.name}${r.detail ? "  — " + r.detail : ""}`);
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
