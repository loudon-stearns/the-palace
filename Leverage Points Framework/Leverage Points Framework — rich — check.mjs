// Leverage Points Framework — rich — check.mjs
// born: 2026-11-04 · checks [[Leverage Points Framework]]'s two made rich-face pieces, "same effort three places"
// and "who is steering"
// forward_vector: I re-run, headless, every number the two pieces print, from the engine inside the pieces
// themselves: that both carry the same engine, byte for byte; that the one-stock step settles where its equation
// says; that the meter's positive control reads 100% and its coin-flip null reads 50%; and that every verdict,
// under the rules the pieces state, comes out as printed: the switch and the dial, the hijack, and the remake's
// cases after the challenge (the parameter fixed by construction, no delay, the fallen reference, views demoted). Every number is the model's. The pieces make no sound.
//
//   node "Leverage Points Framework/Leverage Points Framework — rich — check.mjs"
//
// PASS/FAIL per claim, INFO for numbers worth reading; exits 1 on any FAIL. Reads only; writes nothing.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const E = 'Leverage Points Framework';
const page = (w) => readFileSync(join(HERE, `${E} — rich — ${w}.html`), 'utf8');
const grab = (html, id) => { const m = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`)); if (!m) throw new Error(`no <script id="${id}">`); return m[1]; };
const P1 = page('same effort three places'), P2 = page('who is steering');
let fails = 0; const pass = (ok, what) => { console.log((ok ? 'PASS ' : 'FAIL ') + what); if (!ok) fails++; };
const info = (what) => console.log('INFO ' + what);

pass(grab(P1, 'lpf-engine') === grab(P2, 'lpf-engine'), 'both pieces carry the same engine, byte for byte');
pass(grab(P1, 'lpf-baked') === grab(P2, 'lpf-baked'), 'both pieces carry the same baked numbers');
const box = { Math, JSON, Object, Array, Number }; vm.createContext(box);
vm.runInContext(grab(P1, 'lpf-engine') + '\nthis.L = LPF;\n' + grab(P1, 'lpf-baked') + '\nthis.BK = LPF_BAKED;', box);
const L = box.L, BK = JSON.parse(JSON.stringify(box.BK));

// step 1: one stock settles at r/(r+b u^2), written here on its own
{ let worst = 0; for (const u of [0.05, 0.3, 0.5, 0.95]) { const o = L.run(L.P({ closed: false, fixedU: u, days: 4000 }), 1, true); const W = o.tr.W.at(-1), ws = 0.01 / (0.01 + 0.03 * u * u); worst = Math.max(worst, Math.abs(W - ws)); }
  pass(worst < 1e-6, `one stock settles at W* = r/(r + b·u²) (worst gap ${worst.toExponential(1)})`); }
function bake1(L) {
  const A = L.seeds(1, 40), B = L.seeds(41, 40), r = x => +x.toFixed(4);
  function one(cons) {
    const p = L.withRefs(cons, A), base = L.many(p, A), floor = L.D(L.many(p, B), base), out = { floor: r(floor) };
    for (const e of [0.1, 0.25]) for (const k of ['y', 'tau', 'g']) {
      const n = L.nudge(k, e), o = {}; for (const z in n) if (z !== 'eff') o[z] = n[z];
      const s = L.many(L.P(Object.assign({}, p, o)), A), d = L.D(s, base);
      out[k + '@' + e] = { D: r(d), per: r(d / n.eff), eff: r(n.eff), dW: r(s.W / base.W - 1), dS: r(s.S / base.S - 1), dC: r(s.C / base.C - 1), dR: r(s.R / base.R - 1) };
    }
    return out;
  }
  const def = one({}), Q = { '0.1': [], '0.25': [] }, rise = { '0.1': 0, '0.25': 0 }, under = { '0.1': 0, '0.25': 0 };
  for (let i = 0; i < 64; i++) { const o = one(L.draw(i)); for (const e of ['0.1', '0.25']) { Q[e].push(r(o['g@' + e].per / o['y@' + e].per)); if (o['g@' + e].dW > 0 && o['g@' + e].dC > 0) rise[e]++; if (o['g@' + e].D < 2 * o.floor) under[e]++; } }
  const verdict = {}; for (const e of ['0.1', '0.25']) { const ge3 = Q[e].filter(x => x >= 3).length, le1 = Q[e].filter(x => x <= 1).length; verdict[e] = { ge3, le1, v: ge3 / 64 >= 0.8 ? 'HOLDS' : le1 / 64 >= 0.5 ? 'FAILS' : 'MIXED' }; }
  const p = L.withRefs({}, A), base = L.many(p, A), sw = [];
  for (const g of [0, 0.25, 0.5, 0.75, 0.9, 0.97, 0.99, 0.999, 1]) { const s = L.many(L.P(Object.assign({}, p, { g })), A); sw.push({ g, D: r(L.D(s, base)), Afast: r(s.Afast), dW: r(s.W / base.W - 1), dS: r(s.S / base.S - 1), dC: r(s.C / base.C - 1), dR: r(s.R / base.R - 1) }); }
  const yEnd = r(L.D(L.many(L.P(Object.assign({}, p, { y: 2 })), A), base));
  const ns = L.withRefs({ sigma: 0.01 }, A), nsb = L.many(ns, A), nsg = L.many(L.P(Object.assign({}, ns, { g: 0.1 })), A);
  const quiet = { D: r(L.D(nsg, nsb)), Afast: r(nsg.Afast) };
  const slow30 = r(L.D(L.many(L.P(Object.assign({}, p, { g: 0.5, tau: 30 })), A), base));
  const yLow = r(L.D(L.many(L.P(Object.assign({}, p, { y: 0.5 })), A), base));
  const swD = []; for (let i = 0; i < 64; i++) { const q = L.withRefs(L.draw(i), A), bq = L.many(q, A); swD.push(r(L.D(L.many(L.P(Object.assign({}, q, { g: 1 })), A), bq))); }
  const sge = swD.filter(x => x >= 1.5).length, sle = swD.filter(x => x <= 0.5).length;
  const switchRule = { ge: sge, le: sle, v: sge / 64 >= 0.8 ? 'HOLDS' : sle / 64 >= 0.5 ? 'FAILS' : 'MIXED' };
  return { def, Q, verdict, rise, under, sw, yEnd, quiet, slow30, yLow, swD, switchRule };
}
function bake2(L) {
  const A = L.seeds(1, 40), r = x => +x.toFixed(4);
  function score(cons, tau, sd) { const p = L.withRefs(cons, sd);
    const s = L.many(L.P(Object.assign({}, p, { g: 0.5, tau, Ds: 30 })), sd), f = L.many(L.P(Object.assign({}, p, { g: 1, tau, Ds: 30 })), sd);
    return { tau, Afast: r(s.Afast), Aslow: r(s.Aslow), K: r(s.K), Kref: r(f.K), hijacked: s.Afast >= s.Aslow + 0.2 && s.K <= 0.9 * f.K }; }
  const table = [1, 7, 30, 90, 180].map(t => score({}, t, A));
  const p = L.withRefs({}, A);
  const pos = r(L.many(L.P(Object.assign({}, p, { g: 0, Ds: 30 })), A).Afast);
  let ag = 0, n = 0; const R = L.rng(777); for (const sd of A) { const o = L.run(L.P(Object.assign({}, p, { g: 0.5, Ds: 30 })), sd); for (const d of o.dec) { ag += d[0] === (R() < 0.5 ? 1 : 0) ? 1 : 0; n++; } }
  const nul = r(ag / n);
  const slow = []; for (const Ds of [0, 30, 90]) for (const tau of [1, 30]) slow.push({ Ds, tau, K: r(L.many(L.P(Object.assign({}, p, { g: 1, Ds, tau })), A).K) });
  const out1 = L.many(L.P(Object.assign({}, p, { g: 1, tau: 1, Ds: 30 })), A);
  const B = A.slice(0, 20), hij = { 1: 0, 7: 0, 30: 0 }; let lift = 0, rise = 0, rise90 = 0;
  for (let i = 0; i < 64; i++) { const c = L.draw(i); for (const t of [1, 7, 30]) if (score(c, t, B).hijacked) hij[t]++;
    const q = L.withRefs(c, B), k1 = L.many(L.P(Object.assign({}, q, { g: .5, Ds: 30, tau: 1 })), B), k30 = L.many(L.P(Object.assign({}, q, { g: .5, Ds: 30, tau: 30 })), B), k90 = L.many(L.P(Object.assign({}, q, { g: .5, Ds: 30, tau: 90 })), B);
    if (k30.K > 1.1 * k1.K) rise++; if (k90.K > 1.1 * k1.K) rise90++; if (k30.Afast < k30.Aslow + 0.2) lift++; }
  const nd = L.many(L.P(Object.assign({}, p, { g: 0.5, Ds: 0 })), A), noDelay = { Afast: r(nd.Afast), Aslow: r(nd.Aslow) };
  const refMonthly = { Ds0: r(L.many(L.P(Object.assign({}, p, { g: 1, tau: 30, Ds: 0 })), A).K), Ds30: r(L.many(L.P(Object.assign({}, p, { g: 1, tau: 30, Ds: 30 })), A).K) };
  function scoreG(cons, tau, sd, g) { const q = L.withRefs(cons, sd); const s = L.many(L.P(Object.assign({}, q, { g, tau, Ds: 30 })), sd), f = L.many(L.P(Object.assign({}, q, { g: 1, tau, Ds: 30 })), sd);
    return { tau, g, Afast: r(s.Afast), Aslow: r(s.Aslow), K: r(s.K), Kref: r(f.K), hijacked: s.Afast >= s.Aslow + 0.2 && s.K <= 0.9 * f.K, lifted: s.Afast < s.Aslow + 0.2 }; }
  const demoted = [1, 7].map(t => scoreG({}, t, A, 0.99));
  const dsw = { h1: 0, h7: 0, l1: 0, l7: 0, rise: 0 };
  for (let i = 0; i < 64; i++) { const c = L.draw(i), a = scoreG(c, 1, B, 0.99), b = scoreG(c, 7, B, 0.99); if (a.hijacked) dsw.h1++; if (b.hijacked) dsw.h7++; if (a.lifted) dsw.l1++; if (b.lifted) dsw.l7++; if (b.K > 1.1 * a.K) dsw.rise++; }
  dsw.v = (64 - dsw.h7) / 64 >= 0.8 && dsw.h1 / 64 >= 0.5 ? 'WORKS' : dsw.h7 / 64 >= 0.5 ? 'FAILS' : 'MIXED';
  return { table, pos, nul, slow, viewsOut: { Afast: r(out1.Afast), Aslow: r(out1.Aslow), K: r(out1.K) }, sweep: { hij, lift, rise, rise90 }, noDelay, refMonthly, demoted, dsw };
}
const t0 = Date.now(); const b1 = bake1(L), b2 = bake2(L);
const same = (a, b, path = '') => { if (typeof a === 'number') return Math.abs(a - b) < 1e-9 ? [] : [path]; if (a && typeof a === 'object') { const ks = new Set([...Object.keys(a), ...Object.keys(b || {})]); return [...ks].flatMap(k => same(a[k], (b || {})[k], path + '.' + k)); } return a === b ? [] : [path]; };
const d1 = same(b1, BK.b1), d2 = same(b2, BK.b2);
pass(d1.length === 0, `every number "same effort three places" prints is recomputed exactly${d1.length ? ' — differs at ' + d1.slice(0, 5).join(' ') : ''}`);
pass(d2.length === 0, `every number "who is steering" prints is recomputed exactly${d2.length ? ' — differs at ' + d2.slice(0, 5).join(' ') : ''}`);
info(`recomputed in ${((Date.now() - t0) / 1000).toFixed(1)} s`);

// the dial reading's verdict, by the rule the piece states (the model's reading; the page's own is the switch, below)
for (const e of ['0.1', '0.25']) { const q = b1.Q[e], ge3 = q.filter(x => x >= 3).length, le1 = q.filter(x => x <= 1).length;
  const v = ge3 / 64 >= 0.8 ? 'HOLDS' : le1 / 64 >= 0.5 ? 'FAILS' : 'MIXED';
  pass(v === 'FAILS', `the dial reading (the model's, not the page's) at ${e * 100}% effort: Q>=3 in ${ge3}/64, Q<=1 in ${le1}/64 -> ${v} (the piece prints "does nothing in this model")`); }
info(`default constants: noise floor D ${b1.def.floor}; 10% nudge D: parameter ${b1.def['y@0.1'].D}, delay ${b1.def['tau@0.1'].D}, goal ${b1.def['g@0.1'].D}`);
info(`after the verdict: goal weight 0.99 -> D ${b1.sw[6].D}, 1 -> D ${b1.sw[8].D}; yield at 2x -> D ${b1.yEnd}`);
// the meter's controls
pass(b2.pos === 1, `positive control: with g = 0 decisions agree with views ${b2.pos} (must be 1)`);
pass(Math.abs(b2.nul - 0.5) <= 0.03, `null: agreement with a coin-flip series ${b2.nul} (must be 0.5 ± 0.03)`);
// the #9 verdicts, by the rule the piece states
const T = Object.fromEntries(b2.table.map(r => [r.tau, r]));
pass(T[1].hijacked && T[7].hijacked && !T[30].hijacked, `hijack rule: daily ${T[1].hijacked}, weekly ${T[7].hijacked}, monthly ${T[30].hijacked} (the piece prints hijacked, hijacked, not hijacked)`);
pass(T[30].Afast >= T[30].Aslow + 0.2, `the reading: at monthly looks decisions still follow views (${T[30].Afast} vs ${T[30].Aslow})`);
pass(T[30].Kref < T[1].Kref * 0.5 && Math.abs(T[30].K - T[1].K) < 0.1, `the reading: monthly passes because the slow-alone reference fell (${T[1].Kref} -> ${T[30].Kref}), not because the creator rose (${T[1].K} -> ${T[30].K})`);
info(`sweep: hijacked daily ${b2.sweep.hij[1]}/64, weekly ${b2.sweep.hij[7]}/64, monthly ${b2.sweep.hij[30]}/64; capture lifts at monthly ${b2.sweep.lift}/64; K rises >10% monthly ${b2.sweep.rise}/64, 90-day ${b2.sweep.rise90}/64`);
// the remake's cases (after the challenge, 2026-11-04)
pass(b1.switchRule.v === 'HOLDS', `the page's reading (switch, views out): D >= 1.5 in ${b1.switchRule.ge}/64, <= 0.50 in ${b1.switchRule.le}/64 -> ${b1.switchRule.v} (the piece prints "holds in this model")`);
pass(b1.yEnd === 0.5 && b1.yLow === 0.25, `the parameter across its range is fixed by construction: D ${b1.yEnd} at 2x, ${b1.yLow} at 0.5x`);
pass(b1.quiet.D < 0.01 && b1.slow30 < 0.1, `the dial's cause is not noise and not a delay: sigma 0.01 -> D ${b1.quiet.D}; 30-day looks at g 0.5 -> D ${b1.slow30}`);
pass(b2.noDelay.Afast >= b2.noDelay.Aslow + 0.2, `the hijack holds with no delay: ${b2.noDelay.Afast} with views, ${b2.noDelay.Aslow} with slow`);
pass(b2.refMonthly.Ds0 > 2 * b2.refMonthly.Ds30, `the 30-day delay is what drops the monthly reference: ${b2.refMonthly.Ds0} -> ${b2.refMonthly.Ds30}`);
pass(b2.demoted[0].hijacked && !b2.demoted[1].hijacked, `views demoted to 1%: daily hijacked ${b2.demoted[0].hijacked}, weekly ${b2.demoted[1].hijacked}`);
pass(b2.dsw.v === 'MIXED' && b2.dsw.h7 === 0, `demoted arm across 64 draws: weekly hijacked ${b2.dsw.h7}, daily ${b2.dsw.h1}; capture lifts weekly ${b2.dsw.l7}, daily ${b2.dsw.l1}; K up >10% in ${b2.dsw.rise} -> ${b2.dsw.v} (the piece prints "mixed" by the letter)`);
info('not checked here: anything a person feels; the model is the maker\'s, and its structure decides what any number can mean');
process.exit(fails ? 1 : 0);
