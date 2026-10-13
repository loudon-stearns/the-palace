// server/git-locks.js -- the one lock sweeper every palace committer shares.
//
// Git takes `index.lock` while it rewrites the index and `HEAD.lock` while it
// moves HEAD; both are gone the moment the operation ends. A lock still on
// disk means one of two things, and they need opposite handling:
//
//   - LIVE: another git is mid-operation on THIS checkout. The palace runs
//     many Claude sessions committing on the same tree at once (assume
//     multi-agent), so this is the normal case, not the edge. Removing the
//     lock hands two writers the same index and drops or corrupts the other
//     session's commit. Wait a little and look again; if it stays, stop with
//     a clear message. Never delete.
//   - STALE: the git that took it died, or could not unlink it. The Cowork
//     sandbox cannot delete files, so every Cowork commit strands its locks
//     (canon: `Surfaces and Capabilities.md` § the Cowork row; mechanism:
//     `_ops/cowork-git/SKILL.md`); a killed process does the same. The next
//     commit cannot proceed until the lock goes. Remove it, and say so.
//
// A lock is stale only when BOTH hold: its mtime is older than FRESH_MS, and
// no git process is running against this checkout. Either signal alone keeps
// it. A dry run never touches a lock at all; it only reports what it sees.
//
// Locks are found through `git rev-parse --git-path`, so a linked worktree's
// locks (`.git/worktrees/<name>/index.lock`) are seen as well as a main
// checkout's. The process probe is `ps` plus `lsof -d cwd` on the git pids
// it finds (both well under 100 ms on macOS); a git whose working directory
// is inside this checkout, or whose command line names it, counts as live.
// If the probe itself fails while git processes exist, they all count: fail
// closed on safety.
//
// Two entry points, one loop: `clearStaleLocksSync` for the CLI committer,
// `clearStaleLocks` (async, never blocks the event loop while waiting) for
// the STIGMERGY server. Both throw LockHeldError when a live lock outlasts
// the retries; the caller turns that into its own clear failure.

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, rmSync, statSync, realpathSync } from 'node:fs';
import { resolve, basename, relative, sep } from 'node:path';

// Younger than this and a lock is presumed live whatever else we see. The
// same 30 s the Cowork committer uses (`_ops/cowork-git/commit.mjs`), so the
// house has one number. A commit on this repo takes a second or two; a lock
// older than this with nobody behind it was left behind.
export const FRESH_MS = 30_000;
// Five looks two seconds apart: about the ten-second wait the Daily Page
// rule asks for before giving up on a held lock (`_ops/daily-page/record.md`).
export const RETRY_ATTEMPTS = 5;
export const RETRY_DELAY_MS = 2_000;
export const LOCK_NAMES = ['HEAD.lock', 'index.lock'];

export class LockHeldError extends Error {
  constructor(message, { path, ageMs, heldBy }) {
    super(message);
    this.name = 'LockHeldError';
    this.path = path;
    this.ageMs = ageMs;
    this.heldBy = heldBy;
  }
}

function run(cmd, args, cwd) {
  return execFileSync(cmd, args, { cwd, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
}

// The absolute lock paths for this checkout. `--git-path` answers from the
// real git dir, so a linked worktree gets its own `.git/worktrees/<name>/`
// locks, not a path under the `.git` FILE at its root (which never exists and
// so was never cleared). Falls back to `.git/<name>` when git cannot answer.
export function lockPaths(palaceRoot) {
  const root = resolve(palaceRoot);
  try {
    const out = run('git', ['rev-parse', ...LOCK_NAMES.flatMap((n) => ['--git-path', n])], root);
    const lines = out.split('\n').filter(Boolean);
    if (lines.length === LOCK_NAMES.length) return lines.map((l) => resolve(root, l));
  } catch (_) { /* not a repo, or git missing: fall through */ }
  return LOCK_NAMES.map((n) => resolve(root, '.git', n));
}

// The git dir, for matching a `--git-dir=` / GIT_DIR-style command line.
function gitDirOf(root) {
  try { return resolve(root, run('git', ['rev-parse', '--git-dir'], root).trim()); } catch (_) { return null; }
}

function samePathOrInside(p, root) {
  if (!p || !root) return false;
  return p === root || p.startsWith(root.endsWith(sep) ? root : root + sep);
}

function realOrSelf(p) {
  try { return realpathSync(p); } catch (_) { return p; }
}

// `ps -axo pid=,command=` -> every process whose executable is `git` itself
// (not `git-lfs`, not a `node git-thing.js`). Exported for the test seam.
export function parseGitProcesses(psText) {
  const out = [];
  for (const line of String(psText).split('\n')) {
    const m = /^\s*(\d+)\s+(.*)$/.exec(line);
    if (!m) continue;
    const command = m[2].trim();
    const exe = command.split(/\s+/)[0] || '';
    if (basename(exe) !== 'git') continue;
    out.push({ pid: Number(m[1]), command });
  }
  return out;
}

function defaultPs() {
  return run('ps', ['-axo', 'pid=,command='], undefined);
}

// pid -> working directory, via `lsof -a -d cwd -Fn -p <pids>`. Restricted to
// the handful of git pids, so it is fast. lsof exits 1 when any listed pid is
// already gone (git calls are short; one often ends between `ps` and here)
// while still printing the rest, so the exit status is not the failure
// signal. No output at all is, unless every pid has simply exited by now.
// Throws when lsof cannot run or answers nothing for a live pid, and the
// caller then fails closed.
function defaultCwdOf(pids) {
  const r = spawnSync('lsof', ['-a', '-d', 'cwd', '-Fn', '-p', pids.join(',')], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (r.error) throw r.error;
  const out = r.stdout || '';
  if (out.trim() === '' && r.status !== 0) {
    const alive = spawnSync('ps', ['-o', 'pid=', '-p', pids.join(',')], { encoding: 'utf8' });
    if (!alive.error && (alive.stdout || '').trim() === '') return new Map(); // all gone: nothing is running
    throw new Error(`lsof answered nothing (exit ${r.status})`);
  }
  const map = new Map();
  let pid = null;
  for (const line of out.split('\n')) {
    if (line.startsWith('p')) pid = Number(line.slice(1));
    else if (line.startsWith('n') && pid != null) map.set(pid, line.slice(1));
  }
  return map;
}

// The git processes running against this checkout: cwd inside it, or the
// command line naming its root or git dir. Returns [{ pid, command, cwd }].
// When the cwd probe fails but git processes exist, every one of them is
// returned with `cwd: null` -- we cannot prove they are elsewhere.
export function gitProcessesFor(palaceRoot, { ps = defaultPs, cwdOf = defaultCwdOf } = {}) {
  const root = resolve(palaceRoot);
  const roots = new Set([root, realOrSelf(root)]);
  const gitDir = gitDirOf(root);
  if (gitDir) { roots.add(gitDir); roots.add(realOrSelf(gitDir)); }

  let procs;
  try { procs = parseGitProcesses(ps()); } catch (_) { return []; }
  procs = procs.filter((p) => p.pid !== process.pid);
  if (procs.length === 0) return [];

  let cwds;
  try { cwds = cwdOf(procs.map((p) => p.pid)); } catch (_) { cwds = null; }

  const out = [];
  for (const p of procs) {
    const cwd = cwds ? (cwds.get(p.pid) ?? null) : null;
    const namesRoot = [...roots].some((r) => p.command.includes(r));
    const insideRoot = cwds ? [...roots].some((r) => samePathOrInside(cwd, r)) : true;
    if (namesRoot || insideRoot) out.push({ pid: p.pid, command: p.command, cwd });
  }
  return out;
}

export function formatAge(ms) {
  if (!Number.isFinite(ms)) return 'unknown age';
  if (ms < 0) return 'in the future (clock skew)';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m${s % 60}s`;
  return `${Math.floor(m / 60)}h${m % 60}m`;
}

// What is on disk right now: one row per lock that exists.
export function inspectLocks(palaceRoot, { now = Date.now(), freshMs = FRESH_MS, gitProcesses = gitProcessesFor } = {}) {
  const root = resolve(palaceRoot);
  const rows = [];
  let procs = null; // probed once, only if some lock exists
  for (const path of lockPaths(root)) {
    let st;
    try { st = statSync(path); } catch (_) { continue; }
    if (procs === null) procs = gitProcesses(root);
    const ageMs = now - st.mtimeMs;
    const fresh = ageMs < freshMs; // a negative age (skew) is fresh, the safe side
    rows.push({ path, rel: relative(root, path), ageMs, fresh, heldBy: procs, live: fresh || procs.length > 0 });
  }
  return rows;
}

function describeHold(row) {
  const why = [];
  if (row.fresh) why.push(`written ${formatAge(row.ageMs)} ago`);
  if (row.heldBy.length) {
    const who = row.heldBy.slice(0, 3).map((p) => `pid ${p.pid}: ${p.command.length > 60 ? `${p.command.slice(0, 57)}...` : p.command}`).join('; ');
    why.push(`git is running in this checkout (${who}${row.heldBy.length > 3 ? '; ...' : ''})`);
  }
  return why.join(', ');
}

// One look at the locks: remove the provably stale ones, report the live ones.
function sweepOnce(root, { tag, log, dryRun, now, freshMs, gitProcesses }) {
  const rows = inspectLocks(root, { now, freshMs, gitProcesses });
  const cleared = [];
  const held = [];
  for (const row of rows) {
    if (dryRun) {
      log(`${tag}: dry run, not touching ${row.rel} (${row.live ? `looks live: ${describeHold(row)}` : `looks stale: ${formatAge(row.ageMs)} old, no git running in this checkout`})\n`);
      held.push(row);
      continue;
    }
    if (row.live) { held.push(row); continue; }
    try {
      rmSync(row.path);
      cleared.push({ path: row.path, rel: row.rel, ageMs: row.ageMs });
      log(`${tag}: removed stale ${row.rel} (${formatAge(row.ageMs)} old, no git running in this checkout)\n`);
    } catch (e) {
      if (!existsSync(row.path)) continue; // it went on its own: fine
      log(`${tag}: could not remove stale ${row.rel}: ${e.message}\n`);
      held.push(row);
    }
  }
  return { cleared, held };
}

// The text opens with git's own phrase ("could not lock"), and names the lock
// file, so an outer retry keyed on git's wording -- the orchestrator's
// cycle-commit.js matches /index\.lock|could not lock/ -- still fires.
function heldError(tag, row) {
  const what = basename(row.path) === 'HEAD.lock' ? 'HEAD' : 'the index';
  return new LockHeldError(
    `${tag}: could not lock ${what}: ${row.rel} is held (${describeHold(row)}). Another session may be mid-commit on this checkout; wait a moment and retry. `
    + `If no git is running and it stays, remove it by hand: rm "${row.path}"`,
    { path: row.path, ageMs: row.ageMs, heldBy: row.heldBy },
  );
}

function settle(opts = {}) {
  return {
    tag: opts.tag ?? 'git-locks',
    log: opts.log ?? ((s) => process.stderr.write(s)),
    dryRun: !!opts.dryRun,
    now: opts.now,
    freshMs: opts.freshMs ?? FRESH_MS,
    attempts: Math.max(1, opts.attempts ?? RETRY_ATTEMPTS),
    delayMs: opts.delayMs ?? RETRY_DELAY_MS,
    gitProcesses: opts.gitProcesses ?? gitProcessesFor,
    sleep: opts.sleep,
  };
}

function sleepSync(ms) {
  if (ms > 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
function sleepAsync(ms) {
  return new Promise((r) => setTimeout(r, Math.max(0, ms)));
}

function waitLine(tag, row, attempt, attempts, delayMs) {
  return `${tag}: ${row.rel} looks live (${describeHold(row)}); waiting ${Math.round(delayMs / 1000)}s, look ${attempt + 1} of ${attempts}\n`;
}

/**
 * Clear the provably stale git locks of `palaceRoot`, waiting out live ones.
 * Returns { cleared: [{ path, rel, ageMs }], held: [rows], dryRun }.
 * Throws LockHeldError when a live lock outlasts the retries (never on a dry run).
 *
 * Options (all optional): dryRun, tag (message prefix), log (default stderr),
 * freshMs, attempts, delayMs, sleep, gitProcesses (test seams), now.
 */
export function clearStaleLocksSync(palaceRoot, options) {
  const o = settle(options);
  const root = resolve(palaceRoot);
  const sleep = o.sleep ?? sleepSync;
  const cleared = [];
  let held = [];
  for (let attempt = 1; attempt <= o.attempts; attempt += 1) {
    const r = sweepOnce(root, { ...o, now: o.now ?? Date.now() });
    cleared.push(...r.cleared);
    held = r.held;
    if (held.length === 0 || o.dryRun) return { cleared, held, dryRun: o.dryRun };
    if (attempt < o.attempts) { o.log(waitLine(o.tag, held[0], attempt, o.attempts, o.delayMs)); sleep(o.delayMs); }
  }
  throw heldError(o.tag, held[0]);
}

/** The async twin of clearStaleLocksSync: same contract, non-blocking waits. */
export async function clearStaleLocks(palaceRoot, options) {
  const o = settle(options);
  const root = resolve(palaceRoot);
  const sleep = o.sleep ?? sleepAsync;
  const cleared = [];
  let held = [];
  for (let attempt = 1; attempt <= o.attempts; attempt += 1) {
    const r = sweepOnce(root, { ...o, now: o.now ?? Date.now() });
    cleared.push(...r.cleared);
    held = r.held;
    if (held.length === 0 || o.dryRun) return { cleared, held, dryRun: o.dryRun };
    if (attempt < o.attempts) { o.log(waitLine(o.tag, held[0], attempt, o.attempts, o.delayMs)); await sleep(o.delayMs); }
  }
  throw heldError(o.tag, held[0]);
}
