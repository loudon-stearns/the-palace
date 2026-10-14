// The wager, rendered blind. One scripted 40-second performance, played twice through
// the same 60 grain voices and the same boid→grain mapping:
//   FLOCK    — the page's flock: every grain steers by its neighbours.
//   AUTHORED — every grain wanders on its own (smooth independent jitter), but the
//              cloud's centre, spread, speed, heading agreement (φ) and grain-length mix are copied from the flock
//              frame by frame. Everything a hand-dialed granular cloud could borrow, it
//              borrows; only the coordination between grains is missing.
// The two are level-matched (equal RMS) and written as blind-X.wav / blind-Y.wav; which
// is which is in blind-key.json. Don't open the key before listening.
//
// The script (Disorder on the remapped slider, η = 0.25·x²):
//   0–5 s    x = 1    melted: broadband
//   5–14 s   x 1 → 0  crystallise (crosses the knee near 9.5 s)
//   14–21 s  x = 0    ordered
//   21 s     predator dropped at the centre — startle, then re-cohere
//   28–36 s  x 0 → 1  melt
//   36–40 s  x = 1    melted, fade out
//      node render_wager.js [order|page]
//        order (default) → ../blind-X.wav, ../blind-Y.wav, blind-key.json  (the listening mapping)
//        page            → the same test on the page's mapping as first built (-page suffix)
//      plus unblinded take-flock-*.wav / take-authored-*.wav (scratch, for analyse_takes.py; not kept)
//      and wager_trace-*.json. ../page-as-built.wav is take-flock-page.wav, renamed and kept.
"use strict";
const fs = require("fs");
const E = require("./murmur_engine.js");
const sr = 48000, DUR = 40, SPF = sr / E.FPS, FRAMES = DUR * E.FPS, N = 60;
const MAPPING = process.argv[2] || "order";               // "page" = the mapping as first built
const P = { base: 110, pitch: 19, mapping: MAPPING };
const memF = {}, memA = {};
const W = { sep: 1.5, ali: 1.0, coh: 1.0 };
const xAt = (t) => t < 5 ? 1 : t < 14 ? 1 - (t - 5) / 9 : t < 28 ? 0 : t < 36 ? (t - 28) / 8 : 1;
const etaOf = (x) => 0.25 * x * x;

const flock = new E.Flock(N, E.SEED), auth = new E.AuthoredCloud(N);
const gF = new E.Grains(sr, E.SEED + 1000), gA = new E.Grains(sr, E.SEED + 1000);
const out = { F: [new Float32Array(sr * DUR), new Float32Array(sr * DUR)], A: [new Float32Array(sr * DUR), new Float32Array(sr * DUR)] };
const trace = [];
function spreadOf(st) { return Math.sqrt(Math.sqrt(Math.max(0, st.vxx * st.vyy - st.vxy * st.vxy))); }
for (let f = 0; f < FRAMES; f++) {
  const t = f / E.FPS, x = xAt(t), eta = etaOf(x);
  if (f === 21 * E.FPS) { flock.field.predator = { x: E.WIDTH / 2, y: E.HEIGHT / 2 }; flock.field.predT = 1; flock.field.attract = { x: E.WIDTH / 2, y: E.HEIGHT / 2 }; }
  if (f === 21 * E.FPS + 15) flock.field.attract = null;           // mouse released after 0.25 s
  flock.step({ ...W, eta });
  const st = E.cloudStats(flock.boids);
  auth.step(st);
  const mF = E.mapBoids(flock.boids, P, memF), mA = E.mapBoids(auth.boids, P, memA);
  if (MAPPING === "order") auth.matchGrainRate(mA, mF);
  gF.setFlock(mF, N); gA.setFlock(mA, N);
  const s0 = f * SPF;
  gF.process(out.F[0].subarray(s0, s0 + SPF), out.F[1].subarray(s0, s0 + SPF), SPF);
  gA.process(out.A[0].subarray(s0, s0 + SPF), out.A[1].subarray(s0, s0 + SPF), SPF);
  if (f % 3 === 0) {
    const semSd = (bs) => { const m = E.mapBoids(bs, P), q = []; for (let i = 0; i < N; i++) q.push(12 * Math.log2(m[i * 6 + 2] / P.base)); const mu = q.reduce((a, b) => a + b, 0) / N; return Math.sqrt(q.reduce((a, b) => a + (b - mu) ** 2, 0) / N); };
    const meanNb = (bs) => bs.reduce((a, b) => a + b.nb, 0) / bs.length;
    trace.push({ t: +t.toFixed(3), x: +x.toFixed(3), eta: +eta.toFixed(4), phi: +flock.polarization().toFixed(3), spread: +spreadOf(st).toFixed(1),
      nbF: +meanNb(flock.boids).toFixed(2), nbA: +meanNb(auth.boids).toFixed(2), semsdF: +semSd(flock.boids).toFixed(2), semsdA: +semSd(auth.boids).toFixed(2) });
  }
}
// fade the last second, level-match by RMS, then one shared gain for headroom
const total = sr * DUR, fade = sr;
for (const k of ["F", "A"]) for (const ch of out[k]) for (let i = 0; i < fade; i++) ch[total - 1 - i] *= i / fade;
const rms = (o) => { let s = 0; for (const ch of o) for (let i = 0; i < total; i++) s += ch[i] * ch[i]; return Math.sqrt(s / (2 * total)); };
const peak = (o) => { let p = 0; for (const ch of o) for (let i = 0; i < total; i++) p = Math.max(p, Math.abs(ch[i])); return p; };
const rF = rms(out.F), rA = rms(out.A);
for (const ch of out.A) for (let i = 0; i < total; i++) ch[i] *= rF / rA;
const g = 0.89 / Math.max(peak(out.F), peak(out.A));
for (const k of ["F", "A"]) for (const ch of out[k]) for (let i = 0; i < total; i++) ch[i] *= g;

// a fixed coin, decided once: which take is X. (Don't read this line before listening.)
const flockIsX = (E.mulberry32(20261014)() < 0.5);
const X = flockIsX ? out.F : out.A, Y = flockIsX ? out.A : out.F;
const tag = MAPPING === "order" ? "" : "-" + MAPPING;
E.writeWav16(__dirname + "/../blind-X" + tag + ".wav", X[0], X[1], sr);
E.writeWav16(__dirname + "/../blind-Y" + tag + ".wav", Y[0], Y[1], sr);
fs.writeFileSync(__dirname + "/blind-key" + tag + ".json", JSON.stringify({ X: flockIsX ? "FLOCK" : "AUTHORED", Y: flockIsX ? "AUTHORED" : "FLOCK", rmsBeforeMatch: { FLOCK: rF, AUTHORED: rA }, authoredGainDb: +(20 * Math.log10(rF / rA)).toFixed(2) }, null, 1));
// raw (unblinded) copies for the analysis plot, not for listening
E.writeWav16(__dirname + "/take-flock-" + MAPPING + ".wav", out.F[0], out.F[1], sr);
E.writeWav16(__dirname + "/take-authored-" + MAPPING + ".wav", out.A[0], out.A[1], sr);
fs.writeFileSync(__dirname + "/wager_trace-" + MAPPING + ".json", JSON.stringify(trace));
console.log("done", { rF, rA, gain: g });
