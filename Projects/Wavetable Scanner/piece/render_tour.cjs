// render_tour.cjs — the Piece tier's demo scan and the engine's per-table budget.
// One engine (synth/wt-synth.js, the class the page's AudioWorklet runs), four tables, each
// prepared exactly as the synth page prepares it (alignRotations + spectralMorph + loudness
// match + buildMips). Writes:
//   tour.wav          — about 46 s: each table gets a short phrase while the mod wheel scans it
//   tour_budget.json  — per table: morph and band-limit time, memory, realtime factor at load
// usage: node render_tour.cjs
const fs = require('fs'), path = require('path');
const BUNDLE = path.resolve(__dirname, '..');
const S = require(path.join(BUNDLE, 'synth/wt-synth.js')), P = require(path.join(BUNDLE, 'packer/packer.js'));
const Engine = S.engineFactory(), L = 1024, SR = 44100;

function raw(file) {
  if (file.endsWith('.f32')) { const b = fs.readFileSync(file); return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length)); }
  return P.parseWav(fs.readFileSync(file).buffer).samples;
}
// synth/page.html morphed(), word for word
function morphed(r) {
  const F = r.length / L, frames = [];
  for (let f = 0; f < F; f++) { const c = r.slice(f * L, f * L + L); let m = 0; for (const v of c) m += v; m /= L; frames.push(c.map(v => v - m)); }
  const { frames: out } = P.spectralMorph(P.alignRotations(frames), 512, true);
  const s = new Float32Array(out.length * L); out.forEach((c, i) => s.set(c, i * L));
  let e = 0; for (const v of s) e += v * v; e /= s.length;
  let e0 = 0; for (const v of r) e0 += v * v; e0 /= r.length;
  if (e > 0) { const k = Math.sqrt(e0 / e); for (let i = 0; i < s.length; i++) s[i] *= k; }
  return { samples: s, frames: out.length };
}
function run(e, seconds, events) {
  const n = Math.round(seconds * SR), Lo = new Float32Array(n), Ro = new Float32Array(n), B = 128;
  const l = new Float32Array(B), r = new Float32Array(B); let k = 0;
  for (let i = 0; i < n; i += B) {
    while (k < events.length && events[k][0] * SR <= i) events[k++][1](e);
    e.render(l, r, B); Lo.set(l.subarray(0, Math.min(B, n - i)), i); Ro.set(r.subarray(0, Math.min(B, n - i)), i);
  }
  return { L: Lo, R: Ro };
}
const ms = t0 => Number(process.hrtime.bigint() - t0) / 1e6;

// Each section: the table, a patch, chords (start, length, notes), and how the wheel scans it.
const SECTIONS = [
  { name: 'classics', file: '../plugin/reference/tables/classics.f32', label: 'the five classics, sine to bell',
    patch: { unison: 5, detune: 16, spread: 0.8, cutoff: 7000, reso: 0.15, aA: 0.0154, aR: 0.575, gain: 0.3 },
    chords: [[0, 2.6, [45, 52, 57, 61]], [2.75, 2.6, [42, 49, 54, 57]], [5.5, 2.6, [38, 45, 50, 54]], [8.25, 2.0, [40, 47, 52, 56]]] },
  { name: 'cello', file: '../plugin/reference/tables/cello.f32', label: 'the 19 cello cycles',
    patch: { unison: 3, detune: 9, cutoff: 3200, reso: 0.25, envToCutoff: 1.5, aA: 0.0986, aR: 0.575, mD: 0.575, gain: 0.34 },
    chords: [[0, 5.3, [36, 43, 52]], [5.5, 4.8, [41, 48, 57]]] },
  { name: 'eorgan', file: '../packer/chain/eorgan_chain.wav', label: 'the AKWF organ folder, family chain',
    patch: { unison: 2, detune: 6, cutoff: 9000, reso: 0.1, aA: 0.0154, aR: 0.0986, gain: 0.3 },
    chords: [[0, 1.3, [60, 64, 67]], [1.375, 1.3, [62, 65, 69]], [2.75, 2.6, [64, 67, 71]], [5.5, 1.3, [65, 69, 72]], [6.875, 1.3, [64, 67, 71]], [8.25, 2.6, [62, 65, 69, 74]]] },
  { name: 'fm chain', file: '../plugin/reference/tables/fm.f32', label: 'the 122-cycle AKWF FM family chain',
    patch: { unison: 7, detune: 18, spread: 1, cutoff: 9000, reso: 0.2, aA: 0.0154, aR: 1.41, gain: 0.26 },
    chords: [[0, 9.3, [33, 45, 52, 57, 64]]] },
];
const SEC = 11.5;   // each section's length, tails included

const budget = [], Ls = [], Rs = [];
for (const s of SECTIONS) {
  const r = raw(path.join(__dirname, s.file));
  let t0 = process.hrtime.bigint(); const m = morphed(r); const tMorph = ms(t0);
  t0 = process.hrtime.bigint(); const mips = S.buildMips(m.samples, m.frames); const tMips = ms(t0);
  const e = new Engine(SR); e.setTable(mips, m.frames); e.setAll(s.patch);
  const ev = [];
  for (const [t, len, ns] of s.chords) for (const n of ns) { ev.push([t, e => e.noteOn(n, 96)]); ev.push([t + len, e => e.noteOff(n)]); }
  // the wheel scans the whole table: up over the first half, back down over the second
  for (let k = 0; k <= 104; k++) ev.push([k * 0.1, e => e.cc(1, Math.round(127 * (0.5 - 0.5 * Math.cos(Math.PI * k / 52))))]);
  ev.sort((a, b) => a[0] - b[0]);
  t0 = process.hrtime.bigint(); const o = run(e, SEC, ev); const tRun = ms(t0);
  const fade = Math.round(0.05 * SR);   // a short fade at each section's end, so no tail is cut
  for (let i = 0; i < fade; i++) { const g = i / fade, j = o.L.length - 1 - i; o.L[j] *= g; o.R[j] *= g; }
  Ls.push(o.L); Rs.push(o.R);
  // the heavy case: 8 voices × 7 unison on this table, 5 s held, wheel moving
  const h = new Engine(SR); h.setTable(mips, m.frames); h.setAll({ unison: 7, detune: 18, cutoff: 6000, reso: 0.3, envToCutoff: 2 });
  const hev = [48, 52, 55, 59, 62, 64, 67, 71].map(n => [0, e => e.noteOn(n, 100)]);
  for (let k = 0; k <= 50; k++) hev.push([k * 0.1, e => e.cc(1, Math.round(127 * k / 50))]);
  hev.sort((a, b) => a[0] - b[0]);
  t0 = process.hrtime.bigint(); run(h, 5, hev); const tHeavy = ms(t0);
  budget.push({ table: s.name, source_frames: r.length / L, playing_frames: m.frames,
    morph_ms: +tMorph.toFixed(0), bandlimit_ms: +tMips.toFixed(0), memory_MB: +(mips.length * 4 / 1048576).toFixed(1),
    tour_voices: Math.max(...s.chords.map(c => c[2].length)), tour_unison: s.patch.unison, tour_realtime_x: +(SEC * 1000 / tRun).toFixed(1),
    heavy_8x7_realtime_x: +(5000 / tHeavy).toFixed(1), heavy_8x7_core_pct: +(100 * tHeavy / 5000).toFixed(1) });
}

// join the sections, one after another, and set the whole to −1 dBFS
const N = Ls.reduce((a, x) => a + x.length, 0), TL = new Float32Array(N), TR = new Float32Array(N);
let at = 0; const marks = [];
for (let i = 0; i < Ls.length; i++) { TL.set(Ls[i], at); TR.set(Rs[i], at); marks.push({ table: SECTIONS[i].name, label: SECTIONS[i].label, starts_s: +(at / SR).toFixed(2) }); at += Ls[i].length; }
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(TL[i]), Math.abs(TR[i]));
const g = Math.pow(10, -1 / 20) / pk;
const b = Buffer.alloc(44 + N * 4);
b.write('RIFF', 0); b.writeUInt32LE(36 + N * 4, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) { b.writeInt16LE(Math.round(TL[i] * g * 32767), 44 + i * 4); b.writeInt16LE(Math.round(TR[i] * g * 32767), 46 + i * 4); }
fs.writeFileSync(path.join(__dirname, 'tour.wav'), b);
const out = { sr: SR, seconds: +(N / SR).toFixed(2), raw_peak_dbfs: +(20 * Math.log10(pk)).toFixed(1), set_to_dbfs: -1, sections: marks, node: process.version, budget };
fs.writeFileSync(path.join(__dirname, 'tour_budget.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
