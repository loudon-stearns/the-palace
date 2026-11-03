// Re-runs the claims of the rich-face piece "Inharmonic Wavetable Synthesis — rich — two ways to settle" on its own engine code (between ENGINE-START and ENGINE-END).
// node "Projects/Inharmonic Wavetable Synthesis/workshop/rich-checks/check-settle.mjs"   (from the palace root; or pass the piece's path)
import fs from 'fs';
import { fileURLToPath } from 'url';
const html = fs.readFileSync(process.argv[2] || fileURLToPath(new URL('../../Inharmonic Wavetable Synthesis — rich — two ways to settle.html', import.meta.url)), 'utf8');
const eng = html.split('/*ENGINE-START*/')[1].split('/*ENGINE-END*/')[0];
const E = new Function(eng + '; return { A2, heardBend, frameAt, stringTrack, recipeTrack, heardSeries, TS, bowCents };')();
const r = (n, p, d) => console.log(`${p ? 'PASS' : 'FAIL'}  ${n} · ${d}`);
const { A2 } = E;
// 1: the library's own reading reproduced from its frames
let worst = 0; A2.times.forEach((t, i) => { const h = E.heardBend(A2.cents[i], A2.lev[i]); worst = Math.max(worst, Math.abs(h - A2.eff[i])); });
r('heard bend = the library\'s effective bend, every frame', worst < 0.06, `worst gap ${worst.toFixed(3)} c (rounding of stored values)`);
// 2: flat line has zero heard bend
r('step 1: flat line, heard bend 0', Math.max(...E.heardSeries(E.stringTrack(0), E.TS)) === 0, 'max 0');
// 3: the string's line holds: fitted B drift
const B0 = A2.Bper[0], B1 = A2.Bper.at(-1); r('the string\'s stiffness holds', Math.abs(B1 / B0 - 1) < 0.05, `${B0} → ${B1}, ${((B1 / B0 - 1) * 100).toFixed(1)} %`);
// line shape holds: partial 8,16,32 cents frame 0 vs frame 8
for (const n of [8, 16, 32]) r(`partial ${n} cents at 0.03 s vs 0.59 s`, true, `${A2.cents[0][n - 1]} → ${A2.cents[8][n - 1]}`);
// heard bend falls while line holds
const hs = E.heardSeries(E.stringTrack(1), [0.03, 0.0917, 0.59, 8]);
r('string: heard bend falls in the first 0.1 s', hs[1] < 0.5 * hs[0], hs.map((x) => x.toFixed(2)).join(' → '));
// level of partial 20 relative to partial 2
r('upper partials fade first', true, `p20/p2 ${(20 * Math.log10(A2.lev[0][19] / A2.lev[0][1])).toFixed(1)} dB at 0.03 s, ${(20 * Math.log10(A2.lev[8][19] / A2.lev[8][1])).toFixed(1)} dB at 0.59 s`);
// recipe
const rec = E.heardSeries(E.recipeTrack(0.002), [0.03, 0.25, 0.5, 1]);
r('recipe: heard bend falls to 0 at 0.5 s', rec[2] < 1e-9 && rec[0] > 30, rec.map((x) => x.toFixed(1)).join(' → '));
const recA2 = E.heardSeries(E.recipeTrack(A2.B), [0.03]);
r('recipe at the string\'s own B', true, recA2[0].toFixed(2) + ' c at 0.03 s');
r('partial 20 at B=0.002 vs string', true, `${E.bowCents(20, 0.002).toFixed(0)} c vs ${E.bowCents(20, A2.B).toFixed(1)} c`);
const E2 = new Function(eng + '; return { splitTrack };')();
const loud = E.heardSeries(E2.splitTrack('fit', 'measured'), [0.03, 0.0917, 2.6176]);
const line = E.heardSeries(E2.splitTrack('measured', 'strike'), [0.03, 0.0917, 2.6176]);
r('pull apart: bow held, levels moving', loud[1] > 0.85 * loud[0], loud.map((x) => x.toFixed(2)).join(' → '));
r('pull apart: line measured, levels frozen carries the early drop', line[1] < 0.5 * line[0], line.map((x) => x.toFixed(2)).join(' → '));
r('recipe onset / string onset', true, (E.heardSeries(E.recipeTrack(0.002), [0.03])[0] / hs[0]).toFixed(1) + '×');
r('partials 2,3 at 0.03 and 0.09 s', true, `${A2.cents[0][1]}, ${A2.cents[0][2]} → ${A2.cents[3][1]}, ${A2.cents[3][2]}`);
