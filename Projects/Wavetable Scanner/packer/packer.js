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
 *  A third order, 'chain', ports the family chain Loudon picked for
 *  Generative Wavetable Libraries on 2026-10-14 (akwf-scale-up-fmsynth/
 *  scale_up.py): k-means families over a loudness-free log spectrum of
 *  harmonics 1-64, k picked by silhouette, darkest family first, each walked
 *  smoothly inside (nearest neighbour + 2-opt), every frame rotated into line
 *  with the one before it. `smooth` (sigma, in frames) is the one-frame
 *  Gaussian along Position from loop-smoothing/ (2026-10-28) that took the
 *  sweep buzz down 10-18 dB; it waits on Loudon's ears, so it is off by default.
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


  /* ---------- the family chain ---------- */
  const N_HARM = 64;
  function rfftMags(cycle) {            // |X[k]|, k = 0..L/2, for a power-of-two cycle
    const L = cycle.length, re = Float64Array.from(cycle), im = new Float64Array(L);
    fft(re, im, false);
    return { re, im };
  }
  /* What a frame sounds like, not how loud: log of L2-normalised harmonics 1..64, floor −60 dB. */
  function timbreFeatures(cycle) {
    const { re, im } = rfftMags(cycle), m = new Float64Array(N_HARM);
    let nrm = 0;
    for (let k = 1; k <= N_HARM; k++) { m[k - 1] = Math.hypot(re[k], im[k]); nrm += m[k - 1] ** 2; }
    nrm = Math.sqrt(nrm) + 1e-12;
    for (let k = 0; k < N_HARM; k++) m[k] = 20 * Math.log10(m[k] / nrm + 1e-3);
    return m;
  }
  function pairwise(X) {
    const n = X.length, D = Array.from({ length: n }, () => new Float64Array(n));
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
      let s = 0; const a = X[i], b = X[j];
      for (let k = 0; k < a.length; k++) s += (a[k] - b[k]) ** 2;
      D[i][j] = D[j][i] = Math.sqrt(s);
    }
    return D;
  }
  /* Nearest-neighbour tour from `start` over the index set `idx`, then 2-opt on the open path. */
  function walkOrder(D, idx, start) {
    const n = idx.length;
    if (n <= 2) { const o = idx.slice(); if (o[0] !== start) o.reverse(); return o; }
    const order = [start], seen = new Set([start]);
    while (order.length < n) {
      const last = order[order.length - 1];
      let best = -1, bd = Infinity;
      for (const j of idx) if (!seen.has(j) && D[last][j] < bd) { bd = D[last][j]; best = j; }
      order.push(best); seen.add(best);
    }
    let improved = true;
    while (improved) {
      improved = false;
      for (let i = 1; i < n - 1; i++) for (let j = i + 1; j < n; j++) {
        const a = order[i - 1], b = order[i], c = order[j], d = j + 1 < n ? order[j + 1] : -1;
        const old = D[a][b] + (d >= 0 ? D[c][d] : 0), nu = D[a][c] + (d >= 0 ? D[b][d] : 0);
        if (nu < old - 1e-9) {
          for (let x = i, y = j; x < y; x++, y--) { const t = order[x]; order[x] = order[y]; order[y] = t; }
          improved = true;
        }
      }
    }
    return order;
  }
  function mulberry32(a) {              // seeded, so the same folder always packs the same way
    return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  const sqd = (a, b) => { let s = 0; for (let k = 0; k < a.length; k++) s += (a[k] - b[k]) ** 2; return s; };
  function kmeans(X, k, rng, restarts = 24, iters = 100) {
    const n = X.length, dim = X[0].length;
    let best = { inertia: Infinity, lab: null };
    for (let r = 0; r < restarts; r++) {
      let cent = [Float64Array.from(X[Math.floor(rng() * n)])];
      while (cent.length < k) {          // k-means++ seeding
        const d2 = X.map(x => Math.min(...cent.map(c => sqd(x, c))));
        let tot = d2.reduce((a, b) => a + b, 0), u = rng() * tot, pick = n - 1;
        for (let i = 0; i < n; i++) { u -= d2[i]; if (u <= 0) { pick = i; break; } }
        cent.push(Float64Array.from(X[pick]));
      }
      let lab = new Int32Array(n);
      for (let it = 0; it < iters; it++) {
        for (let i = 0; i < n; i++) { let bi = 0, bd = Infinity; for (let c = 0; c < k; c++) { const d = sqd(X[i], cent[c]); if (d < bd) { bd = d; bi = c; } } lab[i] = bi; }
        const nu = cent.map(c => new Float64Array(dim)), cnt = new Int32Array(k);
        for (let i = 0; i < n; i++) { cnt[lab[i]]++; const v = nu[lab[i]]; for (let d = 0; d < dim; d++) v[d] += X[i][d]; }
        let moved = false;
        for (let c = 0; c < k; c++) {
          if (!cnt[c]) { nu[c] = cent[c]; continue; }
          for (let d = 0; d < dim; d++) nu[c][d] /= cnt[c];
          if (sqd(nu[c], cent[c]) > 1e-12) moved = true;
        }
        cent = nu;
        if (!moved) break;
      }
      let inertia = 0; for (let i = 0; i < n; i++) inertia += sqd(X[i], cent[lab[i]]);
      if (inertia < best.inertia) best = { inertia, lab };
    }
    return best.lab;
  }
  function silhouette(D, lab) {
    const n = lab.length, ks = [...new Set(lab)];
    let tot = 0;
    for (let i = 0; i < n; i++) {
      const sum = {}, cnt = {};
      for (let j = 0; j < n; j++) { sum[lab[j]] = (sum[lab[j]] || 0) + D[i][j]; cnt[lab[j]] = (cnt[lab[j]] || 0) + 1; }
      if (cnt[lab[i]] <= 1) continue;
      const a = sum[lab[i]] / (cnt[lab[i]] - 1);
      const b = Math.min(...ks.filter(c => c !== lab[i]).map(c => sum[c] / cnt[c]));
      tot += (b - a) / Math.max(a, b);
    }
    return tot / n;
  }
  /* A plain-word name for a family, from what its spectra measure (same thresholds as describe()). */
  function describeFamily(cycles) {
    const p = new Float64Array(N_HARM);
    for (const c of cycles) { const { re, im } = rfftMags(c); for (let k = 1; k <= N_HARM; k++) p[k - 1] += Math.hypot(re[k], im[k]) / cycles.length; }
    let e = 0; for (let k = 0; k < N_HARM; k++) { p[k] = p[k] ** 2; e += p[k]; }
    let cent = 0, odd = 0; for (let k = 0; k < N_HARM; k++) { p[k] /= e; cent += p[k] * (k + 1); if (k % 2 === 0) odd += p[k]; }
    const tone = p[0] > 0.6 ? 'round' : cent < 4 ? 'warm' : cent < 9 ? 'bright' : 'glassy';
    const shape = odd > 0.8 ? 'hollow' : odd < 0.35 ? 'nasal' : 'full';
    return `${tone}-${shape}`;
  }
  /* Families end to end, darkest first, each walked smoothly inside; the next
   * family is entered at the member closest to where the last one ended. */
  function familyChain(cycles, centroids) {
    const n = cycles.length, all = [...Array(n).keys()];
    const X = cycles.map(timbreFeatures), D = pairwise(X);
    const darkest = idx => idx.reduce((a, b) => (centroids[b] < centroids[a] ? b : a));
    if (n < 6) return { order: walkOrder(D, all, darkest(all)), family: new Int32Array(n), names: ['one family'], k: 1, silhouette: null, D };
    const rng = mulberry32(16);
    let best = null;
    for (let k = 3; k <= Math.min(8, n - 2); k++) {
      const lab = kmeans(X, k, rng), sil = silhouette(D, lab);
      if (!best || sil > best.sil) best = { k, lab, sil };
    }
    const groups = [];
    for (let c = 0; c < best.k; c++) {
      const idx = all.filter(i => best.lab[i] === c);
      if (idx.length) groups.push({ idx, mean: idx.reduce((s, i) => s + centroids[i], 0) / idx.length });
    }
    groups.sort((a, b) => a.mean - b.mean);
    const order = [], family = new Int32Array(n), names = [], seen = {};
    groups.forEach((g, r) => {
      const start = order.length ? g.idx.reduce((a, b) => (D[order[order.length - 1]][b] < D[order[order.length - 1]][a] ? b : a)) : darkest(g.idx);
      order.push(...walkOrder(D, g.idx, start));
      g.idx.forEach(i => { family[i] = r; });
      const nm = describeFamily(g.idx.map(i => cycles[i]));
      seen[nm] = (seen[nm] || 0) + 1;
      names.push(seen[nm] === 1 ? nm : `${nm}-${seen[nm]}`);
    });
    return { order, family, names, k: groups.length, silhouette: best.sil, D };
  }
  /* Rotate each frame circularly to best match the one before it. A held note
   * hears no difference; the crossfade between two frames does — misaligned
   * neighbours cancel in the middle of the morph. */
  function alignRotations(frames) {
    const L = frames[0].length, out = [frames[0]];
    for (let f = 1; f < frames.length; f++) {
      const a = rfftMags(out[f - 1]), b = rfftMags(frames[f]);
      const re = new Float64Array(L), im = new Float64Array(L);
      for (let k = 0; k < L; k++) { re[k] = a.re[k] * b.re[k] + a.im[k] * b.im[k]; im[k] = a.im[k] * b.re[k] - a.re[k] * b.im[k]; }
      fft(re, im, true);
      let lag = 0; for (let i = 1; i < L; i++) if (re[i] > re[lag]) lag = i;
      const src = frames[f], r = new Float32Array(L);
      for (let i = 0; i < L; i++) r[(i + lag) % L] = src[i];
      out.push(r);
    }
    return out;
  }
  /* A Gaussian across neighbouring frames, sigma in frames, ends held; DC removed after. */
  function blurFrames(frames, sigma) {
    if (!(sigma > 0)) return frames;
    const R = Math.ceil(3 * sigma), w = [];
    let ws = 0; for (let j = -R; j <= R; j++) { const v = Math.exp(-0.5 * (j / sigma) ** 2); w.push(v); ws += v; }
    const F = frames.length, L = frames[0].length;
    return frames.map((_, f) => {
      const o = new Float32Array(L);
      for (let j = -R; j <= R; j++) { const src = frames[Math.max(0, Math.min(F - 1, f + j))], g = w[j + R] / ws; for (let i = 0; i < L; i++) o[i] += g * src[i]; }
      let m = 0; for (let i = 0; i < L; i++) m += o[i]; m /= L; for (let i = 0; i < L; i++) o[i] -= m;
      return o;
    });
  }

  const stemOf = name => name.replace(/^.*[\\/]/, '').replace(/\.[^.]*$/, '');
  // Python's sorted() on paths: plain code-point order.
  const byName = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

  /* files: [{ name, buffer: ArrayBuffer }]  →  the packed table.
   * opts: { frameLen = 1024, order: 'centroid' | 'file' | 'chain', maxFrames = 256,
   *         smooth = 0 (Gaussian sigma in frames along Position) } */
  function packCycles(files, opts) {
    const L = (opts && opts.frameLen) || 1024;
    const order = (opts && opts.order) || 'centroid';
    const maxFrames = (opts && opts.maxFrames) || 256;
    const smooth = (opts && +opts.smooth) || 0;
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
    let ordered = records.slice(), chain = null;
    if (order === 'centroid') ordered.sort((a, b) => a.centroid - b.centroid);  // Array.sort is stable
    if (order === 'chain') {
      chain = familyChain(records.map(r => r.cycle), records.map(r => r.centroid));
      records.forEach((r, i) => { r.family = chain.family[i]; r.idx = i; });
      ordered = chain.order.map(i => records[i]);
    }
    let thinned = 0;
    if (ordered.length > maxFrames) {                  // keep an even spread along the order
      const keep = [];
      for (let i = 0; i < maxFrames; i++) keep.push(ordered[Math.round(i * (ordered.length - 1) / (maxFrames - 1))]);
      thinned = ordered.length - maxFrames; ordered = keep;
    }
    const F = ordered.length, samples = new Float32Array(F * L);
    // Line the frames up whenever the order is a walk or a blur will mix them.
    let frames = ordered.map(r => r.cycle);
    if (order === 'chain' || smooth > 0) {
      frames = frames.map(c => { let m = 0; for (let i = 0; i < L; i++) m += c[i]; m /= L; return c.map(v => v - m); });
      frames = blurFrames(alignRotations(frames), smooth);
    }
    frames.forEach((c, i) => samples.set(c, i * L));
    let peak = 0; for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
    if (peak > 0) { const k = 0.99 / peak; for (let i = 0; i < samples.length; i++) samples[i] *= k; }
    const stems = ordered.map(r => r.stem);
    let joined = stems.join('_');
    if (joined.length > MAX_FILENAME_CHARS) joined = joined.slice(0, MAX_FILENAME_CHARS) + `__${F}frames`;
    return {
      frames: F, frameLen: L, samples, order,
      frameNames: stems, centroids: ordered.map(r => r.centroid), srcLens: ordered.map(r => r.srcLen),
      skipped, thinned, fileName: joined + (smooth > 0 ? `_smooth${smooth}` : '') + '.wav', smooth,
      families: chain ? { k: chain.k, names: chain.names, silhouette: chain.silhouette, of: ordered.map(r => r.family) } : null,
      steps: chain ? ordered.slice(1).map((r, i) => chain.D[ordered[i].idx][r.idx]) : null,
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

  const api = { parseWav, resampleCycle, spectralCentroid, packCycles, encodeWavFloat32, OUTPUT_SR,
    timbreFeatures, pairwise, walkOrder, familyChain, alignRotations, blurFrames };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.WTPacker = api;
})(typeof window !== 'undefined' ? window : globalThis);
