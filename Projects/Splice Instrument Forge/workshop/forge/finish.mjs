// finish -- the last touches any forge Set gets: track levels by ground and locators for its sections.
//   node finish.mjs <set.als> [--track "<name>=<ground|dB>" …] [--locator "<name>@<bar>" …]
// Grounds (Loudon's standing order): foreground -4 dB, middleground -8, background -12. A track not named keeps its level.
// Volume is the mixer's linear amplitude (1 = 0 dB). Locators are LiveSet > Locators > Locators > Locator (format study).
import fs from 'node:fs'; import path from 'node:path'; import zlib from 'node:zlib';
const GROUNDS = { foreground: -4, middleground: -8, background: -12 };
const argv = process.argv.slice(2); const file = path.resolve(argv[0]);
const opts = (flag) => argv.flatMap((a, i) => a === flag ? [argv[i + 1]] : []);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function element(xml, tag, from = 0) {
  const open = new RegExp('<' + tag + '(?= |>|/>)', 'g'); open.lastIndex = from; const m = open.exec(xml); if (!m) return null;
  const start = m.index, re = new RegExp('<(/?)' + tag + '(?= |>|/>)[^>]*?(/?)>', 'g'); re.lastIndex = start; let depth = 0, t;
  while ((t = re.exec(xml))) { if (t[1]) { depth--; if (depth === 0) return { start, end: t.index + t[0].length, text: xml.slice(start, t.index + t[0].length) }; } else if (!t[2]) depth++; else if (depth === 0) return { start, end: t.index + t[0].length, text: xml.slice(start, t.index + t[0].length) }; }
  throw new Error('unclosed <' + tag + '>');
}
const replaceEl = (xml, el, text) => xml.slice(0, el.start) + text + xml.slice(el.end);
let xml = zlib.gunzipSync(fs.readFileSync(file)).toString('utf8'); const done = [];
for (const spec of opts('--track')) {
  const [name, level] = spec.split('='); const db = level in GROUNDS ? GROUNDS[level] : Number(level); const amp = Math.pow(10, db / 20);
  const tracks = element(xml, 'Tracks'); const re = /<(MidiTrack|AudioTrack) Id="\d+"/g; let m, hit = false;
  while ((m = re.exec(tracks.text))) {
    const tr = element(tracks.text, m[1], m.index); if (!tr.text.includes('<EffectiveName Value="' + esc(name) + '" />')) continue;
    const mixer = element(tr.text, 'Mixer'); const vol = element(mixer.text, 'Volume');
    const t2 = replaceEl(tr.text, mixer, replaceEl(mixer.text, vol, vol.text.replace(/<Manual Value="[^"]*" \/>/, '<Manual Value="' + Number(amp.toFixed(10)) + '" />')));
    xml = replaceEl(xml, { start: tracks.start + tr.start, end: tracks.start + tr.end }, t2); hit = true; done.push(name + ' -> ' + (level in GROUNDS ? level + ' ' : '') + db + ' dB'); break;
  }
  if (!hit) { console.error('no track named ' + name); process.exit(1); }
}
const locs = opts('--locator');
if (locs.length) {
  const items = locs.map((l, i) => { const [name, bar] = l.split('@'); return '<Locator Id="' + i + '">\n<LomId Value="0" />\n<Time Value="' + ((Number(bar) - 1) * 4) + '" />\n<Name Value="' + esc(name) + '" />\n<Annotation Value="" />\n<IsSongStart Value="' + (i === 0 ? 'true' : 'false') + '" />\n</Locator>'; });
  xml = replaceEl(xml, element(xml, 'Locators'), '<Locators>\n<Locators>\n' + items.join('\n') + '\n</Locators>\n</Locators>'); done.push(locs.length + ' locator(s): ' + locs.join(', '));
}
fs.writeFileSync(file, zlib.gzipSync(Buffer.from(xml, 'utf8'))); console.log('finished ' + path.basename(file) + ': ' + (done.join('; ') || 'nothing asked'));
