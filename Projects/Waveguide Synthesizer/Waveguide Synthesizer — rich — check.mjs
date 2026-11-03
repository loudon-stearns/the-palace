// title: Waveguide Synthesizer — rich — check
// born: 2026-11-03
// links: [[Waveguide Synthesizer]] (connects-to · rich-face-check) · checks the two made pieces in [[Waveguide Synthesizer — rich.json]]
// forward_vector: I run each made piece's own engine, lifted out of its page, in Node, against the claim the piece makes: the pitch of the seed case, how fast each harmonic dies, the two waves and their sign flips, and the harmonics a pluck position removes. I exit 1 if any claim fails, so a change to a piece that breaks its claim is caught.
// run: node "Projects/Waveguide Synthesizer/Waveguide Synthesizer — rich — check.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const engine = (file, names) => {
  const html = fs.readFileSync(path.join(here, file), 'utf8');
  const m = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`no engine script in ${file}`);
  return new Function(m[1] + `; return { ${names.join(', ')} };`)();
};
let failed = 0;
const ok = (cond, what) => { console.log(`${cond ? 'pass' : 'FAIL'} · ${what}`); if (!cond) failed++; };
const cents = (a, b) => 1200 * Math.log2(a / b);

// ---- karplus-strong walked up ----
const K = engine('Waveguide Synthesizer — rich — karplus-strong walked up.html', ['ksBurst', 'ksRender', 'measurePitch', 'harmonicTrack', 'measureDecay', 'predictDecay']);
const RHO = 0.996, rows = [];
for (const fs_ of [44100, 48000]) for (const N of [20, 50, 100, 200, 400]) {
  const bare = K.ksRender(N, K.ksBurst(N, 7), fs_, false, RHO), avg = K.ksRender(N, K.ksBurst(N, 7), fs_, true, RHO);
  const mb = K.measurePitch(bare, fs_, fs_ / N, 0.02, 0.3), ma = K.measurePitch(avg, fs_, fs_ / (N + 0.5), 0.02, 0.3);
  rows.push({ fs: fs_, N, 'bare loop vs fs/N ¢': +cents(mb, fs_ / N).toFixed(3), 'with average vs fs/N ¢': +cents(ma, fs_ / N).toFixed(2), 'with average vs fs/(N+½) ¢': +cents(ma, fs_ / (N + 0.5)).toFixed(3) });
  ok(Math.abs(cents(mb, fs_ / N)) < 0.1, `bare loop, fs ${fs_}, N ${N}: pitch is fs/N`);
  ok(Math.abs(cents(ma, fs_ / (N + 0.5))) < 0.1, `with the average, fs ${fs_}, N ${N}: pitch is fs/(N+½), not fs/N (off by ${cents(ma, fs_ / N).toFixed(2)} ¢)`);
}
console.table(rows);
const drows = [];
for (const N of [50, 100, 200]) {
  const fs_ = 48000, y = K.ksRender(N, K.ksBurst(N, 7), fs_ * 4, true, RHO), f0 = fs_ / (N + 0.5);
  const tracks = Array.from({ length: 8 }, (_, k) => K.harmonicTrack(y, fs_, f0, k + 1, 3));
  let ref = -Infinity; for (const t of tracks) if (t.length) ref = Math.max(ref, t[0][1]);
  let prevSlope = 0;
  for (const k of [1, 2, 4, 8]) {
    const p = K.predictDecay(fs_, N, k, RHO, true), m = K.measureDecay(tracks[k - 1], ref - 60);
    drows.push({ N, k, 'predicted dB/s': +p.toFixed(1), 'measured dB/s': isNaN(m) ? '—' : +m.toFixed(1) });
    if (!isNaN(m)) ok(Math.abs(m - p) <= Math.max(1, 0.05 * Math.abs(p)), `N ${N}, harmonic ${k}: dies at the loop's predicted rate (${m.toFixed(1)} vs ${p.toFixed(1)} dB/s)`);
    ok(p < prevSlope, `N ${N}: harmonic ${k} dies faster than the one below it (bright to dark)`); prevSlope = p;
  }
}
console.table(drows);

// ---- two travelling waves ----
const W = engine('Waveguide Synthesizer — rich — two travelling waves.html', ['wgPluck', 'wgStep', 'wgRender', 'wgHarmonics', 'wgPredict']);
{
  const N = 120, s = W.wgPluck(N, 0.3), r0 = Float64Array.from(s.r), l0 = Float64Array.from(s.l);
  for (let i = 0; i < 2 * N; i++) W.wgStep(s, -1, -1);
  let e = 0; for (let i = 0; i < N; i++) e = Math.max(e, Math.abs(s.r[i] - r0[i]), Math.abs(s.l[i] - l0[i]));
  ok(e === 0, 'lossless, fixed ends: after 2N samples the string is exactly where it began (period 2N, pitch fs/2N)');
  for (const [g, sign, what] of [[-1, -1, 'fixed ends turn the wave over'], [1, 1, 'free ends send it back upright']]) {
    const t = W.wgPluck(N, 0.3); for (let i = 0; i < N; i++) W.wgStep(t, g, g);
    let d = 0; for (let i = 0; i < N; i++) d = Math.max(d, Math.abs((t.r[i] + t.l[i]) - sign * (r0[N - 1 - i] + l0[N - 1 - i])));
    ok(d < 1e-12, `${what}: after N samples the string is the mirror of the start, times ${sign}`);
  }
  const hrows = [];
  for (const [lab, p] of [['1/2', 1 / 2], ['1/3', 1 / 3], ['1/4', 1 / 4], ['1/5', 1 / 5], ['0.9', 0.9], ['0.37', 0.37]]) {
    const pp = W.wgPluck(N, p).p, H = W.wgHarmonics(N, p, 16), P = W.wgPredict(pp, 16);
    const miss = [], missDb = []; let worst = 0;
    for (let k = 1; k <= 16; k++) {
      const m = 20 * Math.log10(Math.max(H[k - 1] / H[0], 1e-300));
      if (Math.abs(Math.sin(k * Math.PI * pp)) < 1e-9) { miss.push(k); missDb.push(m); }
      else worst = Math.max(worst, Math.abs(m - 20 * Math.log10(P[k - 1] / P[0])));
    }
    hrows.push({ p: lab, 'snapped p': +pp.toFixed(4), 'predicted missing': miss.join(' '), 'loudest missing, dB re h1': missDb.length ? +Math.max(...missDb).toFixed(0) : '', 'worst other vs |sin(kπp)|/k², dB': +worst.toFixed(3) });
    if (miss.length) ok(Math.max(...missDb) < -120, `pluck at ${lab}: harmonics ${miss.join(', ')} are missing (loudest ${Math.max(...missDb).toFixed(0)} dB)`);
    ok(worst < 0.25, `pluck at ${lab}: every other harmonic within 0.25 dB of |sin(kπp)|/k² (worst ${worst.toFixed(3)} dB)`);
  }
  console.table(hrows);
}
console.log(failed ? `${failed} FAILED` : 'all claims hold');
process.exit(failed ? 1 : 0);
