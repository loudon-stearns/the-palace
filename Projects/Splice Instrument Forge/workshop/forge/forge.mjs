// forge -- one command from a recipe to a Live Set. Splice Instrument Forge, move five (2026-10-24).
//
//   node forge.mjs fetch  <manifest.json>        download the samples a session found (presigned URLs expire in ~2 min: run this right after the download_asset calls)
//   node forge.mjs build  <recipe.json> [--force] write the Set (and preset) the recipe asks for, beside the recipe
//   node forge.mjs check  <set.als>               read a Set back, whatever kind it is
//   node forge.mjs open   <set.als>               open it in a second Live 12 (never the one Loudon has up)
//
// recipe.json carries "kind": "kit" (a Drum Rack: forge-drum-rack.mjs's shape), "stack" (a Session Set: forge-session.mjs's
// shape) or "instrument" (a Sampler: { name, release?, samples: "samples/" } -> detect-roots.py, build-sfz.py, the Session
// Writer's library job, als-to-adv.py). The builders stay where their moves made them; this file only routes.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOP = path.join(HERE, '..');
const WRITER = '/Users/loudonstearns/Documents/The Palace/Shop/Shopkeeper/probes/2026-10-20-ableton-session/live-set.mjs';
const BUILDERS = { kit: path.join(SHOP, 'move-3-drum-rack', 'forge-drum-rack.mjs'), stack: path.join(SHOP, 'move-4-session', 'forge-session.mjs') };
const SAMPLER = path.join(SHOP, 'move-2-sampler');
const run = (cmd, args, cwd) => { const r = spawnSync(cmd, args, { cwd, stdio: 'inherit' }); if (r.status !== 0) process.exit(r.status || 1); };

const [verb, target, ...rest] = process.argv.slice(2);
if (!verb || !target) { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 12).join('\n')); process.exit(2); }
const file = path.resolve(target), dir = path.dirname(file);

if (verb === 'fetch') {
  const m = JSON.parse(fs.readFileSync(file, 'utf8'));
  const into = path.resolve(dir, m.into || 'samples'); fs.mkdirSync(into, { recursive: true });
  let ok = 0;
  for (const s of m.samples) {
    const out = path.join(into, s.file);
    if (fs.existsSync(out) && !rest.includes('--force')) { console.log('  have   ' + s.file); ok++; continue; }
    const r = spawnSync('curl', ['-sS', '-f', '-o', out, s.url]);
    if (r.status === 0) { ok++; console.log('  fetched ' + s.file); } else console.log('  FAILED  ' + s.file + ' (' + String(r.stderr).trim() + ') -- the URL has probably expired; call download_asset again');
  }
  console.log(ok + '/' + m.samples.length + ' samples in ' + into); process.exit(ok === m.samples.length ? 0 : 1);
}

if (verb === 'build') {
  const r = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (r.kind === 'kit' || r.kind === 'stack') run('node', [BUILDERS[r.kind], 'build', file, ...rest]);
  else if (r.kind === 'instrument') {
    const samples = path.resolve(dir, r.samples || 'samples');
    run('python3', ['-I', path.join(SAMPLER, 'detect-roots.py'), samples], dir);            // writes roots.json beside the samples folder
    run('python3', ['-I', path.join(SAMPLER, 'build-sfz.py'), r.name, '--release', String(r.release ?? 0.4)], dir);
    run('node', [WRITER, 'library', path.join(dir, r.name + '.sfz'), '--out', path.join(dir, r.name + '.als'), '--tempo', String(r.tempo || 100), ...rest]);
    run('python3', ['-I', path.join(SAMPLER, 'als-to-adv.py'), path.join(dir, r.name + '.als'), path.join(dir, r.name + '.adv')], dir);
  } else { console.error('recipe needs "kind": kit | stack | instrument'); process.exit(2); }
  console.log('\nnext: node forge.mjs check "' + path.join(dir, r.name + '.als') + '"  then  node forge.mjs open "' + path.join(dir, r.name + '.als') + '"');
  process.exit(0);
}

if (verb === 'check') {
  const xml = zlib.gunzipSync(fs.readFileSync(file)).toString('utf8');
  if (xml.includes('<DrumGroupDevice ')) run('node', [BUILDERS.kit, 'check', file]);
  else if (/<AudioTrack Id=/.test(xml) && xml.includes('<SelectedDocumentViewInMainWindow Value="1" />')) run('node', [BUILDERS.stack, 'check', file]);
  else run('node', [WRITER, 'check', file]);
  process.exit(0);
}

if (verb === 'open') {
  const lives = String(spawnSync('pgrep', ['-fl', 'MacOS/Live']).stdout);
  if (lives.includes('Live 11')) console.log('note: Live 11 is running; opening in a separate Live 12 instance, never through the desktop tool');
  execFileSync('open', ['-n', '-a', 'Ableton Live 12 Suite', file]);
  console.log('opened ' + path.basename(file) + ' in a new Live 12 instance; Live\'s log: ~/Library/Preferences/Ableton/Live 12.4.6/Log.txt'); process.exit(0);
}
console.error('unknown verb ' + verb); process.exit(2);
