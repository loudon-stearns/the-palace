#!/usr/bin/env node
// live-set.mjs: a made thing in, an Ableton Live Set out — one Loudon opens and
// plays, nothing else to do. Targets Live 12 Suite (12.4.6 on this Mac): every
// shell it clones was written by Live 12.4, and that is the Live his sets are
// saved by. Nothing a Set makes sounds on open, and nothing auto-plays.
//
//     node live-set.mjs plugin  "<plugin folder>" [--recipe "<ride>.json"] [--out "<set>.als"] [--force]
//     node live-set.mjs library "<folder of .sfz instruments | one.sfz>" [--out "<set>.als"] [--force]
//     node live-set.mjs check   "<set>.als"
//
// THE CRAFT IS GOBUTTON'S (Loudon's GoButton Local repo, tools/v2-convert.js § 2
// THE XML, at commit 555c96b): a Live Set is gzipped XML; clone elements the
// saving Live wrote and change only what must change; every pointee id
// (AutomationTarget, the ModulationTargets, Pointee, ControllerTargets.N) must be
// unique in the set, so renumber from the set's NextPointeeId and move it on
// (Live 12 refuses a set with a repeated id as corrupt); never overwrite; then
// open the copy in Live. The seam authored here: a blank set from Live's own
// template, Live's default Sampler and Limiter, a VST3 device shell, and the
// three jobs below. The .adv/.als gzip read-mutate-write seam was already in
// the palace: Projects/Generative Preset Development/ableton-wavetable/wavetable_writer.py.
//
// CONTENTS (search for the number and name, e.g. "5. DEVICES")
//   1. SETTINGS       the Live targeted, template files, colours
//   2. XML CRAFT      gunzip/gzip, nesting-aware element finding, pointee renumbering
//   3. THE SET        the blank set in, tracks and master out
//   4. TRACKS         a MIDI track shell with devices, clips and automation lanes
//   5. DEVICES        the VST3 plugin device, the Sampler, the Limiter
//   6. CLIPS          arrangement MIDI clips with notes
//   7. AUTOMATION     envelopes on device parameters
//   8. PLUGIN JOB     a JUCE plugin folder (the VST Template's shape) → a Set
//   9. LIBRARY JOB    SFZ instruments → a Set
//  10. CHECK          read a Set back and report what it holds
//  11. COMMAND LINE

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

// ======================================================================
// 1. SETTINGS
// ======================================================================
const HERE = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES = path.join(HERE, 'templates');
// The header of a set saved by the Live targeted (read from a set Live 12.4.6 wrote on 2026-10-17).
const HEADER = '<Ableton MajorVersion="5" MinorVersion="12.0_12402" SchemaChangeCount="5" Creator="Ableton Live 12.4.6" Revision="0de5c8fa9a692293676cb7700a15afb2046ee1f7">';
const VST3_DIR = path.join(os.homedir(), 'Library', 'Audio', 'Plug-Ins', 'VST3');
const BEGINNING = -63072000;      // Live's time for an envelope's first point (two years before bar 1)
const FIRST_TRACK_ID = 20;        // above the blank's own track ids, which are dropped
const DEFAULT_TEMPO = 100;
const COLOURS = [12, 2, 8, 17, 24, 36, 50, 60];   // Live palette indices: a few that read well apart
const LIMITER_CEILING_DB = -1;

// ======================================================================
// 2. XML CRAFT
// ======================================================================
// Which elements are pointees was found by counting the 860 set in GoButton
// (every element whose ids are all distinct and below NextPointeeId).
const POINTEES = /<(AutomationTarget|[A-Za-z]*ModulationTarget|Pointee|ControllerTargets\.\d+) Id="(\d+)"/g;

function readSet(file) {
  const bytes = fs.readFileSync(file);
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) throw new Error(path.basename(file) + ' is not a Live file (gzip)');
  return zlib.gunzipSync(bytes).toString('utf8');
}
function writeSet(file, xml, force) {
  if (fs.existsSync(file) && !force) throw new Error('not overwriting ' + file + ' (pass --force)');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, zlib.gzipSync(Buffer.from(xml, 'utf8')));
}
const template = (name) => fs.readFileSync(path.join(TEMPLATES, name), 'utf8').trim();
function escapeXml(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function renumber(text, ids) {
  return text.replace(POINTEES, (all, tag) => '<' + tag + ' Id="' + (ids.pointee++) + '"');
}
// The whole element <tag …>…</tag> (or <tag … />) at the first match from `from`, nesting-aware.
function element(xml, tag, from = 0, mustContain = null) {
  const open = new RegExp('<' + tag + '(?= |>|/>)', 'g');
  open.lastIndex = from;
  let m;
  while ((m = open.exec(xml))) {
    const start = m.index;
    const re = new RegExp('<(/?)' + tag + '(?= |>|/>)[^>]*?(/?)>', 'g');
    re.lastIndex = start;
    let depth = 0, end = -1, t;
    while ((t = re.exec(xml))) {
      if (t[1]) { depth--; if (depth === 0) { end = t.index + t[0].length; break; } }
      else if (!t[2]) depth++;
      else if (depth === 0) { end = t.index + t[0].length; break; }
    }
    if (end < 0) throw new Error('unclosed <' + tag + '>');
    const text = xml.slice(start, end);
    if (!mustContain || text.includes(mustContain)) return { start, end, text };
    open.lastIndex = end;
  }
  return null;
}
const replaceElement = (xml, el, text) => xml.slice(0, el.start) + text + xml.slice(el.end);
const setValue = (text, tag, value) => {
  const re = new RegExp('<' + tag + ' Value="[^"]*" />');
  if (!re.test(text)) throw new Error('no <' + tag + '> to set');
  return text.replace(re, '<' + tag + ' Value="' + value + '" />');
};
// The first <Manual Value> inside the named element (a Live parameter: <X><LomId/><Manual Value/>…).
function setManual(text, tag, value) {
  const el = element(text, tag);
  if (!el) throw new Error('no <' + tag + '> to set');
  return replaceElement(text, el, el.text.replace(/<Manual Value="[^"]*" \/>/, '<Manual Value="' + value + '" />'));
}
const fmt = (n) => Number.isInteger(n) ? String(n) : String(Number(n.toFixed(10)));
// A device in a chain carries its position as Id (a preset file's root has none).
const withDeviceId = (xml, i) => xml.replace(/^<([A-Za-z0-9]+)( Id="\d+")?/, '<$1 Id="' + i + '"');
// The direct children of an element, as [{ tag, text }].
function children(xml) {
  const inner = xml.slice(xml.indexOf('>') + 1, xml.lastIndexOf('<'));
  const out = [];
  const re = /<([A-Za-z0-9.]+)(?= |>|\/>)/g;
  let m, pos = 0;
  while ((m = re.exec(inner))) {
    if (m.index < pos) continue;
    const el = element(inner, m[1], m.index);
    out.push({ tag: m[1], text: el.text });
    pos = el.end;
    re.lastIndex = el.end;
  }
  return out;
}

// ======================================================================
// 3. THE SET
// ======================================================================
// Live's own empty set, its header moved to the Live targeted, its own tracks
// and return sends dropped (so every track here is one this writer made), and
// the pointee counter read for everything that follows.
function blankSet({ tempo }) {
  let xml = readSet(path.join(TEMPLATES, 'blank-set.als'));
  xml = xml.replace(/<Ableton [^>]*>/, HEADER);
  const tracks = element(xml, 'Tracks');
  xml = replaceElement(xml, tracks, '<Tracks>\n</Tracks>');
  xml = xml.replace(/<SendsPre>[\s\S]*?<\/SendsPre>/, '<SendsPre />');
  xml = xml.replace(/<Sends>[\s\S]*?<\/Sends>/g, '<Sends />');        // the main and pre-hear tracks' sends to the dropped returns
  xml = xml.replace(/<SelectedDocumentViewInMainWindow Value="\d" \/>/, '<SelectedDocumentViewInMainWindow Value="0" />');   // Arrangement
  // the tempo: the mixer's value, and the main track's tempo lane, which Live
  // shows over it (the blank carries one point at 120)
  const main = element(xml, 'MainTrack');
  const tempoEl = element(main.text, 'Tempo');
  let mainText = replaceElement(main.text, tempoEl, tempoEl.text.replace(/<Manual Value="[^"]*" \/>/, '<Manual Value="' + tempo + '" />'));
  const tempoTarget = (tempoEl.text.match(/<AutomationTarget Id="(\d+)"/) || [])[1];
  mainText = mainText.replace(/<AutomationEnvelope Id="\d+">\s*<EnvelopeTarget>\s*<PointeeId Value="(\d+)" \/>[\s\S]*?<\/AutomationEnvelope>/g, (lane, pointee) =>
    pointee === tempoTarget ? lane.replace(/<FloatEvent Id="(\d+)" Time="([^"]+)" Value="[^"]*" \/>/g, '<FloatEvent Id="$1" Time="$2" Value="' + tempo + '" />') : lane);
  xml = replaceElement(xml, main, mainText);
  const next = Number((xml.match(/<NextPointeeId Value="(\d+)" \/>/) || [])[1]);
  if (!next) throw new Error('no NextPointeeId in the blank set');
  const scenes = (xml.match(/<Scene Id=/g) || []).length;
  return { xml, ids: { pointee: next, track: FIRST_TRACK_ID }, scenes };
}

function finishSet(set, tracksXml, masterDevicesXml) {
  let xml = set.xml;
  const tracks = element(xml, 'Tracks');
  xml = replaceElement(xml, tracks, '<Tracks>\n' + tracksXml.join('\n') + '\n</Tracks>');
  const main = element(xml, 'MainTrack');
  const devices = element(main.text, 'Devices');
  xml = replaceElement(xml, main, replaceElement(main.text, devices, '<Devices>\n' + masterDevicesXml.map(withDeviceId).join('\n') + '\n</Devices>'));
  xml = xml.replace(/<NextPointeeId Value="\d+" \/>/, '<NextPointeeId Value="' + set.ids.pointee + '" />');
  return xml;
}

// ======================================================================
// 4. TRACKS
// ======================================================================
// A MIDI track from the shell: name, colour, devices (already numbered),
// arrangement clips, automation envelopes (already pointing at the devices'
// ids), and one empty clip slot per scene of the set.
function midiTrack({ name, colour, devicesXml, clipsXml, envelopesXml }, set) {
  let t = template('midi-track.xml');
  t = t.replace(/^<MidiTrack Id="\d+"/, '<MidiTrack Id="' + (set.ids.track++) + '"');
  t = renumber(t, set.ids);
  const nameEl = element(t, 'Name');
  t = replaceElement(t, nameEl, nameEl.text.replace(/<EffectiveName Value="[^"]*" \/>/, '<EffectiveName Value="' + escapeXml(name) + '" />').replace(/<UserName Value="[^"]*" \/>/, '<UserName Value="' + escapeXml(name) + '" />'));
  t = t.replace(/<Color Value="\d+" \/>/, '<Color Value="' + colour + '" />');
  t = t.replace(/<AutomationEnvelopes>[\s\S]*?<\/AutomationEnvelopes>/, '<AutomationEnvelopes>\n' + (envelopesXml.length ? '<Envelopes>\n' + envelopesXml.join('\n') + '\n</Envelopes>' : '<Envelopes />') + '\n</AutomationEnvelopes>');
  const devices = element(t, 'Devices');
  t = replaceElement(t, devices, '<Devices>\n' + devicesXml.map(withDeviceId).join('\n') + '\n</Devices>');
  if (clipsXml.length) {
    const arr = element(t, 'ArrangerAutomation');
    t = replaceElement(t, arr, arr.text.replace(/<Events \/>/, '<Events>\n' + clipsXml.join('\n') + '\n</Events>'));
  }
  t = t.replace(/<ClipSlotList>[\s\S]*?<\/ClipSlotList>/g, (all) => {
    const slot = element(all, 'ClipSlot').text;
    const slots = [];
    for (let i = 0; i < set.scenes; i++) slots.push(slot.replace(/^<ClipSlot Id="\d+">/, '<ClipSlot Id="' + i + '">'));
    return '<ClipSlotList>\n' + slots.join('\n') + '\n</ClipSlotList>';
  });
  return t;
}

// ======================================================================
// 5. DEVICES
// ======================================================================
// Each returns { xml, targets }: the device numbered into the set, and the
// AutomationTarget ids an envelope can point at.

// A VST3 instrument. uid: the plugin's class id as Live keeps it (four int32s,
// the 16 bytes of the VST3 CID read big-endian). params: the plugin parameters
// to show on the device and make automatable, each { id, name, value } with
// value already normalised to 0..1 (Live keeps VST3 parameters normalised).
function pluginDevice({ name, uid, params, on, state }, set) {
  let d = template('plugin-device.xml');
  if (state) d = d.replace(/<ProcessorState \/>/, '<ProcessorState>' + state.match(/.{1,80}/g).join('\n') + '</ProcessorState>');
  d = d.replace(/<Fields\.(\d) Value="-?\d+" \/>/g, (all, i) => '<Fields.' + i + ' Value="' + uid[Number(i)] + '" />');
  d = d.replace(/(<\/Preset>\s*)<Name Value="[^"]*" \/>/, '$1<Name Value="' + escapeXml(name) + '" />');
  d = d.replace(/<UserName Value="[^"]*" \/>/, '<UserName Value="' + escapeXml(name) + '" />');
  d = setManual(d, 'On', on ? 'true' : 'false');
  const list = params.map((p, i) =>
    '<PluginFloatParameter Id="' + i + '">\n<ParameterName Value="' + escapeXml(p.name) + '" />\n<ParameterId Value="' + p.id + '" />\n<ParameterIdFlankBool Value="false" />\n<VisualIndex Value="' + (i + 1) + '" />\n' +
    '<ParameterValue>\n<LomId Value="0" />\n<Manual Value="' + fmt(p.value) + '" />\n<MidiControllerRange>\n<Min Value="0" />\n<Max Value="1" />\n</MidiControllerRange>\n' +
    '<AutomationTarget Id="0">\n<LockEnvelope Value="0" />\n</AutomationTarget>\n<ModulationTarget Id="0">\n<LockEnvelope Value="0" />\n</ModulationTarget>\n</ParameterValue>\n' +
    '<LastUserRange>\n<First Value="0" />\n<Last Value="100" />\n</LastUserRange>\n<LastInternalRange>\n<First Value="0" />\n<Last Value="1" />\n</LastInternalRange>\n</PluginFloatParameter>').join('\n');
  d = d.replace(/<ParameterList \/>/, list ? '<ParameterList>\n' + list + '\n</ParameterList>' : '<ParameterList />');
  d = renumber(d, set.ids);
  const targets = { on: Number(element(d, 'On').text.match(/<AutomationTarget Id="(\d+)"/)[1]), params: {} };
  const re = /<PluginFloatParameter Id="(\d+)">[\s\S]*?<ParameterId Value="(-?\d+)" \/>[\s\S]*?<AutomationTarget Id="(\d+)"/g;
  let m;
  while ((m = re.exec(d))) targets.params[params[Number(m[1])].key] = Number(m[3]);
  return { xml: d, targets };
}

// Live's default Sampler holding these parts. Each part: { name, file (absolute),
// relative (from the set's folder), keyLo, keyHi, root, velLo, velHi, detune (cents),
// frames, rate, size, mtime, loop: { start, end } | null }.
function samplerDevice({ name, parts, attackMs, releaseMs, velTrack }, set) {
  let d = element(readSet(path.join(TEMPLATES, 'Sampler.adv')), 'MultiSampler').text;
  d = d.replace(/<LastPresetRef>[\s\S]*?<\/LastPresetRef>/, '<LastPresetRef>\n<Value />\n</LastPresetRef>');
  d = d.replace(/<UserName Value="[^"]*" \/>/, '<UserName Value="' + escapeXml(name) + '" />');
  const shell = template('sample-part.xml');
  const partsXml = parts.map((p, i) => {
    let t = shell.replace(/^<MultiSamplePart Id="\d+"/, '<MultiSamplePart Id="' + i + '"');
    t = t.replace(/<Name Value="[^"]*" \/>/, '<Name Value="' + escapeXml(p.name) + '" />');
    const range = (tag, lo, hi) => { const el = element(t, tag); t = replaceElement(t, el, '<' + tag + '>\n<Min Value="' + lo + '" />\n<Max Value="' + hi + '" />\n<CrossfadeMin Value="' + lo + '" />\n<CrossfadeMax Value="' + hi + '" />\n</' + tag + '>'); };
    range('KeyRange', p.keyLo, p.keyHi);
    range('VelocityRange', p.velLo, p.velHi);
    t = setValue(t, 'RootKey', p.root);
    t = setValue(t, 'Detune', fmt(p.detune));
    t = setValue(t, 'SampleStart', 0).replace(/<SampleEnd Value="\d+" \/>/, '<SampleEnd Value="' + (p.frames - 1) + '" />');
    const loop = (tag, start, end, mode) => { const el = element(t, tag); t = replaceElement(t, el, '<' + tag + '>\n<Start Value="' + start + '" />\n<End Value="' + end + '" />\n<Mode Value="' + mode + '" />\n<Crossfade Value="0" />\n<Detune Value="0" />\n</' + tag + '>'); };
    if (p.loop) loop('SustainLoop', p.loop.start, p.loop.end, 1); else loop('SustainLoop', 0, p.frames - 1, 0);
    loop('ReleaseLoop', 0, p.frames - 1, 3);
    const ref = element(t, 'SampleRef');
    t = replaceElement(t, ref,
      '<SampleRef>\n<FileRef>\n<RelativePathType Value="1" />\n<RelativePath Value="' + escapeXml(p.relative) + '" />\n<Path Value="' + escapeXml(p.file) + '" />\n<Type Value="2" />\n<LivePackName Value="" />\n<LivePackId Value="" />\n' +
      '<OriginalFileSize Value="' + p.size + '" />\n<OriginalCrc Value="0" />\n<SourceHint Value="" />\n</FileRef>\n<LastModDate Value="' + p.mtime + '" />\n<SourceContext />\n<SampleUsageHint Value="0" />\n' +
      '<DefaultDuration Value="' + p.frames + '" />\n<DefaultSampleRate Value="' + p.rate + '" />\n<SamplesToAutoWarp Value="0" />\n</SampleRef>');
    return t;
  });
  d = d.replace(/<SampleParts \/>/, '<SampleParts>\n' + partsXml.join('\n') + '\n</SampleParts>');
  // the amplitude envelope: the first <Envelope> under <VolumeAndPan>
  const vp = element(d, 'VolumeAndPan');
  let env = element(vp.text, 'Envelope');
  let e = env.text;
  if (attackMs != null) e = setManual(e, 'AttackTime', fmt(attackMs));
  if (releaseMs != null) e = setManual(e, 'ReleaseTime', fmt(releaseMs));
  let v = replaceElement(vp.text, env, e);
  if (velTrack != null) v = setManual(v, 'VolumeVelScale', fmt(velTrack));
  d = replaceElement(d, vp, v);
  d = renumber(d, set.ids);
  return { xml: d, targets: {} };
}

// Live's default Limiter, the ceiling a little under full scale.
function limiterDevice(set) {
  let d = element(readSet(path.join(TEMPLATES, 'Limiter.adv')), 'Limiter').text;
  d = d.replace(/<LastPresetRef>[\s\S]*?<\/LastPresetRef>/, '<LastPresetRef>\n<Value />\n</LastPresetRef>');
  d = setManual(d, 'Ceiling', LIMITER_CEILING_DB);
  d = renumber(d, set.ids);
  return { xml: d, targets: {} };
}

// ======================================================================
// 6. CLIPS
// ======================================================================
// An arrangement MIDI clip at `start` beats, `length` beats long, holding notes
// [{ time, duration, pitch, velocity }] in beats from the clip's start.
function midiClip({ id, start, length, name, colour, notes }, set) {
  let c = template('midi-clip.xml');
  c = c.replace(/^<MidiClip Id="\d+" Time="[^"]+">/, '<MidiClip Id="' + id + '" Time="' + fmt(start) + '">');
  c = setValue(c, 'CurrentStart', fmt(start)).replace(/<CurrentEnd Value="[^"]*" \/>/, '<CurrentEnd Value="' + fmt(start + length) + '" />');
  const loop = element(c, 'Loop');
  c = replaceElement(c, loop, '<Loop>\n<LoopStart Value="0" />\n<LoopEnd Value="' + fmt(length) + '" />\n<StartRelative Value="0" />\n<LoopOn Value="false" />\n<OutMarker Value="' + fmt(length) + '" />\n<HiddenLoopStart Value="0" />\n<HiddenLoopEnd Value="' + fmt(length) + '" />\n</Loop>');
  c = c.replace(/<Name Value="[^"]*" \/>/, '<Name Value="' + escapeXml(name) + '" />');
  c = c.replace(/<Color Value="\d+" \/>/, '<Color Value="' + colour + '" />');
  c = c.replace(/<ScrollerTimePreserver>[\s\S]*?<\/ScrollerTimePreserver>/, '<ScrollerTimePreserver>\n<LeftTime Value="0" />\n<RightTime Value="' + fmt(length) + '" />\n</ScrollerTimePreserver>');
  c = c.replace(/<TimeSelection>[\s\S]*?<\/TimeSelection>/, '<TimeSelection>\n<AnchorTime Value="0" />\n<OtherTime Value="0" />\n</TimeSelection>');
  const byPitch = new Map();
  let noteId = 1;
  for (const n of notes.slice().sort((a, b) => a.time - b.time)) {
    if (!byPitch.has(n.pitch)) byPitch.set(n.pitch, []);
    byPitch.get(n.pitch).push('<MidiNoteEvent Time="' + fmt(n.time) + '" Duration="' + fmt(n.duration) + '" Velocity="' + n.velocity + '" OffVelocity="64" NoteId="' + (noteId++) + '" />');
  }
  const keyTracks = [...byPitch.entries()].sort((a, b) => a[0] - b[0]).map(([pitch, events], i) =>
    '<KeyTrack Id="' + i + '">\n<Notes>\n' + events.join('\n') + '\n</Notes>\n<MidiKey Value="' + pitch + '" />\n</KeyTrack>').join('\n');
  c = c.replace(/<KeyTracks \/>/, keyTracks ? '<KeyTracks>\n' + keyTracks + '\n</KeyTracks>' : '<KeyTracks />');
  c = c.replace(/<NoteIdGenerator>[\s\S]*?<\/NoteIdGenerator>/, '<NoteIdGenerator>\n<NextId Value="' + noteId + '" />\n</NoteIdGenerator>');
  return c;
}

// ======================================================================
// 7. AUTOMATION
// ======================================================================
// An envelope on the parameter whose AutomationTarget id is `pointee`, from
// points [{ time, value }] in beats; the first event, at BEGINNING, carries the
// first point's value, as Live writes it. kind: 'float' | 'bool'.
function envelope(index, pointee, points, kind = 'float') {
  const tag = kind === 'bool' ? 'BoolEvent' : 'FloatEvent';
  const val = (v) => kind === 'bool' ? (v ? 'true' : 'false') : fmt(v);
  const sorted = points.slice().sort((a, b) => a.time - b.time);
  const events = [{ time: BEGINNING, value: sorted[0].value }, ...sorted].map((p, i) => '<' + tag + ' Id="' + i + '" Time="' + fmt(p.time) + '" Value="' + val(p.value) + '" />');
  return '<AutomationEnvelope Id="' + index + '">\n<EnvelopeTarget>\n<PointeeId Value="' + pointee + '" />\n</EnvelopeTarget>\n<Automation>\n<Events>\n' + events.join('\n') + '\n</Events>\n<AutomationTransformViewState>\n<IsTransformPending Value="false" />\n<TimeAndValueTransforms />\n</AutomationTransformViewState>\n</Automation>\n</AutomationEnvelope>';
}

// ======================================================================
// 8. PLUGIN JOB
// ======================================================================
// A plugin folder in the VST Template's shape: plugin.json (name, target, codes),
// src/Algorithm.h (the kParams table: id, name, unit, min, max, default, taper),
// and the built .vst3 under build/ (its moduleinfo.json names the class id).
// The ride comes from a recipe (--recipe, else live-set.json beside plugin.json,
// else a slow sweep of the first two parameters): sections of so many bars,
// each parameter held, ramped through evenly spaced values, or repeating a
// pattern of [beat, value] points. Values are in the plugin's units.

function parseAlgorithmParams(file) {
  const src = fs.readFileSync(file, 'utf8');
  const table = src.slice(src.indexOf('kParams['));
  const out = [];
  const row = /\{\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]*)",\s*([-\d.e]+),\s*([-\d.e]+),\s*([-\d.e]+),\s*Taper::(\w+)/g;
  let m;
  while ((m = row.exec(table))) out.push({ key: m[1], name: m[2], unit: m[3], min: Number(m[4]), max: Number(m[5]), def: Number(m[6]), taper: m[7] });
  return out;
}
// JUCE shows a host a hash of each parameter's string id (juce::String::hashCode, kept positive).
function juceParamId(key) {
  let h = 0;
  for (const c of key) h = (31 * h + c.charCodeAt(0)) | 0;
  return h & 0x7fffffff;
}
// The VST3 class id, from the bundle's moduleinfo.json (JUCE writes one; it has
// trailing commas, so it is read by eye), else from JUCE's own formula for a
// plugin built with JUCE_VST3_CAN_REPLACE_VST2=0: ABCDEF01 9182FAEB <manufacturer code> <plugin code>.
function vst3Uid(bundle, meta) {
  const info = path.join(bundle || '', 'Contents', 'Resources', 'moduleinfo.json');
  let hex = null, from = null;
  if (bundle && fs.existsSync(info)) {
    const text = fs.readFileSync(info, 'utf8');
    const m = text.match(/"CID":\s*"([0-9A-Fa-f]{32})"[\s\S]*?"Category":\s*"Audio Module Class"/);
    if (m) { hex = m[1]; from = 'moduleinfo.json'; }
  }
  if (!hex) {
    const code = (s) => [...s].reduce((a, c) => ((a << 8) | c.charCodeAt(0)) >>> 0, 0).toString(16).padStart(8, '0');
    hex = 'ABCDEF019182FAEB' + code(meta.manufacturer_code) + code(meta.plugin_code);
    from = "JUCE's formula from the codes in plugin.json";
  }
  const fields = [0, 1, 2, 3].map((i) => parseInt(hex.slice(i * 8, i * 8 + 8), 16) | 0);
  return { fields, hex: hex.toUpperCase(), from };
}
// The state a JUCE plugin keeps on an AudioProcessorValueTreeState, as the bytes
// its getStateInformation writes (AudioProcessor::copyXmlToBinary: a magic
// number, the XML's length, the XML, a zero), hex-encoded as Live stores a
// VST3 processor state. treeType is the state's root tag (the VST Template's is
// PARAMS); values are in the plugin's own units.
function juceState(treeType, values) {
  const xml = '<' + treeType + '>' + Object.entries(values).map(([id, v]) => '<PARAM id="' + id + '" value="' + fmt(v) + '"/>').join('') + '</' + treeType + '>';
  const body = Buffer.from(xml, 'utf8');
  const head = Buffer.alloc(8);
  head.writeUInt32LE(0x21324356, 0);
  head.writeUInt32LE(body.length, 4);
  return Buffer.concat([head, body, Buffer.from([0])]).toString('hex').toUpperCase();
}
const normalise = (p, v) => {
  const x = p.taper === 'Log' ? (Math.log(v) - Math.log(p.min)) / (Math.log(p.max) - Math.log(p.min)) : (v - p.min) / (p.max - p.min);
  return Math.min(1, Math.max(0, x));
};

// The points of one parameter over the recipe, in beats, in the plugin's units.
function ridePoints(recipe, key, beatsPerBar) {
  const points = [];
  let t = 0, last = null;
  for (const s of recipe.sections) {
    const len = s.bars * beatsPerBar;
    const v = s[key];
    if (v == null) { t += len; continue; }
    if (typeof v === 'number') {
      if (last != null && last !== v) points.push({ time: t, value: last });
      points.push({ time: t, value: v });
      last = v;
    } else if (Array.isArray(v)) {
      if (last != null && last !== v[0]) points.push({ time: t, value: last });
      v.forEach((val, i) => points.push({ time: t + (v.length === 1 ? 0 : len * i / (v.length - 1)), value: val }));
      last = v[v.length - 1];
    } else if (v.points) {
      const repeat = v.repeat || 1, period = len / repeat;
      for (let r = 0; r < repeat; r++) for (const [dt, val] of v.points) points.push({ time: t + r * period + dt, value: val });
      last = v.points[v.points.length - 1][1];
    }
    t += len;
  }
  return points;
}

function defaultRecipe(params) {
  const [a, b] = params;
  const section = (name, bars, extra) => Object.assign({ name, bars }, extra);
  const r = { tempo: DEFAULT_TEMPO, configure: params.slice(0, 8).map((p) => p.key), silentOnOpen: true, sections: [] };
  if (a) r.sections.push(section('Sweep ' + a.name, 8, { [a.key]: [a.min, a.max, a.min] }));
  if (b) r.sections.push(section('Sweep ' + b.name, 8, { [b.key]: [b.min, b.max, b.min] }));
  r.sections.push(section('Rest at the defaults', 4, {}));
  return r;
}

function pluginJob(folder, opts) {
  const meta = JSON.parse(fs.readFileSync(path.join(folder, 'plugin.json'), 'utf8'));
  const target = meta.target || meta.name;
  const bundle = path.join(folder, 'build', target + '_artefacts', 'Release', 'VST3', meta.name + '.vst3');
  const built = fs.existsSync(bundle);
  const installed = fs.existsSync(path.join(VST3_DIR, meta.name + '.vst3'));
  const uid = vst3Uid(built ? bundle : null, meta);
  const allParams = parseAlgorithmParams(path.join(folder, 'src', 'Algorithm.h'));
  const floats = allParams.filter((p) => p.taper === 'Log' || p.taper === 'Linear');
  const recipeFile = opts.recipe || (fs.existsSync(path.join(folder, 'live-set.json')) ? path.join(folder, 'live-set.json') : null);
  const recipe = recipeFile ? JSON.parse(fs.readFileSync(recipeFile, 'utf8')) : defaultRecipe(floats);
  const tempo = recipe.tempo || DEFAULT_TEMPO;
  const beatsPerBar = 4;
  const silent = recipe.silentOnOpen !== false;
  const configure = (recipe.configure || floats.map((p) => p.key)).map((key) => {
    const p = floats.find((q) => q.key === key);
    if (!p) throw new Error('recipe names a parameter the plugin does not have as a float: ' + key);
    return p;
  });
  // the ride, per parameter, in plugin units then normalised
  const rides = {};
  for (const p of configure) {
    const pts = ridePoints(recipe, p.key, beatsPerBar);
    if (pts.length) rides[p.key] = pts.map((q) => ({ time: q.time, value: normalise(p, q.value) }));
  }
  const total = recipe.sections.reduce((a, s) => a + s.bars * beatsPerBar, 0);
  const set = blankSet({ tempo });
  const startValue = (p) => {   // in plugin units: the ride's first point, else the recipe's "set", else the default
    const pts = ridePoints(recipe, p.key, beatsPerBar);
    if (pts.length) return pts[0].value;
    if (recipe.set && recipe.set[p.key] != null) return recipe.set[p.key];
    return p.def;
  };
  const params = configure.map((p) => ({ key: p.key, name: p.name, id: juceParamId(p.key), value: normalise(p, startValue(p)) }));
  const initial = {};
  for (const p of allParams) initial[p.key] = startValue(p);
  const device = pluginDevice({ name: meta.name, uid: uid.fields, params, on: !silent, state: juceState(recipe.stateTree || 'PARAMS', initial) }, set);
  const envelopes = [];
  // the device wakes one beat into play and sleeps at the end, so the Set is silent on open
  envelopes.push(envelope(envelopes.length, device.targets.on, silent
    ? [{ time: 0, value: false }, { time: 1, value: true }, { time: total, value: true }, { time: total, value: false }]
    : [{ time: 0, value: true }], 'bool'));
  for (const [key, pts] of Object.entries(rides)) envelopes.push(envelope(envelopes.length, device.targets.params[key], pts));
  // one clip per section, named for it, with a single held note: the plugin may ignore notes, the lane reads
  const clips = [];
  let t = 0;
  recipe.sections.forEach((s, i) => {
    const len = s.bars * beatsPerBar;
    clips.push(midiClip({ id: i, start: t, length: len, name: s.name, colour: COLOURS[i % COLOURS.length], notes: [{ time: 0, duration: len, pitch: 60, velocity: 100 }] }, set));
    t += len;
  });
  const track = midiTrack({ name: meta.name, colour: COLOURS[0], devicesXml: [device.xml], clipsXml: clips, envelopesXml: envelopes }, set);
  const xml = finishSet(set, [track], [limiterDevice(set).xml]);
  const out = opts.out || path.join(folder, meta.name + '.als');
  writeSet(out, xml, opts.force);
  const notes = [
    'wrote ' + out,
    '  ' + meta.name + ' (VST3, class id ' + uid.hex + ' from ' + uid.from + ')' + (built ? '' : '; the plugin is NOT BUILT under ' + folder + '/build') + (installed ? ', installed in ' + VST3_DIR : '; NOT INSTALLED in ' + VST3_DIR + ': Live cannot load it until it is (plugin.sh install, then Rescan in Live\'s Plug-Ins preferences)'),
    '  parameters on the device: ' + configure.map((p) => p.name + ' (' + p.key + ', id ' + juceParamId(p.key) + ')').join(', '),
    '  automation lanes: Device On' + Object.keys(rides).map((k) => ', ' + configure.find((p) => p.key === k).name).join(''),
    '  ' + recipe.sections.length + ' sections, ' + total / beatsPerBar + ' bars at ' + tempo + ' bpm' + (recipeFile ? ' (recipe ' + recipeFile + ')' : ' (no recipe: a sweep of the first two parameters)'),
    '  ' + (silent ? 'silent on open: the device is off until one beat into play, and off again at the end' : 'the device is ON when the Set opens'),
    '  plugin state on load: ' + allParams.map((p) => p.key + '=' + fmt(initial[p.key])).join(' '),
    'next: node live-set.mjs check "' + out + '", then open it in Live 12',
  ];
  return { out, notes };
}

// ======================================================================
// 9. LIBRARY JOB
// ======================================================================
// SFZ in (the Generative Sample Libraries' primary format), one Sampler track
// per instrument, each with a clip that walks the keys at three velocities and
// then holds a chord; the tracks' clips follow one another so the Set plays
// every instrument in turn.

function parseSfz(file) {
  const text = fs.readFileSync(file, 'utf8').replace(/\/\/[^\n]*/g, '');
  const dir = path.dirname(file);
  let control = {}, global = {}, group = {}, scope = null;
  const regions = [];
  const tokens = text.split(/(<[a-z]+>)/);
  for (let i = 1; i < tokens.length; i += 2) {
    const header = tokens[i], body = tokens[i + 1] || '';
    const ops = {};
    for (const m of body.matchAll(/([a-z_0-9]+)=(\S+)/g)) ops[m[1]] = m[2];
    if (header === '<control>') control = ops;
    else if (header === '<global>') global = ops;
    else if (header === '<group>') group = ops;
    else if (header === '<region>') regions.push(Object.assign({}, global, group, ops));
    // <master>, <curve>, <effect> are not needed here
  }
  const base = path.resolve(dir, control.default_path || '');
  return regions.map((r) => ({ file: path.resolve(base, r.sample.replace(/\\/g, '/')), ops: r }));
}
function wavFacts(file) {
  const fd = fs.openSync(file, 'r');
  const head = Buffer.alloc(12);
  fs.readSync(fd, head, 0, 12, 0);
  if (head.toString('ascii', 0, 4) !== 'RIFF' || head.toString('ascii', 8, 12) !== 'WAVE') { fs.closeSync(fd); throw new Error(file + ' is not a WAV'); }
  let pos = 12, rate = 0, channels = 0, bits = 0, dataBytes = 0;
  const size = fs.fstatSync(fd).size;
  const chunk = Buffer.alloc(8);
  while (pos + 8 <= size) {
    fs.readSync(fd, chunk, 0, 8, pos);
    const id = chunk.toString('ascii', 0, 4), len = chunk.readUInt32LE(4);
    if (id === 'fmt ') { const f = Buffer.alloc(16); fs.readSync(fd, f, 0, 16, pos + 8); channels = f.readUInt16LE(2); rate = f.readUInt32LE(4); bits = f.readUInt16LE(14); }
    if (id === 'data') dataBytes = len;
    pos += 8 + len + (len & 1);
  }
  fs.closeSync(fd);
  const frames = Math.floor(dataBytes / (channels * bits / 8));
  const st = fs.statSync(file);
  return { rate, channels, bits, frames, size: st.size, mtime: Math.floor(st.mtimeMs / 1000) };
}
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const noteName = (n) => NOTE_NAMES[n % 12] + (Math.floor(n / 12) - 2);

function instrumentFromSfz(file, setDir) {
  const regions = parseSfz(file);
  if (!regions.length) throw new Error('no regions in ' + file);
  const parts = regions.map((r) => {
    const o = r.ops;
    if (!fs.existsSync(r.file)) throw new Error('sample missing: ' + r.file + ' (named in ' + path.basename(file) + ')');
    const w = wavFacts(r.file);
    const key = o.key != null ? Number(o.key) : null;
    const keyLo = o.lokey != null ? Number(o.lokey) : (key ?? 0);
    const keyHi = o.hikey != null ? Number(o.hikey) : (key ?? 127);
    const root = o.pitch_keycenter != null ? Number(o.pitch_keycenter) : (key ?? 60);
    const loopMode = o.loop_mode || 'no_loop';
    const loop = (loopMode === 'loop_continuous' || loopMode === 'loop_sustain') && o.loop_start != null ? { start: Number(o.loop_start), end: Number(o.loop_end) } : null;
    return {
      name: path.basename(r.file, path.extname(r.file)), file: r.file, relative: path.relative(setDir, r.file).split(path.sep).join('/'),
      keyLo, keyHi, root, velLo: Math.max(1, Number(o.lovel ?? 1)), velHi: Number(o.hivel ?? 127),
      detune: Number(o.tune ?? 0) + Number(o.transpose ?? 0) * 100,
      frames: w.frames, rate: w.rate, size: w.size, mtime: w.mtime, loop,
      attack: o.ampeg_attack != null ? Number(o.ampeg_attack) : null, release: o.ampeg_release != null ? Number(o.ampeg_release) : null,
      velTrack: o.amp_veltrack != null ? Number(o.amp_veltrack) / 100 : null,
    };
  });
  const first = parts[0];
  return {
    name: path.basename(file, '.sfz'), file, parts,
    attackMs: first.attack != null ? Math.max(0.1, first.attack * 1000) : null,
    releaseMs: first.release != null ? first.release * 1000 : null,
    velTrack: first.velTrack,
    keyLo: Math.min(...parts.map((p) => p.keyLo)), keyHi: Math.max(...parts.map((p) => p.keyHi)),
    roots: [...new Set(parts.map((p) => p.root))].sort((a, b) => a - b),
  };
}

// The clip that plays an instrument: four roots across its range at three
// velocities, one beat each, then a held chord, then room for the release.
function phraseFor(inst) {
  const pick = (n) => { const r = inst.roots; if (r.length <= n) return r; return Array.from({ length: n }, (_, i) => r[Math.round(i * (r.length - 1) / (n - 1))]); };
  const roots = pick(4);
  const notes = [];
  let t = 0;
  for (const velocity of [30, 64, 110]) for (const pitch of roots) { notes.push({ time: t, duration: 0.9, pitch, velocity }); t += 1; }
  const chord = pick(3);
  for (const pitch of chord) notes.push({ time: t, duration: 8, pitch, velocity: 80 });
  return { notes, length: Math.ceil((t + 8 + 4) / 4) * 4 };
}

function libraryJob(target, opts) {
  const stat = fs.statSync(target);
  let sfzFiles;
  if (stat.isFile()) sfzFiles = [path.resolve(target)];
  else {
    sfzFiles = [];
    const walk = (dir, depth) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith('.') || e.name === 'node_modules') continue;
        const p = path.join(dir, e.name);
        if (e.isDirectory() && depth < 3) walk(p, depth + 1);
        else if (e.isFile() && e.name.toLowerCase().endsWith('.sfz')) sfzFiles.push(p);
      }
    };
    walk(path.resolve(target), 0);
    sfzFiles.sort();
  }
  if (!sfzFiles.length) throw new Error('no .sfz under ' + target);
  const out = opts.out || (stat.isFile() ? target.replace(/\.sfz$/i, '') + '.als' : path.join(target, path.basename(path.resolve(target)) + '.als'));
  const setDir = path.dirname(path.resolve(out));
  const tempo = opts.tempo || DEFAULT_TEMPO;
  const set = blankSet({ tempo });
  const tracks = [];
  const notes = ['wrote ' + out];
  let t = 0;
  sfzFiles.forEach((file, i) => {
    const inst = instrumentFromSfz(file, setDir);
    const device = samplerDevice(inst, set);
    const phrase = phraseFor(inst);
    const clip = midiClip({ id: 0, start: t, length: phrase.length, name: inst.name, colour: COLOURS[i % COLOURS.length], notes: phrase.notes }, set);
    tracks.push(midiTrack({ name: inst.name, colour: COLOURS[i % COLOURS.length], devicesXml: [device.xml], clipsXml: [clip], envelopesXml: [] }, set));
    notes.push('  ' + inst.name + ': Sampler, ' + inst.parts.length + ' samples, keys ' + noteName(inst.keyLo) + '–' + noteName(inst.keyHi) + ', ' + inst.roots.length + ' roots, ' +
      (inst.parts.filter((p) => p.loop).length) + ' looped; clip at bar ' + (t / 4 + 1) + ' (' + phrase.length / 4 + ' bars)' + (inst.releaseMs != null ? ', release ' + inst.releaseMs + ' ms' : ''));
    t += phrase.length;
  });
  const xml = finishSet(set, tracks, [limiterDevice(set).xml]);
  writeSet(out, xml, opts.force);
  notes.push('  ' + tracks.length + ' track' + (tracks.length === 1 ? '' : 's') + ', ' + t / 4 + ' bars at ' + tempo + ' bpm, a Limiter on Main; samples referenced relative to the Set and by absolute path');
  notes.push('next: node live-set.mjs check "' + out + '", then open it in Live 12');
  return { out, notes };
}

// ======================================================================
// 10. CHECK
// ======================================================================
// What a Set holds, read back from the file: the Live that wrote it, the
// tracks and their devices, clips and lanes, whether every pointee id is unique
// and below NextPointeeId, whether every sample it names is on disk, and
// whether a plugin device is on (sounding) when the Set opens.
function check(file) {
  const xml = readSet(file);
  const problems = [];
  const lines = [path.basename(file) + ': ' + (xml.match(/Creator="([^"]*)"/) || [, '?'])[1] + ', ' + Math.round(xml.length / 1024) + ' KB of XML'];
  const next = Number((xml.match(/<NextPointeeId Value="(\d+)" \/>/) || [])[1]);
  const ids = [...xml.matchAll(POINTEES)].map((m) => Number(m[2]));
  const seen = new Set(), dup = new Set();
  for (const id of ids) { if (seen.has(id)) dup.add(id); seen.add(id); }
  if (dup.size) problems.push('repeated pointee ids: ' + [...dup].slice(0, 10).join(', ') + (dup.size > 10 ? ' …' : ''));
  if (ids.some((id) => id >= next)) problems.push('pointee ids at or above NextPointeeId ' + next);
  lines.push('  pointees: ' + ids.length + ', all unique ' + (dup.size ? 'NO' : 'yes') + ', NextPointeeId ' + next);
  const tracksEl = element(xml, 'Tracks');
  const re = /<(MidiTrack|AudioTrack|ReturnTrack|GroupTrack) Id="(\d+)"/g;
  let m;
  while ((m = re.exec(tracksEl.text))) {
    const tr = element(tracksEl.text, m[1], m.index);
    const name = (tr.text.match(/<EffectiveName Value="([^"]*)" \/>/) || [, '?'])[1];
    const devices = element(tr.text, 'Devices');
    const kinds = children(devices.text).map((d) => d.tag);
    const detail = [];
    for (const d of kinds) {
      if (d === 'PluginDevice') {
        const pd = element(devices.text, 'PluginDevice');
        const pname = (pd.text.match(/<\/Preset>\s*<Name Value="([^"]*)" \/>/) || [, '?'])[1];
        const on = /<On>\s*<LomId Value="0" \/>\s*<Manual Value="true" \/>/.test(pd.text);
        const params = [...pd.text.matchAll(/<ParameterName Value="([^"]*)" \/>/g)].map((p) => p[1]).filter(Boolean);
        const installed = fs.existsSync(path.join(VST3_DIR, pname + '.vst3'));
        detail.push(pname + ' (VST3' + (installed ? ', installed' : ', NOT INSTALLED') + ', ' + (on ? 'ON when the Set opens' : 'off until played') + '; shows ' + params.join(', ') + ')');
        if (!installed) problems.push(name + ': ' + pname + '.vst3 is not in ' + VST3_DIR);
      } else if (d === 'MultiSampler' || d === 'OriginalSimpler') {
        const sd = element(devices.text, d);
        const paths = [...sd.text.matchAll(/<Path Value="([^"]*)" \/>/g)].map((p) => p[1]).filter(Boolean);
        const missing = paths.filter((p) => !fs.existsSync(p));
        detail.push((d === 'MultiSampler' ? 'Sampler' : 'Simpler') + ' (' + paths.length + ' samples' + (missing.length ? ', ' + missing.length + ' MISSING' : ', all on disk') + ')');
        for (const p of missing) problems.push(name + ': sample missing ' + p);
      } else detail.push(d);
    }
    const clips = (tr.text.match(/<MidiClip /g) || []).length + (tr.text.match(/<AudioClip /g) || []).length;
    const lanes = (tr.text.match(/<AutomationEnvelope /g) || []).length;
    const notes = (tr.text.match(/<MidiNoteEvent /g) || []).length;
    lines.push('  ' + m[1].replace('Track', '') + ' "' + name + '": ' + (detail.join(' + ') || 'no devices') + '; ' + clips + ' clip' + (clips === 1 ? '' : 's') + ', ' + notes + ' note' + (notes === 1 ? '' : 's') + ', ' + lanes + ' automation lane' + (lanes === 1 ? '' : 's'));
    const soloOrFollow = /<FollowActionEnabled Value="true" \/>/.test(tr.text);
    if (soloOrFollow) problems.push(name + ': a clip has follow actions enabled');
  }
  const main = element(xml, 'MainTrack');
  const mainDevices = children(element(main.text, 'Devices').text).map((d) => d.tag);
  const tempo = (element(main.text, 'Tempo').text.match(/<Manual Value="([^"]*)" \/>/) || [, '?'])[1];
  lines.push('  Main: ' + (mainDevices.join(' + ') || 'no devices') + ', ' + tempo + ' bpm; opens in ' + ((xml.match(/<SelectedDocumentViewInMainWindow Value="(\d)" \/>/) || [])[1] === '0' ? 'Arrangement' : 'Session') + ' view');
  for (const l of lines) console.log(l);
  if (problems.length) { console.log(''); problems.forEach((p, i) => console.log('LOOK AT ' + (i + 1) + ': ' + p)); return 1; }
  console.log('  nothing to look at');
  return 0;
}

// ======================================================================
// 11. COMMAND LINE
// ======================================================================
function main(argv) {
  const [job, target] = argv;
  const opt = (k) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : null; };
  const opts = { out: opt('--out'), recipe: opt('--recipe'), force: argv.includes('--force'), tempo: opt('--tempo') ? Number(opt('--tempo')) : null };
  if (!job || !target) {
    console.log('usage:\n  node live-set.mjs plugin  "<plugin folder>" [--recipe "<ride>.json"] [--out "<set>.als"] [--force]\n  node live-set.mjs library "<folder of .sfz | one.sfz>" [--out "<set>.als"] [--tempo N] [--force]\n  node live-set.mjs check   "<set>.als"');
    return 2;
  }
  try {
    if (job === 'plugin') { const r = pluginJob(path.resolve(target), opts); r.notes.forEach((n) => console.log(n)); return 0; }
    if (job === 'library') { const r = libraryJob(path.resolve(target), opts); r.notes.forEach((n) => console.log(n)); return 0; }
    if (job === 'check') return check(path.resolve(target));
    console.log('unknown job ' + job);
    return 2;
  } catch (err) {
    console.log('NOT WRITTEN: ' + err.message);
    return 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = main(process.argv.slice(2));
export { pluginJob, libraryJob, check, parseSfz, wavFacts, juceParamId, vst3Uid, normalise, ridePoints, juceState };
