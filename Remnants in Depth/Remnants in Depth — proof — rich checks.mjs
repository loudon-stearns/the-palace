#!/usr/bin/env node
// title: Remnants in Depth — proof — rich checks
// born: 2026-11-03
// links: [[Remnants in Depth]] connects-to · checks its rich face's pieces
// forward_vector: I re-run each claim the rich face's two pieces make, on the pieces' own engines pulled out of their
//   HTML, against the numbers the sheet maker measured with scipy: the orbit's agreement and pieces for every make and
//   angle, the truck's slides against the pinhole, the composite's corners, edge rings and occlusion for every render.
//   Then I check the claims the pieces' words rest on, and the knobs run.
//
// Run from the palace root:  node "Remnants in Depth/Remnants in Depth — proof — rich checks.mjs"
// Needs python3 with Pillow and numpy (to decode the PNG sheets into raw bytes for Node).
import { readFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const B = 'Remnants in Depth';
let fails = 0;
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails++; };
const engine = (file) => {
  const html = readFileSync(join(B, file), 'utf8');
  const m = html.match(/<script id="rd-engine">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('no engine in ' + file);
  return new Function(m[1] + '\nreturn RD;')();
};
const meta = JSON.parse(readFileSync(join(B, 'sheets', 'sheets.json'), 'utf8'));
const pad = (n) => String(n).padStart(2, '0');
const files = [];
for (const th of meta.orbit.angles) for (const k of ['card_face', 'card_fixed', 'glob_ink', 'glob_lit']) files.push(`orbit/${k}_${pad(th)}.png`);
const comps = ['ref', 'inkA', 'quadA', 'inkB', 'quadB', 'truthB', 'OV_blend', 'OV_dith', 'quadM', 'truthM', 'L1_blend', 'L1_dith', 'L2_blend', 'L2_dith', 'L2_blend_raw', 'L2_blend_repeat', 'L2_blend_raw_repeat'];
comps.forEach((k) => files.push(`comp/${k}.png`));
const dir = mkdtempSync(join(tmpdir(), 'rid-'));
execFileSync('python3', ['-I', '-c', `
import sys, numpy as np
from PIL import Image
out, base = sys.argv[1], sys.argv[2]
for i, f in enumerate(sys.argv[3:]):
    open(out + "/%d.raw" % i, "wb").write(np.asarray(Image.open(base + "/" + f).convert("L"), np.uint8).tobytes())
`, dir, join(B, 'sheets'), ...files]);
const raw = {}; files.forEach((f, i) => { raw[f] = new Uint8Array(readFileSync(join(dir, i + '.raw'))); });

console.log('flat and in depth — its engine against scipy');
{
  const RD = engine('Remnants in Depth — rich — flat and in depth.html');
  const S = meta.orbit.crop[2], front = RD.sil(raw['orbit/card_face_00.png']);
  for (const row of meta.orbit.rows) {
    const got = {}; let worst = 0, partsOk = true;
    for (const k of ['card_face', 'card_fixed', 'glob_ink', 'glob_lit']) {
      const m = RD.sil(raw[`orbit/${k}_${pad(row.angle)}.png`]);
      got[k] = { iou: RD.iou(m, front), parts: RD.parts(m, S, S) };
      worst = Math.max(worst, Math.abs(got[k].iou - row[k].iou)); if (got[k].parts !== row[k].parts) partsOk = false;
    }
    ok(worst < 1e-9 && partsOk, `${pad(row.angle)}°  face ${got.card_face.iou.toFixed(3)}  fixed ${got.card_fixed.iou.toFixed(3)}  glob ${got.glob_ink.iou.toFixed(3)} (${got.glob_ink.parts} pieces)  lit ${got.glob_lit.iou.toFixed(3)}`);
  }
  const rows = meta.orbit.rows, at = (th) => rows.find((r) => r.angle === th);
  ok(rows.every((r) => r.card_face.iou >= 0.999), 'the facing card agrees with the drawn mark at 0.999 or better at every angle');
  ok(rows.filter((r) => r.angle > 0).every((r) => r.card_fixed.iou < r.glob_ink.iou), 'the card that stays put does worse than the metaball at every angle past 0');
  ok(at(90).card_fixed.ink === 0, 'the card that stays put is gone edge-on at 90');
  ok(rows.find((r) => r.glob_ink.parts === 1).angle === 70, 'the metaball is one piece of ink by 70 (drawn: ' + at(0).card_face.parts + ')');
  ok(at(0).glob_ink.iou > 0.99, 'the metaball from the front is the mark (' + at(0).glob_ink.iou.toFixed(3) + ')');
  const o = meta.orbit, c = o.truck_centroids;
  for (const nm of ['near', 'far']) {
    const pred = -o.f_px * 0.25 / o.depths[nm];
    const steps = c.slice(1).map((x, i) => x[nm].x - c[i][nm].x);
    ok(steps.every((d) => Math.abs(d - pred) < 0.2), `${nm} card slides ${steps.map((d) => d.toFixed(2)).join(', ')} px a quarter unit; f·Δx/z says ${pred.toFixed(2)}`);
    const inks = c.map((x) => x[nm].ink);
    ok(Math.max(...inks) - Math.min(...inks) < 0.01 * Math.max(...inks), `${nm} card's ink holds within 1 % while it slides (${Math.min(...inks)}-${Math.max(...inks)})`);
  }
}

console.log('the white square — its engine against scipy');
{
  const RD = engine('Remnants in Depth — rich — the white square.html');
  const [, , W, H] = meta.comp.crop, G = {};
  comps.forEach((k) => { G[k] = raw[`comp/${k}.png`]; });
  const P = RD.prepare(G, W, H), ref = meta.comp.measures;
  for (const k of comps.slice(10)) {
    const m = RD.measure(P, G.ref, G[k]), r = ref[k];
    const same = ['A', 'B'].every((q) => ['corner_lines', 'kept', 'ring_px', 'ring_moved', 'ring_max'].every((f) => m[q][f] === r[q][f]))
      && ['B_visible', 'B_truth', 'B_xor', 'lines_lost'].every((f) => m[f] === r[f]);
    ok(same, `${k.padEnd(20)} A kept ${m.A.kept}/${m.A.corner_lines}  ring moved ${m.A.ring_moved}/${m.A.ring_px} max ${m.A.ring_max}  lost ${m.lines_lost}  B ${m.B_visible}/${m.B_truth} xor ${m.B_xor}`);
  }
  ok(Math.abs(P.hiddenB - ref.B_hidden_share) < 1e-9, 'B hidden share ' + P.hiddenB.toFixed(4));
  ok(RD.differ(G.L1_blend, G.L1_dith) === 0 && ref.L1_blend_vs_L1_dith === 0, 'one layer: BLENDED and DITHERED render the same, pixel for pixel');
  const F = meta.comp.full_res;
  ok(F.L1_dith.A.kept_share < 0.05 && F.L1_blend.A.kept_share < 0.05, 'one layer: under 5 % of the line survives in A\'s empty corners (full frame ' + (100 * F.L1_dith.A.kept_share).toFixed(1) + ' %)');
  ok(F.L2_blend.lines_lost === 0 && F.L2_dith.lines_lost === 0, 'two layers: no line lost in the full frame, BLENDED or DITHERED');
  ok(F.L2_blend.A.ring_moved === 0 && F.L2_blend.B.ring_moved === 0, 'two layers, BLENDED, material as written: no edge pixel moves more than 4 of 255 (max ' + F.L2_blend.A.ring_max + ')');
  ok(F.L2_blend_raw_repeat.A.ring_moved > 0, 'both guards undone: a faint edge (' + F.L2_blend_raw_repeat.A.ring_moved + ' px, max ' + F.L2_blend_raw_repeat.A.ring_max + ')');
  ok(F.L2_blend_repeat.A.ring_moved === 0 && F.L2_blend_raw.A.ring_moved === 0, 'one guard undone, either one: still no edge past 4 of 255');
  for (const tag of ['OV_blend', 'OV_dith']) {
    const o = RD.overlap(G, W, H, tag), r = meta.comp.overlap[tag];
    ok(o.leak === r.leak && o.in_square === r.in_square && o.missing === r.missing, `${tag.padEnd(9)} hidden ink showing ${o.leak} (scipy ${r.leak}), within M's square ${o.in_square}, missing ${o.missing}`);
  }
  const OF = meta.comp.overlap_full_res;
  ok(OF.OV_blend.leak > 1000 && OF.OV_blend.in_square === OF.OV_blend.leak, 'overlap, BLENDED: the hidden mark shows through, every leaked pixel within 2 px of the near card\'s square (' + OF.OV_blend.leak + ')');
  ok(OF.OV_blend.last_col <= OF.quadM_right + 2, 'overlap, BLENDED: the leak stops at the near card\'s edge (last column ' + OF.OV_blend.last_col + ', edge ' + OF.quadM_right + ')');
  ok(OF.OV_dith.leak === 0, 'overlap, DITHERED: nothing leaks (' + OF.OV_dith.leak + ')');
  ok(F.L2_dith.B_xor <= 0.01 * F.L2_dith.B_truth && F.L2_blend.B_xor <= 0.01 * F.L2_blend.B_truth, 'two layers: B shows where a plain depth test shows it, within 1 %');
}

console.log('the knobs — does the measured circularity reach blob_synth.py?');
{
  const k = meta.knobs;
  ok(k && k.identical === true, 'two opposite signatures (circularity ' + k.round.circularity.mean + ' and ' + k.ragged.circularity.mean + ') give the same 30 blobs, byte for byte (' + k.round.sha256 + ')');
  const src = readFileSync('Projects/BLUELINE/proofs/blender-handdrawn/scripts/blob_synth.py', 'utf8');
  const uses = (name) => src.split('\n').filter((l) => new RegExp('\\b' + name + '\\b').test(l) && !/^\s*#/.test(l)).length;
  ok(uses('CIRC') === 2 && uses('CIRC_LO') === 2, 'CIRC and CIRC_LO appear only where they are read and in the closing print');
}
console.log(fails ? `\n${fails} FAILED` : '\nall checks pass');
process.exit(fails ? 1 : 0);
