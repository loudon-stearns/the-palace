// Auditory Illusions — rich — check — between-the-ears.mjs
// born: 2026-11-08 · checks the four pieces [[Auditory Illusions]]'s rich face shows under "Between the two ears —
// timing to tens of microseconds": binaural beats, Huggins pitch, precedence effect, Franssen effect.
// forward_vector: I measure what each piece actually plays, not what its code says it plays. I open every piece in
// headless Chromium, have it render its own Web Audio graph offline (window.PIECE.render, the same build function
// its buttons call, through the same limiter), and measure the stereo result here in Node with my own arithmetic:
// each ear's frequency and the binaural difference; each ear's envelope; the interaural phase across the Huggins
// band, the band's width, the mono fold's notch and the difference signal; the precedence pieces' inter-channel delay
// by cross-correlation and their level difference; the Franssen crossfade's levels over time, dry and in the room.
// What a listener hears I cannot check: whether the beat, the tune, the place or the held bell are heard at all.
//
//   node "Auditory Illusions/Auditory Illusions — rich — check — between-the-ears.mjs"     (from the palace root)
//
// PASS/FAIL per claim, INFO for numbers worth reading; exits 1 on any FAIL. Reads only; writes nothing.
// Needs Playwright's Chromium from STIGMERGY's install (_ops/stigmergy/app).

import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const require = createRequire(join(ROOT, '_ops/stigmergy/app/package.json'));
const { chromium } = require('playwright');
const piece = (name) => pathToFileURL(join(HERE, `Auditory Illusions — rich — ${name}.html`)).href;

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const info = (name, detail) => console.log(`INFO  ${name}  (${detail})`);
const dB = (v) => 20 * Math.log10(Math.max(v, 1e-12));
const rms = (x, a = 0, b = x.length) => { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / Math.max(1, b - a)); };
const seg = (x, sr, t0, t1) => x.slice(Math.round(t0 * sr), Math.round(t1 * sr));

// Frequency by zero crossings, linearly interpolated: precise to well under 0.01 Hz over a second of a sine.
function freq(x, sr) {
  const z = []; for (let i = 1; i < x.length; i++) if (x[i - 1] < 0 && x[i] >= 0) z.push(i - 1 + -x[i - 1] / (x[i] - x[i - 1]));
  return (z.length - 1) / ((z[z.length - 1] - z[0]) / sr);
}
// Envelope: RMS in 10 ms frames; depth = (max - min) / (max + min).
function envelope(x, sr, hop = 0.01) { const h = Math.round(hop * sr), e = []; for (let i = 0; i + h <= x.length; i += h) e.push(rms(x, i, i + h)); return e; }
const depth = (e) => { const mx = Math.max(...e), mn = Math.min(...e); return (mx - mn) / (mx + mn); };
// radix-2 FFT
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let j = 0; j < len / 2; j++) { const k = i + j + len / 2, vr = re[k] * cr - im[k] * ci, vi = re[k] * ci + im[k] * cr; re[k] = re[i + j] - vr; im[k] = im[i + j] - vi; re[i + j] += vr; im[i + j] += vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } }
}
// Welch cross-spectrum of two signals: per bin, mean of X·conj(Y) and the two auto-spectra.
function welch(x, y, N = 8192) {
  const Sxy = { re: new Float64Array(N / 2), im: new Float64Array(N / 2) }, Sxx = new Float64Array(N / 2), Syy = new Float64Array(N / 2);
  const win = Array.from({ length: N }, (_, i) => 0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)); let frames = 0;
  for (let s = 0; s + N <= x.length; s += N / 2) {
    const xr = new Float64Array(N), xi = new Float64Array(N), yr = new Float64Array(N), yi = new Float64Array(N);
    for (let i = 0; i < N; i++) { xr[i] = x[s + i] * win[i]; yr[i] = y[s + i] * win[i]; }
    fft(xr, xi); fft(yr, yi); frames++;
    for (let k = 0; k < N / 2; k++) { Sxy.re[k] += xr[k] * yr[k] + xi[k] * yi[k]; Sxy.im[k] += xi[k] * yr[k] - xr[k] * yi[k]; Sxx[k] += xr[k] * xr[k] + xi[k] * xi[k]; Syy[k] += yr[k] * yr[k] + yi[k] * yi[k]; }
  }
  return { Sxy, Sxx, Syy, frames, N };
}
// The RBJ all-pass phase, written here from the Audio EQ Cookbook, not taken from the piece.
function apPhase(f, f0, Q, sr) {
  const w0 = 2 * Math.PI * f0 / sr, al = Math.sin(w0) / (2 * Q), w = 2 * Math.PI * f / sr;
  const num = { re: (1 - al) - 2 * Math.cos(w0) * Math.cos(w) + (1 + al) * Math.cos(2 * w), im: 2 * Math.cos(w0) * Math.sin(w) - (1 + al) * Math.sin(2 * w) };
  const den = { re: (1 + al) - 2 * Math.cos(w0) * Math.cos(w) + (1 - al) * Math.cos(2 * w), im: 2 * Math.cos(w0) * Math.sin(w) - (1 - al) * Math.sin(2 * w) };
  let p = Math.atan2(num.im, num.re) - Math.atan2(den.im, den.re); while (p > 0) p -= 2 * Math.PI; while (p <= -2 * Math.PI) p += 2 * Math.PI; return p;
}
// Interaural phase (right relative to left) at f, in degrees in (-360, 0], from the averaged cross-spectrum.
function ipdAt(W, f, sr) { const k = Math.round(f / (sr / W.N)); let p = Math.atan2(-W.Sxy.im[k], W.Sxy.re[k]); while (p > 0) p -= 2 * Math.PI; while (p <= -2 * Math.PI) p += 2 * Math.PI; return p * 180 / Math.PI; }
function bandPower(x, sr, lo, hi, N = 8192) { const W = welch(x, x, N); let a = 0; for (let k = 0; k < N / 2; k++) { const f = k * sr / N; if (f >= lo && f < hi) a += W.Sxx[k]; } return a / W.frames; }

const browser = await chromium.launch();
let PP = null;
async function open(name) {
  const pg = await browser.newPage(); const errs = [];
  pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.addInitScript(() => { window.__ac = 0; const O = window.AudioContext; window.AudioContext = class extends O { constructor(...a) { super(...a); window.__ac++; } }; });
  await pg.goto(piece(name)); await pg.waitForTimeout(300);
  check(`${name}: no AudioContext before a click, clean console on load`, (await pg.evaluate(() => window.__ac)) === 0 && !errs.length, errs.length ? errs.join(' | ') : 'none made, no errors');
  return { render: (p, s) => pg.evaluate(([p, s]) => window.PIECE.render(p, s), [p, s]), pg };
}

// ── binaural beats ──
console.log('— binaural beats —');
{
  const P = await open('binaural beats');
  const r = await P.render({ f: 440, df: 3, mode: 'ears' }, 2), sr = r.sr;
  const fL = freq(seg(r.L, sr, 0.2, 1.9), sr), fR = freq(seg(r.R, sr, 0.2, 1.9), sr);
  check('left ear plays 440 Hz', Math.abs(fL - 440) < 0.01, `${fL.toFixed(3)} Hz`);
  check('right ear plays 443 Hz', Math.abs(fR - 443) < 0.01, `${fR.toFixed(3)} Hz`);
  check('the binaural difference is 3 Hz', Math.abs(fR - fL - 3) < 0.02, `${(fR - fL).toFixed(3)} Hz`);
  const dL = depth(envelope(seg(r.L, sr, 0.2, 1.9), sr)), dR = depth(envelope(seg(r.R, sr, 0.2, 1.9), sr));
  check('between the ears: each ear’s level is flat (no beat in either ear)', dL < 0.02 && dR < 0.02, `envelope depth L ${(100 * dL).toFixed(2)}%, R ${(100 * dR).toFixed(2)}%`);
  const a = await P.render({ f: 440, df: 3, mode: 'air' }, 2), eA = envelope(seg(a.L, sr, 0.2, 1.9), sr), dA = depth(eA);
  const mins = []; for (let i = 1; i < eA.length - 1; i++) if (eA[i] < eA[i - 1] && eA[i] <= eA[i + 1] && eA[i] < 0.3 * Math.max(...eA)) mins.push(i);
  const beat = mins.length > 1 ? (mins.length - 1) / ((mins[mins.length - 1] - mins[0]) * 0.01) : NaN;
  check('in the air: each ear’s level swells and fades fully', dA > 0.9, `envelope depth ${(100 * dA).toFixed(1)}%`);
  check('in the air: the swell repeats 3 times a second', Math.abs(beat - 3) < 0.1, `${beat.toFixed(2)} Hz from envelope minima`);
  check('in the air and between the ears, each ear carries the same RMS', Math.abs(dB(rms(a.L) / rms(r.L))) < 0.3, `${dB(rms(a.L) / rms(r.L)).toFixed(2)} dB`);
  const s = await P.render({ f: 440, df: 3, mode: 'same' }, 2), fs1 = freq(seg(s.L, sr, 0.2, 1.9), sr), fs2 = freq(seg(s.R, sr, 0.2, 1.9), sr);
  check('blind test, other arm: both ears one tone, between the two', Math.abs(fs1 - 441.5) < 0.01 && Math.abs(fs2 - 441.5) < 0.01, `L ${fs1.toFixed(3)} · R ${fs2.toFixed(3)} Hz`);
  check('blind test arms matched in level', Math.abs(dB(rms(s.L) / rms(r.L))) < 0.1, `${dB(rms(s.L) / rms(r.L)).toFixed(3)} dB`);
  const l = await P.render({ f: 440, df: 3, mode: 'ears', liftL: true }, 2);
  check('lifting the left earpiece silences the left channel', dB(rms(seg(l.L, sr, 1, 1.9)) / rms(seg(r.L, sr, 1, 1.9))) < -60, `${dB(rms(seg(l.L, sr, 1, 1.9)) / rms(seg(r.L, sr, 1, 1.9))).toFixed(1)} dB`);
  // the blind trial after the challenge: Δf held to 5 Hz, the carrier roved ±50 cents per trial
  const dfMax = await P.pg.evaluate(() => window.PIECE.dfTest(100)), rove = await P.pg.evaluate(() => window.PIECE.ROVE_CENTS);
  const cents = (a, b) => 1200 * Math.log2(b / a);
  const oneEar = cents(200, 200 + dfMax / 2), between = cents(200, 200 + dfMax);
  check('blind trial: Δf at most 5 Hz, so the arms differ in one ear by less than the carrier’s rove', dfMax <= 5 && oneEar < rove, `Δf max ${dfMax} Hz · at the lowest carrier (200 Hz) the arms differ by ${oneEar.toFixed(1)} cents in the left ear and the right ear by ${between.toFixed(1)}; at 1500 Hz ${cents(1500, 1500 + dfMax / 2).toFixed(1)} cents · rove ±${rove} cents`);
  // the Pulfrich drawing: the dimmed eye is the left (filled); it sees the bob d late. Bob at centre moving right, d = 10 ms.
  { const EYE = 0.0325, Z = 0.6, A = 0.08, T = 1.6, d = 0.01, x = (t) => A * Math.sin(2 * Math.PI * t / T);
    const xl = x(-d), xr = x(0), Y = 2 * EYE * Z / (2 * EYE + xl - xr);   // where the left eye's ray (to xl) meets the right eye's (to xr)
    const ps = await P.pg.evaluate(() => window.PIECE.seen(0, 0.01));
    check('Pulfrich: the red dot sits where the drawn sight lines cross', Math.abs(ps.Y - Y) < 1e-6, `piece ${(100 * ps.Y).toFixed(1)} cm · lines ${(100 * Y).toFixed(1)} cm (bob moving right, left eye dimmed: behind the 60 cm path)`); }
  for (const f of [1000, 1500, 2500]) { const h = await P.render({ f, df: 3, mode: 'ears' }, 2); info(`carrier ${f} Hz`, `L ${freq(seg(h.L, sr, 0.2, 1.9), sr).toFixed(3)} · R ${freq(seg(h.R, sr, 0.2, 1.9), sr).toFixed(3)} Hz`); }
}

// ── Huggins pitch ──
console.log('— Huggins pitch —');
{
  const P = await open('Huggins pitch');
  const r = await P.render({ mode: 'both', q: 8, f0: 440 }, 3), sr = r.sr;
  const L = seg(r.L, sr, 0.3, 3), R = seg(r.R, sr, 0.3, 3), W = welch(L, R, 32768);
  const at = (f) => ipdAt(W, f, sr), wrap = (d) => { const v = ((d % 360) + 360) % 360; return Math.min(v, 360 - v); };
  check('interaural phase at f0 = 440 Hz is 180°', Math.abs(at(440) + 180) < 5, `${at(440).toFixed(1)}° measured · ${(apPhase(440, 440, 8, sr) * 180 / Math.PI).toFixed(1)}° from the cookbook`);
  check('outside the band the ears are in phase', wrap(at(150)) < 10 && wrap(at(2000)) < 10, `at 150 Hz ${wrap(at(150)).toFixed(1)}° from 0 · at 2 kHz ${wrap(at(2000)).toFixed(1)}° from 0`);
  let lo = null, hi = null; for (let f = 250; f < 800; f += sr / W.N) { const v = at(f); if (lo === null && v < -90) lo = f; if (hi === null && v < -270) hi = f; }
  const band = { lo, hi, width: hi - lo };
  const bp = await P.pg.evaluate(() => window.PIECE.band(440, 8));
  check('the twisted band (−90° to −270°) is narrow, as the piece draws it', Math.abs(band.width - bp.width) < 2 * sr / W.N + 2, `measured ${band.lo.toFixed(0)}–${band.hi.toFixed(0)} Hz, ${band.width.toFixed(0)} Hz (${(100 * band.width / 440).toFixed(0)}% of f0) · piece says ${bp.width.toFixed(0)} Hz · bins ${(sr / W.N).toFixed(1)} Hz`);
  let worst = 0; for (const f of [200, 300, 400, 440, 480, 600, 1000, 3000]) { const k = Math.round(f / (sr / W.N)); let a = 0, b = 0; for (let j = k - 5; j <= k + 5; j++) { a += W.Sxx[j]; b += W.Syy[j]; } worst = Math.max(worst, Math.abs(10 * Math.log10(b / a))); }
  check('each ear alone: the same spectrum (right/left within 0.5 dB at 8 frequencies, in and out of the band)', worst < 0.5, `worst ${worst.toFixed(2)} dB`);
  check('each ear carries the same RMS', Math.abs(dB(rms(R) / rms(L))) < 0.1, `${dB(rms(R) / rms(L)).toFixed(3)} dB · ${dB(rms(L)).toFixed(1)} dBFS`);
  const f = await P.render({ mode: 'fold', q: 8, f0: 440 }, 3), FL = seg(f.L, sr, 0.3, 3), FR = seg(f.R, sr, 0.3, 3);
  let maxd = 0; for (let i = 0; i < FL.length; i++) maxd = Math.max(maxd, Math.abs(FL[i] - FR[i]));
  check('fold to mono: both ears identical', maxd < 1e-6, `max |L−R| ${maxd.toExponential(1)}`);
  const notch = 10 * Math.log10(bandPower(FL, sr, 435, 445) / 10 / (bandPower(FL, sr, 300, 350) / 50));
  check('fold to mono: the twist becomes a notch at f0', notch < -15, `power at 440 ±5 Hz vs 300–350 Hz, per hertz: ${notch.toFixed(1)} dB`);
  const d = await P.render({ mode: 'diff', q: 8, f0: 440 }, 3), D = seg(d.L, sr, 0.3, 3);
  // where its energy sits: the share inside the twisted band, measured, against the share the all-pass model predicts
  // (|1 − e^(iφ)|² integrated over the band and over everything, φ from the cookbook)
  const share = bandPower(D, sr, band.lo, band.hi, 32768) / bandPower(D, sr, 20, 20000, 32768);
  let tin = 0, tall = 0; for (let fq = 20; fq < 20000; fq += 0.5) { const v = 2 - 2 * Math.cos(apPhase(fq, 440, 8, sr)); tall += v; if (fq >= band.lo && fq < band.hi) tin += v; }
  check('left minus right: a narrow band of noise around f0, shaped as the all-pass predicts', Math.abs(share - tin / tall) < 0.05, `${(100 * share).toFixed(1)}% of its energy inside ${band.lo.toFixed(0)}–${band.hi.toFixed(0)} Hz, model ${(100 * tin / tall).toFixed(1)}% · level ${dB(rms(D) / rms(L)).toFixed(1)} dB re one ear’s noise`);
  // the tune: two notes and a rest, IPD at each note's frequency inside its own stretch
  const m = await P.render({ mode: 'both', q: 8, notes: [[0.2, 293.66], [0.9, null], [1.1, 493.88], [1.9, null]] }, 2.2);
  for (const [t0, t1, fn] of [[0.35, 0.95, 293.66], [1.25, 1.85, 493.88]]) { const Wn = welch(seg(m.L, sr, t0, t1), seg(m.R, sr, t0, t1), 4096); const v = ipdAt(Wn, fn, sr); check(`the tune: the twist sits on the note (${fn} Hz)`, Math.abs(v + 180) < 20, `${v.toFixed(1)}° at ${fn} Hz in ${t0}–${t1} s (4096-point frames, ${(sr / 4096).toFixed(1)} Hz bins)`); }
  // the leak check's arm: the right ear's signal alone, at the note change — band energy right vs left
  // A sounding all-pass retuned to a new note rings at it, and one ear alone could hear that. The piece gates the twist off,
  // retunes, and fades it back in. Each window: the right ear's energy in 470–520 Hz over the left's, the same noise.
  let worstLeak = -Infinity;
  for (const [t0, t1, lab] of [[1.0, 1.1, 'gated off, retuning'], [1.1, 1.16, 'the twist fading in'], [1.3, 1.85, 'the note, steady'], [1.9, 1.96, 'fading out']]) {
    const pr = bandPower(seg(m.R, sr, t0, t1), sr, 470, 520, 2048), pl = bandPower(seg(m.L, sr, t0, t1), sr, 470, 520, 2048), v = 10 * Math.log10(pr / pl);
    worstLeak = Math.max(worstLeak, v); info(`right ear vs left at the note, ${lab} (${t0}–${t1} s)`, `${v.toFixed(1)} dB`);
  }
  // and the other direction: the crossfade itself cancels at f0 halfway through (gain (1 − 2a)²), a dip, not a ring.
  // 10 ms at the middle of the fade-in, 470–520 Hz, mean over 8 noises.
  // a Hann-windowed one-bin DFT at the note, which 10 ms of signal can resolve only to about ±100 Hz
  const bin = (x, f) => { let re = 0, im = 0; for (let i = 0; i < x.length; i++) { const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / x.length); re += w * x[i] * Math.cos(2 * Math.PI * f * i / sr); im -= w * x[i] * Math.sin(2 * Math.PI * f * i / sr); } return re * re + im * im; };
  let dip = 0; for (let k = 0; k < 8; k++) { const q = await P.render({ mode: 'both', q: 8, offset: 0.37 * k, notes: [[0.2, 493.88]] }, 0.5); dip += 10 * Math.log10(bin(seg(q.R, sr, 0.2075, 0.2175), 493.88) / bin(seg(q.L, sr, 0.2075, 0.2175), 493.88)); }
  dip /= 8; let worstDip = Infinity; for (const v of [dip]) worstDip = Math.min(worstDip, v);
  info('the gate’s dip: 10 ms at mid-fade, right vs left at the note (Hann, one bin), mean of 8 noises', `${dip.toFixed(1)} dB (the model: at f0 the gain passes through 0, 10 dB or more down for about 8 ms of the 25 ms fade)`);
  check('the leak gate, both ways: no window more than 6 dB above or below the left ear at the note', worstLeak < 6 && dip > -6, `worst up ${worstLeak.toFixed(1)} dB (60 ms windows; before the gate a sounding retune measured +24.9 dB) · dip ${dip.toFixed(1)} dB (10 ms); short windows are noisy, so the blind trial’s one-ear arm is the real test`);
  const tl = await P.pg.evaluate(() => window.PIECE.TUNE);
  info('the tune', `${tl.length} notes, ${tl.map((n) => n[0]).join(' ')} Hz (Twinkle, Twinkle, in D), twist Q 8`);
}

// ── precedence effect ──
console.log('— precedence effect —');
{
  const P = await open('precedence effect'); PP = P;
  function xcorrLag(a, b, maxLag) { let best = -Infinity, at = 0; for (let L = -maxLag; L <= maxLag; L++) { let s = 0; for (let i = Math.max(0, -L); i < a.length && i + L < b.length; i++) s += a[i] * b[i + L]; if (s > best) { best = s; at = L; } } return at; }
  for (const kind of ['click', 'clap', 'long']) for (const [delayMs, lead, lagDb] of [[0.5, 'L', 0], [3, 'L', 0], [3, 'R', 0], [12, 'L', 0], [40, 'R', 0], [3, 'L', 10]]) {
    const r = await P.render({ kind, lead, delayMs, lagDb, route: 'speakers' }, kind === 'long' ? 0.42 : 0.12), sr = r.sr;
    const first = lead === 'L' ? r.L : r.R, late = lead === 'L' ? r.R : r.L, lag = xcorrLag(first, late, Math.round(0.045 * sr)), ms = 1000 * lag / sr;
    const lvl = dB(rms(late) / rms(first));
    check(`two speakers: ${kind}, ${lead} first, ${delayMs} ms, late ${lagDb ? '+' + lagDb : '±0'} dB`, Math.abs(ms - delayMs) <= 1000 / sr && Math.abs(lvl - lagDb) < 0.1, `measured delay ${ms.toFixed(3)} ms (${lag} samples) · level ${lvl.toFixed(2)} dB · peak ${dB(late.reduce((m, v) => Math.max(m, Math.abs(v)), 0)).toFixed(1)} dBFS out`);
  }
}

{
  // headphones (the default): each speaker reaches both ears, far ear 0.26 ms later and 6 dB down
  const P = { render: (p, s) => PP.pg.evaluate(([p, s]) => window.PIECE.render(p, s), [p, s]) };
  const peaks = (x) => { const m = x.reduce((a, v) => Math.max(a, Math.abs(v)), 0), out = []; for (let i = 1; i < x.length - 1; i++) if (x[i] > 0.2 * m && x[i] >= x[i - 1] && x[i] > x[i + 1]) out.push([i, x[i]]); return out; };
  for (const [delayMs, lagDb] of [[3, 0], [12, 6]]) {
    const r = await P.render({ kind: 'click', lead: 'L', delayMs, lagDb, route: 'phones' }, 0.1), sr = r.sr, pl = peaks(r.L), pr = peaks(r.R), t0 = pl[0][0], ms = (i) => (1000 * (i - t0) / sr);
    const k = Math.pow(10, lagDb / 20), itd = Math.round(0.00026 * sr), lag = Math.round(delayMs / 1000 * sr);
    const okT = pl.length === 2 && pr.length === 2 && pl[1][0] - t0 === lag + itd && pr[0][0] - t0 === itd && pr[1][0] - t0 === lag;
    const okA = Math.abs(pr[0][1] / pl[0][1] - 0.5) < 0.01 && Math.abs(pr[1][1] / pl[0][1] - k) < 0.01 * k && Math.abs(pl[1][1] / pl[0][1] - 0.5 * k) < 0.01 * k;
    check(`headphones: both speakers reach both ears (click, left first, ${delayMs} ms, late ${lagDb ? '+' + lagDb : '±0'} dB)`, okT && okA, `left ear: ${pl.map(([i, v]) => ms(i).toFixed(2) + ' ms ×' + (v / pl[0][1]).toFixed(2)).join(', ')} · right ear: ${pr.map(([i, v]) => ms(i).toFixed(2) + ' ms ×' + (v / pl[0][1]).toFixed(2)).join(', ')}`);
  }
  const big = await P.render({ kind: 'long', lead: 'L', delayMs: 3, lagDb: 12, route: 'phones' }, 0.42);
  let pk = 0; for (const v of big.L) pk = Math.max(pk, Math.abs(v)); for (const v of big.R) pk = Math.max(pk, Math.abs(v));
  const inPk = pk / (0.8 * 1.068);   // undo the master gain and the limiter's makeup at −1 dB (×1.068, the challenger's measure)
  check('headphones, “ta”, late +12 dB: under the limiter', inPk < Math.pow(10, -1 / 20), `peak into the limiter ${dB(inPk).toFixed(2)} dBFS, threshold −1`);
}

// ── Franssen effect ──
console.log('— Franssen effect —');
{
  const P = await open('Franssen effect');
  const tau = 0.011, r = await P.render({ f: 750, tau, src: 'tone', room: false, start: 'L' }, 1.5), sr = r.sr;
  let on = 0; while (Math.abs(r.L[on]) < 1e-4) on++; const o = on / sr;
  info('latency through the limiter (its look-ahead), the same for both channels', `${(1000 * o).toFixed(2)} ms`);
  const L0 = rms(seg(r.L, sr, o + 0.0005, o + 0.004)), L5 = rms(seg(r.L, sr, o + 5 * tau - 0.002, o + 5 * tau + 0.002)), Ls = rms(seg(r.L, sr, 0.3, 1.3)), Rs = rms(seg(r.R, sr, 0.3, 1.3)), R0 = rms(seg(r.R, sr, o + 0.0005, o + 0.002));
  check('dry: the first speaker starts at full', Math.abs(dB(L0 / Rs)) < 1.5, `first 4 ms at ${dB(L0 / Rs).toFixed(2)} dB re the second’s steady level`);
  check('dry: after 5τ (55 ms) the first speaker is about 43 dB down', Math.abs(dB(L5 / Rs) + 43.4) < 3, `${dB(L5 / Rs).toFixed(1)} dB`);
  check('dry: from 0.3 s on, the first speaker is silent and the second carries the bell', dB(Ls / Rs) < -100, `${dB(Ls / Rs).toFixed(0)} dB`);
  check('dry: at the onset, the second speaker is near silent', dB(R0 / L0) < -12, `${dB(R0 / L0).toFixed(1)} dB in the first 2 ms`);
  const st = await P.render({ f: 750, tau, src: 'tone', room: false, start: 'L', move: false }, 1.5);
  check('a bell that stays: all in the first speaker', dB(rms(seg(st.R, sr, 0.3, 1.3)) / rms(seg(st.L, sr, 0.3, 1.3))) < -100 && Math.abs(dB(rms(seg(st.L, sr, 0.3, 1.3)) / Rs)) < 0.2, `steady L matches the moving bell’s steady R within ${Math.abs(dB(rms(seg(st.L, sr, 0.3, 1.3)) / Rs)).toFixed(2)} dB`);
  // the room after the challenge: mirrored, and equalised at the tone, so the settled bell has no level gap between the ears
  const dft = (x, f) => { let re = 0, im = 0; for (let i = 0; i < x.length; i++) { re += x[i] * Math.cos(2 * Math.PI * f * i / sr); im -= x[i] * Math.sin(2 * Math.PI * f * i / sr); } return Math.hypot(re, im); };
  let worstGap = 0; const gaps = [], raw = [];
  for (const fq of [300, 750, 1500, 3000]) for (const st of ['L', 'R']) {
    const q = await P.render({ f: fq, tau, src: 'tone', room: true, start: st }, 1.5), endEar = st === 'L' ? q.R : q.L, startEar = st === 'L' ? q.L : q.R;
    const g = dB(dft(seg(startEar, sr, 0.6, 1.3), fq) / dft(seg(endEar, sr, 0.6, 1.3), fq)); worstGap = Math.max(worstGap, Math.abs(g)); gaps.push(`${fq}${st} ${g.toFixed(2)}`);
  }
  for (const fq of [300, 750, 1500, 3000]) raw.push(`${fq} ${(await P.pg.evaluate((f) => window.PIECE.gap(f), fq)).toFixed(1)}`);
  check('room: the settled bell reaches both ears at the same level, at any tone, either start (level can’t answer the trial)', worstGap < 0.5, `start-ear minus end-ear, dB: ${gaps.join(' · ')} · this room unequalised, far minus near: ${raw.join(' · ')} dB`);
  const mA = await P.render({ f: 1500, tau, src: 'tone', room: true, start: 'L' }, 0.6), mB = await P.render({ f: 1500, tau, src: 'tone', room: true, start: 'R' }, 0.6);
  let md = 0; for (let i = 0; i < mA.L.length; i++) md = Math.max(md, Math.abs(mA.L[i] - mB.R[i]), Math.abs(mA.R[i] - mB.L[i]));
  check('room: mirrored (starting right is starting left with the ears swapped)', md < 1e-6, `max difference ${md.toExponential(1)}`);
  const rm = await P.render({ f: 1500, tau, src: 'tone', room: true, start: 'L' }, 1.5), rL = seg(rm.L, sr, 0.6, 1.3), rR = seg(rm.R, sr, 0.6, 1.3);
  let cc = 0; { const n = Math.round(0.001 * sr); const nr = Math.sqrt(rL.reduce((a, v) => a + v * v, 0) * rR.reduce((a, v) => a + v * v, 0)); for (let L = -n; L <= n; L++) { let s = 0; for (let i = n; i < rL.length - n; i++) s += rL[i] * rR[i + L]; cc = Math.max(cc, Math.abs(s / nr)); } }
  info('room, 1500 Hz: the settled bell at each ear', `right minus left ${dB(rms(rR) / rms(rL)).toFixed(2)} dB (dry: ${dB(Rs / Math.max(Ls, 1e-9)).toFixed(0)} dB) · interaural correlation, best within ±1 ms: ${cc.toFixed(2)}`);
  const nzr = await P.render({ src: 'noise', tau, room: true, start: 'L' }, 1.5);
  info('room, noise (not equalised): the settled sound, end ear minus start ear', `${dB(rms(seg(nzr.R, sr, 0.6, 1.3)) / rms(seg(nzr.L, sr, 0.6, 1.3))).toFixed(1)} dB, broadband`);
  const rmOn = await P.render({ f: 1500, tau, src: 'tone', room: true, start: 'L' }, 0.2);
  info('room: the onset, first 3 ms at each ear', `left minus right ${dB(rms(seg(rmOn.L, sr, o, o + 0.003)) / rms(seg(rmOn.R, sr, o, o + 0.003))).toFixed(1)} dB · the onset still favours the starting side`);
  const nz = await P.render({ src: 'noise', tau, room: false, start: 'R' }, 1.5);
  check('noise, dry, starting right: ends all in the left', dB(rms(seg(nz.R, sr, 0.3, 1.3)) / rms(seg(nz.L, sr, 0.3, 1.3))) < -100, `${dB(rms(seg(nz.R, sr, 0.3, 1.3)) / rms(seg(nz.L, sr, 0.3, 1.3))).toFixed(0)} dB`);
  let peak = 0; for (const v of rm.L) peak = Math.max(peak, Math.abs(v)); for (const v of rm.R) peak = Math.max(peak, Math.abs(v)); check('room: peak level into the limiter stays under it', peak / (0.8 * 1.482) < Math.pow(10, -6 / 20), `${dB(peak / (0.8 * 1.482)).toFixed(1)} dBFS (output ÷ the master 0.8 ÷ the limiter’s makeup ×1.482 at −6, the challenger’s measure) · threshold −6`);
}

await browser.close();
console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
