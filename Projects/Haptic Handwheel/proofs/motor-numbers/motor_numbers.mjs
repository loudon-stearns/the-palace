// Haptic Handwheel — what the GM5208-12's own datasheet says about the feels.
//   node motor_numbers.mjs   → motor_numbers.json, motor_brake.wav
// Reuses the feel lab's engine (../feel-lab/feel_engine.js), so these numbers
// and the browser page describe one knob. Datasheet: iFlight GM5208-12,
// read 2026-10-13: 15.2 Ω ±5 % (two leads), 0.09 ±0.1 A and 456–504 rpm
// no-load at 20 V, 1800–2500 g·cm at 1 A, 195 g, Ø63 mm. KV and inductance
// are not published. Every derived number below is a bracket, not a value.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, '../feel-lab/feel_engine.js'), 'utf8');
const { makeEngine, FEELS } = new Function(src + '\nreturn { makeEngine, FEELS };')();
const TAU = 2 * Math.PI;
const out = {};

// ── 1. torque constant, two ways ─────────────────────────────────────────────
const ktRated = [0.18, 0.25];                    // N·m per A, from 1800–2500 g·cm at 1 A
const omNoLoad = [456, 504].map(r => r / 60 * TAU); // rad/s at 20 V
const ktKV = omNoLoad.map(w => 20 / w).reverse();  // V·s/rad = N·m/A (upper bound: losses ignored)
const kt = [Math.min(ktRated[0], ktKV[0]), Math.max(ktRated[1], ktKV[1])];
const R = [7.6, 15.2];                             // Ω: per phase (half of lead-to-lead) … lead-to-lead
// ── 2. the motor is a brake: back-EMF through the winding resistance ─────────
// Driven by voltage (SimpleFOC with no current sensing), a spinning motor makes
// a voltage k·ω, which pushes current k·ω/R, which pushes back torque k²ω/R.
// That is viscous damping, physical and instant — no loop, no delay.
const bElec = [kt[0] ** 2 / R[1], kt[1] ** 2 / R[0]];
const bElecMid = Math.sqrt(bElec[0] * bElec[1]);
// ── 3. rotor inertia, from the shape (ASSUMED: ~80 g of the 195 g is the bell,
// a ring between 22 and 31 mm radius) ────────────────────────────────────────
const Jrotor = [0.06 * 0.022 ** 2, 0.09 * 0.031 ** 2];
// ── 4. electrical corner: torque falls off above R / (2πL). L ASSUMED 1–6 mH.
const L = [0.001, 0.006];
const corner = [R[0] / (TAU * L[1]), R[1] / (TAU * L[0])];
out.datasheet = { kt, ktRated, ktKV, R, bElec, bElecMid, Jrotor, L_assumed: L, cornerHz: corner,
  assumedBefore: { bMotor: 1e-4, Jrotor: 3e-5 } };

// ── 5. the stability sweep again, with the motor's own brake in it ───────────
function grows(K, o) {
  const e = makeEngine(Object.assign({ fs: 96000, tauC: 0, quantize: false, tauMax: 1e6 }, o));
  e.setFeel(FEELS.struck({ k: K, damp: 0 }));
  e.s.th = 0.05;
  const wn = Math.sqrt(K / e.J), dur = Math.max(0.6, 30 / (wn / TAU));
  const n = Math.round(dur * e.P.fs), w = Math.round(n / 5);
  let a0 = 0, a1 = 0;
  for (let i = 0; i < n; i++) {
    e.step(); const v = Math.abs(e.s.th);
    if (!isFinite(v) || v > 10) return true;
    if (i < w) a0 = Math.max(a0, v); else if (i >= n - w) a1 = Math.max(a1, v);
  }
  return a1 > a0;
}
function kMax(o) {
  let lo = 1e-4, hi = 50;
  if (!grows(hi, o)) return hi;
  for (let i = 0; i < 22; i++) { const m = Math.sqrt(lo * hi); if (grows(m, o)) hi = m; else lo = m; }
  return Math.sqrt(lo * hi);
}
const LANES = [
  { id: 'device, 1 kHz loop', loopHz: 1000, delayMs: 0 },
  { id: 'USB to Max, ~4 ms', loopHz: 1000, delayMs: 4 },
  { id: 'audio line, ~5.3 ms', loopHz: 48000, delayMs: 5.33 },
];
const BRAKES = [
  { id: 'brake cancelled (old assumption)', b: 1e-4 },
  { id: 'brake left on, low bracket', b: 1e-4 + bElec[0] },
  { id: 'brake left on, middle', b: 1e-4 + bElecMid },
];
out.stability = [];
for (const lane of LANES) for (const br of BRAKES) {
  const o = { loopHz: lane.loopHz, delayMs: lane.delayMs, bMotor: br.b, Jrotor: 5e-5 };
  out.stability.push({ lane: lane.id, brake: br.id, b: br.b, kmax: kMax(o),
    theory: br.b / (0.5 / lane.loopHz + lane.delayMs / 1000) });
}

// ── 6. what the brake costs: the struck spring rings less ────────────────────
// Ring time = how long the wobble takes to fall to 1/e. Light cap, k 0.085.
const capJ = 0.5 * 0.04 * 0.04 ** 2;
out.ring = BRAKES.concat([{ id: 'brake left on, high bracket', b: 1e-4 + bElec[1] }]).map(br => {
  const J = 5e-5 + capJ, wn = Math.sqrt(0.085 / J), zeta = br.b / (2 * Math.sqrt(0.085 * J));
  return { brake: br.id, b: br.b, ringMs: 1000 * 2 * J / br.b, wobbleHz: wn / TAU, zeta,
    wobblesHeard: zeta < 1 ? (2 * J / br.b) * (wn / TAU) : 0 };
});

// ── 7. hear it: one flick of the struck spring, three brakes, back to back ───
const fsA = 48000, seg = 1.6, samples = [];
for (const br of [BRAKES[0], BRAKES[1], BRAKES[2]]) {
  const e = makeEngine({ fs: fsA, loopHz: 10000, bMotor: br.b, Jrotor: 5e-5 });
  e.setFeel(FEELS.struck({ k: 0.085 }));
  let ph = 0;
  for (let i = 0; i < seg * fsA; i++) {
    e.s.extTorque = i < 0.012 * fsA ? 0.2 : 0;   // the flick
    e.step();
    const f = 440 * Math.pow(2, (e.pitch() - 69) / 12);
    ph += TAU * f / fsA;
    const env = Math.min(1, i / 200) * Math.min(1, (seg * fsA - i) / 2000);
    samples.push(0.35 * env * (Math.sin(ph) + 0.3 * Math.sin(2 * ph) + 0.12 * Math.sin(3 * ph)));
  }
  for (let i = 0; i < 0.25 * fsA; i++) samples.push(0);
}
function wav(file, x, sr) {
  const b = Buffer.alloc(44 + x.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + x.length * 2, 4); b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24);
  b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36);
  b.writeUInt32LE(x.length * 2, 40);
  x.forEach((v, i) => b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2));
  fs.writeFileSync(file, b);
}
wav(path.join(here, 'motor_brake.wav'), samples, fsA);
fs.writeFileSync(path.join(here, 'motor_numbers.json'), JSON.stringify(out, null, 1));
const f = (v, d = 3) => Number(v).toPrecision(d);
console.log('kt', kt.map(v => f(v)), 'bElec', bElec.map(v => f(v)), 'mid', f(bElecMid), 'J', Jrotor.map(v => f(v)), 'corner Hz', corner.map(v => f(v)));
for (const r of out.stability) console.log(r.lane.padEnd(22), r.brake.padEnd(34), 'kmax', f(r.kmax), 'theory', f(r.theory));
for (const r of out.ring) console.log(r.brake.padEnd(34), 'ring ms', f(r.ringMs), 'wobbles', f(r.wobblesHeard), 'zeta', f(r.zeta));
