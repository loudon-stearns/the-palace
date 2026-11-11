#!/usr/bin/env node
// drums-into-plugin.mjs: the Shopkeeper's writer makes a Set with an instrument plugin
// on a MIDI track. Blood Compressor is an effect, so it needs something to compress.
// This puts the drum loop in front of it: the writer's library job makes a second Set
// holding Live's Sampler with the loop in it, and that Sampler is lifted into the
// plugin Set's track, ahead of the plugin, its pointee ids renumbered from the plugin
// Set's NextPointeeId (Live refuses a repeated id). Then every clip's single held note
// becomes one note a bar, so the one-bar loop plays under the whole ride.
// The Sampler's volume goes from Live's default -12 dB to 0, so the plugin hears the loop
// at the level the preview rendered.
//
//   node drums-into-plugin.mjs "<plugin set>.als" "<sampler set>.als" <beats per bar> <pitch>
import fs from 'node:fs';
import zlib from 'node:zlib';

const [plugSet, sampSet, bpbArg, pitchArg] = process.argv.slice(2);
const beatsPerBar = Number(bpbArg), pitch = Number(pitchArg);
const read = (f) => zlib.gunzipSync(fs.readFileSync(f)).toString('utf8');
const POINTEES = /<(AutomationTarget|[A-Za-z]*ModulationTarget|Pointee|ControllerTargets\.\d+) Id="(\d+)"/g;

function element(xml, tag, from = 0) {     // nesting-aware, as the writer's own
  const open = new RegExp('<' + tag + '(?=[\\s/>])', 'g');
  open.lastIndex = from;
  const m = open.exec(xml);
  if (!m) return null;
  const start = m.index;
  const selfClose = xml.indexOf('>', start);
  if (xml[selfClose - 1] === '/') return { start, end: selfClose + 1, text: xml.slice(start, selfClose + 1) };
  const re = new RegExp('<' + tag + '(?=[\\s/>])|</' + tag + '>', 'g');
  re.lastIndex = selfClose + 1;
  let depth = 1, n;
  while ((n = re.exec(xml))) {
    if (n[0][1] === '/') { if (--depth === 0) return { start, end: n.index + n[0].length, text: xml.slice(start, n.index + n[0].length) }; }
    else { const gt = xml.indexOf('>', n.index); if (xml[gt - 1] !== '/') depth++; }
  }
  throw new Error('unclosed <' + tag + '>');
}

let xml = read(plugSet);
const samp = read(sampSet);
let next = Number(xml.match(/<NextPointeeId Value="(\d+)" \/>/)[1]);
let sampler = element(samp, 'MultiSampler').text.replace(POINTEES, (all, tag) => '<' + tag + ' Id="' + (next++) + '"');
sampler = sampler.replace(/^<MultiSampler( Id="\d+")?/, '<MultiSampler Id="0"');
// Live's default Sampler sits at -12 dB; the loop is levelled for the compressor already,
// and a compressor hears level, so the Sampler passes it at unity
const vp = element(sampler, 'VolumeAndPan');
const vol = element(vp.text, 'Volume');
if (!/<Manual Value="-12" \/>/.test(vol.text)) throw new Error('the Sampler volume is not the -12 dB expected');
const vp2 = vp.text.slice(0, vol.start) + vol.text.replace(/<Manual Value="-12" \/>/, '<Manual Value="0" />') + vp.text.slice(vol.end);
sampler = sampler.slice(0, vp.start) + vp2 + sampler.slice(vp.end);
xml = xml.replace(/<NextPointeeId Value="\d+" \/>/, '<NextPointeeId Value="' + next + '" />');

// the track's device chain: the Sampler first, the plugin second
const track = element(xml, 'MidiTrack');
let t = track.text;
const devices = element(t, 'Devices');
const plug = devices.text.replace(/^<Devices>\s*/, '').replace(/\s*<\/Devices>$/, '').replace(/^<PluginDevice Id="\d+"/, '<PluginDevice Id="1"');
if (!plug.startsWith('<PluginDevice')) throw new Error('expected the plugin alone on the track');
t = t.slice(0, devices.start) + '<Devices>\n' + sampler + '\n' + plug + '\n</Devices>' + t.slice(devices.end);

// one note a bar in every clip
let clips = 0;
t = t.replace(/<MidiClip Id="\d+" Time="[^"]+">[\s\S]*?<\/MidiClip>/g, (clip) => {
  const len = Number(clip.match(/<LoopEnd Value="([^"]+)" \/>/)[1]);
  const events = [];
  for (let b = 0, id = 1; b < len; b += beatsPerBar, id++) events.push('<MidiNoteEvent Time="' + b + '" Duration="' + beatsPerBar + '" Velocity="127" OffVelocity="64" NoteId="' + id + '" />');
  clips++;
  return clip
    .replace(/<KeyTracks>[\s\S]*?<\/KeyTracks>|<KeyTracks \/>/, '<KeyTracks>\n<KeyTrack Id="0">\n<Notes>\n' + events.join('\n') + '\n</Notes>\n<MidiKey Value="' + pitch + '" />\n</KeyTrack>\n</KeyTracks>')
    .replace(/<NoteIdGenerator>[\s\S]*?<\/NoteIdGenerator>/, '<NoteIdGenerator>\n<NextId Value="' + (events.length + 1) + '" />\n</NoteIdGenerator>');
});
xml = xml.slice(0, track.start) + t + xml.slice(track.end);
fs.writeFileSync(plugSet, zlib.gzipSync(Buffer.from(xml, 'utf8')));
console.log('drums in: Sampler ahead of the plugin, ' + clips + ' clips retriggering the loop every bar, NextPointeeId ' + next);
