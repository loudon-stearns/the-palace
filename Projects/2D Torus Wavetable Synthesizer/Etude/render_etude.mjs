// render_etude.mjs — Étude No. 1, "One Sphere": a test piece played only
// by the prototype. Every voice is RNBO/torus_2d_hopf.codebox, run as
// written (via RNBO/codebox_transpile.mjs) on a catalog WAV — the same
// file a [buffer~ tablebuf] would hold. The score below is nothing but
// knob moves on that codebox, the way a Max patch would send them:
// breakpoints, read every 32 samples (control rate), linear between.
//
//   node render_etude.mjs   -> etude_one_sphere.wav (38 MB, not committed:
//                              etude_one_sphere.m4a is the committed copy),
//                              etude_locks.json, $TMPDIR/etude_one_sphere_mono.wav
//   python3 etude_spectrogram.py $TMPDIR/etude_one_sphere_mono.wav etude_one_sphere.png
//   afconvert -f m4af -d aac -b 256000 etude_one_sphere.wav etude_one_sphere.m4a
//
// A "let go" in the score is always two moves: coupling down AND the
// height nudged off the ratio. On the exact ratio, no coupling is needed
// to stay locked, so dropping it alone changes nothing (found the hard way,
// first render of the coda).
//
// Mixing is the only thing outside the codebox: three voices panned and
// summed, then one gain to bring the peak to -1 dBFS.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { loadCodebox, readWav } from '../RNBO/codebox_transpile.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const SR = 48000, DUR = 100, N = DUR * SR, CR = 32;
const make = loadCodebox(path.join(here, '../RNBO/torus_2d_hopf.codebox'));
const wav = (f) => readWav(path.join(here, '../Wavetables', f));

// lock a:b sits at height (a-b)/(a+b); locked pitch is 2*baseHz/(a+b)
const H = (a, b) => (a - b) / (a + b);

const VOICES = [
  { name: 'Penrose', table: '15_penrose_lattice.wav', pan: -0.35,
    fixed: { baseHz: 110, hetRow: 0.25, slopeMax: 41.0 },
    score: {
      // I. the 1D synth is one point: height -1, longitude walks the rows
      height:    [[0, -1], [12, -1], [30, H(1, 1)], [40, H(1, 1)], [52, H(3, 2) + 0.004], [62, H(3, 2) + 0.004], [80, H(3, 2)], [84, H(3, 2) + 0.018], [92, H(3, 2) + 0.018], [94, H(3, 2)], [100, H(3, 2)]],
      longitude: [[0, 0], [12, 0.5], [30, 0.5], [100, 0.62]],
      coupling:  [[0, 3], [40, 3], [46, 0.4], [56, 0.4], [58, 6], [80, 6], [84, 0], [92, 0], [94, 8], [100, 8]],
      het:       [[0, 0], [30, 0], [34, 0.7], [62, 0.7], [70, 0.3], [84, 0.7], [100, 0.7]],
      gain:      [[0, 0], [2, 0.35], [62, 0.35], [68, 0.2], [80, 0.3], [96, 0.3], [100, 0]],
    } },
  { name: 'Knot Shadow', table: '14_knot_shadow.wav', pan: 0.4,
    fixed: { baseHz: 165, hetRow: 0.3505859375, slopeMax: 26.2 },
    score: {
      // II. the knot: enters locked at 3:2, lets go, is grabbed back
      height:    [[0, H(3, 2)], [38, H(3, 2)], [44, H(3, 2) - 0.02], [50, H(3, 2) + 0.02], [56, H(3, 2)], [84, H(3, 2)], [86, H(3, 2) - 0.025], [92, H(3, 2) - 0.025], [93, H(3, 2)], [100, H(3, 2)]],
      longitude: [[0, 0], [100, 0.25]],
      coupling:  [[0, 4], [42, 4], [46, 0.3], [54, 0.3], [56, 5], [84, 5], [86, 0], [92, 0], [93, 8], [100, 8]],
      het:       [[0, 0.8], [100, 0.8]],
      gain:      [[0, 0], [30, 0], [34, 0.3], [62, 0.3], [68, 0.15], [80, 0.25], [96, 0.25], [100, 0]],
    } },
  { name: 'Membrane', table: '10_membrane.wav', pan: 0.0,
    fixed: { baseHz: 55, hetRow: 0.111328125, slopeMax: 14.5 },
    score: {
      // III. the hands on a low drum: bend, shear, stir, then let go with the others
      height:    [[0, 0], [84, 0], [88, 0.035], [92, 0.035], [94, 0], [100, 0]],
      longitude: [[0, 0.1], [100, 0.35]],
      coupling:  [[0, 4], [84, 4], [86, 0.2], [92, 0.2], [94, 8], [100, 8]],
      het:       [[0, 0.5], [100, 0.5]],
      bendX:     [[0, 0], [62, 0], [66, 0.7], [70, -0.5], [74, 0], [100, 0]],
      shear:     [[0, 0], [66, 0], [72, 0.35], [78, 0], [100, 0]],
      stir:      [[0, 0], [70, 0], [76, 0.9], [82, 0.2], [88, 0.5], [100, 0]],
      gain:      [[0, 0], [58, 0], [62, 0.45], [96, 0.4], [100, 0]],
    } },
];

function at(bp, t) {
  if (t <= bp[0][0]) return bp[0][1];
  for (let i = 1; i < bp.length; i++) if (t <= bp[i][0]) {
    const [t0, v0] = bp[i - 1], [t1, v1] = bp[i];
    return v0 + (v1 - v0) * (t - t0) / (t1 - t0);
  }
  return bp[bp.length - 1][1];
}

const L = new Float32Array(N), R = new Float32Array(N), locks = {}, stems = {};
for (const v of VOICES) {
  const m = make(wav(v.table), SR);
  for (const k in v.fixed) m.set(k, v.fixed[k]);
  // start the smoothers where the score starts, as a patch loaded with these values would
  m.set('height', v.score.height[0][1]);
  const gl = Math.cos((v.pan + 1) * Math.PI / 4), gr = Math.sin((v.pan + 1) * Math.PI / 4);
  const stem = new Float32Array(N); let last = '', bad = 0;
  locks[v.name] = [];
  for (let i = 0; i < N; i++) {
    if (i % CR === 0) {
      const t = i / SR;
      for (const k in v.score) m.set(k, at(v.score[k], t));
      const lk = `${m.get('lockA')}:${m.get('lockB')}`;
      if (lk !== last) { locks[v.name].push([+t.toFixed(3), lk]); last = lk; }
    }
    const y = m.tick(); if (!Number.isFinite(y)) bad++;
    stem[i] = y; L[i] += gl * y; R[i] += gr * y;
  }
  stems[v.name] = stem;
  const rms = (a, b) => { let q = 0; for (let i = a * SR; i < b * SR; i++) q += stem[i] * stem[i]; return (10 * Math.log10(q / ((b - a) * SR) + 1e-20)).toFixed(1); };
  console.log(`  level dBFS (pre-norm) 4-10s ${rms(4, 10)} · 34-42s ${rms(34, 42)} · 64-80s ${rms(64, 80)} · 86-92s ${rms(86, 92)}`);
  console.log(`${v.name.padEnd(12)} non-finite ${bad} · lock targets visited: ${locks[v.name].map(x => x[1]).join(' → ')}`);
}

let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.891 / pk;
function writeWav(p, chans) {
  const n = chans[0].length, c = chans.length, b = Buffer.alloc(44 + 4 * n * c);
  b.write('RIFF', 0); b.writeUInt32LE(36 + 4 * n * c, 4); b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(3, 20); b.writeUInt16LE(c, 22); b.writeUInt32LE(SR, 24);
  b.writeUInt32LE(SR * 4 * c, 28); b.writeUInt16LE(4 * c, 32); b.writeUInt16LE(32, 34);
  b.write('data', 36); b.writeUInt32LE(4 * n * c, 40);
  for (let i = 0, o = 44; i < n; i++) for (let k = 0; k < c; k++, o += 4) b.writeFloatLE(chans[k][i] * g, o);
  fs.writeFileSync(p, b);
}
writeWav(path.join(here, 'etude_one_sphere.wav'), [L, R]);
writeWav(path.join(os.tmpdir(), 'etude_one_sphere_mono.wav'), [L.map((x, i) => 0.5 * (x + R[i]))]);
fs.writeFileSync(path.join(here, 'etude_locks.json'), JSON.stringify({ peak_before_norm: pk, norm_gain: g, locks }, null, 1) + '\n');
console.log(`peak before normalising ${pk.toFixed(3)} · gain ${g.toFixed(3)}`);
