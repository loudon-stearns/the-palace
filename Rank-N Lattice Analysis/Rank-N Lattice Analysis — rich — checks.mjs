// title: Rank-N Lattice Analysis — rich — checks
// born: 2026-11-03
// links: [[Rank-N Lattice Analysis]] (connects-to · rich-face-workshop) · re-checks the two made pieces listed in [[Rank-N Lattice Analysis — rich.json]]
// forward_vector: I re-run every number the two made pieces, their captions and the manifest's offers state, on each piece's own engine (its <script id="engine">), so a challenger or a re-tune can check them without a browser. Run: node "Rank-N Lattice Analysis — rich — checks.mjs" (about half a minute).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const engine = (what, names) => { const s = readFileSync(join(here, `Rank-N Lattice Analysis — rich — ${what}.html`), 'utf8'); const m = s.match(/<script id="engine">([\s\S]*?)<\/script>/); return new Function(`${m[1]}; return { ${names} };`)(); };
const FS = 48000, TOLS = [2, 5, 10];

// ── how many clocks: the made sources ──
{ const E = engine('how many clocks', 'fitRanks, chanceSet, SOURCES, SINE, HARMONIC, TWO_CLOCKS, RANDOM, freeBits');
  const top = (s, k) => s.P.slice().sort((a, b) => b[1] - a[1]).slice(0, k).sort((a, b) => a[0] - b[0]);
  const fmt = (R) => `${R.fit.w.length} clock${R.fit.w.length === 1 ? '' : 's'}${R.fit.w.length ? ' (' + R.fit.w.map((v) => v.toFixed(2)).join(', ') + ' Hz)' : ''} + ${R.fit.lone} alone = rank ${R.fit.rank}, ${R.fit.bits.toFixed(1)} bits vs ${R.fits[0].bits.toFixed(1)} outright`;
  console.log(`how many clocks — a free frequency costs ${E.freeBits(5).toFixed(2)} bits at 5 cents, ${E.freeBits(2).toFixed(2)} at 2, ${E.freeBits(10).toFixed(2)} at 10`);
  for (const [n, P] of [['one sine', E.SINE], ['harmonic tone', E.HARMONIC], ['two clocks', E.TWO_CLOCKS]]) for (const tol of [1, 5, 20]) console.log(`  ${n.padEnd(14)} τ=${String(tol).padStart(2)}: ${fmt(E.fitRanks(P, { tol }))}`);
  for (const tol of TOLS) { const F = E.fitRanks(E.RANDOM, { tol, free: true, M1: 16, M2: 16 }), R = E.fitRanks(E.RANDOM, { tol });
    console.log(`  random 12      τ=${String(tol).padStart(2)}: free steps (±16): ${F.fit.w.length} clocks reach ${F.fit.on} of 12 · steps cost bits: ${fmt(R)}`); }
  // free steps, many random draws: how often do two clocks reach every partial?
  { let all = 0, reach = 0; for (let s = 1; s <= 40; s++) { const F = E.fitRanks(E.chanceSet(E.HARMONIC, 500 + s), { tol: 5, free: true, M1: 16, M2: 16 }); reach += F.fit.on; if (F.fit.on === 12) all++; }
    console.log(`  40 random draws of 12, τ=5, free steps: two clocks reach ${(reach / 40).toFixed(1)} of 12 on average, all 12 in ${all} of 40`); }

  // ── the test: every measured source, against chance ──
  console.log('how many clocks — measured sources, 24 loudest partials within 40 dB, frame at 0.19 s; chance = 12 seeded draws (seeds 101–112, as the piece)');
  for (const s of SOURCESORDER(E)) for (const tol of TOLS) {
    const P = top(s, 24), R = E.fitRanks(P, { tol }), ch = [], cs = []; for (let k = 1; k <= 12; k++) { const C = E.fitRanks(E.chanceSet(P, 100 + k), { tol }); ch.push(C.fit.rank); cs.push(C.fits[0].bits - C.fit.bits); }
    const tot = P.reduce((a, p) => a + p[1] * p[1], 0), car = R.fit.assign.filter((q) => q.ok).reduce((a, q) => a + q.a * q.a, 0) / tot;
    console.log(`  ${s.name.padEnd(18)} τ=${String(tol).padStart(2)} n=${String(P.length).padStart(2)}: ${fmt(R)} · chance ranks ${Math.min(...ch)}–${Math.max(...ch)} · saves ${(R.fits[0].bits - R.fit.bits).toFixed(1)} bits, chance at most ${Math.max(...cs).toFixed(1)} · energy reached ${(100 * car).toFixed(1)} %`);
  }
  const A2 = E.SOURCES.find((s) => s.id === 'piano-A2');
  for (const tol of TOLS) console.log(`  piano A2, τ=${tol}, rank by partials counted:`, [4, 8, 12, 16, 20, 24].map((k) => `${k}→${E.fitRanks(top(A2, k), { tol }).fit.rank}`).join(' '));
  // a third clock: does it ever pay?
  let paid = 0; for (const s of E.SOURCES) for (const tol of TOLS) { const R = E.fitRanks(top(s, 24), { tol, maxClocks: 3 }); if (R.fit.w.length === 3) { paid++; console.log(`  a third clock pays: ${s.name} τ=${tol}`); } }
  console.log(`  a third clock paid in ${paid} of ${E.SOURCES.length * TOLS.length} measured fits`);
}
function SOURCESORDER(E) { return E.SOURCES; }

// ── read both ways: the round trip ──
{ const E = engine('read both ways', 'fitRanks, SOURCES, TWO_CLOCKS, buildField, readField, levelAt, roundTrip');
  const top = (s) => s.P.slice().sort((a, b) => b[1] - a[1]).slice(0, 24).sort((a, b) => a[0] - b[0]);
  const snap = (d) => [1, 2, 3, 4, 5, 6].map((k) => [220 * k * (k === 5 ? Math.pow(2, d / 1200) : 1), 1 / k]);
  console.log('read both ways — fit at τ, written onto a 256 × 256 torus, read back at 48 kHz, each reached partial measured at its lattice frequency');
  const run = (name, P, tol, S = 256) => { const R = E.fitRanks(P, { tol }), T = E.buildField(R.fit, S, 5), rt = E.roundTrip(T, FS), tot = P.reduce((a, p) => a + p[1] * p[1], 0), car = T.pts.reduce((a, p) => a + p.a * p.a, 0) / tot;
    console.log(`  ${name.padEnd(22)} τ=${String(tol).padStart(2)} S=${S}: ${R.fit.w.length} clock(s) ${R.fit.w.map((v) => v.toFixed(3)).join('/')} · back ${R.fit.on}/${R.fit.n} · rank ${R.fit.rank} · energy carried ${(100 * car).toFixed(1)} % · levels within ${rt.worstDb.toFixed(3)} dB · largest move ${Math.max(0, ...T.pts.map((p) => p.err)).toFixed(2)} c · most steps ${Math.max(0, ...T.pts.map((p) => Math.max(Math.abs(p.m), Math.abs(p.n))))}`); };
  run('two partials', [[220, 1], [440, 0.6]], 5); run('two clocks', E.TWO_CLOCKS, 5);
  for (const d of [3, 5, 6, 8]) run(`fifth partial +${d} c`, snap(d), 5);
  for (const s of E.SOURCES) for (const tol of [5]) run(s.name, top(s), tol);
  for (const S of [32, 64]) run('piano A2 · 110 Hz', top(E.SOURCES.find((s) => s.id === 'piano-A2')), 5, S);
}
