// mathieu_mirror.mjs — run RNBO/mathieu_resonator.codebox's own text in Node
// (no Max), check it against the Python reference, run the seven tests of
// its own checklist with measured numbers, and render the audition for the
// two calls the build made (damping, saturation).
//
//   python3 verify/ref_dump.py && node verify/mathieu_mirror.mjs
//
// The codebox file is read, never edited. random() is the only stand-in:
// for the A/B it returns the reference's stored noise, so the codebox's
// own noise_level*(random()*2-1) reproduces Python's noise_level*noise[i].
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const BOX = path.join(HERE, '..', 'RNBO', 'mathieu_resonator.codebox');
const SR = 48000, TWO_PI = 2 * Math.PI;

// ---------- the codebox, as written ----------
function transpile(src) {
  src = src.replace(/\/\/.*$/gm, '');
  const decl = [], names = [];
  src = src.replace(/^@param\s*\(\{[^}]*\}\)\s*(\w+)\s*=\s*([^;]+);/gm, (_, n, v) => { decl.push(`let ${n} = ${v};`); names.push(n); return ''; });
  src = src.replace(/^@state\s+(\w+)\s*=\s*([^;]+);/gm, (_, n, v) => { decl.push(`let ${n} = ${v};`); names.push(n); return ''; });
  const consts = []; src = src.replace(/^const\s+[^;]+;/gm, m => { consts.push(m); return ''; });
  const body = src.trim();
  return new Function('sr', 'rnd', `
    const sin=Math.sin, cos=Math.cos, tanh=Math.tanh, random=rnd, samplerate=sr;
    ${consts.join('\n')}
    ${decl.join('\n')}
    return { params:${JSON.stringify(names)},
      set(k,v){ switch(k){ ${names.map(n => `case '${n}': ${n}=v; break;`).join(' ')} default: throw new Error('no '+k);} },
      get(k){ switch(k){ ${names.map(n => `case '${n}': return ${n};`).join(' ')} } },
      tick(in1=0){ let out1=0, out2=0; ${body}
        return [out1, out2]; } };`);
}
const make = transpile(fs.readFileSync(BOX, 'utf8'));
let seed = 1;
const lcg = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;   // deterministic stand-in
function box(params, rnd = lcg) { const m = make(SR, rnd); for (const [k, v] of Object.entries(params)) m.set(k, v); return m; }

// ---------- measuring tools ----------
const dB = (x) => 20 * Math.log10(Math.max(x, 1e-300));
const amax = (a) => { let m = 0; for (const y of a) m = Math.max(m, Math.abs(y)); return m; };
const rms = (a, i0 = 0, i1 = a.length) => { let s = 0; for (let i = i0; i < i1; i++) s += a[i] * a[i]; return Math.sqrt(s / (i1 - i0)); };
function run(params, n, onTick) { const m = box(params); const o = new Float64Array(n);
  for (let i = 0; i < n; i++) { if (onTick) onTick(m, i); o[i] = m.tick()[0]; } return o; }
// linear growth rate (1/s): kick x, noise off, measure the envelope slope while still far below the clip
function growth(params, secs = 0.6) {
  const m = box({ ...params, noise_level: 0, gain: 1 }); m.set('x', 1e-12);
  const n = Math.round(secs * SR), w = Math.round(SR / params.freq) * 4, e = [];
  for (let i = 0; i < n; i++) { m.tick(); const x = m.get('x'), v = m.get('v'), w0 = TWO_PI * params.freq / SR;
    const E = x * x + (v / w0) ** 2; if (E > 1e-4) break; if (i % w === 0 && i > w * 4) e.push([i / SR, 0.5 * Math.log(E)]); }
  const N = e.length, mt = e.reduce((s, p) => s + p[0], 0) / N, me = e.reduce((s, p) => s + p[1], 0) / N;
  return e.reduce((s, p) => s + (p[0] - mt) * (p[1] - me), 0) / e.reduce((s, p) => s + (p[0] - mt) ** 2, 0);
}
function bisect(f, lo, hi, it = 40) { let flo = f(lo); for (let k = 0; k < it; k++) { const mid = (lo + hi) / 2, fm = f(mid); if (Math.sign(fm) === Math.sign(flo)) { lo = mid; flo = fm; } else hi = mid; } return (lo + hi) / 2; }
// magnitude spectrum by averaged Hann frames
function spectrum(a, N = 16384) { const re = new Float64Array(N / 2 + 1); let frames = 0;
  for (let s = 0; s + N <= a.length; s += N / 2) { frames++;
    for (let k = 0; k <= N / 2; k += 1) { /* filled below via DFT on bins we ask for */ } }
  return { at(f) { let acc = 0, fr = 0; for (let s = 0; s + N <= a.length; s += N / 2) { fr++; let c = 0, d = 0;
      for (let i = 0; i < N; i++) { const h = 0.5 - 0.5 * Math.cos(TWO_PI * i / N), ph = TWO_PI * f * i / SR; c += a[s + i] * h * Math.cos(ph); d += a[s + i] * h * Math.sin(ph); }
      acc += c * c + d * d; } return Math.sqrt(acc / fr); } }; }
const base = { freq: 220, q_depth: 0, mod_rate_ratio: 2, gain: 0.5, noise_level: 0.001, damping_zeta: 0.025 };
const R = {};

// ---------- Test 7 first: A/B against the Python reference ----------
{ const ref = new Float64Array(fs.readFileSync(path.join(HERE, 'ref_out.f64')).buffer.slice(0));
  const nz = new Float32Array(fs.readFileSync(path.join(HERE, 'ref_noise.f32')).buffer.slice(0));
  let i = 0; const m = make(SR, () => (nz[i] + 1) / 2);
  for (const [k, v] of Object.entries({ ...base, q_depth: 0.30 })) m.set(k, v);
  let peak = 0, maxd = 0, sd = 0;
  for (i = 0; i < ref.length; i++) { const y = m.tick()[0]; const d = y - ref[i]; maxd = Math.max(maxd, Math.abs(d)); sd += d * d; peak = Math.max(peak, Math.abs(ref[i])); }
  R.t7 = { samples: ref.length, ref_peak: peak, max_diff: maxd, max_diff_dB_under_peak: dB(maxd / peak), rms_diff_dB: dB(Math.sqrt(sd / ref.length) / peak) };
}
// ---------- Test 1: unmodulated ring — pitch and Q from a kicked, noise-free ring ----------
{ const m = box({ ...base, noise_level: 0, gain: 1 }); m.set('x', 1e-3); let prev = 0, zc = [], n = SR * 2;
  for (let i = 0; i < n; i++) { m.tick(); const x = m.get('x'); if (prev < 0 && x >= 0) zc.push(i - x / (x - prev)); prev = x; }
  const f = (zc.length - 1) / ((zc.at(-1) - zc[0]) / SR); const g = growth({ ...base, q_depth: 0 });
  R.t1 = { ring_Hz: f, decay_per_s: g, Q_measured: Math.PI * f / -g, Q_theory: 1 / (2 * base.damping_zeta), readme_says: 'Q ≈ 33, 3 dB bandwidth ≈ 6.6 Hz' };
}
// how loud is "silence"? the noise floor at q = 0 against the saturated ring at q = 0.3
R.floor = {};
for (const nl of [1e-3, 1e-4, 1e-5]) { seed = 5; const a = run({ ...base, noise_level: nl }, SR * 4); seed = 5; const b = run({ ...base, noise_level: nl, q_depth: 0.3 }, SR * 4);
  R.floor[nl] = { floor_dBFS_q0: +dB(rms(a, SR)).toFixed(1), ringing_dBFS_q03: +dB(rms(b, SR * 2)).toFixed(1), contrast_dB: +(dB(rms(b, SR * 2)) - dB(rms(a, SR))).toFixed(1) }; }
// ---------- threshold: exact, by growth rate ----------
R.threshold = {};
for (const z of [0.0125, 0.025, 0.05]) R.threshold[z] = { q_c_measured: bisect(q => growth({ ...base, damping_zeta: z, q_depth: q }), 0.0, 0.4), q_c_theory_2zeta: 2 * z, readme_says_4zeta: 4 * z };
// ---------- Test 2: q = 0.05 ----------
R.t2 = { growth_per_s_at_0_05: growth({ ...base, q_depth: 0.05 }), growth_per_s_at_0_03: growth({ ...base, q_depth: 0.03 }), note: 'q = 0.05 sits on the threshold, not below it; 0.03 is below' };
// ---------- Test 3: sweep 0 → 0.5 over 10 s, at the default noise and at 1e-5 ----------
R.t3 = {};
for (const nl of [1e-3, 1e-5]) { seed = 3; const n = SR * 10; const a = run({ ...base, noise_level: nl }, n, (m, i) => m.set('q_depth', 0.5 * i / n)); const step = SR / 20, lv = [];
  for (let s = 0; s + step <= n; s += step) lv.push(dB(rms(a, s, s + step)));
  const floor = Math.max(...lv.slice(0, 10)); const k = lv.findIndex(v => v > floor + 20);
  R.t3[nl] = { floor_dBFS: +floor.toFixed(1), top_dBFS: +Math.max(...lv).toFixed(1), crack_at_s: k < 0 ? null : k / 20, crack_at_q: k < 0 ? null : +(0.5 * (k / 20) / 10).toFixed(3) }; }
R.t3.note = 'crack = first 50 ms window 20 dB over the opening floor; the noise needs time to grow, so it lands after the exact threshold of 0.05';
// ---------- Test 4: spectrum at q = 0.3 ----------
{ const a = run({ ...base, q_depth: 0.3 }, SR * 4).subarray(SR); const S = spectrum(a); const ref = S.at(220);
  R.t4 = { 'peaks_dB_rel_220': Object.fromEntries([110, 220, 440, 660, 880, 1100, 1540].map(f => [f, +dB(S.at(f) / ref).toFixed(1)])) };
}
// ---------- Test 5: tongue edges at q = 0.2 ----------
{ const g = (r) => growth({ ...base, q_depth: 0.2, mod_rate_ratio: r }); const th = Math.sqrt(0.2 ** 2 - (2 * base.damping_zeta) ** 2);
  R.t5 = { lower_edge_ratio: bisect(g, 1.5, 2.0), upper_edge_ratio: bisect(g, 2.0, 2.5), theory_first_order: [2 - th, 2 + th],
    growth_per_s: Object.fromEntries([2.0, 1.95, 1.9, 1.85, 1.8, 1.75].map(r => [r, +g(r).toFixed(1)])),
    readme_says: 'detuning ≥ 5% exits the tongue' };
}
// ---------- Test 6: q = 0.8 ----------
{ const a = run({ ...base, q_depth: 0.8 }, SR * 4); let bad = 0; for (const y of a) if (!Number.isFinite(y)) bad++;
  R.t6 = { non_finite: bad, rms_dBFS_last_3s: dB(rms(a, SR)), peak: amax(a) };
  // and with no state clip: when does it break?
  let brk = null;
  let x = 0, v = 0, phi = 0, w0 = TWO_PI * 220 / SR; seed = 7;
  for (let i = 0; i < SR * 60; i++) { phi += 2 * w0; if (phi >= TWO_PI) phi -= TWO_PI; const c = w0 * w0 * (1 - 1.6 * Math.cos(phi));
    v = v + (-c * x - 0.05 * w0 * v + 0.001 * (lcg() * 2 - 1)); x = x + v; if (!Number.isFinite(x) || Math.abs(x) > 3.4e38) { brk = i / SR; break; } }
  R.t6.without_state_clip_float32_overflow_at_s = brk;
}

// ---------- the audition for the two calls ----------
function writeWav(p, a) { const b = Buffer.alloc(44 + a.length * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + a.length * 4, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(3, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(32, 34); b.write('data', 36); b.writeUInt32LE(a.length * 4, 40);
  for (let i = 0; i < a.length; i++) b.writeFloatLE(a[i], 44 + 4 * i); fs.writeFileSync(p, b); }
const fade = (a, ms = 15) => { const k = Math.round(ms * SR / 1000); for (let i = 0; i < k; i++) { a[i] *= i / k; a[a.length - 1 - i] *= i / k; } return a; };
const cat = (parts, gap = 0.6) => { const g = new Float64Array(Math.round(gap * SR)); const all = []; parts.forEach((p, i) => { if (i) all.push(g); all.push(p); });
  const o = new Float64Array(all.reduce((s, p) => s + p.length, 0)); let k = 0; for (const p of all) { o.set(p, k); k += p.length; } return o; };
const norm = (a, peak) => { const m = amax(a); return a.map(y => y * peak / m); };
const AUD = path.join(HERE, '..', 'audio', 'rulings'); fs.mkdirSync(AUD, { recursive: true });

// Call 1 — damping. Same 6 s sweep of q 0 → 0.3, four dampings, the codebox as written.
const zs = [0, 0.0125, 0.025, 0.05];
const dampParts = zs.map(z => { seed = 11; const n = SR * 6; return fade(run({ ...base, noise_level: 1e-5, damping_zeta: z }, n, (m, i) => m.set('q_depth', 0.3 * i / n))); });
writeWav(path.join(AUD, 'call1_damping_four_sweeps.wav'), norm(cat(dampParts), 0.7));
R.call1 = zs.map((z, j) => ({ zeta: z, crack_expected_s: z ? +(2 * z / 0.3 * 6).toFixed(2) : 0, opening_rms_dBFS: +dB(rms(dampParts[j], SR * 0.05, SR * 0.25)).toFixed(1) }));

// Call 2 — saturation. Three ways to stop the growth, each 3 s at q 0.15 then 3 s at q 0.6.
// (a) the build: clip the state at ±8, output tanh(x). This is the codebox as written.
// (b) gentle — sketch, not in the codebox: damping that grows with the ring's energy (how an OPO
//     saturates: the pump runs out). Steady state sits where q/2 = zeta + g·E, so the level follows q
//     and the wave stays close to the linear Floquet solution — the ladder you hear is the Floquet ladder.
// (c) stiffening — sketch: the spring stiffens with amplitude (Duffing). The ring's pitch rises until
//     it walks out of the tongue; that is what stops it. (The pitch cannot follow: inside the tongue the
//     ring is locked to exactly half the pump.)
function flavour(kind, n, qOf) { let x = 0, v = 0, phi = 0; seed = 23; const w0 = TWO_PI * 220 / SR, a = w0 * w0, z = 0.025, o = new Float64Array(n);
  for (let i = 0; i < n; i++) { const q = qOf(i) * a; phi += 2 * w0; if (phi >= TWO_PI) phi -= TWO_PI; const m = Math.cos(phi), nz = 0.001 * (lcg() * 2 - 1);
    const E = x * x + (v / w0) ** 2;
    if (kind === 'build') { const vn = v + (-(a - 2 * q * m) * x - 2 * z * w0 * v + nz); const xn = x + vn; x = 8 * Math.tanh(xn / 8); v = 8 * Math.tanh(vn / 8); o[i] = Math.tanh(x); }
    if (kind === 'gentle') { const zz = z + 0.05 * E; v = v + (-(a - 2 * q * m) * x - 2 * zz * w0 * v + nz); x = x + v; o[i] = x; }
    if (kind === 'stiff') { v = v + (-(a * (1 + 0.15 * x * x) - 2 * q * m) * x - 2 * z * w0 * v + nz); x = x + v; o[i] = x; } }
  return o; }
const half = SR * 3, qOf = (i) => (i < half ? 0.15 : 0.6);
const kinds = ['build', 'gentle', 'stiff'];
const satParts = kinds.map(k => { const a = flavour(k, 2 * half, qOf); const r = rms(a, half - SR, half); return fade(a.map(y => y * 0.18 / r)); });
writeWav(path.join(AUD, 'call2_saturation_three_ways.wav'), cat(satParts, 0.8));
// what each does to the spectrum at q 0.6 (last second), and to the pitch
R.call2 = kinds.map((k, j) => { const seg = satParts[j].subarray(half + SR * 2, 2 * half); const S = spectrum(seg, 8192);
  let best = [0, 0]; for (let f = 200; f <= 260; f += 0.5) { const m = S.at(f); if (m > best[1]) best = [f, m]; }
  const f0 = best[0];
  return { kind: k, pitch_Hz_at_q06: f0, h3_dB: +dB(S.at(3 * f0) / best[1]).toFixed(1), h5_dB: +dB(S.at(5 * f0) / best[1]).toFixed(1),
    level_jump_dB_q015_to_q06: +(dB(rms(satParts[j], half + SR, 2 * half)) - dB(rms(satParts[j], SR, half))).toFixed(1) }; });
for (const [j, k] of kinds.entries()) writeWav(path.join(AUD, `call2_${k}.wav`), satParts[j]);
fs.writeFileSync(path.join(HERE, 'mirror_report.json'), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
