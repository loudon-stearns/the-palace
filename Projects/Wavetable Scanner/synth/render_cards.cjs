// The Synth Templates cards, played on this synth in Node: the same engine the
// page's AudioWorklet runs, the same spectral morph the page applies, each
// card's own render pattern (cards.json, from build_cards.py).
// Writes cards/<id>.wav (48 kHz, like Synth Templates' renders) and
// render_cards.json: for each card, how far the brightness moves over the
// render, here and in Synth Templates' reference render of the same card,
// which plays a saw where the table belongs.
// usage: node render_cards.cjs
const fs = require('fs'), path = require('path');
const S = require('./wt-synth.js'), P = require('../packer/packer.js');
const Engine = S.engineFactory(), FRAME = S.FRAME, HERE = __dirname, SR = 48000;
const REFS = path.join(HERE, '../../Synth Templates/workshop/renders');
const C = JSON.parse(fs.readFileSync(path.join(HERE, 'cards.json'), 'utf8'));

function wav16(file, L, R, sr) {
  const n = L.length, b = Buffer.alloc(44 + n * 4);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 4, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(2, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 4, 28); b.writeUInt16LE(4, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) { b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i])) * 32767), 44 + i * 4); b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i])) * 32767), 46 + i * 4); }
  fs.writeFileSync(file, b);
}
function readMono(file) {   // 16-bit PCM or float, any channels → mono Float32
  const b = fs.readFileSync(file); let i = 12, fmt = null;
  while (i < b.length) {
    const id = b.toString('ascii', i, i + 4), n = b.readUInt32LE(i + 4);
    if (id === 'fmt ') fmt = { ch: b.readUInt16LE(i + 10), sr: b.readUInt32LE(i + 12), bits: b.readUInt16LE(i + 22) };
    if (id === 'data') {
      const bps = fmt.bits / 8, frames = Math.floor(n / (bps * fmt.ch)), x = new Float32Array(frames);
      for (let f = 0; f < frames; f++) { let s = 0; for (let c = 0; c < fmt.ch; c++) { const o = i + 8 + (f * fmt.ch + c) * bps; s += fmt.bits === 16 ? b.readInt16LE(o) / 32768 : b.readFloatLE(o); } x[f] = s / fmt.ch; }
      return { x, sr: fmt.sr };
    }
    i += 8 + n + (n & 1);
  }
}
function decode(t) {
  const buf = Buffer.from(t.data, 'base64');
  if (t.int16) { const s = new Int16Array(buf.buffer, buf.byteOffset, buf.length / 2); return Float32Array.from(s, v => v / 32767); }
  return new Float32Array(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length));
}
function morphed(samples, frames) {   // the page's morphed(): line up, lock phases, fill the gaps, match energy
  if (frames < 2) return { samples, frames };
  const fr = [];
  for (let f = 0; f < frames; f++) { const c = samples.slice(f * FRAME, (f + 1) * FRAME); let m = 0; for (const v of c) m += v; m /= FRAME; fr.push(c.map(v => v - m)); }
  const { frames: out } = P.spectralMorph(P.alignRotations(fr), 512, true);
  const s = new Float32Array(out.length * FRAME); out.forEach((c, i) => s.set(c, i * FRAME));
  let e = 0; for (const v of s) e += v * v; e /= s.length; let e0 = 0; for (const v of samples) e0 += v * v; e0 /= samples.length;
  const k = Math.sqrt(e0 / e); for (let i = 0; i < s.length; i++) s[i] *= k;
  return { samples: s, frames: out.length };
}
function fft(re, im) { const n = re.length; for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; } }
  for (let len = 2; len <= n; len <<= 1) { const a = -2 * Math.PI / len, wr = Math.cos(a), wi = Math.sin(a); for (let i = 0; i < n; i += len) { let cr = 1, ci = 0; for (let k = 0; k < len / 2; k++) { const p = i + k, q = p + len / 2, xr = re[q] * cr - im[q] * ci, xi = re[q] * ci + im[q] * cr; re[q] = re[p] - xr; im[q] = im[p] - xi; re[p] += xr; im[p] += xi; const t = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = t; } } } }
// brightness over time: spectral centroid of 4096-sample Hann windows every 50 ms, where the level is within 30 dB of the loudest window
function brightness(x, sr) {
  const N = 4096, hop = Math.round(sr * 0.05), rows = [];
  for (let s = 0; s + N <= x.length; s += hop) {
    const re = new Float64Array(N), im = new Float64Array(N); let e = 0;
    for (let i = 0; i < N; i++) { const v = x[s + i]; e += v * v; re[i] = v * (0.5 - 0.5 * Math.cos(2 * Math.PI * i / N)); }
    fft(re, im); let num = 0, den = 0;
    for (let k = 1; k < N / 2; k++) { const m = Math.hypot(re[k], im[k]); num += m * k * sr / N; den += m; }
    rows.push({ t: s / sr, e, c: den ? num / den : 0 });
  }
  const top = Math.max(...rows.map(r => r.e)), live = rows.filter(r => r.e > top * 1e-3).map(r => r.c).sort((a, b) => a - b);
  const q = p => live[Math.min(live.length - 1, Math.floor(p * live.length))];
  return { lo: Math.round(q(0.05)), hi: Math.round(q(0.95)), octaves: +Math.log2(q(0.95) / q(0.05)).toFixed(2) };
}

const BAKED = { cello: '../packer/demo_cello.wav', fm: '../packer/browser_export_fmsynth_chain_smooth.wav' };
fs.mkdirSync(path.join(HERE, 'cards'), { recursive: true });
const report = [];
for (const c of C.cards) {
  if (!c.patch) { report.push({ id: c.id, played: false, why: c.not_carried[0] }); continue; }
  const raw = C.tables[c.table] ? { samples: decode(C.tables[c.table]), frames: C.tables[c.table].frames }
                                : (w => ({ samples: w.samples, frames: w.samples.length / FRAME }))(P.parseWav(fs.readFileSync(path.join(HERE, BAKED[c.table])).buffer));
  const t = morphed(raw.samples, raw.frames);
  const e = new Engine(SR); e.setTable(S.buildMips(t.samples, t.frames), t.frames);
  e.setAll(Engine.DEFAULTS); e.setAll(c.patch);
  const ev = c.events.slice().sort((a, b) => a[0] - b[0]);
  const seconds = Math.max(c.length_s, ev[ev.length - 1][0] + (c.patch.aR || 0.1) * 1.2 + 0.2);
  const n = Math.round(seconds * SR), L = new Float32Array(n), R = new Float32Array(n), B = 128, l = new Float32Array(B), r = new Float32Array(B);
  let k = 0;
  for (let i = 0; i < n; i += B) {
    while (k < ev.length && ev[k][0] * SR <= i) {
      const [, what, a, b] = ev[k++];
      if (what === 'on') e.noteOn(a, b); else if (what === 'off') e.noteOff(a); else if (what === 'cc') e.cc(a, b);
      else if (what === 'set') e.set(a, b); else if (what === 'lfo0') e.lfoPh = 0;
    }
    e.render(l, r, B); L.set(l.subarray(0, Math.min(B, n - i)), i); R.set(r.subarray(0, Math.min(B, n - i)), i);
  }
  let pk = 0, ms = 0; for (let i = 0; i < n; i++) { pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); ms += (L[i] * L[i] + R[i] * R[i]) / 2; }
  const file = `cards/${c.id}.wav`; wav16(path.join(HERE, file), L, R, SR);
  const mono = Float32Array.from(L, (v, i) => (v + R[i]) / 2);
  const ref = fs.existsSync(path.join(REFS, c.id + '.wav')) ? readMono(path.join(REFS, c.id + '.wav')) : null;
  report.push({ id: c.id, played: true, file, table: c.table, frames_after_morph: t.frames, seconds: +seconds.toFixed(2),
    peak_dbfs: +(20 * Math.log10(pk)).toFixed(1), rms_dbfs: +(10 * Math.log10(ms / n)).toFixed(1),
    brightness_here: brightness(mono, SR), brightness_reference: ref ? brightness(ref.x, ref.sr) : null, not_carried: c.not_carried });
}
fs.writeFileSync(path.join(HERE, 'render_cards.json'), JSON.stringify(report, null, 1));
for (const r of report) console.log(r.id.padEnd(26), r.played ? `${r.peak_dbfs} dBFS pk · brightness ${r.brightness_here.lo}–${r.brightness_here.hi} Hz (${r.brightness_here.octaves} oct) · reference ${r.brightness_reference ? `${r.brightness_reference.lo}–${r.brightness_reference.hi} Hz (${r.brightness_reference.octaves} oct)` : '—'}` : 'not played: ' + r.why);
