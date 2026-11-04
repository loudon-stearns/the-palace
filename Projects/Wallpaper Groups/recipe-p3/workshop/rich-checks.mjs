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
console.log('— recipe-p3 as written (recipe-p3.md:9–17) —');
say(T.p3Cells === 10, 'the cells step 1 allows: 2 or 3 hits in steps 1–4', `${T.p3Cells} = C(4,2) + C(4,3)`);
identity(T.p3HasTurn4 === 10, 'every cooked loop lands on itself under +4 (on the clock, a third-turn): the Method\'s copy');
identity(T.p3SameAsCellThrice === 10, 'every cooked loop is its cell played three times, hit for hit: the turn on the clock is a slide in time');
say(T.p3Period4 === 8 && T.p3Period2 === 2, `smallest repeat: 4 steps in ${T.p3Period4}, 2 in ${T.p3Period2} (cells 1 3 and 2 4)`);
console.log('— the test: "p3 has rotation but no mirror" (recipe-p3.md:22–24) —');
say(T.p3WithMirror === 10, `cooked loops with a mirror: ${T.p3WithMirror} of 10`);
for (const c of E.p3Cells()) { const r = E.p3Loop(c); console.log(`      cell ${c.map((i) => i + 1).join(' ')} → ${ones(r)} · mirrors ${E.mirrors(r).map((m) => E.mirrorEnds(m, 12).join(' & ')).join(' · ')}`); }
nul(T.null12NoMirror[6][0] === 708, `the same meter finds no mirror on ${T.null12NoMirror[6][0]} of ${T.null12NoMirror[6][1]} six-hit 12-step loops, and ${T.null12NoMirror[3][0]} of ${T.null12NoMirror[3][1]} with three (nine: ${T.null12NoMirror[9][0]}); a reading of none was possible`);
const all4 = E.subsets(4, [1, 2, 3]).every((h) => E.mirrors(E.loopOf(h, 4)).length > 0);
identity(all4, 'why: every one, two or three hits on a 4-step loop is its own mirror, so the copies carry a mirror into the loop');
finding('every loop the Method can cook has a mirror (10 of 10): "no mirror ... It simply turns" fails on the recipe\'s own output; so does "Because p3 has no reflection to cancel the break" (:28)');
console.log('— a repair the note doesn\'t make: sectors of 8 on 24 steps —');
say(T.p3Cells24 === 84 && T.p3Loop24NoMirror === 32, `${T.p3Loop24NoMirror} of ${T.p3Cells24} cells make a loop with the third-turn (+8) and no mirror`);
const rep = E.p3Loop24([0, 1, 3]);
say(E.mirrors(rep).length === 0 && E.turns(rep).includes(8), `the piece's repair, cell 1 2 4 on 24 steps → ${ones(rep)}: turns ${E.turns(rep).join(' ')}, mirrors none`);

if (fails) { console.log(`\n${fails} FAIL`); process.exit(1); } else console.log('\nall PASS');
