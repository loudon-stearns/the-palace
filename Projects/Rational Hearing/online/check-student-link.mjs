// Checks the student link: build a state on the teacher's copy, press "Link for students", open the link as a
// student would, and confirm the student's copy opens on the same partials, fundamental, magnify and A/B, and
// that one tap starts the sound. Headless Chromium; it proves state and audio-graph, not what a student hears.
// Run: node "Projects/Rational Hearing/online/check-student-link.mjs"   (uses the STIGMERGY app's Playwright)
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "../../../_ops/stigmergy/app/package.json"));
const { chromium } = require("playwright");
const PAGE = pathToFileURL(join(here, "..", "rational-hearing.html")).href;
const results = [];
const check = (name, ok, got) => { results.push({ name, ok: !!ok, got }); console.log((ok ? "pass " : "FAIL ") + name + "  " + JSON.stringify(got)); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, permissions: ["clipboard-read", "clipboard-write"] });
const errors = [];
const teacher = await ctx.newPage(); teacher.on("pageerror", e => errors.push(String(e)));
await teacher.goto(PAGE);
check("plain page shows no banner", await teacher.$eval("#sendBanner", b => b.hidden), null);

const cases = [
  { name: "fifth on the ladder", act: async p => { await p.click("#clearBtn"); await p.click('#ladder .edge:has(text:text-is("P5"))'); }, want: { p: "2-3" } },
  { name: "major triad, A, magnified", act: async p => { await p.click("#fundA"); await p.click("#clearBtn"); for (const n of [4, 5, 6]) await p.click(`#spectrum g.hit >> nth=${n - 1}`); await p.click("#magBtn"); }, want: { p: "4-5-6", f: "A", mag: "5" } },
  { name: "major third, just then equal", act: async p => { await p.click("#soundBtn"); await p.click('#chips button:has(b:text-is("M3"))'); await p.click('#temper g.col:has(text.short:text-is("M3"))'); }, want: { p: "4-5", ab: "M3" } },
];
for (const c of cases) {
  await teacher.goto(PAGE); await c.act(teacher); await teacher.click("#linkBtn");
  await teacher.waitForFunction(() => document.getElementById("linkStatus").textContent.length > 0);
  const link = await teacher.evaluate(() => navigator.clipboard.readText());
  const q = Object.fromEntries(new URL(link).searchParams);
  const okQ = Object.entries(c.want).every(([k, v]) => q[k] === v) && Object.keys(q).every(k => k in c.want);
  check(c.name + ": link carries the state", okQ, q);
  const tState = await teacher.evaluate(() => document.getElementById("readout").innerText);

  const student = await ctx.newPage(); student.on("pageerror", e => errors.push(String(e)));
  await student.goto(link);
  const banner = await student.$eval("#sendBanner", b => ({ shown: !b.hidden, text: b.innerText }));
  check(c.name + ": student sees the banner", banner.shown, banner.text.split("\n")[0]);
  const sState = await student.evaluate(() => document.getElementById("readout").innerText);
  check(c.name + ": student readout matches teacher's", sState === tState, sState.split("\n").slice(0, 3).join(" / "));
  if (c.want.mag) check(c.name + ": magnify carried", await student.$eval("#temper", s => s.textContent.includes("GAPS DRAWN ×5")), null);
  if (c.want.f) check(c.name + ": fundamental carried", await student.$eval("#fundA", b => b.getAttribute("aria-pressed")) === "true", null);
  await student.click("#sendPlay");
  await student.waitForTimeout(400);
  const after = await student.evaluate(() => ({ sound: document.getElementById("soundBtn").getAttribute("aria-pressed"), banner: document.getElementById("sendBanner").hidden, playing: document.querySelectorAll("#temper .col.playing").length }));
  check(c.name + ": one tap starts the sound", after.sound === "true" && after.banner, after);
  if (c.want.ab) check(c.name + ": the A/B plays on its own", after.playing === 1, after.playing);
  if (c === cases[0]) await student.screenshot({ path: join(here, "student-fifth-1280x720.png") });
  if (c === cases[2]) { await student.goto(link); await student.screenshot({ path: join(here, "student-third-banner-1280x720.png") }); }
  await student.close();
}
await teacher.goto(PAGE); await teacher.click("#linkBtn"); await teacher.waitForTimeout(200);
await teacher.screenshot({ path: join(here, "teacher-link-copied-1280x720.png"), clip: { x: 0, y: 0, width: 1280, height: 220 } });
check("no page errors", errors.length === 0, errors);
writeFileSync(join(here, "check-student-link.json"), JSON.stringify({ ran: new Date().toISOString(), results }, null, 2));
await browser.close();
process.exit(results.every(r => r.ok) ? 0 : 1);
