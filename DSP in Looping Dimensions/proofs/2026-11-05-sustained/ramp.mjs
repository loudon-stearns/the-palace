// One continuous run: coupling ramped up 0 -> cmax, then back down. Pitch of each loop per block by
// zero crossings. A snap shows as a jump to equal pitches; hysteresis as lock and release at different c.
// Usage: node ramp.mjs <f1> <f2> <cmax> <secsEachWay> [g]
const fs = 16000;
const [fA, fB, cmax, T, g = 1.5] = process.argv.slice(2).map(Number);
const NA = fs / fA, NB = fs / fB, L = 4096, bufA = new Float64Array(L), bufB = new Float64Array(L);
let lpA = 0, lpB = 0, w = 0, hxA = 0, hyA = 0, hxB = 0, hyB = 0; const R = 0.99, a = 0.35;
let seed = 12345; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648 - 0.5);
for (let i = 0; i < L; i++) { bufA[i] = 0.01 * rnd(); bufB[i] = 0.01 * rnd(); }
const read = (buf, N) => { const p = w - N; const i0 = Math.floor(p), fr = p - i0; return buf[(i0 + L * 4) % L] * (1 - fr) + buf[(i0 + 1 + L * 4) % L] * fr; };
const warm = 2 * fs, n = warm + 2 * T * fs, blk = Math.round(1 * fs);
let zA = 0, zB = 0, pA = 0, pB = 0; const rows = [];
for (let i = 0; i < n; i++) {
  const t = Math.max(0, i - warm) / fs;
  const c = i < warm ? 0 : t < T ? cmax * t / T : cmax * (2 - t / T);
  const xa = read(bufA, NA), xb = read(bufB, NB);
  lpA += a * (xa - lpA); lpB += a * (xb - lpB);
  hyA = lpA - hxA + R * hyA; hxA = lpA; hyB = lpB - hxB + R * hyB; hxB = lpB;
  const yA = Math.tanh(g * hyA), yB = Math.tanh(g * hyB);
  bufA[w] = (1 - c) * yA + c * yB; bufB[w] = (1 - c) * yB + c * yA; w = (w + 1) % L;
  if (yA > 0 && pA <= 0) zA++; if (yB > 0 && pB <= 0) zB++; pA = yA; pB = yB;
  if (i >= warm && (i - warm) % blk === blk - 1) { rows.push([t < T ? 'up' : 'down', c, zA * fs / blk, zB * fs / blk]); zA = zB = 0; }
}
for (const [d, c, a1, b1] of rows) console.log(`${d.padEnd(4)} c=${c.toFixed(4)}  A ${a1.toFixed(0)}  B ${b1.toFixed(0)}  slips/s ${Math.abs(b1 - a1).toFixed(0)}  ${'#'.repeat(Math.round(Math.abs(b1 - a1)))}`);
