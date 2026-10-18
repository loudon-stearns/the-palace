import { describe, test, expect, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, chmodSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { shippedPaths, selectCommitPaths, headlineOf, commitPathsAsync, commitPaths, ignoredPaths, planCycleCommit, cycleBody, pageEditsOf, checkFrontmatter, vetPageEdits, proposedEditsOf, proposalTarget, vetProposedEdits, faceOrMemory } from '../../src/cycle-commit.js';
import { parseProposals, parseOwed, tailRead } from '../../src/ledger.js';
import { readFileSync } from 'node:fs';
import { processCycle } from '../../src/process-cycle.js';
import { gitFreeEnv, assertScratchRepo } from '../helpers/git-env.js';

function assistantLine(fences) {
  const text = fences.map((f) => '```json\n' + JSON.stringify(f) + '\n```').join('\n\n');
  return JSON.stringify({ type: 'assistant', message: { usage: {}, content: [{ type: 'text', text }] } });
}

const git = (root, args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', env: gitFreeEnv() });

let root;
// maxRetries: on macOS a fresh git repo's folder can still be settling when it
// is removed, and rmSync then fails with ENOTEMPTY; a retry clears it.
afterEach(() => { if (root) rmSync(root, { recursive: true, force: true, maxRetries: 5 }); root = null; });

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
    assertScratchRepo(root);
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
    assertScratchRepo(root);
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
    assertScratchRepo(root);
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
    assertScratchRepo(root);
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
    assertScratchRepo(root);
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

// No steward edits the house without Loudon's eyes (2026-10-18). This
// reverses the 2026-10-16 own-page grant and the Shopkeeper's 2026-10-18 reach
// over Shop/: `page_edits` carries workshop files in its own bundle only, and
// every change it wants to an entry, its own included, is a `proposed_edits`
// item the cycle files in its tuning ledger as owed until Loudon's review.
describe('a steward\'s page edits: the workshop rides, the house is refused', () => {
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

  test('vetPageEdits allows workshop files in its own bundle and refuses its own entry, its Context, any entry and every other page', () => {
    const { bundle } = makePalace();
    writeFileSync(path.join(root, 'Projects/Other.md'), '---\ntitle: Other\ntype: concept\n---\n');
    writeFileSync(path.join(bundle, 'Test Steward — Context.md'), '---\ntitle: Test Steward — Context\n---\nwhy\n');
    writeFileSync(path.join(bundle, 'Dialectic.md'), '---\ntitle: Dialectic\ntype: concept\n---\nanother page\n');
    writeFileSync(path.join(bundle, 'Test Steward — scroll.md'), 'scroll\n');
    writeFileSync(path.join(bundle, 'broken.md'), '---\ntitle: [broken\n---\n');
    writeFileSync(path.join(bundle, 'synth.py'), 'print(1)\n');
    writeFileSync(path.join(bundle, 'notes.md'), '---\ntitle: notes\n---\nworkshop notes\n');
    const v = vetPageEdits({
      palaceRoot: root, home: 'Test Steward', entryFile: path.join(root, ENTRY), bundleDir: bundle,
      edits: [
        { path: ENTRY, why: 'stage: sprout' },
        { path: `${B}/Test Steward — Context.md`, why: 'folded lesson 3' },
        { path: `${B}/synth.py`, why: 'code' },
        { path: `${B}/notes.md`, why: 'probe notes' },
        { path: 'Projects/Other.md', why: 'a mirror link' },
        { path: `${B}/Dialectic.md`, why: 'tidy' },
        { path: `${B}/Test Steward — scroll.md`, why: 'orders' },
        { path: `${B}/broken.md`, why: 'oops' },
        { path: `${B}/gone.md`, why: 'never made' },
        { path: '../escape.md', why: 'no' },
      ],
    });
    expect(v.allowed.map((e) => e.path)).toEqual([`${B}/synth.py`, `${B}/notes.md`]);
    const why = Object.fromEntries(v.refused.map((e) => [e.path, e]));
    expect(why[ENTRY]).toMatchObject({ proposal: true, reason: expect.stringMatching(/its own entry: it changes only through Loudon's review: post it in `proposed_edits`/) });
    expect(why[`${B}/Test Steward — Context.md`]).toMatchObject({ proposal: true, reason: expect.stringMatching(/its own Context/) });
    expect(why['Projects/Other.md']).toMatchObject({ proposal: true, reason: expect.stringMatching(/another page or canon, outside its own bundle/) });
    expect(why[`${B}/Dialectic.md`]).toMatchObject({ proposal: true, reason: expect.stringMatching(/an entry kept in its bundle/) });
    expect(why[`${B}/Test Steward — scroll.md`].reason).toMatch(/the cycle writes/);
    expect(why[`${B}/broken.md`].reason).toMatch(/frontmatter does not parse/);
    expect(why[`${B}/gone.md`].reason).toBe('no such file');
    expect(why['../escape.md'].reason).toBe('outside the palace');
  });

  // The Shopkeeper's 2026-10-18 reach over Shop/ is withdrawn the same day: a
  // `grownUpFor` passed in, as a stale manifest would carry it, widens nothing.
  test('no folder grant widens it: a Shop page and a new Shop entry are refused like any other page', () => {
    const { bundle } = makePalace();
    mkdirSync(path.join(root, 'Shop'), { recursive: true });
    writeFileSync(path.join(root, 'Shop/FLUX.md'), '---\ntitle: FLUX\ntype: specialist\n---\n# FLUX\nstale note\n');
    writeFileSync(path.join(root, 'Shop/OCR Smith.md'), '---\ntitle: OCR Smith\ntype: specialist\nstatus: stub\n---\n# OCR Smith\n');
    const edits = [{ path: 'Shop/FLUX.md', why: 'dated staleness note' }, { path: 'Shop/OCR Smith.md', why: 'new stub Specialist' }];
    const v = vetPageEdits({ palaceRoot: root, home: 'Test Steward', entryFile: path.join(root, ENTRY), bundleDir: bundle, grownUpFor: ['Shop'], edits });
    expect(v.allowed).toEqual([]);
    expect(v.refused.map((e) => [e.path, e.proposal])).toEqual([['Shop/FLUX.md', true], ['Shop/OCR Smith.md', true]]);
  });

  // The workshop is "not its faces or its memory" (ELDER § Age and its limits),
  // and no bundle file carries `type:`, so the vetter names them.
  test('its faces and memory are refused like its entry: Context, rich face, diary, batons, any ledger', () => {
    const { bundle } = makePalace();
    const files = {
      'Test Steward — rich.json': '{}',
      'Test Steward — rich — marimba.wav': 'wav',
      'Test Steward — diary.md': '---\ntitle: d\n---\n',
      'Test Steward — baton.md': '---\ntitle: b\n---\n',
      'Test Steward — baton — marimba-top.md': '---\ntitle: b\n---\n',
      'probe log.md': '---\ntitle: probe log\nledger: probes\n---\n- a line\n',
      'Test Steward — spec — visuals.md': '---\ntitle: spec\n---\na spec is workshop\n',
      'renders/hero-try.png': 'png',
    };
    mkdirSync(path.join(bundle, 'renders'), { recursive: true });
    for (const [f, t] of Object.entries(files)) writeFileSync(path.join(bundle, f), t);
    const v = vetPageEdits({ palaceRoot: root, home: 'Test Steward', entryFile: path.join(root, ENTRY), bundleDir: bundle, edits: Object.keys(files).map((f) => ({ path: `${B}/${f}`, why: 'x' })) });
    expect(v.allowed.map((e) => e.path)).toEqual([`${B}/Test Steward — spec — visuals.md`, `${B}/renders/hero-try.png`]);
    expect(Object.fromEntries(v.refused.map((e) => [path.basename(e.path), e.reason.split(',')[0]]))).toEqual({
      'Test Steward — rich.json': 'its own rich face',
      'Test Steward — rich — marimba.wav': 'its own rich face',
      'Test Steward — diary.md': 'its own diary',
      'Test Steward — baton.md': 'its own baton',
      'Test Steward — baton — marimba-top.md': 'its own baton',
      'probe log.md': 'its own ledger',
    });
    expect(v.refused.every((e) => e.proposal)).toBe(true);
    expect(faceOrMemory('Test Steward', path.join(bundle, 'Test Steward — Context.md'))).toBe('Context');
    expect(faceOrMemory('Test Steward', path.join(bundle, 'renders/hero-try.png'))).toBeNull();
  });

  function gitPalace() {
    const made = makePalace();
    git(root, ['init', '-q', '-b', 'main']);
    assertScratchRepo(root);
    git(root, ['config', 'user.name', 'test']);
    git(root, ['config', 'user.email', 'test@example.com']);
    writeFileSync(path.join(root, '.gitignore'), 'transcript.jsonl\n');
    writeFileSync(path.join(root, 'Projects/Other.md'), '---\ntitle: Other\ntype: concept\n---\n# Other\n');
    git(root, ['add', '-A']);
    git(root, ['commit', '-q', '-m', 'init']);
    return made;
  }
  const editMsg = (id) => ({
    schema_version: '1.0', id, ts: '2026-10-18T08:00:00-04:00', session_id: 's',
    from: 'Test Steward', to: '*', type: 'BROADCAST', board: 'GENERAL',
    payload: {
      kind: 'shipped_artifact', headline: 'A probe, and the page it argues for', content: 'Two runs proved it alive.',
      page_edits: [
        { path: `${B}/probe.py`, why: 'the probe' },
        { path: ENTRY, why: 'two runs proved it alive, so stage: sprout' },
        { path: 'Projects/Other.md', why: 'a mirror link back' },
      ],
    },
  });

  test('the cycle commits the workshop file by name, refuses its own entry and the other page, and the trail and board say so', () => {
    const { agentDir, bundle } = gitPalace();
    writeFileSync(path.join(bundle, 'probe.py'), 'print("probe")\n');
    writeFileSync(path.join(root, ENTRY), '---\ntitle: Test Steward\ntype: project\nstage: sprout\nstatus: active\n---\n# Test Steward\nNow alive.\n');
    writeFileSync(path.join(root, 'Projects/Other.md'), '---\ntitle: Other\ntype: concept\n---\n# Other\nmirrors Test Steward\n');
    const transcriptPath = path.join(root, 'transcript.jsonl');
    writeFileSync(transcriptPath, assistantLine([editMsg('pe-1')]));
    const summary = processCycle({ palaceRoot: root, transcriptPath, agentDir, cycleN: 14, iteration: 1, tsNow: '2026-10-18T08:12:00-04:00', commit: true });
    expect(summary.commit.ok, summary.commit.error).toBe(true);
    expect(summary.page_edits.allowed.map((e) => e.path)).toEqual([`${B}/probe.py`]);
    expect(summary.page_edits.refused.map((e) => e.path)).toEqual([ENTRY, 'Projects/Other.md']);
    const files = git(root, ['-c', 'core.quotepath=false', 'show', '--name-only', '--format=', 'HEAD']).trim().split('\n');
    expect(files).toContain(`${B}/probe.py`);
    expect(files).not.toContain(ENTRY);
    expect(files).not.toContain('Projects/Other.md');
    const body = git(root, ['log', '-1', '--format=%b']);
    expect(body).toMatch(/Changed in the workshop:\n- Projects\/Test Steward\/probe\.py — the probe/);
    expect(body).toMatch(/Page edits NOT committed:\n- Projects\/Test Steward\.md — its own entry: it changes only through Loudon's review/);
    // The board carries the vetted truth, and the trail reads it.
    const board = readFileSync(path.join(root, '_ops/swarm/persistent/blackboard.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    const posted = board.find((m) => m.id === 'pe-1');
    expect(posted.payload.page_edits.map((e) => e.path)).toEqual([`${B}/probe.py`]);
    expect(posted.payload.page_edits_refused.every((e) => e.proposal)).toBe(true);
    const scroll = readFileSync(path.join(bundle, 'Test Steward — scroll.md'), 'utf8');
    expect(scroll).toContain('_Changed in the workshop:_ probe.py — the probe');
    expect(scroll).toContain("_Page edit not committed:_ Projects/Test Steward.md — its own entry: it changes only through Loudon's review");
    const hist = readFileSync(path.join(root, agentDir, 'history.jsonl'), 'utf8');
    expect(hist).toMatch(/"event":"PAGE_EDIT","ts":[^\n]*"path":"Projects\/Test Steward\/probe\.py"/);
    expect(hist).toMatch(/"event":"PAGE_EDIT_REFUSED"[^\n]*"path":"Projects\/Test Steward\.md"/);
    // What it wrote anyway is left on disk, uncommitted, for a person to look at.
    expect(git(root, ['status', '--porcelain', '--', ENTRY, 'Projects/Other.md'])).toMatch(/M/);
  });

  test('a stale grown_up_for in the manifest carries nothing through the cycle', () => {
    const { agentDir } = gitPalace();
    const manifestPath = path.join(root, agentDir, 'manifest.json');
    writeFileSync(manifestPath, JSON.stringify({ ...JSON.parse(readFileSync(manifestPath, 'utf8')), grown_up_for: ['Shop'] }));
    mkdirSync(path.join(root, 'Shop'), { recursive: true });
    writeFileSync(path.join(root, 'Shop/FLUX.md'), '---\ntitle: FLUX\ntype: specialist\n---\n# FLUX\n');
    git(root, ['add', '-A']);
    git(root, ['commit', '-q', '-m', 'shop']);
    writeFileSync(path.join(root, 'Shop/FLUX.md'), '---\ntitle: FLUX\ntype: specialist\n---\n# FLUX\n\n**2026-10-18** — FLUX 3 shipped.\n');
    writeFileSync(path.join(root, 'Shop/OCR Smith.md'), '---\ntitle: OCR Smith\ntype: specialist\nstatus: stub\n---\n# OCR Smith\n');
    const transcriptPath = path.join(root, 'transcript.jsonl');
    const msg = editMsg('pe-shop');
    msg.payload.page_edits = [{ path: 'Shop/FLUX.md', why: 'dated staleness note' }, { path: 'Shop/OCR Smith.md', why: 'new stub Specialist' }];
    writeFileSync(transcriptPath, assistantLine([msg]));
    const summary = processCycle({ palaceRoot: root, transcriptPath, agentDir, cycleN: 16, iteration: 1, tsNow: '2026-10-18T08:12:00-04:00', commit: 'plan' });
    expect(summary.page_edits.allowed).toEqual([]);
    expect(summary.page_edits.refused.map((e) => e.path)).toEqual(['Shop/FLUX.md', 'Shop/OCR Smith.md']);
    expect(summary.commit.plan.paths).not.toContain('Shop/FLUX.md');
    expect(summary.commit.plan.paths).not.toContain('Shop/OCR Smith.md');
    expect(summary.shop_roster).toBeNull();
  });

  test('a workshop .md whose frontmatter breaks is not committed, and the rest of the cycle still is', async () => {
    const { agentDir, bundle } = gitPalace();
    writeFileSync(path.join(bundle, 'notes.md'), '---\ntitle: notes\nstage: [oops\n---\nnotes\n');
    const transcriptPath = path.join(root, 'transcript.jsonl');
    writeFileSync(transcriptPath, assistantLine([{ ...editMsg('pe-2'), payload: { ...editMsg('pe-2').payload, page_edits: [{ path: `${B}/notes.md`, why: 'notes' }] } }]));
    const summary = processCycle({ palaceRoot: root, transcriptPath, agentDir, cycleN: 15, iteration: 1, tsNow: '2026-10-18T08:12:00-04:00', commit: 'plan' });
    expect(summary.page_edits.allowed).toEqual([]);
    expect(summary.page_edits.refused[0].reason).toMatch(/frontmatter does not parse/);
    expect(summary.commit.plan.paths).not.toContain(`${B}/notes.md`);
    expect(summary.commit.plan.body).toMatch(/Page edits NOT committed:\n- Projects\/Test Steward\/notes\.md — frontmatter does not parse/);
    const res = await commitPathsAsync({ palaceRoot: root, ...summary.commit.plan });
    expect(res.ok, res.error).toBe(true);
    const files = git(root, ['-c', 'core.quotepath=false', 'show', '--name-only', '--format=', 'HEAD']).trim().split('\n');
    expect(files).not.toContain(`${B}/notes.md`);
    expect(files).toContain('_ops/agents/permanent/test-steward/state.json');
  });
});

// The ledger route (2026-10-18): what a steward wants in the house is posted as
// `proposed_edits`, filed in its own tuning ledger as an item owed until
// Loudon's review, read back by its next cycles, and shown on its trail.
describe('a steward\'s proposals for canon', () => {
  const ENTRY = 'Projects/Test Steward.md';
  const B = 'Projects/Test Steward';
  const LEDGER = `${B}/Test Steward — tuning.md`;

  test('proposedEditsOf reads page, place, words and why, keeping the words\' line breaks', () => {
    expect(proposedEditsOf([
      { payload: { proposed_edits: [
        { page: ' [[Shopkeeper]] ', place: ' § Roster ', words: '\nLine one.\n\nLine two.  \n', why: ' the roster is   generated now ' },
        { path: 'Shop/FLUX.md', section: 'Gotchas', text: 'FLUX 3 shipped.' },
        'not an item',
      ] } },
      { payload: {} },
    ])).toEqual([
      { page: '[[Shopkeeper]]', place: '§ Roster', words: 'Line one.\n\nLine two.', why: 'the roster is generated now', urgent: false, replaces: [] },
      { page: 'Shop/FLUX.md', place: 'Gotchas', words: 'FLUX 3 shipped.', why: '', urgent: false, replaces: [] },
    ]);
    expect(proposedEditsOf([{ payload: { proposed_edits: [{ page: 'A', words: 'w', urgent: true, replaces: ['item 4', 7, 'x'] }, { page: 'B', words: 'w', urgent: 'yes', replaces: '5' }] } }])
      .map((e) => [e.urgent, e.replaces])).toEqual([[true, ['4', '7']], [true, ['5']]]);
  });

  test('proposalTarget names an entry by title or path, a plain file by path, and a new page as new', () => {
    makePalace();
    mkdirSync(path.join(root, '_ops/heartbeat'), { recursive: true });
    writeFileSync(path.join(root, '_ops/heartbeat/README.md'), '# heartbeat\n');
    expect(proposalTarget(root, '[[Test Steward|the page]]')).toEqual({ page: 'Test Steward', path: ENTRY, entry: true, exists: true });
    expect(proposalTarget(root, ENTRY)).toEqual({ page: 'Test Steward', path: ENTRY, entry: true, exists: true });
    expect(proposalTarget(root, '_ops/heartbeat/README.md')).toEqual({ page: '_ops/heartbeat/README.md', path: '_ops/heartbeat/README.md', entry: false, exists: true });
    expect(proposalTarget(root, 'OCR Smith')).toEqual({ page: 'OCR Smith', path: null, entry: false, exists: false });
    expect(proposalTarget(root, 'Shop/OCR Smith.md')).toEqual({ page: 'OCR Smith', path: 'Shop/OCR Smith.md', entry: false, exists: false });
    expect(proposalTarget(root, '../outside.md')).toEqual({ error: 'outside the palace' });
  });

  test('vetProposedEdits files every target, the house included, and drops only what cannot be filed', () => {
    makePalace();
    const v = vetProposedEdits({ palaceRoot: root, edits: [
      { page: 'Test Steward', place: 'frontmatter', words: 'stage: sprout', why: 'two runs proved it alive' },
      { page: 'CLAUDE', place: '', words: 'a canon line', why: '' },
      { page: '', place: '', words: 'orphan words', why: 'no page' },
      { page: 'Test Steward', place: '', words: '   ', why: 'no words' },
      { page: '../x.md', place: '', words: 'w', why: 'escape' },
    ] });
    expect(v.filed.map((p) => [p.page, p.path, p.exists])).toEqual([['Test Steward', ENTRY, true], ['CLAUDE', null, false]]);
    expect(v.dropped.map((d) => d.reason)).toEqual(['names no page', 'carries no words', 'outside the palace']);
  });

  function gitPalace() {
    const made = makePalace();
    git(root, ['init', '-q', '-b', 'main']);
    assertScratchRepo(root);
    git(root, ['config', 'user.name', 'test']);
    git(root, ['config', 'user.email', 'test@example.com']);
    writeFileSync(path.join(root, '.gitignore'), 'transcript.jsonl\n');
    mkdirSync(path.join(root, 'Shop'), { recursive: true });
    writeFileSync(path.join(root, 'Shop/The Shop.md'), '---\ntitle: The Shop\ntype: hub\n---\n# The Shop\n');
    git(root, ['add', '-A']);
    git(root, ['commit', '-q', '-m', 'init']);
    return made;
  }
  const proposeMsg = (id, proposals) => ({
    schema_version: '1.0', id, ts: '2026-10-18T08:00:00-04:00', session_id: 's',
    from: 'Test Steward', to: '*', type: 'BROADCAST', board: 'GENERAL',
    payload: { kind: 'shipped_artifact', headline: 'A probe, and two changes it argues for', content: 'The probe ran twice.', proposed_edits: proposals },
  });
  const STAGE = { page: 'Test Steward', place: 'frontmatter', words: 'stage: sprout', why: 'two runs proved it alive' };
  const HUB = { page: 'The Shop', place: '§ Current Bet', words: 'The bet now:\n\n- one\n- two', why: 'the bet moved' };
  const run = (agentDir, id, proposals, cycleN, commit = true) => {
    const transcriptPath = path.join(root, 'transcript.jsonl');
    writeFileSync(transcriptPath, assistantLine([proposeMsg(id, proposals)]));
    return processCycle({ palaceRoot: root, transcriptPath, agentDir, cycleN, iteration: cycleN, tsNow: '2026-10-18T08:12:00-04:00', commit });
  };

  test('a proposal grows the ledger and is filed as an item owed until review; the pages never change', () => {
    const { agentDir, bundle } = gitPalace();
    const entryBefore = readFileSync(path.join(root, ENTRY), 'utf8');
    const summary = run(agentDir, 'pr-1', [STAGE, HUB], 21);
    expect(summary.commit.ok, summary.commit.error).toBe(true);
    expect(summary.run).toMatchObject({ grown: true, line: '- run · 2026-10-18 · cycle 21 · proposed items 1, 2 for canon', proposed: [1, 2] });
    expect(summary.proposed_edits.filed.map((p) => [p.page, p.item])).toEqual([['Test Steward', 1], ['The Shop', 2]]);
    // The house is untouched: the entry reads as before, and only the cycle's own files rode.
    expect(readFileSync(path.join(root, ENTRY), 'utf8')).toBe(entryBefore);
    const files = git(root, ['-c', 'core.quotepath=false', 'show', '--name-only', '--format=', 'HEAD']).trim().split('\n');
    expect(files).toContain(LEDGER);
    expect(files).not.toContain(ENTRY);
    expect(files).not.toContain('Shop/The Shop.md');
    // The ledger holds each as a numbered item the existing owed machinery counts.
    const ledger = readFileSync(path.join(root, LEDGER), 'utf8');
    expect(ledger).toContain('1. **Proposed for canon** · 2026-10-18 · [[Test Steward]] · frontmatter · canon change owed *(proposed by the steward, cycle 21)*');
    expect(ledger).toContain('   Why: two runs proved it alive');
    expect(ledger).toContain('   Path: `Projects/Test Steward.md`');
    expect(ledger).toContain('   > The bet now:\n   >\n   > - one\n   > - two');
    expect(parseOwed(ledger).map((o) => o.n)).toEqual(['1', '2']);
    expect(tailRead(ledger).recent.join('\n')).toContain('Proposed for canon');
    expect(parseProposals(ledger).map((p) => [p.n, p.page, p.place, p.why, p.words, p.owed])).toEqual([
      ['1', 'Test Steward', 'frontmatter', 'two runs proved it alive', 'stage: sprout', true],
      ['2', 'The Shop', '§ Current Bet', 'the bet moved', 'The bet now:\n\n- one\n- two', true],
    ]);
    // The commit body, the history and the trail say each was proposed for canon.
    const body = git(root, ['log', '-1', '--format=%b']);
    expect(body).toMatch(/Proposed for canon, filed in the tuning ledger and owed until Loudon's review:\n- Test Steward \(frontmatter\), item 1 — two runs proved it alive\n- The Shop \(§ Current Bet\), item 2 — the bet moved/);
    const hist = readFileSync(path.join(root, agentDir, 'history.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    expect(hist.filter((e) => e.event === 'PROPOSED_FOR_CANON').map((e) => [e.page, e.item, e.ledger])).toEqual([['Test Steward', 1, LEDGER], ['The Shop', 2, LEDGER]]);
    const scroll = readFileSync(path.join(bundle, 'Test Steward — scroll.md'), 'utf8');
    expect(scroll).toContain("_Proposed for canon:_ Test Steward (frontmatter) — two runs proved it alive; owed in the tuning ledger until Loudon's review");
    expect(scroll).toContain('- **Proposed for canon:** 2 — items 1, 2; waiting on Loudon\'s review, and the page has not changed');
    expect(scroll).toContain('### Proposed for canon');
    expect(scroll).toContain('- **Owed in the ledger:** nothing');
  });

  test('the same proposal posted again is not filed twice; a new one joins the next group', () => {
    const { agentDir } = gitPalace();
    run(agentDir, 'pr-1', [STAGE], 21);
    const again = run(agentDir, 'pr-2', [STAGE, HUB], 22);
    expect(again.run.line).toBe('- run · 2026-10-18 · cycle 22 · proposed item 2 for canon');
    expect(again.proposed_edits.already_owed.map((p) => p.page)).toEqual(['Test Steward']);
    expect(again.proposed_edits.filed.map((p) => [p.page, p.item])).toEqual([['The Shop', 2]]);
    const ledger = readFileSync(path.join(root, LEDGER), 'utf8');
    expect(parseProposals(ledger).map((p) => p.n)).toEqual(['1', '2']);
    const hist = readFileSync(path.join(root, agentDir, 'history.jsonl'), 'utf8');
    expect(hist).toMatch(/"event":"PROPOSAL_ALREADY_OWED"[^\n]*"page":"Test Steward"/);
  });

  test('one that cannot be filed is dropped, said on the board, the trail and in history', () => {
    const { agentDir, bundle } = gitPalace();
    const summary = run(agentDir, 'pr-3', [{ page: 'The Shop', words: '' , why: 'forgot the words' }], 23);
    expect(summary.run).toBeNull(); // nothing filed, so no ledger grows
    expect(summary.proposed_edits.dropped).toEqual([{ page: 'The Shop', why: 'forgot the words', reason: 'carries no words' }]);
    const board = readFileSync(path.join(root, '_ops/swarm/persistent/blackboard.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    expect(board.find((m) => m.id === 'pr-3').payload.proposed_edits).toEqual([]);
    expect(readFileSync(path.join(bundle, 'Test Steward — scroll.md'), 'utf8')).toContain('_Proposal not filed:_ The Shop — carries no words');
    expect(readFileSync(path.join(root, agentDir, 'history.jsonl'), 'utf8')).toMatch(/"event":"PROPOSAL_DROPPED"/);
  });

  // Urgent (Loudon's review design, 2026-10-18): filed like any other, and the
  // cycle also posts a Trickster ask, the way the Shopkeeper's FLUX ask reached him.
  test('an urgent proposal is filed and also posted to the board as a Trickster ask with options', () => {
    const { agentDir, bundle } = gitPalace();
    const URGENT = { ...HUB, urgent: true, why: 'the next brief reads the old bet' };
    const summary = run(agentDir, 'pr-5', [STAGE, URGENT], 25);
    expect(summary.invalid_ids).toEqual([]);
    expect(summary.posted_ids).toEqual(['pr-5', 'pr-5-urgent-1']);
    expect(summary.stop_hint).toBe('shipped'); // not blocking: the run goes on
    const board = readFileSync(path.join(root, '_ops/swarm/persistent/blackboard.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
    const ask = board.find((m) => m.id === 'pr-5-urgent-1');
    expect(ask).toMatchObject({ type: 'RESOURCE_REQUEST', board: 'TRICKSTER', to: 'TRICKSTER', from: 'Test Steward', request_id: 'pr-5-urgent-1' });
    expect(ask.payload).toMatchObject({ kind: 'choice', blocking: false, urgent_proposal: true, proposal: { page: 'The Shop', place: '§ Current Bet' } });
    expect(ask.payload.options.map((o) => o.id)).toEqual(['LAND-NOW', 'REVIEW', 'DECLINE']);
    expect(ask.payload.headline).toMatch(/^Urgent, for canon: The Shop \(§ Current Bet\) — the next brief reads the old bet/);
    expect(ask.payload.rationale).toContain('> The bet now:');
    expect(ask.health).toBeTruthy();
    // The ledger item names the ask; the proposal on the board does too.
    const ledger = readFileSync(path.join(root, LEDGER), 'utf8');
    expect(ledger).toContain('canon change owed *(proposed by the steward, cycle 25; urgent, asked as pr-5-urgent-1)*');
    expect(board.find((m) => m.id === 'pr-5').payload.proposed_edits.map((p) => [p.page, !!p.urgent, p.ask || null])).toEqual([['Test Steward', false, null], ['The Shop', true, 'pr-5-urgent-1']]);
    expect(summary.pending_after).toContain('pr-5-urgent-1');
    const scroll = readFileSync(path.join(bundle, 'Test Steward — scroll.md'), 'utf8');
    expect(scroll).toContain('_Proposed for canon, urgent:_ The Shop (§ Current Bet) — the next brief reads the old bet');
    expect(git(root, ['log', '-1', '--format=%b'])).toMatch(/- The Shop \(§ Current Bet\), item 2 — the next brief reads the old bet \(urgent; asked as pr-5-urgent-1\)/);
  });

  test('a message that fails validation posts no urgent ask, and files nothing', () => {
    const { agentDir } = gitPalace();
    const transcriptPath = path.join(root, 'transcript.jsonl');
    const bad = proposeMsg('pr-6', [{ ...HUB, urgent: true }]);
    delete bad.session_id;
    writeFileSync(transcriptPath, assistantLine([bad]));
    const summary = processCycle({ palaceRoot: root, transcriptPath, agentDir, cycleN: 26, iteration: 26, tsNow: '2026-10-18T08:12:00-04:00', commit: 'plan' });
    expect(summary.invalid_ids).toEqual(['pr-6']);
    expect(summary.posted_ids).toEqual([]);
    expect(readFileSync(path.join(root, '_ops/swarm/persistent/blackboard.jsonl'), 'utf8')).toBe('');
  });

  test('a proposal that replaces an earlier one supersedes it through the cycle', () => {
    const { agentDir } = gitPalace();
    run(agentDir, 'pr-7', [STAGE], 27);
    const summary = run(agentDir, 'pr-8', [{ ...STAGE, words: 'stage: growing', why: 'a third run', replaces: ['1'] }], 28);
    expect(summary.proposed_edits.superseded).toEqual([{ n: '1', by: 2 }]);
    const ledger = readFileSync(path.join(root, LEDGER), 'utf8');
    expect(parseProposals(ledger).filter((p) => p.owed).map((p) => [p.n, p.words])).toEqual([['2', 'stage: growing']]);
    expect(readFileSync(path.join(root, agentDir, 'history.jsonl'), 'utf8')).toMatch(/"event":"PROPOSAL_SUPERSEDED"[^\n]*"item":"1","by":2/);
  });

  test("the server path (commit: 'plan') carries the ledger and names the proposals in the body", () => {
    const { agentDir } = gitPalace();
    const summary = run(agentDir, 'pr-4', [STAGE], 24, 'plan');
    expect(summary.commit.plan.paths).toContain(LEDGER);
    expect(summary.commit.plan.paths).not.toContain(ENTRY);
    expect(summary.commit.plan.body).toMatch(/Proposed for canon[^\n]*:\n- Test Steward \(frontmatter\), item 1 — two runs proved it alive/);
  });
});
