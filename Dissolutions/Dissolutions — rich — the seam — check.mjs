// Dissolutions — rich — the seam — check.mjs
// born: 2026-11-03 · checks [[Dissolutions]]' rich-face piece "Dissolutions — rich — the seam.html"
// forward_vector: I re-run, headless, every claim the seam piece makes about its own engine: that one
// equation with fixed levels runs at every reader speed (no crossfade, no filter, nothing that knows the
// rate), that the glide is the curve it names, and that the share-above-20-Hz number the page shows is
// what the engine's audio actually holds. What a listener hears at the seam I cannot check.
//
//   node "Dissolutions/Dissolutions — rich — the seam — check.mjs"
//
// It pulls the page's <script id="seam-core"> and <script id="seam-worklet"> out of the HTML, runs the
// worklet's process() in Node with a stand-in AudioWorkletProcessor, and compares against an equation
// written here independently. PASS/FAIL per claim; exits 1 on any FAIL. Reads only; writes nothing.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(HERE, 'Dissolutions — rich — the seam.html'), 'utf8');
const block = (id) => {
  const m = html.match(new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)</script>`));
  if (!m) throw new Error(`no <script id="${id}"> in the piece`);
  return m[1];
};

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };

// ── load the page's core and worklet into one sandbox, as the Blob does ─────────
const SR = 48000;
function loadEngine() {
  const sandbox = { Math, Float64Array, Float32Array, sampleRate: SR, registered: null };
  sandbox.AudioWorkletProcessor = class { constructor() { this.port = { onmessage: null, sent: [], postMessage(m) { this.sent.push(m); } }; } };
  sandbox.registerProcessor = (name, cls) => { sandbox.registered = cls; };
  vm.createContext(sandbox);
  vm.runInContext(block('seam-core') + '\n' + block('seam-worklet') + '\nthis.SEAM = SEAM;', sandbox);
  return sandbox;
}
const E = loadEngine();
const make = (msg) => { const p = new E.registered(); p.port.onmessage({ data: msg }); return p; };
const send = (p, msg) => p.port.onmessage({ data: msg });
function render(p, n) {
  const L = new Float32Array(n), R = new Float32Array(n);
  for (let o = 0; o < n; o += 128) {
    const k = Math.min(128, n - o), l = new Float32Array(k), r = new Float32Array(k);
    p.process([], [[l, r]]); L.set(l, o); R.set(r, o);
  }
  return { L, R };
}

// ── the equation, written here on its own ─────────────────────────────────────
// f(t, c) = (e^(−c t) − e^(−c)) ÷ (1 − e^(−c)); mean over t of f; reader out and back
const fOwn = (t, c) => Math.abs(c) < 1e-4 ? 1 - t : (Math.exp(-c * t) - Math.exp(-c)) / (1 - Math.exp(-c));
function meanOwn(c) { let s = 0; const K = 200000; for (let i = 0; i < K; i++) s += fOwn((i + 0.5) / K, c); return s / K; }

// 1 · the core's average height matches a numerical integral
{
  let worst = 0;
  for (const c of [-8, -5, -1, 0, 0.5, 5, 8]) worst = Math.max(worst, Math.abs(E.curveMean(c) - meanOwn(c)));
  check('core: the average height m(c) the straight wire subtracts is the curve\'s mean', worst < 1e-8, `largest miss ${worst.toExponential(2)} over c = −8 … 8`);
}

// 2 · one equation, fixed levels, at every reader speed
{
  const A = 0.30, B = 0.60, FC = 220;
  let worst = 0, levelsOk = true, rows = [];
  for (const c of [-5, 0, 5]) for (const rate of [0.5, 2, 8, 15, 19, 20, 21, 25, 40, 110, 220]) {
    const p = make({ rate, c, loud: 1, straight: 1 });
    const n = SR; const { L, R } = render(p, n);
    let ph = 0, cp = 0, m = E.curveMean(c), d = 0;
    for (let i = 0; i < n; i++) {
      ph += rate / SR; if (ph >= 1) ph -= 1; cp += FC / SR; if (cp >= 1) cp -= 1;
      const f = fOwn(1 - Math.abs(2 * ph - 1), c);
      const y = A * f * Math.sin(2 * Math.PI * cp) + B * (f - m);
      d = Math.max(d, Math.abs(L[i] - y), Math.abs(R[i] - L[i]));
    }
    worst = Math.max(worst, d);
    const last = p.port.sent.filter((x) => typeof x.A === 'number').pop();
    if (!last || last.A !== A || last.B !== B) levelsOk = false;
    if (c === 5 && [2, 20, 110].includes(rate)) rows.push(`${rate} Hz ${d.toExponential(1)}`);
  }
  check('engine: at every reader speed from 0.5 to 220 Hz the output is y = 0.30·f·sin(2π·220·t) + 0.60·(f − m), both channels', worst < 2e-7, `largest difference ${worst.toExponential(2)} over 33 speed and curvature pairs; ${rows.join(', ')}`);
  check('engine: the levels it reports are A = 0.30 and B = 0.60 at every one of those speeds', levelsOk, 'read from the port, as the test step reads them at a mark');
}

// 3 · nothing in the engine knows the rate except the reader's step
{
  const code = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
  const src = code(block('seam-worklet')), core = code(block('seam-core'));
  const uses = (src.match(/this\.rate/g) || []).length;
  const onlyStep = /this\.ph \+= this\.rate \/ sr/.test(src);
  const noFilters = !/Biquad|filter|crossfade|mix/i.test(core + src);
  check('engine: the rate enters only as the reader\'s step; no filter, no crossfade', onlyStep && noFilters, `this.rate appears ${uses} times: set, glided, stepped, reported; no filter or mix term in core or worklet`);
}

// 4 · the glide is the curve the test step names: r(s) = 4 × 16^(s ÷ 24)
{
  const p = make({ rate: 4, c: 5, loud: 1, straight: 1 });
  send(p, { glide: { from: 4, to: 64, seconds: 24 } });
  const at = {}, want = { 6: 8, 12: 16, 18: 32 };
  let prevT = null, jump = 0, done = false;
  const l = new Float32Array(1);
  for (let o = 0; o < 25 * SR; o++) {
    p.process([], [[l, l]]);
    const s = (o + 1) / SR;
    for (const k of Object.keys(want)) if (!at[k] && s >= +k) at[k] = p.rate;
    const t = 1 - Math.abs(2 * p.ph - 1);
    if (prevT !== null) jump = Math.max(jump, Math.abs(t - prevT));
    prevT = t;
    if (p.port.sent.some((x) => x.glideDone)) done = true;
  }
  const miss = Math.max(...Object.keys(want).map((k) => Math.abs(at[k] / want[k] - 1)));
  check('glide: 4 → 64 Hz in 24 s, one octave every 6 s', miss < 0.002 && done && Math.abs(p.rate - 64) < 1e-9,
    `at 6, 12, 18 s: ${Object.keys(want).map((k) => at[k].toFixed(3)).join(', ')} Hz; ends at ${p.rate.toFixed(3)} Hz and says so`);
  // run one sample at a time: at 64 Hz the reader can move at most 2 × 64 ÷ 48000 per sample, so anything larger is a jump
  check('glide: the reader moves continuously, with no jump', jump <= 2 * 64 / SR + 1e-9, `largest change of place per sample ${jump.toExponential(3)} (bound ${(2 * 64 / SR).toExponential(3)})`);
}

// 5 · the page's number: share of the straight wire's power at or above 20 Hz, against the engine's audio
{
  const P = E.partialPowers(5, 1024);
  const rows = []; let worst = 0;
  for (const rate of [2, 5, 10, 15, 19, 20, 40]) {
    const page = E.shareAbove(P, rate, 20);
    // the engine, straight wire alone, over a whole number of readings; power per partial by direct projection
    const p = make({ rate, c: 5, loud: 0, straight: 1 });
    const cycles = Math.max(4, Math.round(rate * 4));
    const n = Math.round(SR * cycles / rate);
    const { L } = render(p, n);
    let mu = 0; for (let i = 0; i < n; i++) mu += L[i]; mu /= n;
    let tot = 0, up = 0;
    const H = Math.min(400, Math.floor(SR / 2 / rate) - 1);
    for (let h = 1; h <= H; h++) {
      let re = 0, im = 0; const w = 2 * Math.PI * h * rate / SR;
      for (let i = 0; i < n; i++) { re += (L[i] - mu) * Math.cos(w * i); im -= (L[i] - mu) * Math.sin(w * i); }
      const pw = re * re + im * im; tot += pw; if (h * rate >= 20) up += pw;
    }
    const heard = up / tot;
    worst = Math.max(worst, Math.abs(page - heard));
    rows.push(`${rate} Hz ${(page * 100).toFixed(2)}% vs ${(heard * 100).toFixed(2)}%`);
  }
  check('meter: the share at or above 20 Hz the page shows matches the engine\'s own audio (curvature 5)', worst < 0.002, rows.join(' · '));
}

// 6 · the safety compressor never engages: the sum's peak stays under its threshold
{
  let peak = 0;
  for (const c of [-8, -5, 0, 5, 8]) {
    const m = E.curveMean(c);
    for (let i = 0; i <= 2000; i++) { const f = fOwn(i / 2000, c); peak = Math.max(peak, 0.30 * f + 0.60 * Math.abs(f - m)); }
  }
  const db = 20 * Math.log10(peak * 0.5);
  check('safety: the compressor after the engine never engages (peak × master gain under −2 dBFS)', db < -2, `worst-case peak ${peak.toFixed(3)} × 0.5 = ${db.toFixed(1)} dBFS, over curvature −8 … 8`);
}

// 7 · the caption's claim about the gathered proof: One curve, three readers draws its seam in with a crossfade
{
  const rough = readFileSync(join(HERE, 'proofs/2026-10-18-one-curve-three-doorways/one-curve-three-doorways-2.html'), 'utf8');
  const m = rough.match(/function directMix\(r\)\{[^\n]*\}/);
  const directMix = m ? new Function(`${m[0]}; return directMix;`)() : null;
  const at = directMix ? [8, 12, 20, 30, 60].map((r) => directMix(r)) : [];
  check('caption: the gathered proof plays the curve as loudness below 12 Hz, as sound above 30 Hz, and crossfades between',
    !!directMix && at[0] === 0 && at[1] === 0 && at[2] > 0.4 && at[2] < 0.7 && at[3] === 1 && at[4] === 1,
    directMix ? `its directMix at 8, 12, 20, 30, 60 Hz: ${at.map((v) => v.toFixed(2)).join(', ')} (0 = all loudness, 1 = all sound)` : 'directMix not found in the proof');
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
