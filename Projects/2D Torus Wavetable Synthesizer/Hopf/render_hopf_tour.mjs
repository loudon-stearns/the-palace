// render_hopf_tour.mjs — render the Hopf tour offline with the exact
// engine the browser plays (extracted from hopf-control-surface.html),
// and check the engine's surfaces against the catalog WAVs.
//
//   node render_hopf_tour.mjs [surface-name] [out.wav]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, 'hopf-control-surface.html'), 'utf8');
const src = html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const HTE = new Function(src + '\nreturn HTE;')();

const SR = 48000, DUR = 20;
const name = process.argv[2] || '15 · Penrose Lattice';
const out = process.argv[3] || path.join(here, 'hopf_tour_penrose.wav');

function readFloatWav(p) {
  const b = fs.readFileSync(p); let o = 12;
  while (o < b.length) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4);
    if (id === 'data') return new Float32Array(b.buffer.slice(b.byteOffset + o + 8, b.byteOffset + o + 8 + sz));
    o += 8 + sz + (sz & 1); }
}
function writeFloatWav(p, x) {
  const n = x.length, h = Buffer.alloc(58);
  h.write('RIFF', 0); h.writeUInt32LE(50 + 4 * n, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(18, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(32, 34); h.writeUInt16LE(0, 36);
  h.write('fact', 38); h.writeUInt32LE(4, 42); h.writeUInt32LE(n, 46);
  h.write('data', 50); h.writeUInt32LE(4 * n, 54);
  fs.writeFileSync(p, Buffer.concat([h, Buffer.from(x.buffer)]));
}

// 1. surfaces match the catalog?
const files = { '15 · Penrose Lattice': '15_penrose_lattice', '14 · Knot Shadow': '14_knot_shadow', '10 · Membrane': '10_membrane',
  '11 · Chladni Ghost': '11_chladni_ghost', '12 · Theta Surface': '12_theta_surface', '16 · Kuramoto Bloom': '16_kuramoto_bloom' };
for (const [k, f] of Object.entries(files)) {
  const ref = readFloatWav(path.join(here, '..', 'Wavetables', f + '.wav')), mine = HTE.makeSurface(k);
  let m = 0; for (let i = 0; i < mine.length; i++) m = Math.max(m, Math.abs(mine[i] - ref[i]));
  console.log(`surface ${k.padEnd(22)} max |engine − catalog| = ${m.toExponential(2)}`);
}

// 2. render the tour
const eng = new HTE.Engine(SR); eng.W = HTE.makeSurface(name);
const g0 = HTE.tour(0); Object.assign(eng.t, g0, { gain: 0.5 }); Object.assign(eng.s, g0, { gain: 0 });
const y = new Float32Array(SR * DUR), BLK = 64, log = [];
for (let i = 0; i < y.length; i += BLK) {
  const t = i / SR; Object.assign(eng.t, HTE.tour(t));
  eng.process(y.subarray(i, i + BLK), Math.min(BLK, y.length - i));
  if (i % (SR / 2) === 0) log.push([t, eng.status()]);
}
const fade = SR * 0.05; for (let i = 0; i < fade; i++) y[y.length - 1 - i] *= i / fade;
let peak = 0, nan = 0; for (const v of y) { if (!Number.isFinite(v)) nan++; else peak = Math.max(peak, Math.abs(v)); }
writeFloatWav(out, y);
console.log(`\nwrote ${out}  peak ${peak.toFixed(3)}  non-finite ${nan}`);
for (const [t, s] of log) console.log(`t=${t.toFixed(1).padStart(4)}  h=${s.h.toFixed(3).padStart(6)} lon=${s.lon.toFixed(2)} K=${s.K.toFixed(1).padStart(4)}  lock ${s.a}:${s.b} K*=${s.Kstar.toFixed(2).padStart(6)} ${s.locked ? 'LOCKED f0=' + s.f0.toFixed(1) : 'slip beat=' + s.beat.toFixed(1)}`);
