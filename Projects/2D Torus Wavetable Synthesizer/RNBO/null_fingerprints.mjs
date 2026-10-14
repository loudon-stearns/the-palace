// null_fingerprints.mjs — what the A - B meter in torus-ab.maxpat should
// read, under each way [2d.wave~] might read the surface.
//
//   node null_fingerprints.mjs [surface.wav]   (default: Penrose)
//
// The extphase codebox runs as written (codebox_transpile.mjs). The B
// side is a handful of guesses at [2d.wave~]'s conventions, none of
// them checked against Max: does it wrap from the last row back to the
// first, spread y over 1024 rows or 1023, interpolate between rows at
// all, let x interpolate into the next row, or take the axes the other
// way round. Each guess leaves a different pattern across the four
// protocol tests, so the four numbers Loudon reads off the meter point
// at one of them. Writes null_fingerprints.json beside this file.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCodebox, readWav } from './codebox_transpile.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const wavPath = process.argv[2] || path.join(here, '../Wavetables/15_penrose_lattice.wav');
const tab = readWav(wavPath);
const W = 1024, SR = 48000, N = SR;

// the two copies of lookup2D must be the same text
const fnOf = (f) => fs.readFileSync(path.join(here, f), 'utf8').match(/^function lookup2D[\s\S]*?^\}/m)[0];
if (fnOf('torus_2d_lookup.codebox') !== fnOf('torus_2d_lookup_extphase.codebox')) throw new Error('lookup2D has drifted between the two codeboxes');

const A = loadCodebox(path.join(here, 'torus_2d_lookup_extphase.codebox'))(tab, SR);
const fr = (v) => v - Math.floor(v);
const at = (i) => tab[((i % tab.length) + tab.length) % tab.length];
function bilin(xf, yf, { yWrap = true, xFlat = false, yInterp = true }) {
  const x0 = Math.floor(xf), y0 = Math.floor(yf), xa = xf - x0, ya = yf - y0;
  let y1 = y0 + 1; if (y1 >= W) y1 = yWrap ? 0 : W - 1;
  const rd = (y, x) => xFlat ? at(y * W + x) : at(y * W + (x >= W ? 0 : x));
  const r0 = rd(y0, x0) + xa * (rd(y0, x0 + 1) - rd(y0, x0));
  if (!yInterp) return r0;
  const r1 = rd(y1, x0) + xa * (rd(y1, x0 + 1) - rd(y1, x0));
  return r0 + ya * (r1 - r0);
}
const guesses = {
  'same as the codebox':          (p, q) => bilin(p * W, q * W, {}),
  'no wrap at the last row':      (p, q) => bilin(p * W, q * W, { yWrap: false }),
  'y over 1023 rows':             (p, q) => bilin(p * W, q * (W - 1), { yWrap: false }),
  'no interpolation between rows':(p, q) => bilin(p * W, q * W, { yInterp: false }),
  'x runs into the next row':     (p, q) => bilin(p * W, q * W, { xFlat: true }),
  'x over 1023 samples':          (p, q) => bilin(p * (W - 1), q * W, {}),
  'axes swapped':                 (p, q) => bilin(q * W, p * W, {}),
};
const tests = [
  ['static row', 220, 0], ['static column', 0.5, 1000],
  ['closed orbit 3:2', 220, 1.5], ['shimmer 3:2 + a hair', 220, 1.500625],
];
const dB = (r) => r === 0 ? '−∞ (bit-exact)' : (20 * Math.log10(r)).toFixed(1);
const rows = [];
for (const [g, B] of Object.entries(guesses)) {
  const row = [g];
  for (const [, base, ratio] of tests) {
    let p = 0, q = 0, s = 0, d = 0, mx = 0;
    for (let n = 0; n < N; n++) {
      const a = A.tick(p, q), b = B(p, q);
      s += a * a; d += (a - b) ** 2; mx = Math.max(mx, Math.abs(a - b));
      p = fr(p + base / SR); q = fr(q + base * ratio / SR);
    }
    row.push(`${dB(mx)} dBFS peak`);
  }
  rows.push(row);
}
const out = { surface: path.basename(wavPath), seconds_per_test: N / SR,
  columns: ['if 2d.wave~ …', ...tests.map(t => `${t[0]} (${t[1]} Hz, ratio ${t[2]})`)], rows,
  note: 'Peak of A − B in dBFS, as [peakamp~] -> [atodb] in the patch shows it. A guess, not Max: the B side is a model of 2d.wave~.' };
fs.writeFileSync(path.join(here, 'null_fingerprints.json'), JSON.stringify(out, null, 2));
console.table(rows.map(r => Object.fromEntries(out.columns.map((c, i) => [c.split(' (')[0], r[i]]))));
