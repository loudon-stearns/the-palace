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
//     [--author claude] [--path "Foo.md" --path "Bar.md"] [--only] [--dry-run]
//
// If no --path is given, whatever is already staged is used. With --only, the
// commit holds exactly the named paths — anything else already staged by
// another writer stays staged and out of this commit (`git commit --only`),
// and the new hash is printed as `palace-commit: committed <hash>`. A stale git
// lock (old, with no git running in this checkout) is cleared first and said so;
// a live one is waited out and then refused with exit 75, never deleted from
// under another session's commit (server/git-locks.js). With --dry-run it
// prints the message it WOULD commit and exits without committing, and touches
// no lock at all.
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
import { existsSync, rmSync, writeFileSync, mkdtempSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { tmpdir } from 'node:os';
import { deriveTrailers, formatCommitMessage, parseNameStatus } from '../src/lib/commit-spec.js';
import { diffEntryText } from '../src/lib/frontmatter-diff.js';
import { clearStaleLocksSync, LockHeldError } from '../server/git-locks.js';

function git(palaceRoot, args, { allowFail = false } = {}) {
  try {
    return execFileSync('git', args, { cwd: palaceRoot, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
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
function stagedNameStatus(palaceRoot, onlyPaths = null) {
  // `-c core.quotepath=false`: RAW utf-8 paths, so a non-ASCII filename (every
  // em-dash bundle file, e.g. `Foo — baton.md`) parses + matches instead of
  // coming back octal-escaped + double-quoted. Without it the file stages but is
  // silently dropped from the commit. (Mirrors commitSelected in server/commit.js.)
  // `-M`: pair renames whatever the reader's `diff.renames` says, for the same
  // reason -- with it off a move arrives as an unrelated delete + add.
  const scope = onlyPaths && onlyPaths.length ? ['--', ...onlyPaths] : [];
  return parseNameStatus(git(palaceRoot, ['-c', 'core.quotepath=false', 'diff', '--cached', '-M', '--name-status', ...scope], { allowFail: true }));
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
export function readStagedDiff(palaceRoot, onlyPaths = null) {
  const paths = [];
  const mdChanges = [];
  for (const { status, path, renamedFrom } of stagedNameStatus(palaceRoot, onlyPaths)) {
    paths.push(path);
    if (!path.toLowerCase().endsWith('.md')) continue;

    // before = the HEAD side (empty if added), after = staged blob (:path).
    // A renamed entry's HEAD side lives at its OLD path. Reading HEAD:<new path>
    // finds nothing, every frontmatter field then reads as newly added, and a
    // pure move goes into the log as a birth (da73cb79: a false `born->sprout`).
    const before = status === 'A' ? '' : git(palaceRoot, ['show', `HEAD:${renamedFrom ?? path}`], { allowFail: true });
    const after = status === 'D' ? '' : git(palaceRoot, ['show', `:${path}`], { allowFail: true });
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
export function buildMessageFromStaged(palaceRoot, opts) {
  const { paths, mdChanges } = readStagedDiff(palaceRoot, opts.only ? opts.paths : null);
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

function parseArgs(argv) {
  const opts = { resolves: [], paths: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case '--kind': opts.kind = next(); break;
      case '--scope': opts.scope = next(); break;
      case '--summary': opts.summary = next(); break;
      case '--body': opts.body = next(); break;
      case '--verify': opts.verify = next(); break;
      case '--author': opts.author = next(); break;
      case '--campaign': opts.campaign = next(); break;
      case '--resolves': opts.resolves.push(next()); break;
      case '--path': opts.paths.push(next()); break;
      case '--dry-run': opts.dryRun = true; break;
      case '--only': opts.only = true; break;
      default: break;
    }
  }
  return opts;
}

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const palaceRoot = process.env.PALACE_ROOT
    ? resolve(process.env.PALACE_ROOT)
    : resolve(git(process.cwd(), ['rev-parse', '--show-toplevel']).trim());

  if (!opts.kind || !opts.summary || !opts.verify) {
    process.stderr.write('palace-commit: --kind, --summary, and --verify are required.\n');
    process.exit(2);
  }

  // A stale lock goes; a live one is waited out and then refused, never
  // deleted from under another session's commit. A dry run touches none.
  try {
    clearStaleLocksSync(palaceRoot, { dryRun: !!opts.dryRun, tag: 'palace-commit' });
  } catch (e) {
    if (e instanceof LockHeldError) {
      process.stderr.write(`${e.message}\n`);
      process.exit(75); // EX_TEMPFAIL: try again shortly
    }
    throw e;
  }

  // Stage explicitly-named paths (NEVER -A). A path that is already a staged
  // deletion is skipped: `git add` dies on it ("pathspec did not match any
  // files"), yet a mover has to be able to name it, because --only needs both
  // sides of a move in scope.
  for (const p of opts.paths) {
    if (isStagedDeletion(palaceRoot, p)) continue;
    git(palaceRoot, ['add', '--', p]);
  }

  // quotepath=false for consistency with readStagedDiff (this one only checks
  // emptiness, but keep both path-reads in the same raw-utf-8 frame).
  if (opts.only && opts.paths.length === 0) {
    process.stderr.write('palace-commit: --only needs at least one --path.\n');
    process.exit(2);
  }
  const scope = opts.only ? ['--', ...opts.paths] : [];
  const staged = git(palaceRoot, ['-c', 'core.quotepath=false', 'diff', '--cached', '--name-only', ...scope], { allowFail: true }).trim();
  if (staged === '') {
    if (opts.only) {
      // Nothing changed under the named paths — a clean no-op, not an error.
      process.stdout.write('palace-commit: nothing to commit under the named paths\n');
      process.exit(0);
    }
    process.stderr.write('palace-commit: nothing staged. Name paths with --path, or stage first.\n');
    process.exit(2);
  }

  // Say so (never block) when --only would commit half of a staged move.
  if (opts.only) {
    for (const h of halfNamedMoves(palaceRoot, opts.paths)) {
      const half = h.missing === h.from ? 'a bare add, logged as a new file' : 'a bare delete';
      process.stderr.write(`palace-commit: "${h.to}" looks like a staged move from "${h.from}", but --only was not given "${h.missing}", so this commit holds ${half}. Add --path "${h.missing}" to commit the move whole.\n`);
    }
  }

  const message = buildMessageFromStaged(palaceRoot, opts);

  if (opts.dryRun) {
    process.stdout.write(message);
    process.exit(0);
  }

  const tmp = mkdtempSync(join(tmpdir(), 'palace-commit-'));
  const msgFile = join(tmp, 'COMMIT_MSG');
  writeFileSync(msgFile, message, 'utf8');
  try {
    if (opts.only) {
      const out = execFileSync('git', ['commit', '-F', msgFile, '--only', '--', ...opts.paths], { cwd: palaceRoot, encoding: 'utf8' });
      process.stdout.write(out);
      const m = out.match(/^\[[^\]]*?([0-9a-f]{7,40})\]/m);
      if (m) process.stdout.write(`palace-commit: committed ${m[1]}\n`);
    } else {
      execFileSync('git', ['commit', '-F', msgFile], { cwd: palaceRoot, stdio: 'inherit' });
    }
  } finally {
    try { rmSync(tmp, { recursive: true, force: true }); } catch (_) { /* ignore */ }
  }
  process.exit(0);
}

const invokedDirectly = process.argv[1] && process.argv[1].endsWith('palace-commit.mjs');
if (invokedDirectly) main();
