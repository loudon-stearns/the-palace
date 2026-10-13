// The door through Vite itself. request-guard.test.js drives the middleware alone; this file
// starts a real Vite dev server from the app's own vite.config.js, because half of the old hole
// was Vite's: its default CORS answers a preflight from any localhost port (`defaultAllowedOrigins`
// in vite/dist/node/constants.js), and a page on :5174 then sent the write itself.
//
// The server runs in middleware mode over a scratch palace (PALACE_ROOT), with its cache in that
// scratch folder, no WebSocket, no watcher and no dependency scan, so nothing is written under the
// app or the owner's node_modules. The config is imported natively, not bundled to a temp file.
// It listens on 127.0.0.1 through tests/helpers/loopback.js — never the live :5173.

import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import request from 'supertest';
import { createServer } from 'vite';
import { listen, closeAll } from '../helpers/loopback.js';

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const BOARD = '_ops/swarm/persistent/blackboard.jsonl';

let root;
let vite;
let base;
let savedPalaceRoot;

const boardLines = () => readFileSync(resolve(root, BOARD), 'utf8').split('\n').filter(Boolean).length;

function makeMessage() {
  return {
    schema_version: '1.0',
    id: 'guard-vite-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    ts: new Date().toISOString(),
    session_id: 'guard-test',
    from: 'TRICKSTER',
    to: '*',
    type: 'BROADCAST',
    board: 'GENERAL',
    health: { context_pct: 0.1, stop_reason: 'end_turn', iteration: 1, tokens_this_call: 100, model: 'claude-sonnet-4-6', score: 'green' },
    payload: { content: 'guard test through vite' },
  };
}

beforeAll(async () => {
  root = mkdtempSync(resolve(tmpdir(), 'stigmergy-guard-vite-'));
  mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
  mkdirSync(resolve(root, '_ops/swarm/sessions'), { recursive: true });
  writeFileSync(resolve(root, BOARD), '', 'utf8');
  writeFileSync(resolve(root, 'plain.txt'), 'a file Vite serves itself', 'utf8');

  savedPalaceRoot = process.env.PALACE_ROOT;
  process.env.PALACE_ROOT = root; // vite.config.js roots the board here
  vite = await createServer({
    configFile: resolve(APP, 'vite.config.js'),
    configLoader: 'native',
    root,
    cacheDir: resolve(root, '.vite'),
    logLevel: 'silent',
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, ws: false, watch: null },
  });
  base = await listen(http.createServer(vite.middlewares));
}, 30_000);

afterAll(async () => {
  await closeAll();
  await vite?.close();
  if (savedPalaceRoot === undefined) delete process.env.PALACE_ROOT;
  else process.env.PALACE_ROOT = savedPalaceRoot;
  rmSync(root, { recursive: true, force: true });
});

describe('the app config, through Vite', () => {
  test('Vite’s own CORS is off', () => {
    expect(vite.config.server.cors).toBe(false);
  });

  test('a preflight from another localhost port is refused with no CORS headers', async () => {
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

  test('the write that preflight would have cleared is refused, and nothing is written', async () => {
    const before = boardLines();
    const res = await request(base)
      .post('/api/persistent')
      .set('Host', 'localhost:5173')
      .set('Origin', 'http://localhost:5174')
      .set('Sec-Fetch-Site', 'same-site')
      .send(makeMessage());
    expect(res.status).toBe(403);
    expect(boardLines()).toBe(before);
  });

  test('a file Vite serves carries no CORS header for another port', async () => {
    const res = await request(base).get('/plain.txt').set('Host', 'localhost:5173').set('Origin', 'http://localhost:5174');
    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  test('the app’s own page still writes', async () => {
    const before = boardLines();
    const res = await request(base)
      .post('/api/persistent')
      .set('Host', 'localhost:5173')
      .set('Origin', 'http://localhost:5173')
      .set('Sec-Fetch-Site', 'same-origin')
      .send(makeMessage());
    expect(res.status).toBe(200);
    expect(boardLines()).toBe(before + 1);
  });
});
