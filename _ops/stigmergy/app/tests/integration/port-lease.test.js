import { describe, test, expect, beforeEach, afterEach, afterAll } from 'vitest';
import net from 'node:net';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gitFreeEnv } from '../helpers/git-env.js';
import {
  acquire, list, stop, holder, isMine, agentSlug, holderState, answers, LeaseError,
} from '../../../../commons/port-lease.mjs';

// The port lease (_ops/commons/port-lease.mjs): a kernel lock per port, held by
// the server's own process, so several Claudes starting previews at once never
// share a port, and list and stop reach only your own. Every holder here is a
// real process on a temp lease folder and a port block of its own, never the
// shared leases in the git common dir and never the live servers' ports.

const HERE = dirname(fileURLToPath(import.meta.url));
const LEASE = resolve(HERE, '../../../../commons/port-lease.mjs');
const OPS = resolve(HERE, '../../../..');

// A block of 40 ports of its own, well below the ephemeral range, per test.
const block = () => { const lo = 40000 + Math.floor(Math.random() * 200) * 40; return [lo, lo + 39]; };

let dir, range, env, kids, servers;
beforeEach(() => {
  dir = mkdtempSync(resolve(tmpdir(), 'port-lease-test-'));
  range = block();
  env = gitFreeEnv({ PALACE_LEASE_DIR: dir, PALACE_LEASE_PORTS: range.join('-'), COMMONS_AGENT_SLUG: 'tester', CLAUDE_CODE_SESSION_ID: 'session-test' });
  delete env.CLAUDE_PID;
  kids = [];
  servers = [];
});
afterEach(async () => {
  for (const k of kids) { try { k.kill('SIGKILL'); } catch { /* gone */ } }
  await Promise.all(servers.map((s) => new Promise((done) => s.close(done))));
  rmSync(dir, { recursive: true, force: true });
});

// A holder in a process of its own: leases `names`, prints its ports, holds them until killed.
function holderProcess(names, extra = {}) {
  const code = `
    import { acquire } from ${JSON.stringify(LEASE)};
    const l = await acquire({ names: ${JSON.stringify(names)}, kind: 'probe' });
    console.log(JSON.stringify(l.ports));
    process.on('SIGTERM', () => process.exit(0));
    setInterval(() => {}, 1000);
  `;
  const child = spawn(process.execPath, ['--input-type=module', '-e', code], { env: { ...env, ...extra }, stdio: ['ignore', 'pipe', 'pipe'] });
  kids.push(child);
  return new Promise((ok, fail) => {
    let out = '', err = '';
    child.stdout.on('data', (b) => { out += b; const line = out.split('\n')[0]; if (out.includes('\n')) ok({ child, ports: JSON.parse(line) }); });
    child.stderr.on('data', (b) => { err += b; });
    child.on('exit', (c) => fail(new Error(`holder exited ${c}: ${err}`)));
  });
}

const until = async (fn, ms = 5000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await fn()) return true; await new Promise((r) => setTimeout(r, 50)); } return false; };

describe('the lease', () => {
  test('eight processes leasing at once hold sixteen different ports', async () => {
    const got = await Promise.all(Array.from({ length: 8 }, () => holderProcess(['page', 'piece'])));
    const ports = got.flatMap((g) => Object.values(g.ports));
    expect(ports).toHaveLength(16);
    expect(new Set(ports).size).toBe(16);
    for (const p of ports) { expect(p).toBeGreaterThanOrEqual(range[0]); expect(p).toBeLessThanOrEqual(range[1]); }
  }, 30_000);

  test('one process leasing twice gets two ports, and its own lease is not handed out again', async () => {
    const a = await acquire({ names: ['x'], kind: 'probe', env });
    const b = await acquire({ names: ['y'], kind: 'probe', env });
    expect(a.ports.x).not.toBe(b.ports.y);
    a.release(); b.release();
  });

  test('a port something answers on, at 127.0.0.1 or only at [::1], is passed over', async () => {
    // The scratch-Vite trap: the live server answers on [::1] alone, and a look at 127.0.0.1 calls it free.
    const v4 = net.createServer(); const v6 = net.createServer();
    servers.push(v4, v6);
    await new Promise((ok) => v4.listen(range[0], '127.0.0.1', ok));
    let v6Up = true;
    await new Promise((ok) => { v6.once('error', () => { v6Up = false; ok(); }); v6.listen(range[0] + 1, '::1', ok); });
    expect(await answers(range[0])).toBe(true);
    if (v6Up) expect(await answers(range[0] + 1)).toBe(true);
    const l = await acquire({ names: ['p'], kind: 'probe', env });
    expect(l.ports.p).toBe(v6Up ? range[0] + 2 : range[0] + 1);
    l.release();
    if (!v6Up) console.warn('[port-lease] no IPv6 loopback here; the [::1] case was not exercised');
  });

  test('a holder killed outright frees its ports at once, and its note no longer lists', async () => {
    const { child, ports } = await holderProcess(['page']);
    expect(list({ all: true, env }).map((n) => n.port)).toEqual([ports.page]);
    child.kill('SIGKILL');
    await until(() => child.exitCode !== null || child.signalCode !== null);
    expect(list({ all: true, env })).toEqual([]);
    const next = await acquire({ names: ['page'], kind: 'probe', env });
    expect(next.ports.page).toBe(ports.page);
    expect(JSON.parse(readFileSync(join(dir, `port-${ports.page}.json`), 'utf8')).pid).toBe(process.pid);
    next.release();
    expect(existsSync(join(dir, `port-${ports.page}.json`))).toBe(false);
  }, 15_000);

  test('an exact port that is leased is refused, naming who holds it', async () => {
    const { ports } = await holderProcess(['page'], { COMMONS_AGENT_SLUG: 'someone-else' });
    await expect(acquire({ names: ['page'], kind: 'probe', port: ports.page, env })).rejects.toThrow(/leased to probe for someone-else/);
  }, 15_000);

  test('a range with nothing left says where the leases are', async () => {
    const tight = { ...env, PALACE_LEASE_PORTS: `${range[0]}-${range[0]}` };
    const a = await acquire({ names: ['a'], kind: 'probe', env: tight });
    await expect(acquire({ names: ['b'], kind: 'probe', env: tight })).rejects.toBeInstanceOf(LeaseError);
    a.release();
  });

  test('renew lets a lost port go and leases the next', async () => {
    const l = await acquire({ names: ['page'], kind: 'probe', env });
    const first = l.ports.page;
    const second = await l.renew('page');
    expect(second).not.toBe(first);
    expect(list({ env }).map((n) => n.port)).toEqual([second]);
    l.release();
  });
});

describe('list and stop reach only your own', () => {
  test('list shows your leases; --all shows everyone’s, marked', async () => {
    await holderProcess(['page']);
    await holderProcess(['page'], { COMMONS_AGENT_SLUG: 'other-agent' });
    await holderProcess(['page'], { CLAUDE_CODE_SESSION_ID: 'another-session' }); // same checkout, another session
    expect(list({ env }).map((n) => n.slug + '/' + n.session)).toEqual(['tester/session-test']);
    const all = list({ all: true, env });
    expect(all).toHaveLength(3);
    expect(all.filter((n) => n.mine)).toHaveLength(1);
  }, 15_000);

  test('stop signals your server and leaves another holder’s, even asked by port', async () => {
    const mine = await holderProcess(['page', 'piece']);
    const theirs = await holderProcess(['page'], { COMMONS_AGENT_SLUG: 'other-agent' });
    const refusedByPort = await stop({ port: theirs.ports.page, env });
    expect(refusedByPort.stopped).toEqual([]);
    expect(refusedByPort.refused[0].why).toMatch(/not yours: it is probe for other-agent/);
    const r = await stop({ env });
    expect(r.stopped.map((n) => n.port).sort()).toEqual(Object.values(mine.ports).sort());
    expect(r.refused).toEqual([]);
    expect(await until(() => mine.child.exitCode !== null)).toBe(true);
    expect(theirs.child.exitCode).toBe(null);
    expect(list({ all: true, env }).map((n) => n.slug)).toEqual(['other-agent']);
  }, 20_000);

  test('a note whose pid now belongs to a process started at another time is gone, and is never signalled', async () => {
    const bystander = spawn('sleep', ['30']);
    kids.push(bystander);
    const port = range[0] + 5;
    const me = holder(env);
    writeFileSync(join(dir, `port-${port}.json`), JSON.stringify({
      port, name: 'page', kind: 'probe', slug: me.slug, session: me.session,
      pid: bystander.pid, started: new Date(Date.now() - 3600_000).toISOString(),
    }));
    expect(holderState(JSON.parse(readFileSync(join(dir, `port-${port}.json`), 'utf8')))).toBe('gone');
    const r = await stop({ env });
    expect(r.stopped).toEqual([]);
    expect(bystander.exitCode).toBe(null);
    expect(bystander.signalCode).toBe(null);
  });

  test('isMine needs the same slug and the same session', () => {
    const me = { slug: 'a', session: 's' };
    expect(isMine({ slug: 'a', session: 's' }, me)).toBe(true);
    expect(isMine({ slug: 'a', session: 't' }, me)).toBe(false);
    expect(isMine({ slug: 'a', session: null }, me)).toBe(false);
    expect(isMine({ slug: 'b', session: 's' }, me)).toBe(false);
    expect(isMine({ slug: 'a', session: null }, { slug: 'a', session: null })).toBe(true);
  });
});

describe('a server leaves with its session', () => {
  test('a rich preview started for a session stops when that session’s process ends', async () => {
    const session = spawn('sleep', ['60']);
    kids.push(session);
    const root = mkdtempSync(resolve(tmpdir(), 'port-lease-root-'));
    execFileSync('git', ['init', '-q'], { cwd: root, env: gitFreeEnv() });
    const child = spawn(process.execPath, [resolve(OPS, 'rich-face/rich-server.mjs'), '--root', root], {
      env: { ...env, CLAUDE_PID: String(session.pid), PALACE_LEASE_WATCH_MS: '200' }, stdio: ['ignore', 'pipe', 'pipe'],
    });
    kids.push(child);
    let out = '';
    child.stdout.on('data', (b) => { out += b; });
    expect(await until(() => out.includes('rich face up'), 10_000)).toBe(true);
    // One preview, two leases: its page and its pieces' origin.
    expect(list({ env }).map((n) => n.name).sort()).toEqual(['page', 'piece']);
    session.kill('SIGKILL');
    expect(await until(() => child.exitCode !== null, 10_000)).toBe(true);
    expect(out).toMatch(/stopping: its session ended/);
    expect(list({ all: true, env })).toEqual([]);
    rmSync(root, { recursive: true, force: true });
  }, 30_000);
});

let python = true;
try { execFileSync('python3', ['-c', 'import sys'], { stdio: 'ignore' }); } catch { python = false; }
if (!python) console.warn('[port-lease] SKIPPED slug parity — no python3 on this machine');

describe.skipIf(!python)('the holder is named by the Commons rule', () => {
  // identity.py is the one definition of the slug; port-lease.mjs restates it in JS. Held to one answer here.
  const cases = [
    {},
    { COMMONS_AGENT_SLUG: '  Lane C: Preview Leases!! ' },
    { RUNPOD_AGENT_SLUG: 'gpu__Worker' },
    { COMMONS_AGENT_SLUG: 'x'.repeat(40) },
    { COMMONS_AGENT_SLUG: '---' },
  ];
  test.each(cases)('slug for %o matches python3 -m commons whoami', (extra) => {
    const e = { ...gitFreeEnv(), ...extra };
    if (!('COMMONS_AGENT_SLUG' in extra)) delete e.COMMONS_AGENT_SLUG;
    if (!('RUNPOD_AGENT_SLUG' in extra)) delete e.RUNPOD_AGENT_SLUG;
    const out = execFileSync('python3', ['-m', 'commons', 'whoami'], { cwd: OPS, env: e, encoding: 'utf8' });
    const py = /slug\s*=\s*(\S+)/.exec(out)[1];
    expect(agentSlug(e)).toBe(py);
  });
});

afterAll(() => { for (const k of kids || []) { try { k.kill('SIGKILL'); } catch { /* gone */ } } });
