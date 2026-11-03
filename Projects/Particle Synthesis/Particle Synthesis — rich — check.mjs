// title: Particle Synthesis — rich — check
// born: 2026-11-03
// links: [[Particle Synthesis]] (connects-to · rich-face-check) · checks the three made pieces in [[Particle Synthesis — rich.json]]
// forward_vector: I run each made piece's own engine, lifted out of its page, in Node, against the claim the piece makes: a thrown particle is a parabola whose timing belongs to the throw and whose sound at audio rate has harmonics at 1 ⁄ n², while a spring keeps its period and sounds as one sine; a click through the fountain's ice peaks band by band where r ⁄ (2·√(C·ω)) says, and through a one-speed medium arrives whole; the same ends give whole-number partials under a straight law and not under the ice's; glass and deep water hold back their highs while the ice sends them first. I exit 1 if any claim fails.
// run: node "Projects/Particle Synthesis/Particle Synthesis — rich — check.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const engine = (file, names) => {
  const html = fs.readFileSync(path.join(here, `Particle Synthesis — rich — ${file}.html`), 'utf8');
  const m = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`no engine script in ${file}`);
  return new Function(m[1] + `; return { ${names.join(', ')} };`)();
};
let failed = 0;
const ok = (cond, what) => { console.log(`${cond ? 'pass' : 'FAIL'} · ${what}`); if (!cond) failed++; };
const FS = 48000;

// ---- thrown, or on a spring — § Particle Fountain: First Build ----
{
  const E = engine('thrown, or on a spring', ['simThrow', 'simSpring', 'upCrossings', 'diffs', 'harmonics', 'audioRate', 'arcHarmonicDb', 'mean']);
  const G = 9.81, V0 = 5, W = Math.PI * G / V0;
  const once = E.simThrow({ v0: V0, g: G, e: 0, fs: FS, dur: 1.2 }), apex = Math.max(...once.y);
  ok(Math.abs(once.strikes[0] - 2 * V0 / G) < 1e-4, `thrown once: flight ${once.strikes[0].toFixed(4)} s = 2·v0 ⁄ g ${(2 * V0 / G).toFixed(4)}`);
  ok(Math.abs(apex - V0 * V0 / 2 / G) < 1e-4, `thrown once: top ${apex.toFixed(4)} m = v0² ⁄ 2g ${(V0 * V0 / 2 / G).toFixed(4)}`);
  const inFlight = once.a.slice(0, Math.round(once.strikes[0] * FS) - 2);
  ok(Math.max(...inFlight) === -G && Math.min(...inFlight) === -G, 'thrown once: the acceleration is −g at every sample of the flight, whatever the height');
  // parabola: second differences of height are constant
  { const y = once.y, d2 = []; for (let i = 2; i < Math.round(0.9 * once.strikes[0] * FS); i++) d2.push(y[i] - 2 * y[i - 1] + y[i - 2]); const spread = Math.max(...d2) - Math.min(...d2); ok(spread < 1e-12, `thrown once: the path's second difference is constant (spread ${spread.toExponential(1)}): a parabola`); }
  for (const e of [0.3, 0.45, 0.7, 0.9]) {
    const fl = E.diffs([0, ...E.simThrow({ v0: V0, g: G, e, fs: FS, dur: 8 }).strikes]).slice(0, 5), worst = Math.max(...fl.slice(1).map((t, i) => Math.abs(t / fl[i] - e)));
    ok(worst < 1e-3, `floor, e = ${e}: each flight is e times the last (worst off ${worst.toExponential(1)})`);
  }
  const dr = E.diffs([0, ...E.simThrow({ v0: V0, g: G, e: 0.45, drag: 1e-4 / 0.010, fs: FS, dur: 3 }).strikes]);
  console.log(`  with the build's air drag (k = 1e-4 kg/m, m = 10 g): flights ${dr.slice(0, 4).map((x) => x.toFixed(4)).join(', ')} s; ratio ${(dr[1] / dr[0]).toFixed(4)}`);
  ok(Math.abs(dr[0] - 2 * V0 / G) < 0.01 && Math.abs(dr[1] / dr[0] - 0.45) < 0.005, 'with the build\'s drag the flights shrink by about e too: drag bends the arcs a little and adds no spring');
  const s1 = E.diffs(E.upCrossings(E.simSpring({ v0: V0, w: W, zeta: 0.04, fs: FS, dur: 6 }).y, FS));
  const s2 = E.diffs(E.upCrossings(E.simSpring({ v0: 2 * V0, w: W, zeta: 0.04, fs: FS, dur: 6 }).y, FS));
  const pred = 2 * Math.PI / (W * Math.sqrt(1 - 0.04 ** 2));
  ok(Math.max(...s1, ...s2) - Math.min(...s1, ...s2) < 1e-4 && Math.abs(s1[0] - pred) < 2e-3, `spring: every period ${s1[0].toFixed(5)} s (2π ⁄ ω·√(1 − ζ²) = ${pred.toFixed(5)}), the same while it dies and when pushed twice as hard`);
  const fa = E.simThrow({ v0: V0, g: G, e: 0.45, fs: FS, dur: 3 }).strikes[0], fb = E.simThrow({ v0: 2 * V0, g: G, e: 0.45, fs: FS, dur: 5 }).strikes[0];
  ok(Math.abs(fb / fa - 2) < 1e-3, `thrown twice as hard: first flight × ${(fb / fa).toFixed(4)}`);
  const rows = [];
  for (const hard of [false, true]) {
    const ar = E.audioRate(220, hard, FS, 1.0), ht = E.harmonics(ar.thr.y, FS, 6, ar.thrPeriod), hs = E.harmonics(ar.spr.y, FS, 6, ar.sprPeriod);
    rows.push({ throw: hard ? 'twice as hard' : 'gentle', 'bouncing f0': +ht.f0.toFixed(2), 'H2..H5 dB': ht.rows.slice(1, 5).map((q) => q.dB.toFixed(2)).join(' '), 'spring f0': +hs.f0.toFixed(3), 'spring loudest harmonic dB': +Math.max(...hs.rows.slice(1).map((q) => q.dB)).toFixed(1) });
    const worst = Math.max(...ht.rows.slice(1, 5).map((q) => Math.abs(q.dB - E.arcHarmonicDb(q.k))));
    ok(worst < 0.05, `audio rate, ${hard ? 'twice as hard' : 'gentle'}: the bouncing particle's harmonics fall as 1 ⁄ n² (worst ${worst.toFixed(3)} dB off)`);
    ok(Math.max(...hs.rows.slice(1).map((q) => q.dB)) < -120, `audio rate, ${hard ? 'twice as hard' : 'gentle'}: the spring has no harmonic above −120 dB`);
    ok(Math.abs(ht.f0 - (hard ? 110 : 220)) < 0.01 && Math.abs(hs.f0 - 220) < 0.05, `audio rate, ${hard ? 'twice as hard' : 'gentle'}: bouncing at ${ht.f0.toFixed(2)} Hz, spring at ${hs.f0.toFixed(3)} Hz`);
  }
  console.table(rows);
}

// ---- one click, one law — § Dispersion as Physics ----
{
  const E = engine('one click, one law', ['clickThrough', 'bandArrival', 'arrival', 'barRatios', 'barStrike', 'partialsOf', 'buildChirp', 'correlation', 'rmsRatio', 'band']);
  // the test: the GPU build's written chirp (gpu-fountain.html:252–259) against the click carried exactly through the law
  for (const r of [1, 3, 8, 16]) {
    const ex = E.clickThrough('ice', r, FS), bu = E.buildChirp(r, FS); let worst = 0;
    for (const f of [125, 250, 500, 1000, 2000, 4000, 8000]) worst = Math.max(worst, Math.abs(E.bandArrival(ex, f, FS) - E.bandArrival(bu, f, FS)));
    const c = E.correlation(ex, bu), g = E.rmsRatio(ex, bu);
    ok(c > 0.999 && Math.abs(g - 1) < 0.01 && worst < 0.0005, `the build's formula vs exact, ${r} m: correlation ${c.toFixed(5)}, loudness ${g.toFixed(4)}, bands within ${(worst * 1000).toFixed(3)} ms`);
  }
  // and it can fail: the same formula with its phase turned the wrong way (−π⁄4), or the build's C taken twice, parts from the exact sound
  { const ex = E.clickThrough('ice', 8, FS), bu = E.buildChirp(8, FS), T0 = 0.02, C = 0.316, wrong = new Float64Array(bu.length), wrongC = E.clickThrough('ice', 8 / Math.SQRT2, FS);
    for (let n = 0; n < bu.length; n++) { const t = n / FS - T0; if (t <= 0) continue; const w = 64 / (4 * C * t * t), f = w / (2 * Math.PI); if (f >= FS / 2 || f <= 20) continue; const S = E.band(f) * Math.exp(-f * 8 / 80000) / Math.sqrt(8), p2 = 8 / (4 * Math.sqrt(C) * Math.pow(w, 1.5)); wrong[n] = (1 / Math.PI) * S * Math.sqrt(2 * Math.PI / p2) * Math.cos(-(64 / (4 * C)) / t - Math.PI / 4) / FS; }
    const c1 = E.correlation(ex, wrong), c2 = E.correlation(wrongC, bu);
    ok(Math.abs(c1) < 0.2 && Math.abs(c2) < 0.5, `the test can fail: phase −π⁄4 correlates ${c1.toFixed(3)}; the law at twice C correlates ${c2.toFixed(3)}`); }
  const bands = [125, 250, 500, 1000, 2000, 4000, 8000], rows = [];
  for (const r of [4, 8, 16]) {
    const ice = E.clickThrough('ice', r, FS), none = E.clickThrough('none', r, FS);
    let worst = 0, worstN = 0;
    for (const f of bands) { const p = E.arrival('ice', r, f), m = E.bandArrival(ice, f, FS), n = E.bandArrival(none, f, FS); worst = Math.max(worst, Math.abs(m - p) / p); worstN = Math.max(worstN, Math.abs(n - r / 340)); if (r === 8) rows.push({ band: f, 'ice law ms': +(p * 1000).toFixed(2), 'ice measured ms': +(m * 1000).toFixed(2), 'one speed measured ms': +(n * 1000).toFixed(2) }); }
    ok(worst < 0.015, `check, not test (the engine sets the phase by the law), ice, ${r} m: every band peaks within ${(worst * 100).toFixed(2)} % of r ⁄ (2·√(C·ω)), highs first`);
    ok(worstN < 1e-4, `one speed, ${r} m: every band arrives at r ⁄ c within ${(worstN * 1e6).toFixed(1)} µs: the click arrives whole`);
  }
  console.table(rows);
  const tab = [];
  for (const ends of ['pinned', 'free']) for (const law of ['straight', 'bent']) {
    const pred = E.barRatios(law, ends, 4), got = E.partialsOf(E.barStrike(E.barRatios(law, ends, 8), 330, FS, 2.5), FS, 4).map((f, i, a) => f / a[0]);
    const worst = Math.max(...pred.map((p, i) => Math.abs(p - got[i]) / p));
    tab.push({ ends, law, law_ratios: pred.map((x) => x.toFixed(4)).join(' '), measured: got.map((x) => x.toFixed(4)).join(' ') });
    ok(worst < 1e-3, `bar, ${ends}, ${law}: the struck sound holds the law's partials (worst ${(worst * 100).toFixed(3)} %)`);
  }
  console.table(tab);
  const fr = E.barRatios('bent', 'free', 4);
  ok(Math.abs(fr[1] - 2.7565) < 1e-3 && Math.abs(fr[2] - 5.4039) < 1e-3 && Math.abs(fr[3] - 8.9330) < 1e-3, `free bar, bending law: ${fr.slice(1).map((x) => x.toFixed(4)).join(', ')}, the textbook 2.756, 5.404, 8.933 (Fletcher & Rossing)`);
  ok(E.barRatios('straight', 'pinned', 4).every((x, i) => Math.abs(x - (i + 1)) < 1e-12) && E.barRatios('bent', 'pinned', 4).every((x, i) => Math.abs(x - (i + 1) ** 2) < 1e-9), 'pinned bar: straight law 1, 2, 3, 4; bending law 1, 4, 9, 16 (shown: it follows from the law in one line)');
  // no wrap: a far click's lows don't come round the end of the window
  { const far = E.clickThrough('ice', 20, FS); let a = 0, b = 0; for (let i = 0; i < far.length; i++) (i > far.length - 0.3 * FS ? (b += far[i] ** 2) : (a += far[i] ** 2)); ok(b / (a + b) < 1e-9, `20 m: no energy wraps round the window (tail share ${(b / (a + b)).toExponential(1)})`); }
}

// ---- which way the colours run — § The Prism Metaphor ----
{
  const E = engine('which way the colours run', ['nGlass', 'ngGlass', 'deviation', 'glassArrival', 'colourPitch', 'swellArrival', 'clickThrough', 'bandArrival', 'arrival']);
  ok(Math.abs(E.nGlass(587.56) - 1.5168) < 1e-4, `N-BK7 at the helium d line: n = ${E.nGlass(587.56).toFixed(5)}, Schott's catalogue 1.5168`);
  ok(E.deviation(410, 60, 50) > E.deviation(700, 60, 50), `prism: violet turned ${E.deviation(410, 60, 50).toFixed(2)}°, red ${E.deviation(700, 60, 50).toFixed(2)}°`);
  const gl = (E.glassArrival(486, 1000) - E.glassArrival(656, 1000)) * 1e9, gl2 = (E.glassArrival(410, 1000) - E.glassArrival(700, 1000)) * 1e9;
  ok(gl > 0 && gl2 > 0, `glass, 1 km: red 656 nm leads blue 486 nm by ${gl.toFixed(1)} ns; 700 nm leads 410 nm by ${gl2.toFixed(1)} ns (the lows first)`);
  ok(Math.abs(E.colourPitch(700) - 389.5) < 0.5 && Math.abs(E.colourPitch(410) - 665) < 0.5 && E.colourPitch(410) / E.colourPitch(700) < 2, `forty octaves down: 700 nm at ${E.colourPitch(700).toFixed(1)} Hz, 410 nm at ${E.colourPitch(410).toFixed(1)} Hz, less than an octave apart`);
  const s20 = E.swellArrival(20, 2e6) / 86400, s10 = E.swellArrival(10, 2e6) / 86400;
  ok(Math.abs(s20 - 1.48) < 0.01 && Math.abs(s10 - s20 - 1.48) < 0.01, `deep sea, 2000 km: 20 s swell at ${s20.toFixed(2)} days, 10 s at ${s10.toFixed(2)}: a day and a half ahead`);
  const ice = E.clickThrough('ice', 8, FS), water = E.clickThrough('water', 8, FS);
  const i250 = E.bandArrival(ice, 250, FS), i8k = E.bandArrival(ice, 8000, FS), w250 = E.bandArrival(water, 250, FS), w8k = E.bandArrival(water, 8000, FS);
  ok(i8k < i250, `ice, 8 m, measured: 8 kHz at ${(i8k * 1000).toFixed(1)} ms before 250 Hz at ${(i250 * 1000).toFixed(1)} ms (lead ${((i250 - i8k) * 1000).toFixed(1)} ms)`);
  ok(w250 < w8k, `water law, 8 m, measured: 250 Hz at ${(w250 * 1000).toFixed(1)} ms before 8 kHz at ${(w8k * 1000).toFixed(1)} ms (lead ${((w8k - w250) * 1000).toFixed(1)} ms)`);
  for (const f of [250, 1000, 8000]) { const m = E.bandArrival(water, f, FS), p = E.arrival('water', 8, f); ok(Math.abs(m - p) < Math.max(0.001, 0.02 * p), `water law, ${f} Hz: measured ${(m * 1000).toFixed(1)} ms, law ${(p * 1000).toFixed(1)} ms`); }
}

console.log(failed ? `\n${failed} claim(s) FAILED` : '\nall claims hold');
process.exit(failed ? 1 : 0);
