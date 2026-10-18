// Cycle 16: is the jitter below the lock in the even crowd's trace the meter or the crowd?
// The 10 ms meter reads core synchrony at one instant. Here I read it at EVERY sample,
// at fixed tightness, and compare three readings of the same run:
//   per-sample r(t) · the 10 ms snapshot the meter shows · a 10 ms window average.
// If snapshots jitter but window averages don't, the meter is aliasing a fast wobble.
// If both jitter, the crowd itself is breathing. The spectrum of r(t) says which, and how fast.
//   node probe_meter_noise.js  → meter-noise.json, surge-before-lock.wav
const fs = require("fs");
const { Crowd } = require("./crowd_engine.js");
const fract = (x) => x - Math.floor(x);
const A1 = 0.8191725133961645, A2 = 0.6710436067037893, A3 = 0.5497004779019703;
function mulberry(seed) { let s = seed >>> 0; return () => { let t = (s += 0x6D2B79F5); t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
class LumpyCrowd extends Crowd {              // same as render_lumpiness.js
  configure(N, p, L, seed) { this.lump = L; this.lseed = seed; this.setN(N); this.setP(p); }
  setN(n) { super.setN(n); if (this.lump === undefined) return;
    const r = mulberry(this.lseed * 7919 + n);
    for (let i = 0; i < n; i++) {
      this.jit[i] = 2 * fract(0.5 + i * A1 + this.lump * (r() - 0.5)) - 1;
      this.th[i] = 2 * Math.PI * fract(0.5 + i * A3 + this.lump * (r() - 0.5));
      this.c[i] = Math.cos(this.th[i]); this.sn[i] = Math.sin(this.th[i]);
    }
    const pu = Array.from({ length: n }, (_, i) => fract(0.5 + i * A2));
    this.order = [...Array(n).keys()].sort((a, b) => pu[a] - pu[b]); this.setP(this.p);
  }
}
const sr = 24000, N = 512, LIVES = [0, 0.2, 0.5], SECS = 6, SKIP = 2;
function rcore(c) { let x = 0, y = 0, n = 0;
  for (let i = 0; i < c.N; i++) if (c.listen[i]) { x += c.c[i]; y += c.sn[i]; n++; } return Math.hypot(x, y) / n; }
function sd(a) { const m = a.reduce((s, x) => s + x, 0) / a.length; return Math.sqrt(a.reduce((s, x) => s + (x - m) ** 2, 0) / a.length); }
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
// spectrum of r(t) by a plain DFT on a 1 kHz decimated copy (window-averaged, so no aliasing), 0.25–200 Hz
function spectrum(r1k) { const m = mean(r1k), n = r1k.length, out = [];
  for (let f = 0.25; f <= 200; f += 0.25) { let re = 0, im = 0;
    for (let k = 0; k < n; k++) { const w = 0.5 - 0.5 * Math.cos((2 * Math.PI * k) / (n - 1)), a = (2 * Math.PI * f * k) / 1000;
      re += (r1k[k] - m) * w * Math.cos(a); im -= (r1k[k] - m) * w * Math.sin(a); }
    out.push([f, Math.hypot(re, im) / n]); } return out; }
const rows = [], series = [];
for (const P of LIVES) for (const L of [0, 1]) for (const f of [0.85, 0.9, 0.95]) {
  const c = new LumpyCrowd(sr); c.p = P; c.configure(N, P, L, 3); c.T = f / (1 - P);
  const b = new Float32Array(1), per = [];
  for (let k = 0; k < sr * SECS; k++) { c.process(b, 1); if (k >= sr * SKIP) per.push(rcore(c)); }
  const W = sr / 100, snap = [], win = [], r1k = [];
  for (let k = 0; k + W <= per.length; k += W) { snap.push(per[k]); win.push(mean(per.slice(k, k + W))); }
  for (let k = 0; k + 24 <= per.length; k += 24) r1k.push(mean(per.slice(k, k + 24)));
  const spec = spectrum(r1k); const peak = spec.reduce((a, x) => (x[1] > a[1] ? x : a));
  // share of r(t)'s wobble above 50 Hz — what a 10 ms snapshot cannot follow and folds back as noise
  const tot = spec.reduce((s, x) => s + x[1] ** 2, 0), hi = spec.filter((x) => x[0] > 50).reduce((s, x) => s + x[1] ** 2, 0);
  const row = { p: P, L, f, mean_r: +mean(per).toFixed(3), sd_per_sample: +sd(per).toFixed(3), sd_snapshot_10ms: +sd(snap).toFixed(3),
    sd_window_10ms: +sd(win).toFixed(3), peak_hz: peak[0], above_50hz_share: +(hi / tot).toFixed(3),
    incoherent_floor: +Math.sqrt(Math.PI / (4 * N * (1 - P))).toFixed(3) };
  rows.push(row); console.log(JSON.stringify(row));
  series.push({ p: P, L, f, r_1k_first2s: r1k.slice(0, 2000).map((x) => +x.toFixed(3)), spectrum: spec.filter((_, i) => i % 2 === 0).map(([a, b]) => [a, +b.toExponential(2)]) });
}
fs.writeFileSync("meter-noise.json", JSON.stringify({ N, sr, rows, series }));
// audition: the even crowd held just under the lock (0.9× of its edge), 6 s with no pacemakers,
// then 6 s with half pacemakers. Same pitch; level riding on, as in the instrument.
const parts = [], gap = new Float32Array(Math.round(sr * 0.6));
for (const P of [0, 0.5]) {
  const c = new LumpyCrowd(sr); c.p = P; c.configure(N, P, 0, 3); c.T = 0.9 / (1 - P); c.level = true;
  const pre = new Float32Array(sr * 2); c.process(pre, pre.length);           // let it settle first
  const buf = new Float32Array(sr * 6); for (let k = 0; k < buf.length; k += 240) c.process(buf.subarray(k, k + 240), 240);
  const fade = Math.round(sr * 0.02); for (let i = 0; i < fade; i++) { buf[i] *= i / fade; buf[buf.length - 1 - i] *= i / fade; }
  parts.push(buf, gap);
}
const len = parts.reduce((a, x) => a + x.length, 0), pcm = Buffer.alloc(44 + len * 2); let o = 44;
for (const x of parts) for (const v of x) { pcm.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), o); o += 2; }
pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + len * 2, 4); pcm.write("WAVEfmt ", 8); pcm.writeUInt32LE(16, 16);
pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(sr, 24); pcm.writeUInt32LE(sr * 2, 28);
pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write("data", 36); pcm.writeUInt32LE(len * 2, 40);
fs.writeFileSync("surge-before-lock.wav", pcm); console.log("wrote surge-before-lock.wav", (len / sr).toFixed(1), "s");
