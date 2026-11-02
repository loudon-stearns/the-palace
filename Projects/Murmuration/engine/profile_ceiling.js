// Murmuration — voice ceiling, headless (Node/V8, the same engine Chrome runs).
// For N boids: cost of one flock step with the startle on (O(N²) — every boid scans every boid),
// one density-field mapping, and one second of grains (N voices) and pad (40 cells).
// Reported as share of real time: audio = seconds of compute per second of sound;
// flock = 60 steps (one second at 60 fps) per second. Budget: 100% = everything a core has;
// the worklet thread and the main thread are separate cores, so audio and flock are checked apart.
"use strict";
const E = require("./murmur_engine.js"), F = require("./field_reading.js");
const SR = 48000, BLOCK = 128, NS = [60, 120, 240, 480, 960];
const W = { sep: 1.5, ali: 1.0, coh: 1.0, eta: 0.1, startle: true };
const P = { mapping: "order", base: 110, pitch: 24, startle: true };
const out = [];
for (const N of NS) {
  const fl = new E.Flock(N); for (let i = 0; i < 120; i++) fl.step(W);
  fl.field.predator = { x: 460, y: 260 }; fl.field.predT = 1;
  // flock: 60 steps
  let t0 = process.hrtime.bigint(); for (let i = 0; i < 60; i++) fl.step(W); const flockS = Number(process.hrtime.bigint() - t0) / 1e9;
  // grains: 1 s of sound, mapping refreshed every 800 samples (60 fps)
  const g = new E.Grains(SR), mem = {}, L_ = new Float32Array(BLOCK), R_ = new Float32Array(BLOCK);
  g.setFlock(E.mapBoids(fl.boids, P, mem), N); for (let b = 0; b < 40; b++) g.process(L_, R_, BLOCK);   // warm the JIT
  t0 = process.hrtime.bigint(); let worst = 0;
  for (let b = 0, s = 0; b < SR / BLOCK; b++, s += BLOCK) {
    if (s % 800 < BLOCK) { fl.step(W); g.setFlock(E.mapBoids(fl.boids, P, mem), N); }
    const tb = process.hrtime.bigint(); g.process(L_, R_, BLOCK); const d = Number(process.hrtime.bigint() - tb) / 1e9; if (d > worst) worst = d;
  }
  const grainsS = Number(process.hrtime.bigint() - t0) / 1e9 - flockS; // subtract the 60 flock steps we did inline
  // pad: 1 s
  const fd = new F.Field(SR), fm = {};
  t0 = process.hrtime.bigint(); let mapS = 0;
  for (let b = 0, s = 0; b < SR / BLOCK; b++, s += BLOCK) {
    if (s % 800 < BLOCK) { const tm = process.hrtime.bigint(); fd.setField(F.mapField(fl.boids, fm, true), F.FNC, 110); mapS += Number(process.hrtime.bigint() - tm) / 1e9; }
    fd.process(L_, R_, BLOCK);
  }
  const padS = Number(process.hrtime.bigint() - t0) / 1e9 - mapS;
  const blockBudget = BLOCK / SR;
  out.push({ N, flockPct: +(flockS * 100).toFixed(1), flockMsPerFrame: +(flockS / 60 * 1000).toFixed(2), grainsPct: +(grainsS * 100).toFixed(1), grainsWorstBlockPct: +(worst / blockBudget * 100).toFixed(0), padAudioPct: +(padS * 100).toFixed(1), padMapPct: +(mapS * 100).toFixed(1) });
  console.log(JSON.stringify(out[out.length - 1]));
}
require("fs").writeFileSync(__dirname + "/ceiling.json", JSON.stringify({ when: new Date().toISOString(), host: require("os").cpus()[0].model, node: process.version, sr: SR, block: BLOCK, rows: out }, null, 1));
