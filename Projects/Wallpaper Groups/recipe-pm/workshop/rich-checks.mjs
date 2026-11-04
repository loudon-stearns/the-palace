// rich-checks.mjs — re-checks, headless, the claims this bundle's rich-face piece makes, on the piece's
// own engine (the code between ENGINE-START and ENGINE-END, byte for byte the same in the pm, p3 and
// p6 recipe pieces). Run from anywhere:  node "<this file>"
// PASS/FAIL: what the piece says, measured. IDENTITY: true by construction, printed so it is not
// mistaken for a test. NULL: the meter reading the other answer somewhere, so the test could fail.
// FINDING: a measured disagreement with the recipe's text, carried to the manifest's offers. Exit 1 on any FAIL.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = join(dirname(fileURLToPath(import.meta.url)), '..'), wg = join(here, '..');
const piece = (b) => { const d = join(wg, b); const f = readdirSync(d).find((n) => / — rich — .*\.html$/.test(n)); return readFileSync(join(d, f), 'utf8'); };
const block = (b) => { const m = piece(b).match(/\/\*ENGINE-START\*\/([\s\S]*?)\/\*ENGINE-END\*\//); if (!m) throw new Error(`no engine in ${b}`); return m[1]; };
let fails = 0;
const say = (ok, what, detail) => { if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}${detail ? `\n      ${detail}` : ''}`); };
const identity = (ok, what) => { if (!ok) fails++; console.log(`${ok ? 'IDENTITY' : 'IDENTITY BROKEN'}  ${what}`); };
const nul = (ok, what) => { if (!ok) fails++; console.log(`${ok ? 'NULL ok' : 'NULL FAIL'}  ${what}`); };
const finding = (what) => console.log(`FINDING  ${what}`);
const others = ['recipe-pm', 'recipe-p3', 'recipe-p6'];
say(others.every((b) => block(b) === block(others[0])), 'the three recipe pieces carry the same engine, byte for byte');
const E = new Function(`${block(others[0])}\nreturn { mod, loopOf, hitsOf, count, same, slide, reflect, turns, period, mirrors, mirrorEnds, cook, subsets, dist, nearest, tiled, pmHalves, pmLoop, repeatLoop, pmBreaks, p3Cells, p3Loop, p3Cells24, p3Loop24, p6Cells, p6Loop, p6Loops, p6Breaks, BELL5, BELL7, tally };`)();
const T = E.tally();
const ones = (r) => E.hitsOf(r).map((i) => i + 1).join(' ');
// the meters themselves, against hand-made cases
say(E.mirrors(E.loopOf([0, 1, 3], 6)).length === 0 && E.mirrors(E.loopOf([0, 2], 6)).length > 0, 'mirror meter: reads none on 1 2 4 of 6, some on 1 3 of 6');
say(E.turns(E.loopOf([0, 4, 8], 12)).join() === '4,8' && E.turns(E.loopOf([0, 1], 12)).length === 0, 'turn meter: 1 5 9 of 12 lands under +4 and +8; 1 2 under none');
console.log('— recipe-pm as written (recipe-pm.md:9–19) —');
say(E.pmLoop([0])[15] === 1 && E.pmLoop([2])[13] === 1, 'the Method\'s examples: 1 → 16, 3 → 14');
say(T.pmHalves === 126, 'the halves step 2 allows: 3 or 4 hits in steps 1–8', `${T.pmHalves} = C(8,3) + C(8,4)`);
identity(T.pmMirror89 === 126, `every cooked loop lands on itself under n → 17 − n (${T.pmMirror89} of 126): the Method's mirror`);
identity(E.mirrorEnds(15, 16).join(' & ') === '8|9 & 16|1', `that mirror's two ends are ${E.mirrorEnds(15, 16).join(' & ')}: the Ingredients' "mirror at the start" (:12) is the same mirror`);
const H = E.pmHalves(), byHand = H.filter((h) => E.same(E.pmLoop(h), E.loopOf([...h, ...h.map((i) => 15 - i)].concat([]), 16)) && h.every((i) => E.pmLoop(h)[15 - i])).length;
identity(byHand === 126, 'on one voice the half-turn about 8|9 is the same formula as the mirror, i → 15 − i: pm\'s loop has the strip\'s half-turn too (:3 "No rotation")');
say(T.pmPeriod16 === 120, 'the mirror loop repeats only every 16 steps in 120 of 126', `${T.pmPeriod16}`);
nul(T.repeatPeriod8 === 126, `the same period meter reads 8 on the comparison loop (recipe-p2's n + 8) in ${T.repeatPeriod8} of 126`);
say(T.pmDiffers === 120, `the blind test draws from the ${T.pmDiffers} halves whose mirror and repeat differ; the 6 others read the same backwards inside their eight`);
console.log('— the blind test\'s arithmetic —');
const C = (n, k) => { let x = 1; for (let i = 1; i <= k; i++) x = (x * (n - k + i)) / i; return x; };
const p78 = (C(8, 7) + C(8, 8)) / 256;
say(Math.abs(p78 - 9 / 256) < 1e-12, `7 or 8 of 8 by guessing: ${(p78 * 100).toFixed(2)}% (9 in 256), one direction; the other direction is its own 3.5%, never added as a pass`);
// both arms identical in count and first half, for every half the test can draw
const H2 = H.filter((h) => !E.same(E.pmLoop(h), E.repeatLoop(h)));
say(H2.every((h) => E.count(E.pmLoop(h)) === E.count(E.repeatLoop(h)) && E.pmLoop(h).slice(0, 8).join() === E.repeatLoop(h).slice(0, 8).join()), 'matched: on all 120, both arms have the same number of hits and the same first half');
const piecePm = piece('recipe-pm');
say(/const TRIALS = 8;/.test(piecePm) && /Math\.random\(\) < 0\.5/.test(piecePm) && /display = test \? 'none'/.test(piecePm), 'the piece runs 8 trials, a coin for the order, and hides both pictures during the test');
say(!/createDynamicsCompressor/.test(piecePm), 'no compressor in the chain, so nothing depends on how many hits play');
console.log('— the break as written (recipe-pm.md:29): keep the hit, silence its reflection —');
say(T.pmBreaks === 448, `${T.pmBreaks} breaks: every hit of every half, its reflection silenced`);
identity(T.pmBreaksKeep89 === 0, 'no break keeps the 8|9 mirror (one partner is gone)');
say(T.pmBreaksKeepAMirror === 16, `but ${T.pmBreaksKeepAMirror} of 448 land on another mirror, through a step`);
const ex = H.flatMap((h) => E.pmBreaks(h)).filter((b) => E.mirrors(b.r).length).slice(0, 3).map((b) => `${ones(b.r)} (mirror ${E.mirrors(b.r).map((c) => E.mirrorEnds(c, 16).join(' & ')).join(', ')})`);
finding(`"The bilateral symmetry breaks" holds in 432 of 448 breaks; in 16 the broken loop is still a mirror about a new line through one of its steps, e.g. ${ex.join('; ')}`);

if (fails) { console.log(`\n${fails} FAIL`); process.exit(1); } else console.log('\nall PASS');
