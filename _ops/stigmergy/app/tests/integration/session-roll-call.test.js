// session-roll-call (scripts/session-roll-call.mjs): every open session read from
// files, a suggested pile with its evidence, and nothing touched.
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPTS = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'scripts');
const RC = join(SCRIPTS, 'session-roll-call.mjs');
const TS = join(SCRIPTS, 'trunk-state.mjs');
let base;
let home;
let records;
let projects;
const g = (cwd, ...a) => execFileSync('git', a, { cwd, encoding: 'utf8' });
const t = (min) => new Date(Date.now() - min * 60000).toISOString();
const ms = (min) => Date.now() - min * 60000;

const human = (text, min) => ({ type: 'user', timestamp: t(min), origin: { kind: 'human' }, message: { role: 'user', content: text } });
const claude = (text, min, uuid) => ({ type: 'assistant', uuid, timestamp: t(min), message: { role: 'assistant', content: [{ type: 'text', text }] } });
const call = (name, input, min) => ({ type: 'assistant', timestamp: t(min), message: { role: 'assistant', content: [{ type: 'tool_use', id: `tu-${Math.random()}`, name, input }] } });
const wrapUp = (recap, min, ask) => call('mcp__ccd_turn__wrap_up', ask ? { recap, ask } : { recap }, min);
const peer = (min) => ({ type: 'user', timestamp: t(min), isMeta: true, origin: { kind: 'peer', from: 'x' }, message: { role: 'user', content: 'Another Claude session sent a message: hello' } });
const notice = (min) => ({ type: 'user', timestamp: t(min), message: { role: 'user', content: '<task-notification><summary>done</summary></task-notification>' } });

function session(id, fields, lines, dir = projects) {
  writeFileSync(join(records, `local_${id}.json`), JSON.stringify({ sessionId: `local_${id}`, cliSessionId: `cli-${id}`, title: id, cwd: '/nowhere', isArchived: false, permissionMode: 'auto', ...fields }));
  mkdirSync(dir, { recursive: true });
  if (lines) writeFileSync(join(dir, `cli-${id}.jsonl`), `${lines.map((l) => JSON.stringify(l)).join('\n')}\n`);
}

const run = (script, args, cwd = base) => spawnSync('node', [script, ...args], { cwd, encoding: 'utf8', env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: '' } });

beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), 'rollcall-'));
  home = join(base, 'home');
  records = join(home, 'Library', 'Application Support', 'Claude', 'claude-code-sessions', 'acct', 'env');
  projects = join(home, '.claude', 'projects', '-some-project');
  mkdirSync(records, { recursive: true });
  mkdirSync(projects, { recursive: true });
});
afterEach(() => { rmSync(base, { recursive: true, force: true }); });

describe('session-roll-call', () => {
  test('sorts each open session into a pile with its evidence, newest first, and changes nothing', () => {
    // Can go: the wrap-up came after Loudon's words; a peer message and a task notice after it are not his.
    session('closed', { lastActivityAt: ms(10) }, [human('do the thing', 30), call('Bash', { command: 'ls' }, 25), wrapUp('The thing is done.', 20), claude('Done.', 19), peer(15), notice(14)]);
    // Waiting: the wrap-up asks. Loudon's words sit more than the first tail-read back.
    const filler = Array.from({ length: 700 }, (_, i) => claude(`filler ${i} ${'x'.repeat(1000)}`, 55));
    session('asks', { lastActivityAt: ms(40) }, [human('draft it', 60), ...filler, wrapUp('Drafted on a branch.', 50, 'Land it?')]);
    // Unclear: Loudon spoke after the last wrap-up.
    session('spoke-after', { lastActivityAt: ms(80) }, [wrapUp('Finished.', 100), human('one more thing', 90)]);
    // Waiting, without a wrap-up: the app's own summary of the last turn names an action.
    session('app-says', { lastActivityAt: ms(120), postTurnSummary: { status_category: 'blocked', status_detail: 'x', needs_action: 'decide X', summarizes_uuid: 'u-last' } }, [human('go', 140), claude('Need your call on X.', 130, 'u-last')]);
    // Unclear: the app's summary is of an earlier turn, and a turn is under way.
    session('stale-summary', { lastActivityAt: ms(150), postTurnSummary: { status_category: 'completed', summarizes_uuid: 'u-old' } }, [claude('Done before.', 170, 'u-old'), human('next', 165), call('Bash', { command: 'ls' }, 160)]);
    // No transcript left on disk.
    session('gone', { lastActivityAt: ms(200) }, null);
    // Archived: not listed unless asked.
    session('archived', { lastActivityAt: ms(5), isArchived: true }, [wrapUp('Old.', 6)]);

    const before = readdirSync(records).map((f) => readFileSync(join(records, f), 'utf8'));
    const r = run(RC, ['--json']);
    expect(r.status, r.stderr).toBe(0);
    const rc = JSON.parse(r.stdout);
    expect(rc.records).toBe(7);
    expect(rc.unarchived).toBe(6);
    expect(rc.sessions.map((s) => s.title)).toEqual(['closed', 'asks', 'spoke-after', 'app-says', 'stale-summary', 'gone']);
    const by = Object.fromEntries(rc.sessions.map((s) => [s.title, s]));
    expect(by.closed.pile).toBe('can go');
    expect(by.closed.transcript.human.text).toBe('do the thing');
    expect(by.closed.transcript.callsSinceWrapUp).toBe(0);
    expect(by.asks.pile).toBe('waiting on Loudon');
    expect(by.asks.transcript.wrapUp.ask).toBe('Land it?');
    expect(by.asks.transcript.human.text).toBe('draft it');
    expect(by.asks.transcript.bytesRead).toBeGreaterThan(512 * 1024);
    expect(by['spoke-after'].pile).toBe('unclear');
    expect(by['spoke-after'].because).toMatch(/after the last wrap-up/);
    expect(by['app-says'].pile).toBe('waiting on Loudon');
    expect(by['app-says'].app.summary.current).toBe(true);
    expect(by['stale-summary'].pile).toBe('unclear');
    expect(by['stale-summary'].app.summary.current).toBe(false);
    expect(by.gone.pile).toBe('unclear');
    expect(by.gone.because).toMatch(/no transcript/);
    expect(rc.piles).toEqual({ 'waiting on Loudon': 2, unclear: 3, 'can go': 1 });
    expect(readdirSync(records).map((f) => readFileSync(join(records, f), 'utf8'))).toEqual(before);

    const text = run(RC, []).stdout;
    expect(text).toMatch(/6 listed of 7 records \(2 waiting on Loudon, 3 unclear, 1 can go\)/);
    expect(text).toMatch(/\[waiting on Loudon\] asks[\s\S]*?asks: Land it\?[\s\S]*?because: the last wrap-up asks him something/);
    expect(text).toMatch(/\[unclear\] gone[\s\S]*?no transcript on disk/);
    expect(JSON.parse(run(RC, ['--json', '--archived']).stdout).sessions).toHaveLength(7);
  });

  test("a side session's brief is not Loudon's words, a closing question waits on him, and a parent waits for its open side session", () => {
    session('parent', { lastActivityAt: ms(10) }, [human('split it off', 30), wrapUp('Started a side session.', 20)]);
    // The brief arrives marked as a human turn, but the session that started this one wrote it.
    session('side', { lastActivityAt: ms(5), spawnedFrom: { sessionId: 'local_parent', title: 'side' } }, [human('Build the thing, then report.', 15), call('Bash', { command: 'ls' }, 12), wrapUp('Built it.', 8), claude('Built. Shall I land it on main?', 7)]);
    session('child-done', { lastActivityAt: ms(4), spawnedFrom: { sessionId: 'local_other' } }, [human('Do a small thing.', 15), wrapUp('Did it.', 9)]);
    // A brief launched as an sdk turn; what Loudon typed after it is his.
    const launched = { type: 'user', timestamp: t(16), turnOrigin: 'sdk', message: { role: 'user', content: '<system-reminder>x</system-reminder>\nBackground: build it.' } };
    session('sdk-brief', { lastActivityAt: ms(3), spawnedFrom: { sessionId: 'local_other' } }, [launched, human('continue', 14), wrapUp('Built.', 11)]);
    const rc = JSON.parse(run(RC, ['--json']).stdout);
    const by = Object.fromEntries(rc.sessions.map((s) => [s.title, s]));
    expect(by['sdk-brief'].brief.text).toBe('Background: build it.');
    expect(by['sdk-brief'].transcript.human.text).toBe('continue');
    expect(by['sdk-brief'].because).toMatch(/after Loudon's last words/);
    expect(by.side.transcript.human).toBe(null);
    expect(by.side.brief.text).toBe('Build the thing, then report.');
    expect(by.side.pile).toBe('waiting on Loudon');
    expect(by.side.because).toMatch(/closing words after the last wrap-up ask a question/);
    expect(by['child-done'].pile).toBe('can go');
    expect(by['child-done'].because).toMatch(/Loudon has not written in this session/);
    expect(by.parent.pile).toBe('unclear');
    expect(by.parent.because).toMatch(/its side session "side" is waiting on Loudon/);
    const text = run(RC, []).stdout;
    expect(text).toMatch(/Loudon has not written here; its brief .*: "Build the thing, then report\."/);
    expect(text).toMatch(/Claude's closing question: "Shall I land it on main\?"/);
  });

  test("reads a worktree's unsaved files and commits not on main", () => {
    const repo = join(base, 'repo');
    g(base, 'init', '-q', '-b', 'main', repo);
    g(repo, 'config', 'user.email', 't@t');
    g(repo, 'config', 'user.name', 't');
    writeFileSync(join(repo, 'a.md'), 'a\n');
    g(repo, 'add', '-A');
    g(repo, 'commit', '-qm', 'seed');
    const wt = join(repo, '.claude', 'worktrees', 'w1');
    g(repo, 'worktree', 'add', '-q', '-b', 'claude/w1', wt);
    writeFileSync(join(wt, 'b.md'), 'b\n');
    g(wt, 'add', 'b.md');
    g(wt, 'commit', '-qm', 'work');
    writeFileSync(join(wt, 'c.md'), 'unsaved\n');
    session('in-worktree', { cwd: wt, lastActivityAt: ms(1) }, [human('build it', 5), wrapUp('Built on the branch.', 2)]);
    session('worktree-gone', { cwd: join(repo, '.claude', 'worktrees', 'w2'), lastActivityAt: ms(3) }, [human('try', 5), wrapUp('Tried.', 4)]);
    // Its folder is gone, but the branch it wrote still holds a commit main lacks.
    const w3 = join(repo, '.claude', 'worktrees', 'w3');
    g(repo, 'worktree', 'add', '-q', '-b', 'claude/w3', w3);
    writeFileSync(join(w3, 'd.md'), 'd\n');
    g(w3, 'add', 'd.md');
    g(w3, 'commit', '-qm', 'kept');
    g(repo, 'worktree', 'remove', w3);
    session('branch-kept', { cwd: w3, branch: 'claude/w3', worktreePath: w3, writtenBranches: [`${w3}\0claude/w3`], lastActivityAt: ms(4) }, [human('try', 6), wrapUp('Kept it.', 5)]);
    const rc = JSON.parse(run(RC, ['--json']).stdout);
    const by = Object.fromEntries(rc.sessions.map((s) => [s.title, s]));
    expect(by['in-worktree'].worktree).toMatchObject({ exists: true, dirty: 1, ahead: 1, base: 'main', branch: 'claude/w1' });
    expect(by['in-worktree'].branches).toEqual([]);
    expect(by['in-worktree'].pile).toBe('unclear');
    expect(by['in-worktree'].because).toMatch(/its worktree has 1 unsaved; its worktree holds 1 commit not on main/);
    expect(by['worktree-gone'].worktree.exists).toBe(false);
    expect(by['worktree-gone'].pile).toBe('can go');
    expect(by['worktree-gone'].because).toMatch(/worktree folder is gone/);
    expect(by['branch-kept'].branches).toMatchObject([{ branch: 'claude/w3', ahead: 1, state: 'present' }]);
    expect(by['branch-kept'].pile).toBe('unclear');
    expect(by['branch-kept'].because).toMatch(/branch claude\/w3 holds 1 commit not on main/);

    // trunk-state carries the same roll call under --sessions, and leaves it out otherwise.
    const ts = run(TS, ['--json', '--no-writers', '--sessions'], repo);
    expect(ts.status, ts.stderr).toBe(0);
    expect(JSON.parse(ts.stdout).sessions.piles).toEqual(rc.piles);
    expect(JSON.parse(run(TS, ['--json', '--no-writers'], repo).stdout).sessions).toBeUndefined();
    expect(run(TS, ['--no-writers', '--sessions'], repo).stdout).toMatch(/Sessions, .*: 3 listed of 3 records/);
  });

  test('under trunk-state --sessions, a session that left an unsaved file in the main checkout is held back', () => {
    const repo = join(base, 'repo');
    g(base, 'init', '-q', '-b', 'main', repo);
    g(repo, 'config', 'user.email', 't@t');
    g(repo, 'config', 'user.name', 't');
    writeFileSync(join(repo, 'a.md'), 'a\n');
    g(repo, 'add', '-A');
    g(repo, 'commit', '-qm', 'seed');
    const owner = /^worktree (.+)$/m.exec(g(repo, 'worktree', 'list', '--porcelain'))[1];
    writeFileSync(join(repo, 'a.md'), 'changed\n');
    const ownDir = join(home, '.claude', 'projects', owner.replace(/[^A-Za-z0-9]/g, '-'));
    session('left-dirt', { cwd: owner, lastActivityAt: ms(2) }, [human('edit a', 10), call('Edit', { file_path: join(owner, 'a.md') }, 1), wrapUp('Edited a.', 0.5)], ownDir);
    const rc = JSON.parse(run(TS, ['--json', '--sessions'], repo).stdout).sessions;
    expect(rc.mainWritersRead).toBe(true);
    const s = rc.sessions.find((x) => x.title === 'left-dirt');
    expect(s.mainUnsaved).toEqual(['a.md']);
    expect(s.pile).toBe('unclear');
    expect(s.because).toMatch(/it wrote 1 of the unsaved paths in the main checkout/);
    // Read alone, the roll call cannot see that, and says so.
    const alone = run(RC, [], repo).stdout;
    expect(alone).toMatch(/not credited to sessions here; trunk-state --sessions does that/);
    expect(alone).toMatch(/\[can go\] left-dirt/);
  });
});
