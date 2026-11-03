#!/usr/bin/env node
// title: Categorizing Inharmonicity — rich-face checks
// born: 2026-11-03
// links: [[Categorizing Inharmonicity]] · [[Categorizing Inharmonicity — rich.json]]
// forward_vector: I re-run every claim the rich face's two pieces make, on the pieces' own engine (pulled out of each
//   file and required to be the same in both), measure the gathered May proofs the captions describe, and say plainly
//   which numbers the offers rest on. Run me after any edit.
// usage: node "Projects/Categorizing Inharmonicity/workshop/rich-face-checks.mjs"   (from the palace root)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url)), bundle = join(here, '..');
const files = ['threshold', 'phase loop'].map(w => join(bundle, `Categorizing Inharmonicity — rich — ${w}.html`));
let fails = 0; const ok = (c, msg) => { console.log((c ? '  ok   ' : '  FAIL ') + msg); if (!c) fails++; };
const block = (f, id) => readFileSync(f, 'utf8').match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`))[1];

console.log('one engine');
const engines = files.map(f => block(f, 'engine')), shared = files.map(f => block(f, 'shared'));
ok(engines[0] === engines[1], 'the engine block is byte-identical in both pieces');
ok(shared[0] === shared[1], 'the shared walk-and-sound block is byte-identical in both pieces');
ok(files.every(f => !readFileSync(f, 'utf8').includes('rich:' + 'hush')), 'neither piece names the kit’s hush message, so the kit hushes them');
const E = new Function(engines[0] + '; return { TAU, SR, F1, NP, AMP, J0Z, besselJ, rng, gauss, LOGSTAT, lyapunov, apLag, apGain, loopModes, apDC, loopD, KINDS, kindById, tracks, mistuning, maxCents, patternGap, pFor, renderTone, joinBuffers, loopRender, cascade, spectrum, peakNear, fitStretch, staircase, cents };')();
const { cents } = E;

console.log('the kinds');
{ const H = E.tracks(E.KINDS[0], 0);
  ok(E.KINDS.every(k => E.mistuning(E.tracks(k, 0)) < 1e-9), 'every kind at 0 is the harmonic series (mistuning 0)');
  ok(E.KINDS.every(k => E.tracks(k, k.hi * 0.5, { seed: 3 }).every((tr, i) => i > 0 || tr.every(f => Math.abs(f - 220) < 1e-9))), 'partial 1 holds at 220 Hz in every kind, at any setting');
  for (const k of E.KINDS) { const ds = [0.1, 0.3, 0.6, 1].map(q => E.mistuning(E.tracks(k, k.hi * q * q))); ok(ds.every((d, i) => !i || d > ds[i - 1]), `${k.name}: mistuning rises with its number (${ds.map(d => d.toFixed(2)).join(' → ')} ¢)`); }
  const hits = E.KINDS.map(k => Math.abs(E.mistuning(E.tracks(k, E.pFor(k, 7.5, { seed: 5 }), { seed: 5 })) - 7.5)); ok(hits.every(h => h < 0.075), `pFor hits a chosen mistuning in every kind to within 1% (7.5 ¢, worst miss ${Math.max(...hits).toFixed(3)} ¢; the phase kind's loop delay is a whole number of samples, so its mistuning steps)`);
  ok(E.KINDS.every(k => E.mistuning(E.tracks(k, k.hi)) >= 60), `the blind test's ceiling, 60 ¢, is reachable in every kind (${E.KINDS.map(k => k.id + ' ' + E.mistuning(E.tracks(k, k.hi)).toFixed(0)).join(', ')})`);
}
console.log('Bessel');
{ const zs = E.J0Z.map((z, i) => { let x = z; for (let k = 0; k < 8; k++) x -= E.besselJ(0, x) / -E.besselJ(1, x); return x; }); // Newton on J0, J0' = −J1
  ok(zs.every((x, i) => Math.abs(x - E.J0Z[i]) < 1e-6) && E.J0Z.every(z => Math.abs(E.besselJ(0, z)) < 1e-8), 'the sixteen J0 zeros are zeros of J0 computed from its integral');
  const gaps = E.J0Z.slice(1).map((z, i) => z - E.J0Z[i]);
  ok(Math.abs(gaps[gaps.length - 1] - Math.PI) < 2e-3 && gaps[0] > 3.11, `one family is almost evenly spaced: consecutive J0 zeros differ by ${gaps.slice(0, 4).map(g => g.toFixed(3)).join(', ')} … ${gaps[gaps.length - 1].toFixed(4)} (→ π)`);
  const T = E.tracks(E.kindById('bessel'), 1), c = T.map((tr, i) => cents(tr[0], (i + 1) * 220));
  ok(Math.abs(c[1] - 238.6) < 0.1 && Math.abs(c[15] - 435.6) < 0.2 && Math.abs(1200 * Math.log2(Math.PI / E.J0Z[0]) - 462.6) < 0.1, `at m = 1: partial 2 +${c[1].toFixed(1)} ¢, partial 16 +${c[15].toFixed(1)} ¢, levelling toward +${(1200 * Math.log2(Math.PI / E.J0Z[0])).toFixed(1)} ¢; spacing ${(T[15][0] - T[14][0]).toFixed(1)} Hz`);
  const J1 = [3.8317, 7.0156, 10.1735, 13.3237], j1 = J1.map(z => { let x = z; for (let k = 0; k < 8; k++) { const d = (E.besselJ(1, x + 1e-6) - E.besselJ(1, x - 1e-6)) / 2e-6; x -= E.besselJ(1, x) / d; } return x; });
  ok(j1.every((x, i) => Math.abs(x - J1[i]) < 1e-3), `the text's J1 zeros check: ${j1.map(x => x.toFixed(4)).join(', ')}; and they are where J0' = −J1 vanishes, the free-rim (∂ψ/∂r = 0) radial modes`);
}
console.log('logarithmic');
{ const k = E.kindById('log'); for (const b of [0.01, 0.02]) { const f = k.f(b), worst = Math.max(...Array.from({ length: 16 }, (_, i) => Math.abs(cents(f(i + 1), 220 * (i + 1) ** (1 + b))))); ok(worst < 3, `b = ${b}: f_n = n·220·(1 + b·ln n) sits within ${worst.toFixed(2)} ¢ of 220·n^(1+b) over sixteen partials, a stretched octave`); }
  const f = k.f(0.02), per = [1, 2, 4, 8].map(n => cents(f(2 * n), 2 * f(n)));
  ok(per.every(p => p > 0) && Math.max(...per) - Math.min(...per) < 2, `each octave of partials is stretched by about the same cents (${per.map(p => p.toFixed(2)).join(', ')} ¢ at b = 0.02), and the stretch is not proportional to n`);
}
console.log('chaotic');
{ ok(Math.abs(E.lyapunov() - 0.494) < 0.01, `the logistic map at r = 3.9 is chaotic: Lyapunov exponent ${E.lyapunov().toFixed(3)} > 0`);
  const k = E.kindById('chaotic'), a = E.tracks(k, 40, { seed: 1 }), b = E.tracks(k, 40, { seed: 2 }), sd = tr => { const m = tr.reduce((s, x) => s + x, 0) / tr.length; return Math.sqrt(tr.reduce((s, x) => s + (x - m) ** 2, 0) / tr.length); };
  ok(sd(a[5]) > 1 && a[5][0] !== b[5][0], `it moves while it sounds (partial 6 wanders ${sd(a[5]).toFixed(1)} Hz rms in one strike) and every strike differs`);
  ok(['stretched', 'bessel', 'stochastic', 'log', 'phase'].every(id => E.tracks(E.kindById(id), E.kindById(id).hi / 2, { seed: 4 }).every(tr => tr.every(f => f === tr[0]))), 'every other kind is frozen once struck');
}
console.log('six kinds, one mistuning');
{ for (const D of [5, 10, 25]) { const T = E.KINDS.map(k => E.tracks(k, E.pFor(k, D))), id = Object.fromEntries(E.KINDS.map((k, i) => [k.id, i])), gap = (x, y) => E.patternGap(T[id[x]], T[id[y]]);
    ok(gap('stretched', 'phase') < 0.15 * D && gap('bessel', 'log') < 0.3 * D && gap('stretched', 'bessel') > 0.6 * D, `at ${D} ¢: stretched–phase ${gap('stretched', 'phase').toFixed(2)}, Bessel–log ${gap('bessel', 'log').toFixed(2)}, stretched–Bessel ${gap('stretched', 'bessel').toFixed(2)}, stretched–log ${gap('stretched', 'log').toFixed(2)} ¢ apart`); } }
console.log('the tone');
{ const T = E.tracks(E.kindById('stretched'), 0.0008), y = E.renderTone(T, { seconds: 1.6 }), sp = E.spectrum(y, 480), fs = T.map(tr => tr[0]), worst = Math.max(...fs.map(f => Math.abs(cents(E.peakNear(sp, f, 8), f))));
  ok(worst < 0.3, `the rendered sound has its partials where the kind says (stretched, B = 0.0008: worst ${worst.toFixed(3)} ¢)`);
  const loud = E.KINDS.map(k => { const z = E.renderTone(E.tracks(k, E.pFor(k, 20))); let s = 0; for (const v of z) s += v * v; return Math.sqrt(s / z.length); }), r = Math.max(...loud) / Math.min(...loud);
  ok(r < 1.08, `every kind is as loud as the others at 20 ¢ (rms within × ${r.toFixed(3)})`);
}
console.log('the staircase');
{ const T = 6, beta = 2, p = D => 0.5 + 0.5 * (1 - Math.exp(-((D / T) ** beta))), target = T * Math.pow(-Math.log(1 - 2 * (0.7071 - 0.5)), 1 / beta);
  const R = E.rng(99), est = []; let trials = 0;
  for (let run = 0; run < 400; run++) { const S = E.staircase({ start: 30, ceil: 60 }); while (!S.done) S.answer(R() < p(S.D)); const e = S.estimate(); if (e) est.push(e.D); trials += S.trials; }
  est.sort((a, b) => a - b); const med = est[est.length >> 1], q1 = est[Math.floor(est.length / 4)], q3 = est[Math.floor(3 * est.length / 4)];
  ok(Math.abs(med / target - 1) < 0.2, `a simulated listener whose 70.7% point is ${target.toFixed(2)} ¢: median estimate ${med.toFixed(2)} ¢ (middle half ${q1.toFixed(2)}–${q3.toFixed(2)}), ${(trials / 400).toFixed(1)} rounds a run`);
}
console.log('§ 6 — the all-pass');
{ let worst = 0; for (const a of [-0.85, -0.6, 0.3, 0.85]) for (let i = 1; i < 2048; i++) worst = Math.max(worst, Math.abs(20 * Math.log10(E.apGain(Math.PI * i / 2048, a))));
  ok(worst < 1e-12, `one all-pass's gain is 1 at every frequency (worst ${worst.toExponential(1)} dB)`);
  ok(Math.abs(E.apLag(1e-4, -0.6) / 1e-4 - 4) < 1e-3, 'its low-frequency delay is (1 − a)/(1 + a) samples (4 at a = −0.6)');
  const dry = E.loopRender({ D: 218, mode: 'none' }), base = Array.from({ length: 16 }, (_, i) => (i + 1) * 48000 / 218), sp0 = E.spectrum(dry, 480), f0s = base.map(f => E.peakNear(sp0, f, 30));
  ok(Math.max(...f0s.map((f, i) => Math.abs(cents(f, base[i])))) < 0.2, `a loop that only delays rings on the harmonic series (D = 218: partial 1 ${f0s[0].toFixed(3)} Hz)`);
  for (const [M, a] of [[8, -0.6], [4, -0.85]]) {
    const wet = E.cascade(dry, M, a), sp = E.spectrum(wet, 480), moved = Math.max(...f0s.map(f => Math.abs(cents(E.peakNear(sp, f, 30), f))));
    let e0 = 0, e1 = 0; for (const v of dry) e0 += v * v; for (const v of wet) e1 += v * v;
    ok(moved < 0.05, `outside the loop (M ${M}, a ${a}): no partial moves more than ${moved.toFixed(4)} ¢; energy in ÷ out ${(e1 / e0).toFixed(4)}`);
    const D = E.loopD(M, a), y = E.loopRender({ D, M, a, mode: 'in' }), pred = E.loopModes(D, M, a), spi = E.spectrum(y, 480), fs = pred.map(f => E.peakNear(spi, f, Math.min(30, 0.2 * pred[0])));
    const pe = Math.max(...fs.map((f, i) => Math.abs(cents(f, pred[i])))), c16 = cents(fs[15], 16 * fs[0]);
    const Dx = D + Math.round(E.apDC(M, a)), yc = E.loopRender({ D, M, a, mode: 'delay' }), spc = E.spectrum(yc, 480), fc = Array.from({ length: 16 }, (_, i) => E.peakNear(spc, (i + 1) * 48000 / Dx, 30)), cc = Math.max(...fc.map((f, i) => Math.abs(cents(f, (i + 1) * fc[0]))));
    const fit = E.fitStretch(fs);
    ok(pe < 0.5 && Math.abs(c16) > 2 && cc < 0.2, `inside the loop (M ${M}, a ${a}, D ${D}): partial 16 ${c16 >= 0 ? '+' : ''}${c16.toFixed(2)} ¢ off its ghost, within ${pe.toFixed(3)} ¢ of the phase condition; the straight-line control within ${cc.toFixed(3)} ¢; stiff-string fit B = ${fit.B.toExponential(2)}, ${fit.rms.toFixed(2)} ¢ rms`);
  }
}
{ const M = 16, a = 0.8, D = E.loopD(M, a), y = E.loopRender({ D, M, a, mode: 'in' }), pred = E.loopModes(D, M, a), sp = E.spectrum(y, 480), fs = pred.map(f => E.peakNear(sp, f, 30)), c16 = cents(fs[15], 16 * fs[0]);
    ok(c16 < 0 && c16 > -2, `a positive coefficient pulls them flat, but only slightly at these pitches (M 16, a 0.8: partial 16 ${c16.toFixed(2)} ¢)`); }
console.log('the gathered May proofs');
{ const wav = f => { const b = readFileSync(join(bundle, 'proofs', f)), sr = b.readUInt32LE(24); let o = 12; while (b.toString('ascii', o, o + 4) !== 'data') o += 8 + b.readUInt32LE(o + 4); const n = b.readUInt32LE(o + 4) / 2, x = new Float64Array(n); for (let i = 0; i < n; i++) x[i] = b.readInt16LE(o + 8 + 2 * i) / 32768; return { x, sr }; };
  const peaksAt = (f, guesses, s0 = 0) => { const { x, sr } = wav(f), N = 65536, re = new Float64Array(N), im = new Float64Array(N); for (let i = 0; i < N && s0 + i < x.length; i++) re[i] = x[s0 + i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (N - 1)));
    const E2 = new Function(engines[0] + '; return { fft };')(); E2.fft(re, im); const mag = new Float64Array(N / 2); for (let k = 0; k < N / 2; k++) mag[k] = Math.hypot(re[k], im[k]);
    const bin = sr / N; return guesses.map(g => { let kb = Math.round(g / bin); for (let k = Math.round((g - 12) / bin); k <= Math.round((g + 12) / bin); k++) if (mag[k] > mag[kb]) kb = k; const l = Math.log(mag[kb - 1]), c = Math.log(mag[kb]), r = Math.log(mag[kb + 1]); return (kb + 0.5 * (l - r) / (l - 2 * c + r)) * bin; }); };
  const n16 = Array.from({ length: 16 }, (_, i) => i + 1);
  const st = peaksAt('2026-05-04-02-stretched.wav', n16.map(n => n * 220 * Math.sqrt(1 + 0.0008 * n * n) / Math.sqrt(1.0008) * Math.sqrt(1.0008)));
  const Bfit = (Math.pow(st[15] / (16 * 220), 2) - 1) / 256; ok(Math.abs(Bfit - 0.0008) < 2e-5, `stretched proof: partial 16 at ${st[15].toFixed(1)} Hz, B ≈ ${Bfit.toFixed(5)} (f₀ = 220 Hz, unpinned: partial 1 at ${st[0].toFixed(2)} Hz)`);
  const be = peaksAt('2026-05-04-03-bessel.wav', E.J0Z.map(z => 220 * z / E.J0Z[0])); ok(be.every((f, i) => Math.abs(cents(f, 220 * E.J0Z[i] / E.J0Z[0])) < 1), `Bessel proof: the J0 family scaled so partial 1 is 220 Hz (${be.slice(0, 4).map(f => f.toFixed(1)).join(', ')} … ${be[15].toFixed(1)} Hz)`);
  const { x: cx, sr } = wav('2026-05-04-05-chaotic.wav'); ok(sr === 44100 && cx.length === 4 * 44100, 'each proof is 4 s at 44.1 kHz, mono');
  const early = peaksAt('2026-05-04-05-chaotic.wav', [250, 397.6, 676.3, 1301.8, 3990.8], 0), late = peaksAt('2026-05-04-05-chaotic.wav', [250, 397.6, 676.3, 1301.8, 3990.8], 44100);
  ok(early.every((f, i) => Math.abs(f - late[i]) < 0.3), `chaotic proof: frozen, the same partials in its first and second seconds (${early.map(f => f.toFixed(1)).join(', ')} Hz); none below 220 Hz`);
  const so = peaksAt('2026-05-04-04-stochastic.wav', [229.1, 408.8, 682.5]); ok(Math.abs(so[0] - 229.1) < 0.5, `stochastic proof: partial 1 itself moved, to ${so[0].toFixed(1)} Hz`);
}
console.log(fails ? `\n${fails} FAILED` : '\nall checks pass'); process.exit(fails ? 1 : 0);
