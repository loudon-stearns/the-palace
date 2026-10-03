// render_hands_tour.mjs — render the hands tour (the three Tier-1 warps
// on the locked 3:2 knot) offline with the exact engine the browser plays,
// plus 4-second frozen clips of each warp for spectral measurement.
//
//   node render_hands_tour.mjs [surface-name] [out.wav] [--clips dir]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, 'hopf-control-surface.html'), 'utf8');
const HTE = new Function(html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1] + '\nreturn HTE;')();

const SR = 48000;
const args = process.argv.slice(2), ci = args.indexOf('--clips');
const clipDir = ci >= 0 ? args.splice(ci, 2)[1] : null;
const name = args[0] || '15 · Penrose Lattice';
const out = args[1] || path.join(here, 'hands_tour_penrose.wav');

function writeFloatWav(p, x) {
  const n = x.length, h = Buffer.alloc(58);
  h.write('RIFF', 0); h.writeUInt32LE(50 + 4 * n, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(18, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(32, 34); h.writeUInt16LE(0, 36);
  h.write('fact', 38); h.writeUInt32LE(4, 42); h.writeUInt32LE(n, 46);
  h.write('data', 50); h.writeUInt32LE(4 * n, 54);
  fs.writeFileSync(p, Buffer.concat([h, Buffer.from(x.buffer)]));
}
function render(W, dur, gesture) {
  const eng = new HTE.Engine(SR); eng.W = W;
  const g0 = gesture(0); Object.assign(eng.t, g0, { gain: 0.5 }); Object.assign(eng.s, g0, { gain: 0.5 });
  const y = new Float32Array(Math.round(SR * dur)), BLK = 64;
  for (let i = 0; i < y.length; i += BLK) { Object.assign(eng.t, gesture(i / SR)); eng.process(y.subarray(i, i + BLK), Math.min(BLK, y.length - i)); }
  return y;
}
const W = HTE.makeSurface(name);
const y = render(W, 24, HTE.handsTour);
const fade = SR * 0.05; for (let i = 0; i < fade; i++) y[y.length - 1 - i] *= i / fade;
let peak = 0, nan = 0; for (const v of y) { if (!Number.isFinite(v)) nan++; else peak = Math.max(peak, Math.abs(v)); }
writeFloatWav(out, y);
console.log(`wrote ${out}  peak ${peak.toFixed(3)}  non-finite ${nan}`);

if (clipDir) {   // frozen settings: locked 3:2 (K=6) and open (K=0), each warp at its tour maximum
  fs.mkdirSync(clipDir, { recursive: true });
  const tag = name.split('·')[1].trim().split(' ')[0].toLowerCase();
  const settings = { bare: {}, bend: { bX: 0.85, bY: -0.85 }, shear: { shear: 0.35 }, stir: { stir: 1 } };
  for (const [K, kt] of [[6, 'locked'], [0, 'open']]) for (const [w, s] of Object.entries(settings)) {
    const c = render(W, 4, () => Object.assign({ base: 220, h: 0.21, lon: 0, K, bX: 0, bY: 0, shear: 0, stir: 0 }, s));
    writeFloatWav(path.join(clipDir, `${tag}_${kt}_${w}.wav`), c);
  }
  console.log('clips in', clipDir);
}
