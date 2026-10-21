// measure-edge.mjs — find the edge by bisecting, for every setting the page offers, and fold the
// table into the page's EDGE block so it can hold a stretch "just under the edge" anywhere.
//   node measure-edge.mjs            (~10 minutes on 8 cores; writes edge-table.json + the page block)
//
// The edge is edgemap.py's: hold a fixed stretch for 4 s; the tone has torn when the wobble of
// its fundamental (std of 10 ms means over the last 2 s) passes 0.5 Hz. For each setting, step
// up in quarter decades of stretch until the first tear, then halve the last step five times
// (to within 2%). Two settings have no edge to find, and are stored as sentinels: -99 when the
// tone is torn even with no stretch (over-coupled), 99 when it never tears up to B = 1000.
import { fork } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { cpus } from 'node:os';
import { fileURLToPath } from 'node:url';
import { common, hold, PAGE } from './edge-lab.mjs';

const K = [1, 2, 4, 6, 10, 16, 25], N = [6, 12, 24, 40, 64, 96];
const torn = (C, o, s) => hold(C, { ...o, s }, 4, 44100).wobble > 0.5;

function findEdge(C, o, guess) {
  let lo = guess - 1.5;
  while (torn(C, o, lo)) { lo -= 1; if (lo < -9.01) return { s: -99 }; }
  let hi = lo + 0.25;
  while (!torn(C, o, hi)) { lo = hi; hi += 0.25; if (hi > 3) return { s: 99 }; }
  for (let i = 0; i < 5; i++) { const mid = (lo + hi) / 2; if (torn(C, o, mid)) hi = mid; else lo = mid; }
  return { s: Number(((lo + hi) / 2).toFixed(4)) };
}
const guessOf = (k, n) => -4.74 + 0.6 * Math.log10(k / 6) - 3 * Math.log10(n / 40);

function jobs() {
  const J = [];
  for (const pinned of [false, true]) for (const [src, gamma] of [['warm', 0], ['warm', 0.25], ['warm', 0.5], ['warm', 1]])
    for (const n of N) for (const k of K) J.push({ kind: 'stiff', key: `${src}|${pinned ? 'pinned' : 'free'}|g${gamma}`, src, gamma, pinned, n, k });
  const C = common();
  for (const [mat, m] of Object.entries(C.DATA.materials)) for (const k of K) J.push({ kind: 'material', key: mat, mat, n: m.cents.length, k });
  return J;
}

function run(C, j) {
  if (j.kind === 'stiff') {
    const r = findEdge(C, { N: j.n, K: j.k, pinned: j.pinned, src: j.src, gamma: j.gamma }, guessOf(j.k, j.n));
    return { ...j, edge: r.s };
  }
  // a measured object: its rank-filed bend × depth, pinned, its own levels; the edge is in log10 depth
  const m = C.DATA.materials[j.mat];
  const r = findEdge(C, { N: j.n, K: j.k, pinned: true, law: 1, tab: m.cents, amps: m.amps, f0: 110 }, -2);
  return { ...j, edge: r.s };
}

if (process.argv[2] === '--worker') {
  const C = common();
  process.on('message', (j) => process.send(run(C, j)));
} else {
  const all = jobs(), out = [], t0 = Date.now(), W = Math.max(2, Math.min(10, cpus().length - 2));
  let next = 0;
  await new Promise((done) => {
    let live = 0;
    for (let w = 0; w < W; w++) {
      const c = fork(fileURLToPath(import.meta.url), ['--worker']); live++;
      const feed = () => { if (next < all.length) c.send(all[next++]); else { c.kill(); if (--live === 0) done(); } };
      c.on('message', (r) => { out.push(r); process.stdout.write(`\r${out.length}/${all.length}  ${((Date.now() - t0) / 1000).toFixed(0)} s`); feed(); });
      feed();
    }
  });
  console.log();
  const tables = {}, materials = {};
  for (const r of out) {
    if (r.kind === 'stiff') { (tables[r.key] ??= N.map(() => K.map(() => null)))[N.indexOf(r.n)][K.indexOf(r.k)] = r.edge; }
    else (materials[r.key] ??= K.map(() => null))[K.indexOf(r.k)] = r.edge;
  }
  // with uniform coupling the source's levels never enter the pull, so the bright tone shares the warm table
  for (const p of ['free', 'pinned']) tables[`bright|${p}|g0`] = tables[`warm|${p}|g0`];
  const EDGE = { measured: new Date().toISOString().slice(0, 10), rule: 'first stretch whose 4 s hold wobbles > 0.5 Hz (std of 10 ms means, last 2 s), 44.1 kHz, seed-7 voicing; log10 B (stiff) or log10 depth (materials); -99 torn with no stretch, 99 never tears up to B = 1000', K, N, tables, materials };
  writeFileSync(new URL('./edge-table.json', import.meta.url), JSON.stringify(EDGE, null, 1));
  const html = readFileSync(PAGE, 'utf8');
  writeFileSync(PAGE, html.replace(/\/\*EDGE:start\*\/[\s\S]*?\/\*EDGE:end\*\//, `/*EDGE:start*/const EDGE = ${JSON.stringify(EDGE)};/*EDGE:end*/`));
  console.log('edge-table.json written and folded into the page');
  for (const [k, T] of Object.entries(tables)) if (!k.startsWith('bright')) console.log(k, '\n' + T.map((row, i) => `  N=${N[i]}: ` + row.map((v) => (v === 99 ? '  none' : v === -99 ? '  torn' : v.toFixed(2).padStart(6))).join(' ')).join('\n'));
  for (const [k, v] of Object.entries(materials)) console.log(k, v.map((x) => x.toFixed(2)).join(' '));
}
