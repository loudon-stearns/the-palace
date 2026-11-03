#!/usr/bin/env node
/*
  title: Action Potential Oscillator — rich — checks
  born: 2026-11-03
  links: [[Action Potential Oscillator]] (connects-to · rich-face-checks) · checks "Action Potential Oscillator — rich — four stages.html" and "Action Potential Oscillator — rich — crowd.html"
  forward_vector: I re-run every claim the two made pieces of the rich face show, on the engines inside
    those pieces (pulled out of their own HTML, never a copy), so a change to a piece that breaks a
    claim fails here. With Faust on the machine I also build the steward's spike-shape harness and hold
    the crowd's engine to it, sample by sample.

  usage: node "Action Potential Oscillator — rich — checks.mjs" [--no-faust] [--json out.json]
*/
import { readFileSync, writeFileSync, mkdtempSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ENTRY = 'Action Potential Oscillator';
const read = (what) => readFileSync(join(HERE, `${ENTRY} — rich — ${what}.html`), 'utf8');
const between = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); if (i < 0 || j < 0) throw new Error('marker missing: ' + a); return src.slice(i, j + b.length); };
const fourSrc = read('four stages'), crowdSrc = read('crowd');
const NeuronEngine = new Function(between(fourSrc, '/* ENGINE:START', '/* ENGINE:END */') + '\nreturn NeuronEngine;')();
const measureNeuron = new Function('NeuronEngine', between(fourSrc, '/* MEASURE:START', '/* MEASURE:END */') + '\nreturn measureNeuron;')(NeuronEngine);
const CrowdEngine = new Function(between(crowdSrc, '/* ENGINE:START', '/* ENGINE:END */') + '\nreturn CrowdEngine;')();
const Tally = new Function(between(crowdSrc, '/* TALLY:START', '/* TALLY:END */') + '\nreturn Tally;')();
// the constants the crowd piece quotes
const SHAPES = new Function(crowdSrc.match(/const SHAPES = \{[\s\S]*?\n\};/)[0] + '\nreturn SHAPES;')();
const HEADLESS = new Function(crowdSrc.match(/const HEADLESS = \{[^\n]*\};/)[0] + '\nreturn HEADLESS;')();

const args = process.argv.slice(2);
const SR = 48000, N = 32;
let fails = 0; const out = {};
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails++; };

// ── a small FFT for the crowd's brightness ──
function fft(re, im) { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const h = i + k + len / 2, xr = re[h] * cr - im[h] * ci, xi = re[h] * ci + im[h] * cr; re[h] = re[i + k] - xr; im[h] = im[i + k] - xi; re[i + k] += xr; im[i + k] += xi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } }
function spectrum(x) { let n = 1; while (n < x.length) n <<= 1; const re = new Float64Array(n), im = new Float64Array(n); const mean = x.reduce((s, v) => s + v, 0) / x.length; for (let i = 0; i < x.length; i++) re[i] = (x[i] - mean) * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / (x.length - 1))); fft(re, im); const mag = new Float64Array(n / 2), f = new Float64Array(n / 2); for (let k = 0; k < n / 2; k++) { mag[k] = Math.hypot(re[k], im[k]); f[k] = k * SR / n; } return { mag, f }; }
function centroid(x) { const { mag, f } = spectrum(x); let a = 0, b = 0; for (let k = 1; k < mag.length; k++) { a += f[k] * mag[k]; b += mag[k]; } return a / b; }
function envelope(x) { const { mag, f } = spectrum(x); const env = []; for (let i = 0; i < 120; i++) { const g = 80 * Math.pow(100, i / 119), hw = Math.max(g * (Math.pow(2, 1 / 6) - 1), 60); let s = 0, c = 0; for (let k = 0; k < f.length; k++) if (f[k] >= g - hw && f[k] < g + hw) { s += mag[k] ** 2; c++; } env.push(10 * Math.log10(s / c + 1e-20)); } const mx = Math.max(...env); return env.map(v => v - mx); }
const corr = (a, b) => { const ma = a.reduce((s, v) => s + v) / a.length, mb = b.reduce((s, v) => s + v) / b.length; let x = 0, y = 0, z = 0; for (let i = 0; i < a.length; i++) { x += (a[i] - ma) * (b[i] - mb); y += (a[i] - ma) ** 2; z += (b[i] - mb) ** 2; } return x / Math.sqrt(y * z); };

// ═════════ the four stages ═════════
console.log('\nfour stages — one neuron');
{ // stage 4 is one member of the crowd with no spread
  const a = NeuronEngine(SR); a.set({ stage: 4, freq: 110 });
  const c = CrowdEngine(SR, 1); c.set({ n: 1, h_f: 0, h_tau: 0, h_thr: 0, freq: 110 });
  let d = 0; for (let i = 0; i < SR * 2; i++) d = Math.max(d, Math.abs(a.tick() - c.tick()));
  ok(d === 0, `stage 4 is the crowd's neuron, sample for sample (largest difference ${d})`);
}
{ // step 1: the pitch follows the drive
  const errs = [55, 110, 220, 440].map(f => { const m = measureNeuron({ stage: 1, freq: f, tau_ms: Infinity }, SR); return 1200 * Math.log2(m.f0 / f); });
  ok(errs.every(e => Math.abs(e) < 2), `stage 1 plays the dialled note within 2 cents from 55 to 440 Hz (${errs.map(e => e.toFixed(1)).join(', ')} cents)`);
}
{ // step 2: tau at infinity is stage 1, sample for sample; tau changes colour, not pitch
  const a = NeuronEngine(SR), b = NeuronEngine(SR); a.set({ stage: 2, tau_ms: Infinity, freq: 220 }); b.set({ stage: 1, freq: 220 });
  let d = 0; for (let i = 0; i < SR; i++) d = Math.max(d, Math.abs(a.tick() - b.tick()));
  ok(d === 0, `stage 2 with τ = ∞ is stage 1 (largest difference ${d})`);
  const taus = [0.5, 5, Infinity], ms = taus.map(t => measureNeuron({ stage: 2, freq: 110, tau_ms: t }, SR));
  ok(new Set(ms.map(m => m.P)).size === 1, `τ = 0.5 ms, 5 ms and ∞ all play ${ms[0].f0.toFixed(2)} Hz (the drive holds the pitch)`);
  out.stage2_tau = ms.map((m, i) => ({ tau_ms: taus[i], within20: m.within20, centroidH: +m.centroidH.toFixed(2), H2_dB: +(20 * Math.log10(m.H[1] / m.H[0])).toFixed(1) }));
  ok(ms[0].within20 > ms[2].within20 && ms[0].centroidH > ms[2].centroidH, `at the same pitch a short τ is brighter, not warmer: ${out.stage2_tau.map(x => x.within20).join(' → ')} harmonics within 20 dB for τ 0.5 ms, 5 ms, ∞ (110 Hz)`);
}
{ // the test: a fixed spike against a rising pitch
  const rows = [55, 110, 220, 330, 440, 660, 880].map(f => { const m = measureNeuron({ stage: 3, freq: f }, SR); const s = measureNeuron({ stage: 1, freq: f, tau_ms: Infinity }, SR); return { f, plays: +m.f0.toFixed(1), within20: m.within20, centroidHz: Math.round(m.centroidHz), centroidH: +m.centroidH.toFixed(2), saw_within20: s.within20 }; });
  out.stage3_sweep = rows; console.table(rows);
  const r = f => rows.find(x => x.f === f);
  ok(r(55).within20 > r(110).within20 && r(110).within20 > r(220).within20 && r(220).within20 > r(440).within20, `stage 3 loses harmonics as the note rises: ${[55, 110, 220, 440].map(f => r(f).within20).join(' → ')} within 20 dB (the sawtooth keeps ${r(55).saw_within20})`);
  ok(r(440).centroidHz > r(55).centroidHz, `…while its centroid in hertz rises: ${r(55).centroidHz} → ${r(440).centroidHz} Hz (darker against the note, not in hertz)`);
  const ceil = (stage) => { let lastP = 0; for (let f = 300; f <= 1400; f += 5) { const m = measureNeuron({ stage, freq: f }, SR); if (m.f0 < f * 0.97) return m.f0; lastP = m.f0; } return lastP; };
  const c3 = ceil(3), c4 = ceil(4); out.ceiling = { stage3: +c3.toFixed(1), stage4: +c4.toFixed(1) };
  ok(c3 > 900 && c3 < 1000, `stage 3's ceiling with a 1 ms spike: ${c3.toFixed(0)} Hz (1 ⁄ spike ≈ 1000)`);
  ok(c4 > 370 && c4 < 410, `stage 4's ceiling adds 1.5 ms of recovery: ${c4.toFixed(0)} Hz (1 ⁄ 2.5 ms = 400)`);
}
{ // step 4: the recovery rings, and every cycle repeats: nothing at half the note
  const rows = [];
  for (const damp of [0.05, 0.3, 1.0, 2.0]) for (const f of [55, 110, 220]) { const m = measureNeuron({ stage: 4, freq: f, damp }, SR); rows.push({ damp, f, repeat: m.repeat, halfNote_dB: isFinite(m.belowNoteDb) ? +m.belowNoteDb.toFixed(1) : -Infinity, centroidH: +m.centroidH.toFixed(2) }); }
  out.stage4_subharmonic = rows;
  ok(rows.every(x => x.repeat === 0), 'stage 4 repeats sample for sample at every damping tried (ζ 0.05 to 2, 55 to 220 Hz)');
  ok(rows.every(x => x.halfNote_dB < -100), `nothing at half the note: loudest odd bin ${Math.max(...rows.map(x => x.halfNote_dB)).toFixed(0)} dB re the fundamental`);
  const lo = measureNeuron({ stage: 4, freq: 110, damp: 0.05 }, SR), hi = measureNeuron({ stage: 4, freq: 110, damp: 2 }, SR);
  const dd = lo.H.slice(0, 8).map((m, i) => 20 * Math.log10(m / hi.H[i]));
  out.stage4_damping_low_harmonics_dB = dd.map(v => +v.toFixed(1));
  console.log('  info ζ 0.05 against ζ 2 at 110 Hz, harmonics 1–8:', out.stage4_damping_low_harmonics_dB.join(' '), 'dB');
}

// ═════════ the crowd ═════════
console.log('\ncrowd — thirty-two neurons');
function faustCheck() {
  if (args.includes('--no-faust')) { console.log('  skip Faust comparison (--no-faust)'); return; }
  let faust; try { faust = execFileSync('which', ['faust']).toString().trim(); } catch { console.log('  skip Faust comparison (no faust on PATH)'); return; }
  const dir = mkdtempSync(join(tmpdir(), 'apo-checks-')), cpp = join(dir, 'r.cpp'), bin = join(dir, 'r');
  const sd = join(HERE, 'spike-shape');
  execFileSync(faust, ['-double', '-a', 'arch.cpp', '-i', 'shape_render.dsp', '-o', cpp], { cwd: sd });
  execFileSync('c++', ['-O2', '-std=c++17', '-I/opt/homebrew/include', '-I/usr/local/include', cpp, '-o', bin]);
  for (const [name, s] of Object.entries(SHAPES)) {
    const K_on = 3 * s.Khalf, free_s = 1.0, secs = 3;
    const params = { ...s.p, K_on, free_s };
    const raw = execFileSync(bin, [String(secs), String(SR), ...Object.entries(params).map(([k, v]) => `${k}=${v}`)], { maxBuffer: 1 << 30 });
    const f = new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4), nout = N + 3;
    const e = CrowdEngine(SR, N); e.set({ ...s.p, n: N, anchor: 0 });
    let da = 0, dm = 0; for (let k = 0; k < f.length / nout; k++) { e.P.K = k / SR >= free_s ? K_on : 0; const a = e.tick(); da = Math.max(da, Math.abs(a - f[k * nout + 1])); dm = Math.max(dm, Math.abs(e.mf - f[k * nout])); }
    ok(da < 1e-6 && dm === 0, `${name}: the piece's engine matches Faust's neuropulse.dsp (v0.4) — audio within ${da.toExponential(1)}, mean field exact`);
  }
}
faustCheck();

function run(p, K_on, free_s, secs) {
  const e = CrowdEngine(SR, N); e.set({ ...p, n: N, anchor: 1 });
  const n = Math.round(secs * SR), a = new Float64Array(n), on = Array.from({ length: N }, () => []), spk = new Uint8Array(N);
  const T = Tally(N); const tallyR = []; let acc = 0, k = 0;
  for (let s = 0; s < n; s++) { e.P.K = s / SR >= free_s ? K_on : 0; a[s] = e.tick(spk); for (let i = 0; i < N; i++) if (spk[i]) { on[i].push(s); T.spike(i, s); } if (s % 24 === 0) { acc += T.R(s, N); k++; } if (s % 2048 === 2047) { tallyR.push([s, acc / k]); acc = 0; k = 0; } }
  return { a, on, tallyR };
}
function orderParameter(on, t0, t1) { // spike-shape/sweep.py's R: each phase runs 0 → 2π between consecutive onsets
  const step = SR / 2000, idx = on.map(() => 0); let acc = 0, cnt = 0;
  for (let g = t0; g < t1; g += step) { let re = 0, im = 0, okk = true;
    for (let i = 0; i < N; i++) { const o = on[i]; while (idx[i] + 1 < o.length && o[idx[i] + 1] <= g) idx[i]++; const j = idx[i]; if (o[j] > g || j + 1 >= o.length) { okk = false; break; } const ph = 2 * Math.PI * (g - o[j]) / (o[j + 1] - o[j]); re += Math.cos(ph); im += Math.sin(ph); }
    if (okk) { acc += Math.hypot(re, im) / N; cnt++; } }
  return acc / cnt;
}
const Ks = Array.from({ length: 19 }, (_, i) => Math.round(Math.pow(10, -4 + 3 * i / 18) * 1e6) / 1e6);
const crowd = {}; const envs = {};
for (const [name, s] of Object.entries(SHAPES)) {
  const curve = Ks.map(K => ({ K, R: orderParameter(run(s.p, K, 1.0, 5.0).on, 2 * SR, 5 * SR) }));
  const i = curve.findIndex(r => r.R >= 0.5);
  const Kh = Math.pow(10, Math.log10(curve[i - 1].K) + (0.5 - curve[i - 1].R) / (curve[i].R - curve[i - 1].R) * (Math.log10(curve[i].K) - Math.log10(curve[i - 1].K)));
  const { a, on, tallyR } = run(s.p, 3 * s.Khalf, 2.5, 5.5);
  const smear = a.subarray(1.0 * SR, 2.5 * SR), locked = a.subarray(3.5 * SR);
  const rate = SR / (on.map(o => { const d = o.filter(x => x > 3.5 * SR); return (d[d.length - 1] - d[0]) / (d.length - 1); }).sort((x, y) => x - y)[N >> 1]);
  envs[name] = { s: envelope(smear), l: envelope(locked) };
  const tallyScatter = tallyR.filter(([t]) => t > 1.0 * SR && t < 2.5 * SR).map(x => x[1]), tallyLock = tallyR.filter(([t]) => t > 3.5 * SR).map(x => x[1]);
  crowd[name] = { K_half: +Kh.toPrecision(3), K_half_in_piece: s.Khalf, R_scattered: +orderParameter(on, 1.0 * SR, 2.5 * SR).toFixed(3), R_locked: +orderParameter(on, 3.5 * SR, 5.4 * SR).toFixed(3),
    tally_R_scattered: +(tallyScatter.reduce((x, y) => x + y) / tallyScatter.length).toFixed(3), tally_R_locked: +(tallyLock.reduce((x, y) => x + y) / tallyLock.length).toFixed(3),
    locked_pitch_hz: +rate.toFixed(2), centroid_scattered_hz: Math.round(centroid(smear)), centroid_locked_hz: Math.round(centroid(locked)), envelope_corr: +corr(envs[name].s, envs[name].l).toFixed(3),
    curve: curve.map(r => +r.R.toFixed(2)) };
}
const names = Object.keys(SHAPES), dist = (w) => { const d = {}; for (let i = 0; i < names.length; i++) for (let j = i + 1; j < names.length; j++) { const A = envs[names[i]][w], B = envs[names[j]][w]; d[names[i] + '–' + names[j]] = +Math.sqrt(A.reduce((s, v, k) => s + (v - B[k]) ** 2, 0) / A.length).toFixed(1); } return d; };
out.crowd = crowd; out.between_shapes_dB = { scattered: dist('s'), locked: dist('l') };
console.table(Object.fromEntries(Object.entries(crowd).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).filter(([kk]) => kk !== 'curve'))])));
console.log('  between-shape envelope distance, dB rms:', JSON.stringify(out.between_shapes_dB));
for (const [name, c] of Object.entries(crowd)) {
  ok(Math.abs(Math.log(c.K_half / c.K_half_in_piece)) < 0.05, `${name}: K½ the piece uses (${c.K_half_in_piece}) is the measured one (${c.K_half})`);
  ok(c.R_locked > 0.95 && c.R_scattered < 0.35, `${name}: 3 × K½ locks (R ${c.R_locked}); K = 0 scatters (R ${c.R_scattered})`);
  ok(Math.abs(c.tally_R_locked - c.R_locked) < 0.05 && c.tally_R_scattered < 0.45, `${name}: the piece's live R agrees (locked ${c.tally_R_locked}, scattered ${c.tally_R_scattered})`);
  ok(Math.abs(c.locked_pitch_hz - 110) < 1.5, `${name}: with the anchor on, the lock lands on the note (${c.locked_pitch_hz} Hz)`);
  ok(c.centroid_locked_hz < c.centroid_scattered_hz * 0.7, `${name}: locking darkens it: ${c.centroid_scattered_hz} → ${c.centroid_locked_hz} Hz`);
  ok(Math.abs(HEADLESS[name][0] - c.centroid_scattered_hz) <= 2 && Math.abs(HEADLESS[name][1] - c.centroid_locked_hz) <= 2, `${name}: the piece quotes these brightness numbers (${HEADLESS[name].join(' → ')})`);
  ok(c.envelope_corr > 0.98, `${name}: the shape of its spectrum survives the lock (correlation ${c.envelope_corr})`);
}
ok(out.between_shapes_dB.locked['full–bare'] > 10 && out.between_shapes_dB.locked['full–wide'] > 10, 'width keeps the shapes apart once locked (full against click and against slow, > 10 dB)');
console.log(`  info the undershoot alone (full against no undershoot): ${out.between_shapes_dB.scattered['full–flat']} dB scattered, ${out.between_shapes_dB.locked['full–flat']} dB locked`);
const ratio = crowd.bare.K_half / crowd.full.K_half; out.click_over_full = +ratio.toFixed(1);
ok(ratio > 8 && ratio < 14, `the click needs about ten times the coupling of the full spike (${ratio.toFixed(1)}×)`);

const j = args.indexOf('--json'); if (j >= 0) writeFileSync(args[j + 1], JSON.stringify(out, null, 1));
console.log(fails ? `\n${fails} check(s) failed` : '\nevery check passed');
process.exit(fails ? 1 : 0);
