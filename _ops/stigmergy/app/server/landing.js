// server/landing.js -- landing a branch on main, and finishing one that died.
//
// A landing changes three things in the palace's main checkout: main's ref,
// the shared index, and the files in Loudon's folder. Git moves the ref
// atomically, but the files and the index are written one by one, so a
// landing killed halfway leaves the folder partly at the new version while
// main has not moved. Git then reads those files as somebody's unsaved edits
// and refuses every later landing over them.
//
// So a landing first writes a marker (old, new) into the git common dir, then
// lets git move the folder and main together (`git merge --ff-only` to a merge
// commit built outside the folder), then removes the marker. Whoever next holds
// the door and finds a marker finishes the landing (Loudon, 2026-10-14:
// "handle it"):
//   - every file the landing changes sits at the old or the new version, or
//     was cut short while git wrote it (its bytes are the start of the new
//     version): finish it quietly -- write the rest, set the index, move main --
//     and say so in one line;
//   - a file sits at neither version: that is someone's edit. Leave it alone
//     and name it, and undo the rest of the landing, so the folder agrees with
//     main again and the branch can simply be landed again.

import { existsSync, readFileSync, writeFileSync, rmSync, mkdirSync, lstatSync, readlinkSync, symlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolve, join, dirname } from 'node:path';

export const MARKER_FILE = 'palace-land.json';
const ZERO = '0000000000000000000000000000000000000000';

function sh(root, args, { input, allowFail = false } = {}) {
  try {
    return execFileSync('git', args, {
      cwd: root,
      input,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_LITERAL_PATHSPECS: '1' },
    });
  } catch (e) {
    if (allowFail) return null;
    throw e;
  }
}

function commonDirOf(root) {
  return resolve(root, sh(root, ['rev-parse', '--git-common-dir']).trim());
}

export function markerPath(root) {
  return join(commonDirOf(root), MARKER_FILE);
}

export function readMarker(root) {
  try { return JSON.parse(readFileSync(markerPath(root), 'utf8')); } catch (_) { return null; }
}

export function writeMarker(root, marker) {
  writeFileSync(markerPath(root), `${JSON.stringify({ ...marker, pid: process.pid, ts: new Date().toISOString() })}\n`);
}

export function clearMarker(root) {
  rmSync(markerPath(root), { force: true });
}

/** The main checkout: the first worktree git lists. */
export function mainCheckout(root) {
  const out = sh(root, ['worktree', 'list', '--porcelain']);
  const m = /^worktree (.+)$/m.exec(out);
  return m ? m[1] : resolve(root);
}

// The paths a landing changes, with the blob and mode on each side ('' when absent).
function changes(root, oldRev, newRev) {
  const rows = [];
  const out = sh(root, ['diff-tree', '-r', '-z', '--no-renames', oldRev, newRev]);
  const parts = out.split('\0').filter((x, i, a) => !(x === '' && i === a.length - 1));
  for (let i = 0; i + 1 < parts.length; i += 2) {
    const meta = parts[i].replace(/^:/, '').split(' ');
    const [oldMode, newMode, oldBlob, newBlob] = meta;
    rows.push({
      path: parts[i + 1],
      oldMode: oldMode === '000000' ? '' : oldMode,
      newMode: newMode === '000000' ? '' : newMode,
      oldBlob: oldBlob === ZERO ? '' : oldBlob,
      newBlob: newBlob === ZERO ? '' : newBlob,
    });
  }
  return rows;
}

// The blob the file on disk would be, or '' when there is no file.
function diskBlob(root, path) {
  const abs = join(root, path);
  let st;
  try { st = lstatSync(abs); } catch (_) { return ''; }
  if (st.isSymbolicLink()) return sh(root, ['hash-object', '--stdin'], { input: readlinkSync(abs) }).trim();
  if (st.isDirectory()) return 'dir';
  return sh(root, ['hash-object', '--', path]).trim();
}

// True when the file on disk is the new version cut short: git writes a file
// front to back, so a write killed partway leaves a strict prefix of the new
// content (possibly empty). Someone's real edit is not a prefix of the new
// version except by an accident too unlikely to design for.
function tornWrite(root, path, newBlob) {
  if (!newBlob) return false;
  const abs = join(root, path);
  let st;
  try { st = lstatSync(abs); } catch (_) { return false; }
  if (!st.isFile()) return false;
  const disk = readFileSync(abs);
  const want = execFileSync('git', ['cat-file', 'blob', newBlob], { cwd: root, maxBuffer: 1024 * 1024 * 1024 });
  return disk.length < want.length && want.subarray(0, disk.length).equals(disk);
}

function writeSide(root, path, blob, mode) {
  const abs = join(root, path);
  if (!blob) { rmSync(abs, { force: true }); return; }
  mkdirSync(dirname(abs), { recursive: true });
  rmSync(abs, { force: true });
  if (mode === '120000') {
    symlinkSync(sh(root, ['cat-file', 'blob', blob]), abs);
    return;
  }
  const buf = execFileSync('git', ['cat-file', 'blob', blob], { cwd: root, maxBuffer: 1024 * 1024 * 1024 });
  writeFileSync(abs, buf, { mode: mode === '100755' ? 0o755 : 0o644 });
}

function setIndex(root, rows, side) {
  const lines = rows.map((r) => {
    const blob = side === 'new' ? r.newBlob : r.oldBlob;
    const mode = side === 'new' ? r.newMode : r.oldMode;
    return blob ? `${mode} ${blob}\t${r.path}` : `0 ${ZERO}\t${r.path}`;
  });
  if (lines.length) sh(root, ['update-index', '--index-info'], { input: `${lines.join('\n')}\n` });
}

/**
 * Finish or undo a landing that died, if one did. Call only while holding the
 * door. Returns null when there was nothing to do, else
 * { finished, undone, files, named, line } where `line` is the one sentence to say.
 */
export function recoverLanding(anyRoot) {
  const marker = readMarker(anyRoot);
  if (!marker) return null;
  const root = marker.root || mainCheckout(anyRoot);
  const main = sh(root, ['rev-parse', 'refs/heads/main']).trim();

  if (main === marker.new) {
    // Git finished: main only moves after the files and the index are written.
    clearMarker(root);
    return { finished: true, undone: false, files: 0, named: [], line: `landing ${marker.new.slice(0, 8)} had finished; its marker was left behind and is cleared` };
  }
  if (main !== marker.old) {
    clearMarker(root);
    return { finished: false, undone: false, files: 0, named: [], line: `a landing marker named ${marker.old.slice(0, 8)}, but main is at ${main.slice(0, 8)}: something moved main around the door; nothing was changed` };
  }

  const rows = changes(root, marker.old, marker.new);
  const atNew = [];
  const atOld = [];
  const torn = [];
  const neither = [];
  for (const r of rows) {
    const d = diskBlob(root, r.path);
    if (d === r.newBlob) atNew.push(r);
    else if (d === r.oldBlob) atOld.push(r);
    else if (tornWrite(root, r.path, r.newBlob)) torn.push(r); // cut short by the kill
    else neither.push(r);
  }

  if (neither.length === 0) {
    for (const r of [...atOld, ...torn]) writeSide(root, r.path, r.newBlob, r.newMode);
    setIndex(root, rows, 'new');
    sh(root, ['update-ref', '-m', `land: finished ${marker.branch || 'a landing'} that died halfway`, 'refs/heads/main', marker.new, marker.old]);
    clearMarker(root);
    return { finished: true, undone: false, files: rows.length, named: [], line: `finished a landing that died halfway: ${marker.branch || marker.new.slice(0, 8)}, ${rows.length} file${rows.length === 1 ? '' : 's'}; main is now ${marker.new.slice(0, 8)}` };
  }

  for (const r of [...atNew, ...torn]) writeSide(root, r.path, r.oldBlob, r.oldMode);
  setIndex(root, rows, 'old');
  clearMarker(root);
  const names = neither.map((r) => r.path);
  return { finished: false, undone: true, files: atNew.length + torn.length, named: names, line: `undid a landing that died halfway (${marker.branch || marker.new.slice(0, 8)}): ${names.length} file${names.length === 1 ? ' is' : 's are'} at neither version, so someone has edited ${names.length === 1 ? 'it' : 'them'}, left alone: ${names.join(', ')}. Land the branch again when ${names.length === 1 ? 'that file is' : 'those files are'} settled.` };
}
