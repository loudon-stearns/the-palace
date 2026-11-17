// The matched reader: an LTC reader that never times a single crossing. It keeps its own clock.
//
// Every reader before this one times the gaps between zero crossings, so anything that moves a crossing
// moves the bit. A resonant EQ moves them by a quarter bit (13-eq-peak); noise 6 dB down adds false ones
// (08-noise-6dB); a 32 kbps codec smears them (16-mp3-32). This reader asks a different question. It keeps
// a clock that ticks once a half bit, and at each tick asks which way the signal leaned, on balance, over
// the whole half bit it just heard. That sum is the filter matched to the bit: a box as long as the thing
// it is looking for. A crossing pushed a quarter bit late still leaves most of the half bit on the right
// side of zero, so the sum keeps its sign; noise adds up to nearly nothing over twenty samples.
//
//   1. PREPARE — a high-pass a tenth of the bit rate takes out DC and hum; it follows the bit rate.
//   2. FIND THE BIT — until the clock runs, a plain crossing timer (smoothed, with hysteresis) learns
//      roughly how long a bit is. That is all it is used for.
//   3. KEEP THE CLOCK — the signal is summed in quarter bits. Where two half bits differ in sign, a flip
//      happened between them, and the two quarters either side of the tick should cancel. What is left
//      over says how early or late the tick is, and the clock is nudged toward it (and its rate a little).
//   4. PAIR THE HALVES — biphase mark flips at every bit boundary, so of the two ways to pair half bits
//      into bits, the right one always has a flip between pairs. The reader keeps score of both and uses
//      the one that breaks the rule less. A bit is 1 if its two halves differ.
//   5. TRUST ONLY A CHECKED FRAME — the sync word, then the careful reader's two checks: even 0s, and the
//      frame after the last.
//   6. LET GO — if the signal goes quiet or the pairing rule keeps breaking, the clock stops and the
//      reader goes back to finding the bit.
//
// What it does not take yet: 13-eq-peak, where the ringing after each flip pulls the clock a quarter bit
// early and the reader keeps letting go, and 16-mp3-32, read 90 of 100. It reads no wrong frame anywhere.
//
// Forward only, like GoButton's. Run it with:  node gauntlet.mjs run matched-reader.mjs
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const L = require(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'SMPTE LTC — rich — ltc.js'));

const PHASE_GAIN = 0.25;   // 3: how much of a measured timing error the clock takes at once
const RATE_GAIN = 0.02;    // 3: how much of it goes into the clock's rate
const LOST = 0.25;         // 6: let go when this share of bit boundaries have no flip
const QUIET = 0.1;         // 6: let go when the signal falls below a tenth of its recent peak
const SMOOTH_FRAME = 0.2;

export function newReader(sampleRate) {
  return {
    sr: sampleRate, t: 0,
    // 1. the high-pass, a biquad whose corner follows the bit rate
    hp: { x1: 0, x2: 0, y1: 0, y2: 0, c: null, forH: 0 },
    env: 0,
    // 2. the crossing timer
    acq: { last: 0, count: 0, bit: 0, steady: 0, hi: 0, lo: 0, ma: [], sum: 0, lastCross: 0 },
    // 3. the clock: H samples per half bit, p samples into the current half, q the quarter sums
    locked: false, H: 0, p: 0, q: [0, 0], qi: 0, S: [], Q: [],
    // 4. pairing
    k: 0, viol: [0, 0], cells: 0,
    // 5. the frame
    bits: new Array(80).fill(0), fresh: 0, lastSyncT: 0, frameLen: 0, frames: 0, prev: null,
  };
}

function highpass(d, x) {
  const h = d.hp;
  const H = d.locked ? d.H : d.acq.bit / 2 || d.sr / 4800;
  if (!h.c || Math.abs(H - h.forH) > 0.02 * h.forH) {
    const fc = Math.min(d.sr / (2 * H) / 10, d.sr / 8), w = 2 * Math.PI * fc / d.sr, c = Math.cos(w), al = Math.sin(w) / (2 * Math.SQRT1_2), a0 = 1 + al;
    h.c = [(1 + c) / 2 / a0, -(1 + c) / a0, (1 + c) / 2 / a0, -2 * c / a0, (1 - al) / a0];
    h.forH = H;
  }
  const [b0, b1, b2, a1, a2] = h.c;
  const y = b0 * x + b1 * h.x1 + b2 * h.x2 - a1 * h.y1 - a2 * h.y2;
  h.x2 = h.x1; h.x1 = x; h.y2 = h.y1; h.y1 = y;
  return y;
}

// 2. FIND THE BIT: smooth over a few samples, cross with hysteresis, and keep the shortest steady pulse
// family as the half bit. Returns true when it is steady enough to start the clock.
function findBit(d, x) {
  const a = d.acq;
  const n = Math.max(1, Math.round(d.sr / 16000));
  a.ma.push(x); a.sum += x; if (a.ma.length > n) a.sum -= a.ma.shift();
  const v = a.sum / a.ma.length;
  a.hi = v > a.hi ? v : a.hi * 0.998; a.lo = v < a.lo ? v : a.lo * 0.998;
  const band = (a.hi - a.lo) * 0.1;
  a.count += 1;
  let sign = a.last;
  if (v > band) sign = 1; else if (v < -band) sign = -1;
  if (sign === 0 || sign === a.last) { if (a.last === 0) a.last = sign; return false; }
  a.last = sign;
  const pulse = a.count; a.count = 0;
  if (a.bit === 0) { a.bit = pulse * 2; a.steady = 0; return false; }
  // a pulse is a half bit (a 1's half) or a whole bit (a 0); take either as a measure of the bit
  // (the sync word's twelve 1s mean half-bit pulses come every frame, so a pulse well under half the
  // bit means the bit is shorter than we thought)
  // (a pulse is whole samples, so allow a sample of slack, and take whichever reading is closer by ratio)
  const dw = Math.abs(pulse - a.bit), dh = Math.abs(pulse * 2 - a.bit), half = Math.abs(Math.log(pulse * 2 / a.bit)) < Math.abs(Math.log(pulse / a.bit));
  const m = (half ? dh : dw) < a.bit * 0.25 + 1 ? (half ? pulse * 2 : pulse) : null;
  if (m === null) {
    a.steady = 0; a.halves = 0; a.wholes = 0; a.sumP = 0; a.sumU = 0;
    if (pulse * 2 < a.bit * 0.6) a.bit = pulse * 2;
    else if (pulse > a.bit * 1.5) a.bit = pulse;
    else a.bit = Math.abs(Math.log(pulse / a.bit)) < Math.abs(Math.log(pulse * 2 / a.bit)) ? pulse : pulse * 2;
    return false;
  }
  // the bit is the samples counted over the bits they made, so a pulse rounded short and the next
  // rounded long average out instead of pulling the estimate one way
  a.sumP = (a.sumP || 0) * 0.9 + pulse; a.sumU = (a.sumU || 0) * 0.9 + (half ? 0.5 : 1);
  a.bit = a.sumP / a.sumU;
  a.steady += 1;
  if (half) a.halves = (a.halves || 0) + 1; else a.wholes = (a.wholes || 0) + 1;
  // a run of 0s alone is a square wave at half the bit's pitch and looks like a run of 1s at half the
  // speed: wait until both kinds of pulse have been heard, which the sync word guarantees every frame
  return a.steady >= 24 && a.halves >= 8 && a.wholes >= 2;
}

function letGo(d) {
  d.locked = false; d.acq.steady = 0; d.acq.halves = 0; d.acq.wholes = 0; d.acq.count = 0; d.S = []; d.Q = []; d.viol = [0, 0]; d.cells = 0;
  d.fresh = 0; d.prev = null; d.frames = 0; d.frameLen = 0;
}

export function readSample(d, x) {
  d.t += 1;
  const y = highpass(d, x);
  const ay = Math.abs(y);
  d.env = ay > d.env ? ay : d.env * (1 - 1 / (d.sr * 0.02));
  d.peak = Math.max(d.env, (d.peak || 0) * (1 - 1 / (d.sr * 0.5)));

  if (!d.locked) {
    if (findBit(d, y)) {
      // start the clock on the crossing just heard: it is a half-bit boundary
      d.locked = true; d.H = d.acq.bit / 2; d.p = 0; d.q = [0, 0]; d.qi = 0; d.S = []; d.Q = []; d.k = 0; d.viol = [0, 0]; d.cells = 0;
    }
    return null;
  }
  if (d.env < QUIET * d.peak) { letGo(d); return null; }

  // 3. KEEP THE CLOCK: spread this one sample across quarter-bit boundaries by the time it covers
  let left = 1, out = null;
  while (left > 1e-9) {
    const edge = d.qi === 0 ? d.H / 2 : d.H;
    const take = Math.min(left, edge - d.p);
    d.q[d.qi] += y * take; d.p += take; left -= take;
    if (d.p >= edge - 1e-9) {
      if (d.qi === 0) { d.qi = 1; continue; }
      const r = halfBit(d);
      if (r === 'lost') { letGo(d); return null; }
      if (r) out = r;
      d.p -= d.H; d.q = [0, 0]; d.qi = 0;
    }
  }
  return out;
}

// one half bit has closed: its quarters are d.q
function halfBit(d) {
  const [q1, q2] = d.q, s = q1 + q2;
  const prev = d.S.length ? d.S[d.S.length - 1] : null, prevQ = d.Q.length ? d.Q[d.Q.length - 1] : null;
  if (prev !== null && Math.sign(prev) !== Math.sign(s)) {
    // a flip between the two halves: the quarters either side of the tick should cancel
    const m = prevQ[1] + q1, scale = (Math.abs(prev) + Math.abs(s)) / 2 || 1;
    let delta = (m * Math.sign(s) / scale) * d.H / 2;          // > 0: the tick is late by this many samples
    delta = Math.max(-d.H / 4, Math.min(d.H / 4, delta));
    d.p += PHASE_GAIN * delta;
    d.H -= RATE_GAIN * delta;
  }
  d.S.push(s); d.Q.push([q1, q2]); if (d.S.length > 2) { d.S.shift(); d.Q.shift(); }
  d.k += 1;
  if (prev === null) return null;
  // 4. PAIR THE HALVES: at parity k%2 this tick would be a bit boundary; was there a flip?
  const par = d.k % 2, noFlip = Math.sign(prev) === Math.sign(s) ? 1 : 0;
  d.viol[par] += (noFlip - d.viol[par]) * 0.05;
  // which ticks are bit boundaries: the parity that breaks the rule less
  const boundary = d.viol[0] <= d.viol[1] ? 0 : 1;
  if (par !== boundary) {
    // this tick is a bit's middle: prev and s are its two halves
    d.cells += 1;
    if (d.cells > 40 && Math.min(d.viol[0], d.viol[1]) > LOST) return 'lost';
    return heard(d, Math.sign(prev) !== Math.sign(s) ? 1 : 0);
  }
  return null;
}

function heard(d, bit) {
  d.bits.shift(); d.bits.push(bit); d.fresh += 1;
  for (let i = 0; i < 16; i++) if (d.bits[64 + i] !== L.SYNC[i]) return null;
  const since = d.t - d.lastSyncT; d.lastSyncT = d.t;
  if (d.fresh < 80) return null;
  if (d.frames > 0 && since < d.H * 160 * 1.5) d.frameLen = d.frameLen === 0 ? since : d.frameLen + (since - d.frameLen) * SMOOTH_FRAME;
  d.frames += 1;
  const tc = L.readBits(d.bits);
  tc.fps = d.frameLen > 0 ? d.sr / d.frameLen : d.sr / (d.H * 160);
  tc.rate = L.nameRate(tc.fps, tc.drop);
  tc.now = L.nextFrame(tc, L.countFor(tc.fps), tc.drop);
  // 5. the two checks
  let zeros = 0; for (const b of d.bits) if (b === 0) zeros++;
  if (zeros % 2 === 1) { d.prev = null; return null; }
  const follows = d.prev && d.prev.drop === tc.drop && [24, 25, 30].some((n) => L.text(L.nextFrame(d.prev, n, tc.drop)) === L.text(tc));
  d.prev = tc;
  return follows ? tc : null;
}

export function read(samples, sampleRate) {
  const d = newReader(sampleRate), out = [];
  for (let i = 0; i < samples.length; i++) { const tc = readSample(d, samples[i]); if (tc) out.push(Object.assign({ at: i }, tc)); }
  return out;
}
