// Compression ↔ Intimacy — rich — check.mjs
// born: 2026-11-03 · checks [[Compression ↔ Intimacy]]'s three rich-face pieces: "does distance narrow a voice",
// "where is the singer" and "four knobs and the guard"
// forward_vector: I re-run, headless, every number the three pieces print and every claim they make about their
// own engine: that the three carry one engine byte for byte; that the loudness meter reads a 997 Hz sine as
// BS.1770 says it must; that the four blind versions are matched, equal in length, under full scale, and differ
// inside each syllable only in level; that a 1:1 compressor is a wire and the static curve is the one the
// piece prints; that the 20:1 gain doesn't ripple into a tell; that distance in open air leaves a voice's range
// exactly alone and never widens it; that a slow release holds the quiet line after the shout; and that the
// chance figures are the counts they claim. What a listener hears I cannot check.
//
//   node "Cross-Domain Resonances/Compression ↔ Intimacy/Compression ↔ Intimacy — rich — check.mjs"
//
// PASS/FAIL per claim, with the number that would have meant failure; INFO for numbers worth reading; exits 1
// on any FAIL. Reads only; writes nothing.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const PIECES = ['does distance narrow a voice', 'where is the singer', 'four knobs and the guard'];
const html = Object.fromEntries(PIECES.map((p) => [p, readFileSync(join(HERE, `Compression ↔ Intimacy — rich — ${p}.html`), 'utf8')]));
const block = (h, id) => { const m = h.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`)); if (!m) throw new Error(`no <script id="${id}">`); return m[1]; };

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const info = (name, detail) => console.log(`INFO  ${name}  (${detail})`);

// ── one engine, one set of baked numbers ──
const cores = PIECES.map((p) => block(html[p], 'ci-core')), bakes = PIECES.map((p) => block(html[p], 'ci-baked'));
check('the three pieces carry one engine, byte for byte', cores.every((c) => c === cores[0]), `${cores[0].length} characters`);
check('the three pieces carry one set of baked numbers', bakes.every((c) => c === bakes[0]), `${bakes[0].length} characters`);
const E = { Math, Float64Array, Float32Array, Array, Object, Infinity, JSON };
vm.createContext(E); vm.runInContext(cores[0] + '\n' + bakes[0] + '\nthis.CI = CI; this.BAKED = BAKED;', E);
const { CI, BAKED: B } = E, R = CI.RATE;
const dB10 = (v) => 10 * Math.log10(Math.max(v, 1e-30));
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const sine = (f, amp, secs) => Float64Array.from({ length: Math.round(secs * R) }, (_, n) => amp * Math.sin(2 * Math.PI * f * n / R));

console.log('— the meter —');
{ // BS.1770-4: a 0 dBFS 997 Hz sine reads −3.01 LKFS; a −20 dBFS one, −23.01
  const a = CI.loudness(sine(997, 1, 5)).lufs, b = CI.loudness(sine(997, 0.1, 5)).lufs;
  check('a full-scale 997 Hz sine reads −3.01 LUFS', near(a, -3.01, 0.05), `${a.toFixed(3)}; off by more than 0.05 would fail`);
  check('a −20 dBFS 997 Hz sine reads −23.01 LUFS', near(b, -23.01, 0.05), `${b.toFixed(3)}`);
  // the relative gate: 2 s at −20 dBFS then 2 s at −50 dBFS; the quiet half is more than 10 LU under, so it is gated out
  const two = new Float64Array(4 * R); for (let n = 0; n < 4 * R; n++) two[n] = (n < 2 * R ? 0.1 : 0.00316) * Math.sin(2 * Math.PI * 997 * n / R);
  const g = CI.loudness(two);
  // by the standard's own rule: 37 blocks; 17 wholly loud, three straddling the step at 3/4, 1/2 and 1/4 of its power, all
  // within 10 LU of the mean, so they pass; the 17 quiet ones don't. Gated mean = (17 + 1.5) / 20 of the loud power
  const want = -23.01 + 10 * Math.log10(18.5 / 20);
  check('the relative gate leaves out a passage 30 dB under the rest', near(g.lufs, want, 0.02) && g.kept === 20, `${g.lufs.toFixed(3)} LUFS gated against ${want.toFixed(3)} by hand, ${g.kept} of ${g.blocks} blocks kept; ${g.ungated.toFixed(2)} ungated`);
}

console.log('— the voice and the four blind versions —');
const v = CI.voice(), V = CI.versions(v);
{ const d = CI.voice(); let same = true; for (let i = 0; i < v.x.length; i++) if (v.x[i] !== d.x[i]) { same = false; break; }
  check('the voice is the same every time it is made', same, `${v.x.length} samples`); }
check('the dry phrase spans the range the pieces print', near(CI.range(CI.sylDb(v.x, v.syl)), B.dryRange, 0.01), `${CI.range(CI.sylDb(v.x, v.syl)).toFixed(3)} dB, printed ${B.dryRange}`);
check('each syllable sits at the level it was designed for', v.syl.every((s, i) => near(CI.sylDb(v.x, v.syl)[i], s.designDb, 0.01)), CI.sylDb(v.x, v.syl).map((x) => x.toFixed(2)).join(' '));
for (const k of ['none', 'r4', 'r20', 'prox']) {
  const o = V[k], bad = o.y.some((x) => !Number.isFinite(x));
  check(`${k}: matched to ${CI.TARGET} LUFS`, near(o.L.lufs, CI.TARGET, 0.01) && !bad, `${o.L.lufs.toFixed(4)} LUFS; more than 0.01 off would fail`);
  check(`${k}: the same length as the others, and under full scale`, o.len === V.none.len && o.peak < -1, `${o.len} samples, peak ${o.peak.toFixed(2)} dBFS`);
  for (const f of ['range', 'match', 'ungated', 'mmax', 'a', 'peak', 'loMax', 'hiMax', 'loMin', 'loTop', 'ltasLo', 'ltasHi']) {
    const live = { range: o.range, match: o.matchDb, ungated: o.L.ungated - V.none.L.ungated, mmax: o.L.momentaryMax - V.none.L.momentaryMax, a: o.aDb - V.none.aDb, peak: o.peak,
      loMax: Math.max(...o.sb.map((b, i) => Math.abs(b.lo - V.none.sb[i].lo))), hiMax: Math.max(...o.sb.map((b, i) => Math.abs(b.hi - V.none.sb[i].hi))),
      loMin: Math.min(...o.sb.map((b, i) => b.lo - V.none.sb[i].lo)), loTop: Math.max(...o.sb.map((b, i) => b.lo - V.none.sb[i].lo)), ltasLo: o.bands.lo - V.none.bands.lo, ltasHi: o.bands.hi - V.none.bands.hi }[f];
    if (!near(live, B.versions[k][f], 0.051)) check(`${k}: baked ${f} matches the engine`, false, `engine ${live.toFixed(3)}, printed ${B.versions[k][f]}`);
  }
}
check('every baked version number matches the engine to its printed digit', true, 'a mismatch would print a FAIL line above');
{ const worst = Math.max(...['r4', 'r20'].flatMap((k) => V[k].sb.flatMap((b, i) => [Math.abs(b.lo - V.none.sb[i].lo), Math.abs(b.hi - V.none.sb[i].hi)])));
  check('inside each syllable the compressor changes level, not colour', worst < 0.2, `largest shift of a band’s share ${worst.toFixed(3)} dB; 0.2 or more would fail`);
  const least = Math.min(...V.prox.sb.map((b, i) => b.lo - V.none.sb[i].lo));
  check('the close microphone lifts every syllable below 300 Hz', least > 3, `least lift ${least.toFixed(2)} dB`); }
check('the ranges fall as the page’s three versions say: uncompressed > 4:1 > 20:1', V.none.range > V.r4.range && V.r4.range > V.r20.range, `${V.none.range.toFixed(2)} > ${V.r4.range.toFixed(2)} > ${V.r20.range.toFixed(2)} dB`);
info('loudness the match can’t hold', `loudest 400 ms: 4:1 ${(V.r4.L.momentaryMax - V.none.L.momentaryMax).toFixed(2)}, 20:1 ${(V.r20.L.momentaryMax - V.none.L.momentaryMax).toFixed(2)} dB re uncompressed; ungated: ${(V.r4.L.ungated - V.none.L.ungated).toFixed(2)}, ${(V.r20.L.ungated - V.none.L.ungated).toFixed(2)}; A-weighted: ${(V.r4.aDb - V.none.aDb).toFixed(2)}, ${(V.r20.aDb - V.none.aDb).toFixed(2)}`);

console.log('— the compressor —');
{ const c = CI.compress(v.x, { T: -30, ratio: 1, att: 0.01, rel: 0.12, look: 0.005 }); let d = 0; for (let i = 0; i < v.x.length; i++) d = Math.max(d, Math.abs(c.y[i] - v.x[i]));
  check('at 1:1 the compressor is a wire (the null)', d < 1e-12, `largest difference ${d.toExponential(2)}; anything over 1e-12 would fail`); }
for (const [ratio, want] of [[4, -25], [20, -29], [Infinity, -30]]) {
  // a steady 1 kHz sine with RMS −10 dBFS, threshold −30: out = T + 20/R
  const x = sine(1000, Math.SQRT2 * Math.pow(10, -10 / 20), 1.5), c = CI.compress(x, { T: -30, ratio, att: 0.005, rel: 0.1 }), out = CI.rmsDb(c.y, R, Math.round(1.4 * R));
  check(`static curve at ${ratio === Infinity ? '∞' : ratio}:1: −10 dB in, threshold −30, ${want} dB out`, near(out, want, 0.1), `${out.toFixed(3)} dB`);
}
for (const k of ['r4', 'r20']) { const c = CI.compress(v.x, CI.SETTINGS[k]), rp = CI.ripple(v.x, c.gr, v.syl[4]);
  check(`${k}: the gain inside the held shout doesn’t ripple into a tell`, rp.residueDb < -30, `moves ${rp.pp.toFixed(2)} dB peak to peak; what a 20 Hz-smooth gain would not make sits at ${rp.residueDb.toFixed(1)} dB; −30 or louder would fail`);
  check(`${k}: printed ripple and residue match`, near(rp.pp, B.versions[k].ripple, 0.006) && Math.round(rp.residueDb) === B.versions[k].residue, `${rp.pp.toFixed(3)} / ${rp.residueDb.toFixed(1)}`); }
{ const over = (y, i) => { const s = CI.PHRASE[i], on = Math.round(s.t * R); let mx = -1e9; for (let j = on; j < on + Math.round(0.1 * R); j += 48) mx = Math.max(mx, CI.rmsDb(y, j, j + 240)); return mx - CI.rmsDb(y, v.syl[i].win[0], v.syl[i].win[1]); };
  const ex = CI.PHRASE.map((_, i) => over(V.r20.y, i) - over(V.none.y, i));
  check('20:1, looking 5 ms ahead, raises no syllable’s start into a click', Math.max(...ex) < 3, `largest extra onset ${Math.max(...ex).toFixed(2)} dB over the uncompressed one; 3 or more would fail`); }
{ // the proximity shelf against its own analog form
  const a = 343 / (2 * CI.PROX_R), b = 2 * Math.PI * 70, an = (f) => { const w = 2 * Math.PI * f; return 10 * Math.log10((w * w + a * a) / (w * w + b * b)); };
  const dig = CI.proxGainDb(200) - CI.proxGainDb(1000), ana = an(200) - an(1000), card = (f) => 10 * Math.log10(1 + Math.pow(a / (2 * Math.PI * f), 2));
  check('the close-microphone shelf is its analog form, 200 Hz against 1 kHz', near(dig, ana, 0.05) && near(dig, B.prox200, 0.05), `digital ${dig.toFixed(3)}, analog ${ana.toFixed(3)}, printed ${B.prox200}`);
  info('a cardioid at 5 cm with no low hold', `${(card(200) - card(1000)).toFixed(2)} dB at 200 Hz re 1 kHz; the 70 Hz hold costs ${((card(200) - card(1000)) - dig).toFixed(2)} dB there`); }

console.log('— distance —');
{ const fl = CI.floorNoise(v.x.length), tl = CI.roomTail(v.x); let worst = 0, widest = -Infinity;
  for (let u = 0; u <= 60; u++) { const r = 0.05 * Math.pow(1000, u / 60);
    worst = Math.max(worst, Math.abs(CI.range(CI.sylDb(CI.place(v.x, tl, fl, r, false, false), v.syl)) - B.dryRange));
    widest = Math.max(widest, CI.range(CI.sylDb(CI.place(v.x, tl, fl, r, false, true), v.syl)) - B.dryRange); }
  check('open air, the voice alone: the range is the same at every distance (the null)', worst < 1e-6, `largest change ${worst.toExponential(2)} dB over 61 distances, 5 cm to 50 m; 0.001 or more would fail`);
  check('open air over the floor: distance never widens the range', widest <= 1e-6, `widest change ${widest.toFixed(4)} dB; anything above 0 would bear the page out`);
  for (const r in B.open) { const a = CI.range(CI.sylDb(CI.place(v.x, tl, fl, +r, false, false), v.syl)), b = CI.range(CI.sylDb(CI.place(v.x, tl, fl, +r, false, true), v.syl));
    if (!near(a, B.open[r][0], 0.006) || !near(b, B.open[r][1], 0.006)) check(`baked range at ${r} m matches`, false, `${a.toFixed(3)} / ${b.toFixed(3)} against ${B.open[r]}`); }
  check('every baked distance range matches the engine', true, 'a mismatch would print a FAIL line above');
  const rooms = []; for (let s = 1; s <= 12; s++) rooms.push(CI.range(CI.sylDb(CI.place(v.x, CI.roomTail(v.x, s), fl, 8, true, true), v.syl)) - B.dryRange);
  const m = rooms.reduce((a, b) => a + b) / rooms.length;
  check('twelve rooms at 8 m: the printed spread and mean', near(m, B.rooms.mean, 0.051) && near(Math.min(...rooms), B.rooms.lo, 0.051) && near(Math.max(...rooms), B.rooms.hi, 0.051), `${rooms.map((x) => x.toFixed(2)).join(' ')}; mean ${m.toFixed(2)}`);
  const W = [0, -2, -1, -3, 0, -2, -4];
  for (const [name, eff] of [['whisper', 0], ['shout', 1]]) { const p = CI.voice({ effort: eff, wobble: W }), t = CI.roomTail(p.x);
    for (const r of ['0.05', '50']) { const lv = CI.sylDb(CI.place(p.x, t, fl, +r, false, true), p.syl);
      check(`the page’s pair: ${name} at ${r} m`, near(CI.range(lv), B.pair[name][r].range, 0.006) && near(Math.max(...lv), B.pair[name][r].top, 0.051), `range ${CI.range(lv).toFixed(3)}, loudest ${Math.max(...lv).toFixed(2)} dB`); } }
  check('the whisper in your ear arrives louder than the shout across the field', B.pair.whisper['0.05'].top > B.pair.shout['50'].top, `${(B.pair.whisper['0.05'].top - B.pair.shout['50'].top).toFixed(1)} dB louder`); }

console.log('— the four knobs —');
{ const mean = (a, w) => { let s = 0; for (let i = w[0]; i < w[1]; i++) s += a[i]; return s / (w[1] - w[0]); }, n0 = Math.round((1.90 + 0.56 + 0.06) * R);
  const run = (rel) => { const c = CI.compress(v.x, { T: -30, ratio: 4, att: 0.010, rel, look: 0.005 }); let n = n0; while (n < c.gr.length && c.gr[n] - c.want[n] > 1) n++; return { soft: mean(c.gr, v.syl[5].win), want: mean(c.want, v.syl[5].win), whisper: mean(c.gr, v.syl[6].win), hang: (n - n0) / R * 1000 }; };
  const f = run(0.04), s = run(1.0);
  check('release, the test: a slower release holds the soft line after the shout harder', s.soft > f.soft + 3 && s.whisper > f.whisper + 3, `40 ms: ${f.soft.toFixed(2)} dB (its level asks ${f.want.toFixed(2)}), whisper ${f.whisper.toFixed(2)}, extra hold ${f.hang.toFixed(0)} ms · 1 s: ${s.soft.toFixed(2)} dB, whisper ${s.whisper.toFixed(2)}, extra hold ${s.hang.toFixed(0)} ms; the page’s line would need the 1 s numbers smaller`);
  check('release: printed numbers match', near(f.soft, B.release['0.04'].soft, 0.051) && near(s.soft, B.release['1'].soft, 0.051) && near(s.whisper, B.release['1'].whisper, 0.051) && Math.abs(s.hang - B.release['1'].hangMs) <= 1 && Math.abs(f.hang - B.release['0.04'].hangMs) <= 1, 'soft, whisper, hold time');
  const over = (att) => { const c = CI.compress(v.x, { T: -30, ratio: 4, att, rel: 0.12, look: 0.005 }), on = Math.round(1.90 * R); let mx = -1e9; for (let i = on; i < on + Math.round(0.1 * R); i += 48) mx = Math.max(mx, CI.rmsDb(c.y, i, i + 240)); return mx - CI.rmsDb(c.y, v.syl[4].win[0], v.syl[4].win[1]); };
  const a1 = over(0.001), a50 = over(0.05);
  check('attack: a slow attack lets the start of the shout through', a50 > a1 + 3 && near(a1, B.attack['0.001'], 0.051) && near(a50, B.attack['0.05'], 0.051), `1 ms ${a1.toFixed(2)} dB, 50 ms ${a50.toFixed(2)} dB over the held part`);
  for (const T of [-10, -30, -50]) { const c = CI.compress(v.x, { T, ratio: 4, att: 0.01, rel: 0.12, look: 0.005 }); const k = v.syl.filter((q) => { let m = 0; for (let i = q.win[0]; i < q.win[1]; i++) m = Math.max(m, c.want[i]); return m > 0.5; }).length;
    check(`threshold ${T} dB touches ${B.thresh[T]} of 7 syllables`, k === B.thresh[T], `${k}`); }
  const inf = CI.compress(v.x, { T: -30, ratio: Infinity, att: 0.01, rel: 0.12, look: 0.005 }), shoutOut = CI.sylDb(inf.y, v.syl)[4];
  check('∞:1 pins the shout to the threshold', near(shoutOut, -30, 0.3) && near(shoutOut, B.ratio.inf.shoutOut, 0.051), `${shoutOut.toFixed(2)} dB`); }

console.log('— the counts —');
check('7 or more of 8 by guessing is 9 in 256', CI.tail(8, 7) * 256 === 9 && B.tail7of8 === 9 / 256, `${CI.tail(8, 7)}`);
{ const two = 2 * CI.tail(8, 7), fam = 1 - Math.pow(1 - two, 3);
  check('three sets of eight: a guesser trips one of the six edges about 1 time in 5', near(fam, 0.2, 0.01), `${fam.toFixed(4)}`); }
{ // the trial list the blind piece builds: eight per set, four with the processed one first
  const src = html['where is the singer'];
  check('the blind piece builds eight trials a set, four with the processed one first', /for \(let i = 0; i < 8; i\+\+\) list\.push\(\{ arm, first: i < 4 \? arm : 'none'/.test(src) && /CI\.shuffle\(list, r\)/.test(src), 'read from its source'); }

console.log(fails ? `\n${fails} FAIL` : '\nall PASS'); process.exit(fails ? 1 : 0);
