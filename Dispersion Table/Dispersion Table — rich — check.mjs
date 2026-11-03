#!/usr/bin/env node
// title: Dispersion Table — rich — check
// born: 2026-11-03
// links: [[Dispersion Table]] (connects-to · rich-face-check) · checks the four made pieces in [[Dispersion Table — rich.json]]
// forward_vector: I check the four pieces Enrichment made for Dispersion Table's rich face, two ways, so none is trusted on looks. I exit 1 if any claim fails, so a change that breaks a claim is caught.
//
//   node "Dispersion Table/Dispersion Table — rich — check.mjs"
//
// 1. The numbers. All four pieces carry one engine, in <script id="engine">; this checks the four copies are the same
//    text, then runs that engine in Node against every claim the pieces make, at 44.1 and 48 kHz.
// 2. The pages, in headless Chromium, from file:// as a link from Obsidian or Finder opens them: no page errors, no
//    AudioContext before a click, one step showing at a time, each step's first sound button makes sound, leaving a
//    step silences it, and each test step's verdict says what its numbers say. In the rich face the kit does the hush;
//    this is the piece alone. Pattern: Phase Reduction's check.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WHATS = ['the table and the loop', 'where the partials land', 'the warp knob', 'two knobs, one loop'];
const FILES = WHATS.map((w) => path.join(HERE, `Dispersion Table — rich — ${w}.html`));
let fails = 0;
const ok = (cond, what, detail) => { console.log(`${cond ? 'PASS' : 'FAIL'}  ${what}${detail ? `  (${detail})` : ''}`); if (!cond) fails++; };
const info = (what) => console.log(`INFO  ${what}`);

const srcs = FILES.map((f) => fs.readFileSync(f, 'utf8'));
const engines = srcs.map((s) => (s.match(/<script id="engine">([\s\S]*?)<\/script>/) || [])[1]);
ok(engines.every(Boolean), 'every piece carries an engine block');
ok(engines.every((e) => e === engines[0]), 'the four engine blocks are the same text, so one check covers them all');
srcs.forEach((s, i) => ok(!s.includes('rich:' + 'hush') && !s.includes('rich:' + 'height'), `${WHATS[i]}: never names the kit's messages, so the kit keeps the hush and the height`));
const E = new Function(engines[0] + `; return { lagAP1, lagAP2, gdAP2, magAP2, logSections, stiffSections, specFor, loopLag, loopDcDelay, predictPartials, runLoop, runChain,
  makeCycle, noiseBurst, readTable, maxDiff, spectrumDb, peakNear, measurePartials, windowFor, measureDecay, predictDecay, cents, deviations, fitPiano, magFir3, magOnePole };`)();

console.log('\n== the engine itself ==');
{
  let worst = 0;
  for (const r of [0.3, 0.8, 0.95]) for (const th of [0.1, 1, 2.5]) {
    let s = 0; const n = 40000;
    for (let i = 1; i <= n; i++) { const w = i * Math.PI / n; s += E.gdAP2(w - Math.PI / n / 2, r, th) * Math.PI / n; if (i % 2000 === 0) worst = Math.max(worst, Math.abs(s - E.lagAP2(w, r, th))); }
  }
  ok(worst < 1e-5, 'the second-order lag, written in closed form, is the integral of its group delay', `worst ${worst.toExponential(1)} rad`);
  let mag = 0; for (const r of [0, 0.5, 0.95, 0.99]) for (let w = 0.001; w < Math.PI; w += 0.003) mag = Math.max(mag, Math.abs(E.magAP2(w, r, 0.7) - 1));
  ok(mag < 1e-12, 'the second-order allpass passes every frequency at level one', `largest departure ${mag.toExponential(1)}`);
  const x = new Float64Array(4096); x[0] = 1; const h = E.runChain(E.logSections(8, 300, 12000, 0.9, 48000), x);
  let e = 0; for (const v of h) e += v * v;
  ok(Math.abs(e - 1) < 1e-3, 'eight sections in the time domain keep a click\'s energy', `energy out ${e.toFixed(5)} of 1, over 4096 samples`);
}

for (const SR of [44100, 48000]) {
  console.log(`\n== the table and the loop, fs ${SR} ==`);
  for (const f0 of [110, 440, 1760]) {
    const P = Math.round(SR / f0), n = 3 * SR;
    let worst = 0;
    for (const shape of ['saw', 'pulse', 'soft']) { const cyc = E.makeCycle(shape, P); worst = Math.max(worst, E.maxDiff(E.readTable(cyc, P, n), E.runLoop({ L: P, sections: [] }, cyc, n), n)); }
    ok(worst === 0, `${f0} Hz: a whole-sample loop and the table give the same samples, exactly`, `largest difference ${worst} over 3 s, three shapes`);
    const cyc = E.makeCycle('saw', P);
    ok(E.maxDiff(E.readTable(cyc, P, n), E.runLoop({ L: P + 1, sections: [] }, cyc, n), n) > 0.5, `${f0} Hz: one sample longer, the test fails as it should`);
    const grid = SR / (P + 0.5);
    for (const kind of ['lin', 'ap']) {
      const spec = { L: P, interp: { kind, d: 0.5 }, sections: [] }, y = E.runLoop(spec, cyc, n), tab = E.readTable(cyc, P + 0.5, n);
      const pred = E.predictPartials(spec, 24, SR).filter((f) => f < 0.45 * SR), meas = E.measurePartials(y, 2 * P, E.windowFor(spec, pred, SR), SR, pred, grid);
      let cMiss = 0, lMiss = 0, tabL = 0, gone = 0;
      pred.forEach((f, i) => {
        const pl = -E.predictDecay(spec, f, SR);
        if (pl > 300) { gone++; } else cMiss = Math.max(cMiss, Math.abs(E.cents(meas[i][0], f)));   // gone faster than 300 dB/s: the piece shows no measurement
        const ml = -E.measureDecay(y, SR, f, 0.05, 0.25, 8192);
        if (pl < 150) lMiss = Math.max(lMiss, Math.abs(ml - pl) / Math.max(1, pl));
        tabL = Math.max(tabL, Math.abs(E.measureDecay(tab, SR, (i + 1) * grid, 0.05, 0.25, 8192)));
      });
      const top = pred.length, off = E.cents(pred[top - 1], top * grid), k10 = pred.length >= 10 ? -E.predictDecay(spec, pred[9], SR) : NaN;
      ok(cMiss < 0.05, `${f0} Hz, ${kind === 'lin' ? 'straight line' : 'allpass'}: the loop's partials measure where the round-trip condition puts them`, `worst ${cMiss.toFixed(4)} ¢ over ${top - gone}${gone ? `, ${gone} gone faster than 300 dB/s` : ''}`);
      ok(lMiss < 0.05, `${f0} Hz, ${kind === 'lin' ? 'straight line' : 'allpass'}: each harmonic dies at the predicted rate`, `worst ${(100 * lMiss).toFixed(2)}% (or 1 dB/s), harmonics losing under 150 dB/s`);
      ok(tabL < 0.05, `${f0} Hz: the table, read between samples fresh each time, loses no level`, `largest ${tabL.toFixed(4)} dB/s`);
      if (kind === 'lin') ok(Math.abs(off) < 0.01 && k10 > 0.5, `${f0} Hz, straight line: keeps the timing, takes level`, `harmonic ${top} ${off.toFixed(4)} ¢ off; harmonic 10 loses ${k10.toFixed(1)} dB/s`);
      else ok(Math.abs(k10 || 0) < 0.01 && off < 0, `${f0} Hz, allpass: keeps the level, takes timing`, `harmonic ${top} ${off.toFixed(3)} ¢ off the table's grid`);
      if (kind === 'ap' && f0 === 1760) ok(off < -10, '1760 Hz, allpass: the bend is no longer small', `${off.toFixed(2)} ¢ at harmonic ${top}`);
    }
  }
}

for (const SR of [44100, 48000]) {
  console.log(`\n== where the partials land, fs ${SR} ==`);
  for (const N of [150, 200, 400]) for (const bend of [0.5, 0.75, 0.85]) {
    const specs = { bare: { L: N, sections: [], rho: 0.998 }, straight: { L: N, avg: true, sections: [], rho: 1 } };
    const sec = []; for (let i = 0; i < 8; i++) sec.push({ o: 1, a: -bend });
    const bent = { L: N, sections: sec, rho: 0.998 }; bent.L = Math.max(2, Math.round(N - (E.loopDcDelay(bent) - N))); specs.bent = bent;
    const res = {};
    for (const [k, spec] of Object.entries(specs)) {
      const pred = E.predictPartials(spec, 16, SR), y = E.runLoop(spec, E.noiseBurst(spec.L, 11), Math.round(2.5 * SR));
      const meas = E.measurePartials(y, 2 * spec.L, E.windowFor(spec, pred, SR), SR, pred, pred[0]).map((m) => m[0]);
      res[k] = { pred, meas, miss: Math.max(...meas.map((f, i) => Math.abs(f - pred[i]))), ratio: Math.max(...meas.map((f, i) => Math.abs(E.cents(f, (i + 1) * meas[0])))) };
    }
    const miss = Math.max(res.bare.miss, res.straight.miss, res.bent.miss), straightMove = E.cents(res.straight.meas[0], SR / N), straightPred = E.cents(SR / (N + 0.5), SR / N);
    const bentOff = E.cents(res.bent.meas[15], 16 * res.bent.meas[0]);
    ok(miss < 0.01 && res.bare.ratio < 0.01 && res.straight.ratio < 0.01 && Math.abs(straightMove - straightPred) < 0.01 && Math.abs(bentOff) > 1,
      `N ${N}, bend ${bend}: on the crossings; bare and straight harmonic; straight moved by fs/(N+½); bent off the grid`,
      `miss ${miss.toFixed(4)} Hz · bare ${res.bare.ratio.toFixed(3)} ¢ · straight ${res.straight.ratio.toFixed(3)} ¢, moved ${straightMove.toFixed(2)} ¢ (fs/(N+½): ${straightPred.toFixed(2)}) · bent partial 16 ${bentOff.toFixed(1)} ¢`);
  }
}

const bandsOf = (SR, recipe) => {
  const F0 = 110, out = [];
  for (let i = 0; i <= 97; i++) {
    const r = i / 100, sections = recipe === 'stiff' ? E.stiffSections(8, (1 + r) / (1 - r)) : E.logSections(8, 300, 12000, r, SR);
    const spec = E.specFor(SR, F0, { avg: true, rho: 0.999, sections }), dc = E.loopDcDelay(spec) - spec.L;
    if (SR / F0 - dc < 2) { out.push({ r, band: 'no room' }); continue; }
    const pred = E.predictPartials(spec, 24, SR), dev = E.deviations(pred), fp = E.fitPiano(pred);
    let mono = true; for (let k = 2; k < dev.length; k++) if (dev[k] < dev[k - 1] - 0.5) mono = false;
    out.push({ r, band: fp.spread < 1 ? 'pure' : !mono ? 'irregular' : fp.worst <= 0.1 * fp.spread ? 'piano' : 'past the law', B: fp.B, spread: fp.spread, worst: fp.worst });
  }
  const runs = []; for (const s of out) { const l = runs[runs.length - 1]; if (l && l.band === s.band) l.to = s.r; else runs.push({ band: s.band, from: s.r, to: s.r }); }
  return { out, runs };
};
for (const SR of [44100, 48000]) {
  console.log(`\n== the warp knob, fs ${SR} ==`);
  const page = bandsOf(SR, 'page'), stiff = bandsOf(SR, 'stiff');
  info(`the page's recipe: ${page.runs.map((b) => `${b.band} ${b.from.toFixed(2)}–${b.to.toFixed(2)}`).join(', ')}`);
  info(`the stiff string's recipe: ${stiff.runs.map((b) => `${b.band} ${b.from.toFixed(2)}–${b.to.toFixed(2)}`).join(', ')}`);
  const order = page.runs.map((b) => b.band).filter((b, i, a) => a.indexOf(b) === i);
  ok(order[0] === 'pure' && order.indexOf('piano') > 0 && order.indexOf('irregular') > order.indexOf('piano'), 'the page\'s recipe: one knob goes pure, then piano, then irregular', order.join(' → '));
  const pianoRun = page.runs.find((b) => b.band === 'piano'), irr = page.runs.find((b) => b.band === 'irregular');
  info(`piano band B from ${page.out.find((s) => s.band === 'piano').B.toExponential(1)} to ${[...page.out].reverse().find((s) => s.band === 'piano').B.toExponential(1)}; irregular from ${irr.from.toFixed(2)}`);
  ok(pianoRun.to - pianoRun.from > 0.4 && 0.97 - irr.from < 0.1, 'the piano band takes most of the knob; the irregular end only its last few hundredths', `piano ${pianoRun.from.toFixed(2)}–${pianoRun.to.toFixed(2)}, irregular ${irr.from.toFixed(2)}–0.97`);
  ok(!stiff.runs.some((b) => b.band === 'irregular'), 'the stiff string\'s recipe never turns irregular: it only stretches');
  for (const r of [0.5, 0.8]) {
    const Bs = [55, 110, 220, 440].map((f0) => E.fitPiano(E.predictPartials(E.specFor(SR, f0, { avg: true, rho: 0.999, sections: E.logSections(8, 300, 12000, r, SR) }), 12, SR)).B);
    info(`one stored curve across pitch, radius ${r}: fitted B over 12 partials at 55, 110, 220, 440 Hz: ${Bs.map((b) => b.toExponential(2)).join(', ')}`);
    if (r === 0.8) ok(Bs[3] / Bs[0] > 100, 'one stored curve stretches a high note far more than a low one', `B grows ${(Bs[3] / Bs[0]).toFixed(0)} times over three octaves`);
  }
  let worst = 0;
  for (const r of [0, 0.5, 0.8, 0.9, 0.95]) {
    const spec = E.specFor(SR, 110, { avg: true, rho: 0.999, sections: E.logSections(8, 300, 12000, r, SR) }), pred = E.predictPartials(spec, 24, SR);
    const y = E.runLoop(spec, E.noiseBurst(spec.L, 5), Math.round(2.5 * SR)), meas = E.measurePartials(y, 2 * spec.L, E.windowFor(spec, pred, SR), SR, pred, pred[0]);
    pred.forEach((f, i) => { worst = Math.max(worst, Math.abs(meas[i][0] - f)); });
  }
  ok(worst < 0.01, 'the string\'s partials measure where the round-trip condition puts them, radius 0 to 0.95', `worst ${worst.toFixed(4)} Hz over 24 partials`);
}

for (const SR of [44100, 48000]) {
  console.log(`\n== two knobs, one loop, fs ${SR} ==`);
  for (const f0 of [110, 440]) {
    const onePoleMatch = (b) => { const w8 = 2 * Math.PI * 8 * f0 / SR, t = E.magFir3(w8, 0.25 * b); let lo = 0, hi = 0.999; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (E.magOnePole(w8, m) > t) lo = m; else hi = m; } return (lo + hi) / 2; };
    const spec = (b, r, kind, L) => { const sp = E.specFor(SR, f0, { bright: { kind, v: kind === 'fir3' ? 0.25 * b : onePoleMatch(b) }, rho: 0.9995, sections: E.logSections(8, 300, 12000, r, SR) }); if (L) sp.L = L; return sp; };
    for (const kind of ['fir3', 'onepole']) {
      let first = 0, shape = 0;
      for (const r of [0, 0.5, 0.8]) {
        const L0 = spec(0, r, kind).L, ref = E.predictPartials(spec(0, r, kind, L0), 16, SR), refDev = E.deviations(ref);   // the bare delay held where the bright end set it
        for (let i = 1; i <= 20; i++) { const p = E.predictPartials(spec(i / 20, r, kind, L0), 16, SR), d = E.deviations(p); first = Math.max(first, Math.abs(E.cents(p[0], ref[0]))); shape = Math.max(shape, ...d.map((v, k) => Math.abs(v - refDev[k]))); }
      }
      if (kind === 'fir3') ok(first < 0.001 && shape < 0.001, `${f0} Hz, three taps: the magnitude knob moves no partial`, `pitch ${first.toFixed(5)} ¢, shape ${shape.toFixed(5)} ¢`);
      else info(`${f0} Hz, one-pole matched at partial 8, bare delay held: the magnitude knob moves the pitch up to ${first.toFixed(2)} ¢ and bends the partials up to ${shape.toFixed(2)} ¢ against the first`);
      if (kind === 'onepole' && f0 === 440) ok(first > 1, '440 Hz, one-pole: the magnitude knob also moves the pitch', `${first.toFixed(2)} ¢`);
    }
    let dMax = 0, dk4 = [];
    for (const b of [0.2, 0.6]) for (let k = 0; k < 8; k++) { const vals = []; for (let i = 0; i <= 18; i++) { const sp = spec(b, i / 20, 'fir3'), p = E.predictPartials(sp, 16, SR); vals.push(E.predictDecay(sp, p[k], SR)); } dMax = Math.max(dMax, Math.max(...vals) - Math.min(...vals)); if (k === 3 && b === 0.6) dk4 = [vals[0], vals[18]]; }
    info(`${f0} Hz: the phase knob, swept 0 to 0.9, moves a partial's decay by up to ${dMax.toFixed(1)} dB/s (partial 4 at darkness 0.6: ${dk4[0].toFixed(1)} → ${dk4[1].toFixed(1)} dB/s)`);
    if (f0 === 440) ok(dMax > 5, '440 Hz: the phase knob reaches decay', `${dMax.toFixed(1)} dB/s`);
    let dm = 0, pm = 0;
    for (const [b, r] of [[0.2, 0], [0.6, 0.5], [1, 0.8], [0.6, 0.9]]) {
      const sp = spec(b, r, 'fir3'), pred = E.predictPartials(sp, 16, SR), y = E.runLoop(sp, E.noiseBurst(sp.L, 9), Math.round(2.5 * SR));
      const meas = E.measurePartials(y, 2 * sp.L, E.windowFor(sp, pred, SR), SR, pred, pred[0]);
      pred.forEach((f, i) => { const pd = E.predictDecay(sp, f, SR); if (pd > -300) pm = Math.max(pm, Math.abs(meas[i][0] - f)); if (i < 8 && pd > -300) dm = Math.max(dm, Math.abs(E.measureDecay(y, SR, f, 0.05, 0.2, 8192) - pd) / Math.max(1, -pd)); });
    }
    ok(pm < 0.03 && dm < 0.03, `${f0} Hz: rendered strings land on the condition and die at the predicted rate`, `partials dying slower than 300 dB/s within ${pm.toFixed(4)} Hz; decay within ${(100 * dm).toFixed(2)}% (or 1 dB/s)`);
  }
}

// ---- the pages ----
const require = createRequire(path.join(HERE, '..', '_ops', 'stigmergy', 'app', 'package.json'));
let chromium;
try { ({ chromium } = require('playwright')); } catch (e) { ok(false, 'Playwright is installed for STIGMERGY', e.code || e.message); }
if (chromium) {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const expect = {
    'the table and the loop': [3, /a lowpass in it that nobody put there/, [
      ['section.step:not([hidden]) [data-reader="ap"]', /keeps every level[\s\S]*too small to hear[\s\S]*a dispersion curve in it that nobody put there/, 'allpass at 110 Hz: keeps level, takes a timing too small to hear'],
      ['section.step:not([hidden]) [data-f0="1760"]', /keeps every level[\s\S]*no longer small/, 'allpass at 1760 Hz: the timing is no longer small'],
      ['section.step:not([hidden]) [data-reader="lin"]', /a lowpass in it that nobody put there/, 'straight line at 1760 Hz: still a lowpass, some harmonics gone too fast to measure']]],
    'where the partials land': [3, /a lag that bends, not a lag that merely grows/],
    'the warp knob': [3, /pure, then piano, then irregular/, [
      ['section.step:not([hidden]) [data-recipe="stiff"]', /never turns irregular/, 'the stiff recipe reads as never irregular']]],
    'two knobs, one loop': [3, /that axis holds[\s\S]*also a small phase knob[\s\S]*in the sound, phase reaches decay/, [
      ['section.step:not([hidden]) [data-bright="onepole"]', /that axis holds[\s\S]*also a small phase knob[\s\S]*phase reaches decay/, 'the verdict reads every row, whichever row is drawn']]],
  };
  for (let n = 0; n < FILES.length; n++) {
    const name = WHATS[n]; console.log(`\n== ${name}: the page ==`);
    for (const width of [1130, 760]) {
      const p = await b.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      p.on('pageerror', (e) => errors.push(e.message));
      p.on('console', (m) => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)|Failed to load resource/.test(m.text())) errors.push(m.text()); });
      await p.route(/^https?:\/\//, (r) => r.abort());
      await p.goto(pathToFileURL(FILES[n]).href);
      await p.waitForTimeout(500);
      if (width === 1130) ok(await p.evaluate(() => actx === null), 'no AudioContext before a click');
      const count = await p.evaluate(() => steps.length);
      for (let i = 0; i < count; i++) {
        const shown = await p.evaluate(() => steps.map((s, k) => (s.hidden ? -1 : k)).filter((k) => k >= 0));
        if (width === 1130) ok(shown.length === 1 && shown[0] === i, `step ${i + 1}: one step showing, and it is this one`, String(shown));
        await p.click('section.step:not([hidden]) button.go');
        let on = false; for (let t = 0; t < 100 && !on; t++) { await p.waitForTimeout(50); on = await p.evaluate(() => !!src && actx && actx.state === 'running'); }
        const peak = await p.evaluate(() => { if (!src) return 0; const d = src.s.buffer.getChannelData(0); let m = 0; for (let j = 0; j < d.length; j += 5) m = Math.max(m, Math.abs(d[j])); return m; });
        // the identity's step 3 plays the difference first, and its difference is silence by design
        const silentByDesign = name === 'the table and the loop' && i === 2;
        if (width === 1130) ok(on && (silentByDesign ? peak === 0 : peak > 0.05), `step ${i + 1}: its first sound button makes ${silentByDesign ? 'the silence it promises' : 'sound'}`, `buffer peak ${peak.toFixed(3)}`);
        if (i === expect[name][0] && width === 1130) {
          const read = async () => (await p.evaluate(() => (document.getElementById('v4') || {}).textContent || '')).replace(/\s+/g, ' ');
          const v = await read();
          ok(expect[name][1].test(v), 'the test step reads as its numbers say', v.slice(0, 260));
          for (const [sel, re, what] of expect[name][2] || []) { await p.click(sel); await p.waitForTimeout(300); const t = await read(); ok(re.test(t), what, t.slice(0, 260)); }
        }
        if (i < count - 1) { await p.click('#next'); await p.waitForTimeout(150); if (width === 1130) ok(await p.evaluate(() => src === null), `step ${i + 1}: leaving it silences it`); }
      }
      const h = await p.evaluate(() => document.documentElement.scrollHeight);
      info(`${width} px wide: last step ${h} px tall`);
      ok(errors.length === 0, `${width} px: no page errors`, errors.slice(0, 3).join(' | '));
      await p.close();
    }
  }
  await b.close();
}
console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exit(fails ? 1 : 0);
