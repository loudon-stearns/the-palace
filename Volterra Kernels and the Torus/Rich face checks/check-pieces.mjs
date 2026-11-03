// title: Volterra Kernels and the Torus — rich face — check-pieces.mjs
// born: 2026-11-03
// links: [[Volterra Kernels and the Torus]] (connects-to · rich-face-check)
// forward_vector: I re-run, headless, every number the rich face's made pieces show, on the pieces' own
//   worklet code: I pull each piece's WORKLET string out of its HTML, run it in Node at 48 and 44.1 kHz,
//   and check it against the arithmetic the piece and its section state. Run me after any change to a piece:
//   node "Volterra Kernels and the Torus/Rich face checks/check-pieces.mjs"
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const BUNDLE = dirname(dirname(fileURLToPath(import.meta.url)));
const E = 'Volterra Kernels and the Torus';
const html = (what) => readFileSync(join(BUNDLE, `${E} — rich — ${what}.html`), 'utf8');
let fails = 0;
const ok = (cond, what) => { console.log(`${cond ? '  ok  ' : '  FAIL'}  ${what}`); if (!cond) fails++; };
const dB = (a) => 20 * Math.log10(Math.max(a, 1e-12));

/** The worklet class a piece's WORKLET string registers, at a given sample rate. */
function proc(src, sr) {
  let K = null;
  class AWP { constructor() { this.port = { onmessage: null, postMessage: (m) => { this.last = m; } }; } }
  new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', src)(AWP, (_n, C) => { K = C; }, sr);
  const p = new K();
  p.send = (d) => p.port.onmessage({ data: d });
  p.run = (sec, onBlock) => {
    const L = new Float32Array(128), R = new Float32Array(128);
    for (let b = 0; b < Math.round((sec * sr) / 128); b++) { p.process([], [[L, R]]); if (onBlock) onBlock(L); }
    return p.last;
  };
  return p;
}
const workletOf = (what) => html(what).match(/const WORKLET = `([\s\S]*?)`;/)[1];

// ── the diagonal and off it ─────────────────────────────────────────────────
{
  const src = workletOf('the diagonal and off it');
  for (const sr of [48000, 44100]) {
    console.log(`\nthe diagonal and off it · ${sr} Hz`);
    const A = 0.45, refs = [[2, 0], [0, 2], [1, 1], [-1, 1], [0, 0]];
    const run = (D, glide = 0, notch = false) => {
      const p = proc(src, sr); p.send({ mode: 'test', D, glide, notch, gain: 1, refs, reset: true });
      return p.run(3).amps;
    };
    // step 1: a static curve makes the octave at c·A²/2
    { const p = proc(src, sr); p.send({ mode: 'curve', c: 0.5, gain: 1, refs: [[1, 0], [2, 0], [0, 0]], reset: true });
      const a = p.run(2).amps; ok(Math.abs(a[1] - 0.16) < 1e-3 && Math.abs(a[0] - 0.8) < 1e-3, `curve: f at ${a[0].toFixed(4)} (0.8), 2f at ${a[1].toFixed(4)} (0.16)`); }
    // step 2: a product of two different sines is sum and difference only
    { const p = proc(src, sr); p.send({ mode: 'ring', gain: 1, refs: [[-1, 1], [1, 1], [1, 0], [2, 0]], reset: true });
      const a = p.run(2).amps; ok(Math.abs(a[0] - 0.405) < 1e-3 && Math.abs(a[1] - 0.405) < 1e-3 && a[2] < 1e-4 && a[3] < 1e-4,
        `ring: difference ${a[0].toFixed(4)}, sum ${a[1].toFixed(4)} (0.405 each); f₁ ${dB(a[2]).toFixed(0)} dB, 2f₁ ${dB(a[3]).toFixed(0)} dB`); }
    // step 3: a sine times its own past keeps the octave at 0.405 for every D
    { let worst = 0; for (const ms of [0, 0.7, 1.2, 3.3, 7]) { const p = proc(src, sr); p.send({ mode: 'self', D: Math.round(sr * ms / 1000), gain: 1, refs: [[2, 0]], reset: true }); worst = Math.max(worst, Math.abs(p.run(2).amps[0] - 0.405)); }
      ok(worst < 1e-3, `self: the octave holds at 0.405 for D from 0 to 7 ms (worst error ${worst.toExponential(1)})`); }
    // step 4: on the diagonal, intermodulation is kept at A², 6.02 dB over each harmonic at A²/2
    const d0 = run(0);
    ok(Math.abs(d0[2] - A * A) < 1e-3 && Math.abs(d0[3] - A * A) < 1e-3 && Math.abs(d0[0] - A * A / 2) < 1e-3,
      `diagonal: harmonics ${dB(d0[0]).toFixed(2)} / ${dB(d0[1]).toFixed(2)} dB, sum ${dB(d0[2]).toFixed(2)} dB, difference ${dB(d0[3]).toFixed(2)} dB · IM over harmonic ${(dB(d0[2]) - dB(d0[0])).toFixed(2)} dB`);
    // off it at D = 1/(2Δf): the sum product goes, the harmonics stay
    const Doff = Math.round(sr / 300), off = run(Doff);
    ok(dB(off[2]) < -80 && Math.abs(off[0] - A * A / 2) < 1e-3 && Math.abs(off[1] - A * A / 2) < 1e-3,
      `off, D = ${Doff} samples (${(Doff / sr * 1000).toFixed(3)} ms): sum ${dB(off[2]).toFixed(1)} dB, harmonics ${dB(off[0]).toFixed(2)} / ${dB(off[1]).toFixed(2)} dB, difference ${dB(off[3]).toFixed(2)} dB`);
    const predDiff = A * A * Math.abs(Math.cos(Math.PI * 750 * Doff / sr));
    ok(Math.abs(off[3] - predDiff) < 1e-3, `off: difference product ${off[3].toFixed(4)} against A²|cos π(f₁+f₂)D| = ${predDiff.toFixed(4)}`);
    // glide: the off-diagonal null follows the spacing; the notch after the diagonal does not
    let worstOff = -999; for (const gl of [25, 75, 150]) worstOff = Math.max(worstOff, dB(run(Doff, gl)[2]));
    ok(worstOff < -80, `off, glide 25/75/150 Hz: sum product stays under −80 dB (worst ${worstOff.toFixed(1)} dB)`);
    const n0 = run(0, 0, true), n75 = run(0, 75, true), n150 = run(0, 150, true);
    ok(dB(n0[2]) < -60 && dB(n75[2]) > dB(n0[2]) + 20 && dB(n75[0]) < -60,
      `diagonal + notch at 750 Hz: sum ${dB(n0[2]).toFixed(1)} dB at no glide; at +75 Hz sum ${dB(n75[2]).toFixed(1)} dB and the 2f₁ harmonic ${dB(n75[0]).toFixed(1)} dB; at +150 Hz sum ${dB(n150[2]).toFixed(1)} dB`);
  }
}

// ── one field, two readers ──────────────────────────────────────────────────
{
  const page = html('one field, two readers'), src = workletOf('one field, two readers');
  // the piece's own field definitions and table builder, cut from its script
  const fieldsSrc = page.match(/(\/\/ ---------- the fields[\s\S]*?)const RATIOS/)[1];
  const { FIELDS, tables, N, CHEB } = new Function(`${fieldsSrc}; return { FIELDS, tables, N, CHEB };`)();
  const idx = (id) => FIELDS.findIndex((f) => f.id === id);
  /** Run the reader for `sec` and return the output (÷ 0.7, the piece's output trim), after a 0.5 s settle. */
  const capture = (sr, field, msg, sec = 1) => {
    const p = proc(src, sr); p.send({ table: tables[field], N }); p.send({ ...msg, gain: 1, reset: true });
    p.run(0.5);
    const out = []; p.run(sec, (L) => { for (const v of L) out.push(v / 0.7); });
    return { out, last: p.last, p };
  };
  // amplitude of one frequency over a whole number of seconds
  const amp = (x, f, sr) => { x = x.slice(0, Math.floor(x.length / sr) * sr); let re = 0, im = 0; for (let n = 0; n < x.length; n++) { const ph = 2 * Math.PI * f * n / sr; re += x[n] * Math.cos(ph); im -= x[n] * Math.sin(ph); } return 2 * Math.hypot(re, im) / x.length; };
  for (const sr of [48000, 44100]) {
    console.log(`\none field, two readers · ${sr} Hz`);
    const D = Math.round(96 * sr / 48000);
    // step 5, the test: a full-scale sine into the effect against the synth at 1 : 1
    for (const id of ['bilinear', 'clip', 'cheb']) {
      const { last } = capture(sr, idx(id), { reader: 'test', fin: 220, D, drive: 1, listen: 'effect' }, 1.5);
      ok(last.nullDb < -100, `test, ${id}: effect − synth ${last.nullDb.toFixed(1)} dB re the synth (mirrored field: one signal)`);
    }
    { const { last } = capture(sr, idx('ridge'), { reader: 'test', fin: 220, D, drive: 1 }, 1.5);
      ok(last.nullDb > -20, `test, ridge: effect − synth ${last.nullDb.toFixed(1)} dB (not mirrored: two signals)`); }
    for (const dr of [0.9, 0.7]) { const { last } = capture(sr, idx('cheb'), { reader: 'test', fin: 220, D, drive: dr }, 1.5);
      ok(last.nullDb > -40, `test, cheb at input level ${dr}: effect − synth ${last.nullDb.toFixed(1)} dB (a smaller sine is no pair of phasors)`); }
    { let worst = -999; for (const d of [0, 17, 240]) { const { last } = capture(sr, idx('clip'), { reader: 'test', fin: 220, D: d, drive: 1 }, 1); worst = Math.max(worst, last.nullDb); }
      ok(worst < -100, `test, tanh at D = 0, 17, 240 samples: worst ${worst.toFixed(1)} dB`); }
    // step 3: silence in, a constant out
    { const { out } = capture(sr, idx('clip'), { reader: 'input', src: 'silence', D }, 0.5);
      const m = out.reduce((a, b) => a + b, 0) / out.length, sd = Math.sqrt(out.reduce((a, b) => a + (b - m) ** 2, 0) / out.length);
      ok(sd < 1e-9, `input, nothing in: output is a constant ${m.toFixed(3)} (spread ${sd.toExponential(1)}), which the 22 Hz high-pass removes`); }
    // step 2: scan on a·b at 3 : 2 is f₁ ± f₂ only
    { const { out } = capture(sr, idx('bilinear'), { reader: 'scan', f1: 165, f2: 110 }, 1);
      const a55 = amp(out, 55, sr), a275 = amp(out, 275, sr), a165 = amp(out, 165, sr), a110 = amp(out, 110, sr);
      ok(Math.abs(a55 - 0.45) < 2e-3 && Math.abs(a275 - 0.45) < 2e-3 && a165 < 1e-3 && a110 < 1e-3, `scan, a·b at 165 : 110 Hz: 55 Hz ${a55.toFixed(4)}, 275 Hz ${a275.toFixed(4)} (0.45 each), 110 and 165 Hz under 1e-3`); }
    // step 4: half on a·b with a sine in is ring modulation, x(t) · cos 2π·110t
    { const { out } = capture(sr, idx('bilinear'), { reader: 'half', src: 'sine', fin: 220, drive: 1, f2: 110 }, 1);
      const a110 = amp(out, 110, sr), a330 = amp(out, 330, sr), a220 = amp(out, 220, sr);
      ok(Math.abs(a110 - 0.45) < 2e-3 && Math.abs(a330 - 0.45) < 2e-3 && a220 < 1e-3, `half, a·b, 220 Hz in: 110 Hz ${a110.toFixed(4)}, 330 Hz ${a330.toFixed(4)}, 220 Hz ${a220.toExponential(1)} (a ring modulator)`); }
    // the coefficient bridge: on the plucked riff, the Chebyshev field read by the input is Σ c·T_j(x(t))·T_k(x(t − D))
    { const p = proc(src, sr); p.send({ table: tables[idx('cheb')], N }); p.send({ reader: 'input', src: 'riff', D, drive: 1, gain: 1, reset: true });
      // the same riff, recorded dry from a twin
      const q = proc(src, sr); q.send({ table: tables[idx('cheb')], N }); q.send({ reader: 'input', src: 'riff', D, drive: 1, gain: 1, dry: true, reset: true });
      let pk = 0; for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(CHEB.reduce((s, [a, b, c]) => s + c * Math.cos(2 * Math.PI * a * i / N) * Math.cos(2 * Math.PI * b * j / N), 0)));
      const T = (n, x) => Math.cos(n * Math.acos(Math.max(-1, Math.min(1, x))));
      const xs = [], ys = []; p.run(1.5, (L) => { for (const v of L) ys.push(v / 0.7); }); q.run(1.5, (L) => { for (const v of L) xs.push(v / 0.7); });
      let err = 0, peak = 0; const start = Math.round(0.5 * sr);
      for (let n = start; n < xs.length; n++) { const want = (0.9 / pk) * CHEB.reduce((s, [a, b, c]) => s + c * T(a, xs[n]) * T(b, xs[n - D]), 0); err = Math.max(err, Math.abs(ys[n] - want)); peak = Math.max(peak, Math.abs(want)); }
      ok(err < 5e-3, `input, Chebyshev field on the riff: matches Σ c_jk·T_j(x(t))·T_k(x(t − D)) within ${err.toExponential(1)} (peak ${peak.toFixed(2)}; the gap is the 256-point table's interpolation)`); }
  }
}

console.log(fails ? `\n${fails} FAILED` : '\nall checks pass');
process.exit(fails ? 1 : 0);
