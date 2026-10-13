// Sweeps tightness around the predicted lock edge T = 1/(1 − life) at four
// pacemaker shares, 128 neurons, 3 seeds each → edge-softening.json.
//   node render_edge_softening.js
const { Crowd } = require("./crowd_engine.js");
const sr = 24000, out = { fractions: [], rows: [] }, F = [];
for (let f = 0.5; f <= 1.31; f += 0.05) F.push(+f.toFixed(2)); out.fractions = F;
for (const p of [0, 0.3, 0.5, 0.68]) { const r = [];
  for (const f of F) { let s = 0;
    for (const seed of [7, 11, 23]) { const c = new Crowd(sr); c.seed = seed; c.setN(128); c.T = f/(1-p); c.setP(p);
      const b = new Float32Array(512); let a = 0, n = 0;
      for (let k = 0; k < sr*4/512; k++) { c.process(b, 512); if (k > sr*2/512) { a += c.rCore; n++; } } s += a/n; }
    r.push(+(s/3).toFixed(3)); }
  out.rows.push({ p, r }); }
require("fs").writeFileSync("edge-softening.json", JSON.stringify(out)); console.log(JSON.stringify(out));
