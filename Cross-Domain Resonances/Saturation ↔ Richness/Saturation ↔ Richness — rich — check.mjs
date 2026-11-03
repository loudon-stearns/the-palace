// Saturation ↔ Richness — rich — check.mjs
// born: 2026-11-03 · checks [[Saturation ↔ Richness]]'s two rich-face pieces: "the bend and the lean" and
// "four versions, blind"
// forward_vector: I re-run, headless, every claim the two pieces make about their own engines and about the
// sections they serve: that an EQ bell adds no line to a sine and lifts a sawtooth's line by its gain; that a
// symmetric curve makes only odd harmonics at every drive, and a curve's lean only even ones; that the blind
// test's two curves add the same lines at the same strength, on the evens or the odds, and are matched in
// loudness; that the four versions are matched, grow in harmonics, lose crest factor and, unmatched, grow
// louder; and that the chance figures the pieces print are the counts they claim. What a listener hears I
// cannot check.
//
//   node "Cross-Domain Resonances/Saturation ↔ Richness/Saturation ↔ Richness — rich — check.mjs"
//
// It pulls each page's core <script id="…-core"> out of the HTML, runs it in a Node sandbox, and compares
// against equations written here on their own. PASS/FAIL per claim, INFO for numbers worth reading; exits 1
// on any FAIL. Reads only; writes nothing.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const core = (file, id, name) => {
  const html = readFileSync(join(HERE, `Saturation ↔ Richness — rich — ${file}.html`), 'utf8');
  const m = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`));
  if (!m) throw new Error(`no <script id="${id}"> in ${file}`);
  const E = { Math, Float64Array, Float32Array, Int32Array, JSON, Number, String, Object, Array, Set, Map, isFinite, Date };
  vm.createContext(E); vm.runInContext(m[1] + `\nthis.${name} = ${name};`, E);
  return E[name];
};
const SC = core('the bend and the lean', 'sc-core', 'SC');
const MX = core('four versions, blind', 'mx-core', 'MX');

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const info = (name, detail) => console.log(`INFO  ${name}  (${detail})`);
const RATE = 48000;
const dB = (v) => 20 * Math.log10(Math.max(v, 1e-15));

// ── written here on their own ──
// harmonic k of one period, by direct correlation
function harm(y, k) { const P = y.length; let re = 0, im = 0; for (let n = 0; n < P; n++) { re += y[n] * Math.cos(2 * Math.PI * k * n / P); im += y[n] * Math.sin(2 * Math.PI * k * n / P); } return 2 * Math.hypot(re, im) / P; }
const sine = (P) => Array.from({ length: P }, (_, n) => Math.cos(2 * Math.PI * n / P));
// the bell's gain at f, from its coefficients, as a transfer function
function bellGain(k, f) { const w = 2 * Math.PI * f / RATE, z1 = [Math.cos(-w), Math.sin(-w)], z2 = [Math.cos(-2 * w), Math.sin(-2 * w)];
  const num = [k.b0 + k.b1 * z1[0] + k.b2 * z2[0], k.b1 * z1[1] + k.b2 * z2[1]], den = [1 + k.a1 * z1[0] + k.a2 * z2[0], k.a1 * z1[1] + k.a2 * z2[1]];
  return Math.hypot(...num) / Math.hypot(...den); }

console.log('— the bend and the lean —');
const P = SC.period(200), S1 = SC.sinePeriod(P, 1);
check('200 Hz is a whole 240 samples a cycle, so a period holds only its harmonics', P === 240, `period ${P}`);
{ const L = SC.loop(S1, -20).y; check('every loop is whole cycles', L.length % P === 0, `${L.length} samples = ${L.length / P} cycles`); }
check('one sine: one line above −120 dB', SC.lines(SC.harmonics(S1, 40), -120) === 1, `${SC.lines(SC.harmonics(S1, 40), -120)} line`);

// 1 · an EQ adds no line to a sine; on a sawtooth, the line under the bell rises by the bell's gain
for (const fc of [400, 600, 1000]) {
  const e = SC.eqPeriod(S1, fc, 12, 2), h = SC.harmonics(e, 40), want = bellGain(SC.bell(fc, 12, 2), 200);
  let worst = -Infinity; for (let k = 2; k <= 40; k++) worst = Math.max(worst, dB(h[k] / h[1]));
  check(`bell +12 dB at ${fc} Hz on the sine: no new line`, worst < -120, `loudest other harmonic ${worst.toFixed(0)} dB re the note`);
  check(`… and the sine moves by the bell's own gain at 200 Hz`, Math.abs(dB(h[1]) - dB(want)) < 0.01, `${dB(h[1]).toFixed(3)} dB, transfer function says ${dB(want).toFixed(3)}`);
}
{ const saw = SC.sawPeriod(P), a = SC.harmonics(saw, 40), b = SC.harmonics(SC.eqPeriod(saw, 600, 12, 2), 40);
  check('bell at 600 Hz on the sawtooth lifts its 3rd harmonic by 12 dB', Math.abs(dB(b[3] / a[3]) - 12) < 0.01, `${dB(b[3] / a[3]).toFixed(3)} dB`); }

// 2 · a symmetric curve makes only odd harmonics, at every drive
{ let worstEven = -Infinity, rows = [];
  for (const d of [0.25, 0.5, 1, 2, 3, 5, 8]) { const h = SC.harmonics(SC.shape(S1, (x) => SC.curve(x, d, 0)), 40); for (let k = 2; k <= 40; k += 2) worstEven = Math.max(worstEven, dB(h[k] / h[1])); const ps = SC.powerSplit(h); rows.push(`d ${d}: odd ${ps.oddDb.toFixed(1)}`); }
  check('symmetric curve, d 0.25 to 8: every even harmonic below −200 dB', worstEven < -200, `loudest even ${worstEven.toFixed(0)} dB`);
  info('odd harmonics together, below the note', rows.join(' · ')); }
{ const n = (d) => SC.lines(SC.harmonics(SC.shape(S1, (x) => SC.curve(x, d, 0)), 40), -80);
  check('more drive, more lines above −80 dB', n(0.5) < n(2) && n(2) < n(8), `${n(0.5)}, ${n(2)}, ${n(8)} at d 0.5, 2, 8`);
  // compresses as input increases: the curve's gain at a tenth of full scale is above its gain at full scale
  const gq = (d) => dB((SC.curve(0.1, d, 0)) / 0.1);
  check('the curve compresses: more gain for a quiet input than for full scale', gq(2) > 0 && gq(8) > gq(2), `at a tenth of full scale +${gq(2).toFixed(1)} dB (d 2), +${gq(8).toFixed(1)} dB (d 8); full scale 0 dB`); }

// 3 · the lean makes the evens; the bend (odd part) makes only odd, the lean (even part) only even
{ let worstO = -Infinity, worstE = -Infinity;
  for (const [d, b] of [[1, 0.1], [3, 0.2], [6, 0.35]]) {
    const f = (x) => SC.curve(x, d, b);
    const ho = SC.harmonics(SC.shape(S1, (x) => SC.oddPart(f, x)), 40), he = SC.harmonics(SC.dc(SC.shape(S1, (x) => SC.evenPart(f, x))), 40);
    for (let k = 2; k <= 40; k += 2) worstO = Math.max(worstO, dB(ho[k]));
    for (let k = 1; k <= 39; k += 2) worstE = Math.max(worstE, dB(he[k]));
  }
  check('the bend (odd part) of a leaning curve: no even harmonic', worstO < -200, `loudest even ${worstO.toFixed(0)} dB FS`);
  check('the lean (even part): no odd harmonic, the note included', worstE < -200, `loudest odd ${worstE.toFixed(0)} dB FS`);
  const ev = (b) => SC.powerSplit(SC.harmonics(SC.dc(SC.shape(S1, (x) => SC.curve(x, 3, b))), 40)).evenDb;
  check('evens appear as soon as the curve leans, and grow with it', ev(0) < -200 && ev(0.05) > -40 && ev(0.4) > ev(0.05), `even power ${ev(0) < -200 ? 'none' : ev(0).toFixed(1)}, ${ev(0.05).toFixed(1)}, ${ev(0.4).toFixed(1)} dB at lean 0, 0.05, 0.4 (d 3)`); }

// 4 · the test's two curves: the same lines at the same strength, on the evens or on the odds, matched
for (const L of [-30, -20]) {
  const amps = [L, L - 6, L - 12];
  for (const f of [160, 200, 240, 250, 300]) {
    const Pn = SC.period(f), x = SC.sinePeriod(Pn, 1);
    const he = SC.harmonics(SC.shape(x, (v) => SC.pairCurve('even', L, v)), 12), ho = SC.harmonics(SC.shape(x, (v) => SC.pairCurve('odd', L, v)), 12);
    const errE = Math.max(Math.abs(he[1] - 1), ...[2, 4, 6].map((k, j) => Math.abs(dB(he[k]) - amps[j]))), errO = Math.max(Math.abs(ho[1] - 1), ...[3, 5, 7].map((k, j) => Math.abs(dB(ho[k]) - amps[j])));
    let strayE = -Infinity, strayO = -Infinity; for (let k = 1; k <= 12; k++) { if (![1, 2, 4, 6].includes(k)) strayE = Math.max(strayE, dB(he[k])); if (![1, 3, 5, 7].includes(k)) strayO = Math.max(strayO, dB(ho[k])); }
    if (f === 200 || errE > 1e-6 || errO > 1e-6 || strayE > -200 || strayO > -200)
      check(`pair at ${L} dB, ${f} Hz: lines at ${amps.join(', ')} dB and nothing else`, errE < 1e-6 && errO < 1e-6 && strayE < -200 && strayO < -200, `worst error ${Math.max(errE, errO).toExponential(1)}; loudest stray ${Math.max(strayE, strayO).toFixed(0)} dB`);
    const le = SC.loop(SC.shape(x, (v) => SC.pairCurve('even', L, v)), -20).y, lo = SC.loop(SC.shape(x, (v) => SC.pairCurve('odd', L, v)), -20).y;
    const kl = (y) => SC.kLoud(Float64Array.from(y.subarray(0, Pn)));
    if (Math.abs(kl(le) - kl(lo)) > 0.01 || f === 200) check(`pair at ${L} dB, ${f} Hz: matched in K-weighted loudness`, Math.abs(kl(le) - kl(lo)) < 0.01, `${kl(le).toFixed(3)} and ${kl(lo).toFixed(3)} LUFS`);
    if (le.length % Pn || lo.length % Pn) check(`pair at ${f} Hz: loop is whole cycles`, false, `${le.length} samples, period ${Pn}`);
  }
  // each curve bends over and never folds back at the strengths offered
  let mono = true; for (const par of ['even', 'odd']) for (let i = 0; i < 4000; i++) { const a = -1 + i / 2000, b = a + 1 / 2000; if (SC.pairCurve(par, L, b) < SC.pairCurve(par, L, a)) mono = false; }
  check(`pair curves at ${L} dB never fold back`, mono, 'slope checked at 4000 points across full scale');
}
{ let edge = null; for (let L = -30; L <= -10; L += 0.1) { let ok = true; for (let i = 0; i < 2000; i++) { const a = -1 + i / 1000, b = a + 1 / 1000; if (SC.pairCurve('odd', L, b) < SC.pairCurve('odd', L, a)) ok = false; } if (!ok) { edge = L; break; } }
  info('the odd curve starts to fold back near', `${edge.toFixed(1)} dB; its end slope is 1 − 8.75·a, zero at a = 0.114 (−18.8 dB), which is why the strongest strength offered is −20`); }

// 5 · the chance figures the piece prints
{ const C = (n, k) => { let c = 1; for (let i = 1; i <= k; i++) c = c * (n - k + i) / i; return c; };
  const own = (s) => { let t = 0; for (let k = s; k <= 10; k++) t += C(10, k); return t / 1024; };
  const ok = [10, 9, 8, 7].every((s) => Math.abs(SC.tailAtLeast(10, s) - own(s)) < 1e-15);
  check('binomial tail: 8 or more of 10 by guessing is 56/1024, 1 in 18; 9 or more 11/1024, 1 in 93', ok && Math.round(1 / own(8)) === 18 && Math.round(1 / own(9)) === 93, `P(≥8) = ${own(8).toFixed(4)}, P(≥9) = ${own(9).toFixed(4)}, P(10) = ${own(10).toFixed(4)}`); }

// 6 · what the page's "creates new harmonics" leaves out: two notes through one curve make tones of neither
{ const P2 = 960, x = Array.from({ length: P2 }, (_, n) => 0.5 * Math.sin(2 * Math.PI * 4 * n / P2) + 0.5 * Math.sin(2 * Math.PI * 5 * n / P2)); // 200 and 250 Hz, a major third
  for (const [d, b, name] of [[3, 0, 'symmetric'], [3, 0.12, 'leaning']]) {
    const y = SC.dc(Float64Array.from(x.map((v) => SC.curve(v, d, b)))); let notes = 0, harmonics = 0, neither = 0, top = [];
    for (let k = 1; k <= 80; k++) { const a = harm(y, k), p = a * a, f = 50 * k; if (f === 200 || f === 250) notes += p; else if (f % 200 === 0 || f % 250 === 0) harmonics += p; else { neither += p; top.push([f, dB(a)]); } }
    top.sort((p, q) => q[1] - p[1]);
    info(`two notes, 200 and 250 Hz, through the ${name} curve at d 3`, `harmonics of either note ${(10 * Math.log10(harmonics / notes)).toFixed(1)} dB re the notes; tones of neither ${(10 * Math.log10(neither / notes)).toFixed(1)} dB; loudest of those ${top.slice(0, 3).map(([f, a]) => `${f} Hz ${a.toFixed(1)} dB FS`).join(', ')}`);
    if (name === 'symmetric') check('two notes through one curve make tones that are harmonics of neither', neither / notes > 1e-3, `${(10 * Math.log10(neither / notes)).toFixed(1)} dB re the notes, more than the harmonics' ${(10 * Math.log10(harmonics / notes)).toFixed(1)}`);
  } }

console.log('— four versions, blind —');
const R = MX.render(), R2 = MX.render(), V = R.versions;
check('the render is the same render every time', V.every((v, i) => v.mix.every((s, n) => s === R2.versions[i].mix[n])), `${MX.LEN} samples × 4 versions compared`);
check('the four bass stems are matched in K-weighted loudness', Math.max(...V.map((v) => Math.abs(v.loud - V[0].loud))) < 0.01, V.map((v) => `${v.id} ${v.loud.toFixed(3)}`).join(', ') + ' LUFS');
check('added harmonics on a held note grow clean → heavy, near −31, −16, −10 dB', V[0].heldDb < -200 && Math.abs(V[1].heldDb + 31) < 1 && Math.abs(V[2].heldDb + 16.3) < 1 && Math.abs(V[3].heldDb + 9.9) < 1, V.map((v) => `${v.id} ${v.heldDb < -200 ? 'none' : v.heldDb.toFixed(1)}`).join(', '));
check('crest factor falls with the drive, by about 4 dB clean → heavy', V[0].crestDb > V[1].crestDb && V[1].crestDb > V[2].crestDb && V[2].crestDb > V[3].crestDb && Math.abs(V[0].crestDb - V[3].crestDb - 4) < 0.5, V.map((v) => `${v.id} ${v.crestDb.toFixed(2)}`).join(', ') + ' dB');
check('unmatched, each step up is louder: about 1, 5 and 12 dB', V[1].unmatchedLu > 0.5 && V[2].unmatchedLu > 4 && V[3].unmatchedLu > 11 && V[1].unmatchedLu < V[2].unmatchedLu && V[2].unmatchedLu < V[3].unmatchedLu, V.map((v) => `${v.id} ${v.unmatchedLu.toFixed(2)}`).join(', ') + ' LU');
check('power above 90 Hz grows with the drive', V[0].share <= V[1].share + 1e-6 && V[1].share < V[2].share && V[2].share < V[3].share, V.map((v) => `${v.id} ${(100 * v.share).toFixed(2)} %`).join(', '));
info('what light adds is small in power', `on the stem, light moves the share above 90 Hz from ${(100 * V[0].share).toFixed(3)} % to ${(100 * V[1].share).toFixed(3)} %; its harmonics are −31 dB on a held note`);
info('at matched loudness the fundamentals give up', V.map((v) => `${v.id} ${v.fundDb.toFixed(2)} dB`).join(', ') + ' (power below 90 Hz, re clean)');
{ const notes = [33, 33, 36, 38, 40, 31, 33, 36].map((m) => 440 * Math.pow(2, (m - 69) / 12));
  check('every note’s fundamental is below the 90 Hz split', Math.max(...notes) < MX.SPLIT && Math.min(...notes) * 2 > MX.SPLIT, `notes ${Math.min(...notes).toFixed(1)} to ${Math.max(...notes).toFixed(1)} Hz; lowest 2nd harmonic ${(2 * Math.min(...notes)).toFixed(1)} Hz`); }
{ let tail = 0, head = 0; for (const v of V) { for (let n = MX.LEN - 480; n < MX.LEN; n++) tail = Math.max(tail, Math.abs(v.mix[n])); head = Math.max(head, Math.abs(v.stem[0])); }
  check('the loop’s seam: everything has died away in its last 10 ms, and the bass starts from zero', tail < 0.01 && head < 1e-6, `loudest of the last 480 samples ${tail.toExponential(2)}; bass's first sample ${head.toExponential(1)}; the hat on beat one starts the loop as every hat starts`); }
{ const pk = Math.max(...V.map((v) => MX.peak(v.mix))), unm = Math.max(...V.map((v) => MX.peak(v.mix.map((s, n) => s + 0.8 * v.stem[n] * (Math.pow(10, v.unmatchedLu / 20) - 1)))));
    const html = readFileSync(join(HERE, 'Saturation ↔ Richness — rich — four versions, blind.html'), 'utf8'), M = +html.match(/const MASTER = ([0-9.]+)/)[1];
  check(`after the page's master gain of ${M} nothing reaches full scale, matched or not`, pk * M < 1 && unm * M < 1, `matched mix peak ${(pk * M).toFixed(2)}, heavy as the drive leaves it ${(unm * M).toFixed(2)}`); }
check('of the 24 orders of four: 1 exact, 4 within one swapped pair, 9 within two', MX.within(0) === 1 && MX.within(1) === 4 && MX.within(2) === 9 && MX.within(6) === 24, [0, 1, 2, 3, 4, 5, 6].map((k) => MX.within(k)).join(', '));
{ const r = MX.rng(1), seen = new Set(); for (let i = 0; i < 4000; i++) seen.add(MX.shuffle([0, 1, 2, 3], r).join('')); check('the shuffle reaches all 24 orders', seen.size === 24, `${seen.size} orders in 4000 shuffles`); }

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
