// comb_two_pumps_check.mjs — pulls the fq-engine script out of "Pumped Comb — two pumps.html" and checks it.
//   1. fcRender against comb_render.py run() on one second (gain ε 0.1 at 1×, length ±0.6 at 1.5×), same noise.
//      Needs /tmp reference files from:  python3 comb_two_pumps_ref.py   (skipped if absent)
//   2. each preset's claim, re-measured.   3. the break-depth table.   4. two WAVs of the new presets.
// Writes comb_two_pumps.json.   Run: node comb_two_pumps_check.mjs
import fs from 'fs';
const html = fs.readFileSync('Pumped Comb — two pumps.html', 'utf8');
const src = html.split('<script id="fq-engine">')[1].split('</script>')[0];
const { fcRender, fcMeasure, FC } = new Function(src + '; return { fcRender, fcMeasure, FC };')();
const rep = { f0: FC.F0 };
if (fs.existsSync('/tmp/fq_ref_nz.f64')) {
  const nz = new Float64Array(fs.readFileSync('/tmp/fq_ref_nz.f64').buffer.slice(0)), py = new Float64Array(fs.readFileSync('/tmp/fq_ref_py.f64').buffer.slice(0));
  const y = fcRender({ dur: 1, g0: 0.98, eps: 0.1, gRatio: 1, gCents: 0, lenDepth: 0.6, lenRatio: 1.5, seed: 3, noise: 1e-4 }, nz);
  let m = 0; for (let i = 0; i < y.length; i++) m = Math.max(m, Math.abs(y[i] - py[i])); rep.max_diff_vs_python = m;
}
const base = { dur: 4, g0: 0.98, noise: 1e-4, gCents: 0, seed: 3, pluck: false, epsRamp: false, lenRamp: false };
const lvl = (p) => +fcMeasure(fcRender({ ...base, ...p })).levelDb.toFixed(1);
// lock edge in cents at ε 0.2, 1×, held (6 s)
rep.cents_edge = {}; for (const c of [0, 2, 4, 8, 12, 16, 20, -4, -8, -12]) rep.cents_edge[c] = lvl({ dur: 6, eps: 0.2, gRatio: 1, gCents: c, lenDepth: 0, lenRatio: 1 });
// presets
const sh = (p) => { const M = fcMeasure(fcRender({ ...base, ...p })); return { level_dB: +M.levelDb.toFixed(1), between_pct: +(100 * M.offShare).toFixed(1) }; };
rep.preset_half = sh({ eps: 0.1, gRatio: 1, lenDepth: 16, lenRatio: 1.5, lenRamp: true });
rep.preset_stray = sh({ eps: 0.1, gRatio: 1, lenDepth: 12, lenRatio: 2.1213, lenRamp: true });
rep.held_no_length = sh({ eps: 0.1, gRatio: 1, lenDepth: 0, lenRatio: 1 });
// where the stray-rate ring dies on the preset's ramp: last 0.25 s window above -33 dB
{ const x = fcRender({ ...base, eps: 0.1, gRatio: 1, lenDepth: 12, lenRatio: 2.1213, lenRamp: true }), W = 12000; let lastLoud = 0;
  for (let a = 0; a + W <= x.length; a += W) { let s = 0; for (let i = a; i < a + W; i++) s += x[i] * x[i]; if (10 * Math.log10(s / W) > -33) lastLoud = a + W; }
  rep.stray_dies_at_depth = +(12 * lastLoud / x.length).toFixed(2); }
// break depth table (6 s, fixed depth, last 2 s under -33 dB)
const lv2 = x => { let s = 0, m = 0; const a = 4 * FC.SR; for (let i = a; i < x.length; i++) m += x[i]; m /= x.length - a; for (let i = a; i < x.length; i++) s += (x[i] - m) ** 2; return 10 * Math.log10(s / (x.length - a) + 1e-30); };
rep.breaks_at = {};
for (const rL of [0.5, 1, 1.5, 2, 2.5, 3, 1.2, 1.25, 1.3333, Math.SQRT2, Math.PI / 2, 1.7, 2.1213]) { let k = null;
  for (const D of [1, 2, 3, 4, 6, 8, 12, 16, 24, 32]) if (lv2(fcRender({ ...base, dur: 6, eps: 0.1, gRatio: 1, lenDepth: D, lenRatio: rL })) < -33) { k = D; break; }
  rep.breaks_at[rL.toFixed(4)] = k; }
// WAVs: 8 s, the two both-pump presets
function wav(name, x) { let pk = 1e-9; for (const v of x) pk = Math.max(pk, Math.abs(v)); const g = 10 ** (-1 / 20) / pk, n = x.length, b = Buffer.alloc(44 + 2 * n), f = 240;
  b.write('RIFF', 0); b.writeUInt32LE(36 + 2 * n, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(FC.SR, 24); b.writeUInt32LE(2 * FC.SR, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(2 * n, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(32767 * x[i] * g * Math.min(1, i / f, (n - 1 - i) / f)), 44 + 2 * i); fs.writeFileSync(name, b); }
wav('comb_f_held_halfway_length.wav', fcRender({ ...base, dur: 8, eps: 0.1, gRatio: 1, lenDepth: 16, lenRatio: 1.5, lenRamp: true }));
wav('comb_g_held_stray_length.wav', fcRender({ ...base, dur: 8, eps: 0.1, gRatio: 1, lenDepth: 12, lenRatio: 2.1213, lenRamp: true }));
fs.writeFileSync('comb_two_pumps.json', JSON.stringify(rep, null, 1)); console.log(JSON.stringify(rep, null, 1));
