#!/usr/bin/env node
// title: Differential Equations — rich — check
// born: 2026-11-03
// links: [[Differential Equations]] (connects-to · rich-face-check) · the two pieces it reads: "three regimes", "one step at a time"
// forward_vector: I re-run the engine block of each made piece on Differential Equations' rich face, in Node, against the
//   claims the piece and its section make, and against closed forms the engines never use. Run me after any edit to a piece.
// usage: node "Differential Equations/Differential Equations — rich — check.mjs"
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
function engine(file, names) {
  const html = readFileSync(join(here, file), 'utf8'), m = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('no engine block in ' + file);
  return new Function(m[1] + '\nreturn {' + names.join(',') + '};')();
}
let fails = 0;
function yes(what, ok, got) { console.log((ok ? '  ok   ' : '  FAIL ') + what + (got !== undefined ? '  · ' + got : '')); if (!ok) fails++; }
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// ── three regimes ──
console.log('three regimes');
const A = engine('Differential Equations — rich — three regimes.html', ['firstOrder', 'secondOrder', 'run', 'stepMeasure', 'ringMeasure', 'cents', 'regime', 'TWO_PI']);
{ const sr = 48000, tau = 0.01, y = A.run(A.firstOrder(tau, 1 / sr), sr, 1, [0]);
  yes('step 1 · after τ the fade is 63.2% of the way (1 − 1/e)', near(y[Math.round(sr * tau) - 1], 1 - Math.exp(-1), 1e-9), (y[479] * 100).toFixed(3) + '%');
  yes('step 1 · after 3τ, 95.0%', near(y[Math.round(3 * sr * tau) - 1], 1 - Math.exp(-3), 1e-9), (y[1439] * 100).toFixed(3) + '%'); }
// the engine against the closed-form step response, which it never uses
function closed(t, z) { if (z < 1) { const wd = Math.sqrt(1 - z * z); return 1 - Math.exp(-z * t) * (Math.cos(wd * t) + z / wd * Math.sin(wd * t)); }
  if (z === 1) return 1 - Math.exp(-t) * (1 + t); const s = Math.sqrt(z * z - 1), r1 = -z + s, r2 = -z - s; return 1 + (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r1 - r2); }
for (const z of [0.05, 0.3, 0.78, 1, 2, 3]) { const m = A.stepMeasure(z); let worst = 0; for (let i = 0; i < m.y.length; i++) worst = Math.max(worst, Math.abs(m.y[i] - closed((i + 1) * m.h, z)));
  yes(`engine · ζ ${z}: the exact step matches the closed-form response`, worst < 1e-9, 'worst ' + worst.toExponential(1)); }
for (const z of [0.1, 0.5, 0.9, 0.99]) { const m = A.stepMeasure(z), want = Math.exp(-Math.PI * z / Math.sqrt(1 - z * z)); yes(`step 4 · ζ ${z} overshoots, by e^(−πζ/√(1 − ζ²))`, m.overshoot > 0 && near(m.overshoot, want, 1e-6 * want + 1e-12), (m.overshoot * 100).toPrecision(4) + '% against ' + (want * 100).toPrecision(4) + '%'); }
const crit = A.stepMeasure(1);
for (const z of [1, 1.5, 3]) { const m = A.stepMeasure(z); yes(`step 4 · ζ ${z} never overshoots`, m.overshoot <= 1e-9, m.overshoot.toExponential(1)); }
for (const z of [1.01, 1.2, 1.5, 2, 3]) { const m = A.stepMeasure(z); yes(`step 4 · ζ ${z} settles slower than critical`, m.settle > crit.settle, m.settle.toFixed(3) + ' > ' + crit.settle.toFixed(3)); }
yes('step 4 · critical settles within 2% after 5.83/ω (closed form 5.834)', near(crit.settle, 5.834, 0.005), crit.settle.toFixed(3));
{ let best = { st: Infinity }; for (let z = 0.6; z <= 0.95; z += 0.0025) { const m = A.stepMeasure(z); if (m.settle < best.st) best = { z, st: m.settle, os: m.overshoot }; }
  yes('step 4 · the fastest 2% settle is near ζ 0.78, overshooting about 2%', near(best.z, 0.78, 0.015) && near(best.os, 0.02, 0.002), 'ζ ' + best.z.toFixed(4) + ', ' + best.st.toFixed(3) + '/ω, ' + (best.os * 100).toFixed(2) + '%');
  yes('step 4 · …38% sooner than critical', near(1 - best.st / crit.settle, 0.38, 0.01), ((1 - best.st / crit.settle) * 100).toFixed(1) + '%'); }
for (const z of [0.01, 0.1, 0.3, 0.5]) { const r = A.ringMeasure(z);
  yes(`step 4 · struck at ζ ${z}, it rings at ω√(1 − ζ²), not ω`, near(r.fm, r.fd, 0.01) && (z < 0.05 || Math.abs(r.fm - 220) > 1), r.fm.toFixed(4) + ' Hz (' + A.cents(r.fm, 220).toFixed(2) + ' ¢)');
  yes(`step 4 · …and fades at ζω per second`, near(r.sm / r.s, 1, 1e-3), r.sm.toFixed(3) + ' /s against ' + r.s.toFixed(3)); }
{ const r = A.ringMeasure(0.3); yes('step 4 · at ζ 0.3 the ring is gone (−60 dB) in about 17 ms', near(6.9078 / r.sm, 0.01666, 0.0005), (6.9078 / r.sm * 1000).toFixed(2) + ' ms'); }

// ── one step at a time ──
console.log('one step at a time');
const B = engine('Differential Equations — rich — one step at a time.html', ['RULES', 'predict', 'bellPartials', 'cents', 'T60', 'sysA', 'stepRing', 'ringFreq', 'decayRate', 'joinSteps', 'firstEuler', 'firstExact', 'TWO_PI']);
{ const miss = r => { const n = Math.ceil(5 / r), s = [0], st = B.firstEuler(1, r); let w = 0; for (let k = 0; k < n; k++) w = Math.max(w, Math.abs(st(s, 1) - (1 - Math.exp(-(k + 1) * r)))); return w; };
  yes('step 1 · at a 48 kHz engine’s step on a 10 ms fade (0.002 τ), Euler misses by 0.037% of the way', near(miss(0.002), 0.00037, 0.00001), (miss(0.002) * 100).toFixed(4) + '%');
  const s = [0]; B.firstEuler(1, 1)(s, 1); yes('step 1 · at h = τ, Euler lands on the target in one step', s[0] === 1, s[0]);
  const s2 = [0], st2 = B.firstEuler(1, 2.2); for (let k = 0; k < 40; k++) st2(s2, 1); yes('step 1 · past 2τ the steps grow without end', Math.abs(s2[0] - 1) > 10, (s2[0] - 1).toExponential(1)); }
{ // step 2: forward Euler's bound, N > π/ζ
  const W2 = B.TWO_PI * 220, Z2 = 6.9078 / 2 / W2, A2 = B.sysA(W2, Z2), at = N => B.predict(B.RULES.euler.M(A2, 1 / (220 * N)), 1 / (220 * N)).sigma;
  yes('step 2 · forward Euler holds the 2 s ring only above π/ζ ≈ 1257 steps per cycle', at(1200) < 0 && at(1320) > 0, 'σ ' + at(1200).toFixed(3) + ' at 1200, ' + at(1320).toFixed(3) + ' at 1320');
  const t60at = N => { const h = 1 / (220 * N), q = B.predict(B.RULES.euler.M(A2, h), h); return B.T60(q.sigma); };
  yes('step 2 · …but stopping the growth is not holding the ring: about 3,700 s at 1,258 a cycle, near 2 s only at ~13,900', near(t60at(1258), 3700, 300) && t60at(13900) <= 2.2 && t60at(13000) > 2.2, t60at(1258).toFixed(0) + ' s, ' + t60at(13900).toFixed(3) + ' s');
  // the joined sound carries the rule's pitch and nothing else
  for (const rule of ['backward', 'symplectic', 'trapezoid']) { const N = 23, h = 1 / (220 * N), M = B.RULES[rule].M(A2, h), p = B.predict(M, h), r = B.stepRing(M, Math.ceil(2.4 * 220 * N), [0, W2, 1], 3), y = B.joinSteps(r.y, 220 * N, 48000, 48000 * 2.4);
    const fm = B.ringFreq(y.subarray(2400, 96000), 48000); yes(`step 3 · ${rule} at 23 per cycle: the joined sound rings at the rule’s own pitch`, near(B.cents(fm, p.f), 0, 0.1), B.cents(fm, p.f).toFixed(3) + ' ¢ off the matrix'); } }
{ // step 4: every rule, the bar at 440 Hz and 48 kHz; the sound against the matrix, and the matrix against closed forms
  const sr = 48000, h = 1 / sr, out = {};
  for (const k of Object.keys(B.RULES)) out[k] = B.bellPartials(440, sr, k, 3.5);
  for (const k of Object.keys(B.RULES)) for (const p of out[k]) { if (p.blew >= 0 || !Number.isFinite(p.fm) || !(p.sm > 0)) continue;
    if (!(B.T60(p.sm) > 0.004)) continue; // a ring shorter than a few ms is read by the matrix, not by ear
    yes(`step 4 · ${k} · ${p.f.toFixed(0)} Hz: the sound matches the rule’s matrix`, near(B.cents(p.fm, p.pr.f), 0, 0.05) && near(p.sm / p.pr.sigma, 1, 0.01), B.cents(p.fm, p.pr.f).toFixed(3) + ' ¢, ring ×' + (p.sm / p.pr.sigma).toFixed(4)); }
  for (const p of out.exact) yes(`step 4 · exact · ${p.f.toFixed(0)} Hz: no error`, near(B.cents(p.fm, p.fx), 0, 0.001) && near(B.T60(p.sm), B.T60(p.sx), 1e-3 * B.T60(p.sx)), B.cents(p.fm, p.fx).toFixed(5) + ' ¢, ' + B.T60(p.sm).toFixed(4) + ' s');
  yes('step 4 · forward Euler runs away on every partial', out.euler.every(p => p.blew >= 0 && p.pr.sigma < 0), out.euler.map(p => (p.blew / sr * 1000).toFixed(2) + ' ms').join(', '));
  const top = i => ({ x: B.TWO_PI * 440 * [1, 2.756, 5.404, 8.933, 13.344][i] * h });
  const t = top(4).x, se = B.cents(out.symplectic[4].pr.f, out.symplectic[4].fx), tr = B.cents(out.trapezoid[4].pr.f, out.trapezoid[4].fx);
  yes('step 4 · semi-implicit Euler sharpens 5871 Hz by +45.3 ¢ (closed form, undamped: 2·asin(ωh/2))', near(se, 1200 * Math.log2(2 * Math.asin(t / 2) / t), 0.3) && near(se, 45.3, 0.1), se.toFixed(2) + ' ¢');
  yes('step 4 · …and keeps its ring', near(B.T60(out.symplectic[4].pr.sigma), 0.7, 0.001), B.T60(out.symplectic[4].pr.sigma).toFixed(4) + ' s');
  yes('step 4 · the trapezoid flattens it by −80.2 ¢ (closed form, undamped: 2·atan(ωh/2))', near(tr, 1200 * Math.log2(2 * Math.atan(t / 2) / t), 0.3) && near(tr, -80.2, 0.1), tr.toFixed(2) + ' ¢');
  yes('step 4 · backward Euler rings the 440 Hz partial about 85 ms, not 3 s', near(B.T60(out.backward[0].pr.sigma), 0.0845, 0.002), (B.T60(out.backward[0].pr.sigma) * 1000).toFixed(1) + ' ms');
  yes('step 4 · Runge–Kutta 4 rings 5871 Hz about 94 ms, not 700', near(B.T60(out.rk4[4].pr.sigma), 0.094, 0.002), (B.T60(out.rk4[4].pr.sigma) * 1000).toFixed(1) + ' ms');
  const x = B.TWO_PI * 440 * h, fe = Math.log(Math.hypot(1, x)) / h;
  yes('step 4 · forward Euler’s growth on 440 Hz is ln√(1 + (ωh)²)/h ≈ 79.5 /s, less the friction', near(-out.euler[0].pr.sigma, fe - 6.9078 / 3, 0.5), (-out.euler[0].pr.sigma).toFixed(2) + ' /s'); }

console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exit(fails ? 1 : 0);
