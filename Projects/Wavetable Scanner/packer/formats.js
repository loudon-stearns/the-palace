/* =====================================================================
 *  formats.js — a packed table out to the synths Loudon uses, and back in.
 *
 *  The page keeps every table as frames of 1024 samples. Each synth wants
 *  its own container:
 *    Serum / Vital  CLM WAV: 2048-sample frames, float32, the 'clm ' chunk,
 *                   laid out byte for byte like Serum's factory 'Basic
 *                   Shapes.wav' (the layout Generative Wavetable Libraries'
 *                   clm_writer.py proved). At most 256 frames.
 *    Surge XT       .wt: 'vawt', wave size, wave count, flags, then the
 *                   waves (Surge's own 'WT fileformat.txt'). Float32, flags
 *                   0, 1024-sample waves, at most 512.
 *    Ableton        plain WAV, 1024-sample frames, 16-bit, as the
 *                   crystal-bravais and shepard tables Loudon heard in Live.
 *  Frames go 1024 → 2048 by the spectrum (resampleCycle), which is exact for
 *  a band-limited cycle: every harmonic the frame holds is kept, nothing new
 *  is made. A table longer than a format allows is thinned evenly, ends kept.
 *
 *  readTable() is the way back in: a CLM WAV, a Surge .wt, or a plain WAV of
 *  1024-sample frames, each returned as 1024-sample frames.
 *
 *  Plain script: in the page it defines window.WTFormats; in node it exports.
 *  Needs WTPacker (packer.js) for parseWav and resampleCycle.
 * ===================================================================== */
(function (root) {
  'use strict';
  const P = (typeof module !== 'undefined' && module.exports) ? require('./packer.js') : root.WTPacker;
  const FRAME = 1024, SR = 44100;
  const FORMATS = {
    serum:   { label: 'Serum / Vital', ext: '_serum.wav',   frame: 2048, max: 256 },
    surge:   { label: 'Surge XT',      ext: '.wt',          frame: 1024, max: 512 },
    ableton: { label: 'Ableton',       ext: '_ableton.wav', frame: 1024, max: 256 },
  };

  /* Evenly chosen frame indices, first and last kept. */
  function thinIndex(F, max) {
    if (F <= max) return Array.from({ length: F }, (_, i) => i);
    return Array.from({ length: max }, (_, i) => Math.round(i * (F - 1) / (max - 1)));
  }

  /* samples (F × 1024, Float32Array) → array of frames at the format's size. */
  function framesFor(samples, fmt) {
    const F = samples.length / FRAME, out = [];
    for (const i of thinIndex(F, fmt.max)) {
      const f = samples.subarray(i * FRAME, (i + 1) * FRAME);
      out.push(fmt.frame === FRAME ? Float32Array.from(f) : P.resampleCycle(f, fmt.frame));
    }
    return out;
  }

  const clip = v => v > 1 ? 1 : v < -1 ? -1 : v;
  function writer(n) {
    const dv = new DataView(new ArrayBuffer(n)); let o = 0;
    return {
      dv, buf: dv.buffer, get o() { return o; },
      tag(s) { for (let i = 0; i < 4; i++) dv.setUint8(o++, s.charCodeAt(i)); },
      ascii(s) { for (let i = 0; i < s.length; i++) dv.setUint8(o++, s.charCodeAt(i)); },
      u32(v) { dv.setUint32(o, v, true); o += 4; }, u16(v) { dv.setUint16(o, v, true); o += 2; },
      f32(v) { dv.setFloat32(o, v, true); o += 4; }, i16(v) { dv.setInt16(o, v, true); o += 2; },
      skip(k) { o += k; },
    };
  }

  /* Serum's layout: RIFF, WAVE, JUNK(28 zero), fmt (float mono 44.1k), clm (48), data. */
  function encodeClm(frames) {
    const L = frames[0].length, n = frames.length * L;
    const clm = `<!>${L} 01000000 wavetable (www.xferrecords.com)`;
    const clmPad = clm.length & 1;
    const size = 12 + (8 + 28) + (8 + 16) + (8 + clm.length + clmPad) + (8 + n * 4);
    const w = writer(size);
    w.tag('RIFF'); w.u32(size - 8); w.tag('WAVE');
    w.tag('JUNK'); w.u32(28); w.skip(28);
    w.tag('fmt '); w.u32(16); w.u16(3); w.u16(1); w.u32(SR); w.u32(SR * 4); w.u16(4); w.u16(32);
    w.tag('clm '); w.u32(clm.length); w.ascii(clm); w.skip(clmPad);
    w.tag('data'); w.u32(n * 4);
    for (const f of frames) for (let i = 0; i < L; i++) w.f32(clip(f[i]));
    return w.buf;
  }

  /* Surge's .wt: float32 waves, flags 0 (not a sample, not int16). */
  function encodeWt(frames) {
    const L = frames[0].length, w = writer(12 + frames.length * L * 4);
    w.tag('vawt'); w.u32(L); w.u16(frames.length); w.u16(0);
    for (const f of frames) for (let i = 0; i < L; i++) w.f32(clip(f[i]));
    return w.buf;
  }

  /* Plain 16-bit mono WAV, as Ableton's Wavetable reads a table. */
  function encodePcm16(frames) {
    const L = frames[0].length, n = frames.length * L, w = writer(44 + n * 2);
    w.tag('RIFF'); w.u32(36 + n * 2); w.tag('WAVE');
    w.tag('fmt '); w.u32(16); w.u16(1); w.u16(1); w.u32(SR); w.u32(SR * 2); w.u16(2); w.u16(16);
    w.tag('data'); w.u32(n * 2);
    for (const f of frames) for (let i = 0; i < L; i++) w.i16(Math.round(clip(f[i]) * 32767));
    return w.buf;
  }

  /* One table → { buffer, fileName, frames, thinned, frameSize, label }. */
  function exportTable(samples, kind, baseName) {
    const fmt = FORMATS[kind]; if (!fmt) throw new Error(`no format '${kind}'`);
    const F = samples.length / FRAME, frames = framesFor(samples, fmt);
    const buffer = kind === 'serum' ? encodeClm(frames) : kind === 'surge' ? encodeWt(frames) : encodePcm16(frames);
    const stem = (baseName || 'wavetable').replace(/\.(wav|wt)$/i, '');
    return { buffer, fileName: stem + fmt.ext, frames: frames.length, thinned: F - frames.length, frameSize: fmt.frame, label: fmt.label };
  }

  /* The 'clm ' chunk's frame size, or 0. */
  function clmFrameSize(buf) {
    const dv = new DataView(buf), tag = o => String.fromCharCode(dv.getUint8(o), dv.getUint8(o + 1), dv.getUint8(o + 2), dv.getUint8(o + 3));
    if (dv.byteLength < 12 || tag(0) !== 'RIFF') return 0;
    for (let o = 12; o + 8 <= dv.byteLength;) {
      const id = tag(o), len = dv.getUint32(o + 4, true);
      if (id === 'clm ') {
        let s = ''; for (let i = 0; i < Math.min(len, 16); i++) s += String.fromCharCode(dv.getUint8(o + 8 + i));
        const m = /^<!>(\d+)/.exec(s); return m ? +m[1] : 0;
      }
      o += 8 + len + (len & 1);
    }
    return 0;
  }

  /* A table file in, as 1024-sample frames: { samples, frames, source, frameSize }, or null if it is not a table. */
  function readTable(buf) {
    const dv = new DataView(buf);
    const head = dv.byteLength >= 4 ? String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3)) : '';
    let raw, L, source;
    if (head === 'vawt') {
      L = dv.getUint32(4, true); const n = dv.getUint16(8, true), flags = dv.getUint16(10, true);
      if (flags & 1) throw new Error('this .wt is a sample, not a wavetable');
      raw = new Float32Array(L * n);
      if (flags & 4) { const s = (flags & 8) ? 32768 : 16384; for (let i = 0; i < raw.length; i++) raw[i] = dv.getInt16(12 + i * 2, true) / s; }
      else for (let i = 0; i < raw.length; i++) raw[i] = dv.getFloat32(12 + i * 4, true);
      source = 'Surge .wt';
    } else {
      const w = P.parseWav(buf), clm = clmFrameSize(buf);
      L = clm || FRAME; raw = w.samples; source = clm ? `CLM, ${clm}-sample frames` : `plain WAV, ${FRAME}-sample frames`;
      if (raw.length % L !== 0 || raw.length < 2 * L) return null;
    }
    const F = raw.length / L, samples = new Float32Array(F * FRAME);
    for (let i = 0; i < F; i++) samples.set(L === FRAME ? raw.subarray(i * L, (i + 1) * L) : P.resampleCycle(raw.subarray(i * L, (i + 1) * L), FRAME), i * FRAME);
    return { samples, frames: F, source, frameSize: L };
  }

  const api = { FORMATS, exportTable, readTable, clmFrameSize, encodeClm, encodeWt, encodePcm16, thinIndex };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.WTFormats = api;
})(typeof window !== 'undefined' ? window : globalThis);
