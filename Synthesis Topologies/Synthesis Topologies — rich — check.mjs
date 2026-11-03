// title: Synthesis Topologies — rich — check
// born: 2026-11-03
// links: [[Synthesis Topologies]] (connects-to · rich-face-check) · checks the two made pieces in [[Synthesis Topologies — rich.json]]
// forward_vector: I run each made piece's own engine, lifted out of its page, in Node, against the claim the piece makes: the table and the loop null at every whole length, the in-between loop is the Karplus-Strong string sample for sample, each harmonic fades at the rate the loop predicts; the sidebands sit at fc ± k·fm as loud as |Jₖ(β)|. With --browser I also render the FM piece's own audio graph in headless Chromium and measure it. I exit 1 if any claim fails.
// run: node "Synthesis Topologies/Synthesis Topologies — rich — check.mjs" [--browser]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const LOOP = 'Synthesis Topologies — rich — one loop, two instruments.html';
const FM = 'Synthesis Topologies — rich — vibrato into sidebands.html';
const engine = (file, names) => {
  const html = fs.readFileSync(path.join(here, file), 'utf8');
  const m = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`no engine script in ${file}`);
  return new Function(m[1] + `; return { ${names.join(', ')} };`)();
};
let failed = 0;
const ok = (cond, what) => { console.log(`${cond ? 'pass' : 'FAIL'} · ${what}`); if (!cond) failed++; };
const dB = (v) => 20 * Math.log10(v);

// ---- one loop, two instruments ----
const E = engine(LOOP, ['makeCycle', 'tableRead', 'loopRead', 'ksString', 'maxAbsDiff', 'residueTrack', 'measureDecay', 'predictDecay', 'keptPerTrip']);
{
  const rows = [];
  for (const fs_ of [44100, 48000]) for (const shape of ['saw', 'hollow', 'soft', 'burst']) {
    const c = E.makeCycle(shape); let worst = 0, exact = 0;
    for (let N = 40; N <= 400; N++) { const t = E.tableRead(c, N, fs_), m = E.maxAbsDiff(t, E.loopRead(t, N, fs_)); worst = Math.max(worst, m); if (m === 0) exact++; }
    rows.push({ fs: fs_, shape, 'worst |table − loop|, 1 s, N 40–400': worst.toExponential(2), 'dB under peak': +dB(worst / 0.8).toFixed(1), 'exactly zero': `${exact} of 361` });
    ok(dB(worst / 0.8) < -180, `whole lengths, ${shape}, fs ${fs_}: table and loop agree to the counter's rounding (${dB(worst / 0.8).toFixed(0)} dB)`);
  }
  console.table(rows);
  // the rounding is the counter's, not the loop's: an exact counter (n mod N) nulls to zero
  {
    const c = E.makeCycle('saw'), N = 100, len = 48000 * 4, t = new Float64Array(len);
    for (let n = 0; n < len; n++) { const x = (n % N) / N * c.length, i0 = Math.floor(x), f = x - i0; t[n] = c[i0 % c.length] + (c[(i0 + 1) % c.length] - c[i0 % c.length]) * f; }
    ok(E.maxAbsDiff(t, E.loopRead(t, N, len)) === 0, 'with a counter that lands exactly on 1 after N steps, the null is exactly zero for 4 s');
  }
  // the identity, run (it holds by algebra: ½a + ½b and ½(a + b) are the same IEEE sum): the in-between loop at d = ½ is Karplus-Strong's average at ρ = 1
  for (const shape of ['saw', 'hollow', 'soft', 'burst']) for (const N of [40, 77, 100, 250, 400]) {
    const t = E.tableRead(E.makeCycle(shape), N + 0.5, 48000 * 4), l = E.loopRead(t, N + 0.5, t.length), k = E.ksString(t, N, t.length);
    if (E.maxAbsDiff(l, k) !== 0) ok(false, `in-between loop vs string, ${shape}, N ${N}`);
  }
  ok(true, 'identity: in-between loop at N + ½ and Karplus-Strong at N, ρ = 1: difference 0 (by algebra, not an experiment)');
  // and the table against the in-between loop does not null
  const hr = [];
  for (const N of [50, 100, 200, 400]) {
    const t = E.tableRead(E.makeCycle('saw'), N + 0.5, 48000 * 4), l = E.loopRead(t, N + 0.5, t.length), r = E.residueTrack(t, l, 48000);
    const at = (s) => r[Math.floor(s / 0.01)][1];
    hr.push({ N: `${N} + ½`, '0.05 s dB': +at(0.05).toFixed(1), '1 s dB': +at(1).toFixed(1), '3 s dB': +at(3).toFixed(1) });
    ok(at(0.05) < at(1) && at(1) < at(3) && at(3) > -20, `table vs in-between loop, N ${N} + ½: the difference climbs toward the sound`);
  }
  console.table(hr);
  // each harmonic fades at the rate the loop predicts, for d = ½ and d = ¼
  const dr = [];
  for (const d of [0.5, 0.25]) for (const [shape, ks] of [['saw', [1, 2, 4, 8]], ['hollow', [1, 3, 5, 7]]]) {
    const N = 100, T = N + d, t = E.tableRead(E.makeCycle(shape), T, 48000 * 4), l = E.loopRead(t, T, t.length);
    for (const k of ks) {
      const p = E.predictDecay(48000, T, k, d), m = E.measureDecay(l, 48000, T, k, 3);
      dr.push({ d, shape, k, 'predicted dB/s': +p.toFixed(2), 'measured dB/s': +m.toFixed(2) });
      ok(Math.abs(m - p) <= Math.max(0.1, 0.01 * Math.abs(p)), `d ${d}, ${shape}, harmonic ${k}: fades at ${m.toFixed(2)} dB/s, predicted ${p.toFixed(2)}`);
    }
  }
  console.table(dr);
  ok(E.keptPerTrip(1000, 48000, 0) === 1, 'a whole length keeps every harmonic whole');
}

// ---- vibrato into sidebands ----
const F = engine(FM, ['fmRender', 'fmRenderByFrequency', 'besselJ', 'dtftAmp', 'fmLines', 'measureLines', 'separatesFrom']);
{
  ok(Math.abs(F.besselJ(0, 2.404825557695773)) < 1e-12, 'J₀(2.4048…) = 0, the first zero');
  ok(Math.abs(F.besselJ(1, 1) - 0.44005058574493355) < 1e-12, 'J₁(1) = 0.4400505857…');
  ok(Math.abs(F.besselJ(3, 5) - 0.36483123061366696) < 1e-12, 'J₃(5) = 0.3648312306…');
  const fs_ = 48000, n = 1 << 17, rows = [];
  let worst = 0, worstBy = 0;
  for (const fm of [20, 37, 55, 110, 163, 200]) for (const b of [0.5, 1.5, 2.405, 4]) {
    const lines = F.fmLines(440, fm, b).filter((L) => Math.abs(L.k) <= 6 && !L.clash && Math.abs(L.J) > 1e-3);
    const a = F.measureLines(F.fmRender(440, fm, b, fs_, n, 0), fs_, lines, 0);
    const c = F.measureLines(F.fmRenderByFrequency(440, fm, b, fs_, n), fs_, lines, 0);
    for (let i = 0; i < a.length; i++) {
      const e = Math.abs(dB(a[i].meas) - dB(Math.abs(a[i].J))), e2 = Math.abs(dB(c[i].meas) - dB(Math.abs(a[i].J)));
      worst = Math.max(worst, e); worstBy = Math.max(worstBy, e2);
    }
    if (fm === 110 && b === 1.5) for (const r of a) rows.push({ k: r.k, Hz: r.f, '|Jk| dB': +dB(Math.abs(r.J)).toFixed(3), 'engine dB': +dB(r.meas).toFixed(3) });
  }
  console.table(rows);
  ok(worst < 0.02, `every line above −60 dB, 6 rates × 4 indexes: within ${worst.toFixed(4)} dB of |Jₖ(β)|`);
  ok(worstBy < 0.02, `the same, made by summing frequency into phase as an oscillator does: within ${worstBy.toFixed(4)} dB`);
  // the carrier's drop-out, at a rate where nothing folds onto 440 Hz (at 137 Hz, 880 ⁄ 137 is not whole)
  { const z = 2.404825557695773, y = F.fmRender(440, 137, z, fs_, n, 0), c = dB(F.dtftAmp(y, 0, n, 440, fs_)); ok(c < -150, `at β = 2.40483 and 137 Hz the carrier line is ${c.toFixed(1)} dB: silent`); }
  // at 110 Hz the 440 Hz line is not the carrier: k = −8 sits at 440 − 880 = −440 Hz and folds onto it, at |J₈(2.40483)|
  { const z = 2.404825557695773, y = F.fmRender(440, 110, z, fs_, n, 0), c = dB(F.dtftAmp(y, 0, n, 440, fs_)), j8 = dB(Math.abs(F.besselJ(8, z)));
    ok(Math.abs(c - j8) < 0.05, `at 110 Hz the 440 Hz line reads ${c.toFixed(2)} dB, which is the folded k = −8 line (|J₈| = ${j8.toFixed(2)} dB), not the carrier`);
    ok(F.fmLines(440, 110, z).find((L) => L.k === 0).clash, 'and the piece flags that row as a line from below 0 Hz'); }
  // the carrier row stays in the test table at the drop-out
  ok(F.fmLines(440, 130, 2.405).some((L) => L.k === 0), 'the k = 0 row is kept at β = 2.405, where J₀ = −81 dB');
  // the long look sees lines 5 Hz apart at a 5 Hz vibrato, ± 30 Hz: they are there below 20 Hz
  { const y = F.fmRender(440, 5, 6, 4000, 1 << 14, 0), lines = F.fmLines(440, 5, 6).filter((L) => Math.abs(L.J) > 0.05); let e = 0; for (const L of lines) e = Math.max(e, Math.abs(dB(F.dtftAmp(y, 0, y.length, L.f, 4000)) - dB(Math.abs(L.J)))); ok(e < 0.05, `a 5 Hz vibrato, ± 30 Hz (β 6): ${lines.length} lines 5 Hz apart with |Jₖ| > 0.05 (${F.fmLines(440, 5, 6).filter((L) => Math.abs(L.J) > 1e-3).length} above 1e-3), each within ${e.toFixed(3)} dB of |Jₖ(6)|`); }
  // from what rate does a look tell the lines apart?
  const sr = [];
  for (const look of [0.02, 0.05, 0.1, 0.12, 0.25]) { const r = {}; r['look ms'] = look * 1000; for (const b of [0.5, 1, 2]) r[`β ${b}`] = F.separatesFrom(look, b, 440); sr.push(r); }
  console.table(sr);
  const s50 = F.separatesFrom(0.05, 1, 440), s120 = F.separatesFrom(0.12, 1, 440);
  ok(s50 > s120, `a longer look tells closer lines apart: 50 ms from ${s50} Hz, 120 ms from ${s120} Hz (β 1)`);
}

// ---- the audio graph, in headless Chromium ----
if (process.argv.includes('--browser')) {
  const palace = path.resolve(here, '..');
  const { findChromium } = await import(pathToFileURL(path.join(palace, '_ops/rich-face/conform.mjs')).href);
  const { chromium, why } = findChromium();
  if (!chromium) { console.log(`skip · browser: ${why}`); }
  else {
    const browser = await chromium.launch(); const page = await browser.newPage();
    await page.goto(pathToFileURL(path.join(here, FM)).href);
    let worst = 0; const rows = [];
    for (const [fm, b] of [[20, 1.5], [110, 1.5], [110, 2.405], [163, 4], [200, 0.5]]) {
      const res = await page.evaluate(([fm, b]) => window.__measureGraph(fm, b), [fm, b]);
      for (const r of res) { if (r.clash || Math.abs(r.J) < 1e-3) continue; const e = Math.abs(dB(r.meas) - dB(Math.abs(r.J))); worst = Math.max(worst, e); if (fm === 110 && b === 2.405) rows.push({ k: r.k, Hz: r.f, '|Jk| dB': +dB(Math.abs(r.J)).toFixed(3), 'graph dB': +dB(r.meas).toFixed(3) }); }
    }
    console.table(rows);
    ok(worst < 0.1, `the audio graph you hear (OfflineAudioContext, 48 kHz): every line above −60 dB within ${worst.toFixed(4)} dB of |Jₖ(β)|`);
    await browser.close();
  }
}
console.log(failed ? `\n${failed} failed` : '\nall pass');
process.exit(failed ? 1 : 0);
