// Unit tests for server/launch.js — staging an interactive `claude` terminal.
// The spawn + tmp dir + platform are injected so NO real Terminal opens; we read
// back the staged prompt file + launcher and assert the `open` argv. We drive
// Terminal with `open -a Terminal` (LaunchServices), not osascript (Apple Events),
// so a launchd-orphaned server with no Automation permission can still launch.

import { describe, it, expect, afterEach } from 'vitest';
import { EventEmitter } from 'node:events';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, utimesSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { launchInteractive, launchDesktop, desktopLink, desktopPointer, DESKTOP_LAUNCHES_DIR } from '../../server/launch.js';
import { latestOpus } from '../../../../models/latest-opus.mjs';

// A fake child process that resolves the launch by emitting `close` with a code.
// stderr is a stub stream so the impl's `.on('data')` wiring is exercised.
function fakeChild(exitCode = 0, stderr = '') {
  const child = new EventEmitter();
  child.stderr = new EventEmitter();
  // emit on next tick so the impl can attach its listeners first
  queueMicrotask(() => {
    if (stderr) child.stderr.emit('data', Buffer.from(stderr));
    child.emit('close', exitCode);
  });
  return child;
}

describe('launchInteractive (server)', () => {
  // The staging tests each make a tmp dir; the launcher's own `rm -rf` never
  // runs here (the spawn is faked), so the test removes it.
  let dir;
  afterEach(() => { if (dir) rmSync(dir, { recursive: true, force: true }); dir = null; });

  it('refuses on a non-macOS platform with supported:false', async () => {
    const r = await launchInteractive('hi', { platform: 'linux' });
    expect(r.launched).toBe(false);
    expect(r.supported).toBe(false);
    expect(r.error).toMatch(/macOS/i);
  });

  it('refuses an empty prompt (supported:true)', async () => {
    const r = await launchInteractive('   ', { platform: 'darwin' });
    expect(r.launched).toBe(false);
    expect(r.supported).toBe(true);
  });

  it('stages the prompt file + launcher and drives Terminal via `open`', async () => {
    dir = mkdtempSync(join(tmpdir(), 'launch-test-'));
    const calls = [];
    const spawnImpl = (cmd, args, opts) => { calls.push({ cmd, args, opts }); return fakeChild(0); };
    // A prompt with the chars that break naive shell-passing: wikilinks, em-dash,
    // double quotes, a $VAR, and a backtick.
    const prompt = 'Drive [[Kuramoto Coupling]] — "approve stage 2"\nline 2 with $VAR and `tick`';
    const r = await launchInteractive(prompt, {
      platform: 'darwin', palaceRoot: '/Users/x/The Palace', spawnImpl, tmpDir: dir,
    });

    expect(r.launched).toBe(true);
    expect(r.supported).toBe(true);
    expect(r.scriptPath).toBe(join(dir, 'launch.command'));

    // The prompt is staged verbatim (so $(cat …) hands claude the exact bytes).
    expect(readFileSync(join(dir, 'prompt.txt'), 'utf8')).toBe(prompt);

    // The launcher cds into the (space-bearing, single-quoted) repo, runs claude
    // on the pinned model + effort + permission mode seeded from the file, and
    // self-cleans. It's a `.command` so LaunchServices runs it in Terminal when
    // `open`ed.
    const script = readFileSync(join(dir, 'launch.command'), 'utf8');
    expect(script).toContain(`cd '/Users/x/The Palace'`);
    expect(script).toContain(`claude --model '${latestOpus()}' --effort 'high' --permission-mode 'acceptEdits' "$(cat '${join(dir, 'prompt.txt')}')"`);
    expect(script).toContain(`rm -rf '${dir}'`);
    // The launched session opens in acceptEdits (low-friction, like a configured
    // desktop session) and prints the /desktop nudge once at startup.
    expect(script).toContain('/desktop to move it into the Claude Code app');

    // `open -a Terminal <launcher>` — LaunchServices, no Apple Events.
    expect(calls.length).toBe(1);
    expect(calls[0].cmd).toBe('open');
    expect(calls[0].args).toEqual(['-a', 'Terminal', join(dir, 'launch.command')]);
  });

  it('a picker that says "opus" launches the exact latest id; an explicit id stays as sent', async () => {
    for (const [asked, expected] of [['opus', latestOpus()], ['claude-opus-4-8', 'claude-opus-4-8']]) {
      dir = mkdtempSync(join(tmpdir(), 'launch-test-'));
      const spawnImpl = () => fakeChild(0);
      await launchInteractive('hi', { platform: 'darwin', palaceRoot: '/x', spawnImpl, tmpDir: dir, model: asked });
      expect(readFileSync(join(dir, 'launch.command'), 'utf8')).toContain(`claude --model '${expected}' --effort`);
      rmSync(dir, { recursive: true, force: true }); dir = null;
    }
  });

  it('surfaces a non-zero `open` exit as a real failure (no false success)', async () => {
    dir = mkdtempSync(join(tmpdir(), 'launch-test-'));
    const spawnImpl = () => fakeChild(1, 'Unable to find application named Terminal');
    const r = await launchInteractive('hello', { platform: 'darwin', palaceRoot: '/x', spawnImpl, tmpDir: dir });
    expect(r.launched).toBe(false);
    expect(r.supported).toBe(true);
    expect(r.error).toMatch(/open exited 1/);
    expect(r.error).toMatch(/Unable to find application/);
  });

  it('reports a spawn failure as supported:true (not a platform problem)', async () => {
    dir = mkdtempSync(join(tmpdir(), 'launch-test-'));
    const spawnImpl = () => { throw new Error('open not found'); };
    const r = await launchInteractive('hello', { platform: 'darwin', palaceRoot: '/x', spawnImpl, tmpDir: dir });
    expect(r.launched).toBe(false);
    expect(r.supported).toBe(true);
    expect(r.error).toMatch(/open/);
  });
});

// The desktop door: the prompt is staged under the palace root and the Claude
// app is handed a claude:// link whose q is one line pointing at it. The spawn is
// faked, so no link is ever opened.
describe('launchDesktop (server)', () => {
  let root;
  afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });
  const launchesDir = () => join(root, DESKTOP_LAUNCHES_DIR);

  it('refuses on a non-macOS platform with supported:false', async () => {
    const r = await launchDesktop('hi', { platform: 'linux' });
    expect(r.launched).toBe(false);
    expect(r.supported).toBe(false);
    expect(r.error).toMatch(/macOS/i);
  });

  it('refuses an empty prompt (supported:true) and stages nothing', async () => {
    root = mkdtempSync(join(tmpdir(), 'launch-desktop-'));
    const r = await launchDesktop('  ', { platform: 'darwin', palaceRoot: root, spawnImpl: () => fakeChild(0) });
    expect(r.launched).toBe(false);
    expect(r.supported).toBe(true);
    expect(existsSync(launchesDir())).toBe(false);
  });

  it('stages the prompt verbatim under the palace root and opens a short pointer link', async () => {
    root = join(mkdtempSync(join(tmpdir(), 'launch-desktop-')), 'The Palace');
    mkdirSync(root);
    const calls = [];
    const spawnImpl = (cmd, args) => { calls.push({ cmd, args }); return fakeChild(0); };
    // A steward-sized prompt with the characters that break naive passing, and
    // the closing instruction a truncated link would lose.
    const prompt = 'Drive [[Kuramoto Coupling]] — "go" & $VAR `tick` 100%\n'.repeat(5000) + '# Begin';
    const r = await launchDesktop(prompt, {
      platform: 'darwin', palaceRoot: root, spawnImpl, label: 'agent Kuramoto Coupling', now: Date.UTC(2026, 9, 18, 9, 30, 5),
    });

    expect(r.launched).toBe(true);
    expect(r.supported).toBe(true);
    // Named <UTC stamp>-<label>-<hex>.txt in the gitignored launches folder.
    expect(r.stagedPath.startsWith(launchesDir() + '/')).toBe(true);
    expect(r.stagedPath).toMatch(/\/20261018T093005Z-agent-kuramoto-coupling-[0-9a-f]{6}\.txt$/);
    expect(readFileSync(r.stagedPath, 'utf8')).toBe(prompt);

    // `open <link>` — LaunchServices hands claude:// to the desktop app.
    expect(calls).toEqual([{ cmd: 'open', args: [r.link] }]);
    expect(r.link).toBe(desktopLink(root, r.stagedPath));

    // The link: folder is the palace root, q the one-line pointer at the
    // absolute staged path; both decode back exactly, and the whole link stays
    // far under the ~14,000-char cut however big the prompt.
    const url = new URL(r.link);
    expect(url.protocol).toBe('claude:');
    expect(url.host).toBe('code');
    expect(url.pathname).toBe('/new');
    expect(url.searchParams.get('folder')).toBe(root);
    expect(url.searchParams.get('q')).toBe(desktopPointer(r.stagedPath));
    expect(url.searchParams.get('q')).toContain(`Read "${r.stagedPath}" in full`);
    expect(r.link).not.toMatch(/[ "+]/);   // encoded, so no space, quote or ambiguous +
    expect(r.link.length).toBeLessThan(1000);
    expect(prompt.length).toBeGreaterThan(200_000);
  });

  it('gives two launches in the same second two files', async () => {
    root = mkdtempSync(join(tmpdir(), 'launch-desktop-'));
    const o = { platform: 'darwin', palaceRoot: root, spawnImpl: () => fakeChild(0), now: Date.UTC(2026, 9, 18) };
    const a = await launchDesktop('one', o);
    const b = await launchDesktop('two', o);
    expect(a.stagedPath).not.toBe(b.stagedPath);
    expect(readFileSync(a.stagedPath, 'utf8')).toBe('one');
    expect(readFileSync(b.stagedPath, 'utf8')).toBe('two');
  });

  it('reduces any label to a safe slug, and falls back to "prompt"', async () => {
    root = mkdtempSync(join(tmpdir(), 'launch-desktop-'));
    const o = { platform: 'darwin', palaceRoot: root, spawnImpl: () => fakeChild(0) };
    const lens = await launchDesktop('x', { ...o, label: 'lens The Lens / ../../etc "Kuramoto"' });
    expect(lens.stagedPath).toMatch(/-lens-the-lens-etc-kuramoto-[0-9a-f]{6}\.txt$/);
    expect(lens.stagedPath.startsWith(launchesDir() + '/')).toBe(true);
    const bare = await launchDesktop('x', { ...o, label: '—' });
    expect(bare.stagedPath).toMatch(/-prompt-[0-9a-f]{6}\.txt$/);
  });

  it("prunes this door's files older than a week, and nothing else", async () => {
    root = mkdtempSync(join(tmpdir(), 'launch-desktop-'));
    mkdirSync(launchesDir(), { recursive: true });
    const now = Date.UTC(2026, 9, 18);
    const day = 24 * 60 * 60 * 1000;
    const put = (name, ageDays) => {
      const p = join(launchesDir(), name);
      writeFileSync(p, 'old');
      const t = (now - ageDays * day) / 1000;
      utimesSync(p, t, t);
    };
    put('20261001T000000Z-handoff-h-1-abcdef.txt', 17);   // ours, stale -> pruned
    put('20261015T000000Z-enchant-foo-123456.txt', 3);    // ours, fresh -> kept
    put('notes.txt', 30);                                  // not ours -> kept
    const r = await launchDesktop('new', { platform: 'darwin', palaceRoot: root, spawnImpl: () => fakeChild(0), now });
    const left = readdirSync(launchesDir()).sort();
    expect(left).not.toContain('20261001T000000Z-handoff-h-1-abcdef.txt');
    expect(left).toContain('20261015T000000Z-enchant-foo-123456.txt');
    expect(left).toContain('notes.txt');
    expect(left).toContain(r.stagedPath.split('/').pop());
  });

  it('surfaces a non-zero `open` exit as a real failure (no URL handler)', async () => {
    root = mkdtempSync(join(tmpdir(), 'launch-desktop-'));
    const spawnImpl = () => fakeChild(1, 'No application knows how to open URL claude://code/new');
    const r = await launchDesktop('hello', { platform: 'darwin', palaceRoot: root, spawnImpl });
    expect(r.launched).toBe(false);
    expect(r.supported).toBe(true);
    expect(r.error).toMatch(/open exited 1/);
    expect(r.error).toMatch(/No application knows/);
  });
});
