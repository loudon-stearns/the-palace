// edge-lab.mjs — run the instrument's own engine in Node, headless.
//
// The page carries its AudioWorklet processor as a string (`const WORKLET = \`…\`;`) and its
// shared helpers between `// COMMON:start` and `// COMMON:end`. This pulls both out of
// coupling-edge-instrument.html and runs them with a stubbed AudioWorkletProcessor, the way
// _ops/rich-face/check-kuramoto-pieces.mjs does for Kuramoto's pieces. Every measurement,
// edge table and render in this folder comes through here, so they are made by the code the
// page plays.
import { readFileSync, writeFileSync } from 'node:fs';

export const PAGE = new URL('./coupling-edge-instrument.html', import.meta.url);
export const pageSource = () => readFileSync(PAGE, 'utf8');

export function common(src = pageSource()) {
  const block = src.match(/\/\/ COMMON:start[\s\S]*?\/\/ COMMON:end/)[0];
  return new Function(`${block}\nreturn { DATA, EDGE, voicing, source, pianoB, edgeS };`)();
}

export function makeProc(sr = 44100, src = pageSource()) {
  const w = src.match(/const WORKLET = `([\s\S]*?)`;/)[1];
  let Cls;
  class AWP { constructor() { this.port = { onmessage: null, postMessage: (m) => { this.lastMsg = m; } }; } }
  new Function('AudioWorkletProcessor', 'registerProcessor', 'sampleRate', w)(AWP, (_n, C) => { Cls = C; }, sr);
  const p = new Cls();
  p.sr = sr;
  p.send = (d) => p.port.onmessage({ data: d });
  // run `sec` seconds; with collect, return the stereo output
  p.run = (sec, collect = false) => {
    const blocks = Math.round((sec * sr) / 128), L = new Float32Array(128), R = new Float32Array(128);
    const outL = collect ? new Float32Array(blocks * 128) : null, outR = collect ? new Float32Array(blocks * 128) : null;
    let peak = 0, nan = false;
    for (let b = 0; b < blocks; b++) {
      p.process([], [[L, R]]);
      if (collect) { outL.set(L, b * 128); outR.set(R, b * 128); }
      for (let i = 0; i < 128; i++) { const v = L[i]; if (!Number.isFinite(v)) nan = true; else if (Math.abs(v) > peak) peak = Math.abs(v); }
    }
    return { L: outL, R: outR, peak, nan, msg: p.lastMsg };
  };
  return p;
}

// A full configuration, built the way the page builds it. o: { N, f0, K, s, pinned, src, gamma,
// inertia, pairing, partner, law, tab, ampsTable, NB, ratioB, f0V, Nv, silent, trace, hop, ... }
export function configure(p, C, o) {
  const N = o.N ?? 40, f0 = o.f0 ?? 110, Nv = o.Nv ?? N;
  const { det, phInit } = C.voicing(Nv);
  const src = o.amps ? { amps: o.amps, offs: o.offs ?? new Array(N).fill(0) } : C.source(o.src ?? 'bright', N);
  const msg = {
    N, f0, f0V: o.f0V ?? f0, Nv, K: o.K ?? 6, s: o.s ?? -12, sEdge: o.sEdge ?? -4.75, pinned: o.pinned ? 1 : 0,
    gamma: o.gamma ?? 0, inertia: o.inertia ?? 1, pairing: o.pairing ?? 0, partner: o.partner ?? 0, law: o.law ?? 0,
    amps: src.amps, offs: src.offs, det, phInit, silent: o.silent ?? 1, report: 0, trace: o.trace ?? true,
  };
  if (o.tab) msg.tab = o.tab;
  if (o.partner === 1) {
    const NB = o.NB ?? N, sb = o.ampsB ? { amps: o.ampsB, offs: o.offsB ?? new Array(NB).fill(0) } : C.source(o.src ?? 'bright', NB);
    Object.assign(msg, { NB, ratioB: o.ratioB ?? 2, ampsB: sb.amps, offsB: sb.offs.map((x) => (x + 0.37) % 1), inertiaB: o.inertiaB ?? 1 });
  }
  if (o.hop) msg.hop = o.hop;
  for (const k of ['breathe', 'brD', 'brP', 'flutter', 'flD', 'flR', 'seq', 'seqS', 'seqT', 'ride', 'rideLo', 'rideHi', 'rideP', 'strD', 'strTau',
    'lfo', 'lfoSrc', 'lfoK', 'lfoRho', 'lfoDest', 'lfoAmt', 'toneGain', 'partnerGain', 'gated']) if (o[k] !== undefined) msg[k] = o[k];
  p.send(msg);
  p.send({ reset: true });
  return p;
}

// mean and wobble (std of the 10 ms means) of a trace from `from` seconds on
export function stats(trace, from = 0, to = Infinity, hopSec = 0.01) {
  const a = trace.slice(Math.round(from / hopSec), Number.isFinite(to) ? Math.round(to / hopSec) : undefined);
  const mean = a.reduce((x, y) => x + y, 0) / a.length;
  return { mean, wobble: Math.sqrt(a.reduce((x, y) => x + (y - mean) * (y - mean), 0) / a.length) };
}

// hold a fixed configuration for `secs` and measure over its second half, as edgemap.py does
export function hold(C, o, secs = 4, sr = 44100) {
  const p = configure(makeProc(sr), C, { ...o, silent: 1, trace: true });
  p.run(secs);
  const hopSec = p.hop / sr;
  return { ...stats(p.traceA, secs / 2, Infinity, hopSec), statsB: o.partner === 1 ? stats(p.traceB, secs / 2, Infinity, hopSec) : null, p };
}

export function writeWav(path, L, R, sr) {
  const n = L.length, buf = Buffer.alloc(44 + n * 4);
  let peak = 1e-9; for (let i = 0; i < n; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const g = 0.89 / peak;
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(sr, 24);
  buf.writeUInt32LE(sr * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4);
  }
  writeFileSync(path, buf);
  return g;
}
