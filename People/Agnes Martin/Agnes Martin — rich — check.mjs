#!/usr/bin/env node
// Agnes Martin — rich — check.mjs
// born: 2026-11-04 · links: [[Agnes Martin]] (connects-to · rich-face-check) · listed in [[Agnes Martin — rich.json]]
// forward_vector: I hold "the grid holds still" to what it says about its own stimulus, on its own engine
// block, run in Node. The two halves of its blind test must differ only in the grid: the same drift line
// for line, the same ink and darkest pixel per column, straight lines read back straight, drifting lines
// read back at the amplitude asked. I also print the chance a guesser gets a verdict for the page, and
// what the verdict rule does with two model readers (one the grid helps, one it does not), so the rule
// is shown able to fail. I cannot see; the human threshold is not mine to check.
//
//   node "People/Agnes Martin/Agnes Martin — rich — check.mjs"     exit 1 on a failure

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(HERE, 'Agnes Martin — rich — the grid holds still.html'), 'utf8');
const src = html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const ctx = {}; vm.createContext(ctx); vm.runInContext(src + '\nthis.AM = AM;', ctx);
const AM = ctx.AM;
const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const f = (x, d = 4) => x.toFixed(d);

console.log('the grid holds still · engine, headless');

// 1. Matched: the drift of line i does not depend on the grid.
{
  let worst = 0;
  for (let s = 1; s <= 40; s++) {
    const a = AM.field(s, 1, 1, 0.3), b = AM.field(s, 0, 1, 0.3);
    for (let i = 0; i < AM.N; i++) for (let x = 0; x <= AM.L; x++) worst = Math.max(worst, Math.abs(a.lines[i].dev[x] - b.lines[i].dev[x]));
  }
  ok(worst === 0, `same seed, grid and no grid: drift arrays identical, largest difference ${worst} px (40 seeds × 10 lines)`);
}

// 2. Read back off the pixels, in both halves, at dpr 1 and 2 and 1.25 (a zoomed screen).
for (const dpr of [1, 1.25, 2]) {
  let worstA = 0, nullMax = 0, armDiff = 0, inkSdMax = 0, inkS = [], inkD = [], pkS = [], pkD = [], minCols = 1e9;
  for (let s = 100; s < 120; s++) {
    const sub = ((s * 37) % 100) / 100;
    for (const a of [0, ...AM.LEVELS]) {
      const m = {};
      for (const reg of [1, 0]) {
        const fl = AM.field(s, reg, a, sub), img = AM.render(fl, dpr), mm = AM.measure(fl, img, dpr);
        m[reg] = mm;
        mm.forEach((r) => {
          minCols = Math.min(minCols, r.cols); inkSdMax = Math.max(inkSdMax, r.inkSd / r.ink);
          if (a > 0) { worstA = Math.max(worstA, Math.abs(r.rms - a) / a); inkD.push(r.ink); pkD.push(r.peak); } else { nullMax = Math.max(nullMax, r.rms); inkS.push(r.ink); pkS.push(r.peak); }
        });
      }
      for (let i = 0; i < AM.N; i++) armDiff = Math.max(armDiff, Math.abs(m[1][i].rms - m[0][i].rms));
    }
  }
  const mean = (v) => v.reduce((p, x) => p + x, 0) / v.length;
  console.log(`  dpr ${dpr}: band ${AM.band(dpr)} device px; columns read per line, fewest ${minCols}`);
  ok(worstA < 0.03, `dpr ${dpr}: drifting lines read back within 3% of the amplitude asked (worst ${f(100 * worstA, 2)}%)`);
  ok(nullMax < 0.005, `dpr ${dpr}: straight lines read back straight (largest ${f(nullMax, 5)} px rms; a renderer that snapped to pixels would fail here)`);
  ok(armDiff < 0.02, `dpr ${dpr}: each line's drawn drift, grid vs no grid, differs by at most ${f(armDiff, 5)} px`);
  ok(inkSdMax < 1e-4, `dpr ${dpr}: ink per column constant along every line (largest relative spread ${inkSdMax.toExponential(2)})`);
  ok(Math.abs(mean(inkS) - mean(inkD)) / mean(inkS) < 1e-4, `dpr ${dpr}: ink per column, straight ${f(mean(inkS))} vs drifting ${f(mean(inkD))}`);
  ok(Math.abs(mean(pkS) - mean(pkD)) < 0.002 && Math.abs(mean(pkS) - AM.ALPHA) < 0.002, `dpr ${dpr}: darkest pixel per column, straight ${f(mean(pkS))} vs drifting ${f(mean(pkD))} (ink ${AM.ALPHA})`);
}

// 3. What the canvas shows: the 8-bit pixels, as the piece paints them. Total ink per field and
// per line, straight vs drifting at the smallest amplitude, same seeds, same sub-pixel offsets.
// Rounding to 8 bits treats a straight line (one rounding, repeated) and a drifting one (rounding
// that varies) a little differently; how big is that, against the 1-2% contrast step the eye needs?
{
  const q8 = (img) => { let s = 0; for (const v of img.ink) s += Math.round(255 * v); return s; };
  let worst = 0, worstLine = 0;
  for (const dpr of [1, 2]) for (let s = 0; s < 60; s++) {
    const sub = (s % 30) / 30, reg = s % 2;
    const fs = AM.field(5000 + s, reg, 0, sub), fd = AM.field(5000 + s, reg, AM.LEVELS[0], sub);
    const is = AM.render(fs, dpr), id = AM.render(fd, dpr);
    worst = Math.max(worst, Math.abs(q8(is) - q8(id)) / q8(is));
    // one line alone, no rules, so the line's own ink is all that is counted
    const one = (fl) => ({ lines: [fl.lines[0]], rules: { xs: [], alpha: 0 } });
    const ls = q8(AM.render(one(fs), dpr)), ld = q8(AM.render(one(fd), dpr));
    worstLine = Math.max(worstLine, Math.abs(ls - ld) / ls);
  }
  ok(worst < 0.005, `8-bit pixels: total ink per field, straight vs 0.25 px drift, differs by at most ${f(100 * worst, 3)}% (pass under 0.5%)`);
  ok(worstLine < 0.005, `8-bit pixels: one line's ink, straight vs 0.25 px drift, differs by at most ${f(100 * worstLine, 3)}% (pass under 0.5%)`);
}

// 4. Chance and the verdict rule, through the piece's own score().
{
  const n = AM.PER * AM.LEVELS.length;
  const gate = AM.tail(n, AM.GATE), pg = AM.guessHolds();
  console.log(`  a guesser: one amplitude "seen" ${f(100 * AM.Q, 2)}% (9/256); a half at ${AM.GATE}+ of ${n} ${f(100 * gate, 2)}%; a verdict for the page ${f(100 * pg, 2)}% (exact)`);
  const r = AM.rng(42);
  const sim = (pc) => {
    const trials = [];
    for (const arm of ['grid', 'open']) for (let k = 0; k < AM.LEVELS.length; k++) for (let j = 0; j < AM.PER; j++) { const present = r() < 0.5; const right = r() < pc(arm, AM.LEVELS[k]); trials.push({ arm, level: k, present, said: right ? present : !present }); }
    return AM.score(trials).verdict;
  };
  const M = 100000; let holds = 0;
  for (let i = 0; i < M; i++) { const v = sim(() => 0.5); if (v === 'holds' || v === 'holds-strong') holds++; }
  ok(Math.abs(holds / M - pg) < 0.003, `guessers through score(): ${f(100 * holds / M, 2)}% verdict for the page (exact ${f(100 * pg, 2)}%)`);
  // Model readers: Weibull, slope 3, lapse 2%; alpha in px rms.
  const weib = (al) => (a) => 0.5 + 0.5 * 0.98 * (1 - Math.exp(-Math.pow(a / al, 3)));
  const K = 20000;
  const tally = (pcG, pcO) => { const c = {}; for (let i = 0; i < K; i++) { const v = sim((arm, a) => (arm === 'grid' ? pcG : pcO)(a)); c[v] = (c[v] || 0) + 1; } return c; };
  const holdsOf = (c) => ((c.holds || 0) + (c['holds-strong'] || 0)) / K;
  const show = (c) => Object.entries(c).sort((p, q) => q[1] - p[1]).map(([k, v]) => k + ' ' + f(100 * v / K, 1) + '%').join(' · ');
  let nullMax = 0;
  for (const al of [0.25, 0.5, 0.7, 1.0, 1.5]) { const c = tally(weib(al), weib(al)); nullMax = Math.max(nullMax, holdsOf(c)); console.log(`  no help, alpha ${al} px both halves: ${show(c)}`); }
  ok(nullMax < 0.08, `a reader the grid does not help gets "holds" at most ${f(100 * nullMax, 1)}% of the time (pass under 8%)`);
  const one = tally(weib(0.35), weib(0.7)), two = tally(weib(0.25), weib(1.0)), two2 = tally(weib(0.5), weib(2.0));
  console.log(`  one doubling (0.35 vs 0.7 px): ${show(one)}`);
  console.log(`  two doublings (0.25 vs 1.0 px): ${show(two)}`);
  console.log(`  two doublings (0.5 vs 2.0 px): ${show(two2)}`);
  ok(holdsOf(two) > 0.6 && holdsOf(two2) > 0.6, `a reader the grid helps by two doublings gets "holds" ${f(100 * holdsOf(two), 1)}% and ${f(100 * holdsOf(two2), 1)}% (pass over 60%)`);
}

console.log(fails.length ? `\n${fails.length} FAILED` : '\nall checks pass');
process.exit(fails.length ? 1 : 0);
