// Auditory Illusions — rich — check — in-the-cochlea.mjs
// born: 2026-11-08 · checks the two pieces made for [[Auditory Illusions]]' section "In the cochlea — the ear is not a
// microphone": "the ghost tone" (combination tones) and "the hiding place" (masking)
// forward_vector: I re-run, headless, every number the two pieces lean on: that the signal the ghost tone sends has
// nothing at 2f1 − f2 or f2 − f1, so a probe that goes still there is beating against the ear; that the probe and the
// tones make no slow beat in a square-law envelope until the clipper puts the ghost in the signal; how the clipper's
// products fall with level, read through the curve the way a WaveShaperNode reads it; that nothing reaches the
// compressor's threshold; the analyser's calibration; and for the hiding place, the filter widths, the model's hidden
// span at each level, the noise band's width, level and peak, the chirp's spread, that a blind trial with and
// without the cricket differs only by the cricket, the chance figures, and that the twin's two squares are one grey.
// What a listener hears I cannot check.
//
//   node "Auditory Illusions/Auditory Illusions — rich — check — in-the-cochlea.mjs"
//
// It pulls <script id="ct-core"> and <script id="mk-core"> out of the pieces, runs them in a Node sandbox, and
// measures with a DFT of its own (whole cycles over one second, so no window and no leakage). PASS/FAIL per claim,
// INFO for numbers worth reading; exits 1 on any FAIL. Reads only; writes nothing.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const page = (name) => readFileSync(join(HERE, `Auditory Illusions — rich — ${name}.html`), 'utf8');
const P = { ghost: page('the ghost tone'), hide: page('the hiding place') };
const grab = (html, id) => { const m = html.match(new RegExp(`<script id="${id}">\\n([\\s\\S]*?)</script>`)); if (!m) throw new Error(`no <script id="${id}">`); return m[1]; };
const E = { Math, Float64Array, Float32Array, Array, Number, String, Object, JSON, isFinite, Infinity };
vm.createContext(E);
vm.runInContext(grab(P.ghost, 'ct-core') + '\nthis.CT = CT;', E);
vm.runInContext(grab(P.hide, 'mk-core') + '\nthis.MK = MK;', E);
const { CT, MK } = E;

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const info = (name, detail) => console.log(`INFO  ${name}  (${detail})`);
const dB = (v) => 20 * Math.log10(Math.max(v, 1e-300));
const lin = (d) => Math.pow(10, d / 20);
// amplitude of the component at f (whole Hz) in a one-second signal: an exact DFT bin, no window needed
function amp(x, sr, f) { let re = 0, im = 0; const w = 2 * Math.PI * f / sr; for (let i = 0; i < x.length; i++) { re += x[i] * Math.cos(w * i); im -= x[i] * Math.sin(w * i); } return 2 * Math.hypot(re, im) / x.length; }
const peak = (x) => x.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
const rms = (x) => Math.sqrt(x.reduce((s, v) => s + v * v, 0) / x.length);

console.log('— the ghost tone —');
{
  const g = CT.ghosts(1000, 1200);
  check('the ghosts sit where the page says', g.cubic === 800 && g.quad === 200, `2f1 − f2 = ${g.cubic} Hz, f2 − f1 = ${g.quad} Hz; also 2f2 − f1 = ${g.upper}, 3f1 − 2f2 = ${g.fifth}`);
  const SR = 48000, n = SR;
  const sig = (probeF, probeDb, level = 1) => { const x = new Float64Array(n); for (let i = 0; i < n; i++) { const t = i / SR; x[i] = level * (CT.A * Math.sin(2 * Math.PI * 1000 * t) + CT.A * Math.sin(2 * Math.PI * 1200 * t) + (probeF ? CT.A * lin(probeDb) * Math.sin(2 * Math.PI * probeF * t) : 0)); } return x; };
  const x = sig(0), a1 = amp(x, SR, 1000);
  const r800 = dB(amp(x, SR, 800) / a1), r200 = dB(amp(x, SR, 200) / a1);
  check('the signal sent has nothing at 800 or 200 Hz (clipper off)', r800 < -200 && r200 < -200, `re the 1000 Hz tone: 800 Hz ${r800.toFixed(0)} dB, 200 Hz ${r200.toFixed(0)} dB, i.e. double-precision zero; the page's own meter reads only to ${CT.METER_FLOOR} dB and says so`);
  // A square-law detector (x², the crudest envelope) on tones + a probe at 805 Hz: a 5 Hz throb needs a component at 800 or 810.
  const xp = sig(805, CT.PROBE_DB), sq = xp.map((v) => v * v);
  const b5 = dB(amp(sq, SR, 5) / amp(sq, SR, 195));
  check('tones + a probe at 805 Hz: no 5 Hz throb in a square-law envelope', b5 < -200, `5 Hz re the probe–tone difference at 195 Hz: ${b5.toFixed(0)} dB (zero); the 5 Hz the reader may hear is not in the air`);
  // A null that can fail: one cochlear-like filter (roex, around 800 Hz) and a compressive envelope (|z|^0.3), the dry
  // three tones against the same with a real 800 Hz at −20 dB re a tone. Exact bins: 65536 samples at 65536 Hz.
  {
    const sr = 65536, n = 65536, mk = (ghostDb) => { const x = new Float64Array(n); for (let i = 0; i < n; i++) { const t = i / sr; x[i] = CT.A * Math.sin(2 * Math.PI * 1000 * t) + CT.A * Math.sin(2 * Math.PI * 1200 * t) + CT.A * lin(CT.PROBE_DB) * Math.sin(2 * Math.PI * 805 * t) + (ghostDb === null ? 0 : CT.A * lin(ghostDb) * Math.sin(2 * Math.PI * 800 * t)); } return x; };
    const X0 = { dry: mk(null), ghost: mk(-20) }, spec = {};
    for (const k in X0) { const re = Float64Array.from(X0[k]), im = new Float64Array(n); MK.fft(re, im); spec[k] = [re, im]; }
    const depth = (k, fc) => { const [R, I] = spec[k], re = new Float64Array(n), im = new Float64Array(n);
      for (let b = 1; b < n / 2; b++) { const w = 2 * Math.sqrt(MK.roex(fc, b)); re[b] = R[b] * w; im[b] = I[b] * w; } // one side: the analytic signal
      MK.fft(re, im, true); const env = new Float64Array(n); let m = 0; for (let i = 0; i < n; i++) { env[i] = Math.pow(Math.hypot(re[i], im[i]) / n, 0.3); m += env[i]; } m /= n;
      return dB(amp(env, sr, 5) / m); };
    let worst = -Infinity, at = 0; for (let fc = 760; fc <= 840; fc += 10) { const d = depth('dry', fc); if (d > worst) { worst = d; at = fc; } }
    const withGhost = depth('ghost', at);
    check('through a filter and a compressive envelope, the dry signal\'s 5 Hz throb is far under a real ghost\'s', withGhost - worst > 20, `dry: ${worst.toFixed(1)} dB (worst filter, ${at} Hz); with an 800 Hz at −20 dB in the signal: ${withGhost.toFixed(1)} dB; margin ${(withGhost - worst).toFixed(1)} dB. The dry throb is not zero (the phase 805 + 1200 − 2·1000 drifts), so this one can fail`);
  }
  // The clipper, read the way a WaveShaperNode reads its curve, at 4 × 48 kHz (the piece asks for 4x oversampling).
  const curve = CT.curve(), SR4 = 192000, n4 = SR4;
  const slope0 = (CT.shape(curve, 1e-3) - CT.shape(curve, -1e-3)) / 2e-3;
  let mono = true; for (let i = 1; i < curve.length; i++) if (curve[i] < curve[i - 1]) mono = false;
  check('the clipper is transparent near zero and never folds back', Math.abs(slope0 - 1) < 0.01 && mono, `slope at zero ${slope0.toFixed(4)}; curve monotonic: ${mono}; drive ${CT.DRIVE}, bias ${CT.BIAS}`);
  const clipped = (levelDb, probeF) => { const L = lin(levelDb), y = new Float64Array(n4); for (let i = 0; i < n4; i++) { const t = i / SR4; const v = L * (CT.A * Math.sin(2 * Math.PI * 1000 * t) + CT.A * Math.sin(2 * Math.PI * 1200 * t) + (probeF ? CT.A * lin(CT.PROBE_DB) * Math.sin(2 * Math.PI * probeF * t) : 0)); y[i] = CT.shape(curve, v); } return y; };
  const rows = [];
  for (const L of [0, -10, -20, -30]) { const y = clipped(L), t1 = amp(y, SR4, 1000); rows.push({ L, c: dB(amp(y, SR4, 800) / t1), q: dB(amp(y, SR4, 200) / t1), u: dB(amp(y, SR4, 1400) / t1), p: peak(y) }); }
  info('the clipper\'s ghosts in the signal, re the 1000 Hz tone', rows.map((r) => `${r.L} dB: 800 Hz ${r.c.toFixed(1)}, 200 Hz ${r.q.toFixed(1)}, 1400 Hz ${r.u.toFixed(1)}`).join(' · '));
  const s1 = (rows[0].c - rows[1].c) / 10, s2 = (rows[1].c - rows[2].c) / 10;
  check('turned down, the clipper\'s 800 Hz falls about 2 dB further below the tones per dB (the piece says "about 2")', s1 > 1.4 && s1 < 2.4 && s2 > 1.4 && s2 < 2.4, `0 → −10 dB: ${s1.toFixed(2)} dB/dB; −10 → −20 dB: ${s2.toFixed(2)} dB/dB (a pure cube would give 2.00)`);
  check('at full level the clipper\'s 800 Hz is within reach of the ear\'s own (Goldstein: roughly −15 to −25 dB)', rows[0].c > -25 && rows[0].c < -12, `${rows[0].c.toFixed(1)} dB at 0 dB; ${rows[1].c.toFixed(1)} dB ten down, well under it`);
  const yc = clipped(0, 805), sqc = yc.map((v) => v * v), b5c = dB(amp(sqc, SR4, 5) / amp(sqc, SR4, 195));
  check('with the clipper on, the same probe does throb at 5 Hz in the air', b5c > -60, `5 Hz re 195 Hz in the square-law envelope: ${b5c.toFixed(1)} dB; the picture pulses here, and only here`);
  const pkDry = peak(sig(1500, -12)), pkWet = rows[0].p, thr = lin(CT.COMP.threshold);
  check('nothing reaches the compressor, so it never bends the signal', pkDry < thr && pkWet < thr, `dry peak with the loudest probe ${dB(pkDry).toFixed(1)} dBFS, clipped peak ${dB(pkWet).toFixed(1)} dBFS, threshold ${CT.COMP.threshold} dBFS`);
  // The analyser's calibration: a sine of amplitude a reads 20·log10(a·0.42/2) under the spec's Blackman window and 1/N.
  const Nw = 32768; let wsum = 0; for (let i = 0; i < Nw; i++) wsum += 0.42 - 0.5 * Math.cos(2 * Math.PI * i / Nw) + 0.08 * Math.cos(4 * Math.PI * i / Nw);
  check('the analyser calibration matches the window', Math.abs(wsum / Nw - 0.42) < 1e-9 && Math.abs(CT.CAL - 13.5556) < 1e-3, `Blackman mean ${(wsum / Nw).toFixed(6)}, CAL ${CT.CAL.toFixed(4)} dB; ampFromDb(20·log10(0.2·0.21)) = ${CT.ampFromDb(dB(0.2 * 0.21)).toFixed(4)}`);
  const lo = CT.ghosts(1000, 1500).cubic, hi = CT.ghosts(1000, 1080).cubic;
  check('the ghost runs backwards across the f2 slider (1080 to 1500 Hz)', lo === 500 && hi === 920, `f2 1080 → ghost ${hi} Hz; f2 1500 → ghost ${lo} Hz; f2/f1 from 1.08 to 1.50`);
  {
    const M = CT.MYSTERY, gLo = CT.ghosts(1000, M.hi).cubic, gHi = CT.ghosts(1000, M.lo).cubic, ch = CT.mysteryChance();
    check('the hidden spacing: the ghost lands in 650–900 Hz, the probe can\'t reach the upper tone, a guess is caught about 4% of the time', gLo === 650 && gHi === 900 && M.probeMax < M.lo && Math.abs(ch - 11 / 251) < 1e-12,
      `f2 ${M.lo}–${M.hi} Hz → ghost ${gLo}–${gHi} Hz; probe stops at ${M.probeMax} Hz, ${M.lo - M.probeMax} Hz under the lowest hidden f2; a fixed guess within ±${M.within} Hz of a uniform ghost: ${(100 * ch).toFixed(1)}% (11/251), two in a row ${(100 * ch * ch).toFixed(2)}%`);
  }
  info('levels', `each tone ${dB(CT.A).toFixed(1)} dBFS; probe ${CT.PROBE_DB} dB re a tone (softer −32, louder −12)`);
}

console.log('— the hiding place —');
{
  check('the critical band at 1 kHz', Math.abs(MK.erb(1000) - 132.639) < 0.01 && MK.roex(1000, 1000) === 1, `ERB(1000) = ${MK.erb(1000).toFixed(1)} Hz (Glasberg and Moore); roex at its centre = 1`);
  const fmt = (sp) => sp ? `${sp[0].toFixed(0)}–${sp[1].toFixed(0)} Hz` : 'nothing';
  const spans = [-24, -12, 0, 6].map((d) => `${d >= 0 ? '+' : ''}${d} dB: ${fmt(MK.span(d, 'tone'))}`);
  info('the symmetric model\'s hidden span (tone masker, cricket fixed at −30 dB re 0)', spans.join(' · ') + ` · noise band at 0 dB: ${fmt(MK.span(0, 'noise'))}`);
  const leans = [-12, 0, 6].map((d) => { const sp = MK.span(d, 'tone'); return { d, up: Math.log2(sp[1] / 1000), down: Math.log2(1000 / sp[0]) }; });
  check('the model leans up by one hop at most (the piece says "at +6 dB one hop further up than down, no more")', leans.every((l) => l.up - l.down <= 1 / 6 + 1e-9) && Math.abs(leans[2].up - leans[2].down - 1 / 6) < 1e-9,
    leans.map((l) => `${l.d >= 0 ? '+' : ''}${l.d} dB: ${l.up.toFixed(2)} oct up, ${l.down.toFixed(2)} down`).join(' · ') + '; a stronger lean in the reader\'s red is their ear\'s, not the model\'s');
  check('the blind trial (noise masker): close is hidden by the model, far is heard', MK.hidden(MK.NEAR, 0, 'noise') && !MK.hidden(MK.FAR, 0, 'noise') && /S\.type = 'noise'; S\.maskDb = 0;/.test(P.hide), `close ${MK.NEAR.toFixed(1)} Hz: the noise through its filter ${MK.leak(MK.NEAR, 'noise').toFixed(1)} dB vs cricket ${MK.CRICKET_DB}; far ${MK.FAR.toFixed(1)} Hz: ${MK.leak(MK.FAR, 'noise').toFixed(1)} dB; the trial code sets the noise band`);
  for (const sr of [44100, 48000]) {
    const x = MK.noiseBand(sr), n = x.length, [lo, hi] = MK.band();
    const re = new Float64Array(n), im = new Float64Array(n); for (let i = 0; i < n; i++) re[i] = x[i]; MK.fft(re, im);
    let all = 0, inb = 0; for (let k = 1; k < n / 2; k++) { const p = re[k] * re[k] + im[k] * im[k]; all += p; const f = k * sr / n; if (f >= lo - sr / n && f <= hi + sr / n) inb += p; }
    const pk = peak(x), maxPeak = pk * MK.AM * lin(6), seam = Math.abs(x[n - 1] - x[0]); let maxStep = 0; for (let i = 1; i < n; i++) maxStep = Math.max(maxStep, Math.abs(x[i] - x[i - 1]));
    check(`noise band at ${sr} Hz: one ERB wide, a sine's RMS, under the compressor at +6 dB, no seam`, inb / all > 0.999999 && Math.abs(rms(x) - Math.SQRT1_2) < 1e-6 && maxPeak < lin(MK.COMP.threshold) && seam <= maxStep,
      `${lo.toFixed(1)}–${hi.toFixed(1)} Hz holds ${(100 * inb / all).toFixed(4)}% of its energy; RMS ${rms(x).toFixed(4)}; crest ${dB(pk / rms(x)).toFixed(1)} dB; peak at +6 dB ${dB(maxPeak).toFixed(1)} dBFS vs threshold ${MK.COMP.threshold}; the step across the loop point ${seam.toFixed(4)} is an ordinary one (largest step inside ${maxStep.toFixed(4)})`);
  }
  const tonePk = MK.AM * lin(6) + MK.AM * lin(MK.CRICKET_DB);
  check('the tone masker at +6 dB with the cricket stays under the compressor', tonePk < lin(MK.COMP.threshold), `peak ${dB(tonePk).toFixed(1)} dBFS; the cricket alone ${dB(MK.AM * lin(MK.CRICKET_DB)).toFixed(1)} dBFS`);
  // One chirp at 1 kHz: how far its energy spreads, against the filter it has to stand out in.
  {
    const sr = 48000, n = 1 << 16, c = MK.chirpCurve(), len = Math.round(MK.CHIRP.on * sr), re = new Float64Array(n), im = new Float64Array(n);
    for (let i = 0; i < len; i++) { const u = i / len * (c.length - 1), j = Math.floor(u), f = u - j; const e = j >= c.length - 1 ? c[c.length - 1] : c[j] * (1 - f) + c[j + 1] * f; re[i] = e * Math.sin(2 * Math.PI * 1000 * i / sr); }
    MK.fft(re, im); let pmax = 0; const P2 = []; for (let k = 0; k < n / 2; k++) { const p = re[k] * re[k] + im[k] * im[k]; P2.push(p); if (p > pmax) pmax = p; }
    let w30 = 0, all = 0, inErb = 0; const e2 = MK.erb(1000) / 2; for (let k = 0; k < n / 2; k++) { const f = k * sr / n; all += P2[k]; if (Math.abs(f - 1000) <= e2) inErb += P2[k]; if (10 * Math.log10(P2[k] / pmax) > -30) w30 = Math.max(w30, Math.abs(f - 1000)); }
    check('a chirp keeps nearly all its energy inside one critical band', inErb / all > 0.99, `${(100 * inErb / all).toFixed(2)}% within ±${e2.toFixed(0)} Hz of 1 kHz (one ERB); its skirts stay within 30 dB of the peak out to ±${w30.toFixed(0)} Hz, the price of 70 ms chirps with ${MK.CHIRP.ramp * 1000} ms raised-cosine ramps`);
  }
  // A blind trial with and without the cricket: the same loud tone; the only difference is the chirps.
  {
    const sr = 48000, n = 2 * sr, c = MK.chirpCurve(), a = MK.AM * lin(MK.CRICKET_DB), m = new Float64Array(n), w = new Float64Array(n);
    const nb = MK.noiseBand(sr); for (let i = 0; i < n; i++) m[i] = MK.AM * nb[i % nb.length];
    for (let i = 0; i < n; i++) { const t = i / sr - 0.15; let e = 0; if (t >= 0) { const ph = t % MK.CHIRP.every; if (ph < MK.CHIRP.on) { const u = ph / MK.CHIRP.on * (c.length - 1), j = Math.floor(u), f = u - j; e = j >= c.length - 1 ? 0 : c[j] * (1 - f) + c[j + 1] * f; } } w[i] = m[i] + a * e * Math.sin(2 * Math.PI * MK.NEAR * i / sr); }
    const d = dB(rms(w) / rms(m));
    check('with and without the cricket, a close trial (noise masker) differs in level by almost nothing', Math.abs(d) < 0.05, `${d.toFixed(4)} dB of RMS; the only difference is the chirps themselves`);
  }
  check('the chance figures', Math.abs(MK.atLeast(7, 8, 0.5) - 9 / 256) < 1e-12 && Math.abs(MK.atLeast(4, 8, 0.5) - 163 / 256) < 1e-12, `P(≥7 of 8) = ${MK.atLeast(7, 8, 0.5).toFixed(4)} = 9/256; P(≥4 of 8) = ${MK.atLeast(4, 8, 0.5).toFixed(4)}`);
  const fills = [...P.hide.matchAll(/<rect id="(sqL|sqR|bridge)"[^>]*fill="(#[0-9a-f]{6})"/g)].map((m) => m[2]);
  check('the twin\'s squares are one grey', fills.length === 3 && fills.every((f) => f === MK.GREY), `sqL, sqR, bridge: ${fills.join(', ')}; MK.GREY ${MK.GREY}`);
}

console.log('— both pieces —');
for (const [name, html] of Object.entries(P)) {
  const ac = (html.match(/new AudioContext\(/g) || []).length, inEnsure = /function ensure\(\)[\s\S]{0,80}new AudioContext\(\)/.test(html);
  check(`${name}: one AudioContext, made inside ensure(), which only a press calls`, ac === 1 && inEnsure, `${ac} construction(s)`);
  check(`${name}: declares no needs, no detached Audio, no hush word`, /<meta name="piece:needs" content="">/.test(html) && !/new Audio\(/.test(html) && !/rich:hush/.test(html), 'piece:needs empty');
}
console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
