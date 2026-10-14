// Murmuration — the second reading: flock-as-distribution ("Listen by: density").
//
// The flock is not rendered boid by boid. A fixed 8×5 grid of sustained oscillators sits
// on the wavetable field; each one reads the single waveform under its cell. Every frame
// the flock is smoothed into a density over the field (a Gaussian kernel around each boid,
// wrapped on the torus), and that density is the additive weighting across the wavetable:
// where the flock is thick, that region of the terrain sounds. Spread the flock and many
// regions sound at once; gather it (the attractor) and the pad narrows to one timbre.
//
// Pitch: each cell plays the kernel-weighted mean heading of the boids around it, on the
// same heading→pitch circle as the grains' "order" mapping. Ordered flock → every cell
// agrees → one pitch class across the whole pad. Melted flock → each region its own
// heading → a slowly drifting cluster. The pitch circle is made a real circle with a
// two-octave Shepard pair per cell, so a heading crossing ±180° never jumps an octave.
//
// Startle (third reading, opt-in): a cell also takes the kernel-weighted mean alarm of the
// boids around it and swells by up to 2.5× while they are alarmed — after the power
// normalisation, so the startle is heard as a swell the way it is in the grains.
//
// mapField() and Field are copied into Murmuration.html line for line (check with
// check_page_mapping.js). No Math.random anywhere — the field reading is deterministic.
"use strict";
const E = require("./murmur_engine.js");
const { WIDTH, HEIGHT } = E;
const L = 2048, LMASK = L - 1;

// ---- = FIELD READING block in Murmuration.html ------------------------------------------
const FGX = 8, FGY = 5, FNC = FGX * FGY, FSIG = 80, FSIG2 = 2 * FSIG * FSIG, FSMOOTH = 0.85;
function mapField(boids, mem, startle) {
  if (!mem.D || mem.D.length !== FNC) { mem.D = new Float64Array(FNC); mem.Hx = new Float64Array(FNC); mem.Hy = new Float64Array(FNC); mem.A = new Float64Array(FNC); mem.first = true; }
  const f = new Float32Array(FNC * 4), a = mem.first ? 0 : FSMOOTH;
  let s2 = 0;
  for (let c = 0; c < FNC; c++) {
    const cu = ((c % FGX) + 0.5) / FGX, cv = (((c / FGX) | 0) + 0.5) / FGY, x = cu * WIDTH, y = cv * HEIGHT;
    let d = 0, hx = 0, hy = 0, al = 0;
    for (const b of boids) {
      let dx = b.x - x, dy = b.y - y;
      if (dx > WIDTH * 0.5) dx -= WIDTH; else if (dx < -WIDTH * 0.5) dx += WIDTH;
      if (dy > HEIGHT * 0.5) dy -= HEIGHT; else if (dy < -HEIGHT * 0.5) dy += HEIGHT;
      const k = Math.exp(-(dx * dx + dy * dy) / FSIG2), m = Math.hypot(b.vx, b.vy) || 1;
      d += k; hx += k * b.vx / m; hy += k * b.vy / m; if (startle) al += k * (b.a || 0);
    }
    mem.D[c] = a * mem.D[c] + (1 - a) * d; mem.Hx[c] = a * mem.Hx[c] + (1 - a) * hx; mem.Hy[c] = a * mem.Hy[c] + (1 - a) * hy; if (startle) mem.A[c] = a * mem.A[c] + (1 - a) * al;
    s2 += mem.D[c] * mem.D[c];
  }
  mem.first = false;
  const s = Math.sqrt(s2) || 1;
  for (let c = 0; c < FNC; c++) {
    const k = c * 4, pc = ((Math.atan2(mem.Hy[c], mem.Hx[c]) / (2 * Math.PI) + 0.5) % 1 + 1) % 1;
    f[k] = ((c % FGX) + 0.5) / FGX; f[k + 1] = (((c / FGX) | 0) + 0.5) / FGY; f[k + 2] = mem.D[c] / s * (startle ? 1 + 1.5 * mem.A[c] / (mem.D[c] + 1e-9) : 1); f[k + 3] = pc;
  }
  return f;
}
// ---- end FIELD READING block -------------------------------------------------------------

// = the field branch of GranularProcessor in the page's worklet
class Field {
  constructor(sr) { this.sr = sr; this.cells = []; this.master = 0.7; Object.assign(this, corners()); }
  setField(f, n, base) {
    while (this.cells.length < n) this.cells.push({ tab: null, u: -1, v: -1, pan: 0.5, pc: -1, ph: [0, 0.5], g: [0, 0], t: [0, 0], fq: [0, 0] });
    this.cells.length = n;
    for (let i = 0; i < n; i++) {
      const o = this.cells[i], k = i * 4, u = f[k], v = f[k + 1], amp = f[k + 2], pc = f[k + 3];
      if (u !== o.u || v !== o.v) { o.u = u; o.v = v; o.pan = u; o.tab = new Float32Array(L); for (let j = 0; j < L; j++) { const top = this.TL[j] + u * (this.TR[j] - this.TL[j]), bot = this.BL[j] + u * (this.BR[j] - this.BL[j]); o.tab[j] = top + v * (bot - top); } }
      // the Shepard pair: hi = base·2^(pc−½), lo an octave below; crossing the top of the circle
      // relabels them (new hi = old lo, at the same frequency), so swap phase and level.
      if (o.pc >= 0 && Math.abs(pc - o.pc) > 0.5) { o.ph = [o.ph[1], o.ph[0]]; o.g = [o.g[1], o.g[0]]; }
      o.pc = pc;
      const c = Math.cos(Math.PI * pc * 0.5), sn = Math.sin(Math.PI * pc * 0.5);
      o.t = [amp * c * c, amp * sn * sn];
      o.fq = [base * Math.pow(2, pc - 0.5), base * Math.pow(2, pc - 1.5)];
    }
  }
  process(outL, outR, n) {
    const invSr = 1 / this.sr, norm = this.master;
    for (let s = 0; s < n; s++) { outL[s] = 0; outR[s] = 0; }
    for (const o of this.cells) {
      const pL = Math.cos(o.pan * Math.PI * 0.5) * norm, pR = Math.sin(o.pan * Math.PI * 0.5) * norm, tab = o.tab;
      for (let j = 0; j < 2; j++) {
        const g0 = o.g[j], g1 = o.t[j];
        if (g0 < 1e-4 && g1 < 1e-4) continue;
        let ph = o.ph[j]; const inc = o.fq[j] * invSr, dg = (g1 - g0) / n;
        for (let s = 0; s < n; s++) {
          const idx = ph * L, i0 = idx | 0, fr = idx - i0, smp = (tab[i0] + fr * (tab[(i0 + 1) & LMASK] - tab[i0])) * (g0 + dg * (s + 1));
          outL[s] += smp * pL; outR[s] += smp * pR;
          ph += inc; if (ph >= 1) ph -= 1;
        }
        o.ph[j] = ph;
      }
      o.g = [o.t[0], o.t[1]];
    }
  }
}

function corners() {   // = buildCorners() in the page / murmur_engine.js
  const TL = new Float32Array(L), TR = new Float32Array(L), BL = new Float32Array(L), BR = new Float32Array(L);
  for (let i = 0; i < L; i++) { const ph = i / L, t = ph * 2 * Math.PI; TL[i] = Math.sin(t); TR[i] = 2 * ph - 1; BL[i] = ph < 0.5 ? 1 : -1; BR[i] = 0.6 * Math.sin(t) + 0.4 * Math.sin(2.76 * t) + 0.28 * Math.sin(5.4 * t) + 0.18 * Math.sin(8.93 * t); }
  let mx = 0; for (let i = 0; i < L; i++) mx = Math.max(mx, Math.abs(BR[i])); if (mx > 0) for (let i = 0; i < L; i++) BR[i] /= mx;
  return { TL, TR, BL, BR };
}

module.exports = { FGX, FGY, FNC, mapField, Field };
