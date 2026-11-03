#!/usr/bin/env node
// The Lens — rich — check.mjs
// born: 2026-11-03 · links: [[The Lens]] (connects-to · rich-face-check) · listed in [[The Lens — rich.json]]
// forward_vector: I hold The Lens's two made pieces to their claims, on their own code. For "move the
// glass" I run the page's engine block against The Lens.md as it is now: every paragraph found, every
// faithful reading different over every paragraph, the formula identical everywhere, the borrower
// changing as written and the same once each paragraph's words are taken out. For "nearest on the graph"
// I rebuild the typed-link graph live with STIGMERGY's own reader and ranking (readLiveMap,
// rankLensCandidates) and hold the piece's snapshot and its own BFS to them. I print every number the
// commit and the offers quote.
//
//   node "The Lens/The Lens — rich — check.mjs"            check, exit 1 on a failure
//   node "The Lens/The Lens — rich — check.mjs" --write    also rewrite the graph snapshot first

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(HERE);
const BUNDLE = HERE;
const fails = [];
const ok = (cond, what) => { console.log((cond ? '  ok   ' : '  FAIL ') + what); if (!cond) fails.push(what); };
const f2 = (x) => x.toFixed(2);

// ── 1. move the glass ──────────────────────────────────────────────────────
console.log('move the glass · engine against The Lens.md');
const html = readFileSync(join(BUNDLE, 'The Lens — rich — move the glass.html'), 'utf8');
const engineSrc = html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const ctx = {}; vm.createContext(ctx); vm.runInContext(engineSrc + '\nthis.LensEngine = LensEngine;', ctx);
const E = ctx.LensEngine;
const md = readFileSync(join(ROOT, 'The Lens.md'), 'utf8');
const patches = E.readPatches(md);
for (const p of patches) ok(p.found && !p.moved, `${p.id} found under § ${p.section} ("${p.anchor}")`);
const live = patches.filter((p) => p.found);
for (const [key, g] of Object.entries(E.GLASSES)) {
  const texts = live.map((p) => E.reading(key, p).text);
  const distinct = new Set(texts).size;
  if (g.rule === 'formula') ok(distinct === 1, `${key} (formula) reads the same over all ${live.length}`);
  else ok(distinct === live.length, `${key} (${g.rule}) reads differently over all ${live.length}`);
  const s = E.sameness(key, patches);
  console.log(`       ${key.padEnd(10)} ${g.rule.padEnd(9)} alike as written ${f2(s.raw)} · without the paragraph's words ${f2(s.own)}`);
}
const S = Object.fromEntries(Object.keys(E.GLASSES).map((k) => [k, E.sameness(k, patches)]));
ok(S.deflator.raw === 1 && S.kFormula.raw === 1, 'a formula glass is 1.00 alike as written');
ok(S.ohmBorrow.raw < 0.8 && S.kBorrow.raw < 0.8, `a borrower changes as written (Ohm ${f2(S.ohmBorrow.raw)}, Kuramoto ${f2(S.kBorrow.raw)})`);
ok(Math.abs(S.ohmBorrow.own - S.deflator.own) < 0.1 && Math.abs(S.kBorrow.own - S.kFormula.own) < 0.1,
  `once each paragraph's words are out, a borrower sits beside the formula (Ohm ${f2(S.ohmBorrow.own)} by the deflator's ${f2(S.deflator.own)}, Kuramoto ${f2(S.kBorrow.own)} by its formula's ${f2(S.kFormula.own)})`);
ok(S.ohmBorrow.own - S.ohmBorrow.raw > 0.2 && S.kBorrow.own - S.kBorrow.raw > 0.2, 'taking the words out moves a borrower toward the formula by more than 0.2');
for (const k of ['simondon', 'trickster', 'ohm', 'kFaithful']) ok(S[k].own < 0.25, `${k} (faithful) stays apart without the paragraph's words (${f2(S[k].own)})`);
const words = live.map((p) => `${p.id}: ${E.commonest(p.text).join(', ')} · “${E.firstSentence(p.text)}”`);
console.log('       the borrower fills in:\n         ' + words.join('\n         '));
// The page's one-sentence test, taken literally: "the reading must change". Does it pass the borrower?
const changes = (k) => new Set(live.map((p) => E.reading(k, p).text)).size === live.length;
console.log(`       the sentence's test, "the reading must change": formula ${changes('kFormula') ? 'passes' : 'fails'}, borrower ${changes('kBorrow') ? 'passes' : 'fails'}, faithful ${changes('kFaithful') ? 'passes' : 'fails'}`);
const lens = { words: live.map((p) => E.contentWords(E.reading('kFaithful', p).text).length), formula: E.contentWords(E.GLASSES.kFormula.text).length, borrow: live.map((p) => E.contentWords(E.reading('kBorrow', p).text).length) };
console.log(`       content words per test reading · faithful ${lens.words.join('/')} · formula ${lens.formula} · borrowed ${lens.borrow.join('/')}`);

// ── 2. nearest on the graph ────────────────────────────────────────────────
console.log('\nnearest on the graph · snapshot against the live graph');
const APP = join(ROOT, '_ops/stigmergy/app/src/lib');
const { readLiveMap } = await import(join(APP, 'topology-live.js'));
const { rankLensCandidates } = await import(join(APP, 'lens-suggest.js'));
const map = readLiveMap(ROOT);
const SNAP = join(BUNDLE, 'The Lens — rich — link graph.json');

if (process.argv.includes('--write')) {
  const head = execFileSync('git', ['-C', ROOT, 'rev-parse', '--short', 'HEAD'], { encoding: 'utf8' }).trim();
  const names = map.nodes.map((n) => n.id);
  const index = new Map(names.map((n, i) => [n, i]));
  const ghosts = [];
  const at = (id) => { if (!index.has(id)) { index.set(id, names.length + ghosts.length); ghosts.push(id); } return index.get(id); };
  const types = [];
  const typeAt = (t) => { let i = types.indexOf(t); if (i < 0) { types.push(t); i = types.length - 1; } return i; };
  const edges = map.edges.filter((e) => typeof e.source === 'string' && typeof e.target === 'string').map((e) => [at(e.source), at(e.target), typeAt(e.type || '')]);
  const snap = {
    title: 'The Lens — rich — link graph',
    born: '2026-11-03',
    links: [{ target: '[[The Lens]]', type: 'connects-to', label: 'rich-face-data' }],
    forward_vector: 'I am the typed-link graph as STIGMERGY\'s [L]ens picker read it on the day I was taken: every entry, every typed link, and the link targets that are not entries (which the picker\'s walk still passes through). The rich face cannot reach the live graph, so it reads me, and says my date. Retake me with the check\'s --write when the graph has moved enough to matter.',
    taken: { date: '2026-11-03', head, by: 'The Lens — rich — check.mjs --write', reader: '_ops/stigmergy/app/src/lib/topology-live.js readLiveMap', rule: '_ops/stigmergy/app/src/lib/lens-suggest.js rankLensCandidates: undirected, through every link target, ties A to Z' },
    nodes: map.nodes.map((n) => [n.id, n.type]),
    ghosts,
    types,
    edges,
  };
  writeFileSync(SNAP, JSON.stringify(snap) + '\n');
  console.log(`  wrote the snapshot: ${map.nodes.length} entries, ${ghosts.length} link targets that are not entries, ${edges.length} links`);
}

const snap = JSON.parse(readFileSync(SNAP, 'utf8'));
const graph = readFileSync(join(BUNDLE, 'The Lens — rich — nearest on the graph.html'), 'utf8');
const gsrc = graph.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const gctx = {}; vm.createContext(gctx); vm.runInContext(gsrc + '\nthis.GraphEngine = GraphEngine;', gctx);
const G = gctx.GraphEngine.load(snap);
ok(snap.nodes.length === map.nodes.length, `snapshot has the live graph's ${map.nodes.length} entries (${snap.nodes.length})`);
let mismatch = 0, checked = 0;
for (const n of map.nodes) {
  const want = rankLensCandidates(map, n.id, 100000);
  const got = gctx.GraphEngine.rank(G, n.id);
  checked++;
  if (want.length !== got.length || want.some((w, i) => w.title !== got[i].title || w.distance !== got[i].distance)) mismatch++;
}
ok(mismatch === 0, `the piece's ranking equals rankLensCandidates for all ${checked} subjects (${mismatch} differ)`);
const st = gctx.GraphEngine.stats(G);
console.log(`       ${st.n} entries · ${st.n * (st.n - 1)} ordered pairs · mean share within 1 hop ${f2(st.mean1)} · within 2 hops ${f2(st.mean2)} (median ${f2(st.median2)}, range ${f2(st.min2)}–${f2(st.max2)}) · unreachable pairs ${st.unreachable} · farthest ${st.maxHop} hops`);
const L = gctx.GraphEngine.rings(G, 'The Lens');
console.log(`       The Lens: ${L.map((c, i) => `${i + 1} hop ${c}`).join(' · ')} · its picker's eight: ${rankLensCandidates(map, 'The Lens', 8).map((c) => c.title).join(', ')}`);
const tied = rankLensCandidates(map, 'The Lens', 100000).filter((c) => c.distance === 1).length;
console.log(`       tied at 1 hop from The Lens: ${tied}`);
for (const s of gctx.GraphEngine.SPARKS) {
  const d = rankLensCandidates(map, s.subject, 100000).find((c) => c.title === s.glass);
  console.log(`       spark ${String(s.spark).padEnd(3)} ${s.glass} through ${s.subject}: ${d ? d.distance + ' hop' : 'not on the graph'}`);
}

console.log(fails.length ? `\n${fails.length} failed` : '\nall held');
process.exit(fails.length ? 1 : 0);
