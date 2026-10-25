#!/usr/bin/env node
// title: Resonance and Damping — sketch — q-step-by-step — check
// born: 2026-10-25
// links: [[Resonance and Damping]] (connects-to, checks-the-sketch)
// forward_vector: I check the way up to Q you can hear, two ways, so the steps are never trusted on looks.
//
//   node "Resonance and Damping/Resonance and Damping — sketch — q-step-by-step — check.mjs" [--shots <dir>]
//
// 1. The numbers. The page keeps its mathematics in one pure block between `// ---- math` and
//    `// ---- end math ----`, ending in selfTest(); its tests accumulate step by step (Progressive
//    Staging). This runs that exact source in node and prints its lines.
// 2. The page, in headless Chromium, from file:// as a link from Obsidian or Finder opens it: no page
//    errors, no AudioContext before a click, every step reached by Next with exactly one showing, every
//    step's Pluck or Play makes sound, leaving a step silences it, and the last step's link reaches the
//    proof. Then, on this page and on the proof, a hidden tab stops the sound and showing it again does
//    not restart it. Pattern: the Dissolutions learning sequences' check-sequences.mjs.

import { readFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const HERE = dirname(fileURLToPath(import.meta.url));
const PAGE = join(HERE, 'Resonance and Damping — sketch — q-step-by-step.html');
const argv = process.argv.slice(2);
const shotsAt = argv.includes('--shots') ? argv[argv.indexOf('--shots') + 1] : null;
if (shotsAt) mkdirSync(shotsAt, { recursive: true });

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`); if (!ok) fails++; };

// ── 1. the numbers ───────────────────────────────────────────────────────────
const html = readFileSync(PAGE, 'utf8');
const m = html.match(/\/\/ ---- math[^\n]*\n([\s\S]*?)\/\/ ---- end math ----/);
check('the page has a math block', !!m);
if (m) {
  const lines = new Function(`${m[1]}\nreturn selfTest();`)();
  for (const l of lines) { console.log('  ' + l); if (l.startsWith('FAIL')) fails++; }
}

// ── 2. the page ──────────────────────────────────────────────────────────────
const require = createRequire(join(HERE, '..', '_ops', 'stigmergy', 'app', 'package.json'));
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { check('Playwright is installed for STIGMERGY', false, e.code || e.message); }
if (chromium) {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const p = await b.newPage({ viewport: { width: 1130, height: 900 } });
  const errors = [];
  p.on('pageerror', (e) => errors.push(e.message));
  p.on('console', (msg) => { if (msg.type() === 'error' && !/fonts\.(googleapis|gstatic)|Failed to load resource/.test(msg.text())) errors.push(msg.text()); });
  await p.route(/^https?:\/\//, (r) => (/fonts\.(googleapis|gstatic)\.com/.test(r.request().url()) ? r.abort() : r.continue()));
  await p.goto(pathToFileURL(PAGE).href);
  await p.waitForTimeout(400);
  check('no AudioContext before a click', await p.evaluate(() => ctx === null));
  const peak = () => p.evaluate(() => { if (!anResp) return -999; const a = new Float32Array(2048); anResp.getFloatTimeDomainData(a); let k = 0; for (const v of a) k = Math.max(k, Math.abs(v)); return 20 * Math.log10(k + 1e-12); });
  const steps = await p.evaluate(() => document.querySelectorAll('section.step').length);
  for (let i = 0; i < steps; i++) {
    const shown = await p.evaluate(() => Array.from(document.querySelectorAll('section.step')).filter((s) => !s.hidden).map((s) => +s.dataset.step));
    check(`step ${i + 1}: exactly one step showing, and it is this one`, shown.length === 1 && shown[0] === i, String(shown));
    const btn = await p.$(`section.step[data-step="${i}"] [data-pluck], section.step[data-step="${i}"] [data-play]`);
    if (btn) {
      // wait for the sound, up to 1.5 s (the first click also starts the engine); a pluck is heard at once
      await btn.click();
      let db = -999; for (let k = 0; k < 75 && db <= -30; k++) { await p.waitForTimeout(20); db = await peak(); }
      check(`step ${i + 1}: its button makes sound`, db > -30, `peak ${db.toFixed(1)} dBFS`);
      if (shotsAt) await p.screenshot({ path: join(shotsAt, `step-${i + 1}.png`) });
    } else if (shotsAt) await p.screenshot({ path: join(shotsAt, `step-${i + 1}.png`) });
    if (i < steps - 1) {
      await p.click('#next'); await p.waitForTimeout(200);
      if (btn) check(`step ${i + 1}: leaving it silences it`, await p.evaluate(() => ctx.state !== 'running'));
    }
  }
  const href = await p.evaluate(() => document.querySelector('a.proof-link').getAttribute('href'));
  check('the last step reaches the proof', existsSync(join(HERE, decodeURIComponent(href))), decodeURIComponent(href));
  check('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));

  // A hidden tab says nothing (Progressive Staging § Inside One Piece): playing, hide the tab, and the
  // sound stops; show it again, and it stays stopped until the next click. Both pages: the steps and the proof.
  const setHidden = (pg, hidden) => pg.evaluate((h) => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => h });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (h ? 'hidden' : 'visible') });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
  const hiddenCase = async (file, label, startSel) => {
    const pg = await b.newPage();
    await pg.route(/^https?:\/\//, (r) => r.abort());
    await pg.goto(pathToFileURL(join(HERE, file)).href);
    for (const sel of startSel) { await pg.click(sel); await pg.waitForTimeout(300); }
    let running = false; for (let k = 0; k < 50 && !running; k++) { await pg.waitForTimeout(20); running = await pg.evaluate(() => !!ctx && ctx.state === 'running'); }
    check(`${label}: playing before the tab is hidden`, running);
    await setHidden(pg, true); await pg.waitForTimeout(400);
    check(`${label}: hiding the tab stops the sound`, await pg.evaluate(() => ctx.state !== 'running'));
    await setHidden(pg, false); await pg.waitForTimeout(600);
    check(`${label}: showing it again does not start the sound`, await pg.evaluate(() => ctx.state !== 'running'));
    await pg.close();
  };
  await hiddenCase('Resonance and Damping — sketch — q-step-by-step.html', 'the steps, step 3 pushing', ['#next', '#next', 'section.step[data-step="2"] [data-play]']);
  await hiddenCase('Resonance and Damping — sketch — q-you-can-hear.html', 'the proof, sweeping', ['#sweep']);
  await b.close();
}
console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exit(fails ? 1 : 0);
