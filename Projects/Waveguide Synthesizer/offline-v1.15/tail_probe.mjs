// Is the soundboard's tail too long? Runs study v1.14's own engine in Node,
// taps the string's pickup and the board apart, and measures each one's
// ring time after a pluck at several pitches. usage: node tail_probe.mjs [page-dir]
import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
const PAGE = process.argv[2] || 'study-v1.14-the-lesson-fits';
const html = fs.readFileSync(path.join(HERE, '..', PAGE, 'index.html'), 'utf8');
let src = html.split('<script id="worklet-src" type="text/plain">')[1].split('</script>')[0];
const HOOK = 'const h = this.hpY * (1 - 0.45 * bodyOn) + bodyOn * BODY_GAIN * bodyOut';
if (!src.includes(HOOK)) throw new Error('tap point not found');
src = src.replace(HOOK, 'if (this.tap) { this.tap.s.push(this.hpY * (1 - 0.45 * bodyOn)); this.tap.b.push(bodyOn * BODY_GAIN * bodyOut); }\n      ' + HOOK);
const SR = 48000;
function engine() {
  let Proc; const posts = [];
  class Shim { constructor() { this.port = { onmessage: null, postMessage: (d) => posts.push(d) }; } }
  new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', src)(Shim, (_n, c) => { Proc = c; }, SR);
  const p = new Proc(); p.posts = posts; p.send = (d) => p.port.onmessage({ data: d });
  p.run = (sec) => { const n = Math.round(sec * SR / 128), blk = new Float32Array(128); for (let i = 0; i < n; i++) p.process([], [[blk]]); };
  return p;
}
const W = 960;   // 20 ms windows
function rmsTrack(a) { const r = []; for (let i = 0; i + W <= a.length; i += W) { let s = 0; for (let j = 0; j < W; j++) s += a[i + j] ** 2; r.push(Math.sqrt(s / W)); } return r; }
// seconds until a track falls 40 dB below the louder track's peak (so both are timed against one floor)
function tail(r, ref) { let k = r.length - 1; while (k > 0 && r[k] < ref * 0.01) k--; return +(k * W / SR).toFixed(2); }
const db = (x) => +(20 * Math.log10(x + 1e-12)).toFixed(1);
const rows = [];
for (const freq of [98, 196, 392, 523, 784, 1047]) {
  const p = engine(); p.tap = { s: [], b: [] };
  p.send({ type: 'params', freq, body: 0.5, bridge: 0.985 }); p.send({ type: 'view', mode: 'live' });
  p.send({ type: 'pluck', position: 0.3 }); p.run(4);
  const S = rmsTrack(p.tap.s), B = rmsTrack(p.tap.b), ref = Math.max(...S, ...B);
  const at = (r, t) => db(r[Math.round(t * SR / W)] / ref);
  rows.push({ hz: freq, string_s: tail(S, ref), board_s: tail(B, ref),
    'string@0.5s': at(S, 0.5), 'board@0.5s': at(B, 0.5), 'string@1s': at(S, 1), 'board@1s': at(B, 1) });
}
console.table(rows);
fs.writeFileSync(path.join(HERE, 'tail-' + PAGE.split('-')[1] + '.json'), JSON.stringify(rows, null, 1));
