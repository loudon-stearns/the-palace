// Separates two things cycle 12 could not: does adding pacemakers really
// soften the lock edge, or is it that fewer neurons are left following?
// Sweeps tightness around the predicted edge T = 1/(1 − life) for three
// crowds: 128 random (cycle 12's), 512 random, and 128 evenly spread
// (the R3 crowd crowd.codebox uses). → edge-crowds.json
//   node render_edge_crowds.js
const { Crowd } = require("./crowd_engine.js");
const fract = (x) => x - Math.floor(x);
class R3Crowd extends Crowd {
  setN(n) { super.setN(n); this.pu = new Float64Array(n);
    for (let i = 0; i < n; i++) { this.jit[i] = 2 * fract(0.5 + i * 0.8191725133961645) - 1; this.pu[i] = fract(0.5 + i * 0.6710436067037893);
      this.th[i] = 2 * Math.PI * fract(0.5 + i * 0.5497004779019703); this.c[i] = Math.cos(this.th[i]); this.sn[i] = Math.sin(this.th[i]); }
    this.setP(this.p); }
  setP(p) { this.p = p; if (!this.pu) return; const m = Math.floor(p * this.N + 0.5); for (let i = 0; i < this.N; i++) { let r = 0; for (let j = 0; j < this.N; j++) if (this.pu[j] < this.pu[i]) r++; this.listen[i] = r < m ? 0 : 1; } }
}
const sr = 24000, F = [0.6, 0.8, 0.9, 0.95, 1.0, 1.05, 1.1, 1.2, 1.3], P = [0, 0.3, 0.5, 0.68];
const CROWDS = [["128 random", Crowd, 128, [7, 11, 23]], ["512 random", Crowd, 512, [7, 11, 23]], ["128 evenly spread", R3Crowd, 128, [0]]];
const out = { fractions: F, crowds: [] };
for (const [name, C, N, seeds] of CROWDS) { const rows = [];
  for (const p of P) { const r = [];
    for (const f of F) { let s = 0;
      for (const seed of seeds) { const c = new C(sr); c.seed = seed; c.setN(N); c.T = f / (1 - p); c.setP(p);
        const b = new Float32Array(512); let a = 0, n = 0;
        for (let k = 0; k < sr * 4 / 512; k++) { c.process(b, 512); if (k > sr * 2 / 512) { a += c.rCore; n++; } } s += a / n; }
      r.push(+(s / seeds.length).toFixed(3)); }
    rows.push({ p, r }); console.log(name, p, r.join(" ")); }
  out.crowds.push({ name, N, rows }); }
require("fs").writeFileSync("edge-crowds.json", JSON.stringify(out));
