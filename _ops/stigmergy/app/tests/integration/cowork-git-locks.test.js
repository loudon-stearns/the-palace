// The Cowork committer (_ops/cowork-git/commit.mjs) under the palace's one lock
// rule. The Cowork sandbox cannot unlink, only rename, so it relocates stranded
// locks instead of deleting them; but WHEN a lock may go is the shared rule in
// server/git-locks.js, not a second, weaker one of its own: a fresh lock stays,
// a lock with a git behind it stays, a dry run touches nothing, and only an
// old lock nobody holds is moved aside. These tests drive the CLI end to end on
// a throwaway repo whose _ops/stigmergy is a symlink to the real one.

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync, utimesSync, symlinkSync, readdirSync } from 'node:fs';
import { execFileSync, spawnSync, spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, '..', '..');
const STIGMERGY = resolve(APP_ROOT, '..');
const CLI = resolve(STIGMERGY, '..', 'cowork-git', 'commit.mjs');

function backdate(path, seconds) {
  const t = new Date(Date.now() - seconds * 1000);
  utimesSync(path, t, t);
}

describe('cowork-git commit.mjs and the shared lock rule', () => {
  let root;
  let indexLock;
  let junk;
  const g = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });
  const run = (...extra) => {
    const r = spawnSync('node', [CLI, '--root', root, '--no-flag', '--kind', 'ops', '--scope', 'cowork', '--summary', 'from cowork', '--verify', 'unverified', '--paths', 'Foo.md', ...extra], {
      cwd: root, encoding: 'utf8',
    });
    let json = null;
    try { json = JSON.parse(r.stdout); } catch (_) { /* leave null */ }
    return { ...r, json };
  };
  const junkFiles = () => (existsSync(junk) ? readdirSync(junk) : []);

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'coworklocks-'));
    g('init', '-q');
    g('config', 'user.email', 'test@palace');
    g('config', 'user.name', 'Test Palace');
    g('config', 'commit.gpgsign', 'false');
    writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\nstage: seed\n---\nbody\n');
    g('add', '--', 'Foo.md');
    g('commit', '-q', '-m', 'seed');
    // The CLI resolves the committer, the lock rule and the validator from the palace root it is given.
    mkdirSync(resolve(root, '_ops'), { recursive: true });
    symlinkSync(STIGMERGY, resolve(root, '_ops', 'stigmergy'), 'dir');
    writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\nstage: sprout\n---\nedited in cowork\n');
    indexLock = resolve(root, '.git', 'index.lock');
    junk = resolve(root, '_ops', 'scratch', 'gitlock-junk');
  });
  afterEach(() => { rmSync(root, { recursive: true, force: true }); });

  test('a fresh lock survives the Cowork path: refused and handed off, lock untouched', () => {
    writeFileSync(indexLock, '');
    const headBefore = g('rev-parse', 'HEAD').trim();
    const r = run();
    expect(r.status).not.toBe(0);
    expect(r.json).toMatchObject({ ok: false, handoff: true });
    expect(r.json.error).toMatch(/index\.lock/);
    expect(existsSync(indexLock)).toBe(true);
    expect(junkFiles()).toEqual([]);
    expect(g('rev-parse', 'HEAD').trim()).toBe(headBefore);
  }, 25_000);

  test('a dry run touches no lock, even an old one', () => {
    writeFileSync(indexLock, '');
    backdate(indexLock, 600);
    const r = run('--dry-run');
    expect(r.status).toBe(0);
    expect(r.json).toMatchObject({ ok: true, dryRun: true });
    expect(existsSync(indexLock)).toBe(true);
    expect(junkFiles()).toEqual([]);
  });

  test('an old lock nobody holds is moved aside (the sandbox cannot unlink) and the commit lands', () => {
    writeFileSync(indexLock, '');
    backdate(indexLock, 600);
    const refLock = resolve(root, '.git', 'refs', 'heads', 'stranded.lock'); // Cowork strands ref locks too
    writeFileSync(refLock, '');
    backdate(refLock, 600);
    const headBefore = g('rev-parse', 'HEAD').trim();
    const r = run();
    expect(r.status).toBe(0);
    expect(r.json).toMatchObject({ ok: true });
    expect(r.json.shortHash).toMatch(/^[0-9a-f]{7,}$/);
    expect(r.json.movedLocks.sort()).toEqual(['.git/index.lock', '.git/refs/heads/stranded.lock']);
    expect(existsSync(indexLock)).toBe(false);
    expect(existsSync(refLock)).toBe(false);
    expect(junkFiles().length).toBe(2);
    expect(g('rev-parse', 'HEAD').trim()).not.toBe(headBefore);
    expect(g('log', '-1', '--format=%s')).toMatch(/ops\(cowork\): from cowork/);
  });

  test('an old lock with a git running in this checkout is refused, not moved', async () => {
    writeFileSync(indexLock, '');
    backdate(indexLock, 600);
    const headBefore = g('rev-parse', 'HEAD').trim();
    // A git that waits on stdin, started in the checkout: live for as long as we hold the pipe.
    const child = spawn('git', ['cat-file', '--batch'], { cwd: root, stdio: ['pipe', 'ignore', 'ignore'] });
    let r;
    try {
      await new Promise((res) => setTimeout(res, 300));
      r = run();
    } finally {
      child.stdin.end();
      child.kill();
    }
    expect(r.json).toMatchObject({ ok: false, handoff: true });
    expect(r.json.error).toMatch(/git is running in this checkout/);
    expect(existsSync(indexLock)).toBe(true);
    expect(junkFiles()).toEqual([]);
    expect(g('rev-parse', 'HEAD').trim()).toBe(headBefore);
  }, 25_000);

  test('the post-commit sweep still clears the locks its own commit strands', async () => {
    const { sweepStrandedLocks } = await import(CLI);
    const headLock = resolve(root, '.git', 'HEAD.lock');
    writeFileSync(indexLock, '');
    writeFileSync(headLock, ''); // both fresh: just stranded by our own, finished commit
    const lines = [];
    const r = await sweepStrandedLocks(root, { force: true, log: (s) => lines.push(s) });
    expect(r.moved.sort()).toEqual(['.git/HEAD.lock', '.git/index.lock']);
    expect(r.refused).toBeUndefined();
    expect(existsSync(indexLock)).toBe(false);
    expect(existsSync(headLock)).toBe(false);
    expect(junkFiles().length).toBe(2);
    expect(lines.join('')).toMatch(/cowork-git: removed stale \.git\/index\.lock .*renamed to _ops\/scratch\/gitlock-junk\//);
    // Without force the same fresh locks are held, and the sweep says so instead of throwing.
    writeFileSync(indexLock, '');
    const kept = await sweepStrandedLocks(root, { attempts: 1, log: () => {} });
    expect(kept.moved).toEqual([]);
    expect(kept.refused).toMatch(/index\.lock is held/);
    expect(existsSync(indexLock)).toBe(true);
  });
});
