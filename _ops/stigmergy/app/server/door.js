// server/door.js -- the one door every palace committer passes through.
//
// Many writers commit to this repo at once: sessions, steward cycles, the
// STIGMERGY server, the heartbeat. Git keeps history safe on its own (a branch
// moves atomically), but the shared checkout's index is not: two git commands
// that read the index, then lock it, then write it can each undo the other's
// work. Raced on a throwaway copy of this setup, git's own locks alone left the
// index wrong in 9 of 17 trials; one lock held around every write, 0 of 16.
//
// So every committer takes ONE lock before its first `git add` and holds it
// until its commit is written. The lock is a kernel lock (flock) on
// `<git common dir>/palace-door.mutex`, shared by every worktree of the repo.
//
// Three properties, each tested on this Mac before this file was written:
//   - A committer that wants the door waits its turn, up to a time limit.
//   - Every git child a holder starts inherits the locked file, so killing the
//     committer cannot free the lock while its git is still writing.
//   - A killed holder with no children frees the lock at once. There is no
//     stale lock to sweep.
//
// Node has no flock, so a three-line helper (python3, else perl) takes the
// lock on a file descriptor this process opened and then exits. A flock
// belongs to the open file, not to the process that asked, so the lock stays
// held for as long as this process (or a child it handed the descriptor to)
// keeps that file open.
//
// The door also says what it is to git: its git children run with
// PALACE_DOOR=1, which the ear (scripts/ear.sh, the reference-transaction
// hook) reads to tell a move of main through the door from one around it.

import { openSync, closeSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { resolve, join } from 'node:path';
import { clearStaleLocksSync, clearStaleLocks, LockHeldError } from './git-locks.js';

export const DOOR_FILE = 'palace-door.mutex';
export const HOLDER_FILE = 'palace-door.holder';
// A commit here takes a second or two. A committer that waits this long for
// the door is waiting on something that is not a commit; it gives up and says so.
export const DOOR_TIMEOUT_MS = Number(process.env.PALACE_DOOR_TIMEOUT_MS) || 120_000;
// Inside the door, a reader's plain `git status` may still hold index.lock:
// it takes git's optional lock to write back a refreshed index, and on a tree
// this size that takes tens of milliseconds. That is a wait, not a refusal.
// The door retries at short, uneven intervals (so it lands in the gaps between
// a poller's runs) for up to INDEX_PATIENCE_MS. Along the way it clears a lock
// that is provably stale (old, with no git running: a killed process left it).
// When patience runs out on a lock that still looks live, it refuses in
// git-locks' own words, exit 75, and the caller's commit can be retried.
export const INDEX_PATIENCE_MS = Number(process.env.PALACE_DOOR_INDEX_PATIENCE_MS) || 15_000;
const JITTER = [25, 150];

const PY_HELPER = [
  'import fcntl,sys,time,errno',
  'd=time.time()+float(sys.argv[1])',
  'while True:',
  '    try:',
  '        fcntl.flock(0, fcntl.LOCK_EX|fcntl.LOCK_NB); sys.exit(0)',
  '    except OSError as e:',
  '        if e.errno not in (errno.EWOULDBLOCK, errno.EAGAIN): sys.stderr.write(str(e)); sys.exit(2)',
  '        if time.time()>=d: sys.exit(75)',
  '        time.sleep(0.05)',
].join('\n');
const PERL_HELPER = 'use Fcntl qw(:flock); my $d=time+$ARGV[0]; while(1){ exit 0 if flock(STDIN, LOCK_EX|LOCK_NB); exit 75 if time>=$d; select(undef,undef,undef,0.05) }';
const HELPERS = [
  ['python3', ['-c', PY_HELPER]],
  ['/usr/bin/perl', ['-e', PERL_HELPER]],
];

export class DoorBusyError extends Error {
  constructor(message, { holder = null } = {}) {
    super(message);
    this.name = 'DoorBusyError';
    this.holder = holder;
  }
}

export class TrunkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TrunkError';
  }
}

function gitText(root, args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } }).trim();
}

/** The git dir every worktree of this repo shares. */
export function commonDir(root) {
  return resolve(root, gitText(root, ['rev-parse', '--git-common-dir']));
}

export function doorPath(root) {
  return join(commonDir(root), DOOR_FILE);
}

function readHolder(root) {
  try { return JSON.parse(readFileSync(join(commonDir(root), HOLDER_FILE), 'utf8')); } catch (_) { return null; }
}

function describeHolder(h) {
  if (!h) return 'another committer';
  const since = h.since ? `${Math.round((Date.now() - Date.parse(h.since)) / 1000)}s` : 'a while';
  return `${h.tag || 'a committer'} (pid ${h.pid}, holding it for ${since})`;
}

function busyError(root, tag, timeoutMs) {
  const holder = readHolder(root);
  // Opens with git's own words ("could not lock") so an outer retry keyed on
  // them -- the steward's cycle-commit.js -- still fires.
  return new DoorBusyError(
    `${tag}: could not lock the door: ${describeHolder(holder)} has held it longer than ${Math.round(timeoutMs / 1000)}s. `
    + 'Nothing was staged or committed. Try again in a moment.',
    { holder },
  );
}

function writeHolder(root, tag) {
  try {
    writeFileSync(join(commonDir(root), HOLDER_FILE), `${JSON.stringify({
      pid: process.pid,
      tag,
      session: process.env.CLAUDE_CODE_SESSION_ID || null,
      since: new Date().toISOString(),
    })}\n`);
  } catch (_) { /* the holder note is a courtesy; the lock is what matters */ }
}

function clearHolder(root) {
  try {
    const h = readHolder(root);
    if (h && h.pid === process.pid) rmSync(join(commonDir(root), HOLDER_FILE), { force: true });
  } catch (_) { /* ignore */ }
}

function helperArgs(timeoutMs) {
  return String(Math.max(0, timeoutMs) / 1000);
}

function acquireSync(fd, timeoutMs) {
  for (const [cmd, args] of HELPERS) {
    const r = spawnSync(cmd, [...args, helperArgs(timeoutMs)], { stdio: [fd, 'ignore', 'pipe'], encoding: 'utf8' });
    if (r.error && r.error.code === 'ENOENT') continue;
    if (r.error) throw r.error;
    return r.status; // 0 acquired, 75 timed out, anything else an error
  }
  throw new Error('no lock helper available (python3 or perl)');
}

function acquireAsync(fd, timeoutMs) {
  return new Promise((resolvePromise, rejectPromise) => {
    const tryHelper = (i) => {
      if (i >= HELPERS.length) { rejectPromise(new Error('no lock helper available (python3 or perl)')); return; }
      const [cmd, args] = HELPERS[i];
      const child = spawn(cmd, [...args, helperArgs(timeoutMs)], { stdio: [fd, 'ignore', 'pipe'] });
      let stderr = '';
      let settled = false;
      child.stderr.on('data', (b) => { stderr += b; });
      child.on('error', (e) => {
        if (settled) return;
        settled = true;
        if (e.code === 'ENOENT') tryHelper(i + 1); else rejectPromise(e);
      });
      child.on('close', (code, signal) => {
        if (settled) return;
        settled = true;
        if (code === 0 || code === 75) resolvePromise(code);
        else rejectPromise(new Error(`lock helper failed (${code === null ? `signal ${signal}` : `exit ${code}`}): ${stderr.trim()}`));
      });
    };
    tryHelper(0);
  });
}

/**
 * The trunk's own refusals, checked inside the door before anything is staged.
 * Returns null when it is safe to commit here, else a sentence naming the way
 * back. Two cases:
 *   - the repo's main checkout (Loudon's folder) has been moved off `main`;
 *   - a merge, rebase, cherry-pick or revert is half done in this checkout.
 * A linked worktree on its own branch is fine: that is where branch work lives.
 */
export function trunkProblem(root) {
  const r = resolve(root);
  let gitDir;
  let common;
  try {
    gitDir = resolve(r, gitText(r, ['rev-parse', '--git-dir']));
    common = resolve(r, gitText(r, ['rev-parse', '--git-common-dir']));
  } catch (_) {
    return null; // not a repo: git itself will say so
  }
  for (const [file, what, back] of [
    ['MERGE_HEAD', 'a merge', 'finish it with `git commit`, or abandon it with `git merge --abort`'],
    ['CHERRY_PICK_HEAD', 'a cherry-pick', 'finish it, or `git cherry-pick --abort`'],
    ['REVERT_HEAD', 'a revert', 'finish it, or `git revert --abort`'],
    ['rebase-merge', 'a rebase', 'finish it, or `git rebase --abort`'],
    ['rebase-apply', 'a rebase', 'finish it, or `git rebase --abort`'],
  ]) {
    if (existsSync(join(gitDir, file))) return `${what} is half done in ${r}; ${back}, then commit again.`;
  }
  if (gitDir === common) {
    let branch = '';
    try { branch = gitText(r, ['symbolic-ref', '--short', '-q', 'HEAD']); } catch (_) { branch = ''; }
    let hasMain = false;
    try { gitText(r, ['show-ref', '--verify', '-q', 'refs/heads/main']); hasMain = true; } catch (_) { hasMain = false; }
    if (hasMain && branch !== 'main') {
      return `the palace's main checkout (${r}) is on ${branch ? `"${branch}"` : 'a detached HEAD'}, not main. `
        + 'Nothing commits there until it is back on main; branch work belongs in a worktree of its own.';
    }
  }
  return null;
}

function isIndexLockError(text) {
  return /index\.lock|Unable to create .*\.lock|could not lock/i.test(String(text || ''));
}

function jitterMs() {
  return JITTER[0] + Math.floor(Math.random() * (JITTER[1] - JITTER[0]));
}

// After patience, one short grace for a lock that turned out stale and was cleared.
const GRACE_MS = 2_000;
// Say so when a stale lock is removed; stay quiet about live ones being waited out.
const loudOnRemoval = (m) => { if (/removed stale/.test(m)) process.stderr.write(m); };

function doorEnv(tag) {
  return { ...process.env, PALACE_DOOR: '1', PALACE_DOOR_TAG: tag, GIT_OPTIONAL_LOCKS: '0' };
}

function sleepSync(ms) {
  if (ms > 0) Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * Run `fn` inside the door, synchronously. `fn` receives `git(args, opts)`,
 * which runs git in `root` with the locked file handed to the child (so the
 * lock outlives this process while git is still writing), PALACE_DOOR=1 in its
 * environment, and index.lock contention retried. Returns what `fn` returns.
 * Throws DoorBusyError when the door stays shut past `timeoutMs`.
 *
 * git(args, { allowFail, input, env }) returns stdout as a string; with
 * allowFail it returns { stdout, stderr, status } instead of throwing.
 */
export function withDoorSync(root, tag, fn, { timeoutMs = DOOR_TIMEOUT_MS, patienceMs = INDEX_PATIENCE_MS } = {}) {
  const r = resolve(root);
  const fd = openSync(doorPath(r), 'a');
  let held = false;
  try {
    const status = acquireSync(fd, timeoutMs);
    if (status === 75) throw busyError(r, tag, timeoutMs);
    if (status !== 0) throw new Error(`${tag}: the door's lock helper failed (exit ${status})`);
    held = true;
    writeHolder(r, tag);
    const env = doorEnv(tag);
    const git = (args, opts = {}) => {
      const deadline = Date.now() + patienceMs;
      for (let attempt = 1; ; attempt += 1) {
        const res = spawnSync('git', args, {
          cwd: r,
          encoding: 'utf8',
          maxBuffer: 64 * 1024 * 1024,
          input: opts.input,
          env: opts.env ? { ...env, ...opts.env } : env,
          stdio: ['pipe', 'pipe', 'pipe', fd],
        });
        if (res.error) throw res.error;
        if (res.status !== 0 && isIndexLockError(res.stderr)) {
          const late = Date.now() >= deadline;
          // Now and then, and once patience is spent, clear a lock that is
          // provably stale. One that still looks live past patience is refused.
          if (late || attempt % 8 === 0) {
            try {
              clearStaleLocksSync(r, { attempts: 1, tag, log: loudOnRemoval });
            } catch (e) {
              if (!(e instanceof LockHeldError) || late) throw e;
            }
          }
          if (!late || Date.now() < deadline + GRACE_MS) { sleepSync(jitterMs()); continue; }
        }
        if (opts.allowFail) return { stdout: res.stdout || '', stderr: res.stderr || '', status: res.status };
        if (res.status !== 0) {
          const e = new Error(`git ${args.join(' ')} failed: ${(res.stderr || '').trim()}`);
          e.stderr = res.stderr;
          e.status = res.status;
          throw e;
        }
        return res.stdout || '';
      }
    };
    return fn(git);
  } finally {
    if (held) clearHolder(r);
    closeSync(fd);
  }
}

/**
 * The async twin of withDoorSync, for the STIGMERGY server: the wait for the
 * door and every git call inside it leave the event loop free. `fn` receives
 * an async `git(args, opts)` that resolves { stdout, stderr, failed } (and
 * rejects on failure unless allowFail), matching server/git-wrapper.js.
 */
export async function withDoor(root, tag, fn, { timeoutMs = DOOR_TIMEOUT_MS, patienceMs = INDEX_PATIENCE_MS } = {}) {
  const r = resolve(root);
  const fd = openSync(doorPath(r), 'a');
  let held = false;
  try {
    const status = await acquireAsync(fd, timeoutMs);
    if (status === 75) throw busyError(r, tag, timeoutMs);
    held = true;
    writeHolder(r, tag);
    const env = doorEnv(tag);
    const once = (args, opts) => new Promise((resolvePromise, rejectPromise) => {
      const child = spawn('git', args, { cwd: r, env: opts.env ? { ...env, ...opts.env } : env, stdio: ['ignore', 'pipe', 'pipe', fd] });
      const out = [];
      const err = [];
      child.stdout.on('data', (b) => out.push(b));
      child.stderr.on('data', (b) => err.push(b));
      child.on('error', rejectPromise);
      child.on('close', (code) => resolvePromise({ stdout: Buffer.concat(out).toString('utf8'), stderr: Buffer.concat(err).toString('utf8'), code }));
    });
    const git = async (args, opts = {}) => {
      const deadline = Date.now() + patienceMs;
      for (let attempt = 1; ; attempt += 1) {
        const res = await once(args, opts);
        if (res.code !== 0 && isIndexLockError(res.stderr)) {
          const late = Date.now() >= deadline;
          if (late || attempt % 8 === 0) {
            try {
              await clearStaleLocks(r, { attempts: 1, tag, log: loudOnRemoval });
            } catch (e) {
              if (!(e instanceof LockHeldError) || late) throw e;
            }
          }
          if (!late || Date.now() < deadline + GRACE_MS) { await new Promise((w) => setTimeout(w, jitterMs())); continue; }
        }
        const failed = res.code !== 0;
        if (failed && !opts.allowFail) {
          const e = new Error(`git ${args.join(' ')} failed: ${res.stderr.trim()}`);
          e.stderr = res.stderr;
          throw e;
        }
        return { stdout: res.stdout, stderr: res.stderr, failed };
      }
    };
    return await fn(git);
  } finally {
    if (held) clearHolder(r);
    closeSync(fd);
  }
}
