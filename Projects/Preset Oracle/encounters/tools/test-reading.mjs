// Test the archive reading on a throwaway copy: two invented student records are added beside
// the real ones (they never touch the bundle), the reading is built, and headless Chrome clicks
// through it. Then the real reading is built and screenshotted beside this file.
//   node tools/test-reading.mjs
// No dependencies: Chrome's DevTools protocol over Node's built-in WebSocket.
import { spawn, execFileSync } from "node:child_process";
import { writeFileSync, mkdtempSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const encDir = resolve(here, "..");
const deck = resolve(encDir, "..", "deck", "Preset Oracle — deck draft.json");
const page = "Preset Oracle — archive reading.html";
const tmp = mkdtempSync(join(tmpdir(), "oracle-archive-"));
cpSync(encDir, tmp, { recursive: true });

const fixture = (date, name, maker, minutes, consent, surprise) => writeFileSync(join(tmp, `Preset Oracle — encounter — ${date} — ${name}.md`), [
  "---", `title: "x"`, `date: ${date}`, `challenge: "${name}"`, "card_source: seed deck", `maker: "${maker}"`,
  `setting: "fixture"`, `minutes_to_commit: ${minutes}`, `consent: ${consent}`, "---", "", `# ${name}`, "",
  "> **Anchor** · a  ", "> **Constraint** · b  ", "> **Direction** · c", "",
  "## The instrument\n\nVital, init patch\n", "## The moves\n\n_(left blank)_\n", "## The recording\n\nx.wav\n",
  "## Their reading\n\nINVENTED reading\n", `## The surprise\n\n${surprise}\n`, "## The miss\n\nnothing\n"].join("\n"));
fixture("2099-01-01", "Conatus in a Locked Room", "INVENTED A", 38, "quote-named", "INVENTED surprise one");
fixture("2099-01-02", "Conatus in a Locked Room", "INVENTED B", 52, "keep-private", "INVENTED surprise two");

execFileSync("node", [join(here, "read-archive.mjs"), tmp, deck], { stdio: "inherit" });

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${port}`, "--window-size=1000,1500",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "oracle-"))}`, "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let tabs;
for (let i = 0; i < 40; i++) { try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(250); } }
const ws = new WebSocket(tabs.find((t) => t.type === "page").webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const waiting = new Map(); const errors = [];
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (waiting.has(d.id)) { waiting.get(d.id)(d); waiting.delete(d.id); }
  if (d.method === "Runtime.exceptionThrown") errors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text); };
const send = (method, params = {}) => new Promise((r) => { const n = ++id; waiting.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });
const js = async (expr) => (await send("Runtime.evaluate", { expression: expr, returnByValue: true })).result.result.value;
async function click(sel) {
  await js(`document.querySelector(${JSON.stringify(sel)}).scrollIntoView({block:"center"})`);
  const box = await js(`(() => { const r = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return [r.x + r.width / 2, r.y + r.height / 2]; })()`);
  for (const type of ["mousePressed", "mouseReleased"]) await send("Input.dispatchMouseEvent", { type, x: box[0], y: box[1], button: "left", clickCount: 1 });
  await sleep(120);
}
const results = []; const check = (name, ok, detail = "") => results.push({ name, ok, detail });
await send("Runtime.enable"); await send("Page.enable");

await send("Page.navigate", { url: pathToFileURL(join(tmp, page)).href }); await sleep(900);
check("3 records read (2 student, 1 agent)", await js(`ARCHIVE.records.length===3 && ARCHIVE.records.filter(r=>r.kind==="agent").length===1`));
check("two students is still too few to read across", /Not enough to read across/.test(await js(`$("verdict").textContent`)), await js(`$("verdict").textContent`));
check("one candle per dealt card", await js(`document.querySelectorAll(".candle:not(.off-deck)").length === ARCHIVE.dealt.length`), String(await js(`ARCHIVE.dealt.length`)));
check("the answered card burns two student flames", await js(`document.querySelector('.candle[data-name="Conatus in a Locked Room"] .flames').querySelectorAll(".flame:not(.agent)").length`) === 2);
check("the steward's Parmenides burns one agent flame", await js(`document.querySelector('.candle[data-name="Parmenides Dying Alone in a Warehouse"] .flame.agent') !== null`));
check("two timed dots on the clock strip", (await js(`document.querySelectorAll(".dot").length`)) === 2);
check("the clock note says one ran past 45", /1 ran past 45/.test(await js(`$("clocknote").textContent`)), await js(`$("clocknote").textContent`));
check("the spread opens on the surprise, students first", await js(`document.querySelectorAll(".leaf")[0].textContent.includes("INVENTED surprise") && document.querySelectorAll(".leaf")[2].classList.contains("agent")`));
check("the agent leaf says its surprise was measured", /measured, not heard/.test(await js(`document.querySelector(".leaf.agent .who").textContent`)));
check("the keep-private record is sealed and unnamed", await js(`[...document.querySelectorAll(".leaf")].some(l => l.querySelector(".seal") && !l.textContent.includes("INVENTED B") && l.textContent.includes("a student"))`));
await click('.candle[data-name="Conatus in a Locked Room"]');
check("clicking a candle reads only its card", (await js(`document.querySelectorAll(".leaf").length`)) === 2);
await click('.fields button[data-field="The moves"]');
check("switching to moves shows the blank as blank", await js(`document.querySelectorAll(".leaf .blank").length`) === 2);
await click('.candle[data-name="Conatus in a Locked Room"]');
check("clicking it again reads every record", (await js(`document.querySelectorAll(".leaf").length`)) === 3);
await click(".candle.unlit");
check("an unlit candle says no one has answered", /No one has answered this card yet/.test(await js(`$("spread").textContent`)));
check("no page errors", errors.length === 0, errors.join(" | "));

// The real archive, built in place and photographed.
execFileSync("node", [join(here, "read-archive.mjs")], { stdio: "inherit" });
await send("Page.navigate", { url: pathToFileURL(join(encDir, page)).href }); await sleep(1200);
check("the real reading loads with the steward's record", await js(`ARCHIVE.records.length >= 1 && document.querySelectorAll(".leaf").length >= 1`));
check("the real reading says no student yet", /No student has answered/.test(await js(`$("verdict").textContent`)));
const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
writeFileSync(join(here, "archive-reading.png"), Buffer.from(shot.result.data, "base64"));
check("no page errors on the real reading", errors.length === 0, errors.join(" | "));

chrome.kill();
for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? "  — " + r.detail : ""}`);
const pass = results.filter((r) => r.ok).length;
console.log(`${pass}/${results.length} passed`);
process.exit(pass === results.length ? 0 : 1);
