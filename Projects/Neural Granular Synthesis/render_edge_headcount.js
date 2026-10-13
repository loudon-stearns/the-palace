// Cycle 14: why did the evenly spread crowd lock early at 50% pacemakers?
// Two checks, then the sweep again with the fix.
//  1. Followers' natural rates (mean, spread) and the finite-crowd lock
//     point: the smallest tightness at which every follower can hold the
//     common rate (self-consistent full locking, pacemakers left out of the
//     pull), as a fraction of theory's 1/(1 − life).
//  2. The old rule (pacemaker if role number < life) against the new one
//     (exactly round(life·N) pacemakers, lowest role numbers first).
//  3. Re-sweep tightness around the edge for evenly spread crowds of 128
//     and 512 under the new rule.  → edge-headcount.json
//   node render_edge_headcount.js
const { Crowd } = require("./crowd_engine.js");
const fract = (x) => x - Math.floor(x);
const A1 = 0.8191725133961645, A2 = 0.6710436067037893, A3 = 0.5497004779019703;
const roles = (N) => Array.from({ length: N }, (_, i) => fract(0.5 + i * A2));
const rates = (N) => Array.from({ length: N }, (_, i) => 2 * fract(0.5 + i * A1) - 1);
const oldRule = (pu, p) => pu.map((u) => (u < p ? 0 : 1));
const newRule = (pu, p) => { const m = Math.floor(p * pu.length + 0.5);
  return pu.map((u) => (pu.filter((v) => v < u).length < m ? 0 : 1)); };
function lockPoint(jit, listen) {
  const N = jit.length, d = jit.filter((_, i) => listen[i]), m = d.reduce((a, b) => a + b, 0) / d.length;
  const del = d.map((x) => x - m), umax = Math.max(...del.map(Math.abs)); let best = Infinity;
  for (let k = 0; k < 4000; k++) { const u = umax * (1 + k * 5e-4); let s = 0;
    for (const x of del) s += Math.sqrt(Math.max(0, 1 - (x / u) ** 2)); best = Math.min(best, u / (s / N)); }
  return { followers: d.length, mean: m, sd: Math.sqrt(del.reduce((a, b) => a + b * b, 0) / d.length), T: (best * Math.PI) / 4 };
}
const P = [0, 0.3, 0.5, 0.68], out = { diagnosis: [], fractions: [0.6, 0.8, 0.9, 0.95, 1.0, 1.05, 1.1, 1.2, 1.3], crowds: [] };
for (const N of [128, 512]) for (const p of P) {
  const jit = rates(N), pu = roles(N);
  for (const [rule, f] of [["old", oldRule], ["new", newRule]]) { const L = lockPoint(jit, f(pu, p));
    out.diagnosis.push({ N, p, rule, pacemakers: N - L.followers, should_be: Math.round(p * N), follower_mean: +L.mean.toFixed(3),
      follower_sd: +L.sd.toFixed(3), lock_vs_theory: +(L.T * (1 - p)).toFixed(3) }); }
  const rs = [7, 11, 23].map((seed) => { const c = new Crowd(24000); c.seed = seed; c.setN(N); c.setP(p); return lockPoint([...c.jit], [...c.listen]); });
  out.diagnosis.push({ N, p, rule: "random (3 crowds)", pacemakers: Math.round(p * N), should_be: Math.round(p * N),
    follower_sd: +(rs.reduce((a, r) => a + r.sd, 0) / 3).toFixed(3), lock_vs_theory: +(rs.reduce((a, r) => a + r.T, 0) / 3 * (1 - p)).toFixed(3) });
}
console.table(out.diagnosis);
class R3Crowd extends Crowd {
  setN(n) { super.setN(n); this.pu = new Float64Array(roles(n));
    for (let i = 0; i < n; i++) { this.jit[i] = 2 * fract(0.5 + i * A1) - 1; this.th[i] = 2 * Math.PI * fract(0.5 + i * A3);
      this.c[i] = Math.cos(this.th[i]); this.sn[i] = Math.sin(this.th[i]); } this.setP(this.p); }
  setP(p) { this.p = p; if (!this.pu) return; const l = newRule([...this.pu], p); for (let i = 0; i < this.N; i++) this.listen[i] = l[i]; this.lastPh = null; }
}
const sr = 24000;
for (const N of [128, 512]) { const rows = [];
  for (const p of P) { const r = [];
    for (const f of out.fractions) { const c = new R3Crowd(sr); c.setN(N); c.T = f / (1 - p); c.setP(p);
      const b = new Float32Array(512); let a = 0, n = 0;
      for (let k = 0; k < (sr * 4) / 512; k++) { c.process(b, 512); if (k > (sr * 2) / 512) { a += c.rCore; n++; } }
      r.push(+(a / n).toFixed(3)); }
    rows.push({ p, r }); console.log(`${N} evenly spread (fixed)`, p, r.join(" ")); }
  out.crowds.push({ name: `${N} evenly spread, fixed headcount`, N, rows }); }
require("fs").writeFileSync("edge-headcount.json", JSON.stringify(out));
