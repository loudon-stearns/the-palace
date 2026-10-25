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

  // The weight and its trace are one motion, on every step that draws a weight (1, 2, 3 and 5): the red dot at
  // the weight's centre and the red dot at the trace's head sit at one height, so the weight never moves against
  // its drawing, and the weight stays on the sheet. Steps 1 and 2 are plucked five times so the swing piles up.
  {
    const pg = await b.newPage({ viewport: { width: 1130, height: 900 } });
    await pg.route(/^https?:\/\//, (r) => r.abort());
    await pg.goto(pathToFileURL(PAGE).href);
    const cases = [
      { step: 0, act: 'pluck', split: (w) => Math.min(220, w * 0.34), head: (w) => w - 8 },
      { step: 1, act: 'pluck', split: (w) => Math.min(220, w * 0.34), head: (w) => w - 8 },
      { step: 2, act: 'play', split: (w) => Math.min(220, w * 0.34), head: (w) => w - 8 },
      { step: 4, act: 'play', split: (w) => Math.min(150, w * 0.18), head: (w) => w * 0.6 - 18 },
    ];
    for (const k of cases) {
      await pg.click(`.rail button:nth-child(${k.step + 1})`); await pg.waitForTimeout(150);
      if (k.act === 'pluck') for (let n = 0; n < 5; n++) { await pg.click(`section.step[data-step="${k.step}"] [data-pluck]`); await pg.waitForTimeout(170); }
      else { await pg.click(`section.step[data-step="${k.step}"] [data-play]`); await pg.waitForTimeout(1500); }
      let worst = 0, inside = true, pushWorst = 0;
      for (let n = 0; n < 8; n++) {
        await pg.waitForTimeout(130);
        const r = await pg.evaluate(([step, splitSrc, headSrc]) => {
          const c = document.querySelector(`section.step[data-step="${step}"] canvas`), g = c.getContext('2d'), W = c.width, H = c.height;
          const d = g.getImageData(0, 0, W, H).data, red = (x, y) => { const i = (y * W + x) * 4; return d[i] > 170 && d[i + 1] < 80 && d[i + 2] < 70; };
          const amber = (x, y) => { const i = (y * W + x) * 4; return d[i] > 140 && d[i] < 205 && d[i + 1] > 85 && d[i + 1] < 150 && d[i + 2] < 60; };
          const dpr = W / c.clientWidth, cw = c.clientWidth;
          const rowsAt = (cx, is = red) => { const ys = []; const x0 = Math.round(cx * dpr) - 1; for (let y = 0; y < H; y++) for (let x = x0; x <= x0 + 2; x++) if (is(x, y)) { ys.push(y); break; } return ys; };
          const mean = (a) => a.length ? a.reduce((p, q) => p + q, 0) / a.length : NaN;
          const split = eval(splitSrc)(cw), head = eval(headSrc)(cw);
          const bw = Math.min(70, split * 0.4), xa = split / 2 + bw / 2 + 16;           // the push arrow's place (default weight)
          return { weight: mean(rowsAt(split / 2)) / dpr, head: mean(rowsAt(head)) / dpr, h: H / dpr,
                   push: rowsAt(xa + 9, amber).map((y) => y / dpr), pushHead: rowsAt(head + 2.5, amber).map((y) => y / dpr) };   // just right of the trace's end: the head dot alone
        }, [k.step, k.split.toString(), k.head.toString()]);
        worst = Math.max(worst, Math.abs(r.weight - r.head));
        // the amber tip dot and the amber head ring (a ring, so the weight's red dot never hides it), by their centres
        const centre = (a) => a.length ? (a[0] + a[a.length - 1]) / 2 : NaN;
        if (k.act === 'play') pushWorst = Math.max(pushWorst, Math.abs(centre(r.push) - centre(r.pushHead)));
        if (!(r.weight > 0.05 * r.h && r.weight < 0.95 * r.h)) inside = false;
      }
      check(`step ${k.step + 1}: the weight's centre and the trace's head are one height`, worst <= 1.5, `worst ${worst.toFixed(2)} px over 8 frames`);
      check(`step ${k.step + 1}: the weight stays on the sheet, not clipped`, inside);
      if (k.act === 'play') check(`step ${k.step + 1}: the push's tip and the amber trace's head are one height`, pushWorst <= 2, `worst ${pushWorst.toFixed(2)} px over 8 frames`);
    }
    // Step 4: the weight beside the curve, on one fixed scale. Pushed at exactly its own rate and given time to
    // settle, the red bar at the top of its swing and the red dot on the curve are one height.
    {
      await pg.click('.rail button:nth-child(4)'); await pg.waitForTimeout(150);
      await pg.evaluate(() => { const e = document.getElementById('s4d'); e.value = 500; e.dispatchEvent(new Event('input')); });
      await pg.click('section.step[data-step="3"] [data-play]'); await pg.waitForTimeout(14000);
      let worst = 0;
      for (let n = 0; n < 6; n++) {
        await pg.waitForTimeout(150);
        const r = await pg.evaluate(() => {
          const c = document.querySelector('section.step[data-step="3"] canvas'), g = c.getContext('2d'), W = c.width, H = c.height;
          const d = g.getImageData(0, 0, W, H).data, dpr = W / c.clientWidth, cw = c.clientWidth;
          const red = (x, y) => { const i = (y * W + x) * 4; return d[i] > 170 && d[i + 1] < 80 && d[i + 2] < 70; };
          const rowsAt = (cx) => { const ys = []; const x0 = Math.round(cx * dpr) - 1; for (let y = 0; y < H; y++) for (let x = x0; x <= x0 + 2; x++) if (red(x, y)) { ys.push(y / dpr); break; } return ys; };
          const split = Math.min(200, cw * 0.28), bw = Math.min(70, split * 0.4), x0 = split + 10, w = cw - split - 18;
          const bar = rowsAt(split / 2 - bw / 2 - 4), dot = rowsAt(x0 + w / 2);      // the bar's left end; the dot at f
          const mid = (a) => a.length ? (a[0] + a[a.length - 1]) / 2 : NaN;
          // the bar is the lowest run of red in its column; its label sits just above it
          const runs = []; for (const y of bar) { if (runs.length && y - runs[runs.length - 1].at(-1) <= 1) runs[runs.length - 1].push(y); else runs.push([y]); }
          return { bar: mid(runs.length ? runs[runs.length - 1] : []), dot: mid(dot) };
        });
        worst = Math.max(worst, Math.abs(r.bar - r.dot));
      }
      check('step 4: settled at its own rate, the top of the swing and the curve are one height', worst <= 3, `worst ${worst.toFixed(2)} px over 6 frames`);
    }
    await pg.click('.rail button:nth-child(1)'); await pg.waitForTimeout(150);
    // a note survives a reload
    await pg.fill('section.step[data-step="0"] textarea', 'a note that must survive');
    await pg.reload(); await pg.waitForTimeout(300);
    check('a note survives a reload', (await pg.inputValue('section.step[data-step="0"] textarea')) === 'a note that must survive');
    await pg.evaluate(() => localStorage.clear());
    await pg.close();
  }

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
