// Murmuration — headless twin of Murmuration.html.
//
// The flock (stepFlock / polarization), the boid→grain mapping (pushFlock) and the
// grain voice (the AudioWorklet's process loop) are copied from the page line for line.
// Two deliberate differences, both for repeatability:
//   1. the worklet's Math.random() (grain re-phase "shimmer", initial phases) is a
//      seeded mulberry32 stream separate from the flock's, so the flock's random
//      sequence stays exactly the page's;
//   2. no DynamicsCompressor — renders are level-matched offline instead.
//
// It also holds the AUTHORED cloud: the same 60 grain voices, the same mapping, the
// same per-frame centre and spread as the flock — but each voice wanders on its own
// (independent smooth random jitter) instead of steering by its neighbours. It is the
// hard version of the wager's control: everything a hand-dialed granular synth could
// copy from the flock is copied; only the social coordination is taken away.
"use strict";

const SEED = 7;
const WIDTH = 920, HEIGHT = 520;
const NEIGHBOR_R = 56, NEIGHBOR_R2 = NEIGHBOR_R * NEIGHBOR_R;
const MAX_SPEED = 3, MAX_FORCE = 0.05;
const FPS = 60;
const L = 2048, LMASK = L - 1;

function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

function torDelta(ax, ay, bx, by) { let dx = bx - ax, dy = by - ay; if (dx > WIDTH * 0.5) dx -= WIDTH; else if (dx < -WIDTH * 0.5) dx += WIDTH; if (dy > HEIGHT * 0.5) dy -= HEIGHT; else if (dy < -HEIGHT * 0.5) dy += HEIGHT; return [dx, dy]; }
function setMag(x, y, m) { const n = Math.hypot(x, y); return n > 0 ? [x / n * m, y / n * m] : [0, 0]; }
function limit(x, y, mx) { const n = Math.hypot(x, y); return (n > mx && n > 0) ? [x / n * mx, y / n * mx] : [x, y]; }

class Flock {
  constructor(n, seed = SEED) {
    this.rng = mulberry32(seed);
    this.field = { attract: null, predator: null, predT: 0 };
    const b = [];
    for (let i = 0; i < n; i++) {
      const x = this.rng() * WIDTH, y = this.rng() * HEIGHT, a = this.rng() * Math.PI * 2, sp = 0.5 * MAX_SPEED + this.rng() * 0.5 * MAX_SPEED;
      b.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, nb: 0 });
    }
    this.boids = b;
  }
  step(w) {                                   // = stepFlock() in Murmuration.html
    const boids = this.boids, field = this.field, rng = this.rng, N = boids.length;
    const nvx = new Float64Array(N), nvy = new Float64Array(N), nbN = new Int32Array(N);
    for (let i = 0; i < N; i++) {
      const b = boids[i];
      let sepX = 0, sepY = 0, sepN = 0, aliX = 0, aliY = 0, aliN = 0, cohX = 0, cohY = 0, cohN = 0;
      for (let j = 0; j < N; j++) {
        if (i === j) continue;
        const o = boids[j];
        const [dx, dy] = torDelta(b.x, b.y, o.x, o.y);
        const d2 = dx * dx + dy * dy;
        if (d2 > 0 && d2 < NEIGHBOR_R2) { sepX -= dx / d2; sepY -= dy / d2; sepN++; aliX += o.vx; aliY += o.vy; aliN++; cohX += dx; cohY += dy; cohN++; }
      }
      let fx = 0, fy = 0;
      if (sepN > 0) { const [dx, dy] = setMag(sepX, sepY, MAX_SPEED); const [sx, sy] = limit(dx - b.vx, dy - b.vy, MAX_FORCE); fx += w.sep * sx; fy += w.sep * sy; }
      if (aliN > 0) { const [dx, dy] = setMag(aliX / aliN, aliY / aliN, MAX_SPEED); const [sx, sy] = limit(dx - b.vx, dy - b.vy, MAX_FORCE); fx += w.ali * sx; fy += w.ali * sy; }
      if (cohN > 0) { const [dx, dy] = setMag(cohX / cohN, cohY / cohN, MAX_SPEED); const [sx, sy] = limit(dx - b.vx, dy - b.vy, MAX_FORCE); fx += w.coh * sx; fy += w.coh * sy; }
      if (field.attract) { const [dx, dy] = torDelta(b.x, b.y, field.attract.x, field.attract.y); const [sx, sy] = limit(...setMag(dx, dy, MAX_SPEED), MAX_FORCE * 1.4); fx += 0.9 * sx; fy += 0.9 * sy; }
      if (field.predator && field.predT > 0) { const [dx, dy] = torDelta(field.predator.x, field.predator.y, b.x, b.y); const d = Math.hypot(dx, dy) + 1e-6; if (d < 200) { const g = field.predT * (1 - d / 200); const [sx, sy] = setMag(dx, dy, MAX_SPEED); fx += 4.0 * g * sx; fy += 4.0 * g * sy; } }
      let vx = b.vx + fx, vy = b.vy + fy;
      if (w.eta > 0) { const ang = (rng() * 2 - 1) * w.eta * Math.PI; const c = Math.cos(ang), s = Math.sin(ang); const rx = vx * c - vy * s, ry = vx * s + vy * c; vx = rx; vy = ry; }
      [vx, vy] = limit(vx, vy, MAX_SPEED);
      nvx[i] = vx; nvy[i] = vy; nbN[i] = cohN;
    }
    for (let i = 0; i < N; i++) { const b = boids[i]; b.vx = nvx[i]; b.vy = nvy[i]; b.nb = nbN[i]; b.x = (b.x + b.vx + WIDTH) % WIDTH; b.y = (b.y + b.vy + HEIGHT) % HEIGHT; }
    if (field.predT > 0) field.predT -= 0.045;
  }
  polarization() { let sx = 0, sy = 0; for (const b of this.boids) { const m = Math.hypot(b.vx, b.vy); if (m > 0) { sx += b.vx / m; sy += b.vy / m; } } return Math.hypot(sx, sy) / this.boids.length; }
}

// Circular mean of x/y on the torus + covariance of the wrapped deviations from it,
// plus the speed and radial-velocity statistics the mapping reads.
function cloudStats(boids) {
  let cx = 0, sx = 0, cy = 0, sy = 0;
  for (const b of boids) { const ax = b.x / WIDTH * 2 * Math.PI, ay = b.y / HEIGHT * 2 * Math.PI; cx += Math.cos(ax); sx += Math.sin(ax); cy += Math.cos(ay); sy += Math.sin(ay); }
  const mx = ((Math.atan2(sx, cx) / (2 * Math.PI)) + 1) % 1 * WIDTH, my = ((Math.atan2(sy, cy) / (2 * Math.PI)) + 1) % 1 * HEIGHT;
  const N = boids.length; let vxx = 0, vyy = 0, vxy = 0, spd = 0, spd2 = 0;
  for (const b of boids) { const [dx, dy] = torDelta(mx, my, b.x, b.y); vxx += dx * dx; vyy += dy * dy; vxy += dx * dy; const s = Math.hypot(b.vx, b.vy); spd += s; spd2 += s * s; }
  vxx /= N; vyy /= N; vxy /= N; spd /= N; spd2 = Math.max(0, spd2 / N - spd * spd);
  let hx = 0, hy = 0; for (const b of boids) { const m = Math.hypot(b.vx, b.vy); if (m > 0) { hx += b.vx / m; hy += b.vy / m; } }
  const phi = Math.min(0.999999, Math.hypot(hx, hy) / N), hMean = Math.atan2(hy, hx), hSig = Math.min(Math.sqrt(-2 * Math.log(Math.max(phi, 1e-6))), 4 * Math.PI);
  return { mx, my, vxx, vyy, vxy, spd, spdSd: Math.sqrt(spd2), phi, hMean, hSig };
}

// The authored cloud: N voices, each an independent Ornstein–Uhlenbeck wanderer in a
// standardised space, mapped onto the flock's own centre and covariance every frame.
// tauSec is the one hand-dialed knob (how smooth each grain's jitter is).
class AuthoredCloud {
  constructor(n, seed = SEED + 101, tauSec = 0.6) {
    this.rng = mulberry32(seed); this.n = n; this.a = Math.exp(-1 / (tauSec * FPS)); this.k = Math.sqrt(1 - this.a * this.a);
    this.z = []; for (let i = 0; i < n; i++) this.z.push([this.gauss(), this.gauss(), this.gauss(), this.gauss(), this.gauss()]);
    this.boids = []; this.prev = null;
  }
  gauss() { let u = 0; while (u === 0) u = this.rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * this.rng()); }
  step(st) {
    const { mx, my, vxx, vyy, vxy } = st;
    const l11 = Math.sqrt(Math.max(vxx, 1e-9)), l21 = vxy / l11, l22 = Math.sqrt(Math.max(vyy - l21 * l21, 1e-9));
    const out = [];
    for (let i = 0; i < this.n; i++) {
      const z = this.z[i]; for (let d = 0; d < 5; d++) z[d] = this.a * z[d] + this.k * this.gauss();
      const x = ((mx + l11 * z[0]) % WIDTH + WIDTH) % WIDTH, y = ((my + l21 * z[0] + l22 * z[1]) % HEIGHT + HEIGHT) % HEIGHT;
      // speed: same mean and spread as the flock's, each voice jittering on its own;
      // heading: its own random walk around the flock's mean heading, with the wrapped-normal
      // width that gives the same polarization φ (R = e^(−σ²/2)) — same agreement, no neighbours.
      const sp = Math.max(0, Math.min(MAX_SPEED, st.spd + st.spdSd * z[2])), hd = st.hMean + st.hSig * z[3];
      out.push({ x, y, vx: Math.cos(hd) * sp, vy: Math.sin(hd) * sp, nb: 0 });
    }
    for (let i = 0; i < this.n; i++) { let c = 0; const b = out[i]; for (let j = 0; j < this.n; j++) { if (i === j) continue; const [dx, dy] = torDelta(b.x, b.y, out[j].x, out[j].y); const d2 = dx * dx + dy * dy; if (d2 > 0 && d2 < NEIGHBOR_R2) c++; } b.nb = c; }
    this.boids = out;
  }
  // Grain length is copied the same way: each voice jitters on its own around the flock's
  // mean and spread of grain rate this frame, so the two clouds click and sing in the same
  // proportion and only *which* grain does which, and when, differs.
  matchGrainRate(mappedA, mappedF) {
    const n = this.n; let m = 0, m2 = 0; for (let i = 0; i < n; i++) { const g = mappedF[i * 6 + 4]; m += g; m2 += g * g; }
    m /= n; const sd = Math.sqrt(Math.max(0, m2 / n - m * m));
    for (let i = 0; i < n; i++) mappedA[i * 6 + 4] = Math.max(4, Math.min(104, m + sd * this.z[i][4]));
    return mappedA;
  }
}

// = pushFlock() in Murmuration.html, plus the "listening" mapping (P.mapping === "order"):
//   pitch  — the heading circle is the pitch circle (one octave around), so heading
//            agreement (φ) is heard as pitch agreement: aligned → unison, scattered → cluster;
//   grain  — grain length follows each boid's heading persistence (how steady its course
//            has been over the last ~¼ s): a boid held on course by its neighbours plays
//            long, tonal grains; a boid tumbling in the noise plays short clicks.
// mem is per-voice state (the persistence average), kept by the caller between frames.
function mapBoids(boids, P, mem) {
  const N = boids.length, f = new Float32Array(N * 6), cx = WIDTH * 0.5, cy = HEIGHT * 0.5;
  const order = P.mapping === "order";
  if (order && mem && mem.hx === undefined) { mem.hx = new Float64Array(N); mem.hy = new Float64Array(N); for (let i = 0; i < N; i++) { const b = boids[i], m = Math.hypot(b.vx, b.vy) || 1; mem.hx[i] = b.vx / m; mem.hy[i] = b.vy / m; } }
  for (let i = 0; i < N; i++) {
    const b = boids[i], u = b.x / WIDTH, v = b.y / HEIGHT;
    const semis = order ? 12 * Math.atan2(b.vy, b.vx) / (2 * Math.PI) : (0.5 - v) * P.pitch;
    const rdx = b.x - cx, rdy = b.y - cy, rd = Math.hypot(rdx, rdy) + 1e-6;
    const vrad = (b.vx * rdx + b.vy * rdy) / rd, dopp = 1 - 0.012 * vrad;
    const freq = P.base * Math.pow(2, semis / 12) * dopp;
    const spd = Math.hypot(b.vx, b.vy) / MAX_SPEED;
    let grainHz = 18 + spd * 90;
    if (order && mem) {
      const m = Math.hypot(b.vx, b.vy) || 1, a = 0.93;          // ~0.24 s memory at 60 fps
      mem.hx[i] = a * mem.hx[i] + (1 - a) * b.vx / m; mem.hy[i] = a * mem.hy[i] + (1 - a) * b.vy / m;
      const pers = Math.min(1, Math.hypot(mem.hx[i], mem.hy[i]));  // 1 = dead straight, ~0.3 = tumbling
      const q = Math.pow(pers, 6);
      grainHz = 4 + (1 - q) * 100;                               // 4 Hz (250 ms, tonal) … 104 Hz (10 ms, click)
    }
    const gain = 0.55 + 0.45 * Math.min(1, b.nb / 6), k = i * 6;
    f[k] = u; f[k + 1] = v; f[k + 2] = freq; f[k + 3] = gain; f[k + 4] = grainHz; f[k + 5] = u;
  }
  return f;
}

function buildCorners() {
  const TL = new Float32Array(L), TR = new Float32Array(L), BL = new Float32Array(L), BR = new Float32Array(L);
  for (let i = 0; i < L; i++) { const ph = i / L, t = ph * 2 * Math.PI; TL[i] = Math.sin(t); TR[i] = 2 * ph - 1; BL[i] = ph < 0.5 ? 1 : -1; BR[i] = 0.6 * Math.sin(t) + 0.4 * Math.sin(2.76 * t) + 0.28 * Math.sin(5.4 * t) + 0.18 * Math.sin(8.93 * t); }
  let mx = 0; for (let i = 0; i < L; i++) mx = Math.max(mx, Math.abs(BR[i])); if (mx > 0) for (let i = 0; i < L; i++) BR[i] /= mx;
  return { TL, TR, BL, BR };
}

// = GranularProcessor in the page's worklet (Math.random → seeded stream)
class Grains {
  constructor(sr, seed = SEED + 1000) { this.sr = sr; this.rng = mulberry32(seed); this.voices = []; this.master = 0.7; this.shimmer = 0.55; Object.assign(this, buildCorners()); }
  setFlock(f, n) {
    while (this.voices.length < n) this.voices.push({ u: 0.5, v: 0.5, freq: 110, gain: 0, grainHz: 40, pan: 0.5, phase: this.rng(), gp: this.rng() });
    this.voices.length = n;
    for (let i = 0; i < n; i++) { const o = this.voices[i], k = i * 6; o.u = f[k]; o.v = f[k + 1]; o.freq = f[k + 2]; o.gain = f[k + 3]; o.grainHz = f[k + 4]; o.pan = f[k + 5]; }
  }
  process(outL, outR, n) {
    const invSr = 1 / this.sr, { TL, TR, BL, BR } = this, norm = this.master / Math.sqrt(Math.max(1, this.voices.length));
    for (let s = 0; s < n; s++) {
      let accL = 0, accR = 0;
      for (let vi = 0; vi < this.voices.length; vi++) {
        const o = this.voices[vi]; if (o.gain <= 0) continue;
        const env = 0.5 - 0.5 * Math.cos(2 * Math.PI * o.gp);
        const idx = o.phase * L, i0 = idx | 0, fr = idx - i0, i1 = (i0 + 1) & LMASK;
        const stl = TL[i0] + fr * (TL[i1] - TL[i0]), str = TR[i0] + fr * (TR[i1] - TR[i0]);
        const sbl = BL[i0] + fr * (BL[i1] - BL[i0]), sbr = BR[i0] + fr * (BR[i1] - BR[i0]);
        const top = stl + o.u * (str - stl), bot = sbl + o.u * (sbr - sbl);
        const smp = (top + o.v * (bot - top)) * env * o.gain;
        accL += smp * Math.cos(o.pan * Math.PI * 0.5); accR += smp * Math.sin(o.pan * Math.PI * 0.5);
        o.phase += o.freq * invSr; if (o.phase >= 1) o.phase -= 1;
        o.gp += o.grainHz * invSr;
        if (o.gp >= 1) { o.gp -= 1; o.phase = (1 - this.shimmer) * o.phase + this.shimmer * this.rng(); }
      }
      outL[s] = accL * norm; outR[s] = accR * norm;
    }
  }
}

function writeWav16(path, L_, R_, sr) {
  const fs = require("fs"), total = L_.length, pcm = Buffer.alloc(44 + total * 4);
  pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + total * 4, 4); pcm.write("WAVEfmt ", 8);
  pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22); pcm.writeUInt32LE(sr, 24);
  pcm.writeUInt32LE(sr * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34); pcm.write("data", 36); pcm.writeUInt32LE(total * 4, 40);
  for (let i = 0; i < total; i++) { pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L_[i])) * 32767), 44 + i * 4); pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R_[i])) * 32767), 46 + i * 4); }
  fs.writeFileSync(path, pcm);
}

module.exports = { SEED, WIDTH, HEIGHT, MAX_SPEED, FPS, mulberry32, Flock, AuthoredCloud, cloudStats, mapBoids, Grains, writeWav16 };
