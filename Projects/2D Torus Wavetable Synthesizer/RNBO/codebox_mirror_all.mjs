// codebox_mirror_all.mjs — every codebox in this folder, run as written,
// held against the Python script that made its auditions, on the real
// catalog WAVs a Max buffer~ would load.
//
//   python3 reference_renders.py /tmp/torus_mirror_refs
//   node codebox_mirror_all.mjs /tmp/torus_mirror_refs
//
// codebox_mirror.mjs covers torus_2d_hopf.codebox against the browser
// engine. This covers the other four:
//   lookup    vs Tools/scan_surface.py, the codebox's own protocol steps
//   kuramoto  vs Tools/kuramoto_scan.py, K ramped across the lock, DC
//             blocker off and on
//   bank      vs Tools/warp_bank.py scan_bank(), bankPos ramped 0 -> 8
//   tier-1    no Python reference exists; its own unit test instead
//             (all warps at zero must equal the bare lookup)
// plus the kuramoto unit test (coupling 0, dcBlock 0 = bare lookup), and
// one question cycle 10 left open: do the hetRow values in the Hopf
// codebox, measured on the browser's own surfaces, still find the loud
// row on the catalog WAVs?
//
// The Python references compute phase as (f * t) mod 1; the codeboxes
// accumulate phase += f / sr. Those agree to rounding, not to the bit,
// so the lookup and bank cases report a noise floor rather than zero.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCodebox, readWav } from './codebox_transpile.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const refDir = process.argv[2] || '/tmp/torus_mirror_refs';
const man = JSON.parse(fs.readFileSync(path.join(refDir, 'manifest.json'), 'utf8'));
const SR = man.sr;
const dB = (r) => +(20 * Math.log10(r + 1e-15)).toFixed(1);
const surf = {}; for (const k in man.surfaces) surf[k] = readWav(man.surfaces[k]);
const makers = {};
const mk = (f) => (makers[f] ??= loadCodebox(path.join(here, f)));

function run(file, table, params, n, ramp = {}) {
  const m = mk(file)(table, SR);
  for (const k in params) m.set(k, params[k]);
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    for (const k in ramp) m.set(k, ramp[k][0] + (ramp[k][1] - ramp[k][0]) * i / (n - 1));
    out[i] = m.tick();
  }
  return out;
}
function compare(a, b) {
  let q = 0, d = 0, mx = 0, bad = 0;
  for (let i = 0; i < a.length; i++) {
    const e = a[i] - b[i]; if (!Number.isFinite(b[i])) bad++;
    q += a[i] * a[i]; d += e * e; mx = Math.max(mx, Math.abs(e));
  }
  return { max_abs_diff: mx, diff_vs_signal_dB: mx === 0 ? 'bit-exact' : dB(Math.sqrt(d / q)), nonfinite: bad };
}

const report = { reference_cases: [], unit_tests: [], hetRow_on_catalog: [] };

// 1. each codebox against its Python reference
for (const c of man.cases) {
  const ref = new Float64Array(fs.readFileSync(c.ref).buffer.slice(0));
  const got = run(c.codebox, surf[c.surface], c.params, ref.length, c.ramp);
  const r = { codebox: c.codebox, surface: c.surface, case: c.label, ...compare(ref, got) };
  report.reference_cases.push(r);
  console.log(`${c.codebox.padEnd(26)} ${c.surface.padEnd(19)} ${c.label.padEnd(26)} ${r.diff_vs_signal_dB === 'bit-exact' ? 'bit-exact' : r.diff_vs_signal_dB + ' dB'}  (max ${r.max_abs_diff.toExponential(1)})`);
}

// 2. unit tests the codeboxes' own comments promise
const N = 2 * SR, KRON = { baseHz: 220, ratio: 1.500625, gain: 1 };
for (const s of ['Penrose', 'Knot Shadow', 'Membrane']) {
  const bare = run('torus_2d_lookup.codebox', surf[s], KRON, N);
  const tier = run('torus_2d_lookup_with_tier1_warps.codebox', surf[s], { ...KRON, bendX: 0, bendY: 0, shearAmount: 0, displaceAmount: 0 }, N);
  const kur = run('torus_2d_kuramoto.codebox', surf[s], { ...KRON, coupling: 0, dcBlock: 0 }, N);
  for (const [lab, x] of [['tier-1 warps at zero = bare', tier], ['kuramoto coupling 0, dcBlock 0 = bare', kur]]) {
    const r = { surface: s, test: lab, ...compare(bare, x) }; report.unit_tests.push(r);
    console.log(`unit test  ${s.padEnd(12)} ${lab.padEnd(40)} ${r.diff_vs_signal_dB === 'bit-exact' ? 'bit-exact' : r.diff_vs_signal_dB + ' dB'}`);
  }
  // the tier-1 warps turned on: no reference, but they must stay finite
  const on = run('torus_2d_lookup_with_tier1_warps.codebox', surf[s], { ...KRON, ratio: 1.5, bendX: 0.6, bendY: -0.4, shearAmount: 0.3, shearShape: 0, displaceAmount: 0.02, displaceMode: 1 }, N);
  const r = { surface: s, test: 'tier-1 warps on (bend .6/-.4, shear .3 sine, displace .02 rot)', ...compare(bare, on) };
  report.unit_tests.push(r);
  console.log(`warps on   ${s.padEnd(12)} non-finite samples ${r.nonfinite}, moved ${r.diff_vs_signal_dB} dB from bare`);
}

// 3. hetRow: the browser-measured value vs the catalog WAV's own loudest row
const HETROW = { Penrose: 0.25, 'Knot Shadow': 0.3505859375, Membrane: 0.111328125 };
for (const s in HETROW) {
  const W = surf[s], R = 1024, e = new Float64Array(R);
  for (let y = 0; y < R; y++) { let m = 0; for (let x = 0; x < R; x++) m += W[y * R + x]; m /= R;
    for (let x = 0; x < R; x++) { const d = W[y * R + x] - m; e[y] += d * d; } }
  let best = 0; for (let y = 1; y < R; y++) if (e[y] > e[best]) best = y;
  const at = Math.floor(HETROW[s] * R);
  const r = { surface: s, codebox_hetRow: HETROW[s], catalog_loudest_row: best / R,
    energy_at_codebox_row_vs_loudest_dB: dB(Math.sqrt(e[at] / e[best])) };
  report.hetRow_on_catalog.push(r);
  console.log(`hetRow     ${s.padEnd(12)} codebox ${HETROW[s]} · catalog loudest ${best / R} · codebox row is ${r.energy_at_codebox_row_vs_loudest_dB} dB under the loudest`);
}

fs.writeFileSync(path.join(here, 'codebox_mirror_all_report.json'), JSON.stringify(report, null, 2) + '\n');
