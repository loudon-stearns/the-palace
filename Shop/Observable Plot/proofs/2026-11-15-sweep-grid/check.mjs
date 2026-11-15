// check.mjs — does the sweep grid draw the twelve runs the model really makes?
//   node "Shop/Observable Plot/proofs/2026-11-15-sweep-grid/check.mjs"
// 1. The model block in sweep-grid.html is byte-identical to Flocking/flocking-observable-plot-analytical.html's.
// 2. Headless Chromium opens the page from a static server on a free port. Nothing may be drawn before the click.
//    After "run the sweep" (cohesion 1.0) the grid must hold 12 line paths and the square 12 cells.
// 3. The page's 24 numbers (mean R over the last 5 s, final R per run) must equal the model block from the
//    Flocking source run bare in a blank page of the same browser, to within the page's 6-decimal rounding.
// 4. Node runs the same block for all three cohesions: the phase table. Node is a different engine: its
//    Math.sin/Math.cos can differ from Chromium's in the last bit, and the flock is chaotic, so Node vs browser
//    is recorded cell by cell as a finding, not a pass rule. The check does require that the two engines' seed-7
//    starting states differ by no more than one unit in the last place.
// 5. Re-runs the 2026-05-29 recipe's numbers (final R at step 900 for align 0.3 / 1.0 / 2.0) in Node and browser.
// Writes measured.json and grid.png beside itself. Exit 1 on any failed rule.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../../..');
const PAGE = path.join(HERE, 'sweep-grid.html');
const SOURCE = path.join(ROOT, 'Flocking/flocking-observable-plot-analytical.html');
const { chromium } = await import(pathToFileURL(path.join(ROOT, '_ops/stigmergy/app/node_modules/playwright/index.mjs')));

const fails = [];
const START = '/* ===== SHARED FLOCKING MODEL', END = '/* ===== END SHARED MODEL ===== */';
const block = (html) => { const a = html.indexOf(START), b = html.indexOf(END); return a < 0 || b < 0 ? null : html.slice(a, b + END.length); };
const pageModel = block(fs.readFileSync(PAGE, 'utf8'));
const srcModel = block(fs.readFileSync(SOURCE, 'utf8'));
const modelIdentical = !!pageModel && pageModel === srcModel;
if (!modelIdentical) fails.push('the model block differs from the Flocking source');

// One program, run in both engines: the sweep for a cohesion, the step-900 recipe numbers, and the start state.
const SWEEP = `
;(function (cohs) {
  const SEPS = [0.5, 1.5, 3.0], ALIS = [0, 0.3, 1.0, 2.0], STEPS = 1800, EVERY = 10, TAIL = 300;
  const out = { sweeps: {}, at900: {}, start: initBoids().map((b) => [b.x, b.y, b.vx, b.vy]).flat() };
  for (const coh of cohs) {
    const cells = [];
    for (const sep of SEPS) for (const ali of ALIS) {
      const b = initBoids(); const w = { sep, ali, coh }; const rs = [{ t: 0, R: polarization(b) }];
      for (let k = 1; k <= STEPS; k++) { stepBoids(b, w); if (k % EVERY === 0) rs.push({ t: k / 60, R: polarization(b) }); }
      const from = (STEPS - TAIL) / 60; const tail = rs.filter((d) => d.t > from - 1e-9).map((d) => d.R);
      cells.push({ sep, ali, coh, meanTailR: tail.reduce((x, y) => x + y, 0) / tail.length, finalR: polarization(b) });
    }
    out.sweeps[coh] = cells;
  }
  for (const ali of [0.3, 1.0, 2.0]) { const b = initBoids(); for (let k = 0; k < 900; k++) stepBoids(b, { sep: 1.5, ali, coh: 1.0 }); out.at900[ali] = +polarization(b).toFixed(3); }
  return out;
})`;
const t0 = Date.now();
const nodeRun = vm.runInNewContext(srcModel + SWEEP + '([0.5, 1, 2])', { Math, Float64Array, Array });
const nodeMs = Date.now() - t0;

// Static server over the palace root, any free port.
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const url = `http://127.0.0.1:${server.address().port}/` + path.relative(ROOT, PAGE).split(path.sep).map(encodeURIComponent).join('/');

const browser = await chromium.launch();
const userAgent = (await (await browser.newPage()).evaluate(() => navigator.userAgent));
const bare = await browser.newPage();
const browserRun = await bare.evaluate(srcModel + SWEEP + '([1])');
const page = await browser.newPage({ viewport: { width: 1000, height: 1400 } });
const consoleLines = [];
page.on('console', (msg) => { if (msg.type() === 'error' || msg.type() === 'warning') consoleLines.push(msg.type() + ': ' + msg.text()); });
page.on('pageerror', (e) => consoleLines.push('pageerror: ' + e.message));
await page.goto(url, { waitUntil: 'load' });
const before = await page.evaluate(() => ({ svgs: document.querySelectorAll('svg').length, plotVersion: window.Plot && Plot.version }));
if (before.svgs !== 0) fails.push(`something was drawn before the click (${before.svgs} svg)`);
await page.click('#go');
await page.waitForFunction(() => window.__done === true, null, { timeout: 120000 });
const got = await page.evaluate(() => ({
  sweep: window.__sweep,
  gridLinePaths: document.querySelectorAll('#grid g[aria-label="line"] path').length,
  squareCells: document.querySelectorAll('#square g[aria-label="cell"] rect').length,
  squareLabels: [...document.querySelectorAll('#square g[aria-label="text"] text')].map((t) => t.textContent),
}));
await page.screenshot({ path: path.join(HERE, 'grid.png'), fullPage: true });
await browser.close();
server.close();

// Rule 3: page against the bare model in the same browser.
let pageVsBare = 0;
for (const c of got.sweep.cells) {
  const n = browserRun.sweeps[1].find((d) => d.sep === c.sep && d.ali === c.ali);
  pageVsBare = Math.max(pageVsBare, Math.abs(n.meanTailR - c.meanTailR), Math.abs(n.finalR - c.finalR));
}
if (!(pageVsBare <= 5e-7 + 1e-12)) fails.push(`the page's numbers differ from the bare model in the same browser by ${pageVsBare}`);
if (got.gridLinePaths !== 12) fails.push(`the grid holds ${got.gridLinePaths} line paths, not 12`);
if (got.squareCells !== 12) fails.push(`the square holds ${got.squareCells} cells, not 12`);
if (consoleLines.length) fails.push('console errors or warnings: ' + consoleLines.join(' | '));

// Rule 4: the start states differ by at most one ulp.
const ulp = (x) => { const b = new Float64Array([Math.abs(x)]); const u = new BigUint64Array(b.buffer); u[0] += 1n; return b[0] - Math.abs(x); };
let startDiffers = 0, startWorstUlps = 0;
nodeRun.start.forEach((v, i) => { const w = browserRun.start[i]; if (v !== w) { startDiffers++; startWorstUlps = Math.max(startWorstUlps, Math.abs(v - w) / ulp(v)); } });
if (startWorstUlps > 1.0001) fails.push(`Node and browser seed-7 start states differ by ${startWorstUlps} ulp`);

const nodeVsBrowser = browserRun.sweeps[1].map((b) => {
  const n = nodeRun.sweeps[1].find((d) => d.sep === b.sep && d.ali === b.ali);
  return { sep: b.sep, ali: b.ali, browser_meanR: +b.meanTailR.toFixed(3), node_meanR: +n.meanTailR.toFixed(3), diff: +Math.abs(b.meanTailR - n.meanTailR).toFixed(4) };
});
const SEPS = [0.5, 1.5, 3.0], ALIS = [0, 0.3, 1.0, 2.0];
const table = (cells) => Object.fromEntries(SEPS.map((s) => ['sep ' + s, Object.fromEntries(ALIS.map((a) => ['align ' + a, +cells.find((c) => c.sep === s && c.ali === a).meanTailR.toFixed(3)]))]));
const measured = {
  checked: new Date().toISOString(),
  page: path.relative(ROOT, PAGE),
  plotVersion: before.plotVersion,
  engines: { node: process.version + ' (V8 ' + process.versions.v8 + ')', browser: userAgent },
  model_block_identical_to_flocking_source: modelIdentical,
  nothing_drawn_before_click: before.svgs === 0,
  browser: { cohesion: got.sweep.cohesion, steps: got.sweep.steps, ms: got.sweep.ms, gridLinePaths: got.gridLinePaths, squareCells: got.squareCells, squareLabels: got.squareLabels },
  page_vs_bare_model_same_browser_max_abs_diff: pageVsBare,
  rules: [
    'model block byte-identical to the Flocking source',
    'no svg before the click; 12 line paths in the grid and 12 cells in the square after it',
    "page's numbers within 5e-7 of the bare model in the same browser (the page rounds to 6 decimals)",
    'Node and browser seed-7 start states differ by at most 1 ulp',
    'no console errors or warnings',
  ],
  cross_engine: {
    start_values_differing: startDiffers, of: nodeRun.start.length, worst_ulps: startWorstUlps,
    note: 'Math.sin / Math.cos give a different last bit for some starting headings in Node and Chromium. The flock amplifies it; cells still wandering at the end of the run come out different, settled cells agree.',
    cohesion_1_cells: nodeVsBrowser,
  },
  node_ms_for_36_runs: nodeMs,
  phase_table_mean_R_last_5s: {
    'cohesion 1.0 (browser)': table(browserRun.sweeps[1]),
    'cohesion 0.5 (node)': table(nodeRun.sweeps[0.5]), 'cohesion 1.0 (node)': table(nodeRun.sweeps[1]), 'cohesion 2.0 (node)': table(nodeRun.sweeps[2]),
  },
  recipe_2026_05_29_recheck: {
    note: 'final R at exactly step 900, sep 1.5, coh 1.0. The 2026-05-29 report gave browser 0.583 / 0.953 / 0.995 and Node 0.579 / 0.953 / 0.995.',
    node_now: nodeRun.at900, browser_now: browserRun.at900,
  },
  console: consoleLines,
  pass: fails.length === 0,
  fails,
};
fs.writeFileSync(path.join(HERE, 'measured.json'), JSON.stringify(measured, null, 2) + '\n');
console.log(JSON.stringify({ pass: measured.pass, fails, pageVsBare, ms: got.sweep.ms, cross: measured.cross_engine, at900: measured.recipe_2026_05_29_recheck }, null, 1));
process.exit(fails.length ? 1 : 0);
