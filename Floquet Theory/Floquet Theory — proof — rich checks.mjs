// title: Floquet Theory — proof — rich checks
// born: 2026-11-03
// links: [[Floquet Theory]] connects-to · checks-for
// forward_vector: I re-run, in Node, every claim the rich-face pieces of Floquet Theory make: I pull the script marked
//   id="ft-engine" out of each piece and test it against the numbers the piece prints, and I read the three gathered
//   Stage 1 recordings for the sign flip their captions claim. A change that breaks a claim fails here.
//   Run: node "Floquet Theory/Floquet Theory — proof — rich checks.mjs"
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url)), ROOT = join(HERE, '..');
let fails = 0;
const ok = (c, what, got) => { console.log((c ? '  ok   ' : '  FAIL ') + what + (got !== undefined ? '  — ' + got : '')); if (!c) fails++; };
function engine(piece, names) {
  const html = readFileSync(join(HERE, `Floquet Theory — rich — ${piece}.html`), 'utf8');
  const m = html.match(/<script id="ft-engine">([\s\S]*?)<\/script>/); if (!m) throw new Error('no ft-engine in ' + piece);
  return vm.runInNewContext(m[1] + `\n({${names.join(',')}})`, { Math, Float32Array, Float64Array });
}

console.log('three ways out');
{
  const E = engine('three ways out', ['Ring', 'monodromy', 'multipliers', 'rhoMax', 'onsetQ', 'growth', 'flips', 'pitch', 'mag']);
  const K = 0.005, SR = 48000, mp = (a, q, k) => E.multipliers(E.monodromy(a, q, k));
  const m0 = mp(1, 0, K); ok(Math.abs(E.mag(m0.r1) - Math.exp(-K * Math.PI / 2)) < 1e-9, 'no pump: |ρ| = e^(−κπ/2)', E.mag(m0.r1).toFixed(6));
  ok(Math.abs(E.onsetQ(1, K, 0.03) - K) < 1e-5, 'tongue 1 opens at q = κ (= 2ζ)', E.onsetQ(1, K, 0.03).toFixed(6));
  let lo = 0, hi = 0.5; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (E.rhoMax(mp(4 + m * m / 6, m, K)) > 1) hi = m; else lo = m; }
  ok(Math.abs(lo - Math.sqrt(8 * K)) < 0.005, 'tongue 2 opens near q = √(8κ) = 0.200 along a = 4 + q²/6', lo.toFixed(4));
  let worst = 0; for (const k of [0.005, -0.005]) for (const q of [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3]) { const m = mp(2.4, q, k); worst = Math.max(worst, Math.abs(E.mag(m.r1) - Math.exp(-k * Math.PI / 2)), Math.abs(E.mag(m.r2) - Math.exp(-k * Math.PI / 2))); }
  ok(worst < 1e-6, 'a pair off the axis keeps |ρ| = e^(−κπ/2) at every q from 0 to 0.3, κ = ±0.005', worst.toExponential(1));
  // undamped: every stable a on q = 0.3 has both multipliers on the unit circle
  let st = 0, on = 0, wm = 0; for (let a = -0.5; a <= 10; a += 0.01) { const m = mp(a, 0.3, 0); if (Math.abs(m.tr) < 2) { st++; const d = Math.max(Math.abs(E.mag(m.r1) - 1), Math.abs(E.mag(m.r2) - 1)); wm = Math.max(wm, d); if (d < 1e-7) on++; } }
  ok(on === st && st > 0, 'with no damping, every stable a on q = 0.3 has |ρ₁| = |ρ₂| = 1', on + ' of ' + st + ', worst ' + wm.toExponential(1));
  const cases = [['−1', { a: 1, q: 0.02, kappa: K }, 220, 1], ['+1', { a: 4 + 0.35 * 0.35 / 6, q: 0.35, kappa: K }, 440, 0], ['pair', { a: 2.4, q: 0.15, kappa: -0.005 }, null, null]];
  for (const [key, p, want, fl] of cases) {
    const m = mp(p.a, p.q, p.kappa), r = new E.Ring(SR, 5); r.set(Object.assign({}, p, { beta: 0, sigma: 0 })); r.x = 0.3; r.v = 0.7;
    const g = E.growth(r.render(SR * 3).strobe, 400, 1300); ok(Math.abs(g - E.rhoMax(m)) < 2e-4, key + ': engine growth per period matches the monodromy', g.toFixed(5) + ' vs ' + E.rhoMax(m).toFixed(5));
    const arg = Math.abs(Math.atan2(m.r1[1], m.r1[0])), hz = want || (2 - arg / Math.PI) * 220;
    const seeds = []; for (let s = 1; s <= 8; s++) { const rr = new E.Ring(SR, s); rr.set(p); const o = rr.render(SR * 4), S = o.strobe, n = S.length / 2; const bins = new Set(); for (let i = n - 200; i < n; i++) bins.add(Math.floor((Math.atan2(S[2 * i + 1] / Math.sqrt(p.a), S[2 * i]) + Math.PI) / (2 * Math.PI) * 36)); seeds.push({ hz: E.pitch(o.x, SR * 3, SR * 4, SR), fl: E.flips(S, n - 200, n - 1), bins: bins.size, side: Math.sign(S[2 * n - 2]) }); }
    const hzs = seeds.map((s) => s.hz); ok(hzs.every((h) => Math.abs(h - hz) < (want ? 0.05 : 0.2)), key + ': pitch ' + hz.toFixed(2) + ' Hz in all 8 runs', Math.min(...hzs).toFixed(2) + '–' + Math.max(...hzs).toFixed(2));
    if (key === '−1') ok(seeds.every((s) => s.fl > 0.99 && s.bins <= 2), '−1: every run flips side every look (one ring, period doubled)');
    if (key === '+1') { const up = seeds.filter((s) => s.side > 0).length; ok(seeds.every((s) => s.fl < 0.01 && s.bins <= 2) && up > 0 && up < 8, '+1: every run holds one point, and both signs occur (two mirror rings: a pitchfork)', up + ' of 8 on +'); }
    if (key === 'pair') ok(seeds.every((s) => s.bins >= 30), 'pair: every run fills 30+ of 36 directions (a closed curve)', seeds.map((s) => s.bins).join(','));
  }
}

console.log('same equation twice');
{
  const E = engine('same equation twice', ['band', 'halfTrace', 'edgeT']);
  for (const q of [0.3, 1]) {
    let w = 0; for (let n = 0; n < 4; n++) { const kz = n % 2 === 0 ? 1 : 0, lo = E.band(n, kz, q, 16), hi = E.band(n + 1, kz, q, 16), mid = (lo + hi) / 2; const tl = E.edgeT(mid, E.band(n, 0.5, q, 16), q, 3000), th = E.edgeT(mid, E.band(n + 1, 0.5, q, 16), q, 3000); w = Math.max(w, Math.abs(tl - lo), Math.abs(th - hi)); const sg = E.halfTrace(mid, q, 3000); if ((sg < 0) !== (kz === 1)) { ok(false, `q = ${q}: gap ${n + 1} sign of ρ matches its place in k`); } }
    ok(w < 1e-6, `q = ${q}: gap edges by plane waves = tongue edges by integration`, w.toExponential(1));
    let w2 = 0; for (let n = 0; n < 3; n++) for (const k of [0.25, 0.5, 0.75]) w2 = Math.max(w2, Math.abs(E.halfTrace(E.band(n, k, q, 16), q, 3000) - Math.cos(k * Math.PI)));
    ok(w2 < 1e-9, `q = ${q}: inside a band, tr M / 2 = cos kπ`, w2.toExponential(1));
  }
  ok(Math.abs(E.band(0, 1, 0.3) - 0.689166) < 1e-6 && Math.abs(E.band(1, 1, 0.3) - 1.288324) < 1e-6, 'tongue 1 at q = 0.3 spans 0.689166–1.288324 (as the sibling faces measured)');
}

console.log('standing on a shake');
{
  const E = engine('standing on a shake', ['pair', 'standWindow', 'kapitzaF', 'strokeLimitQ', 'swingRun']);
  const L = 0.2;
  ok(!E.pair(L, 0, 50).stands && Math.abs(E.pair(L, 0, 50).big - Math.exp(Math.sqrt(9.81 / L) / 50)) < 1e-9, 'unshaken: ρ = e^(√(g/L)·T) over 1/50 s', E.pair(L, 0, 50).big.toFixed(4));
  ok(!E.pair(L, 0.02, 5).stands && E.pair(L, 0.02, 50).stands, '2 cm: falls at 5 Hz, stands at 50 Hz');
  ok(Math.abs(E.pair(L, 0.02, 50).det - 1) < 1e-9, 'standing, the pair sits on the circle (det M = 1, no friction)');
  const w10 = E.standWindow(L, 0.02); ok(w10 && Math.abs(w10.from / E.kapitzaF(L, 0.02) - 1) < 0.005 && w10.to === null, 'h/L = 0.1: stands from Kapitza’s rate within 0.5 %, and at every rate to 2 kHz', w10.from.toFixed(3) + ' vs ' + E.kapitzaF(L, 0.02).toFixed(3));
  ok(Math.abs(E.strokeLimitQ() / 2 - 0.454) < 0.001, 'stroke limit: tongue 1 crosses a = 0 at q = 0.908, h/L = 0.454', (E.strokeLimitQ() / 2).toFixed(4));
  const w50 = E.standWindow(L, 0.1); ok(w50 && w50.to && Math.abs(w50.from - 3.30) < 0.02 && Math.abs(w50.to - 6.71) < 0.03, 'h/L = 0.5: stands only from 3.30 to 6.71 Hz', w50 && w50.from.toFixed(3) + '–' + (w50.to && w50.to.toFixed(3)));
  const s6 = E.swingRun(L, 0.1, 6, 0.1, 10), s12 = E.swingRun(L, 0.1, 12, 0.1, 10), s50 = E.swingRun(L, 0.02, 50, 0.1, 10), s5 = E.swingRun(L, 0.02, 5, 0.1, 10);
  ok(s6.fell === null && s12.fell !== null && s50.fell === null && s5.fell !== null, 'the full swing agrees: h/L 0.5 stands at 6 Hz, falls at 12; 2 cm stands at 50 Hz, falls at 5', 'fell at ' + s12.fell.toFixed(2) + ' s, ' + s5.fell.toFixed(2) + ' s');
}

console.log('gathered: Stage 1 recordings');
{
  const read = (p) => { const b = readFileSync(p); let o = 12, fmt = 0, ch = 1, sr = 0, bits = 0, data = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4); if (id === 'fmt ') { fmt = b.readUInt16LE(o + 8); ch = b.readUInt16LE(o + 10); sr = b.readUInt32LE(o + 12); bits = b.readUInt16LE(o + 22); } if (id === 'data') data = b.subarray(o + 8, o + 8 + sz); o += 8 + sz + (sz & 1); } const n = data.length / (bits / 8) / ch, x = new Float64Array(n); for (let i = 0; i < n; i++) x[i] = fmt === 3 ? data.readFloatLE(i * 4 * ch) : data.readInt16LE(i * 2 * ch) / 32768; return { sr, x }; };
  for (const f of ['04a_below_threshold', '04b_at_threshold', '04c_above_threshold']) {
    const { sr, x } = read(join(ROOT, 'Projects/Floquet Time-Modulated Loops/audio', f + '.wav')), d = sr / 440;
    let sxy = 0, sxx = 0, syy = 0; for (let i = sr; i < x.length - 200; i++) { const j = i + d, j0 = Math.floor(j), fr = j - j0, y = x[j0] * (1 - fr) + x[j0 + 1] * fr; sxy += x[i] * y; sxx += x[i] * x[i]; syy += y * y; }
    const c = sxy / Math.sqrt(sxx * syy); ok(c < -0.99, f + ': one pump period on, the signal is its own negative (period doubled)', 'correlation ' + c.toFixed(3));
  }
}
console.log(fails ? `\n${fails} failed` : '\nall passed'); process.exit(fails ? 1 : 0);
