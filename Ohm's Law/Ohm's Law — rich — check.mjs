// Ohm's Law — rich — check.mjs
// born: 2026-11-03 · checks the two pieces of [[Ohm's Law]]' rich face
// forward_vector: I re-run, headless, every number the two pieces and their captions state. For the lock walk: that
// its slider is the explorer's (0.1 to 10, 1 at the centre), that a lock makes the free pair move together or apart
// thumb for thumb on log sliders and not on linear ones, how much of a free slider a lock leaves live, and what the
// gathered .jsx shows when the answer runs off its slider. For the four rooms: each room's physics against its own
// textbook law written here on its own (Poiseuille and Blasius, Beer–Lambert, ρc, P = W h ÷ t), and the test table's
// every ratio. What a reader feels dragging a slider I cannot check.
//
//   node "Ohm's Law/Ohm's Law — rich — check.mjs"
//
// It pulls each page's <script id="ohm-…-core"> out of the HTML, runs it in a Node sandbox, and compares against
// equations written here. PASS/FAIL per claim; exits 1 on any FAIL. Reads only.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const core = (file, id) => {
  const html = readFileSync(join(HERE, `Ohm's Law — rich — ${file}.html`), 'utf8');
  const m = html.match(new RegExp(`<script[^>]*id="${id}"[^>]*>([\\s\\S]*?)</script>`));
  if (!m) throw new Error(`no <script id="${id}"> in ${file}`);
  const E = { Math, isFinite, NaN }; vm.createContext(E); vm.runInContext(m[1], E); return E;
};
let fails = 0;
const check = (name, ok, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  (${detail})`); if (!ok) fails++; };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const pct = (x) => (x * 100).toFixed(1) + '%';

// ── piece A · lock one · § The Lock Mechanism Pattern ──
{
  const A = core('lock one', 'ohm-a-core');
  console.log('— lock one');
  // the jsx's own mapping: logMin + (pos/100)(logMax − logMin), LOG_MIN 0.1, LOG_MAX 10
  const jsx = (sp) => 10 ** (Math.log10(0.1) + (sp / 100) * (Math.log10(10) - Math.log10(0.1)));
  let worst = 0; for (let q = 0; q <= 100; q += 0.5) worst = Math.max(worst, Math.abs(A.val(q / 100) / jsx(q) - 1));
  check('the slider is the jsx’s sliderToValue: 0.1 to 10, log', worst < 1e-12, `worst relative gap ${worst.toExponential(1)}`);
  check('1 at the centre, √10 at three quarters, 10 at the end', near(A.val(0.5), 1, 1e-12) && near(A.val(0.75), Math.sqrt(10), 1e-12) && near(A.val(1), 10, 1e-12), `${A.val(0.5)}, ${A.val(0.75).toFixed(4)}, ${A.val(1)}`);
  // equal travel for a doubling anywhere
  const d1 = A.pos(2) - A.pos(1), d2 = A.pos(4) - A.pos(2);
  check('1 → 2 and 2 → 4 cost the same travel (log 2 ÷ 2 = 15.1%)', near(d1, d2, 1e-12) && near(d1, Math.log10(2) / 2, 1e-12), pct(d1));
  // lock directions, log and linear
  const s = { V: 2, I: 1, R: 2 };
  const rR = A.travelRatio('R', 'V', 0.5, 2, s, 'log'), rV = A.travelRatio('V', 'R', 0.5, 2, s, 'log'), rI = A.travelRatio('I', 'V', 0.5, 2, s, 'log');
  check('log: R locked, V and I move together thumb for thumb (+1); V locked, I and R mirror (−1); I locked, V and R together (+1)',
    near(rR, 1, 1e-12) && near(rV, -1, 1e-12) && near(rI, 1, 1e-12), `${rR}, ${rV}, ${rI}`);
  // the same everywhere on the slider, for many spans
  worst = 0; for (const a of [0.2, 0.5, 1, 3]) for (const b of [0.4, 2, 7, 9.5]) if (a !== b) worst = Math.max(worst, Math.abs(A.travelRatio('V', 'R', a, b, s, 'log') + 1));
  check('log: the mirror is exact over every span tried', worst < 1e-12, `worst ${worst.toExponential(1)}`);
  const l1 = A.travelRatio('V', 'R', 0.2, 0.4, s, 'lin'), l2 = A.travelRatio('V', 'R', 5, 10, s, 'lin');
  check('linear: V = 2 locked, I travels 25× R’s travel between R 0.2 and 0.4, and 0.04× between 5 and 10', near(l1, -25, 1e-9) && near(l2, -0.04, 1e-12), `${l1.toFixed(3)}, ${l2.toFixed(4)}`);
  // own: the live band, solved here from the three equations by brute force
  const brute = (locked, driver, st) => {
    const a = A.answerer(locked, driver); let lo = Infinity, hi = -Infinity;
    for (let q = 0; q <= 1; q += 1e-5) { const v = A.val(q), n = { ...st }; n[driver] = v; n[a] = a === 'V' ? n.I * n.R : a === 'I' ? n.V / n.R : n.V / n.I; if (n[a] >= 0.1 - 1e-12 && n[a] <= 10 + 1e-12) { lo = Math.min(lo, q); hi = Math.max(hi, q); } }
    return hi - lo;
  };
  worst = 0;
  for (const locked of ['V', 'I', 'R']) for (const L of [0.1, 0.25, 1, 2, 4, 10]) for (const driver of ['V', 'I', 'R']) {
    if (driver === locked) continue;
    const st = { V: 1, I: 1, R: 1 }; st[locked] = L;
    const share = A.liveShare(locked, driver, st), b = brute(locked, driver, st), formula = 1 - Math.abs(Math.log10(L)) / 2;
    worst = Math.max(worst, Math.abs(share - b), Math.abs(share - formula));
  }
  check('live share of a free slider = 1 − |log₁₀ L| ÷ 2, for every lock, driver and locked value tried, matched by brute force', worst < 2e-5, `worst gap ${worst.toExponential(1)}`);
  const st4 = { V: 3, I: 0.75, R: 4 }, b4 = A.band('R', 'V', st4);
  check('R locked at 4: V lives from 0.4 to 10, the bottom 30.1% of its slider dead', near(b4[0], 0.4, 1e-12) && near(b4[1], 10, 1e-12) && near(1 - A.liveShare('R', 'V', st4), 0.301, 0.0005), `${b4[0]} to ${b4[1]}, dead ${pct(1 - A.liveShare('R', 'V', st4))}`);
  const shares = [1, 2, 4, 10, 0.25, 0.1].map((L) => A.liveShare('R', 'V', { V: 1, I: 1, R: L }));
  check('survey: locked at 1, 2, 4, 10, 0.25, 0.1 leaves 100, 84.9, 69.9, 50, 69.9, 50%', [1, 0.849, 0.699, 0.5, 0.699, 0.5].every((w, i) => near(shares[i], w, 0.0006)), shares.map(pct).join(', '));
  // the move stops at the edge, and the jsx would not
  const m = A.move('R', 'V', 0.1, { V: 10, I: 2.5, R: 4 }), j = A.jsxMove('R', 'V', 0.1, { V: 10, I: 2.5, R: 4 });
  check('the piece stops V at 0.4 with I at 0.1; the jsx reads I = 0.0250 with its thumb pinned at 0', m.stopped && near(m.at, 0.4, 1e-12) && near(m.s.I, 0.1, 1e-12) && near(j.readout, 0.025, 1e-12) && j.thumb === 0 && j.offSlider, `stop ${m.at}, I ${m.s.I}, jsx ${j.readout}, thumb ${j.thumb}`);
  // equation holds after any move
  worst = 0; let st = { V: 3, I: 0.75, R: 4 };
  for (let k = 0; k < 500; k++) { const locked = ['V', 'I', 'R'][k % 3], driver = ['I', 'R', 'V'][(k * 7) % 3]; if (locked === driver) continue; st = A.move(locked, driver, A.val(((k * 0.6180339) % 1)), st).s; worst = Math.max(worst, Math.abs(st.V / (st.I * st.R) - 1)); for (const x of ['V', 'I', 'R']) if (st[x] < 0.1 - 1e-9 || st[x] > 10 + 1e-9) worst = 1; }
  check('500 random moves: V = I × R holds and every value stays on its slider', worst < 1e-12, `worst ${worst.toExponential(1)}`);
}

// ── piece B · four rooms · § Cross-Domain Understanding ──
{
  const B = core('four rooms', 'ohm-b-core');
  console.log('— four rooms');
  // water, own: Poiseuille written here
  const mu = 1.0e-3, rho = 998;
  const r1 = B.waterRadius(1);
  check('water: R = 1 kPa per mL/s is a 1 m pipe of bore 2.53 mm (Poiseuille, 8μL ÷ πr⁴ = 1e9 Pa·s/m³)', near(8 * mu * 1 / (Math.PI * r1 ** 4), 1e9, 1) && near(2 * r1 * 1e3, 2.53, 0.005), `bore ${(2 * r1 * 1e3).toFixed(3)} mm`);
  check('water: halving the bore multiplies the resistance by 16', near(B.waterRadius(16) / B.waterRadius(1), 0.5, 1e-12), `${(B.waterRadius(16) / B.waterRadius(1)).toFixed(4)}`);
  const w1 = B.water(1, 1, 1);
  check('water, slow start: 1 kPa through R = 1 gives 1 mL/s, laminar, Re ≈ 504', near(w1.I, 1, 1e-9) && w1.regime === 'laminar' && near(w1.Re, 504, 3), `${w1.I.toFixed(4)} mL/s, Re ${w1.Re.toFixed(0)}`);
  const w8 = B.water(8, 0.2, 1);
  // own: Blasius, solved here by bisection on ΔP = f(Re) (L/D) ρ v²/2
  const D8 = 2 * B.waterRadius(0.2), dP = 8000;
  let lo = 0, hi = 50; for (let k = 0; k < 200; k++) { const v = (lo + hi) / 2, Re = rho * v * D8 / mu, f = 0.3164 * Re ** -0.25; if (f * (1 / D8) * rho * v * v / 2 < dP) lo = v; else hi = v; }
  const Qb = lo * Math.PI * (D8 / 2) ** 2 * 1e6;
  check('water, fast start: 8 kPa through a 3.78 mm bore is turbulent, and its flow is Blasius’s, solved here by bisection', w8.regime === 'turbulent' && near(w8.I / Qb, 1, 1e-6) && near(w8.bore, 3.78, 0.01), `${w8.I.toFixed(2)} mL/s vs ${Qb.toFixed(2)}, Re ${w8.Re.toFixed(0)}, Ohm would say 40`);
  // the transitional band: laminar Re past 2300 but Blasius Re under 4000 is labelled so, never 'turbulent'
  let trans = 0, mislabel = 0;
  for (let q = 0; q <= 1; q += 0.002) for (let k = 0; k <= 1; k += 0.01) { const w = B.water(B.val(q), B.val(k), 1); if (w.regime === 'transitional') { trans++; if (w.Re >= 4000) mislabel++; } if (w.regime === 'turbulent' && w.Re < 4000) mislabel++; if (w.regime === 'laminar' && w.Re >= 2300) mislabel++; }
  check('water: every regime label matches the Reynolds number shown (laminar < 2300, transitional, turbulent ≥ 4000), and the band exists on the sliders', mislabel === 0 && trans > 0, `${trans} transitional states, ${mislabel} mislabelled`);
  const r3 = 8 * 1e-3 / (Math.PI * (1.5e-3) ** 4) / 1e9, near3 = B.water(2.8, r3, 1);
  check('water: just past the switch (3 mm bore, 2.8 kPa, laminar Re would be 2358) the readout says transitional, not turbulent', near3.regime === 'transitional', `${near3.regime}, Re ${near3.Re.toFixed(0)}`);
  check('water, fast: push × 2 gives × 1.486 = 2^(4/7), Blasius smooth pipe (√2 would be fully rough)', near(B.water(16, 0.2, 1).I / B.water(8, 0.2, 1).I, 2 ** (4 / 7), 1e-9), (B.water(16, 0.2, 1).I / B.water(8, 0.2, 1).I).toFixed(4));
  check('water: turbulent, doubling the flow takes 2^1.75 = 3.36× the pressure', near(2 ** 1.75, 3.36, 0.005), (2 ** 1.75).toFixed(3));
  // light
  check('light, depth: τ 0.2 → 0.4 leaves 81.9%; τ 2 → 4 leaves 13.5%', near(B.light(1, 0.4, 1, 'depth').I / B.light(1, 0.2, 1, 'depth').I, 0.819, 0.0005) && near(B.light(1, 4, 1, 'depth').I / B.light(1, 2, 1, 'depth').I, 0.135, 0.0005), 'Beer–Lambert, e^(−τ)');
  let never = true; for (let q = 0; q <= 1; q += 1e-4) { const t = B.val(q); if (Math.abs(B.light(1, t, 1, 'depth').I / B.ohm(1, t) - 1) < 0.01) never = false; }
  check('light, depth: Ohm’s 1 ÷ τ and e^(−τ) never agree within 1% anywhere on the slider (τ e^(−τ) ≤ 1/e)', never, 'max of τe^(−τ) is 0.368');
  check('light, depth: at τ = 0.1 Ohm passes 10× the source; the physics 90.5%', near(B.ohm(1, 0.1), 10, 1e-12) && near(B.light(1, 0.1, 1, 'depth').I, 0.905, 0.0005), `${B.ohm(1, 0.1)}, ${B.light(1, 0.1, 1, 'depth').I.toFixed(4)}`);
  check('light, in ÷ out: no filter below 1; two of opacity 5 in series pass 4% of the source, a second filter cutting 20% to 4% (a fifth), where a second resistor halves', !isFinite(B.light(1, 0.5, 1, 'ratio').I) && near(B.light(1, 5, 2, 'ratio').I, 0.04, 1e-12) && near(B.light(1, 5, 1, 'ratio').I, 0.2, 1e-12) && near(B.light(1, 5, 2, 'ratio').I / B.light(1, 5, 1, 'ratio').I, 0.2, 1e-12), 'opacities multiply');
  check('light, depth: the 81.9% and 13.5% are of what the filter passed before, doubling τ from 0.2 and from 2 (from 0.1 and 1 they would be 90.5% and 36.8%)', near(Math.exp(-0.4) / Math.exp(-0.2), 0.819, 0.0005) && near(Math.exp(-4) / Math.exp(-2), 0.135, 0.0005) && near(B.light(1, 0.2, 1, 'depth').I / B.light(1, 0.1, 1, 'depth').I, 0.905, 0.0005) && near(B.light(1, 2, 1, 'depth').I / B.light(1, 1, 1, 'depth').I, 0.368, 0.0005), 'ratios, not shares of the source');
  // sound
  check('sound: air’s ρc = 413 Pa·s/m, helium’s 168, water’s 1.48 million', near(B.SOUND.air * 1000, 413, 0.5) && near(B.SOUND.helium * 1000, 167.6, 0.5) && near(B.SOUND.water * 1e3, 1.479e6, 2e3), `${(B.SOUND.air * 1000).toFixed(1)}, ${(B.SOUND.helium * 1000).toFixed(1)}, ${(B.SOUND.water * 1000).toExponential(3)}`);
  check('sound: 1 Pa is 94 dB SPL and moves air’s particles at 2.42 mm/s; 8 Pa is 112 dB', near(B.spl(1), 93.98, 0.01) && near(B.sound(1, B.SOUND.air, 1).I, 2.42, 0.005) && near(B.spl(8), 112.04, 0.01), `${B.spl(1).toFixed(2)} dB, ${B.sound(1, B.SOUND.air, 1).I.toFixed(3)} mm/s, ${B.spl(8).toFixed(2)} dB`);
  check('sound: water’s impedance is about 3600× air’s', near(B.SOUND.water / B.SOUND.air, 3580, 15), (B.SOUND.water / B.SOUND.air).toFixed(0));
  // labour, own: P = W h ÷ t, so rate = P ÷ (W h)
  check('labour, power: 50 W lifting 10 N boxes 1 m is 5 boxes a second, Ohm exactly', near(B.labour(5, 1, 1, 'power').I, 50 / (10 * 1), 1e-12) && near(B.labour(5, 1, 1, 'power').I, B.ohm(5, 1), 1e-12), `${B.labour(5, 1, 1, 'power').I}`);
  check('labour, force: past the weight, more force moves no more boxes; below it, none', B.labour(4, 1, 1, 'force').I === B.labour(2, 1, 1, 'force').I && B.labour(0.9, 1, 1, 'force').I === 0, `${B.labour(2, 1, 1, 'force').I}, ${B.labour(4, 1, 1, 'force').I}, ${B.labour(0.9, 1, 1, 'force').I}`);
  // the test table, every row
  const T = B.STARTS.map((o) => ({ o, r: B.runStart(o) }));
  const row = (i) => T[i].r.map((x) => (x.pass === null ? 'n/a' : x.ratio.toFixed(3) + (x.pass ? '✓' : '✗'))).join(' ');
  T.forEach((t, i) => console.log(`      ${t.o.label.padEnd(44)} ${row(i)}`));
  const passAll = (i) => T[i].r.every((x) => x.pass !== false);
  check('water: the slow start passes all three; the fast start fails all three', passAll(0) && T[1].r.every((x) => x.pass === false), `${row(0)} | ${row(1)}`);
  check('water, fast: push × 2 gives × 1.486 (2^(1/1.75))', near(T[1].r[0].ratio, 2 ** (1 / 1.75), 1e-6), T[1].r[0].ratio.toFixed(4));
  check('light, depth: push passes, resistance and series fail, from both starts', [2, 3].every((i) => T[i].r[0].pass && !T[i].r[1].pass && !T[i].r[2].pass), `${row(2)} | ${row(3)}`);
  check('light, in ÷ out: push and resistance pass, series fails, from both starts', [4, 5].every((i) => T[i].r[0].pass && T[i].r[1].pass && !T[i].r[2].pass), `${row(4)} | ${row(5)}`);
  check('sound: push and resistance pass, series n/a, from both starts', [6, 7].every((i) => T[i].r[0].pass && T[i].r[1].pass && T[i].r[2].pass === null), `${row(6)} | ${row(7)}`);
  check('labour, power: all three pass from both starts', passAll(8) && passAll(9), `${row(8)} | ${row(9)}`);
  check('labour, force: push × 2 gives × 1.000 from both starts; the heavier start lifts nothing at twice the weight', [10, 11].every((i) => near(T[i].r[0].ratio, 1, 1e-12)) && T[11].r[1].ratio === 0, `${row(10)} | ${row(11)}`);
  check('no single reading of light passes all three moves', ![2, 3, 4, 5].some(passAll), 'depth fails the law, in ÷ out fails the series');
}

console.log(fails ? `\n${fails} FAIL` : '\nall PASS');
process.exit(fails ? 1 : 0);
