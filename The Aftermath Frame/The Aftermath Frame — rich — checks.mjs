// title: The Aftermath Frame — rich — checks
// born: 2026-11-03
// links: [[The Aftermath Frame]] (connects-to · rich-face-workshop) · re-checks the two made pieces listed in [[The Aftermath Frame — rich.json]]
// forward_vector: I re-run every number the two made pieces and the manifest's offers state, on each piece's own engine (its <script id="engine">), so a challenger or a re-tune can check them without a browser. Run: node "The Aftermath Frame — rich — checks.mjs" (a few seconds). The Blender half is "The Aftermath Frame — rich — tool check.py".
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const html = (what) => readFileSync(join(here, `The Aftermath Frame — rich — ${what}.html`), 'utf8');
const block = (src, id) => src.match(new RegExp(`<script id="${id}">([\\s\\S]*?)<\\/script>`))[1];
const load = (what) => new Function(`${block(html(what), 'engine')}; return { RIG, ACTIONS, POSED, solveMotion, consequences, frame, gainCheck, pageCheck, woodCheck, woodControl, S9, add, mul, unit, len, angleBetween };`)();
const f = (x, d = 3) => x.toFixed(d);
let bad = 0; const expect = (ok, what) => { if (!ok) { bad++; console.log('  UNEXPECTED: ' + what); } };

// both pieces carry the same engine
expect(block(html('a swing is a rotation'), 'engine') === block(html('the gain and the motion'), 'engine'), 'the two pieces carry different engines');

{ const E = load('a swing is a rotation');
  console.log('a swing is a rotation · the page\'s numbers (pass iff each rounds to the page\'s figure)');
  const pc = E.pageCheck(); for (const r of pc.rows) console.log(`  ${r.name.padEnd(12)} ${f(r.got)} vs ${r.page}  ${r.pass ? 'pass' : 'FAIL'}`);
  expect(pc.pass, 'page check failed at the authored chop');
  const slow = E.pageCheck({ ...E.RIG, T_IMPACT: 0.30 }); console.log(`  null: T = 300 ms gives ω ${f(slow.rows[1].got)} → ${slow.pass ? 'pass' : 'FAIL'} (must fail)`); expect(!slow.pass, 'the page check cannot fail');
  for (const a of Object.keys(E.ACTIONS)) { const M = E.solveMotion(a); console.log(`  ${a.padEnd(7)} Δθ ${f(M.dTheta * 180 / Math.PI)}° ω ${f(M.omegaPeak)} tip ${f(M.tip)} | session 9: ${E.S9[a].join(' / ')}`); }
  console.log('a swing is a rotation · where the blade first meets the wood (pass iff nothing inside before impact and contact within 1 cm of the surface)');
  for (const a of Object.keys(E.ACTIONS)) { const w = E.woodCheck(a), b = E.POSED[a].firstInWood;
    console.log(`  ${a.padEnd(7)} contact ${f(w.contactGap * 100, 1)} cm off the wood · first in wood ${f(w.first.ms, 1)} ms, ${f(w.first.turnedDeg, 1)}° of ${f(w.M.dTheta * 180 / Math.PI, 1)}°, r ${f(w.first.r)} m (Blender: ${b.ms} ms, ${b.turnedDeg}°) · impact blade enters at ${f(w.speedAtWood, 2)} m/s vs v_c ${f(E.len(w.M.vC), 2)} · ${w.pass ? 'pass' : 'FAIL'}`);
    expect(Math.abs(w.first.ms - b.ms) < 0.5, a + ' first touch disagrees with Blender'); }
  const c = E.woodControl(); console.log(`  control (blade ends at the contact, stump top edge at the contact): ${c.pass ? 'pass' : 'FAIL'} (must pass)`); expect(c.pass, 'the wood check cannot pass');
  for (const a of Object.keys(E.ACTIONS)) { const M = E.solveMotion(a); let last = null, minz = 9;
    for (let i = 0; i <= 4000; i++) { const u = i / 4000, z = E.add(M.P, E.mul(M.bladeDir(u), M.rig.R_TIP))[2]; minz = Math.min(minz, z); if (z < 0) last = u; }
    console.log(`  ${a.padEnd(7)} lowest tip ${f(minz, 2)} m${last ? ` · below z = 0 (where the tool plants the feet) until ${f(last * 250, 0)} ms` : ''}`); }
}

{ const src = html('the gain and the motion'), E = load('the gain and the motion');
  const TOOL_RUN = new Function(`${src.match(/const TOOL_RUN = [^\n]*;/)[0]}; return TOOL_RUN;`)();
  console.log('the gain and the motion · gain 1 vs 10 (pass iff the motion is bit-identical and count and streak grew)');
  for (const leak of [false, true]) for (const a of Object.keys(E.ACTIONS)) { const c = E.gainCheck(a, { leak }), s1 = c.lo.cons.stats, s2 = c.hi.cons.stats;
    console.log(`  ${(a + (leak ? ' · null' : '')).padEnd(14)} ${c.pass ? 'pass' : 'FAIL'} · max |Δv_c| ${c.dv.toExponential(2)} · v_c ${c.lo.motion.vC.map((x) => f(x, 6)).join(', ')} → ${c.hi.motion.vC.map((x) => f(x, 6)).join(', ')} · shards ${s1.shards}→${s2.shards} · streak ${f(s1.streak * 1000, 2)}→${f(s2.streak * 1000, 2)} mm`);
    expect(c.pass === !leak, `${a} leak=${leak} gave ${c.pass}`); }
  const honest = TOOL_RUN.filter((r) => !r.leak), leaky = TOOL_RUN.filter((r) => r.leak);
  const same = (rs) => rs.every((r) => r.vc.every((x, i) => x === rs[0].vc[i]));
  console.log(`  the tool in Blender (baked): v_c identical across punch 0, 1, 3.9: ${same(honest)} · in the leaky copy: ${same(leaky)}`); expect(same(honest) && !same(leaky), 'baked tool run');
  const M = E.solveMotion('chop'); console.log(`  port vs Blender v_c (chop): ${M.vC.map((x, i) => f(x - honest[0].vc[i], 7)).join(', ')}`);
  console.log('the gain and the motion · does the spray still point? pooled over 400 seeds (length of the mean unit direction; angle of the mean from v_c)');
  for (const g of [1, 1.8, 2.6, 10]) { let s = [0, 0, 0], n = 0;
    for (let seed = 1; seed <= 400; seed++) for (const sh of E.consequences(M, g, 0.018, seed).shards) { s = E.add(s, sh.dir); n++; }
    const m = E.mul(s, 1 / n); console.log(`  gain ${String(g).padEnd(4)} coherence ${f(E.len(m))} · mean ${f(E.angleBetween(m, M.vC) * 180 / Math.PI, 2)}° off v_c · ${n} shards`); }
}
console.log(bad ? `${bad} unexpected` : 'every check came out as stated');
process.exitCode = bad ? 1 : 0;
