#!/usr/bin/env node
// title: Resonance and Damping — sketch — q-you-can-hear — check
// born: 2026-10-25
// links: [[Resonance and Damping]] (connects-to, checks-the-sketch)
// forward_vector: I re-check, headless, that the sketch's own worklet obeys the page's three rules
//   (peak width f/Q, ring time 2.2·Q/f, a quarter-cycle lag at f), so the piece is never trusted on looks.
//
// Usage: node "Resonance and Damping/Resonance and Damping — sketch — q-you-can-hear — check.mjs"

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, 'Resonance and Damping — sketch — q-you-can-hear.html'), 'utf8');
const src = html.match(/const WORKLET = `([\s\S]*?)`;/)[1];

const FS = 48000;
let Proc;
new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', src)(
  class { constructor() { this.port = {}; } }, (_, c) => { Proc = c; }, FS);

function make(f, Q, mode, df) {
  const p = new Proc();
  p.port.onmessage({ data: { f, Q, mode, df: df ?? f } });
  return p;
}
function run(p, n, sink) {
  const out = [new Float32Array(128), new Float32Array(128)], drv = [new Float32Array(128)];
  for (let k = 0; k < n; k += 128) { p.process([], [out, drv]); sink(out[0], drv[0]); }
}

// steady-state amplitude and lag of the swing behind a sine push at df
function drive(f, Q, df) {
  const p = make(f, Q, 'drive', df);
  const settle = Math.ceil(12 * 2.2 * Q / f * FS / 128) * 128 + 128 * 64;
  run(p, settle, () => {});
  let c = 0, s = 0, cd = 0, sd = 0, n = 0;
  const N = Math.round(Math.max(1, Math.round(0.5 * df)) * FS / df);
  run(p, Math.ceil(N / 128) * 128, (o, d) => {
    for (let i = 0; i < 128 && n < N; i++, n++) {
      const w = 2 * Math.PI * df * n / FS;
      c += o[i] * Math.cos(w); s += o[i] * Math.sin(w); cd += d[i] * Math.cos(w); sd += d[i] * Math.sin(w);
    }
  });
  const amp = Math.hypot(c, s) / Math.hypot(cd, sd);
  let lag = (Math.atan2(cd, sd) - Math.atan2(c, s)) * 180 / Math.PI;
  lag = ((lag % 360) + 360) % 360;
  return { amp, lag };
}

// time for one strike's ring to fall 60 dB, from its peak envelope
function ringT60(f, Q) {
  const p = make(f, Q, 'strike');
  p.port.onmessage({ data: { strike: true } });
  const env = []; const per = Math.round(FS / f);
  let buf = [];
  run(p, Math.ceil(3 * 2.2 * Q / f * FS / 128) * 128, (o) => { for (const v of o) buf.push(v); });
  for (let i = 0; i + per < buf.length; i += per) { let m = 0; for (let j = i; j < i + per; j++) m = Math.max(m, Math.abs(buf[j])); env.push(m); }
  const peak = Math.max(...env.slice(0, 3));
  const k = env.findIndex((m, i) => i > 2 && m < peak / 1000);
  return k * per / FS;
}

// measured half-power width: scan the push across the peak
function width(f, Q) {
  const pts = [];
  for (let u = -1; u <= 1; u += 1 / 200) { const df = f * Math.pow(2, u * 3 / Q + 0); pts.push([df, drive(f, Q, df).amp]); }
  const top = Math.max(...pts.map((p) => p[1]));
  const above = pts.filter((p) => p[1] >= top / Math.SQRT2);
  return above[above.length - 1][0] - above[0][0];
}

let fails = 0;
const check = (label, got, want, tol) => {
  const ok = Math.abs(got - want) <= tol * Math.abs(want);
  if (!ok) fails++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: ${got.toPrecision(4)} against ${want.toPrecision(4)} (±${(tol * 100).toFixed(0)}%)`);
};

for (const [f, Q] of [[220, 20], [440, 5], [1000, 50]]) {
  console.log(`\n== f ${f} Hz, Q ${Q} ==`);
  check('ring time to −60 dB, s', ringT60(f, Q), 2.2 * Q / f, 0.05);
  check('half-power width, Hz', width(f, Q), f / Q, 0.05);
  const at = drive(f, Q, f);
  // The mass on a spring lags exactly 90° at f for any Q. The digital two-pole matches it closely for a
  // narrow peak and drifts a few degrees for a broad one (87° at Q 5, measured): the page's
  // "exact for narrow peaks and close for broad ones". So the tolerance widens below Q 20.
  check('lag of the swing at f, degrees', at.lag, 90, Q >= 20 ? 0.01 : 0.04);
  check('peak height (sketch holds it near 1)', at.amp, 1, 0.1);
  const below = drive(f, Q, f / 4).lag, above = drive(f, Q, f * 4).lag;
  console.log(`      lag at f/4: ${below.toFixed(1)}°   at 4f: ${above.toFixed(1)}°   (with the push, then against it)`);
}
console.log(fails ? `\n${fails} FAILED` : '\nALL PASS');
process.exit(fails ? 1 : 0);
