// render_etude_2e.mjs — Étude No. 2, fifth draft: "The Hero's Journey".
// Loudon on the fourth draft: grooves and melodies are growing the right way. Don't resolve every
// section's melody; stay a question. Bring back the weirder sound of the first version. Click the
// voicing atlas rhythmically as a gesture. Explore counterpoint and non-tonal sound design. Build
// the whole song as a walk through the monomyth, each sound and harmony chosen for its feeling.
//
// The cast (each one is RNBO/torus_2d_hopf.codebox on a catalog surface, nothing else):
//   the hero      Penrose — born at the pole, the plain 1D synth; the motif A C E D is its name
//   the mentor    Knot Shadow on 3:2 — a near-pure whistle; it teaches the motif upside down
//   the ally      Knot Shadow on 1:1 — the reed that sings in the grooves
//   the guardian  Chladni Ghost, off every ratio, stirred — a metal growl at the threshold
//   the trickster Matérn Field, clicked through the atlas — one pitch, a new colour every click
//   the stair     Stiff String, clicked through the atlas — on every lock it sounds its x rate,
//                 baseHz·(1−height), so the locks are a scale: the Farey scale (FAREY below).
//                 It holds A C E D almost exactly: 1:1, 2:3, 1:3, 1:2.
//   the shadow    Fisher Ridge, off every ratio, stirred and bent — the ordeal
//   the drums     Sine Cycle Sweep kick, Chladni bell and shaker, Membrane drone (the hands)
//
// The journey, in twelve chapters (times are measured by the render, see etude_two_e_locks.json):
//   1 ordinary world  the hero alone at the pole, free time
//   2 the call        the mentor whistles from off the ratio, slipping; the hero climbs three locks
//   3 refusal         coupling lets go; the hero slides back down to the pole through the
//                     irrational in-between (No. 1's sound), tries the motif, stops on E
//   4 the mentor      a two-voice canon in free time: the mentor sings the motif inverted, the
//                     hero imitates below; ends on E over G#, a question
//   5 the threshold   the guardian growls; the hero climbs the staircase for real as the tempo
//                     arrives (50 → 80)
//   6 tests, allies   12/8 groove, jembe-stretched eighths, the bell; the reed's ostinato; the
//                     trickster clicks colours in the bell's gaps; the phrase stops on B
//   7 the inmost cave the let-go: the tempo slides down and does not come back; the stair
//                     clicks down the Farey scale, one lock a beat, into the low register
//   8 the ordeal      free time. The shadow rises; the reed is torn through the atlas in
//                     leaps (55 to 1145 Hz); the hero's dead line slows to stillness. Silence.
//   9 the reward      a coupling snap, and the 7/8 aksak (2+2+3) hands: the reed's call and
//                     answer, the trickster clicking on each group; it ends on B, not A
//  10 the road back   12/8 again, accelerating 80 → 96: the stair runs an ostinato up the
//                     Farey scale; reed and mentor chase the motif in a closing stretto
//  11 resurrection    all let go at once, stirred; then every voice is grabbed together, and
//                     the motif sounds in three-voice counterpoint, the stair's bass in the
//                     strange scale; it stops on D
//  12 the return     the B theme that breathes (from the third draft), then the ending Loudon
//                     liked, unchanged in shape: let go together, the coda home to one point —
//                     with the stair's A C E D, faint, beside it: the elixir
//
// Same rule as every draft: every voice is RNBO/torus_2d_hopf.codebox, run as written (via
// RNBO/codebox_transpile.mjs) on a catalog WAV; the score is only knob moves, read every 32
// samples, linear between; only the mix is outside the codebox.
//
//   node render_etude_2e.mjs  -> etude_two_e_heros_journey.wav, etude_two_e_locks.json,
//                                $TMPDIR/etude_two_e_mono.wav
//   python3 etude_spectrogram_2e.py $TMPDIR/etude_two_e_mono.wav etude_two_e_heros_journey.png
//   afconvert -f m4af -d aac -b 256000 etude_two_e_heros_journey.wav etude_two_e_heros_journey.m4a
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { loadCodebox, readWav } from '../RNBO/codebox_transpile.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const SR = 48000, CR = 32;
const make = loadCodebox(path.join(here, '../RNBO/torus_2d_hopf.codebox'));
const wav = (f) => readWav(path.join(here, '../Wavetables', f));

const H = (a, b) => (a - b) / (a + b);
const slipDh = (base, a, b, hz) => hz / (base * (a + b));
const A = 220, st = (s) => A * Math.pow(2, s / 12);
const GOLD = 0.2360679;                                  // far from every a:b ≤ 5

// The Farey scale: Stiff String's pitch on each lock, as a multiple of baseHz (measured with the
// codebox at longitude 0 and 0.25; 65–71% of the energy on that one partial). Low to high.
const FAREY = [[5, 1], [4, 1], [3, 1], [5, 2], [2, 1], [5, 3], [3, 2], [4, 3], [5, 4], [1, 1],
  [4, 5], [3, 4], [2, 3], [3, 5], [1, 2], [2, 5], [1, 3], [1, 4], [1, 5]];
const fareyHz = ([a, b], base) => base * 2 * b / (a + b);

// ------------------------------------------------------------------ TIME
// A Clock is a run of bars through a tempo curve. 'c' bars are 12/8 with jembe-stretched eighths;
// 'a' bars are two 7/8 bars, 2+2+3, the long beat 1.4 short beats. g = beats of three eighths.
const MICRO = [0, 0.31, 0.645];
const AK = [0, 1, 2, 3, 4, 4 + 2.8 / 3, 4 + 5.6 / 3], AKL = 6.8, HB = 2 * AKL;
class Clock {
  constructor(T0, tempo, types) {
    this.T0 = T0; this.tempo = tempo; this.types = types;   // types[n-1] for bar n ≥ 1
    this.E = [0]; for (const ty of types) this.E.push(this.E[this.E.length - 1] + (ty === 'a' ? HB : 12));
    const DG = 1 / 192, GMIN = tempo[0][0] - 4, GMAX = this.E[this.E.length - 1] / 3 + 8;
    this.DG = DG; this.GMIN = GMIN; this.tab = new Float64Array(Math.round((GMAX - GMIN) / DG) + 1);
    for (let i = 1; i < this.tab.length; i++) { const g = GMIN + i * DG; this.tab[i] = this.tab[i - 1] + DG * 30 * (1 / this.bpm(g - DG) + 1 / this.bpm(g)); }
    this.off = this.tab[Math.round(-GMIN / DG)];
  }
  bpm(g) {
    const T = this.tempo; if (g <= T[0][0]) return T[0][1];
    for (let i = 1; i < T.length; i++) if (g <= T[i][0]) { const [g0, b0] = T[i - 1], [g1, b1] = T[i]; return b0 + (b1 - b0) * (g - g0) / (g1 - g0); }
    return T[T.length - 1][1];
  }
  Tg(g) { const x = (g - this.GMIN) / this.DG, i = Math.min(Math.floor(x), this.tab.length - 2), f = x - i; return this.T0 + this.tab[i] + f * (this.tab[i + 1] - this.tab[i]) - this.off; }
  ty(n) { return this.types[n - 1] ?? 'c'; }
  isAk(n) { return this.ty(n) === 'a'; }
  barE(n) { return n <= 1 ? (n - 1) * 12 : n - 1 <= this.types.length ? this.E[n - 1] : this.E[this.types.length] + (n - 1 - this.types.length) * 12; }
  blen(n) { return this.isAk(n) ? 14 : 12; }
  bar(n, beat = 0) { return this.Tg((this.barE(n) + beat * (this.isAk(n) ? HB : 12) / 4) / 3); }
  be(n, e) {
    while (e >= this.blen(n)) { e -= this.blen(n); n++; }
    while (e < 0) { n--; e += this.blen(n); }
    if (this.isAk(n)) return this.Tg((this.barE(n) + Math.floor(e / 7) * AKL + AK[e % 7]) / 3);
    return this.Tg(this.barE(n) / 3 + Math.floor(e / 3) + MICRO[e % 3]);
  }
}
const hum = (i, ms = 4) => ms / 1000 * (((Math.sin(i * 12.9898 + 4.1) * 43758.5453) % 1 + 1) % 1 - 0.5) * 2;
const rnd = (i) => ((Math.sin(i * 78.233 + 1.7) * 43758.5453) % 1 + 1) % 1;

const M = { steps: [0, 3, 7, 5], e: [3, 2, 1, 6] };            // A C E D, one bar of 12/8
const M7 = { steps: [0, 3, 7, 5], e: [2, 2, 3, 7] }, R7 = { steps: [5, 7, 3, 0], e: [2, 2, 3, 7] };
function phrase(clk, n, e0, mot, { tr = 0, aug = 1, inv = false } = {}) {
  const out = []; let e = e0;
  mot.steps.forEach((s, i) => {
    const d = mot.e[i] * aug, t = clk.be(n, e), t1 = clk.be(n, e + d);
    out.push([t, t1 - t, st(tr + (inv ? -s : s))]); e += d;
  });
  return out;
}
// free time: notes from beats [step, beats] with a slow rubato swing, beat q seconds
function free(t0, q, notes, { tr = 0, sway = 0.06, phase = 0 } = {}) {
  let b = 0; const tt = (x) => t0 + q * (x + sway * Math.sin(2 * Math.PI * x / 6 + phase));
  return notes.map(([s, d]) => { const n = [tt(b), tt(b + d) - tt(b), st(tr + s)]; b += d; return n; });
}

class Tr {
  constructor(v) { this.p = [[0, v]]; this.c = 1; }
  get v() { return this.p[this.p.length - 1][1]; }
  get t() { return this.p[this.p.length - 1][0]; }
  to(t, v) { if (t <= this.t) t = this.t + 1e-4; this.p.push([t, v]); return this; }
  hold(t) { if (t > this.t) this.p.push([t, this.v]); return this; }
  step(t, v, r = 0.003) { this.hold(t); return this.to(t + r, v); }
  at(t) {
    const p = this.p; if (p.length === 1 || t <= p[0][0]) return p[0][1];
    while (this.c < p.length - 1 && p[this.c][0] < t) this.c++;
    const [t0, v0] = p[this.c - 1], [t1, v1] = p[this.c];
    if (t >= t1) return v1;
    return v0 + (v1 - v0) * (t - t0) / (t1 - t0);
  }
}
const tracks = (init) => Object.fromEntries(Object.entries({ cents: 0, vib: 0, ...init }).map(([k, v]) => [k, new Tr(v)]));

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
// an atlas click: jump to lock a:b (the codebox smooths height over ~15 ms, so a click sweeps
// through the locks in between: that flicker is part of the sound) with a small gain dip
function click(v, t, [a, b], { dip = 0.5, lon = null } = {}) {
  v.height.step(t, H(a, b), 0.002);
  if (lon !== null) v.longitude.step(t, lon, 0.002);
  const g = v.gain.v; v.gain.step(t - 0.004, g * dip, 0.004).to(t + 0.02, g);
}

// ================================================================ VOICES
const pen = tracks({ baseHz: 440 / 6, height: -1, longitude: 0.25, coupling: 0, het: 0, gain: 0, stir: 0 });
const p1D = (hz) => hz / 6, pPad = (hz) => 3 * hz / 8, PAD = pPad(220);
const knot = tracks({ baseHz: 220, height: H(1, 1), longitude: 0, coupling: 5, het: 0.8, gain: 0 });
const kb = (hz) => hz;
const whistle = tracks({ baseHz: 330, height: H(3, 2), longitude: 0, coupling: 8, het: 0, gain: 0 });
const wb = (hz) => hz / 2;
const kick = tracks({ baseHz: 23, height: -1, longitude: 0, coupling: 0, het: 0, gain: 0 });
const bell = tracks({ baseHz: 900, height: GOLD, longitude: 0, coupling: 0, het: 0, gain: 0, stir: 1 });
const shk = tracks({ baseHz: 2300, height: GOLD, longitude: 0.6, coupling: 0, het: 0, gain: 0, stir: 1 });
const drone = tracks({ baseHz: 55, height: 0, longitude: 0.1, coupling: 4, het: 0.5, gain: 0, bendX: 0, shear: 0, stir: 0 });
const guard = tracks({ baseHz: 61, height: GOLD + 0.11, longitude: 0.3, coupling: 0, het: 0, gain: 0, stir: 0, shear: 0 });
const trick = tracks({ baseHz: 220, height: H(1, 3), longitude: 0.25, coupling: 6, het: 0, gain: 0 });
const stair = tracks({ baseHz: 220, height: H(2, 5), longitude: 0, coupling: 6, het: 0, gain: 0 });
const shadow = tracks({ baseHz: 70, height: 0.382, longitude: 0, coupling: 0, het: 0, gain: 0, stir: 0, bendX: 0 });
const kicks = [];
const sec = [];   // [t, label]

// ---------------------------------------------------- 1 · THE ORDINARY WORLD (free time)
sec.push([0, '1 HOME']);
const rub = (t0, beats, k, steps = M.steps) => { let u = t0; return steps.map((s, i) => { const d = beats[i] * k; const n = [u, d, st(12 + s)]; u += d; return n; }); };
sing(pen, rub(1.0, [1, 0.5, 0.5, 2], 1.6), p1D, 0.4, { vib: 22, leap: 0.22 });
sing(pen, rub(7.4, [1.3, 0.65, 0.65, 4.0], 1.0), p1D, 0.4, { vib: 26, leap: 0.25, sustainLast: true });
pen.vib.hold(13.6).to(14.4, 0);

// ---------------------------------------------------- 2 · THE CALL (free time)
// The mentor is heard from off the ratio: coupling 0, height a hair from 3:2, so its dead line
// sings a slow slip (het). It sings the motif's head upside down, E C# A, far away.
const TC = 14.5; sec.push([TC, '2 CALL']);
whistle.coupling.step(TC, 0, 0.01); whistle.het.step(TC, 0.55, 0.01); whistle.height.step(TC, H(3, 2) + 0.0012, 0.01);   // a 2 Hz slip
sing(whistle, free(TC + 0.6, 1.0, [[7, 2], [4, 1], [0, 3.5]], { tr: 12 }), wb, 0.12, { vib: 30, delay: 0.4, rise: 1.0, tie: false, scoop: -80 });
// the hero climbs three locks, unsure, the steps coming faster
pen.baseHz.hold(TC + 1).to(TC + 3.5, PAD); pen.coupling.step(TC + 1, 6, 0.5);
pen.height.hold(TC + 1).to(TC + 3.5, H(1, 5));
for (const [t, a, b] of [[TC + 5.6, 1, 4], [TC + 7.4, 1, 3], [TC + 8.6, 2, 5]]) pen.height.step(t, H(a, b), 0.03);
pen.gain.hold(15).to(16.5, 0.28);

// ---------------------------------------------------- 3 · REFUSAL (free time)
// Coupling lets go and the hero slides back to the pole through every ratio in between, the
// irrational smear of No. 1, then tries the motif alone and stops on E.
const TR3 = TC + 10.5; sec.push([TR3, '3 REFUSAL']);
pen.coupling.step(TR3, 0.4, 0.4); pen.het.step(TR3, 0.6, 1.0);
pen.height.hold(TR3).to(TR3 + 2.0, H(1, 3) + 0.05).to(TR3 + 6.5, -1);
pen.baseHz.hold(TR3 + 2.0).to(TR3 + 6.5, p1D(st(12)));
pen.longitude.hold(TR3).to(TR3 + 6.5, 0.4).to(TR3 + 7.5, 0.25);
pen.gain.hold(TR3 + 5.5).to(TR3 + 6.6, 0);
pen.het.step(TR3 + 6.6, 0, 0.2); pen.coupling.step(TR3 + 6.6, 0, 0.1);
whistle.gain.hold(TR3).to(TR3 + 3, 0);
sing(pen, rub(TR3 + 7.4, [1.2, 0.7, 2.4], 1.0, [0, 3, 7]), p1D, 0.36, { vib: 24, leap: 0.3, sustainLast: true, swell: 0.5 });
pen.gain.hold(TR3 + 11.0).to(TR3 + 12.0, 0); pen.vib.hold(TR3 + 11).to(TR3 + 12, 0);

// ---------------------------------------------------- 4 · THE MENTOR (free time, a canon)
// The whistle locks and sings the motif inverted (E C# A B), then a turning line. The hero
// imitates two beats later, an octave and a fifth down, then moves against it. Ends on E over G#.
const TM = TR3 + 12.4; sec.push([TM, '4 MENTOR']);
whistle.coupling.step(TM - 0.5, 8, 0.05); whistle.het.step(TM - 0.5, 0, 0.1); whistle.height.step(TM - 0.5, H(3, 2), 0.05);
const q4 = 0.82;
const ment = free(TM, q4, [[7, 2], [4, 1], [0, 1], [2, 4], [5, 1], [3, 0.5], [2, 0.5], [3, 1], [5, 1], [7, 4.5]], { tr: 12 });
const hero = free(TM, q4, [[-99, 2], [0, 2], [-3, 1], [-7, 1], [-5, 3], [0, 1], [2, 0.5], [3, 0.5], [2, 1], [0, 1], [-1, 5]], { tr: 0 }).slice(1);
sing(whistle, ment, wb, 0.2, { vib: 26, glide: 0.08, leap: 0.22, delay: 0.3, sustainLast: true, swell: 0.7 });
sing(pen, hero, p1D, 0.34, { vib: 20, glide: 0.07, leap: 0.2, sustainLast: true, swell: 0.6 });
const TM_END = ment[ment.length - 1][0] + ment[ment.length - 1][1];
whistle.vib.hold(TM_END - 1).to(TM_END + 0.5, 8); whistle.gain.hold(TM_END - 0.5).to(TM_END + 1.5, 0);
pen.gain.hold(TM_END - 0.5).to(TM_END + 1.2, 0); pen.vib.hold(TM_END).to(TM_END + 1, 0);

// ---------------------------------------------------- 5 · THE THRESHOLD → 6 · TESTS → 7 · CAVE
// Clock A: the pre-roll accelerates 50 → 80 through bars −3…0, the groove holds 80 for bars
// 1–12, and in the let-go (13–16) the tempo slides down and does NOT come back: 80 → 56 → 40.
const TA_PRE = TM_END + 1.0;
const A_TEMPO = [[-16, 46], [0, 80], [48, 80], [56, 56], [64, 40]];
let clkA = new Clock(0, A_TEMPO, Array(16).fill('c'));
const shiftA = TA_PRE - clkA.bar(-3); clkA = new Clock(shiftA, A_TEMPO, Array(16).fill('c'));
sec.push([clkA.bar(-3), '5 THRESHOLD'], [clkA.bar(1), '6 TESTS 12/8'], [clkA.bar(13), '7 CAVE']);
// the guardian: Chladni off every ratio, stirred, sheared — a metal growl that swells and leaves
guard.gain.hold(clkA.bar(-3)).to(clkA.bar(-1), 0.3).hold(clkA.bar(0, 2)).to(clkA.bar(1), 0);
guard.stir.hold(clkA.bar(-3)).to(clkA.bar(-1), 1).to(clkA.bar(1), 0.4);
guard.shear.hold(clkA.bar(-3)).to(clkA.bar(-2), 0.4).to(clkA.bar(-1), -0.3).to(clkA.bar(0), 0.45).to(clkA.bar(1), 0);
guard.baseHz.hold(clkA.bar(-1)).to(clkA.bar(1), 48);
// the hero crosses: the staircase for real, one lock a bar on the arriving pulse, landing on 1:2
pen.longitude.step(TA_PRE, 0.25, 0.1);
pen.baseHz.step(TA_PRE, PAD, 0.5); pen.coupling.step(TA_PRE, 6, 0.3); pen.height.step(TA_PRE, H(1, 5), 0.5);
pen.gain.hold(TA_PRE).to(clkA.bar(-2), 0.3);
for (const [n, a, b] of [[-2, 1, 4], [-1, 1, 3], [0, 2, 5], [1, 1, 2]]) pen.height.step(clkA.bar(n), H(a, b), 0.03);

// drums, clock A: groove (1–12) walks the beats with a push on the 'and' of 2; cave: beats only,
// thinning to the downbeat, gone by bar 16
const kA = [];
for (let n = 1; n <= 12; n++) kA.push([n, 0, 1], [n, 4, 0.55], [n, 6, 0.85], ...(n % 2 === 0 ? [[n, 10, 0.6]] : []), ...(n % 4 === 0 ? [[n, 11, 0.5]] : []));
for (let n = 13; n <= 15; n++) for (const e of (n < 15 ? [0, 3, 6, 9] : [0, 6])) kA.push([n, e, e ? 0.5 : 0.8]);
kA.push([16, 0, 0.6]);
kA.forEach(([n, e, v], i) => kicks.push([clkA.be(n, e) + hum(i, 3), v]));
const BELL = [0, 2, 4, 5, 7, 9, 11];
let bi = 0;
function bellHits(clk, n, es, lowE, accE, vs = 1) {
  for (const e of es) {
    const t = clk.be(n, e) + hum(1000 + bi++, 5), low = lowE(e), v = (low ? 0.2 : (accE(e) ? 0.17 : 0.13)) * vs;
    bell.baseHz.step(t - 0.002, low ? 610 : 905, 0.001);
    bell.gain.step(t, v, 0.001).to(t + 0.03, v * 0.3).to(t + (low ? 0.12 : 0.08), 0);
  }
}
for (let n = 3; n <= 15; n++) bellHits(clkA, n, n <= 12 ? BELL : [0, 7], (e) => e === 0, (e) => e === 7, n > 12 ? 0.7 : 1);
let si = 0;
function shaker(clk, n, { beatsOnly = false, light = false, vs = 1 } = {}) {
  const AKACC = [1, 0, 1, 0, 1, 0, 0];
  for (let e = 0; e < clk.blen(n); e++) {
    if (beatsOnly && e % 3) continue;
    if (light && e % 3 === 1) continue;
    const t = clk.be(n, e) + hum(5000 + si++, 6);
    const v = vs * (clk.isAk(n) ? (AKACC[e % 7] ? 0.07 : (e % 7 === 6 ? 0.045 : 0.03))
      : (e % 3 === 0 ? 0.075 : e % 3 === 2 ? 0.05 : 0.03) * (light ? 0.7 : 1));
    shk.gain.step(t, v, 0.004).to(t + 0.025, v * 0.4).to(t + 0.05, 0);
  }
}
for (let n = 3; n <= 14; n++) shaker(clkA, n, { beatsOnly: n > 12, vs: n > 12 ? 0.7 : 1 });

// the ally: the reed's ostinato (bars 5–12), swung and sung; it stops on B, a question
const ost = [
  ...phrase(clkA, 5, 0, M), ...phrase(clkA, 6, 0, M),
  ...phrase(clkA, 7, 0, M, { tr: 5 }), ...phrase(clkA, 8, 0, M, { tr: 7 }),
  ...phrase(clkA, 9, 0, M), ...phrase(clkA, 10, 0, { steps: [0, 3, 7, 8, 7, 5], e: [3, 2, 1, 2, 1, 3] }, { tr: -2 }),
  ...phrase(clkA, 11, 0, { steps: [7, 5, 3, 5], e: [3, 3, 3, 3] }),
  ...phrase(clkA, 12, 0, { steps: [2], e: [12] }),
];
sing(knot, ost, kb, 0.3, { vib: 14, glide: 0.04, leap: 0.09 });
// the trickster: Matérn Field holds one pitch (2·baseHz = A4 on most locks) and clicks a new lock
// into each gap in the bell, a five-lock cycle against the 12/8 so the colours never line up
const TRICK_CYC = [[1, 3], [3, 5], [5, 2], [3, 4], [4, 1]];
trick.gain.hold(clkA.bar(5) - 0.3).to(clkA.bar(5), 0.16);
let ti = 0;
for (let n = 5; n <= 12; n++) for (const e of [1, 3, 6, 8, 10]) click(trick, clkA.be(n, e), TRICK_CYC[ti++ % 5], { dip: 0.35 });
trick.gain.hold(clkA.bar(12, 3)).to(clkA.bar(13), 0);

// Penrose ducks under the kick (groove and cave)
pen.longitude.hold(clkA.bar(1)).to(clkA.bar(16), 0.3);
// 7 · cave: Penrose and the reed let go and slip at the beat and the eighth as the tempo falls;
// the reed holds B (the question) — it never gets its A back
pen.coupling.step(clkA.bar(13), 0, 0.05);
pen.het.step(clkA.bar(12, 3), 0.7, 0.3);
knot.coupling.step(clkA.bar(13), 0, 0.05);
sing(knot, [[clkA.bar(13), clkA.bar(17) - clkA.bar(13), st(2)]], kb, 0.28, { vib: 0, sustainLast: true });
knot.gain.hold(clkA.bar(15)).to(clkA.bar(17), 0.0);
pen.height.hold(clkA.bar(13));
knot.height.hold(clkA.bar(13));
for (let g = 48; g <= 64; g += 0.5) {
  pen.height.to(clkA.Tg(g), H(1, 2) + slipDh(PAD, 1, 2, clkA.bpm(g) / 60));
  knot.height.to(clkA.Tg(g), H(1, 1) + slipDh(st(2), 1, 1, 3 * clkA.bpm(g) / 60));
}
// the stair clicks down the Farey scale, one lock a beat: 2:5 (315 Hz) to 5:1 (73 Hz)
const DOWN = FAREY.slice(0, 16).reverse();   // 2:5 … 5:1
stair.height.step(clkA.bar(13) - 0.05, H(...DOWN[0]), 0.01);
stair.gain.hold(clkA.bar(13) - 0.02).to(clkA.bar(13) + 0.02, 0.24);
DOWN.forEach((lk, i) => { if (i) click(stair, clkA.Tg(48 + i), lk, { dip: 0.4 }); });
stair.gain.hold(clkA.bar(16, 3)).to(clkA.bar(17) + 1.5, 0);

// ---------------------------------------------------- 8 · THE ORDEAL (free time)
const TO = clkA.bar(17); sec.push([TO, '8 ORDEAL']);
// the shadow: Fisher Ridge off every ratio, low, stirred and bent until it churns
shadow.gain.hold(TO - 1).to(TO + 6, 0.38).hold(TO + 17).to(TO + 23, 0);
shadow.stir.hold(TO).to(TO + 12, 1).to(TO + 22, 0.3);
shadow.bendX.hold(TO + 3).to(TO + 8, 0.7).to(TO + 12, -0.6).to(TO + 16, 0.8).to(TO + 22, 0);
shadow.height.hold(TO).to(TO + 22, 0.382 - 0.05);
shadow.baseHz.hold(TO + 8).to(TO + 22, 52);
// the membrane, sheared hard, no lock
drone.coupling.step(TO, 0, 0.1); drone.height.step(TO, GOLD - 0.1, 0.1);
drone.gain.hold(TO + 4).to(TO + 8, 0.3).hold(TO + 16).to(TO + 21, 0);
drone.shear.hold(TO + 6).to(TO + 14, 0.5).to(TO + 20, -0.4);
drone.bendX.hold(TO + 6).to(TO + 12, -0.8).to(TO + 20, 0.5);
// the reed torn through the atlas: Knot Shadow re-locked in leaps, 55 to 1145 Hz, the gaps
// shrinking then stretching, like a stumble
const LEAP = [[2, 3], [3, 5], [5, 1], [3, 4], [1, 5], [4, 5], [4, 1], [2, 5], [5, 2], [3, 5], [2, 3], [1, 2]];
knot.het.step(TO, 0, 0.1); knot.coupling.step(TO, 6, 0.05); knot.baseHz.step(TO, 220, 0.01);
{ let t = TO + 3.0, gap = 0.9;
  for (let i = 0; i < 26; i++) {
    const lk = LEAP[i % LEAP.length], v = (lk[0] === 2 && lk[1] === 3 ? 0.07 : 0.17) * (0.7 + 0.3 * rnd(i));
    knot.height.step(t - 0.01, H(...lk), 0.002);
    knot.gain.step(t, v, 0.003).to(t + Math.min(0.14, gap * 0.6), 0);
    t += gap; gap = i < 14 ? Math.max(0.16, gap * 0.82) : gap * 1.16;
  } }
// the hero's dead line: coupling still 0, het up; the offset from 1:2 shrinks, so the slip
// slows to stillness — the heartbeat stopping. Then silence.
pen.gain.hold(TO).to(TO + 6, 0.24).hold(TO + 18).to(TO + 25, 0.12).to(TO + 27, 0);
pen.het.hold(TO).to(TO + 6, 0.9);
pen.height.hold(TO).to(TO + 4, H(1, 2) + slipDh(PAD, 1, 2, 2.4)).to(TO + 14, H(1, 2) + slipDh(PAD, 1, 2, 0.9)).to(TO + 26, H(1, 2) + slipDh(PAD, 1, 2, 0.12));
pen.stir.hold(TO + 6).to(TO + 14, 0.5).to(TO + 22, 0);

// ---------------------------------------------------- 9 · THE REWARD → 10 · THE ROAD BACK
// A coupling snap brings the hero back on 1:2. Clock B: bars 1–8 are the aksak (2+2+3) at 80;
// bars 9–16 are 12/8 again, accelerating 80 → 96.
const TB = TO + 29.0;
const B_TYPES = [...Array(8).fill('a'), ...Array(8).fill('c')];
const gB8 = (8 * HB) / 3;
const clkB = new Clock(TB, [[-4, 80], [gB8, 80], [gB8 + 30, 96], [gB8 + 34, 96]], B_TYPES);
sec.push([TB, '9 REWARD 7/8'], [clkB.bar(9), '10 ROAD BACK'], [clkB.bar(17), '11 RESURRECTION']);
pen.coupling.step(TB - 0.05, 8, 0.01); pen.height.step(TB - 0.05, H(1, 2), 0.01); pen.het.step(TB, 0.25, 0.5);
pen.gain.step(TB - 0.05, 0.3, 0.01);
for (let n = 1; n <= 8; n++) kicks.push(...[[n, 0, 1], [n, 2, n % 2 ? 0.3 : 0], [n, 4, 0.8], [n, 7, 0.85], [n, 9, 0.35], [n, 11, 0.75], ...(n % 4 === 0 ? [[n, 13, 0.45]] : [])]
  .filter(([, , v]) => v > 0).map(([nn, e, v], i) => [clkB.be(nn, e) + hum(300 + n * 20 + i, 3), v]));
for (let n = 9; n <= 16; n++) kicks.push(...[[n, 0, 1], [n, 4, 0.55], [n, 6, 0.85], ...(n % 2 === 0 ? [[n, 10, 0.6]] : []), ...(n >= 14 ? [[n, 3, 0.5], [n, 9, 0.6]] : []), ...(n % 4 === 0 ? [[n, 11, 0.5]] : [])]
  .map(([nn, e, v], i) => [clkB.be(nn, e) + hum(600 + n * 20 + i, 3), v]));
const BELL_AK = [0, 2, 3, 4, 7, 9, 10, 11];
for (let n = 1; n <= 16; n++) {
  if (n <= 8) bellHits(clkB, n, BELL_AK, (e) => e === 0 || e === 7, (e) => e === 4 || e === 11);
  else bellHits(clkB, n, BELL, (e) => e === 0, (e) => e === 7);
  shaker(clkB, n);
}
// the hands: the reed's call and answer in the aksak — but the cadence stops on B, not A
knot.het.step(TB - 0.1, 0.8, 0.1); knot.coupling.step(TB - 0.1, 5, 0.05); knot.height.step(TB - 0.1, H(1, 1), 0.01);
knot.gain.step(TB - 0.02, 0, 0.005);
const hands = [
  ...phrase(clkB, 1, 0, M7), ...phrase(clkB, 2, 0, R7),
  ...phrase(clkB, 3, 0, M7, { tr: 5 }), ...phrase(clkB, 4, 0, R7, { tr: 5 }),
  ...phrase(clkB, 5, 0, M7, { inv: true, tr: 12 }), ...phrase(clkB, 6, 0, { steps: [12, 10, 8, 7], e: [2, 2, 3, 7] }),
  ...phrase(clkB, 7, 0, { steps: [5, 3, 5, 3], e: [2, 2, 3, 7] }), ...phrase(clkB, 8, 0, { steps: [2], e: [14] }),
];
sing(knot, hands, kb, 0.24, { vib: 24, leap: 0.18, glide: 0.08 });
drone.coupling.step(TB - 0.1, 4, 0.05); drone.height.step(TB - 0.1, 0, 0.05); drone.shear.step(TB - 0.1, 0, 0.05); drone.bendX.step(TB - 0.1, 0, 0.05);
drone.gain.hold(TB - 0.3).to(TB, 0.4).hold(clkB.bar(8, 3)).to(clkB.bar(9), 0.12).hold(clkB.bar(16)).to(clkB.bar(17), 0.3);
for (let n = 1; n <= 8; n++) {
  const s = n % 2 ? 1 : -1;
  drone.bendX.hold(clkB.bar(n)).to(clkB.be(n, 4), 0.6 * s).to(clkB.be(n, 11), -0.4 * s).to(clkB.bar(n + 1) - 0.01, 0);
  for (const e of [4, 11]) drone.shear.step(clkB.be(n, e), 0.3, 0.004).to(clkB.be(n, e) + 0.3, 0);
}
drone.stir.hold(TB).to(clkB.bar(5), 0.9).to(clkB.bar(6), 0.2).to(clkB.bar(8), 0.6).to(clkB.bar(9), 0.2);
// the trickster again, now on every group start of the aksak (bars 3–8): the limp made colour
const TRICK_AK = [[1, 4], [3, 2], [2, 5], [5, 3], [1, 5], [4, 3]];
trick.gain.hold(clkB.bar(3) - 0.2).to(clkB.bar(3), 0.15);
ti = 0;
for (let n = 3; n <= 8; n++) for (const e of [0, 2, 4, 7, 9, 11]) click(trick, clkB.be(n, e), TRICK_AK[ti++ % 6], { dip: 0.3 });
trick.gain.hold(clkB.bar(8, 3)).to(clkB.bar(9), 0);
// 10 · the road back: the stair runs a six-note cell up the Farey scale, one rung higher each bar
stair.baseHz.step(clkB.bar(9) - 0.1, 220, 0.01);
stair.gain.hold(clkB.bar(9) - 0.05).to(clkB.bar(9), 0.0);
for (let n = 9; n <= 16; n++) {
  const i0 = n - 7, cell = [0, 2, 1, 3, 2, 4];
  for (let k = 0; k < 12; k++) {
    const t = clkB.be(n, k), lk = FAREY[i0 + cell[k % 6]], v = (k % 3 === 0 ? 0.2 : 0.13) * (0.75 + 0.25 * (n - 9) / 7);
    stair.height.step(t - 0.006, H(...lk), 0.002);
    stair.gain.step(t, v, 0.003).to(t + 0.09, v * 0.5).to(clkB.be(n, k + 1) - 0.01, 0);
  }
}
// reed and mentor chase the motif: the mentor follows a beat behind an octave up (bars 9–12),
// then an eighth behind (13–14) inverted against it, then both climb and do not land (15–16)
whistle.coupling.step(clkB.bar(9) - 0.5, 8, 0.05);
sing(knot, [...phrase(clkB, 9, 0, M), ...phrase(clkB, 10, 0, M, { tr: 5 }), ...phrase(clkB, 11, 0, M, { tr: 7 }), ...phrase(clkB, 12, 0, M, { tr: 3 })], kb, 0.26, { vib: 16, glide: 0.05, leap: 0.1 });
sing(whistle, [...phrase(clkB, 9, 3, M, { tr: 12 }), ...phrase(clkB, 10, 3, M, { tr: 17 }), ...phrase(clkB, 11, 3, M, { tr: 19 }), ...phrase(clkB, 12, 3, { steps: [0, 3, 7], e: [3, 2, 1] }, { tr: 15 })], wb, 0.16, { vib: 20, glide: 0.06, leap: 0.12 });
sing(knot, [...phrase(clkB, 13, 0, M, { tr: 0 }), ...phrase(clkB, 14, 0, M, { tr: 2 })], kb, 0.27, { vib: 14, glide: 0.04, leap: 0.09 });
sing(whistle, [...phrase(clkB, 13, 1, M, { tr: 19, inv: true }), ...phrase(clkB, 14, 1, M, { tr: 21, inv: true })], wb, 0.17, { vib: 18, glide: 0.05, leap: 0.1 });
sing(knot, [...phrase(clkB, 15, 0, { steps: [3, 5, 7, 8, 10, 12], e: [2, 2, 2, 2, 2, 2] }), ...phrase(clkB, 16, 0, { steps: [14, 15, 17], e: [3, 3, 6] })], kb, 0.28, { vib: 18, glide: 0.05, leap: 0.1 });
sing(whistle, [...phrase(clkB, 15, 1, { steps: [24, 22, 20, 19, 17, 15], e: [2, 2, 2, 2, 2, 1] }, { tr: 0 }), ...phrase(clkB, 16, 0, { steps: [14, 13, 12], e: [3, 3, 6] }, { tr: 0 })], wb, 0.17, { vib: 22, glide: 0.06, leap: 0.12 });
pen.longitude.hold(TB).to(clkB.bar(17), 0.35);

// ---------------------------------------------------- 11 · RESURRECTION (free time)
// Every pitched voice lets go at once, stirred (four seconds), then all are grabbed together.
// The motif sounds in three voices: the reed as written, the mentor inverted a beat later, the
// stair's bass on the Farey locks for A C E D (1:1, 2:3, 1:3, 1:2 at baseHz 110), twice as slow.
const TX = clkB.bar(17), TG = TX + 4.2;
for (const [v, h0, d] of [[pen, H(1, 2), 0.025], [knot, H(1, 1), -0.03], [whistle, H(3, 2), 0.015], [drone, 0, 0.04]]) {
  v.coupling.step(TX, 0, 0.2); v.height.step(TX, h0 + d, 1.2); v.height.step(TG, h0, 0.02); v.coupling.step(TG, 10, 0.01);
}
pen.het.step(TX, 0.8, 0.3).step(TG + 1, 0.25, 1); knot.het.step(TX, 0.8, 0.1);
pen.stir.hold(TX).to(TX + 3, 0.6).to(TG, 0);
drone.stir.hold(TX).to(TX + 3, 1).to(TG + 1, 0.2);
knot.gain.step(TX, 0.22, 0.05).hold(TG - 0.3).to(TG - 0.02, 0);
whistle.gain.step(TX, 0.15, 0.05).hold(TG - 0.3).to(TG - 0.02, 0);
pen.gain.step(TX, 0.32, 0.05);
kicks.push([TX + 0.0, 0.9], [TX + 1.3, 0.6], [TX + 3.1, 0.5], [TG, 1.0]);
const q11 = 0.95;
sing(knot, free(TG + 0.5, q11, [[0, 1], [3, 0.5], [7, 0.5], [5, 2], [0, 1], [3, 0.5], [7, 0.5], [8, 1], [7, 3]], { sway: 0.08 }), kb, 0.26, { vib: 18, leap: 0.15 });
sing(whistle, free(TG + 0.5 + q11, q11, [[19, 1], [16, 0.5], [12, 0.5], [14, 2], [19, 1], [16, 0.5], [12, 0.5], [10, 1], [14, 3]], { sway: 0.08 }), wb, 0.17, { vib: 24, leap: 0.2, sustainLast: true, swell: 0.8 });
// the stair's bass: the motif inside the strange scale
stair.baseHz.step(TG - 0.1, 110, 0.01); stair.height.step(TG - 0.1, H(1, 1), 0.01);
stair.gain.hold(TG).to(TG + 0.3, 0.3);
const sb = [[1, 1], [2, 3], [1, 3], [1, 2]], sbd = [2, 1, 1, 4];
{ let u = TG + 0.5; sb.forEach((lk, i) => { if (i) click(stair, u, lk, { dip: 0.6 }); u += sbd[i] * q11 * 1.0; }); }
const T11E = TG + 0.5 + q11 * 10.5;
stair.gain.hold(T11E - 1).to(T11E + 1, 0);
pen.baseHz.step(TG + 0.5 + 4 * q11, pPad(st(5)), 0.2);    // the pad moves to D under the second statement
whistle.gain.hold(T11E).to(T11E + 0.8, 0); knot.gain.hold(T11E - 0.5).to(T11E, 0);
drone.gain.hold(T11E - 1).to(T11E + 1, 0);

// ---------------------------------------------------- 12 · THE RETURN (clock C, then free time)
// The B theme from the third draft, breathing, then the ending: let go together, coda home.
const TCB = T11E + 1.0;
const C_TEMPO = [[-2, 70], [0, 72], [3, 76], [6, 67], [8, 71], [11, 77], [14, 66], [16, 70], [19, 79], [22, 65], [24, 72], [28, 78], [32, 62]];
const clkC = new Clock(TCB, C_TEMPO, Array(8).fill('c'));
sec.push([TCB, '12 RETURN']);
pen.baseHz.step(TCB - 0.2, pPad(st(-4)), 0.3); pen.coupling.step(TCB - 0.2, 6, 0.1); pen.het.step(TCB - 0.2, 0.25, 0.3);
for (const [n, s] of [[3, 3], [5, -2], [7, -5], [9, 0]]) pen.baseHz.step(clkC.bar(n) - 0.004, pPad(st(s)), 0.012);
for (let n = 1; n <= 8; n++) kicks.push(...[[n, 0, 0.8], [n, 6, 0.45], ...(n % 2 === 0 ? [[n, 11, 0.4]] : [])].map(([nn, e, v], i) => [clkC.be(nn, e) + hum(900 + n * 7 + i, 3), v]));
for (let n = 1; n <= 8; n++) shaker(clkC, n, { light: true });
const Be = [5, 1, 3, 3, 12];
whistle.coupling.step(TCB - 0.3, 8, 0.05); whistle.het.step(TCB - 0.3, 0, 0.05); whistle.height.step(TCB - 0.3, H(3, 2), 0.05);
sing(whistle, phrase(clkC, 1, 0, { steps: [7, 8, 10, 12, 10], e: Be }, { tr: 12 }), wb, 0.2, { vib: 28, glide: 0.07, leap: 0.2, delay: 0.3 });
sing(whistle, phrase(clkC, 3, 0, { steps: [5, 7, 8, 10, 8], e: Be }, { tr: 12 }), wb, 0.2, { vib: 28, glide: 0.07, leap: 0.2, delay: 0.3 });
sing(whistle, phrase(clkC, 5, 0, { steps: [10, 12, 14, 15, 14], e: Be }, { tr: 12 }), wb, 0.21, { vib: 32, glide: 0.09, leap: 0.25, delay: 0.25 });
const head = { steps: [0, 3, 7], e: [2, 1, 3] };
knot.coupling.step(TCB - 0.3, 5, 0.05); knot.het.step(TCB - 0.3, 0.8, 0.05); knot.height.step(TCB - 0.3, H(1, 1), 0.05);
sing(knot, phrase(clkC, 2, 6, head), kb, 0.26, { vib: 16 });
sing(knot, phrase(clkC, 4, 6, { steps: [7, 10, 14], e: head.e }), kb, 0.26, { vib: 16 });
sing(knot, phrase(clkC, 6, 6, { steps: [10, 14, 17], e: head.e }), kb, 0.26, { vib: 16 });
sing(knot, [...phrase(clkC, 7, 0, M), ...phrase(clkC, 8, 0, M, { tr: 7 })], kb, 0.27, { vib: 18, leap: 0.12 });
const TEND = clkC.bar(9);
const C = (x) => TEND + (x - 85.6);     // the ending, kept in the earlier drafts' free time
sing(whistle, [[clkC.bar(7), C(95) - clkC.bar(7), st(19)]], wb, 0.18, { vib: 22, delay: 0.5, rise: 1.5, sustainLast: true });
sec.push([TEND, 'LET GO'], [C(95), 'CODA']);
for (const t of [C(85.6), C(87.0), C(88.8), C(91.4)]) kicks.push([t, 0.6]);
// let go together
pen.coupling.step(C(85.6), 0, 0.3).step(C(95), 8, 0.05); pen.het.step(C(85.6), 0.7, 0.5); pen.gain.step(C(85.6), 0.3, 0.05);
pen.height.hold(C(85.6)).step(C(85.6), H(1, 2) + 0.02, 1.5).step(C(95), H(1, 2), 0.05);
sing(knot, [[C(85.6), 12, st(0)]], kb, 0.26, { vib: 0, sustainLast: true });
knot.coupling.step(C(85.6), 0, 0.3).step(C(95), 8, 0.05);
knot.height.step(C(85.6), H(1, 1) - 0.02, 1.5).step(C(95), H(1, 1), 0.05);
knot.longitude.to(C(110), 0.25); knot.gain.hold(C(95)).to(C(102), 0);
whistle.vib.hold(C(85.6)).to(C(87), 6); whistle.coupling.step(C(85.6), 0, 0.3);
whistle.height.step(C(85.6), H(3, 2) + 0.004, 2.0); whistle.het.step(C(85.6), 0.5, 0.5);
whistle.gain.hold(C(88)).to(C(95), 0);
drone.coupling.step(TEND - 2, 4, 0.1); drone.height.step(TEND - 2, 0, 0.1); drone.stir.step(TEND - 2, 0.3, 0.5);
drone.gain.hold(TEND - 2).to(TEND, 0.42).hold(C(95)).to(C(103), 0);
drone.coupling.step(C(85.6), 0, 0.3).step(C(95), 8, 0.05);
drone.height.step(C(85.6), 0.03, 1.5).step(C(95), 0, 0.05);
drone.stir.hold(C(85.6)).to(C(95), 0); drone.longitude.to(C(110), 0.35);
// coda: grabbed on 1:2, the motif slowly once more (sung), then height and baseHz glide home
pen.gain.step(C(95), 0.0, 0.01);
{ let u = C(95.2); const notes = M.steps.map((s, i) => { const d = [1, 0.5, 0.5, 2][i] * 1.25; const n = [u, d, st(s)]; u += d; return n; });
  sing(pen, notes, pPad, 0.38, { vib: 12, leap: 0.3, tie: false });
  sing(pen, [[C(100.2), 9.6, st(0)]], pPad, 0.38, { vib: 10, delay: 1.0, rise: 2.5, sustainLast: true }); }
pen.vib.hold(C(104)).to(C(106), 0);
pen.baseHz.hold(C(101.0)).to(C(106.0), p1D(st(12)));
pen.coupling.step(C(103.0), 0, 3.0);
pen.het.step(C(100.2), 0, 1.0);
pen.height.step(C(101.0), -1, 5.0);
pen.longitude.hold(C(101)).to(C(106), 0.25);
pen.gain.hold(C(106)).to(C(109.8), 0);
// the elixir: the stair's A C E D, faint and an octave up, under the hero's way home
stair.baseHz.step(C(100) - 0.1, 440, 0.01); stair.height.step(C(100) - 0.1, H(1, 1), 0.01);
stair.gain.hold(C(100.4)).to(C(101.2), 0.07);
{ let u = C(100.4); sb.forEach((lk, i) => { if (i) click(stair, u, lk, { dip: 0.7 }); u += [1.6, 0.8, 0.8, 4][i]; }); }
stair.gain.hold(C(106)).to(C(109), 0);

// ---------------------------------------------------- the kick, the duck, the mix
kicks.sort((a, b) => a[0] - b[0]);
for (let i = 0; i < kicks.length; i++) {
  const [t, vv] = kicks[i], gap = (kicks[i + 1]?.[0] ?? t + 1) - t, L = Math.min(0.42, gap - 0.01);
  const v = 0.95 * vv, top = 55 + 25 * vv;
  kick.baseHz.step(t, top, 0.001).to(t + 0.04, 32).to(t + L, 23);
  kick.longitude.step(t, 0.18 * vv, 0.001).to(t + 0.013, 0);
  kick.gain.step(t, v, 0.002).to(t + 0.09, v * 0.7).to(t + L * 0.7, v * 0.25).to(t + L, 0);
}

const VOICES = [
  { name: 'Penrose', table: '15_penrose_lattice.wav', pan: -0.3, fixed: { hetRow: 0.25, slopeMax: 41.0 }, tr: pen, vr: 5.3 },
  { name: 'Knot Shadow', table: '14_knot_shadow.wav', pan: 0.4, fixed: { hetRow: 0.3505859375, slopeMax: 26.2 }, tr: knot, vr: 5.6 },
  { name: 'Whistle', table: '14_knot_shadow.wav', pan: 0.15, fixed: { hetRow: 0.3505859375, slopeMax: 26.2 }, tr: whistle, vr: 6.1 },
  { name: 'Kick', table: '01_sine_cycle_sweep.wav', pan: 0.0, fixed: { hetRow: 0, slopeMax: 10 }, tr: kick, vr: 5 },
  { name: 'Bell', table: '11_chladni_ghost.wav', pan: 0.5, fixed: { hetRow: 0.25, slopeMax: 170.4 }, tr: bell, vr: 5 },
  { name: 'Shaker', table: '11_chladni_ghost.wav', pan: -0.55, fixed: { hetRow: 0.25, slopeMax: 170.4 }, tr: shk, vr: 5 },
  { name: 'Drone', table: '10_membrane.wav', pan: -0.1, fixed: { hetRow: 0.111328125, slopeMax: 14.5 }, tr: drone, vr: 5 },
  { name: 'Guardian', table: '11_chladni_ghost.wav', pan: -0.2, fixed: { hetRow: 0.25, slopeMax: 170.4 }, tr: guard, vr: 5 },
  { name: 'Trickster', table: '17_matern_field.wav', pan: 0.6, fixed: { hetRow: 0.2646484375, slopeMax: 6.1 }, tr: trick, vr: 5 },
  { name: 'Stair', table: '13_stiff_string.wav', pan: -0.45, fixed: { hetRow: 0, slopeMax: 523.7 }, tr: stair, vr: 5 },
  { name: 'Shadow', table: '18_fisher_ridge.wav', pan: 0.05, fixed: { hetRow: 0.8193359375, slopeMax: 3.1 }, tr: shadow, vr: 5 },
];
// Penrose ducks under every kick while it is the pad (clock A groove, clock B, clock C)
const duckWins = [[clkA.bar(1), clkA.bar(17)], [TB, clkB.bar(17)], [TCB, TEND]];
{ const hits = kicks.filter(([t]) => duckWins.some(([a, b]) => t >= a && t < b));
  // the duck multiplies the planned gain at render time: down 4 ms, back over the gap
  pen.duck = hits.map(([t, v], i) => [t, v, Math.min(0.3, ((hits[i + 1]?.[0] ?? t + 1) - t) - 0.01)]);
}

const DUR = Math.ceil(C(110) + 0.5), N = DUR * SR;
const Lch = new Float32Array(N), Rch = new Float32Array(N), locks = {};
const stemsWanted = !!process.env.STEMS;
for (const v of VOICES) {
  const m = make(wav(v.table), SR);
  for (const k in v.fixed) m.set(k, v.fixed[k]);
  const knobs = Object.keys(v.tr).filter((k) => k !== 'cents' && k !== 'vib' && v.tr[k] instanceof Tr);
  for (const k of knobs) m.set(k, v.tr[k].p[0][1]);
  m.set('hS', v.tr.height.p[0][1]); m.set('kS', v.tr.coupling.p[0][1]); m.set('lonS', v.tr.longitude.p[0][1]);
  const gl = Math.cos((v.pan + 1) * Math.PI / 4), gr = Math.sin((v.pan + 1) * Math.PI / 4);
  let last = '', bad = 0, pk = 0, vph = 0, di = 0; locks[v.name] = []; const stem = stemsWanted ? new Float32Array(N) : null;
  const duck = v.tr.duck;
  for (let i = 0; i < N; i++) {
    if (i % CR === 0) {
      const t = i / SR;
      for (const k of knobs) m.set(k, v.tr[k].at(t));
      if (duck) {
        while (di < duck.length - 1 && duck[di + 1][0] <= t) di++;
        const [dt, dv, dl] = duck[di] ?? [0, 0, 0];
        if (t >= dt && t < dt + dl) {
          const x = (t - dt), depth = 0.77 * dv, g = x < 0.004 ? 1 - depth * x / 0.004 : 1 - depth * (1 - (x - 0.004) / (dl - 0.004));
          m.set('gain', v.tr.gain.at(t) * g);
        }
      }
      vph += 2 * Math.PI * v.vr * (1 + 0.07 * Math.sin(2 * Math.PI * 0.21 * t)) * CR / SR;
      const c = v.tr.cents.at(t) + v.tr.vib.at(t) * Math.sin(vph);
      if (c) m.set('baseHz', v.tr.baseHz.at(t) * Math.pow(2, c / 1200));
      const lk = `${m.get('lockA')}:${m.get('lockB')}`;
      if (lk !== last) { locks[v.name].push([+t.toFixed(3), lk]); last = lk; }
    }
    const y = m.tick(); if (!Number.isFinite(y)) bad++;
    pk = Math.max(pk, Math.abs(y));
    Lch[i] += gl * y; Rch[i] += gr * y; if (stem) stem[i] = y;
  }
  if (stem) fs.writeFileSync(path.join(os.tmpdir(), `etude_two_e_stem_${v.name.replace(' ', '_')}.f32`), Buffer.from(stem.buffer));
  console.log(`${v.name.padEnd(12)} non-finite ${bad} · stem peak ${pk.toFixed(3)} · ${locks[v.name].length} lock changes`);
}

let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(Lch[i]), Math.abs(Rch[i]));
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
writeWav(path.join(here, 'etude_two_e_heros_journey.wav'), [Lch, Rch]);
writeWav(path.join(os.tmpdir(), 'etude_two_e_mono.wav'), [Lch.map((x, i) => 0.5 * (x + Rch[i]))]);
const sections = sec.sort((a, b) => a[0] - b[0]).map(([t, s]) => [+t.toFixed(2), s]);
fs.writeFileSync(path.join(here, 'etude_two_e_locks.json'), JSON.stringify({
  form: 'the monomyth in twelve chapters', farey_scale_x_baseHz: FAREY.map((lk) => [lk.join(':'), +(2 * lk[1] / (lk[0] + lk[1])).toFixed(4)]),
  tempo_A: A_TEMPO, tempo_B: clkB.tempo, tempo_C: C_TEMPO, duration_s: DUR, sections, peak_before_norm: pk, norm_gain: g, locks,
}, null, 1) + '\n');
console.log(`sections ${JSON.stringify(sections)} · dur ${DUR}s · peak ${pk.toFixed(3)} · gain ${g.toFixed(3)}`);
