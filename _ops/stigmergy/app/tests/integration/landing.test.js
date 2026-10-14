// palace-land (scripts/palace-land.mjs) and the recovery every door pass runs
// first (server/landing.js), in throwaway repos with real git.

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeMarker, readMarker } from '../../server/landing.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP = resolve(__dirname, '..', '..');
const LAND = join(APP, 'scripts', 'palace-land.mjs');
const COMMIT = join(APP, 'scripts', 'palace-commit.mjs');

let base;
let owner;
let wt;
const g = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8' });
const env = (extra = {}) => ({ ...process.env, PALACE_DOOR_NO_BOARD: '1', ...extra });
const land = (cwd, ...a) => spawnSync('node', [LAND, ...a], { cwd, encoding: 'utf8', env: env() });
const commit = (cwd, file) => spawnSync('node', [COMMIT, '--kind', 'edit', '--summary', `touch ${file}`, '--verify', 'verified', '--path', file], { cwd, encoding: 'utf8', env: env() });

beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), 'palaceland-'));
  owner = join(base, 'owner');
  mkdirSync(owner);
  g(owner, 'init', '-q', '-b', 'main');
  g(owner, 'config', 'user.email', 't@t');
  g(owner, 'config', 'user.name', 't');
  g(owner, 'config', 'commit.gpgsign', 'false');
  writeFileSync(join(owner, 'a.md'), 'a1\n');
  writeFileSync(join(owner, 'b.md'), 'b1\n');
  g(owner, 'add', '-A');
  g(owner, 'commit', '-qm', 'init');
  wt = join(base, 'wt');
  g(owner, 'worktree', 'add', '-q', '-b', 'feature/x', wt);
});
afterEach(() => { rmSync(base, { recursive: true, force: true }); });

function branchEdits(files) {
  for (const [p, c] of Object.entries(files)) {
    mkdirSync(dirname(join(wt, p)), { recursive: true });
    writeFileSync(join(wt, p), c);
  }
  g(wt, 'add', '-A');
  g(wt, 'commit', '-qm', 'branch work');
}

describe('palace-land', () => {
  test('lands a branch from its own worktree: a true merge, main and the folder move together, unsaved work elsewhere untouched', () => {
    branchEdits({ 'a.md': 'a2\n', 'new/c.md': 'c\n' });
    writeFileSync(join(owner, 'b.md'), 'someone else is editing this\n');
    const before = g(owner, 'rev-parse', 'main').trim();
    const r = land(wt, 'feature/x', '--summary', 'branch work');
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toMatch(/palace-land: landed [0-9a-f]{8}/);
    const parents = g(owner, 'log', '-1', '--format=%P', 'main').trim().split(' ');
    expect(parents[0]).toBe(before);
    expect(parents[1]).toBe(g(owner, 'rev-parse', 'feature/x').trim());
    expect(g(owner, 'log', '-1', '--format=%s', 'main').trim()).toBe('merge(x): branch work');
    expect(readFileSync(join(owner, 'a.md'), 'utf8')).toBe('a2\n');
    expect(readFileSync(join(owner, 'new/c.md'), 'utf8')).toBe('c\n');
    expect(g(owner, 'status', '--porcelain=v1').trim()).toBe('M b.md');
    expect(readMarker(owner)).toBeNull();
  });

  test('a branch already on main is said so, and nothing moves', () => {
    const r = land(wt, 'feature/x');
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/already on main/);
  });

  test('a conflict is refused before anything moves, naming the file', () => {
    branchEdits({ 'a.md': 'branch side\n' });
    writeFileSync(join(owner, 'a.md'), 'main side\n');
    g(owner, 'commit', '-qam', 'main side');
    const before = g(owner, 'rev-parse', 'main').trim();
    const r = land(wt, 'feature/x');
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/conflicts with main in a\.md/);
    expect(g(owner, 'rev-parse', 'main').trim()).toBe(before);
  });

  test('an unsaved file the landing would change is someone\'s work: refused, named, untouched', () => {
    branchEdits({ 'a.md': 'a2\n' });
    writeFileSync(join(owner, 'a.md'), 'unsaved edit\n');
    const before = g(owner, 'rev-parse', 'main').trim();
    const r = land(wt, 'feature/x');
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/unsaved or untracked in the main checkout: a\.md/);
    expect(readFileSync(join(owner, 'a.md'), 'utf8')).toBe('unsaved edit\n');
    expect(g(owner, 'rev-parse', 'main').trim()).toBe(before);
  });

  test('an untracked file where the branch adds one is refused too', () => {
    branchEdits({ 'new.md': 'from the branch\n' });
    writeFileSync(join(owner, 'new.md'), 'someone\'s scratch\n');
    const r = land(wt, 'feature/x');
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/new\.md/);
    expect(readFileSync(join(owner, 'new.md'), 'utf8')).toBe('someone\'s scratch\n');
  });

  test('the dry run moves nothing', () => {
    branchEdits({ 'a.md': 'a2\n' });
    const before = g(owner, 'rev-parse', 'main').trim();
    const r = land(wt, 'feature/x', '--dry-run');
    expect(r.status).toBe(0);
    expect(r.stdout).toMatch(/dry run: would land feature\/x as a merge changing 1 file/);
    expect(g(owner, 'rev-parse', 'main').trim()).toBe(before);
    expect(readFileSync(join(owner, 'a.md'), 'utf8')).toBe('a1\n');
  });
});

describe('a landing that died halfway', () => {
  // Build the merge a landing would have made, then leave the folder the way a
  // kill would: some files at the new version, the index and main still old.
  function deadLanding(writeNew) {
    branchEdits({ 'a.md': 'a2\n', 'b.md': 'b2\n', 'gone.md': 'temporary\n' });
    g(wt, 'rm', '-q', 'gone.md');
    g(wt, 'commit', '-qm', 'remove it again');
    const old = g(owner, 'rev-parse', 'main').trim();
    const tree = g(owner, 'merge-tree', '--write-tree', old, 'feature/x').trim();
    const merge = g(owner, 'commit-tree', tree, '-p', old, '-p', 'feature/x', '-m', 'merge(x): died').trim();
    writeMarker(owner, { root: owner, old, new: merge, branch: 'feature/x' });
    for (const [p, c] of Object.entries(writeNew)) writeFileSync(join(owner, p), c);
    return { old, merge };
  }

  test('every file at the old or new version: the next committer finishes it quietly and says so', () => {
    const { merge } = deadLanding({ 'a.md': 'a2\n' }); // a.md written, b.md not yet
    writeFileSync(join(owner, 'unrelated.md'), 'u\n');
    const r = commit(owner, 'unrelated.md');
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toMatch(/finished a landing that died halfway: feature\/x, 2 files/);
    expect(g(owner, 'rev-parse', 'main~1').trim()).toBe(merge);
    expect(readFileSync(join(owner, 'b.md'), 'utf8')).toBe('b2\n');
    expect(g(owner, 'status', '--porcelain=v1').trim()).toBe('');
    expect(readMarker(owner)).toBeNull();
  });

  test('a file git was cut off writing (a prefix of the new version) is finished, not mistaken for an edit', () => {
    const { merge } = deadLanding({ 'a.md': 'a2\n', 'b.md': 'b' }); // b.md torn: the first byte of "b2\n"
    writeFileSync(join(owner, 'unrelated.md'), 'u\n');
    const r = commit(owner, 'unrelated.md');
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toMatch(/finished a landing that died halfway/);
    expect(g(owner, 'rev-parse', 'main~1').trim()).toBe(merge);
    expect(readFileSync(join(owner, 'b.md'), 'utf8')).toBe('b2\n');
    expect(g(owner, 'status', '--porcelain=v1').trim()).toBe('');
  });

  test('a file at neither version is someone\'s edit: left alone and named, and the landing undone', () => {
    const { old } = deadLanding({ 'a.md': 'a2\n', 'b.md': 'someone else\'s edit\n' });
    writeFileSync(join(owner, 'unrelated.md'), 'u\n');
    const r = commit(owner, 'unrelated.md');
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toMatch(/undid a landing that died halfway .*b\.md/);
    expect(g(owner, 'rev-parse', 'main~1').trim()).toBe(old);
    expect(readFileSync(join(owner, 'a.md'), 'utf8')).toBe('a1\n'); // put back to main's version
    expect(readFileSync(join(owner, 'b.md'), 'utf8')).toBe('someone else\'s edit\n'); // untouched
    expect(g(owner, 'status', '--porcelain=v1').trim()).toBe('M b.md');
    // The branch can simply be landed again once b.md is settled.
    writeFileSync(join(owner, 'b.md'), 'b1\n');
    expect(land(wt, 'feature/x').status).toBe(0);
  });

  test('a real kill in the middle of a large landing leaves nothing the next committer cannot heal', async () => {
    const files = {};
    for (let i = 0; i < 3000; i += 1) files[`bulk/f${i}.md`] = `${'x'.repeat(2000)} ${i}\n`;
    branchEdits(files);
    const child = spawn('node', [LAND, 'feature/x'], { cwd: wt, env: env() });
    const t0 = Date.now();
    while (!readMarker(owner) && Date.now() - t0 < 20_000) await new Promise((w) => setTimeout(w, 5));
    await new Promise((w) => setTimeout(w, 40));
    child.kill('SIGKILL');
    await new Promise((w) => child.on('close', w));
    await new Promise((w) => setTimeout(w, 1500)); // let an orphaned git finish
    writeFileSync(join(owner, 'unrelated.md'), 'u\n');
    const r = commit(owner, 'unrelated.md');
    expect(r.status, r.stderr).toBe(0);
    expect(g(owner, 'status', '--porcelain=v1').trim()).toBe('');
    expect(existsSync(join(owner, 'bulk', 'f2999.md'))).toBe(true);
    expect(g(owner, 'log', '-2', '--format=%s', 'main').trim().split('\n')[1]).toBe('merge(x): land feature/x');
    expect(readMarker(owner)).toBeNull();
  }, 90_000);
});
