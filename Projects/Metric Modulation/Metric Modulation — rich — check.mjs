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
  // the scorer, on made-up hands
  const A = MM.P1.pivot(16), lat = 0.083;
  const perfectA = MM.scoreTaps(A.beats, A.beats.map((t) => t + lat), A.changeAt), perfectB = MM.scoreTaps(g.beats, g.beats.map((t) => t + lat), g.changeAt);
  ok(perfectA.ok && perfectA.landedTap === 1 && close(perfectA.miss, 0, 1e-9) && close(perfectA.offset, lat, 1e-9), 'scorer: a perfect hand 83 ms late is back on the beat at tap 1 after A, miss 0');
  ok(perfectB.ok && perfectB.landedTap === 1 && close(perfectB.miss, 0, 1e-9), 'scorer: a perfect hand is back on tap 1 after B, miss 0');
  const stubborn = MM.scoreTaps(A.beats, MM.grid(0.5, 0, A.dur).map((t) => t + lat), A.changeAt);
  ok(stubborn.ok && stubborn.landedTap === null && stubborn.miss > 0.1, 'scorer: a hand that keeps 120 through the pivot never lands', `miss ${(stubborn.miss * 1000).toFixed(0)} ms`);
  const late = [...MM.grid(0.5, 0, 7), ...MM.grid(0.75, 7.5, A.dur)].map((t) => t + lat);
  const ls = MM.scoreTaps(A.beats, late, A.changeAt);
  ok(ls.ok && ls.landedTap === 3, 'scorer: a hand that takes two more 120 taps, then finds 80, lands on tap 3', `tap ${ls.landedTap}, ${ls.landedAfter?.toFixed(2)} s`);
  ok(!MM.scoreTaps(A.beats, [7, 8], A.changeAt).ok, 'scorer: too few taps before the change is not scored'); }

console.log('\n— there and back (The 3/4 Symmetry)');
{ const d = MM.P2.drop(), r = MM.P2.ret();
  ok(allClose(MM.iois(bells(d)), 2 / 3, 1e-6) && close(60 / (2 / 3), 90, 1e-9) && close(120 * 3 / 4, 90), 'drop: the bell every four triplet eighths, ⅔ s, is 90 = 120 × ¾');
  ok(JSON.stringify(d.shared) === JSON.stringify([0, 2, 4]), 'drop: bell and 120 kick meet every 2 s', d.shared.join(', '));
  ok(allClose(MM.iois(kicks(d).filter((t) => t >= 4)), 2 / 3, 1e-6), 'drop: after 4 s the kick is 90');
  ok(close(0.75 * (2 / 3), 0.5), 'drop: the old quarter (0.5 s) is the new dotted eighth (¾ × ⅔ s)');
  ok(allClose(MM.iois(bells(r)), 0.5) && close(90 * 4 / 3, 120), 'return: the bell every 0.5 s, a dotted eighth at 90, is 120 = 90 × 4⁄3');
  ok(JSON.stringify(r.shared) === JSON.stringify([4, 6, 8]), 'return: bell and 90 kick meet every 2 s', r.shared.join(', '));
  const len = (s) => s.beats.map((t, i) => MM.r9((s.beats[i + 1] ?? s.dur) - t));
  const dl = len(d), rl = len(r), fl = [...dl].reverse(), m = fl.filter((x, i) => close(x, rl[i], 1e-9)).length;
  ok(m === rl.length && dl.length === rl.length, 'mirror: the drop\'s beat lengths, reversed, are the return\'s', `${m} of ${rl.length}`);
  ok(close((3 / 4) * (4 / 3), 1), 'mirror: ¾ × 4⁄3 = 1');
  const mt = MM.P2.meetings(24), s120 = mt.bars120.filter((b) => b.shared).length, s90 = mt.bars90.filter((b) => b.shared).length;
  ok(s120 === mt.bars120.length, 'meetings: every 4/4 bar line at 120 is a meeting of the two grids', `${s120} of ${mt.bars120.length}`);
  ok(s90 === 3 && mt.bars90.length === 9, 'meetings: at 90 in 4/4 only every third bar line is', `${s90} of ${mt.bars90.length}`);
  for (const st of [3, 12, 24]) { const t = MM.P2.trip(st), B = t.pivots[1].t;
    ok(close((B - t.pivots[0].t) % 2, 0, 1e-9) && bells(t).some((x) => close(x, B - 0.5)), `trip, stay ${st} beats: the return leaves on a meeting, ${(B - 6).toFixed(0)} s after the drop, prepared by the bell`); }
  ok(3 % 4 !== 0, 'trip, stay 3 beats: the return leaves mid-bar (beat 4 of the first 90 bar)'); }

console.log('\n— the anchor, blind (Implementing · Step 3: Rhythm-Anchor)');
{ const a = MM.P3.anchored(), u = MM.P3.unanchored(0);
  ok(allClose(MM.iois(kicks(a)), 0.75), 'with the anchor: the kick is 0.75 s apart from the first bar to the last', `${kicks(a).length} kicks`);
  const key = (es) => es.map((e) => e.v + '@' + e.t.toFixed(6)).join(' ');
  ok(key(a.events.filter((e) => e.t >= 6)) === key(u.events.filter((e) => e.t >= 6)), 'blind: from the change on, the two versions are identical note for note');
  ok(key(a.events.filter((e) => e.t < 6 && e.v !== 'kick')) === key(u.events.filter((e) => e.t < 6 && e.v !== 'kick')), 'blind: before it, they differ only in where the kick sits');
  ok(!MM.iois(kicks(u).filter((t) => t < 6)).some((x) => close(x, 0.75)), 'without: nothing before the change is 0.75 s apart');
  const k = kicks(u), last = k.filter((t) => t < 6).pop(), first = k.find((t) => t >= 6);
  ok(close(first - last, 0.5), 'without: last 120 kick to first 80 kick is 0.5 s, where the anchored change has 0.75');
  ok(close(MM.binomTail(6, 6), 1 / 64) && close(MM.binomTail(5, 6), 7 / 64), 'blind: guessing gets 6 of 6 with chance 1⁄64, 5 or more with 7⁄64'); }

console.log(`\n${pass} pass, ${fail} fail`);
process.exitCode = fail ? 1 : 0;
