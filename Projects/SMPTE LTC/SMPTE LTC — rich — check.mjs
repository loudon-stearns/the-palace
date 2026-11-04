// SMPTE LTC — rich — check.mjs
// born: 2026-11-04 · checks [[SMPTE LTC]]' rich-face pieces: encoder, drop-frame, backward
// forward_vector: I re-run, headless, every claim the three LTC pieces make, on the very engine they carry. I check that the
// three pieces carry the same core; that a timecode survives its eighty bits; that the audio the encoder renders flips at every
// cell boundary and once more in the middle of exactly the 1s; that the page's three bit rates are what the encoder makes; that a
// reader told nothing reads every frame back at all three rates and upside down, while the same bits with no clock read nothing;
// that drop-frame labels a whole day without a fault and how far it sits from the wall clock; that the reader reads backward and
// at fractional and shuttle speeds, fails where the sample rate can't hold a half cell, and that a forward-only reader reads
// nothing backward; and what share of the sound's power sits in 500 Hz to 3 kHz. What anyone hears I cannot check.
//
//   node "Projects/SMPTE LTC/SMPTE LTC — rich — check.mjs"
//
// PASS/FAIL per claim, numbers printed; exits 1 on any FAIL. Reads only; writes nothing.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const PIECES = ['encoder', 'drop-frame', 'backward'];
const cores = PIECES.map((p) => {
  const html = readFileSync(join(HERE, `SMPTE LTC — rich — ${p}.html`), 'utf8');
  const m = html.match(/<script id="ltc-core">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`no <script id="ltc-core"> in ${p}`);
  return m[1];
});

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };

check('the three pieces carry one core', cores.every((c) => c === cores[0]), `${cores[0].length} chars each`);
const E = { Math, Float32Array, Float64Array, Uint8Array, Object, Array, String, Infinity };
vm.createContext(E);
vm.runInContext(cores[0] + '\nthis.LTC = LTC;', E);
const L = E.LTC, SR = 48000, FPS = 30000 / 1001;

// ── Technical Architecture: the word ───────────────────────────────────────
let rnd = 1; const rand = () => ((rnd = (rnd * 1664525 + 1013904223) >>> 0) / 4294967296);
let roundBad = 0, parityBad = 0, n = 0;
for (const rk of ['24', '25', '29.97']) {
  const nom = L.RATES[rk].nominal;
  for (let i = 0; i < 5000; i++) {
    const tc = { h: Math.floor(rand() * 24), m: Math.floor(rand() * 60), s: Math.floor(rand() * 60), f: Math.floor(rand() * nom) };
    if (L.RATES[rk].df && !L.labelValid(tc, 'df')) continue;
    const ub = Array.from({ length: 8 }, () => Math.floor(rand() * 16));
    const b = L.encode(tc, rk, ub), back = L.decodeWord(b);
    n++;
    if (!back || back.h !== tc.h || back.m !== tc.m || back.s !== tc.s || back.f !== tc.f) roundBad++;
    if (b.reduce((a, x) => a + x, 0) % 2) parityBad++;
  }
}
check('a timecode survives its 80 bits', roundBad === 0, `${n} random words at three rates, ${roundBad} wrong`);
check('every word carries an even count of 1s (polarity bit)', parityBad === 0, `${parityBad} odd`);

let longest = 0;
for (const rk of ['24', '25', '29.97']) for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m++) for (let s = 0; s < 60; s++) for (let f = 0; f < L.RATES[rk].nominal; f++) {
  if (L.RATES[rk].df && !L.labelValid({ h, m, s, f }, 'df')) continue;
  const b = L.encode({ h, m, s, f }, rk, [15, 15, 15, 15, 15, 15, 15, 15]);
  const pb = L.polarityBit(L.RATES[rk].nominal);
  for (const i of [10, 11, 27, 43, 58, 59]) if (i !== pb) b[i] = 1;
  b[pb] = 0; if (b.reduce((a, x) => a + x, 0) % 2) b[pb] = 1;
  let run = 0; for (let i = 0; i < 64; i++) { run = b[i] ? run + 1 : 0; if (run > longest) longest = run; }
}
check('the data can never hold the sync word’s twelve 1s', longest < 12, `every timecode of the day at three rates, every user bit and flag set: longest run of 1s in bits 0–63 is ${longest}`);

// ── Technical Architecture: the rendered audio flips where the page says ──
for (const rk of ['24', '25', '29.97']) {
  const tp = L.tape({ h: 1, m: 23, s: 45, f: 12 }, 20, rk), N = Math.round(tp.dur * SR);
  const y = L.play(tp, SR, N, (t) => t, {});
  const cell = tp.bitT, bad = { offGrid: 0, midOn0: 0, noMidOn1: 0, noBoundary: 0 };
  const zc = []; for (let i = 1; i < N; i++) if ((y[i - 1] < 0) !== (y[i] < 0)) zc.push((i - 1 + y[i - 1] / (y[i - 1] - y[i])) / SR);
  const at = new Map();
  for (const t of zc) {
    const u = t / cell, k = Math.round(u * 2);                     // nearest half-cell mark
    if (Math.abs(u * 2 - k) * cell / 2 > 1.5 / SR) { bad.offGrid++; continue; }
    at.set(k, true);
  }
  for (let i = 1; i < tp.bits.length; i++) {
    if (!at.get(2 * i)) bad.noBoundary++;
    const mid = at.get(2 * i + 1);
    if (tp.bits[i] && !mid) bad.noMidOn1++;
    if (!tp.bits[i] && mid) bad.midOn0++;
  }
  check(`${rk}: the audio flips at every cell boundary and mid-cell on exactly the 1s`, !bad.offGrid && !bad.noBoundary && !bad.noMidOn1 && !bad.midOn0,
    `${zc.length} zero crossings in ${tp.bits.length} cells; off the half-cell grid ${bad.offGrid}, boundary missing ${bad.noBoundary}, 1 with no mid flip ${bad.noMidOn1}, 0 with a mid flip ${bad.midOn0}`);
}

const pageRates = { '24': 1920, '25': 2000, '29.97': 2397.6 };
for (const rk of Object.keys(pageRates)) {
  const R = 80 * L.RATES[rk].fps;
  check(`${rk}: the page’s bit rate is the encoder’s`, Math.abs(R - pageRates[rk]) < 0.005, `encoder ${R.toFixed(4)}, page ${pageRates[rk]}`);
}

// ── Technical Architecture: a reader told nothing ──────────────────────────
for (const [rk, o] of [['24', {}], ['25', {}], ['29.97', {}], ['25', { flip: true }]]) {
  const start = rk === '29.97' ? { h: 1, m: 23, s: 45, f: 12 } : { h: 1, m: 23, s: 45, f: 12 };
  const tp = L.tape(start, 50, rk), y = L.play(tp, SR, Math.round(tp.dur * SR), (t) => t, { hp: 10, noise: 0.03, seed: 7 });
  if (o.flip) for (let i = 0; i < y.length; i++) y[i] = -y[i];
  const rd = L.read(y, SR), sc = L.score(rd, tp, 1);
  check(`${rk}${o.flip ? ' flipped' : ''}: the reader reads every frame back`, sc.distinct === 50 && sc.wrong === 0, `${sc.distinct} of 50, ${sc.wrong} wrong, rate guessed ${(1 / rd.period).toFixed(1)}`);
}
{
  const tp = L.tape({ h: 1, m: 23, s: 45, f: 12 }, 50, '25'), y = L.play(L.tapeNRZ(tp), SR, Math.round(tp.dur * SR), (t) => t, { hp: 10, noise: 0.03, seed: 7 });
  const sc = L.score(L.read(y, SR), tp, 1);
  check('control: the same bits with no clock read nothing', sc.distinct === 0, `${sc.distinct} of 50 read`);
}

// ── Technical Architecture: drop-frame over a day ──────────────────────────
{
  const perDay = 107892 * 24, seen = new Uint8Array(24 * 3600 * 30); let dup = 0, forbidden = 0, back = 0;
  for (let k = 0; k < perDay; k++) {
    const tc = L.frameToLabel(k, 30, 'df'), key = ((tc.h * 60 + tc.m) * 60 + tc.s) * 30 + tc.f;
    if (seen[key]) dup++; seen[key] = 1;
    if (!L.labelValid(tc, 'df')) forbidden++;
    if (L.labelToFrame(tc, 30, 'df') !== k) back++;
  }
  let unused = 0; for (let k = 0; k < seen.length; k++) if (!seen[k]) unused++;
  check('drop-frame: a day of labels, no duplicate, no forbidden label, every label back to its frame', !dup && !forbidden && !back && unused === 2592,
    `${perDay} frames; duplicates ${dup}, forbidden ${forbidden}, inverse faults ${back}, unused labels ${unused} (2592 expected)`);
  const gap = (hours, mode) => { const k = Math.floor(hours * 3600 * FPS + 1e-9); return (L.labelIndex(k, 30, mode) - (mode === 'every' ? 2 : 0)) / 30 - k / FPS; };
  const marks = [1, 2, 3, 4, 5, 6].map((j) => gap(j / 6, 'df'));
  check('drop-frame: within one frame at each ten-minute mark of hour 1', marks.every((g) => Math.abs(g) < 1 / FPS), marks.map((g) => (g * 1000).toFixed(2)).join(', ') + ' ms');
  let lo = Infinity, hi = -Infinity; for (let k = 0; k < 3600 * FPS; k++) { const g = (L.labelIndex(k, 30, 'df')) / 30 - k / FPS; lo = Math.min(lo, g); hi = Math.max(hi, g); }
  console.log(`      drop-frame, printed: at 1 h ${(gap(1, 'df') * 1000).toFixed(2)} ms, 10 h ${(gap(10, 'df') * 1000).toFixed(2)} ms, 24 h ${(gap(24, 'df') * 1000).toFixed(2)} ms (${(gap(24, 'df') * FPS).toFixed(2)} frames); wobble in hour 1 ${(lo * 1000).toFixed(1)} to ${(hi * 1000).toFixed(1)} ms`);
  console.log(`      the page’s sentence read word for word (skip at every minute): ${(gap(1, 'every') * 1000).toFixed(1)} ms an hour ahead; no skipping: ${(gap(1, 'none')).toFixed(3)} s an hour`);
  check('drop-frame: the every-minute reading over-corrects by about 0.4 s an hour', Math.abs(gap(1, 'every') - 0.4036) < 0.01, `${(gap(1, 'every') * 1000).toFixed(1)} ms`);
}

// ── Open Questions: backward and at speed ──────────────────────────────────
{
  const START = { h: 10, m: 0, s: 0, f: 0 }, rows = [];
  let ok = true;
  for (const s of [-16, -12, -8, -4, -2, -1, -0.5, -0.25, -0.1, 0.1, 0.25, 0.5, 1, 2, 4, 8, 12, 16]) {
    const tp = L.tape(START, 50, '25'), a = L.atSpeed(tp, s);
    const y = L.play(tp, SR, Math.ceil(a.dur * SR), a.pos, { hp: 10, noise: 0.03, seed: 11 }), rd = L.read(y, SR), sc = L.score(rd, tp, Math.sign(s));
    const fwdOnly = rd.frames.filter((f) => f.dir > 0).length;
    const fast = Math.abs(s) >= 12, pass = fast ? sc.distinct === 0 : (sc.distinct === 50 && sc.wrong === 0 && sc.dirWrong === 0);
    const ctlOk = s > 0 || fwdOnly === 0;
    if (!pass || !ctlOk) ok = false;
    rows.push(`${s}×: ${sc.distinct}/50, wrong ${sc.wrong}, dir wrong ${sc.dirWrong}${s < 0 ? `, forward-only ${fwdOnly}` : ''}${fast ? ' (must fail)' : ''}`);
  }
  check('backward and at speed: all 50 frames from −8× to +8× either way, none at ±12× and ±16×, forward-only reader none backward', ok, rows.join(' · '));
  const tp = L.tape(START, 50, '25'), v0 = 2, D = 4 * 0.9 * tp.dur / v0, pos = (t) => v0 * t - v0 * t * t / D;
  const rd = L.read(L.play(tp, SR, Math.ceil(D * SR), pos, { hp: 10, noise: 0.03, seed: 11 }), SR);
  const fw = rd.frames.filter((f) => f.dir > 0).length, bw = rd.frames.filter((f) => f.dir < 0).length, whole = Math.floor(0.9 * tp.dur / (tp.dur / 52)) - 1;
  console.log(`      shuttle +2× → 0 → −2×, printed: ${fw} forward, ${bw} backward, of ${whole} frames that passed whole`);
}

// ── Open Questions: where the sound’s power sits ───────────────────────────
for (const rk of ['24', '25', '29.97']) {
  const tp = L.tape({ h: 14, m: 27, s: 3, f: 0 }, Math.round(6 * L.RATES[rk].fps), rk);
  const y = L.play(tp, SR, Math.round(tp.dur * SR), (t) => t, { hp: 10 }), sp = L.spectrum(y.subarray(SR / 2), SR, 16384);
  console.log(`      ${rk}: power below 500 Hz ${(100 * L.bandShare(sp, 0, 500)).toFixed(1)}%, 500 Hz–3 kHz ${(100 * L.bandShare(sp, 500, 3000)).toFixed(1)}%, above 3 kHz ${(100 * L.bandShare(sp, 3000, SR / 2)).toFixed(1)}%`);
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
