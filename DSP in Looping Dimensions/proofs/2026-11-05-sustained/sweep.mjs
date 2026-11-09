// Fine sweep of the coupling, wide band, with the strongest lines and how line-like the sound is.
// Usage: node sweep.mjs <f1> <f2> <c0> <c1> <dc>
import { run, fs } from './sim.mjs';
const [f1, f2, c0, c1, dc, G = 1.5] = process.argv.slice(2).map(Number);

function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) { let b = n >> 1; for (; j & b; b >>= 1) j ^= b; j ^= b; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len, wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) { let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) { const a = i + k, b = a + len / 2; const tr = re[b] * cr - im[b] * ci, ti = re[b] * ci + im[b] * cr;
        re[b] = re[a] - tr; im[b] = im[a] - ti; re[a] += tr; im[a] += ti; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } }
  }
}
// power spectrum of the last 2 s, zero-padded x4 (0.12 Hz bins)
export function spectrum(x) {
  const n = 1 << 15, N = n * 4, s = x.length - n, re = new Float64Array(N), im = new Float64Array(N);
  for (let k = 0; k < n; k++) re[k] = (0.5 - 0.5 * Math.cos(2 * Math.PI * k / n)) * x[s + k];
  fft(re, im);
  const df = fs / N, out = [];
  for (let i = Math.ceil(40 / df); i <= 2000 / df; i++) out.push([i * df, re[i] * re[i] + im[i] * im[i]]);
  return out;
}
export function describe(sp) {
  const pw = sp.map(p => p[1]); const tot = pw.reduce((a, b) => a + b, 0);
  const sorted = [...pw].sort((a, b) => b - a); const top = sorted.slice(0, Math.round(sorted.length * 0.01)).reduce((a, b) => a + b, 0);
  const m = [];
  for (let i = 1; i < sp.length - 1; i++) if (sp[i][1] > sp[i - 1][1] && sp[i][1] >= sp[i + 1][1]) m.push(sp[i]);
  m.sort((p, q) => q[1] - p[1]);
  // keep distinct lines (> 2 Hz apart)
  const lines = []; for (const p of m) { if (lines.every(l => Math.abs(l[0] - p[0]) > 2)) lines.push(p); if (lines.length === 4) break; }
  return { lines: lines.map(l => [l[0], 10 * Math.log10(l[1] / lines[0][1])]), share: top / tot };
}
// strongest line near each loop's own pitch, then the mixed points m*fa + n*fb (m, n != 0, |m|,|n| <= 3)
// against the median bin; the axes (harmonics of each) beside them
export function lattice(sp) {
  const df = sp[1][0] - sp[0][0], f0 = sp[0][0];
  const at = f => { const i = Math.round((f - f0) / df); let b = 0; for (let j = i - 2; j <= i + 2; j++) if (sp[j] && sp[j][1] > b) b = sp[j][1]; return b; };
  const near = (f, w) => { let best = [f, 0]; for (const p of sp) if (Math.abs(p[0] - f) < w && p[1] > best[1]) best = p; return best[0]; };
  const med = [...sp.map(p => p[1])].sort((a, b) => a - b)[sp.length >> 1];
  const fa = near(f1, 8), fb = near(f2, 8), mixed = [], axes = [];
  for (let m = -3; m <= 3; m++) for (let n = -3; n <= 3; n++) {
    const f = m * fa + n * fb; if (f < 45 || f > 1990) continue;
    const db = 10 * Math.log10(at(f) / med);
    if (m !== 0 && n !== 0) mixed.push(db); else if (m > 0 || n > 0) axes.push(db);
  }
  const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  return `fa ${fa.toFixed(2)} fb ${fb.toFixed(2)} | axes ${mean(axes).toFixed(1)} dB, mixed ${mean(mixed).toFixed(1)} dB (max ${Math.max(...mixed).toFixed(1)}) over median`;
}
if (process.argv[1].endsWith('sweep.mjs')) {
  for (let c = c0; c <= c1 + 1e-9; c += dc) {
    const { outA } = run(c, f1, f2, G);
    const sp = spectrum(outA), d = describe(sp);
    console.log(`c=${c.toFixed(3)}  lines ${d.lines.map(([f, db]) => `${f.toFixed(2)}(${db.toFixed(0)})`).join(' ')}  ${lattice(sp)}`);
  }
}
