import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import http from 'node:http';
import { resolve, join } from 'node:path';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import request from 'supertest';
import { listen, closeAll } from '../helpers/loopback.js';
import { blackboardMiddleware } from '../../server/middleware.js';
import { movesIn, rowPaths } from '../../src/lib/uncommitted-selection.js';

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' });
}

// A throwaway git repo with one initial commit (so HEAD exists).
function makeRepo() {
  const root = mkdtempSync(resolve(tmpdir(), 'stig-commit-test-'));
  git(root, ['init', '-q', '-b', 'main']);
  git(root, ['config', 'user.email', 'test@example.com']);
  git(root, ['config', 'user.name', 'Test User']);
  git(root, ['config', 'commit.gpgsign', 'false']);
  writeFileSync(join(root, 'README.md'), '# test repo\n');
  git(root, ['add', 'README.md']);
  git(root, ['commit', '-q', '-m', 'chore: init']);
  return root;
}

function makeServer(palaceRoot) {
  const plugin = blackboardMiddleware(palaceRoot);
  const handlers = [];
  plugin.configureServer({ middlewares: { use: (fn) => handlers.push(fn) } });
  const server = http.createServer((req, res) => {
    let i = 0;
    const next = () => {
      if (i >= handlers.length) { res.statusCode = 404; res.end('nf'); return; }
      handlers[i++](req, res, next);
    };
    next();
  });
  return server;
}

describe('POST /api/commit/create', () => {
  let root, base;
  beforeEach(async () => {
    root = makeRepo();
    base = await listen(makeServer(root));
    // Two independent changes: a new untracked file + a modified tracked file.
    writeFileSync(join(root, 'data.txt'), 'hello\n');
    writeFileSync(join(root, 'README.md'), '# test repo\n\nedited\n');
  });
  afterEach(async () => { await closeAll(); rmSync(root, { recursive: true, force: true }); });

  test('commits ONLY the selected file, with derived palace trailers', async () => {
    const res = await request(base).post('/api/commit/create').send({
      paths: ['data.txt'], kind: 'ops', scope: 'io', summary: 'add a data file', verify: 'verified',
    });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(typeof res.body.shortHash).toBe('string');

    // the commit subject + trailers
    const msg = git(root, ['log', '-1', '--format=%B']);
    expect(msg).toMatch(/^ops\(io\): add a data file/);
    expect(msg).toMatch(/Palace-Kind: ops/);
    expect(msg).toMatch(/Palace-Verify: verified/);
    expect(msg).toMatch(/Palace-Author: loudon/);

    // data.txt is committed; README.md's edit is STILL uncommitted (not swept).
    const status = git(root, ['status', '--porcelain=v1']);
    expect(status).not.toMatch(/data\.txt/);
    expect(status).toMatch(/README\.md/);
  });

  test('400 on an unknown kind', async () => {
    const res = await request(base).post('/api/commit/create').send({ paths: ['data.txt'], kind: 'bogus', summary: 's', verify: 'verified' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/kind/i);
  });

  test('400 on a bad verify value', async () => {
    const res = await request(base).post('/api/commit/create').send({ paths: ['data.txt'], kind: 'ops', summary: 's', verify: 'maybe' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/verify/i);
  });

  test('400 when no files are selected', async () => {
    const res = await request(base).post('/api/commit/create').send({ paths: [], kind: 'ops', summary: 's', verify: 'verified' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/no files selected/i);
  });

  test('400 on an empty summary', async () => {
    const res = await request(base).post('/api/commit/create').send({ paths: ['data.txt'], kind: 'ops', summary: '   ', verify: 'verified' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/summary/i);
  });

  test('rejects an out-of-palace path (no traversal)', async () => {
    const res = await request(base).post('/api/commit/create').send({ paths: ['../escape.txt'], kind: 'ops', summary: 's', verify: 'verified' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/unsafe|out-of-palace/i);
  });
});

// A moved entry, the whole way through the deck's three calls: the banner's
// list (GET /api/uncommitted), the commit (POST /api/commit/create) with the
// paths the banner's one rename row stands for, and the diff view of the
// commit it made (GET /api/commit). The committer used to refuse the old side
// (`git add` failed), log the move as a birth, or commit half of it.
describe('POST /api/commit/create -- a renamed (moved) entry', () => {
  const ENTRY = '---\ntitle: Foo\ntype: concept\nstage: sprout\npillars: [tools]\nforward_vector: "I will sprout."\n---\n# Foo\nbody\n';
  const derived = (msg) => msg.split('\n').filter((l) => /^Palace-(Stage|Vector):/.test(l));
  let root, base;
  beforeEach(async () => {
    root = makeRepo();
    base = await listen(makeServer(root));
    writeFileSync(join(root, 'Foo.md'), ENTRY);
    git(root, ['add', 'Foo.md']);
    git(root, ['commit', '-q', '-m', 'deposit(Foo): file it']);
    mkdirSync(join(root, 'Projects'));
    git(root, ['mv', 'Foo.md', 'Projects/Foo.md']);
  });
  afterEach(async () => { await closeAll(); rmSync(root, { recursive: true, force: true }); });

  // What the banner sends when its one row for the move is clicked.
  async function moveRowPaths() {
    const delta = (await request(base).get('/api/uncommitted')).body;
    expect(delta.staged).toEqual([{ path: 'Projects/Foo.md', status: 'R', renamedFrom: 'Foo.md' }]);
    return rowPaths(delta.staged[0], movesIn(delta));
  }

  test('the rename is one row, and recording it commits the move whole with no stage or vector line', async () => {
    const paths = await moveRowPaths();
    expect(paths).toEqual(['Foo.md', 'Projects/Foo.md']);

    const res = await request(base).post('/api/commit/create').send({
      paths, kind: 'edit', scope: 'Foo', summary: 'move into Projects/', verify: 'verified',
    });
    expect(res.body.error).toBeUndefined();
    expect(res.status).toBe(200);
    expect(res.body.committed).toEqual(['Projects/Foo.md']);
    expect(res.body.notes).toBeUndefined();

    const msg = git(root, ['log', '-1', '--format=%B']);
    expect(msg).toMatch(/^edit\(Foo\): move into Projects\//);
    expect(msg).toMatch(/^Palace-Entry: Foo$/m);
    expect(derived(msg)).toEqual([]);
    expect(git(root, ['show', '-M', '--name-status', '--format=', 'HEAD']).trim()).toBe('R100\tFoo.md\tProjects/Foo.md');
    expect(git(root, ['status', '--porcelain=v1']).trim()).toBe('');

    // ...and the diff view reads that commit as a move, not as a new entry.
    const sha = git(root, ['rev-parse', 'HEAD']).trim();
    const view = await request(base).get('/api/commit').query({ sha });
    expect(view.body.fileDiffs).toHaveLength(1);
    expect(view.body.fileDiffs[0]).toMatchObject({
      path: 'Projects/Foo.md', renamedFrom: 'Foo.md', wasAdded: false, wasRemoved: false,
      frontmatterChanges: [], bodyChanged: false,
    });
  });

  test('a move edited after it was staged derives only the edit', async () => {
    // `RM Foo.md -> Projects/Foo.md`: the unstaged row is the same file, so it
    // stands for both sides of the move too.
    writeFileSync(join(root, 'Projects', 'Foo.md'), ENTRY.replace('stage: sprout', 'stage: growing'));
    const delta = (await request(base).get('/api/uncommitted')).body;
    expect(delta.unstaged).toEqual([{ path: 'Projects/Foo.md', status: 'M' }]);
    const paths = rowPaths(delta.unstaged[0], movesIn(delta));
    expect(paths).toEqual(['Foo.md', 'Projects/Foo.md']);

    const res = await request(base).post('/api/commit/create').send({
      paths, kind: 'edit', scope: 'Foo', summary: 'move and grow', verify: 'verified',
    });
    expect(res.status).toBe(200);
    expect(derived(git(root, ['log', '-1', '--format=%B']))).toEqual(['Palace-Stage: Foo: sprout->growing']);
    expect(git(root, ['status', '--porcelain=v1']).trim()).toBe('');
  });

  test('the new side alone still commits, as half a move, and the response says so', async () => {
    const res = await request(base).post('/api/commit/create').send({
      paths: ['Projects/Foo.md'], kind: 'edit', scope: 'Foo', summary: 'half', verify: 'verified',
    });
    expect(res.status).toBe(200);
    expect(res.body.notes).toHaveLength(1);
    expect(res.body.notes[0]).toMatch(/"Foo\.md" was not selected/);
    expect(git(root, ['status', '--porcelain=v1']).trim()).toBe('D  Foo.md');
  });
});
