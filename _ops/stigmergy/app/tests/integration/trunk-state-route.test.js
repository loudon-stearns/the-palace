// GET /api/trunk-state (server/api/log.js): the trunk for the LOG deck's strip,
// read by scripts/trunk-state.mjs and held for 30 s. Checked against the
// script's own --json on a throwaway repo with a bare origin, never the palace.
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import http from 'node:http';
import { mkdtempSync, rmSync, writeFileSync, appendFileSync, mkdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { listen, closeAll } from '../helpers/loopback.js';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';
import { blackboardMiddleware } from '../../server/middleware.js';
import { readTrunkState, TRUNK_TTL_MS } from '../../server/api/log.js';

const TS = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'scripts', 'trunk-state.mjs');
const g = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8', env: gitFreeEnv() });

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

// The fields that are an age or a time of reading, so two reads a moment apart differ there.
function settled(s) {
  const { ts: _ts, since: _since, ...rest } = s;
  const { oldestMs: _o, ...remote } = rest.remote;
  const { heardFromMs: _h, ...ear } = rest.ear;
  return { ...rest, remote, ear };
}

let base;
let root;
let url;
beforeEach(async () => {
  base = mkdtempSync(join(tmpdir(), 'trunkroute-'));
  const origin = join(base, 'remote.git');
  g(base, 'init', '-q', '--bare', '-b', 'main', origin);
  assertScratchRepo(origin, base);
  root = join(base, 'palace');
  g(base, 'init', '-q', '-b', 'main', root);
  assertScratchRepo(root, base);
  g(root, 'config', 'user.email', 't@t');
  g(root, 'config', 'user.name', 't');
  g(root, 'config', 'commit.gpgsign', 'false');
  mkdirSync(join(root, '_ops', 'swarm', 'persistent'), { recursive: true });
  writeFileSync(join(root, '_ops', 'swarm', 'persistent', 'blackboard.jsonl'), '');
  writeFileSync(join(root, 'a.md'), 'a\n');
  g(root, 'add', '-A');
  g(root, 'commit', '-qm', 'ops(seed): seed');
  g(root, 'remote', 'add', 'origin', origin);
  g(root, 'push', '-q', '-u', 'origin', 'main');
  // One commit unsent, two moves of main heard (one through the door, one
  // around it), a file unsaved under Projects/, and a branch with work off main.
  writeFileSync(join(root, 'b.md'), 'b\n');
  g(root, 'add', 'b.md');
  g(root, 'commit', '-qm', 'edit(B): b');
  const now = new Date().toISOString();
  appendFileSync(join(root, '.git', 'palace-ear.jsonl'), `${JSON.stringify({ ts: now, ref: 'refs/heads/main', old: 'a', new: 'b', via: 'door', tag: 'palace-commit' })}\n${JSON.stringify({ ts: now, ref: 'refs/heads/main', old: 'b', new: 'c', via: 'around', caller: 'zsh', cwd: root })}\n`);
  g(root, 'switch', '-q', '-c', 'side');
  writeFileSync(join(root, 'c.md'), 'c\n');
  g(root, 'add', 'c.md');
  g(root, 'commit', '-qm', 'edit(C): c');
  g(root, 'switch', '-q', 'main');
  mkdirSync(join(root, 'Projects', 'P'), { recursive: true });
  writeFileSync(join(root, 'Projects', 'P', 'x.md'), 'unsaved\n');
  url = await listen(makeServer(root));
});
afterEach(async () => { await closeAll(); rmSync(base, { recursive: true, force: true }); });

describe('GET /api/trunk-state', () => {
  test('serves what trunk-state --json --no-writers prints, and changes nothing', async () => {
    const before = { status: g(root, 'status', '--porcelain=v1'), refs: g(root, 'for-each-ref'), head: g(root, 'rev-parse', 'HEAD') };
    const res = await request(url).get('/api/trunk-state');
    expect(res.status, JSON.stringify(res.body)).toBe(200);
    const s = res.body;
    expect(s.remote.ahead).toBe(1);
    expect(s.ear).toMatchObject({ moves: 2, door: 1 });
    expect(s.ear.around).toHaveLength(1);
    expect(s.marker).toBeNull();
    expect(s.unsaved.map((u) => u.path)).toEqual(['Projects/']);
    expect(s.unsaved[0].writer).toBeNull(); // no writer search
    expect(s.branches).toBe(1);
    expect(s.unmerged).toEqual(['side']);
    expect(Date.parse(s.since)).toBeLessThan(Date.parse(s.ts) - 23.9 * 3600000); // --since 24h
    expect(Date.now() - Date.parse(s.ts)).toBeLessThan(TRUNK_TTL_MS);

    const cli = spawnSync('node', [TS, '--json', '--no-writers', '--since', '24h'], { cwd: root, encoding: 'utf8', env: gitFreeEnv() });
    expect(cli.status, cli.stderr).toBe(0);
    expect(settled(s)).toEqual(settled(JSON.parse(cli.stdout)));

    expect(g(root, 'status', '--porcelain=v1')).toBe(before.status);
    expect(g(root, 'for-each-ref')).toBe(before.refs);
    expect(g(root, 'rev-parse', 'HEAD')).toBe(before.head);
  });

  test('holds one read for 30 s, then reads again', async () => {
    const first = (await request(url).get('/api/trunk-state')).body;
    writeFileSync(join(root, 'late.md'), 'late\n');
    const again = (await request(url).get('/api/trunk-state')).body;
    expect(again.ts).toBe(first.ts);
    expect(again.unsaved.map((u) => u.path)).toEqual(['Projects/']);
    const fresh = await readTrunkState(root, { now: Date.now() + TRUNK_TTL_MS + 1000 });
    expect(fresh.ts).not.toBe(first.ts);
    expect(fresh.unsaved.map((u) => u.path).sort()).toEqual(['Projects/', 'late.md']);
  });

  test('callers that arrive while a read runs share it', async () => {
    const [a, b] = await Promise.all([request(url).get('/api/trunk-state'), request(url).get('/api/trunk-state')]);
    expect(a.status).toBe(200);
    expect(b.body.ts).toBe(a.body.ts);
  });
});
