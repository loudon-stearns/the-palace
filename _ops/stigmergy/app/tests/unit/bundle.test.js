import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { bundleDirFor, classifyFile, listBundleFiles, iconRelFor, facesFor, faceOwnerOf, memoryFor, bundleOwnerOf } from '../../src/lib/bundle.js';
import { readEntry } from '../../src/lib/entries.js';

describe('classifyFile', () => {
  it('classifies by extension', () => {
    expect(classifyFile('a.png')).toBe('image');
    expect(classifyFile('a.WAV')).toBe('audio');
    expect(classifyFile('a.mp4')).toBe('video');
    expect(classifyFile('a.html')).toBe('html');
    expect(classifyFile('a.md')).toBe('text');
    expect(classifyFile('a.json')).toBe('json');
    expect(classifyFile('a.py')).toBe('code');
    expect(classifyFile('a.pdf')).toBe('pdf');
    expect(classifyFile('a.weird')).toBe('file');
    expect(classifyFile('Makefile')).toBe('file');
  });
});

describe('bundleDirFor + listBundleFiles', () => {
  let root;
  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'stigmergy-bundle-'));
    // Entry without a bundle.
    writeFileSync(join(root, 'Alone.md'), '---\ntitle: Alone\n---\nbody\n');
    // Entry with a bundle (Foo.md + Foo/...).
    writeFileSync(join(root, 'Foo.md'), '---\ntitle: Foo\n---\nbody\n');
    mkdirSync(join(root, 'Foo'));
    writeFileSync(join(root, 'Foo', 'Foo — handoff.md'), '# h\n');
    writeFileSync(join(root, 'Foo', 'image.png'), 'PNGDATA');
    writeFileSync(join(root, 'Foo', '.DS_Store'), 'hidden');
    mkdirSync(join(root, 'Foo', 'Archive'));
    writeFileSync(join(root, 'Foo', 'Archive', 'old.md'), '# old\n');
    mkdirSync(join(root, 'Foo', 'media'));
    writeFileSync(join(root, 'Foo', 'media', 'song.wav'), 'WAVDATA');
    mkdirSync(join(root, 'Foo', 'proofs', '2026-10-20-reader', 'ab-test', 'out', 'too-deep'), { recursive: true });
    writeFileSync(join(root, 'Foo', 'proofs', '2026-10-20-reader', 'reader.html'), '<html>');
    writeFileSync(join(root, 'Foo', 'proofs', '2026-10-20-reader', 'ab-test', 'out', 'reply.txt'), 'r');
    writeFileSync(join(root, 'Foo', 'proofs', '2026-10-20-reader', 'ab-test', 'out', 'too-deep', 'x.txt'), 'x');
  });
  afterAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('returns null when no sibling folder', () => {
    expect(bundleDirFor(join(root, 'Alone.md'))).toBeNull();
  });

  it('returns the bundle dir when present', () => {
    const b = bundleDirFor(join(root, 'Foo.md'));
    expect(b).toBe(join(root, 'Foo'));
  });

  it('returns null on non-.md input', () => {
    expect(bundleDirFor('whatever.txt')).toBeNull();
    expect(bundleDirFor(null)).toBeNull();
  });

  it('listBundleFiles walks 2 levels when asked, skips hidden/Archive, classifies', () => {
    const bundle = bundleDirFor(join(root, 'Foo.md'));
    const files = listBundleFiles(root, bundle, { maxDepth: 2 });
    const names = files.map((f) => f.name).sort();
    expect(names).toEqual(['Foo — handoff.md', 'image.png', 'song.wav']);
    const png = files.find((f) => f.name === 'image.png');
    expect(png.kind).toBe('image');
    expect(png.relPath).toBe('Foo/image.png');
    expect(png.size).toBeGreaterThan(0);
    const wav = files.find((f) => f.name === 'song.wav');
    expect(wav.kind).toBe('audio');
    expect(wav.depth).toBe(2);
  });

  it('listBundleFiles walks 5 levels by default, so dated proof folders show', () => {
    const bundle = bundleDirFor(join(root, 'Foo.md'));
    const rel = listBundleFiles(root, bundle).map((f) => f.relPath);
    expect(rel).toContain('Foo/proofs/2026-10-20-reader/reader.html');
    expect(rel).toContain('Foo/proofs/2026-10-20-reader/ab-test/out/reply.txt');
    expect(rel).not.toContain('Foo/proofs/2026-10-20-reader/ab-test/out/too-deep/x.txt');
  });
});

describe('iconRelFor', () => {
  let root;
  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'stigmergy-icon-'));
    // Preferred: "<stem> — icon.png" matching the bundle/entry name.
    mkdirSync(join(root, 'Quantum Synthesizer'));
    writeFileSync(join(root, 'Quantum Synthesizer', 'Quantum Synthesizer — hero.png'), 'PNG');
    writeFileSync(join(root, 'Quantum Synthesizer', 'Quantum Synthesizer — icon.png'), 'PNG');
    // Fallback: a "* — icon.png" that does NOT match the stem.
    mkdirSync(join(root, 'Oddly Named'));
    writeFileSync(join(root, 'Oddly Named', 'something else — icon.png'), 'PNG');
    // No icon at all.
    mkdirSync(join(root, 'Bare'));
    writeFileSync(join(root, 'Bare', 'notes.md'), '# n\n');
  });
  afterAll(() => rmSync(root, { recursive: true, force: true }));

  it('prefers "<stem> — icon.png" and returns a palace-relative path', () => {
    expect(iconRelFor(root, join(root, 'Quantum Synthesizer')))
      .toBe('Quantum Synthesizer/Quantum Synthesizer — icon.png');
  });

  it('falls back to the first "* — icon.png" when the stem name is absent', () => {
    expect(iconRelFor(root, join(root, 'Oddly Named')))
      .toBe('Oddly Named/something else — icon.png');
  });

  it('returns null when the bundle has no icon, or on bad input', () => {
    expect(iconRelFor(root, join(root, 'Bare'))).toBeNull();
    expect(iconRelFor(root, join(root, 'Does Not Exist'))).toBeNull();
    expect(iconRelFor(root, null)).toBeNull();
  });
});

describe('facesFor + faceOwnerOf', () => {
  let root;
  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'stigmergy-faces-'));
    mkdirSync(join(root, 'Plain'));
    writeFileSync(join(root, 'Plain', 'Plain — hero.png'), 'PNG');
    mkdirSync(join(root, 'Rich'));
    writeFileSync(join(root, 'Rich', 'Rich — rich.json'), '{}');
    writeFileSync(join(root, 'Rich', 'Rich — scroll.md'), '# s\n');
    mkdirSync(join(root, 'Odd'));
    // A manifest named for another entry is not this entry's face.
    writeFileSync(join(root, 'Odd', 'Other — rich.json'), '{}');
  });
  afterAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('always has the text face, and nothing else without a bundle', () => {
    expect(facesFor(root, null)).toEqual({ faces: ['text'], files: {} });
    expect(facesFor(root, join(root, 'Plain'))).toEqual({ faces: ['text'], files: {} });
  });

  it('reads rich and scroll from the bundle, in a fixed order', () => {
    const { faces, files } = facesFor(root, join(root, 'Rich'));
    expect(faces).toEqual(['text', 'rich', 'scroll']);
    expect(files).toEqual({ rich: 'Rich/Rich — rich.json', scroll: 'Rich/Rich — scroll.md' });
  });

  it('keys on the bundle stem, not any manifest in the folder', () => {
    expect(facesFor(root, join(root, 'Odd')).faces).toEqual(['text']);
  });

  it('names the owner of a scroll file, and only of a scroll file', () => {
    expect(faceOwnerOf('Projects/Foo/Foo — scroll.md')).toEqual({ path: 'Projects/Foo.md', face: 'scroll' });
    expect(faceOwnerOf('Foo/Foo — scroll.md')).toEqual({ path: 'Foo.md', face: 'scroll' });
    expect(faceOwnerOf('Foo/Bar — scroll.md')).toBeNull();
    expect(faceOwnerOf('Foo/Foo — baton.md')).toBeNull();
    expect(faceOwnerOf('Foo — scroll.md')).toBeNull();
    expect(faceOwnerOf(null)).toBeNull();
  });
});

describe('memoryFor + the memory owner', () => {
  let root;
  beforeAll(() => {
    root = mkdtempSync(join(tmpdir(), 'stigmergy-memory-'));
    writeFileSync(join(root, 'Kept.md'), '---\ntitle: Kept\n---\nbody\n');
    mkdirSync(join(root, 'Kept'));
    writeFileSync(join(root, 'Kept', 'Kept — Context.md'), '---\ntitle: Kept — Context\n---\nwhy\n');
    writeFileSync(join(root, 'Kept', 'Kept — tuning.md'), '---\ntitle: Kept — tuning\nledger: tuning\n---\nrun\n');
    writeFileSync(join(root, 'Kept', 'Kept — diary.md'), '---\ntitle: Kept — diary\nledger: "diary"\n---\nmet\n');
    writeFileSync(join(root, 'Kept', 'Kept — sketch.md'), '---\ntitle: Kept — sketch\n---\nledger: not frontmatter\n');
    // Folder and title differ in case, as JEWEL/ holds `Jewel — Context.md`.
    writeFileSync(join(root, 'LOUD.md'), '---\ntitle: Loud\n---\nbody\n');
    mkdirSync(join(root, 'LOUD'));
    writeFileSync(join(root, 'LOUD', 'Loud — Context.md'), '# c\n');
    // An entry that only sits in a folder is no one's memory.
    writeFileSync(join(root, 'Shelf.md'), '---\ntitle: Shelf\n---\nhub\n');
    mkdirSync(join(root, 'Shelf'));
    writeFileSync(join(root, 'Shelf', 'Book.md'), '---\ntitle: Book\nledger: tuning\n---\nbody\n');
  });
  afterAll(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it('finds the Context and every frontmatter ledger, by kind', () => {
    expect(memoryFor(root, join(root, 'Kept'))).toEqual({
      context: 'Kept/Kept — Context.md',
      ledgers: [
        { kind: 'diary', path: 'Kept/Kept — diary.md' },
        { kind: 'tuning', path: 'Kept/Kept — tuning.md' },
      ],
    });
  });

  it('falls back to any Context when the folder and title differ', () => {
    expect(memoryFor(root, join(root, 'LOUD')).context).toBe('LOUD/Loud — Context.md');
  });

  it('is empty without a bundle', () => {
    expect(memoryFor(root, null)).toEqual({ context: null, ledgers: [] });
  });

  it('names the place-owner of a bundle file', () => {
    expect(bundleOwnerOf('Projects/Foo/Foo — tuning.md')).toBe('Projects/Foo.md');
    expect(bundleOwnerOf('Foo.md')).toBeNull();
  });

  it('reads a Context or ledger as its owner\'s memory, and nothing else', () => {
    const e = readEntry(root, 'Kept.md');
    expect(e.memory.context).toBe('Kept/Kept — Context.md');
    expect(readEntry(root, 'Kept/Kept — Context.md').face_of).toMatchObject({ path: 'Kept.md', face: 'context' });
    expect(readEntry(root, 'Kept/Kept — tuning.md').face_of).toMatchObject({ path: 'Kept.md', face: 'ledger:Kept/Kept — tuning.md' });
    expect(readEntry(root, 'LOUD/Loud — Context.md').face_of).toMatchObject({ path: 'LOUD.md', face: 'context' });
    expect(readEntry(root, 'Kept/Kept — sketch.md').face_of).toBeNull();
    expect(readEntry(root, 'Kept/Kept — Context.md').face_of.hero).toBeNull();
    writeFileSync(join(root, 'Kept', 'Kept — hero.png'), 'PNG');
    expect(readEntry(root, 'Kept/Kept — tuning.md').face_of.hero).toEqual({ name: 'Kept — hero.png', relPath: 'Kept/Kept — hero.png', size: 3 });
    expect(readEntry(root, 'Shelf/Book.md').face_of).toBeNull();
  });
});
