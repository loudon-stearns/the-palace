/*ENGINE-START*/
// belief_cloud.js — Belief Cloud's engine in JavaScript, ported line for line
// from src/Algorithm.h (reference/sketch.py says what each part does). It exists
// only so the visualizer's sketch page can sound and stream the same probes the
// plugin will; the plugin itself is the C++. check/check_engine.py runs it too.
const BC = (() => {
  const LO = 33, BIN_C = 10, B = 630, MAX_NOTES = 16, MAX_VOICES = 640, CTL = 64, TN = 4096, SEED = 12345;
  // parameter ids in table order (= Algorithm.h kParams)
  const IDS = ["doubt", "time_to_believe", "press", "let_go", "forget", "velocity",
    "width_start", "width_floor", "near", "rate", "shortest", "longest", "spread", "level",
    "prior_shape", "prior_tone", "hill_width", "register", "register_width",
    "pc_c", "pc_cs", "pc_d", "pc_ds", "pc_e", "pc_f", "pc_fs", "pc_g", "pc_gs", "pc_a", "pc_as", "pc_b"];
  const P = {}; IDS.forEach((id, i) => { P[id] = i; });
  const PRIOR = ["prior_shape", "hill_width", "register", "register_width",
    "pc_c", "pc_cs", "pc_d", "pc_ds", "pc_e", "pc_f", "pc_fs", "pc_g", "pc_gs", "pc_a", "pc_as", "pc_b"].map(k => P[k]);
  const DEFAULTS = [0.25, 1.6, 0.08, 1.4, 0.7, 0.3, 120, 5, 35, 160, 4, 128, 0.7, -2, 0, 0, 20, 64, 8, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  const NUM_PROBES = 5 + 3 * MAX_NOTES;

  class Cloud {
    constructor(sr) {
      this.sr = sr;
      this.tab = new Float64Array(TN + 1);
      for (let i = 0; i <= TN; i++) this.tab[i] = Math.sin(2.0 * Math.PI * i / TN);
      this.prior = new Float64Array(B); this.cdf = new Float64Array(B); this.tone = new Float64Array(B);
      this.priorKey = new Float64Array(PRIOR.length);
      this.active = new Uint8Array(MAX_NOTES); this.held = new Uint8Array(MAX_NOTES); this.midi = new Int32Array(MAX_NOTES);
      this.vel = new Float64Array(MAX_NOTES); this.w = new Float64Array(MAX_NOTES); this.ls = new Float64Array(MAX_NOTES);
      this.sig = new Float64Array(MAX_NOTES); this.conv = new Float64Array(MAX_NOTES);
      this.vPh = new Float64Array(MAX_VOICES); this.vInc = new Float64Array(MAX_VOICES);
      this.vL = new Float64Array(MAX_VOICES); this.vR = new Float64Array(MAX_VOICES);
      this.vPos = new Float64Array(MAX_VOICES); this.vLen = new Float64Array(MAX_VOICES); this.vFade = new Float64Array(MAX_VOICES);
      this.probes = new Float64Array(NUM_PROBES);
      this.out = new Float64Array(2);
    }
    rand() {
      this.s = (this.s + 0x6D2B79F5) >>> 0;
      let t = this.s;
      t = Math.imul(t ^ (t >>> 15), t | 1) >>> 0;
      t = (t ^ ((t + Math.imul(t ^ (t >>> 7), t | 61)) >>> 0)) >>> 0;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296.0;
    }
    reset(v) {
      this.s = SEED; this.havePrior = false;
      this.active.fill(0); this.held.fill(0); this.midi.fill(0);
      this.vel.fill(0); this.w.fill(0); this.ls.fill(0); this.sig.fill(0); this.conv.fill(0);
      this.sumW = 0; this.priorShare = 1;
      this.lastLw = Math.log(v[P.width_start]); this.lastSig = v[P.width_start];
      this.nv = 0; this.next = 0; this.ctl = 0; this.dropped = 0;
      this.meanCycles = 4; this.grainNote = 0; this.grainCycles = 0;
      this.buildPrior(v);
    }
    buildPrior(v) {
      let same = this.havePrior;
      for (let k = 0; k < PRIOR.length && same; k++) same = this.priorKey[k] === v[PRIOR[k]];
      if (same) return false;
      for (let k = 0; k < PRIOR.length; k++) this.priorKey[k] = v[PRIOR[k]];
      this.havePrior = true;
      const shape = v[P.prior_shape], width = v[P.hill_width], reg = v[P.register], regw = v[P.register_width];
      let a = 0, mx = 0;
      for (let i = 0; i < B; i++) {
        const m = LO + (i + 0.5) * BIN_C / 100.0;
        let h = 0.02;
        const base = Math.floor(m) - LO;
        for (let k = Math.max(0, base - 3); k <= Math.min(63, base + 3); k++) {
          const dist = m - (LO + k);
          if (Math.abs(dist) < 3.0) { const d = dist * 100.0 / width; h += v[P.pc_c + (LO + k) % 12] * Math.exp(-0.5 * d * d); }
        }
        const r = (m - reg) / (12.0 * regw);
        const p = Math.exp(-0.5 * r * r) * ((1.0 - shape) + shape * h);
        this.prior[i] = p; a += p; this.cdf[i] = a; if (p > mx) mx = p;
      }
      this.priorSum = a;
      const mean = a / B;
      for (let i = 0; i < B; i++) {
        let t = 0;
        if (mx > mean * 1.05) { t = (this.prior[i] - mean) / (mx - mean); t = t < 0 ? 0 : (t > 1 ? 1 : t); }
        this.tone[i] = t;
      }
      return true;
    }
    noteOn(note, velocity) {
      if (velocity <= 0) { this.noteOff(note); return; }
      for (let j = 0; j < MAX_NOTES; j++) if (this.active[j] && this.midi[j] === note) { this.held[j] = 1; this.vel[j] = velocity; return; }
      let slot = -1;
      for (let j = 0; j < MAX_NOTES; j++) if (!this.active[j]) { slot = j; break; }
      if (slot < 0) {
        for (let pass = 0; pass < 2 && slot < 0; pass++) {
          let best = 2.0;
          for (let j = 0; j < MAX_NOTES; j++) if (this.held[j] === pass && this.w[j] < best) { best = this.w[j]; slot = j; }
        }
        this.sumW -= this.w[slot];
      }
      this.active[slot] = 1; this.held[slot] = 1; this.midi[slot] = note; this.vel[slot] = velocity;
      this.w[slot] = 0; this.ls[slot] = this.lastLw; this.sig[slot] = this.lastSig; this.conv[slot] = 0;
    }
    noteOff(note) { for (let j = 0; j < MAX_NOTES; j++) if (this.active[j] && this.midi[j] === note) this.held[j] = 0; }
    allOff() { this.held.fill(0); }
    evolve(v) {
      const dt = CTL / this.sr;
      const kOn = 1.0 - Math.exp(-dt / v[P.press]), dOff = Math.exp(-dt / v[P.let_go]);
      const kF = 1.0 - Math.exp(-dt / v[P.time_to_believe]), kB = 1.0 - Math.exp(-dt / v[P.forget]);
      const lw = Math.log(v[P.width_start]), lf = Math.log(v[P.width_floor]), vs = v[P.velocity];
      this.lastLw = lw; this.lastSig = v[P.width_start];
      let sum = 0;
      for (let j = 0; j < MAX_NOTES; j++) {
        if (!this.active[j]) continue;
        if (this.held[j]) {
          const target = 1.0 - vs * (1.0 - this.vel[j]);
          this.w[j] += (target - this.w[j]) * kOn; this.ls[j] += (lf - this.ls[j]) * kF;
        } else {
          this.w[j] *= dOff; this.ls[j] += (lw - this.ls[j]) * kB;
          if (this.w[j] < 1e-3) { this.active[j] = 0; this.held[j] = 0; this.w[j] = 0; continue; }
        }
        this.sig[j] = Math.exp(this.ls[j]);
        const c = (lw - this.ls[j]) / (lw - lf);
        this.conv[j] = c < 0 ? 0 : (c > 1 ? 1 : c);
        sum += this.w[j];
      }
      this.sumW = sum;
      this.priorShare = v[P.doubt] / (v[P.doubt] + sum);
    }
    gauss() { let u = 0; while (u === 0) u = this.rand(); return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * this.rand()); }
    spawn(v) {
      const doubt = v[P.doubt], z = doubt + this.sumW;
      let anyNote = false; for (let j = 0; j < MAX_NOTES; j++) anyNote = anyNote || !!this.active[j];
      let u = this.rand() * z, m;
      if (u < doubt || !anyNote) {
        const t = this.rand() * this.priorSum; let a = 0, b = B - 1;
        while (a < b) { const c = (a + b) >> 1; if (this.cdf[c] < t) a = c + 1; else b = c; }
        m = LO + (a + this.rand()) * BIN_C / 100.0;
      } else {
        u -= doubt; let pick = -1;
        for (let j = 0; j < MAX_NOTES; j++) { if (!this.active[j]) continue; pick = j; if (u < this.w[j]) break; u -= this.w[j]; }
        m = this.midi[pick] + this.gauss() * this.sig[pick] / 100.0;
      }
      let best = 0; const near = v[P.near];
      for (let j = 0; j < MAX_NOTES; j++) {
        if (!this.active[j]) continue;
        const d = (m - this.midi[j]) * 100.0 / near;
        const g = Math.exp(-0.5 * d * d) * this.w[j] * this.conv[j];
        if (g > best) best = g;
      }
      const bi = Math.floor((m - LO) * 100.0 / BIN_C);
      if (bi >= 0 && bi < B) { const tt = v[P.prior_tone] * this.tone[bi]; if (tt > best) best = tt; }
      const nMin = v[P.shortest], cycles = nMin * Math.pow(v[P.longest] / nMin, best);
      if (this.nv >= MAX_VOICES) { this.dropped++; return; }
      const sr = this.sr, f = 440.0 * Math.pow(2.0, (m - 69.0) / 12.0);
      if (f > sr * 0.45) return;
      const cyc = sr / f, k = this.nv++;
      this.vPh[k] = this.rand(); this.vInc[k] = f / sr; this.vPos[k] = 0;
      this.vFade[k] = Math.max(2, Math.floor(cyc + 0.5));
      this.vLen[k] = Math.floor(cyc * (cycles + 2.0) + 0.5);
      const amp = Math.sqrt(0.06 / v[P.rate]) * Math.sqrt(f / (cycles + 1.0));
      const p = 0.5 + v[P.spread] * (this.rand() - 0.5);
      this.vL[k] = amp * Math.cos(p * Math.PI / 2.0); this.vR[k] = amp * Math.sin(p * Math.PI / 2.0);
      this.grainNote = m; this.grainCycles = cycles;
      this.meanCycles += 0.02 * (cycles - this.meanCycles);
      if (this.onGrain) this.onGrain(m, cycles, best, p);
    }
    step(v) {
      if (this.ctl <= 0) { this.buildPrior(v); this.evolve(v); this.ctl = CTL; }
      while (this.next <= 0.0) {
        this.spawn(v);
        let u = this.rand(); if (u < 1e-12) u = 1e-12;
        this.next += -Math.log(u) / v[P.rate] * this.sr;
      }
      const tab = this.tab, vPh = this.vPh, vInc = this.vInc, vPos = this.vPos, vLen = this.vLen, vFade = this.vFade, vL = this.vL, vR = this.vR;
      let left = 0, right = 0;
      for (let k = 0; k < this.nv; k++) {
        const pos = vPos[k], ln = vLen[k], fd = vFade[k];
        let e = 1.0;
        if (pos < fd) e = 0.5 - 0.5 * Math.cos(Math.PI * pos / fd);
        else if (pos > ln - fd) e = 0.5 - 0.5 * Math.cos(Math.PI * (ln - pos) / fd);
        let ph = vPh[k];
        const x = ph * TN, j = x | 0;
        const sv = tab[j] + (tab[j + 1] - tab[j]) * (x - j);
        ph += vInc[k]; if (ph >= 1.0) ph -= 1.0; vPh[k] = ph;
        const se = sv * e;
        left += se * vL[k]; right += se * vR[k];
        vPos[k] = pos + 1;
      }
      for (let k = 0; k < this.nv;) {
        if (vPos[k] >= vLen[k]) {
          const b = --this.nv;
          vPh[k] = vPh[b]; vInc[k] = vInc[b]; vPos[k] = vPos[b]; vLen[k] = vLen[b]; vFade[k] = vFade[b]; vL[k] = vL[b]; vR[k] = vR[b];
        } else k++;
      }
      const g = Math.pow(10.0, v[P.level] / 20.0);
      this.ctl -= 1; this.next -= 1.0;
      this.out[0] = Math.tanh(left * g); this.out[1] = Math.tanh(right * g);
      return this.out;
    }
    // the probe frame, in Algorithm.h's kProbes order
    readProbes() {
      const pr = this.probes;
      pr[0] = this.nv; pr[1] = this.meanCycles; pr[2] = this.priorShare; pr[3] = this.grainNote; pr[4] = this.grainCycles;
      for (let j = 0; j < MAX_NOTES; j++) {
        const b = 5 + 3 * j;
        if (this.active[j]) { pr[b] = this.midi[j]; pr[b + 1] = this.w[j]; pr[b + 2] = this.conv[j]; }
        else { pr[b] = -1; pr[b + 1] = 0; pr[b + 2] = 0; }
      }
      return pr;
    }
  }
  return { Cloud, IDS, P, DEFAULTS, LO, B, BIN_C, MAX_NOTES };
})();
/*ENGINE-END*/
if (typeof module !== "undefined") module.exports = BC;
