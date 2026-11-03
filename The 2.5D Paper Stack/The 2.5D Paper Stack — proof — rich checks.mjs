#!/usr/bin/env node
// title: The 2.5D Paper Stack — proof — rich checks
// born: 2026-11-03
// links: [[The 2.5D Paper Stack]] connects-to · checks its rich face's pieces
// forward_vector: I re-run each claim the rich face's pieces make, on the pieces' own engines pulled out of their
//   HTML, against numbers computed another way: the cut's table against the sheet maker's scipy reference, the
//   stack's parallax against its own geometry, the balloon's drift against the depths it is given.
//
// Run from the palace root:  node "The 2.5D Paper Stack/The 2.5D Paper Stack — proof — rich checks.mjs"
// Needs python3 with Pillow and numpy (to decode the PNGs into raw bytes for Node).
import { readFileSync, mkdtempSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const B = 'The 2.5D Paper Stack';
const PLATE = 'Projects/BLUELINE/proofs/track-VI-elemental-motion/plates/sky.png';
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails++; };
const engine = (file, id, name) => {
  const html = readFileSync(join(B, file), 'utf8');
  const m = html.match(new RegExp('<script id="' + id + '">([\\s\\S]*?)</script>'));
  if (!m) throw new Error('no engine ' + id + ' in ' + file);
  return new Function(m[1] + '\nreturn ' + name + ';')();
};

// decode the plate and the sheets to raw bytes
const dir = mkdtempSync(join(tmpdir(), 'paperstack-'));
execFileSync('python3', ['-I', '-c', `
import sys, numpy as np
from PIL import Image
out = sys.argv[1]
for name, path, mode in [("plate", sys.argv[2], "RGB"), ("fill", sys.argv[3] + "/sky-behind.png", "RGB"),
                         ("ink", sys.argv[3] + "/ridge-ink.png", "L"), ("density", sys.argv[3] + "/ridge-density.png", "L"),
                         ("figure", sys.argv[3] + "/figure-ink.png", "L")]:
    a = np.asarray(Image.open(path).convert(mode), np.uint8)
    open(out + "/" + name + ".raw", "wb").write(a.tobytes())
print(a.shape[1], a.shape[0])
`, dir, PLATE, join(B, 'sheets')]);
const meta = JSON.parse(readFileSync(join(B, 'sheets', 'sheets.json'), 'utf8'));
const [W, H] = meta.size, N = W * H;
const raw = (n) => new Uint8Array(readFileSync(join(dir, n + '.raw')));
const P = raw('plate'), F = raw('fill'), ti = raw('ink'), mi = raw('density'), fi = raw('figure');
const L = new Float32Array(N), LF = new Float32Array(N), T = new Uint8Array(N), M = new Uint8Array(N), FG = new Uint8Array(N);
for (let i = 0; i < N; i++) {
  L[i] = (P[3 * i] + P[3 * i + 1] + P[3 * i + 2]) / 3 / 255; LF[i] = (F[3 * i] + F[3 * i + 1] + F[3 * i + 2]) / 3 / 255;
  T[i] = ti[i] > 127 ? 1 : 0; M[i] = mi[i] > 127 ? 1 : 0; FG[i] = fi[i] > 127 ? 1 : 0;
}

// 1. the cut
console.log('the cut — its engine against the sheet maker\'s scipy reference');
const PS = engine('The 2.5D Paper Stack — rich — the cut.html', 'ps-engine', 'PS');
const t = PS.table(T, M, L, LF, W, H, meta.figure_box);
ok(t.Lb === meta.boundary_px, `edge length ${t.Lb} px = reference ${meta.boundary_px}`);
for (const [k, ref] of Object.entries(meta.reference)) {
  const r = t.rows[k];
  const d = { carried: Math.abs(r.carried - ref.carried), left: Math.abs(r.left - ref.left), rest_mean: Math.abs(r.rest_mean - ref.rest_mean), rest_visible: Math.abs(r.rest_visible - ref.rest_visible) };
  ok(d.carried < 0.01 && d.left < 0.01 && d.rest_mean < 0.05 && d.rest_visible < 0.1,
    `${k.padEnd(8)} carried ${r.carried.toFixed(3)} (${ref.carried.toFixed(3)}) · left ${r.left.toFixed(3)} (${ref.left.toFixed(3)}) · rest ${r.rest_mean.toFixed(3)}/255 (${ref.rest_mean.toFixed(3)}) · visible ${r.rest_visible.toFixed(2)} % (${ref.rest_visible.toFixed(2)})`);
}
const R = t.rows;
ok(R.edge.carried === 0 && R.edge.left === 0 && R.edge.rest_mean === 0, 'the page: a hard cut at the ink\'s edge carries nothing, leaves nothing, and stacks back to the plate');
ok(['f2', 'f6', 'f12'].every((k) => R[k].rest_visible > 1 && R[k].carried > 0.5 && R[k].left > 0.5), 'the page: every centred feather is off the plate at rest and carries sky (the halo)');
ok(Math.abs(R.f6.edge_visible - 75.4) < 0.1 && R.f6.rim > 6 && R.f6.rim < 7.5, `a 6 px feather is visibly off on ${R.f6.edge_visible.toFixed(1)} % of the edge pixels, a rim ${R.f6.rim.toFixed(2)} px wide (the challenger's 75.4 %, 6.7 px)`);
ok(R.o6.rest_visible < 1 && R.o6.carried > 4, 'a feather pushed outside is near the plate at rest but carries the widest band of sky');
ok(R.in2.rest_mean === 0 && R.in2.left > 1.5 && R.in4.left > 3.5, 'the offer: a knife inside the ink is the plate at rest, but leaves the line on the back sheet');
ok(R.density.left > 1.5 && R.trackvi.left < R.density.left && R.trackvi.carried < 1, 'track VI\'s 2 px dilation moves its density contour out toward the ink\'s edge');
// the stacked sheets are the plate
let mx = 0; for (let i = 0; i < N; i++) { const a = T[i]; mx = Math.max(mx, Math.abs(a * L[i] + (1 - a) * (T[i] ? LF[i] : L[i]) - L[i])); }
ok(mx === 0, 'front and back sheets of the hard cut stack back to the plate exactly');

// 2. the stack, revealed and broken
console.log('\nreveal and break — the turn the eye sees before and in the break');
const RB = engine('The 2.5D Paper Stack — rich — reveal and break.html', 'rb-engine', 'RB');
ok(RB.ease(0) === 0 && RB.ease(1) === 1 && Math.abs(RB.ease(0.5) - 0.5) < 1e-12, 'the break eases from 0 to 1');
const fl = RB.run('flat', 3.1, 14), sl = RB.run('still', 3.1, 14);
ok(fl.before === 0 && sl.before === 0, `out of the flat stack and the revealed, still stack the eye has seen 0° before the break`);
ok(Math.abs(fl.during - RB.BREAK.turn) < 1e-9, `the break itself turns ${fl.during.toFixed(2)}° = the walker's ${RB.BREAK.turn}°`);
// the turning run eases in from the click: no snap, and the counted turn starts at 0
let snap = 0; for (let tc = 0; tc < 6.5; tc += 0.1) snap = Math.max(snap, Math.abs(RB.leadTurn('turning', tc, 14)(tc + 1 / 60) - RB.leadTurn('turning', tc, 14)(tc)));
ok(snap < 0.05, `the turning run opens with at most ${snap.toFixed(3)}° in its first frame (no snap)`);
let rlo = Infinity, rhi = 0; for (let tc = 0; tc < 6.5; tc += 0.05) { const r = RB.run('turning', tc, 14); rlo = Math.min(rlo, r.during / r.before); rhi = Math.max(rhi, r.during / r.before); }
ok(rlo > 1 && rhi < 3, `counted from the click, the turning run's break is ${rlo.toFixed(1)}× to ${rhi.toFixed(1)}× what came before (set by the ±14° sway and the 38° break)`);
// a sway of ±14° over 6.5 s: in any 1.5 s window the turn seen lies between the window at the crest and the window at the zero crossing
let lo = Infinity, hi = 0;
for (let t0 = 0; t0 < 6.5; t0 += 0.05) { const v = RB.turnSpent((t) => RB.swayTurn(t, 14), t0, t0 + 1.5); lo = Math.min(lo, v); hi = Math.max(hi, v); }
const crossing = 2 * 14 * Math.sin(Math.PI * 1.5 / 6.5);
ok(Math.abs(hi - crossing) < 0.2, `the most turn a 1.5 s window of the sway shows is ${hi.toFixed(2)}° (analytic 2·14·sin(π·1.5/6.5) = ${crossing.toFixed(2)}°)`);
ok(Math.abs(lo - 2 * 14 * (1 - Math.cos(Math.PI * 1.5 / 6.5))) < 0.2, `the least a 1.5 s window shows is ${lo.toFixed(2)}° (analytic 2·14·(1 − cos(π·1.5/6.5)))`);

// 3. the balloon
console.log('\nthe balloon — drift by depth, cover by order');
const BLn = engine('The 2.5D Paper Stack — rich — the balloon.html', 'bl-engine', 'BL');
for (const pl of BLn.PLACES) {
  const want = BLn.CAM * Math.abs((pl.sticker ? 0 : pl.p) - BLn.DEPTH.fig);
  const got = BLn.drift(pl.p, !!pl.sticker, meta.mouth);
  ok(Math.abs(got - want) < 1e-9, `${pl.key.padEnd(8)} tail off the mouth ${got.toFixed(2)} px = 40·|p − 0.55| = ${want.toFixed(2)}`);
}
const ord = (pl) => BLn.order(pl.p, !!pl.sticker, !!pl.behind);
const P2 = Object.fromEntries(BLn.PLACES.map((pl) => [pl.key, ord(pl)]));
ok(P2.speaker.indexOf('balloon') > P2.speaker.indexOf('fig') && P2.speaker.indexOf('balloon') < P2.speaker.indexOf('panel'), 'at his depth, in front: in front of the walker, behind the panel border');
ok(P2.behind.indexOf('balloon') < P2.behind.indexOf('fig'), 'at his depth, behind: the walker covers it');
ok(P2.sticker.at(-1) === 'balloon', 'the sticker sits over the panel border');
const cov = BLn.covered(FG, W);
ok(cov.tail > 30, `behind him, his sheet covers ${cov.tail.toFixed(1)} % of the tail's last 30 px (the tip reaches him)`);
const om = BLn.outlineMotion(3);
ok(om > 0 && om <= 4.8 + 1e-9, `the outline breathes by up to ${om.toFixed(2)} px; the letters are drawn unwarped unless asked`);

if (fails) { console.log(`\n${fails} check(s) failed`); process.exit(1); }
console.log('\nall checks passed');
