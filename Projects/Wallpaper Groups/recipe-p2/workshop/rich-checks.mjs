// rich-checks.mjs — re-checks the claims recipe-p2's rich-face pieces make, on the pieces' own
// engine (the code between ENGINE-START and ENGINE-END, byte for byte the same in both), headless.
//
//   node "Projects/Wallpaper Groups/recipe-p2/workshop/rich-checks.mjs"
//
// Each check prints what it measured and PASS or FAIL against what the piece says. Exit 1 on any
// FAIL. A FINDING line is a measured disagreement with the recipe's text, carried to the manifest's
// offers. A NULL line is a check that the meter can read the other answer, so the test could fail.

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const bundle = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = (piece) => readFileSync(join(bundle, `recipe-p2 — rich — ${piece}.html`), 'utf8');
const block = (piece) => { const m = html(piece).match(/\/\*ENGINE-START\*\/([\s\S]*?)\/\*ENGINE-END\*\//); if (!m) throw new Error(`no engine in ${piece}`); return m[1]; };
let fails = 0;
const say = (ok, what, detail) => { if (!ok) fails++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${what}${detail ? `\n      ${detail}` : ''}`); };
const finding = (what) => console.log(`FINDING  ${what}`);
const nul = (ok, what) => { if (!ok) fails++; console.log(`${ok ? 'NULL ok' : 'NULL FAIL'}  ${what}`); };

say(block('the recipe cooked') === block('the break and the clave'), 'the two pieces carry the same engine, byte for byte');
const E = new Function(`${block('the recipe cooked')}\nreturn { N, loopOf, hitsOf, same, sameAll, shift, reflect, recipeRule, fill, period, mirrors, glides, axisName, split, splitByHalf, nearestMirror, hasCentre89, recipeHalves, tally, SON, RUMBA, SON23, SON23_BROKEN, TRESILLO, breaks, oneBreakReaches };`)();
const ones = (r) => E.hitsOf(r).map((i) => i + 1).join(' ');

// ── the recipe's own words, built first ──
console.log('— the recipe as written (recipe-p2.md:15-17) —');
say(E.recipeRule(1) === 9 && E.recipeRule(3) === 11, 'the rule on the page\'s examples: 1 → 9, 3 → 11', `1 → ${E.recipeRule(1)}, 3 → ${E.recipeRule(3)}`);
finding(`the rule as written on 1..16 sends step 8 to (8 + 8) mod 16 = ${E.recipeRule(8)}, a step the grid doesn't have; for n in 1–8, "n + 8" is the rule the examples use`);
const H = E.recipeHalves();
say(H.length === 126, 'the halves step 1 allows: 3 or 4 hits in steps 1-8', `${H.length} = C(8,3) + C(8,4) = 56 + 70`);
const t = E.tally();
console.log('      tally', JSON.stringify(t));
// independent of the engine's fill: build "the half played twice" by hand and the rule by hand
let byHand = 0;
for (const h of H) { const rule = E.loopOf([...h, ...h.map((i) => E.recipeRule(i + 1) - 1)]); const twice = E.loopOf([...h, ...h.map((i) => i + 8)]); const engine = E.fill([E.loopOf(h)], 'recipe')[0]; if (E.same(rule, twice) && E.same(engine, rule)) byHand++; }
say(byHand === 126 && t.recipeIsTwice === 126, 'IDENTITY, not a test: n + 8 is the half played twice by definition (S ∪ S + 8); the engine agrees', `${byHand} of 126 by hand, ${t.recipeIsTwice} on the engine (step 8 read as 16)`);
say(t.recipePeriod8 === 126, 'its smallest repeat is 8 steps or fewer on every half', `${t.recipePeriod8} of 126`);
nul(t.pmPeriod16 === 120, `the same period meter reads 16 on pm's loop (17 − n) in ${t.pmPeriod16} of 126; a reading of 16 on the recipe would have meant a rotation`);
finding(`the recipe's p2 is a slide by half the loop: 126 of 126 halves give a period-8 loop, the half played twice (p1 with a cell of 8)`);
say(t.recipeIsPm === 6, 'the recipe and pm make the same loop only on halves that are their own reversal', `${t.recipeIsPm} of 126 (two of the four pairs 1|8, 2|7, 3|6, 4|5: C(4,2) = 6)`);
finding(`the recipe promises "no mirror axis"; ${t.recipeHasMirror} of its 126 loops have a mirror in time anyway (the cooked tresillo has two, through 4|12 and 8|16)`);

console.log('— two pictures of 180° —');
let clock = true, strip = true;
for (const h of H) for (const i of h) {
  const a = -Math.PI / 2 + 2 * Math.PI * i / 16, b = a + Math.PI; const back = ((Math.round((b + Math.PI / 2) / (2 * Math.PI) * 16) % 16) + 16) % 16; if (back !== i + 8) clock = false;
  const cx = 7.5, x = i, xr = cx - (x - cx); if (Math.abs(xr - (15 - i)) > 1e-12) strip = false;
}
say(clock, 'turning the clock 180° sends every hit to n + 8: the recipe\'s rule is a half-turn of the clock face');
say(strip, 'turning the strip 180° about the point between 8 and 9 sends every hit to 17 − n: pm\'s mirror');
say(t.turnIsPm1 === 126, 'IDENTITY: on one line a half-turn about 8|9 is pm\'s map', `${t.turnIsPm1} of 126`);
// the note's own claims, on its one voice (the piece's last step)
console.log('— the test: the note\'s own claims, one voice —');
let c89 = 0, c89hand = 0; for (const h of H) { const r = E.fill([E.loopOf(h)], 'recipe'); if (E.hasCentre89(r)) c89++; const s = new Set(h); if (h.every((i) => s.has(7 - i))) c89hand++; }
say(t.recipeCentre89 === 6 && c89 === 6 && c89hand === 6, 'the Ingredients\' centre between 8 and 9 holds in 6 of 126 cooked loops: the halves that are their own reversal inside the eight', `engine ${t.recipeCentre89}, by hand ${c89hand}`);
finding(`the Ingredients' centre (:11) holds in ${t.recipeCentre89} of 126 cooked loops and fails in ${126 - t.recipeCentre89}`);
say(t.recipeHasMirror === 62, '"no mirror axis" (:3) fails in 62 of 126 cooked loops', `${t.recipeHasMirror}`);
let centreMirror = true; for (const h of H) { const r = E.fill([E.loopOf(h)], 'recipe'); if (E.hasCentre89(r) && !E.mirrors(r).length) centreMirror = false; }
say(centreMirror, 'IDENTITY: on one voice, a loop with the 8|9 centre always has a mirror axis');

console.log('— the proposed repair: a second voice (not in the note) —');
say(t.two === 1568, 'every voicing of every half (each hit low or high)', `${t.two} = Σ 2^k over the 126 halves`);
say(t.turnIsPm2 === 0, 'IDENTITY (the proposed repair): with two voices the half-turn swaps voices and pm does not', `${t.two - t.turnIsPm2} of ${t.two} differ`);
let glideSwap = 0; for (const h of H) { const G2 = E.fill([E.loopOf(h), E.loopOf([])], 'glide'); if (E.hitsOf(G2[1]).every((i) => i >= 8) && E.hitsOf(G2[1]).length === h.length) glideSwap++; }
say(glideSwap === 126, 'the glide map answers in the other voice, not reversed', `${glideSwap} of 126`);
say(t.turn2IsP2 === 1540, 'with two voices the half-turn makes the strip\'s p2 (a half-turn, no mirror, no glide) in most voicings', `${t.turn2IsP2} of ${t.two}; repeat of 16 in ${t.turn2Period16}`);
// a half-turn must land the two-voice loop on itself
let landed = 0;
for (const h of H) for (let m = 0; m < (1 << h.length); m++) {
  const lo = E.loopOf(h.filter((_, k) => !((m >> k) & 1))), hi = E.loopOf(h.filter((_, k) => (m >> k) & 1)), T = E.fill([lo, hi], 'half-turn');
  const turned = [E.reflect(T[1], 15), E.reflect(T[0], 15)]; if (E.sameAll(turned, T)) landed++;
}
say(landed === 1568, 'IDENTITY: every two-voice half-turn loop lands on itself turned (reverse about 8|9 and swap)', `${landed} of 1568`);

// ── the break and the clave ──
console.log('— the break and the clave (recipe-p2.md:24, :28) —');
const cooked = E.fill([E.loopOf(E.TRESILLO)], 'recipe')[0];
say(ones(cooked) === '1 4 7 9 12 15' && E.period([cooked]) === 8 && E.splitByHalf(cooked) === 0, 'the tresillo cooked: 1 4 7 9 12 15, repeat 8, every hit partnered', ones(cooked));
const B = E.breaks(cooked);
say(B.length === 6 && B.every((b) => E.splitByHalf(b.r) === 2 && E.period([b.r]) === 16), 'each of the six breaks splits two pairs and the repeat becomes 16', B.map((b) => `${b.from + 1}→${b.to + 1}`).join(' '));
say(ones(E.SON) === '1 4 7 11 13' && ones(E.RUMBA) === '1 4 8 11 13', 'the claves as the piece plays them', `son ${ones(E.SON)} · rumba ${ones(E.RUMBA)}`);
const sr = E.oneBreakReaches(E.SON), rr = E.oneBreakReaches(E.RUMBA);
say(sr.hits === 0 && rr.hits === 0, 'one break of any cooked loop never reaches a clave, from any starting step', `son ${sr.hits} of ${sr.tries} · rumba ${rr.hits} of ${rr.tries}`);
const ps = E.oneBreakReaches(E.SON, 'pm'), pr2 = E.oneBreakReaches(E.RUMBA, 'pm');
say(ps.hits === 0 && pr2.hits === 0 && ps.tries === 7840, 'recipe-pm\'s loops, broken once, never reach a clave either (its 8|9 centre pairs every hit)', `son ${ps.hits} of ${ps.tries} · rumba ${pr2.hits} of ${pr2.tries}`);
const sb = E.nearestMirror(E.SON, true), rb = E.nearestMirror(E.RUMBA, true);
say(sb.k === 3 && rb.k === 1, 'nearest mirror with its centre between steps: son clave 3 pairs, rumba 1', `son ${sb.k} (${E.axisName(sb.c)}) · rumba ${rb.k} (${E.axisName(rb.c)})`);
say(ones(E.SON23) === '3 5 9 12 15' && ones(E.SON23_BROKEN) === '3 5 9 12 16' && E.same(E.SON23_BROKEN, E.shift(E.RUMBA, 8)), 'the section\'s break is exact from the son clave counted 2-3: 15 → 16 is the rumba clave', `${ones(E.SON23)} → ${ones(E.SON23_BROKEN)}`);
// the parity reason, checked rather than assumed
const even = H.every((h) => E.hitsOf(E.fill([E.loopOf(h)], 'recipe')[0]).length % 2 === 0);
say(even, 'every cooked loop has an even number of hits (so a five-hit clave is out of reach of any one-hit move)');
// the reach test itself can say yes: a cooked loop broken once is reached by its own break
const probe = B[0].r; const pr = E.oneBreakReaches(probe);
nul(pr.hits > 0, `the reach test finds a loop that is one break away: ${pr.hits} hits for broken ${ones(probe)}`);
say(E.splitByHalf(E.SON) === 5 && E.splitByHalf(E.RUMBA) === 5, 'by the recipe\'s count both claves split 5 pairs: all five hits unpartnered');
const ms = E.nearestMirror(E.SON), mr = E.nearestMirror(E.RUMBA);
say(ms.k === 0 && E.axisName(ms.c) === 'through steps 4 and 12', 'by the mirror\'s count the son clave splits none: reversed through 4 and 12 it lands on itself', E.axisName(ms.c));
say(E.mirrors([cooked]).map(E.axisName).includes('through steps 4 and 12'), 'the cooked tresillo already had that mirror');
say(mr.k === 1, 'the rumba clave misses a mirror by one pair', `${mr.k}, nearest ${E.axisName(mr.c)}`);
const diff = E.SON.map((v, i) => (v !== E.RUMBA[i] ? i + 1 : 0)).filter(Boolean);
say(diff.join(' ') === '7 8', 'the rumba clave is the son clave with one hit moved one step, 7 → 8', diff.join(' '));
nul(B.filter((b) => E.nearestMirror(b.r).k > 0).length === 4, `the mirror's arm can miss: ${B.filter((b) => E.nearestMirror(b.r).k > 0).length} of the 6 breaks split a pair`);
finding('"This is exactly where the clave lives": no break of this recipe (0 of 8960) or of recipe-pm (0 of 7840) reaches the son or rumba clave; both centres sit between steps, so parity forbids it. The son clave turns about one of its own steps (4|12; on one voice mirror = half-turn), and the section\'s break is exact from it counted 2-3 (15 → 16 is the rumba clave)');

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
