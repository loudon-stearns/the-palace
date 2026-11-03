#!/usr/bin/env node
// Re-runs the claims the rich face's pieces make, on the pieces' own engines (the code between
// ENGINE-START and ENGINE-END in each piece), against BLUELINE's bench code where it can.
//   node "Move the Ink, Don't Redraw It/workshop/rich-checks.mjs"      (from the palace root)
// Needs python3 with numpy, scipy and Pillow for the fixtures (fixtures.py beside this file).
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const BUNDLE = dirname(HERE);
const ENTRY = "Move the Ink, Don't Redraw It";
let fails = 0;
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails++; };
function engine(piece, names) {
  const src = readFileSync(join(BUNDLE, `${ENTRY} — rich — ${piece}.html`), 'utf8');
  const m = src.match(/\/\*ENGINE-START\*\/([\s\S]*?)\/\*ENGINE-END\*\//);
  if (!m) throw new Error('no engine in ' + piece);
  return new Function(m[1] + `\nreturn { ${names.join(', ')} };`)();
}

const fx = JSON.parse(execFileSync('python3', ['-I', join(HERE, 'fixtures.py')], { cwd: dirname(BUNDLE), maxBuffer: 1 << 28 }).toString());

// ── move it or redraw it ─────────────────────────────────────────────────────────────────
console.log('move it or redraw it');
{
  const E = engine('move it or redraw it', ['fieldPoint', 'confineRow', 'makeLoop', 'warp', 'nudge', 'change', 'ANCHOR_BOT']);
  // 1. the field is the bench's: fields.smoke(seed 3) × mask × anchor
  let worst = 0, worstC = 0;
  for (const [X, Y, t, pdx, pdy, pc] of fx.field) {
    const [jdx, jdy] = E.fieldPoint(X, Y, t);
    worst = Math.max(worst, Math.abs(jdx - pdx), Math.abs(jdy - pdy));
    worstC = Math.max(worstC, Math.abs(E.confineRow(Y) - pc));
  }
  ok(worst < 1e-3, `field matches fields.py smoke(seed 3) at 1200 samples: worst |Δ| ${worst.toExponential(2)} px`);
  ok(worstC < 2e-3, `mask × anchor matches warp.py's (feathered auto:top:0.7, base anchor): worst |Δ| ${worstC.toExponential(2)}; anchor row ${E.ANCHOR_BOT}`);
  // 2. the warp is warp.py's warp_image
  const wf = fx.warp; const o = E.warp(Float32Array.from(wf.img), wf.w, wf.h, Float32Array.from(wf.dx), Float32Array.from(wf.dy), new Float32Array(wf.w * wf.h));
  let ww = 0; for (let i = 0; i < o.length; i++) ww = Math.max(ww, Math.abs(o[i] - wf.out[i]));
  ok(ww < 1e-5, `warp matches scipy map_coordinates(order 1, reflect): worst |Δ| ${ww.toExponential(2)}`);
  // the plate, as the piece decodes it
  const P = fx.plate, plate = Float32Array.from(P.g), L = E.makeLoop(P.w, P.h);
  const dx = new Float32Array(L.n), dy = new Float32Array(L.n);
  const frame = (t, amp = 1, cyc = 1, wob = 0, seed = 0) => { L.field(t, amp, cyc, dx, dy); if (wob) E.nudge(L.w, L.h, wob, seed, dx, dy); return E.warp(plate, L.w, L.h, dx, dy, new Float32Array(L.n)); };
  // the fast grid field agrees with the pointwise one
  L.field(0.3, 1, 1, dx, dy); let gw = 0;
  for (const [x, y] of [[10, 10], [150, 90], [299, 200], [40, 300], [200, 437]]) { const [a, b] = E.fieldPoint(x / L.s, y / L.s, 0.3); const g = E.confineRow(y / L.s) * L.s; gw = Math.max(gw, Math.abs(a * g - dx[y * L.w + x]), Math.abs(b * g - dy[y * L.w + x])); }
  ok(gw < 1e-6, `the piece's fast field equals its pointwise field: worst ${gw.toExponential(2)} px`);
  // 3. the loop closes: frame 60 ≡ frame 0 with whole turns, not with a turn and a half
  const seam1 = E.change(frame(1), frame(0)), seam15 = E.change(frame(1, 1, 1.5), frame(0, 1, 1.5));
  ok(seam1 < 1e-9, `seam, whole turns: ${seam1.toExponential(2)} / 255`);
  ok(seam15 > 0.3, `seam, a turn and a half: ${seam15.toFixed(3)} / 255`);
  // 4. where nothing moves, the moved loop never changes; the redrawn one does
  let stillPct = 0; for (const v of L.still) stillPct += v; stillPct = stillPct / L.n * 100;
  const fr = []; for (let i = 0; i < 60; i++) fr.push(frame(i / 60));
  let stillMax = 0, moveSum = 0, wholeSum = 0;
  for (let i = 1; i < 60; i++) { stillMax = Math.max(stillMax, E.change(fr[i], fr[i - 1], L.still)); moveSum += E.change(fr[i], fr[i - 1], L.moves); wholeSum += E.change(fr[i], fr[i - 1]); }
  ok(stillMax === 0, `moved loop, change where nothing moves (${stillPct.toFixed(1)}% of the frame): ${stillMax} at every frame`);
  console.log(`         moved loop, every frame: where it moves ${(moveSum / 59).toFixed(3)}, whole frame ${(wholeSum / 59).toFixed(3)} / 255`);
  const rd = []; for (let i = 0; i < 60; i++) rd.push(frame(i / 60, 1, 1, 0.5, 9001 + i));
  let rStill = 0, rMove = 0; for (let i = 1; i < 60; i++) { rStill += E.change(rd[i], rd[i - 1], L.still); rMove += E.change(rd[i], rd[i - 1], L.moves); }
  ok(rStill / 59 > 0.5, `redrawn twin (nudge 0.5 px), change where nothing moves: ${(rStill / 59).toFixed(3)} / 255`);
  console.log(`         redrawn twin, where it moves ${(rMove / 59).toFixed(3)} / 255`);
  const z = frame(0.4, 1, 1, 0, 1), z2 = frame(0.4);
  ok(E.change(z, z2) === 0, 'at zero nudge the redrawn twin is the moved loop, mark for mark');
  // 5. read k apart: motion grows with the gap, boil does not
  const at = (arr, k, region) => { let s = 0; for (let i = k; i < 60; i++) s += E.change(arr[i], arr[i - k], region); return s / (60 - k); };
  const mk = [1, 4, 15].map((k) => at(fr, k, L.moves)), bk = [1, 4, 15].map((k) => at(rd, k, L.still));
  ok(mk[0] < mk[1] && mk[1] < mk[2], `moved, where it moves, read 1 · 4 · 15 apart: ${mk.map((v) => v.toFixed(3)).join(' · ')}`);
  ok(Math.max(...bk) / Math.min(...bk) < 1.25, `redrawn, where nothing moves, read 1 · 4 · 15 apart: ${bk.map((v) => v.toFixed(3)).join(' · ')}`);
}

// ── where the warp folds ─────────────────────────────────────────────────────────────────
console.log('\nwhere the warp folds');
{
  const E = engine('where the warp folds', ['CW', 'CH', 'LAMBDA', 'drawing', 'ripple', 'warp', 'detJ', 'topo']);
  const N = E.CW * E.CH, dx = new Float32Array(N), dy = new Float32Array(N), o = new Float32Array(N), det = new Float32Array(N);
  const base = E.drawing('drawing'), bil = E.drawing('billow');
  const t0 = E.topo(base), tb = E.topo(bil);
  ok(t0.islands === 4 && t0.holes === 1, `the still: ${t0.islands} islands, ${t0.holes} hole`);
  ok(tb.islands === 5 && tb.holes === 2, `the billow it is asked for: ${tb.islands} islands, ${tb.holes} holes`);
  // the fold sits at A = λ / 2π: tightest det over a loop, just short of it and just past it
  const tight = (p) => { let m = Infinity; for (let k = 0; k < 24; k++) { E.ripple(p, k / 24, dx, dy); E.detJ(dx, dy, E.CW, E.CH, det); for (const v of det) if (v < m) m = v; } return m; };
  const a = tight(0.98), b = tight(1.02);
  ok(a > 0 && b < 0, `on the pixel grid, tightest det J at 0.98 of the fold ${a.toFixed(4)}, at 1.02 ${b.toFixed(4)} (A = λ/2π = ${(E.LAMBDA / 2 / Math.PI).toFixed(3)} px)`);
  // short of the fold the count never moves, at any push or phase
  const seen = new Set(); let frames = 0;
  for (let p = 0; p <= 0.951; p += 0.05) for (let k = 0; k < 24; k++) { E.ripple(p, k / 24, dx, dy); E.warp(base, E.CW, E.CH, dx, dy, o); const c = E.topo(o); seen.add(c.islands + '·' + c.holes); frames++; }
  ok(seen.size === 1 && seen.has('4·1'), `short of the fold, ${frames} frames (push 0 to 0.95, 24 phases): counts seen ${[...seen].join(', ')}`);
  // past it, the count changes somewhere in the loop
  const past = new Set(); for (let k = 0; k < 24; k++) { E.ripple(1.4, k / 24, dx, dy); E.warp(base, E.CW, E.CH, dx, dy, o); const c = E.topo(o); past.add(c.islands + '·' + c.holes); }
  ok([...past].some((v) => v !== '4·1'), `at 1.4 of the fold, counts seen over the loop: ${[...past].join(', ')}`);
  // the bench's presets, as the piece's table states them
  const P = fx.presets, want = { sky: [0.90, 9.5], dust: [0.05, 0.94], water: [0.02, 1.02], smoke: [0.01, 1.01], flame: [-0.07, 0.94] };
  for (const [k, [td, ff]] of Object.entries(want)) {
    const q = P[k];
    ok(Math.abs(q.tightest - td) < 0.005 && Math.abs(q.fold_factor - ff) < 0.05, `${k}: tightest det J ${q.tightest.toFixed(3)}, folds at push × ${q.fold_factor.toFixed(3)}, folded ${q.folded_px} px in ${q.folded_frames} frames`);
  }
}

// ── one grain ────────────────────────────────────────────────────────────────────────────
console.log('\none grain');
{
  const E = engine('one grain', ['GW', 'GH', 'gauss', 'npr', 'tooth', 'makeScene', 'change']);
  const bf = fx.blur; let w8 = 0, w7 = 0;
  const g8 = E.gauss(Float32Array.from(bf.img), bf.w, bf.h, 0.8), g7 = E.gauss(Float32Array.from(bf.img), bf.w, bf.h, 7.0);
  for (let i = 0; i < g8.length; i++) { w8 = Math.max(w8, Math.abs(g8[i] - bf.s08[i])); w7 = Math.max(w7, Math.abs(g7[i] - bf.s7[i])); }
  ok(w8 < 1e-5 && w7 < 1e-5, `blur matches scipy gaussian_filter: sigma 0.8 worst ${w8.toExponential(2)}, sigma 7 worst ${w7.toExponential(2)}`);
  const nf = fx.npr, no = E.npr(Float32Array.from(nf.gray), Float32Array.from(nf.tooth), new Float32Array(nf.gray.length));
  let wn = 0; for (let i = 0; i < no.length; i++) wn = Math.max(wn, Math.abs(no[i] - nf.out[i]));
  ok(wn < 1e-5, `npr matches stylize.npr_ink: worst ${wn.toExponential(2)}`);
  const S = E.makeScene(), FR = 48, res = {};
  for (const mode of ['fresh', 'fixed', 'carried']) {
    const F = []; for (let k = 0; k < FR; k++) F.push(S.frame(k / FR, mode, k));
    let boil = 0, slide = 0; for (let k = 1; k < FR; k++) { boil += E.change(F[k], F[k - 1], S.still, 1); slide += S.slide(F[k], k / FR); }
    res[mode] = { boil: boil / (FR - 1), slide: slide / (FR - 1), seam: E.change(S.frame(1, mode, FR), F[0]) };
    console.log(`         ${mode.padEnd(8)} boil ${res[mode].boil.toFixed(3)}  slide ${res[mode].slide.toFixed(3)}  / 255`);
  }
  ok(res.fresh.boil > 0.3, `fresh grain each frame boils where nothing moves: ${res.fresh.boil.toFixed(3)}`);
  ok(res.fixed.boil === 0 && res.carried.boil === 0, 'one grain, fixed or carried: boil exactly 0 where nothing moves');
  ok(res.fixed.slide > 5 * res.carried.slide, `fixed grain slides (${res.fixed.slide.toFixed(3)}); carried barely (${res.carried.slide.toFixed(3)})`);
  ok(res.fixed.seam === 0 && res.carried.seam === 0, 'the sway is periodic: frame 48 is frame 0 for one grain');
}

console.log(fails ? `\n${fails} check(s) failed` : '\nall checks pass');
process.exit(fails ? 1 : 0);
