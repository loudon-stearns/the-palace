// Auditory Illusions — rich — check — pitch-is-computed.mjs
// born: 2026-11-08 · checks the four pieces made for [[Auditory Illusions]] § Pitch is computed, not measured:
// "the missing fundamental", "the barber pole and the stair", "the tritone vote", "the octave illusion".
// forward_vector: I re-run, headless, every number those pieces show or rest on: the harmonic spacing and the
// absence of energy at 100 Hz in what the page actually plays (with a positive control that proves the meter can see
// 100 Hz when it is there), the shared period, the phone line's attenuation, the noise that covers the bottom; the
// Risset glide's octave spacing, its window's level at the wrap and its constant loudness, the stair's ends meeting
// only from one view; the tritone's interval both ways round, its two tones matched in power and spectral centre, the
// trial list and its chance figures; the octave illusion's left/right alternation in the plan and in the rendered
// stereo graph, the model's predictions, and the conjunction displays. What a listener hears I cannot check.
//
//   node "Auditory Illusions/Auditory Illusions — rich — check — pitch-is-computed.mjs"      (from the palace root)
//     --static   skip the headless-Chromium renders
//
// It pulls <script id="pc-core"> out of each piece and runs it in a Node sandbox against equations written here on
// their own; then, unless --static, it loads two pieces in headless Chromium (Playwright from STIGMERGY's install)
// and renders their own Web Audio graphs offline. PASS/FAIL per claim, INFO for numbers; exits 1 on any FAIL.
// Reads only; writes nothing.

import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const file = (name) => join(HERE, `Auditory Illusions — rich — ${name}.html`);
const html = (name) => readFileSync(file(name), 'utf8');
const core = (h) => { const m = h.match(/<script id="pc-core">([\s\S]*?)<\/script>/); if (!m) throw new Error('no <script id="pc-core">'); return m[1]; };
const load = (name, sym) => { const E = { Math, Number, Array, Object, JSON, Infinity }; vm.createContext(E); vm.runInContext(core(html(name)) + `\nthis.${sym} = ${sym};`, E); return E[sym]; };

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const info = (name, detail) => console.log(`INFO  ${name}  (${detail})`);
const dB = (v) => 20 * Math.log10(v);
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const PIECES = ['the missing fundamental', 'the barber pole and the stair', 'the tritone vote', 'the octave illusion'];

console.log('— the kit rules, every piece —');
for (const n of PIECES) {
  const h = html(n);
  check(`${n}: declares piece:needs`, /<meta name="piece:needs" content="">/.test(h), 'empty: needs nothing of its host');
  check(`${n}: never names the kit's hush message`, !h.includes('rich:' + 'hush'), 'so the kit keeps hushing');
  check(`${n}: no detached Audio element`, !/new Audio\(/.test(h), 'every sound is Web Audio');
  check(`${n}: an AudioContext only inside a function`, !/^\s*(const|let|var)\s+\w+\s*=\s*new \(?window\.AudioContext/m.test(h), 'none at the top level');
  check(`${n}: a compressor before the destination`, /createDynamicsCompressor\(\)/.test(h), 'present');
}

// ───────────────────────── the missing fundamental ─────────────────────────
console.log('— the missing fundamental —');
const MF = load('the missing fundamental', 'MF');
{
  const ps = MF.partials();
  const fs = ps.map((p) => p.f);
  check('the partials are 200, 300 and 400 Hz', fs.join(',') === '200,300,400', fs.join(', ') + ' Hz');
  check('the spacing is 100 Hz both times', near(fs[1] - fs[0], 100, 1e-9) && near(fs[2] - fs[1], 100, 1e-9), `${fs[1] - fs[0]}, ${fs[2] - fs[1]} Hz`);
  check('no partial is at 100 Hz', fs.every((f) => Math.abs(f - 100) > 1), 'lowest ' + Math.min(...fs) + ' Hz');
  const sh = MF.shared(fs);
  check('the shared period is 10 ms (100 Hz), harmonics 2, 3, 4', sh && near(sh.ms, 10, 1e-9) && sh.ns.join(',') === '2,3,4', sh ? `${sh.ms} ms, n = ${sh.ns}` : 'none');
  // the period of the sum, found here by autocorrelation over 2 to 20 ms, not by the engine's own sieve
  const sr = 48000, N = sr, x = new Float64Array(N); for (let i = 0; i < N; i++) { const t = i / sr; x[i] = ps.reduce((s, p) => s + p.a * Math.sin(2 * Math.PI * p.f * t), 0); }
  // the first lag whose correlation reaches the maximum (a periodic wave peaks again at every multiple of its period)
  const ac = []; for (let lag = Math.round(0.002 * sr); lag <= Math.round(0.025 * sr); lag++) { let s = 0; for (let i = 0; i < N - lag; i++) s += x[i] * x[i + lag]; ac.push([lag, s / (N - lag)]); }
  const best = Math.max(...ac.map((a) => a[1])), bestLag = ac.find((a) => a[1] >= best * 0.999)[0];
  check('the summed wave repeats every 10 ms (autocorrelation, written here)', near(bestLag / sr * 1000, 10, 0.03), `peak at ${(bestLag / sr * 1000).toFixed(3)} ms`);
  const rm = (on) => MF.shared(MF.partials({ on }).map((p) => p.f));
  check('without the 200: 300 + 400 still share 10 ms', near(rm([0, 1, 1]).ms, 10, 1e-9), `${rm([0, 1, 1]).ms} ms`);
  check('without the 400: 200 + 300 still share 10 ms', near(rm([1, 1, 0]).ms, 10, 1e-9), `${rm([1, 1, 0]).ms} ms`);
  check('without the 300: 200 + 400 share only 5 ms', near(rm([1, 0, 1]).ms, 5, 1e-9), `${rm([1, 0, 1]).ms} ms`);
  // shifting keeps the gaps and breaks the period; the fit moves by 9Δ/29
  const s30 = MF.partials({ shift: 30 });
  check('shifted +30 Hz: the gaps stay 100 Hz', near(s30[1].f - s30[0].f, 100, 1e-9) && near(s30[2].f - s30[1].f, 100, 1e-9), s30.map((p) => p.f).join(', ') + ' Hz');
  check('shifted +30 Hz: the best common fit is 100 + 9·30/29 Hz', near(MF.fit(s30), 100 + 9 * 30 / 29, 1e-9), `${MF.fit(s30).toFixed(3)} Hz, written here ${(100 + 9 * 30 / 29).toFixed(3)}`);
  const sh30 = MF.shared(s30.map((p) => p.f));
  info('shifted +30 Hz: the shared period', sh30 ? `${sh30.f0.toFixed(2)} Hz, harmonics ${sh30.ns}` : 'none above 20 Hz within 3 cents');
  const sh50 = MF.shared(MF.partials({ shift: 50 }).map((p) => p.f));
  info('shifted +50 Hz: 250, 350, 450 share a period again', sh50 ? `${sh50.f0.toFixed(2)} Hz, harmonics ${sh50.ns}: an octave down, odd harmonics far apart` : 'none');
  const st = MF.partials({ stretch: 0.1 });
  check('stretched s = 0.10: no shared period above 20 Hz', MF.shared(st.map((p) => p.f)) === null, st.map((p) => p.f.toFixed(1)).join(', ') + ' Hz; implied ' + MF.implied(st).map((v) => v.toFixed(1)).join(', ') + ` Hz, spread ${MF.spreadCents(st).toFixed(0)} ¢`);
  // the phone line, from Web Audio's own biquad formulas (RBJ cookbook), cross-checked against the Butterworth closed form
  const H = (f) => dB(MF.phoneMag(f));
  const bw = (f) => 3 * -10 * Math.log10(1 + Math.pow(300 / f, 4)) + 2 * -10 * Math.log10(1 + Math.pow(f / 3400, 4));
  [100, 200, 300, 1000, 3400].forEach((f) => info(`phone line at ${f} Hz`, `${H(f).toFixed(2)} dB (analogue Butterworth stages: ${bw(f).toFixed(2)} dB)`));
  check('the phone line takes ≥ 50 dB at the voice’s 100 Hz', H(100) <= -50, `${H(100).toFixed(1)} dB`);
  check('the phone line takes ≥ 18 dB at its 200 Hz', H(200) <= -18, `${H(200).toFixed(1)} dB`);
  check('the phone line passes 1 kHz within 0.5 dB', Math.abs(H(1000)) < 0.5, `${H(1000).toFixed(2)} dB`);
  const piece = html('the missing fundamental');
  const eqm = piece.match(/\|H\(100 Hz\)\| ≈ −(\d+) dB,\s+\|H\(200 Hz\)\| ≈ −(\d+) dB/);
  check('the step 6 equation states the line’s attenuation as computed here', eqm && Math.abs(-Number(eqm[1]) - H(100)) < 1 && Math.abs(-Number(eqm[2]) - H(200)) < 1, eqm ? `page says −${eqm[1]} and −${eqm[2]} dB; computed ${H(100).toFixed(1)} and ${H(200).toFixed(1)}` : 'equation not found');
  // the voice: share of its power below 300 Hz, with and without the line (f0 at its centre, 100 Hz)
  let lo0 = 0, all0 = 0, lo1 = 0, all1 = 0;
  for (let n = 1; n * 100 < 20000; n++) { const a0 = MF.voiceHarm(n, 100, false), a1 = MF.voiceHarm(n, 100, true); all0 += a0 * a0; all1 += a1 * a1; if (n * 100 < 300) { lo0 += a0 * a0; lo1 += a1 * a1; } }
  info('the voice: share of power below 300 Hz', `${(100 * lo0 / all0).toFixed(1)} % without the line, ${(100 * lo1 / all1).toFixed(3)} % with it`);
  const fit2 = MF.fit([{ n: 3, f: 300 }, { n: 4, f: 400 }, { n: 5, f: 500 }]);
  check('what the line leaves (harmonics 3, 4, 5 …) still fits 100 Hz', near(fit2, 100, 1e-9), `${fit2} Hz`);
}

// ───────────────────────── the barber pole and the stair ─────────────────────────
console.log('— the barber pole and the stair (the Risset glide) —');
const RG = load('the barber pole and the stair', 'RG');
{
  let worstRatio = 0, sumDev = 0, powDev = 0, lo = Infinity, hi = 0;
  for (let j = 0; j < 4000; j++) {
    const p = j / 4000 * 3 * RG.N - RG.N;            // three loops, starting below zero
    const v = RG.voices(p).slice().sort((a, b) => a.f - b.f);
    for (let i = 1; i < v.length; i++) worstRatio = Math.max(worstRatio, Math.abs(v[i].f / v[i - 1].f - 2));
    const s = v.reduce((a, b) => a + b.g, 0), q = v.reduce((a, b) => a + b.g * b.g, 0);
    sumDev = Math.max(sumDev, Math.abs(s - RG.N / 2)); powDev = Math.max(powDev, Math.abs(q - 3 * RG.N / 8));
    v.forEach((x) => { lo = Math.min(lo, x.f); hi = Math.max(hi, x.f); });
  }
  check('the eight voices are exactly an octave apart, everywhere on the climb', worstRatio < 1e-9, `worst |ratio − 2| = ${worstRatio.toExponential(2)}`);
  check('the voices stay inside 25 Hz to 6.4 kHz', lo >= 25 - 1e-9 && hi <= 6400 + 1e-9, `${lo.toFixed(2)} to ${hi.toFixed(1)} Hz`);
  check('the window is zero at both ends', RG.win(0) === 0 && Math.abs(RG.win(RG.N)) < 1e-15, `g(0) = ${RG.win(0)}, g(8) = ${RG.win(RG.N).toExponential(1)}`);
  // the largest level a voice can have when it wraps: the piece moves the glide at most 1/30 s per frame, whatever the
  // frame rate, so at the top speed (0.6 oct/s) a voice wraps at most 0.02 octave from the window's edge
  const bp = html('the barber pole and the stair');
  check('the piece clamps a frame to 1/30 s of glide', /dt = Math\.min\(1 \/ 30,/.test(bp), 'dt = Math.min(1 / 30, …)');
  const dx = 0.6 / 30, gw = RG.win(dx);
  check('a wrapping voice is ≥ 80 dB under the top of the window, at any frame rate', dB(gw) <= -80, `at most ${dB(gw).toFixed(1)} dB (${dx.toFixed(3)} oct from the edge); at 60 fps ${dB(RG.win(0.01)).toFixed(1)} dB`);
  check('the levels always add to 4 (N/2): the mix neither swells nor sags', sumDev < 1e-9, `worst deviation ${sumDev.toExponential(2)}`);
  check('the squared levels always add to 3 (3N/8): constant power', powDev < 1e-9, `worst deviation ${powDev.toExponential(2)}`);
  check('the flat window is matched in power: N·FLAT² = 3', near(RG.N * RG.FLAT * RG.FLAT, 3, 1e-12), `${(RG.N * RG.FLAT * RG.FLAT).toFixed(6)}`);
  const peak = RG.A * RG.N / 2;
  check('the summed amplitude cannot reach the compressor’s threshold', peak < Math.pow(10, -3 / 20), `at most ${peak.toFixed(2)} (${dB(peak).toFixed(1)} dBFS) against −3 dBFS`);
  // the stair: the step after the top lands on the first step, on screen, only from the special view
  const cells = RG.stairCells(), n = 2 * RG.STAIR.n1 + 2 * RG.STAIR.n3, a = cells[0], b = cells[n];
  const gap = (az) => { const V = RG.stairView(az), p = V.P([a.x, a.y, a.z]), q = V.P([b.x, b.y, b.z]); return Math.hypot(p[0] - q[0], p[1] - q[1]); };
  check('the stair has 16 steps rising 0.25 each: 4 in all', n === 16 && near(b.z - a.z, 4, 1e-12), `${n} steps, rise ${b.z - a.z}`);
  check('from the special view the ends land on one point', gap(0) < 1e-9, `${gap(0).toExponential(2)} units apart, elevation ${RG.stairView(0).el.toFixed(2)}°`);
  check('walk 15° round and they come apart', gap(15) > 0.5 && gap(-15) > 0.5, `${gap(15).toFixed(2)} and ${gap(-15).toFixed(2)} units (a step is 1)`);
}

// ───────────────────────── the tritone vote ─────────────────────────
console.log('— the tritone vote —');
const TP = load('the tritone vote', 'TP');
{
  const c = TP.tone(0), f = TP.tone(6), r = Math.pow(2, 6 / 12);
  const upOK = f.every((x) => x.f / r < TP.FLO || c.some((y) => near(x.f / y.f, r, 1e-12)));
  const downOK = f.every((x) => c.some((y) => near(y.f / x.f, r, 1e-12) || y.f * 2 > TP.FHI));
  check('every F♯ component is 2^(6/12) above a C component (six up; the lowest has its C under 20 Hz)', upOK, `ratio ${r.toFixed(6)}`);
  check('and 2^(6/12) below the next C (six down)', downOK, 'the same ratio the other way round');
  check('a tritone is its own inversion: 2^(6/12) · 2^(6/12) = 2', near(r * r, 2, 1e-12), `${(r * r).toFixed(12)}`);
  const pw = [...Array(12).keys()].map((k) => TP.power(TP.tone(k))), ce = [...Array(12).keys()].map((k) => TP.centre(TP.tone(k)) - Math.log2(TP.CENTER));
  const pwSpread = dB(Math.max(...pw) / Math.min(...pw)) / 2, ceSpread = Math.max(...ce.map(Math.abs));
  check('all twelve tones match in power', pwSpread < 0.01, `spread ${pwSpread.toExponential(2)} dB`);
  check('all twelve tones share one spectral centre (no brightness cue)', ceSpread < 1e-3, `worst ${ceSpread.toExponential(2)} octave from 400 Hz, ${(1200 * ceSpread).toFixed(2)} cents`);
  info('components per tone', [...Array(12).keys()].map((k) => TP.NAMES[k] + ' ' + TP.tone(k).length).join(', '));
  const edge = Math.max(...[...Array(12).keys()].map((k) => { const t = TP.tone(k); return Math.max(t[0].g, t[t.length - 1].g); }));
  info('the loudest component cut by the 20 Hz / 10 kHz edges would have been', `${dB(edge).toFixed(1)} dB re the bell's top`);
  let lists = 0, bad = 0; for (let s = 1; s <= 200; s++) { let seed = s; const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; const L = TP.trials(rand); lists++;
    const tri = L.filter((t) => t.kind === 'tritone'), ca = L.filter((t) => t.kind === 'catch');
    const twice = [...Array(12).keys()].every((k) => tri.filter((t) => t.a === k).length === 2);
    const tOK = tri.every((t) => (t.b - t.a + 12) % 12 === 6), cOK = ca.every((t) => { const d = (t.b - t.a + 12) % 12; return (d === 2 && t.short === 'up') || (d === 10 && t.short === 'down'); });
    if (!(L.length === 32 && tri.length === 24 && ca.length === 8 && twice && tOK && cOK && ca.filter((t) => t.short === 'up').length === 4)) bad++; }
  check('every trial list: 24 tritones (each first pitch class twice) and 8 two-semitone catches, 4 each way', bad === 0, `${lists} lists drawn, ${bad} wrong`);
  check('chance of 7 or more of 8 by guessing is 9/256', near(TP.tail(7, 8), 9 / 256, 1e-12), `${(100 * TP.tail(7, 8)).toFixed(2)} %`);
  // the tritone arm: six opposite pairs, each heard four times; a pair passes when consistent and opposite
  check('a coin passes one opposite pair with chance 1/8', TP.PASS_P === 1 / 8, '2 of 16 answer patterns');
  check('chance of 4 or more of 6 pairs by coin is 778/262144 (0.30 %)', near(TP.tail(4, 6, 1 / 8), 778 / 262144, 1e-12), `${(100 * TP.tail(4, 6, 1 / 8)).toFixed(3)} %`);
  const sim = (pUp, pRight, runs) => { let seed = 99, pass = 0; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let r = 0; r < runs; r++) { const ans = []; for (let k = 0; k < 12; k++) for (let rep = 0; rep < 2; rep++) {
      // a listener whose top is near C hears k → k+6 go down when k is in {10, 11, 0, 1, 2, 3}
      const truth = [10, 11, 0, 1, 2, 3].includes(k) ? 'down' : 'up';
      const dir = pRight != null ? (rnd() < pRight ? truth : (truth === 'up' ? 'down' : 'up')) : (rnd() < pUp ? 'up' : 'down');
      ans.push({ a: k, dir }); }
      if (TP.opposites(ans).filter((o) => o.pass).length >= TP.PASS_AT) pass++; } return pass / runs; };
  const always = TP.opposites([...Array(12).keys()].flatMap((k) => [{ a: k, dir: 'up' }, { a: k, dir: 'up' }])).filter((o) => o.pass).length;
  check('a reader who always presses up passes no pair', always === 0, `${always} of 6`);
  check('a reader biased 90 % to up passes the rule rarely', sim(0.9, null, 20000) < 0.01, `${(100 * sim(0.9, null, 20000)).toFixed(2)} % of 20000 simulated runs`);
  check('a coin reader passes about 0.30 % of runs', near(sim(0.5, null, 200000), TP.tail(4, 6, 1 / 8), 0.001), `${(100 * sim(0.5, null, 200000)).toFixed(3)} % simulated`);
  info('a real paradox listener, right 90 % of the time, passes', `${(100 * sim(null, 0.9, 20000)).toFixed(1)} % of runs (right 85 %: ${(100 * sim(null, 0.85, 20000)).toFixed(1)} %)`);
  const page = html('the tritone vote');
  check('the rules the test states before its first pair match these figures', page.includes('(3.5 % by chance)') && page.includes('(0.30 % by chance)'), '3.5 % and 0.30 %');
  check('a short run reads "not shown", not "against the page"', page.includes('Consistency was not shown this run') && !page.includes('goes against the page'), '');
  const top = TP.topOf([0, 1, 2, 3, 10, 11].map((k) => ({ k, down: true })).concat([4, 5, 6, 7, 8, 9].map((k) => ({ k, down: false }))));
  void 0;
  check('the circle’s top lands in the middle of the pitch classes heard high', top && near(top.k, 0.5, 1e-9), top ? `k = ${top.k.toFixed(3)} (between C and C♯)` : 'none');
}

// ───────────────────────── the octave illusion ─────────────────────────
console.log('— the octave illusion —');
const OI = load('the octave illusion', 'OI');
{
  const p = OI.plan(80, {});
  check('every segment lasts 250 ms', p.every((s, i) => near(s.t, i * 0.25, 1e-12)), '80 segments, 20 s');
  check('the ears are always opposite: one 400 Hz, the other 800 Hz', p.every((s) => s.L !== s.R && [s.L, s.R].sort().join() === '400,800'), 'all 80');
  check('each ear alternates every segment', p.every((s, i) => !i || (s.L !== p[i - 1].L && s.R !== p[i - 1].R)), 'high, low, high, low');
  check('the first segment puts 800 Hz on the left', p[0].L === 800 && p[0].R === 400, `L ${p[0].L}, R ${p[0].R}`);
  check('800 is an octave over 400', OI.FH / OI.FL === 2, `${OI.FH}/${OI.FL}`);
  const sw = OI.plan(80, { swap: true });
  check('other ear first exchanges the ears at every segment', sw.every((s, i) => s.L === p[i].R && s.R === p[i].L), 'all 80');
  check('and so is the same sequence one segment on: a repeat, which the piece says', sw.every((s, i) => i === p.length - 1 || (s.L === p[i + 1].L && s.R === p[i + 1].R)) && html('the octave illusion').includes('this is the same test again'), 'swap[k] = both[k+1]; the text calls it a repeat');
  check('left alone: the right ear silent, the left still alternating', OI.plan(8, { only: 'L' }).every((s, i) => s.R === 0 && s.L === (i % 2 ? 400 : 800)), '');
  const fifth = OI.plan(8, { fh: 600 });
  check('off the octave: 600 and 400 Hz, still opposite', fifth.every((s) => [s.L, s.R].sort().join() === '400,600'), '');
  const sum = (o, dom) => { const pl = OI.plan(8, o); const m = OI.summary(OI.model(pl, dom), OI.FL, o.fh || OI.FH); return `L ${m.L} · R ${m.R}`; };
  check('the model, right ear leading: high on the right, low on the left', sum({}, 'R') === 'L low · R high', sum({}, 'R'));
  check('the model, left ear leading: the other way round', sum({}, 'L') === 'L high · R low', sum({}, 'L'));
  check('the model predicts no change on the repeat', sum({ swap: true }, 'R') === 'L low · R high', sum({ swap: true }, 'R'));
  check('one ear alone: the model hears that ear’s high and low', sum({ only: 'L' }, 'R') === 'L high and low · R —', sum({ only: 'L' }, 'R'));
  // the eye's version
  let seed = 7; const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  let ok = 0, sides = { left: 0, right: 0 }, xred = 0; const T = 2000;
  for (let i = 0; i < T; i++) { const d = OI.display(rand); const sh = d.letters.map((l) => l.shape).sort().join(), co = d.letters.map((l) => l.color).sort().join(), si = d.letters.map((l) => l.side).sort().join();
    if (sh === 'O,X' && co === 'blue,red' && si === 'left,right' && d.digits[0] !== d.digits[1]) ok++; sides[d.letters[0].side]++; if (d.letters[0].color === 'red') xred++; }
  check('every conjunction display holds one X, one O, one red, one blue, two different digits', ok === T, `${ok} of ${T}`);
  info('the X is red, and on the left, about half the time', `red ${(100 * xred / T).toFixed(1)} %, left ${(100 * sides.left / T).toFixed(1)} %`);
}

// ───────────────────────── the rendered graphs, in headless Chromium ─────────────────────────
if (process.argv.includes('--static')) { console.log('— renders skipped (--static) —'); }
else {
  let chromium = null;
  try { const req = createRequire(join(ROOT, '_ops/stigmergy/app/package.json')); ({ chromium } = req('playwright')); if (!existsSync(chromium.executablePath())) chromium = null; } catch (e) { chromium = null; }
  if (!chromium) info('renders', 'Playwright with Chromium not found in _ops/stigmergy/app; run with --static');
  else {
    const browser = await chromium.launch();
    try {
      console.log('— the missing fundamental, as rendered by its own graph —');
      const pg = await browser.newPage();
      const errs = []; pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
      await pg.goto(pathToFileURL(file('the missing fundamental')).href);
      const ctxBefore = await pg.evaluate(() => typeof G !== 'undefined' && G !== null);
      check('no AudioContext before a click', !ctxBefore, 'the live graph is still null after load');
      const base = await pg.evaluate(() => PC_RENDER({ secs: 2, freqs: [100, 200, 300, 400], bands: [[190, 210]] }));
      const ref = base.at[200];
      check('the three partials come out at one level', [300, 400].every((f) => Math.abs(dB(base.at[f] / ref)) < 0.1), [200, 300, 400].map((f) => dB(base.at[f]).toFixed(2) + ' dB').join(', '));
      check('at 100 Hz, nothing: ≥ 100 dB under each partial, after the compressor', dB(base.at[100] / ref) < -100, `${dB(base.at[100] / ref).toFixed(1)} dB re the 200 Hz partial`);
      info('the band-power meter, on the 200 Hz partial', `${(base.bands['190-210']).toExponential(3)} against a sine's ${(ref * ref / 2).toExponential(3)} (${dB(Math.sqrt(base.bands['190-210'] / (ref * ref / 2))).toFixed(2)} dB)`);
      check('the peak stays under the compressor’s threshold', base.peak < Math.pow(10, -3 / 20), `${dB(base.peak).toFixed(1)} dBFS against −3`);
      const ctl = await pg.evaluate(() => PC_RENDER({ secs: 2, freqs: [100, 200], state: { fund: true, fundDb: -20 } }));
      check('positive control: add the real 100 Hz at −20 dB and the meter reads it', near(dB(ctl.at[100] / ctl.at[200]), -20, 0.2), `${dB(ctl.at[100] / ctl.at[200]).toFixed(2)} dB`);
      const nz = await pg.evaluate(() => PC_RENDER({ secs: 3, freqs: [200], bands: [[82, 118], [190, 210]] }).then(() => PC_RENDER({ secs: 3, freqs: [200], state: { noise: true }, bands: [[82, 118]] })));
      const partialP = ref * ref / 2;
      info('the covering noise, 82 to 118 Hz (about the hearing filter round 100 Hz)', `${(10 * Math.log10(nz.bands['82-118'] / partialP)).toFixed(1)} dB re one partial's power; peak with noise ${dB(nz.peak).toFixed(1)} dBFS`);
      const vOff = await pg.evaluate(() => PC_RENDER({ secs: 3, freqs: [1000], state: { voice: true, phone: false, on: [0, 0, 0] }, bands: [[80, 120], [180, 240], [900, 1500]] }));
      const vOn = await pg.evaluate(() => PC_RENDER({ secs: 3, freqs: [1000], state: { voice: true, phone: true, on: [0, 0, 0] }, bands: [[80, 120], [180, 240], [900, 1500]] }));
      const dl = (k) => 10 * Math.log10(vOn.bands[k] / vOff.bands[k]);
      check('the voice down the line loses ≥ 50 dB round its 100 Hz', dl('80-120') <= -50, `${dl('80-120').toFixed(1)} dB`);
      info('the voice down the line, round its 200 Hz', `${dl('180-240').toFixed(1)} dB (its 2nd harmonic swings 180 to 220 Hz)`);
      check('the line passes the voice’s middle as its filters say: 0.9 to 1.5 kHz within 0.5 dB of the formula', Math.abs(dl('900-1500') - dB(MF.phoneMag(1200))) < 0.5, `rendered ${dl('900-1500').toFixed(2)} dB, formula at 1.2 kHz ${dB(MF.phoneMag(1200)).toFixed(2)} dB (Web Audio reads a highpass Q in dB)`);
      check('the voice’s peak stays under the compressor’s threshold', vOff.peak < Math.pow(10, -3 / 20) && vOn.peak < Math.pow(10, -3 / 20), `${dB(vOff.peak).toFixed(1)} and ${dB(vOn.peak).toFixed(1)} dBFS`);
      check('the page loaded with a clean console', errs.length === 0, errs.length ? errs.join(' | ') : 'no errors');
      await pg.close();

      console.log('— the octave illusion, as rendered by its own stereo graph —');
      const po = await browser.newPage();
      const errs2 = []; po.on('pageerror', (e) => errs2.push(e.message)); po.on('console', (m) => { if (m.type() === 'error') errs2.push(m.text()); });
      await po.goto(pathToFileURL(file('the octave illusion')).href);
      check('no AudioContext before a click', !(await po.evaluate(() => typeof ac !== 'undefined' && ac !== null)), 'still null after load');
      for (const cond of ['both', 'swap', 'onlyL', 'fifth']) {
        const segs = await po.evaluate((c) => PC_RENDER({ n: 8, cond: c }), cond);
        let worst = Infinity, levelOK = true, chOK = true;
        segs.forEach((s) => {
          ['L', 'R'].forEach((e) => {
            const want = s.plan[e], m = s[e];
            if (!want) { const leak = Math.max(m.lo, m.hi); worst = Math.min(worst, -dB(leak / 0.18 + 1e-12)); if (leak > 0.18 * 1e-3) chOK = false; return; }
            const on = want === OI.FL ? m.lo : m.hi, off = want === OI.FL ? m.hi : m.lo;
            if (Math.abs(dB(on / 0.18)) > 1.5) levelOK = false;
            worst = Math.min(worst, dB(on / Math.max(off, 1e-12)));
            if (off > on * 0.01) chOK = false;
          });
        });
        check(`${cond}: every 250 ms segment carries the planned tone on each channel, the other ≥ 40 dB down`, chOK && levelOK, `worst separation ${worst.toFixed(1)} dB over ${segs.length} segments`);
      }
      check('the page loaded with a clean console', errs2.length === 0, errs2.length ? errs2.join(' | ') : 'no errors');
      await po.close();

      console.log('— the barber pole, drawn —');
      const pb = await browser.newPage();
      await pb.goto(pathToFileURL(file('the barber pole and the stair')).href);
      const mv = await pb.evaluate(() => { const c = document.getElementById('pole'), r = window.devicePixelRatio || 1;
        const edge = (p) => { S.p = p; drawPole(); const x = c.getContext('2d'), w = c.width, cx = Math.round(w / 2); const d = x.getImageData(cx, 0, 1, c.height).data; const red = (i) => d[i * 4] > 180 && d[i * 4 + 1] < 90;
          let y0 = null; for (let y = Math.round(40 * r); y < c.height; y++) if (red(y) && !red(y - 1)) { y0 = y / r; break; }
          const row = Math.round(150 * r), e = x.getImageData(0, row, w, 1).data, rd = (i) => e[i * 4] > 180 && e[i * 4 + 1] < 90; let xs = []; for (let i = 1; i < w; i++) if (rd(i) && !rd(i - 1)) xs.push(i / r); return { y: y0, x: xs[xs.length - 1] }; };
        return { a: edge(0), b: edge(0.05) }; });
      check('as the glide rises, the stripes rise (centre column)', mv.b.y < mv.a.y, `a stripe edge from y ${mv.a.y} to ${mv.b.y} px for +0.05 octave`);
      check('and the surface turns leftward, as the solid arrow says', mv.b.x < mv.a.x, `an edge from x ${mv.a.x} to ${mv.b.x} px`);
      await pb.close();

      console.log('— the other two, loaded —');
      for (const n of ['the barber pole and the stair', 'the tritone vote']) {
        const pp = await browser.newPage(); const e3 = []; pp.on('pageerror', (e) => e3.push(e.message)); pp.on('console', (m) => { if (m.type() === 'error') e3.push(m.text()); });
        await pp.goto(pathToFileURL(file(n)).href); await pp.waitForTimeout(400);
        const made = await pp.evaluate(() => typeof ac !== 'undefined' && ac !== null);
        check(`${n}: no AudioContext before a click, clean console`, !made && e3.length === 0, e3.length ? e3.join(' | ') : 'none made, no errors');
        await pp.close();
      }
    } finally { await browser.close(); }
  }
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
