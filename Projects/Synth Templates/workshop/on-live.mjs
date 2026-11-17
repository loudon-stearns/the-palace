// on-live.mjs — one card's sitting as a Live 12 Set: the reference and each synth in turn, so the ear does A, B, A, C, A, D with one press of play.
// Usage (from the palace root): node "Projects/Synth Templates/workshop/on-live.mjs" <sitting folder> [--force]
// The folder holds reference.wav and <synth>-matched.wav (from level-match.py), and optionally a Wavetable .adv to play live.
// Built with the Shop's Ableton Session Writer craft (Shop/Shopkeeper/probes/2026-10-20-ableton-session/live-set.mjs): its source is read
// and its inner helpers exported in memory, so nothing in the Shop is changed. A rendered synth plays from a Sampler holding its one file
// at root C3; Wavetable, which this Mac can't host, plays live from its preset on the reference's notes. Silent until play is pressed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const PROBE = path.join(ROOT, 'Shop/Shopkeeper/probes/2026-10-20-ableton-session');
let src = fs.readFileSync(path.join(PROBE, 'live-set.mjs'), 'utf8');
src = src.replace(/^const HERE = .*$/m, 'const HERE = ' + JSON.stringify(PROBE) + ';')
  .replace(/^if \(process\.argv\[1\].*$/m, '')
  .replace(/^export \{([^}]*)\};?$/m, 'export {$1, blankSet, finishSet, midiTrack, samplerDevice, limiterDevice, midiClip, element, readSet, writeSet, renumber, check as checkSet};');
const W = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));

const TEMPO = 124;                      // the reference's tempo: its MIDI clip is 483871 µs a beat
const LEAD = 0.05 * TEMPO / 60;       // every render starts its first note 50 ms after the offbeat (the schedule's 0.2919 s), so the live notes wait too
const NOTES = [0.5, 1.5, 2.5, 3.5].map((t) => ({ time: t + LEAD, duration: 0.25, pitch: 36, velocity: 100 }));   // house-bass-pattern.mid, read byte by byte: 480 ticks a beat, MIDI 36 at velocity 100, 120 ticks long, on the four offbeats
const SECTION = 8;                      // two bars a turn: the one bar of notes and the tail
const names = { reference: 'Reference — the site\'s voice', vital: 'Vital, matched to the reference', serum: 'Serum 2, matched to the reference' };

const dir = path.resolve(process.argv[2]); const force = process.argv.includes('--force');
const out = path.join(dir, 'House Bass — one sitting.als');
const set = W.blankSet({ tempo: TEMPO });
const beats = (frames, rate) => frames / rate * TEMPO / 60;

// a rendered take: a Sampler with the one file across the keyboard at its own pitch, a note held for the file's length
function takeTrack(key, file, start, colour) {
  const f = W.wavFacts(file);
  const part = { name: key, file, relative: path.relative(dir, file), keyLo: 0, keyHi: 127, root: 60, velLo: 1, velHi: 127, detune: 0,
    frames: f.frames, rate: f.rate, size: f.size, mtime: f.mtime, loop: null };
  const dev = W.samplerDevice({ name: names[key] || key, parts: [part], attackMs: 0, releaseMs: 5, velTrack: 0 }, set);
  const len = Math.ceil(beats(f.frames, f.rate) * 4) / 4;
  return { dev, len, clip: (id, at) => W.midiClip({ id, start: at, length: SECTION, name: (names[key] || key), colour, notes: [{ time: 0, duration: len, pitch: 60, velocity: 127 }] }, set) };
}

const tracks = []; const report = ['wrote ' + out]; let at = 0; const turns = [];
const files = fs.readdirSync(dir);
const ORDER = ['vital', 'serum'];       // the order the plan proved them in; any other synth after
const takes = ['reference', ...files.filter((n) => n.endsWith('-matched.wav')).map((n) => n.replace('-matched.wav', '')).sort((a, b) => ((ORDER.indexOf(a) + 1) || 99) - ((ORDER.indexOf(b) + 1) || 99))];
const adv = files.find((n) => n.endsWith('.adv'));
const others = [...takes.slice(1).map((k) => ({ kind: 'take', key: k })), ...(adv ? [{ kind: 'live', key: 'wavetable' }] : [])];
// the order of play: the reference before every other synth
for (const o of others) { turns.push({ key: 'reference', at }); at += SECTION; turns.push({ key: o.key, at }); at += SECTION; }
turns.push({ key: 'reference', at }); at += SECTION;

const colours = { reference: 12, vital: 2, serum: 8, wavetable: 17 };
for (const key of ['reference', ...others.map((o) => o.key)]) {
  const mine = turns.filter((t) => t.key === key);
  if (key === 'wavetable') {
    let d = W.element(W.readSet(path.join(dir, adv)), 'InstrumentVector').text;
    d = d.replace(/<LastPresetRef>[\s\S]*?<\/LastPresetRef>/, '<LastPresetRef>\n<Value />\n</LastPresetRef>');
    d = W.renumber(d, set.ids);
    const name = 'Wavetable — playing live from the preset';
    const clips = mine.map((t, i) => W.midiClip({ id: i, start: t.at, length: SECTION, name, colour: colours[key], notes: NOTES }, set));
    tracks.push(W.midiTrack({ name, colour: colours[key], devicesXml: [d], clipsXml: clips, envelopesXml: [] }, set));
    report.push('  ' + name + ': the preset ' + adv + ', ' + mine.length + ' turn(s), the reference\'s four notes on C1 (MIDI 36)');
  } else {
    const t = takeTrack(key, path.join(dir, key === 'reference' ? 'reference.wav' : key + '-matched.wav'), 0, colours[key] ?? 24);
    const clips = mine.map((m, i) => t.clip(i, m.at));
    tracks.push(W.midiTrack({ name: names[key] || key, colour: colours[key] ?? 24, devicesXml: [t.dev.xml], clipsXml: clips, envelopesXml: [] }, set));
    report.push('  ' + (names[key] || key) + ': Sampler, one file at root C3, ' + t.len + ' beats, ' + mine.length + ' turn(s)');
  }
}
const xml = W.finishSet(set, tracks, [W.limiterDevice(set).xml]);
W.writeSet(out, xml, force);
report.push('  order: ' + turns.map((t) => t.key + ' @ bar ' + (t.at / 4 + 1)).join(' · ') + ' — ' + at / 4 + ' bars at ' + TEMPO + ' bpm');
report.forEach((l) => console.log(l));
process.exitCode = W.checkSet(out);
