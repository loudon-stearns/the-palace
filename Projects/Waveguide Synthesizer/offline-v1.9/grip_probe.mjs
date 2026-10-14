// Runs study v1.9's audio engine headless in Node, bows the string, and reads
// back the bow's grip trace the page draws: how much of each cycle the hair
// grips, how many times it lets go, and the stick plateau's speed against the
// bow's. Sweeps each bow slider so every link on the chart is measured.
// usage: node grip_probe.mjs
import fs from 'node:fs'; import path from 'node:path';
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
export function summarize(t) {
  const N = t.grip.length; let grip = 0, lets = 0;
  // the hair holds where the friction's grip is full (>= 0.98), as the page draws it
  for (let i = 0; i < N; i++) { const s = t.grip[i] >= 0.98; if (s) grip++; if (!s && t.grip[(i + N - 1) % N] >= 0.98) lets++; }
  const v = Array.from(t.vel).sort((a, b) => a - b), pm = v[Math.floor(N / 2)];
  return { grips_pct: Math.round(100 * grip / N), lets_go_per_cycle: lets, median_speed_over_bow: +(pm / t.bowV).toFixed(2),
    min_vel_over_bow: +(Math.min(...t.vel) / t.bowV).toFixed(2), bowV: +t.bowV.toFixed(3), window: +(0.25 / t.slopeRef).toFixed(3) };
}
function bowAt(o) {
  const p = engine(); p.send({ type: 'params', freq: o.freq || 196 }); p.send({ type: 'view', mode: 'strobe' });
  p.send({ type: 'bow', on: true, speed: o.speed ?? 0.5, force: o.force ?? 0.7, position: o.position ?? 0.74 });
  p.run(1.2); const t = p.posts.filter(m => m.type === 'bowtrace').pop(); return { ...o, ...summarize(t), trace: t };
}
if (import.meta.url === `file://${process.argv[1]}`) {
const rows = [], keep = {};
for (const position of [0.6, 0.74, 0.85, 0.93]) rows.push(bowAt({ sweep: 'position', position }));
for (const speed of [0.1, 0.5, 1.0]) rows.push(bowAt({ sweep: 'speed', speed }));
for (const force of [0.15, 0.4, 0.7, 1.0]) rows.push(bowAt({ sweep: 'force', force }));
for (const freq of [82, 440, 659]) rows.push(bowAt({ sweep: 'pitch', freq }));
for (const r of rows) { keep[r.sweep + '-' + (r.position ?? r.speed ?? r.force ?? r.freq)] = { vel: Array.from(r.trace.vel), grip: Array.from(r.trace.grip) }; delete r.trace; }
console.table(rows);
fs.writeFileSync(path.join(HERE, 'grip-probe.json'), JSON.stringify({ rows, traces: keep }, null, 1));
}
