// The room's backward reader with one change: the second free check.
//
// The backward reader (backward-reader.mjs, the reader the teaching room's Read step runs) already
// makes one of LTC's two free checks: decodeWord refuses a word whose count of 0s is odd. It does not
// make the other. In the sample-rate sweep, at 7 kHz, that cost it 98 frames, every one wrong and
// every one with an even count of 0s: 04:00:00:07, 02:00:00:07, 02:00:00:07, ... Not one of them
// followed the frame before.
//
//   CHANGE — TRUST A FRAME ONLY WHEN IT FOLLOWS THE LAST. A frame is passed on when it is the next
//     frame after the last one read in the same direction: one later running forward, one earlier
//     running backward. The reader does not know the rate, so "next" is taken under any count a
//     tape can have (24, 25, 30, 30 drop-frame), the drop-frame count only when the word's own flag
//     says drop. It costs the first frame of every lock and nothing else.
//
// Run it with:  node gauntlet.mjs run checked-backward-reader.mjs
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { read as readBackward } from './backward-reader.mjs';

const require = createRequire(import.meta.url);
const L = require(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'SMPTE LTC — rich — ltc.js'));
const COUNTS = ['24', '25', '30', '29.97 drop'].map((k) => L.RATES[k]);

function follows(a, b, dir) {
  for (const r of COUNTS) {
    if (r.drop !== !!b.drop || a.f >= r.count || b.f >= r.count) continue;
    if (L.toFrames(b, r) - L.toFrames(a, r) === dir) return true;
  }
  return false;
}

export function read(samples, sampleRate) {
  const out = [];
  let prev = null;
  for (const fr of readBackward(samples, sampleRate)) {
    if (prev && prev.dir === fr.dir && follows(prev, fr, fr.dir)) out.push(fr);
    prev = fr;
  }
  return out;
}
