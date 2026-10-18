// palace-land (scripts/palace-land.mjs) and the recovery every door pass runs
// first (server/landing.js), in throwaway repos with real git.

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, chmodSync, statSync, readdirSync, utimesSync, unlinkSync, appendFileSync } from 'node:fs';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeMarker, readMarker } from '../../server/landing.js';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP = resolve(__dirname, '..', '..');
const LAND = join(APP, 'scripts', 'palace-land.mjs');
const COMMIT = join(APP, 'scripts', 'palace-commit.mjs');

let base;
let owner;
let wt;
const g = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', env: gitFreeEnv() });
const env = (extra = {}) => gitFreeEnv({ PALACE_DOOR_NO_BOARD: '1', ...extra });
const land = (cwd, ...a) => spawnSync('node', [LAND, ...a], { cwd, encoding: 'utf8', env: env() });
const commit = (cwd, file, extra = {}) => spawnSync('node', [COMMIT, '--kind', 'edit', '--summary', `touch ${file}`, '--verify', 'verified', '--path', file], { cwd, encoding: 'utf8', env: env(extra) });
// An unrelated commit in the main checkout: the next pass through the door.
function nextPass(extra = {}) {
  writeFileSync(join(owner, 'unrelated.md'), `u ${Math.random()}\n`);
  return commit(owner, 'unrelated.md', extra);
}

beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), 'palaceland-'));
  owner = join(base, 'owner');
  mkdirSync(owner);
  g(owner, 'init', '-q', '-b', 'main');
  assertScratchRepo(owner, base);
  g(owner, 'config', 'user.email', 't@t');
  g(owner, 'config', 'user.name', 't');
  g(owner, 'config', 'commit.gpgsign', 'false');
  writeFileSync(join(owner, 'a.md'), 'a1\n');
  writeFileSync(join(owner, 'b.md'), 'b1\n');
  g(owner, 'add', '-A');
  g(owner, 'commit', '-qm', 'init');
  wt = join(base, 'wt');
  g(owner, 'worktree', 'add', '-q', '-b', 'feature/x', wt);
  assertScratchRepo(wt, base);
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
    expect(r.stderr).toMatch(/meets something unsaved, untracked in the main checkout: a\.md/);
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

  test('HEAD means the branch of the checkout it is run from, not the main checkout\'s', () => {
    branchEdits({ 'a.md': 'a2\n' });
    const r = land(wt, 'HEAD');
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toMatch(/landed/);
    expect(readFileSync(join(owner, 'a.md'), 'utf8')).toBe('a2\n');
    expect(g(owner, 'log', '-1', '--format=%s', 'main').trim()).toBe('merge(x): land feature/x');
  });

  test('HEAD on no branch is refused', () => {
    g(wt, 'switch', '-q', '--detach');
    const r = land(wt, '@');
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/not on a branch/);
  });

  test('an ignored file the landing would overwrite is refused and kept', () => {
    writeFileSync(join(owner, '.gitignore'), 'config.local\nscratch/\n');
    g(owner, 'add', '.gitignore');
    g(owner, 'commit', '-qm', 'ignore');
    g(wt, 'merge', '-q', 'main');
    writeFileSync(join(owner, 'config.local'), 'LOUDON LOCAL SETTINGS\n');
    writeFileSync(join(wt, 'config.local'), 'from the branch\n');
    g(wt, 'add', '-f', 'config.local');
    g(wt, 'commit', '-qm', 'force-add');
    const r = land(wt, 'feature/x');
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/or ignored in the main checkout: config\.local/);
    expect(readFileSync(join(owner, 'config.local'), 'utf8')).toBe('LOUDON LOCAL SETTINGS\n');
    expect(readMarker(owner)).toBeNull();
  });

  test('a file the branch adds where an ignored folder holds local files is refused, and the folder kept', () => {
    writeFileSync(join(owner, '.gitignore'), 'scratch/\n');
    g(owner, 'add', '.gitignore');
    g(owner, 'commit', '-qm', 'ignore');
    g(wt, 'merge', '-q', 'main');
    mkdirSync(join(owner, 'scratch', 'deep'), { recursive: true });
    writeFileSync(join(owner, 'scratch', 'deep', 'p.txt'), 'private\n');
    writeFileSync(join(wt, 'scratch'), 'a file now\n');
    g(wt, 'add', '-f', 'scratch');
    g(wt, 'commit', '-qm', 'a file named scratch');
    const r = land(wt, 'feature/x');
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/scratch \(in the way: scratch\/\)/);
    expect(readFileSync(join(owner, 'scratch', 'deep', 'p.txt'), 'utf8')).toBe('private\n');
  });

  test('an untracked file where the branch needs a folder is refused before anything moves', () => {
    branchEdits({ 'notes/x.md': 'x\n', 'a.md': 'a2\n' });
    writeFileSync(join(owner, 'notes'), 'a file, not a folder\n');
    const r = land(wt, 'feature/x');
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/notes\/x\.md \(in the way: notes\)/);
    expect(readFileSync(join(owner, 'a.md'), 'utf8')).toBe('a1\n');
    expect(readMarker(owner)).toBeNull();
  });

  test('a branch that renames a file with unsaved edits is refused, naming the old name', () => {
    g(wt, 'mv', 'a.md', 'c.md');
    g(wt, 'commit', '-qm', 'rename');
    writeFileSync(join(owner, 'a.md'), 'unsaved edit\n');
    const r = land(wt, 'feature/x');
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/: a\.md/);
    expect(readFileSync(join(owner, 'a.md'), 'utf8')).toBe('unsaved edit\n');
  });

  test('on a case-insensitive disk, an untracked file differing only in case is in the way', () => {
    if (g(owner, 'config', '--bool', 'core.ignorecase').trim() !== 'true') return;
    branchEdits({ 'notes.md': 'branch\n' });
    writeFileSync(join(owner, 'Notes.md'), 'someone\'s\n');
    const r = land(wt, 'feature/x');
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/notes\.md \(in the way: Notes\.md\)/);
    expect(readFileSync(join(owner, 'Notes.md'), 'utf8')).toBe('someone\'s\n');
  });

  test('a conflict names em-dash files readably', () => {
    const name = 'Kuramoto — Context.md';
    writeFileSync(join(owner, name), 'base\n');
    g(owner, 'add', name);
    g(owner, 'commit', '-qm', 'base');
    g(wt, 'merge', '-q', 'main');
    writeFileSync(join(wt, name), 'branch\n');
    g(wt, 'commit', '-qam', 'branch');
    writeFileSync(join(owner, name), 'main\n');
    g(owner, 'commit', '-qam', 'main');
    const r = land(wt, 'feature/x');
    expect(r.status).toBe(2);
    expect(r.stderr).toContain(`conflicts with main in ${name}`);
  });

  test('a fast-forward git refuses is put back, and never lands later under someone else\'s commit', () => {
    branchEdits({ 'a.md': 'a2\n' });
    const before = g(owner, 'rev-parse', 'main').trim();
    // A lock held by someone: fresh enough that the door waits, older than the landing.
    const lock = join(owner, '.git', 'index.lock');
    writeFileSync(lock, '');
    const fiveAgo = new Date(Date.now() - 5000);
    utimesSync(lock, fiveAgo, fiveAgo);
    const r = spawnSync('node', [LAND, 'feature/x'], { cwd: wt, encoding: 'utf8', env: env({ PALACE_DOOR_INDEX_PATIENCE_MS: '800' }) });
    expect(r.status, r.stderr).toBe(75);
    expect(g(owner, 'rev-parse', 'main').trim()).toBe(before);
    expect(readMarker(owner)).toMatchObject({ abandon: true });
    unlinkSync(lock);
    const next = nextPass();
    expect(next.status, next.stderr).toBe(0);
    expect(next.stderr).toMatch(/undid the landing of feature\/x that palace-land gave up on/);
    expect(g(owner, 'rev-parse', 'main~1').trim()).toBe(before);
    expect(readFileSync(join(owner, 'a.md'), 'utf8')).toBe('a1\n');
    expect(readMarker(owner)).toBeNull();
  }, 30_000);

  test('the dry run takes no door, heals nothing, and says when a dead landing is waiting', () => {
    branchEdits({ 'a.md': 'a2\n' });
    const old = g(owner, 'rev-parse', 'main').trim();
    writeMarker(owner, { root: owner, old, new: g(owner, 'rev-parse', 'feature/x').trim(), branch: 'feature/y' });
    const r = land(wt, 'feature/x', '--dry-run');
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toMatch(/a landing that died halfway \(feature\/y\) is waiting/);
    expect(readMarker(owner)).not.toBeNull();
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

  test('a file git had unlinked but not yet rewritten is the one in flight: finished', () => {
    const { merge } = deadLanding({ 'a.md': 'a2\n' });
    unlinkSync(join(owner, 'b.md'));
    const r = nextPass();
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toMatch(/finished a landing that died halfway/);
    expect(g(owner, 'rev-parse', 'main~1').trim()).toBe(merge);
    expect(readFileSync(join(owner, 'b.md'), 'utf8')).toBe('b2\n');
    expect(g(owner, 'status', '--porcelain=v1').trim()).toBe('');
  });

  test('a missing or cut-short file out of git\'s order is someone\'s edit: undone around it, and named', () => {
    const { old } = deadLanding({ 'a.md': 'a', 'b.md': 'b2\n' }); // a.md a front part, but b.md after it is already new
    const r = nextPass();
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toMatch(/undid a landing that died halfway .*: a file is at neither version.*a\.md/);
    expect(g(owner, 'rev-parse', 'main~1').trim()).toBe(old);
    expect(readFileSync(join(owner, 'a.md'), 'utf8')).toBe('a');
    expect(readFileSync(join(owner, 'b.md'), 'utf8')).toBe('b1\n');
  });

  test('the file in flight is still recognized when someone has edited a later file: put back, and only the edit named', () => {
    const { old } = deadLanding({ 'a.md': '' }); // git created a.md and died before writing it
    writeFileSync(join(owner, 'b.md'), 'someone else\'s edit\n');
    const r = nextPass();
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toMatch(/undid a landing that died halfway .*: a file is at neither version.*left alone: b\.md\./);
    expect(g(owner, 'rev-parse', 'main~1').trim()).toBe(old);
    expect(readFileSync(join(owner, 'a.md'), 'utf8')).toBe('a1\n');
    expect(readFileSync(join(owner, 'b.md'), 'utf8')).toBe('someone else\'s edit\n');
  });

  test('a heal killed while writing leaves no file missing, and the next pass carries on in the same direction', async () => {
    const files = {};
    for (let i = 0; i < 1500; i += 1) files[`bulk/f${String(i).padStart(4, '0')}.md`] = `new ${i}\n`;
    for (const p of Object.keys(files)) { mkdirSync(dirname(join(owner, p)), { recursive: true }); writeFileSync(join(owner, p), `old ${p}\n`); }
    g(owner, 'add', '-A');
    g(owner, 'commit', '-qm', 'old bulk');
    g(wt, 'merge', '-q', 'main');
    branchEdits({ ...files, 'zz-edit.md': 'branch\n' });
    const old = g(owner, 'rev-parse', 'main').trim();
    const tree = g(owner, 'merge-tree', '--write-tree', old, 'feature/x').trim();
    const merge = g(owner, 'commit-tree', tree, '-p', old, '-p', 'feature/x', '-m', 'merge(x): bulk').trim();
    writeMarker(owner, { root: owner, old, new: merge, branch: 'feature/x' });
    // Half the landing written, then someone's edit to a later file: the heal must undo.
    for (let i = 0; i < 700; i += 1) writeFileSync(join(owner, `bulk/f${String(i).padStart(4, '0')}.md`), `new ${i}\n`);
    writeFileSync(join(owner, 'zz-edit.md'), 'someone else\'s\n');
    writeFileSync(join(owner, 'unrelated.md'), 'u\n');
    const child = spawn('node', [COMMIT, '--kind', 'edit', '--summary', 'touch', '--verify', 'verified', '--path', 'unrelated.md'], { cwd: owner, env: env(), detached: true, stdio: 'ignore' });
    const t0 = Date.now();
    while (!readMarker(owner)?.undo && Date.now() - t0 < 20_000) await new Promise((w) => setTimeout(w, 2));
    await new Promise((w) => setTimeout(w, 30));
    try { process.kill(-child.pid, 'SIGKILL'); } catch (_) { /* finished already */ }
    await new Promise((w) => setTimeout(w, 200));
    const missing = Object.keys(files).filter((p) => !existsSync(join(owner, p)));
    expect(missing).toEqual([]);
    const r = nextPass();
    expect(r.status, r.stderr).toBe(0);
    expect(g(owner, 'rev-parse', 'main~1').trim()).not.toBe(merge);
    for (const p of Object.keys(files)) expect(readFileSync(join(owner, p), 'utf8')).toBe(`old ${p}\n`);
    expect(readFileSync(join(owner, 'zz-edit.md'), 'utf8')).toBe('someone else\'s\n');
    expect(readMarker(owner)).toBeNull();
  }, 90_000);

  test('a change to the executable bit alone is finished too', () => {
    writeFileSync(join(owner, 'run.sh'), '#!/bin/sh\n');
    g(owner, 'add', 'run.sh');
    g(owner, 'commit', '-qm', 'script');
    g(wt, 'merge', '-q', 'main');
    chmodSync(join(wt, 'run.sh'), 0o755);
    g(wt, 'commit', '-qam', 'make it runnable');
    const old = g(owner, 'rev-parse', 'main').trim();
    const tree = g(owner, 'merge-tree', '--write-tree', old, 'feature/x').trim();
    const merge = g(owner, 'commit-tree', tree, '-p', old, '-p', 'feature/x', '-m', 'merge(x): mode').trim();
    writeMarker(owner, { root: owner, old, new: merge, branch: 'feature/x' });
    const r = nextPass();
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toMatch(/finished a landing that died halfway: feature\/x, 1 file/);
    expect(statSync(join(owner, 'run.sh')).mode & 0o111).not.toBe(0);
    expect(g(owner, 'status', '--porcelain=v1').trim()).toBe('');
  });

  test('a rename that changes only case is finished without losing the file', () => {
    if (g(owner, 'config', '--bool', 'core.ignorecase').trim() !== 'true') return;
    writeFileSync(join(owner, 'note.md'), 'the only copy\n');
    g(owner, 'add', 'note.md');
    g(owner, 'commit', '-qm', 'note');
    g(wt, 'merge', '-q', 'main');
    g(wt, 'mv', 'note.md', 'Note.md');
    g(wt, 'commit', '-qm', 'capitalize');
    const old = g(owner, 'rev-parse', 'main').trim();
    const tree = g(owner, 'merge-tree', '--write-tree', old, 'feature/x').trim();
    const merge = g(owner, 'commit-tree', tree, '-p', old, '-p', 'feature/x', '-m', 'merge(x): case').trim();
    writeMarker(owner, { root: owner, old, new: merge, branch: 'feature/x' });
    const r = nextPass();
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toMatch(/finished a landing that died halfway/);
    expect(readdirSync(owner)).toContain('Note.md');
    expect(readFileSync(join(owner, 'Note.md'), 'utf8')).toBe('the only copy\n');
    expect(g(owner, 'status', '--porcelain=v1').trim()).toBe('');
  });

  test('a file that became a folder, already written, is finished', () => {
    writeFileSync(join(owner, 'thing'), 'a file\n');
    g(owner, 'add', 'thing');
    g(owner, 'commit', '-qm', 'thing');
    g(wt, 'merge', '-q', 'main');
    g(wt, 'rm', '-q', 'thing');
    mkdirSync(join(wt, 'thing'));
    writeFileSync(join(wt, 'thing', 'x.md'), 'inside\n');
    g(wt, 'add', '-A');
    g(wt, 'commit', '-qm', 'a folder now');
    const old = g(owner, 'rev-parse', 'main').trim();
    const tree = g(owner, 'merge-tree', '--write-tree', old, 'feature/x').trim();
    const merge = g(owner, 'commit-tree', tree, '-p', old, '-p', 'feature/x', '-m', 'merge(x): folder').trim();
    writeMarker(owner, { root: owner, old, new: merge, branch: 'feature/x' });
    unlinkSync(join(owner, 'thing'));
    mkdirSync(join(owner, 'thing'));
    writeFileSync(join(owner, 'thing', 'x.md'), 'inside\n');
    const r = nextPass();
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toMatch(/finished a landing that died halfway/);
    expect(g(owner, 'rev-parse', 'main~1').trim()).toBe(merge);
    expect(g(owner, 'status', '--porcelain=v1').trim()).toBe('');
  });

  test('the ear hears the heal as through the door', () => {
    const log = join(owner, '.git', 'ear-test.log');
    writeFileSync(join(owner, '.git', 'hooks', 'reference-transaction'), `#!/bin/sh\n[ "$1" = committed ] && echo "\${PALACE_DOOR:-0} \${PALACE_DOOR_TAG}" >> '${log}'\nexit 0\n`);
    chmodSync(join(owner, '.git', 'hooks', 'reference-transaction'), 0o755);
    deadLanding({ 'a.md': 'a2\n' });
    writeFileSync(log, '');
    const r = nextPass();
    expect(r.status, r.stderr).toBe(0);
    const lines = readFileSync(log, 'utf8').trim().split('\n');
    expect(lines.some((l) => /^1 .*:heal$/.test(l))).toBe(true);
    expect(lines.every((l) => l.startsWith('1 '))).toBe(true);
  });

  test('while a running git holds the dead landing\'s lock, the pass waits, then fails without doing anything', async () => {
    const { merge } = deadLanding({ 'a.md': 'a2\n' });
    const lock = join(owner, '.git', 'index.lock');
    const holder = spawn('python3', ['-c', `import time,os\nf=open(${JSON.stringify(lock)},'w')\nprint('ok',flush=True)\ntime.sleep(30)`], { stdio: ['ignore', 'pipe', 'ignore'] });
    await new Promise((w) => holder.stdout.once('data', w));
    const r = nextPass({ PALACE_DOOR_INDEX_PATIENCE_MS: '800' });
    expect(r.status).toBe(75);
    expect(r.stderr).toMatch(/a running git still holds/);
    expect(readMarker(owner)).not.toBeNull();
    holder.kill('SIGKILL');
    await new Promise((w) => holder.on('close', w));
    const again = nextPass();
    expect(again.status, again.stderr).toBe(0);
    expect(again.stderr).toMatch(/finished a landing that died halfway/);
    expect(g(owner, 'rev-parse', 'main~1').trim()).toBe(merge);
  }, 30_000);

  test('palace-land will not land over a dead landing the door could not heal', () => {
    deadLanding({ 'a.md': 'a2\n' });
    writeFileSync(join(owner, '.git', 'MERGE_HEAD'), `${g(owner, 'rev-parse', 'main').trim()}\n`);
    const y = join(base, 'wty');
    g(owner, 'worktree', 'add', '-q', '-b', 'feature/y', y, 'main');
    writeFileSync(join(y, 'y.md'), 'y\n');
    g(y, 'add', 'y.md');
    g(y, 'commit', '-qm', 'y');
    const r = land(y, 'feature/y');
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/waits: a merge is half done/);
    expect(r.stderr).toMatch(/still stands/);
    expect(readMarker(owner)).not.toBeNull();
  });

  test('when main moved on without touching the landing\'s files, the landing is undone against it', () => {
    deadLanding({ 'a.md': 'a2\n' });
    writeFileSync(join(owner, 'elsewhere.md'), 'e\n');
    g(owner, 'add', 'elsewhere.md');
    g(owner, 'commit', '-qm', 'raw commit around the door');
    const moved = g(owner, 'rev-parse', 'main').trim();
    const r = nextPass();
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toMatch(/main had moved on, so it is put back/);
    expect(g(owner, 'rev-parse', 'main~1').trim()).toBe(moved);
    expect(readFileSync(join(owner, 'a.md'), 'utf8')).toBe('a1\n');
    expect(g(owner, 'status', '--porcelain=v1').trim()).toBe('');
  });

  test('when main moved on and changed the landing\'s files, nothing is touched and its files are named', () => {
    deadLanding({ 'a.md': 'a2\n' });
    writeFileSync(join(owner, 'b.md'), 'b on main\n');
    g(owner, 'add', 'b.md');
    g(owner, 'commit', '-qm', 'raw commit of a landing file');
    const r = nextPass();
    expect(r.status, r.stderr).toBe(0);
    expect(r.stderr).toMatch(/can no longer be healed.*left at the landing's version: a\.md/);
    expect(readFileSync(join(owner, 'a.md'), 'utf8')).toBe('a2\n');
    expect(readMarker(owner)).toBeNull();
  });

  test('a real kill of the landing and its git, mid-checkout, is healed by the next pass', async () => {
    const files = {};
    for (let i = 0; i < 3000; i += 1) files[`bulk/f${i}.md`] = `${'x'.repeat(2000)} ${i}\n`;
    branchEdits(files);
    const child = spawn('node', [LAND, 'feature/x'], { cwd: wt, env: env(), detached: true, stdio: 'ignore' });
    const t0 = Date.now();
    while (!readMarker(owner) && Date.now() - t0 < 20_000) await new Promise((w) => setTimeout(w, 2));
    await new Promise((w) => setTimeout(w, 60));
    try { process.kill(-child.pid, 'SIGKILL'); } catch (_) { /* already gone */ }
    await new Promise((w) => setTimeout(w, 300));
    const r = nextPass();
    expect(r.status, r.stderr).toBe(0);
    expect(g(owner, 'status', '--porcelain=v1').trim()).toBe('');
    expect(existsSync(join(owner, 'bulk', 'f2999.md'))).toBe(true);
    expect(readMarker(owner)).toBeNull();
  }, 90_000);

});
