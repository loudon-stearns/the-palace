// Haptic Handwheel — the turntable holds its speed (sketch 3 of the feel lab).
//   node render_turntable.mjs  → turntable_results.json, turntable_hold.wav,
//                                turntable_hold.svg, and .png via plot_turntable.py
// The feel map found the turntable idling slow: 88% of 33⅓ with the motor's
// brake cancelled, 52% with it on. A speed loop with only a proportional push
// always sits short by friction ÷ gain. The fix is a slow correction that
// learns the missing push. Its risk is the hand: hold the platter and an
// ordinary integral learns to shove, then surges when you let go. So it only
// learns near speed, and it knows the cost of spinning from the bench. This
// asks four versions the same questions.
// Pretend motor as in render_feel_map.mjs: Jrotor 5e-5, friction 0.004 N·m.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
new Function(fs.readFileSync(path.join(here, 'feel_engine.js'), 'utf8') +
  ';globalThis.makeEngine=makeEngine;globalThis.FEELS=FEELS;globalThis.BRAKES=BRAKES;globalThis.TAU=TAU;')();

const MOTOR = { Jrotor: 5e-5, tauC: 0.004 };
const SR = 48000;
const VERSIONS = [
  { id: 'push-only', label: 'push only (cycle 6)', o: { ki: 0, ffB: 0, ffC: 0 } },
  { id: 'always-learns', label: 'ordinary slow correction', o: { ki: 0.1, gate: 1e9, trim: 0.06, ffB: 0, ffC: 0 } },
  { id: 'learns-near-speed', label: 'learns only near speed', o: { ki: 0.1, ffB: 0, ffC: 0 } },
  { id: 'knows-the-cost', label: 'knows the cost + trims', o: { ki: 0.1 } },
];
// the bench will be wrong by some amount: what if its numbers are 30% low, or 30% high?
const MISREAD = [0.7, 1.3];
// The scene: spinning hands off, a finger drags it hard for one second
// (0.12 N·m·s/rad, nearly stopped), let go; later a hand scratches it back and forth.
const scene = (e, t) => {
  e.s.brake = t >= 3 && t < 4 ? 0.12 : 0;
  e.s.hand = t >= 6.5 && t < 7.5; e.s.handTarget = e.s.handTarget0 + 0.6 * Math.sin(TAU * 3 * (t - 6.5));
  if (t < 6.5) e.s.handTarget0 = e.s.th;
};
function run(version, b, seconds, audio) {
  const tt = FEELS.turntable(version.o);
  const e = makeEngine({ fs: SR, loopHz: 10000, ...MOTOR, bMotor: b });
  e.setFeel(tt); e.s.handTarget0 = 0;
  const w = tt.omega(), n = Math.round(seconds * SR), sp = [];
  for (let i = 0; i < n; i++) { scene(e, e.s.t); e.step(); sp.push(e.s.om / w); if (audio) audio(e, i, w); }
  const at = (t0, t1) => { const a = sp.slice(Math.round(t0 * SR), Math.round(t1 * SR)); return a.reduce((x, y) => x + y, 0) / a.length; };
  // after the drag: peak speed, and how long until it stays within 1% of 33⅓
  const rel = sp.slice(4 * SR, Math.round(6.4 * SR));
  let settle = null; for (let i = rel.length - 1; i >= 0; i--) if (Math.abs(rel[i] - 1) > 0.01) { settle = (i + 1) / SR; break; }
  const relS = sp.slice(Math.round(7.5 * SR), Math.round(9.9 * SR));
  let settleS = null; for (let i = relS.length - 1; i >= 0; i--) if (Math.abs(relS[i] - 1) > 0.01) { settleS = (i + 1) / SR; break; }
  return { idlePct: at(2, 3) * 100, heldPct: at(3.5, 4) * 100, afterDragPeakPct: Math.max(...rel) * 100,
    afterDragSettleMs: settle === null ? 0 : settle * 1000, afterScratchPeakPct: Math.max(...relS) * 100,
    afterScratchSettleMs: settleS === null ? 0 : settleS * 1000, endPct: at(9.5, 10) * 100, trace: sp.filter((_, i) => i % 480 === 0) };
}
const out = { assumed: { ...MOTOR, cap: '40 g, 80 mm', kv: 0.01, ki: 0.1, gate: '20% of 33⅓', trim: 0.02, speedTf: '5 ms', torqueCap: 0.06 }, rows: [] };
for (const br of [BRAKES[0], BRAKES[1], BRAKES[2]]) for (const v of VERSIONS) {
  const r = run(v, br.b, 10);
  out.rows.push({ brake: br.id, version: v.id, ...Object.fromEntries(Object.entries(r).filter(([k]) => k !== 'trace').map(([k, x]) => [k, +x.toFixed(1)])) });
  if (br.id === 'cancelled') out[`trace_${v.id}`] = r.trace;
}
// the bench misreads the motor: feed forward from numbers 30% off
out.misread = [];
for (const br of [BRAKES[0], BRAKES[2]]) for (const m of MISREAD) {
  const r = run({ o: { ki: 0.1, ffB: br.b * m, ffC: MOTOR.tauC * m } }, br.b, 10);
  const r0 = run({ o: { ki: 0, ffB: br.b * m, ffC: MOTOR.tauC * m } }, br.b, 10);
  out.misread.push({ brake: br.id, benchReadsAs: m, idlePctNoTrim: +r0.idlePct.toFixed(1), idlePct: +r.idlePct.toFixed(1), endPct: +r.endPct.toFixed(1),
    afterDragPeakPct: +r.afterDragPeakPct.toFixed(1), afterDragSettleMs: +r.afterDragSettleMs.toFixed(0) });
}
// how fast it should learn: a ki sweep, brake cancelled, learns near speed
out.kiSweep = [0.03, 0.1, 0.3, 1].map(ki => { const r = run({ o: { ki, ffB: BRAKES[0].b * 0.7, ffC: MOTOR.tauC * 0.7 } }, BRAKES[0].b, 10);
  return { ki, idlePct: +r.idlePct.toFixed(1), afterDragPeakPct: +r.afterDragPeakPct.toFixed(1), afterDragSettleMs: +r.afterDragSettleMs.toFixed(0) }; });
// how long from a cold start (switching the feel on) to 33⅓, each version
out.spinUpMs = VERSIONS.map(v => { const tt = FEELS.turntable(v.o), e = makeEngine({ fs: SR, loopHz: 10000, ...MOTOR, bMotor: BRAKES[0].b });
  e.setFeel(tt); let t99 = null; for (let i = 0; i < 4 * SR; i++) { e.step(); if (t99 === null && e.s.om >= 0.99 * tt.omega()) t99 = e.s.t; }
  return { version: v.id, ms: t99 === null ? null : +(t99 * 1000).toFixed(0) }; });

// ── sound: the riff on the platter, four passes, one per version ────────────
const loop = (() => {
  const len = SR * 2, L = new Float32Array(len), notes = [45, 52, 57, 60, 57, 52, 55, 50];
  notes.forEach((m, i) => { const f = 440 * 2 ** ((m - 69) / 12), st = i * len / 8;
    for (let j = 0; j < len / 8; j++) { const t = j / SR; L[st + j] += Math.exp(-t * 7) * (Math.sin(TAU * f * t) + 0.4 * Math.sin(TAU * 2 * f * t) + 0.2 * Math.sin(TAU * 3 * f * t)); } });
  return L;
})();
{
  const seg = 10, gap = 0.6, L = new Float32Array(Math.round((VERSIONS.length * (seg + gap)) * SR));
  VERSIONS.forEach((v, vi) => {
    const off = Math.round(vi * (seg + gap) * SR); let lp = 0;
    // one to four ticks mark the pass
    for (let k = 0; k <= vi; k++) for (let i = 0; i < 400; i++) L[off + Math.round(k * 0.09 * SR) + i] += 0.5 * Math.exp(-i / 60) * Math.sin(TAU * 2000 * i / SR);
    run(v, BRAKES[0].b, seg, (e, i, w) => {
      if (i < 0.4 * SR) return;
      lp = (lp + e.s.om / w) % loop.length; if (lp < 0) lp += loop.length;
      L[off + i] += 0.5 * loop[Math.floor(lp)];
    });
  });
  let pk = 0; for (const x of L) pk = Math.max(pk, Math.abs(x));
  const b = Buffer.alloc(44 + L.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + L.length * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28);
  b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(L.length * 2, 40);
  for (let i = 0; i < L.length; i++) b.writeInt16LE(Math.round(L[i] / pk * 0.89 * 32767), 44 + i * 2);
  fs.writeFileSync(path.join(here, 'turntable_hold.wav'), b);
}

// ── chart: platter speed over the scene, four versions, brake cancelled ─────
{
  const W = 1040, H = 470, x0 = 70, x1 = 1010, y0 = 380, y1 = 90;
  const sx = t => x0 + (t / 10) * (x1 - x0), sy = p => y0 - ((p - 0) / 1.2) * (y0 - y1);
  const COL = ['#8a8a96', '#c8261a', '#5a8fb8', '#e8b84a'];
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="Andale Mono, monospace"><rect width="${W}" height="${H}" fill="#0a0a0f"/>`;
  svg += `<text x="20" y="34" fill="#e8e6df" font-size="17">Turntable: platter speed, as a share of 33 1/3 rpm</text>`;
  svg += `<text x="20" y="56" fill="#8a8a96" font-size="12">pretend motor, brake cancelled · finger drags it 3–4 s · hand scratches it 6.5–7.5 s</text>`;
  [0, 0.5, 1].forEach(p => { svg += `<line x1="${x0}" y1="${sy(p)}" x2="${x1}" y2="${sy(p)}" stroke="#23232c"/><text x="20" y="${sy(p) + 4}" fill="#8a8a96" font-size="11">${p * 100}%</text>`; });
  [[3, 4], [6.5, 7.5]].forEach(([a, b]) => { svg += `<rect x="${sx(a)}" y="${y1}" width="${sx(b) - sx(a)}" height="${y0 - y1}" fill="#16161d"/>`; });
  VERSIONS.forEach((v, i) => {
    const tr = out[`trace_${v.id}`];
    // a path, not a polyline: ImageMagick's SVG reader drops long polylines
    svg += `<path fill="none" stroke="${COL[i]}" stroke-width="2" d="${tr.map((p, k) => `${k ? 'L' : 'M'}${sx(k * 0.01).toFixed(1)} ${sy(Math.max(-0.05, Math.min(1.25, p))).toFixed(1)}`).join(' ')}"/>`;
    svg += `<rect x="${x0 + i * 240}" y="${H - 52}" width="14" height="14" fill="${COL[i]}"/><text x="${x0 + 22 + i * 240}" y="${H - 40}" fill="#c9c6bd" font-size="12">${v.label}</text>`;
  });
  svg += `</svg>`;
  fs.writeFileSync(path.join(here, 'turntable_hold.svg'), svg);
}
// The PNG comes from matplotlib (plot_turntable.py): this machine's ImageMagick
// SVG reader draws no strokes, so the lines vanished from the PNG.
out.traces = Object.fromEntries(VERSIONS.map(v => [v.label, out[`trace_${v.id}`]]));
for (const v of VERSIONS) delete out[`trace_${v.id}`];
fs.writeFileSync(path.join(here, 'turntable_results.json'), JSON.stringify(out, null, 1));
try { execSync(`python3 "${path.join(here, 'plot_turntable.py')}"`, { stdio: 'pipe' }); } catch (err) { console.error('png:', String(err).slice(0, 300)); }
const { traces, ...summary } = out;
console.log(JSON.stringify(summary, null, 1));
