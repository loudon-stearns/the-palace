// The doors in front of the palace routes (server/request-guard.js): a foreign
// Host is refused, and a write must be JSON from one of STIGMERGY's own pages —
// its exact origin, not merely another page on this Mac. Every request here goes
// to a scratch palace on an in-process server — never the live :5173, and never
// to a path that exists under /api/open. The live server's name is set as Host
// (localhost:5173) so an Origin can match it or miss it by port alone.

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { resolve } from 'node:path';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import request from 'supertest';
import { listen, closeAll } from '../helpers/loopback.js';
import { blackboardMiddleware } from '../../server/middleware.js';
import { isHostAllowed, hostnameOf } from '../../server/request-guard.js';

function makeServer(palaceRoot, allowedHosts) {
  const plugin = blackboardMiddleware(palaceRoot);
  const handlers = [];
  const fakeServer = {
    config: { server: { allowedHosts } },
    middlewares: { use: (fn) => handlers.push(fn) },
  };
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

function makeMessage() {
  return {
    schema_version: '1.0',
    id: 'guard-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    ts: new Date().toISOString(),
    session_id: 'guard-test',
    from: 'TRICKSTER',
    to: '*',
    type: 'BROADCAST',
    board: 'GENERAL',
    health: {
      context_pct: 0.1,
      stop_reason: 'end_turn',
      iteration: 1,
      tokens_this_call: 100,
      model: 'claude-sonnet-4-6',
      score: 'green',
    },
    payload: { content: 'guard test' },
  };
}

const BOARD = '_ops/swarm/persistent/blackboard.jsonl';
const boardLines = (root) => readFileSync(resolve(root, BOARD), 'utf8').split('\n').filter(Boolean).length;

let root;
let base;

beforeAll(async () => {
  root = mkdtempSync(resolve(tmpdir(), 'stigmergy-guard-'));
  mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
  mkdirSync(resolve(root, '_ops/swarm/sessions'), { recursive: true });
  writeFileSync(resolve(root, BOARD), '', 'utf8');
  base = await listen(makeServer(root, ['.palace.test']));
});

afterAll(async () => {
  await closeAll();
  rmSync(root, { recursive: true, force: true });
});

describe('a write to the board from a foreign page is refused', () => {
  test('a text/plain body — the no-preflight form — is refused and nothing is written', async () => {
    const before = boardLines(root);
    const res = await request(base)
      .post('/api/persistent')
      .set('Content-Type', 'text/plain')
      .send(JSON.stringify(makeMessage()));
    expect(res.status).toBe(415);
    expect(boardLines(root)).toBe(before);
  });

  test('a write with no content type is refused', async () => {
    const res = await request(base)
      .post('/api/persistent')
      .set('Content-Type', '')
      .send(Buffer.from(JSON.stringify(makeMessage())));
    expect(res.status).toBe(415);
  });

  test('JSON from a foreign Origin is refused', async () => {
    const before = boardLines(root);
    const res = await request(base)
      .post('/api/persistent')
      .set('Origin', 'https://evil.example')
      .send(makeMessage());
    expect(res.status).toBe(403);
    expect(boardLines(root)).toBe(before);
  });

  test('a sandboxed page (Origin: null) is refused', async () => {
    const res = await request(base).post('/api/persistent').set('Origin', 'null').send(makeMessage());
    expect(res.status).toBe(403);
  });

  test('a browser that names the request cross-site is refused, Origin or not', async () => {
    const res = await request(base).post('/api/persistent').set('Sec-Fetch-Site', 'cross-site').send(makeMessage());
    expect(res.status).toBe(403);
  });

  test('every write route is behind the same door, not only the board', async () => {
    for (const path of ['/api/entry/save', '/api/commit/create', '/api/launch', '/api/steward/advance', '/rich/_api/review']) {
      const res = await request(base).post(path).set('Origin', 'https://evil.example').send({});
      expect(res.status, path).toBe(403);
    }
  });
});

// Another port on this Mac is another origin. A page a dev server or a proof
// serves on :5174 or :8842 is loopback too, and must not write to the board.
describe('a page on another local port is refused', () => {
  test('JSON from localhost:5174 to localhost:5173 is refused and nothing is written', async () => {
    const before = boardLines(root);
    const res = await request(base)
      .post('/api/persistent')
      .set('Host', 'localhost:5173')
      .set('Origin', 'http://localhost:5174')
      .send(makeMessage());
    expect(res.status).toBe(403);
    expect(boardLines(root)).toBe(before);
  });

  test('the same, marked Sec-Fetch-Site: same-site as a browser marks it, is refused', async () => {
    const before = boardLines(root);
    const res = await request(base)
      .post('/api/persistent')
      .set('Host', 'localhost:5173')
      .set('Origin', 'http://localhost:5174')
      .set('Sec-Fetch-Site', 'same-site')
      .send(makeMessage());
    expect(res.status).toBe(403);
    expect(boardLines(root)).toBe(before);
  });

  test('no other loopback origin passes either: another address, another port, the rich preview', async () => {
    for (const [host, origin] of [
      ['localhost:5173', 'http://127.0.0.1:8842'],
      ['localhost:5173', 'http://[::1]:5174'],
      ['localhost:5173', 'http://app.localhost:5173'],
      ['127.0.0.1:5173', 'http://localhost:5173'],
      ['localhost:5173', 'https://localhost:5173'],
    ]) {
      const res = await request(base).post('/api/persistent').set('Host', host).set('Origin', origin).send(makeMessage());
      expect(res.status, `${origin} → ${host}`).toBe(403);
    }
  });

  test('Sec-Fetch-Site: same-site is refused even with no Origin', async () => {
    const res = await request(base).post('/api/persistent').set('Sec-Fetch-Site', 'same-site').send(makeMessage());
    expect(res.status).toBe(403);
  });

  test('a preflight from another port is refused, with no CORS headers', async () => {
    const res = await request(base)
      .options('/api/persistent')
      .set('Host', 'localhost:5173')
      .set('Origin', 'http://localhost:5174')
      .set('Sec-Fetch-Site', 'same-site')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type');
    expect(res.status).toBe(403);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
    expect(res.headers['access-control-allow-methods']).toBeUndefined();
  });

  test('GET /api/open from another port is refused before the handler runs', async () => {
    const res = await request(base)
      .get('/api/open?path=no/such/file.command')
      .set('Host', 'localhost:5173')
      .set('Origin', 'http://localhost:5174')
      .set('Sec-Fetch-Site', 'same-site');
    expect(res.status).toBe(403);
    // A link or an <img> on that page sends no Origin, only Sec-Fetch-Site.
    const bare = await request(base).get('/api/open?path=no/such/file.command').set('Sec-Fetch-Site', 'same-site');
    expect(bare.status).toBe(403);
  });

  test('a GET from another port still reads: reads stay open', async () => {
    const res = await request(base)
      .get('/api/persistent')
      .set('Host', 'localhost:5173')
      .set('Origin', 'http://localhost:5174')
      .set('Sec-Fetch-Site', 'same-site');
    expect(res.status).toBe(200);
  });
});

describe('the app and its own tools still write', () => {
  test('JSON from STIGMERGY’s own page (Origin equals Host) is appended', async () => {
    const before = boardLines(root);
    const res = await request(base)
      .post('/api/persistent')
      .set('Host', 'localhost:5173')
      .set('Origin', 'http://localhost:5173')
      .set('Sec-Fetch-Site', 'same-origin')
      .send(makeMessage());
    expect(res.status).toBe(200);
    expect(boardLines(root)).toBe(before + 1);
  });

  test('the own-origin match ignores case, and holds for an IPv6 or allowedHosts name', async () => {
    for (const [host, origin] of [
      ['LocalHost:5173', 'http://localhost:5173'],
      ['[::1]:5173', 'http://[::1]:5173'],
      ['studio.palace.test:5173', 'http://studio.palace.test:5173'],
    ]) {
      const res = await request(base).post('/api/persistent').set('Host', host).set('Origin', origin).set('Sec-Fetch-Site', 'same-origin').send(makeMessage());
      expect(res.status, `${origin} → ${host}`).toBe(200);
    }
  });

  test('JSON with no Origin (curl, node fetch, the eval server) is appended', async () => {
    const before = boardLines(root);
    const res = await request(base).post('/api/persistent').send(makeMessage());
    expect(res.status).toBe(200);
    expect(boardLines(root)).toBe(before + 1);
  });
});

describe('GET /api/open refuses a foreign page', () => {
  // The path does not exist, so the old code answers 404 without opening anything.
  test('cross-site: refused before the handler runs', async () => {
    const res = await request(base).get('/api/open?path=no/such/file.command').set('Sec-Fetch-Site', 'cross-site');
    expect(res.status).toBe(403);
  });

  test('same-origin: reaches the handler', async () => {
    const res = await request(base).get('/api/open?path=no/such/file.command').set('Sec-Fetch-Site', 'same-origin');
    expect(res.status).toBe(404);
  });

  // A navigation Loudon starts himself — a typed URL, a bookmark — is marked `none`, with no Origin.
  test('a typed URL or a bookmark (Sec-Fetch-Site: none, no Origin) reaches the handler', async () => {
    const res = await request(base).get('/api/open?path=no/such/file.command').set('Host', 'localhost:5173').set('Sec-Fetch-Site', 'none');
    expect(res.status).toBe(404);
  });

  test('`none` does not excuse an Origin from another port: the exact-origin match still refuses', async () => {
    const before = boardLines(root);
    const res = await request(base)
      .post('/api/persistent')
      .set('Host', 'localhost:5173')
      .set('Origin', 'http://localhost:5174')
      .set('Sec-Fetch-Site', 'none')
      .send(makeMessage());
    expect(res.status).toBe(403);
    expect(boardLines(root)).toBe(before);
  });

  test('other reads stay open cross-site (sandboxed artifacts load media this way)', async () => {
    const res = await request(base).get('/api/persistent').set('Sec-Fetch-Site', 'cross-site');
    expect(res.status).toBe(200);
  });
});

describe('the host check runs before the palace routes', () => {
  test('a rebinding name is refused on /api and /rich', async () => {
    for (const path of ['/api/persistent', '/rich/_api/resolve?entry=STIGMERGY']) {
      const res = await request(base).get(path).set('Host', 'evil.example');
      expect(res.status, path).toBe(403);
    }
  });

  test('a rebinding name cannot write', async () => {
    const res = await request(base).post('/api/persistent').set('Host', 'evil.example:5173').send(makeMessage());
    expect(res.status).toBe(403);
  });

  test('localhost, loopback addresses and allowedHosts are answered', async () => {
    for (const host of ['localhost:5173', '127.0.0.1:5173', '[::1]:5173', 'app.localhost', 'studio.palace.test']) {
      const res = await request(base).get('/api/persistent').set('Host', host);
      expect(res.status, host).toBe(200);
    }
  });
});

describe('isHostAllowed', () => {
  test('mirrors Vite: IPs, localhost, allowedHosts entries and leading-dot suffixes', () => {
    expect(isHostAllowed('10.0.0.5:5173', [])).toBe(true);
    expect(isHostAllowed('localhost', [])).toBe(true);
    expect(isHostAllowed('evil.example', [])).toBe(false);
    expect(isHostAllowed('evil.example', true)).toBe(true);
    expect(isHostAllowed('palace.test', ['.palace.test'])).toBe(true);
    expect(isHostAllowed('a.palace.test', ['.palace.test'])).toBe(true);
    expect(isHostAllowed('notpalace.test', ['.palace.test'])).toBe(false);
    expect(isHostAllowed('box.lan', ['box.lan'])).toBe(true);
    expect(isHostAllowed(undefined, [])).toBe(true);
  });

  test('hostnameOf strips ports and IPv6 brackets', () => {
    expect(hostnameOf('[::1]:5173')).toBe('::1');
    expect(hostnameOf('LocalHost:5173')).toBe('localhost');
    expect(hostnameOf('127.0.0.1')).toBe('127.0.0.1');
  });
});
