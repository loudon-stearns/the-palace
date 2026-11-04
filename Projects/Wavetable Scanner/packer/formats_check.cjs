// node formats_check.cjs — proves formats.js: Serum layout against the factory file,
// round trips through every format, Surge's own tables read in, and writes the
// FM and organ family chains out for Serum, Vital, Surge and Ableton.
const fs = require('fs'), path = require('path'), os = require('os');
const P = require('./packer.js'), W = require('./formats.js');
const ab = b => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
const rep = { checks: [] }, ok = (pass, what, extra) => { rep.checks.push({ pass, what, ...extra }); console.log((pass ? 'PASS ' : 'FAIL ') + what + (extra ? ' ' + JSON.stringify(extra) : '')); };
const errDb = (a, b) => { let e = 0, s = 0; for (let i = 0; i < a.length; i++) { e += (a[i] - b[i]) ** 2; s += a[i] ** 2; } return +(10 * Math.log10(e / s + 1e-30)).toFixed(1); };

// 1. Serum's factory table, re-encoded, must come back byte for byte.
const ref = fs.readFileSync(path.join(__dirname, '../../Generative Wavetable Libraries/_reference/Basic Shapes.wav'));
// Read the floats straight from the data chunk: parseWav's channel average turns −0 into +0.
const dOff = ref.indexOf('data') + 8, F = (ref.length - dOff) / 4 / 2048, frames = [];
for (let i = 0; i < F; i++) frames.push(new Float32Array(ab(ref.subarray(dOff + i * 8192, dOff + (i + 1) * 8192))));
const re = Buffer.from(W.encodeClm(frames));
ok(re.equals(ref), "Serum's Basic Shapes.wav re-encoded is byte for byte the factory file", { bytes: ref.length, frames: F });
const back = W.readTable(ab(ref));
ok(back.frames === F && back.frameSize === 2048, 'a Serum table reads in as its own frames, not split in half', { frames: back.frames, source: back.source });

// 2. Pack two folders, export every format, read each back.
const AK = path.join(os.homedir(), 'Desktop/AKWF');
for (const folder of ['AKWF_fmsynth', 'AKWF_eorgan']) {
  const dir = path.join(AK, folder);
  const files = fs.readdirSync(dir).filter(n => /\.wav$/i.test(n)).map(n => ({ name: n, buffer: ab(fs.readFileSync(path.join(dir, n))) }));
  const t = P.packCycles(files, { order: 'chain' });
  const stem = folder.toLowerCase() + '_family_chain';
  for (const kind of ['serum', 'surge', 'ableton']) {
    const x = W.exportTable(t.samples, kind, stem);
    fs.writeFileSync(path.join(__dirname, 'exports', x.fileName), Buffer.from(x.buffer));
    const r = W.readTable(x.buffer);
    const idx = W.thinIndex(t.frames, W.FORMATS[kind].max), orig = new Float32Array(idx.length * 1024);
    idx.forEach((k, j) => orig.set(t.samples.subarray(k * 1024, (k + 1) * 1024), j * 1024));
    const e = errDb(orig, r.samples);
    ok(r.frames === x.frames && e < (kind === 'ableton' ? -80 : -100), `${folder} → ${x.label} → back`, { file: x.fileName, frames: x.frames, thinned: x.thinned, frame: x.frameSize, error_dB: e });
  }
}

// 3. Surge's own factory tables (int16, legacy range) read in.
const SD = '/Library/Application Support/Surge XT/wavetables';
if (fs.existsSync(SD)) {
  for (const f of ['Basic/Triangle.wt', 'Generated/Sawtooth Reso.wt']) {
    const r = W.readTable(ab(fs.readFileSync(path.join(SD, f))));
    let pk = 0; for (const v of r.samples) pk = Math.max(pk, Math.abs(v));
    ok(r.frames > 1 && pk > 0.9 && pk <= 1.0001, `Surge's factory ${f} reads in at full scale`, { frames: r.frames, frameSize: r.frameSize, peak: +pk.toFixed(4) });
  }
}
fs.writeFileSync(path.join(__dirname, 'formats_check.json'), JSON.stringify(rep, null, 1));
