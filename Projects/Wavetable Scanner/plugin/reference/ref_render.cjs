// ref_render.cjs — the reference render: the browser synth's own engine (synth/wt-synth.js) and
// morph (packer/packer.js), run in Node in 16-sample blocks, the size of the engine's slow-value
// step, so Algorithm.h can be checked against it sample for sample.
//
//   node ref_render.cjs job.json out.f32
// job.json: { sr, steps, ids: [param ids, kParams order], rows: "<file of float64 [ids × blocks]>",
//             events: [[sample, on, note, velocity 1..127], ...] }   (events land on 16-sample marks)
// out.f32: left then right, float32, steps each.
const fs = require('fs'), path = require('path');
const BUNDLE = path.resolve(__dirname, '..', '..');
const S = require(path.join(BUNDLE, 'synth', 'wt-synth.js')), P = require(path.join(BUNDLE, 'packer', 'packer.js'));
const Engine = S.engineFactory(), L = 1024, B = 16;
const KEYS = ['classics', 'cello', 'fm'];

// synth/page.html morphed(), word for word
function morphed(raw) {
  const F = raw.length / L, frames = [];
  for (let f = 0; f < F; f++) { const c = raw.slice(f * L, f * L + L); let m = 0; for (const v of c) m += v; m /= L; frames.push(c.map(v => v - m)); }
  const { frames: out } = P.spectralMorph(P.alignRotations(frames), 512, true);
  const samples = new Float32Array(out.length * L); out.forEach((c, i) => samples.set(c, i * L));
  let e = 0; for (const v of samples) e += v * v; e /= samples.length;
  let e0 = 0; for (const v of raw) e0 += v * v; e0 /= raw.length;
  if (e > 0) { const k = Math.sqrt(e0 / e); for (let i = 0; i < samples.length; i++) samples[i] *= k; }
  return { samples, frames: out.length };
}
const cache = {};
function table(i) {
  if (!cache[i]) {
    const b = fs.readFileSync(path.join(__dirname, 'tables', KEYS[i] + '.f32'));
    const raw = new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.length));
    const t = morphed(raw); cache[i] = { mips: S.buildMips(t.samples, t.frames), frames: t.frames };
  }
  return cache[i];
}

// plugin id → engine name (and how the value maps)
const MAP = { position: 'position', lfo_wave: 'lfoWave', lfo_rate: 'lfoRate', lfo_to_pos: 'lfoToPos', env_to_pos: 'envToPos',
  detune: 'detune', spread: 'spread', cutoff: 'cutoff', reso: 'reso', env_to_cutoff: 'envToCutoff', keytrack: 'keytrack',
  lfo2_rate: 'lfo2Rate', lfo2_to_cutoff: 'lfo2ToCutoff', a_attack: 'aA', a_decay: 'aD', a_sustain: 'aS', a_release: 'aR',
  m_attack: 'mA', m_decay: 'mD', m_sustain: 'mS', m_release: 'mR', mode: 'mode', glide: 'glide', transpose: 'transpose',
  velocity: 'velToAmp', gain: 'gain' };

const job = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const rb = fs.readFileSync(job.rows), rows = new Float64Array(rb.buffer.slice(rb.byteOffset, rb.byteOffset + rb.length));
const nb = Math.ceil(job.steps / B), ids = job.ids;
const e = new Engine(job.sr);
let tab = -1;
function apply(b) {
  for (let j = 0; j < ids.length; j++) {
    const x = rows[j * nb + b], id = ids[j];
    if (id === 'table') { if (x !== tab) { tab = x; const t = table(x); e.setTable(t.mips, t.frames); } }
    else if (id === 'unison') e.set('unison', x + 1);
    else if (MAP[id]) e.set(MAP[id], x);
  }
}
const outL = new Float32Array(job.steps), outR = new Float32Array(job.steps), l = new Float32Array(B), r = new Float32Array(B);
apply(0);
let k = 0;
for (let b = 0; b < nb; b++) {
  const i = b * B;
  while (k < job.events.length && job.events[k][0] <= i) {
    const [, on, note, vel] = job.events[k++];
    if (on) e.noteOn(note, vel); else e.noteOff(note);
  }
  apply(b);
  e.render(l, r, B);
  const n = Math.min(B, job.steps - i);
  outL.set(l.subarray(0, n), i); outR.set(r.subarray(0, n), i);
}
const o = Buffer.alloc(job.steps * 8);
Buffer.from(outL.buffer).copy(o, 0); Buffer.from(outR.buffer).copy(o, job.steps * 4);
fs.writeFileSync(process.argv[3], o);
