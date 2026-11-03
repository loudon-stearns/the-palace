// Re-runs the claims of the rich-face piece "Inharmonic Wavetable Synthesis — rich — the bundle of lines" on its own engine code (between ENGINE-START and ENGINE-END).
// node "Projects/Inharmonic Wavetable Synthesis/workshop/rich-checks/check-bundle.mjs"   (from the palace root; or pass the piece's path)
import fs from 'fs';
import { fileURLToPath } from 'url';
const html = fs.readFileSync(process.argv[2] || fileURLToPath(new URL('../../Inharmonic Wavetable Synthesis — rich — the bundle of lines.html', import.meta.url)), 'utf8');
const eng = html.split('/*ENGINE-START*/')[1].split('/*ENGINE-END*/')[0];
const E = new Function(eng + '; return { voices, widths, beatHz, slopeLogLog, bend, besselCents, bowCents };')();
const r = (n, p, d) => console.log(`${p ? 'PASS' : 'FAIL'}  ${n} · ${d}`);
const w = (W, n) => W[n - 1][1] - W[n - 1][0];
// detune: same width everywhere, beating ~ n
{ const vs = E.voices({ V: 2, kind: 'bow', B: 4e-4, tau: 0.3, delta: 0, detune: 4 }); const W = E.widths(vs), bt = E.beatHz(vs);
  const s = E.slopeLogLog(bt); r('detune: width constant', Math.abs(w(W, 32) - w(W, 1)) < 1e-9, `${w(W, 1).toFixed(2)} ¢ at 1, ${w(W, 32).toFixed(2)} at 32`);
  r('detune: beating grows as n', Math.abs(s - 1) < 0.06, `n^${s.toFixed(3)}, partial 1 ${bt[0].toFixed(3)} Hz, 32 ${bt[31].toFixed(2)} Hz`); }
// tau spread on bow: braid left fan right
{ const vs = E.voices({ V: 2, kind: 'bow', B: 4e-4, tau: 0.3, delta: 0.08, detune: 0 }); const W = E.widths(vs), bt = E.beatHz(vs);
  r('bow along τ: partial 1 still', w(W, 1) < 0.05, `${w(W, 1).toFixed(3)} ¢, ${bt[0].toFixed(4)} Hz`);
  r('bow along τ: fans at the right', w(W, 32) > 4 * w(W, 8), `8: ${w(W, 8).toFixed(2)} ¢, 32: ${w(W, 32).toFixed(2)} ¢, beating n^${E.slopeLogLog(bt).toFixed(2)}`);
  // width = delta * S(n)
  const pred = 0.08 * E.bowCents(32, 4e-4); r('width = δ · S(n)', Math.abs(w(W, 32) - pred) < 1e-9, `${w(W, 32).toFixed(4)} vs ${pred.toFixed(4)}`); }
// bessel: steep at 1-2, flat at right, widest at the right
{ const vs = E.voices({ V: 3, kind: 'bessel', B: 0, tau: 0.3, delta: 0.08, detune: 0 }); const W = E.widths(vs);
  const sl = (n) => E.besselCents(n + 1) - E.besselCents(n);
  let wMax = 1; for (let n = 2; n <= 32; n++) if (w(W, n) > w(W, wMax)) wMax = n;
  r('Bessel: steepest step is 1→2', sl(1) > 3 * sl(2), `${sl(1).toFixed(1)} vs ${sl(2).toFixed(1)} c/partial; 31→32: ${sl(31).toFixed(2)}`);
  r('Bessel: bundle widest at the right anyway', wMax === 32, `widest at ${wMax}; width at 2 ${w(W, 2).toFixed(1)} ¢, at 32 ${w(W, 32).toFixed(1)} ¢`); }
// measured: frames barely differ
{ const vs = E.voices({ V: 3, kind: 'measured', B: 0, tau: 0.5, delta: 0.08, detune: 0 }); const W = E.widths(vs);
  const bow = E.voices({ V: 3, kind: 'bow', B: 8.301e-5, tau: 0.5, delta: 0.08, detune: 0 }); const Wb = E.widths(bow);
  r('measured string: barely fans', true, `width at 8 ${w(W, 8).toFixed(2)} ¢, at 32 ${w(W, 32).toFixed(2)} ¢ (a relaxing bow at the same B: ${w(Wb, 32).toFixed(2)} ¢)`);
  let mx = 0; for (let n = 1; n <= 32; n++) mx = Math.max(mx, w(W, n)); r('measured string: widest anywhere', true, mx.toFixed(2) + ' ¢'); }
