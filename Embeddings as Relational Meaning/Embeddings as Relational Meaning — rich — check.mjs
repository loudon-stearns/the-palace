#!/usr/bin/env node
// Embeddings as Relational Meaning — rich — check.mjs
// born: 2026-11-03 · links: [[Embeddings as Relational Meaning]] (connects-to · rich-face-check) · listed in [[Embeddings as Relational Meaning — rich.json]]
// forward_vector: I hold the two pieces to their claims from their own files alone. I run each piece's
// engine on its own inlined data, recount every number it shows against the numbers it carries, re-score
// the analogy test a second way (float64, my own loop, not the engine), and apply each verdict rule as the
// piece states it. Every rule here can fail; I print the number that decides it and the number that would
// have meant failure.
//
//   node "Embeddings as Relational Meaning/Embeddings as Relational Meaning — rich — check.mjs"     exit 1 on a failure

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const ENTRY = 'Embeddings as Relational Meaning';
const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const read = p => readFileSync(join(HERE, `${ENTRY} — rich — ${p}.html`), 'utf8');
const part = (h, re) => (h.match(re) || [])[1];
const H = { directions: read('directions'), regions: read('regions') };
const ENG = /<script id="engine">([\s\S]*?)<\/script>/, DAT = /<script id="data" type="application\/json">([\s\S]*?)<\/script>/;

console.log('the files');
ok(part(H.directions, ENG) === part(H.regions, ENG), 'both pieces carry the same engine');
ok(part(H.directions, DAT) === part(H.regions, DAT), 'both pieces carry the same data');
for (const [k, h] of Object.entries(H)) ok(h.length < 25e6, `${k}: ${(h.length / 1e6).toFixed(2)} MB, under 25 MB`);
for (const [k, h] of Object.entries(H)) ok(!/<script[^>]+src=/.test(h) && !/rich:hush/.test(h), `${k}: no external script, no hand-rolled hush`);

const ctx = { Buffer, Math, Float32Array, Int16Array, Uint16Array, Uint8Array, Map, Array }; vm.createContext(ctx);
vm.runInContext(part(H.directions, ENG) + ';this.Engine=Engine;', ctx);
const E = ctx.Engine, data = JSON.parse(part(H.directions, DAT)), X = data.expect;
const S = E.make(data), Sx = E.shuffledComponents(S, data.seed);
const pct = (a, n) => (100 * a / n).toFixed(1) + '%';

console.log('\ndirections · the analogy test (top-1 · top-5)');
const cand = S.n - 3;
console.log(`  pool ${S.n} words, ${cand} candidates per quad; chance top-1 ${(100 / cand).toFixed(3)}%, top-5 ${(500 / cand).toFixed(2)}%`);
const pageIds = data.pageQuad.map(w => S.index.get(w));
let tot = { n: 0, d: 0, c: 0, x: 0 };
for (const s of data.sections) {
  const qs = E.decodeQuads(data.quads[s]);
  ok(qs.every(q => q.every(i => !pageIds.includes(i))), `${s}: no quad holds king, man, woman or queen`);
  const r = { direction: E.tally(S, qs, 'direction', 0, qs.length), cOnly: E.tally(S, qs, 'c-only', 0, qs.length), shuffled: E.tally(Sx, qs, 'direction', 0, qs.length) };
  for (const a of ['direction', 'cOnly', 'shuffled']) ok(r[a].top1 === X.sections[s][a].top1 && r[a].top5 === X.sections[s][a].top5, `${s} · ${a}: ${pct(r[a].top1, qs.length)} · ${pct(r[a].top5, qs.length)} (matches the baked count)`);
  const n = qs.length, p1 = r.direction.top1 / n, p2 = r.cOnly.top1 / n, se = Math.sqrt(p1 * (1 - p1) / n + p2 * (1 - p2) / n), z = (p1 - p2) / se;
  ok(z > 3, `${s}: the arrow beats c alone by ${(100 * (p1 - p2)).toFixed(1)} points = ${z.toFixed(1)} SE (fails at 3 SE or less)`);
  ok(r.shuffled.top1 / n < 0.01, `${s}: shuffled control ${pct(r.shuffled.top1, n)} at top-1 (fails at 1% or more)`);
  tot.n += n; tot.d += r.direction.top1; tot.c += r.cOnly.top1; tot.x += r.shuffled.top1;
}
console.log(`  all four: n ${tot.n} · the arrow ${pct(tot.d, tot.n)} · c alone ${pct(tot.c, tot.n)} · shuffled ${pct(tot.x, tot.n)}`);

console.log('\ndirections · a second scorer (float64, its own loop, not the engine)');
{ const raw = new Int16Array(new Uint8Array(Buffer.from(data.q, 'base64')).buffer), D = data.dim, n = data.vocab.length, M = new Float64Array(n * D);
  for (let i = 0; i < n; i++) { let s = 0; for (let d = 0; d < D; d++) { M[i * D + d] = raw[i * D + d] / 32767; s += M[i * D + d] ** 2; } s = Math.sqrt(s); for (let d = 0; d < D; d++) M[i * D + d] /= s; }
  for (const s of data.sections) { const u = new Uint16Array(new Uint8Array(Buffer.from(data.quads[s], 'base64')).buffer); let hit = 0, m = u.length / 4;
    for (let k = 0; k < m; k++) { const [a, b, c, dd] = [u[4 * k], u[4 * k + 1], u[4 * k + 2], u[4 * k + 3]]; let best = -1, bs = -Infinity;
      for (let i = 0; i < n; i++) { if (i === a || i === b || i === c) continue; let t = 0; for (let d = 0; d < D; d++) t += M[i * D + d] * (M[b * D + d] - M[a * D + d] + M[c * D + d]); if (t > bs) { bs = t; best = i; } }
      if (best === dd) hit++; }
    ok(hit === X.sections[s].direction.top1, `${s}: float64 top-1 ${hit} = engine ${X.sections[s].direction.top1}`); } }

console.log('\ndirections · the page\'s sum (a demonstration, not scored)');
const k = w => S.index.get(w), tgt = E.offset(S, k('man'), k('king'), k('woman'));
const exc = E.nearest(S, tgt, [k('king'), k('man'), k('woman')], 3).map(r => r.w), inc = E.nearest(S, tgt, [], 3).map(r => r.w);
ok(exc[0] === 'queen', `inputs excluded: ${exc.join(', ')}`);
ok(inc[0] === 'king', `inputs included: ${inc.join(', ')} (the leak the test avoids; the piece's step 4 says king comes first)`);

console.log('\nregions');
const cats = Object.fromEntries(Object.entries(data.cats).map(([c, ws]) => [c, ws.map(w => S.index.get(w))]));
const L = E.loo(S, cats), Lx = E.loo(Sx, cats), hit = L.filter(r => r.got === r.cat).length, hitx = Lx.filter(r => r.got === r.cat).length;
ok(hit === X.regions.loo && hitx === X.regions.looShuffled, `leave-one-out ${hit}/36, shuffled ${hitx}/36 (match the baked counts)`);
ok(hit >= 20, `regions are real: ${hit} of 36 in their own region (fails below 20; chance 12)`);
ok(hitx < 20, `shuffled control ${hitx} of 36 stays under the rule (a control that passed would mean the rule is too loose)`);
console.log('  placed elsewhere: ' + (L.filter(r => r.got !== r.cat).map(r => `${r.w} (${r.cat} → ${r.got})`).join(', ') || 'none'));
const Q2 = E.sense(S, data.sense), Q2x = E.sense(Sx, data.sense);
for (const r of [...Q2.test, ...Q2.control]) console.log(`  ${r.w.padEnd(9)} to interval names ${r.names.toFixed(3)} · to plain ordinals ${r.plain.toFixed(3)}`);
ok(Q2.controlToNames >= 7, `question two's control arm: ${Q2.controlToNames} of 9 on the interval side (no verdict below 7)`);
console.log(`  question two: ${Q2.testToPlain} of 6 ordinal-named interval words nearer the plain ordinals (4 or more: the ordinal sense wins; 2 or fewer: the interval sense holds)`);
ok(Q2.testToPlain === X.regions.sense.testToPlain && Q2.controlToNames === X.regions.sense.controlToNames && Q2x.controlToNames === X.regions.senseShuffled.controlToNames, 'question two matches the baked counts');
ok(Q2x.controlToNames < 7, `shuffled: control arm ${Q2x.controlToNames} of 9, so no verdict there (a shuffled control arm that separated would mean the rule is too loose)`);
const fifthNN = E.nearest(S, E.row(S, k('fifth')), [k('fifth')], 8).map(r => r.w);
console.log('  fifth\'s nearest: ' + fifthNN.join(', '));
console.log(`  bank · loan ${E.cos(S, k('bank'), k('loan')).toFixed(3)} · bank · river ${E.cos(S, k('bank'), k('river')).toFixed(3)}`);
const P = E.pca2(S, Object.values(cats).flat());
console.log(`  the flat map keeps ${(100 * (P.share[0] + P.share[1])).toFixed(1)}% of the spread`);

console.log(fails.length ? `\n${fails.length} FAILED` : '\nall checks passed');
process.exit(fails.length ? 1 : 0);
