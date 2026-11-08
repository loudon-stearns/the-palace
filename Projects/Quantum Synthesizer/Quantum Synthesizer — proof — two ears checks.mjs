#!/usr/bin/env node
/*
  title: Quantum Synthesizer — proof — two ears checks
  born: 2026-11-03
  links: [[Quantum Synthesizer]] connects-to · checks-for · Quantum Synthesizer — rich — two ears.html
  forward_vector: I re-run every claim the two-ears piece makes, in Node, on the piece's own code: I pull its
    qs-engine script and its WORKLET string out of the html and check the solver against the exact levels, each
    step's readout, the four-cell test, and the voice the reader hears. If the piece changes, run me again.
  run: node "Projects/Quantum Synthesizer/Quantum Synthesizer — proof — two ears checks.mjs"
*/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(HERE, 'Quantum Synthesizer — rich — two ears.html'), 'utf8');
const engine = html.match(/<script id="qs-engine">([\s\S]*?)<\/script>/)[1];
const worklet = html.match(/const WORKLET = `([\s\S]*?)`;/)[1];
new Function(engine)();
const QS = globalThis.QS;
let pass = true;
const say = (...a) => console.log(...a);
const check = (ok, line) => { if (!ok) pass = false; say((ok ? '  ok   ' : '  FAIL ') + line); };

const O = QS.well('osc'), B = QS.well('box');

say('== check 1: the solver finds the formulas it was never told ==');
let eo = 0, eb = 0;
for (let n = 0; n < 12; n++) eo = Math.max(eo, Math.abs(O.E[n] - (n + 0.5)) / (n + 0.5));
for (let n = 0; n < 8; n++) eb = Math.max(eb, Math.abs(B.E[n] - (n + 1) ** 2 / 2) / ((n + 1) ** 2 / 2));
let orth = 0;
for (const W of [O, B]) for (let i = 0; i < W.phi.length; i++) for (let j = 0; j <= i; j++) {
  let s = 0; for (let k = 0; k < W.x.length; k++) s += W.phi[i][k] * W.phi[j][k] * W.h; orth = Math.max(orth, Math.abs(s - (i === j ? 1 : 0)));
}
say('  oscillator E_n, n = 0..7:', O.E.slice(0, 8).map((v) => v.toFixed(6)).join(' '));
say('  box        E_n, n = 1..8:', B.E.slice(0, 8).map((v) => v.toFixed(6)).join(' '));
check(eo < 1e-4, `oscillator vs n + 1/2, n < 12: worst relative miss ${eo.toExponential(2)}`);
check(eb < 1e-4, `box vs n^2/2, n = 1..8: worst relative miss ${eb.toExponential(2)}`);
check(orth < 1e-9, `shapes orthonormal to ${orth.toExponential(2)}`);

say('== check 2 (steps 1, 2): one rung — the clock hears one pitch at 220(n + 1/2) Hz, the detector nothing ==');
for (let n = 0; n < 8; n++) {
  const c = QS.rung(O, n), cl = QS.measure(O, c, 'clock').peaks, de = QS.measure(O, c, 'detector');
  const w = QS.wobble(O, n);
  check(cl.length === 1 && Math.abs(cl[0].f - 220 * (n + 0.5)) < 0.05 && w < 1e-10 && QS.detectorPartials(O, c).length === 0,
    `rung ${n}: clock ${cl.map((p) => p.f.toFixed(2)).join(', ')} Hz (want ${(220 * (n + 0.5)).toFixed(2)}) · |psi(x0)|^2 moves ${w.toExponential(1)} of itself · detector bank empty`);
}

say('== check 3 (step 3): two rungs — the detector hears one pitch, their gap ==');
for (let m = 0; m <= 5; m++) for (let n = m + 1; n <= 5; n++) {
  const c = QS.pair(O, m, n), de = QS.measure(O, c, 'detector').peaks, cl = QS.measure(O, c, 'clock').peaks;
  check(de.length === 1 && Math.abs(de[0].f - 220 * (n - m)) < 0.1 && cl.length === 2,
    `|${m}> + |${n}>: clock ${cl.map((p) => p.f.toFixed(1)).join(' + ')} Hz · detector ${de.map((p) => p.f.toFixed(2)).join(', ')} Hz (want ${220 * (n - m)})`);
}

say('== check 4 (step 4): the oscillator packet is a coherent state, alpha = 2.2 ==');
{
  const a = 4 * QS.PULL0 / Math.SQRT2, c = QS.packet(O, QS.PULL0); let worst = 0, lf = 0;
  for (let n = 0; n < 20; n++) { if (n) lf += Math.log(n); const want = Math.exp(-a * a / 2 + n * Math.log(a) - lf / 2); worst = Math.max(worst, Math.abs(Math.abs(c[n]) - want)); }
  check(worst < 1e-4 && Math.abs(a - 2.2) < 1e-12, `alpha = ${a.toFixed(4)} · |c_n| vs Poisson amplitudes, n < 20: worst miss ${worst.toExponential(2)} · kept ${QS.kept(c).toFixed(9)}`);
  const cb = QS.packet(B, QS.PULL0);
  check(QS.kept(cb) > 0.999, `box packet: the solver's 18 levels hold ${(100 * QS.kept(cb)).toFixed(3)}% of it`);
}

say('== check 5 (step 5): the test, six cells, measured by FFT of psi(x0, t) computed in time ==');
const cells = [['osc', 'clock'], ['osc', 'detector'], ['osc', 'lowest'], ['box', 'clock'], ['box', 'detector'], ['box', 'lowest']];
const M = cells.map(([w, ear]) => { const W = QS.well(w); return QS.measure(W, QS.packet(W, QS.PULL0), ear).peaks; });
const u = (i, n) => M[i].slice(0, n).map((p) => p.f / 110);
const near = (a, b, tol) => a.length === b.length && a.every((v, k) => Math.abs(v - b[k]) < tol);
cells.forEach(([w, ear], i) => say(`  ${w.padEnd(3)} ${ear.padEnd(9)} ${String(M[i].length).padStart(2)} peaks · x110 Hz: ${u(i, 10).map((v) => v.toFixed(3)).join(' ')}`));
check(near(u(0, 8), [1, 3, 5, 7, 9, 11, 13, 15], 0.002), 'oscillator, clock: odd multiples of 110 Hz, 1 : 3 : 5 : 7 ...');
check(near(u(1, 8), [2, 4, 6, 8, 10, 12, 14, 16], 0.002), 'oscillator, detector: whole multiples of 220 Hz, the harmonic series');
check(near(u(2, 6), [2, 4, 6, 8, 10, 12], 0.002), 'oscillator, gaps from the lowest (the page\'s own proofs\' rule): 1 : 2 : 3 : 4 on 220 Hz');
check(near(u(3, 7), [1, 4, 9, 16, 25, 36, 49], 0.005), 'box, clock: the squares, 1 : 4 : 9 : 16 ...');
check(near(u(4, 6), [3, 5, 7, 8, 9, 12], 0.002), 'box, detector: gaps between squares, 3 · 5 · 7 · 8 · 9 · 12 x 110 Hz — not squares');
check(near(u(5, 4), [3, 8, 15, 24], 0.003), 'box, gaps from the lowest: 3 · 8 · 15 · 24 x 110 Hz — not squares either');
const harm = M.map((P) => { const r = P.map((p) => p.f / P[0].f); return r.slice(0, 4).every((v, k) => Math.abs(v - (k + 1)) < 0.005); });
check(harm.join() === 'false,true,true,false,false,false', `"1 : 2 : 3 : 4 ?" column reads ${harm.map((h) => (h ? 'yes' : 'no')).join(', ')} (want no, yes, yes, no, no, no)`);

say('== check 6: the voice — the worklet, run in Node, plays the bank it is sent and never clips ==');
{
  globalThis.sampleRate = 44100;
  let Proc = null;
  globalThis.AudioWorkletProcessor = class { constructor() { this.port = { onmessage: null }; } };
  globalThis.registerProcessor = (name, cls) => { Proc = cls; };
  new Function(worklet)();
  for (const [w, ear] of cells) {
    const W = QS.well(w), bank = QS.bank(W, QS.packet(W, QS.PULL0), ear), p = new Proc();
    p.port.onmessage({ data: { partials: bank } }); p.port.onmessage({ data: { on: true } });
    const N = 65536, out = new Float64Array(N + 8192); let peak = 0;
    for (let off = 0; off < out.length; off += 128) {
      const L = new Float32Array(128), R = new Float32Array(128); p.process([], [[L, R]]);
      for (let i = 0; i < 128 && off + i < out.length; i++) { out[off + i] = L[i]; peak = Math.max(peak, Math.abs(L[i])); }
    }
    const pk = QS.peaks(out.subarray(8192), 44100, -40).peaks, meas = M[cells.findIndex((c) => c[0] === w && c[1] === ear)];
    const agree = meas.every((m) => pk.some((q) => Math.abs(q.f - m.f) < 0.2));
    check(agree && peak <= 0.6 + 1e-9, `${w} ${ear}: ${bank.length} partials sent · every measured partial is in what plays (${meas.length}/${meas.length}) · peak ${peak.toFixed(3)} (cap 0.6)`);
  }
}
say('== check 7: the clock depends on where the floor is; the detector does not ==');
{
  const c = QS.packet(O, QS.PULL0), W2 = Object.assign({}, O, { E: O.E.map((e) => e - 0.5) });
  const cl = QS.measure(W2, c, 'clock').peaks.map((p) => p.f / 110), de0 = QS.measure(O, c, 'detector').peaks, de1 = QS.measure(W2, c, 'detector').peaks;
  check(near(cl.slice(0, 5), [2, 4, 6, 8, 10], 0.002), `floor raised half a quantum: the oscillator's clock reads ${cl.slice(0, 5).map((v) => v.toFixed(3)).join(' · ')} x 110 Hz (its lowest level now at 0 Hz)`);
  check(de0.length === de1.length && de0.every((p, k) => Math.abs(p.f - de1[k].f) < 1e-6), `the detector's ${de0.length} partials don't move at all`);
}
say(pass ? 'PASS' : 'FAIL');
process.exit(pass ? 0 : 1);
