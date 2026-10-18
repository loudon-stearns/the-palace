import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync, chmodSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runHook, ceremonyKindsHere } from '../../scripts/commit-msg-hook.mjs';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, '..', '..');
const HOOK_LOGIC = join(APP_ROOT, 'scripts', 'commit-msg-hook.mjs');
const INSTALLER = join(APP_ROOT, 'scripts', 'install-hooks.mjs');

describe('runHook (against a message file)', () => {
  let dir;
  beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'hook-')); });
  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  test('passes a conformant message through untouched', () => {
    const msgPath = join(dir, 'MSG');
    const msg = 'deposit(Foo): name it\n\nPalace-Kind: deposit\nPalace-Verify: verified\nPalace-Author: claude\n';
    writeFileSync(msgPath, msg);
    expect(runHook(msgPath, { author: 'claude' })).toBe(0);
    expect(readFileSync(msgPath, 'utf8')).toBe(msg);
  });

  test('annotates an out-of-band message, does not block', () => {
    const msgPath = join(dir, 'MSG');
    writeFileSync(msgPath, 'quick fix from obsidian\n');
    expect(runHook(msgPath, { author: 'loudon' })).toBe(0);
    const out = readFileSync(msgPath, 'utf8');
    expect(out).toMatch(/quick fix from obsidian/);
    expect(out).toMatch(/Palace-Kind: ops/);
    expect(out).not.toMatch(/Palace-Verify:/); // no default: nobody made that call
    expect(out).toMatch(/Palace-Author: loudon/);
    expect(out).toMatch(/Palace-Annotated: commit-msg-hook/);
  });

  test('a missing message file does not throw and does not block', () => {
    expect(runHook(join(dir, 'does-not-exist'), {})).toBe(0);
  });
});

describe('commit-msg hook installed in a real repo', () => {
  let root;
  function g(...args) { return execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], env: gitFreeEnv() }); }
  function lastMsg() { return execFileSync('git', ['log', '-1', '--format=%B'], { cwd: root, encoding: 'utf8', env: gitFreeEnv() }); }

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'hookrepo-'));
    g('init', '-q');
    assertScratchRepo(root);
    g('config', 'user.email', 'test@palace');
    g('config', 'user.name', 'Test Palace');
    g('config', 'commit.gpgsign', 'false');
    mkdirSync(join(root, '.git', 'hooks'), { recursive: true });
    const shim = `#!/bin/sh\n# Palace commit-msg hook\nnode "${HOOK_LOGIC}" "$1" || exit 0\nexit 0\n`;
    const hookPath = join(root, '.git', 'hooks', 'commit-msg');
    writeFileSync(hookPath, shim);
    chmodSync(hookPath, 0o755);
  });
  afterEach(() => { rmSync(root, { recursive: true, force: true }); });

  test('a raw out-of-band commit is annotated, not rejected', () => {
    writeFileSync(join(root, 'a.md'), 'x');
    g('add', '-A');
    g('commit', '-m', 'just did a thing');
    const msg = lastMsg();
    expect(msg).toMatch(/just did a thing/);
    expect(msg).toMatch(/Palace-Kind: ops/);
    expect(msg).not.toMatch(/Palace-Verify:/); // no default: nobody made that call
  });

  test('a conformant commit is recorded unchanged', () => {
    writeFileSync(join(root, 'b.md'), 'y');
    g('add', '-A');
    g('commit', '-m', 'deposit(b): add b\n\nPalace-Kind: deposit\nPalace-Verify: verified\nPalace-Author: claude');
    const msg = lastMsg().trim();
    expect(msg).not.toMatch(/Palace-Annotated/);
    expect(msg).toMatch(/deposit\(b\): add b/);
  });

  test('installer --check / --uninstall round-trip works on a real repo', () => {
    const out1 = execFileSync('node', [INSTALLER, '--check'], { cwd: root, encoding: 'utf8', env: gitFreeEnv() });
    expect(out1).toMatch(/INSTALLED|present/);
    execFileSync('node', [INSTALLER, '--uninstall'], { cwd: root, encoding: 'utf8', env: gitFreeEnv() });
    const out2 = execFileSync('node', [INSTALLER, '--check'], { cwd: root, encoding: 'utf8', env: gitFreeEnv() });
    expect(out2).toMatch(/NOT installed/);
  });

  test('installer resolves the shared hooks dir from a linked worktree', () => {
    // In a worktree `.git` is a file; the installer must still find <main>/.git/hooks.
    writeFileSync(join(root, 'c.md'), 'z');
    g('add', '-A');
    g('commit', '-m', 'seed\n\nPalace-Kind: ops\nPalace-Verify: verified\nPalace-Author: claude');
    const wt = join(root, 'wt');
    g('worktree', 'add', '-q', wt);
    const run = (...a) => execFileSync('node', [INSTALLER, ...a], { cwd: wt, encoding: 'utf8', env: gitFreeEnv() });
    const sharedHook = join(root, '.git', 'hooks', 'commit-msg');

    expect(run('--check')).toMatch(/INSTALLED/);
    run('--uninstall');
    expect(existsSync(sharedHook)).toBe(false);
    run();
    expect(readFileSync(sharedHook, 'utf8')).toMatch(/Palace commit-msg hook/);
    expect(existsSync(join(wt, '.git', 'hooks'))).toBe(false);
  });
});

describe('the hook reads which subjects are ceremonies from the palace', () => {
  let dir;
  beforeEach(() => { dir = mkdtempSync(join(tmpdir(), 'hook-register-')); });
  afterEach(() => { rmSync(dir, { recursive: true, force: true }); });

  test('a page carrying trigger: makes its subject a ceremony subject; elsewhere it is annotated', async () => {
    execFileSync('git', ['init', '-q'], { cwd: dir, env: gitFreeEnv() });
    assertScratchRepo(dir);
    mkdirSync(join(dir, '_ops'), { recursive: true });
    writeFileSync(join(dir, '_ops/Walk Ceremony.md'), '---\ntitle: "Walk Ceremony"\ntrigger: ["walk"]\n---\n# Walk\n');
    const kinds = await ceremonyKindsHere(dir);
    expect(kinds.Walk).toBe('ops');
    const msgPath = join(dir, 'MSG');
    writeFileSync(msgPath, 'Walk — 2026-10-15 — through the shop\n');
    expect(runHook(msgPath, { author: 'claude', ceremonyKinds: kinds })).toBe(0);
    expect(readFileSync(msgPath, 'utf8')).toBe('Walk — 2026-10-15 — through the shop\n');   // conformant: untouched
    writeFileSync(msgPath, 'Walk — 2026-10-15 — through the shop\n');
    runHook(msgPath, { author: 'claude' });                                                  // no register: not a ceremony
    expect(readFileSync(msgPath, 'utf8')).toMatch(/Palace-Annotated: commit-msg-hook/);
  });

  test('outside a git checkout it falls back to the kinds commit-spec names, and never throws', async () => {
    const kinds = await ceremonyKindsHere(dir);
    expect(kinds.Weave).toBe('weave');
    expect(kinds.Walk).toBe(undefined);
  });
});
