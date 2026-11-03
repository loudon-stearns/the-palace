// title: Granular Synthesis — rich — checks
// born: 2026-11-03
// links: [[Granular Synthesis]] (connects-to · rich-face-check) · listed beside [[Granular Synthesis — rich.json]]
// forward_vector: I re-run every number the three Granular Synthesis pieces show, on the pieces' own engines
//   pulled out of their HTML, and say pass or fail against the claim each step makes. I write what I measured
//   to "Granular Synthesis — rich — checks.json" beside me, so a challenger can read the numbers without
//   running anything. Run: node "Granular Synthesis/Granular Synthesis — rich — checks.mjs"
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const piece = (what) => readFileSync(join(here, `Granular Synthesis — rich — ${what}.html`), 'utf8');
const engineOf = (src) => src.slice(src.indexOf('/* ENGINE:START'), src.indexOf('/* ENGINE:END */'));
const Grains = new Function(engineOf(piece('atom and material')) + '; return Grains;')();
const FieldC = new Function(engineOf(piece('capture')) + '; return GrainField;')();
const FieldR = new Function(engineOf(piece('three regimes')) + '; return GrainField;')();

const out = {}; let fails = 0;
function check(name, ok, detail) { console.log((ok ? 'pass' : 'FAIL') + '  ' + name + (detail ? '  · ' + detail : '')); if (!ok) fails++; out[name] = { ok, detail }; }

// ---------- atom and material ----------
{
  const SR = 44100;
  const tw = [2, 5, 10, 40, 160].map(ms => Grains.shape(SR, ms, 440, 'hann').width * ms / 1000);
  check('one grain: Hann length × width stays near 2 at every length', tw.every(x => Math.abs(x - 2) < 0.25), tw.map(x => x.toFixed(2)).join(' '));
  const gb = { rect: Grains.gabor(SR, 40, 'rect'), hann: Grains.gabor(SR, 40, 'hann'), gauss: Grains.gabor(SR, 40, 'gauss') };
  check('the window: Gauss reaches Gabor\'s floor 1/4π, Hann just above, rectangle far above', Math.abs(gb.gauss - 1 / (4 * Math.PI)) < 0.002 && gb.hann > gb.gauss && gb.hann < 0.09 && gb.rect > 0.4, Object.entries(gb).map(([k, v]) => k + ' ' + v.toFixed(4)).join(' · '));
  const side = { rect: Grains.shape(SR, 40, 440, 'rect').sideDb, hann: Grains.shape(SR, 40, 440, 'hann').sideDb, gauss: Grains.shape(SR, 40, 440, 'gauss').sideDb };
  check('the window: side lobes rectangle ≈ −13, Hann ≈ −31, Gauss below −50 dB', side.rect > -16 && side.rect < -12 && side.hann < -30 && side.hann > -33 && side.gauss < -50, Object.entries(side).map(([k, v]) => k + ' ' + v.toFixed(1)).join(' · '));
  for (const [ms, kind] of [[40, 'hann'], [10, 'hann'], [100, 'gauss'], [40, 'rect']]) {
    const T = Grains.test(SR, ms, kind);
    const r = T.res;
    check(`the test (${ms} ms ${kind}): random and spread clouds sit on one grain's prediction, regular onsets miss`, r.random.miss < 2 && r.spread.miss < 2 && r.regular.miss > 4,
      `random ${r.random.miss.toFixed(2)} dB · spread ${r.spread.miss.toFixed(2)} dB · regular ${r.regular.miss.toFixed(2)} dB`);
    const dl = T.lv[2000].db - T.lv[20].db;
    check(`the test (${ms} ms ${kind}): density ×100 lifts the level 20 dB and leaves the shape`, Math.abs(dl - 20) < 1.5 && T.lv[20].miss < 2 && T.lv[2000].miss < 2, `+${dl.toFixed(2)} dB · shape ${T.lv[20].miss.toFixed(2)} / ${T.lv[2000].miss.toFixed(2)} dB`);
  }
}

// ---------- capture ----------
{
  const SR = 6000;
  // one grain, one partial: Adler's rule
  const rows = []; let ok = true;
  for (const pull of [5, 10, 20]) for (const det of [0.5 * pull, 0.9 * pull, 1.1 * pull, 1.5 * pull, 2.5 * pull]) {
    const g = FieldC(SR, 7); g.set({ N: 1, list: [440 + det], lifeMs: 4000, lifeJit: 0, stagger: false, KA: pull, partials: [{ f: 440, A: 1 }], respawn: true }); g.run(4.02);
    const d = g.deaths[0], beat = d.fMean - 440, pred = det < pull ? 0 : Math.sqrt(det * det - pull * pull);
    const good = det < pull ? Math.abs(beat) < 0.3 : Math.abs(beat - pred) < Math.max(0.3, 0.06 * pred);
    ok = ok && good; rows.push(`pull ${pull} Δ ${det.toFixed(1)}: ${beat.toFixed(2)} (rule ${pred.toFixed(2)})`);
  }
  check('one grain, one partial: caught when |Δ| < pull, else beats at √(Δ² − pull²)', ok, rows.join(' · '));
  // deep well, shallow well: catchment ∝ amplitude
  {
    const g = FieldC(SR, 7); g.set({ N: 24, lifeMs: 400, lifeJit: 0.25, stagger: true, fLo: 380, fHi: 740, KA: 30, Kg: 0, partials: [{ f: 440, A: 1 }, { f: 660, A: 0.3 }], respawn: true }); g.run(30);
    const wid = [0, 0]; for (const d of g.deaths) [440, 660].forEach((f, k) => { if (isFinite(d.fMean) && Math.abs(d.fMean - f) < 0.6) wid[k] = Math.max(wid[k], Math.abs(d.fBirth - f)); });
    // the quiet well catches a little wider than its own rule: the loud partial 220 Hz below drags every grain
    // near 660 down by about (30 Hz)² ⁄ (2 · 220 Hz) ≈ 2 Hz, so grains born just above the catchment fall into it
    check('deep well, shallow well: widest catch ≈ K·a ⁄ 2π (30 and 9 Hz), the quiet one up to 2 Hz wider', Math.abs(wid[0] - 30) < 2.5 && wid[1] > 8 && wid[1] < 11.5, `440: ${wid[0].toFixed(1)} Hz · 660: ${wid[1].toFixed(1)} Hz`);
  }
  // the pile follows the filter: the piece's own runFilter, at two filter places
  const HARM = []; for (let h = 2; h <= 12; h++) HARM.push({ f: 110 * h, A: 1 });
  const KA3 = 30, base = { N: 48, lifeMs: 300, lifeJit: 0.25, stagger: true, fLo: 165, fHi: 1375, KA: KA3, Kg: 0, partials: HARM, bpOn: true, bpOct: 0.7 };
  for (const bpHz of [330, 880]) {
    const g = FieldC(SR, 21); g.set(Object.assign({ respawn: true }, base, { bpHz })); g.run(10);
    const st = g.stats(0.6, 4000), A = Array.from(g.A);
    const per = st.per.map((p, k) => ({ f: HARM[k].f, share: p.born ? p.cap / p.born : 0, pred: Math.min(1, 2 * KA3 * A[k] / 110), born: p.born }));
    const used = per.filter(p => p.born > 10), err = used.reduce((a, p) => a + Math.abs(p.share - p.pred), 0) / used.length;
    check(`the test: the pile follows the filter at ${bpHz} Hz, partial by partial`, err < 0.05, `mean |measured − rule| ${err.toFixed(3)} · ` + per.map(p => `${p.f}:${p.share.toFixed(2)}/${p.pred.toFixed(2)}`).join(' '));
    out['pile ' + bpHz] = per;
  }
  // grain length: the piece's own runSweep
  const sweep = [];
  for (const ms of [15, 30, 60, 120, 300, 1000]) { const g = FieldC(SR, 33); g.set(Object.assign({ respawn: true }, base, { bpOn: false, lifeMs: ms })); g.run(Math.max(8, ms / 1000 * 40)); sweep.push({ ms, share: g.stats(0.6, 4000).cap }); }
  const pred = 2 * KA3 / 110, at = ms => sweep.find(p => p.ms === ms).share;
  // the lone-partial rule is the ceiling: neighbours 110 Hz away narrow each well a little, so even 1000 ms grains fall a
  // few hundredths short; the claim checked is the fall, short grains far under it
  check('the test: short grains are not caught (15 ms under a tenth of the rule; 1000 ms within 0.06 of it)', at(15) < 0.1 * pred && at(60) < 0.35 * pred && at(1000) > pred - 0.06 && at(300) > at(60) && at(60) > at(15), sweep.map(p => `${p.ms} ms ${p.share.toFixed(3)}`).join(' · ') + ` · rule ${pred.toFixed(3)}`);
  out.sweep = sweep;
  const g8 = FieldC(SR, 33); g8.set(Object.assign({ respawn: true }, base, { bpOn: false, lifeMs: 300, N: 8 })); g8.run(40);
  check('the test: 8 grains are caught as often as 48', Math.abs(g8.stats(0.6, 4000).cap - at(300)) < 0.05, `8: ${g8.stats(0.6, 4000).cap.toFixed(3)} · 48: ${at(300).toFixed(3)}`);
}

// ---------- three regimes ----------
{
  const SR = 6000;
  const ALT = []; for (let h = 2; h <= 12; h++) ALT.push({ f: 110 * h, A: h % 2 ? 0.25 : 1 });
  const res = {};
  for (const KA of [40, 80]) { const g = FieldR(SR, 7); g.set({ N: 48, lifeMs: 400, lifeJit: 0.25, stagger: true, fLo: 165, fHi: 1375, KA, Kg: 0, partials: ALT, respawn: true }); g.run(30); res[KA] = g.stats(0.6, 4000); }
  check('attractor only: separate wells (40 Hz) catch about half, every one by its nearest partial', res[40].cap > 0.35 && res[40].cap < 0.6 && res[40].nearest > 0.98, `caught ${(res[40].cap * 100).toFixed(1)}% · nearest ${(res[40].nearest * 100).toFixed(1)}%`);
  check('attractor only: overlapping wells (80 Hz) send some grains past their nearest partial, and many still find none', res[80].nearest < 0.95 && res[80].cap < 0.85, `caught ${(res[80].cap * 100).toFixed(1)}% · nearest ${(res[80].nearest * 100).toFixed(1)}%`);
  out.attractor = { 40: res[40], 80: res[80] };
  const pile = [];
  for (const Kg of [0, 10, 20, 40, 80]) { const g = FieldR(SR, 5); g.set({ N: 24, lifeMs: 400, lifeJit: 0.25, stagger: true, fLo: 400, fHi: 484, KA: 30, Kg, clip: 'none', partials: [{ f: 440, A: 1 }], respawn: true }); g.run(20); const st = g.stats(0.6, 4000); pile.push({ Kg, cap: st.cap, r: st.r }); }
  check('weak grain-to-grain: a pile is already phase-locked at K_g 0 (r ≈ π/4) and grows more coherent as K_g rises', Math.abs(pile[0].r - Math.PI / 4) < 0.04 && pile[3].r > pile[0].r + 0.08 && pile[4].r > pile[3].r, pile.map(p => `Kg ${p.Kg}: r ${p.r.toFixed(3)} caught ${(p.cap * 100).toFixed(0)}%`).join(' · '));
  out.pile = pile;
  // one bent grain: the piece's own step 5
  const CL = []; for (let i = 0; i < 10; i++) CL.push(220 + (i - 4.5) * 0.1);
  const probe = {};
  for (const clip of ['none', 'soft', 'asym']) {
    probe[clip] = {};
    for (const d of [-3, -1.5, 1.5, 3]) {
      const g = FieldR(SR, 3); g.set({ N: 12, list: CL.concat([440 + d, 660 + d]), lifeMs: 600000, lifeJit: 0, stagger: false, KA: 0, Kg: 40, clip, drive: 3, bias: 0.3, partials: [], respawn: true });
      g.run(2); const a = g.view(); g.run(4); const b = g.view();
      const psi = (v) => { let zr = 0, zi = 0; for (let i = 0; i < 10; i++) { zr += Math.cos(v.ph[i]); zi += Math.sin(v.ph[i]); } return Math.atan2(zi, zr); };
      // phase of each stray against n·Ψ, unwrapped through the 4 s by its frequency difference
      const fC = (b.ph.slice(0, 10).reduce((s, x) => s + x, 0) - a.ph.slice(0, 10).reduce((s, x) => s + x, 0)) / 10 / (2 * Math.PI * 4);
      const f2 = (b.ph[10] - a.ph[10]) / (2 * Math.PI * 4), f3 = (b.ph[11] - a.ph[11]) / (2 * Math.PI * 4);
      probe[clip][d] = { two: f2 - 2 * fC, three: f3 - 3 * fC };
    }
  }
  const locked = (x) => Math.abs(x) < 0.02;
  const fmtP = (c) => Object.entries(probe[c]).map(([d, v]) => `${d}: 2× ${v.two.toFixed(3)} 3× ${v.three.toFixed(3)}`).join(' | ');
  check('one bent grain, straight: neither stray locks', Object.values(probe.none).every(v => !locked(v.two) && !locked(v.three)), fmtP('none'));
  check('one bent grain, soft clip: the 3× stray locks at ±1.5 Hz, the 2× stray never', locked(probe.soft[1.5].three) && locked(probe.soft[-1.5].three) && Object.values(probe.soft).every(v => !locked(v.two)), fmtP('soft'));
  check('one bent grain, lopsided: the 2× stray locks at ±1.5 Hz', locked(probe.asym[1.5].two) && locked(probe.asym[-1.5].two), fmtP('asym'));
  out.probe = probe;
  // the test: the piece's own six clouds
  function clusters(v, minP) { const f = v.grains.filter(g => g.p > minP && isFinite(g.fAvg)).map(g => g.fAvg).sort((a, b) => a - b); const cl = []; for (const x of f) { const l = cl[cl.length - 1]; if (l && Math.abs(x - l.f) < 0.02) l.m++; else cl.push({ f: x, m: 1 }); } return cl; }
  function harmonics(cl) { if (!cl.length) return { big: null, n2: 0, n3: 0 }; const big = cl.reduce((a, q) => q.m > a.m ? q : a, cl[0]); const o = { big, n2: 0, n3: 0 }; for (const a of cl) for (const n of [2, 3]) if (Math.abs(a.f - n * big.f) < 0.02 * n) o['n' + n] += a.m; return o; }
  const table = {};
  for (const clip of ['none', 'soft', 'asym']) {
    table[clip] = { runs: 0, n2: 0, n3: 0, big: 0 };
    for (const sd of [11, 12, 13, 14, 15, 16]) {
      const g = FieldR(SR, sd); g.set({ N: 64, lifeMs: 8000, lifeJit: 0, stagger: false, fLo: 110, fHi: 880, KA: 0, Kg: 250, clip, drive: 3, bias: 0.3, partials: [], respawn: true }); g.run(7.5);
      const h = harmonics(clusters(g.view(), 0.5)); if (h.n2 + h.n3 > 0) table[clip].runs++; table[clip].n2 += h.n2; table[clip].n3 += h.n3; table[clip].big += h.big ? h.big.m / 6 : 0;
    }
  }
  const fmtT = Object.entries(table).map(([k, r]) => `${k}: ${r.runs}/6 clouds, ${r.n2} at 2×, ${r.n3} at 3×, biggest group ${r.big.toFixed(1)}`).join(' · ');
  check('the test: the straight control grows no harmonic', table.none.runs === 0, fmtT);
  check('the test: the soft clip grows no harmonic in a random cloud; the lopsided bend does, in most', table.soft.runs === 0 && table.asym.runs >= 3, fmtT);
  out.table = table;
}

writeFileSync(join(here, 'Granular Synthesis — rich — checks.json'), JSON.stringify({ title: 'Granular Synthesis — rich — checks', born: '2026-11-03', links: [{ target: '[[Granular Synthesis]]', type: 'connects-to', label: 'rich-face-check' }], forward_vector: 'I am what checks.mjs measured on the three pieces\' own engines, the last time it ran; I change whenever it runs again.', ran: new Date().toISOString(), fails, results: out }, null, 1));
console.log(fails ? `${fails} failed` : 'all passed');
process.exit(fails ? 1 : 0);
