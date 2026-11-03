#!/usr/bin/env node
/*
  title: State Machine — rich — checks
  born: 2026-11-03
  links: [[State Machine]] (connects-to · rich-face-checks) · checks "State Machine — rich — four problems.html"
  forward_vector: I re-run every claim the four-problems piece makes, on the engine inside the piece (pulled out
    of its own HTML, never a copy), and hold that engine to the Action Potential Oscillator's stage 4, sample for
    sample. With Faust on the machine I also compile a probe that shows which way round select2 takes its inputs.

  usage: node "State Machine — rich — checks.mjs" [--no-faust]
*/
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const between = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); if (i < 0 || j < 0) throw new Error('marker missing: ' + a); return src.slice(i, j + b.length); };
const piece = readFileSync(join(HERE, 'State Machine — rich — four problems.html'), 'utf8');
const eng = between(piece, '/* ENGINE:START', '/* ENGINE:END */');
const { PulseEngine, MachineEngine } = new Function(eng + '\nreturn { PulseEngine, MachineEngine };')();
const { measureMachine, measurePulse } = new Function('PulseEngine', 'MachineEngine', between(piece, '/* MEASURE:START', '/* MEASURE:END */') + '\nreturn { measureMachine, measurePulse };')(PulseEngine, MachineEngine);
const apo = readFileSync(join(HERE, '..', 'Projects', 'Action Potential Oscillator', 'Action Potential Oscillator — rich — four stages.html'), 'utf8');
const NeuronEngine = new Function(between(apo, '/* ENGINE:START', '/* ENGINE:END */') + '\nreturn NeuronEngine;')();
const SR = 48000; let fails = 0;
const ok = (c, what) => { console.log((c ? '  ok   ' : '  FAIL ') + what); if (!c) fails++; };
const M = (p) => measureMachine(Object.assign({ freq: 110, tau_ms: 5, hyp: -0.2, damp: 0.3, refr_ms: 1.5, bug: 'none' }, p), SR, 1.5);
const c = x => (x >= 0 ? '+' : '') + x.toFixed(1);

console.log('\nstep 1 — one integer that remembers');
{ const a = measurePulse({ freq: 110, duty: 0.5, memory: true }, SR), b = measurePulse({ freq: 110, duty: 0.5, memory: false }, SR);
  ok(Math.abs(a.f0 - 110.09) < 0.01 && a.edgesPerSec >= 219, `the pulse plays ${a.f0.toFixed(2)} Hz with ${a.edgesPerSec} transitions a second`);
  ok(b.edgesPerSec === 0, `with no memory it never leaves LOW (${b.edgesPerSec} transitions a second)`); }

console.log('\nsteps 2–4 — the machine as built');
{ let d = 0; for (const f of [55, 110, 220, 330, 390]) for (const damp of [0.1, 0.3, 1.5]) for (const hyp of [-0.2, -0.6]) {
    const a = MachineEngine(SR), b = NeuronEngine(SR); a.set({ freq: f, damp, hyp }); b.set({ stage: 4, freq: f, damp, hyp });
    for (let k = 0; k < SR; k++) d = Math.max(d, Math.abs(a.tick() - b.tick())); }
  ok(d === 0, `with no bug it is the Action Potential Oscillator's stage 4, sample for sample, 30 settings (largest difference ${d})`); }
{ const fs = [55, 110, 220, 330], r = fs.map(f => M({ freq: f }).f0), w = fs.map(f => SR / Math.round(SR / f));
  ok(r.every((x, i) => Math.abs(1200 * Math.log2(x / w[i])) < 1), `plays the nearest whole-sample period from 55 to 330 Hz (${fs.map((f, i) => c(1200 * Math.log2(r[i] / f))).join(', ')} cents from the dial)`); }
{ const a = M({ refr_ms: 0.3 }), b = M({}); ok(a.perCycle[3] > a.lens.refrS + 1.5 && Math.abs(b.perCycle[3] - b.lens.refrS) < 1.5,
    `step 3: a 0.3 ms timer lets the voltage half open last (asks ${Math.round(a.lens.refrS)}, ran ${a.perCycle[3].toFixed(0)}); at 1.5 ms the timer does (asks ${Math.round(b.lens.refrS)}, ran ${b.perCycle[3].toFixed(0)})`); }
{ const a = M({}), b = M({ bug: 'latch-off' }); ok(b.cents > 10 && Math.abs(a.cents) < 2, `step 4: without the latch the note runs ${c(b.cents)} cents at 110 Hz, with it ${c(a.cents)} (the charge starts at ${a.vHand.toFixed(3)})`); }

console.log('\nstep 5 — the bugs');
{ const fl = M({ bug: 'ambiguous', freq: 55 }).f0, lens = MachineEngine(SR).lens();
  const exp = SR / (2 * Math.ceil(lens.refrS) + Math.ceil(lens.riseS) + Math.ceil(lens.fallS));
  const lows = [55, 110, 165, 220].map(f => M({ bug: 'ambiguous', freq: f }).f0), highs = [260, 300, 380].map(f => M({ bug: 'ambiguous', freq: f }).cents - M({ freq: f }).cents);
  ok(Math.abs(fl - exp) < 0.05 && lows.every(f => Math.abs(f - fl) < 0.05), `ambiguous: every note below the floor plays ${fl.toFixed(2)} Hz (SR / (2·refr + rise + fall) = ${exp.toFixed(2)})`);
  ok(highs.every(x => Math.abs(x) < 0.05), `ambiguous: above the floor it is inaudible (260, 300, 380 Hz unchanged)`);
  console.log(`         110 Hz plays ${c(M({ bug: 'ambiguous' }).cents)} cents`);
  const band = M({ bug: 'ambiguous', freq: 248.5 });
  const sk = (() => { const e = MachineEngine(SR); e.set({ bug: 'ambiguous', freq: 248.5 }); const st = {}, x = []; let skip = 0, rise = 0;
    for (let k = 0; k < SR; k++) { x.push(e.tick(st)); if (k > SR / 2) { if (st.from === 0 && st.ph === 2) skip++; if (st.from === 0 && st.ph === 1) rise++; } }
    let P = null; for (let p = 50; p < 2000 && P == null; p++) { let same = true; for (let k = SR - 4000; k < SR; k++) if (Math.abs(x[k] - x[k - p]) > 1e-9) { same = false; break; } if (same) P = p; }
    return { skip, rise, P }; })();
  ok(band.alt && sk.skip > 50 && Math.abs(sk.skip - sk.rise) <= 1 && sk.P === 300, `ambiguous, just above the floor: at 248.5 Hz the threshold and the stray exit open on the same sample every other cycle (${sk.skip} charge → fall jumps, ${sk.rise} rises in 0.5 s); the wave repeats every ${sk.P} samples, ${(SR / sk.P).toFixed(1)} Hz, firing ${band.firesPerSec.toFixed(1)} times a second`);
  let blo = null, bhi = null; for (let q = 2475; q <= 2505; q++) if (M({ bug: 'ambiguous', freq: q / 10 }).alt) { if (blo == null) blo = q / 10; bhi = q / 10; }
  ok(blo === 248.1 && bhi === 249.3, `the band runs ${blo}–${bhi} Hz (0.1 Hz steps)`);
  const floors = [1.0, 1.5, 2.5].map(r => M({ bug: 'ambiguous', freq: 55, refr_ms: r }).f0), tauSame = M({ bug: 'ambiguous', freq: 55, tau_ms: 20 }).f0;
  ok(Math.abs(floors[0] - 331.0) < 0.1 && Math.abs(floors[1] - 248.7) < 0.1 && Math.abs(floors[2] - 166.1) < 0.1 && Math.abs(tauSame - floors[1]) < 0.01, `ambiguous: the floor is set by the refractory timer (1.0 / 1.5 / 2.5 ms → ${floors.map(f => f.toFixed(1)).join(' / ')} Hz), not by τ (τ = 20 ms → ${tauSame.toFixed(1)} Hz)`); }
{ const run = (bug) => { const e = MachineEngine(SR); e.set({ bug, freq: 110 }); const st = {}; let after = 0, nan = false;
    for (let k = 0; k < SR * 2; k++) { e.P.tau_ms = (k >= SR / 2 && k < SR / 2 + 48) ? 0 : 5; const y = e.tick(st); if (y !== y) nan = true; if (k > SR * 0.6 && st.from === 0 && st.ph === 1) after++; }
    return { after, nan, s: e.state() }; };
  const a = run('noguard'), b = run('none');
  ok(a.nan && a.after === 0 && !(a.s.V === a.s.V), `missing guard: a 1 ms pull to τ = 0 turns V to NaN and the machine never fires again (stuck in phase ${a.s.ph})`);
  ok(!b.nan && b.after > 150, `with the guard the same pull is a glitch (${b.after} firings in the next 1.4 s)`);
  const g = M({ tau_ms: 0.1 }); ok(g.silent && !g.nan && g.gap > 0 && g.gap < 1e-12, `with the guard, τ = 0.1 ms at 110 Hz is silent with no NaN: the charge stops ${g.gap.toExponential(1)} short of threshold`);
  let edge = null; for (let f = 55; f <= 400; f++) { const m = M({ tau_ms: 0.1, freq: f }); if (!m.silent) { edge = f; break; } }
  console.log(`         at τ = 0.1 ms the first note that sounds from rest (1 Hz steps) is ${edge} Hz`);
  const running = f => { const e = MachineEngine(SR); e.set({ freq: f }); const st = {}; let n = 0; for (let k = 0; k < SR * 1.5; k++) { if (k === SR / 2) e.P.tau_ms = 0.1; e.tick(st); if (k > SR && st.from === 0 && st.ph === 1) n++; } return n; };
  let low = null; for (let f = 150; f <= 320; f++) if (running(f) > f * 0.25) { low = f; break; }
  ok(low != null && low < edge, `turned down to τ = 0.1 ms while running, it keeps sounding from ${low} Hz (1 Hz steps), below the from-rest edge of ${edge} Hz`); }
{ const r = [55, 110, 165, 220, 300].map(f => M({ bug: 'latch-edge', freq: f }).cents);
  ok(r.every(x => x > 70), `latch on the fall's end (the section's words) plays sharp: ${r.map(c).join(', ')} cents at 55, 110, 165, 220, 300 Hz`);
  // in the three-state Stage 3, latching as the fall ends is the right edge: the APO engine does it and plays in tune
  const st3 = [110, 220].map(f => { const e = NeuronEngine(SR); e.set({ stage: 3, freq: f }); const fires = []; let prev = 0;
    for (let k = 0; k < SR * 2; k++) { const st = {}; e.tick(st); if (st.fired) fires.push(k); } const t = fires.filter(k => k > SR); return 1200 * Math.log2(SR * (t.length - 1) / (t[t.length - 1] - t[0]) / f); });
  ok(st3.every(x => Math.abs(x) < 5), `in the three-state Stage 3 the fall's end is the charge's start, and latching there is in tune (${st3.map(c).join(', ')} cents)`); }
{ const r = [55, 110, 220, 380].map(f => M({ bug: 'latch-state', freq: f })); const e = MachineEngine(SR); e.set({ bug: 'latch-state' }); for (let k = 0; k < SR * 20; k++) e.tick();
  ok(r.every(m => m.silent && !m.nan) && e.state().ph === 0, `latch as a behaviour: silent at 55, 110, 220, 380 Hz; after 20 s still charging, ${(1 - e.state().V).toExponential(1)} short of threshold`); }

if (!process.argv.includes('--no-faust')) {
  console.log('\nBoxes and Lines — which way round');
  try { const dir = mkdtempSync(join(tmpdir(), 'sm-sel-')); writeFileSync(join(dir, 'sel.dsp'), 'import("stdfaust.lib");\nprocess(c) = select2(c > 0.5, 10.0, 20.0), ba.if(c > 0.5, 10.0, 20.0);\n');
    const code = execFileSync('faust', ['-lang', 'c', join(dir, 'sel.dsp')], { encoding: 'utf8' });
    const o0 = code.match(/output0\[[^\]]+\] = \(FAUSTFLOAT\)\((.*)\);/)[1], o1 = code.match(/output1\[[^\]]+\] = \(FAUSTFLOAT\)\((.*)\);/)[1];
    ok(/\?\s*2e\+01f\s*:\s*1e\+01f/.test(o0) && /\?\s*1e\+01f\s*:\s*2e\+01f/.test(o1), `Faust compiles select2(c, a, b) to c ? b : a, and ba.if(c, a, b) to c ? a : b (${o0} · ${o1})`);
  } catch (e) { console.log('  skip  faust not runnable here: ' + e.message.split('\n')[0]); }
}
console.log(fails ? `\n${fails} FAILED` : '\nall checks pass'); process.exit(fails ? 1 : 0);
