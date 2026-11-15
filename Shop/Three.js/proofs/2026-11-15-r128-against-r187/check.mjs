#!/usr/bin/env node
// check.mjs — measures what a script can about r128-against-r187.html, in headless Chromium.
// Born 2026-11-15 for [[Three.js]]. Run from the palace root:
//   node Shop/Three.js/proofs/2026-11-15-r128-against-r187/check.mjs
// It loads the page from disk (file://; r128 from the shelf's CDN with SRI, r187 through the import map with its
// integrity list), draws one frame in each of the three panes at the same t, twice: r187 lighting the scene its
// own way, then r187 told to light it as r128 did. It compares the frames as small signatures (32 x 24 cells,
// mean absolute difference over RGB, 0..255), and measures how bright the knot is in each.
// Each rule can fail; numbers go to measured.json and the page's look to PNGs beside this file.
// A maker who can measure this better another way does so, and leaves the comparison on the scroll.

import { writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');
const { chromium } = await import(pathToFileURL(join(ROOT, '_ops/stigmergy/app/node_modules/playwright/index.mjs')).href);
const PAGE = pathToFileURL(join(HERE, 'r128-against-r187.html')).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1130, height: 1000 }, deviceScaleFactor: 1 });
const consoleLines = [];
page.on('console', (m) => consoleLines.push({ type: m.type(), text: m.text().slice(0, 300) }));
page.on('pageerror', (e) => consoleLines.push({ type: 'pageerror', text: String(e).slice(0, 300) }));
await page.goto(PAGE, { waitUntil: 'load' });
await page.waitForFunction(() => window.__compare && window.__compare.state.ready, null, { timeout: 30000 });

const T = 0.9;
const diff = (a, b) => {
  let s = 0, n = 0;
  for (let i = 0; i < a.length; i += 4) { s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]); n += 3; }
  return +(s / n).toFixed(3);
};
// The knot sits in the upper middle of each pane. Its cells: rows 3..12, columns 10..21 of 32 x 24.
const knotLuma = (px) => {
  let s = 0, n = 0;
  for (let y = 3; y < 13; y++) for (let x = 10; x < 22; x++) { const i = (y * 32 + x) * 4; s += 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]; n++; }
  return +(s / n).toFixed(2);
};
const bgLuma = (px) => +(0.2126 * px[0] + 0.7152 * px[1] + 0.0722 * px[2]).toFixed(2);

const results = { page: 'Shop/Three.js/proofs/2026-11-15-r128-against-r187/r128-against-r187.html', ran: new Date().toISOString(),
  host: 'headless Chromium (playwright), software rendering', t: T };
const rules = [];
const rule = (name, pass, detail) => { rules.push({ name, pass: !!pass, detail }); };

results.revisions = await page.evaluate(() => window.__compare.revisions);
results.navigatorGpu = await page.evaluate(async () => {
  if (!navigator.gpu) return 'navigator.gpu absent';
  try { const a = await navigator.gpu.requestAdapter(); return a ? 'adapter found' : 'navigator.gpu present, no adapter'; }
  catch (e) { return 'requestAdapter threw: ' + e.message; }
});
results.readouts = await page.evaluate(() => [0, 1, 2].map((i) => document.getElementById('r' + i).textContent));

async function measure(matchOld, shot) {
  const f = await page.evaluate(([t, m]) => window.__compare.frames(t, m), [T, matchOld]);
  await page.screenshot({ path: join(HERE, shot), fullPage: true });
  const [a, b, c] = f;
  return {
    backends: f.map((x) => `${x.name}: ${x.backend}`),
    knotLuma: { r128: knotLuma(a.px), r187gl: knotLuma(b.px), r187gpu: knotLuma(c.px) },
    backgroundLuma: { r128: bgLuma(a.px), r187gl: bgLuma(b.px), r187gpu: bgLuma(c.px) },
    diff: { r128_vs_r187gl: diff(a.px, b.px), r128_vs_r187gpu: diff(a.px, c.px), r187gl_vs_r187gpu: diff(b.px, c.px) },
  };
}
const own = await measure(false, 'page-1-r187-own-light.png');
const matched = await measure(true, 'page-2-r187-matched-to-r128.png');
results.r187OwnLight = own;
results.r187MatchedToR128 = matched;

rule('three revisions are 128 and 187', results.revisions.old === '128' && results.revisions.now === '187', results.revisions);
rule('every pane drew its knot (knot luma above the background by 10, both modes)',
  [own, matched].every((m) => ['r128', 'r187gl', 'r187gpu'].every((k) => m.knotLuma[k] > m.backgroundLuma[k] + 10)), { own: own.knotLuma, matched: matched.knotLuma });
rule('the background is the same token in every pane (luma within 1)',
  [own, matched].every((m) => Math.max(...Object.values(m.backgroundLuma)) - Math.min(...Object.values(m.backgroundLuma)) <= 1), own.backgroundLuma);
rule('left to itself, r187 lights the knot differently from r128 (mean |diff| over 3)', own.diff.r128_vs_r187gl > 3, own.diff);
rule('told to, r187 WebGL lights it as r128 did (mean |diff| under 3)', matched.diff.r128_vs_r187gl < 3, matched.diff);
rule('r187\'s two renderers agree with each other (mean |diff| under 3, both modes)',
  own.diff.r187gl_vs_r187gpu < 3 && matched.diff.r187gl_vs_r187gpu < 3, { own: own.diff.r187gl_vs_r187gpu, matched: matched.diff.r187gl_vs_r187gpu });

results.console = consoleLines;
const unexpected = consoleLines.filter((l) => l.type === 'error' || l.type === 'pageerror');
rule('no console error', unexpected.length === 0, unexpected);

results.rules = rules;
results.passed = rules.every((r) => r.pass);
writeFileSync(join(HERE, 'measured.json'), JSON.stringify(results, null, 2) + '\n');
await browser.close();
console.log(`navigator.gpu: ${results.navigatorGpu}`);
console.log(results.readouts.join('\n'));
for (const r of rules) console.log(`${r.pass ? 'pass' : 'FAIL'}  ${r.name}  ${JSON.stringify(r.detail)}`);
console.log(results.passed ? 'all rules pass' : 'some rules FAILED');
process.exitCode = results.passed ? 0 : 1;
