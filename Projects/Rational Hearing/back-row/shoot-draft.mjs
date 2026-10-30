// Measures the ladder labels of the projector draft beside the live page, at 1280×720 and 1920×1080 in Projector mode,
// and screenshots the ladder of each. Same measure as measure.mjs (getScreenCTM × font-size × cap height).
// Run: node "Projects/Rational Hearing/back-row/shoot-draft.mjs"
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "../../../_ops/stigmergy/app/package.json"));
const { chromium } = require("playwright");
const PAGES = { live: join(here, "..", "rational-hearing.html"), draft: join(here, "rational-hearing-projector-draft.html") };
const CAP = 0.73;
const browser = await chromium.launch();
const out = { measured: new Date().toISOString(), runs: [] };
for (const [name, file] of Object.entries(PAGES)) for (const [w, h] of [[1280, 720], [1920, 1080]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errs = []; page.on("pageerror", e => errs.push(String(e)));
  await page.goto(pathToFileURL(file).href + "?present=on"); await page.waitForTimeout(400);
  const groups = await page.evaluate(CAP => {
    const g = el => el.closest(".node") ? (el.classList.contains("num") ? "ladder numerals" : "ladder letter names")
      : el.closest(".edge") ? "ladder edge labels" : el.closest(".brackets") ? "bracket column" : "column heads";
    const acc = {};
    document.querySelectorAll("#ladder text").forEach(el => {
      if (!el.textContent.trim()) return;
      const m = el.getScreenCTM(); const px = parseFloat(getComputedStyle(el).fontSize) * Math.hypot(m.a, m.b) * CAP;
      const k = g(el); acc[k] = Math.min(acc[k] ?? 1e9, px);
    });
    return acc;
  }, CAP);
  // overlaps between text boxes on the ladder, a crude collision check
  const overlaps = await page.evaluate(() => {
    const t = [...document.querySelectorAll("#ladder text")].filter(e => e.textContent.trim()).map(e => ({ s: e.textContent, r: e.getBoundingClientRect() }));
    const hits = [];
    for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) {
      const a = t[i].r, b = t[j].r;
      if (a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) hits.push(t[i].s + " × " + t[j].s);
    }
    return hits;
  });
  // a tap on P5 still lights the pair
  await page.click(".edge >> text=P5"); await page.waitForTimeout(100);
  const lit = await page.$$eval(".edge.lit text", e => e.map(x => x.textContent));
  const shot = `draft-${name}-${w}x${h}.png`;
  await page.locator(".panel.ladder").screenshot({ path: join(here, shot) });
  out.runs.push({ page: name, screen: [w, h], cap_px: groups, overlaps, lit_after_tapping_P5: lit, errors: errs, shot });
  await page.close();
}
await browser.close();
writeFileSync(join(here, "draft-measure.json"), JSON.stringify(out, null, 1));
for (const r of out.runs) console.log(r.page, r.screen.join("x"), JSON.stringify(r.cap_px), "overlaps:", r.overlaps.length, r.overlaps.slice(0,6), "lit:", r.lit_after_tapping_P5, "errs:", r.errors);
