// Auditory Illusions — rich — check — in-the-air.mjs
// born: 2026-11-08 · checks [[Auditory Illusions]]'s rich-face piece for "In the air — the baseline":
// "Auditory Illusions — rich — beats and moiré.html"
// forward_vector: I re-run, headless, every claim the beats-and-moiré piece makes about the sound and the cloth:
// that the outline of 440 + (440 + Δf) Hz swells at exactly Δf, from half a hertz to 150, so nothing in the air
// changes kind where hearing does; that the sum holds no energy at the difference and a rectified copy does; that
// ink on ink keeps a band after blur and light on light doesn't; that the coupled pair the piece plays equals two
// Kuramoto oscillators integrated directly, slips at √(Δf² − (K/2π)²) and locks at K = Δω; that the piece's own
// rate estimator reads the scope truly; that its loops have no seam; and what the hidden test scale covers. What a
// listener hears I cannot check.
//
//   node "Auditory Illusions/Auditory Illusions — rich — check — in-the-air.mjs"
//
// It pulls <script id="ai-core"> out of the piece, runs it in a Node sandbox, and compares against equations
// written here on their own. PASS/FAIL per claim, INFO for numbers worth reading; exits 1 on any FAIL. Reads only.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(HERE, 'Auditory Illusions — rich — beats and moiré.html'), 'utf8');
const m = html.match(/<script id="ai-core">([\s\S]*?)<\/script>/); if (!m) throw new Error('no <script id="ai-core">');
const E = { Math, Float64Array, Float32Array, Number, Array, Infinity };
vm.createContext(E); vm.runInContext(m[1] + '\nthis.AI = AI;', E);
const AI = E.AI, TAU = 2 * Math.PI, F1 = AI.F1, A = AI.A;

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const info = (name, detail) => console.log(`INFO  ${name}  (${detail})`);
const dB = (v) => 10 * Math.log10(Math.max(v, 1e-300));

// radix-2 FFT, in place (inverse by conjugation)
function fft(re, im, inv = false) {
  const n = re.length; if (inv) for (let i = 0; i < n; i++) im[i] = -im[i];
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let j = 0; j < len / 2; j++) { const k = i + j + len / 2, ur = re[i + j], ui = im[i + j], vr = re[k] * cr - im[k] * ci, vi = re[k] * ci + im[k] * cr; re[i + j] = ur + vr; im[i + j] = ui + vi; re[k] = ur - vr; im[k] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } }
  if (inv) for (let i = 0; i < n; i++) { re[i] /= n; im[i] = -im[i] / n; }
}
const SR = 44100, N = 1 << 18;                      // 5.94 s
const pair = (df, n = N, sr = SR, p0 = 0) => { const x = new Float64Array(n); for (let i = 0; i < n; i++) { const t = i / sr; x[i] = A * Math.sin(TAU * F1 * t) + A * Math.sin(TAU * (F1 + df) * t + p0); } return x; };
// The outline by the analytic signal (Hilbert, through the FFT).
function hilbertEnv(x) { const n = x.length, re = Float64Array.from(x), im = new Float64Array(n); fft(re, im); for (let k = 1; k < n / 2; k++) { re[k] *= 2; im[k] *= 2; } for (let k = n / 2 + 1; k < n; k++) { re[k] = 0; im[k] = 0; } fft(re, im, true); const e = new Float64Array(n); for (let i = 0; i < n; i++) e[i] = Math.hypot(re[i], im[i]); return e; }
// How often an outline repeats: the autocorrelation (through the FFT, zero-padded; each lag averaged over its overlap)
// at its first peak past its first zero that stands within 10% of the tallest.
function period(e) { const n = e.length; let mu = 0; for (const v of e) mu += v; mu /= n; let M = 1; while (M < 2 * n) M <<= 1; const re = new Float64Array(M), im = new Float64Array(M); for (let i = 0; i < n; i++) re[i] = e[i] - mu; fft(re, im); for (let k = 0; k < M; k++) { re[k] = re[k] * re[k] + im[k] * im[k]; im[k] = 0; } fft(re, im, true); const r = re.map((v, l) => (l < n ? v / (n - l) : 0)), half = n >> 1; let z = -1; for (let l = 1; l < half; l++) if (r[l] < 0) { z = l; break; } const pk = []; for (let l = z; l < half; l++) if (r[l] > 0 && r[l] >= r[l - 1] && r[l] >= r[l + 1]) pk.push(l); const top = Math.max(...pk.map((l) => r[l])), bl = pk.find((l) => r[l] >= 0.9 * top); const y0 = r[bl - 1], y1 = r[bl], y2 = r[bl + 1], d = 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2); return bl + d; }

console.log('— the identity —');
{ let worst = 0; for (let i = 0; i < 2000; i++) { const a = Math.random() * 100, b = Math.random() * 100; worst = Math.max(worst, Math.abs(Math.sin(a) + Math.sin(b) - 2 * Math.cos((a - b) / 2) * Math.sin((a + b) / 2)), Math.abs(Math.cos(a) * Math.cos(b) - 0.5 * Math.cos(a - b) - 0.5 * Math.cos(a + b))); }
  check('sin a + sin b = 2cos((a−b)/2)sin((a+b)/2) and cos a·cos b = ½cos(a−b) + ½cos(a+b)', worst < 1e-12, `worst error ${worst.toExponential(1)} over 2000 random pairs`); }

console.log('— the outline swells at exactly the difference, from 0.5 to 150 Hz —');
const DFS = [0.5, 1, 3, 7, 15, 20, 30, 50, 72, 113, 150];
let worstRate = 0; const rows = [];
for (const df of DFS) {
  const n = df < 2 ? 1 << 20 : N, e = hilbertEnv(pair(df, n)).subarray(4096, n - 4096); // a slow beat gets a longer look: 23.8 s
  const rate = SR / period(e), err = Math.abs(rate - df) / df; worstRate = Math.max(worstRate, err);
  let lo = Infinity, hi = 0; for (const v of e) { if (v < lo) lo = v; if (v > hi) hi = v; }
  rows.push(`${df} Hz → ${rate.toFixed(4)} a second, outline ${lo.toFixed(4)} to ${hi.toFixed(4)}`);
}
for (const r of rows) info('envelope rate', r);
check('the envelope rate equals the difference at every Δf', worstRate < 1e-3, `worst error ${(100 * worstRate).toFixed(4)}% over ${DFS.join(', ')} Hz`);
check('the outline swings from silence to 2a at every Δf (full depth: the pulse is in the waveform)', rows.every((r) => /outline 0\.0\d+ to 0\.4/.test(r)), 'min ≈ 0, max ≈ 0.4 = 2 × 0.2');

console.log('— no energy at the difference in the sum; plenty once rectified —');
{
  const df = 3, x = pair(df), n = N, w = (i) => 0.5 - 0.5 * Math.cos(TAU * i / (n - 1));
  const spec = (y) => { const re = new Float64Array(n), im = new Float64Array(n); for (let i = 0; i < n; i++) re[i] = y[i] * w(i); fft(re, im); const p = new Float64Array(n / 2); for (let k = 0; k < n / 2; k++) p[k] = re[k] * re[k] + im[k] * im[k]; return p; };
  const band = (p, a, b) => { let s = 0; for (let k = Math.ceil(a * n / SR); k <= Math.floor(b * n / SR); k++) s += p[k]; return s; };
  const tot = (p) => p.reduce((s, v, k) => (k ? s + v : s), 0);
  const ps = spec(x), low = band(ps, 1, 200) / tot(ps);
  const rect = x.map((v) => Math.max(v, 0)); let mu = 0; for (const v of rect) mu += v; mu /= n; const pr = spec(rect.map((v) => v - mu));
  const atDf = band(pr, df - 0.5, df + 0.5) / tot(pr);
  check('the sum of 440 and 443 Hz holds nothing between 1 and 200 Hz (the arithmetic’s floor: a null that cannot fail, kept as a guard on the synthesis)', dB(low) < -100, `${dB(low).toFixed(0)} dB of its power (Hann window)`);
  { // squared, the intensity reading of "interference": 3 Hz appears at exactly a²
    let c3 = 0, s3 = 0; const L = 2 * SR; for (let i = 0; i < L; i++) { const t = i / SR, v = x[i] * x[i]; c3 += v * Math.cos(TAU * df * t); s3 += v * Math.sin(TAU * df * t); }
    const amp = 2 * Math.hypot(c3, s3) / L; check('squared (intensity), the sum holds 3 Hz at a² = 0.0400', Math.abs(amp - A * A) < 1e-4, `${amp.toFixed(4)} over two whole beat periods`); }
  check('half-wave rectified, as a hair cell responds, it holds a component at 3 Hz', dB(atDf) > -20, `${dB(atDf).toFixed(1)} dB of its varying power within 0.5 Hz of 3 Hz`);
}

console.log('— the cloth: ink on ink keeps its band through a squint, light on light does not —');
{
  const SP = AI.SP, DUTY = AI.DUTY, W = 900, OS = 16, T = 2, df = 3, n = W * OS;
  const black = (u) => { let f = u % 1; if (f < 0) f += 1; return Math.min(f, 1 - f) < DUTY / 2; };
  const P = new Float64Array(n), S = new Float64Array(n), Phi = (x) => TAU * df * T * x / W;
  for (let i = 0; i < n; i++) { const x = i / OS, ta = black(x / SP) ? 0 : 1, tb = black(x / SP + Phi(x) / TAU) ? 0 : 1; P[i] = ta * tb; S[i] = (ta + tb) / 2; }
  const blur = (y) => { const L = SP * OS, o = new Float64Array(n - L); let s = 0; for (let i = 0; i < L; i++) s += y[i]; for (let i = 0; i < n - L; i++) { o[i] = s / L; s += y[i + L] - y[i]; } return o; };
  const bp = blur(P), bs = blur(S), con = (y) => { let a = Infinity, b = -Infinity; for (const v of y) { if (v < a) a = v; if (v > b) b = v; } return (b - a) / (b + a); };
  check('ink on ink, squinted: broad bands remain', con(bp) > 0.5, `contrast ${con(bp).toFixed(3)} after a one-line-period blur`);
  check('light on light, squinted: the bands are gone', con(bs) < 0.03, `contrast ${con(bs).toFixed(4)}`);
  let worst = 0; for (let i = 0; i < bp.length; i += 7) { const xc = (i + SP * OS / 2) / OS; worst = Math.max(worst, Math.abs(bp[i] - AI.inkMean(Phi(xc) / TAU, DUTY))); }
  check('the red trace (AI.inkMean, a first-order local mean) is the squinted brightness', worst < 0.05, `worst gap ${worst.toFixed(4)} against the numerical blur`);
  let mu = 0; for (const v of bp) mu += v; mu /= bp.length; let ups = 0; for (let i = 1; i < bp.length; i++) if (bp[i - 1] < mu && bp[i] >= mu) ups++;
  check('one band across the cloth for every swell in its two seconds', Math.abs(ups - df * T) <= 1, `${ups} rises through the mean brightness counted; Δf × T = ${df * T}`);
  { // The piece's own field, one row of it: its anti-aliased lines, mixed and squinted in linear light (AI.blur).
    const lut = (u) => { const dist = Math.min(u, 1 - u) * SP; return Math.max(0, Math.min(1, 0.5 + (dist - DUTY / 2 * SP))); };
    const row = (mode) => { const r = new Float32Array(W); for (let x = 0; x < W; x++) { const ua = (x / SP) % 1, ub = ((x / SP + Phi(x) / TAU) % 1 + 1) % 1, ta = lut(ua), tb = lut(ub); r[x] = mode === 'ink' ? ta * tb : (ta + tb) / 2; } return r; };
    const band = (r) => { const w = 16, m = []; for (let x = 24; x + w < W - 24; x++) { let s = 0; for (let i = 0; i < w; i++) s += r[x + i]; m.push(s / w); } const a = Math.min(...m), b = Math.max(...m); return (b - a) / (b + a); };
    const out = {}; for (const mode of ['ink', 'light']) { const r = row(mode); out[mode + '0'] = band(r); out[mode + '12'] = band(AI.blur(Float32Array.from(r), W, 1, 12)); out[mode + 'eye'] = band(r.map((v) => Math.pow(v, 0.4))); }
    info('band contrast in linear light, 16 px means, as the piece draws it', `ink: ${out.ink0.toFixed(3)} unsquinted, ${out.ink12.toFixed(3)} at a 12 px squint · light on light: ${out.light0.toFixed(3)} unsquinted, ${out.light12.toFixed(3)} at 12 px`);
    check('in linear light, light on light holds no band of brightness and ink on ink does, squinted or not', out.light0 < 0.03 && out.light12 < 0.03 && out.ink0 > 0.5 && out.ink12 > 0.5, 'the numbers above');
    check('read through a compressive eye (L^0.4), light on light gets a faint band back', out.lighteye > 0.05, `contrast ${out.lighteye.toFixed(3)} (ink through the same: ${out.inkeye.toFixed(3)})`);
  }
  const amp = (y, cyc) => { let c = 0, s = 0; for (let i = 0; i < y.length; i++) { const a = TAU * cyc * i / y.length; c += y[i] * Math.cos(a); s += y[i] * Math.sin(a); } return 2 * Math.hypot(c, s) / y.length; };
  info('the band as a spatial frequency, 6 cycles across', `ink on ink: ${amp(P, 6).toFixed(4)} (mean ${(P.reduce((a, b) => a + b) / n).toFixed(3)}) · light on light: ${amp(S, 6).toFixed(5)}`);
}

console.log('— two oscillators, coupled the Kuramoto way —');
{
  const df = 3, sr = SR, f2 = F1 + df, dw = TAU * df;
  for (const kr of [0, 0.5, 0.9, 0.98, 1.2]) {
    const c = AI.coupled(df, kr, sr, 0), K = kr * dw, h = 1 / sr, len = Math.min(c.n, 4 * sr);
    // directly: θ1' = ω1 + (K/2)sin(θ2 − θ1), θ2' = ω2 + (K/2)sin(θ1 − θ2), RK4
    let t1 = 0, t2 = 0, worst = 0; const w1 = TAU * F1, w2 = TAU * f2, wm = (w1 + w2) / 2;
    const d1 = (a, b) => w1 + K / 2 * Math.sin(b - a), d2 = (a, b) => w2 + K / 2 * Math.sin(a - b);
    for (let i = 0; i < len; i++) {
      const direct = A * Math.sin(t1) + A * Math.sin(t2), built = c.env[i] * Math.sin(wm * i / sr);
      worst = Math.max(worst, Math.abs(direct - built));
      const a1 = d1(t1, t2), b1 = d2(t1, t2), a2 = d1(t1 + h * a1 / 2, t2 + h * b1 / 2), b2 = d2(t1 + h * a1 / 2, t2 + h * b1 / 2), a3 = d1(t1 + h * a2 / 2, t2 + h * b2 / 2), b3 = d2(t1 + h * a2 / 2, t2 + h * b2 / 2), a4 = d1(t1 + h * a3, t2 + h * b3), b4 = d2(t1 + h * a3, t2 + h * b3);
      t1 += h * (a1 + 2 * a2 + 2 * a3 + a4) / 6; t2 += h * (b1 + 2 * b2 + 2 * b3 + b4) / 6;
    }
    check(`K = ${kr} × Δω: the piece's carrier × slow factor is the two coupled sines added`, worst < 1e-5, `worst sample error ${worst.toExponential(1)} over ${(len / sr).toFixed(2)} s, against a peak of 0.4`);
    if (!c.locked) {
      let tc = null; for (let j = 1; j < c.phi.length; j++) if (c.phi[j - 1] < TAU && c.phi[j] >= TAU) { tc = ((j - 1) + (TAU - c.phi[j - 1]) / (c.phi[j] - c.phi[j - 1])) * 64 / sr; break; }
      const want = df * Math.sqrt(1 - kr * kr);
      check(`K = ${kr} × Δω: swells ${want.toFixed(3)} a second, √(Δf² − (K/2π)²)`, Math.abs(1 / tc - want) / want < 2e-3, `measured ${(1 / tc).toFixed(4)} from φ crossing 2π`);
      let step = 0; for (let i = 1; i < c.n; i++) step = Math.max(step, Math.abs(c.env[i] - c.env[i - 1]));
      const seam = Math.abs(c.env[0] - c.env[c.n - 1]);
      check(`K = ${kr} × Δω: the loop has no seam`, seam <= 2 * step, `jump ${seam.toExponential(2)}, largest step inside ${step.toExponential(2)}`);
    } else {
      const last = c.phi[Math.floor((c.n - 1) / 64)], R = Math.abs(Math.cos(c.phiStar / 2));
      check(`K = ${kr} × Δω: locked at φ* = asin(Δω/K) = ${(c.phiStar * 180 / Math.PI).toFixed(2)}°`, Math.abs(last - c.phiStar) < 1e-3, `φ after 6 s ${(last * 180 / Math.PI).toFixed(3)}°; steady R = ${R.toFixed(3)}`);
      let wob = 0; for (let i = c.loopStart; i < c.n; i++) wob = Math.max(wob, Math.abs(c.env[i] - c.env[c.loopStart]));
      check(`K = ${kr} × Δω: the looped last half-second is steady`, wob < 1e-6, `largest change ${wob.toExponential(1)}`);
    }
  }
}

console.log('— the piece reads its own scope truly —');
{
  const sr = 48000, COLS = 600;
  const cases = [[1.5, 2], [2, 2], [3, 2], [5, 2], [8, 2], ...[10, 20, 40, 72, 113, 150].map((df) => [df, AI.windowFor(df)])];
  let worst = 0; const out = [];
  for (const [df, T] of cases) {
    const n = Math.round(T * sr), spc = n / COLS, lo = new Float64Array(COLS).fill(1), hi = new Float64Array(COLS).fill(-1), p0 = Math.random() * TAU;
    for (let i = 0; i < n; i++) { const t = i / sr, v = A * Math.sin(TAU * F1 * t) + A * Math.sin(TAU * (F1 + df) * t + p0), c = Math.min(COLS - 1, Math.floor(i / spc)); if (v < lo[c]) lo[c] = v; if (v > hi[c]) hi[c] = v; }
    const r = AI.rate(AI.outline(lo, hi, T / COLS), T / COLS), err = r == null ? Infinity : Math.abs(r - df) / df;
    worst = Math.max(worst, err); out.push(`${df} Hz in ${T} s → ${r == null ? 'none' : r.toFixed(2)}`);
  }
  info('the in-page estimator', out.join(' · '));
  check('the in-page estimator reads the swell rate within 2%', worst < 0.02, `worst ${(100 * worst).toFixed(2)}%`);
  { const sr2 = 48000, n = 2 * sr2, spc = n / COLS, lo = new Float64Array(COLS).fill(1), hi = new Float64Array(COLS).fill(-1);
    for (let i = 0; i < n; i++) { const t = i / sr2, v = A * Math.sin(TAU * F1 * t) + A * Math.sin(TAU * (F1 + 1) * t), c = Math.min(COLS - 1, Math.floor(i / spc)); if (v < lo[c]) lo[c] = v; if (v > hi[c]) hi[c] = v; }
    const r = AI.rate(AI.outline(lo, hi, 2 / COLS), 2 / COLS); info('the in-page estimator at 1 Hz, two swells in the 2 s window', r == null ? 'says too slow to measure' : `reads ${r.toFixed(2)}`); }
  check('below two swells in the window it says so rather than guess', AI.rate(AI.outline(new Float64Array(600).map((_, i) => -0.4 * Math.abs(Math.cos(Math.PI * 0.6 * i * 2 / 600))), new Float64Array(600).map((_, i) => 0.4 * Math.abs(Math.cos(Math.PI * 0.6 * i * 2 / 600))), 2 / 600), 2 / 600) == null, '0.6 Hz in a 2 s window');
}

console.log('— the ear’s filter, the test’s scale, the levels —');
{
  info('the ear’s filter at 440 Hz', `ERB ${AI.erb(F1).toFixed(1)} Hz · Zwicker’s critical band ${AI.cb(F1).toFixed(1)} Hz`);
  info('amplitude the 440 Hz roex filter passes at f₁ + Δf', [3, 15, 30, 50, 72, 113, 150].map((d) => `${d} Hz: ${(100 * AI.pass(F1 + d, F1)).toFixed(0)}%`).join(' · '));
  const lo = AI.testDf(0, 0.75), hiLow = AI.testDf(1, 0.75), hiHigh = AI.testDf(1, 1.33);
  check('the hidden test sweep covers the swell, the roughness and the critical band on every shuffle', lo <= 0.5 && hiLow >= AI.cb(F1), `from ${lo.toFixed(3)} Hz; tops out between ${hiLow.toFixed(0)} and ${hiHigh.toFixed(0)} Hz across the shuffled scales`);
  const peak = 2 * A, pdb = 20 * Math.log10(peak);
  check('the sum peaks below the compressor’s threshold (−6 dB), so it never touches the swell', pdb < -6, `peak ${peak} = ${pdb.toFixed(2)} dBFS (the compressor itself runs only in a browser; not checked here)`);
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
