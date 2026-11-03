#!/usr/bin/env node
// title: Resonance and Damping — rich — check
// born: 2026-11-03
// links: [[Resonance and Damping]] (connects-to, checks-the-rich-pieces)
// forward_vector: I check the three pieces Enrichment made for the page's rich face, two ways, so none is trusted on looks.
//
//   node "Resonance and Damping/Resonance and Damping — rich — check.mjs"
//
// 1. The numbers. Each piece keeps its engine in one pure block between `// ---- math` and `// ---- end math ----`,
//    ending in selfTest(), whose tests climb step by step to the claim the piece tests. This runs that exact
//    source in node and prints its lines. INFO lines are measurements the page's text is read against, not tests.
// 2. The pages, in headless Chromium, from file:// as a link from Obsidian or Finder opens them: no page errors,
//    no AudioContext before a click, one step showing at a time, every step's first sound button makes sound,
//    leaving a step silences it, and a hidden tab stops the sound. In the rich face the kit does the hush; this is
//    the piece alone. Pattern: the q-step-by-step check beside it.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const HERE = dirname(fileURLToPath(import.meta.url));
const PIECES = ['three rulers', 'who keeps time', 'loss per trip'].map((w) => join(HERE, `Resonance and Damping — rich — ${w}.html`));
let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`); if (!ok) fails++; };

for (const page of PIECES) {
  const name = page.split(' — rich — ')[1].replace('.html', '');
  console.log(`\n== ${name}: the numbers ==`);
  const m = readFileSync(page, 'utf8').match(/\/\/ ---- math[^\n]*\n([\s\S]*?)\/\/ ---- end math ----/);
  check('the piece has a math block', !!m);
  if (m) for (const l of new Function(`${m[1]}\nreturn selfTest();`)()) { console.log('  ' + l); if (l.startsWith('FAIL')) fails++; }
}

const require = createRequire(join(HERE, '..', '_ops', 'stigmergy', 'app', 'package.json'));
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { check('Playwright is installed for STIGMERGY', false, e.code || e.message); }
if (chromium) {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const page of PIECES) {
    const name = page.split(' — rich — ')[1].replace('.html', '');
    console.log(`\n== ${name}: the page ==`);
    const p = await b.newPage({ viewport: { width: 1130, height: 900 } });
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    p.on('console', (msg) => { if (msg.type() === 'error' && !/fonts\.(googleapis|gstatic)|Failed to load resource/.test(msg.text())) errors.push(msg.text()); });
    await p.route(/^https?:\/\//, (r) => r.abort());
    await p.goto(pathToFileURL(page).href);
    await p.waitForTimeout(400);
    check('no AudioContext before a click', await p.evaluate(() => actx === null));
    const steps = await p.evaluate(() => document.querySelectorAll('section.step').length);
    for (let i = 0; i < steps; i++) {
      const shown = await p.evaluate(() => [...document.querySelectorAll('section.step')].map((s, k) => (s.hidden ? -1 : k)).filter((k) => k >= 0));
      check(`step ${i + 1}: exactly one step showing, and it is this one`, shown.length === 1 && shown[0] === i, String(shown));
      await p.click('section.step:not([hidden]) .go');
      let on = false, peak = 0;
      for (let k = 0; k < 150 && !on; k++) {
        await p.waitForTimeout(40);
        [on, peak] = await p.evaluate(() => { if (!src || !actx || actx.state !== 'running') return [false, 0]; const d = src.buffer.getChannelData(0); let m = 0; for (let j = 0; j < d.length; j += 7) m = Math.max(m, Math.abs(d[j])); return [true, m]; });
      }
      check(`step ${i + 1}: its first sound button makes sound`, on && peak > 0.1, `buffer peak ${peak.toFixed(2)}`);
      if (i < steps - 1) {
        await p.click('#next'); await p.waitForTimeout(150);
        check(`step ${i + 1}: leaving it silences it`, await p.evaluate(() => src === null));
      }
    }
    // a hidden tab stops it, and showing it again does not start it
    await p.click('section.step:not([hidden]) .go'); await p.waitForTimeout(500);
    const before = await p.evaluate(() => src !== null);
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    const hiddenQuiet = await p.evaluate(() => src === null);
    await p.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
    await p.waitForTimeout(300);
    check('playing before the tab is hidden', before);
    check('hiding the tab stops the sound', hiddenQuiet);
    check('showing it again does not start the sound', await p.evaluate(() => src === null));
    check('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
    await p.close();
  }
  await b.close();
}
console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exit(fails ? 1 : 0);
