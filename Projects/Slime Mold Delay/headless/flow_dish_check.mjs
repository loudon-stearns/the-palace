// Slime Mold Delay — check the browser dish's engine against cycle 8's scenes.
// Loads only the <script id="engine"> block from slime-mold-flow-dish.html (no DOM,
// no audio), feeds it the loudness the python score() would produce, and reports
// what grew, what was cut, and where the network ended. Run: node flow_dish_check.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, '..', 'slime-mold-flow-dish.html'), 'utf8');
const src = html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1];
const module = { exports: null };
new Function('module', src)(module);
const SlimeEngine = module.exports;

const SR = 48000, TICK = 30, BLOCK = SR / TICK;
const FOOD = [[0.10, 0.30], [0.18, 0.76], [0.86, 0.22], [0.92, 0.66], [0.55, 0.90]];
const HZ = [110, 146.83, 196, 164.81, 130.81];

function rng32(s) { return () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// per-tick RMS at each flake, from the same plucks the python score() makes
function score(scene, dur, seed) {
  const r = rng32(seed), ticks = dur * TICK, n = ticks * BLOCK;
  const lv = FOOD.map(() => new Float32Array(ticks));
  FOOD.forEach((_, i) => {
    const sig = new Float32Array(n);
    for (let t = 0.25 + 0.17 * i; t < dur - 1.2; t += 0.45 + 0.4 * r()) {
      const a = scene(t)[i]; if (a <= 0.05 || r() >= a) continue;
      const s0 = Math.floor(t * SR), len = Math.min(1.3 * SR, n - s0);
      for (let k = 0; k < len; k++) {
        const tt = k / SR, f = HZ[i];
        let s = Math.sin(2 * Math.PI * f * tt) + 0.34 * Math.sin(4 * Math.PI * f * tt) + 0.12 * Math.sin(2 * Math.PI * 3.01 * f * tt);
        s += 0.22 * (r() * 2 - 1) * 1.7 * Math.exp(-tt * 110);
        sig[s0 + k] += s * Math.exp(-tt * 6) * 0.42 * (0.6 + 0.4 * a);
      }
    }
    for (let k = 0; k < ticks; k++) {
      let e = 0; for (let j = k * BLOCK; j < (k + 1) * BLOCK; j++) e += sig[j] * sig[j];
      lv[i][k] = Math.sqrt(e / BLOCK);
    }
  });
  return lv;
}

function run(label, scene, { dur = 30, hunger = () => 1, budget = 2.4, seed = 11, share = 'all', passThrough = true } = {}) {
  const E = SlimeEngine.create({ seed, share, passThrough });
  const foods = FOOD.map(([x, y]) => E.addFood(x, y));
  E.addTube(foods[0], E.sink, 0.5);
  const lv = score(scene, dur, seed + 1);
  const events = [], trace = [];
  E.hooks.event = (tt, kind, t) => events.push([+tt.toFixed(2), kind, t ? `${name(t.a)}-${name(t.b)}` : '']);
  const name = n => n === E.sink ? 'sink' : n.kind === 'food' ? 'F' + (foods.indexOf(n) + 1) : 'j' + n.id;
  let maxD = 0, finite = true;
  for (let k = 0; k < dur * TICK; k++) {
    const m = new Map(foods.map((f, i) => [f.id, lv[i][k]]));
    E.step(m, { hunger: hunger(k / TICK), budget });
    for (const t of E.tubes) { maxD = Math.max(maxD, t.D); if (!Number.isFinite(t.D)) finite = false; }
    if (k % 15 === 0) {
      const side = s => E.tubes.filter(t => s.includes(t.a) || s.includes(t.b)).reduce((a, t) => a + t.D, 0);
      trace.push([+(k / TICK).toFixed(1), E.tubes.length, +side([foods[0], foods[1]]).toFixed(2), +side([foods[2], foods[3]]).toFixed(2)]);
    }
  }
  let firstRight = null;
  for (const e of events) if (e[0] >= 15 && e[1] === 'capture' && /F3|F4/.test(e[2])) { firstRight = +(e[0] - 15).toFixed(2); break; }
  const lastTrace = trace[trace.length - 1];
  return { label, share, seed, firstRight, endLeft: lastTrace[2], endRight: lastTrace[3], counts: E.counts, finite, maxD: +maxD.toFixed(3), max_used: +E.used.toFixed(3),
    final: E.tubes.map(t => `${name(t.a)}-${name(t.b)} D=${t.D.toFixed(2)}`), events, trace };
}

const LEFT = () => [1, 0.9, 0.06, 0.06, 0.15], RIGHT = () => [0.06, 0.06, 0.9, 1, 0.15];
const MOVES = t => t < 15 ? LEFT() : RIGHT();
const sweep = {};
const LAWS = { 'cycle 8 law': { share: 'fed', passThrough: false }, 'whole-dish share': { share: 'all', passThrough: false },
  'tips pass through': { share: 'fed', passThrough: true }, 'both (the page)': { share: 'all', passThrough: true } };
for (const [share, law] of Object.entries(LAWS)) {
  const rs = Array.from({ length: 40 }, (_, i) => run('moves', MOVES, { seed: 100 + i, ...law }));
  const won = rs.filter(r => r.endRight > r.endLeft);
  const fr = rs.map(r => r.firstRight).filter(x => x !== null).sort((a, b) => a - b);
  // when did the left roads fall below the right ones, after the switch?
  const flip = rs.map(r => { const k = r.trace.find(([t, , L, Rr]) => t >= 15 && Rr > L); return k ? +(k[0] - 15).toFixed(1) : null; });
  const fl = flip.filter(x => x !== null).sort((a, b) => a - b);
  sweep[share] = { dishes: rs.length, ended_right: won.length, reached_right: fr.length,
    median_first_reach_s: fr[Math.floor(fr.length / 2)] ?? null, median_flip_s: fl[Math.floor(fl.length / 2)] ?? null,
    flips: flip, grown: rs.map(r => r.counts.captured), cut: rs.map(r => r.counts.retracted) };
  console.log(`moves × 40 seeds, ${share.padEnd(18)}:`, JSON.stringify({ ended_right: won.length, reached_right: fr.length, median_first_reach_s: sweep[share].median_first_reach_s, median_flip_s: sweep[share].median_flip_s }));
}
const runs = [
  run('left', LEFT), run('right', RIGHT),
  run('moves', MOVES), run('moves (cycle 8 law)', MOVES, { share: 'fed', passThrough: false }),
  run('feast-famine', () => [0.7, 0.6, 0.6, 0.7, 0.6], { hunger: t => (t % 12) < 6 ? 1 : 0 }),
  run('tight-budget', () => [0.8, 0.8, 0.8, 0.8, 0.8], { budget: 1.15 }),
];
for (const R of runs) console.log(R.label.padEnd(22), JSON.stringify(R.counts), 'finite', R.finite, 'maxD', R.maxD, '\n   final:', R.final.join(' · '));
writeFileSync(join(here, '2026-10-13-flow-dish-check.json'), JSON.stringify({ sweep, runs }, null, 1));
