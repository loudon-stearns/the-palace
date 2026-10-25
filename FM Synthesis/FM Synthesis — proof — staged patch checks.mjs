// ---
// title: FM Synthesis — proof — staged patch checks
// born: 2026-10-25
// links: [[FM Synthesis]] connects-to · proof-of-the-rough · [[FM Synthesis — rich — staged patch]] connects-to · checks
// forward_vector: I re-run every claim the staged patch makes, on its own engine pulled out of the page,
//   stage by stage. Progressive Staging asks that checks accumulate, so each stage's claims stay in when
//   the next stage's arrive, and a change that breaks stage 1 fails here even when it was made for stage 7.
// ---
// Run: node "FM Synthesis/FM Synthesis — proof — staged patch checks.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, 'FM Synthesis — rich — staged patch.html'), 'utf8');
const src = html.match(/const ENGINE_SRC = String\.raw`([\s\S]*?)`;/)[1];
const { Engine, ALGS } = new Function(src + '; return { Engine, ALGS };')();

const SR = 48000;
const op = (o = {}) => Object.assign({ ratio: 1, fixed: false, hz: 5, level: 0, a: 0.0001, d: 1, s: 1, r: 0.3 }, o);
const patch = (o = {}) => Object.assign({ alg: 2, fb: 0, solo: 0, velSens: 0, ops: [op({ level: 0.8 }), op(), op(), op(), op(), op()] }, o);

function render(p, { notes = [[200, 1]], secs = 1, from = 0 } = {}) {
  const e = new Engine(SR); e.setPatch(p);
  notes.forEach(([f, v], i) => e.noteOn('n' + i, f, v));
  const N = Math.round(secs * SR), x = new Float32Array(N);
  for (let o = 0; o < N; o += 128) { const L = new Float32Array(128), R = new Float32Array(128); e.render(L, R, 128); x.set(L.subarray(0, Math.min(128, N - o)), o); }
  return x.subarray(Math.round(from * SR));
}
function mag(x, f) {
  let re = 0, im = 0;
  for (let i = 0; i < x.length; i++) { const w = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / x.length); re += x[i] * w * Math.cos(2 * Math.PI * f * i / SR); im -= x[i] * w * Math.sin(2 * Math.PI * f * i / SR); }
  return Math.hypot(re, im) / x.length;
}
const db = v => 20 * Math.log10(v + 1e-12);
let pass = 0, fail = 0;
function check(stage, claim, ok, detail) { (ok ? pass++ : fail++); console.log(`${ok ? 'ok  ' : 'FAIL'}  stage ${stage} · ${claim}${detail ? '  (' + detail + ')' : ''}`); }

// Stage 1 — one operator: a sine at the note, nothing else.
{
  const x = render(patch(), { from: 0.2 });
  const f = db(mag(x, 200)), h2 = db(mag(x, 400)), h3 = db(mag(x, 600));
  check(1, 'one operator is a sine at the note', f > -40 && h2 < f - 80 && h3 < f - 80, `200 Hz ${f.toFixed(0)} dB, 400 ${h2.toFixed(0)}, 600 ${h3.toFixed(0)}`);
  const pl = render(patch({ ops: [op({ level: 0.8, a: 0.002, d: 0.5, s: 0 }), op(), op(), op(), op(), op()] }), { secs: 1.2 });
  const early = Math.max(...pl.subarray(0, 4800).map(Math.abs)), late = Math.max(...pl.subarray(48000, 57600).map(Math.abs));
  check(1, 'a decay to sustain 0 dies away', late < early * 0.01, `peak ${early.toFixed(3)} → ${late.toFixed(5)}`);
}
// Stage 2 — the threshold: slow is vibrato (energy stays near the note), fast is sidebands at carrier ± rate.
{
  const slow = render(patch({ ops: [op({ level: 0.8 }), op({ fixed: true, hz: 5, level: 10 / 5 / 10 }), op(), op(), op(), op()] }), { secs: 2, from: 0.5 });
  const near = db(mag(slow, 200)), far = db(mag(slow, 500));
  check(2, 'a 5 Hz modulator with 10 Hz depth keeps the energy near the note', far < near - 40, `200 Hz ${near.toFixed(0)}, 500 Hz ${far.toFixed(0)}`);
  const fast = render(patch({ ops: [op({ level: 0.8 }), op({ fixed: true, hz: 300, level: 300 / 300 / 10 }), op(), op(), op(), op()] }), { from: 0.2 });
  const sb = db(mag(fast, 500)), gap = db(mag(fast, 350));
  check(2, 'a 300 Hz modulator makes a sideband at 200 + 300 Hz', sb > gap + 40 && sb > -60, `500 Hz ${sb.toFixed(0)}, 350 Hz ${gap.toFixed(0)}`);
  const none = render(patch({ ops: [op({ level: 0.8 }), op({ fixed: true, hz: 300, level: 0 }), op(), op(), op(), op()] }), { from: 0.2 });
  check(2, 'depth 0 is stage 1 again', db(mag(none, 500)) < db(mag(none, 200)) - 80);
}
// Stage 3 — ratio and index.
{
  const r = (ratio, idx) => render(patch({ ops: [op({ level: 0.8 }), op({ ratio, level: idx / 10 }), op(), op(), op(), op()] }), { from: 0.2 });
  const one = r(1, 3), two = r(2, 3), bell = r(1.414, 3), zero = r(1, 0);
  check(3, '1:1 has every harmonic', [200, 400, 600, 800].every(f => db(mag(one, f)) > -50));
  check(3, '1:2 has odd harmonics only', db(mag(two, 600)) > -50 && db(mag(two, 400)) < db(mag(two, 600)) - 60 && db(mag(two, 800)) < db(mag(two, 600)) - 60);
  check(3, '1:1.414 puts a partial between the harmonics', db(mag(bell, 200 + 282.8)) > db(mag(bell, 400)) + 30, `482.8 Hz ${db(mag(bell, 482.8)).toFixed(0)}, 400 Hz ${db(mag(bell, 400)).toFixed(0)}`);
  check(3, 'index 0 is a sine again', db(mag(zero, 400)) < db(mag(zero, 200)) - 80);
}
// Stage 4 — the index over time: a strike is brighter at the start than later.
{
  const p = patch({ ops: [op({ level: 0.8, a: 0.002, d: 2.5, s: 0 }), op({ ratio: 1, level: 0.5, a: 0.002, d: 0.5, s: 0 }), op(), op(), op(), op()] });
  const early = render(p, { secs: 0.15, from: 0.05 }), late = render(p, { secs: 1.25, from: 1.15 });
  const bright = x => db(mag(x, 1000)) - db(mag(x, 200));
  check(4, 'a strike: the 5th harmonic falls faster than the fundamental', bright(early) > bright(late) + 20, `early ${bright(early).toFixed(0)} dB, late ${bright(late).toFixed(0)} dB`);
  // with sustain at 1 the decay has nothing to fall to, so any decay time gives stage 3's still index
  const flat = render(patch({ ops: [op({ level: 0.8 }), op({ level: 0.3, d: 0.05, s: 1 }), op(), op(), op(), op()] }), { from: 0.2 });
  const s3 = render(patch({ ops: [op({ level: 0.8 }), op({ level: 0.3, d: 6, s: 1 }), op(), op(), op(), op()] }), { from: 0.2 });
  check(4, 'a flat index envelope is stage 3 again', Math.abs(db(mag(flat, 600)) - db(mag(s3, 600))) < 0.01);
}
// Stage 5 — feedback, heard on the modulator alone.
{
  const fb = n => render(patch({ fb: n, solo: 2, ops: [op({ level: 0.8 }), op({ level: 1 }), op(), op(), op(), op()] }), { from: 0.2 });
  const saw = fb(7), noise = fb(9), none = fb(0);
  const h = [1, 2, 3, 4, 5].map(k => db(mag(saw, 200 * k)));
  const slope = h[0] - h[4];
  check(5, 'feedback 7 is near a sawtooth (harmonic 5 about 14 dB under 1)', slope > 9 && slope < 20 && db(mag(saw, 300)) < h[0] - 80, h.map(v => v.toFixed(0)).join(' '));
  check(5, 'feedback 9 frays into noise between the harmonics', db(mag(noise, 300)) > db(mag(saw, 300)) + 40, `300 Hz ${db(mag(noise, 300)).toFixed(0)} vs ${db(mag(saw, 300)).toFixed(0)}`);
  check(5, 'feedback 0 is a sine again', db(mag(none, 400)) < db(mag(none, 200)) - 80);
}
// Stage 6 — six operators: algorithm 2 with 3-6 silent is stage 5; algorithm 32 is additive.
{
  const p5 = patch({ fb: 4, ops: [op({ level: 0.8 }), op({ ratio: 1.414, level: 0.35 }), op({ ratio: 3 }), op({ ratio: 5 }), op({ ratio: 7 }), op({ ratio: 9 })] });
  // stage 5's patch has nothing set on operators 3-6; stage 6 opens them with other ratios, still at level 0
  const s5 = patch({ fb: 4, ops: [op({ level: 0.8 }), op({ ratio: 1.414, level: 0.35 }), op(), op(), op(), op()] });
  const a = render(p5, { secs: 0.3 }), b = render(s5, { secs: 0.3 });
  let same = true; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { same = false; break; }
  check(6, 'algorithm 2 with operators 3-6 at 0 renders stage 5 sample for sample', same);
  const add = render(patch({ alg: 32, ops: [1, 2, 3, 4, 5, 6].map(k => op({ ratio: k, level: 0.15 })) }), { from: 0.2 });
  const partials = [1, 2, 3, 4, 5, 6].map(k => db(mag(add, 200 * k))), between = db(mag(add, 300));
  check(6, 'algorithm 32 with ratios 1-6 is six partials and nothing between', partials.every(v => v > -60) && between < Math.min(...partials) - 60, partials.map(v => v.toFixed(0)).join(' '));
  // the routing table reads as the DX7 chart: count carriers per algorithm
  const carriers = ALGS.map(f => f.filter(x => (x & 3) === 0).length);
  const expect = [2, 2, 2, 2, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 3, 3, 4, 4, 4, 5, 5, 3, 3, 3, 4, 4, 5, 6];
  check(6, 'carrier counts match the DX7 chart for all 32 algorithms', carriers.every((c, i) => c === expect[i]), carriers.join(''));
}
// Stage 7 — velocity and voices.
{
  const p = patch({ velSens: 1, ops: [op({ level: 0.8 }), op({ level: 0.4 }), op(), op(), op(), op()] });
  const hard = render(p, { notes: [[200, 1]], from: 0.2 }), soft = render(p, { notes: [[200, 0.3]], from: 0.2 });
  const tilt = x => db(mag(x, 1000)) - db(mag(x, 200));
  check(7, 'a harder note is brighter, not only louder', tilt(hard) > tilt(soft) + 10, `5th harmonic re fundamental: hard ${tilt(hard).toFixed(0)} dB, soft ${tilt(soft).toFixed(0)} dB`);
  const chord = render(patch(), { notes: [[200, 1], [250, 1], [300, 1]], from: 0.2 });
  check(7, 'three notes at once all sound', [200, 250, 300].every(f => db(mag(chord, f)) > -40));
  const e = new Engine(SR); e.setPatch(patch());
  for (let i = 0; i < 10; i++) e.noteOn('n' + i, 100 + i * 10, 1);
  check(7, 'ten notes on eight voices steal the oldest, never more than eight', e.voices.filter(v => v.active).length === 8 && !e.voices.some(v => v.id === 'n0' || v.id === 'n1'));
  const still = render(patch({ velSens: 0, ops: [op({ level: 0.8 }), op({ level: 0.4 }), op(), op(), op(), op()] }), { notes: [[200, 0.3]], from: 0.2 });
  const full = render(patch({ velSens: 0, ops: [op({ level: 0.8 }), op({ level: 0.4 }), op(), op(), op(), op()] }), { notes: [[200, 1]], from: 0.2 });
  check(7, 'velocity sensitivity 0 plays every note the same, as stages 1-6 did', Math.abs(db(mag(still, 600)) - db(mag(full, 600))) < 0.01);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
