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
console.log('— recipe-p6 as written (recipe-p6.md:9–21) —');
const L = E.p6Loops();
say(E.p6Cells().length === 3 && L.length === 3, 'step 1 allows three cells (1, 2, or 1 2), so the Method can cook three loops', T.p6Loops.map((x) => x.hits.join(' ')).join(' | '));
identity(T.p6Loops.every((x) => x.period <= 2), 'each repeats every 2 steps or fewer: a sixth-turn on the clock is a slide of two');
say(T.p6Loops.map((x) => x.mirrors).join() === '6,6,12', `mirrors on the three: ${T.p6Loops.map((x) => x.mirrors).join(', ')}`);
say(T.maxMirrorsShortOfAllOrNone === 6, `no 12-step loop short of all or none has more than ${T.maxMirrorsShortOfAllOrNone} mirrors`);
finding('"no mirror settles it" (:25) and "refuses the mirror axes" (:27): every loop the Method can cook has 6 or 12 mirrors, the most a 12-step pattern can carry');
console.log('— the test: "E(5,12) approximates p6\'s rotational skeleton" (:25) —');
say(T.bell5.count === 5 && T.bell7.count === 7, 'E(5,12) has 5 strokes; the seven-stroke bell (Wallpaper Groups.md, steps 1 3 5 6 8 10 12) has 7');
identity(T.p6Loops.every((x) => x.count % 6 === 0), 'a six-fold copy makes 6 or 12 strokes, never 5 or 7');
say(T.bell5.turns === 0 && T.bell7.turns === 0, 'no slide lands either bell on itself');
say(T.bell5.mirrors.length === 1 && T.bell7.mirrors.length === 1, `each has one mirror: E(5,12) through ${T.bell5.mirrors[0]}; the seven-stroke bell through ${T.bell7.mirrors[0]}`);
const rot = (r, k) => E.slide(r, k), inv = (r) => [E.turns(r).length, E.mirrors(r).length, E.nearest(r, L)].join();
say([E.BELL5, E.BELL7].every((b) => Array.from({ length: 12 }, (_, k) => inv(rot(b, k))).every((x) => x === inv(b))), 'all three readings are the same for every rotation of either bell, so the starting step doesn\'t matter');
say(T.bell5.nearestP6 === 5 && T.bell7.nearestP6 === 5, `distance to the nearest p6 loop: ${T.bell5.nearestP6} and ${T.bell7.nearestP6}`);
nul(T.nearestNull5[1] === 12 && T.nearestNull5[3] === 180 && T.nearestNull5[5] === 600, `null, every 5-stroke pattern: distance 1 for ${T.nearestNull5[1]}, 3 for ${T.nearestNull5[3]}, 5 for ${T.nearestNull5[5]} (of 792); 7 strokes: ${JSON.stringify(T.nearestNull7)}`);
nul(T.p6BreaksNearest.join() === '1', `positive control: the section's own breaks (${T.p6Breaks}) all read distance ${T.p6BreaksNearest.join()}`);
finding(`both bells sit 5 changes from p6, as far as 600 of 792 patterns their size; each has a mirror and no turn: the bell's one symmetry is the mirror the section says p6 refuses`);
console.log('— the break as written (:31) —');
say(T.p6BreaksWithMirror === 20 && T.p6BreaksTurns === 0, `${T.p6BreaksWithMirror} of ${T.p6Breaks} breaks have a mirror (through the gap), ${T.p6BreaksTurns} keep a turn`);
const b5 = E.slide(E.BELL5, 0), nearBreak = Math.min(...E.p6Breaks().map((r) => Math.min(...Array.from({ length: 12 }, (_, k) => E.dist(r, E.slide(b5, k))))));
finding(`"the breach is local and asymmetric" (:31): every break is mirror-symmetric about its gap; a broken pulse is ${nearBreak} changes from E(5,12) at its nearest rotation`);
console.log('— the spine (recipe-p6.md:37), arithmetic —');
const orders = [1, 2, 3, 6];
say(orders[1] / orders[0] === 2 && orders[2] / orders[1] === 1.5 && orders[3] / orders[2] === 2, 'rotation orders 1 → 2 → 3 → 6: ×2, ×1.5, ×2');
const rep2 = E.period(E.repeatLoop([0, 3, 5])), rep3 = E.period(E.p3Loop([0, 1, 3])), rep6 = E.period(E.p6Loop([0]));
say(rep2 === 8 && rep3 === 4 && rep6 === 2, `cooked loops repeat every ${rep2} (p2, 16-step grid), ${rep3} (p3, 12), ${rep6} (p6, 12) steps: the repeat rate doubles each step, because the grid changes too`);
finding('"Each step doubles the rotational frequency" (:37): the order goes ×1.5 from p2 to p3; what doubles each step is how often the cooked loop repeats (16 → 8 → 4 → 2 steps), which is the loop shortening');

if (fails) { console.log(`\n${fails} FAIL`); process.exit(1); } else console.log('\nall PASS');
