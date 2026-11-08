// Measures whether each of the page's three grids shows all its columns, at the widths a classroom
// projector or a laptop gives, in both keep modes (same notes / same tonic). A grid "hides" when its
// table is wider than its scroll box. Writes grids.json and a still per width.
// Run: node "Projects/Cycle 5 Explorer/workshop/projector-grids/measure-grids.mjs" [page.html] [tag]
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "../../../../_ops/stigmergy/app/package.json"));
const { chromium } = require("playwright");
const target = resolve(process.argv[2] || join(here, "../../cycle5-explorer.html"));
const tag = process.argv[3] || "page";
const widths = [1024, 1280, 1366, 1440, 1920];
const browser = await chromium.launch();
const out = { page: target, tag, ran: new Date().toISOString(), rows: [] };
for (const w of widths) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 } });
  await page.goto(pathToFileURL(target).href);
  await page.waitForTimeout(400);
  for (const keep of ["notes", "tonic"]) {
    if (keep === "tonic") { await page.keyboard.press("t"); await page.waitForTimeout(200); }
    const r = await page.evaluate(() => [...document.querySelectorAll(".grids .scroll")].map(s => {
      const t = s.querySelector("table");
      const tds = [...t.querySelectorAll("td")];
      const min = Math.min(...tds.map(td => td.getBoundingClientRect().width));
      return { id: t.id, box: Math.round(s.clientWidth), table: Math.round(s.scrollWidth),
               hidden_px: Math.max(0, Math.round(s.scrollWidth - s.clientWidth)), min_cell: Math.round(min),
               cols: t.rows[0]?.cells.length };
    }));
    const keepNow = await page.evaluate(() => document.querySelector("[aria-pressed=true][data-keep], [data-keep][aria-pressed=true]")?.dataset.keep || "");
    for (const g of r) out.rows.push({ width: w, keep, keep_read: keepNow, ...g });
  }
  await page.locator(".grids").screenshot({ path: join(here, `${tag}-grids-${w}.png`) });
  await page.close();
}
await browser.close();
writeFileSync(join(here, `${tag}-grids.json`), JSON.stringify(out, null, 1));
for (const r of out.rows) console.log(r.width, r.keep, r.id, `box ${r.box} table ${r.table} hidden ${r.hidden_px} minCell ${r.min_cell}`);
