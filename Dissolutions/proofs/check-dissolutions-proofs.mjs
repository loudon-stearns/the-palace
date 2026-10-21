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

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
