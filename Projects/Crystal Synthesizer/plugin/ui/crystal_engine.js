/*ENGINE-START*/
// crystal_engine.js — Crystal Synthesizer's engine in JavaScript, ported line for
// line from src/Algorithm.h (reference/sketch.py says what each part does). It
// exists only so the face page can sound and stream the same probes the plugin
// will; the plugin itself is the C++. check/check_engine.py holds it to the sketch.
const CE = (() => {
  const V = 8, K = 9, M = 18, TWOPI = 6.283185307179586, MPI = 3.141592653589793, D_DIAMOND = 0.044;
  const IDS = ["crystal", "hardness", "vel_bright", "velocity", "lifetime", "rolloff", "release",
    "angle", "spread", "fire", "width", "level"];
  const P = {}; IDS.forEach((id, i) => { P[id] = i; });
  const DEFAULTS = [4, 1.0, 0.5, 0.6, 1.0, 0.7, 4.0, 90, 1.0, 40, 0.7, -6];
  const RATIOS = [
    [1.00, 1.32, 1.48, 1.57, 1.65],
    [1.00, 1.00, 1.35, 1.47, 1.69, 2.48],
    [1.00, 1.28, 1.41, 1.70, 1.85, 2.00],
    [1.00, 1.23, 1.47, 1.68, 2.13, 2.30, 3.33],
    [1.00, 1.10, 1.14, 1.19, 1.52, 1.70, 1.98],
    [1.00, 1.62, 2.07, 2.77, 3.13, 3.63, 5.45, 6.21, 8.32],
    [1.00, 1.45, 1.91, 2.37, 2.96, 3.68, 4.80, 6.05],
    [1.00, 1.37, 1.71, 1.94, 2.23, 2.61],
    [1.00, 1.83, 3.17, 4.67, 7.00, 9.50, 13.3, 17.5],
  ];
  const QS = [807.0, 27.0, 100.0, 57.0, 120.0, 62.0, 58.0, 100.0, 30.0];
  const DN = [0.0, 0.0, 0.059, 0.006, 0.008, 0.009, 0.010, 0.006, 0.009];
  const DISP = [0.044, 0.007, 0.039, 0.014, 0.018, 0.013, 0.014, 0.012, 0.012];
  const ratio = (c, k) => (k < RATIOS[c].length ? RATIOS[c][k] : 0.0);
  const qual = (c, k) => (c === 5 && k === 1 ? 17.0 : QS[c]);
  const NUM_PROBES = 1 + 3 * V + K;

  function voice() {
    const z = () => new Float64Array(M);
    return { state: 0, pending: false, held: false, note: -1, pendNote: 0, pendVel: 0, hz: 0, vel: 0, rel: 0,
      age: 0, pulseEnd: 0, order: 0, pulseN: 1, steal: 0, stealN: 1, fresh: true, lastC: -1, lastLife: 0, lastRoll: 0, lastSplit: 0,
      y1: z(), y2: z(), a1: z(), a2: z(), b0: z(), rr: z(), env: z(), amk: z(), delay: z() };
  }

  class Engine {
    constructor(sr) { this.sr = sr; this.probes = new Float64Array(NUM_PROBES); this.y = new Float64Array(M); this.mode = new Float64Array(K); this.out = new Float64Array(2); this.reset(); }
    reset() { this.voices = Array.from({ length: V }, voice); this.counter = 0; this.probes.fill(0); }
    noteOn(note, velocity) {
      const vs = this.voices; let pick = -1;
      for (let i = 0; i < V && pick < 0; i++) if (vs[i].note === note && (vs[i].state === 1 || vs[i].pending)) pick = i;
      for (let i = 0; i < V && pick < 0; i++) if (vs[i].state === 0 && !vs[i].pending) pick = i;
      if (pick < 0) { pick = 0; for (let i = 1; i < V; i++) if (vs[i].order < vs[pick].order) pick = i; }
      const vo = vs[pick];
      vo.order = ++this.counter; vo.note = note; vo.held = true; vo.pendNote = note; vo.pendVel = velocity;
      if (!vo.pending) {
        if (vo.state === 1) { vo.stealN = Math.max(1, Math.floor(0.003 * this.sr)); vo.steal = vo.stealN; }
        else vo.steal = 0;
      }
      vo.pending = true;
    }
    noteOff(note) { for (const vo of this.voices) if (vo.note === note) vo.held = false; }
    coefs(vo, c, life, roll, split) {
      const sr = this.sr, hz = vo.hz; let am = 1.0;
      for (let k = 0; k < K; k++) {
        const r = ratio(c, k), fo = hz * r, ok = r > 0.0 && fo < sr * 0.45;
        for (let e = 0; e < 2; e++) {
          const j = k + K * e, f = e === 1 ? fo * (1.0 + split) : fo;
          if (ok && f < sr * 0.45) {
            const w = TWOPI * f / sr, R = Math.exp(-MPI * f / (qual(c, k) * life * sr));
            vo.a1[j] = 2.0 * R * Math.cos(w); vo.a2[j] = R * R; vo.b0[j] = am * Math.sin(w); vo.rr[j] = R; vo.amk[j] = am;
          } else { vo.a1[j] = 0; vo.a2[j] = 0; vo.b0[j] = 0; vo.rr[j] = 0; vo.amk[j] = 0; }
        }
        if (ok) am *= roll;
      }
      vo.fresh = false; vo.lastC = c; vo.lastLife = life; vo.lastRoll = roll; vo.lastSplit = split;
    }
    strike(vo, c, v) {
      const sr = this.sr;
      vo.y1.fill(0); vo.y2.fill(0); vo.env.fill(0);
      vo.hz = 440.0 * Math.pow(2.0, (vo.pendNote - 69) / 12.0);
      vo.vel = vo.pendVel; vo.rel = 1.0; vo.age = 0;
      const hard = v[P.hardness] * Math.pow(4.0, -v[P.vel_bright] * (2.0 * vo.vel - 1.0));
      vo.pulseN = Math.max(1, Math.floor(hard * 0.001 * sr));
      vo.state = 1; vo.pending = false;
      const spreadS = v[P.fire] * 0.001 * (DISP[c] / D_DIAMOND);
      let dmax = 0;
      for (let k = 0; k < K; k++) {
        const r = ratio(c, k), d = r > 0.0 ? Math.floor(spreadS * Math.log2(r) * sr) : 0;
        vo.delay[k] = d; vo.delay[k + K] = d; dmax = Math.max(dmax, d);
      }
      vo.pulseEnd = dmax + vo.pulseN; vo.fresh = true;
    }
    step(v) {
      const sr = this.sr, pr = this.probes, y = this.y, mode = this.mode;
      const c = Math.min(Math.max(Math.trunc(v[P.crystal]), 0), 8);
      const s = Math.sin(v[P.angle] * (MPI / 180.0));
      const split = DN[c] * v[P.spread] * (s * s);
      const life = v[P.lifetime], roll = v[P.rolloff], relk = Math.exp(-1.0 / (v[P.release] * sr)), wd = v[P.width];
      pr[0] = split; mode.fill(0);
      let L = 0.0, R = 0.0;
      for (let i = 0; i < V; i++) {
        const vo = this.voices[i];
        if (vo.pending) {
          if (vo.steal > 0) { vo.steal--; if (vo.steal === 0) this.strike(vo, c, v); }
          else this.strike(vo, c, v);
        }
        const fade = vo.steal > 0 ? vo.steal / vo.stealN : 1.0;
        if (vo.state === 1 && (vo.fresh || vo.lastC !== c || vo.lastLife !== life || vo.lastRoll !== roll || vo.lastSplit !== split))
          this.coefs(vo, c, life, roll, split);
        pr[1 + 3 * i] = 0; pr[2 + 3 * i] = 0; pr[3 + 3 * i] = 0;
        if (vo.state === 0) continue;
        const n = vo.pulseN;
        let yo = 0.0, ye = 0.0, loud = 0.0;
        for (let j = 0; j < M; j++) {
          const ip = vo.age - vo.delay[j];
          const x = (ip >= 0.0 && ip < n) ? (1.0 - Math.cos(TWOPI * (ip + 0.5) / n)) / n : 0.0;
          if (ip === 0) vo.env[j] = vo.amk[j];
          y[j] = vo.b0[j] * x + vo.a1[j] * vo.y1[j] - vo.a2[j] * vo.y2[j];
          vo.y2[j] = vo.y1[j]; vo.y1[j] = y[j];
          vo.env[j] = vo.env[j] * vo.rr[j];
        }
        for (let k = 0; k < K; k++) { yo += y[k]; ye += y[k + K]; loud = Math.max(loud, Math.max(vo.env[k], vo.env[k + K])); }
        const g = (1.0 - v[P.velocity] * (1.0 - vo.vel)) * vo.rel * 0.3 * fade;
        L += g * 0.5 * ((1.0 + wd) * yo + (1.0 - wd) * ye);
        R += g * 0.5 * ((1.0 - wd) * yo + (1.0 + wd) * ye);
        for (let k = 0; k < K; k++) mode[k] += g * 0.5 * (vo.env[k] + vo.env[k + K]);
        pr[1 + 3 * i] = vo.hz; pr[2 + 3 * i] = g * loud; pr[3 + 3 * i] = vo.age / sr;
        if (!vo.held) vo.rel *= relk;
        vo.age += 1;
        if (vo.age >= vo.pulseEnd && vo.steal === 0 && !vo.pending && !vo.held && loud * vo.rel < 1e-4) {
          vo.state = 0; vo.y1.fill(0); vo.y2.fill(0); vo.env.fill(0);
        }
      }
      for (let k = 0; k < K; k++) pr[1 + 3 * V + k] = mode[k];
      const gain = Math.pow(10.0, v[P.level] / 20.0);
      this.out[0] = Math.fround(Math.tanh(gain * L)); this.out[1] = Math.fround(Math.tanh(gain * R));
      return this.out;
    }
    readProbes() { return this.probes; }
  }
  return { Engine, IDS, P, DEFAULTS, RATIOS, QS, DN, DISP, V, K, NUM_PROBES };
})();
/*ENGINE-END*/
if (typeof module !== "undefined") module.exports = CE;
