// Rehearses the class run-sheet against the page itself: headless Chromium opens cycle5-explorer.html and
// presses the same keys and buttons the run-sheet tells the teacher to press, beat by beat, recording what
// the page then shows (tonic, mode, feel word, the one-note-darker fact, the progression lane) and a still
// per beat. Nothing about the page is copied or changed. build-run-sheet.mjs turns the result into the sheet.
// Run: node "Projects/Cycle 5 Explorer/class/rehearse.mjs"  (uses the STIGMERGY app's Playwright)
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "../../../_ops/stigmergy/app/package.json"));
const { chromium } = require("playwright");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
// silent: the page's synth runs into an offline context nobody renders
await page.addInitScript(() => {
  const Off = window.OfflineAudioContext;
  window.AudioContext = function () { const c = new Off(2, 48000 * 120, 48000); c.resume = () => Promise.resolve(); return c; };
});
await page.goto(pathToFileURL(join(here, "..", "cycle5-explorer.html")).href);
await page.waitForTimeout(400);

const read = () => page.evaluate(() => {
  const mp = document.getElementById("modePanel");
  const facts = [...mp.querySelectorAll("dt")].map(dt => [dt.textContent.trim(), dt.nextElementSibling?.textContent.trim()]);
  return {
    tonic: mp.querySelector(".tonic")?.textContent, mode: mp.querySelector(".mname")?.textContent,
    feel: mp.querySelector(".feel")?.textContent, keep: S.keep, dialect: S.dialect,
    facts: Object.fromEntries(facts),
    lane: [...document.querySelectorAll("#lane .slot")].map(s => ({ r: s.querySelector(".r").textContent, n: s.querySelector(".n").textContent, s: s.querySelector(".s").textContent })),
  };
});
const key = async k => { await page.keyboard.press(k); await page.waitForTimeout(60); };
const shot = async name => { await page.screenshot({ path: join(here, `still-${name}.jpg`), type: "jpeg", quality: 60 }); return `still-${name}.jpg`; };
const beats = [];
const note = (beat, step, state, extra = {}) => beats.push({ beat, step, ...state, ...extra });

// 0 · the room as it opens
note("open", "page as it opens", await read());

// 1 · emotion first: hold the tonic, walk bright to dark (what the "Bright to dark" moment does, by hand)
if ((await read()).keep !== "tonic") await key("t");
for (let i = 0; i < 7; i++) await key("ArrowUp");          // to Lydian
for (let i = 0; i < 7; i++) { const s = await read(); note("emotion", `↓ ${i}`, s); if (i < 6) await key("ArrowDown"); }
for (let i = 0; i < 3; i++) await key("ArrowUp");          // back to Dorian for the still
const stillEmotion = await shot("emotion-dorian");

// 2 · the window: same notes, new home
await key("ArrowUp"); await key("ArrowUp");               // C Ionian
await key("t");                                            // keep -> notes: the C major window, F Lydian to B Locrian
await key("ArrowUp");
for (let i = 0; i < 7; i++) { note("window", `↓ ${i}`, await read()); if (i < 6) await key("ArrowDown"); }
for (let i = 0; i < 5; i++) await key("ArrowUp");          // back home to C Ionian

// 3 · the cycle and the dialects
await page.click('#presetsA button:has-text("Diatonic cycle 5")');
await page.click("#playProg").catch(() => {}); await page.click("#playProg").catch(() => {});
for (let i = 0; i < 4; i++) { note("cycle", `dialect ${i}`, await read()); await key("n"); }
const stillCycle = await shot("cycle");

// 4 · borrow: the preset, then the students' own
if ((await read()).keep !== "tonic") await key("t");
await page.click('#presetsB button:has-text("IV to minor IV")');
note("borrow", "preset IV to minor IV", await read());
await page.click("#clearBtn");
await page.click("#buildBtn");
for (const k of ["1", "6", "4", "5"]) await key(k);
note("borrow", "built I VI IV V by keys 1 6 4 5", await read());
// the students' own: same four, with the VI swapped for ♭VI clicked from the Aeolian row of the grid
await page.click("#clearBtn");
await key("1");
const cell = page.locator('#funcGrid td[data-d="-4"][data-src="4"]').first();
const found = await cell.count();
if (found) await cell.click();
await key("4"); await key("5");
note("borrow", `built I ♭VI IV V: key 1, the ♭VI cell in the Aeolian row (found: ${!!found}), keys 4 5`, await read());
await key("ArrowRight"); await key("ArrowRight");
note("borrow", "→ → two fifths up", await read());
const stillBorrow = await shot("borrow-in-D");

writeFileSync(join(here, "rehearsal.json"), JSON.stringify({ ran: new Date().toISOString(), stills: [stillEmotion, stillCycle, stillBorrow], beats }, null, 1));
await browser.close();
console.log(beats.map(b => `${b.beat} · ${b.step} · ${b.tonic} ${b.mode} · keep ${b.keep} · ${b.dialect} · lane ${b.lane.map(x => x.r + "=" + x.n + (x.s !== "diatonic" ? "[" + x.s + "]" : "")).join(" ")}`).join("\n"));
