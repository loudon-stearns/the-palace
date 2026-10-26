// rehouse -- move a Set's first MIDI track onto the forge's own MIDI track shell, keeping its devices and clips.
//   node rehouse.mjs <set.als>
// The Session Writer's library job builds the Sampler's zones well but puts them on its own midi-track.xml, which came in
// armed for recording and at -12 dB (move seven's audit, 2026-10-26). This takes the Sampler and the clip off that track and
// sets them on Ableton's own default MIDI track (move-7-shells/shells/MidiTrack.xml), so the Sampler path and the kit path
// stand on the same part. The moved devices and clips keep their pointee ids; the new track's own ids are numbered from
// NextPointeeId. Run finish.mjs after it for the fader.
import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib'; import { fileURLToPath } from 'node:url';
const SHELL = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'move-7-shells', 'shells', 'MidiTrack.xml');
const POINTEES = /<(AutomationTarget|[A-Za-z]*ModulationTarget|Pointee|ControllerTargets\.\d+) Id="(\d+)"/g;
function element(xml, tag, from = 0) {
  const open = new RegExp('<' + tag + '(?= |>|/>)', 'g'); open.lastIndex = from; const m = open.exec(xml); if (!m) return null;
  const start = m.index, re = new RegExp('<(/?)' + tag + '(?= |>|/>)[^>]*?(/?)>', 'g'); re.lastIndex = start; let depth = 0, t;
  while ((t = re.exec(xml))) { if (t[1]) { depth--; if (depth === 0) return { start, end: t.index + t[0].length, text: xml.slice(start, t.index + t[0].length) }; } else if (!t[2]) depth++; else if (depth === 0) return { start, end: t.index + t[0].length, text: xml.slice(start, t.index + t[0].length) }; }
  throw new Error('unclosed <' + tag + '>');
}
const replaceEl = (xml, el, text) => xml.slice(0, el.start) + text + xml.slice(el.end);

const file = path.resolve(process.argv[2]);
let xml = zlib.gunzipSync(fs.readFileSync(file)).toString('utf8');
const old = element(xml, 'MidiTrack'); if (!old) { console.error('no MIDI track in ' + file); process.exit(1); }
const o = old.text;
const id = o.match(/^<MidiTrack Id="(\d+)"/)[1];
const name = o.match(/<EffectiveName Value="([^"]*)" \/>/)[1], color = (o.match(/<Color Value="(\d+)" \/>/) || [, '0'])[1];
const devices = element(o, 'Devices'), events = element(element(o, 'ArrangerAutomation').text, 'Events');
const ids = { pointee: Number(xml.match(/<NextPointeeId Value="(\d+)" \/>/)[1]) };

let t = fs.readFileSync(SHELL, 'utf8').trim().replace(/^<MidiTrack Id="\d+"/, '<MidiTrack Id="' + id + '"');
t = t.replace(POINTEES, (a, tag) => '<' + tag + ' Id="' + (ids.pointee++) + '"');
const nameEl = element(t, 'Name');
t = replaceEl(t, nameEl, nameEl.text.replace(/<EffectiveName Value="[^"]*" \/>/, '<EffectiveName Value="' + name + '" />').replace(/<UserName Value="[^"]*" \/>/, '<UserName Value="' + name + '" />'));
t = t.replace(/<Color Value="\d+" \/>/, '<Color Value="' + color + '" />');
t = replaceEl(t, element(t, 'Devices'), devices ? devices.text : '<Devices />');
const arr = element(t, 'ArrangerAutomation');
t = replaceEl(t, arr, replaceEl(arr.text, element(arr.text, 'Events'), events.text));
// Live refuses a Set ("corrupt ... Slot count mismatch", 2026-10-26) unless every ClipSlotList on a track, the main sequencer's
// and the freeze sequencer's, holds one slot per scene; the shell carries one. Take the old track's lists, in order.
const oldLists = [], newLists = [];
for (let at = 0, el; (el = element(o, 'ClipSlotList', at)); at = el.end) oldLists.push(el.text);
for (let at = 0, el; (el = element(t, 'ClipSlotList', at)); at = el.end) newLists.push(el);
if (oldLists.length !== newLists.length) throw new Error('the old track has ' + oldLists.length + ' slot lists, the shell ' + newLists.length);
for (let i = newLists.length - 1; i >= 0; i--) t = replaceEl(t, newLists[i], oldLists[i]);
const scenes = (xml.match(/<Scene Id=/g) || []).length;
for (let at = 0, el; (el = element(t, 'ClipSlotList', at)); at = el.end) { const n = (el.text.match(/<ClipSlot Id=/g) || []).length; if (n !== scenes) throw new Error('a slot list holds ' + n + ' slots for ' + scenes + ' scenes'); }

xml = replaceEl(xml, old, t).replace(/<NextPointeeId Value="\d+" \/>/, '<NextPointeeId Value="' + ids.pointee + '" />');
fs.writeFileSync(file, zlib.gzipSync(Buffer.from(xml, 'utf8')));
const armed = (element(xml, 'MidiTrack').text.match(/<IsArmed Value="([^"]*)" \/>/) || [, '?'])[1];
console.log('rehoused ' + name + ' onto the forge\'s own MIDI track: ' + (devices.text.match(/<MultiSampler Id=/g) || []).length + ' Sampler, ' + (events.text.match(/<MidiClip /g) || []).length + ' arrangement clip(s); armed ' + armed);
