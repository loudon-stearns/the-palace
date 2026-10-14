// Runs study v1.11's own engine headless: the bow across position x force,
// at five pitches, the crunch check the chart uses, lift-off clicks, and a
// bow tour WAV. Compares v1.10 on the same probes.
// usage: node bow_probe.mjs
import fs from 'node:fs'; import path from 'node:path';
import { loadSrc, engine, summarize, periodicity, SR } from './bow_lab.mjs';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const V11 = loadSrc(path.join(HERE, '..', 'study-v1.11-the-bow-lets-go', 'index.html'));
const V10 = loadSrc(path.join(HERE, '..', 'study-v1.10-the-overtones-run-sharp', 'index.html'));
const peakDb = (x, a = 0, b = x.length) => { let m = 0; for (let i = a; i < b; i++) m = Math.max(m, Math.abs(x[i])); return +(20 * Math.log10(m + 1e-12)).toFixed(1); };
// the chart's crunch measure: how much the hold pattern changes look to look
function irregular(posts) {
  const tr = posts.filter(m => m.type === 'bowtrace' && !m.off).slice(-40); let irr = 0, prev = null;
  for (const t of tr) { const st = Array.from(t.grip, g => g >= 0.98);
    if (prev) { let d = 0; for (let i = 0; i < st.length; i++) if (st[i] !== prev[i]) d++; irr = 0.8 * irr + 0.2 * d / st.length; } prev = st; }
  return +irr.toFixed(3);
}
function bow(src, o, sec = 1.5) {
  const p = engine(src); p.send({ type: 'params', freq: o.freq ?? 196 }); p.send({ type: 'view', mode: 'strobe' });
  p.send({ type: 'bow', on: true, speed: o.speed ?? 0.5, force: o.force ?? 0.6, position: o.position ?? 0.74 });
  const x = p.run(sec); const t = p.posts.filter(m => m.type === 'bowtrace').pop();
  return { p, x, t, ...summarize(t), periodic: periodicity(x, o.freq ?? 196), irr: irregular(p.posts), peak: peakDb(x, x.length >> 1) };
}
const out = { position_sweep: [], force_sweep: [], pitch_sweep: [], v10_compare: [], grid: {} };
for (const position of [0.55, 0.6, 0.66, 0.74, 0.8, 0.85, 0.9, 0.93]) {
  const a = bow(V11, { position }), b = bow(V10, { position, force: 0.7 });
  out.position_sweep.push({ position, helmholtz_hold_pct: Math.round(100 * position), v11_hold_pct: a.hold_pct, v11_lets: a.lets, v11_plateau: a.plateau_over_bow, v10_hold_pct: b.hold_pct, v10_lets: b.lets, v10_plateau: b.plateau_over_bow });
}
for (const force of [0.1, 0.2, 0.3, 0.45, 0.6, 0.75, 0.9, 0.95, 1.0]) {
  const a = bow(V11, { force }), b = bow(V10, { force: force === 0.6 ? 0.7 : force });
  out.force_sweep.push({ force, v11: { hold: a.hold_pct, lets: a.lets, periodic: a.periodic, irr: a.irr, peak: a.peak }, v10: { hold: b.hold_pct, lets: b.lets, periodic: b.periodic, peak: b.peak } });
}
for (const freq of [82, 110, 196, 440, 659]) {
  const a = bow(V11, { freq }, 4); const off = a.p.bowOff; a.p.send({ type: 'bow', on: false }); const y = a.p.run(0.5);
  out.pitch_sweep.push({ freq, hold: a.hold_pct, lets: a.lets, plateau: a.plateau_over_bow, periodic: a.periodic, peak: a.peak, peak_lift: peakDb(y, 0, 4800), nan: a.x.some(Number.isNaN) });
}
for (const pos of [0.55, 0.6, 0.66, 0.74, 0.8, 0.85, 0.9, 0.93]) out.grid[pos] = [0.3, 0.45, 0.6, 0.75, 0.9, 1.0].map(force => { const r = bow(V11, { position: pos, force }, 1.2); return `${r.hold_pct}/${r.lets}${r.irr > 0.04 ? '~' : ''}`; });
console.table(out.position_sweep); console.log(JSON.stringify(out.force_sweep)); console.table(out.pitch_sweep); console.log(out.grid);
// the tour: default · bow walking from 0.6 to 0.9 in steps · force light, sing, crunch
const parts = [], tour = [];
const seg = (label, o, sec) => { const r = bow(V11, o, sec); r.p.send({ type: 'bow', on: false }); const tail = r.p.run(0.4); const x = new Float32Array(r.x.length + tail.length); x.set(r.x); x.set(tail, r.x.length); parts.push(x); tour.push({ label, ...o, hold_pct: r.hold_pct, lets: r.lets, irr: r.irr, peak: r.peak }); };
seg('default: sings', {}, 2.5);
for (const position of [0.6, 0.74, 0.85, 0.9]) seg('position ' + position, { position }, 2);
seg('force 0.3: breaks up', { force: 0.3 }, 2.5); seg('force 0.6: sings', { force: 0.6 }, 2.5); seg('force 1.0: crunches', { force: 1.0 }, 2.5);
const N = parts.reduce((a, x) => a + x.length, 0), all = new Float32Array(N); let o = 0; for (const x of parts) { all.set(x, o); o += x.length; }
const buf = Buffer.alloc(44 + N * 2); buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(all[i] * 32767))), 44 + i * 2);
fs.writeFileSync(path.join(HERE, 'bow-tour.wav'), buf);
out.tour = tour; console.table(tour);
fs.writeFileSync(path.join(HERE, 'bow-probe.json'), JSON.stringify(out, null, 1));
