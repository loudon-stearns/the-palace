#!/usr/bin/env node
// palace-commit — the single structured producer of palace commits.
//
// Claude (and STIGMERGY's STATE save path, Phase 5) call this instead of raw
// `git commit`. It stages the paths you name, reads the staged diff, derives
// the Palace-* trailers from it, and commits a spec-conformant message --
// you supply only the kind, summary, and the Palace-Verify honesty call.
//
// Usage:
//   node scripts/palace-commit.mjs \
//     --kind edit --scope "Foo" --summary "tweak the vector" \
//     --verify verified [--body "..."] [--campaign slug] [--resolves id] \
//     --path "Foo.md" [--path "Bar.md"] [--author claude] [--dry-run]
//
// It commits exactly the named paths, nothing else: anything another writer
// has staged stays staged and out of this commit (`git commit --only`), and
// the new hash is printed as `palace-commit: committed <hash>`. With no --path
// it refuses; it never commits whatever happens to be staged. An unknown flag
// is refused too (a misspelt `--paths` once meant "commit the whole index").
// `--only` is still accepted and changes nothing: it is always on.
//
// Every commit goes through the door (server/door.js): one lock, shared with
// every other palace committer, held from the first `git add` to the commit.
// A committer that finds the door shut waits its turn; after DOOR_TIMEOUT_MS it
// gives up with exit 75 and nothing staged. Inside the door it refuses, with
// exit 2, when the palace's main checkout is off main or a merge is half done.
// A stale git lock (old, with no git running in this checkout) is cleared and
// said so; a live one is waited out and then refused with exit 75, never
// deleted from under another session's commit (server/git-locks.js).
//
// With --dry-run it prints the message it WOULD commit and exits. It builds
// that message in a throwaway index, so it stages nothing and takes no lock.
//
// A move (`git mv`): name BOTH sides, `--path "<old>" --path "<new>"` (files or
// folders). The trailers are then derived against the entry at its old path, so
// a pure move derives no Palace-Stage / Palace-Vector line and a move with
// edits derives only the edits. Under --only, naming one side commits half the
// move; the committer says so on stderr. A named path is committed as it sits
// in the working tree, so an unstaged edit to a moved file rides along.
//
// Design notes:
//   - Trailer derivation is pure (src/lib/commit-spec.js); this file is the
//     git/fs glue around it, kept thin and testable via buildMessageFromStaged.
//   - Entries/stages/vectors are derived from the staged frontmatter diff, so
//     the author never types them.
//   - NEVER `git add -A`: an N-writer repo must not sweep another session's
//     work (the hard Phase 2 lesson). Only explicit --path args are staged.

import { execFileSync } from 'node:child_process';
import { existsSync, rmSync, writeFileSync, mkdtempSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { deriveTrailers, formatCommitMessage, parseNameStatus } from '../src/lib/commit-spec.js';
import { diffEntryText } from '../src/lib/frontmatter-diff.js';
import { clearStaleLocksSync, LockHeldError } from '../server/git-locks.js';
import { withDoorSync, trunkProblem, DoorBusyError } from '../server/door.js';

// Reads never take git's optional index lock (a `git diff` that refreshes the
// index would otherwise compete with a writer for index.lock). Pathspecs are
// literal everywhere: a named `Why?.md` means that file, never also `Why2.md`.
function git(palaceRoot, args, { allowFail = false, env = null } = {}) {
  try {
    return execFileSync('git', args, {
      cwd: palaceRoot,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_LITERAL_PATHSPECS: '1', ...(env || {}) },
    });
  } catch (e) {
    if (allowFail) return '';
    throw e;
  }
}

// Lock handling lives in server/git-locks.js, shared with the STIGMERGY
// server's committer. Re-exported under the old name for existing callers.
export { clearStaleLocksSync as clearStaleLocks, LockHeldError };

// The staged name-status rows ({ status, path, renamedFrom }), optionally
// scoped to `onlyPaths`.
function stagedNameStatus(palaceRoot, onlyPaths = null, gitOpts = {}) {
  // `-c core.quotepath=false`: RAW utf-8 paths, so a non-ASCII filename (every
  // em-dash bundle file, e.g. `Foo — baton.md`) parses + matches instead of
  // coming back octal-escaped + double-quoted. Without it the file stages but is
  // silently dropped from the commit. (Mirrors commitSelected in server/commit.js.)
  // `-M`: pair renames whatever the reader's `diff.renames` says, for the same
  // reason -- with it off a move arrives as an unrelated delete + add.
  const scope = onlyPaths && onlyPaths.length ? ['--', ...onlyPaths] : [];
  return parseNameStatus(git(palaceRoot, ['-c', 'core.quotepath=false', 'diff', '--cached', '-M', '--name-status', ...scope], { allowFail: true, ...gitOpts }));
}

// True when `p` (a file or a folder) is gone from the working tree and from
// the index while HEAD still has it: a deletion that is already staged, such
// as the old side of a `git mv`. There is nothing left to add for such a path.
export function isStagedDeletion(palaceRoot, p) {
  if (existsSync(resolve(palaceRoot, p))) return false;
  if (git(palaceRoot, ['ls-files', '--', p], { allowFail: true }).trim() !== '') return false;
  return git(palaceRoot, ['diff', '--cached', '--no-renames', '--diff-filter=D', '--name-only', '--', p], { allowFail: true }).trim() !== '';
}

// Staged moves that `--only` would cut in half. Under --only the diff and the
// commit are both scoped to the named paths, so a move whose other side is not
// named stops being a move: the new side alone commits as a bare add (and the
// log reads a birth), the old side alone as a bare delete, and the other half
// stays staged. Returns [{ from, to, missing }] -- `missing` is the unnamed side.
export function halfNamedMoves(palaceRoot, onlyPaths) {
  const scoped = stagedNameStatus(palaceRoot, onlyPaths);
  const out = [];
  for (const { path: to, renamedFrom: from } of stagedNameStatus(palaceRoot)) {
    if (!from) continue;
    if (scoped.some((r) => r.status === 'A' && r.path === to)) out.push({ from, to, missing: from });
    else if (scoped.some((r) => r.status === 'D' && r.path === from)) out.push({ from, to, missing: to });
  }
  return out;
}

// Read the staged diff and compute per-md frontmatter changes. Returns
// { paths, mdChanges } in the shape deriveTrailers expects.
export function readStagedDiff(palaceRoot, onlyPaths = null, gitOpts = {}) {
  const paths = [];
  const mdChanges = [];
  for (const { status, path, renamedFrom } of stagedNameStatus(palaceRoot, onlyPaths, gitOpts)) {
    paths.push(path);
    if (!path.toLowerCase().endsWith('.md')) continue;

    // before = the HEAD side (empty if added), after = staged blob (:path).
    // A renamed entry's HEAD side lives at its OLD path. Reading HEAD:<new path>
    // finds nothing, every frontmatter field then reads as newly added, and a
    // pure move goes into the log as a birth (da73cb79: a false `born->sprout`).
    const before = status === 'A' ? '' : git(palaceRoot, ['show', `HEAD:${renamedFrom ?? path}`], { allowFail: true, ...gitOpts });
    const after = status === 'D' ? '' : git(palaceRoot, ['show', `:${path}`], { allowFail: true, ...gitOpts });
    const d = diffEntryText(before, after);
    mdChanges.push({
      path,
      frontmatterChanges: d.frontmatterChanges,
      bodyChanged: d.bodyChanged,
      wasAdded: status === 'A' || (before === '' && after !== ''),
    });
  }
  return { paths, mdChanges };
}

// Build the full commit message from the staged diff + the author's inputs.
// Pure-ish: only reads git (no commit). Exposed for tests.
export function buildMessageFromStaged(palaceRoot, opts, gitOpts = {}) {
  const { paths, mdChanges } = readStagedDiff(palaceRoot, opts.only ? opts.paths : null, gitOpts);
  const trailers = deriveTrailers({
    paths,
    mdChanges,
    kind: opts.kind,
    verify: opts.verify,
    author: opts.author ?? 'claude',
    campaign: opts.campaign ?? null,
    resolves: opts.resolves ?? [],
    explicitEntries: opts.explicitEntries ?? null,
  });
  return formatCommitMessage({
    kind: opts.kind,
    scope: opts.scope ?? null,
    summary: opts.summary,
    body: opts.body ?? '',
    trailers,
  });
}

// Flags that take a value, and flags that stand alone. Anything else is
// refused: a misspelt flag once passed silently, and a deposit template's
// `--paths` (which does not exist) meant "commit whatever happens to be staged".
const VALUE_FLAGS = new Set(['--kind', '--scope', '--summary', '--body', '--verify', '--author', '--campaign', '--resolves', '--path']);
const BARE_FLAGS = new Set(['--dry-run', '--only']);

export function parseArgs(argv) {
  const opts = { resolves: [], paths: [], unknown: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (VALUE_FLAGS.has(a)) {
      const v = argv[++i];
      if (v === undefined) { opts.unknown.push(`${a} (no value)`); break; }
      switch (a) {
        case '--kind': opts.kind = v; break;
        case '--scope': opts.scope = v; break;
        case '--summary': opts.summary = v; break;
        case '--body': opts.body = v; break;
        case '--verify': opts.verify = v; break;
        case '--author': opts.author = v; break;
        case '--campaign': opts.campaign = v; break;
        case '--resolves': opts.resolves.push(v); break;
        case '--path': opts.paths.push(v); break;
        default: break;
      }
    } else if (BARE_FLAGS.has(a)) {
      if (a === '--dry-run') opts.dryRun = true;
      // --only: always on now; accepted so existing callers keep working.
    } else {
      opts.unknown.push(a);
    }
  }
  opts.only = true;
  return opts;
}

// This Mac's disk ignores case, and so does git here (core.ignorecase). A path
// named in the wrong case (taken from a wikilink, say) stages nothing and the
// commit quietly does nothing. So every named path must match its real name
// exactly: on disk, segment by segment (symlinks are not followed, so a
// symlink is checked by its own name), or, for a deletion, in the index or
// HEAD. Returns a sentence, or null when every path is spelled as it is.
export function namingProblem(palaceRoot, paths) {
  const root = resolve(palaceRoot);
  for (const p of paths) {
    const segs = p.split('/').filter((x) => x && x !== '.');
    let dir = root;
    let onDisk = true;
    for (let i = 0; i < segs.length; i += 1) {
      let names;
      try { names = readdirSync(dir); } catch (_) { onDisk = false; break; }
      if (names.includes(segs[i])) { dir = join(dir, segs[i]); continue; }
      const other = names.find((n) => n.toLowerCase() === segs[i].toLowerCase());
      if (other) {
        const real = [...segs.slice(0, i), other].join('/');
        return `"${p}" is not spelled as it is on disk ("${real}${i < segs.length - 1 ? '/...' : ''}"). Name it exactly; this disk ignores case, so a wrong-case name would commit nothing.`;
      }
      onDisk = false;
      break;
    }
    if (onDisk) continue;
    // Not on disk: a deletion. It must be named exactly as git knows it.
    const known = [
      ...git(root, ['ls-files', '-z', '--', p], { allowFail: true }).split('\0'),
      ...git(root, ['ls-tree', '-r', '-z', '--name-only', 'HEAD', '--', p], { allowFail: true }).split('\0'),
    ].filter(Boolean);
    if (known.length && !known.some((k) => k === p || k.startsWith(`${p}/`))) {
      return `"${p}" is not spelled as git knows it ("${known[0]}"). Name it exactly; this disk ignores case.`;
    }
  }
  return null;
}

// The message a commit of the named paths would carry, built in a throwaway
// index from HEAD plus the named paths as they sit on disk. Touches neither
// the shared index nor any lock.
export function dryRunMessage(palaceRoot, opts) {
  const tmp = mkdtempSync(join(tmpdir(), 'palace-commit-dry-'));
  const env = { GIT_INDEX_FILE: join(tmp, 'index') };
  try {
    if (git(palaceRoot, ['rev-parse', '-q', '--verify', 'HEAD'], { allowFail: true }).trim() !== '') {
      git(palaceRoot, ['read-tree', 'HEAD'], { env });
    }
    for (const p of opts.paths) git(palaceRoot, ['add', '--', p], { env });
    const changed = git(palaceRoot, ['-c', 'core.quotepath=false', 'diff', '--cached', '--name-only', '--', ...opts.paths], { allowFail: true, env }).trim();
    if (changed === '') return null;
    return buildMessageFromStaged(palaceRoot, { ...opts, only: true }, { env });
  } finally {
    try { rmSync(tmp, { recursive: true, force: true }); } catch (_) { /* ignore */ }
  }
}

// The board is one file every writer appends to and nobody owns committing.
// Steward cycles usually carry its tail; when they are quiet, lines can sit
// uncommitted for days. So any pass through the door also commits the board's
// tail once its oldest uncommitted line is older than BOARD_SITS_MS. Best
// effort: it never fails the commit the caller asked for.
export const BOARD_PATH = '_ops/swarm/persistent/blackboard.jsonl';
export const BOARD_SITS_MS = 30 * 60 * 1000;

export function boardTailAgeMs(palaceRoot, now = Date.now()) {
  if (!existsSync(resolve(palaceRoot, BOARD_PATH))) return null;
  const diff = git(palaceRoot, ['diff', '--no-color', '-U0', '--', BOARD_PATH], { allowFail: true });
  let oldest = null;
  let lines = 0;
  for (const line of diff.split('\n')) {
    if (!line.startsWith('+') || line.startsWith('+++')) continue;
    lines += 1;
    try {
      const t = Date.parse(JSON.parse(line.slice(1)).ts);
      if (Number.isFinite(t) && (oldest === null || t < oldest)) oldest = t;
    } catch (_) { /* a line that is not JSON has no age to read */ }
  }
  if (lines === 0 || oldest === null) return null;
  return { ageMs: now - oldest, lines };
}

function commitBoardTail(palaceRoot, dgit, tmp) {
  if (process.env.PALACE_DOOR_NO_BOARD === '1') return null;
  try {
    const tail = boardTailAgeMs(palaceRoot);
    if (!tail || tail.ageMs < BOARD_SITS_MS) return null;
    dgit(['add', '--', BOARD_PATH]);
    const minutes = Math.round(tail.ageMs / 60000);
    const msg = buildMessageFromStaged(palaceRoot, {
      kind: 'ops', scope: 'board', paths: [BOARD_PATH], only: true, verify: 'unverified', author: 'claude',
      summary: `${tail.lines} board line${tail.lines === 1 ? '' : 's'} that sat uncommitted for ${minutes} min`,
      body: 'Committed by the door: the board\'s tail had sat uncommitted longer than half an hour.',
    });
    const f = join(tmp, 'BOARD_MSG');
    writeFileSync(f, msg, 'utf8');
    const out = dgit(['commit', '-F', f, '--only', '--', BOARD_PATH], { allowFail: true });
    if (out.status !== 0) return null;
    const m = out.stdout.match(/^\[[^\]]*?([0-9a-f]{7,40})\]/m);
    return m ? m[1] : null;
  } catch (_) {
    return null;
  }
}

function fail(code, text) {
  process.stderr.write(text.endsWith('\n') ? text : `${text}\n`);
  process.exit(code);
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.unknown.length) {
    const hint = opts.unknown.some((u) => u.startsWith('--paths')) ? ' Did you mean --path, given once per file?' : '';
    fail(2, `palace-commit: unknown flag ${opts.unknown.join(', ')}. Nothing was staged or committed.${hint}`);
  }
  const palaceRoot = process.env.PALACE_ROOT
    ? resolve(process.env.PALACE_ROOT)
    : resolve(git(process.cwd(), ['rev-parse', '--show-toplevel']).trim());

  if (!opts.kind || !opts.summary || !opts.verify) {
    fail(2, 'palace-commit: --kind, --summary, and --verify are required.');
  }
  if (opts.paths.length === 0) {
    fail(2, 'palace-commit: name what you are committing with --path, once per file or folder. '
      + 'It commits only what you name, never whatever happens to be staged.');
  }

  const naming = namingProblem(palaceRoot, opts.paths);
  if (naming) fail(2, `palace-commit: refused: ${naming} Nothing was staged or committed.`);

  if (opts.dryRun) {
    // A preview says what the real run would do, refusals included.
    const problem = trunkProblem(palaceRoot);
    if (problem) fail(2, `palace-commit: dry run: the real commit would be refused: ${problem}`);
    for (const h of halfNamedMoves(palaceRoot, opts.paths)) warnHalfMove(h);
    const preview = dryRunMessage(palaceRoot, opts);
    if (preview === null) {
      process.stdout.write('palace-commit: dry run: nothing to commit under the named paths\n');
      process.exit(0);
    }
    process.stdout.write(preview);
    process.exit(0);
  }

  const tmp = mkdtempSync(join(tmpdir(), 'palace-commit-'));
  let result;
  try {
    result = withDoorSync(palaceRoot, 'palace-commit', (dgit) => {
      const problem = trunkProblem(palaceRoot);
      if (problem) return { refused: problem };

      // Git's own locks are the door's business now: inside it, a live
      // index.lock (someone's `git status`) is waited out and a provably stale
      // one is cleared (server/door.js, using server/git-locks.js's rule).

      // Stage the named paths (NEVER -A). A path that is already a staged
      // deletion is skipped: `git add` dies on it ("pathspec did not match any
      // files"), yet a mover has to be able to name it, because a move is
      // committed whole only when both of its sides are named.
      // If anything fails after staging, unstage the named paths before
      // leaving, so a failed commit leaves the shared index as it found it
      // (their content stays on disk) instead of handing it to the next
      // whole-index commit.
      let staging = false;
      let out;
      let staged;
      try {
        for (const p of opts.paths) {
          if (isStagedDeletion(palaceRoot, p)) continue;
          staging = true;
          dgit(['add', '--', p]);
        }

        staged = git(palaceRoot, ['-c', 'core.quotepath=false', 'diff', '--cached', '--name-only', '--', ...opts.paths], { allowFail: true }).trim();
        if (staged === '') return { nothing: true };

        // Say so (never block) when this commit would hold half of a staged move.
        for (const h of halfNamedMoves(palaceRoot, opts.paths)) warnHalfMove(h);

        const message = buildMessageFromStaged(palaceRoot, opts);
        const msgFile = join(tmp, 'COMMIT_MSG');
        writeFileSync(msgFile, message, 'utf8');
        out = dgit(['commit', '-F', msgFile, '--only', '--', ...opts.paths]);
      } catch (e) {
        if (staging) dgit(['reset', '-q', '--', ...opts.paths], { allowFail: true });
        throw e;
      }
      const board = staged.split('\n').includes(BOARD_PATH) ? null : commitBoardTail(palaceRoot, dgit, tmp);
      return { out, board };
    });
  } catch (e) {
    if (e instanceof DoorBusyError || e instanceof LockHeldError) fail(75, e.message);
    if (e && e.stderr) fail(1, `palace-commit: ${String(e.stderr).trim()}`);
    throw e;
  } finally {
    try { rmSync(tmp, { recursive: true, force: true }); } catch (_) { /* ignore */ }
  }

  if (result.refused) fail(2, `palace-commit: refused: ${result.refused}`);
  if (result.nothing) {
    // Nothing changed under the named paths: a clean no-op, not an error.
    process.stdout.write('palace-commit: nothing to commit under the named paths\n');
    process.exit(0);
  }
  process.stdout.write(result.out);
  const m = result.out.match(/^\[[^\]]*?([0-9a-f]{7,40})\]/m);
  if (m) process.stdout.write(`palace-commit: committed ${m[1]}\n`);
  if (result.board) process.stdout.write(`palace-commit: also committed the board's tail, which had sat over half an hour (${result.board})\n`);
  process.exit(0);
}

function warnHalfMove(h) {
  const half = h.missing === h.from ? 'a bare add, logged as a new file' : 'a bare delete';
  process.stderr.write(`palace-commit: "${h.to}" looks like a staged move from "${h.from}", but "${h.missing}" was not named, so this commit holds ${half}. Add --path "${h.missing}" to commit the move whole.\n`);
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('palace-commit.mjs');
if (invokedDirectly) main();
