// title: Reverb ↔ Space-Time — rich — checks
// born: 2026-11-03
// links: [[Reverb ↔ Space-Time]] (connects-to · rich-face-workshop) · re-checks the four made pieces listed in [[Reverb ↔ Space-Time — rich.json]]
// forward_vector: I re-run every number the four made pieces and the manifest's offers state, on each piece's own engine (its <script id="engine">), so a challenger or a re-tune can check them without a browser. Run: node "Reverb ↔ Space-Time — rich — checks.mjs" (about ten seconds).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const src = (what) => readFileSync(join(here, `Reverb ↔ Space-Time — rich — ${what}.html`), 'utf8').match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const engine = (what, names) => new Function(`${src(what)}; return { ${names} };`)();
const f2 = (x) => x.toFixed(2), ms = (t) => (1000 * t).toFixed(1) + ' ms';

// ── the shared room engine is the same in every piece ──
{ const base = src('one clap, one room').trim(); const same = ['a delay becomes a place', 'sitting in a box', 'where are you'].map((w) => src(w).trim().startsWith(base));
  console.log('shared room engine identical in all four pieces:', same.every(Boolean)); }

// ── one clap, one room ──
{ const E = engine('one clap, one room', 'C, stats, wallEcho, firstOrder, renderRoom');
  console.log('\none clap, one room');
  console.log(`  a wall 10 m away: path ${E.wallEcho(10).path} m, echo ${ms(E.wallEcho(10).t)}; 29 ms is a ${(0.029 * E.C).toFixed(2)} m path, a wall ${(0.029 * E.C / 2).toFixed(2)} m away`);
  console.log(`  bathroom 5–10 ms ↔ wall ${f2(0.005 * E.C / 2)}–${f2(0.010 * E.C / 2)} m · cathedral 50–100 ms ↔ wall ${f2(0.05 * E.C / 2)}–${f2(0.1 * E.C / 2)} m`);
  const r = { L: 12, W: 8, H: 5 }, pos = [0.37, 0.42], at = (room) => [room.L * pos[0], room.W * pos[1], Math.min(1.5, room.H / 2)];
  const run = (room, a) => { const p = at(room), R = E.renderRoom({ room, src: p, rcv: [p[0], p[1] + 0.5, p[2]], a, fs: 48000 }), fw = Math.min(...E.firstOrder(room, p).filter((e) => e.wall !== 'floor' && e.wall !== 'ceiling').map((e) => e.t)), fl = E.firstOrder(room, p).find((e) => e.wall === 'floor').t; return { room, st: R.stats, fit: R.fit, fw, fl }; };
  const rows = { 'this room': run(r, 0.2), 'every side ×2': run({ L: 24, W: 16, H: 10 }, 0.2), 'same volume, low and wide': run({ L: 12 * Math.SQRT2, W: 8 * Math.SQRT2, H: 2.5 }, 0.2), 'same room, hard surfaces': run(r, 0.03) };
  for (const [k, v] of Object.entries(rows)) console.log(`  ${k.padEnd(26)} V ${v.st.V.toFixed(0).padStart(5)} S ${v.st.S.toFixed(0).padStart(5)} · first wall echo ${ms(v.fw)} · floor ${ms(v.fl)} · Sabine ${f2(v.st.sabine)} s · Eyring ${f2(v.st.eyring)} s · box first 15 dB ${f2(v.fit.early)} s, later ${f2(v.fit.late)} s`);
  for (const a of [0.03, 0.08, 0.2, 0.45]) { const v = run(r, a); console.log(`  12 × 8 × 5, α ${a}: Sabine ${f2(v.st.sabine)} · Eyring ${f2(v.st.eyring)} · box first 15 dB ${f2(v.fit.early)} · later ${f2(v.fit.late)}`); } }

// ── a delay becomes a place ──
{ const E = engine('a delay becomes a place', 'C, monoNulls, itdAngle');
  console.log('\na delay becomes a place');
  console.log(`  Woodworth: largest delay ${(1e6 * 0.0875 / E.C * (Math.PI / 2 + 1)).toFixed(0)} µs; 0.4 ms → ${(E.itdAngle(0.0004) * 180 / Math.PI).toFixed(0)}°; 0.6 ms = ${f2(0.0006 * E.C)} m; 20 ms = ${(0.02 * E.C).toFixed(1)} m`);
  for (const d of [0.01, 0.025]) { const n = E.monoNulls(d, 20000); console.log(`  ${d * 1000} ms summed to mono: silent at ${n.slice(0, 3).map((f) => f.toFixed(0)).join(', ')}… Hz, ${n.length} notches below 20 kHz`); } }

// ── sitting in a box ──
{ const E = engine('sitting in a box', 'C, stats, modes, roomIR, spectrumOf, loopOf, peaks, modeDistance, standOut, rng, ROOM, ALPHA, MICS, LFS, LN');
  const st = E.stats(E.ROOM, E.ALPHA), fs = st.schroeder, M = E.modes(E.ROOM, fs), H = {}; for (const m of ['here', 'there']) H[m] = E.spectrumOf(E.roomIR(E.MICS[m], E.LFS), E.LN);
  const L = (m, s) => E.loopOf(H[m], s), A = L('here', true), B = L('there', true), top = (lp, n, lo, hi, c) => E.peaks(lp.mag, n, E.LFS, E.LN, lo, hi, c);
  const r = E.rng(11), rand = Array.from({ length: 400 }, () => 40 + r() * (fs - 40)), avg = (lp, P, lo, hi) => P.reduce((s, p) => s + E.standOut(lp.mag, E.LN, p.f, lo, hi), 0) / P.length;
  const bA = top(A, 1, 40, fs, 8), aA = top(A, 1, 500, 5000, 8), dens = (f) => 4 * Math.PI * f * f * st.V / E.C ** 3 * (2.2 / st.sabine);
  console.log('\nsitting in a box');
  console.log(`  Sabine ${f2(st.sabine)} s · Schroeder ${fs.toFixed(0)} Hz · ${M.length} modes below it · modes per peak width: ${dens(100).toFixed(1)} at 100 Hz, ${dens(1000).toFixed(0)} at 1 kHz`);
  console.log(`  8 strongest peaks below Schroeder: ${E.modeDistance(bA.map((p) => p.f), M).toFixed(2)} Hz from a computed mode (400 random: ${E.modeDistance(rand, M).toFixed(2)} Hz); worst ${Math.max(...bA.map((p) => E.modeDistance([p.f], M))).toFixed(2)} Hz`);
  console.log(`  above the band median, below Schroeder: here +${avg(A, bA, 40, fs).toFixed(1)} dB, mic moved +${avg(B, bA, 40, fs).toFixed(1)} dB · 500 Hz–5 kHz: here +${avg(A, aA, 500, 5000).toFixed(1)} dB, mic moved +${avg(B, aA, 500, 5000).toFixed(1)} dB`);
  for (const n of [1, 8, 32]) { const P = top(A, n, 20, 5000, 2); console.log(`  n = ${n}: the winner ${P[0].f.toFixed(1)} Hz here (${(P[0].db - P[1].db).toFixed(1)} dB over the next) · ${top(B, n, 20, 5000, 1)[0].f.toFixed(1)} Hz moved`); }
  for (const m of ['here', 'there']) { const w = top(L(m, false), 32, 20, 5000, 1)[0]; let b = M[0]; for (const q of M) if (Math.abs(q.f - w.f) < Math.abs(b.f - w.f)) b = q; console.log(`  room alone, n = 32, mic ${m}: ${w.f.toFixed(1)} Hz${w.f < fs ? `, mode (${b.n.join(', ')}) at ${b.f.toFixed(2)} Hz` : ''}`); } }

// ── where are you ──
{ const E = engine('where are you', 'stats, ROOMS');
  console.log('\nwhere are you');
  for (const R of E.ROOMS.slice(1)) { const s = E.stats(R.room, R.a); console.log(`  ${R.name.padEnd(13)} ${R.room.L} × ${R.room.W} × ${R.room.H} m, α ${R.a}: V ${s.V.toFixed(0)} m³ · Sabine ${f2(s.sabine)} s`); } }
