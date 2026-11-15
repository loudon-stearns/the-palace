#!/usr/bin/env node
// check.mjs — born 2026-11-15, for [[D3.js]]'s proof "the whole library against just the modules".
// Headless Chromium (playwright) loads esm-modules.html over a throwaway local server (port 0, the
// palace root, read-only) and measures what a script can:
//   - the import map's pins: each sha384 matches the bytes the CDN serves today, and a page whose
//     import map carries one wrong hash does not get the modules (the browser enforces the pin);
//   - bytes over the wire for each side, from resource timing;
//   - time to a usable library for each side alone, five cold loads each, median (CDN-dependent);
//   - after Draw both: whether the two sides land on the same node positions.
// Writes measured.json and settled.png beside this file. Exits 1 if a rule fails.
//   node Shop/D3.js/proofs/2026-11-15-esm-modules/check.mjs
import http from 'node:http';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PALACE = path.resolve(HERE, '../../../..');
const { chromium } = await import(pathToFileURL(path.join(PALACE, '_ops/stigmergy/app/node_modules/playwright/index.mjs')).href);
const HTML = fs.readFileSync(path.join(HERE, 'esm-modules.html'), 'utf8');
const MAP = JSON.parse(/<script type="importmap">([\s\S]*?)<\/script>/.exec(HTML)[1]);
const OLD = /<script src="(https:\/\/cdn\.jsdelivr\.net\/npm\/d3@[^"]+)" integrity="([^"]+)"/.exec(HTML);

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
const extra = new Map();   // synthetic pages for the one-side-alone timings and the tampered map
const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (extra.has(u.pathname)) { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(extra.get(u.pathname)); }
  const p = path.join(PALACE, decodeURIComponent(u.pathname));
  if (!p.startsWith(PALACE) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] ?? 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;
const rel = '/' + path.relative(PALACE, path.join(HERE, 'esm-modules.html')).split(path.sep).map(encodeURIComponent).join('/');
const dir = rel.slice(0, rel.lastIndexOf('/') + 1);

const m = { checked: new Date().toISOString(), page: rel.slice(1), rules: {} };

// 1. The pins: every hash in the import map (and the old tag) against today's bytes.
const sri = (buf) => 'sha384-' + crypto.createHash('sha384').update(buf).digest('base64');
m.pins = {};
for (const [url, want] of [...Object.entries(MAP.integrity), [OLD[1], OLD[2]]]) {
  const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
  m.pins[url] = { bytes: buf.length, matches: sri(buf) === want };
}
m.rules.every_pin_matches_the_cdn = Object.values(m.pins).every((p) => p.matches);
// Every module URL the page reaches, by its own import or through the map, has a hash in the map.
const imported = [...HTML.matchAll(/from '(https:[^']+\.mjs)'/g)].map((x) => x[1]);
m.rules.every_module_url_hashed = [...imported, ...Object.values(MAP.imports)].every((u) => MAP.integrity[u]);

const browser = await chromium.launch();
m.chromium = browser.version();

// 2. The real page, cold: still before a click, then Draw both.
const ctx = await browser.newContext({ viewport: { width: 1130, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (x) => { if (x.type() === 'error') errors.push(x.text()); });
await page.goto(base + rel);
await page.waitForFunction(() => window.d3modules && !document.getElementById('go').disabled, null, { timeout: 15000 });
m.rules.still_before_click = await page.evaluate(() => document.querySelectorAll('svg *').length === 0);
await page.click('#go');
await page.waitForFunction(() => lastRun, null, { timeout: 20000 });
const run = await page.evaluate(() => ({ maxDelta: lastRun.maxDelta, oldTicks: lastRun.old.ticks, newTicks: lastRun.new.ticks,
  oldMs: Math.round(lastRun.old.ms), newMs: Math.round(lastRun.new.ms), verdict: document.getElementById('verdict').textContent,
  oldWire: oldWire(), newWire: newWire(), oldVersion: d3.version }));
await page.screenshot({ path: path.join(HERE, 'settled.png'), fullPage: true });
m.draw = run;
m.rules.same_positions_to_the_bit = run.maxDelta === 0;
m.rules.modules_under_a_quarter_of_the_bytes = run.newWire.encoded > 0 && run.newWire.encoded < run.oldWire.encoded / 4;
m.rules.five_module_files_loaded = run.newWire.files === 5;
m.console_errors = errors;
m.rules.clean_console = errors.length === 0;
await ctx.close();

// 3. Each side alone, cold, five times: time from navigation start to a usable library.
const tokens = `<link rel="stylesheet" href="../../../../_ops/loudon-live/design-system/colors_and_type.css">`;
const importmap = /<script type="importmap">[\s\S]*?<\/script>/.exec(HTML)[0];
extra.set(dir + '__old.html', `<!doctype html><html><head>${tokens}</head><body>
<script src="${OLD[1]}" integrity="${OLD[2]}" crossorigin="anonymous"></script>
<script>window.readyAt = performance.now(); window.ok = typeof d3.forceSimulation === 'function';</script></body></html>`);
extra.set(dir + '__new.html', `<!doctype html><html><head>${tokens}${importmap}</head><body>
<script type="module">import { forceSimulation } from 'https://cdn.jsdelivr.net/npm/d3-force@3.0.1/dist/d3-force.min.mjs'; import { select } from 'https://cdn.jsdelivr.net/npm/d3-selection@3.0.1/dist/d3-selection.min.mjs';
window.readyAt = performance.now(); window.ok = typeof forceSimulation === 'function' && typeof select === 'function';</script></body></html>`);
const tampered = importmap.replace(/"sha384-WHqE[^"]+"/, '"sha384-' + 'A'.repeat(64) + '"');
extra.set(dir + '__tampered.html', `<!doctype html><html><head>${importmap === tampered ? '' : tampered}</head><body>
<script type="module">import { forceSimulation } from 'https://cdn.jsdelivr.net/npm/d3-force@3.0.1/dist/d3-force.min.mjs'; window.ok = true;</script>
<script>setTimeout(() => { window.done = true; }, 4000);</script></body></html>`);

const median = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
m.alone = {};
for (const side of ['old', 'new']) {
  const times = [];
  for (let i = 0; i < 5; i++) {
    const c = await browser.newContext();               // a new context is a cold cache
    const p = await c.newPage();
    await p.goto(`${base}${dir}__${side}.html`);
    await p.waitForFunction(() => window.ok === true, null, { timeout: 15000 });
    times.push(Math.round(await p.evaluate(() => window.readyAt)));
    await c.close();
  }
  m.alone[side] = { ready_ms: times, median_ms: median(times) };
}

// 4. A wrong hash in the import map: the browser must refuse the module.
{
  const c = await browser.newContext();
  const p = await c.newPage();
  const errs = [];
  p.on('console', (x) => { if (x.type() === 'error') errs.push(x.text()); });
  p.on('pageerror', (e) => errs.push(String(e)));
  await p.goto(`${base}${dir}__tampered.html`);
  await p.waitForFunction(() => window.done, null, { timeout: 10000 });
  m.tampered = { modules_loaded: await p.evaluate(() => window.ok === true), errors: errs.slice(0, 3) };
  m.rules.wrong_hash_is_refused = !m.tampered.modules_loaded && tampered !== importmap;
  await c.close();
}

await browser.close();
server.close();
fs.writeFileSync(path.join(HERE, 'measured.json'), JSON.stringify(m, null, 1) + '\n');
console.log(JSON.stringify({ draw: m.draw, alone: m.alone, tampered: m.tampered, chromium: m.chromium }, null, 1));
const failed = Object.entries(m.rules).filter(([, v]) => !v).map(([k]) => k);
console.log(failed.length ? `FAIL: ${failed.join(', ')}` : `ok: ${Object.keys(m.rules).length} rules hold`);
process.exit(failed.length ? 1 : 0);
