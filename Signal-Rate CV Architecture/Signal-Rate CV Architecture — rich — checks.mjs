#!/usr/bin/env node
/*
  title: Signal-Rate CV Architecture — rich — checks
  born: 2026-11-03
  links: [[Signal-Rate CV Architecture]] (connects-to · rich-face-checks) · checks "Signal-Rate CV Architecture — rich — the leak on a jack.html" and "Signal-Rate CV Architecture — rich — the zero guard.html"
  forward_vector: I re-run every claim the two made pieces of the rich face show, on the engines inside
    those pieces (pulled out of their own HTML, never a copy), so a change to a piece that breaks a
    claim fails here, and I print the numbers the manifest's offers quote.

  usage: node "Signal-Rate CV Architecture — rich — checks.mjs" [--sr 44100]
*/
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ENTRY = 'Signal-Rate CV Architecture';
const read = (what) => readFileSync(join(HERE, `${ENTRY} — rich — ${what}.html`), 'utf8');
const between = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); if (i < 0 || j < 0) throw new Error('marker missing: ' + a); return src.slice(i, j + b.length); };
const jack = read('the leak on a jack'), guard = read('the zero guard');
const J = new Function(between(jack, '/* ENGINE:START', '/* ENGINE:END */') + '\n' + between(jack, '/* MEASURE:START', '/* MEASURE:END */') +
  '\nreturn { LeakJack, render, steadyTone, pitchSwing, residueDb };')();
const G = new Function(between(guard, '/* ENGINE:START', '/* ENGINE:END */') + '\n' + between(guard, '/* MEASURE:START', '/* MEASURE:END */') +
  '\nreturn { PlanStage2, classify, pulled, guardMap, inTuneFrom, silentUpTo, tuneEdge, MAP_TAUS, MAP_FREQS };')();

const srArg = process.argv.indexOf('--sr'), SR = srArg > 0 ? +process.argv[srArg + 1] : 48000;
let fails = 0;
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails++; };
const forbidden = ['rich:' + 'hush'];
for (const [name, src] of [['the leak on a jack', jack], ['the zero guard', guard]]) ok(!forbidden.some(f => src.includes(f)), `${name}: leaves hushing to the kit (never names its message)`);

console.log(`\nthe leak on a jack — at ${SR} Hz`);
{ // steps 1-2: a steady tau holds the pitch, at the whole-sample period a hard reset gives
  let worst = 0;
  for (const f of [110, 165, 220, 330, 440]) for (const t of [0.5, 1, 5, 15, 50]) { const s = J.steadyTone(f, t, SR); worst = Math.max(worst, Math.abs(s.P - Math.ceil(SR / f - 1e-9))); }
  ok(worst === 0, 'steady tau: every period is the dialled one rounded up to a whole sample (110–440 Hz, tau 0.5–50 ms)');
  const a = J.steadyTone(110, 0.5, SR), b = J.steadyTone(110, 50, SR), m = J.steadyTone(110, 5, SR);
  console.log(`         110 Hz: tau 0.5 ms → ${a.within20} harmonics within 20 dB, centroid ${a.centroidHz.toFixed(0)} Hz; 5 ms → ${m.within20}, ${m.centroidHz.toFixed(0)} Hz; 50 ms → ${b.within20}, ${b.centroidHz.toFixed(0)} Hz`);
  ok(a.within20 > m.within20 && m.within20 >= b.within20 && a.centroidHz > b.centroidHz, 'leakier is brighter, with the pitch held (the "warm to bright" sweep runs toward the leaky end)');
}
{ // step 3: the built drive bends the pitch when tau moves inside a cycle; the tracking drive does not
  const row = [];
  for (const hz of [0.1, 0.25, 0.5, 2, 8]) {
    const st = J.pitchSwing({ freq: 110, lfo: true, lfoHz: hz, lo: 1, hi: 15, drive: 'steady' }, SR).s;
    const tr = J.pitchSwing({ freq: 110, lfo: true, lfoHz: hz, lo: 1, hi: 15, drive: 'track' }, SR).s;
    row.push({ hz, st, tr });
    console.log(`         LFO ${hz} Hz on tau 1–15 ms at 110 Hz: built drive period ${st.lo}–${st.hi} (${st.cents.toFixed(1)} cents); tracking ${tr.lo}–${tr.hi} (${tr.cents.toFixed(1)} cents)`);
  }
  ok(row.every(r => r.tr.lo === r.tr.hi), 'tracking drive: one period, whatever the LFO');
  ok(row.find(r => r.hz === 2).st.cents > 50 && row.find(r => r.hz === 8).st.cents > row.find(r => r.hz === 2).st.cents, 'built drive: the pitch swing grows with LFO rate (over 50 cents at 2 Hz)');
}
{ // step 5: block against signal rate
  const res = {};
  for (const hz of [0.1, 0.25, 0.5, 2, 8, 30, SR / 256, SR / 128]) res[hz] = J.residueDb({ freq: 110, lfo: true, lfoHz: hz, lo: 1, hi: 15 }, SR);
  for (const hz in res) console.log(`         LFO ${(+hz).toFixed(2)} Hz: block version differs by ${res[hz].db.toFixed(1)} dB; block sees tau ${res[hz].blockTau[0].toFixed(3)}–${res[hz].blockTau[1].toFixed(3)} ms`);
  ok(res[0.25].db < -55, 'a slow LFO (0.25 Hz): the block version is more than 55 dB under the voice');
  ok(res[0.25].db < res[2].db && res[2].db < res[8].db && res[8].db < res[30].db, 'the zipper grows as the LFO speeds up (0.25 → 2 → 8 → 30 Hz)');
  ok(res[SR / 128].blockTau[1] - res[SR / 128].blockTau[0] < 1e-9, 'an LFO at the block rate: the block version sees a fixed tau, the cable carries nothing');
  ok(res[SR / 256].blockTau[1] - res[SR / 256].blockTau[0] < 1e-9, 'an LFO at half the block rate: also fixed, read at the same two points of its cycle');
  const r = J.render({ freq: 110, lfo: true, lfoHz: 8, lo: 1, hi: 15, drive: 'track' }, SR, SR, 4800);
  ok(r.fS.length === r.fB.length && r.fS.every((v, i) => v === r.fB[i]), 'tracking drive: both membranes fire on the same samples, so "hear only the difference" is the shape alone');
  // the folded rate: a 300 Hz LFO read once a block
  const rr = J.render({ freq: 110, lfo: true, lfoHz: 300, lo: 1, hi: 15, drive: 'track' }, SR, SR, 0);
  const steps = []; for (let i = 0; i < rr.tB.length; i += 128) steps.push(rr.tB[i]);
  let best = 0, bestF = 0; const BR = SR / 128;
  for (let f = 1; f < BR / 2; f += 0.5) { let re = 0, im = 0; steps.forEach((v, k) => { re += Math.log(v) * Math.cos(2 * Math.PI * f * k / BR); im += Math.log(v) * Math.sin(2 * Math.PI * f * k / BR); }); const m = Math.hypot(re, im); if (m > best) { best = m; bestF = f; } }
  console.log(`         LFO 300 Hz read once a block (${BR.toFixed(1)} Hz): the held tau moves at ${bestF} Hz`);
  ok(Math.abs(bestF - Math.abs(300 - BR)) <= 1, 'past half the block rate the held tau folds: 300 Hz is read as |300 − block rate|');
}

console.log(`\nthe zero guard — the dev plan's Gen~ stage 2, at ${SR} Hz`);
{
  const e = G.PlanStage2(SR); e.set({ freq: 110, tauMs: 0 }); e.tick();
  ok(Number.isNaN(e.st.V), 'no guard, tau exactly 0: NaN on the first sample');
  const p = G.pulled(110, 5, false, SR, 15, 5, 40);
  ok(p.nanAt === p.a && p.nanAtEnd && p.firesAfter === 0, 'no guard: the NaN stays 40 ms after tau returns to 5 ms (the History holds it)');
  const q = G.pulled(440, 5, true, SR, 15, 5, 40);
  ok(q.nanAt < 0 && q.firesAfter > 0, 'guarded: no NaN, and the voice comes back when the cable does');
  let negNan = false; for (const t of [-0.5, -0.01, -1e-6]) { const n = G.PlanStage2(SR); n.set({ freq: 110, tauMs: t }); for (let i = 0; i < 2000; i++) n.tick(); if (Number.isNaN(n.st.V)) negNan = true; }
  console.log(`         negative tau (a bipolar LFO through zero) gives NaN: ${negNan}`);
  for (const t of [1e-9, 1e-6, 0.001]) { const c = G.classify(110, t, false, SR); console.log(`         no guard, tau ${t} ms: ${c.kind}`); }
  const bare = G.guardMap(false, SR), held = G.guardMap(true, SR);
  ok(bare.every(r => r[0].kind === 'nan'), 'map, no guard: every note is NaN at tau 0');
  ok(held.every(r => r.every(c => c.kind !== 'nan')), 'map, guarded: no NaN anywhere');
  const floor = held.map((r, j) => ({ f: G.MAP_FREQS[j], c: r[0] }));
  const silent = floor.filter(x => x.c.kind === 'silent').map(x => x.f);
  const sharp = floor.filter(x => x.c.kind === 'sharp');
  console.log(`         at the 0.1 ms floor: silent for ${silent.length} of ${floor.length} notes, up to ${silent.length ? Math.max(...silent).toFixed(1) : '—'} Hz; sharp ${sharp.map(x => x.f.toFixed(0) + ' Hz +' + x.c.cents.toFixed(0)).join(', ')}`);
  ok(silent.length > 0, 'the plan’s floor is silent for some notes (the guard against zero is not enough)');
  const idx = f => G.MAP_FREQS.reduce((bi, x, i) => Math.abs(Math.log(x / f)) < Math.abs(Math.log(G.MAP_FREQS[bi] / f)) ? i : bi, 0);
  for (const f of [55, 110, 220, 440, 880]) console.log(`         ${f} Hz: in tune (within a sample) from tau ${G.inTuneFrom(held[idx(f)]).toFixed(3)} ms up`);
  for (const [f, t] of [[110, 0.3], [110, 1], [440, 0.1], [440, 1]]) { const c = G.classify(f, t, true, SR); console.log(`         ${f} Hz at tau ${t} ms: ${c.kind}${c.cents != null ? ' ' + c.cents.toFixed(1) + ' cents' : ''}`); }
  let worstGap = 0;
  for (const f of [110, 220, 440]) for (const t of [0.5, 1, 2, 5]) { const c = G.classify(f, t, true, SR), P = SR / f, ts = t * 0.001 * SR; worstGap = Math.max(worstGap, Math.abs(SR / c.hz - P * (1 - 1 / (2 * ts)))); }
  ok(worstGap <= 1.5, `the exp()-against-(1 − 1/τ) sharpness is about 1/(2τ): measured periods within ${worstGap.toFixed(2)} samples of P·(1 − 1/(2τ)) (110–440 Hz, τ 0.5–5 ms)`);
}
{ // the remake: fine scans, and the sharpness put where it belongs
  const silent = G.silentUpTo(0.1, SR), edges = [110, 220, 440].map(f => G.tuneEdge(f, SR)), at1 = [110, 220, 440, 880].map(f => G.classify(f, 1, true, SR).cents);
  console.log(`         fine scan: the 0.1 ms floor is silent for every note up to ${silent.toFixed(1)} Hz; with the plan's drive in tune from ${edges.map(x => x.toFixed(2)).join(' / ')} ms at 110 / 220 / 440 Hz; at 1 ms ${at1.map(x => x.toFixed(1)).join(' / ')} cents at 110 / 220 / 440 / 880 Hz`);
  ok(silent > 250 && silent < 320, 'the floor is silent up to a note set by P/τ ≈ 35, between 250 and 320 Hz');
  ok(at1[0] > 10, 'the sharpness is the plan’s drive, well above the floor: at τ = 1 ms, 110 Hz is over 10 cents sharp (higher notes have coarser whole-sample periods and can round in)');
  ok(edges[0] > edges[1] && edges[1] > edges[2], 'with the plan’s drive the in-tune edge falls as the note rises');
}
console.log(fails ? `\n${fails} FAILED` : '\nall checks pass');
process.exit(fails ? 1 : 0);
