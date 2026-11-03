#!/usr/bin/env node
// Synth Templates — reference renders: every card's render pattern, played by the site's own voice (site/voice.js) offline.
//
// usage: node render-refs.mjs [--only id,id] [--rate 48000] [--no-features]
//   writes renders/<id>.wav (16-bit stereo; a float peak past -1 dBFS is scaled on write to -1 dBFS, normalised_db on the manifest), renders/manifest.json, then runs render-features.py
//   (features.json, <id>.png spectrograms, SANITY-<date>.md). Run `python3 build-site.py` first: voice.js is generated.
//
// The voice is not copied here: this file imports site/voice.js, hands it an OfflineAudioContext (node-web-audio-api)
// and calls the same playDemo the Play-the-default button calls, so the WAV and the browser are one voice.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { OfflineAudioContext } from 'node-web-audio-api';
import { load as yamlLoad } from 'js-yaml';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const RATE = parseInt(opt('--rate', '48000'));
const ONLY = opt('--only', '') ? opt('--only', '').split(',') : null;
const OUT = path.join(HERE, 'renders'); fs.mkdirSync(OUT, { recursive: true });

await import('./site/voice.js');
const V = globalThis.SynthVoice;
const vocab = yamlLoad(fs.readFileSync(path.join(HERE, 'vocabulary.yaml'), 'utf8'));
V.setVocab(vocab);
const cards = fs.readdirSync(path.join(HERE, 'cards')).filter(f => f.endsWith('.yaml')).sort()
  .map(f => yamlLoad(fs.readFileSync(path.join(HERE, 'cards', f), 'utf8'))).filter(c => !ONLY || ONLY.includes(c.id));

// the voice's warnings (a word missing from the vocabulary) are kept per card
let warnings = []; const warn = console.warn; console.warn = (...a) => warnings.push(a.join(' '));

function wav16(channels, rate, gain = 1){
  const n = channels[0].length, nc = channels.length, data = Buffer.alloc(n * nc * 2);
  for (let i = 0; i < n; i++) for (let c = 0; c < nc; c++){ let x = channels[c][i]; if (!Number.isFinite(x)) x = 0; x = Math.max(-1, Math.min(1, x * gain)); data.writeInt16LE(Math.round(x * 32767), (i * nc + c) * 2); }
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(nc, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * nc * 2, 28); h.writeUInt16LE(nc * 2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  return Buffer.concat([h, data]);
}

const manifest = { set: 'Synth Templates — reference renders', generator: 'render-refs.mjs → site/voice.js (the site\'s own Web Audio voice) via node-web-audio-api OfflineAudioContext', vocabulary: 'vocabulary.yaml as on disk (the browser\'s tuned copy is not used)', master_compressor: 'BYPASSED: node-web-audio-api 2.2.0 DynamicsCompressor is unstable on fast onsets (gain runs to 4e5 then NaN on a 1.6 ms step); the browser plays through a -12 dB threshold compressor, so peaks here are up to ~6 dB hotter than the page; a render whose float peak passes -1 dBFS is scaled on write to -1 dBFS (a plain gain, no limiter; normalised_db per render), so the 16-bit file never clips', sample_rate_hz: RATE, channels: 2, bit_depth: 16, rendered: new Date().toISOString(), renders: [] };
let t0all = Date.now();
for (const c of cards){
  warnings = [];
  const r = c.render || {}; const bpm = r.tempo || 120; const beat = 60 / bpm;
  // a first pass on a tiny context finds the schedule; the real render is sized from it and the card's length_s
  const probe = new OfflineAudioContext(2, 16, RATE); V.useContext(probe, true, { compressor: false }); const sched = V.playDemo(c);
  const B = c.graph?.blocks || {}; const rel = V.envTimes(B.aenv?.shape).r;
  const reverb = (B.fx?.chain || []).includes('reverb') ? V.word('reverb', (c.taste||[]).find(t => t.block==='fx' && t.param==='reverb')?.default || 'large', 2.5) : 0;
  const delay = (B.fx?.chain || []).some(x => x === 'delay' || x === 'echo') ? beat * 0.75 * 4 : 0;
  const want = Math.max(r.length_s || 0, sched.lastOff + rel * 2 + reverb + delay) + 1.0;
  const length = Math.min(Math.ceil(want * RATE), 30 * RATE);
  const ac = new OfflineAudioContext(2, length, RATE); V.useContext(ac, true, { compressor: false });
  const s2 = V.playDemo(c);
  let buf; try { buf = await ac.startRendering(); } catch (e) { warnings.push('render failed: ' + e.message); }
  const ch = buf ? [buf.getChannelData(0), buf.getChannelData(1)] : [new Float32Array(length), new Float32Array(length)];
  if (ch.some(x => x.some(v => !Number.isFinite(v)))) warnings.push('render produced NaN/Inf samples (written as 0)');
  let rawPeak = 0; for (const x of ch) for (const v of x) if (Number.isFinite(v)) rawPeak = Math.max(rawPeak, Math.abs(v));
  // trim the silent tail (below -60 dBFS) so the set stays small; the untrimmed length is on the manifest
  let last = 0; for (let i = ch[0].length - 1; i >= 0; i--){ if (Math.abs(ch[0][i]) > 0.001 || Math.abs(ch[1][i]) > 0.001){ last = i; break; } }
  const keep = Math.min(ch[0].length, Math.max(last + Math.round(0.25 * RATE), RATE));
  // normalise on write: the page's compressor is bypassed here, so a hot render is scaled down to -1 dBFS (a plain gain); under -1 dBFS it is written as is
  const CEIL = Math.pow(10, -1 / 20); const gain = rawPeak > CEIL ? CEIL / rawPeak : 1; const normDb = gain < 1 ? +(20 * Math.log10(gain)).toFixed(2) : 0;
  fs.writeFileSync(path.join(OUT, c.id + '.wav'), wav16(ch.map(x => x.subarray(0, keep)), RATE, gain));
  manifest.renders.push({ id: c.id, name: c.name, family: c.family, tier: c.tier, mode: c.mode, wav: c.id + '.wav', spectrogram: c.id + '.png',
    render: r, schedule: { t0: s2.t0, last_note_off_s: s2.lastOff, release_s: rel, reverb_s: reverb, delay_tail_s: delay, rendered_s: length / RATE, written_s: keep / RATE, raw_peak_dbfs: +(20 * Math.log10(Math.max(rawPeak, 1e-9))).toFixed(2) },
    normalised_db: normDb, warnings });
  process.stdout.write(`${c.id}  ${(keep / RATE).toFixed(1)}s${normDb ? '  scaled ' + normDb + ' dB' : ''}${warnings.length ? '  ! ' + warnings.length + ' warning(s)' : ''}\n`);
}
console.warn = warn;
fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log(`${manifest.renders.length} renders in ${((Date.now() - t0all) / 1000).toFixed(0)}s → renders/manifest.json`);
if (!args.includes('--no-features')){
  const py = fs.existsSync(path.join(HERE, '.venv/bin/python3')) ? path.join(HERE, '.venv/bin/python3') : 'python3';
  const res = spawnSync(py, [path.join(HERE, 'render-features.py')], { stdio: 'inherit' }); process.exit(res.status ?? 1);
}
