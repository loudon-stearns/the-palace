/* =====================================================================
 *  WAVETABLE PACKER — the browser port of pack_wavetable.py
 *  (Projects/Generative Wavetable Libraries/akwf-import-pipeline/).
 *
 *  A folder of single-cycle WAVs in, one morphable table out:
 *    1. parse each WAV ourselves (NOT decodeAudioData: that resamples the
 *       file to the AudioContext rate, so a 600-sample AKWF cycle decoded at
 *       48 kHz comes back 653 samples long and is no longer one cycle);
 *    2. resample each cycle to FRAME samples in the spectrum. The Python
 *       script tiles three copies through a FIR filter and keeps the middle
 *       one, so the filter never sees an edge; a cycle's own DFT is already
 *       perfectly periodic, so here the trick is not needed;
 *    3. score brightness with the same magnitude-weighted spectral centroid;
 *    4. sort dull → bright (stable, file-name order breaks ties), or keep
 *       the folder's own order;
 *    5. normalise jointly to 0.99 so the morph is timbre, not a level ride.
 *
 *  Plain script: in the page it defines window.WTPacker; in node it exports.
 * ===================================================================== */
(function (root) {
  'use strict';
  const OUTPUT_SR = 44100;
  const MAX_FILENAME_CHARS = 200;

  /* ---------- WAV in: PCM 8/16/24/32, float 32/64, extensible ---------- */
  function parseWav(arrayBuffer) {
    const dv = new DataView(arrayBuffer);
    const tag = o => String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));
    if (dv.byteLength < 12 || tag(0) !== 'RIFF' || tag(8) !== 'WAVE') throw new Error('not a RIFF/WAVE file');
    let fmt = null, dataOff = -1, dataLen = 0, o = 12;
    while (o + 8 <= dv.byteLength) {
      const id = tag(o), len = dv.getUint32(o + 4, true), body = o + 8;
      if (id === 'fmt ') {
        let format = dv.getUint16(body, true);
        const channels = dv.getUint16(body + 2, true);
        const sampleRate = dv.getUint32(body + 4, true);
        const bits = dv.getUint16(body + 14, true);
        if (format === 0xFFFE && len >= 26) format = dv.getUint16(body + 24, true); // extensible: sub-format GUID's first two bytes
        fmt = { format, channels, sampleRate, bits };
      } else if (id === 'data') {
        dataOff = body; dataLen = Math.min(len, dv.byteLength - body);
      }
      o = body + len + (len & 1);   // chunks are word-aligned
    }
    if (!fmt) throw new Error('no fmt chunk');
    if (dataOff < 0) throw new Error('no data chunk');
    const { format, channels, bits } = fmt;
    const bps = bits / 8, n = Math.floor(dataLen / (bps * channels));
    const read = (format === 3)
      ? (bits === 32 ? p => dv.getFloat32(p, true) : bits === 64 ? p => dv.getFloat64(p, true) : null)
      : (format === 1)
        ? (bits === 8 ? p => (dv.getUint8(p) - 128) / 128
          : bits === 16 ? p => dv.getInt16(p, true) / 32768
          : bits === 24 ? p => { const v = dv.getUint8(p) | (dv.getUint8(p + 1) << 8) | (dv.getInt8(p + 2) << 16); return v / 8388608; }
          : bits === 32 ? p => dv.getInt32(p, true) / 2147483648 : null)
        : null;
    if (!read) throw new Error(`unsupported WAV encoding (format ${format}, ${bits}-bit)`);
    // Collapse to mono by averaging channels, as the Python script does.
    const mono = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      let s = 0;
      for (let c = 0; c < channels; c++) s += read(dataOff + (i * channels + c) * bps);
      mono[i] = s / channels;
    }
    return { sampleRate: fmt.sampleRate, channels, bits, format, samples: mono };
  }

  /* ---------- radix-2 FFT (in place) for the FRAME-length side ---------- */
  function fft(re, im, inverse) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) {
      let bit = n >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
    }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = (inverse ? 2 : -2) * Math.PI / len;
      const wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const a = i + k, b = a + len / 2;
          const xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
          const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
        }
      }
    }
  }
  const isPow2 = n => n > 0 && (n & (n - 1)) === 0;

  /* Harmonics 0..K of one cycle of any length N (direct DFT: N is often 600). */
  function harmonics(x, K) {
    const N = x.length, re = new Float64Array(K + 1), im = new Float64Array(K + 1);
    if (isPow2(N)) {
      const r = Float64Array.from(x), i = new Float64Array(N);
      fft(r, i, false);
      for (let k = 0; k <= K; k++) { re[k] = r[k]; im[k] = i[k]; }
      return { re, im };
    }
    const c = new Float64Array(N), s = new Float64Array(N);
    for (let t = 0; t < N; t++) { c[t] = Math.cos(2 * Math.PI * t / N); s[t] = Math.sin(2 * Math.PI * t / N); }
    for (let k = 0; k <= K; k++) {
      let a = 0, b = 0, idx = 0;
      for (let t = 0; t < N; t++) { a += x[t] * c[idx]; b -= x[t] * s[idx]; idx += k; if (idx >= N) idx -= N; }
      re[k] = a; im[k] = b;
    }
    return { re, im };
  }

  /* Resample one cycle to L samples (L a power of two) in the spectrum.
   * Keeps every harmonic both lengths can hold; a source Nyquist bin (even N,
   * upsampling) is a pure cosine and is carried at half weight on each side,
   * as scipy.signal.resample does. The target's own Nyquist bin is left empty. */
  function resampleCycle(x, L) {
    const N = x.length;
    if (N === L) return Float32Array.from(x);
    const K = Math.min(Math.floor((N - 1) / 2), L / 2 - 1);
    const h = harmonics(x, Math.min(Math.floor(N / 2), L / 2 - 1));
    const re = new Float64Array(L), im = new Float64Array(L), g = L / N;
    for (let k = 0; k <= K; k++) {
      re[k] = h.re[k] * g; im[k] = h.im[k] * g;
      if (k > 0) { re[L - k] = re[k]; im[L - k] = -im[k]; }
    }
    if (N % 2 === 0 && N / 2 < L / 2) {           // source Nyquist, upsampling
      const k = N / 2;
      re[k] = h.re[k] * g / 2; re[L - k] = re[k];
    }
    fft(re, im, true);
    const out = new Float32Array(L);
    for (let i = 0; i < L; i++) out[i] = re[i] / L;
    return out;
  }

  /* Same formula as the Python: sum(freq·|X|) / sum(|X|), DC removed. */
  function spectralCentroid(cycle, sampleRate) {
    const n = cycle.length;
    let mean = 0; for (let i = 0; i < n; i++) mean += cycle[i]; mean /= n;
    const re = new Float64Array(n), im = new Float64Array(n);
    for (let i = 0; i < n; i++) re[i] = cycle[i] - mean;
    fft(re, im, false);
    let num = 0, den = 0;
    for (let k = 0; k <= n / 2; k++) {
      const m = Math.hypot(re[k], im[k]);
      num += (k * sampleRate / n) * m; den += m;
    }
    return den === 0 ? 0 : num / den;
  }

  const stemOf = name => name.replace(/^.*[\\/]/, '').replace(/\.[^.]*$/, '');
  // Python's sorted() on paths: plain code-point order.
  const byName = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

  /* files: [{ name, buffer: ArrayBuffer }]  →  the packed table.
   * opts: { frameLen = 1024, order: 'centroid' | 'file', maxFrames = 256 } */
  function packCycles(files, opts) {
    const L = (opts && opts.frameLen) || 1024;
    const order = (opts && opts.order) || 'centroid';
    const maxFrames = (opts && opts.maxFrames) || 256;
    const skipped = [];
    const records = [];
    files.filter(f => /\.wav$/i.test(f.name)).sort(byName).forEach(f => {
      try {
        const w = parseWav(f.buffer);
        if (w.samples.length < 8) throw new Error('too short to be a cycle');
        const cycle = resampleCycle(w.samples, L);
        records.push({ stem: stemOf(f.name), cycle, centroid: spectralCentroid(cycle, OUTPUT_SR), srcLen: w.samples.length });
      } catch (e) { skipped.push({ name: f.name, why: e.message }); }
    });
    if (!records.length) throw new Error('no readable .wav cycles');
    let ordered = records.slice();
    if (order === 'centroid') ordered.sort((a, b) => a.centroid - b.centroid);  // Array.sort is stable
    let thinned = 0;
    if (ordered.length > maxFrames) {                  // keep an even spread along the order
      const keep = [];
      for (let i = 0; i < maxFrames; i++) keep.push(ordered[Math.round(i * (ordered.length - 1) / (maxFrames - 1))]);
      thinned = ordered.length - maxFrames; ordered = keep;
    }
    const F = ordered.length, samples = new Float32Array(F * L);
    ordered.forEach((r, i) => samples.set(r.cycle, i * L));
    let peak = 0; for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
    if (peak > 0) { const k = 0.99 / peak; for (let i = 0; i < samples.length; i++) samples[i] *= k; }
    const stems = ordered.map(r => r.stem);
    let joined = stems.join('_');
    if (joined.length > MAX_FILENAME_CHARS) joined = joined.slice(0, MAX_FILENAME_CHARS) + `__${F}frames`;
    return {
      frames: F, frameLen: L, samples, order,
      frameNames: stems, centroids: ordered.map(r => r.centroid), srcLens: ordered.map(r => r.srcLen),
      skipped, thinned, fileName: joined + '.wav',
    };
  }

  /* WAV out: 32-bit float mono at 44.1 kHz, as the Python writes it. */
  function encodeWavFloat32(samples, sampleRate) {
    const sr = sampleRate || OUTPUT_SR, n = samples.length;
    const buf = new ArrayBuffer(44 + n * 4), dv = new DataView(buf);
    const put = (o, s) => { for (let i = 0; i < 4; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    put(0, 'RIFF'); dv.setUint32(4, 36 + n * 4, true); put(8, 'WAVE');
    put(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 3, true); dv.setUint16(22, 1, true);
    dv.setUint32(24, sr, true); dv.setUint32(28, sr * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 32, true);
    put(36, 'data'); dv.setUint32(40, n * 4, true);
    for (let i = 0; i < n; i++) dv.setFloat32(44 + i * 4, samples[i], true);
    return buf;
  }

  const api = { parseWav, resampleCycle, spectralCentroid, packCycles, encodeWavFloat32, OUTPUT_SR };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.WTPacker = api;
})(typeof window !== 'undefined' ? window : globalThis);
