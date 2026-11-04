#!/usr/bin/env node
/*
  title: Scale-Stratified Identity — rich — checks
  born: 2026-11-04
  links: [[Scale-Stratified Identity]] (connects-to · rich-face-checks) · checks "Scale-Stratified Identity — rich — two scales.html"
  forward_vector: I re-run every number the two-scales piece shows, on the engine pulled out of its own
    HTML (never a copy), with the nulls that show its rules can fail both ways, and I bake the twelve-seed
    table the piece prints. I also hold the Kuramoto numbers behind the face's offer for § Instances.

  usage: node "Scale-Stratified Identity — rich — checks.mjs" [--bake]   (--bake rewrites the piece's BAKED block)
*/
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PIECE = join(HERE, 'Scale-Stratified Identity — rich — two scales.html');
let src = readFileSync(PIECE, 'utf8');
const between = (s, a, b) => { const i = s.indexOf(a), j = s.indexOf(b, i); if (i < 0 || j < 0) throw new Error('marker missing: ' + a); return s.slice(i, j + b.length); };
const load = (s) => new Function(between(s, '/* ENGINE:START', '/* ENGINE:END */') + '\n' + between(s, '/* MEASURE:START', '/* MEASURE:END */') + '\nreturn { SSI, RULES, cellReport, netReport };')();
const { SSI, RULES, cellReport, netReport } = load(src);
let fails = 0; const ok = (c, what) => { console.log((c ? '  ok   ' : '  FAIL ') + what); if (!c) fails++; };
const seedRun = (pattern, dSlow, seed, extra) => { SSI.OWN.wSeed = seed; SSI.OWN.nSeed = 100 + seed; const R = SSI.run(Object.assign({ pattern, dSlow }, extra || {})); return { R, cell: cellReport(R), net: netReport(R) }; };

console.log('rules, as stated:', `|r| <= ${RULES.rBand.toFixed(3)}`, `side <= ${RULES.sideMax.toFixed(3)}`, `move >= ${RULES.distMin.toFixed(3)}`);

console.log('\n1 · one spike from rest');
const o0 = SSI.oneSpike(0, 2000, 200), o2 = SSI.oneSpike(0.2, 2000, 200);
console.log(`  page's neuron: threshold back within 0.5 mV after ${o0.thBack.toFixed(1)} ms; membrane within 0.1 mV of rest after ${o0.vBack.toFixed(1)} ms; left at 200 ms ${o0.thEnd.toFixed(3)} mV`);
console.log(`  slow +0.2 mV: threshold back after ${o2.thBack.toFixed(1)} ms; left at 200 ms ${o2.thEnd.toFixed(3)} mV`);
ok(Math.abs(o0.thBack - 10 * Math.log(4 / 0.5)) < 0.2, 'fast recovery matches τ ln(4/0.5) = 20.8 ms');
ok(o2.thEnd < RULES.baseTol, 'one spike cannot show the slow term (left < 0.5 mV): the walk needs many');

console.log('\n2 · the four arms, seed 7');
const arms = {};
for (const pattern of ['sequence', 'shuffled']) for (const dSlow of [0, 0.2]) {
  const a = seedRun(pattern, dSlow, 7); arms[pattern + dSlow] = a; const { cell, net, R } = a;
  console.log(`  ${pattern.padEnd(8)} slow ${dSlow}: ${(R.tEnd / 1000).toFixed(1)} s, cell holds ${cell.holds} (worst base ${cell.maxBase.toFixed(3)} mV, first bad ${cell.firstBad + 1 || '-'}, rec1 ${cell.rec1.toFixed(2)} clear-max ${cell.recClearMax.toFixed(2)} any-max ${cell.recMax.toFixed(1)} ms, inside ${cell.inside}, after rest ${cell.rest.toFixed(4)}) | net ${net.verdict} r ${net.r.toFixed(3)} side ${net.side.toFixed(3)} move ${net.dist.toFixed(3)} moved>0.25 ${(net.moved * 100).toFixed(0)}%`);
}
ok(arms.sequence0.cell.holds && arms.shuffled0.cell.holds, "page's neuron: 'no' holds in both arms (true by construction; bound 0.15 mV)");
ok(arms.sequence0.cell.maxBase <= 4 / (1 - Math.exp(-2 / 10)) * Math.exp(-5) + 1e-9, 'worst baseline within the analytic bound 22.07 mV × e^-5 = 0.149 mV');
ok(arms.sequence0.cell.firstRecAny >= 0, 'the first-written recovery rule (every spike) does fail in the page\'s neuron, as the piece discloses');
ok(!arms['sequence0.2'].cell.holds && !arms['shuffled0.2'].cell.holds, 'slow inactivation on: the cell fails the rule (the mechanism-level "no" can fail)');
ok(arms['sequence0.2'].cell.restHolds && arms['shuffled0.2'].cell.restHolds, 'slow inactivation on: after 10 s of quiet it is back within 0.1 mV');
ok(arms.sequence0.net.verdict === 'completely', 'in order, seed 7: completely');
ok(arms.shuffled0.net.verdict === 'barely', 'shuffled, seed 7: barely (the control)');
const rate = (a) => a.R.spikesAll.reduce((s, v) => s + v, 0) / 8 / (a.R.tEnd / 1000);
console.log(`  mean rate per cell: in order ${rate(arms.sequence0).toFixed(2)} Hz, shuffled ${rate(arms.shuffled0).toFixed(2)} Hz`);
ok(Math.abs(rate(arms.sequence0) / rate(arms.shuffled0) - 1) < 0.1, 'the control is rate-matched within 10%');

console.log('\n3 · the network rules can fail both ways (calibration)');
{ const N = 8, w0 = SSI.initWeights(N, 7);
  const same = netReport({ N, w0, w: Float64Array.from(w0) }); ok(same.verdict === 'barely', `unchanged network → barely (r ${same.r.toFixed(3)})`);
  let pass = 0; for (let s = 1000; s < 1200; s++) { const v = netReport({ N, w0, w: SSI.initWeights(N, s) }); if (v.verdict === 'completely') pass++; }
  console.log(`  an unrelated random network passes "completely" ${pass} of 200 times`);
  ok(pass >= 140, 'an unrelated network usually passes, so the rule is reachable'); }

console.log('\n4 · twelve starting networks, slow inactivation off');
const seeds = Array.from({ length: 12 }, (_, i) => i + 1), baked = { date: '2026-11-04', seeds, arms: [] };
for (const [pattern, label] of [['sequence', 'in order'], ['shuffled', 'same spikes, shuffled']]) {
  const r = [], verdict = []; let holds = 0;
  for (const s of seeds) { const a = seedRun(pattern, 0, s); r.push(+a.net.r.toFixed(3)); verdict.push(a.net.verdict); if (a.cell.holds) holds++; }
  const complete = verdict.filter(v => v === 'completely').length;
  console.log(`  ${label.padEnd(22)} r ${r.map(v => v.toFixed(2)).join(' ')} · completely ${complete}/12 · cell holds ${holds}/12`);
  baked.arms.push({ label, r, verdict, complete });
}
ok(baked.arms[1].complete === 0 && baked.arms[1].verdict.every(v => v === 'barely'), 'shuffled: barely on every seed');
ok(baked.arms[0].complete >= 9, 'in order: completely on most seeds');
// far edges: what is left of the start where "completely" fails
{ const a = seedRun('sequence', 0, 11), N = 8; let near = 0, far = 0, nn = 0, nf = 0;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (i !== j) { const k = Math.abs(i - j), d = Math.abs(a.R.w[i * N + j] - a.R.w0[i * N + j]); if (k >= 6) { far += d; nf++; } else { near += d; nn++; } }
  console.log(`  seed 11 (${a.net.verdict}, r ${a.net.r.toFixed(3)}): mean move, edges 1–5 apart ${(near / nn).toFixed(3)}, edges 6–7 apart ${(far / nf).toFixed(3)}`); }

console.log('\n5 · Kuramoto (for the offer on § Instances): N 24, speeds evenly ±1, K = 2 × 4/π');
{ const N = 24, g = 1, K = 2 * 4 * g / Math.PI, dt = 0.002, T = 400, tm = 200; const w = Array.from({ length: N }, (_, i) => -g + 2 * g * i / (N - 1)); let th = w.map((_, i) => i * 2.399 % (2 * Math.PI)), at = null, r = 0, psi = 0;
  for (let s = 0; s * dt < T; s++) { let cx = 0, cy = 0; for (const p of th) { cx += Math.cos(p); cy += Math.sin(p); } cx /= N; cy /= N; r = Math.hypot(cx, cy); psi = Math.atan2(cy, cx); if (s * dt >= tm && !at) at = th.slice(); th = th.map((p, i) => p + dt * (w[i] + K * r * Math.sin(psi - p))); }
  let maxRun = 0, maxOff = 0; th.forEach((p, i) => { const run = (p - at[i]) / (T - tm), off = Math.atan2(Math.sin(p - psi), Math.cos(p - psi)); maxRun = Math.max(maxRun, Math.abs(run)); maxOff = Math.max(maxOff, Math.abs(off - Math.asin(w[i] / (K * r)))); });
  console.log(`  r ${r.toFixed(3)}; every running speed within ${maxRun.toExponential(1)} of the group's (natural speeds span ±1); phase offset = asin(ω/Kr) within ${maxOff.toExponential(1)} rad; the ends sit ${(Math.asin(1 / (K * r)) * 180 / Math.PI).toFixed(1)}° ahead and behind`);
  ok(maxRun < 1e-3, 'locked: no oscillator runs at its own natural speed'); }

if (process.argv.includes('--bake')) {
  const block = '/* BAKED:START */\nconst BAKED = ' + JSON.stringify(baked) + ';\n/* BAKED:END */';
  src = src.replace(between(src, '/* BAKED:START', '/* BAKED:END */'), block); writeFileSync(PIECE, src); console.log('\nbaked into the piece');
} else {
  const m = between(src, '/* BAKED:START', '/* BAKED:END */').match(/const BAKED = (\{[\s\S]*\});/);
  ok(!!m && JSON.stringify(JSON.parse(m[1])) === JSON.stringify(baked), 'the piece\'s baked table matches this run');
}
console.log(fails ? `\n${fails} FAILED` : '\nall checks pass'); process.exit(fails ? 1 : 0);
