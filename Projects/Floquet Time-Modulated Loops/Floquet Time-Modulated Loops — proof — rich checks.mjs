// title: Floquet Time-Modulated Loops — proof — rich checks
// born: 2026-11-03
// links: [[Floquet Time-Modulated Loops]] connects-to · checks-for
// forward_vector: I re-run, in Node, every claim the four rich-face pieces make: I pull the script marked
//   id="fq-engine" out of each piece and test it against the number the piece prints, so a change to a piece's engine
//   that breaks its claim fails here. Run: node "Projects/Floquet Time-Modulated Loops/Floquet Time-Modulated Loops — proof — rich checks.mjs"
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
const ENTRY = 'Floquet Time-Modulated Loops';
let fails = 0;
const ok = (cond, what, got) => { console.log((cond ? '  ok   ' : '  FAIL ') + what + (got !== undefined ? '  — ' + got : '')); if (!cond) fails++; };
function engine(piece, names) {
  const html = readFileSync(join(HERE, `${ENTRY} — rich — ${piece}.html`), 'utf8');
  const m = html.match(/<script id="fq-engine">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('no fq-engine in ' + piece);
  return vm.runInNewContext(m[1] + `\n({${names.join(',')}})`, { Math, Float32Array });
}
const dB = (v) => 20 * Math.log10(Math.max(v, 1e-12));
const VOICE = ['FloquetVoice', 'monodromy', 'multipliers', 'rhoMax', 'unstable', 'edgeA'];
const pitchOf = (x, from, to, sr) => { let z = 0, f0 = -1, f1 = -1; for (let j = from; j < to; j++) if (x[j - 1] <= 0 && x[j] > 0) { const fr = j - 1 + (-x[j - 1]) / (x[j] - x[j - 1]); if (f0 < 0) f0 = fr; f1 = fr; z++; } return (z - 1) * sr / (f1 - f0); };
const lastRms = (r, n) => Math.sqrt(r.slice(-n).reduce((s, v) => s + v * v, 0) / n);

console.log('strutt map');
{
  const E = engine('strutt map', VOICE), un = (a, q, k) => E.unstable(E.multipliers(E.monodromy(a, q, k, 256)));
  ok(un(1, 0.02, 0) && un(4 + 0.09 / 6, 0.3, 0) && un(9 + 0.36 / 16, 0.6, 0), 'undamped tongues root at a = 1, 4, 9 (inside each at small q)');
  let lo = 0, hi = 0.3; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (un(1, m, 0.05)) hi = m; else lo = m; }
  ok(Math.abs(lo - 0.05) < 1e-3, 'damped (κ = 0.05) tongue 1 opens at q = κ', lo.toFixed(4));
  const sr = 48000;
  for (const [a, q, f] of [[0.75, 0.3, 220], [1, 0.3, 220], [1.25, 0.3, 220], [3.95, 1.2, 440], [4.4, 1.2, 440]]) {
    const v = new E.FloquetVoice(sr, 11); v.set({ a, q, kappa: 0.05, sigma: 1.5e-3, snap: true }); const { x } = v.render(sr * 3, 2400);
    const p = pitchOf(x, sr * 2, sr * 3, sr); ok(Math.abs(p - f) < 0.05, `inside the tongue at a = ${a}, q = ${q} the ring locks to ${f} Hz`, p.toFixed(3) + ' Hz');
  }
  for (const [out, inn, q] of [[0.2, 1, 0.5], [2.5, 1, 0.5], [3, 4.2, 1.2]]) {
    const aE = E.edgeA(out, inn, q, 0.05), dir = Math.sign(inn - out);
    const run = (a) => { const v = new E.FloquetVoice(sr, 11); v.set({ a, q, kappa: 0.05, sigma: 1.5e-3, snap: true }); return lastRms(v.render(sr * 3, sr / 20).rms, 10); };
    const lo2 = run(aE - dir * 0.03), hi2 = run(aE + dir * 0.03);
    ok(dB(hi2) - dB(lo2) > 10 && dB(lo2) < -30, `edge at a = ${aE.toFixed(4)}, q = ${q}: 0.03 outside is hiss, 0.03 inside rings`, `${dB(lo2).toFixed(1)} dB vs ${dB(hi2).toFixed(1)} dB`);
  }
}

console.log('multipliers');
{
  const E = engine('multipliers', VOICE), mag = (r) => Math.hypot(r[0], r[1]);
  for (const [a, q] of [[1.5, 0.3], [0.5, 0.1], [2.5, 0.5], [4.3, 0.6]]) {
    const m = E.multipliers(E.monodromy(a, q, 0, 256));
    ok(Math.abs(m.det - 1) < 1e-8 && !E.unstable(m) && Math.abs(mag(m.r1) - 1) < 1e-6 && Math.abs(mag(m.r2) - 1) < 1e-6, `undamped and stable at (${a}, ${q}): det M = 1 and both |ρ| = 1`, `det ${m.det.toFixed(9)}, |ρ| ${mag(m.r1).toFixed(7)}`);
  }
  const t1 = E.multipliers(E.monodromy(1.2, 0.5, 0, 256)), t2 = E.multipliers(E.monodromy(4.3, 1.2, 0, 256));
  ok(t1.real && t1.r1[0] < 0 && t1.r2[0] < 0, 'inside tongue 1 the pair is real and negative (it met at −1)', t1.r1[0].toFixed(3) + ', ' + t1.r2[0].toFixed(3));
  ok(t2.real && t2.r1[0] > 0 && t2.r2[0] > 0, 'inside tongue 2 the pair is real and positive (it met at +1)', t2.r1[0].toFixed(3) + ', ' + t2.r2[0].toFixed(3));
  const md = E.multipliers(E.monodromy(1.5, 0.3, 0.1, 256));
  ok(Math.abs(mag(md.r1) - Math.exp(-0.1 * Math.PI / 2)) < 1e-6, 'damped (κ = 0.1) stable multipliers sit on |ρ| = e^(−κπ/2)', mag(md.r1).toFixed(6));
  const edge = (pred, a0, a1) => { const p0 = pred(a0); for (let i = 0; i < 40; i++) { const m = (a0 + a1) / 2; if (pred(m) === p0) a0 = m; else a1 = m; } return (a0 + a1) / 2; };
  for (const [k, sameish] of [[0, true], [0.1, false]]) {
    const e = edge((a) => E.unstable(E.multipliers(E.monodromy(a, 0.3, k, 256))), 2, 1), s = edge((a) => E.multipliers(E.monodromy(a, 0.3, k, 256)).real, 2, 1);
    ok(sameish ? Math.abs(e - s) < 1e-4 : s - e > 0.01, `κ = ${k}: the split and the edge ${sameish ? 'coincide' : 'come apart'}`, `split ${s.toFixed(4)}, edge ${e.toFixed(4)}`);
  }
}

console.log('threshold');
{
  const E = engine('threshold', VOICE), sr = 48000, W0 = 2 * Math.PI * 220;
  const rest = new E.FloquetVoice(sr, 3); rest.set({ a: 1, q: 0.2, kappa: 0.05, sigma: 0, snap: true }); const xr = rest.render(sr * 1.5, 240).x;
  ok(xr.every((v) => v === 0), 'pumped from perfect rest, it stays exactly at zero');
  let lo = 0, hi = 0.2; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (E.unstable(E.multipliers(E.monodromy(1, m, 0.05, 512)))) hi = m; else lo = m; }
  ok(Math.abs(lo - 0.05) < 1e-4, 'with ζ = 0.025 the threshold is q = 2ζ = 0.05', lo.toFixed(5));
  for (const q of [0.03, 0.07, 0.1, 0.3]) {
    const th = (q - 0.05) / 2 * W0, mm = Math.log(E.rhoMax(E.multipliers(E.monodromy(1, q, 0.05, 512)))) / Math.PI * W0;
    ok(Math.abs(mm - th) <= 0.02 * Math.abs(th), `q = ${q}: textbook growth and one period agree within 2 %`, `${th.toFixed(1)} vs ${mm.toFixed(1)} /s`);
  }
  ok(E.unstable(E.multipliers(E.monodromy(1, 0.005, 0, 512))), 'with no damping even q = 0.005 grows');
  const wav = (f) => { const b = readFileSync(join(HERE, 'audio', f)); let o = 12; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'data') return new Float32Array(b.buffer.slice(b.byteOffset + o + 8, b.byteOffset + o + 8 + n)); o += 8 + n + (n & 1); } };
  if (existsSync(join(HERE, 'audio', '04b_at_threshold.wav'))) {
    const full = (x) => { const w = 2400, r = []; for (let i = 0; i + w <= x.length; i += w) { let s = 0; for (let j = i; j < i + w; j++) s += x[j] * x[j]; r.push(Math.sqrt(s / w)); } const end = lastRms(r, 20); return (r.findIndex((v) => dB(v) > dB(end) - 3) + 1) * w / 48000; };
    const fb = full(wav('04b_at_threshold.wav')), fc = full(wav('04c_above_threshold.wav'));
    ok(fb <= 0.25 && fc <= 0.1, 'the build’s 04b (q = 0.10) is full within 0.25 s and 04c (q = 0.30) within 0.1 s', `${fb.toFixed(2)} s, ${fc.toFixed(2)} s`);
  }
}

console.log('sideband ladder');
{
  const D = engine('sideband ladder', ['SB', 'modShape', 'coeffs', 'renderOpen', 'renderLoop', 'lineAmp', 'firstOrder']);
  for (const kind of ['cosine', 'fm', 'square', 'bump']) {
    const c = D.coeffs(kind, 8), y = D.renderOpen(kind, 1); let worst = 0;
    for (let n = -3; n <= 6; n++) worst = Math.max(worst, Math.abs(D.lineAmp(y, Math.abs(220 + 80 * n)) - c[n].mag));
    ok(worst < 1e-3, `open loop, ${kind}: every rung is |c_n|`, worst.toExponential(1));
    const yl = D.renderLoop(kind, 0.05, 0.05, 1, 0.5), X0 = D.lineAmp(yl, 220); let w2 = 0;
    for (let n = -3; n <= 6; n++) if (n && c[n].mag > 0.05) w2 = Math.max(w2, Math.abs(dB(D.lineAmp(yl, Math.abs(220 + 80 * n)) / X0) - dB(D.firstOrder(c, n, 0.05, 0.05))));
    ok(w2 < 1.5, `in the loop at h = 0.05, ${kind}: first order lands within 1.5 dB`, w2.toFixed(2) + ' dB');
    const y5 = D.renderLoop(kind, 0.5, 0.05, 1, 0.5); let pk = 0; for (const v of y5) pk = Math.max(pk, Math.abs(v));
    ok(pk < 50, `in the loop at h = 0.5, ${kind}: bounded`, 'peak ' + pk.toFixed(2));
  }
  for (const kind of ['cosine', 'square']) {
    const yl = D.renderLoop(kind, 0.3, 0.05, 1, 0.5), r = D.lineAmp(yl, 60) / D.lineAmp(yl, 220);
    ok(D.coeffs(kind, 3)[-2].mag < 1e-6 && dB(r) > -40, `in the loop at h = 0.3, ${kind}: a rung at 60 Hz where c₋₂ = 0`, dB(r).toFixed(1) + ' dB re carrier');
  }
}
console.log(fails ? `\n${fails} check(s) failed` : '\nall checks pass');
process.exit(fails ? 1 : 0);
