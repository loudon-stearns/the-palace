// Haptic Handwheel — feel map (sketch 2 of the feel lab).
//   node render_feel_map.mjs   → feel_map_results.json, frets_landing.wav,
//                                struck_brakes.wav, feel_map.svg/.png
// Two questions the bench numbers left open, asked of the same engine:
//  1. The motor's own brake helps stiff feels stay calm over a cable, and it
//     kills the ring a struck spring wants. Which feels want it on, which off,
//     and where can each one then be computed?
//  2. The motor's 84 bumps a turn: do frets still land in tune with them, and
//     how much does cancelling them in firmware buy?
// Every number rests on a pretend motor (Jrotor 5e-5, friction 0.004 N·m, the
// bench analyzer's fake cogging). The shape of the answer is the point.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
new Function(fs.readFileSync(path.join(here, 'feel_engine.js'), 'utf8') +
  ';globalThis.makeEngine=makeEngine;globalThis.FEELS=FEELS;globalThis.BRAKES=BRAKES;globalThis.TAU=TAU;')();

const MOTOR = { Jrotor: 5e-5, tauC: 0.004 };   // motor-numbers midpoint; pretend-motor friction
const out = { assumed: { ...MOTOR, cap: '40 g, 80 mm', cogging: 'bench_analyze fake_cog, peak ≈0.0083 N·m', cogLeftAfterCancel: 0.08 } };

// ── 1. stiffness that stays calm with no hand on it, per brake and place ─────
const LANES = [
  { id: 'device-1k', label: 'on the knob, 1 kHz', loopHz: 1000, delayMs: 0 },
  { id: 'usb-max', label: 'USB to Max, ~4 ms', loopHz: 1000, delayMs: 4 },
];
function grows(K, lane, b) {
  const e = makeEngine({ fs: 96000, loopHz: lane.loopHz, delayMs: lane.delayMs, tauC: 0, quantize: false,
    bMotor: b, Jrotor: MOTOR.Jrotor, tauMax: 1e6 });
  e.setFeel(FEELS.struck({ k: K }));
  e.s.th = 0.05;
  const dur = Math.max(0.6, 30 / (Math.sqrt(K / e.J) / TAU));
  const n = Math.round(dur * e.P.fs), w = Math.round(n / 5);
  let a0 = 0, a1 = 0;
  for (let i = 0; i < n; i++) {
    e.step(); const v = Math.abs(e.s.th);
    if (!isFinite(v) || v > 10) return true;
    if (i < w) a0 = Math.max(a0, v); else if (i >= n - w) a1 = Math.max(a1, v);
  }
  return a1 > a0;
}
function kMax(lane, b) {
  let lo = 1e-4, hi = 50;
  if (!grows(hi, lane, b)) return hi;
  for (let i = 0; i < 20; i++) { const m = Math.sqrt(lo * hi); if (grows(m, lane, b)) hi = m; else lo = m; }
  return Math.sqrt(lo * hi);
}
out.kmax = BRAKES.map(br => ({ brake: br.id, b: br.b, ...Object.fromEntries(LANES.map(l => [l.id, kMax(l, br.b)])) }));

// ── 2. what each brake does to the feels that move by themselves ─────────────
function run(opts, feel, seconds, setup, each) {
  const e = makeEngine({ fs: 48000, loopHz: 10000, ...MOTOR, ...opts });
  e.setFeel(feel); if (setup) setup(e);
  const n = Math.round(seconds * e.P.fs);
  for (let i = 0; i < n; i++) { e.step(); if (each) each(e, i); }
  return e;
}
const behaviour = BRAKES.map(br => {
  // struck spring: how many wobbles you hear before the swing falls to a tenth
  let wob = 0, pk = 0, p2 = 0;
  run({ bMotor: br.b }, FEELS.struck({ k: 0.085 }), 3, e => { e.s.th = 0.5; }, (e) => {
    const x = e.s.th;
    if (p2 <= 0 && x > 0) pk = 0;
    if (x > 0) pk = Math.max(pk, x);
    if (p2 > 0 && x <= 0 && pk > 0.05) wob++;
    p2 = x;
  });
  wob += 1; // the strike's own first swing (starts at +0.5, falls through zero)
  // haptic filter: one three-semitone step, how long the glide takes (10→90%) and its overshoot
  const step = (3 / 24) * TAU; let t10 = null, t90 = null, over = 0;
  run({ bMotor: br.b }, FEELS.follow({ notes: [3], secPerNote: 99 }), 1.5, null, (e) => {
    const f = e.s.th / step;
    if (t10 === null && f >= 0.1) t10 = e.s.t; if (t90 === null && f >= 0.9) t90 = e.s.t; over = Math.max(over, f - 1);
  });
  // turntable: idle speed, hands off
  let sum = 0, cnt = 0; const tt = FEELS.turntable();
  run({ bMotor: br.b }, tt, 4, null, (e) => { if (e.s.t > 2) { sum += e.s.om; cnt++; } });
  return { brake: br.id, b: br.b, struckWobbles: wob, glideMs: t90 !== null ? (t90 - t10) * 1000 : null,
    glideOvershootPct: over * 100, turntablePct: (sum / cnt) / tt.omega() * 100 };
});
out.behaviour = behaviour;

// ── 3. frets landing in tune, with the motor's bumps ─────────────────────────
// The hand puts the knob somewhere and lets go. Where does the pitch settle?
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const BUMPS = [
  { id: 'none', label: 'no bumps (an ideal motor)', cog: 0, cogLeft: 1 },
  { id: 'raw', label: 'the motor\'s bumps, raw', cog: 1, cogLeft: 1 },
  { id: 'cancelled', label: 'bumps cancelled by the firmware', cog: 1, cogLeft: 0.08 },
  { id: 'cancelled+kick', label: 'bumps cancelled, plus a ridge kick', cog: 1, cogLeft: 0.08, kick: 0.006 },
];
const STARTS = Array.from({ length: 240 }, () => rnd() * TAU);
function land(bump, start, bMotor) {
  const e = run({ bMotor, cog: bump.cog, cogLeft: bump.cogLeft, stick: true }, FEELS.frets({ kick: bump.kick || 0 }), 1.2, e => { e.s.th = start; });
  const semis = (e.s.th / TAU) * 24;
  return (semis - Math.round(semis)) * 100; // cents
}
const pct = (a, q) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
out.landing = [];
for (const br of [BRAKES[0], BRAKES[2]]) for (const bump of BUMPS) {
  const c = STARTS.map(s0 => Math.abs(land(bump, s0, br.b)));
  out.landing.push({ brake: br.id, bumps: bump.id, medianCents: pct(c, 0.5), p95Cents: pct(c, 0.95), maxCents: Math.max(...c),
    over10: c.filter(x => x > 10).length / c.length });
}

// ── 4. the feel map: which brake each feel wants, and where it can then live ──
const kUsbLow = out.kmax.find(r => r.brake === 'low')['usb-max'];   // conservative: the low guess
const kUsbMid = out.kmax.find(r => r.brake === 'mid')['usb-max'];
const kDevOff = out.kmax.find(r => r.brake === 'cancelled')['device-1k'];
const where = (K, brakeOn) => {
  if (K === 0) return 'anywhere';
  if (brakeOn) return K <= kUsbLow ? 'Max is fine' : K <= kUsbMid ? 'Max, if the brake is the middle guess or stronger' : 'on the knob';
  return K <= kDevOff ? 'on the knob' : 'on the knob, 10 kHz';
};
const B = Object.fromEntries(behaviour.map(r => [r.brake, r]));
out.map = [
  { feel: 'frets, 24 a turn', K: 0.72, brake: 'on', why: 'calm matters, nothing should ring' },
  { feel: 'string bend', K: 0.79, brake: 'on', why: 'a held bend should sit still' },
  { feel: 'end stops, walls', K: 3, brake: 'on', why: 'the stiffest thing the knob does' },
  { feel: 'stepped values, 8 a turn (the context knob)', K: 0.03 * 8, brake: 'on', why: 'clicks you can count, no ring' },
  { feel: 'soft centring spring', K: 0.03, brake: 'on', why: 'a pitch wheel return should not wobble' },
  { feel: 'haptic filter (knob follows a melody)', K: 0.25, brake: 'on', why: `glide ${B.mid.glideMs?.toFixed(0)} ms with it, ${B.cancelled.glideMs?.toFixed(0)} ms and ${B.cancelled.glideOvershootPct.toFixed(0)}% overshoot without` },
  { feel: 'struck spring, struck pendulum', K: 0.085, brake: 'off', why: `${B.cancelled.struckWobbles} wobbles with it off, ${B.mid.struckWobbles} on` },
  { feel: 'turntable', K: 0, brake: 'off', why: `idles at ${B.cancelled.turntablePct.toFixed(0)}% off; on, ${B.mid.turntablePct.toFixed(0)}% at the middle guess but ${B.high.turntablePct.toFixed(0)}% at the strongest, where the brake costs more than the 0.06 N·m cap; a speed loop, not a spring` },
  { feel: 'LFO, the pitch, beat clicks', K: 0, brake: 'either', why: 'played into the hand; they don\'t depend on where it is' },
].map(r => ({ ...r, where: r.feel.startsWith('turntable') ? 'on the knob (speed loop)' : where(r.K, r.brake !== 'off') }));

// ── 5. sounds ────────────────────────────────────────────────────────────────
function writeWav(file, buf) {
  const n = buf.length, b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(48000, 24); b.writeUInt32LE(96000, 28);
  b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  let pk = 0; for (const v of buf) pk = Math.max(pk, Math.abs(v));
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round((buf[i] / (pk || 1)) * 0.89 * 32767), 44 + i * 2);
  fs.writeFileSync(file, b);
}
const SR = 48000, hz = m => 440 * 2 ** ((m - 69) / 12);
const tone = (arr, at, dur, midi, amp, ph0 = 0) => { const f = hz(midi); for (let i = 0; i < dur * SR; i++) { const t = i / SR, env = Math.min(1, t / 0.01) * Math.min(1, (dur - t) / 0.05);
  let y = 0; for (let h = 1; h <= 5; h++) y += Math.sin(TAU * h * f * t + ph0) / h; arr[Math.round(at * SR) + i] += amp * env * y; } };

// frets_landing.wav: one pass of eight let-gos per bump condition (a click, two, three,
// four mark the passes). Each landed note plays with the in-tune note beside it, so
// slow beating means the knob landed off pitch. Four of the eight let-gos start near
// a ridge between notes, where friction can leave the knob balanced.
{
  const ridge = STARTS.filter(s0 => Math.abs(land(BUMPS[0], s0, BRAKES[2].b)) > 10).slice(0, 4);
  const plain = STARTS.filter(s0 => !ridge.includes(s0)).slice(0, 4);
  const starts = [plain[0], ridge[0], plain[1], ridge[1], plain[2], ridge[2], plain[3], ridge[3]].filter(x => x !== undefined);
  out.landingWavStarts = starts;
  const per = 1.0, L = new Float32Array(Math.round((BUMPS.length * (starts.length * per + 0.8) + 0.5) * SR));
  let t0 = 0.5;
  BUMPS.forEach((bp, pi) => {
    for (let k = 0; k <= pi; k++) for (let i = 0; i < 400; i++) L[Math.round((t0 - 0.4 + k * 0.09) * SR) + i] += 0.6 * Math.exp(-i / 60) * Math.sin(TAU * 2000 * i / SR);
    starts.forEach((s0, i) => {
      const cents = land(bp, s0, BRAKES[2].b);
      const semis = ((s0 / TAU) * 24 % 12 + 12) % 12;
      const note = 57 + Math.round(semis);
      tone(L, t0 + i * per, per * 0.9, note + cents / 100, 0.25); tone(L, t0 + i * per, per * 0.9, note, 0.25, 0.3);
    });
    t0 += starts.length * per + 0.8;
  });
  writeWav(path.join(here, 'frets_landing.wav'), L);
}
// struck_brakes.wav: the same strike four times, brake cancelled → high guess.
{
  const seg = 1.6, L = new Float32Array(Math.round((BRAKES.length * seg + 0.3) * SR)); let ph = 0;
  BRAKES.forEach((br, bi) => {
    const e = makeEngine({ fs: SR, loopHz: 10000, ...MOTOR, bMotor: br.b, semisPerTurn: 6, basePitch: 57 });
    e.setFeel(FEELS.struck({ k: 0.085 })); e.s.th = 0.5;
    for (let i = 0; i < seg * SR; i++) {
      e.step(); const m = e.pitch(), env = Math.min(1, i / 200) * Math.min(1, (seg * SR - i) / 2000);
      ph += hz(m) / SR; ph -= Math.floor(ph); let y = 0; for (let h = 1; h <= 6; h++) y += Math.sin(TAU * h * ph) / h;
      L[Math.round(bi * seg * SR) + i] += 0.4 * env * y;
    }
  });
  writeWav(path.join(here, 'struck_brakes.wav'), L);
}

// ── 6. a chart: frets landing error per bump condition, and ring per brake ───
{
  const W = 1040, H = 490, rows = out.landing.filter(r => r.brake === 'mid');
  const maxC = Math.max(...rows.map(r => r.maxCents), 10), x0 = 340, xw = 520, sx = c => x0 + (c / maxC) * xw;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="Andale Mono, monospace"><rect width="${W}" height="${H}" fill="#0a0a0f"/>`;
  svg += `<text x="20" y="34" fill="#e8e6df" font-size="17">Frets: how far off pitch the knob lands after you let go (cents)</text>`;
  svg += `<text x="20" y="56" fill="#8a8a96" font-size="12">240 let-gos at random angles · pretend motor, brake on (middle guess) · bar = median, whisker = 95th %, dot = worst</text>`;
  rows.forEach((r, i) => {
    const y = 100 + i * 70, lab = BUMPS.find(b => b.id === r.bumps).label;
    svg += `<text x="20" y="${y + 6}" fill="#c9c6bd" font-size="13">${lab}</text>`;
    svg += `<rect x="${x0}" y="${y - 10}" width="${sx(r.medianCents) - x0}" height="20" fill="#e8b84a"/>`;
    svg += `<line x1="${x0}" y1="${y}" x2="${sx(r.p95Cents)}" y2="${y}" stroke="#b08a3a" stroke-width="3"/><circle cx="${sx(r.maxCents)}" cy="${y}" r="5" fill="#c8261a"/>`;
    svg += `<text x="${sx(r.maxCents) + 10}" y="${y + 5}" fill="#8a8a96" font-size="12">${r.medianCents.toFixed(1)} / ${r.p95Cents.toFixed(1)} / ${r.maxCents.toFixed(1)}</text>`;
  });
  const y2 = 400;
  svg += `<text x="20" y="${y2}" fill="#e8e6df" font-size="15">Struck spring: wobbles you hear before it dies to a tenth</text>`;
  behaviour.forEach((r, i) => { const x = 20 + i * 215;
    svg += `<text x="${x}" y="${y2 + 34}" fill="#c9c6bd" font-size="12">${BRAKES[i].label}</text><text x="${x}" y="${y2 + 64}" fill="#e8b84a" font-size="24">${r.struckWobbles}</text>`; });
  svg += `</svg>`;
  fs.writeFileSync(path.join(here, 'feel_map.svg'), svg);
  try { execSync(`magick -font "/System/Library/Fonts/Supplemental/Andale Mono.ttf" -density 110 "${path.join(here, 'feel_map.svg')}" "${path.join(here, 'feel_map.png')}"`, { stdio: 'pipe' }); } catch (err) { out.pngError = String(err).slice(0, 200); }
}

fs.writeFileSync(path.join(here, 'feel_map_results.json'), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ kmax: out.kmax, behaviour, landing: out.landing, map: out.map }, null, 1));
