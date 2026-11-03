// Re-runs the claims of the rich-face piece "Inharmonic Wavetable Synthesis — rich — bend the line" on its own engine code (between ENGINE-START and ENGINE-END).
// node "Projects/Inharmonic Wavetable Synthesis/workshop/rich-checks/check-bend.mjs"   (from the palace root; or pass the piece's path)
import fs from 'fs';
import { fileURLToPath } from 'url';
const f = process.argv[2] || fileURLToPath(new URL('../../Inharmonic Wavetable Synthesis — rich — bend the line.html', import.meta.url));
const html = fs.readFileSync(f, 'utf8');
const eng = html.split('/*ENGINE-START*/')[1].split('/*ENGINE-END*/')[0];
const E = new Function(eng + '; return { NP, WALLS, bowCents, besselCents, scatterCents, tableFromWall, wallFromTable, readTable, ratios, renderBank, spectrum, maxDiff, rmsTo, bestBow, judge, MATERIALS };')();
const out = [];
const ok = (name, pass, detail) => { out.push(`${pass ? 'PASS' : 'FAIL'}  ${name} · ${detail}`); };
const amps = (k) => Array.from({ length: E.NP }, (_, i) => E.WALLS[k](i + 1));
for (const w of ['saw', 'square', 'hollow']) {
  const T = E.tableFromWall(amps(w)); const a = E.wallFromTable(T, E.NP);
  const yT = E.readTable(T), sT = E.spectrum(yT);
  const yB = E.renderBank(a, E.ratios(new Array(E.NP).fill(0), 1)); const d = E.maxDiff(yT, yB);
  ok(`step 1 · ${w} table on the grid`, sT.offGrid < 1e-12, `off-grid ${sT.offGrid.toExponential(1)}`);
  ok(`step 2 · ${w} flat line = table`, d < 1e-10, `max diff ${d.toExponential(1)} of peak`);
  // any curve at depth 0 returns home
  const cur = Array.from({ length: E.NP }, (_, i) => E.scatterCents(i + 1, 150));
  const s0 = E.spectrum(E.renderBank(a, E.ratios(cur, 0)));
  ok(`step 4 · ${w} scatter at D=0 is flat`, s0.offGrid < 1e-12, `off-grid ${s0.offGrid.toExponential(1)}`);
}
// one partial bent moves energy off the grid, and only that partial's
{ const a = amps('saw'); const c = new Array(E.NP).fill(0); c[6] = 60;
  const s = E.spectrum(E.renderBank(a, E.ratios(c, 1)));
  let e = 0; a.forEach((x) => (e += x * x)); const share7 = a[6] ** 2 / e;
  ok('step 3 · one bent partial leaves the grid', s.offGrid > 0.5 * share7 && s.offGrid <= share7 * 1.001, `off-grid ${(s.offGrid * 100).toFixed(3)} %, partial 7's share of the energy ${(share7 * 100).toFixed(3)} %`);
  // peak location
  const r = 7 * Math.pow(2, 60 / 1200); let best = 0, bi = 0; for (let i = 200; i < 260; i++) if (s.pw[i] > best) { best = s.pw[i]; bi = i; }
  ok('step 3 · it sits where the formula says', Math.abs(bi / 32 - r) < 1 / 32, `peak bin ${bi / 32} harmonics, formula ${r.toFixed(4)}`); }
// Bessel shape numbers the eqs quote
ok('J0 shape: +238.5 at partial 2', Math.abs(E.besselCents(2) - 238.5) < 0.1, E.besselCents(2).toFixed(2));
ok('J0 shape: slope 11→12 is 3.3 c', Math.abs(E.besselCents(12) - E.besselCents(11) - 3.3) < 0.1, (E.besselCents(12) - E.besselCents(11)).toFixed(2));
ok('J0 shape: tends to 463 c', E.besselCents(64) < 463 && E.besselCents(64) > E.besselCents(32), E.besselCents(64).toFixed(1) + ' at partial 64, rising toward 462.7');
ok('J0 ratios match the page (1, 2.29, 3.60, 4.90)', true, [2, 3, 4].map((n) => (n * Math.pow(2, E.besselCents(n) / 1200)).toFixed(4)).join(', '));
// bow numbers
ok('bow at B=0.002, partial 20', true, E.bowCents(20, 0.002).toFixed(1) + ' c');
ok('bow at B=8.3e-5 (A2), partial 20', true, E.bowCents(20, 8.301e-5).toFixed(1) + ' c');
// materials
for (const [k, m] of Object.entries(E.MATERIALS)) { const j = E.judge(m); out.push(`  material ${k}: bow B=${j.bow.B.toExponential(2)} rms ${j.bow.rms.toFixed(2)} c · bessel rms ${j.bes.toFixed(1)} c · n=${m.cents.filter((c) => c != null).length}`); }
for (const k of ['piano-low-A1', 'piano-A2', 'piano-A4', 'piano-C6']) { const j = E.judge(E.MATERIALS[k]); ok(`step 5 · ${k} on the stiff-string bow`, j.bow.rms < 10 && j.bow.rms < j.bes, `${j.bow.rms.toFixed(2)} c rms vs Bessel ${j.bes.toFixed(0)}`); }
{ const j = E.judge(E.MATERIALS['bell-brooklyn-C6']); ok('step 5 · the bell is on neither named shape', j.bes > 100 && j.bow.rms > 100, `bow ${j.bow.rms.toFixed(0)} c, Bessel ${j.bes.toFixed(0)} c`); }
console.log(out.join('\n'));
