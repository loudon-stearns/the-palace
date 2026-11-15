// Checks cycle 4's two changes. (1) The class run sheet: every moment's link opens the page with the
// "Sent from class" banner and the readout it names, and one tap starts the sound. (2) The hush fix: the
// just-against-equal playback now stops when Sound is switched off or the rich face sends rich:hush,
// measured as level at the compressor's output. Headless Chromium; it proves state and the audio graph's
// level, not what a student hears through real speakers.
// Run: node "Projects/Rational Hearing/online/check-run-sheet.mjs"   (uses the STIGMERGY app's Playwright)
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "../../../_ops/stigmergy/app/package.json"));
const { chromium } = require("playwright");
const SHEET = pathToFileURL(join(here, "class-run-sheet.html")).href;
const PAGE = pathToFileURL(join(here, "..", "rational-hearing.html")).href;
const results = [];
const check = (name, ok, got) => { results.push({ name, ok: !!ok, got }); console.log((ok ? "pass " : "FAIL ") + name + "  " + JSON.stringify(got)); };

// a level meter on the page's compressor, so "silent" is measured, not assumed
const meter = () => {
  const C = window.AudioContext;
  const make = C.prototype.createDynamicsCompressor;
  C.prototype.createDynamicsCompressor = function () { const c = make.call(this); const an = this.createAnalyser(); an.fftSize = 2048; c.connect(an); window.__an = an; return c; };
  window.__rms = () => { const an = window.__an; if (!an) return 0; const b = new Float32Array(an.fftSize); an.getFloatTimeDomainData(b); let s = 0; for (const x of b) s += x * x; return Math.sqrt(s / b.length); };
};

const browser = await chromium.launch({ args: ["--autoplay-policy=no-user-gesture-required"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, permissions: ["clipboard-read", "clipboard-write"] });
await ctx.addInitScript(meter);
const errors = [];
const sheet = await ctx.newPage(); sheet.on("pageerror", e => errors.push(String(e)));
await sheet.goto(SHEET);
const moments = await sheet.$$eval("#moments li", ls => ls.map(l => ({ title: l.querySelector(".t").textContent, href: l.querySelector("a").href })));
check("run sheet lists the moments", moments.length === 13, moments.length);
check("run sheet warns that file links are local", (await sheet.textContent("#warn")).includes("only on this computer"), null);
await sheet.screenshot({ path: join(here, "run-sheet-1280.png"), fullPage: true });
await sheet.fill("#base", "https://example.org/rational-hearing.html");
const swapped = await sheet.$eval("#moments li a", a => a.href);
check("a pasted web address rebuilds every link", swapped.startsWith("https://example.org/rational-hearing.html?p=1") && (await sheet.textContent("#warn")) === "", swapped);

for (const m of moments) {
  const p = await ctx.newPage(); p.on("pageerror", e => errors.push(String(e)));
  await p.goto(m.href);
  const banner = await p.$eval("#sendBanner", b => ({ shown: !b.hidden, text: b.innerText.split("\n")[0] }));
  await p.click("#sendPlay"); await p.waitForTimeout(300);
  const sound = await p.$eval("#soundBtn", b => b.getAttribute("aria-pressed"));
  const ab = m.href.includes("ab="), playing = await p.$$eval("#temper .col.playing", x => x.length);
  check(m.title + ": banner, then one tap plays" + (ab ? " the comparison" : ""), banner.shown && sound === "true" && (!ab || playing === 1), banner.text);
  await p.close();
}

// the hush fix: play the M3 comparison, switch sound off 0.5 s in, and measure
async function hushTrial(label, how) {
  const p = await ctx.newPage(); p.on("pageerror", e => errors.push(String(e)));
  await p.goto(PAGE);
  await p.click("#soundBtn"); await p.click("#clearBtn");
  await p.click('#temper g.col:has(text.short:text-is("M3"))');
  await p.waitForTimeout(500);
  const during = await p.evaluate(() => window.__rms());
  await how(p);
  await p.waitForTimeout(250);
  const after = await p.evaluate(() => window.__rms());
  const playing = await p.$$eval("#temper .col.playing", x => x.length);
  check(label + ": the comparison stops", during > 0.01 && after < 0.002 && playing === 0, { during: +during.toFixed(4), after: +after.toFixed(5), playing });
  await p.close();
}
await hushTrial("Sound off mid-comparison", p => p.click("#soundBtn"));
await hushTrial("rich:hush mid-comparison", p => p.evaluate(() => window.postMessage({ type: "rich:hush" }, "*")));

check("no page errors", errors.length === 0, errors);
writeFileSync(join(here, "check-run-sheet.json"), JSON.stringify({ ran: new Date().toISOString(), results }, null, 2));
await browser.close();
process.exit(results.every(r => r.ok) ? 0 : 1);
