// render-proofs.mjs — the coupling edge's renders, made by the page's own engine, plus the data
// behind the figure.
//   node render-proofs.mjs        (~3 minutes; writes renders/*.wav, renders.json, figure-data.json)
//   node render-proofs.mjs 01 05  (only the renders whose names start so; the rest of renders.json is kept)
//
// The WAVs stay on this Mac (Projects/**/*.wav is gitignored since 2026-10-18); this script and
// renders.json (what each render measured) are the tracked recipe. Every render is the page's
// AudioWorklet run headless at 44.1 kHz through edge-lab.mjs, with the same settings the page offers.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { common, makeProc, configure, stats, writeWav } from './edge-lab.mjs';

const C = common(), SR = 44100, here = (f) => new URL(f, import.meta.url);
mkdirSync(here('renders/'), { recursive: true });
const E64 = C.edgeS(6, 64, true, 0, 'warm');
const warm64 = { N: 64, src: 'warm', pinned: true, K: 6, sEdge: E64, partnerGain: 0.45, silent: 0 };

// run a list of segments: [seconds, message-to-send-at-its-start]; returns audio, trace and per-segment stats
function render(name, base, segments, notes) {
  const p = configure(makeProc(SR), C, { ...base, trace: true });
  const L = [], R = []; let t = 0, peak = 0, nan = false; const seg = [];
  for (const [secs, msg, label] of segments) {
    if (msg) p.send(msg);
    const r = p.run(secs, true); L.push(r.L); R.push(r.R); peak = Math.max(peak, r.peak); nan = nan || r.nan;
    const s = stats(p.traceA, t + Math.min(1, secs / 2), t + secs, p.hop / SR);
    const row = { from_s: +t.toFixed(2), to_s: +(t + secs).toFixed(2), label, pitch_hz: +s.mean.toFixed(2), wobble_hz: +s.wobble.toFixed(3) };
    if (base.partner === 1) { const i0 = Math.round((t + secs / 2) / (p.hop / SR)), i1 = Math.round((t + secs) / (p.hop / SR));
      const iv = p.traceA.slice(i0, i1).map((x, i) => 1200 * Math.log2(p.traceB[i0 + i] / x)), mu = iv.reduce((a, b) => a + b, 0) / iv.length;
      Object.assign(row, { interval_cents: +mu.toFixed(2), interval_sd: +Math.sqrt(iv.reduce((a, b) => a + (b - mu) ** 2, 0) / iv.length).toFixed(2) }); }
    seg.push(row); t += secs;
  }
  const cat = (A) => { const out = new Float32Array(A.reduce((n, a) => n + a.length, 0)); let o = 0; for (const a of A) { out.set(a, o); o += a.length; } return out; };
  const l = cat(L), r = cat(R), fi = Math.round(0.05 * SR), fo = Math.round(0.5 * SR);
  for (let i = 0; i < fi; i++) { l[i] *= i / fi; r[i] *= i / fi; }
  for (let i = 0; i < fo; i++) { const g = i / fo; l[l.length - 1 - i] *= g; r[r.length - 1 - i] *= g; }
  writeWav(here(`renders/${name}.wav`), l, r, SR);
  console.log(`${name}.wav  ${t.toFixed(0)} s  peak ${peak.toFixed(2)}${nan ? '  NaN!' : ''}`);
  return { file: `renders/${name}.wav`, seconds: +t.toFixed(1), peak_before_normalising: +peak.toFixed(3), nan, notes, segments: seg };
}

const only = process.argv.slice(2), want = (name) => !only.length || only.some((o) => name.startsWith(o));
const out = only.length && existsSync(here('renders.json')) ? JSON.parse(readFileSync(here('renders.json'), 'utf8')) : {};
const make = (name, ...a) => { if (want(name)) out[name] = render(name, ...a); };
// 01: the baton's prototype. Stretch held just past the edge at the middle coupling; coupling rides 2 → 18 → 2 Hz
// twice, so it tears at the low ends and locks at the high ones (ride-coupling's path, on the warm pinned tone)
const ride = { ...warm64, s: E64 + 0.15, ride: 1, rideLo: 2, rideHi: 18, rideP: 20 };
make('01-coupling-as-the-knob', ride, [[5, null, 'K 2 → 10'], [5, null, 'K 10 → 18'], [5, null, 'K 18 → 10'], [5, null, 'K 10 → 2'], [5, null, 'K 2 → 10'], [5, null, 'K 10 → 18'], [5, null, 'K 18 → 10'], [5, null, 'K 10 → 2']],
  'stretch held 0.15 decade past the edge at K 6; coupling at 2 Hz at 0, 20 and 40 s (torn), 18 Hz at 10 and 30 s (locked)');
make('01-coupling-as-the-knob-alone', { ...ride, partnerGain: 0 }, [[40, null, 'the tone alone']], 'the same, the tone alone');
// 02: the same margin on every note: each note 3 s a quarter decade under the edge, then 3 s a quarter over
const notes = [['E1', 41.2034], ['A1', 55], ['E2', 82.4069], ['A2', 110], ['E3', 164.814], ['A3', 220], ['E4', 329.628], ['A4', 440]];
make('02-the-margin-on-every-note', { ...warm64, s: E64 - 0.25 },
  notes.flatMap(([n, f]) => [[3, { f0: f, f0V: f, K: (6 * f) / 110, s: E64 - 0.25 }, `${n} under`], [3, { s: E64 + 0.25 }, `${n} over`]]),
  'E1 to A4, 6 s each: 3 s a quarter decade under the edge (holds), 3 s a quarter over (tears); coupling scaled with pitch');
// 03: strikes at four heights over the edge, twice each, 3 s apart
make('03-strikes-four-heights', { ...warm64, s: E64 - 0.25, strTau: 0.25 },
  [0.25, 0.5, 1, 1.5].flatMap((h) => [[3, { strD: h, strike: true }, `strike +${h} dec`], [3, { strike: true }, `strike +${h} dec again`]]),
  'held a quarter decade under the edge; strikes thrown +0.25, +0.5, +1 and +1.5 decades past it (decay 0.25 s), two of each');
// 04: the field guide's 8-step pattern relative to the edge, on A2 and then on E1
make('04-sequence-on-the-threshold', { ...warm64, seq: 1, seqT: 0.375 },
  [[12, null, 'A2'], [12, { f0: 41.2034, f0V: 41.2034, K: (6 * 41.2034) / 110, seqReset: true }, 'E1']],
  'steps (decades from the edge) -1.26 -0.26 -0.08 +0.14 -1.26 +0.52 -0.18 +1.05, 0.375 s each: A2 for 12 s, then E1');
// 05: the real A2 piano string's stretch under the ensemble
const a2 = C.DATA.piano.find((p) => p.note === 'A2');
make('05-real-piano-string-A2', { N: 12, src: 'warm', pinned: true, K: 6, s: Math.log10(a2.B), partnerGain: 0.45, silent: 0 },
  [[8, null, 'first 12 partials, K 6'], [8, { N: a2.partials, Nv: a2.partials, ...C.voicing(a2.partials), ...C.source('warm', a2.partials) }, `up to partial ${a2.partials}, K 6`], [8, { K: 64 }, `up to partial ${a2.partials}, K 64`]],
  `the measured A2 string (B ${a2.B}) pulled by the ensemble: its first 12 partials, then all ${a2.partials}, then all at 64 Hz coupling`);
// 06: the vibraphone grows into its own measured bend, at its own pitch, rank-filed and with its own levels
const vib = C.DATA.materials.vibraphone, fv = vib.f1;
make('06-vibraphone-into-its-own-bend',
  { N: vib.cents.length, law: 1, tab: vib.cents, amps: vib.amps, offs: C.DATA.seed11.slice(0, vib.cents.length), pinned: true, f0: fv, K: (6 * fv) / 110, s: -3, breathe: 1, brD: 3, brP: 60, partnerGain: 0.45, silent: 0 },
  [[10, null, 'depth 0.001 → 0.01'], [10, null, '→ 0.1 (the edge is 0.03)'], [10, null, '→ 1, the real bend']],
  `depth swept from 0.001 to 1 of the measured bend over 30 s at ${fv} Hz; the edge sits near 0.03`);
// 07: the pinned string → bar morph with nearest pairing: frozen string, torn middle, the bar relocks
make('07-string-to-bar-nearest-pairing',
  { N: 40, src: 'warm', pinned: true, K: 6, pairing: 1, s: -6, breathe: 1, brD: 9, brP: 80, partnerGain: 0.45, silent: 0 },
  [[10, null, 'B 1e-6 → ~1e-4'], [10, null, '→ ~1e-1.5'], [10, null, '→ ~1e1'], [10, null, '→ 1e3, the bar']],
  'stretch swept on a log curve from B 1e-6 to 1e3 over 40 s, partial 1 pinned, each partial gripped by its nearest voice');
// 08: the same breath across the edge with uniform coupling, then with coupling that follows loudness
make('08-loudness-coupling', { ...warm64, s: E64 - 0.65, breathe: 1, brD: 1.3, brP: 12 },
  [[24, null, 'γ 0: every partial pulls equally'], [24, { gamma: 1 }, 'γ 1: quiet partials pull weakly']],
  'stretch breathes 0.65 decade under to 0.65 over the edge, 12 s period; 24 s uniform coupling, then 24 s with γ = 1');
// 09: the edge LFO on loudness at three distances past its edge, then on coupling with the tone just under the edge
make('09-edge-lfo', { ...warm64, s: E64 - 1, lfo: 1, lfoK: 2, lfoRho: 1.02, lfoDest: 0, lfoAmt: 0.8 },
  [[8, null, 'on loudness, ρ 1.02'], [8, { lfoRho: 1.2 }, 'ρ 1.2'], [8, { lfoRho: 2 }, 'ρ 2'], [10, { s: E64 - 0.1, lfoDest: 2, lfoAmt: 1, lfoRho: 1.1 }, 'on coupling, ρ 1.1, tone just under the edge']],
  'κ 2 Hz. Loudness: ρ 1.02 (0.4 pulses/s), 1.2 (1.3/s), 2 (3.5/s). Then each pulse loosens coupling tenfold with the tone 0.1 decade under the edge');
// 10: two tones an octave apart, pulling on each other
make('10-duo-octave', { N: 24, src: 'warm', pinned: true, K: 6, partner: 1, ratioB: 2 * Math.pow(2, 10 / 1200), s: -12, partnerGain: 0.9, silent: 0 },
  [[8, null, 'no stretch, started 10 ¢ wide'], [10, { s: Math.log10(4e-3) }, 'B 4e-3'], [10, { s: Math.log10(7.4e-4) }, 'B 7.4e-4, piano-like']],
  'octave started 10 ¢ wide: pulled true unstretched, relocks wide at B 4e-3, cannot settle near the octave at piano-like stretch');
writeFileSync(here('renders.json'), JSON.stringify(Object.fromEntries(Object.entries(out).sort()), null, 1));
if (only.length) process.exit(0);

// the figure's data: the pinned morph under fixed and nearest pairing, stretch held at each step
function probe(o, secs = 4) {
  const p = configure(makeProc(SR), C, { ...o, silent: 1, trace: true });
  p.run(secs - 2); p.S.report = 1; p.repLen = 2 * SR; p.repN = 0; p.slipAcc.fill(0); p.run(2.01);
  return { wobble: +stats(p.traceA, secs - 2, Infinity, p.hop / SR).wobble.toFixed(3), locked: p.lastMsg.slip.filter((x) => Math.abs(x) < 0.5).length, paired: Array.from(p.lastMsg.mate).filter((m) => m >= 0).length };
}
const S = Array.from({ length: 19 }, (_, i) => -6 + i * 0.5);
const fig = { morph: { s: S, fixed: S.map((s) => probe({ N: 40, K: 6, s, pinned: true, pairing: 0, src: 'warm' })), nearest: S.map((s) => probe({ N: 40, K: 6, s, pinned: true, pairing: 1, src: 'warm' })) } };
writeFileSync(here('figure-data.json'), JSON.stringify(fig, null, 1));
console.log('renders.json and figure-data.json written');
