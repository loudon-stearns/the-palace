// Dovetail Joint ↔ Counterpoint — rich — check.mjs
// born: 2026-11-04 · checks [[Dovetail Joint ↔ Counterpoint]]'s rich-face piece "remove one voice"
// forward_vector: I re-run, headless, every claim the piece makes about its own engine and about the section it
// serves: that every line it calls written for the cantus keeps the page's Part 2 rules, judged here by a checker
// written on its own (and that the checker catches planted parallel fifths, fifths across a bar line and a leaping dissonance);
// that every line it calls not written for it breaks them, and matches the written line in leaps, passing tones,
// range, average pitch, contrary and similar motion, and its pitch classes on strong and on weak beats; that the numbers the piece prints for its pairs are the
// engine's, and that its chord counts agree with chords spelled out here by name; that no rule reading one line's
// shape, and no pitch-class habit learned from half the trials, passes the blind test; that its clips are
// level-matched; and that its chance figures are the counts they claim. What a listener hears I cannot check.
// --print writes the three baked objects (ENS, LEAK, LEVEL) as the piece should carry them.
//
//   node "Cross-Domain Resonances/Dovetail Joint ↔ Counterpoint/Dovetail Joint ↔ Counterpoint — rich — check.mjs" [--trials 120]
//
// It pulls the page's <script id="cp-core"> out of the HTML, runs it in a Node sandbox, and compares. PASS/FAIL per
// claim, INFO for numbers worth reading; exits 1 on any FAIL. Reads only; writes nothing. About two minutes.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(HERE, 'Dovetail Joint ↔ Counterpoint — rich — remove one voice.html'), 'utf8');
const m = html.match(/<script id="cp-core">([\s\S]*?)<\/script>/);
// run in this realm, not a vm context: the search is a hundred times slower behind a contextified global
const CP = new Function(m[1] + '\nreturn CP;')();
const ENS = JSON.parse(html.match(/const ENS = (\{.*\});/)[1]);
const LEAK = JSON.parse(html.match(/const LEAK = (\{.*\});/)[1]);
const LEVEL = JSON.parse(html.match(/const LEVEL = (\{.*\});/)[1]);
const PRINT = process.argv.includes('--print'); const BAKE = {};
const argT = process.argv.indexOf('--trials'); const NT = argT > 0 ? +process.argv[argT + 1] : 300;

let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const info = (name, detail) => console.log(`INFO  ${name}  (${detail})`);
const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length, r3 = (x) => Math.round(x * 1000) / 1000;

// ── a rule checker written here on its own, from the page's Part 2 and Fux's second species ──
const WHITE = new Set([0, 2, 4, 5, 7, 9, 11]), CONSO = new Set([0, 3, 4, 7, 8, 9]);
function breaks(line, cf) {
  const out = [], c = (i) => cf.notes[Math.floor(i / 2)], last = line.length - 1;
  if (line.length !== 2 * cf.notes.length - 1) out.push('length');
  line.forEach((u, i) => { if (!WHITE.has(u % 12) && !(i === last - 1 && u % 12 === cf.lead % 12)) out.push(`chromatic at ${i}`); if (u <= c(i)) out.push(`at or below the cantus at ${i}`); });
  if (![0, 7].includes((line[0] - c(0)) % 12)) out.push('does not begin on a fifth or octave');
  if ((line[last] - c(last)) % 12 !== 0) out.push('does not end on the octave');
  if ((line[last - 1] - c(last - 1)) % 12 !== 9) out.push('no leading tone a major sixth above');
  for (let i = 0; i <= last; i += 2) if (!CONSO.has((line[i] - c(i)) % 12)) out.push(`strong-beat dissonance at ${i}`);
  for (let i = 1; i < last; i += 2) if (!CONSO.has((line[i] - c(i)) % 12)) { const a = line[i] - line[i - 1], b = line[i + 1] - line[i]; if (!(Math.abs(a) <= 2 && Math.abs(b) <= 2 && Math.sign(a) === Math.sign(b))) out.push(`weak-beat dissonance not passing at ${i}`); }
  for (let i = 2; i <= last; i += 2) { const p = (line[i - 2] - c(i - 2)) % 12, q = (line[i] - c(i)) % 12, du = Math.sign(line[i] - line[i - 2]), dc = Math.sign(c(i) - c(i - 2));
    if ((q === 0 || q === 7) && p === q && du === dc) out.push(`parallel ${q ? 'fifths' : 'octaves'} into ${i}`);
    const w = (line[i - 1] - c(i - 1)) % 12; if ((q === 0 || q === 7) && w === q) out.push(`${q ? 'fifths' : 'octaves'} across the bar line into ${i}`); }
  for (let i = 1; i <= last; i++) if (line[i] === line[i - 1]) out.push(`repeated note at ${i}`);
  return out;
}
// a cantus checker written here on its own: Fux's rules for a cantus, as this piece states them
function cantusBreaks(c, base) { const out = [], n = base.notes.length, d = (j) => c[j] - c[j - 1];
  if (c.length !== n) out.push('length'); if (c[0] !== base.notes[0] || c[n - 1] !== base.notes[0]) out.push('final'); if (c[n - 2] !== base.notes[n - 2]) out.push('cadence');
  c.forEach((m, j) => { if (!WHITE.has(m % 12)) out.push(`chromatic at ${j}`); });
  let leaps = 0; for (let j = 1; j < n; j++) { const a = Math.abs(d(j)); if (a === 0) out.push(`repeat at ${j}`); if (a === 6) out.push(`tritone at ${j}`); if (a > 7) out.push(`leap past a fifth at ${j}`); if (a > 2) leaps++;
    if (j >= 2 && Math.abs(d(j - 1)) >= 5 && !(a <= 2 && Math.sign(d(j)) === -Math.sign(d(j - 1)))) out.push(`leap not turned back at ${j}`); if (j >= 3 && c[j] === c[j - 2] && c[j - 1] === c[j - 3]) out.push(`wobble at ${j}`); }
  const hi = Math.max(...c), lo = Math.min(...c); if (c.filter((m) => m === hi).length !== 1) out.push('two highest notes'); if (hi - lo > 9) out.push('range'); if (leaps > 3) out.push('leaps');
  return out; }
function shape(line, cf) { const s = line.filter((_, i) => i % 2 === 0); let leaps = 0, through = 0, con = 0, sim = 0;
  for (let i = 1; i < line.length; i++) if (Math.abs(line[i] - line[i - 1]) > 2) leaps++;
  for (let i = 1; i < line.length - 1; i += 2) { const a = line[i] - line[i - 1], b = line[i + 1] - line[i]; if (Math.abs(a) <= 2 && Math.abs(b) <= 2 && Math.sign(a) === Math.sign(b)) through++; }
  for (let j = 1; j < s.length; j++) { const u = Math.sign(s[j] - s[j - 1]), c = Math.sign(cf.notes[j] - cf.notes[j - 1]); if (u && u === -c) con++; if (u && u === c) sim++; }
  return { leaps, through, con, sim, range: Math.max(...line) - Math.min(...line), mean: avg(line) }; }

console.log('— the checker can fail —');
{ const cf = CP.CANTI[0], I = CP.interlocked(cf, 8); check('a written line passes the checker', breaks(I, cf).length === 0, breaks(I, cf).join('; ') || 'no breaks');
  const P5 = CP.parallel(cf, 4); check('planted: the cantus a fifth up, held — the checker sees parallel fifths', breaks(P5, cf).some((b) => b.startsWith('parallel fifths')), breaks(P5, cf).filter((b) => b.startsWith('parallel')).length + ' parallel fifths found');
  const bad = I.slice(); let k = -1; for (let i = 1; i < bad.length - 1; i += 2) { for (const d of [5, -5, 7, -7]) { const v = bad[i - 1] + d; if (!CONSO.has((v - cf.notes[(i - 1) / 2]) % 12) && WHITE.has(v % 12)) { bad[i] = v; k = i; break; } } if (k > 0) break; }
  check('planted: a weak-beat dissonance reached by leap — the checker sees it', breaks(bad, cf).some((b) => b.startsWith('weak-beat')), `planted at ${k}`);
  check("the engine's own rule check agrees on the planted lines", !CP.isCounterpoint(P5, cf) && !CP.isCounterpoint(bad, cf), 'both refused');
  const x = I.slice(); x[3] = cf.notes[1] + 19; x[4] = cf.notes[2] + 19; const at = 4; // Fux's cantus: F3 under C5, then E3 under B4
  check('planted: the same fifth or octave on a weak beat and the strong beat after it — the checker sees it', breaks(x, cf).some((b) => b.includes('across the bar line')), `planted into ${at}`); }

console.log('— the pairs the piece reports, 60 seeds per cantus —');
const arms = { written: [], notwritten: [], tenths: [], octaves: [], other: [] }; let gaveUp = 0; const others = [];
for (const [ci, cf] of CP.CANTI.entries()) for (let s = 1; s <= 60; s++) { const seed = s * 7 + ci, I = CP.interlocked(cf, seed); if (!I) { gaveUp++; continue; } const N = CP.independent(cf, seed, I); if (!N) { gaveUp++; continue; } const o = CP.otherLine(cf, seed); if (!o) { gaveUp++; continue; } others.push(o);
  arms.written.push([I, cf]); arms.notwritten.push([N, cf]); arms.tenths.push([CP.parallel(cf, 9), cf]); arms.octaves.push([CP.parallel(cf, 7), cf]); arms.other.push([o.O, cf]); }
check(`${ENS.n} pairs, as the piece says`, arms.written.length === ENS.n, `${arms.written.length} built, ${gaveUp} seeds the search gave up on`);
{ const bad = arms.written.filter(([l, cf]) => breaks(l, cf).length); check('every written line keeps every rule (the independent checker)', bad.length === 0, `${bad.length} of ${arms.written.length} break one`);
  const ok = arms.notwritten.filter(([l, cf]) => breaks(l, cf).length === 0); check('every unwritten line breaks at least one vertical rule', ok.length === 0, `${ok.length} keep them all`);
  let mism = 0; arms.written.forEach(([I, cf], k) => { const a = shape(I, cf), b = shape(arms.notwritten[k][0], cf); if (a.leaps !== b.leaps || a.through !== b.through || a.con !== b.con || a.sim !== b.sim || Math.abs(a.range - b.range) > 1 || Math.abs(a.mean - b.mean) > 1.5) mism++; });
  check('each unwritten line matches its written one: leaps, passing tones, contrary and similar moves exactly, range ±1, mean ±1.5', mism === 0, `${mism} mismatched`);
  const pcs = (l, odd) => l.filter((_, i) => i % 2 === (odd ? 1 : 0)).map((u) => u % 12).sort((a, b) => a - b).join();
  const pcm = arms.written.filter(([I], k) => pcs(I, 0) !== pcs(arms.notwritten[k][0], 0) || pcs(I, 1) !== pcs(arms.notwritten[k][0], 1)).length;
  check('each unwritten line uses the written one\'s pitch classes, strong beats and weak beats each, as often', pcm === 0, `${pcm} differ`);
  const st = (l) => l.filter((_, i) => i % 2 === 0), moved = arms.written.map(([I], k) => st(I).filter((m, j) => m !== st(arms.notwritten[k][0])[j]).length);
  check('and moves at least four of its strong beats', Math.min(...moved) >= 4, `fewest ${Math.min(...moved)}, mean ${avg(moved).toFixed(1)}`);
  const oBad = others.filter((o, k) => breaks(o.O, o.Y).length || cantusBreaks(o.Y.notes, arms.other[k][1]).length).length; check('every line written for another cantus keeps every rule against that cantus, and that cantus keeps the cantus rules', oBad === 0, `${oBad} of ${others.length} break one`);
  const oFit = arms.other.filter(([l, cf]) => breaks(l, cf).length === 0).length; check('and breaks at least one against this one', oFit === 0, `${oFit} fit`);
  const pass = arms.written.reduce((s, [l, cf]) => s + l.filter((u, i) => i % 2 === 1 && !CONSO.has((u - cf.notes[(i - 1) / 2]) % 12)).length, 0);
  info('passing dissonances in the written lines', `${pass} over ${arms.written.length} lines, ${(pass / arms.written.length).toFixed(2)} a line — the Part 2 "dissonance resolving by step" rule is exercised, not idle`); }
// chords spelled out by name, not by the engine's arithmetic: the white-key triads, and for D dorian the A major its cadence borrows
const PC = { C: 0, 'C#': 1, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const WHITE_TRIADS = ['C E G', 'D F A', 'E G B', 'F A C', 'G B D', 'A C E', 'B D F'];
const chordsFor = (cf) => (cf.name.startsWith('D dorian') ? [...WHITE_TRIADS, 'A C# E'] : WHITE_TRIADS).map((t) => t.split(' ').map((n) => PC[n]));
function myHarmony(line, cf) { const T = chordsFor(cf), fit = (pcs) => T.filter((t) => pcs.every((p) => t.includes(((p % 12) + 12) % 12))).length; const s = line.filter((_, i) => i % 2 === 0);
  let nar = 0, con = 0; s.forEach((m, j) => { const a = fit([cf.notes[j]]), b = fit([cf.notes[j], m]); if (b >= 1 && b < a) nar++; if (b === 0) con++; }); return { narrows: nar / s.length, contradicts: con / s.length }; }
{ const T0 = chordsFor(CP.CANTI[0]).map((t) => t.slice().sort((a, b) => a - b).join()).sort().join('|'), T1 = CP.triads(CP.CANTI[0]).map((t) => t.slice().sort((a, b) => a - b).join()).sort().join('|');
  check("the engine's chords for D dorian are the white triads and A major (A C♯ E)", T0 === T1, T1); }
BAKE.ENS = { n: arms.written.length };
for (const [k, L] of Object.entries(arms)) {
  const H = L.map(([l, cf]) => CP.harmony(l, cf)), R = L.map(([l, cf]) => CP.recover(l, cf)), M = L.map(([l, cf]) => myHarmony(l, cf));
  const got = { narrows: r3(avg(H.map((h) => h.narrows))), contradicts: r3(avg(H.map((h) => h.contradicts))), same: r3(avg(H.map((h) => h.same))), shift: r3(avg(R.map((r) => r.shift))), shiftMax: r3(Math.max(...R.map((r) => r.shift))), mirror: r3(avg(R.map((r) => r.mirror))), mirrorMax: r3(Math.max(...R.map((r) => r.mirror))), direction: r3(avg(R.map((r) => r.direction))) };
  BAKE.ENS[k] = got;
  const mine = { narrows: r3(avg(M.map((h) => h.narrows))), contradicts: r3(avg(M.map((h) => h.contradicts))) };
  check(`${k}: the engine's chord counts agree with chords spelled by name`, mine.narrows === got.narrows && mine.contradicts === got.contradicts, `engine ${got.narrows}/${got.contradicts}, by name ${mine.narrows}/${mine.contradicts}`);
  const same = Object.keys(got).every((q) => got[q] === ENS[k]?.[q]);
  check(`${k}: the printed numbers are the engine's`, same, JSON.stringify(got));
}
// the tests with teeth, each with the number that would have meant failure, on this run's numbers (not the piece's)
const E = BAKE.ENS;
info('harmonic reading, arithmetic not a test: a third always narrows, so parallel tenths narrow every strong beat and the written line can only tie or trail', `tenths ${E.tenths.narrows} vs written ${E.written.narrows}`);
info('rebuild, by construction: the written line\'s own rules (at least 60% contrary moves; the opening and cadence formula) cap it under 80% on these canti — the challenger counted at most 8 of 11 and 8 of 12', `most ${Math.max(E.written.shiftMax, E.written.mirrorMax)}`);
info('unwritten arms contradict more than the written, by construction: a line with no vertical rule lands seconds and sevenths on white keys (random lines: 28%)', `reordered ${E.notwritten.contradicts}, other cantus ${E.other.contradicts}, written ${E.written.contradicts}`);
check('control: the rebuild measure finds a line that can be rebuilt (parallel lines, by construction)', E.tenths.shiftMax === 1 && E.octaves.shiftMax === 1, 'tenths and octaves 1.0');
// a null: a random white-note line with no melodic rule — does it look "written for it"?
{ const r = CP.rng(4242), cf = CP.CANTI[0], P = []; for (let m = cf.lo; m <= cf.hi; m++) if (WHITE.has(m % 12)) P.push(m); let pass = 0, con = [];
  for (let t = 0; t < 2000; t++) { const l = Array.from({ length: 2 * cf.notes.length - 1 }, () => P[Math.floor(r() * P.length)]); if (breaks(l, cf).length === 0) pass++; con.push(CP.harmony(l, cf).contradicts); }
  check('null: random white-note lines almost never pass as written for the cantus (failure: ≥ 1%)', pass / 2000 < 0.01, `${pass} of 2000 pass; they contradict on ${(avg(con) * 100).toFixed(1)}% of strong beats`); }

console.log(`— the blind test: ${NT} trials, as the piece makes them —`);
const T = []; for (let s = 1; T.length < NT && s < NT * 3; s++) { const t = CP.trial(s * 1013); if (t) T.push(t); }
check('every trial pairs a line written for its cantus with one written for another', T.every((t) => breaks(t.I, t.cf).length === 0 && breaks(t.N, t.cf).length > 0 && breaks(t.N, t.other).length === 0), `${T.length} trials`);
{ const bad = T.filter((t) => { const base = CP.CANTI.find((b) => t.cf.name.startsWith(b.name.split(' · ')[0])); return cantusBreaks(t.cf.notes, base).length || cantusBreaks(t.other.notes, base).length || t.cf.notes.join() === t.other.notes.join(); }).length;
  check('both canti of every trial keep the cantus rules, and differ', bad === 0, `${bad} of ${T.length} break one`);
  const distinct = new Set(T.map((t) => t.cf.notes.join())).size; info('fresh canti', `${distinct} different canti over ${T.length} trials`); }
const strategies = { 'fewer leaps': (l, cf) => -shape(l, cf).leaps, 'lower line': (l, cf) => -shape(l, cf).mean, 'higher line': (l, cf) => shape(l, cf).mean, 'narrower range': (l, cf) => -shape(l, cf).range,
  'more passing weak beats': (l, cf) => shape(l, cf).through, 'more leaps': (l, cf) => shape(l, cf).leaps, 'more stepwise motion overall': (l) => l.slice(1).filter((u, i) => Math.abs(u - l[i]) <= 2).length };
const rows = [];
const score = (f, seed) => { const coin = CP.rng(seed); let hit = 0; for (const t of T) { const a = f(t.A, t), b = f(t.B, t); const g = a === b ? (coin() < 0.5 ? 'A' : 'B') : (a > b ? 'A' : 'B'); if (g === t.answer) hit++; } return r3(hit / T.length); };
Object.entries(strategies).forEach(([k, f], q) => { const v = score((l, t) => f(l, t.cf), 77 + q); rows.push([k, v]);
  check(`no-listen rule "${k}" stays under 65%`, v < 0.65, `${(100 * v).toFixed(1)}%`); });
// a learned probe: pitch-class habits of each arm, learned on half the trials (per cantus), tested on the other half, then the halves swapped.
// It reads one line alone and never the cantus, as the "apart" block plays it. Naive Bayes with add-one smoothing.
function learned(feats, seed) { const coin = CP.rng(seed); let hit = 0;
  for (const fold of [0, 1]) { const tab = {}; const key = (t, w) => t.cf.name + '|' + w;
    T.forEach((t, i) => { if (i % 2 === fold) return; for (const [w, l] of [['I', t.I], ['N', t.N]]) for (const f of feats(l, t)) { const K = key(t, w); (tab[K] ||= { n: 0 }); tab[K][f] = (tab[K][f] || 0) + 1; tab[K].n++; } });
    const ll = (l, t) => feats(l, t).reduce((s, f) => { const a = tab[key(t, 'I')] || { n: 0 }, b = tab[key(t, 'N')] || { n: 0 }; return s + Math.log(((a[f] || 0) + 1) / (a.n + 48)) - Math.log(((b[f] || 0) + 1) / (b.n + 48)); }, 0);
    T.forEach((t, i) => { if (i % 2 !== fold) return; const a = ll(t.A, t), b = ll(t.B, t); const g = a === b ? (coin() < 0.5 ? 'A' : 'B') : (a > b ? 'A' : 'B'); if (g === t.answer) hit++; }); }
  return r3(hit / T.length); }
{ const v1 = learned((l) => l.map((u) => 'pc' + (u % 12)), 91), v2 = learned((l) => l.filter((_, i) => i % 2 === 0).map((u) => 'pc' + (u % 12)), 92);
  const v4 = learned((l) => l.slice(1).map((u, i) => 'iv' + (u - l[i])), 94), v5 = learned((l) => l.slice(1).map((u, i) => (l[i] % 12) + '>' + (u % 12)), 95);
  rows.push(['pitch-class habits, learned from the other half of the trials (one line alone)', v1], ['pitch-class habits on the strong beats, learned the same way', v2], ['melodic intervals, up and down, learned the same way', v4], ['note-to-note moves, learned the same way', v5], ['the note in each place, learned the same way', learned((l) => l.map((u, i) => i + ':' + (u % 12)), 93)]);
  check('learned probe: pitch-class habits of a lone line stay under 65%', v1 < 0.65, `${(100 * v1).toFixed(1)}%`);
  check('learned probe: strong-beat pitch-class habits stay under 65%', v2 < 0.65, `${(100 * v2).toFixed(1)}%`);
  check('learned probe: melodic-interval habits stay under 65%', v4 < 0.65, `${(100 * v4).toFixed(1)}%`);
  check('learned probe: note-to-note habits stay under 65%', v5 < 0.65, `${(100 * v5).toFixed(1)}%`);
  check('learned probe: the note in each place stays under 65%', rows[rows.length - 1][1] < 0.65, `${(100 * rows[rows.length - 1][1]).toFixed(1)}%`); }
{ const v = score((l, t) => CP.contraryCount(l, t.cf), 98); rows.push(['pair · more contrary motion against the cantus (the page’s own rule)', v]); info('pair: more contrary motion against the cantus', `${(100 * v).toFixed(1)}%`); }
{ const v = score((l, t) => -l.filter((u, i) => i % 2 === 0 && !CONSO.has((u - t.cf.notes[i / 2]) % 12)).length, 99); rows.push(['pair · fewer strong-beat dissonances against the cantus (the thing under test)', v]);
  check('control: reading both voices at once (strong-beat dissonances) finds the cue a lone line lacks (failure: ≤ 65%)', v > 0.65, `${(100 * v).toFixed(1)}%`); }
{ const sd = T.map((t) => t.N.filter((u, i) => i % 2 === 0 && !CONSO.has((u - t.cf.notes[i / 2]) % 12)).length), sn = T.map((t) => (t.N.length + 1) / 2);
  var DIS = { mean: r3(avg(sd)), share: r3(sd.reduce((a, b) => a + b, 0) / sn.reduce((a, b) => a + b, 0)), none: sd.filter((x) => x === 0).length };
  info('the line written for another cantus, on this one: strong-beat dissonances', `${DIS.mean} a line, ${(100 * DIS.share).toFixed(1)}% of strong beats; ${DIS.none} of ${T.length} trials have none`); }
BAKE.LEAK = { n: T.length, rows, dis: DIS };
check('the leak table the piece prints is this run', JSON.stringify(LEAK) === JSON.stringify(BAKE.LEAK), NT === 300 ? 'compared at 300 trials' : `run at ${NT}; the piece's is 300, so this compares only at 300`);
{ const a = T.filter((t) => t.answer === 'A').length; info('position of the written line', `A in ${a} of ${T.length}`); }
// level: every clip matched; the pairs before matching
{ const pre = [], post = []; for (const t of T.slice(0, 24)) { const a = CP.render(['cantus', t.I], t.cf), b = CP.render(['cantus', t.N], t.cf); pre.push(20 * Math.log10(CP.rms(a) / CP.rms(b)));
    post.push(20 * Math.log10(CP.rms(CP.matched(a).y) / CP.rms(CP.matched(b).y))); const la = CP.matched(CP.render([t.I], t.cf)).y, lb = CP.matched(CP.render([t.N], t.cf)).y; post.push(20 * Math.log10(CP.rms(la) / CP.rms(lb))); }
  const sgnd = (x) => (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(2);
  BAKE.LEVEL = { n: 24, lo: sgnd(Math.min(...pre)), hi: sgnd(Math.max(...pre)) };
  check('the level range the piece prints is this run', JSON.stringify(LEVEL) === JSON.stringify(BAKE.LEVEL), `${BAKE.LEVEL.lo} to ${BAKE.LEVEL.hi} dB over 24 trials, before matching`);
  check('every clip, pair or lone line, matched to the same RMS', Math.max(...post.map(Math.abs)) < 0.01, `worst ${Math.max(...post.map(Math.abs)).toExponential(1)} dB`);
  const lens = T.slice(0, 24).every((t) => CP.render(['cantus', t.I], t.cf).length === CP.render(['cantus', t.N], t.cf).length); check('the two clips of a trial last the same time', lens, 'equal sample counts'); }
// chance figures
{ const C = (n, r) => { let c = 1; for (let i = 0; i < r; i++) c = c * (n - i) / (i + 1); return c; }; const p = C(8, 7) + C(8, 8);
  check('7 or 8 of 8 by guessing is 9 in 256 (3.5%)', p === 9 && Math.abs(100 * p / 256 - 3.5) < 0.05, `${p} of 256 = ${(100 * p / 256).toFixed(2)}%`); }
if (PRINT) for (const k of ['ENS', 'LEAK', 'LEVEL']) console.log(`BAKE ${k} = ${JSON.stringify(BAKE[k])};`);
console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
