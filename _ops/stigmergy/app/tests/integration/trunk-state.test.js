// trunk-state (scripts/trunk-state.mjs): the trunk read and never touched.
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const TS = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'scripts', 'trunk-state.mjs');
let base;
let root;
const g = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8' });

beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), 'trunkstate-'));
  const remote = join(base, 'remote.git');
  g(base, 'init', '-q', '--bare', '-b', 'main', remote);
  root = join(base, 'palace');
  g(base, 'init', '-q', '-b', 'main', root);
  g(root, 'config', 'user.email', 't@t');
  g(root, 'config', 'user.name', 't');
  writeFileSync(join(root, 'a.md'), 'a\n');
  g(root, 'add', '-A');
  g(root, 'commit', '-qm', 'ops(seed): seed');
  g(root, 'remote', 'add', 'origin', remote);
  g(root, 'push', '-q', '-u', 'origin', 'main');
});
afterEach(() => { rmSync(base, { recursive: true, force: true }); });

describe('trunk-state', () => {
  test('reports ahead count, the ear, unsaved files and leftover branches, and changes nothing', () => {
    writeFileSync(join(root, 'b.md'), 'b\n');
    g(root, 'add', 'b.md');
    g(root, 'commit', '-qm', 'edit(B): b');
    const now = new Date().toISOString();
    appendFileSync(join(root, '.git', 'palace-ear.jsonl'), `${JSON.stringify({ ts: now, ref: 'refs/heads/main', old: 'a', new: 'b', via: 'door', tag: 'palace-commit' })}\n${JSON.stringify({ ts: now, ref: 'refs/heads/main', old: 'b', new: 'c', via: 'around', caller: 'zsh', cwd: root })}\n`);
    mkdirSync(join(root, 'Projects', 'P'), { recursive: true });
    writeFileSync(join(root, 'Projects', 'P', 'x.md'), 'unsaved\n');
    g(root, 'branch', 'leftover');
    const before = g(root, 'status', '--porcelain=v1');
    const r = spawnSync('node', [TS, '--json', '--no-writers'], { cwd: root, encoding: 'utf8' });
    expect(r.status, r.stderr).toBe(0);
    const s = JSON.parse(r.stdout);
    expect(s.remote.ahead).toBe(1);
    expect(s.ear.moves).toBe(2);
    expect(s.ear.door).toBe(1);
    expect(s.ear.around).toHaveLength(1);
    expect(s.unsaved.map((u) => u.path)).toContain('Projects/');
    expect(s.branches).toBe(1);
    expect(s.unmerged).toEqual([]);
    expect(g(root, 'status', '--porcelain=v1')).toBe(before);
    const human = spawnSync('node', [TS, '--no-writers'], { cwd: root, encoding: 'utf8' });
    expect(human.stdout).toMatch(/main is 1 ahead of origin/);
    expect(human.stdout).toMatch(/2 moves of main, 1 through the door, 1 around it/);
  });
});
