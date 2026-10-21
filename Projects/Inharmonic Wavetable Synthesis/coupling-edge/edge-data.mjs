// edge-data.mjs — fold the data the page plays into its DATA block (the page fetches nothing).
//   node edge-data.mjs
// Reads seed-streams.json (seed_streams.py) and the trajectory library's measured objects
// (../trajectory-library/*.wtb.json, read in place), writes the block between
// /*DATA:start*/ and /*DATA:end*/ in coupling-edge-instrument.html.
import { readFileSync, writeFileSync } from 'node:fs';
const here = (f) => new URL(f, import.meta.url);
const lib = (f) => JSON.parse(readFileSync(here(`../trajectory-library/${f}`), 'utf8'));
const seeds = JSON.parse(readFileSync(here('seed-streams.json'), 'utf8'));
const r6 = (x) => Number(x.toPrecision(6));

// the piano across the keyboard: each note's fitted fundamental, string stiffness, and how many partials it sounds at the strike
const piano = ['piano-low-A1', 'piano-A2', 'piano-A3', 'piano-A4', 'piano-A5', 'piano-C6', 'piano-Fs6'].map((f) => {
  const d = lib(`${f}.wtb.json`), alive = d.alive_mask[0];
  return { note: f.replace('piano-', '').replace('low-', '').replace('s', '#'), f0: r6(d.f0_fit_hz), B: r6(d.B_fit), partials: Math.max(...alive.map((v, i) => (v ? i + 1 : 0))) };
});
piano.push({ note: 'D7', f0: 2352, B: 1.0e-2, partials: 6 });   // scroll, cycle 9 table: fit only, no trajectory file

// modal objects, rank-filed: the k-th mode in slot k, cents off k × the lowest mode; levels at the strike
const materials = {};
for (const [key, f, label] of [['vibraphone', 'vibraphone-C4', 'vibraphone (C4, tuned bar + resonator)'], ['marimba', 'marimba-C3', 'marimba (C3, tuned wooden bar)'],
  ['bowl', 'singing-bowl-D4', 'singing bowl (D4)'], ['bell', 'bell-brooklyn-C6', 'small bell (Brooklyn, C6)']]) {
  const d = lib(`${f}.wtb.json`);
  const cents = d.mode_ratios.map((r, k) => r6(1200 * Math.log2(r / (k + 1))));
  const amps = d.wta_measured[0].slice(0, d.n_modes).map((a) => r6(Math.max(a, 1e-3)));
  materials[key] = { label, source: d.source, f1: r6(d.f1_hz), ratios: d.mode_ratios.map(r6), cents, amps };
}
const DATA = { seed7: seeds.seed7, seed11: seeds.seed11, piano, materials };
const p = here('coupling-edge-instrument.html'), html = readFileSync(p, 'utf8');
const out = html.replace(/\/\*DATA:start\*\/[\s\S]*?\/\*DATA:end\*\//, `/*DATA:start*/const DATA = ${JSON.stringify(DATA)};/*DATA:end*/`);
writeFileSync(p, out);
console.log('DATA block:', JSON.stringify(DATA).length, 'chars;', piano.map((x) => `${x.note} ${x.B}`).join(', '));
for (const [k, m] of Object.entries(materials)) console.log(' ', k, m.ratios.join(' : '));
