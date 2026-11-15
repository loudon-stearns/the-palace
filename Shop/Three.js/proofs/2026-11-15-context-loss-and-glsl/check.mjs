#!/usr/bin/env node
// check.mjs — measures what a script can about context-loss-and-glsl.html, in headless Chromium.
// Born 2026-11-15 for [[Three.js]]. Run from the palace root:
//   node Shop/Three.js/proofs/2026-11-15-context-loss-and-glsl/check.mjs
// It loads the page from disk (file://, the shelf's CDN with SRI), then:
//   1. draws a frame and calls it the "before"
//   2. loses the WebGL context with WEBGL_lose_context and waits for the restore, twice: once with r128 left
//      alone, once with the page setting its clear colour again; draws the same t and compares with the before
//      (mean absolute difference per channel, 0..255)
//   3. breaks the plane's fragment shader, reads what the page reports, and checks the plane is still drawn
//   4. mends it and compares with the before again
// Each rule can fail; the numbers go to measured.json and the frames to PNGs beside this file.
// A maker who can measure this better another way does so, and leaves the comparison on the scroll.

import { writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');
const { chromium } = await import(pathToFileURL(join(ROOT, '_ops/stigmergy/app/node_modules/playwright/index.mjs')).href);
const PAGE = pathToFileURL(join(HERE, 'context-loss-and-glsl.html')).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 1100 }, deviceScaleFactor: 1 });
const consoleLines = [];
page.on('console', (m) => consoleLines.push({ type: m.type(), text: m.text().slice(0, 300) }));
page.on('pageerror', (e) => consoleLines.push({ type: 'pageerror', text: String(e).slice(0, 300) }));
await page.goto(PAGE, { waitUntil: 'load' });
await page.waitForFunction(() => window.__probe);

const T = 0.7;
const diff = (a, b) => {           // mean absolute difference over RGB, 0..255
  let s = 0, n = 0;
  for (let i = 0; i < a.length; i += 4) { s += Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]); n += 3; }
  return +(s / n).toFixed(3);
};
// The plane sits in the lower middle of the frame; its cells are what the shader draws.
const planeCells = (px) => {
  const out = [];
  for (let y = 8; y < 13; y++) for (let x = 10; x < 22; x++) { const i = (y * 32 + x) * 4; out.push([px[i], px[i + 1], px[i + 2]]); }
  return out;
};
const lit = (cells) => cells.filter(([r, g, b]) => r + g + b > 90).length / cells.length;
const redness = (cells) => +(cells.reduce((s, [r, g, b]) => s + (r - (g + b) / 2), 0) / cells.length).toFixed(2);

const results = { page: 'Shop/Three.js/proofs/2026-11-15-context-loss-and-glsl/context-loss-and-glsl.html', ran: new Date().toISOString(),
  host: 'headless Chromium (playwright), software WebGL', three: 'r128 (cdnjs, the shelf)' };
const rules = [];
const rule = (name, pass, detail) => { rules.push({ name, pass: !!pass, detail }); };

results.webgl = await page.evaluate(() => {
  const gl = window.__probe.gl();
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  return { version: gl.getParameter(gl.VERSION), renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER), loseExt: window.__probe.hasLoseExt };
});

const before = await page.evaluate((t) => window.__probe.frame(t), T);
await page.locator('#stage canvas').screenshot({ path: join(HERE, 'frame-1-before.png') });
const beforePlane = planeCells(before);
results.before = { planeLitFraction: +lit(beforePlane).toFixed(3), planeRedness: redness(beforePlane) };
rule('the plane draws on load (over half its cells lit)', lit(beforePlane) > 0.5, results.before);

// ── 2. lose and restore, twice: first as r128 does it alone, then with the page setting its clear colour again
const corner = (px) => [px[0], px[1], px[2]];          // the top-left cell: background only
const bgCorner = corner(before);
async function loseAndRestore(reapply, shot) {
  await page.evaluate((r) => { window.__probe.state.reapplyClear = r; }, reapply);
  const asked = await page.evaluate(() => window.__probe.loseContext(800));
  await page.waitForFunction(() => window.__probe.state.context === 'lost', null, { timeout: 3000 }).catch(() => {});
  const during = await page.evaluate(() => ({ ctx: window.__probe.state.context, glLost: window.__probe.gl().isContextLost() }));
  await page.waitForFunction(() => window.__probe.state.context === 'restored', null, { timeout: 5000 }).catch(() => {});
  const px = await page.evaluate((t) => window.__probe.frame(t), T);
  await page.locator('#stage canvas').screenshot({ path: join(HERE, shot) });
  const st = await page.evaluate(() => ({ context: window.__probe.state.context, losses: window.__probe.state.losses, restores: window.__probe.state.restores, glLost: window.__probe.gl().isContextLost() }));
  return { asked, during, after: st, diffVsBefore: diff(before, px), backgroundCorner: corner(px), planeLitFraction: +lit(planeCells(px)).toFixed(3) };
}
const bare = await loseAndRestore(false, 'frame-2-restored-r128-alone.png');
const fixed = await loseAndRestore(true, 'frame-3-restored-clear-colour-set-again.png');
results.contextLoss = { backgroundBefore: bgCorner, r128Alone: bare, withClearColourSetAgain: fixed };
rule('WEBGL_lose_context is there and both losses were asked for', bare.asked && fixed.asked, { a: bare.asked, b: fixed.asked });
rule('the page saw each loss (the gl context reported lost)', bare.during.glLost && fixed.during.glLost, [bare.during, fixed.during]);
rule('the context came back each time (two losses, two restores, gl not lost)', fixed.after.losses === 2 && fixed.after.restores === 2 && !fixed.after.glLost, fixed.after);
rule('the striped texture and geometry came back (plane over half lit, both times)', bare.planeLitFraction > 0.5 && fixed.planeLitFraction > 0.5, [bare.planeLitFraction, fixed.planeLitFraction]);
rule('r128 alone loses the clear colour on restore (background corner differs from before by more than 5)', Math.max(...bare.backgroundCorner.map((v, i) => Math.abs(v - bgCorner[i]))) > 5, { before: bgCorner, after: bare.backgroundCorner });
rule('with the clear colour set again, the restored frame matches the before (mean |diff| under 2 of 255)', fixed.diffVsBefore < 2, fixed.diffVsBefore);

// ── 3. break the shader
await page.click('#break');
const report = await page.evaluate(() => ({ glsl: window.__probe.state.glsl, shader: window.__probe.state.shader,
  boxShown: document.getElementById('glsl').classList.contains('on'),
  where: document.getElementById('glsl-where').textContent }));
const broken = await page.evaluate((t) => window.__probe.frame(t), T);
await page.screenshot({ path: join(HERE, 'page-3-shader-broken.png'), fullPage: true });
const brokenPlane = planeCells(broken);
results.brokenShader = { reported: report.glsl, boxShown: report.boxShown, where: report.where,
  planeRedness: redness(brokenPlane), planeLitFraction: +lit(brokenPlane).toFixed(3) };
rule('three\'s diagnostics said not runnable, and the page caught it', !!report.glsl, report.shader);
rule('the page named the misspelt line in its own source', report.glsl && report.glsl.line && /uColour/.test(report.glsl.text || ''), report.where);
rule('the error box is shown', report.boxShown, report.boxShown);
rule('the plane is still drawn, red, not black (redness over 40)', redness(brokenPlane) > 40, results.brokenShader.planeRedness);

// ── 4. mend it
await page.click('#mend');
const mended = await page.evaluate((t) => window.__probe.frame(t), T);
results.mended = { diffBeforeVsMended: diff(before, mended), shader: await page.evaluate(() => window.__probe.state.shader) };
rule('mended, the frame matches the before (mean |diff| under 2 of 255)', results.mended.diffBeforeVsMended < 2, results.mended.diffBeforeVsMended);

// three r128 writes its own console.error on the broken compile: expected, counted, not a failure.
results.console = consoleLines;
const unexpected = consoleLines.filter((l) => (l.type === 'error' || l.type === 'pageerror') && !/THREE\.WebGLProgram: shader error/.test(l.text));
rule('no console error but three\'s own shader-error line', unexpected.length === 0, unexpected);

results.rules = rules;
results.passed = rules.every((r) => r.pass);
writeFileSync(join(HERE, 'measured.json'), JSON.stringify(results, null, 2) + '\n');
await browser.close();
for (const r of rules) console.log(`${r.pass ? 'pass' : 'FAIL'}  ${r.name}  ${JSON.stringify(r.detail)}`);
console.log(results.passed ? 'all rules pass' : 'some rules FAILED');
process.exitCode = results.passed ? 0 : 1;
