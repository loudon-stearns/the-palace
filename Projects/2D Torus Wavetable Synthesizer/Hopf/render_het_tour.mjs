// render_het_tour.mjs — the heterodyne hand (the dead line's own voice),
// rendered offline with the exact engine the browser plays.
//
//   node render_het_tour.mjs [surface-name] [out-prefix]
//
// Writes  <prefix>.wav        the 24 s heterodyne tour, as heard
//         <prefix>_voice.wav  the heterodyne voice alone: the same tour
//                             rendered twice, with and without it, and
//                             subtracted (gain kept low so the soft-clip
//                             stays linear), then normalised
//         <prefix>_track.txt  per-50 ms: time, predicted slip (Adler),
//                             measured slip (wraps of u = b*phi2 - a*phi1)
// and prints the two checks: locked = silent, slip pitch = Adler.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, 'hopf-control-surface.html'), 'utf8');
const HTE = new Function(html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1] + '\nreturn HTE;')();

const SR = 48000;
const name = process.argv[2] || '15 · Penrose Lattice';
const prefix = process.argv[3] || path.join(here, 'het_tour_penrose');

function writeFloatWav(p, x) {
  const n = x.length, h = Buffer.alloc(58);
  h.write('RIFF', 0); h.writeUInt32LE(50 + 4 * n, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(18, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(32, 34); h.writeUInt16LE(0, 36);
  h.write('fact', 38); h.writeUInt32LE(4, 42); h.writeUInt32LE(n, 46);
  h.write('data', 50); h.writeUInt32LE(4 * n, 54);
  fs.writeFileSync(p, Buffer.concat([h, Buffer.from(x.buffer)]));
}

// Render a gesture. Returns audio plus the slip track (u wraps per block).
function render(W, dur, gesture, gain, override) {
  const eng = new HTE.Engine(SR); eng.W = W;
  const g0 = Object.assign(gesture(0), override); Object.assign(eng.t, g0, { gain }); Object.assign(eng.s, g0, { gain });
  const y = new Float32Array(Math.round(SR * dur)), BLK = 64;
  const track = []; let uPrev = 0, unwrapped = 0, lastT = 0, lastU = 0;
  for (let i = 0; i < y.length; i += BLK) {
    const g = Object.assign(gesture(i / SR), override); Object.assign(eng.t, g);
    eng.process(y.subarray(i, i + BLK), Math.min(BLK, y.length - i));
    // unwrap u for the CURRENT target (skip blocks where the target changed)
    const u = eng.b * eng.phi2 - eng.a * eng.phi1;
    let d = u - uPrev; d -= Math.round(d); unwrapped += d; uPrev = u;
    const t = (i + BLK) / SR;
    if (t - lastT >= 0.05) {
      const st = eng.status();
      track.push([t, st.a + ':' + st.b, st.locked ? 0 : st.beat, Math.abs(unwrapped - lastU) / (t - lastT)]);
      lastT = t; lastU = unwrapped;
    }
  }
  return { y, track };
}

const W = HTE.makeSurface(name);
const heard = render(W, 24, HTE.hetTour, 0.5, {}).y;
const fade = SR * 0.05; for (let i = 0; i < fade; i++) heard[heard.length - 1 - i] *= i / fade;
writeFloatWav(prefix + '.wav', heard);

// the voice alone: linear regime (gain 0.02), with minus without
const withV = render(W, 24, HTE.hetTour, 0.02, {});
const without = render(W, 24, HTE.hetTour, 0.02, { het: 0 }).y;
const voice = new Float32Array(withV.y.length);
let pk = 0; for (let i = 0; i < voice.length; i++) { voice[i] = withV.y[i] - without[i]; pk = Math.max(pk, Math.abs(voice[i])); }
for (let i = 0; i < voice.length; i++) voice[i] *= 0.9 / pk;
writeFloatWav(prefix + '_voice.wav', voice);
fs.writeFileSync(prefix + '_track.txt', 't\ttarget\tpredicted_slip_Hz\tmeasured_slip_Hz\n' +
  withV.track.map(r => [r[0].toFixed(2), r[1], r[2].toFixed(2), r[3].toFixed(2)].join('\t')).join('\n') + '\n');
console.log(`wrote ${prefix}.wav, _voice.wav, _track.txt`);

// ---- check 1: locked = silent. Voice energy vs bare-tone energy, 1-3 s
// (voice fully in, knot locked) and 21-23 s (locked again).
function rms(x, a, b) { let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return Math.sqrt(s / (b - a)); }
const raw = withV.y.map((v, i) => v - without[i]);
for (const [a, b, lab] of [[3, 4, 'locked, voice fully in (3-4 s)'], [10, 11, 'open, near 3:2 (10-11 s)'], [21, 22, 'locked again (21-22 s)']]) {
  const r = rms(raw, a * SR, b * SR) / rms(without, a * SR, b * SR);
  console.log(`  ${lab}: voice / tone = ${(20 * Math.log10(r + 1e-12)).toFixed(1)} dB`);
}

// ---- check 2: frozen slip vs Adler, base 330, h 0.21, near 3:2.
console.log('  frozen slip at h = 0.21, base 330 (predicted = sqrt(delta^2 - ((a+b)K)^2)):');
const rows = [];
for (const K of [0, 1, 2, 3, 3.2, 4]) {
  const r = render(W, 3, () => ({ base: 330, h: 0.21, lon: 0, K, het: 1 }), 0.02, {});
  const tail = r.track.filter(x => x[0] > 1);
  const meas = tail.reduce((s, x) => s + x[3], 0) / tail.length;
  const pred = tail[tail.length - 1][2];
  rows.push([K, pred, meas]);
  console.log(`    K ${K.toFixed(1)}  predicted ${pred.toFixed(2)} Hz  measured ${meas.toFixed(2)} Hz`);
}
fs.writeFileSync(prefix + '_adler.json', JSON.stringify(rows));
