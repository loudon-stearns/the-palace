// title: Dispersion — rich — check
// born: 2026-11-03
// links: [[Dispersion]] (connects-to · rich-face-check) · checks the two made pieces in [[Dispersion — rich.json]]
// forward_vector: I run each made piece's own engine, lifted out of its page, in Node, against the claim the piece makes: on a plain string crests and groups keep one speed and a pulse keeps its shape; on a stiff string the group outruns the crests, the partials go sharp and the highs land first; on a beaded string all three run the other way; and the section's all-pass recipe matches a stiff string's chirp in time while leaving a struck note's partials exactly where they were. I also carry the evidence for the offers the pieces make. I exit 1 if any claim fails.
// run: node "Dispersion/Dispersion — rich — check.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const engine = (file, names) => {
  const html = fs.readFileSync(path.join(here, `Dispersion — rich — ${file}.html`), 'utf8');
  const m = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`no engine script in ${file}`);
  return new Function(m[1] + `; return { ${names.join(', ')} };`)();
};
let failed = 0;
const ok = (cond, what) => { console.log(`${cond ? 'pass' : 'FAIL'} · ${what}`); if (!cond) failed++; };
const FS = 48000;

// ---- what spreads, and which way — § Three Meanings of Dispersion (1. Wave Dispersion) ----
{
  const E = engine('what spreads, and which way', ['LAWS', 'vp', 'vg', 'partial', 'cents', 'measureCrest', 'measureSpeeds', 'pulseAt', 'clickDown', 'bandArrival', 'arrivalLaw', 'strike', 'partialsIn', 'beatRate', 'F0', 'B', 'FMAX', 'kOf', 'wOf']);
  const LAWS = ['plain', 'stiff', 'beaded'];
  // step 1 and 2: a crest moves at ω ⁄ k, measured from the drawn wave
  for (const law of LAWS) for (const n of [1, 6, 12, 20]) { const m = E.measureCrest(law, n), p = E.vp(law, n * E.F0); ok(Math.abs(m - p) < 1e-4, `${law}, wavelength 2L/${n}: crest measured ${m.toFixed(5)} c, ω/k ${p.toFixed(5)} c`); }
  ok(Math.abs(E.measureCrest('plain', 1) - E.measureCrest('plain', 24)) < 1e-6, 'plain string: every wavelength\'s crest moves at c');
  // step 3: the swell moves at Δω ⁄ Δk, close to dω ⁄ dk; the crests at the mean phase speed
  for (const law of LAWS) for (const n0 of [5, 12, 20]) {
    const d = n0 / 10, ms = E.measureSpeeds(law, n0, d), k1 = E.kOf(n0 - d), k2 = E.kOf(n0 + d), w1 = E.wOf(law, n0 - d), w2 = E.wOf(law, n0 + d);
    ok(Math.abs(ms.group - (w2 - w1) / (k2 - k1)) < 2e-3 && Math.abs(ms.crest - (w1 + w2) / (k1 + k2)) < 0.01, `${law}, n0 = ${n0}: swell ${ms.group.toFixed(4)} (Δω/Δk ${((w2 - w1) / (k2 - k1)).toFixed(4)}, dω/dk ${E.vg(law, n0 * E.F0).toFixed(4)}), crest ${ms.crest.toFixed(4)} (mean ω/k ${((w1 + w2) / (k1 + k2)).toFixed(4)}; a crest read off the summed wave sits within 1%)`);
  }
  for (const n of [5, 12, 20]) { const v = n * E.F0; ok(E.vg('stiff', v) > E.vp('stiff', v) && E.vp('stiff', v) > 1 && E.vg('beaded', v) < E.vp('beaded', v) && E.vp('beaded', v) < 1, `wavelength 2L/${n}: stiff group ${E.vg('stiff', v).toFixed(3)} > crest ${E.vp('stiff', v).toFixed(3)} > 1; beaded group ${E.vg('beaded', v).toFixed(3)} < crest ${E.vp('beaded', v).toFixed(3)} < 1`); }
  { const nu = 6 * E.F0, b = LAWS.map((l) => E.beatRate(l, nu, 0.75)); ok(Math.abs(b[0] - 1.5) < 1e-12 && b[1] > 1.5 && b[2] < 1.5, `beat of two tones 1.5 Hz apart in plain frequency, at partial 6: plain ${b[0].toFixed(3)}, stiff ${b[1].toFixed(3)}, beaded ${b[2].toFixed(3)} a second`); }
  // step 4: the pulse, riding at c — plain keeps its shape; stiff sheds ripples ahead, beaded behind
  { let worst = 0; for (let xi = -1.6; xi <= 1.6; xi += 0.01) worst = Math.max(worst, Math.abs(E.pulseAt('plain', xi, 3) - E.pulseAt('plain', xi, 0))); ok(worst < 1e-9, `plain pulse after 3 L/c: shape unchanged (worst ${worst.toExponential(1)})`); }
  for (const law of ['stiff', 'beaded']) { let ahead = 0, behind = 0; for (let xi = -1.6; xi <= 1.6; xi += 0.005) { const v = E.pulseAt(law, xi, 3) ** 2; if (xi > 0.15) ahead += v; else if (xi < -0.15) behind += v; } ok(law === 'stiff' ? ahead > 5 * behind : behind > 5 * ahead, `${law} pulse after 3 L/c: energy ahead ${ahead.toFixed(1)}, behind ${behind.toFixed(1)}`); }
  // step 5: the test — one bend, two signatures, measured from the renders
  const rows = [];
  for (const law of LAWS) {
    const s = E.strike(law, FS, 2.4), want = []; for (let n = 1; n <= 16; n++) want.push(E.partial(law, n));
    const p = E.partialsIn(s, FS, want), c8 = E.cents(p[7], 8 * p[0]), c16 = E.cents(p[15], 16 * p[0]);
    const worstP = Math.max(...p.map((f, i) => Math.abs(E.cents(f, want[i]))));
    const y = E.clickDown(law, FS), a250 = E.bandArrival(y, 250, FS), a1200 = E.bandArrival(y, 1200, FS);
    rows.push({ string: law, 'partial 8 ¢': +c8.toFixed(2), 'partial 16 ¢': +c16.toFixed(2), '250 Hz ms': +(a250 * 1000).toFixed(2), '1.2 kHz ms': +(a1200 * 1000).toFixed(2), 'law 250': +(E.arrivalLaw(law, 250) * 1000).toFixed(2), 'law 1.2k': +(E.arrivalLaw(law, 1200) * 1000).toFixed(2) });
    ok(worstP < 0.01, `${law}: every measured partial within ${worstP.toFixed(4)} ¢ of the law read at ν = n·f0 (a check of the code)`);
    ok(Math.abs(a250 - E.arrivalLaw(law, 250)) < 0.0015 && Math.abs(a1200 - E.arrivalLaw(law, 1200)) / E.arrivalLaw(law, 1200) < 0.01, `${law}: bands land where T·dν/df says (250 Hz ${(a250 * 1000).toFixed(2)} ms, 1.2 kHz ${(a1200 * 1000).toFixed(2)} ms)`);
    const sharp = c16 > 0.5 ? 1 : c16 < -0.5 ? -1 : 0, highsFirst = a1200 < a250 - 5e-4 ? 1 : a1200 > a250 + 5e-4 ? -1 : 0;
    ok(sharp === highsFirst && sharp === { plain: 0, stiff: 1, beaded: -1 }[law], `${law}: the bend decides both — partials ${sharp > 0 ? 'sharp' : sharp < 0 ? 'flat' : 'on the grid'}, ${highsFirst > 0 ? 'highs land first' : highsFirst < 0 ? 'lows land first' : 'all land together'}`);
  }
  console.table(rows);
  let worstF = 0; for (let n = 1; n <= 40; n++) worstF = Math.max(worstF, Math.abs(E.partial('stiff', n) / (n * E.F0 * Math.sqrt(1 + E.B * n * n)) - 1));
  ok(worstF < 1e-12, `the stiff string's curve read at ν = n·f0 is the section's f_n = n·f0·√(1 + B·n²) (worst ratio off 1 by ${worstF.toExponential(1)})`);
  // the bend is one way all along: ω'' keeps its sign over the range drawn
  for (const law of ['stiff', 'beaded']) { let sgn = 0, flips = 0; for (let v = 20; v < 24 * E.F0; v += 10) { const d2 = E.vg(law, v + 1) - E.vg(law, v - 1), s = Math.sign(d2); if (sgn && s && s !== sgn) flips++; if (s) sgn = s; } ok(flips === 0, `${law}: the curve bends one way over partials 1–24 (${sgn > 0 ? 'up' : 'down'})`); }
}

// ---- the recipe, built — § Convolution and Artificial Dispersion ----
{
  const E = engine('the recipe, built', ['fitCascade', 'runCascade', 'shapedClick', 'bandArrival', 'travel', 'strike', 'partialsIn', 'stiffPartial', 'cents', 'apDelay', 'apMag', 'PASSES', 'NFFT', 'fft', 'T0']);
  // step 1: one section, level one, delay (1 − a)/(1 + a) at DC, first sample a
  for (const a of [-0.3, -0.7, -0.9, -0.98]) {
    let dev = 0; for (let i = 1; i < 2000; i++) dev = Math.max(dev, Math.abs(E.apMag(a, Math.PI * i / 2000) - 1));
    const imp = new Float64Array(64); imp[0] = 1; const h = E.runCascade(imp, { sections: [a], bulk: 0 });
    ok(dev < 1e-12 && Math.abs(E.apDelay(a, 0) / ((1 - a) / (1 + a)) - 1) < 1e-12 && Math.abs(h[0] - a) < 1e-15 && Math.abs(h[1] - (1 - a * a)) < 1e-12, `one section, a = ${a}: level off one by ${dev.toExponential(1)}; DC delay ${E.apDelay(a, 0).toFixed(3)} samples; h[0] = ${h[0]}, causal; zero at radius ${(1 / Math.abs(a)).toFixed(3)}, outside the circle`);
  }
  // step 2: M sections add their delays — measured from the rendered chirp
  { const a = -0.9, M = 120, click = E.shapedClick(FS, null, 12), y = E.runCascade(click, { sections: new Array(M).fill(a), bulk: 0 }).subarray(0, E.NFFT);
    const meas = (E.bandArrival(Float64Array.from(y), 250, FS) - E.bandArrival(Float64Array.from(y), 4000, FS)) * 1000, pred = M * (E.apDelay(a, 2 * Math.PI * 250 / FS) - E.apDelay(a, 2 * Math.PI * 4000 / FS)) / FS * 1000;
    ok(Math.abs(meas - pred) < 0.3, `120 sections at a = −0.9: 250 Hz lands ${meas.toFixed(2)} ms after 4 kHz (M times one section's: ${pred.toFixed(2)} ms)`); }
  // step 3: the fit — the cascade's chirp lands where the string's does
  const fitRows = [];
  for (const B of [0.004, 0.001, 0.0003, 0.0001]) {
    const F = E.fitCascade(B, E.PASSES, FS), ex = E.shapedClick(FS, B, E.PASSES), ca = Float64Array.from(E.runCascade(E.shapedClick(FS, null, E.PASSES), F).subarray(0, E.NFFT));
    const offs = [250, 1000, 4000, 8000].map((f) => Math.abs(E.bandArrival(ex, f, FS) - E.bandArrival(ca, f, FS)) * 1000), o125 = Math.abs(E.bandArrival(ex, 125, FS) - E.bandArrival(ca, 125, FS)) * 1000;
    fitRows.push({ B, sections: F.sections.length, 'delay line': F.bulk, 'worst delay off ms': +F.worstMs.toFixed(3), 'band 250–8k worst off ms': +Math.max(...offs).toFixed(3), '125 Hz off ms': +o125.toFixed(3) });
    ok(F.worstMs < 0.3 && Math.max(...offs) < 0.3 && o125 < 0.5, `B = ${B}: ${F.sections.length} sections; delay within ${F.worstMs.toFixed(3)} ms of the string's, 80 Hz–10 kHz; chirp bands land within ${Math.max(...offs).toFixed(3)} ms (125 Hz: ${o125.toFixed(3)} ms)`);
  }
  console.table(fitRows);
  // step 4 and 5: a struck harmonic note through the cascade keeps its partials; the stiff string's are stretched
  for (const B of [0.001, 0.0001]) {
    const F = E.fitCascade(B, E.PASSES, FS), f1 = E.stiffPartial(1, B), grid = [], str = []; for (let n = 1; n <= 16; n++) { grid.push(n * f1); str.push(E.stiffPartial(n, B)); }
    const harm = E.strike(0, FS, 2.2, f1), thru = E.runCascade(harm, F).subarray(F.bulk, F.bulk + Math.round(2.2 * FS)), stiff = E.strike(B, FS, 2.2);
    const pt = E.partialsIn(thru, FS, grid), ps = E.partialsIn(stiff, FS, str), worstT = Math.max(...pt.map((f, i) => Math.abs(E.cents(f, grid[i])))), worstS = Math.max(...ps.map((f, i) => Math.abs(E.cents(f, str[i]))));
    ok(worstT < 0.01, `B = ${B}: through the cascade every partial stays on n·f1 (worst ${worstT.toFixed(4)} ¢)`);
    ok(worstS < 0.01, `B = ${B}: the stiff string's partials sit on n·f0·√(1 + B·n²) (worst ${worstS.toFixed(4)} ¢); partial 16 is ${E.cents(ps[15], 16 * f1).toFixed(2)} ¢ sharp of n·f1`);
  }
  // offer evidence: a delay that is a straight line in ω still spreads a click (the section says "nonlinear in ω")
  { const N = E.NFFT, re = new Float64Array(N), im = new Float64Array(N), beta = 0.03 / (2 * Math.PI * 8000);   // 30 ms more delay at 8 kHz than at DC, in a straight line
    for (let k = 1; k < N / 2; k++) { const f = k * FS / N, w = 2 * Math.PI * f, mag = 1 / (1 + Math.pow(80 / f, 6)) / (1 + Math.pow(f / 10000, 8)), ph = -w * E.T0 - 0.5 * beta * w * w; re[k] = mag * Math.cos(ph); im[k] = mag * Math.sin(ph); re[N - k] = re[k]; im[N - k] = -im[k]; }
    E.fft(re, im, true); const t = [250, 1000, 4000, 8000].map((f) => E.bandArrival(re, f, FS) * 1000), want = [250, 1000, 4000, 8000].map((f) => beta * 2 * Math.PI * f * 1000);
    ok(Math.max(...t.map((x, i) => Math.abs(x - want[i]) / want[i])) < 0.05 && t[3] - t[0] > 25, `a delay straight in ω (τ = β·ω): bands land at ${t.map((x) => x.toFixed(2)).join(', ')} ms for 250 Hz, 1k, 4k, 8k: a rising chirp ${(t[3] - t[0]).toFixed(1)} ms long, so a linear τ(ω) spreads too`); }
}

console.log(failed ? `\n${failed} claim(s) failed` : '\nevery claim held');
process.exit(failed ? 1 : 0);
