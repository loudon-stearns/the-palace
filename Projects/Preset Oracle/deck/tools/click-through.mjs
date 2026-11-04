// Click through the vetting table in real headless Chrome, the way Loudon would:
// draw (asking twice if the oracle hesitates), turn the card over, keep one, mend one by
// typing into the card, strike one with a reason, pick a card from the wheel, and check
// that the hand-back text carries every verdict. Screenshots land beside this file.
// No dependencies: Chrome's DevTools protocol over Node's built-in WebSocket.
// Usage: node tools/click-through.mjs
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const page = pathToFileURL(resolve(here, "..", "Preset Oracle — vetting table.html")).href;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, "--window-size=760,1300",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "oracle-vet-"))}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let tabs;
for (let i = 0; i < 40; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(tabs.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const waiting = new Map(); const errors = [];
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (waiting.has(d.id)) { waiting.get(d.id)(d); waiting.delete(d.id); } if (d.method === "Runtime.exceptionThrown") errors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text); };
const send = (method, params = {}) => new Promise((r) => { const n = ++id; waiting.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const js = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.result.value;
async function clickAt(box) { for (const type of ["mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x: box[0], y: box[1], button: "left", clickCount: 1 }); await sleep(80); }
async function click(sel) { const box = await js(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`); await clickAt(box); }
async function shot(name) { const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }); writeFileSync(join(here, name), Buffer.from(r.result.data, "base64")); }
// The oracle hesitates once per sitting, on any draw: ask again until a new card is dealt.
async function drawNew() { const before = await js(`cur && cur.id`); for (let i = 0; i < 4; i++) { await click("#draw"); if ((await js(`cur && cur.id`)) !== before) return; } }
const results = []; const check = (name, ok, detail = "") => results.push({ name, ok, detail });

await send("Runtime.enable"); await send("Page.enable");
await send("Page.navigate", { url: page }); await sleep(1200);

check("47 glyphs on the wheel", (await js(`document.querySelectorAll('.glyph').length`)) === 47);
check("15 arc names", (await js(`document.querySelectorAll('.arc-label').length`)) === 15);
check("labels stay inside the window", await js(`[...document.querySelectorAll('.arc-label')].every(l => { const r = l.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })`));
await shot("vetting-table-empty.png");

// Draw until a card comes (the oracle may hesitate once).
let name = "";
await drawNew();
name = await js(`document.getElementById('c-name').textContent`);
check("a draw deals a card", await js(`!!document.querySelector('.glyph.current')`), name);
check("an unvetted card flickers", await js(`document.getElementById('card').classList.contains('unvetted')`));

await click("#card"); await sleep(700);
check("clicking the card turns it over", await js(`document.getElementById('card').classList.contains('flipped')`));
await click("#flip"); await sleep(700);

await click("#keep");
check("keep marks the card and its glyph", await js(`document.getElementById('card').classList.contains('keep') && !!document.querySelector('.glyph.current.keep')`));

// Mend: draw another, press mend, type into the constraint on the card.
await drawNew();
const mendName = await js(`document.getElementById('c-name').textContent`);
await click("#mend");
check("mend makes the card's words editable", await js(`document.getElementById('c-constraint').isContentEditable`));
await click("#c-constraint");
await js(`(() => { const e = document.getElementById('c-constraint'); const r = document.createRange(); r.selectNodeContents(e); const s = getSelection(); s.removeAllRanges(); s.addRange(r); })()`);
await send("Input.insertText", { text: "Two oscillators, and only one may move" });
check("typing on the card does not turn it over", !(await js(`document.getElementById('card').classList.contains('flipped')`)));
await click("#noteText"); await send("Input.insertText", { text: "tighter" });
await click("#noteDone");
check("a mended card shows its seam", await js(`getComputedStyle(document.querySelector('#card .seam')).display === 'block'`));
await shot("vetting-table-mended.png");

// Strike: draw a third; the oracle says what is being let go.
await drawNew();
const strikeName = await js(`document.getElementById('c-name').textContent`);
await click("#strike");
check("a strike names what the card was for", (await js(`document.getElementById('voice').textContent`)).startsWith("Struck. It was dealt"));
await click("#noteText"); await send("Input.insertText", { text: "too close to another card" });
await click("#noteDone");

// Pick a card straight from the wheel.
await click('.glyph[data-id="arrival-1"]');
check("a glyph on the wheel deals that card", (await js(`document.getElementById('c-name').textContent`)) === "Heptapod Ink");

// Back to the mended card: its mended words return.
await click(`.glyph[data-id="${await js(`Object.keys(V).find(k => V[k].verdict === 'mend')`)}"]`);
check("the mended words come back when it's drawn again", (await js(`document.getElementById('c-constraint').textContent`)) === "Two oscillators, and only one may move");

const out = await js(`exportText()`);
writeFileSync(join(here, "handback-sample.txt"), out + "\n"); // fed to test-fold.mjs
check("hand-back counts the verdicts", out.includes("3 of 47 vetted · 1 kept · 1 mended · 1 struck"), out.split("\n")[2]);
check("hand-back carries the mend", out.includes("constraint → Two oscillators, and only one may move") && out.includes(mendName));
check("hand-back carries the strike and its reason", out.includes(strikeName) && out.includes("note: too close to another card"));
check("hand-back carries a machine-readable line", /verdicts-json: \{/.test(out));
check("no errors thrown", errors.length === 0, errors.join(" | "));
await js(`document.getElementById('exportBox').open = true`);
await shot("vetting-table-handback.png");

for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? "  — " + r.detail : ""}`);
console.log(`${results.filter((r) => r.ok).length}/${results.length} passed`);
ws.close(); chrome.kill();
