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

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
