// baton-executor.test.mjs — the regression test that was missing.
//
// `_ops/closing-well/README.md` claimed this executor was "unit-tested end to end."
// It was not: no test file referenced it, and the only verification was a manual run
// at build time (commit 0c7dd4e). That gap is why the hardcoded On-pickup checklist
// could go stale for seven weeks without anything noticing — the ceremony's
// three-state lifecycle (claim → close, 2026-07-07) landed in the spec and never
// reached the script's private copy.
//
// So this tests the seam that actually broke: does a written baton carry the ONE
// canonical checklist, verbatim, with the load-bearing close beats intact?
//
// Run:  node --test _ops/closing-well/tests/*.test.mjs

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, cpSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PALACE = resolve(HERE, '../../..');
const EXECUTOR = join(PALACE, '_ops/closing-well/baton-executor.mjs');
const FRAGMENT = join(PALACE, '_ops/Baton Ceremony/Baton Ceremony — on-pickup.md');
const HEADING = '## On pickup';

/** The checklist as it lives in its single home. */
function canonicalFooter() {
  const raw = readFileSync(FRAGMENT, 'utf8');
  return raw.slice(raw.indexOf(HEADING)).trim();
}

/**
 * Write a baton into a throwaway tree and return its text.
 *
 * `--tree` redirects where the baton + parent pointer land; `--owner` stays the real
 * palace because that is where the shared machinery lives (board-post.mjs and the
 * validator). Without `--post` the announce is only validated, never appended — this
 * test never touches the live board.
 */
function writeBatonInScratch({ entry = 'Test Entry', move = 'a one-sentence move' } = {}) {
  const tree = mkdtempSync(join(tmpdir(), 'baton-exec-'));
  try {
    writeFileSync(join(tree, `${entry}.md`), `# ${entry}\n\nA stand-in entry.\n`);
    const bodyFile = join(tree, 'body.md');
    writeFileSync(bodyFile, '## Move\nA one-sentence move.\n\n## Next move\nDo the thing.\n');

    execFileSync('node', [
      EXECUTOR,
      '--entry', entry,
      '--move', move,
      '--body-file', bodyFile,
      '--session-id', 'test',
      '--owner', PALACE,
      '--tree', tree,
      '--write',
    ], { encoding: 'utf8', stdio: 'pipe' });

    return readFileSync(join(tree, entry, `${entry} — baton.md`), 'utf8');
  } finally {
    rmSync(tree, { recursive: true, force: true });
  }
}

test('a written baton carries the canonical checklist verbatim', () => {
  const baton = writeBatonInScratch();
  const canon = canonicalFooter();
  assert.ok(baton.includes(canon),
    'the baton footer does not match _ops/Baton Ceremony/Baton Ceremony — on-pickup.md.\n'
    + 'If the checklist changed, edit the fragment — never a second copy in the executor.');
});

test('the checklist carries both lifecycle beats, not just the catch', () => {
  const baton = writeBatonInScratch();
  // The 2026-07-07 lifecycle split is the thing that went missing. Each of these is
  // a beat whose absence silently retires a card or strands work.
  for (const beat of [
    'pickup-handoff.mjs',   // claim, with lifecycle: claim — not a hand-posted pickup
    'close-handoff.mjs',    // the ONLY thing that retires a card
    '--commit',             // a close cites its evidence
    '--partial',            // complete, or re-baton the rest
    'CLAIMED',              // the card stays visible in between
  ]) {
    assert.ok(baton.includes(beat), `the written checklist is missing "${beat}"`);
  }
});

test('the pre-lifecycle instructions are gone', () => {
  const baton = writeBatonInScratch();
  const footer = baton.slice(baton.indexOf(HEADING));
  // The stale text told the catcher to mark-caught-and-delete at PICKUP. Following it
  // erases the work on a fumble and leaves the board card wrong.
  assert.ok(!/Mark it caught: remove the "Active Baton" section/.test(footer),
    'the executor is emitting the pre-2026-07-07 delete-at-pickup checklist again');
});

test('a missing fragment fails loud, never writes a footerless baton', () => {
  const tree = mkdtempSync(join(tmpdir(), 'baton-exec-nofrag-'));
  try {
    // The executor resolves the checklist relative to ITS OWN location, so a copy of
    // the script with no sibling fragment is the missing-fragment case. It must refuse
    // before writing anything — a baton without the checklist is unfinished, because
    // the catcher reads the baton and never the ceremony.
    // The resolver it imports rides along, so the refusal below is the missing
    // fragment's and not a missing import's.
    mkdirSync(join(tree, '_ops/closing-well'), { recursive: true });
    mkdirSync(join(tree, '_ops/models'), { recursive: true });
    cpSync(EXECUTOR, join(tree, '_ops/closing-well/baton-executor.mjs'));
    cpSync(join(PALACE, '_ops/models/latest-opus.mjs'), join(tree, '_ops/models/latest-opus.mjs'));
    writeFileSync(join(tree, 'Test Entry.md'), '# Test Entry\n');
    const bodyFile = join(tree, 'body.md');
    writeFileSync(bodyFile, '## Move\nx\n');

    assert.throws(() => execFileSync('node', [
      join(tree, '_ops/closing-well/baton-executor.mjs'),
      '--entry', 'Test Entry', '--move', 'm', '--body-file', bodyFile,
      '--session-id', 'test', '--owner', PALACE, '--tree', tree, '--write',
    ], { encoding: 'utf8', stdio: 'pipe' }),
    /canonical On-pickup checklist is missing/,
    'the executor ran with no canonical checklist available — it must refuse instead');
  } finally {
    rmSync(tree, { recursive: true, force: true });
  }
});

// ── Qualified batons (Baton Ceremony tuning items 9 and 10; SCHEMA — Reference §8) ──
// A baton aimed at one part of a bundle takes a qualifier in its name and a second
// link, `targets`, to the file it is about; a second baton on an entry that already
// has one is pointed at inside the existing "## Active Baton" section.

function runExecutor(tree, extra, { entry = 'Test Entry', move = 'a one-sentence move' } = {}) {
  const bodyFile = join(tree, 'body.md');
  writeFileSync(bodyFile, '## Move\nA one-sentence move.\n');
  return execFileSync('node', [
    EXECUTOR, '--entry', entry, '--move', move, '--body-file', bodyFile,
    '--session-id', 'test', '--owner', PALACE, '--tree', tree, ...extra,
  ], { encoding: 'utf8', stdio: 'pipe' });
}

test('a qualifier names the file, and --targets writes the second link', () => {
  const tree = mkdtempSync(join(tmpdir(), 'baton-exec-qual-'));
  try {
    writeFileSync(join(tree, 'Test Entry.md'), '# Test Entry\n\nA stand-in entry.\n');
    runExecutor(tree, ['--qualifier', 'marimba-top', '--targets', 'Projects/Test Entry/instruments/marimba.md', '--write']);
    const baton = readFileSync(join(tree, 'Test Entry', 'Test Entry — baton — marimba-top.md'), 'utf8');
    assert.match(baton, /^title: "Test Entry — baton — marimba-top"$/m);
    assert.match(baton, /- target: "\[\[Test Entry\]\]"\n {4}type: connects-to\n {4}label: "baton-for"/);
    assert.match(baton, /- target: "\[\[marimba\]\]"\n {4}type: connects-to\n {4}label: "targets"/);
    assert.ok(baton.includes(canonicalFooter()), 'a qualified baton carries the checklist too');
    assert.match(readFileSync(join(tree, 'Test Entry.md'), 'utf8'), /## Active Baton\n\n\[\[Test Entry — baton — marimba-top\]\] — drafted /);
  } finally {
    rmSync(tree, { recursive: true, force: true });
  }
});

test('a second baton is pointed at inside the section the first one opened', () => {
  const tree = mkdtempSync(join(tmpdir(), 'baton-exec-second-'));
  try {
    writeFileSync(join(tree, 'Test Entry.md'), '# Test Entry\n\n## Active Baton\n\n[[Test Entry — baton]] — drafted 2026-10-01\n\n## Notes\n\nKept.\n');
    const out = runExecutor(tree, ['--qualifier', 'hardening', '--targets', '[[Test Entry — tuning]]', '--write']);
    assert.match(out, /pointed at under "## Active Baton"/);
    const entry = readFileSync(join(tree, 'Test Entry.md'), 'utf8');
    assert.match(entry, /## Active Baton\n\n\[\[Test Entry — baton\]\] — drafted 2026-10-01\n\[\[Test Entry — baton — hardening\]\] — drafted \d{4}-\d{2}-\d{2}\n\n## Notes\n\nKept\.\n$/);
    assert.equal((entry.match(/## Active Baton/g) || []).length, 1);
    // A re-run (say --write, then --post) points at it once, not twice.
    runExecutor(tree, ['--qualifier', 'hardening', '--targets', '[[Test Entry — tuning]]', '--write']);
    assert.equal((readFileSync(join(tree, 'Test Entry.md'), 'utf8').match(/baton — hardening\]\]/g) || []).length, 1);
    assert.match(readFileSync(join(tree, 'Test Entry', 'Test Entry — baton — hardening.md'), 'utf8'), /- target: "\[\[Test Entry — tuning\]\]"\n {4}type: connects-to\n {4}label: "targets"/);
  } finally {
    rmSync(tree, { recursive: true, force: true });
  }
});

test('a targets link needs a qualifier, and the qualifier must fit a filename', () => {
  const tree = mkdtempSync(join(tmpdir(), 'baton-exec-refuse-'));
  try {
    writeFileSync(join(tree, 'Test Entry.md'), '# Test Entry\n');
    assert.throws(() => runExecutor(tree, ['--targets', 'x.md', '--write']), /needs a --qualifier/);
    assert.throws(() => runExecutor(tree, ['--qualifier', 'a/b', '--write']), /can't be part of a filename/);
  } finally {
    rmSync(tree, { recursive: true, force: true });
  }
});

test('the preview of a qualified baton names its own id and path', () => {
  const tree = mkdtempSync(join(tmpdir(), 'baton-exec-preview-'));
  try {
    writeFileSync(join(tree, 'Test Entry.md'), '# Test Entry\n');
    const out = runExecutor(tree, ['--qualifier', 'marimba-top', '--ts', '2026-10-15T12:00:00Z']);
    assert.match(out, /announce {4}: VALID \(id test-entry-marimba-top-handoff-2026-10-15/);
    assert.match(out, /Test Entry — baton — marimba-top\.md/);
  } finally {
    rmSync(tree, { recursive: true, force: true });
  }
});

test('a baton on main announces with no worktree coordinate; off main it needs one', () => {
  const tree = mkdtempSync(join(tmpdir(), 'baton-exec-main-'));
  const board = join(tree, 'board.jsonl');
  try {
    writeFileSync(join(tree, 'Test Entry.md'), '# Test Entry\n');
    writeFileSync(board, '');
    const git = (...a) => execFileSync('git', a, { cwd: tree, stdio: 'ignore' });
    git('init', '-q', '-b', 'main'); git('config', 'user.email', 't@t'); git('config', 'user.name', 't');
    git('add', '-A'); git('commit', '-q', '-m', 'init');
    const out = runExecutor(tree, ['--board', board, '--post']);
    assert.match(out, /POSTED to/);
    const posted = JSON.parse(readFileSync(board, 'utf8').trim().split('\n').pop());
    assert.equal(posted.payload.kind, 'handoff_ready');
    assert.equal(posted.payload.worktree, undefined);
    git('checkout', '-q', '-b', 'feature/x');
    assert.throws(() => runExecutor(tree, ['--board', board, '--post', '--qualifier', 'other']), /needs --wt-branch and --wt-dir/);
  } finally {
    rmSync(tree, { recursive: true, force: true });
  }
});

test('the printed commit carries the whole move as its summary, never cut mid-word', () => {
  const tree = mkdtempSync(join(tmpdir(), 'baton-exec-summary-'));
  try {
    const entry = 'Test Entry';
    writeFileSync(join(tree, `${entry}.md`), `# ${entry}\n\nA stand-in entry.\n`);
    const bodyFile = join(tree, 'body.md');
    writeFileSync(bodyFile, '## Move\nA move.\n\n## Next move\nDo the thing.\n');
    const move = 'Decide with Loudon how a ledger whose items are edited in place should merge when a branch lands, then build the guard he chooses.';
    const out = execFileSync('node', [
      EXECUTOR, '--entry', entry, '--move', move, '--body-file', bodyFile,
      '--session-id', 'test', '--owner', PALACE, '--tree', tree,
    ], { encoding: 'utf8', stdio: 'pipe' });
    const want = move.replace(/\.$/, '');
    assert.ok(out.includes(`--summary '${want}'`), `the preview's commit summary is not the whole move:\n${out}`);
  } finally {
    rmSync(tree, { recursive: true, force: true });
  }
});

