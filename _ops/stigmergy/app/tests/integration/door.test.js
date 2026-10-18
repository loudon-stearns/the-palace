// The door (server/door.js): one lock every palace committer passes through.
// These run real git in throwaway repos: many writers at once, a committer
// killed mid-commit, the trunk's refusals, the board's tail, and the ear.

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, chmodSync, copyFileSync, appendFileSync, symlinkSync } from 'node:fs';
import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { trunkProblem, withDoorSync, doorEnv } from '../../server/door.js';
import { commitPathsAsync, isRetryable } from '../../../orchestrator/src/cycle-commit.js';
import { randomBytes } from 'node:crypto';
import { commitSelected } from '../../server/commit.js';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, '..', '..');
const CLI = join(APP_ROOT, 'scripts', 'palace-commit.mjs');
const DOOR = join(APP_ROOT, 'server', 'door.js');
const EAR = join(APP_ROOT, 'scripts', 'ear.sh');
const INSTALL = join(APP_ROOT, 'scripts', 'install-hooks.mjs');

let root;
function g(...args) { return execFileSync('git', args, { cwd: root, encoding: 'utf8', env: gitFreeEnv() }); }
function cliArgs(file, extra = []) {
  return [CLI, '--kind', 'edit', '--scope', file, '--summary', `touch ${file}`, '--verify', 'verified', '--path', file, ...extra];
}
function runCli(args, env = {}) {
  return spawnSync('node', args, { cwd: root, encoding: 'utf8', env: gitFreeEnv({ PALACE_ROOT: root, PALACE_DOOR_NO_BOARD: '1', ...env }) });
}
function runCliAsync(args, env = {}) {
  return new Promise((done) => {
    const t0 = Date.now();
    const c = spawn('node', args, { cwd: root, env: gitFreeEnv({ PALACE_ROOT: root, PALACE_DOOR_NO_BOARD: '1', ...env }) });
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
  const c = spawn('node', ['--input-type=module', '-e', code], { cwd: root, env: gitFreeEnv() });
  return new Promise((ready) => { c.stdout.on('data', () => ready(c)); });
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'palacedoor-'));
  g('init', '-q', '-b', 'main');
  assertScratchRepo(root);
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
    spawnSync('git', ['merge', 'other'], { cwd: root, env: gitFreeEnv() }); // conflicts, leaves MERGE_HEAD
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
    // It drops a marker on entry, so the test kills A only once A is truly
    // inside git commit (a fixed wait lost that race under a loaded machine).
    const hook = join(root, '.git', 'hooks', 'commit-msg');
    const inHook = join(root, '.git', 'in-hook');
    writeFileSync(hook, `#!/bin/sh\ntouch '${inHook}'\nsleep 2\nexit 0\n`);
    chmodSync(hook, 0o755);
    writeFileSync(join(root, 'a.md'), 'a\n');
    writeFileSync(join(root, 'b.md'), 'b\n');

    const a = spawn('node', cliArgs('a.md'), { cwd: root, env: gitFreeEnv({ PALACE_ROOT: root, PALACE_DOOR_NO_BOARD: '1' }) });
    for (let waited = 0; !existsSync(inHook) && waited < 15_000; waited += 25) await new Promise((s) => setTimeout(s, 25));
    expect(existsSync(inHook)).toBe(true);
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
    const r = spawnSync('node', [INSTALL, '--ear'], { cwd: root, encoding: 'utf8', env: gitFreeEnv() });
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
    const r = spawnSync('node', [INSTALL, '--ear'], { cwd: root, encoding: 'utf8', env: gitFreeEnv() });
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

// ── Fixes from the independent review of 2026-10-14 ──────────────────────────

describe('the review\'s findings, fixed', () => {
  test('a server cycle commit finishes while the server itself holds the door, and the server never blocks', async () => {
    writeFileSync(join(root, 'deck.md'), 'deck edit\n');
    mkdirSync(join(root, 'Bundle'));
    writeFileSync(join(root, 'Bundle', 'x.txt'), 'cycle output\n');
    let ticks = 0;
    const timer = setInterval(() => { ticks += 1; }, 20);
    const t0 = Date.now();
    const [saved, cycle] = await Promise.all([
      commitSelected(root, { paths: ['deck.md'], kind: 'edit', summary: 'deck save', verify: 'verified', author: 'loudon' }),
      commitPathsAsync({ palaceRoot: root, paths: ['Bundle/x.txt'], scope: 'Bundle', summary: 'cycle 1 — x', retries: 0 }),
    ]);
    clearInterval(timer);
    expect(saved.ok, saved.error).toBe(true);
    expect(cycle.ok, cycle.error).toBe(true);
    expect(ticks).toBeGreaterThan(Math.floor((Date.now() - t0) / 20) / 3); // the event loop kept running
    const subjects = g('log', '--format=%s').split('\n');
    expect(subjects).toContain('edit: deck save');
    expect(subjects).toContain('steward(Bundle): cycle 1 — x');
  }, 60_000);

  test('a door timeout is not retried: the committer already waited its full time', () => {
    expect(isRetryable('palace-commit: could not lock the door: commit:loudon (pid 1) has held it longer than 120s.')).toBe(false);
    expect(isRetryable("fatal: Unable to create '/x/.git/index.lock': File exists.")).toBe(true);
    expect(isRetryable('palace-commit: could not lock the index: .git/index.lock is held')).toBe(true);
  });

  test('git started inside the door runs no background maintenance or fsmonitor', () => {
    const env = doorEnv('t', { GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'user.name', GIT_CONFIG_VALUE_0: 'kept' });
    expect(env.GIT_CONFIG_COUNT).toBe('4');
    expect(env.GIT_CONFIG_KEY_0).toBe('user.name'); // the caller's own config is kept
    const pairs = [1, 2, 3].map((i) => `${env[`GIT_CONFIG_KEY_${i}`]}=${env[`GIT_CONFIG_VALUE_${i}`]}`);
    expect(pairs).toEqual(['maintenance.auto=false', 'gc.auto=0', 'core.fsmonitor=false']);
    expect(env.GIT_LITERAL_PATHSPECS).toBe('1');
  });

  test('after a commit that would trigger auto gc, the next committer is not shut out', () => {
    mkdirSync(join(root, 'media'));
    for (let i = 0; i < 400; i += 1) writeFileSync(join(root, 'media', `m${i}.bin`), randomBytes(40_000));
    g('add', '-A');
    g('commit', '-qm', 'media');
    g('config', 'gc.auto', '20'); // the palace runs git's default; this just gets there sooner
    const env = { PALACE_DOOR_TIMEOUT_MS: '1500' };
    writeFileSync(join(root, 'a.md'), 'one\n');
    expect(runCli(cliArgs('a.md'), env).status).toBe(0);
    writeFileSync(join(root, 'a.md'), 'two\n');
    const second = runCli(cliArgs('a.md'), env);
    expect({ status: second.status, stderr: second.stderr.trim() }).toMatchObject({ status: 0 });
  }, 120_000);

  test('a name with ? in it means only itself: a neighbour that matches the glob is not swept in', () => {
    writeFileSync(join(root, 'Why?.md'), 'mine\n');
    writeFileSync(join(root, 'Why2.md'), 'another session\'s\n');
    expect(runCli(cliArgs('Why?.md')).status).toBe(0);
    expect(g('show', '--name-only', '--format=', 'HEAD').trim()).toBe('Why?.md');
    expect(g('status', '--porcelain=v1').trim()).toBe('?? Why2.md');
  });

  test('a wrong-case name is refused before anything is staged', () => {
    writeFileSync(join(root, 'Alpha.md'), 'a\n');
    g('add', 'Alpha.md');
    g('commit', '-qm', 'alpha');
    writeFileSync(join(root, 'Alpha.md'), 'edited\n');
    const r = runCli(cliArgs('alpha.md'));
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/"alpha\.md" is not spelled as it is on disk \("Alpha\.md"\)/);
    expect(g('diff', '--cached', '--name-only').trim()).toBe('');
  });

  test('a symlink is checked by its own name, not by where it points', () => {
    writeFileSync(join(root, 'Real Name.md'), 'r\n');
    symlinkSync('Real Name.md', join(root, 'Real_Name.md'));
    expect(runCli(cliArgs('Real_Name.md')).status).toBe(0);
  });

  test('a commit that fails after staging leaves the shared index as it found it', () => {
    const hook = join(root, '.git', 'hooks', 'commit-msg');
    writeFileSync(hook, '#!/bin/sh\nexit 1\n');
    chmodSync(hook, 0o755);
    writeFileSync(join(root, 'a.md'), 'a\n');
    const r = runCli(cliArgs('a.md'));
    expect(r.status).not.toBe(0);
    expect(g('diff', '--cached', '--name-only').trim()).toBe('');
    expect(g('status', '--porcelain=v1').trim()).toBe('?? a.md');
  });

  test('a dry run says what the real run would do: refusals, and nothing to commit', () => {
    writeFileSync(join(root, 'a.md'), 'a\n');
    g('switch', '-q', '-c', 'side');
    const refused = runCli(cliArgs('a.md', ['--dry-run']));
    expect(refused.status).toBe(2);
    expect(refused.stderr).toMatch(/dry run: the real commit would be refused: .*not main/);
    g('switch', '-q', 'main');
    const nothing = runCli(cliArgs('seed.md', ['--dry-run']));
    expect(nothing.status).toBe(0);
    expect(nothing.stdout).toMatch(/dry run: nothing to commit under the named paths/);
  });

  test('a linked worktree on a detached HEAD, or mid-bisect, is refused', () => {
    const wt = join(root, '..', `${root.split('/').pop()}-det`);
    g('worktree', 'add', '-q', '--detach', wt);
    try {
      expect(trunkProblem(wt)).toMatch(/detached HEAD.*git switch -c/);
    } finally {
      g('worktree', 'remove', '--force', wt);
    }
    writeFileSync(join(root, 'seed.md'), 'two\n');
    g('commit', '-qam', 'two');
    g('bisect', 'start', 'HEAD', 'HEAD~1');
    try {
      expect(trunkProblem(root)).toMatch(/a bisect is half done|is on a detached HEAD|not main/);
    } finally {
      g('bisect', 'reset');
    }
  });
});

describe('the ear, after the review', () => {
  beforeEach(() => {
    mkdirSync(join(root, '_ops', 'stigmergy', 'app', 'scripts'), { recursive: true });
    copyFileSync(EAR, join(root, '_ops', 'stigmergy', 'app', 'scripts', 'ear.sh'));
    expect(spawnSync('node', [INSTALL, '--ear'], { cwd: root, encoding: 'utf8', env: gitFreeEnv() }).status).toBe(0);
  });
  const lines = () => (existsSync(join(root, '.git', 'palace-ear.jsonl'))
    ? readFileSync(join(root, '.git', 'palace-ear.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l))
    : []);

  test('git gc and pack-refs move nothing, so the ear writes nothing', () => {
    g('branch', 'feat-x');
    const before = lines().length;
    g('gc', '-q');
    g('pack-refs', '--all');
    expect(lines().slice(before)).toEqual([]);
  });

  test('the caller is the program that ran git, not git itself', () => {
    writeFileSync(join(root, 'b.md'), 'b\n');
    g('add', 'b.md');
    g('commit', '-q', '-m', 'raw');
    const last = lines().at(-1);
    expect(last.caller).not.toBe('git');
    expect(last.caller).not.toBe('');
  });

  test('a branch name with a quote still writes valid JSON', () => {
    g('branch', 'we"ird');
    const last = lines().at(-1);
    expect(last.ref).toBe('refs/heads/we"ird');
  });
});
