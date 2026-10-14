// server/commit.js -- the WRITE counterpart to git.js (which is read-only).
//
// Records a structured palace commit from the LOG deck: stage ONLY the
// explicitly-selected paths, derive the Palace-* trailers from their staged
// diff, and commit a spec-conformant message. The author supplies kind /
// scope / summary / Palace-Verify; the entry/stage/vector trailers are derived.
//
// Two safety lessons carried from scripts/palace-commit.mjs:
//   - NEVER `git add -A`. An N-writer repo (Claude + Cowork + the BBS) must not
//     sweep another session's work; only the named paths are staged, and the
//     commit is scoped to those pathspecs so a foreign pre-staged file is never
//     swept into this commit.
//   - Clear a stale git lock first, and only a stale one: a live lock belongs
//     to another session's commit and is waited out, never deleted
//     (./git-locks.js).
//
// A move: select BOTH sides, the old path and the new one (files or folders).
// The trailers are then derived against the entry at its old path, so a pure
// move derives no Palace-Stage / Palace-Vector line and a move with edits
// derives only the edits. The diff and the commit are both scoped to the
// selection, so one side alone is half a move: it is committed as the bare add
// or bare delete it is, the other half stays staged, and the result carries a
// `notes` line saying so. The selection is never widened to the other side.
//
// Pure trailer derivation lives in src/lib/commit-spec.js; this module is the
// thin async git/fs glue around it (replicated rather than imported from the
// CLI script so the app server bundles cleanly under vite/esbuild).

import { writeFileSync, rmSync, mkdtempSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { safePathspec } from './git.js';
import { execGit } from './git-wrapper.js';
import { clearStaleLocks, LockHeldError } from './git-locks.js';
import { withDoor, trunkProblem, DoorBusyError } from './door.js';
import { deriveTrailers, formatCommitMessage, parseNameStatus, VERIFY_VALUES } from '../src/lib/commit-spec.js';
import { KNOWN_KINDS } from '../src/lib/commit-parse.js';
import { diffEntryText } from '../src/lib/frontmatter-diff.js';

// Local alias preserves the existing call sites (`gitAsync(root, args)`).
const gitAsync = execGit;

// The selection is a list of PATHS, never patterns. Left alone, git reads the
// `*`, `?` and `[` in a pathspec as a glob: selecting `a[1].md` also takes
// `a1.md`, and the old side of a moved `Why?.md` (gone from disk, so no longer
// a literal match) picks up a neighbour. Every git call that is handed the
// selection leads with this. A folder still brings its files.
const LITERAL = ['--literal-pathspecs'];

// Lock handling lives in ./git-locks.js: a stale lock (old, no git running in
// this checkout) is removed and logged; a live one is waited out, then refused
// with LockHeldError. Re-exported for the server's other writers.
export { clearStaleLocks, LockHeldError };

// The staged name-status rows ({ status, path, renamedFrom }), optionally
// scoped to `scope` (pathspecs).
// `-c core.quotepath=false` forces RAW utf-8 paths in the output. Under git's
// default (quotepath=true) a non-ASCII path — every em-dash bundle file, e.g.
// `Foo — baton.md` — comes back octal-escaped + double-quoted, and the file
// silently fails to commit ("nothing staged") even though it WAS staged.
// `-M` pairs renames whatever the repo's `diff.renames` says; with it off a
// move arrives as an unrelated delete + add. Self-defending on both counts.
async function stagedNameStatus(palaceRoot, scope = null) {
  const tail = scope && scope.length ? ['--', ...scope] : [];
  const r = await gitAsync(palaceRoot, [...LITERAL, '-c', 'core.quotepath=false', 'diff', '--cached', '-M', '--name-status', ...tail], { allowFail: true });
  return parseNameStatus(r.stdout);
}

// True when `p` (a file or a folder) is gone from the working tree and from
// the index while HEAD still has it: a deletion that is already staged, such
// as the old side of a `git mv`. There is nothing left to add for such a path.
export async function isStagedDeletion(palaceRoot, p) {
  if (existsSync(resolve(palaceRoot, p))) return false;
  if ((await gitAsync(palaceRoot, [...LITERAL, 'ls-files', '--', p], { allowFail: true })).stdout.trim() !== '') return false;
  const d = await gitAsync(palaceRoot, [...LITERAL, 'diff', '--cached', '--no-renames', '--diff-filter=D', '--name-only', '--', p], { allowFail: true });
  return d.stdout.trim() !== '';
}

// Staged moves that `scoped` (the selection's own rows) holds only half of.
// With the other side left out, a move stops being a move: the new side alone
// commits as a bare add (and the log reads a birth), the old side alone as a
// bare delete. Returns [{ from, to, missing }] -- `missing` is the side that
// was not selected. (Mirrors halfNamedMoves in scripts/palace-commit.mjs.)
async function halfSelectedMoves(palaceRoot, scoped) {
  const out = [];
  // Half a move shows up in the selection as a bare add or a bare delete; with
  // neither there is nothing to look for (the usual case: an edited entry).
  if (!scoped.some((r) => r.status === 'A' || r.status === 'D')) return out;
  for (const { path: to, renamedFrom: from } of await stagedNameStatus(palaceRoot)) {
    if (!from) continue;
    if (scoped.some((r) => r.status === 'A' && r.path === to)) out.push({ from, to, missing: from });
    else if (scoped.some((r) => r.status === 'D' && r.path === from)) out.push({ from, to, missing: to });
  }
  return out;
}

/**
 * Stage the selected paths, derive trailers from THEIR staged diff, and commit
 * exactly those paths. Never throws; returns { ok, shortHash?, subject?,
 * committed?, message?, notes?, error? }. `committed` lists each file where it
 * now is (a moved file by its new path); `notes` is present only when there is
 * something to say (half of a staged move was committed).
 *
 * @param {string} palaceRoot
 * @param {object} opts
 * @param {string[]} opts.paths    palace-relative paths to commit (required, ≥1);
 *                                 a file or a folder; for a move, both sides
 * @param {string}   opts.kind     a KNOWN_KINDS value
 * @param {string}   opts.summary  the subject summary (required)
 * @param {string}   opts.verify   a VERIFY_VALUES value
 * @param {string}  [opts.scope]
 * @param {string}  [opts.body]
 * @param {string}  [opts.author]  Palace-Author (default 'loudon' — the BBS user)
 * @param {string}  [opts.campaign]
 * @param {string[]}[opts.resolves]
 */
export async function commitSelected(palaceRoot, opts = {}) {
  const {
    paths, kind, scope = null, summary, body = '', verify,
    author = 'loudon', campaign = null, resolves = [],
  } = opts;

  // ── validation ──
  if (!Array.isArray(paths) || paths.length === 0) return { ok: false, error: 'no files selected' };
  if (!KNOWN_KINDS.includes(kind)) return { ok: false, error: `kind must be one of: ${KNOWN_KINDS.join(', ')}` };
  if (typeof summary !== 'string' || summary.trim() === '') return { ok: false, error: 'summary is required' };
  if (!VERIFY_VALUES.includes(verify)) return { ok: false, error: `verify must be one of: ${VERIFY_VALUES.join(', ')}` };

  const safe = [];
  for (const p of paths) {
    const s = safePathspec(palaceRoot, p);
    if (!s) return { ok: false, error: `unsafe or out-of-palace path: ${p}` };
    safe.push(s);
  }

  // Everything from the first `git add` to the commit happens inside the door
  // (./door.js): one lock shared with every other palace committer, so no
  // other writer's git can interleave with this one on the shared index.
  const tmp = mkdtempSync(join(tmpdir(), 'stig-commit-'));
  try {
    return await withDoor(palaceRoot, `commit:${author}`, async (dgit) => {
      const problem = trunkProblem(palaceRoot);
      if (problem) return { ok: false, error: `refused: ${problem}` };

      // ── stage ONLY the selected paths (never -A) ──
      // A path that is already a staged deletion is skipped: `git add` dies on it
      // ("pathspec did not match any files"), yet it has to be selectable, because
      // a move is committed whole only when both of its sides are in the selection.
      for (const p of safe) {
        if (await isStagedDeletion(palaceRoot, p)) continue;
        const r = await dgit([...LITERAL, 'add', '--', p], { allowFail: true });
        if (r.failed) return { ok: false, error: `git add failed for "${p}": ${(r.stderr || '').trim()}` };
      }

      // ── derive trailers from the selected staged diff only ──
      // Scoped by the same pathspecs the commit below takes, so the message
      // describes exactly what is committed: a foreign staged file is left out, a
      // selected folder brings its files, and a rename is read as one only when
      // both of its sides are selected.
      const rows = await stagedNameStatus(palaceRoot, safe);
      const dpaths = [];
      const mdChanges = [];
      for (const { status, path, renamedFrom } of rows) {
        dpaths.push(path);
        if (!path.toLowerCase().endsWith('.md')) continue;
        // before = the HEAD side (empty if added), after = staged blob (:path).
        // A renamed entry's HEAD side lives at its OLD path. Reading HEAD:<new path>
        // finds nothing, every frontmatter field then reads as newly added, and a
        // pure move goes into the log as a birth (da73cb79: a false `born->sprout`).
        const before = status === 'A' ? '' : (await gitAsync(palaceRoot, ['show', `HEAD:${renamedFrom ?? path}`], { allowFail: true })).stdout;
        const after = status === 'D' ? '' : (await gitAsync(palaceRoot, ['show', `:${path}`], { allowFail: true })).stdout;
        const d = diffEntryText(before, after);
        mdChanges.push({ path, frontmatterChanges: d.frontmatterChanges, bodyChanged: d.bodyChanged, wasAdded: status === 'A' || (before === '' && after !== '') });
      }

      if (dpaths.length === 0) return { ok: false, error: 'nothing staged for the selected paths' };

      // Say so (never block) when the selection holds half of a staged move.
      const notes = (await halfSelectedMoves(palaceRoot, rows)).map((h) => {
        const half = h.missing === h.from ? 'a bare add, logged as a new file' : 'a bare delete';
        return `"${h.to}" looks like a staged move from "${h.from}", but "${h.missing}" was not selected, so this commit holds ${half}. The other half is still staged; select both to commit a move whole.`;
      });

      const trailers = deriveTrailers({ paths: dpaths, mdChanges, kind, verify, author, campaign, resolves });
      const message = formatCommitMessage({ kind, scope, summary, body, trailers });

      // ── commit exactly the selected pathspecs ──
      const msgFile = join(tmp, 'COMMIT_MSG');
      writeFileSync(msgFile, message, 'utf8');
      const res = await dgit([...LITERAL, 'commit', '-F', msgFile, '--', ...safe], { allowFail: true });
      if (res.failed) return { ok: false, error: (res.stderr || 'git commit failed').trim(), message };
      const shortHash = (await gitAsync(palaceRoot, ['rev-parse', '--short', 'HEAD'], { allowFail: true })).stdout.trim();
      const subject = (await gitAsync(palaceRoot, ['log', '-1', '--format=%s'], { allowFail: true })).stdout.trim();
      return { ok: true, shortHash, subject, committed: dpaths, message, ...(notes.length ? { notes } : {}) };
    });
  } catch (e) {
    if (e instanceof DoorBusyError || e instanceof LockHeldError) return { ok: false, error: e.message };
    return { ok: false, error: `commit failed: ${e.message}` };
  } finally {
    try { rmSync(tmp, { recursive: true, force: true }); } catch (_) { /* ignore */ }
  }
}
