// SMPTE LTC — rich — check.mjs
// born: 2026-11-04 · checks [[SMPTE LTC]]' rich-face pieces: encoder, backward (the drop-frame piece retired 2026-11-04; the teaching room's own checks hold drop-frame)
// forward_vector: I re-run, headless, every claim the two LTC pieces make, on the very engine they carry. I check that the
// two pieces carry the same core; that a timecode survives its eighty bits; that the audio the encoder renders flips at every
// cell boundary and once more in the middle of exactly the 1s; that the page's four bit rates are what the encoder makes; that a
// reader told nothing reads every frame back at all six rates and upside down and names each rate from its sync words, while the same bits with no clock read nothing;
// that the reader reads backward and
// at fractional and shuttle speeds, and reads the speed from the sync words' spacing, fails where the sample rate can't hold a half cell, and that a forward-only reader reads
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
const PIECES = ['encoder', 'backward'];
const cores = PIECES.map((p) => {
  const html = readFileSync(join(HERE, `SMPTE LTC — rich — ${p}.html`), 'utf8');
  const m = html.match(/<script id="ltc-core">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`no <script id="ltc-core"> in ${p}`);
  return m[1];
});

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };

check('the two pieces carry one core', cores.every((c) => c === cores[0]), `${cores[0].length} chars each`);
const E = { Math, Float32Array, Float64Array, Uint8Array, Object, Array, String, Infinity };
vm.createContext(E);
vm.runInContext(cores[0] + '\nthis.LTC = LTC;', E);
const L = E.LTC, SR = 48000, FPS = 30000 / 1001;

// ── The fine points: the word ─────────────────────────────────────────────────
let rnd = 1; const rand = () => ((rnd = (rnd * 1664525 + 1013904223) >>> 0) / 4294967296);
let roundBad = 0, parityBad = 0, n = 0;
for (const rk of ['23.976', '24', '25', '29.97 ndf', '29.97', '30']) {
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
check('a timecode survives its 80 bits', roundBad === 0, `${n} random words at six rates, ${roundBad} wrong`);
check('every word carries an even count of 1s (polarity bit)', parityBad === 0, `${parityBad} odd`);

let longest = 0;
for (const rk of ['23.976', '24', '25', '29.97 ndf', '29.97', '30']) for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m++) for (let s = 0; s < 60; s++) for (let f = 0; f < L.RATES[rk].nominal; f++) {
  if (L.RATES[rk].df && !L.labelValid({ h, m, s, f }, 'df')) continue;
  const b = L.encode({ h, m, s, f }, rk, [15, 15, 15, 15, 15, 15, 15, 15]);
  const pb = L.polarityBit(L.RATES[rk].nominal);
  for (const i of [10, 11, 27, 43, 58, 59]) if (i !== pb) b[i] = 1;
  b[pb] = 0; if (b.reduce((a, x) => a + x, 0) % 2) b[pb] = 1;
  let run = 0; for (let i = 0; i < 64; i++) { run = b[i] ? run + 1 : 0; if (run > longest) longest = run; }
}
check('the data can never hold the sync word’s twelve 1s', longest < 12, `every timecode of the day at six rates, every user bit and flag set: longest run of 1s in bits 0–63 is ${longest}`);

// ── The fine points: the rendered audio flips where the page says (biphase mark) ──
for (const rk of ['23.976', '24', '25', '29.97 ndf', '29.97', '30']) {
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

const pageRates = { '24': 1920, '25': 2000, '30': 2400, '29.97': 2397.6 };
for (const rk of Object.keys(pageRates)) {
  const R = 80 * L.RATES[rk].fps;
  check(`${rk}: the page’s bit rate is the encoder’s`, Math.abs(R - pageRates[rk]) < 0.005, `encoder ${R.toFixed(4)}, page ${pageRates[rk]}`);
}

// ── Every form: a reader told nothing names the rate it hears ──────────────────────────
for (const [rk, o] of [['23.976', {}], ['24', {}], ['25', {}], ['29.97 ndf', {}], ['29.97', {}], ['30', {}], ['25', { flip: true }]]) {
  const start = { h: 1, m: 23, s: 45, f: 12 };
  const tp = L.tape(start, 50, rk), y = L.play(tp, SR, Math.round(tp.dur * SR), (t) => t, { hp: 10, noise: 0.03, seed: 7 });
  if (o.flip) for (let i = 0; i < y.length; i++) y[i] = -y[i];
  const rd = L.read(y, SR), sc = L.score(rd, tp, 1);
  check(`${rk}${o.flip ? ' flipped' : ''}: the reader reads every frame back`, sc.distinct === 50 && sc.wrong === 0, `${sc.distinct} of 50, ${sc.wrong} wrong, rate guessed ${(1 / rd.period).toFixed(1)}`);
  check(`${rk}${o.flip ? ' flipped' : ''}: the reader names the rate from its sync words`, rd.rate === rk, `named "${rd.rate}" from ${rd.fps.toFixed(4)} fps, drop-frame ${rd.df}`);
}
{
  const tp = L.tape({ h: 1, m: 23, s: 45, f: 12 }, 50, '25'), y = L.play(L.tapeNRZ(tp), SR, Math.round(tp.dur * SR), (t) => t, { hp: 10, noise: 0.03, seed: 7 });
  const sc = L.score(L.read(y, SR), tp, 1);
  check('control: the same bits with no clock read nothing', sc.distinct === 0, `${sc.distinct} of 50 read`);
}

// ── The fine points: the sync word, backward and at speed ──────────────────────────────────
{
  const START = { h: 10, m: 0, s: 0, f: 0 }, rows = [], PATH = { hp: 10, noise: 0.03, seed: 11 };
  for (const rk of ['23.976', '24', '25', '29.97 ndf', '29.97', '30']) {
    const tp = L.tape(START, 50, rk), y = L.play(tp, SR, Math.round(tp.dur * SR), (t) => t, {});
    const rd = L.read(L.path(Float32Array.from(y).reverse(), SR, PATH), SR), sc = L.score(rd, tp, -1);
    check(`${rk}: a 1× recording with its samples reversed reads back`, sc.distinct === 50 && sc.wrong === 0 && sc.dirWrong === 0, `${sc.distinct}/50, wrong ${sc.wrong}, direction wrong ${sc.dirWrong}`);
    check(`${rk}: reversed, the sync words still give the speed, −1×`, Math.abs(rd.fps / L.RATES[rk].fps - 1) < 0.001 && rd.frames[0].dir < 0, `${(rd.fps / L.RATES[rk].fps).toFixed(4)}×, read ${rd.frames[0].dir < 0 ? 'backward' : 'forward'}`);
  }
  let ok = true, spOk = true; const edge = [], res = [], sps = [];
  const tp1 = L.tape(START, 50, '25'), one = L.play(tp1, SR, Math.round(tp1.dur * SR), (t) => t, {});
  for (const s of [-16, -12, -8, -6, -4, -2, -1, -0.5, -0.25, -0.1, 0.1, 0.25, 0.5, 1, 2, 4, 6, 8, 12, 16]) {
    const tp = L.tape(START, 50, '25'), a = L.atSpeed(tp, s);
    const y = L.play(tp, SR, Math.ceil(a.dur * SR), a.pos, PATH), rd = L.read(y, SR), sc = L.score(rd, tp, Math.sign(s));
    const fwdOnly = rd.frames.filter((f) => f.dir > 0).length;
    const rs = L.score(L.read(L.path(L.resample(one, s), SR, PATH), SR), tp1, Math.sign(s));
    res.push(`${s}× ${rs.distinct}`);
    if (Math.abs(s) >= 12) { edge.push(`${s}× ${sc.distinct}/50`); continue; }
    const sr = rd.fps / 25; sps.push(`${s}× → ${sr.toFixed(4)}`);
    if (!(Math.abs(sr - Math.abs(s)) / Math.abs(s) < 0.001 && (rd.frames[0].dir > 0) === (s > 0))) spOk = false;
    if (!(sc.distinct === 50 && sc.wrong === 0 && sc.dirWrong === 0) || (s < 0 && fwdOnly !== 0)) ok = false;
    rows.push(`${s}×: ${sc.distinct}/50, wrong ${sc.wrong}, dir wrong ${sc.dirWrong}${s < 0 ? `, forward-only ${fwdOnly}` : ''}`);
  }
  check('time-scaled speeds: all 50 frames from 0.1× to 8× either way; forward-only reader none backward', ok, rows.join(' · '));
  check('the length of the sync word tells the speed: spacing ÷ the 25 fps rate is the speed to 0.1 %, from 0.1× to 8× either way', spOk, sps.join(' · '));
  console.log(`      near Nyquist (12×, 16×; the limit, not judged): ${edge.join(', ')}`);
  console.log(`      same speeds through a plain linear resampler of a 1× buffer, frames of 50 (printed): ${res.join(', ')}`);
  const tp = L.tape(START, 50, '25'), v0 = 2, D = 4 * 0.9 * tp.dur / v0, pos = (t) => v0 * t - v0 * t * t / D;
  const rd = L.read(L.play(tp, SR, Math.ceil(D * SR), pos, { hp: 10, noise: 0.03, seed: 11 }), SR);
  const fw = rd.frames.filter((f) => f.dir > 0).length, bw = rd.frames.filter((f) => f.dir < 0).length, whole = Math.floor(0.9 * tp.dur / (tp.dur / 52)) - 1;
  console.log(`      shuttle +2× → 0 → −2×, printed: ${fw} forward, ${bw} backward, of ${whole} frames that passed whole`);
}

// ── The fine points, level and edge: where the sound’s power sits ───────────────────────────
for (const rk of ['23.976', '24', '25', '29.97 ndf', '29.97', '30']) {
  const tp = L.tape({ h: 14, m: 27, s: 3, f: 0 }, Math.round(6 * L.RATES[rk].fps), rk);
  const y = L.play(tp, SR, Math.round(tp.dur * SR), (t) => t, { hp: 10 }), sp = L.spectrum(y.subarray(SR / 2), SR, 16384);
  console.log(`      ${rk}: power below 500 Hz ${(100 * L.bandShare(sp, 0, 500)).toFixed(1)}%, 500 Hz–3 kHz ${(100 * L.bandShare(sp, 500, 3000)).toFixed(1)}%, above 3 kHz ${(100 * L.bandShare(sp, 3000, SR / 2)).toFixed(1)}%`);
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
