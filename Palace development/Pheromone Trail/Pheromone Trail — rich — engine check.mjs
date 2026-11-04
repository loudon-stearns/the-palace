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

// 2 · decay: source gone at tick 2000; faded = A below a tenth of its strength then; horizons 1,000 and 40,000; arm holds ≥ 18/20, fails ≤ 2/20; null (source left) broken if ≥ 3/20 read faded
const arm2 = (qOut, kill) => { const out = []; for (let s = 1; s <= 20; s++) { const c = makeColony({ ants: 100, rho: 0.01, n: 2, seed: s, q: 1 - qOut, qOut, paths: [{ len: 20, tau: 60 }, { len: 20, tau: 10 }] }); for (let i = 0; i < 2000; i++) step(c); const at = c.paths[0].tau; if (kill) c.paths[0].food = false; let short = 0, tenth = null; for (let i = 1; i <= 40000; i++) { step(c); if (tenth == null && c.paths[0].tau < 0.1 * at) tenth = i; if (i === 1000) short = c.paths[0].tau / at; } out.push({ at, short, long: c.paths[0].tau / at, tenth }); } return out; };
const D = { home: arm2(0, true), half: arm2(0.5, true), most: arm2(0.7, true), nul: arm2(0, false) };
const fd = (a, k) => cnt(a, r => r[k] < 0.1);
for (const [k, a] of Object.entries(D)) { const t = a.map(r => r.tenth).filter(x => x != null).sort((x, y) => x - y); console.log(`  ${k}: strength at emptying ${rng(a.map(r => r.at))}, at 1,000 ${rng(a.map(r => r.short))}, faded by 1,000 ${fd(a, 'short')}/20, by 40,000 ${fd(a, 'long')}/20, ticks to a tenth ${t.length ? t[0] + '–' + t.at(-1) : 'never'}${t.length && t.length < 20 ? ' (' + (20 - t.length) + ' never)' : ''}`); }
ok(fd(D.nul, 'short') <= 2 && fd(D.nul, 'long') <= 2, 'the null (source left) never reads faded: the measure is not broken');
ok(fd(D.home, 'short') >= 18, 'marking only on success, the dead trail fades by 1,000 ticks');
ok(fd(D.half, 'short') <= 2 && fd(D.half, 'long') >= 18, 'half marked walking out: not faded by 1,000, faded by 40,000 (the arm the horizon decides)');
ok(fd(D.most, 'long') <= 2, 'most marked walking out: not faded by 40,000');
{ const c = makeColony({ ants: 100, rho: 0.01, n: 2, seed: 1, paths: [{ len: 20, tau: 60 }, { len: 20, tau: 10 }] }); const d = makeColony({ ants: 100, rho: 0.01, n: 2, seed: 1, qOut: 0, paths: [{ len: 20, tau: 60 }, { len: 20, tau: 10 }] }); for (let i = 0; i < 3000; i++) { step(c); step(d); } ok(c.paths[0].tau === d.paths[0].tau && c.paths[1].choices === d.paths[1].choices, 'qOut = 0 leaves the engine exactly as the cluster piece ran it'); }

// 3 · too strong: counted if fresh near ≥ 0.50 at 3500–4000 in ≥ 18/20; horizon 40,000; a run has left at the first 500-tick window with near ≥ 0.50; row leaves ≥ 18/20, locked ≤ 2/20; off-trail arm by the same rules
const HZ = 40000;
const fresh3 = (q, s) => { const c = makeColony({ ants: 100, rho: 0.01, q, n: 2, seed: s, paths: [{ len: 40 }, { len: 15 }] }); choiceWindow(c, 3500); return choiceWindow(c, 500)[1]; };
const worn3 = (q, s, eps, hz) => { const c = makeColony({ ants: 100, rho: 0.01, q, n: 2, seed: s, eps: eps || 0, paths: [{ len: 40 }, { len: 15, open: false }] }); for (let i = 0; i < 2000; i++) step(c); const tau = c.paths[0].tau; c.paths[1].open = true; for (let t = 500; t <= hz; t += 500) if (choiceWindow(c, 500)[1] >= 0.5) return { tau, left: t }; return { tau, left: null }; };
const call3 = n => n >= 18 ? 'leaves' : n <= 2 ? 'locked' : 'split';
const T = [0.1, 0.2, 0.24, 0.26, 0.3, 0.4, 0.5, 1].map(q => { const fr = [], wo = [], of = []; let tau = 0; for (let s = 1; s <= 20; s++) { fr.push(fresh3(q, s)); const w = worn3(q, s, 0, HZ); wo.push(w.left); tau += w.tau / 20; of.push(worn3(q, s, 0.1, HZ).left); }
  const fw = cnt(fr, v => v >= .5), byH = cnt(wo, x => x != null), byE = cnt(wo, x => x != null && x <= 4000), offH = cnt(of, x => x != null); const lt = wo.filter(x => x != null).sort((a, b) => a - b);
  const r = { q, tau, fw, byH, byE, offH, med: lt.length >= 10 ? lt[Math.floor(lt.length / 2)] : null, call: fw >= 18 ? call3(byH) : 'too faint to choose', offCall: fw >= 18 ? call3(offH) : 'too faint to choose' };
  console.log(`  q=${q}: worn trail ${tau.toFixed(1)} (${(tau / 20).toFixed(2)}k) · fresh ${fw}/20 · worn left by 4,000 ${byE}/20, by 40,000 ${byH}/20, median ${r.med ?? '–'} · ${r.call} · off-trail ${offH}/20 ${r.offCall}`); return r; });
const lock = T.find(r => r.call === 'locked');
ok(!!lock, `a trail can be too strong in this model at 40,000 ticks: first locked row q = ${lock && lock.q}, worn trail ${lock && lock.tau.toFixed(1)}`);
ok(T.some(r => r.call === 'leaves'), 'some counted rows leave by the horizon (the read is not decided by a short window)');
for (const q of [0.4, 0.5]) { let left = 0; for (let s = 1; s <= 10; s++) if (worn3(q, s, 0, 200000).left != null) left++; ok(left === 0, `q = ${q}: still not left by 200,000 ticks in ${10 - left} of 10 runs`); }

if (process.argv.includes('--browser')) {
  const { createRequire } = await import('node:module'); const require = createRequire(import.meta.url);
  let pw; try { pw = require('playwright'); } catch { pw = (await import('playwright')).default; }
  const br = await pw.chromium.launch(); const pg = await br.newPage({ viewport: { width: 1100, height: 900 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message)); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  const plays = [['the colony clusters', 'b4', 'RESULT1'], ['a trail no one walks', 'b4', 'RESULT2'], ['too strong', 'b4', 'RESULT3']];
  for (const [w, btn, key] of plays) {
    await pg.goto(pathToFileURL(join(here, `Pheromone Trail — rich — ${w}.html`)).href);
    const n = await pg.$$eval('section.step', s => s.length); await pg.evaluate(n => show(n - 1), n);
    await pg.click('#' + btn); await pg.waitForFunction(k => !!window[k], key, { timeout: 600000 });
    const v = await pg.$eval('.verdict', e => e.textContent); console.log(`  [browser] ${w}: ${v}`);
    if (key === 'RESULT1') { const r = await pg.evaluate(() => RESULT1.J); ok(r.clus === cnt(S, x => x[0] >= .8) && r.pClus === cnt(P, x => x[0] >= .8) && r.eqA === cnt(Q, x => x[0] > x[1]), 'the cluster piece shows the numbers this check computed'); }
    if (key === 'RESULT2') { const r = await pg.evaluate(() => RESULT2.J); ok(r.home.f1 === fd(D.home, 'short') && r.half.f1 === fd(D.half, 'short') && r.half.f40 === fd(D.half, 'long') && r.most.f40 === fd(D.most, 'long') && r.null.f40 === fd(D.nul, 'long'), 'the decay piece shows the numbers this check computed'); }
    if (key === 'RESULT3') { const r = await pg.evaluate(() => RESULT3.rows.map(x => x.call + '/' + x.byH + '/' + x.offH)); ok(r.join() === T.map(x => x.call + '/' + x.byH + '/' + x.offH).join(), 'the too-strong piece shows the calls and counts this check computed'); }
    for (let i = 0; i < n; i++) { await pg.evaluate(i => show(i), i); const b = await pg.$('section.step:not([hidden]) button.b.go'); if (b && i < n - 1) { await b.click(); await pg.waitForTimeout(400); await b.click(); } }
  }
  ok(errs.length === 0, `no console errors in the three pieces${errs.length ? ': ' + errs.join(' | ') : ''}`);
  await br.close();
}
console.log(fail ? `${fail} check(s) failed` : 'all checks passed'); process.exit(fail ? 1 : 0);
