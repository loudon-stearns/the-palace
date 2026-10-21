// Haptic Handwheel — does the turntable hold 33⅓ with the motor's raw bumps?
//   node render_turntable_bumps.mjs → turntable_bumps.wav, turntable_bumps_results.json
// Box day's pretend knob read 28–31 rpm in headless Chrome with the raw bumps
// on. This asks why. Pretend motor as the box-day console has it: sticking
// friction, brake cancelled (the turntable's own), engine defaults otherwise.
// Four passes, one to four ticks: no bumps, raw bumps (box day, before the
// bench maps them), bumps cancelled (after), and raw bumps with a stiffer,
// less-smoothed speed loop (kv 0.1, 1 ms) that box day could try instead.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
new Function(fs.readFileSync(path.join(here, 'feel_engine.js'), 'utf8') +
  ';globalThis.makeEngine=makeEngine;globalThis.FEELS=FEELS;globalThis.BRAKES=BRAKES;globalThis.TAU=TAU;')();

const SR = 48000, RPM = (om) => om / TAU * 60;
const PASSES = [
  { id: 'no-bumps', label: 'no bumps', eng: { cog: 0 }, tt: {} },
  { id: 'raw', label: 'raw bumps (box day)', eng: { cog: 1, cogLeft: 1 }, tt: {} },
  { id: 'cancelled', label: 'bumps cancelled (after the bench)', eng: { cog: 1, cogLeft: 0.08 }, tt: {} },
  { id: 'raw-stiff', label: 'raw bumps, stiffer loop (kv 0.1, 1 ms)', eng: { cog: 1, cogLeft: 1 }, tt: { kv: 0.1, speedTf: 0.001 } },
];
// hands off 0–6 s; in the drag test a finger drags it nearly still 3–4 s
function run(p, seconds, drag, each) {
  const e = makeEngine({ fs: SR, stick: true, bMotor: BRAKES[0].b, ...p.eng });
  const tt = FEELS.turntable(p.tt); e.setFeel(tt);
  const w = tt.omega(), n = Math.round(seconds * SR);
  for (let i = 0; i < n; i++) { if (drag) e.s.brake = e.s.t >= 3 && e.s.t < 4 ? 0.12 : 0; e.step(); if (each) each(e, i, w); }
  return { e, w };
}
const out = { assumed: 'feel_engine defaults · sticking friction · brake cancelled · 40 g, 80 mm cap', rows: [] };
for (const p of PASSES) {
  let s = 0, s2 = 0, n = 0, mn = 9, mx = 0, th0 = null, frames = [];
  const per = Math.round(SR / 60);
  run(p, 6, false, (e, i, w) => {
    if (e.s.t < 2) return; if (th0 === null) th0 = e.s.th;
    const r = e.s.om / w; s += r; s2 += r * r; n++; mn = Math.min(mn, r); mx = Math.max(mx, r);
    if (i % per === 0) frames.push(RPM(e.s.om));
  });
  const m = s / n;
  // the console's new reading: angle travelled over the last half second
  const half = []; { let hist = []; run(p, 6, false, (e, i) => { if (i % 96) return; hist.push([e.s.t, e.s.th]); while (hist[0][0] < e.s.t - 0.5) hist.shift();
    if (e.s.t > 2.5 && i % per === 0) half.push(RPM((e.s.th - hist[0][1]) / (e.s.t - hist[0][0]))); }); }
  // drag test: peak after letting go, and time back within 1%, both read on
  // speed averaged over 50 ms (two bumps), so the wobble alone does not count
  const sp = []; run(p, 6, true, (e, i, w) => sp.push(e.s.om / w));
  const rel = sp.slice(4 * SR, Math.round(5.9 * SR)); const smooth = rel.map((_, i) => { const a = rel.slice(Math.max(0, i - 2400), i + 1); return a.reduce((x, y) => x + y, 0) / a.length; });
  let settle = 0; for (let i = smooth.length - 1; i >= 0; i--) if (Math.abs(smooth[i] - 1) > 0.01) { settle = (i + 1) / SR; break; }
  out.rows.push({ pass: p.label, trueAvgRpm: +(m * 100 / 3).toFixed(2),
    wobbleRangePct: `${(mn * 100).toFixed(0)}–${(mx * 100).toFixed(0)}`, wobbleRmsPct: +(Math.sqrt(s2 / n - m * m) * 100).toFixed(1),
    oneFrameReadsRpm: `${Math.min(...frames).toFixed(1)}–${Math.max(...frames).toFixed(1)}`,
    halfSecondReadsRpm: `${Math.min(...half).toFixed(2)}–${Math.max(...half).toFixed(2)}`,
    afterDragPeakPct: +(Math.max(...smooth) * 100).toFixed(0), afterDragBackWithin1pctMs: +(settle * 1000).toFixed(0) });
}
// how fast the wobble goes by: 84 bumps a turn at 33⅓ rpm
out.bumpHz = +(84 * (100 / 3) / 60).toFixed(1);
fs.writeFileSync(path.join(here, 'turntable_bumps_results.json'), JSON.stringify(out, null, 1));

// ── sound: the riff on the platter, four passes ──────────────────────────────
const loop = (() => {
  const len = SR * 2, L = new Float32Array(len), notes = [45, 52, 57, 60, 57, 52, 55, 50];
  notes.forEach((m, i) => { const f = 440 * 2 ** ((m - 69) / 12), st = i * len / 8;
    for (let j = 0; j < len / 8; j++) { const t = j / SR; L[st + j] += Math.exp(-t * 7) * (Math.sin(TAU * f * t) + 0.4 * Math.sin(TAU * 2 * f * t) + 0.2 * Math.sin(TAU * 3 * f * t)); } });
  return L;
})();
{
  const seg = 6, gap = 0.6, L = new Float32Array(Math.round(PASSES.length * (seg + gap) * SR));
  PASSES.forEach((p, vi) => {
    const off = Math.round(vi * (seg + gap) * SR); let lp = 0;
    for (let k = 0; k <= vi; k++) for (let i = 0; i < 400; i++) L[off + Math.round(k * 0.09 * SR) + i] += 0.5 * Math.exp(-i / 60) * Math.sin(TAU * 2000 * i / SR);
    run(p, seg, false, (e, i, w) => { if (i < 0.4 * SR) return; lp = (lp + e.s.om / w) % loop.length; if (lp < 0) lp += loop.length; L[off + i] += 0.5 * loop[Math.floor(lp)]; });
  });
  let pk = 0; for (const x of L) pk = Math.max(pk, Math.abs(x));
  const b = Buffer.alloc(44 + L.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + L.length * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28);
  b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(L.length * 2, 40);
  for (let i = 0; i < L.length; i++) b.writeInt16LE(Math.round(L[i] / pk * 0.89 * 32767), 44 + i * 2);
  fs.writeFileSync(path.join(here, 'turntable_bumps.wav'), b);
}
console.log(JSON.stringify(out, null, 1));
