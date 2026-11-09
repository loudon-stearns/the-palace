// Two self-sustaining loops, coupled. Does the pair snap where plucked loops slide?
// Each loop: delay (fractional) -> one-pole lowpass -> gain g > 1 -> tanh. Self-oscillates, saturates.
// Coupling: each delay's input is (1-c)*own + c*other.
// Usage: node sim.mjs <f1> <f2> [g] [secs]
const fs = 16000;
const main = process.argv[1].endsWith('sim.mjs');
const [f1 = 220, f2 = 220 / 1.6180339887, G = 1.5, SECS = 3] = main ? process.argv.slice(2).map(Number) : [];

function run(c, fA, fB, g = 1.5, secs = 3) {
  const NA = fs / fA, NB = fs / fB;
  const L = 4096, bufA = new Float64Array(L), bufB = new Float64Array(L);
  let lpA = 0, lpB = 0, w = 0, hxA = 0, hyA = 0, hxB = 0, hyB = 0; const R = 0.99;
  const a = 0.35; // lowpass coefficient (y = y + a(x - y))
  const n = Math.round(secs * fs);
  const outA = new Float64Array(n), outB = new Float64Array(n);
  let seed = 12345; const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648 - 0.5);
  for (let i = 0; i < L; i++) { bufA[i] = 0.01 * rnd(); bufB[i] = 0.01 * rnd(); }
  const read = (buf, N) => { const p = w - N; const i0 = Math.floor(p), fr = p - i0; return buf[(i0 + L * 4) % L] * (1 - fr) + buf[(i0 + 1 + L * 4) % L] * fr; };
  for (let i = 0; i < n; i++) {
    const xa = read(bufA, NA), xb = read(bufB, NB);
    lpA += a * (xa - lpA); lpB += a * (xb - lpB);
    // DC blocker, so the loop cannot latch at a constant
    hyA = lpA - hxA + R * hyA; hxA = lpA; hyB = lpB - hxB + R * hyB; hxB = lpB;
    const yA = Math.tanh(g * hyA), yB = Math.tanh(g * hyB);
    bufA[w] = (1 - c) * yA + c * yB;
    bufB[w] = (1 - c) * yB + c * yA;
    w = (w + 1) % L;
    outA[i] = yA; outB[i] = yB;
  }
  return { outA, outB };
}

// power at frequency f over the last `tail` seconds (Hann window)
function peaks(x, lo, hi, step, tail = 1.5) {
  const n = Math.round(tail * fs), s = x.length - n, res = [];
  for (let f = lo; f <= hi; f += step) {
    let re = 0, im = 0; const wv = 2 * Math.PI * f / fs;
    for (let k = 0; k < n; k++) { const h = 0.5 - 0.5 * Math.cos(2 * Math.PI * k / n); re += h * x[s + k] * Math.cos(wv * k); im -= h * x[s + k] * Math.sin(wv * k); }
    res.push([f, re * re + im * im]);
  }
  // local maxima, sorted
  const m = [];
  for (let i = 1; i < res.length - 1; i++) if (res[i][1] > res[i - 1][1] && res[i][1] >= res[i + 1][1]) m.push(res[i]);
  m.sort((p, q) => q[1] - p[1]);
  const top = m[0][1];
  return m.slice(0, 4).map(([f, p]) => `${f.toFixed(2)}(${(10 * Math.log10(p / top)).toFixed(0)})`).join(' ');
}

export { run, peaks, fs };
if (main) {
  console.log(`f1=${f1.toFixed(2)} f2=${f2.toFixed(2)} g=${G}`);
  const lo = Math.min(f1, f2) * 0.5, hi = Math.max(f1, f2) * 1.3;
  for (const c of [0, 0.02, 0.05, 0.08, 0.1, 0.12, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5]) {
    const { outA, outB } = run(c, f1, f2, G, SECS);
    console.log(`c=${c.toFixed(2)}  A: ${peaks(outA, lo, hi, 0.25)}   B: ${peaks(outB, lo, hi, 0.25)}`);
  }
}
