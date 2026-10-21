import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import http from 'node:http';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawn, execFileSync } from 'node:child_process';
import request from 'supertest';
import { listen, closeAll } from '../helpers/loopback.js';
import { gitFreeEnv } from '../helpers/git-env.js';
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

// A preview reaches the board only when started with --app (spec — rich-face pieces, § 2).
describe('a preview with no board', () => {
  let root, base;
  beforeAll(async () => {
    root = mkdtempSync(resolve(tmpdir(), 'rich-server-noapp-'));
    writeFileSync(resolve(root, 'Note.md'), '# Note\n\nhello\n', 'utf8');
    base = await listen(createRichServer({ root, here: RICH_SRC }));
  });
  afterAll(async () => {
    await closeAll();
    rmSync(root, { recursive: true, force: true });
  });

  test('answers its own page’s review with where to send it, and forwards nothing', async () => {
    const r = await request(base).post('/_api/review')
      .set('Content-Type', 'application/json').set('Origin', base).set('Sec-Fetch-Site', 'same-origin')
      .send({ task: 'rich-face:Note:round-1' });
    expect(r.status).toBe(503);
    expect(r.body.error).toMatch(/no board: start it with --app/);
  });

  test('still refuses a foreign page first', async () => {
    const r = await request(base).post('/_api/review')
      .set('Content-Type', 'text/plain').set('Origin', 'https://evil.example').set('Sec-Fetch-Site', 'cross-site').send('{}');
    expect(r.status).toBe(403);
  });

  test('still serves the palace', async () => {
    const r = await request(base).get('/Note.md');
    expect(r.status).toBe(200);
    expect(r.text).toContain('hello');
  });
});

// Spec step 8: two previews on two roots; --stop stops only its own. Each preview is a real
// detached process holding a leased port, started the way a session starts one, on a temp
// lease folder and a port block of its own; each holder is a different agent.
describe('previews on leased ports', () => {
  const SERVER = resolve(RICH_SRC, 'rich-server.mjs');
  let dir, roots, env;
  const run = (args, who) => new Promise((ok) => {
    const child = spawn(process.execPath, [SERVER, ...args], { env: { ...env, COMMONS_AGENT_SLUG: who }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.on('data', (b) => { out += b; });
    child.stderr.on('data', (b) => { out += b; });
    child.on('exit', (code) => ok({ code, out }));
  });
  const portOf = (out) => Number(/http:\/\/127\.0\.0\.1:(\d+)\//.exec(out)[1]);

  beforeAll(() => {
    dir = mkdtempSync(resolve(tmpdir(), 'rich-server-leases-'));
    roots = ['A', 'B'].map((name) => {
      const root = resolve(dir, `palace-${name}`);
      mkdirSync(root);
      execFileSync('git', ['init', '-q'], { cwd: root, env: gitFreeEnv() });
      writeFileSync(resolve(root, `Entry ${name}.md`), `# Entry ${name}\n\nthis is root ${name}\n\n![[toy ${name}.html]]\n`, 'utf8');
      writeFileSync(resolve(root, `toy ${name}.html`), `<!doctype html><title>toy ${name}</title><p>piece of root ${name}</p>\n`, 'utf8');
      return root;
    });
    const lo = 41000 + Math.floor(Math.random() * 100) * 40;
    // CLAUDE_PID is this test's own process: a preview left behind by a crashed run stops with it.
    env = gitFreeEnv({ PALACE_LEASE_DIR: resolve(dir, 'leases'), PALACE_LEASE_PORTS: `${lo}-${lo + 39}`, CLAUDE_CODE_SESSION_ID: 'rich-server-test', CLAUDE_PID: String(process.pid) });
  });
  afterAll(async () => {
    await run(['--stop'], 'holder-a');
    await run(['--stop'], 'holder-b');
    rmSync(dir, { recursive: true, force: true });
  });

  test('two holders start two previews on two roots at once; each serves its own; --stop reaches only its own', async () => {
    const [a, b] = await Promise.all([
      run(['--root', roots[0], '--detach'], 'holder-a'),
      run(['--root', roots[1], '--detach'], 'holder-b'),
    ]);
    expect(a.code, a.out).toBe(0);
    expect(b.code, b.out).toBe(0);
    expect(a.out).toMatch(/reviews → no board/);
    const pa = portOf(a.out), pb = portOf(b.out);
    expect(pa).not.toBe(pb);

    expect((await request(`http://127.0.0.1:${pa}`).get('/Entry%20A.md')).text).toContain('this is root A');
    expect((await request(`http://127.0.0.1:${pb}`).get('/Entry%20B.md')).text).toContain('this is root B');
    expect((await request(`http://127.0.0.1:${pa}`).get('/Entry%20B.md')).status).toBe(404);

    // Each preview's pieces run on a piece origin of its own, on a second leased
    // port: never the page's, never the other preview's, and its piece is served there.
    const origins = [];
    for (const [p, name] of [[pa, 'A'], [pb, 'B']]) {
      const info = (await request(`http://127.0.0.1:${p}`).get(`/_api/resolve?entry=Entry%20${name}`)).body;
      expect(info.pieceOrigin.ok, JSON.stringify(info.pieceOrigin)).toBe(true);
      expect(info.pieceOrigin.origin).not.toBe(`http://127.0.0.1:${p}`);
      expect(info.pieces[`toy ${name}.html`].blocked, JSON.stringify(info.pieces)).toBeFalsy();
      const piece = await request(info.pieceOrigin.origin).get(`/toy%20${name}.html`);
      expect(piece.status).toBe(200);
      expect(piece.text).toContain(`piece of root ${name}`);
      origins.push(info.pieceOrigin.origin);
    }
    expect(origins[0]).not.toBe(origins[1]);
    const piecePort = (o) => Number(new URL(o).port);
    const [qa, qb] = origins.map(piecePort);
    expect(a.out).toContain(`pieces run on ${origins[0]}`);

    const listA = await run(['--list'], 'holder-a');
    expect(listA.out).toContain(String(pa));
    expect(listA.out).toContain(String(qa));
    expect(listA.out).not.toContain(String(pb));
    expect(listA.out).not.toContain(String(qb));

    const crossed = await run(['--stop', String(pb)], 'holder-a');
    expect(crossed.code).toBe(1);
    expect(crossed.out).toMatch(new RegExp(`port ${pb} is not yours: it is rich-face for holder-b`));
    expect((await request(`http://127.0.0.1:${pb}`).get('/Entry%20B.md')).status).toBe(200);

    const stopped = await run(['--stop'], 'holder-a');
    expect(stopped.code, stopped.out).toBe(0);
    expect(stopped.out).toContain(`stopped rich-face on ${pa}`);
    await expect(request(`http://127.0.0.1:${pa}`).get('/')).rejects.toThrow();
    await expect(request(origins[0]).get('/toy%20A.html')).rejects.toThrow();
    expect((await request(`http://127.0.0.1:${pb}`).get('/Entry%20B.md')).status).toBe(200);
    expect((await request(origins[1]).get('/toy%20B.html')).status).toBe(200);

    const all = await run(['--list', '--all'], 'holder-a');
    expect(all.out).toContain(`${pb}`);
    expect(all.out).not.toContain(`${pa} `);
    expect(all.out).not.toContain(`${qa} `);
  }, 60_000);

  test('an exact port someone else holds is refused, naming them', async () => {
    const b = await run(['--root', roots[1], '--detach'], 'holder-b');
    expect(b.code, b.out).toBe(0);
    const taken = await run(['--root', roots[0], '--port', String(portOf(b.out))], 'holder-a');
    expect(taken.code).toBe(1);
    expect(taken.out).toMatch(/is not free — leased to rich-face for holder-b/);
  }, 30_000);

  test('an exact page port still gives its pieces a leased port of their own', async () => {
    const lo = Number(env.PALACE_LEASE_PORTS.split('-')[0]);
    const want = lo + 30;
    const a = await run(['--root', roots[0], '--port', String(want), '--detach'], 'holder-a');
    expect(a.code, a.out).toBe(0);
    expect(portOf(a.out)).toBe(want);
    const info = (await request(`http://127.0.0.1:${want}`).get('/_api/resolve?entry=Entry%20A')).body;
    expect(info.pieceOrigin.ok, JSON.stringify(info.pieceOrigin)).toBe(true);
    const q = Number(new URL(info.pieceOrigin.origin).port);
    expect(q).not.toBe(want);
    expect(q).toBeGreaterThanOrEqual(lo);
    expect(q).toBeLessThanOrEqual(lo + 39);
    const stopped = await run(['--stop', String(want)], 'holder-a');
    expect(stopped.code, stopped.out).toBe(0);
    await expect(request(info.pieceOrigin.origin).get('/toy%20A.html')).rejects.toThrow();
  }, 30_000);
});
