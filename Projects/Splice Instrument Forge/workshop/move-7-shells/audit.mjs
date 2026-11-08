// audit -- every shell the forge clones, set beside the same element as Ableton itself ships it in Live 12.4.6's own
// files, value by value. What differs is either a real Live-version change or cruft a saved Set carried in.
// (Splice Instrument Forge, the "own shells" move, 2026-10-26.)
//
//   node audit.mjs            print every departure, shell by shell
//   node audit.mjs --json     the same, as JSON (audit.json is written either way)
//
// A reference is always a file inside the Live 12 Suite app: nobody's saved Set, nobody's taste.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STUDY = path.join(HERE, '..', 'format-study', 'xml');
const WRITER = '/Users/loudonstearns/Documents/The Palace/Shop/Shopkeeper/probes/2026-10-20-ableton-session/templates';
const LIVE = '/Applications/Ableton Live 12 Suite.app/Contents/App-Resources';
const CORE = path.join(LIVE, 'Core Library');

const gz = (f) => zlib.gunzipSync(fs.readFileSync(f)).toString('utf8');
const txt = (f) => fs.readFileSync(f, 'utf8');
export function element(xml, tag, nth = 0) {          // the nth whole <tag …>…</tag> (or self-closed) in xml
  const open = new RegExp('<' + tag + '(?= |>|/>)', 'g'); let m;
  for (let i = 0; i <= nth; i++) { m = open.exec(xml); if (!m) return null; }
  const re = new RegExp('<(/?)' + tag + '(?= |>|/>)[^>]*?(/?)>', 'g'); re.lastIndex = m.index; let depth = 0, t;
  while ((t = re.exec(xml))) { if (t[2]) { if (depth === 0) return xml.slice(m.index, re.lastIndex); continue; } depth += t[1] ? -1 : 1; if (depth === 0) return xml.slice(m.index, re.lastIndex); }
  return null;
}

// Flatten an element to leaves: path (tags, with an index among same-named siblings) -> attributes, ids dropped.
export function leaves(xml, { skip = [] } = {}) {
  const out = new Map(), stack = [], counts = [new Map()];
  const tok = /<!--[\s\S]*?-->|<(\/?)([A-Za-z_][\w.]*)([^>]*?)(\/?)>/g; let t;
  while ((t = tok.exec(xml))) {
    if (!t[2]) continue;                                    // a comment (the forge's <!--DEVICE--> holes)
    const [, close, tag, attrs, self] = t;
    if (close) { stack.pop(); counts.pop(); continue; }
    const c = counts[counts.length - 1]; const n = c.get(tag) || 0; c.set(tag, n + 1);
    const name = n ? tag + '[' + n + ']' : tag;
    const a = attrs.replace(/\s(Id|LomId|LomIdView)="[^"]*"/g, '').trim();
    const p = [...stack, name].join('/');
    const skipped = skip.some((s) => p.includes(s));
    if (a && !skipped) out.set(p, a);
    if (!self) { stack.push(name); counts.push(new Map()); }
  }
  return out;
}

// Values that differ by nature, not by cruft: ids, the file a sample came from, bookkeeping Live rewrites on save.
const NOISE = /(^|\/)(OverwriteProtectionNumber|LastModDate|OriginalCrc|OriginalFileSize|DefaultDuration|DefaultSampleRate|RelativePath|Path|RelativePathType|LivePackName|LivePackId|SourceHint|BrowserContentPath|LocalFiltersJson|NextPointeeId|ViewData|SelectedDevice|SelectedEnvelope|LaneHeight|IsContentSelectedInDocument|IsSelected|ScrollerTimePreserver|TimeSelection|AnchorTime|OtherTime|LeftTime|RightTime)(\/|$)/;

export function diff(useXml, refXml, opt = {}) {
  const u = leaves(useXml, opt), r = leaves(refXml, opt); const rows = [];
  for (const [p, a] of u) { if (NOISE.test(p)) continue; if (!r.has(p)) rows.push({ path: p, ours: a, ableton: '(absent)' }); else if (r.get(p) !== a) rows.push({ path: p, ours: a, ableton: r.get(p) }); }
  for (const [p, a] of r) { if (NOISE.test(p) || u.has(p)) continue; rows.push({ path: p, ours: '(absent)', ableton: a }); }
  return rows;
}

// Every shell the builders read today, and its Ableton-shipped counterpart.
export const PAIRS = [
  { shell: 'Set', usedBy: 'all three builders', from: 'Session Writer blank-set.als',
    ours: () => element(gz(path.join(WRITER, 'blank-set.als')), 'LiveSet'),
    refFrom: 'Builtin/Templates/DefaultLiveSet.als', ref: () => element(gz(path.join(LIVE, 'Builtin/Templates/DefaultLiveSet.als')), 'LiveSet'),
    skip: ['Tracks/', 'MainTrack/', 'PreHearTrack/'] },
  { shell: 'AudioTrack', usedBy: 'stack builder', from: 'study: AudioTrack from the 12.1 DefaultLiveSet',
    ours: () => txt(path.join(STUDY, 'Live12 AudioTrack shell (from DefaultLiveSet).xml')),
    refFrom: 'Core Library/Defaults/Creating Tracks/Audio Track/Default Audio Track.als', ref: () => element(gz(path.join(CORE, 'Defaults/Creating Tracks/Audio Track/Default Audio Track.als')), 'AudioTrack') },
  { shell: 'MidiTrack', usedBy: 'kit and Sampler builders', from: 'Session Writer midi-track.xml',
    ours: () => txt(path.join(WRITER, 'midi-track.xml')),
    refFrom: 'Core Library/Defaults/Creating Tracks/MIDI Track/Default MIDI Track.als', ref: () => element(gz(path.join(CORE, 'Defaults/Creating Tracks/MIDI Track/Default MIDI Track.als')), 'MidiTrack'),
    skip: ['ClipSlotList/'] },
  { shell: 'AudioClip', usedBy: 'stack builder', from: 'study: a clip from Loudon\'s "Impact Granular.als"',
    ours: () => txt(path.join(STUDY, 'Live12 arrangement AudioClip.xml')),
    refFrom: 'Core Library/Ableton Folder Info/Sample Reference.als', ref: () => element(gz(path.join(CORE, 'Ableton Folder Info/Sample Reference.als')), 'AudioClip'),
    skip: ['WarpMarkers/', 'SourceContext/', 'Name'] },
  { shell: 'MidiClip', usedBy: 'kit and Sampler builders', from: 'Session Writer midi-clip.xml',
    ours: () => txt(path.join(WRITER, 'midi-clip.xml')),
    refFrom: 'Core Library/Templates/Quick Start Beat.als', ref: () => element(gz(path.join(CORE, 'Templates/Quick Start Beat.als')), 'MidiClip'),
    skip: ['Notes/', 'KeyTracks/', 'Name'] },
  { shell: 'DrumBranch', usedBy: 'kit builder (the rack inside the Set)', from: 'study: a pad from the Spoiler Kit Set Loudon saved back',
    ours: () => txt(path.join(STUDY, 'Live12 DrumBranch shell.xml')),
    refFrom: 'Core Library/Templates/Quick Start Beat.als', ref: () => element(gz(path.join(CORE, 'Templates/Quick Start Beat.als')), 'DrumBranch'),
    skip: ['Devices/', 'Name/', 'ZoneSettings/'] },
];

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const report = [];
  for (const p of PAIRS) {
    const rows = diff(p.ours(), p.ref(), { skip: p.skip || [] });
    const own = path.join(HERE, 'shells', p.shell + '.xml');     // the harvested shell the builders read now
    const after = fs.existsSync(own) ? diff(txt(own), p.ref(), { skip: p.skip || [] }) : null;
    report.push({ shell: p.shell, usedBy: p.usedBy, from: p.from, refFrom: p.refFrom, departures: rows, ownShellDepartures: after });
  }
  fs.writeFileSync(path.join(HERE, 'audit.json'), JSON.stringify(report, null, 1) + '\n');
  if (process.argv.includes('--json')) { console.log(JSON.stringify(report, null, 1)); process.exit(0); }
  for (const s of report) {
    console.log('\n## ' + s.shell + '  (' + s.departures.length + ' departures; own shell: ' + (s.ownShellDepartures ? s.ownShellDepartures.length : 'none yet') + ')  was: ' + s.from + '  ·  Ableton: ' + s.refFrom);
    if (process.argv.includes('--own')) { for (const d of s.ownShellDepartures || []) console.log('  own ' + d.path.split('/').slice(-3).join('/') + ': ' + d.ours + '  (Ableton ' + d.ableton + ')'); continue; }
    for (const d of s.departures) console.log('  ' + d.path.split('/').slice(-3).join('/') + '\n      ours    ' + d.ours + '\n      ableton ' + d.ableton);
  }
}
