// Buckminster Fuller — rich — check.mjs
// born: 2026-11-04 · checks [[Buckminster Fuller]]'s two rich-face pieces, "— rich — trimtab.html" and "— rich — no brake.html"
// forward_vector: I re-run, headless, every number the two pieces print and every verdict their rules give,
// on the pieces' own engines, and I show that each test can fail: the trimtab's leverage falls through 1
// when the tab moves toward the stock, and each half of the no-brake test fails when the world it describes
// is taken away. Every number is the models'. Neither piece makes a sound, so there is nothing to hear.
//
//   node "People/Buckminster Fuller/Buckminster Fuller — rich — check.mjs"
//
// It pulls <script id="tt-core"> and <script id="rb-core"> out of the HTML, runs them in a Node sandbox,
// and checks them against equations written here on their own. PASS/FAIL per claim; exits 1 on any FAIL.
// Reads only; writes nothing.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const block = (file, id) => {
  const html = readFileSync(join(HERE, file), 'utf8');
  const m = html.match(new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)</script>`));
  if (!m) throw new Error(`no <script id="${id}"> in ${file}`);
  return m[1];
};
let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const E = { Math, Infinity, isFinite };
vm.createContext(E);
vm.runInContext(block('Buckminster Fuller — rich — trimtab.html', 'tt-core') + '\nthis.TT = TT;', E);
vm.runInContext(block('Buckminster Fuller — rich — no brake.html', 'rb-core') + '\nthis.RB = RB;', E);
const { TT, RB } = E, D = Math.PI / 180;

console.log('— the trimtab —');
const r = TT.test({});
check('null: the matched arithmetic gives back the direct arm\'s own effort within 1%', Math.abs(r.nullRel) < 0.01, `${(r.nullRel * 100).toFixed(3)}%; more than 1% would mean the matched arm is mis-measured`);
// the matched arm's heading, integrated here on its own from the net-push path, is the tab arm's
{ const P = r.P; let psi = 0, rr = 0, worst = 0; const h = r.tab.t[1] - r.tab.t[0];
  for (let i = 0; i < r.tab.t.length; i++) { worst = Math.max(worst, Math.abs(psi - r.tab.psi[i])); const sub = Math.round(h / P.dt); for (let k = 0; k < sub; k++) { rr += ((P.K * r.tab.net[i] - rr) / P.T) * P.dt; psi += rr * P.dt; } }
  check('construction: the matched arm\'s heading follows the tab arm\'s (a match, not a test)', worst < 0.2 * D, `worst gap ${(worst / D).toFixed(3)}° on a 0.05 s resampled path`); }
check('trailing edge: the turn is made', r.made, `settles at ${r.sT.toFixed(2)} s, ends at ${r.final.toFixed(2)}°`);
check('trailing edge: leverage above 1, by the rule', r.L > 1, `L = ${r.L.toFixed(3)}, peak ratio ${r.Lpk.toFixed(3)}; E direct ${(r.Edir / 1000).toFixed(0)}, E tab ${(r.Etab / 1000).toFixed(1)} kN·m·s`);
check('the delay is positive and splits into its two parts', r.delay > 0 && Math.abs(r.counter + r.swingGear - r.delay) < 1e-9, `delay ${r.delay.toFixed(2)} s = tab's counter-push ${r.counter.toFixed(2)} s + swing and gear ${r.swingGear.toFixed(2)} s; direct ${r.sF.toFixed(2)} s`);
// the steady leverage, read off a held tab rather than the formula
{ const P = TT.params({}); let d = 0, dv = 0; const tau = 10 * D; for (let i = 0; i < 20000; i++) { dv += ((-P.br * dv - P.cr * d + P.ctau * tau) / P.Jr) * P.dt; d += dv * P.dt; }
  const net = d - P.side * tau, Ls = (P.cr * net) / (P.e * tau), s = TT.steady(P);
  check('steady leverage: a held tab agrees with the formula step 4 prints', Math.abs(Ls - s.L) / s.L < 1e-3, `held ${Ls.toFixed(4)}, formula ${s.L.toFixed(4)}`); }
// the test can fail: slide the tab toward the stock
{ const rows = []; let firstMade = null, firstL = null;
  for (let x = 0; x <= 1.6001; x += 0.05) { const t = TT.test({ xh: +x.toFixed(2) }); rows.push(t); if (firstMade === null && t.pass) firstMade = x; }
  const t03 = TT.test({ xh: 0.3 });
  check('the test can fail: at 0.30 m from the stock the rule says no leverage', !t03.pass, `L ${t03.L.toFixed(2)}, made ${t03.made}, ends at ${t03.final.toFixed(1)}°`);
  check('the verdict turns over somewhere along the rudder', firstMade !== null && firstMade > 0, `the page is right from ${firstMade.toFixed(2)} m aft of the stock (rudder chord 2 m)`);
  const sweep = rows.filter((_, i) => i % 4 === 0).map(t => `${t.P.xh.toFixed(2)}m:L${t.L.toFixed(2)}${t.made ? '' : '·not made'}`).join('  ');
  console.log('      sweep: ' + sweep); }
// the swing's time against speed, as step 3 says
{ const a = TT.swing(TT.params({ U: 6 })), b = TT.swing(TT.params({ U: 3 })), c = TT.swing(TT.params({ U: 1 }));
  check('step 3: the rudder swings slower as the ship slows', a < b && b < c && Math.abs(b / a - 2) < 0.05, `90% of the swing in ${a.toFixed(3)} s at 6 m/s, ${b.toFixed(3)} at 3, ${c.toFixed(3)} at 1`); }

console.log('— no brake —');
const base = { U0: 1.3, S0: 10, H: 300 };
{ const a = RB.run({ ...base, g: 0.02, R: 0 }); let worst = 0; for (let t = 0; t <= 300; t++) worst = Math.max(worst, Math.abs(a.U[t] - 1.3 * Math.pow(1.02, -t)));
  check('banked: use is U0 ÷ (1+g)^t', worst < 1e-12, `worst gap ${worst.toExponential(2)}`);
  check('step 2: use falls below regrowth at cycle 14 (2% a cycle)', a.below === 14, `cycle ${a.below}`); }
{ const a = RB.run({ ...base, g: 0, R: 0 }); check('step 1: at use 1.3 the stock runs out at cycle 34', a.out === 34, `cycle ${a.out}`); }
{ const a = RB.run({ ...base, g: 0.02, R: 0 }), b = RB.run({ ...base, g: 0.005, R: 0 }), c = RB.run({ ...base, U0: 1.8, g: 0.02, R: 0 });
  check('step 2\'s try: banked dips to about 8 at 2%, about 2.6 at 0.5%, and runs out at cycle 24 from a start use of 1.8', Math.abs(a.lowest - 8.25) < 0.05 && Math.abs(b.lowest - 2.6) < 0.05 && c.out === 24, `lowest ${a.lowest.toFixed(2)}, ${b.lowest.toFixed(2)}; 1.8 runs out at cycle ${c.out}`); }
{ const f = RB.flatAt({ ...base, g: 0.02 }); check('use stops falling at a rebound of 100% (arithmetic, not a finding)', Math.abs(f - 1) < 1e-6, `${(f * 100).toFixed(4)}%`); }
{ const n = RB.run({ ...base, g: 0.02, R: 0.9 }), b = RB.run({ ...base, g: 0.02, R: 0.9, brake: true });
  check('step 4\'s try: at 90% the stock runs out with no loop and survives with it', n.out > 0 && b.out < 0, `no loop: cycle ${n.out}; loop: lowest ${b.lowest.toFixed(2)}`); }
const t = RB.test(base);
console.log('      ' + t.rows.map(r => `${(r.g * 100).toFixed(0)}%: free ${(r.free * 100).toFixed(1)} · flat ${(r.flat * 100).toFixed(1)} · braked ${isFinite(r.braked) ? (r.braked * 100).toFixed(1) : '>300'}`).join('\n      '));
check('half one holds in the page\'s situation (start use 1.3, above regrowth)', t.one, `collapse lines ${t.rows.map(r => (r.free * 100).toFixed(1)).join(', ')}%`);
check('half one: faster efficiency narrows the band but never closes it', t.rows.every((r, i) => i === 0 || r.free > t.rows[i - 1].free) && t.rows.every(r => r.free < 1), 'collapse line rises with speed, stays below 100%');
check('half two holds in the page\'s situation', t.two, `braked lines ${t.rows.map(r => isFinite(r.braked) ? (r.braked * 100).toFixed(1) : '>300').join(', ')}%`);
{ const u = RB.test({ ...base, U0: 1.0 }); check('the test can fail: half one fails with use at regrowth (1.0)', !u.one, `collapse lines ${u.rows.map(r => isFinite(r.free) ? (r.free * 100).toFixed(1) : '>300').join(', ')}%`); }
{ const u = RB.test({ ...base, U0: 1.6 }); check('the test can fail: half two fails at a deep overdraw (1.6)', !u.two, `braked lines ${u.rows.map(r => isFinite(r.braked) ? (r.braked * 100).toFixed(1) : '>300').join(', ')}%`); }
{ let lo = 1, hi = 3; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (RB.test({ ...base, U0: m }).two) lo = m; else hi = m; }
  console.log(`      half two holds up to a start use of ${lo.toFixed(3)} (stock 10, all six speeds)`); }

console.log(fails ? `${fails} FAIL` : 'all PASS');
process.exit(fails ? 1 : 0);
