import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';
import { refuseRoot, makeScratchPalace, sweepCaches, KIND } from '../../scripts/scratch-vite.mjs';
import { acquire } from '../../../../commons/port-lease.mjs';

// The scratch STIGMERGY (scripts/scratch-vite.mjs): this checkout's app over a
// throwaway palace, on leased ports, workers stubbed. Two holders start one each
// at the same moment, as two sessions would; each is a real detached process on
// a temp lease folder and a port block of its own, never :5173 or the real board.

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = resolve(HERE, '../..');
const SCRIPT = resolve(APP, 'scripts/scratch-vite.mjs');
const BOARD = '_ops/swarm/persistent/blackboard.jsonl';

function message(content) {
  return {
    schema_version: '1.0', id: 'scratch-vite-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    ts: new Date().toISOString(), session_id: 'scratch-vite-test', from: 'TRICKSTER', to: '*', type: 'BROADCAST', board: 'GENERAL',
    health: { context_pct: 0.1, stop_reason: 'end_turn', iteration: 1, tokens_this_call: 100, model: 'claude-opus-5-5', score: 'green' },
    payload: { content },
  };
}

describe('which root a scratch server may take', () => {
  test('refuses a checkout of this palace, whose board is tracked', () => {
    expect(refuseRoot(APP)).toMatch(/is a checkout of this palace/);
    expect(refuseRoot(resolve(APP, '../../..'))).toMatch(/is a checkout of this palace/);
  });

  test('refuses a folder that is not there, and says how to make one', () => {
    expect(refuseRoot(resolve(tmpdir(), 'no-such-scratch-palace-' + Date.now()))).toMatch(/add --new/);
  });

  test('makes and takes an empty throwaway palace', () => {
    const parent = mkdtempSync(resolve(tmpdir(), 'scratch-vite-new-'));
    const root = join(parent, 'palace');
    makeScratchPalace(root);
    assertScratchRepo(root);
    expect(readFileSync(join(root, BOARD), 'utf8')).toBe('');
    expect(refuseRoot(root)).toBe(null);
    rmSync(parent, { recursive: true, force: true });
  });
});

describe('two scratch servers at once', () => {
  let dir, env;
  const run = (args, who) => new Promise((ok) => {
    const child = spawn(process.execPath, [SCRIPT, ...args], { env: { ...env, COMMONS_AGENT_SLUG: who }, stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    child.stdout.on('data', (b) => { out += b; });
    child.stderr.on('data', (b) => { out += b; });
    child.on('exit', (code) => ok({ code, out }));
  });
  const portOf = (out) => Number(/http:\/\/127\.0\.0\.1:(\d+)\//.exec(out)[1]);
  const pieceOf = (out) => Number(/piece port (\d+)/.exec(out)[1]);

  beforeAll(() => {
    dir = mkdtempSync(resolve(tmpdir(), 'scratch-vite-test-'));
    const lo = 42000 + Math.floor(Math.random() * 100) * 40;
    // CLAUDE_PID is this test's own process: a server left behind by a crashed run stops with it.
    env = gitFreeEnv({ PALACE_LEASE_DIR: join(dir, 'leases'), PALACE_LEASE_PORTS: `${lo}-${lo + 39}`, CLAUDE_CODE_SESSION_ID: 'scratch-vite-test', CLAUDE_PID: String(process.pid) });
  });
  afterAll(async () => {
    await run(['--stop'], 'holder-a');
    await run(['--stop'], 'holder-b');
    rmSync(dir, { recursive: true, force: true });
  });

  test('each gets its own ports and its own board; a write from the other is refused; --stop reaches only its own', async () => {
    const [a, b] = await Promise.all([
      run(['--root', join(dir, 'palace-a'), '--new', '--detach'], 'holder-a'),
      run(['--root', join(dir, 'palace-b'), '--new', '--detach'], 'holder-b'),
    ]);
    expect(a.code, a.out).toBe(0);
    expect(b.code, b.out).toBe(0);
    const ports = [portOf(a.out), pieceOf(a.out), portOf(b.out), pieceOf(b.out)];
    expect(new Set(ports).size).toBe(4);
    const [pa, , pb] = ports;
    const A = `http://127.0.0.1:${pa}`, B = `http://127.0.0.1:${pb}`;

    const page = await request(A).get('/');
    expect(page.status).toBe(200);
    expect(page.text).toContain('/@vite/client');

    const posted = await request(A).post('/api/persistent').set('Content-Type', 'application/json').send(message('on A'));
    expect(posted.status, JSON.stringify(posted.body)).toBe(200);
    expect(readFileSync(join(dir, 'palace-a', BOARD), 'utf8')).toContain('on A');
    expect(readFileSync(join(dir, 'palace-b', BOARD), 'utf8')).toBe('');

    // A page on the other scratch server is another origin: the guard stands here as on :5173.
    const foreign = await request(A).post('/api/persistent')
      .set('Content-Type', 'application/json').set('Origin', B).set('Sec-Fetch-Site', 'same-site').send(message('from B'));
    expect(foreign.status).toBe(403);

    const crossed = await run(['--stop', String(pa)], 'holder-b');
    expect(crossed.code).toBe(1);
    expect(crossed.out).toMatch(/is not yours: it is stigmergy-vite for holder-a/);
    expect((await request(A).get('/')).status).toBe(200);

    // Each holds a Vite cache of its own, beside its lease, and takes it away when it stops.
    // The cache appears once Vite's dependency scan has written it, a few seconds in.
    const cacheOf = (who, port) => join(dir, 'leases', 'scratch', `vite-cache--${who}--${port}`);
    const until = async (fn, ms) => { const end = Date.now() + ms; while (Date.now() < end) { if (fn()) return true; await new Promise((r) => setTimeout(r, 100)); } return false; };
    expect(await until(() => existsSync(join(cacheOf('holder-a', pa), 'deps')) && existsSync(join(cacheOf('holder-b', pb), 'deps')), 30_000)).toBe(true);

    const stopped = await run(['--stop'], 'holder-b');
    expect(stopped.code, stopped.out).toBe(0);
    expect(stopped.out).toContain(`stopped stigmergy-vite on ${pb}`);
    await expect(request(B).get('/')).rejects.toThrow();
    expect((await request(A).get('/')).status).toBe(200);
    expect(existsSync(join(dir, 'palace-b', BOARD))).toBe(true);
    expect(existsSync(cacheOf('holder-b', pb))).toBe(false);
    expect(existsSync(cacheOf('holder-a', pa))).toBe(true);
  }, 90_000);
});

// A cache left by a server killed outright is swept at the next start, but only this slug's,
// and never one whose port a live lease still holds.
test('a start sweeps this slug’s stale Vite caches and keeps the rest', async () => {
  const dir = mkdtempSync(resolve(tmpdir(), 'scratch-vite-sweep-'));
  const lo = 43000 + Math.floor(Math.random() * 100) * 20;
  const env = gitFreeEnv({ PALACE_LEASE_DIR: join(dir, 'leases'), PALACE_LEASE_PORTS: `${lo}-${lo + 19}`, COMMONS_AGENT_SLUG: 'sweeper', CLAUDE_CODE_SESSION_ID: 'sweep-test' });
  const lease = await acquire({ names: ['app'], kind: KIND, env });
  const scratch = join(dir, 'leases', 'scratch');
  const made = [`vite-cache--sweeper--${lo + 19}`, `vite-cache--sweeper--${lease.ports.app}`, `vite-cache--someone--${lo + 19}`, 'stigmergy-vite--sweeper--x.log'];
  for (const name of made) mkdirSync(join(scratch, name), { recursive: true });
  expect(sweepCaches(env)).toEqual([`vite-cache--sweeper--${lo + 19}`]);
  expect(made.filter((name) => existsSync(join(scratch, name)))).toEqual(made.slice(1));
  lease.release();
  rmSync(dir, { recursive: true, force: true });
});

// The worktree's own board is never the scratch board.
test('a scratch run leaves this checkout’s board alone', () => {
  const status = execFileSync('git', ['status', '--porcelain', '--', BOARD], { cwd: resolve(APP, '../../..'), env: gitFreeEnv(), encoding: 'utf8' });
  expect(status).toBe('');
});
