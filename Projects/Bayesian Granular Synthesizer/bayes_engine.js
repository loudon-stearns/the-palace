/*ENGINE-START*/
// The Bayesian grain cloud, rebuilt from the entry's spec (the V8 code was
// never pulled out of the 2026-05-08 chat, so this is a reconstruction, not
// the original). One engine runs both the offline render and the playable page.
//
//   prior      a paintable curve over pitch (10-cent bins, A1..C7). Default flat.
//   evidence   each held note is a Gaussian bump in log-frequency. Its weight w
//              rises fast on press and falls slowly on release; its width sigma
//              narrows from ~120 cents toward a 5-cent floor while held (exponential
//              in log-cents) and blurs back out after release.
//   posterior  doubt * prior + sum of the bumps, normalized. Every grain draws
//              its pitch from it: first pick prior or a note in proportion to
//              mass, then draw inside that component.
//   length     grains near a believed note grow long and pure, far ones stay
//              short and clicky: cycles = nMin * (nMax/nMin)^(closeness * gate),
//              where gate = the nearest note's weight * its conviction, so the
//              coupling fades in with the evidence (the chord-press click fix).
//   envelope   1-cycle Hann in, N sustain cycles, 1-cycle Hann out.
//   level      amplitude ∝ sqrt(f / cycles): every grain carries equal energy,
//              so long low grains do not swamp the mix.
//   timing     onsets are a Poisson process at `rate` grains per second.
//   prior tone (added 2026-10-14, cycle 3) the prior's own peaks may also
//              lengthen grains, so a painted resting belief can sound tonal
//              before any note is held. tone(bin) = ((p - mean)/(max - mean))^toneCurve,
//              clamped to 0..1, zero for a flat prior; the length exponent
//              becomes max(evidence gate, priorTone * tone(bin)). priorTone = 0
//              is the instrument exactly as before.
class BeliefCloud {
  constructor(sr) {
    this.sr = sr;
    this.lo = 33; this.hi = 96; this.binC = 10;                 // MIDI A1..C7, 10-cent bins
    this.B = Math.round((this.hi - this.lo) * 100 / this.binC);
    this.prior = new Float64Array(this.B).fill(1); this.cdf = new Float64Array(this.B);
    this.tone = new Float64Array(this.B); this.priorTone = 0; this.toneCurve = 1;
    this.priorDirty = true;
    this.doubt = 0.25;        // prior mass against each fully believed note's 1.0
    this.tauOn = 0.08;        // s, weight attack
    this.tauOff = 1.4;        // s, weight release
    this.tauFocus = 1.6;      // s, sigma narrowing while held
    this.tauBlur = 0.7;       // s, sigma widening after release
    this.sigWide = 120; this.sigFloor = 5;                      // cents
    this.near = 35;           // cents, how close counts as "near a note" for length
    this.nMin = 4; this.nMax = 128;
    this.rate = 160;          // grains per second
    this.spread = 0.7;        // stereo
    this.vol = 0.8;
    this.notes = new Map();   // midi -> {w, sig, held}
    this.s = 12345;
    // voices
    this.MAXV = 640; const M = this.MAXV;
    this.vPh = new Float64Array(M); this.vInc = new Float64Array(M); this.vPos = new Int32Array(M);
    this.vLen = new Int32Array(M); this.vFade = new Int32Array(M); this.vAmp = new Float64Array(M);
    this.vL = new Float64Array(M); this.vR = new Float64Array(M); this.nv = 0;
    this.next = 0; this.ctl = 0; this.CTL = 64;
    this.dropped = 0;
    // sine table
    this.TN = 4096; this.tab = new Float64Array(this.TN + 1);
    for (let i = 0; i <= this.TN; i++) this.tab[i] = Math.sin(2 * Math.PI * i / this.TN);
    // recent grains for drawing: [midi, cycles, age]
    this.GR = 256; this.gM = new Float32Array(this.GR); this.gN = new Float32Array(this.GR); this.gT = new Float64Array(this.GR); this.gw = 0;
    this.clock = 0; this.meanCycles = this.nMin;
  }
  rand() { let t = (this.s += 0x6D2B79F5); t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  gauss() { let u = 0; while (u === 0) u = this.rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * this.rand()); }

  // ---- belief
  noteOn(m) { const n = this.notes.get(m); if (n) n.held = true; else this.notes.set(m, { w: 0, sig: this.sigWide, held: true }); }
  noteOff(m) { const n = this.notes.get(m); if (n) n.held = false; }
  allOff() { for (const n of this.notes.values()) n.held = false; }
  setPrior(arr) { for (let i = 0; i < this.B; i++) this.prior[i] = Math.max(0, arr[i]); this.priorDirty = true; }
  binMidi(i) { return this.lo + (i + 0.5) * this.binC / 100; }
  buildCdf() { let a = 0, mx = 0; for (let i = 0; i < this.B; i++) { a += this.prior[i]; this.cdf[i] = a; if (this.prior[i] > mx) mx = this.prior[i]; } this.priorSum = a; this.priorDirty = false;
    const mean = a / this.B;
    for (let i = 0; i < this.B; i++) { let t = 0; if (mx > mean * 1.05) { t = Math.pow(Math.max(0, Math.min(1, (this.prior[i] - mean) / (mx - mean))), this.toneCurve); } this.tone[i] = t; } }
  // the painter's rule, shared with RNBO/paint-in.codebox: one weight per semitone
  // (MIDI 33..96), each a Gaussian hill `width` cents wide, cut off at 3 semitones,
  // on a small floor.
  static paintedPrior(semis, B = 630, width = 20, floor = 0.02) {
    const out = new Float64Array(B);
    for (let i = 0; i < B; i++) {
      const m = 33 + (i + 0.5) / 10; let v = floor;
      for (let k = Math.max(0, Math.floor(m - 33) - 3); k <= Math.min(63, Math.floor(m - 33) + 3); k++) {
        const d = (m - (33 + k)) * 100 / width; if (Math.abs(m - (33 + k)) < 3) v += semis[k] * Math.exp(-0.5 * d * d);
      }
      out[i] = v;
    }
    return out;
  }
  evolve(dt) {
    const kOn = 1 - Math.exp(-dt / this.tauOn), dOff = Math.exp(-dt / this.tauOff);
    const kF = 1 - Math.exp(-dt / this.tauFocus), kB = 1 - Math.exp(-dt / this.tauBlur);
    const lw = Math.log(this.sigWide), lf = Math.log(this.sigFloor);
    for (const [m, n] of this.notes) {
      let ls = Math.log(n.sig);
      if (n.held) { n.w += (1 - n.w) * kOn; ls += (lf - ls) * kF; }
      else { n.w *= dOff; ls += (lw - ls) * kB; if (n.w < 1e-3) { this.notes.delete(m); continue; } }
      n.sig = Math.exp(ls);
    }
  }
  conviction(n) { return Math.max(0, Math.min(1, (Math.log(this.sigWide) - Math.log(n.sig)) / (Math.log(this.sigWide) - Math.log(this.sigFloor)))); }
  // posterior density per bin (sums to 1 over bins) into out[B]
  posterior(out) {
    if (this.priorDirty) this.buildCdf();
    let Z = this.doubt; for (const n of this.notes.values()) Z += n.w;
    const pm = this.priorSum > 0 ? this.doubt / Z / this.priorSum : 0;
    for (let i = 0; i < this.B; i++) out[i] = this.prior[i] * pm;
    for (const [m, n] of this.notes) {
      const sm = n.sig / 100, a = (n.w / Z) * (this.binC / 100) / (sm * Math.sqrt(2 * Math.PI));
      const i0 = Math.max(0, Math.floor((m - 5 * sm - this.lo) * 100 / this.binC)), i1 = Math.min(this.B - 1, Math.ceil((m + 5 * sm - this.lo) * 100 / this.binC));
      for (let i = i0; i <= i1; i++) { const d = (this.binMidi(i) - m) / sm; out[i] += a * Math.exp(-0.5 * d * d); }
    }
    return out;
  }
  // ---- one grain
  draw() {
    if (this.priorDirty) this.buildCdf();
    let Z = this.doubt; for (const n of this.notes.values()) Z += n.w;
    let u = this.rand() * Z, midi;
    if (u < this.doubt || this.notes.size === 0) {
      if (this.priorSum <= 0) return null;
      const t = this.rand() * this.priorSum; let a = 0, b = this.B - 1;
      while (a < b) { const c = (a + b) >> 1; if (this.cdf[c] < t) a = c + 1; else b = c; }
      midi = this.lo + (a + this.rand()) * this.binC / 100;
    } else {
      u -= this.doubt; let pick = null;
      for (const [m, n] of this.notes) { pick = [m, n]; if (u < n.w) break; u -= n.w; }
      midi = pick[0] + this.gauss() * pick[1].sig / 100;
    }
    // nearest believed note → length
    let best = 0;
    for (const [m, n] of this.notes) {
      const d = (midi - m) * 100 / this.near, close = Math.exp(-0.5 * d * d);
      const g = close * n.w * this.conviction(n); if (g > best) best = g;
    }
    const bi = Math.floor((midi - this.lo) * 100 / this.binC);
    if (bi >= 0 && bi < this.B) { const tt = this.priorTone * this.tone[bi]; if (tt > best) best = tt; }
    const cycles = this.nMin * Math.pow(this.nMax / this.nMin, best);
    return { midi, cycles };
  }
  spawn() {
    const g = this.draw(); if (!g) return;
    if (this.nv >= this.MAXV) { this.dropped++; return; }
    const f = 440 * Math.pow(2, (g.midi - 69) / 12), sr = this.sr;
    if (f > sr * 0.45) return;
    const cyc = sr / f, v = this.nv++;
    this.vPh[v] = this.rand(); this.vInc[v] = f / sr; this.vPos[v] = 0;
    this.vFade[v] = Math.max(2, Math.round(cyc)); this.vLen[v] = Math.round(cyc * (g.cycles + 2));
    // equal energy: A^2 * duration constant  →  A ∝ sqrt(f / cycles)
    this.vAmp[v] = Math.sqrt(0.06 / this.rate) * Math.sqrt(f / (g.cycles + 1));
    const p = 0.5 + this.spread * (this.rand() - 0.5);
    this.vL[v] = Math.cos(p * Math.PI / 2); this.vR[v] = Math.sin(p * Math.PI / 2);
    const k = this.gw++ % this.GR; this.gM[k] = g.midi; this.gN[k] = g.cycles; this.gT[k] = this.clock;
    this.meanCycles += 0.02 * (g.cycles - this.meanCycles);
  }
  // ---- audio
  process(L, R, n) {
    const tab = this.tab, TN = this.TN, sr = this.sr;
    for (let i = 0; i < n; i++) { L[i] = 0; R[i] = 0; }
    let i = 0;
    while (i < n) {
      if (this.ctl <= 0) { this.evolve(this.CTL / sr); this.ctl = this.CTL; }
      // next event: grain onset or control tick
      const run = Math.min(n - i, this.ctl, Math.max(1, Math.ceil(this.next)));
      for (let v = 0; v < this.nv; v++) {
        let ph = this.vPh[v], pos = this.vPos[v]; const inc = this.vInc[v], len = this.vLen[v], fd = this.vFade[v];
        const a = this.vAmp[v], gl = a * this.vL[v], gr = a * this.vR[v];
        const m = Math.min(run, len - pos);
        for (let k = 0; k < m; k++, pos++) {
          let e = 1;
          if (pos < fd) e = 0.5 - 0.5 * Math.cos(Math.PI * pos / fd);
          else if (pos > len - fd) e = 0.5 - 0.5 * Math.cos(Math.PI * (len - pos) / fd);
          const x = ph * TN, j = x | 0, s = tab[j] + (tab[j + 1] - tab[j]) * (x - j);
          ph += inc; if (ph >= 1) ph -= 1;
          L[i + k] += s * e * gl; R[i + k] += s * e * gr;
        }
        this.vPh[v] = ph; this.vPos[v] = pos;
      }
      // retire finished voices
      for (let v = 0; v < this.nv; v++) if (this.vPos[v] >= this.vLen[v]) {
        const w = --this.nv;
        this.vPh[v] = this.vPh[w]; this.vInc[v] = this.vInc[w]; this.vPos[v] = this.vPos[w]; this.vLen[v] = this.vLen[w];
        this.vFade[v] = this.vFade[w]; this.vAmp[v] = this.vAmp[w]; this.vL[v] = this.vL[w]; this.vR[v] = this.vR[w]; v--;
      }
      i += run; this.ctl -= run; this.next -= run; this.clock += run / sr;
      while (this.next <= 0) { this.spawn(); let u = this.rand(); if (u < 1e-12) u = 1e-12; this.next += -Math.log(u) / this.rate * sr; }
    }
    const vol = this.vol;
    for (let k = 0; k < n; k++) { L[k] = Math.tanh(L[k] * vol); R[k] = Math.tanh(R[k] * vol); }
  }
}
/*ENGINE-END*/
if (typeof module !== "undefined") module.exports = { BeliefCloud };
