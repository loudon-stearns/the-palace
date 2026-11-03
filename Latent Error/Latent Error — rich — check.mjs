// Latent Error — rich — check.mjs
// born: 2026-11-03 · checks the two pieces of [[Latent Error]]'s rich face
// forward_vector: I re-run, headless, every number the two pieces and their captions state. For the room that
// settles short: that P alone in a room that answers at once never overshoots and rests where the sum says;
// where the lagged room's loop loses its calm, by its own characteristic equation and by the run; which runs
// the page's sentence describes; what the memory carries at rest; what D does to the overshoot. For holes that
// line up: that the counted share through matches the sum, and what adding a slice and redesigning one buy.
// I also check that the numbers the pages print are the numbers I measured. What a listener hears I cannot check.
//
//   node "Latent Error/Latent Error — rich — check.mjs"
//
// It pulls each page's <script id="le-…-core"> out of the HTML, runs it in a Node sandbox, and compares against
// equations written here on their own. PASS/FAIL per claim; exits 1 on any FAIL. Reads only.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const page = (file) => readFileSync(join(HERE, `Latent Error — rich — ${file}.html`), 'utf8');
const core = (file, id) => {
  const m = page(file).match(new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)</script>`));
  if (!m) throw new Error(`no <script id="${id}"> in ${file}`);
  const E = { Math }; vm.createContext(E); vm.runInContext(m[1], E); return E;
};
let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const says = (html, list) => list.filter((s) => !html.includes(s));

// ── the room that settles short · § Control Theory Translation: The Integral Term ──
{
  const P = core('the room that settles short', 'le-pid-core'), html = page('the room that settles short');
  const run = (o) => P.simulate({ lag: false, kp: 0, ki: 0, kd: 0, manual: null, window: true, ...o });
  const an = (o) => P.analyze(run(o));
  console.log('— the room that settles short');

  // the room alone: at rest T = 5 + 30u − D
  const a0 = an({ manual: 0.5, window: false }), a1 = an({ manual: 0.5 }), a2 = an({ manual: 2 / 3 }), a3 = an({ manual: 2 / 3, window: false });
  check('the room alone: half power rests at 20, then 15 with the window; two thirds holds 20 with it and 25 without',
    near(a0.finalT, 20, 0.01) && near(a1.finalT, 15, 0.01) && near(a2.finalT, 20, 0.01) && near(a3.finalT, 25, 0.01),
    `${a0.finalT.toFixed(3)}, ${a1.finalT.toFixed(3)}, ${a2.finalT.toFixed(3)}, ${a3.finalT.toFixed(3)}`);

  // P alone, answering at once: never overshoots, rests at 20 − 20/(1 + 30 Kp)
  let worstOver = 0, worstOff = 0, allSettled = true;
  for (let kp = 0.05; kp <= 5.0001; kp += 0.05) {
    const a = an({ kp }); worstOver = Math.max(worstOver, a.overshoot); allSettled = allSettled && a.settled;
    worstOff = Math.max(worstOff, Math.abs(a.offset - 20 / (1 + 30 * kp)));
  }
  check('P alone, answers at once: no overshoot at any Kp from 0.05 to 5, and every run settles', worstOver === 0 && allSettled, `largest overshoot ${worstOver.toFixed(4)} °C`);
  check('P alone, answers at once: rests short by (20 − 5 + 5) ÷ (1 + 30·Kp), the page’s pOffset', worstOff < 0.005 && near(P.pOffset(0.2), 20 / 7, 1e-12), `worst gap ${worstOff.toFixed(5)} °C`);
  check('P alone, answers at once: Kp 0.2 rests at 17.14, Kp 5 at 19.87', near(an({ kp: 0.2 }).centre, 17.143, 0.005) && near(an({ kp: 5 }).centre, 19.868, 0.005), `${an({ kp: 0.2 }).centre.toFixed(3)}, ${an({ kp: 5 }).centre.toFixed(3)}`);

  // P alone, with lag: (10s+1)(2s+1)(s+1) + 30 Kp = 20s³ + 32s² + 13s + 1 + 30Kp; Routh edge a2·a1 = a3·a0
  const kpEdge = (32 * 13 / 20 - 1) / 30, period = 2 * Math.PI / Math.sqrt(13 / 20);
  check('the lagged loop’s edge, by Routh: Kp = 0.66, a swing every 7.8 minutes', near(kpEdge, 0.66, 1e-9) && near(period, 7.79, 0.01), `Kp ${kpEdge.toFixed(4)}, period ${period.toFixed(2)} min`);
  const ratio = (kp) => { const t = run({ lag: true, kp }); return P.stretch(t, 180, 240).p2p / P.stretch(t, 120, 180).p2p; };
  check('the run agrees: at Kp 0.60 the swing shrinks hour on hour, at 0.66 and 0.70 it holds', ratio(0.6) < 0.6 && ratio(0.66) > 0.95 && ratio(0.7) > 0.95, `ratios ${ratio(0.6).toFixed(3)}, ${ratio(0.66).toFixed(3)}, ${ratio(0.7).toFixed(3)}`);
  {
    const t = run({ lag: true, kp: 0.66 }), ups = [];
    for (let i = 1; i < t.t.length; i++) if (t.t[i] >= 180 && t.T[i - 1] < 19.03 && t.T[i] >= 19.03) ups.push(t.t[i]);
    const per = (ups.at(-1) - ups[0]) / (ups.length - 1);
    check('the run’s swing at Kp 0.66 repeats about every 7.8 minutes', near(per, 7.8, 0.3), `${per.toFixed(2)} min over ${ups.length - 1} cycles`);
  }
  const b4 = an({ lag: true, kp: 0.4 }), b7 = an({ lag: true, kp: 0.7 });
  check('with lag, Kp 0.4 overshoots once by 1.06 and settles at 18.46', b4.settled && near(b4.overshoot, 1.063, 0.005) && near(b4.centre, 18.462, 0.005), `${b4.overshoot.toFixed(3)}, ${b4.centre.toFixed(3)}`);
  check('with lag, Kp 0.7 never settles, swings 18.24 to 19.91, and never reaches 20', b7.state === 'sustained' && near(b7.lo, 18.24, 0.006) && near(b7.hi, 19.91, 0.006) && b7.hi < 20, `${b7.state}, ${b7.lo.toFixed(3)} to ${b7.hi.toFixed(3)}`);
  check('with lag and P alone, the swing is centred near P’s resting point, not the target (Kp 0.66)', near(an({ lag: true, kp: 0.66 }).centre, 20 - P.pOffset(0.66), 0.1) && an({ lag: true, kp: 0.66 }).offset > 0.9, `centre ${an({ lag: true, kp: 0.66 }).centre.toFixed(3)}, P rests at ${(20 - P.pOffset(0.66)).toFixed(3)}`);

  // I: memory carries the loss at rest; the lagged loop's Ki edge with Kp 0.2, by Routh on the quartic
  const pi = run({ lag: true, kp: 0.2, ki: 0.02 }), api = P.analyze(pi);
  check('P and I, with lag, Kp 0.2 Ki 0.02: settles on 20.00, overshoot 0.36', api.settled && near(api.centre, 20, 0.005) && near(api.overshoot, 0.362, 0.005), `${api.centre.toFixed(4)}, ${api.overshoot.toFixed(3)}`);
  check('at rest the memory carries the loss: Ki·∫e = (20 − 5 + 5) ÷ 30 = 0.667', near(pi.iTerm.at(-1), 2 / 3, 0.001), `${pi.iTerm.at(-1).toFixed(4)}`);
  const a1q = 1 + 30 * 0.2, b1 = (32 * 13 - 20 * a1q) / 32, kiEdge = b1 * a1q / (32 * 30);
  check('the Ki edge with Kp 0.2, by Routh: 0.063', near(kiEdge, 0.063, 0.0005), `${kiEdge.toFixed(4)}`);
  const k55 = an({ lag: true, kp: 0.2, ki: 0.055 }), k07 = an({ lag: true, kp: 0.2, ki: 0.07 });
  check('the run agrees: Ki 0.055 calms, Ki 0.07 swings 18.28 to 21.54 and never settles', k55.state !== 'sustained' && k07.state === 'sustained' && near(k07.lo, 18.28, 0.006) && near(k07.hi, 21.54, 0.006), `${k55.state}; ${k07.state}, ${k07.lo.toFixed(3)} to ${k07.hi.toFixed(3)}`);
  let plainPI = true; for (let ki = 0.005; ki <= 0.1201; ki += 0.005) plainPI = plainPI && an({ kp: 0.2, ki }).state !== 'sustained';
  check('in the room that answers at once, no Ki makes P and I swing forever (10s² + (1 + 30Kp)s + 30Ki has no unstable root)', plainPI, 'Ki 0.005 to 0.12 at Kp 0.2; the smallest is still creeping in at four hours');
  check('there, Ki 0.1 overshoots by 0.53, where P alone never overshoots', near(an({ kp: 0.2, ki: 0.1 }).overshoot, 0.534, 0.005), `${an({ kp: 0.2, ki: 0.1 }).overshoot.toFixed(3)}`);

  // D
  const d0 = an({ lag: true, kp: 0.4, ki: 0.04, kd: 0 }), d5 = an({ lag: true, kp: 0.4, ki: 0.04, kd: 0.5 }), d2 = an({ lag: true, kp: 0.4, ki: 0.04, kd: 2 });
  check('D, Kp 0.4 Ki 0.04: overshoot 1.17 at Kd 0, 0.00 at Kd 0.5, 1.97 at Kd 2', near(d0.overshoot, 1.173, 0.005) && d5.overshoot < 0.005 && near(d2.overshoot, 1.972, 0.005), `${d0.overshoot.toFixed(3)}, ${d5.overshoot.toFixed(3)}, ${d2.overshoot.toFixed(3)}`);

  // the test table: whom does the page's sentence describe?
  const words = P.LE.RUNS.map((r) => P.fits(P.analyze(P.simulate({ ...r, manual: null, window: true }))).word);
  const pAlone = P.LE.RUNS.filter((r) => r.ki === 0 && r.kd === 0);
  check('the page’s first clause holds: every P-alone run is off the target', pAlone.every((r) => Math.abs(an(r).offset) > 0.05), pAlone.map((r) => an(r).offset.toFixed(2)).join(', '));
  check('the page’s second clause fits no P-alone run fully, and fits the run with Ki 0.07', JSON.stringify(words) === JSON.stringify(['no', 'no', 'no', 'no', 'half', 'no', 'yes', 'no']), words.join(' · '));

  // the step is fine enough: halve it and the numbers hold
  {
    const dt = P.LE.DT; P.LE.DT = dt / 2;
    const h1 = an({ lag: true, kp: 0.7 }), h2 = an({ lag: true, kp: 0.2, ki: 0.07 }), h3 = an({ lag: true, kp: 0.4 });
    P.LE.DT = dt;
    check('halving the time step moves no printed number by more than 0.005', near(h1.lo, b7.lo, 0.005) && near(h1.hi, b7.hi, 0.005) && near(h2.lo, k07.lo, 0.005) && near(h2.hi, k07.hi, 0.005) && near(h3.overshoot, b4.overshoot, 0.005), `${h1.lo.toFixed(3)} ${h1.hi.toFixed(3)} ${h2.hi.toFixed(3)} ${h3.overshoot.toFixed(3)}`);
  }
  check('the sound: one degree off beats at 2 Hz; it never strays more than 40 Hz', P.roomHz(21) - 220 === 2 && P.roomHz(5) === 190 && P.roomHz(-100) === 180, `${P.roomHz(21)}, ${P.roomHz(5)}, ${P.roomHz(-100)}`);
  const missing = says(html, ['17.14', '19.87', '0.00', '1.06', '18.46', '0.65', '0.66', '7.8 minutes', '18.24', '19.91', '0.667', '0.063', '20.00', '18.28', '21.54', '0.53', '1.17', '1.97']);
  check('the page prints the numbers measured here', missing.length === 0, missing.length ? `missing ${missing.join(', ')}` : 'all present');
  check('the page leaves the hush to the kit', !/rich:hush|visibilitychange/.test(html), 'no hush handler of its own');
}

// ── holes that line up · § Latent Error (opening) ──
{
  const C = core('holes that line up', 'le-cheese-core'), html = page('holes that line up');
  console.log('— holes that line up');
  let worstZ = 0;
  const cases = [];
  for (const p of [0.05, 0.15, 0.3]) for (const n of [1, 2, 3, 5]) for (const beta of [0, 0.25, 0.6]) for (const free of [0, 1]) if (free < n || n === 1) cases.push({ p, n, beta, free: Math.min(free, n) });
  for (const c of cases) {
    const N = 200000, m = C.measure(c, N, 11), P = C.predicted(c), sd = Math.sqrt(P * (1 - P) / N) || 1e-9;
    worstZ = Math.max(worstZ, Math.abs(m - P) / sd);
  }
  check('the count matches the sum in every case, 200,000 hazards each', worstZ < 4.5, `${cases.length} cases, worst gap ${worstZ.toFixed(2)} standard errors`);
  // the sum, on its own
  const own = (p, n, beta, free) => { const m = n - free; return (m > 0 ? beta * p + (1 - beta) * p ** m : 1) * p ** free; };
  let worst = 0; for (const c of cases) worst = Math.max(worst, Math.abs(C.predicted(c) - own(c.p, c.n, c.beta, c.free)));
  check('the page’s sum is β·p + (1 − β)·pⁿ, times p for each redesigned slice', worst < 1e-15, `worst gap ${worst.toExponential(1)}`);
  const o = C.options(0.15, 3, 0.25).map((x) => C.predicted(x.c));
  check('p 0.15, three slices, β 0.25: as it is 4.00%, add a slice 3.79%, redesign one 0.82%', near(o[0], 0.0400, 0.00005) && near(o[1], 0.0379, 0.00005) && near(o[2], 0.0082, 0.00005), o.map((x) => (x * 100).toFixed(3) + '%').join(', '));
  check('the redesign lets through about a fifth as much; the stack acts like 1.70 slices, 2.53 after', near(o[2] / o[0], 0.2, 0.01) && near(C.nEff(o[0], 0.15), 1.70, 0.005) && near(C.nEff(o[2], 0.15), 2.535, 0.005), `ratio ${(o[2] / o[0]).toFixed(3)}, ${C.nEff(o[0], 0.15).toFixed(3)} → ${C.nEff(o[2], 0.15).toFixed(3)}`);
  check('three independent slices of 0.15 let through 0.34%; the shared condition makes it twelve times that',
    near(0.15 ** 3, 0.0034, 0.00005) && near(o[0] / 0.15 ** 3, 11.86, 0.01), `${(0.15 ** 3 * 100).toFixed(3)}%, ×${(o[0] / 0.15 ** 3).toFixed(2)}`);
  const z = C.options(0.15, 3, 0).map((x) => C.predicted(x.c));
  check('with no shared condition, adding a slice wins and the redesign changes nothing', z[1] < z[0] && near(z[2], z[0], 1e-15), z.map((x) => (x * 100).toFixed(4) + '%').join(', '));
  let floorOk = true; for (let n = 2; n <= 12; n++) floorOk = floorOk && C.predicted({ p: 0.15, n, beta: 0.25, free: 0 }) > 0.25 * 0.15;
  check('no number of slices of one design gets under β × p = 3.75%', floorOk, 'n from 2 to 12');
  const missing = says(html, ['4.0%', '3.8%', '4.00%', '3.79%', '0.82%', '3.75%', 'twelve times', 'a fifth']);
  check('the page prints the numbers measured here', missing.length === 0, missing.length ? `missing ${missing.join(', ')}` : 'all present');
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
