// untracked.mjs — every file a rich face names that git does not track: what
// plays on this Mac and not on the public face (Loudon, 2026-10-20: "the rich
// face can play on a local machine if the files are only on the local machine,
// if public, then they can't play"). A face names a file in its text, in its
// manifest, or through a piece's declared files. For each one it says how to
// track it, by the rule in README.md § Media a face plays:
//   · a new file git doesn't ignore: commit it, through the palace committer;
//   · a file git ignores (a steward's render under Projects/ or Shop/Shopkeeper/):
//     copy it into the entry's bundle under rich-face/, which .gitignore keeps,
//     and commit the copy. The face names it as before: a tracked file wins over
//     the render it was copied from (resolve.mjs).
// It writes nothing. The steps it prints are for an author to run.
//
//   node _ops/rich-face/untracked.mjs                 every face in the palace
//   node _ops/rich-face/untracked.mjs "Kuramoto Coupling" [--root <palace>] [--json]
//
// Exit 0 when every face's files are tracked, 1 when some are not, so a gate
// can ask it; 2 when an entry named on the command line does not exist.

import { execFileSync } from 'node:child_process';
import { readFileSync, realpathSync } from 'node:fs';
import { posix, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeResolver, ROOT } from './resolve.mjs';
import { richReferences } from './rich-handler.mjs';
import { isPiecePage } from './kit/inject.mjs';
import { contractOf, declaredPath } from './contract.mjs';

export const KEEP_FOLDER = 'rich-face';
const COMMITTER = '_ops/stigmergy/app/scripts/palace-commit.mjs';

const q = (s) => `"${String(s).replace(/(["\\$`])/g, '\\$1')}"`;

/** The entries that have a rich face: each manifest the face would read. */
export function faceEntries(resolver) {
  let list = [];
  try {
    list = execFileSync('git', ['-c', 'core.quotepath=off', 'ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', '*— rich.json'],
      { cwd: resolver.root, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] }).toString('utf8').split('\0').filter(Boolean);
  } catch { return []; }
  const names = [];
  for (const m of list) {
    const title = posix.basename(m).replace(/ — rich\.json$/, '');
    const e = resolver.entry(title);
    if (e && e.manifest === m && !names.includes(title)) names.push(title);
  }
  return names.sort();
}

/**
 * Every file one face names that git does not track.
 * @returns {null | { entry, md, bundle, files: [{ path, name, via, ignored, steps: string[] }] }}
 */
export function untrackedFor(resolver, entryName) {
  const e = resolver.entry(entryName);
  if (!e) return null;
  let text = '', manifest = null;
  try { text = readFileSync(resolver.abs(e.md), 'utf8'); } catch { /* an unreadable text names nothing */ }
  try { manifest = e.manifest ? JSON.parse(readFileSync(resolver.abs(e.manifest), 'utf8')) : null; } catch { /* nor does a broken manifest */ }
  const bundle = e.md.replace(/\.md$/i, '');
  const contracts = new Map();
  for (const s of (manifest && manifest.sections) || []) for (const p of s.pieces || []) if (p && p.contract) contracts.set(p.file, p.contract);
  const found = new Map(); // path -> { name, via }
  const note = (path, name, via) => { if (!found.has(path)) found.set(path, { name, via }); };
  for (const [name, r] of richReferences(resolver, e.md, text, manifest)) {
    if (!r.ok) continue;
    if (r.local) note(r.path, name, 'named by the face');
    if (!isPiecePage(r.path)) continue;
    let html = '';
    try { html = readFileSync(resolver.abs(r.path), 'utf8'); } catch { continue; }
    for (const f of contractOf({ html, manifestContract: contracts.get(name) }).files) {
      const d = declaredPath(r.path, f);
      if (!d || d.endsWith('/')) continue;
      const x = resolver.resolve('/' + d);
      if (x.ok && x.local) note(x.path, f, `declared by ${posix.basename(r.path)}`);
    }
  }
  const ignoredSet = ignoredPaths(resolver.root, [...found.keys()]);
  const files = [...found].map(([path, { name, via }]) => {
    const isIgnored = ignoredSet.has(path);
    return { path, name, via, ignored: isIgnored, steps: stepsFor({ path, name, title: e.title, bundle, ignored: isIgnored }) };
  });
  return { entry: e.title, md: e.md, bundle, files };
}

/**
 * How to track one file a face needs, by README § Media a face plays: a new
 * file is committed; a file git ignores is copied into the bundle's rich-face/
 * folder and the copy committed. `title` and `bundle` are the face's entry and
 * its bundle; a piece no face shows yet has neither, and is told so.
 * The checker's file-local rule carries these same steps (conform.mjs).
 */
export function stepsFor({ path, name = path, title = null, bundle = null, ignored: isIgnored = false }) {
  const scope = q(title || '<the entry whose face shows it>');
  if (!isIgnored) return [`node ${COMMITTER} --kind ops --scope ${scope} --summary ${q(`the rich face keeps ${posix.basename(path)}`)} --verify verified --path ${q(path)}`];
  if (!bundle) return [`no rich face shows it yet: when one does, copy ${q(path)} into that entry's bundle under ${KEEP_FOLDER}/ and commit the copy`];
  const keep = `${bundle}/${KEEP_FOLDER}`;
  const copy = `${keep}/${posix.basename(path)}`;
  const steps = [
    `mkdir -p ${q(keep)} && cp ${q(path)} ${q(copy)}`,
    `node ${COMMITTER} --kind ops --scope ${scope} --summary ${q(`the rich face keeps ${posix.basename(path)}, so the public face plays it`)} --verify verified --path ${q(copy)}`,
  ];
  if (name.includes('/')) steps.push(`then name it ${q(posix.basename(path))} where the face names ${q(name)}, so it finds the copy`);
  return steps;
}

/** Which of these paths git ignores (the rest are new files it would take). */
export function ignoredPaths(root, paths) {
  if (!paths.length) return new Set();
  try {
    const out = execFileSync('git', ['-c', 'core.quotepath=off', 'check-ignore', '-z', '--no-index', '--stdin'],
      { cwd: root, input: paths.join('\0') + '\0', stdio: ['pipe', 'pipe', 'ignore'] }).toString('utf8');
    return new Set(out.split('\0').filter(Boolean));
  } catch (e) {
    // check-ignore exits 1 when none is ignored.
    return new Set(String(e.stdout || '').split('\0').filter(Boolean));
  }
}

const isMain = (() => { try { return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url)); } catch { return false; } })();
if (isMain) {
  const argv = process.argv.slice(2);
  const ri = argv.indexOf('--root');
  const root = resolve(ri >= 0 ? argv[ri + 1] : ROOT);
  const json = argv.includes('--json');
  const named = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--root');
  const resolver = makeResolver(root);
  const entries = named.length ? named : faceEntries(resolver);
  const report = [];
  for (const n of entries) {
    const r = untrackedFor(resolver, n);
    if (!r) { report.push({ entry: n, error: 'no such entry' }); if (!json) console.log(`${n}: no entry by that name`); continue; }
    report.push(r);
  }
  const missing = report.filter((r) => r.files && r.files.length);
  if (json) console.log(JSON.stringify({ faces: report }, null, 2));
  else {
    for (const r of report) {
      if (!r.files) continue;
      if (!r.files.length) { console.log(`${r.entry}: every file it names is tracked`); continue; }
      console.log(`${r.entry}: ${r.files.length} file${r.files.length === 1 ? '' : 's'} only on this Mac`);
      for (const f of r.files) {
        console.log(`  ${f.path}  (${f.ignored ? 'ignored by git' : 'not committed'}; ${f.via})`);
        for (const s of f.steps) console.log(`    ${s}`);
      }
    }
    if (!report.length) console.log('no rich face found');
  }
  process.exit(missing.length ? 1 : report.some((r) => r.error) ? 2 : 0);
}
