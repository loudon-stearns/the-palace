#!/usr/bin/env node
// title: Progressive Staging — rich — checks
// born: 2026-11-03
// links: [[Progressive Staging]] (connects-to · rich-face-check) · checks the pieces in [[Progressive Staging — rich.json]]
// forward_vector: I check Progressive Staging's rich face two ways, so nothing on it is trusted on looks: the
//   made walk's engine against the dev plan and every number the walk shows, and the gathered walk against the
//   rules the page's Inside One Piece sets. I exit 1 if any claim fails, so a change that breaks one is caught.
//
//   node "Progressive Staging/Progressive Staging — rich — checks.mjs"
//
// 1. The leak at its stop, the numbers: its engine (<script id="engine">) is the dev plan's Stages 1 and 2 as
//    written (checked against the plan's own lines); run in Node at 44.1 and 48 kHz it says where "recover Stage 1
//    exactly" holds and where it doesn't.
// 2. The leak at its stop, the page, in headless Chromium from file://: no errors, no AudioContext before a click,
//    one step at a time, every step's sound button sounds, leaving a step silences it, the test step reads as its
//    numbers say under both resets.
// 3. The gathered walk (Dispersion Table — rich — the table and the loop) against Inside One Piece, rule by rule.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..');
const PIECE = path.join(HERE, 'Progressive Staging — rich — the leak at its stop.html');
const PLAN = path.join(ROOT, 'Projects', 'Action Potential Oscillator', 'neural_oscillator_dev_plan.md');
const WALK = path.join(ROOT, 'Dispersion Table', 'Dispersion Table — rich — the table and the loop.html');
let fails = 0;
const ok = (cond, what, detail) => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${what}${detail ? `  (${detail})` : ''}`); if (!cond) fails++; };
const info = (what) => console.log(`INFO  ${what}`);

const src = fs.readFileSync(PIECE, 'utf8');
const engine = (src.match(/<script id="engine">([\s\S]*?)<\/script>/) || [])[1];
ok(!!engine, 'the piece carries an engine block');
ok(!src.includes('rich:' + 'hush') && !src.includes('rich:' + 'height'), "the piece never names the kit's messages, so the kit keeps the hush and the height");
const E = new Function(engine + '; return { STOP, stage1, stage2, planDrive, resets, freqOf, maxDiff, firstDiff, cents, NOTES, testRow };')();

console.log('\n== the engine is the plan, as written ==');
{
  const plan = fs.readFileSync(PLAN, 'utf8');
  const has = (s) => plan.includes(s);
  ok(has('membrane_v = membrane_v - 1.0;   // wrap preserves phase accuracy'), 'the plan\'s Stage 1 wraps: subtracts the threshold');
  ok(has('membrane_v = membrane_v * leak_coeff + drive;'), 'the plan\'s Stage 2 is a one-pole leak plus drive');
  ok(has('drive = 1.0 / (leak_tau * (1.0 - exp(-period_samples / leak_tau)));'), 'the plan\'s Stage 2 drive line, the one the engine carries');
  ok(/if \(membrane_v >= 1\.0\) \{\s*membrane_v = 0;/.test(plan), 'the plan\'s Stage 2 resets hard to zero');
  ok(has('Unlike Stage 1\'s wrap, a hard reset is more appropriate here.'), 'the plan says the hard reset is on purpose');
  ok(has('**Frequency accuracy**: at `sig~ 440`, output should measure 440 Hz ±0.1 Hz.'), 'Stage 1\'s frequency test is ±0.1 Hz at 440');
  ok(has('**Frequency accuracy**: at `sig~ 440` and `sig~ 5`, output should measure 440 Hz.'), 'Stage 2 carries the frequency test, as the page says tests pile up');
  ok(Number.isNaN(E.planDrive(440, Infinity, 48000)), 'the plan\'s drive line at τ = ∞ gives NaN (1 ÷ (∞ × 0)); the stop is a limit, not a setting');
  for (const sr of [44100, 48000]) {
    const P = sr / 440;
    ok(E.planDrive(440, 1e9, sr) > 0 && Math.abs(E.planDrive(440, 1e9, sr) - 1 / P) / (1 / P) < 1e-6, `${sr}: at τ = 10⁹ ms the plan's drive is within a millionth of 1/P, so the limit is honest`);
  }
}

console.log('\n== the leak at its stop: does Stage 2 give Stage 1 back? ==');
const want = {};
for (const sr of [44100, 48000]) {
  for (const f of E.NOTES) {
    const h = E.testRow(f, sr, 'hard'), w = E.testRow(f, sr, 'wrap');
    ok(h.pass1, `${sr} · ${f} Hz: Stage 1 passes its own test`, `${h.f1.toFixed(4)} Hz`);
    // the climb: up to the first reset the two are the same samples
    const n = 2 * sr, a = E.stage1(f, sr, n), b = E.stage2(f, E.STOP, sr, n, 'hard');
    ok(h.first >= Math.floor(h.P), `${sr} · ${f} Hz: at the stop the climb is Stage 1's, sample for sample, up to the first reset`, `first difference at sample ${h.first}, the period is ${h.P.toFixed(3)}`);
    ok(E.resets(b).every((i, k, r) => k === 0 || r[k] - r[k - 1] === Math.ceil(h.P)), `${sr} · ${f} Hz: with the plan's reset every cycle is ⌈P⌉ = ${Math.ceil(h.P)} samples`);
    want[`${sr}:${f}`] = h;
    info(`${sr} · ${f} Hz · hard reset: stage 2 ${h.f2.toFixed(3)} Hz, ${h.c2.toFixed(2)} cents, test ${h.pass2 ? 'pass' : 'FAIL'}, largest sample difference ${h.diff.toFixed(4)} · wrap: ${w.f2.toFixed(3)} Hz, difference ${w.diff}`);
    ok(w.diff === 0 && w.pass2, `${sr} · ${f} Hz: with Stage 1's reset, Stage 2 at its stop is Stage 1 exactly`, `largest difference ${w.diff}`);
  }
  const hard = E.NOTES.map((f) => want[`${sr}:${f}`]);
  const nfail = hard.filter((r) => !r.pass2).length;
  info(`${sr}: with the plan's reset the inherited test fails at ${nfail} of 5 notes; worst ${Math.min(...hard.map((r) => r.c2)).toFixed(2)} cents`);
}
ok(!want['48000:440'].pass2 && Math.abs(want['48000:440'].c2 + 14.37) < 0.01, '48 kHz · 440 Hz: the plan\'s Stage 2 at its stop is 14.37 cents flat, and fails', `${want['48000:440'].f2.toFixed(3)} Hz`);
ok(!want['44100:1760'].pass2 && want['44100:1760'].c2 < -63, '44.1 kHz · 1760 Hz: 64 cents flat at the top note', `${want['44100:1760'].c2.toFixed(2)} cents`);
ok(want['48000:440'].diff > 0.99, 'from the first reset on they reset on different samples: the largest difference is the whole threshold', want['48000:440'].diff.toFixed(4));
// an aside the walk shows on step 2 without a verdict: the plan's own default, 5 ms, measured
for (const sr of [44100, 48000]) { const b = E.stage2(440, 5, sr, 2 * sr, 'hard'), f = E.freqOf(b, sr); info(`${sr} · 440 Hz · τ 5 ms (the plan's default): stage 2 measures ${f.toFixed(3)} Hz, ${E.cents(f, 440).toFixed(2)} cents; the plan's Stage 2 test fails here too`); }

const require = createRequire(path.join(ROOT, '_ops', 'stigmergy', 'app', 'package.json'));
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ok(false, 'Playwright is installed for STIGMERGY', e.code || e.message); }
if (chromium) {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const open = async (file, width) => {
    const p = await b.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)|Failed to load resource/.test(m.text())) errors.push(m.text()); });
    await p.route(/^https?:\/\//, (r) => r.abort());
    await p.goto(pathToFileURL(file).href);
    await p.waitForTimeout(400);
    return { p, errors };
  };

  console.log('\n== the leak at its stop: the page ==');
  for (const width of [1130, 760]) {
    const { p, errors } = await open(PIECE, width);
    const wide = width === 1130;
    if (wide) ok(await p.evaluate(() => actx === null), 'no AudioContext before a click');
    const count = await p.evaluate(() => steps.length);
    if (wide) ok(count === 4, 'four steps', String(count));
    for (let i = 0; i < count; i++) {
      const shown = await p.evaluate(() => steps.map((s, k) => (s.hidden ? -1 : k)).filter((k) => k >= 0));
      if (wide) ok(shown.length === 1 && shown[0] === i, `step ${i + 1}: one step showing, and it is this one`, String(shown));
      if (wide) ok(await p.evaluate(() => !!steps[step].dataset.one), `step ${i + 1}: names its one thing`, await p.evaluate(() => steps[step].dataset.one));
      await p.click('section.step:not([hidden]) button.go');
      let on = false; for (let t = 0; t < 100 && !on; t++) { await p.waitForTimeout(50); on = await p.evaluate(() => !!src && actx && actx.state === 'running'); }
      const peak = await p.evaluate(() => { if (!src) return 0; const d = src.s.buffer.getChannelData(0); let m = 0; for (let j = 0; j < d.length; j += 3) m = Math.max(m, Math.abs(d[j])); return m; });
      if (wide) ok(on && peak > 0.05, `step ${i + 1}: its sound button makes sound`, `buffer peak ${peak.toFixed(3)}`);
      if (i === 2 && wide) {
        const m = await p.evaluate(() => document.getElementById('m3').textContent);
        ok(/NaN/.test(m) && /first sample where they differ: \d+/.test(m), 'step 3 at the stop: shows the plan\'s line giving NaN, and where the two part', m.slice(0, 200));
        await p.click('[data-listen="diff"]'); await p.waitForTimeout(200);
        const dpk = await p.evaluate(() => { const d = src.s.buffer.getChannelData(0); let m = 0; for (let j = 0; j < d.length; j += 3) m = Math.max(m, Math.abs(d[j])); return m; });
        ok(dpk > 0.05, 'step 3: their difference is not silence, with the plan\'s reset', `peak ${dpk.toFixed(3)}`);
      }
      if (i === 3 && wide) {
        const read = async () => (await p.evaluate(() => document.getElementById('v4').textContent)).replace(/\s+/g, ' ');
        for (const rate of [48000, 44100]) {
          await p.click(`[data-rate="${rate}"]`); await p.waitForTimeout(200);
          // at 44.1 kHz, 110 Hz lands 0.025 Hz flat, inside Stage 1's tenth of a hertz: four of five fail there
          const wantRe = rate === 48000 ? /inherited test fails at every note/ : /inherited test fails at 4 of 5 notes/;
          ok(wantRe.test(await read()), `test step, ${rate}, the plan's reset: reads as failing at ${rate === 48000 ? 'every note' : '4 of 5 notes'}`, (await read()).slice(0, 120));
          await p.click('[data-reset="wrap"]'); await p.waitForTimeout(200);
          ok(/passes at every note[\s\S]*exactly/.test(await read()), `test step, ${rate}, Stage 1's reset: reads as passing, exactly`, (await read()).slice(0, 120));
          await p.click('[data-reset="hard"]'); await p.waitForTimeout(200);
        }
        const cells = await p.evaluate(() => [...document.querySelectorAll('#t4 tr')].map((r) => r.textContent));
        ok(cells.length === 6, 'the test table has five notes', String(cells.length));
      }
      if (i < count - 1) { await p.click('#next'); await p.waitForTimeout(150); if (wide) ok(await p.evaluate(() => src === null), `step ${i + 1}: leaving it silences it`); }
    }
    await p.click('#back'); await p.waitForTimeout(100);
    if (wide) ok(await p.evaluate(() => step === 2 && !steps[2].hidden && steps[3].hidden), 'back returns to step 3');
    await p.click('#rail button:first-child'); await p.waitForTimeout(100);
    if (wide) ok(await p.evaluate(() => step === 0), 'the rail goes straight back to the start');
    info(`${width} px wide: ${await p.evaluate(() => document.documentElement.scrollHeight)} px tall on step 1`);
    ok(errors.length === 0, `${width} px: no page errors`, errors.slice(0, 3).join(' | '));
    await p.close();
  }

  console.log('\n== the gathered walk, against Inside One Piece ==');
  {
    const { p, errors } = await open(WALK, 1130);
    ok(await p.evaluate(() => actx === null), 'silent until a click: no AudioContext before one');
    const names = await p.evaluate(() => steps.map((s) => s.dataset.name));
    info(`its steps: ${names.map((n, i) => `${i + 1} ${n}`).join(' · ')}`);
    ok(names.length === 4 && names.every(Boolean), 'each step is named for its one thing', names.join(' | '));
    ok(await p.evaluate(() => steps.filter((s) => !s.hidden).length === 1), 'one step shows at a time');
    // the step list stays open: straight to the last step, and back to the first, by the rail
    await p.click('#rail button:last-child'); await p.waitForTimeout(150);
    ok(await p.evaluate(() => step === steps.length - 1), 'the rail goes straight to the last step: a path, not a gate');
    const last = await p.evaluate(() => steps[step].querySelector('h2').textContent);
    ok(/test/i.test(last), 'the last step is the test', last);
    await p.click('section.step:not([hidden]) button.go');
    let on = false; for (let t = 0; t < 100 && !on; t++) { await p.waitForTimeout(50); on = await p.evaluate(() => !!src); }
    ok(on, 'its sound starts on a click');
    await p.click('#back'); await p.waitForTimeout(150);
    ok(await p.evaluate(() => step === steps.length - 2 && src === null), 'back returns one step, and changing step stops the sound');
    // where it can, a control on the new step takes you back to the last
    const backCtl = await p.evaluate(() => steps.map((s) => [...s.querySelectorAll('[data-listen]')].map((b) => b.dataset.listen)));
    info(`hear controls by step: ${backCtl.map((l, i) => `${i + 1} [${l.join(', ')}]`).join(' · ')}`);
    ok(backCtl[2].includes('table') && backCtl[2].includes('loop'), 'step 3 can take you back to the table alone and the loop alone');
    // the last step links to the existing proof
    const link = await p.evaluate(() => { const a = steps[steps.length - 1].querySelector('a[href*="table-that-travels"]'); return a ? a.getAttribute('href') : null; });
    info(`its last step ${link ? 'links to the proof: ' + link : 'names the proof ("the proof below") but carries no link to it; opened alone, the reader has no way there'}`);
    const checks = fs.existsSync(path.join(ROOT, 'Dispersion Table', 'Dispersion Table — rich — check.mjs'));
    ok(checks, 'its checks pile up: a check file beside it runs every step, the first included');
    ok(errors.length === 0, 'no page errors', errors.slice(0, 3).join(' | '));
    await p.close();
  }
  await b.close();
}
console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exit(fails ? 1 : 0);
