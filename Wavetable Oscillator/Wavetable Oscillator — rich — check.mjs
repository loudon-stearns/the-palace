// title: Wavetable Oscillator — rich — check
// born: 2026-11-03
// links: [[Wavetable Oscillator]] (connects-to · rich-face-check) · checks the four made pieces in [[Wavetable Oscillator — rich.json]]
// forward_vector: I run each made piece's own engine, lifted out of its page, in Node, against the claim the piece makes: the table and the loop identical at a whole-sample period and parted at a fractional one, each loop filter's pitch and per-trip effect as predicted; a looped bell with nothing between its harmonics; Position folding or not by the ratio of its rate to the pitch; and the three readers' error against the exact cycle. I exit 1 if any claim fails, so a change to a piece that breaks its claim is caught.
// run: node "Wavetable Oscillator/Wavetable Oscillator — rich — check.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const engine = (file, names) => {
  const html = fs.readFileSync(path.join(here, `Wavetable Oscillator — rich — ${file}.html`), 'utf8');
  const m = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`no engine script in ${file}`);
  return new Function(m[1] + `; return { ${names.join(', ')} };`)();
};
let failed = 0;
const ok = (cond, what) => { console.log(`${cond ? 'pass' : 'FAIL'} · ${what}`); if (!cond) failed++; };
const cents = (a, b) => 1200 * Math.log2(a / b);
const FS = 48000;

// ---- one cycle, two ways ----
{
  const A = engine('one cycle, two ways', ['cycleCoefs', 'evalCycle', 'storeCycle', 'readTable', 'runLoop', 'exactRead', 'loopAt', 'tripFor', 'maxDiff', 'residueDb', 'partial', 'peakFreq']);
  for (const P of [40, 60, 100, 109, 257, 400]) for (const sh of ['saw', 'soft', 'hollow']) {
    const t = A.storeCycle(A.cycleCoefs(sh, Math.min(40, Math.floor(P / 2) - 1)), P), n = 10 * FS;
    const d = A.maxDiff(A.readTable(t, n), A.runLoop(t, n), 0, n);
    if (P === 100 || d !== 0) ok(d === 0, `P ${P}, ${sh}: table minus loop over 10 s is 0, exactly (largest |difference| ${d})`);
    else if (d !== 0) ok(false, `P ${P} ${sh}`);
  }
  { let all = true; for (const P of [40, 60, 109, 257, 400]) for (const sh of ['saw', 'soft', 'hollow']) { const t = A.storeCycle(A.cycleCoefs(sh, Math.min(40, Math.floor(P / 2) - 1)), P), n = 10 * FS; if (A.maxDiff(A.readTable(t, n), A.runLoop(t, n), 0, n) !== 0) all = false; } ok(all, 'every other whole period tried (40, 60, 109, 257, 400 × three shapes): 0, exactly'); }
  { const P = 100, t = A.storeCycle(A.cycleCoefs('saw', 40), P), L = new Float64Array(P + 1); L.set(t); L[P] = t[0]; const n = 10 * FS; ok(A.maxDiff(A.readTable(t, n), A.runLoop(L, n), 0, n) > 0.5, 'the loop one sample longer: the difference is live (largest > 0.5)'); }
  { const a = A.cycleCoefs('saw', 40), T = 100.37, ex = A.exactRead(a, T, 30000); let m = 0; for (let i = 0; i < 30000; i += 7) m = Math.max(m, Math.abs(ex[i] - A.evalCycle(a, (i % T) / T))); ok(m < 1e-10, `the exact read's phasors stay with the series summed directly (largest gap ${m.toExponential(1)})`); }
  const rows = [];
  for (const T of [100.5, 100.25, 60.5, 200.75]) {
    const K = Math.min(40, Math.floor(T / 2) - 1), a = A.cycleCoefs('saw', K), n = Math.ceil(T * 1004), ex = A.exactRead(a, T, n);
    for (const md of ['round', 'linear', 'allpass']) {
      const y = A.loopAt(a, T, md, n), p1 = A.tripFor(md, T, 1), p10 = A.tripFor(md, T, 10);
      const w = Math.round(T * 400), s = Math.round(T * 20);
      const f1 = A.peakFreq(y, s, w, 1 / p1.period), c1m = cents(f1, 1 / T), c1p = cents(T, p1.period);
      const res = [10, 100, 1000].map((tr) => A.residueDb(y, ex, Math.floor(tr * T), Math.floor(tr * T) + Math.ceil(3 * T)));
      const row = { T, loop: md, 'pitch ¢ predicted': +c1p.toFixed(3), 'pitch ¢ measured': +c1m.toFixed(3), 'diff @10 dB': +res[0].toFixed(1), '@100': +res[1].toFixed(1), '@1000': +res[2].toFixed(1) };
      ok(Math.abs(c1m - c1p) < 0.05, `T ${T}, ${md}: the loop's pitch is where the filter puts it (${c1m.toFixed(3)} ¢ vs ${c1p.toFixed(3)} ¢ from fs/T)`);
      if (md !== 'round') ok(Math.abs(c1p) < 0.1, `T ${T}, ${md}: the filter gets the pitch right (within 0.1 ¢)`);
      ok(res.every((r) => isFinite(r) && r > -60), `T ${T}, ${md}: never silent (difference ${res.map((r) => r.toFixed(1)).join(', ')} dB at trips 10, 100, 1000)`);
      if (md === 'allpass') {
        const f10 = A.peakFreq(y, s, w, 10 / p10.period), dm = cents(f10, 10 / T) - c1m, dp = cents(T, p10.period) - c1p;
        row['h10 ¢ vs h1 predicted'] = +dp.toFixed(3); row['h10 ¢ measured'] = +dm.toFixed(3);
        ok(Math.abs(dm - dp) < 0.05, `T ${T}, allpass: harmonic 10 slides ${dm.toFixed(3)} ¢ against harmonic 1, predicted ${dp.toFixed(3)}`);
      }
      if (md === 'linear') {
        const f10 = 10 / p10.period, s1 = Math.round(T * 2), s2 = Math.round(T * 12), ww = Math.round(T * 6);
        const m = 20 * Math.log10(A.partial(y, s2, ww, f10) / A.partial(y, s1, ww, f10)) / 10, p = 20 * Math.log10(p10.gain);
        row['h10 dB/trip predicted'] = +p.toFixed(3); row['h10 dB/trip measured'] = +m.toFixed(3);
        ok(Math.abs(m - p) < 0.02 + 0.03 * Math.abs(p), `T ${T}, linear: harmonic 10 loses ${m.toFixed(3)} dB a trip, predicted ${p.toFixed(3)}`);
      }
      rows.push(row);
    }
  }
  console.table(rows);
  { const T = 100, a = A.cycleCoefs('saw', 40), n = T * 1004, ex = A.exactRead(a, T, n); for (const md of ['round', 'linear', 'allpass']) { const y = A.loopAt(a, T, md, n); ok(A.maxDiff(y, ex, 0, n) === 0, `d = 0, ${md}: the loop is the bare delay again, difference 0, exactly`); } }
}

// ---- a bell on the grid ----
{
  const B = engine('a bell on the grid', ['bellFreqs', 'bellStrike', 'cutCycle', 'readCycle', 'offGridDb', 'tripsIdentical', 'snapToGrid']);
  const st = B.bellStrike(FS, 600, FS * 4, 4), s0 = Math.round(0.02 * FS), rows = [];
  for (const P of [60, 137, 240, 600]) {
    const cyc = B.cutCycle(st, s0, P), n = 16 * P, lp = B.readCycle(cyc, n, 0, 0, FS), bent = B.readCycle(cyc, n, 0.6, 0, FS), Mw = Math.floor(FS / P), wob = B.readCycle(cyc, Mw * P, 0.6, 37.7, FS);
    const r = { P, bell: B.offGridDb(st, P, s0, 16), loop: B.offGridDb(lp, P, 0, 16), bent: B.offGridDb(bent, P, 0, 16), wob: B.offGridDb(wob, P, 0, Mw) };
    rows.push(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === 'number' && k !== 'P' ? +v.toFixed(1) : v])));
    ok(B.tripsIdentical(lp, P, 0, 16) && B.tripsIdentical(bent, P, 0, 16), `P ${P}: the looped cycle and the bent read repeat bit for bit, every trip`);
    ok(r.loop < -250 && r.bent < -250, `P ${P}: nothing between the harmonics for the loop and the bent read (${r.loop.toFixed(0)}, ${r.bent.toFixed(0)} dB: the arithmetic's floor)`);
    ok(r.bell > -6, `P ${P}: the bell keeps most of its energy between the loop's harmonics (${r.bell.toFixed(1)} dB)`);
    ok(!B.tripsIdentical(wob, P, 0, Mw) && r.wob > -40, `P ${P}: a moving bend, every trip still ${P} samples, puts energy between (${r.wob.toFixed(1)} dB)`);
  }
  console.table(rows);
}

// ---- position as a second clock ----
{
  const C = engine('position as a second clock', ['frameCoefs', 'storeFrame', 'norm2', 'readPosition', 'offGridDb', 'predictOffDb', 'repeatsAfter']);
  const rows = [];
  for (const fs_ of [44100, 48000]) for (const [p0, dep] of [[0.5, 0.4], [0.3, 0.25]]) {
    const P = 160, a = C.frameCoefs('A', 20), b = C.frameCoefs('B', 20), A = C.storeFrame(a, P), B = C.storeFrame(b, P); C.norm2(A, B);
    const f0 = fs_ / P, M = Math.floor(fs_ / P), pred = C.predictOffDb(A, B, p0, dep);
    for (const [lab, r, rep] of [['still', 0, 1], ['the pitch', f0, 1], ['2 × the pitch', 2 * f0, 1], ['3/2 of the pitch', 1.5 * f0, 2], ['37.7 Hz', 37.7, 0], ['golden × the pitch', (1 + Math.sqrt(5)) / 2 * f0, 0], ['0.25 Hz', 0.25, 0]]) {
      const y = C.readPosition(A, B, M * P, p0, r ? dep : 0, r, fs_), off = C.offGridDb(y, P, 0, M), rp = C.repeatsAfter(y, P, 8, 6);
      rows.push({ fs: fs_, p0, depth: dep, rate: lab, 'between dB': +off.toFixed(2), predicted: rep === 0 && r > 1 ? +pred.toFixed(2) : '', 'repeats after': rp });
      ok(rp === rep, `fs ${fs_}, p0 ${p0}: Position at ${lab} repeats after ${rep || 'no whole number up to 8 of'} trips (found ${rp})`);
      if (rep === 1) ok(off < -200, `fs ${fs_}, p0 ${p0}: Position at ${lab} puts nothing between the harmonics`);
      if (rep === 0 && r > 1) ok(Math.abs(off - pred) < 0.3, `fs ${fs_}, p0 ${p0}: at ${lab}, unrelated, the share between lands on the prediction (${off.toFixed(2)} vs ${pred.toFixed(2)} dB)`);
    }
  }
  console.table(rows);
}

// ---- reading between samples ----
{
  const D = engine('reading between samples', ['harmonicsFor', 'sawCoefs', 'storeTable', 'readAt', 'readTable', 'exactCycle', 'errorDb']);
  { const N = 2048, f = 55, a = D.sawCoefs(D.harmonicsFor(N, f, FS)), ex = D.exactCycle(a, N, f, FS, 20000); let m = 0; for (let i = 0; i < 20000; i += 97) { const x = (i * N * f / FS) % N; let s = 0; for (let k = 1; k < a.length; k++) s += a[k] * Math.sin(2 * Math.PI * k * x / N); m = Math.max(m, Math.abs(s - ex[i])); } ok(m < 1e-10, `the exact cycle's phasors stay with the series summed directly (largest gap ${m.toExponential(1)})`); }
  { const t = D.storeTable(D.sawCoefs(20), 256); let m = 0; for (const h of ['drop', 'linear', 'cubic']) for (let i = 0; i < 256; i++) m = Math.max(m, Math.abs(D.readAt(t, i, h) - t[i])); ok(m < 1e-15, 'on a stored sample, all three readers return it'); }
  const rows = [];
  for (const fs_ of [44100, 48000]) for (const N of [64, 256, 2048]) for (const f of [55, 220, 880, 3520]) {
    const K = D.harmonicsFor(N, f, fs_), a = D.sawCoefs(K), t = D.storeTable(a, N), ex = D.exactCycle(a, N, f, fs_, 12000);
    const e = Object.fromEntries(['drop', 'linear', 'cubic'].map((h) => [h, D.errorDb(D.readTable(t, f, fs_, 12000, h), ex)]));
    rows.push({ fs: fs_, N, f, K, drop: +e.drop.toFixed(1), linear: +e.linear.toFixed(1), cubic: +e.cubic.toFixed(1) });
    ok(e.drop > e.linear && e.linear > e.cubic, `fs ${fs_}, table ${N}, ${f} Hz: each better reader lands closer (${e.drop.toFixed(1)}, ${e.linear.toFixed(1)}, ${e.cubic.toFixed(1)} dB)`);
  }
  console.table(rows);
  const g = (N, f, h) => rows.find((r) => r.fs === 48000 && r.N === N && r.f === f)[h];
  for (const [h, lo, hi] of [['drop', 5, 7], ['linear', 11, 13], ['cubic', 17, 21]]) { const s = (g(256, 880, h) - g(2048, 880, h)) / 3; ok(s > lo && s < hi, `each doubling of the table buys ${h} about ${s.toFixed(1)} dB at 880 Hz`); }
}
console.log(failed ? `${failed} FAILED` : 'all claims hold');
process.exit(failed ? 1 : 0);
