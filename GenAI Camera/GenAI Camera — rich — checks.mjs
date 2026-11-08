// title: GenAI Camera — rich — checks (in the browser)
// born: 2026-11-03
// links: [[GenAI Camera]] (connects-to · rich-face-workshop) · runs the four made pieces listed in [[GenAI Camera — rich.json]] headless and holds their own counts against checks.py's
// forward_vector: I load each rich-face piece in headless Chromium from a plain file server, let its engine re-measure every number from the renders, and compare what it counted with what checks.py counted with PIL, so the two routes have to agree before a number is shown as measured. Run: node "GenAI Camera — rich — checks.mjs" (about twenty seconds; needs STIGMERGY's Playwright).
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
const here = dirname(fileURLToPath(import.meta.url));
const palace = resolve(here, '..');
const require = createRequire(join(palace, '_ops/stigmergy/app/package.json'));
const { chromium } = require('playwright');
const ref = JSON.parse(execFileSync('python3', [join(here, 'GenAI Camera — rich — checks.py'), '--json']).toString());
const types = { '.html': 'text/html; charset=utf-8', '.png': 'image/png' };
const server = createServer((q, s) => { const p = join(here, decodeURIComponent(q.url.split('?')[0])); if (!p.startsWith(here) || !existsSync(p)) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'content-type': types[extname(p)] || 'application/octet-stream' }); s.end(readFileSync(p)); });
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const base = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch(); let bad = 0;
const strip = (o) => JSON.parse(JSON.stringify(o, (k, v) => (k === 'hist' ? undefined : v)));
for (const [what, key] of [['the costume dial', 'dial'], ['thin plate, thick plate', 'plates'], ['depth auto-range', 'autorange'], ['segment or inpaint', 'shootout']]) {
  const page = await browser.newPage(); const errs = []; page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(base + encodeURIComponent(`GenAI Camera — rich — ${what}.html`));
  await page.waitForFunction(() => window.__gc, null, { timeout: 30000 });
  const got = await page.evaluate(() => window.__gc);
  const mine = got.live ? (got.live[key] || got.live) : null;
  const agree = mine && JSON.stringify(strip(mine)) === JSON.stringify(strip(ref[key]));
  console.log(`${what.padEnd(26)} page re-measured: ${got.live ? 'yes' : 'no'} · page = baked: ${got.same} · page = checks.py now: ${!!agree}${errs.length ? ' · errors: ' + errs.join(' | ') : ''}`);
  if (!agree || errs.length) { bad++; console.log('  page:', JSON.stringify(strip(mine)).slice(0, 600)); console.log('  ref: ', JSON.stringify(strip(ref[key])).slice(0, 600)); }
  await page.close();
}
await browser.close(); server.close();
const r = ref, d = r.dial;
console.log('\nreference (checks.py):');
for (const f of ['sorceress', 'barbarian']) console.log(`  ${f.padEnd(10)} cloth beyond the body by depth: ${d[f].steps.map((s) => `${s.depth.toFixed(2)} ${s.cloth.toFixed(3)} (${Math.round(100 * s.cloth / d[f].steps[0].cloth)}%)`).join(' · ')}`);
console.log(`  plates lit px: thin ${r.plates.thin} · thick ${r.plates.thick} · ${r.plates.ratio}×`);
for (const k of ['before', 'after']) { const a = r.autorange[k]; console.log(`  depth ${k.padEnd(6)} interior ${a.min}–${a.max} (${(100 * a.span_frac).toFixed(1)}% of 0–255) · p5–p95 ${a.p5}–${a.p95} (${(100 * a.p5_95_frac).toFixed(1)}%)`); }
const s = r.shootout; console.log(`  shootout: segment changed ${(100 * s.segment.changed_frac).toFixed(1)}%, ${(100 * s.segment.inside_region).toFixed(1)}% inside · inpaint changed ${(100 * s.inpaint.changed_frac).toFixed(1)}%, ${(100 * s.inpaint.inside_region).toFixed(1)}% inside · change inside the region ${s.falloff.inside}, then in 4-px rings ${s.falloff.rings.join(' / ')}`);
process.exit(bad ? 1 : 0);
