// Runs study v1.10's own engine headless in Node: plucks each note at each
// stiffness, keeps what the ladder was told (where each overtone sits, how
// sharp) and the audio, so measure_ladder.py can check the ladder against
// the sound. Also renders the stiffness tour.  usage: node ladder_probe.mjs
import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const html = fs.readFileSync(path.join(HERE, '..', 'study-v1.10-the-overtones-run-sharp', 'index.html'), 'utf8');
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
function pluckAt(freq, stiff, sec, body = 0) {
  const p = engine(); p.send({ type: 'params', freq, stiff, body }); p.send({ type: 'view', mode: 'strobe' });
  p.send({ type: 'pluck', position: 0.3, mode: 'pluck' });
  const a = p.run(sec);
  const lad = p.posts.filter(m => m.type === 'ladder').pop();
  const lev = p.posts.filter(m => m.type === 'ladderLevel');
  return { a, lad, lev };
}
const rows = [];
fs.mkdirSync(path.join(HERE, "raw"), { recursive: true });   // scratch for measure_ladder.py; not kept
for (const freq of [131, 196, 392, 523]) for (const stiff of [0, 0.4, 0.7, 1.0]) {
  const { a, lad, lev } = pluckAt(freq, stiff, 1.2);
  const key = `f${freq}_s${stiff}`;
  fs.writeFileSync(path.join(HERE, 'raw', key + '.f32'), Buffer.from(a.buffer));
  rows.push({ key, freq, stiff, freqs: lad.freqs, cents: lad.cents, levels_first: Array.from(lev[1]?.db || []), levels_late: Array.from(lev[lev.length - 1].db) });
}
fs.writeFileSync(path.join(HERE, 'ladder-probe.json'), JSON.stringify(rows, null, 1));
// the tour: G3 at four stiffnesses, then the same stiffness (0.7) up two octaves, body on
const parts = [], tour = [];
const gap = () => parts.push(new Float32Array(SR * 0.25));
let t = 0;
for (const s of [0, 0.4, 0.7, 1.0]) { const { a } = pluckAt(196, s, 2.0, 0.5); tour.push({ at_s: +t.toFixed(2), what: `G3, stiffness ${s}` }); parts.push(a); gap(); t += 2.25; }
for (const [f, nm] of [[131, 'C3'], [196, 'G3'], [262, 'C4'], [392, 'G4'], [523, 'C5']]) { const { a } = pluckAt(f, 0.7, 1.3, 0.5); tour.push({ at_s: +t.toFixed(2), what: `${nm}, stiffness 0.7` }); parts.push(a); gap(); t += 1.55; }
const n = parts.reduce((s, c) => s + c.length, 0), buf = Buffer.alloc(44 + n * 2);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28);
buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
let off = 44, pk = 0; for (const c of parts) for (const v of c) { pk = Math.max(pk, Math.abs(v)); buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), off); off += 2; }
fs.writeFileSync(path.join(HERE, 'stiffness-tour.wav'), buf);
fs.writeFileSync(path.join(HERE, 'stiffness-tour.json'), JSON.stringify({ peak_dbfs: +(20 * Math.log10(pk)).toFixed(1), sections: tour }, null, 1));
console.log('ok', rows.length, 'probes; tour peak', (20 * Math.log10(pk)).toFixed(1), 'dBFS');
