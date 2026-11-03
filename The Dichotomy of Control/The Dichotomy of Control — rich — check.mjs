// The Dichotomy of Control — rich — check.mjs
// born: 2026-11-03 · checks the piece of [[The Dichotomy of Control]]'s rich face
// forward_vector: I re-run, headless, every number the hand on the platter and its caption state, and where I
// can I reach each one by a second route the page's engine doesn't share: the sag by its sum, the loop's edge by
// Routh on the polynomial multiplied out here, the wow by the closed loop's frequency response, the jitter by the
// noise integrated through the loop, the pinned floor by the platter's own balance. Then I run the test's rules,
// on other noise seeds and at half the time step, and check the page prints what was measured. What a listener
// hears I cannot check.
//
//   node "The Dichotomy of Control/The Dichotomy of Control — rich — check.mjs"
//
// It pulls the page's <script id="dc-core"> out of the HTML, runs it in a Node sandbox, and compares. PASS/FAIL
// per claim; exits 1 on any FAIL. Reads only.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(HERE, 'The Dichotomy of Control — rich — the hand on the platter.html'), 'utf8');
const m0 = html.match(/<script id="dc-core">([\s\S]*?)<\/script>/);
if (!m0) throw new Error('no <script id="dc-core">');
const E = { Math, Infinity }; vm.createContext(E); vm.runInContext(m0[1], E);
const { DC } = E;
let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const pc = (x, n = 3) => (x * 100).toFixed(n) + '%';

// ── complex arithmetic, for the frequency response ──
const C = (re, im = 0) => ({ re, im });
const add = (a, b) => C(a.re + b.re, a.im + b.im), mul = (a, b) => C(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
const div = (a, b) => { const q = b.re * b.re + b.im * b.im; return C((a.re * b.re + a.im * b.im) / q, (a.im * b.re - a.re * b.im) / q); };
const abs = (a) => Math.hypot(a.re, a.im);
// the loop, written here on its own: platter 1/(Js+B), belt 1/(TM s+1), sensor 1/(TS s+1), C = Kp + Ki/s + Kr s/(s²+wr²)
function parts(w, o){
  const s = C(0, w), one = C(1);
  const P = div(one, add(mul(C(DC.J), s), C(DC.B)));
  const Ga = o.lag ? div(one, add(mul(C(DC.TM), s), one)) : one, Gs = o.lag ? div(one, add(mul(C(DC.TS), s), one)) : one;
  let Ct = add(C(o.kp), o.ki ? div(C(o.ki), s) : C(0));
  if (o.kr){ const wr = 2 * Math.PI * (o.fr ?? DC.FREV); Ct = add(Ct, div(mul(C(o.kr), s), add(mul(s, s), C(wr * wr)))); }
  const L = mul(mul(mul(P, Ga), Ct), Gs);
  return { P, Ga, Ct, L, one };
}
const dragToSpeed = (w, o) => { const p = parts(w, o); return abs(div(p.P, add(p.one, p.L))); };
const noiseToSpeed = (w, o) => { const p = parts(w, o); return abs(div(mul(mul(p.P, p.Ga), p.Ct), add(p.one, p.L))); };

console.log('— the hand on the platter');

// step 1: the platter alone rests at (u − d) / B
{
  const tr = E.simulate({ tend: 20, manual: 0.4, hand: 0.2, handOn: 4, handOff: 14 });
  check('the platter alone: 0.4 holds 33⅓, the finger takes it to half speed', near(E.speedAt(tr, 4), 1, 1e-6) && near(E.speedAt(tr, 14), 0.5, 0.005), `${E.speedAt(tr, 4).toFixed(4)}, ${E.speedAt(tr, 14).toFixed(4)}`);
}
// step 2: P alone on the ideal platter sags d/(B + Kp)
{
  let worst = 0;
  for (let kp = 0; kp <= 30; kp += 0.5){ const m = E.measure(E.simulate({ ...E.noiseOpts(kp, 0, false), tend: 40 }), 34, 40); worst = Math.max(worst, Math.abs(m.sag - 0.2 / (0.4 + kp))); }
  check('P alone, ideal, at rest (34 to 40 s): the sag is 0.2 ÷ (0.4 + Kp) at every Kp from 0 to 30', worst < 0.0005, `worst gap ${pc(worst, 4)}`);
  check('Kp 5 sags 3.70%, Kp 20 0.98%, Kp 30 0.66% (the sum)', pc(0.2 / 5.4, 2) === '3.70%' && pc(0.2 / 20.4, 2) === '0.98%' && pc(0.2 / 30.4, 2) === '0.66%', 'by the sum');
}
// step 3: the edge, by Routh on the polynomial multiplied out here, and by the run
{
  const mulp = (a, b) => { const r = Array(a.length + b.length - 1).fill(0); a.forEach((x, i) => b.forEach((y, j) => { r[i + j] += x * y; })); return r; };
  const poly = mulp(mulp([DC.J, DC.B], [DC.TM, 1]), [DC.TS, 1]); // a3 s³ + a2 s² + a1 s + a0
  const edge = poly[1] * poly[2] / poly[0] - poly[3];
  check('the loop polynomial is 0.006s³ + 0.163s² + 0.88s + 0.4', poly.every((x, i) => near(x, [0.006, 0.163, 0.88, 0.4][i], 1e-12)), poly.map((x) => +x.toFixed(6)).join(', '));
  check('Routh: the edge at Kp ≈ 23.5', near(edge, 23.5, 0.01), `Kp ${edge.toFixed(4)}`);
  const grow = (kp) => { const tr = E.simulate({ tend: 60, kp, lag: true, noise: false, hand: 0.005, handOn: 2, handOff: 2.2 }); return E.measure(tr, 50, 60).p2p / E.measure(tr, 20, 30).p2p; };
  const g23 = grow(23), g24 = grow(24);
  check('the run agrees: at Kp 23 a kick dies away, at Kp 24 it grows', g23 < 0.7 && g24 > 1.5, `ratio over 30 s: ${g23.toFixed(3)}, ${g24.toFixed(3)}`);
  const n = [1, 5, 20, 24].map((kp) => E.measure(E.simulate(E.noiseOpts(kp, 0, true)), 10, 20));
  check('the real platter: Kp 1 jitter 0.020%, Kp 5 sag 3.70% jitter 0.064%, Kp 20 sag 0.98% jitter 0.34%',
    pc(n[0].rms) === '0.020%' && pc(n[1].sag, 2) === '3.70%' && pc(n[1].rms) === '0.064%' && pc(n[2].sag, 2) === '0.98%' && pc(n[2].rms, 2) === '0.34%',
    `${pc(n[0].rms)}; ${pc(n[1].sag, 2)} ${pc(n[1].rms)}; ${pc(n[2].sag, 2)} ${pc(n[2].rms)}`);
  check('Kp 20 shakes about five times as much as Kp 5', near(n[2].rms / n[1].rms, 5, 0.6), `×${(n[2].rms / n[1].rms).toFixed(2)}`);
  check('the ideal platter at Kp 20 has no shake', E.measure(E.simulate(E.noiseOpts(20, 0, false)), 10, 20).rms < 1e-6, 'rms under 1e-6');
  // the jitter by a second route: the held reading error, integrated through the loop
  const h = DC.READ, sig = DC.SIGMA;
  const theory = (kp) => { let v = 0; const dw = 0.05; for (let w = dw / 2; w < 2 * Math.PI * 3000; w += dw){ const x = w * h / 2, sinc = Math.sin(x) / x; v += 2 * noiseToSpeed(w, { kp, lag: true }) ** 2 * sig * sig * h * sinc * sinc * dw / (2 * Math.PI); } return Math.sqrt(v); };
  for (const kp of [1, 5, 20]){
    const long = E.measure(E.simulate({ ...E.noiseOpts(kp, 0, true), tend: 210 }), 10, 210).rms, t = theory(kp);
    check(`jitter at Kp ${kp}, simulated over 200 s against the noise integrated through the loop`, Math.abs(long / t - 1) < 0.08, `${pc(long)} vs ${pc(t)}`);
  }
}
// step 4: memory carries the push
{
  const tr = E.simulate(E.noiseOpts(5, 2, true)), m = E.measure(tr, 10, 20), u = E.slice(tr, 'u', 10, 20).reduce((a, b) => a + b) / E.slice(tr, 'u', 10, 20).length;
  check('Kp 5, Ki 2, real: the sag is gone (under 0.2%) and the motor carries 0.4 + 0.2 = 0.6', Math.abs(m.sag) < 0.002 && near(u, 0.6, 0.005), `sag ${pc(m.sag)}, motor ${u.toFixed(4)}, jitter ${pc(m.rms)}`);
  const k20 = E.measure(E.simulate(E.noiseOpts(20, 0, true)), 10, 20);
  check('Kp 5, Ki 2 prints sag 0.08%, jitter 0.11%, a third of Kp 20 alone', pc(m.sag, 2) === '0.08%' && pc(m.rms, 2) === '0.11%' && near(m.rms / k20.rms, 1 / 3, 0.04), `${pc(m.sag, 2)}, ${pc(m.rms, 2)}, ×${(m.rms / k20.rms).toFixed(3)}`);
}
// step 5: wow, by the run and by the frequency response
{
  const w0 = 2 * Math.PI * DC.FREV, R = {};
  for (const run of DC.RUNS.filter((r) => r.kind === 'rub')) R[run.key] = E.report(run, E.simulate(E.runOpts(run)));
  const clean = (run) => E.measure(E.simulate({ ...E.runOpts(run), noise: false }), 42, 60);
  for (const key of ['modest', 'fight', 'wrong', 'idealFight', 'idealHard']){
    const run = DC.RUNS.find((r) => r.key === key), sim = clean(run).wow, fr = 0.05 * dragToSpeed(w0, { ...run, lag: !run.ideal });
    check(`wow, ${run.name}: the run against the frequency response`, Math.abs(sim / fr - 1) < 0.01, `${pc(sim)} vs ${pc(fr)}`);
  }
  const mc = clean(DC.RUNS.find((r) => r.key === 'model')).wow, mi = R.idealModel.wow;
  check('with the model tuned to once a turn, the loop is endless there and the wow is nil, on the real platter run clean and on the ideal one', mc < 0.00002 && mi < 0.00002, `${pc(mc, 4)}, ${pc(mi, 4)}`);
  const fl = E.measure(E.simulate({ ...E.rubOpts(5, 2, 3, undefined, true), rub: 0 }), 42, 60).wow;
  check('the sensor’s floor on the wow measure, no rub at all: 0.021%', pc(fl) === '0.021%', pc(fl));
  check('the printed rows: modest 1.43%, fight 0.34% with jitter 0.41%, model 0.02%, the wrong model 1.70%',
    pc(R.modest.wow, 2) === '1.43%' && pc(R.fight.wow, 2) === '0.34%' && pc(R.fight.jitter, 2) === '0.41%' && pc(R.model.wow, 2) === '0.02%' && pc(R.wrong.wow, 2) === '1.70%',
    `${pc(R.modest.wow)}, ${pc(R.fight.wow)} / ${pc(R.fight.jitter)}, ${pc(R.model.wow)}, ${pc(R.wrong.wow)}`);
  check('the model’s wow is the floor, not a result below it', Math.abs(R.model.wow - fl) < 0.0001, `${pc(R.model.wow)} vs floor ${pc(fl)}`);
  check('the model at about the same motor movement as the modest loop, the fight at three times it', near(R.model.effort / R.modest.effort, 0.91, 0.05) && R.fight.effort / R.model.effort > 3, `motor ${R.modest.effort.toFixed(3)}, ${R.model.effort.toFixed(3)}, ${R.fight.effort.toFixed(3)}`);
  check('ideal platter: fighting harder costs no jitter, and Kp 100 brings wow to 0.05%', R.idealHard.jitter < 1e-5 && pc(R.idealHard.wow, 2) === '0.05%', `${pc(R.idealHard.wow)}, jitter ${R.idealHard.jitter.toExponential(1)}`);
  const sweep = [0.4, 0.5, 0.53, 0.58, 0.6, 0.7, 1].map((fr) => E.measure(E.simulate({ ...E.rubOpts(5, 2, 3, fr, true), noise: false }), 42, 60).wow);
  check('mistuned, the model buys little or makes it worse: below 0.53 Hz and at 1 Hz it is worse than none', sweep[0] > R.modest.wow && sweep[1] < R.modest.wow && sweep[6] > R.modest.wow, sweep.map((x) => pc(x, 2)).join(', '));
}
// step 6: the hand beyond reach
{
  const R = {};
  for (const run of DC.RUNS.filter((r) => r.kind === 'heavy')) { const tr = E.simulate(E.runOpts(run)); R[run.key] = { ...E.report(run, tr), tr }; }
  // the floor, by the platter's balance: at full motor, J dw/dt = 1 − 0.4 w − 0.9 → w = 0.25
  const floor = (DC.UMAX - 0.9) / DC.B;
  check('the floor by the platter’s balance: (1 − 0.9) ÷ 0.4 = 25%', near(floor, 0.25, 1e-12), pc(floor, 1));
  // pinned from when?
  const pinnedFrom = (tr) => { let t0 = null; for (let i = 0; i < tr.t.length; i++){ if (tr.t[i] < 4 || tr.t[i] >= 14) continue; if (tr.u[i] >= 1){ if (t0 === null) t0 = tr.t[i]; } else t0 = null; } return t0; };
  const p5 = pinnedFrom(R.h5w.tr), p20 = pinnedFrom(R.h20w.tr);
  check('both gains pin the motor within a second of the hand and hold it there to the end of the press', p5 < 5 && p20 < 5, `from ${p5.toFixed(2)} s and ${p20.toFixed(2)} s`);
  // after pinning, the platter falls toward 25% at B/J: compare the run with the exponential from the moment it pinned + belt
  const tp = Math.max(p5, p20) + 1, wtp = E.speedAt(R.h5w.tr, tp), pred = floor + (wtp - floor) * Math.exp(-(DC.B / DC.J) * (14 - tp));
  check('pinned, the platter follows the balance’s exponential toward 25%', near(E.speedAt(R.h5w.tr, 14), pred, 0.003), `${pc(E.speedAt(R.h5w.tr, 14), 2)} vs ${pc(pred, 2)}`);
  check('Kp 5 asks 16.9 and Kp 20 asks 65.5; both end the press at 25.4%', R.h5w.ask.toFixed(1) === '16.9' && pc(R.h5w.end, 1) === '25.4%' && R.h20w.ask.toFixed(1) === '65.5' && pc(R.h20w.end, 1) === '25.4%', `${R.h5w.ask.toFixed(2)} ${pc(R.h5w.end, 2)}; ${R.h20w.ask.toFixed(2)} ${pc(R.h20w.end, 2)}`);
  check('keeps winding overshoots 129% (about 76 rpm); let go, 6.4%', pc(R.h5w.over, 0) === '129%' && Math.round(100 / 3 * (1 + R.h5w.over)) === 76 && pc(R.h5g.over, 1) === '6.4%', `${pc(R.h5w.over, 1)}, ${pc(R.h5g.over, 1)}`);
  // a null: a hand the motor holds without ever reaching its limit. There the release must change nothing.
  const inReach = (letGo) => E.simulate({ ...E.heavyOpts(5, 2, letGo, true), hand: 0.2 });
  const a = inReach(false), b = inReach(true), top = Math.max(...a.dem), gap = Math.max(...a.w.map((x, i) => Math.abs(x - b.w[i])));
  check('the null: a 0.2 hand never takes the motor to its limit, and there keeps winding and lets go are the same run', top < 1 && gap === 0, `largest ask ${top.toFixed(3)}, largest gap ${gap}; any gap would mean the release acts off the limit`);
  // and the edge case: a 0.4 hand the motor can hold at rest, but whose landing kicks it to its limit for a moment
  const c4 = E.overshoot(E.simulate({ ...E.heavyOpts(5, 2, false, true), hand: 0.4 }), 14), d4 = E.overshoot(E.simulate({ ...E.heavyOpts(5, 2, true, true), hand: 0.4 }), 14);
  check('a 0.4 hand, within reach at rest: the release changes the overshoot by under 0.01 points', Math.abs(c4 - d4) < 0.0001, `${pc(c4)} vs ${pc(d4)}`);
}
// the test's rules, as the page runs them, and on other noise
{
  const run = (dt, seed) => {
    const save = [DC.DT, DC.SEED]; DC.DT = dt; DC.SEED = seed; const R = {};
    for (const r of DC.RUNS) R[r.key] = E.report(r, E.simulate(E.runOpts(r)));
    [DC.DT, DC.SEED] = save; return { R, v: E.verdicts(R) };
  };
  const base = run(DC.DT, DC.SEED);
  check('the rules as stated: model wins, ideal model still wins, reach buys under a point, the grip costs, noise not rejected',
    base.v.fight && base.v.idealFight && base.v.idealFree && base.v.wrongWorse && base.v.reach && base.v.grip && !base.v.noise, JSON.stringify(base.v));
  let same = true; const seen = [];
  for (const seed of [1, 2, 3, 11, 42]){ const r = run(DC.DT, seed); seen.push(JSON.stringify(r.v) === JSON.stringify(base.v)); same = same && seen.at(-1); }
  check('five other noise seeds give the same verdicts', same, seen.join(' '));
  const half = run(DC.DT / 2, DC.SEED);
  const moved = Math.max(Math.abs(half.R.fight.wow - base.R.fight.wow), Math.abs(half.R.modest.wow - base.R.modest.wow), Math.abs(half.R.h5w.over - base.R.h5w.over) / 10, Math.abs(half.R.h5g.over - base.R.h5g.over) / 10);
  check('halving the time step moves no printed wow by more than 0.01 points, no overshoot by more than 0.1', moved < 0.0001, `largest move ${moved.toExponential(1)}`);
}
// the page
const missing = ['3.70%', '0.98%', '0.66%', '23.5', '0.020%', '0.064%', '0.34%', '1.43%', '0.41%', '0.02%', '1.70%', '0.40 Hz', '16.9', '25.4%', '129%', '76 rpm', '6.4%', '65.5', '0.08%', '0.11%', '25%', '0.021%'].filter((s) => !html.includes(s));
check('the page says fourteen runs and lists fourteen', html.includes('fourteen runs') && DC.RUNS.length === 14, `${DC.RUNS.length} runs`);
check('the page prints the numbers measured here', missing.length === 0, missing.length ? `missing ${missing.join(', ')}` : 'all present');
check('the page leaves the hush to the kit', !/rich:hush|visibilitychange/.test(html), 'no hush handler of its own');

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
