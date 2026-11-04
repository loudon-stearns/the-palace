// Biomechanical Synthesis — rich — check.mjs
// born: 2026-11-04 · checks [[Biomechanical Synthesis]]' rich-face pieces "two faces" and "negative space"
// forward_vector: I re-run, headless, every number the two made pieces print and every claim they make about the
// sections they serve: that the plain face and the body face are one compressor (a null that a millimetre wall must
// fail), that the static curve is the equation, that the pulse the vessel feels does not move with attack, that the
// three-try rule sits at 1 in 3 for a reader the face doesn't move; and, for the network, both runs of the rule the
// piece states, the controls it needs, and how far the answer holds when the network's constants change. What a
// listener hears, and what a reader sets, I cannot check.
//
//   node "Projects/Biomechanical Synthesis/Biomechanical Synthesis — rich — check.mjs"
//
// It pulls each page's core <script id="bms-comp"> / <script id="bms-net"> out of the HTML and runs it in a Node
// sandbox. PASS/FAIL per claim; exits 1 on any FAIL. Reads only; writes nothing.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
function core(file, id, name) {
  const html = readFileSync(join(HERE, file), 'utf8');
  const m = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)<\\/script>`));
  if (!m) throw new Error(`no <script id="${id}"> in ${file}`);
  const E = { Math, Float64Array, Uint8Array, Object, JSON };
  vm.createContext(E); vm.runInContext(m[1] + `\nthis.X = ${name};`, E); return { X: E.X, html };
}

// ── two faces ──
const { X: C, html: H1 } = core('Biomechanical Synthesis — rich — two faces.html', 'bms-comp', 'COMP');
const SR = 48000, x = C.loop(SR);
const SETS = [C.START, { threshold: -24, ratio: 4, attack: 10, release: 150 }, { threshold: -20, ratio: 4, attack: 5, release: 80 },
  { threshold: -20, ratio: 4, attack: 30, release: 400 }, { threshold: -12, ratio: 8, attack: 1, release: 50 }, { threshold: -40, ratio: 20, attack: 200, release: 1000 }];
let worst = -999;
for (const s of SETS) { const d = C.nullDb(C.plain(x, s, SR).y, C.body(x, C.toBody(s), SR, false).y); worst = Math.max(worst, d); }
check('two faces: the body is the plain compressor, null under −120 dB on six settings', worst < -120, `worst residual ${worst.toFixed(1)} dB`);
const ctl = SETS.slice(2, 5).map((s) => C.nullDb(C.plain(x, s, SR).y, C.body(x, C.toBody(s), SR, true).y));
check('two faces: the null can fail — a wall that moves in millimetres is caught on engaged settings (> −60 dB)', ctl.every((d) => d > -60), ctl.map((d) => d.toFixed(1) + ' dB').join(', '));
const rt = SETS.every((s) => { const b = C.fromBody(C.toBody(s)); return Object.keys(s).every((k) => Math.abs(b[k] - s[k]) < 1e-9); });
check('two faces: body units go back to plain units exactly (mmHg ↔ dB)', rt, 'six settings');
let curveErr = 0;
for (const s of [{ threshold: -24, ratio: 4 }, { threshold: -18, ratio: 2 }, { threshold: -30, ratio: 20 }, { threshold: -12, ratio: 4 }]) curveErr = Math.max(curveErr, Math.abs(C.settle(s, SR) - (-Math.max(0, -12 - s.threshold) * (1 - 1 / s.ratio))));
check('two faces, step 1: with time taken out, the engine’s settled squeeze is the equation’s to a tenth of a dB', curveErr < 0.1, `largest gap ${curveErr.toFixed(4)} dB`);
const base = { threshold: -24, ratio: 4, release: 150 };
const P5 = C.body(x, C.toBody({ ...base, attack: 5 }), SR, false).P, P200 = C.body(x, C.toBody({ ...base, attack: 200 }), SR, false).P;
check('two faces, step 4: the pulse is read before the wall, so attack cannot move it — and the step says “by construction”, not a finding', P5.every((v, i) => v === P200[i]) && H1.includes('by construction') && !H1.includes('pressure beats a minute'), 'pressure series identical at attack 5 and 200 ms');
check('two faces, step 3: the null is worded as a check of the code', H1.includes('This checks the code') && !/proved|prove the two faces/.test(H1), 'wording');
// the rule's chance level, by simulation
const r = C.rng(99), U = () => { const s = {}; for (const k in C.RANGE) { const [a, b] = C.RANGE[k]; s[k] = k === 'threshold' ? a + (b - a) * r() : a * Math.pow(b / a, r()); } return s; };
const jitter = (s, sd) => { const o = { ...s }; for (const k in C.RANGE) { const [a, b] = C.RANGE[k], z = (r() + r() + r() - 1.5) * sd * 2; if (k === 'threshold') o[k] = Math.min(b, Math.max(a, o[k] + z * (b - a))); else o[k] = Math.min(b, Math.max(a, o[k] * Math.pow(b / a, z))); } return o; };
let nNull = 0, nDrift = 0, nShift = 0; const T = 60000;
for (let i = 0; i < T; i++) {
  const ord = i % 2 ? 'ABA' : 'BAB';
  if (C.verdict(ord, [U(), U(), U()]).faceMoved) nNull++;
  const p = U(), a = jitter(p, .06), b = jitter(a, .06), c = jitter(b, .06); if (C.verdict(ord, [a, b, c]).faceMoved) nDrift++;
  const q = U(), sh = (f) => (f === 'body' ? { ...q, attack: Math.min(200, q.attack * 3) } : q), seq = ord === 'ABA' ? ['plain', 'body', 'plain'] : ['body', 'plain', 'body'];
  if (C.verdict(ord, seq.map((f) => jitter(sh(f), .04))).faceMoved) nShift++;
}
check('two faces, step 5: a reader the face does not move lands at 1 in 3', Math.abs(nNull / T - 1 / 3) < 0.01, (nNull / T).toFixed(4));
check('two faces, step 5: a reader who learns across tries, face unmoved, lands under 1 in 3 (the drift works against the face)', nDrift / T < 1 / 3, (nDrift / T).toFixed(4));
check('two faces, step 5: a reader the body moves (attack ×3) is found', nShift / T > 0.6, (nShift / T).toFixed(4));
// the rule is hidden until after try 3: the task box carries no rule; the rule box starts hidden; the caption carries none
{ const task = H1.slice(H1.indexOf('id="taskBox"'), H1.indexOf('id="ruleBox"')), ruleTag = H1.match(/<div class="rule[^"]*" id="ruleBox">/)[0];
  const man = JSON.parse(readFileSync(join(HERE, 'Biomechanical Synthesis — rich.json'), 'utf8')), cap = man.sections.find((s) => s.heading === 'Visceral Pedagogy').pieces.find((p) => /two faces/.test(p.file)).caption;
  check('two faces, step 5: the rule is not shown before the tries (task box, rule box hidden, caption)', !/closest|1 in 3|permutation/.test(task) && /hide/.test(ruleTag) && !/closest pair|1 in 3|permutation|0\.025/.test(cap), ruleTag); }
// a copier, now: a reader who doesn't know the rule has no reason to copy try 1 on try 3; the between-reader half uses first tries only
{ const rr = C.rng(31), mk = (first, shift) => { const s = U(); const t1 = first === 'body' ? { ...s, attack: Math.min(200, s.attack * shift), release: Math.min(1000, s.release * shift) } : s; return { first, samePair: first === 'plain' ? 'plain' : 'body', faceMoved: rr() < 1 / 3, tries: [t1, U(), U()] }; };
  let fp = 0, pw = 0, pw20 = 0, S = 200;
  for (let k = 0; k < S; k++) { const L0 = [], L1 = [], L2 = []; for (let i = 0; i < 20; i++) { const f = i % 2 ? 'body' : 'plain'; L0.push(mk(f, 1)); L1.push(mk(f, 4)); }
    for (let i = 0; i < 40; i++) L2.push(mk(i % 2 ? 'body' : 'plain', 4));
    if (C.poolFirst(L0, 999, 100 + k).verdict === 'the face moved first tries') fp++; if (C.poolFirst(L1, 999, 100 + k).verdict === 'the face moved first tries') pw++; if (C.poolFirst(L2, 999, 100 + k).verdict === 'the face moved first tries') pw20++; }
  check('two faces, step 5: first tries, 10 readers an arm, face changing nothing: found at about 5% or less', fp / S <= 0.08, (fp / S).toFixed(3));
  check('two faces, step 5: first tries, a body face quadrupling attack and release: found about half the time at 10 an arm, most of the time at 20 (as the rule says)', pw / S > 0.35 && pw / S < 0.65 && pw20 / S > 0.65, `${(pw / S).toFixed(3)} at 10, ${(pw20 / S).toFixed(3)} at 20`);
  const few = C.poolFirst([mk('plain', 1), mk('body', 1)], 99, 1).verdict, W = C.poolWithin([{ samePair: 'plain', faceMoved: true }, { samePair: 'body', faceMoved: false }]);
  check('two faces, step 5: too few readers says so, both arms counted apart', few === 'too few' && W.plain.n === 1 && W.body.n === 1 && W.verdict === 'too few', `${few}; within ${W.plain.moved}/${W.plain.n} plain, ${W.body.moved}/${W.body.n} body`); }
const pool = [5, 10, 20, 40].map((n) => [n, C.poolNeed(n)]);
const poolOk = pool.every(([n, k]) => C.binomTail(k, n, 1 / 3) <= 0.05 && C.binomTail(k - 1, n, 1 / 3) > 0.05) && pool.map(([n, k]) => `${k} of ${n}`).every((t) => H1.includes(t));
check('two faces, step 5: the pool table the rule prints is the binomial’s', poolOk, pool.map(([n, k]) => `${k}/${n} p=${C.binomTail(k, n, 1 / 3).toFixed(4)}`).join(', '));

// ── negative space ──
const { X: N, html: H2 } = core('Biomechanical Synthesis — rich — negative space.html', 'bms-net', 'NET');
const one = N.run([1.0], { leak: .85, g: 0, slots: 512, warm: 64 }), div = N.run([0.4], { leak: .85, g: 0, slots: 512, warm: 64 }), dead = N.run([0.14], { leak: .85, g: 0, slots: 512, warm: 64 });
check('negative space, step 1: drive 1 fires on every trigger', N.count(one.on[0]) === 512, `${N.count(one.on[0])} of 512`);
check('negative space, step 2: drive 0.4 divides the trigger by 3; drive 0.14 never fires', N.count(div.on[0]) === 171 && N.count(dead.on[0]) === 0, `${N.count(div.on[0])} and ${N.count(dead.on[0])} of 512`);
const BASE = { nets: 200, nodes: 3, leak: 0.85, g: 0.5, slots: 512, warm: 64, seeds: 40, seed: 20261104 };
const A = N.sweep({ ...BASE, wmin: 0.18, wmax: 0.9 }), B = N.sweep({ ...BASE, wmin: 1, wmax: 2 });
console.log(`      drives under 1: S ${A.meanS.inh.toFixed(2)} / ${A.meanS.none.toFixed(2)} / ${A.meanS.drop.toFixed(2)} · H ${A.meanH.inh.toFixed(2)} / ${A.meanH.none.toFixed(2)} / ${A.meanH.drop.toFixed(2)} · T1 ${A.T1.up}/${A.T1.down}/${A.T1.ties} ${A.T1.verdict} · T2 ${A.T2.up}/${A.T2.down}/${A.T2.ties} ${A.T2.verdict}`);
console.log(`      drives over 1:  S ${B.meanS.inh.toFixed(2)} / ${B.meanS.none.toFixed(2)} / ${B.meanS.drop.toFixed(2)} · H ${B.meanH.inh.toFixed(2)} / ${B.meanH.none.toFixed(2)} / ${B.meanH.drop.toFixed(2)} · T1 ${B.T1.up}/${B.T1.down}/${B.T1.ties} ${B.T1.verdict} · T2 ${B.T2.up}/${B.T2.down}/${B.T2.ties} ${B.T2.verdict}`);
check('negative space, test: the chance-gap arm always has exactly the inhibited arm’s onsets, node by node', A.uncovered === 0 && B.uncovered === 0, `uncovered ${A.uncovered}, ${B.uncovered}`);
check('negative space, test: drives under 1 — T1 fails where the rhythm exists without inhibition, 199 of 200 fall (the number the piece prints)', A.T1.verdict === 'wrong' && A.T1.down === 199 && H2.includes('199 of 200') && H2.includes('T1 fails here') && !H2.includes('page is wrong'), `${A.T1.up} rise, ${A.T1.down} fall`);
check('negative space, test: drives under 1 — T2 holds, the gaps are more regular than chance', A.T2.verdict === 'holds', `${A.T2.up} / ${A.T2.down} / ${A.T2.ties}`);
check('negative space, test: drives over 1 — T1 and T2 hold', B.T1.verdict === 'holds' && B.T2.verdict === 'holds', `T1 ${B.T1.up}/${B.T1.down}, T2 ${B.T2.up}/${B.T2.down}`);
// over 1, without inhibition every node fires on every trigger, so T1 can hardly fail there: say so, and check the claim the piece adds
let fullNone = 0, fullInh = 0; { const rr = N.rng(5); for (let k = 0; k < 200; k++) { const w = [0, 0, 0].map(() => 1 + rr()); const a = N.run(w, { leak: .85, g: .5, slots: 512, warm: 64 }), b = N.run(w, { leak: .85, g: 0, slots: 512, warm: 64 }); if (N.emptySlots(b.on) === 0 && N.syncopation(b.on[0]) === 0) fullNone++; if (N.emptySlots(a.on) === 0) fullInh++; } }
check('negative space: over 1, without inhibition every node fires on every trigger (T1 there is near-certain by construction)', fullNone === 200, `${fullNone} of 200`);
check('negative space: over 1, with inhibition some node still fires on every trigger — the silence is in each voice, never the whole', fullInh === 200, `${fullInh} of 200`);
// how far the answer holds when the constants change
const grid = []; let flips = 0;
for (const g of [0.2, 0.5, 0.8]) for (const leak of [0.7, 0.85, 0.95]) for (const nodes of [3, 5]) {
  const a = N.sweep({ ...BASE, g, leak, nodes, seeds: 10, wmin: 0.18, wmax: 0.9 }), b = N.sweep({ ...BASE, g, leak, nodes, seeds: 10, wmin: 1, wmax: 2 });
  if (a.T1.verdict !== 'wrong' || a.T2.verdict !== 'holds' || b.T1.verdict !== 'holds' || b.T2.verdict !== 'holds') flips++;
  grid.push(`g${g} λ${leak} n${nodes}: ${a.T1.down}/200 fall · ${b.T1.up}/200 rise`);
}
check('negative space: the split holds across g 0.2–0.8, leak 0.7–0.95, 3 or 5 nodes (18 settings)', flips === 0, `${flips} settings disagree`);
// post hoc, labelled so: syncopation per onset, which the rule did not ask for
{ const rr = N.rng(20261104); let fall = 0, rise = 0;
  for (let k = 0; k < 200; k++) { const w = [0, 0, 0].map(() => 0.18 + 0.72 * rr()); const x2 = N.arms(w, { leak: .85, g: .5, slots: 512, warm: 64, seed: 1000 + k }, 1);
    const per = (S, c) => S / (c.reduce((a, b) => a + b, 0) / 32); const d = per(x2.inh.S, x2.counts.inh) - per(x2.none.S, x2.counts.none); if (d > 1e-9) rise++; else if (d < -1e-9) fall++; }
  console.log(`      post hoc, not in the rule: per onset, drives under 1, inhibition raises syncopation in ${rise} and lowers it in ${fall} of 200`); }
console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
