#!/usr/bin/env node
// title: Mathieu Equation — rich-face checks
// born: 2026-11-03
// links: [[Mathieu Equation]] · [[Mathieu Equation — rich.json]]
// forward_vector: I re-run every claim the rich face's three pieces make, on the pieces' own engine
//   (pulled out of each file, and required to be the same in all three), then walk each piece to its
//   last step in headless Chromium and read the verdict it shows. Run me after any edit to a piece.
// usage: node "Mathieu Equation/workshop/rich-face-checks.mjs"   (from the palace root)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url)), bundle = join(here, '..');
const files = ['breathing spring', 'strutt walk', 'two tongues'].map(w => join(bundle, `Mathieu Equation — rich — ${w}.html`));
let fails = 0; const ok = (c, msg) => { console.log((c ? '  ok   ' : '  FAIL ') + msg); if (!c) fails++; };

// 1 · one engine
const engines = files.map(f => readFileSync(f, 'utf8').match(/<script id="engine">([\s\S]*?)<\/script>/)[1]);
console.log('one engine');
ok(engines.every(e => e === engines[0]), 'the engine block is byte-identical in all three pieces');
const E = new Function(engines[0] + '; return { floquet, tongue, threshold, leftEdge, render, toneLevel, envelope, bloomTime };')();

// 2 · The Strutt diagram
console.log('The Strutt diagram');
for (const q of [0.15, 0.3]) {
  const T = [1, 2, 3].map(n => { const t = E.tongue(n, q), h = E.tongue(n, q / 2); return { ...t, root: (4 * h.center - t.center) / 3 }; });
  ok(T.every(t => Math.abs(t.root - t.n * t.n) < 0.01), `q=${q}: roots run back to q=0 land at ${T.map(t => t.root.toFixed(4)).join(', ')} (n² within 0.01)`);
  ok(T[0].width > T[1].width && T[1].width > T[2].width, `q=${q}: widths ${T.map(t => t.width.toExponential(2)).join(' > ')}`);
  ok(T[0].peak > T[1].peak && T[1].peak > T[2].peak, `q=${q}: growth per pump cycle ${T.map(t => t.peak.toExponential(2)).join(' > ')} (the first strongest)`);
}
{ const t1 = E.tongue(1, 0.3), t2 = E.tongue(2, 0.3);
  ok(Math.abs(t1.lo - (1 - 0.3 - 0.09 / 8 + 0.027 / 64)) < 2e-3 && Math.abs(t1.hi - (1 + 0.3 - 0.09 / 8 - 0.027 / 64)) < 2e-3, `q=0.3 tongue 1 edges ${t1.lo.toFixed(4)}, ${t1.hi.toFixed(4)} match 1 ∓ q − q²/8 ± q³/64`);
  ok(Math.abs(t2.lo - (4 - 0.09 / 12)) < 1e-3 && Math.abs(t2.hi - (4 + 5 * 0.09 / 12)) < 1e-3, `q=0.3 tongue 2 edges ${t2.lo.toFixed(4)}, ${t2.hi.toFixed(4)} match 4 − q²/12, 4 + 5q²/12`); }
{ // Abramowitz & Stegun table 20.1, q = 1
  const AS = { b1: -0.11024882, a1: 1.85910807, b2: 3.91702477, a2: 4.37130098, b3: 9.04773926, a3: 9.07836885, a0: -0.45513860 };
  const t = [1, 2, 3].map(n => E.tongue(n, 1)), a0 = E.leftEdge(1);
  const got = { b1: t[0].lo, a1: t[0].hi, b2: t[1].lo, a2: t[1].hi, b3: t[2].lo, a3: t[2].hi, a0 };
  ok(Object.keys(AS).every(k => Math.abs(got[k] - AS[k]) < 2e-4), 'q=1 edges agree with the tabulated characteristic values: ' + Object.keys(AS).map(k => `${k} ${got[k].toFixed(4)}/${AS[k].toFixed(4)}`).join(' '));
}
ok([0, 0.2, 0.4, 0.6, 0.8].every(q => E.floquet(2.2, q).growth < 1e-9), 'a = 2.2 is bounded for every q the outside step offers (0 to 0.8)');
ok([0.01, 0.1, 0.3, 0.8].every(q => E.floquet(1, q).growth > 1e-9), 'a = 1 grows for every q > 0 the inside step offers');
ok(E.floquet(-0.3, 0).growth > 0.1 && E.floquet(-0.1, 0.6).growth < 1e-9, 'left of the tongues: a = −0.3, q = 0 grows; a = −0.1, q = 0.6 is held bounded by the pump (Kapitza)');
{ const sr = 48000, rms = b => Math.sqrt(b.reduce((s, v) => s + v * v, 0) / b.length);
  const out = E.render({ a: 2.2, q: 0.3, fBase: 110, sr, seconds: 2.5, noise: 1e-5 }), inn = E.render({ a: 1, q: 0.3, fBase: 110, sr, seconds: 2.5, noise: 1e-5 });
  const dO = 20 * Math.log10(rms(out.subarray(sr))), dI = 20 * Math.log10(rms(inn.subarray(sr)));
  ok(dO < -60 && dI > -25, `heard: from the same whisper, outside ends near ${dO.toFixed(0)} dB, inside near ${dI.toFixed(0)} dB`); }

// 3 · What the equation says — a ∼ (2ω₀/Ω)²
console.log('What the equation says');
for (const eps of [0.02, 0.1, 0.2]) {
  const und = r => { const a = 4 / (r * r); return E.floquet(a, a * eps, 0).growth * r; };
  const peaks = [1, 2, 3].map(n => { let a = n * n, t; for (let k = 0; k < 6; k++) { t = E.tongue(n, a * eps, 0, 600); a = t.peakA; }
    let A = 2 / Math.sqrt(t.hi), B = 2 / Math.sqrt(t.lo); const gr = (Math.sqrt(5) - 1) / 2;
    for (let k = 0; k < 60; k++) { const c = B - gr * (B - A), d = A + gr * (B - A); if (und(c) > und(d)) B = d; else A = c; } return (A + B) / 2; });
  // the piece finds each peak as a fixed point in the equation's own coordinates; confirm it is a true maximum of growth along Ω
  const isMax = peaks.every(r => und(r) > 0 && und(r) >= und(r * (1 + 1e-4)) && und(r) >= und(r * (1 - 1e-4)));
  ok(isMax && peaks.every((r, i) => { const n = i + 1, q = n * n * eps; return Math.abs(4 / (r * r) - n * n) < 0.25 * q * q + 0.01; }), `ε=${eps}: growth peaks at Ω/ω₀ = ${peaks.map(r => r.toFixed(4)).join(', ')}, so (2ω₀/Ω)² = ${peaks.map(r => (4 / r / r).toFixed(3)).join(', ')} (each a true maximum, within q²/4 of n²)`);
  let stray = 0; for (let i = 0; i <= 600; i++) { const r = 0.58 * Math.pow(2.5 / 0.58, i / 600), a = 4 / r / r; const near = [1, 2, 3].some(n => a > n * n - 0.45 * (2 * n - 1) && a < n * n + 0.45 * (2 * n + 1)); if (!near && und(r) > 1e-6) stray++; }
  ok(stray === 0, `ε=${eps}: no growth between the tongues on a 600-point sweep from Ω/ω₀ = 0.58 to 2.5`);
}

// 4 · Open Questions
console.log('Open Questions');
{ const sr = 48000, F0 = 220;
  for (const n of [1, 2]) { const t = E.tongue(n, 0.6, 0, 500), b = E.render({ a: t.peakA, q: 0.6, fBase: F0 / n, sr, seconds: 3, noise: 1e-5 }), h = b.length >> 1;
    const at = f => 20 * Math.log10(E.toneLevel(b, f, sr, h) + 1e-12), pump = 2 * F0 / n;
    ok((n === 1 ? t.sign < 0 : t.sign > 0) && at(220) > -35 && at(220) > at(110) + 20, `tongue ${n}: multiplier ${t.sign < 0 ? 'negative' : 'positive'}, grown tone at 220 Hz (${at(220).toFixed(0)} dB) with the pump at ${pump} Hz, ${n === 1 ? 'half the pump' : 'in unison'}`); }
  const thr = g => [1, 2, 3].map(n => E.threshold(n, g, 3, 18, 400));
  const t1 = thr(0.02), t2 = thr(0.1);
  ok(t1.every((q, i) => q > 0 && t2[i] > q), `damping lifts every tongue: γ=0.02 → ${t1.map(q => q.toFixed(3)).join(', ')}; γ=0.1 → ${t2.map(q => Number.isFinite(q) ? q.toFixed(3) : '>3').join(', ')}`);
  ok(Math.abs(t1[0] - 0.02) < 0.002 && Math.abs(t1[1] - Math.sqrt(8 * 0.02)) < 0.02, `tongue 1 opens at q ≈ γ (${t1[0].toFixed(4)}), tongue 2 at q ≈ √(8γ) (${t1[1].toFixed(4)} vs ${Math.sqrt(0.16).toFixed(4)})`);
  const bt = (n, q) => { const t = E.tongue(n, q, 0, 500); return E.bloomTime(E.render({ a: t.peakA, q, fBase: F0 / n, sr, seconds: 2, noise: 1e-5 }), sr, -30); };
  ok(bt(2, 0.38) > 1 && bt(2, 0.43) <= 1 && bt(3, 1.8) > 1 && bt(3, 1.9) <= 1, 'the side-by-side verdict: tongue 2 brings the whisper to −30 dB inside 1 s from q ≈ 0.41, tongue 3 from q ≈ 1.85');
}

// 5 · each piece walked to its last step in Chromium
console.log('in Chromium');
const require = createRequire(join(process.cwd(), '_ops/stigmergy/app/package.json'));
let chromium; try { ({ chromium } = require('playwright')); } catch { console.log('  skip  Playwright not found (run from the palace root)'); }
if (chromium) {
  const br = await chromium.launch(); 
  for (const f of files) {
    const pg = await br.newPage({ viewport: { width: 1130, height: 900 } }), errs = [];
    pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errs.push(m.text()); });
    await pg.addInitScript(() => { window.__ctx = 0; const A = window.AudioContext; window.AudioContext = function (...a) { window.__ctx++; return new A(...a); }; });
    await pg.goto(pathToFileURL(f).href); await pg.waitForTimeout(300);
    const steps = await pg.$$eval('.step', s => s.length);
    for (let i = 1; i < steps; i++) { await pg.click('#next'); await pg.waitForTimeout(250); }
    const name = f.split('— rich — ')[1];
    let v = ''; for (let k = 0; k < 60 && !v; k++) { await pg.waitForTimeout(500); v = await pg.$$eval('.step.on .verdict', a => a.map(x => x.textContent).join(' | ')); if (/measuring/.test(await pg.$$eval('.busy', a => a.map(x => x.textContent).join('')))) v = ''; }
    const ctx = await pg.evaluate(() => window.__ctx);
    ok(errs.length === 0, `${name}: no script errors${errs.length ? ' — ' + errs.join('; ') : ''}`);
    ok(ctx === 0, `${name}: walked to step ${steps} with no audio context made before a click`);
    console.log('         verdict: ' + v.slice(0, 600));
    await pg.close();
  }
  await br.close();
}
console.log(fails ? `\n${fails} failed` : '\nall passed'); process.exit(fails ? 1 : 0);
