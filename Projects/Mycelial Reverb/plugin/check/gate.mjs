// gate.mjs — the C++ port (src/Algorithm.h) against the JavaScript engine in the piece.
//
// run:  node "Projects/Mycelial Reverb/plugin/check/gate.mjs" [--quick]
//
// The reference is the <script id="mycel-engine"> block of the piece, read from where the
// piece sits today (the Biomechanical Synthesis bundle; MYCEL_PIECE=<file> points elsewhere
// once it moves). The cases are the piece's own check script's: one thread, a fork of three,
// the junction rule, energy never rising, the torture run. Both engines run every case and
// this prints the largest difference between them, and what would have meant failure.
// MYCEL_SRC=<folder> gates another copy of Algorithm.h (used once to see the gate fail: see the README).
// It writes ../out/gate-report.json. Exit code 1 if any gate fails.
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';

const here = dirname(fileURLToPath(import.meta.url));
const plugin = join(here, '..');
const quick = process.argv.includes('--quick');
const piece = process.env.MYCEL_PIECE || join(plugin, '..', '..', 'Biomechanical Synthesis', 'Biomechanical Synthesis — rich — mycelial reverb.html');
const m = readFileSync(piece, 'utf8').match(/<script id="mycel-engine">([\s\S]*?)<\/script>/);
if (!m) { console.error('no engine block in ' + piece); process.exit(1); }
const { MycelNet, MycelColony, mycelRng } = new Function(m[1] + '\nreturn { MycelNet, MycelColony, mycelRng };')();

// ── build and run the C++ side ────────────────────────────────────────────────
let mach = plugin, found = null;
for (let i = 0; i < 8 && !found; i++) { mach = dirname(mach); try { readFileSync(join(mach, 'VST Template', 'machinery', 'src', 'ParamSpec.h')); found = join(mach, 'VST Template', 'machinery', 'src'); } catch (e) {} }
if (!found) { console.error('no VST Template/machinery above ' + plugin); process.exit(1); }
const tmp = mkdtempSync(join(tmpdir(), 'mycel-gate-'));
const bin = join(tmp, 'engine_gate');
execFileSync('clang++', ['-std=c++20', '-O2', '-ffp-contract=off', '-Wall', '-Wextra', '-I', process.env.MYCEL_SRC || join(plugin, 'src'), '-I', found, join(here, 'engine_gate.cpp'), '-o', bin], { stdio: 'inherit' });
const t0 = Date.now();
const cpp = JSON.parse(execFileSync(bin, quick ? [tmp, '--quick'] : [tmp], { encoding: 'utf8', maxBuffer: 1 << 26 }));
const cppMs = Date.now() - t0;
const f32 = (n) => { const b = readFileSync(join(tmp, n)); return new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4); };
const f64 = (n) => { const b = readFileSync(join(tmp, n)); return new Float64Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };

// ── the check script's rig, as it has it ─────────────────────────────────────
const SR = 48000, MAXS = 170, BLOCK = 512;
function rig(seed, preset, arg) {
  const net = new MycelNet(SR, MAXS);
  const col = new MycelColony({ sr: SR, maxSegs: MAXS, block: BLOCK, seed, emit: (mm) => net.msg(mm) });
  if (preset) col.reset(seed, 1000, 600, preset, arg);
  return { net, col };
}
function clone(col, par) {
  const net = new MycelNet(SR, MAXS); if (par) net.msg(Object.assign({ t: 'par' }, par));
  const ys = [];
  col.segs.forEach((s, i) => { if (s) { net.msg({ t: 'add', s: i, a: s.a, b: s.b, L: s.L }); ys.push(i, s.y); } });
  net.msg({ t: 'ys', list: ys }); net.msg({ t: 'in', n: col.inNode });
  const save = col.emit; col.emit = (mm) => net.msg(mm); col.sendTaps(); col.emit = save;
  return net;
}
function impulse(net, seconds) {
  const N = Math.round(seconds * SR), L = new Float32Array(N), R = new Float32Array(N), x = new Float32Array(BLOCK), l = new Float32Array(BLOCK), r = new Float32Array(BLOCK);
  for (let o = 0; o < N; o += BLOCK) { const n = Math.min(BLOCK, N - o); x.fill(0); if (o === 0) x[0] = 1; net.process(x, l, r, n); L.set(l.subarray(0, n), o); R.set(r.subarray(0, n), o); }
  return { L, R };
}
function phrase(seconds, seed) {
  const N = Math.round(seconds * SR), x = new Float32Array(N), r = mycelRng(seed), notes = [146.8, 174.6, 196, 220, 261.6, 293.7];
  for (let t = 0; t < seconds; t += 0.6) {
    const f = notes[Math.floor(r() * notes.length)], P = Math.round(SR / f), d = new Float32Array(P); for (let i = 0; i < P; i++) d[i] = r() * 2 - 1;
    let o = Math.round(t * SR), p = 0, prev = 0; const n = Math.min(N - o, Math.round(0.5 * SR));
    for (let i = 0; i < n; i++) { const v = d[p]; d[p] = 0.996 * 0.5 * (v + prev); prev = v; p = (p + 1) % P; x[o + i] += 0.4 * v; }
  }
  return x;
}
function growTo(rg, target, src, maxSeconds) {
  const l = new Float32Array(BLOCK), r = new Float32Array(BLOCK); let o = 0, t = 0;
  while (rg.col.nseg < target && t < maxSeconds) {
    rg.net.process(src.subarray(o, o + BLOCK), l, r, BLOCK); rg.col.feed(rg.net.en); rg.net.en.fill(0);
    o += BLOCK; if (o + BLOCK > src.length) o = 0; t += BLOCK / SR;
  }
  return t;
}
function graph(c, g) {
  g.push(c.nseg, c.segs.length, c.nodes.length, c.fruit.length, c.inNode, c.time);
  for (const s of c.segs) { if (!s) { g.push(-1); continue; } g.push(s.a, s.b, s.L, s.y, s.e); }
  for (const f of c.fruit) g.push(f.n);
}

// ── comparing ────────────────────────────────────────────────────────────────
let failed = 0; const report = { date: new Date().toLocaleDateString('sv'), quick, piece: piece.replace(/^.*Projects\//, 'Projects/'), cppMs, gates: {}, cpp };
function diff(a, b) {
  if (a.length !== b.length) return { n: a.length, nB: b.length, max: Infinity, rel: Infinity, at: -1, peak: 0, same: 0 };
  let max = 0, at = -1, peak = 0, same = 0;
  for (let i = 0; i < a.length; i++) { const d = Math.abs(a[i] - b[i]); if (d > max) { max = d; at = i; } if (d === 0) same++; const p = Math.abs(a[i]); if (p > peak) peak = p; }
  return { n: a.length, max, rel: peak ? max / peak : max, at, peak, same };
}
function relSeries(a, b) {                       // energies span many decades: compare each to its own size
  if (a.length !== b.length) return { n: a.length, nB: b.length, max: Infinity };
  let max = 0, same = 0; for (let i = 0; i < a.length; i++) { if (a[i] === b[i]) { same++; continue; } const d = Math.abs(a[i] - b[i]) / Math.max(Math.abs(a[i]), 1e-300); if (d > max) max = d; }
  return { n: a.length, max, same };
}
function say(ok, name, got, failIf) { if (!ok) failed++; console.log((ok ? 'pass' : 'FAIL') + ' · ' + name + '\n       got: ' + got + '\n       failure would have been: ' + failIf); }
const TOL = 1e-6;                                // of peak: the VST Template's engine gate. A faithful port lands near float32 rounding.
const sci = (v) => (v === 0 ? '0' : v.toExponential(2));

// one thread
{
  const { net, col } = rig(1, 'thread', 286); net.msg({ t: 'par', rt: 3, damp: 0, tip: 0.8 });
  const L = col.segs[0].L, g = net.lineGain(L), ir = impulse(net, 0.5), cL = f32('thread_L.f32'), cR = f32('thread_R.f32');
  const dL = diff(ir.L, cL), dR = diff(ir.R, cR), tap = 0.7071;
  const e1 = cL[2 * L] / tap, e2 = cL[4 * L] / tap, w1 = g * g * 0.8, w2 = Math.pow(g, 4) * Math.pow(0.8, 3);
  let stray = 0; for (let i = 1; i < cL.length; i++) if (i % (2 * L) !== 0) stray = Math.max(stray, Math.abs(cL[i]));
  report.gates.thread = { L, cppL: cpp.threadL, dL, dR, e1, w1, e2, w2, stray, gainDiff: Math.abs(g - cpp.threadGain) };
  say(cpp.threadL === L && dL.rel <= TOL && dR.rel <= TOL && Math.abs(e1 - w1) < 1e-6 && Math.abs(e2 - w2) < 1e-6 && stray === 0, 'one thread echo: the C++ impulse response against the JavaScript one, half a second',
    'largest difference ' + sci(Math.max(dL.max, dR.max)) + ' (' + sci(Math.max(dL.rel, dR.rel)) + ' of peak); ' + dL.same + ' of ' + dL.n + ' left samples identical. In the C++ alone: first echo ' + e1.toFixed(6) + ' (want ' + w1.toFixed(6) + '), second ' + e2.toFixed(6) + ' (want ' + w2.toFixed(6) + '), between the echoes ' + stray,
    'a difference over 1e-6 of peak, an echo off by more than 1e-6, or any sound between round trips');
}
// a fork of three
{
  const { net, col } = rig(1, 'fork'); net.msg({ t: 'par', rt: 3, damp: 0, tip: 0.8 });
  const L = col.segs[0].L, g = net.lineGain(L), ir = impulse(net, 0.2), cL = f32('fork_L.f32'), cR = f32('fork_R.f32');
  const dL = diff(ir.L, cL), dR = diff(ir.R, cR), e1 = cL[2 * L] / 0.7071, w1 = -g * g / 3;
  report.gates.fork = { L, dL, dR, e1, w1 };
  say(dL.rel <= TOL && dR.rel <= TOL && Math.abs(e1 - w1) < 1e-6, 'fork of three: the C++ impulse response against the JavaScript one',
    'largest difference ' + sci(Math.max(dL.max, dR.max)) + ' (' + sci(Math.max(dL.rel, dR.rel)) + ' of peak); ' + dL.same + ' of ' + dL.n + ' identical. In the C++ alone: came back ' + e1.toFixed(6) + ' (want ' + w1.toFixed(6) + ')',
    'a difference over 1e-6 of peak, or a return other than −1/3 of what arrived');
}
// junction energy
{
  const r = mycelRng(7), ratios = []; let worst = 0;
  for (let k = 0; k < 2000; k++) {
    const n = 2 + Math.floor(r() * 5), y = [], a = []; let sy = 0, S = 0, ein = 0, eout = 0; for (let i = 0; i < n; i++) { y.push(0.2 + r() * 5); a.push(r() * 2 - 1); sy += y[i]; S += Math.sqrt(y[i]) * a[i]; ein += a[i] * a[i]; }
    for (let i = 0; i < n; i++) { const o = 2 * S / sy * Math.sqrt(y[i]) - a[i]; eout += o * o; } worst = Math.max(worst, Math.abs(eout / ein - 1)); ratios.push(eout / ein);
  }
  const d = diff(Float64Array.from(ratios), f64('junction.f64'));
  report.gates.junction = { worstJs: worst, worstCpp: cpp.junctionWorst, d, engineWorst: cpp.junctionEngineWorst };
  say(d.max <= 1e-12 && cpp.junctionWorst < 1e-12 && cpp.junctionEngineWorst < 1e-5, 'junction energy: 2,000 random junctions of 2 to 6 threads, energy out over energy in',
    'the rule as arithmetic: C++ largest error ' + sci(cpp.junctionWorst) + ', JavaScript ' + sci(worst) + ', largest difference between the two ' + sci(d.max) + ' (' + d.same + ' of 2000 identical). The same junctions through the C++ engine itself, one chunk of noise on every thread: largest error ' + sci(cpp.junctionEngineWorst) + ' (the lines hold float32, so about 1e-7 is rounding)',
    'the rule off by more than 1e-12 in either language, or the engine\'s junction off by more than 1e-5');
}
// energy never rises
const food = phrase(40, 3);
{
  const dFood = diff(food, f32('food.f32'));
  const E = [], G = []; let worstStep = 0, runs = 0; const seeds = quick ? [11, 12] : [11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  for (const seed of seeds) {
    const rg = rig(seed);
    for (const target of [3, 20, 80, MAXS]) {
      if (target > 3) growTo(rg, target, food, 400);
      graph(rg.col, G);
      for (const par of [{ rt: 12, damp: 0, tip: 1 }, { rt: 12, damp: 0.9, tip: 1 }, { rt: 0.2, damp: 0, tip: 0 }, { rt: 12, damp: 0.5, tip: 0.8 }]) {
        const net = clone(rg.col, par), x = new Float32Array(64), l = new Float32Array(64), r = new Float32Array(64);
        x[0] = 1; net.process(x, l, r, 64); x[0] = 0; let prev = net.stored(); E.push(prev);
        const steps = Math.round((quick ? 2 : 6) * SR / 64);
        for (let k = 0; k < steps; k++) { net.process(x, l, r, 64); const e = net.stored(); const ratio = e / prev; if (prev > 1e-12 && ratio > worstStep) worstStep = ratio; prev = e; E.push(e); }
        runs++;
      }
    }
  }
  const dG = diff(Float64Array.from(G), f64('passive_graph.f64')), dE = relSeries(Float64Array.from(E), f64('passive_E.f64'));
  report.gates.passive = { runs, colonies: seeds.length, food: dFood, graph: dG, energy: dE, worstStepJs: worstStep, worstStepCpp: cpp.passiveWorstStep };
  say(dFood.max === 0 && dG.max <= 1e-9 && dE.max <= 1e-5 && cpp.passiveWorstStep <= 1 + 1e-6, 'energy never rises: ' + seeds.length + ' colonies grown in both engines to 3, 20, 80 and 170 threads on the same 40 s of plucked notes, then ' + runs + ' impulse runs at four control corners',
    'the grown colonies, thread for thread (ends, length in samples, thickness, energy): largest difference ' + sci(dG.max) + ' over ' + dG.n + ' numbers, ' + dG.same + ' identical. The held energy, read every 64 samples: largest difference ' + sci(dE.max) + ' of its own size over ' + dE.n + ' readings, ' + dE.same + ' identical. Largest step ratio in the C++ ' + cpp.passiveWorstStep.toFixed(9) + ' (JavaScript ' + worstStep.toFixed(9) + ')',
    'the two engines growing different colonies (any thread differing by more than 1e-9), held energy differing by more than 1e-5 of itself, or a step ratio above 1.000001 in the C++');
}
// the torture
{
  const rg = rig(99), r = mycelRng(5), x = new Float32Array(BLOCK), l = new Float32Array(BLOCK), rr = new Float32Array(BLOCK);
  const T = quick ? 20 : 60, OL = [], OR = [], E = [], G = []; let t = 0, nextJ = 0, peak = 0;
  while (t < T) {
    for (let i = 0; i < BLOCK; i++) x[i] = r() * 2 - 1;
    rg.net.process(x, l, rr, BLOCK); rg.col.feed(rg.net.en); rg.net.en.fill(0);
    OL.push(l.slice()); OR.push(rr.slice()); for (let i = 0; i < BLOCK; i++) peak = Math.max(peak, Math.abs(l[i]), Math.abs(rr[i]));
    t += BLOCK / SR;
    if (t > nextJ) { nextJ = t + 0.25; rg.net.msg({ t: 'par', rt: r() < 0.5 ? 12 : 0.2 + r() * 11.8, damp: r() < 0.5 ? 0 : r() * 0.9, tip: r() < 0.5 ? 1 : r() }); if (r() < 0.08) rg.col.frost(); if (r() < 0.3) rg.col.setIn(rg.col.nearest(r() * 1000, r() * 600)); }
  }
  graph(rg.col, G);
  rg.net.msg({ t: 'par', rt: 12, damp: 0, tip: 1 }); x.fill(0); E.push(rg.net.stored());
  for (let k = 0; k < (quick ? 5 : 20) * SR / BLOCK; k++) { rg.net.process(x, l, rr, BLOCK); E.push(rg.net.stored()); }
  const cat = (a) => { const o = new Float32Array(a.length * BLOCK); a.forEach((b, i) => o.set(b, i * BLOCK)); return o; };
  const dL = diff(cat(OL), f32('torture_L.f32')), dR = diff(cat(OR), f32('torture_R.f32')), dG = diff(Float64Array.from(G), f64('torture_graph.f64')), dE = relSeries(Float64Array.from(E), f64('torture_E.f64'));
  report.gates.torture = { seconds: T, dL, dR, graph: dG, energy: dE, peakJs: peak, peakCpp: cpp.torturePeak, threads: rg.col.nseg, threadsCpp: cpp.tortureThreads, afterDbCpp: cpp.tortureAfterDb, riseCpp: cpp.tortureRise };
  say(dL.rel <= TOL && dR.rel <= TOL && dG.max <= 1e-9 && dE.max <= 1e-5 && cpp.tortureFinite && cpp.tortureRise <= 1 + 1e-6 && cpp.tortureAfterDb < 0, 'the torture: ' + T + ' s of full-scale noise while it grows, is frosted, and every control jumps four times a second, then silence',
    'the two outputs, sample for sample: largest difference ' + sci(Math.max(dL.max, dR.max)) + ' (' + sci(Math.max(dL.rel, dR.rel)) + ' of peak ' + peak.toFixed(2) + '); ' + (dL.same + dR.same) + ' of ' + (dL.n + dR.n) + ' samples identical. Colony at the end: ' + cpp.tortureThreads + ' threads in the C++, ' + rg.col.nseg + ' in the JavaScript, largest difference thread for thread ' + sci(dG.max) + '. In the silence after, the C++ held energy fell ' + (-cpp.tortureAfterDb).toFixed(1) + ' dB and its largest step was ' + cpp.tortureRise.toFixed(9) + '; against the JavaScript, largest difference ' + sci(dE.max) + ' of its own size',
    'a difference over 1e-6 of peak, different colonies, a sample that is not a number, or held energy rising once the input stops');
}
// plugin only
report.gates.state = { loads: cpp.stateLoads, textSame: cpp.stateTextSame, bytes: cpp.stateBytes, threadsAfter: cpp.stateThreadsAfter20s, maxDiff: cpp.stateMaxDiffAfterReload, refusesDamaged: cpp.stateRefusesDamaged };
say(cpp.stateLoads && cpp.stateTextSame && cpp.stateMaxDiffAfterReload === 0 && cpp.stateRefusesDamaged && cpp.stateThreadsAfter20s[0] === cpp.stateThreadsAfter20s[1], 'plugin only (no JavaScript side): a colony of 60 threads saved as text, loaded, and fed 20 s more beside the one it was saved from',
  'loaded: ' + cpp.stateLoads + '; saved again, the same text: ' + cpp.stateTextSame + ' (' + cpp.stateBytes + ' bytes); after 20 s more food both have ' + cpp.stateThreadsAfter20s.join(' and ') + ' threads and the largest difference between their outputs is ' + sci(cpp.stateMaxDiffAfterReload) + '; cut-off and foreign text refused: ' + cpp.stateRefusesDamaged,
  'a reload that changes one sample or one thread, or damaged text accepted');
report.gates.block = { held: cpp.blockHeldMaxDiff, growing: cpp.blockGrowingMaxDiff, growingThreads: cpp.blockGrowingThreads };
say(cpp.blockHeldMaxDiff === 0, 'plugin only: the host\'s block size. The same 10 s through the dish in blocks of 512 and in ragged blocks of 1 to 700 samples',
  'held still (40 threads): largest difference ' + sci(cpp.blockHeldMaxDiff) + '. Growing: largest difference ' + sci(cpp.blockGrowingMaxDiff) + ', ending with ' + cpp.blockGrowingThreads.join(' and ') + ' threads (reported, not gated: a ragged block changes how each thread\'s energy is rounded on its way to the colony, which may or may not move a growth decision)',
  'a held dish sounding different because the host cut its blocks differently');

mkdirSync(join(plugin, 'out'), { recursive: true });
report.failed = failed;
if (!process.env.MYCEL_SRC) writeFileSync(join(plugin, 'out', 'gate-report.json'), JSON.stringify(report, (k, v) => (typeof v === 'number' && !isFinite(v) ? String(v) : v), 1));
rmSync(tmp, { recursive: true, force: true });
console.log('\nC++ side ran in ' + (cppMs / 1000).toFixed(1) + ' s · ' + (failed ? failed + ' gate(s) FAILED' : 'all gates pass') + (quick ? ' (quick)' : ''));
process.exit(failed ? 1 : 0);
