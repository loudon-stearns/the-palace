// palace-push (scripts/palace-push.mjs): show what waits, then send exactly a
// pinned tip, fast-forward only, with a receipt. Throwaway repos and a bare remote.

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUSH = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'scripts', 'palace-push.mjs');
let base;
let remote;
let root;
const g = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8' });
const push = (...a) => spawnSync('node', [PUSH, ...a], { cwd: root, encoding: 'utf8', env: { ...process.env } });
function commit(subject, file) {
  writeFileSync(join(root, file), `${subject}\n`);
  g(root, 'add', file);
  g(root, 'commit', '-qm', subject);
  return g(root, 'rev-parse', 'HEAD').trim();
}

beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), 'palacepush-'));
  remote = join(base, 'remote.git');
  g(base, 'init', '-q', '--bare', '-b', 'main', remote);
  root = join(base, 'palace');
  g(base, 'init', '-q', '-b', 'main', root);
  g(root, 'config', 'user.email', 't@t');
  g(root, 'config', 'user.name', 't');
  g(root, 'config', 'commit.gpgsign', 'false');
  g(root, 'remote', 'add', 'origin', remote);
  commit('ops(seed): seed', 'seed.md');
  g(root, 'push', '-q', 'origin', 'main');
});
afterEach(() => { rmSync(base, { recursive: true, force: true }); });

describe('palace-push', () => {
  test('shows what waits, by kind and steward project, and the exact command; changes nothing', () => {
    commit('steward(Alpha): cycle 1', 'a1.md');
    commit('steward(Alpha): cycle 2', 'a2.md');
    commit('steward(Beta): cycle 1', 'b1.md');
    const tip = commit('edit(Foo): grow', 'foo.md');
    const r = push();
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toMatch(/4 commits/);
    expect(r.stdout).toMatch(/by kind: steward 3, edit 1/);
    expect(r.stdout).toMatch(/stewards touched: Alpha \(2\), Beta \(1\)/);
    expect(r.stdout).toContain(`--tip ${tip}`);
    expect(g(remote, 'rev-parse', 'main').trim()).not.toBe(tip);
  });

  test('sends exactly the pinned tip, not newer commits, and writes a receipt', () => {
    const pinned = commit('edit(Foo): one', 'one.md');
    const newer = commit('steward(Alpha): later', 'later.md');
    const r = push('--tip', pinned);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toMatch(/sent 1 commit \(edit 1\)/);
    expect(g(remote, 'rev-parse', 'main').trim()).toBe(pinned);
    expect(g(remote, 'rev-parse', 'main').trim()).not.toBe(newer);
    const receipt = readFileSync(join(root, '.git', 'palace-push.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l)).at(-1);
    expect(receipt).toMatchObject({ to: pinned, count: 1, ok: true, by_kind: { edit: 1 } });
  });

  test('a tip that is not on main is refused', () => {
    g(root, 'switch', '-q', '-c', 'side');
    const side = commit('edit(Side): x', 'side.md');
    g(root, 'switch', '-q', 'main');
    const r = push('--tip', side);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/is not on main/);
  });

  test('when the remote has commits main does not, nothing is sent', () => {
    const other = join(base, 'other');
    g(base, 'clone', '-q', remote, other);
    g(other, 'config', 'user.email', 'o@o');
    g(other, 'config', 'user.name', 'o');
    writeFileSync(join(other, 'x.md'), 'x\n');
    g(other, 'add', 'x.md');
    g(other, 'commit', '-qm', 'ops(x): elsewhere');
    g(other, 'push', '-q', 'origin', 'main');
    const tip = commit('edit(Foo): mine', 'mine.md');
    expect(push().status).toBe(2);
    const r = push('--tip', tip);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/not be a fast-forward/);
  });

  test('nothing waiting is said plainly', () => {
    const r = push();
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/nothing is waiting/);
  });

  test('a name that moves, a short id, or a missing value is refused, and nothing is sent', () => {
    const tip = commit('edit(Foo): one', 'one.md');
    const before = g(remote, 'rev-parse', 'main').trim();
    for (const bad of ['main', 'HEAD', tip.slice(0, 12)]) {
      const r = push('--tip', bad);
      expect(r.status, bad).toBe(2);
      expect(r.stderr).toMatch(/full 40-character commit id/);
    }
    const missing = push('--tip');
    expect(missing.status).toBe(2);
    expect(missing.stderr).toMatch(/no value/);
    expect(push('--tip', '--remote').status).toBe(2);
    expect(g(remote, 'rev-parse', 'main').trim()).toBe(before);
  });

  test('a full id that is not a commit here is refused', () => {
    const r = push('--tip', 'f'.repeat(40));
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/is not a commit here/);
  });

  test('a tip the remote already has is said plainly and nothing is sent', () => {
    const seed = g(root, 'rev-parse', 'HEAD').trim();
    commit('edit(Foo): later', 'later.md');
    const r = push('--tip', seed);
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toMatch(/already has/);
    expect(g(remote, 'rev-parse', 'main').trim()).toBe(seed);
  });

  test('a remote with no main branch is refused', () => {
    const empty = join(base, 'empty.git');
    g(base, 'init', '-q', '--bare', '-b', 'main', empty);
    g(root, 'remote', 'add', 'empty', empty);
    const tip = commit('edit(Foo): one', 'one.md');
    expect(push('--remote', 'empty').status).toBe(2);
    const r = push('--tip', tip, '--remote', 'empty');
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/has no main branch/);
  });

  test('a remote main that a longer ref only ends like is not taken for main', () => {
    const tip = commit('edit(Foo): one', 'one.md');
    g(root, 'push', '-q', 'origin', `${tip}:refs/heads/archive/refs/heads/main`);
    const r = push();
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toMatch(/1 commit/);
  });

  test('an unknown flag is refused', () => {
    expect(push('--force').status).toBe(2);
  });
});
