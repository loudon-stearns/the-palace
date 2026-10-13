import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { listen, closeAll } from '../helpers/loopback.js';

// _ops/loudon-eval/eval-server.mjs posts the other human_eval: Loudon's rating
// sheets. It keeps the same wire as the rich face's review dock (rich-handler.mjs
// buildReviewMessage). Spawned here on a free 127.0.0.1 port over an empty temp
// folder, forwarding to a decoy that stands in for STIGMERGY's board.

const EVAL_SERVER = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../loudon-eval/eval-server.mjs');

const freePort = () => new Promise((ok) => {
  const s = net.createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => ok(p)); });
});

describe('loudon-eval forwards a rating as the board expects it', () => {
  let dir, child, port;
  const seen = [];
  beforeAll(async () => {
    dir = mkdtempSync(resolve(tmpdir(), 'loudon-eval-wire-'));
    writeFileSync(resolve(dir, 'rating_manifest.json'), '{"task":"private"}', 'utf8');
    const decoy = http.createServer((req, res) => {
      let b = ''; req.on('data', (c) => { b += c; });
      req.on('end', () => { seen.push(JSON.parse(b)); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{}'); });
    });
    const app = await listen(decoy);
    port = await freePort();
    child = spawn(process.execPath, [EVAL_SERVER, '--dir', dir, '--port', String(port), '--app', app], { stdio: ['ignore', 'pipe', 'pipe'] });
    await new Promise((ok, fail) => { child.stdout.once('data', ok); child.once('exit', (c) => fail(new Error('eval-server exited ' + c))); });
  });
  afterAll(async () => {
    child?.kill();
    await closeAll();
    rmSync(dir, { recursive: true, force: true });
  });

  // It stands behind STIGMERGY's request guard (checkRequest), as the
  // standalone rich face does: a rating it forwards is Loudon's own voice.
  test('refuses a cross-site text/plain rating, and nothing reaches the board', async () => {
    const before = seen.length;
    const r = await fetch(`http://127.0.0.1:${port}/eval`, { method: 'POST',
      headers: { 'Content-Type': 'text/plain', Origin: 'https://evil.example', 'Sec-Fetch-Site': 'cross-site' },
      body: JSON.stringify({ task: 'from-a-foreign-page', overall: { note: 'not Loudon' } }) });
    expect(r.status).toBe(403);
    expect(seen.length).toBe(before);
  });

  test('refuses a rating that is not sent as JSON', async () => {
    const before = seen.length;
    const r = await fetch(`http://127.0.0.1:${port}/eval`, { method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: '{"task":"x"}' });
    expect(r.status).toBe(415);
    expect(seen.length).toBe(before);
  });

  test('refuses to serve a file under a foreign Host', async () => {
    const res = await new Promise((ok, fail) => http.get({ host: '127.0.0.1', port, path: '/rating_manifest.json', headers: { Host: 'rebind.evil.example' } }, (r) => {
      let b = ''; r.on('data', (c) => { b += c; }); r.on('end', () => ok({ status: r.statusCode, body: b }));
    }).on('error', fail));
    expect(res.status).toBe(403);
    expect(res.body).not.toContain('private');
  });

  test('a rating is a human_eval BROADCAST from TRICKSTER on GENERAL, under the one session id "trickster"', async () => {
    const before = seen.length;
    const r = await fetch(`http://127.0.0.1:${port}/eval`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: `http://127.0.0.1:${port}` },
      body: JSON.stringify({ task: 'r4ng3r-lora-grade', groups: { a: { identity: 1, note: 'hooded' } }, overall: { note: 'base wins' } }) });
    expect(r.status).toBe(200);
    expect(seen.length).toBe(before + 1);
    expect(seen.at(-1)).toMatchObject({ from: 'TRICKSTER', type: 'BROADCAST', board: 'GENERAL', session_id: 'trickster', payload: { kind: 'human_eval', task: 'r4ng3r-lora-grade' } });
  });
});
