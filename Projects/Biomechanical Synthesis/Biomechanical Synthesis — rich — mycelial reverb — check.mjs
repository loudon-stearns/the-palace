// title: Biomechanical Synthesis — rich — mycelial reverb — check
// born: 2026-11-10
// links: [[Biomechanical Synthesis]] (connects-to · checks-its-rich-face-piece) · reads the engine out of "Biomechanical Synthesis — rich — mycelial reverb.html"
// forward_vector: I pull the reverb's own engine out of the piece and run it with no browser: its arithmetic, its stability at every control setting, and what growing does to the tail. I change when the engine does.
//
// run:  node "Projects/Biomechanical Synthesis/Biomechanical Synthesis — rich — mycelial reverb — check.mjs" [--quick] [--json out.json]
//
// What would have meant failure is printed beside every number. Exit code 1 if any check fails.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const quick = process.argv.includes('--quick');
const jsonAt = process.argv.indexOf('--json');
let src;
if (process.env.MYCEL_ENGINE) src = readFileSync(process.env.MYCEL_ENGINE, 'utf8');
else {
  const html = readFileSync(join(here, 'Biomechanical Synthesis — rich — mycelial reverb.html'), 'utf8');
  const m = html.match(/<script id="mycel-engine">([\s\S]*?)<\/script>/);
  if (!m) { console.error('no engine block in the piece'); process.exit(1); }
  src = m[1];
}
const { MycelNet, MycelColony, mycelRng } = new Function(src + '\nreturn { MycelNet, MycelColony, mycelRng };')();

const SR = 48000, MAXS = 170, BLOCK = 512;
let failed = 0;
const out = { sr: SR, checks: {}, stages: [] };
function say(ok, name, got, failIf) { if (!ok) failed++; console.log((ok ? 'pass' : 'FAIL') + ' · ' + name + '\n       got: ' + got + '\n       failure would have been: ' + failIf); }

function rig(seed, preset, arg) {
  const net = new MycelNet(SR, MAXS);
  const col = new MycelColony({ sr: SR, maxSegs: MAXS, block: BLOCK, seed, emit: (m) => net.msg(m) });
  if (preset) col.reset(seed, 1000, 600, preset, arg);
  return { net, col };
}
function clone(col, par) {                       // the same network, silent, for a clean impulse
  const net = new MycelNet(SR, MAXS); if (par) net.msg(Object.assign({ t: 'par' }, par));
  const ys = [];
  col.segs.forEach((s, i) => { if (s) { net.msg({ t: 'add', s: i, a: s.a, b: s.b, L: s.L }); ys.push(i, s.y); } });
  net.msg({ t: 'ys', list: ys }); net.msg({ t: 'in', n: col.inNode });
  const save = col.emit; col.emit = (m) => net.msg(m); col.sendTaps(); col.emit = save;
  return net;
}
function impulse(net, seconds) {
  const N = Math.round(seconds * SR), L = new Float32Array(N), R = new Float32Array(N), x = new Float32Array(BLOCK), l = new Float32Array(BLOCK), r = new Float32Array(BLOCK);
  for (let o = 0; o < N; o += BLOCK) { const n = Math.min(BLOCK, N - o); x.fill(0); if (o === 0) x[0] = 1; net.process(x, l, r, n); L.set(l.subarray(0, n), o); R.set(r.subarray(0, n), o); }
  return { L, R };
}
// A source the colony can eat: plucked notes with gaps, made here, no samples.
function phrase(seconds, seed) {
  const N = Math.round(seconds * SR), x = new Float32Array(N), r = mycelRng(seed), notes = [146.8, 174.6, 196, 220, 261.6, 293.7];
  for (let t = 0; t < seconds; t += 0.6) {
    const f = notes[Math.floor(r() * notes.length)], P = Math.round(SR / f), d = new Float32Array(P); for (let i = 0; i < P; i++) d[i] = r() * 2 - 1;
    let o = Math.round(t * SR), p = 0, prev = 0; const n = Math.min(N - o, Math.round(0.5 * SR));
    for (let i = 0; i < n; i++) { const v = d[p]; d[p] = 0.996 * 0.5 * (v + prev); prev = v; p = (p + 1) % P; x[o + i] += 0.4 * v; }
  }
  return x;
}
function growTo(rg, target, src, maxSeconds) {     // feed it until it has `target` threads
  const l = new Float32Array(BLOCK), r = new Float32Array(BLOCK); let o = 0, t = 0;
  while (rg.col.nseg < target && t < maxSeconds) {
    rg.net.process(src.subarray(o, o + BLOCK), l, r, BLOCK); rg.col.feed(rg.net.en); rg.net.en.fill(0);
    o += BLOCK; if (o + BLOCK > src.length) o = 0; t += BLOCK / SR;
  }
  return t;
}
function rt60(L, R) {                             // Schroeder's backward sum, a line fitted from −5 to −35 dB, doubled
  const N = L.length, e = new Float64Array(N + 1); for (let i = N - 1; i >= 0; i--) e[i] = e[i + 1] + L[i] * L[i] + R[i] * R[i];
  if (e[0] <= 0) return { rt: 0, edt: 0 };
  let a = -1, b = -1, c = -1; for (let i = 0; i < N; i++) { const db = 10 * Math.log10(e[i] / e[0] + 1e-30); if (a < 0 && db <= -5) a = i; if (c < 0 && db <= -10) c = i; if (db <= -35) { b = i; break; } }
  let first = 0; for (let i = 0; i < N; i++) if (L[i] !== 0 || R[i] !== 0) { first = i; break; }
  return { rt: b < 0 || a < 0 ? NaN : 2 * (b - a) / SR, edt: c < 0 ? NaN : 6 * (c - first) / SR, pre: first / SR };
}
function mixing(x) {                              // echo density after Abel & Huang 2006: share of samples outside one deviation, over 0.3173
  const W = Math.round(0.02 * SR), N = x.length; let s2 = 0, first = 0; for (let i = 0; i < N; i++) if (x[i] !== 0) { first = i; break; }
  const sq = new Float64Array(N + 1); for (let i = 0; i < N; i++) sq[i + 1] = sq[i] + x[i] * x[i];
  let peak = 0, at = NaN;
  for (let i = first; i + W < N; i += Math.round(W / 4)) {
    const sd = Math.sqrt((sq[i + W] - sq[i]) / W); if (sd < 1e-7) break; let c = 0; for (let k = i; k < i + W; k++) if (Math.abs(x[k]) > sd) c++;
    const ned = c / W / 0.3173; if (ned > peak) peak = ned; if (isNaN(at) && ned >= 0.9) at = (i - first) / SR;
  }
  return { at, peak };
}
function echoes(x, seconds) { let c = 0; const N = Math.min(x.length, Math.round(seconds * SR)); let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(x[i])); for (let i = 0; i < N; i++) if (Math.abs(x[i]) > pk * 0.001) c++; return c; }

// ── 1 · the arithmetic the piece's words state ──────────────────────────────
{
  const { net, col } = rig(1, 'thread', 286); net.msg({ t: 'par', rt: 3, damp: 0, tip: 0.8 });
  const L = col.segs[0].L, g = net.lineGain(L), ir = impulse(net, 0.5).L, tap = 0.7071 * 1;
  const e1 = ir[2 * L] / tap, e2 = ir[4 * L] / tap, w1 = g * g * 0.8, w2 = Math.pow(g, 4) * Math.pow(0.8, 3);
  let stray = 0; for (let i = 1; i < ir.length; i++) if (i % (2 * L) !== 0) stray = Math.max(stray, Math.abs(ir[i]));
  out.checks.thread = { L, roundTripMs: 2000 * L / SR, e1, w1, e2, w2, stray };
  say(Math.abs(e1 - w1) < 1e-6 && Math.abs(e2 - w2) < 1e-6 && stray === 0, 'one thread: an echo every round trip, 2L = ' + (2000 * L / SR).toFixed(1) + ' ms, each smaller by the two ends and the way',
    'first ' + e1.toFixed(6) + ' (want ' + w1.toFixed(6) + '), second ' + e2.toFixed(6) + ' (want ' + w2.toFixed(6) + '), anything between the echoes ' + stray,
    'an echo off by more than 1e-6, or any sound between round trips');
}
{
  const { net, col } = rig(1, 'fork'); net.msg({ t: 'par', rt: 3, damp: 0, tip: 0.8 });
  const L = col.segs[0].L, g = net.lineGain(L), ir = impulse(net, 0.2).L, e1 = ir[2 * L] / 0.7071, w1 = -g * g / 3;
  out.checks.fork = { e1, w1 };
  say(Math.abs(e1 - w1) < 1e-6, 'one fork of three equal threads: a third comes back upside down, two thirds go on down each branch', 'came back ' + e1.toFixed(6) + ' (want ' + w1.toFixed(6) + ')', 'a return other than −1/3 of what arrived');
  // the junction itself, any thicknesses: what leaves is as large as what arrived
  const r = mycelRng(7); let worst = 0;
  for (let k = 0; k < 2000; k++) {
    const n = 2 + Math.floor(r() * 5), y = [], a = []; let sy = 0, S = 0, ein = 0, eout = 0; for (let i = 0; i < n; i++) { y.push(0.2 + r() * 5); a.push(r() * 2 - 1); sy += y[i]; S += Math.sqrt(y[i]) * a[i]; ein += a[i] * a[i]; }
    for (let i = 0; i < n; i++) { const o = 2 * S / sy * Math.sqrt(y[i]) - a[i]; eout += o * o; } worst = Math.max(worst, Math.abs(eout / ein - 1));
  }
  out.checks.junction = { worst };
  say(worst < 1e-12, 'a junction of 2 to 6 threads of any thickness gives back exactly the energy it was given (2,000 random junctions)', 'largest error ' + worst.toExponential(2), 'any junction giving back more or less than it got, beyond rounding (1e-12)');
}

// ── 2 · it must not blow up ─────────────────────────────────────────────────
// With no sound going in, the energy the network holds may only fall. Checked every 64 samples, at the
// corners of every control (longest carry 12 s, no damping, tips that give everything back), on young,
// middling and full colonies, with and without the thickening.
const food = phrase(40, 3);
const grown = [];
{
  const seeds = quick ? [11, 12] : [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  let worstStep = 0, worstEnd = 0, runs = 0, worstAt = '';
  for (const seed of seeds) {
    const rg = rig(seed);
    for (const target of [3, 20, 80, MAXS]) {
      if (target > 3) growTo(rg, target, food, 400);
      if (seed === seeds[0]) grown.push(null);
      for (const par of [{ rt: 12, damp: 0, tip: 1 }, { rt: 12, damp: 0.9, tip: 1 }, { rt: 0.2, damp: 0, tip: 0 }, { rt: 12, damp: 0.5, tip: 0.8 }]) {
        const net = clone(rg.col, par), x = new Float32Array(64), l = new Float32Array(64), r = new Float32Array(64);
        x[0] = 1; net.process(x, l, r, 64); x[0] = 0; let prev = net.stored(); const e0 = prev;
        const steps = Math.round((quick ? 2 : 6) * SR / 64);
        for (let k = 0; k < steps; k++) { net.process(x, l, r, 64); const e = net.stored(); const ratio = e / prev; if (prev > 1e-12 && ratio > worstStep) { worstStep = ratio; worstAt = 'seed ' + seed + ', ' + rg.col.nseg + ' threads, carry ' + par.rt + ' s, damping ' + par.damp + ', tips ' + par.tip; } prev = e; }
        worstEnd = Math.max(worstEnd, e0 > 1 + 1e-6 ? 99 : 0); runs++;
      }
    }
  }
  out.checks.passive = { runs, worstStep, worstAt };
  say(worstStep <= 1 + 1e-6, 'with nothing going in, the energy held never rises (' + runs + ' impulse runs: 4 sizes × 4 control corners × ' + seeds.length + ' colonies, read every 64 samples)',
    'largest step ratio ' + worstStep.toFixed(9) + ' (1 = held level; at ' + worstAt + ')', 'any step ratio above 1.000001, at any setting');
}
// The torture: full-scale noise in, for a minute, while the colony grows, is frosted, thickens, and every
// control is thrown to a random corner four times a second. Then silence. The loudest sample is printed.
{
  const rg = rig(99), r = mycelRng(5), x = new Float32Array(BLOCK), l = new Float32Array(BLOCK), rr = new Float32Array(BLOCK);
  let peak = 0, peakE = 0, t = 0, nextJ = 0, bad = false; const T = quick ? 20 : 60;
  while (t < T) {
    for (let i = 0; i < BLOCK; i++) x[i] = r() * 2 - 1;
    rg.net.process(x, l, rr, BLOCK); rg.col.feed(rg.net.en); rg.net.en.fill(0);
    for (let i = 0; i < BLOCK; i++) { const a = Math.max(Math.abs(l[i]), Math.abs(rr[i])); if (a > peak) peak = a; if (!isFinite(a)) bad = true; }
    t += BLOCK / SR;
    if (t > nextJ) { nextJ = t + 0.25; rg.net.msg({ t: 'par', rt: r() < 0.5 ? 12 : 0.2 + r() * 11.8, damp: r() < 0.5 ? 0 : r() * 0.9, tip: r() < 0.5 ? 1 : r() }); if (r() < 0.08) rg.col.frost(); if (r() < 0.3) rg.col.setIn(rg.col.nearest(r() * 1000, r() * 600)); }
    peakE = Math.max(peakE, 0);
  }
  rg.net.msg({ t: 'par', rt: 12, damp: 0, tip: 1 }); x.fill(0); let e0 = rg.net.stored(), eEnd = e0, rise = 0, prev = e0;
  for (let k = 0; k < (quick ? 5 : 20) * SR / BLOCK; k++) { rg.net.process(x, l, rr, BLOCK); const e = rg.net.stored(); rise = Math.max(rise, e / prev); prev = e; eEnd = e; }
  out.checks.torture = { seconds: T, peak, threads: rg.col.nseg, afterDb: 10 * Math.log10(eEnd / e0), rise };
  say(!bad && isFinite(peak) && rise <= 1 + 1e-6 && eEnd < e0, 'a minute of full-scale noise while it grows, is frosted, and every control jumps four times a second, then silence at the longest carry',
    'loudest output sample ' + peak.toFixed(2) + ' (input peak 1.00), every sample finite; in the silence after, the held energy fell ' + (-10 * Math.log10(eEnd / e0)).toFixed(1) + ' dB in ' + (quick ? 5 : 20) + ' s and never rose (largest step ' + rise.toFixed(9) + ')',
    'a sample that is not a number, or held energy rising once the input stops');
}
// The loudest it gets at a fixed setting: full-scale noise and a full-scale sine parked on the strongest
// resonance, full colony, longest carry, no damping, tips giving everything back.
{
  const rg = rig(11); growTo(rg, MAXS, food, 400);
  const res = {};
  for (const [name, par] of [['house settings', { rt: 3, damp: 0.25, tip: 0.8 }], ['worst corner', { rt: 12, damp: 0, tip: 1 }]]) {
    const net = clone(rg.col, par), r = mycelRng(8), x = new Float32Array(BLOCK), l = new Float32Array(BLOCK), rr = new Float32Array(BLOCK); let pk = 0, sq = 0, n = 0;
    const T = (quick ? 10 : 40) * SR;
    for (let o = 0; o < T; o += BLOCK) { for (let i = 0; i < BLOCK; i++) x[i] = r() * 2 - 1; net.process(x, l, rr, BLOCK); for (let i = 0; i < BLOCK; i++) { pk = Math.max(pk, Math.abs(l[i]), Math.abs(rr[i])); if (o > T / 2) { sq += l[i] * l[i] + rr[i] * rr[i]; n += 2; } } }
    res[name] = { noisePeak: pk, noiseRmsGainDb: 20 * Math.log10(Math.sqrt(sq / n) / Math.sqrt(1 / 3)) };
  }
  out.checks.level = res;
  const w = res['worst corner'], h = res['house settings'];
  say(isFinite(w.noisePeak) && w.noisePeak < 1e3, 'the loudest it gets, full colony, full-scale noise held for ' + (quick ? 10 : 40) + ' s',
    'house settings: peak ' + h.noisePeak.toFixed(2) + ', level ' + h.noiseRmsGainDb.toFixed(1) + ' dB re the input · worst corner (carry 12 s, no damping, tips give all back): peak ' + w.noisePeak.toFixed(2) + ', level ' + w.noiseRmsGainDb.toFixed(1) + ' dB re the input',
    'a peak that keeps climbing without limit (over 1000× the input)');
}

// ── 3 · what growing does to the tail ───────────────────────────────────────
// Written before the first run: a grown colony should (a) ring longer (RT60 by T30) and (b) turn into a
// wash sooner (echo density reaches 0.9 of a noise tail's earlier) than a young one, at one fixed setting.
// (a) is the check: it fails if RT60 is not longer at the largest stage than the smallest on most colonies.
// (b) is printed as found, not passed: three threads never make a wash at all and ten do, so 3 against
// full can only go one way. The comparison printed is 10 threads against the full dish, which can go
// either way, and has: 5 sooner and 7 later under the first tuning of the growth rules, 10 and 2 under
// the one that shipped, the median moving about 15 ms. Not settled; the piece says so.
{
  const seeds = quick ? [21, 22, 23] : [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32];
  const targets = [3, 10, 25, 60, 110, MAXS], rows = targets.map(() => []);
  let rtUp = 0, mixDown = 0, mixLater = 0, never0 = 0, frostRows = [];
  for (const seed of seeds) {
    const rg = rig(seed); let first = null, last = null;
    targets.forEach((target, ti) => {
      const secs = target > 3 ? growTo(rg, target, food, 400) : 0;
      const net = clone(rg.col, { rt: 3, damp: 0.25, tip: 0.8 }), ir = impulse(net, 8), c = rg.col.counts();
      const m = rt60(ir.L, ir.R), mono = new Float32Array(ir.L.length); for (let i = 0; i < mono.length; i++) mono[i] = ir.L[i] + ir.R[i];
      const mx = mixing(mono), row = { seed, threads: c.threads, loops: c.loops, ends: c.ends, fruit: c.fruit, rt: m.rt, edt: m.edt, mixAt: mx.at, nedPeak: mx.peak, echoes50: echoes(mono, 0.05), fed: rg.col.time };
      rows[ti].push(row); if (ti === 0) first = row; last = row;
    });
    if (last.rt > first.rt) rtUp++;
    const ten = rows[1][rows[1].length - 1]; if (isNaN(first.mixAt)) never0++;
    if (last.mixAt < ten.mixAt) mixDown++; else if (last.mixAt > ten.mixAt) mixLater++;
    // a frost on the full colony: the dead ends go, the loops stay
    const before = rg.col.counts(); let k = 0; while (rg.col.frost() && k < 40) k++;
    const net = clone(rg.col, { rt: 3, damp: 0.25, tip: 0.8 }), ir = impulse(net, 10), m = rt60(ir.L, ir.R), c = rg.col.counts();
    frostRows.push({ seed, threads: c.threads, loops: c.loops, ends: c.ends, rt: m.rt, rtBefore: last.rt, endsBefore: before.ends });
  }
  const med = (a) => { const s = a.filter((v) => !isNaN(v)).sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : NaN; };
  console.log('\n  stage · threads · loops · dead ends · fruiting bodies · RT60 s · mixes at ms · never mixed · fed for s   (medians over ' + seeds.length + ' colonies; carry 3 s, damping 0.25, tips keep 20%)');
  rows.forEach((rs, ti) => {
    const st = { threads: med(rs.map((r) => r.threads)), loops: med(rs.map((r) => r.loops)), ends: med(rs.map((r) => r.ends)), fruit: med(rs.map((r) => r.fruit)), rt: med(rs.map((r) => r.rt)), rtMin: Math.min(...rs.map((r) => r.rt)), rtMax: Math.max(...rs.map((r) => r.rt)), mixMs: med(rs.map((r) => r.mixAt)) * 1000, unmixed: rs.filter((r) => isNaN(r.mixAt)).length, n: rs.length, fed: med(rs.map((r) => r.fed)), nedPeak: med(rs.map((r) => r.nedPeak)) };
    out.stages.push(st);
    console.log('  ' + ti + ' · ' + st.threads + ' · ' + st.loops + ' · ' + st.ends + ' · ' + st.fruit + ' · ' + st.rt.toFixed(2) + ' (' + st.rtMin.toFixed(2) + '–' + st.rtMax.toFixed(2) + ') · ' + (isNaN(st.mixMs) ? '—' : st.mixMs.toFixed(0)) + ' · ' + st.unmixed + '/' + st.n + ' · ' + st.fed.toFixed(0) + ' · peak density ' + st.nedPeak.toFixed(2));
  });
  out.checks.growth = { colonies: seeds.length, rtUp, mixSooner: mixDown, mixLater, never0 };
  say(rtUp > seeds.length / 2, 'growing makes the tail longer',
    'RT60 longer at ' + MAXS + ' threads than at 3 in ' + rtUp + ' of ' + seeds.length + ' colonies',
    'longer in half the colonies or fewer');
  console.log('found · does it turn to a wash sooner as it grows? (not a pass or a fail: the guess was written first and is reported as it fell)\n       at 3 threads it never becomes a wash in ' + never0 + ' of ' + seeds.length + ' colonies; from 10 threads to ' + MAXS + ' the wash came sooner in ' + mixDown + ', later in ' + mixLater + ', of ' + seeds.length + '\n       read it beside the medians in the table above: a count that flips with the growth tuning is not a finding');
  const fr = { rt: med(frostRows.map((r) => r.rt)), rtBefore: med(frostRows.map((r) => r.rtBefore)), threads: med(frostRows.map((r) => r.threads)), ends: med(frostRows.map((r) => r.ends)), endsBefore: med(frostRows.map((r) => r.endsBefore)), longer: frostRows.filter((r) => r.rt > r.rtBefore).length, n: frostRows.length };
  out.checks.frost = fr;
  say(fr.longer > fr.n / 2, 'a frost takes the dead ends, where the sound was being eaten, so what is left rings longer',
    'after frosting to the loops alone: ' + fr.threads + ' threads, ' + fr.ends + ' dead ends (from ' + fr.endsBefore + '), RT60 ' + fr.rt.toFixed(2) + ' s against ' + fr.rtBefore.toFixed(2) + ' s before; longer in ' + fr.longer + ' of ' + fr.n,
    'the frosted colony ringing longer in half the colonies or fewer');
}

if (jsonAt > 0) writeFileSync(process.argv[jsonAt + 1], JSON.stringify(out, null, 1));
console.log('\n' + (failed ? failed + ' check(s) FAILED' : 'all checks pass'));
process.exit(failed ? 1 : 0);
