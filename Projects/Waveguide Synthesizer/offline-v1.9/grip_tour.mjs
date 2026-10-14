// Renders the five bow settings photographed by stills.mjs, 2.5 s each, with
// study v1.9's own engine headless in Node: default, light force, heavy force,
// near the bridge, fast. Each line of grip-tour.json says what the chart
// would say for it, so the sound and the picture can be checked together.
// usage: node grip_tour.mjs
import fs from 'node:fs'; import path from 'node:path';
import { summarize } from './grip_probe.mjs';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const html = fs.readFileSync(path.join(HERE, '..', 'study-v1.9-the-bow-grips', 'index.html'), 'utf8');
const src = html.split('<script id="worklet-src" type="text/plain">')[1].split('</script>')[0];
const SR = 48000;
function engine() {
  let Proc; const posts = [];
  class Shim { constructor() { this.port = { onmessage: null, postMessage: (d) => posts.push(d) }; } }
  new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', src)(Shim, (_n, c) => { Proc = c; }, SR);
  const p = new Proc(); p.posts = posts; p.send = (d) => p.port.onmessage({ data: d });
  p.run = (sec) => { const n = Math.round(sec * SR / 128), out = new Float32Array(n * 128), blk = new Float32Array(128);
    for (let i = 0; i < n; i++) { p.process([], [[blk]]); out.set(blk, i * 128); } return out; };
  return p;
}
const SET = [['default', {}], ['light force', { force: 0.2 }], ['heavy force', { force: 1.0 }], ['near the bridge', { position: 0.93 }], ['fast', { speed: 1.0 }]];
const parts = [], rows = [];
for (const [name, o] of SET) {
  const p = engine(); p.send({ type: 'params', freq: 196 }); p.send({ type: 'view', mode: 'strobe' });
  p.send({ type: 'bow', on: true, speed: 0.5, force: 0.7, position: 0.74, ...o });
  const a = p.run(2.1); const t = p.posts.filter(m => m.type === 'bowtrace').pop();
  p.send({ type: 'bow', on: false }); const b = p.run(0.4);
  const c = new Float32Array(a.length + b.length); c.set(a); c.set(b, a.length); parts.push(c, new Float32Array(SR * 0.3));
  const pk = c.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
  rows.push({ name, ...o, ...summarize(t), peak_dbfs: +(20 * Math.log10(pk + 1e-12)).toFixed(1) });
}
console.table(rows);
const n = parts.reduce((s, c) => s + c.length, 0), buf = Buffer.alloc(44 + n * 2);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
let off = 44; for (const c of parts) for (const v of c) { buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), off); off += 2; }
fs.writeFileSync(path.join(HERE, 'grip-tour.wav'), buf);
fs.writeFileSync(path.join(HERE, 'grip-tour.json'), JSON.stringify(rows, null, 1));
