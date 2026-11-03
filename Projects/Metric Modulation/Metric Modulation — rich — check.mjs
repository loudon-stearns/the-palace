// Metric Modulation — rich — check
// born: 2026-11-03 · links: [[Metric Modulation]] (connects-to · rich-face-check) · listed in [[Metric Modulation — rich.json]]
// forward_vector: I pull the mm-engine script out of each of the three Metric Modulation pieces and re-run, in Node,
//   every claim they make on the page's behalf, so a piece can't drift from the arithmetic it shows. Run:
//   node "Projects/Metric Modulation/Metric Modulation — rich — check.mjs"
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const names = ['the same hits, a new beat', 'there and back', 'the anchor, blind'];
const engines = names.map((n) => {
  const html = readFileSync(join(dir, `Metric Modulation — rich — ${n}.html`), 'utf8');
  const m = html.match(/<script id="mm-engine">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`no mm-engine in ${n}`);
  return m[1];
});
let pass = 0, fail = 0;
const ok = (cond, what, got = '') => { (cond ? pass++ : fail++); console.log(`${cond ? 'PASS' : 'FAIL'}  ${what}${got !== '' ? `  [${got}]` : ''}`); };
ok(engines.every((e) => e === engines[0]), 'the three pieces carry the same engine');
const MM = new Function(engines[0] + '\nreturn MM;')();
const close = (a, b, e = 1e-9) => Math.abs(a - b) < e;
const allClose = (xs, v, e = 1e-9) => xs.every((x) => close(x, v, e));
const kicks = (s) => MM.timesOf(s, 'kick'), bells = (s) => MM.timesOf(s, 'bell');

console.log('\n— the same hits, a new beat (What Metric Modulation Is)');
ok(allClose(MM.iois(kicks(MM.P1.pulse())), 0.5), 'step 1: the kick is a steady 120');
{ const d = MM.P1.dotted(true); ok(allClose(MM.iois(bells(d)), 0.75), 'step 2: the bell is every dotted quarter, 1.5 × 0.5 = 0.75 s');
  ok(JSON.stringify(d.shared) === JSON.stringify([0, 1.5, 3, 4.5]), 'step 2: bell and kick meet every 1.5 s (3 kicks, 2 bells)', d.shared.join(', ')); }
{ const p = MM.P1.pivot(12), b = bells(p), k = kicks(p).filter((t) => t >= 6);
  ok(allClose(MM.iois(b), 0.75) && b[0] === 0 && close(b[b.length - 1], 14.25), 'step 3: the bell never changes, 0.75 s from 0 to the end, across the pivot', `${b.length} bells`);
  ok(k.every((t) => b.some((u) => close(u, t))), 'step 3: after the pivot every kick lands on a bell');
  ok(allClose(MM.iois(k), 0.75) && close(60 / 0.75, 80), 'step 3: the new pulse is 0.75 s: 120 ÷ 1.5 = 80 BPM'); }
{ const d80 = MM.P1.door(0.75), d180 = MM.P1.door(1 / 3);
  ok(close(d80.bpm, 80) && close(d180.bpm, 180), 'step 4: figure 0.75 s → 80; figure ⅓ s (a triplet quarter) → 180', `${d80.bpm}, ${d180.bpm}`);
  for (const d of [d80, d180]) { const f = MM.grid(60 / d.bpm, 0, d.dur); ok(kicks(d).filter((t) => t >= 6).every((t) => f.some((u) => close(u, t, 1e-6))), `step 4: at ${d.bpm} every new kick continues the figure's grid`); }
  // "X → Y" read as the old X becomes the new Y: new tempo = 120 × len(Y) ⁄ len(X), lengths in quarter notes
  const L = { quarter: 1, dotted: 1.5, triplet: 2 / 3 };
  const page = [['quarter', 'dotted', 180], ['dotted', 'quarter', 80], ['quarter', 'triplet', 80], ['triplet', 'quarter', 180]];
  for (const [x, y, want] of page) ok(close(120 * L[y] / L[x], want), `step 4: the page's ${x} → ${y} = ${want}, read as "the old ${x} becomes the new ${y}"`, (120 * L[y] / L[x]).toFixed(3));
  ok(new Set(page.map((r) => r[2])).size === 2, 'step 4: the four relationships are two tempo changes');
  ok(close(120 / (2 / 3), 180), 'step 4: the page\'s gloss — the triplet (⅔ beat) becoming the new pulse — gives 120 ÷ ⅔ = 180, not 80');
  ok(close(60 / ((0.5) / (2 / 3)), 80), 'step 4: "quarter = triplet quarter" gives 80 when the old quarter (0.5 s) is the new triplet quarter: new beat 0.75 s'); }
{ const g = MM.P1.glide(), rb = MM.rampBeats(120, 80, 16, 6), span = g.rampEnd - 6;
  ok(close(span, 24 * Math.log(1.5), 1e-6), 'step 5: the glide ramps over 16 beats in 24·ln 1.5 s', span.toFixed(3) + ' s');
  const i = MM.iois(rb); ok(i[0] > 0.5 && i[0] < 0.51 && i[15] > 0.73 && i[15] < 0.75, 'step 5: the glide\'s beats stretch from just over 0.5 s to just under 0.75 s', `${i[0].toFixed(4)} … ${i[15].toFixed(4)}`);
  const anchor = MM.grid(0.75, 6, g.rampEnd), worst = Math.max(...anchor.map((t) => Math.min(...rb.map((u) => Math.abs(u - t)))));
  ok(worst > 0.1, 'step 5: during the ramp a dotted-quarter anchor (0.75 s) drifts off the ramping beat', `worst ${(worst * 1000).toFixed(0)} ms, ${anchor.length} anchor hits`);
  ok(g.beats.length === 12 + 16 + 8, 'step 5: the glide is kept as an unscored listen', `${g.beats.length} beats`); }
{ const A = MM.P1.pivot(16), Q = MM.P1.pivot(16, true), lat = 0.083;
  const key = (es) => es.map((e) => e.v + '@' + e.t.toFixed(6)).join(' ');
  ok(key(A.events.filter((e) => e.t >= 6)) === key(Q.events.filter((e) => e.t >= 6)), 'step 5: A and A′ are identical from the change on');
  ok(key(A.events.filter((e) => e.t < 6 && e.v !== 'bell')) === key(Q.events.filter((e) => e.t < 6 && e.v !== 'bell')) && !Q.events.some((e) => e.t < 6 && e.v === 'bell') && A.events.filter((e) => e.t < 6 && e.v === 'bell').length === 8,
    'step 5: before it they differ only in the bell: 8 hits in A, none in A′');
  ok(JSON.stringify(A.beats) === JSON.stringify(Q.beats) && A.changeAt === Q.changeAt, 'step 5: both are scored against the same beats from the same moment');
  // the same hand scores the same on both, so the metric can't favour either; only the reader's hand can differ
  const hands = [A.beats.map((t) => t + lat), MM.grid(0.5, 0, A.dur).map((t) => t + lat), [...MM.grid(0.5, 0, 7), ...MM.grid(0.75, 7.5, A.dur)].map((t) => t + lat)];
  ok(hands.every((h) => JSON.stringify(MM.scoreTaps(A.beats, h, 6)) === JSON.stringify(MM.scoreTaps(Q.beats, h, 6))), 'step 5: any given hand scores the same on A and A′ (3 model hands)');
  const perfect = MM.scoreTaps(A.beats, hands[0], 6), stubborn = MM.scoreTaps(A.beats, hands[1], 6), late = MM.scoreTaps(A.beats, hands[2], 6);
  ok(perfect.landedTap === 1 && close(perfect.miss, 0) && close(perfect.offset, lat), 'scorer: a hand 83 ms late on every beat is calibrated out and lands at tap 1');
  ok(stubborn.ok && stubborn.landedTap === null, 'scorer: a hand that keeps 120 through the change never lands', `miss ${(stubborn.miss * 1000).toFixed(0)} ms`);
  ok(late.ok && late.landedTap === 3, 'scorer: a hand that takes two more 120 taps, then finds 80, lands on tap 3', `tap ${late.landedTap}`);
  ok(!MM.scoreTaps(A.beats, [7, 8], 6).ok, 'scorer: too few taps before the change is not scored'); }

console.log('\n— there and back (The 3/4 Symmetry)');
const Q90 = () => 2 / 3;
{ const d = MM.P2.drop(), r = MM.P2.ret();
  ok(allClose(MM.iois(bells(d)), 2 / 3, 1e-6) && close(60 / (2 / 3), 90, 1e-9) && close(120 * 3 / 4, 90), 'drop: the bell every four triplet eighths, ⅔ s, is 90 = 120 × ¾');
  ok(JSON.stringify(d.shared) === JSON.stringify([0, 2, 4]), 'drop: bell and 120 kick meet every 2 s', d.shared.join(', '));
  ok(allClose(MM.iois(kicks(d).filter((t) => t >= 4)), 2 / 3, 1e-6), 'drop: after 4 s the kick is 90');
  ok(close(0.75 * (2 / 3), 0.5), 'drop: the old quarter (0.5 s) is the new dotted eighth (¾ × ⅔ s)');
  ok(allClose(MM.iois(bells(r)), 0.5) && close(90 * 4 / 3, 120), 'return: the bell every 0.5 s, a dotted eighth at 90, is 120 = 90 × 4⁄3');
  ok(JSON.stringify(r.shared) === JSON.stringify([4, 6, 8]), 'return: bell and 90 kick meet every 2 s', r.shared.join(', '));
  const len = (s) => s.beats.map((t, i) => MM.r9((s.beats[i + 1] ?? s.dur) - t));
  const dl = len(d), rl = len(r);
  ok(JSON.stringify([...dl].reverse()) === JSON.stringify(rl), 'mirror (a picture, by construction): 8 × ½ s then 12 × ⅔ s, reversed, is the return');
  const mt = MM.P2.meetings(24), s120 = mt.bars120.filter((b) => b.shared).length, s90 = mt.bars90.filter((b) => b.shared).length;
  ok(s120 === 12 && mt.bars120.length === 12 && s90 === 3 && mt.bars90.length === 9, 'meetings, counted from one start: 12 of 12 bar lines at 120, 3 of 9 at 90 in 4/4', `${s120}/${mt.bars120.length}, ${s90}/${mt.bars90.length}`);
  ok(MM.grid(3 * Q90(), 0, 24).every((t) => MM.grid(2, 0, 24.1).some((u) => close(u, t, 1e-6))), 'meetings: in 3/4 at 90 every bar line (2 s) is one');
  for (const st of [4, 12, 24]) { const t = MM.P2.trip(st), B = t.pivots[1].t, bl = bells(t).filter((x) => x > 6);
    ok(bl.length === 4 && close(bl[0], B - 2) && allClose(MM.iois(bl), 0.5) && close(((bl[0] - 6) / (2 / 3)) % 1 < 0.5 ? ((bl[0] - 6) / (2 / 3)) % 1 : 1 - ((bl[0] - 6) / (2 / 3)) % 1, 0, 1e-6),
      `trip, stay ${st} beats: the return is prepared alike, four bells in the last 2 s, the first on a 90 beat, after the drop`, `${(B - 6).toFixed(2)} s at 90`); }
  ok(MM.P2.trip(4).pivots[1].t - 6 > 2, 'trip: the shortest stay\'s return bell starts after the drop, not at it'); }

console.log('\n— the anchor, blind (Implementing · Step 3: Rhythm-Anchor)');
{ const a = MM.P3.anchored(), on = MM.P3.misaligned(0), off = MM.P3.misaligned(0.25);
  const key = (es) => es.map((e) => e.v + '@' + e.t.toFixed(6)).join(' ');
  ok(allClose(MM.iois(kicks(a)), 0.75), 'with the anchor: the kick is 0.75 s apart from the first bar to the last', `${kicks(a).length} kicks`);
  ok(key(on.events) === key(a.events), 'blind: the aligned version is step 2 note for note');
  ok(key(on.events.filter((e) => e.t < 6)) === key(off.events.filter((e) => e.t < 6)), 'blind: before the change the two versions are identical note for note');
  const ko = kicks(off), last = ko.filter((t) => t < 6.25 - 1e-9).pop(), first = ko.find((t) => t >= 6.25 - 1e-9);
  ok(close(last, 6) && close(first, 6.25) && allClose(MM.iois(ko.filter((t) => t >= 6.25)), 0.75), 'late: the anchor sounds at 6.00 s, the 80 groove lands 0.25 s after it and runs 0.75 s on, an eighth off the anchor\'s grid');
  ok(close(MM.binomTail(6, 6), 1 / 64) && close(MM.binomTail(5, 6), 7 / 64), 'blind: guessing gets 6 of 6 with chance 1⁄64, 5 or more with 7⁄64'); }

console.log(`\n${pass} pass, ${fail} fail`);
process.exitCode = fail ? 1 : 0;
