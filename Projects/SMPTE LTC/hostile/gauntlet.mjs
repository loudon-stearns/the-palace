// The hostile gauntlet: LTC broken on purpose, and a reader held to it.
//
//   node gauntlet.mjs make     write every hostile WAV and its answer key (files/)
//   node gauntlet.mjs run      read every WAV with GoButton's reader (ltc.js) and score it
//   node gauntlet.mjs run careful-reader.mjs   the same, for any reader that exports read(samples, sampleRate)
//   node gauntlet.mjs sweep [reader.mjs]   find where the reader breaks: noise, sample rate, low-pass, DC, speed
//
// The encoder and the reader are both GoButton's ltc.js, through the rich face's byte-for-byte
// copy. Every file starts from the same clean render; the damage is plain DSP written below,
// so a student can read exactly what was done to each one. A file's answer key is the set of
// frames that went in; a frame read is RIGHT if it is one of them, WRONG if it is not.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const L = require(path.join(here, '..', 'SMPTE LTC — rich — ltc.js'));
const FILES = path.join(here, 'files');

// ---------- a seeded random source, so every run makes the same files ----------
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function gauss(r) { const u = Math.max(r(), 1e-12), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

// ---------- making clean LTC ----------
// render(rateName, sampleRate, startText, seconds, speed) -> { y, frames: Set of 'hh:mm:ss:ff' }
function render(rateName, sr, start, seconds, speed = 1) {
  const rate = L.RATES[rateName];
  const startFrame = L.toFrames(L.parse(start), rate);
  const e = L.newEncoder(rate, sr, startFrame, 0);
  e.speed = speed;
  const n = Math.round(seconds * sr);
  const y = new Float32Array(n);
  const frames = new Set();
  for (let i = 0; i < n; i++) { frames.add(e.frame); y[i] = 0.5 * L.encodeSample(e); }
  const key = [...frames].map((f) => L.text(L.fromFrames(f, rate)));
  return { y, key, rate: rateName, sr };
}

// ---------- the damage ----------
const fx = {
  gain(y, g) { return y.map((v) => v * g); },
  invert(y) { return y.map((v) => -v); },
  clip(y, at) { return y.map((v) => Math.max(-at, Math.min(at, v))); },
  dc(y, off) { return y.map((v) => v + off); },
  noise(y, snrDb, seed = 1) {
    const r = rng(seed); let p = 0; for (const v of y) p += v * v; p /= y.length;
    const a = Math.sqrt(p / 10 ** (snrDb / 10));
    return y.map((v) => v + a * gauss(r));
  },
  hum(y, hz, sr, level) { return y.map((v, i) => v + level * Math.sin(2 * Math.PI * hz * i / sr)); },
  // one-pole low-pass: the standard's soft edge (25 µs rise, 10-90%) is tau = 25/2.2 µs
  lowpass1(y, fc, sr) { const a = 1 - Math.exp(-2 * Math.PI * fc / sr); let z = 0; return y.map((v) => (z += a * (v - z))); },
  // biquads (RBJ cookbook)
  biquad(y, b0, b1, b2, a1, a2) {
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0; const out = new Float32Array(y.length);
    for (let i = 0; i < y.length; i++) { const x = y[i]; const o = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x; y2 = y1; y1 = o; out[i] = o; }
    return out;
  },
  rbj(type, y, f, sr, q = 0.7071, gainDb = 0) {
    const w = 2 * Math.PI * f / sr, c = Math.cos(w), s = Math.sin(w), al = s / (2 * q), A = 10 ** (gainDb / 40);
    let b0, b1, b2, a0, a1, a2;
    if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; a0 = 1 + al; a1 = -2 * c; a2 = 1 - al; }
    if (type === 'peak') { b0 = 1 + al * A; b1 = -2 * c; b2 = 1 - al * A; a0 = 1 + al / A; a1 = -2 * c; a2 = 1 - al / A; }
    return fx.biquad(y, b0 / a0, b1 / a0, b2 / a0, a1 / a0, a2 / a0);
  },
  // a crude broadcast compressor: fast attack, slow release, 10:1 above -20 dBFS, then make-up
  compress(y, sr) {
    let env = 0; const at = Math.exp(-1 / (0.0005 * sr)), rel = Math.exp(-1 / (0.2 * sr)), th = 0.1;
    return y.map((v) => { const a = Math.abs(v); env = a > env ? at * env + (1 - at) * a : rel * env + (1 - rel) * a;
      const g = env > th ? (th + (env - th) / 10) / env : 1; return v * g * 3; });
  },
  dropout(y, sr, at, len) { const o = Float32Array.from(y); o.fill(0, Math.round(at * sr), Math.round((at + len) * sr)); return o; },
  reverse(y) { return Float32Array.from(y).reverse(); },
  // linear-interpolation resampler: plays y as if its clock were `ratio` times faster
  resample(y, ratio) { const n = Math.floor((y.length - 1) / ratio); const o = new Float32Array(n);
    for (let i = 0; i < n; i++) { const t = i * ratio, k = Math.floor(t), u = t - k; o[i] = y[k] * (1 - u) + y[k + 1] * u; } return o; },
  // through a real lossy codec (lame), and back
  mp3(y, sr, kbps) {
    const tmp = fs.mkdtempSync(path.join(FILES, '.mp3-'));
    const a = path.join(tmp, 'a.wav'), b = path.join(tmp, 'a.mp3'), c = path.join(tmp, 'b.wav');
    writeWav(a, y, sr);
    execFileSync('lame', ['--quiet', '-b', String(kbps), a, b]);
    execFileSync('lame', ['--quiet', '--decode', b, c]);
    const out = readWav(c).y; fs.rmSync(tmp, { recursive: true }); return out;
  },
};
const softEdges = (y, sr) => fx.lowpass1(y, 2.2 / (2 * Math.PI * 25e-6), sr);
const concat = (...ys) => { const n = ys.reduce((a, y) => a + y.length, 0); const o = new Float32Array(n); let k = 0; for (const y of ys) { o.set(y, k); k += y.length; } return o; };

// ---------- WAV ----------
function writeWav(file, y, sr) {
  const n = y.length, b = Buffer.alloc(44 + n * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVE', 8); b.write('fmt ', 12);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(sr, 24);
  b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, y[i])) * 32767), 44 + i * 2);
  fs.writeFileSync(file, b);
}
function readWav(file) {
  const b = fs.readFileSync(file); let p = 12, sr = 0, ch = 1, bits = 16, data = null;
  while (p < b.length - 8) { const id = b.toString('ascii', p, p + 4), len = b.readUInt32LE(p + 4);
    if (id === 'fmt ') { ch = b.readUInt16LE(p + 10); sr = b.readUInt32LE(p + 12); bits = b.readUInt16LE(p + 22); }
    if (id === 'data') data = b.subarray(p + 8, p + 8 + len);
    p += 8 + len + (len & 1); }
  const n = data.length / (2 * ch), y = new Float32Array(n);
  for (let i = 0; i < n; i++) y[i] = data.readInt16LE(i * 2 * ch) / 32768;
  return { y, sr };
}

// ---------- the reader under test, and its score ----------
function read(y, sr) { return L.decode(L.newDecoder(sr), y); }
function score(out, key, wantRate) {
  const set = new Set(key); let right = 0, wrong = 0; const seen = new Set();
  for (const tc of out) { const t = L.text(tc); if (set.has(t)) { right++; seen.add(t); } else wrong++; }
  // the rate is judged once it has settled: the name on the last frame read. How many frames it
  // took to settle is reported apart (23.976 and 24 differ by one part in a thousand).
  const last = out.length ? out[out.length - 1].rate || '?' : '';
  let settle = out.length; for (let i = out.length - 1; i >= 0 && (out[i].rate || '?') === last; i--) settle = i;
  return { expected: key.length, right, wrong, missed: key.length - seen.size, rate: last, settleFrames: settle, rateOk: wantRate ? last === wantRate : null };
}
// a frame is lost at the start (the reader needs 80 bits before the first sync) and one at the end
// (cut mid-frame), so "passed" allows three missing frames (a careful reader may spend one more confirming) and no wrong ones.
const passed = (s, slack = 3) => s.wrong === 0 && s.missed <= slack;

// ---------- the gauntlet ----------
const SR = 48000;
function cases() {
  const c = [];
  const add = (name, why, make, opts = {}) => c.push({ name, why, make, ...opts });
  const base = (rate = '30', start = '01:00:00:00', secs = 4, sr = SR, speed = 1) => render(rate, sr, start, secs, speed);
  add('00-clean-30', 'the control: clean 30 fps, soft 25 µs edges', () => { const r = base(); r.y = softEdges(r.y, SR); return r; }, { wantRate: '30' });
  add('01-clean-23976', 'clean 23.976: must be told apart from 24 by measuring, one part in 1000', () => base('23.976'), { wantRate: '23.976' });
  add('02-drop-minute', '29.97 drop across 00:00:59;20 → 00:01:00;02: the skipped numbers must not appear', () => base('29.97 drop', '00:00:59:20', 2), { wantRate: '29.97 drop' });
  add('03-drop-tenth', '29.97 drop across the tenth minute: 00:09:59;29 → 00:10:00;00, nothing skipped', () => base('29.97 drop', '00:09:59:20', 2), { wantRate: '29.97 drop' });
  add('04-inverted', 'polarity flipped by a miswired cable: the level carries nothing', () => { const r = base(); r.y = fx.invert(softEdges(r.y, SR)); return r; }, { wantRate: '30' });
  add('05-quiet', '-46 dBFS, barely there, no noise: louder is not better', () => { const r = base(); r.y = fx.gain(softEdges(r.y, SR), 0.01); return r; }, { wantRate: '30' });
  add('06-hot-clipped', '+24 dB into a hard clip: a square wave hardly minds', () => { const r = base(); r.y = fx.clip(fx.gain(softEdges(r.y, SR), 16), 0.99); return r; }, { wantRate: '30' });
  add('07-noise-20dB', 'white noise 20 dB down', () => { const r = base(); r.y = fx.noise(softEdges(r.y, SR), 20, 7); return r; }, { wantRate: '30' });
  add('08-noise-6dB', 'white noise only 6 dB down: a bad line', () => { const r = base(); r.y = fx.noise(softEdges(r.y, SR), 6, 8); return r; }, { wantRate: '30' });
  add('09-hum', 'mains hum at 60 Hz, as loud as the code itself', () => { const r = base(); r.y = fx.hum(softEdges(r.y, SR), 60, SR, 0.5); return r; }, { wantRate: '30' });
  add('10-dc-offset', 'a DC offset of 40% of the level: every crossing moves', () => { const r = base(); r.y = fx.dc(softEdges(r.y, SR), 0.2); return r; }, { wantRate: '30' });
  add('11-highpass-300', 'a 300 Hz high-pass (a phone line, a vocal channel\'s low cut): the flat tops sag', () => { const r = base('24'); r.y = fx.rbj('hp', softEdges(r.y, SR), 300, SR); return r; }, { wantRate: '24' });
  add('12-lowpass-3k', 'a 3 kHz low-pass at 30 fps (a cheap codec, a long cable): the edges smear into each other', () => { const r = base(); r.y = fx.rbj('lp', r.y, 3000, SR); return r; }, { wantRate: '30' });
  add('13-eq-peak', 'someone thought it was music: +12 dB at 2 kHz, Q 2', () => { const r = base(); r.y = fx.clip(fx.rbj('peak', softEdges(r.y, SR), 2000, SR, 2, 12), 0.99); return r; }, { wantRate: '30' });
  add('14-compressor', 'a broadcast compressor, 10:1 with make-up gain', () => { const r = base(); r.y = fx.compress(softEdges(r.y, SR), SR); return r; }, { wantRate: '30' });
  add('15-mp3-128', 'round trip through MP3 at 128 kbps, 44.1 kHz', () => { const r = base('25', '10:00:00:00', 4, 44100); r.y = fx.mp3(softEdges(r.y, 44100), 44100, 128); return r; }, { wantRate: '25' });
  add('16-mp3-32', 'round trip through MP3 at 32 kbps: the codec gives up on high frequencies', () => { const r = base('25', '10:00:00:00', 4, 44100); r.y = fx.mp3(softEdges(r.y, 44100), 44100, 32); return r; }, { wantRate: '25' });
  add('17-44k1', '30 fps at 44.1 kHz: a bit is 18.375 samples, never a whole number', () => { const r = base('30', '01:00:00:00', 4, 44100); r.y = softEdges(r.y, 44100); return r; }, { wantRate: '30' });
  add('18-8k', '30 fps at 8 kHz: a half bit is 1.67 samples', () => base('30', '01:00:00:00', 4, 8000), { wantRate: '30' });
  add('19-wrong-clock', 'rendered at 48 kHz, played by a card running at 44.1: 8.1% slow, every pitch drops', () => { const r = base(); r.y = fx.resample(softEdges(r.y, SR), 44100 / 48000); return r; }, { wantRate: null, note: 'reads at the wrong speed by design: its rate should NOT name 30' });
  add('20-varispeed-half', 'tape at half speed', () => { const r = base('25', '02:00:00:00', 6, SR, 0.5); r.y = softEdges(r.y, SR); return r; });
  add('21-varispeed-x4', 'shuttle at 4×', () => { const r = base('25', '02:00:00:00', 2, SR, 4); r.y = softEdges(r.y, SR); return r; });
  add('22-tape-stop', 'the tape slows from 1× to 0.2× and keeps reading', () => {
    const rate = L.RATES['25']; const e = L.newEncoder(rate, SR, L.toFrames(L.parse('02:00:00:00'), rate)); const n = 5 * SR, y = new Float32Array(n); const frames = new Set();
    for (let i = 0; i < n; i++) { e.speed = 1 - 0.8 * (i / n); frames.add(e.frame); y[i] = 0.5 * L.encodeSample(e); }
    return { y: softEdges(y, SR), key: [...frames].map((f) => L.text(L.fromFrames(f, rate))), sr: SR };
  });
  add('23-reverse', 'played backward: GoButton\'s reader is forward-only, so this is the room\'s open door', () => { const r = base(); r.y = fx.reverse(softEdges(r.y, SR)); return r; }, { expectFail: true });
  add('24-dropout', '200 ms of silence in the middle: the reader must lose lock and find it again', () => { const r = base('30', '01:00:00:00', 4); r.y = fx.dropout(softEdges(r.y, SR), SR, 2, 0.2); return r; }, { wantRate: "30", slack: 12, note: "6 frames are silent and 1 is cut on each side of the gap; with the start and the end, 10 no reader can read. A careful reader spends one more confirming at the start and one after the gap: 12" });
  add('25-rate-change', '25 fps, then a cut to 29.97 drop: one reader, no setting, must follow', () => {
    const a = base('25', '05:00:00:00', 2), b = base('29.97 drop', '05:10:00:00', 2);
    return { y: softEdges(concat(a.y, b.y), SR), key: [...a.key, ...b.key], sr: SR };
  }, { slack: 5 });
  return c;
}

function make() {
  fs.mkdirSync(FILES, { recursive: true });
  const index = [];
  for (const k of cases()) {
    const r = k.make(); const sr = r.sr || SR;
    writeWav(path.join(FILES, k.name + '.wav'), r.y, sr);
    index.push({ name: k.name, why: k.why, sampleRate: sr, seconds: +(r.y.length / sr).toFixed(3), wantRate: k.wantRate ?? null, expectFail: !!k.expectFail, slack: k.slack ?? 3, note: k.note || '', key: r.key });
  }
  fs.writeFileSync(path.join(FILES, 'answers.json'), JSON.stringify(index, null, 1));
  console.log(`made ${index.length} hostile files in ${path.relative(process.cwd(), FILES)}/`);
}

// run any reader, given as a module exporting read(samples, sampleRate) -> [{h,m,s,f,rate?}], against the files
async function run(readerPath) {
  const reader = readerPath ? (await import(path.resolve(readerPath))).read : read;
  const answers = JSON.parse(fs.readFileSync(path.join(FILES, 'answers.json'), 'utf8'));
  const rows = [];
  for (const a of answers) {
    const { y, sr } = readWav(path.join(FILES, a.name + '.wav'));
    const s = score(reader(y, sr), a.key, a.wantRate);
    const ok = passed(s, a.slack) && (s.rateOk !== false);
    rows.push({ name: a.name, why: a.why, ...s, pass: ok, expectFail: a.expectFail });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${a.name.padEnd(20)} right ${String(s.right).padStart(3)}/${String(s.expected).padEnd(3)} wrong ${String(s.wrong).padStart(2)}  rate ${(s.rate || '-').padEnd(10)} settled after ${s.settleFrames}${a.expectFail ? '   (expected to fail)' : ''}`);
  }
  const p = rows.filter((r) => r.pass).length;
  console.log(`\n${p} of ${rows.length} passed`);
  fs.writeFileSync(path.join(here, readerPath ? 'results-' + path.basename(readerPath, '.mjs') + '.json' : 'results.json'), JSON.stringify(rows, null, 1));
  return rows;
}

// where does it break? each sweep returns [[value, right/expected, wrong]]
async function sweep(readerPath) {
  const reader = readerPath ? (await import(path.resolve(readerPath))).read : read;
  const out = {};
  const trial = (r) => score(reader(r.y, r.sr || SR), r.key, null);
  const row = (v, s) => [v, +(s.right / s.expected).toFixed(3), s.wrong];
  out.noise = [30, 20, 15, 12, 10, 8, 6, 4, 3, 2, 1, 0].map((db) => { const r = render('30', SR, '01:00:00:00', 4); r.y = fx.noise(softEdges(r.y, SR), db, 100 + db); return row(db, trial(r)); });
  out.sampleRate = [4000, 5000, 6000, 7000, 8000, 11025, 16000, 22050, 32000, 44100, 48000, 96000].map((sr) => { const r = render('30', sr, '01:00:00:00', 4); return row(sr, trial(r)); });
  out.lowpass = [12000, 8000, 6000, 5000, 4000, 3000, 2500, 2000, 1500, 1200, 1000].map((fc) => { const r = render('30', SR, '01:00:00:00', 4); r.y = fx.rbj('lp', r.y, fc, SR); return row(fc, trial(r)); });
  out.highpassWithNoise = [20, 100, 300, 600, 1000, 1500, 2000].map((fc) => { const r = render('24', SR, '01:00:00:00', 4); r.y = fx.noise(fx.rbj('hp', softEdges(r.y, SR), fc, SR), 20, 300 + fc); return row(fc, trial(r)); });
  out.dc = [0, 0.1, 0.2, 0.3, 0.35, 0.4, 0.45, 0.48].map((off) => { const r = render('30', SR, '01:00:00:00', 4); r.y = fx.dc(fx.rbj('lp', r.y, 6000, SR), off); return row(off, trial(r)); });
  out.speed = [0.05, 0.1, 0.25, 0.5, 1, 2, 4, 8, 10, 12, 16].map((sp) => { const r = render('25', SR, '02:00:00:00', Math.max(0.6, 2 / sp), sp); return row(sp, trial(r)); });
  fs.writeFileSync(path.join(here, readerPath ? 'sweeps-' + path.basename(readerPath, '.mjs') + '.json' : 'sweeps.json'), JSON.stringify(out, null, 1));
  for (const [k, rows] of Object.entries(out)) console.log(k.padEnd(18), rows.map(([v, f, w]) => `${v}:${Math.round(f * 100)}%${w ? '/' + w + 'x' : ''}`).join('  '));
}

const cmd = process.argv[2];
if (cmd === 'make') make();
else if (cmd === 'run') await run(process.argv[3]);
else if (cmd === 'sweep') await sweep(process.argv[3]);
else console.log('node gauntlet.mjs make | run [reader.mjs] | sweep');
