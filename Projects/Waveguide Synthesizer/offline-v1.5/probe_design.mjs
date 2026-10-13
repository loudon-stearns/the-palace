// Runs v1.5's worklet headless just far enough to read what retune() designs
// for each pitch and stiffness: sections, coefficient, worst partial miss.
import fs from 'node:fs';
const html = fs.readFileSync(process.argv[2], 'utf8');
const src = html.match(/<script id="worklet-src" type="text\/plain">([\s\S]*?)<\/script>/)[1];
let Proc; const posts = [];
class AWP { constructor() { this.port = { onmessage: null, postMessage: (d) => d.type === 'disp' && posts.push(d) }; } }
new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', src)(AWP, (_n, c) => { Proc = c; }, 48000);
const node = new Proc();
const rows = [];
for (const stiff of JSON.parse(process.argv[3])) for (const freq of JSON.parse(process.argv[4])) {
  const t = performance.now();
  node.port.onmessage({ data: { type: 'params', freq, stiff } });
  const d = posts[posts.length - 1];
  rows.push({ stiff, freq, nap: d.nap, c: +d.c.toFixed(4), worst: +d.worst.toFixed(2), N: d.N, ms: +(performance.now() - t).toFixed(2) });
}
console.log(JSON.stringify(rows));
