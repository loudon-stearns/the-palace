// render_etude_2c.mjs — Étude No. 2, third draft: "In the Threshold".
// Loudon on the second draft: too quantized, too rigid, musically too simple. Melodic sections
// want the glides and vibrato of a voice or a violin; rhythmic sections want a subtle swing and a
// beat from outside Europe; some sections should let the tempo slide, as No. 1 did; the ending is
// the best part. So this draft keeps the story and the ending, and changes how time and pitch move:
//
//   1. 12/8, not 4/4. The beat is a dotted quarter split in three. The motif A C E D keeps its
//      short-long shape as 3 · 2 · 1 · 6 eighths, which swings by itself.
//   2. The three eighths in a beat are not even: short, medium, long (MICRO below), the way
//      jembe drumming from Mali stretches its triplets. Drums also get a few ms of seeded push/pull.
//   3. A West African bell pattern (x.x.xx.x.x.x, the 12/8 "standard pattern") on Chladni Ghost,
//      a kick that walks the four beats against it, and a shaker on every eighth.
//   4. A tempo map. Time is beats through a BPM curve: an accelerando into the groove, a
//      ritardando-and-back inside the knot's let-go (the slip rates follow the tempo down and up),
//      a breathing rubato in the B theme, and the free-time ending kept as it was.
//   5. Sung notes. Every melodic voice slides into tied notes (longer on leaps, like a violin
//      shift), scoops into detached ones, and blooms a delayed vibrato on long notes. Vibrato is an
//      LFO on baseHz — what a [cycle~] into [param baseHz] would do in the patch.
//
// Same rule as before: every voice is RNBO/torus_2d_hopf.codebox, run as written (via
// RNBO/codebox_transpile.mjs) on a catalog WAV; the score is only knob moves, read every 32
// samples, linear between; only the mix is outside the codebox.
//
//   node render_etude_2c.mjs  -> etude_two_c_threshold.wav, etude_two_c_locks.json,
//                                $TMPDIR/etude_two_c_mono.wav
//   python3 etude_spectrogram_2c.py $TMPDIR/etude_two_c_mono.wav etude_two_c_threshold.png
//   afconvert -f m4af -d aac -b 256000 etude_two_c_threshold.wav etude_two_c_threshold.m4a
//
// Voicing, measured with the codebox (unchanged from 2b): Penrose as a 1D synth sounds 2·baseHz…
// written here as hz/6 because its loudest partial is the 3rd of the scan rate; Penrose on 1:2 is
// a five-note chord rooted at 8·baseHz/3; Knot Shadow on 1:1 is 88% fundamental (pitch = baseHz);
// Knot Shadow on 3:2 is a near-pure whistle at 2·baseHz; Sine Cycle Sweep row 0 is one sine.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { loadCodebox, readWav } from '../RNBO/codebox_transpile.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const SR = 48000, CR = 32;
const make = loadCodebox(path.join(here, '../RNBO/torus_2d_hopf.codebox'));
const wav = (f) => readWav(path.join(here, '../Wavetables', f));

const H = (a, b) => (a - b) / (a + b);                      // height of the a:b lock
const slipDh = (base, a, b, hz) => hz / (base * (a + b));    // height offset for a slip rate
const A = 220, st = (s) => A * Math.pow(2, s / 12);

// ------------------------------------------------------------------ TIME
// g = beats (dotted quarters) from bar 1. Tempo is a breakpoint curve in g; time is its integral.
const T0 = 28;
const TEMPO = [
  [-12, 50], [0, 80],                       // staircase: the tempo arrives, accelerating
  [48, 80], [56, 56], [64, 80],             // let-go: slide down, then back up to catch bar 17
  [92, 80], [96, 70],                       // end of the hands: lean back into the answer
  [99, 76], [102, 67], [104, 71],           // B, phrase 1: push in, breathe out
  [107, 77], [110, 66], [112, 70],          // phrase 2
  [115, 79], [118, 65], [120, 72],          // phrase 3, the reach
  [124, 78], [128, 62],                     // the motif comes back, then ritardando into the let-go
];
const bpm = (g) => {
  if (g <= TEMPO[0][0]) return TEMPO[0][1];
  for (let i = 1; i < TEMPO.length; i++) if (g <= TEMPO[i][0]) {
    const [g0, b0] = TEMPO[i - 1], [g1, b1] = TEMPO[i]; return b0 + (b1 - b0) * (g - g0) / (g1 - g0);
  }
  return TEMPO[TEMPO.length - 1][1];
};
const DG = 1 / 192, GMIN = -16, GMAX = 132, tab = new Float64Array(Math.round((GMAX - GMIN) / DG) + 1);
for (let i = 1; i < tab.length; i++) { const g = GMIN + i * DG; tab[i] = tab[i - 1] + DG * 30 * (1 / bpm(g - DG) + 1 / bpm(g)); }
const off = tab[Math.round(-GMIN / DG)];
const Tg = (g) => { const x = (g - GMIN) / DG, i = Math.min(Math.floor(x), tab.length - 2), f = x - i; return T0 + tab[i] + f * (tab[i + 1] - tab[i]) - off; };
const bar = (n, beat = 0) => Tg((n - 1) * 4 + beat);
// the three eighths of a beat land short, medium, long: 0.31 · 0.335 · 0.355 of the beat
const MICRO = [0, 0.31, 0.645];
const be = (n, e) => Tg((n - 1) * 4 + Math.floor(e / 3) + MICRO[((e % 3) + 3) % 3]);
const TEND = bar(33);
const C = (x) => TEND + (x - 85.6);         // the ending, kept in 2b's free time, measured from bar 33
const hum = (i, ms = 4) => ms / 1000 * (((Math.sin(i * 12.9898 + 4.1) * 43758.5453) % 1 + 1) % 1 - 0.5) * 2;

// motifs in eighths
const M = { steps: [0, 3, 7, 5], e: [3, 2, 1, 6] };            // A C E D, one bar of 12/8
// a statement from bar n, eighth e0: notes [t, dur, hz]
function phrase(n, e0, mot, { tr = 0, aug = 1, inv = false } = {}) {
  const out = []; let e = e0;
  mot.steps.forEach((s, i) => {
    const d = mot.e[i] * aug, t = be(n, e), t1 = be(n, e + d);
    out.push([t, t1 - t, st(tr + (inv ? -s : s))]); e += d;
  });
  return out;
}

// A breakpoint track. step() holds the old value up to t then moves in r s.
class Tr {
  constructor(v) { this.p = [[0, v]]; this.c = 1; }
  get v() { return this.p[this.p.length - 1][1]; }
  get t() { return this.p[this.p.length - 1][0]; }
  to(t, v) { if (t <= this.t) t = this.t + 1e-4; this.p.push([t, v]); return this; }
  hold(t) { if (t > this.t) this.p.push([t, this.v]); return this; }
  step(t, v, r = 0.003) { this.hold(t); return this.to(t + r, v); }
  at(t) {  // monotone cursor: the render asks in time order
    const p = this.p; if (p.length === 1 || t <= p[0][0]) return p[0][1];
    while (this.c < p.length - 1 && p[this.c][0] < t) this.c++;
    const [t0, v0] = p[this.c - 1], [t1, v1] = p[this.c];
    if (t >= t1) return v1;
    return v0 + (v1 - v0) * (t - t0) / (t1 - t0);
  }
}
const tracks = (init) => Object.fromEntries(Object.entries({ cents: 0, vib: 0, ...init }).map(([k, v]) => [k, new Tr(v)]));

// detached notes (drum-like or pad): baseHz moves while the gain is down
function play(v, notes, toBase, vel, { legato = 0.88, sustainLast = false } = {}) {
  notes.forEach(([t, d, hz], i) => {
    v.baseHz.step(t, toBase(hz), 0.001);
    v.gain.step(t + 0.001, vel, 0.006);
    if (sustainLast && i === notes.length - 1) return;
    v.gain.to(t + d * legato, vel * 0.72).to(t + d - 0.006, 0);
  });
}
// sung notes: tied notes slide (longer on a leap, landing on the beat), detached ones scoop up from
// below, long ones bloom a delayed vibrato. Depth in cents.
function sing(v, notes, toBase, vel, o = {}) {
  const { glide = 0.055, leap = 0.15, scoop = -40, vib = 18, delay = 0.22, rise = 0.45, sustainLast = false, tie = true, swell = 1.0 } = o;
  notes.forEach(([t, d, hz], i) => {
    const prev = notes[i - 1], next = notes[i + 1];
    const tied = tie && prev && Math.abs(prev[0] + prev[1] - t) < 0.02;
    const tiedNext = tie && next && Math.abs(t + d - next[0]) < 0.02;
    if (tied) {
      const big = Math.abs(12 * Math.log2(hz / prev[2])) >= 5;
      const g = Math.min(big ? leap : glide, 0.45 * prev[1]);
      v.baseHz.hold(t - g).to(t, toBase(hz));
      v.gain.to(t, vel);
      v.vib.to(t, v.vib.v * 0.35);
    } else {
      v.baseHz.step(t, toBase(hz), 0.001);
      v.cents.step(t, scoop, 0.001).to(t + 0.08, 0);
      v.gain.step(t + 0.001, vel, 0.008);
      v.vib.step(t, 0, 0.002);
    }
    if (d > delay + 0.12 && vib > 0) v.vib.hold(t + delay).to(t + Math.min(d * 0.9, delay + rise), vib);
    if (sustainLast && i === notes.length - 1) { v.gain.to(t + Math.min(d, 1.5), vel * swell); return; }
    if (tiedNext) v.gain.to(t + d * 0.8, vel * 0.82).hold(next[0]);
    else v.gain.to(t + d * 0.85, vel * 0.72).to(t + d - 0.008, 0);
  });
}

// ---------------------------------------------------------------- PENROSE
const pen = tracks({ baseHz: 440 / 6, height: -1, longitude: 0.25, coupling: 0, het: 0, gain: 0 });
const p1D = (hz) => hz / 6, pPad = (hz) => 3 * hz / 8, PAD = pPad(220);
// I. One point (0–14 s): the plain 1D synth, M sung rubato twice, now with slides and vibrato.
const rub = (t0, beats, k) => { let u = t0; return M.steps.map((s, i) => { const d = beats[i] * k; const n = [u, d, st(12 + s)]; u += d; return n; }); };
sing(pen, rub(1.0, [1, 0.5, 0.5, 2], 1.6), p1D, 0.4, { vib: 22, leap: 0.22 });
sing(pen, rub(7.4, [1.3, 0.65, 0.65, 4.0], 1.0), p1D, 0.4, { vib: 26, leap: 0.25, sustainLast: true });
pen.vib.hold(13.6).to(14.4, 0);
// Staircase: rise to 1:5, then step through the locks on the accelerating pulse, landing on 1:2.
pen.baseHz.hold(14).to(bar(-2) - 0.2, PAD); pen.coupling.step(14, 6, 0.5);
pen.height.hold(14).to(bar(-2) - 0.2, H(1, 5));
for (const [t, a, b] of [[bar(-2), 1, 4], [bar(-1), 1, 3], [bar(0), 2, 5], [bar(1), 1, 2]]) pen.height.step(t, H(a, b), 0.03);
pen.gain.hold(14).to(16, 0.3);

// ------------------------------------------------------------------ DRUMS
// kick in eighths: groove (bars 1–12) walks the beats with a push on the 'and' of 2; let-go: the
// four beats only; hands: half-time 3+3+2; B: a frame drum, low on 1, soft on 3, pickup.
const kickE = [];   // [bar, eighth, vel]
for (let n = 1; n <= 12; n++) kickE.push([n, 0, 1], [n, 4, 0.55], [n, 6, 0.85], ...(n % 2 === 0 ? [[n, 10, 0.6]] : []), ...(n % 4 === 0 ? [[n, 11, 0.5]] : []));
for (let n = 13; n <= 16; n++) for (const e of [0, 3, 6, 9]) kickE.push([n, e, e ? 0.6 : 0.85]);
for (let n = 17; n <= 24; n++) kickE.push([n, 0, 1], [n, 4, 0.5], [n, 8, 0.8]);
for (let n = 25; n <= 32; n++) kickE.push([n, 0, 0.8], [n, 6, 0.45], ...(n % 2 === 0 ? [[n, 11, 0.4]] : []));
const kicks = kickE.map(([n, e, v], i) => [be(n, e) + hum(i, 3), v]);
for (const t of [C(85.6), C(87.0), C(88.8), C(91.4)]) kicks.push([t, 0.6]);       // tempo dissolves
const penHits = kicks.filter(([t]) => t >= T0 && t < TEND);
penHits.forEach(([t, v], i) => { const gap = (penHits[i + 1]?.[0] ?? t + 1) - t;
  pen.gain.step(t, 0.3 - 0.23 * v, 0.004).to(t + Math.min(0.3, gap - 0.01), 0.3); });
pen.longitude.hold(28).to(C(85), 0.3);
// let go (bars 13–16): Penrose slips at the BEAT, and the beat slows and comes back
pen.coupling.step(bar(13), 0, 0.05).step(bar(17), 6, 0.02);
pen.het.step(bar(12, 3), 0.7, 0.3).step(bar(17), 0.25, 0.5);
// B (bars 25–32): the pad moves. Roots F, C, G, E, two bars each, then home to A.
for (const [n, s] of [[25, -4], [27, 3], [29, -2], [31, -5], [33, 0]]) pen.baseHz.step(bar(n) - 0.004, pPad(st(s)), 0.012);
// V. Let go together, free time
pen.coupling.step(C(85.6), 0, 0.3).step(C(95), 8, 0.05);
pen.het.step(C(85.6), 0.7, 0.5);
pen.gain.step(C(85.6), 0.3, 0.05);
// Coda: grabbed on 1:2, M slowly once more (sung), then height AND baseHz glide back to one point
pen.gain.step(C(95), 0.0, 0.01);
{ let u = C(95.2); const notes = M.steps.map((s, i) => { const d = [1, 0.5, 0.5, 2][i] * 1.25; const n = [u, d, st(s)]; u += d; return n; });
  sing(pen, notes, pPad, 0.38, { vib: 12, leap: 0.3, tie: false });
  sing(pen, [[C(100.2), 9.6, st(0)]], pPad, 0.38, { vib: 10, delay: 1.0, rise: 2.5, sustainLast: true }); }
pen.vib.hold(C(104)).to(C(106), 0);
pen.baseHz.hold(C(101.0)).to(C(106.0), p1D(st(12)));
pen.coupling.step(C(103.0), 0, 3.0);
pen.het.step(C(100.2), 0, 1.0);
pen.gain.hold(C(106)).to(C(109.8), 0);
// the height track last, in time order: let-go slip that follows the tempo, then B, the ending, the coda
pen.height.hold(bar(13));
for (let g = 48; g <= 64; g += 0.5) pen.height.to(Tg(g), g < 64 ? H(1, 2) + slipDh(PAD, 1, 2, bpm(g) / 60) : H(1, 2));
pen.height.step(C(85.6), H(1, 2) + 0.02, 1.5).step(C(95), H(1, 2), 0.05);
pen.height.step(C(101.0), -1, 5.0);

// ------------------------------------------------------------ KNOT SHADOW
// Locked on 1:1, Knot Shadow sounds its fundamental: baseHz = the note. Reedy, sung.
const knot = tracks({ baseHz: 220, height: H(1, 1), longitude: 0, coupling: 5, het: 0.8, gain: 0 });
const kb = (hz) => hz;
// II. the knot: the ostinato, swung by the 12/8 and sung with small slides.
const ost = [
  ...phrase(5, 0, M), ...phrase(6, 0, M),
  ...phrase(7, 0, M, { tr: 5 }), ...phrase(8, 0, M, { tr: 7 }),
  ...phrase(9, 0, M), ...phrase(10, 0, { steps: [0, 3, 7, 8, 7, 5], e: [3, 2, 1, 2, 1, 3] }, { tr: -2 }), // varied: a turn
  ...phrase(11, 0, { steps: [7, 5, 3, 2], e: [3, 3, 3, 3] }),
  ...phrase(12, 0, { steps: [0], e: [12] }),
];
sing(knot, ost, kb, 0.3, { vib: 14, glide: 0.04, leap: 0.09 });
// let go (bars 13–16): hold the tonic; coupling off; slip at the EIGHTH as the tempo slides
sing(knot, [[bar(13), bar(17) - bar(13), st(0)]], kb, 0.3, { vib: 0, sustainLast: true });
knot.coupling.step(bar(13), 0, 0.05).step(bar(17), 6, 0.02);
knot.height.hold(bar(13));
for (let g = 48; g <= 64; g += 0.5) knot.height.to(Tg(g), g < 64 ? H(1, 1) + slipDh(220, 1, 1, 3 * bpm(g) / 60) : H(1, 1));
// IV. under the hands: M augmented and sung like a violin, sequenced, inverted, a cadence
const hands = [
  ...phrase(17, 0, M, { aug: 2 }), ...phrase(19, 0, M, { tr: 5, aug: 2 }),
  ...phrase(21, 0, M, { inv: true, tr: 12, aug: 2 }),
  ...phrase(23, 0, { steps: [5, 3, 2, 0], e: [6, 6, 6, 6] }),
];
knot.gain.step(bar(17) - 0.01, 0, 0.005);
sing(knot, hands, kb, 0.24, { vib: 24, leap: 0.18, glide: 0.08 });
// B: the melody answers the whistle with the motif's head (A C E), then takes the motif back
const head = { steps: [0, 3, 7], e: [2, 1, 3] };
// a rising sequence of the head, each one the chord tone over the moving pad: A C E over F,
// E G B over C, G B D over G
sing(knot, phrase(26, 6, head), kb, 0.26, { vib: 16 });
sing(knot, phrase(28, 6, { steps: [7, 10, 14], e: head.e }), kb, 0.26, { vib: 16 });
sing(knot, phrase(30, 6, { steps: [10, 14, 17], e: head.e }), kb, 0.26, { vib: 16 });
sing(knot, [...phrase(31, 0, M), ...phrase(32, 0, M, { tr: 7 })], kb, 0.27, { vib: 18, leap: 0.12 });
// V. let go together: the tonic held, slipping against the others
sing(knot, [[C(85.6), 12, st(0)]], kb, 0.26, { vib: 0, sustainLast: true });
knot.coupling.step(C(85.6), 0, 0.3).step(C(95), 8, 0.05);
knot.height.step(C(85.6), H(1, 1) - 0.02, 1.5).step(C(95), H(1, 1), 0.05);
knot.longitude.to(C(110), 0.25);
knot.gain.hold(C(95)).to(C(102), 0);

// ------------------------------------------------- SINE CYCLE SWEEP, THE KICK
const kick = tracks({ baseHz: 23, height: -1, longitude: 0, coupling: 0, het: 0, gain: 0 });
kicks.sort((a, b) => a[0] - b[0]);
for (let i = 0; i < kicks.length; i++) {
  const [t, vv] = kicks[i], gap = (kicks[i + 1]?.[0] ?? t + 1) - t, L = Math.min(0.42, gap - 0.01);
  const v = 0.95 * vv, top = 55 + 25 * vv;               // softer hits are also less punchy
  kick.baseHz.step(t, top, 0.001).to(t + 0.04, 32).to(t + L, 23);
  kick.longitude.step(t, 0.18 * vv, 0.001).to(t + 0.013, 0);
  kick.gain.step(t, v, 0.002).to(t + 0.09, v * 0.7).to(t + L * 0.7, v * 0.25).to(t + L, 0);
}

// ------------------------------------------------------ CHLADNI, THE BELL
// Off every ratio (golden height, coupling 0), stir up: a metal tick, tuned two ways — a low bell
// on the downbeat, a high bell on the rest of x.x.xx.x.x.x. Bars 3–24; thin in the let-go; out in B.
const bell = tracks({ baseHz: 900, height: 0.236, longitude: 0, coupling: 0, het: 0, gain: 0, stir: 1 });
const BELL = [0, 2, 4, 5, 7, 9, 11];
let bi = 0;
for (let n = 3; n <= 24; n++) for (const e of BELL) {
  if (n >= 13 && n <= 16 && !(e === 0 || e === 7)) continue;
  const t = be(n, e) + hum(1000 + bi++, 5), low = e === 0, v = low ? 0.2 : (e === 7 ? 0.17 : 0.13);
  bell.baseHz.step(t - 0.002, low ? 610 : 905, 0.001);
  bell.gain.step(t, v, 0.001).to(t + 0.03, v * 0.3).to(t + (low ? 0.12 : 0.08), 0);
}
bell.longitude.to(C(85), 0.5);

// ------------------------------------------------------ CHLADNI, THE SHAKER
// Every eighth, accented on the beat, the long third eighth leaning in: the swing you feel most.
const shk = tracks({ baseHz: 2300, height: 0.236, longitude: 0.6, coupling: 0, het: 0, gain: 0, stir: 1 });
let si = 0;
for (let n = 3; n <= 32; n++) for (let e = 0; e < 12; e++) {
  if (n >= 13 && n <= 16 && e % 3) continue;                       // let-go: beats only
  if (n >= 25 && e % 3 === 1) continue;                            // B: lighter, beat and long eighth
  const t = be(n, e) + hum(5000 + si++, 6);
  const v = (e % 3 === 0 ? 0.075 : e % 3 === 2 ? 0.05 : 0.03) * (n >= 25 ? 0.7 : 1);
  shk.gain.step(t, v, 0.004).to(t + 0.025, v * 0.4).to(t + 0.05, 0);
}

// ------------------------------------------- MEMBRANE, THE HANDS (drone)
const drone = tracks({ baseHz: 55, height: 0, longitude: 0.1, coupling: 4, het: 0.5, gain: 0, bendX: 0, shear: 0, stir: 0 });
drone.gain.hold(bar(17) - 1.2).to(bar(17), 0.42).hold(bar(24, 3)).to(bar(25), 0).hold(bar(32, 2)).to(bar(33), 0.42).hold(C(95)).to(C(103), 0);
for (let n = 17; n <= 24; n++) {
  const s = n % 2 ? 1 : -1;
  drone.bendX.hold(bar(n)).to(bar(n, 1), 0.6 * s).to(bar(n, 3), -0.4 * s).to(bar(n + 1) - 0.01, 0);
  for (const e of [3, 9]) drone.shear.step(be(n, e), 0.3, 0.004).to(be(n, e) + 0.3, 0);
}
drone.stir.hold(bar(17)).to(bar(21), 0.9).to(bar(22), 0.2).to(bar(24), 0.6).to(C(85.6), 0.3).to(C(95), 0);
drone.longitude.to(C(110), 0.35);
drone.coupling.step(C(85.6), 0, 0.3).step(C(95), 8, 0.05);
drone.height.step(C(85.6), 0.03, 1.5).step(C(95), 0, 0.05);

// --------------------------------------------- KNOT SHADOW, THE WHISTLE
// The B theme on Knot Shadow's 3:2 whistle, pitch = 2·baseHz, sung like a violin: wide slow
// vibrato, a slide on every step, the reach up taken with a long shift.
const whistle = tracks({ baseHz: 330, height: H(3, 2), longitude: 0, coupling: 8, het: 0, gain: 0 });
const wb = (hz) => hz / 2;
const Be = [5, 1, 3, 3, 12];   // long-short, two bars of eighths
sing(whistle, phrase(25, 0, { steps: [7, 8, 10, 12, 10], e: Be }, { tr: 12 }), wb, 0.2, { vib: 28, glide: 0.07, leap: 0.2, delay: 0.3 });
sing(whistle, phrase(27, 0, { steps: [5, 7, 8, 10, 8], e: Be }, { tr: 12 }), wb, 0.2, { vib: 28, glide: 0.07, leap: 0.2, delay: 0.3 });
sing(whistle, phrase(29, 0, { steps: [10, 12, 14, 15, 14], e: Be }, { tr: 12 }), wb, 0.21, { vib: 32, glide: 0.09, leap: 0.25, delay: 0.25 });
// bars 31–32: hold E over the motif's return (vibrato breathing), then let go with everyone
sing(whistle, [[bar(31), C(95) - bar(31), st(19)]], wb, 0.18, { vib: 22, delay: 0.5, rise: 1.5, sustainLast: true });
whistle.vib.hold(C(85.6)).to(C(87), 6);
whistle.coupling.step(C(85.6), 0, 0.3);
whistle.height.step(C(85.6), H(3, 2) + 0.004, 2.0);
whistle.het.step(C(85.6), 0.5, 0.5);
whistle.gain.hold(C(88)).to(C(95), 0);

const VOICES = [
  { name: 'Penrose', table: '15_penrose_lattice.wav', pan: -0.35, fixed: { hetRow: 0.25, slopeMax: 41.0 }, tr: pen, vr: 5.3 },
  { name: 'Knot Shadow', table: '14_knot_shadow.wav', pan: 0.4, fixed: { hetRow: 0.3505859375, slopeMax: 26.2 }, tr: knot, vr: 5.6 },
  { name: 'Kick', table: '01_sine_cycle_sweep.wav', pan: 0.0, fixed: { hetRow: 0, slopeMax: 10 }, tr: kick, vr: 5 },
  { name: 'Bell', table: '11_chladni_ghost.wav', pan: 0.5, fixed: { hetRow: 0.25, slopeMax: 170.4 }, tr: bell, vr: 5 },
  { name: 'Shaker', table: '11_chladni_ghost.wav', pan: -0.55, fixed: { hetRow: 0.25, slopeMax: 170.4 }, tr: shk, vr: 5 },
  { name: 'Whistle', table: '14_knot_shadow.wav', pan: 0.15, fixed: { hetRow: 0.3505859375, slopeMax: 26.2 }, tr: whistle, vr: 6.1 },
  { name: 'Drone', table: '10_membrane.wav', pan: -0.1, fixed: { hetRow: 0.111328125, slopeMax: 14.5 }, tr: drone, vr: 5 },
];

const DUR = Math.ceil(C(110) + 0.5), N = DUR * SR;
const L = new Float32Array(N), R = new Float32Array(N), locks = {}, slipRates = {};
// measure the dead lines' slip rate beat by beat through the let-go, against the tempo-made target
const LG = []; for (let g = 49; g < 63; g += 2) LG.push([Tg(g) + 0.05, Tg(g + 1) - 0.05, g + 0.5]);
const EXPECT = { 'Knot Shadow': (g) => 3 * bpm(g) / 60, Penrose: (g) => bpm(g) / 60 };
for (const v of VOICES) {
  const m = make(wav(v.table), SR);
  for (const k in v.fixed) m.set(k, v.fixed[k]);
  const knobs = Object.keys(v.tr).filter((k) => k !== 'cents' && k !== 'vib');
  for (const k of knobs) m.set(k, v.tr[k].p[0][1]);
  m.set('hS', v.tr.height.p[0][1]); m.set('kS', v.tr.coupling.p[0][1]); m.set('lonS', v.tr.longitude.p[0][1]);
  const slip = LG.map(() => ({ u: null, acc: 0, n: 0 }));
  const gl = Math.cos((v.pan + 1) * Math.PI / 4), gr = Math.sin((v.pan + 1) * Math.PI / 4);
  let last = '', bad = 0, pk = 0, vph = 0; locks[v.name] = []; const stem = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    if (i % CR === 0) {
      const t = i / SR;
      for (const k of knobs) m.set(k, v.tr[k].at(t));
      // the vibrato LFO, its rate drifting a little as a player's does
      vph += 2 * Math.PI * v.vr * (1 + 0.07 * Math.sin(2 * Math.PI * 0.21 * t)) * CR / SR;
      const c = v.tr.cents.at(t) + v.tr.vib.at(t) * Math.sin(vph);
      if (c) m.set('baseHz', v.tr.baseHz.at(t) * Math.pow(2, c / 1200));
      const lk = `${m.get('lockA')}:${m.get('lockB')}`;
      if (lk !== last) { locks[v.name].push([+t.toFixed(3), lk]); last = lk; }
      LG.forEach(([a, b], w) => {
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
  if (process.env.STEMS) fs.writeFileSync(path.join(os.tmpdir(), `etude_two_c_stem_${v.name.replace(' ', '_')}.f32`), Buffer.from(stem.buffer));
  const rate = slip.map((sw) => +Math.abs(sw.acc / (sw.n * CR / SR)).toFixed(3));
  if (EXPECT[v.name]) slipRates[v.name] = LG.map(([, , g], w) => ({ beat: g, tempo: +bpm(g).toFixed(1), want: +EXPECT[v.name](g).toFixed(3), got: rate[w] }));
  console.log(`${v.name.padEnd(12)} non-finite ${bad} · stem peak ${pk.toFixed(3)} · ${locks[v.name].length} lock changes`);
}
console.log('slip in the let-go (Hz):', JSON.stringify(slipRates));

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
writeWav(path.join(here, 'etude_two_c_threshold.wav'), [L, R]);
writeWav(path.join(os.tmpdir(), 'etude_two_c_mono.wav'), [L.map((x, i) => 0.5 * (x + R[i]))]);
const sections = [[0, 'I'], [14, 'ACCEL'], [T0, 'II KNOT 12/8'], [bar(13), 'LET GO'],
  [bar(17), 'III HANDS'], [bar(25), 'B RUBATO'], [TEND, 'IV'], [C(95), 'CODA']].map(([t, s]) => [+t.toFixed(2), s]);
fs.writeFileSync(path.join(here, 'etude_two_c_locks.json'), JSON.stringify({ meter: '12/8', tempo_map_bpm_dotted_quarter: TEMPO, micro_eighths: MICRO, duration_s: DUR, sections, peak_before_norm: pk, norm_gain: g, slip_in_let_go: slipRates, locks }, null, 1) + '\n');
console.log(`sections ${JSON.stringify(sections)} · dur ${DUR}s · peak ${pk.toFixed(3)} · gain ${g.toFixed(3)}`);
