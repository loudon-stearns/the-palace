#!/usr/bin/env node
// Haptic Handwheel — the pendulum, checked against something other than itself.
//
// The struck pendulum's torque is −k·sin(θ). With no friction that is an exact
// pendulum, and its period at any swing has a closed form that owes nothing to
// the feel engine: T(θ₀) = T₀ / AGM(1, cos(θ₀/2)), T₀ = 2π·√(J/k), where
// AGM is the arithmetic-geometric mean (it gives the complete elliptic integral
// K exactly). This script strikes the engine's pendulum from a range of swings,
// times its rate from the zero crossings, and sets each beside the formula.
// It then checks the claim the page makes in words: the pendulum quickens as
// it settles, by how much, from where.
//
// usage: node pendulum_check.mjs   (writes pendulum_check.json beside it)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, 'feel_engine.js'), 'utf8');
const { makeEngine, FEELS } = new Function(src + '\nreturn { makeEngine, FEELS };')();

const agm = (a, b) => { while (Math.abs(a - b) > 1e-15 * a) [a, b] = [(a + b) / 2, Math.sqrt(a * b)]; return a; };
const exactHz = (f0, a) => f0 * agm(1, Math.cos(a / 2));   // = f₀·π / (2·K(sin(θ₀/2)))
const K = 0.085;

// An ideal knob: no friction, no bumps, no losses, no encoder steps, so the
// only physics left is the feel's own law. The 10 kHz loop and its hold stay,
// and they matter: a torque held for one tick acts half a tick late, and a late
// spring pushes energy in. So each full swing is timed on its own and set
// beside the exact rate at that swing's own size, not the size it was struck at.
function strike(law, pull, secs = 1.2, o = {}) {
  const e = makeEngine(Object.assign({ tauC: 0, bMotor: 0, quantize: false }, o));
  e.setFeel(FEELS.struck({ law, k: K }));
  e.s.th = pull; e.s.sensedTh = pull; e.s.lastSensedTh = pull;
  const swings = []; let prev = e.s.th, tUp = null, peak = 0, flipped = false;
  for (let i = 0; i < secs * e.P.fs; i++) {
    e.step();
    peak = Math.max(peak, Math.abs(e.s.th));
    if (Math.abs(e.s.th) > Math.PI) { flipped = +e.s.t.toFixed(3); break; }
    if (prev < 0 && e.s.th >= 0) {
      const t = e.s.t - (e.s.th / (e.s.th - prev)) / e.P.fs;
      if (tUp !== null) swings.push({ hz: 1 / (t - tUp), amp: peak });
      tUp = t; peak = 0;
    }
    prev = e.s.th;
  }
  return { e, swings, flipped, end: Math.abs(e.s.th) };
}

const J = strike('spring', 0.1, 0.01).e.J;
const f0 = Math.sqrt(K / J) / (2 * Math.PI);
const pulls = [0.1, 0.3, 0.5, 1.0, 1.5, 2.0, 2.3, 2.6, 3.0];
const rows = pulls.map((a) => {
  const r = strike('pendulum', a), w = r.swings[0];
  if (!w) return { pull_rad: a, pull_deg: +(a * 180 / Math.PI).toFixed(1), flipped: r.flipped };
  const errs = r.swings.map((x) => (x.hz - exactHz(f0, x.amp)) / exactHz(f0, x.amp) * 100);
  return { pull_rad: a, pull_deg: +(a * 180 / Math.PI).toFixed(1), swing_rad: +w.amp.toFixed(4), engine_hz: +w.hz.toFixed(4), exact_hz: +exactHz(f0, w.amp).toFixed(4),
    err_pct: +errs[0].toFixed(3), worst_err_pct: +Math.max(...errs.map(Math.abs)).toFixed(3), swings: r.swings.length, flipped: r.flipped };
});
const spring = pulls.filter((a) => a <= 2.3).map((a) => strike('spring', a).swings[0].hz);

// The loop's own push, measured: struck small and left alone for 10 s, how much does the swing grow?
const grow = strike('spring', 0.1, 10);
const growPct = (grow.swings.at(-1).amp / grow.swings[0].amp - 1) * 100;
let fails = 0;
const ok = (c, w) => { console.log((c ? '  ok   ' : '  FAIL ') + w); if (!c) fails++; };
console.log(`\nf₀ = (1/2π)·√(k/J) = ${f0.toFixed(4)} Hz  (k = ${K} N·m/rad, J = ${strike('spring', 0.1, 0.01).e.J.toExponential(3)} kg·m²)\n`);
console.log('  struck from     first full swing      engine     exact      error');
for (const r of rows) console.log(r.swing_rad === undefined ? `  ${r.pull_rad.toFixed(1)} rad ${String(r.pull_deg).padStart(5)}°   goes over the top at ${r.flipped} s, before one full swing` :
  `  ${r.pull_rad.toFixed(1)} rad ${String(r.pull_deg).padStart(5)}°   ${r.swing_rad.toFixed(3)} rad            ${r.engine_hz.toFixed(3)} Hz  ${r.exact_hz.toFixed(3)} Hz  ${r.err_pct >= 0 ? '+' : ''}${r.err_pct.toFixed(3)}%${r.flipped ? '   then over the top at ' + r.flipped + ' s' : ''}`);
const timed = rows.filter((r) => r.swing_rad !== undefined && !r.flipped);
const worst = Math.max(...timed.map((r) => r.worst_err_pct));
console.log('');
ok(worst < 0.5, `every timed swing of the engine's pendulum matches the exact rate for its size to within 0.5% (worst ${worst.toFixed(3)}%, ${timed.reduce((n, r) => n + r.swings, 0)} swings); the residue grows with the swing because the swing itself grows inside one period`);
ok(spring.every((h) => Math.abs(h - f0) / f0 < 0.001), `the spring's first swing is f₀ at every size to within 0.1% (${Math.min(...spring).toFixed(3)}–${Math.max(...spring).toFixed(3)} Hz)`);
const q = (a) => (f0 / exactHz(f0, a) - 1) * 100;
ok(q(0.3) < 1, `from a 0.3 rad (17°) swing the pendulum quickens by only ${q(0.3).toFixed(2)}% as it settles: too little to feel or hear`);
ok(q(2.3) > 40, `from 2.3 rad (132°), the strike the rich face uses, it quickens by ${q(2.3).toFixed(0)}% as it settles`);
console.log(`         from 3.0 rad (172°) it would quicken by ${q(3.0).toFixed(0)}%: near the top, the pendulum hangs.`);
console.log(`
the loop's own push: struck at 0.1 rad and left alone with no losses at all, the swing grows ${growPct.toFixed(1)}% in 10 s.`);
const lateUs = 2 * J * Math.log(1 + growPct / 100) / (K * 10) * 1e6;
console.log(`         a spring that acts τ late is a brake of −k·τ, and the swing grows as e^(k·τ·t/2J). The growth measured means τ = ${lateUs.toFixed(0)} µs.`);
ok(lateUs > 25 && lateUs < 55, `the lateness is between a quarter and a little over half of one 100 µs tick of the 10 kHz loop (${lateUs.toFixed(0)} µs): the hold, not the physics`);
// ─── Part two: the brake the firmware cancels ───────────────────────────────
// The struck spring and the pendulum ask the firmware to cancel the motor's own
// brake (cancelBrake 1): it adds kt_est·ω volts so the back-EMF's kt·ω is gone.
// What is left is (kt − kt_est)·kt/R·ω. If the bench reads kt a little high,
// the cancelling overshoots, and what is left is a push, not a brake. The engine
// models the cancelled knob as 1e-4 N·m·s/rad of bearing loss; here that loss
// has a miss of ε·kt²/R taken off it, on the pretend motor with its friction.
console.log('\nthe cancelled brake, if the bench reads kt high by ε: struck from 2.3 rad on the pretend motor (friction on, bumps off), 8 s');
const BEMF = { low: 0.00223, mid: 0.00711, high: 0.0232 };   // kt²/R guesses, as BRAKES in feel_engine.js
const miss = [];
function ringOut(law, b) {
  const e = makeEngine({ bMotor: b, quantize: false });
  e.setFeel(FEELS.struck({ law, k: K }));
  e.s.th = 2.3; e.s.sensedTh = 2.3; e.s.lastSensedTh = 2.3;
  let last = 0, peakLate = 0, over = null, clipped = 0;
  for (let i = 0; i < 8 * e.P.fs; i++) {
    e.step();
    if (Math.abs(e.s.om) > 0.05) last = e.s.t;
    if (e.s.t > 6) peakLate = Math.max(peakLate, Math.abs(e.s.th));
    if (Math.abs(e.s.tauFeel) >= e.P.tauMax) clipped++;
    if (over === null && Math.abs(e.s.th) > Math.PI) over = +e.s.t.toFixed(2);
  }
  return over !== null ? (law === 'pendulum' ? `over the top at ${over} s` : `runs away at ${over} s`) : peakLate > 0.2 ? `still swinging ${peakLate.toFixed(2)} rad after 6 s${clipped ? ', hitting the torque cap' : ''}` : `still at ${last.toFixed(2)} s`;
}
console.log('  kt read high by   brake guess   left over (N·m·s/rad)   spring                         pendulum');
for (const eps of [0, 0.01, 0.02, 0.05]) for (const g of eps === 0 ? ['mid'] : ['low', 'mid', 'high']) {
  const b = 1e-4 - eps * BEMF[g];
  const row = { eps, guess: g, b: +b.toExponential(2), spring: ringOut('spring', b), pendulum: ringOut('pendulum', b) };
  miss.push(row);
  console.log(`  ${(eps * 100).toFixed(0).padStart(3)}%              ${g.padEnd(5)}         ${(b >= 0 ? '+' : '') + b.toExponential(2)}              ${row.spring.padEnd(30)} ${row.pendulum}`);
}
const safe = miss.filter((r) => r.eps > 0 && !/over|swinging/.test(r.pendulum + r.spring));
ok(!/over|swinging/.test(miss[0].spring + miss[0].pendulum), 'cancelled exactly, both settle: friction ends the ring');
ok(miss.some((r) => /over|swinging/.test(r.pendulum + r.spring)), `a few percent high on kt and some guess of the brake no longer rings down (${miss.filter((r) => /over|swinging/.test(r.pendulum + r.spring)).map((r) => (r.eps * 100) + '% ' + r.guess).join(', ')})`);

// ─── Part three: the rule the firmware now keeps ────────────────────────────
// cancelMax = min(1, (1 + b_bearings/b_backemf) / 1.05): the most of the brake
// any feel may cancel and still be braked if kt reads 5% high. bench_analyze.py
// prints it; the firmware cancels nothing until it arrives.
console.log('\nthe rule: cancel at most (1 + b_bearings/b_backemf)/1.05 of the brake. Struck from 2.3 rad, as above');
console.log('  brake guess   cancelMax   kt exact: spring / pendulum            kt 5% high: spring / pendulum');
const rule = [];
for (const g of ['low', 'mid', 'high']) {
  const be = BEMF[g], c = Math.min(1, (1 + 1e-4 / be) / 1.05);
  const at = (eps) => 1e-4 + be * (1 - c * (1 + eps));
  const r = { guess: g, cancelMax: +c.toFixed(3), exact: [ringOut('spring', at(0)), ringOut('pendulum', at(0))], high5: [ringOut('spring', at(0.05)), ringOut('pendulum', at(0.05))] };
  rule.push(r);
  console.log(`  ${g.padEnd(5)}         ${c.toFixed(3)}       ${r.exact.join(' / ').padEnd(38)} ${r.high5.join(' / ')}`);
}
ok(rule.every((r) => !/over|away|swinging/.test(r.exact.join() + r.high5.join())), 'under the rule, every guess of the brake rings down, with kt exact or 5% high');

fs.writeFileSync(path.join(here, 'pendulum_check.json'), JSON.stringify({ k: K, f0_hz: +f0.toFixed(4), rows, spring_hz: spring.map((h) => +h.toFixed(4)), worst_err_pct: worst, loop_growth_pct_10s: +growPct.toFixed(2), brake_miss: miss, cancel_rule: rule, loop_late_us: +lateUs.toFixed(1), checked: new Date().toISOString().slice(0, 10) }, null, 2) + '\n');
console.log(fails ? `\n${fails} failed` : '\nall checks pass');
process.exit(fails ? 1 : 0);
