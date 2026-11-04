#!/usr/bin/env node
// Embeddings as Relational Meaning — rich — extract.mjs
// born: 2026-11-03 · links: [[Embeddings as Relational Meaning]] (connects-to · rich-face-data) · listed in [[Embeddings as Relational Meaning — rich.json]]
// forward_vector: I rebuild the real vectors the two pieces carry inline. I read the npm package
// wink-embeddings-sg-100d 1.1.0 (MIT, GRAYPE Systems; derived from Stanford GloVe pre-trained vectors,
// PDDL 1.0) and Mikolov's word2vec analogy set questions-words.txt (Apache 2.0), keep only the words the
// pieces need, and write them into each piece's <script id="data">. The word lists and the quad sections
// are fixed here, before any score was read. The expected numbers I write are computed by the pieces'
// own engine (read out of the directions piece), so the check and the pieces cannot disagree.
//
//   node --max-old-space-size=6000 "Embeddings as Relational Meaning/Embeddings as Relational Meaning — rich — extract.mjs" \
//        <path to the unpacked npm package folder> <path to questions-words.txt> [--wide]
//   --wide also scores the direction and the c-only reader over the 100,000 most frequent all-letter words
//   (full precision, about four minutes) and writes those numbers too.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const ENTRY = 'Embeddings as Relational Meaning';
const PIECES = ['directions', 'regions'].map(p => join(HERE, `${ENTRY} — rich — ${p}.html`));
const [PKG, QW] = process.argv.slice(2).filter(a => !a.startsWith('--'));
const WIDE = process.argv.includes('--wide');
if (!PKG || !QW) { console.error('usage: extract.mjs <package dir> <questions-words.txt> [--wide]'); process.exit(2); }

// ── fixed before measuring ────────────────────────────────────────────────
const SECTIONS = ['capital-common-countries', 'family', 'gram3-comparative', 'gram8-plural'];
const PAGE_QUAD = ['king', 'man', 'woman', 'queen']; // the page states king − man + woman ≈ queen: no scored quad holds any of these words
const BACKGROUND = 3000;                             // the 3,000 most frequent all-letter words, as distractors
const CATS = {
  animals: ['dog', 'cat', 'horse', 'cow', 'sheep', 'lion', 'tiger', 'wolf', 'rabbit', 'mouse', 'eagle', 'whale'],
  emotions: ['joy', 'anger', 'fear', 'sadness', 'grief', 'love', 'pride', 'shame', 'envy', 'disgust', 'surprise', 'hope'],
  intervals: ['unison', 'semitone', 'tone', 'third', 'fourth', 'tritone', 'fifth', 'sixth', 'seventh', 'octave', 'ninth', 'interval'],
};
// question two, which sense the static point carries: the interval names split by whether they are also ordinals,
// against plain ordinals that name no interval; the control arm must sit on the interval side or there is no verdict
const SENSE = { names: ['unison', 'semitone', 'tone', 'tritone', 'octave', 'interval'], ordinalNamed: ['third', 'fourth', 'fifth', 'sixth', 'seventh', 'ninth'],
  plain: ['first', 'twentieth', 'thirtieth', 'fortieth', 'hundredth'], music: ['chord', 'pitch', 'melody'] };
const EXTRA = ['he', 'she', 'bank', 'river', 'loan', 'money', 'water', 'music', 'sound', 'rhythm', 'meaning', 'word', 'link'];
const SEED = 20261103;

const t0 = Date.now();
const J = JSON.parse(readFileSync(join(PKG, 'wink-embeddings-sg-100d.json'), 'utf8'));
const DIM = J.dimensions;
console.log(`package parsed in ${Date.now() - t0} ms · ${J.words.length} words · ${DIM} dimensions`);

let sec = null, droppedPage = 0, droppedOov = 0; const quadWords = {};
for (const l of readFileSync(QW, 'utf8').split('\n')) {
  if (l.startsWith(':')) { sec = l.slice(1).trim(); continue; }
  if (!SECTIONS.includes(sec) || !l.trim()) continue;
  const q = l.trim().toLowerCase().split(/\s+/);
  if (q.some(w => PAGE_QUAD.includes(w))) { droppedPage++; continue; }
  if (q.some(w => !J.vectors[w])) { droppedOov++; continue; }
  (quadWords[sec] ||= []).push(q);
}
const vocab = [], seen = new Set();
const add = w => { if (!seen.has(w)) { if (!J.vectors[w]) throw new Error('not in the package: ' + w); seen.add(w); vocab.push(w); } };
for (const w of J.words) { if (vocab.length >= BACKGROUND) break; if (/^[a-z]+$/.test(w)) add(w); }
const nBackground = vocab.length;
for (const s of SECTIONS) quadWords[s].forEach(q => q.forEach(add));
[...Object.values(CATS).flat(), ...Object.values(SENSE).flat(), ...PAGE_QUAD, ...EXTRA].forEach(add);
const idx = new Map(vocab.map((w, i) => [w, i]));

// unit length, then 16-bit: x · 32767, rounded (the engine divides back and re-normalises)
const q16 = new Int16Array(vocab.length * DIM);
vocab.forEach((w, i) => { const v = J.vectors[w].slice(0, DIM); const n = Math.hypot(...v); v.forEach((x, d) => { q16[i * DIM + d] = Math.round(x / n * 32767); }); });
const enc = a => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('base64');
const quads = {}; for (const s of SECTIONS) { const u = new Uint16Array(quadWords[s].length * 4); quadWords[s].forEach((q, k) => q.forEach((w, j) => { u[k * 4 + j] = idx.get(w); })); quads[s] = enc(u); }

const data = {
  source: 'wink-embeddings-sg-100d 1.1.0 (npm; MIT, GRAYPE Systems) — derived from Stanford GloVe pre-trained vectors (PDDL 1.0); analogy quads: word2vec questions-words.txt (Mikolov et al. 2013; Apache 2.0)',
  dim: DIM, vocab, nBackground, q: enc(q16), sections: SECTIONS, quads, pageQuad: PAGE_QUAD,
  dropped: { pageWords: droppedPage, outOfVocabulary: droppedOov },
  cats: CATS, sense: SENSE, seed: SEED,
};

// ── expected numbers, through the pieces' own engine ───────────────────────
const html0 = readFileSync(PIECES[0], 'utf8');
const engineSrc = html0.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const ctx = { Buffer, Math, Float32Array, Int16Array, Uint16Array, Uint8Array, Map, Array }; vm.createContext(ctx); vm.runInContext(engineSrc + ';this.Engine=Engine;', ctx);
const E = ctx.Engine; const S = E.make(data); const Sx = E.shuffledComponents(S, SEED);
const expect = { chance: { pool: S.n, candidates: S.n - 3 }, sections: {} };
for (const s of SECTIONS) { const qs = E.decodeQuads(quads[s]);
  expect.sections[s] = { n: qs.length, direction: E.tally(S, qs, 'direction', 0, qs.length), cOnly: E.tally(S, qs, 'c-only', 0, qs.length), shuffled: E.tally(Sx, qs, 'direction', 0, qs.length) }; }
const k = n => idx.get(n);
expect.pageQuad = { excluded: E.nearest(S, E.offset(S, k('man'), k('king'), k('woman')), [k('king'), k('man'), k('woman')], 5).map(x => [x.w, +x.cos.toFixed(3)]),
  included: E.nearest(S, E.offset(S, k('man'), k('king'), k('woman')), [], 5).map(x => [x.w, +x.cos.toFixed(3)]) };
const catIds = Object.fromEntries(Object.entries(CATS).map(([c, ws]) => [c, ws.map(w => idx.get(w))]));
const L = E.loo(S, catIds), Lx = E.loo(Sx, catIds);
expect.regions = { loo: L.filter(r => r.got === r.cat).length, of: L.length, misses: L.filter(r => r.got !== r.cat).map(r => [r.w, r.cat, r.got]),
  looShuffled: Lx.filter(r => r.got === r.cat).length,
  sense: E.sense(S, SENSE), senseShuffled: E.sense(Sx, SENSE) };

if (WIDE) { // a wider pool of distractors, full precision, outside the engine (the pieces can't carry it)
  const big = [], bs = new Set();
  for (const w of J.words) { if (big.length >= 100000) break; if (/^[a-z]+$/.test(w)) { big.push(w); bs.add(w); } }
  for (const s of SECTIONS) quadWords[s].forEach(q => q.forEach(w => { if (!bs.has(w)) { bs.add(w); big.push(w); } }));
  const M = new Float64Array(big.length * DIM); big.forEach((w, i) => { const v = J.vectors[w]; let n = 0; for (let d = 0; d < DIM; d++) n += v[d] * v[d]; n = Math.sqrt(n); for (let d = 0; d < DIM; d++) M[i * DIM + d] = v[d] / n; });
  const bi = new Map(big.map((w, i) => [w, i]));
  const top = (t, ex) => { const best = []; for (let i = 0; i < big.length; i++) { if (ex.includes(i)) continue; let s = 0; for (let d = 0; d < DIM; d++) s += M[i * DIM + d] * t[d]; if (best.length < 5 || s > best[4][0]) { best.push([s, i]); best.sort((x, y) => y[0] - x[0]); if (best.length > 5) best.pop(); } } return best.map(x => x[1]); };
  const wide = { pool: big.length, sections: {} };
  for (const s of SECTIONS) { const r = { direction: { top1: 0, top5: 0 }, cOnly: { top1: 0, top5: 0 }, n: quadWords[s].length };
    for (const q of quadWords[s]) { const [a, b, c, d] = q.map(w => bi.get(w));
      const tD = new Float64Array(DIM); for (let j = 0; j < DIM; j++) tD[j] = M[b * DIM + j] - M[a * DIM + j] + M[c * DIM + j];
      const tC = M.subarray(c * DIM, c * DIM + DIM);
      for (const [arm, t] of [['direction', tD], ['cOnly', tC]]) { const tt = top(t, [a, b, c]); if (tt[0] === d) r[arm].top1++; if (tt.includes(d)) r[arm].top5++; } }
    wide.sections[s] = r; console.log('wide', s, JSON.stringify(r)); }
  expect.wide = wide;
} else {
  const prev = readFileSync(PIECES[0], 'utf8').match(/<script id="data" type="application\/json">([\s\S]*?)<\/script>/);
  try { const old = JSON.parse(prev[1]); if (old.expect && old.expect.wide) expect.wide = old.expect.wide; } catch {}
}
data.expect = expect;

const json = JSON.stringify(data).replace(/</g, '\\u003c');
for (const p of PIECES) {
  const h = readFileSync(p, 'utf8');
  const out = h.replace(/(<script id="data" type="application\/json">)[\s\S]*?(<\/script>)/, (m, a, b) => a + json + b);
  writeFileSync(p, out); console.log('wrote', p.split('/').pop(), (out.length / 1e6).toFixed(2), 'MB');
}
console.log(JSON.stringify({ vocab: vocab.length, nBackground, dropped: data.dropped, expect }, null, 1));
