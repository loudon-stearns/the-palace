// portal_mirror.mjs — run portal.codebox's own text as JavaScript and ask
// the portal's question: is it still the same instrument?
//
//   node portal_mirror.mjs
//
// 1. Same instrument? The codebox against the face model (stage 4, gen~),
//    sample for sample, all five outlets, over the séance performance.
//    The reference comes from face_reference.py (needs the ComfyUI python).
// 2. Same instrument everywhere? The codebox at 44.1, 48 and 96 kHz and at
//    120, 90 and 60 BPM, beside the gen~ tape size (192000) dropped into
//    the same text. Where does the ghost land, and is it where the music
//    says it should be (half a measure back)?
// 3. Renders, from the codebox itself:
//      portal-performance.wav      the séance performance (48 kHz)
//      slow-tempo-gen-tape.wav     96 kHz, 60 BPM, the gen~ tape: the ghost comes back early
//      slow-tempo-portal.wav       the same through the portal's tape: on the beat
//
// The transpiler is adopted from the 2D Torus RNBO/codebox_transpile.mjs and
// the Neural Granular variant: @param/@state become variables, const and
// function stay, the rest is the per-sample tick; here with five outlets.
// What a match proves: the codebox's arithmetic is the face model's. What it
// does not prove: that RNBO compiles it, or how it behaves in a host.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SOURCE = fs.readFileSync(path.join(here, 'portal.codebox'), 'utf8');

export function transpile(src) {
  src = src.replace(/\/\/.*$/gm, '');
  const decl = [], names = [];
  src = src.replace(/^@param\s*\(\{[^}]*\}\)\s*(\w+)\s*=\s*([^;]+);/gm, (_, n, v) => { decl.push(`let ${n} = ${v};`); names.push(n); return ''; });
  src = src.replace(/^@state\s+(\w+)\s*=\s*([^;]+);/gm, (_, n, v) => { decl.push(`let ${n} = ${v};`); names.push(n); return ''; });
  const consts = []; src = src.replace(/^const\s+[^;]+;/gm, m => { consts.push(m); return ''; });
  const fns = []; src = src.replace(/^function\s+\w+\s*\([^)]*\)\s*\{[\s\S]*?^\}/gm, m => { fns.push(m); return ''; });
  const body = src.trim();
  const code = `
    const floor = Math.floor, abs = Math.abs, exp = Math.exp, min = Math.min, max = Math.max,
          clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);
    const FixedFloat64Array = Float64Array;
    const samplerate = sr;
    ${consts.join('\n')}
    ${decl.join('\n')}
    ${fns.join('\n')}
    let in1 = 0, out1 = 0, out2 = 0, out3 = 0, out4 = 0, out5 = 0;
    return {
      set(k, v) { switch (k) { ${names.map(n => `case '${n}': ${n} = v; break;`).join(' ')} default: throw new Error('no ' + k); } },
      tick(x) { in1 = x; { ${body} } return out1; },
      outs() { return [out1, out2, out3, out4, out5]; }
    };`;
  return new Function('sr', code);
}

function writeWav(p, x, sr, scale = 1) {
  const pcm = Buffer.alloc(44 + x.length * 2);
  pcm.write('RIFF', 0); pcm.writeUInt32LE(36 + x.length * 2, 4); pcm.write('WAVEfmt ', 8);
  pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(sr, 24);
  pcm.writeUInt32LE(sr * 2, 28); pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write('data', 36); pcm.writeUInt32LE(x.length * 2, 40);
  for (let i = 0; i < x.length; i++) pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, x[i] * scale)) * 32767), 44 + i * 2);
  fs.writeFileSync(p, pcm);
}
const f64 = (p) => { const b = fs.readFileSync(p); return new Float64Array(b.buffer, b.byteOffset, b.length / 8); };

// ---- 1. the null test against the face model --------------------------------
const PY = path.join(os.homedir(), 'ComfyUI-Installs/ComfyUI/standalone-env/bin/python');
const ref = fs.mkdtempSync(path.join(os.tmpdir(), 'rd-portal-'));
execFileSync(PY, [path.join(here, 'face_reference.py'), ref], { stdio: 'inherit' });
const x = f64(path.join(ref, 'x.f64')), gain = f64(path.join(ref, 'gain.f64')),
      lag = f64(path.join(ref, 'lag.f64')), outs = f64(path.join(ref, 'outs.f64'));
const N = x.length;
const cb = transpile(SOURCE)(48000);
const maxd = [0, 0, 0, 0, 0], peak = [0, 0, 0, 0, 0];
const perf = new Float64Array(N);
const t0 = process.hrtime.bigint();
for (let n = 0; n < N; n++) {
  cb.set('gain', gain[n]); cb.set('lag', lag[n]);
  cb.tick(x[n]);
  const o = cb.outs();
  perf[n] = o[0];
  // the face model's outlets: out1 mix, out2 ghost alone, out3 gs, out4 presence, out5 holding
  const mine = [o[0], o[0] - x[n], o[2], o[3], o[4]];
  for (let k = 0; k < 5; k++) {
    const r = outs[k * N + n];
    maxd[k] = Math.max(maxd[k], Math.abs(mine[k] - r));
    peak[k] = Math.max(peak[k], Math.abs(r));
  }
}
const secs = Number(process.hrtime.bigint() - t0) / 1e9;
const labels = ['dry + ghost', 'the ghost', 'knob as heard', 'presence', 'holding'];
console.log('\n1. portal.codebox against the face model (gen~), séance performance, 48 kHz:');
labels.forEach((l, k) => console.log(`   ${l.padEnd(14)} max difference ${maxd[k].toExponential(2)}  (peak ${peak[k].toFixed(3)})`));
console.log(`   transpiled codebox ran at ${(N / 48000 / secs).toFixed(1)}x realtime in node`);
writeWav(path.join(here, 'portal-performance.wav'), perf, 48000);

// ---- 2. the same instrument at other rates and tempos -----------------------
function pluckPhrase(sr, bpm) {
  // one measure of eighth notes, then three measures of silence
  const notes = [62, 65, 69, 72, 70, 69, 65, 67];
  const measure = Math.round(sr * 240 / bpm), eighth = measure / 8;
  const y = new Float64Array(measure * 4);
  notes.forEach((m, i) => {
    const f = 440 * Math.pow(2, (m - 69) / 12), s0 = Math.round(i * eighth), len = Math.round(eighth * 0.9);
    for (let j = 0; j < len; j++) {
      const t = j / sr, env = Math.exp(-t * 6) * Math.min(1, j / (0.002 * sr)) * Math.min(1, (len - j) / (0.004 * sr));
      y[s0 + j] += 0.3 * env * (Math.sin(2 * Math.PI * f * t) + 0.3 * Math.sin(4 * Math.PI * f * t));
    }
  });
  return { y, measure };
}
function runFixed(src, sr, bpm) {
  const { y, measure } = pluckPhrase(sr, bpm);
  const m = transpile(src)(sr);
  m.set('bpm', bpm); m.set('lag', 0.5); m.set('gain', 1);
  const wet = new Float64Array(y.length), mix = new Float64Array(y.length);
  for (let n = 0; n < y.length; n++) { m.tick(y[n]); const o = m.outs(); mix[n] = o[0]; wet[n] = o[0] - y[n]; }
  return { y, wet, mix, measure };
}
function ghostDelaySeconds(y, wet, sr, measure) {
  // where in the first measure+half does the ghost best match the input?
  // coarse search on a decimated envelope, then exact on the signal
  const span = Math.round(measure * 1.5), step = Math.max(1, Math.round(sr / 4000));
  let best = -Infinity, bestD = 0;
  for (let d = step; d < span; d += step) {
    let s = 0; for (let n = 0; n + d < measure + d && n < measure; n += step) s += y[n] * wet[n + d];
    if (s > best) { best = s; bestD = d; }
  }
  for (let d = Math.max(1, bestD - step); d <= bestD + step; d++) {
    let s = 0; for (let n = 0; n < measure; n++) s += y[n] * wet[n + d];
    if (s > best) { best = s; bestD = d; }
  }
  return bestD / sr;
}
const GEN_TAPE = SOURCE.replace(/384000/g, '192000');
const rows = [];
console.log('\n2. where the ghost lands, lag = half a measure (should be 120/bpm seconds):');
console.log('   rate     bpm   should   portal tape   gen~ tape');
for (const sr of [44100, 48000, 96000]) for (const bpm of [120, 90, 60]) {
  const want = 120 / bpm;
  const p = runFixed(SOURCE, sr, bpm), g = runFixed(GEN_TAPE, sr, bpm);
  const dp = ghostDelaySeconds(p.y, p.wet, sr, p.measure), dg = ghostDelaySeconds(g.y, g.wet, sr, g.measure);
  const mark = (d) => `${d.toFixed(3)} s ${Math.abs(d - want) < 0.001 ? 'on time' : 'EARLY'}`;
  console.log(`   ${String(sr).padEnd(7)} ${String(bpm).padEnd(5)} ${want.toFixed(3)} s  ${mark(dp).padEnd(13)} ${mark(dg)}`);
  rows.push([sr, bpm, want, dp, dg]);
  if (sr === 96000 && bpm === 60) {
    writeWav(path.join(here, 'slow-tempo-gen-tape.wav'), g.mix, sr, 0.8);
    writeWav(path.join(here, 'slow-tempo-portal.wav'), p.mix, sr, 0.8);
  }
}
fs.writeFileSync(path.join(here, 'portal_mirror_report.json'), JSON.stringify({
  null_test_vs_face_model: Object.fromEntries(labels.map((l, k) => [l, maxd[k]])),
  realtime_factor_node: N / 48000 / secs,
  ghost_delay_s: rows.map(([sr, bpm, want, dp, dg]) => ({ sr, bpm, want, portal: dp, gen_tape: dg })),
}, null, 1) + '\n');
fs.rmSync(ref, { recursive: true, force: true });
console.log('\nwrote portal-performance.wav, slow-tempo-gen-tape.wav, slow-tempo-portal.wav, portal_mirror_report.json');
