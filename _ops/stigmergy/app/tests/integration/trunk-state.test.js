// trunk-state (scripts/trunk-state.mjs): the trunk read and never touched.
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, appendFileSync, mkdirSync, utimesSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';
import { parseSince, sinceFor } from '../../scripts/trunk-state.mjs';

const TS = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'scripts', 'trunk-state.mjs');
let base;
let root;
const g = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', env: gitFreeEnv() });

beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), 'trunkstate-'));
  const remote = join(base, 'remote.git');
  g(base, 'init', '-q', '--bare', '-b', 'main', remote);
  assertScratchRepo(remote, base);
  root = join(base, 'palace');
  g(base, 'init', '-q', '-b', 'main', root);
  assertScratchRepo(root, base);
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
    const r = spawnSync('node', [TS, '--json', '--no-writers'], { cwd: root, encoding: 'utf8', env: gitFreeEnv() });
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
    const human = spawnSync('node', [TS, '--no-writers'], { cwd: root, encoding: 'utf8', env: gitFreeEnv() });
    expect(human.stdout).toMatch(/main is 1 ahead of origin/);
    expect(human.stdout).toMatch(/2 moves of main, 1 through the door, 1 around it/);
  });
  test('a bad --since is refused', () => {
    const r = spawnSync('node', [TS, '--since', 'banana', '--no-writers'], { cwd: root, encoding: 'utf8', env: gitFreeEnv() });
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/--since takes/);
  });

  test('sinceFor gives the --since that reaches back to a start, short of it by a minute at most', () => {
    const now = Date.parse('2026-10-18T12:00:00Z');
    const H = 3600000;
    expect(sinceFor(now - 50 * H, { now })).toBe('50h');
    expect(sinceFor(now - 72 * H - 5000, { now })).toBe('72h');
    expect(sinceFor(now - 50 * H - 2 * 60000, { now })).toBe('51h');
    expect(sinceFor(now - 3 * 60000, { now })).toBe('1h');
    expect(sinceFor(now - 3 * 60000, { now, floorMs: 24 * H })).toBe('24h');
    expect(sinceFor(now - 30 * H, { now, floorMs: 24 * H })).toBe('30h');
    expect(sinceFor(now - 168 * H, { now })).toBe('168h');
    expect(sinceFor(now - 169 * H, { now })).toBe('8d');
    expect(sinceFor(now - 17 * 24 * H - 5000, { now })).toBe('17d');
    for (const start of [now - 1, now - 7 * H, now - 50 * H - 1, now - 169 * H, now - 40 * 24 * H - 5 * 60000]) {
      expect(parseSince(sinceFor(start, { now }), now)).toBeLessThanOrEqual(start + 60000);
    }
  });

  test('names the session that wrote each unsaved file, not one that only read it', () => {
    const owner = /^worktree (.+)$/m.exec(g(root, 'worktree', 'list', '--porcelain'))[1];
    const home = join(base, 'home');
    const dir = join(home, '.claude', 'projects', owner.replace(/[^A-Za-z0-9]/g, '-'));
    mkdirSync(join(dir, 'parent-s', 'subagents'), { recursive: true });
    mkdirSync(join(root, 'Projects', 'P'), { recursive: true });
    writeFileSync(join(root, 'Projects', 'P', 'x.md'), 'new\n');
    writeFileSync(join(root, 'a.md'), 'changed\n');
    const t = (min) => new Date(Date.now() - min * 60000).toISOString();
    const use = (name, path, ts) => `${JSON.stringify({ timestamp: ts, message: { role: 'assistant', content: [{ type: 'tool_use', name, input: { file_path: path } }] } })}\n`;
    writeFileSync(join(dir, 'writer-s.jsonl'), use('Write', join(owner, 'Projects', 'P', 'x.md'), t(5)));
    writeFileSync(join(dir, 'reader-s.jsonl'), use('Read', join(owner, 'Projects', 'P', 'x.md'), t(1)) + use('Read', join(owner, 'a.md'), t(1)));
    writeFileSync(join(dir, 'parent-s', 'subagents', 'agent-1.jsonl'), use('Edit', join(owner, 'a.md'), t(3)));
    const r = spawnSync('node', [TS, '--json'], { cwd: root, encoding: 'utf8', env: gitFreeEnv({ HOME: home }) });
    expect(r.status, r.stderr).toBe(0);
    const s = JSON.parse(r.stdout);
    const by = Object.fromEntries(s.unsaved.map((u) => [u.path, u.writer]));
    expect(by['Projects/']).toBe('writer-s');
    expect(by['a.md']).toBe('parent-s');
    expect(s.writers_truncated).toBe(false);
  });

  test('a write a later change has overtaken is marked so', () => {
    const owner = /^worktree (.+)$/m.exec(g(root, 'worktree', 'list', '--porcelain'))[1];
    const home = join(base, 'home');
    const dir = join(home, '.claude', 'projects', owner.replace(/[^A-Za-z0-9]/g, '-'));
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(root, 'a.md'), 'changed\n');
    const old = new Date(Date.now() - 3600000);
    writeFileSync(join(dir, 'old-s.jsonl'), `${JSON.stringify({ timestamp: old.toISOString(), message: { content: [{ type: 'tool_use', name: 'Edit', input: { file_path: join(owner, 'a.md') } }] } })}\n`);
    const r = spawnSync('node', [TS, '--json'], { cwd: root, encoding: 'utf8', env: gitFreeEnv({ HOME: home }) });
    const row = JSON.parse(r.stdout).unsaved.find((u) => u.path === 'a.md');
    expect(row.writer).toBe('old-s');
    expect(row.overtaken).toBe(true);
    utimesSync(join(root, 'a.md'), old, old);
    const again = JSON.parse(spawnSync('node', [TS, '--json'], { cwd: root, encoding: 'utf8', env: gitFreeEnv({ HOME: home }) }).stdout).unsaved.find((u) => u.path === 'a.md');
    expect(again.overtaken).toBe(false);
  });

  test('a landing marker reads as in progress, died, or unreadable', () => {
    const markerFile = join(root, '.git', 'palace-land.json');
    const read = () => spawnSync('node', [TS, '--no-writers'], { cwd: root, encoding: 'utf8', env: gitFreeEnv() }).stdout;
    writeFileSync(markerFile, JSON.stringify({ old: 'a'.repeat(40), new: 'b'.repeat(40), branch: 'feature/x', pid: process.pid }));
    expect(read()).toMatch(/a landing is in progress: feature\/x/);
    writeFileSync(markerFile, JSON.stringify({ old: 'a'.repeat(40), new: 'b'.repeat(40), branch: 'feature/x', pid: 2 ** 22 + 7 }));
    expect(read()).toMatch(/a landing died halfway and is not healed yet: feature\/x \(aaaaaaaa to bbbbbbbb\)/);
    writeFileSync(markerFile, 'not json');
    expect(read()).toMatch(/marker is present but unreadable/);
  });
});
