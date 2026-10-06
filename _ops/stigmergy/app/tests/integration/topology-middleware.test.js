import { describe, test, expect, afterEach } from 'vitest';
import http from 'node:http';
import { resolve } from 'node:path';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import request from 'supertest';
import { blackboardMiddleware } from '../../server/middleware.js';

// GET /api/topology — the typed-link graph, read from the files as they are
// at the moment of the request. No Map Build snapshot stands between a page
// and the lens: the report that prompted this was a composted page that kept
// its node for ten days because the newest snapshot predated the compost.

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

const entry = (type, links = []) => [
  '---', `type: ${type}`, 'links:',
  ...links.map((t) => `  - { target: "[[${t}]]", type: mirrors }`),
  '---', '', 'body', '',
].join('\n');

function makeTempPalace() {
  const root = mkdtempSync(resolve(tmpdir(), 'stigmergy-topology-test-'));
  mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
  writeFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), '', 'utf8');
  writeFileSync(resolve(root, 'Alive.md'), entry('concept', ['Doomed']));
  writeFileSync(resolve(root, 'Doomed.md'), entry('meta'));
  // A stale snapshot that still draws Doomed and knows nothing newer. The
  // endpoint must not read it.
  mkdirSync(resolve(root, '_ops/maps'), { recursive: true });
  writeFileSync(resolve(root, '_ops/maps/palace-map-full-2026-09-26.json'), JSON.stringify({
    meta: { generated: '2026-09-26', node_count: 1, edge_count: 0 },
    nodes: [{ id: 'Only In The Snapshot', path: 'Only In The Snapshot.md', type: 'concept' }],
    edges: [],
  }));
  return root;
}

describe('GET /api/topology', () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

  test('draws the graph from the files, not from the snapshot on disk', async () => {
    root = makeTempPalace();
    const res = await request(makeServer(root)).get('/api/topology');
    expect(res.status).toBe(200);
    expect(res.body.source).toBe('live');
    expect(res.body.nodes.map((n) => n.id)).toEqual(['Alive', 'Doomed']);
    expect(res.body.edges).toEqual([{ source: 'Alive', type: 'mirrors', target: 'Doomed', label: null }]);
    expect(res.body.meta).toMatchObject({ node_count: 2, edge_count: 1 });
  });

  test('a composted page is gone on the very next request', async () => {
    root = makeTempPalace();
    const server = makeServer(root);
    rmSync(resolve(root, 'Doomed.md'));
    const res = await request(server).get('/api/topology');
    expect(res.body.nodes.map((n) => n.path)).toEqual(['Alive.md']);
  });

  test('a page born a moment ago is already a node', async () => {
    root = makeTempPalace();
    const server = makeServer(root);
    mkdirSync(resolve(root, 'Projects'), { recursive: true });
    writeFileSync(resolve(root, 'Projects/Newborn.md'), entry('project', ['Alive']));
    const res = await request(server).get('/api/topology');
    const born = res.body.nodes.find((n) => n.id === 'Newborn');
    expect(born).toMatchObject({ path: 'Projects/Newborn.md', type: 'project', outbound_count: 1 });
    expect(res.body.nodes.find((n) => n.id === 'Alive').inbound_count).toBe(1);
  });

  test('an empty palace is an empty graph, not an error', async () => {
    root = mkdtempSync(resolve(tmpdir(), 'stigmergy-topology-empty-'));
    mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
    writeFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), '', 'utf8');
    const res = await request(makeServer(root)).get('/api/topology');
    expect(res.status).toBe(200);
    expect(res.body.nodes).toEqual([]);
    expect(res.body.edges).toEqual([]);
  });
});
