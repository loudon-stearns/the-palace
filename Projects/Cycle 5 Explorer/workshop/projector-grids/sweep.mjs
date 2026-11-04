// Sweeps every width from 360 to 1920 in 20-px steps and reports any grid that still hides columns.
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "../../../../_ops/stigmergy/app/package.json"));
const { chromium } = require("playwright");
const target = resolve(process.argv[2] || join(here, "../../cycle5-explorer.html"));
const browser = await chromium.launch(); const page = await browser.newPage();
await page.goto(pathToFileURL(target).href);
const bad = [];
for (let w = 360; w <= 1920; w += 20) {
  await page.setViewportSize({ width: w, height: 800 }); await page.waitForTimeout(60);
  const r = await page.evaluate(() => [...document.querySelectorAll(".grids .scroll")].map(s => [s.querySelector("table").id, s.scrollWidth - s.clientWidth]));
  for (const [id, h] of r) if (h > 1) bad.push(`${w} ${id} ${h}px`);
}
console.log(bad.length ? bad.join("\n") : "no grid hides a column from 360 to 1920");
await browser.close();
