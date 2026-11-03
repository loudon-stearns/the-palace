// Exponential Decay Curvature — rich — check.mjs
// born: 2026-11-03 · checks the four made pieces of [[Exponential Decay Curvature]]'s rich face
// forward_vector: I re-run, headless, every claim the four pieces make about their own engines and about the
// sections they serve: where the closed form fails near zero curvature and that the Taylor branch removes it;
// that harmonic levels follow 1 ÷ √(c² + (2πn)²) and do not depend on the sign of curvature; how much each
// oscillator aliases; that a Moog stage cut at its switch point is the entry's curve at c = −ln(1 − L); and the
// heard-rise landmarks. What a listener hears I cannot check.
//
//   node "Exponential Decay Curvature/Exponential Decay Curvature — rich — check.mjs"
//
// It pulls each page's core and worklet <script> blocks out of the HTML, runs them in Node (the worklets with a
// stand-in AudioWorkletProcessor), and compares against equations written here on their own. PASS/FAIL per
// claim, with the measured numbers; exits 1 on any FAIL. Reads only; writes nothing.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const SR = 48000;
let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const section = (s) => console.log(`\n── ${s}`);
function load(file, coreId, workletId) {
  const html = readFileSync(join(HERE, `Exponential Decay Curvature — rich — ${file}.html`), 'utf8');
  const block = (id) => { const m = html.match(new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)</script>`)); if (!m) throw new Error(`no <script id="${id}"> in ${file}`); return m[1]; };
  const sb = { Math, Float64Array, Float32Array, Uint8Array, sampleRate: SR, registered: null };
  sb.AudioWorkletProcessor = class { constructor() { this.port = { onmessage: null, sent: [], postMessage(m) { this.sent.push(m); } }; } };
  sb.registerProcessor = (n, cls) => { sb.registered = cls; };
  vm.createContext(sb);
  vm.runInContext(block(coreId) + (workletId ? '\n' + block(workletId) : ''), sb);
  return sb;
}
function run(sb, msgs, seconds) {
  const p = new sb.registered(); msgs.forEach((m) => p.port.onmessage({ data: m }));
  const n = Math.round(seconds * SR), out = new Float32Array(n);
  for (let o = 0; o < n; o += 128) { const k = Math.min(128, n - o), l = new Float32Array(k), r = new Float32Array(k); p.process([], [[l, r]]); out.set(l, o); }
  return { p, out };
}
// the curve, written here on its own (64-bit, expm1, the straight line at 0)
const fOwn = (t, c) => c === 0 ? 1 - t : (Math.expm1(-c * t) - Math.expm1(-c)) / (-Math.expm1(-c));

// ───────────────────────────────────────────────────────────── the straight line
section('the straight line · "The straight line is the hard case"');
{
  const E = load('the straight line', 'edc-line-core', 'edc-line-worklet');
  let w = 0; for (const c of [-9e-4, -1e-5, 1e-7, 3e-4, 9.9e-4]) for (let i = 0; i <= 1000; i++) w = Math.max(w, Math.abs(E.fTaylor(i / 1000, c) - fOwn(i / 1000, c)));
  check('the Taylor branch matches the curve inside its edge |c| < 0.001', w < 1e-11, `worst ${w.toExponential(1)}`);
  let lim = 0; for (const c of [1e-2, 1e-3, 1e-4]) { const q = E.parts(0.5, c); lim = Math.max(lim, Math.abs(q.num / q.den - 0.5)); }
  check('top ÷ bottom at the midpoint goes to 0.5 as curvature goes to 0 (L’Hôpital)', lim < 2.6e-3 && Math.abs(E.parts(0.5, 1e-4).num / E.parts(0.5, 1e-4).den - 0.5) < 3e-5, `gap at c = 0.01: ${Math.abs(E.parts(0.5, 1e-2).num / E.parts(0.5, 1e-2).den - 0.5).toExponential(1)}, at 1e-4: ${Math.abs(E.parts(0.5, 1e-4).num / E.parts(0.5, 1e-4).den - 0.5).toExponential(1)}`);
  const at = (c, b) => E.closedError(c, b, 1000);
  const z64 = at(0, 64), z32 = at(0, 32);
  check('closed form at curvature exactly 0 is 0 ÷ 0 at every point, 32- and 64-bit', z64.nan === z64.of && z32.nan === z32.of, `${z64.nan}/${z64.of} and ${z32.nan}/${z32.of}`);
  const s32 = at(3.2e-5, 32), n32 = at(2.9e-8, 32), k32 = at(3.1e-8, 32), s64 = at(3e-14, 64), n64 = at(5e-17, 64), ok64 = at(1e-12, 64);
  check('32-bit: off by more than 0.001 below about 3 × 10^−5', s32.worst > 1e-3 && at(1e-4, 32).worst < 1e-3, `at 3.2e-5 worst ${s32.worst.toExponential(1)}, at 1e-4 ${at(1e-4, 32).worst.toExponential(1)}`);
  check('32-bit: 0 ÷ 0 everywhere below about 3 × 10^−8', n32.nan === n32.of && k32.nan === 0, `at 2.9e-8 ${n32.nan}/${n32.of}, at 3.1e-8 ${k32.nan}`);
  check('64-bit: off by more than 0.001 below about 3 × 10^−14, clean at 10^−12', s64.worst > 1e-3 && ok64.worst < 1e-4, `at 3e-14 worst ${s64.worst.toExponential(1)}, at 1e-12 ${ok64.worst.toExponential(1)}`);
  check('64-bit: 0 ÷ 0 everywhere below about 10^−16', n64.nan === n64.of && at(2e-16, 64).nan === 0, `at 5e-17 ${n64.nan}/${n64.of}, at 2e-16 ${at(2e-16, 64).nan}`);
  // the worklet: a smoothed knob parked on 0, and a sweep through 0
  const tally = (r) => ({ nan: r.p.totNan + r.p.nan, bad: r.p.totBad + r.p.bad });
  const park = (bits, branch) => tally(run(E, [{ mode: 'osc', bits, branch, smooth: true, c: 2 }, { target: 0 }], 4));
  const P32 = park(32, false), P64 = park(64, false), B32 = park(32, true), B64 = park(64, true);
  check('parked on 0, closed form: 0 ÷ 0 for as long as it rests, in 32 and 64 bit', P32.nan > 2.5 * SR && P64.nan > 2.5 * SR, `of ${4 * SR} samples: 32-bit ${P32.nan} NaN + ${P32.bad} off; 64-bit ${P64.nan} NaN + ${P64.bad} off`);
  check('parked on 0, with the Taylor branch: nothing wrong, in 32 and 64 bit', B32.nan + B32.bad + B64.nan + B64.bad === 0, `32-bit ${B32.nan}+${B32.bad}, 64-bit ${B64.nan}+${B64.bad}`);
  const sweep = (bits, branch) => tally(run(E, [{ mode: 'osc', bits, branch, smooth: true, c: 0 }, { sweep: { amp: 4, rate: 0.25 } }], 16));
  const S32 = sweep(32, false), S64 = sweep(64, false), SB = sweep(32, true);
  check('sweeping through 0 (±4 at 0.25 Hz, 8 crossings): 64-bit closed form is clean', S64.nan + S64.bad === 0, `${S64.nan} NaN, ${S64.bad} off`);
  check('sweeping through 0: 32-bit closed form at most a few bad samples a crossing; the branch none', S32.nan + S32.bad <= 8 * 10 && SB.nan + SB.bad === 0, `32-bit closed ${S32.nan} NaN + ${S32.bad} off by > 0.001 over 8 crossings; with branch ${SB.nan + SB.bad}`);
  const env = run(E, [{ mode: 'env' }], 4.8).out; let pk = 0, bad = 0; for (const v of env) { if (!isFinite(v)) bad++; pk = Math.max(pk, Math.abs(v)); }
  check('step 1 plays the three members as fades, finite and under full scale', bad === 0 && pk > 0.2 && pk < 0.5, `peak ${pk.toFixed(3)}`);
}

// ───────────────────────────────────────────────────────────── curvature is timbre
section('curvature is timbre · "Audio-rate feasibility — and the dissolution"');
let ALIAS;
{
  const E = load('curvature is timbre', 'edc-timbre-core', 'edc-timbre-worklet');
  let w = 0; for (const c of [0, 3, 12, 40]) { const L = E.measuredLevels(c, 32, 16384); for (let n = 1; n <= 32; n++) w = Math.max(w, Math.abs(L[n - 1] / E.harmonic(c, n) - 1)); }
  check('harmonic levels follow 1 ÷ √(c² + (2πn)²)', w < 2e-3, `worst relative gap over n = 1–32, c = 0, 3, 12, 40: ${w.toExponential(1)}`);
  let sym = 0; for (const c of [0.5, 3, 12, 40]) for (let i = 0; i <= 1000; i++) { const t = i / 1000; sym = Math.max(sym, Math.abs(E.fShape(t, -c) - (1 - E.fShape(1 - t, c)))); }
  check('f(t, −c) = 1 − f(1 − t, c): concave is convex turned half round', sym < 1e-12, `worst ${sym.toExponential(1)}`);
  let sd = 0; for (const c of [1, 8, 30]) { const a = E.measuredLevels(c, 24, 8192), b = E.measuredLevels(-c, 24, 8192); for (let n = 0; n < 24; n++) sd = Math.max(sd, Math.abs(20 * Math.log10(a[n] / b[n]))); }
  check('measured harmonic levels are the same for +c and −c', sd < 1e-6, `worst ${sd.toExponential(1)} dB`);
  check('the step-2 meter: a sawtooth’s harmonic 1 over harmonic 8 is 18.1 dB', Math.abs(20 * Math.log10(E.harmonic(0, 1) / E.harmonic(0, 8)) - 18.06) < 0.01, `${(20 * Math.log10(E.harmonic(0, 1) / E.harmonic(0, 8))).toFixed(2)} dB`);
  const A = (f0, c, m) => E.aliasMeasure(f0, c, m, SR, 16384).db;
  ALIAS = {}; for (const f0 of [440, 1760, 3520]) for (const c of [0, 20, 60]) ALIAS[`${f0}|${c}`] = [0, 1, 2, 3].map((m) => A(f0, c, m));
  console.log('      folded ÷ harmonic power, dB          naive   PolyBLEP  +BLAMP   4×OS');
  for (const k of Object.keys(ALIAS)) { const [f0, c] = k.split('|'); console.log(`      ${f0.padStart(4)} Hz, curvature ${c.padStart(2)}             ${ALIAS[k].map((v) => v.toFixed(1).padStart(7)).join('  ')}`); }
  const r = (f0, c) => ALIAS[`${f0}|${c}`];
  check('naive: the alias grows with curvature (1760 Hz)', r(1760, 0)[0] < r(1760, 20)[0] && r(1760, 20)[0] < r(1760, 60)[0], `${r(1760, 0)[0].toFixed(1)} → ${r(1760, 20)[0].toFixed(1)} → ${r(1760, 60)[0].toFixed(1)} dB`);
  check('at curvature 0 (a sawtooth) PolyBLEP takes more than 10 dB off, and BLAMP adds nothing', r(1760, 0)[0] - r(1760, 0)[1] > 10 && Math.abs(r(1760, 0)[1] - r(1760, 0)[2]) < 0.2, `${r(1760, 0)[0].toFixed(1)} → ${r(1760, 0)[1].toFixed(1)} → ${r(1760, 0)[2].toFixed(1)} dB`);
  check('at curvature 60, PolyBLEP leaves at least 10 dB more alias than at 0', r(1760, 60)[1] - r(1760, 0)[1] > 10, `${r(1760, 0)[1].toFixed(1)} vs ${r(1760, 60)[1].toFixed(1)} dB`);
  check('at curvature 60, PolyBLAMP takes more off than PolyBLEP alone', r(1760, 60)[2] < r(1760, 60)[1] - 5, `${r(1760, 60)[1].toFixed(1)} → ${r(1760, 60)[2].toFixed(1)} dB`);
  check('4× oversampling is the lowest everywhere measured', Object.values(ALIAS).every((v) => v[3] < Math.min(v[0], v[1], v[2]) - 15), `worst 4×OS ${Math.max(...Object.values(ALIAS).map((v) => v[3])).toFixed(1)} dB`);
  // the worklet is the same engine
  const W = run(E, [{ kind: 'osc', f0: 1760, c: 60, mode: 3 }], 0.5).out, o = E.makeOsc(SR); let gap = 0, pk = 0;
  for (let i = 0; i < W.length; i++) { const v = 0.3 * 2 * o.next(1760, 60, 3); gap = Math.max(gap, Math.abs(W[i] - v)); pk = Math.max(pk, Math.abs(W[i])); }
  check('the worklet plays the engine the meter measures', gap < 1e-6 && pk < 1, `worst gap ${gap.toExponential(1)}, peak ${pk.toFixed(3)}`);
  const ph = run(E, [{ kind: 'phasor', f0: 110 }], 0.2).out; let pmn = 1, pmx = -1; for (const v of ph) { pmn = Math.min(pmn, v); pmx = Math.max(pmx, v); }
  check('step 1 plays the phasor alone, a ramp between −0.3 and 0.3', pmn > -0.301 && pmx < 0.301 && pmx - pmn > 0.59, `${pmn.toFixed(3)} to ${pmx.toFixed(3)}`);
}

// ───────────────────────────────────────────────────────────── the RC contour
section('the RC contour · "The curve in a synthesizer: the Moog contour"');
{
  const E = load('the RC contour', 'edc-contour-core', 'edc-contour-worklet');
  let w = 0, rows = [];
  for (const T of [0.05, 0.6, 3]) for (const L of [0.95, 0.5, 0.1, 0.02]) { const r = E.attackVersusMember(T, L, SR); w = Math.max(w, r.worst); if (T === 0.6) rows.push(`L ${L} → c ${r.c.toFixed(3)}`); }
  check('an attack cut at its switch L and rescaled is 1 − f(x, c) with c = −ln(1 − L)', w < 1e-9, `worst gap ${w.toExponential(1)} over T = 0.05, 0.6, 3 s; ${rows.join(', ')}`);
  check('the 95 % landmark is curvature 3', Math.abs(E.memberC(0.95) - 3) < 0.005, `c = ${E.memberC(0.95).toFixed(4)} (exactly 3 is L = 1 − e^−3 = ${(1 - Math.exp(-3)).toFixed(4)})`);
  const dv = E.decayVersusMember(0.9, 0.5, SR).worst;
  check('a decay cut at its 95 % point and rescaled is f(x, 3)', dv < 1e-9, `worst gap ${dv.toExponential(1)}`);
  // the decay toward sustain is s + (1 − s)·e^(−t/τ), from a peak of 1
  { const e = E.makeContour(SR, 1); e.L = 0.95; e.tauA = 0.01; e.tauD = 0.3; e.s = 0.4; e.sigma = 0; e.gateOn(); while (e.stage === 'attack') e.next();
    const V0 = e.V / e.L; let g2 = 0; for (let n = 1; n <= SR; n++) { const y = e.next(); g2 = Math.max(g2, Math.abs(y - (0.4 + (V0 - 0.4) * Math.exp(-n / (0.3 * SR))))); }
    check('the decay is s + (1 − s)·e^(−t/τ), starting from the peak', g2 < 1e-9 && Math.abs(V0 - 1) < 1e-3, `peak ${V0.toFixed(5)}, worst gap ${g2.toExponential(1)}`); }
  // trip times: the switch at the maximum, decided by noise, against the switch at 0.95
  const trips = (L, sigma, N) => { const out = []; for (let k = 0; k < N; k++) { const e = E.makeContour(SR, 1000 + k); e.L = L; e.tauA = 0.25; e.sigma = sigma; e.gateOn(); let n = 0; while (e.stage === 'attack' && n < 30 * SR) { e.next(); n++; } out.push(e.trip === null ? Infinity : e.trip / 0.25); } return out; };
  const stat = (a) => { const f = a.filter(isFinite), m = f.reduce((x, y) => x + y, 0) / f.length; return { n: f.length, of: a.length, mean: m, min: Math.min(...f), max: Math.max(...f) }; };
  const t100 = stat(trips(1, 0.003, 40)), t95 = stat(trips(0.95, 0.003, 40)), t95q = stat(trips(0.95, 0, 3)), t100q = trips(1, 0, 1)[0];
  check('switch at 0.95, no noise: the stage ends at 3.00 τ', Math.abs(t95q.mean - E.memberC(0.95)) < 0.01, `${t95q.mean.toFixed(3)} τ`);
  check('switch at the maximum, no noise: the stage never ends', t100q === Infinity, 'no trip in 30 s');
  check('switch at the maximum, with noise: every note ends, and they wander far more than at 0.95', t100.n === t100.of && (t100.max - t100.min) > 4 * (t95.max - t95.min), `L 1: ${t100.min.toFixed(2)}–${t100.max.toFixed(2)} τ (mean ${t100.mean.toFixed(2)}); L 0.95: ${t95.min.toFixed(2)}–${t95.max.toFixed(2)} τ`);
  // the voice, and the worklet
  const o = E.makeVoice(SR); let s = 0; for (let i = 0; i < SR; i++) { const v = o.next(); if (i > 2000) s += v * v; }
  const rms = Math.sqrt(s / (SR - 2001));
  check('the voice is a filtered C3 sawtooth of the expected level', Math.abs(rms - 0.567) < 0.02, `RMS ${rms.toFixed(3)} against 0.567 from its harmonics`);
  const W = run(E, [{ tauA: 0.1, L: 0.95, sigma: 0, tauD: 0.2, s: 0.5, tauR: 0.2 }, { gate: 'on' }], 1).out; let pk = 0, bad = 0; for (const v of W) { if (!isFinite(v)) bad++; pk = Math.max(pk, Math.abs(v)); }
  check('the worklet plays a held note, finite and under full scale', bad === 0 && pk > 0.2 && pk < 1, `peak ${pk.toFixed(3)}`);
}

// ───────────────────────────────────────────────────────────── the heard rise
section('the heard rise · "How the ear takes the rise"');
{
  const E = load('the heard rise', 'edc-rise-core', null);
  const a = E.audibleClimb(E.riseLinear), m = E.audibleClimb(E.riseMoog);
  check('straight rise: audible climb from 0.03 T to 0.50 T (the text)', Math.abs(a[0] - 0.0316) < 5e-4 && Math.abs(a[1] - 0.501) < 5e-4, `${a[0].toFixed(4)} to ${a[1].toFixed(4)}`);
  check('Moog rise: audible climb from 0.01 T to 0.23 T (the text)', Math.abs(m[0] - 0.0107) < 5e-4 && Math.abs(m[1] - 0.2317) < 5e-4, `${m[0].toFixed(4)} to ${m[1].toFixed(4)}`);
  check('the straight climb is about twice the Moog one (the text)', Math.abs((a[1] - a[0]) / (m[1] - m[0]) - 2.1) < 0.1, `${((a[1] - a[0]) / (m[1] - m[0])).toFixed(2)}×`);
  let same = 0; for (let i = 0; i <= 850; i++) same = Math.max(same, Math.abs(E.riseRounded(i / 1000) - E.riseLinear(i / 1000)));
  const h = 1e-7, sl = (f, x) => (f(x + h) - f(x - h)) / (2 * h);
  const joinA = Math.abs(sl(E.riseRounded, 0.85) - 1), joinB = Math.abs(sl(E.riseRounded, 1.15)), endV = Math.abs(E.riseRounded(1.15) - 1);
  let mono = true; for (let i = 1; i <= 1400; i++) if (E.riseRounded(i / 1000) < E.riseRounded((i - 1) / 1000) - 1e-15) mono = false;
  check('the rounded rise is the straight rise until 0.85 T', same === 0, `worst gap ${same}`);
  check('it leaves at the straight rise’s slope and lands flat at full at 1.15 T, never falling', joinA < 1e-6 && joinB < 1e-6 && endV < 1e-12 && mono, `slope gap at 0.85: ${joinA.toExponential(1)}, slope at 1.15: ${joinB.toExponential(1)}`);
  const eqText = (x) => x - (x - 0.85) ** 2 / 0.6; let eqg = 0; for (let i = 850; i <= 1150; i++) eqg = Math.max(eqg, Math.abs(eqText(i / 1000) - E.riseRounded(i / 1000)));
  check('the step-4 equation, t ÷ T − (t ÷ T − 0.85)² ÷ 0.6, is the engine’s rounded rise', eqg < 1e-12, `worst gap ${eqg.toExponential(1)}`);
  // the hiss level is set from the voice's RMS: render the band-limited sawtooth through the lowpass and measure it
  const C = E.RISE, w0 = 2 * Math.PI * C.CUT / SR, al = Math.sin(w0) / (2 * C.Q), cw = Math.cos(w0), a0 = 1 + al;
  const b0 = (1 - cw) / 2 / a0, b1 = (1 - cw) / a0, a1 = -2 * cw / a0, a2 = (1 - al) / a0; let z1 = 0, z2 = 0, s = 0, N = SR;
  for (let i = 0; i < N; i++) { let x = 0; for (let n = 1; n * C.F0 < SR / 2; n++) x += (2 / (Math.PI * n)) * Math.sin(2 * Math.PI * n * C.F0 * i / SR) * (n % 2 ? 1 : -1); const y = b0 * x + z1; z1 = b1 * x - a1 * y + z2; z2 = b0 * x - a2 * y; if (i > 2000) s += y * y; }
  const rms = Math.sqrt(s / (N - 2001));
  check('the hiss is set 30 dB under the voice: the voice’s RMS constant matches a render', Math.abs(rms - C.SAW_RMS) / C.SAW_RMS < 0.03, `rendered ${rms.toFixed(3)}, constant ${C.SAW_RMS}`);
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
