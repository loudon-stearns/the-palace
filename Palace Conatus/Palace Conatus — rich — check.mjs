#!/usr/bin/env node
// title: Palace Conatus — rich — check
// born: 2026-11-03
// links: [[Palace Conatus]] (connects-to · rich-face-check) · the three pieces it reads: "in phase, not in agreement", "whoever arrives next", "drifting with great energy"
// forward_vector: I re-run the engine block of each made piece on Palace Conatus's rich face, in Node, against the claims
//   each piece's test makes and against closed forms the engine never uses (arcsin offset, linear return, Adler's slip).
//   Run me after any edit to a piece; a FAIL line says which claim moved.
// usage: node "Palace Conatus/Palace Conatus — rich — check.mjs"
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = (f) => { const m = readFileSync(join(here, `Palace Conatus — rich — ${f}.html`), 'utf8').match(/<script id="engine">([\s\S]*?)<\/script>/); if (!m) throw new Error('no engine in ' + f); return m[1]; };
const load = (f, names) => new Function(src(f) + '\nreturn {' + names.join(',') + '};')();
let fails = 0;
const yes = (what, ok, got) => { console.log((ok ? '  ok   ' : '  FAIL ') + what + (got !== undefined ? '  · ' + got : '')); if (!ok) fails++; };
const f3 = (x) => x.toFixed(3), TAU = 2 * Math.PI;

// ── the three engines are one engine ──
const shared = (s) => s.slice(0, s.indexOf('// ── the tests'));
const ea = src('in phase, not in agreement'), eb = src('whoever arrives next'), ec = src('drifting with great energy');
yes('the three pieces carry the same engine', shared(ea) === shared(eb) && shared(eb) === shared(ec));

// ── the engine against closed forms it never uses ──
console.log('engine');
const E = load('in phase, not in agreement', ['makeSim', 'step', 'measure', 'wrap']);
for (const [d, K] of [[0.15, 0.3], [-0.2, 0.5], [0.29, 0.3]]) {
  const S = E.makeSim({ N: 1, f0: 1, move: 0, K, lead: d, seed: 3 }); while (S.t < 200) E.step(S, 0.01);
  const got = E.wrap(S.th[0] - S.thL), want = Math.asin(d / K);
  yes(`a locked page sits arcsin(Δf/K) from him · Δf ${d}, K ${K}`, Math.abs(got - want) < 1e-3, (got * 180 / Math.PI).toFixed(3) + '° against ' + (want * 180 / Math.PI).toFixed(3) + '°');
}
{ // near its place, a page returns as e^(−2πK·cos φ*·t)
  const K = 0.25, d = 0.1, ps = Math.asin(d / K), S = E.makeSim({ N: 1, f0: 1, move: 0, K, lead: d, seed: 3 });
  S.th[0] = S.thL + ps + 2 * Math.PI / 180; const d0 = E.wrap(S.th[0] - S.thL - ps); while (S.t < 1) E.step(S, 0.01);
  const rate = -Math.log(E.wrap(S.th[0] - S.thL - ps) / d0) / S.t, want = TAU * K * Math.cos(ps);
  yes('a newcomer near its place returns at 2πK·cos φ* per unit', Math.abs(rate / want - 1) < 0.01, f3(rate) + ' against ' + f3(want)); }

// ── in phase, not in agreement ──
console.log('in phase, not in agreement');
const A = load('in phase, not in agreement', ['jobsA', 'judgeA', 'runJob']);
const ja = A.jobsA().map(A.runJob), va = A.judgeA(ja);
for (const j of ja) console.log(`       m ${j.m} · ${j.label.padEnd(36)} agree ${j.out.agree.toFixed(3).padStart(6)}  R ${f3(j.out.Rall)}  H ${f3(j.out.lock)}`);
yes('under H the sentence holds: every A holds its relationship above B', va.H, 'B ' + f3(va.B.lock));
yes('under R it fails, and fails where the pages contradict him most (the finding the offer carries)', !va.R && va.Rfails.includes('A · stance 180°') && va.Rfails.includes('A · each its own stance'), va.Rfails.join(', ') + ' · B ' + f3(va.B.Rall));
yes('the null: with him still, B ties every A on H within 0.01', va.nullTie, 'B ' + f3(va.B0.lock));
{ const B = A.runJob({ P: { N: 12, f0: 1, move: 0.3, pinned: true, spread: 0, seed: 7 } }).out, Ao = A.runJob({ P: { N: 12, f0: 1, move: 0.3, K: 0.5, spread: 0.1, stance: Array.from({ length: 12 }, (_, i) => (-180 + 360 * (i + 0.5) / 12) * Math.PI / 180), seed: 7 } }).out;
  yes('another wander (seed 7): the same order, H for A over B, R for B over A', Ao.lock > B.lock && B.Rall > Ao.Rall, `A H ${f3(Ao.lock)} R ${f3(Ao.Rall)} · B H ${f3(B.lock)} R ${f3(B.Rall)}`); }

// ── whoever arrives next ──
console.log('whoever arrives next');
const Bm = load('whoever arrives next', ['jobsB', 'judgeB', 'runJob']);
const jb = Bm.jobsB().map(Bm.runJob), vb = Bm.judgeB(jb);
for (const c of vb.cells) console.log(`       K ${String(c.K).padEnd(4)} Ts ${String(c.Ts).padStart(2)}  note ${f3(c.note)}  none ${f3(c.none)}  ${c.verdict}`);
yes('the note is needed somewhere: the sentence does not fail', !vb.fails, vb.needed + ' cells');
yes('…and not everywhere it holds: the pull alone re-finds phase in some cells (the condition the offer carries)', !vb.unconditional, vb.held - vb.needed + ' of ' + vb.held);
yes('the note never makes things worse by more than 0.01', vb.cells.every((c) => c.note >= c.none - 0.01));

// ── drifting with great energy ──
console.log('drifting with great energy');
const C = load('drifting with great energy', ['jobsC', 'judgeC', 'runJob', 'adler', 'KC', 'GS', 'KPS', 'measure']);
for (const g of [0.2, 0.33, 0.45, 0.9]) { const o = C.measure({ N: 1, f0: 1, move: 0, K: 0.3, lead: g, seed: 3 }, 400, 50, 20);
  yes(`one page against a still Loudon slips at Adler's √(g² − K²) · g ${g}`, Math.abs(o.energy - C.adler(g, 0.3)) < 0.004, f3(o.energy) + ' against ' + f3(C.adler(g, 0.3))); }
const jc = C.jobsC().map(C.runJob), vc = C.judgeC(jc);
for (const g of C.GS) console.log(`       g/K ${String(g).padEnd(4)} ` + C.KPS.map((p) => { const o = vc.at(p, g); return `Kp ${p}: H ${f3(o.lock)} among ${f3(o.Rint)} slip ${f3(o.energy)}`; }).join('   '));
yes('the caution is not wrong: no pull among the pages holds H ≥ 0.9 past 1.5 K', vc.wrong.length === 0);
yes('the caution is right: past the edge H falls and the slip rises, at every pull among the pages', vc.right);
yes('ten times his pull among the pages keeps them together past the edge (in tune with itself)', C.GS.every((g) => vc.at(3, g).Rint > 0.99), f3(Math.min(...C.GS.map((g) => vc.at(3, g).Rint))));

console.log(fails ? `\n${fails} FAIL` : '\nall ok'); process.exit(fails ? 1 : 0);
