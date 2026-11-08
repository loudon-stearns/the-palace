// The Metaphor Stretch — rich — check
// born: 2026-11-03 · links: [[The Metaphor Stretch]] (connects-to · rich-face-check) · [[The Metaphor Stretch — rich.json]]
// forward_vector: I re-run the claims this face's two pieces make, on their own engine, and the engine against the Python it was ported from. Run me after any edit to either piece.
// Run: node "The Metaphor Stretch/The Metaphor Stretch — rich — check.mjs"   (python3 with numpy and scipy for the port check; skipped without)
import fs from 'fs'; import path from 'path'; import vm from 'vm'; import { execFileSync } from 'child_process'; import { fileURLToPath } from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '..');
const files = ['which part is the crystal', 'four choices'].map(w => path.join(here, `The Metaphor Stretch — rich — ${w}.html`));
const block = (html, id) => { const m = html.match(new RegExp(`<script id="${id}">([\\s\\S]*?)</script>`)); if (!m) throw new Error('no ' + id); return m[1]; };
const html = files.map(f => fs.readFileSync(f, 'utf8'));
let fails = 0; const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails++; };
console.log('blocks');
ok(block(html[0], 'engine') === block(html[1], 'engine'), 'engine block byte-identical in both pieces');
ok(block(html[0], 'shared') === block(html[1], 'shared'), 'shared block byte-identical in both pieces');
const ctx = {}; vm.createContext(ctx); vm.runInContext(block(html[0], 'engine') + '\n;globalThis.E={DOS,partials,render,measure,DEFAULT_GRID,BANDS};', ctx); const E = ctx.E;
const CR = { cubic: { decayBase: 0.6, decayExp: 0.45, transientDecay: 55 }, orthorhombic: { decayBase: 1.0, decayExp: 0.55, transientDecay: 60 }, triclinic: { decayBase: 1.5, decayExp: 0.7, transientDecay: 70 } };
// 1 · the port against crystal_synth.py
const PY = path.join(root, 'Projects/Generative Sample Libraries/crystal-audio/crystal_synth.py');
console.log('the port, against ' + path.relative(root, PY));
try {
  const cfg = []; for (const cr of Object.keys(CR)) for (const anchor of ['lowest_mode', 'zone_boundary', 'centroid']) for (const N of [8, 60, 300]) cfg.push([cr, anchor, N]);
  const py = `
import json, sys, numpy as np, importlib.util
spec = importlib.util.spec_from_file_location("cs", sys.argv[1]); cs = importlib.util.module_from_spec(spec); spec.loader.exec_module(cs)
out = {"partials": {}, "render": {}}
for cr, anchor, N in json.loads(sys.argv[2]):
    f = getattr(cs, "dos_" + cr)(); f = f[f > 0.012]; sc, ce = cs.compute_scale(f, anchor, 110.0, 10000.0); a = f * sc; a = a[(a >= 88.0) & (a <= ce)]
    e = np.logspace(np.log10(a.min() * .99), np.log10(a.max() * 1.01), N + 1); h, _ = np.histogram(a, bins=e)
    out["partials"]["|".join([cr, anchor, str(N)])] = np.sqrt(e[:-1] * e[1:])[h > 0].tolist()
d = cs.dos_cubic()
for N in (8, 300):
    x = cs.synthesize_strike(d, n_bins=N, decay_base=.6, decay_exp=.45, transient_decay=55.0, duration=4.0)
    out["render"][str(N)] = x[int(.5 * 44100):int(4 * 44100):7].tolist()
print(json.dumps(out))`;
  const R = JSON.parse(execFileSync('python3', ['-c', py, PY, JSON.stringify(cfg)], { maxBuffer: 1 << 28 }).toString());
  let worst = 0, counts = true;
  for (const [cr, anchor, N] of cfg) { const j = E.partials(E.DOS[cr](), { N, anchor }).f, p = R.partials[[cr, anchor, N].join('|')]; if (j.length !== p.length) counts = false; else j.forEach((v, i) => worst = Math.max(worst, Math.abs(v / p[i] - 1))); }
  ok(counts && worst < 1e-12, `partials: ${cfg.length} settings (3 crystals × 3 anchors × N 8, 60, 300), same count, worst frequency error ${worst.toExponential(1)}`);
  for (const N of [8, 300]) {
    const y = E.render(E.partials(E.DOS.cubic(), { N }), { ...CR.cubic, seconds: 4, impulse: 0, fade: 0 }), x = R.render[String(N)];
    const ys = []; for (let i = Math.round(0.5 * 44100), k = 0; k < x.length; i += 7, k++) ys.push(y[i]);
    const rms = a => Math.sqrt(a.reduce((z, v) => z + v * v, 0) / a.length), rx = rms(x), ry = rms(ys); let e = 0; x.forEach((v, i) => e = Math.max(e, Math.abs(v / rx - ys[i] / ry)));
    ok(e < 1e-3, `sine render N ${N}, 0.5–4 s against the Python (strike noise left out, both scaled to unit RMS): worst difference ${e.toExponential(1)}`);
  }
} catch (err) { console.log('  skip  the port check needs python3 with numpy and scipy: ' + String(err.message).split('\n')[0]); }
// 2 · The Honest Artifact: which part is the crystal
console.log('which part is the crystal (The Honest Artifact)');
const M = {};
for (const cr of Object.keys(CR)) {
  const d = E.DOS[cr](), m = (N, o = {}) => E.measure(E.render(E.partials(d, { N }), { ...CR[cr], ...o })), fall = x => 1 - x.cent[2] / x.cent[0];
  const a = m(8), b = m(300), c = m(8, { decayExp: 0 }), dd = m(300, { decayExp: 0 }), e = m(300, { fidelity: 'continuous' }), m32 = m(32), m64 = m(64);
  M[cr] = { a, b, c, dd, e };
  const s = x => `${x.depth.toFixed(1)} dB/${x.regular.toFixed(2)}, centroid ${x.cent.map(v => v.toFixed(0)).join('→')} Hz`;
  console.log(`  ${cr}: N8 ${s(a)} | N300 ${s(b)} | N8 exp0 ${s(c)} | N300 exp0 ${s(dd)} | noise300 ${s(e)} | N32 ${s(m32)} | N64 ${s(m64)}`);
  ok(a.depth < 1 && c.depth < 1, `${cr}: no beating at N 8 (ripple ${a.depth.toFixed(2)} dB, under 1)`);
  ok(b.depth > 3 && dd.depth > 3, `${cr}: beating at N 300 (ripple ${b.depth.toFixed(1)} dB), with or without the decay law (${dd.depth.toFixed(1)} dB)`);
  ok(fall(a) > 0.15 && fall(b) > 0.15 && fall(e) > 0.15, `${cr}: the sweep with the decay law at N 8, N 300 and noise (centroid falls ${(100 * fall(a)).toFixed(0)}, ${(100 * fall(b)).toFixed(0)}, ${(100 * fall(e)).toFixed(0)} %)`);
  ok(Math.abs(fall(c)) < 0.02 && Math.abs(fall(dd)) < 0.02, `${cr}: no sweep at exponent 0 (${(100 * fall(c)).toFixed(1)}, ${(100 * fall(dd)).toFixed(1)} %)`);
  ok(m32.regular > b.regular && e.regular < 0.2 && Math.abs(e.depth - b.depth) < 1.5, `${cr}: regularity falls as N rises (N 32 ${m32.regular.toFixed(2)} → N 300 ${b.regular.toFixed(2)}); noise per bin as deep (${e.depth.toFixed(1)} dB) and irregular (${e.regular.toFixed(2)})`);
}
const rates = Object.keys(CR).map(cr => { const P = E.partials(E.DOS[cr](), { N: 300 }); return 1000 * (Math.pow(P.hi * 1.01 / (P.lo * 0.99), 1 / 300) - 1); });
ok(Math.max(...rates) / Math.min(...rates) < 1.2, `beat rates near 1 kHz at N 300 nearly the same across crystals: ${rates.map(r => r.toFixed(1)).join(', ')} a second`);
// 3 · Four choices: the grid none of them names
console.log('four choices (Confirmed Instances)');
const sp = [10, 20, 40, 80, 120].map(n => { const P = E.partials(E.DOS.cubic(n), { N: 100 }); return [n, P.lo, P.hi, P.hi / P.lo]; });
sp.forEach(([n, lo, hi, s]) => console.log(`  cubic grid ${n}: floor ${lo.toFixed(1)} Hz, top ${hi.toFixed(0)} Hz, spread ${s.toFixed(1)}×`));
ok(sp.every((v, i) => i === 0 || v[3] > sp[i - 1][3]) && sp.every(v => Math.abs(v[1] - 110) < 1e-6), 'lowest mode: the floor stays on 110 Hz and the spread grows with the grid');
ok(sp.slice(0, 3).every(([n, , , s]) => Math.abs(s / (1.1 * n) - 1) < 0.1), 'spread ≈ 1.1 × n for grids up to the code’s 40 (the 0.012 floor cut bends it after)');
const zb = [10, 40, 120].map(n => E.partials(E.DOS.cubic(n), { N: 100, anchor: 'zone_boundary' }).lo);
ok(zb[0] > zb[1] && zb[1] > zb[2], `zone boundary: the grid moves the floor instead (${zb.map(v => v.toFixed(0)).join(' → ')} Hz)`);
const t76 = E.partials(E.DOS.cubic(76), { N: 100 }).hi, t77 = E.partials(E.DOS.cubic(77), { N: 100 }).hi;
ok(t77 < t76 * 0.9, `the 0.012 floor bites at 77 cells: top ${t76.toFixed(0)} Hz at 76, ${t77.toFixed(0)} Hz at 77`);
const cen = [10, 40, 120].map(n => { const P = E.partials(E.DOS.cubic(n), { N: 100, anchor: 'centroid' }); return [P.lo, P.hi]; });
ok(cen.every(([lo, hi]) => Math.abs(Math.log2(hi / cen[0][1])) < 0.1 && Math.abs(Math.log2(lo / cen[0][0])) < 0.1), `centroid: the grid moves nothing (${cen.map(([l, h]) => l.toFixed(0) + '–' + h.toFixed(0)).join(', ')} Hz at 10, 40, 120 cells)`);
{ const P = E.partials(E.DOS.cubic(), { N: 8, anchor: 'centroid' }), m = E.measure(E.render(P, CR.cubic)), r = Math.pow(P.hi * 1.01 / (P.lo * 0.99), 1 / 8);
  console.log(`  centroid, N 8: neighbours ${(1200 * Math.log2(r)).toFixed(0)} ¢ apart, ${(P.f[0] * (r - 1)).toFixed(1)}–${(P.f[P.f.length - 2] * (r - 1)).toFixed(1)} Hz gaps; 250 Hz band ripple ${m.bands[0].depth.toFixed(1)} dB`); }
const ce = Object.keys(CR).map(cr => { const d = E.DOS[cr](), tot = d.filter(v => v > 0.012).length; return [cr, 1 - E.partials(d, { N: 100, anchor: 'centroid' }).modes / tot]; });
console.log('  centroid anchor, share of modes the 88 Hz cut drops: ' + ce.map(([c, v]) => `${c} ${(100 * v).toFixed(1)} %`).join(', '));
console.log(fails ? `\n${fails} failed` : '\nall held'); process.exit(fails ? 1 : 0);
