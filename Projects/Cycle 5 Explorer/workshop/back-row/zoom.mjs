// What browser zoom (⌘+) buys on a 1280×720 projector: the page at 125–200% is the page at a narrower CSS
// viewport with a higher device scale. For each zoom: does every grid still show all its columns, does the
// wheel and the inspector fit one screen together, and how big is the smallest grid letter on screen.
// Run: node "Projects/Cycle 5 Explorer/workshop/back-row/zoom.mjs" [page.html] [tag] [?query]
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "../../../../_ops/stigmergy/app/package.json"));
const { chromium } = require("playwright");
const target = resolve(process.argv[2] || join(here, "../../cycle5-explorer.html"));
const tag = process.argv[3] || "page";
const query = process.argv[4] || "";
const [W, H] = [1280, 720], CAP = 0.70;
const ang = px => px * (2 * Math.atan(1 / 16) * 180 / Math.PI * 60) / H; // back row, 8 screen-heights
const browser = await chromium.launch();
const out = { page: target, tag, ran: new Date().toISOString(), screen: [W, H], zooms: [] };
for (const z of [1, 1.25, 1.5, 1.75, 2]) {
  const page = await browser.newPage({ viewport: { width: Math.round(W / z), height: Math.round(H / z) }, deviceScaleFactor: z });
  await page.goto(pathToFileURL(target).href + query); await page.waitForTimeout(400);
  const r = await page.evaluate(() => {
    const box = s => document.querySelector(s)?.getBoundingClientRect();
    const grids = [...document.querySelectorAll(".grids .scroll")].map(s => Math.max(0, s.scrollWidth - s.clientWidth));
    const wheel = box("#wheel"), insp = box("#modePanel");
    const fs = s => parseFloat(getComputedStyle(document.querySelector(s)).fontSize);
    const wm = document.getElementById("wheel").getScreenCTM();
    return { hidden_px: grids, horiz_scroll: document.documentElement.scrollWidth - innerWidth,
      wheel_px: Math.round(wheel.width), wheel_bottom: Math.round(wheel.bottom), insp_bottom: Math.round(insp.bottom),
      cell_font: fs("table.g td"), wheel_scale: +Math.hypot(wm.a, wm.b).toFixed(3), doc_h: document.documentElement.scrollHeight, vh: innerHeight };
  });
  const cellCap = r.cell_font * z * CAP, noteCap = 22 * r.wheel_scale * z * CAP;
  const row = { zoom: z, css_viewport: [Math.round(W / z), Math.round(H / z)], ...r,
    grid_cell_arcmin: +ang(cellCap).toFixed(1), wheel_note_arcmin: +ang(noteCap).toFixed(1),
    screens_tall: +(r.doc_h / r.vh).toFixed(2), shot: `${tag}-zoom-${Math.round(z * 100)}.png` };
  await page.screenshot({ path: join(here, row.shot) });
  out.zooms.push(row); await page.close();
}
await browser.close();
writeFileSync(join(here, `${tag}-zoom.json`), JSON.stringify(out, null, 1));
for (const z of out.zooms) console.log(`${z.zoom * 100}% css ${z.css_viewport.join("x")} · grids hide ${z.hidden_px.join("/")}px · sideways ${z.horiz_scroll}px · wheel ${z.wheel_px}px scale ${z.wheel_scale} · ${z.screens_tall} screens tall · grid letter ${z.grid_cell_arcmin}′ · wheel note ${z.wheel_note_arcmin}′`);
