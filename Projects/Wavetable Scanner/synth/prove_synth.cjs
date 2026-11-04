// The synth's engine, run in Node with no browser: the same class the page's AudioWorklet runs.
// Proves four things and writes prove_synth.json:
//   1. aliasing — a saw at C7 with the per-octave band-limited tables against the raw table;
//   2. the envelope keeps the Synth Templates time words — a stage of T seconds reaches 95 % at T;
//   3. cost — 8 voices × 7 unison copies, seconds of audio per second of CPU;
//   4. a demo phrase on two packed tables, written as WAVs to listen to.
// usage: node prove_synth.cjs
const fs = require('fs'), path = require('path');
const S = require('./wt-synth.js'), P = require('../packer/packer.js');
const Engine = S.engineFactory(), FRAME = S.FRAME, HERE = __dirname;
const out = {};

function wav16(file, L, R, sr) {
  const n = L.length, b = Buffer.alloc(44 + n * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4); b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4); }
  fs.writeFileSync(file, b);
}
function run(e, seconds, events) {   // events: [[t, fn]], sorted
  const sr = e.sr, n = Math.round(seconds * sr), L = new Float32Array(n), R = new Float32Array(n), B = 128;
  const l = new Float32Array(B), r = new Float32Array(B); let k = 0;
  for (let i = 0; i < n; i += B) {
    while (k < events.length && events[k][0] * sr <= i) events[k++][1](e);
    e.render(l, r, B); L.set(l.subarray(0, Math.min(B, n - i)), i); R.set(r.subarray(0, Math.min(B, n - i)), i);
  }
  return { L, R };
}
function table(file) { const w = P.parseWav(fs.readFileSync(file).buffer); return { samples: w.samples, frames: w.samples.length / FRAME }; }

// 1. aliasing
{
  const sr = 48000, saw = new Float32Array(FRAME);
  for (let i = 0; i < FRAME; i++) saw[i] = 1 - 2 * i / FRAME;
  const mips = S.buildMips(saw, 1);
  const raw = new Float32Array(mips.length); for (let L = 0; L < S.LEVELS; L++) raw.set(saw, L * FRAME);   // every level the unfiltered saw
  const res = {};
  for (const [name, m] of [['band-limited', mips], ['raw table', raw]]) {
    const e = new Engine(sr); e.setTable(m, 1); e.setAll({ cutoff: 20000, reso: 0, aA: 0.001, aS: 1, gain: 0.3 });
    const note = 96, f0 = 440 * Math.pow(2, (note - 69) / 12);
    const { L } = run(e, 1.5, [[0, e => e.noteOn(note, 127)]]);
    const N = 32768, x = L.subarray(sr * 0.5, sr * 0.5 + N), re = new Float64Array(N), im = new Float64Array(N);
    for (let i = 0; i < N; i++) re[i] = x[i] * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N));
    // reuse packer's private fft via a DFT-sized helper: a plain radix-2 here
    (function fft(re, im) { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
      for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const p = i + k, q = p + len / 2, xr = re[q] * cr - im[q] * ci, xi = re[q] * ci + im[q] * cr; re[q] = re[p] - xr; im[q] = im[p] - xi; re[p] += xr; im[p] += xi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } })(re, im);
    let harm = 0, alias = 0;
    for (let b = 1; b < N / 2; b++) {
      const hz = b * sr / N, pw = re[b] * re[b] + im[b] * im[b], h = hz / f0;
      if (Math.abs(h - Math.round(h)) * f0 < 25) harm += pw; else alias += pw;
    }
    res[name] = +(10 * Math.log10(alias / harm)).toFixed(1);
  }
  out.aliasing = { note: 'C7 (2093 Hz) saw at 48 kHz, energy off the harmonics relative to on them, dB', ...res };
}

// 2. envelope: the Synth Templates time words, 95 % at T
{
  const sr = 48000, e = new Engine(sr), words = { instant: 0.00488, fast: 0.0154, short: 0.0986, medium: 0.575, slow: 1.41 };
  const flat = new Float32Array(FRAME).fill(0); const one = S.buildMips(flat, 1);
  e.setTable(one, 1);
  const rows = {};
  for (const [w, T] of Object.entries(words)) {
    const v = e.voices[0]; v.amp.v = 0; v.amp.stage = 1; v.amp.t = 0;
    let n = 0; while (v.amp.v < 0.95 && n < sr * 10) { v.amp.tick(T, 1, 1, 1, sr); n++; }
    rows[w] = { T, reached95_at: +(n / sr).toFixed(5) };
  }
  out.envelope = rows;
}

// 3. cost
{
  const sr = 44100, t = table(path.join(HERE, '../packer/browser_export_fmsynth_chain_smooth.wav'));
  const e = new Engine(sr); e.setTable(S.buildMips(t.samples, t.frames), t.frames); e.setAll({ unison: 7, detune: 18, cutoff: 6000, reso: 0.3, envToCutoff: 2 });
  const t0 = process.hrtime.bigint();
  run(e, 10, [48, 52, 55, 59, 62, 64, 67, 71].map((n, i) => [0, e => e.noteOn(n, 100)]));
  const secs = Number(process.hrtime.bigint() - t0) / 1e9;
  out.cost = { voices: 8, unison: 7, audio_s: 10, cpu_s: +secs.toFixed(2), realtime_x: +(10 / secs).toFixed(1), frames: t.frames };
}

// 4. demo phrases
const demos = [];
for (const [name, file, patch] of [
  ['cello', '../packer/demo_cello.wav', { unison: 3, detune: 9, cutoff: 3500, reso: 0.25, envToCutoff: 1.5, aA: 0.0986, aR: 0.575, mD: 0.575 }],
  ['fmsynth_chain', '../packer/browser_export_fmsynth_chain_smooth.wav', { unison: 5, detune: 14, cutoff: 9000, reso: 0.2, envToCutoff: 0, aA: 0.0154, aR: 1.41 }],
]) {
  const sr = 44100, t = table(path.join(HERE, file));
  const e = new Engine(sr); e.setTable(S.buildMips(t.samples, t.frames), t.frames); e.setAll(patch);
  const ev = [];
  const chords = [[48, 55, 60, 64], [45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 59]];
  chords.forEach((c, i) => { c.forEach(n => ev.push([i * 2.5, e => e.noteOn(n, 96)])); c.forEach(n => ev.push([i * 2.5 + 2.2, e => e.noteOff(n)])); });
  for (let s = 0; s <= 100; s++) ev.push([s * 0.1, e => e.cc(1, Math.round(127 * (0.5 - 0.5 * Math.cos(Math.PI * s / 50))))]);   // wheel up over 5 s, back down
  ev.push([10.5, e => e.cc(1, 0)]);
  ev.sort((a, b) => a[0] - b[0]);
  const { L, R } = run(e, 12, ev);
  let pk = 0; for (let i = 0; i < L.length; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
  const f = `demo_${name}.wav`; wav16(path.join(HERE, f), L, R, sr);
  demos.push({ file: f, frames: t.frames, peak_dbfs: +(20 * Math.log10(pk)).toFixed(1), patch });
}
out.demos = demos;
fs.writeFileSync(path.join(HERE, 'prove_synth.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
