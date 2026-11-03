// Boundary-Crossing Instruments — rich — ratio and slope — check.mjs
// born: 2026-11-03 · checks [[Boundary-Crossing Instruments]]' rich-face piece "Boundary-Crossing Instruments — rich — ratio and slope.html"
// forward_vector: I re-run, headless, every claim the ratio-and-slope piece makes about its own engine and
// about the section it serves: that the slope form of the soft knee is Compressor Design's ratio form with
// s = 1/R and needs no special case at s = 0, that a ratio knob spends its travel unevenly and cannot reach
// infinity without a jump while a slope knob is linear in decibels end to end, that a morph walked in ratio
// hits the wall the moment it leaves its start, that the slope is one number only on decibel axes, and that
// the worklet the page plays is the core it draws. What a listener hears in the blind test I cannot check;
// I print what the loop measures for each pair so the page's reveal can be read against it.
//
//   node "Boundary-Crossing Instruments/Boundary-Crossing Instruments — rich — ratio and slope — check.mjs"
//
// It pulls the page's <script id="bci-core"> and <script id="bci-worklet"> out of the HTML, runs them in a
// Node sandbox with a stand-in AudioWorkletProcessor, and compares against equations written here on their
// own. PASS/FAIL per claim; exits 1 on any FAIL. Reads only; writes nothing.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(HERE, 'Boundary-Crossing Instruments — rich — ratio and slope.html'), 'utf8');
const block = (id) => {
  const m = html.match(new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)</script>`));
  if (!m) throw new Error(`no <script id="${id}"> in the piece`);
  return m[1];
};

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };

const SR = 48000;
const E = { Math, Float64Array, Float32Array, sampleRate: SR, registered: null };
E.AudioWorkletProcessor = class { constructor() { this.port = { onmessage: null, sent: [], postMessage(m) { this.sent.push(m); } }; } };
E.registerProcessor = (name, cls) => { E.registered = cls; };
vm.createContext(E);
vm.runInContext(block('bci-core') + '\n' + block('bci-worklet') + '\nthis.BCI = BCI;', E);
const B = E.BCI, T = B.T;

// ── the ratio form, written here on its own, from Compressor Design § Soft Knee Mathematics ──
//   below: out = in · above: out = T + (in − T)/R · in the knee: out = in + (1/R − 1)(in − T + W/2)²/(2W)
function ownRatioForm(x, T, R, W) {
  if (W > 0 && x >= T - W / 2 && x <= T + W / 2) return x + (1 / R - 1) * (x - T + W / 2) ** 2 / (2 * W);
  if (x > T + (W > 0 ? W / 2 : 0)) return T + (x - T) / R;
  return x;
}

// 1 · slope form = ratio form with s = 1/R, over a grid of levels, ratios and knees
{
  let worst = 0;
  for (const R of [1, 1.5, 2, 4, 10, 20, 100]) for (const W of [0, 3, 6, 12, 24]) for (let x = -80; x <= 6; x += 0.25)
    worst = Math.max(worst, Math.abs(E.curveDb(x, T, 1 / R, W) - ownRatioForm(x, T, R, W)));
  check('slope form equals Compressor Design’s ratio form with s = 1/R', worst < 1e-9, `worst gap ${worst.toExponential(2)} dB over 7 ratios × 5 knees × 345 levels`);
}

// 2 · s = 0 (R = ∞) needs no special case: the core takes it as it is and holds the output at the knee's top
{
  let worst = 0;
  for (const W of [0, 6, 12]) for (let x = T + W / 2 + 0.01; x <= 6; x += 0.5) worst = Math.max(worst, Math.abs(E.curveDb(x, T, 0, W) - T));
  const viaInf = E.curveDb(-6, T, E.slopeOf(Infinity), 0);
  check('s = 0 is a limiter with no branch for it: above the knee, out = T', worst < 1e-12 && viaInf === T, `worst ${worst} dB; slopeOf(∞) = ${E.slopeOf(Infinity)}, curve(−6 dB) = ${viaInf}`);
}

// 3 · the curve is continuous, and so is its slope, at both edges of the knee, for every s in [0, 1]
{
  let jump = 0, kink = 0; const h = 1e-6;
  for (const s of [0, 0.05, 0.25, 0.5, 1]) for (const W of [3, 6, 12, 24]) for (const e of [T - W / 2, T + W / 2]) {
    jump = Math.max(jump, Math.abs(E.curveDb(e + h, T, s, W) - E.curveDb(e - h, T, s, W)));
    const dl = (E.curveDb(e - h, T, s, W) - E.curveDb(e - 2 * h, T, s, W)) / h, dr = (E.curveDb(e + 2 * h, T, s, W) - E.curveDb(e + h, T, s, W)) / h;
    kink = Math.max(kink, Math.abs(dl - dr));
  }
  check('soft knee: no jump and no corner at the knee’s edges, s from 0 to 1', jump < 1e-5 && kink < 1e-3, `largest jump ${jump.toExponential(2)} dB, largest slope change ${kink.toExponential(2)}`);
}

// 4 · s = 1 is a wire: the curve is the diagonal, and the worklet passes the loop untouched
{
  let worst = 0; for (let x = -90; x <= 0; x += 0.5) worst = Math.max(worst, Math.abs(E.curveDb(x, T, 1, 0) - x));
  const p = new E.registered(); p.port.onmessage({ data: { s: 1, W: 0, mk: 0 } });
  const loop = E.makeLoop(SR); let dev = 0;
  for (let o = 0; o < loop.length; o += 128) { const k = Math.min(128, loop.length - o), l = new Float32Array(k), r = new Float32Array(k); p.process([], [[l, r]]); for (let i = 0; i < k; i++) dev = Math.max(dev, Math.abs(l[i] - loop[o + i]), Math.abs(r[i] - l[i])); }
  check('s = 1 is a wire, in the curve and in the worklet', worst === 0 && dev < 1e-6, `curve off the diagonal by ${worst}; worklet off the loop by ${dev.toExponential(2)} over one bar, both channels`);
}

// 5 · the worklet plays what the core measures: same smoothed gain, same output, at 4:1 and at ∞
for (const s of [0.25, 0]) {
  const p = new E.registered(); p.port.onmessage({ data: { s, W: 0, mk: 0 } });
  const loop = E.makeLoop(SR), N = loop.length, out = new Float32Array(2 * N);
  for (let o = 0; o < 2 * N; o += 128) { const k = Math.min(128, 2 * N - o), l = new Float32Array(k); p.process([], [[l]]); out.set(l, o); }
  const m = E.measure(loop, SR, T, s, 0); let dev = 0;
  for (let i = 0; i < N; i++) dev = Math.max(dev, Math.abs(out[N + i] - m.out[i]));
  check(`the worklet’s second bar is the core’s measured bar, s = ${s}`, dev < 1e-6, `largest sample gap ${dev.toExponential(2)}`);
}

// 6 · the loop: one bar at 96 BPM, peaking at −6 dBFS, reaching about 24 dB over the threshold
{
  const loop = E.makeLoop(SR); let pk = 0; for (const v of loop) pk = Math.max(pk, Math.abs(v));
  const pkDb = 20 * Math.log10(pk), bar = loop.length / SR;
  check('the loop is one bar at 96 BPM and peaks 24 dB over the threshold', Math.abs(bar - 2.5) < 1e-3 && Math.abs(pkDb - B.PEAK) < 1e-3 && Math.abs(pkDb - T - B.OVER) < 1e-3, `${bar.toFixed(4)} s, peak ${pkDb.toFixed(3)} dBFS = ${(pkDb - T).toFixed(2)} dB over −30`);
}

// 7 · the ratio knob: where it spends its travel, and the jump at the notch (both tapers)
for (const taper of ['linear', 'log']) {
  const at = (p) => E.overOut(E.slopeOf(E.ratioKnob(p, taper)));
  const q4 = E.knobOfRatio(4, taper), q20 = E.knobOfRatio(20, taper);
  const firstShare = (at(0) - at(q4)) / B.OVER, lastMove = at(q20) - at(B.DETENT - 1e-9), notch = at(B.DETENT - 1e-9) - at(B.DETENT);
  const reaches = [0, 0.5, 0.9, 0.969, 0.96999].every((p) => isFinite(E.ratioKnob(p, taper)));
  console.log(`      ${taper}: 1:1→4:1 is ${(q4 * 100).toFixed(1)}% of travel and ${(firstShare * 100).toFixed(1)}% of the move; 20:1→100:1 is ${((B.DETENT - q20) * 100).toFixed(1)}% of travel and moves ${lastMove.toFixed(2)} dB; the notch jumps ${notch.toFixed(2)} dB`);
  check(`ratio knob (${taper}): no turn short of the notch reaches ∞, and the notch is a jump`, reaches && notch > 0.2 && E.ratioKnob(1, taper) === Infinity, `jump ${notch.toFixed(3)} dB from 100:1 to ∞`);
  check(`ratio knob (${taper}): 20:1 to 100:1 takes ${((B.DETENT - q20) * 100).toFixed(0)}% of the travel for under 1 dB`, lastMove < 1 && (B.DETENT - q20) > 0.3, `${lastMove.toFixed(3)} dB`);
}

// 8 · the slope knob is linear in decibels end to end: every 1% of travel moves the hit by OVER/100 dB, and its end is s = 0
{
  let worst = 0; for (let i = 0; i < 100; i++) worst = Math.max(worst, Math.abs((E.overOut(E.slopeKnob(i / 100)) - E.overOut(E.slopeKnob((i + 1) / 100))) - B.OVER / 100));
  check('slope knob: equal turns, equal decibels, and its end is the limiter', worst < 1e-9 && E.slopeKnob(1) === 0 && E.overOut(0) === 0, `worst step off ${(B.OVER / 100).toFixed(2)} dB by ${worst.toExponential(2)}`);
}

// 9 · the morph: in ratio toward ∞, any step off A is already ∞; in slope it glides; toward 20:1, the halfway points
{
  const A = { R: 2, W: 12 }, Binf = { R: Infinity, W: 0 }, B20 = { R: 20, W: 0 };
  const rStep = E.morph(A, Binf, 0.001, 'ratio'), sStep = E.morph(A, Binf, 0.001, 'slope');
  check('morph in ratio toward ∞ is at the wall after 0.1% of the walk', rStep.s === 0, `s = ${rStep.s} at m = 0.001`);
  let maxStep = 0; for (let i = 0; i < 1000; i++) maxStep = Math.max(maxStep, Math.abs(E.overOut(E.morph(A, Binf, i / 1000, 'slope').s) - E.overOut(E.morph(A, Binf, (i + 1) / 1000, 'slope').s)));
  check('morph in slope toward ∞ glides: no step of 0.1% moves the hit more than 0.02 dB', maxStep < 0.02 && sStep.s > 0.49, `largest step ${maxStep.toFixed(4)} dB; s = ${sStep.s.toFixed(4)} at m = 0.001`);
  const hr = E.morph(A, B20, 0.5, 'ratio'), hs = E.morph(A, B20, 0.5, 'slope');
  const ends = [E.overOut(0.5), E.overOut(1 / 20)], midDb = (ends[0] + ends[1]) / 2;
  console.log(`      toward 20:1: ratio halfway = ${(1 / hr.s).toFixed(2)}:1, hit ${E.overOut(hr.s).toFixed(2)} dB over; slope halfway = ${(1 / hs.s).toFixed(2)}:1, hit ${E.overOut(hs.s).toFixed(2)} dB over; ends ${ends[0].toFixed(2)} and ${ends[1].toFixed(2)}`);
  check('toward 20:1, the slope walk’s halfway is halfway in decibels; the ratio walk’s is not', Math.abs(E.overOut(hs.s) - midDb) < 1e-9 && Math.abs(1 / hr.s - 11) < 1e-9 && E.overOut(hr.s) < midDb / 2, `slope ${E.overOut(hs.s).toFixed(2)} dB vs halfway ${midDb.toFixed(2)}; ratio 11:1 gives ${E.overOut(hr.s).toFixed(2)} dB`);
}

// 10 · the slope is one number only on decibel axes
{
  const s = 0.25, at24 = E.linearSlopeAt(T + 24, T, s, 0), at6 = E.linearSlopeAt(T + 6, T, s, 0);
  const own24 = s * Math.pow(10, (s * 24 - 24) / 20), own6 = s * Math.pow(10, (s * 6 - 6) / 20);
  const dbSlope = (E.curveDb(T + 12.001, T, s, 0) - E.curveDb(T + 11.999, T, s, 0)) / 0.002;
  check('at 4:1 the dB slope is 0.25 everywhere above T; the linear-axes slope changes with level', Math.abs(dbSlope - s) < 1e-6 && Math.abs(at24 - own24) < 1e-6 && Math.abs(at6 - own6) < 1e-6 && Math.abs(at24 - at6) > 0.05, `linear slope ${at6.toFixed(3)} at 6 dB over, ${at24.toFixed(3)} at 24 dB over; own: s × 10^((s − 1) × over ÷ 20)`);
}

// 11 · the blind test's pairs, measured on the loop with loudness matched (crest = peak − rms)
{
  const loop = E.makeLoop(SR), meas = (R) => E.measure(loop, SR, T, E.slopeOf(R), 0);
  const pairs = [[1, 2], [2, 4], [10, 20], [20, Infinity], [4, 4]];
  const rows = pairs.map(([a, b]) => { const ma = meas(a), mb = meas(b); return { a, b, rd: Math.abs(a - b), sd: Math.abs(1 / a - 1 / b), dc: Math.abs(ma.crest - mb.crest), ca: ma.crest, cb: mb.crest, ra: ma.rms, rb: mb.rms }; });
  for (const r of rows) console.log(`      ${r.a}:1 / ${r.b === Infinity ? '∞' : r.b}:1  ratio distance ${r.rd === Infinity ? '∞' : r.rd}  slope distance ${r.sd.toFixed(3)}  crest ${r.ca.toFixed(2)} → ${r.cb.toFixed(2)} dB, moved ${r.dc.toFixed(2)} dB  (rms ${r.ra.toFixed(2)} / ${r.rb.toFixed(2)})`);
  const [p12, p24, p1020, p20inf, same] = rows;
  check('the same-same pair measures no difference', same.dc === 0, `${same.dc} dB`);
  check('measured crest change tracks slope distance, not ratio distance: 1→2 > 2→4 > each of 10→20 and 20→∞', p12.dc > p24.dc && p24.dc > p1020.dc && p24.dc > p20inf.dc, `${p12.dc.toFixed(2)} > ${p24.dc.toFixed(2)} > ${p1020.dc.toFixed(2)}, ${p20inf.dc.toFixed(2)} dB`);
  const ratio = p20inf.dc / p1020.dc;
  check('20→∞ (ratio distance ∞) moves the crest within a factor of 2 of 10→20 (ratio distance 10): slope calls them equal, 0.05 each', ratio > 0.5 && ratio < 2, `${p20inf.dc.toFixed(2)} vs ${p1020.dc.toFixed(2)} dB, ratio ${ratio.toFixed(2)}`);
}

// 12 · loudness matched, no setting the page can reach peaks above the loop's own −6 dBFS (so the safety compressor never acts)
{
  const loop = E.makeLoop(SR), dry = E.measure(loop, SR, T, 1, 0); let worst = -Infinity, at = '';
  for (let s = 0; s <= 1.0001; s += 0.05) for (const W of [0, 6, 12]) { const m = E.measure(loop, SR, T, Math.min(1, s), W), pk = m.peak + (dry.rms - m.rms); if (pk > worst) { worst = pk; at = `s ${s.toFixed(2)}, knee ${W}`; } }
  check('loudness matched, every slope and knee peaks at or under −6 dBFS', worst <= B.PEAK + 1e-6, `highest peak ${worst.toFixed(2)} dBFS at ${at}`);
}

// 13 · the reveal names a ruler only when the answers carry one (the challenger's case first: all five "barely")
{
  const cases = [
    [[1, 1, 1, 1, 1], 'check-failed', 'all barely, the check failed'],
    [[0, 0, 0, 0, 0], 'flat', 'all the same: not even 1:1 to 2:1 heard'],
    [[3, 2, 0, 0, 0], 'neither', 'neither small step heard'],
    [[3, 2, 1, 1, 0], 'slope', 'the two 0.05 steps tied, 1/2 above'],
    [[3, 2, 2, 1, 0], 'slope', 'within one notch'],
    [[3, 2, 0, 2, 0], 'none', 'the step to ∞ two notches above 10/20'],
    [[1, 1, 1, 2, 0], 'none', 'the step to ∞ above 1:1 to 2:1'],
  ];
  const bad = cases.filter(([a, want]) => E.rulerOf(a) !== want).map(([a, want, why]) => `${why}: got ${E.rulerOf(a)}, want ${want}`);
  check('the reveal names the slope’s ruler only when the check held, 1/2 beat 20/∞, and 20/∞ sat within one notch of 10/20', bad.length === 0, bad.length ? bad.join('; ') : `${cases.length} cases, the all-“barely” one included`);
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
