// gentle_resonator.mjs — the Mathieu resonator with the saturation Loudon chose
// (GENTLE, 2026-11-04): damping that grows with the ring's energy, the way a
// real parametric oscillator runs its pump dry. No state clip, no tanh.
//
//   node gentle/gentle_resonator.mjs
//
// Max is paused, so this is the reference the codebox will be rewritten to
// match when the pause lifts. The tick below is written line for line the way
// the codebox should read (see "Gentle Resonator — what the codebox needs.md").
//
// Writes: gentle/*.wav, gentle/gentle_report.json, gentle/gentle_map.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SR = 48000, TWO_PI = 2 * Math.PI;

// ---------- the resonator ----------
// sat_g: how fast the damping rises with energy. Chosen so that a full pump
// (q 1, centred) settles at amplitude 1: E = (1/2 - zeta) / g = 1.
export const DEFAULTS = { freq: 220, q_depth: 0, mod_rate_ratio: 2, gain: 0.5, noise_level: 1e-5, damping_zeta: 0.025, sat_g: 0.475 };
export function resonator(p = {}, rnd = Math.random) {
  const P = { ...DEFAULTS, ...p };
  let x = 0, v = 0, phi = 0;
  return {
    P, get x() { return x; }, get v() { return v; }, set x(y) { x = y; },
    tick() {
      const omega_0 = TWO_PI * P.freq / SR;
      const a = omega_0 * omega_0;
      const q = P.q_depth * a;
      phi += P.mod_rate_ratio * omega_0; if (phi >= TWO_PI) phi -= TWO_PI;
      const coeff = a - 2 * q * Math.cos(phi);
      // the one new line: the ring's energy (x and v/omega_0 on the same scale)
      // raises the damping. Capped so the explicit damping term can never flip sign.
      const E = x * x + (v / omega_0) ** 2;
      const zeta = Math.min(P.damping_zeta + P.sat_g * E, 0.45 / omega_0);
      const n_in = P.noise_level * (rnd() * 2 - 1);
      v = v + (-coeff * x - 2 * zeta * omega_0 * v + n_in);
      x = x + v;
      return [P.gain * x, P.gain * v / omega_0];
    } };
}
// the level law it should obey: steady energy = (growth rate the pump allows - zeta) / g
export function theoryE(q, r, z = DEFAULTS.damping_zeta, g = DEFAULTS.sat_g) {
  const eps = r / 2 - 1, s = (q / 2) ** 2 - eps ** 2;
  return s <= 0 ? 0 : Math.max(0, (Math.sqrt(s) - z) / g);
}

// ---------- helpers ----------
let seed = 7; const lcg = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const dB = (y) => 20 * Math.log10(Math.max(y, 1e-12));
const rms = (a, i0 = 0, i1 = a.length) => { let s = 0; for (let i = i0; i < i1; i++) s += a[i] * a[i]; return Math.sqrt(s / (i1 - i0)); };
function writeWav(file, a, peak = 0.7) {
  let m = 0; for (const y of a) m = Math.max(m, Math.abs(y)); const k = m ? peak / m : 1;
  const b = Buffer.alloc(44 + a.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + a.length * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(a.length * 2, 40);
  for (let i = 0; i < a.length; i++) b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(a[i] * k * 32767))), 44 + i * 2);
  fs.writeFileSync(file, b); return k;
}
function zcPitch(a, i0, i1) { const z = []; for (let i = i0 + 1; i < i1; i++) if (a[i - 1] < 0 && a[i] >= 0) z.push(i - 1 + a[i - 1] / (a[i - 1] - a[i])); return z.length > 2 ? (z.length - 1) / ((z.at(-1) - z[0]) / SR) : 0; }
function goertzel(a, f, i0, i1) { let c = 0, d = 0; const N = i1 - i0; for (let i = 0; i < N; i++) { const h = 0.5 - 0.5 * Math.cos(TWO_PI * i / N), ph = TWO_PI * f * i / SR; c += a[i0 + i] * h * Math.cos(ph); d += a[i0 + i] * h * Math.sin(ph); } return Math.hypot(c, d) * 4 / N; }

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const R = {};
  // 1 · the level law, centred: steady amplitude against q
  R.level_law = [0.03, 0.06, 0.1, 0.2, 0.3, 0.5, 0.8, 1.0].map(q => {
    seed = 11; const m = resonator({ q_depth: q, noise_level: 1e-4 }, lcg); const n = SR * 6; let s = 0, k = 0;
    for (let i = 0; i < n; i++) { m.tick(); if (i > SR * 4) { s += m.x * m.x + (m.v / (TWO_PI * 220 / SR)) ** 2; k++; } }
    return { q, E_measured: +(s / k).toFixed(4), E_theory: +theoryE(q, 2).toFixed(4) }; });

  // 2 · the loudness map: ratio × q, steady energy, measured against the law
  const ratios = [], qs = []; for (let r = 1.5; r <= 2.5001; r += 0.025) ratios.push(+r.toFixed(3)); for (let q = 0.05; q <= 1.0001; q += 0.05) qs.push(+q.toFixed(2));
  const map = qs.map(q => ratios.map(r => { seed = 13; const m = resonator({ q_depth: q, mod_rate_ratio: r, noise_level: 1e-4 }, lcg);
    let s = 0, k = 0; for (let i = 0; i < SR * 3; i++) { m.tick(); if (i > SR * 2) { s += m.x * m.x + (m.v / (TWO_PI * 220 / SR)) ** 2; k++; } } return s / k; }));
  let worst = 0, cells = 0; for (const [i, q] of qs.entries()) for (const [j, r] of ratios.entries()) { const t = theoryE(q, r); if (t > 0.02) { worst = Math.max(worst, Math.abs(map[i][j] - t) / t); cells++; } }
  R.map = { cells_inside: cells, worst_rel_error_vs_law: +worst.toFixed(3) };
  fs.writeFileSync(path.join(HERE, 'gentle_map.json'), JSON.stringify({ ratios, qs, E: map.map(row => row.map(e => +e.toFixed(5))) }));

  // 3 · renders
  // (a) the crack and the climb: q 0 → 0.6 over 12 s at the true quiet noise
  { seed = 3; const m = resonator({}, lcg), n = SR * 12, o = new Float64Array(n);
    for (let i = 0; i < n; i++) { m.P.q_depth = 0.6 * i / n; o[i] = m.tick()[0]; }
    const lv = []; for (let i = 0; i < n; i += SR / 10) lv.push(dB(rms(o, i, i + SR / 10)));
    const floor = Math.max(...lv.slice(0, 10)); const k = lv.findIndex(y => y > floor + 20);
    R.crack = { floor_dB: +floor.toFixed(1), crack_q: +(0.6 * k / lv.length).toFixed(3), top_dB: +Math.max(...lv).toFixed(1), contrast_dB: +(Math.max(...lv) - floor).toFixed(1) };
    R.crack.gain = writeWav(path.join(HERE, 'gentle_a_crack_and_climb.wav'), o); }
  // (b) walk across the tongue at q 0.3: the pump rate glides, the ring follows it
  { seed = 4; const m = resonator({ q_depth: 0.3 }, lcg), n = SR * 14, o = new Float64Array(n);
    const rOf = (i) => 1.6 + 0.8 * (i / n);
    for (let i = 0; i < n; i++) { m.P.mod_rate_ratio = rOf(i); m.P.noise_level = 1e-4; o[i] = m.tick()[0]; }
    R.walk = []; for (let s = 1; s < 14; s += 1) { const i0 = s * SR, i1 = i0 + SR / 2; const r = rOf(i0 + SR / 4);
      R.walk.push({ ratio: +r.toFixed(3), pitch_Hz: +zcPitch(o, i0, i1).toFixed(1), half_pump_Hz: +(r * 110).toFixed(1), level_dB: +dB(rms(o, i0, i1)).toFixed(1) }); }
    writeWav(path.join(HERE, 'gentle_b_tongue_walk.wav'), o); }
  // (c) three depths held, so you hear the level follow the pump: q 0.15, 0.4, 0.8, 4 s each
  { seed = 5; const parts = [0.15, 0.4, 0.8].map(q => { const m = resonator({ q_depth: q, noise_level: 1e-4 }, lcg), o = new Float64Array(SR * 4); for (let i = 0; i < o.length; i++) o[i] = m.tick()[0]; return o; });
    const gap = new Float64Array(SR * 0.6), all = new Float64Array(parts.length * (SR * 4 + gap.length)); let o = 0; for (const p of parts) { all.set(p, o); o += p.length + gap.length; }
    R.depths = [0.15, 0.4, 0.8].map((q, j) => { const p = parts[j]; const f0 = 220; const h1 = goertzel(p, f0, SR * 2, SR * 4);
      return { q, level_dB: +dB(rms(p, SR * 2, SR * 4)).toFixed(1), ladder_660_dB: +dB(goertzel(p, 660, SR * 2, SR * 4) / h1).toFixed(1), ladder_1100_dB: +dB(goertzel(p, 1100, SR * 2, SR * 4) / h1).toFixed(1) }; });
    writeWav(path.join(HERE, 'gentle_c_three_depths.wav'), all); }
  // (d) the kill test: ring at q 0.4, then cut the noise at 2 s — the ring keeps itself alive
  { seed = 6; const m = resonator({ q_depth: 0.4, noise_level: 1e-4 }, lcg), n = SR * 6, o = new Float64Array(n);
    for (let i = 0; i < n; i++) { if (i === SR * 2) m.P.noise_level = 0; o[i] = m.tick()[0]; }
    R.kill = { before_dB: +dB(rms(o, SR, SR * 2)).toFixed(1), last_second_dB: +dB(rms(o, SR * 5, SR * 6)).toFixed(1) };
    writeWav(path.join(HERE, 'gentle_d_noise_cut.wav'), o); }
  // 4 · safety: q 1 at the edge ratios and a 4 kHz resonator, 5 s each — any non-finite sample?
  R.safety = [[1, 2, 220], [1, 1.5, 220], [1, 2, 4000], [1, 2, 20]].map(([q, r, f]) => { seed = 9; const m = resonator({ q_depth: q, mod_rate_ratio: r, freq: f, noise_level: 0.01 }, lcg); let bad = 0, peak = 0;
    for (let i = 0; i < SR * 5; i++) { const y = m.tick()[0]; if (!Number.isFinite(y)) bad++; else peak = Math.max(peak, Math.abs(y)); } return { q, ratio: r, freq: f, nonfinite: bad, peak: +peak.toFixed(3) }; });
  fs.writeFileSync(path.join(HERE, 'gentle_report.json'), JSON.stringify(R, null, 1));
  console.log(JSON.stringify(R, null, 1));
}
