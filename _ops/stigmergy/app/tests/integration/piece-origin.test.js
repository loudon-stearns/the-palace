import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { resolve, dirname, join } from 'node:path';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { listen, closeAll } from '../helpers/loopback.js';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';
import { startPieceOrigin, createPieceOrigin, piecePortFor } from '../../../../rich-face/piece-origin.mjs';

// The piece origin (_ops/rich-face/piece-origin.mjs) on a temp palace that is a
// git repository, on a free port of its own: never 8843, which the live
// STIGMERGY holds. Step 3 of STIGMERGY — spec — rich-face pieces: its exact
// Host, GET only, no CORS, a 404 that says why for anything not registered,
// and the policies each piece goes out with.

let root, po, port;
function write(rel, body) {
  mkdirSync(dirname(join(root, rel)), { recursive: true });
  writeFileSync(join(root, rel), body);
}
const PAGE = (head, body = 'x') => `<!doctype html><html><head><meta charset="utf-8">${head}</head><body>${body}</body></html>`;

// One request, with the Host header we choose (fetch will not let us).
function send(path, { method = 'GET', host, headers = {}, body } = {}) {
  return new Promise((ok, fail) => {
    const req = http.request({ host: '127.0.0.1', port, path, method, headers: { Host: host ?? `127.0.0.1:${port}`, ...headers } }, (res) => {
      const parts = [];
      res.on('data', (c) => parts.push(c));
      res.on('end', () => ok({ status: res.statusCode, headers: res.headers, text: Buffer.concat(parts).toString('utf8') }));
    });
    req.on('error', fail);
    if (body) req.write(body);
    req.end();
  });
}
const enc = (p) => '/' + p.split('/').map(encodeURIComponent).join('/');

beforeAll(async () => {
  root = mkdtempSync(resolve(tmpdir(), 'piece-origin-test-'));
  execFileSync('git', ['init', '-q'], { cwd: root, env: gitFreeEnv() });
  assertScratchRepo(root);
  write('.gitignore', 'Demo/ignored.json\n');
  write('Demo.md', '---\ntitle: Demo\n---\n# Demo\n\n## Pieces\n\nWords.\n\n![[inline.html]]\n');
  write('Demo/Demo — rich.json', JSON.stringify({ entry: 'Demo', sections: [{ heading: 'Pieces', pieces: [
    { file: 'piece.html', origin: 'made', height: 400 },
    { file: 'gathered.html', origin: 'gathered', height: 400, contract: { needs: ['storage', 'camera'], files: ['g.json'] } },
    { file: 'plain.html', origin: 'made', height: 400 },
  ] }] }));
  write('Demo/piece.html', PAGE('<meta content="camera storage" name="piece:needs"><meta name=\'piece:files\' content="frames.json data/ ignored.json my%20notes.txt"><meta name="piece:net" content="storage.googleapis.com">'));
  write('Demo/gathered.html', PAGE(''));
  write('Demo/plain.html', PAGE(''));
  write('Demo/inline.html', PAGE(''));
  write('Demo/frames.json', '{"frames":1}');
  write('Demo/data/a.json', '{"a":1}');
  write('Demo/my notes.txt', 'notes');
  write('Demo/g.json', '{"g":1}');
  write('Demo/secret.json', '{"secret":1}');
  write('Demo/ignored.json', '{"ignored":1}');
  write('Demo/clip.wav', Buffer.alloc(64, 7));
  write('Other/unnamed.html', PAGE(''));
  write('_ops/loudon-live/design-system/palace-tokens.js', 'window.tokens = 1;');
  write('_ops/loudon-live/design-system/ui_kits/review-layer/review-layer.js', 'window.review = 1;');
  write('_ops/rich-face/grants.json', JSON.stringify({ grants: [{ piece: 'Demo/piece.html', allow: ['camera'], net: [], yes: 'test' }] }));
  po = await startPieceOrigin({ root, port: 0 });
  port = Number(new URL(po.status.origin).port);
  await po.scan(); // the boot scan, already under way once it listens
});
afterAll(async () => {
  await po?.close();
  await closeAll();
  if (root) rmSync(root, { recursive: true, force: true });
});

describe('the piece origin', () => {
  test('it listens on 127.0.0.1, on a port of its own', () => {
    expect(po.status).toMatchObject({ ok: true });
    expect(po.status.origin).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/);
  });

  test('it answers only to its exact Host', async () => {
    expect((await send(enc('Demo/piece.html'))).status).toBe(200);
    const asLocalhost = await send(enc('Demo/piece.html'), { host: `localhost:${port}` });
    expect(asLocalhost.status).toBe(421);
    expect(asLocalhost.text).toContain(`http://127.0.0.1:${port}`);
    expect((await send(enc('Demo/piece.html'), { host: '127.0.0.1:1' })).status).toBe(421);
    expect((await send(enc('Demo/piece.html'), { host: 'evil.example' })).status).toBe(403); // the request guard's Host rule
  });

  test('GET and HEAD only; a preflight is refused, and nothing carries CORS', async () => {
    const head = await send(enc('Demo/frames.json'), { method: 'HEAD' });
    expect(head.status).toBe(200);
    expect(head.text).toBe('');
    const post = await send(enc('Demo/frames.json'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    expect(post.status).toBe(405);
    expect(post.headers.allow).toBe('GET, HEAD');
    const fromElsewhere = await send(enc('Demo/frames.json'), { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://localhost:5173', 'Sec-Fetch-Site': 'cross-site' }, body: '{}' });
    expect(fromElsewhere.status).toBe(403);
    const pre = await send(enc('Demo/frames.json'), { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'GET' } });
    expect(pre.status).toBe(403);
    for (const r of [head, post, pre, await send(enc('Demo/piece.html'), { headers: { Origin: 'http://localhost:5173' } })]) {
      expect(Object.keys(r.headers).filter((k) => k.startsWith('access-control-'))).toEqual([]);
    }
  });

  test('a piece goes out with the kit, its grants as Permissions-Policy, its CSP report-only, CORP and nosniff', async () => {
    const r = await send(enc('Demo/piece.html'));
    expect(r.text).toContain('data-rich-kit="1"');
    expect(r.headers['x-content-type-options']).toBe('nosniff');
    expect(r.headers['cross-origin-resource-policy']).toBe('same-origin');
    expect(r.headers['permissions-policy']).toContain('camera=(self)');
    expect(r.headers['permissions-policy']).toContain('microphone=()');
    expect(r.headers['content-security-policy']).toBeUndefined();
    const csp = r.headers['content-security-policy-report-only'];
    expect(csp).toContain("connect-src 'self'");
    expect(csp).not.toContain('storage.googleapis.com'); // declared, never granted
    expect(csp).toContain('https://cdn.jsdelivr.net');
    // Declared but not granted: the browser is told no, whatever its frame asks.
    expect((await send(enc('Demo/gathered.html'))).headers['permissions-policy']).toContain('camera=()');
  });

  test('a declared file is served, by name, folder or %20; an undeclared one gets a 404 that says why', async () => {
    expect((await send(enc('Demo/frames.json'))).text).toBe('{"frames":1}');
    expect((await send(enc('Demo/data/a.json'))).status).toBe(200);
    expect((await send(enc('Demo/my notes.txt'))).text).toBe('notes');
    expect((await send(enc('Demo/g.json'))).status).toBe(200); // the manifest's contract speaks for a gathered proof
    const secret = await send(enc('Demo/secret.json'));
    expect(secret.status).toBe(404);
    expect(secret.text).toMatch(/is not served here: the piece origin serves only pieces a face has named, the files they declare/);
    const ignored = await send(enc('Demo/ignored.json'));
    expect(ignored.status).toBe(404);
    expect(ignored.text).toMatch(/ignored by git/);
  });

  test('declared media streams with byte ranges', async () => {
    write('Demo/piece.html', PAGE('<meta name="piece:files" content="frames.json clip.wav">'));
    expect((await send(enc('Demo/piece.html'))).status).toBe(200); // read again on load: its declaration is current
    const part = await send(enc('Demo/clip.wav'), { headers: { Range: 'bytes=0-3' } });
    expect(part.status).toBe(206);
    expect(part.headers['content-range']).toBe('bytes 0-3/64');
    write('Demo/piece.html', PAGE('<meta content="camera storage" name="piece:needs"><meta name=\'piece:files\' content="frames.json data/ ignored.json my%20notes.txt">'));
    await send(enc('Demo/piece.html'));
  });

  test('a page no face has named is a 404 that says why, until the rich page or the deck asks to frame it', async () => {
    const before = await send(enc('Other/unnamed.html'));
    expect(before.status).toBe(404);
    expect(before.text).toContain('“Other/unnamed.html” is not served here');
    const plan = po.describe('Other/unnamed.html');
    expect(plan).toMatchObject({ mark: 'pre-contract', sameOrigin: false, url: `${po.status.origin}/Other/unnamed.html` });
    expect((await send(enc('Other/unnamed.html'))).status).toBe(200);
  });

  test('a piece added to a manifest after boot is found on the miss', async () => {
    write('Demo/late.html', PAGE(''));
    write('Demo/Demo — rich.json', JSON.stringify({ entry: 'Demo', sections: [{ heading: 'Pieces', pieces: [
      { file: 'piece.html', origin: 'made', height: 400 }, { file: 'late.html', origin: 'made', height: 400 },
    ] }] }));
    await new Promise((r) => setTimeout(r, 1100)); // a miss re-reads the manifests at most once a second
    expect((await send(enc('Demo/late.html'))).status).toBe(200);
  });

  test('the text figures of an entry with a manifest are registered at boot too', async () => {
    expect((await send(enc('Demo/inline.html'))).status).toBe(200);
  });

  test('hidden folders, STIGMERGY’s own paths and the review layer are refused; the design system is served', async () => {
    const git = await send('/.git/HEAD');
    expect(git.status).toBe(404);
    expect(git.text).toMatch(/hidden folder/);
    for (const p of ['/api/persistent', '/api/open?path=x', '/rich/', '/_api/resolve']) {
      const r = await send(p);
      expect(r.status, p).toBe(403);
      expect(r.text).toMatch(/serves no part of STIGMERGY/);
    }
    expect((await send('/../../etc/passwd')).status).toBe(404);
    const review = await send(enc('_ops/loudon-live/design-system/ui_kits/review-layer/review-layer.js'));
    expect(review.status).toBe(404);
    expect(review.text).toMatch(/review layer stays out of faces/);
    const tokens = await send(enc('_ops/loudon-live/design-system/palace-tokens.js'));
    expect(tokens.status).toBe(200);
    expect(tokens.headers['content-type']).toMatch(/javascript/);
  });

  test('the root is not a page', async () => {
    expect((await send('/')).status).toBe(404);
  });
});

describe('when its port is taken', () => {
  test('it says so, and every plan carries the reason instead of a frame', async () => {
    const holder = http.createServer((req, res) => res.end('another program'));
    const held = Number(new URL(await listen(holder)).port);
    const o = createPieceOrigin({ root, port: held });
    const status = await o.start();
    expect(status.ok).toBe(false);
    expect(status.error).toBe(`port ${held} is taken by another program, so no piece runs here`);
    expect(o.describe('Demo/plain.html').blocked).toBe(status.error);
  });

  test('a second start on a held port in the same process finds the first instead', async () => {
    const holder = http.createServer();
    const free = Number(new URL(await listen(holder)).port);
    await new Promise((r) => holder.close(r));
    const a = await startPieceOrigin({ root, port: free });
    const b = await startPieceOrigin({ root, port: free });
    expect(b).toBe(a);
    expect(a.status.ok).toBe(true);
    await a.close();
  });
});

describe('which port', () => {
  test('8843 beside the app’s own 5173; a free one beside anything else; STIGMERGY_PIECE_PORT over both', () => {
    expect(piecePortFor(5173, {})).toBe(8843);
    expect(piecePortFor(5199, {})).toBe(0);
    expect(piecePortFor(undefined, {})).toBe(0);
    expect(piecePortFor(5173, { STIGMERGY_PIECE_PORT: '9911' })).toBe(9911);
  });
});
