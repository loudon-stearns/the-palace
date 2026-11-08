// Compressor Design — rich — check.mjs
// born: 2026-11-03 · checks [[Compressor Design]]'s three rich-face pieces: "the window you can hear",
// "one ring two clocks" and "the knee in the spectrum"
// forward_vector: I re-run, headless, every claim the three pieces make about their own engines and about
// the sections they serve: that the ring's running sum is the window's sum and lets go of the first sample in;
// that 100, 500 and 1000 samples sort from twitchy to sluggish on the two measures the piece shows; that the
// window's attack and release are one straight shape and slide~'s never arrive; that the ring's exit is the
// sample the sum subtracts and a comb at 500 slots; and that the quadratic knee's harmonics fall faster than
// the corner's but do not stop, while a cubic's do. What a listener hears I cannot check.
//
//   node "Projects/Compressor Design/Compressor Design — rich — check.mjs"
//
// It pulls each page's core <script id="…-core"> out of the HTML, runs it in a Node sandbox, and compares
// against equations written here on their own. PASS/FAIL per claim, INFO for numbers worth reading; exits 1
// on any FAIL. Reads only; writes nothing.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const core = (file, id, name) => {
  const html = readFileSync(join(HERE, `Compressor Design — rich — ${file}.html`), 'utf8');
  const m = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`));
  if (!m) throw new Error(`no <script id="${id}"> in ${file}`);
  const E = { Math, Float64Array, Float32Array, Int32Array, JSON, Number, String, Object, Array, isFinite };
  vm.createContext(E); vm.runInContext(m[1] + `\nthis.${name} = ${name};`, E);
  return E[name];
};
const CD = core('the window you can hear', 'cd-core', 'CD');
const RB = core('one ring two clocks', 'rb-core', 'RB');
const KN = core('the knee in the spectrum', 'kn-core', 'KN');

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const info = (name, detail) => console.log(`INFO  ${name}  (${detail})`);
const SR = 44100;

// ── the page's curve, written here on its own (Compressor Design § Soft Knee Mathematics, levels in dB) ──
function own(x, T, R, W) {
  if (x < T - W / 2) return x;                                       // below: output = input
  if (x > T + W / 2) return T + (x - T) / R;                         // above: output = T + (in − T)/R
  return x + (1 / R - 1) * (x - T + W / 2) ** 2 / (2 * W);           // in the knee
}

console.log('— the window you can hear —');
// 1 · the ring lets go of the first sample in, and its running sum is the window's sum
{
  const N = 16, ring = new Float64Array(N); let w = 0, S = 0, order = true, worst = 0; const x = [];
  for (let n = 0; n < 400; n++) {
    const v = Math.sin(n * 0.37) + 0.1 * (n % 7); x.push(v); const q = v * v, out = ring[w];
    if (n >= N && Math.abs(out - x[n - N] ** 2) > 0) order = false;   // what leaves is x[n−N]², the oldest
    S += q - out; ring[w] = q; w = (w + 1) % N;
    let direct = 0; for (let k = Math.max(0, n - N + 1); k <= n; k++) direct += x[k] ** 2; worst = Math.max(worst, Math.abs(S - direct));
  }
  check('the slot that leaves is the first one in (FIFO), x[n−N]²', order, '384 samples through a 16-slot ring, every exit compared with the input N back');
  check('add the newest, subtract the oldest = the sum of the last N squares', worst < 1e-12, `worst gap ${worst.toExponential(2)}`);
}
// 2 · the piece's own compressor uses that ring: its level equals √(mean of the last N squares)
{
  const x = CD.makeLoop(), N = 500, r = CD.compress(x, N, { loop: false }); let worst = 0;
  for (const n of [600, 12345, 44100, 70000, 88199]) { let a = 0; for (let k = n - N + 1; k <= n; k++) a += x[k] * x[k]; worst = Math.max(worst, Math.abs(r.lev[n] - 10 * Math.log10(a / N + 1e-24))); }
  check('the piece’s detector level is the RMS of the last 500 samples', worst < 1e-6, `worst gap ${worst.toExponential(2)} dB at five points of the loop`);
}
// 3 · the page's numbers in time
check('500 samples at 44.1 kHz is 11 ms', Math.abs(500 / SR * 1000 - 11.34) < 0.01, `${(500 / SR * 1000).toFixed(2)} ms; 100 → ${(100 / SR * 1000).toFixed(2)}, 1000 → ${(1000 / SR * 1000).toFixed(2)}`);
// 4 · twitchy and sluggish, as the piece measures them
{
  const m = [100, 500, 1000].map((N) => ({ N, wob: CD.wobble(N), grab: CD.grab(N) }));
  check('gain wobble on a 55 Hz note falls 100 → 500 → 1000 (twitchy end at 100)', m[0].wob > m[1].wob && m[1].wob > m[2].wob, m.map((v) => `${v.N}: ${v.wob.toFixed(2)} dB`).join(', '));
  check('time to grab a sudden tone grows 100 → 500 → 1000 (sluggish end at 1000)', m[0].grab < m[1].grab && m[1].grab < m[2].grab, m.map((v) => `${v.N}: ${v.grab.toFixed(2)} ms`).join(', '));
}
// 5 · the hint: windows that hold a whole cycle of the wobble
{
  const w = (N, f) => CD.wobble(N, f);
  check('401 and 802 all but cancel the 55 Hz wobble; 300 and 601 the 73 Hz one', w(401, 55) < 0.05 && w(802, 55) < 0.05 && w(300, 73.42) < 0.1 && w(601, 73.42) < 0.1,
    `55 Hz: 401 → ${w(401, 55).toFixed(3)}, 802 → ${w(802, 55).toFixed(3)} dB; 73.42 Hz: 300 → ${w(300, 73.42).toFixed(3)}, 601 → ${w(601, 73.42).toFixed(3)} dB; against 500 → ${w(500, 55).toFixed(2)} dB`);
}
// 6 · attack and release: one straight shape for the window, a tail for slide~
{
  const N = 500, s = CD.stepShape(N), at = (arr, n) => arr[n - s.from];
  let straight = 0; for (let n = 0; n < N; n++) straight = Math.max(straight, Math.abs(at(s.box, n) - (n + 1) / N));
  check('the window climbs in a straight line and is full at exactly N', straight < 1e-12 && at(s.box, N - 1) === 1 && at(s.box, N - 2) < 1, `worst gap from (n+1)/N ${straight.toExponential(1)}`);
  check('the window lets go in a straight line and is empty exactly N after the tone stops', at(s.box, 3 * N - 1) === 0 && at(s.box, 3 * N - 2) > 0, `at +${N}: ${at(s.box, 3 * N - 1)}`);
  const n90 = s.exp.findIndex((v) => v >= 0.9) + s.from, after1 = 10 * Math.log10(at(s.exp, 3 * N - 1)), after2 = 10 * Math.log10(at(s.exp, 4 * N - 1));
  check('slide~ is tuned to reach 90% at the same sample (0.9 N), s = 196 for N = 500', Math.abs(n90 - (0.9 * N - 1)) <= 1 && Math.round(CD.slideFor(N)) === 196, `90% at sample ${n90}; s = ${CD.slideFor(N).toFixed(2)}`);
  check('slide~ never arrives or forgets: −11 dB at +500 and −22 dB at +1000 after the tone stops', Math.abs(after1 + 11.1) < 0.2 && Math.abs(after2 + 22.2) < 0.2 && at(s.exp, 2 * N - 1) < 1, `${after1.toFixed(2)} dB, ${after2.toFixed(2)} dB; at the window's full point ${at(s.exp, N - 1).toFixed(4)}`);
}
// 7 · every version is matched in level
{
  const x = CD.makeLoop(); let worst = 0, capped = 0;
  for (const N of [100, 500, 1000, 16, 4096]) { const m = CD.matched(CD.compress(x, N).y); const st = CD.stats(m.buf); if (m.capped) capped++; else worst = Math.max(worst, Math.abs(20 * Math.log10(st.rms) + 20)); }
  check('the three test windows and the knob’s ends play at −20 dB RMS', worst < 0.01 && capped === 0, `worst ${worst.toFixed(4)} dB off, ${capped} held down by the peak cap`);
}
// 8 · the curve the compressor uses is the page's
{
  let worst = 0; for (const R of [1.5, 2, 4, 8, 20]) for (const W of [1, 6, 12]) for (let x = -60; x <= 0; x += 0.1) worst = Math.max(worst, Math.abs(CD.curve(x, -30, R, W) - own(x, -30, R, W)));
  check('the window piece’s curve is the page’s three regions', worst < 1e-9, `worst gap ${worst.toExponential(2)} dB`);
}
// INFO · what the running sum's round-off costs over ten minutes, in 64-bit (Gen~) and 32-bit
{
  const r = CD.rng(3), N = 500, n = 10 * 60 * SR; const ring64 = new Float64Array(N), ring32 = new Float32Array(N); let S64 = 0, S32 = Math.fround(0), w = 0, exact = 0; const last = new Float64Array(N);
  for (let i = 0; i < n; i++) { const v = r() * 2 - 1, q = v * v; S64 += q - ring64[w]; ring64[w] = q; const q32 = Math.fround(q); S32 = Math.fround(Math.fround(S32 + q32) - ring32[w]); ring32[w] = q32; last[w] = q; w = (w + 1) % N; }
  for (let i = 0; i < N; i++) exact += last[i];
  info('round-off in the running sum after ten minutes of full-scale noise, 500 slots', `64-bit: ${(Math.abs(S64 - exact) / exact).toExponential(1)} of the sum; 32-bit: ${(Math.abs(S32 - exact) / exact).toExponential(1)}`);
}

console.log('— one ring two clocks —');
{
  const x = RB.makePhrase(), N = 500, r = RB.ring(x, N); let bad = 0, worst = 0;
  for (let i = N; i < x.length; i++) if (r.exit[i] !== x[i - N]) bad++;
  for (const n of [600, 22050, 44100, 100000]) { let a = 0; for (let k = n - N + 1; k <= n; k++) a += x[k] * x[k]; worst = Math.max(worst, Math.abs(r.lev[n] - Math.sqrt(a / N))); }
  check('what leaves the ring is x[n − N], the slot the sum subtracts', bad === 0, `${bad} mismatches over ${x.length - N} samples`);
  check('the same ring’s sum is the detector’s RMS', worst < 1e-6, `worst gap ${worst.toExponential(2)}, the running sum’s round-off read through a square root in the phrase’s rests`);
  // the comb, from its impulse response 0.5 δ[n] + 0.5 δ[n − N], written here on its own
  const H = (f) => Math.hypot(0.5 + 0.5 * Math.cos(2 * Math.PI * f * N / SR), 0.5 * Math.sin(2 * Math.PI * f * N / SR));
  check('at 500 slots, half and half is a comb: notches at 44.1 Hz and every 88.2 Hz', H(44.1) < 1e-9 && H(132.3) < 1e-9 && Math.abs(H(88.2) - 1) < 1e-9 && Math.abs(RB.combGain(300, N) - H(300)) < 1e-9,
    `|H| at 44.1 → ${H(44.1).toExponential(1)}, 132.3 → ${H(132.3).toExponential(1)}, 88.2 → ${H(88.2).toFixed(3)}; the piece draws |cos(π f N / SR)|`);
  check('44 100 slots is one second, a half note at 120 bpm', 44100 / SR === 1 && 2 * 60 / 120 === 1, '1 s; two beats of 0.5 s');
  let worstL = 0; const lv = [];
  for (const [n, wet] of [[64, 1], [500, 0], [500, 1], [2329, 1], [22050, 1], [44100, 1]]) { const m = RB.mix(x, RB.ring(x, n).exit, wet); let a = 0; for (const v of m) a += v * v; const L = 10 * Math.log10(a / m.length); lv.push(L.toFixed(2)); worstL = Math.max(worstL, Math.abs(L + 24)); }
  check('the phrase, alone or with what leaves the ring, plays at −24 dB RMS at every length', worstL < 0.01, `six renders: ${lv.join(', ')} dB`);
}

console.log('— the knee in the spectrum —');
const T = -18;
{
  let worst = 0; for (const R of [0.5, 1, 2, 4, 20]) for (const W of [0, 1, 6, 24]) for (let x = -60; x <= 6; x += 0.05) if (W > 0 || Math.abs(x - T) > 1e-9) worst = Math.max(worst, Math.abs(KN.curve(x, T, R, W) - own(x, T, R, W === 0 ? 1e-12 : W)));
  check('the knee piece’s curve is the page’s three regions', worst < 1e-6, `worst gap ${worst.toExponential(2)} dB, ratios 0.5 to 20, widths 0 to 24`);
  let jump = 0, kink = 0; const d = 1e-6;
  for (const R of [0.5, 2, 4, 8]) for (const W of [1, 6, 12]) for (const e of [T - W / 2, T + W / 2]) {
    jump = Math.max(jump, Math.abs(own(e + d, T, R, W) - own(e - d, T, R, W)));
    const sl = (x) => (own(x + d, T, R, W) - own(x - d, T, R, W)) / (2 * d); kink = Math.max(kink, Math.abs(sl(e + 10 * d) - sl(e - 10 * d)));
  }
  check('the knee meets both lines with no jump and no kink: slope 1 in, 1/R out', jump < 1e-5 && kink < 1e-3, `worst jump ${jump.toExponential(1)} dB, worst slope change ${kink.toExponential(1)}`);
  // the drawing program's rounded corner: a quadratic Bézier whose control point is the hard corner
  let bz = 0; for (const R of [2, 4, 8]) for (const W of [2, 6, 12]) for (let t = 0; t <= 1; t += 0.01) {
    const P0 = [T - W / 2, T - W / 2], P1 = [T, T], P2 = [T + W / 2, T + W / (2 * R)];
    const bx = (1 - t) ** 2 * P0[0] + 2 * t * (1 - t) * P1[0] + t * t * P2[0], by = (1 - t) ** 2 * P0[1] + 2 * t * (1 - t) * P1[1] + t * t * P2[1];
    bz = Math.max(bz, Math.abs(own(bx, T, R, W) - by));
  }
  check('the knee is the quadratic Bézier with the hard corner as control point', bz < 1e-9, `worst gap ${bz.toExponential(2)} dB`);
}
{
  const row = (o) => { const b = KN.harmonics(o); return { f: KN.fall(b), top: KN.reach(b), h255: KN.dB(b[255]) }; };
  const hard = [-6, -12, -17].map((P) => row({ T, R: 4, W: 0, P })), soft = [];
  for (const P of [-6, -12]) for (const W of [3, 6, 12, 24]) soft.push({ P, W, ...row({ T, R: 4, W, P }) });
  check('a hard corner: harmonics fall about 12 dB per octave (1/k²)', hard.every((r) => r.f < -10.5 && r.f > -12.5), hard.map((r) => r.f.toFixed(2)).join(', ') + ' dB/oct at peaks −6, −12, −17 dB');
  check('the quadratic knee: harmonics fall faster, 15 to 20 dB per octave (1/k³ is 18)', soft.every((r) => r.f < -15 && r.f > -20), soft.map((r) => `W ${r.W}, peak ${r.P}: ${r.f.toFixed(1)}`).join('; '));
  check('the knee’s harmonics do not stop: a harmonic above −140 dB near the 255th, every width', soft.every((r) => r.top >= 237), soft.map((r) => `W ${r.W}: harmonic ${r.top}, the 255th at ${r.h255.toFixed(0)} dB`).join('; '));
  { const b0 = KN.harmonics({ T, R: 4, W: 0, P: -6 }), b1 = KN.harmonics({ T, R: 4, W: 1, P: -6 }), d31 = KN.dB(b1[31]) - KN.dB(b0[31]), d255 = KN.dB(b1[255]) - KN.dB(b0[255]);
    check('a 1 dB knee hardly moves the low harmonics; the steeper fall shows near the top', Math.abs(d31) < 1 && d255 < -10, `against the corner: 31st ${d31.toFixed(1)} dB, 255th ${d255.toFixed(1)} dB`); }
  { const y = KN.tone({ T, R: 1, W: 0, P: -6 }), n = y.length; let inside = 0;
    for (let i = 1; i < n - 1; i++) inside = Math.max(inside, Math.abs(y[i + 1] - 2 * y[i] + y[i - 1]));
    const seam = Math.abs(y[0] - 2 * y[n - 1] + y[n - 2]);
    check('the looped tone is whole cycles, so its seam has no corner of its own', n % 400 === 0 && seam <= inside * 1.01, `${n} samples = ${n / 400} cycles; second difference at the seam ${seam.toExponential(2)}, largest inside ${inside.toExponential(2)}`); }
  const cub = row({ kind: 'cubic', P: -6 });
  check('a cubic stops: nothing above the 3rd harmonic', cub.top === 3, `highest above −140 dB: ${cub.top}`);
  const below = row({ T, R: 4, W: 6, P: -24 });
  check('a tone under the threshold comes out pure', below.top === 1, `highest above −140 dB: ${below.top}`);
  info('the hard corner beside the knee at the 255th harmonic, peak −6 dB, R = 4', `corner ${hard[0].h255.toFixed(0)} dB; knee W 6: ${soft[1].h255.toFixed(0)} dB`);
}
{
  // the edges
  const inf = KN.curve(-6, T, Infinity, 0), sl = (x, R) => (KN.curve(x + 1e-6, T, R, 0) - KN.curve(x - 1e-6, T, R, 0)) / 2e-6;
  check('R = ∞: the curve is flat above the threshold (a clamp), and its slope is the step, 1 then 0', inf === T && Math.abs(sl(T - 1, Infinity) - 1) < 1e-6 && Math.abs(sl(T + 1, Infinity)) < 1e-6, `out at −6 dB in: ${inf} dB; slope ${sl(T - 1, Infinity).toFixed(3)} below, ${sl(T + 1, Infinity).toFixed(3)} above`);
  check('R = 0: 1 ÷ R is infinite and nothing plays', !isFinite(KN.curve(-6, T, 0, 6)) && KN.tone({ T, R: 0, W: 6, P: -6 }) === null, `curve at −6 dB in: ${KN.curve(-6, T, 0, 6)}; tone: ${KN.tone({ T, R: 0, W: 6, P: -6 })}`);
  const up = KN.curve(-6, T, 0.5, 6) - -6, under = KN.curve(-30, T, 0.5, 6) - -30;
  check('R < 1: louder out than in above the threshold, untouched below it (upward expansion)', up > 0 && under === 0, `at −6 dB in: +${up.toFixed(2)} dB; at −30 dB in: ${under} dB`);
  const raw = (x, W) => x + (1 / 4 - 1) * (x - T + W / 2) ** 2 / (2 * W);
  check('W = 0: the knee term alone is 0 ÷ 0, so the hard corner needs a branch', Number.isNaN(raw(T, 0)), `knee term at the threshold with W = 0: ${raw(T, 0)}`);
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
