#!/usr/bin/env node
// title: Hand-Drawn 3D Look — proof — rich checks
// born: 2026-11-03
// links: [[Hand-Drawn 3D Look]] connects-to · checks its rich face's pieces
// forward_vector: I re-run each claim the rich face's three pieces make, on the pieces' own engines pulled out of
//   their HTML, against the numbers the sheet maker computed in scipy and numpy: the seam's held, chance, new and
//   changed for every rung and seed; the line knobs' weight and off-edge shares; the boil's frame-to-frame changes,
//   on twos and on ones, and the playhead test. Then I check the claims the pieces' words rest on.
//
// Run from the palace root:  node "Hand-Drawn 3D Look/Hand-Drawn 3D Look — proof — rich checks.mjs"
// Needs python3 with Pillow and numpy (to decode the PNG sheets into raw bytes for Node).
import { readFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const B = 'Hand-Drawn 3D Look';
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails++; };
const engine = (file) => {
  const html = readFileSync(join(B, file), 'utf8');
  const m = html.match(/<script id="hd-engine">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('no engine in ' + file);
  return new Function(m[1] + '\nreturn HD;')();
};
const meta = JSON.parse(readFileSync(join(B, 'sheets', 'sheets.json'), 'utf8'));
const files = [];
meta.seam.items.forEach((it) => files.push(it.file));
meta.lines.items.forEach((it) => files.push(it.file));
const boilKeys = [];
for (let i = 1; i <= 12; i++) boilKeys.push('on_' + String(i).padStart(2, '0'), 'off_' + String(i).padStart(2, '0'));
for (let s = 1; s <= 5; s++) boilKeys.push('twos_' + s, 'ones_' + s);
boilKeys.push('single5', 'single5_sn0', 'seq5_sn0');
boilKeys.forEach((k) => files.push('boil/' + k + '.png'));

const dir = mkdtempSync(join(tmpdir(), 'hd3d-'));
execFileSync('python3', ['-I', '-c', `
import sys, numpy as np
from PIL import Image
out, base = sys.argv[1], sys.argv[2]
for i, f in enumerate(sys.argv[3:]):
    open(out + "/%d.raw" % i, "wb").write(np.asarray(Image.open(base + "/" + f).convert("L"), np.uint8).tobytes())
`, dir, join(B, 'sheets'), ...files]);
const raw = {}; files.forEach((f, i) => { raw[f] = new Uint8Array(readFileSync(join(dir, i + '.raw'))); });

// 1. the seam
console.log('the seam is a redraw — its engine against scipy');
{
  const HD = engine('Hand-Drawn 3D Look — rich — the seam is a redraw.html');
  const [W, H] = meta.seam.size, { r, shifts } = meta.seam;
  const grey = (f) => Float64Array.from(raw[f], (v) => v / 255);
  const P = HD.prepare(grey('seam/plate.png'), W, H);
  const got = {};
  for (const it of meta.seam.items) {
    if (!it.ref) continue;
    const s = HD.stats(P, HD.prepare(grey(it.file), W, H), W, H, r, shifts); got[it.key] = s;
    const d = Math.max(...['held', 'chance', 'new', 'changed'].map((k) => Math.abs(s[k] - it.ref[k])));
    ok(d < 2e-3 && Math.abs(s.edge_px - it.ref.edge_px) <= 0.002 * it.ref.edge_px,
      `${it.key.padEnd(10)} held ${s.held.toFixed(4)} (${it.ref.held.toFixed(4)}) chance ${s.chance.toFixed(4)} (${it.ref.chance.toFixed(4)}) new ${s.new.toFixed(4)} (${it.ref.new.toFixed(4)}) changed ${s.changed.toFixed(4)} (${it.ref.changed.toFixed(4)})`);
  }
  console.log('  claims');
  ok(got.d072.changed < 0.03, `0.72 hands the render back: ${(100 * got.d072.changed).toFixed(1)} % of pixels changed`);
  ok(got.d095.new > 2 * got.d072.new && got.d095.new > 0.3, `0.95 redraws the medium: new marks ${(100 * got.d095.new).toFixed(1)} % against ${(100 * got.d072.new).toFixed(1)} % at 0.72`);
  const lift = (s) => (s.held - s.chance) / (1 - s.chance);
  ok(lift(got.d095) > 0.5, `0.95 keeps the composition: held ${(100 * got.d095.held).toFixed(1)} %, chance ${(100 * got.d095.chance).toFixed(1)} %, above chance ${lift(got.d095).toFixed(2)}`);
  const seeds = Object.keys(got).filter((k) => k.startsWith('seed')), lifts = seeds.map((k) => lift(got[k]));
  ok(Math.min(...lifts) < 0.3 && Math.max(...lifts) > 0.8, `seeds: above chance from ${Math.min(...lifts).toFixed(2)} to ${Math.max(...lifts).toFixed(2)} — "structure stays locked" is only partly true`);
  for (const rr of [2, 8]) {
    const n = ['d072', 'd090', 'd095'].map((k) => HD.stats(P, HD.prepare(grey('seam/' + k + '.png'), W, H), W, H, rr, shifts));
    ok(n[2].new > n[0].new && n[2].held < n[0].held, `at r = ${rr} the rungs keep their order: new ${n.map((s) => (100 * s.new).toFixed(1)).join(' < ')} %`);
  }
}

// 2. one config away
console.log('one config away — its engine against scipy');
{
  const HD = engine('Hand-Drawn 3D Look — rich — one config away.html');
  const [W, H] = meta.lines.size;
  const plainInk = HD.ink(raw['lines/plain.png']), dPlain = HD.edt(plainInk, W, H), T = {};
  for (const it of meta.lines.items) {
    const m = HD.measure(HD.ink(raw[it.file]), plainInk, dPlain); T[it.key] = m;
    const d = Math.max(Math.abs(m.weight - it.ref.weight), Math.abs(m.stray - it.ref.stray), Math.abs(m.off3 - it.ref.off3), Math.abs(m.off12 - it.ref.off12));
    ok(d < 1e-9 && m.ink_px === it.ref.ink_px, `${it.key.padEnd(9)} weight ${m.weight.toFixed(3)} off3 ${(100 * m.off3).toFixed(2)} % off12 ${(100 * m.off12).toFixed(2)} %`);
  }
  console.log('  claims');
  const eO = HD.effects(T, 'off3'), eW = HD.effects(T, 'weight'), eS = HD.effects(T, 'off12');
  const top = ['c', 'n', 's', 'p'].reduce((a, b) => (eO[b] < eO[a] ? b : a));
  ok(top === 'n', `noise moves ink off the edge most: c ${(100 * eO.c).toFixed(1)} n ${(100 * eO.n).toFixed(1)} s ${(100 * eO.s).toFixed(1)} p ${(100 * eO.p).toFixed(1)} pts`);
  const dbl = (n) => ((T['c0n' + n + 's0p0'].weight / T['c1n' + n + 's0p0'].weight) + (T['c0n' + n + 's0p1'].weight / T['c1n' + n + 's0p1'].weight)) / 2;
  ok(dbl(0) > 1.5 && dbl(1) < 1.3, `SKETCHY doubles only with heavy noise: ${dbl(0).toFixed(2)} × heavy, ${dbl(1).toFixed(2)} × trace`);
  ok(T.c0n0s1p0.off12 > 0.03 && T.c0n0s1p1.off12 > 0.03 && Math.max(...Object.keys(T).filter((k) => !k.startsWith('c0n0s1')).map((k) => T[k].off12)) < 0.01,
    `Bézier on a SKETCHY, heavy-noise chain throws spears (${(100 * T.c0n0s1p0.off12).toFixed(1)} %, ${(100 * T.c0n0s1p1.off12).toFixed(1)} % over 12 px); nowhere else above 1 %`);
  ok(eW.p > 1, `the wide pen adds weight: +${eW.p.toFixed(2)} ×`);
}

// 3. the boil
console.log('the boil, measured — its engine against numpy');
{
  const HD = engine('Hand-Drawn 3D Look — rich — the boil, measured.html');
  const f = (k) => raw['boil/' + k + '.png'];
  const pad = (n) => String(n).padStart(2, '0');
  const ON = [], OFF = [];
  for (let i = 1; i <= 12; i++) { ON.push(f('on_' + pad(i))); OFF.push(f('off_' + pad(i))); }
  const ref = meta.boil.ref;
  const same = (a, b) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) < 1e-12);
  const S = {
    clip_on: HD.series(ON), clip_off: HD.series(OFF), on_vs_off: ON.map((a, i) => HD.changed(a, OFF[i])),
    twos_steps: [1, 2, 3, 4].map((s) => HD.changed(f('twos_' + s), f('twos_' + (s + 1)))),
    ones_steps: [1, 2, 3, 4].map((s) => HD.changed(f('ones_' + s), f('ones_' + (s + 1)))),
  };
  for (const k of Object.keys(S)) ok(same(S[k], ref[k]), `${k.padEnd(10)} ${S[k].map((v) => (100 * v).toFixed(2)).join(' ')} %`);
  const s5 = HD.changed(f('single5'), f('on_05')), s5n = HD.changed(f('single5_sn0'), f('seq5_sn0'));
  ok(Math.abs(s5 - ref.single5_vs_seq5) < 1e-12 && s5n === ref.single5_vs_seq5_sn0, `frame 5 alone vs in the run: ${(100 * s5).toFixed(2)} %; spatial noise off ${(100 * s5n).toFixed(2)} %`);
  console.log('  claims');
  const twosSeq = [1, 2, 2, 3, 3, 4, 4, 5, 5].map((s) => f('twos_' + s)), tw = HD.series(twosSeq);
  ok(tw.filter((v, i) => i % 2 === 1).every((v) => v === 0) && tw.filter((v, i) => i % 2 === 0).every((v) => v > 0.003), `on twos, exactly: ${tw.map((v) => (100 * v).toFixed(2)).join(' ')} %`);
  const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const odd = mean(S.clip_on.filter((v, i) => i % 2 === 0)), even = mean(S.clip_on.filter((v, i) => i % 2 === 1));
  ok(Math.abs(odd / even - 1) < 0.1, `the clip does not alternate: seed-changing steps ${(100 * odd).toFixed(2)} %, seed-holding steps ${(100 * even).toFixed(2)} %`);
  ok(mean(S.ones_steps) > 3 * mean(S.twos_steps), `the boil on ones is ${(mean(S.ones_steps) / mean(S.twos_steps)).toFixed(1)} × the boil on twos`);
  ok(Math.abs(mean(S.clip_on) - mean(S.clip_off)) < 0.002, `boil on or off, the clip changes about the same per frame: ${(100 * mean(S.clip_on)).toFixed(2)} % vs ${(100 * mean(S.clip_off)).toFixed(2)} %`);
  const ink = HD.inkShare(f('twos_1')), share = S.twos_steps.map((v) => v / ink);
  ok(ink < 0.03 && Math.min(...share) > 0.2 && Math.max(...share) < 0.4, `ink is ${(100 * ink).toFixed(1)} % of the frame; a twos step redraws ${share.map((v) => (100 * v).toFixed(0)).join(', ')} % of its area`);
  const fr = meta.boil.full_res;
  ok(fr.on_vs_on2.every((x) => x[1]), 'two fresh twelve-frame runs are byte-identical at full size');
  ok(!fr.single5_vs_seq5[1] && fr.single5_vs_seq5_sn0[1], `full size: frame 5 alone ≠ in the run (${(100 * fr.single5_vs_seq5[0]).toFixed(2)} %); with spatial noise off, identical`);
}

console.log(fails ? `\n${fails} check(s) failed` : '\nall checks pass');
process.exit(fails ? 1 : 0);
