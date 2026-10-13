// Haptic Handwheel — does the parts list fit the feels?   node fit_check.mjs → fit_check.json
// The question a parts order turns on: which supply voltage. In SimpleFOC's
// voltage mode the firmware asks for volts, u = tau·R/kt + cancelBrake·kt·ω
// (feel_core.h, Motor::volts). The first term is the push; the second cancels
// the motor's own brake, and it grows with speed. Space-vector PWM can put
// about V/√3 on the motor. So the supply sets both how hard the knob can push
// and how fast it can spin before a cancelled brake runs out of volts and the
// struck spring, pendulum or turntable start to feel braked again.
// Motor brackets are the datasheet ones from ../proofs/motor-numbers (R per
// phase 7.6–15.2 Ω, kt 0.18–0.42 N·m/A). Nothing here was measured.
import fs from 'node:fs';
const R = [7.6, 15.2], kt = [0.18, 0.42];
const mid = { R: Math.sqrt(R[0] * R[1]), kt: Math.sqrt(kt[0] * kt[1]) };
const rpm = w => w * 60 / (2 * Math.PI);
const rows = [];
for (const V of [12, 16, 24]) {
  const Uq = V / Math.sqrt(3);
  // stall push at full volts, worst and middle motor
  const tauWorst = kt[0] * Uq / R[1], tauMid = mid.kt * Uq / mid.R;
  // stall current at the best-case (lowest) resistance — what the driver and motor see
  const Imax = Uq / R[0];
  // fastest spin with the brake fully cancelled and nothing left to push with
  const wFree = [Uq / kt[1], Uq / mid.kt];
  // ...and while still pushing the feel's working torque of 0.08 N·m
  const w08 = (Uq - 0.08 * mid.R / mid.kt) / mid.kt;
  rows.push({ V, Uq: +Uq.toFixed(2), tauWorst: +tauWorst.toFixed(3), tauMid: +tauMid.toFixed(3),
    Imax: +Imax.toFixed(2), heatW: +(Imax ** 2 * R[0] * 1.5).toFixed(1),
    cancelToRadS: wFree.map(w => +w.toFixed(1)), cancelToRpm: wFree.map(w => Math.round(rpm(w))),
    cancelWhilePushingRpm: Math.round(rpm(w08)) });
}
// how fast do the feels that cancel the brake actually move?
const needs = [
  { feel: 'turntable at 33⅓ rpm', radS: 33.33 / 60 * 2 * Math.PI },
  { feel: 'turntable at 45 rpm', radS: 45 / 60 * 2 * Math.PI },
  { feel: 'struck spring, 0.5 rad flick at 5.9 Hz (peak speed)', radS: 0.5 * 2 * Math.PI * 5.9 },
  { feel: 'a hard flick of a free knob (guess)', radS: 30 },
];
const out = { rows, needs: needs.map(n => ({ ...n, radS: +n.radS.toFixed(1), rpm: Math.round(rpm(n.radS)) })) };
fs.writeFileSync(new URL('./fit_check.json', import.meta.url), JSON.stringify(out, null, 1));
console.table(rows.map(r => ({ V: r.V, 'push worst N·m': r.tauWorst, 'push mid N·m': r.tauMid,
  'max A': r.Imax, 'cancel brake to rpm (worst..mid)': r.cancelToRpm.join('..'), 'cancel while pushing 0.08': r.cancelWhilePushingRpm })));
console.table(out.needs);
