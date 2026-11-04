// title: SMPTE LTC — rich — checks
// born: 2026-11-04
// links: [[SMPTE LTC]] connects-to · rich-face-checks · holds "SMPTE LTC — rich — the teaching room.html" to "The fine points"
// forward_vector: I re-check every claim the teaching room makes, on its own code: I hold the copied
//   ltc.js to GoButton's original byte for byte, pull the piece's <script id="engine"> out as written,
//   and test each step's number against the section's words, so a change made for a later step that
//   breaks an earlier one fails here. I grow by a check for every stop the room adds.
//
// Run: node "Projects/SMPTE LTC/SMPTE LTC — rich — checks.mjs"   (exit 1 on any failure)
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const ENGINE_FILE = join(here, 'SMPTE LTC — rich — ltc.js');
const PIECE = join(here, 'SMPTE LTC — rich — the teaching room.html');
const ORIGINAL = '/Users/loudonstearns/Documents/GoButton Local/v2/device/ltc.js';
const PINNED = '40efd97cafc3a34f85196440ae9e457083a0eef9c4019ee2837bbefb2c38f7cc';

let failed = 0, passed = 0;
function check(what, ok, detail = '') {
  if (ok) { passed++; console.log('  ✓ ' + what + (detail ? ' · ' + detail : '')); }
  else { failed++; console.log('  ✗ ' + what + (detail ? ' · ' + detail : '')); }
}

// ── 0. the engine is GoButton's, unedited ──
console.log('the engine');
const copy = readFileSync(ENGINE_FILE, 'utf8');
const marker = '// ' + '-'.repeat(70) + '\n';
const body = copy.slice(copy.indexOf(marker) + marker.length);
const sha = createHash('sha256').update(body).digest('hex');
check('the copy below the header is the pinned ltc.js', sha === PINNED, sha.slice(0, 12));
if (existsSync(ORIGINAL)) {
  const orig = createHash('sha256').update(readFileSync(ORIGINAL)).digest('hex');
  check('GoButton\'s ltc.js has not moved on since the copy', orig === PINNED, orig === PINNED ? 'same' : 'GoButton changed: copy it again');
} else console.log('  · GoButton Local is not on this machine; the pin is checked, the original is not');

// ── load the engine and the piece's own helpers, as written ──
const ctx = { console, Math, Number, String, Array, Set, Object };
vm.createContext(ctx);
vm.runInContext(body + '\n;this.Ltc = (typeof Ltc !== "undefined") ? Ltc : this.Ltc;', ctx, { filename: 'ltc.js' });
if (!ctx.Ltc) { const m = { exports: {} }; vm.runInContext('(function(module){' + body + '})', ctx)(m); ctx.Ltc = m.exports; }
const html = readFileSync(PIECE, 'utf8');
const engineSrc = html.match(/\n<script id="engine">([\s\S]*?)<\/script>/)[1];
vm.runInContext(engineSrc + '\n;Object.assign(this, { RATE_KEYS, USER_BITS, role, wordFor, zerosIn, tcSeconds, plainIndex, skippedSoFar, frameAt, behind, behindAfter, behindWords, rounds, dayResidual, syncSearch, searchChunk, evenZeros, SYNC_TEXT, SYNC_BACK, polarityBit, freeFlags });', ctx, { filename: 'engine' });
const { Ltc } = ctx, E = ctx;
const RATE = (k) => Ltc.RATES[k];

// ── 1. count · frames, not seconds ──
console.log('step 1 · count · frames, not seconds');
for (const [k, bps] of [['24', 1920], ['25', 2000], ['30', 2400]]) check(k + ' fps sends ' + bps + ' bits a second', 80 * RATE(k).fps === bps);
check('29.97 sends 2397.6 bits a second', Math.abs(80 * RATE('29.97').fps - 2397.6) < 0.01, (80 * RATE('29.97').fps).toFixed(4));
check('at 25 fps, frame 24 is 00:00:00:24 and frame 25 is 00:00:01:00',
  Ltc.text(Ltc.fromFrames(24, RATE('25'))) === '00:00:00:24' && Ltc.text(Ltc.fromFrames(25, RATE('25'))) === '00:00:01:00');

// ── 2. count · six rates ──
console.log('step 2 · count · six rates');
check('six rates on the chips, the six ltc.js knows', E.RATE_KEYS.length === 6 && E.RATE_KEYS.every((k) => Ltc.RATES[k]));
for (const k of ['23.976', '29.97']) {
  const b = E.behindAfter(3600, RATE(k));
  check(k + ' falls about 3.6 s behind the wall in an hour', Math.abs(b - 3.6) < 0.01, b.toFixed(4) + ' s');
}
for (const k of ['24', '25', '30']) check(k + ' keeps with the wall', E.behind(3600, RATE(k)) < 1 / RATE(k).fps, E.behind(3600, RATE(k)).toFixed(4) + ' s');
check('the readout says behind when behind, ahead when ahead', E.behindWords(0.5) === 'behind the wall' && E.behindWords(-0.5) === 'ahead of the wall');
check('after a day and an hour at 25 fps the count has gone round midnight once and keeps with the wall',
  E.rounds(25 * 3600, RATE('25')) === 1 && Math.abs(E.behind(25 * 3600, RATE('25'))) < 1 / 25, E.behind(25 * 3600, RATE('25')).toFixed(4) + ' s');
check('after 25 hours at 29.97 the count is still a day\'s numbers in, 3.6 s an hour behind', E.rounds(25 * 3600, RATE('29.97')) === 1 && Math.abs(E.behind(25 * 3600, RATE('29.97')) - 25 * 3600 / 1001) < 0.05, E.behind(25 * 3600, RATE('29.97')).toFixed(3) + ' s');

// ── 3. count · drop-frame ──
console.log('step 3 · count · drop-frame');
const DF = RATE('29.97 drop');
const after = (t) => Ltc.text(Ltc.fromFrames(Ltc.toFrames(Ltc.parse(t), DF) + 1, DF));
check('00:00:59;29 is followed by 00:01:00;02', after('00:00:59:29') === '00:01:00:02');
check('00:09:59;29 is followed by 00:10:00;00', after('00:09:59:29') === '00:10:00:00');
const hourN = Ltc.toFrames({ h: 1, m: 0, s: 0, f: 0 }, DF);
check('108 numbers skipped an hour', E.skippedSoFar(hourN, DF) === 108, String(E.skippedSoFar(hourN, DF)));
check('an hour of drop-frame keeps with the wall to within a frame', Math.abs(E.behind(3600, DF)) < 1 / DF.fps, E.behind(3600, DF).toFixed(5) + ' s');
{
  let most = 0, least = 0;
  for (let n = 0; n < Ltc.toFrames({ h: 1, m: 0, s: 0, f: 0 }, DF); n++) { const b = E.behind((n + 0.5) / DF.fps, DF) * DF.fps; most = Math.max(most, b); least = Math.min(least, b); }
  check('drop-frame runs a little over two frames behind before a skip and a frame or so ahead after it (the step\'s words), in its first hour', most > 2 && most < 2.6 && least < -1 && least > -1.6, 'from ' + least.toFixed(2) + ' to ' + most.toFixed(2) + ' frames');
}
const res = E.dayResidual(DF);
check('a day of drop-frame slips about 2.6 frames (86 ms)', Math.abs(res - 2.59) < 0.01 && Math.abs(1000 * res / DF.fps - 86.4) < 0.5, res.toFixed(3) + ' frames, ' + (1000 * res / DF.fps).toFixed(1) + ' ms');
check('ten minutes hold 17982 numbers against 17982.018 real frames', Math.abs(600 * DF.fps - 17982.018) < 0.001, (600 * DF.fps).toFixed(4));
check('23.976 has no drop-frame', !RATE('23.976').drop);

// ── 4. bits · eighty bits ──
console.log('step 4 · bits · eighty bits');
for (const k of E.RATE_KEYS) {
  const r = RATE(k); let ok = true;
  for (let n = 0; n < Ltc.dayFrames(r); n += 997) { const t = Ltc.fromFrames(n, r), back = Ltc.readBits(E.wordFor(t, r, null)); if (Ltc.text(back) !== Ltc.text(t)) { ok = false; break; } }
  check(k + ': every sampled frame reads back as the time it names', ok);
}
const word = E.wordFor({ h: 1, m: 23, s: 45, f: 17 }, RATE('25'), null);
check('frame units 7 are bits 0 to 3, smallest first: 1 1 1 0', word.slice(0, 4).join('') === '1110');
check('bit 58 is a binary-group flag, and the free flags are 11, 43, 58 and the one the polarity bit is not', E.role(58, RATE('30')).name.startsWith('binary-group flag 1') && E.freeFlags(RATE('30')).join() === '11,43,58,59' && E.freeFlags(RATE('25')).join() === '11,43,58,27');
check('every bit has one role, and they add up: 26 digit, 32 user, 16 sync, 6 flags with the polarity bit',
  (() => { const c = {}; for (let i = 0; i < 80; i++) { const k = E.role(i, RATE('30')).kind; c[k] = (c[k] || 0) + 1; } return c.digit === 26 && c.user === 32 && c.sync === 16 && (c.flag + c.pol) === 6 && c.pol === 1; })());

// ── 5. bits · flags and polarity ──
console.log('step 5 · bits · flags and polarity');
check('the drop-frame flag is bit 10, set only at 29.97 drop', E.wordFor({ h: 0, m: 0, s: 0, f: 2 }, DF, null)[10] === 1 && E.wordFor({ h: 0, m: 0, s: 0, f: 2 }, RATE('29.97'), null)[10] === 0);
check('the polarity bit is 27, and 59 at 25 fps', E.polarityBit(RATE('30')) === 27 && E.polarityBit(RATE('25')) === 59);
for (const k of ['25', '29.97 drop']) {
  for (const [label, user] of [['user bits 0', null], ['user bits 1', E.USER_BITS.map(() => 1)], ['user bits at random', E.USER_BITS.map((_, i) => (i * 7 + 3) % 5 < 2 ? 1 : 0)]]) {
    const r = E.evenZeros(RATE(k), user, 0, Ltc.dayFrames(RATE(k)));
    check(k + ', ' + label + ': every frame of a day holds an even number of 0s', r.odd === 0, r.frames.toLocaleString('en-US') + ' frames');
  }
}

// ── 6. bits · the sync word (the step's test, run as the piece runs it) ──
console.log('step 6 · bits · the sync word');
check('the sync word is 0011 1111 1111 1101', E.SYNC_TEXT === '0011111111111101');
check('read backward it is not the same', E.SYNC_BACK !== E.SYNC_TEXT && E.SYNC_BACK === '1011111111111100');
for (const k of E.RATE_KEYS) {
  const r = RATE(k), day = Ltc.dayFrames(r);
  const ones = E.syncSearch(r, E.USER_BITS.map(() => 1), 0, day, true), zeros = E.syncSearch(r, null, 0, day);
  check(k + ': over a day, every free bit 1, twelve 1s only in the sync word and no other run past 10 (the caption\'s number)',
    ones.longest <= 10 && ones.syncRuns === day && ones.syncLen.length === 1 && ones.syncLen[0] === 12, 'longest elsewhere ' + ones.longest);
  check(k + ': the same with user bits 0', zeros.longest < 12 && zeros.syncRuns === day, 'longest elsewhere ' + zeros.longest);
}
// the piece searches in chunks through its own searchChunk; chunked, it must give the whole search's answer
for (const k of ['29.97 drop', '25']) {
  const r = RATE(k), user = E.USER_BITS.map(() => 1), total = Ltc.toFrames({ h: 1, m: 0, s: 0, f: 0 }, r), chunk = 40000;
  const whole = E.syncSearch(r, user, 0, total, true);
  const acc = { longest: 0, where: null, syncRuns: 0, frames: 0 };
  for (let start = 0; start < total; start += chunk) E.searchChunk(acc, r, user, true, start, Math.min(chunk, total - start));
  check(k + ': the piece\'s chunked search over an hour gives the whole search\'s answer', acc.longest === whole.longest && acc.syncRuns === whole.syncRuns && acc.frames === total && JSON.stringify(acc.where) === JSON.stringify(whole.where), 'longest ' + acc.longest);
}

console.log('\n' + passed + ' passed, ' + failed + ' failed');
process.exit(failed ? 1 : 0);
