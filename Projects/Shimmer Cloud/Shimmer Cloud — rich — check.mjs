// title: Shimmer Cloud — rich — check
// born: 2026-11-03
// links: [[Shimmer Cloud]] (connects-to · rich-face-workshop) · checks "Shimmer Cloud — rich — white light.html" and "— how many.html"
// forward_vector: I run the white-light piece's own engine in Node against every claim it shows, and hold the how-many
//   piece's numbers to the measurement they came from, so a change that breaks a step fails here first.
// Run: node "Projects/Shimmer Cloud/Shimmer Cloud — rich — check.mjs"
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, 'Shimmer Cloud — rich — white light.html'), 'utf8');
const src = html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const mod = { exports: {} };
new Function('module', src)(mod); // the engine block exactly as the page runs it
const E = mod.exports;

let fails = 0;
const ok = (cond, what, got) => { console.log((cond ? '  ok   ' : '  FAIL ') + what + (got !== undefined ? '  →  ' + got : '')); if (!cond) fails++; };
const f1 = v => v.toFixed(1);

console.log('white light — the engine against what each step says');
// 1. a click: every frequency at once
let s = E.shape(E.source('click'));
ok(Math.abs(s.gap) < 2 && Math.abs(s.lows) < 2, 'step 1 · a click lands lows and highs together, at 0', `lows ${f1(s.lows)} ms, highs ${f1(s.highs)} ms`);
s = E.shape(E.source('pluck'));
ok(Math.abs(s.gap) < 3, 'step 1 · the plucked note: lows and highs together', `gap ${f1(s.gap)} ms`);
// 2. a pane of glass: plain delay moves both, sorts nothing
for (const d of [0.1, 0.3, 0.6]) {
  s = E.shape(E.lensOut(E.source('click'), d, 1, true, true));
  ok(Math.abs(s.lows - d * 1000) < 3 && Math.abs(s.highs - d * 1000) < 3, `step 2 · delay ${d * 1000} ms moves lows and highs together`, `lows ${f1(s.lows)}, highs ${f1(s.highs)}`);
}
// 3. a pitch copy: a click is unchanged; the pluck's partials move by the rate
for (const c of [-1200, -300, 700, 1200]) {
  s = E.shape(E.resample(E.source('click'), E.srcLen('click'), c));
  ok(Math.abs(s.gap) < 2, `step 3 · click shifted ${c} ¢: still no gap`, `gap ${f1(s.gap)} ms`);
}
{ // the pluck's partial 1 after +700 ¢, by the spectrum's peak near it
  const y = E.resample(E.source('pluck'), E.srcLen('pluck'), 700), re = Float64Array.from(y), im = new Float64Array(E.NP);
  E.fft(re, im, false); const df = E.SR / E.NP; let best = 0, kb = 0;
  for (let k = Math.round(250 / df); k < Math.round(420 / df); k++) { const m = re[k] ** 2 + im[k] ** 2; if (m > best) { best = m; kb = k; } }
  const want = 220 * 2 ** (700 / 1200);
  ok(Math.abs(kb * df - want) < 1.5, 'step 3 · pluck +700 ¢: partial 1 moves to 220·2^(7/12)', `${f1(kb * df)} Hz, want ${f1(want)}`);
  const sp = E.shape(y); ok(Math.abs(sp.gap) < 3, 'step 3 · pluck +700 ¢: its lows and highs still land together', `gap ${f1(sp.gap)} ms`);
}
// 4. one prism: the measured gap against tau averaged over each band; highs early mirrors it
for (const D of [0.05, 0.3, 0.6]) for (const late of [true, false]) {
  s = E.shape(E.lensOut(E.source('click'), D, 1, late, false));
  const pred = (E.bandTau(3000, 8000, D, 1, late) - E.bandTau(100, 500, D, 1, late)) * 1000;
  ok(Math.abs(s.gap - pred) < Math.max(4, 0.03 * Math.abs(pred)), `step 4 · one prism D ${D * 1000} ms, highs ${late ? 'late' : 'early'}: gap matches τ`, `${f1(s.gap)} ms, τ predicts ${f1(pred)}`);
}
{ // a narrow band lands at tau(f): 1 kHz and 6 kHz, D = 400 ms
  const y = E.lensOut(E.source('click'), 0.4, 1, true, false);
  for (const f of [1000, 6000]) { const t = E.bandArrival(y, f / 1.06, f * 1.06) * 1000, want = E.tau(f, 0.4) * 1000;
    ok(Math.abs(t - want) < 6, `step 4 · ${f} Hz lands where τ(f) says`, `${f1(t)} ms, τ ${f1(want)}`); }
  let e = 0, ex = 0; const x = E.source('click'); for (const v of y) e += v * v; for (const v of x) ex += v * v;
  ok(Math.abs(e / ex - 1) < 0.02, 'step 4 · the prism keeps every frequency at full strength (energy out ÷ in; the click’s lowest 60 Hz eased out)', (e / ex).toFixed(4));
}
// 5. the test: a cloud of each, struck by a click and by the pluck
const t0 = Date.now();
const res = {};
for (const kind of ['click', 'pluck']) {
  const a = E.cloud(kind, 'pitch'), b = E.cloud(kind, 'prism');
  res[kind] = { pitch: E.shape(E.mid(...a)), prism: E.shape(E.mid(...b)) };
}
const ms = Date.now() - t0;
for (const kind of ['click', 'pluck']) {
  const r = res[kind];
  ok(Math.abs(r.pitch.gap) < 0.1 * r.prism.gap, `step 5 · ${kind}: 600 pitch copies sort nothing (gap under a tenth of the prisms')`, `lows ${f1(r.pitch.lows)}, highs ${f1(r.pitch.highs)}, gap ${f1(r.pitch.gap)} ms, 90% within ${f1(r.pitch.spread)} ms`);
  ok(r.prism.gap > 150, `step 5 · ${kind}: 600 prisms fan it, highs late`, `lows ${f1(r.prism.lows)}, highs ${f1(r.prism.highs)}, gap ${f1(r.prism.gap)} ms, 90% within ${f1(r.prism.spread)} ms`);
}
ok(Math.abs(res.click.prism.gap - 212.9) < 25, 'step 5 · the prism cloud agrees with the steward\'s own measure (+212.9 ms, findings.json)', `${f1(res.click.prism.gap)} ms`);
console.log(`  (both clouds, both sources, rendered in ${ms} ms)`);

console.log('how many — the piece holds the measurement it shows');
const hm = readFileSync(join(here, 'Shimmer Cloud — rich — how many.html'), 'utf8');
const J = JSON.parse(readFileSync(join(here, 'Shimmer Cloud — rich — count and spread.json'), 'utf8'));
const MEAS = new Function(hm.match(/const MEAS = (\{[\s\S]*?\n\});/)[0].replace('const MEAS = ', 'return '))();
for (const r of J['count, at 5 cents']) if (MEAS.count[r.copies]) ok(MEAS.count[r.copies][0] === r.depth && MEAS.count[r.copies][1] === r.rate_hz, `count ${r.copies}: depth and rate as measured`, `${r.depth}, ${r.rate_hz}`);
for (const r of J['spread, at 400 copies']) ok(MEAS.spread[r.cents][0] === r.depth && MEAS.spread[r.cents][1] === r.rate_hz, `spread ${r.cents} ¢: depth and rate as measured`, `${r.depth}, ${r.rate_hz}`);
for (const r of J['the square: 30 or 2500 copies, 5 or 25 cents']) { const k = 'n' + r.copies + 'c' + r.cents; ok(MEAS.square[k][0] === r.depth && MEAS.square[k][1] === r.rate_hz, `square ${k}: as measured`, `${r.depth}, ${r.rate_hz}`); }
const counts = J['count, at 5 cents'], spreads = J['spread, at 400 copies'];
const cr = counts.map(r => r.rate_hz), cd = counts.map(r => r.depth);
ok(Math.max(...cr) / Math.min(...cr) < 1.5, 'count 2 → 2500 leaves the swirl rate alone (max ÷ min under 1.5)', `${Math.min(...cr)} – ${Math.max(...cr)} Hz`);
ok(Math.max(...cd) - Math.min(...cd) < 0.15, 'count 2 → 2500 leaves the swirl depth alone (within 0.15)', `${Math.min(...cd)} – ${Math.max(...cd)}`);
ok(spreads.every((r, i) => i === 0 || r.rate_hz > spreads[i - 1].rate_hz), 'spread 1 → 75 ¢ raises the swirl rate at every step', spreads.map(r => r.rate_hz).join(', '));
ok(spreads.filter(r => r.cents >= 8).every(r => Math.abs(r.rate_hz / r.predicted_hz - 1) < 0.2), 'from 8 ¢ up the rate sits within 20 % of f·ln2/1200·1.13·σ', spreads.filter(r => r.cents >= 8).map(r => r.rate_hz + '/' + r.predicted_hz).join(', '));
ok(Object.values(J['re-render error vs tracked takes']).every(e => e < 1e-4), 'the square\'s two May corners re-render from cloud.py to the bit (16-bit rounding)', JSON.stringify(J['re-render error vs tracked takes']));
console.log(fails ? `\n${fails} failed` : '\nall pass');
process.exit(fails ? 1 : 0);
