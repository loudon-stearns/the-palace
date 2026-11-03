#!/usr/bin/env node
// title: Piano String Inharmonicity — rich-face checks
// born: 2026-11-03
// links: [[Piano String Inharmonicity]] · [[Piano String Inharmonicity — rich.json]]
// forward_vector: I re-run every claim the rich face's three pieces make, on the pieces' own engine (pulled out of
//   each file, and required to be the same in all three), check the sound they play against the numbers they print,
//   then walk each piece to its last step in headless Chromium and read the verdict it shows. Run me after any edit.
// usage: node "Projects/Piano String Inharmonicity/workshop/rich-face-checks.mjs"   (from the palace root)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const here = dirname(fileURLToPath(import.meta.url)), bundle = join(here, '..');
const files = ['stretch', 'bend or fret', 'click through the string'].map(w => join(bundle, `Piano String Inharmonicity — rich — ${w}.html`));
let fails = 0; const ok = (c, msg) => { console.log((c ? '  ok   ' : '  FAIL ') + msg); if (!c) fails++; };
const block = (f, id) => readFileSync(f, 'utf8').match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`))[1];

console.log('one engine');
const engines = files.map(f => block(f, 'engine')), shared = files.map(f => block(f, 'shared'));
ok(engines.every(e => e === engines[0]), 'the engine block is byte-identical in all three pieces');
ok(shared.every(e => e === shared[0]), 'the shared walk-and-sound block is byte-identical in all three pieces');
const E = new Function(engines[0] + '; return { partialHz, cents, stretchHz, stretchApprox, stretchExponent, slopeBetween, stringB, tuneString, raiseBy, STEEL, pluck, pair, modes, irRender, bankRun, convolve, inputSignal, errDb, lti };')();
// a fine DTFT magnitude scan: the frequency of the strongest component near f, from a buffer
const peakNear = (buf, sr, f, span, s0, n) => { let best = 0, bf = f; for (let k = -200; k <= 200; k++) { const fr = f + span * k / 200, w = 2 * Math.PI * fr / sr; let re = 0, im = 0;
  for (let i = 0; i < n; i++) { const h = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (n - 1)), v = buf[s0 + i] * h; re += v * Math.cos(w * i); im -= v * Math.sin(w * i); } const m = re * re + im * im; if (m > best) { best = m; bf = fr; } } return bf; };

console.log('The Physics — stretch');
{ const f0 = 220;
  const c1 = E.cents(E.partialHz(1, f0, 0.001), f0), c1max = E.cents(E.partialHz(1, f0, 0.002), f0);
  ok(c1 > 0.8 && c1 < 0.9 && c1max < 2, `the first partial moves: +${c1.toFixed(3)} ¢ at B = 0.001, +${c1max.toFixed(3)} ¢ at the slider's top (f₁ = f₀·√(1+B), so f₀ is not the sounding fundamental)`);
  const ex = E.stretchHz(12, f0, 0.001); ok(Math.round(ex) === 184, `the text's example: n = 12, B = 0.001 → ${ex.toFixed(2)} Hz sharp (text: 184)`);
  const sl = [[2, 4], [4, 8], [8, 16], [16, 32], [32, 64]].map(([a, b]) => E.slopeBetween(a, b, f0, 0.001));
  ok(sl[0] > 2.99 && sl[1] > 2.98 && sl[4] < 2.6, `B = 0.001: slope between doublings ${sl.map(s => s.toFixed(3)).join(', ')} — a cube while B·n² is small, bending toward 2 past n ≈ 1/√B = 32`);
  ok([2, 8, 20, 50].every(n => Math.abs(E.stretchExponent(n, 0.001) - (Math.log(E.stretchHz(n * 1.0001, f0, 0.001) / E.stretchHz(n / 1.0001, f0, 0.001)) / Math.log(1.0001 ** 2))) < 1e-4), 'the closed-form exponent matches a finite difference on the formula');
  ok(Math.abs(E.stretchExponent(1e4, 0.001) - 2) < 0.02, `far past 1/√B the exponent is ${E.stretchExponent(1e4, 0.001).toFixed(4)} (→ 2, since f_n → √B·f₀·n²)`);
  const o12 = 100 * (E.stretchApprox(12, f0, 0.001) / ex - 1), o32 = 100 * (E.stretchApprox(32, f0, 0.001) / E.stretchHz(32, f0, 0.001) - 1);
  ok(Math.abs(o12 - 3.48) < 0.01 && Math.abs(o32 - 21.13) < 0.02, `B·n³·f₀/2 runs high: ${o12.toFixed(2)}% at n = 12, ${o32.toFixed(2)}% at n = 32 (B = 0.001)`);
  const b3 = E.stretchHz(3, f0, 0.0004), b6 = E.stretchHz(6, f0, 0.0004);
  ok(Math.abs(b6 / b3 - 8) < 0.05, `step 3's default: partial 3 beats ${b3.toFixed(3)}/s, partial 6 ${b6.toFixed(3)}/s, ratio ${(b6 / b3).toFixed(3)} (8 for a cube)`);
  { const S = readFileSync(files[0], 'utf8'), m = S.match(/function countable\(B\) \{[^\n]*\}/); const countable = new Function('stretchHz', 'F0', m[0] + '; return countable;')(E.stretchHz, f0);
    const lists = [0.0001, 0.0004, 0.001, 0.002, 0.004].map(B => [B, countable(B)]);
    ok(lists.every(([B, ns]) => ns.length >= 2 && ns.every(n => { const b = E.stretchHz(n, f0, B); return b >= 0.4 && b <= 16; })), 'step 4 plays only countable beats, at least two partials a doubling apart: ' + lists.map(([B, ns]) => `B ${B} → ${ns.join(',')} (${ns.map(n => E.stretchHz(n, f0, B).toFixed(2)).join(', ')}/s)`).join('; ')); }
  // the sound: the pair really beats at the printed rate — envelope period from the rendered buffer
  const sr = 48000, p = E.pair(3 * f0, E.partialHz(3, f0, 0.001), { seconds: 4 }), env = []; const w = 480;
  for (let i = 0; i + w <= p.length; i += w) { let z = 0; for (let j = i; j < i + w; j++) z += p[j] * p[j]; env.push(Math.sqrt(z / w)); }
  const mins = []; for (let i = 2; i < env.length - 2; i++) if (env[i] < env[i - 1] && env[i] <= env[i + 1] && env[i] < 0.03) mins.push(i * w / sr);
  const rate = mins.length > 1 ? (mins.length - 1) / (mins[mins.length - 1] - mins[0]) : 0;
  ok(Math.abs(rate - E.stretchHz(3, f0, 0.001)) < 0.1, `heard: partial 3 and its ghost at B = 0.001 beat ${rate.toFixed(2)}/s in the rendered buffer (printed ${E.stretchHz(3, f0, 0.001).toFixed(2)})`);
}

console.log('String Bending and Timbre Change — bend or fret');
{ const s = E.tuneString(0.432e-3, 0.648, 196, E.STEEL.E, E.STEEL.rho), f1 = s.f0 * Math.sqrt(1 + s.B);
  ok(Math.abs(f1 - 196) < 1e-9 && Math.abs(s.B - 1.0826e-4) < 1e-7 && Math.abs(s.T - 74.23) < 0.01, `the G string: T = ${s.T.toFixed(2)} N, B = ${s.B.toExponential(4)}, first partial ${f1.toFixed(6)} Hz`);
  ok(Math.abs(E.stringB(E.STEEL.E, 0.432e-3, s.T, 0.648) - s.B) < 1e-15, 'B is the section\'s coefficient formula, π³·E·d⁴/(64·T·L²)');
  for (const c of [100, 200, 300]) { const r = E.raiseBy(s, c), b = r.bend, f = r.fret, fb = b.f0 * Math.sqrt(1 + b.B), ff = f.f0 * Math.sqrt(1 + f.B);
    const sc = (x, n) => E.cents(E.partialHz(n, x.f0, x.B), n * x.f0 * Math.sqrt(1 + x.B));
    ok(Math.abs(fb - r.target) < 1e-9 && Math.abs(ff - r.target) < 1e-9 && Math.abs(f.B / b.B - Math.pow(2, 4 * c / 1200)) < 1e-6 * Math.pow(2, 4 * c / 1200) * 100,
      `${c} ¢: bent and fretted both sound ${fb.toFixed(4)} Hz; B ${b.B.toExponential(3)} against ${f.B.toExponential(3)}, ratio ${(f.B / b.B).toFixed(4)} (r⁴ = ${Math.pow(2, 4 * c / 1200).toFixed(4)}); partial 10 ${sc(b, 10).toFixed(2)} against ${sc(f, 10).toFixed(2)} ¢, partial 16 ${sc(b, 16).toFixed(2)} against ${sc(f, 16).toFixed(2)} ¢`);
    ok(Math.abs(b.f0 - s.f0 * Math.sqrt(b.k)) < 1e-9 && Math.abs(b.B - s.B / b.k) < 1e-18, `${c} ¢: the bend is the section's f₀ → √k·f₀, B → B/k with k = ${b.k.toFixed(5)}`); }
  for (const m of [2, 5, 9]) { const from = E.raiseBy(s, 100 * m).fret, st = { T: s.T, f0: from.f0, B: from.B }, r = E.raiseBy(st, 200);
    ok(Math.abs(r.fret.B / r.bend.B / Math.pow(2, 800 / 1200) - 1) < 1e-4, `bending a whole tone from fret ${m} against fretting at ${m + 2}: ratio ${(r.fret.B / r.bend.B).toFixed(5)} (r⁴ = ${Math.pow(2, 800 / 1200).toFixed(5)}; the exact pitch match moves it by about 1 part in 10⁵) — the same from any fret`); }
  // the sound: the pluck's partial 10 and 16 sit where the table says, bent against fretted
  const r = E.raiseBy(s, 200), sr = 48000, n = 48000;
  for (const [name, x] of [['bent', r.bend], ['fretted', r.fret]]) { const buf = E.pluck({ f0: x.f0, B: x.B, sr });
    const got = [10, 16].map(k => peakNear(buf, sr, E.partialHz(k, x.f0, x.B), 3, 0, n)), want = [10, 16].map(k => E.partialHz(k, x.f0, x.B));
    ok(got.every((g, i) => Math.abs(g - want[i]) < 0.05), `heard: the ${name} pluck's partials 10 and 16 measure ${got.map(g => g.toFixed(2)).join(', ')} Hz (formula ${want.map(g => g.toFixed(2)).join(', ')})`); }
}

console.log('Why This Is Linear Time-Invariant — click through the string');
{ const sr = 48000, f0 = 110;
  for (const B of [0, 0.0008, 0.002]) { const r = E.lti({ f0, B, sr });
    ok(r.conv < -200 && r.scale < -200 && r.add < -200 && r.shift < -200, `B = ${B}, no drive: resonators vs convolution ${r.conv.toFixed(1)} dB; twice as loud ${r.scale}; two at once ${r.add.toFixed(1)} dB; delayed ${r.shift} — all hold`); }
  for (const d of [0.0005, 0.005]) { const r = E.lti({ f0, B: 0.0008, drive: d, sr });
    ok(r.conv > -120 && r.scale > -120 && r.add > -120 && r.shift === -Infinity, `B = 0.0008, drive ${d}: convolution ${r.conv.toFixed(1)} dB, twice as loud ${r.scale.toFixed(1)} dB, two at once ${r.add.toFixed(1)} dB break; delayed ${r.shift} holds (nonlinear, still time-invariant)`); }
  { const r = E.lti({ f0, B: 0, drive: 0.005, sr }); ok(r.conv > -120 && r.scale > -120, `B = 0, drive 0.005: the checks break with no dispersion at all (${r.scale.toFixed(1)} dB) — the drive, not B, breaks them`); }
  // dispersion seen in time: in the first return, the high partials arrive before the low ones
  const T = sr / f0, at = (M, lo, hi) => { const h = E.irRender(M, sr, Math.ceil(1.6 * T)); let pk = 0, ti = 0; for (let i = Math.round(0.4 * T); i < Math.round(1.5 * T); i++) if (Math.abs(h[i]) > pk) { pk = Math.abs(h[i]); ti = i; } return ti / T; };
  for (const B of [0, 0.0008]) { const M = E.modes({ f0, B, sr }), hi = at(M.filter(m => m.n >= 25)), lo = at(M.filter(m => m.n <= 4));
    ok(B === 0 ? Math.abs(hi - 1) < 0.01 && Math.abs(lo - 1) < 0.02 : hi < lo - 0.1, `B = ${B}: first return of partials 25–40 peaks at ${hi.toFixed(3)} periods, partials 1–4 at ${lo.toFixed(3)}${B ? ' — the high ones arrive early' : ' — together'}`); }
  // the FFT convolution against a direct sum, on a short case
  { const x = new Float64Array(300), h = new Float64Array(500); for (let i = 0; i < 300; i++) x[i] = Math.sin(i * 0.37) * (i % 7); for (let i = 0; i < 500; i++) h[i] = Math.cos(i * 0.11) * Math.exp(-i / 90);
    const y = E.convolve(x, h, 799), d = new Float64Array(799); for (let i = 0; i < 300; i++) for (let j = 0; j < 500; j++) d[i + j] += x[i] * h[j];
    ok(E.errDb(d, y) < -250, `the FFT convolution matches a direct sum to ${E.errDb(d, y).toFixed(1)} dB`); }
}

console.log('the pieces, walked headless');
const require = createRequire(join(process.cwd(), 'package.json'));
let chromium; try { ({ chromium } = require('playwright')); } catch { try { ({ chromium } = createRequire(join(process.cwd(), '_ops/stigmergy/app/package.json'))('playwright')); } catch { console.log('  skip  Playwright not found (run from the palace root)'); } }
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
    ok(v.length > 0 && (!name.startsWith('click') || /as they must/.test(v) && /check of the code/.test(v) && !/whole of this string/.test(v)), `${name}: the last step shows its verdict${name.startsWith('click') ? ', saying the no-drive checks hold by construction' : ''}`); console.log('         verdict: ' + v.slice(0, 700));
    if (name.startsWith('click')) { await pg.fill('#s4D', '0.005'); await pg.dispatchEvent('#s4D', 'input'); let v2 = ''; for (let k = 0; k < 40; k++) { await pg.waitForTimeout(500); if (!/measuring/.test(await pg.textContent('#s4busy'))) { v2 = await pg.textContent('#s4v'); if (/drive at 0.005/.test(v2)) break; } }
      ok(/three checks break/.test(v2), 'click through the string: with drive at 0.005 the verdict says three checks break'); console.log('         verdict: ' + v2.slice(0, 400)); }
    await pg.screenshot({ path: join(process.env.SHOTS || '/tmp', `psi-${name.replace(/\W+/g, '-')}.png`), fullPage: true }).catch(() => {});
    await pg.close();
  }
  await br.close();
}
console.log(fails ? `${fails} failed` : 'all passed'); process.exit(fails ? 1 : 0);
