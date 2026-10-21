// check-dissolutions-proofs.mjs — re-run the claims the Dissolutions proofs make,
// headless, on the proofs' own code.
//
//   node "Dissolutions/proofs/check-dissolutions-proofs.mjs"
//
// Each proof keeps its mathematics in one pure block of its inline script,
// between `// ---- math` and `// ---- end math ----`. This pulls that exact
// source out of the HTML, runs it, and checks the numbers the page shows and the
// verdict its hunt-ledger line gives. It prints PASS/FAIL per claim and exits
// non-zero on any FAIL. It reads the proofs; it writes nothing.
// The pattern is _ops/rich-face/check-kuramoto-pieces.mjs.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

// the math block of a proof, as an object of its functions
export function mathOf(folder, file, names) {
  const html = readFileSync(join(HERE, folder, file), 'utf8');
  const m = html.match(/\/\/ ---- math[^\n]*\n([\s\S]*?)\/\/ ---- end math ----/);
  if (!m) throw new Error(`no math block in ${folder}/${file}`);
  return new Function(`${m[1]}\nreturn { ${names.join(', ')} };`)();
}

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const rand = (seed) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

// ── The circle's shadow: Chebyshev is Fourier ───────────────────────────────
{
  const M = mathOf('2026-10-20-the-circles-shadow', 'the-circles-shadow.html',
    ['cheb', 'curveAt', 'stackAt', 'readCurve', 'readStack', 'harmonicsOf', 'maxDiff']);
  const r = rand(7);
  let worst = 0;
  for (let t = 0; t < 200; t++) {
    const c = Array.from({ length: 10 }, () => r());
    worst = Math.max(worst, M.maxDiff(M.readCurve(c, 1, 1024), M.readStack(c, 1024)) / c.reduce((a, b) => a + b));
  }
  check('circle: at full reach the bent curve and the stack of cosines null, any drawbars', worst < 1e-13, `worst normalised difference ${worst.toExponential(2)} over 200 random drawbar sets`);
  const c = [0.3, 0.9, 0.1, 0.6, 0.2, 0, 0.4, 0, 0.7, 0.5], h = M.harmonicsOf(M.readCurve(c, 1, 1024), 10);
  const herr = Math.max(...h.map((v, i) => Math.abs(v - c[i])));
  check('circle: the measured harmonics of the curve are the drawbars', herr < 1e-12, `largest miss ${herr.toExponential(2)}`);
  const third = [0, 0, 1, 0, 0, 0, 0, 0, 0, 0], h6 = M.harmonicsOf(M.readCurve(third, 0.6, 1024), 10);
  // T3(L cos θ) = (3L³ − 3L) cos θ + L³ cos 3θ
  check('circle: at reach 0.6 the third comes out mostly as the first', Math.abs(h6[0] - 1.152) < 1e-9 && Math.abs(h6[2] - 0.216) < 1e-9 && h6[1] < 1e-12 && h6[3] < 1e-12,
    `h1 ${h6[0].toFixed(4)} (1.1520), h3 ${h6[2].toFixed(4)} (0.2160), even harmonics ${Math.max(h6[1], h6[3]).toExponential(1)}`);
  let up = 0;
  for (let n = 1; n <= 10; n++) { const e = Array(10).fill(0); e[n - 1] = 1; const hh = M.harmonicsOf(M.readCurve(e, 0.5, 1024), 10); for (let k = n; k < 10; k++) up = Math.max(up, hh[k]); for (let k = n - 2; k >= 0; k -= 2) up = Math.max(up, hh[k]); }
  check('circle: below full reach a curve leaks only downward, within its parity', up < 1e-12, `largest leak up or across parity ${up.toExponential(1)}`);
}

// ── The table that travels: Dispersion Table (wavetable = lossless loop) ──────
{
  const M = mathOf('2026-10-20-the-table-that-travels', 'the-table-that-travels.html',
    ['makeCycle', 'apLag', 'loopConfig', 'predictPartials', 'readTable', 'runLoop', 'spectrumDb', 'peakNear', 'maxDiff']);
  const sr = 48000, P = Math.round(sr / 110), n = 3 * sr;
  let worst = 0;
  for (const shape of ['saw', 'pulse', 'soft']) {
    const cyc = M.makeCycle(shape, P), cfg = M.loopConfig(P, 0, 8, 0);
    worst = Math.max(worst, M.maxDiff(M.readTable(cyc, P, n), M.runLoop(cyc, cfg, n), n));
  }
  check('table: with only the delay in the loop, table and loop give the same samples', worst === 0, `largest difference ${worst} over 3 s, three cycles`);
  for (const a of [-0.6, -0.8, -0.9]) {
    const cyc = M.makeCycle('saw', P), cfg = M.loopConfig(P, 0, 8, a), lp = M.runLoop(cyc, cfg, n);
    const pred = M.predictPartials(cfg, 24, sr), N = 32768, db = M.spectrumDb(lp, 2 * P, N);
    const miss = Math.max(...pred.map((f) => Math.abs(M.peakNear(db, sr / N, f, 0.3 * sr / P) - f)));
    const sharp = (pred[23] / (24 * pred[0]) - 1) * 100;
    check(`table: a = ${a}, the round-trip condition predicts where the loop's partials land`, miss < 0.1, `worst miss ${miss.toFixed(3)} Hz over 24 partials; partial 24 is ${sharp.toFixed(1)}% sharp`);
  }
  {
    const cyc = M.makeCycle('saw', P), cfg = M.loopConfig(P, 0.5, 8, 0), lp = M.runLoop(cyc, cfg, n), N = 16384;
    const f20 = 20 * sr / (P + 0.5), lvl = (s) => { const db = M.spectrumDb(lp, s, N); return db[Math.round(M.peakNear(db, sr / N, f20, 40) / (sr / N))]; };
    const lost = lvl(2 * P) - lvl(2 * P + sr), w = 2 * Math.PI * f20 / sr, predicted = -20 * Math.log10(Math.cos(w / 2)) * sr / (P + 0.5);
    check('table: half a sample longer, the loop dulls at the rate its interpolator predicts', Math.abs(lost - predicted) < 1, `harmonic 20 lost ${lost.toFixed(2)} dB in 1 s; predicted ${predicted.toFixed(2)}`);
  }
}

// ── The equation read backward: LPC analysis = synthesis read backward ───────
{
  const M = mathOf('2026-10-20-the-equation-read-backward', 'the-equation-read-backward.html',
    ['makeVoice', 'levinson', 'lpcFrames', 'analyse', 'synthesise', 'standIn', 'maxDiff', 'energy', 'envelopeDb']);
  const SR = 16000, HOP = 160, WIN = 400, v = M.makeVoice(SR, 2.2, 11), X = v.x;
  const gains = [];
  let worst = 0;
  for (const p of [1, 4, 16, 32]) {
    const fr = M.lpcFrames(X, p, HOP, WIN), E = M.analyse(X, fr, p, HOP);
    worst = Math.max(worst, M.maxDiff(X, M.synthesise(E, fr, p, HOP)));
    gains.push(10 * Math.log10(M.energy(X) / M.energy(E)));
  }
  check('lpc: solved for the voice from its own residual, the voice comes back, at every order', worst < 1e-10, `largest difference ${worst.toExponential(1)} at orders 1, 4, 16, 32`);
  check('lpc: more weights carry more of the voice; the line holds regardless', gains[0] < gains[1] && gains[1] < gains[2], `prediction gain ${gains.map((g) => g.toFixed(1)).join(' / ')} dB`);
  const peaks = (env) => { const out = []; for (let b = 1; b < env.length - 1 && out.length < 2; b++) if (env[b] > env[b - 1] && env[b] >= env[b + 1]) out.push(b * 8000 / (env.length - 1)); return out; };
  const p = 16, fr = M.lpcFrames(X, p, HOP, WIN), E = M.analyse(X, fr, p, HOP);
  const Yb = M.synthesise(M.standIn('buzz', E, v.f0, SR, HOP, 5), fr, p, HOP), frB = M.lpcFrames(Yb, p, HOP, WIN);
  const f = Math.round(0.3 * SR / HOP), a = peaks(M.envelopeDb(fr[f].a, 129)), b = peaks(M.envelopeDb(frB[f].a, 129));
  check('lpc: driven by a buzz, the vowel keeps its first two formants', a.length === 2 && b.length === 2 && Math.abs(a[0] - b[0]) <= 125 && Math.abs(a[1] - b[1]) <= 125,
    `ah at 0.3 s: voice ${a.map(Math.round).join(', ')} Hz; buzz-driven ${b.map(Math.round).join(', ')} Hz (made at 730, 1090)`);
}

// ── One field, two hands: Volterra Kernels and the Torus ─────────────────────
{
  const M = mathOf('2026-10-20-one-field-two-hands', 'one-field-two-hands.html',
    ['GAP', 'FIELDS', 'fieldAt', 'readSynth', 'inputAt', 'readEffect', 'volterraKernels', 'volterraEval', 'levelAt', 'maxDiff']);
  const sr = 48000, N = 24000;
  let worst = 0;
  for (const name of Object.keys(M.FIELDS)) for (const lag of [12, 30, 77]) for (const f of [110, 220, 437]) {
    const off = ((-f * lag / sr) % 1 + 1) % 1;
    worst = Math.max(worst, M.maxDiff(M.readSynth(M.FIELDS[name], f, 1, off, sr, N), M.readEffect(M.FIELDS[name], 'one', f, lag, sr, N)));
  }
  check('field: one tone read now and a lag ago is two phasors at 1:1, a fixed offset apart — they null', worst < 1e-9, `largest difference ${worst.toExponential(1)} over 3 fields × 3 lags × 3 tones`);
  const swing = (c, lag) => { const l = []; for (let f = 110; f <= 660; f += 10) l.push(M.levelAt(M.readEffect(c, 'two', f, lag, sr, 16384), M.GAP, sr)); return Math.max(...l) - Math.min(...l); };
  const flat = Math.max(...Object.keys(M.FIELDS).map((k) => swing(M.FIELDS[k], 0)));
  check('field: on the diagonal (lag 0) the difference tone keeps one level as the tones slide, as a Hammerstein must', flat < 0.05, `largest swing ${flat.toFixed(3)} dB over all three fields`);
  const s30 = swing(M.FIELDS.ring, 30);
  check('field: off the diagonal (lag 30) the difference tone swings with the input frequencies, which no Hammerstein can do', s30 > 10, `swing ${s30.toFixed(1)} dB`);
  {
    const f = 220, lag = 30, a0 = M.levelAt(M.readEffect(M.FIELDS.ring, 'two', f, 0, sr, 16384), M.GAP, sr), a = M.levelAt(M.readEffect(M.FIELDS.ring, 'two', f, lag, sr, 16384), M.GAP, sr);
    const predicted = 20 * Math.log10(Math.abs(Math.cos(Math.PI * (2 * f + M.GAP) * lag / sr)));
    check('field: for the ring, the difference tone follows |cos(π(f₁+f₂)τ)|, set by the tones that made it', Math.abs((a - a0) - predicted) < 0.2, `measured ${(a - a0).toFixed(2)} dB, predicted ${predicted.toFixed(2)} dB`);
  }
  let vworst = 0;
  const r = rand(3), x = Array.from({ length: 400 }, () => 2 * r() - 1);
  for (const name of Object.keys(M.FIELDS)) for (const lag of [0, 5, 40]) {
    const ks = M.volterraKernels(M.FIELDS[name], lag), xf = (t) => x[t];
    for (let t = 60; t < 400; t++) vworst = Math.max(vworst, Math.abs(M.volterraEval(ks, xf, t) - M.fieldAt(M.FIELDS[name], x[t], x[t - lag])));
  }
  check('field: written as a Volterra series on the lags 0 and τ, the reading is exact', vworst < 1e-12, `largest difference ${vworst.toExponential(1)}, random input, 3 fields × 3 lags`);
}

// ── The lattice read back: Rank-N Lattice Analysis ──────────────────────────
{
  const M = mathOf('2026-10-20-the-lattice-read-back', 'the-lattice-read-back.html',
    ['FIELDS', 'synth', 'spectrum', 'findPeaks', 'fitRank1', 'analyse', 'express']);
  const sr = 48000, NA = 65536, G1 = 110;
  const run = (field, ratio, K, tol = 0.5) => {
    const pts = M.FIELDS[field], y = M.synth(pts, G1, G1 * ratio, sr, NA, 9), fs = M.findPeaks(M.spectrum(y, NA), sr / NA, 60, 24).map((p) => p.f);
    return { pts, fs, fit: M.analyse(fs, tol, K) };
  };
  {
    const { pts, fit } = run('bell', Math.SQRT2, 40), key = (q) => q.join(',');
    const back = new Set(fit.coords.map(key)), drawn = new Set(pts.map((q) => key([q[0], q[1]])));
    const same = back.size === drawn.size && [...drawn].every((k) => back.has(k));
    check('lattice: at √2 the analysis finds rank 2, the drawing generators and every lit point', fit.rank === 2 && Math.abs(fit.gens[0] - 110) < 0.05 && Math.abs(fit.gens[1] - 110 * Math.SQRT2) < 0.05 && same,
      `rank ${fit.rank}, generators ${fit.gens.map((g) => g.toFixed(3)).join(' / ')} Hz, points ${same ? 'identical' : 'differ'}`);
  }
  {
    const { fit } = run('bell', 1.5, 40);
    check('lattice: at 3 ÷ 2 the rows fall onto one series, rank 1 at 55 Hz', fit.rank === 1 && Math.abs(fit.gens[0] - 55) < 0.02, `rank ${fit.rank}, ${fit.gens[0].toFixed(3)} Hz`);
  }
  {
    const a = run('bell', 1.4, 40).fit, b = run('bell', 1.4, 20).fit;
    check('lattice: at 7 ÷ 5 the rank is 1 or 2 depending only on the whole-number bound', a.rank === 1 && Math.abs(a.gens[0] - 22) < 0.02 && b.rank === 2,
      `bound 40: rank ${a.rank} (${a.gens[0].toFixed(2)} Hz); bound 20: rank ${b.rank}`);
  }
  {
    const { pts, fit } = run('diag', Math.SQRT2, 40), g2 = 110 * Math.SQRT2;
    const p = M.express(110, fit.gens, 1), q = M.express(g2, fit.gens, 1), det = p && q ? p[0] * q[1] - p[1] * q[0] : 0;
    const freqsBack = fit.coords.map((c) => c[0] * fit.gens[0] + c[1] * fit.gens[1]).sort((x, y) => x - y);
    const freqsDrawn = pts.map((c) => c[0] * 110 + c[1] * g2).sort((x, y) => x - y);
    const err = Math.max(...freqsBack.map((f, k) => Math.abs(f - freqsDrawn[k])));
    check('lattice: on the diagonal field it recovers the same lattice in another basis (a whole-number change, det ±1)', fit.rank === 2 && Math.abs(det) === 1 && !(p[0] === 1 && p[1] === 0 && q[0] === 0 && q[1] === 1) && err < 0.05,
      `found ${fit.gens.map((g) => g.toFixed(2)).join(' / ')} Hz; g₁ = (${p}), g₂ = (${q}) in them; det ${det}; worst frequency ${err.toFixed(3)} Hz`);
  }
  {
    const { fs } = run('bell', Math.SQRT2, 40), r1 = M.fitRank1(fs, 0.5, 100000);
    check('lattice: with the whole numbers unbounded, the same √2 sound reads as rank 1', !!r1 && r1.g < 10, r1 ? `a ${r1.g.toFixed(2)} Hz fundamental, harmonics up to ${Math.max(...r1.coords.map((c) => c[0]))}` : 'no fit');
  }
}

// ── The shadow that locks: Phase Reduction (Floquet / Kuramoto) ──────────────
{
  const M = mathOf('2026-10-20-the-shadow-that-locks', 'the-shadow-that-locks.html',
    ['limitCycle', 'prcFloquet', 'prcKick', 'gammaTable', 'gammaAt', 'tongue', 'shadowLock', 'runFull', 'runShadow']);
  const loops = {};
  for (const mu of [0.3, 1, 3]) {
    const cyc = M.limitCycle(mu, 2000), prc = M.prcFloquet(cyc, 64), G = M.gammaTable(cyc, prc, 128);
    loops[mu] = { cyc, prc, G, tg: M.tongue(G, cyc.w) };
  }
  {
    const along = Math.max(...Object.values(loops).map((l) => Math.abs(l.prc[0].one - 1)));
    const across = Math.max(...[0.3, 1].map((mu) => Math.abs(loops[mu].prc[0].other / loops[mu].cyc.across - 1)));
    check('shadow: each loop has a Floquet multiplier of 1 along it; the other matches Liouville’s e^(∮ trace J)', along < 1e-5 && across < 1e-3, `largest |λ − 1| ${along.toExponential(1)}; across, eigenvector against Liouville, ${across.toExponential(1)}`);
  }
  {
    const out = [];
    let ok = true;
    for (const mu of [0.3, 1, 3]) {
      const { cyc, prc } = loops[mu];
      let sc = 0; prc.forEach((p) => { sc = Math.max(sc, Math.abs(p.Z[1])); });
      const gap = (k) => { let w = 0; for (let j = 0; j < 16; j++) w = Math.max(w, Math.abs(M.prcKick(cyc, 2 * Math.PI * j / 16, k, 8) - prc[j * 4].Z[1])); return 100 * w / sc; };
      const a = gap(0.01), b = gap(0.001);
      ok = ok && b < 0.2 && a / b > 5; out.push(`μ ${mu}: ${a.toFixed(3)}% → ${b.toFixed(3)}%`);
    }
    check('shadow: the PRC measured by kicks converges on the Floquet left eigenvector as the kick shrinks', ok, `kick 0.01 → 0.001, largest gap: ${out.join('; ')}`);
  }
  {
    const { cyc, tg } = loops[1], fac = [-1.5, -1.2, -0.8, -0.5, 0, 0.5, 0.8, 1.2, 1.5], rows = [];
    let ok = true;
    for (const eps of [0.02, 0.05, 0.1]) {
      const row = fac.map((f) => M.runFull(cyc, eps, f * eps * (f < 0 ? -tg.lo : tg.hi), 2 * Math.PI / 3, 300, 200).locked ? 'L' : 'd').join('');
      ok = ok && row === 'ddLLLLLdd'; rows.push(`ε ${eps}: ${row}`);
    }
    check('shadow: van der Pol, weak coupling, the full pair locks exactly where the shadow’s tongue says', ok, `${rows.join(' · ')} (shadow: ddLLLLLdd, edges at ±1)`);
  }
  {
    const { cyc, G, tg } = loops[1], eps = 0.4, det = 0.09, full = M.runFull(cyc, eps, det, 2 * Math.PI / 3, 300, 200);
    const sh = M.shadowLock(G, cyc.w, eps, det, 0);
    check('shadow: van der Pol, strong coupling, the full pair locks where the shadow says it drifts', full.locked && sh === null && det > eps * tg.hi, `ε 0.4, δ 0.09: full ${full.locked ? 'locks' : 'drifts'}, shadow edge at δ ${(eps * tg.hi).toFixed(3)}`);
  }
  {
    const oddEven = (G) => { let o = 0, e = 0; for (let q = 0; q < 128; q++) { const p = 2 * Math.PI * q / 128; o = Math.max(o, Math.abs(M.gammaAt(G, p) - M.gammaAt(G, -p))); e = Math.max(e, Math.abs(M.gammaAt(G, p) + M.gammaAt(G, -p) - 2 * M.gammaAt(G, 0))); } return o / e; };
    const r03 = oddEven(loops[0.3].G), r1 = oddEven(loops[1].G);
    const { cyc, tg } = loops[0.3], miss = M.runFull(cyc, 0.05, 1.5 * 0.05 * tg.hi, 2 * Math.PI / 3, 300, 200).locked;
    check('shadow: on the gentle loop the averaged pull is nearly even in the gap, and the shadow misses locking at weak coupling', r03 < 0.5 * r1 && miss,
      `odd/even part of Γ: μ 0.3 ${r03.toFixed(3)}, μ 1 ${r1.toFixed(3)}; μ 0.3, ε 0.05, δ at 1.5× the shadow’s edge: full ${miss ? 'locks' : 'drifts'}`);
  }
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
