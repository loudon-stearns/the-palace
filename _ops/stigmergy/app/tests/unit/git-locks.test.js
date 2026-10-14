// Unit tests for server/git-locks.js, the lock sweeper every palace committer
// shares. The palace runs many Claude sessions committing on one checkout, so
// a lock on disk is live until proven stale: a fresh lock stays, a lock with a
// git behind it stays, a dry run touches nothing, and only an old lock with no
// git running in this checkout is removed (and that removal is logged).

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, existsSync, utimesSync, renameSync } from 'node:fs';
import { execFileSync, spawnSync, spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  clearStaleLocksSync, clearStaleLocks, lockPaths, inspectLocks, gitProcessesFor, parseGitProcesses,
  LockHeldError, FRESH_MS,
} from '../../server/git-locks.js';
import { clearStaleLocks as cliClearStaleLocks } from '../../scripts/palace-commit.mjs';
import { clearStaleLocks as serverClearStaleLocks } from '../../server/commit.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, '..', '..');
const CLI = join(APP_ROOT, 'scripts', 'palace-commit.mjs');

const noGit = () => [];
// Fast and silent: two looks, no real sleeping, nothing on stderr.
const quick = { attempts: 2, delayMs: 0, sleep: () => {}, log: () => {}, gitProcesses: noGit };

function backdate(path, seconds) {
  const t = new Date(Date.now() - seconds * 1000);
  utimesSync(path, t, t);
}

describe('git-locks', () => {
  let root;
  let indexLock;
  let headLock;
  const g = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'gitlocks-'));
    g('init', '-q');
    g('config', 'user.email', 'test@palace');
    g('config', 'user.name', 'Test Palace');
    g('config', 'commit.gpgsign', 'false');
    writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\nstage: seed\n---\nbody\n');
    g('add', '--', 'Foo.md');
    g('commit', '-q', '-m', 'seed');
    [headLock, indexLock] = lockPaths(root);
  });
  afterEach(() => { rmSync(root, { recursive: true, force: true }); });

  it('a fresh lock is left alone, and the sweep says it is held', () => {
    writeFileSync(indexLock, '');
    let err;
    try { clearStaleLocksSync(root, quick); } catch (e) { err = e; }
    expect(err).toBeInstanceOf(LockHeldError);
    expect(err.message).toMatch(/index\.lock is held/);
    expect(err.message).toMatch(/written \d+s ago/);
    // git's own phrase leads, so cycle-commit.js's retry regex (/index\.lock|could not lock/) still fires.
    expect(err.message).toMatch(/^git-locks: could not lock the index: \.git\/index\.lock is held/);
    expect(existsSync(indexLock)).toBe(true);
  });

  it('a held HEAD.lock is refused in the same git wording', () => {
    writeFileSync(headLock, '');
    expect(() => clearStaleLocksSync(root, quick)).toThrow(/could not lock HEAD: \.git\/HEAD\.lock is held/);
    expect(existsSync(headLock)).toBe(true);
  });

  it('a dry run never touches a lock, live or stale', () => {
    writeFileSync(indexLock, '');
    backdate(indexLock, 120);
    writeFileSync(headLock, ''); // fresh
    const lines = [];
    const sleeps = [];
    const r = clearStaleLocksSync(root, { ...quick, dryRun: true, log: (s) => lines.push(s), sleep: (ms) => sleeps.push(ms) });
    expect(existsSync(indexLock)).toBe(true);
    expect(existsSync(headLock)).toBe(true);
    expect(r.dryRun).toBe(true);
    expect(r.cleared).toEqual([]);
    expect(r.held.map((h) => h.rel).sort()).toEqual(['.git/HEAD.lock', '.git/index.lock']);
    expect(sleeps).toEqual([]); // a dry run does not wait either
    expect(lines.join('')).toMatch(/dry run, not touching \.git\/index\.lock \(looks stale/);
    expect(lines.join('')).toMatch(/dry run, not touching \.git\/HEAD\.lock \(looks live/);
  });

  it('the CLI --dry-run leaves an old lock in place and still prints the message', () => {
    writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\nstage: sprout\n---\nx\n');
    g('add', '--', 'Foo.md');
    writeFileSync(indexLock, '');
    backdate(indexLock, 120);
    const r = spawnSync('node', [CLI, '--kind', 'edit', '--summary', 'x', '--verify', 'verified', '--path', 'Foo.md', '--dry-run'], {
      cwd: root, encoding: 'utf8', env: { ...process.env, PALACE_ROOT: root },
    });
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/edit: x/);
    // A dry run builds its message in a throwaway index: it looks at no lock at all.
    expect(r.stderr).not.toMatch(/index\.lock/);
    expect(existsSync(indexLock)).toBe(true);
  });

  it('an old lock with no git running is cleared, and the removal is logged', () => {
    writeFileSync(indexLock, '');
    backdate(indexLock, 120);
    const lines = [];
    const r = clearStaleLocksSync(root, { ...quick, log: (s) => lines.push(s) });
    expect(existsSync(indexLock)).toBe(false);
    expect(r.cleared.map((c) => c.rel)).toEqual(['.git/index.lock']);
    expect(r.held).toEqual([]);
    expect(lines.join('')).toMatch(/removed stale \.git\/index\.lock \(2m0s old, no git running in this checkout\)/);
  });

  it('an old lock with a git running in this checkout is kept: retried, then refused', () => {
    writeFileSync(indexLock, '');
    backdate(indexLock, 120);
    let probes = 0;
    const sleeps = [];
    const lines = [];
    const busy = () => { probes += 1; return [{ pid: 4242, command: 'git commit -F /tmp/x/COMMIT_MSG', cwd: root }]; };
    let err;
    try {
      clearStaleLocksSync(root, { attempts: 3, delayMs: 7, sleep: (ms) => sleeps.push(ms), log: (s) => lines.push(s), gitProcesses: busy });
    } catch (e) { err = e; }
    expect(err).toBeInstanceOf(LockHeldError);
    expect(err.message).toMatch(/pid 4242: git commit/);
    expect(err.message).toMatch(/rm "/); // tells the human how to clear it by hand
    expect(err.heldBy[0].pid).toBe(4242);
    expect(probes).toBe(3);
    expect(sleeps).toEqual([7, 7]); // waits between looks, not after the last
    expect(lines.join('')).toMatch(/looks live .*waiting 0s, look 2 of 3/);
    expect(existsSync(indexLock)).toBe(true);
  });

  it('a live lock that clears during the wait lets the caller through', () => {
    writeFileSync(indexLock, '');
    let calls = 0;
    const r = clearStaleLocksSync(root, {
      ...quick,
      attempts: 3,
      gitProcesses: () => { calls += 1; return [{ pid: 1, command: 'git commit', cwd: root }]; },
      sleep: () => { rmSync(indexLock); }, // the other session finishes its commit
    });
    expect(r.cleared).toEqual([]);
    expect(r.held).toEqual([]);
    expect(calls).toBe(1);
  });

  it('the async twin has the same contract (the STIGMERGY server path)', async () => {
    writeFileSync(indexLock, '');
    await expect(clearStaleLocks(root, quick)).rejects.toBeInstanceOf(LockHeldError);
    expect(existsSync(indexLock)).toBe(true);
    backdate(indexLock, 120);
    const r = await clearStaleLocks(root, quick);
    expect(r.cleared.map((c) => c.rel)).toEqual(['.git/index.lock']);
    expect(existsSync(indexLock)).toBe(false);
  });

  it('the CLI and the server export the shared sweeper, not their own copies', async () => {
    writeFileSync(indexLock, '');
    backdate(indexLock, 120);
    writeFileSync(headLock, '');
    backdate(headLock, 120);
    expect(cliClearStaleLocks(root, quick).cleared.map((c) => c.rel)).toEqual(['.git/HEAD.lock', '.git/index.lock']);
    expect(existsSync(indexLock)).toBe(false);
    writeFileSync(indexLock, '');
    backdate(indexLock, 120);
    expect((await serverClearStaleLocks(root, quick)).cleared.map((c) => c.rel)).toEqual(['.git/index.lock']);
    expect(existsSync(indexLock)).toBe(false);
  });

  it('the fresh threshold is the house number, and a negative age reads as fresh', () => {
    expect(FRESH_MS).toBe(30_000);
    writeFileSync(indexLock, '');
    const future = new Date(Date.now() + 5_000);
    utimesSync(indexLock, future, future); // clock skew: an mtime ahead of us
    const [row] = inspectLocks(root, { gitProcesses: noGit });
    expect(row.fresh).toBe(true);
    expect(row.live).toBe(true);
  });

  it('a caller may name other lock files and move them aside instead of unlinking (the Cowork seam)', () => {
    const refLock = resolve(root, '.git', 'refs', 'heads', 'side.lock');
    writeFileSync(refLock, '');
    backdate(refLock, 120);
    writeFileSync(indexLock, ''); // fresh, and NOT in the named set: not even looked at
    const lines = [];
    const r = clearStaleLocksSync(root, {
      ...quick,
      log: (s) => lines.push(s),
      locks: [refLock],
      remove: (p) => { renameSync(p, `${p}.moved`); return 'renamed aside'; },
    });
    expect(r.cleared.map((c) => c.rel)).toEqual(['.git/refs/heads/side.lock']);
    expect(existsSync(refLock)).toBe(false);
    expect(existsSync(`${refLock}.moved`)).toBe(true);
    expect(existsSync(indexLock)).toBe(true);
    expect(lines.join('')).toMatch(/removed stale \.git\/refs\/heads\/side\.lock \(2m0s old, no git running in this checkout; renamed aside\)/);
  });

  it('ignoreAge clears a fresh lock nobody holds, and still keeps one a git holds', () => {
    writeFileSync(indexLock, '');
    expect(() => clearStaleLocksSync(root, quick)).toThrow(LockHeldError);
    const r = clearStaleLocksSync(root, { ...quick, ignoreAge: true });
    expect(r.cleared.map((c) => c.rel)).toEqual(['.git/index.lock']);
    writeFileSync(indexLock, '');
    const busy = () => [{ pid: 7, command: 'git commit', cwd: root }];
    expect(() => clearStaleLocksSync(root, { ...quick, ignoreAge: true, gitProcesses: busy })).toThrow(/git is running in this checkout/);
    expect(existsSync(indexLock)).toBe(true);
  });

  it('a linked worktree is swept at its own git dir, not under the .git file at its root', () => {
    const linked = mkdtempSync(join(tmpdir(), 'gitlocks-linked-'));
    rmSync(linked, { recursive: true, force: true });
    try {
      g('worktree', 'add', '-q', '-b', 'side', linked);
      const [h, i] = lockPaths(linked);
      expect(i).toMatch(/\/worktrees\/[^/]+\/index\.lock$/);
      expect(h).toMatch(/\/worktrees\/[^/]+\/HEAD\.lock$/);
      writeFileSync(i, '');
      backdate(i, 120);
      const r = clearStaleLocksSync(linked, quick);
      expect(r.cleared.map((c) => c.path)).toEqual([i]);
      expect(existsSync(i)).toBe(false);
    } finally {
      try { g('worktree', 'remove', '--force', linked); } catch (_) { /* best effort */ }
      rmSync(linked, { recursive: true, force: true });
    }
  });

  describe('the process probe', () => {
    it('reads only processes whose executable is git itself', () => {
      const ps = [
        '  101 git commit -F /tmp/m',
        '  102 /usr/bin/git status',
        '  103 /Applications/Xcode.app/Contents/Developer/usr/bin/git log',
        '  104 node scripts/git-log-parse.js',
        '  105 git-lfs filter-process',
        '  106 /bin/zsh -c git commit',
        'garbage line',
      ].join('\n');
      expect(parseGitProcesses(ps).map((p) => p.pid)).toEqual([101, 102, 103]);
    });

    it('counts a git working in this checkout, or naming it, and not one elsewhere', () => {
      const ps = () => [
        ' 201 git commit -F /tmp/m',
        ' 202 git log --oneline',
        ` 203 git -C ${root} status`,
        ' 204 git fetch',
      ].join('\n');
      const cwdOf = (pids) => {
        expect(pids).toEqual([201, 202, 203, 204]);
        return new Map([[201, join(root, '_ops')], [202, '/somewhere/else'], [203, '/somewhere/else'], [204, `${root}-sibling`]]);
      };
      const seen = gitProcessesFor(root, { ps, cwdOf });
      expect(seen.map((p) => p.pid)).toEqual([201, 203]);
      expect(seen[0].cwd).toBe(join(root, '_ops'));
    });

    it('fails closed: when the cwd probe breaks, every git process counts', () => {
      const ps = () => ' 301 git commit\n 302 git log\n';
      const seen = gitProcessesFor(root, { ps, cwdOf: () => { throw new Error('no lsof'); } });
      expect(seen.map((p) => p.pid)).toEqual([301, 302]);
      expect(seen[0].cwd).toBe(null);
    });

    it('sees a real git holding this checkout, and nothing once it is gone', async () => {
      // A git that waits on stdin, started in the checkout: live for as long as we hold the pipe.
      const child = spawn('git', ['cat-file', '--batch'], { cwd: root, stdio: ['pipe', 'ignore', 'ignore'] });
      try {
        await new Promise((r) => setTimeout(r, 300));
        const seen = gitProcessesFor(root);
        expect(seen.map((p) => p.pid)).toContain(child.pid);
        writeFileSync(indexLock, '');
        backdate(indexLock, 120);
        expect(() => clearStaleLocksSync(root, { ...quick, gitProcesses: undefined })).toThrow(/git is running in this checkout/);
        expect(existsSync(indexLock)).toBe(true);
      } finally {
        child.stdin.end();
        child.kill();
      }
      await new Promise((r) => child.once('exit', r));
      await new Promise((r) => setTimeout(r, 100));
      expect(gitProcessesFor(root).map((p) => p.pid)).not.toContain(child.pid);
      const r = clearStaleLocksSync(root, { ...quick, gitProcesses: undefined });
      expect(r.cleared.map((c) => c.rel)).toEqual(['.git/index.lock']);
    });
  });

  it('the Cowork case still works: a commit clears the old lock a dead git left behind', () => {
    writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\nstage: sprout\n---\nedited\n');
    writeFileSync(indexLock, '');
    backdate(indexLock, 600);
    const headBefore = g('rev-parse', 'HEAD').trim();
    const r = spawnSync('node', [CLI, '--kind', 'edit', '--scope', 'Foo', '--summary', 'grow', '--verify', 'verified', '--path', 'Foo.md'], {
      cwd: root, encoding: 'utf8', env: { ...process.env, PALACE_ROOT: root },
    });
    expect(r.status).toBe(0);
    // 10m plus whatever the sweep waited if a short-lived git elsewhere made it look twice.
    expect(r.stderr).toMatch(/removed stale \.git\/index\.lock \(10m\d+s old, no git running in this checkout\)/);
    expect(existsSync(indexLock)).toBe(false);
    expect(g('rev-parse', 'HEAD').trim()).not.toBe(headBefore);
    expect(g('log', '-1', '--format=%s')).toMatch(/edit\(Foo\): grow/);
  });
});
