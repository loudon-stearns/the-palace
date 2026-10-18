import { describe, test, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import http from 'node:http';
import { resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import request from 'supertest';
import { listen, closeAll } from '../helpers/loopback.js';
import { blackboardMiddleware } from '../../server/middleware.js';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

function makeServer(palaceRoot) {
  const plugin = blackboardMiddleware(palaceRoot);
  const handlers = [];
  const fakeServer = { middlewares: { use: (fn) => handlers.push(fn) } };
  plugin.configureServer(fakeServer);
  return http.createServer((req, res) => {
    let i = 0;
    const next = () => {
      if (i >= handlers.length) { res.statusCode = 404; res.end('not found'); return; }
      handlers[i++](req, res, next);
    };
    next();
  });
}

// A real git repo with a few palace-shaped commits, so we exercise the
// actual git adapter (not a mock). Each commit uses the v1.0 commit spec
// or a pre-spec subject so we cover both parsing paths.
function gitInit(root) {
  const g = (...args) => execFileSync('git', args, { cwd: root, stdio: 'pipe', env: gitFreeEnv() });
  g('init', '-q');
  assertScratchRepo(root);
  g('config', 'user.email', 'test@palace');
  g('config', 'user.name', 'Test Palace');
  g('config', 'commit.gpgsign', 'false');

  // Commit 1: a deposit (spec-form subject + trailers).
  writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\ntype: concept\nstage: seed\npillars: [tools]\n---\n# Foo\nbody one\n');
  g('add', '-A');
  g('commit', '-q', '-m', 'deposit(Foo): name the foo concept\n\nPalace-Kind: deposit\nPalace-Entry: Foo\nPalace-Verify: verified\nPalace-Author: claude');

  // Commit 2: a pre-spec free-prose subject editing Foo (stage seed→sprout).
  writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\ntype: concept\nstage: sprout\npillars: [tools, philosophy]\n---\n# Foo\nbody one\nbody two\n');
  g('add', '-A');
  g('commit', '-q', '-m', 'Foo: grow it to a sprout and add a pillar');

  // Commit 3: an ops commit touching app machinery.
  mkdirSync(resolve(root, '_ops/stigmergy/app/src'), { recursive: true });
  writeFileSync(resolve(root, '_ops/stigmergy/app/src/thing.js'), 'export const x = 1;\n');
  g('add', '-A');
  g('commit', '-q', '-m', 'ops(stigmergy): add a thing\n\nPalace-Kind: ops\nPalace-Verify: verified');

  return root;
}

function makeTempPalace() {
  const root = mkdtempSync(resolve(tmpdir(), 'stigmergy-git-test-'));
  mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
  writeFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), '', 'utf8');
  gitInit(root);
  return root;
}

describe('GET /api/log', () => {
  let root, base;
  beforeAll(async () => { root = makeTempPalace(); base = await listen(makeServer(root)); });
  afterAll(async () => { await closeAll(); rmSync(root, { recursive: true, force: true }); });

  test('returns the commit stream newest-first, fully classified', async () => {
    const res = await request(base).get('/api/log');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
    const subjects = res.body.commits.map((c) => c.subject);
    expect(subjects[0]).toContain('ops(stigmergy)');
    expect(subjects[2]).toContain('deposit(Foo)');

    // Trailer-declared kind wins.
    const deposit = res.body.commits.find((c) => c.subject.includes('deposit(Foo)'));
    expect(deposit.kind).toBe('deposit');
    expect(deposit.kindSource).toBe('trailer');
    expect(deposit.entries).toContain('Foo');
    expect(deposit.verify).toBe('verified');

    // Pre-spec subject → inferred kind.
    const grow = res.body.commits.find((c) => c.subject.startsWith('Foo: grow'));
    expect(grow.kindSource).toBe('inferred');
    expect(grow.entries).toContain('Foo');

    // Each commit carries a diffstat.
    expect(deposit.fileCount).toBeGreaterThanOrEqual(1);
    expect(deposit.added).toBeGreaterThan(0);
  });

  test('?path filters to one entry history', async () => {
    const res = await request(base).get('/api/log').query({ path: 'Foo.md' });
    expect(res.status).toBe(200);
    // Two commits touched Foo.md (deposit + grow), not the ops commit.
    expect(res.body.count).toBe(2);
    for (const c of res.body.commits) {
      expect(c.subject).not.toContain('ops(stigmergy)');
    }
  });

  test('?limit caps the stream', async () => {
    const res = await request(base).get('/api/log').query({ limit: '1' });
    expect(res.body.count).toBe(1);
  });

  test('rejects an unsafe pathspec', async () => {
    const res = await request(base).get('/api/log').query({ path: '../../../etc/passwd' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/commit', () => {
  let root, base, headSha, depositSha;
  beforeAll(async () => {
    root = makeTempPalace();
    base = await listen(makeServer(root));
    headSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, env: gitFreeEnv() }).toString().trim();
    depositSha = execFileSync('git', ['rev-parse', 'HEAD~2'], { cwd: root, env: gitFreeEnv() }).toString().trim();
  });
  afterAll(async () => { await closeAll(); rmSync(root, { recursive: true, force: true }); });

  test('returns a palace-aware diff with frontmatter field changes', async () => {
    // HEAD~1 is the "grow it to a sprout" commit -- stage seed→sprout + pillar add.
    const growSha = execFileSync('git', ['rev-parse', 'HEAD~1'], { cwd: root, env: gitFreeEnv() }).toString().trim();
    const res = await request(base).get('/api/commit').query({ sha: growSha });
    expect(res.status).toBe(200);
    const fooDiff = res.body.fileDiffs.find((f) => f.path === 'Foo.md');
    expect(fooDiff.kind).toBe('md');
    const stageChange = fooDiff.frontmatterChanges.find((c) => c.field === 'stage');
    expect(stageChange.before).toBe('seed');
    expect(stageChange.after).toBe('sprout');
    expect(fooDiff.bodyChanged).toBe(true);
  });

  test('flags a newly-added entry', async () => {
    const res = await request(base).get('/api/commit').query({ sha: depositSha });
    expect(res.status).toBe(200);
    const fooDiff = res.body.fileDiffs.find((f) => f.path === 'Foo.md');
    expect(fooDiff.wasAdded).toBe(true);
  });

  test('404 on an invalid ref', async () => {
    const res = await request(base).get('/api/commit').query({ sha: 'not-a-sha!!' });
    expect(res.status).toBe(404);
  });

  test('400 on missing sha', async () => {
    const res = await request(base).get('/api/commit');
    expect(res.status).toBe(400);
  });
});

// A commit that only MOVES an entry. The diff view used to read the before
// side at `<sha>^:<new path>`, find nothing, and show the entry as ADDED with
// every frontmatter field new. Em-dash + spaced names, quotepath left at git's
// default and diff.renames off, so the pairing and the path match are the
// adapter's own doing rather than the developer's git config.
describe('GET /api/commit -- a moved entry', () => {
  const GOTCHAS = 'Foo — gotchas.md';
  let root, base;
  const g = (...args) => execFileSync('git', args, { cwd: root, stdio: 'pipe', env: gitFreeEnv() }).toString();
  beforeEach(async () => {
    root = makeTempPalace();
    base = await listen(makeServer(root));
    g('config', 'core.quotepath', 'true');
    g('config', 'diff.renames', 'false');
    mkdirSync(resolve(root, 'Foo'));
    writeFileSync(resolve(root, 'Foo', GOTCHAS), '---\ntitle: "Foo — gotchas"\nforward_vector: "I will warn."\n---\n# Gotchas\nmind the step\n');
    writeFileSync(resolve(root, 'Foo', 'hero.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47, 0, 1, 2, 3]));
    g('add', '-A');
    g('commit', '-q', '-m', 'edit(Foo): its bundle');
    mkdirSync(resolve(root, 'My Projects'));
    g('mv', 'Foo.md', 'My Projects/Foo.md');
    g('mv', 'Foo', 'My Projects/Foo');
  });
  afterEach(async () => { await closeAll(); rmSync(root, { recursive: true, force: true }); });
  const view = async () => (await request(base).get('/api/commit').query({ sha: g('rev-parse', 'HEAD').trim() })).body;

  test('a pure move is not ADDED: no field changes, and each file says where it came from', async () => {
    g('commit', '-q', '-m', 'edit(Foo): move into My Projects/');
    const { fileDiffs, fileCount } = await view();
    expect(fileCount).toBe(3); // three moved files, not three deleted + three added
    const foo = fileDiffs.find((f) => f.path === 'My Projects/Foo.md');
    expect(foo).toMatchObject({ kind: 'md', renamedFrom: 'Foo.md', wasAdded: false, wasRemoved: false, frontmatterChanges: [], bodyChanged: false });
    const gotchas = fileDiffs.find((f) => f.path === `My Projects/Foo/${GOTCHAS}`);
    expect(gotchas).toMatchObject({ kind: 'md', renamedFrom: `Foo/${GOTCHAS}`, wasAdded: false, frontmatterChanges: [], bodyChanged: false });
    const hero = fileDiffs.find((f) => f.path === 'My Projects/Foo/hero.png');
    expect(hero).toMatchObject({ kind: 'media', renamedFrom: 'Foo/hero.png', wasAdded: false });
  });

  test('a move with an edit shows only the edit', async () => {
    writeFileSync(resolve(root, 'My Projects', 'Foo.md'), '---\ntitle: Foo\ntype: concept\nstage: growing\npillars: [tools, philosophy]\n---\n# Foo\nbody one\nbody two\n');
    g('add', '-A');
    g('commit', '-q', '-m', 'edit(Foo): move and grow');
    const foo = (await view()).fileDiffs.find((f) => f.path === 'My Projects/Foo.md');
    expect(foo.renamedFrom).toBe('Foo.md');
    expect(foo.wasAdded).toBe(false);
    expect(foo.frontmatterChanges).toEqual([expect.objectContaining({ field: 'stage', kind: 'changed', before: 'sprout', after: 'growing' })]);
  });

  test('an entry that really is new still reads as ADDED, with no renamedFrom', async () => {
    writeFileSync(resolve(root, 'New Entry.md'), '---\ntitle: New Entry\nstage: seed\n---\n# New Entry\nbody\n');
    g('add', '-A');
    g('commit', '-q', '-m', 'edit(Foo): move, and file a new one');
    const fresh = (await view()).fileDiffs.find((f) => f.path === 'New Entry.md');
    expect(fresh).toMatchObject({ renamedFrom: null, wasAdded: true });
  });
});

describe('GET /api/uncommitted', () => {
  // Per-test pristine repo (beforeEach, not beforeAll) so the clean-tree test
  // and the dirty-tree test can never interact -- this was a flake source
  // under full-gate concurrency.
  let root, base;
  beforeEach(async () => { root = makeTempPalace(); base = await listen(makeServer(root)); });
  afterEach(async () => { await closeAll(); rmSync(root, { recursive: true, force: true }); });

  test('reports a clean tree as total 0', async () => {
    const res = await request(base).get('/api/uncommitted');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
  });

  test('surfaces an uncommitted edit (incl. an untracked spaced path)', async () => {
    writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\nstage: growing\n---\nedited\n');
    // Spaced path: exercises git's C-style quoting through the real adapter.
    // (The pure dequote is also unit-tested deterministically in
    // git-log-parse.test.js, so this is belt-and-suspenders.)
    writeFileSync(resolve(root, 'Brand New.md'), '---\ntitle: Brand New\n---\nx\n');
    const res = await request(base).get('/api/uncommitted');
    expect(res.body.total).toBeGreaterThanOrEqual(2);
    expect(res.body.unstaged.some((u) => u.path === 'Foo.md')).toBe(true);
    expect(res.body.untracked.some((u) => u.path === 'Brand New.md')).toBe(true);
  });

  test('a staged rename is one row carrying both of its paths', async () => {
    // It used to arrive as the single string `Foo.md -> "My Projects/Foo.md"`,
    // which is not a path anything can select.
    mkdirSync(resolve(root, 'My Projects'));
    execFileSync('git', ['mv', 'Foo.md', 'My Projects/Foo.md'], { cwd: root, stdio: 'pipe', env: gitFreeEnv() });
    const res = await request(base).get('/api/uncommitted');
    expect(res.body.staged).toEqual([{ path: 'My Projects/Foo.md', status: 'R', renamedFrom: 'Foo.md' }]);
    expect(res.body.total).toBe(1);
  });
});
