// title: Threshold Conatus — rich — checks
// born: 2026-11-04
// links: [[Threshold Conatus]] (connects-to · rich-face-check) · checks "Threshold Conatus — rich — refractory preference.html"
// forward_vector: I re-run, headless, every number the refractory-preference piece shows, on the piece's own
//   engine pulled out of its ENGINE block, and I say what number would have meant failure.
// run: node "Threshold Conatus/Threshold Conatus — rich — checks.mjs"   (exit 1 on any failure)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, 'Threshold Conatus — rich — refractory preference.html'), 'utf8');
const src = html.slice(html.indexOf('/* ENGINE:START'), html.indexOf('/* ENGINE:END */'));
const E = new Function(src + '\nreturn { TC, GRID, RULE, ThresholdEngine, runTrain, pairedTrain, gridPairs, barsFrom, scoreArm, verdict };')();
let fails = 0; const ok = (cond, line) => { console.log((cond ? 'pass  ' : 'FAIL  ') + line); if (!cond) fails++; };
const arms = [[false, false, 'no recovery'], [true, false, 'absolute only'], [false, true, 'relative only'], [true, true, 'absolute, then relative']];
const c = E.TC;
function predicted(abs, rel, d) {
  if (abs && d < c.ABS_MS) return Infinity;
  const V = rel ? c.AHP * Math.exp(-(abs ? d - c.ABS_MS : d) / c.TAU_MS) : 0, need = c.THETA - V;
  const k = E.GRID.STRENGTHS.findIndex(s => s >= need - 1e-9); return k < 0 ? Infinity : E.GRID.STRENGTHS[k];
}
// 1. the engine against its own equation (fail: any mismatch)
let mism = 0; for (const [a, r] of arms) E.scoreArm(a, r).bars.forEach(b => { if (b.bar !== predicted(a, r, b.d)) mism++; });
ok(mism === 0, `measured bar against bar = θ − V(t), rounded up to the grid: ${mism} mismatches of ${arms.length * E.GRID.DELTAS.length}`);
// 2. every conditioning stimulus crosses (fail: any refused, the pairs would not start from a crossing)
for (const [a, r, n] of arms) { const S = E.scoreArm(a, r); ok(S.condOk === S.condN, `${n}: first stimulus crossed ${S.condOk} of ${S.condN}`); }
// 3. order null, and its control (fail: any change at 40 ms; and the control must change something at 12 ms, or the null can't see a leak)
function rng(seed) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
const shuf = (() => { const o = E.gridPairs(), r = rng(7); for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; })();
const diffAt = gap => { let n = 0; for (const [a, r] of arms) { const A = E.scoreArm(a, r, E.gridPairs(), gap), B = E.scoreArm(a, r, shuf, gap); for (const k in A.map) if (A.map[k] !== B.map[k]) n++; } return n; };
const d40 = diffAt(40), d12 = diffAt(12);
ok(d40 === 0, `order null: ${d40} cells change when the pairs are shuffled, 40 ms apart`);
ok(d12 > 0, `order null's control: ${d12} cells change at 12 ms apart, so the null can see a leak`);
// 4. noise control (fail: any jittered state-blind threshold called graduated)
const kinds = {}; for (let s = 1; s <= 500; s++) { const r = rng(s), map = {}; E.pairedTrain(E.gridPairs()).forEach(st => { if (!st.cond) map[st.p.d + '|' + st.p.s] = st.s >= 1 + 1.2 * r(); }); const k = E.verdict(E.barsFrom(map)).kind; kinds[k] = (kinds[k] || 0) + 1; }
ok(!kinds.graduated, `noise control, 500 state-blind thresholds jittered 1.0 to 2.2: ${JSON.stringify(kinds)}`);
// 5. the verdicts, both arms of the claim and the two halves
const V = arms.map(([a, r, n]) => { const S = E.scoreArm(a, r), v = E.verdict(S.bars); console.log(`      ${n.padEnd(24)} ${v.kind.padEnd(17)} ${S.crossed}/${S.probes} cross · bars ${S.bars.map(b => isFinite(b.bar) ? b.bar : '—').join(' ')}`); return v.kind; });
ok(V[3] === 'graduated', `full recovery: ${V[3]} (the section's preference structure)`);
ok(V[0] === 'none', `recovery removed: ${V[0]} (the choosing gone)`);
console.log(`      halves: absolute alone ${V[1]}, relative alone ${V[2]}`);
// 6. the walk's bar curve, measured by bisection, against the equation at three delays (fail: off by more than 1e-6)
const cross = (a, r, d, s) => E.runTrain(a, r, [{ t: 5, s: E.GRID.COND }, { t: 5 + d, s }])[1];
for (const d of [2.5, 5, 10]) { let lo = 0.3, hi = 1e4; for (let k = 0; k < 60; k++) { const m = Math.sqrt(lo * hi); if (cross(true, true, d, m)) hi = m; else lo = m; }
  const n = Math.round(d / c.DT) - Math.round(c.ABS_MS / c.DT), eq = c.THETA - c.AHP * Math.exp(-c.DT / c.TAU_MS * (n - 1));
  ok(Math.abs(hi - eq) < 1e-6, `bar at ${d} ms: measured ${hi.toFixed(6)}, equation ${eq.toFixed(6)} (sampled at ${c.DT} ms)`); }
process.exit(fails ? 1 : 0);
