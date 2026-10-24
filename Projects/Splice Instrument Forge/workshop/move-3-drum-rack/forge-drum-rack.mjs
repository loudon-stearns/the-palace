// forge-drum-rack -- a Live 12 Drum Rack from a kit of one-shots: a .adg preset and a Set that plays it.
//
//   node forge-drum-rack.mjs build kit.json [--out-dir .] [--force]
//   node forge-drum-rack.mjs check "<Set>.als"
//
// kit.json: { name, tempo, pads: [{ note, name, file, choke? }], pattern?: { bars, steps: { "<pad name>": "x..." } } }
// Every XML element is cloned from a file Live saved (Splice Instrument Forge, format study 2026-10-24):
//   the rack and a pad preset from Live 12's Core Library/Defaults/Slicing/Default.adg,
//   a pad's Simpler from Core Library/Defaults/Instruments/Simpler.adv,
//   a zone from the Ableton Session Writer's sample-part.xml, the Set, track, clip and Limiter from its templates,
//   and the in-Set branch shell from a Set Live 12.4.6 saved on 2026-10-24 (the first Spoiler Kit Set, saved back from Live).
// The XML craft (element, renumber, the pointee regex) is the Session Writer's, copied so this stays one file.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PALACE = '/Users/loudonstearns/Documents/The Palace';
const WRITER = path.join(PALACE, 'Shop/Shopkeeper/probes/2026-10-20-ableton-session/templates');
const STUDY = path.join(HERE, '..', 'format-study', 'xml');
const LIVE = '/Applications/Ableton Live 12 Suite.app/Contents/App-Resources/Core Library/Defaults';
const HEADER = '<Ableton MajorVersion="5" MinorVersion="12.0_12402" SchemaChangeCount="5" Creator="Ableton Live 12.4.6" Revision="0de5c8fa9a692293676cb7700a15afb2046ee1f7">';
const FIRST_TRACK_ID = 20;
// Live stores a Drum Rack pad's ReceivingNote inverted: stored = 128 - MIDI note (a factory kit's kick, stored 92, sits on C1 = 36;
// a pad written as 42 showed on D5 = 86, Loudon's ear 2026-10-24). SendingNote is not inverted: every pad read stores 60 and plays its sample at root.
const recv = (note) => 128 - note;
const POINTEES = /<(AutomationTarget|[A-Za-z]*ModulationTarget|Pointee|ControllerTargets\.\d+) Id="(\d+)"/g;

// ---- XML craft (the Session Writer's) ----
const readGz = (f) => { const b = fs.readFileSync(f); if (b[0] !== 0x1f || b[1] !== 0x8b) throw new Error(f + ' is not gzip'); return zlib.gunzipSync(b).toString('utf8'); };
const writeGz = (f, xml, force) => { if (fs.existsSync(f) && !force) throw new Error('not overwriting ' + f + ' (pass --force)'); fs.writeFileSync(f, zlib.gzipSync(Buffer.from(xml, 'utf8'))); };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const renumber = (t, ids) => t.replace(POINTEES, (a, tag) => '<' + tag + ' Id="' + (ids.pointee++) + '"');
function element(xml, tag, from = 0) {
  const open = new RegExp('<' + tag + '(?= |>|/>)', 'g'); open.lastIndex = from;
  const m = open.exec(xml); if (!m) return null;
  const start = m.index, re = new RegExp('<(/?)' + tag + '(?= |>|/>)[^>]*?(/?)>', 'g'); re.lastIndex = start;
  let depth = 0, t;
  while ((t = re.exec(xml))) {
    if (t[1]) { depth--; if (depth === 0) return { start, end: t.index + t[0].length, text: xml.slice(start, t.index + t[0].length) }; }
    else if (!t[2]) depth++;
    else if (depth === 0) return { start, end: t.index + t[0].length, text: xml.slice(start, t.index + t[0].length) };
  }
  throw new Error('unclosed <' + tag + '>');
}
const replaceEl = (xml, el, text) => xml.slice(0, el.start) + text + xml.slice(el.end);
const setValue = (t, tag, v) => { const re = new RegExp('<' + tag + ' Value="[^"]*" />'); if (!re.test(t)) throw new Error('no <' + tag + '>'); return t.replace(re, '<' + tag + ' Value="' + v + '" />'); };
const fmt = (n) => Number.isInteger(n) ? String(n) : String(Number(n.toFixed(10)));
const withId = (xml, i) => xml.replace(/^<([A-Za-z0-9]+)( Id="\d+")?/, '<$1 Id="' + i + '"');

function wavFacts(file) {
  const fd = fs.openSync(file, 'r'); const head = Buffer.alloc(12); fs.readSync(fd, head, 0, 12, 0);
  if (head.toString('ascii', 0, 4) !== 'RIFF' || head.toString('ascii', 8, 12) !== 'WAVE') throw new Error(file + ' is not a WAV');
  let pos = 12, rate = 0, channels = 0, bits = 0, dataBytes = 0; const size = fs.fstatSync(fd).size, chunk = Buffer.alloc(8);
  while (pos + 8 <= size) {
    fs.readSync(fd, chunk, 0, 8, pos); const id = chunk.toString('ascii', 0, 4), len = chunk.readUInt32LE(4);
    if (id === 'fmt ') { const f = Buffer.alloc(16); fs.readSync(fd, f, 0, 16, pos + 8); channels = f.readUInt16LE(2); rate = f.readUInt32LE(4); bits = f.readUInt16LE(14); }
    if (id === 'data') dataBytes = len; pos += 8 + len + (len & 1);
  }
  fs.closeSync(fd); const st = fs.statSync(file);
  return { rate, channels, bits, frames: Math.floor(dataBytes / (channels * bits / 8)), size: st.size, mtime: Math.floor(st.mtimeMs / 1000) };
}

// ---- the pad: Live's default Simpler holding one zone, the whole key range, root 60 ----
function padSimpler(pad, setDir) {
  let d = element(readGz(path.join(LIVE, 'Instruments/Simpler.adv')), 'OriginalSimpler').text;
  d = d.replace(/<LastPresetRef>[\s\S]*?<\/LastPresetRef>/, '<LastPresetRef>\n<Value />\n</LastPresetRef>');
  d = d.replace(/<UserName Value="[^"]*" \/>/, '<UserName Value="' + esc(pad.name) + '" />');
  const w = wavFacts(pad.abs);
  let p = fs.readFileSync(path.join(WRITER, 'sample-part.xml'), 'utf8').trim();
  p = p.replace(/<Name Value="[^"]*" \/>/, '<Name Value="' + esc(path.basename(pad.abs, '.wav')) + '" />');
  p = setValue(p, 'RootKey', 60).replace(/<SampleEnd Value="\d+" \/>/, '<SampleEnd Value="' + (w.frames - 1) + '" />');
  for (const tag of ['SustainLoop', 'ReleaseLoop']) { const el = element(p, tag); p = replaceEl(p, el, '<' + tag + '>\n<Start Value="0" />\n<End Value="' + (w.frames - 1) + '" />\n<Mode Value="' + (tag === 'SustainLoop' ? 0 : 3) + '" />\n<Crossfade Value="0" />\n<Detune Value="0" />\n</' + tag + '>'); }
  const rel = path.relative(setDir, pad.abs).split(path.sep).join('/');
  const ref = element(p, 'SampleRef');
  p = replaceEl(p, ref, '<SampleRef>\n<FileRef>\n<RelativePathType Value="1" />\n<RelativePath Value="' + esc(rel) + '" />\n<Path Value="' + esc(pad.abs) + '" />\n<Type Value="2" />\n<LivePackName Value="" />\n<LivePackId Value="" />\n<OriginalFileSize Value="' + w.size + '" />\n<OriginalCrc Value="0" />\n<SourceHint Value="" />\n</FileRef>\n<LastModDate Value="' + w.mtime + '" />\n<SourceContext />\n<SampleUsageHint Value="0" />\n<DefaultDuration Value="' + w.frames + '" />\n<DefaultSampleRate Value="' + w.rate + '" />\n<SamplesToAutoWarp Value="0" />\n</SampleRef>');
  d = d.replace(/<SampleParts \/>/, '<SampleParts>\n' + p + '\n</SampleParts>');
  return { xml: d, facts: w };
}

// ---- the preset: Slicing/Default.adg's GroupDevicePreset with one DrumBranchPreset per pad ----
function buildAdg(kit, pads, setDir) {
  let adg = readGz(path.join(LIVE, 'Slicing/Default.adg'));
  const presets = element(adg, 'BranchPresets');
  const shell = element(presets.text, 'DrumBranchPreset').text;
  const branches = pads.map((pad, i) => {
    let b = shell.replace(/^<DrumBranchPreset Id="\d+"/, '<DrumBranchPreset Id="' + i + '"');
    b = b.replace(/<Name Value="[^"]*" \/>/, '<Name Value="' + esc(pad.name) + '" />');
    const zs = element(b, 'ZoneSettings');
    b = replaceEl(b, zs, '<ZoneSettings>\n<ReceivingNote Value="' + recv(pad.note) + '" />\n<SendingNote Value="60" />\n<ChokeGroup Value="' + (pad.choke || 0) + '" />\n</ZoneSettings>');
    const simp = element(b, 'OriginalSimpler');
    b = replaceEl(b, simp, withId(padSimpler(pad, setDir).xml, 0));
    b = b.replace(/<BrowserContentPath Value="[^"]*" \/>/, '<BrowserContentPath Value="" />');
    return b;
  });
  adg = replaceEl(adg, presets, '<BranchPresets>\n' + branches.join('\n') + '\n</BranchPresets>');
  adg = adg.replace(/<UserName Value="Built-In" \/>/, '<UserName Value="' + esc(kit.name) + '" />').replace(/<Annotation Value="Created by: [^"]*" \/>/, '<Annotation Value="Splice Instrument Forge" />');
  return adg;
}

// ---- the Set: the writer's blank, one MIDI track holding the rack as a DrumGroupDevice with DrumBranches ----
function buildAls(kit, pads, setDir) {
  let xml = readGz(path.join(WRITER, 'blank-set.als')).replace(/<Ableton [^>]*>/, HEADER);
  xml = replaceEl(xml, element(xml, 'Tracks'), '<Tracks>\n</Tracks>');
  xml = xml.replace(/<SendsPre>[\s\S]*?<\/SendsPre>/, '<SendsPre />').replace(/<Sends>[\s\S]*?<\/Sends>/g, '<Sends />');
  xml = xml.replace(/<SelectedDocumentViewInMainWindow Value="\d" \/>/, '<SelectedDocumentViewInMainWindow Value="0" />');
  const tempo = kit.tempo || 120;
  let main = element(xml, 'MainTrack'); const tempoEl = element(main.text, 'Tempo');
  let mainText = replaceEl(main.text, tempoEl, tempoEl.text.replace(/<Manual Value="[^"]*" \/>/, '<Manual Value="' + tempo + '" />'));
  const tempoTarget = (tempoEl.text.match(/<AutomationTarget Id="(\d+)"/) || [])[1];
  mainText = mainText.replace(/<AutomationEnvelope Id="\d+">\s*<EnvelopeTarget>\s*<PointeeId Value="(\d+)" \/>[\s\S]*?<\/AutomationEnvelope>/g, (lane, p) => p === tempoTarget ? lane.replace(/<FloatEvent Id="(\d+)" Time="([^"]+)" Value="[^"]*" \/>/g, '<FloatEvent Id="$1" Time="$2" Value="' + tempo + '" />') : lane);
  xml = replaceEl(xml, main, mainText);
  const ids = { pointee: Number(xml.match(/<NextPointeeId Value="(\d+)" \/>/)[1]), track: FIRST_TRACK_ID };
  const scenes = (xml.match(/<Scene Id=/g) || []).length;

  // the rack device: Live 12's DrumGroupDevice from the .adg (Branches empty), filled with Live 11-shaped DrumBranches
  let rack = element(readGz(path.join(LIVE, 'Slicing/Default.adg')), 'DrumGroupDevice').text;
  rack = rack.replace(/<LastPresetRef>[\s\S]*?<\/LastPresetRef>/, '<LastPresetRef>\n<Value />\n</LastPresetRef>');
  rack = rack.replace(/<UserName Value="[^"]*" \/>/, '<UserName Value="' + esc(kit.name) + '" />').replace(/<Annotation Value="[^"]*" \/>/, '<Annotation Value="" />');
  const branchShell = fs.readFileSync(path.join(STUDY, 'Live12 DrumBranch shell.xml'), 'utf8').trim();
  const branches = pads.map((pad, i) => {
    let b = branchShell.replace(/^<DrumBranch Id="\d+"/, '<DrumBranch Id="' + i + '"');
    b = b.replace(/<EffectiveName Value="[^"]*" \/>/, '<EffectiveName Value="' + esc(pad.name) + '" />').replace(/<UserName Value="[^"]*" \/>/, '<UserName Value="' + esc(pad.name) + '" />');
    b = b.replace(/<IsSelected Value="true" \/>/, '<IsSelected Value="' + (i === 0 ? 'true' : 'false') + '" />');
    b = b.replace('<!--DEVICE-->', withId(padSimpler(pad, setDir).xml, 0));
    const bi = element(b, 'BranchInfo');
    b = replaceEl(b, bi, '<BranchInfo>\n<ReceivingNote Value="' + recv(pad.note) + '" />\n<SendingNote Value="60" />\n<ChokeGroup Value="' + (pad.choke || 0) + '" />\n</BranchInfo>');
    return b;
  });
  rack = rack.replace(/<Branches \/>/, '<Branches>\n' + branches.join('\n') + '\n</Branches>');
  if (!rack.includes('<DrumBranch ')) throw new Error('the rack shell had no empty <Branches /> to fill');
  rack = renumber(withId(rack, 0), ids);

  // the clip: the kit's pattern, or one hit per pad
  const beatsPerBar = 4, bars = kit.pattern?.bars || 2, stepsPerBar = 16, notes = [];
  if (kit.pattern) {
    for (const pad of pads) {
      const row = kit.pattern.steps[pad.name]; if (!row) continue;
      [...row].forEach((ch, s) => { if (ch === 'x') notes.push({ time: s * beatsPerBar / stepsPerBar, duration: 0.2, pitch: pad.note, velocity: 100 }); });
    }
  } else pads.forEach((pad, i) => notes.push({ time: i, duration: 0.5, pitch: pad.note, velocity: 100 }));
  const length = bars * beatsPerBar;
  let c = fs.readFileSync(path.join(WRITER, 'midi-clip.xml'), 'utf8').trim();
  c = c.replace(/^<MidiClip Id="\d+" Time="[^"]+">/, '<MidiClip Id="0" Time="0">');
  c = setValue(c, 'CurrentStart', 0).replace(/<CurrentEnd Value="[^"]*" \/>/, '<CurrentEnd Value="' + fmt(length) + '" />');
  c = replaceEl(c, element(c, 'Loop'), '<Loop>\n<LoopStart Value="0" />\n<LoopEnd Value="' + fmt(length) + '" />\n<StartRelative Value="0" />\n<LoopOn Value="false" />\n<OutMarker Value="' + fmt(length) + '" />\n<HiddenLoopStart Value="0" />\n<HiddenLoopEnd Value="' + fmt(length) + '" />\n</Loop>');
  c = c.replace(/<Name Value="[^"]*" \/>/, '<Name Value="' + esc(kit.name) + '" />');
  c = c.replace(/<ScrollerTimePreserver>[\s\S]*?<\/ScrollerTimePreserver>/, '<ScrollerTimePreserver>\n<LeftTime Value="0" />\n<RightTime Value="' + fmt(length) + '" />\n</ScrollerTimePreserver>').replace(/<TimeSelection>[\s\S]*?<\/TimeSelection>/, '<TimeSelection>\n<AnchorTime Value="0" />\n<OtherTime Value="0" />\n</TimeSelection>');
  const byPitch = new Map(); let noteId = 1;
  for (const n of notes.sort((a, b) => a.time - b.time)) { if (!byPitch.has(n.pitch)) byPitch.set(n.pitch, []); byPitch.get(n.pitch).push('<MidiNoteEvent Time="' + fmt(n.time) + '" Duration="' + fmt(n.duration) + '" Velocity="' + n.velocity + '" OffVelocity="64" NoteId="' + (noteId++) + '" />'); }
  const keyTracks = [...byPitch.entries()].sort((a, b) => a[0] - b[0]).map(([pitch, ev], i) => '<KeyTrack Id="' + i + '">\n<Notes>\n' + ev.join('\n') + '\n</Notes>\n<MidiKey Value="' + pitch + '" />\n</KeyTrack>').join('\n');
  c = c.replace(/<KeyTracks \/>/, '<KeyTracks>\n' + keyTracks + '\n</KeyTracks>').replace(/<NoteIdGenerator>[\s\S]*?<\/NoteIdGenerator>/, '<NoteIdGenerator>\n<NextId Value="' + noteId + '" />\n</NoteIdGenerator>');

  // the track
  let t = fs.readFileSync(path.join(WRITER, 'midi-track.xml'), 'utf8').trim();
  t = t.replace(/^<MidiTrack Id="\d+"/, '<MidiTrack Id="' + (ids.track++) + '"');
  t = renumber(t, ids);
  const nameEl = element(t, 'Name');
  t = replaceEl(t, nameEl, nameEl.text.replace(/<EffectiveName Value="[^"]*" \/>/, '<EffectiveName Value="' + esc(kit.name) + '" />').replace(/<UserName Value="[^"]*" \/>/, '<UserName Value="' + esc(kit.name) + '" />'));
  t = t.replace(/<Color Value="\d+" \/>/, '<Color Value="17" />');
  t = t.replace(/<AutomationEnvelopes>[\s\S]*?<\/AutomationEnvelopes>/, '<AutomationEnvelopes>\n<Envelopes />\n</AutomationEnvelopes>');
  t = replaceEl(t, element(t, 'Devices'), '<Devices>\n' + rack + '\n</Devices>');
  const arr = element(t, 'ArrangerAutomation');
  t = replaceEl(t, arr, arr.text.replace(/<Events \/>/, '<Events>\n' + c + '\n</Events>'));
  t = t.replace(/<ClipSlotList>[\s\S]*?<\/ClipSlotList>/g, (all) => { const slot = element(all, 'ClipSlot').text; const slots = []; for (let i = 0; i < scenes; i++) slots.push(slot.replace(/^<ClipSlot Id="\d+">/, '<ClipSlot Id="' + i + '">')); return '<ClipSlotList>\n' + slots.join('\n') + '\n</ClipSlotList>'; });

  // the Limiter on Main, and the counter written back
  let lim = element(readGz(path.join(WRITER, 'Limiter.adv')), 'Limiter').text;
  lim = lim.replace(/<LastPresetRef>[\s\S]*?<\/LastPresetRef>/, '<LastPresetRef>\n<Value />\n</LastPresetRef>');
  lim = replaceEl(lim, element(lim, 'Ceiling'), element(lim, 'Ceiling').text.replace(/<Manual Value="[^"]*" \/>/, '<Manual Value="-1" />'));
  lim = renumber(lim, ids);
  xml = replaceEl(xml, element(xml, 'Tracks'), '<Tracks>\n' + t + '\n</Tracks>');
  main = element(xml, 'MainTrack');
  xml = replaceEl(xml, main, replaceEl(main.text, element(main.text, 'Devices'), '<Devices>\n' + withId(lim, 0) + '\n</Devices>'));
  xml = xml.replace(/<NextPointeeId Value="\d+" \/>/, '<NextPointeeId Value="' + ids.pointee + '" />');
  return xml;
}

function check(file) {
  const xml = readGz(file);
  const next = Number(xml.match(/<NextPointeeId Value="(\d+)" \/>/)[1]);
  const ids = [...xml.matchAll(POINTEES)].map((m) => Number(m[2])); const seen = new Set(), dup = new Set();
  for (const id of ids) { if (seen.has(id)) dup.add(id); seen.add(id); }
  const problems = [];
  if (dup.size) problems.push('repeated pointee ids: ' + [...dup].slice(0, 10).join(', '));
  if (ids.some((id) => id >= next)) problems.push('pointee ids at or above NextPointeeId');
  console.log(path.basename(file) + ': ' + xml.match(/Creator="([^"]*)"/)[1] + ', ' + Math.round(xml.length / 1024) + ' KB of XML; pointees ' + ids.length + ', all unique ' + (dup.size ? 'NO' : 'yes') + ', NextPointeeId ' + next);
  const racks = [...xml.matchAll(/<DrumGroupDevice Id="\d+">/g)];
  for (const r of racks) {
    const rack = element(xml, 'DrumGroupDevice', r.index).text;
    const name = (rack.match(/<UserName Value="([^"]*)" \/>/) || [, '?'])[1];
    const branches = element(rack, 'Branches').text; const re = /<DrumBranch Id="\d+">/g; let b; const pads = [];
    while ((b = re.exec(branches))) {
      const br = element(branches, 'DrumBranch', b.index).text;
      const pname = br.match(/<EffectiveName Value="([^"]*)" \/>/)[1], note = br.match(/<ReceivingNote Value="(\d+)" \/>/)[1], choke = br.match(/<ChokeGroup Value="(\d+)" \/>/)[1];
      const paths = [...br.matchAll(/<Path Value="([^"]*)" \/>/g)].map((p) => p[1]).filter(Boolean);
      const missing = paths.filter((p) => !fs.existsSync(p)); for (const p of missing) problems.push(pname + ': sample missing ' + p);
      pads.push(pname + '@' + (128 - Number(note)) + ' (stored ' + note + ')' + (choke !== '0' ? ' choke' + choke : '') + (missing.length ? ' MISSING' : ''));
    }
    console.log('  Drum Rack "' + name + '": ' + pads.length + ' pads: ' + pads.join(', '));
  }
  if (!racks.length) console.log('  no Drum Rack');
  console.log('  notes: ' + (element(xml, 'Tracks').text.match(/<MidiNoteEvent /g) || []).length + '; tempo ' + element(element(xml, 'MainTrack').text, 'Tempo').text.match(/<Manual Value="([^"]*)" \/>/)[1]);
  if (problems.length) { problems.forEach((p, i) => console.log('LOOK AT ' + (i + 1) + ': ' + p)); return 1; }
  console.log('  nothing to look at'); return 0;
}

const argv = process.argv.slice(2);
if (argv[0] === 'check') process.exit(check(path.resolve(argv[1])));
if (argv[0] !== 'build') { console.log('usage: build kit.json [--out-dir dir] [--force] | check set.als'); process.exit(2); }
const kitFile = path.resolve(argv[1]); const kit = JSON.parse(fs.readFileSync(kitFile, 'utf8'));
const outDir = argv.includes('--out-dir') ? path.resolve(argv[argv.indexOf('--out-dir') + 1]) : path.dirname(kitFile);
const force = argv.includes('--force');
const pads = kit.pads.map((p) => ({ ...p, abs: path.resolve(path.dirname(kitFile), p.file) }));
for (const p of pads) if (!fs.existsSync(p.abs)) throw new Error('sample missing: ' + p.abs);
const adgOut = path.join(outDir, kit.name + '.adg'), alsOut = path.join(outDir, kit.name + '.als');
writeGz(adgOut, buildAdg(kit, pads, outDir), force);
writeGz(alsOut, buildAls(kit, pads, outDir), force);
console.log('wrote ' + adgOut + ' and ' + alsOut + ' (' + pads.length + ' pads)');
console.log('next: node forge-drum-rack.mjs check "' + alsOut + '", then open it in Live 12');
