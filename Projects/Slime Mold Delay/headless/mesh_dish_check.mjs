// Slime Mold Delay — cycle 11: start dense, then thin.
// Loads the engine block from slime-mold-flow-dish.html (no DOM, no audio), lays a mesh over the dish
// with seedMesh(), and lets the flow law carve it. Compares against cycle 10's one-strand start on the
// same dishes and the same shortest-network yardstick. Run: node mesh_dish_check.mjs [spacing ...]
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'slime-mold-flow-dish.html'), 'utf8');
const module = { exports: null };
new Function('module', html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1])(module);
const SE = module.exports;

const SR = 48000, TICK = 30, BLOCK = SR / TICK;
const ROUND = { layout: [[0.10, 0.30], [0.18, 0.76], [0.86, 0.22], [0.92, 0.66], [0.55, 0.90]] };
const CLUSTER = { layout: [[0.70, 0.30], [0.80, 0.45], [0.78, 0.62], [0.66, 0.74]], sink: { x: 0.14, y: 0.50 } };
const HZ = [110, 146.83, 196, 164.81, 130.81];
function rng32(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function score(scene, dur, seed, n) {       // per-tick RMS at each flake, same plucks as cycle 10's check
  const r = rng32(seed), ticks = dur * TICK, N = ticks * BLOCK;
  return Array.from({ length: n }, (_, i) => {
    const sig = new Float32Array(N), lv = new Float32Array(ticks);
    for (let t = 0.25 + 0.17 * i; t < dur - 1.2; t += 0.45 + 0.4 * r()) {
      const a = scene(t)[i]; if (a <= 0.05 || r() >= a) continue;
      const s0 = Math.floor(t * SR), len = Math.min(1.3 * SR, N - s0);
      for (let k = 0; k < len; k++) { const tt = k / SR, f = HZ[i];
        sig[s0 + k] += (Math.sin(2 * Math.PI * f * tt) + 0.34 * Math.sin(4 * Math.PI * f * tt)) * Math.exp(-tt * 6) * 0.42 * (0.6 + 0.4 * a); }
    }
    for (let k = 0; k < ticks; k++) { let e = 0; for (let j = k * BLOCK; j < (k + 1) * BLOCK; j++) e += sig[j] * sig[j]; lv[k] = Math.sqrt(e / BLOCK); }
    return lv;
  });
}
function mstLen(pts) { const inT = new Set([0]); let L = 0;
  while (inT.size < pts.length) { let best = [Infinity, -1];
    for (const i of inT) pts.forEach((q, j) => { if (!inT.has(j)) { const d = SE.dist(pts[i], q); if (d < best[0]) best = [d, j]; } });
    L += best[0]; inT.add(best[1]); } return L; }

function run(scene, { start = 'mesh', spacing, dur = 30, budget = 2.4, seed = 11, dish = CLUSTER, keepTrace = false, law = 'sigmoid', lawGamma, meshGrace, meshAnneal, probes, drain, pulse } = {}) {
  const E = SE.create({ seed, law, ...(drain ? { drain } : {}), ...(pulse ? { pulse } : {}), ...(probes === false ? { probes: false } : {}), ...(lawGamma ? { lawGamma } : {}), ...(meshGrace != null ? { meshGrace } : {}), ...(meshAnneal != null ? { meshAnneal } : {}), ...(dish.sink ? { sink: dish.sink } : {}) });
  const foods = dish.layout.map(([x, y]) => E.addFood(x, y));
  let meshPts = 0;
  if (start === 'mesh') meshPts = E.seedMesh(spacing ?? SE.P.MESH_S); else E.addTube(foods[0], E.sink, 0.5);
  const startTubes = E.tubes.length, startLen = E.used;
  const lv = score(scene, dur, seed + 1, foods.length);
  const trace = []; let settled = null, maxD = 0, finite = true, maxN = 0;
  for (let k = 0; k < dur * TICK; k++) {
    E.step(new Map(foods.map((f, i) => [f.id, lv[i][k]])), { budget });
    maxN = Math.max(maxN, E.nodes.length);
    for (const t of E.tubes) { maxD = Math.max(maxD, t.D); if (!Number.isFinite(t.D)) finite = false; }
    if (settled === null && E.used <= budget) settled = +(k / TICK).toFixed(2);   // carved inside the budget
    if (k % 15 === 0) {
      const side = s => E.tubes.filter(t => s.includes(t.a) || s.includes(t.b)).reduce((a, t) => a + t.D, 0);
      trace.push([+(k / TICK).toFixed(1), E.tubes.length, +E.used.toFixed(2), +side([foods[0], foods[1]]).toFixed(2), +side(foods.slice(2, 4)).toFixed(2)]);
    }
  }
  // a road is any tube still alive and not starving (thicker than the prune line). Under the power law
  // a one-flake branch settles near D = share^γ, about 0.1, and still carries its flake's whole sound.
  const roadsT = E.tubes.filter(t => t.retract < 0 && (E.law === 'power' ? Math.abs(t.Q) >= SE.P.QEPS : t.D > SE.P.EPS));
  const adj = new Map(); for (const t of roadsT) { (adj.get(t.a) || adj.set(t.a, []).get(t.a)).push(t.b); (adj.get(t.b) || adj.set(t.b, []).get(t.b)).push(t.a); }
  const comp = new Set([E.sink]), st = [E.sink];
  while (st.length) for (const nb of adj.get(st.pop()) || []) if (!comp.has(nb)) { comp.add(nb); st.push(nb); }
  const heard = foods.filter((f, i) => comp.has(f) && scene(dur - 1)[i] > 0.3);
  const mst = mstLen([E.sink, ...heard]);
  const roads = roadsT.reduce((s, t) => s + t.L, 0);
  // the 'fully fed' yardstick: the shortest network joining the listener to EVERY sounding flake
  const allSounding = foods.filter((f, i) => scene(dur - 1)[i] > 0.3);
  return { start, seed, meshPts, startTubes, startLen: +startLen.toFixed(2), settled, finite, maxD: +maxD.toFixed(2), maxNodes: maxN,
    heard: heard.length, sounding: allSounding.length, roads: +roads.toFixed(3), vs_mst: mst ? +(roads / mst).toFixed(3) : null,
    vs_full_mst: +(roads / mstLen([E.sink, ...allSounding])).toFixed(3),
    endTubes: E.tubes.length, endRoads: roadsT.length, counts: E.counts, trace: keepTrace ? trace : undefined, E: keepTrace ? E : undefined };
}

const med = a => { const b = a.filter(x => x !== null && x !== undefined).sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : null; };
const ALL5 = () => [0.8, 0.8, 0.8, 0.8, 0.8], ALL4 = () => [0.8, 0.8, 0.8, 0.8];
const LEFT = () => [1, 0.9, 0.06, 0.06, 0.15], RIGHT = () => [0.06, 0.06, 0.9, 1, 0.15], MOVES = t => t < 15 ? LEFT() : RIGHT();
if (!process.env.NO_MAIN) {
const spacings = process.argv.slice(2).map(Number).filter(Boolean);
const rows = [], out = { economy: {}, moves: {} };
const DISHES = [['clustered, roomy 2.4', ALL4, { dish: CLUSTER, budget: 2.4 }], ['round, roomy 2.4', ALL5, { dish: ROUND, budget: 2.4 }]];
// the two halves of the change, apart and together: how the mold starts, and the law it thins by
const NEW_LAW = { law: 'power', drain: 'shared', pulse: true };
const STARTS = [['one strand · old law (cycle 10 page)', { start: 'strand' }], ['mesh · old law', { start: 'mesh' }],
  ['one strand · new law', { start: 'strand', ...NEW_LAW }], ['mesh · new law (cycle 11)', { start: 'mesh', ...NEW_LAW }],
  ...spacings.map(s => [`mesh · new law · spacing ${s}`, { start: 'mesh', spacing: s, ...NEW_LAW }])];
for (const [dname, sc, opt] of DISHES) for (const [sname, so] of STARTS) {
  const rs = Array.from({ length: 40 }, (_, i) => run(sc, { seed: 200 + i, ...opt, ...so }));
  const k = `${dname} · ${sname}`;
  out.economy[k] = { mean_heard: +(rs.reduce((s, r) => s + r.heard, 0) / 40).toFixed(2), of: rs[0].sounding,
    median_vs_mst: med(rs.map(r => r.vs_mst)), median_vs_full_mst: med(rs.map(r => r.vs_full_mst)),
    under_mst: rs.filter(r => r.heard >= 3 && r.vs_mst < 1).length, all_fed: rs.filter(r => r.heard === r.sounding).length,
    median_settled_s: med(rs.map(r => r.settled)), median_start_tubes: med(rs.map(r => r.startTubes)), median_end_roads: med(rs.map(r => r.endRoads)),
    finite: rs.every(r => r.finite), max_nodes: Math.max(...rs.map(r => r.maxNodes)) };
  console.log(k.padEnd(48), JSON.stringify(out.economy[k]));
}
for (const [sname, so] of STARTS) {
  const rs = Array.from({ length: 40 }, (_, i) => run(MOVES, { seed: 100 + i, dish: ROUND, keepTrace: true, ...so }));
  const flip = rs.map(r => { const k = r.trace.find(([t, , , L, Rr]) => t >= 15 && Rr > L); return k ? +(k[0] - 15).toFixed(1) : null; });
  out.moves[sname] = { ended_right: rs.filter(r => { const l = r.trace.at(-1); return l[4] > l[3]; }).length, median_flip_s: med(flip), flips: flip };
  console.log(`music moves · ${sname}`.padEnd(48), JSON.stringify({ ended_right: out.moves[sname].ended_right, median_flip_s: out.moves[sname].median_flip_s }));
}
writeFileSync(join(here, '2026-10-18-mesh-dish-check.json'), JSON.stringify(out, null, 1));
}
export { SE, run, CLUSTER, ROUND, ALL4, ALL5, MOVES };
