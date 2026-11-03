// title: Bayesian Granular Synthesizer — proof — rich checks
// born: 2026-11-03
// links: [[Bayesian Granular Synthesizer]] connects-to · proof-of-the-rich-face
// forward_vector: I re-run, in Node, every number the three made pieces of this page's rich face print, on the
//   pieces' own code: I pull the engine block and the lab block (and the statistics block) out of each HTML file,
//   check the engine is bayes_engine.js's ENGINE block byte for byte, and assert each claim a piece makes.
//   node "Projects/Bayesian Granular Synthesizer/Bayesian Granular Synthesizer — proof — rich checks.mjs"
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const E = 'Bayesian Granular Synthesizer — rich — ';
const PIECES = { p1: E + 'prior to belief.html', p2: E + 'equal energy.html', p3: E + 'one e, many grains.html' };
const engineSrc = fs.readFileSync(path.join(here, 'bayes_engine.js'), 'utf8');
const ENGINE = engineSrc.slice(engineSrc.indexOf('/*ENGINE-START*/'), engineSrc.indexOf('/*ENGINE-END*/') + '/*ENGINE-END*/'.length);
const block = (html, id) => { const m = html.match(new RegExp(`<script id="${id}">\\n([\\s\\S]*?)\\n</script>`)); if (!m) throw new Error('no block ' + id); return m[1]; };
let pass = 0, fail = 0;
const ok = (cond, what, val) => { if (cond) pass++; else fail++; console.log((cond ? 'PASS ' : 'FAIL ') + what + (val !== undefined ? '  · ' + val : '')); };
function load(file, extra = []) {
  const html = fs.readFileSync(path.join(here, file), 'utf8');
  const eng = block(html, 'bgs-engine');
  ok(eng === ENGINE, `${file}: engine block is bayes_engine.js's ENGINE block, byte for byte`);
  const ctx = vm.createContext({ Math, Float32Array, Float64Array, Int32Array, Map, Set, Array, Number, console });
  vm.runInContext([eng, block(html, 'bgs-lab'), ...extra.map((id) => block(html, id)), 'globalThis.__ = { LAB: globalThis.LAB, ST: globalThis.ST, BeliefCloud };'].join('\n'), ctx);
  return { html, ...ctx.__ };
}
const pct = (v) => (100 * v).toFixed(1) + '%';

// ── piece 1: prior to belief ──
{
  const { LAB, BeliefCloud, html } = load(PIECES.p1), SR = LAB.SR, CEG = [60, 64, 67], ev = CEG.map((m) => [2, 'on', m]);
  const c = new BeliefCloud(SR); ok(Math.abs(c.doubt / (c.doubt + 1) - 0.2) < 1e-12, 'step 2: one note at full weight, doubt 0.25: one grain in five from the prior');
  // step 3: sigma within a cent of the floor
  c.noteOn(60); let t = 0; const dt = c.CTL / SR; while (c.notes.get(60).sig > 6) { c.evolve(dt); t += dt; }
  ok(Math.abs(t - 4.6) < 0.05, 'step 3: σ from 120¢ comes within a cent of the 5¢ floor after about 4.6 s', t.toFixed(3) + ' s');
  // step 1: grain durations
  ok(Math.abs(6 / LAB.hz(60) * 1000 - 23) < 0.5 && Math.abs(6 / LAB.hz(96) * 1000 - 2.9) < 0.1, 'step 1: a 4-cycle grain with its fades lasts about 23 ms at middle C, 3 ms at C7', (6 / LAB.hz(60) * 1000).toFixed(1) + ' / ' + (6 / LAB.hz(96) * 1000).toFixed(2) + ' ms');
  // step 4: the two widths
  const w4 = LAB.grainHalfWidth(LAB.hz(60), 4), w128 = LAB.grainHalfWidth(LAB.hz(60), 128);
  ok(Math.abs(w4 - 151) < 3 && Math.abs(w128 - 5.8) < 0.3, 'step 4: at C4 a 4-cycle grain spreads about ±151¢, a 128-cycle grain about ±5.8¢ (half power)', w4.toFixed(1) + ' / ' + w128.toFixed(2));
  // step 5: the test
  const R = {};
  for (const [k, o] of [['coupled', { log: 1 }], ['short', { len: 4, log: 1 }], ['long', { len: 128, log: 1 }]]) {
    const r = LAB.render(o, ev, 10), n = 1 << 16, P = LAB.welch(r.L, r.R, 6 * SR, 10 * SR, n);
    const late = r.log.filter((x) => x[0] >= 6), far = late.filter((x) => CEG.every((q) => Math.abs(x[1] - q) > 1)), pre = r.log.filter((x) => x[0] < 2);
    R[k] = { log: r.log, sound: LAB.shareNear(P, n, CEG, 25), grains: late.filter((x) => CEG.some((q) => Math.abs(x[1] - q) * 100 <= 25)).length / late.length,
      farShare: far.length / late.length, farLen: LAB.median(far.map((x) => x[2])), preLen: LAB.median(pre.map((x) => x[2])) };
  }
  ok(R.coupled.log.length === R.short.log.length && R.coupled.log.every((g, i) => g[1] === R.short.log[i][1] && g[1] === R.long.log[i][1] && g[0] === R.long.log[i][0]), 'step 5: the three takes draw the same grains at the same pitches and times');
  ok(R.coupled.grains > 0.9, 'step 5: grains within 25¢ of C E G, 6–10 s', pct(R.coupled.grains));
  ok(R.short.sound < 0.2, 'step 5: every grain short: little of the sound on the chord', pct(R.short.sound));
  ok(R.coupled.sound > 0.8 && R.long.sound > 0.8, 'step 5: coupled and every grain long: most of the sound on the chord', pct(R.coupled.sound) + ' / ' + pct(R.long.sound));
  ok(R.coupled.farLen === 4 && R.long.farLen === 128, 'step 5: the doubt’s grains stay 4-cycle clicks when coupled, ring 128 cycles when all long', R.coupled.farLen + ' / ' + R.long.farLen + ' cyc · doubt share ' + pct(R.coupled.farShare));
  ok(R.coupled.preLen === 4 && R.long.preLen === 128, 'step 5: nothing held: coupled stays a scatter of clicks; all long hums', R.coupled.preLen + ' / ' + R.long.preLen + ' cyc');
  ok(!/rich:hush|rich:height/.test(html), 'piece 1 never names the kit’s messages, so the kit keeps hush and height');
}

// ── piece 2: equal energy ──
{
  const { LAB, html } = load(PIECES.p2), SR = LAB.SR;
  const BASE = Math.sqrt(0.06 / 160), FLAT = Math.sqrt(LAB.hz(69) / 5);
  const amp = (f, N, rule) => BASE * (rule ? Math.sqrt(f / (N + 1)) : FLAT);
  const en = (m, N, rule) => LAB.energy(LAB.grainWave(LAB.hz(m), N, amp(LAB.hz(m), N, rule), SR), SR);
  const dBe = (a, b) => 10 * Math.log10(a / b);
  ok(Math.abs(dBe(en(69, 128, true), en(69, 4, true)) - 0.2) < 0.06, 'step 1: under the rule a 128-cycle grain is about 0.2 dB over a 4-cycle one (the N + 1 fade count)', dBe(en(69, 128, true), en(69, 4, true)).toFixed(3) + ' dB');
  let spread = 0; for (let m = 33; m <= 96; m += 3) for (const N of [4, 16, 64, 128]) spread = Math.max(spread, Math.abs(dBe(en(m, N, true), en(69, 4, true))));
  ok(spread < 0.3, 'step 1: under the rule every grain the engine can make is within 0.3 dB of one energy', spread.toFixed(3) + ' dB');
  ok(Math.abs(130 / LAB.hz(33) - 2.36) < 0.01 && Math.abs(6 / LAB.hz(96) * 1000 - 2.9) < 0.1, 'step 1: a 128-cycle A1 lasts more than two seconds, a 4-cycle C7 three milliseconds');
  const rOff = en(45, 128, false) / en(84, 4, false), rOn = en(45, 128, true) / en(84, 4, true);
  ok(rOff > 230 && rOff < 280, 'step 2: one amplitude: the A2 128-cycle grain carries about 250 times the C6 click', '×' + rOff.toFixed(0) + ' · ' + (10 * Math.log10(rOff)).toFixed(1) + ' dB');
  ok(Math.abs(10 * Math.log10(rOn)) < 0.3, 'step 2: with the rule the two weigh the same', (10 * Math.log10(rOn)).toFixed(2) + ' dB');
  const chord = [45, 64, 72], ev = chord.map((m) => [2, 'on', m]);
  const on = LAB.render({ log: 1 }, ev, 16), probe = LAB.render({ flatAmp: 1 }, [], 2);
  const k = LAB.rms(on.L, 0, 2 * SR) / LAB.rms(probe.L, 0, 2 * SR), off = LAB.render({ flatAmp: k, log: 1 }, ev, 16), R = {};
  for (const [key, r] of [['on', on], ['off', off]]) {
    const n = 1 << 16, P = LAB.welch(r.L, r.R, 6 * SR, 16 * SR, n), late = r.log.filter((x) => x[0] >= 6), P0 = LAB.welch(r.L, r.R, 0, 2 * SR, 1 << 14), pre = r.log.filter((x) => x[0] < 2);
    R[key] = { energy: chord.map((q) => LAB.shareNear(P, n, [q], 50)), grains: chord.map((q) => late.filter((x) => Math.abs(x[1] - q) * 100 <= 50).length / late.length),
      below: LAB.shareBelow(P, n, 250), below0: LAB.shareBelow(P0, 1 << 14, 250), grainsBelow0: pre.filter((x) => LAB.hz(x[1]) < 250).length / pre.length,
      jump: LAB.dB(LAB.rms(r.L, 6 * SR, 16 * SR)) - LAB.dB(LAB.rms(r.L, 0, 2 * SR)) };
  }
  const dev = Math.max(...R.on.energy.map((v, i) => Math.abs(v - R.on.grains[i])));
  ok(dev < 0.06, 'step 3: with the rule each held note’s energy share is within 6 points of its grain share', 'A2 E4 C5 energy ' + R.on.energy.map(pct).join(' ') + ' · grains ' + R.on.grains.map(pct).join(' '));
  ok(R.off.energy[0] > 0.55, 'step 3: one amplitude: A2 takes most of the energy', pct(R.off.energy[0]) + ' of the energy from ' + pct(R.off.grains[0]) + ' of the grains');
  ok(Math.abs(R.on.jump) < 2 && R.off.jump > 10, 'step 3: the level when the chord comes in, with the rule and without', R.on.jump.toFixed(1) + ' / ' + R.off.jump.toFixed(1) + ' dB');
  ok(Math.abs(R.on.below0 - R.on.grainsBelow0) < 0.05 && R.off.below0 > 0.75, 'step 3: nothing held, energy under 250 Hz follows the grains with the rule, not without', pct(R.on.below0) + ' vs grains ' + pct(R.on.grainsBelow0) + ' · one amplitude ' + pct(R.off.below0));
  ok(R.off.below > 0.6 && R.on.below < 0.4, 'step 3: chord held, energy under 250 Hz', pct(R.on.below) + ' / ' + pct(R.off.below));
  ok(!/rich:hush|rich:height/.test(html), 'piece 2 never names the kit’s messages');
}

// ── piece 3: one e, many grains ──
{
  const { LAB, ST, html } = load(PIECES.p3, ['bgs-stats']);
  const g = ST.gaps(160, 20), D = ST.ksExp(g.gaps, 160), crit = 1.36 / Math.sqrt(g.gaps.length);
  ok(D < crit, 'step 1: onset gaps at 160 /s pass a Kolmogorov–Smirnov test against e^(−160 t) at 5%', 'D ' + D.toFixed(4) + ' < ' + crit.toFixed(4) + ' · ' + g.gaps.length + ' gaps');
  let worst = 0; for (const rate of [20, 80, 240, 400]) { const x = ST.gaps(rate, 20); worst = Math.max(worst, ST.ksExp(x.gaps, rate) / (1.36 / Math.sqrt(x.gaps.length))); }
  ok(worst < 1, 'step 1: and at 20, 80, 240 and 400 /s, the twenty seconds the piece counts', 'worst D at ' + worst.toFixed(2) + ' of the 5% line');
  // Not a claim the piece makes, kept as a finding: onsets land on whole samples, so over 60 s at 400 /s (about 24,000 gaps,
  // a mean gap of 120 samples) the gaps' one-sample steps sit at the edge of what a KS test can see (2026-11-03: D 0.0111
  // against a 5% line of 0.0087 at seed 12345; the fitted-rate test borders on its line at all three seeds tried).
  const env = ST.envelopes();
  ok(env.relGap < 1e-12 && env.attGap < 1e-12, 'step 2: the engine’s release and attack envelopes are e^(−x) in their own time constants', env.relGap.toExponential(1) + ' / ' + env.attGap.toExponential(1));
  const c = ST.steady(), pred = ST.predicted(c), mu = ST.predictedMean(c), d = ST.draws(c, 100000);
  const psum = pred.reduce((a, b) => a + b, 0); ok(Math.abs(psum - 1) < 1e-6, 'step 3: the predicted semitone shares sum to 1', psum.toFixed(8));
  const tv = [10, 100, 1000, 10000, 100000].map((N) => ST.tv(ST.histAt(c, d, N), pred));
  ok(tv.every((v, i) => i === 0 || v < tv[i - 1]) && tv[4] < 0.01, 'step 3: distance from the belief shrinks with N', tv.map((v) => v.toFixed(3)).join(' → '));
  let s = 0; for (let i = 0; i < d.length; i++) s += d[i]; const avg = s / d.length;
  ok(Math.abs(mu - 60.04) < 0.01 && Math.abs(avg - mu) < 0.05, 'step 3: the average pitch settles on the belief’s mean, C4 +4¢, for C3 E4 G4', 'predicted ' + mu.toFixed(3) + ' · 100,000 grains ' + avg.toFixed(3));
  ok(ST.CHORD.every((q) => Math.abs(avg - q) > 3), 'step 3: and that pitch is not a note of the chord', 'nearest held note ' + Math.min(...ST.CHORD.map((q) => Math.abs(avg - q))).toFixed(2) + ' semitones away');
  const b = ST.bell(), o = b.rows;
  ok(Math.abs(o.held.k - 3) < 0.15 && o.held.v > 40, 'step 4: C E G believed: dozens of grains at once, a bell curve', o.held.v.toFixed(1) + ' at once · kurtosis ' + o.held.k.toFixed(2));
  ok(o.pre.k > 4 && o.pre.v < 8, 'step 4: nothing held: a few grains at once, heavy-tailed', o.pre.v.toFixed(1) + ' at once · kurtosis ' + o.pre.k.toFixed(2));
  ok(o.short.k > 3.4 && o.short.v < 8, 'step 4: C E G with every grain short: still heavy-tailed', o.short.v.toFixed(1) + ' at once · kurtosis ' + o.short.k.toFixed(2));
  ok(!/rich:hush|rich:height/.test(html), 'piece 3 never names the kit’s messages');
}
console.log(`\n${pass} pass, ${fail} fail`);
process.exitCode = fail ? 1 : 0;
