// Drive the oracle in real headless Chrome the way a maker would: tap to summon, hold for a full
// reading, turn a face-down hint, rub the static off the hidden transmission, accept, say a name,
// refuse three times and meet the sulk, call a remembered card back, and look at it phone-wide.
// No dependencies: Chrome's DevTools protocol over Node's built-in WebSocket.
// Usage: node tools/click-through.mjs   (screenshots land beside this file)
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const page = pathToFileURL(resolve(here, "..", "Preset Oracle — the oracle.html")).href;
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, "--window-size=1400,1400", "--autoplay-policy=no-user-gesture-required",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "oracle-run-"))}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let tabs;
for (let i = 0; i < 40; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(tabs.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const waiting = new Map(); const errors = [];
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (waiting.has(d.id)) { waiting.get(d.id)(d); waiting.delete(d.id); } if (d.method === "Runtime.exceptionThrown") errors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text); };
const send = (method, params = {}) => new Promise((r) => { const n = ++id; waiting.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const js = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true })).result.result.value;
const box = (sel) => js(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2, r.x, r.y, r.width, r.height]; })()`);
const mouse = (type, x, y, extra = {}) => send("Input.dispatchMouseEvent", { type, x, y, button: "left", clickCount: 1, ...extra });
async function press(sel, holdMs = 60) { const [x, y] = await box(sel); await mouse("mouseMoved", x, y, { button: "none" }); await mouse("mousePressed", x, y); await sleep(holdMs); await mouse("mouseReleased", x, y); await sleep(120); }
async function key(k) { await send("Input.dispatchKeyEvent", { type: "keyDown", key: k, text: k }); await send("Input.dispatchKeyEvent", { type: "keyUp", key: k }); await sleep(40); }
async function shot(name) { const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true }); writeFileSync(join(here, name), Buffer.from(r.result.data, "base64")); }
const results = []; const check = (name, ok, detail = "") => { results.push([ok, name, detail]); console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`); };
const state = () => js("window.oracle.state()");

await send("Runtime.enable"); await send("Page.enable");
await send("Page.navigate", { url: page }); await sleep(1500);
check("loads with the whole deck", (await state()).cards === 170, await js("document.getElementById('deckline').textContent"));

await press("#summon", 60);
await sleep(1400);
let s = await state();
check("a quick tap deals a card", !!s.current, s.current);
check("a tap keeps all four hints face-down", (await js("document.querySelectorAll('.hint-tag.down').length")) === 4);
await press(".hint-tag.down");
check("turning one hint over leaves three face-down", (await js("document.querySelectorAll('.hint-tag.down').length")) === 3, await js("document.getElementById('mood').textContent"));

const [, , bx, by, bw, bh] = await box("#static");
for (let row = 0; row < 6; row++) {
  const y = by + bh * (row + 0.5) / 6;
  for (let i = 0; i <= 24; i++) await mouse("mouseMoved", bx + bw * (row % 2 ? 1 - i / 24 : i / 24), y, { button: "none" });
}
await sleep(300);
check("rubbing the static frees the transmission", await js("document.getElementById('staticWrap').classList.contains('clear')"), await js("document.getElementById('mood').textContent"));

await press("#summon", 1800);
await sleep(1600);
check("a long hold gives a full reading: no hint face-down", (await js("document.querySelectorAll('.hint-tag.down').length")) === 0, (await state()).current);
await shot("oracle-full-reading.png");

await press("#accept");
s = await state();
check("accepting starts the thirty-minute gather", s.gather && /gather cools 29:5\d|gather cools 30:00/.test(await js("document.getElementById('deckline').textContent")), await js("document.getElementById('deckline').textContent"));

await js("document.activeElement && document.activeElement.blur()");
for (const k of "rothko") await key(k);
await sleep(1300);
s = await state();
check("saying ROTHKO deals the Rothko card", s.current === "rothko-field", s.current);
check("dealing a new card abandons the gather", !s.gather);

for (let i = 0; i < 3; i++) { await press("#summon", 60); await sleep(900); await press("#refuse"); await sleep(1300); }
s = await state();
check("three refusals and the oracle sulks", s.sulking && (await js("document.getElementById('summon').disabled")), await js("document.getElementById('mood').textContent"));
await shot("oracle-sulk.png");
await sleep(7300);
check("the sulk passes", !(await state()).sulking && !(await js("document.getElementById('summon').disabled")));

// a remembered fragment out in the margin, where fragments are meant to be touched
await js("fragment('∿ BASHO_FROG.pond · remembered ∿', cards.find(c => c.id === 'basho-frog-pond')); [...document.querySelectorAll('.memory-fragment.remembered')].pop().style.left = '3%'");
await sleep(2500);
const fr = await js(`(() => { const f = [...document.querySelectorAll('.memory-fragment.remembered')].pop(); if (!f) return null; const r = f.getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
if (fr) { await mouse("mousePressed", fr[0], fr[1]); await mouse("mouseReleased", fr[0], fr[1]); }
await sleep(1300);
check("touching a remembered fragment calls its card back", (await state()).current === "basho-frog-pond", (await state()).current);

await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await sleep(500);
const overflow = await js("document.documentElement.scrollWidth - document.documentElement.clientWidth");
check("no sideways scroll at phone width", overflow <= 0, `overflow ${overflow}px`);
await shot("oracle-phone.png");

check("no script errors", errors.length === 0, errors.join(" | "));
const passed = results.filter((r) => r[0]).length;
console.log(`${passed}/${results.length} passed`);
chrome.kill();
process.exit(passed === results.length ? 0 : 1);
