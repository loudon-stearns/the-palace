// Shoots the wheel before and after the packing, in room view at 720p, Berklee notation, C Ionian and
// A Aeolian with the same-tonic switch on, and lays them side by side. Run: node compare.mjs
import { createRequire } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "../../../../_ops/stigmergy/app/package.json"));
const { chromium } = require("playwright");
const browser = await chromium.launch(); const shots = [];
for (const [tag, file] of [["before", "page-before.html"], ["after", "../../cycle5-explorer.html"]]) for (const [name, L, m] of [["C-Ionian", -1, 1], ["A-Aeolian", -1, 4]]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(pathToFileURL(join(here, file)).href + "?room"); await page.waitForTimeout(300);
  await page.evaluate(([L, m]) => { S.dialect = "berklee"; S.L = L; S.m = m; S.sel = { d: 0, src: "c" }; renderAll(); }, [L, m]);
  const clip = await page.evaluate(() => { const b = document.getElementById("wheel").getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height }; });
  const out = join(here, `cmp-${tag}-${name}.png`); await page.screenshot({ path: out, clip }); shots.push(out); await page.close();
}
// lay the four stills out, before on the left, after on the right
const img = p => `data:image/png;base64,${readFileSync(p).toString("base64")}`;
const caps = ["before · C Ionian", "before · A Aeolian", "after · C Ionian", "after · A Aeolian"];
const cell = i => `<figure><figcaption>${caps[i]}</figcaption><img src="${img(shots[i])}"></figure>`;
const sheet = await browser.newPage({ viewport: { width: 1300, height: 800 } });
await sheet.setContent(`<style>body{margin:0;padding:16px;background:#f0ece2;font:18px Menlo,monospace;color:#222;display:grid;grid-template-columns:1fr 1fr;gap:16px;width:max-content}
figure{margin:0}figcaption{margin:0 0 6px}img{display:block;width:600px}</style>${cell(0)}${cell(2)}${cell(1)}${cell(3)}`);
await sheet.screenshot({ path: join(here, "wheel-before-after.png"), fullPage: true });
await browser.close(); console.log("wheel-before-after.png");
