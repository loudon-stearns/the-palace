// title: 2D Torus Wavetable Synthesizer — rich face — check-pieces.mjs
// born: 2026-11-03
// links: [[2D Torus Wavetable Synthesizer]] (connects-to · rich-face-check)
// forward_vector: I re-run, headless, every claim the rich face's made pieces make, on the pieces' own
//   code: I pull each piece's math script (and its worklet) out of its HTML and run it in Node against
//   the equation its section states, and against the catalog WAVs. Run me after any change to a piece
//   or a surface: node "Rich face checks/check-pieces.mjs"   (from the bundle, or give no cwd at all).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const BUNDLE = dirname(HERE);
const E = '2D Torus Wavetable Synthesizer';
const read = (f) => readFileSync(join(BUNDLE, f), 'utf8');
const DATA = JSON.parse(read(`${E} — rich — lattices.json`));
const SR = 48000;
let fails = 0;
const ok = (cond, what) => { console.log(`${cond ? '  ok  ' : '  FAIL'}  ${what}`); if (!cond) fails++; };

/** A piece's math script, by id, evaluated; returns its exported object. */
function mathOf(file, id, name) {
  const html = read(file);
  const m = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`));
  if (!m) throw new Error(`${file}: no <script id="${id}">`);
  return new Function(`${m[1]}; return ${name};`)();
}
/** The worklet class a WORKLET string registers, run in a stub AudioWorkletGlobalScope. */
function workletOf(src) {
  let K = null;
  class AudioWorkletProcessor { constructor() { this.port = { onmessage: null, postMessage() {} }; } }
  new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', src)(AudioWorkletProcessor, (_n, k) => { K = k; }, SR);
  return K;
}
function render(Proc, msgs, seconds) {
  const p = new Proc();
  for (const d of msgs) p.port.onmessage({ data: d });
  p.g = 1; // skip the 30 ms gain ramp: the check reads the steady state
  const n = Math.round(seconds * SR), out = new Float64Array(n), L = new Float32Array(128);
  for (let i = 0; i < n; i += 128) { p.process([], [[L, L]]); out.set(L.subarray(0, Math.min(128, n - i)), i); }
  return out;
}
// radix-2 FFT magnitude of a Hann-windowed block
function spectrum(x, size) {
  const re = new Float64Array(size), im = new Float64Array(size);
  for (let i = 0; i < size; i++) re[i] = x[i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / (size - 1)));
  for (let i = 1, j = 0; i < size; i++) { let b = size >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= size; len <<= 1) {
    const a = (-2 * Math.PI) / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < size; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const ur = re[i + k], ui = im[i + k], vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci, vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr; re[i + k] = ur + vr; im[i + k] = ui + vi; re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } }
  }
  const mag = new Float64Array(size / 2); for (let i = 0; i < size / 2; i++) mag[i] = Math.hypot(re[i], im[i]); return mag;
}
function peaks(mag, binHz, floorDb = -50) {
  let mx = 0; for (const v of mag) mx = Math.max(mx, v);
  const out = []; for (let i = 2; i < mag.length - 2; i++) { const v = mag[i]; if (v > mag[i - 1] && v >= mag[i + 1] && 20 * Math.log10(v / mx) > floorDb) { const a = mag[i - 1], c = mag[i + 1], d = (0.5 * (a - c)) / (a - 2 * v + c); out.push({ f: (i + d) * binHz, db: 20 * Math.log10(v / mx) }); } }
  return out;
}
const surf = (name) => DATA.surfaces.find((s) => s.name === name);

// ───────────────────────── the ratio gate ─────────────────────────
console.log('\n§ Architecture — the ratio gate');
{
  const TM = mathOf(`${E} — rich — the ratio gate.html`, 'torus-math', 'TorusMath');
  const Proc = workletOf(TM.WORKLET);
  const N = 512, SIZE = 1 << 18, bin = SR / SIZE;
  const tables = {}; const T = (nm) => (tables[nm] ||= TM.buildTable(surf(nm).terms, N));

  // 1. the surfaces the piece plays are the catalog's: correlation with the WAV, dc out
  for (const s of DATA.surfaces) {
    const buf = readFileSync(join(BUNDLE, 'Wavetables', s.id + '.wav')); const at = buf.indexOf('data');
    const W = new Float32Array(buf.buffer.slice(buf.byteOffset + at + 8, buf.byteOffset + at + 8 + 1024 * 1024 * 4));
    const t = TM.buildTable(s.terms, 256); let sxy = 0, sxx = 0, syy = 0, mw = 0;
    for (let j = 0; j < 256; j++) for (let i = 0; i < 256; i++) mw += W[j * 4 * 1024 + i * 4]; mw /= 65536;
    for (let j = 0; j < 256; j++) for (let i = 0; i < 256; i++) { const a = W[j * 4 * 1024 + i * 4] - mw, b = t[j * 256 + i]; sxy += a * b; sxx += a * a; syy += b * b; }
    const r = sxy / Math.sqrt(sxx * syy);
    ok(r > 0.997, `${s.name}: rebuilt surface vs catalog WAV, correlation ${r.toFixed(4)} (99.5% of energy kept → expect ≥ 0.997)`);
  }

  // 2. f = m f1 + n f2: every predicted line found, every strong measured peak predicted
  const lineCheck = (nm, f1, f2, label) => {
    const x = render(Proc, [{ table: T(nm), N }, { f1, f2, jump: true }, { gain: 1 }], SIZE / SR + 0.05);
    const pk = peaks(spectrum(x.subarray(2400), SIZE), bin, -45);
    const pred = TM.lines(surf(nm).terms, f1, f2).filter((l) => l.f > 0.5 && l.f < 20000);
    const amax = Math.max(...surf(nm).terms.map((t) => t[2]));
    const strongPred = pred.filter((l) => l.a > 0.2 * amax);
    const found = strongPred.filter((l) => pk.some((p) => Math.abs(p.f - l.f) < 2 * bin)).length;
    const strongPk = pk.filter((p) => p.db > -30);
    const unexplained = strongPk.filter((p) => !pred.some((l) => Math.abs(p.f - l.f) < 2 * bin));
    ok(found === strongPred.length && unexplained.length === 0,
      `${nm} at ${label}: ${found}/${strongPred.length} predicted lines found; ${unexplained.length} peak(s) above −30 dB unexplained${unexplained.length ? ' (' + unexplained.slice(0, 4).map((p) => p.f.toFixed(1) + ' Hz ' + p.db.toFixed(0) + ' dB').join(', ') + ')' : ''}`);
    return pk;
  };
  lineCheck('Penrose Lattice', 165, 110, 'f₁:f₂ = 3:2');
  lineCheck('Penrose Lattice', 110 * (1 + Math.sqrt(5)) / 2, 110, 'f₁/f₂ = φ');
  lineCheck('Membrane', 112, 110, 'f₁/f₂ = 112/110');
  lineCheck('Theta Surface', 110 * Math.SQRT2, 110, 'f₁/f₂ = √2');

  // 3. closed means periodic: at 3:2 with f2 = 120 the period is q/f2 = 1/60 s = 800 samples
  const ret = (x, lag) => { let d = 0, e = 0; for (let i = 0; i < x.length - lag; i++) { d += (x[i + lag] - x[i]) ** 2; e += x[i] ** 2; } return Math.sqrt(d / e); };
  {
    const x = render(Proc, [{ table: T('Penrose Lattice'), N }, { f1: 180, f2: 120, jump: true }, { gain: 1 }], 1.2).subarray(4800);
    const at = ret(x, 800);
    let best = Infinity, bestLag = 0; const y = render(Proc, [{ table: T('Penrose Lattice'), N }, { f1: 120 * (1 + Math.sqrt(5)) / 2, f2: 120, jump: true }, { gain: 1 }], 3).subarray(4800, 4800 + 3 * SR - 4800 - 48000);
    for (let lag = 200; lag < 48000; lag += 1) { const r = ret(y.subarray(0, 24000 + lag), lag); if (r < best) { best = r; bestLag = lag; } }
    ok(at < 1e-3 && best > 0.05, `periodic at 3:2 (return error after 800 samples ${at.toExponential(1)}); at φ the best return within 1 s is ${(best * 100).toFixed(1)}% off, at ${bestLag} samples`);
  }

  // 4. the test: drag through 3/2 in small steps — every line's measured position follows m·f1 + n·f2, none jumps
  {
    let worst = 0, n = 0;
    for (let r = 1.49; r <= 1.5101; r += 0.0025) {
      const f1 = r * 110, x = render(Proc, [{ table: T('Penrose Lattice'), N }, { f1, f2: 110, jump: true }, { gain: 1 }], SIZE / SR + 0.05);
      const pk = peaks(spectrum(x.subarray(2400), SIZE), bin, -40);
      for (const l of TM.lines(surf('Penrose Lattice').terms, f1, 110)) { const p = pk.reduce((b, q) => (Math.abs(q.f - l.f) < Math.abs(b.f - l.f) ? q : b), { f: Infinity }); worst = Math.max(worst, Math.abs(p.f - l.f)); n++; }
    }
    ok(worst < 0.1, `Penrose dragged 1.49 → 1.51 in 9 steps: ${n} lines, worst distance from m·f₁ + n·f₂ is ${worst.toFixed(3)} Hz (bin ${bin.toFixed(3)} Hz) — they slide, none jumps`);
  }
  // beats: Membrane near 1:1 — (2,1) and (1,2) shared 330 Hz and now sit |f1 − f2| apart
  {
    const f1 = 112, x = render(Proc, [{ table: T('Membrane'), N }, { f1, f2: 110, jump: true }, { gain: 1 }], SIZE / SR + 0.05);
    const pk = peaks(spectrum(x.subarray(2400), SIZE), bin, -45);
    const a = pk.find((p) => Math.abs(p.f - 332) < 0.3), b = pk.find((p) => Math.abs(p.f - 334) < 0.3);
    const st = TM.stacks(surf('Membrane').terms, 1, 1, f1, 110);
    const slow = Math.min(...st.groups.map((g) => g.beat));
    ok(a && b && Math.abs(b.f - a.f - 2) < 0.05 && Math.abs(slow - 2) < 1e-9, `Membrane at 112 : 110: the 330 Hz pair measured at ${a?.f.toFixed(2)} and ${b?.f.toFixed(2)} Hz, ${(b && a) ? (b.f - a.f).toFixed(3) : '?'} Hz apart; the piece's readout says ${slow} Hz = |f₁ − f₂|`);
  }
  // Knot Shadow: at 3:2 the ridge ripples sit at 0 Hz; detuned to 1.6 they climb to k·|2f1 − 3f2| = 22, 44, 66 Hz
  {
    const x = render(Proc, [{ table: T('Knot Shadow'), N }, { f1: 176, f2: 110, jump: true }, { gain: 1 }], SIZE / SR + 0.05);
    const pk = peaks(spectrum(x.subarray(2400), SIZE), bin, -45);
    const hit = [22, 44, 66].map((f) => pk.find((p) => Math.abs(p.f - f) < 0.3));
    const y = render(Proc, [{ table: T('Knot Shadow'), N }, { f1: 165, f2: 110, jump: true }, { gain: 1 }], SIZE / SR + 0.05);
    const pk2 = peaks(spectrum(y.subarray(2400), SIZE), bin, -45).filter((p) => p.f > 5);
    ok(hit.every(Boolean) && pk2.length === 1 && Math.abs(pk2[0].f - 715) < 0.3, `Knot Shadow: at 3:2 one line only (${pk2.map((p) => p.f.toFixed(1) + ' Hz').join(', ')}, the (3,2) ripple; the ridge sits at 0 Hz); at 1.6 the ridge sings at ${hit.map((p) => p ? p.f.toFixed(2) : '–').join(', ')} Hz`);
  }
  // the readouts: period of the slider's fraction jumps; nearest-simple slide is continuous
  {
    const a = TM.fraction(1.5), b = TM.fraction(1.5 + 0.0005), c = TM.fraction(1.5 + 1e-9, 1e-13, 1e13);
    ok(a[1] === 2 && b[1] === 2000 && c[1] > 1e8, `the period readout: 1.5 → ${a.join('/')} (closes in ${(1000 * a[1] / 110).toFixed(2)} ms); 1.5005 → ${b.join('/')} (${(b[1] / 110).toFixed(1)} s); 1.5 + 10⁻⁹ → ${c.join('/')} to 13 places (${(c[1] / 110 / 86400).toFixed(0)} days)`);
    let jump = 0; for (let r = 1; r < 2; r += 1e-4) jump = Math.max(jump, Math.abs(TM.slide(surf('Penrose Lattice').terms, r + 1e-4, 110).hz - TM.slide(surf('Penrose Lattice').terms, r, 110).hz));
    ok(jump < 11 * 110 * 1e-4 + 1e-9, `the slide curve is continuous: largest step between neighbours 10⁻⁴ apart is ${jump.toFixed(4)} Hz (bound max|m|·f₂·10⁻⁴ = ${(11 * 110 * 1e-4).toFixed(4)} Hz)`);
  }
}

// ───────────────────────── surfaces and morphs ─────────────────────────
console.log('\n§ The Surfaces — surfaces and morphs');
{
  const MM = mathOf(`${E} — rich — surfaces and morphs.html`, 'morph-math', 'MorphMath');
  const Proc = workletOf(MM.WORKLET);
  // Rich face checks/mid-morph-direct.py on the full 1024² tables (2026-11-03): overlap, height-map dB, spectral dB
  const ref = [['Membrane', 'Chladni Ghost', 0.034, -3.14, -2.87], ['Membrane', 'Theta Surface', 0.391, -3.01, -1.58],
    ['Theta Surface', 'Matérn Field', 0.891, -6.47, -0.24], ['Membrane', 'Penrose Lattice', 0.0, -3.01, -3.01], ['Matérn Field', 'Fisher Ridge', 0.758, -4.17, -0.56]];
  for (const [a, b, o, sp, sc] of ref) {
    const p = MM.pair(surf(a).terms, surf(b).terms);
    ok(Math.abs(p.overlap - o) < 0.03 && Math.abs(p.spatial - sp) < 0.2 && Math.abs(p.spectral - sc) < 0.2,
      `${a} ↔ ${b}: overlap ${p.overlap.toFixed(3)} (tables ${o}), mid-morph height-map ${p.spatial.toFixed(2)} dB (tables ${sp}), spectral ${p.spectral.toFixed(2)} dB (tables ${sc})`);
  }
  // the engine plays the level the lattices predict
  const F2 = 110, F1 = F2 * (1 + Math.sqrt(5)) / 2;
  const play = (U, law, x, secs = 2) => {
    const f = U.map((t) => t.m * F1 + t.n * F2), amp = [], ph = [];
    U.forEach((t, k) => { const [a, p] = MM.at(t, law, x); amp.push(a); ph.push(f[k] < 0 ? -p : p); });
    const y = render(Proc, [{ freqs: f.map(Math.abs) }, { amp, ph, jump: true }, { gain: 1 }], secs);
    let e = 0; for (let i = 4800; i < y.length; i++) e += y[i] * y[i]; return Math.sqrt(e / (y.length - 4800));
  };
  for (const [a, b] of [['Theta Surface', 'Matérn Field'], ['Membrane', 'Chladni Ghost']]) {
    const U = MM.union(surf(a).terms, surf(b).terms), r0 = play(U, 'spatial', 0);
    const sp = 20 * Math.log10(play(U, 'spatial', 0.5) / r0), sc = 20 * Math.log10(play(U, 'spectral', 0.5) / r0);
    const psp = MM.db(MM.level(U, 'spatial', 0.5)), psc = MM.db(MM.level(U, 'spectral', 0.5));
    ok(Math.abs(sp - psp) < 0.3 && Math.abs(sc - psc) < 0.3, `${a} ↔ ${b} played at φ: measured mid-morph ${sp.toFixed(2)} dB height-map, ${sc.toFixed(2)} dB spectral (predicted ${psp.toFixed(2)}, ${psc.toFixed(2)})`);
  }
  // measured lattice symmetry (the challenger's numbers on the full tables: Membrane, Chladni, Theta 1/1/1; Penrose 0/1/0)
  const sym = (nm) => MM.symmetry(surf(nm).terms);
  for (const nm of ['Membrane', 'Chladni Ghost', 'Theta Surface', 'Penrose Lattice']) { const y = sym(nm); console.log(`  note  ${nm}: swap ${y.swap.toFixed(3)} · flip ${y.flip.toFixed(3)} · 90° ${y.rot.toFixed(3)} → ${y.label}`); }
  ok(['Membrane', 'Chladni Ghost', 'Theta Surface'].every((nm) => sym(nm).label === '4-fold') && sym('Penrose Lattice').label !== '4-fold' && sym('Penrose Lattice').flip > 0.99 && sym('Penrose Lattice').rot < 0.01, 'measured symmetry: Membrane, Chladni and Theta all 4-fold; Penrose not');
  // the claim: does a shared point group predict the dip? same class vs a real cross-class pair
  const same = MM.pair(surf('Membrane').terms, surf('Chladni Ghost').terms), cross = MM.pair(surf('Membrane').terms, surf('Penrose Lattice').terms), far = MM.pair(surf('Theta Surface').terms, surf('Matérn Field').terms);
  console.log(`  note  same class (Membrane ↔ Chladni, both 4-fold): ${same.spatial.toFixed(2)} dB; cross-class (Membrane ↔ Penrose, 4-fold ↔ 5-fold): ${cross.spatial.toFixed(2)} dB; Theta ↔ Matérn: ${far.spatial.toFixed(2)} dB height-map vs ${far.spectral.toFixed(2)} dB spectral`);
  ok(same.spatial <= cross.spatial + 0.05 && far.spatial < -6, 'the same-class pair (Membrane ↔ Chladni) is no cleaner than the cross-class pair (Membrane ↔ Penrose); overlap with opposed phase (Theta ↔ Matérn) is what deepens the dip');
  // cost: the largest union, one second of audio
  { const U = MM.union(surf('Chladni Ghost').terms, surf('Stiff String').terms); const t0 = performance.now(); play(U, 'spectral', 0.5, 1); const ms = performance.now() - t0; ok(ms < 400, `largest pair (Chladni ↔ Stiff String, ${U.length} oscillators): 1 s of audio in ${ms.toFixed(0)} ms in Node`); }
}

// ───────────────────────── the RMS dip ─────────────────────────
console.log('\n§ Open Decisions — the RMS dip');
{
  const RM = mathOf(`${E} — rich — the RMS dip.html`, 'rms-math', 'RmsMath');
  const Proc = workletOf(RM.WORKLET);
  const s = RM.wave('sine'), w = RM.wave('saw up');
  ok(Math.abs(RM.dot(s, w) + 1 / Math.PI) < 1e-5, `⟨sine, rising saw⟩ = ${RM.dot(s, w).toFixed(5)} (−1/π = ${(-1 / Math.PI).toFixed(5)})`);
  const orth = RM.curve(RM.wave('sine 2×'), RM.wave('sine 4×'));
  ok(Math.abs(orth[100].db + 3.0103) < 0.01, `orthogonal anchors (sine 2× → 4×) at the midpoint: ${orth[100].db.toFixed(2)} dB, the page's ~3 dB`);
  const buf = readFileSync(join(BUNDLE, 'Wavetables/00_test_diagnostic.wav')), T = RM.parseWav(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));
  const rowRms = (X) => Float64Array.from({ length: 1024 }, (_, j) => { let e = 0; for (let i = 0; i < 1024; i++) e += X[j * 1024 + i] ** 2; return Math.sqrt(e / 1024); });
  const rr = rowRms(T), seg = RM.segments(rr);
  const named = seg[0], worst = seg.filter((x) => !x.silent).reduce((a, b) => (b.worst < a.worst ? b : a));
  const NAMES = ['sine', 'saw up', 'square', 'triangle', 'silence', 'saw down', '25% pulse', 'sine 2×', 'sine 4×', 'silence', 'sine 8×', 'noise', 'bl saw', 'bl square', 'two-tone', 'sine'];
  console.log(`  note  sine → saw up: deepest ${named.worst.toFixed(2)} dB below target at ${(named.at * 100).toFixed(0)}%, ${named.mid.toFixed(2)} dB at the midpoint, ${(20 * Math.log10(Math.min(...rr.slice(0, 64)) / Math.max(named.a, named.b))).toFixed(2)} dB below the louder end`);
  console.log(`  note  deepest in the table: ${NAMES[worst.k]} → ${NAMES[worst.k + 1]}, ${worst.worst.toFixed(2)} dB below target at ${(worst.at * 100).toFixed(0)}% (${worst.mid.toFixed(2)} dB at the midpoint, ${(20 * Math.log10(Math.min(...rr.slice(worst.k * 64, worst.k * 64 + 64)) / Math.max(worst.a, worst.b))).toFixed(2)} dB below the louder end)`);
  ok(named.worst < -9 && named.worst > -10.5, `the page's ~10 dB for sine → rising saw holds: ${named.worst.toFixed(1)} dB at its deepest`);
  ok(worst.k === 1, `but the deepest dip is ${NAMES[worst.k]} → ${NAMES[worst.k + 1]} (${worst.worst.toFixed(1)} dB), not sine → saw — an offer, not a fault in the piece`);
  // the gathered constant-RMS file does what the catalog says: every row on the linear target
  const b2 = readFileSync(join(BUNDLE, 'Wavetables/00_test_diagnostic_constant_rms.wav')), T2 = RM.parseWav(b2.buffer.slice(b2.byteOffset, b2.byteOffset + b2.length));
  const seg2 = RM.segments(rowRms(T2)), dev = Math.min(...seg2.filter((x) => !x.silent).map((x) => x.worst));
  ok(dev > -0.1, `00_test_diagnostic_constant_rms.wav: every row within ${(-dev).toFixed(3)} dB of the linear target`);
  // the engine: the pair table under each law plays the level the curve predicts
  const pairT = (a, b) => { const R = 65, X = new Float32Array(R * 1024), G = new Float32Array(R), r1 = RM.rms(a), r2 = RM.rms(b); for (let j = 0; j < R; j++) { const t = j / (R - 1), m = RM.mix(a, b, t); X.set(m, j * 1024); const r = RM.rms(m); G[j] = ((1 - t) * r1 + t * r2) / r; } return { X, G }; };
  const { X, G } = pairT(s, w);
  const lvl = (y, law) => { const out = render(Proc, [{ table: X, rows: 65, gains: G }, { y, jump: true, law }, { gain: 1 }], 1); let e = 0; for (let i = 4800; i < out.length; i++) e += out[i] ** 2; return Math.sqrt(e / (out.length - 4800)) / 0.3; };
  const y = 0.5625, cv = RM.curve(s, w, 1600)[900];
  const lin = lvl(y, 0), cr = lvl(y, 1);
  ok(Math.abs(20 * Math.log10(lin / cv.r)) < 0.2 && Math.abs(20 * Math.log10(cr / cv.tg)) < 0.2, `engine at α ${y}: linear ${lin.toFixed(3)} (curve ${cv.r.toFixed(3)}), constant-RMS ${cr.toFixed(3)} (target ${cv.tg.toFixed(3)})`);
}

export {};
console.log(fails ? `\n${fails} check(s) failed` : '\nall checks passed');
process.exitCode = fails ? 1 : 0;
