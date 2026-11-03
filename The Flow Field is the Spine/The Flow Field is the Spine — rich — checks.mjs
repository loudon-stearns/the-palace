#!/usr/bin/env node
/*
  title: The Flow Field is the Spine — rich — checks
  born: 2026-11-03
  links: [[The Flow Field is the Spine]] (connects-to · rich-face-checks) · checks "The Flow Field is the Spine — rich — one field, three legs.html" and "The Flow Field is the Spine — rich — around a body.html"
  forward_vector: I re-run every claim the two made pieces of the rich face show, on the engines inside
    those pieces (pulled out of their own HTML, never a copy), against Session 3's and Session 4's own
    flow-field.json and renders, so a change to a piece that breaks a claim fails here, and I print the
    numbers the manifest's offers quote.

  usage: node "The Flow Field is the Spine — rich — checks.mjs"   (run from anywhere inside the palace)
*/
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inflateSync } from 'node:zlib';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const ENTRY = 'The Flow Field is the Spine';
const read = (what) => readFileSync(join(HERE, `${ENTRY} — rich — ${what}.html`), 'utf8');
const between = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); if (i < 0 || j < 0) throw new Error('marker missing: ' + a); return src.slice(i, j + b.length); };
const legs = read('one field, three legs'), body = read('around a body');
const A = new Function(between(legs, '/* ENGINE:START', '/* ENGINE:END */') + '\n' + between(legs, '/* MEASURE:START', '/* MEASURE:END */') +
  '\nreturn { steersCurl, S3, S3_CHOSEN, s3Build, s3Sample, s3Checksum, s3Rng, drawnSeeds, drawnStrokes, steersVel, steersNoise, steersWarp, simSeed, simStep, fitOf, fits, sharedBandNeeded, bestShared, steersRegistration };')();
const B = new Function(between(body, '/* ENGINE:START', '/* MEASURE:END */') +
  '\nreturn { S4, s4Unrle, s4FillHoles, s4Circle, s4Prepare, s4Iterate, s4Finish, s4Build, s4Sample, s4InBody, s4Drawn, s4DrawnSeeds, s4Wall, s4DivMean, s4DustRun };')();
const FIGURE = between(body, "const S4_FIGURE = '", "';").slice("const S4_FIGURE = '".length, -2);

let fails = 0;
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails++; };
const forbidden = ['rich:' + 'hush'];
for (const [name, src] of [['one field, three legs', legs], ['around a body', body]]) ok(!forbidden.some(f => src.includes(f)), `${name}: leaves hushing to the kit (never names its message)`);

// a small PNG reader: 8-bit RGB or RGBA, not interlaced (what PIL writes)
function png(path) {
  const b = readFileSync(path); let o = 8, w = 0, h = 0, ct = 0; const idat = [];
  while (o < b.length) { const len = b.readUInt32BE(o), type = b.toString('ascii', o + 4, o + 8), d = b.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); ct = d[9]; if (d[8] !== 8 || d[12] !== 0) throw new Error('png: only 8-bit, non-interlaced'); }
    if (type === 'IDAT') idat.push(d); o += 12 + len; }
  const bpp = ct === 6 ? 4 : ct === 2 ? 3 : (() => { throw new Error('png: colour type ' + ct); })(), raw = inflateSync(Buffer.concat(idat)), out = new Uint8Array(w * h * 3), stride = w * bpp, prev = new Uint8Array(stride), cur = new Uint8Array(stride);
  for (let y = 0; y < h; y++) { const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) { const a = x >= bpp ? cur[x - bpp] : 0, up = prev[x], c = x >= bpp ? prev[x - bpp] : 0, v = line[x];
      cur[x] = (f === 0 ? v : f === 1 ? v + a : f === 2 ? v + up : f === 3 ? v + ((a + up) >> 1) : v + (() => { const p = a + up - c, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? up : c; })()) & 255; }
    for (let x = 0; x < w; x++) for (let k = 0; k < 3; k++) out[(y * w + x) * 3 + k] = cur[x * bpp + k];
    prev.set(cur); }
  return { w, h, px: out };
}

// ─────────────────────────────── one field, three legs ───────────────────────────────
console.log('\none field, three legs — Session 3');
const S3DIR = join(ROOT, 'Projects/BLUELINE/proofs/session-3-flowfield');
const J3 = JSON.parse(readFileSync(join(S3DIR, 'flow-field.json'), 'utf8'));
const F3 = A.s3Build(A.S3.VORTICES);
{ let md = 0; for (let j = 0; j < 76; j++) for (let i = 0; i < 120; i++) { const n = j * 120 + i; md = Math.max(md, Math.abs(J3.vectors[j][i][0] - F3.vx[n]), Math.abs(J3.vectors[j][i][1] - F3.vy[n])); }
  console.log(`         rebuilt field vs flow-field.json: largest difference ${md.toExponential(2)} (the file is rounded to 5 decimals); fastest ${F3.magMax.toFixed(6)} vs ${J3.mag_max.toFixed(6)}`);
  ok(md < 1e-5 && Math.abs(F3.magMax - J3.mag_max) < 1e-6, 'the piece’s field is Session 3’s flow-field.json, cell for cell'); }
{ const before = A.s3Checksum(F3), r = A.s3Rng(3), P = new Float32Array(2000); for (let i = 0; i < 1000; i++) A.simSeed(P, i, r);
  A.drawnStrokes(F3, A.S3_CHOSEN.drawn, A.drawnSeeds()); const V = A.steersVel(F3, 190, 120, true); A.steersWarp(V, A.steersNoise(190, 120, 1.5), A.S3_CHOSEN.steers, 3, new Float32Array(190 * 120));
  for (let k = 0; k < 200; k++) A.simStep(F3, P, A.S3_CHOSEN.sim, r);
  ok(A.s3Checksum(F3) === before, `all three legs read the field and leave it byte for byte as they found it (checksum ${before})`); }
{ const moved = A.S3.VORTICES.map(v => v.slice()); moved[0][0] += 0.3; const G = A.s3Build(moved), seeds = A.drawnSeeds();
  const a = A.drawnStrokes(F3, A.S3_CHOSEN.drawn, seeds), b = A.drawnStrokes(G, A.S3_CHOSEN.drawn, seeds);
  const va = A.steersVel(F3, 95, 60, true), vb = A.steersVel(G, 95, 60, true); let dv = 0; for (let k = 0; k < va.vx.length; k++) dv = Math.max(dv, Math.abs(va.vx[k] - vb.vx[k]));
  const ra = A.s3Rng(5), rb = A.s3Rng(5), Pa = new Float32Array(400), Pb = new Float32Array(400); for (let i = 0; i < 200; i++) { A.simSeed(Pa, i, ra); A.simSeed(Pb, i, rb); }
  for (let k = 0; k < 50; k++) { A.simStep(F3, Pa, A.S3_CHOSEN.sim, ra); A.simStep(G, Pb, A.S3_CHOSEN.sim, rb); } let dp = 0; for (let k = 0; k < 400; k++) dp = Math.max(dp, Math.abs(Pa[k] - Pb[k]));
  ok(JSON.stringify(a.slice(0, 50)) !== JSON.stringify(b.slice(0, 50)) && dv > 0.1 && dp > 1e-3, 'move one vortex and all three legs change, with every leg’s number left as it was'); }
{ const c = A.S3_CHOSEN; console.log(`         Session 3’s numbers, frame heights per tick per unit speed: drawn ${c.drawn.toFixed(5)} · steers ${c.steers.toFixed(5)} · sim ${c.sim.toFixed(5)}`);
  const need = A.sharedBandNeeded(), best = A.bestShared();
  console.log(`         spread ×${(need * need).toFixed(2)}; one shared number fits at most ${best.n} of 3 within ×2 (at k ≈ ${best.k.toFixed(4)}); it would take ×${need.toFixed(2)} either way to fit all three`);
  ok(best.n === 2, 'one number for all three legs: no setting fits all three within ×2 of Session 3’s choices (the strong claim fails on units)');
  ok(['drawn', 'steers', 'sim'].every(l => A.fits(l, c[l])), 'each leg its own number: all three fit (the likely-true claim holds)'); }
{ const up = A.steersRegistration(F3, 190, 120, true), s3way = A.steersRegistration(F3, 190, 120, false);
  console.log(`         steers arrow vs field arrow at the same place, speed-weighted: rows up ${up.toFixed(2)}°, rows as steers_motion.py reads them ${s3way.toFixed(1)}°`);
  ok(up < 0.01 && s3way > 10, 'drawn with rows up the steers leg puts each arrow where the field put it; read as Session 3’s code reads it, it does not');
  // and that the contact sheet's steers row really was drawn that way: steers_motion.py's dense map, both ways, against its own render
  const R = png(join(S3DIR, 'renders/02-steers-motion.png')), PW = 380, PH = 300, TOP = 26;
  const hsv = (h, s, v) => { const i = Math.floor(h * 6), f = h * 6 - i, p = v * (1 - s), q = v * (1 - f * s), t = v * (1 - (1 - f) * s); return [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][((i % 6) + 6) % 6]; };
  const diff = (rowsUp) => { let s = 0; for (let py = 0; py < PH; py++) for (let px = 0; px < PW; px++) {
      const x = px / (PW - 1) * F3.ASP, y = rowsUp ? 1 - py / (PH - 1) : py / (PH - 1), [vx, vy] = A.s3Sample(F3, x, y);
      const c = hsv((Math.atan2(-vy, vx) + Math.PI) / (2 * Math.PI), 0.9, Math.pow(Math.min(1, Math.hypot(vx, vy) / F3.magMax), 0.7)), o = ((py + TOP) * R.w + px) * 3;
      for (let k = 0; k < 3; k++) s += Math.abs(c[k] - R.px[o + k] / 255); } return s / (PW * PH * 3); };
  const dS3 = diff(false), dUp = diff(true);
  console.log(`         02-steers-motion.png’s dense map against the field: read rows from the bottom (Session 3’s code) ${dS3.toFixed(4)} mean difference; rows up ${dUp.toFixed(4)}`);
  ok(dS3 < 0.01 && dUp > 0.05, 'Session 3’s steers render is the field read with its rows from the top: its picture mirrored top to bottom against the source, drawn and sim rows');
  const cu = A.steersCurl(F3, true), cs = A.steersCurl(F3, false);
  console.log(`         spin at the four vortex centres, per frame height: field ${cu.map(v => v.toFixed(2)).join(' / ')} · steers as Session 3 wrote it, where its picture puts them ${cs.map(v => v.toFixed(4)).join(' / ')}`);
  ok(cu.every(v => Math.abs(v) > 20) && cs.every(v => Math.abs(v) < 0.02 * Math.min(...cu.map(Math.abs))), 'the motion the steers leg carries loses its whirls: each vortex becomes a saddle (its spin under 2% of the field’s)'); }

// ─────────────────────────────── around a body ───────────────────────────────
console.log('\naround a body — Session 4');
const S4DIR = join(ROOT, 'Projects/BLUELINE/proofs/session-4-figure-flow');
const J4 = JSON.parse(readFileSync(join(S4DIR, 'flow-field.json'), 'utf8'));
const NB = 128 * 160, M = B.s4Unrle(FIGURE, NB);
{ let same = true, c = 0; J4.solid.forEach((r, j) => r.forEach((b, i) => { if ((b ? 1 : 0) !== M[j * 128 + i]) same = false; if (b) c++; }));
  const filled = B.s4FillHoles(M); let fsame = true; for (let n = 0; n < NB; n++) if (filled[n] !== M[n]) fsame = false;
  ok(same && fsame, `the inlined figure is flow-field.json’s solid mask, ${c} cells, and filling holes leaves it as it is`); }
const FJ = { GW: 128, GH: 160, ASP: 0.8, vx: new Float64Array(J4.vectors.flat().map(v => v[0])), vy: new Float64Array(J4.vectors.flat().map(v => v[1])), solid: new Uint8Array(J4.solid.flat().map(b => b ? 1 : 0)) };
const Fc = B.s4Build(M, { scheme: 'central' }), Ff = B.s4Build(M, { scheme: 'faces' }), F0 = B.s4Build(M, { project: false });
{ let md = 0; for (let n = 0; n < NB; n++) md = Math.max(md, Math.abs(FJ.vx[n] - Fc.vx[n]), Math.abs(FJ.vy[n] - Fc.vy[n]));
  console.log(`         'as Session 4 wrote it' vs flow-field.json: largest difference ${md.toExponential(2)}; fastest ${Fc.magMax.toFixed(4)} vs ${J4.mag_max.toFixed(4)} (${Fc.iters} SOR sweeps)`);
  ok(md < 1e-5, 'the piece’s field as Session 4 wrote it is flow-field.json, cell for cell'); }
const f2 = (W) => `windward ${W.windward.toFixed(3)} · lee ${W.lee.toFixed(3)} · above ${W.above.toFixed(3)} · below ${W.below.toFixed(3)} · mean into ${W.intoMean.toFixed(3)}`;
const Wj = B.s4Wall(FJ), W0 = B.s4Wall(F0), Wc = B.s4Wall(Fc), Wf = B.s4Wall(Ff);
console.log(`         toward the body, × the wind (+ = into it):\n           flow-field.json itself   ${f2(Wj)}\n           zeroed, no solve         ${f2(W0)}\n           solve as written         ${f2(Wc)}\n           solve kept on faces      ${f2(Wf)}`);
ok(Wj.windward > 3 && Wj.lee < -5, 'Session 4’s own field runs into the body’s windward side (over 3× the wind) and out of its lee (over 5×): not tangent');
ok(Wj.intoMean > 5 * W0.intoMean, 'the solve as written raises the flow into the body over merely zeroing it');
ok(Math.abs(Wf.windward) < 0.1 && Math.abs(Wf.lee) < 0.1 && Wf.intoMean < 0.1, 'the same matrix kept on faces: under 0.1× the wind into the body on every side');
console.log(`         mean |divergence| by central differences: zeroed ${B.s4DivMean(F0).toFixed(4)} · as written ${B.s4DivMean(Fc).toFixed(4)} · kept on faces ${B.s4DivMean(Ff).toFixed(4)}`);
ok(B.s4DivMean(Fc) > 5 * B.s4DivMean(F0), 'as written, the solve leaves more divergence in the air than it was asked to cancel (field.py prints the same two numbers)');
{ const dc = B.s4DustRun(Fc, 's4', 6000, 1500), df = B.s4DustRun(Ff, 's4', 6000, 1500), ac = B.s4DustRun(Fc, 'advect', 6000, 1500), af = B.s4DustRun(Ff, 'advect', 6000, 1500);
  console.log(`         dust as written (reads the mask): ${dc.hitsPer1000.toFixed(3)} hits per 1,000 grain-steps on the field as written, ${df.hitsPer1000.toFixed(3)} kept on faces (×${(dc.hitsPer1000 / df.hitsPer1000).toFixed(1)})`);
  console.log(`         dust reading only the arrows: ${(ac.insideFrac * 100).toFixed(2)}% inside the body on the field as written, ${(af.insideFrac * 100).toFixed(3)}% kept on faces`);
  ok(dc.hitsPer1000 > 2 * df.hitsPer1000, 'the windward pile is the dust leg’s contact rule: over twice the hits on the field that runs into the body');
  ok(ac.insideFrac > 0.1 && af.insideFrac < 0.001, 'legs that read only the arrows: about 17% of the dust ends inside the body as written, under 0.1% kept on faces (the verdict’s numbers)'); }
{ const seeds = B.s4DrawnSeeds(40, 50), c = B.s4Drawn(Fc, seeds, false), f = B.s4Drawn(Ff, seeds, false), cm = B.s4Drawn(Fc, seeds, true);
  console.log(`         speed-lines reading only the arrows: ${(c.crossFrac * 100).toFixed(1)}% of lines begun in the air run into the body as written, ${(f.crossFrac * 100).toFixed(1)}% kept on faces; reading the mask, ${(cm.crossFrac * 100).toFixed(1)}%`);
  ok(cm.crossFrac === 0 && c.crossFrac > f.crossFrac, 'the drawn leg’s mask rule is what keeps Session 4’s lines out of the body'); }
{ const st = B.s4Prepare(M, { scheme: 'faces' }); while (B.s4Iterate(st, 10, 1e-4) >= 1e-4); const Fl = B.s4Finish(st); let d = 0; for (let n = 0; n < NB; n++) d = Math.max(d, Math.abs(Fl.vx[n] - Ff.vx[n]), Math.abs(Fl.vy[n] - Ff.vy[n]));
  ok(d < 2e-3, `the page’s settling tolerance (1e-4) lands within ${d.toExponential(1)} of the converged field`); }
{ const C = B.s4Circle(0.3, 0.5, 0.1), cf = B.s4Build(C, { scheme: 'faces', ambient: false, wake: false }), cw = B.s4Wall(cf);
  let side = 0; for (let j = 0; j < 160; j++) { const x = 0.3, y = j / 159; if (Math.abs(y - 0.5) > 0.1 && Math.abs(y - 0.5) < 0.13) { const [vx] = B.s4Sample(cf, x, y); side = Math.max(side, vx); } }
  console.log(`         a stone in plain wind, kept on faces: windward ${cw.windward.toFixed(3)}×, fastest just past its top and bottom ${side.toFixed(2)}× (potential flow gives 2× at the surface itself, falling off outside it)`);
  ok(side > 1.6 && side < 3 && cw.windward < 0.3, 'the stone: slow on the windward face, faster than the wind past its top and bottom'); }

console.log(fails ? `\n${fails} FAILED` : '\nall checks pass');
process.exit(fails ? 1 : 0);
