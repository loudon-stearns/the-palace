// forge-session -- a Live 12 Session View Set from a stack of loops: one audio track per layer, one scene per
// arrangement, each scene's slots holding the layers that play in it, warped to the Set's tempo.
//
//   node forge-session.mjs build stack.json [--out-dir .] [--force]
//   node forge-session.mjs check "<Set>.als"
//
// stack.json: { name, tempo, layers: [{ role, file, bpm }], scenes: [{ name, play: [role, …] }] }
// Every element is one Live saved (Splice Instrument Forge, move four, 2026-10-24): the Set, scene and Limiter from
// the Ableton Session Writer's templates (Live 12.1's DefaultLiveSet with a 12.4.6 header), the audio track from that
// same default Set, the audio clip from a Set Live 12.4.6 saved (Loudon's "Impact Granular.als"); the slot shape is
// GoButton's (ltc-generator.js). The XML craft is the Session Writer's, copied so this stays one file.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WRITER = '/Users/loudonstearns/Documents/The Palace/Shop/Shopkeeper/probes/2026-10-20-ableton-session/templates';
const STUDY = path.join(HERE, '..', 'format-study', 'xml');
const HEADER = '<Ableton MajorVersion="5" MinorVersion="12.0_12402" SchemaChangeCount="5" Creator="Ableton Live 12.4.6" Revision="0de5c8fa9a692293676cb7700a15afb2046ee1f7">';
const FIRST_TRACK_ID = 20;
const COLOURS = [12, 2, 8, 17, 24, 36, 50, 60];
// ---- key matching: every keyed layer is transposed to the stack's key by the shortest road (within six semitones) ----
const PC = { c: 0, 'c#': 1, db: 1, d: 2, 'd#': 3, eb: 3, e: 4, f: 5, 'f#': 6, gb: 6, g: 7, 'g#': 8, ab: 8, a: 9, 'a#': 10, bb: 10, b: 11 };
function parseKey(k) {            // "a# minor" | "C#" | "f" | "Cmaj" -> { pc, minor } | null
  if (!k) return null; const m = String(k).trim().toLowerCase().match(/^([a-g][#b]?)\s*(min|minor|m\b|maj|major)?/); if (!m || !(m[1] in PC)) return null;
  const mode = !m[2] ? null : (/maj/.test(m[2]) ? 'major' : 'minor');      // a bare letter from Splice has no mode: keep it a root, never guess
  return { pc: PC[m[1]], minor: mode === 'minor', mode, name: m[1].toUpperCase().replace('B', 'b').replace(/^(.)B/, '$1b') + (m[2] ? (/maj/.test(m[2]) ? ' major' : ' minor') : '') };
}
function semitonesTo(from, to) {
  // a relative pair shares its notes: C major against A minor needs no move, so compare the minor-equivalent roots
  const root = (k) => k.minor ? k.pc : (k.pc + 9) % 12;           // a major key's relative minor root
  const both = from.mode && to.mode && from.mode !== to.mode;       // only two known, differing modes compare by relative minor
  const f = both ? root(from) : from.pc, t = both ? root(to) : to.pc;
  let d = ((t - f) % 12 + 12) % 12; if (d > 6) d -= 12; return d;
}

// ---- levels: Loudon's grounds (2026-10-24). Foreground -4 dB: drums and bass. Middleground -8: vocals and leads.
// Background -12: percussion, pads, strings, fx, everything else. A layer may name its own "ground" or "db". ----
const GROUNDS = { foreground: -4, middleground: -8, background: -12 };
function groundFor(role) {
  const r = role.toLowerCase();
  if (/drum|kick|beat|groove|bass|sub|808/.test(r)) return 'foreground';
  if (/voc|vox|lead|hook|melod|synth|keys|chord|guitar|piano/.test(r)) return 'middleground';
  return 'background';
}
const dbToAmp = (db) => Math.pow(10, db / 20);   // Live's mixer Volume Manual is linear amplitude: 1 = 0 dB, 1.995 = +6 dB, 0.000316 = -70 dB

const POINTEES = /<(AutomationTarget|[A-Za-z]*ModulationTarget|Pointee|ControllerTargets\.\d+) Id="(\d+)"/g;

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

// ---- an audio clip in a slot: the loop warped so its native bars land on the Set's grid ----
function audioClip({ name, colour, abs, rel, bpm, transpose = 0, setTempo, isDrums = false }, id) {
  const w = wavFacts(abs);
  const seconds = w.frames / w.rate;
  const beats = Math.max(1, Math.round(seconds * bpm / 60));       // the loop's own length in beats at its native tempo
  let c = fs.readFileSync(path.join(STUDY, 'Live12 arrangement AudioClip.xml'), 'utf8').trim();
  c = c.replace(/^<AudioClip Id="\d+" Time="[^"]+">/, '<AudioClip Id="' + id + '" Time="0">');
  c = setValue(c, 'CurrentStart', 0).replace(/<CurrentEnd Value="[^"]*" \/>/, '<CurrentEnd Value="' + beats + '" />');
  c = replaceEl(c, element(c, 'Loop'), '<Loop>\n<LoopStart Value="0" />\n<LoopEnd Value="' + beats + '" />\n<StartRelative Value="0" />\n<LoopOn Value="true" />\n<OutMarker Value="' + beats + '" />\n<HiddenLoopStart Value="0" />\n<HiddenLoopEnd Value="' + beats + '" />\n</Loop>');
  c = c.replace(/<Name Value="[^"]*" \/>/, '<Name Value="' + esc(name) + '" />').replace(/<Color Value="-?\d+" \/>/, '<Color Value="' + colour + '" />');
  c = c.replace(/<Envelopes>[\s\S]*?<\/Envelopes>/, '<Envelopes>\n<Envelopes />\n</Envelopes>');
  c = c.replace(/<ScrollerTimePreserver>[\s\S]*?<\/ScrollerTimePreserver>/, '<ScrollerTimePreserver>\n<LeftTime Value="0" />\n<RightTime Value="' + beats + '" />\n</ScrollerTimePreserver>').replace(/<TimeSelection>[\s\S]*?<\/TimeSelection>/, '<TimeSelection>\n<AnchorTime Value="0" />\n<OtherTime Value="0" />\n</TimeSelection>');
  c = c.replace(/<FollowActionEnabled Value="true" \/>/, '<FollowActionEnabled Value="false" />');
  // Loudon's rule (2026-10-24): find before you bend. A drum loop that must stretch goes in Beats mode (0); anything else that
  // stretches or transposes goes in Complex (4). A loop already at the Set's tempo and in key is warped only to lock the grid;
  // Beats mode then changes nothing audible, so it gets Beats too.
  const stretched = setTempo != null && Math.abs(bpm - setTempo) > 0.5;      // warped by any difference
  const bent = setTempo != null && Math.abs(bpm - setTempo) > 1.5;           // but a bend worth naming is more than 1 bpm
  const warpMode = (isDrums || (!stretched && !transpose)) ? 0 : 4;
  c = setValue(c, 'IsWarped', 'true').replace(/<WarpMode Value="\d+" \/>/, '<WarpMode Value="' + warpMode + '" />');
  c = replaceEl(c, element(c, 'SampleRef'), '<SampleRef>\n<FileRef>\n<RelativePathType Value="1" />\n<RelativePath Value="' + esc(rel) + '" />\n<Path Value="' + esc(abs) + '" />\n<Type Value="2" />\n<LivePackName Value="" />\n<LivePackId Value="" />\n<OriginalFileSize Value="' + w.size + '" />\n<OriginalCrc Value="0" />\n<SourceHint Value="" />\n</FileRef>\n<LastModDate Value="' + w.mtime + '" />\n<SourceContext />\n<SampleUsageHint Value="0" />\n<DefaultDuration Value="' + w.frames + '" />\n<DefaultSampleRate Value="' + w.rate + '" />\n<SamplesToAutoWarp Value="0" />\n</SampleRef>');
  c = c.replace(/<Onsets>[\s\S]*?<\/Onsets>/, '<Onsets>\n<UserOnsets />\n<HasUserOnsets Value="false" />\n</Onsets>');
  c = replaceEl(c, element(c, 'WarpMarkers'), '<WarpMarkers>\n<WarpMarker Id="0" SecTime="0" BeatTime="0" />\n<WarpMarker Id="1" SecTime="' + fmt(seconds) + '" BeatTime="' + beats + '" />\n</WarpMarkers>');
  c = c.replace(/<SavedWarpMarkersForStretched>[\s\S]*?<\/SavedWarpMarkersForStretched>/, '<SavedWarpMarkersForStretched />');
  c = c.replace(/<PitchCoarse Value="-?\d+" \/>/, '<PitchCoarse Value="' + transpose + '" />').replace(/<PitchFine Value="-?\d+" \/>/, '<PitchFine Value="0" />');
  c = c.replace(/<SampleVolume Value="[^"]*" \/>/, '<SampleVolume Value="1" />');   // clip gain 0 dB: the shell carried +3.1 dB from the Set it came from (Loudon heard the distortion, 2026-10-24)
  c = setValue(c, 'MarkersGenerated', 'false').replace(/<IsSongTempoLeader Value="true" \/>/, '<IsSongTempoLeader Value="false" />');
  return { xml: c, beats, seconds, facts: w, stretched, bent, warpMode };
}

function build(stack, layers, outDir) {
  let xml = readGz(path.join(WRITER, 'blank-set.als')).replace(/<Ableton [^>]*>/, HEADER);
  xml = replaceEl(xml, element(xml, 'Tracks'), '<Tracks>\n</Tracks>');
  xml = xml.replace(/<SendsPre>[\s\S]*?<\/SendsPre>/, '<SendsPre />').replace(/<Sends>[\s\S]*?<\/Sends>/g, '<Sends />');
  xml = xml.replace(/<SelectedDocumentViewInMainWindow Value="\d" \/>/, '<SelectedDocumentViewInMainWindow Value="1" />');   // Session view
  const tempo = stack.tempo || 120;
  let main = element(xml, 'MainTrack'); const tempoEl = element(main.text, 'Tempo');
  let mainText = replaceEl(main.text, tempoEl, tempoEl.text.replace(/<Manual Value="[^"]*" \/>/, '<Manual Value="' + tempo + '" />'));
  const tempoTarget = (tempoEl.text.match(/<AutomationTarget Id="(\d+)"/) || [])[1];
  mainText = mainText.replace(/<AutomationEnvelope Id="\d+">\s*<EnvelopeTarget>\s*<PointeeId Value="(\d+)" \/>[\s\S]*?<\/AutomationEnvelope>/g, (lane, p) => p === tempoTarget ? lane.replace(/<FloatEvent Id="(\d+)" Time="([^"]+)" Value="[^"]*" \/>/g, '<FloatEvent Id="$1" Time="$2" Value="' + tempo + '" />') : lane);
  xml = replaceEl(xml, main, mainText);
  const ids = { pointee: Number(xml.match(/<NextPointeeId Value="(\d+)" \/>/)[1]), track: FIRST_TRACK_ID };

  // scenes: the blank's first scene cloned per arrangement, named
  const scenesEl = element(xml, 'Scenes'); const sceneShell = element(scenesEl.text, 'Scene').text;
  const scenes = stack.scenes.map((s, i) => sceneShell.replace(/^<Scene Id="\d+">/, '<Scene Id="' + i + '">').replace(/<Name Value="[^"]*" \/>/, '<Name Value="' + esc(s.name) + '" />').replace(/<Tempo Value="[^"]*" \/>/, '<Tempo Value="' + tempo + '" />'));
  xml = replaceEl(xml, scenesEl, '<Scenes>\n' + scenes.join('\n') + '\n</Scenes>');

  // one audio track per layer, its session slots filled where the layer plays
  const keyed = layers.map((l) => ({ l, k: parseKey(l.key) })).filter((x) => x.k);
  const target = parseKey(stack.key) || (keyed.find((x) => /bass/i.test(x.l.role)) || keyed[0] || {}).k || null;
  const trackShell = fs.readFileSync(path.join(STUDY, 'Live12 AudioTrack shell (from DefaultLiveSet).xml'), 'utf8').trim();
  const report = []; let bent = 0;
  const tracks = layers.map((layer, li) => {
    let t = trackShell.replace(/^<AudioTrack Id="\d+"/, '<AudioTrack Id="' + (ids.track++) + '"');
    t = renumber(t, ids);
    const nameEl = element(t, 'Name');
    t = replaceEl(t, nameEl, nameEl.text.replace(/<EffectiveName Value="[^"]*" \/>/, '<EffectiveName Value="' + esc(layer.role) + '" />').replace(/<UserName Value="[^"]*" \/>/, '<UserName Value="' + esc(layer.role) + '" />').replace(/<MemorizedFirstClipName Value="[^"]*" \/>/, '<MemorizedFirstClipName Value="" />'));
    const colour = COLOURS[li % COLOURS.length];
    t = t.replace(/<Color Value="\d+" \/>/, '<Color Value="' + colour + '" />');
    t = t.replace(/<Sends>[\s\S]*?<\/Sends>/g, '<Sends />');
    t = t.replace(/<AutomationEnvelopes>[\s\S]*?<\/AutomationEnvelopes>/, '<AutomationEnvelopes>\n<Envelopes />\n</AutomationEnvelopes>');
    const k = parseKey(layer.key); const transpose = (k && target) ? semitonesTo(k, target) : 0;
    const ground = layer.ground || groundFor(layer.role); const db = layer.db != null ? layer.db : GROUNDS[ground];
    const mixer = element(t, 'Mixer'); const vol = element(mixer.text, 'Volume');
    t = replaceEl(t, mixer, replaceEl(mixer.text, vol, vol.text.replace(/<Manual Value="[^"]*" \/>/, '<Manual Value="' + fmt(dbToAmp(db)) + '" />')));
    const isDrums = /drum|kick|beat|groove|perc/i.test(layer.role);
    const clip = audioClip({ name: layer.role, colour, abs: layer.abs, rel: path.relative(outDir, layer.abs).split(path.sep).join('/'), bpm: layer.bpm || tempo, transpose, setTempo: tempo, isDrums }, 0);
    const bend = (clip.stretched ? 'stretched ' + (layer.bpm || tempo) + '->' + tempo : 'native tempo') + ', ' + (k ? (transpose ? 'transposed ' + k.name + ' -> ' + target.name + ' (' + (transpose > 0 ? '+' : '') + transpose + ' st)' : k.name + ' in key') : 'unkeyed') + ', ' + (clip.warpMode === 0 ? 'Beats' : 'Complex');
    report.push(layer.role.padEnd(10) + clip.beats + ' beats; ' + bend + '; ' + ground + ' ' + db + ' dB');
    bent += (clip.bent ? 1 : 0) + (transpose ? 1 : 0);
    // the arrangement: the same clip laid along the timeline once per section the layer plays in, looping to fill it
    let at = 0, arrId = 0; const arrClips = [];
    for (const sc of stack.scenes) {
      const len = (sc.bars || 8) * 4;
      if (sc.play.includes(layer.role)) {
        let a = clip.xml.replace(/^<AudioClip Id="\d+" Time="[^"]+">/, '<AudioClip Id="' + (arrId++) + '" Time="' + fmt(at) + '">');
        a = setValue(a, 'CurrentStart', fmt(at)).replace(/<CurrentEnd Value="[^"]*" \/>/, '<CurrentEnd Value="' + fmt(at + len) + '" />');
        arrClips.push(a);
      }
      at += len;
    }
    const sampleEl = element(t, 'Sample'); const arr = element(sampleEl.text, 'ArrangerAutomation');
    t = replaceEl(t, sampleEl, replaceEl(sampleEl.text, arr, arr.text.replace(/<Events \/>/, arrClips.length ? '<Events>\n' + arrClips.join('\n') + '\n</Events>' : '<Events />')));
    // take lanes: every alternate the recipe names becomes a lane on this track (Loudon, 2026-10-24: "enable different takes to
    // create my own variations"), its clip laid across the same sections as the main lane's. Shape from his "All in takes" Set.
    const alts = layer.alternates || [];
    if (alts.length) {
      const laneShell = fs.readFileSync(path.join(STUDY, 'Live12 TakeLane shell.xml'), 'utf8').trim();
      const lanes = alts.map((alt, ai) => {
        const ak = parseKey(alt.key); const atr = (ak && target) ? semitonesTo(ak, target) : 0;
        const aclip = audioClip({ name: layer.role + ' alt ' + (ai + 1), colour, abs: alt.abs, rel: path.relative(outDir, alt.abs).split(path.sep).join('/'), bpm: alt.bpm || tempo, transpose: atr, setTempo: tempo, isDrums }, 0);
        let pos = 0, id = 0; const clips = [];
        for (const sc of stack.scenes) { const len = (sc.bars || 8) * 4; if (sc.play.includes(layer.role)) { let a = aclip.xml.replace(/^<AudioClip Id="\d+" Time="[^"]+">/, '<AudioClip Id="' + (id++) + '" Time="' + fmt(pos) + '">'); a = setValue(a, 'CurrentStart', fmt(pos)).replace(/<CurrentEnd Value="[^"]*" \/>/, '<CurrentEnd Value="' + fmt(pos + len) + '" />'); clips.push(a); } pos += len; }
        const short = path.basename(alt.abs, path.extname(alt.abs)).replace(/_/g, ' ').slice(0, 40);
        report.push('  take ' + (ai + 1) + ': ' + short + (ak ? (atr ? ' transposed ' + (atr > 0 ? '+' : '') + atr : ' in key') : '') + (aclip.bent ? ' stretched ' + alt.bpm + '->' + tempo : ''));
        bent += (aclip.bent ? 1 : 0) + (atr ? 1 : 0);
        let l = laneShell.replace(/^<TakeLane Id="\d+">/, '<TakeLane Id="' + ai + '">').replace(/<Name Value="[^"]*" \/>/, '<Name Value="' + esc('Take ' + (ai + 1) + ': ' + short) + '" />');
        return l.replace('<!--CLIP-->', clips.join('\n'));
      });
      t = t.replace(/<TakeLanes>\s*<TakeLanes \/>\s*<AreTakeLanesFolded Value="[^"]*" \/>\s*<\/TakeLanes>/, '<TakeLanes>\n<TakeLanes>\n' + lanes.join('\n') + '\n</TakeLanes>\n<AreTakeLanesFolded Value="false" />\n</TakeLanes>');
      if (!t.includes('<TakeLane Id="0">')) throw new Error(layer.role + ': the track shell had no empty <TakeLanes /> to fill');
    }
    let slotIndex = 0, seq = 0;
    t = t.replace(/<ClipSlotList>[\s\S]*?<\/ClipSlotList>/g, (all) => {
      const shell = element(all, 'ClipSlot').text; const slots = [];
      for (let i = 0; i < stack.scenes.length; i++) {
        let s = shell.replace(/^<ClipSlot Id="\d+">/, '<ClipSlot Id="' + i + '">');
        const plays = seq === 0 && stack.scenes[i].play.includes(layer.role);     // the first list is the MainSequencer's, the second the FreezeSequencer's
        if (plays) s = s.replace(/<ClipSlot>\s*<Value \/>\s*<\/ClipSlot>/, '<ClipSlot>\n<Value>\n' + clip.xml.replace(/^<AudioClip Id="\d+"/, '<AudioClip Id="' + (slotIndex++) + '"') + '\n</Value>\n</ClipSlot>');
        slots.push(s);
      }
      seq++;
      return '<ClipSlotList>\n' + slots.join('\n') + '\n</ClipSlotList>';
    });
    return t;
  });

  // locators: one at the start of each section, named for the scene
  let at = 0; const locators = stack.scenes.map((sc, i) => { const l = '<Locator Id="' + i + '">\n<LomId Value="0" />\n<Time Value="' + fmt(at) + '" />\n<Name Value="' + esc(sc.name) + '" />\n<Annotation Value="" />\n<IsSongStart Value="' + (i === 0 ? 'true' : 'false') + '" />\n</Locator>'; at += (sc.bars || 8) * 4; return l; });
  xml = replaceEl(xml, element(xml, 'Locators'), '<Locators>\n<Locators>\n' + locators.join('\n') + '\n</Locators>\n</Locators>');
  report.push('arrangement: ' + stack.scenes.length + ' sections, ' + (at / 4) + ' bars, a locator at each');

  let lim = element(readGz(path.join(WRITER, 'Limiter.adv')), 'Limiter').text;
  lim = lim.replace(/<LastPresetRef>[\s\S]*?<\/LastPresetRef>/, '<LastPresetRef>\n<Value />\n</LastPresetRef>');
  lim = replaceEl(lim, element(lim, 'Ceiling'), element(lim, 'Ceiling').text.replace(/<Manual Value="[^"]*" \/>/, '<Manual Value="-1" />'));
  lim = renumber(lim, ids);
  xml = replaceEl(xml, element(xml, 'Tracks'), '<Tracks>\n' + tracks.join('\n') + '\n</Tracks>');
  main = element(xml, 'MainTrack');
  xml = replaceEl(xml, main, replaceEl(main.text, element(main.text, 'Devices'), '<Devices>\n' + withId(lim, 0) + '\n</Devices>'));
  xml = xml.replace(/<NextPointeeId Value="\d+" \/>/, '<NextPointeeId Value="' + ids.pointee + '" />');
  if (target) report.unshift('key: ' + target.name + (stack.key ? ' (the recipe\'s)' : ' (from the bass layer)'));
  report.push(bent ? bent + ' bend(s): the search should have found layers that fit (standing order: find before you bend)' : 'nothing bent: every layer at the Set\'s tempo and in key');
  return { xml, report };
}

function check(file) {
  const xml = readGz(file); const problems = [];
  const next = Number(xml.match(/<NextPointeeId Value="(\d+)" \/>/)[1]);
  const ids = [...xml.matchAll(POINTEES)].map((m) => Number(m[2])); const seen = new Set(), dup = new Set();
  for (const id of ids) { if (seen.has(id)) dup.add(id); seen.add(id); }
  if (dup.size) problems.push('repeated pointee ids: ' + [...dup].slice(0, 10).join(', '));
  if (ids.some((id) => id >= next)) problems.push('pointee ids at or above NextPointeeId');
  const view = xml.match(/<SelectedDocumentViewInMainWindow Value="(\d)" \/>/)[1] === '1' ? 'Session' : 'Arrangement';
  const sceneNames = [...element(xml, 'Scenes').text.matchAll(/<Name Value="([^"]*)" \/>/g)].map((m) => m[1]);
  console.log(path.basename(file) + ': ' + xml.match(/Creator="([^"]*)"/)[1] + ', ' + Math.round(xml.length / 1024) + ' KB of XML; pointees ' + ids.length + ', all unique ' + (dup.size ? 'NO' : 'yes') + ', NextPointeeId ' + next + '; opens in ' + view + ' view; tempo ' + element(element(xml, 'MainTrack').text, 'Tempo').text.match(/<Manual Value="([^"]*)" \/>/)[1]);
  console.log('  scenes: ' + sceneNames.map((n, i) => i + ':' + n).join('  '));
  const gains = [...xml.matchAll(/<SampleVolume Value="([^"]*)" \/>/g)].map((m) => Number(m[1])); const maxGain = gains.length ? Math.max(...gains) : 1;
  if (maxGain > 1.0001) problems.push('clip gain above 0 dB: ' + (20 * Math.log10(maxGain)).toFixed(1) + ' dB on some clip');
  console.log('  clip gain: ' + (gains.length ? (20 * Math.log10(maxGain)).toFixed(1) + ' dB max over ' + gains.length + ' clips' : 'no clips'));
  const locs = [...element(xml, 'Locators').text.matchAll(/<Time Value="([^"]+)" \/>\s*<Name Value="([^"]*)" \/>/g)].map((m) => 'bar ' + (Number(m[1]) / 4 + 1) + ' ' + m[2]);
  console.log('  locators: ' + (locs.length ? locs.join(' · ') : 'none'));
  const tracksEl = element(xml, 'Tracks'); const re = /<AudioTrack Id="(\d+)"/g; let m; const grid = [];
  while ((m = re.exec(tracksEl.text))) {
    const tr = element(tracksEl.text, 'AudioTrack', m.index).text; const name = tr.match(/<EffectiveName Value="([^"]*)" \/>/)[1];
    const mainSeq = element(tr, 'MainSequencer').text; const slots = [...mainSeq.matchAll(/<ClipSlot Id="(\d+)">\s*<LomId Value="0" \/>\s*<ClipSlot>\s*<Value>\s*<AudioClip /g)].map((s) => Number(s[1]));
    const paths = [...mainSeq.matchAll(/<Path Value="([^"]*)" \/>/g)].map((p) => p[1]).filter(Boolean); const missing = [...new Set(paths)].filter((p) => !fs.existsSync(p));
    for (const p of missing) problems.push(name + ': sample missing ' + p);
    const arrEvents = (element(element(mainSeq, 'Sample').text, 'ArrangerAutomation').text.match(/<AudioClip /g) || []).length;
    const lanesXml = element(tr, 'TakeLanes').text; const laneCount = (lanesXml.match(/<TakeLane Id=/g) || []).length; const laneClips = (lanesXml.match(/<AudioClip /g) || []).length;
    const lanePaths = [...lanesXml.matchAll(/<Path Value="([^"]*)" \/>/g)].map((p) => p[1]).filter(Boolean); for (const p of [...new Set(lanePaths)]) if (!fs.existsSync(p)) problems.push(name + ': take sample missing ' + p);
    const slotXml = element(mainSeq, 'ClipSlotList').text; const warped = (slotXml.match(/<IsWarped Value="true" \/>/g) || []).length, clips = (slotXml.match(/<AudioClip /g) || []).length;
    const pitch = (mainSeq.match(/<PitchCoarse Value="(-?\d+)" \/>/) || [, '0'])[1]; const mode = (mainSeq.match(/<WarpMode Value="(\d+)" \/>/) || [, '?'])[1];
    const wm = mainSeq.match(/<WarpMarker Id="1" SecTime="([^"]+)" BeatTime="([^"]+)"/); const tempoHere = Number(element(element(xml, 'MainTrack').text, 'Tempo').text.match(/<Manual Value="([^"]*)" \/>/)[1]);
    const native = wm ? Number(wm[2]) / Number(wm[1]) * 60 : null; const stretched = native != null && Math.abs(native - tempoHere) > 0.5; const amp = Number((element(element(tr, 'Mixer').text, 'Volume').text.match(/<Manual Value="([^"]*)" \/>/) || [, '1'])[1]);
    grid.push('  ' + name.padEnd(10) + sceneNames.map((_, i) => slots.includes(i) ? '[x]' : '[ ]').join(' ') + '  ' + clips + ' slots, ' + arrEvents + ' arranged, ' + laneCount + ' takes (' + laneClips + ' clips), ' + warped + ' warped, ' + (stretched ? 'stretched from ' + Math.round(native) : 'native') + ', ' + (pitch === '0' ? 'in key' : (Number(pitch) > 0 ? '+' : '') + pitch + ' st') + ', ' + ({ '0': 'Beats', '4': 'Complex', '6': 'Complex Pro' }[mode] || 'mode ' + mode) + ', ' + (20 * Math.log10(amp)).toFixed(1) + ' dB' + (missing.length ? ', sample MISSING' : ''));
    if (warped !== clips) problems.push(name + ': ' + (clips - warped) + ' clip(s) not warped');
    if (arrEvents !== clips) problems.push(name + ': ' + clips + ' slots but ' + arrEvents + ' arrangement clips');
  }
  grid.forEach((g) => console.log(g));
  if (!grid.length) problems.push('no audio tracks');
  if (problems.length) { problems.forEach((p, i) => console.log('LOOK AT ' + (i + 1) + ': ' + p)); return 1; }
  console.log('  nothing to look at'); return 0;
}

const argv = process.argv.slice(2);
if (argv[0] === 'check') process.exit(check(path.resolve(argv[1])));
if (argv[0] !== 'build') { console.log('usage: build stack.json [--out-dir dir] [--force] | check set.als'); process.exit(2); }
const stackFile = path.resolve(argv[1]); const stack = JSON.parse(fs.readFileSync(stackFile, 'utf8'));
const outDir = argv.includes('--out-dir') ? path.resolve(argv[argv.indexOf('--out-dir') + 1]) : path.dirname(stackFile);
const layers = stack.layers.map((l) => ({ ...l, abs: path.resolve(path.dirname(stackFile), l.file), alternates: (l.alternates || []).map((a) => ({ ...a, abs: path.resolve(path.dirname(stackFile), a.file) })) }));
for (const l of layers) for (const f of [l, ...l.alternates]) if (!fs.existsSync(f.abs)) throw new Error('sample missing: ' + f.abs);
for (const s of stack.scenes) for (const r of s.play) if (!layers.some((l) => l.role === r)) throw new Error('scene "' + s.name + '" plays unknown layer ' + r);
const out = path.join(outDir, stack.name + '.als');
const { xml, report } = build(stack, layers, outDir);
writeGz(out, xml, argv.includes('--force'));
console.log('wrote ' + out + ': ' + layers.length + ' tracks, ' + stack.scenes.length + ' scenes'); report.forEach((r) => console.log('  ' + r));
console.log('next: node forge-session.mjs check "' + out + '", then open it in Live 12');
