import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { mkdirSync, symlinkSync } from 'node:fs';
import { listen, closeAll } from '../helpers/loopback.js';
import { validateMessage } from '@stigmergy/core/schema';
import { readReview } from '../../src/lib/queue-model.js';
import { readAnswers, pageOf } from '../../../../loudon-eval/read-answers.mjs';

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

  test('a rating carries the human node\'s model id, loudon-trickster (SCHEMA — Reference §9)', () => {
    expect(seen.at(-1).health).toMatchObject({ model: 'loudon-trickster', iteration: 1, score: 'green' });
  });
});

// The answers server: the same process run without --dir serves the palace, so any page that
// asks Loudon something can send his answers same-origin (POST /answers) and land a REVIEW NOTE.
const start = async (args) => {
  const port = await freePort();
  const c = spawn(process.execPath, [EVAL_SERVER, '--port', String(port), ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((ok, fail) => { c.stdout.once('data', ok); c.once('exit', (code) => fail(new Error('eval-server exited ' + code))); });
  return { c, port, base: `http://127.0.0.1:${port}` };
};
const get = (port, path, headers = {}) => new Promise((ok, fail) => http.get({ host: '127.0.0.1', port, path, headers }, (r) => {
  let b = ''; r.on('data', (c) => { b += c; }); r.on('end', () => ok({ status: r.statusCode, headers: r.headers, body: b }));
}).on('error', fail));

describe('the answers server', () => {
  let root, outside, srv, dead;
  const seen = [];
  beforeAll(async () => {
    root = mkdtempSync(resolve(tmpdir(), 'answers-root-'));
    outside = mkdtempSync(resolve(tmpdir(), 'answers-outside-'));
    mkdirSync(resolve(root, 'The Lens/proofs/run'), { recursive: true });
    writeFileSync(resolve(root, 'The Lens/proofs/run/ask.html'), '<!doctype html><p>asks</p>', 'utf8');
    mkdirSync(resolve(root, '.git')); writeFileSync(resolve(root, '.git/config'), 'secret-git', 'utf8');
    mkdirSync(resolve(root, '.claude')); writeFileSync(resolve(root, '.claude/settings.local.json'), 'secret-claude', 'utf8');
    mkdirSync(resolve(root, 'app/node_modules/pkg'), { recursive: true }); writeFileSync(resolve(root, 'app/node_modules/pkg/i.js'), 'secret-nm', 'utf8');
    writeFileSync(resolve(outside, 'leak.txt'), 'secret-outside', 'utf8');
    symlinkSync(outside, resolve(root, 'out'));
    const decoy = http.createServer((req, res) => {
      let b = ''; req.on('data', (c) => { b += c; });
      req.on('end', () => {
        const m = JSON.parse(b); seen.push(m);
        const v = validateMessage(m);
        res.writeHead(v.valid ? 200 : 400, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(v.valid ? m : v));
      });
    });
    const app = await listen(decoy);
    srv = await start(['--root', root, '--app', app]);
    dead = await start(['--root', root, '--app', `http://127.0.0.1:${await freePort()}`]);
  });
  afterAll(async () => {
    srv?.c.kill(); dead?.c.kill();
    await closeAll();
    rmSync(root, { recursive: true, force: true }); rmSync(outside, { recursive: true, force: true });
  });

  const send = (base, body, headers = {}) => fetch(`${base}/answers`, { method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: base, 'Sec-Fetch-Site': 'same-origin', ...headers }, body: JSON.stringify(body) });

  test('serves a page from the palace as itself, not sandboxed, so it is same-origin with /answers', async () => {
    const r = await get(srv.port, '/The%20Lens/proofs/run/ask.html');
    expect(r.status).toBe(200);
    expect(r.headers['content-type']).toMatch(/text\/html/);
    expect(r.headers['content-security-policy']).toBeUndefined();
    expect(r.body).toContain('asks');
  });

  test('serves the shared script at /_answers/answers.js', async () => {
    const r = await get(srv.port, '/_answers/answers.js');
    expect(r.status).toBe(200);
    expect(r.headers['content-type']).toMatch(/javascript/);
    expect(r.body).toContain('PalaceAnswers');
  });

  test.each([
    ['a dotfolder (.git)', '/.git/config'],
    ['a dotfolder (.claude)', '/.claude/settings.local.json'],
    ['node_modules', '/app/node_modules/pkg/i.js'],
    ['a symlink out of the root', '/out/leak.txt'],
  ])('refuses %s', async (_what, path) => {
    const r = await get(srv.port, path);
    expect(r.status).toBe(403);
    expect(r.body).not.toMatch(/secret/);
  });

  // The URL parser folds `..` and `%2e%2e` against the root before the path is resolved, so a
  // traversal lands inside the palace and finds nothing; it never reaches the folder beside it.
  test.each(['/%2e%2e/OUTSIDE/leak.txt', '/../OUTSIDE/leak.txt', '/The%20Lens/..%2f..%2fOUTSIDE/leak.txt'])('a traversal never leaves the root: %s', async (path) => {
    const r = await get(srv.port, path.replace('OUTSIDE', outside.split('/').pop()));
    expect([403, 404]).toContain(r.status);
    expect(r.body).not.toMatch(/secret/);
  });

  test('refuses a page under a foreign Host', async () => {
    const r = await get(srv.port, '/The%20Lens/proofs/run/ask.html', { Host: 'rebind.evil.example' });
    expect(r.status).toBe(403);
  });

  test('refuses answers from a foreign page, and nothing reaches the board', async () => {
    const before = seen.length;
    const r = await send(srv.base, { page: 'The Lens', answers: { a: 1 } }, { Origin: 'https://evil.example', 'Sec-Fetch-Site': 'cross-site' });
    expect(r.status).toBe(403);
    expect(seen.length).toBe(before);
  });

  test('refuses answers that name no page, and nothing reaches the board', async () => {
    const before = seen.length;
    const r = await send(srv.base, { answers: { a: 1 } });
    expect(r.status).toBe(400);
    expect(seen.length).toBe(before);
  });

  test('answers on a page land as a valid human_eval naming it, and the QUEUE reads them as a REVIEW NOTE on that page', async () => {
    const before = seen.length;
    const r = await send(srv.base, { page: 'The Lens', task: 'woken-glasses', answers: { Trickster: { subject: 'two' } },
      summary: 'Woken Glasses — my answers\n- Trickster: subject → bold', url: '/The Lens/proofs/run/ask.html' });
    expect(r.status).toBe(200);
    const j = await r.json();
    expect(seen.length).toBe(before + 1);
    const m = seen.at(-1);
    expect(j.message_id).toBe(m.id);
    expect(validateMessage(m)).toEqual({ valid: true });
    expect(m).toMatchObject({ from: 'TRICKSTER', to: '*', type: 'BROADCAST', board: 'GENERAL', session_id: 'trickster',
      health: { model: 'loudon-trickster' },
      payload: { kind: 'human_eval', entry: 'The Lens', task: 'woken-glasses', answers: { Trickster: { subject: 'two' } },
        url: '/The Lens/proofs/run/ask.html', overall: { note: 'Woken Glasses — my answers\n- Trickster: subject → bold' } } });
    const review = readReview(m.payload);
    expect(review).toMatchObject({ entry: 'The Lens', via: 'page', notes: [{ section: 'woken-glasses', note: expect.stringContaining('Woken Glasses') }] });
  });

  test('answers with no summary get a readable one, so the card still has words', async () => {
    const r = await send(srv.base, { page: 'The Lens', answers: { overall: 'go bold' } });
    expect(r.status).toBe(200);
    expect(seen.at(-1).payload.summary).toContain('overall: go bold');
    expect(readReview(seen.at(-1).payload)).not.toBeNull();
  });

  test('answers too big for the board are refused here, and nothing reaches it', async () => {
    const before = seen.length;
    const r = await send(srv.base, { page: 'The Lens', answers: 'x'.repeat(70 * 1024) });
    expect(r.status).toBe(413);
    expect(seen.length).toBe(before);
  });

  test('when STIGMERGY is down the answer is 502, so the page falls back to its copy block', async () => {
    const r = await send(dead.base, { page: 'The Lens', answers: { a: 1 } });
    expect(r.status).toBe(502);
  });

  test('read-answers finds the latest answers on a page, matching without regard to case', () => {
    const board = seen.map((m) => JSON.stringify(m)).join('\n') + '\n{"payload":{"kind":"handoff_ready"}}\n';
    const found = readAnswers(board, { page: 'the lens' });
    expect(found.length).toBeGreaterThanOrEqual(2);
    expect(found.every((m) => pageOf(m.payload) === 'The Lens')).toBe(true);
    expect(readAnswers(board, { page: 'The Lens', task: 'woken-glasses' })).toHaveLength(1);
    expect(pageOf({ task: 'rich-face:Ohm\'s Law:round-2' })).toBe("Ohm's Law");
  });
});
