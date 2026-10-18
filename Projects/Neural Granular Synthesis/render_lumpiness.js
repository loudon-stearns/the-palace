// Cycle 15: the lumpiness knob. Cycle 14 found the soft lock comes from a
// lumpy crowd (random rates and phases), not from life. So make lumpiness a
// knob of its own and check it does one job: set how hard the lock hits
// without moving where it sits.
//   lumpiness L ∈ [0,1]: each neuron's place in the rate spread, and its
//   starting phase, is the even (golden-ratio) place nudged by L·(noise − ½),
//   wrapped back into [0,1). The wrap keeps the crowd's overall spread
//   uniform at every L — only the evenness of the sampling changes — so
//   theory's edge 1/(1 − life) should not move. L = 0 is cycle 14's even
//   crowd; L = 1 is as random as the board's crowd.
//   node render_lumpiness.js   → lumpiness.json, lumpiness-attack.wav
const fs = require("fs");
const { Crowd } = require("./crowd_engine.js");
const fract = (x) => x - Math.floor(x);
const A1 = 0.8191725133961645, A2 = 0.6710436067037893, A3 = 0.5497004779019703;
function mulberry(seed) { let s = seed >>> 0; return () => { let t = (s += 0x6D2B79F5); t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
class LumpyCrowd extends Crowd {
  configure(N, p, L, seed) {
    this.lump = L; this.lseed = seed; this.setN(N); this.setP(p);
  }
  setN(n) { super.setN(n); if (this.lump === undefined) return;
    const r = mulberry(this.lseed * 7919 + n), m = Math.round(this.p * n);
    for (let i = 0; i < n; i++) {
      this.jit[i] = 2 * fract(0.5 + i * A1 + this.lump * (r() - 0.5)) - 1;
      this.th[i] = 2 * Math.PI * fract(0.5 + i * A3 + this.lump * (r() - 0.5));
      this.c[i] = Math.cos(this.th[i]); this.sn[i] = Math.sin(this.th[i]);
    }
    const pu = Array.from({ length: n }, (_, i) => fract(0.5 + i * A2));   // fixed headcount, lowest role numbers
    this.order = [...Array(n).keys()].sort((a, b) => pu[a] - pu[b]); this.setP(this.p);
  }
}
const sr = 24000, N = 512, LUMPS = [0, 0.25, 0.5, 1], LIVES = [0, 0.5], SEEDS = [3, 5, 9];
const fractions = [0.8, 0.85, 0.9, 0.95, 0.975, 1.0, 1.025, 1.05, 1.1, 1.2];
function settle(L, p, f, seed) {
  const c = new LumpyCrowd(sr); c.p = p; c.configure(N, p, L, seed); c.T = f / (1 - p);
  const b = new Float32Array(480); let a = 0, n = 0;
  for (let k = 0; k < (sr * 4) / 480; k++) { c.process(b, 480); if (k > (sr * 2) / 480) { a += c.rCore; n++; } }
  return a / n;
}
// edge width: tightness span over which core synchrony climbs from 0.3 to 0.7
function cross(fr, r, y) { for (let i = 1; i < r.length; i++) if (r[i - 1] < y && r[i] >= y)
  return fr[i - 1] + ((y - r[i - 1]) / (r[i] - r[i - 1])) * (fr[i] - fr[i - 1]); return null; }
const out = { N, fractions, rows: [] };
for (const p of LIVES) for (const L of LUMPS) {
  const per = SEEDS.map((s) => fractions.map((f) => settle(L, p, f, s)));
  const r = fractions.map((_, j) => per.reduce((a, x) => a + x[j], 0) / per.length);
  const sd = fractions.map((_, j) => Math.sqrt(per.reduce((a, x) => a + (x[j] - r[j]) ** 2, 0) / per.length));
  const lo = cross(fractions, r, 0.3), hi = cross(fractions, r, 0.7), mid = cross(fractions, r, 0.5);
  const row = { p, L, r: r.map((x) => +x.toFixed(3)), seed_sd: sd.map((x) => +x.toFixed(3)),
    half_lock: mid && +mid.toFixed(3), width_30_70: lo && hi ? +(hi - lo).toFixed(3) : null };
  out.rows.push(row); console.log(`life ${p} lump ${L}`, row.r.join(" "), "| half", row.half_lock, "| width", row.width_30_70);
}
fs.writeFileSync("lumpiness.json", JSON.stringify(out, null, 1));
// audition: life 50 %, tightness ramps 0.8× → 1.15× of the edge over 7 s, held 2 s,
// once with an even crowd (L 0), once half lumpy, once fully lumpy. Same pitch, same level.
const parts = [], gap = new Float32Array(Math.round(sr * 0.6)), trace = [];
for (const L of [0, 0.5, 1]) {
  const c = new LumpyCrowd(sr); c.p = 0.5; c.configure(N, 0.5, L, 3); c.level = true;
  const total = sr * 9, buf = new Float32Array(total), b = new Float32Array(240), tr = [];
  for (let k = 0; k < total; k += 240) {
    const t = k / sr, f = t < 7 ? 0.8 + (0.35 * t) / 7 : 1.15; c.T = f / (1 - 0.5);
    c.process(b, 240); buf.set(b, k); if (k % 2400 === 0) tr.push([+t.toFixed(2), +f.toFixed(4), +c.rCore.toFixed(3)]);
  }
  const fade = Math.round(sr * 0.02); for (let i = 0; i < fade; i++) { buf[i] *= i / fade; buf[total - 1 - i] *= i / fade; }
  parts.push(buf, gap); trace.push({ L, trace: tr });
}
fs.writeFileSync("lumpiness-trace.json", JSON.stringify(trace));
const len = parts.reduce((a, x) => a + x.length, 0), pcm = Buffer.alloc(44 + len * 2); let o = 44;
for (const x of parts) for (const v of x) { pcm.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(v * 32767))), o); o += 2; }
pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + len * 2, 4); pcm.write("WAVEfmt ", 8); pcm.writeUInt32LE(16, 16);
pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(1, 22); pcm.writeUInt32LE(sr, 24); pcm.writeUInt32LE(sr * 2, 28);
pcm.writeUInt16LE(2, 32); pcm.writeUInt16LE(16, 34); pcm.write("data", 36); pcm.writeUInt32LE(len * 2, 40);
fs.writeFileSync("lumpiness-attack.wav", pcm); console.log("wrote lumpiness-attack.wav", (len / sr).toFixed(1), "s");
