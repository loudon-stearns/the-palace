// rich-checks.mjs — re-checks the claims Wavetable Space as Torus's rich-face pieces make, on the
// pieces' own engines (the code between ENGINE-START and ENGINE-END in each piece), headless.
//
//   node "Wavetable Space as Torus/workshop/rich-checks.mjs"
//
// Each check prints what it measured and PASS or FAIL against the claim. Exit 1 on any FAIL.
// The worklets are rebuilt from each piece's own template and run here with a stub host, so the
// samples checked are the samples the piece plays.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const bundle = join(here, '..');
const ENTRY = 'Wavetable Space as Torus';
const html = (piece) => readFileSync(join(bundle, `${ENTRY} — rich — ${piece}.html`), 'utf8');

function engine(piece, names) {
  const m = html(piece).match(/\/\*ENGINE-START\*\/([\s\S]*?)\/\*ENGINE-END\*\//);
  if (!m) throw new Error(`no engine block in ${piece}`);
  return new Function(`${m[1]}\nreturn { ${names.join(', ')} };`)();
}
// The piece's WORKLET template, filled with the engine's own functions, run with a stub host.
function worklet(piece, E, fnNames, sr) {
  const t = html(piece).match(/const WORKLET = `([\s\S]*?)`;\n/);
  if (!t) throw new Error(`no worklet in ${piece}`);
  const src = new Function(...fnNames, 'return `' + t[1] + '`;')(...fnNames.map((n) => E[n]));
  let Cls = null;
  class AudioWorkletProcessor { constructor() { this.port = { onmessage: null }; } }
  new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', src)(AudioWorkletProcessor, (_, C) => (Cls = C), sr);
  const node = new Cls();
  return { send: (d) => node.port.onmessage({ data: d }), run: (n) => { const out = new Float64Array(n); for (let i = 0; i < n; i += 128) { const L = new Float32Array(128), R = new Float32Array(128); node.process([], [[L, R]]); out.set(L.subarray(0, Math.min(128, n - i)), i); } return out; } };
}
let fails = 0;
const say = (ok, what, detail) => { if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}${detail ? `\n      ${detail}` : ''}`); };
const pct = (v) => (100 * v).toFixed(4) + ' %';
function dftAt(y, f, sr, K) { const e = []; for (let k = 1; k <= K; k++) { let re = 0, im = 0; const w = 2 * Math.PI * k * f / sr; for (let i = 0; i < y.length; i++) { re += y[i] * Math.cos(w * i); im -= y[i] * Math.sin(w * i); } e.push(2 * (re * re + im * im) / (y.length * y.length)); } return e; }

// ───────────── which knot ─────────────
{
  const E = engine('which knot', ['TABLE', 'tableOf', 'knotOf', 'valueAt', 'loopWave', 'harmonics', 'energyMoved', 'dcAndPeak', 'spectrumHz', 'energyMovedHz', 'PHASE']);
  const k = (p, q) => E.knotOf(p, q);
  say(k(2, 3).name === 'the trefoil' && k(2, 3).crossings === 3 && k(3, 2).key === k(2, 3).key, '(2, 3) and (3, 2) are both the trefoil, 3 crossings', `${k(2, 3).name} · ${k(3, 2).name}`);
  say(k(2, 5).crossings === 5 && k(3, 4).crossings === 8 && !k(4, 1).knot, '(2, 5) has 5 crossings, (3, 4) has 8, (4, 1) is the unknot', `${k(2, 5).name} · ${k(3, 4).name} · ${k(4, 1).name}`);
  // Each ripple lands on harmonic |m p + n q|: the energy found is only on those.
  for (const [p, q] of [[2, 3], [3, 2], [2, 5], [4, 1]]) {
    const h = E.harmonics(E.loopWave(E.TABLE, p, q, 1024), 24);
    const want = new Set(E.TABLE.map(([m, n]) => Math.abs(m * p + n * q)).filter((x) => x > 0));
    const found = new Set(); h.forEach((v, i) => { if (v > 1e-9) found.add(i + 1); });
    const extra = [...found].filter((x) => !want.has(x));
    say(extra.length === 0, `(${p}, ${q}): energy only on the harmonics m·p + n·q predicts`, `found ${[...found].sort((a, b) => a - b).join(' ')}`);
  }
  const H = (kind, p, q) => E.harmonics(E.loopWave(E.tableOf(kind), p, q, 1024), 24);
  // The test holds the phase rate at PHASE Hz, so each path loops at PHASE / p; compare by frequency.
  const Hz = (kind, p, q) => E.spectrumHz(H(kind, p, q), E.PHASE / p);
  const sameKnot = E.energyMovedHz(Hz('varied', 2, 3), Hz('varied', 3, 2));
  const sameKnotFlatHz = E.energyMovedHz(Hz('flat', 2, 3), Hz('flat', 3, 2));
  const diffKnotFlatHz = E.energyMovedHz(Hz('flat', 2, 3), Hz('flat', 2, 5));
  say(sameKnotFlatHz < 1e-9 && diffKnotFlatHz < 1e-9, 'the control: at one phase rate, a flat table sounds the same on every path', `(3, 2) ${pct(sameKnotFlatHz)} · (2, 5) ${pct(diffKnotFlatHz)}`);
  const loopHeld = E.energyMoved(H('varied', 2, 3), H('varied', 3, 2)), loopHeldFlat = E.energyMoved(H('flat', 2, 3), H('flat', 3, 2));
  const diffKnotVaried = E.energyMoved(H('varied', 2, 3), H('varied', 2, 5));
  const diffKnotFlat = E.energyMoved(H('flat', 2, 3), H('flat', 2, 5));
  const sameKnotFlat = E.energyMoved(H('flat', 2, 3), H('flat', 3, 2));
  say(sameKnot > 0.3, 'same knot, different sound: (3, 2) against (2, 3) on the varied table, phase held at 220 Hz', `moved ${pct(sameKnot)} (with the loop held instead: ${pct(loopHeld)}; on the flat table that swap alone moves ${pct(loopHeldFlat)})`);
  say(diffKnotFlat < 1e-9, 'different knots, same sound: (2, 5) against (2, 3) on the flat table', `moved ${pct(diffKnotFlat)}`);
  console.log(`      for the record, loop held at 110 Hz: (2, 5) vs (2, 3) varied ${pct(diffKnotVaried)} · (3, 2) vs (2, 3) flat ${pct(sameKnotFlat)}`);
  // The worklet plays the loop the engine draws: (2, 3) at 110 Hz, 1 s at 48 kHz, harmonics at k·110 Hz.
  const sr = 48000, W = worklet('which knot', E, ['valueAt'], sr);
  const { dc, peak } = E.dcAndPeak(E.TABLE, 2, 3);
  W.send({ params: { terms: E.TABLE, p: 2, q: 3, F: 110, dc, norm: 0.45 / peak } }); W.send({ on: true });
  W.run(sr); const y = W.run(sr);
  const played = dftAt(y, 110, sr, 24), drawn = H('varied', 2, 3);
  say(E.energyMoved(played, drawn) < 1e-3, 'the worklet plays the drawn loop: harmonics of 110 Hz match the engine', `moved ${pct(E.energyMoved(played, drawn))}`);
}

// ───────────── one winding three speeds ─────────────
{
  const E = engine('one winding three speeds', ['FIELD', 'SPEEDS', 'pathAt', 'valueAt', 'loopWave', 'harmonics', 'energyMoved', 'centroid', 'windings', 'render', 'harmonicsAt', 'dcAndPeak']);
  const P = { field: E.FIELD, p: 2, q: 3, r: 1, eps: 0, bend: 0 }, sr = 48000;
  const per = E.SPEEDS.map((F) => ({ F, h: E.harmonicsAt(E.render(P, F, sr, 1), F, sr, 40) }));
  let worst = 0; for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) worst = Math.max(worst, E.energyMoved(per[i].h, per[j].h));
  say(worst < 1e-4, 'the page’s experiment: (2, 3, 1) at 64, 96, 144 Hz, cut from 48 kHz renders, has one spread of energy per cycle', `worst moved between speeds ${pct(worst)} · brightness ${per.map((s) => E.centroid(s.h).toFixed(3)).join(' / ')} harmonics = ${per.map((s) => Math.round(E.centroid(s.h) * s.F)).join(' / ')} Hz`);
  // The control the experiment lacks: other closed paths pass too.
  for (const [p, q, r] of [[2, 5, 1], [1, 0, 0]]) { const Q = { ...P, p, q, r }; const hs = E.SPEEDS.map((F) => E.harmonicsAt(E.render(Q, F, sr, 1), F, sr, 40)); let w = 0; for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) w = Math.max(w, E.energyMoved(hs[i], hs[j]));
    say(w < 1e-4, `any closed path passes the three-speed test: (${p}, ${q}, ${r})`, `worst moved ${pct(w)}`); }
  const plain = E.harmonics(E.loopWave(P, 2048), 40);
  const want = new Set(E.FIELD.map(([m, n, l]) => Math.abs(2 * m + 3 * n + l)).filter((x) => x > 0)); const found = new Set(); plain.forEach((v, i) => { if (v > 1e-9) found.add(i + 1); });
  say([...found].every((x) => want.has(x)), 'even speed: each ripple lands on harmonic m·2 + n·3 + l·1', `found ${[...found].sort((a, b) => a - b).join(' ')}`);
  for (const [eps, bend] of [[0.2, 0], [0, 0.05], [0.4, 0], [0, 0.1]]) {
    const Q = { ...P, eps, bend }, w = E.windings(Q).join(', ');
    const mv = E.energyMoved(plain, E.harmonics(E.loopWave(Q, 2048), 40));
    say(w === '2, 3, 1' && mv > 0.01, `same winding, ${eps ? `uneven speed ε = ${eps}` : `bent path b = ${bend} laps`}: the timbre per cycle changes`, `winding (${w}) · moved ${pct(mv)}`);
  }
  // The worklet plays render(): 96 Hz, eps 0.2.
  const W = worklet('one winding three speeds', E, ['pathAt', 'valueAt'], sr), Q = { ...P, eps: 0.2 };
  const { dc, peak } = E.dcAndPeak(Q); W.send({ params: { ...Q, F: 96, dc, norm: 0.45 / peak } }); W.send({ on: true }); W.run(sr);
  const played = dftAt(W.run(sr), 96, sr, 40), drawn = E.harmonics(E.loopWave(Q, 2048), 40);
  say(E.energyMoved(played, drawn) < 1e-3, 'the worklet plays the drawn loop (96 Hz, ε = 0.2)', `moved ${pct(E.energyMoved(played, drawn))}`);
}

// ───────────── one twist or many ─────────────
{
  const E = engine('one twist or many', ['NP', 'F0', 'AMPS', 'excessB', 'excessApprox', 'excessesB', 'excessesTwist', 'cycle', 'mismatch', 'bestTwist', 'freqsB', 'freqsTwist']);
  const B = 0.0005;
  const e1 = E.excessB(1, B), e16 = E.excessB(16, B), a16 = E.excessApprox(16, B);
  say(Math.abs(E.excessApprox(4, 0.0001) - E.excessB(4, 0.0001)) / E.excessB(4, 0.0001) < 0.01, 'the page’s π·B·n³ holds while B·n² is small', `B = 0.0005: n = 8 exact ${E.excessB(8, B).toFixed(4)}, approx ${E.excessApprox(8, B).toFixed(4)} · n = 16 exact ${e16.toFixed(4)}, approx ${a16.toFixed(4)} (${(100 * (a16 - e16) / e16).toFixed(1)} % over)`);
  say(Math.round(e16 / e1) > 1000, 'B’s excess is not linear in n: partial 16 runs ahead of partial 1 far more than 16 times', `B = 0.0005: ${Math.round(e16 / e1)} ×; any single twist: 16 ×`);
  const sanity = E.bestTwist(E.excessesTwist(0.3, 1));
  say(sanity.R < 1e-8 && Math.abs(sanity.beta - 0.3) < 1e-4, 'the search finds a twist when one exists', `β found ${sanity.beta.toFixed(6)} · mismatch ${sanity.R.toExponential(2)}`);
  const rows = [];
  for (const b of [0.0001, 0.0005, 0.002]) { const r = [1, 10, 100].map((L) => E.bestTwist(E.excessesB(b, L))); rows.push(`B = ${b}: ${r.map((x, i) => `${[1, 10, 100][i]} lap${i ? 's' : ''} β ${x.beta.toFixed(4)} mismatch ${(100 * x.R).toFixed(1)} %`).join(' · ')}`); if (b === 0.0005) say(r[0].R > 0.01 && r[2].R > r[0].R, 'no single twist matches B’s lap, and it misses more with laps (B = 0.0005)', rows[rows.length - 1]); }
  console.log('      for the record:\n      ' + rows.join('\n      '));
  const tw = E.freqsTwist(0.25); say(tw.every((f, i) => Math.abs(f / tw[0] - (i + 1)) < 1e-12), 'a twist only retunes: its partials stay whole multiples', `fundamental ${tw[0].toFixed(3)} Hz`);
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
