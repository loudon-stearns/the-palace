// Dovetail Joint ↔ Counterpoint — rich — check.mjs
// born: 2026-11-04 · checks [[Dovetail Joint ↔ Counterpoint]]'s rich-face piece "remove one voice"
// forward_vector: I re-run, headless, every claim the piece makes about its own engine and about the section it
// serves: that every line it calls written for the cantus keeps the page's Part 2 rules, judged here by a checker
// written on its own (and that the checker catches a planted parallel fifth and a planted leaping dissonance);
// that every line it calls not written for it breaks them, and matches the written line in leaps, passing tones,
// range, average pitch and contrary and similar motion; that the numbers the piece prints for 115 pairs are the
// engine's; that no rule reading one line's shape passes the blind test; that its clips are level-matched; and
// that its chance figures are the counts they claim. What a listener hears I cannot check.
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
const LEAK = html.match(/const LEAK = \{ n: (\d+), rows: (\[.*\]) \};/);
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
    if ((q === 0 || q === 7) && p === q && du === dc) out.push(`parallel ${q ? 'fifths' : 'octaves'} into ${i}`); }
  for (let i = 1; i <= last; i++) if (line[i] === line[i - 1]) out.push(`repeated note at ${i}`);
  return out;
}
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
  check("the engine's own rule check agrees on the planted lines", !CP.isCounterpoint(P5, cf) && !CP.isCounterpoint(bad, cf), 'both refused'); }

console.log('— the 115 pairs the piece reports —');
const arms = { written: [], notwritten: [], tenths: [], octaves: [] }; let gaveUp = 0;
for (const [ci, cf] of CP.CANTI.entries()) for (let s = 1; s <= 60; s++) { const seed = s * 7 + ci, I = CP.interlocked(cf, seed); if (!I) { gaveUp++; continue; } const N = CP.independent(cf, seed, I); if (!N) { gaveUp++; continue; }
  arms.written.push([I, cf]); arms.notwritten.push([N, cf]); arms.tenths.push([CP.parallel(cf, 9), cf]); arms.octaves.push([CP.parallel(cf, 7), cf]); }
check('115 pairs, as the piece says', arms.written.length === ENS.n, `${arms.written.length} built, ${gaveUp} seeds the search gave up on`);
{ const bad = arms.written.filter(([l, cf]) => breaks(l, cf).length); check('every written line keeps every rule (the independent checker)', bad.length === 0, `${bad.length} of ${arms.written.length} break one`);
  const ok = arms.notwritten.filter(([l, cf]) => breaks(l, cf).length === 0); check('every unwritten line breaks at least one vertical rule', ok.length === 0, `${ok.length} keep them all`);
  let mism = 0; arms.written.forEach(([I, cf], k) => { const a = shape(I, cf), b = shape(arms.notwritten[k][0], cf); if (a.leaps !== b.leaps || a.through !== b.through || a.con !== b.con || a.sim !== b.sim || Math.abs(a.range - b.range) > 1 || Math.abs(a.mean - b.mean) > 1.5) mism++; });
  check('each unwritten line matches its written one: leaps, passing tones, contrary and similar moves exactly, range ±1, mean ±1.5', mism === 0, `${mism} mismatched`);
  const pass = arms.written.reduce((s, [l, cf]) => s + l.filter((u, i) => i % 2 === 1 && !CONSO.has((u - cf.notes[(i - 1) / 2]) % 12)).length, 0);
  info('passing dissonances in the written lines', `${pass} over ${arms.written.length} lines, ${(pass / arms.written.length).toFixed(2)} a line — the Part 2 "dissonance resolving by step" rule is exercised, not idle`); }
for (const [k, L] of Object.entries(arms)) {
  const H = L.map(([l, cf]) => CP.harmony(l, cf)), R = L.map(([l, cf]) => CP.recover(l, cf));
  const got = { narrows: r3(avg(H.map((h) => h.narrows))), contradicts: r3(avg(H.map((h) => h.contradicts))), shiftMax: r3(Math.max(...R.map((r) => r.shift))), mirrorMax: r3(Math.max(...R.map((r) => r.mirror))), direction: r3(avg(R.map((r) => r.direction))) };
  const same = Object.keys(got).every((q) => got[q] === ENS[k][q]);
  check(`${k}: the printed numbers are the engine's`, same, JSON.stringify(got));
}
// the three tests with teeth, each with the number that would have meant failure
check('harmonic reading: do parallel tenths narrow at least as often as the written line? (if not, harmony would single out co-design)', ENS.tenths.narrows >= ENS.written.narrows, `tenths ${ENS.tenths.narrows} vs written ${ENS.written.narrows}`);
check('rebuild: the removed written line is never 80% recoverable from the cantus by slide or mirror (failure: any pair ≥ 0.8)', Math.max(ENS.written.shiftMax, ENS.written.mirrorMax) < 0.8, `most ${Math.max(ENS.written.shiftMax, ENS.written.mirrorMax)}`);
check('vertical rules do work: the unwritten line contradicts the cantus on more strong beats than the written (failure: ≤ 0)', ENS.notwritten.contradicts > ENS.written.contradicts, `${ENS.notwritten.contradicts} vs ${ENS.written.contradicts}`);
check('control: the rebuild measure finds a line that can be rebuilt (parallel lines, by construction)', ENS.tenths.shiftMax === 1 && ENS.octaves.shiftMax === 1, 'tenths and octaves 1.0');
// a null: a random white-note line with no melodic rule — does it look "written for it"?
{ const r = CP.rng(4242), cf = CP.CANTI[0], P = []; for (let m = cf.lo; m <= cf.hi; m++) if (WHITE.has(m % 12)) P.push(m); let pass = 0, con = [];
  for (let t = 0; t < 2000; t++) { const l = Array.from({ length: 2 * cf.notes.length - 1 }, () => P[Math.floor(r() * P.length)]); if (breaks(l, cf).length === 0) pass++; con.push(CP.harmony(l, cf).contradicts); }
  check('null: random white-note lines almost never pass as written for the cantus (failure: ≥ 1%)', pass / 2000 < 0.01, `${pass} of 2000 pass; they contradict on ${(avg(con) * 100).toFixed(1)}% of strong beats`); }

console.log(`— the blind test: ${NT} trials, as the piece makes them —`);
const T = []; for (let s = 1; T.length < NT && s < NT * 3; s++) { const t = CP.trial(s * 1013); if (t) T.push(t); }
check('every trial pairs a written line with an unwritten one', T.every((t) => breaks(t.I, t.cf).length === 0 && breaks(t.N, t.cf).length > 0), `${T.length} trials`);
const strategies = { 'fewer leaps': (l, cf) => -shape(l, cf).leaps, 'lower line': (l, cf) => -shape(l, cf).mean, 'higher line': (l, cf) => shape(l, cf).mean, 'narrower range': (l, cf) => -shape(l, cf).range,
  'more contrary motion': (l, cf) => shape(l, cf).con, 'more passing weak beats': (l, cf) => shape(l, cf).through, 'more leaps': (l, cf) => shape(l, cf).leaps, 'more stepwise motion overall': (l) => l.slice(1).filter((u, i) => Math.abs(u - l[i]) <= 2).length };
const coin = CP.rng(77);
for (const [k, f] of Object.entries(strategies)) { let hit = 0; for (const t of T) { const a = f(t.A, t.cf), b = f(t.B, t.cf); const g = a === b ? (coin() < 0.5 ? 'A' : 'B') : (a > b ? 'A' : 'B'); if (g === t.answer) hit++; }
  check(`no-listen rule "${k}" stays under 65%`, hit / T.length < 0.65, `${(100 * hit / T.length).toFixed(1)}%`); }
{ let hit = 0; for (const t of T) { const d = (l) => l.filter((u, i) => i % 2 === 0 && !CONSO.has((u - t.cf.notes[i / 2]) % 12)).length; const a = d(t.A), b = d(t.B); if ((a === b ? (coin() < 0.5 ? 'A' : 'B') : (a < b ? 'A' : 'B')) === t.answer) hit++; }
  check('control: reading both voices at once (strong-beat dissonances) passes', hit / T.length > 0.95, `${(100 * hit / T.length).toFixed(1)}%`); }
{ const a = T.filter((t) => t.answer === 'A').length; info('position of the written line', `A in ${a} of ${T.length}`); }
info('the piece prints, from a 300-trial run', LEAK[2]);
// level: every clip matched; the pairs before matching
{ const pre = [], post = []; for (const t of T.slice(0, 24)) { const a = CP.render(['cantus', t.I], t.cf), b = CP.render(['cantus', t.N], t.cf); pre.push(20 * Math.log10(CP.rms(a) / CP.rms(b)));
    post.push(20 * Math.log10(CP.rms(CP.matched(a).y) / CP.rms(CP.matched(b).y))); const la = CP.matched(CP.render([t.I], t.cf)).y, lb = CP.matched(CP.render([t.N], t.cf)).y; post.push(20 * Math.log10(CP.rms(la) / CP.rms(lb))); }
  info('pairs before matching, written − unwritten', `${Math.min(...pre).toFixed(2)} to ${Math.max(...pre).toFixed(2)} dB over 24 trials; the piece says −0.32 to +0.20 from an earlier 20`);
  check('every clip, pair or lone line, matched to the same RMS', Math.max(...post.map(Math.abs)) < 0.01, `worst ${Math.max(...post.map(Math.abs)).toExponential(1)} dB`);
  const lens = T.slice(0, 24).every((t) => CP.render(['cantus', t.I], t.cf).length === CP.render(['cantus', t.N], t.cf).length); check('the two clips of a trial last the same time', lens, 'equal sample counts'); }
// chance figures
{ const C = (n, r) => { let c = 1; for (let i = 0; i < r; i++) c = c * (n - i) / (i + 1); return c; }; const p = C(8, 7) + C(8, 8);
  check('7 or 8 of 8 by guessing is 9 in 256 (3.5%)', p === 9 && Math.abs(100 * p / 256 - 3.5) < 0.05, `${p} of 256 = ${(100 * p / 256).toFixed(2)}%`); }
console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
