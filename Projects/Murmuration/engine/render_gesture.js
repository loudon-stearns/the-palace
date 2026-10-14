// The third reading, rendered: predator as gesture. One scripted 30-second étude of four
// strikes, each into a different flock, so the same click meets a different body each time:
//   A  3.0 s   centre — into a settled, ordered flock
//   B 10.0 s   upper left — into a settled, ordered flock, somewhere else on the terrain
//   C 13.5 s   the same spot as B, while the flock is still regathering from B
//   D 24.0 s   centre — after Disorder has been eased up to just short of the knee (18–22 s)
// The flock is pre-rolled 10 s so it starts ordered. Three takes:
//   ../gesture-density.wav        startle wave on, heard through the density pad
//   ../gesture-place.wav          startle wave on, heard through the grains' "place" mapping
//                                 (not the blind pair's "order" mapping — the blind key stays sealed)
//   ../gesture-density-flinch.wav the predator as first built (no startle wave, click also drops
//                                 the attractor for a quarter second), same pad, same strikes
// The two density takes share one gain, so their swells compare directly.
// Writes gesture_trace-*.json: φ, mean alarm, boids alarmed, cells sounding, pitch agreement.
//      node render_gesture.js
"use strict";
const fs = require("fs");
const E = require("./murmur_engine.js"), F = require("./field_reading.js");
const sr = 48000, SPF = sr / E.FPS, N = 60, BASE = 110, DUR = 30, PRE = 10 * E.FPS;
const W = { sep: 1.5, ali: 1.0, coh: 1.0 };
const etaOf = (x) => 0.25 * x * x;
const xAt = (t) => t < 18 ? 0.2 : t < 22 ? 0.2 + 0.35 * (t - 18) / 4 : 0.55;
const STRIKES = [
  { id: "A", t: 3.0, x: 0.5, y: 0.5 },
  { id: "B", t: 10.0, x: 0.25, y: 0.3 },
  { id: "C", t: 13.5, x: 0.25, y: 0.3 },
  { id: "D", t: 24.0, x: 0.5, y: 0.5 },
];

function render(voice, startle) {
  const flock = new E.Flock(N, E.SEED), mem = {}, gmem = {}, P = { base: BASE, pitch: 19, mapping: "page", startle };
  for (let f = 0; f < PRE; f++) flock.step({ ...W, eta: etaOf(0.2), startle });
  const field = new F.Field(sr), grains = new E.Grains(sr, E.SEED + 1000);
  const out = [new Float32Array(sr * DUR), new Float32Array(sr * DUR)], trace = [];
  for (let f = 0; f < DUR * E.FPS; f++) {
    const t = f / E.FPS;
    for (const s of STRIKES) {
      if (f === Math.round(s.t * E.FPS)) {
        flock.field.predator = { x: s.x * E.WIDTH, y: s.y * E.HEIGHT }; flock.field.predT = 1;
        if (!startle) flock.field.attract = { x: s.x * E.WIDTH, y: s.y * E.HEIGHT };   // the first build's click
      }
      if (!startle && f === Math.round(s.t * E.FPS) + 15) flock.field.attract = null;
    }
    flock.step({ ...W, eta: etaOf(xAt(t)), startle });
    const s0 = f * SPF, oL = out[0].subarray(s0, s0 + SPF), oR = out[1].subarray(s0, s0 + SPF);
    let m = null;
    if (voice === "density") { m = F.mapField(flock.boids, mem, startle); field.setField(m, F.FNC, BASE); field.process(oL, oR, SPF); }
    else { grains.setFlock(E.mapBoids(flock.boids, P, gmem), N); grains.process(oL, oR, SPF); }
    if (f % 2 === 0) {
      let ma = 0, na = 0; for (const b of flock.boids) { ma += b.a; if (b.a > 0.2) na++; }
      const row = { t: +t.toFixed(3), phi: +flock.polarization().toFixed(3), alarm: +(ma / N).toFixed(3), alarmed: na };
      if (m) {
        let sa = 0, sa2 = 0, cx = 0, cy = 0;
        for (let c = 0; c < F.FNC; c++) { const a = m[c * 4 + 2], pc = m[c * 4 + 3], q = a * a; sa += a; sa2 += q; cx += q * Math.cos(2 * Math.PI * pc); cy += q * Math.sin(2 * Math.PI * pc); }
        row.cells = +(sa * sa / sa2).toFixed(2); row.pitchAgree = +(Math.hypot(cx, cy) / sa2).toFixed(3);
      }
      trace.push(row);
    }
  }
  const total = sr * DUR, fade = sr / 2;
  for (const ch of out) for (let i = 0; i < fade; i++) { ch[total - 1 - i] *= i / fade; ch[i] *= Math.min(1, i / (sr * 0.05)); }
  let rms = 0, pk = 0; for (const ch of out) for (let i = 0; i < total; i++) { rms += ch[i] * ch[i]; pk = Math.max(pk, Math.abs(ch[i])); }
  return { out, trace, rms: Math.sqrt(rms / (2 * total)), pk, total };
}

const wave = render("density", true), flinch = render("density", false), place = render("place", true);
const gD = 0.89 / Math.max(wave.pk, flinch.pk);                          // one gain for both pads
let gP = gD * wave.rms / place.rms; if (gP * place.pk > 0.89) gP = 0.89 / place.pk;
for (const [r, g, file] of [[wave, gD, "gesture-density"], [flinch, gD, "gesture-density-flinch"], [place, gP, "gesture-place"]]) {
  for (const ch of r.out) for (let i = 0; i < r.total; i++) ch[i] *= g;
  E.writeWav16(__dirname + "/../" + file + ".wav", r.out[0], r.out[1], sr);
  fs.writeFileSync(__dirname + "/gesture_trace-" + file.replace("gesture-", "") + ".json", JSON.stringify({ strikes: STRIKES, trace: r.trace }));
  console.log(file, { rms: +(r.rms * g).toFixed(4), peak: +(r.pk * g).toFixed(3) });
}
