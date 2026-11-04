// Finds every pair of wheel labels whose boxes touch, and the back-row size of each label group, in room
// view and normal view, at 720p and 1080p, across the four notations and a few keys and modes.
// Run: node overlap.mjs [page.html] [tag]
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join, resolve } from "node:path";
const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(here, "../../../../_ops/stigmergy/app/package.json"));
const { chromium } = require("playwright");
const target = resolve(process.argv[2] || join(here, "../../cycle5-explorer.html"));
const tag = process.argv[3] || "now";
const CAP = 0.70, K = 8;
const arc = (px, h) => px * (2 * Math.atan(1 / (2 * K)) * 180 / Math.PI * 60) / h;
const browser = await chromium.launch();
const out = { tag, runs: [] };
for (const [w, h] of [[1280, 720], [1920, 1080]]) for (const room of [false, true]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(pathToFileURL(target).href + (room ? "?room" : ""));
  await page.waitForTimeout(300);
  const states = [];
  for (const dialect of ["berklee", "jazz", "lead", "classical"]) for (const [L, m] of [[-1, 1], [-1, 4], [3, 6], [-5, 0]]) {
    const r = await page.evaluate(([dialect, L, m]) => {
      if (!(dialect in DIALECTS)) return null;
      S.dialect = dialect; S.L = L; S.m = m; S.sel = { d: 0, src: "c" }; renderAll(0, 0, false);
      const els = [...document.querySelectorAll("#wheel text")].filter(e => e.getBBox().width > 0);
      const boxes = els.map(e => { const b = e.getBoundingClientRect(); return { cls: e.getAttribute("class"), t: e.textContent, x0: b.left, x1: b.right, y0: b.top, y1: b.bottom, fs: parseFloat(getComputedStyle(e).fontSize) * (e.getScreenCTM().a) }; });
      const hits = [];
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j], pad = 1;
        const ox = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0), oy = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
        if (ox > pad && oy > pad) hits.push(`${a.cls}:"${a.t}" × ${b.cls}:"${b.t}" (${ox.toFixed(0)}×${oy.toFixed(0)}px)`);
      }
      return { hits, boxes: boxes.map(b => ({ cls: b.cls, t: b.t, fs: b.fs })) };
    }, [dialect, L, m]);
    if (r) states.push({ dialect, L, m, ...r });
  }
  const minFs = {};
  for (const s of states) for (const b of s.boxes) { const g = b.cls.split(" ")[0]; minFs[g] = Math.min(minFs[g] ?? 1e9, b.fs); }
  const sizes = Object.fromEntries(Object.entries(minFs).map(([g, fs]) => [g, +arc(fs * CAP, h).toFixed(1)]));
  const allHits = [...new Set(states.flatMap(s => s.hits))];
  out.runs.push({ screen: `${w}x${h}`, room, states: states.length, overlaps: states.reduce((n, s) => n + s.hits.length, 0), distinct: allHits.length, sizes_arcmin_8H: sizes, examples: allHits.slice(0, 12) });
  await page.screenshot({ path: join(here, `${tag}-${room ? "room" : "page"}-${w}.png`), clip: await page.evaluate(() => { const b = document.getElementById("wheel").getBoundingClientRect(); return { x: b.left, y: b.top, width: b.width, height: b.height }; }) });
  await page.close();
}
await browser.close();
writeFileSync(join(here, `${tag}.json`), JSON.stringify(out, null, 1));
for (const r of out.runs) console.log(r.screen, r.room ? "room" : "page", "overlaps", r.overlaps, "distinct", r.distinct, JSON.stringify(r.sizes_arcmin_8H), "\n  " + r.examples.join("\n  "));
