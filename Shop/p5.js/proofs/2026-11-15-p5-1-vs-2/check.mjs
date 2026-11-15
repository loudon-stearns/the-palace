#!/usr/bin/env node
// check.mjs — p5 1.10.0 beside p5 2.4.0, measured headless. Born 2026-11-15 for [[p5.js]].
// Loads p5-1-vs-2.html in headless Chromium (file://, CDN scripts with their hashes) and measures what a script can:
//   both libraries load in one page, each setup finishes, and the console stays clean;
//   each version draws the curve (share of canvas pixels in the accent colour);
//   each version's warp shader bites (pixels changed between warp 0 and warp 0.05 at the same pointer);
//   how many pixels differ between the two versions at the same pointer and the same warp;
//   ms per forced frame for each (median and p95 of 200), in SwiftShader, so a comparison and not a speed.
// Writes measured.json and three screenshots beside itself. Exits 1 if a rule fails.
// Whether the two look and move alike is Loudon's eye, not this. A maker who can measure it better does so.
//   node Shop/p5.js/proofs/2026-11-15-p5-1-vs-2/check.mjs
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { writeFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(here, '../../../..');
const { chromium } = await import(pathToFileURL(join(ROOT, '_ops/stigmergy/app/node_modules/playwright/index.mjs')).href);
const page_url = pathToFileURL(join(here, 'p5-1-vs-2.html')).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1130, height: 1000 } });
const consoleErrors = [], pageErrors = [], notes = [];
page.on('console', m => {
  const t = m.text();
  if (/GPU stall due to ReadPixels/.test(t)) return;          // SwiftShader's own performance chatter
  if (m.type() === 'error') consoleErrors.push(t.slice(0, 300));
  else if (/p5\.js says/.test(t)) notes.push(t.slice(0, 200));
});
page.on('pageerror', e => pageErrors.push(e.message));
await page.goto(page_url);
await page.waitForFunction(() => window.__ready && window.__ready.v1 && window.__ready.v2, null, { timeout: 15000 });

const versions = await page.evaluate(() => ({ v1: window.__sketches.v1.VERSION || window.P5v1.prototype.VERSION, v2: window.__sketches.v2.VERSION || window.P5v2.VERSION, renderer_v1: window.__sketches.v1._renderer.webglVersion, renderer_v2: window.__sketches.v2._renderer.webglVersion }));

// Grab one version's canvas after a forced frame, as RGBA bytes, in the same task as the draw.
// p5 2.x's redraw() is async and returns early while a draw is in flight: await it (awaiting 1.x's undefined is harmless).
const grab = (v) => page.evaluate(async (v) => {
  const p = window.__sketches[v]; await p.redraw();
  const src = p.canvas || p._renderer.canvas;
  const c = document.createElement('canvas'); c.width = src.width; c.height = src.height;
  const g = c.getContext('2d'); g.drawImage(src, 0, 0);
  return { w: c.width, h: c.height, data: Array.from(g.getImageData(0, 0, c.width, c.height).data) };
}, v);
const accentRGB = await page.evaluate(() => { const T = palaceTokens(); const m = /#?(..)(..)(..)/.exec(T.accent); return [1, 2, 3].map(i => parseInt(m[i], 16)); });
const bgRGB = await page.evaluate(() => { const T = palaceTokens(); const m = /#?(..)(..)(..)/.exec(T.bg); return [1, 2, 3].map(i => parseInt(m[i], 16)); });
const accentShare = (img) => {   // the fill is accent at alpha 200 over bg: expect a blend of the two
  const want = accentRGB.map((a, i) => Math.round(a * 200 / 255 + bgRGB[i] * 55 / 255));
  let n = 0; for (let i = 0; i < img.data.length; i += 4) if (Math.abs(img.data[i] - want[0]) < 24 && Math.abs(img.data[i + 1] - want[1]) < 24 && Math.abs(img.data[i + 2] - want[2]) < 24) n++;
  return n / (img.w * img.h);
};
const differ = (a, b) => {
  if (a.w !== b.w || a.h !== b.h) return null;
  let n = 0; for (let i = 0; i < a.data.length; i += 4) if (Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2])) > 24) n++;
  return n / (a.w * a.h);
};

const per = {};
await page.evaluate(() => window.__drive(0.75, 0.35));
const grabs = {};
for (const v of ['v1', 'v2']) {
  await page.evaluate(() => { window.__amt = 0; });
  const flat = await grab(v);
  await page.evaluate(() => { window.__amt = 0.05; });
  const warped = await grab(v);
  grabs[v] = { flat, warped };
  // timing: 200 forced frames
  const times = await page.evaluate(async (v) => {
    const p = window.__sketches[v], ts = [];
    for (let i = 0; i < 10; i++) await p.redraw();
    for (let i = 0; i < 200; i++) { const t0 = performance.now(); await p.redraw(); ts.push(performance.now() - t0); }
    ts.sort((a, b) => a - b); return { median: ts[100], p95: ts[190] };
  }, v);
  per[v] = {
    canvas: [flat.w, flat.h],
    accent_share_flat: +accentShare(flat).toFixed(4),
    warp_changed_share: +differ(flat, warped).toFixed(4),
    ms_per_forced_frame_median: +times.median.toFixed(3),
    ms_per_forced_frame_p95: +times.p95.toFixed(3),
  };
}
const diffFlat = differ(grabs.v1.flat, grabs.v2.flat);
const diffWarped = differ(grabs.v1.warped, grabs.v2.warped);

// screenshots: each panel at the driven pointer and warp, and the whole page
await page.evaluate(async () => { window.__amt = 0.05; await window.__sketches.v1.redraw(); await window.__sketches.v2.redraw(); });
await page.locator('.pair').screenshot({ path: join(here, 'p5-1-vs-2-pair.png') });
await page.evaluate(async () => { window.__drive(null); window.__amt = null; await window.__sketches.v1.redraw(); await window.__sketches.v2.redraw(); });
await page.screenshot({ path: join(here, 'p5-1-vs-2-page.png'), fullPage: true });
const phone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
await phone.goto(page_url);
await phone.waitForFunction(() => window.__ready && window.__ready.v1 && window.__ready.v2, null, { timeout: 15000 });
await phone.screenshot({ path: join(here, 'p5-1-vs-2-phone.png'), fullPage: true });
await browser.close();

const rules = [
  ['both versions load in one page', versions.v1 === '1.10.0' && versions.v2 === '2.4.0'],
  ['no page errors', pageErrors.length === 0],
  ['no console errors', consoleErrors.length === 0],
  ['1.10.0 draws the curve (accent share > 2%)', per.v1.accent_share_flat > 0.02],
  ['2.4.0 draws the curve (accent share > 2%)', per.v2.accent_share_flat > 0.02],
  ['1.10.0 warp changes > 1% of pixels', per.v1.warp_changed_share > 0.01],
  ['2.4.0 warp changes > 1% of pixels', per.v2.warp_changed_share > 0.01],
];
const findings = {
  pixels_differing_v1_v2_unwarped: diffFlat == null ? null : +diffFlat.toFixed(4),
  pixels_differing_v1_v2_warped: diffWarped == null ? null : +diffWarped.toFixed(4),
  renders_alike_within_2pct: diffFlat != null && diffFlat < 0.02 && diffWarped < 0.02,
};
const out = {
  measured: new Date().toISOString(), host: 'headless Chromium (playwright), SwiftShader WebGL, 1130 x 1000',
  pointer: 'driven at 0.75, 0.35 of each canvas; warp held at 0 then 0.05',
  versions, per_version: per, findings,
  console_errors: consoleErrors, page_errors: pageErrors, p5_notes: notes,
  rules: rules.map(([name, ok]) => ({ name, ok })),
  pass: rules.every(([, ok]) => ok),
  not_measured: 'whether the two look and move alike on a real screen; frame time on a real GPU',
};
writeFileSync(join(here, 'measured.json'), JSON.stringify(out, null, 2) + '\n');
for (const [name, ok] of rules) console.log((ok ? 'ok   ' : 'FAIL ') + name);
console.log(JSON.stringify({ per_version: per, findings }, null, 1));
process.exit(out.pass ? 0 : 1);
