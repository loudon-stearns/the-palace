// prior_tone_ab.mjs — the A/B for "should the prior's own peaks lengthen
// grains?", rendered twice from the same seed and the same painted belief:
//   A  priorTone 0   the instrument as before: the resting cloud is clicky
//                    even where the painted prior is sure
//   B  priorTone 1, toneCurve 1    grains landing on a painted peak grow
//                    long in proportion to how sure the prior is there
//   C  priorTone 1, toneCurve 0.5  a wider tonal zone round each peak: more
//                    hum, but long grains up to ~25 cents off the note
// Each take also runs through the RNBO codeboxes (paint-in.codebox driven
// by the 64 slider values exactly as [listfunnel] would send them, then
// belief-cloud.codebox) and is checked against the board engine sample
// by sample.
//   node RNBO/prior_tone_ab.mjs      → ../prior-tone-{A,B,C}.wav,
//                                      prior_tone_report.json, prior_tone_grains.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { transpile, PMCloud } from './codebox_mirror.mjs';
const here = path.dirname(fileURLToPath(import.meta.url));
const SR = 48000, DUR = 31, BLOCK = 2400;

// the composed resting belief: a D-dorian hum, D strongest
export const BELIEF = { 38: 0.6, 50: 1.0, 57: 0.9, 60: 0.55, 62: 0.5, 64: 0.75, 67: 0.5, 69: 0.4 };
const semis = new Array(64).fill(0); for (const [m, v] of Object.entries(BELIEF)) semis[m - 33] = v;

const EVENTS = [            // [t, on|off, midi]
  [9, 'on', 50], [9, 'on', 57],                 // agree with the belief: D3 + A3
  [17, 'off', 50], [17, 'off', 57],
  [20, 'on', 52], [20, 'on', 56], [20, 'on', 59], // argue with it: E major, G#3 sits between hills
  [27, 'off', 52], [27, 'off', 56], [27, 'off', 59],
];
const LABELS = [[0, 'painted belief, nothing held'], [9, 'hold D3 + A3 (agrees)'], [17, 'let go'], [20, 'hold E G# B (argues)'], [27, 'let go']];

class Rec extends PMCloud {
  draw() { const g = super.draw(); if (g) this.log.push([+(this.clock).toFixed(4), +g.midi.toFixed(3), +g.cycles.toFixed(1)]); return g; }
}

function take(priorTone, curve) {
  const buffers = { held: new Float64Array(128), prior: new Float64Array(631) };
  const cloud = transpile(fs.readFileSync(path.join(here, 'belief-cloud.codebox'), 'utf8'))(SR, buffers);
  const notesIn = transpile(fs.readFileSync(path.join(here, 'notes-in.codebox'), 'utf8'), 1)(SR, buffers);
  const paintIn = transpile(fs.readFileSync(path.join(here, 'paint-in.codebox'), 'utf8'), 1)(SR, buffers);
  for (let k = 0; k < 64; k++) paintIn.tick(k, semis[k]);          // listfunnel: "k v" for every slider
  cloud.set('priorShape', 2); cloud.set('priorTone', priorTone); cloud.set('toneCurve', curve);
  const eng = new Rec(SR); eng.log = [];
  eng.setPrior(PMCloud.paintedPrior(semis)); eng.priorTone = priorTone; eng.toneCurve = curve; eng.priorDirty = true;
  let paintDiff = 0; const ref = PMCloud.paintedPrior(semis);
  for (let i = 0; i < 630; i++) paintDiff = Math.max(paintDiff, Math.abs(ref[i] - buffers.prior[i]));
  const total = SR * DUR;
  const A = [new Float32Array(total), new Float32Array(total)], C = [new Float64Array(total), new Float64Array(total)];
  let ev = 0;
  for (let s = 0; s < total; s += BLOCK) {
    const t = s / SR;
    while (ev < EVENTS.length && EVENTS[ev][0] <= t + 1e-9) {
      const [, kind, m] = EVENTS[ev++];
      if (kind === 'on') { eng.noteOn(m); notesIn.tick(m, 100); } else { eng.noteOff(m); notesIn.tick(m, 0); }
    }
    const n = Math.min(BLOCK, total - s);
    eng.process(A[0].subarray(s, s + n), A[1].subarray(s, s + n), n);
    for (let j = 0; j < n; j++) { const o = cloud.tick(0); C[0][s + j] = o[0]; C[1][s + j] = o[1]; }
  }
  let maxD = 0; for (const ch of [0, 1]) for (let i = 0; i < total; i++) maxD = Math.max(maxD, Math.abs(A[ch][i] - C[ch][i]));
  return { A, maxD, paintDiff, grains: eng.log };
}

function writeWav(file, X) {
  const total = X[0].length; let peak = 0; for (const ch of X) for (const v of ch) peak = Math.max(peak, Math.abs(v));
  const fade = SR * 0.6, g = 0.89 / peak, pcm = Buffer.alloc(44 + total * 4);
  pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + total * 4, 4); pcm.write('WAVEfmt ', 8);
  pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22); pcm.writeUInt32LE(SR, 24);
  pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(total * 4, 40);
  for (let i = 0; i < total; i++) {
    const f = i > total - fade ? (total - i) / fade : 1;
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, X[0][i] * g * f)) * 32767), 44 + i * 4);
    pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, X[1][i] * g * f)) * 32767), 46 + i * 4);
  }
  fs.writeFileSync(file, pcm);
}

const report = { seconds: DUR, belief: BELIEF, events: EVENTS, labels: LABELS, takes: {} }, grainsOut = { labels: LABELS, dur: DUR, takes: {} };
for (const [name, tone, curve] of [['A', 0, 1], ['B', 1, 1], ['C', 1, 0.5]]) {
  const r = take(tone, curve);
  writeWav(path.join(here, '..', `prior-tone-${name}.wav`), r.A);
  const win = (a, b) => { const g = r.grains.filter(x => x[0] >= a && x[0] < b); const lg = g.map(x => Math.log2(x[2]));
    return { grains: g.length, median_cycles: +Math.pow(2, lg.sort((p, q) => p - q)[lg.length >> 1]).toFixed(1),
      long_share: +(g.filter(x => x[2] >= 32).length / g.length).toFixed(3) }; };
  report.takes[name] = { priorTone: tone, toneCurve: curve, max_abs_diff_board_vs_codebox: r.maxD, paint_table_max_diff: r.paintDiff,
    resting: win(1, 9), agrees: win(13, 17), argues: win(23, 27), after: win(28, 31) };
  grainsOut.takes[name] = r.grains.filter((_, i) => i % 3 === 0);
  console.log(name, JSON.stringify(report.takes[name]));
}
fs.writeFileSync(path.join(here, 'prior_tone_report.json'), JSON.stringify(report, null, 1) + '\n');
fs.writeFileSync(path.join(here, 'prior_tone_grains.json'), JSON.stringify(grainsOut));
