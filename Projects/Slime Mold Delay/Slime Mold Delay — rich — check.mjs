// title: Slime Mold Delay — rich — check
// born: 2026-11-03
// links: [[Slime Mold Delay]] (connects-to · rich-face-check) · checks "Slime Mold Delay — rich — roads that compete.html"
//        and "Slime Mold Delay — rich — eat and starve.html", and the two gathered renders their captions quote
// forward_vector: I am the proof behind every number the Slime Mold Delay rich face states. I load each piece's own
//   engine and model, say when the engine there differs from the flow dish's, re-run the walk's steps and both tests,
//   check the model's dishes against the steward's mesh_dish_check.mjs, and read the 2026-10-13 renders' logs and sound.
//   I write nothing. Run: node "Slime Mold Delay — rich — check.mjs" [--quick]
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url)), quick = process.argv.includes('--quick');
const read = f => readFileSync(join(here, f), 'utf8');
const block = (html, id) => (html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)<\\/script>`)) || [])[1];
const dish = read('slime-mold-flow-dish.html');
const PIECES = { roads: read('Slime Mold Delay — rich — roads that compete.html'), starve: read('Slime Mold Delay — rich — eat and starve.html') };
const load = html => new Function('module', block(html, 'engine') + '\n' + block(html, 'model') + '\nreturn Model;')(undefined);
const refOf = html => new Function('return ' + html.match(/const REF = (\{[\s\S]*?\});\n/)[1])();
let fails = 0; const ok = (name, pass, got) => { if (!pass) fails++; console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}  ${got ?? ''}`); };
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// 1 · one engine: each piece carries the dish's engine block byte for byte, and both pieces carry the same model
for (const [k, h] of Object.entries(PIECES)) ok(`engine in "${k}" is the flow dish's, byte for byte`, block(h, 'engine') === block(dish, 'engine'));
ok('the two pieces carry the same model', block(PIECES.roads, 'model') === block(PIECES.starve, 'model'));
const M = load(PIECES.roads), T = M.TICK;

// 2 · step 1: one tube
{ const S = M.one(0.6); let at2, S0D3; for (let k = 0; k < 10 * T; k++) { S.tick(); if (k === 2 * T - 1) at2 = S.E.tubes[0].D; if (k === 3 * T - 1) S0D3 = S.E.tubes[0].D; }
  S.P.on[0] = false; let gone = null; for (let k = 0; k < 25 * T; k++) { S.tick(); if (gone == null && (!S.E.tubes.length || S.E.tubes[0].retract >= 0)) gone = k / T; }
  ok('step 1: the tube reaches D = 0.99 in two seconds and settles at 1.00', near(at2, 0.99, 0.005) && near(S0D3, 1, 0.003), `D(2 s) = ${at2.toFixed(3)}, D(3 s) = ${S0D3.toFixed(3)}`);
  ok('step 1: silenced, it pulls back 12.0 s later', gone != null && near(gone, 12.0, 0.1), `${gone?.toFixed(2)} s`);
  ok('step 1: echo after L ÷ v = 0.60 ÷ 0.9 = 0.67 s', near(0.6 / M.V, 0.667, 0.001)); }
// 3 · step 2: two roads, one load
{ const r = {}; for (const law of ['sigmoid', 'power']) { const S = M.two(law); let cut = null;
    for (let k = 0; k < 20 * T; k++) { S.tick(); if (cut == null && !M.live(S.E, S.roads[1][0])) cut = (k + 1) / T; }
    r[law] = { a: S.roads[0][0].D, b: M.live(S.E, S.roads[1][0]) ? S.roads[1][0].D : 0, cut, La: S.roads[0][0].L + S.roads[0][1].L, Lb: S.roads[1][0].L + S.roads[1][1].L }; }
  ok('step 2: saturating keeps both roads, 0.79 and 0.37 thick at 20 s', near(r.sigmoid.a, 0.79, 0.006) && near(r.sigmoid.b, 0.37, 0.006) && r.sigmoid.cut == null, `${r.sigmoid.a.toFixed(3)} / ${r.sigmoid.b.toFixed(3)}`);
  ok('step 2: competing cuts the long road at 2.8 s; the short one carries D = 1.00', r.power.cut != null && near(r.power.cut, 2.8, 0.05) && near(r.power.a, 1, 0.005), `cut ${r.power.cut?.toFixed(2)} s, D ${r.power.a.toFixed(3)}`);
  ok('step 2: echoes at 0.74 s and 0.97 s', near(r.power.La / M.V, 0.74, 0.005) && near(r.power.Lb / M.V, 0.97, 0.005), `${(r.power.La / M.V).toFixed(3)} / ${(r.power.Lb / M.V).toFixed(3)}`);
  ok('step 2: half the flow earns 0.35 of the growth under γ = 1.5', near(Math.pow(0.5, M.SE.P.POW_G), 0.354, 0.001)); }
// 4 · step 3: taking turns
{ const one = { false: 0, true: 0 }; for (const turns of [false, true]) for (let s = 1; s <= 20; s++) { const S = M.ladder(turns, s); for (let k = 0; k < 30 * T; k++) S.tick(); if (M.roadsToListener(S.E) === 1) one[turns]++; }
  ok('step 3: turns off, every seed keeps two roads (0 of 20 merge)', one.false === 0, `${one.false} of 20`);
  ok('step 3: turns on, 12 of 20 merge into one road', one.true === 12, `${one.true} of 20`);
  const S = M.ladder(true, 2); for (let k = 0; k < 30 * T; k++) S.tick(); ok('step 3: seed 2, the default, merges', M.roadsToListener(S.E) === 1); }
// 5 · the forty-dish test: the model's port against the steward's check, then every row against the piece's REF
process.env.NO_MAIN = '1';
const SC = await import(join(here, 'headless', 'mesh_dish_check.mjs'));
{ const optsOf = r => ({ start: r.start, ...(r.law === 'power' ? { law: 'power' } : {}), ...(r.turns ? { drain: 'shared', pulse: true } : {}) });
  let same = 0, n = 0; for (const r of M.ROWS) for (const seed of [200, 213, 227]) { n++; const a = M.runDish(r, seed), b = SC.run(SC.ALL4, { seed, dish: SC.CLUSTER, budget: 2.4, ...optsOf(r) }); if (a.ratio === b.vs_mst && a.heard === b.heard) same++; }
  ok('step 5: the model\'s dish is mesh_dish_check.mjs\'s dish (6 rows × 3 seeds)', same === n, `${same} of ${n}`); }
const REF = refOf(PIECES.roads);
for (const r of M.ROWS) { const rs = Array.from({ length: quick ? 0 : 40 }, (_, i) => M.runDish(r, 200 + i)); if (quick) continue;
  const s = M.summarize(rs); ok(`step 5: ${r.name}: median ${REF[r.id].median}×, ${REF[r.id].allFed} of 40 fed`, s.median === REF[r.id].median && s.allFed === REF[r.id].allFed && near(s.meanHeard, REF[r.id].meanHeard, 1e-9), `${s.median}× · ${s.allFed} · heard ${s.meanHeard}`); }
ok('step 5: the page\'s 1.73 and 1.28 are the check\'s 1.731 and 1.284, rounded', REF.c10.median.toFixed(2) === '1.73' && REF.now.median.toFixed(2) === '1.28');

// 6 · eat and starve
const R2 = refOf(PIECES.starve), mean = (rs, k) => rs.reduce((s, x) => s + x[k], 0) / rs.length;
for (const id of ['now', 'c10']) for (const starve of [false, true]) { if (quick) break; const row = M.ROWS.find(r => r.id === id), rs = Array.from({ length: 40 }, (_, i) => M.eatStarve(row, 200 + i, starve)), ref = R2[`${id}:${+starve}`];
  const got = { pruned: mean(rs, 'pruned'), grown: mean(rs, 'grown'), D: mean(rs, 'Dratio'), send: mean(rs, 'gainRatio') };
  ok(`eat/starve: ${id} · ${starve ? 'starve' : 'eat'}`, near(got.pruned, ref.pruned, 0.0015) && near(got.grown, ref.grown, 0.0015) && near(got.D, ref.D, 0.0015) && near(got.send, ref.send, 0.0015),
    `pruned ${got.pruned.toFixed(3)} · grown ${got.grown.toFixed(3)} · ΣD ${got.D.toFixed(3)} · Σsend ${got.send.toFixed(3)} (${(20 * Math.log10(got.send)).toFixed(2)} dB)`); }
if (!quick) { const now = M.ROWS.find(r => r.id === 'now'), pct = {};
  const age = { eat: [0, 0], starve: [0, 0] };
  for (const starve of [false, true]) { const all = [];
    for (let s = 200; s < 240; s++) { const d = M.dish(now, s, 32); while (d.k < 600) d.tick(1); const D0 = new Map(d.E.tubes.filter(t => t.retract < 0).map(t => [t, t.D]));
      d.E.hooks.event = (tt, kind, t) => { if (kind === 'retract') age[starve ? 'starve' : 'eat'][t.born >= 600 ? 0 : 1]++; };
      while (d.k < d.ticks) d.tick(starve ? 0 : 1); for (const [t, d0] of D0) if (d.E.tubes.includes(t) && t.retract < 0 && d0 > 0.02) all.push(t.D / d0); }
    all.sort((a, b) => a - b); const q = p => all[Math.floor(p * (all.length - 1))]; pct[starve] = [q(0.05), q(0.5), q(0.95)]; }
  ok('eat/starve: starving leaves the middle road at 0.625, p5–p95 0.07–1.66', near(pct.true[1], 0.625, 0.003) && near(pct.true[0], 0.07, 0.006) && near(pct.true[2], 1.66, 0.006), pct.true.map(x => x.toFixed(3)).join(' · '));
  ok('eat/starve: fed, the middle road at 1.00, p5–p95 0.12–2.81', near(pct.false[1], 1, 0.003) && near(pct.false[0], 0.12, 0.006) && near(pct.false[2], 2.81, 0.006), pct.false.map(x => x.toFixed(3)).join(' · '));
  ok('eat/starve: cuts begun on older tubes, current law: starve 1.3, eat 2.1 a colony', near(age.starve[1] / 40, 1.3, 0.05) && near(age.eat[1] / 40, 2.05, 0.05), `${age.starve[1] / 40} · ${age.eat[1] / 40}`); }
{ const c10 = M.ROWS.find(r => r.id === 'c10'); if (!quick) { let o = { s: 0, e: 0 };
  for (const starve of [false, true]) for (let s = 200; s < 240; s++) { const d = M.dish(c10, s, 32); while (d.k < 600) d.tick(1); d.E.hooks.event = (tt, kind, t) => { if (kind === 'retract' && t.born < 600) o[starve ? 's' : 'e']++; }; while (d.k < d.ticks) d.tick(starve ? 0 : 1); }
  ok('eat/starve: cuts begun on older tubes, cycle 10: starve 0.8, eat 0.7', near(o.s / 40, 0.8, 0.05) && near(o.e / 40, 0.725, 0.05), `${o.s / 40} · ${o.e / 40}`); } }

// 7 · the gathered renders (physarum_flow.py, cycle 8's law, 2026-10-13): what their captions say
const csv = f => { const [h, ...rows] = read(join('headless', f)).trim().split('\n'); const k = h.split(','); return rows.map(r => Object.fromEntries(r.split(',').map((v, i) => [k[i], +v]))); };
{ const L = csv('2026-10-13-flow-feast-famine-log.csv'), win = [];
  for (let w = 0; w < 5; w++) { const rs = L.filter(r => r.t >= w * 6 && r.t < w * 6 + 6), a = rs[0], b = rs.at(-1); win.push({ eat: w % 2 === 0, grown: b.captured - a.captured, pruned: b.retracted - a.retracted, D: b.total_D / a.total_D, tubes: [a.tubes, b.tubes] }); }
  const st = win.filter(w => !w.eat), ea = win.filter(w => w.eat);
  ok('render, feast/famine: the starve windows grew 1 and 0 tips, pruned 1 and 0', st.map(w => w.grown).join() === '1,0' && st.map(w => w.pruned).join() === '1,0');
  ok('render, feast/famine: the eat windows grew 4, 2, 2 and pruned 2, 2, 1', ea.map(w => w.grown).join() === '4,2,2' && ea.map(w => w.pruned).join() === '2,2,1');
  ok('render, feast/famine: summed thickness fell 24% and 11% in the starve windows', near(1 - st[0].D, 0.243, 0.005) && near(1 - st[1].D, 0.112, 0.005), st.map(w => (1 - w.D).toFixed(3)).join(' · '));
  const wav = readFileSync(join(here, 'headless', '2026-10-13-flow-feast-famine.wav')), pcm = new Int16Array(wav.buffer, wav.byteOffset + 44, (wav.length - 44) / 2), sr = 48000, db = [];
  for (let w = 0; w < 5; w++) { let e = 0; const a = w * 6 * sr * 2, b = (w + 1) * 6 * sr * 2; for (let i = a; i < b; i++) e += (pcm[i] / 32768) ** 2; db.push(10 * Math.log10(e / (b - a))); }
  ok('render, feast/famine: each starve window 0.6 to 1.5 dB under the eat windows beside it (0.6, 1.5, 1.1, 0.9)', near(db[0] - db[1], 0.6, 0.05) && near(db[2] - db[1], 1.5, 0.05) && near(db[2] - db[3], 1.1, 0.05) && near(db[4] - db[3], 0.9, 0.05), db.map(x => x.toFixed(1)).join(' · ') + ' dB RMS'); }
{ const L = csv('2026-10-13-flow-tight-budget-log.csv'), S = JSON.parse(read(join('headless', '2026-10-13-flow-summary.json')))['tight-budget'];
  ok('render, tight budget: refused 15 tips, ended on two tubes from flake 1 (to the listener and to flake 2)', S.counts.budget_refused === 15 && JSON.stringify(S.final_tubes.map(t => t.slice(0, 2))) === '[[0,5],[0,1]]', JSON.stringify(S.counts));
  ok('render, tight budget: the right-hand flakes were never fed in 30 s', L.every(r => r.D_right_food === 0)); }
// 8 · the code: nothing prunes to make room, and a tube's delay divides by the speed
ok('engine: a tip that would overflow the budget is refused, not given room', /if \(S\.used \+ dist\(pr\.anchor, hit\) <= budget\) \{[\s\S]*?\} else \{ S\.counts\.budget_refused\+\+/.test(block(dish, 'engine')));
ok('dish: delay time is length ÷ speed', /d\.delayTime\.value = Math\.max\(0\.05, len \/ knob\('vel'\) \* 100\)/.test(dish) && /t\.L \/ v/.test(dish));
ok('dish: the topology hears loudness at the flakes (an analyser per flake), not at each line', /f\.an = ac\.createAnalyser\(\)/.test(dish) && /function levels\(\)[\s\S]*?for \(const \[n, f\] of flakes\)/.test(dish));
console.log(fails ? `\n${fails} FAILED` : '\nall passed');
process.exit(fails ? 1 : 0);
