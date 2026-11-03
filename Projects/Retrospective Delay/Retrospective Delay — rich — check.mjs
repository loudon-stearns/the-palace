#!/usr/bin/env node
// title: Retrospective Delay — rich — check
// born: 2026-11-03
// links: [[Retrospective Delay]] (connects-to · rich-face-check) · checks the pieces listed in [[Retrospective Delay — rich.json]]
// forward_vector: I re-check, headless, every claim the rich face's two made pieces put on screen. I pull the engine
//   text out of both pieces, insist they carry the same engine, prove it reproduces the steward's tracked renders
//   sample for sample, then re-run the knob-placement test and the phrase-or-taps test and hold their numbers.
//   Run: node "Projects/Retrospective Delay/Retrospective Delay — rich — check.mjs"
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PIECES = ['Retrospective Delay — rich — the tape.html', 'Retrospective Delay — rich — phrase or taps.html'];
const engineOf = (f) => readFileSync(join(HERE, f), 'utf8').match(/<script type="text\/plain" id="engine">\n([\s\S]*?)<\/script>/)[1];
const texts = PIECES.map(engineOf);
let fails = 0;
const ok = (cond, what) => { console.log((cond ? '  pass  ' : '  FAIL  ') + what); if (!cond) fails++; };
ok(texts[0] === texts[1], 'both pieces carry the same engine text');
const E = new Function(texts[0] + '; return { makeTape, pluck, phrase, chord, PHRASE_ONE, PHRASE_TWO };')();

const SR = 48000, M = 96000;
const rms = (y, a, b) => { let s = 0; a = Math.floor(a); b = Math.floor(b); for (let i = a; i < b; i++) s += y[i] * y[i]; return Math.sqrt(s / (b - a)); };
const add = (dst, src, at, len) => { for (let i = 0; i < Math.min(src.length, len ?? src.length) && at + i < dst.length; i++) dst[at + i] += src[i]; };
function readWav(p) {
  const b = readFileSync(join(HERE, p)); let off = 12, data;
  while (off < b.length) { const id = b.toString('ascii', off, off + 4), sz = b.readUInt32LE(off + 4); if (id === 'data') { data = b.subarray(off + 8, off + 8 + sz); break; } off += 8 + sz; }
  const y = new Int16Array(data.length / 2); for (let i = 0; i < y.length; i++) y[i] = data.readInt16LE(i * 2); return y;
}
const q = (x) => Math.trunc(Math.max(-1, Math.min(1, x)) * 32767);   // the models' write_wav
function same(y, file) { const w = readWav(file); let d = 0; for (let i = 0; i < w.length; i++) d = Math.max(d, Math.abs(q(y[i]) - w[i])); ok(d === 0 && y.length === w.length, `reproduces ${file} sample for sample (max diff ${d} LSB)`); }
const click = (y, a, b) => { let m = 0; for (let i = a + 1; i < b; i++) m = Math.max(m, Math.abs(y[i] - y[i - 1])); return m; };
function run(x, opts) { const t = E.makeTape(SR, opts), gh = new Float64Array(x.length); for (let n = 0; n < x.length; n++) gh[n] = t.step(x[n]); return { y: x.map((s, i) => s + gh[i]), gh }; }

console.log('the engine against the steward\'s models');
const x = new Float64Array(M * 8);
add(x, E.phrase(SR, [62, 65, 69, 72, 70, 69, 65, null, 67, 70, 74, 72, 69, null, 62, null]), 0, M * 2);
add(x, E.phrase(SR, E.PHRASE_TWO), M * 5, M);
same(x, 'stage-1/witness/witness-input.wav');
same(run(x, { knob: 0.8, lag: 0.5 }).y, 'stage-1/witness/witness-A-as-specified.wav');
same(run(x, { knob: 0.8, lag: 0.5, keeps: true, smoothGate: false }).y, 'stage-1/witness/witness-B-silence-keeps.wav');
for (const smooth of [false, true]) {
  const xs = new Float64Array(M * 4); add(xs, E.chord(SR, M * 1.6 / SR), 0);
  const r = run(xs, { knob: 0.85, keeps: true, smoothGate: smooth, lag: 1 });
  same(r.y, 'stage-2-seance/' + (smooth ? 'seam-smoothed.wav' : 'seam-hard.wav'));
  const c = click(r.gh, M * 2, M * 4); ok(smooth ? c < 0.013 : c > 0.17, `seam ${smooth ? 'smoothed' : 'hard'}: largest step ${c.toFixed(4)}`);
  const xc = new Float64Array(M * 6); add(xc, E.chord(SR, M / SR), 0); add(xc, E.pluck(SR, 392, 0.6).map((v) => v * 1.2), Math.floor(M * 2.41));
  const rc = run(xc, { knob: 0.85, keeps: true, smoothGate: smooth, lag: 1 });
  same(rc.y, 'stage-2-seance/' + (smooth ? 'comein-crossfaded.wav' : 'comein-hard.wav'));
}

console.log('the tape: where the knob sits (three gestures, twelve runs)');
const P1 = E.phrase(SR, E.PHRASE_ONE), G = 0.85;
function gesture(gk, side, keeps) {          // as the piece's runGesture
  const xg = new Float64Array(5 * M); for (let i = 0; i < M; i++) xg[i] = P1[i];
  const at = gk === 'mid' ? M / 2 : gk === 'later' ? 2 * M : -1;
  const t = E.makeTape(SR, { side, keeps, lag: 0.5, knob: gk === 'still' ? G : 0 }), gh = new Float64Array(xg.length);
  for (let n = 0; n < xg.length; n++) { if (n === at) t.setKnob(G, 20); gh[n] = t.step(xg[n]); }
  const win = gk === 'still' ? [M, 1.5 * M] : gk === 'mid' ? [M / 2 + 960, M] : [3 * M, 5 * M];
  const ref = gk === 'still' ? [M / 2, M] : gk === 'mid' ? [0, M / 2 - 960] : [0, M];
  return rms(gh, ...win) / (G * rms(xg, ...ref));
}
const expect = { 'in,false': [1, 0, 0], 'in,true': [1, 0, 0], 'out,false': [1, 0.97, 0], 'out,true': [1, 0.97, 0.94] };
for (const side of ['in', 'out']) for (const keeps of [false, true]) {
  const got = ['still', 'mid', 'later'].map((g) => gesture(g, side, keeps));
  ok(got.every((v, i) => Math.abs(v - expect[side + ',' + keeps][i]) < 0.01), `knob ${side}, ${keeps ? 'silence keeps' : 'always writes'}: ${got.map((v) => v.toFixed(2)).join(' / ')}`);
}

console.log('phrase or taps');
{ const xo = new Float64Array(4 * M); for (let i = 0; i < M; i++) xo[i] = P1[i];
  const g = run(xo, { knob: 0.8, lag: 0.5 }).gh; let d = 0;
  for (let n = 0; n < xo.length; n++) d = Math.max(d, Math.abs(g[n] - 0.8 * (n >= M / 2 ? xo[n - M / 2] : 0)));
  ok(d === 0, `the always-recording tape minus a half-note echo with no feedback: max |diff| = ${d}`); }
function two(withOne, len) { const xx = new Float64Array(7 * M); if (withOne) for (let i = 0; i < M; i++) xx[i] = P1[i]; const Q = E.phrase(SR, E.PHRASE_TWO); for (let i = 0; i < Math.floor(M * len); i++) xx[3 * M + i] += Q[i]; return xx; }
function echo(xx, f, wet) { const e = new Float64Array(xx.length); for (let n = M; n < xx.length; n++) e[n] = xx[n - M] + f * e[n - M]; return e.map((v) => v * wet); }
function score(sys, f, len) {
  const a = two(true, len), b = two(false, len), wet = sys === 'echo' ? 0.8 : 0.85;
  const ga = sys === 'echo' ? echo(a, f, wet) : run(a, { keeps: true, knob: wet, lag: 0.5 }).gh;
  const gb = sys === 'echo' ? echo(b, f, wet) : run(b, { keeps: true, knob: wet, lag: 0.5 }).gh;
  const ref = rms(a, 0, M) * wet;
  return { kept: rms(ga, 2 * M, 3 * M) / ref, left: rms(ga.map((v, i) => v - gb[i]), 4 * M, 7 * M) / ref };
}
const s = score('seance', 0, 1);
ok(Math.abs(s.kept - 0.94) < 0.01 && s.left < 1e-9, `séance keeps ${s.kept.toFixed(4)}, leaves ${s.left.toExponential(1)}`);
const curve = []; for (let k = 0; k <= 50; k++) curve.push({ f: k / 50, ...score('echo', k / 50, 1) });
ok(curve.every((p) => !(p.kept >= s.kept - 0.05 && p.left <= 0.05)), 'no echo feedback both keeps phrase one and clears it under phrase two');
const e8 = score('echo', 0.8, 1), e95 = score('echo', 0.95, 1);
ok(Math.abs(e8.kept - 0.8) < 1e-6 && Math.abs(e8.left - 0.42) < 0.01, `echo f = 0.80 keeps ${e8.kept.toFixed(2)}, leaves ${e8.left.toFixed(2)}`);
console.log(`        echo f = 0.95 keeps ${e95.kept.toFixed(2)}, leaves ${e95.left.toFixed(2)}`);
const h = score('seance', 0, 0.5);
ok(h.left > 0.3, `a half-measure phrase two leaves ${h.left.toFixed(2)} of phrase one (the present erases only what it overwrites)`);

console.log(fails ? `${fails} failed` : 'all pass');
process.exit(fails ? 1 : 0);
