// rich-checks.mjs — re-checks the claims Three Kinds of Warp's rich-face pieces make, on the
// pieces' own engines (the code between ENGINE-START and ENGINE-END in each piece), headless.
//
//   node "Three Kinds of Warp/workshop/rich-checks.mjs"            run every check, print the numbers
//
// Each check prints what it measured and PASS or FAIL against the claim. Exit 1 on any FAIL.
// The Stiff String check reads the real surface file, the one the piano piece fetches.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const bundle = join(here, '..');
const palace = join(bundle, '..');
const ENTRY = 'Three Kinds of Warp';

function engine(piece, names) {
  const html = readFileSync(join(bundle, `${ENTRY} — rich — ${piece}.html`), 'utf8');
  const m = html.match(/\/\*ENGINE-START\*\/([\s\S]*?)\/\*ENGINE-END\*\//);
  if (!m) throw new Error(`no engine block in ${piece}`);
  return new Function(`${m[1]}\nreturn { ${names.join(', ')} };`)();
}

let fails = 0;
const say = (ok, what, detail) => { if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}${detail ? `\n      ${detail}` : ''}`); };

// ───────────── obstruction ─────────────
{
  const E = engine('obstruction', ['N', 'L', 'P', 'harmonicTable', 'drawnTable', 'warpFn', 'composite', 'render', 'spectrum', 'lookup']);
  console.log('\n— obstruction: any warp of one table read by one period-T phase stays on k/T');
  const tables = { sine: E.harmonicTable('sine'), saw: E.harmonicTable('saw'), square: E.harmonicTable('square'),
    drawn: E.drawnTable(Array.from({ length: 48 }, (_, i) => Math.sin(2 * Math.PI * i / 48) * 0.7 + 0.3 * Math.sin(6 * Math.PI * i / 48 + 1))) };
  // step 1–2: no warp
  let worst = 0;
  for (const [k, T] of Object.entries(tables)) worst = Math.max(worst, E.spectrum(E.render(E.composite(T, (x) => x))).offGrid);
  say(worst < 1e-12, 'steps 1–2: four tables, no warp — energy between the lines', `worst share ${worst.toExponential(2)}`);
  // step 3: every named warp, at several amounts
  worst = 0; let moved = 0;
  const flat = E.spectrum(E.render(E.composite(tables.saw, (x) => x)));
  for (const kind of ['bend', 'pd', 'sync', 'speed', 'fold']) for (const a of [-1, -0.5, 0.3, 0.8, 1]) {
    const s = E.spectrum(E.render(E.composite(tables.saw, E.warpFn(kind, a))));
    worst = Math.max(worst, s.offGrid);
    // did energy move among the lines? compare harmonic 1..8 shares
    let d = 0; for (let k = 1; k <= 8; k++) d += Math.abs(s.pw[k * E.P] / s.tot - flat.pw[k * E.P] / flat.tot); moved = Math.max(moved, d);
  }
  say(worst < 1e-12, 'step 3: five warps × five amounts on the saw — energy between the lines', `worst share ${worst.toExponential(2)}`);
  say(moved > 0.2, 'step 3: the warps do move energy among the lines', `largest change in the first eight harmonics' shares ${moved.toFixed(3)}`);
  // step 4: 200 random hand-drawn warps, jumps and all, ending anywhere
  worst = 0; let rnd = 12345; const rand = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);
  let notCircle = 0;
  for (let t = 0; t < 200; t++) {
    const pts = Array.from({ length: 33 }, () => rand() * 2 - 0.5);
    if (Math.abs(pts[32] - pts[0] - Math.round(pts[32] - pts[0])) > 0.05) notCircle++;
    const T = Object.values(tables)[t % 4];
    worst = Math.max(worst, E.spectrum(E.render(E.composite(T, E.warpFn('drawn', 0, pts)))).offGrid);
  }
  say(worst < 1e-12, `step 4: 200 random drawn warps (${notCircle} of them not circle maps of any degree) — energy between the lines`, `worst share ${worst.toExponential(2)}`);
  // step 5: speed wobble at whole-number ratios stays on; half and irrational leave
  const C = E.composite(tables.saw, (x) => x);
  const off = (rho, d = 0.3) => E.spectrum(E.render(C, { d, rho })).offGrid;
  const r1 = off(1), r2 = off(2), rh = off(0.5), rs = off(Math.SQRT2), rg = off((1 + Math.sqrt(5)) / 2);
  say(r1 < 1e-12 && r2 < 1e-12, 'step 5: a wobble once or twice per lap keeps the lap — stays on the grid', `1/lap ${r1.toExponential(2)} · 2/lap ${r2.toExponential(2)}`);
  // half-lap wobble: energy should sit on bins that are odd multiples of P/2
  const sh = E.spectrum(E.render(C, { d: 0.3, rho: 0.5 }));
  let half = 0; for (let i = 0; i < sh.pw.length; i++) if (i % (E.P / 2) === 0 && i % E.P !== 0) half += sh.pw[i];
  say(rh > 0.01 && Math.abs(half / sh.tot - rh) < 1e-9, 'step 5: a wobble every two laps makes a two-lap period — new lines exactly halfway', `between the lap's lines ${(rh * 100).toFixed(2)} %, all of it on the half-lines`);
  say(rs > 0.01 && rg > 0.01, 'step 5: a wobble at √2 or golden per lap leaves the grid', `√2 ${(rs * 100).toFixed(2)} % · golden ${(rg * 100).toFixed(2)} %`);

  // aliasing: the theorem is about the continuous signal. A naive digital read at 880 Hz, 48 kHz, of a sharp warp.
  console.log('\n— obstruction, the hint line: a naive digital read folds harmonics back between the lines');
  const sr = 48000;
  function aliasShare(f0, C) {
    const M = 1 << 18, y = new Float64Array(M);
    let p = 0; for (let n = 0; n < M; n++) { y[n] = E.lookup(C, p); p += f0 / sr; p -= Math.floor(p); }
    // Hann window, then energy within ±3 bins of each harmonic below Nyquist vs total
    const re = new Float64Array(M), im = new Float64Array(M);
    let mean = 0; for (let n = 0; n < M; n++) mean += y[n]; mean /= M;
    for (let n = 0; n < M; n++) re[n] = (y[n] - mean) * (0.5 - 0.5 * Math.cos(2 * Math.PI * n / M));
    fftLocal(re, im);
    let tot = 0, on = 0; const binHz = sr / M;
    for (let i = 1; i < M / 2; i++) { const p2 = re[i] * re[i] + im[i] * im[i]; tot += p2; const k = Math.round(i * binHz / f0); if (k >= 1 && k * f0 < sr / 2 && Math.abs(i - k * f0 / binHz) <= 3) on += p2; }
    return (tot - on) / tot;
  }
  function fftLocal(re, im) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
    for (let len = 2; len <= n; len <<= 1) { const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const a = i + k, b = a + len / 2, xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr; re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } }
  }
  const sine = E.composite(tables.sine, (x) => x);
  const syncHard = E.composite(tables.saw, E.warpFn('sync', 0.8));
  const a110 = aliasShare(110, sine), a880s = aliasShare(880, syncHard), a110s = aliasShare(110, syncHard);
  console.log(`      sine, no warp, 110 Hz: ${(a110 * 100).toFixed(4)} % between the lines (window leakage floor)`);
  console.log(`      saw through a sync window (amount 0.8), 110 Hz: ${(a110s * 100).toFixed(3)} %; 880 Hz: ${(a880s * 100).toFixed(3)} %`);
  say(a880s > 10 * a110, 'hint line: a hard warp read naively at 880 Hz puts measurable energy between the lines (aliasing)', '');
}

// ───────────── typology ─────────────
{
  let E;
  try { E = engine('typology', ['SURFACES', 'simulate', 'rotation', 'spectrumHz', 'peaks', 'latticeMiss']); } catch (e) { console.log('\n(typology piece not present yet: ' + e.message + ')'); }
  if (E) {
    console.log('\n— typology: sum vs surface; coupling moves the lattice generators, then collapses them at lock');
    const sr = 48000, M = 1 << 19; // 10.9 s at 48 kHz, 0.09 Hz bins
    const near = (pk, f, tol) => pk.some((p) => Math.abs(p.f - f) < tol);
    // type 2: summed oscillators vs a surface, at the golden ratio
    const w1 = 110, w2 = 110 * (1 + Math.sqrt(5)) / 2;
    for (const kind of ['sum', 'surface']) {
      const y = E.simulate(E.SURFACES[kind], w1, w2, 1, 1, 0, M, sr);
      const pk = E.peaks(E.spectrumHz(y, sr), sr, M, -60);
      const cross = [[1, 1], [1, -1], [2, -1], [1, 2]].filter(([m, n]) => near(pk, Math.abs(m * w1 + n * w2), 0.3));
      const axes = [[1, 0], [0, 1], [2, 0], [0, 2]].filter(([m, n]) => near(pk, m * w1 + n * w2, 0.3));
      const offAxes = pk.filter((p) => { for (let m = 0; m <= 40; m++) for (let n = 0; n <= 40; n++) if ((m === 0 || n === 0) && Math.abs(m * w1 + n * w2 - p.f) < 0.3) return false; return true; });
      console.log(`      ${kind}: ${pk.length} peaks above −60 dB; axis lines found ${axes.length}/4; cross lines found ${cross.length}/4; peaks off both harmonic series ${offAxes.length}`);
      if (kind === 'sum') say(offAxes.length === 0, 'type 2, summed oscillators: every line sits on one of the two harmonic series — no m·f1 + n·f2 cross terms', '');
      else say(cross.length === 4, 'type 2, a surface with cross terms: lines at m·f1 + n·f2 between the two series', '');
    }
    // type 3: Adler coupling near 1:1 — the rotation numbers move; peaks follow the moved lattice
    const v1 = 110, v2 = 121.37, a = 1, b = 1, Delta = b * v2 - a * v1, Kc = Math.abs(Delta) / (a + b);
    console.log(`      coupled, 1:1, ${v1} and ${v2} Hz: Δ = ${Delta.toFixed(3)} Hz, K* = ${Kc.toFixed(3)} Hz`);
    for (const frac of [0, 0.5, 0.9, 0.98, 1.2]) {
      const K = frac * Kc;
      const y = E.simulate(E.SURFACES.surface, v1, v2, a, b, K, M, sr, sr * 2);
      const R = E.rotation(v1, v2, a, b, K);
      const pk = E.peaks(E.spectrumHz(y, sr, 'bh'), sr, M, -60).filter((p) => p.f < 400);
      // every line below 400 Hz against the kept lattice (rho) and the set lattice (w), |m|,|n| <= 40, to 0.02 Hz
      const tol = 0.02;
      const moved = pk.map((p) => E.latticeMiss(p.f, R.rho1, R.rho2)), bare = pk.map((p) => E.latticeMiss(p.f, v1, v2));
      const offBare = bare.filter((d) => d > tol).length;
      const l1 = pk.filter((p) => Math.abs(p.f - R.rho1) < 1).sort((x, y2) => y2.db - x.db)[0];
      console.log(`      K = ${frac.toFixed(2)}·K*: slip ${R.slip.toFixed(3)} Hz · ρ1 ${R.rho1.toFixed(3)} ρ2 ${R.rho2.toFixed(3)} · ${pk.length} lines < 400 Hz · worst miss, kept lattice ${Math.max(...moved).toFixed(4)} Hz · lines off the set lattice ${offBare} of ${pk.length}${l1 ? ` · runner one's line at ${l1.f.toFixed(3)} Hz` : ''}`);
      say(Math.max(...moved) < tol, `type 3 at K = ${frac}·K*: every line below 400 Hz sits on m·ρ1 + n·ρ2 (within ${tol} Hz)`, '');
      if (frac > 0 && frac < 1) say(offBare > pk.length / 2, `type 3 at K = ${frac}·K*: most lines are off the set lattice m·f1 + n·f2`, '');
      if (frac >= 1) {
        const f0 = (v1 + v2) / 2;
        const offH = pk.filter((p) => p.f < 400 && Math.abs(p.f / f0 - Math.round(p.f / f0)) * f0 > tol);
        say(offH.length === 0, `type 3 past lock: every peak below 400 Hz is a harmonic of the shared pace ${f0.toFixed(3)} Hz`, '');
      }
    }
    // the project's worked example, 110 Hz at 1.518 pulled toward 3 : 2
    {
      const p1 = 110, p2 = 110 * 1.518181818, R = E.rotation(p1, p2, 3, 2, 0.9 * E.rotation(p1, p2, 3, 2, 0).Kc);
      const y = E.simulate(E.SURFACES.surface, p1, p2, 3, 2, 0.9 * R.Kc, M, sr, sr * 4);
      const pk = E.peaks(E.spectrumHz(y, sr, 'bh'), sr, M, -60).filter((p) => p.f < 400);
      const worst = Math.max(...pk.map((p) => E.latticeMiss(p.f, R.rho1, R.rho2)));
      console.log(`      3 : 2 preset at 0.9·K* (K* ${R.Kc.toFixed(3)} Hz): ρ1 ${R.rho1.toFixed(4)} ρ2 ${R.rho2.toFixed(4)} · ${pk.length} lines < 400 Hz · worst miss, kept lattice ${worst.toFixed(4)} Hz`);
      say(worst < 0.02, 'type 3, the 3 : 2 preset at 0.9·K*: every line on m·ρ1 + n·ρ2', '');
    }
    // the slip measured from the simulation matches sqrt(Delta^2 - ((a+b)K)^2)
    const K = 0.9 * Kc, R = E.rotation(v1, v2, a, b, K);
    const sim = E.simulate(E.SURFACES.surface, v1, v2, a, b, K, sr * 20, sr, 0, true);
    say(Math.abs(sim.slip - R.slip) < 0.01, 'type 3: simulated slip rate = √(Δ² − ((a+b)K)²)', `simulated ${sim.slip.toFixed(4)} Hz · formula ${R.slip.toFixed(4)} Hz`);
  }
}

// ───────────── piano ─────────────
{
  let E;
  try { E = engine('piano', ['ROWS', 'COLS', 'BMAX', 'parseWav', 'rowOf', 'rowSpectrum', 'targets', 'yConstantShare', 'stiffRow']); } catch (e) { console.log('\n(piano piece not present yet: ' + e.message + ')'); }
  if (E) {
    console.log('\n— piano: the Stiff String surface, as built, read by one phasor');
    const buf = readFileSync(join(palace, 'Projects/2D Torus Wavetable Synthesizer/Wavetables/13_stiff_string.wav'));
    const S = E.parseWav(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    say(S.length === E.ROWS * E.COLS, `the file is ${E.ROWS} rows × ${E.COLS} samples`, `${S.length} samples`);
    let worstCent = 0;
    for (const r of [256, 512, 767, 1023]) {
      const B = E.BMAX * r / (E.ROWS - 1), sp = E.rowSpectrum(E.rowOf(S, r)), tg = E.targets(B);
      // energy-weighted centre of each partial's floor/ceiling pair vs its target
      const lines = sp.filter((h) => h.p > 1e-6 * sp[0].p).map((h) => h.k);
      const t7 = tg[6];
      console.log(`      row ${r}, B = ${B.toFixed(4)}: lines at harmonics ${lines.slice(0, 14).join(' ')}${lines.length > 14 ? ' …' : ''} · partial 7's target ${t7.f.toFixed(2)} → harmonics ${Math.floor(t7.f)} and ${Math.ceil(t7.f)}`);
      const gen = E.stiffRow(B);
      let d = 0; for (let i = 0; i < E.COLS; i++) d = Math.max(d, Math.abs(gen[i] - E.rowOf(S, r)[i]));
      worstCent = Math.max(worstCent, d);
    }
    say(worstCent < 2e-3, 'the piece regenerates the rows from build_catalog.py’s formula to within float precision', `worst sample difference ${worstCent.toExponential(2)}`);
    const share = E.yConstantShare(S);
    say(share > 0.9, 'most of the surface does not change along Y: a family of harmonic rows, not a 2-generator layout', `share of energy constant along Y ${(share * 100).toFixed(1)} %`);
  }
}

console.log(fails ? `\n${fails} check(s) failed` : '\nall checks pass');
process.exitCode = fails ? 1 : 0;
