import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, existsSync, utimesSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildMessageFromStaged, readStagedDiff, clearStaleLocks, isStagedDeletion, halfNamedMoves,
} from '../../scripts/palace-commit.mjs';
import { commitSelected, isStagedDeletion as isStagedDeletionServer } from '../../server/commit.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(__dirname, '..', '..');
const CLI = join(APP_ROOT, 'scripts', 'palace-commit.mjs');

describe('palace-commit', () => {
  let root;
  function g(...args) { return execFileSync('git', args, { cwd: root, encoding: 'utf8' }); }

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'palacecommit-'));
    g('init', '-q');
    g('config', 'user.email', 'test@palace');
    g('config', 'user.name', 'Test Palace');
    g('config', 'commit.gpgsign', 'false');
    writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\ntype: concept\nstage: seed\npillars: [tools]\nforward_vector: "I will seed."\n---\n# Foo\nbody\n');
    g('add', '-A');
    g('commit', '-q', '-m', 'deposit(Foo): seed it\n\nPalace-Kind: deposit\nPalace-Verify: verified');
  });
  afterEach(() => { rmSync(root, { recursive: true, force: true }); });

  test('readStagedDiff derives md frontmatter changes for staged edits', () => {
    writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\ntype: concept\nstage: sprout\npillars: [tools]\nforward_vector: "I will sprout and teach."\n---\n# Foo\nbody longer\n');
    g('add', '--', 'Foo.md');
    const { paths, mdChanges } = readStagedDiff(root);
    expect(paths).toContain('Foo.md');
    const foo = mdChanges.find((m) => m.path === 'Foo.md');
    expect(foo.frontmatterChanges.find((c) => c.field === 'stage')).toMatchObject({ before: 'seed', after: 'sprout' });
    expect(foo.frontmatterChanges.find((c) => c.field === 'forward_vector')).toBeTruthy();
    expect(foo.bodyChanged).toBe(true);
  });

  test('buildMessageFromStaged derives stage + vector + entry trailers', () => {
    writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\ntype: concept\nstage: sprout\npillars: [tools]\nforward_vector: "I will sprout."\n---\n# Foo\nbody\n');
    g('add', '--', 'Foo.md');
    const msg = buildMessageFromStaged(root, { kind: 'edit', scope: 'Foo', summary: 'grow to sprout', verify: 'verified' });
    expect(msg).toMatch(/^edit\(Foo\): grow to sprout/);
    expect(msg).toMatch(/Palace-Kind: edit/);
    expect(msg).toMatch(/Palace-Entry: Foo/);
    expect(msg).toMatch(/Palace-Stage: Foo: seed->sprout/);
    expect(msg).toMatch(/Palace-Vector: Foo: changed/);
    expect(msg).toMatch(/Palace-Verify: verified/);
    expect(msg).toMatch(/Palace-Author: claude/);
  });

  test('a newly-added entry gets a born stage', () => {
    writeFileSync(resolve(root, 'New Entry.md'), '---\ntitle: New Entry\ntype: concept\nstage: seed\npillars: [philosophy]\n---\n# New Entry\nbody\n');
    g('add', '--', 'New Entry.md');
    const msg = buildMessageFromStaged(root, { kind: 'deposit', scope: 'New Entry', summary: 'file it', verify: 'verified' });
    expect(msg).toMatch(/Palace-Entry: New Entry/);
    expect(msg).toMatch(/Palace-Stage: New Entry: born->seed/);
  });

  test('the derived message round-trips the validator + carries campaign', async () => {
    writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\nstage: growing\n---\nbody\n');
    g('add', '--', 'Foo.md');
    const msg = buildMessageFromStaged(root, { kind: 'edit', scope: 'Foo', summary: 'x', verify: 'verified', campaign: 'c-2026' });
    const { validateCommitMessage } = await import('../../src/lib/commit-spec.js');
    expect(validateCommitMessage(msg).valid).toBe(true);
    expect(msg).toMatch(/Palace-Campaign: c-2026/);
  });

  test('the CLI commits a structured message end-to-end (explicit path, never -A)', () => {
    writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\nstage: sprout\n---\nedited\n');
    // An UNRELATED dirty file that must NOT be swept (the N-writer lesson).
    writeFileSync(resolve(root, 'Other Session.md'), 'do not commit me');
    execFileSync('node', [CLI, '--kind', 'edit', '--scope', 'Foo', '--summary', 'grow', '--verify', 'verified', '--path', 'Foo.md'], {
      cwd: root, encoding: 'utf8', env: { ...process.env, PALACE_ROOT: root },
    });
    const msg = execFileSync('git', ['log', '-1', '--format=%B'], { cwd: root, encoding: 'utf8' });
    expect(msg).toMatch(/edit\(Foo\): grow/);
    // Committed Foo is seed, staged Foo is sprout -> the derived transition.
    expect(msg).toMatch(/Palace-Stage: Foo: seed->sprout/);
    const status = execFileSync('git', ['status', '--porcelain=v1'], { cwd: root, encoding: 'utf8' });
    expect(status).toMatch(/Other Session\.md/); // never swept
  });

  test('an invalid --verify is refused before anything is staged or committed', () => {
    writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\nstage: sprout\n---\npartly checked\n');
    const headBefore = g('rev-parse', 'HEAD').trim();
    const r = spawnSync('node', [CLI, '--kind', 'edit', '--summary', 'x', '--verify', 'partial', '--path', 'Foo.md'], {
      cwd: root, encoding: 'utf8', env: { ...process.env, PALACE_ROOT: root },
    });
    expect(r.status).toBe(2);
    expect(r.stderr).toMatch(/--verify must be one of verified, unverified, couldnt, not "partial"/);
    expect(g('rev-parse', 'HEAD').trim()).toBe(headBefore);
    expect(g('diff', '--cached', '--name-only').trim()).toBe('');
  });

  test('--dry-run prints the message without committing', () => {
    writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\nstage: sprout\n---\nx\n');
    g('add', '--', 'Foo.md');
    const headBefore = g('rev-parse', 'HEAD').trim();
    const out = execFileSync('node', [CLI, '--kind', 'edit', '--summary', 'x', '--verify', 'verified', '--path', 'Foo.md', '--dry-run'], {
      cwd: root, encoding: 'utf8', env: { ...process.env, PALACE_ROOT: root },
    });
    expect(out).toMatch(/edit: x/);
    expect(g('rev-parse', 'HEAD').trim()).toBe(headBefore);
  });

  test('--dry-run stages nothing: it builds the message in a throwaway index', () => {
    writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\nstage: sprout\n---\nx\n');
    const out = execFileSync('node', [CLI, '--kind', 'edit', '--summary', 'x', '--verify', 'verified', '--path', 'Foo.md', '--dry-run'], {
      cwd: root, encoding: 'utf8', env: { ...process.env, PALACE_ROOT: root },
    });
    expect(out).toMatch(/Palace-Stage: Foo: seed->sprout/);
    expect(g('diff', '--cached', '--name-only').trim()).toBe('');
  });

  describe('--ceremony: a ceremony that names its subject', () => {
    const env = () => ({ ...process.env, PALACE_ROOT: root });
    const run = (...args) => spawnSync('node', [CLI, ...args], { cwd: root, encoding: 'utf8', env: env() });
    const dry = (...args) => execFileSync('node', [CLI, ...args, '--dry-run'], { cwd: root, encoding: 'utf8', env: env() });

    test('writes "<Ceremony> — <summary>" with the ceremony\'s kind, and the validator reads it as spec', async () => {
      writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\nstage: seed\n---\nrules\n');
      const r = run('--ceremony', 'Schema Ceremony', '--summary', 'a field added — v9.1', '--verify', 'verified', '--path', 'Foo.md');
      expect(r.status).toBe(0);
      const msg = g('log', '-1', '--format=%B');
      expect(msg.split('\n')[0]).toBe('Schema Ceremony — a field added — v9.1');
      expect(msg).toMatch(/^Palace-Kind: schema$/m);
      const { validateCommitMessage } = await import('../../src/lib/commit-spec.js');
      expect(validateCommitMessage(msg).valid).toBe(true);
    });

    test('a page carrying trigger: names a ceremony, its " Ceremony" dropped', () => {
      writeFileSync(resolve(root, 'Walk Ceremony.md'), '---\ntitle: Walk Ceremony\ntype: practice\ntrigger: ["walk"]\n---\n# Walk\n');
      writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\nstage: seed\n---\nwalked\n');
      const out = dry('--ceremony', 'Walk', '--summary', 'Foo to Bar', '--verify', 'verified', '--path', 'Foo.md');
      expect(out.split('\n')[0]).toBe('Walk — Foo to Bar');
      expect(out).toMatch(/^Palace-Kind: ops$/m);
    });

    test('an unknown ceremony, a --scope beside it, or a --kind that disagrees is refused before staging', () => {
      writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\nstage: seed\n---\nx\n');
      const headBefore = g('rev-parse', 'HEAD').trim();
      for (const [args, said] of [
        [['--ceremony', 'Tea Ceremony'], /"Tea Ceremony" is not a ceremony this palace names/],
        [['--ceremony', 'Weave', '--scope', 'Foo'], /--ceremony takes no --scope/],
        [['--ceremony', 'Weave', '--kind', 'edit'], /--kind edit disagrees with --ceremony "Weave", whose kind is weave/],
      ]) {
        const r = run(...args, '--summary', 'x', '--verify', 'verified', '--path', 'Foo.md');
        expect(r.status).toBe(2);
        expect(r.stderr).toMatch(said);
      }
      expect(g('rev-parse', 'HEAD').trim()).toBe(headBefore);
      expect(g('diff', '--cached', '--name-only').trim()).toBe('');
    });

    test('a --kind no reader knows is refused, and a ceremony name there is pointed at --ceremony', () => {
      writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\nstage: seed\n---\nx\n');
      const r = run('--kind', 'Schema Ceremony', '--summary', 'x', '--verify', 'verified', '--path', 'Foo.md');
      expect(r.status).toBe(2);
      expect(r.stderr).toMatch(/pass --ceremony "Schema Ceremony" instead/);
    });

    test('an alias kind still commits under the spelling given (baton)', () => {
      writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\nstage: seed\n---\nbaton\n');
      const out = dry('--kind', 'baton', '--scope', 'Foo', '--summary', 'x', '--verify', 'verified', '--path', 'Foo.md');
      expect(out.split('\n')[0]).toBe('baton(Foo): x');
    });
  });

  test('clearStaleLocks keeps a fresh index.lock and removes an old one nobody holds', () => {
    const lock = resolve(root, '.git', 'index.lock');
    writeFileSync(lock, '');
    // Fresh: presumed live (another session may be mid-commit), so refused, not deleted.
    expect(() => clearStaleLocks(root, { attempts: 1, log: () => {}, gitProcesses: () => [] })).toThrow(/index\.lock is held/);
    expect(existsSync(lock)).toBe(true);
    // Old, and no git running in this checkout: the Cowork case. Removed, and logged.
    const t = new Date(Date.now() - 120_000);
    utimesSync(lock, t, t);
    const lines = [];
    const r = clearStaleLocks(root, { log: (s) => lines.push(s), gitProcesses: () => [] });
    expect(existsSync(lock)).toBe(false);
    expect(r.cleared.map((c) => c.rel)).toEqual(['.git/index.lock']);
    expect(lines.join('')).toMatch(/removed stale \.git\/index\.lock/);
  });

  test('the CLI refuses (exit 75) rather than delete a lock that looks live', () => {
    writeFileSync(resolve(root, 'Foo.md'), '---\ntitle: Foo\nstage: sprout\n---\nx\n');
    g('add', '--', 'Foo.md');
    const lock = resolve(root, '.git', 'index.lock');
    writeFileSync(lock, ''); // fresh: another session could be mid-commit
    const headBefore = g('rev-parse', 'HEAD').trim();
    const r = spawnSync('node', [CLI, '--kind', 'edit', '--summary', 'x', '--verify', 'verified', '--path', 'Foo.md'], {
      cwd: root, encoding: 'utf8', env: { ...process.env, PALACE_ROOT: root, PALACE_DOOR_INDEX_PATIENCE_MS: '3000' },
    });
    expect(r.status).toBe(75);
    expect(r.stderr).toMatch(/index\.lock is held/);
    expect(existsSync(lock)).toBe(true);
    expect(g('rev-parse', 'HEAD').trim()).toBe(headBefore);
  }, 20_000); // the CLI really waits: five looks, two seconds apart

  // Non-ASCII filenames — every `Foo — baton.md` / `Foo — Context.md` bundle
  // file. Git's default core.quotepath=true octal-escapes + double-quotes them in
  // --name-status output; the committers must still find + commit them. We force
  // quotepath=true here so the test reproduces the default-buggy environment
  // regardless of the developer's global git config.
  describe('non-ASCII (em-dash) filenames', () => {
    const EM = 'Foo — baton.md'; // U+2014 em-dash, the bundle-file convention
    beforeEach(() => {
      g('config', 'core.quotepath', 'true');
      writeFileSync(resolve(root, EM), '---\ntitle: "Foo — baton"\nborn: 2026-06-09\n---\n# Baton\ncarry the move\n');
      g('add', '--', EM);
    });

    test('readStagedDiff finds the staged em-dash path (not octal-escaped)', () => {
      const { paths } = readStagedDiff(root);
      expect(paths).toContain(EM);
    });

    test('commitSelected commits an em-dash file (regression: it was silently dropped)', async () => {
      const r = await commitSelected(root, {
        paths: [EM], kind: 'handoff', scope: 'Foo', summary: 'carry the move',
        verify: 'unverified', author: 'claude',
      });
      expect(r.ok).toBe(true);
      expect(r.committed).toContain(EM);
      expect(g('show', `HEAD:${EM}`)).toMatch(/carry the move/);
      expect(g('status', '--porcelain=v1').trim()).toBe('');
    });
  });

  // A moved entry. The committer used to read the "before" side at the NEW
  // path, find nothing there, and log the move as a birth (da73cb79 on main: a
  // false `Palace-Stage: Wavetable Scanner: born->sprout` plus false
  // Palace-Vector lines on a move). Each test starts with `Foo.md` and its
  // bundle folder moved into Projects/ by `git mv`, nothing else changed.
  describe('a renamed (moved) entry', () => {
    const GOTCHAS = 'Foo — gotchas.md';
    const derived = (msg) => msg.split('\n').filter((l) => /^Palace-(Stage|Vector):/.test(l));
    const cli = (...args) => spawnSync('node', [CLI, ...args], {
      cwd: root, encoding: 'utf8', env: { ...process.env, PALACE_ROOT: root },
    });
    const MOVE = ['--kind', 'edit', '--scope', 'Foo', '--summary', 'move into Projects/', '--verify', 'verified'];

    beforeEach(() => {
      mkdirSync(resolve(root, 'Foo'));
      writeFileSync(resolve(root, 'Foo', GOTCHAS), '---\ntitle: "Foo — gotchas"\nforward_vector: "I will warn."\n---\n# Gotchas\nmind the step\n');
      g('add', '-A');
      g('commit', '-q', '-m', 'edit(Foo): its gotchas\n\nPalace-Kind: edit\nPalace-Verify: verified');
      mkdirSync(resolve(root, 'Projects'));
      g('mv', 'Foo.md', 'Projects/Foo.md');
      g('mv', 'Foo', 'Projects/Foo');
    });

    test('a pure move derives no stage or vector line', () => {
      const { paths, mdChanges } = readStagedDiff(root);
      expect(paths.sort()).toEqual(['Projects/Foo.md', `Projects/Foo/${GOTCHAS}`].sort());
      expect(mdChanges).toHaveLength(2);
      for (const m of mdChanges) {
        expect(m.frontmatterChanges).toEqual([]);
        expect(m.bodyChanged).toBe(false);
        expect(m.wasAdded).toBe(false);
      }
      const msg = buildMessageFromStaged(root, { kind: 'edit', scope: 'Foo', summary: 'move into Projects/', verify: 'verified' });
      expect(msg).toMatch(/^Palace-Entry: Foo$/m);
      expect(msg).toMatch(/^Palace-Entry: Foo — gotchas$/m);
      expect(derived(msg)).toEqual([]);
    });

    test('a move with a real edit derives only the real change', () => {
      writeFileSync(resolve(root, 'Projects', 'Foo.md'), '---\ntitle: Foo\ntype: concept\nstage: sprout\npillars: [tools]\nforward_vector: "I will seed."\n---\n# Foo\nbody\n');
      g('add', '--', 'Projects/Foo.md');
      expect(g('diff', '--cached', '-M', '--name-status')).toMatch(/^R0\d\d\tFoo\.md\tProjects\/Foo\.md$/m); // still a rename, no longer 100%
      const msg = buildMessageFromStaged(root, { kind: 'edit', scope: 'Foo', summary: 'move and grow', verify: 'verified' });
      expect(derived(msg)).toEqual(['Palace-Stage: Foo: seed->sprout']);
    });

    test('a move is still read as a move with diff.renames switched off', () => {
      g('config', 'diff.renames', 'false');
      const msg = buildMessageFromStaged(root, { kind: 'edit', scope: 'Foo', summary: 'move into Projects/', verify: 'verified' });
      expect(derived(msg)).toEqual([]);
    });

    test('an entry that really is new, staged beside the move, is still born', () => {
      writeFileSync(resolve(root, 'New Entry.md'), '---\ntitle: New Entry\ntype: concept\nstage: seed\npillars: [philosophy]\n---\n# New Entry\nbody\n');
      g('add', '--', 'New Entry.md');
      const msg = buildMessageFromStaged(root, { kind: 'edit', scope: 'Foo', summary: 'move, and file a new one', verify: 'verified' });
      expect(derived(msg)).toEqual(['Palace-Stage: New Entry: born->seed']);
    });

    test('the CLI commits a move whole when both sides are named, files or folders (--only)', () => {
      // Another writer's staged work, which --only must leave out.
      writeFileSync(resolve(root, 'Other Session.md'), '---\ntitle: Other Session\nstage: seed\n---\nnot mine\n');
      g('add', '--', 'Other Session.md');
      // The old sides are gone from disk and index alike; `git add` on them
      // used to die with "pathspec did not match any files".
      const r = cli(...MOVE, '--only', '--path', 'Foo.md', '--path', 'Foo', '--path', 'Projects/Foo.md', '--path', 'Projects/Foo');
      expect(r.stderr).not.toMatch(/did not match any files|looks like a staged move/);
      expect(r.status).toBe(0);
      expect(r.stdout).toMatch(/palace-commit: committed [0-9a-f]{7,40}/);
      expect(derived(g('log', '-1', '--format=%B'))).toEqual([]);
      expect(g('show', '-M', '--name-status', '--format=', 'HEAD')).toMatch(/^R100\tFoo\.md\tProjects\/Foo\.md$/m);
      expect(g('show', '--stat', '--format=', 'HEAD')).not.toMatch(/Other Session/);
      expect(g('status', '--porcelain=v1').trim()).toBe('A  "Other Session.md"');
    });

    test('isStagedDeletion is true only for a path already deleted in the index', () => {
      expect(isStagedDeletion(root, 'Foo.md')).toBe(true);          // old file
      expect(isStagedDeletion(root, 'Foo')).toBe(true);             // old folder
      expect(isStagedDeletion(root, 'Projects/Foo.md')).toBe(false); // the new side exists
      expect(isStagedDeletion(root, 'Nope.md')).toBe(false);         // never existed
      // A deletion that is NOT staged yet still goes through `git add`.
      rmSync(resolve(root, 'Projects', 'Foo.md'));
      expect(isStagedDeletion(root, 'Projects/Foo.md')).toBe(false);
    });

    test('a named path that matches nothing still fails loudly', () => {
      const r = cli(...MOVE, '--path', 'Nope.md', '--dry-run');
      expect(r.status).not.toBe(0);
      expect(r.stderr).toMatch(/did not match any files/);
    });

    test('--only with one side of the move named says so, and does not block', () => {
      expect(halfNamedMoves(root, ['Projects/Foo.md'])).toEqual([{ from: 'Foo.md', to: 'Projects/Foo.md', missing: 'Foo.md' }]);
      expect(halfNamedMoves(root, ['Foo.md'])).toEqual([{ from: 'Foo.md', to: 'Projects/Foo.md', missing: 'Projects/Foo.md' }]);
      expect(halfNamedMoves(root, ['Foo.md', 'Projects/Foo.md'])).toEqual([]);

      const r = cli(...MOVE, '--only', '--path', 'Projects/Foo.md', '--dry-run');
      expect(r.status).toBe(0);
      expect(r.stderr).toMatch(/"Projects\/Foo\.md" looks like a staged move from "Foo\.md"/);
      expect(r.stderr).toMatch(/Add --path "Foo\.md"/);
      // Half a move really is a bare add, so the message it would write says so.
      expect(derived(r.stdout)).toContain('Palace-Stage: Foo: born->seed');
    });

    // The server twin: commitSelected, the committer behind the LOG deck and
    // Cowork. Same move, same expectations. It always scopes the diff and the
    // commit to the selected paths, so it behaves as the CLI does under --only.
    describe('through commitSelected (the LOG deck and Cowork)', () => {
      const OPTS = { kind: 'edit', scope: 'Foo', summary: 'move into Projects/', verify: 'verified', author: 'claude' };
      const OLD = ['Foo.md', `Foo/${GOTCHAS}`];
      const NEW = ['Projects/Foo.md', `Projects/Foo/${GOTCHAS}`];
      const headShows = () => g('-c', 'core.quotepath=false', 'show', '-M', '--name-status', '--format=', 'HEAD');

      test('a pure move with both sides selected commits whole and derives no stage or vector line', async () => {
        // Another writer's staged work, which the selection must leave out.
        writeFileSync(resolve(root, 'Other Session.md'), '---\ntitle: Other Session\nstage: seed\n---\nnot mine\n');
        g('add', '--', 'Other Session.md');
        // The old sides are gone from disk and index alike; `git add` on them
        // used to end the commit with "pathspec did not match any files".
        const r = await commitSelected(root, { ...OPTS, paths: [...OLD, ...NEW] });
        expect(r.error).toBeUndefined();
        expect(r.ok).toBe(true);
        expect(r.notes).toBeUndefined();
        expect([...r.committed].sort()).toEqual([...NEW].sort());
        expect(r.message).toMatch(/^Palace-Entry: Foo$/m);
        expect(derived(r.message)).toEqual([]);
        expect(derived(g('log', '-1', '--format=%B'))).toEqual([]);
        expect(headShows()).toMatch(/^R100\tFoo\.md\tProjects\/Foo\.md$/m);
        expect(headShows()).toMatch(/^R100\tFoo\/Foo — gotchas\.md\tProjects\/Foo\/Foo — gotchas\.md$/m);
        expect(headShows()).not.toMatch(/Other Session/);
        expect(g('status', '--porcelain=v1').trim()).toBe('A  "Other Session.md"');
      });

      test('the two sides can be folders', async () => {
        const r = await commitSelected(root, { ...OPTS, paths: ['Foo.md', 'Foo', 'Projects/Foo.md', 'Projects/Foo'] });
        expect(r.ok).toBe(true);
        expect([...r.committed].sort()).toEqual([...NEW].sort());
        expect(derived(r.message)).toEqual([]);
        expect(g('status', '--porcelain=v1').trim()).toBe('');
      });

      test('a move with a real edit derives only the real change', async () => {
        // Edited after the `git mv` and not staged: the committer stages it.
        writeFileSync(resolve(root, 'Projects', 'Foo.md'), '---\ntitle: Foo\ntype: concept\nstage: sprout\npillars: [tools]\nforward_vector: "I will seed."\n---\n# Foo\nbody\n');
        const r = await commitSelected(root, { ...OPTS, summary: 'move and grow', paths: [...OLD, ...NEW] });
        expect(r.ok).toBe(true);
        expect(derived(r.message)).toEqual(['Palace-Stage: Foo: seed->sprout']);
        expect(headShows()).toMatch(/^R0\d\d\tFoo\.md\tProjects\/Foo\.md$/m); // still a rename, no longer 100%
      });

      test('a move is still read as a move with diff.renames switched off', async () => {
        g('config', 'diff.renames', 'false');
        const r = await commitSelected(root, { ...OPTS, paths: [...OLD, ...NEW] });
        expect(r.ok).toBe(true);
        expect(derived(r.message)).toEqual([]);
      });

      test('a move made outside git (a deletion and an untracked folder) is read as a move', async () => {
        // Finder or Obsidian moved the files: nothing is staged, and the new
        // folder is one untracked row, `?? Projects/`, as the deck lists it.
        g('reset', '-q');
        expect(g('status', '--porcelain=v1')).toMatch(/^\?\? Projects\/$/m);
        const r = await commitSelected(root, { ...OPTS, paths: ['Foo.md', 'Foo', 'Projects/'] });
        expect(r.error).toBeUndefined(); // a folder row used to end in "nothing staged for the selected paths"
        expect(r.ok).toBe(true);
        expect([...r.committed].sort()).toEqual([...NEW].sort());
        expect(derived(r.message)).toEqual([]);
        expect(headShows()).toMatch(/^R100\tFoo\.md\tProjects\/Foo\.md$/m);
        expect(g('status', '--porcelain=v1').trim()).toBe('');
      });

      test('an entry that really is new, selected beside the move, is still born', async () => {
        writeFileSync(resolve(root, 'New Entry.md'), '---\ntitle: New Entry\ntype: concept\nstage: seed\npillars: [philosophy]\n---\n# New Entry\nbody\n');
        const r = await commitSelected(root, { ...OPTS, summary: 'move, and file a new one', paths: [...OLD, ...NEW, 'New Entry.md'] });
        expect(r.ok).toBe(true);
        expect(derived(r.message)).toEqual(['Palace-Stage: New Entry: born->seed']);
      });

      test('the new side alone is half a move: committed as the add it is, and the result says so', async () => {
        const r = await commitSelected(root, { ...OPTS, paths: ['Projects/Foo.md'] });
        expect(r.ok).toBe(true);
        expect(r.committed).toEqual(['Projects/Foo.md']);
        // The message agrees with the commit: a bare add is a birth.
        expect(headShows().trim()).toBe('A\tProjects/Foo.md');
        expect(derived(r.message)).toContain('Palace-Stage: Foo: born->seed');
        expect(r.notes).toHaveLength(1);
        expect(r.notes[0]).toMatch(/"Projects\/Foo\.md" looks like a staged move from "Foo\.md", but "Foo\.md" was not selected/);
        expect(r.notes[0]).toMatch(/a bare add/);
        // The selection is never widened: the other half is still staged.
        expect(g('status', '--porcelain=v1')).toMatch(/^D {2}Foo\.md$/m);
      });

      test('the old side alone is a bare delete, and the result says so', async () => {
        const r = await commitSelected(root, { ...OPTS, summary: 'drop the old path', paths: ['Foo.md'] });
        expect(r.ok).toBe(true);
        expect(headShows().trim()).toBe('D\tFoo.md');
        expect(r.notes).toHaveLength(1);
        expect(r.notes[0]).toMatch(/but "Projects\/Foo\.md" was not selected/);
        expect(r.notes[0]).toMatch(/a bare delete/);
        expect(g('status', '--porcelain=v1')).toMatch(/^A {2}Projects\/Foo\.md$/m);
      });

      test('a selected path that matches nothing still fails loudly', async () => {
        const headBefore = g('rev-parse', 'HEAD').trim();
        const r = await commitSelected(root, { ...OPTS, paths: ['Nope.md', ...NEW] });
        expect(r.ok).toBe(false);
        expect(r.error).toMatch(/git add failed for "Nope\.md".*did not match any files/);
        expect(g('rev-parse', 'HEAD').trim()).toBe(headBefore);
      });

      // The selection is paths, not patterns. Git would read the `?` and the
      // `[1]` as a glob: `a[1].md` also took `a1.md` into the commit, and the old
      // side of a moved `Why?.md`, gone from disk, matched its neighbour instead.
      test('a name with glob characters selects only itself, moved or not', async () => {
        g('reset', '-q', '--hard'); // this one starts from its own files
        const fm = (t, stage) => `---\ntitle: "${t}"\nstage: ${stage}\n---\n# ${t}\nbody\n`;
        const NAMES = ['Why?.md', 'Whyx.md', 'a[1].md', 'a1.md'];
        for (const n of NAMES) writeFileSync(resolve(root, n), fm(n, 'seed'));
        g('add', '-A');
        g('commit', '-q', '-m', 'edit(Foo): four neighbours\n\nPalace-Kind: edit\nPalace-Verify: verified');
        for (const n of NAMES) writeFileSync(resolve(root, n), fm(n, 'sprout'));

        const edit = await commitSelected(root, { ...OPTS, summary: 'grow one', paths: ['a[1].md'] });
        expect(edit.committed).toEqual(['a[1].md']);
        expect(headShows().trim()).toBe('M\ta[1].md');
        expect(g('status', '--porcelain=v1')).toMatch(/^ M a1\.md$/m); // the neighbour is not swept

        mkdirSync(resolve(root, 'Projects'), { recursive: true });
        g('mv', 'Why?.md', 'Projects/Why?.md');
        const move = await commitSelected(root, { ...OPTS, summary: 'move and grow', paths: ['Why?.md', 'Projects/Why?.md'] });
        expect(move.error).toBeUndefined();
        expect(move.committed).toEqual(['Projects/Why?.md']);
        expect(derived(move.message)).toEqual(['Palace-Stage: Why?: seed->sprout']);
        expect(headShows().trim()).toMatch(/^R\d\d\d\tWhy\?\.md\tProjects\/Why\?\.md$/);
        expect(g('status', '--porcelain=v1')).toMatch(/^ M Whyx\.md$/m);
      });

      test('its isStagedDeletion agrees with the CLI one', async () => {
        for (const p of ['Foo.md', 'Foo', 'Projects/Foo.md', 'Nope.md']) {
          expect(await isStagedDeletionServer(root, p)).toBe(isStagedDeletion(root, p));
        }
        expect(await isStagedDeletionServer(root, 'Foo.md')).toBe(true);
        expect(await isStagedDeletionServer(root, 'Projects/Foo.md')).toBe(false);
      });
    });
  });
});
