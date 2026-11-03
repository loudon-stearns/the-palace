// title: DSP in Looping Dimensions — rich — checks
// born: 2026-11-03
// links: [[DSP in Looping Dimensions]] (connects-to · rich-face-workshop) · re-checks the three made pieces listed in [[DSP in Looping Dimensions — rich.json]]
// forward_vector: I re-run every number the three made pieces and the manifest's offers state, on each piece's own engine (its <script id="engine">), so a challenger or a re-tune can check them without a browser. Run: node "DSP in Looping Dimensions — rich — checks.mjs" (a few seconds).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const engine = (what, names) => { const s = readFileSync(join(here, `DSP in Looping Dimensions — rich — ${what}.html`), 'utf8'); const m = s.match(/<script id="engine">([\s\S]*?)<\/script>/); return new Function(`${m[1]}; return { ${names} };`)(); };
const FS = 48000;

// ── snap or slide: coupled plucked loops ──
{ const E = engine('snap or slide', 'PHI, renderLoops, sumLoop, power, offSeries, change, decay'), N = 32768, FMAX = 1000;
  const at = (o) => E.power(E.renderLoops({ fs: FS, dur: N / FS + 0.01, ...o }), 0, N);
  console.log('snap or slide — steepest notch of each reading, and the same notch halved and quartered (a slide gives 0.50, 0.25)');
  for (const [rn, ratio] of [['golden', E.PHI], ['√2', Math.SQRT2], ['π/2', Math.PI / 2]]) for (const f1 of [220, 330]) for (const mixer of ['crossfeed', 'lossless']) {
    const S = E.sumLoop(f1, ratio, mixer), off = (p) => E.offSeries(p, FS, N, S.f0, S.odd, 30, FMAX), P = [], v = [];
    for (let i = 0; i <= 100; i++) { P.push(at({ f1, ratio, c: i / 100, mixer })); v.push(off(P[i])); }
    let b = 0, bi = 0, w = 0, wi = 0; for (let i = 0; i < 100; i++) { const d = Math.abs(v[i + 1] - v[i]); if (d > b) { b = d; bi = i; } const ch = E.change(P[i], P[i + 1], FS, N, FMAX); if (ch > w) { w = ch; wi = i; } }
    const h = (c, x) => Math.abs(off(at({ f1, ratio, c, mixer })) - v[bi]) / b, k = (c) => E.change(P[wi], at({ f1, ratio, c, mixer }), FS, N, FMAX) / w;
    console.log(`  ${rn.padEnd(6)} ${f1} Hz ${mixer.padEnd(9)} distance ${v[0].toFixed(2)} → ${v[100].toFixed(2)} · steepest at c=${(bi / 100).toFixed(2)}: ×${h(bi / 100 + 0.005).toFixed(2)}, ×${h(bi / 100 + 0.0025).toFixed(2)} · biggest change at c=${(wi / 100).toFixed(2)}: ×${k(wi / 100 + 0.005).toFixed(2)}, ×${k(wi / 100 + 0.0025).toFixed(2)}`);
  }
  for (const mixer of ['crossfeed', 'lossless']) console.log(`  decay to −60 dB, golden 220 Hz, ${mixer}:`, [0, 0.1, 0.3, 0.5, 0.9, 1].map((c) => `c=${c} ${E.decay(E.renderLoops({ fs: FS, dur: 3, f1: 220, c, mixer }), FS).toFixed(2)} s`).join(' · '));
  const f1 = 220, f2 = f1 / E.PHI, roots = (th) => { const S = 1 / f1 + 1 / f2, D = 1 / f2 - 1 / f1, o = []; let pr = null; for (let f = 0.01; f < FMAX; f += 0.005) { const g = Math.cos(Math.PI * f * S) - Math.cos(th) * Math.cos(Math.PI * f * D); if (pr !== null && Math.sign(g) !== Math.sign(pr)) o.push(f); pr = g; } return o; };
  let worst = 0; for (const c of [0.1, 0.25, 0.5, 0.75, 0.9]) { const p = at({ f1, c, mixer: 'lossless' }), R = roots(c * Math.PI / 2); let top = 0; for (let i = 1; i < FMAX * N / FS; i++) top = Math.max(top, p[i]);
    for (let i = 2; i < FMAX * N / FS; i++) if (p[i] > 1e-3 * top && p[i] >= p[i - 1] && p[i] > p[i + 1] && i * FS / N > 30) { const a = Math.log(p[i - 1]), bb = Math.log(p[i]), cc = Math.log(p[i + 1]), f = (i + 0.5 * (a - cc) / (a - 2 * bb + cc)) * FS / N; worst = Math.max(worst, Math.min(...R.map((r) => Math.abs(r - f)))); } }
  console.log(`  lossless modes against cos(πf(T₁+T₂)) = cos(c·π/2)·cos(πf(T₂−T₁)), c 0.1…0.9: worst strong peak ${worst.toFixed(3)} Hz off`);
}
// ── two combs: where the lines fall ──
{ const E = engine('two combs', 'PHI, comb, noise, impulse, scan, welch, latticePoints, standOut, rng, SURF'), f1 = 220, f2 = 220 / E.PHI, T1 = 1 / f1, T2 = 1 / f2, N = 16384, lo = 60, hi = 1500;
  const py = E.welch(E.comb(E.comb(E.noise(FS * 6, 3), T1, 0.95, FS), T2, 0.95, FS), N), ps = E.welch(E.scan(f1, f2, 6, FS), N), L = E.latticePoints(f1, f2, lo, hi, 6), r = E.rng(21), rand = Array.from({ length: 400 }, () => ({ f: lo + r() * (hi - lo) }));
  const own = E.latticePoints(f1, f2, lo, hi, 3).mixed.filter((q) => E.SURF.some((s) => (s.m === q.m && s.n === q.n) || (s.m === -q.m && s.n === -q.n))), so = (p, pts) => E.standOut(p, FS, N, pts, 1.5, lo, hi).median.toFixed(1);
  console.log(`two combs — dB above the median bin, 60–1500 Hz: combs · two series ${so(py, L.axis)}, ${L.mixed.length} mixed points ${so(py, L.mixed)}, the surface's ${own.length} mixed points ${so(py, own)}, 400 random ${so(py, rand)} · scan · the same ${own.length} ${so(ps, own)}`);
  const h = E.comb(E.comb(E.impulse(Math.round(FS * 0.04)), T1, 0.8, FS), T2, 0.8, FS), ech = []; for (let n = 1; n < h.length - 1; n++) if (Math.abs(h[n]) > 0.05 && Math.abs(h[n]) >= Math.abs(h[n - 1]) && Math.abs(h[n]) >= Math.abs(h[n + 1])) ech.push(n / FS);
  const pred = []; for (let j = 0; j < 9; j++) for (let k = 0; k < 9; k++) { const t = j * T1 + k * T2; if (t > 0 && t < 0.04) pred.push(t); }
  console.log(`  echoes: ${ech.length} found, ${pred.length} predicted at j·T₁ + k·T₂ under 40 ms, worst miss ${(1000 * Math.max(...ech.map((t) => Math.min(...pred.map((p) => Math.abs(p - t)))))).toFixed(3)} ms`);
}
// ── listen longer: a dense lattice against noise ──
{ const E = engine('listen longer', 'tone, noise, topAt'), ns = [1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144];
  console.log('listen longer — % of 100–4000 Hz energy in the loudest tenth of bins, windows', ns.map((n) => (1000 * n / FS).toFixed(0) + ' ms').join(' '));
  const nz = E.noise(6, FS, 5); console.log('  noise   ', ns.map((n) => (100 * E.topAt(nz, FS, n, 100, 4000)).toFixed(1)).join(' '));
  for (let L = 1; L <= 6; L++) { const t = E.tone(L, 220, 6, FS); console.log(`  loops ${L} `, ns.map((n) => (100 * E.topAt(t, FS, n, 100, 4000)).toFixed(1)).join(' ')); }
}
// ── the Honest Limit's density offer: the nearest m·220 + n·220φ to 300 Hz ──
{ const P = (1 + Math.sqrt(5)) / 2; const out = [20, 100, 1000].map((K) => { let best = Infinity; for (let m = -K; m <= K; m++) { const n = Math.round((300 - m * 220) / (220 * P)); if (Math.abs(n) <= K) best = Math.min(best, Math.abs(m * 220 + n * 220 * P - 300)); } return `whole numbers up to ${K}: ${best.toFixed(3)} Hz`; });
  console.log('density — nearest lattice frequency to 300 Hz,', out.join(' · ')); }
// ── the Honest Limit's listening offer: lines in the six-loop tone, 100–4000 Hz, above an absolute amplitude of 10⁻³ (36 dB below the loudest line), against the bins of a 5.5 s window ──
{ const P = (1 + Math.sqrt(5)) / 2, R = [1, P, 1.324717957244746, (1 + Math.SQRT2) / 2, Math.sqrt(3), Math.PI / 2].map((r) => 220 * r), B = 2;
  const J = (m, x) => { let s = 0; const n = 400; for (let i = 0; i < n; i++) { const t = ((i + 0.5) / n) * Math.PI; s += Math.cos(m * t - x * Math.sin(t)); } return s / n; };
  let strong = 0, loud = 0; for (let k = 1; k <= 5; k++) { const x = k * B, M = Math.ceil(x + 6), Jt = []; for (let m = -M; m <= M; m++) Jt.push(J(m, x)); let lines = [{ f: k * R[0], a: 1 / Math.sqrt(k) }];
    for (let i = 1; i < 6; i++) { const nx = []; for (const l of lines) for (let m = -M; m <= M; m++) { const a = l.a * Jt[m + M]; if (Math.abs(a) >= 1e-4) nx.push({ f: l.f + m * R[i], a }); } lines = nx; }
    for (const l of lines) { const f = Math.abs(l.f); if (f >= 100 && f <= 4000) { loud = Math.max(loud, Math.abs(l.a)); if (Math.abs(l.a) > 1e-3) strong++; } } }
  console.log(`lines — six loops, β = 2: ${strong} lines above 10⁻³, ${(20 * Math.log10(loud / 1e-3)).toFixed(1)} dB below the loudest (${loud.toFixed(4)}), between 100 and 4000 Hz, against ${Math.round((3900 * 262144) / FS)} bins in a 5.5 s window`); }
