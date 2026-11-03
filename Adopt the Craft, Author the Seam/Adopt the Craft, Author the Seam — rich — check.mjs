// Adopt the Craft, Author the Seam — rich — check.mjs
// born: 2026-11-03 · checks [[Adopt the Craft, Author the Seam]]'s three made rich-face pieces: "which one is
// the drummer", "match it by ear" and "where it stops being a groove"
// forward_vector: I re-run, headless, every claim the three pieces make about their own engine: that one engine
// runs all three, byte for byte; that the skip note and the lay-back land where the two equations say, measured
// in the rendered sound; that the machine as written is straight and even; that the drummer's wander stays in
// its stated bounds and adds no loudness; that every take a blind trial sets side by side is matched in level
// and length and differs only in the thing under test (two nulls that would read above −120 dB if anything
// else differed); that the hidden groove and yours differ only in the one number; and that every chance figure
// a step prints is the count it names. What a listener hears I cannot check.
//
//   node "Adopt the Craft, Author the Seam/Adopt the Craft, Author the Seam — rich — check.mjs"
//
// It pulls <script id="gr-core"> out of each piece, runs it in a Node sandbox, and compares against equations
// written here on their own. PASS/FAIL per claim, INFO for numbers worth reading; exits 1 on any FAIL.
// Reads only; writes nothing.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const E = 'Adopt the Craft, Author the Seam';
const page = (what) => readFileSync(join(HERE, `${E} — rich — ${what}.html`), 'utf8');
const P = { drummer: page('which one is the drummer'), ear: page('match it by ear'), edge: page('where it stops being a groove') };
const grab = (html, id) => { const m = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`)); if (!m) throw new Error(`no <script id="${id}">`); return m[1]; };
const box = { Math, Float64Array, Float32Array, JSON, Number, String, Object, Array, isFinite, Infinity };
vm.createContext(box); vm.runInContext(grab(P.drummer, 'gr-core') + '\nthis.GR = GR;', box);
const GR = box.GR, SR = GR.SR, T = GR.T;

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const info = (name, detail) => console.log(`INFO  ${name}  (${detail})`);
const dB = (v) => 20 * Math.log10(Math.max(v, 1e-30));
const rms = (x) => { let s = 0; for (const v of x) s += v * v; return Math.sqrt(s / x.length); };
const peak = (x) => { let p = 0; for (const v of x) p = Math.max(p, Math.abs(v)); return p; };
const maxDiff = (a, b) => { let m = 0; for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - b[i])); return m; };
const plain = (s, l, a) => ({ swing: s, lay: l, accent: !!a, feel: false });
const ONCE = { wrap: false, pre: 0.06, tail: 0.7 };

console.log('— the engine —');
for (const id of ['gr-core', 'gr-grid', 'gr-ui']) {
  const c = Object.values(P).map((h) => grab(h, id));
  check(`${id}: the same in all three pieces, byte for byte`, c.every((x) => x === c[0]), `${c[0].length} characters each`);
}
for (const [n, h] of Object.entries(P)) {
  check(`${n}: never names the kit's hush message, so the kit keeps hushing`, !h.includes('rich:' + 'hush'), 'the string is absent');
  check(`${n}: no detached Audio element`, !/new\s+Audio\s*\(/.test(h), 'sound goes through one AudioContext made on a click');
  check(`${n}: no AudioContext before a click`, !/AudioContext\s*\(/.test(h.replace(grab(h, 'gr-ui'), '')) && /function audio\(\)/.test(grab(h, 'gr-ui')), 'made only inside UI.audio(), which only click handlers reach');
}

console.log('— the two equations, measured in the rendered sound —');
// Render a reading, then the same reading without one hit: what's left is that hit alone, and its first
// sounding sample is where the engine put it. Written here on its own: t(skip) = t(beat) + s·T + L,
// t(hit) = t(grid) + L. Allowed: two samples (45 µs), half a sample for rounding the time to a sample and one
// because every hit's attack ramp starts at zero, so its first written sample is silent.
function onsetOf(Pr, pick) {
  const hits = GR.read(Pr, 1), i = hits.findIndex(pick), without = hits.filter((_, j) => j !== i);
  const a = GR.render(hits, ONCE).drums, b = GR.render(without, ONCE).drums;
  for (let n = 0; n < a.length; n++) if (Math.abs(a[n] - b[n]) > 1e-9) return n / SR - ONCE.pre;
  return NaN;
}
for (const [s, L] of [[0.5, 0], [0.64, 22], [0.75, 0], [0.67, -10], [0.88, 60]]) {
  const skip = onsetOf(plain(s, L, true), (h) => h.skip && h.beat === 3), want = 3 * T + s * T + L / 1000;
  check(`skip note on beat 4 at swing ${s * 100}%, lay-back ${L} ms`, Math.abs(skip - want) <= 2 / SR, `${(skip * 1000).toFixed(2)} ms, the equation says ${(want * 1000).toFixed(2)} ms`);
  const hat = onsetOf(plain(s, L, true), (h) => h.lane === 'hat' && h.beat === 5), wantH = 5 * T + L / 1000;
  check(`hat on beat 2 of bar 2 at lay-back ${L} ms`, Math.abs(hat - wantH) <= 2 / SR, `${(hat * 1000).toFixed(2)} ms, the equation says ${(wantH * 1000).toFixed(2)} ms`);
}
{
  const m = GR.read(GR.MACHINE, 1), skips = m.filter((h) => h.skip), drums = m.filter((h) => h.lane === 'ride' || h.lane === 'hat');
  check('the machine as written: every skip note on the half beat', skips.every((h) => Math.abs(h.at - h.grid) < 1e-12), `${skips.length} skip notes`);
  check('the machine as written: every ride and hat hit on the grid, nothing leaning', drums.every((h) => !h.skip ? Math.abs(h.at - h.grid) < 1e-12 : true) && m.filter((h) => h.lane === 'ride' && !h.skip).every((h) => h.v === 0.55), 'beats at 0.55, skips at 0.38, hats at 0.5');
  const k = GR.read(GR.DRUMMER, 1).filter((h) => h.lane === 'kick' || h.lane === 'bass');
  check('the bass and the feathered kick stay on the grid for the drummer too', k.every((h) => h.at === h.grid), `${k.length} hits`);
}

console.log('— the drummer\'s wander —');
{
  let worstT = 0, worstMS = 0, n = 0;
  for (let seed = 1; seed <= 400; seed++) {
    const d = GR.read(GR.DRUMMER, seed), s = GR.read(GR.SEAM, seed);
    d.forEach((h, i) => { if (h.lane === 'ride' || h.lane === 'hat') worstT = Math.max(worstT, Math.abs(h.at - s[i].at)); });
    for (const lane of ['ride', 'hat']) { const w = d.filter((h) => h.lane === lane).map((h) => h.w); worstMS = Math.max(worstMS, Math.abs(w.reduce((a, v) => a + v * v, 0) / w.length - 1)); }
    n++;
  }
  check('timing wander within the stated 7 ms', worstT <= 0.007, `largest of ${n} drummers: ${(worstT * 1000).toFixed(2)} ms`);
  check('weight wander centred: mean square 1 per lane, so the drummer is no louder', worstMS < 1e-12, `largest departure ${worstMS.toExponential(1)}`);
  const ws = GR.read(GR.DRUMMER, 7).filter((h) => h.lane === 'ride').map((h) => h.w);
  info('one drummer\'s ride weights after centring', `${Math.min(...ws).toFixed(3)} to ${Math.max(...ws).toFixed(3)}`);
}

console.log('— the blind pairs: matched, and different only in the thing under test —');
{
  // Null 1: the drummer with no wander is the machine reading the drummer's seam, sample for sample.
  const a = GR.take({ ...GR.DRUMMER, feel: false }, 99, ONCE), b = GR.take(GR.SEAM, 99, ONCE);
  const m1 = maxDiff(a, b), r1 = dB(m1 / rms(b));
  check('null: the drummer without its wander IS the authored seam', r1 < -120, `${m1 === 0 ? 'identical, sample for sample' : 'largest difference ' + r1.toFixed(1) + ' dB under the take'}; above −120 dB would mean the pair differs in something besides the wander`);
  // Null 2: the machine handed the drummer's numbers is the authored seam: the reader adds nothing of its own.
  const c = GR.take(plain(0.64, 22, true), 5, ONCE), d = GR.take(GR.SEAM, 77, ONCE);
  const m2 = maxDiff(c, d), r2 = dB(m2 / rms(d));
  check('null: the machine given the drummer\'s numbers is the seam, whatever the seed', r2 < -120, `${m2 === 0 ? 'identical, sample for sample' : 'largest difference ' + r2.toFixed(1) + ' dB'}; the seed only moves the wander, which the seam has none of`);
  let worst = 0, lens = true, pk = 0, dt = [], dw = [];
  for (let seed = 1; seed <= 30; seed++) {
    const dr = GR.take(GR.DRUMMER, seed * 7919, ONCE), ma = GR.take(GR.MACHINE, seed * 7919, ONCE), se = GR.take(GR.SEAM, seed * 7919, ONCE);
    lens = lens && dr.length === ma.length && dr.length === se.length;
    worst = Math.max(worst, Math.abs(dB(rms(dr)) - dB(rms(ma))), Math.abs(dB(rms(dr)) - dB(rms(se))));
    pk = Math.max(pk, peak(dr), peak(ma), peak(se));
    const hd = GR.read(GR.DRUMMER, seed * 7919).filter((h) => h.lane === 'ride' || h.lane === 'hat'), hs = GR.read(GR.SEAM, seed * 7919).filter((h) => h.lane === 'ride' || h.lane === 'hat');
    hd.forEach((h, i) => { dt.push((h.at - hs[i].at) * 1000); dw.push(dB(h.w)); });
  }
  check('every take in a pair the same length', lens, `${(GR.take(GR.DRUMMER, 1, ONCE).length / SR).toFixed(3)} s each`);
  check('every pair matched in level: drummer against either machine', worst < 0.25, `largest gap over 30 pairs of each kind ${worst.toFixed(3)} dB of whole-take RMS (drums set to one RMS, bass identical); 0.25 dB or more would fail`);
  check('no take clips', pk < 1, `highest peak ${pk.toFixed(3)}`);
  const sd = (v) => Math.sqrt(v.reduce((a, x) => a + x * x, 0) / v.length);
  info('what the second kind of pair asks the ear to hear', `the drummer's ride and hat against the seam's: timing off by ${sd(dt).toFixed(2)} ms RMS (at most ${Math.max(...dt.map(Math.abs)).toFixed(2)}), weight by ${sd(dw).toFixed(2)} dB RMS (at most ${Math.max(...dw.map(Math.abs)).toFixed(2)})`);
  const hc = (h) => ['ride', 'hat', 'kick', 'bass'].map((l) => h.filter((x) => x.lane === l).length).join('/');
  check('the same hits in every reading', hc(GR.read(GR.DRUMMER, 3)) === hc(GR.read(GR.MACHINE, 3)) && hc(GR.read(GR.MACHINE, 3)) === hc(GR.read(GR.SEAM, 3)), `ride/hat/kick/bass = ${hc(GR.read(GR.MACHINE, 3))}`);
}

console.log('— the hidden groove and yours —');
{
  let ok = true, worst = 0;
  for (const [H, M] of [[plain(0.52, 0), plain(0.70, 0)], [plain(0.64, -10), plain(0.64, 40)], [plain(0.5, 0), plain(0.72, 0)]]) {
    const a = GR.read(H, 20261019), b = GR.read(M, 20261019);
    ok = ok && a.length === b.length && a.every((h, i) => h.lane === b[i].lane && h.v === b[i].v && h.w === b[i].w);
    const ya = GR.mix(GR.render(a, { wrap: true })), yb = GR.mix(GR.render(b, { wrap: true }));
    worst = Math.max(worst, Math.abs(dB(rms(ya)) - dB(rms(yb))));
  }
  check('only the one number moves: same hits, same weights', ok, 'lane, level and weight equal hit for hit');
  check('and the same loudness', worst < 0.25, `largest gap ${worst.toFixed(3)} dB`);
  let pk = 0; for (const s of [0.5, 0.64, 0.8, 0.9]) for (const l of [-20, 22, 60, 90]) pk = Math.max(pk, peak(GR.take(plain(s, l, true), 1, { wrap: true })));
  check('no loop clips, at any setting the sliders reach', pk < 1, `highest peak ${pk.toFixed(3)}`);
}

console.log('— the chance figures each step prints —');
{
  const binom = (k, n, p) => { let s = 0; const C = (n, j) => { let c = 1; for (let i = 0; i < j; i++) c = c * (n - i) / (i + 1); return c; }; for (let j = k; j <= n; j++) s += C(n, j) * p ** j * (1 - p) ** (n - j); return s; };
  check('which one is the drummer: 7 or more of 8 by guessing is 9 in 256', Math.abs(GR.atLeast(7, 8, 0.5) - 9 / 256) < 1e-12, `${(GR.atLeast(7, 8, 0.5) * 100).toFixed(2)}%`);
  const best = (lo, hi, tol) => { let m = 0; for (let c = lo - tol; c <= hi + tol; c++) { let n = 0; for (let v = lo; v <= hi; v++) if (Math.abs(v - c) <= tol) n++; m = Math.max(m, n); } return m / (hi - lo + 1); };
  check('match it by ear, swing: the best a non-listener can do is 7 in 23 a trial', Math.abs(best(50, 72, 3) - 7 / 23) < 1e-12, `${(best(50, 72, 3) * 100).toFixed(1)}%, the slider's start (61) reaches it`);
  check('match it by ear, lay-back: 17 in 51', Math.abs(best(-10, 40, 8) - 17 / 51) < 1e-12, `${(best(-10, 40, 8) * 100).toFixed(1)}%, the start (15) reaches it`);
  info('5 or 6 of 6 without listening', `swing ${(binom(5, 6, 7 / 23) * 100).toFixed(2)}%, lay-back ${(binom(5, 6, 17 / 51) * 100).toFixed(2)}% (the piece computes the same with GR.atLeast: ${(GR.atLeast(5, 6, 7 / 23) * 100).toFixed(2)}%, ${(GR.atLeast(5, 6, 17 / 51) * 100).toFixed(2)}%)`);
  check('the piece and this check agree on those two', Math.abs(binom(5, 6, 7 / 23) - GR.atLeast(5, 6, 7 / 23)) < 1e-12 && Math.abs(binom(5, 6, 17 / 51) - GR.atLeast(5, 6, 17 / 51)) < 1e-12, 'to 1e-12');
}

console.log('— the edge finder —');
{
  const L = 7, mk = (arr) => arr.map((b, k) => ({ level: k % L, broke: !!b }));
  const sorted = mk([0, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1]);
  check('answers that sort by the number make a sharp edge, at the right cut', GR.edge(sorted, L).kind === 'sharp' && GR.edge(sorted, L).cuts[0] === 3, `cut ${GR.edge(sorted, L).cuts} (between 72 and 76%), ${GR.edge(sorted, L).best} off`);
  const twoOff = mk([0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1]);
  check('a level heard both ways each time makes a zone', GR.edge(twoOff, L).kind === 'zone', `${GR.edge(twoOff, L).best} off, cuts ${GR.edge(twoOff, L).cuts}`);
  check('every take a groove: no edge in the range', GR.edge(mk(Array(14).fill(0)), L).kind === 'none', 'cut at the top end');
  check('alternating answers: fog', GR.edge(mk([0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]), L).kind === 'fog', `${GR.edge(mk([0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]), L).best} off`);
  // The piece counts every one of 2^14 coin-flip answer sets; here, independently, a million sampled ones.
  const exact = GR.edgeChance(L, 2), r = GR.rng(4242), cnt = { none: 0, sharp: 0, zone: 0, fog: 0 }, N = 200000;
  for (let i = 0; i < N; i++) { const a = []; for (let k = 0; k < 14; k++) a.push({ level: k % L, broke: r() < 0.5 }); cnt[GR.edge(a, L).kind]++; }
  const far = Object.keys(cnt).map((k) => Math.abs(cnt[k] / N - exact[k])).reduce((a, b) => Math.max(a, b));
  check('coin-flip figures: the exact count and a sample of 200,000 agree', far < 0.004, `sharp ${(exact.sharp * 100).toFixed(2)}%, zone ${(exact.zone * 100).toFixed(1)}%, fog ${(exact.fog * 100).toFixed(1)}%, none ${(exact.none * 100).toFixed(2)}%; largest gap ${(far * 100).toFixed(2)} points`);
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
