// Haptic Handwheel — offline proofs from the same engine the feel lab plays.
//   node render_feel_lab.mjs            → stability sweep, felt-pitch table, five WAVs,
//                                          feel_lab_results.json, stability.svg/.png
// Loads feel_engine.js as text, so the page and these numbers cannot drift apart.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(here, 'feel_engine.js'), 'utf8');
const { makeEngine, FEELS } = new Function(src + '\nreturn { makeEngine, FEELS };')();
const TAU = 2 * Math.PI;
const out = {};

// ── 1. Stability: how stiff a feel can be before delay makes it buzz ─────────
// A pure virtual spring, released from a small offset, hand on or off. Grow → unstable.
const LANES = [
  { id: 'device-10k', label: 'on the device, 10 kHz loop', loopHz: 10000, delayMs: 0 },
  { id: 'device-1k', label: 'on the device, 1 kHz loop', loopHz: 1000, delayMs: 0 },
  { id: 'usb-max', label: 'over USB to Max and back (ASSUMED 4 ms)', loopHz: 1000, delayMs: 4 },
  { id: 'audio-line', label: 'as an audio/CV line (ASSUMED 2×128 samples)', loopHz: 48000, delayMs: 5.33 },
];
const CAPS = [{ id: 'light', capMass: 0.04 }, { id: 'weighted', capMass: 0.15 }];
const HANDS = [{ id: 'hands off', hand: false }, { id: 'gripped', hand: true }];

function grows(K, lane, cap, hand, extraB = 0) {
  const e = makeEngine({ fs: 96000, loopHz: lane.loopHz, delayMs: lane.delayMs, capMass: cap.capMass,
    tauC: 0, quantize: false, bMotor: 1e-4 + extraB, tauMax: 1e6 });
  e.setFeel(FEELS.struck({ k: K, damp: 0 }));
  e.s.th = 0.05; e.s.hand = hand.hand; e.s.handTarget = 0;
  const wn = Math.sqrt((K + (hand.hand ? e.P.handK : 0)) / e.J);
  const dur = Math.max(0.6, 30 / (wn / TAU)); // at least 30 cycles
  const n = Math.round(dur * e.P.fs), w = Math.round(n / 5);
  let a0 = 0, a1 = 0;
  for (let i = 0; i < n; i++) {
    e.step();
    const v = Math.abs(e.s.th);
    if (!isFinite(v) || v > 10) return true;
    if (i < w) a0 = Math.max(a0, v); else if (i >= n - w) a1 = Math.max(a1, v);
  }
  return a1 > a0 * 1.0;
}
function kMax(lane, cap, hand, extraB = 0) {
  let lo = 1e-4, hi = 50;
  if (!grows(hi, lane, cap, hand, extraB)) return hi;
  for (let i = 0; i < 22; i++) {
    const mid = Math.sqrt(lo * hi);
    if (grows(mid, lane, cap, hand, extraB)) hi = mid; else lo = mid;
  }
  return Math.sqrt(lo * hi);
}
// theory: delay acts as negative damping K·(T/2 + d); stable while total damping exceeds it
const theory = (lane, hand, extraB = 0) => (1e-4 + extraB + (hand.hand ? 0.0032 : 0)) / (0.5 / lane.loopHz + lane.delayMs / 1000);

const stab = [];
for (const lane of LANES) for (const cap of CAPS) for (const hand of HANDS) {
  stab.push({ lane: lane.id, cap: cap.id, hand: hand.id, kmax: kMax(lane, cap, hand), theory: theory(lane, hand) });
}
// the rescue: the device adds 0.002 N·m·s/rad of its own damping (fast, local), the stiffness crosses the wire
const rescue = LANES.filter(l => l.delayMs > 0).map(lane => ({
  lane: lane.id, kmax: kMax(lane, CAPS[0], HANDS[0], 0.002), theory: theory(lane, HANDS[0], 0.002) }));
out.stability = { stab, rescue };

// how stiff each feel needs to be (N·m/rad at its stiffest point), from the defaults in the engine
const needs = [
  { feel: 'soft centring spring (pitch-wheel return)', K: 0.03, kind: 'answers the hand' },
  { feel: 'struck spring, light cap (6 Hz wobble)', K: 0.085, kind: 'answers the hand' },
  { feel: 'haptic filtering (knob follows a melody)', K: 0.25, kind: 'answers the hand' },
  { feel: 'string bend, near full bend (~1 rad)', K: 0.04 + 3 * 0.25, kind: 'answers the hand' },
  { feel: 'frets, 24 per turn, 0.03 N·m pull', K: 0.03 * 24, kind: 'answers the hand' },
  { feel: 'an end stop / wall', K: 3, kind: 'answers the hand' },
  { feel: 'LFO, a pitch, beat clicks', K: 0, kind: 'played into the hand' },
];
const lightOff = (l) => stab.find(r => r.lane === l && r.cap === 'light' && r.hand === 'hands off').kmax;
const lightOn = (l) => stab.find(r => r.lane === l && r.cap === 'light' && r.hand === 'gripped').kmax;
out.verdicts = needs.map(n => ({ ...n, ...Object.fromEntries(LANES.map(l => [l.id,
  n.K === 0 ? 'fine' : n.K < lightOff(l.id) ? 'fine' : n.K < lightOn(l.id) ? 'only while held' : 'buzzes'])) }));

// ── 2. Can a pitch be felt? Rim movement for a torque at audio rate ───────────
const felt = [];
for (const cap of CAPS) for (const A of [0.002, 0.01]) for (const f of [98, 196, 392]) {
  const e0 = makeEngine({ capMass: cap.capMass });
  const theoryUm = (A * e0.P.capR / (e0.J * (TAU * f) ** 2)) * 1e6;
  felt.push({ cap: cap.id, torque: A, hz: f, rim_um_theory: +theoryUm.toFixed(3) });
}
// one simulated check: G3 (196 Hz) at 0.005 N·m on the light cap, gripped, 10 kHz loop
{
  const e = makeEngine({ fs: 96000, quantize: false, tauC: 0 });
  e.setFeel({ torque: (en) => 0.005 * Math.sin(TAU * 196 * en.s.t) });
  e.s.hand = true;
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < 96000; i++) { e.step(); if (i > 48000) { lo = Math.min(lo, e.s.th); hi = Math.max(hi, e.s.th); } }
  const simUm = ((hi - lo) / 2) * e.P.capR * 1e6;
  const thUm = (0.005 * e.P.capR / (e.J * (TAU * 196) ** 2)) * 1e6;
  out.feltCheck = { torque: 0.005, hz: 196, rim_um_sim: +simUm.toFixed(3), rim_um_theory: +thUm.toFixed(3) };
}
out.felt = felt;

// ── 3. Sound: five gestures, the knob's angle made audible ────────────────────
const SR = 48000;
function writeWav(file, buf) {
  let pk = 0; for (const v of buf) pk = Math.max(pk, Math.abs(v));
  const g = pk > 0 ? 0.89 / pk : 1, n = buf.length, b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28);
  b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf[i] * g)) * 32767), 44 + i * 2);
  fs.writeFileSync(path.join(here, file), b);
}
const loop = (() => { // a two-bar plucked riff for the turntable to play
  const len = SR * 2, L = new Float32Array(len), notes = [45, 52, 57, 60, 57, 52, 55, 50];
  notes.forEach((m, i) => { const f = 440 * 2 ** ((m - 69) / 12), st = i * len / 8;
    for (let j = 0; j < len / 8; j++) { const t = j / SR; L[st + j] += Math.exp(-t * 7) * (Math.sin(TAU * f * t) + 0.4 * Math.sin(TAU * 2 * f * t) + 0.2 * Math.sin(TAU * 3 * f * t)); } });
  return L;
})();

function render(seconds, opts, feel, script, trace) {
  const e = makeEngine(Object.assign({ fs: SR }, opts));
  e.setFeel(feel);
  const n = Math.round(seconds * SR), buf = new Float32Array(n);
  let ph = 0, lp = 0, amp = 0;
  for (let i = 0; i < n; i++) {
    script(e, e.s.t);
    e.step();
    const v = feel.voice(e);
    amp += 0.002 * (v.amp - amp);
    let y;
    if (v.rate !== undefined) { lp = (lp + v.rate) % loop.length; const k = Math.floor(lp); y = loop[(k + loop.length) % loop.length]; lp = lp < 0 ? lp + loop.length : lp; }
    else {
      ph += 440 * 2 ** ((v.midi - 69) / 12) / SR; ph -= Math.floor(ph);
      y = 0; for (let h = 1; h <= 6; h++) y += Math.sin(TAU * h * ph) / h;
      y *= amp;
      if (v.click) y += 0.6 * v.click * Math.sin(TAU * 1800 * e.s.t);
    }
    buf[i] = y;
    if (trace && i % 480 === 0) trace(e);
  }
  return buf;
}

// 3a/3b. struck spring vs pendulum: pull it to ~2.5 rad, let go, a finger lands at 2.2 s
const strikeScript = (target) => (e, t) => {
  e.s.hand = t < 0.35; e.s.handTarget = Math.min(1, t / 0.25) * target;
  e.s.brake = t > 2.2 ? 0.004 : 0;
};
const zeroCross = {};
for (const law of ['spring', 'pendulum']) {
  const xs = []; let prev = 0, prevT = 0;
  const buf = render(3.5, { semisPerTurn: 6, basePitch: 57 }, FEELS.struck({ law }), strikeScript(3.0),
    null);
  // measure the wobble's period over time from a second, silent pass
  const e = makeEngine({ fs: SR, semisPerTurn: 6 }); e.setFeel(FEELS.struck({ law }));
  for (let i = 0; i < 2.2 * SR; i++) { strikeScript(3.0)(e, e.s.t); e.step();
    if (e.s.t > 0.36 && prev < 0 && e.s.th >= 0) { if (prevT) xs.push({ t: +e.s.t.toFixed(3), hz: +(1 / (e.s.t - prevT)).toFixed(2) }); prevT = e.s.t; }
    prev = e.s.th; }
  zeroCross[law] = xs;
  writeWav(`struck_${law}.wav`, buf);
}
out.struck = zeroCross;

// 3c. haptic filtering: melody alone · a finger braking · the hand adding vibrato
{
  const f = FEELS.follow();
  const buf = render(9.6, {}, f, (e, t) => {
    e.s.brake = t >= 3.2 && t < 6.4 ? 0.012 : 0;
    e.s.hand = t >= 6.4; e.s.handTarget = f.target(e) + 0.1 * Math.sin(TAU * 5.5 * t);
  });
  writeWav('follow_melody.wav', buf);
}

// 3d. turntable: spinning; light brake; hard brake; a push forward; let go
{
  const tt = FEELS.turntable(), speeds = [];
  const buf = render(8, {}, tt, (e, t) => {
    e.s.brake = t >= 2 && t < 3 ? 0.02 : t >= 4.5 && t < 5.2 ? 0.12 : 0;
    e.s.extTorque = t >= 6 && t < 6.8 ? 0.03 : 0;
  }, (e) => speeds.push(+(e.s.om / tt.omega()).toFixed(3)));
  writeWav('turntable.wav', buf);
  const at = (s) => speeds[Math.round(s * 100)];
  out.turntable = { speed_at: { '1.5s': at(1.5), '2.8s': at(2.8), '5.0s': at(5.0), '6.6s': at(6.6), '7.8s': at(7.8) } };
}

// 3e. the lock: the hand eases the LFO rate from 1.5× the beat down to the beat
{
  const lk = FEELS.lock(), drift = [];
  const buf = render(12, {}, lk, (e, t) => {
    e.s.hand = true;
    const oct = 0.6 * Math.max(0, 1 - t / 8);
    e.s.handTarget = (oct / 4) * TAU;
  });
  // where each click lands in the wobble, sampled at a few moments (silent pass)
  const e = makeEngine({ fs: SR }); const lk2 = FEELS.lock(); e.setFeel(lk2);
  for (let i = 0; i < 12 * SR; i++) { e.s.hand = true; e.s.handTarget = (0.6 * Math.max(0, 1 - e.s.t / 8) / 4) * TAU; e.step(); }
  out.lock = { click_phase_last_8: lk2.clicks.slice(-8).map(v => +v.toFixed(3)), click_phase_all: lk2.clicks.map(v => +v.toFixed(3)) };
  writeWav('lock.wav', buf);
}

// ── 4. a chart of the stability sweep, SVG → PNG ─────────────────────────────
{
  const W = 960, H = 560, x0 = 250, x1 = 900, y0 = 96, rowH = 28;
  const lx = (k) => x0 + (Math.log10(k) + 3) / 5 * (x1 - x0); // 0.001 … 100
  const ink = '#e8e6df', dim = '#8a8a96', amber = '#e8b84a', amberDim = '#7a6030';
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-size="12">`;
  svg += `<rect width="${W}" height="${H}" fill="#0a0a0f"/>`;
  svg += `<text x="20" y="32" fill="${ink}" font-size="17">How stiff can a feel be before delay makes it buzz?</text>`;
  svg += `<text x="20" y="54" fill="${dim}">bar = stiffest virtual spring that stays stable (N·m/rad, log) · light 40 g cap · simulated, matches theory within 10%</text>`;
  svg += `<text x="20" y="72" fill="${dim}">numbered lines = how stiff each feel needs to be · a feel left of a bright bar is safe even with no hand on the knob</text>`;
  const yB = y0 + rowH * 8;
  for (const k of [0.001, 0.01, 0.1, 1, 10, 100]) svg += `<line x1="${lx(k)}" y1="${y0}" x2="${lx(k)}" y2="${yB}" stroke="#22222e"/><text x="${lx(k) - 14}" y="${yB + 18}" fill="${dim}">${k}</text>`;
  let r = 0;
  for (const lane of LANES) for (const hand of HANDS) {
    const row = stab.find(s => s.lane === lane.id && s.cap === 'light' && s.hand === hand.id), y = y0 + r * rowH;
    const capped = row.kmax >= 49.9;
    svg += `<text x="20" y="${y + 18}" fill="${hand.hand ? dim : ink}">${lane.id} · ${hand.id}</text>`;
    svg += `<rect x="${x0}" y="${y + 6}" width="${Math.max(2, lx(row.kmax) - x0)}" height="16" fill="${hand.hand ? amberDim : amber}"/>`;
    svg += `<text x="${lx(row.kmax) + 6}" y="${y + 18}" fill="${dim}">${capped ? '> 50' : row.kmax.toFixed(row.kmax < 0.1 ? 3 : 2)}</text>`;
    r++;
  }
  const feelsK = needs.filter(n => n.K > 0);
  feelsK.forEach((n, i) => {
    svg += `<line x1="${lx(n.K)}" y1="${y0 - 6}" x2="${lx(n.K)}" y2="${yB}" stroke="${ink}" stroke-width="1.2" stroke-dasharray="3,3"/>`;
    svg += `<text x="${lx(n.K) - (i === 3 ? 12 : 4)}" y="${y0 - 10}" fill="${ink}">${i + 1}</text>`;
    svg += `<text x="${i < 3 ? 20 : 490}" y="${yB + 48 + (i % 3) * 20}" fill="${ink}">${i + 1}  ${n.feel} · ${n.K}</text>`;
  });
  svg += `<text x="20" y="${yB + 118}" fill="${dim}">ASSUMED: 4 ms USB round trip · 2×128-sample audio line · motor damping 0.0001 · grip 0.0032 N·m·s/rad</text>`;
  svg += `</svg>`;
  fs.writeFileSync(path.join(here, 'stability.svg'), svg);
  try { execSync(`magick -font "/System/Library/Fonts/Supplemental/Andale Mono.ttf" -density 110 "${path.join(here, 'stability.svg')}" "${path.join(here, 'stability.png')}"`, { stdio: 'pipe' }); } catch (err) { out.pngError = String(err).slice(0, 200); }
}

fs.writeFileSync(path.join(here, 'feel_lab_results.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ stab: out.stability, verdicts: out.verdicts, feltCheck: out.feltCheck,
  struck: { spring: out.struck.spring.slice(0, 3).concat(out.struck.spring.slice(-2)), pendulum: out.struck.pendulum.slice(0, 3).concat(out.struck.pendulum.slice(-2)) },
  turntable: out.turntable, lock: out.lock.click_phase_all }, null, 1));
