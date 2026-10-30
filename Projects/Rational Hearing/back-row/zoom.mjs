// What if Loudon just zooms the browser? Chrome's zoom on a 1280×720 projector is a narrower CSS viewport drawn at a
// higher scale. Renders 100/125/150/175%, Projector mode on, and measures the ladder's edge labels and layout.
// Run: node "Projects/Rational Hearing/back-row/zoom.mjs"
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "../../../_ops/stigmergy/app/package.json"));
const { chromium } = require("playwright");
const PAGE = pathToFileURL(join(here, "..", "rational-hearing.html")).href + "?present=on";
const browser = await chromium.launch(); const res = [];
for (const z of [1, 1.25, 1.5, 1.75, 2]) {
  const page = await browser.newPage({ viewport: { width: Math.round(1280 / z), height: Math.round(720 / z) }, deviceScaleFactor: z });
  await page.goto(PAGE); await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    const cap = (sel) => Math.min(...[...document.querySelectorAll(sel)].map(e => { const m = e.getScreenCTM(); return parseFloat(getComputedStyle(e).fontSize) * Math.hypot(m.a, m.b) * 0.73; }));
    const lad = document.querySelector(".node")?.closest("svg").getBoundingClientRect();
    return { edge_cap_css: cap(".edge text"), num_cap_css: cap(".node .num"), dev_cap_css: cap("#temper .dev"),
      ladder_h_css: lad.height, ladder_w_css: lad.width, overflow_x: document.documentElement.scrollWidth > innerWidth + 1, doc_h_css: document.documentElement.scrollHeight };
  });
  for (const k of Object.keys(r)) if (k.endsWith("_css") && k !== "doc_h_css") r[k.replace("_css", "_px")] = +(r[k] * z).toFixed(1);
  r.ladder_fits_one_screen = r.ladder_h_css <= 720 / z; r.zoom = z;
  const sec = await page.$$eval("section", s => s[0].getBoundingClientRect().top + scrollY);
  await page.evaluate(y => scrollTo(0, y), sec);
  await page.screenshot({ path: join(here, `zoom-${Math.round(z * 100)}-ladder.png`) });
  res.push(r); await page.close();
}
await browser.close(); writeFileSync(join(here, "zoom.json"), JSON.stringify(res, null, 1));
for (const r of res) console.log(r.zoom, "edge cap", r.edge_cap_px, "num", r.num_cap_px, "dev", r.dev_cap_px, "ladder h(css)", r.ladder_h_css.toFixed(0), "fits", r.ladder_fits_one_screen, "ovx", r.overflow_x);
