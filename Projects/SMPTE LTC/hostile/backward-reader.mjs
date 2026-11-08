// The rich face's backward reader, put through the gauntlet unchanged.
//
// The reader is the one the teaching room's Read step runs (`SMPTE LTC — rich — backward.html`,
// the script `ltc-core`). This file does not copy it: it lifts that script out of the page as it
// stands and runs it, so the score is the score of the reader a class actually sees.
// Run it with:  node gauntlet.mjs run backward-reader.mjs   (and `sweep backward-reader.mjs`)
//
// How it differs from GoButton's reader, before any file is played:
//   - it reads a whole buffer at once, not sample by sample: it times every edge first, then sorts
//     the gaps, so it can look ahead (its lock is the 90th-percentile gap of the next forty);
//   - it looks for the sync word both ways round, so a tape played backward reads;
//   - it checks one of the two free checks, the even count (decodeWord refuses an odd word),
//     but not the other: it never asks whether a frame follows the one before;
//   - it names one rate for the whole buffer, from the spacing of all its sync words.
// The adapter gives every frame that one rate, and translates the page's rate names into ltc.js's.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(here, '..', 'SMPTE LTC — rich — backward.html'), 'utf8');
const core = html.match(/<script id="ltc-core">([\s\S]*?)<\/script>/)[1];
const box = {}; vm.createContext(box); vm.runInContext(core + '\nthis.LTC = LTC;', box);
const LTC = box.LTC;
const NAME = { '29.97': '29.97 drop', '29.97 ndf': '29.97' };   // the page's names → ltc.js's

export function read(samples, sampleRate) {
  const rd = LTC.read(samples, sampleRate);
  const rate = NAME[rd.rate] ?? rd.rate;
  return rd.frames.map((fr) => ({ h: fr.tc.h, m: fr.tc.m, s: fr.tc.s, f: fr.tc.f, drop: fr.tc.df, df: fr.tc.df, rate, dir: fr.dir }));
}
export { LTC };
