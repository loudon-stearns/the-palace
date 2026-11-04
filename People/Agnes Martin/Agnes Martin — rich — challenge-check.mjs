#!/usr/bin/env node
// Agnes Martin — rich — challenge-check.mjs
// born: 2026-11-04 · links: [[Agnes Martin]] (connects-to · challenge-check) · workshop of the challenge
// forward_vector: I recompute the maker's numbers by my own route: the guesser's rate by exact binomial
// sums written here, not the piece's; the rule's power against model readers on my own simulator; and an
// ideal observer that reads the 8-bit pixels with no grid knowledge, to see what reference survives the
// grid's removal.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
const HERE = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(HERE, 'Agnes Martin — rich — the grid holds still.html'), 'utf8');
const src = html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const ctx = {}; vm.createContext(ctx); vm.runInContext(src + '\nthis.AM = AM;', ctx); const AM = ctx.AM;

// 1. Exact binomial, my own sums (log-gamma free: Pascal's triangle).
const n = 32; const row = [1]; for (let i = 0; i < n; i++) { for (let j = row.length; j > 0; j--) row[j] = (row[j] || 0) + row[j - 1]; }
const p = (k) => row[k] / 2 ** n;
let holds = 0, rev = 0, gate = 0;
for (let g = 0; g <= n; g++) { if (g >= 21) gate += p(g); for (let o = 0; o <= n; o++) { const pr = p(g) * p(o); if (g >= 21 && g - o >= 6) holds += pr; if (o >= 21 && o - g >= 6) rev += pr; } }
console.log(`guesser: half >= 21/32 ${(100*gate).toFixed(3)}%; holds ${(100*holds).toFixed(3)}%; reversed ${(100*rev).toFixed(3)}%; either ${(100*(holds+rev)).toFixed(3)}%`);
// 7 of 8 seen
console.log(`guesser sees one amplitude (>=7/8): ${(100*(9/256)).toFixed(3)}%`);

// 2. Power, my own simulator: cumulative-normal reader (d' grows as (a/alpha)^1.5), not the maker's Weibull.
let s = 12345; const r = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
const Phi = (x) => 0.5 * (1 + Math.tanh(0.7978845608 * (x + 0.044715 * x ** 3)));
const pc = (alpha) => (a) => 0.01 + 0.98 * Phi(0.5 * (a / alpha) ** 1.5 * 1.0); // 2AFC-ish yes/no with no bias
function run(aG, aO, K = 40000) {
  const c = {};
  for (let i = 0; i < K; i++) {
    const tr = [];
    for (const arm of ['grid', 'open']) for (let k = 0; k < 4; k++) for (let j = 0; j < 8; j++) { const present = r() < .5; const right = r() < (arm === 'grid' ? pc(aG) : pc(aO))(AM.LEVELS[k]); tr.push({ arm, level: k, present, said: right ? present : !present }); }
    const v = AM.score(tr).verdict; c[v] = (c[v] || 0) + 1;
  }
  return Object.entries(c).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${(100*v/K).toFixed(1)}%`).join(' · ');
}
for (const [g, o] of [[0.5,0.5],[1,1],[0.35,0.7],[0.25,0.5],[0.5,1],[0.25,1],[0.5,2],[0.12,0.25]]) console.log(`reader alpha grid ${g} / open ${o}: ${run(g, o)}`);

// 3. Ideal observer on the 8-bit pixels, no grid knowledge: per line, per column centroid inside a +-5 px
// window, fit a straight line (its own chord), residual rms. Rules' columns are not skipped: the observer
// doesn't know where they are; we instead take the median-filtered residual.
function q8(img) { const P = 247, I = 42; const out = new Float64Array(img.ink.length); for (let k = 0; k < out.length; k++) out[k] = (P - Math.round(P + (I - P) * img.ink[k])) / (P - I); return out; }
function stat(f, img, dpr) {
  const ink = q8(img), Wd = img.Wd; let worst = 0;
  return f.lines.map((ln) => {
    const xs = [], ys = [];
    const c0 = Math.ceil(ln.x0 * dpr) + 3, c1 = Math.floor((ln.x0 + AM.L) * dpr) - 3;
    const yr = Math.round(ln.y * dpr);
    for (let c = c0; c <= c1; c++) {
      // skip columns whose ink spans the whole window (a vertical rule): the eye sees those as crossings
      let sum = 0, m = 0, filled = 0;
      for (let rr = yr - 5; rr <= yr + 5; rr++) { const v = ink[rr * Wd + c]; sum += v; m += v * rr; if (v > 0.05) filled++; }
      if (sum === 0 || filled > 6) continue;
      xs.push(c); ys.push(m / sum);
    }
    const N = xs.length, mx = xs.reduce((a, b) => a + b) / N, my = ys.reduce((a, b) => a + b) / N;
    let sxy = 0, sxx = 0; for (let i = 0; i < N; i++) { sxy += (xs[i] - mx) * (ys[i] - my); sxx += (xs[i] - mx) ** 2; }
    const b = sxy / sxx; let rs = 0; for (let i = 0; i < N; i++) rs += (ys[i] - my - b * (xs[i] - mx)) ** 2;
    return Math.sqrt(rs / N) / dpr;
  });
}
for (const dpr of [1, 2]) {
  for (const reg of [1, 0]) {
    const res = {};
    for (const a of [0, ...AM.LEVELS]) {
      const v = [];
      for (let sd = 0; sd < 60; sd++) { const f = AM.field(900 + sd, reg, a, (sd * 0.137) % 1); v.push(Math.max(...stat(f, AM.render(f, dpr), dpr))); }
      res[a] = v;
    }
    const thr = Math.max(...res[0]) * 1.0001;
    const line = AM.LEVELS.map((a) => `${a}px: ${res[a].filter((x) => x > thr).length}/60`).join(' · ');
    console.log(`ideal observer, own chord only, dpr ${dpr}, ${reg ? 'grid' : 'no grid'}: straight max ${thr.toFixed(4)} px · fields called drifting ${line}`);
  }
}
// 4. Spacing: nearest neighbour gaps in the scatter vs the grid (references that survive).
{ let mn = 1e9, sum = 0, cnt = 0, nearEdge = 0; for (let sd = 0; sd < 2000; sd++) { const L = AM.layout(sd, 0, 0).lines.map((l) => l.y).sort((a, b) => a - b); for (let i = 1; i < L.length; i++) { const g = L[i] - L[i - 1]; mn = Math.min(mn, g); sum += g; cnt++; } if (L[0] < 30 || L[L.length - 1] > 350) nearEdge++; }
  console.log(`scatter: neighbour gap min ${mn} px, mean ${(sum/cnt).toFixed(1)} px (grid: 32 px); fields with a line within 30 px of the canvas's top or bottom border: ${(100*nearEdge/2000).toFixed(1)}% (grid: nearest line 46 px from the border)`); }
