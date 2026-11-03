// Harmonicity and Inharmonicity — rich — check.mjs
// born: 2026-11-03 · checks [[Harmonicity and Inharmonicity]]' two made rich-face pieces,
//   "Harmonicity and Inharmonicity — rich — frustration.html" and "… — rich — six against forty.html"
// forward_vector: I re-run, headless, every number the two walks show or say: that their core is the model the
//   2026-10-17 proofs ran (it reproduces edgemap.json), that the worklet runs that core and nothing else, and that
//   each step's sentence about the model is true of it — the reach of one voice, the six that agree, the sag, the
//   peel from the top, snap against fray, and how much sooner forty partials tear than six. What anyone hears I
//   cannot check.
//
//   node "Harmonicity and Inharmonicity/Harmonicity and Inharmonicity — rich — check.mjs"
//
// It pulls <script id="frust-core"> and <script id="frust-worklet"> out of both pieces, runs the core and the
// worklet's process() in Node, and compares against the proofs' own record (edgemap.json) and against the numbers
// the pieces print. PASS/FAIL per claim; exits 1 on any FAIL. Reads only; writes nothing. About a minute.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const PIECES = ['Harmonicity and Inharmonicity — rich — frustration.html', 'Harmonicity and Inharmonicity — rich — six against forty.html'];
const html = PIECES.map((f) => readFileSync(join(HERE, f), 'utf8'));
const block = (h, id) => {
  const m = h.match(new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)</script>`));
  if (!m) throw new Error(`no <script id="${id}">`);
  return m[1];
};

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const fmt = (x) => x.toExponential(3);

// ── 0 · both pieces carry the same core and worklet ──────────────────────────────
check('0 · one core, one worklet, in both pieces',
  block(html[0], 'frust-core') === block(html[1], 'frust-core') && block(html[0], 'frust-worklet') === block(html[1], 'frust-worklet'),
  'byte-equal');

const SR = 48000;
const sandbox = { Math, Float64Array, Float32Array, sampleRate: SR, registered: null };
sandbox.AudioWorkletProcessor = class { constructor() { this.port = { onmessage: null, sent: [], postMessage(m) { this.sent.push(m); } }; } };
sandbox.registerProcessor = (name, cls) => { sandbox.registered = cls; };
vm.createContext(sandbox);
vm.runInContext(block(html[0], 'frust-core') + '\n' + block(html[0], 'frust-worklet') + '\nthis.FRUST = FRUST;', sandbox);
const F = sandbox.FRUST, Proc = sandbox.registered;

// ── 1 · the core is the proofs' model: it reproduces edgemap.json at K = 6 Hz ─────
{
  const map = JSON.parse(readFileSync(join(HERE, 'proofs/2026-10-17-frustration-sweeps/edgemap.json'), 'utf8'));
  for (const [N, key] of [[6, 'N6_unpinned'], [40, 'N40_unpinned']]) {
    const row = map[key], ki = row.K.indexOf(6), want = row.wobble_hz[ki];
    const got = row.B.map((B) => F.hold(N, B, 6, { rate: 22050 }).wobble);
    // held cells should agree closely; torn cells are chaotic, and the voices' starting phases here are not numpy's,
    // so there only the first tear is compared, to within one grid step (a quarter decade)
    let worst = 0, n = 0;
    for (let i = 0; i < got.length; i++) { if (want[i] < 0.4) { worst = Math.max(worst, Math.abs(got[i] - want[i])); n++; } }
    const ftW = want.findIndex((x) => x > 0.5), ftG = got.findIndex((x) => x > 0.5);
    check(`1 · ${N} partials: the proofs' edge map, reproduced`, worst < 0.1 && Math.abs(ftW - ftG) <= 1,
      `worst gap ${worst.toFixed(3)} Hz over the ${n} held cells; first tear at map cell ${ftW} (B ${fmt(row.B[ftW])}, wobble ${want[ftW].toFixed(2)}), here cell ${ftG} (B ${fmt(row.B[ftG])}); at the map's cell, here ${got[ftW].toFixed(2)} Hz`);
  }
}

// ── 2 · the worklet runs the core and nothing else ─────────────────────────────
function runWorklet(opts, seconds, msgs) {
  const p = new Proc({ processorOptions: opts });
  for (const m of msgs || []) p.port.onmessage({ data: m });
  const n = Math.round(seconds * SR), L = new Float32Array(128), R = new Float32Array(128);
  let peak = 0;
  for (let o = 0; o < n; o += 128) { p.process([], [[L, R]]); for (let i = 0; i < 128; i++) peak = Math.max(peak, Math.abs(L[i])); }
  return { p, peak, reports: p.port.sent };
}
{
  const w = runWorklet({ N: 6, B: 4e-4, K: 6, det: 0 }, 2);
  const t = F.tone(6, 7); F.tune(t, 0, 0); t.K = 6; F.setStretch(t, 4e-4);
  const hop = Math.round(SR / 100); let acc = 0, k = 0; const means = [];
  for (let q = 0; q < Math.round(2 * SR / 128); q++) {
    F.setStretch(t, 4e-4); F.setGate(t);
    for (let i = 0; i < 128; i++) { acc += F.step(t, 1 / SR); if (++k >= hop) { means.push(acc / k); acc = 0; k = 0; } }
    F.wrap(t);
  }
  let worst = 0; for (let i = 0; i < means.length; i++) worst = Math.max(worst, Math.abs(means[i] - w.reports[i].f));
  check('2 · the worklet’s reported pitch is the core’s, sample for sample', worst < 1e-9 && w.reports.length === means.length,
    `${means.length} reports, worst gap ${worst.toExponential(1)} Hz`);
  const big = runWorklet({ N: 40, B: 1e-4, K: 6, det: 1 }, 2);
  // a voice locked exactly on its harmonic sits at a phase gap of −0: the sine table must not read past its end
  const still = runWorklet({ N: 6, B: 0, K: 6, det: 0 }, 10);
  const bad = still.reports.findIndex((m) => !Number.isFinite(m.f));
  check('2 · ten seconds on the exact harmonics stay finite', bad < 0, bad < 0 ? `${still.reports.length} reports, last pitch ${still.reports.at(-1).f.toFixed(4)} Hz` : `first NaN at report ${bad}`);
  check('2 · the output stays in range, 6 and 40 partials', w.peak < 1 && big.peak < 1 && w.peak > 0.05, `peaks ${w.peak.toFixed(3)} and ${big.peak.toFixed(3)} before the 0.5 master and the compressor`);
}

// one held tone, at a fixed rate: pitch, each voice's tug (Hz) and slip (cycles/s), over the last half
function held(N, o) {
  const rate = o.rate || 11025, secs = o.secs || 6, t = F.tone(N, 7);
  F.tune(t, o.det ?? 1, o.off1 || 0); t.K = o.K ?? 6; if (o.mask) for (let i = 0; i < N; i++) t.mask[i] = o.mask[i]; F.setStretch(t, o.B || 0);
  const dt = 1 / rate, steps = secs * rate, half = steps / 2, tug = new Float64Array(N); let c = 0, fs = 0, d0 = null;
  const ptug = new Float64Array(N); let pc = 0;
  for (let i = 0; i < steps; i++) {
    if (i % 64 === 0) F.setGate(t);
    const inPush = o.push && i >= half && i < half + 0.35 * rate;
    t.f0 = inPush ? 114 : 110;
    const f = F.step(t, dt);
    if (i === half) d0 = Float64Array.from(t.dd);
    if (inPush) { for (let j = 0; j < N; j++) ptug[j] += t.back * t.K * t.r[j] * t.s[j]; pc++; }
    if (i >= half && !o.push) { fs += f; c++; for (let j = 0; j < N; j++) tug[j] += t.back * t.K * t.r[j] * t.s[j]; }
    if (i % 4096 === 0) F.wrap(t);
  }
  return { mean: fs / c, tug: Array.from(tug, (x) => x / c), ptug: Array.from(ptug, (x) => x / pc), slip: Array.from(t.dd, (x, j) => (x - d0[j]) / (secs / 2)) };
}
const r2 = (a) => a.map((x) => x.toFixed(2)).join(' ');

// ── 3 · the frustration walk, step by step ─────────────────────────────────────
{
  const one = [1, 0, 0, 0, 0, 0];
  const a = held(6, { det: 0, off1: 3, mask: one }), b = held(6, { det: 0, off1: 11.8, mask: one }), c = held(6, { det: 0, off1: 12.2, mask: one });
  check('3 · step 2: one voice 3 Hz up meets the tone halfway', Math.abs(a.mean - 111.5) < 0.02 && Math.abs(a.slip[0]) < 0.05, `pitch ${a.mean.toFixed(3)} Hz, slip ${a.slip[0].toFixed(3)}`);
  check('3 · step 2: the reach is twice the coupling, 12 Hz', Math.abs(b.slip[0]) < 0.05 && Math.abs(c.slip[0]) > 1, `11.8 Hz slips ${b.slip[0].toFixed(2)}/s, 12.2 Hz slips ${c.slip[0].toFixed(2)}/s`);
  const h0 = held(6, { det: 0 }), p0 = held(6, { det: 0, push: true });
  const deltas = p0.ptug.map((x, j) => x - h0.tug[j]);
  check('3 · step 3: on the harmonics every voice rests at zero', Math.max(...h0.tug.map(Math.abs)) < 0.01 && Math.abs(h0.mean - 110) < 0.01, `tugs ${r2(h0.tug)}, pitch ${h0.mean.toFixed(3)}`);
  check('3 · step 3: a push sharp and all six pull down together', deltas.every((x) => x < 0), `tug changes ${r2(deltas)}, sum ${deltas.reduce((s, x) => s + x).toFixed(2)} Hz`);
  const h1 = held(6, { det: 1 });
  const mx = Math.max(...h1.tug.map(Math.abs)), sum1 = h1.tug.reduce((s, x) => s + x);
  check('3 · step 3: with the sweeps’ voices the bars sit apart and cancel', mx > 8 && mx < 10 && Math.abs(sum1) < 0.15, `tugs ${r2(h1.tug)}, largest ${mx.toFixed(2)}, sum ${sum1.toFixed(3)}`);
  const s4 = held(6, { det: 0, B: 4e-4 });
  check('3 · step 4: low voices pull up, the top one down hard; the tone sags about 0.5 Hz and holds',
    s4.tug.slice(0, 4).every((x) => x > 0) && s4.tug[5] < -5 && s4.mean > 109.3 && s4.mean < 109.7 && s4.slip.every((x) => Math.abs(x) < 0.05),
    `tugs ${r2(s4.tug)}, pitch ${s4.mean.toFixed(3)} Hz`);
  const s4d = held(6, { det: 1, B: 4e-4 });
  check('3 · step 4: the five scenes’ scene 2 (B 0.0004) sat about 0.5 Hz flat', Math.abs(s4d.mean - 109.54) < 0.05, `here ${s4d.mean.toFixed(3)} Hz with the sweeps’ voices; frustration-report.json 109.54`);
  const e0 = F.edge(6, 6, { rate: 11025, det: 0 }), e1 = F.edge(6, 6, { rate: 11025, det: 1 });
  check('3 · step 5: six partials, voices on the harmonics, tear between 1.72e-3 and 1.75e-3', e0.lo >= 1.71e-3 && e0.hi <= 1.75e-3, `held at ${fmt(e0.lo)}, torn at ${fmt(e0.hi)}`);
  check('3 · step 5: with the sweeps’ voices, between 2.13e-3 and 2.17e-3 (the slow sweep broke at 2.163e-3)', e1.lo >= 2.12e-3 && e1.hi <= 2.18e-3, `held at ${fmt(e1.lo)}, torn at ${fmt(e1.hi)}`);
}

// ── 4 · the six-against-forty walk ─────────────────────────────────────────────
{
  const bite = (n, B) => 110 * (n * Math.sqrt(1 + B * n * n) - n);
  check('4 · steps 1–2: the bite, in hertz', Math.abs(bite(6, 1e-3) - 11.8) < 0.1 && Math.abs(bite(1, 1e-3) - 0.055) < 0.002 && Math.abs(bite(40, 1e-5) - 35.1) < 0.2 && Math.abs(bite(6, 1e-5) - 0.12) < 0.01,
    `partial 6 at 1e-3 ${bite(6, 1e-3).toFixed(2)}, partial 1 ${bite(1, 1e-3).toFixed(4)}, partial 40 at 1e-5 ${bite(40, 1e-5).toFixed(2)}, partial 6 at 1e-5 ${bite(6, 1e-5).toFixed(3)} Hz; (40/6)³ = ${((40 / 6) ** 3).toFixed(1)}`);
  // the peel: which voices have let go, from the top down?
  const peel = (B, det) => held(40, { det, B, secs: 4 }).slip.map((x) => Math.abs(x) > 0.5);
  let suffix = true; const counts = [];
  for (const B of [5.6e-6, 1e-5, 1.8e-5, 3.2e-5]) {
    const g = peel(B, 0), k = g.filter(Boolean).length; counts.push(`${fmt(B)}:${k}`);
    const firstGone = g.indexOf(true); if (firstGone >= 0 && !g.slice(firstGone).every(Boolean)) suffix = false;
  }
  check('4 · step 3: on the harmonics the voices let go strictly from the top down', suffix, `voices gone ${counts.join(' · ')}`);
  const w56 = F.hold(40, 5.6e-6, 6, { det: 0 }).wobble, w32 = F.hold(40, 3.2e-5, 6, { det: 0 }).wobble, g32 = peel(3.2e-5, 0).filter(Boolean).length;
  check('4 · step 3: the tone holds while the top goes, and tears by the time about half have gone', w56 < 0.5 && w32 > 0.5 && g32 >= 15 && g32 <= 28, `wobble ${w56.toFixed(2)} at 5.6e-6, ${w32.toFixed(2)} at 3.2e-5 with ${g32} of 40 gone`);
  const never = peel(1e-7, 1).filter(Boolean).length;
  check('4 · step 3: with the sweeps’ voices about a third never hold, even at no stretch', never >= 11 && never <= 16, `${never} of 40 slip at B = 1e-7`);
  // snap and fray: rolling 0.5 s wobble of 10 ms averages, as sweep.py read it; time from 0.15 to 1 Hz
  const sweep = (N, b0, det) => {
    const t = F.tone(N, 7); F.tune(t, det, 0); const rate = 11025, dt = 1 / rate, hop = 110; let acc = 0, k = 0; const m = [];
    for (let i = 0; i < 24 * rate; i++) { if (i % 64 === 0) { F.setStretch(t, b0 * Math.pow(80, i / (24 * rate))); F.setGate(t); } acc += F.step(t, dt); if (++k === hop) { m.push(acc / hop); acc = 0; k = 0; } if (i % 4096 === 0) F.wrap(t); }
    const sd = m.map((_, i) => { if (i < 50) return 0; const s = m.slice(i - 50, i), mu = s.reduce((a, b) => a + b) / 50; return Math.sqrt(s.reduce((a, b) => a + (b - mu) ** 2, 0) / 50); });
    const at = (th) => sd.findIndex((x, i) => i > 300 && x > th) / 100; return at(1.0) - at(0.15);
  };
  for (const det of [0, 1]) {
    const s6 = sweep(6, 1e-4, det), s40 = sweep(40, 1e-6, det);
    check(`4 · step 4: six snap, forty fray (${det ? 'sweeps’ voices' : 'on the harmonics'})`, s6 < 1.2 && s40 > 5, `0.15 → 1 Hz wobble in ${s6.toFixed(2)} s for six, ${s40.toFixed(2)} s for forty`);
  }
  // the test: how much sooner, and the slope, at the rate the piece measures
  const piece = html[1], CH = { 0: { 6: 1.731e-3, 40: 2.308e-5, ratio: 75.0, p: 2.29 }, 1: { 6: 2.148e-3, 40: 1.670e-5, ratio: 128.6, p: 2.49 } };
  check('4 · step 5: the numbers the piece prints are the ones written into it', piece.includes('0: { 6: 1.731e-3, 40: 2.308e-5, ratio: 75.0, p: 2.29 }') && piece.includes('1: { 6: 2.148e-3, 40: 1.670e-5, ratio: 128.6, p: 2.49 }'), 'CHECKED block');
  const slope = (pts) => { const xs = pts.map((p) => Math.log(p[0])), ys = pts.map((p) => Math.log(p[1])), mx = xs.reduce((a, b) => a + b) / xs.length, my = ys.reduce((a, b) => a + b) / ys.length; let a = 0, b = 0; for (let i = 0; i < xs.length; i++) { a += (xs[i] - mx) * (ys[i] - my); b += (xs[i] - mx) ** 2; } return -a / b; };
  for (const det of [0, 1]) {
    const pts = [6, 10, 16, 25, 40].map((N) => [N, F.edge(N, 6, { rate: 11025, det }).edge]);
    const ratio = pts[0][1] / pts[4][1], p = slope(pts), c = CH[det];
    check(`4 · step 5: ${det ? 'sweeps’ voices' : 'on the harmonics'}, at the piece's rate`, Math.abs(pts[0][1] / c[6] - 1) < 0.01 && Math.abs(pts[4][1] / c[40] - 1) < 0.01 && Math.abs(ratio - c.ratio) < 1 && Math.abs(p - c.p) < 0.01,
      `edges ${pts.map((q) => `${q[0]}:${fmt(q[1])}`).join(' ')} · forty ${ratio.toFixed(1)}× sooner · slope ${p.toFixed(3)} · n³ would say 296×`);
  }
  const hi = [[6, F.edge(6, 6, { rate: 22050, det: 1 }).edge], [40, F.edge(40, 6, { rate: 22050, det: 1 }).edge]];
  const rh = hi[0][1] / hi[1][1];
  check('4 · step 5: at the map’s own rate (22050) the sweeps’ ratio is still over a hundred', rh > 100 && rh < 130, `six ${fmt(hi[0][1])}, forty ${fmt(hi[1][1])}, ${rh.toFixed(1)}× (the piece says 118 to 129×)`);
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
