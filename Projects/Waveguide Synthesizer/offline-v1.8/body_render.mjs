// Runs study v1.8's own audio engine (the worklet source, lifted from the
// page) in Node, with no browser, and renders plucks with and without the
// body. Measures levels and ring time, writes WAVs for listening.
// usage: node body_render.mjs
import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const html = fs.readFileSync(path.join(HERE, '..', 'study-v1.8-the-body', 'index.html'), 'utf8');
const src = html.split('<script id="worklet-src" type="text/plain">')[1].split('</script>')[0];
const SR = 48000;
function engine() {
  let Proc; const posts = [];
  class Shim { constructor() { this.port = { onmessage: null, postMessage: (d) => posts.push(d) }; } }
  new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', src)(Shim, (_n, c) => { Proc = c; }, SR);
  const p = new Proc(); p.posts = posts;
  p.send = (d) => p.port.onmessage({ data: d });
  p.run = (sec) => { const n = Math.round(sec * SR / 128), out = new Float32Array(n * 128), blk = new Float32Array(128);
    for (let i = 0; i < n; i++) { p.process([], [[blk]]); out.set(blk, i * 128); } p.posts.length = 0; return out; };
  return p;
}
const db = (x) => 20 * Math.log10(x + 1e-12);
const peak = (a) => a.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
function ring(a) {                    // seconds until the 20 ms RMS falls 40 dB below its max
  const w = 960, rms = []; for (let i = 0; i + w <= a.length; i += w) { let s = 0; for (let j = 0; j < w; j++) s += a[i + j] ** 2; rms.push(Math.sqrt(s / w)); }
  const mx = Math.max(...rms); let k = rms.length - 1; while (k > 0 && rms[k] < mx * 0.01) k--; return +(k * w / SR).toFixed(2);
}
function pluck({ freq = 196, body = 0.5, bridge = 0.985, sec = 3 } = {}) {
  const p = engine(); p.send({ type: 'params', freq, bridge, body }); p.send({ type: 'view', mode: 'live' });
  p.send({ type: 'pluck', position: 0.3 }); return p.run(sec);
}
function bow({ freq = 196, body = 0.5, sec = 2.5 } = {}) {
  const p = engine(); p.send({ type: 'params', freq, body }); p.send({ type: 'bow', on: true }); const a = p.run(sec - 0.5);
  p.send({ type: 'bow', on: false }); const b = p.run(0.5); const o = new Float32Array(a.length + b.length); o.set(a); o.set(b, a.length); return o;
}
function wav(file, chunks) {
  const gap = new Float32Array(SR * 0.35); const parts = []; for (const c of chunks) { parts.push(c, gap); }
  const n = parts.reduce((s, c) => s + c.length, 0), buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  let o = 44; for (const c of parts) for (const v of c) { buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), o); o += 2; }
  fs.writeFileSync(path.join(HERE, file), buf);
}
const rows = [];
const tour = [];
for (const body of [0, 0.25, 0.5, 0.75, 1]) {
  const a = pluck({ body }); tour.push(a);
  rows.push({ what: 'pluck G3', body, bridge: 0.985, peak_dbfs: +db(peak(a)).toFixed(1), ring_s: ring(a) });
}
const sweep = [];
for (const bridge of [1.0, 0.995, 0.985, 0.96, 0.93, 0.9]) {
  const a = pluck({ body: 0.5, bridge }); sweep.push(a);
  rows.push({ what: 'pluck G3', body: 0.5, bridge, peak_dbfs: +db(peak(a)).toFixed(1), ring_s: ring(a) });
}
for (const freq of [82, 440, 880]) for (const body of [0, 0.5]) {
  const a = pluck({ freq, body }); rows.push({ what: 'pluck ' + freq + ' Hz', body, bridge: 0.985, peak_dbfs: +db(peak(a)).toFixed(1), ring_s: ring(a) });
}
const bows = [];
for (const body of [0, 0.5, 1]) { const a = bow({ body }); bows.push(a); rows.push({ what: 'bow G3', body, bridge: 0.985, peak_dbfs: +db(peak(a)).toFixed(1), ring_s: null }); }
console.table(rows);
wav('body-size-tour.wav', tour); wav('bridge-feeds-body.wav', sweep); wav('bowed-with-body.wav', bows);
fs.writeFileSync(path.join(HERE, 'body-levels.json'), JSON.stringify(rows, null, 1));
