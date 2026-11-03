// Hyperdimensional Prism — rich checks. Pulls the engine out of both pieces, checks they are the same bytes,
// and re-runs every claim the pieces make. Each check prints its number and the number that would have meant failure.
// Run: node "Hyperdimensional Prism/workshop/rich-checks.mjs"
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url)), B = join(here, '..');
const pull = (f) => { const s = readFileSync(join(B, f), 'utf8'); return s.slice(s.indexOf('// ENGINE-START'), s.indexOf('// ENGINE-END')); };
const e1 = pull('Hyperdimensional Prism — rich — one object or four.html'), e2 = pull('Hyperdimensional Prism — rich — angle or object.html');
let bad = 0; const ok = (c, msg) => { console.log((c ? 'pass ' : 'FAIL ') + msg); if (!c) bad++; };
ok(e1 === e2 && e1.length > 1000, `engine identical in both pieces (${e1.length} bytes)`);
const HP = new Function(e1 + '\nreturn HP;')();
const SEEDS = 1000;
let w1 = 0, m4 = 1, c1 = 0, c4 = 0, u1 = 0, u4 = 0, cap8 = 0, cap6 = 0;
for (let s = 1; s <= SEEDS; s++) {
  const a = HP.trial(s, 'one'), b = HP.trial(s + 50000, 'four'); const ja = HP.judge(a.shadows), jb = HP.judge(b.shadows);
  w1 = Math.max(w1, ja.sv[4]); m4 = Math.min(m4, jb.sv[4]); if (ja.says === 'one') c1++; if (jb.says === 'four') c4++;
  if (HP.judge(HP.unlink(a.shadows, s + 1)).says === 'four') u1++; if (HP.judge(HP.unlink(b.shadows, s + 1)).says === 'four') u4++;
  if (HP.judge(a.shadows, 8).says === 'one' && HP.judge(b.shadows, 8).says === 'one') cap8++;
  if (HP.judge(a.shadows, 6).says === 'one' && HP.judge(b.shadows, 6).says === 'four') cap6++;
}
ok(c1 === SEEDS && w1 < HP.TOL, `one object: the count says one in ${c1}/${SEEDS}; worst fifth direction ${w1.toExponential(2)} of the first (fails above ${HP.TOL})`);
ok(c4 === SEEDS && m4 > HP.TOL, `four objects: the count says four in ${c4}/${SEEDS}; smallest fifth direction ${m4.toExponential(2)} (fails below ${HP.TOL})`);
ok(u1 === SEEDS && u4 === SEEDS, `links lost: the count says four for one-object sets ${u1}/${SEEDS} and four-object sets ${u4}/${SEEDS}`);
ok(cap8 === SEEDS, `object allowed 8 dimensions: both kinds read as one in ${cap8}/${SEEDS}`);
ok(cap6 === SEEDS, `object allowed 6 dimensions: still told apart in ${cap6}/${SEEDS}`);
// a single shadow carries nothing about its set: compare each kind's single-shadow statistics (spread of the two axes, curve length)
const stat = (S) => { let len = 0; const N = S[0].length; for (let n = 0; n < N; n++) { const m = (n + 1) % N; len += Math.hypot(S[0][m] - S[0][n], S[1][m] - S[1][n]); } return len; };
let L1 = 0, L4 = 0; for (let s = 1; s <= SEEDS; s++) { L1 += stat(HP.trial(s, 'one').shadows[0]); L4 += stat(HP.trial(s + 50000, 'four').shadows[0]); }
ok(Math.abs(L1 - L4) / L1 < 0.03, `leak check: mean shadow length one ${(L1 / SEEDS).toFixed(2)} vs four ${(L4 / SEEDS).toFixed(2)} (a gap over 3% would be a cue)`);
// noise control: eight rows of noise must not read as one object
const r = HP.rng(7), noise = Array.from({ length: 8 }, () => Float64Array.from({ length: 240 }, () => r() - 0.5));
ok(HP.count(HP.singular(noise)) === 8, 'noise control: eight rows of noise need 8 directions');
// the scope
let err = 0; const X = HP.torusCurve(2, 3, 720); for (const p of [0, 0.7, 2.5, 5]) { const Sh = HP.cast(HP.scopeLight(p), X), D = HP.scope(2, 3, p, 720); for (let i = 0; i < 2; i++) for (let n = 0; n < 720; n++) err = Math.max(err, Math.abs(Sh[i][n] - D[i][n])); }
ok(err < 1e-12, `the scope at any phase is a light on (sin at, cos at, sin bt, cos bt): max difference ${err.toExponential(2)} (an identity; shown, not tested)`);
const rows = (L) => L.flatMap(([a, b, p]) => HP.scope(a, b, p, 720));
let worstA = 0; for (const [a, b] of [[1, 1], [1, 2], [2, 3], [3, 4], [3, 5]]) for (let s = 0; s < 50; s++) { const q = HP.rng(s + 1); const d = HP.count(HP.singular(rows([0, 1, 2, 3].map(() => [a, b, HP.TAU * q()])))); worstA = Math.max(worstA, d); }
ok(worstA <= 4, `row A, one ratio and four phases, 250 sets: at most ${worstA} directions (fails above 4)`);
let minB = 99; for (let s = 0; s < 50; s++) { const p = HP.TAU * HP.rng(s + 9)(); minB = Math.min(minB, HP.count(HP.singular(rows([[1, 2, p], [2, 3, p], [3, 4, p], [3, 5, p]])))); }
console.log(`      row B, four ratios at one phase, 50 phases: at least ${minB} directions — the page's sentence would pass at 4 or fewer`);
ok(HP.count(HP.singular(rows([[1, 2, 0.3], [2, 1, 1.1]]))) === 4, 'a swap is a light too: 1:2 and 2:1 need 4 directions');
console.log(bad ? `${bad} check(s) failed` : 'all checks pass'); process.exit(bad ? 1 : 0);
