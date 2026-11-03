// ---
// title: Bessel Functions in Synthesis — proof — rich face checks
// born: 2026-11-03
// links: [[Bessel Functions in Synthesis]] connects-to · proof-of-the-rich-face · checks the three made pieces of [[Bessel Functions in Synthesis — rich.json]]
// forward_vector: I re-run every claim the rich face's made pieces make, on each piece's own engine pulled
//   out of its page: the carrier null and the sideband ladder against a printed table, the drum head's
//   zeros and strike points, and the order's zeros and peaks. Each step's claim stays in when the next
//   arrives, as Progressive Staging asks, and the section's own claim is checked last. Reference values
//   were computed apart from the pieces, with SciPy, and are typed in here, so nothing checks itself.
// ---
// Run: node "Projects/Bessel Functions in Synthesis/Bessel Functions in Synthesis — proof — rich face checks.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const engine = (name, names) => {
  const html = fs.readFileSync(path.join(here, `Bessel Functions in Synthesis — rich — ${name}.html`), 'utf8');
  if (html.includes('rich:' + 'hush') || html.includes('rich:' + 'height')) throw new Error(name + ' names a kit message; the kit would leave that part to it');
  const src = html.match(/const ENGINE_SRC = String\.raw`([\s\S]*?)`;/)[1];
  return new Function(src + `; return { ${names.join(', ')} };`)();
};
let pass = 0, fail = 0;
function check(piece, step, claim, ok, detail) { (ok ? pass++ : fail++); console.log(`${ok ? 'ok  ' : 'FAIL'}  ${piece} · ${step} · ${claim}${detail ? '  (' + detail + ')' : ''}`); }
const db = v => 20 * Math.log10(Math.abs(v) + 1e-300);
function dft(x, f, sr) { let re = 0, im = 0; for (let i = 0; i < x.length; i++) { const p = 2 * Math.PI * f * i / sr; re += x[i] * Math.cos(p); im -= x[i] * Math.sin(p); } return 2 * Math.hypot(re, im) / x.length; }

// ───────────── The FM-Bessel Isomorphism · carrier null ─────────────
{
  const P = 'carrier null';
  const { NullPair, besselJ, measure } = engine('carrier null', ['NullPair', 'besselJ', 'measure']);
  const ZERO = 2.404825557695773;
  // The printed table (SciPy jv, to ten places), typed in.
  const TABLE = {
    1: [0.7651976866, 0.4400505857, 0.1149034849, 0.0195633540, 0.0024766390, 0.0002497577],
    2: [0.2238907791, 0.5767248078, 0.3528340286, 0.1289432495, 0.0339957198, 0.0070396298, 0.0012024290],
    5: [-0.1775967713, -0.3275791376, 0.0465651163, 0.3648312306, 0.3912323605, 0.2611405461, 0.1310487318, 0.0533764102, 0.0184052167],
  };
  // step 1: beta 0 is a sine at the carrier
  const m0 = measure(1100, 100, 0, [1100, 1000, 1200, 900]);
  check(P, 'step 1', 'β 0 is the carrier alone, at full height', Math.abs(m0[0] - 1) < 1e-9 && Math.max(...m0.slice(1)) < 1e-9, `carrier ${m0[0].toFixed(9)}, loudest other ${db(Math.max(...m0.slice(1))).toFixed(0)} dB`);
  // step 2: the first pair, paid for by the carrier
  const m1 = measure(1100, 100, 0.5, [1100, 1000, 1200]);
  check(P, 'step 2', 'at β 0.5 the first pair stands at J₁(0.5) and the carrier at J₀(0.5)', Math.abs(m1[1] - besselJ(1, 0.5)) < 1e-9 && Math.abs(m1[2] - besselJ(1, 0.5)) < 1e-9 && Math.abs(m1[0] - besselJ(0, 0.5)) < 1e-9, `pair ${m1[1].toFixed(6)}, ${m1[2].toFixed(6)}; carrier ${m1[0].toFixed(6)}`);
  let pw = 0; for (let b = 0; b <= 6; b += 0.25) { let p = besselJ(0, b) ** 2; for (let n = 1; n < 30; n++) p += 2 * besselJ(n, b) ** 2; pw = Math.max(pw, Math.abs(p - 1)); }
  check(P, 'step 2', 'the power stays at 1 for every β from 0 to 6', pw < 1e-12, `worst ${pw.toExponential(1)}`);
  // step 3: the landscape: every sideband on its curve, β 0 to 6
  let worst = 0, at = 0;
  for (let b = 0.05; b <= 6.0001; b += 0.05) {
    const ns = []; for (let n = -7; n <= 7; n++) ns.push(n);
    const m = measure(1100, 100, b, ns.map(n => 1100 + n * 100));
    ns.forEach((n, i) => { const want = Math.abs(besselJ(Math.abs(n), b)); if (want > 1e-3) { const d = Math.abs(db(m[i]) - db(want)); if (d > worst) { worst = d; at = b; } } });
  }
  check(P, 'step 3', 'every sideband from −7 to +7 sits on |Jₙ(β)| across β 0 to 6, where |Jₙ| > 0.001', worst < 0.001, `worst ${worst.toExponential(1)} dB at β ${at.toFixed(2)}`);
  // step 4: the window passes the carrier and holds its neighbours down
  function rmsWin(fc, fm, beta, tone) {
    const sr = 48000, e = new NullPair(sr); e.set({ fc, fm, beta, gate: 1, win: 1, snap: true }); e.g = 1;
    if (tone) { e.fc = 1100; e.design(); e.fc = tone; e.fm = 1; }      // a pure sine at 'tone' through the 880 Hz window
    const N = sr, L = new Float64Array(N), R = new Float64Array(N); e.render(L, R, N);
    let s = 0; for (let i = sr / 2; i < N; i++) s += L[i] * L[i]; return Math.sqrt(s / (N / 2)) / 0.3;
  }
  const pass0 = rmsWin(1100, 100, 0) * Math.SQRT2, nb = rmsWin(1100, 100, 0, 1200) * Math.SQRT2;
  check(P, 'step 4', 'the window passes the bare carrier at 0 dB and holds a sideband 100 Hz away about 50 dB down', Math.abs(db(pass0)) < 0.1 && db(nb) < -48, `carrier ${db(pass0).toFixed(2)} dB, 1200 Hz ${db(nb).toFixed(1)} dB`);
  // step 5, the test: at the first zero of J0 the carrier is gone
  const mz = measure(1100, 100, ZERO, [1100]);
  check(P, 'step 5', 'at β 2.4048 the carrier, measured from the engine, is gone', db(mz[0]) < -200, `${db(mz[0]).toFixed(0)} dB`);
  const wz = db(rmsWin(1100, 100, ZERO) / rmsWin(1100, 100, 0));
  check(P, 'step 5', 'and through the window the sound drops more than 50 dB from β 0', wz < -50, `${wz.toFixed(1)} dB`);
  let tu = 0, td = 0;
  for (const [b, T] of Object.entries(TABLE)) {
    const ns = T.map((_, n) => n), up = measure(1100, 100, +b, ns.map(n => 1100 + n * 100)), dn = measure(1100, 100, +b, ns.map(n => 1100 - n * 100));
    ns.forEach(n => { tu = Math.max(tu, Math.abs(up[n] - Math.abs(T[n]))); td = Math.max(td, Math.abs(dn[n] - Math.abs(T[n]))); });
  }
  check(P, 'step 5', 'the engine\'s ladder above the carrier matches the printed table at β 1, 2 and 5 to its ten places', tu < 1e-9, `worst ${tu.toExponential(1)}`);
  check(P, 'step 5', 'below it, to 3 × 10⁻⁶: at β 5, J₁₄\'s lower sideband (2.8 × 10⁻⁶) folds past 0 Hz onto the 300 Hz rung', td < 3e-6 && td > 2.7e-6, `worst ${td.toExponential(2)}`);
  // step 5, the edge: at 1:1 the carrier does not vanish, because J2's lower sideband folds onto it
  const m11 = measure(220, 220, ZERO, [220]);
  const fold = besselJ(0, ZERO) - besselJ(2, ZERO);
  check(P, 'step 5', 'at 1 : 1 and β 2.4048 the 220 Hz partial is |J₀ − J₂| = 0.432, not nothing', Math.abs(m11[0] - Math.abs(fold)) < 1e-9 && db(m11[0]) > -8, `${m11[0].toFixed(4)}, ${db(m11[0]).toFixed(1)} dB`);
  // the 1:1 sawtooth claim, for the offer: at no index from 0.2 to 8 do the first ten harmonics come near 1/k
  let best = { dev: 1e9 };
  for (let b = 0.2; b <= 8.0001; b += 0.02) {
    const m = measure(220, 220, b, Array.from({ length: 10 }, (_, k) => (k + 1) * 220));
    const dev = Math.max(...m.map((a, k) => Math.abs(db(a / m[0]) - db(1 / (k + 1)))));
    if (dev < best.dev) best = { dev, b };
  }
  check(P, 'offer', 'at 1 : 1 no index from 0.2 to 8 brings the first ten harmonics within 15 dB of a sawtooth\'s 1/k', best.dev > 15, `closest ${best.dev.toFixed(1)} dB, at β ${best.b.toFixed(2)}`);
}

// ───────────── Eigenfunction Principle · drum head ─────────────
{
  const P = 'drum head';
  const E = engine('drum head', ['besselJ', 'zeros', 'membraneTable', 'stringModes', 'drumModes', 'heardModes', 'cents', 'onWhole', 'render']);
  const T = E.membraneTable();
  // Abramowitz & Stegun, Table 9.5, typed in
  const AS = { '0,1': 2.4048, '1,1': 3.8317, '2,1': 5.1356, '0,2': 5.5201, '3,1': 6.3802, '1,2': 7.0156, '4,1': 7.5883, '2,2': 8.4172, '0,3': 8.6537, '5,1': 8.7715 };
  let zw = 0; for (const [k, v] of Object.entries(AS)) { const [m, kk] = k.split(',').map(Number); const z = T.find(t => t.m === m && t.k === kk); zw = Math.max(zw, z ? Math.abs(z.j - v) : 1); }
  check(P, 'zeros', 'the zeros the engine finds match the printed table to four places', zw < 6e-5, `worst ${zw.toExponential(1)}`);
  check(P, 'zeros', 'the section\'s three: 2.405, 3.832, 5.136', [2.405, 3.832, 5.136].every((v, i) => Math.abs(T[[0, 1, 2][i]].j - v) < 6e-4));
  // step 1: a string's partials are whole numbers
  const s1 = E.stringModes(0.23);
  check(P, 'step 1', 'a struck string\'s modes are at 1, 2, 3 … 8 and all its overtone power is on whole numbers', s1.every((m, i) => m.ratio === i + 1) && E.onWhole(s1) === 1);
  const sr = 48000, x1 = E.render(s1, 140, sr, 1);
  check(P, 'step 1', 'the render has its third partial at 420 Hz and nothing at 1.593 × 140', db(dft(x1, 420, sr)) - db(dft(x1, 140 * 1.5933, sr)) > 30);
  // step 2: struck at the middle the even modes are gone, and the odd ones stay put
  const s2 = E.stringModes(0.5);
  check(P, 'step 2', 'struck at the middle, every even mode is silent', s2.filter(m => m.n % 2 === 0).every(m => Math.abs(m.amp) < 1e-12) && s2.filter(m => m.n % 2).every(m => Math.abs(m.amp) > 0.05));
  // step 3: the drum's partials fall at the zeros over the first
  const d3 = E.drumModes(T, 0.6), want = [1, 1.5933, 2.1355, 2.2954, 2.6531, 2.9173];
  check(P, 'step 3', 'the drum head\'s first six partials are at 1, 1.593, 2.136, 2.295, 2.653, 2.917', want.every((v, i) => Math.abs(T[i].ratio - v) < 2e-4), T.slice(0, 6).map(t => t.ratio.toFixed(4)).join(' '));
  const x3 = E.render(d3, 140, sr, 1), a11 = dft(x3, 140 * T[1].ratio, sr), a2 = dft(x3, 280, sr);
  check(P, 'step 3', 'the render rings at 1.593 × 140 Hz and has nothing at 2 × 140', db(a11) - db(a2) > 30, `${(db(a11) - db(a2)).toFixed(0)} dB apart`);
  // step 4: same pitch, same decay
  check(P, 'step 4', 'string and drum share the lowest partial, 140 Hz', s1[0].ratio === 1 && T[0].ratio === 1);
  // step 5, the test: the strike chooses which modes, never where; no strike makes the round head harmonic
  const c = E.drumModes(T, 0);
  check(P, 'step 5', 'struck at the centre only the ring modes (m = 0) sound', c.filter(m => m.m > 0).every(m => Math.abs(m.amp) < 1e-12) && c.filter(m => m.m === 0).every(m => Math.abs(m.amp) > 1e-3));
  check(P, 'step 5', 'and they fall at 1, 2.295, 3.598, 4.903, each more than 30 cents off a whole number', E.heardModes(c, -40).slice(1, 4).every(m => Math.abs(E.cents(m.ratio)) > 30), E.heardModes(c, -40).slice(0, 4).map(m => m.ratio.toFixed(3)).join(' '));
  let best = { share: -1 };
  for (let i = 0; i <= 98; i++) { const share = E.onWhole(E.drumModes(T, i / 100)); if (share > best.share) best = { share, r: i / 100 }; }
  check(P, 'step 5', 'of 99 strike radii, none puts even a quarter of the overtone power within 20 cents of a whole number', best.share < 0.25, `best ${(best.share * 100).toFixed(1)} % at radius ${best.r}; the string, 100 %`);
}

// ───────────── Synthesis Applications · order as a knob ─────────────
{
  const P = 'order as a knob';
  const { J, shadow0, zerosOf, firstPeak, wave } = engine('order as a knob', ['J', 'shadow0', 'zerosOf', 'firstPeak', 'wave']);
  // SciPy's jv, typed in
  const REF = [[0, 0.3, 0.977626246538], [0, 1.7, 0.397984859446], [0, 6, 0.150645257251], [0, 19.9, 0.172877756393], [0, 20.1, 0.159536067937], [0, 33, 0.097270672236], [0, 140, 0.037358225012], [0, 1381.7, 0.003938729589], [0.5, 0.3, 0.430493517328], [0.5, 1.7, 0.606848808008], [0.5, 6, -0.091015409523], [0.5, 19.9, 0.155186929919], [0.5, 20.1, 0.168913842474], [0.5, 33, 0.138881631977], [0.5, 140, 0.066101043159], [0.5, 1381.7, -0.012133709403], [1, 0.3, 0.148318816273], [1, 1.7, 0.577765231529], [1, 6, -0.276683858128], [1, 19.9, 0.050117424807], [1, 20.1, 0.08280100576], [1, 33, 0.100619649115], [1, 140, 0.056273052792], [1, 1381.7, -0.021099226828], [2.5, 0.3, 0.002605301856], [2.5, 1.7, 0.16223862833], [2.5, 6, -0.072949745908], [2.5, 19.9, -0.167417338041], [2.5, 20.1, -0.176024085093], [2.5, 33, -0.138331396235], [2.5, 140, -0.065805084107], [2.5, 1381.7, 0.012095245057], [3, 0.3, 0.000559343048], [3, 1.7, 0.085149926948], [3, 6, 0.114768384821], [3, 19.9, -0.083854274913], [3, 20.1, -0.112909893699], [3, 33, -0.111670862652], [3, 140, -0.057317462056], [3, 1381.7, 0.021087735852], [5.75, 0.3, 4.0269e-08], [5.75, 1.7, 0.000778463661], [5.75, 6, 0.278308460871], [5.75, 19.9, -0.015322279343], [5.75, 20.1, 0.019540874358], [5.75, 33, 0.016582364292], [5.75, 140, -0.005147139072], [5.75, 1381.7, -0.011928195712], [8, 0.3, 6e-12], [8, 1.7, 6.234841e-06], [8, 6, 0.056531990932], [8, 19.9, -0.05807407384], [8, 20.1, -0.088966446292], [8, 33, -0.027750534559], [8, 140, 0.023682008958], [8, 1381.7, 0.004426356386]];
  let rw = 0; for (const [nu, x, v] of REF) rw = Math.max(rw, Math.abs(J(nu, x) - v));
  check(P, 'engine', 'J for whole and fractional orders 0 to 8, x 0.3 to 1382, matches SciPy', rw < 1e-9, `worst ${rw.toExponential(1)}`);
  // step 1: J0's zeros
  const z = zerosOf(x => J(0, x), 30);
  check(P, 'step 1', 'J₀ begins at 1 and its zeros are 2.405, 5.520, 8.654, as the section says', J(0, 0) === 1 && [2.405, 5.520, 8.654].every((v, i) => Math.abs(z[i] - v) < 6e-4), z.slice(0, 3).map(x => x.toFixed(4)).join(' '));
  // step 2: the gaps settle to pi; the shadow lies on J0
  const gaps = z.map((x, i) => x - (i ? z[i - 1] : 0));
  check(P, 'step 2', 'after the first zero, every gap is within 1 % of π, and closer each time', gaps.slice(1).every(g => Math.abs(g - Math.PI) / Math.PI < 0.01) && gaps.slice(2).every((g, i) => Math.abs(g - Math.PI) <= Math.abs(gaps[i + 1] - Math.PI)), gaps.slice(1, 5).map(g => g.toFixed(4)).join(' '));
  let sw = 0; for (let x = 5; x <= 30; x += 0.001) sw = Math.max(sw, Math.abs(J(0, x) - shadow0(x)));
  check(P, 'step 2', 'past x = 5, J₀ and its shadow differ by under 0.01', sw < 0.01, `at most ${sw.toFixed(4)}`);
  // step 3: J1 wakes from zero and peaks at 1.841
  const p1 = firstPeak(1);
  check(P, 'step 3', 'J₁ begins at 0 and peaks at x = 1.841, height 0.582', J(1, 0) === 0 && Math.abs(p1.x - 1.8412) < 1e-3 && Math.abs(p1.y - 0.5819) < 1e-3, `${p1.x.toFixed(4)}, ${p1.y.toFixed(4)}`);
  // step 4: a higher order stays near silent before x = n; fractional orders are real
  let quiet = true; for (let n = 2; n <= 8; n++) if (Math.abs(J(n, 0.5 * n)) / firstPeak(n).y > 0.25) quiet = false;
  check(P, 'step 4', 'for n 2 to 8, at x = n ⁄ 2 Jₙ is under a quarter of its peak', quiet);
  const p35 = firstPeak(3.5);
  check(P, 'step 4', 'order 3.5 peaks between order 3 and order 4', p35.x > firstPeak(3).x && p35.x < firstPeak(4).x, p35.x.toFixed(3));
  const sw6 = wave(6, 'swell', 48000, 1); let best = 0, tmax = 0;
  for (let i = 0; i < sw6.length; i += 48) { let e = 0; for (let k = 0; k < 48 && i + k < sw6.length; k++) e = Math.max(e, Math.abs(sw6[i + k])); if (e > best) { best = e; tmax = i / 48000; } }
  check(P, 'step 4', 'slowed, order 6 swells to its loudest at 7.50 × 25 ms', Math.abs(tmax - 7.5013 * 0.025) < 0.004, `${(tmax * 1000).toFixed(1)} ms`);
  // step 5, the test: the peak of Jn against n
  const rows = []; for (let n = 1; n <= 8; n++) { const q = firstPeak(n); rows.push({ n, x: q.x, late: q.x - n, share: J(n, n) / q.y, asym: n + 0.8086 * Math.cbrt(n) }); }
  check(P, 'step 5', 'the order sets the peak, later for every higher n', rows.every((r, i) => !i || r.x > rows[i - 1].x));
  check(P, 'step 5', 'but the peak is not at n: it comes 0.84 to 1.65 later', rows.every(r => r.late > 0.8 && r.late < 1.7), rows.map(r => r.late.toFixed(2)).join(' '));
  check(P, 'step 5', 'and follows n + 0.81 · n^⅓ to within 0.06', rows.every(r => Math.abs(r.x - r.asym) < 0.06), rows.map(r => (r.x - r.asym).toFixed(3)).join(' '));
  check(P, 'step 5', 'at x = n, Jₙ is already 68 % to 76 % of the way to its peak', rows.every(r => r.share > 0.68 && r.share < 0.76), rows.map(r => Math.round(r.share * 100) + '%').join(' '));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
