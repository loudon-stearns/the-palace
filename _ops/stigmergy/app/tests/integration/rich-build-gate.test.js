import { describe, test, expect, afterAll } from 'vitest';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync, spawnSync } from 'node:child_process';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

// The build gate: build-public runs the piece checker (_ops/rich-face/conform.mjs)
// on every published rich face, with the build's own resolver, and fails closed
// once `enforce.build` is on in the palace's _ops/rich-face/conform.json. A file
// the face names that resolves nowhere, or a file a piece declares that is
// missing, fails the build; report-only, the build prints the table and goes on.
// A piece's declared files ship beside it. Temp palaces, committed (the build
// reads only what git holds), built without vite.

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '../..');
const dirs = [];
afterAll(() => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); });

const PIECE = (head = '') => `<!doctype html><html><head><meta charset="utf-8"><meta name="piece:needs" content="">${head}</head><body>a piece</body></html>`;

function palace({ enforce, pieces, files = {} }) {
  const root = mkdtempSync(resolve(tmpdir(), 'rich-build-gate-'));
  dirs.push(root);
  const git = (...a) => execFileSync('git', ['-c', 'user.email=t@example.com', '-c', 'user.name=t', ...a], { cwd: root, stdio: 'ignore', env: gitFreeEnv() });
  git('init', '-q');
  assertScratchRepo(root);
  const put = (rel, body) => { mkdirSync(dirname(join(root, rel)), { recursive: true }); writeFileSync(join(root, rel), body); };
  put('_ops/loudon-live/design-system/colors_and_type.css', ':root{}');
  put('_ops/rich-face/conform.json', JSON.stringify({ enforce: { push: false, build: enforce }, not_pieces: [], allow: [] }));
  put('Demo.md', ['---', 'title: Demo', 'type: concept', '---', '# Demo', '', '## Pieces', '', 'The pieces sit here.', ''].join('\n'));
  put('Demo/Demo — rich.json', JSON.stringify({ entry: 'Demo', sections: [{ heading: 'Pieces', pieces }] }));
  for (const [rel, body] of Object.entries(files)) put(rel, body);
  git('add', '-A');
  git('commit', '-qm', 'the palace');
  return root;
}

function build(root) {
  const out = mkdtempSync(resolve(tmpdir(), 'rich-build-gate-out-'));
  dirs.push(out);
  mkdirSync(join(out, 'assets'), { recursive: true });
  writeFileSync(join(out, 'index.html'), '<!doctype html><title>x</title>');
  const r = spawnSync(process.execPath, [join(APP, 'scripts/build-public.mjs'), '--no-vite', '--root', root, '--out', out], { cwd: APP, encoding: 'utf8', env: gitFreeEnv() });
  return { ...r, out };
}

describe('the build gate', () => {
  test('enforced: a file the face names that resolves nowhere fails the build', () => {
    const r = build(palace({ enforce: true, pieces: [{ file: 'p.html', origin: 'made' }, { file: 'gone.html', origin: 'made' }], files: { 'Demo/p.html': PIECE() } }));
    expect(r.status).not.toBe(0);
    expect(r.stderr).toMatch(/rich face: 1 error\(s\) from the piece checker, and the build is enforced: ref-missing Demo\.md/);
  }, 60_000);

  test('enforced: a file a piece declares that is missing fails the build', () => {
    const r = build(palace({ enforce: true, pieces: [{ file: 'p.html', origin: 'made' }], files: { 'Demo/p.html': PIECE('<meta name="piece:files" content="frames.json">') } }));
    expect(r.status).not.toBe(0);
    expect(r.stderr).toMatch(/file-missing Demo\/p\.html/);
  }, 60_000);

  test('enforced: an unpinned CDN fails the build', () => {
    const r = build(palace({ enforce: true, pieces: [{ file: 'p.html', origin: 'made' }], files: { 'Demo/p.html': PIECE('<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>') } }));
    expect(r.status).not.toBe(0);
    expect(r.stderr).toMatch(/cdn-unpinned Demo\/p\.html/);
  }, 60_000);

  test('report-only: the same faults print, and the build goes on', () => {
    const r = build(palace({ enforce: false, pieces: [{ file: 'p.html', origin: 'made' }, { file: 'gone.html', origin: 'made' }], files: { 'Demo/p.html': PIECE('<meta name="piece:files" content="frames.json">') } }));
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toMatch(/rich faces checked: 1 faces, 1 pieces, 2 error\(s\) \(report-only\)/);
    expect(existsSync(join(r.out, 'data/rich.json'))).toBe(true);
  }, 60_000);

  test('enforced and clean: the build passes, and a piece\'s declared file ships beside it', () => {
    const r = build(palace({ enforce: true, pieces: [{ file: 'p.html', origin: 'made' }], files: {
      'Demo/p.html': PIECE('<meta name="piece:files" content="frames.json">'),
      'Demo/frames.json': '[]',
    } }));
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toMatch(/rich faces checked: 1 faces, 1 pieces, 0 error\(s\)/);
    expect(existsSync(join(r.out, 'files/Demo/frames.json'))).toBe(true);
  }, 60_000);
});
