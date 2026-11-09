// Entry bundle resolution (SCHEMA §8).
//
// An entry bundle is an optional sibling folder, named identically to the
// entry (no extension), that holds the entry's owned files: handoffs,
// context companions, sources, sketches, enrichments. `Foo.md` ↔ `Foo/`.
//
// This module is *server-side* (Node). It walks a real bundle folder up
// to 2 levels deep, skipping hidden files, Archive/, __pycache__/, and
// anything whose name starts with `.`.

import { existsSync, readdirSync, statSync, openSync, readSync, closeSync } from 'node:fs';
import { extname, join, resolve, sep, dirname, basename } from 'node:path';

// config.json holds a live credential (RunPod GPU Backend/studio/) — never listed in a bundle.
const BUNDLE_HIDDEN = new Set(['Archive', '__pycache__', 'node_modules', 'test-results', 'config.json']);

// Given an entry's absolute path (e.g. /palace/Kuramoto Coupling.md),
// return the absolute path to its sibling bundle folder if it exists,
// else null.
export function bundleDirFor(absEntryPath) {
  if (typeof absEntryPath !== 'string' || !absEntryPath.endsWith('.md')) return null;
  const dir = dirname(absEntryPath);
  const stem = basename(absEntryPath, '.md');
  const bundleDir = join(dir, stem);
  if (existsSync(bundleDir) && statSync(bundleDir).isDirectory()) {
    return bundleDir;
  }
  return null;
}

// Locate the entry's avatar icon inside its bundle. Convention (set by the
// hero/icon enrichment): `<bundle>/<Title> — icon.png`. Prefer that exact name
// (the bundle stem is the entry title); else fall back to the first file
// matching `* — icon.png`. Returns a palace-relative path (servable by
// GET /api/file) or null when the bundle carries no icon.
export function iconRelFor(palaceRoot, absBundleDir) {
  if (typeof absBundleDir !== 'string' || absBundleDir === '') return null;
  const root = resolve(palaceRoot);
  const toRel = (full) => (full.startsWith(root + sep) ? full.slice(root.length + 1) : full);
  const stem = basename(absBundleDir);
  const preferred = join(absBundleDir, `${stem} — icon.png`);
  try {
    if (existsSync(preferred) && statSync(preferred).isFile()) return toRel(preferred);
  } catch (_) { /* fall through to the scan */ }
  let entries;
  try { entries = readdirSync(absBundleDir, { withFileTypes: true }); } catch (_) { return null; }
  const hit = entries.find((e) => e.isFile() && / — icon\.png$/i.test(e.name));
  return hit ? toRel(join(absBundleDir, hit.name)) : null;
}

// The entry's hero (`<Title> — hero.png`, else any `* — hero.png`) at the top
// of its bundle, in the bundle listing's shape { name, relPath, size } so
// HeroBackdrop can draw it behind a file the entry owns — its Context, a
// ledger, its scroll. Null when the bundle carries none.
export function heroFor(palaceRoot, absBundleDir) {
  if (typeof absBundleDir !== 'string' || absBundleDir === '') return null;
  const root = resolve(palaceRoot);
  let entries;
  try { entries = readdirSync(absBundleDir, { withFileTypes: true }); } catch (_) { return null; }
  const stem = basename(absBundleDir);
  const hit = entries.find((e) => e.isFile() && e.name === `${stem} — hero.png`)
    ?? entries.find((e) => e.isFile() && / — hero\.png$/i.test(e.name));
  if (!hit) return null;
  const full = join(absBundleDir, hit.name);
  let size = null;
  try { size = statSync(full).size; } catch (_) { /* drawn without a cache-buster */ }
  const relPath = full.startsWith(root + sep) ? full.slice(root.length + 1).replaceAll(sep, '/') : full;
  return { name: hit.name, relPath, size };
}

// An entry's faces (CHILD.md § A page and its folder): the text always; the
// rich face when its bundle holds `<Title> — rich.json`, the manifest
// Enrichment writes; the scroll when it holds `<Title> — scroll.md`. The bundle
// is the signal — no line in the body announces a face. Only the bundle's own
// manifest counts, never a workshop copy under `_ops/rich-face/manifests/`.
// This is what the bundle carries, which the public build ships; the live
// face switch offers the rich face on every page all the same (faces.js).
// Returns { faces: ['text', ...], files: { rich?, scroll? } } with
// palace-relative paths.
export function facesFor(palaceRoot, absBundleDir) {
  const faces = ['text'];
  const files = {};
  if (typeof absBundleDir !== 'string' || absBundleDir === '') return { faces, files };
  const root = resolve(palaceRoot);
  const stem = basename(absBundleDir);
  for (const [face, name] of [['rich', `${stem} — rich.json`], ['scroll', `${stem} — scroll.md`]]) {
    const full = join(absBundleDir, name);
    try {
      if (existsSync(full) && statSync(full).isFile()) {
        faces.push(face);
        files[face] = full.startsWith(root + sep) ? full.slice(root.length + 1).replaceAll(sep, '/') : full;
      }
    } catch (_) { /* unreadable → not a face */ }
  }
  return { faces, files };
}

// The inverse of facesFor for a face that is itself a markdown file: when
// `relPath` is `<Dir>/<Name>/<Name> — scroll.md`, return the owning entry
// `{ path: '<Dir>/<Name>.md', face: 'scroll' }`; otherwise null.
export function faceOwnerOf(relPath) {
  if (typeof relPath !== 'string') return null;
  const parts = relPath.split('/');
  if (parts.length < 2) return null;
  const file = parts[parts.length - 1];
  const dir = parts[parts.length - 2];
  if (file !== `${dir} — scroll.md`) return null;
  return { path: `${parts.slice(0, -1).join('/')}.md`, face: 'scroll' };
}

// An entry's memory (CHILD.md § A page and its folder; SCHEMA — Reference §8):
// what the next worker reads, not a face — so the reader offers it beside the
// face switch, not in the F cycle. The Context is `<Title> — Context.md`, else
// any top-level `* — context.md` (a bundle whose folder and title differ in
// case, as JEWEL/ holds `Jewel — Context.md`). A ledger is any top-level
// bundle `.md` whose frontmatter names `ledger:` (§6) — tuning, diary, and the
// rest — labelled by that value. Returns { context: rel|null, ledgers:
// [{ kind, path }] } with palace-relative paths; the baton is transient and
// stays in the bundle list.
export function memoryFor(palaceRoot, absBundleDir) {
  const memory = { context: null, ledgers: [] };
  if (typeof absBundleDir !== 'string' || absBundleDir === '') return memory;
  const root = resolve(palaceRoot);
  const toRel = (full) => (full.startsWith(root + sep) ? full.slice(root.length + 1).replaceAll(sep, '/') : full);
  let entries;
  try { entries = readdirSync(absBundleDir, { withFileTypes: true }); } catch (_) { return memory; }
  const files = entries.filter((e) => e.isFile() && e.name.endsWith('.md') && !isHidden(e.name));
  const stem = basename(absBundleDir);
  const ctx = files.find((e) => e.name === `${stem} — Context.md`)
    ?? files.find((e) => / — context\.md$/i.test(e.name));
  if (ctx) memory.context = toRel(join(absBundleDir, ctx.name));
  for (const e of files) {
    const kind = ledgerKindOf(join(absBundleDir, e.name));
    if (kind) memory.ledgers.push({ kind, path: toRel(join(absBundleDir, e.name)) });
  }
  memory.ledgers.sort((a, b) => a.kind.localeCompare(b.kind) || a.path.localeCompare(b.path));
  return memory;
}

// The `ledger:` value in a markdown file's frontmatter, or null. Reads only
// the head of the file — a ledger grows without bound.
function ledgerKindOf(absPath) {
  let head;
  try {
    const fd = openSync(absPath, 'r');
    try {
      const buf = Buffer.alloc(4096);
      head = buf.toString('utf8', 0, readSync(fd, buf, 0, buf.length, 0));
    } finally { closeSync(fd); }
  } catch (_) { return null; }
  const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(head);
  if (!fm) return null;
  const m = /^ledger:[ \t]*["']?([^"'\r\n#]+?)["']?[ \t]*(?:#.*)?$/m.exec(fm[1]);
  return m ? m[1].trim() : null;
}

// The entry a bundle file belongs to, by place alone: `<Dir>/<Name>/<file>` →
// `<Dir>/<Name>.md`. Whether the file is that entry's memory is the caller's
// check (memoryFor). Null at the root.
export function bundleOwnerOf(relPath) {
  if (typeof relPath !== 'string') return null;
  const parts = relPath.split('/');
  if (parts.length < 2) return null;
  return `${parts.slice(0, -1).join('/')}.md`;
}

// Classify a bundle file by extension so the UI can render media inline
// (image/audio/video/html) and treat the rest as openable files.
export function classifyFile(name) {
  const ext = extname(name).toLowerCase();
  if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) return 'image';
  if (['.wav', '.mp3', '.ogg', '.m4a', '.flac'].includes(ext)) return 'audio';
  if (['.mp4', '.webm', '.mov'].includes(ext)) return 'video';
  if (['.html', '.htm'].includes(ext)) return 'html';
  if (['.md', '.txt'].includes(ext)) return 'text';
  if (['.json', '.jsonl'].includes(ext)) return 'json';
  if (['.py', '.js', '.jsx', '.ts', '.tsx', '.css', '.sh'].includes(ext)) return 'code';
  if (ext === '.pdf') return 'pdf';
  return 'file';
}

function isHidden(name) {
  return name.startsWith('.') || BUNDLE_HIDDEN.has(name);
}

// List files inside a bundle folder. Returns an array of:
//   { name, relPath, ext, kind, size, depth }
// `relPath` is relative to the palace root (so it can be served by /api/file).
// Walks up to maxDepth levels deep (default 5, so a dated proof folder such as
// proofs/2026-10-20-name/ and the folders inside it are listed). Always sorted by relPath.
export function listBundleFiles(palaceRoot, absBundleDir, { maxDepth = 5 } = {}) {
  const root = resolve(palaceRoot);
  const out = [];
  function walk(dir, depth) {
    if (depth > maxDepth) return;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch (_) {
      return;
    }
    for (const ent of entries) {
      if (isHidden(ent.name)) continue;
      const full = join(dir, ent.name);
      if (ent.isDirectory()) {
        walk(full, depth + 1);
        continue;
      }
      if (!ent.isFile()) continue;
      let stat;
      try { stat = statSync(full); } catch (_) { continue; }
      // Compute palace-relative path.
      let rel = full;
      if (full.startsWith(root + sep)) rel = full.slice(root.length + 1);
      out.push({
        name: ent.name,
        relPath: rel,
        ext: extname(ent.name).toLowerCase(),
        kind: classifyFile(ent.name),
        size: stat.size,
        depth,
      });
    }
  }
  walk(absBundleDir, 1);
  out.sort((a, b) => a.relPath.localeCompare(b.relPath));
  return out;
}
