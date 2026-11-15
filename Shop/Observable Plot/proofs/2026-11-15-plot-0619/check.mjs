// check.mjs — what does each Plot version draw from the same three chart specs?
//   node "Shop/Observable Plot/proofs/2026-11-15-plot-0619/check.mjs"
// Opens plot-0617-vs-0619.html in headless Chromium from a static server on a free port, and for each version:
//   clicks its button, reads what the page counted, rests the pointer where the three lines bunch (t = 25 s,
//   R = 0.93) and counts the tips shown, and takes a screenshot (plot-0617.png, plot-0619.png).
// Rules (exit 1 if any fails):
//   both versions loaded as separate objects, each reporting its own version;
//   the page's data equals the Flocking source's model block run bare in the same browser, sample for sample;
//   0.6.17: the ridge is one "area" mark of 3 paths, three tips show at once, no legend, the self-coloured line
//           has no length (one-point pieces);
//   0.6.19: the ridge is an "area-line" mark of 6 paths, one tip shows, a 3-swatch legend, the self-coloured
//           line is drawn (over 500 px);
//   no page errors; no console warnings under 0.6.19 (0.6.17's z-cardinality warning is recorded, as expected).
// Writes measured.json beside itself.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../../..');
const PAGE = path.join(HERE, 'plot-0617-vs-0619.html');
const SOURCE = path.join(ROOT, 'Flocking/flocking-observable-plot-analytical.html');
const { chromium } = await import(pathToFileURL(path.join(ROOT, '_ops/stigmergy/app/node_modules/playwright/index.mjs')));

const START = '/* ===== SHARED FLOCKING MODEL', END = '/* ===== END SHARED MODEL ===== */';
const src = fs.readFileSync(SOURCE, 'utf8');
const srcModel = src.slice(src.indexOf(START), src.indexOf(END) + END.length);

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const url = `http://127.0.0.1:${server.address().port}/` + path.relative(ROOT, PAGE).split(path.sep).map(encodeURIComponent).join('/');

const browser = await chromium.launch();
const bare = await browser.newPage();
const reference = await bare.evaluate(srcModel + `
;(function () { const out = []; for (const ali of [0.3, 1.0, 2.0]) { const b = initBoids();
  for (let s = 0; s <= 1800; s++) { if (s % 10 === 0) out.push(polarization(b)); stepBoids(b, { sep: 1.5, ali, coh: 1.0 }); } } return out; })()`);

const page = await browser.newPage({ viewport: { width: 900, height: 1700 } });
let phase = 'load';
const consoleLines = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') consoleLines.push({ phase, type: m.type(), text: m.text().slice(0, 200) }); });
page.on('pageerror', (e) => consoleLines.push({ phase, type: 'pageerror', text: e.message }));
await page.goto(url, { waitUntil: 'load' });

const loaded = await page.evaluate(() => ({
  v17: window.Plot0617?.version, v19: window.Plot0619?.version,
  separate: window.Plot0617 !== window.Plot0619,
  keys17: Object.keys(window.Plot0617 || {}).length, keys19: Object.keys(window.Plot0619 || {}).length,
  samples: data.map((d) => d.R),
}));
let dataMaxDiff = loaded.samples.length === reference.length ? 0 : Infinity;
loaded.samples.forEach((v, i) => { dataMaxDiff = Math.max(dataMaxDiff, Math.abs(v - reference[i])); });

const runs = {};
for (const [btn, v, png] of [['#v17', '0.6.17', 'plot-0617.png'], ['#v19', '0.6.19', 'plot-0619.png']]) {
  phase = v;
  await page.mouse.move(0, 0);
  await page.click(btn);
  const r = await page.evaluate(() => window.__render);
  const box = await page.evaluate(() => { const s = [...document.querySelectorAll('#tips svg')].at(-1); const b = s.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
  // marginLeft 44, marginRight 20, marginTop 20, marginBottom 30 (Plot's defaults with the page's marginLeft).
  await page.mouse.move(box.x + 44 + (box.w - 64) * (25 / 30), box.y + 20 + (box.h - 50) * (1 - 0.93));
  await page.waitForTimeout(300);
  r.tips_shown = await page.evaluate(() => [...document.querySelectorAll('#tips g[aria-label="tip"]')].filter((g) => g.childElementCount > 0).map((g) => g.textContent.replace(/​/g, ' ').trim()));
  await page.screenshot({ path: path.join(HERE, png), fullPage: true });
  runs[v] = r;
}
await browser.close();
server.close();

const fails = [];
const want = (ok, msg) => { if (!ok) fails.push(msg); };
want(loaded.v17 === '0.6.17' && loaded.v19 === '0.6.19' && loaded.separate && loaded.keys17 > 0 && loaded.keys19 > 0, `versions did not load apart: ${JSON.stringify({ v17: loaded.v17, v19: loaded.v19, separate: loaded.separate })}`);
want(dataMaxDiff === 0, `the page's flock differs from the Flocking source in the same browser by ${dataMaxDiff}`);
const a = runs['0.6.17'], b = runs['0.6.19'];
want(a.ridge_mark === 'area' && a.ridge_mark_paths === 3, `0.6.17 ridge: ${a.ridge_mark} with ${a.ridge_mark_paths} paths`);
want(b.ridge_mark === 'area-line' && b.ridge_mark_paths === 6, `0.6.19 ridge: ${b.ridge_mark} with ${b.ridge_mark_paths} paths`);
want(a.tips_shown.length === 3, `0.6.17 showed ${a.tips_shown.length} tips, expected 3`);
want(b.tips_shown.length === 1, `0.6.19 showed ${b.tips_shown.length} tips, expected 1`);
want(a.tips_legend_swatches === 0, `0.6.17 drew ${a.tips_legend_swatches} legend swatches`);
want(b.tips_legend_swatches === 3, `0.6.19 drew ${b.tips_legend_swatches} legend swatches, expected 3`);
want(a.self_line_path_length < 1, `0.6.17 self-coloured line is ${a.self_line_path_length} px long`);
want(b.self_line_path_length > 500, `0.6.19 self-coloured line is only ${b.self_line_path_length} px long`);
want(!consoleLines.some((l) => l.type === 'pageerror'), 'a page error was thrown');
want(!consoleLines.some((l) => l.phase === '0.6.19'), 'console warnings under 0.6.19: ' + consoleLines.filter((l) => l.phase === '0.6.19').map((l) => l.text).join(' | '));

const measured = {
  checked: new Date().toISOString(),
  page: path.relative(ROOT, PAGE),
  loaded: { v17: loaded.v17, v19: loaded.v19, separate_objects: loaded.separate, exports_0617: loaded.keys17, exports_0619: loaded.keys19 },
  data: { samples: loaded.samples.length, max_abs_diff_vs_flocking_source_same_browser: dataMaxDiff },
  by_version: runs,
  console: consoleLines,
  rules: 'see the header of check.mjs',
  pass: fails.length === 0,
  fails,
};
fs.writeFileSync(path.join(HERE, 'measured.json'), JSON.stringify(measured, null, 2) + '\n');
console.log(JSON.stringify(measured, null, 1));
process.exit(fails.length ? 1 : 0);
