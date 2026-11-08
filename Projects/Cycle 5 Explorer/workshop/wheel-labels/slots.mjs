// Per-slot sizes of the wheel's outer labels (quality, mode or borrowed-from) as the back row sees them,
// 8 screen-heights out, with the packing's shrink factors. Run: node slots.mjs [page.html] [?room] [WxH]
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "../../../../_ops/stigmergy/app/package.json"));
const { chromium } = require("playwright");
const target = resolve(process.argv[2] || join(here, "../../cycle5-explorer.html"));
const q = process.argv[3] || "?room", [w, h] = (process.argv[4] || "1280x720").split("x").map(Number);
const k = 2 * Math.atan(1 / 16) * 180 / Math.PI * 60 / h;
const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: w, height: h } });
await page.goto(pathToFileURL(target).href + q); await page.waitForTimeout(300);
const rows = await page.evaluate(() => [...document.querySelectorAll("#wheel text.t-qual, #wheel text.t-mode, #wheel text.t-from")].map(e => {
  const g = e.closest("g.up"), m = /translate\(([-\d.]+)px,\s*([-\d.]+)px/.exec(g.getAttribute("style"));
  const a = (Math.atan2(+m[1], -+m[2]) * 180 / Math.PI + 360) % 360;
  return { cls: e.getAttribute("class").split(" ")[0], t: e.textContent, clock: ((Math.round(a / 30) + 11) % 12) + 1, px: parseFloat(getComputedStyle(e).fontSize) * e.getScreenCTM().a };
}));
rows.sort((a, b) => a.clock - b.clock || a.cls.localeCompare(b.cls));
for (const r of rows) console.log(String(r.clock).padStart(2), "o'clock", r.cls.padEnd(7), (r.px * .7 * k).toFixed(1) + "′", r.t);
await browser.close();
