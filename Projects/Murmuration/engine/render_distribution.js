// The second reading, rendered. Two takes, both through the flock-as-distribution field:
//   ../reading-distribution.wav — the SAME scripted 40-second performance as the blind pair
//       (melted → crystallise → ordered → predator at 21 s → melt), so it sits beside them.
//   ../reading-distribution-attractor.wav — 20 s showing what this reading hears that the
//       grains mostly don't: WHERE the flock is. Ordered flock; from 4 s to 16 s the
//       attractor drags it on a slow loop across the field, then lets go.
// Also writes distribution_trace-*.json: φ, how many cells are sounding (participation
// ratio of the weights), and how much the sounding cells agree on pitch.
//      node render_distribution.js
"use strict";
const fs = require("fs");
const E = require("./murmur_engine.js"), F = require("./field_reading.js");
const sr = 48000, SPF = sr / E.FPS, N = 60, BASE = 110;
const W = { sep: 1.5, ali: 1.0, coh: 1.0 };
const etaOf = (x) => 0.25 * x * x;

function render(name, DUR, script) {
  const FRAMES = DUR * E.FPS, flock = new E.Flock(N, E.SEED), field = new F.Field(sr), mem = {};
  const out = [new Float32Array(sr * DUR), new Float32Array(sr * DUR)], trace = [];
  for (let f = 0; f < FRAMES; f++) {
    const t = f / E.FPS, x = script(f, t, flock);
    flock.step({ ...W, eta: etaOf(x) });
    const m = F.mapField(flock.boids, mem);
    field.setField(m, F.FNC, BASE);
    const s0 = f * SPF;
    field.process(out[0].subarray(s0, s0 + SPF), out[1].subarray(s0, s0 + SPF), SPF);
    if (f % 3 === 0) {
      let sa = 0, sa2 = 0, cx = 0, cy = 0, w = 0;
      for (let c = 0; c < F.FNC; c++) { const a = m[c * 4 + 2], pc = m[c * 4 + 3], q = a * a; sa += a; sa2 += q; cx += q * Math.cos(2 * Math.PI * pc); cy += q * Math.sin(2 * Math.PI * pc); w += q; }
      trace.push({ t: +t.toFixed(3), x: +x.toFixed(3), phi: +flock.polarization().toFixed(3), cells: +(sa * sa / sa2).toFixed(2), pitchAgree: +(Math.hypot(cx, cy) / w).toFixed(3) });
    }
  }
  const total = sr * DUR, fade = sr;
  for (const ch of out) for (let i = 0; i < fade; i++) ch[total - 1 - i] *= i / fade;
  let rms = 0, pk = 0; for (const ch of out) for (let i = 0; i < total; i++) { rms += ch[i] * ch[i]; pk = Math.max(pk, Math.abs(ch[i])); }
  rms = Math.sqrt(rms / (2 * total));
  return { out, trace, rms, pk, total };
}

// the blind pair's performance, frame for frame (see render_wager.js)
const xAt = (t) => t < 5 ? 1 : t < 14 ? 1 - (t - 5) / 9 : t < 28 ? 0 : t < 36 ? (t - 28) / 8 : 1;
const perf = render("performance", 40, (f, t, fl) => {
  if (f === 21 * E.FPS) { fl.field.predator = { x: E.WIDTH / 2, y: E.HEIGHT / 2 }; fl.field.predT = 1; fl.field.attract = { x: E.WIDTH / 2, y: E.HEIGHT / 2 }; }
  if (f === 21 * E.FPS + 15) fl.field.attract = null;
  return xAt(t);
});
// the attractor take: ordered from the start (x = 0.2, η = 0.01), a slow loop 4–16 s
const attr = render("attractor", 20, (f, t, fl) => {
  if (t >= 4 && t < 16) { const p = (t - 4) / 12; fl.field.attract = { x: E.WIDTH * (0.5 + 0.36 * Math.sin(2 * Math.PI * p)), y: E.HEIGHT * (0.5 - 0.34 * Math.cos(2 * Math.PI * p)) }; }
  else fl.field.attract = null;
  return 0.2;
});

// level: match the performance take to the blind pair's RMS so the three sit side by side
const bx = fs.readFileSync(__dirname + "/../blind-X.wav"); let br = 0; const nb = (bx.length - 44) / 2;
for (let i = 0; i < nb; i++) { const v = bx.readInt16LE(44 + 2 * i) / 32768; br += v * v; } br = Math.sqrt(br / nb);
for (const [r, file] of [[perf, "reading-distribution"], [attr, "reading-distribution-attractor"]]) {
  let g = br / r.rms; if (g * r.pk > 0.89) g = 0.89 / r.pk;
  for (const ch of r.out) for (let i = 0; i < r.total; i++) ch[i] *= g;
  E.writeWav16(__dirname + "/../" + file + ".wav", r.out[0], r.out[1], sr);
  console.log(file, { rms: r.rms, peak: r.pk, gain: g, matchedToBlindRms: br });
}
fs.writeFileSync(__dirname + "/distribution_trace-performance.json", JSON.stringify(perf.trace));
fs.writeFileSync(__dirname + "/distribution_trace-attractor.json", JSON.stringify(attr.trace));
