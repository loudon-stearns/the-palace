// blood_compressor.js — Blood Compressor's engine in JavaScript, for the face page
// only (the plugin runs src/Algorithm.h). Line for line the same as
// reference/sketch.py; check/check_engine.py holds it to the sketch.
//   const c = new BCE.Compressor(sr); c.reset(v); const [L, R] = c.step(v, inL, inR);
//   v: Float64Array in BCE.IDS order (Algorithm.h kParams order), natural units.
//   c.probes: [pressure, target, squeeze, reflex] (Algorithm.h kProbes order).
/*ENGINE-START*/
const BCE = (() => {
  const IDS = ["threshold", "ratio", "knee", "attack", "release", "detector", "sc_hpf", "makeup", "bypass"];
  const DEFAULTS = [-20, 4, 6, 0.06, 0.3, 0.01, 80, 0, 0];
  const P = {}; IDS.forEach((id, i) => P[id] = i);
  const NERVE_S = 0.005, DLEN = 16384, DB10 = 4.342944819032518;
  function curve(x, T, R, K) {
    const lo = T - K / 2.0, hi = T + K / 2.0;
    if (K <= 0.0 || x <= lo) { if (x > T) return T + (x - T) / R; return x; }
    if (x >= hi) return T + (x - T) / R;
    const s = (x - lo) / K, y0 = lo, y1 = T + (K / 2.0) / R, m0 = K, m1 = K / R;
    const s2 = s * s, s3 = s2 * s;
    return (2.0 * s3 - 3.0 * s2 + 1.0) * y0 + (s3 - 2.0 * s2 + s) * m0
         + (-2.0 * s3 + 3.0 * s2) * y1 + (s3 - s2) * m1;
  }
  class Compressor {
    constructor(sr) {
      this.sr = sr; this.d = Math.max(1, Math.floor(sr * NERVE_S + 0.5));
      this.dline = new Float64Array(DLEN); this.out = [0, 0]; this.probes = [0, 0, 0, 0];
      this.reset();
    }
    reset() { this.hpX = this.hpY = this.hpX2 = this.hpY2 = 0; this.ms = 0; this.g = 0; this.dline.fill(0); this.dw = 0; }
    step(v, x, x2) {
      const sr = this.sr, R = Math.max(1.0, v[1]), K = Math.max(0.0, v[2]);
      const a = Math.exp(-2.0 * Math.PI * v[6] / sr);
      const hp = a * (this.hpY + x - this.hpX); this.hpX = x; this.hpY = hp;
      const hp2 = a * (this.hpY2 + x2 - this.hpX2); this.hpX2 = x2; this.hpY2 = hp2;
      const ar = Math.exp(-1.0 / (sr * v[5]));
      this.ms = ar * this.ms + (1.0 - ar) * Math.max(hp * hp, hp2 * hp2);
      const det = DB10 * Math.log(this.ms + 1e-12) + 3.0103;
      const target = Math.min(0.0, curve(det, v[0], R, K) - det);
      this.dline[this.dw] = target;
      let r = this.dw - this.d; if (r < 0) r += DLEN;
      const delayed = this.dline[r];
      if (++this.dw >= DLEN) this.dw = 0;
      const atk = Math.max(0.005, v[3]), rel = Math.max(0.005, v[4]);
      const c = delayed < this.g ? Math.exp(-1.0 / (sr * atk)) : Math.exp(-1.0 / (sr * rel));
      this.g = c * this.g + (1.0 - c) * delayed;
      if (v[8] >= 0.5) { this.out[0] = x; this.out[1] = x2; }
      else { const gl = Math.pow(10.0, (this.g + v[7]) / 20.0); this.out[0] = x * gl; this.out[1] = x2 * gl; }
      const p = this.probes; p[0] = det; p[1] = target; p[2] = this.g; p[3] = target < -0.05 ? 1 : 0;
      return this.out;
    }
  }
  return { IDS, DEFAULTS, P, curve, Compressor };
})();
/*ENGINE-END*/
if (typeof module !== "undefined") module.exports = BCE;
