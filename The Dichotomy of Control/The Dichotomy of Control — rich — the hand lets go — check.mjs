// title: The Dichotomy of Control — rich — the hand lets go — check
// born: 2026-11-10
// links: [[The Dichotomy of Control]] (connects-to · workshop-check-of the piece "the hand lets go")
// forward_vector: I render the piece's own worklet in Node, through one sit: sound on, the stone in the way, a
//   forty-second press, the release, a minute in the lap, sound off. I print level numbers, because the maker
//   could not hear it. I pass when nothing clips, nothing jumps, and the quiet parts are quiet. I say nothing
//   about whether it sounds good.
// run: node "The Dichotomy of Control/The Dichotomy of Control — rich — the hand lets go — check.mjs"
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, 'The Dichotomy of Control — rich — the hand lets go.html'), 'utf8');
const src = html.match(/<script id="lg-worklet" type="text\/plain">([\s\S]*?)<\/script>/)[1];

function build(sampleRate) {
  let Proc = null;
  class AudioWorkletProcessor { constructor() { this.port = { onmessage: null }; } }
  const registerProcessor = (_n, c) => { Proc = c; };
  new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', src)(AudioWorkletProcessor, registerProcessor, sampleRate);
  return new Proc();
}
const dB = (x) => (x > 0 ? 20 * Math.log10(x) : -Infinity);

// the sit, in seconds: [length, message, name, kind]. A 'change' row is the first second after a state changes;
// its biggest step is held against the steady rows on either side of it.
const SIT = [
  [1.0, {}, 'before the click (must be silent)', 'steady'],
  [1, { on: 1 }, '  sound comes on', 'change'],
  [19, {}, 'the stone in the way', 'steady'],
  [1, { hold: 1 }, '  the press begins', 'change'],
  [39, {}, 'the press held', 'steady'],
  [1, { hold: 0, lap: 1 }, '  the release', 'change'],
  [7, {}, 'the room opening', 'steady'],
  [60, {}, 'in the lap', 'steady'],
  [1, { hold: 1 }, '  pushing again', 'change'],
  [14, {}, 'pushing again, held', 'steady'],
  [1, { hold: 0 }, '  let go again', 'change'],
  [19, {}, 'in the lap again', 'steady'],
  [2, { on: 0 }, '  sound off (fade)', 'change'],
  [1, {}, 'after the fade (must be silent)', 'steady'],
];

let fail = 0;
const say = (ok, line) => { if (!ok) fail++; console.log((ok ? 'PASS  ' : 'FAIL  ') + line); };

for (const sr of [44100, 48000]) {
  console.log(`\n— sample rate ${sr} —`);
  const proc = build(sr);
  const N = 128;
  let prevL = 0, prevR = 0, peakAll = 0, stepAll = 0, bad = 0;
  const rows = [];
  for (const [len, msg, name, kind] of SIT) {
    if (Object.keys(msg).length) proc.port.onmessage({ data: msg });
    const blocks = Math.round(len * sr / N);
    let peak = 0, sq = 0, n = 0, step = 0, dc = 0, cross = 0, sqL = 0, sqR = 0;
    for (let b = 0; b < blocks; b++) {
      const L = new Float32Array(N), R = new Float32Array(N);
      proc.process([], [[L, R]]);
      for (let i = 0; i < N; i++) {
        const l = L[i], r = R[i];
        if (!Number.isFinite(l) || !Number.isFinite(r)) bad++;
        peak = Math.max(peak, Math.abs(l), Math.abs(r));
        step = Math.max(step, Math.abs(l - prevL), Math.abs(r - prevR));
        prevL = l; prevR = r;
        sq += (l * l + r * r) / 2; sqL += l * l; sqR += r * r; cross += l * r; dc += l; n++;
      }
    }
    const rms = Math.sqrt(sq / n);
    rows.push({ name, kind, len, peak, rms, step, dc: dc / n, corr: cross / Math.sqrt(sqL * sqR || 1) });
    peakAll = Math.max(peakAll, peak); stepAll = Math.max(stepAll, step);
  }
  for (const r of rows) {
    console.log(`  ${r.name.padEnd(36)} ${String(r.len).padStart(3)} s   peak ${dB(r.peak).toFixed(1).padStart(7)} dBFS   RMS ${dB(r.rms).toFixed(1).padStart(7)} dBFS   biggest step ${r.step.toFixed(5)}   L/R corr ${r.corr.toFixed(2)}`);
  }
  say(bad === 0, 'no NaN or infinity anywhere');
  say(rows[0].peak === 0, 'silent before the click');
  say(rows[rows.length - 1].peak < 1e-4, `silent after the fade (peak ${dB(rows[rows.length - 1].peak).toFixed(1)} dBFS)`);
  say(peakAll < 0.2512, `nothing above -12 dBFS, so no clipping (loudest peak ${dB(peakAll).toFixed(1)} dBFS)`);
  // a click would be a step bigger than anything the steady sound on either side of the change makes
  let worst = 0, worstName = '';
  rows.forEach((r, i) => {
    if (r.kind !== 'change') return;
    const around = Math.max(rows[i - 1].step, rows[i + 1].step, 0.001);
    const ratio = r.step / around;
    if (ratio > worst) { worst = ratio; worstName = r.name.trim(); }
  });
  say(worst <= 1.15, `no click at any change: the biggest step in the second after a change is ${worst.toFixed(2)} times the steady sound beside it at most (at "${worstName}")`);
  say(Math.max(...rows.map((r) => Math.abs(r.dc))) < 1e-3, 'no DC offset');
  const lapRow = rows.find((r) => r.name === 'in the lap'), holdRow = rows.find((r) => r.name === 'the press held'), waitRow = rows.find((r) => r.name === 'the stone in the way');
  say(dB(lapRow.rms) < -24 && dB(lapRow.rms) > -40, `in the lap it is quiet but there: RMS ${dB(lapRow.rms).toFixed(1)} dBFS`);
  say(dB(holdRow.rms) < -18 && holdRow.rms > lapRow.rms && lapRow.rms > waitRow.rms, `the press is the loudest part and still low: RMS ${dB(holdRow.rms).toFixed(1)} dBFS, over ${dB(lapRow.rms).toFixed(1)} in the lap and ${dB(waitRow.rms).toFixed(1)} before`);
}
// same seed, same sound
{
  const a = build(48000), b = build(48000);
  a.port.onmessage({ data: { on: 1 } }); b.port.onmessage({ data: { on: 1 } });
  const A = new Float32Array(128), B = new Float32Array(128); let same = true;
  for (let k = 0; k < 400; k++) { a.process([], [[A, new Float32Array(128)]]); b.process([], [[B, new Float32Array(128)]]); for (let i = 0; i < 128; i++) if (A[i] !== B[i]) same = false; }
  say(same, 'two renders are the same, sample for sample (the noise is seeded)');
}
console.log('\nNo loop: the sound is made as it goes, so there is no seam to check. The check above is for a jump at every change of state instead.');
console.log(fail ? `\n${fail} FAIL` : '\nall PASS');
process.exit(fail ? 1 : 0);
