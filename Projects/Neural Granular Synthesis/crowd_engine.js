/*ENGINE-START*/
// The crowd: N phase neurons at audio rate. Same model as cycles 8–9
// (render_timbre_map.py / render_pacemakers.py): each neuron's phase runs at
// its natural rate plus the Kuramoto pull of the crowd's mean field; a
// pacemaker ignores the pull but still counts in the field. Every wrap past
// 2π is a spike, and every spike is a prescribed 1.6 ms action potential.
// Knobs are the population's, not any neuron's:
//   tight  T = K / (4σ/π)   coupling per unit of disorder; a crowd with no
//                           pacemakers locks at T = 1, with share p at 1/(1−p)
//   life   p                pacemaker share
//   sigma  σ                rate spread (the stand-in for threshold spread)
class Crowd {
  constructor(sr) {
    this.sr = sr; this.F0 = 110; this.f0s = 110; this.glide = 0.06;
    this.sigma = 0.10; this.T = 0; this.p = 0; this.width = 1; this.seed = 7;
    this.level = true; this.vol = 0.7;
    this.acc = new Float32Array(16384); this.pos = 0;
    this.EV = 65536; this.evN = new Int16Array(this.EV); this.evT = new Float64Array(this.EV); this.evW = 0;
    this.clock = 0; this.env = 1e-4; this.gain = 1; this.dcx = 0; this.dcy = 0;
    this.cents = new Float32Array(100); this.cw = 0; this.cn = 0;
    this.lastPh = null; this.meterEvery = Math.round(sr / 100); this.mcount = 0;
    this.rAll = 0; this.rCore = 0; this.hz = 0; this.wobble = 0;
    this.buildSpike(); this.setN(128);
  }
  rand() { let t = (this.s += 0x6D2B79F5); t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  setN(n) {
    this.N = n; this.s = this.seed * 9973 + n;
    this.jit = new Float64Array(n); this.th = new Float64Array(n);
    this.c = new Float64Array(n); this.sn = new Float64Array(n); this.listen = new Float64Array(n);
    for (let i = 0; i < n; i++) this.jit[i] = this.rand() * 2 - 1;
    for (let i = 0; i < n; i++) { this.th[i] = this.rand() * 2 * Math.PI; this.c[i] = Math.cos(this.th[i]); this.sn[i] = Math.sin(this.th[i]); }
    const order = [...Array(n).keys()];              // pacemaker sets nest: p=0.2 contains p=0.1
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(this.rand() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    this.order = order;
    this.rank = new Int16Array(n);                   // raster row = rank by natural rate
    [...Array(n).keys()].sort((a, b) => this.jit[a] - this.jit[b]).forEach((i, r) => (this.rank[i] = r));
    this.setP(this.p);
  }
  setP(p) {
    this.p = p; const m = Math.round(p * this.N);
    for (let i = 0; i < this.N; i++) this.listen[i] = 1;
    for (let k = 0; k < m; k++) this.listen[this.order[k]] = 0;
    this.lastPh = null;
  }
  isPace(i) { return this.listen[i] === 0; }
  buildSpike() {                                     // cycle 8's shape: rise, fall, undershoot
    const sr = this.sr, w = this.width, L = Math.max(8, Math.round(0.0016 * w * sr));
    const s = new Float32Array(L + 2); let mean = 0;
    for (let k = 0; k < L; k++) {
      const t = k / sr / w;
      s[k] = 0.6 * Math.exp(-(((t - 0.00035) / 0.00012) ** 2)) + 0.5 * Math.exp(-(((t - 0.0006) / 0.0002) ** 2))
           - 0.28 * Math.exp(-(((t - 0.0011) / 0.00028) ** 2));
      mean += s[k];
    }
    mean /= L; for (let k = 0; k < L; k++) s[k] -= mean;
    this.spike = s; this.spikeL = L;
  }
  process(out, n) {
    const N = this.N, th = this.th, c = this.c, sn = this.sn, jit = this.jit, listen = this.listen;
    const acc = this.acc, AM = acc.length - 1, sp = this.spike, L = this.spikeL;
    const dt = 1 / this.sr, TWO = 2 * Math.PI;
    const K = this.T * 4 * this.sigma / Math.PI, sig = this.sigma;
    let sx = 0, sy = 0;
    for (let i = 0; i < N; i++) { sx += c[i]; sy += sn[i]; }
    const agcA = 1 - Math.exp(-1 / (0.3 * this.sr));
    for (let k = 0; k < n; k++) {
      this.f0s += (this.F0 - this.f0s) * (1 - Math.exp(-1 / (this.glide * this.sr + 1)));
      const w0 = TWO * this.f0s, Kabs = K * w0, Zx = sx / N, Zy = sy / N;
      sx = 0; sy = 0;
      const resync = (this.clock & 63) === 0;
      for (let i = 0; i < N; i++) {
        const d = (w0 * (1 + sig * jit[i]) + Kabs * listen[i] * (Zy * c[i] - Zx * sn[i])) * dt;
        let t = th[i] + d;
        if (t >= TWO) {                              // spike: place it at its sub-sample time
          t -= TWO;
          const frac = d > 0 ? t / d : 0;            // how far past the wrap, in samples
          for (let j = 0; j < L; j++) {
            const x = j - frac + 1, x0 = Math.floor(x), f = x - x0;
            if (x0 >= 0 && x0 + 1 < L + 2) acc[(this.pos + j) & AM] += sp[x0] * (1 - f) + sp[x0 + 1] * f;
          }
          const e = this.evW & (this.EV - 1); this.evN[e] = i; this.evT[e] = this.clock - frac; this.evW++;
        }
        th[i] = t;
        if (resync) { c[i] = Math.cos(t); sn[i] = Math.sin(t); }
        else { const d2 = d * d, cd = 1 - d2 * 0.5, sd = d - d2 * d / 6, ci = c[i];
               c[i] = ci * cd - sn[i] * sd; sn[i] = ci * sd + sn[i] * cd; }
        sx += c[i]; sy += sn[i];
      }
      let y = acc[this.pos]; acc[this.pos] = 0; this.pos = (this.pos + 1) & AM;
      y /= Math.sqrt(N);
      const dc = y - this.dcx + 0.995 * this.dcy; this.dcx = y; this.dcy = dc; y = dc;
      this.env += (y * y - this.env) * agcA;
      const g = this.level ? Math.min(40, 0.16 / Math.sqrt(this.env + 1e-9)) : 0.35;
      this.gain += (g - this.gain) * 0.0005;
      out[k] = Math.tanh(y * this.gain * this.vol);
      this.clock++;
      if (++this.mcount >= this.meterEvery) { this.mcount = 0; this.meter(); }
    }
  }
  meter() {                                          // 10 ms: synchrony, core pitch, wobble
    const N = this.N; let ax = 0, ay = 0, cx = 0, cy = 0, nf = 0;
    for (let i = 0; i < N; i++) { ax += this.c[i]; ay += this.sn[i];
      if (this.listen[i]) { cx += this.c[i]; cy += this.sn[i]; nf++; } }
    this.rAll = Math.hypot(ax, ay) / N;
    if (!nf) { this.rCore = 0; return; }
    this.rCore = Math.hypot(cx, cy) / nf;
    const ph = Math.atan2(cy, cx);
    if (this.lastPh !== null) {
      let d = ph - this.lastPh; d -= 2 * Math.PI * Math.round(d / (2 * Math.PI));
      // the phase advances ~1.1 turns per 10 ms at 110 Hz; add back the whole turns
      const exp = 2 * Math.PI * this.f0s / 100; d += 2 * Math.PI * Math.round((exp - d) / (2 * Math.PI));
      const hz = d * 100 / (2 * Math.PI);
      if (hz > 20) { this.hz = hz; this.cents[this.cw++ % 100] = 1200 * Math.log2(hz / this.f0s); this.cn = Math.min(100, this.cn + 1); }
    }
    this.lastPh = ph;
    if (this.cn > 10) { let m = 0; for (let i = 0; i < this.cn; i++) m += this.cents[i]; m /= this.cn;
      let v = 0; for (let i = 0; i < this.cn; i++) v += (this.cents[i] - m) ** 2; this.wobble = Math.sqrt(v / this.cn); }
  }
}
/*ENGINE-END*/
if (typeof module !== "undefined") module.exports = { Crowd };
