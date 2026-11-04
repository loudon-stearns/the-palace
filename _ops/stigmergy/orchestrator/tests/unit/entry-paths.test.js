import { describe, test, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, renameSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { findEntryFile, resolveBundleDir, EXCLUDE_DIRS } from '../../src/entry-paths.js';

describe('findEntryFile', () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

  test('finds an entry nested in a subdirectory', () => {
    root = mkdtempSync(path.join(tmpdir(), 'palace-ep-'));
    mkdirSync(path.join(root, 'Projects'), { recursive: true });
    const target = path.join(root, 'Projects', 'Target.md');
    writeFileSync(target, '# Target');
    expect(findEntryFile(root, 'Target')).toBe(target);
  });

  test('returns null when the entry is absent', () => {
    root = mkdtempSync(path.join(tmpdir(), 'palace-ep-'));
    expect(findEntryFile(root, 'Nope')).toBeNull();
  });

  test('skips excluded system directories', () => {
    root = mkdtempSync(path.join(tmpdir(), 'palace-ep-'));
    mkdirSync(path.join(root, '.git'), { recursive: true });
    writeFileSync(path.join(root, '.git', 'Hidden.md'), '# nope');
    expect(EXCLUDE_DIRS.has('.git')).toBe(true);
    expect(findEntryFile(root, 'Hidden')).toBeNull();
  });

  // The lookup is served from an index (one walk per root); these pin that the
  // index never answers differently from a fresh walk.
  test('finds an entry created after a lookup missed it', () => {
    root = mkdtempSync(path.join(tmpdir(), 'palace-ep-'));
    expect(findEntryFile(root, 'Late')).toBeNull();
    writeFileSync(path.join(root, 'Late.md'), '# late');
    expect(findEntryFile(root, 'Late')).toBe(path.join(root, 'Late.md'));
  });

  test('follows an entry that moved after it was found', () => {
    root = mkdtempSync(path.join(tmpdir(), 'palace-ep-'));
    const before = path.join(root, 'Mover.md');
    writeFileSync(before, '# mover');
    expect(findEntryFile(root, 'Mover')).toBe(before);
    mkdirSync(path.join(root, 'Projects'), { recursive: true });
    const after = path.join(root, 'Projects', 'Mover.md');
    renameSync(before, after);
    expect(findEntryFile(root, 'Mover')).toBe(after);
  });

  test('returns null once a found entry is deleted', () => {
    root = mkdtempSync(path.join(tmpdir(), 'palace-ep-'));
    const file = path.join(root, 'Gone.md');
    writeFileSync(file, '# gone');
    expect(findEntryFile(root, 'Gone')).toBe(file);
    rmSync(file);
    expect(findEntryFile(root, 'Gone')).toBeNull();
  });
});

describe('resolveBundleDir', () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

  test('returns the sibling bundle folder next to the entry file', () => {
    root = mkdtempSync(path.join(tmpdir(), 'palace-ep-'));
    mkdirSync(path.join(root, 'Projects'), { recursive: true });
    writeFileSync(path.join(root, 'Projects', 'Shepard Tone Synthesizer.md'), '# x');
    const res = resolveBundleDir(root, 'Shepard Tone Synthesizer');
    expect(res.entryFile).toBe(path.join(root, 'Projects', 'Shepard Tone Synthesizer.md'));
    expect(res.bundleDir).toBe(path.join(root, 'Projects', 'Shepard Tone Synthesizer'));
  });

  test('does not require the bundle folder to exist yet (bundles are lazy)', () => {
    root = mkdtempSync(path.join(tmpdir(), 'palace-ep-'));
    writeFileSync(path.join(root, 'Loose.md'), '# x');
    const res = resolveBundleDir(root, 'Loose');
    expect(res.bundleDir).toBe(path.join(root, 'Loose'));
  });

  test('returns null when the entry file cannot be found', () => {
    root = mkdtempSync(path.join(tmpdir(), 'palace-ep-'));
    expect(resolveBundleDir(root, 'Ghost')).toBeNull();
  });
});
