// Renders chord-belief.wav: one take through everything the entry claims, with
// the exact engine the playable page runs (bayes_engine.js).
//   0–4 s    nothing held — the flat prior, a clicky scatter
//   4–14 s   C E G held — the cloud slowly comes to believe the chord
//   14–22 s  G lets go, A arrives — C and E keep their conviction, A has to earn it
//   22–28 s  all released — belief blurs and fades back into the prior
//   28–34 s  nothing held, but the prior is painted: A-minor-pentatonic hills
//   34–42 s  low A and E held over the painted prior
// Writes chord-belief.json (meters every 50 ms) and posterior.f32 (the belief
// curve every 50 ms, for the plot).   node render_chord_belief.js
const fs = require("fs");
const { BeliefCloud } = require("./bayes_engine.js");
const sr = 48000, c = new BeliefCloud(sr);

function pentatonicPrior(B, binMidi) {           // A C D E G hills, 40-cent wide, over a low floor
  const pcs = [9, 0, 2, 4, 7], out = new Float64Array(B);
  for (let i = 0; i < B; i++) {
    const m = binMidi(i); let v = 0.04;
    for (let oct = 1; oct < 9; oct++) for (const pc of pcs) { const d = (m - (12 * oct + pc)) / 0.4; v += Math.exp(-0.5 * d * d); }
    out[i] = v;
  }
  return out;
}
const EVENTS = [
  [4.0, "on", 60], [4.0, "on", 64], [4.0, "on", 67],
  [14.0, "off", 67], [14.0, "on", 57],
  [22.0, "off", 57], [22.0, "off", 60], [22.0, "off", 64],
  [28.0, "prior", "pentatonic"],
  [34.0, "on", 45], [34.0, "on", 52],
];
const LABELS = [[0, "flat prior, nothing held"], [4, "C E G held"], [14, "G off, A on: A minor"], [22, "released"], [28, "painted prior, nothing held"], [34, "low A + E over the painted prior"]];
const DUR = 42, total = sr * DUR, L = new Float32Array(total), R = new Float32Array(total);
const B = 2400, post = new Float64Array(c.B), frames = [], trace = [];
let ev = 0;
for (let s = 0; s < total; s += B) {
  const t = s / sr;
  while (ev < EVENTS.length && EVENTS[ev][0] <= t + 1e-9) {
    const [, kind, arg] = EVENTS[ev++];
    if (kind === "on") c.noteOn(arg); else if (kind === "off") c.noteOff(arg);
    else c.setPrior(pentatonicPrior(c.B, (i) => c.binMidi(i)));
  }
  const n = Math.min(B, total - s);
  c.process(L.subarray(s, s + n), R.subarray(s, s + n), n);
  c.posterior(post); frames.push(Float32Array.from(post));
  let Z = c.doubt; for (const x of c.notes.values()) Z += x.w;
  const lab = LABELS.filter((l) => l[0] <= t).pop()[1];
  trace.push({ t: +t.toFixed(2), label: lab, voices: c.nv, meanCycles: +c.meanCycles.toFixed(1), priorShare: +(c.doubt / Z).toFixed(3),
    notes: [...c.notes].map(([m, x]) => ({ m, w: +x.w.toFixed(3), sigCents: +x.sig.toFixed(1), held: x.held })) });
}
const fade = sr * 0.6; for (let i = 0; i < fade; i++) { L[total - 1 - i] *= i / fade; R[total - 1 - i] *= i / fade; }
let peak = 0; for (let i = 0; i < total; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = 0.89 / peak, pcm = Buffer.alloc(44 + total * 4);
pcm.write("RIFF", 0); pcm.writeUInt32LE(36 + total * 4, 4); pcm.write("WAVEfmt ", 8);
pcm.writeUInt32LE(16, 16); pcm.writeUInt16LE(1, 20); pcm.writeUInt16LE(2, 22); pcm.writeUInt32LE(sr, 24);
pcm.writeUInt32LE(sr * 4, 28); pcm.writeUInt16LE(4, 32); pcm.writeUInt16LE(16, 34); pcm.write("data", 36); pcm.writeUInt32LE(total * 4, 40);
for (let i = 0; i < total; i++) {
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * g)) * 32767), 44 + i * 4);
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * g)) * 32767), 46 + i * 4);
}
fs.writeFileSync("chord-belief.wav", pcm);
const flat = new Float32Array(frames.length * c.B); frames.forEach((f, k) => flat.set(f, k * c.B));
fs.writeFileSync("posterior.f32", Buffer.from(flat.buffer));
fs.writeFileSync("chord-belief.json", JSON.stringify({ sr, dur: DUR, frameHop: B / sr, bins: c.B, lo: c.lo, binCents: c.binC, peak: +peak.toFixed(3),
  dropped: c.dropped, events: EVENTS, labels: LABELS, trace }));
console.log("wrote chord-belief.wav", DUR, "s · peak before normalize", peak.toFixed(3), "· dropped grains", c.dropped,
  "· max voices", Math.max(...trace.map((x) => x.voices)));
