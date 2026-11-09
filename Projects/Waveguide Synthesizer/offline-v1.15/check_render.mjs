// v1.14 against v1.15: tuning, pluck and bow levels at each pitch, and a
// before/after WAV: the same rising plucks, then the same bowed notes.
// usage: node check_render.mjs
import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const SR = 48000;
function load(dir) {
  const html = fs.readFileSync(path.join(HERE, '..', dir, 'index.html'), 'utf8');
  return html.split('<script id="worklet-src" type="text/plain">')[1].split('</script>')[0];
}
function engine(src) {
  let Proc; const posts = [];
  class Shim { constructor() { this.port = { onmessage: null, postMessage: (d) => posts.push(d) }; } }
  new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', src)(Shim, (_n, c) => { Proc = c; }, SR);
  const p = new Proc(); p.posts = posts; p.send = (d) => p.port.onmessage({ data: d });
  p.run = (sec) => { const n = Math.round(sec * SR / 128), out = new Float32Array(n * 128), blk = new Float32Array(128);
    for (let i = 0; i < n; i++) { p.process([], [[blk]]); out.set(blk, i * 128); } return out; };
  return p;
}
const db = (x) => +(20 * Math.log10(x + 1e-12)).toFixed(1);
const peak = (a) => a.reduce((m, v) => Math.max(m, Math.abs(v)), 0);
// pitch by autocorrelation over the steady middle, in cents from the target
function cents(a, f) {
  const s = a.subarray(Math.round(0.15 * SR), Math.round(0.45 * SR)), T = SR / f;
  let best = 0, bl = 0;
  for (let L = Math.floor(T * 0.94); L <= Math.ceil(T * 1.06); L++) { let c = 0; for (let i = 0; i + L < s.length; i++) c += s[i] * s[i + L]; if (c > best) { best = c; bl = L; } }
  // parabolic refine
  const ac = (L) => { let c = 0; for (let i = 0; i + L < s.length; i++) c += s[i] * s[i + L]; return c; };
  const y0 = ac(bl - 1), y1 = ac(bl), y2 = ac(bl + 1), d = 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2);
  return +(1200 * Math.log2(T / (bl + d))).toFixed(1);
}
const FREQS = [98, 196, 392, 523, 784, 1047];
const V = { 'v1.14': load('study-v1.14-the-lesson-fits'), 'v1.15': load('study-v1.15-even-loss') };
const rows = [], audio = {};
for (const [name, src] of Object.entries(V)) {
  audio[name] = [];
  for (const freq of FREQS) {
    let p = engine(src); p.send({ type: 'params', freq }); p.send({ type: 'view', mode: 'live' });
    p.send({ type: 'pluck', position: 0.3 }); const pl = p.run(1.2); audio[name].push(pl);
    p = engine(src); p.send({ type: 'params', freq }); p.send({ type: 'view', mode: 'live' }); p.send({ type: 'bow', on: true });
    const bw = p.run(1.6); p.send({ type: 'bow', on: false }); const bt = p.run(0.6);
    const b = new Float32Array(bw.length + bt.length); b.set(bw); b.set(bt, bw.length); audio[name].push(b);
    rows.push({ v: name, hz: freq, pluck_cents: cents(pl, freq), pluck_peak: db(peak(pl)), bow_cents: cents(bw.subarray(Math.round(0.6 * SR)), freq), bow_peak: db(peak(bw)),
      bow_tail_peak_after_lift: db(peak(bt.subarray(Math.round(0.3 * SR)))) });
  }
}
console.table(rows);
fs.writeFileSync(path.join(HERE, 'check.json'), JSON.stringify(rows, null, 1));
function wav(file, parts) {
  const gap = new Float32Array(Math.round(SR * 0.25)), seq = []; for (const c of parts) seq.push(c, gap);
  const n = seq.reduce((s, c) => s + c.length, 0), buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
  buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  let o = 44; for (const c of seq) for (const v of c) { buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), o); o += 2; }
  fs.writeFileSync(path.join(HERE, file), buf);
}
// plucks rising, v1.14 then v1.15; then the bowed notes the same way
const pl = (k) => audio[k].filter((_, i) => i % 2 === 0), bo = (k) => audio[k].filter((_, i) => i % 2 === 1);
wav('even-loss-plucks-before-after.wav', [...pl('v1.14'), new Float32Array(SR * 0.6), ...pl('v1.15')]);
wav('even-loss-bow-before-after.wav', [...bo('v1.14'), new Float32Array(SR * 0.6), ...bo('v1.15')]);
