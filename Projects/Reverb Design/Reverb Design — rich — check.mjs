// title: Reverb Design — rich — check
// born: 2026-11-10
// links: [[Reverb Design]] (connects-to · checks-its-rich-face-pieces) · reads the dish's engine out of "Projects/Biomechanical Synthesis/Biomechanical Synthesis — rich — mycelial reverb.html" and the code blocks out of "tie a knot" and "the colony is a matrix"
// forward_vector: I run the two pieces' own code with no browser, on the dish's own engine: that a knot loses nothing and colours nothing, that knots in front of a grown colony bring the wash sooner, and that the dish and the textbook network are one thing, sample for sample. I change when either piece or the dish's engine does.
//
// run:  node "Projects/Reverb Design/Reverb Design — rich — check.mjs" [--quick]
//
// What would have meant failure is printed beside every number. Exit code 1 if any check fails.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const quick = process.argv.includes('--quick');
function block(file, id) {
  const html = readFileSync(file, 'utf8'), m = html.match(new RegExp('<script id="' + id + '">([\\s\\S]*?)</script>'));
  if (!m) { console.error('no ' + id + ' block in ' + file); process.exit(1); }
  return m[1];
}
const DISH = join(here, '..', 'Biomechanical Synthesis', 'Biomechanical Synthesis — rich — mycelial reverb.html');
const engine = block(DISH, 'mycel-engine');
const knotSrc = block(join(here, 'Reverb Design — rich — tie a knot.html'), 'rd-dsp');
const matSrc = block(join(here, 'Reverb Design — rich — the colony is a matrix.html'), 'rd-dsp') + block(join(here, 'Reverb Design — rich — the colony is a matrix.html'), 'fdn-dsp');
const K = new Function(engine + knotSrc + '\nreturn { MycelNet, MycelColony, mycelRng, RD_KNOTS, rdKnot, rdKnotLen, rdTie, rdImpulse, rdRig, rdClone, rdRun, rdPhrase, rdFeed, rdMixing };')();
const M = new Function(engine + matSrc + '\nreturn { MycelNet, MycelColony, mycelRng, rdRig, rdClone, rdRun, rdPhrase, rdFeed, rdStar, RD_STAR, fdnFromColony, fdnStar, fdnDense, fdnRun };')();

const SR = 48000, MAXS = 170, HOUSE = { rt: 3, damp: 0.25, tip: 0.8 };
let failed = 0;
function say(ok, name, got, failIf) { if (!ok) failed++; console.log((ok ? 'pass' : 'FAIL') + ' · ' + name + '\n       got: ' + got + '\n       failure would have been: ' + failIf); }
function found(name, got, note) { console.log('found · ' + name + '\n       ' + got + '\n       ' + note); }
const median = (a) => { const b = a.filter((v) => !isNaN(v)).sort((x, y) => x - y); return b.length ? (b.length % 2 ? b[(b.length - 1) / 2] : (b[b.length / 2 - 1] + b[b.length / 2]) / 2) : NaN; };
function rt60(x) { const N = x.length, e = new Float64Array(N + 1); for (let i = N - 1; i >= 0; i--) e[i] = e[i + 1] + x[i] * x[i]; let a = -1, b = -1; for (let i = 0; i < N; i++) { const db = 10 * Math.log10(e[i] / e[0] + 1e-30); if (a < 0 && db <= -5) a = i; if (db <= -35) { b = i; break; } } return a < 0 || b < 0 ? NaN : 2 * (b - a) / SR; }

console.log('the engine is the dish\'s, read from its page; the pieces\' code is read from the pieces\n');

// ── tie a knot ──────────────────────────────────────────────────────────────
console.log('— tie a knot —');
{ // 1 · the arithmetic the piece's words state
  const D = K.RD_KNOTS[0][0], g = K.RD_KNOTS[0][1], h = K.rdKnot(K.rdImpulse(4 * D + 1), D, g);
  let stray = 0; for (let i = 0; i < h.length; i++) if (i % D !== 0) stray = Math.max(stray, Math.abs(h[i]));
  const want = [-g, 1 - g * g, (1 - g * g) * g, (1 - g * g) * g * g], err = Math.max(...want.map((w, i) => Math.abs(h[i * D] - w)));
  say(err < 1e-12 && stray === 0, 'one knot, one knock: −g at once, then (1 − g²) a turn later, then that times g every turn after',
    h[0].toFixed(4) + ', ' + h[D].toFixed(4) + ', ' + h[2 * D].toFixed(4) + ', ' + h[3 * D].toFixed(4) + ' (want ' + want.map((w) => w.toFixed(4)).join(', ') + '); between the turns ' + stray,
    'any of the four off by more than 1e-12, or any sound between turns');
}
{ // 2 · nothing is lost: the energy that comes out is the energy that went in
  const N = SR * 4; let worst = 0; const rows = [];
  for (let k = 1; k <= 4; k++) { const h = K.rdTie(K.rdImpulse(N), k, SR); let e = 0; for (let i = 0; i < N; i++) e += h[i] * h[i]; worst = Math.max(worst, Math.abs(e - 1)); rows.push(k + ' knot' + (k > 1 ? 's' : '') + ' ' + e.toFixed(12)); }
  say(worst < 1e-9, 'a knock through 1, 2, 3 and 4 knots comes out with the energy it went in with', rows.join(' · '), 'energy out differing from energy in by more than 1e-9');
}
{ // 3 · it colours nothing: every pitch comes out as loud as it went in
  const N = SR * 4, h = K.rdTie(K.rdImpulse(N), 4, SR), r = K.mycelRng(21); let lo = 9, hi = 0;
  const fs = [20, 55, 110, 440, 1000, 4000, 12000, 20000]; for (let i = 0; i < 56; i++) fs.push(20 * Math.pow(1000, r()));
  for (const f of fs) { let re = 0, im = 0; const w = 2 * Math.PI * f / SR; for (let n = 0; n < N; n++) { if (h[n] === 0) continue; re += h[n] * Math.cos(w * n); im -= h[n] * Math.sin(w * n); } const m = Math.hypot(re, im); lo = Math.min(lo, m); hi = Math.max(hi, m); }
  say(lo > 1 - 1e-6 && hi < 1 + 1e-6, 'four knots in a row pass every pitch at the level it came in (64 pitches from 20 Hz to 20 kHz)', 'quietest ' + lo.toFixed(9) + ', loudest ' + hi.toFixed(9) + ' (1 = unchanged)', 'any pitch more than a millionth louder or quieter');
  // and the comb, for contrast: the thread of step 1 does colour
  const rg = K.rdRig(SR, 1, 8); rg.col.reset(1, 1000, 600, 'thread', 286); rg.net.msg({ t: 'par', rt: 3, damp: 0, tip: 0.8 });
  const c = K.rdRun(rg.net, K.rdImpulse(8), SR * 4).L, L2 = 2 * rg.col.segs[0].L; let cl = 9, ch = 0;
  for (const f of [SR / L2 * 10, SR / L2 * 10.5]) { let re = 0, im = 0; const w = 2 * Math.PI * f / SR; for (let n = 0; n < c.length; n++) { if (c[n] === 0) continue; re += c[n] * Math.cos(w * n); im -= c[n] * Math.sin(w * n); } const m = Math.hypot(re, im); cl = Math.min(cl, m); ch = Math.max(ch, m); }
  const g = rg.net.lineGain(rg.col.segs[0].L), loop = 0.8 * 0.8 * g * g, want = 20 * Math.log10((1 + loop) / (1 - loop)), got = 20 * Math.log10(ch / cl);
  say(Math.abs(got - want) < 0.1 && got > 6, 'the one thread, for contrast, does colour: a pitch on a tooth of the comb against one between two teeth', 'on the tooth ' + got.toFixed(1) + ' dB louder than between (the loop keeps r²·g² = ' + loop.toFixed(3) + ' a round trip, which predicts ' + want.toFixed(1) + ' dB)', 'a difference under 6 dB, or one that is not what the loop\'s own gain predicts to a tenth of a dB');
}
{ // 4 · the claim the piece walks up to. The guess, written before the first run of this check:
  //     "four knots in front of a grown colony bring the wash to under half the time it takes with none, in most of the colonies."
  const seeds = quick ? [11, 12, 13] : [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], food = K.rdPhrase(40, 3, SR), N = Math.round(1.5 * SR);
  const at = [[], [], [], [], []], rts = [[], []]; let sooner = 0, half = 0, fedFor = [];
  for (const seed of seeds) {
    const rg = K.rdRig(SR, seed, MAXS), st = { o: 0, t: 0 }; while (!K.rdFeed(rg, food, st, 200, MAXS) && st.t < 400);
    fedFor.push(st.t);
    for (let k = 0; k <= 4; k++) { const ir = K.rdRun(K.rdClone(rg.col, HOUSE, SR, MAXS), K.rdTie(K.rdImpulse(N), k, SR), k === 0 || k === 4 ? SR * 4 : N).L; at[k].push(K.rdMixing(ir.subarray(0, N), SR).at); if (k === 0) rts[0].push(rt60(ir)); if (k === 4) rts[1].push(rt60(ir)); }
    const a0 = at[0][at[0].length - 1], a4 = at[4][at[4].length - 1]; if (a4 < a0) sooner++; if (a4 < a0 / 2) half++;
  }
  console.log('  knots in front · a wash from, ms (median, lowest–highest, over ' + seeds.length + ' colonies of ' + MAXS + ' threads; carry 3 s, damping 0.25, tips keep 20%)');
  for (let k = 0; k <= 4; k++) console.log('  ' + k + ' · ' + Math.round(median(at[k]) * 1000) + ' (' + Math.round(Math.min(...at[k]) * 1000) + '–' + Math.round(Math.max(...at[k]) * 1000) + ')');
  say(sooner > seeds.length / 2, 'four knots in front of a grown colony bring the wash sooner', 'sooner in ' + sooner + ' of ' + seeds.length + '; median ' + Math.round(median(at[0]) * 1000) + ' ms with none, ' + Math.round(median(at[4]) * 1000) + ' ms with four', 'sooner in half the colonies or fewer');
  found('the guess written first: under half the time, in most colonies', 'under half in ' + half + ' of ' + seeds.length, half > seeds.length / 2 ? 'the guess held' : 'the guess did not hold; the page reports the medians above and not the guess');
  found('do the knots change how long it rings?', 'RT60 median ' + median(rts[0]).toFixed(2) + ' s with none, ' + median(rts[1]).toFixed(2) + ' s with four', 'not a pass or a fail: knots in front lose nothing, so they should move the start of the tail and leave its length nearly alone');
}

// ── the colony is a matrix ──────────────────────────────────────────────────
console.log('\n— the colony is a matrix —');
function knockSig() { const n = Math.round(0.09 * SR), d = new Float64Array(n), r = M.mycelRng(3); for (let i = 0; i < n; i++) { const t = i / SR; d[i] = 0.55 * Math.sin(6.283 * 640 * t) * Math.exp(-t * 70) + 0.3 * Math.sin(6.283 * 1510 * t) * Math.exp(-t * 110) + (i < 96 ? (r() * 2 - 1) * 0.5 * (1 - i / 96) : 0); } return d; }
function versus(col, fdn, par, x, N) {
  const a = M.rdRun(M.rdClone(col, par, SR, MAXS), x, N), b = M.fdnRun(fdn, par, x, N); let pk = 0, pd = 0;
  for (let i = 0; i < N; i++) { pk = Math.max(pk, Math.abs(a.L[i]), Math.abs(a.R[i])); pd = Math.max(pd, Math.abs(a.L[i] - b.L[i]), Math.abs(a.R[i] - b.R[i])); }
  return { pk, pd, db: pd === 0 ? -Infinity : 20 * Math.log10(pd / pk) };
}
const dbs = (v) => (v === -Infinity ? 'exactly 0' : v.toFixed(0) + ' dB');
{ // 5 · the spore's square is the one the piece prints, and it loses nothing
  const rg = M.rdRig(SR, 7, MAXS); rg.col.reset(7, 700, 600); const f = M.fdnStar(rg.col, HOUSE, SR), A = M.fdnDense(f);
  let err = 0; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) err = Math.max(err, Math.abs(A[i][j] - (i === j ? -1 / 3 : 2 / 3)));
  say(f.K === 3 && err < 1e-12, 'the newborn dish folds to three delay lines and the matrix ⅓·[−1 2 2; 2 −1 2; 2 2 −1]', 'lines ' + f.K + ', largest difference from that matrix ' + err.toExponential(1), 'any other count of lines, or any entry off by more than 1e-12');
  let worst = 0;
  for (let n = 3; n <= 8; n++) { const s = M.rdStar(M.rdRig(SR, 1, MAXS), n, 700, 600), B = M.fdnDense(M.fdnStar(s.col, HOUSE, SR)); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { let d = 0; for (let k = 0; k < n; k++) d += B[k][i] * B[k][j]; worst = Math.max(worst, Math.abs(d - (i === j ? 1 : 0))); } }
  say(worst < 1e-12, 'the star\'s matrix loses nothing, for 3 to 8 threads: Aᵀ·A is the identity', 'largest difference from the identity ' + worst.toExponential(1), 'any entry of Aᵀ·A off by more than 1e-12');
}
{ // 6 · the dish and the diagram are one thing: a knock through each, sample against sample
  const N = Math.round((quick ? 1 : 2.6) * SR), k = knockSig(); let worst = -Infinity; const rows = [];
  { const rg = M.rdRig(SR, 7, MAXS); rg.col.reset(7, 700, 600); const v = versus(rg.col, M.fdnStar(rg.col, HOUSE, SR), HOUSE, k, N); worst = Math.max(worst, v.db); rows.push('spore ' + dbs(v.db)); }
  for (let n = 3; n <= 8; n++) { const s = M.rdStar(M.rdRig(SR, 1, MAXS), n, 700, 600), v = versus(s.col, M.fdnStar(s.col, HOUSE, SR), HOUSE, k, N); worst = Math.max(worst, v.db); rows.push(n + ' threads ' + dbs(v.db)); }
  // and a star whose threads are not equally thick, at another setting
  { const s = M.rdStar(M.rdRig(SR, 1, MAXS), 6, 700, 600), r = M.mycelRng(5); s.col.segs.forEach((g) => { if (g) g.y = 0.3 + 3.5 * r(); }); const par = { rt: 8, damp: 0.6, tip: 1 }, v = versus(s.col, M.fdnStar(s.col, par, SR), par, k, N); worst = Math.max(worst, v.db); rows.push('6 of unequal thickness, carry 8 s, tips give all back ' + dbs(v.db)); }
  say(worst < -100, 'a star in the dish against the folded textbook network (one line per thread, as long as its round trip): the difference, under the loudest sample', rows.join(' · '), 'any difference louder than 100 dB under the knock\'s loudest echo (16-bit sound has a floor near −96)');
}
{ // 7 · a grown colony against the unfolded network: two lines per thread, a matrix of small squares
  const seeds = quick ? [11, 12] : [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22], food = M.rdPhrase(40, 3, SR), N = Math.round((quick ? 0.6 : 1.5) * SR), k = knockSig();
  let worst = -Infinity, worstCol = 0, lines = [], sq = [], dots = [], fill = [], frostWorst = -Infinity; const sizes = quick ? [40, MAXS] : [10, 60, MAXS];
  for (const seed of seeds) {
    const rg = M.rdRig(SR, seed, MAXS), st = { o: 0, t: 0 };
    for (const target of sizes) {
      while (!M.rdFeed(rg, food, st, 200, target) && st.t < 400);
      const f = M.fdnFromColony(rg.col, HOUSE, SR), v = versus(rg.col, f, HOUSE, k, N); worst = Math.max(worst, v.db);
      // what the matrix keeps: every column of it has length 1, but a dead end's, which has the tip's 0.8
      const col2 = new Float64Array(f.K); f.rows.forEach((r) => r.c.forEach((c, i) => { col2[c] += r.v[i] * r.v[i]; }));
      f.blocks.forEach((b) => { for (let i = 0; i < b.n; i++) worstCol = Math.max(worstCol, Math.abs(Math.sqrt(col2[b.at + i]) - (b.n === 1 ? HOUSE.tip : 1))); });
      if (target === MAXS) { lines.push(f.K); sq.push(f.blocks.filter((b) => b.n > 1).length); dots.push(f.blocks.filter((b) => b.n === 1).length); let nz = 0; f.rows.forEach((r) => { nz += r.c.length; }); fill.push(100 * nz / (f.K * f.K)); }
    }
    while (rg.col.frost() > 0);                              // and after a frost, when only rings are left
    frostWorst = Math.max(frostWorst, versus(rg.col, M.fdnFromColony(rg.col, HOUSE, SR), HOUSE, k, N).db);
  }
  say(worst < -100 && frostWorst < -100, 'a grown colony against the textbook network built from its wiring (' + seeds.length + ' colonies × ' + sizes.length + ' sizes, then each frosted to its rings)', 'largest difference ' + dbs(worst) + ' while growing, ' + dbs(frostWorst) + ' frosted, under the loudest sample', 'any difference louder than 100 dB under the loudest sample');
  say(worstCol < 1e-12, 'the grown matrix loses nothing except at the dead ends: every column has length 1, a dead end\'s has the 0.8 its tip gives back', 'largest difference ' + worstCol.toExponential(1), 'any column off by more than 1e-12');
  found('what a full dish looks like as a network', 'median ' + median(lines) + ' delay lines, ' + median(sq) + ' squares, ' + median(dots) + ' lone dots; ' + median(fill).toFixed(1) + '% of the matrix is not zero', 'a matrix where every line fed every other would be 100%');
}

console.log(failed ? '\n' + failed + ' check' + (failed > 1 ? 's' : '') + ' FAILED' : '\nall checks pass');
process.exit(failed ? 1 : 0);
