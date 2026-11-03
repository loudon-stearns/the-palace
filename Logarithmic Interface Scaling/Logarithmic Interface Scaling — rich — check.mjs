// Logarithmic Interface Scaling — rich — check.mjs
// born: 2026-11-03 · checks the three pieces of [[Logarithmic Interface Scaling]]' rich face
// forward_vector: I re-run, headless, every number the three pieces and their captions state: where 1.0 and
// the centre land on the page's two ranges and what a doubling costs on each mapping; what the symmetry test
// gives on the page's own 0.1 to 10 slider under both readings of its third step, where the page's example
// pair (0.79, 1.26) actually sits, and which of five implementations each test catches; and where a cutoff
// knob spends its travel, what each blind move measures in octaves and in hertz, and which ruler each answer
// pattern names. I also re-derive the ratio-knob numbers the cutoff piece cites from Boundary-Crossing
// Instruments' face, so the citation can't drift from its source. What a listener hears I cannot check.
//
//   node "Logarithmic Interface Scaling/Logarithmic Interface Scaling — rich — check.mjs"
//
// It pulls each page's <script id="lis-…-core"> out of the HTML, runs it in a Node sandbox, and compares
// against equations written here on their own. PASS/FAIL per claim; exits 1 on any FAIL. Reads only.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const core = (file, id) => {
  const html = readFileSync(join(HERE, `Logarithmic Interface Scaling — rich — ${file}.html`), 'utf8');
  const m = html.match(new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)</script>`));
  if (!m) throw new Error(`no <script id="${id}"> in ${file}`);
  const E = { Math }; vm.createContext(E); vm.runInContext(m[1], E); return E;
};
let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// ── piece A · double and halve · § The Interface Design Problem ──
{
  const A = core('double and halve', 'lis-a-core');
  console.log('— double and halve');
  // the section's numbers: on a linear 0.5 to 20 slider, below 1 is 2.6% and above is 97.4%
  const p1 = A.linPos(1);
  check('linear 0.5–20: 1.0 sits at 2.6%, 97.4% above it (the section’s numbers)', near(p1, 0.026, 0.0005) && near(1 - p1, 0.974, 0.0005), `${(p1 * 100).toFixed(2)}% · ${((1 - p1) * 100).toFixed(2)}%`);
  // own: travel for × k from v on linear is v(k − 1)/19.5
  const linCost = (v, k) => Math.abs(v * k - v) / 19.5;
  let worst = 0; for (const v of [0.5, 1, 2, 4, 8, 10]) for (const k of [2, 0.5]) if (v * k <= 20 && v * k >= 0.5) worst = Math.max(worst, Math.abs(A.travelFor('lin', v, k) - linCost(v, k)));
  check('linear: the travel a doubling costs is v ÷ 19.5, a halving v ÷ 39', worst < 1e-12, `worst gap ${worst.toExponential(1)}`);
  check('linear: from 1, × 2 costs 5.1% and ÷ 2 costs 2.6%; from 10, × 2 costs 51.3%; from 8, × 2 costs 41.0%',
    near(A.travelFor('lin', 1, 2), 0.0513, 0.0001) && near(A.travelFor('lin', 1, 0.5), 0.0256, 0.0001) && near(A.travelFor('lin', 10, 2), 0.5128, 0.0001) && near(A.travelFor('lin', 8, 2), 0.4103, 0.0001),
    `${(A.travelFor('lin', 1, 2) * 100).toFixed(2)}, ${(A.travelFor('lin', 1, 0.5) * 100).toFixed(2)}, ${(A.travelFor('lin', 10, 2) * 100).toFixed(2)}, ${(A.travelFor('lin', 8, 2) * 100).toFixed(2)}%`);
  // log: every doubling and halving costs log 2 / log 40, anywhere
  const want = Math.log(2) / Math.log(40); worst = 0;
  for (let v = 0.5; v <= 10; v *= 1.37) for (const k of [2, 0.5]) if (v * k <= 20 && v * k >= 0.5) worst = Math.max(worst, Math.abs(A.travelFor('log', v, k) - want));
  check('log 0.5–20: every × 2 and ÷ 2 costs log 2 ÷ log 40 = 18.8%, wherever it starts', worst < 1e-12 && near(want, 0.188, 0.0005), `${(want * 100).toFixed(2)}%, worst gap ${worst.toExponential(1)}`);
  // the page's mapping is the page's code: slider_to_value(position, 0.5, 20)
  const page = (pos, mn, mx) => 10 ** (Math.log10(mn) + pos / 100 * (Math.log10(mx) - Math.log10(mn)));
  worst = 0; for (let q = 0; q <= 100; q += 0.5) worst = Math.max(worst, Math.abs(A.logVal(q / 100) / page(q, 0.5, 20) - 1));
  check('the log slider is the page’s slider_to_value on 0.5–20', worst < 1e-12, `worst relative gap ${worst.toExponential(1)}`);
  // on 0.5 to 20, even mapped in log, 1.0 is not at the centre
  check('log 0.5–20: the centre is √(0.5 × 20) = 3.16, and 1.0 sits at 18.8%', near(A.logVal(0.5), Math.sqrt(10), 1e-9) && near(A.logPos(1), 0.188, 0.0005), `centre ${A.logVal(0.5).toFixed(4)}, 1.0 at ${(A.logPos(1) * 100).toFixed(2)}%`);
  // fine control at the low end: one step of 0.1% travel, as a share of the value, at each end
  const lo = A.stepShare('lin', 0, 0.001), hi = A.stepShare('lin', 0.999, 0.001);
  check('linear: one 0.1% step moves the value 3.9% of itself at 0.5 and 0.1% at 20', near(lo, 0.039, 0.0005) && near(hi, 0.00098, 0.00005), `${(lo * 100).toFixed(2)}% · ${(hi * 100).toFixed(3)}%`);
  check('the test’s 4% tolerance can be hit by the keyboard step at the hardest target (0.5 on the linear slider)', A.landed(A.linVal(A.linPos(0.5) + 0.001), 0.5), `one key step from 0.5 lands at ${A.linVal(A.linPos(0.5) + 0.001).toFixed(4)}`);
}

// ── piece B · the symmetry test · § Interface Design Best Practices ──
{
  const B = core('the symmetry test', 'lis-b-core');
  console.log('— the symmetry test');
  const log10 = (p) => B.logMap(p, 0.1, 10);
  const page = (pos) => 10 ** (-1 + pos / 100 * 2);
  let worst = 0; for (let q = 0; q <= 100; q += 0.5) worst = Math.max(worst, Math.abs(log10(q / 100) / page(q) - 1));
  check('the log slider is the page’s slider_to_value on 0.1–10', worst < 1e-12, `worst relative gap ${worst.toExponential(1)}`);
  check('0.1–10: the centre is 1.000 (the page’s example)', near(log10(0.5), 1, 1e-12), `${log10(0.5)}`);
  const m = (d) => B.equalMoves(log10, d);
  const r5 = m(0.05), r10 = m(0.10), r15 = m(0.15);
  check('0.1–10: 5% either side gives 0.794 and 1.259 = 10^±0.1, the page’s example pair', near(r5.A, 0.7943, 0.0001) && near(r5.B, 1.2589, 0.0001), `${r5.A.toFixed(4)}, ${r5.B.toFixed(4)}`);
  check('0.1–10: 10% either side gives 0.631 and 1.585, not 0.79 and 1.26', near(r10.A, 0.6310, 0.0001) && near(r10.B, 1.5849, 0.0001), `${r10.A.toFixed(4)}, ${r10.B.toFixed(4)}`);
  check('0.1–10: 15% either side gives about 0.5 and 2.0, the design guide’s example', near(r15.A, 0.501, 0.001) && near(r15.B, 1.995, 0.001), `${r15.A.toFixed(4)}, ${r15.B.toFixed(4)}`);
  const pos = (v) => (Math.log10(v) + 1) / 2;
  check('0.1–10: the page’s pair sits at 44.9% and 55.0%, five points either side of centre', near(pos(0.79), 0.449, 0.001) && near(pos(1.26), 0.550, 0.001), `${(pos(0.79) * 100).toFixed(2)}%, ${(pos(1.26) * 100).toFixed(2)}%`);
  const dec = B.LISB.RANGES[1], oneDec = (p) => B.logMap(p, dec[0], dec[1]), rd = B.symmetryTest(oneDec, 0.10, 'fromA');
  check('one decade (0.316–3.16): 10% either side gives 0.794 and 1.259', near(rd.A, 0.7943, 0.0001) && near(rd.B, 1.2589, 0.0001), `${rd.A.toFixed(4)}, ${rd.B.toFixed(4)}`);
  const wc = B.symmetryTest(log10, 0.10, 'centre'), wa = B.symmetryTest(log10, 0.10, 'fromA');
  check('the steps as written, “20% right from center” from the centre: B = 2.512, A × B = 1.585, not reciprocal', near(wc.B, 2.5119, 0.0001) && near(wc.product, 1.5849, 0.0001) && !B.symPass(wc), `B ${wc.B.toFixed(4)}, A × B ${wc.product.toFixed(4)}`);
  check('the steps as written, 20% right counted from A: B = 1.585, A × B = 1.000, reciprocal', near(wa.B, 1.5849, 0.0001) && near(wa.product, 1, 1e-9) && B.symPass(wa), `B ${wa.B.toFixed(4)}, A × B ${wa.product.toFixed(6)}`);
  check('0.79 × 1.26 = 0.995, within the page’s ≈ 1.0', near(0.79 * 1.26, 0.9954, 1e-9), `${(0.79 * 1.26).toFixed(4)}`);
  const wide = B.LISB.RANGES[2], w = (p) => B.logMap(p, wide[0], wide[1]), rw = B.equalMoves(w, 0.10);
  check('0.5–20: a correct log mapping, but the centre is 3.162 and A × B = 10 = centre²', near(rw.centre, Math.sqrt(10), 1e-9) && near(rw.product, 10, 1e-9) && !B.centrePass(rw), `centre ${rw.centre.toFixed(4)}, A × B ${rw.product.toFixed(4)}`);
  // the five implementations: what each test says, against what the piece's meter says
  const expect = [
    ['Log, the page’s', true, true],
    ['Linear', false, false],
    ['Square law', false, false],
    ['Log, S-curved', true, false],
    ['Log, 0.5 to 20', false, true]
  ];
  B.IMPLS.forEach((im, i) => {
    const r = B.symmetryTest(im.f, 0.10, 'fromA'), q = B.ratioTest(im.f), sym = B.centrePass(r) && B.symPass(r);
    check(`${im.name}: symmetry ${expect[i][1] ? 'passes' : 'fails'}, constant ratio ${expect[i][2] ? 'passes' : 'fails'}`, im.name === expect[i][0] && sym === expect[i][1] && q.pass === expect[i][2],
      `centre ${r.centre.toFixed(3)}, A × B ${r.product.toFixed(3)}, ratios ${q.lo.toFixed(3)} to ${q.hi.toFixed(3)} over ${q.ratios.length} steps`);
  });
  const S = B.IMPLS[3].f; let worstS = 0; for (let p = 0; p <= 0.5; p += 0.01) worstS = Math.max(worstS, Math.abs(S(0.5 - p) * S(0.5 + p) - 1));
  check('the S-curve is reciprocal at every distance from centre, and runs 0.1 to 10', worstS < 1e-12 && near(S(0), 0.1, 1e-12) && near(S(1), 10, 1e-12), `worst ${worstS.toExponential(1)}`);
  check('square law centre is 2.575, linear centre 5.05', near(B.IMPLS[2].f(0.5), 2.575, 1e-9) && near(B.IMPLS[1].f(0.5), 5.05, 1e-9), `${B.IMPLS[2].f(0.5)}, ${B.IMPLS[1].f(0.5)}`);
}

// ── piece C · cutoff by ear · § When to Use This Pattern ──
{
  const C = core('cutoff by ear', 'lis-c-core');
  console.log('— cutoff by ear');
  check('linear knob: 1 kHz sits at 4.9%; the top octave is 50% of the knob; the bottom five octaves 3.1%',
    near(C.posLin(1000), 0.049, 0.0005) && near(C.sweepShare('lin', 10000, 20000), 0.5005, 0.0005) && near(C.sweepShare('lin', 20, 640), 0.031, 0.0005),
    `${(C.posLin(1000) * 100).toFixed(2)}%, ${(C.sweepShare('lin', 10000, 20000) * 100).toFixed(2)}%, ${(C.sweepShare('lin', 20, 640) * 100).toFixed(2)}%`);
  check('linear knob: × 2 from 1 kHz costs 5.0%, from 10 kHz 50%', near(C.posLin(2000) - C.posLin(1000), 0.050, 0.0005) && near(C.posLin(20000) - C.posLin(10000), 0.5005, 0.0005), `${((C.posLin(2000) - C.posLin(1000)) * 100).toFixed(2)}%, ${((C.posLin(20000) - C.posLin(10000)) * 100).toFixed(2)}%`);
  const oct = Math.log(2) / Math.log(1000);
  let worst = 0; for (let f = 20; f <= 10000; f *= 1.3) worst = Math.max(worst, Math.abs(C.posLog(2 * f) - C.posLog(f) - oct));
  check('log knob: every octave is log 2 ÷ log 1000 = 10.0% of the knob; 1 kHz sits at 56.6%; 0.80 s per octave in an 8 s sweep',
    worst < 1e-12 && near(C.posLog(1000), 0.566, 0.0005) && near(oct * C.LISC.SWEEP, 0.80, 0.005), `${(oct * 100).toFixed(2)}%, ${(C.posLog(1000) * 100).toFixed(2)}%, ${(oct * 8).toFixed(3)} s`);
  // the five blind moves, written here on their own
  const own = { a: [-1.0, 1.0], b: [-1.0, Math.log2(1499.5 / 1000)], c: [Math.log2(100.9 / 1000), Math.log2(1899.1 / 1000)], d: [-0.598, 0.598], e: [Math.log2(8002 / 10000), Math.log2(11998 / 10000)] };
  for (const P of C.LISC.PAIRS){
    const r = C.pairMove(P), o = own[P.id];
    check(`move ${P.id} (${P.map}, from ${P.from} Hz, ${P.travel * 100}%): ${r.down.toFixed(1)} Hz and ${r.up.toFixed(1)} Hz, ${r.octDown.toFixed(2)} and +${r.octUp.toFixed(2)} octaves`, near(r.octDown, o[0], 0.01) && near(r.octUp, o[1], 0.01) && r.down >= 20 && r.up <= 20000,
      `oct ruler says ${C.predict(P, 'oct')}, Hz ruler says ${C.predict(P, 'hz')}`);
  }
  const ans = (o) => Object.fromEntries(C.LISC.PAIRS.map((P) => [P.id, o[P.id]]));
  const octAns = ans({ a: 0, b: -1, c: -1, d: 0, e: 0 }), hzAns = ans({ a: 1, b: 0, c: 0, d: 1, e: 0 });
  check('the moves split the rulers: on a, b, c, d octaves and hertz disagree; on e both say the same size',
    ['a', 'b', 'c', 'd'].every((id) => C.predict(C.LISC.PAIRS.find((P) => P.id === id), 'oct') !== C.predict(C.LISC.PAIRS.find((P) => P.id === id), 'hz')) && C.predict(C.LISC.PAIRS[4], 'oct') === 0 && C.predict(C.LISC.PAIRS[4], 'hz') === 0, 'e is the check');
  check('the reveal names octaves only for the octave pattern, hertz only for the hertz pattern, and no ruler otherwise',
    C.rulerOf(octAns) === 'oct' && C.rulerOf(hzAns) === 'hz' && C.rulerOf(ans({ a: 0, b: 0, c: 0, d: 0, e: 0 })) === 'none' && C.rulerOf(ans({ a: 0, b: -1, c: 0, d: 0, e: 0 })) === 'none',
    'all the same → none; one miss → none');
  check('a ruler is named only when the check held: move e answered other than “the same” names none',
    C.rulerOf({ ...octAns, e: -1 }) === 'check-failed' && C.rulerOf({ ...octAns, e: 1 }) === 'check-failed' && C.rulerOf({ ...hzAns, e: 1 }) === 'check-failed',
    'octave or hertz pattern with e bigger or smaller → check-failed');
  // the decibel ruler: on a log ratio taper, equal travel from 2:1 up (×2) and down (÷2) moves the 24 dB hit unequally
  const hitDb = (R) => 24 / R, up = hitDb(2) - hitDb(4), down = hitDb(1) - hitDb(2);
  check('cited reason: from 2:1 on a log ratio taper, doubling moves the hit 6 dB, halving 12 dB, for equal travel; even in 1/R',
    near(up, 6, 1e-9) && near(down, 12, 1e-9) && near((1 / 2 - 1 / 4) * 24, up, 1e-9), `${up} dB vs ${down} dB`);
  // the ratio knob the reveal cites, from Boundary-Crossing Instruments' face: hit 24 dB over, out = over ÷ R,
  // a 1 to 100 knob in the first 97% of travel, the last 3% a notch at ∞
  const DET = 0.97, over = 24, posR = (R, taper) => (taper === 'log' ? Math.log(R) / Math.log(100) : (R - 1) / 99) * DET;
  const linShare = DET - posR(20, 'lin'), logShare = DET - posR(20, 'log'), moved = over / 20 - over / 100;
  check('cited: a ratio knob’s 20:1 to 100:1 takes 78% of a linear knob and 34% of a log one, and moves the hit 0.96 dB',
    near(linShare, 0.784, 0.001) && near(logShare, 0.339, 0.001) && near(moved, 0.96, 1e-9), `${(linShare * 100).toFixed(1)}%, ${(logShare * 100).toFixed(1)}%, ${moved.toFixed(2)} dB · Boundary-Crossing Instruments’ check prints the same`);
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
