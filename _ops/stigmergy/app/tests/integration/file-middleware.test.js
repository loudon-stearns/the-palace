import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, readFileSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import request from 'supertest';
import { listen, closeAll } from '../helpers/loopback.js';
import { blackboardMiddleware, resolveInsidePalace } from '../../server/middleware.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Harness (mirrors post-middleware.test.js) ───────────────────────────────

function makeServer(palaceRoot) {
  const plugin = blackboardMiddleware(palaceRoot);
  const handlers = [];
  const fakeServer = { middlewares: { use: (fn) => handlers.push(fn) } };
  plugin.configureServer(fakeServer);
  return http.createServer((req, res) => {
    let i = 0;
    const next = () => {
      if (i >= handlers.length) {
        res.statusCode = 404;
        res.end('not found');
        return;
      }
      handlers[i++](req, res, next);
    };
    next();
  });
}

// A temp palace root with the blackboard structure plus a few artifact
// fixtures. Bytes need not be valid media — the endpoint serves bytes and
// sets content-type by extension; the test asserts both round-trip.
const PNG_BYTES = '\x89PNG\r\n\x1a\nFAKE-PNG-PAYLOAD';
const WAV_BYTES = 'RIFFFAKE-WAV-PAYLOAD';
const HTML_BYTES = '<!doctype html><title>art</title><script>console.log("hi")</script>';

function makeTempPalace() {
  const root = mkdtempSync(resolve(tmpdir(), 'stigmergy-file-test-'));
  mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
  mkdirSync(resolve(root, '_ops/swarm/sessions'), { recursive: true });
  writeFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), '', 'utf8');
  // Artifact fixtures, in a path containing a space like the real palace.
  mkdirSync(resolve(root, 'Demo Entry'), { recursive: true });
  writeFileSync(resolve(root, 'Demo Entry/still.png'), PNG_BYTES, 'binary');
  writeFileSync(resolve(root, 'Demo Entry/bed.wav'), WAV_BYTES, 'binary');
  writeFileSync(resolve(root, 'Demo Entry/sim.html'), HTML_BYTES, 'utf8');
  writeFileSync(resolve(root, 'Demo Entry/notes.md'), '# notes', 'utf8');
  return root;
}

describe('GET /api/file', () => {
  let root;
  let base;

  beforeAll(async () => {
    root = makeTempPalace();
    base = await listen(makeServer(root));
  });

  afterAll(async () => {
    await closeAll();
    rmSync(root, { recursive: true, force: true });
  });

  test('serves a png with image/png and no-cache, bytes intact', async () => {
    const res = await request(base)
      .get('/api/file')
      .query({ path: 'Demo Entry/still.png' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('image/png');
    expect(res.headers['cache-control']).toBe('no-cache');
    expect(Buffer.from(res.body).toString('binary')).toBe(PNG_BYTES);
  });

  test('serves a wav with audio/wav', async () => {
    const res = await request(base)
      .get('/api/file')
      .query({ path: 'Demo Entry/bed.wav' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('audio/wav');
  });

  test('serves html with text/html charset', async () => {
    const res = await request(base)
      .get('/api/file')
      .query({ path: 'Demo Entry/sim.html' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/html; charset=utf-8');
    expect(res.text).toContain('<script>');
  });

  test('serves an unknown extension as octet-stream', async () => {
    const res = await request(base)
      .get('/api/file')
      .query({ path: 'Demo Entry/notes.md' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toBe('text/markdown; charset=utf-8');
  });

  test('400 on missing path param', async () => {
    const res = await request(base).get('/api/file');
    expect(res.status).toBe(400);
  });

  test('400 on path traversal escaping the root', async () => {
    const res = await request(base)
      .get('/api/file')
      .query({ path: '../../../etc/passwd' });
    expect(res.status).toBe(400);
  });

  test('400 on absolute path', async () => {
    const res = await request(base)
      .get('/api/file')
      .query({ path: '/etc/passwd' });
    expect(res.status).toBe(400);
  });

  test('404 on a path inside the palace that does not exist', async () => {
    const res = await request(base)
      .get('/api/file')
      .query({ path: 'Demo Entry/missing.png' });
    expect(res.status).toBe(404);
  });

  test('400 when the path is a directory', async () => {
    const res = await request(base)
      .get('/api/file')
      .query({ path: 'Demo Entry' });
    expect(res.status).toBe(400);
  });
});

// A symlink inside the palace can point anywhere. The path's words stay inside,
// so only where it really lands can tell. resolveInsidePalace also guards
// GET /api/open, which runs `open` on what it returns — tested at the function,
// so no test here ever opens a file.
describe('symlinks that leave the palace', () => {
  let root, outside, base;

  beforeAll(async () => {
    root = makeTempPalace();
    outside = mkdtempSync(resolve(tmpdir(), 'stigmergy-file-outside-'));
    writeFileSync(resolve(outside, 'secret.txt'), 'outside the palace', 'utf8');
    mkdirSync(resolve(root, 'Links'), { recursive: true });
    symlinkSync(resolve(outside, 'secret.txt'), resolve(root, 'Links/escape.txt'));
    symlinkSync(outside, resolve(root, 'Links/out'));
    symlinkSync('../Demo Entry/still.png', resolve(root, 'Links/alias.png'));
    symlinkSync(resolve(outside, 'gone.txt'), resolve(root, 'Links/dangling.txt'));
    base = await listen(makeServer(root));
  });

  afterAll(async () => {
    await closeAll();
    rmSync(root, { recursive: true, force: true });
    rmSync(outside, { recursive: true, force: true });
  });

  test('the links really reach the file outside', () => {
    expect(readFileSync(resolve(root, 'Links/escape.txt'), 'utf8')).toBe('outside the palace');
    expect(readFileSync(resolve(root, 'Links/out/secret.txt'), 'utf8')).toBe('outside the palace');
  });

  test('resolveInsidePalace refuses a linked file or folder that lands outside', () => {
    expect(resolveInsidePalace(root, 'Links/escape.txt')).toBeNull();
    expect(resolveInsidePalace(root, 'Links/out/secret.txt')).toBeNull();
    expect(resolveInsidePalace(root, 'Links/out')).toBeNull();
  });

  test('resolveInsidePalace keeps a link that lands inside, and a path not there yet', () => {
    expect(resolveInsidePalace(root, 'Links/alias.png')).toBe(resolve(root, 'Links/alias.png'));
    expect(resolveInsidePalace(root, 'Demo Entry/missing.png')).toBe(resolve(root, 'Demo Entry/missing.png'));
  });

  test('GET /api/file refuses a linked file that lands outside', async () => {
    const res = await request(base).get('/api/file').query({ path: 'Links/escape.txt' });
    expect(res.status).toBe(400);
    expect(res.text).not.toContain('outside the palace');
  });

  test('GET /api/file refuses a file under a linked folder that lands outside', async () => {
    const res = await request(base).get('/api/file').query({ path: 'Links/out/secret.txt' });
    expect(res.status).toBe(400);
  });

  test('GET /api/file still serves a link that lands inside', async () => {
    const res = await request(base).get('/api/file').query({ path: 'Links/alias.png' });
    expect(res.status).toBe(200);
    expect(Buffer.from(res.body).toString('binary')).toBe(PNG_BYTES);
  });

  test('a link to nothing, or a path through a file, is still a 404', async () => {
    expect((await request(base).get('/api/file').query({ path: 'Links/dangling.txt' })).status).toBe(404);
    expect((await request(base).get('/api/file').query({ path: 'Demo Entry/still.png/x' })).status).toBe(404);
  });
});
