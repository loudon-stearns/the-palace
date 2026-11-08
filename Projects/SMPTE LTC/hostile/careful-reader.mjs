// The careful reader: GoButton's LTC reader with three changes, each one earned by a hostile file.
//
// Everything not marked CHANGE is ltc.js's decodeSample and heard, line for line, so the two
// can be read side by side. Run it with:  node gauntlet.mjs run careful-reader.mjs
//
//   CHANGE 1 — LISTEN WITH HYSTERESIS (earned by 08-noise-6dB, and by the noise sweep, where
//     GoButton's reader read 26 WRONG frames at 10 dB). A flip counts only when the signal
//     crosses all the way from one side of a band to the other. The band is centred on the
//     signal's own middle (so a DC offset moves it too) and is a fifth of its height wide.
//   CHANGE 2 — A GAP IS A GAP (earned by 24-dropout). A pulse more than four bits long is not
//     a new measure of the bit: it is silence. Forget the measure and learn it again from the
//     next pulse, instead of shrinking down to it a quarter at a time.
//   CHANGE 3 — TRUST A FRAME ONLY WHEN IT IS CHECKED (earned by 13-eq-peak, where GoButton's
//     reader found every sync word and read 119 frames, every one of them wrong). LTC has no
//     checksum, but it has two checks a reader can make: the polarity bit makes every frame's
//     count of 0s even, and every frame is the one after the frame before. A frame is passed on
//     only when its 0s are even and it follows the last frame heard. That costs one frame at
//     the start, and one after every cut, and nothing else.
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const L = require(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'SMPTE LTC — rich — ltc.js'));

const SMOOTH_BIT = 0.25, SMOOTH_FRAME = 0.2;
const BAND = 0.2;        // CHANGE 1: the hysteresis band, as a share of the signal's half-height
const FOLLOW = 0.002;    // CHANGE 1: how fast the top and bottom follow the signal down, per sample
const GAP_BITS = 4;      // CHANGE 2

export function newReader(sampleRate) {
  return { sampleRate, last: 0, count: 0, bit: 0, half: 0, bits: new Array(80).fill(0), fresh: 0, since: 0, frameLen: 0, frames: 0,
    hi: 0, lo: 0, prev: null };
}

export function readSample(d, x) {
  d.count += 1;
  d.since += 1;
  // CHANGE 1: track the signal's top and bottom; they jump out at once and sag back slowly.
  d.hi = x > d.hi ? x : d.hi - (d.hi - x) * FOLLOW;
  d.lo = x < d.lo ? x : d.lo - (d.lo - x) * FOLLOW;
  const mid = (d.hi + d.lo) / 2, band = ((d.hi - d.lo) / 2) * BAND;
  let sign = d.last;
  if (x > mid + band) sign = 1; else if (x < mid - band) sign = -1;
  if (sign === 0) return null;
  if (d.last === 0) { d.last = sign; return null; }
  if (sign === d.last) return null;
  d.last = sign;
  const pulse = d.count;
  d.count = 0;
  if (d.bit === 0) { d.bit = pulse; d.half = 0; d.fresh = 0; return null; }
  if (pulse > d.bit * GAP_BITS) { d.bit = 0; d.half = 0; d.fresh = 0; d.prev = null; return null; }   // CHANGE 2
  if (pulse > d.bit * 1.5) { d.bit = pulse; d.half = 0; d.fresh = 0; return null; }
  if (pulse < d.bit * 0.75) {
    if (d.half === 0) { d.half = pulse; return null; }
    d.bit += (d.half + pulse - d.bit) * SMOOTH_BIT;
    d.half = 0;
    return heard(d, 1);
  }
  d.half = 0;
  d.bit += (pulse - d.bit) * SMOOTH_BIT;
  return heard(d, 0);
}

function heard(d, bit) {
  d.bits.shift();
  d.bits.push(bit);
  d.fresh += 1;
  for (let i = 0; i < 16; i++) if (d.bits[64 + i] !== L.SYNC[i]) return null;
  if (d.fresh < 80) { d.since = 0; return null; }
  if (d.frames > 0 && d.since < d.bit * 80 * 1.5) {
    d.frameLen = d.frameLen === 0 ? d.since : d.frameLen + (d.since - d.frameLen) * SMOOTH_FRAME;
  }
  d.since = 0;
  d.frames += 1;
  const tc = L.readBits(d.bits);
  tc.fps = d.frameLen > 0 ? d.sampleRate / d.frameLen : d.sampleRate / (d.bit * 80);
  tc.rate = L.nameRate(tc.fps, tc.drop);
  tc.now = L.nextFrame(tc, L.countFor(tc.fps), tc.drop);
  // CHANGE 3: the two checks.
  let zeros = 0; for (const b of d.bits) if (b === 0) zeros++;
  if (zeros % 2 === 1) { d.prev = null; return null; }
  // "The one after" is asked of all three counts, not the measured rate: a tape at half speed
  // measures 12.5 fps and still counts 25 to the second.
  const follows = d.prev && d.prev.drop === tc.drop && [24, 25, 30].some((n) => L.text(L.nextFrame(d.prev, n, tc.drop)) === L.text(tc));
  d.prev = tc;
  return follows ? tc : null;
}

export function read(samples, sampleRate) {
  const d = newReader(sampleRate), out = [];
  for (let i = 0; i < samples.length; i++) { const tc = readSample(d, samples[i]); if (tc) out.push(Object.assign({ at: i }, tc)); }
  return out;
}
