// Runs the play page's own bank DSP against mode_bank.py's output (mode_bank_ref.json).
import { readFileSync } from 'fs';
const html = readFileSync(new URL('./Floquet Kernel — play.html', import.meta.url), 'utf8');
const js = html.match(/<script>([\s\S]*)<\/script>/)[1];
const { DATA, makeBank } = new Function(js + '; return { DATA, makeBank };')();
const ref = JSON.parse(readFileSync(new URL('./mode_bank_ref.json', import.meta.url), 'utf8'));
const fs = 48000, N = fs / 2, f = 110, H = Math.floor(20000 / f) - 1;   // range(1, int(20000/f)) in Python
const x = new Float64Array(N);
for (let t = 0; t < N; t++) { let s = 0; for (let h = 1; h <= H; h++) s += Math.sin(2 * Math.PI * h * f * t / fs) / h; x[t] = s * 2 / Math.PI; }
let worst = -Infinity;
for (const [key, want] of Object.entries(ref.cases)) {
  const [name, nm, win] = key.split('|');
  const b = makeBank(DATA.modes[name].slice(0, +nm), DATA.taps, fs, win === '1');
  let e = 0, p = 0;
  for (let t = 0; t < N; t++) { const y = b.process(x[t], 31); if (t % 7 === 0) { const r = want[t / 7]; e += (y - r) ** 2; p += r * r; } }
  const err = 10 * Math.log10(e / p); worst = Math.max(worst, err);
  console.log(key, 'error', err.toFixed(1), 'dB below the signal');
}
process.exit(worst < -80 ? 0 : 1);
