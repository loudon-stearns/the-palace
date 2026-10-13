// render_etude_2b.mjs — Étude No. 2, second draft: "Told Whole, With an Answer".
// What changed from render_etude_2.mjs: a real kick (see the kick block), and a B section
// (bars 25–32, 19.2 s) where a second character answers the motif. Everything after bar 24
// moves back by E = 8 bars. Outputs etude_two_b_*.
//
// The first draft's header, unchanged:
// render_etude_2.mjs — Étude No. 2, "One Sphere, Told Whole". Loudon heard
// Étude No. 1 as a story whose sections each had a mood, and asked for the
// whole story told, with a clear tempo and groove in some sections, and with
// motif, repetition, sequence and variation wherever the pitch moves.
//
// Same rule as No. 1: every voice is RNBO/torus_2d_hopf.codebox, run as
// written (via RNBO/codebox_transpile.mjs) on a catalog WAV. The score is
// only knob moves, read every 32 samples, linear between. The drums are the
// codebox too: the kick is the Membrane surface with a fast baseHz drop, the
// hat is Chladni Ghost scanned off-ratio at a high rate with stir up.
//
//   node render_etude_2.mjs  -> etude_two_told_whole.wav (not committed; the
//                               .m4a is), etude_two_locks.json,
//                               $TMPDIR/etude_two_mono.wav
//   python3 etude_spectrogram_2.py $TMPDIR/etude_two_mono.wav etude_two_told_whole.png
//   afconvert -f m4af -d aac -b 256000 etude_two_told_whole.wav etude_two_told_whole.m4a
//
// THE MOTIF. M = A C E D: scale steps 0 3 7 5, rhythm 1 · ½ · ½ · 2 beats —
// one bar. It is heard rubato in the prologue, in tempo as the knot's
// ostinato (repeated, then sequenced up a fourth and a fifth, then down a
// tone, then a cadence), augmented and inverted under the hands, and slowly
// once more in the coda as the sphere goes back to one point.
//
// THE DEAD LINES IN TIME. Let go with coupling at zero and the slip rate is
// baseHz·(a+b)·|height − (a−b)/(a+b)|, so a height offset sets it exactly.
// In the knot's let-go the Knot Shadow slips at eighth notes and Penrose at
// quarter notes: the mistuning plays the groove.
//
// VOICING BY EAR'S-EYE. Each surface on each lock puts its energy on some
// partials and not others, so a note is written as the partial that sounds
// (measured with the codebox, 2026-10-13): Penrose read as a 1D synth is a
// chord on harmonics 3, 9, 11 of its scan rate, loudest on the 3rd, so
// pitch = 6·baseHz. Penrose is exactly five equal plane waves, (11,0),
// (−3,±10), (±9,−6), so every lock makes it a five-note chord on fixed
// harmonics; on 1:2 those are 4, 12, 16, 24 and 22 of f0 — an open fifth
// chord with one blue note — so the pad's root is 4·f0 = 8·baseHz/3. Knot Shadow on 1:1 is
// 88% fundamental, pitch = baseHz. (Knot Shadow on 3:2, as in No. 1, is a
// near-pure sine on the 5th harmonic, a whistle two octaves and a third up.)
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { loadCodebox, readWav } from '../RNBO/codebox_transpile.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const SR = 48000, DUR = 130, N = DUR * SR, CR = 32;
const make = loadCodebox(path.join(here, '../RNBO/torus_2d_hopf.codebox'));
const wav = (f) => readWav(path.join(here, '../Wavetables', f));

const H = (a, b) => (a - b) / (a + b);         // height of the a:b lock
const slipDh = (base, a, b, hz) => hz / (base * (a + b));  // height offset for a slip rate
const BPM = 100, B = 60 / BPM, BAR = 4 * B, T0 = 28;       // groove starts at 28 s
const bar = (n, beat = 0) => T0 + (n - 1) * BAR + beat * B; // bar 1 beat 0 = 28 s
const E = 8 * BAR;   // the B section (bars 25–32) pushes everything after it back by 8 bars = 19.2 s
const A = 220, st = (s) => A * Math.pow(2, s / 12);
const M = { steps: [0, 3, 7, 5], beats: [1, 0.5, 0.5, 2] };

// A breakpoint track. step() holds the old value up to t then moves in r s.
class Tr {
  constructor(v) { this.p = [[0, v]]; }
  get v() { return this.p[this.p.length - 1][1]; }
  get t() { return this.p[this.p.length - 1][0]; }
  to(t, v) { if (t <= this.t) t = this.t + 1e-4; this.p.push([t, v]); return this; }
  hold(t) { if (t > this.t) this.p.push([t, this.v]); return this; }
  step(t, v, r = 0.003) { this.hold(t); return this.to(t + r, v); }
}
const tracks = (init) => Object.fromEntries(Object.entries(init).map(([k, v]) => [k, new Tr(v)]));

// a motif statement: steps transposed, durations scaled; returns notes [t, dur, hz]
function phrase(t, mot, { tr = 0, aug = 1, inv = false, beat = B } = {}) {
  const out = []; let u = t;
  mot.steps.forEach((s, i) => { const d = mot.beats[i] * beat * aug; out.push([u, d, st(tr + (inv ? -s : s))]); u += d; });
  return out;
}
// play notes on a voice: baseHz moves while the gain is down; last note may sustain
function play(v, notes, toBase, vel, { legato = 0.88, sustainLast = false } = {}) {
  notes.forEach(([t, d, hz], i) => {
    v.baseHz.step(t, toBase(hz), 0.001);
    v.gain.step(t + 0.001, vel, 0.006);
    if (sustainLast && i === notes.length - 1) return;
    v.gain.to(t + d * legato, vel * 0.72).to(t + d - 0.006, 0);
  });
}

// ---------------------------------------------------------------- PENROSE
const pen = tracks({ baseHz: 440 / 6, height: -1, longitude: 0.25, coupling: 0, het: 0, gain: 0 });
const p1D = (hz) => hz / 6, pPad = (hz) => 3 * hz / 8, PAD = pPad(220);   // PAD: baseHz for an A3-rooted chord on 1:2
// I. One point (0–14 s): height −1 is the plain 1D synth, pitch = 2·baseHz. M rubato, twice.
// Written an octave up (A4): a pure sine wants the register.
play(pen, phrase(1.0, M, { tr: 12, beat: 1.6 }), p1D, 0.4);
play(pen, phrase(7.4, { steps: [0, 3, 7, 5], beats: [1.3, 0.65, 0.65, 4.0] }, { tr: 12, beat: 1.0 }), p1D, 0.4, { sustainLast: true });
// Staircase (14–28 s): rise to 1:5, then step through the locks on an accelerating pulse,
// landing on 1:2 (the pad's lock) on the downbeat. The last four steps fall one per bar at
// 100 BPM: the tempo arrives inside the staircase, before the drums.
pen.baseHz.hold(14).to(18, PAD); pen.coupling.step(14, 6, 0.5);
pen.height.hold(14).to(18, H(1, 5));
const stairs = [[bar(-2), 1, 4], [bar(-1), 1, 3], [bar(0), 2, 5], [bar(1), 1, 2]];
for (const [t, a, b] of stairs) pen.height.step(t, H(a, b), 0.03);
pen.gain.hold(14).to(16, 0.3);
// II. The knot, in tempo: Penrose is the pad, pumped by the kick (gain dips on every kick).
const kicks = [];
for (let n = 1; n <= 12; n++) kicks.push(bar(n), bar(n, 1.5), bar(n, 2), ...(n % 4 === 0 ? [bar(n, 3.5)] : []));
for (let n = 13; n <= 16; n++) kicks.push(bar(n), bar(n, 2));                // let-go: the floor only
for (let n = 17; n <= 24; n++) kicks.push(bar(n), bar(n, 2.5));              // hands: half-time
for (let n = 25; n <= 32; n++) kicks.push(bar(n), bar(n, 2), ...(n % 2 === 0 ? [bar(n, 3.5)] : [])); // B: plain 1 and 3
kicks.push((E + 85.6), (E + 87.0), (E + 88.8), (E + 91.4));                                          // tempo dissolves
const penHits = kicks.filter((t) => t >= T0 && t < (E + 85.6));
for (const t of penHits) pen.gain.step(t, 0.07, 0.004).to(t + 0.28, 0.3);
pen.longitude.hold(28).to((E + 85), 0.3);
// let go: Penrose slips at QUARTER notes (bars 13–16), grabbed on bar 17
pen.coupling.step(bar(13), 0, 0.05).step(bar(17), 6, 0.02);
pen.height.step(bar(13), H(1, 2) + slipDh(PAD, 1, 2, 1 / B), 0.05).step(bar(17), H(1, 2), 0.02);
pen.het.step(bar(12, 3), 0.7, 0.3).step(bar(17), 0.25, 0.5);
// B (bars 25–32): the pad finally moves. Roots F, C, G, E, two bars each, then home to A.
for (const [n, s] of [[25, -4], [27, 3], [29, -2], [31, -5], [33, 0]]) pen.baseHz.step(bar(n) - 0.004, pPad(st(s)), 0.008);
// V. Let go together (85.6–95): coupling off, height off the ratio, free time
pen.coupling.step((E + 85.6), 0, 0.3).step((E + 95), 8, 0.05);
pen.height.step((E + 85.6), H(1, 2) + 0.02, 1.5).step((E + 95), H(1, 2), 0.05);
pen.het.step((E + 85.6), 0.7, 0.5);
pen.gain.step((E + 85.6), 0.3, 0.05);
// Coda (95–110): grabbed on 1:2, M slowly once more, then height AND baseHz glide back to the
// opening — the 1D synth's A4 sine, one point again
pen.gain.step((E + 95), 0.0, 0.01);
play(pen, phrase((E + 95.2), M, { beat: 1.25 }), pPad, 0.38);
play(pen, [[(E + 100.2), 9.6, st(0)]], pPad, 0.38, { sustainLast: true });
pen.height.step((E + 101.0), -1, 5.0);
pen.baseHz.hold((E + 101.0)).to((E + 106.0), p1D(st(12)));
pen.coupling.step((E + 103.0), 0, 3.0);   // on the 1D point nothing needs holding; coupling left on only wobbles it
pen.het.step((E + 100.2), 0, 1.0);
pen.gain.hold((E + 106)).to((E + 109.8), 0);

// ------------------------------------------------------------ KNOT SHADOW
// Locked on 1:1, Knot Shadow sounds its fundamental: baseHz = the note.
const knot = tracks({ baseHz: 220, height: H(1, 1), longitude: 0, coupling: 5, het: 0.8, gain: 0 });
const kb = (hz) => hz;
const ost = [
  ...phrase(bar(5), M), ...phrase(bar(6), M),                    // the motif, and again
  ...phrase(bar(7), M, { tr: 5 }), ...phrase(bar(8), M, { tr: 7 }), // sequenced up a fourth, a fifth
  ...phrase(bar(9), M), ...phrase(bar(10), M, { tr: -2 }),         // home, then down a tone
  ...phrase(bar(11), { steps: [7, 5, 3, 2], beats: [1, 1, 1, 1] }), // the cadence down
  [bar(12), 4 * B, st(0)],
];
play(knot, ost, kb, 0.3);
// let go (bars 13–16): hold the tonic, coupling off, slip at EIGHTH notes; grabbed on bar 17
play(knot, [[bar(13), 4 * 4 * B, st(0)]], kb, 0.3, { sustainLast: true });
knot.coupling.step(bar(13), 0, 0.05).step(bar(17), 6, 0.02);
knot.height.step(bar(13), H(1, 1) + slipDh(220, 1, 1, 2 / B), 0.05).step(bar(17), H(1, 1), 0.02);
// IV. under the hands: M augmented, sequenced, then inverted, then a cadence
const hands = [
  ...phrase(bar(17), M, { aug: 2 }), ...phrase(bar(19), M, { tr: 5, aug: 2 }),
  ...phrase(bar(21), M, { inv: true, tr: 12, aug: 2 }),
  ...phrase(bar(23), { steps: [5, 3, 2, 0], beats: [2, 2, 2, 2] }),
];
knot.gain.step(bar(17) - 0.01, 0, 0.005);
play(knot, hands, kb, 0.24);
// B: the melody answers the whistle with the motif's head (A C E) in the gaps, then
// takes the whole motif back on the dominant: once on A, once up a fifth.
const head = { steps: [0, 3, 7], beats: [0.5, 0.5, 1] };
play(knot, [...phrase(bar(26, 2), head), ...phrase(bar(28, 2), head), ...phrase(bar(30, 2), head),
            ...phrase(bar(31), M), ...phrase(bar(32), M, { tr: 7 })], kb, 0.26);
// V. let go together: the tonic held, slipping fast against the others
play(knot, [[(E + 85.6), 12, st(0)]], kb, 0.26, { sustainLast: true });
knot.coupling.step((E + 85.6), 0, 0.3).step((E + 95), 8, 0.05);
knot.height.step((E + 85.6), H(1, 1) - 0.02, 1.5).step((E + 95), H(1, 1), 0.05);
knot.longitude.to(110, 0.25);
knot.gain.hold((E + 95)).to((E + 102), 0);

// ------------------------------------------------- SINE CYCLE SWEEP, THE KICK
// No. 2's first draft used Membrane on 1:1, which puts its energy on harmonics 2–4
// (measured: 12/22/32/23 %), so a 48 Hz kick sounded at 100–200 Hz, a tom. Here the kick is
// the 1D point (height −1) on the Sine Cycle Sweep, whose row 0 is one pure sine, pitch =
// 2·baseHz: 150 → 64 → 46 Hz. The click is the surface too: longitude flicks up to row
// 0.18 (about 4 cycles per row) and falls back to 0 in 12 ms, a harmonic glissando downward.
const kick = tracks({ baseHz: 23, height: -1, longitude: 0, coupling: 0, het: 0, gain: 0 });
for (let i = 0; i < kicks.length; i++) {
  const t = kicks[i], gap = (kicks[i + 1] ?? t + 1) - t, L = Math.min(0.42, gap - 0.01);
  const v = t >= E + 85.6 ? 0.6 : 0.95;
  kick.baseHz.step(t, 75, 0.001).to(t + 0.04, 32).to(t + L, 23);
  kick.longitude.step(t, 0.18, 0.001).to(t + 0.013, 0);
  kick.gain.step(t, v, 0.002).to(t + 0.09, v * 0.7).to(t + L * 0.7, v * 0.25).to(t + L, 0);
}

// ------------------------------------------------------ CHLADNI, THE HAT
// Off every ratio (golden height, coupling 0) at a high rate, stir up: a metal tick.
const hat = tracks({ baseHz: 900, height: 0.236, longitude: 0, coupling: 0, het: 0, gain: 0, stir: 1 });
for (let n = 3; n <= 32; n++) for (let k = 0; k < 4; k++) {
  if (n >= 25) { const u = bar(n, k); hat.gain.step(u, 0.08, 0.001).to(u + 0.02, 0.02).to(u + 0.04, 0); } // B: straight eighths
  if (n >= 13 && n <= 16 && k % 2) continue;                  // thinner under the let-go
  const t = bar(n, k + 0.5), v = (k === 3 && n % 2 === 0) ? 0.26 : 0.18;
  hat.gain.step(t, v, 0.001).to(t + 0.03, v * 0.25).to(t + 0.07, 0);
  if (n % 4 === 0 && k === 3) { const u = bar(n, 3.75); hat.gain.step(u, 0.1, 0.001).to(u + 0.05, 0); }
}
hat.longitude.to((E + 85), 0.5);

// ------------------------------------------- MEMBRANE, THE HANDS (drone)
const drone = tracks({ baseHz: 55, height: 0, longitude: 0.1, coupling: 4, het: 0.5, gain: 0, bendX: 0, shear: 0, stir: 0 });
drone.gain.hold(bar(17) - 1.2).to(bar(17), 0.42).hold(bar(24, 3)).to(bar(25), 0).hold(bar(32, 2)).to(bar(33), 0.42).hold((E + 95)).to((E + 103), 0);
for (let n = 17; n <= 24; n++) {
  const s = n % 2 ? 1 : -1;
  drone.bendX.hold(bar(n)).to(bar(n, 1), 0.6 * s).to(bar(n, 3), -0.4 * s).to(bar(n + 1) - 0.01, 0);
  for (const bt of [1, 3]) drone.shear.step(bar(n, bt), 0.3, 0.004).to(bar(n, bt) + 0.3, 0); // backbeat of shear
}
drone.stir.hold(bar(17)).to(bar(21), 0.9).to(bar(22), 0.2).to(bar(24), 0.6).to((E + 85.6), 0.3).to((E + 95), 0);
drone.longitude.to(110, 0.35);
drone.coupling.step((E + 85.6), 0, 0.3).step((E + 95), 8, 0.05);
drone.height.step((E + 85.6), 0.03, 1.5).step((E + 95), 0, 0.05);

// --------------------------------------------- KNOT SHADOW, THE WHISTLE
// The B theme's voice. Knot Shadow on 3:2 is 78% one partial, the 5th harmonic of
// f0 = 2·baseHz/5, so pitch = 2·baseHz: a near-pure whistle, the opposite of the motif's
// reedy 1:1. The B theme is the motif's contrary: stepwise where M leaps, rising where M
// falls back, long-short where M is short-long, and in C major where M is A minor.
const whistle = tracks({ baseHz: 330, height: H(3, 2), longitude: 0, coupling: 8, het: 0, gain: 0 });
const wb = (hz) => hz / 2;
const Bth = { steps: [7, 8, 10, 12, 10], beats: [1.5, 0.5, 1, 1, 4] };   // E F G A G, two bars
play(whistle, [
  ...phrase(bar(25), Bth, { tr: 12 }),                                          // over F
  ...phrase(bar(27), { steps: [5, 7, 8, 10, 8], beats: Bth.beats }, { tr: 12 }), // a step down, over C
  ...phrase(bar(29), { steps: [10, 12, 14, 15, 14], beats: Bth.beats }, { tr: 12 }), // reaching up, over G
], wb, 0.2);
// bars 31–32: the whistle holds E over the motif's return, then lets go with everyone
play(whistle, [[bar(31), (E + 95) - bar(31), st(19)]], wb, 0.18, { sustainLast: true });
whistle.coupling.step(E + 85.6, 0, 0.3);
whistle.height.step(E + 85.6, H(3, 2) + 0.004, 2.0);
whistle.het.step(E + 85.6, 0.5, 0.5);
whistle.gain.hold(E + 88).to(E + 95, 0);

const VOICES = [
  { name: 'Penrose', table: '15_penrose_lattice.wav', pan: -0.35, fixed: { hetRow: 0.25, slopeMax: 41.0 }, tr: pen },
  { name: 'Knot Shadow', table: '14_knot_shadow.wav', pan: 0.4, fixed: { hetRow: 0.3505859375, slopeMax: 26.2 }, tr: knot },
  { name: 'Kick', table: '01_sine_cycle_sweep.wav', pan: 0.0, fixed: { hetRow: 0, slopeMax: 10 }, tr: kick },
  { name: 'Hat', table: '11_chladni_ghost.wav', pan: 0.55, fixed: { hetRow: 0.25, slopeMax: 170.4 }, tr: hat },
  { name: 'Whistle', table: '14_knot_shadow.wav', pan: 0.15, fixed: { hetRow: 0.3505859375, slopeMax: 26.2 }, tr: whistle },
  { name: 'Drone', table: '10_membrane.wav', pan: -0.1, fixed: { hetRow: 0.111328125, slopeMax: 14.5 }, tr: drone },
];

function at(bp, t) {
  if (t <= bp[0][0]) return bp[0][1];
  for (let i = 1; i < bp.length; i++) if (t <= bp[i][0]) {
    const [t0, v0] = bp[i - 1], [t1, v1] = bp[i];
    return v0 + (v1 - v0) * (t - t0) / (t1 - t0);
  }
  return bp[bp.length - 1][1];
}

const L = new Float32Array(N), R = new Float32Array(N), locks = {}, slipRates = {};
for (const v of VOICES) {
  const m = make(wav(v.table), SR);
  for (const k in v.fixed) m.set(k, v.fixed[k]);
  const sc = Object.fromEntries(Object.entries(v.tr).map(([k, tr]) => [k, tr.p]));
  for (const k in sc) m.set(k, sc[k][0][1]);
  // smoothers start where the score starts, as a patch loaded with these values would
  m.set('hS', sc.height[0][1]); m.set('kS', sc.coupling[0][1]); m.set('lonS', sc.longitude[0][1]);
  // measure the dead line's slip rate in the two let-go windows (cycles per second)
  const WIN = [[bar(13) + 0.6, bar(17) - 0.2], [(E + 86.8), (E + 94.6)]], slip = WIN.map(() => ({ u: null, acc: 0, n: 0 }));
  const gl = Math.cos((v.pan + 1) * Math.PI / 4), gr = Math.sin((v.pan + 1) * Math.PI / 4);
  let last = '', bad = 0, pk = 0; locks[v.name] = []; const stem = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    if (i % CR === 0) {
      const t = i / SR;
      for (const k in sc) m.set(k, at(sc[k], t));
      const lk = `${m.get('lockA')}:${m.get('lockB')}`;
      if (lk !== last) { locks[v.name].push([+t.toFixed(3), lk]); last = lk; }
      WIN.forEach(([a, b], w) => {
        if (t < a || t > b) return;
        const u = m.get('lockB') * m.get('phi2') - m.get('lockA') * m.get('phi1'), sw = slip[w];
        if (sw.u !== null) { let d = u - sw.u; d -= Math.round(d); sw.acc += d; sw.n++; }
        sw.u = u;
      });
    }
    const y = m.tick(); if (!Number.isFinite(y)) bad++;
    pk = Math.max(pk, Math.abs(y));
    L[i] += gl * y; R[i] += gr * y; stem[i] = y;
  }
  if (process.env.STEMS) fs.writeFileSync(path.join(os.tmpdir(), `etude_two_b_stem_${v.name.replace(' ', '_')}.f32`), Buffer.from(stem.buffer));
  const rate = slip.map((sw) => (sw.acc / (sw.n * CR / SR)).toFixed(3));
  slipRates[v.name] = rate.map(Number);
  console.log(`${v.name.padEnd(12)} non-finite ${bad} · stem peak ${pk.toFixed(3)} · ${locks[v.name].length} lock changes · slip Hz knot-let-go ${rate[0]} · together ${rate[1]}`);
}

let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.891 / pk;
function writeWav(p, chans) {
  const n = chans[0].length, c = chans.length, b = Buffer.alloc(44 + 4 * n * c);
  b.write('RIFF', 0); b.writeUInt32LE(36 + 4 * n * c, 4); b.write('WAVEfmt ', 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(3, 20); b.writeUInt16LE(c, 22); b.writeUInt32LE(SR, 24);
  b.writeUInt32LE(SR * 4 * c, 28); b.writeUInt16LE(4 * c, 32); b.writeUInt16LE(32, 34);
  b.write('data', 36); b.writeUInt32LE(4 * n * c, 40);
  for (let i = 0, o = 44; i < n; i++) for (let k = 0; k < c; k++, o += 4) b.writeFloatLE(chans[k][i] * g, o);
  fs.writeFileSync(p, b);
}
writeWav(path.join(here, 'etude_two_b_with_answer.wav'), [L, R]);
writeWav(path.join(os.tmpdir(), 'etude_two_b_mono.wav'), [L.map((x, i) => 0.5 * (x + R[i]))]);
fs.writeFileSync(path.join(here, 'etude_two_b_locks.json'), JSON.stringify({ bpm: BPM, peak_before_norm: pk, norm_gain: g, slip_hz_knot_letgo_and_together: slipRates, locks }, null, 1) + '\n');
console.log(`peak before normalising ${pk.toFixed(3)} · gain ${g.toFixed(3)}`);
