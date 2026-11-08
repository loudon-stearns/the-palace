// node render_sweep.cjs <table.wav> <out.wav> [seconds] [hz]
// Sweeps Position 0 → 1 through a packed table with the page worklet's own
// arithmetic (linear within a frame, linear between frames, gain 0.55).
const fs = require('fs'), P = require('./packer.js');
const [inp, out, secs = '16', hz = '110'] = process.argv.slice(2);
const b = fs.readFileSync(inp); const t = P.parseWav(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)).samples;
const FR = 1024, F = t.length / FR, SR = 48000, N = Math.round(+secs * SR), dPh = +hz / SR;
const y = new Float32Array(N); let ph = 0;
const at = (fi, p) => { const x = p * FR, i0 = x | 0, fr = x - i0, i1 = (i0 + 1) & (FR - 1); return t[fi * FR + i0] + fr * (t[fi * FR + i1] - t[fi * FR + i0]); };
for (let s = 0; s < N; s++) {
  const fIdx = (s / (N - 1)) * (F - 1), f0 = fIdx | 0, f1 = f0 < F - 1 ? f0 + 1 : f0, ff = fIdx - f0;
  const a = at(f0, ph), c = at(f1, ph);
  const fade = Math.min(1, s / 2400, (N - s) / 2400);
  y[s] = (a + ff * (c - a)) * 0.55 * fade; ph += dPh; if (ph >= 1) ph -= 1;
}
fs.writeFileSync(out, Buffer.from(P.encodeWavFloat32(y, SR)));
console.log(`${F} frames, ${secs}s at ${hz} Hz → ${out}`);
