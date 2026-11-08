#!/usr/bin/env node
// title: The Curve Is the Material — rich-face checks
// born: 2026-11-03
// links: [[The Curve Is the Material]] · [[The Curve Is the Material — rich.json]]
// forward_vector: I re-run every claim the two-morphs piece makes, on the piece's own engine (pulled out of the
//   file), check that the ruler it uses can tell a string from a non-string, check the sound it plays against the
//   curve it draws, and then walk the piece to its last step in headless Chromium and read the verdict it shows.
// usage: node "The Curve Is the Material/workshop/rich-face-checks.mjs"   (from the palace root)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url)), bundle = join(here, '..');
const file = join(bundle, 'The Curve Is the Material — rich — two morphs.html');
const src = readFileSync(file, 'utf8');
let fails = 0; const ok = (c, msg) => { console.log((c ? '  ok   ' : '  FAIL ') + msg); if (!c) fails++; };
const engine = src.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const E = new Function(engine + '; return { partialHz, stringCents, readB, curve, morphNumber, blendCurves, nearestString, distanceAlong, worstOf, toneFreqs, toneAmps, renderTone };')();
const fc = c => c.toFixed(2) + ' ¢';

console.log('the family and the ruler');
{ // the drawn curve is the formula in cents
  const ok1 = [1, 7, 24, 64].every(n => [0.0002, 0.001, 0.003, 0.1].every(B => Math.abs(1200 * Math.log2(E.partialHz(n, 110, B) / (n * 110)) - E.stringCents(n, B)) < 1e-9));
  ok(ok1, 'c_n = 600·log2(1 + B·n²) is the formula f_n = n·f0·√(1 + B·n²) in cents above n·f0');
  ok([1, 5, 24].every(n => Math.abs(E.readB(n, E.stringCents(n, 0.0023)) - 0.0023) < 1e-15), 'reading B back off any partial of a string returns its B');
  const s = E.nearestString(E.curve(0.0017, 24));
  ok(s.err < 0.01 && Math.abs(s.B / 0.0017 - 1) < 1e-3, `the ruler finds a real string: B = 0.0017 → nearest B ${s.B.toExponential(4)}, off by ${s.err.toExponential(2)} ¢`);
  const shifted = E.curve(0.0017, 24).map(v => v + 5), s2 = E.nearestString(shifted);
  ok(s2.err < 0.01 && Math.abs(s2.off - 5) < 0.01, `with f0 free it sees a string a few cents sharp as a string: offset ${s2.off.toFixed(3)} ¢, error ${s2.err.toExponential(2)} ¢`);
  // the ruler can lose: a real non-string reads far off
  let seed = 7; const scat = E.curve(0.002, 24).map((v, i) => { seed = (seed * 16807) % 2147483647; return Math.max(0, v + (seed / 2147483647 - 0.5) * 4 * (i + 1)); });
  const s3 = E.nearestString(scat); ok(s3.err > 10, `step 2's scatter is not a string: nearest off by ${fc(s3.err)}`);
  // a brute-force check of the minimax: no B on a fine grid beats the fit
  const blend = E.blendCurves(0.001, 0.003, 0.5, 24), f = E.nearestString(blend);
  let bruteBest = Infinity; for (let k = 0; k <= 20000; k++) { const B = 0.0012 + 0.0012 * k / 20000; let lo = Infinity, hi = -Infinity; blend.forEach((v, i) => { const r = v - E.stringCents(i + 1, B); lo = Math.min(lo, r); hi = Math.max(hi, r); }); bruteBest = Math.min(bruteBest, (hi - lo) / 2); }
  ok(Math.abs(f.err - bruteBest) < 0.01, `the fit is the minimum: ${fc(f.err)} against a 20 001-point brute force ${fc(bruteBest)}`);
}

console.log('The Morphing Quality Distinction — the claim');
{ const BA = 0.001, BB = 0.003;
  // the number's morph is one B at every t
  let worstSpread = 0; for (let k = 0; k <= 100; k++) { const c = E.morphNumber(BA, BB, k / 100, 24), b = c.map((v, i) => E.readB(i + 1, v)); worstSpread = Math.max(worstSpread, Math.max(...b) / Math.min(...b) - 1); }
  ok(worstSpread < 1e-9, `morph the number: every partial reports the same B at all 101 points of t (worst relative spread ${worstSpread.toExponential(1)})`);
  const pn = E.worstOf(E.distanceAlong(E.morphNumber, BA, BB, 24));
  ok(pn.err < 0.01, `morph the number: nearest-string distance at most ${pn.err.toExponential(2)} ¢ across t`);
  // the blend: partial 1 reports the average, the top reports less, sliding toward the geometric mean
  const c = E.blendCurves(BA, BB, 0.5, 24), b1 = E.readB(1, c[0]), b24 = E.readB(24, c[23]), b64 = E.readB(64, E.blendCurves(BA, BB, 0.5, 64)[63]);
  ok(Math.abs(b1 - 0.002) < 1e-6 && b24 < b1 && b64 < b24 && b64 > Math.sqrt(BA * BB), `blend at t = 0.5: partial 1 reports ${b1.toFixed(6)} (average 0.002), partial 24 ${b24.toFixed(6)}, partial 64 ${b64.toFixed(6)} (geometric mean ${Math.sqrt(BA * BB).toFixed(6)})`);
  // the ends of the blend are the strings themselves
  ok(E.nearestString(E.blendCurves(BA, BB, 0, 24)).err < 0.01 && E.nearestString(E.blendCurves(BA, BB, 1, 24)).err < 0.01, 'the blend starts and ends on the two strings');
  // the sizes the offer quotes
  const rows = [[0.001, 0.003, 16], [0.001, 0.003, 24], [0.001, 0.003, 32], [0.001, 0.003, 64], [0.0002, 0.004, 24], [0.0002, 0.004, 32], [0.0002, 0.004, 64], [0.001, 0.1, 24]];
  for (const [A, B, n] of rows) { const w = E.worstOf(E.distanceAlong(E.blendCurves, A, B, n, 100)), st = Math.max(...E.blendCurves(A, B, w.t, n));
    console.log(`         ${A} → ${B}, ${n} partials: worst ${fc(w.err)} at t = ${w.t.toFixed(2)} (nearest B ${w.B.toExponential(3)}, f0 ${w.off >= 0 ? '+' : ''}${w.off.toFixed(2)} ¢), stretch carried ${st.toFixed(0)} ¢, ${(100 * w.err / st).toFixed(2)}%`); }
  const w24 = E.worstOf(E.distanceAlong(E.blendCurves, BA, BB, 24, 100)), w64 = E.worstOf(E.distanceAlong(E.blendCurves, BA, BB, 64, 100)), wg = E.worstOf(E.distanceAlong(E.blendCurves, 0.0002, 0.004, 24, 100));
  ok(w24.err > 0.5 && w24.err < 10, `the section's pair at 24 partials leaves the family, but by a little: ${fc(w24.err)}`);
  ok(w64.err > w24.err && wg.err > w24.err, `the gap grows with partials (${fc(w64.err)} at 64) and with distance between the strings (${fc(wg.err)} for 0.0002 → 0.004 at 24)`);
}

console.log('the sound is the curve');
{ const sr = 48000, c = E.blendCurves(0.001, 0.003, 0.5, 24), buf = E.renderTone(c, 110, { seconds: 1.8 }), fr = E.toneFreqs(c, 110);
  // a fine DTFT scan near three partials: the strongest component lands where the curve says
  const peakNear = (f, span) => { const n = 32768, s0 = 20000; let best = 0, bf = f; for (let k = -150; k <= 150; k++) { const q = f + span * k / 150, w = 2 * Math.PI * q / sr; let re = 0, im = 0;
    for (let i = 0; i < n; i++) { const h = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (n - 1)), v = buf[s0 + i] * h; re += v * Math.cos(w * i); im -= v * Math.sin(w * i); } const m = re * re + im * im; if (m > best) { best = m; bf = q; } } return bf; };
  for (const n of [2, 12, 24]) { const got = peakNear(fr[n - 1], 3); ok(Math.abs(got - fr[n - 1]) < 0.05, `partial ${n}: the buffer peaks at ${got.toFixed(2)} Hz, the curve says ${fr[n - 1].toFixed(2)} Hz`); }
  const hi = E.toneAmps(E.toneFreqs(E.curve(0.1, 64), 110)); ok(hi.filter(a => a === 0).length > 0 && E.toneFreqs(E.curve(0.1, 64), 110).every((f, i) => f < 18000 || hi[i] === 0), 'partials above 18 kHz are silent, so the hyper-stiff preset never aliases');
}

console.log('the walk, in headless Chromium');
try {
  const require = createRequire(join(process.cwd(), '_ops/stigmergy/app/package.json'));
  const { chromium } = require('playwright');
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1130, height: 900 } }), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(pathToFileURL(file).href); await p.waitForTimeout(400);
  const rail = await p.$$eval('#rail button', bs => bs.map(x => x.textContent));
  ok(rail.length === 5 && /flat line/.test(rail[0]) && /blend a string/.test(rail[4]), 'five steps, opening on the flat line and ending on the test: ' + rail.join(' | '));
  ok(await p.$eval('.step.on h3', h => h.textContent) === 'The flat line', 'it opens on step 1');
  ok(await p.evaluate(() => typeof SND !== 'undefined' && SND.ctx === null), 'no audio context before a click');
  for (let i = 0; i < 4; i++) await p.click('#next');
  await p.waitForTimeout(800);
  const v = await p.$eval('#s5v', e => e.textContent), rows = await p.$$eval('#s5t tr', r => r.length);
  ok(/leaves the family/.test(v) && rows === 6, 'the last step shows the verdict and its table: ' + v.slice(0, 160) + '…');
  await p.click('#s5pre button:nth-child(2)'); await p.waitForTimeout(400);
  ok(/0\.00020/.test(await p.$eval('#s5Av', e => e.textContent)), 'the presets move the sliders');
  ok(errs.length === 0, 'no console errors' + (errs.length ? ': ' + errs.join(' · ') : ''));
  await b.close();
} catch (e) { ok(false, 'headless walk: ' + e.message); }

console.log(fails ? `\n${fails} FAILED` : '\nall checks pass');
process.exit(fails ? 1 : 0);
