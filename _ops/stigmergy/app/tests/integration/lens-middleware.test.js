import { describe, test, expect, afterEach } from 'vitest';
import http from 'node:http';
import { resolve } from 'node:path';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import request from 'supertest';
import { listen, closeAll } from '../helpers/loopback.js';
import { blackboardMiddleware } from '../../server/middleware.js';

// GET /api/lens/suggest — ranks candidate glass pages for a lensing subject
// by link-distance over the live typed-link graph (read from the entries'
// own frontmatter), per [[The Lens]]'s "lean on the graph to suggest" design.

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

const entry = (links = []) => [
  '---', 'type: concept', 'links:',
  ...links.map((t) => `  - { target: "[[${t}]]", type: connects-to }`),
  '---', '', 'body', '',
].join('\n');

function makeTempPalace({ withEntries = true } = {}) {
  const root = mkdtempSync(resolve(tmpdir(), 'stigmergy-lens-test-'));
  mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
  writeFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), '', 'utf8');
  if (withEntries) {
    writeFileSync(resolve(root, 'Subject.md'), entry(['Neighbor']));
    writeFileSync(resolve(root, 'Neighbor.md'), entry(['TwoHop']));
    writeFileSync(resolve(root, 'TwoHop.md'), entry());
    writeFileSync(resolve(root, 'Islanded.md'), entry());
  }
  return root;
}

afterEach(closeAll);

describe('GET /api/lens/suggest', () => {
  let root, server;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

  test('ranks candidates by link-distance from the subject', async () => {
    root = makeTempPalace();
    server = makeServer(root);
    const base = await listen(server);
    const res = await request(base).get('/api/lens/suggest?subject=Subject');
    expect(res.status).toBe(200);
    expect(res.body.subject).toBe('Subject');
    expect(res.body.candidates.map((c) => c.title)).toEqual(['Neighbor', 'TwoHop', 'Islanded']);
    expect(res.body.candidates[0].distance).toBe(1);
  });

  test('respects a ?limit=', async () => {
    root = makeTempPalace();
    server = makeServer(root);
    const base = await listen(server);
    const res = await request(base).get('/api/lens/suggest?subject=Subject&limit=1');
    expect(res.status).toBe(200);
    expect(res.body.candidates).toHaveLength(1);
  });

  test('400s with no ?subject', async () => {
    root = makeTempPalace();
    server = makeServer(root);
    const base = await listen(server);
    const res = await request(base).get('/api/lens/suggest');
    expect(res.status).toBe(400);
  });

  test('an empty palace has no candidates, and says so plainly', async () => {
    root = makeTempPalace({ withEntries: false });
    server = makeServer(root);
    const base = await listen(server);
    const res = await request(base).get('/api/lens/suggest?subject=Subject');
    expect(res.status).toBe(200);
    expect(res.body.candidates).toEqual([]);
  });

  test('never offers a page that has been removed from disk', async () => {
    root = makeTempPalace();
    server = makeServer(root);
    const base = await listen(server);
    rmSync(resolve(root, 'Neighbor.md'));
    const res = await request(base).get('/api/lens/suggest?subject=Subject');
    expect(res.status).toBe(200);
    expect(res.body.candidates.map((c) => c.title)).toEqual(['Islanded', 'TwoHop']);
    expect(res.body.map_source).toBe('live');
  });
});
