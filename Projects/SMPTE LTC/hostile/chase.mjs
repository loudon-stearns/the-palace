// How long until a desk can trust the clock? The readers, measured the way a show uses them.
//
// The gauntlet asks whether a reader reads. A show asks when. GoButton's TIMECODE track starts, and
// a lighting desk, a video server and a DAW each have to hear enough of it to know the time before
// the first cue. If the cable drops out, each has to find the time again. This script times both,
// for every reader in this folder, at 30 fps and 48 kHz with the standard's soft edges:
//
//   COLD START — half a second of silence, then timecode. How many frames of LTC go by before the
//     reader names its first frame, and how far behind the frame now playing is the one it names.
//     That is the least pre-roll a show can have before its first cue, before the desk's own rule.
//   DROPOUT — gaps of 1, 3, 10 and 30 frames cut into the middle. How many frames after the signal
//     comes back until the reader names a frame again, and whether it names any wrong one.
//   JUMP — one song's clip cut straight into the next, 01:00:02:14 then 02:00:00:00 with no Pre-Roll
//     between, as two clips side by side on GoButton's TIMECODE track send it. How many frames of the
//     new song go by before the reader names one, and whether it names a frame that never played.
//   Both again with white noise 20 dB down, a long cable run near a dimmer rack.
//
// The time a reader names a frame is found by reading longer and longer starts of the file, so every
// reader is timed the same way, whatever it returns. Run:  node chase.mjs   (writes chase.json)
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const L = require(path.join(here, '..', 'SMPTE LTC — rich — ltc.js'));

const SR = 48000, RATE = L.RATES['30'], FRAME = SR / 30;
const START = '00:59:55:00';

function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function gauss(r) { const u = Math.max(r(), 1e-12), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function soft(y) { const a = 1 - Math.exp(-2 * Math.PI * (2.2 / (2 * Math.PI * 25e-6)) / SR); let z = 0; return y.map((v) => (z += a * (v - z))); }
function noise(y, snrDb, seed) { const r = rng(seed); let p = 0, n = 0; for (const v of y) if (v) { p += v * v; n++; } p /= n; const a = Math.sqrt(p / 10 ** (snrDb / 10)); return y.map((v) => v + a * gauss(r)); }

// lead seconds of silence, then `seconds` of LTC from START; frames[k] is the frame playing k frames in
function show(lead, seconds, gap = null) {
  const e = L.newEncoder(RATE, SR, L.toFrames(L.parse(START), RATE), 0);
  const n0 = Math.round(lead * SR), n = n0 + Math.round(seconds * SR), y = new Float32Array(n);
  for (let i = n0; i < n; i++) y[i] = 0.5 * L.encodeSample(e);
  let out = soft(y);
  if (gap) out.fill(0, n0 + gap.at, n0 + gap.at + gap.len);
  return { y: out, ltcAt: n0 };
}
const playing = (k) => L.text(L.fromFrames(L.toFrames(L.parse(START), RATE) + k, RATE));

const READERS = {
  'GoButton': (y, sr) => L.decode(L.newDecoder(sr), y),
  'GoButton + checks': null, 'careful': null, 'room, checked': null, 'matched': null,
};
const FILES = { 'GoButton + checks': 'sure-reader.mjs', 'careful': 'careful-reader.mjs', 'room, checked': 'checked-backward-reader.mjs', 'matched': 'matched-reader.mjs' };
for (const [k, f] of Object.entries(FILES)) READERS[k] = (await import(path.join(here, f))).read;

// the shortest start of y after which the reader has named a frame satisfying ok(); null if never
function firstAt(read, y, from, ok) {
  const named = (n) => read(y.subarray(0, n), SR).filter(ok);
  if (!named(y.length).length) return null;
  let lo = from, hi = y.length;
  while (hi - lo > 8) { const mid = (lo + hi) >> 1; if (named(mid).length) hi = mid; else lo = mid; }
  return { at: hi, tc: named(hi)[0] };
}

const result = { rate: '30', sampleRate: SR, start: START, readers: {} };
for (const [name, read] of Object.entries(READERS)) {
  const r = { cold: {}, dropout: {} };
  for (const [cond, dirty] of [['clean', (y) => y], ['noise 20 dB', (y) => noise(y, 20, 11)]]) {
    // cold start
    const s = show(0.5, 4); s.y = dirty(s.y);
    const f = firstAt(read, s.y, s.ltcAt, () => true);
    if (f) {
      const k = (f.at - s.ltcAt) / FRAME;
      const names = L.text(f.tc), now = playing(Math.floor(k));
      const behind = L.toFrames(L.parse(now), RATE) - L.toFrames(L.parse(names), RATE);
      r.cold[cond] = { lockFrames: +k.toFixed(2), named: names, playing: now, behind };
    } else r.cold[cond] = null;
    // dropouts
    r.dropout[cond] = {};
    for (const g of [1, 3, 10, 30]) {
      const at = Math.round(2.5 * SR), len = Math.round(g * FRAME);
      const d = show(0.5, 5, { at, len }); d.y = dirty(d.y);
      const back = d.ltcAt + at + len;
      const all = read(d.y, SR), key = new Set(Array.from({ length: 160 }, (_, i) => playing(i)));
      const wrong = all.filter((tc) => !key.has(L.text(tc))).length;
      // a frame named after the gap: its number is past the gap's last frame
      const afterGap = L.toFrames(L.parse(START), RATE) + Math.floor((at + len) / FRAME);
      const f2 = firstAt(read, d.y, back, (tc) => L.toFrames(tc, RATE) >= afterGap);
      r.dropout[cond][g] = { relockFrames: f2 ? +((f2.at - back) / FRAME).toFixed(2) : null, wrong };
    }
    // jump: run A for 2.5 s, then run B from 02:00:00:00, continuous signal
    {
      const enc = (tc, secs) => { const e = L.newEncoder(RATE, SR, L.toFrames(L.parse(tc), RATE), 0); const y = new Float32Array(Math.round(secs * SR)); for (let i = 0; i < y.length; i++) y[i] = 0.5 * L.encodeSample(e); return y; };
      const a = enc('01:00:00:00', 2.5), b = enc('02:00:00:00', 2), y = new Float32Array(a.length + b.length); y.set(a); y.set(b, a.length);
      const yy = dirty(soft(y));
      const key = new Set([...Array.from({ length: 75 }, (_, i) => L.text(L.fromFrames(L.toFrames(L.parse('01:00:00:00'), RATE) + i, RATE))), ...Array.from({ length: 60 }, (_, i) => L.text(L.fromFrames(L.toFrames(L.parse('02:00:00:00'), RATE) + i, RATE)))]);
      const wrong = read(yy, SR).filter((tc) => !key.has(L.text(tc))).length;
      const f3 = firstAt(read, yy, a.length, (tc) => tc.h === 2);
      r.jump = r.jump || {}; r.jump[cond] = { frames: f3 ? +((f3.at - a.length) / FRAME).toFixed(2) : null, named: f3 ? L.text(f3.tc) : null, wrong };
    }
  }
  result.readers[name] = r;
  const c = r.cold.clean, cn = r.cold['noise 20 dB'];
  console.log(`${name.padEnd(18)} cold: ${c ? c.lockFrames.toFixed(2) + ' frames, names ' + c.named + ' while ' + c.playing + ' plays (' + c.behind + ' behind)' : 'never'}`
    + ` | noisy ${cn ? cn.lockFrames.toFixed(2) : 'never'}`
    + ` | relock after 1/3/10/30: ${[1, 3, 10, 30].map((g) => r.dropout.clean[g].relockFrames ?? '—').join(' / ')}`
    + ` | jump ${r.jump.clean.frames} (${r.jump.clean.named})`
    + ` | wrong ${[1, 3, 10, 30].map((g) => r.dropout.clean[g].wrong + r.dropout['noise 20 dB'][g].wrong).reduce((a, b) => a + b)}`);
}
fs.writeFileSync(path.join(here, 'chase.json'), JSON.stringify(result, null, 1));
