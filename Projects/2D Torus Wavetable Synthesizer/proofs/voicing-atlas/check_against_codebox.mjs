// check_against_codebox.mjs — does the voicing atlas match the instrument?
// Runs RNBO/torus_2d_hopf.codebox as written (via codebox_transpile.mjs) on a
// surface, parked on a lock at a given longitude, lets the coupling settle,
// then measures the energy on harmonics 1..64 of f0 and prints harmonics 1..8
// beside the atlas's exact prediction for that longitude (voicing_atlas.json:
// at_lon0 for longitude 0, lon_spectra[k] for longitude k/16).
//   node proofs/voicing-atlas/check_against_codebox.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCodebox, readWav } from '../../RNBO/codebox_transpile.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const B = path.join(here, '../..');
const make = loadCodebox(path.join(B, 'RNBO/torus_2d_hopf.codebox'));
const atlas = JSON.parse(fs.readFileSync(path.join(here, 'voicing_atlas.json'), 'utf8')).surfaces;
const SR = 48000;

function measure(file, a, b, lon, base = 120) {
  const m = make(readWav(path.join(B, 'Wavetables', file)), SR);
  const h = (a - b) / (a + b), f0 = 2 * base / (a + b);
  m.set('baseHz', base); m.set('height', h); m.set('longitude', lon); m.set('coupling', 3); m.set('gain', 0.35);
  m.set('hS', h); m.set('lonS', lon); m.set('kS', 3);
  for (let i = 0; i < SR * 2; i++) m.tick();               // settle smoothers + DC blocker
  const n = Math.round(SR / f0) * 40, x = new Float64Array(n);   // exactly 40 periods
  for (let i = 0; i < n; i++) x[i] = m.tick();
  const per = n / 40, e = [];
  for (let k = 1; k <= 64; k++) {                         // DFT at each harmonic bin
    let re = 0, im = 0; const w = 2 * Math.PI * k / per;
    for (let i = 0; i < n; i++) { re += x[i] * Math.cos(w * i); im -= x[i] * Math.sin(w * i); }
    e.push(re * re + im * im);
  }
  const tot = e.reduce((s, v) => s + v, 0);
  return e.map(v => v / tot);
}

const fmt = (v) => v.slice(0, 8).map(s => (100 * s).toFixed(0).padStart(3)).join(' ');
const extra = [['10_membrane.wav', 'Membrane', 1, 1, 0.25], ['11_chladni_ghost.wav', 'Chladni Ghost', 1, 1, 0.25]];
const cases = [
  ['14_knot_shadow.wav', 'Knot Shadow', 1, 1], ['14_knot_shadow.wav', 'Knot Shadow', 3, 2],
  ['10_membrane.wav', 'Membrane', 1, 1], ['15_penrose_lattice.wav', 'Penrose', 1, 2],
  ['12_theta_surface.wav', 'Theta', 1, 1], ['16_kuramoto_bloom.wav', 'Kuramoto Bloom', 1, 1],
];
console.log('harmonic %        1   2   3   4   5   6   7   8');
for (const [f, name, a, b] of cases) {
  const got = measure(f, a, b, 0);
  console.log(`${(name + ' ' + a + ':' + b).padEnd(18)}codebox ${fmt(got)}`);
  console.log(`${''.padEnd(18)}atlas   ${fmt(atlas[name][`${a}:${b}`].at_lon0)}`);
}
for (const [f, name, a, b, lon] of extra) {
  console.log(`${(name + ' lon ' + lon).padEnd(18)}codebox ${fmt(measure(f, a, b, lon))}`);
  console.log(`${''.padEnd(18)}atlas   ${fmt(atlas[name][`${a}:${b}`].lon_spectra[Math.round(lon * 16)])}`);
}
