// Quadratic Interpolation in DSP — rich — check.mjs
// born: 2026-11-03 · checks [[Quadratic Interpolation in DSP]]'s three rich-face pieces: the joints, the table read, the peak between bins
// forward_vector: I re-run, headless, every number the three pieces show and every claim they make about the
// page: that the page's three-point quadratic has a slope jump at every sample when chained (minus half the
// third difference), smaller than linear's and never zero, while the cubic Hermite and the chained quadratic
// Bézier have none; that on a sine table the quadratic's error sits well below linear's and a few decibels
// above the Hermite's; and that the page's FFT peak formula is the parabola's vertex with its sign flipped.
// What a listener hears I cannot check; I print what the engines measure.
//
//   node "Quadratic Interpolation in DSP/Quadratic Interpolation in DSP — rich — check.mjs"
//
// It pulls each page's core <script id="…-core"> (and the table read's worklet) out of the HTML, runs them in
// a Node sandbox, and compares against equations written here on their own. PASS/FAIL per claim; exits 1 on
// any FAIL. Reads only; writes nothing.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const page = (what) => readFileSync(join(HERE, `Quadratic Interpolation in DSP — rich — ${what}.html`), 'utf8');
const block = (html, id) => { const m = html.match(new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)</script>`)); if (!m) throw new Error(`no <script id="${id}">`); return m[1]; };
let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const load = (html, id, name, extra = {}) => { const E = { Math, Float64Array, Float32Array, Array, ...extra }; vm.createContext(E); vm.runInContext(block(html, id) + `\nthis.${name} = ${name};`, E); return E; };
let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const pct = (v) => (v * 100).toFixed(1) + '%';

// ── the joints ──
const A = page('the joints'), QI = load(A, 'qi-core', 'QI').QI;
{
  // the page's formula as written in the text, on its own
  const own = (a, b, c, x) => a * (x * x - x) / 2 - b * (x * x - 1) + c * (x * x + x) / 2;
  let worst = 0, dworst = 0;
  for (let i = 0; i < 200; i++) {
    const a = rnd(), b = rnd(), c = rnd(), x = (rnd() + 1) / 2;
    worst = Math.max(worst, Math.abs(QI.quad(a, b, c, x) - own(a, b, c, x)), Math.abs(QI.quad(a, b, c, -1) - a), Math.abs(QI.quad(a, b, c, 0) - b), Math.abs(QI.quad(a, b, c, 1) - c));
    const h = 1e-6; dworst = Math.max(dworst, Math.abs(QI.dquad(a, b, c, x) - (own(a, b, c, x + h) - own(a, b, c, x - h)) / (2 * h)));
  }
  check('the piece uses the page\'s formula, and it passes through its three points', worst < 1e-12, `max diff ${worst.toExponential(1)}`);
  check('its slope is the formula\'s derivative (inside one parabola it never jumps)', dworst < 1e-6, `max diff ${dworst.toExponential(1)}`);
  // the jump at sample n is minus half the third difference
  let jd = 0; const ys = Array.from({ length: 12 }, rnd);
  QI.jumps('quad', ys).forEach((j, n) => { const Y = (k) => ys[((k % 12) + 12) % 12]; const third = Y(n + 1) - 3 * Y(n) + 3 * Y(n - 1) - Y(n - 2); jd = Math.max(jd, Math.abs((j.left - j.right) - (-0.5 * third))); });
  check('a chained quadratic\'s slope jump at a sample = −½ × the third difference', jd < 1e-7, `max diff ${jd.toExponential(1)}`);
  // on one cycle of a sine: jumps over the piece's ruler, the steepest step between neighbouring samples (the piece's report())
  const rows = {};
  for (const N of [8, 16, 32]) {
    const s = QI.sine(N), r = {};
    for (const m of ['linear', 'quad', 'hermite', 'bezier']) r[m] = Math.max(...QI.jumps(m, s).map((j) => j.jump)) / Math.max(...s.map((v, n) => Math.abs(s[(n + 1) % N] - v)));
    const rep = QI.report('quad', s).rel; if (Math.abs(rep - r.quad) > 1e-12) check(`the piece's report agrees at N=${N}`, false, `${rep} vs ${r.quad}`);
    rows[N] = r;
    console.log(`      N=${N}: slope jump ÷ steepest step between samples  linear ${pct(r.linear)}  quad ${pct(r.quad)}  hermite ${r.hermite.toExponential(1)}  bezier ${r.bezier.toExponential(1)}`);
  }
  check('the page\'s quadratic has a slope jump at the joints of a sine (8, 16, 32 per cycle)', [8, 16, 32].every((N) => rows[N].quad > 0.01), `${pct(rows[8].quad)}, ${pct(rows[16].quad)}, ${pct(rows[32].quad)}`);
  check('linear\'s jumps are larger', [8, 16, 32].every((N) => rows[N].linear > rows[N].quad), `${pct(rows[8].linear)}, ${pct(rows[16].linear)}, ${pct(rows[32].linear)}`);
  check('cubic Hermite and chained quadratic Bézier have none', [8, 16, 32].every((N) => rows[N].hermite < 1e-12 && rows[N].bezier < 1e-12), 'all < 1e-12');
  const qr = [rows[8].quad / rows[16].quad, rows[16].quad / rows[32].quad], lr = [rows[8].linear / rows[16].linear, rows[16].linear / rows[32].linear];
  check('per doubling of samples, the quadratic\'s jump shrinks about 4×, linear\'s about 2×', qr.every((v) => v > 3.4 && v < 4.1) && lr.every((v) => v > 1.9 && v < 2.1), `quad ${qr.map((v) => v.toFixed(2)).join(', ')} · linear ${lr.map((v) => v.toFixed(2)).join(', ')}`);
  const bound = [8, 16, 32].every((N) => Math.max(...QI.jumps('quad', QI.sine(N)).map((j) => j.jump)) <= 4 * Math.sin(Math.PI / N) ** 3 + 1e-12);
  check('the quadratic\'s jump on a sine is bounded by 4·sin³(π/N)', bound, 'the third difference of a unit sine has amplitude 8·sin³(π/N)');
  const miss = { bezier: QI.report('bezier', QI.sine(8)).miss, quad: QI.report('quad', QI.sine(8)).miss, hermite: QI.report('hermite', QI.sine(8)).miss };
  check('the Bézier chain gives up passing through the samples; quadratic and Hermite pass', miss.bezier > 0.05 && miss.quad < 1e-12 && miss.hermite < 1e-12, `Bézier misses by up to ${miss.bezier.toFixed(3)} at 8 per cycle`);
}

// ── the table read ──
const B = page('the table read');
const E = { Math, Float64Array, Float32Array, Array, sampleRate: 48000, reg: null };
E.AudioWorkletProcessor = class { constructor() { this.port = { onmessage: null, postMessage() {} }; } };
E.registerProcessor = (n, cls) => { E.reg = cls; };
vm.createContext(E); vm.runInContext(block(B, 'wt-core') + '\n' + block(B, 'wt-worklet') + '\nthis.WT = WT;', E);
const WT = E.WT;
{
  const own = (a, b, c, x) => a * (x * x - x) / 2 - b * (x * x - 1) + c * (x * x + x) / 2;
  let d = 0; for (let i = 0; i < 200; i++) { const a = rnd(), b = rnd(), c = rnd(), x = (rnd() + 1) / 2; d = Math.max(d, Math.abs(WT.quad(a, b, c, x) - own(a, b, c, x))); }
  check('the table read\'s four-multiply quadratic is the page\'s formula', d < 1e-12, `max diff ${d.toExponential(1)}`);
  const H = (a, b, c, dd, x) => QI.herm(a, b, c, dd, x); let dh = 0; for (let i = 0; i < 200; i++) { const v = [rnd(), rnd(), rnd(), rnd()], x = (rnd() + 1) / 2; dh = Math.max(dh, Math.abs(WT.herm(...v, x) - H(...v, x))); }
  check('both pieces use the same cubic Hermite', dh < 1e-12, `max diff ${dh.toExponential(1)}`);
  const T = {};
  for (const m of ['none', 'linear', 'quad', 'hermite']) T[m] = [8, 16, 32, 64].map((N) => WT.snr(m, N));
  for (const m of Object.keys(T)) console.log(`      ${m.padEnd(8)} error below the tone at 8/16/32/64 numbers: ${T[m].map((v) => v.toFixed(1)).join(' / ')} dB`);
  const D = {}; for (const m of ['none', 'linear', 'quad', 'hermite']) D[m] = [8, 16, 32, 64].map((N) => WT.measure(m, N).distance);
  for (const m of Object.keys(D)) console.log(`      ${m.padEnd(8)} distance from the true sine at 8/16/32/64 numbers: ${D[m].map((v) => v.toFixed(1)).join(' / ')} dB`);
  // the distance, measured here on its own against the true sine, at another pitch
  const own2 = (m, N) => { const f = 523.3, sr = 48000, M = 24000, t = WT.table(N); let p = 0, e = 0, s = 0; for (let n = 0; n < M; n++) { const y = WT.read(m, t, p), tr = Math.sin(2 * Math.PI * p / N); e += (y - tr) ** 2; s += tr * tr; p += f * N / sr; if (p >= N) p -= N; } return 10 * Math.log10(s / e); };
  check('the distance numbers hold at another pitch (523.3 Hz, measured on their own)', ['linear', 'quad', 'hermite'].every((m) => [8, 16, 32, 64].every((N, i) => Math.abs(own2(m, N) - D[m][i]) < 0.5)), ['linear', 'quad', 'hermite'].map((m) => `${m}@16 ${own2(m, 16).toFixed(1)}`).join(', '));
  const qt = WT.measure('quad', 16), ht = WT.measure('hermite', 16);
  check('most of the quadratic\'s distance is the tone itself moved; the Hermite\'s is not', (qt.spurs - qt.distance) > 5 && (ht.spurs - ht.distance) < 1.5, `at 16: quad spurs ${qt.spurs.toFixed(1)} vs distance ${qt.distance.toFixed(1)} dB, tone ${qt.gainDb.toFixed(3)} dB / ${qt.phaseDeg.toFixed(2)}°; Hermite ${ht.spurs.toFixed(1)} vs ${ht.distance.toFixed(1)} dB, tone ${ht.gainDb.toFixed(3)} dB / ${ht.phaseDeg.toFixed(2)}°`);
  const ph = (m) => [8, 16, 32, 64].map((N) => WT.measure(m, N).phaseDeg);
  check('only the page\'s quadratic shifts the tone in time; linear and Hermite, being symmetric, do not', ph('linear').every((v) => Math.abs(v) < 1e-6) && ph('hermite').every((v) => Math.abs(v) < 1e-6) && ph('quad').every((v) => v < -1e-3), `quad ${ph('quad').map((v) => v.toFixed(3)).join(', ')}° at 8/16/32/64; linear and Hermite 0`);
  const hqd = D.hermite.map((v, i) => v - D.quad[i]), qld = D.quad.map((v, i) => v - D.linear[i]);
  check('by distance, the Hermite is 9 to 13 dB closer than the quadratic, which still beats linear', hqd.every((v) => v > 8.5 && v < 13) && qld.every((v) => v > 5), `Hermite − quad ${hqd.map((v) => v.toFixed(1)).join(', ')} · quad − linear ${qld.map((v) => v.toFixed(1)).join(', ')} dB`);
  const l2048 = WT.snr('linear', 2048, 440, 48000, 24000);
  console.log(`      at 2048 numbers, linear's new frequencies sit ${l2048.toFixed(1)} dB below the tone`);
  check('quadratic sits further below the tone than linear at every size', T.quad.every((v, i) => v - T.linear[i] > 5), T.quad.map((v, i) => '+' + (v - T.linear[i]).toFixed(1)).join(', ') + ' dB');
  const hq = T.hermite.map((v, i) => v - T.quad[i]);
  check('the Hermite sits only a few dB below the quadratic at every size', hq.every((v) => v > 3 && v < 6), hq.map((v) => '+' + v.toFixed(1)).join(', ') + ' dB');
  const per = (m) => (T[m][3] - T[m][0]) / 3;
  check('per doubling of the table: nearest ~6 dB, linear ~12, quadratic and Hermite ~18', Math.abs(per('none') - 6) < 1 && Math.abs(per('linear') - 12) < 0.5 && Math.abs(per('quad') - 18) < 0.5 && Math.abs(per('hermite') - 18) < 0.5, ['none', 'linear', 'quad', 'hermite'].map((m) => `${m} ${per(m).toFixed(1)}`).join(', '));
  check('cost: the Hermite counts about twice the quadratic\'s arithmetic', WT.ops.hermite[0] + WT.ops.hermite[1] >= 1.8 * (WT.ops.quad[0] + WT.ops.quad[1]), `quad ${WT.ops.quad.join('·')}, hermite ${WT.ops.hermite.join('·')} (multiplies·adds, on the forms written)`);
  // the worklet plays the core: held at 440 Hz, quadratic, 16 numbers
  const P = new E.reg(); P.set({ m: 'quad', N: 16, glide: false });
  const outL = new Float32Array(128), outR = new Float32Array(128), got = [];
  for (let b = 0; b < 40; b++) { P.process([], [[outL, outR]]); got.push(...outL); }
  const want = WT.render('quad', 16, 440, 48000, got.length); let wd = 0; got.forEach((v, i) => (wd = Math.max(wd, Math.abs(v - 0.3 * want[i]))));
  check('the worklet plays the core it draws (quadratic, 16 numbers, 440 Hz)', wd < 1e-6, `max diff ${wd.toExponential(1)} over ${got.length} samples`);
  const G = new E.reg(); G.set({ glide: true }); let fmin = 1e9, fmax = 0; for (let i = 0; i < 48000 * 8 / 128; i++) { G.tt += 128 / 48000; const f = G.freq(); fmin = Math.min(fmin, f); fmax = Math.max(fmax, f); }
  check('the glide runs 220 to 1760 Hz', Math.abs(fmin - 220) < 2 && Math.abs(fmax - 1760) < 20, `${fmin.toFixed(1)} to ${fmax.toFixed(1)} Hz`);
  // where the error goes: at 16 numbers and 440 Hz, linear's largest spur sits at 15 or 17 times the tone
  const db = WT.spectrum('linear', 16, 440), bin = 48000 / 8192; let top = -1e9, at = 0;
  db.forEach((v, k) => { if (Math.abs(k * bin - 440) > 200 && v > top) { top = v; at = k * bin; } });
  check('the spectrum the piece draws puts linear\'s largest spur at 15× or 17× the tone', Math.abs(at - 6600) < 20 || Math.abs(at - 7480) < 20, `${at.toFixed(0)} Hz at ${top.toFixed(1)} dB`);
}

// ── the peak between bins ──
const Cc = page('the peak between bins'), PK = load(Cc, 'pk-core', 'PK').PK;
{
  let d = 0; for (let i = 0; i < 200; i++) { const a = rnd(), b = rnd() + 2, c = rnd(); d = Math.max(d, Math.abs(PK.page(a, b, c) + PK.vertex(a, b, c))); }
  check('the page\'s correction is exactly minus the parabola\'s', d < 1e-12, `max |page + vertex| ${d.toExponential(1)}`);
  // the text's formula on its own, in hertz
  const text = (fk, df, a, b, c) => fk + (df / 2) * (a - c) / (2 * b - a - c);
  const e = PK.estimate(37.4, 'rect', 'lin'), df = 48000 / 4096;
  check('the piece computes the page\'s formula as written', Math.abs(PK.hz(e.page) - text(PK.hz(e.k), df, e.a, e.b, e.c)) < 1e-9, `at 37.40 bins: page ${PK.hz(e.page).toFixed(2)} Hz, vertex ${PK.hz(e.vertex).toFixed(2)} Hz, truth ${PK.hz(37.4).toFixed(2)} Hz`);
  // the vertex is the peak of a parabola: give it one
  const pv = (x0) => [-1, 0, 1].map((x) => 5 - 2 * (x - x0) ** 2);
  check('the vertex finds a parabola\'s peak exactly; the page\'s formula finds its mirror', [-0.4, -0.1, 0.25, 0.45].every((x0) => { const [a, b, c] = pv(x0); return Math.abs(PK.vertex(a, b, c) - x0) < 1e-12 && Math.abs(PK.page(a, b, c) + x0) < 1e-12; }), 'peaks at −0.4, −0.1, 0.25, 0.45');
  // a direct DFT bar against the closed form of a rectangular window's bin (a check on the bars themselves)
  const N = 4096, f = 37.4, k = 37, ph = 0.3;
  let re = 0, im = 0; for (let n = 0; n < N; n++) { const x = Math.cos(2 * Math.PI * f * n / N + ph); re += x * Math.cos(2 * Math.PI * k * n / N); im -= x * Math.sin(2 * Math.PI * k * n / N); }
  check('the bars are DFT magnitudes', Math.abs(Math.hypot(re, im) - PK.bar(f, k, 'rect')) < 1e-6, `bin 37 of a 37.4-bin sine: ${PK.bar(f, k, 'rect').toFixed(2)}`);
  const W = {};
  for (const w of ['rect', 'hann']) for (const s of ['lin', 'db']) {
    const sw = PK.sweep(w, s); const worst = (key) => Math.max(...sw.map((r) => Math.abs(r[key])));
    W[w + s] = { sw, peak: worst('peak'), page: worst('page'), vertex: worst('vertex') };
    console.log(`      ${w}/${s}: worst error across a bin  tallest bar ${worst('peak').toFixed(3)}  page ${worst('page').toFixed(3)}  vertex ${worst('vertex').toFixed(3)} bin`);
  }
  check('with every window and scale, the page\'s estimate never lands closer than the tallest bar alone', Object.values(W).every((v) => v.sw.every((r) => Math.abs(r.page) >= Math.abs(r.peak) - 1e-9)), 'across 51 positions × 4 settings');
  check('and between bins the parabola\'s peak always lands at least as close as the tallest bar', Object.values(W).every((v) => v.sw.filter((r) => r.frac > 0 && r.frac < 1).every((r) => Math.abs(r.vertex) <= Math.abs(r.peak) + 1e-9)), 'the 49 positions strictly between bins');
  check('the parabola is best on decibel bars through a Hann window', W.hanndb.vertex < 0.02 && W.hanndb.vertex < W.rectlin.vertex / 5, `worst ${W.hanndb.vertex.toFixed(3)} bin (${PK.hz(W.hanndb.vertex).toFixed(2)} Hz) against ${W.rectlin.vertex.toFixed(3)} with no window and plain magnitudes`);
}

// ── the pieces' manners ──
for (const [n, h] of [['the joints', A], ['the table read', B], ['the peak between bins', Cc]]) {
  const scripts = h.replace(/<!--[\s\S]*?-->/g, '');
  check(`${n}: leaves hushing to the kit`, !/rich:hus[h]/.test(scripts), 'never names it');
  const ac = (scripts.match(/new AudioContext/g) || []).length, inPlay = /async function play\(\)\s*\{\s*if \(!ctx\) \{\s*ctx = new AudioContext\(\)/.test(scripts);
  check(`${n}: an AudioContext only on a click`, ac === 0 || (ac === 1 && inPlay), ac ? 'made inside play()' : 'makes no sound');
}
console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
