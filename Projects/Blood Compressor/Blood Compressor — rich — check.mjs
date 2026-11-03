// Blood Compressor — rich — check.mjs
// born: 2026-11-03 · checks [[Blood Compressor]]' rich-face pieces "attack floor" and "the stressed body"
// forward_vector: I re-run, headless, every claim the two made pieces make about their engine and about the
// sections they serve: that the engine they carry is the plugin's own (plugin/ui/blood_compressor.js), sample
// for sample, with its two doors shut; that attack cannot reach 0; what the floor does to a kick's peak and
// crest; what it takes to clamp the hit the way Pedagogical Framing says; and, for DSP Architecture, which
// way a stressed body's threshold must move to compress more. What a listener hears I cannot check; I print
// the numbers each page shows so they can be read against it.
//
//   node "Projects/Blood Compressor/Blood Compressor — rich — check.mjs"     (about three minutes: the sandbox is slow)
//
// It pulls each page's <script id="bc-core"> out of the HTML, runs it in a Node sandbox, and holds it to the
// plugin's engine loaded on its own. PASS/FAIL per claim; exits 1 on any FAIL. Reads only; writes nothing.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const PLUGIN = require(join(HERE, 'plugin', 'ui', 'blood_compressor.js'));
const PIECES = { attack: 'Blood Compressor — rich — attack floor.html', stressed: 'Blood Compressor — rich — the stressed body.html' };

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const f = (x, d = 2) => x.toFixed(d);

function coreOf(file) {
  const html = readFileSync(join(HERE, file), 'utf8');
  const m = html.match(/<script id="bc-core">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`no <script id="bc-core"> in ${file}`);
  const E = { Math, Float64Array, Float32Array, Uint8Array, Object };
  vm.createContext(E);
  vm.runInContext(m[1] + '\nthis.BC = BC;', E);
  return { BC: E.BC, html };
}

// ── the plugin's engine on the same loop, on its own ──
function pluginRun(BC, set, n) {
  const c = new PLUGIN.Compressor(BC.SR), v = Float64Array.from(PLUGIN.DEFAULTS);
  for (const k in set) v[PLUGIN.IDS.indexOf(k)] = set[k];
  const x = BC.loop(), L = new Float32Array(BC.N);
  for (let p = 0; p < 2; p++) for (let i = 0; i < BC.N; i++) { const o = c.step(v, x[i], 0.92 * x[i]); if (p) L[i] = o[0]; }
  return L;
}
const maxDiff = (a, b) => { let d = 0; for (let i = 0; i < a.length; i++) d = Math.max(d, Math.abs(a[i] - b[i])); return d; };

for (const [name, file] of Object.entries(PIECES)) {
  let got;
  got = coreOf(file);
  const { BC } = got;
  for (const set of [{ threshold: -36, ratio: 10, attack: 0.005, release: 0.3 }, { threshold: -36, ratio: 10, attack: 0.2, release: 0.3 },
                     { threshold: -30, ratio: 4, attack: 0.06, release: 0.3, knee: 6, sympathetic: 1 }, { threshold: -30, ratio: 4, attack: 0.06, release: 0.075, knee: 6 }]) {
    const a = BC.render(set).L, b = pluginRun(BC, set);
    check(`${name}: the piece's engine is the plugin's, sample for sample (${JSON.stringify(set)})`, maxDiff(a, b) === 0, `max difference ${maxDiff(a, b)}`);
  }
}

// ── attack floor ──
{
  const { BC, html } = coreOf(PIECES.attack);
  const BASE = { threshold: -36, ratio: 10, release: 0.3 }, FIRST = Math.round(0.16 * BC.SR);
  const knob = html.match(/const atkOf = \(u\) => 0\.005 \* Math\.pow\(200 \/ 5, u\)/);
  const slider = html.match(/<input id="atk" type="range" min="0" max="1"/);
  check('attack: the knob runs from 5 ms to 200 ms and no lower', !!knob && !!slider, 'atkOf(0) = 5 ms, atkOf(1) = 200 ms, slider 0 to 1');
  const R = (set, opts) => { const r = BC.render(Object.assign({}, BASE, set), opts, FIRST); r.st = BC.stats(r.L); return r; };
  const by = R({ bypass: 1, attack: 0.06 }), fl = R({ attack: 0.005 }), un = R({ attack: 0 }, { floor: 0, nerve: 0 }), d2 = R({ attack: 0.2 });
  const z0 = R({ attack: 0 }), z1 = R({ attack: 0.001 });
  const K = (r) => BC.kicks(r.g), kf = K(fl), ku = K(un), kd = K(d2);
  let move = -1; for (let i = 0; i < FIRST; i++) if (fl.one.g[i] < -0.1) { move = i / BC.SR * 1000; break; }
  check('attack: asking for 0 or 1 ms gives the floor, bit for bit (it cannot be set to 0)', maxDiff(z0.L, fl.L) === 0 && maxDiff(z1.L, fl.L) === 0, `differences ${maxDiff(z0.L, fl.L)}, ${maxDiff(z1.L, fl.L)}`);
  check('attack: from rest, the wall cannot move for the first 5 ms of a kick', move >= 5 && move < 5.5 && fl.one.g[BC.IN5] === 0, `first moves at ${f(move)} ms; ${f(fl.one.g[BC.IN5])} dB at 5 ms, ${f(fl.one.g[BC.IN10])} dB at 10 ms`);
  check('attack: in the loop, at the floor, the vessel does not close in a kick\'s first 5 ms, then clamps', kf.close5 > -0.05 && kf.close10 < -6, `already ${f(kf.pre)} dB as it lands; ${f(kf.close5)} dB in 5 ms; ${f(kf.close10)} dB by 10 ms`);
  check('attack: the instant clamp takes no floor and no nerve, and then the vessel does close inside 5 ms', ku.close5 < -10, `${f(ku.close5)} dB in 5 ms (already ${f(ku.pre)}), ${f(ku.close10)} by 10 ms`);
  check('attack: at 200 ms the body is still deciding 10 ms in', kd.close10 > -3 && kd.close10 > kf.close10, `${f(kd.close10)} dB by 10 ms (floor ${f(kf.close10)})`);
  check('attack: the crest rises at the floor and with the instant clamp alike, so crest cannot tell them apart', fl.st.crest > by.st.crest + 6 && un.st.crest > by.st.crest + 6, `${f(by.st.crest, 1)} dB as it arrives → ${f(fl.st.crest, 1)} at the floor, ${f(un.st.crest, 1)} with no floor and no nerve`);
  // matching: every take the page can make stays under the ceiling
  let worst = -99, worstAt = '';
  const takes = [by, fl, un, d2];
  for (let u = 0; u <= 1.0001; u += 0.02) takes.push(R({ attack: 0.005 * Math.pow(40, u) }));
  for (const r of takes) { const out = r.st.peak + 20 * Math.log10(BC.matchGain(r.st)); if (out > worst) { worst = out; worstAt = f(r.st.crest, 1) + ' dB crest'; } }
  check('attack: every matched take peaks at or under −1 dBFS', worst <= -1 + 1e-9, `worst ${f(worst)} dBFS (${worstAt})`);
  console.log(`      numbers the page shows · crest as it arrives ${f(by.st.crest, 1)} · B floor: pre ${f(kf.pre, 1)} close5 ${f(kf.close5, 1)} close10 ${f(kf.close10, 1)} crest ${f(fl.st.crest, 1)} · C none: pre ${f(ku.pre, 1)} close5 ${f(ku.close5, 1)} close10 ${f(ku.close10, 1)} crest ${f(un.st.crest, 1)} · D 200 ms: pre ${f(kd.pre, 1)} close5 ${f(kd.close5, 1)} close10 ${f(kd.close10, 1)} crest ${f(d2.st.crest, 1)}`);
}

// ── the stressed body ──
{
  const { BC, html } = coreOf(PIECES.stressed);
  const REST = { threshold: -30, ratio: 4, attack: 0.06, release: 0.3, knee: 6 };
  const R = (set) => { const r = BC.render(Object.assign({}, REST, set)); r.st = BC.stats(r.L); r.sq = BC.squeeze(r.g); return r; };
  check('stressed: the controls are the ones the page describes',
    /<input id="line" type="range" min="-42" max="-18"/.test(html) && /const relOf = \(u\) => 0\.075 \* Math\.pow\(16, u\)/.test(html) && /<input id="raise" type="range" min="0" max="12"/.test(html)
      && /written = \(\) => take\(\{ threshold: REST\.threshold \+ \+\$\('raise'\)\.value, release: REST\.release \/ 4 \}\)/.test(html) && /built = \(\) => take\(\{ sympathetic: 1 \}\)/.test(html),
    'line −42 to −18 dB; release 75 to 1200 ms; as written = line + rise, release ÷ 4; as built = the plugin\'s sympathetic at 1');
  const A = R({}), C = R({ sympathetic: 1 });
  check('stressed: the body at rest matches the plugin\'s own body take', Math.abs(A.sq.mean - -9.2) < 0.15 && Math.abs(A.sq.deepest - -13.3) < 0.15 && Math.abs(C.sq.mean - -15.2) < 0.15 && Math.abs(C.sq.deepest - -23.4) < 0.15,
    `rest ${f(A.sq.mean)} / ${f(A.sq.deepest)}, stressed ${f(C.sq.mean)} / ${f(C.sq.deepest)}; plugin/out/body-take.json says −9.2 / −13.3 and −15.2 / −23.4 (its own seeded loop)`);
  let mono = true, prev = -99; const lines = [];
  for (let t = -42; t <= -18; t += 3) { const r = R({ threshold: t }); if (r.sq.mean <= prev) mono = false; prev = r.sq.mean; lines.push(`${t}:${f(r.sq.mean, 1)}`); }
  check('stressed: the line alone — higher squeezes less, every step', mono, lines.join(' '));
  const r75 = R({ release: 0.075 }), r1200 = R({ release: 1.2 });
  check('stressed: the muscle alone — quicker holds less on average', r75.sq.mean > A.sq.mean && A.sq.mean > r1200.sq.mean, `75 ms ${f(r75.sq.mean)}, 300 ms ${f(A.sq.mean)}, 1200 ms ${f(r1200.sq.mean)} dB`);
  let less = true; const wr = [];
  for (let rise = 0; rise <= 12; rise += 0.5) { const B = R({ threshold: REST.threshold + rise, release: REST.release / 4 }); if (!(B.sq.mean > A.sq.mean && B.sq.deepest > A.sq.deepest)) less = false; if (rise % 3 === 0) wr.push(`+${rise}:${f(B.sq.mean, 1)}/${f(B.sq.deepest, 1)}`); }
  check('stressed: as written, at every rise from 0 to 12 dB, the stressed body squeezes less than at rest', less, wr.join(' ') + ` against rest ${f(A.sq.mean, 1)}/${f(A.sq.deepest, 1)}`);
  check('stressed: as built, it squeezes more', C.sq.mean < A.sq.mean - 3 && C.sq.deepest < A.sq.deepest - 3, `${f(C.sq.mean)} / ${f(C.sq.deepest)} against ${f(A.sq.mean)} / ${f(A.sq.deepest)}`);
  let worst = -99; const all = [A, C, r75, r1200];
  for (let t = -42; t <= -18; t += 1) all.push(R({ threshold: t }));
  for (let u = 0; u <= 1.0001; u += 0.05) all.push(R({ release: 0.075 * Math.pow(16, u) }));
  for (let rise = 0; rise <= 12; rise += 1) all.push(R({ threshold: REST.threshold + rise, release: REST.release / 4 }));
  for (const r of all) worst = Math.max(worst, r.st.peak + 20 * Math.log10(BC.matchGain(r.st)));
  check('stressed: every matched take peaks at or under −1 dBFS', worst <= -1 + 1e-9, `worst ${f(worst)} dBFS`);
  const B12 = R({ threshold: -18, release: 0.075 });
  console.log(`      numbers the page shows · A rest ${f(A.sq.mean, 1)}/${f(A.sq.deepest, 1)} crest ${f(A.st.crest, 1)} · B written +12 ${f(B12.sq.mean, 1)}/${f(B12.sq.deepest, 1)} crest ${f(B12.st.crest, 1)} · C built ${f(C.sq.mean, 1)}/${f(C.sq.deepest, 1)} crest ${f(C.st.crest, 1)}`);
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
