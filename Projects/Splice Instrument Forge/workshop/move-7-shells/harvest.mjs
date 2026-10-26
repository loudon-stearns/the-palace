// harvest -- the forge's own shells, taken from the files Ableton ships inside Live 12 Suite, and from nobody's saved
// Set. Each is the thinnest element Live itself wrote, set to its neutral values, with holes where the builders pour
// content. (Splice Instrument Forge, the "own shells" move, 2026-10-26.)
//
//   node harvest.mjs          write shells/*.xml and shells/PROVENANCE.json
//
// The builders read shells/ only. Re-run after a Live update and `node audit.mjs` says what Ableton changed.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { element, leaves } from './audit.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, 'shells');
const APP = '/Applications/Ableton Live 12 Suite.app';
const LIVE = path.join(APP, 'Contents/App-Resources');
const CORE = path.join(LIVE, 'Core Library');
const gz = (f) => zlib.gunzipSync(fs.readFileSync(f)).toString('utf8');
const set = (t, tag, v) => { const re = new RegExp('<' + tag + ' Value="[^"]*" />'); if (!re.test(t)) throw new Error('no <' + tag + '> to neutralise'); return t.replace(re, '<' + tag + ' Value="' + v + '" />'); };
const swap = (t, tag, text) => { const el = element(t, tag); if (!el) throw new Error('no <' + tag + '>'); return t.replace(el, text); };
// Live indents with tabs to the element's depth; a shell starts at column 0 so builders can splice it anywhere.
const dedent = (t) => { const lines = t.split('\n'); const ind = Math.min(...lines.slice(1).filter((l) => l.trim()).map((l) => l.match(/^\t*/)[0].length)) - 1; return lines.map((l, i) => i ? l.replace(new RegExp('^\\t{0,' + Math.max(0, ind) + '}'), '') : l).join('\n'); };

const SRC = {
  audioTrack: path.join(CORE, 'Defaults/Creating Tracks/Audio Track/Default Audio Track.als'),
  midiTrack: path.join(CORE, 'Defaults/Creating Tracks/MIDI Track/Default MIDI Track.als'),
  audioClip: path.join(CORE, 'Ableton Folder Info/Sample Reference.als'),
  beat: path.join(CORE, 'Templates/Quick Start Beat.als'),
};

const shells = {
  // A new audio track exactly as Live 12.4 makes one: fader at 0 dB, nothing armed, one empty slot per sequencer.
  'AudioTrack.xml': [SRC.audioTrack, () => {
    let t = element(gz(SRC.audioTrack), 'AudioTrack');
    t = set(t, 'EffectiveName', '');
    return t;
  }],
  // A new MIDI track as Live 12.4 makes one: no devices, 0 dB, not armed.
  'MidiTrack.xml': [SRC.midiTrack, () => {
    let t = element(gz(SRC.midiTrack), 'MidiTrack');
    t = set(t, 'EffectiveName', '');
    return t;
  }],
  // A clip Ableton wrote for its own library: unity gain, default fades (none), warped, out of key.
  'AudioClip.xml': [SRC.audioClip, () => {
    let c = element(gz(SRC.audioClip), 'AudioClip');
    c = set(c, 'Name', ''); c = set(c, 'Color', '-1');
    c = swap(c, 'SampleRef', '<SampleRef />');                         // the builder writes the sample in
    c = swap(c, 'WarpMarkers', '<WarpMarkers />');
    return c;
  }],
  // The first clip of Ableton's own beat template, its notes taken out.
  'MidiClip.xml': [SRC.beat, () => {
    let c = element(gz(SRC.beat), 'MidiClip');
    c = set(c, 'Name', ''); c = set(c, 'Color', '-1');
    c = swap(c, 'KeyTracks', '<KeyTracks />');
    c = c.replace(/<NoteIdGenerator>[\s\S]*?<\/NoteIdGenerator>/, '<NoteIdGenerator>\n<NextId Value="1" />\n</NoteIdGenerator>');
    c = c.replace(/<TimeSelection>[\s\S]*?<\/TimeSelection>/, '<TimeSelection>\n<AnchorTime Value="0" />\n<OtherTime Value="0" />\n</TimeSelection>');
    return c;
  }],
  // A pad of the Drum Rack in Ableton's own beat template: its device taken out (the builder's hole is <!--DEVICE-->),
  // its sends to the template's return chains taken out, its output back to the rack's own (Ableton's pad fed a
  // sidechain on another track of that template).
  'DrumBranch.xml': [SRC.beat, () => {
    let b = element(gz(SRC.beat), 'DrumBranch');
    b = set(b, 'EffectiveName', ''); b = set(b, 'UserName', '');
    const chain = element(b, 'MidiToAudioDeviceChain');
    b = b.replace(chain, chain.replace(element(chain, 'Devices'), '<Devices>\n<!--DEVICE-->\n</Devices>'));
    b = b.replace(/<SendInfos>[\s\S]*?<\/SendInfos>/, '<SendInfos />');
    b = b.replace(/<Target Value="AudioOut\/[^"]*" \/>/, '<Target Value="AudioOut/None" />').replace(/<UpperDisplayString Value="[^"]*" \/>(\s*)<LowerDisplayString Value="[^"]*" \/>/, '<UpperDisplayString Value="No Output" />$1<LowerDisplayString Value="" />');
    b = b.replace(/<BranchSourceContext>[\s\S]*?<\/BranchSourceContext>/, (s) => s.replace(/<OriginalFileRef>[\s\S]*?<\/OriginalFileRef>/, '<OriginalFileRef />'));
    return b;
  }],
};

fs.mkdirSync(OUT, { recursive: true });
const prov = { harvested: new Date().toISOString(), live: fs.readFileSync(path.join(APP, 'Contents/Info.plist'), 'utf8').match(/<key>CFBundleShortVersionString<\/key>\s*<string>([^<]*)/)[1], shells: {} };
for (const [file, [src, make]] of Object.entries(shells)) {
  let xml = make();
  if (xml.includes('Impact Granular') || /UserName Value="[^"]+"/.test(element(xml, 'Name') || '')) throw new Error(file + ': a name rode in');
  xml = dedent(xml).trim() + '\n';
  fs.writeFileSync(path.join(OUT, file), xml);
  const creator = gz(src).match(/Creator="([^"]*)"/)[1];
  prov.shells[file] = { from: path.relative(LIVE, src), creator, leaves: leaves(xml).size, sha1: crypto.createHash('sha1').update(xml).digest('hex').slice(0, 12) };
  console.log(file.padEnd(16) + String(prov.shells[file].leaves).padStart(5) + ' values  from ' + prov.shells[file].from + '  (' + creator + ')');
}
fs.writeFileSync(path.join(OUT, 'PROVENANCE.json'), JSON.stringify(prov, null, 1) + '\n');
