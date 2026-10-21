import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import http from 'node:http';
import { resolve, dirname, join, normalize, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync, copyFileSync, existsSync, readFileSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import request from 'supertest';
import { listen, closeAll } from '../helpers/loopback.js';
import { blackboardMiddleware } from '../../server/middleware.js';
import { selfOrigin } from '../../server/api/rich.js';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

// The rich face mounted at /rich/ (server/api/rich.js → _ops/rich-face/).
// A temp palace carries the renderer's two files plus one entry with a bundle
// and a manifest, so every answer here comes from fixtures, not the real palace.

const __dirname = dirname(fileURLToPath(import.meta.url));
const RICH_SRC = resolve(__dirname, '../../../../rich-face');

function makeServer(palaceRoot) {
  const plugin = blackboardMiddleware(palaceRoot);
  const handlers = [];
  plugin.configureServer({ middlewares: { use: (fn) => handlers.push(fn) } });
  return http.createServer((req, res) => {
    let i = 0;
    const next = () => {
      if (i >= handlers.length) { res.statusCode = 404; res.end('not found'); return; }
      handlers[i++](req, res, next);
    };
    next();
  });
}

const WAV = 'RIFF' + 'x'.repeat(2000);

function makeTempPalace() {
  const root = mkdtempSync(resolve(tmpdir(), 'stigmergy-rich-test-'));
  // The rich face finds files through git's index (resolve.mjs), never by walking
  // the disk, so the temp palace is a repository; new files count untracked.
  execFileSync('git', ['init', '-q'], { cwd: root, env: gitFreeEnv() });
  assertScratchRepo(root);
  mkdirSync(resolve(root, '_ops/swarm/persistent'), { recursive: true });
  mkdirSync(resolve(root, '_ops/swarm/sessions'), { recursive: true });
  writeFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), '', 'utf8');
  mkdirSync(resolve(root, '_ops/rich-face'), { recursive: true });
  for (const f of ['rich.html', 'parse.js']) copyFileSync(resolve(RICH_SRC, f), resolve(root, '_ops/rich-face', f));
  writeFileSync(resolve(root, '_ops/rich-face/secret.txt'), 'not a renderer file', 'utf8');
  writeFileSync(resolve(root, 'Demo Entry.md'), '---\ntitle: Demo Entry\n---\n# Demo Entry\n\nSome words.\n\n## A Section\n\nMore words.\n', 'utf8');
  mkdirSync(resolve(root, 'Demo Entry'), { recursive: true });
  writeFileSync(resolve(root, 'Demo Entry/Demo Entry — rich.json'), JSON.stringify({ entry: 'Demo Entry', sections: [] }), 'utf8');
  writeFileSync(resolve(root, 'Demo Entry/bed.wav'), WAV, 'binary');
  writeFileSync(resolve(root, 'Demo Entry/piece.html'), '<!doctype html><script>1</script>', 'utf8');
  writeFileSync(resolve(root, 'Demo Entry/pic.svg'), '<svg xmlns="http://www.w3.org/2000/svg"><script>1</script></svg>', 'utf8');
  mkdirSync(resolve(root, 'Elsewhere'), { recursive: true });
  writeFileSync(resolve(root, 'Elsewhere/stray.png'), 'PNG', 'binary');
  return root;
}

describe('the rich face at /rich/', () => {
  let root, sibling, base;
  beforeAll(async () => {
    root = makeTempPalace();
    sibling = root + '-sibling'; // shares the palace's name as a prefix
    mkdirSync(sibling, { recursive: true });
    writeFileSync(resolve(sibling, 'secret.txt'), 'outside the palace', 'utf8');
    // Links inside the palace: two that point out of it, one that stays in.
    mkdirSync(resolve(root, 'Links'), { recursive: true });
    symlinkSync(resolve(sibling, 'secret.txt'), resolve(root, 'Links/escape.txt'));
    symlinkSync(sibling, resolve(root, 'Links/out'));
    symlinkSync('../Demo Entry/bed.wav', resolve(root, 'Links/alias.wav'));
    base = await listen(makeServer(root));
  });
  afterAll(async () => {
    await closeAll();
    rmSync(root, { recursive: true, force: true });
    rmSync(sibling, { recursive: true, force: true });
  });

  test('/rich redirects to /rich/, keeping the query', async () => {
    const r = await request(base).get('/rich?entry=Demo%20Entry');
    expect(r.status).toBe(301);
    expect(r.headers.location).toBe('/rich/?entry=Demo%20Entry');
  });

  test('/rich/ serves the renderer', async () => {
    const r = await request(base).get('/rich/?entry=Demo%20Entry');
    expect(r.status).toBe(200);
    expect(r.headers['content-type']).toMatch(/text\/html/);
    expect(r.text).toContain('src="_rich/rich.js"');
  });

  test('only the renderer files are served under _rich/', async () => {
    expect((await request(base).get('/rich/_rich/parse.js')).status).toBe(200);
    expect((await request(base).get('/rich/_rich/rich.js')).status).toBe(200);
    expect((await request(base).get('/rich/_rich/secret.txt')).status).toBe(404);
  });

  test('resolve finds the entry, its bundle and the manifest in the bundle — as relative urls', async () => {
    const r = await request(base).get('/rich/_api/resolve?entry=Demo%20Entry');
    expect(r.status).toBe(200);
    expect(r.body.md).toBe('Demo%20Entry.md');
    expect(r.body.bundle).toBe('Demo%20Entry/');
    expect(decodeURIComponent(r.body.manifest)).toBe('Demo Entry/Demo Entry — rich.json');
    expect(r.body.files).toContain('bed.wav');
  });

  test('an unknown entry is a 404, not a crash', async () => {
    expect((await request(base).get('/rich/_api/resolve?entry=Nope')).status).toBe(404);
  });

  test('palace files stream with byte ranges', async () => {
    const whole = await request(base).get('/rich/Demo%20Entry.md');
    expect(whole.status).toBe(200);
    expect(whole.text).toContain('## A Section');
    const part = await request(base).get('/rich/Demo%20Entry/bed.wav').set('Range', 'bytes=0-3');
    expect(part.status).toBe(206);
    expect(part.headers['content-range']).toBe(`bytes 0-3/${WAV.length}`);
  });

  // A piece reached outside its sandboxed frame — a prose link, a top-level
  // navigation — must not run as STIGMERGY either, so the server sandboxes it.
  test('a palace .html or .svg is served sandboxed; the page and its own files are not', async () => {
    const csp = async (path, method = 'get') => (await request(base)[method](path)).headers['content-security-policy'];
    expect(await csp('/rich/Demo%20Entry/piece.html')).toBe('sandbox allow-scripts');
    expect(await csp('/rich/Demo%20Entry/piece.html', 'head')).toBe('sandbox allow-scripts');
    expect(await csp('/rich/Demo%20Entry/pic.svg')).toBe('sandbox allow-scripts');
    // The page carries a policy of its own: its scripts are its own files.
    expect(await csp('/rich/?entry=Demo%20Entry')).toMatch(/^script-src 'self';/);
    expect(await csp('/rich/_rich/parse.js')).toBeUndefined();
    expect(await csp('/rich/Demo%20Entry/bed.wav')).toBeUndefined();
  });

  test('media resolves by bare filename, vault-wide, under the mount', async () => {
    const r = await request(base).get('/rich/_api/media?name=stray.png&prefer=Demo%20Entry%2F');
    expect(r.status).toBe(302);
    expect(r.headers.location).toBe('/rich/Elsewhere/stray.png');
  });

  // Each climb below lands on a file that really exists, so a 404 means the
  // guard refused it — not that there was nothing there to serve.
  test('refuses to climb out of the palace', async () => {
    const climb = '../'.repeat(24);
    expect(normalize(join(root, climb + 'etc/passwd'))).toBe('/etc/passwd');
    expect(existsSync('/etc/passwd')).toBe(true);
    expect((await request(base).get('/rich/' + '..%2F'.repeat(24) + 'etc%2Fpasswd')).status).toBe(404);
  });

  test('refuses a sibling folder whose name starts with the palace\'s', async () => {
    expect(existsSync(resolve(sibling, 'secret.txt'))).toBe(true);
    expect((await request(base).get(`/rich/..%2F${encodeURIComponent(basename(sibling))}%2Fsecret.txt`)).status).toBe(404);
  });

  // On POSIX a backslash is a filename character, not a separator, so this one
  // guards against a future decoder that treats it as one (or a Windows host).
  test('refuses an encoded-backslash climb', async () => {
    expect((await request(base).get('/rich/' + '..%5C'.repeat(24) + 'etc%5Cpasswd')).status).toBe(404);
  });

  // The words of the path stay inside; the file it lands on does not. Each
  // link resolves to a file that is really there, so a 404 is the refusal.
  test('refuses a symlink in the palace that points out of it', async () => {
    expect(readFileSync(resolve(root, 'Links/escape.txt'), 'utf8')).toBe('outside the palace');
    expect((await request(base).get('/rich/Links/escape.txt')).status).toBe(404);
  });

  test('refuses a file under a linked folder that points out of the palace', async () => {
    expect(readFileSync(resolve(root, 'Links/out/secret.txt'), 'utf8')).toBe('outside the palace');
    expect((await request(base).get('/rich/Links/out/secret.txt')).status).toBe(404);
  });

  test('still serves a symlink that lands inside the palace', async () => {
    const r = await request(base).get('/rich/Links/alias.wav').set('Range', 'bytes=0-3');
    expect(r.status).toBe(206);
  });

  test('a review of null is a 400 through the mount, and the server lives', async () => {
    const r = await request(base).post('/rich/_api/review').set('Content-Type', 'application/json').send('null');
    expect(r.status).toBe(400);
    expect((await request(base).get('/rich/_api/resolve?entry=Demo%20Entry')).status).toBe(200);
  });

  // The review is forwarded to this same server's board. Where "this server" is
  // must come from the socket the request arrived on, never the client's Host
  // header — here a Host naming another listener on this machine.
  test('a review goes to this server\'s own board, whatever the Host header says', async () => {
    const seen = [];
    const decoy = http.createServer((req, res) => { seen.push(req.url); res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{}'); });
    await new Promise((ok) => decoy.listen(0, '127.0.0.1', ok));
    try {
      const r = await request(base).post('/rich/_api/review')
        .set('Host', `127.0.0.1:${decoy.address().port}`)
        .send({ task: 'rich-face:Demo Entry:round-1', groups: { 'A Section': { note: 'the words hold' } }, overall: { note: 'fine' } });
      expect(seen).toEqual([]);
      expect(r.status).toBeLessThan(300);
      const board = readFileSync(resolve(root, '_ops/swarm/persistent/blackboard.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
      const posted = board.find((m) => m.id === r.body.message_id);
      expect(posted).toBeTruthy();
      expect(posted.payload.groups['A Section'].note).toBe('the words hold');
    } finally {
      decoy.close();
    }
  });

  test('paths outside /rich are not its business', async () => {
    const r = await request(base).get('/richer');
    expect(r.status).toBe(404);
    expect(r.text).toBe('not found'); // fell through to the harness, not the rich handler
  });
});

describe('selfOrigin — the address a review is forwarded to', () => {
  test('is the socket\'s local address and port, whatever the headers say', () => {
    const req = { headers: { host: 'evil.example:80' }, socket: { localAddress: '127.0.0.1', localPort: 5173 } };
    expect(selfOrigin(req)).toBe('http://127.0.0.1:5173');
  });
  test('brackets an IPv6 address', () => {
    expect(selfOrigin({ socket: { localAddress: '::1', localPort: 5173 } })).toBe('http://[::1]:5173');
  });
  test('is https on a TLS socket', () => {
    expect(selfOrigin({ socket: { localAddress: '127.0.0.1', localPort: 5173, encrypted: true } })).toBe('https://127.0.0.1:5173');
  });
  test('falls back to the default port with no socket to read', () => {
    expect(selfOrigin({ headers: { host: 'evil.example' } })).toBe('http://localhost:5173');
  });
});
