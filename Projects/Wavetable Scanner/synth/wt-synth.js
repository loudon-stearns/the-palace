/* =====================================================================
 *  WAVETABLE SYNTH — the scanner's table, played from a keyboard.
 *
 *  One engine, two homes. The browser page runs it inside an AudioWorklet
 *  (the processor source is this file's engineFactory, stringified); Node
 *  runs the same class directly for the offline proofs (prove_synth.cjs).
 *  It is written the way a plugin's processBlock is written, plain state and
 *  a per-sample loop with no Web Audio nodes in it, so the VST template's
 *  Algorithm.h can take it over line for line.
 *
 *  Voice: wavetable osc (1-7 unison copies, detune, stereo spread)
 *         → 12 dB state-variable lowpass (Simper's TPT form)
 *         → amp envelope.
 *  Mod:   a second envelope (to cutoff and to Position), one LFO (to
 *         Position), the mod wheel (to Position), pitch bend, sustain pedal.
 *
 *  Anti-aliasing: every frame is band-limited per octave (buildMips): level
 *  L keeps harmonics up to 512 >> L. A note reads the two levels around its
 *  pitch, blended so the highest harmonic never passes Nyquist and the
 *  timbre never jumps at an octave boundary.
 *
 *  Envelopes follow the Synth Templates standard (vocabulary.yaml, Loudon
 *  2026-11-02: the Minimoog contour generator's RC curve). Each stage is an
 *  exponential approach with tau = T/3, so T is the time to 95 % of the way;
 *  the attack aims at 1 and hands over to the decay after T, as that
 *  project's voice.js does. A card's time words therefore mean the same
 *  seconds here.
 * ===================================================================== */
(function (root) {
  'use strict';
  const FRAME = 1024, LEVELS = 10;   // level L keeps harmonics 1 .. 512 >> L (512, 256, … 1)

  function fft(re, im, inverse) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = (inverse ? 2 : -2) * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const a = i + k, b = a + len / 2;
          const xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
          const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
        }
      }
    }
  }

  /* samples: frames × FRAME floats, end to end. Returns one Float32Array,
     level-major: mips[(L * frames + f) * FRAME + i]. DC is dropped. */
  function buildMips(samples, frames) {
    const out = new Float32Array(LEVELS * frames * FRAME);
    const re = new Float64Array(FRAME), im = new Float64Array(FRAME);
    const sre = new Float64Array(FRAME), sim = new Float64Array(FRAME);
    for (let f = 0; f < frames; f++) {
      for (let i = 0; i < FRAME; i++) { sre[i] = samples[f * FRAME + i]; sim[i] = 0; }
      fft(sre, sim, false);
      for (let L = 0; L < LEVELS; L++) {
        const H = 512 >> L;
        re.fill(0); im.fill(0);
        for (let k = 1; k <= H; k++) {
          const w = k === 512 ? 0.5 : 1;   // the Nyquist bin is its own mirror
          re[k] = sre[k] * w; im[k] = sim[k] * w;
          if (k < 512) { re[FRAME - k] = sre[FRAME - k]; im[FRAME - k] = sim[FRAME - k]; }
        }
        fft(re, im, true);
        const base = (L * frames + f) * FRAME;
        for (let i = 0; i < FRAME; i++) out[base + i] = re[i] / FRAME;
      }
    }
    return out;
  }

  /* ------------------------------------------------------------------ */
  function engineFactory() {
    const FRAME = 1024, LEVELS = 10, MAXV = 8, MAXU = 7, CTRL = 16;
    const DEFAULTS = {
      position: 0, wheelToPos: 1, lfoRate: 0.2, lfoToPos: 0, envToPos: 0,
      unison: 1, detune: 12, spread: 0.6,
      cutoff: 16000, reso: 0.1, envToCutoff: 0, keytrack: 0,
      aA: 0.0154, aD: 0.575, aS: 1, aR: 0.0986,       // fast · medium · held · short
      mA: 0.00488, mD: 0.575, mS: 0, mR: 0.575,       // instant · medium · zero · medium
      mode: 0, glide: 0, bendRange: 2, velToAmp: 0.6, gain: 0.35,
    };
    const coef = (T, sr) => 1 - Math.exp(-3 / (Math.max(T, 0.0005) * sr));   // tau = T/3

    class Env {
      constructor() { this.v = 0; this.stage = 0; this.t = 0; }       // 0 idle 1 attack 2 decay/sustain 3 release
      gate(on) { if (on) { this.stage = 1; this.t = 0; } else if (this.stage) this.stage = 3; }
      tick(A, D, S, R, sr) {
        switch (this.stage) {
          case 1: this.v += (1 - this.v) * coef(A, sr); if (++this.t >= A * sr) this.stage = 2; break;
          case 2: this.v += (S - this.v) * coef(D, sr); break;
          case 3: this.v += (0 - this.v) * coef(R, sr); if (this.v < 1e-5) { this.v = 0; this.stage = 0; } break;
        }
        return this.v;
      }
    }

    class Voice {
      constructor() {
        this.note = -1; this.gateOn = false; this.held = false; this.age = 0; this.vel = 1;
        this.cur = 60; this.target = 60;
        this.phase = new Float64Array(MAXU); this.amp = new Env(); this.mod = new Env();
        this.f = [[0, 0], [0, 0]];   // per channel: ic1eq, ic2eq
      }
      get active() { return this.amp.stage !== 0; }
    }

    class Engine {
      constructor(sr) {
        this.sr = sr; this.p = Object.assign({}, DEFAULTS);
        this.voices = Array.from({ length: MAXV }, () => new Voice());
        this.mips = null; this.frames = 0;
        this.wheel = 0; this.bend = 0; this.sustain = false; this.lfoPh = 0;
        this.stack = []; this.clock = 0; this.seed = 1; this.lastPos = 0;
      }
      rand() { this.seed = (this.seed * 1664525 + 1013904223) >>> 0; return this.seed / 4294967296; }
      setTable(mips, frames) { this.mips = mips; this.frames = frames; }
      set(name, v) { if (name in this.p) this.p[name] = v; }
      setAll(o) { for (const k in o) this.set(k, o[k]); }

      start(v, note, vel, retrigger) {
        v.note = note; v.target = note; v.vel = vel; v.gateOn = true; v.held = false; v.age = ++this.clock;
        if (!v.active) { v.cur = note; for (let u = 0; u < MAXU; u++) v.phase[u] = u ? this.rand() : 0; v.f = [[0, 0], [0, 0]]; }
        if (retrigger) { v.amp.gate(true); v.mod.gate(true); }
      }
      noteOn(note, vel) {
        if (vel <= 0) return this.noteOff(note);
        vel = vel / 127;
        if (this.p.mode > 0) {                       // 1 mono (retrigger) · 2 legato
          this.stack = this.stack.filter(n => n !== note); this.stack.push(note);
          const v = this.voices[0], legato = this.p.mode === 2 && v.gateOn;
          if (this.p.glide <= 0 || !v.active) v.cur = note;
          this.start(v, note, vel, !legato); if (this.p.glide <= 0) v.cur = note;
          return;
        }
        let v = this.voices.find(x => x.note === note && x.active)
             || this.voices.find(x => !x.active)
             || this.voices.reduce((a, b) => (b.age < a.age ? b : a));
        this.start(v, note, vel, true); v.cur = note;
      }
      noteOff(note) {
        if (this.p.mode > 0) {
          this.stack = this.stack.filter(n => n !== note);
          const v = this.voices[0];
          if (v.note !== note) return;
          if (this.stack.length) { const n = this.stack[this.stack.length - 1]; this.start(v, n, v.vel, this.p.mode === 1); if (this.p.glide <= 0) v.cur = n; return; }
          if (this.sustain) { v.held = true; return; }
          v.gateOn = false; v.amp.gate(false); v.mod.gate(false); return;
        }
        for (const v of this.voices) if (v.note === note && v.gateOn) {
          if (this.sustain) { v.held = true; continue; }
          v.gateOn = false; v.amp.gate(false); v.mod.gate(false);
        }
      }
      cc(n, val) {
        if (n === 1) this.wheel = val / 127;
        else if (n === 64) { this.sustain = val >= 64; if (!this.sustain) for (const v of this.voices) if (v.held) { v.held = false; v.gateOn = false; v.amp.gate(false); v.mod.gate(false); } }
        else if (n === 74) this.p.cutoff = 20 * Math.pow(1000, val / 127);
        else if (n === 120 || n === 123) this.allOff(n === 120);
      }
      pitchBend(x) { this.bend = x; }                // −1 .. 1
      allOff(hard) { this.stack = []; for (const v of this.voices) { v.gateOn = false; v.held = false; if (hard) { v.amp.stage = 0; v.amp.v = 0; v.note = -1; } else { v.amp.gate(false); v.mod.gate(false); } } }

      /* read one sample: frame position fp (0 .. frames−1), phase ph (0..1), level pair (L0, w) */
      read(fp, ph, L0, w) {
        const F = this.frames, m = this.mips;
        const fa = fp | 0, fb = fa + 1 < F ? fa + 1 : fa, ff = fp - fa;
        const x = ph * FRAME, i0 = x | 0, i1 = (i0 + 1) & (FRAME - 1), xf = x - i0;
        const L1 = L0 + 1 < LEVELS ? L0 + 1 : L0;
        const a0 = (L0 * F + fa) * FRAME, b0 = (L0 * F + fb) * FRAME, a1 = (L1 * F + fa) * FRAME, b1 = (L1 * F + fb) * FRAME;
        const s0a = m[a0 + i0] + (m[a0 + i1] - m[a0 + i0]) * xf, s0b = m[b0 + i0] + (m[b0 + i1] - m[b0 + i0]) * xf;
        const s1a = m[a1 + i0] + (m[a1 + i1] - m[a1 + i0]) * xf, s1b = m[b1 + i0] + (m[b1 + i1] - m[b1 + i0]) * xf;
        const s0 = s0a + (s0b - s0a) * ff, s1 = s1a + (s1b - s1a) * ff;
        return s0 + (s1 - s0) * w;
      }

      render(outL, outR, n) {
        outL.fill(0); outR.fill(0);
        if (!this.mips) return;
        const p = this.p, sr = this.sr, F = this.frames, nyq = sr / 2;
        const U = Math.max(1, Math.min(MAXU, p.unison | 0)), uNorm = 1 / Math.sqrt(U);
        const glideK = p.glide > 0 ? coef(p.glide, sr) : 1;
        const k = 2 - 1.96 * Math.min(1, Math.max(0, p.reso));
        const lfoInc = p.lfoRate / sr;
        for (const v of this.voices) {
          if (!v.active) continue;
          let g = 0, a1 = 0, a2 = 0, a3 = 0, L0 = 0, w = 0;
          const det = new Float64Array(U), panL = new Float64Array(U), panR = new Float64Array(U);
          for (let u = 0; u < U; u++) {
            const s = U > 1 ? u / (U - 1) * 2 - 1 : 0;
            det[u] = Math.pow(2, s * p.detune / 1200);
            const pan = s * p.spread; panL[u] = Math.sqrt((1 - pan) / 2) * uNorm * 1.414; panR[u] = Math.sqrt((1 + pan) / 2) * uNorm * 1.414;
          }
          let lfoPh = this.lfoPh;
          for (let i = 0; i < n; i++) {
            v.cur += (v.target - v.cur) * glideK;
            const ea = v.amp.tick(p.aA, p.aD, p.aS, p.aR, sr);
            const em = v.mod.tick(p.mA, p.mD, p.mS, p.mR, sr);
            const hz = 440 * Math.pow(2, (v.cur + this.bend * p.bendRange - 69) / 12);
            if ((i & (CTRL - 1)) === 0) {
              const lam = Math.max(0, Math.log2(512 * hz * (U > 1 ? Math.pow(2, p.detune / 1200) : 1) / nyq));
              L0 = Math.min(LEVELS - 1, Math.ceil(lam)); w = L0 === 0 ? 0 : Math.min(1, lam - (L0 - 1));
              if (lam === 0) { L0 = 0; w = 0; }
              let fc = p.cutoff * Math.pow(2, p.envToCutoff * em + p.keytrack * (v.cur - 60) / 12);
              fc = Math.min(Math.max(fc, 20), nyq * 0.9);
              g = Math.tan(Math.PI * fc / sr); a1 = 1 / (1 + g * (g + k)); a2 = g * a1; a3 = g * a2;
            }
            let pos = p.position + this.wheel * p.wheelToPos + p.lfoToPos * Math.sin(2 * Math.PI * lfoPh) * 0.5 + p.envToPos * em;
            pos = pos < 0 ? 0 : pos > 1 ? 1 : pos;
            const fp = pos * (F - 1);
            let l = 0, r = 0;
            const inc = hz / sr;
            for (let u = 0; u < U; u++) {
              const s = this.read(fp, v.phase[u], L0, w);
              l += s * panL[u]; r += s * panR[u];
              v.phase[u] += inc * det[u]; if (v.phase[u] >= 1) v.phase[u] -= 1;
            }
            const lv = this.svf(v.f[0], l, a1, a2, a3), rv = this.svf(v.f[1], r, a1, a2, a3);
            const amp = ea * (1 - p.velToAmp + p.velToAmp * v.vel) * p.gain;
            outL[i] += lv * amp; outR[i] += rv * amp;
            lfoPh += lfoInc; if (lfoPh >= 1) lfoPh -= 1;
            if (i === n - 1) this.lastPos = pos;
          }
          if (!v.active) v.note = -1;
        }
        this.lfoPh = (this.lfoPh + lfoInc * n) % 1;
        if (!this.voices.some(v => v.active)) {
          const pos = p.position + this.wheel * p.wheelToPos + p.lfoToPos * Math.sin(2 * Math.PI * this.lfoPh) * 0.5;
          this.lastPos = Math.min(1, Math.max(0, pos));
        }
        for (let i = 0; i < n; i++) { outL[i] = Math.tanh(outL[i]); outR[i] = Math.tanh(outR[i]); }
      }
      svf(st, x, a1, a2, a3) {
        const v3 = x - st[1], v1 = a1 * st[0] + a2 * v3, v2 = st[1] + a2 * st[0] + a3 * v3;
        st[0] = 2 * v1 - st[0]; st[1] = 2 * v2 - st[1];
        return v2;
      }
    }
    Engine.DEFAULTS = DEFAULTS;
    return Engine;
  }

  /* The AudioWorklet source: the engine plus a thin processor that turns
     port messages into engine calls and posts back where Position is. */
  const PROCESSOR_SRC = `
const Engine = (${engineFactory.toString()})();
class WTSynthProcessor extends AudioWorkletProcessor {
  constructor() {
    super(); this.e = new Engine(sampleRate); this.tick = 0;
    this.port.onmessage = ({ data: m }) => {
      const e = this.e;
      if (m.t === 'table') e.setTable(m.mips, m.frames);
      else if (m.t === 'set') e.set(m.k, m.v);
      else if (m.t === 'on') e.noteOn(m.n, m.v);
      else if (m.t === 'off') e.noteOff(m.n);
      else if (m.t === 'cc') e.cc(m.n, m.v);
      else if (m.t === 'bend') e.pitchBend(m.v);
      else if (m.t === 'panic') e.allOff(true);
    };
  }
  process(_in, out) {
    const o = out[0]; this.e.render(o[0], o[1] || o[0], o[0].length);
    if (++this.tick % 8 === 0) this.port.postMessage({ pos: this.e.lastPos, voices: this.e.voices.filter(v => v.active).map(v => v.note) });
    return true;
  }
}
registerProcessor('wt-synth', WTSynthProcessor);`;

  const api = { buildMips, engineFactory, PROCESSOR_SRC, FRAME, LEVELS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.WTSynth = api;
})(typeof window !== 'undefined' ? window : globalThis);
