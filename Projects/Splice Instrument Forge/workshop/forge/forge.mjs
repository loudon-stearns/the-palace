// forge -- one command from a recipe to a Live Set. Splice Instrument Forge, move five (2026-10-24).
//
//   node forge.mjs fetch  <manifest.json>        download the samples a session found (presigned URLs expire in ~2 min: run this right after the download_asset calls)
//   node forge.mjs build  <recipe.json> [--force] write the Set (and preset) the recipe asks for, beside the recipe
//   node forge.mjs check  <set.als>               read a Set back, whatever kind it is
//   node forge.mjs open   <set.als> [--anyway]    open it in a second Live 12 (never the one Loudon has up)
//   node forge.mjs missing <recipe.json>          list the recipe's samples not on disk, each with its Splice id to download again
//   node forge.mjs sweep  <folder>                check every Set under a folder, one line each
//
// recipe.json carries "kind": "kit" (a Drum Rack: forge-drum-rack.mjs's shape), "stack" (a Session Set: forge-session.mjs's
// shape) or "instrument" (a Sampler: { name, release?, samples: "samples/" } -> detect-roots.py, build-sfz.py, the Session
// Writer's library job, als-to-adv.py, rehouse.mjs onto the forge's own MIDI track). The builders stay where their moves made them; this file only routes.
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
// the Sampler's scripts need numpy and soundfile; the python3 first on PATH may lack them (2026-10-26: Homebrew's did), so take the first that imports both
const PY = ['python3', '/usr/local/bin/python3', '/opt/homebrew/bin/python3', '/usr/bin/python3'].find((p) => spawnSync(p, ['-I', '-c', 'import numpy, soundfile']).status === 0) || 'python3';
const run = (cmd, args, cwd) => { const r = spawnSync(cmd, args, { cwd, stdio: 'inherit' }); if (r.status !== 0) process.exit(r.status || 1); };

const [verb, target, ...rest] = process.argv.slice(2);
if (!verb || !target) { console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 14).join('\n')); process.exit(2); }
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
  // samples are gitignored, so a Set built in a worktree points at files that vanish with it (every Set of 2026-10-24 did)
  for (let d = dir; d !== path.dirname(d); d = path.dirname(d)) {
    const g = path.join(d, '.git');
    if (!fs.existsSync(g)) continue;
    if (fs.statSync(g).isFile()) console.log('WARNING: building inside a worktree (' + d + '); its samples and this Set\'s paths die when the worktree is removed. Build in the main checkout.');
    break;
  }
  if (r.kind === 'kit' || r.kind === 'stack') run('node', [BUILDERS[r.kind], 'build', file, ...rest]);
  else if (r.kind === 'instrument') {
    const samples = path.resolve(dir, r.samples || 'samples');
    run(PY, ['-I', path.join(SAMPLER, 'detect-roots.py'), samples], dir);            // writes roots.json beside the samples folder
    run(PY, ['-I', path.join(SAMPLER, 'build-sfz.py'), r.name, '--release', String(r.release ?? 0.4)], dir);
    run('node', [WRITER, 'library', path.join(dir, r.name + '.sfz'), '--out', path.join(dir, r.name + '.als'), '--tempo', String(r.tempo || 100), ...rest]);
    run(PY, ['-I', path.join(SAMPLER, 'als-to-adv.py'), path.join(dir, r.name + '.als'), path.join(dir, r.name + '.adv')], dir);
    run('node', [path.join(HERE, 'rehouse.mjs'), path.join(dir, r.name + '.als')]);   // off the writer's armed track, onto Ableton's own (move seven)
    run('node', [path.join(HERE, 'finish.mjs'), path.join(dir, r.name + '.als'), '--track', r.name + '=' + (r.ground || 'middleground'), '--locator', r.name + ' phrase@1']);   // a Sampler is a lead or keys unless the recipe says
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

// every sample file a recipe names, with its Splice id when the recipe or a manifest beside it keeps one
const recipeSamples = (r, d) => {
  const out = [];
  if (r.kind === 'kit') for (const p of r.pads || []) out.push({ file: p.file, uuid: p.uuid, who: p.name });
  else if (r.kind === 'stack') for (const l of r.layers || []) for (const x of [l, ...(l.alternates || [])]) out.push({ file: x.file, uuid: x.uuid, who: l.role });
  else if (r.kind === 'instrument') {
    const m = path.join(d, 'manifest.json');
    const ids = fs.existsSync(m) ? JSON.parse(fs.readFileSync(m, 'utf8')).samples || [] : [];
    for (const s of ids) out.push({ file: path.join(r.samples || 'samples', s.file), uuid: s.uuid, who: r.name });
  }
  return out;
};

if (verb === 'missing') {
  const r = JSON.parse(fs.readFileSync(file, 'utf8'));
  const all = recipeSamples(r, dir), gone = all.filter((s) => !fs.existsSync(path.resolve(dir, s.file)));
  for (const s of gone) console.log('  missing ' + s.who + ': ' + path.basename(s.file) + '  ' + (s.uuid ? 'download_asset ' + s.uuid : 'NO ID: search Splice by this filename, then add its uuid to the recipe'));
  console.log(gone.length ? gone.length + ' of ' + all.length + ' missing; download them, fetch into ' + path.join(dir, 'samples') + ', then build --force' : 'all ' + all.length + ' samples on disk');
  process.exit(gone.length ? 1 : 0);
}

if (verb === 'sweep') {
  const sets = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!/^(shells|Backup|samples|node_modules)$/.test(e.name) && !e.name.startsWith('.')) walk(p); }
    else if (e.name.endsWith('.als')) sets.push(p);
  } };
  walk(file);
  let bad = 0;
  for (const s of sets.sort()) {
    const out = String(spawnSync('node', [fileURLToPath(import.meta.url), 'check', s]).stdout);
    const looks = out.split('\n').filter((l) => l.startsWith('LOOK AT'));
    if (looks.length) bad++;
    console.log((looks.length ? '  LOOK  ' : '  clean ') + path.relative(file, s) + (looks.length ? '  (' + looks.length + ': ' + looks[0].replace(/^LOOK AT \d+: /, '') + ')' : ''));
  }
  console.log(sets.length + ' Sets, ' + (sets.length - bad) + ' clean'); process.exit(bad ? 1 : 0);
}

if (verb === 'open') {
  const lives = String(spawnSync('pgrep', ['-fl', 'MacOS/Live']).stdout);
  // a second Live 12 stops on the "Another instance..." box until someone clicks; with nobody to click, the proof stays owed
  if (lives.includes('Live 12') && !rest.includes('--anyway')) { console.log('a Live 12 is already running (assume it is Loudon\'s): a new one would wait on the "Another instance..." box. Not opening; the proof stays owed. Pass --anyway if someone is there to click.'); process.exit(3); }
  if (lives.includes('Live 11')) console.log('note: Live 11 is running; opening in a separate Live 12 instance, never through the desktop tool');
  execFileSync('open', ['-n', '-a', 'Ableton Live 12 Suite', file]);
  console.log('opened ' + path.basename(file) + ' in a new Live 12 instance; Live\'s log: ~/Library/Preferences/Ableton/Live 12.4.6/Log.txt'); process.exit(0);
}
console.error('unknown verb ' + verb); process.exit(2);
