// Flocking — rich — check
//
// title: Flocking — rich — check
// born: 2026-11-03
// links: [[Flocking]] (connects-to, rich-face-check)
// forward_vector: "I re-check every claim the rich face's made pieces make, on their own code: that their flock is the
//   bundle's one shared Reynolds model to the last digit, that the measurements written into the pieces come back the
//   same when re-run, and that what the captions say follows from those measurements. With --build I make the
//   measurements and write them in."
//
//   node "Flocking/Flocking — rich — check.mjs"            re-check (about a minute)
//   node "Flocking/Flocking — rich — check.mjs" --build    measure and write DATA into both pieces (about 5 minutes)
"use strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const RULES = path.join(HERE, "Flocking — rich — three rules.html");
const TIE = path.join(HERE, "Flocking — rich — the threshold.html");
const PLOT = path.join(HERE, "flocking-observable-plot-analytical.html");
const BUILD = process.argv.includes("--build");

function block(file, a, z) {
  const src = fs.readFileSync(file, "utf8"), i = src.indexOf(a), j = src.indexOf(z);
  if (i < 0 || j < 0) throw new Error(`no ${a} in ${path.basename(file)}`);
  return src.slice(i, j);
}
const mathOf = file => new Function(block(file, "// ---- math (pure", "// ---- end math ----") +
  "\nreturn { makeFlock, stepFlock, polarization, groups, nearest, meanSpeed, milling, randomFloor };")();
const dataOf = file => { const s = fs.readFileSync(file, "utf8"), m = s.match(/\/\*DATA\*\/([\s\S]*?)\/\*END\*\//); return m ? JSON.parse(m[1]) : null; };
function writeData(file, data) {
  const s = fs.readFileSync(file, "utf8"), t = s.replace(/\/\*DATA\*\/[\s\S]*?\/\*END\*\//, "/*DATA*/" + JSON.stringify(data) + "/*END*/");
  if (t === s && !s.includes("/*DATA*/")) throw new Error("no DATA slot in " + path.basename(file));
  fs.writeFileSync(file, t);
}
let fails = 0;
const ok = (cond, what) => { console.log(`${cond ? "  ok  " : "  FAIL"} ${what}`); if (!cond) fails++; };
const r3 = x => Math.round(x * 1000) / 1000;
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;

const A = mathOf(RULES), B = mathOf(TIE);
const M = A;

// 1. the pieces' flock is the bundle's shared model, to the last digit
console.log("\n1. the pieces' flock against the bundle's shared model (flocking-observable-plot-analytical.html, seed 7)");
const S = new Function(block(PLOT, "/* ===== SHARED FLOCKING MODEL", "/* ===== END SHARED MODEL") + "\nreturn { initBoids, stepBoids, polarization };")();
ok(block(RULES, "// ---- math (pure", "// ---- end math ----") === block(TIE, "// ---- math (pure", "// ---- end math ----"), "both pieces carry the same math block");
for (const [name, P] of [["three rules", A], ["the threshold", B]]) {
  let worst = 0;
  for (const w of [{ sep: 1.5, ali: 1, coh: 1 }, { sep: 1.5, ali: 0.3, coh: 1 }, { sep: 0, ali: 1, coh: 3 }, { sep: 1.5, ali: 0, coh: 1 }]) {
    const bb = S.initBoids(), F = P.makeFlock();
    for (let f = 0; f < 1200; f++) { S.stepBoids(bb, w); P.stepFlock(F, w); }
    for (let i = 0; i < 80; i++) worst = Math.max(worst, Math.abs(bb[i].x - F.b[i].x), Math.abs(bb[i].y - F.b[i].y), Math.abs(bb[i].vx - F.b[i].vx), Math.abs(bb[i].vy - F.b[i].vy));
  }
  ok(worst === 0, `${name}: largest difference from the shared model over 1200 frames, four weight sets: ${worst}`);
}
{ const bb = S.initBoids(); for (let f = 0; f < 900; f++) S.stepBoids(bb, { sep: 1.5, ali: 0.3, coh: 1 });
  ok(r3(S.polarization(bb)) === 0.579, `the Plot sweep's alignment 0.3 at 900 frames (15 s) is R ${r3(S.polarization(bb))}, its report's Node reference 0.579`); }

// ---- measurements ----
const SEEDS = [7, 11, 13, 17];
const CASES = { all: { sep: 1.5, ali: 1, coh: 1 }, noSep: { sep: 0, ali: 1, coh: 1 }, noAli: { sep: 1.5, ali: 0, coh: 1 }, noCoh: { sep: 1.5, ali: 1, coh: 0 }, aliOnly: { sep: 0, ali: 1, coh: 0 } };
function knock(reach, w, seed, frames = 3600) {
  const F = M.makeFlock(80, seed, 960, 540, 50, reach);
  for (let f = 0; f < frames; f++) M.stepFlock(F, w);
  const G = M.groups(F);
  return { R: r3(M.polarization(F)), nn: r3(M.nearest(F)), alone: G.alone, largest: G.largest, groups: G.count, speed: r3(M.meanSpeed(F)), mill: r3(M.milling(F, G)) };
}
const summ = rows => { const o = {}; for (const k of Object.keys(rows[0])) { const v = rows.map(r => r[k]); o[k] = { mean: r3(mean(v)), min: Math.min(...v), max: Math.max(...v) }; } return o; };
const WGRID = [0, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.75, 1, 1.5, 2];
function curvePoint(c, ali, seed) {
  const F = M.makeFlock(c.N, seed, 960, 540, c.R, c.R), w = { sep: 1.5, ali, coh: 1, eta: c.eta };
  for (let f = 0; f < c.settle; f++) M.stepFlock(F, w);
  let s = 0, s2 = 0, n = 0;
  for (let f = 0; f < 3600; f++) { M.stepFlock(F, w); if (f % 10 === 0) { const p = M.polarization(F); s += p; s2 += p * p; n++; } }
  return { m: s / n, v: s2 / n - (s / n) ** 2 };
}
const CURVES = [
  { id: "e0", eta: 0, N: 80, R: 50, settle: 10800 },
  { id: "e01", eta: 0.01, N: 80, R: 50, settle: 3600 },
  { id: "e02", eta: 0.02, N: 80, R: 50, settle: 3600 },
  { id: "e04", eta: 0.04, N: 80, R: 50, settle: 3600 },
  { id: "n40", eta: 0.04, N: 40, R: 50, settle: 3600 },
  { id: "n160", eta: 0.04, N: 160, R: 50, settle: 3600 },
  { id: "r35", eta: 0.04, N: 80, R: 35, settle: 3600 },
  { id: "r75", eta: 0.04, N: 80, R: 75, settle: 3600 },
];
function curve(c) {
  const pts = WGRID.map(ali => { const r = SEEDS.map(s => curvePoint(c, ali, s)); return { ali, R: r3(mean(r.map(x => x.m))), sd: r3(Math.sqrt(Math.max(0, mean(r.map(x => x.v))))) }; });
  let cross = null;
  for (let k = 1; k < pts.length; k++) if (pts[k - 1].R < 0.5 && pts[k].R >= 0.5) { const a = pts[k - 1], b = pts[k]; cross = r3(a.ali + (0.5 - a.R) / (b.R - a.R) * (b.ali - a.ali)); break; }
  return { ...c, pts, cross };
}
function noiseless(ali, seed) {
  const F = M.makeFlock(80, seed), w = { sep: 1.5, ali, coh: 1 }; let t08 = null, at900 = null;
  for (let f = 1; f <= 14400; f++) { M.stepFlock(F, w); const p = M.polarization(F); if (f === 900) at900 = p; if (t08 === null && p >= 0.8) t08 = f; }
  return { t08: t08 === null ? null : r3(t08 / 60), at900: r3(at900), at4min: r3(M.polarization(F)) };
}

if (BUILD) {
  console.log("\n--build: measuring");
  const knockData = {};
  for (const reach of [50, 25]) { knockData[reach] = {}; for (const [k, w] of Object.entries(CASES)) { const rows = SEEDS.map(s => knock(reach, w, s)); knockData[reach][k] = { seeds: rows, sum: summ(rows) }; console.log(" knock", reach, k, JSON.stringify(knockData[reach][k].sum.R), "alone", knockData[reach][k].sum.alone.mean); } }
  const cohSweep = [1, 1.5, 2, 2.5, 3].map(coh => { const rows = SEEDS.map(s => knock(50, { sep: 1.5, ali: 1, coh }, s)); return { coh, sum: summ(rows) }; });
  writeData(RULES, { knock: knockData, cohSweep, seeds: SEEDS, frames: 3600 });
  const floor80 = r3(M.randomFloor(80));
  const nl = [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2].map(ali => ({ ali, seeds: SEEDS.map(s => noiseless(ali, s)) }));
  console.log(" noiseless", JSON.stringify(nl.map(r => [r.ali, r.seeds.map(s => s.t08)])));
  const curves = CURVES.map(c => { const t = Date.now(), r = curve(c); console.log(" curve", c.id, "cross", r.cross, ((Date.now() - t) / 1000).toFixed(0) + " s"); return r; });
  writeData(TIE, { floor80, noiseless: nl, curves, seeds: SEEDS, wgrid: WGRID });
}

// 2. re-run what the pieces carry
console.log("\n2. the measurements written into the pieces, re-run (seed 7 of each, exact)");
const DR = dataOf(RULES), DT = dataOf(TIE);
ok(DR && DT, "both pieces carry DATA");
for (const reach of [50, 25]) for (const [k, w] of Object.entries(CASES)) {
  const got = knock(reach, w, 7), had = DR.knock[reach][k].seeds[0];
  ok(JSON.stringify(got) === JSON.stringify(had), `knockout ${k}, separation reaching ${reach} px: ${JSON.stringify(got)}`);
}
for (const id of ["e02", "n160"]) { const c = DT.curves.find(x => x.id === id), k = 6, p = curvePoint(c, WGRID[k], 7); ok(Number.isFinite(p.m), `curve ${id} at alignment ${WGRID[k]}: seed 7 alone gives R ${r3(p.m)} (written: mean of four ${c.pts[k].R})`); }
{ const r = noiseless(0.3, 7), had = DT.noiseless.find(x => x.ali === 0.3).seeds[0]; ok(JSON.stringify(r) === JSON.stringify(had), `noiseless alignment 0.3, seed 7: ${JSON.stringify(r)}`); }

// 3. what the captions and steps say, from the data
console.log("\n3. the claims the pieces make, against their data");
const K50 = DR.knock[50], K25 = DR.knock[25];
ok(K50.noSep.sum.nn.max < 0.5 && K25.noSep.sum.nn.max < 0.5, `separation off: every bird sits on another (nearest neighbour ≤ ${Math.max(K50.noSep.sum.nn.max, K25.noSep.sum.nn.max)} px), in ${K50.noSep.sum.groups.min}–${K50.noSep.sum.groups.max} points`);
ok(K50.noAli.sum.R.max < 0.25 && K25.noAli.sum.R.max < 0.25, `alignment off: no flow (R ${K50.noAli.sum.R.min}–${K50.noAli.sum.R.max}; ${K25.noAli.sum.R.min}–${K25.noAli.sum.R.max} at 25 px)`);
ok(K50.noAli.sum.speed.max < 0.6 && K25.noAli.sum.speed.max < 0.6 && K50.noAli.sum.mill.max < 0.2 && K25.noAli.sum.mill.max < 0.2, `alignment off: not milling but nearly still (speed ${K50.noAli.sum.speed.mean} and ${K25.noAli.sum.speed.mean} of 3 px a frame; milling ≤ ${Math.max(K50.noAli.sum.mill.max, K25.noAli.sum.mill.max)})`);
ok(K50.all.sum.alone.min >= 20, `the bundle's defaults: ${K50.all.sum.alone.min}–${K50.all.sum.alone.max} of 80 birds have no one in reach, R ${K50.all.sum.R.mean}`);
ok(K25.all.sum.alone.max <= 3, `separation reaching 25 px: ${K25.all.sum.alone.min}–${K25.all.sum.alone.max} alone, ${K25.all.sum.groups.min}–${K25.all.sum.groups.max} groups`);
ok(K25.noCoh.sum.largest.min === 80 && K25.noCoh.sum.R.min > 0.95, `cohesion off at 25 px: one even sheet of all 80, R ${K25.noCoh.sum.R.min}–${K25.noCoh.sum.R.max}; not scattered`);
ok(K50.aliOnly.sum.R.min > 0.95, `alignment alone: R ${K50.aliOnly.sum.R.min}–${K50.aliOnly.sum.R.max}`);
const cs = DR.cohSweep; ok(cs[2].sum.alone.mean < K50.all.sum.alone.mean / 3, `the bundle's flock gathers when cohesion rises: alone ${cs.map(c => c.coh + ":" + c.sum.alone.mean).join(" ")}`);
const nlT = DT.noiseless; const by = a => nlT.find(r => r.ali === a).seeds;
ok(by(0.1).every(s => s.t08 !== null) && by(0.3).every(s => s.t08 !== null), `no noise: alignment 0.1 reaches R 0.8 in ${by(0.1).map(s => s.t08).join(", ")} s; 0.3 in ${by(0.3).map(s => s.t08).join(", ")} s`);
ok(by(0.05).every(s => s.at4min > s.at900), `no noise, alignment 0.05: still climbing at 4 min (${by(0.05).map(s => s.at900 + "→" + s.at4min).join(", ")})`);
const X = id => DT.curves.find(c => c.id === id).cross;
ok(X("e01") < X("e02") && X("e02") < X("e04"), `more noise, higher threshold: ${X("e01")}, ${X("e02")}, ${X("e04")}`);
ok(X("n160") < X("e04") && X("e04") < X("n40"), `denser, lower threshold: 160 birds ${X("n160")}, 80 ${X("e04")}, 40 ${X("n40")}`);
ok(X("r75") < X("e04") && X("e04") < X("r35"), `wider radius, lower threshold: 75 px ${X("r75")}, 50 ${X("e04")}, 35 ${X("r35")}`);
ok(Math.abs(DT.floor80 - Math.sqrt(Math.PI / (4 * 80))) < 0.003, `random floor for 80 birds ${DT.floor80}, √(π/4N) = ${r3(Math.sqrt(Math.PI / 320))}`);
console.log(fails ? `\n${fails} failed` : "\nall hold");
process.exit(fails ? 1 : 0);
