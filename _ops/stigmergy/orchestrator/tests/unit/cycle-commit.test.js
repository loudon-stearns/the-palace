import { describe, test, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, chmodSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { shippedPaths, selectCommitPaths, headlineOf, commitPathsAsync, commitPaths, ignoredPaths, planCycleCommit, cycleBody, pageEditsOf, checkFrontmatter, vetPageEdits } from '../../src/cycle-commit.js';
import { readFileSync } from 'node:fs';
import { processCycle } from '../../src/process-cycle.js';

function assistantLine(fences) {
  const text = fences.map((f) => '```json\n' + JSON.stringify(f) + '\n```').join('\n\n');
  return JSON.stringify({ type: 'assistant', message: { usage: {}, content: [{ type: 'text', text }] } });
}

const git = (root, args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });

let root;
afterEach(() => { if (root) rmSync(root, { recursive: true, force: true }); root = null; });

// A palace with one project entry, its bundle, and a steward.
function makePalace() {
  root = mkdtempSync(path.join(tmpdir(), 'palace-cc-'));
  const bundle = path.join(root, 'Projects/Test Steward');
  mkdirSync(bundle, { recursive: true });
  writeFileSync(path.join(root, 'Projects/Test Steward.md'), '---\ntitle: Test Steward\ntype: project\nstage: growing\nstatus: active\n---\n# Test Steward\n');
  const agentDir = path.join(root, '_ops/agents/permanent/test-steward');
  mkdirSync(agentDir, { recursive: true });
  mkdirSync(path.join(root, '_ops/swarm/persistent'), { recursive: true });
  writeFileSync(path.join(agentDir, 'manifest.json'), JSON.stringify({ agent_id: 'Test Steward', home: 'Test Steward', mode: 'long_duration_background', session_id: 's', model: { name: 'claude-sonnet-5' } }));
  writeFileSync(path.join(agentDir, 'state.json'), JSON.stringify({ iteration: 0, last_active: null, last_read_cursor: null }));
  writeFileSync(path.join(agentDir, 'history.jsonl'), '');
  writeFileSync(path.join(root, '_ops/swarm/persistent/blackboard.jsonl'), '');
  return { bundle, agentDir: '_ops/agents/permanent/test-steward' };
}

describe('shippedPaths', () => {
  test('reads artifacts objects, string arrays and the legacy artifact_path', () => {
    const paths = shippedPaths([
      { payload: { artifacts: [{ path: 'Projects/A/x.png', caption: 'x' }, 'Projects/A/y.json'] } },
      { payload: { artifact_path: 'Projects/A/z.wav' } },
    ]);
    expect(paths.sort()).toEqual(['Projects/A/x.png', 'Projects/A/y.json', 'Projects/A/z.wav']);
  });
});

describe('selectCommitPaths', () => {
  test('keeps bundle files; refuses entries, outsiders, missing and oversize files', () => {
    const { bundle } = makePalace();
    writeFileSync(path.join(bundle, 'render.png'), 'png');
    writeFileSync(path.join(bundle, 'big.wav'), Buffer.alloc(2048));
    writeFileSync(path.join(bundle, 'notes.md'), '---\ntitle: notes\nborn: 2026-09\n---\nworkshop notes\n');
    writeFileSync(path.join(bundle, 'Draft.md'), '---\ntitle: Draft\ntype: specialist\n---\nan entry in disguise\n');
    const r = selectCommitPaths({
      palaceRoot: root,
      bundleDir: bundle,
      maxBytes: 1024,
      paths: [
        'Projects/Test Steward/render.png',
        'Projects/Test Steward/notes.md',
        'Projects/Test Steward/Draft.md',
        'Projects/Test Steward/big.wav',
        'Projects/Test Steward/gone.wav',
        'Projects/Test Steward.md',
        '../outside.txt',
      ],
    });
    expect(r.paths.sort()).toEqual(['Projects/Test Steward/notes.md', 'Projects/Test Steward/render.png']);
    expect(r.entries).toEqual(['Projects/Test Steward/Draft.md']);
    expect(r.oversize.map((o) => o.path)).toEqual(['Projects/Test Steward/big.wav']);
    expect(r.missing).toEqual(['Projects/Test Steward/gone.wav']);
    expect(r.outside.sort()).toEqual(['../outside.txt', 'Projects/Test Steward.md']);
  });
});

describe('headlineOf', () => {
  test('takes the first headline-like field and trims it to one line', () => {
    expect(headlineOf([{ payload: { headline: 'I made\n a thing' } }])).toBe('I made a thing');
    expect(headlineOf([])).toBe('machinery and scroll');
  });
});

describe('processCycle with commit', () => {
  test('commits exactly what the cycle shipped, and leaves another writer\'s staged work alone', () => {
    const { bundle, agentDir } = makePalace();
    git(root, ['init', '-q', '-b', 'main']);
    git(root, ['config', 'user.name', 'test']);
    git(root, ['config', 'user.email', 'test@example.com']);
    git(root, ['add', '-A']);
    git(root, ['commit', '-q', '-m', 'init']);

    // Another writer has something staged that must not ride along.
    writeFileSync(path.join(root, 'Other.md'), 'someone else\n');
    git(root, ['add', 'Other.md']);

    writeFileSync(path.join(bundle, 'render.png'), 'png');
    writeFileSync(path.join(bundle, 'Draft.md'), '---\ntitle: Draft\ntype: specialist\n---\nan entry\n');
    const shipped = {
      schema_version: '1.0', id: 'ts-1', ts: '2026-09-25T20:00:00-04:00', session_id: 's',
      from: 'Test Steward', to: '*', type: 'BROADCAST', board: 'GENERAL',
      payload: { kind: 'shipped_artifact', headline: 'A render of the thing', artifacts: [{ path: 'Projects/Test Steward/render.png' }, { path: 'Projects/Test Steward/Draft.md' }] },
    };
    const transcriptPath = path.join(root, 'transcript.jsonl');
    writeFileSync(transcriptPath, assistantLine([shipped]));
    // The transcript itself is scratch, not palace work — keep it out of the tree's status.
    writeFileSync(path.join(root, '.gitignore'), 'transcript.jsonl\n');

    const summary = processCycle({ palaceRoot: root, transcriptPath, agentDir, cycleN: 1, iteration: 1, tsNow: '2026-09-25T20:05:00-04:00', commit: true });

    expect(summary.commit.ok).toBe(true);
    expect(summary.commit.hash).toMatch(/^[0-9a-f]{7,40}$/);
    expect(summary.commit.entries).toEqual(['Projects/Test Steward/Draft.md']);

    const files = git(root, ['-c', 'core.quotepath=false', 'show', '--name-only', '--format=', 'HEAD']).trim().split('\n').sort();
    expect(files).toContain('Projects/Test Steward/render.png');
    expect(files).toContain('_ops/agents/permanent/test-steward/state.json');
    expect(files).toContain('_ops/agents/permanent/test-steward/history.jsonl');
    expect(files).toContain('_ops/swarm/persistent/blackboard.jsonl');
    expect(files).not.toContain('Projects/Test Steward/Draft.md');
    expect(files).not.toContain('Other.md');

    const subject = git(root, ['log', '-1', '--format=%s']).trim();
    expect(subject).toBe('steward(Test Steward): cycle 1 — A render of the thing');

    // The other writer's file is still staged, untouched.
    expect(git(root, ['diff', '--cached', '--name-only']).trim()).toBe('Other.md');
  });

  test('with commit off (the default) nothing is committed', () => {
    const { agentDir } = makePalace();
    git(root, ['init', '-q', '-b', 'main']);
    git(root, ['config', 'user.name', 'test']);
    git(root, ['config', 'user.email', 'test@example.com']);
    git(root, ['add', '-A']);
    git(root, ['commit', '-q', '-m', 'init']);
    const msg = { schema_version: '1.0', id: 'b-1', ts: '2026-09-25T20:00:00-04:00', session_id: 's', from: 'Test Steward', to: '*', type: 'BROADCAST', board: 'GENERAL', payload: { subject: 'hi', content: 'hello' } };
    const transcriptPath = path.join(root, 'transcript.jsonl');
    writeFileSync(transcriptPath, assistantLine([msg]));
    const summary = processCycle({ palaceRoot: root, transcriptPath, agentDir, cycleN: 1, iteration: 1, tsNow: '2026-09-25T20:05:00-04:00' });
    expect(summary.commit).toBeNull();
    expect(git(root, ['rev-list', '--count', 'HEAD']).trim()).toBe('1');
  });

  // The STIGMERGY lane plans the commit inside the reap and makes it
  // asynchronously after, so the server never blocks on a committer while it
  // may be holding the door itself (server/door.js; the 2026-10-14 review).
  test("commit: 'plan' makes no commit, and the plan commits through commitPathsAsync", async () => {
    const { bundle, agentDir } = makePalace();
    git(root, ['init', '-q', '-b', 'main']);
    git(root, ['config', 'user.name', 'test']);
    git(root, ['config', 'user.email', 'test@example.com']);
    writeFileSync(path.join(root, '.gitignore'), 'transcript.jsonl\n');
    git(root, ['add', '-A']);
    git(root, ['commit', '-q', '-m', 'init']);
    writeFileSync(path.join(bundle, 'render.png'), 'png');
    const shipped = {
      schema_version: '1.0', id: 'ts-2', ts: '2026-09-25T20:00:00-04:00', session_id: 's',
      from: 'Test Steward', to: '*', type: 'BROADCAST', board: 'GENERAL',
      payload: { kind: 'shipped_artifact', headline: 'A planned render', artifacts: [{ path: 'Projects/Test Steward/render.png' }] },
    };
    const transcriptPath = path.join(root, 'transcript.jsonl');
    writeFileSync(transcriptPath, assistantLine([shipped]));

    const summary = processCycle({ palaceRoot: root, transcriptPath, agentDir, cycleN: 2, iteration: 2, tsNow: '2026-09-25T20:05:00-04:00', commit: 'plan' });
    expect(summary.commit.planned).toBe(true);
    expect(summary.commit.plan.paths).toContain('Projects/Test Steward/render.png');
    expect(git(root, ['rev-list', '--count', 'HEAD']).trim()).toBe('1'); // nothing committed yet

    const res = await commitPathsAsync({ palaceRoot: root, ...summary.commit.plan });
    expect(res.ok, res.error).toBe(true);
    expect(git(root, ['log', '-1', '--format=%s']).trim()).toBe('steward(Test Steward): cycle 2 — A planned render');
  });
});

// A file .gitignore ignores must never fail the whole cycle: the committer
// refuses a commit that names one (Generative Sample Libraries cycle 37,
// 2026-10-15, lost all 38 of its files that way). It is left out and named.
describe('an ignored file in a cycle', () => {
  function palaceWithIgnoredWav() {
    const made = makePalace();
    git(root, ['init', '-q', '-b', 'main']);
    git(root, ['config', 'user.name', 'test']);
    git(root, ['config', 'user.email', 'test@example.com']);
    writeFileSync(path.join(root, '.gitignore'), 'transcript.jsonl\n*.wav\n');
    writeFileSync(path.join(made.bundle, 'tracked.wav'), 'tracked before the rule\n');
    git(root, ['add', '-A']);
    git(root, ['add', '-f', 'Projects/Test Steward/tracked.wav']);
    git(root, ['commit', '-q', '-m', 'init']);
    mkdirSync(path.join(made.bundle, 'finished', 'violin'), { recursive: true });
    writeFileSync(path.join(made.bundle, 'finished', 'violin', 'phrase.wav'), 'audio\n');
    writeFileSync(path.join(made.bundle, 'render.png'), 'png');
    return made;
  }
  const shippedMsg = (id) => ({
    schema_version: '1.0', id, ts: '2026-10-15T08:00:00-04:00', session_id: 's',
    from: 'Test Steward', to: '*', type: 'BROADCAST', board: 'GENERAL',
    payload: { kind: 'shipped_artifact', headline: 'A phrase and a render', artifacts: [{ path: 'Projects/Test Steward/finished/violin/phrase.wav' }, { path: 'Projects/Test Steward/render.png' }] },
  });

  test('git names the ignored file, and never a tracked one the rule also matches', () => {
    palaceWithIgnoredWav();
    const got = ignoredPaths(root, ['Projects/Test Steward/finished/violin/phrase.wav', 'Projects/Test Steward/tracked.wav', 'Projects/Test Steward/render.png']);
    expect(got).toEqual(['Projects/Test Steward/finished/violin/phrase.wav']);
  });

  test('the plan leaves it out and names it in the body', () => {
    const { bundle } = palaceWithIgnoredWav();
    const plan = planCycleCommit({ palaceRoot: root, home: 'Test Steward', cycleN: 37, bundleDir: bundle, messages: [shippedMsg('ig-1')] });
    expect(plan.paths).toContain('Projects/Test Steward/render.png');
    expect(plan.paths).not.toContain('Projects/Test Steward/finished/violin/phrase.wav');
    expect(plan.ignored).toEqual(['Projects/Test Steward/finished/violin/phrase.wav']);
    expect(plan.shipped).toEqual(['Projects/Test Steward/render.png']);
    expect(plan.body).toMatch(/Not committed — ignored by \.gitignore:\n- Projects\/Test Steward\/finished\/violin\/phrase\.wav/);
  });

  test('the cycle still commits everything else, through the CLI path', () => {
    const { agentDir } = palaceWithIgnoredWav();
    const transcriptPath = path.join(root, 'transcript.jsonl');
    writeFileSync(transcriptPath, assistantLine([shippedMsg('ig-2')]));
    const summary = processCycle({ palaceRoot: root, transcriptPath, agentDir, cycleN: 37, iteration: 1, tsNow: '2026-10-15T08:12:00-04:00', commit: true });
    expect(summary.commit.ok, summary.commit.error).toBe(true);
    expect(summary.commit.ignored).toEqual(['Projects/Test Steward/finished/violin/phrase.wav']);
    const files = git(root, ['-c', 'core.quotepath=false', 'show', '--name-only', '--format=', 'HEAD']).trim().split('\n');
    expect(files).toContain('Projects/Test Steward/render.png');
    expect(files).toContain('_ops/agents/permanent/test-steward/state.json');
    expect(files).not.toContain('Projects/Test Steward/finished/violin/phrase.wav');
    expect(git(root, ['log', '-1', '--format=%b'])).toMatch(/ignored by \.gitignore/);
  });

  test('the cycle still commits everything else, through the server\'s plan', async () => {
    const { agentDir } = palaceWithIgnoredWav();
    const transcriptPath = path.join(root, 'transcript.jsonl');
    writeFileSync(transcriptPath, assistantLine([shippedMsg('ig-3')]));
    const summary = processCycle({ palaceRoot: root, transcriptPath, agentDir, cycleN: 37, iteration: 1, tsNow: '2026-10-15T08:12:00-04:00', commit: 'plan' });
    const res = await commitPathsAsync({ palaceRoot: root, ...summary.commit.plan });
    expect(res.ok, res.error).toBe(true);
    const files = git(root, ['-c', 'core.quotepath=false', 'show', '--name-only', '--format=', 'HEAD']).trim().split('\n');
    expect(files).toContain('Projects/Test Steward/render.png');
    expect(files).not.toContain('Projects/Test Steward/finished/violin/phrase.wav');
  });

  test('if an ignored path reaches the committer anyway, it is dropped and the commit tried once more', async () => {
    palaceWithIgnoredWav();
    const paths = ['Projects/Test Steward/render.png', 'Projects/Test Steward/finished/violin/phrase.wav'];
    const body = 'Shipped this cycle:\n- x\n\nCommitted by process-cycle.js after the cycle; the steward did not run git.';
    const sync = commitPaths({ palaceRoot: root, paths, scope: 'Test Steward', summary: 'cycle 1 — sync', body });
    expect(sync.ok, sync.error).toBe(true);
    expect(sync.ignored).toEqual(['Projects/Test Steward/finished/violin/phrase.wav']);
    expect(git(root, ['log', '-1', '--format=%b'])).toMatch(/ignored by \.gitignore:\n- Projects\/Test Steward\/finished\/violin\/phrase\.wav\n\nCommitted by process-cycle\.js/);
    writeFileSync(path.join(root, 'Projects/Test Steward/render.png'), 'png again');
    const asyncRes = await commitPathsAsync({ palaceRoot: root, paths, scope: 'Test Steward', summary: 'cycle 2 — async', body });
    expect(asyncRes.ok, asyncRes.error).toBe(true);
    expect(asyncRes.ignored).toEqual(['Projects/Test Steward/finished/violin/phrase.wav']);
  });

  test('a commit of nothing but ignored files fails plainly, without looping', () => {
    palaceWithIgnoredWav();
    const res = commitPaths({ palaceRoot: root, paths: ['Projects/Test Steward/finished/violin/phrase.wav'], scope: 'Test Steward', summary: 'cycle 3 — only ignored' });
    expect(res.ok).toBe(false);
    expect(res.error).toMatch(/ignored/);
  });
});

// The review of 2026-10-15: git check-ignore does not judge the way git add
// does. The screen now asks git add itself, so these cases follow the door.
describe('the screen judges as the committer\'s git add does', () => {
  function palace(rules) {
    const made = makePalace();
    git(root, ['init', '-q', '-b', 'main']);
    git(root, ['config', 'user.name', 'test']);
    git(root, ['config', 'user.email', 'test@example.com']);
    writeFileSync(path.join(root, '.gitignore'), `transcript.jsonl\n${rules}\n`);
    git(root, ['add', '-A']);
    git(root, ['commit', '-q', '-m', 'init']);
    return made;
  }
  const B = 'Projects/Test Steward';

  test('a tracked file inside an ignored folder is left out, and the rest commits', () => {
    const { bundle } = palace('_manim_media/');
    mkdirSync(path.join(bundle, '_manim_media'), { recursive: true });
    writeFileSync(path.join(bundle, '_manim_media', 'hero.png'), 'v1');
    git(root, ['add', '-f', `${B}/_manim_media/hero.png`]);
    git(root, ['commit', '-q', '-m', 'force-added before the rule mattered']);
    writeFileSync(path.join(bundle, '_manim_media', 'hero.png'), 'v2');
    writeFileSync(path.join(bundle, 'render.png'), 'png');
    expect(ignoredPaths(root, [`${B}/_manim_media/hero.png`, `${B}/render.png`])).toEqual([`${B}/_manim_media/hero.png`]);
    const res = commitPaths({ palaceRoot: root, paths: [`${B}/render.png`, `${B}/_manim_media/hero.png`], scope: 'Test Steward', summary: 'cycle 1 — folder' });
    expect(res.ok, res.error).toBe(true);
    expect(git(root, ['show', '--name-only', '--format=', 'HEAD']).trim()).toBe(`${B}/render.png`);
  });

  test('a name with brackets is judged literally, not as a glob matching a tracked file', () => {
    const { bundle } = palace('*.wav');
    writeFileSync(path.join(bundle, 'take1.wav'), 'tracked');
    git(root, ['add', '-f', `${B}/take1.wav`]);
    git(root, ['commit', '-q', '-m', 'a tracked take']);
    writeFileSync(path.join(bundle, 'take[1].wav'), 'new and ignored');
    expect(ignoredPaths(root, [`${B}/take[1].wav`, `${B}/take1.wav`])).toEqual([`${B}/take[1].wav`]);
  });

  test('a tracked file named in decomposed Unicode is not called ignored, and commits', () => {
    const { bundle } = palace('*.wav');
    const nfc = 'Café phrase.wav';
    const nfd = 'Café phrase.wav';
    writeFileSync(path.join(bundle, nfd), 'v1');
    git(root, ['add', '-f', `${B}/${nfc}`]);
    git(root, ['commit', '-q', '-m', 'tracked']);
    writeFileSync(path.join(bundle, nfd), 'v2');
    writeFileSync(path.join(bundle, 'render.png'), 'png');
    expect(ignoredPaths(root, [`${B}/${nfd}`])).toEqual([]);
    const res = commitPaths({ palaceRoot: root, paths: [`${B}/render.png`, `${B}/${nfd}`], scope: 'Test Steward', summary: 'cycle 1 — accents' });
    expect(res.ok, res.error).toBe(true);
    expect(git(root, ['-c', 'core.quotepath=false', 'show', '--name-only', '--format=', 'HEAD']).trim().split('\n').length).toBe(2);
  });

  test('a path git cannot find does not hide an ignored one beside it', () => {
    const { bundle } = palace('*.wav');
    writeFileSync(path.join(bundle, 'phrase.wav'), 'audio');
    expect(ignoredPaths(root, [`${B}/gone.png`, `${B}/phrase.wav`])).toEqual([`${B}/phrase.wav`]);
  });

  test('when git cannot say where the index is, nothing is called ignored', () => {
    const { bundle } = palace('*.wav');
    writeFileSync(path.join(bundle, 'take.wav'), 'v1');
    git(root, ['add', '-f', `${B}/take.wav`]);
    git(root, ['commit', '-q', '-m', 'tracked']);
    writeFileSync(path.join(bundle, 'take.wav'), 'v2');
    const shim = mkdtempSync(path.join(tmpdir(), 'git-shim-'));
    const realGit = execFileSync('/usr/bin/which', ['git'], { encoding: 'utf8' }).trim();
    writeFileSync(path.join(shim, 'git'), `#!/bin/sh\n[ "$1" = rev-parse ] && [ "$2" = --git-path ] && exit 1\nexec "${realGit}" "$@"\n`);
    chmodSync(path.join(shim, 'git'), 0o755);
    const before = process.env.PATH;
    process.env.PATH = `${shim}:${before}`;
    try {
      expect(ignoredPaths(root, [`${B}/take.wav`])).toEqual([]);
    } finally {
      process.env.PATH = before;
      rmSync(shim, { recursive: true, force: true });
    }
  });

  test('the backstop still gets its try when no retries are left', () => {
    const { bundle } = palace('*.wav');
    writeFileSync(path.join(bundle, 'phrase.wav'), 'audio');
    writeFileSync(path.join(bundle, 'render.png'), 'png');
    const res = commitPaths({ palaceRoot: root, paths: [`${B}/render.png`, `${B}/phrase.wav`], scope: 'Test Steward', summary: 'cycle 1 — no retries', retries: 0 });
    expect(res.ok, res.error).toBe(true);
    expect(res.ignored).toEqual([`${B}/phrase.wav`]);
  });

  test('when the backstop drops a shipped file, the body lists it once, as ignored, not as shipped', () => {
    const { bundle } = palace('*.wav');
    writeFileSync(path.join(bundle, 'phrase.wav'), 'audio');
    writeFileSync(path.join(bundle, 'take.wav'), 'audio');
    writeFileSync(path.join(bundle, 'render.png'), 'png');
    const parts = { shipped: [`${B}/render.png`, `${B}/phrase.wav`], ignored: [`${B}/take.wav`] };
    const res = commitPaths({ palaceRoot: root, paths: [`${B}/render.png`, `${B}/phrase.wav`], scope: 'Test Steward', summary: 'cycle 1 — rebuilt', body: cycleBody(parts), parts });
    expect(res.ok, res.error).toBe(true);
    const body = git(root, ['log', '-1', '--format=%b']);
    expect(body.startsWith(cycleBody({ shipped: [`${B}/render.png`], ignored: [`${B}/take.wav`, `${B}/phrase.wav`] }))).toBe(true); // the committer's trailers follow
    expect(body.match(/ignored by \.gitignore/g)).toHaveLength(1);
  });
});

// A steward is grown up for its own page and bundle (decided 2026-10-16): it
// edits its own entry and bundle and lists each edit as `page_edits`; the cycle
// commits them once their frontmatter parses, and refuses everything else.
describe('a steward\'s own page edits', () => {
  const ENTRY = 'Projects/Test Steward.md';
  const B = 'Projects/Test Steward';

  test('pageEditsOf reads { path, why } items and bare strings', () => {
    expect(pageEditsOf([
      { payload: { page_edits: [{ path: ' Projects/A.md ', why: ' because ' }, 'Projects/A/b.md', { why: 'no path' }] } },
      { payload: {} },
    ])).toEqual([{ path: 'Projects/A.md', why: 'because' }, { path: 'Projects/A/b.md', why: '' }]);
  });

  test('checkFrontmatter is strict where the reader is forgiving', () => {
    expect(checkFrontmatter('---\ntitle: A\nstage: sprout\n---\nbody\n', { required: true })).toEqual({ ok: true });
    expect(checkFrontmatter('---\ntitle: A\nstage: [sprout\n---\nbody\n').ok).toBe(false);
    expect(checkFrontmatter('---\ntitle: A\nbody, never closed\n').ok).toBe(false);
    expect(checkFrontmatter('just prose\n').ok).toBe(true);
    expect(checkFrontmatter('just prose\n', { required: true }).ok).toBe(false);
  });

  test('vetPageEdits allows its own entry and bundle, refuses the rest with reasons', () => {
    const { bundle } = makePalace();
    writeFileSync(path.join(root, 'Projects/Other.md'), '---\ntitle: Other\ntype: concept\n---\n');
    writeFileSync(path.join(bundle, 'Test Steward — Context.md'), '---\ntitle: Test Steward — Context\ntype: context\n---\nwhy\n');
    writeFileSync(path.join(bundle, 'Dialectic.md'), '---\ntitle: Dialectic\ntype: concept\n---\nanother page\n');
    writeFileSync(path.join(bundle, 'Test Steward — scroll.md'), 'scroll\n');
    writeFileSync(path.join(bundle, 'broken.md'), '---\ntitle: [broken\n---\n');
    writeFileSync(path.join(bundle, 'synth.py'), 'print(1)\n');
    const v = vetPageEdits({
      palaceRoot: root, home: 'Test Steward', entryFile: path.join(root, ENTRY), bundleDir: bundle,
      edits: [
        { path: ENTRY, why: 'stage: sprout' },
        { path: `${B}/Test Steward — Context.md`, why: 'folded lesson 3' },
        { path: `${B}/synth.py`, why: 'code' },
        { path: 'Projects/Other.md', why: 'a mirror link' },
        { path: `${B}/Dialectic.md`, why: 'tidy' },
        { path: `${B}/Test Steward — scroll.md`, why: 'orders' },
        { path: `${B}/broken.md`, why: 'oops' },
        { path: `${B}/gone.md`, why: 'never made' },
        { path: '../escape.md', why: 'no' },
      ],
    });
    expect(v.allowed.map((e) => e.path)).toEqual([ENTRY, `${B}/Test Steward — Context.md`, `${B}/synth.py`]);
    const why = Object.fromEntries(v.refused.map((e) => [e.path, e]));
    expect(why['Projects/Other.md'].proposal).toBe(true);
    expect(why[`${B}/Dialectic.md`].reason).toMatch(/another entry/);
    expect(why[`${B}/Dialectic.md`].proposal).toBe(true);
    expect(why[`${B}/Test Steward — scroll.md`].reason).toMatch(/the cycle writes/);
    expect(why[`${B}/broken.md`].reason).toMatch(/frontmatter does not parse/);
    expect(why[`${B}/gone.md`].reason).toBe('no such file');
    expect(why['../escape.md'].reason).toBe('outside the palace');
  });

  // The Shopkeeper is grown up for the whole Shop (2026-10-18); every other
  // steward keeps its own page and bundle.
  test('grownUpFor lets a steward write any page under those folders, new entries too, but never a scroll', () => {
    const { bundle } = makePalace();
    mkdirSync(path.join(root, 'Shop/FLUX'), { recursive: true });
    writeFileSync(path.join(root, 'Shop/FLUX.md'), '---\ntitle: FLUX\ntype: specialist\n---\n# FLUX\nstale note\n');
    writeFileSync(path.join(root, 'Shop/OCR Smith.md'), '---\ntitle: OCR Smith\ntype: specialist\nstatus: stub\n---\n# OCR Smith\n');
    writeFileSync(path.join(root, 'Shop/FLUX/recipe.md'), 'notes, no frontmatter\n');
    writeFileSync(path.join(root, 'Shop/FLUX/FLUX — scroll.md'), 'scroll\n');
    writeFileSync(path.join(root, 'Shop/Broken.md'), '---\ntitle: [broken\n---\n');
    writeFileSync(path.join(root, 'Shopping.md'), '---\ntitle: Shopping\ntype: concept\n---\n');
    writeFileSync(path.join(root, 'Projects/Other.md'), '---\ntitle: Other\ntype: concept\n---\n');
    writeFileSync(path.join(bundle, 'Dialectic.md'), '---\ntitle: Dialectic\ntype: concept\n---\nanother page\n');
    const edits = [
      { path: ENTRY, why: 'stage' },
      { path: 'Shop/FLUX.md', why: 'dated staleness note' },
      { path: 'Shop/OCR Smith.md', why: 'new stub Specialist' },
      { path: 'Shop/FLUX/recipe.md', why: 'recipe' },
      { path: 'Shop/FLUX/FLUX — scroll.md', why: 'orders' },
      { path: 'Shop/Broken.md', why: 'oops' },
      { path: 'Shopping.md', why: 'a sibling name is not the folder' },
      { path: 'Projects/Other.md', why: 'a mirror link' },
      { path: `${B}/Dialectic.md`, why: 'tidy' },
    ];
    const wide = vetPageEdits({ palaceRoot: root, home: 'Test Steward', entryFile: path.join(root, ENTRY), bundleDir: bundle, grownUpFor: ['Shop/', '../outside'], edits });
    expect(wide.allowed.map((e) => e.path)).toEqual([ENTRY, 'Shop/FLUX.md', 'Shop/OCR Smith.md', 'Shop/FLUX/recipe.md']);
    const why = Object.fromEntries(wide.refused.map((e) => [e.path, e]));
    expect(why['Shop/FLUX/FLUX — scroll.md'].reason).toMatch(/a scroll/);
    expect(why['Shop/Broken.md'].reason).toMatch(/frontmatter does not parse/);
    expect(why['Shopping.md'].reason).toBe('another page or canon, outside its own page, bundle and Shop/');
    expect(why['Projects/Other.md'].proposal).toBe(true);
    expect(why[`${B}/Dialectic.md`].reason).toMatch(/another entry/);

    const fenced = vetPageEdits({ palaceRoot: root, home: 'Test Steward', entryFile: path.join(root, ENTRY), bundleDir: bundle, edits });
    expect(fenced.allowed.map((e) => e.path)).toEqual([ENTRY]);
    expect(Object.fromEntries(fenced.refused.map((e) => [e.path, e.reason]))['Shop/FLUX.md']).toBe('another page or canon, outside its own page and bundle');
  });

  test('its own entry with broken frontmatter is refused loudly', () => {
    const { bundle } = makePalace();
    writeFileSync(path.join(root, ENTRY), '---\ntitle: Test Steward\ntype: project\nstage: sprout: oops\n---\n# Test Steward\n');
    const v = vetPageEdits({ palaceRoot: root, home: 'Test Steward', entryFile: path.join(root, ENTRY), bundleDir: bundle, edits: [{ path: ENTRY, why: 'stage' }] });
    expect(v.allowed).toEqual([]);
    expect(v.refused[0].reason).toMatch(/frontmatter does not parse/);
  });

  function gitPalace() {
    const made = makePalace();
    git(root, ['init', '-q', '-b', 'main']);
    git(root, ['config', 'user.name', 'test']);
    git(root, ['config', 'user.email', 'test@example.com']);
    writeFileSync(path.join(root, '.gitignore'), 'transcript.jsonl\n');
    writeFileSync(path.join(root, 'Projects/Other.md'), '---\ntitle: Other\ntype: concept\n---\n# Other\n');
    git(root, ['add', '-A']);
    git(root, ['commit', '-q', '-m', 'init']);
    return made;
  }
  const editMsg = (id) => ({
    schema_version: '1.0', id, ts: '2026-10-16T08:00:00-04:00', session_id: 's',
    from: 'Test Steward', to: '*', type: 'BROADCAST', board: 'GENERAL',
    payload: {
      kind: 'shipped_artifact', headline: 'Grew to sprout', content: 'Two runs proved it alive.',
      page_edits: [
        { path: ENTRY, why: 'two runs proved it alive, so stage: sprout' },
        { path: 'Projects/Other.md', why: 'a mirror link back' },
      ],
    },
  });
  const steward = (cycleTs) => {
    writeFileSync(path.join(root, ENTRY), '---\ntitle: Test Steward\ntype: project\nstage: sprout\nstatus: active\n---\n# Test Steward\nNow alive.\n');
    writeFileSync(path.join(root, 'Projects/Other.md'), '---\ntitle: Other\ntype: concept\n---\n# Other\nmirrors Test Steward\n');
  };

  test('the cycle commits its own entry by name, refuses the other page, and the trail and board say so', () => {
    const { agentDir, bundle } = gitPalace();
    steward();
    const transcriptPath = path.join(root, 'transcript.jsonl');
    writeFileSync(transcriptPath, assistantLine([editMsg('pe-1')]));
    const summary = processCycle({ palaceRoot: root, transcriptPath, agentDir, cycleN: 14, iteration: 1, tsNow: '2026-10-16T08:12:00-04:00', commit: true });
    expect(summary.commit.ok, summary.commit.error).toBe(true);
    expect(summary.page_edits.allowed.map((e) => e.path)).toEqual([ENTRY]);
    expect(summary.page_edits.refused.map((e) => e.path)).toEqual(['Projects/Other.md']);
    const files = git(root, ['-c', 'core.quotepath=false', 'show', '--name-only', '--format=', 'HEAD']).trim().split('\n');
    expect(files).toContain(ENTRY);
    expect(files).not.toContain('Projects/Other.md');
    const body = git(root, ['log', '-1', '--format=%b']);
    expect(body).toMatch(/Changed the page:\n- Projects\/Test Steward\.md — two runs proved it alive/);
    expect(body).toMatch(/Page edits NOT committed:\n- Projects\/Other\.md — another page .*; it stays a proposal/);
    // The board carries the vetted truth, and the trail reads it.
    const board = readFileSync(path.join(root, '_ops/swarm/persistent/blackboard.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    const posted = board.find((m) => m.id === 'pe-1');
    expect(posted.payload.page_edits.map((e) => e.path)).toEqual([ENTRY]);
    expect(posted.payload.page_edits_refused[0].proposal).toBe(true);
    const scroll = readFileSync(path.join(bundle, 'Test Steward — scroll.md'), 'utf8');
    expect(scroll).toContain('_Changed the page:_ Test Steward — two runs proved it alive, so stage: sprout');
    expect(scroll).toContain('_Page edit not committed:_ Projects/Other.md');
    const hist = readFileSync(path.join(root, agentDir, 'history.jsonl'), 'utf8');
    expect(hist).toMatch(/"event":"PAGE_EDIT","ts":[^\n]*"path":"Projects\/Test Steward\.md"/);
    expect(hist).toMatch(/"event":"PAGE_EDIT_REFUSED"/);
    // The other page is left on disk, uncommitted, for a person to look at.
    expect(git(root, ['status', '--porcelain', '--', 'Projects/Other.md'])).toMatch(/M/);
  });

  test('a manifest\'s grown_up_for carries through the cycle: a new Shop entry and an edit to another Shop page both ride', () => {
    const { agentDir } = gitPalace();
    const manifestPath = path.join(root, agentDir, 'manifest.json');
    writeFileSync(manifestPath, JSON.stringify({ ...JSON.parse(readFileSync(manifestPath, 'utf8')), grown_up_for: ['Shop'] }));
    mkdirSync(path.join(root, 'Shop'), { recursive: true });
    writeFileSync(path.join(root, 'Shop/FLUX.md'), '---\ntitle: FLUX\ntype: specialist\n---\n# FLUX\n');
    git(root, ['add', '-A']);
    git(root, ['commit', '-q', '-m', 'shop']);
    writeFileSync(path.join(root, 'Shop/FLUX.md'), '---\ntitle: FLUX\ntype: specialist\n---\n# FLUX\n\n**2026-10-18** — FLUX 3 shipped; this entry is pinned to Krea-dev.\n');
    writeFileSync(path.join(root, 'Shop/OCR Smith.md'), '---\ntitle: OCR Smith\ntype: specialist\nstatus: stub\n---\n# OCR Smith\n');
    const transcriptPath = path.join(root, 'transcript.jsonl');
    const msg = editMsg('pe-shop');
    msg.payload.page_edits = [
      { path: 'Shop/FLUX.md', why: 'dated staleness note' },
      { path: 'Shop/OCR Smith.md', why: 'new stub Specialist' },
      { path: 'Projects/Other.md', why: 'still outside the Shop' },
    ];
    writeFileSync(transcriptPath, assistantLine([msg]));
    const summary = processCycle({ palaceRoot: root, transcriptPath, agentDir, cycleN: 16, iteration: 1, tsNow: '2026-10-18T08:12:00-04:00', commit: 'plan' });
    expect(summary.page_edits.allowed.map((e) => e.path)).toEqual(['Shop/FLUX.md', 'Shop/OCR Smith.md']);
    expect(summary.page_edits.refused.map((e) => e.path)).toEqual(['Projects/Other.md']);
    expect(summary.commit.plan.paths).toEqual(expect.arrayContaining(['Shop/FLUX.md', 'Shop/OCR Smith.md']));
    expect(summary.commit.plan.paths).not.toContain('Projects/Other.md');
  });

  test('a broken frontmatter on its own entry is not committed, and the rest of the cycle still is', async () => {
    const { agentDir } = gitPalace();
    writeFileSync(path.join(root, ENTRY), '---\ntitle: Test Steward\ntype: project\nstage: [sprout\n---\n# Test Steward\n');
    const transcriptPath = path.join(root, 'transcript.jsonl');
    writeFileSync(transcriptPath, assistantLine([{ ...editMsg('pe-2'), payload: { ...editMsg('pe-2').payload, page_edits: [{ path: ENTRY, why: 'stage' }] } }]));
    const summary = processCycle({ palaceRoot: root, transcriptPath, agentDir, cycleN: 15, iteration: 1, tsNow: '2026-10-16T08:12:00-04:00', commit: 'plan' });
    expect(summary.page_edits.allowed).toEqual([]);
    expect(summary.page_edits.refused[0].reason).toMatch(/frontmatter does not parse/);
    expect(summary.commit.plan.paths).not.toContain(ENTRY);
    expect(summary.commit.plan.body).toMatch(/Page edits NOT committed:\n- Projects\/Test Steward\.md — frontmatter does not parse/);
    const res = await commitPathsAsync({ palaceRoot: root, ...summary.commit.plan });
    expect(res.ok, res.error).toBe(true);
    const files = git(root, ['-c', 'core.quotepath=false', 'show', '--name-only', '--format=', 'HEAD']).trim().split('\n');
    expect(files).not.toContain(ENTRY);
    expect(files).toContain('_ops/agents/permanent/test-steward/state.json');
  });
});
