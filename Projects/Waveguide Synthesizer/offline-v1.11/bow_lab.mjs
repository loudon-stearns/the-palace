// Bow lab: loads study v1.10's engine headless, swaps in a candidate bow
// (force-limited friction, the hair's push shared between the two waves),
// and measures what the grip chart and the ear would get.
import fs from 'node:fs'; import path from 'node:path';
const HERE = path.dirname(decodeURIComponent(new URL(import.meta.url).pathname));
export const SR = 48000;
export function loadSrc(file) {
  const html = fs.readFileSync(file, 'utf8');
  return html.split('<script id="worklet-src" type="text/plain">')[1].split('</script>')[0];
}
export function engine(src) {
  let Proc; const posts = [];
  class Shim { constructor() { this.port = { onmessage: null, postMessage: (d) => posts.push(d) }; } }
  new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', src)(Shim, (_n, c) => { Proc = c; }, SR);
  const p = new Proc(); p.posts = posts; p.send = (d) => p.port.onmessage({ data: d });
  p.run = (sec) => { const n = Math.round(sec * SR / 128), out = new Float32Array(n * 128), blk = new Float32Array(128);
    for (let i = 0; i < n; i++) { p.process([], [[blk]]); out.set(blk, i * 128); } return out; };
  return p;
}
// cycle-level analysis from the grip trace + audio
export function summarize(t) {
  const N = t.grip.length; let hold = 0, lets = 0, plat = [];
  for (let i = 0; i < N; i++) { const s = t.grip[i] >= 0.98; if (s) { hold++; plat.push(t.vel[i]); } if (!s && t.grip[(i + N - 1) % N] >= 0.98) lets++; }
  plat.sort((a, b) => a - b);
  const pm = plat.length ? plat[Math.floor(plat.length / 2)] : NaN;
  return { hold_pct: Math.round(100 * hold / N), lets, plateau_over_bow: +(pm / t.bowV).toFixed(3) };
}
// how alike consecutive periods of the sound are (1 = perfectly periodic)
export function periodicity(x, f) {
  const P = SR / f, start = Math.floor(x.length * 0.5), n = Math.floor(P * 4);
  let best = -1;
  for (let lag = Math.floor(P * 0.9); lag <= Math.ceil(P * 1.15); lag++) {
    let a = 0, b = 0, c = 0;
    for (let i = 0; i < n; i++) { const u = x[start + i], v = x[start + i + lag]; a += u * v; b += u * u; c += v * v; }
    const r = a / Math.sqrt(b * c + 1e-20); if (r > best) best = r;
  }
  return +best.toFixed(3);
}
export const rms = (x) => { let s = 0, k = Math.floor(x.length / 2); for (let i = k; i < x.length; i++) s += x[i] * x[i]; return 20 * Math.log10(Math.sqrt(s / (x.length - k)) + 1e-12); };
