// Is the Disorder macro a real phase transition, or a crossfade wearing the costume?
// Sweep η, let the page's own flock (60 boids, page defaults) settle, and measure the
// order parameter φ (polarization) and its fluctuation. A crossfade gives a straight,
// calm line; a transition gives a knee, with the fluctuations peaking at the knee.
// Hysteresis check: sweep η up from an ordered flock and down from a disordered one.
//    node sweep_eta.js      → eta_sweep.json
"use strict";
const fs = require("fs");
const { Flock } = require("./murmur_engine.js");
const W = { sep: 1.5, ali: 1.0, coh: 1.0 };
const ETAS = []; // fine where the knee lives, coarse above it
for (let e = 0; e < 0.2001; e += 0.01) ETAS.push(+e.toFixed(2));
for (let e = 0.25; e <= 1.0001; e += 0.05) ETAS.push(+e.toFixed(2));
const SEEDS = [7, 8, 9, 10, 11, 12, 13, 14];
const BURN = 60 * 40, MEAS = 60 * 20;

function settle(fl, eta, burn, meas) {
  for (let f = 0; f < burn; f++) fl.step({ ...W, eta });
  let s = 0, s2 = 0; for (let f = 0; f < meas; f++) { fl.step({ ...W, eta }); const p = fl.polarization(); s += p; s2 += p * p; }
  const m = s / meas; return { phi: m, sd: Math.sqrt(Math.max(0, s2 / meas - m * m)) };
}

const fresh = ETAS.map((eta) => {
  const r = SEEDS.map((sd) => settle(new Flock(60, sd), eta, BURN, MEAS));
  const phi = r.reduce((a, x) => a + x.phi, 0) / r.length, chi = r.reduce((a, x) => a + x.sd, 0) / r.length;
  const spread = Math.sqrt(r.reduce((a, x) => a + (x.phi - phi) ** 2, 0) / r.length);
  return { eta, phi: +phi.toFixed(3), fluct: +chi.toFixed(3), seedSpread: +spread.toFixed(3) };
});

// adiabatic sweeps, seed 7: up from ordered, down from disordered (20 s per step)
function adiabatic(list) { const fl = new Flock(60, 7); for (let f = 0; f < 60 * 40; f++) fl.step({ ...W, eta: list[0] }); return list.map((eta) => ({ eta, ...settle(fl, eta, 60 * 10, 60 * 10) })); }
const up = adiabatic(ETAS), down = adiabatic([...ETAS].reverse());

// how long the page's flock takes to order from its seed-7 start at η = 0 and at the page default η = 0.06
function timeTo(eta, thr) { const fl = new Flock(60, 7); for (let f = 0; f < 60 * 120; f++) { fl.step({ ...W, eta }); if (fl.polarization() > thr) return +(f / 60).toFixed(1); } return null; }
const order = { eta0_to_0p9: timeTo(0, 0.9), eta006_to_0p9: timeTo(0.06, 0.9), eta0_to_0p6: timeTo(0, 0.6) };

fs.writeFileSync(__dirname + "/eta_sweep.json", JSON.stringify({ note: "60 boids, page defaults (sep 1.5, ali 1.0, coh 1.0); 40 s settle + 20 s measure per point, 8 seeds", fresh, up: up.map((x) => ({ eta: x.eta, phi: +x.phi.toFixed(3) })), down: down.map((x) => ({ eta: x.eta, phi: +x.phi.toFixed(3) })), order }, null, 1));
console.table(fresh); console.log(order);
