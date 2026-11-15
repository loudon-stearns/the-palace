// make-pluck.mjs — writes pluck.wav beside itself: one Karplus-Strong pluck, 196 Hz, 1.5 s,
// 44.1 kHz, 16-bit mono, seeded so it is the same bytes every run. The piece beside it
// plays this file and the same pluck synthesized in the page, so the file and the page can
// be heard against each other and nulled by a script (check.mjs).
// Run from anywhere: node "Shop/Rich-face Kit/proofs/2026-11-15-second-file/make-pluck.mjs"
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function pluck({ sr = 44100, hz = 196, seconds = 1.5, seed = 7, damp = 0.996 } = {}) {
  let s = seed >>> 0;
  const rnd = () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const N = Math.round(sr / hz);
  const line = new Float32Array(N);
  for (let i = 0; i < N; i++) line[i] = rnd() * 2 - 1;
  const out = new Float32Array(Math.round(sr * seconds));
  let k = 0;
  for (let i = 0; i < out.length; i++) {
    const a = line[k], b = line[(k + 1) % N];
    const y = damp * 0.5 * (a + b);
    out[i] = a * 0.5;                      // half scale: about -6 dBFS peak, room in the mix
    line[k] = y;
    k = (k + 1) % N;
  }
  return out;
}

function wav(samples, sr) {
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + samples.length * 2, 4); buf.write('WAVE', 8);
  buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write('data', 36); buf.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  return buf;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const s = pluck();
  fs.writeFileSync(path.join(here, 'pluck.wav'), wav(s, 44100));
  console.log(`pluck.wav: ${s.length} samples, peak ${Math.max(...s.map(Math.abs)).toFixed(3)}`);
}
