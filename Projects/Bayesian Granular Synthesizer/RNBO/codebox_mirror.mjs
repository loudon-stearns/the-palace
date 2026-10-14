// codebox_mirror.mjs — run belief-cloud.codebox and notes-in.codebox as
// JavaScript and hold them against bayes_engine.js (the board
// instrument's engine), sample by sample, through the same 42-second take
// as chord-belief.wav. Then write the codebox's own take.
//
//   node RNBO/codebox_mirror.mjs
//
// The transpiler is adopted from Neural Granular Synthesis/RNBO/
// codebox_mirror.mjs (itself from the 2D Torus Wavetable Synthesizer):
// @param and @state become variables, const and function stay, the rest
// is the per-sample tick. Extended here for buffer(), peek/poke and an
// event-rate codebox (notes-in) whose tick runs once per MIDI message.
//
// Before comparing, the board engine is handed the codebox's random
// generator (Park–Miller in place of its 32-bit mulberry), so both draw
// the same grains. Known, harmless differences: voice slots retire at
// slightly different moments, which reorders a sum (rounding only); the
// board soft-clips with Math.tanh, the codebox with the same curve
// written out.
//
// What a match proves: the codebox's arithmetic is the board
// instrument's, including the note table and the chord-order logic. What
// it does not prove: that RNBO compiles it, its CPU cost in Live, or how
// it sounds through Max. Those need Loudon.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const { BeliefCloud } = require(path.join(here, '..', 'bayes_engine.js'));

export function transpile(src, outs = 3) {
  src = src.replace(/\/\/.*$/gm, '');
  const decl = [], names = [];
  src = src.replace(/^@param\s*\(\{[^}]*\}\)\s*(\w+)\s*=\s*([^;]+);/gm, (_, n, v) => { decl.push(`let ${n} = ${v};`); names.push(n); return ''; });
  src = src.replace(/^@state\s+(\w+)\s*=\s*([^;]+);/gm, (_, n, v) => { decl.push(`let ${n} = ${v};`); names.push(n); return ''; });
  const consts = []; src = src.replace(/^const\s+[^;]+;/gm, m => { consts.push(m); return ''; });
  const fns = []; src = src.replace(/^function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?^\}/gm, m => { fns.push(m); return ''; });
  const body = src.trim();
  const o = Array.from({ length: outs }, (_, i) => `out${i + 1}`);
  const code = `
    const floor = Math.floor, abs = Math.abs, sin = Math.sin, cos = Math.cos, exp = Math.exp, sqrt = Math.sqrt,
          log = Math.log, pow = Math.pow, min = Math.min, max = Math.max, PI = Math.PI,
          clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);
    const FixedFloat64Array = Float64Array;
    const samplerate = () => sr;
    const buffer = (name) => buffers[name];
    const peek = (b, i) => b[Math.floor(i)] || 0;
    const poke = (b, i, v) => { b[Math.floor(i)] = v; };
    ${consts.join('\n')}
    ${decl.join('\n')}
    ${fns.join('\n')}
    let in1 = 0, in2 = 0, ${o.map(x => x + ' = 0').join(', ')};
    return {
      set(k, v) { switch (k) { ${names.map(n => `case '${n}': ${n} = v; break;`).join(' ')} default: throw new Error('no ' + k); } },
      get(k) { switch (k) { ${names.map(n => `case '${n}': return ${n};`).join(' ')} } },
      tick(a = 0, b = 0) { in1 = a; in2 = b; ${body}
        return [${o.join(', ')}]; }
    };`;
  return new Function('sr', 'buffers', code);
}

// the board engine, handed the codebox's random generator
class PMCloud extends BeliefCloud {
  rand() { this.s = (this.s * 48271) % 2147483647; return this.s / 2147483647; }
}

const SR = 48000, DUR = 42, BLOCK = 2400;
const buffers = { held: new Float64Array(128), prior: new Float64Array(630) };
const cloud = transpile(fs.readFileSync(path.join(here, 'belief-cloud.codebox'), 'utf8'))(SR, buffers);
const notesIn = transpile(fs.readFileSync(path.join(here, 'notes-in.codebox'), 'utf8'), 1)(SR, buffers);

// the same take as render_chord_belief.js
function pentatonicPrior(B, binMidi) {
  const pcs = [9, 0, 2, 4, 7], out = new Float64Array(B);
  for (let i = 0; i < B; i++) {
    const m = binMidi(i); let v = 0.04;
    for (let oct = 1; oct < 9; oct++) for (const pc of pcs) { const d = (m - (12 * oct + pc)) / 0.4; v += Math.exp(-0.5 * d * d); }
    out[i] = v;
  }
  return out;
}
const EVENTS = [
  [4.0, 'on', 60], [4.0, 'on', 64], [4.0, 'on', 67],
  [14.0, 'off', 67], [14.0, 'on', 57],
  [22.0, 'off', 57], [22.0, 'off', 60], [22.0, 'off', 64],
  [28.0, 'prior', 'pentatonic'],
  [34.0, 'on', 45], [34.0, 'on', 52],
];

const eng = new PMCloud(SR);
const total = SR * DUR;
const A = [new Float32Array(total), new Float32Array(total)];
const C = [new Float64Array(total), new Float64Array(total)];
const focus = [];
let ev = 0, cbNs = 0n;
for (let s = 0; s < total; s += BLOCK) {
  const t = s / SR;
  while (ev < EVENTS.length && EVENTS[ev][0] <= t + 1e-9) {
    const [, kind, arg] = EVENTS[ev++];
    if (kind === 'on') { eng.noteOn(arg); notesIn.tick(arg, 100); }
    else if (kind === 'off') { eng.noteOff(arg); notesIn.tick(arg, 0); }
    else { eng.setPrior(pentatonicPrior(eng.B, (i) => eng.binMidi(i))); cloud.set('priorShape', 1); }
  }
  const n = Math.min(BLOCK, total - s);
  eng.process(A[0].subarray(s, s + n), A[1].subarray(s, s + n), n);
  const c0 = process.hrtime.bigint();
  let o;
  for (let j = 0; j < n; j++) { o = cloud.tick(0); C[0][s + j] = o[0]; C[1][s + j] = o[1]; }
  cbNs += process.hrtime.bigint() - c0;
  if ((s / BLOCK) % 2 === 0) focus.push([+t.toFixed(2), +o[2].toFixed(3), cloud.get('nv')]);
}

const rms = (x) => { let q = 0; for (const v of x) q += v * v; return Math.sqrt(q / x.length); };
const report = { seconds: DUR, samplerate: SR, channels: {} };
let worst = 0, firstOff = -1;
for (const ch of [0, 1]) {
  let maxD = 0; const d = new Float64Array(total);
  for (let i = 0; i < total; i++) {
    d[i] = A[ch][i] - C[ch][i];
    const a = Math.abs(d[i]);
    if (a > maxD) maxD = a;
    if (a > 1e-5 && firstOff < 0) firstOff = i;
  }
  worst = Math.max(worst, maxD);
  report.channels[ch ? 'right' : 'left'] = { max_abs_diff: maxD, diff_under_signal_dB: +(20 * Math.log10(rms(d) / rms(A[ch]) + 1e-15)).toFixed(1) };
}
report.first_sample_off_by_more_than_1e5th = firstOff;
report.codebox_js_cost_x_realtime = +(Number(cbNs) / 1e9 / DUR).toFixed(3);
report.note = 'board output is float32 (the engine writes Float32Arrays), so ~1e-7 is the floor of agreement';
report.focus_trace = focus.filter((_, i) => i % 5 === 0);   // [t, out3 belief focus, voices]
fs.writeFileSync(path.join(here, 'codebox_mirror_report.json'), JSON.stringify(report) + '\n');
console.log(`42 s take: max |board − codebox| ${worst.toExponential(2)}; L ${report.channels.left.diff_under_signal_dB} dB, R ${report.channels.right.diff_under_signal_dB} dB under the signal; first sample off >1e-5: ${firstOff}; transpiled codebox ${report.codebox_js_cost_x_realtime}× realtime in node`);

// the codebox's own take, normalized like chord-belief.wav
let peak = 0; for (const ch of C) for (const v of ch) peak = Math.max(peak, Math.abs(v));
const fade = SR * 0.6; for (const ch of C) for (let i = 0; i < fade; i++) ch[total - 1 - i] *= i / fade;
const g = 0.89 / peak, pcm = Buffer.alloc(44 + total * 4);
pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + total * 4, 4); pcm.write('WAVEfmt ', 8);
pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22); pcm.writeUInt32LE(SR, 24);
pcm.writeUInt32LE(SR * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(total * 4, 40);
for (let i = 0; i < total; i++) {
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, C[0][i] * g)) * 32767), 44 + i * 4);
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, C[1][i] * g)) * 32767), 46 + i * 4);
}
fs.writeFileSync(path.join(here, 'codebox-take.wav'), pcm);
