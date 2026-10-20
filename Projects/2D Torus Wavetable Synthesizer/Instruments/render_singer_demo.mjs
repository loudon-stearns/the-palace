// render_singer_demo.mjs — run the Singer offline with the exact scripts
// the browser plays (extracted from singer.html), check its pitch solve,
// and render a short demo.
//
//   node render_singer_demo.mjs   -> singer_demo.wav, singer_demo_track.txt
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, 'singer.html'), 'utf8');
const HTE = new Function(html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1] + '\nreturn HTE;')();
const SINGER = new Function(html.match(/<script id="singer">([\s\S]*?)<\/script>/)[1] + '\nreturn SINGER;')();
const SR = 48000;

function writeFloatWav(p, x) {
  const n = x.length, h = Buffer.alloc(58);
  h.write('RIFF', 0); h.writeUInt32LE(50 + 4 * n, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(18, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(32, 34); h.writeUInt16LE(0, 36);
  h.write('fact', 38); h.writeUInt32LE(4, 42); h.writeUInt32LE(n, 46);
  h.write('data', 50); h.writeUInt32LE(4 * n, 54);
  fs.writeFileSync(p, Buffer.concat([h, Buffer.from(x.buffer)]));
}

// 1. the solve against the étude's hand formulas (base = note × factor)
const surf = {};
const S = (n) => (surf[n] ||= (() => { const W = HTE.makeSurface(n); return { W, E: SINGER.coeffEnergy(W) }; })());
const checks = [
  ['the hero at the pole', '15 · Penrose Lattice', 0, 1, 1 / 6],
  ['the hero on the pad', '15 · Penrose Lattice', 1, 2, 3 / 8],
  ['the mentor on 3:2', '14 · Knot Shadow', 3, 2, 1 / 2],
  ['the reed on 1:1', '14 · Knot Shadow', 1, 1, 1],
];
console.log('\nthe solve vs the étude:');
for (const [who, n, a, b, f] of checks) {
  const k = SINGER.register(S(n).E, a, b).k, solved = (a + b) / (2 * k);
  console.log(`  ${who.padEnd(22)} ${n.padEnd(20)} ${a}:${b}  k*=${k}  base = note × ${solved.toFixed(4)}   étude: × ${f.toFixed(4)}  ${Math.abs(solved - f) < 1e-9 ? 'MATCH' : 'differs'}`);
}

// 2. the demo: a score of note and lock events, played by the Singer
const NAME = '15 · Penrose Lattice';
const eng = new HTE.Engine(SR), sg = new SINGER.Singer(eng); sg.setSurface(S(NAME).W);
const ev = [], sec = [];
const on = (t, m, v = 1) => ev.push([t, () => sg.noteOn(m, v)]);
const off = (t, m) => ev.push([t, () => sg.noteOff(m)]);
const lock = (t, a, b) => ev.push([t, () => sg.setLock(a, b)]);
const go = (t, v) => ev.push([t, () => sg.setLetGo(v)]);
const set = (t, o) => ev.push([t, () => Object.assign(sg.p, o)]);
const A4 = 69, motif = [0, 3, 7, 5];                            // A C E D, the hero's motif

// I · the motif at the pole, detached, then legato: scoop, late vibrato, swell
sec.push([0, 'POLE']); lock(0, 0, 1);
let t = 0.3;
for (const [i, s] of motif.entries()) { const d = [0.6, 0.3, 0.3, 1.2][i]; on(t, A4 + s); off(t + d * 0.9, A4 + s); t += d; }
t += 0.4;
for (const [i, s] of motif.entries()) { const d = [0.6, 0.3, 0.3, 2.0][i]; on(t, A4 + s); if (i) off(t + 0.001, A4 + motif[i - 1]); t += d; }
off(t, A4 + 5); t += 0.6;

// II · one held A, the lock changes under it: same note, new face
sec.push([t, 'SAME NOTE, NEW FACE']);
const faces = [[1, 1], [3, 2], [2, 3], [2, 1], [1, 2], [4, 3], [5, 4], [0, 1]];
lock(t, 1, 1); on(t, A4); const tFaces = [];
for (const [i, L] of faces.entries()) { lock(t + i * 1.1, L[0], L[1]); tFaces.push([t + i * 1.1, L]); }
t += faces.length * 1.1; off(t, A4); t += 0.6;

// III · the motif on 3:2, let go on the long note, then grab
sec.push([t, 'LET GO · GRAB']); lock(t, 1, 2); set(t, { drift: 2.5 });
for (const [i, s] of motif.entries()) { const d = [0.6, 0.3, 0.3, 4.2][i]; on(t, A4 + s); if (i) off(t + 0.001, A4 + motif[i - 1]); t += d;
  if (i === 3) { go(t - 3.4, true); go(t - 1.2, false); } }
off(t, A4 + 5); t += 0.6;

// IV · slip: held on 1:1, the slip knob turns up (the call, far away and faint), dead-line voice in
sec.push([t, 'SLIP']); lock(t, 1, 1);
on(t, A4 - 12, 0.8); const tSlip = t;
for (let i = 0; i <= 40; i++) set(t + i * 0.1, { slip: 3 * Math.sin(Math.PI * i / 40), het: 0.6 * Math.sin(Math.PI * i / 40) });
t += 4.5; off(t, A4 - 12); t += 1.0;
const DUR = t;

ev.sort((p, q) => p[0] - q[0]);
const y = new Float32Array(Math.ceil(SR * DUR)), BLK = 64, track = ['t\tlock\tk\tbase\theard\tengine\tlocked\tbeat'];
let e = 0;
for (let i = 0; i < y.length; i += BLK) {
  const tt = i / SR; while (e < ev.length && ev[e][0] <= tt) ev[e++][1]();
  sg.process(y.subarray(i, i + BLK), Math.min(BLK, y.length - i));
  if ((i / BLK) % 75 === 0) { const s = sg.status(); track.push([tt.toFixed(3), s.lock, s.k, s.base.toFixed(3), s.heard.toFixed(2), s.engLock, s.locked, s.beat.toFixed(3)].join('\t')); }
}
writeFloatWav(path.join(here, 'singer_demo.wav'), y);
fs.writeFileSync(path.join(here, 'singer_demo_track.txt'), track.join('\n') + '\n');
fs.writeFileSync(path.join(here, 'singer_demo_sections.json'), JSON.stringify(sec));

// 3. does the heard partial land on A4 on every lock? Strongest peak within ±1 semitone of 440
console.log(`\nsame note, new face — ${NAME}, held A4 (440 Hz):`);
const NF = 16384;
for (const [t0, L] of tFaces) {
  const i0 = Math.floor((t0 + 0.4) * SR), x = y.subarray(i0, i0 + NF);
  let best = 0, bf = 0, tot = 0;
  for (let f = 380; f <= 500; f += 0.25) {
    let re = 0, im = 0; for (let n = 0; n < NF; n += 1) { const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * n / NF), ph = 2 * Math.PI * f * n / SR; re += x[n] * w * Math.cos(ph); im -= x[n] * w * Math.sin(ph); }
    const m = re * re + im * im; if (m > best) { best = m; bf = f; }
  }
  const k = SINGER.register(S(NAME).E, L[0], L[1]).k;
  console.log(`  ${(L[0] ? L.join(':') : 'pole').padEnd(5)} k*=${String(k).padEnd(3)} peak near A4 at ${bf.toFixed(2)} Hz (${(1200 * Math.log2(bf / 440)).toFixed(1)} ¢, vibrato included)`);
}
console.log(`\nwrote singer_demo.wav (${DUR.toFixed(1)} s)`);
