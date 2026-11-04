// title: Pheromone Trail — rich — engine check
// born: 2026-11-04
// links: [[Pheromone Trail]] (connects-to · checks-its-rich-face) · [[Pheromone Trail — rich.json]]
// forward_vector: I re-run the three pieces' tests on the engine code the pieces themselves carry, pulled out of
//   their HTML, with the rules written out a second time here, so a number on the face can be checked without a
//   browser; with --browser I also open each piece headless, press its run button and read what it showed.
//
//   node "Palace development/Pheromone Trail/Pheromone Trail — rich — engine check.mjs" [--browser]
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
const here = dirname(fileURLToPath(import.meta.url));
const files = ['the colony clusters', 'a trail no one walks', 'too strong'].map(w => join(here, `Pheromone Trail — rich — ${w}.html`));
const engines = files.map(f => { const s = readFileSync(f, 'utf8'); return s.slice(s.indexOf('/*ENGINE-START*/'), s.indexOf('/*ENGINE-END*/')); });
let fail = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fail++; };
ok(engines.every(e => e === engines[0] && e.length > 500), 'the three pieces carry the same engine, byte for byte');
const E = {}; vm.runInNewContext(engines[0] + ';Object.assign(E,{makeColony,step,choiceWindow,choose});', { E, Math });
const { makeColony, step, choiceWindow } = E;
const f2 = v => v.toFixed(2);

// 0 · calibration (the model's own rules, cannot fail as tests): one ant's peak, a lone trail's half-life
{ const c = makeColony({ ants: 1, rho: 0.01, stagger: 0, paths: [{ len: 20 }] }); let mx = 0; for (let i = 0; i < 2000; i++) { step(c); if (i > 1500) mx = Math.max(mx, c.paths[0].tau); }
  const th = 1 / (1 - Math.pow(0.99, 40)); ok(Math.abs(mx - th) < 1e-3, `one ant's peak ${mx.toFixed(4)} = q/(1-(1-ρ)^40) ${th.toFixed(4)} (calibration)`); }
{ const c = makeColony({ ants: 0, rho: 0.01, paths: [{ len: 20, tau: 100 }] }); let h = null; while (h == null) { step(c); if (c.paths[0].tau <= 50) h = c.t; }
  ok(Math.abs(h - Math.log(2) / -Math.log(0.99)) < 1, `lone trail half gone at tick ${h}, formula ${(Math.log(2) / -Math.log(0.99)).toFixed(1)} (calibration)`); }
{ const c = makeColony({ ants: 100, rho: 0.01, q: 1, seed: 1, paths: [{ len: 40 }] }); let s = 0; for (let i = 0; i < 3000; i++) { step(c); if (i >= 2000) s += c.paths[0].tau; }
  ok(Math.abs(s / 1000 - 125) < 6, `settled far trail at q = 1 averages ${(s / 1000).toFixed(1)}, the text says about 125`); }

// 1 · cluster: rules — chance 0.50; window ticks 1500–2000; holds if strong ≥ 0.80 in ≥ 18/20 and weak ≤ 0.20 in those
const arm1 = (tau, n) => { const out = []; for (let s = 1; s <= 20; s++) { const c = makeColony({ ants: 100, rho: 0.01, n, seed: s, paths: [{ len: 20, tau: tau[0] }, { len: 20, tau: tau[1] }] }); choiceWindow(c, 1500); out.push(choiceWindow(c, 500)); } return out; };
const S = arm1([60, 10], 2), Q = arm1([10, 10], 2), P = arm1([60, 10], 1);
const cnt = (a, f) => a.filter(f).length, rng = a => `${f2(Math.min(...a))}–${f2(Math.max(...a))}`;
console.log(`  strong n=2: A share ${rng(S.map(r => r[0]))}, A≥0.80 ${cnt(S, r => r[0] >= .8)}/20, B≤0.20 ${cnt(S, r => r[1] <= .2)}/20`);
console.log(`  equal  n=2: A share ${rng(Q.map(r => r[0]))}, clustered either side ${cnt(Q, r => Math.max(...r) >= .8)}/20, A won ${cnt(Q, r => r[0] > r[1])}/20`);
console.log(`  strong n=1: A share ${rng(P.map(r => r[0]))}, A≥0.80 ${cnt(P, r => r[0] >= .8)}/20, B≤0.20 ${cnt(P, r => r[1] <= .2)}/20`);
ok(cnt(S, r => r[0] >= .8) >= 18 && cnt(S, r => r[1] <= .2) >= 18, 'cluster and neglect hold at n = 2 (could fail: fewer than 18 of 20)');
ok(cnt(P, r => r[0] >= .8) <= 2, 'at n = 1 they do not (the control is allowed to disagree, and does)');

// 2 · decay: source gone at tick 2000; free if dead share ≤ 0.10 in ticks 3500–4000 after, in ≥ 9/10; null ρ = 0
const arm2 = rho => { const out = []; for (let s = 1; s <= 10; s++) { const c = makeColony({ ants: 100, rho, n: 2, seed: s, paths: [{ len: 20, tau: 60 }, { len: 20, tau: 10 }] }); for (let i = 0; i < 2000; i++) step(c); const at = c.paths[0].tau; c.paths[0].food = false; choiceWindow(c, 3500); out.push({ at, dead: choiceWindow(c, 500)[0], end: c.paths[0].tau }); } return out; };
const R = arm2(0.01), N0 = arm2(0);
console.log(`  ρ=0.01: dead trail at emptying ${rng(R.map(r => r.at))}, dead share ${rng(R.map(r => r.dead))}, free ${cnt(R, r => r.dead <= .1)}/10`);
console.log(`  ρ=0   : dead trail at emptying ${rng(N0.map(r => r.at))}, at the end ${rng(N0.map(r => r.end))}, dead share ${rng(N0.map(r => r.dead))}, free ${cnt(N0, r => r.dead <= .1)}/10`);
ok(cnt(R, r => r.dead <= .1) >= 9, 'with evaporation the colony gets free of the dead trail (could fail)');
ok(cnt(N0, r => r.dead <= .1) <= 1, 'the null, no evaporation, stays on the dead trail');

// 3 · too strong: counted if fresh near ≥ 0.50 in ≥ 9/10; worn leaves ≥ 9/10, locked ≤ 1/10
const run3 = (q, k, seed, worn, eps) => { const c = makeColony({ ants: 100, rho: 0.01, q, k, n: 2, seed, eps: eps || 0, paths: [{ len: 40 }, { len: 15, open: !worn }] }); let tau = 0; if (worn) { for (let i = 0; i < 2000; i++) step(c); tau = c.paths[0].tau; c.paths[1].open = true; } choiceWindow(c, 3500); return { tau, near: choiceWindow(c, 500)[1] }; };
function sweep(k, qs) { const rows = []; for (const q of qs) { const fr = [], wo = [], ep = []; let tau = 0; for (let s = 1; s <= 10; s++) { fr.push(run3(q, k, s, false).near); const w = run3(q, k, s, true); wo.push(w.near); tau += w.tau / 10; ep.push(run3(q, k, s, true, 0.1).near); }
  const fw = cnt(fr, v => v >= .5), ww = cnt(wo, v => v >= .5), ew = cnt(ep, v => v >= .5); const call = fw < 9 ? 'too faint' : ww >= 9 ? 'leaves' : ww <= 1 ? 'locked' : 'split';
  rows.push({ q, tau, fw, ww, ew, call, epsMean: ep.reduce((a, b) => a + b) / 10, wMean: wo.reduce((a, b) => a + b) / 10, fMean: fr.reduce((a, b) => a + b) / 10 });
  console.log(`  k=${k} q=${q}: worn trail ${rows.at(-1).tau.toFixed(1)} (${(rows.at(-1).tau / k).toFixed(2)}k) · fresh ${fw}/10 ${f2(rows.at(-1).fMean)} · worn ${ww}/10 ${f2(rows.at(-1).wMean)} · off-trail ${ew}/10 ${f2(rows.at(-1).epsMean)} · ${call}`); } return rows; }
const T = sweep(20, [0.05, 0.1, 0.2, 0.22, 0.24, 0.26, 0.3, 0.5, 1, 2]);
const lock = T.find(r => r.call === 'locked');
ok(!!lock, `a trail can be too strong in this model: first locked row q = ${lock && lock.q}, worn trail ${lock && lock.tau.toFixed(1)}`);
ok(!T.some(r => r.call === 'leaves'), 'no counted row reads leaves');
ok(!T.some(r => r.call !== 'too faint' && r.ew >= 9), 'one ant in ten off-trail frees no counted row');
const T40 = sweep(40, [0.3, 0.4, 0.5, 0.6, 0.8]); const lock40 = T40.find(r => r.call === 'locked');
ok(!!lock && !!lock40 && lock40.tau > 1.6 * lock.tau, `the lock line moves with k: k=20 at ${lock && lock.tau.toFixed(1)}, k=40 at ${lock40 && lock40.tau.toFixed(1)}`);
{ const c = makeColony({ ants: 100, rho: 0.01, q: 1, n: 2, seed: 1, paths: [{ len: 40 }, { len: 15, open: false }] }); for (let i = 0; i < 2000; i++) step(c); c.paths[1].open = true; choiceWindow(c, 17500); const w = choiceWindow(c, 500)[1];
  ok(w < .1, `still locked 20 000 ticks after the near source opened at q = 1: near share ${f2(w)}`); }

if (process.argv.includes('--browser')) {
  const { createRequire } = await import('node:module'); const require = createRequire(import.meta.url);
  let pw; try { pw = require('playwright'); } catch { pw = (await import('playwright')).default; }
  const br = await pw.chromium.launch(); const pg = await br.newPage({ viewport: { width: 1100, height: 900 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const plays = [['the colony clusters', 'b4', 'RESULT1'], ['a trail no one walks', 'b3', 'RESULT2'], ['too strong', 'b4', 'RESULT3']];
  for (const [w, btn, key] of plays) {
    await pg.goto(pathToFileURL(join(here, `Pheromone Trail — rich — ${w}.html`)).href);
    const n = await pg.$$eval('section.step', s => s.length); await pg.evaluate(n => show(n - 1), n);
    await pg.click('#' + btn); await pg.waitForFunction(k => !!window[k], key, { timeout: 120000 });
    const v = await pg.$eval('.verdict', e => e.textContent); console.log(`  [browser] ${w}: ${v}`);
    if (key === 'RESULT1') { const r = await pg.evaluate(() => RESULT1.J); ok(r.clus === cnt(S, x => x[0] >= .8) && r.pClus === cnt(P, x => x[0] >= .8) && r.eqA === cnt(Q, x => x[0] > x[1]), 'the cluster piece shows the numbers this check computed'); }
    if (key === 'RESULT2') { const r = await pg.evaluate(() => RESULT2.J); ok(r.rateFree === cnt(R, x => x.dead <= .1) && r.nullFree === cnt(N0, x => x.dead <= .1), 'the decay piece shows the numbers this check computed'); }
    if (key === 'RESULT3') { const r = await pg.evaluate(() => RESULT3.rows.map(x => x.call)); ok(r.join() === T.map(x => x.call === 'too faint' ? 'too faint to choose' : x.call).join(), 'the too-strong piece shows the calls this check computed'); }
    for (let i = 0; i < n; i++) { await pg.evaluate(i => show(i), i); const b = await pg.$('section.step:not([hidden]) button.b.go'); if (b && i < n - 1) { await b.click(); await pg.waitForTimeout(400); await b.click(); } }
  }
  ok(errs.length === 0, `no console errors in the three pieces${errs.length ? ': ' + errs.join(' | ') : ''}`);
  await br.close();
}
console.log(fail ? `${fail} check(s) failed` : 'all checks passed'); process.exit(fail ? 1 : 0);
