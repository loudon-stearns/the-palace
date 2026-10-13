import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import http from 'node:http';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import request from 'supertest';
import { listen, closeAll } from '../helpers/loopback.js';
import { createRichServer } from '../../../../rich-face/rich-server.mjs';

// The standalone rich face (rich-server.mjs) over a temp palace, forwarding
// reviews to a decoy that stands in for STIGMERGY's board. It answers at /, so
// every path it serves is a palace route, and STIGMERGY's request guard stands
// in front of all of them: a review it forwards lands on the board as
// TRICKSTER, Loudon's own voice.

const RICH_SRC = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../rich-face');
const SECRET = 'not for the web';

describe('the standalone rich face', () => {
  let root, base, decoyUrl;
  const seen = [];

  beforeAll(async () => {
    root = mkdtempSync(resolve(tmpdir(), 'rich-server-test-'));
    writeFileSync(resolve(root, 'Private Note.md'), `# Private Note\n\n${SECRET}\n`, 'utf8');
    const decoy = http.createServer((req, res) => {
      let body = '';
      req.on('data', (c) => { body += c; });
      req.on('end', () => { seen.push(JSON.parse(body)); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{}'); });
    });
    decoyUrl = await listen(decoy);
    base = await listen(createRichServer({ root, here: RICH_SRC, app: decoyUrl }));
  });
  afterAll(async () => {
    await closeAll();
    rmSync(root, { recursive: true, force: true });
  });
  beforeEach(() => { seen.length = 0; });

  // What a foreign web page can send without a preflight.
  test('refuses a cross-site text/plain review, and nothing reaches the board', async () => {
    const r = await request(base).post('/_api/review')
      .set('Content-Type', 'text/plain').set('Origin', 'https://evil.example').set('Sec-Fetch-Site', 'cross-site')
      .send(JSON.stringify({ task: 'from-a-foreign-page', overall: { note: 'not Loudon' } }));
    expect(r.status).toBe(403);
    expect(seen).toEqual([]);
  });

  test('refuses a JSON review from a foreign page', async () => {
    const r = await request(base).post('/_api/review')
      .set('Content-Type', 'application/json').set('Origin', 'https://evil.example')
      .send({ task: 'from-a-foreign-page' });
    expect(r.status).toBe(403);
    expect(seen).toEqual([]);
  });

  // Another port on this Mac is another origin: a page on localhost:5174 is not this face.
  test('refuses a JSON review from a page on another local port', async () => {
    const r = await request(base).post('/_api/review')
      .set('Host', 'localhost:8842').set('Origin', 'http://localhost:5174').set('Sec-Fetch-Site', 'same-site')
      .send({ task: 'from-another-port' });
    expect(r.status).toBe(403);
    expect(seen).toEqual([]);
  });

  test('refuses a review that is not sent as JSON', async () => {
    const r = await request(base).post('/_api/review').set('Content-Type', 'text/plain').send('{"task":"x"}');
    expect(r.status).toBe(415);
    expect(seen).toEqual([]);
  });

  // What a DNS-rebinding page sends: this server's address, its own name.
  test('refuses to serve a palace file under a foreign Host', async () => {
    const r = await request(base).get('/Private%20Note.md').set('Host', 'rebind.evil.example');
    expect(r.status).toBe(403);
    expect(r.text).not.toContain(SECRET);
  });

  test('still serves that file under localhost', async () => {
    const r = await request(base).get('/Private%20Note.md').set('Host', 'localhost:8842');
    expect(r.status).toBe(200);
    expect(r.text).toContain(SECRET);
  });

  test('still forwards a JSON review from its own page to the board', async () => {
    const r = await request(base).post('/_api/review')
      .set('Content-Type', 'application/json').set('Origin', base).set('Sec-Fetch-Site', 'same-origin')
      .send({ task: 'rich-face:Private Note:round-1', overall: { note: 'the words hold' } });
    expect(r.status).toBe(200);
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({ from: 'TRICKSTER', payload: { kind: 'human_eval', task: 'rich-face:Private Note:round-1' } });
  });
});
