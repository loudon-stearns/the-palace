// Murmuration — rich — check
//
// title: Murmuration — rich — check
// born: 2026-11-03
// links: [[Murmuration]] (connects-to, rich-face-check)
// forward_vector: "I re-check every claim the rich face's made pieces make, on their own code: that their flock is
//   the engine's flock exactly, that the section's own numbers hold, and that the measurements embedded in the
//   pieces come back the same when re-run. With --build I make those measurements and write them in."
//
//   node "Projects/Murmuration/Murmuration — rich — check.mjs"            re-check (about a minute)
//   node "Projects/Murmuration/Murmuration — rich — check.mjs" --build    measure and write DATA into the pieces
//        [--fss <cache.json>]   reuse a finite-size sweep already run with this code (sizes 30…240 take about 4 min)
//        [--hyst <cache.json>]  reuse the up-and-down sweeps already run with this code (240 birds take ~4 min)
"use strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const E = require(path.join(HERE, "engine", "murmur_engine.js"));
const KNEE = path.join(HERE, "Murmuration — rich — the knee.html");
const PLANE = path.join(HERE, "Murmuration — rich — one plane.html");
const args = process.argv.slice(2), BUILD = args.includes("--build"), opt = k => args.includes(k) ? args[args.indexOf(k) + 1] : null;
const FSS_CACHE = opt("--fss"), HYST_CACHE = opt("--hyst");

// pull a piece's pure math block out and run it here
function mathOf(file) {
  const src = fs.readFileSync(file, "utf8");
  const a = src.indexOf("// ---- math (pure"), b = src.indexOf("// ---- end math ----");
  if (a < 0 || b < 0) throw new Error("no math block in " + path.basename(file));
  const block = src.slice(a, b);
  const names = ["makeFlock", "stepFlock", "phiOf", "fieldFor", "etaOfX", "mapOrder", "mapPlace", "cloudOf", "DATA"].filter(n => new RegExp(`(function|const) ${n}\\b`).test(block));
  return new Function(block + `\nreturn { ${names.join(", ")} };`)();
}
let fails = 0;
const ok = (cond, what) => { console.log(`${cond ? "  ok  " : "  FAIL"} ${what}`); if (!cond) fails++; };

const K = mathOf(KNEE), P = mathOf(PLANE);

// 1. each piece's flock is the engine's flock exactly
console.log("\n1. the pieces' flock against the engine (seed 7, 1200 frames)");
for (const [name, M] of [["the knee", K], ["one plane", P]]) {
  let worst = 0;
  for (const [eta, coh] of [[0, 1], [0.06, 1], [0.2, 2.5], [0.8, 0.3]]) {
    const a = new E.Flock(60, 7), b = M.makeFlock(60, 7, 920, 520), w = { sep: 1.5, ali: 1, coh, eta };
    for (let f = 0; f < 1200; f++) { a.step(w); M.stepFlock(b, w); }
    for (let i = 0; i < 60; i++) worst = Math.max(worst, Math.abs(a.boids[i].x - b.boids[i].x), Math.abs(a.boids[i].y - b.boids[i].y), Math.abs(a.boids[i].vx - b.boids[i].vx), Math.abs(a.boids[i].vy - b.boids[i].vy));
  }
  ok(worst === 0, `${name}: largest difference from the engine ${worst}`);
}
// the mappings against the engine's mapBoids
{
  const a = new E.Flock(60, 7), memE = {}, memK = {};
  let worstO = 0, worstP = 0;
  for (let f = 0; f < 600; f++) {
    a.step({ sep: 1.5, ali: 1, coh: 1, eta: 0.06 });
    const eo = E.mapBoids(a.boids, { mapping: "order", base: 110, pitch: 19 }, memE), ko = K.mapOrder(a.boids, memK, 920, 520, 110);
    const ep = E.mapBoids(a.boids, { mapping: "page", base: 110, pitch: 19 }, {}), pp = P.mapPlace(a.boids, 920, 520, 110);
    for (let i = 0; i < eo.length; i++) { worstO = Math.max(worstO, Math.abs(eo[i] - ko[i])); worstP = Math.max(worstP, Math.abs(ep[i] - pp[i])); }
  }
  ok(worstO === 0, `the knee's order mapping against the engine's: largest difference ${worstO}`);
  ok(worstP === 0, `one plane's place mapping against the engine's: largest difference ${worstP}`);
}

// 2. the section's own numbers
console.log("\n2. the section's numbers, on this flock");
const textClaims = {};
{
  const f = K.makeFlock(60, 7, 920, 520), p0 = K.phiOf(f); let t09 = null;
  for (let i = 0; i < 60 * 60; i++) { K.stepFlock(f, { sep: 1.5, ali: 1, coh: 1, eta: 0 }); if (t09 === null && K.phiOf(f) > 0.9) t09 = (i + 1) / 60; }
  const pEnd = K.phiOf(f);
  const g = K.makeFlock(60, 7, 920, 520); let s = 0, n = 0; for (let i = 0; i < 60 * 60; i++) { K.stepFlock(g, { sep: 1.5, ali: 1, coh: 1, eta: 0.8 }); if (i >= 60 * 20) { s += K.phiOf(g); n++; } }
  Object.assign(textClaims, { phiStart: +p0.toFixed(3), firstAbove09s: +t09.toFixed(1), phiAfter60s: +pEnd.toFixed(3), phiAt080: +(s / n).toFixed(3) });
  ok(Math.abs(p0 - 0.10) < 0.01 && pEnd > 0.9, `η 0, seed 7: φ starts at ${p0.toFixed(3)} and climbs past 0.9 at ${t09.toFixed(1)} s (${pEnd.toFixed(3)} after 60 s); the text: 0.10 → 0.93`);
  ok(Math.abs(s / n - 0.10) < 0.03, `η 0.80, seed 7: φ averages ${(s / n).toFixed(3)} over 20–60 s; the text: ≈ 0.10; the floor for 60 random headings √(π/240) = ${Math.sqrt(Math.PI / 240).toFixed(3)}`);
}

// 3. the measurements: the knee's finite-size sweep and the plane's cohesion sweep
const ETAS = []; for (let e = 0; e <= 0.2001; e += 0.01) ETAS.push(+e.toFixed(2)); ETAS.push(0.25, 0.3, 0.4);
const SEEDS = [7, 8, 9, 10, 11, 12], BURN = 60 * 30, MEAS = 60 * 20, W = { sep: 1.5, ali: 1, coh: 1 };
function fssPoint(N, eta) {
  const [Wd, Ht] = K.fieldFor(N); let ps = [], vs = [];
  for (const sd of SEEDS) { const fl = K.makeFlock(N, sd, Wd, Ht); for (let f = 0; f < BURN; f++) K.stepFlock(fl, { ...W, eta }); let s = 0, s2 = 0; for (let f = 0; f < MEAS; f++) { K.stepFlock(fl, { ...W, eta }); const p = K.phiOf(fl); s += p; s2 += p * p; } const m = s / MEAS; ps.push(m); vs.push(s2 / MEAS - m * m); }
  const phi = ps.reduce((a, b) => a + b) / ps.length, v = vs.reduce((a, b) => a + b) / vs.length;
  return { eta, phi: +phi.toFixed(4), chi: +(N * v).toFixed(3) };
}
const COHS = []; for (let c = 0; c <= 3.0001; c += 0.25) COHS.push(+c.toFixed(2));
function cohPoint(coh) {
  const r = [7, 8, 9, 10].map(sd => { const fl = P.makeFlock(60, sd, 920, 520); for (let f = 0; f < 60 * 30; f++) P.stepFlock(fl, { sep: 1.5, ali: 1, coh, eta: 0.06 }); let sp = 0, ps = 0, nb = 0, n = 0; for (let f = 0; f < 60 * 10; f++) { P.stepFlock(fl, { sep: 1.5, ali: 1, coh, eta: 0.06 }); if (f % 10) continue; const m = P.cloudOf(fl, P.mapPlace(fl.boids, 920, 520, 110)); sp += m.spread; ps += m.pitchSd; nb += m.nb; n++; } return [sp / n, ps / n, nb / n]; });
  const mean = k => r.reduce((a, x) => a + x[k], 0) / r.length, sd = k => Math.sqrt(r.reduce((a, x) => a + (x[k] - mean(k)) ** 2, 0) / r.length);
  return { coh, spread: +mean(0).toFixed(1), spreadSd: +sd(0).toFixed(1), pitchSd: +mean(1).toFixed(2), pitchSdSd: +sd(1).toFixed(2), nb: +mean(2).toFixed(2) };
}
// up from order and down from melt, eight starts each, 20 s to settle and 20 s measured at every step
const HETAS = [0.03, 0.04, 0.05, 0.06, 0.07, 0.08, 0.09, 0.1, 0.11, 0.12], HSEEDS = [7, 8, 9, 10, 11, 12, 13, 14];
function hystRun(N) {
  const [Wd, Ht] = K.fieldFor(N);
  const run = (seed, list, start) => { const fl = K.makeFlock(N, seed, Wd, Ht); for (let f = 0; f < 60 * 40; f++) K.stepFlock(fl, { ...W, eta: start }); return list.map(eta => { for (let f = 0; f < 60 * 20; f++) K.stepFlock(fl, { ...W, eta }); let s = 0; for (let f = 0; f < 60 * 20; f++) { K.stepFlock(fl, { ...W, eta }); s += K.phiOf(fl); } return s / 1200; }); };
  const up = HSEEDS.map(s => run(s, HETAS, 0)), down = HSEEDS.map(s => run(s, [...HETAS].reverse(), 0.3).reverse());
  return HETAS.map((e, i) => { const u = up.map(r => r[i]), d = down.map(r => r[i]), df = u.map((x, k) => x - d[k]), m = df.reduce((a, b) => a + b) / df.length, sd = Math.sqrt(df.reduce((a, b) => a + (b - m) ** 2, 0) / (df.length - 1));
    return { eta: e, up: +(u.reduce((a, b) => a + b) / u.length).toFixed(3), down: +(d.reduce((a, b) => a + b) / d.length).toFixed(3), diff: +m.toFixed(3), se: +(sd / Math.sqrt(df.length)).toFixed(3) }; });
}
const sweep = JSON.parse(fs.readFileSync(path.join(HERE, "engine", "eta_sweep.json"), "utf8"));   // the steward's: 8 seeds, 40 s settle

function crossings(rows) {          // normalised drop: 1 at η 0, 0 at η 0.4
  const top = rows[0].phi, bot = rows.find(r => r.eta === 0.4).phi, n = r => (r.phi - bot) / (top - bot);
  const at = lvl => { for (let i = 1; i < rows.length; i++) if (n(rows[i]) <= lvl) { const a = rows[i - 1], b = rows[i]; return a.eta + (n(a) - lvl) / (n(a) - n(b)) * (b.eta - a.eta); } return NaN; };
  return { e90: at(0.9), e50: at(0.5), e10: at(0.1) };
}
function summarise(fss, hyst) {
  const sizes = Object.keys(fss).map(Number).sort((a, b) => a - b).map(N => {
    const rows = fss[N], c = crossings(rows), pk = rows.filter(r => r.eta <= 0.3).reduce((a, r) => r.chi > a.chi ? r : a), [Wd, Ht] = K.fieldFor(N);
    return { N, field: `${Math.round(Wd)} × ${Math.round(Ht)}`, half: c.e50, width: c.e10 - c.e90, chiAt: pk.eta, chiMax: pk.chi, floor: rows.find(r => r.eta === 0.4).phi };
  });
  // the knee on the instrument's slider and on the old linear knob, from the steward's 8-seed sweep
  const ref = sweep.fresh.map(r => ({ eta: r.eta, phi: r.phi })), c = crossings(ref);
  const xOf = e => Math.sqrt(e / 0.25), slider = xOf(c.e10) - xOf(c.e90), linear = c.e10 - c.e90;
  // the steward's one-start sweep, for the record, and the eight-start sweeps that test it
  const one = sweep.up.map(u => ({ eta: u.eta, d: u.phi - sweep.down.find(d => d.eta === u.eta).phi })), oneMax = one.reduce((a, r) => Math.abs(r.d) > Math.abs(a.d) ? r : a);
  const hs = Object.keys(hyst).map(Number).sort((a, b) => a - b).map(N => { const rows = hyst[N], worst = rows.reduce((a, r) => Math.abs(r.diff) > Math.abs(a.diff) ? r : a), z = Math.max(...rows.map(r => Math.abs(r.diff) / Math.max(r.se, 1e-3))), signs = new Set(rows.filter(r => Math.abs(r.diff) > r.se).map(r => Math.sign(r.diff))).size; return { N, worst, z, mixed: signs > 1 || rows.every(r => Math.abs(r.diff) <= r.se) }; });
    const small = sizes[0], big = sizes[sizes.length - 1];
  const chiGrows = sizes.every((s, i) => i === 0 || s.chiMax > sizes[i - 1].chiMax * 0.95), narrows = big.width < small.width * 0.8;
  const chiPeaksAtKnee = sizes.every(s => Math.abs(s.chiAt - s.half) <= 0.02);
  const f2 = v => v.toFixed(2), f3 = v => v.toFixed(3), pct = v => Math.round(v * 100) + "%";
  const marks = [
    { label: "a knee", holds: true, text: `Measure the drop from 90% of the way between melted and ordered down to 10%. On the instrument's slider (η = 0.25·x²) the flock makes it over ${pct(slider)} of the travel, from x ${f2(xOf(c.e90))} to ${f2(xOf(c.e10))}; a crossfade would take 80%. On the first build's linear knob, η 0 to 1, the same drop took ${pct(linear)} of the travel: the remap that put the knee at mid-slider also made it about ${Math.round(slider / linear)} times gentler under the hand.` },
    { label: chiPeaksAtKnee ? "the wobble peaks at the knee" : "the wobble", holds: chiPeaksAtKnee, text: `At every size the wobble, N times the variance of φ, peaks at η ${sizes.map(s => f2(s.chiAt)).join(", ")}, within 0.02 of where φ is halfway down (η ${sizes.map(s => f3(s.half)).join(", ")}). A knob has no wobble at all; a flock at its critical point can't settle.` },
    { label: chiGrows && narrows ? "it sharpens as the flock grows" : "growth", holds: chiGrows && narrows, text: `From ${small.N} birds to ${big.N}, at the same crowding, the peak wobble grows ${f2(small.chiMax)} → ${sizes.slice(1).map(s => f2(s.chiMax)).join(" → ")}, and the drop from 90% to 10% narrows from η ${f3(small.width)} to ${f3(big.width)}. The melted floor sinks with size as random headings should (${sizes.map(s => f3(s.floor)).join(", ")}), so in a flock without end the melted side would read 0. That is what a phase transition does and a curved knob does not.` },
    hysMark(hs, oneMax, f2, f3),
    { label: "what this can't show", holds: null, text: `The word "snap" is the steep knee, not a jump: a continuous transition has no jump. And a flock of ${big.N} is small: at 480 birds the flock had not finished ordering after 30 s even with no disorder (φ 0.88, still wobbling), so that size is left out rather than shown unsettled. Grégoire and Chaté (2004) found that the Vicsek transition turns discontinuous, first-order, in large enough flocks, and that finding was disputed. What "second-order" can mean here is what this flock does at the sizes the instrument plays, 8 to 120 birds.` },
  ];
  return { sizes, slider: { x90: xOf(c.e90), x10: xOf(c.e10), share: slider, linearShare: linear }, hysteresis: hs.map(h => ({ N: h.N, worstEta: h.worst.eta, worstDiff: h.worst.diff, z: +h.z.toFixed(2) })), marks };
}
// the memory test, said per size: a gap of three standard errors or more, at a step, is memory
function hysMark(hs, oneMax, f2, f3) {
  const clean = hs.filter(h => h.z < 3), kept = hs.filter(h => h.z >= 3);
  const say = h => `at ${h.N} birds the worst gap is ${f3(h.worst.diff)} at η ${f2(h.worst.eta)}, ${f2(h.z)} standard errors`;
  const lead = `Raised step by step from order and lowered step by step from melt, eight starts each way, 20 s to settle and 20 s measured at every step: ${hs.map(say).join("; ")}.`;
  const tail = ` (The steward's one-start sweep had the way up above the way down by as much as ${f3(oneMax.d)} at η ${f2(oneMax.eta)}.)`;
  if (!kept.length) return { label: "no memory", holds: true, text: `${lead} No gap is beyond chance, so at these sizes the flock comes back the way it went, as a continuous, "second-order" turn does.${tail}` };
  return { label: "memory, in the bigger flock", holds: null, text: `${lead} ${clean.length ? `At ${clean.map(h => h.N).join(" and ")} birds nothing is beyond chance: the flock comes back the way it went, as "second-order" says. ` : ""}At ${kept.map(h => h.N).join(" and ")} the way up stays more ordered than the way down at the knee, more than chance allows: the bigger flock remembers which side it came from, for twenty seconds at least. This sweep can't tell slow settling near the knee from the start of a jump.${tail}` };
}
function summariseCoh(coh) {
  const randomSpread = Math.sqrt((920 * 920 + 520 * 520) / 12), randomPitchSd = 19 / Math.sqrt(12);
  const d = coh.find(r => r.coh === 1), lo = coh.find(r => r.coh === 1.5), hi = coh.find(r => r.coh === 3), two = coh.find(r => r.coh === 2);
  const flat = coh.filter(r => r.coh <= 1.25), flatTo = flat[flat.length - 1];
  const marks = [
    { label: "cohesion gathers the flock", holds: hi.spread < 0.5 * d.spread, text: `It does, at the top of the knob. At cohesion 3 the flock's spread on the plane is ${Math.round(hi.spread)} px and its pitches spread ${hi.pitchSd.toFixed(1)} semitones, against ${Math.round(d.spread)} px and ${d.pitchSd.toFixed(1)} at the default 1.0. Clustered birds read nearby waveforms at nearby pitches, as the section says.` },
    { label: "only over the top of the knob", holds: null, text: `Up to ${flatTo.coh} the flock stays spread nearly as wide as sixty birds dropped at random (${Math.round(Math.min(...flat.map(r => r.spread)))}–${Math.round(Math.max(...flat.map(r => r.spread)))} px against ${Math.round(randomSpread)}; pitches ${Math.min(...flat.map(r => r.pitchSd)).toFixed(1)}–${Math.max(...flat.map(r => r.pitchSd)).toFixed(1)} semitones against ${randomPitchSd.toFixed(1)}). It starts to gather at ${lo.coh} (${Math.round(lo.spread)} px) and falls away at 2 (${Math.round(two.spread)} px, ${two.pitchSd.toFixed(1)} semitones). Between 2 and 3 the four starts disagree by up to ${Math.round(Math.max(...coh.filter(r => r.coh >= 2).map(r => r.spreadSd)))} px: the flock splits into a few clumps, a chord more than a tone. The instrument's default, 1.0, sits on the flat, cloud end of the knob.` },
    { label: "a flocking parameter, not a crossfade", holds: true, text: `Nothing in the sound is faded: the knob changes how hard each bird steers toward its neighbours, and the cloud follows from where the birds go. The curves are not straight lines in the knob either.` },
    { label: "what this measures", holds: null, text: `Pitch spread is a measure of focus, read off the grain voices' pitches under the section's own mapping (height is pitch). It is not a measure of how broadband the sound is, and nobody has listened for that here. The instrument's default mapping is now "order" (heading is pitch); this piece doesn't measure cohesion under it.` },
  ];
  return { coh, randomSpread, randomPitchSd, marks };
}
function writeData(file, data) {
  const src = fs.readFileSync(file, "utf8"), a = src.indexOf("/*DATA*/"), b = src.indexOf("/*END*/");
  fs.writeFileSync(file, src.slice(0, a + 8) + JSON.stringify(data) + src.slice(b));
}

if (BUILD) {
  console.log("\n3. measuring (build)");
  let fss = FSS_CACHE ? JSON.parse(fs.readFileSync(FSS_CACHE, "utf8")) : null;
  if (!fss) { fss = {}; for (const N of [30, 60, 120, 240]) { const t0 = Date.now(); fss[N] = ETAS.map(e => fssPoint(N, e)); console.log(`  ${N} birds: ${((Date.now() - t0) / 1000).toFixed(0)} s`); } }
  else { const N = 60, e = 0.06, again = fssPoint(N, e), had = fss[N].find(r => r.eta === e); ok(again.phi === had.phi && again.chi === had.chi, `the cache reproduces: 60 birds at η 0.06 → φ ${again.phi}, wobble ${again.chi}`); }
  const hyst = HYST_CACHE ? JSON.parse(fs.readFileSync(HYST_CACHE, "utf8")) : { 60: hystRun(60), 120: hystRun(120), 240: hystRun(240) };
  const coh = COHS.map(cohPoint);
  const ref60 = sweep.fresh.map(r => ({ eta: r.eta, phi: r.phi, fluct: r.fluct }));
  writeData(KNEE, { ref60, fss, hyst, summary: summarise(fss, hyst), textClaims });
  writeData(PLANE, summariseCoh(coh));
  console.log("  written into both pieces");
} else {
  console.log("\n3. the embedded measurements come back the same");
  const KD = K.DATA, PD = P.DATA;
  ok(!!KD && !!PD, "both pieces carry their DATA");
  if (KD) {
    for (const [N, e] of [[60, 0.06], [30, 0.1]]) { const again = fssPoint(N, e), had = KD.fss[N].find(r => r.eta === e); ok(again.phi === had.phi && again.chi === had.chi, `the knee: ${N} birds at η ${e} → φ ${again.phi} (embedded ${had.phi}), wobble ${again.chi} (embedded ${had.chi})`); }
    { const again = hystRun(60), had = KD.hyst[60]; ok(JSON.stringify(again) === JSON.stringify(had), `the knee: the up-and-down sweeps at 60 birds come back the same (worst gap ${had.reduce((a, r) => Math.max(a, Math.abs(r.diff)), 0)})`); }
    const re = summarise(KD.fss, KD.hyst); ok(JSON.stringify(re.marks) === JSON.stringify(KD.summary.marks), "the knee's words are what its embedded numbers say");
    for (const m of KD.summary.marks) console.log(`        ${m.holds === true ? "holds" : m.holds === false ? "FAILS" : "  —  "} · ${m.label}`);
  }
  if (PD) {
    const again = cohPoint(2), had = PD.coh.find(r => r.coh === 2); ok(again.spread === had.spread && again.pitchSd === had.pitchSd, `one plane: cohesion 2 → spread ${again.spread} px (embedded ${had.spread}), pitches ${again.pitchSd} semitones (embedded ${had.pitchSd})`);
    const re = summariseCoh(PD.coh); ok(JSON.stringify(re.marks) === JSON.stringify(PD.marks), "one plane's words are what its embedded numbers say");
    for (const m of PD.marks) console.log(`        ${m.holds === true ? "holds" : m.holds === false ? "FAILS" : "  —  "} · ${m.label}`);
  }
}
console.log(`\n${fails ? fails + " failed" : "all checks pass"}`);
process.exit(fails ? 1 : 0);
