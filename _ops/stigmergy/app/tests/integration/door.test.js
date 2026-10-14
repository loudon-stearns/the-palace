// The door (server/door.js): one lock every palace committer passes through.
// These run real git in throwaway repos: many writers at once, a committer
// killed mid-commit, the trunk's refusals, the board's tail, and the ear.

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, chmodSync, copyFileSync, appendFileSync } from 'node:fs';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { trunkProblem, withDoorSync } from '../../server/door.js';
import { commitSelected } from '../../server/commit.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, '..', '..');
const CLI = join(APP_ROOT, 'scripts', 'palace-commit.mjs');
const DOOR = join(APP_ROOT, 'server', 'door.js');
const EAR = join(APP_ROOT, 'scripts', 'ear.sh');
const INSTALL = join(APP_ROOT, 'scripts', 'install-hooks.mjs');

let root;
function g(...args) { return execFileSync('git', args, { cwd: root, encoding: 'utf8' }); }
function cliArgs(file, extra = []) {
  return [CLI, '--kind', 'edit', '--scope', file, '--summary', `touch ${file}`, '--verify', 'verified', '--path', file, ...extra];
}
function runCli(args, env = {}) {
  return spawnSync('node', args, { cwd: root, encoding: 'utf8', env: { ...process.env, PALACE_ROOT: root, PALACE_DOOR_NO_BOARD: '1', ...env } });
}
function runCliAsync(args, env = {}) {
  return new Promise((done) => {
    const t0 = Date.now();
    const c = spawn('node', args, { cwd: root, env: { ...process.env, PALACE_ROOT: root, PALACE_DOOR_NO_BOARD: '1', ...env } });
    let out = '';
    let err = '';
    c.stdout.on('data', (b) => { out += b; });
    c.stderr.on('data', (b) => { err += b; });
    c.on('close', (status) => done({ status, stdout: out, stderr: err, ms: Date.now() - t0 }));
  });
}
// A separate process that holds the door for `ms` milliseconds.
function holdDoor(ms) {
  const code = `import { withDoorSync } from ${JSON.stringify(DOOR)};
    withDoorSync(${JSON.stringify(root)}, 'test-holder', () => {
      process.stdout.write('held\\n');
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ${ms});
    });`;
  const c = spawn('node', ['--input-type=module', '-e', code], { cwd: root });
  return new Promise((ready) => { c.stdout.on('data', () => ready(c)); });
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'palacedoor-'));
  g('init', '-q', '-b', 'main');
  g('config', 'user.email', 'test@palace');
  g('config', 'user.name', 'Test Palace');
  g('config', 'commit.gpgsign', 'false');
  writeFileSync(join(root, 'seed.md'), 'seed\n');
  g('add', '-A');
  g('commit', '-q', '-m', 'ops(seed): seed\n\nPalace-Kind: ops\nPalace-Verify: verified');
});
afterEach(() => { rmSync(root, { recursive: true, force: true }); });

describe('the trunk\'s refusals', () => {
  test('the main checkout on main, with nothing half done, is fine', () => {
    expect(trunkProblem(root)).toBeNull();
  });

  test('the main checkout moved off main is refused, and says how to get back', () => {
    g('switch', '-q', '-c', 'side');
    expect(trunkProblem(root)).toMatch(/is on "side", not main/);
    writeFileSync(join(root, 'a.md'), 'a\n');
    const r = runCli(cliArgs('a.md'));
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/refused: .*not main/);
    expect(g('log', '--format=%s').split('\n')).not.toContain('edit(a.md): touch a.md');
    expect(g('diff', '--cached', '--name-only').trim()).toBe(''); // nothing staged
  });

  test('a linked worktree on its own branch is where branch work lives: allowed', () => {
    const wt = join(root, '..', `${root.split('/').pop()}-wt`);
    g('worktree', 'add', '-q', '-b', 'feature', wt);
    try {
      expect(trunkProblem(wt)).toBeNull();
    } finally {
      g('worktree', 'remove', '--force', wt);
    }
  });

  test('a half-done merge is refused with the way back', () => {
    g('switch', '-q', '-c', 'other');
    writeFileSync(join(root, 'seed.md'), 'other side\n');
    g('commit', '-q', '-am', 'other');
    g('switch', '-q', 'main');
    writeFileSync(join(root, 'seed.md'), 'main side\n');
    g('commit', '-q', '-am', 'main');
    spawnSync('git', ['merge', 'other'], { cwd: root }); // conflicts, leaves MERGE_HEAD
    expect(trunkProblem(root)).toMatch(/a merge is half done.*git merge --abort/);
  });
});

describe('the committer\'s own refusals', () => {
  test('no --path: refused, nothing staged or committed', () => {
    writeFileSync(join(root, 'a.md'), 'a\n');
    g('add', 'a.md');
    const head = g('rev-parse', 'HEAD').trim();
    const r = runCli([CLI, '--kind', 'edit', '--summary', 'x', '--verify', 'verified']);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/name what you are committing with --path/);
    expect(g('rev-parse', 'HEAD').trim()).toBe(head);
  });

  test('an unknown flag is refused, with a hint for the old --paths mistake', () => {
    writeFileSync(join(root, 'a.md'), 'a\n');
    const r = runCli([CLI, '--kind', 'deposit', '--summary', 'x', '--verify', 'verified', '--paths', 'a.md']);
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/unknown flag --paths.*Did you mean --path/s);
  });
});

describe('waiting at the door', () => {
  test('a committer that finds the door shut waits its turn, then commits', async () => {
    writeFileSync(join(root, 'a.md'), 'a\n');
    const holder = await holdDoor(1500);
    const r = await runCliAsync(cliArgs('a.md'));
    holder.kill();
    expect(r.status).toBe(0);
    expect(r.ms).toBeGreaterThan(900);
    expect(g('log', '-1', '--format=%s').trim()).toBe('edit(a.md): touch a.md');
  }, 20_000);

  test('past its time limit it gives up with exit 75, nothing staged', async () => {
    writeFileSync(join(root, 'a.md'), 'a\n');
    const holder = await holdDoor(4000);
    const r = await runCliAsync(cliArgs('a.md'), { PALACE_DOOR_TIMEOUT_MS: '500' });
    holder.kill();
    expect(r.status).toBe(75);
    expect(r.stderr).toMatch(/could not lock the door: test-holder/);
    expect(g('diff', '--cached', '--name-only').trim()).toBe('');
  }, 20_000);
});

describe('many writers at once', () => {
  test('twelve commits racing (eight CLI, four server) all land; a stranger\'s staged and unsaved work is untouched', async () => {
    // Another session's work: one file staged, one file edited and not staged.
    writeFileSync(join(root, 'stranger-staged.md'), 'staged by someone else\n');
    g('add', 'stranger-staged.md');
    writeFileSync(join(root, 'seed.md'), 'someone else is editing this\n');

    const cliFiles = Array.from({ length: 8 }, (_, i) => `cli-${i}.md`);
    const srvFiles = Array.from({ length: 4 }, (_, i) => `srv-${i}.md`);
    for (const f of [...cliFiles, ...srvFiles]) writeFileSync(join(root, f), `${f}\n`);

    const results = await Promise.all([
      ...cliFiles.map((f) => runCliAsync(cliArgs(f))),
      ...srvFiles.map((f) => commitSelected(root, { paths: [f], kind: 'edit', summary: `touch ${f}`, verify: 'verified', author: 'claude' })),
    ]);
    for (const r of results.slice(0, 8)) expect(r.status, r.stderr).toBe(0);
    for (const r of results.slice(8)) expect(r.ok, r.error).toBe(true);

    const subjects = g('log', '--format=%s').split('\n');
    for (const f of [...cliFiles, ...srvFiles]) expect(subjects).toContain(`edit${f.startsWith('cli') ? `(${f})` : ''}: touch ${f}`);
    // The stranger's staged file stayed staged and out of every commit.
    expect(g('diff', '--cached', '--name-only').trim()).toBe('stranger-staged.md');
    expect(g('log', '--all', '--format=%H', '--', 'stranger-staged.md').trim()).toBe('');
    // The unsaved edit is still unsaved, and nothing else is out of place.
    const status = g('status', '--porcelain=v1').split('\n').filter(Boolean).sort();
    expect(status).toEqual([' M seed.md', 'A  stranger-staged.md']);
  }, 60_000);
});

describe('a committer killed mid-commit', () => {
  test('its git keeps the door until it finishes, so the next committer waits instead of racing', async () => {
    // A slow commit: the commit-msg hook takes two seconds.
    const hook = join(root, '.git', 'hooks', 'commit-msg');
    writeFileSync(hook, '#!/bin/sh\nsleep 2\nexit 0\n');
    chmodSync(hook, 0o755);
    writeFileSync(join(root, 'a.md'), 'a\n');
    writeFileSync(join(root, 'b.md'), 'b\n');

    const a = spawn('node', cliArgs('a.md'), { cwd: root, env: { ...process.env, PALACE_ROOT: root, PALACE_DOOR_NO_BOARD: '1' } });
    await new Promise((s) => setTimeout(s, 900)); // A is inside git commit, in the hook
    a.kill('SIGKILL');
    const b = await runCliAsync(cliArgs('b.md'));
    expect(b.status, b.stderr).toBe(0);
    expect(b.ms).toBeGreaterThan(500); // it waited for A's orphaned git
    const subjects = g('log', '--format=%s').split('\n');
    expect(subjects).toContain('edit(a.md): touch a.md');
    expect(subjects).toContain('edit(b.md): touch b.md');
    expect(g('status', '--porcelain=v1').trim()).toBe('');
  }, 30_000);
});

describe('the board\'s tail', () => {
  const BOARD = '_ops/swarm/persistent/blackboard.jsonl';
  beforeEach(() => {
    mkdirSync(join(root, dirname(BOARD)), { recursive: true });
    writeFileSync(join(root, BOARD), `${JSON.stringify({ id: 'x0', ts: new Date().toISOString() })}\n`);
    g('add', BOARD);
    g('commit', '-q', '-m', 'ops(board): seed\n\nPalace-Kind: ops\nPalace-Verify: verified');
  });

  test('lines that sat over half an hour ride the next pass through the door', () => {
    appendFileSync(join(root, BOARD), `${JSON.stringify({ id: 'x1', ts: new Date(Date.now() - 45 * 60_000).toISOString() })}\n`);
    writeFileSync(join(root, 'a.md'), 'a\n');
    const r = runCli(cliArgs('a.md'), { PALACE_DOOR_NO_BOARD: '0' });
    expect(r.status, r.stderr).toBe(0);
    expect(r.stdout).toMatch(/also committed the board's tail/);
    expect(g('log', '-1', '--format=%s').trim()).toMatch(/^ops\(board\): 1 board line that sat uncommitted for 4\d min$/);
    expect(g('status', '--porcelain=v1').trim()).toBe('');
  });

  test('fresh lines are left for their own writer', () => {
    appendFileSync(join(root, BOARD), `${JSON.stringify({ id: 'x1', ts: new Date().toISOString() })}\n`);
    writeFileSync(join(root, 'a.md'), 'a\n');
    const r = runCli(cliArgs('a.md'), { PALACE_DOOR_NO_BOARD: '0' });
    expect(r.status).toBe(0);
    expect(g('log', '-1', '--format=%s').trim()).toBe('edit(a.md): touch a.md');
    expect(g('status', '--porcelain=v1').replace(/\n$/, '')).toBe(` M ${BOARD}`);
  });
});

describe('the ear', () => {
  beforeEach(() => {
    // The shim runs the main checkout's copy of ear.sh; give this repo one.
    mkdirSync(join(root, '_ops', 'stigmergy', 'app', 'scripts'), { recursive: true });
    copyFileSync(EAR, join(root, '_ops', 'stigmergy', 'app', 'scripts', 'ear.sh'));
    const r = spawnSync('node', [INSTALL, '--ear'], { cwd: root, encoding: 'utf8' });
    expect(r.status, r.stderr).toBe(0);
  });

  test('it hears a move through the door and a move around it, and never blocks either', () => {
    writeFileSync(join(root, 'a.md'), 'a\n');
    expect(runCli(cliArgs('a.md'), { CLAUDE_CODE_SESSION_ID: 'sess-door' }).status).toBe(0);
    writeFileSync(join(root, 'b.md'), 'b\n');
    g('add', 'b.md');
    g('commit', '-q', '-m', 'raw commit around the door');

    const lines = readFileSync(join(root, '.git', 'palace-ear.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    const mainMoves = lines.filter((l) => l.ref === 'refs/heads/main');
    expect(mainMoves.length).toBeGreaterThanOrEqual(2);
    const door = mainMoves.find((l) => l.via === 'door');
    const around = mainMoves.find((l) => l.via === 'around');
    expect(door).toMatchObject({ tag: 'palace-commit', session: 'sess-door' });
    expect(around.new).toBe(g('rev-parse', 'HEAD').trim());
  });

  test('a broken ear still lets every commit through', () => {
    writeFileSync(join(root, '_ops', 'stigmergy', 'app', 'scripts', 'ear.sh'), '#!/bin/sh\nexit 1\n');
    writeFileSync(join(root, 'c.md'), 'c\n');
    g('add', 'c.md');
    g('commit', '-q', '-m', 'commit with a broken ear');
    expect(g('log', '-1', '--format=%s').trim()).toBe('commit with a broken ear');
  });

  test('the installer will not overwrite someone else\'s hook', () => {
    const hook = join(root, '.git', 'hooks', 'reference-transaction');
    writeFileSync(hook, '#!/bin/sh\nexit 0\n# someone else\'s\n');
    const r = spawnSync('node', [INSTALL, '--ear'], { cwd: root, encoding: 'utf8' });
    expect(r.status).toBe(1);
    expect(readFileSync(hook, 'utf8')).toMatch(/someone else/);
    expect(existsSync(hook)).toBe(true);
  });
});

describe('the door in one process', () => {
  test('withDoorSync hands git the lock and returns what the work returns', () => {
    const out = withDoorSync(root, 'unit', (git) => git(['rev-parse', '--abbrev-ref', 'HEAD']).trim());
    expect(out).toBe('main');
    expect(existsSync(join(root, '.git', 'palace-door.holder'))).toBe(false); // the courtesy note is cleared
  });
});
