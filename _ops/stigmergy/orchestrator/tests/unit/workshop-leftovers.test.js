import { describe, test, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { uncommittedInBundle, leftoverLines } from '../../src/workshop-leftovers.js';
import { cycleBody } from '../../src/cycle-commit.js';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

const git = (root, args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', env: gitFreeEnv() });

let root;
afterEach(() => { if (root) rmSync(root, { recursive: true, force: true, maxRetries: 5 }); root = null; });

// A palace whose steward bundle has a committed file, then a dead spawn's work beside it.
function makePalace() {
  root = mkdtempSync(path.join(tmpdir(), 'palace-wl-'));
  const bundle = path.join(root, 'Projects/Test Steward');
  mkdirSync(path.join(bundle, 'vital'), { recursive: true });
  writeFileSync(path.join(root, '.gitignore'), '__pycache__/\n*.wav\n');
  writeFileSync(path.join(bundle, 'notes.txt'), 'first\n');
  writeFileSync(path.join(bundle, 'gone.txt'), 'to delete\n');
  git(root, ['init', '-q', '-b', 'main']);
  assertScratchRepo(root);
  git(root, ['config', 'user.name', 'test']);
  git(root, ['config', 'user.email', 'test@example.com']);
  git(root, ['add', '-A']);
  git(root, ['commit', '-q', '-m', 'init']);
  writeFileSync(path.join(bundle, 'vital', 'host.py'), 'print(1)\n');
  writeFileSync(path.join(bundle, 'vital', 'README.md'), '# vital\n');
  mkdirSync(path.join(bundle, 'vital', '__pycache__'));
  writeFileSync(path.join(bundle, 'vital', '__pycache__', 'host.pyc'), 'x');
  writeFileSync(path.join(bundle, 'vital', 'render.wav'), 'x');
  writeFileSync(path.join(bundle, 'notes.txt'), 'second\n');
  rmSync(path.join(bundle, 'gone.txt'));
  writeFileSync(path.join(bundle, 'Test Steward — scroll.md'), '# scroll\n');
  writeFileSync(path.join(root, 'Elsewhere.md'), 'not in the bundle\n');
  return bundle;
}

describe('uncommittedInBundle', () => {
  test('names new, changed and deleted files in the bundle, not ignored ones, not the scroll, not outside it', () => {
    const bundle = makePalace();
    expect(uncommittedInBundle(root, bundle, { home: 'Test Steward' })).toEqual([
      { path: 'Projects/Test Steward/gone.txt', state: 'deleted' },
      { path: 'Projects/Test Steward/notes.txt', state: 'changed' },
      { path: 'Projects/Test Steward/vital/README.md', state: 'new' },
      { path: 'Projects/Test Steward/vital/host.py', state: 'new' },
    ]);
  });

  test('leaves out what the caller says is riding, by palace-relative or absolute path', () => {
    const bundle = makePalace();
    const left = uncommittedInBundle(root, 'Projects/Test Steward', { home: 'Test Steward', exclude: ['Projects/Test Steward/vital/host.py', path.join(bundle, 'notes.txt')] });
    expect(left.map((l) => l.path)).toEqual(['Projects/Test Steward/gone.txt', 'Projects/Test Steward/vital/README.md']);
  });

  test('says nothing when git cannot answer, or there is no bundle', () => {
    root = mkdtempSync(path.join(tmpdir(), 'palace-wl-nogit-'));
    mkdirSync(path.join(root, 'B'));
    writeFileSync(path.join(root, 'B', 'x.txt'), 'x');
    expect(uncommittedInBundle(root, 'B')).toEqual([]);
    expect(uncommittedInBundle(root, null)).toEqual([]);
    expect(uncommittedInBundle(root, '../outside')).toEqual([]);
  });
});

describe('the leftovers in a cycle commit body', () => {
  test('are named under their own heading, capped, before the committed-by line', () => {
    const leftovers = Array.from({ length: 32 }, (_, i) => ({ path: `Projects/T/f${String(i).padStart(2, '0')}.py`, state: 'new' }));
    const body = cycleBody({ leftovers });
    expect(body).toContain("Left uncommitted in the bundle — no message of this cycle declared them, so they wait for Loudon's eyes:\n- Projects/T/f00.py (new)");
    expect(body).toContain('- Projects/T/f29.py (new)\n- … and 2 more');
    expect(body).not.toContain('f30.py');
    expect(body.trim().endsWith('the steward did not run git.')).toBe(true);
    expect(leftoverLines([])).toEqual([]);
    expect(cycleBody({})).not.toContain('Left uncommitted');
  });
});
