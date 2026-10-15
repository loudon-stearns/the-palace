// server/landing.js -- landing a branch on main, and healing one that died.
//
// A landing changes three things in the palace's main checkout: main's ref,
// the shared index, and the files in Loudon's folder. Git moves the ref
// atomically, but it writes the files one by one and the index after them, so
// a landing killed halfway leaves the folder partly at the new version while
// main has not moved. Git then reads those files as somebody's unsaved edits
// and refuses every later landing over them.
//
// So a landing first writes a marker (old, new) into the git common dir, then
// lets git move the folder and main together (`git merge --ff-only` to a merge
// commit built outside the folder), then removes the marker. Whoever next holds
// the door and finds a marker heals the landing (Loudon, 2026-10-14: "handle
// it"):
//   - every file the landing changes sits at the old or the new version, or is
//     the one file git was writing when it died: finish it quietly -- write the
//     rest, set the index, move main -- and say so in one line;
//   - a file sits at neither version: that is someone's edit. Leave it alone
//     and name it, and undo the rest, so the folder agrees with main again and
//     the branch can simply be landed again;
//   - a marker palace-land itself gave up on (git refused, or failed, and the
//     session was told so) is always undone, never finished: a landing reported
//     as not done must not land later under someone else's commit.
//
// Git does the judging, so its own rules hold: filters and line endings, the
// executable bit, symlinks, a symlinked parent folder, and this Mac's
// case-insensitive disk. Which files sit at a version is asked of a scratch
// index holding only the landing's rows, refreshed against the folder. Each
// file the heal writes is fetched as git would check it out (one `git cat-file
// --batch --filters`), written whole into a scratch folder inside .git, and
// renamed into place, so a heal killed partway leaves every file at one
// version or the other, never missing or cut short. That is a handful of git
// calls whatever the landing's size.
//
// Git writes a landing in a fixed order: first it deletes, then it writes each
// changed file in index order, each by unlinking the old file and creating the
// new one. A kill therefore leaves at most one file in flight -- missing, or a
// front part of its new version -- with every file before it at the new
// version and none after it. Only that one file counts as in flight; any other
// file at neither version is someone's edit.
//
// The heal runs inside the door, through the door's own git (server/door.js),
// so the ear hears its move of main as through the door.

import { readFileSync, writeFileSync, renameSync, rmSync, rmdirSync, lstatSync, readdirSync, unlinkSync, mkdirSync, symlinkSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve, join, dirname } from 'node:path';

export const MARKER_FILE = 'palace-land.json';
const ZERO = '0000000000000000000000000000000000000000';
// A lock the dead landing left must still be there, unchanged, this much later:
// a live git renames its lock away within milliseconds of letting go of it.
const SETTLE_MS = 300;

function plainGit(root) {
  return (args, { input, env, allowFail = false } = {}) => {
    const res = spawnSync('git', args, {
      cwd: root,
      input,
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
      env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_LITERAL_PATHSPECS: '1', ...(env || {}) },
    });
    if (res.error) throw res.error;
    if (allowFail) return { stdout: res.stdout || '', stderr: res.stderr || '', status: res.status };
    if (res.status !== 0) {
      const e = new Error(`git ${args.join(' ')} failed: ${(res.stderr || '').trim()}`);
      e.stderr = res.stderr;
      e.status = res.status;
      throw e;
    }
    return res.stdout || '';
  };
}

export function commonDirOf(root) {
  return resolve(root, plainGit(root)(['rev-parse', '--git-common-dir']).trim());
}

export function markerPath(root) {
  return join(commonDirOf(root), MARKER_FILE);
}

/** The marker, null when there is none, or { unreadable: true } when it cannot be read. */
export function readMarker(root) {
  let text;
  try { text = readFileSync(markerPath(root), 'utf8'); } catch (_) { return null; }
  try {
    const m = JSON.parse(text);
    if (!m || !/^[0-9a-f]{40}$/.test(m.old) || !/^[0-9a-f]{40}$/.test(m.new)) return { unreadable: true };
    return m;
  } catch (_) { return { unreadable: true }; }
}

/** Written whole or not at all: a temporary file renamed into place. A marker
 * rewritten from an earlier one keeps that one's pid and time. */
export function writeMarker(root, marker) {
  const path = markerPath(root);
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify({ pid: process.pid, ts: new Date().toISOString(), ...marker })}\n`);
  renameSync(tmp, path);
}

export function clearMarker(root) {
  rmSync(markerPath(root), { force: true });
}

/** The main checkout: the first worktree git lists. */
export function mainCheckout(root) {
  const out = plainGit(root)(['worktree', 'list', '--porcelain']);
  const m = /^worktree (.+)$/m.exec(out);
  return m ? m[1] : resolve(root);
}

const byBytes = (a, b) => Buffer.compare(Buffer.from(a.path), Buffer.from(b.path));

// The paths a landing changes, with the blob and mode on each side ('' when absent).
function changes(git, oldRev, newRev) {
  const rows = [];
  const parts = git(['diff-tree', '-r', '-z', '--no-renames', oldRev, newRev]).split('\0');
  for (let i = 0; i + 1 < parts.length; i += 2) {
    if (!parts[i]) break;
    const [oldMode, newMode, oldBlob, newBlob] = parts[i].replace(/^:/, '').split(' ');
    rows.push({
      path: parts[i + 1],
      oldMode: oldMode === '000000' ? '' : oldMode,
      newMode: newMode === '000000' ? '' : newMode,
      oldBlob: oldBlob === ZERO ? '' : oldBlob,
      newBlob: newBlob === ZERO ? '' : newBlob,
    });
  }
  return rows.sort(byBytes);
}

const blobOf = (r, side) => (side === 'new' ? r.newBlob : r.oldBlob);
const modeOf = (r, side) => (side === 'new' ? r.newMode : r.oldMode);

function lstatOrNull(p) {
  try { return lstatSync(p); } catch (_) { return null; }
}

// True when a folder on the way to `path` is a symlink: git treats such a path
// as absent, and nothing here may delete or write through it.
function symlinkOnTheWay(root, path) {
  const parts = path.split('/');
  for (let i = 1; i < parts.length; i += 1) {
    const st = lstatOrNull(join(root, ...parts.slice(0, i)));
    if (!st) return false;
    if (st.isSymbolicLink()) return true;
  }
  return false;
}

// The rows whose file on disk is `side`'s version, as git judges it.
function matching(git, common, rows, side) {
  const present = rows.filter((r) => blobOf(r, side));
  const found = new Set();
  if (present.length === 0) return found;
  const tmp = join(common, `palace-land-${side}-${process.pid}.index`);
  rmSync(tmp, { force: true });
  try {
    const env = { GIT_INDEX_FILE: tmp };
    git(['update-index', '-z', '--index-info'], { input: present.map((r) => `${modeOf(r, side)} ${blobOf(r, side)}\t${r.path}\0`).join(''), env });
    git(['update-index', '-q', '--ignore-missing', '--refresh'], { env, allowFail: true });
    const differ = new Set(git(['diff-files', '-z', '--name-only'], { env }).split('\0').filter(Boolean));
    for (const r of present) if (!differ.has(r.path)) found.add(r.path);
  } finally {
    rmSync(tmp, { force: true });
    rmSync(`${tmp}.lock`, { force: true });
  }
  return found;
}

// Every file under `dir`, relative to root, without following symlinks.
function filesUnder(root, dir, out = []) {
  for (const name of readdirSync(join(root, dir))) {
    const rel = `${dir}/${name}`;
    const st = lstatSync(join(root, rel));
    if (st.isDirectory()) filesUnder(root, rel, out);
    else out.push(rel);
  }
  return out;
}

// True when `side` has no file at this row's path and nothing stands there: no
// file, or a symlinked folder on the way (git reads that as absent), or a
// folder holding only `side`'s own files (a file that became a folder).
function absentAt(root, rows, r, side) {
  if (symlinkOnTheWay(root, r.path)) return true;
  const st = lstatOrNull(join(root, r.path));
  if (!st) return true;
  if (!st.isDirectory()) return false;
  const mine = new Set(rows.filter((x) => blobOf(x, side) && x.path.startsWith(`${r.path}/`)).map((x) => x.path));
  if (mine.size === 0) return false;
  return filesUnder(root, r.path).every((f) => mine.has(f));
}

// True when the file on disk is the front part of `blob` as git would write it
// at this path (empty counts: git creates the file, then writes it).
function frontOf(root, r) {
  const st = lstatOrNull(join(root, r.path));
  if (!st || !st.isFile()) return false;
  const disk = readFileSync(join(root, r.path));
  const want = execFileSync('git', ['cat-file', '--filters', `--path=${r.path}`, r.newBlob], { cwd: root, maxBuffer: 1024 * 1024 * 1024 });
  return disk.length < want.length && want.subarray(0, disk.length).equals(disk);
}

// Sort each changed row by where its file sits now.
function classify(git, root, common, rows) {
  const newer = matching(git, common, rows, 'new');
  const older = matching(git, common, rows, 'old');
  const atNew = new Set();
  const atOld = new Set();
  for (const r of rows) {
    if (r.newBlob ? newer.has(r.path) : absentAt(root, rows, r, 'new')) atNew.add(r.path);
    else if (r.oldBlob ? older.has(r.path) : absentAt(root, rows, r, 'old')) atOld.add(r.path);
  }
  // The one file git may have been writing when it died: the first file it
  // writes that is not at the new version, with no later one at the new
  // version (git had not got that far), and the file missing (git unlinked the
  // old one) or a front part of the new one. A later file at neither version
  // does not change that: it is someone's edit, whatever git was doing.
  let inFlight = null;
  const writes = rows.filter((r) => r.newBlob);
  const k = writes.findIndex((r) => !atNew.has(r.path));
  if (k >= 0 && !atOld.has(writes[k].path) && !writes.slice(k + 1).some((r) => atNew.has(r.path))) {
    const r = writes[k];
    const missing = r.oldBlob && !symlinkOnTheWay(root, r.path) && !lstatOrNull(join(root, r.path));
    if (missing || frontOf(root, r)) inFlight = r.path;
  }
  const neither = rows.filter((r) => !atNew.has(r.path) && !atOld.has(r.path) && r.path !== inFlight).map((r) => r.path);
  return { atNew, atOld, inFlight, neither };
}

// Set the index entries of `rows` to `side`, writing only those that differ.
function setIndex(git, rows, side) {
  // The whole index is read once (the palace's lists in milliseconds) and
  // filtered here; ls-files cannot take a long path list on stdin.
  const want = new Set(rows.map((r) => r.path));
  const now = new Map();
  for (const e of git(['ls-files', '-s', '-z']).split('\0')) {
    const m = /^(\d+) ([0-9a-f]{40}) (\d)\t(.*)$/s.exec(e);
    if (m && m[3] === '0' && want.has(m[4])) now.set(m[4], `${m[1]} ${m[2]}`);
  }
  const lines = [];
  for (const r of rows) {
    const blob = blobOf(r, side);
    const want = blob ? `${modeOf(r, side)} ${blob}` : null;
    if ((now.get(r.path) || null) === want) continue;
    lines.push(blob ? `${want}\t${r.path}\0` : `0 ${ZERO}\t${r.path}\0`);
  }
  if (lines.length) git(['update-index', '-z', '--index-info'], { input: lines.join('') });
  return lines.length;
}

// Delete a file the target side does not have, as git would: never through a
// symlinked folder, never a folder, and remove folders it leaves empty.
function removeFile(root, path) {
  if (symlinkOnTheWay(root, path)) return false;
  const st = lstatOrNull(join(root, path));
  if (!st || st.isDirectory()) return false;
  unlinkSync(join(root, path));
  for (let d = dirname(path); d && d !== '.'; d = dirname(d)) {
    try { rmdirSync(join(root, d)); } catch (_) { break; }
  }
  return true;
}

// The bytes of each row's `side` blob as git would write them at that path:
// one cat-file for the files (through the path's filters), one for symlinks.
function blobContents(root, rows, side) {
  const out = new Map();
  const fetch = (list, filters) => {
    if (!list.length) return;
    const args = ['cat-file', '--batch', '-z', ...(filters ? ['--filters'] : [])];
    const input = list.map((r) => (filters ? `${blobOf(r, side)} ${r.path}\0` : `${blobOf(r, side)}\0`)).join('');
    const buf = execFileSync('git', args, { cwd: root, input, maxBuffer: 4 * 1024 * 1024 * 1024, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } });
    let at = 0;
    for (const r of list) {
      const nl = buf.indexOf(10, at);
      const head = buf.subarray(at, nl).toString('utf8').split(' ');
      if (head[1] !== 'blob') throw new Error(`git could not give ${r.path} at ${blobOf(r, side)}: ${head.join(' ')}`);
      const size = Number(head[2]);
      out.set(r.path, buf.subarray(nl + 1, nl + 1 + size));
      at = nl + 1 + size + 1;
    }
  };
  fetch(rows.filter((r) => modeOf(r, side) !== '120000'), true);
  fetch(rows.filter((r) => modeOf(r, side) === '120000'), false);
  return out;
}

// Write each row's `side` version whole: into a scratch folder inside .git,
// then renamed over the path, so the file is at its old version or its new one
// at every instant. A folder still standing where a file goes, or a symlinked
// folder on the way, is someone's, and is named rather than written through.
function writeWhole(root, common, rows, side) {
  const blocked = [];
  const ok = [];
  for (const r of rows) {
    if (symlinkOnTheWay(root, r.path)) { blocked.push(r.path); continue; }
    const st = lstatOrNull(join(root, r.path));
    if (st && st.isDirectory()) {
      try { rmdirSync(join(root, r.path)); } catch (_) { blocked.push(r.path); continue; }
    }
    ok.push(r);
  }
  if (!ok.length) return blocked;
  const contents = blobContents(root, ok, side);
  const scratch = join(common, `palace-land-tmp-${process.pid}`);
  mkdirSync(scratch, { recursive: true });
  try {
    ok.forEach((r, i) => {
      const tmp = join(scratch, String(i));
      if (modeOf(r, side) === '120000') symlinkSync(contents.get(r.path).toString('utf8'), tmp);
      else writeFileSync(tmp, contents.get(r.path), { mode: modeOf(r, side) === '100755' ? 0o777 : 0o666 }); // less the umask, as git does
      try {
        mkdirSync(dirname(join(root, r.path)), { recursive: true });
        renameSync(tmp, join(root, r.path));
      } catch (_) {
        rmSync(tmp, { force: true });
        blocked.push(r.path);
      }
    });
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
  return blocked;
}

// Bring `rows` (minus `leave`) to `side`: the file in flight first, then the
// deletions that side needs, then every other file not at it now, in index
// order. A heal killed partway therefore never strands the file in flight, and
// leaves the rest as a clean split between the two versions.
function bringTo(git, root, common, rows, side, { at, inFlight, leave }) {
  const skip = new Set(leave);
  const blocked = [];
  const flight = inFlight && !skip.has(inFlight) ? rows.find((r) => r.path === inFlight) : null;
  if (flight) {
    if (blobOf(flight, side)) blocked.push(...writeWhole(root, common, [flight], side));
    else removeFile(root, flight.path);
  }
  for (const r of rows) {
    if (r === flight || skip.has(r.path) || blobOf(r, side)) continue;
    if (!at.has(r.path)) removeFile(root, r.path);
  }
  const rest = rows.filter((r) => r !== flight && !skip.has(r.path) && blobOf(r, side)
    && (!at.has(r.path) || !lstatOrNull(join(root, r.path))));
  blocked.push(...writeWhole(root, common, rest, side));
  git(['update-index', '-q', '--refresh'], { allowFail: true });
  return { blocked };
}

// Scratch a heal killed partway left in the common dir: its scratch indexes
// and its write folder, named by a pid that is no longer running.
function sweepScratch(common) {
  let names = [];
  try { names = readdirSync(common); } catch (_) { return; }
  for (const n of names) {
    const m = /^palace-land-(?:tmp|new|old)-(\d+)(?:\.index(?:\.lock)?)?$/.exec(n);
    if (!m || Number(m[1]) === process.pid) continue;
    let alive = false;
    try { process.kill(Number(m[1]), 0); alive = true; } catch (e) { alive = e.code === 'EPERM'; }
    if (!alive) rmSync(join(common, n), { recursive: true, force: true });
  }
}

// The dead landing's own locks. Every git the landing started held the door's
// lock, so once this process holds the door they have all exited, and a lock
// they left is debris. A lock is the landing's when it was made after the
// marker, nobody has it open (git keeps a lock open for as long as it holds
// it), and it is still there, unchanged, a moment later. Returns the path of a
// lock that is still someone's, or null when the way is clear.
function clearDeadLocks(git, root, marker, { settleMs = SETTLE_MS } = {}) {
  const since = Date.parse(marker.ts || '') - 2000;
  const paths = git(['rev-parse', '--git-path', 'index.lock', '--git-path', 'HEAD.lock', '--git-path', 'refs/heads/main.lock'])
    .split('\n').filter(Boolean).map((p) => resolve(root, p));
  const found = paths.map((p) => [p, lstatOrNull(p)]).filter(([, st]) => st);
  if (found.length === 0) return null;
  for (const [p, st] of found) {
    if (!Number.isFinite(since) || st.mtimeMs < since) return p; // older than the landing: not its debris
    const open = spawnSync('lsof', ['-t', '--', p], { encoding: 'utf8' });
    if (open.error || (open.status !== 0 && open.status !== 1) || (open.stdout || '').trim()) return p;
  }
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, settleMs);
  for (const [p, st] of found) {
    const again = lstatOrNull(p);
    if (!again) continue;
    if (again.ino !== st.ino || again.mtimeMs !== st.mtimeMs) return p;
    rmSync(p, { force: true });
  }
  return null;
}

const files = (n) => `${n} file${n === 1 ? '' : 's'}`;
const listOf = (names) => (names.length > 6 ? `${names.slice(0, 6).join(', ')} and ${names.length - 6} more` : names.join(', '));

/**
 * Heal a landing that died, if one did. Call only while holding the door, with
 * the door's git (`git(args, { input, env, allowFail })`). Returns null when
 * there is no marker; { waiting, lock } when a lock is still held by a running
 * git (try again shortly); { stuck, line } when the main checkout is in no state
 * to be written (the marker stays); else { finished, undone, named, line }, the
 * marker cleared. `trunkProblem(root)` names a state that forbids writing.
 */
export function recoverLanding(anyRoot, { git: doorGit = null, tag = 'land', trunkProblem = null } = {}) {
  const marker = readMarker(anyRoot);
  if (!marker) return null;
  const root = marker.root || mainCheckout(anyRoot);
  if (marker.unreadable) {
    clearMarker(anyRoot);
    return { finished: false, undone: false, named: [], line: 'a landing marker could not be read (it is written whole, so no landing was under way); it is cleared' };
  }
  const git = doorGit || plainGit(root);
  const common = commonDirOf(root);
  const name = marker.branch || marker.new.slice(0, 8);

  const problem = trunkProblem ? trunkProblem(root) : null;
  if (problem) return { stuck: true, line: `a landing that died halfway (${name}) waits: ${problem}` };

  const held = clearDeadLocks(git, root, marker);
  if (held) return { waiting: true, lock: held };
  sweepScratch(common);

  const main = git(['rev-parse', 'refs/heads/main']).trim();
  if (main === marker.new) {
    clearMarker(root);
    return { finished: true, undone: false, named: [], line: `landing ${marker.new.slice(0, 8)} (${name}) had finished; its marker is cleared` };
  }

  const rows = changes(git, marker.old, marker.new);
  let undoOnly = !!(marker.abandon || marker.undo);
  if (main !== marker.old) {
    // Main moved on while the marker stood. If nothing since touched the
    // landing's files, main still has their old versions: undo against it.
    const ancestor = git(['merge-base', '--is-ancestor', marker.old, main], { allowFail: true }).status === 0;
    const mine = new Set(rows.map((r) => r.path));
    const touched = ancestor
      ? git(['diff-tree', '-r', '-z', '--no-renames', '--name-only', marker.old, main]).split('\0').filter((p) => mine.has(p))
      : ['?'];
    if (touched.length) {
      const { atNew, inFlight } = classify(git, root, common, rows);
      const left = rows.filter((r) => atNew.has(r.path) && (r.newBlob || r.oldBlob)).map((r) => r.path).concat(inFlight ? [inFlight] : []);
      clearMarker(root);
      return { finished: false, undone: false, named: left, line: `a landing that died halfway (${name}) can no longer be healed: main has moved to ${main.slice(0, 8)} and changed its files since. Nothing was changed${left.length ? `; left at the landing's version: ${listOf(left)}` : ''}.` };
    }
    undoOnly = true;
  }

  const c = classify(git, root, common, rows);
  if (!undoOnly && c.neither.length === 0) {
    setIndex(git, rows, 'new');
    const { blocked } = bringTo(git, root, common, rows, 'new', { at: c.atNew, inFlight: c.inFlight, leave: [] });
    if (blocked.length) {
      return { stuck: true, line: `a landing that died halfway (${name}) waits: a folder or symlink stands where it writes ${listOf(blocked)}` };
    }
    git(['update-ref', '-m', `land: finished ${name}, which died halfway`, 'refs/heads/main', marker.new, marker.old], { env: { PALACE_DOOR_TAG: `${tag}:heal` } });
    clearMarker(root);
    return { finished: true, undone: false, named: [], line: `finished a landing that died halfway: ${name}, ${files(rows.length)}; main is now ${marker.new.slice(0, 8)}` };
  }

  // Once an undo begins it is the direction for good: a heal killed partway
  // through it is carried on by the next pass, never turned into a finish.
  if (!marker.abandon && !marker.undo) writeMarker(root, { ...marker, undo: true });
  setIndex(git, rows, 'old');
  bringTo(git, root, common, rows, 'old', { at: c.atOld, inFlight: c.inFlight, leave: c.neither });
  clearMarker(root);
  if (c.neither.length === 0) {
    return { finished: false, undone: true, named: [], line: marker.abandon ? `undid the landing of ${name} that palace-land gave up on; main is still ${main.slice(0, 8)}` : `undid a landing that died halfway (${name}): main had moved on, so it is put back; land it again` };
  }
  return { finished: false, undone: true, named: c.neither, line: `undid a landing that died halfway (${name}): ${c.neither.length === 1 ? 'a file is' : `${c.neither.length} files are`} at neither version, so someone has edited ${c.neither.length === 1 ? 'it' : 'them'}, left alone: ${listOf(c.neither)}. Land the branch again when ${c.neither.length === 1 ? 'that file is' : 'those files are'} settled.` };
}
